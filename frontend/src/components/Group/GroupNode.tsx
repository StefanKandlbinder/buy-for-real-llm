"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "lucide-react";
import Image from "next/image";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { AddFileDialog } from "../File/AddFileDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddGroupDialog } from "./AddGroupDialog";
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

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap">
        <CardTitle>{group.name}</CardTitle>
        <div className="flex gap-2">
          <AddFileDialog group={group} />
          <AddGroupDialog
            groups={allGroups}
            createGroupMutation={(values) =>
              createGroupMutation({ ...values, parentId: group.id })
            }
            triggerButton={<Button size="sm">Add Group</Button>}
            defaultParentId={group.id}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (group.id) {
                deleteGroupMutation({ id: group.id });
              }
            }}
          >
            <TrashIcon className="h-4 w-4" />
            Delete Group
          </Button>
        </div>
      </CardHeader>
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
