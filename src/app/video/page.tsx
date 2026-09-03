import type { Metadata, Viewport } from 'next';
import { getProducts, type Product } from '@/lib/api';
import { dungKhung } from '@/lib/reels';
import ReelsFeed from '@/components/shared/ReelsFeed';

export const metadata: Metadata = {
  title: 'Video trang trại',
  description: 'Clip thật quay tại trang trại, xem và đặt hàng ngay.',
  // Trang này gần như không có nội dung chữ để xếp hạng, và mỗi khung đều dẫn
  // về trang sản phẩm tương ứng — nơi Google nên gửi người tìm tới.
  robots: { index: false, follow: true },
};

/**
 * viewport-fit=cover chỉ khai cho riêng trang này, không khai ở layout gốc.
 *
 * Không có nó thì env(safe-area-inset-*) luôn bằng 0 và nút bấm chui xuống dưới
 * tai thỏ / vạch home của iPhone. Nhưng khai ở layout gốc là mọi trang khác
 * cũng cho nội dung tràn vào vùng đó — cả web phải rà lại, không đáng.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export const revalidate = 60;

/**
 * Luồng video vuốt dọc, mỗi khung một clip của một sản phẩm.
 *
 * Không có endpoint riêng ở backend: trang tự gọi getProducts() rồi dàn phẳng.
 * Với chừng hai chục sản phẩm thì payload nhỏ, và tránh được một lần deploy
 * backend cùng rủi ro migration đi kèm.
 */
export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<{ i?: string }>;
}) {
  const { i } = await searchParams;
  const products = await getProducts().catch((): Product[] => []);

  const khung = dungKhung(products);

  const batDau = Math.min(Math.max(Number(i ?? 0) || 0, 0), Math.max(khung.length - 1, 0));

  return <ReelsFeed khung={khung} batDau={batDau} />;
}
