"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrashIcon, MoreVertical, Upload, FolderPlus } from "lucide-react";
import Link from "next/link";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { AddFileDialog } from "../File/AddFileDialog";
import { AddGroupDialog } from "./AddGroupDialog";
import { insertGroupSchema } from "@/trpc/server/routers/groups/validation";
import { z } from "zod";
import { MediaCard } from "./MediaCard";
import { useMedia } from "@/hooks/file/useMedia";
import { useConfirm } from "@/components/ConfirmDialog";

export function GroupNode({
  group,
  allGroups,
  deleteGroupMutation,
  createGroupMutation,
  contentType = "products",
}: {
  group: NestedGroup;
  allGroups: NestedGroup[];
  deleteGroupMutation: (value: { id: number }) => void;
  createGroupMutation: (values: z.infer<typeof insertGroupSchema>) => void;
  contentType?: "products" | "advertisements";
}) {
  const [showAddFileDialog, setShowAddFileDialog] = useState(false);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const { deleteMutation } = useMedia();
  const confirm = useConfirm();

  // Get the child groups of the current group
  const childGroups = allGroups.filter((g) => g.parent_id === group.id);

  const calculateGroupPath = (targetGroup: NestedGroup): string => {
    const path: string[] = [];
    let currentGroup = targetGroup;

    while (currentGroup) {
      path.unshift(currentGroup.slug);
      const parent = allGroups.find((g) => g.id === currentGroup.parent_id);
      currentGroup = parent!;
    }

    return path.join("/");
  };

  const groupPath = calculateGroupPath(group);

  const handleDeleteMedia = (mediaId: string) => {
    deleteMutation.mutate({ id: mediaId });
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap">
        <CardTitle>
          <Link
            href={`/admin/${contentType}/${groupPath}`}
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
                variant="destructive"
                onClick={async () => {
                  if (!group.id) return;
                  const ok = await confirm({
                    title: `Delete group "${group.name}"?`,
                    description: "This will remove the group and its media.",
                    confirmText: "Delete",
                    destructive: true,
                  });
                  if (ok) deleteGroupMutation({ id: group.id });
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
        {/* Render media in this group */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {group.media?.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onDelete={() => handleDeleteMedia(media.id)}
            />
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
            contentType={contentType}
          />
        ))}
      </CardContent>
    </Card>
  );
}
