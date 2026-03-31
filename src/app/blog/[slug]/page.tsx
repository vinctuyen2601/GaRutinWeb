import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPost, getPosts } from "@/lib/api";
import dayjs from "dayjs";

export const revalidate = 120;

export async function generateStaticParams() {
  const posts = await getPosts().catch(() => []);
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
  const [post, allPosts] = await Promise.all([
    getPost(slug).catch(() => null),
    getPosts().catch(() => []),
  ]);
  if (!post) notFound();

  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.status === "published")
    .slice(0, 4);

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

        {relatedPosts.length > 0 && (
          <div className="mt-10 pt-8 border-t">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Đọc thêm về gà rutin</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-primary-50 transition-colors group"
                >
                  {related.coverImage && (
                    <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={related.coverImage}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {related.category && (
                      <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                        {related.category}
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors mt-0.5">
                      {related.title}
                    </p>
                    {related.publishedAt && (
                      <p className="text-gray-400 text-xs mt-1">
                        {dayjs(related.publishedAt).format("DD/MM/YYYY")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
