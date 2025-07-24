"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { uploadMediaAction } from "@/actions/mediaActions";
import { useTRPC } from "@/trpc/client/client";
import { AppRouter } from "@/trpc/server";
import { inferRouterOutputs } from "@trpc/server";
import { useState } from "react";

type GroupQueryOutput =
  inferRouterOutputs<AppRouter>["groups"]["getNestedGroups"];

export function useUploadFile() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const [validationError, setValidationError] = useState<string | null>(null);

  const maxFileSizeKB = parseInt(
    process.env.NEXT_PUBLIC_MAX_FILE_SIZE_KB || "300"
  );
  const maxFileSizeBytes = maxFileSizeKB * 1024;

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSizeBytes) {
      return `File size exceeds the ${maxFileSizeKB}KB limit. Your file is ${Math.round(
        file.size / 1024
      )}KB.`;
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: uploadMediaAction,
    onMutate: async (variables) => {
      const file = variables.get("file") as File;

      // Client-side validation
      const validationErr = validateFile(file);
      if (validationErr) {
        setValidationError(validationErr);
        throw new Error(validationErr);
      }

      setValidationError(null);
      const loadingToast = toast.loading(`Uploading file "${file.name}"...`);

      await queryClient.cancelQueries({ queryKey: groupsQueryKey });
      const previousGroups =
        queryClient.getQueryData<GroupQueryOutput>(groupsQueryKey);

      return { previousGroups, loadingToast };
    },
    onSuccess: (data, variables, context) => {
      if (data && "error" in data && data.error) {
        toast.error(data.error, { id: context?.loadingToast });
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        return;
      }
      const file = variables.get("file") as File;
      toast.success(`File "${file.name}" uploaded successfully.`, {
        id: context?.loadingToast,
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryKey, context.previousGroups);
      }
      toast.error("Failed to upload file.", {
        id: context?.loadingToast,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupsQueryKey });
    },
  });

  const uploadFile = async (
    file: File,
    group: NestedGroup,
    label?: string,
    description?: string
  ) => {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("groupId", String(group.id));
    formData.set("label", label || file.name);
    formData.set("description", description || "");

    return mutation.mutateAsync(formData);
  };

  const reset = () => {
    setValidationError(null);
    mutation.reset();
  };

  return {
    uploadFile,
    uploading: mutation.isPending,
    error: mutation.error?.message || validationError,
    reset,
    validateFile,
    maxFileSizeKB,
  };
}
