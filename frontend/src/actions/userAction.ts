"use server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema/user";
import { User } from "@/types/user";

export const getUsers = async () => {
  const data = (await db.select().from(users)) as User[];
  return data;
};
