import { groupsRouter } from "@/trpc/server/routers/groups/router";
import { mediaRouter } from "@/trpc/server/routers/media/router";
import { router } from "./trpc";

export const appRouter = router({
  groups: groupsRouter,
  media: mediaRouter,
});

export type AppRouter = typeof appRouter;
