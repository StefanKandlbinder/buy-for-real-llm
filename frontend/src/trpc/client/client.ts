import { createTRPCContext } from "@trpc/tanstack-react-query";
import { type AppRouter } from "@/trpc/server/index";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
