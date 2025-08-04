import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client/client";
import { toast } from "sonner";
import { useAsyncErrorHandler } from "@/components/Error/ErrorProvider";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/trpc/server";
import { createInvalidators } from "@/trpc/client/utils";

export function useProducts() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const invalidators = createInvalidators(queryClient, trpc);
  const productsQueryKey = trpc.products.getAllProducts.queryKey();
  const groupsQueryKey = trpc.groups.getNestedGroups.queryKey();
  const handleAsyncError = useAsyncErrorHandler();

  const productsQuery = useQuery(
    trpc.products.getAllProducts.queryOptions(undefined, {
      refetchOnWindowFocus: false,
    })
  );

  const createProductMutation = useMutation(
    trpc.products.createProduct.mutationOptions({
      onMutate: async (newProduct) => {
        // Show loading toast
        const loadingToast = toast.loading(`Creating product for group...`);

        await queryClient.cancelQueries({ queryKey: productsQueryKey });
        const previousProducts = queryClient.getQueryData(productsQueryKey);
        queryClient.setQueryData(productsQueryKey, (oldData) => {
          const optimisticNewProduct = {
            id: Date.now(),
            groupId: newProduct.groupId,
            isActive: newProduct.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return [...(oldData ?? []), optimisticNewProduct];
        });
        return { previousProducts, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(`Product has been created successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, newProduct, context) => {
        if (context?.previousProducts) {
          queryClient.setQueryData(productsQueryKey, context.previousProducts);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to create product. Please try again.");
      },
      onSettled: async () => {
        await invalidators.productsCluster();
      },
    })
  );

  const createProductWithGroupMutation = useMutation(
    trpc.groups.createGroup.mutationOptions({
      onMutate: async (newGroup) => {
        // Show loading toast
        const loadingToast = toast.loading(`Creating group and product...`);

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
        // After group is created, create the product
        console.log("Group created successfully:", newGroup);

        createProductMutation.mutate(
          {
            groupId: newGroup.id,
            isActive: true,
          },
          {
            onSuccess: (newProduct: {
              id: number;
              groupId: number;
              isActive: boolean;
              createdAt: Date;
              updatedAt: Date;
            }) => {
              console.log("Product created successfully:", newProduct);
              toast.success(`Group and product created successfully.`, {
                id: context?.loadingToast,
              });
            },
            onError: (error: TRPCClientErrorLike<AppRouter>) => {
              console.error("Failed to create product:", error);
              toast.error("Group created but failed to create product.", {
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
        }, "Failed to create group and product. Please try again.");
      },
      onSettled: async () => {
        await invalidators.productsCluster();
      },
    })
  );

  const updateProductMutation = useMutation(
    trpc.products.updateProduct.mutationOptions({
      onMutate: async (updatedProduct) => {
        // Show loading toast
        const loadingToast = toast.loading(`Updating product...`);

        await queryClient.cancelQueries({ queryKey: productsQueryKey });
        const previousProducts = queryClient.getQueryData(productsQueryKey);
        queryClient.setQueryData(productsQueryKey, (oldData) => {
          return (
            oldData?.map((product) =>
              product.id === updatedProduct.id
                ? {
                    ...product,
                    ...(updatedProduct.groupId !== undefined && {
                      groupId: updatedProduct.groupId,
                    }),
                    ...(updatedProduct.isActive !== undefined && {
                      isActive: updatedProduct.isActive,
                    }),
                    updatedAt: new Date(),
                  }
                : product
            ) ?? []
          );
        });
        return { previousProducts, loadingToast };
      },
      onSuccess: (data, variables, context) => {
        toast.success(`Product has been updated successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, updatedProduct, context) => {
        if (context?.previousProducts) {
          queryClient.setQueryData(productsQueryKey, context.previousProducts);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to update product. Please try again.");
      },
      onSettled: async () => {
        await invalidators.productsCluster();
      },
    })
  );

  const deleteProductMutation = useMutation(
    trpc.products.deleteProduct.mutationOptions({
      onMutate: async (deletedProduct) => {
        await queryClient.cancelQueries({ queryKey: productsQueryKey });
        const previousProducts = queryClient.getQueryData(productsQueryKey);

        // Show loading toast
        const loadingToast = toast.loading(`Deleting product...`);

        queryClient.setQueryData(
          productsQueryKey,
          (oldData) => oldData?.filter((p) => p.id !== deletedProduct.id) ?? []
        );
        return {
          previousProducts,
          loadingToast,
        };
      },
      onSuccess: (data, variables, context) => {
        if (data && data.success === false) {
          toast.error("Failed to delete product. Please try again.", {
            id: context?.loadingToast,
          });
          return;
        }
        toast.success(`Product has been deleted successfully.`, {
          id: context?.loadingToast,
        });
      },
      onError: (err, deletedProduct, context) => {
        if (context?.previousProducts) {
          queryClient.setQueryData(productsQueryKey, context.previousProducts);
        }
        handleAsyncError(() => {
          throw err;
        }, "Failed to delete product. Please try again.");
      },
      onSettled: async () => {
        await invalidators.productsCluster();
      },
    })
  );

  return {
    products: productsQuery.data,
    productsQuery,
    createProductWithGroupMutation,
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
}
