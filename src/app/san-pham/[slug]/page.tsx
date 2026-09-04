import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProduct, getProducts } from "@/lib/api";
import OrderForm from "@/components/shared/OrderForm";
import AddToCartButton from "@/components/shared/AddToCartButton";
import ProductCard from "@/components/shared/ProductCard";
import ProductHero from "@/components/shared/ProductHero";
import { hauToDonVi } from "@/lib/donVi";
import ProductStickyBar from "@/components/shared/ProductStickyBar";

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
      `Mua ${product.name} tại GaRutin. Giá ${formattedPrice}${hauToDonVi(product)}.`,
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
  const [product, allProducts] = await Promise.all([
    getProduct(slug).catch(() => null),
    getProducts().catch(() => []),
  ]);
  if (!product) notFound();

  const otherProducts = allProducts.filter((p) => p.id !== product.id);
  const relatedProducts = [
    ...otherProducts.filter((p) => p.categoryId && p.categoryId === product.categoryId),
    ...otherProducts.filter((p) => !p.categoryId || p.categoryId !== product.categoryId),
  ].slice(0, 8);

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
        {/* grid-cols-1 KHÔNG phải trang trí. Thiếu nó thì trên điện thoại lưới
            dùng track ngầm kiểu `auto`, mà track đó không co xuống dưới bề rộng
            min-content của nội dung. Hàng ô vuông bên dưới là flex với các ô
            flex-shrink-0 80px, nên min-content của nó là 80*n + 8*(n-1) — với 5
            media là 432px, vượt khung 390px và đẩy CẢ TRANG rộng ra 448px.
            Tailwind grid-cols-* sinh ra minmax(0, 1fr), co được. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Ảnh & video */}
          <ProductHero
            images={product.images ?? []}
            videos={product.videos}
            name={product.name}
          />

          {/* Info + Order Form */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.weightPerUnit && (
                <p className="text-sm text-gray-500">
                  Trọng lượng: {product.weightPerUnit}{hauToDonVi(product)}
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
                {hauToDonVi(product) && (
                    <span className="text-gray-500 text-sm">{hauToDonVi(product)}</span>
                  )}
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

            {product.stockStatus !== 'out_of_stock' && (
              <AddToCartButton
                product={product}
                className="w-full border-2 border-primary-600 text-primary-600 font-bold py-3 rounded-xl text-base hover:bg-primary-50 transition-colors"
              />
            )}

            {/* Mốc để nút MUA NGAY ở thanh dính đáy cuộn tới. */}
            <div id="form-dat-hang">
              <OrderForm product={product} />
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm khác</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Đệm để thanh mua dính đáy không che mất nội dung cuối trang */}
      <div className="h-20 md:hidden" />
      <ProductStickyBar product={product} />
    </>
  );
}
