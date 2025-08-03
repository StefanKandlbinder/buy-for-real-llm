"use client";

import { Video, Folder, FolderOpen, FolderDown, Plus } from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User2 } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { AddGroupDialog } from "./Group/AddGroupDialog";
import { useGroups } from "@/hooks/group/useGroups";
import { cn } from "@/lib/utils";

// Menu items.
const ads = [
  {
    title: "video",
    url: "/admin/ads",
    icon: Video,
  },
];

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
}: GroupTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const childGroups = allGroups.filter((g) => g.parent_id === group.id);
  const hasChildren = childGroups.length > 0;
  const isCurrentGroup = currentGroupId === group.id;

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className={cn(isCurrentGroup && "bg-muted")}>
          <Link href={`/admin/products/${group.slug}`} scroll={false}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="p-0 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <FolderDown className="h-4 w-4" />
                )}
              </button>
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
            />
          ))}
        </div>
      )}
    </>
  );
}

interface AppSidebarProps {
  initialGroups?: NestedGroup[];
}

export function AppSidebar({ initialGroups }: AppSidebarProps = {}) {
  const { groups: clientGroups, createGroupMutation } =
    useGroups(initialGroups);
  const pathname = usePathname();

  // Use server-fetched data if available, otherwise fall back to client data
  const groups = initialGroups || clientGroups;
  const rootGroups = groups?.filter((g) => g.parent_id === null) ?? [];

  // Find the current group based on the pathname
  const getCurrentGroupId = () => {
    if (pathname === "/admin/products") return undefined;

    const pathSegments = pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (pathSegments[1] === "admin" && pathSegments[2] === "products") {
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
                  groups={groups ?? []}
                  createGroupMutation={(values) =>
                    createGroupMutation.mutate(values)
                  }
                  triggerButton={
                    <SidebarMenuButton>
                      <Plus className="h-4 w-4" />
                      <span>Add Group</span>
                    </SidebarMenuButton>
                  }
                />
              </SidebarMenuItem>
              {rootGroups.map((group) => (
                <GroupTreeItem
                  key={group.id}
                  group={group}
                  allGroups={groups ?? []}
                  currentGroupId={activeGroupId}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Advertisements</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ads.map((product) => (
                <SidebarMenuItem key={product.title}>
                  <SidebarMenuButton asChild>
                    <Link href={product.url} scroll={false}>
                      <product.icon />
                      <span>{product.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 />
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <Link className="w-full h-full" href="/sign-in">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link className="w-full h-full" href="/sign-up">
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SignedOut>
      </SidebarFooter>
    </Sidebar>
  );
}
