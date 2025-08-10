"use client";

import { GroupNode } from "./GroupNode";
import { AddGroupDialog } from "./AddGroupDialog";
import { useGroups } from "@/hooks/group/useGroups";
import { useProductGroups } from "@/hooks/product/useProductGroups";
import { useProducts } from "@/hooks/product/useProducts";
import { Skeleton } from "../ui/skeleton";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

interface ProductGalleryProps {
  initialData?: NestedGroup[];
  currentGroupId?: number;
}

export function ProductGallery({
  initialData,
  currentGroupId,
}: ProductGalleryProps) {
  const { groups, deleteGroupMutation, updateGroupMutation, groupsQuery } =
    useGroups(initialData);
  const { productGroups } = useProductGroups(initialData);
  const { createProductWithGroupMutation } = useProducts();

  // Use filtered product groups instead of all groups
  const groupsToDisplay = productGroups || groups;

  // If we have a current group ID, show only that group (children will be shown recursively by GroupNode)
  // Otherwise, show root groups
  const displayGroups = currentGroupId
    ? groupsToDisplay?.filter((g) => g.id === currentGroupId) ?? []
    : groupsToDisplay?.filter((g) => g.parent_id === null) ?? [];

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
      {displayGroups.map((group) => (
        <GroupNode
          key={group.id as number}
          group={group}
          allGroups={groupsToDisplay ?? []}
          deleteGroupMutation={(values) => deleteGroupMutation.mutate(values)}
          createGroupMutation={(values) =>
            createProductWithGroupMutation.mutate(values)
          }
          updateGroupMutation={(values) => updateGroupMutation.mutate(values)}
          contentType="products"
        />
      ))}
    </div>
  );
}
