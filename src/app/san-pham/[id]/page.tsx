import { notFound } from "next/navigation";
import { getProduct } from "@/services/products";
import ProductDetailClient from "@/components/product-detail/ProductDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await getProduct(id);
    return { title: product.name };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }
  return <ProductDetailClient product={product} />;
}
