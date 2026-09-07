import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPost, getPosts, getProducts, type Product } from "@/lib/api";
import { dungKhung } from "@/lib/reels";
import { chonBaiLienQuan } from '@/lib/baiLienQuan';
import { chonSanPhamLienQuan } from '@/lib/sanPhamLienQuan';
import VideoStrip from "@/components/shared/VideoStrip";
import ProductCard from "@/components/shared/ProductCard";
import dayjs from "dayjs";
import PostStrip from "@/components/shared/PostStrip";

export const revalidate = 120;

export async function generateStaticParams() {
  const posts = await getPosts().then((r) => r.data).catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      type: "article",
    },
  };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts, sanPham] = await Promise.all([
    getPost(slug).catch(() => null),
    // Phải lấy HẾT bài, không dùng mặc định 12.
    //
    // Bộ chọn bài liên quan chỉ ghép được trong số bài nó nhìn thấy; để mặc
    // định thì 78/90 bài không bao giờ có cơ hội xuất hiện, và bản sửa "đọc
    // thêm" gần như vô nghĩa.
    //
    // Không tốn thêm mỗi lượt xem: fetchApi đặt revalidate 60 nên mọi trang
    // blog dùng chung một lần tải mỗi phút. Có điều payload ~750 KB vì API trả
    // cả nội dung bài — vượt 2 MB thì Next lặng lẽ bỏ cache, nên khi blog vượt
    // khoảng 250 bài cần cho API một chế độ trả gọn (bỏ content).
    getPosts('limit=500').then((r) => r.data).catch(() => []),
    // Cùng lời gọi mà /video và trang chủ dùng — chỉ số ?i= phải khớp cả ba nơi.
    getProducts().catch((): Product[] => []),
  ]);
  if (!post) notFound();

  const khungVideo = dungKhung(sanPham);

  // Lọc từ danh sách đã lấy sẵn cho phần video, không gọi API thêm lần nữa.
  // Sản phẩm chào theo NỘI DUNG bài, không phải bốn món nổi bật cố định.
  //
  // Trước đây bài hướng dẫn làm chuồng và bài mua gà ở TP HCM chào bán y hệt
  // nhau, vì đây là slice(0, 4) của danh sách nổi bật. Blog mang 466 người đọc
  // mà chỉ 165 người xem sản phẩm — chào đúng thứ họ vừa đọc là cách rẻ nhất
  // để bớt rò rỉ ở đúng chỗ đó.
  const noiBat = chonSanPhamLienQuan(post, sanPham, 4);

  const relatedPosts = chonBaiLienQuan(post, allPosts, 4);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "GaRutin" },
    publisher: {
      "@type": "Organization",
      name: "GaRutin",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-primary-600 transition-colors">Trang chủ</a>
          <span>/</span>
          <a href="/blog" className="hover:text-primary-600 transition-colors">Blog</a>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{post.title}</span>
        </nav>

        {post.coverImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="mb-4">
          {post.category && (
            <span className="text-xs font-medium text-primary-600 uppercase">
              {post.category}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="text-gray-400 text-sm mt-2">
              {dayjs(post.publishedAt).format("DD/MM/YYYY")}
            </p>
          )}
        </div>

        {post.content && (
          <div
            className="prose prose-green max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {post.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-8 pt-4 border-t">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sản phẩm nổi bật đứng TRƯỚC video: người vừa đọc xong bài cần thấy
            mình mua được gì đã, rồi mới tới video để xem tận mắt. Ngược lại thì
            xem video xong vẫn phải đi tìm chỗ mua. */}
        {noiBat.length > 0 && (
          <div className="mt-10 pt-8 border-t">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">🌟 Sản phẩm nổi bật</h2>
              <Link href="/san-pham" className="text-primary-600 text-sm font-medium hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {noiBat.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Video đặt sau bài nhưng TRƯỚC phần "Đọc thêm".
            Người vừa đọc xong bài về giống cút là người đang cân nhắc mua —
            cho họ nhìn tận mắt ngay lúc đó. Để sau phần đọc thêm thì phần lớn
            đã bấm sang bài khác và không bao giờ cuộn tới. */}
        {khungVideo.length > 0 && (
          <VideoStrip
            khung={khungVideo}
            toiDa={6}
            className="mt-10"
          />
        )}

        <PostStrip
          baiViet={relatedPosts}
          tieuDe="Đọc thêm về gà rutin"
          className="mt-10"
        />

      </div>
    </>
  );
}
