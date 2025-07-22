"use client";

import { type GroupWithImages } from "@/types/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, TrashIcon } from "lucide-react";
import Image from "next/image";

export function GroupNode({
  group,
  allGroups,
  deleteGroupMutation,
}: {
  group: GroupWithImages;
  allGroups: GroupWithImages[];
  deleteGroupMutation: (values: { id: number }) => void;
}) {
  const childGroups = allGroups.filter((g) => g.parent_id === group.id);

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{group.name}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <UploadIcon className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
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
                alt={image.label}
                className="rounded-md object-cover w-full h-full"
                width={200}
                height={200}
              />
              <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md truncate">
                {image.label}
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
          />
        ))}
      </CardContent>
    </Card>
  );
}
