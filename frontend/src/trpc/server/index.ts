import { groupsRouter } from "@/trpc/server/routers/groups/router";
import { mediaRouter } from "@/trpc/server/routers/media/router";
import { productsRouter } from "@/trpc/server/routers/products/router";
import { advertisementsRouter } from "@/trpc/server/routers/advertisements/router";
import { router } from "./trpc";

export const appRouter = router({
  groups: groupsRouter,
  media: mediaRouter,
  products: productsRouter,
  advertisements: advertisementsRouter,
});

export type AppRouter = typeof appRouter;
