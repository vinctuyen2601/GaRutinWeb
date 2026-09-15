import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts, getCategories, getPosts } from '@/lib/api';
import ProductCard from '@/components/shared/ProductCard';

export const metadata: Metadata = {
  alternates: { canonical: '/san-pham' },
  title: 'Mua Gà Rutin Cảnh - Nhiều Màu Lông, Thuần Chủng',
  description: 'Các giống gà rutin cảnh thuần chủng: màu xanh, nâu, trắng, bạc, maroon... Con đực màu sắc rực rỡ, tính cách hiền lành, phù hợp nuôi trong nhà. Giao hàng toàn quốc.',
  keywords: ['mua gà rutin cảnh', 'gà rutin màu xanh', 'gà rutin màu trắng', 'gà rutin thuần chủng', 'giá gà rutin'],
};

export const revalidate = 60;

const tien = (n: number) => Number(n).toLocaleString('vi-VN') + 'đ';
const giaThat = (p: { price: number; salePrice?: number }) => {
  const s = Number(p.salePrice ?? 0);
  return s > 0 && s < Number(p.price) ? s : Number(p.price);
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories, baiViet] = await Promise.all([
    getProducts(category ? `category=${category}` : undefined).catch(() => []),
    getCategories().catch(() => []),
    // Bài hướng dẫn để dẫn người đọc sang nội dung, và để trang này có đường
    // ra thay vì là ngõ cụt. Hỏng thì bỏ qua phần đó, không làm chết trang.
    getPosts('limit=8').then((r) => r.data ?? []).catch(() => []),
  ]);

  const tenDanhMuc = category
    ? categories.find((c) => c.id === category)?.name
    : undefined;

  // Giá lấy từ danh mục thật, KHÔNG gõ cứng. Bảng giá gõ cứng là thứ chắc chắn
  // sẽ lệch với giá bán sau vài lần đổi giá, và khách phát hiện ra trước mình.
  const dangBan = products.filter((p) => p.isActive !== false);
  const ga = dangBan.filter((p) => !/chuồng|lồng|combo/i.test(p.name));
  const combo = dangBan.filter((p) => /combo/i.test(p.name));
  const chuong = dangBan.filter((p) => /chuồng|lồng/i.test(p.name));
  const giaGa = ga.map(giaThat).filter((n) => n > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/*
        H1 phải là cụm người ta thật sự gõ vào Google.
        Trước 15/09/2026 chỗ này ghi "Tất cả sản phẩm" — tín hiệu on-page mạnh
        nhất của trang bị dùng cho một cụm không ai tìm, trong khi thẻ <title>
        lại nhắm đúng. Hai thứ nói hai chuyện khác nhau.
      */}
      <h1 className="text-2xl md:text-3xl font-bold mb-3">
        {tenDanhMuc ? `${tenDanhMuc} — GaRutin` : 'Mua gà rutin cảnh thuần chủng'}
      </h1>

      {!category && (
        <div className="text-gray-700 leading-relaxed mb-6 max-w-3xl space-y-3">
          <p>
            Toàn bộ gà rutin đang có tại trại, xem được giá từng màu ngay dưới đây.
            Gà rutin (<em>King Quail</em>, <em>Coturnix chinensis</em>) là loài chim
            cảnh nhỏ nhất thế giới — dài 12–14&nbsp;cm, nặng 50–70&nbsp;g — nuôi làm
            cảnh chứ không phải gà thịt. Ít mùi, ít tiếng, nuôi được trong căn hộ.
          </p>
          {giaGa.length > 0 && (
            <p>
              Giá gà lẻ hiện từ <strong>{tien(Math.min(...giaGa))}</strong> đến{' '}
              <strong>{tien(Math.max(...giaGa))}</strong> một con tuỳ màu lông. Màu
              phổ thông như trống đen, mái nâu ở mức thấp nhất; màu hiếm thì cao hơn.
              {combo.length > 0 && ' Nuôi lần đầu nên bắt đầu bằng một cặp trống mái đã ghép sẵn thay vì mua lẻ từng con.'}
            </p>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <a href="/san-pham" className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!category ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-500'}`}>
            Tất cả
          </a>
          {categories.map((cat) => (
            <a key={cat.id} href={`/san-pham?category=${cat.id}`} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat.id ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-500'}`}>
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Chưa có sản phẩm nào</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!category && (
        <div className="mt-12 space-y-8 max-w-3xl">
          {combo.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Mua theo cặp và theo combo</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Gà rutin sống theo đàn, nuôi một con lẻ thì nhát và hay bỏ ăn. Các
                combo dưới đây đã ghép sẵn trống mái nên đỡ phải lo chuyện hợp đàn:
              </p>
              <ul className="space-y-1.5 text-gray-700">
                {combo.map((c) => (
                  <li key={c.id}>
                    <Link href={`/san-pham/${c.slug}`} className="text-primary-700 hover:underline font-medium">{c.name}</Link>
                    {' — '}{tien(giaThat(c))}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {chuong.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Chuồng nuôi làm sẵn</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Trại có sẵn lồng gỗ MDF kết hợp mặt mica, đã gắn đèn LED, máng ăn
                và bình nước — nhận về là dựng được ngay:
              </p>
              <ul className="space-y-1.5 text-gray-700">
                {chuong.map((c) => (
                  <li key={c.id}>
                    <Link href={`/san-pham/${c.slug}`} className="text-primary-700 hover:underline font-medium">{c.name}</Link>
                    {' — '}{tien(giaThat(c))}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Muốn tự đóng cho rẻ thì xem{' '}
                <Link href="/blog/lam-chuong-ga-rutin" className="text-primary-700 hover:underline">
                  hướng dẫn làm chuồng nuôi gà rutin và kích thước chuẩn
                </Link>
                {' '}— có cả bảng so sánh tự làm với mua sẵn.
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-bold mb-3">Đặt hàng và nhận gà</h2>
            <p className="text-gray-700 leading-relaxed">
              Trại đặt tại Bình Tân, TP&nbsp;Hồ Chí Minh. Khách ở thành phố có thể
              sang xem đàn trực tiếp rồi chọn con ưng mắt. Khách ở tỉnh thì nhắn
              Zalo trước để shop sắp chuyến cho hợp — gà là con vật sống, cách đóng
              và giờ đi phải tính theo quãng đường và thời tiết hôm đó, không có
              mức cố định.
            </p>
          </section>

          {baiViet.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3">Trước khi nuôi, nên đọc</h2>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-700">
                {baiViet.map((b) => (
                  <li key={b.id}>
                    <Link href={`/blog/${b.slug}`} className="text-primary-700 hover:underline">{b.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
