"use client";

import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { useGroups } from "@/hooks/group/useGroups";
import { useProducts } from "@/hooks/product/useProducts";
import { Skeleton } from "../ui/skeleton";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

interface ProductGalleryProps {
  initialData?: NestedGroup[];
}

export function ProductGallery({ initialData }: ProductGalleryProps) {
  const { groups, deleteGroupMutation, groupsQuery } = useGroups(initialData);
  const { createProductWithGroupMutation } = useProducts();
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
          createGroupMutation={(values) =>
            createProductWithGroupMutation.mutate(values)
          }
        />
      </div>
      {rootGroups.map((group) => (
        <GroupNode
          key={group.id as number}
          group={group}
          allGroups={groups ?? []}
          deleteGroupMutation={(values) => deleteGroupMutation.mutate(values)}
          createGroupMutation={(values) =>
            createProductWithGroupMutation.mutate(values)
          }
        />
      ))}
    </div>
  );
}
