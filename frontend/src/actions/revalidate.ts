"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/[...slug]");
}
