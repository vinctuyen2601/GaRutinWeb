import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPost, getPosts } from "@/lib/api";
import dayjs from "dayjs";

export const revalidate = 3600;

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
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

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
        <Link
          href="/blog"
          className="text-primary-600 text-sm hover:underline mb-4 block"
        >
          ← Về danh sách bài viết
        </Link>

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
          <div className="prose prose-green max-w-none text-gray-700 leading-relaxed">
            {post.content
              .split("\n")
              .map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : <br key={i} />
              )}
          </div>
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
      </div>
    </>
  );
}
