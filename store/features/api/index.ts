import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { changeState, clearState } from "../hello";

import type { RootState } from "~/store/store";

export type BasePayload = {
  id: number;
  email: string;
  name: string;
};

export type OrgPayload = {
  organizationId: number;
  role: "admin" | "editor" | "viewer";
};

type RefreshArgs = {
  organizationId?: number;
};

type LoginResponse = {
  accessToken: string;
  user: BasePayload;
};
type LoginArg = { name: string; email: string };
type CreateOrgResponse = {
  description: string | null;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
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
  organizationId: number;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
  deletedAt: Date | null;
}[];
export type ImageType = {
  id: number;
  imageUrl: string;
  blurhash: string | null;
};
type GetCatalogItems = {
  catalogueDetail: {
    description: string | null;
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
    organizationId: number;
    deletedAt: Date | null;
  };
  items: {
    id: number;
    name: string;
    description: string | null;
    price: string | null;
    images: ImageType[];
  }[];
};

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
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            changeState({ accessToken: data.accessToken, user: data.user }),
          );
        } catch (error) {}
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
    getCatalogItems: builder.query<GetCatalogItems, { id: number }>({
      query: ({ id }) => `/catalogue/${id}`,
      providesTags: ["Item"],
    }),
    createCatalogItem: builder.mutation<
      void,
      { id: number; formData: FormData }
    >({
      query: ({ formData, id }) => ({
        method: "POST",
        url: `/catalogue/${id}/create-item`,
        body: formData,
      }),
      invalidatesTags: ["Item"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshQuery,
  useCreateOrgMutation,
  useGetOrgsQuery,
  useCreateCatalogMutation,
  useGetCatalogQuery,
  useGetCatalogItemsQuery,
  useCreateCatalogItemMutation,
} = api;
