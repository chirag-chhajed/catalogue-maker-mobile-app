import { api } from ".";
import { changeState, clearState } from "../hello";
import { clearOrganizationId } from "../organizationId";

const newApis = api.injectEndpoints({
  endpoints: (build) => ({
    postApiV1AuthLogin: build.mutation<
      PostApiV1AuthLoginApiResponse,
      PostApiV1AuthLoginApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/login`,
        method: "POST",
        body: queryArg.body,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            changeState({ accessToken: data.accessToken, user: data.user }),
          );
        } catch (error) { }
      },
    }),
    getApiV1AuthRefresh: build.query<
      GetApiV1AuthRefreshApiResponse,
      GetApiV1AuthRefreshApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/refresh`,
        params: {
          organizationId: queryArg.organizationId,
        },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            changeState({ accessToken: data.accessToken, user: data.user }),
          );
        } catch (error) { }
      },
    }),
    postApiV1AuthLogout: build.mutation<
      PostApiV1AuthLogoutApiResponse,
      PostApiV1AuthLogoutApiArg
    >({
      query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
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
    getApiV1Invitation: build.query<
      GetApiV1InvitationApiResponse,
      GetApiV1InvitationApiArg
    >({
      query: () => ({ url: `/api/v1/invitation` }),
    }),
    postApiV1InvitationAccept: build.mutation<
      PostApiV1InvitationAcceptApiResponse,
      PostApiV1InvitationAcceptApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/invitation/accept`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    postApiV1Invitation: build.mutation<
      PostApiV1InvitationApiResponse,
      PostApiV1InvitationApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/invitation`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getApiV1Organisation: build.query<
      GetApiV1OrganisationApiResponse,
      GetApiV1OrganisationApiArg
    >({
      query: () => ({ url: `/api/v1/organisation` }),
    }),
    postApiV1Organisation: build.mutation<
      PostApiV1OrganisationApiResponse,
      PostApiV1OrganisationApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organisation`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getApiV1OrganisationUsers: build.query<
      GetApiV1OrganisationUsersApiResponse,
      void
    >({
      query: () => ({ url: `/api/v1/organisation/users` }),
    }),
    deleteApiV1OrganisationRemoveUserByUserId: build.mutation<
      DeleteApiV1OrganisationRemoveUserByUserIdApiResponse,
      DeleteApiV1OrganisationRemoveUserByUserIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/organisation/remove-user/${queryArg.userId}`,
        method: "DELETE",
      }),
    }),
    postApiV1Catalogue: build.mutation<
      PostApiV1CatalogueApiResponse,
      PostApiV1CatalogueApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getApiV1Catalogue: build.infiniteQuery<
      GetApiV1CatalogueApiResponse,
      GetApiV1CatalogueApiArg,
      { cursor?: string }
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/api/v1/catalogue`,
        params: {
          cursor: pageParam.cursor,
          order: queryArg.order,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: {},
        getNextPageParam: (lastPage) => {
          if (!lastPage.nextCursor) return undefined;
          return { cursor: lastPage.nextCursor };
        },
      },
    }),
    postApiV1CatalogueByCatalogueId: build.mutation<
      PostApiV1CatalogueByCatalogueIdApiResponse,
      PostApiV1CatalogueByCatalogueIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}`,
        method: "POST",
        body: queryArg.body,
        params: {
          name: queryArg.name,
          description: queryArg.description,
          price: queryArg.price,
        },
      }),
    }),
    getApiV1CatalogueByCatalogueId: build.infiniteQuery<
      GetApiV1CatalogueByCatalogueIdApiResponse,
      Omit<GetApiV1CatalogueByCatalogueIdApiArg, "cursor">,
      { cursor?: string }
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}`,
        params: {
          cursor: pageParam.cursor,
          ...(queryArg.order && { order: queryArg.order }),
          ...(queryArg.priceSort && { priceSort: queryArg.priceSort }),
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: {},
        getNextPageParam: (lastPage) => {
          if (!lastPage.nextCursor) return undefined;
          return { cursor: lastPage.nextCursor };
        },
      },
    }),
    putApiV1CatalogueByCatalogueId: build.mutation<
      PutApiV1CatalogueByCatalogueIdApiResponse,
      PutApiV1CatalogueByCatalogueIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
    deleteApiV1CatalogueByCatalogueId: build.mutation<
      DeleteApiV1CatalogueByCatalogueIdApiResponse,
      DeleteApiV1CatalogueByCatalogueIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}`,
        method: "DELETE",
      }),
    }),
    getApiV1CatalogueByCatalogueIdAndItemId: build.query<
      GetApiV1CatalogueByCatalogueIdAndItemIdApiResponse,
      GetApiV1CatalogueByCatalogueIdAndItemIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}/${queryArg.itemId}`,
      }),
    }),
    getApiV1CatalogueAll: build.infiniteQuery<
      GetApiV1CatalogueAllApiResponse,
      Omit<GetApiV1CatalogueAllApiArg, "cursor">,
      { cursor?: string }
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/api/v1/catalogue/all`,
        params: {
          cursor: pageParam.cursor,
          ...(queryArg.order && { order: queryArg.order }),
          ...(queryArg.priceSort && { priceSort: queryArg.priceSort }),
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: {},
        getNextPageParam: (lastPage) => {
          if (!lastPage.nextCursor) return undefined;
          return { cursor: lastPage.nextCursor };
        },
      },
    }),
    postApiV1CatalogueBulkUpdatePrices: build.mutation<
      PostApiV1CatalogueBulkUpdatePricesApiResponse,
      PostApiV1CatalogueBulkUpdatePricesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/bulk-update-prices`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    postApiV1CatalogueBulkTransferItems: build.mutation<
      PostApiV1CatalogueBulkTransferItemsApiResponse,
      PostApiV1CatalogueBulkTransferItemsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/bulk-transfer-items`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    deleteApiV1CatalogueBulkDeleteItems: build.mutation<
      DeleteApiV1CatalogueBulkDeleteItemsApiResponse,
      DeleteApiV1CatalogueBulkDeleteItemsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/bulk-delete-items`,
        method: "DELETE",
        body: queryArg.body,
      }),
    }),
    putApiV1CatalogueByCatalogueIdAndItemId: build.mutation<
      PutApiV1CatalogueByCatalogueIdAndItemIdApiResponse,
      PutApiV1CatalogueByCatalogueIdAndItemIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}/${queryArg.itemId}`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
    deleteApiV1CatalogueByCatalogueIdAndItemId: build.mutation<
      DeleteApiV1CatalogueByCatalogueIdAndItemIdApiResponse,
      DeleteApiV1CatalogueByCatalogueIdAndItemIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/${queryArg.catalogueId}/${queryArg.itemId}`,
        method: "DELETE",
      }),
    }),
    getApiV1CatalogueSearchItemsByCatalogueId: build.query<
      GetApiV1CatalogueSearchItemsByCatalogueIdApiResponse,
      GetApiV1CatalogueSearchItemsByCatalogueIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/search-items/${queryArg.catalogueId}`,
        params: {
          search: queryArg.search,
        },
      }),
    }),
    getApiV1CatalogueSearchItems: build.query<
      GetApiV1CatalogueSearchItemsApiResponse,
      GetApiV1CatalogueSearchItemsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/search-items`,
        params: {
          search: queryArg.search,
        },
      }),
    }),
    getApiV1CatalogueSearch: build.query<
      GetApiV1CatalogueSearchApiResponse,
      GetApiV1CatalogueSearchApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/catalogue/search`,
        params: {
          search: queryArg.search,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { newApis };
export type PostApiV1AuthLoginApiResponse =
  /** status 200 Successful login response */
  | {
    accessToken: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }
  | /** status 204 User already exists */ {
    success: false;
    message: string;
  };
export type PostApiV1AuthLoginApiArg = {
  body: {
    name: string;
    email: string;
    idToken: string;
  };
};
export type GetApiV1AuthRefreshApiResponse =
  /** status 200 Token refresh successful */ {
  accessToken: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};
export type GetApiV1AuthRefreshApiArg = {
  organizationId?: string;
};
export type PostApiV1AuthLogoutApiResponse =
  /** status 200 Successfully logged out */ {
  success: boolean;
  message: string;
};
export type PostApiV1AuthLogoutApiArg = void;
export type GetApiV1OrganisationApiResponse =
  /** status 200 Organisation details */ {
  orgId: string;
  name: string;
  description?: string;
  role: string;
}[];
export type GetApiV1OrganisationApiArg = void;
export type PostApiV1OrganisationApiResponse =
  /** status 201 Organisation created successfully */ {
  message: string;
};
export type PostApiV1OrganisationApiArg = {
  body: {
    name: string;
    description?: string;
  };
};
export type DeleteApiV1OrganisationRemoveUserByUserIdApiResponse = unknown;
export type DeleteApiV1OrganisationRemoveUserByUserIdApiArg = {
  userId: string;
};
export type PostApiV1CatalogueApiResponse =
  /** status 201 Catalogue created successfully */ {
  catalogueId: string;
  orgId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};
export type PostApiV1CatalogueApiArg = {
  body: {
    name: string;
    description?: string;
  };
};
export type GetApiV1CatalogueApiResponse =
  /** status 200 List of catalogues retrieved successfully */ {
  items: {
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    images: {
      imageUrl: string;
      blurhash?: string;
      imageId: string;
      catalogueId: string;
      itemId: string;
    }[];
  }[];
  nextCursor: string | null;
};
export type GetApiV1CatalogueApiArg = {
  cursor?: string;
  order?: "asc" | "desc";
};
export type PostApiV1CatalogueByCatalogueIdApiResponse =
  /** status 201 Catalogue item created successfully */ {
  message: string;
};
export type PostApiV1CatalogueByCatalogueIdApiArg = {
  catalogueId: string;
  name: string;
  description?: string;
  price: number;
  body: FormData;
};
export type GetApiV1CatalogueByCatalogueIdApiResponse =
  /** status 200 Catalogue items retrieved successfully */ {
  items: {
    itemId: string;
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    price: number;
    metadata?: unknown | null;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    image: {
      imageUrl: string;
      blurhash?: string;
      uploadedAt?: number;
    };
  }[];
  nextCursor: string | null;
};
export type GetApiV1CatalogueByCatalogueIdApiArg = {
  catalogueId: string;
  cursor?: string;
  order?: "asc" | "desc";
  priceSort?: "asc" | "desc";
};
export type PutApiV1CatalogueByCatalogueIdApiResponse =
  /** status 200 Catalogue updated successfully */ {
  message: string;
};
export type PutApiV1CatalogueByCatalogueIdApiArg = {
  catalogueId: string;
  body: {
    name: string;
    description?: string;
  };
};
export type DeleteApiV1CatalogueByCatalogueIdApiResponse = unknown;
export type DeleteApiV1CatalogueByCatalogueIdApiArg = {
  catalogueId: string;
};
export type GetApiV1CatalogueAllApiResponse =
  /** status 200 All items retrieved successfully */ {
  items: {
    itemId: string;
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    price: number;
    metadata?: any | null;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    image: {
      imageUrl: string;
      blurhash?: string;
      uploadedAt?: number;
    };
  }[];
  nextCursor: string | null;
};
export type GetApiV1CatalogueAllApiArg = {
  cursor?: string;
  order?: "asc" | "desc";
  priceSort?: "asc" | "desc";
};
export type PostApiV1CatalogueBulkUpdatePricesApiResponse =
  /** status 200 Prices updated successfully */ {
  message: string;
};
export type PostApiV1CatalogueBulkUpdatePricesApiArg = {
  body: {
    items: {
      catalogueId: string;
      itemId: string;
    }[];
    operation: "clone" | "update";
    value: number;
    mode: "absolute" | "percentage";
    direction: "increase" | "decrease";
    newCatalogueId?: string;
  };
};
export type PostApiV1CatalogueBulkTransferItemsApiResponse =
  /** status 200 Items transferred successfully */ {
  message: string;
};
export type PostApiV1CatalogueBulkTransferItemsApiArg = {
  body: {
    items: {
      catalogueId: string;
      itemId: string;
    }[];
    newCatalogueId?: string;
    operation: "clone" | "transfer";
  };
};
export type DeleteApiV1CatalogueBulkDeleteItemsApiResponse =
  /** status 200 Items deleted successfully */ {
  message: string;
};
export type DeleteApiV1CatalogueBulkDeleteItemsApiArg = {
  body: {
    items: {
      catalogueId: string;
      itemId: string;
    }[];
  };
};
export type PutApiV1CatalogueByCatalogueIdAndItemIdApiResponse =
  /** status 200 Catalogue item updated successfully */ {
  message: string;
};
export type PutApiV1CatalogueByCatalogueIdAndItemIdApiArg = {
  catalogueId: string;
  itemId: string;
  body: {
    name: string;
    description?: string;
    price: number;
  };
};
export type DeleteApiV1CatalogueByCatalogueIdAndItemIdApiResponse = unknown;
export type DeleteApiV1CatalogueByCatalogueIdAndItemIdApiArg = {
  catalogueId: string;
  itemId: string;
};
export type GetApiV1CatalogueByCatalogueIdAndItemIdApiResponse =
  /** status 200 Catalogue item retrieved successfully */ {
  itemId: string;
  catalogueId: string;
  orgId: string;
  name: string;
  description?: string;
  price: number;
  metadata?: any | null;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  image: {
    imageUrl: string;
    blurhash?: string;
    uploadedAt?: number;
  };
};
export type GetApiV1CatalogueByCatalogueIdAndItemIdApiArg = {
  catalogueId: string;
  itemId: string;
};
export type GetApiV1CatalogueSearchItemsByCatalogueIdApiResponse =
  /** status 200 Catalogues searched successfully */ {
  items: {
    itemId: string;
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    price: number;
    metadata?: any | null;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    image: {
      imageUrl: string;
      blurhash?: string;
      uploadedAt?: number;
    };
  }[];
};
export type GetApiV1CatalogueSearchItemsByCatalogueIdApiArg = {
  catalogueId: string;
  search: string;
};
export type GetApiV1CatalogueSearchItemsApiResponse =
  /** status 200 Catalogues searched successfully */ {
  items: {
    itemId: string;
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    price: number;
    metadata?: any | null;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    image: {
      imageUrl: string;
      blurhash?: string;
      uploadedAt?: number;
    };
  }[];
};
export type GetApiV1CatalogueSearchItemsApiArg = {
  search: string;
};
export type GetApiV1CatalogueSearchApiResponse =
  /** status 200 Catalogues searched successfully */ {
  items: {
    catalogueId: string;
    orgId: string;
    name: string;
    description?: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
    images: {
      imageUrl: string;
      blurhash?: string;
      imageId: string;
      catalogueId: string;
      itemId: string;
    }[];
  }[];
};
export type GetApiV1CatalogueSearchApiArg = {
  search: string;
};
export type PostApiV1InvitationApiResponse = /** status 201 Invitation code */ {
  inviteCode: string;
};
export type PostApiV1InvitationApiArg = {
  body: {
    role: "admin" | "editor" | "viewer";
  };
};
export type GetApiV1InvitationApiResponse =
  /** status 200 Invitation details */ {
  code: string;
  role: string;
  createdBy: string;
  createdAt: number;
  expiresAt: number;
  usedBy?: string;
  usedAt?: number;
}[];
export type GetApiV1InvitationApiArg = void;
export type PostApiV1InvitationAcceptApiResponse =
  /** status 200 Invitation accepted */ {
  message: string;
};
export type PostApiV1InvitationAcceptApiArg = {
  body: {
    code: string;
  };
};
export type GetApiV1OrganisationUsersApiResponse = /** status 200 Users */ {
  name: string;
  userId: string;
  email: string;
  createdAt: number;
  updatedAt: number;
}[];
export const {
  usePostApiV1AuthLoginMutation,
  useGetApiV1AuthRefreshQuery,
  usePostApiV1AuthLogoutMutation,
  useGetApiV1OrganisationQuery,
  usePostApiV1OrganisationMutation,
  useDeleteApiV1OrganisationRemoveUserByUserIdMutation,
  usePostApiV1CatalogueMutation,
  useGetApiV1CatalogueAllInfiniteQuery,
  usePostApiV1CatalogueByCatalogueIdMutation,
  useGetApiV1CatalogueByCatalogueIdInfiniteQuery,
  usePutApiV1CatalogueByCatalogueIdMutation,
  useDeleteApiV1CatalogueByCatalogueIdMutation,
  useGetApiV1CatalogueInfiniteQuery,
  usePostApiV1CatalogueBulkUpdatePricesMutation,
  usePostApiV1CatalogueBulkTransferItemsMutation,
  useDeleteApiV1CatalogueBulkDeleteItemsMutation,
  usePutApiV1CatalogueByCatalogueIdAndItemIdMutation,
  useDeleteApiV1CatalogueByCatalogueIdAndItemIdMutation,
  useGetApiV1CatalogueSearchItemsByCatalogueIdQuery,
  useGetApiV1CatalogueSearchItemsQuery,
  useGetApiV1CatalogueSearchQuery,
  usePostApiV1InvitationMutation,
  useGetApiV1InvitationQuery,
  usePostApiV1InvitationAcceptMutation,
  useGetApiV1CatalogueByCatalogueIdAndItemIdQuery,
  useGetApiV1OrganisationUsersQuery,
} = newApis;
