import { api } from ".";

const organizationApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
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
  }),
});

export const { useGetOrgsQuery, useCreateOrgMutation } = organizationApi;
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
  id: string;
  name: string;
  description: string | null;
  role: "admin" | "editor" | "viewer";
}[];
