import { api } from ".";
import { changeState, clearState } from "../hello";
import { clearOrganizationId } from "../organizationId";

const authApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginArg>({
      query: ({ name, email, idToken }) => ({
        url: "/auth/login",
        method: "POST",
        body: { name, email, idToken },
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
  }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshQuery } = authApi;
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
type LoginArg = { name: string; email: string; idToken: string };
