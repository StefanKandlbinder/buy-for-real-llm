"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { GroupWithImages } from "@/types/image";
import { useQueryClient } from "@tanstack/react-query";

export function ImageGallery({
  initialData,
}: {
  initialData: GroupWithImages[];
}) {
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
          queryClient.getQueryData<GroupWithImages[]>(groupsQueryKey);

        // Optimistically update to the new value
        queryClient.setQueryData<GroupWithImages[]>(
          groupsQueryKey,
          (oldData) => {
            const optimisticNewGroup: GroupWithImages = {
              // Note: Ensure this optimistic object matches your `GroupWithImages` type
              name: newGroup.name,
              id: Date.now(), // Use a temporary ID
              parent_id: newGroup.parentId ?? null,
              media: [],
            };
            return [...(oldData ?? []), optimisticNewGroup];
          }
        );

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
          queryClient.getQueryData<GroupWithImages[]>(groupsQueryKey);
        queryClient.setQueryData<GroupWithImages[]>(
          groupsQueryKey,
          (oldData) => {
            return oldData?.filter((g) => g.id !== deletedGroup.id) ?? [];
          }
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

  const rootGroups =
    groups?.filter((g) => g.parent_id === null) ?? ([] as GroupWithImages[]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddGroupDialog
          groups={groups ?? ([] as GroupWithImages[])}
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
