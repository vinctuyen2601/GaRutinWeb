import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts, getProducts } from '@/lib/api';
import dayjs from 'dayjs';
import { giaBan, giaGach } from '@/lib/gia';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog - Kinh Nghiệm Nuôi Gà Rutin',
  description: 'Chia sẻ kinh nghiệm nuôi gà rutin, kỹ thuật chăm sóc, phòng bệnh và nhiều hơn nữa từ trang trại GaRutin.',
};

const LIMIT = 12;

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const { page: pageParam, q: rawQ } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const q = rawQ?.trim() || '';

  const apiParams = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (q) apiParams.set('q', q);

  const [{ data: posts, total }, featuredProducts] = await Promise.all([
    getPosts(apiParams.toString()).catch(() => ({ data: [], total: 0, page: 1, limit: LIMIT })),
    getProducts('featured=true&limit=6').catch(() => []),
  ]);

  const totalPages = Math.ceil(total / LIMIT);
  const pageHref = (p: number) => `/blog?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📝 Blog nuôi gà rutin</h1>

      {/* Search box */}
      <form action="/blog" method="GET" className="mb-8">
        {/* Reset page khi search mới */}
        <div className="flex gap-2 max-w-lg">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm kiếm bài viết..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Tìm
          </button>
          {q && (
            <Link
              href="/blog"
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Xoá
            </Link>
          )}
        </div>
        {q && (
          <p className="mt-2 text-sm text-gray-500">
            Kết quả cho <span className="font-medium text-gray-700">&ldquo;{q}&rdquo;</span> — {total} bài viết
          </p>
        )}
      </form>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {q ? `Không tìm thấy bài viết nào cho "${q}"` : 'Chưa có bài viết nào'}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                {post.coverImage && (
                  <div className="relative aspect-video">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                )}
                <div className="p-4">
                  {post.category && (
                    <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">{post.category}</span>
                  )}
                  <h2 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>}
                  {post.publishedAt && (
                    <p className="text-gray-400 text-xs mt-2">{dayjs(post.publishedAt).format('DD/MM/YYYY')}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              {page > 1 && (
                <Link href={pageHref(page - 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Trước
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${p === page ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link href={pageHref(page + 1)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Sau →
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">🛒 Sản phẩm nổi bật</h2>
            <Link href="/san-pham" className="text-primary-600 text-sm font-medium hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/san-pham/${product.slug}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-50">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🐦</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</p>
                  <p className="text-primary-600 font-semibold text-sm mt-1">
                    {formatPrice(giaBan(product))}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
