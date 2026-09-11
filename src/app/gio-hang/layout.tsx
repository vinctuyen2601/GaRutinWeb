import type { Metadata } from 'next';

/**
 * Giỏ hàng và trang đặt hàng không có nội dung để xếp hạng, và nội dung của
 * chúng phụ thuộc vào giỏ của từng khách nên mỗi lượt tải một khác.
 *
 * Trước đây chúng vô tình được chặn nhờ canonical trỏ về trang chủ mà cả site
 * thừa hưởng. Bỏ canonical đó đi thì phải chặn tường minh, nếu không chúng hở
 * ra và Google có thể lập chỉ mục một trang giỏ hàng rỗng.
 *
 * Đây là client component nên không tự khai metadata được — phải khai ở layout.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
