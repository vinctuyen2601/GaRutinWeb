'use client';

/**
 * Đánh dấu trang hiện tại là 404 để bộ đo bỏ qua.
 *
 * TrackVisit nằm ở layout gốc nên nó chạy cho MỌI trang, kể cả trang không tồn
 * tại. Hệ quả đo được: hôm nay /blog: — một đường dẫn không có thật — đứng đầu
 * bảng với 12 lượt từ 12 khách, chiếm 28% lưu lượng cả ngày. Đó là máy quét
 * đang gõ bừa URL, không phải người đọc.
 *
 * Đặt cờ ngay trong lúc render chứ không trong useEffect: React chạy xong toàn
 * bộ render rồi mới chạy effect, nên cờ chắc chắn có mặt trước khi TrackVisit
 * kịp gửi. Làm bằng useEffect thì phải trông vào thứ tự effect giữa các nhánh
 * cây — đúng hôm nay, hỏng lúc ai đó đổi chỗ thẻ trong layout.
 */
export const CO_404 = '__garutin_404';

export default function Danh404() {
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, boolean>)[CO_404] = true;
  }
  return null;
}
