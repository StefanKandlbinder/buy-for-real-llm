"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useGroups } from "@/features/groups/hooks/useGroups";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

interface AdminBreadcrumbProps {
  initialGroups?: NestedGroup[];
}

export function AdminBreadcrumb({ initialGroups }: AdminBreadcrumbProps) {
  const pathname = usePathname();
  const { groups } = useGroups(initialGroups);

  // Only show breadcrumb on product or advertisement pages
  if (
    !pathname.startsWith("/admin/products") &&
    !pathname.startsWith("/admin/advertisements")
  ) {
    return null;
  }

  // Determine the content type and base path
  const contentType = pathname.startsWith("/admin/products")
    ? "products"
    : "advertisements";
  const basePath = `/admin/${contentType}`;

  // Find the current group based on the pathname
  const getCurrentGroupId = () => {
    if (pathname === basePath) return undefined;

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

  const currentGroupId = getCurrentGroupId();
  const currentGroup = currentGroupId
    ? groups?.find((g) => g.id === currentGroupId)
    : null;

  // Build the breadcrumb path
  const buildBreadcrumbPath = (group: NestedGroup): NestedGroup[] => {
    const path: NestedGroup[] = [group];
    let current = group;

    while (current.parent_id) {
      const parent = groups?.find((g) => g.id === current.parent_id);
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
    return `${basePath}/${pathItems.map((item) => item.slug).join("/")}`;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={basePath}>
              {contentType === "products" ? "Products" : "Advertisements"}
            </Link>
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
                  <Link href={buildUrlPath(breadcrumbItems, index)}>
                    {item.name}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
