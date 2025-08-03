import { AdvertisementGallery } from "@/components/Group/AdvertisementGallery";
import { api } from "@/trpc/server/server";

export default async function AdvertisementsPage() {
  const initialGroups = await api.groups.getGroupsWithAdvertisements();

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 mt-12">Advertisements</h1>
      <AdvertisementGallery initialData={initialGroups} />
    </>
  );
}
