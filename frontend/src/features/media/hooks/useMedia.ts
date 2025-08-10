"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadMediaAction } from "@/actions/mediaActions";
import { useTRPCClient } from "@/trpc/client/client";
import { useTRPC } from "@/trpc/client/client";
import { createInvalidators } from "@/trpc/client/utils";
import { AppRouter } from "@/trpc/server";
import { inferRouterOutputs } from "@trpc/server";

type GroupQueryOutput =
  inferRouterOutputs<AppRouter>["groups"]["getNestedGroups"];

export function useMedia() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const invalidators = createInvalidators(queryClient, trpc);

  // Invalidation handled centrally via createInvalidators

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
        const objectUrl = URL.createObjectURL(file);
        const optimisticMedia = {
          id: optimisticId, // Temporary ID
          url: objectUrl, // Local blob URL for preview
          label: label || file.name,
          description: description || "",
          mediaType: file.type.startsWith("video/") ? "video" : "image",
          isActive: true,
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
        return {
          previousGroups,
          loadingToast,
          tempId: optimisticId,
          groupId,
          objectUrl,
        };
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
                          isActive: data.isActive ?? true,
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
    onSettled: async (_data, _err, _vars, context) => {
      if (context && "objectUrl" in context && context.objectUrl) {
        try {
          URL.revokeObjectURL(context.objectUrl as string);
        } catch {}
      }
      await invalidators.groupsCluster();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: {
      id: string;
      label?: string;
      description?: string;
      url?: string;
      isActive?: boolean;
      mediaType?: "image" | "video";
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
      await invalidators.groupsCluster();
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
      await invalidators.groupsCluster();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
