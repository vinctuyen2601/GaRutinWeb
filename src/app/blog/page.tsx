import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/lib/api';
import dayjs from 'dayjs';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog - Kinh Nghiệm Nuôi Gà Rutin',
  description: 'Chia sẻ kinh nghiệm nuôi gà rutin, kỹ thuật chăm sóc, phòng bệnh và nhiều hơn nữa từ trang trại GaRutin.',
};

export default async function BlogPage() {
  const posts = await getPosts().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📝 Blog nuôi gà rutin</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Chưa có bài viết nào</div>
      ) : (
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
      )}
    </div>
  );
}
