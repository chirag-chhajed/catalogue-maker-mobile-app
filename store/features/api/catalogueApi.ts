import { api } from ".";
import { catalogueApiV2 } from "./v2/catalogueApiV2";

export const catalogueApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    createCatalog: builder.mutation<
      {
        name: string;
        description: string | null;
        id: string;
        organizationId: string;
        createdAt: Date;
      },
      CreateOrgArg
    >({
      query: ({ name, description }) => ({
        method: "POST",
        url: "/catalogue/create",
        body: { name, description },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: newCatalogue } = await queryFulfilled;

          // Update getCatalogues cache
          dispatch(
            catalogueApiV2.util.updateQueryData(
              "getCatalogues",
              { page: 1, limit: 10, sortDir: "desc" },
              (draft) => {
                draft.data.unshift({
                  id: newCatalogue.id,
                  name: newCatalogue.name,
                  description: newCatalogue.description || "",
                  createdAt: new Date(newCatalogue.createdAt).toISOString(),
                  images: [],
                });
              },
            ),
          );
        } catch {}
      },
    }),
    deleteCatalog: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        method: "DELETE",
        url: `/catalogue/${id}`,
      }),
    }),
    updateCatalog: builder.mutation<
      {
        id: string;
        name: string;
        description: string | null;
        organizationId: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      CreateOrgArg & { id: string }
    >({
      query: ({ name, description, id }) => ({
        method: "PUT",
        url: `/catalogue/${id}`,
        body: { name, description },
      }),
    }),
    createCatalogItem: builder.mutation<
      {
        images: {
          id: string;
          organizationId: string;
          createdAt: Date;
          deletedAt: Date | null;
          imageUrl: string;
          blurhash: string | null;
          itemId: string;
        }[];
        name: string;
        description: string | null;
        id: string;
        price: number;
        catalogueId: string;
        organizationId: string;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      { id: string; formData: FormData }
    >({
      query: ({ formData, id }) => ({
        method: "POST",
        url: `/catalogue/${id}/create-item`,
        body: formData,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data: newItem } = await queryFulfilled;

          // Update getCatalogItems cache
          dispatch(
            catalogueApiV2.util.updateQueryData(
              "getCatalogItems",
              { id, page: 1, limit: 10, sortDir: "desc", priceSort: "asc" },
              (draft) => {
                draft.items.unshift({
                  id: newItem.id,
                  name: newItem.name,
                  description: newItem.description,
                  price: String(newItem.price),
                  images: newItem.images.map((img) => ({
                    id: img.id,
                    imageUrl: img.imageUrl,
                    blurhash: img.blurhash,
                  })),
                  createdAt: newItem.createdAt,
                });
              },
            ),
          );
        } catch {}
      },
    }),
    updateCatalogItem: builder.mutation<
      {
        id: string;
        catalogueId: string;
        organizationId: string;
        name: string;
        description: string | null;
        price: string | null;
        metadata: unknown;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
      },
      {
        id: string;
        name: string;
        description: string;
        price: number;
        catalogueId: string;
      }
    >({
      query: ({ id, ...args }) => ({
        method: "PUT",
        url: `/catalogue/items/${id}`,
        body: args,
      }),
    }),
    deleteCatalogItem: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        method: "DELETE",
        url: `/catalogue/delete-item/${id}`,
      }),
    }),
  }),
});

export const {
  useCreateCatalogItemMutation,
  useCreateCatalogMutation,
  useDeleteCatalogItemMutation,
  useDeleteCatalogMutation,
  useUpdateCatalogItemMutation,
  useUpdateCatalogMutation,
} = catalogueApi;
type CreateOrgArg = {
  name: string;
  description?: string;
};

export type ImageType = {
  id: string;
  imageUrl: string;
  blurhash: string | null;
};
