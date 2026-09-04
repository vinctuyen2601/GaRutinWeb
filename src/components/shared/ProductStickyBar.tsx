'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { hauToDonVi } from '@/lib/donVi';
import type { Product } from '@/lib/api';
import { giaBan, giaGach } from '@/lib/gia';
import { ghiNhanThemGio } from '@/lib/track';

const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/**
 * Thanh mua hàng dính đáy màn hình ở trang chi tiết sản phẩm (chỉ điện thoại).
 *
 * Trước đây trang này dùng thanh chung của layout, nội dung là "Gọi ngay" và
 * "Đặt qua Zalo" — nghĩa là nút thường trực duy nhất trên màn hình lại đưa
 * khách RA KHỎI web, trong khi nút "Thêm vào giỏ" nằm tít dưới vị trí 1.252px,
 * phải cuộn qua hết ảnh và mô tả mới thấy.
 *
 * Zalo vẫn còn, nhưng lùi về nút biểu tượng hẹp: người cần tư vấn trước vẫn
 * bấm được, còn người đã quyết mua thì không bị chặn lại. Bán con giống sống
 * thì nhu cầu hỏi trước là thật, nên bỏ hẳn Zalo sẽ mất đơn.
 *
 * "Mua ngay" cuộn tới form đặt hàng có sẵn ngay trên trang rồi đưa con trỏ vào
 * ô họ tên, thay vì mở giỏ: ít bước hơn một nhịp.
 */
export default function ProductStickyBar({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [daThem, setDaThem] = useState(false);
  const hetHang = product.stockStatus === 'out_of_stock';
  const gia = giaBan(product);

  const themVaoGio = () => {
    if (hetHang) return;
    addToCart(product);
    ghiNhanThemGio(product.slug);
    setDaThem(true);
    setTimeout(() => setDaThem(false), 1500);
  };

  const toiFormDatHang = () => {
    const form = document.getElementById('form-dat-hang');
    if (!form) return;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Chờ cuộn xong mới focus: focus trước sẽ làm trình duyệt nhảy cóc tới ô
    // nhập và huỷ luôn hiệu ứng cuộn mượt.
    setTimeout(() => {
      form.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true });
    }, 600);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <a
          href={`https://zalo.me/${ZALO}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Tư vấn qua Zalo"
          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg border border-gray-300 text-lg active:bg-gray-100"
        >
          💬
        </a>

        <div className="min-w-0 flex-1">
          <div className="text-primary-600 font-bold leading-tight truncate">
            {formatVND(gia)}
            <span className="text-gray-400 text-xs font-normal">{hauToDonVi(product)}</span>
          </div>
          {giaGach(product) !== null && (
            <div className="text-gray-400 line-through text-xs leading-tight">
              {formatVND(giaGach(product)!)}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={themVaoGio}
          disabled={hetHang}
          className="shrink-0 px-3 h-11 rounded-lg border border-primary-600 text-primary-600 font-semibold text-sm active:bg-primary-50 disabled:opacity-40"
        >
          {daThem ? '✓ Đã thêm' : '🛒 Giỏ'}
        </button>

        <button
          type="button"
          onClick={toiFormDatHang}
          disabled={hetHang}
          className="shrink-0 px-4 h-11 rounded-lg bg-primary-600 text-white font-bold text-sm active:bg-primary-700 disabled:opacity-40"
        >
          {hetHang ? 'Hết hàng' : 'MUA NGAY'}
        </button>
      </div>
    </div>
  );
}
