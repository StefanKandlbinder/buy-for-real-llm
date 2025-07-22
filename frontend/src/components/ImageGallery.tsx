"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { useQueryClient } from "@tanstack/react-query";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

export function ImageGallery({ initialData }: { initialData: NestedGroup[] }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();

  const { data: groups } = useQuery(
    trpc.groups.getNestedGroups.queryOptions(undefined, {
      initialData,
      refetchOnWindowFocus: false,
    })
  );

  const createGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });

        // Snapshot the previous value
        const previousGroups =
          queryClient.getQueryData<NestedGroup[]>(groupsQueryKey);

        // Optimistically update to the new value
        queryClient.setQueryData<NestedGroup[]>(groupsQueryKey, (oldData) => {
          const optimisticNewGroup: NestedGroup = {
            name: newGroup.name,
            id: Date.now(), // Use a temporary ID
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

        // Return a context object with the snapshotted value
        return { previousGroups };
      },
      onError: (err, newGroup, context) => {
        // If the mutation fails, roll back to the previous state
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
      },
      onSettled: () => {
        // Always refetch after error or success to ensure server state
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      },
    })
  );

  const deleteGroupMutation = useMutation(
    trpc.groups.deleteGroup.mutationOptions({
      onMutate: async (deletedGroup) => {
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups =
          queryClient.getQueryData<NestedGroup[]>(groupsQueryKey);
        queryClient.setQueryData<NestedGroup[]>(groupsQueryKey, (oldData) => {
          return oldData?.filter((g) => g.id !== deletedGroup.id) ?? [];
        });
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

  const rootGroups =
    groups?.filter((g) => g.parent_id === null) ?? ([] as NestedGroup[]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddGroupDialog
          groups={groups ?? ([] as NestedGroup[])}
          createGroupMutation={(values) => createGroupMutation.mutate(values)}
        />
      </div>
      {rootGroups.map((group) => (
        <GroupNode
          key={group.id as number}
          group={group}
          allGroups={groups ?? []}
          deleteGroupMutation={(values) => deleteGroupMutation.mutate(values)}
        />
      ))}
    </div>
  );
}
