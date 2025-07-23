import { useState, useCallback } from "react";
import { toast } from "sonner";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { useTRPC } from "@/trpc/client/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type TUseUploadFileReturn = {
  uploadFile: (file: File, group: NestedGroup) => Promise<string>;
  uploading: boolean;
  error: string | null;
  reset: () => void;
};

type TUseUploadFileOptions = {
  endpoint?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
};

export function useUploadFile(
  options: TUseUploadFileOptions = {}
): TUseUploadFileReturn {
  const { endpoint = "/api/pinata", onSuccess, onError } = options;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mediaQueryKey = trpc.media.getAllMedia.queryKey();

  const createMediaMutation = useMutation(
    trpc.media.createImage.mutationOptions({
      onMutate: async (newMedia) => {
        const loadingToast = toast.loading(
          `Creating file "${newMedia.label}"...`
        );

        await queryClient.cancelQueries({ queryKey: mediaQueryKey });
        const previousMedia = queryClient.getQueryData(mediaQueryKey);
        queryClient.setQueryData(mediaQueryKey, (oldData) => {
          const optimisticNewMedia = {
            label: newMedia.label ?? null,
            description: newMedia.description ?? null,
            url: newMedia.url,
            groupId: newMedia.groupId,
            id: -1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...(oldData ?? []), optimisticNewMedia];
        });
        return { previousMedia, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(
          `File "${variables.label}" has been created successfully.`,
          {
            id: context?.loadingToast,
          }
        );
      },
      onError: (err, newMedia, context) => {
        if (context?.previousMedia) {
          queryClient.setQueryData(mediaQueryKey, context.previousMedia);
        }
        toast.error("Failed to create file. Please try again.", {
          id: context?.loadingToast,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: mediaQueryKey });
      },
    })
  );

  const uploadFile = async (
    file: File,
    group: NestedGroup
  ): Promise<string> => {
    if (!file) {
      const errorMsg = "No file provided";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setUploading(true);
      setError(null);

      const data = new FormData();
      data.set("file", file);

      const uploadRequest = await fetch(endpoint, {
        method: "POST",
        body: data,
      });

      if (!uploadRequest.ok) {
        toast.error(`Upload failed: ${uploadRequest.statusText}`, {
          id: file.name,
        });
        throw new Error(`Upload failed: ${uploadRequest.statusText}`);
      }

      const signedUrl = await uploadRequest.json();

      toast.success(
        `File "${file.name}" has been uploaded successfully to group "${group.name}".`,
        {
          id: file.name,
        }
      );

      createMediaMutation.mutate({
        label: undefined,
        description: undefined,
        url: signedUrl,
        groupId: group.id,
      });

      onSuccess?.(signedUrl);
      return signedUrl;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to upload file";
      setError(errorMsg);
      onError?.(e instanceof Error ? e : new Error(errorMsg));
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setUploading(false);
  }, []);

  return {
    uploadFile,
    uploading,
    error,
    reset,
  };
}
