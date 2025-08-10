import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { toast } from "sonner";
import { useAsyncErrorHandler } from "@/components/Error/ErrorProvider";

export function useGroups(initialData?: NestedGroup[]) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const handleAsyncError = useAsyncErrorHandler();

  const invalidateGroupsCluster = async () => {
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
  };

  const groupsQuery = useQuery(
    trpc.groups.getNestedGroups.queryOptions(undefined, {
      refetchOnWindowFocus: false,
      initialData,
      staleTime: 0, // Always consider data stale to allow immediate refetch
    })
  );

  const createGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Show loading toast
        const loadingToast = toast.loading(`Creating group...`);

        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);

        // Find parent group for level calculation
        const parentGroup = previousGroups?.find(
          (g) => g.id === newGroup.parentId
        );

        // Optimistic update for groups
        queryClient.setQueryData(groupsQueryKey, (oldData) => {
          const optimisticNewGroup = {
            name: newGroup.name,
            slug:
              newGroup.slug ||
              newGroup.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            id: Date.now(),
            parent_id: newGroup.parentId ?? null,
            media: [],
            level: parentGroup ? parentGroup.level + 1 : 0,
            path: parentGroup
              ? `${parentGroup.path}->${Date.now()}`
              : `${Date.now()}`,
          };
          return [...(oldData ?? []), optimisticNewGroup];
        });
        return { previousGroups, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(
          `Group "${variables.name}" has been created successfully.`,
          {
            id: context?.loadingToast,
          }
        );
      },
      onError: (err, newGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to create group. Please try again.");
      },
      onSettled: async () => {
        await invalidateGroupsCluster();
      },
    })
  );

  const deleteGroupMutation = useMutation(
    trpc.groups.deleteGroup.mutationOptions({
      onMutate: async (deletedGroup) => {
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);
        const groupToDelete = previousGroups?.find(
          (g) => g.id === deletedGroup.id
        );

        // Show loading toast
        const loadingToast = toast.loading(
          `Deleting group "${groupToDelete?.name || "Unknown"}"...`
        );

        queryClient.setQueryData(
          groupsQueryKey,
          (oldData) => oldData?.filter((g) => g.id !== deletedGroup.id) ?? []
        );
        return { previousGroups, groupName: groupToDelete?.name, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        if (data && data.success === false) {
          toast.error(
            data.message || "Failed to delete group. Please try again.",
            {
              id: context?.loadingToast,
            }
          );
          return;
        }
        toast.success(
          `Group "${
            context?.groupName || "Unknown"
          }" has been deleted successfully.`,
          {
            id: context?.loadingToast,
          }
        );
      },
      onError: (err, deletedGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to delete group. Please try again.");
      },
      onSettled: async () => {
        await invalidateGroupsCluster();
      },
    })
  );

  const updateGroupMutation = useMutation(
    trpc.groups.updateGroup.mutationOptions({
      onMutate: async (updatedGroup) => {
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups =
          queryClient.getQueryData<NestedGroup[]>(groupsQueryKey);

        const target = previousGroups?.find((g) => g.id === updatedGroup.id);
        const loadingToast = toast.loading(
          `Renaming group "${target?.name ?? "Untitled"}"...`
        );

        queryClient.setQueryData(
          groupsQueryKey,
          (oldData: NestedGroup[] | undefined) =>
            oldData?.map((g) =>
              g.id === updatedGroup.id ? { ...g, name: updatedGroup.name } : g
            ) ?? []
        );

        return { previousGroups, loadingToast, oldName: target?.name };
      },
      onSuccess: (data, variables, context) => {
        toast.success(
          `Group "${context?.oldName ?? "Untitled"}" renamed to "${
            variables.name
          }".`,
          { id: context?.loadingToast }
        );
      },
      onError: (err, variables, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to update group. Please try again.");
      },
      onSettled: async () => {
        await invalidateGroupsCluster();
      },
    })
  );

  return {
    groups: groupsQuery.data,
    groupsQuery,
    createGroupMutation,
    deleteGroupMutation,
    updateGroupMutation,
  };
}
