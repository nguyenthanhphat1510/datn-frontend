export interface ProductImage {
  url: string;
  publicId: string;
}

export type ProductBadge = "Sale" | "Hot" | "Mới";

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  manufacturer?: string;
  usageInstructions?: string;
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  originalPrice?: number;
  rating?: number;
  ratingCount?: number;
  badge?: ProductBadge;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
