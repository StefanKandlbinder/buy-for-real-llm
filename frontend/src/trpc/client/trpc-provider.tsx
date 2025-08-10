"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";
import { TRPCProvider } from "./client";
import { getUrl } from "./utils";
import { AppRouter } from "@/trpc/server";
import { useAuth } from "@clerk/nextjs";

import { createQueryClient } from "@/lib/query-client";

function makeQueryClient() {
  // Use centralized defaults from lib/query-client
  return createQueryClient();
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  headerEntries: Array<[string, string]>;
}) {
  const queryClient = getQueryClient();
  const { getToken } = useAuth();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: getUrl(),
          transformer: superjson,
          async headers() {
            const heads = new Map(props.headerEntries);
            heads.set("x-trpc-source", "react");
            const token = await getToken();
            if (token) {
              heads.set("authorization", `Bearer ${token}`);
            }
            return Object.fromEntries(heads);
          },
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
