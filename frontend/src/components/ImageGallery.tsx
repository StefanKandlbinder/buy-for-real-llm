"use client";

import { trpc } from "@/trpc/client/client";

import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { GroupWithImages } from "@/types/image";

export function ImageGallery({
  initialData,
}: {
  initialData: GroupWithImages[];
}) {
  const utils = trpc.useUtils();

  const { data: groups } = trpc.groups.getNestedGroups.useQuery(undefined, {
    initialData,
    refetchOnWindowFocus: false,
  }) as { data: GroupWithImages[] };

  const createGroupMutation = trpc.groups.createGroup.useMutation({
    onMutate: async (newGroup) => {
      await utils.groups.getNestedGroups.cancel();
      const previousGroups = utils.groups.getNestedGroups.getData();
      utils.groups.getNestedGroups.setData(undefined, (oldData) => {
        const optimisticNewGroup: GroupWithImages = {
          name: newGroup.name,
          id: Date.now(),
          parent_id: newGroup.parentId ?? null,
          media: [],
        };
        return oldData
          ? [...oldData, optimisticNewGroup]
          : [optimisticNewGroup];
      });
      return { previousGroups };
    },
    onError: (err, newGroup, context) => {
      if (context?.previousGroups) {
        utils.groups.getNestedGroups.setData(undefined, context.previousGroups);
      }
    },
    onSettled: () => {
      utils.groups.getNestedGroups.invalidate();
    },
  });

  const deleteGroupMutation = trpc.groups.deleteGroup.useMutation({
    onMutate: async (deletedGroup) => {
      await utils.groups.getNestedGroups.cancel();
      const previousGroups = utils.groups.getNestedGroups.getData();
      utils.groups.getNestedGroups.setData(undefined, (oldData) => {
        return oldData?.filter((g) => g.id !== deletedGroup.id) ?? [];
      });
      return { previousGroups };
    },
    onError: (err, newGroup, context) => {
      if (context?.previousGroups) {
        utils.groups.getNestedGroups.setData(undefined, context.previousGroups);
      }
    },
    onSettled: () => {
      utils.groups.getNestedGroups.invalidate();
    },
  });

  const rootGroups = groups?.filter((g) => g.parent_id === null) ?? [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddGroupDialog
          groups={groups ?? []}
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
