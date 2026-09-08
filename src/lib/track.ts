/**
 * Ghi nhận các bước trong phễu mua hàng.
 *
 * Mọi hàm ở đây an toàn khi gọi lúc render phía máy chủ và khi trình duyệt chặn
 * localStorage — không bao giờ ném lỗi, cùng lắm là mất số liệu. Đo đạc hỏng
 * không được phép làm hỏng việc mua hàng.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const VISITOR_KEY = 'garutin_visitor_id';
const NGUON_KEY = 'garutin_nguon';

/** Giữ nguồn 30 ngày — đủ dài cho chu kỳ cân nhắc mua một cặp gà cảnh. */
const HAN_NGUON_MS = 30 * 24 * 60 * 60 * 1000;

export type Nguon = {
  platform?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  referrer?: string;
};

type NguonLuu = Nguon & { luuLuc: number };

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

/** Referrer chỉ tính khi đến từ tên miền KHÁC — điều hướng trong web không phải một nguồn. */
function referrerNgoai(): string | undefined {
  try {
    const r = document.referrer;
    if (!r) return undefined;
    return new URL(r).hostname === window.location.hostname ? undefined : r;
  } catch {
    return undefined;
  }
}

/** Nguồn của chính lần truy cập này, đọc từ URL và referrer. */
function nguonHienTai(): Nguon {
  const q = new URLSearchParams(window.location.search);
  const lay = (k: string) => q.get(k) || undefined;
  return {
    platform: lay('platform') || lay('utm_source'),
    utmSource: lay('utm_source'),
    utmMedium: lay('utm_medium'),
    utmCampaign: lay('utm_campaign'),
    utmContent: lay('utm_content'),
    referrer: referrerNgoai(),
  };
}

/**
 * Nguồn được ghi công cho khách này.
 *
 * Quy tắc: lần gần nhất khách đến từ một nguồn bên ngoài rõ ràng (có utm hoặc
 * có referrer ngoài) thì nguồn đó được ghi công và giữ 30 ngày. Truy cập trực
 * tiếp và điều hướng trong web KHÔNG ghi đè.
 *
 * Đây là điểm mấu chốt của cả tính năng: khách bấm quảng cáo hôm nay, ba hôm
 * sau gõ thẳng địa chỉ vào mua thì công vẫn thuộc về quảng cáo. Nếu để truy cập
 * trực tiếp ghi đè thì gần như lượt nào cũng thành "trực tiếp", và tiền quảng
 * cáo trông như không mang lại gì.
 */
export function layNguon(): Nguon {
  if (typeof window === 'undefined') return {};

  const bayGio = nguonHienTai();
  const coNguonNgoai = Boolean(bayGio.utmSource || bayGio.referrer);

  let daLuu: NguonLuu | null = null;
  try {
    const raw = docLocal(NGUON_KEY);
    const parsed = raw ? (JSON.parse(raw) as NguonLuu) : null;
    if (parsed && Date.now() - parsed.luuLuc < HAN_NGUON_MS) daLuu = parsed;
  } catch {
    // Dữ liệu hỏng thì coi như chưa có — đo đạc không được làm hỏng việc mua hàng.
  }

  if (!coNguonNgoai) {
    if (!daLuu) return bayGio;
    const { luuLuc: _bo, ...nguon } = daLuu;
    return nguon;
  }

  ghiLocal(NGUON_KEY, JSON.stringify({ ...bayGio, luuLuc: Date.now() }));
  return bayGio;
}

/** Gửi một bước của phễu. Lỗi mạng bị nuốt có chủ ý. */
export function ghiNhan(buoc: BuocPheu, duongDan?: string): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify({
    path: duongDan ?? window.location.pathname,
    event: buoc,
    visitorId: layVisitorId(),
    // Gửi kèm cả ở bước phễu chứ không chỉ ở lượt xem: có vậy mới trả lời được
    // "chiến dịch nào ra ĐƠN", chứ không chỉ "chiến dịch nào ra lượt xem".
    ...layNguon(),
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
