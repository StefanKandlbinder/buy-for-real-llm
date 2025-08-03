import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

export function useAdvertisementGroups(initialData?: NestedGroup[]) {
  const trpc = useTRPC();

  const advertisementGroupsQuery = useQuery(
    trpc.groups.getGroupsWithAdvertisements.queryOptions(undefined, {
      refetchOnWindowFocus: false,
      initialData,
    })
  );

  return {
    advertisementGroups: advertisementGroupsQuery.data,
    advertisementGroupsQuery,
  };
} 