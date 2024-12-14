import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { changeState } from "../hello";

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
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://605l6z6z-3434.inc1.devtunnels.ms/api",
    credentials: "include",
    prepareHeaders(headers, api) {
      const token = (api.getState() as RootState).hello.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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
      invalidatesTags: ["organizations"],
    }),
    getOrgs: builder.query<GetOrgResponse, void>({
      query: () => "/organizations",
      providesTags: () => ["organizations"],
    }),
  }),
  tagTypes: ["organizations"],
});

export const {
  useLoginMutation,
  useRefreshQuery,
  useCreateOrgMutation,
  useGetOrgsQuery,
} = api;
