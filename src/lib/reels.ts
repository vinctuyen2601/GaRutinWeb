import type { Product } from './api';
import { getYouTubeId } from './youtube';

export type Khung = { videoUrl: string; product: Product };

/**
 * Dàn phẳng video của các sản phẩm thành danh sách khung cho luồng video.
 *
 * Dùng chung cho cả trang /video lẫn dải video ở trang chủ, và đó là lý do nó
 * nằm riêng ở đây: dải ở trang chủ mở luồng bằng ?i=<số thứ tự>, nên hai nơi
 * BẮT BUỘC dựng cùng một danh sách theo cùng thứ tự. Viết hai lần là chỉ số
 * lệch nhau, khách bấm ô này lại mở ra clip khác — mà lỗi đó không báo gì cả.
 *
 * Bỏ video YouTube: khung nhúng không tự phát liền mạch được, và mỗi cái kéo
 * theo khoảng một megabyte JavaScript.
 */
export function dungKhung(products: Product[]): Khung[] {
  return products.flatMap((p) =>
    (p.videos ?? [])
      .filter((url) => !getYouTubeId(url))
      .map((videoUrl) => ({ videoUrl, product: p })),
  );
}
