import { MOCK_PRODUCTS } from "@/data/mockData";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

export function generateStaticParams() {
  return MOCK_PRODUCTS.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | CampusHub Store`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
