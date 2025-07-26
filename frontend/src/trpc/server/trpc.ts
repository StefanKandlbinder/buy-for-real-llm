import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => shape,
});

// Middleware to check if the user is authenticated
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

// Middleware to check for admin role
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  // Check if user has admin role in their organization memberships
  const hasAdminRole =
    ctx.auth.sessionClaims?.org_role === "admin" ||
    ctx.auth.sessionClaims?.org_role === "basic_admin";

  if (!hasAdminRole) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth,
    },
  });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
