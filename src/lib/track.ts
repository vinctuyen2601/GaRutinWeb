/**
 * Ghi nhận các bước trong phễu mua hàng.
 *
 * Mọi hàm ở đây an toàn khi gọi lúc render phía máy chủ và khi trình duyệt chặn
 * localStorage — không bao giờ ném lỗi, cùng lắm là mất số liệu. Đo đạc hỏng
 * không được phép làm hỏng việc mua hàng.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const VISITOR_KEY = 'garutin_visitor_id';

export type BuocPheu = 'view' | 'add_to_cart' | 'begin_checkout';

function docLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function ghiLocal(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {
    // Chế độ ẩn danh hoặc webview thắt chặt: vẫn gửi được sự kiện, chỉ là lần
    // sau không nhận ra cùng một người.
  }
}

/**
 * Mã nhận diện người xem, giữ trong trình duyệt.
 *
 * Có mã này mới đếm được số NGƯỜI thay vì số lượt: một người mở lại trang sản
 * phẩm năm lần không phải là năm người quan tâm. Trả về chuỗi rỗng khi chạy
 * phía máy chủ.
 */
export function layVisitorId(): string {
  if (typeof window === 'undefined') return '';
  const cu = docLocal(VISITOR_KEY);
  if (cu) return cu;
  const moi =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  ghiLocal(VISITOR_KEY, moi);
  return moi;
}

/** Gửi một bước của phễu. Lỗi mạng bị nuốt có chủ ý. */
export function ghiNhan(buoc: BuocPheu, duongDan?: string): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    path: duongDan ?? window.location.pathname,
    event: buoc,
    visitorId: layVisitorId(),
  });
  try {
    // sendBeacon sống sót khi trang đang chuyển đi — "vào đặt hàng" và "thêm
    // giỏ rồi bấm mua ngay" đều xảy ra ngay trước lúc điều hướng, dùng fetch
    // thường thì trình duyệt huỷ yêu cầu và mất đúng những bước quan trọng nhất.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_URL}/track`, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    // Rơi xuống fetch bên dưới.
  }
  fetch(`${API_URL}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

/** Ghi nhận thêm giỏ cho một sản phẩm, dùng đúng đường dẫn để khớp với lượt xem. */
export function ghiNhanThemGio(slug: string): void {
  ghiNhan('add_to_cart', `/san-pham/${slug}`);
}
