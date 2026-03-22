import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getPosts } from '@/lib/api';
import ProductCard from '@/components/shared/ProductCard';

export const metadata: Metadata = {
  title: 'GaRutin - Gà Rutin Cảnh Thuần Chủng, Nhiều Màu Đẹp',
  description: 'Chuyên cung cấp gà rutin cảnh thuần chủng — gà tí hon nhỏ nhất thế giới, nhiều màu lông đẹp, tính cách hiền lành. Phù hợp nuôi trong căn hộ, nhà phố. Giao hàng toàn quốc.',
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
          <div className="inline-block bg-primary-500 text-primary-100 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            🌟 Gà tí hon nhỏ nhất thế giới — đang hot tại Việt Nam 2024
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            🐦 Gà Rutin Cảnh<br className="hidden md:block" /> Thuần Chủng, Nhiều Màu Đẹp
          </h1>
          <p className="text-xl text-primary-100 mb-3">Chỉ 12–14 cm · Nặng 50–70g · Hiền lành như thú cưng</p>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">
            Gà Rutin (King Quail) là loài chim cảnh tí hon với bộ lông sặc sỡ nhiều màu — xanh, nâu, trắng, bạc, maroon...
            Tính cách hiền lành, ít mùi, dễ nuôi trong căn hộ. Giống thuần chủng, con khỏe, đẹp mã, giao hàng toàn quốc.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/san-pham" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Xem các giống gà
            </Link>
            <a
              href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-400 transition-colors border border-primary-400"
            >
              💬 Tư vấn qua Zalo
            </a>
          </div>
        </div>
      </section>

      {/* USP */}
      <section className="py-8 bg-primary-50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: '🎨', title: 'Nhiều màu lông đẹp', desc: 'Xanh, trắng, bạc, maroon, nâu...' },
            { icon: '🏠', title: 'Nuôi được trong nhà', desc: 'Ít mùi, ít tiếng ồn, nhỏ gọn' },
            { icon: '🚚', title: 'Giao toàn quốc', desc: 'Đóng gói an toàn, đúng cách' },
            { icon: '✅', title: 'Cam kết chất lượng', desc: 'Con đẹp, khỏe, đúng giống' },
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

      {/* About quail + Why choose us */}
      <section className="py-12 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          {/* About gà rutin */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-10">
            <h2 className="text-2xl font-bold mb-2">Gà Rutin là gì?</h2>
            <p className="text-gray-500 text-sm mb-4">King Quail · Chinese Painted Quail · Coturnix chinensis</p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Gà Rutin — còn gọi là <strong>gà tí hon</strong> — là loài chim cảnh nhỏ nhất thế giới, chỉ dài 12–14 cm và nặng 50–70g.
              Chúng có bộ lông sặc sỡ với hàng chục màu đột biến khác nhau: xanh đá, nâu, trắng, bạc, maroon, vàng, đen...
              Con đực thường sở hữu màu lông rực rỡ và đặc trưng hơn con cái.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Không giống gà thịt hay gà đẻ công nghiệp, gà Rutin được nuôi hoàn toàn <strong>làm cảnh và thú cưng</strong>.
              Tính cách hiền lành, ít mùi, ít tiếng ồn — rất phù hợp nuôi trong căn hộ, nhà phố hay cho các gia đình có trẻ nhỏ.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Kích thước', value: '12–14 cm' },
                { label: 'Cân nặng', value: '50–70g' },
                { label: 'Tuổi thọ', value: '3–7 năm' },
                { label: 'Nhiệt độ', value: '20–37°C' },
              ].map((s) => (
                <div key={s.label} className="bg-primary-50 rounded-xl p-3 text-center">
                  <div className="font-bold text-primary-700 text-lg">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why choose us */}
          <h2 className="text-2xl font-bold text-center mb-6">Tại sao chọn GaRutin?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎨', title: 'Giống đẹp, nhiều màu', desc: 'Đàn gốc thuần chủng với đa dạng màu lông — xanh, trắng, bạc, maroon, nâu, đen. Con đực màu sắc rực rỡ, đẹp mã.' },
              { icon: '📦', title: 'Vận chuyển an toàn', desc: 'Đóng gói đúng kỹ thuật, thoáng khí, giảm stress cho chim. Cam kết giao đến tay khỏe mạnh, đúng giống.' },
              { icon: '🤝', title: 'Hỗ trợ tận tình', desc: 'Tư vấn miễn phí cách nuôi, chuồng trại, chế độ ăn và phòng bệnh. Đồng hành cùng bạn từ khi mua đến lúc thành thạo.' },
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
        <h2 className="text-2xl font-bold mb-3">Muốn sở hữu chú gà tí hon này?</h2>
        <p className="text-primary-200 mb-6">Liên hệ ngay để được tư vấn giống, màu lông và cách nuôi — hoàn toàn miễn phí</p>
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
