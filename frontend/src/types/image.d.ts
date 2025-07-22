export type Image = {
  id: string;
  label: string;
  url: string;
};

// Defines the shape of the data for a single group, including its images,
// as returned by the recursive getNestedGroups query.
export type GroupWithImages = {
  id: number | null;
  name: string;
  parent_id: number | null;
  media: Image[] | null;
};
