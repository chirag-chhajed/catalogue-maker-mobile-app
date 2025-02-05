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

const baseUrl = "https://605l6z6z-3434.inc1.devtunnels.ms/api";
const baseQuery = fetchBaseQuery({
  baseUrl,
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
  const organizationId = (api.getState() as RootState).orgId.organizationId;
  if (result.error?.status === 403) {
    const refreshResult = (await baseQuery(
      `/auth/refresh?organizationId=${organizationId}`,
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
  tagTypes: ["Organization", "Catalogue", "Item", "Invitation"],
  endpoints: (builder) => ({}),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});

type BasePayload = {
  id: string;
  email: string;
  name: string;
};

export type ImageType = {
  id: string;
  imageUrl: string;
  blurhash: string | null;
};
