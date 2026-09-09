import { getSiteConfig } from './api';

export type ThongTinLienHe = {
  phone: string;
  zalo: string;
  address: string;
};

/**
 * Số mẫu, chỉ để trang không vỡ khi chưa cấu hình gì.
 *
 * Cố ý là số rõ ràng giả: nếu nó lọt ra trang thật thì phải nhìn là biết ngay
 * đang thiếu cấu hình, chứ một số trông hợp lý sẽ im lặng nhận đơn đi đâu đó.
 */
const MAU = '0901234567';

/**
 * Thông tin liên hệ, lấy từ cấu hình trong CMS.
 *
 * Trước đây bảy tệp mỗi tệp tự đọc NEXT_PUBLIC_PHONE, nên đổi số phải sửa biến
 * môi trường rồi build lại toàn bộ web — chủ trại không tự làm được. Nay sửa
 * trong CMS là đổi khắp nơi.
 *
 * Biến môi trường vẫn giữ làm lớp đỡ: API hỏng hoặc cấu hình bị xoá trắng thì
 * trang vẫn hiện đúng số cũ thay vì hiện số mẫu.
 */
export async function layLienHe(): Promise<ThongTinLienHe> {
  const duPhong: ThongTinLienHe = {
    phone: process.env.NEXT_PUBLIC_PHONE || MAU,
    zalo: process.env.NEXT_PUBLIC_ZALO_PHONE || MAU,
    address: 'Việt Nam',
  };
  try {
    const c = await getSiteConfig();
    return {
      phone: c?.phone?.trim() || duPhong.phone,
      zalo: c?.zalo?.trim() || duPhong.zalo,
      address: c?.address?.trim() || duPhong.address,
    };
  } catch {
    return duPhong;
  }
}
