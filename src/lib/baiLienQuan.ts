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
 * Tách tiêu đề thành tập từ để so khớp.
 *
 * KHÔNG bỏ dấu, khác hẳn chuanHoa() dùng cho tag.
 *
 * Bỏ dấu làm chập từ khác nghĩa, và vốn từ của shop này dính nặng nhất:
 * `lông` và `lồng` đều thành `long`, `chuồng` và `chuông` đều thành `chuong` —
 * cả hai cặp đều là từ hay gặp ở đây (lông gà, lồng nuôi, chuồng trại). Ghép
 * chúng lại là bài về lông vũ bỗng "liên quan" tới bài về lồng nuôi. Đã dính
 * BA LẦN ở dự án này. Tag thì chấp nhận được vì tag do người nhập, ít và đã
 * thống nhất; tiêu đề là văn tự do nên không được phép.
 *
 * Không có danh sách từ dừng tự đặt: từ nào xuất hiện ở nhiều tiêu đề sẽ tự bị
 * cân về gần 0 bởi log(tổng/tần suất), đúng cách đang làm với tag. Danh sách
 * tự đặt còn nguy hơn — "cần" vừa là từ dừng vừa là "cần câu".
 */
/**
 * Chữ đệm trong tiêu đề — không tính điểm liên quan.
 *
 * Danh sách này rút ra từ 17fishing (xem bản bên đó để biết hai cách đã thử và
 * thất bại: cân theo độ hiếm, rồi bình phương độ hiếm — từ đệm và từ chuyên môn
 * nằm cùng dải tần suất nên không ngưỡng nào tách được).
 *
 * Luật chặt khi thêm từ: CHỈ nhận từ không thể là thuật ngữ của shop này. Vì
 * thế KHÔNG có trong danh sách: gà, cút, trứng, lồng, chuồng, ấp, mái, trống,
 * giống, thức ăn, cám.
 * "gà rutin" cũng không cần vào đây: tag đó ở 47/69 bài nên độ hiếm đã tự dìm
 * nó về gần 0.
 */
const CHU_DEM = new Set([
  'và', 'khi', 'cho', 'về', 'với', 'của', 'các', 'những', 'một', 'trong', 'để',
  'từ', 'là', 'có', 'không', 'nên', 'như', 'thế', 'nào', 'sao', 'tại', 'này',
  'đó', 'ở', 'mà', 'thì', 'hay', 'hoặc', 'bạn', 'ai', 'gì', 'ra', 'nhé',
  'hướng', 'dẫn', 'chọn', 'cách', 'kinh', 'nghiệm', 'lựa', 'bí', 'quyết',
  'top', 'tổng', 'hợp', 'phù', 'chuẩn', 'nhất', 'hiệu', 'quả', 'mới', 'tốt',
  'dễ', 'làm', 'điều', 'biết', 'thường', 'gặp', 'nhiều', 'ít', 'rất',
  // Bên 17fishing phải cố ý GIỮ LẠI 'cần' vì "cần câu" là nhóm hàng chính.
  // Ở đây 'cần' không phải thuật ngữ, nhưng vẫn để ngoài danh sách cho hai bản
  // giống hệt nhau — lệch một từ là sau này không ai dám chép qua lại nữa.
]);

function tuTieuDe(tieuDe: string): Set<string> {
  return new Set(
    (tieuDe ?? '')
      .normalize('NFC')
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length >= 2 && !CHU_DEM.has(t)),
  );
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

  const tanSuatTu = new Map<string, number>();
  for (const p of tatCa) {
    for (const t of tuTieuDe(p.title)) tanSuatTu.set(t, (tanSuatTu.get(t) ?? 0) + 1);
  }

  const tong = Math.max(1, tatCa.length);
  const tagCuaBai = new Set((baiHienTai.tags ?? []).map(chuanHoa).filter(Boolean));
  const tuCuaBai = tuTieuDe(baiHienTai.title);

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

    /*
     * Từ chung trong TIÊU ĐỀ, cùng công thức độ hiếm.
     *
     * Shop này KHÔNG hỏng nặng như 17fishing — tag ở đây tử tế hơn nhiều (247
     * tag khác nhau, phổ biến nhất "gà rutin" ở 68% chứ không phải 94%), nên
     * tầng tag vẫn làm được việc.
     *
     * Nhưng đo 15/09/2026 vẫn thấy cải thiện thật khi cộng điểm tiêu đề:
     *
     *   bản cũ   mồ côi 4/69 · 4 bài đầu ôm 20% · nhiều nhất 15 link
     *   bản này  mồ côi 2/69 · 4 bài đầu ôm 14% · nhiều nhất 11 link
     *
     * Giữ chung một bản với 17fishing để hai bên đừng trôi dạt tiếp — chỗ này
     * đã có tiền lệ: tracking.service.ts hai shop lệch nhau 1.107 dòng.
     */
    for (const t of tuTieuDe(p.title)) {
      if (!tuCuaBai.has(t)) continue;
      // BÌNH PHƯƠNG độ hiếm, khác với tag.
      //
      // Tag do người nhập nên đã là từ chuyên môn. Tiêu đề là văn tự do, đầy
      // chữ đệm. Những chữ này hiếm vừa phải nên vẫn ghi điểm, mà một tiêu đề
      // có tới năm sáu chữ như vậy — cộng dồn lại chúng đè bẹp một từ chuyên
      // môn duy nhất. Bình phương kéo từ ở 4 tiêu đề (10,6 điểm) vượt hẳn từ ở
      // 25 tiêu đề (2,0 điểm).
      const hiem = Math.log(tong / (tanSuatTu.get(t) ?? 1));
      diem += hiem * hiem;
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

  // Cạn ứng viên có điểm mới bù bằng bài mới nhất, để khối không ngắn cụt.
  const daChon = new Set(coDiem.map((p) => p.slug));
  const bu = ungVien
    .filter((p) => !daChon.has(p.slug))
    .sort(moiHon)
    .slice(0, soLuong - coDiem.length);
  return [...coDiem, ...bu];
}
