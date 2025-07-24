import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { toast } from "sonner";

export function useGroups() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();

  const groupsQuery = useQuery(
    trpc.groups.getNestedGroups.queryOptions(undefined, {
      refetchOnWindowFocus: false,
    })
  );

  const createGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Show loading toast
        const loadingToast = toast.loading(
          `Creating group "${newGroup.name}"...`
        );

        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);
        queryClient.setQueryData(groupsQueryKey, (oldData) => {
          const optimisticNewGroup: NestedGroup = {
            name: newGroup.name,
            id: Date.now(),
            parent_id: newGroup.parentId ?? null,
            media: [],
            level:
              oldData?.find((g) => g.id === newGroup.parentId)?.level ?? 0 + 1,
            path: `${
              oldData?.find((g) => g.id === newGroup.parentId)?.path ?? ""
            }->${Date.now()}`,
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
        toast.error("Failed to create group. Please try again.", {
          id: context?.loadingToast,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
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
        toast.error("Failed to delete group. Please try again.", {
          id: context?.loadingToast,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      },
    })
  );

  return {
    groups: groupsQuery.data,
    groupsQuery,
    createGroupMutation,
    deleteGroupMutation,
  };
}
