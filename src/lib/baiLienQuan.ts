import type { Post } from './api';

/**
 * Chuẩn hoá tag để so khớp.
 *
 * Bắt buộc phải bỏ dấu và hạ chữ thường: dữ liệu thật có "gà rutin" ở 54 bài,
 * "ga rutin" ở 18 bài và "Gà Rutin" ở 11 bài — cùng một thứ nhưng so sánh
 * nguyên văn thì thành ba tag khác nhau, và phần lớn bài sẽ không ghép được với
 * nhau dù nói về đúng một chủ đề.
 */
function chuanHoa(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chọn các bài viết thật sự liên quan tới một bài.
 *
 * Trước đây chỗ này là `allPosts.slice(0, 4)` — tức cùng 4 bài mới nhất hiện
 * dưới cả 90 bài viết. Đo trên dữ liệu thật: hai trong bốn bài đó có 0 người
 * đọc dù được liên kết từ toàn bộ 90 trang, còn 86 bài còn lại không thể tới
 * được từ bất kỳ bài nào khác.
 *
 * Cách tính điểm:
 *
 * - Mỗi tag chung cộng điểm theo độ HIẾM của tag (nghịch đảo tần suất), không
 *   phải mỗi tag một điểm. Lý do: "gà rutin" có mặt ở 54/90 bài nên nó không
 *   nói lên điều gì về sự liên quan; đếm đều nhau thì tag phổ thông lấn át và
 *   kết quả gần như ngẫu nhiên. Tag chỉ xuất hiện vài lần mới là tín hiệu thật.
 * - Cùng danh mục cộng thêm một khoản vừa phải, đủ để phân định khi điểm tag
 *   ngang nhau nhưng không đủ để lấn át một tag hiếm trùng nhau.
 * - Bằng điểm thì bài mới hơn được ưu tiên.
 *
 * Luôn trả về đủ `soLuong` bài nếu blog có đủ: hết bài liên quan thì bù bằng
 * bài mới nhất, để khối "Đọc thêm" không bao giờ trống hay ngắn cụt.
 */
export function chonBaiLienQuan(
  baiHienTai: Post,
  tatCa: Post[],
  soLuong = 4,
): Post[] {
  const ungVien = tatCa.filter(
    (p) => p.slug !== baiHienTai.slug && p.status === 'published',
  );
  if (ungVien.length === 0) return [];

  // Đếm số bài chứa mỗi tag, để biết tag nào hiếm tag nào phổ thông.
  const tanSuat = new Map<string, number>();
  for (const p of tatCa) {
    for (const t of new Set((p.tags ?? []).map(chuanHoa))) {
      if (t) tanSuat.set(t, (tanSuat.get(t) ?? 0) + 1);
    }
  }

  const tong = Math.max(1, tatCa.length);
  const tagCuaBai = new Set((baiHienTai.tags ?? []).map(chuanHoa).filter(Boolean));

  const chamDiem = (p: Post): number => {
    let diem = 0;
    for (const t of new Set((p.tags ?? []).map(chuanHoa))) {
      if (!t || !tagCuaBai.has(t)) continue;
      // log(tổng / số bài có tag): tag ở 54/90 bài được ~0.5, tag ở 2/90 bài
      // được ~3.8. Tự điều chỉnh theo dữ liệu, không cần ngưỡng tự đặt.
      diem += Math.log(tong / (tanSuat.get(t) ?? 1));
    }
    if (p.category && baiHienTai.category && p.category === baiHienTai.category) {
      diem += 1;
    }
    return diem;
  };

  const moiHon = (a: Post, b: Post) =>
    new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime();

  const coDiem = ungVien
    .map((p) => ({ p, diem: chamDiem(p) }))
    .filter((x) => x.diem > 0)
    .sort((a, b) => b.diem - a.diem || moiHon(a.p, b.p))
    .map((x) => x.p);

  if (coDiem.length >= soLuong) return coDiem.slice(0, soLuong);

  // Bù cho đủ số lượng bằng bài mới nhất chưa được chọn.
  const daChon = new Set(coDiem.map((p) => p.slug));
  const bu = ungVien
    .filter((p) => !daChon.has(p.slug))
    .sort(moiHon)
    .slice(0, soLuong - coDiem.length);
  return [...coDiem, ...bu];
}
