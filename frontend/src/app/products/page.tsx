import { ImageGallery } from "@/components/ImageGallery";
import { api } from "@/trpc/server/server";
import { GroupWithImages } from "@/types/image";
import { redirect } from "next/navigation";

export default async function HomePage() {
  let initialData: GroupWithImages[] = [];
  try {
    initialData = (await api.groups.getNestedGroups()) as GroupWithImages[];
  } catch (err: any) {
    // If the error is an UNAUTHORIZED error, redirect to sign-in
    if (err?.code === "UNAUTHORIZED") {
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
