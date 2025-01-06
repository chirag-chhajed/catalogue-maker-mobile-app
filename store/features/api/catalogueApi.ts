import { api } from ".";

export const catalogueApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    createCatalog: builder.mutation<void, CreateOrgArg>({
      query: ({ name, description }) => ({
        method: "POST",
        url: "/catalogue/create",
        body: { name, description },
      }),
      invalidatesTags: ["Catalogue"],
    }),
    getCatalog: builder.query<GetCatalogues, void>({
      query: () => "/catalogue/",
      providesTags: ["Catalogue"],
    }),
    getCatalogItems: builder.query<GetCatalogItems, { id: string }>({
      query: ({ id }) => `/catalogue/${id}`,
      providesTags: ["Item"],
    }),
    deleteCatalog: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        method: "DELETE",
        url: `/catalogue/${id}`,
      }),
      invalidatesTags: ["Catalogue"],
    }),
    updateCatalog: builder.mutation<void, CreateOrgArg & { id: string }>({
      query: ({ name, description, id }) => ({
        method: "PUT",
        url: `/catalogue/${id}`,
        body: {
          name,
          description,
        },
      }),
      invalidatesTags: ["Catalogue"],
    }),
    createCatalogItem: builder.mutation<
      void,
      { id: string; formData: FormData }
    >({
      query: ({ formData, id }) => ({
        method: "POST",
        url: `/catalogue/${id}/create-item`,
        body: formData,
      }),
      invalidatesTags: ["Item"],
    }),
    updateCatalogItem: builder.mutation<
      void,
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
      invalidatesTags: ["Item"],
    }),
    deleteCatalogItem: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        method: "DELETE",
        url: `/catalogue/delete-item/${id}`,
      }),
      invalidatesTags: ["Item"],
    }),
  }),
});

export const {
  useCreateCatalogItemMutation,
  useCreateCatalogMutation,
  useDeleteCatalogItemMutation,
  useDeleteCatalogMutation,
  useGetCatalogItemsQuery,
  useGetCatalogQuery,
  useUpdateCatalogItemMutation,
  useUpdateCatalogMutation,
} = catalogueApi;
type CreateOrgArg = {
  name: string;
  description?: string;
};
type GetCatalogues = {
  name: string;
  description: string | null;
  organizationId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deletedAt: Date | null;
}[];
export type ImageType = {
  id: string;
  imageUrl: string;
  blurhash: string | null;
};
type GetCatalogItems = {
  catalogueDetail: {
    description: string | null;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    organizationId: string;
    deletedAt: Date | null;
  };
  items: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    images: ImageType[];
    createdAt: Date;
  }[];
};
