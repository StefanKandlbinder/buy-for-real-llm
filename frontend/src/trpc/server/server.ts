import "server-only";

import { createCallerFactory } from "./trpc";
import { appRouter } from "./index";
import { createContext } from "./context";

/**
 * This is the server-side caller for our tRPC API.
 * It is used to call our API from server components.
 */
const createCaller = createCallerFactory(appRouter);

export const api = createCaller(createContext);
