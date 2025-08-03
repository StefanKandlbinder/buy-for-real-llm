import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { toast } from "sonner";
import { useAsyncErrorHandler } from "@/components/Error/ErrorProvider";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/trpc/server";

export function useAdvertisements() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const advertisementsQueryKey =
    trpc.advertisements.getAllAdvertisements.queryKey();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const handleAsyncError = useAsyncErrorHandler();

  const advertisementsQuery = useQuery(
    trpc.advertisements.getAllAdvertisements.queryOptions(undefined, {
      refetchOnWindowFocus: false,
    })
  );

  const createAdvertisementMutation = useMutation(
    trpc.advertisements.createAdvertisement.mutationOptions({
      onMutate: async (newAdvertisement) => {
        // Show loading toast
        const loadingToast = toast.loading(
          `Creating advertisement for group...`
        );

        await queryClient.cancelQueries({ queryKey: advertisementsQueryKey });
        const previousAdvertisements = queryClient.getQueryData(
          advertisementsQueryKey
        );
        queryClient.setQueryData(advertisementsQueryKey, (oldData) => {
          const optimisticNewAdvertisement = {
            id: Date.now(),
            groupId: newAdvertisement.groupId,
            isActive: newAdvertisement.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...(oldData ?? []), optimisticNewAdvertisement];
        });
        return { previousAdvertisements, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(`Advertisement has been created successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, newAdvertisement, context) => {
        if (context?.previousAdvertisements) {
          queryClient.setQueryData(
            advertisementsQueryKey,
            context.previousAdvertisements
          );
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to create advertisement. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: advertisementsQueryKey });
      },
    })
  );

  const createAdvertisementWithGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Show loading toast
        const loadingToast = toast.loading(
          `Creating group and advertisement...`
        );

        await queryClient.cancelQueries({ queryKey: groupsQueryKey });
        const previousGroups = queryClient.getQueryData(groupsQueryKey);

        // Optimistic update for groups
        queryClient.setQueryData(groupsQueryKey, (oldData) => {
          const optimisticNewGroup = {
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
            level: 0,
            path: `${Date.now()}`,
          };
          return [...(oldData ?? []), optimisticNewGroup];
        });

        return { previousGroups, loadingToast };
      },
      onSuccess: (newGroup, variables, context) => {
        // After group is created, create the advertisement
        console.log("Group created successfully:", newGroup);

        createAdvertisementMutation.mutate(
          {
            groupId: newGroup.id,
            isActive: true,
          },
          {
            onSuccess: (newAdvertisement: {
              id: number;
              groupId: number;
              isActive: boolean;
              createdAt: Date;
              updatedAt: Date;
            }) => {
              console.log(
                "Advertisement created successfully:",
                newAdvertisement
              );
              toast.success(`Group and advertisement created successfully.`, {
                id: context?.loadingToast,
              });
            },
            onError: (error: TRPCClientErrorLike<AppRouter>) => {
              console.error("Failed to create advertisement:", error);
              toast.error("Group created but failed to create advertisement.", {
                id: context?.loadingToast,
              });
            },
          }
        );
      },
      onError: (err, newGroup, context) => {
        if (context?.previousGroups) {
          queryClient.setQueryData(groupsQueryKey, context.previousGroups);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to create group and advertisement. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: groupsQueryKey });
        queryClient.invalidateQueries({ queryKey: advertisementsQueryKey });
        queryClient.invalidateQueries({ queryKey: trpc.groups.getGroupsWithAdvertisements.queryKey() });
      },
    })
  );

  const updateAdvertisementMutation = useMutation(
    trpc.advertisements.updateAdvertisement.mutationOptions({
      onMutate: async (updatedAdvertisement) => {
        // Show loading toast
        const loadingToast = toast.loading(`Updating advertisement...`);

        await queryClient.cancelQueries({ queryKey: advertisementsQueryKey });
        const previousAdvertisements = queryClient.getQueryData(
          advertisementsQueryKey
        );
        queryClient.setQueryData(advertisementsQueryKey, (oldData) => {
          return (
            oldData?.map((advertisement) =>
              advertisement.id === updatedAdvertisement.id
                ? {
                    ...advertisement,
                    ...(updatedAdvertisement.groupId !== undefined && {
                      groupId: updatedAdvertisement.groupId,
                    }),
                    ...(updatedAdvertisement.isActive !== undefined && {
                      isActive: updatedAdvertisement.isActive,
                    }),
                    updatedAt: new Date(),
                  }
                : advertisement
            ) ?? []
          );
        });
        return { previousAdvertisements, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(`Advertisement has been updated successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, updatedAdvertisement, context) => {
        if (context?.previousAdvertisements) {
          queryClient.setQueryData(
            advertisementsQueryKey,
            context.previousAdvertisements
          );
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to update advertisement. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: advertisementsQueryKey });
      },
    })
  );

  const deleteAdvertisementMutation = useMutation(
    trpc.advertisements.deleteAdvertisement.mutationOptions({
      onMutate: async (deletedAdvertisement) => {
        await queryClient.cancelQueries({ queryKey: advertisementsQueryKey });
        const previousAdvertisements = queryClient.getQueryData(
          advertisementsQueryKey
        );

        // Show loading toast
        const loadingToast = toast.loading(`Deleting advertisement...`);

        queryClient.setQueryData(
          advertisementsQueryKey,
          (oldData) =>
            oldData?.filter((a) => a.id !== deletedAdvertisement.id) ?? []
        );
        return {
          previousAdvertisements,
          loadingToast,
        };
      },
      onSuccess: (data, variables, context) => {
        if (data && data.success === false) {
          toast.error("Failed to delete advertisement. Please try again.", {
            id: context?.loadingToast,
          });
          return;
        }
        toast.success(`Advertisement has been deleted successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, deletedAdvertisement, context) => {
        if (context?.previousAdvertisements) {
          queryClient.setQueryData(
            advertisementsQueryKey,
            context.previousAdvertisements
          );
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to delete advertisement. Please try again.");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: advertisementsQueryKey });
      },
    })
  );

  return {
    advertisements: advertisementsQuery.data,
    advertisementsQuery,
    createAdvertisementWithGroupMutation,
    createAdvertisementMutation,
    updateAdvertisementMutation,
    deleteAdvertisementMutation,
  };
}
