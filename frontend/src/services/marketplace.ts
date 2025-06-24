import api from "./api";
import type {
  MarketplaceItem,
  MarketplaceCategory,
  MarketplaceReview,
  MarketplacePurchase,
  MarketplaceSearch,
} from "../types/marketplace";

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

export interface PublishItemRequest {
  title: string;
  description: string;
  category_id: number;
  item_type: "agent" | "template" | "workflow";
  item_data: any;
  price: number;
  tags?: string[];
  images?: string[];
  is_featured?: boolean;
}

export interface SearchRequest {
  query?: string;
  category_id?: number;
  item_type?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  tags?: string[];
  sort_by?: "price" | "rating" | "popularity" | "newest";
  sort_order?: "asc" | "desc";
  skip?: number;
  limit?: number;
}

export const marketplaceService = {
  // Browse Items
  async getItems(params?: {
    skip?: number;
    limit?: number;
    category_id?: number;
    item_type?: string;
    sort_by?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.category_id)
      queryParams.append("category_id", params.category_id.toString());
    if (params?.item_type) queryParams.append("item_type", params.item_type);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);

    const response = await api.get(`/marketplace/items?${queryParams}`);
    return response.data;
  },

  async getItem(id: number): Promise<MarketplaceItem> {
    const response = await api.get(`/marketplace/items/${id}`);
    return response.data;
  },

  async getFeaturedItems(limit?: number): Promise<MarketplaceItem[]> {
    const params = limit ? `?limit=${limit}` : "";
    const response = await api.get(`/marketplace/featured${params}`);
    return response.data;
  },

  // Categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    const response = await api.get("/marketplace/categories");
    return response.data;
  },

  // Search
  async search(searchParams: SearchRequest): Promise<MarketplaceSearch> {
    const queryParams = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/marketplace/search?${queryParams}`);
    return response.data;
  },

  // Purchase System
  async purchaseItem(
    itemId: number,
    paymentData?: any
  ): Promise<MarketplacePurchase> {
    const response = await api.post(
      `/marketplace/items/${itemId}/purchase`,
      paymentData || {}
    );
    return response.data;
  },

  async getMyPurchases(params?: {
    skip?: number;
    limit?: number;
    item_type?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.item_type) queryParams.append("item_type", params.item_type);

    const response = await api.get(`/marketplace/my-purchases?${queryParams}`);
    return response.data;
  },

  // Reviews System
  async getReviews(
    itemId: number,
    params?: {
      skip?: number;
      limit?: number;
      rating_filter?: number;
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.rating_filter)
      queryParams.append("rating_filter", params.rating_filter.toString());

    const response = await api.get(
      `/marketplace/items/${itemId}/reviews?${queryParams}`
    );
    return response.data;
  },

  async addReview(
    itemId: number,
    reviewData: CreateReviewRequest
  ): Promise<MarketplaceReview> {
    const response = await api.post(
      `/marketplace/items/${itemId}/reviews`,
      reviewData
    );
    return response.data;
  },

  // Seller Functions
  async publishItem(itemData: PublishItemRequest): Promise<MarketplaceItem> {
    const response = await api.post("/marketplace/publish", itemData);
    return response.data;
  },

  async getMyListings(params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const response = await api.get(`/marketplace/my-listings?${queryParams}`);
    return response.data;
  },

  async updateListing(itemId: number, updateData: Partial<PublishItemRequest>) {
    const response = await api.put(`/marketplace/items/${itemId}`, updateData);
    return response.data;
  },

  async deleteListing(itemId: number): Promise<void> {
    await api.delete(`/marketplace/items/${itemId}`);
  },

  // Analytics for Sellers
  async getSellerAnalytics(timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : "";
    const response = await api.get(`/marketplace/seller/analytics${params}`);
    return response.data;
  },

  // Favorites/Wishlist
  async addToFavorites(itemId: number): Promise<void> {
    await api.post(`/marketplace/items/${itemId}/favorite`);
  },

  async removeFromFavorites(itemId: number): Promise<void> {
    await api.delete(`/marketplace/items/${itemId}/favorite`);
  },

  async getFavorites(params?: { skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append("skip", params.skip.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await api.get(`/marketplace/favorites?${queryParams}`);
    return response.data;
  },
};
