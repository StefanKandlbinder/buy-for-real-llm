import { ImageGallery } from "@/components/ImageGallery";

export default async function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 mt-12">Products</h1>
      <ImageGallery />
    </main>
  );
}
