import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { GroupWithImages } from "@/types/image";

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
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups =
          queryClient.getQueryData<GroupWithImages[]>(groupsQueryKey);
        queryClient.setQueryData<GroupWithImages[]>(
          groupsQueryKey,
          (oldData) => {
            const optimisticNewGroup: GroupWithImages = {
              name: newGroup.name,
              id: Date.now(),
              parent_id: newGroup.parentId ?? null,
              media: [],
            };
            return [...(oldData ?? []), optimisticNewGroup];
          }
        );
        return { previousGroups };
      },
      onError: (err, newGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
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
        const previousGroups =
          queryClient.getQueryData<GroupWithImages[]>(groupsQueryKey);
        queryClient.setQueryData<GroupWithImages[]>(
          groupsQueryKey,
          (oldData) => oldData?.filter((g) => g.id !== deletedGroup.id) ?? []
        );
        return { previousGroups };
      },
      onError: (err, deletedGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
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
