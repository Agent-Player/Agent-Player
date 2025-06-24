export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  item_type: "agent" | "template" | "workflow";
  item_data: any;
  price: number;
  currency: string;
  tags: string[];
  images: string[];

  // Seller info
  seller_id: number;
  seller_name?: string;
  seller_rating?: number;

  // Stats
  downloads: number;
  purchases: number;
  rating_average: number;
  rating_count: number;

  // Status
  status: "draft" | "pending" | "approved" | "rejected" | "suspended";
  is_featured: boolean;
  is_trending: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface MarketplaceCategory {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  color?: string;
  item_count: number;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface MarketplaceReview {
  id: number;
  item_id: number;
  user_id: number;
  user_name?: string;
  rating: number;
  comment?: string;
  pros: string[];
  cons: string[];
  is_verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplacePurchase {
  id: number;
  item_id: number;
  item_title?: string;
  buyer_id: number;
  seller_id: number;
  price: number;
  currency: string;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  payment_method?: string;
  transaction_id?: string;

  // License info
  license_key?: string;
  license_type?: string;
  expires_at?: string;

  created_at: string;
  updated_at: string;
}

export interface MarketplaceSearch {
  items: MarketplaceItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;

  // Search metadata
  query?: string;
  filters_applied: string[];
  sort_by?: string;
  sort_order?: string;
  search_time_ms: number;
}

export interface MarketplaceStats {
  total_items: number;
  total_sales: number;
  total_revenue: number;
  active_sellers: number;
  popular_categories: Array<{
    category_id: number;
    category_name: string;
    item_count: number;
  }>;
  trending_items: MarketplaceItem[];
  recent_sales: Array<{
    item_title: string;
    price: number;
    sold_at: string;
  }>;
}

export interface SellerAnalytics {
  seller_id: number;
  total_items: number;
  total_sales: number;
  total_revenue: number;
  average_rating: number;

  sales_by_month: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;

  popular_items: Array<{
    item_id: number;
    item_title: string;
    sales: number;
    revenue: number;
  }>;

  category_performance: Array<{
    category_name: string;
    items: number;
    sales: number;
    revenue: number;
  }>;

  generated_at: string;
}
