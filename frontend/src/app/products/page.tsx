import { ImageGallery } from "@/components/ImageGallery";
import { api } from "@/trpc/server/server";
import { GroupWithImages } from "@/types/image";

export default async function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 mt-12">Image Gallery</h1>
      <ImageGallery />
    </main>
  );
}
