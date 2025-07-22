import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";

export const createContext = async () => {
  return { db, auth: await auth() };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
