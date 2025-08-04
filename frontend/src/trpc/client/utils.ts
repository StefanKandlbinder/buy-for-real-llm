import { QueryClient } from "@tanstack/react-query";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/trpc/server";

function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}

// Helpers to batch-invalidate related query clusters
export function createInvalidators(
  queryClient: QueryClient,
  trpc: ReturnType<typeof import("@/trpc/client/client").useTRPC>
) {
  return {
    productsCluster: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.products.getAllProducts.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getGroupsWithProducts.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getNestedGroups.queryKey(),
        }),
      ]);
    },
    advertisementsCluster: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.advertisements.getAllAdvertisements.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getGroupsWithAdvertisements.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getNestedGroups.queryKey(),
        }),
      ]);
    },
    groupsCluster: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getNestedGroups.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getGroupsWithProducts.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.groups.getGroupsWithAdvertisements.queryKey(),
        }),
      ]);
    },
  };
}
