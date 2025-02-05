import { api } from "..";
import type { ImageType } from "../catalogueApi";

export const catalogueApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Fetch catalogues with cursor-based pagination
    getCatalogues: builder.query<CatalogueResponse, PaginationParams>({
      query: ({ page, limit = 10, sortDir = "desc" }) => ({
        url: "/v2/catalogue/",
        params: { page, limit, sortDir },
      }),
    }),
    // Search catalogues by name and description
    searchCatalogues: builder.query<CatalogueResponse, SearchCatalogueParams>({
      query: ({ query, page, limit = 10, sortDir }) => ({
        url: "/v2/catalogue/search",
        params: { query, sortDir, limit, page },
      }),
    }),
    getCatalogItems: builder.query<
      GetCatalogItems,
      {
        id: string;
        page: number;
        limit: number;
        sortDir: "asc" | "desc";
        priceSort: "asc" | "desc";
      }
    >({
      query: ({ id, page, limit, sortDir, priceSort }) => ({
        url: `/v2/catalogue/${id}`,
        params: { page, limit, sortDir, priceSort },
      }),
    }),
    searchCatalogItems: builder.query<
      GetCatalogItems,
      {
        id: string;
        page: number;
        limit: number;
        sortDir: "asc" | "desc";
        priceSort: "asc" | "desc";
        query: string;
      }
    >({
      query: ({ id, page, limit, sortDir, priceSort, query }) => ({
        url: `/v2/catalogue/${id}/search`,
        params: { page, limit, sortDir, priceSort, query },
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCataloguesQuery,
  useSearchCataloguesQuery,
  useGetCatalogItemsQuery,
  useSearchCatalogItemsQuery,
} = catalogueApi;

// Define types for query arguments and responses
interface PaginationParams {
  page: number;
  limit: number;
  sortDir: "asc" | "desc";
}

interface Catalogue {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  images: ImageType[];
}

interface CatalogueResponse {
  data: Catalogue[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

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
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

interface SearchCatalogueParams extends PaginationParams {
  query?: string;
}
