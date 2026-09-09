import Link from 'next/link';
import { getSiteConfig } from '@/lib/api';

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default async function SiteFooter() {
  /**
   * Địa chỉ lấy từ cấu hình trong CMS, không viết cứng.
   *
   * Trước đây footer ghi "Việt Nam" — đúng nhưng vô nghĩa với khách đang cân
   * nhắc mua gà sống: họ muốn biết trại ở đâu để ước chừng đường giao. Trong
   * CMS đã có sẵn địa chỉ thật, chỉ là chưa ai nối vào.
   *
   * Hỏng API thì vẫn phải dựng được footer, nên rơi về chuỗi cũ chứ không để
   * trang trắng chỉ vì một dòng địa chỉ.
   *
   * CHƯA lấy phone/zalo từ đây: hai giá trị đó trong CMS còn là số mẫu
   * 0901234567, trong khi web đang chạy số thật từ biến môi trường. Nối vào
   * lúc này là đăng nhầm số điện thoại lên toàn bộ trang.
   */
  let diaChi = 'Việt Nam';
  try {
    const cauHinh = await getSiteConfig();
    if (cauHinh?.address?.trim()) diaChi = cauHinh.address.trim();
  } catch {
    // Giữ chuỗi mặc định.
  }

  return (
    <footer className="bg-primary-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-bold mb-3">🐦 GaRutin</div>
          <p className="text-primary-200 text-sm">Trang trại gà rutin thuần chủng. Cam kết chất lượng, giao hàng toàn quốc.</p>
        </div>

        <div>
          <div className="font-semibold mb-3">Liên hệ</div>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li>📞 <a href={`tel:${PHONE}`} className="hover:text-white">{PHONE}</a></li>
            <li>💬 <a href={`https://zalo.me/${ZALO}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Zalo: {ZALO}</a></li>
            <li>📍 {diaChi}</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Khám phá</div>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li><Link href="/san-pham" className="hover:text-white">Sản phẩm</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog nuôi gà</Link></li>
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
