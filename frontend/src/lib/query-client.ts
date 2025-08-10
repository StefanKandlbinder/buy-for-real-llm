import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) => {
          const maybeAny = error as unknown as { status?: number };
          const status = maybeAny?.status;
          if (
            typeof status === "number" &&
            status >= 400 &&
            status < 500 &&
            status !== 408
          ) {
            return false;
          }
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false,
        onError: (error) => {
          // Centralized logging; UI toasts handled per-mutation
          console.error("Mutation error:", error);
        },
      },
    },
  });
}
