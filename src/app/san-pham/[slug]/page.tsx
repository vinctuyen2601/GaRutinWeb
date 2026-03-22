import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct, getProducts } from "@/lib/api";
import OrderForm from "@/components/shared/OrderForm";

export const revalidate = 120;

export async function generateStaticParams() {
  const products = await getProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return {};
  const price = product.salePrice ?? product.price;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
  return {
    title: product.seoTitle || `${product.name} - GaRutin`,
    description:
      product.seoDescription ||
      product.description ||
      `Mua ${product.name} tại GaRutin. Giá ${formattedPrice}/${product.unit}.`,
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) notFound();

  const price = product.salePrice ?? product.price;
  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: { "@type": "Brand", name: "GaRutin" },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "VND",
      url: `${SITE_URL}/san-pham/${slug}`,
      seller: { "@type": "Organization", name: "GaRutin" },
      availability:
        product.stockStatus === "in_stock"
          ? "https://schema.org/InStock"
          : product.stockStatus === "pre_order"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sản phẩm",
        item: `${SITE_URL}/san-pham`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/san-pham/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-6xl mx-auto px-4 pt-4 pb-0">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
          <a href="/" className="hover:text-primary-600 transition-colors">Trang chủ</a>
          <span>/</span>
          <a href="/san-pham" className="hover:text-primary-600 transition-colors">Sản phẩm</a>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-8xl">
                  🐦
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + Order Form */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.weightPerUnit && (
                <p className="text-sm text-gray-500">
                  Trọng lượng: {product.weightPerUnit}/{product.unit}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-3xl font-bold text-primary-600">
                  {formatVND(price)}
                </span>
                {product.salePrice && (
                  <span className="text-gray-400 line-through text-lg">
                    {formatVND(product.price)}
                  </span>
                )}
                <span className="text-gray-500 text-sm">/{product.unit}</span>
              </div>
              {product.stockStatus === "out_of_stock" && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  ⚠️ Tạm hết hàng
                </p>
              )}
              {product.stockStatus === "pre_order" && (
                <p className="text-blue-500 text-sm mt-1 font-medium">
                  📋 Nhận đặt trước
                </p>
              )}
            </div>

            {product.description && (
              <div
                className="prose prose-sm prose-green max-w-none text-gray-600 leading-relaxed border-t pt-4"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <OrderForm product={product} />
          </div>
        </div>
      </div>
    </>
  );
}
