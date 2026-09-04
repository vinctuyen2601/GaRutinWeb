'use client';

import { usePathname } from 'next/navigation';

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

/**
 * Trang nào KHÔNG dùng thanh liên hệ chung này.
 *
 * - Chi tiết sản phẩm: có thanh mua riêng (ProductStickyBar) với giá và nút
 *   mua. Hai thanh dính đáy chồng lên nhau thì che mất nhau.
 * - Đặt hàng / giỏ hàng: khách đã điền form, chỉ còn một chạm là xong. Mời họ
 *   nhắn Zalo ở đúng lúc đó là tự bỏ đơn hàng đã gần chốt.
 */
const KHONG_HIEN = (duongDan: string) =>
  /^\/san-pham\/[^/]+/.test(duongDan) || duongDan === '/dat-hang' || duongDan === '/gio-hang';

export default function StickyBottomBar() {
  const duongDan = usePathname();
  if (KHONG_HIEN(duongDan ?? '')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex">
        <a
          href={`tel:${PHONE}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-800 font-medium text-sm active:bg-gray-200"
        >
          📞 Gọi ngay
        </a>
        <a
          href={`https://zalo.me/${ZALO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-medium text-sm active:bg-primary-700"
        >
          💬 Đặt qua Zalo
        </a>
      </div>
    </div>
  );
}
