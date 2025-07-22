import { ImageGallery } from "@/components/ImageGallery";
import { api } from "@/trpc/server/server";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { redirect } from "next/navigation";

export default async function HomePage() {
  let initialData: NestedGroup[] = [];
  try {
    initialData = await api.groups.getNestedGroups();
  } catch (err: unknown) {
    // Type guard to check if it's a TRPC error with a code property
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "UNAUTHORIZED"
    ) {
      redirect("/sign-in");
    }
    throw err;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 mt-12">Image Gallery</h1>
      <ImageGallery initialData={initialData} />
    </main>
  );
}
