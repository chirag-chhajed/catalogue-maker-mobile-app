import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { changeState, clearState } from "../hello";
import { clearOrganizationId } from "../organizationId";

import type { RootState } from "~/store/store";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://605l6z6z-3434.inc1.devtunnels.ms/api",
  credentials: "include",
  prepareHeaders(headers, api) {
    const token = (api.getState() as RootState).hello.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If the request failed due to an expired token,
  // refresh the token and retry the request.

  if (result.error?.status === 403) {
    const refreshResult = (await baseQuery(
      "/auth/refresh",
      api,
      extraOptions,
    )) as {
      data: { accessToken: string; user: BasePayload } | undefined;
      error?: FetchBaseQueryError;
    };

    if (refreshResult.data) {
      api.dispatch(
        changeState({
          accessToken: refreshResult.data.accessToken,
          user: refreshResult.data.user,
        }),
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearState());
      api.dispatch(clearOrganizationId());
    }
  }
  return result;
};
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Organization", "Catalogue", "Item"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginArg>({
      query: ({ name, email }) => ({
        url: "/auth/login",
        method: "POST",
        body: { name, email },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            changeState({ accessToken: data.accessToken, user: data.user }),
          );
        } catch (error) {}
      },
    }),
    refresh: builder.query<LoginResponse, RefreshArgs>({
      query: ({ organizationId }) => ({
        url: "/auth/refresh",
        params: { organizationId },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            changeState({ accessToken: data.accessToken, user: data.user }),
          );
        } catch (error) {}
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      // Clear tokens on successful logout
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearState());
          dispatch(clearOrganizationId());
        } catch {
          dispatch(clearState());
          dispatch(clearOrganizationId());
        }
      },
    }),
    createOrg: builder.mutation<CreateOrgResponse, CreateOrgArg>({
      query: ({ name, description }) => ({
        method: "POST",
        url: "/organization/create",
        body: { name, description },
      }),
      invalidatesTags: ["Organization"],
    }),
    getOrgs: builder.query<GetOrgResponse, void>({
      query: () => "/organization/organizations",
      providesTags: ["Organization"],
    }),
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
  useLoginMutation,
  useRefreshQuery,
  useLogoutMutation,
  useCreateOrgMutation,
  useGetOrgsQuery,
  useCreateCatalogMutation,
  useGetCatalogQuery,
  useGetCatalogItemsQuery,
  useCreateCatalogItemMutation,
  useDeleteCatalogMutation,
  useUpdateCatalogMutation,
  useUpdateCatalogItemMutation,
  useDeleteCatalogItemMutation,
} = api;

export type BasePayload = {
  id: string;
  email: string;
  name: string;
};

export type OrgPayload = {
  organizationId: string;
  role: "admin" | "editor" | "viewer";
};

type RefreshArgs = {
  organizationId?: string;
};

type LoginResponse = {
  accessToken: string;
  user: BasePayload;
};
type LoginArg = { name: string; email: string };
type CreateOrgResponse = {
  description: string | null;
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};
type CreateOrgArg = {
  name: string;
  description?: string;
};
type GetOrgResponse = {
  id: number;
  name: string;
  description: string | null;
  role: "admin" | "editor" | "viewer";
}[];

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
  [x: string]: any;
  url: any;
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
    price: string | null;
    images: ImageType[];
  }[];
};
