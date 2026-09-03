/**
 * Tách mã video từ link YouTube.
 *
 * Nhận cả bốn dạng link YouTube phát ra: watch, youtu.be, embed, và SHORTS.
 * Shorts là dạng quan trọng nhất ở đây — trại quay bằng điện thoại thì video
 * dọc, và YouTube luôn trả về link /shorts/. Bản cũ trong GallerySection chỉ
 * bắt watch và youtu.be nên dán link Shorts vào là hỏng: không ra ảnh đại
 * diện, không nhúng được, mà cũng không báo lỗi gì.
 */
export function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

/** Ảnh đại diện do YouTube dựng sẵn. */
export const youtubeThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
