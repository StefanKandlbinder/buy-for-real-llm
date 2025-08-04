"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/[...slug]");
  revalidatePath("/admin/advertisements");
  revalidatePath("/admin/advertisements/[...slug]");
  revalidatePath("/admin/ads");
}

// Revalidate all group-related data
export async function revalidateGroups() {
  revalidateTag("groups");
  revalidateTag("nested-groups");
  revalidateTag("groups-with-products");
  revalidateTag("groups-with-advertisements");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/advertisements");
  revalidatePath("/admin/ads");
}

// Revalidate all product-related data
export async function revalidateProducts() {
  revalidateTag("products");
  revalidateTag("products-by-group");
  revalidateTag("groups-with-products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/[...slug]");
  revalidatePath("/admin/ads");
}

// Revalidate all advertisement-related data
export async function revalidateAdvertisements() {
  revalidateTag("advertisements");
  revalidateTag("advertisements-by-group");
  revalidateTag("groups-with-advertisements");
  revalidatePath("/admin");
  revalidatePath("/admin/advertisements");
  revalidatePath("/admin/advertisements/[...slug]");
  revalidatePath("/admin/ads");
}

// Revalidate all media-related data
export async function revalidateMedia() {
  revalidateTag("media");
  revalidateTag("media-by-group");
  revalidateTag("nested-groups"); // Groups include media
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/advertisements");
  revalidatePath("/admin/ads");
}

// Revalidate all data (for major changes)
export async function revalidateAll() {
  revalidateGroups();
  revalidateProducts();
  revalidateAdvertisements();
  revalidateMedia();
}
