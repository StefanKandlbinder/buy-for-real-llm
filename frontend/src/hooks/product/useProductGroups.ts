import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

export function useProductGroups(initialData?: NestedGroup[]) {
  const trpc = useTRPC();

  const productGroupsQuery = useQuery(
    trpc.groups.getGroupsWithProducts.queryOptions(undefined, {
      refetchOnWindowFocus: false,
      initialData,
    })
  );

  return {
    productGroups: productGroupsQuery.data,
    productGroupsQuery,
  };
} 