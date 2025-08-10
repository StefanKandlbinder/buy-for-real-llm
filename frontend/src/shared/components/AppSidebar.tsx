"use client";

import { Folder, FolderOpen, FolderDown, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { AddGroupDialog } from "@/features/groups/components/AddGroupDialog";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { useProductGroups } from "@/features/products/hooks/useProductGroups";
import { useAdvertisementGroups } from "@/features/advertisements/hooks/useAdvertisementGroups";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useAdvertisements } from "@/features/advertisements/hooks/useAdvertisements";
import { cn } from "@/lib/utils";

interface GroupTreeItemProps {
  group: NestedGroup;
  allGroups: NestedGroup[];
  currentGroupId?: number;
  level?: number;
}

function GroupTreeItem({
  group,
  allGroups,
  currentGroupId,
  level = 0,
  type = "products",
}: GroupTreeItemProps & { type?: "products" | "advertisements" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childGroups = allGroups.filter((g) => g.parent_id === group.id);
  const hasChildren = childGroups.length > 0;
  const isCurrentGroup = currentGroupId === group.id;

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className={cn(isCurrentGroup && "bg-muted")}>
          <Link href={`/admin/${type}/${group.slug}`} scroll={false}>
            {hasChildren ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsExpanded((prev) => !prev);
                  }
                }}
                className="p-0 hover:bg-muted rounded inline-flex"
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <FolderDown className="h-4 w-4" />
                )}
              </span>
            ) : (
              <Folder className="h-4 w-4" />
            )}
            <span>{group.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {childGroups.map((childGroup) => (
            <GroupTreeItem
              key={childGroup.id}
              group={childGroup}
              allGroups={allGroups}
              currentGroupId={currentGroupId}
              level={level + 1}
              type={type}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface AppSidebarProps {
  initialGroups?: NestedGroup[];
  initialProductGroups?: NestedGroup[];
  initialAdvertisementGroups?: NestedGroup[];
}

export function AppSidebar({
  initialGroups,
  initialProductGroups,
  initialAdvertisementGroups,
}: AppSidebarProps = {}) {
  const { groups: clientGroups } = useGroups(initialGroups);
  const { productGroups: clientProductGroups } =
    useProductGroups(initialProductGroups);
  const { advertisementGroups: clientAdvertisementGroups } =
    useAdvertisementGroups(initialAdvertisementGroups);
  const { createProductWithGroupMutation } = useProducts();
  const { createAdvertisementWithGroupMutation } = useAdvertisements();
  const pathname = usePathname();

  // Use client data for real-time updates, fallback to server data
  const groups = clientGroups || initialGroups;
  const productGroups = clientProductGroups || initialProductGroups;
  const advertisementGroups =
    clientAdvertisementGroups || initialAdvertisementGroups;
  const rootProductGroups =
    productGroups?.filter((g) => g.parent_id === null) ?? [];
  const rootAdvertisementGroups =
    advertisementGroups?.filter((g) => g.parent_id === null) ?? [];

  // Find the current group based on the pathname
  const getCurrentGroupId = () => {
    if (pathname === "/admin/products" || pathname === "/admin/advertisements")
      return undefined;

    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (
      pathSegments[1] === "admin" &&
      (pathSegments[2] === "products" || pathSegments[2] === "advertisements")
    ) {
      const currentGroup = groups?.find((group) => group.slug === lastSegment);
      return currentGroup?.id;
    }

    return undefined;
  };

  const activeGroupId = getCurrentGroupId();
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Products</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AddGroupDialog
                  groups={rootProductGroups ?? []}
                  createGroupMutation={(values) =>
                    createProductWithGroupMutation.mutate(values)
                  }
                  triggerButton={
                    <SidebarMenuButton>
                      <Plus className="h-4 w-4" />
                      <span>Add Group</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
              {rootProductGroups.map((group) => (
                <GroupTreeItem
                  key={group.id}
                  group={group}
                  allGroups={productGroups ?? []}
                  currentGroupId={activeGroupId}
                  type="products"
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Advertisements</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <AddGroupDialog
                  groups={rootAdvertisementGroups ?? []}
                  createGroupMutation={(values) =>
                    createAdvertisementWithGroupMutation.mutate(values)
                  }
                  triggerButton={
                    <SidebarMenuButton>
                      <Plus className="h-4 w-4" />
                      <span>Add Group</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
              {rootAdvertisementGroups.map((group) => (
                <GroupTreeItem
                  key={group.id}
                  group={group}
                  allGroups={advertisementGroups ?? []}
                  currentGroupId={activeGroupId}
                  type="advertisements"
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
