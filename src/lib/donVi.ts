import type { Product } from './api';

/**
 * Hậu tố đơn vị đứng sau giá, ví dụ "/con". Trả về chuỗi rỗng khi sản phẩm
 * không bán theo đơn vị lẻ.
 *
 * Vì sao cần: cột `unit` mặc định là 'con' cho MỌI sản phẩm, kể cả combo. Trên
 * production việc đó tạo ra dòng giá đọc là
 *
 *     "Combo 5 cặp gà rutin trống mái — 500.000 đ /con"
 *
 * trong khi 500.000đ là giá của cả combo mười con. Khách đọc thành 500 nghìn
 * một con, tức 5 triệu cho combo — và loại hiểu nhầm này khách không hỏi lại,
 * chỉ lặng lẽ bỏ đi.
 *
 * Cách sửa dữ liệu: để trống `unit` với sản phẩm bán trọn gói. Hàm này bảo đảm
 * lúc đó trang không hiện ra dấu "/" cụt lủn.
 */
export function hauToDonVi(product: Pick<Product, 'unit'>): string {
  const u = (product.unit ?? '').trim();
  return u ? `/${u}` : '';
}
