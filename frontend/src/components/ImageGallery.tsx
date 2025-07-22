"use client";

import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { useGroups } from "@/hooks/useGroups";

export function ImageGallery() {
  const { groups, createGroupMutation, deleteGroupMutation } = useGroups();
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
