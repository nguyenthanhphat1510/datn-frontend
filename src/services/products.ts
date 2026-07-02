import { apiGet } from "@/lib/api";
import type {
  Category,
  Manufacturer,
  Paginated,
  Product,
  Subcategory,
} from "@/types/product";

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
  subcategoryId?: string;
  manufacturer?: string;
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
    subcategoryId: params.subcategoryId,
    manufacturer: params.manufacturer,
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

/** Danh mục con của một danh mục cha (chỉ lấy đang active mặc định). */
export function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  return apiGet<Subcategory[]>("/subcategories", { categoryId });
}

/**
 * Danh sách nhà sản xuất / thương hiệu (chỉ lấy đang active mặc định).
 * Truyền categoryId để chỉ lấy thương hiệu CÓ sản phẩm thuộc danh mục đó
 * (vd bộ lọc trang phân bón chỉ hiện brand có bán phân bón).
 */
export function fetchManufacturers(categoryId?: string): Promise<Manufacturer[]> {
  return apiGet<Manufacturer[]>("/manufacturers", { categoryId });
}

export async function getProduct(id: string): Promise<Product> {
  const p = await apiGet<Product>(`/products/${id}`);
  return normalizeProduct(p);
}
