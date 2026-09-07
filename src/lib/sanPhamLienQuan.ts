import type { Post, Product } from './api';

/**
 * Chỉ hạ chữ thường, GIỮ NGUYÊN DẤU.
 *
 * Không bỏ dấu như chỗ ghép bài viết, vì tiếng Việt bỏ dấu sẽ gộp những từ khác
 * nghĩa hẳn nhau. Đúng cặp gây hại ở đây: "lông" và "lồng" đều thành "long" —
 * và bài về màu LÔNG liền được gợi ý cái LỒNG. Đã đo thật trên bài "Gà Rutin
 * Màu Đen ... Giữ Màu Lông Đẹp": nó xếp lồng lên đầu.
 *
 * Giữ dấu an toàn ở đây vì cả tên sản phẩm lẫn tiêu đề bài đều viết có dấu.
 * Chỉ một phần tag là viết không dấu, mà những tag đó ("nuoi ga", "ga rutin")
 * đều nằm trong danh sách từ vô nghĩa nên không mất gì.
 */
function chuanHoa(s: string): string {
  return s.toLowerCase();
}

/**
 * Cặp từ chỉ cùng một thứ nhưng người viết bài và người đặt tên sản phẩm dùng
 * khác nhau. Không có bảng này thì bài "làm CHUỒNG gà rutin" không bao giờ ghép
 * được với sản phẩm "LỒNG gà rutin cao cấp" — đúng cặp quan trọng nhất, vì
 * chuồng là nhóm bài mạnh nhất và lồng là sản phẩm duy nhất tự tìm được khách.
 */
const DONG_NGHIA: Record<string, string[]> = {
  chuồng: ['lồng'],
  lồng: ['chuồng'],
  úm: ['lồng', 'chuồng'],
};

/** Từ có mặt ở hầu hết tên sản phẩm nên không nói lên điều gì về sự liên quan. */
const TU_VO_NGHIA = new Set([
  'gà', 'ga', 'rutin', 'của', 'và', 'cho', 'size', 'cấp', 'cao', 'nuôi', 'nuoi',
]);

function tachTu(s: string): string[] {
  return chuanHoa(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2 && !TU_VO_NGHIA.has(t));
}

/**
 * Chọn sản phẩm liên quan tới một bài viết.
 *
 * Trước đây trang bài viết lấy `sanPham.filter(isFeatured).slice(0, 4)` — cùng
 * bốn sản phẩm hiện dưới cả 90 bài, bất kể bài nói về gì. Bài hướng dẫn làm
 * chuồng và bài mua gà ở TP HCM chào bán y hệt nhau.
 *
 * Ghép qua TÊN sản phẩm, vì sản phẩm không có tag và hầu hết không có danh mục
 * — chỉ còn tên là thứ mang thông tin.
 *
 * Điểm cộng theo độ hiếm của từ chứ không phải mỗi từ chung một điểm: "combo"
 * hay "mai" xuất hiện ở nhiều sản phẩm nên gần như vô nghĩa, còn "long" hay
 * "um" chỉ có ở vài cái mới là tín hiệu thật.
 *
 * Không đủ sản phẩm khớp thì bù bằng hàng nổi bật, để khối này không bao giờ
 * trống hay ngắn cụt — nó vẫn là chỗ chào hàng chứ không chỉ là gợi ý.
 */
export function chonSanPhamLienQuan(
  bai: Post,
  sanPham: Product[],
  soLuong = 4,
): Product[] {
  const dung = sanPham.filter((p) => p.isActive);
  if (dung.length === 0) return [];

  // Đếm số sản phẩm chứa mỗi từ, để biết từ nào hiếm từ nào phổ thông.
  const tanSuat = new Map<string, number>();
  for (const p of dung) {
    for (const t of new Set(tachTu(p.name))) {
      tanSuat.set(t, (tanSuat.get(t) ?? 0) + 1);
    }
  }

  const tuBai = new Set(tachTu(`${bai.title} ${(bai.tags ?? []).join(' ')}`));
  for (const t of [...tuBai]) {
    for (const dn of DONG_NGHIA[t] ?? []) tuBai.add(dn);
  }

  const tong = Math.max(1, dung.length);
  const chamDiem = (p: Product): number => {
    let diem = 0;
    for (const t of new Set(tachTu(p.name))) {
      if (tuBai.has(t)) diem += Math.log(tong / (tanSuat.get(t) ?? 1));
    }
    return diem;
  };

  // Kiểu Product của web không khai sortOrder (máy chủ có trả nhưng không dùng
  // tới), nên phân định tiếp bằng tên để thứ tự luôn ổn định giữa các lần dựng.
  const uuTien = (a: Product, b: Product) =>
    Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name);

  const khop = dung
    .map((p) => ({ p, diem: chamDiem(p) }))
    .filter((x) => x.diem > 0)
    .sort((a, b) => b.diem - a.diem || uuTien(a.p, b.p))
    .map((x) => x.p);

  if (khop.length >= soLuong) return khop.slice(0, soLuong);

  const daChon = new Set(khop.map((p) => p.id));
  const bu = dung
    .filter((p) => !daChon.has(p.id) && p.isFeatured)
    .sort(uuTien)
    .slice(0, soLuong - khop.length);
  return [...khop, ...bu];
}
