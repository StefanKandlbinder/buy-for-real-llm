"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon, MoreVertical, Upload, FolderPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { AddFileDialog } from "../File/AddFileDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddGroupDialog } from "./AddGroupDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { insertGroupSchema } from "@/trpc/server/routers/groups/validation";
import { z } from "zod";

export function GroupNode({
  group,
  allGroups,
  deleteGroupMutation,
  createGroupMutation,
}: {
  group: NestedGroup;
  allGroups: NestedGroup[];
  deleteGroupMutation: (value: { id: number }) => void;
  createGroupMutation: (values: z.infer<typeof insertGroupSchema>) => void;
}) {
  const childGroups = allGroups.filter((g) => g.parent_id === group.id);
  const [showAddFileDialog, setShowAddFileDialog] = useState(false);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);

  // Calculate the full path for this group by traversing up the parent chain
  const calculateGroupPath = (targetGroup: NestedGroup): string => {
    const path: string[] = [];
    let currentGroup = targetGroup;

    // Build the path from the target group up to the root
    while (currentGroup) {
      path.unshift(currentGroup.slug);
      const parent = allGroups.find((g) => g.id === currentGroup.parent_id);
      currentGroup = parent!;
    }

    return path.join("/");
  };

  const groupPath = calculateGroupPath(group);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap">
        <CardTitle>
          <Link
            href={`/admin/products/${groupPath}`}
            className="hover:underline"
          >
            {group.name}
          </Link>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setShowAddFileDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAddGroupDialog(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Group
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (group.id) {
                    deleteGroupMutation({ id: group.id });
                  }
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Group
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Dialogs controlled by state */}
      {showAddFileDialog && (
        <AddFileDialog
          group={group}
          open={showAddFileDialog}
          onOpenChange={setShowAddFileDialog}
        />
      )}
      {showAddGroupDialog && (
        <AddGroupDialog
          groups={allGroups}
          createGroupMutation={(values) =>
            createGroupMutation({ ...values, parentId: group.id })
          }
          defaultParentId={group.id}
          open={showAddGroupDialog}
          onOpenChange={setShowAddGroupDialog}
        />
      )}

      <CardContent>
        {/* Render images in this group */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {group.media?.map((image) => (
            <div key={image.id} className="relative aspect-square">
              <Image
                src={image.url}
                alt={image.label ?? "Image"}
                className="rounded-md object-cover w-full h-full"
                width={200}
                height={200}
              />
              <p className="absolute bottom-0 left-0 right-0 bg-sidebar-accent bg-opacity-10 text-sidebar-accent-foreground text-xs px-4 py-3 rounded-b-md truncate min-h-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span title={image.description}>{image.label}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{image.description}</p>
                  </TooltipContent>
                </Tooltip>
              </p>
            </div>
          ))}
        </div>

        {/* Recursively render child groups */}

        {childGroups.map((child) => (
          <GroupNode
            key={child.id}
            group={child}
            allGroups={allGroups}
            deleteGroupMutation={deleteGroupMutation}
            createGroupMutation={createGroupMutation}
          />
        ))}
      </CardContent>
    </Card>
  );
}
