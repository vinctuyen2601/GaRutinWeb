'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { layVisitorId, layNguon, ghiNhan, type BuocPheu } from '@/lib/track';
import { CO_404 } from './Danh404';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const GA_ID = 'G-GCTB0DCD1V';
const AW_ID = 'AW-18180783236';
const VISITED_KEY = 'garutin_visited';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * ĐO NÚT LIÊN HỆ — Zalo và gọi điện.
 *
 * Vì sao cần: đơn thật của cả hai cửa hàng chốt qua Zalo, nhưng cú bấm sang
 * Zalo trước nay KHÔNG được ghi nhận ở đâu cả — mọi tỉ lệ liên quan tới mua
 * hàng đều thiếu tử số. Đo ngày 18/09/2026.
 *
 * Bắt bằng một bộ nghe CHUNG ở tầng document thay vì sửa từng nút, để nút thêm
 * sau này tự được đếm mà không ai phải nhớ.
 *
 * Dùng pha CAPTURE vì link rời trang ngay; ghiNhan() dùng sendBeacon nên sự
 * kiện sống sót qua lúc chuyển trang.
 */
function batNutLienHe(ghi: (ten: string, duongDan: string) => void): () => void {
  if (typeof document === 'undefined') return () => {};
  const xuLy = (e: MouseEvent) => {
    const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const ten = href.includes('zalo.me') ? 'zalo_click' : href.startsWith('tel:') ? 'phone_click' : '';
    if (!ten) return;
    ghi(ten, window.location.pathname);
  };
  document.addEventListener('click', xuLy, true);
  return () => document.removeEventListener('click', xuLy, true);
}

function TrackVisitInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Trang 404 không phải một lượt xem nội dung. Đọc rồi xoá cờ ngay: rời khỏi
    // trang 404 sang trang thật thì lượt sau phải được ghi bình thường.
    const w = window as unknown as Record<string, boolean>;
    const la404 = w[CO_404] === true;
    w[CO_404] = false;
    if (la404) return;

    const isNewUser = !localStorage.getItem(VISITED_KEY);
    if (isNewUser) localStorage.setItem(VISITED_KEY, '1');

    fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // layNguon() đọc utm từ URL và ghi nhớ 30 ngày, nên lượt xem thứ hai trở
      // đi của cùng khách vẫn mang đúng nguồn dù URL không còn tham số utm.
      body: JSON.stringify({
        path: pathname,
        isNewUser,
        event: 'view',
        visitorId: layVisitorId(),
        ...layNguon(),
      }),
    }).catch(() => {});

    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: pathname });
      window.gtag('config', AW_ID, { page_path: pathname });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(
    () => batNutLienHe((ten, duongDan) => ghiNhan(ten as BuocPheu, duongDan)),
    [],
  );

  return null;
}

export default function TrackVisit() {
  return (
    <Suspense fallback={null}>
      <TrackVisitInner />
    </Suspense>
  );
}
