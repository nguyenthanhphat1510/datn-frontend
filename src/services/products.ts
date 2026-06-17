import { apiGet } from "@/lib/api";
import type { Category, Paginated, Product } from "@/types/product";

/**
 * Backend lưu { price: giá gốc, salePrice: giá đã giảm }.
 * UI lại dùng { price: giá hiển thị, originalPrice: giá gốc gạch ngang }.
 * Hàm này map cho khớp để mọi component hiển thị đúng giảm giá.
 */
function normalizeProduct(p: Product): Product {
  const hasSale =
    p.salePrice != null && p.salePrice >= 0 && p.salePrice < p.price;
  if (!hasSale) return p;
  return {
    ...p,
    price: p.salePrice as number, // giá khách trả (đã giảm)
    originalPrice: p.price, // giá gốc để gạch ngang
  };
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export async function fetchProducts(
  params: FetchProductsParams = {},
): Promise<Paginated<Product>> {
  const res = await apiGet<Paginated<Product>>("/products", {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    isActive: params.isActive ?? true,
  });
  return { ...res, data: res.data.map(normalizeProduct) };
}

export function fetchCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/categories");
}

export async function getProduct(id: string): Promise<Product> {
  const p = await apiGet<Product>(`/products/${id}`);
  return normalizeProduct(p);
}
