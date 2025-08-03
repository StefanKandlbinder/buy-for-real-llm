import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { NestedGroup } from "@/trpc/server/routers/groups/router";
import { toast } from "sonner";
import { useAsyncErrorHandler } from "@/components/Error/ErrorProvider";
import { revalidateAdminPages } from "@/actions/revalidate";

export function useGroups(initialData?: NestedGroup[]) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const handleAsyncError = useAsyncErrorHandler();

  const groupsQuery = useQuery(
    trpc.groups.getNestedGroups.queryOptions(undefined, {
      refetchOnWindowFocus: false,
      initialData,
    })
  );

  const createGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Show loading toast
        const loadingToast = toast.loading(
          `Creating group "${newGroup.name}"...`
        );

        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);
        queryClient.setQueryData(groupsQueryKey, (oldData) => {
          const optimisticNewGroup: NestedGroup = {
            name: newGroup.name,
            slug:
              newGroup.slug ||
              newGroup.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            id: Date.now(),
            parent_id: newGroup.parentId ?? null,
            media: [],
            level:
              oldData?.find((g) => g.id === newGroup.parentId)?.level ?? 0 + 1,
            path: `${
              oldData?.find((g) => g.id === newGroup.parentId)?.path ?? ""
            }->${Date.now()}`,
          };
          return [...(oldData ?? []), optimisticNewGroup];
        });
        return { previousGroups, loadingToast };
      },
      onSuccess: async (data, variables, context) => {
        toast.success(
          `Group "${variables.name}" has been created successfully.`,
          {
            id: context?.loadingToast,
          }
        );
        // Revalidate server-side data
        await revalidateAdminPages();
      },
      onError: (err, newGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to create group. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      },
    })
  );

  const deleteGroupMutation = useMutation(
    trpc.groups.deleteGroup.mutationOptions({
      onMutate: async (deletedGroup) => {
        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);
        const groupToDelete = previousGroups?.find(
          (g) => g.id === deletedGroup.id
        );

        // Show loading toast
        const loadingToast = toast.loading(
          `Deleting group "${groupToDelete?.name || "Unknown"}"...`
        );

        queryClient.setQueryData(
          groupsQueryKey,
          (oldData) => oldData?.filter((g) => g.id !== deletedGroup.id) ?? []
        );
        return { previousGroups, groupName: groupToDelete?.name, loadingToast };
      },
      onSuccess: async (data, variables, context) => {
        if (data && data.success === false) {
          toast.error(
            data.message || "Failed to delete group. Please try again.",
            {
              id: context?.loadingToast,
            }
          );
          return;
        }
        toast.success(
          `Group "${
            context?.groupName || "Unknown"
          }" has been deleted successfully.`,
          {
            id: context?.loadingToast,
          }
        );
        // Revalidate server-side data
        await revalidateAdminPages();
      },
      onError: (err, deletedGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to delete group. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
      },
    })
  );

  return {
    groups: groupsQuery.data,
    groupsQuery,
    createGroupMutation,
    deleteGroupMutation,
  };
}
