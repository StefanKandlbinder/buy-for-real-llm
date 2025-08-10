"use client";

import { GroupNode } from "@/features/groups/components/GroupNode";
import { AddGroupDialog } from "@/features/groups/components/AddGroupDialog";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { Skeleton } from "@/components/ui/skeleton";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { z } from "zod";
import { insertGroupSchema, updateGroupSchema } from "@/trpc/server/routers/groups/validation";

interface ImageGalleryProps {
  initialData?: NestedGroup[];
}

export function ImageGallery({ initialData }: ImageGalleryProps) {
  const {
    groups,
    createGroupMutation,
    deleteGroupMutation,
    updateGroupMutation,
    groupsQuery,
  } = useGroups(initialData);
  const rootGroups = groups?.filter((g) => g.parent_id === null) ?? [];

  if (groupsQuery.isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-[36px] w-[100px] rounded-md self-end" />
        <Skeleton className="h-[250px] w-full rounded-xl">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </Skeleton>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddGroupDialog
          groups={groups ?? []}
          createGroupMutation={(values: z.infer<typeof insertGroupSchema>) => createGroupMutation.mutate(values)}
        />
      </div>
      {rootGroups.map((group) => (
        <GroupNode
          key={group.id as number}
          group={group}
          allGroups={groups ?? []}
          deleteGroupMutation={(values: { id: number }) => deleteGroupMutation.mutate(values)}
          createGroupMutation={(values: z.infer<typeof insertGroupSchema>) => createGroupMutation.mutate(values)}
          updateGroupMutation={(values: z.infer<typeof updateGroupSchema>) => updateGroupMutation.mutate(values)}
        />
      ))}
    </div>
  );
}
