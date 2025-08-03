import { db } from "../src/db/drizzle";
import { groups } from "../src/db/schema";
import { eq } from "drizzle-orm";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

async function populateSlugs() {
  try {
    // Get all groups without slugs
    const allGroups = await db.select().from(groups);

    for (const group of allGroups) {
      if (!group.slug) {
        const slug = generateSlug(group.name);
        await db.update(groups).set({ slug }).where(eq(groups.id, group.id));
        console.log(`Updated group "${group.name}" with slug: "${slug}"`);
      }
    }

    console.log("Slug population completed!");
  } catch (error) {
    console.error("Error populating slugs:", error);
  }
}

populateSlugs();
