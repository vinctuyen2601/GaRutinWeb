'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { layVisitorId, layNguon, ghiNhan, type BuocPheu } from '@/lib/track';
import { CO_404 } from './Danh404';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const GA_ID = 'G-GCTB0DCD1V';
const AW_ID = 'AW-18180783236';
const VISITED_KEY = 'garutin_visited';

/**
 * Hai ngưỡng của bộ lọc lượt xem. Giữ BẰNG bên 17fishing để hai shop so sánh
 * được với nhau; đổi một bên thì phải đổi cả hai.
 *
 * 3 giây là con số chủ shop đề xuất. 15 giây cho nhánh không tương tác là ước
 * lượng: đủ dài để trình thu thập bỏ đi trước đó, đủ ngắn để người đang đọc
 * thật không bị bỏ sót.
 */
const CHO_MS = 3000;
const CHO_LAU_MS = 15000;

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

    // gtag chạy NGAY, không hoãn. Google Analytics có bộ lọc bot riêng, và
    // hoãn ở đây sẽ làm số của GA lệch khỏi số của mình theo một kiểu mới mà
    // chủ shop không nhìn thấy được. Chỉ đổi phép đếm của chính mình.
    if (typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: pathname });
      window.gtag('config', AW_ID, { page_path: pathname });
    }

    /**
     * KHÔNG đếm ngay lúc trang tải xong. Chờ dấu hiệu có người thật.
     *
     * Chuyển từ 17fishing sang ngày 22/09/2026. Lý do đo được bên GaRutin:
     * nhóm "trực tiếp" có 60 lượt của 60 "khách" KHÁC NHAU cùng dùng một chuỗi
     * User-Agent của iOS 13.2.3 — bản phát hành tháng 11/2019 — mỗi người xem
     * đúng MỘT trang. Cùng trại bot đang quét 17fishing. Chúng có chạy
     * JavaScript nên phép đếm cũ ghi nhận như khách thật.
     *
     * Hai quy tắc, cố ý khác nhau:
     *
     *   CÓ tương tác    -> gửi khi đủ CHO_MS (tương tác muộn hơn thì gửi ngay)
     *   KHÔNG tương tác -> chỉ gửi nếu tab còn HIỂN THỊ đủ CHO_LAU_MS
     *
     * Chờ suông 3 giây rồi gửi vô điều kiện thì không lọc được gì: trình thu
     * thập nào đợi network-idle cũng ở lại quá 3 giây. Thứ phân biệt được là
     * CÓ TƯƠNG TÁC hay không.
     *
     * Đánh đổi: khách vào rồi thoát trong 3 giây mà không chạm gì sẽ không còn
     * được đếm. Lượt xem sẽ tụt, và đó là chủ ý.
     *
     * `zalo_click`/`phone_click` ở effect bên dưới KHÔNG bị hoãn — bản thân
     * chúng đã là tương tác.
     */
    let daGui = false;
    let coTuongTac = false;
    let henNgan: ReturnType<typeof setTimeout> | undefined;
    let henLau: ReturnType<typeof setTimeout> | undefined;

    const gui = () => {
      if (daGui) return;
      daGui = true;
      don();
      /**
       * Đọc VÀ ghi cờ khách mới ngay tại đây, không tách ra lúc tải trang.
       *
       * Tách ra thì một lượt bị bộ lọc chặn vẫn kịp đặt cờ `garutin_visited`,
       * và lần sau người đó bị tính là khách cũ dù lượt đầu chưa bao giờ được
       * ghi. Hai con số sẽ lệch nhau mà không ai thấy.
       */
      let isNewUser = false;
      try {
        isNewUser = !localStorage.getItem(VISITED_KEY);
        if (isNewUser) localStorage.setItem(VISITED_KEY, '1');
      } catch {
        // Chế độ ẩn danh: vẫn gửi được lượt, chỉ là không nhớ được khách.
      }
      fetch(`${API_URL}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        // layNguon() đọc utm từ URL và ghi nhớ 30 ngày, nên lượt xem thứ hai
        // trở đi của cùng khách vẫn mang đúng nguồn dù URL hết tham số utm.
        body: JSON.stringify({
          path: pathname,
          isNewUser,
          event: 'view',
          visitorId: layVisitorId(),
          ...layNguon(),
        }),
      }).catch(() => {});
    };

    /**
     * `pointermove` cố ý KHÔNG có trong danh sách: trên điện thoại nó bắn kèm
     * mọi cú chạm nên thừa, trên máy tính thì con trỏ đi ngang qua cũng tính,
     * mà nhiều công cụ tự động hoá có giả lập di chuyển chuột.
     */
    const SU_KIEN = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'] as const;

    const khiTuongTac = () => {
      if (coTuongTac) return;
      coTuongTac = true;
      if (henNgan === undefined) gui();
    };

    const don = () => {
      if (henNgan !== undefined) clearTimeout(henNgan);
      if (henLau !== undefined) clearTimeout(henLau);
      henNgan = undefined;
      henLau = undefined;
      SU_KIEN.forEach((e) => window.removeEventListener(e, khiTuongTac, true));
    };

    SU_KIEN.forEach((e) =>
      window.addEventListener(e, khiTuongTac, { capture: true, passive: true }),
    );

    henNgan = setTimeout(() => {
      henNgan = undefined;
      if (coTuongTac) gui();
    }, CHO_MS);

    henLau = setTimeout(() => {
      henLau = undefined;
      // Tab bị ẩn thì không tính: trình duyệt hãm bộ đếm giờ ở tab nền, và một
      // trang mở trong tab nền chưa chắc có ai nhìn.
      if (!coTuongTac && document.visibilityState === 'visible') gui();
    }, CHO_LAU_MS);

    return () => {
      /**
       * Đã tương tác rồi rời trang TRƯỚC khi đủ CHO_MS thì vẫn phải tính.
       *
       * Bấm một liên kết là tín hiệu tham gia mạnh nhất, mà nó cũng chính là
       * thứ làm effect bị dọn. Không có nhánh này thì khách lướt nhanh biến
       * mất khỏi số liệu theo kiểu thiên lệch: càng quyết đoán càng không
       * được đếm.
       */
      if (coTuongTac) gui();
      else don();
    };
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
