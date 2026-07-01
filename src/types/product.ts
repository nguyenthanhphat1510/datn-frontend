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
  salePrice?: number | null; // giá khuyến mãi từ backend (null = không giảm)
  stock: number;
  categoryId: string;
  manufacturer?: string;
  usageInstructions?: string;
  ingredients?: string;
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  originalPrice?: number;
  // Điểm đánh giá thật từ backend (denormalize từ collection reviews)
  averageRating?: number;
  reviewCount?: number;
  badge?: ProductBadge;
}

export interface Review {
  _id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
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
