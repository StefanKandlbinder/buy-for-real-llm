"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadMediaAction } from "@/actions/mediaActions";
import { useTRPCClient } from "@/trpc/client/client";
import { useTRPC } from "@/trpc/client/client";
import { AppRouter } from "@/trpc/server";
import { inferRouterOutputs } from "@trpc/server";

type GroupQueryOutput =
  inferRouterOutputs<AppRouter>["groups"]["getNestedGroups"];

export function useMedia() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();

  const createMutation = useMutation({
    mutationFn: uploadMediaAction,
    onMutate: async (variables) => {
      const file = variables.get("file") as File;
      const groupId = Number(variables.get("groupId"));
      const label = variables.get("label") as string;
      const description = variables.get("description") as string;

      const loadingToast = toast.loading(`Uploading file "${file.name}"...`);

      await queryClient.cancelQueries({ queryKey: groupsQueryKey });
      const previousGroups =
        queryClient.getQueryData<GroupQueryOutput>(groupsQueryKey);

      // Optimistic update: Add a temporary media item with loading state
      if (previousGroups) {
        const optimisticMedia = {
          id: `temp-${Date.now()}`, // Temporary ID
          url: URL.createObjectURL(file), // Local blob URL for preview
          label: label || file.name,
          description: description || "",
        };

        const updatedGroups = previousGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              media: [...(group.media || []), optimisticMedia],
            };
          }
          return group;
        });

        queryClient.setQueryData(groupsQueryKey, updatedGroups);
      }

      return { previousGroups, loadingToast, tempId: `temp-${Date.now()}` };
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
      const groupId = Number(variables.get("groupId"));

      // Replace the optimistic update with the real data
      if (data && !("error" in data)) {
        const currentGroups =
          queryClient.getQueryData<GroupQueryOutput>(groupsQueryKey);
        if (currentGroups) {
          const updatedGroups = currentGroups.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                media:
                  group.media?.map((media) =>
                    media.id === context?.tempId
                      ? {
                          id: data.id,
                          label: data.label || "",
                          url: data.url,
                          description: data.description || "",
                        }
                      : media
                  ) || [],
              };
            }
            return group;
          });
          queryClient.setQueryData(groupsQueryKey, updatedGroups);
        }
      }

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

  const updateMutation = useMutation({
    mutationFn: async (input: {
      id: string;
      label?: string;
      description?: string;
      url?: string;
    }) => {
      return await trpcClient.media.updateImage.mutate(input);
    },
    onMutate: async (variables) => {
      const loadingToast = toast.loading("Updating media...");

      await queryClient.cancelQueries({ queryKey: groupsQueryKey });
      const previousGroups =
        queryClient.getQueryData<GroupQueryOutput>(groupsQueryKey);

      // Optimistic update: immediately apply the changes
      if (previousGroups) {
        const updatedGroups = previousGroups.map((group) => ({
          ...group,
          media:
            group.media?.map((media) =>
              media.id === variables.id
                ? {
                    ...media,
                    ...variables,
                    updatedAt: new Date(),
                  }
                : media
            ) || [],
        }));

        queryClient.setQueryData(groupsQueryKey, updatedGroups);
      }

      return { previousGroups, loadingToast };
    },
    onSuccess: (data, variables, context) => {
      toast.success("Media updated successfully.", {
        id: context?.loadingToast,
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryKey, context.previousGroups);
      }
      toast.error("Failed to update media.", {
        id: context?.loadingToast,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupsQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (input: { id: string }) => {
      return await trpcClient.media.deleteImage.mutate(input);
    },
    onMutate: async (variables) => {
      const loadingToast = toast.loading("Deleting media...");

      await queryClient.cancelQueries({ queryKey: groupsQueryKey });
      const previousGroups =
        queryClient.getQueryData<GroupQueryOutput>(groupsQueryKey);

      // Optimistic update: immediately remove the media item
      if (previousGroups) {
        const updatedGroups = previousGroups.map((group) => ({
          ...group,
          media:
            group.media?.filter((media) => media.id !== variables.id) || [],
        }));

        queryClient.setQueryData(groupsQueryKey, updatedGroups);
      }

      return { previousGroups, loadingToast };
    },
    onSuccess: (data, variables, context) => {
      toast.success("Media deleted successfully.", {
        id: context?.loadingToast,
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsQueryKey, context.previousGroups);
      }
      toast.error("Failed to delete media.", {
        id: context?.loadingToast,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupsQueryKey });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
