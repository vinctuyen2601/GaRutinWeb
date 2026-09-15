import Link from 'next/link';
import type { ThongTinLienHe } from '@/lib/lienHe';
import type { Product, Post } from '@/lib/api';

/**
 * Chân trang vừa là chỗ liên hệ, vừa là bộ khung liên kết nội bộ của cả site.
 *
 * VÌ SAO NHIỀU LIÊN KẾT: đo ngày 15/09/2026, mỗi trang garutin.com trỏ tới
 * 38–43 URL riêng biệt, còn lolipet.net — đối thủ đứng trên mình ở gần như mọi
 * truy vấn — là 125–132. Chân trang xuất hiện trên cả 90 trang, nên thêm liên
 * kết ở đây là cách rẻ nhất để thu hẹp khoảng cách đó: một lần sửa, chín mươi
 * trang được lợi.
 *
 * LẤY TỪ DỮ LIỆU THẬT, KHÔNG GÕ CỨNG SLUG: đã có phiên phải đi sửa 32 liên kết
 * trỏ vào bài đã gộp. Slug gõ cứng trong mã không ai biết là nó gãy cho tới khi
 * quét lại. Danh sách dưới đây do máy chủ trả về nên luôn đúng với bài và sản
 * phẩm đang sống.
 */
export default function SiteFooter({
  lienHe,
  sanPham = [],
  baiViet = [],
}: {
  lienHe: ThongTinLienHe;
  sanPham?: Product[];
  baiViet?: Post[];
}) {
  // Cấu hình lấy một lần ở layout rồi truyền xuống, không tự gọi API nữa:
  // header và footer cùng một trang mà gọi hai lần thì có lúc lệch nhau.
  const { phone: PHONE, zalo: ZALO, address: diaChi } = lienHe;

  return (
    <footer className="bg-primary-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="text-xl font-bold mb-3">🐦 GaRutin</div>
          <p className="text-primary-200 text-sm mb-4">Trang trại gà rutin thuần chủng. Cam kết chất lượng, giao hàng toàn quốc.</p>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li>📞 <a href={`tel:${PHONE}`} className="hover:text-white">{PHONE}</a></li>
            <li>💬 <a href={`https://zalo.me/${ZALO}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Zalo: {ZALO}</a></li>
            <li>📍 {diaChi}</li>
          </ul>
        </div>

        {sanPham.length > 0 && (
          <div>
            <div className="font-semibold mb-3">Gà rutin đang bán</div>
            <ul className="space-y-2 text-primary-200 text-sm">
              {sanPham.map((p) => (
                <li key={p.id}>
                  <Link href={`/san-pham/${p.slug}`} className="hover:text-white">{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {baiViet.length > 0 && (
          <div>
            <div className="font-semibold mb-3">Hướng dẫn nuôi</div>
            <ul className="space-y-2 text-primary-200 text-sm">
              {baiViet.map((b) => (
                <li key={b.id}>
                  <Link href={`/blog/${b.slug}`} className="hover:text-white">{b.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="font-semibold mb-3">Khám phá</div>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li><Link href="/san-pham" className="hover:text-white">Tất cả gà rutin</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog nuôi gà</Link></li>
            <li><Link href="/video" className="hover:text-white">Video</Link></li>
            <li><Link href="/lien-he" className="hover:text-white">Liên hệ đặt hàng</Link></li>
            <li><Link href="/chinh-sach-hoan-tra" className="hover:text-white">Chính sách hoàn trả</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-primary-800 text-center text-primary-300 text-sm">
        © {new Date().getFullYear()} GaRutin. All rights reserved.
      </div>
    </footer>
  );
}
