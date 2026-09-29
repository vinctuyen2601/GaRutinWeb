import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * Làm mới trang theo YÊU CẦU, để backend gọi khi chủ shop lưu nội dung.
 *
 * Vì sao cần: Vercel tính tiền theo lượt GHI ISR, và gói miễn phí cho 200.000
 * lượt một tháng. Trước khi có route này, cách duy nhất để nội dung mới lên
 * web là đặt `revalidate` thật ngắn — 120 giây ở trang chi tiết. Vercel lại
 * ép trần cửa sổ xuống 300 giây, nên mỗi URL có thể ghi tới 288 lần một ngày.
 * Với 197 URL của hai shop, chỉ cần bot quét sitemap đều đặn là cạn hạn mức
 * (cạn thật ngày 29/09/2026).
 *
 * Có route này thì `revalidate` đặt dài bao nhiêu cũng được: nội dung mới lên
 * NGAY khi bấm lưu, còn nền thì gần như không ghi nữa.
 *
 * Bảo vệ bằng bí mật dùng chung ở header. Không dùng query string: query nằm
 * trong log truy cập của CloudFront và của Vercel, header thì không.
 */
export const dynamic = 'force-dynamic';

const BI_MAT = process.env.REVALIDATE_SECRET;

export async function POST(req: Request) {
  if (!BI_MAT) {
    // Thiếu biến môi trường thì TỪ CHỐI, đừng mở toang. Một route làm mới
    // không khoá là cách để người lạ đốt sạch hạn mức ISR của mình.
    return NextResponse.json({ loi: 'chưa cấu hình REVALIDATE_SECRET' }, { status: 503 });
  }
  if (req.headers.get('x-revalidate-secret') !== BI_MAT) {
    return NextResponse.json({ loi: 'sai bí mật' }, { status: 401 });
  }

  let than: { duongDan?: string[] };
  try {
    than = await req.json();
  } catch {
    return NextResponse.json({ loi: 'thân yêu cầu không phải JSON' }, { status: 400 });
  }

  const ds = (than.duongDan || [])
    .filter((p) => typeof p === 'string' && p.startsWith('/'))
    .slice(0, 50); // chặn một lời gọi làm mới cả site

  if (!ds.length) {
    return NextResponse.json({ loi: 'thiếu duongDan' }, { status: 400 });
  }

  for (const p of ds) revalidatePath(p);
  return NextResponse.json({ daLamMoi: ds, luc: new Date().toISOString() });
}
