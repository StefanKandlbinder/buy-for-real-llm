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

  async function invalidateGroupsCluster() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.groups.getNestedGroups.queryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.groups.getGroupsWithProducts.queryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.groups.getGroupsWithAdvertisements.queryKey(),
      }),
    ]);
  }

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
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMedia = {
          id: optimisticId, // Temporary ID
          url: URL.createObjectURL(file), // Local blob URL for preview
          label: label || file.name,
          description: description || "",
          mediaType: file.type.startsWith("video/") ? "video" : "image",
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
        return { previousGroups, loadingToast, tempId: optimisticId, groupId };
      }

      return {
        previousGroups,
        loadingToast,
        tempId: `temp-${Date.now()}`,
        groupId,
      };
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
      const groupId = context?.groupId as number;

      // Replace the optimistic update with the real data (only in affected group)
      if (data && !("error" in data)) {
        queryClient.setQueryData<GroupQueryOutput>(
          groupsQueryKey,
          (current) => {
            if (!current) return current;
            return current.map((group) => {
              if (group.id !== groupId) return group;
              return {
                ...group,
                media:
                  group.media?.map((m) =>
                    m.id === context?.tempId
                      ? {
                          id: data.id,
                          label: data.label || "",
                          url: data.url,
                          description: data.description || "",
                          mediaType:
                            data.mediaType ||
                            (file.type.startsWith("video/")
                              ? "video"
                              : "image"),
                        }
                      : m
                  ) || [],
              };
            });
          }
        );
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
    onSettled: async () => {
      await invalidateGroupsCluster();
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
    onSettled: async () => {
      await invalidateGroupsCluster();
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
    onSettled: async () => {
      await invalidateGroupsCluster();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
