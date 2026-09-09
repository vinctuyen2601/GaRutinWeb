'use client';

import { createContext, useContext } from 'react';
import type { ThongTinLienHe } from './lienHe';

/**
 * Đưa thông tin liên hệ xuống các thành phần chạy ở trình duyệt.
 *
 * Thanh dính đáy, thanh mua trên trang sản phẩm và trang đặt hàng đều là client
 * component nên không tự await được cấu hình. Lấy một lần ở layout rồi truyền
 * xuống, thay vì mỗi chỗ tự gọi API — cùng một số điện thoại mà gọi bốn lần thì
 * vừa chậm vừa có lúc bốn chỗ hiện bốn giá trị khác nhau.
 */
const Ctx = createContext<ThongTinLienHe>({
  phone: '0901234567',
  zalo: '0901234567',
  address: 'Việt Nam',
});

export function LienHeProvider({
  giaTri,
  children,
}: {
  giaTri: ThongTinLienHe;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={giaTri}>{children}</Ctx.Provider>;
}

export const useLienHe = () => useContext(Ctx);
