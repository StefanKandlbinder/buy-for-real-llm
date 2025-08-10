"use client";

import { GroupNode } from "@/features/groups/components/GroupNode";
import { AddGroupDialog } from "@/features/groups/components/AddGroupDialog";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useProductGroups } from "@/features/products/hooks/useProductGroups";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { z } from "zod";
import { insertGroupSchema, updateGroupSchema } from "@/trpc/server/routers/groups/validation";

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
          createGroupMutation={(values: z.infer<typeof insertGroupSchema>) =>
            createProductWithGroupMutation.mutate(values)
          }
        />
      </div>
      {displayGroups.map((group) => (
        <GroupNode
          key={group.id as number}
          group={group}
          allGroups={groupsToDisplay ?? []}
          deleteGroupMutation={(values: { id: number }) => deleteGroupMutation.mutate(values)}
          createGroupMutation={(values: z.infer<typeof insertGroupSchema>) =>
            createProductWithGroupMutation.mutate(values)
          }
          updateGroupMutation={(values: z.infer<typeof updateGroupSchema>) => updateGroupMutation.mutate(values)}
          contentType="products"
        />
      ))}
    </div>
  );
}
