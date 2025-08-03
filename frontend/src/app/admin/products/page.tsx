import { ProductGallery } from "@/components/Group/ProductGallery";
import { api } from "@/trpc/server/server";

export default async function ProductsPage() {
  const initialGroups = await api.groups.getNestedGroups();

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 mt-12">Products</h1>
      <ProductGallery initialData={initialGroups} />
    </>
  );
}
