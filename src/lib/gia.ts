/**
 * Luật hiển thị giá — một nơi duy nhất quyết định, để mọi trang nói giống nhau.
 *
 * Chỉ hiện giá gạch khi giá sale THẤP HƠN giá niêm yết. Trước đây các trang chỉ
 * kiểm tra "có điền giá sale hay không", nên một sản phẩm có sale bằng đúng giá
 * niêm yết vẫn hiện gạch ngang lên chính con số khách đang trả — giảm 0% nhưng
 * trông như đang khuyến mãi. Trên 17Fishing có đúng một sản phẩm như vậy.
 *
 * Sale cao hơn giá niêm yết thì coi như không có sale, và khách trả giá niêm
 * yết. Đó là dữ liệu nhập nhầm; nghiêng về phía có lợi cho khách là lựa chọn
 * an toàn hơn, và không im lặng thu thêm tiền.
 */

type CoGia = { price: number | string; salePrice?: number | string | null };

const so = (v: number | string | null | undefined): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Có đang giảm giá thật hay không. */
export function dangGiamGia(p: CoGia): boolean {
  const sale = so(p.salePrice);
  const goc = so(p.price);
  return sale > 0 && goc > 0 && sale < goc;
}

/** Số tiền khách thật sự phải trả. */
export function giaBan(p: CoGia): number {
  return dangGiamGia(p) ? so(p.salePrice) : so(p.price);
}

/** Giá gạch ngang, hoặc null khi không có khuyến mãi thật. */
export function giaGach(p: CoGia): number | null {
  return dangGiamGia(p) ? so(p.price) : null;
}

/** Phần trăm giảm, làm tròn. 0 khi không giảm. */
export function phanTramGiam(p: CoGia): number {
  if (!dangGiamGia(p)) return 0;
  return Math.round((1 - so(p.salePrice) / so(p.price)) * 100);
}
