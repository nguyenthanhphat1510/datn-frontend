import { apiGet } from "@/lib/api";
import type { Category, Paginated, Product } from "@/types/product";

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export function fetchProducts(
  params: FetchProductsParams = {},
): Promise<Paginated<Product>> {
  return apiGet<Paginated<Product>>("/products", {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    isActive: params.isActive ?? true,
  });
}

export function fetchCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories");
}

export function getProduct(id: string): Promise<Product> {
  return apiGet<Product>(`/products/${id}`);
}
