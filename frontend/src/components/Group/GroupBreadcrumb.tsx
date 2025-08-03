"use client";

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

interface GroupBreadcrumbProps {
  groups: NestedGroup[];
  currentGroupId?: number;
}

export function GroupBreadcrumb({
  groups,
  currentGroupId,
}: GroupBreadcrumbProps) {
  // Find the current group
  const currentGroup = currentGroupId
    ? groups.find((g) => g.id === currentGroupId)
    : null;

  // Build the breadcrumb path
  const buildBreadcrumbPath = (group: NestedGroup): NestedGroup[] => {
    const path: NestedGroup[] = [group];
    let current = group;

    while (current.parent_id) {
      const parent = groups.find((g) => g.id === current.parent_id);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return path;
  };

  const breadcrumbItems = currentGroup ? buildBreadcrumbPath(currentGroup) : [];

  // Build the full URL path for each breadcrumb item
  const buildUrlPath = (items: NestedGroup[], targetIndex: number): string => {
    const pathItems = items.slice(0, targetIndex + 1);
    return `/admin/products/${pathItems.map(item => item.slug).join('/')}`;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin/products">Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={buildUrlPath(breadcrumbItems, index)}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
