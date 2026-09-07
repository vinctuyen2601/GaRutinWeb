import type { MetadataRoute } from "next";
import { getProducts, getPosts } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com";

/**
 * Mô tả ngắn cho khai báo video: bỏ thẻ HTML và cắt còn một đoạn.
 *
 * Mô tả sản phẩm là HTML do CMS sinh; nhét nguyên vào sitemap thì XML chứa thẻ
 * lồng thẻ và Google bỏ qua cả mục.
 */
function moTaNgan(html?: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 300);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    getProducts('limit=1000').catch(() => []),
    getPosts('limit=1000').then((r) => r.data).catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/san-pham`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/lien-he`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  /**
   * Khai ảnh và video ngay trong sitemap.
   *
   * Google vẫn tìm được ảnh khi bò vào trang, nhưng khai sẵn thì tìm nhanh hơn
   * và không bỏ sót ảnh nằm sâu. Với video thì đây là chuyện khác hẳn: clip là
   * thẻ <video> do trình duyệt dựng, Google gần như không tự nhận ra — không
   * khai thì nó không biết trang này có video nào cả.
   *
   * `thumbnail_loc` bắt buộc nhưng hiện chưa có ảnh trích từ chính clip, nên
   * dùng tạm ảnh sản phẩm — cùng con vật, cùng nội dung, chỉ không phải đúng
   * khung hình đó. Muốn chuẩn thì phải cắt ảnh từ video lúc tải lên.
   *
   * Bỏ video YouTube giống hệt chỗ khác trong dự án: chúng đã có mặt trên
   * YouTube, khai lại ở đây là khai trùng.
   */
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => {
    const anh = (p.images ?? []).filter(Boolean);
    const clip = (p.videos ?? []).filter((u) => u && !/youtu\.?be|youtube\.com/i.test(u));

    return {
      url: `${SITE_URL}/san-pham/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      ...(anh.length ? { images: anh } : {}),
      ...(clip.length && anh.length
        ? {
            videos: clip.map((url, i) => ({
              title: clip.length > 1 ? `${p.name} — video ${i + 1}` : p.name,
              thumbnail_loc: anh[0],
              description: moTaNgan(p.description) || `Video ${p.name} quay tại trại GaRutin.`,
              content_loc: url,
              family_friendly: "yes" as const,
            })),
          }
        : {}),
    };
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    ...(p.coverImage ? { images: [p.coverImage] } : {}),
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes];
}
