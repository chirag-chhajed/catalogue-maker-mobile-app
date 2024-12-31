import { api } from ".";

const invitationApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getInvitations: builder.query<
      {
        expiresAt: boolean;
        role: "editor" | "viewer";
        status: "active" | "accepted" | "rejected";
        inviteCode: string;
        id: string;
        organizationId: string;
        createdBy: string;
      }[],
      void
    >({
      query: () => "/invitation",
      providesTags: ["Invitation"],
    }),
    createInvitation: builder.mutation<
      { inviteCode: string },
      { role: "editor" | "viewer" }
    >({
      query: ({ role }) => ({
        method: "POST",
        url: "/invitation/create",
        body: { role },
      }),
      invalidatesTags: ["Invitation"],
    }),
    inviteStatus: builder.mutation<
      {
        organizationName: string;
        organizationId: string;
        role: "editor" | "viewer";
        inviteCode: string;
      },
      { inviteCode: string }
    >({
      query: ({ inviteCode }) => ({
        method: "POST",
        url: "/invitation/invite-status",
        body: { inviteCode },
      }),
    }),
    acceptInvite: builder.mutation<
      void,
      {
        inviteCode: string;
        joining: boolean;
      }
    >({
      query: ({ inviteCode, joining }) => ({
        method: "POST",
        url: "/invitation/join",
        body: { inviteCode, joining },
      }),
      invalidatesTags: ["Invitation"],
    }),
  }),
});

export const {
  useCreateInvitationMutation,
  useGetInvitationsQuery,
  useInviteStatusMutation,
  useAcceptInviteMutation,
} = invitationApi;
