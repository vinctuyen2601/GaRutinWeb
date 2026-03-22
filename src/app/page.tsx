import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getPosts } from '@/lib/api';
import ProductCard from '@/components/shared/ProductCard';

export const metadata: Metadata = {
  title: 'GaRutin - Gà Rutin Tươi Sống Thẳng Từ Trang Trại',
  description: 'Mua gà rutin thuần chủng, nuôi tự nhiên. Giống đẹp, khỏe mạnh, giao hàng toàn quốc. Liên hệ đặt hàng ngay!',
};

export default async function HomePage() {
  const [products, posts] = await Promise.all([
    getProducts('featured=true&limit=8').catch(() => []),
    getPosts('limit=3').catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            🐦 Gà Rutin Tươi Sống
          </h1>
          <p className="text-xl text-primary-100 mb-2">Thẳng Từ Trang Trại — Giao Toàn Quốc</p>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            Giống thuần chủng, nuôi tự nhiên, không hóa chất. Cam kết chất lượng, con khỏe mạnh, tỷ lệ sống cao.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/san-pham" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Xem sản phẩm
            </Link>
            <a
              href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-400 transition-colors border border-primary-400"
            >
              💬 Đặt qua Zalo
            </a>
          </div>
        </div>
      </section>

      {/* USP */}
      <section className="py-8 bg-primary-50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🐦', title: 'Giống thuần chủng', desc: 'Nguồn gốc rõ ràng' },
            { icon: '🌿', title: 'Nuôi tự nhiên', desc: 'Không tăng trọng' },
            { icon: '🚚', title: 'Giao toàn quốc', desc: 'Đóng gói cẩn thận' },
            { icon: '✅', title: 'Cam kết chất lượng', desc: 'Hoàn tiền nếu chết khi nhận' },
          ].map((u) => (
            <div key={u.title} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl mb-2">{u.icon}</div>
              <div className="font-semibold text-sm text-gray-800">{u.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{u.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🌟 Sản phẩm nổi bật</h2>
              <Link href="/san-pham" className="text-primary-600 text-sm font-medium hover:underline">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="py-12 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Tại sao chọn GaRutin?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🔬', title: 'Giống sạch, kiểm dịch', desc: 'Đàn gốc được kiểm tra thường xuyên, không dịch bệnh' },
              { icon: '📦', title: 'Đóng gói chuyên nghiệp', desc: 'Hộp carton thoáng khí, giảm stress khi vận chuyển' },
              { icon: '🤝', title: 'Hỗ trợ sau bán', desc: 'Tư vấn nuôi dưỡng, kỹ thuật chăm sóc miễn phí' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog preview */}
      {posts.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📝 Bài viết mới nhất</h2>
              <Link href="/blog" className="text-primary-600 text-sm font-medium hover:underline">Xem tất cả →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  {post.coverImage && (
                    <div className="relative aspect-video">
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-primary-700 text-white text-center px-4">
        <h2 className="text-2xl font-bold mb-3">Sẵn sàng đặt hàng?</h2>
        <p className="text-primary-200 mb-6">Liên hệ ngay để được tư vấn và báo giá miễn phí</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`tel:${process.env.NEXT_PUBLIC_PHONE || '0901234567'}`} className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            📞 Gọi ngay
          </a>
          <a href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567'}`} target="_blank" rel="noopener noreferrer" className="bg-primary-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-400 transition-colors border border-primary-400">
            💬 Chat Zalo
          </a>
        </div>
      </section>
    </>
  );
}
