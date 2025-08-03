import { ProductGallery } from "@/components/Group/ProductGallery";
import { api } from "@/trpc/server/server";
import { notFound } from "next/navigation";
import { NestedGroup } from "@/trpc/server/routers/groups/router";

interface GroupPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const groups = await api.groups.getNestedGroups();
  const { slug: pathSlugs } = await params;

  // Handle the nested path: ["parent-slug", "child-slug", "grandchild-slug"]

  // Find the group by the last slug in the path
  const targetSlug = pathSlugs[pathSlugs.length - 1];
  const currentGroup = groups.find((group) => group.slug === targetSlug);

  if (!currentGroup) {
    notFound();
  }

  // Verify the path is correct by checking if the group hierarchy matches the URL
  const verifyPath = (group: NestedGroup, slugs: string[]): boolean => {
    if (slugs.length === 0) return true;

    const currentSlug = slugs[slugs.length - 1];
    if (group.slug !== currentSlug) return false;

    if (slugs.length === 1) return true;

    const parent = groups.find((g) => g.id === group.parent_id);
    if (!parent) return false;

    return verifyPath(parent, slugs.slice(0, -1));
  };

  if (!verifyPath(currentGroup, pathSlugs)) {
    notFound();
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-4 mt-12">{currentGroup.name}</h1>
      <ProductGallery initialData={groups} currentGroupId={currentGroup.id} />
    </>
  );
}
