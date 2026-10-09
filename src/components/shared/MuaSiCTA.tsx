import type { ReactNode } from 'react';

/**
 * Lối liên hệ cho khách muốn mua NHIỀU HƠN mức combo bày sẵn.
 *
 * Vì sao cần: trang chỉ bày combo cố định (cặp, bộ ba…). Khách muốn lấy chục
 * con hay lấy buôn thì không có ô nào để chọn, và cũng không có chỗ nào nói
 * rằng trại bán được. Họ im lặng rời đi, và trại không bao giờ biết.
 *
 * Để một chỗ dùng chung cho cả trang chủ lẫn trang sản phẩm: lời chào mua sỉ
 * mà viết hai bản thì sớm muộn hai trang hứa hai kiểu — đúng lỗi đã phải gỡ ở
 * chỗ khác trong hai repo này.
 *
 * KHÔNG cần gắn mã đo: `TrackVisit` bắt mọi liên kết `zalo.me` và `tel:` theo
 * href ở tầng document, nên hai nút này tự được đếm.
 *
 * Gọi là "trại" chứ không phải "shop" — đó là cách GaRutin tự xưng ở mọi chỗ
 * khác trên web.
 */
export default function MuaSiCTA({
  phone,
  zalo,
  tieuDe,
  moTa,
  className = '',
}: {
  phone: string;
  zalo: string;
  tieuDe?: string;
  moTa?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-primary-200 bg-primary-50 p-5 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-1.5">
        {tieuDe ?? 'Muốn nuôi nhiều hơn?'}
      </h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        {moTa ?? (
          <>
            Các combo trên là mức bày sẵn. Lấy số lượng lớn hơn thì gọi hoặc
            nhắn Zalo cho trại — được tư vấn chọn giống theo mục đích nuôi và
            báo giá sỉ tốt nhất.
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={`tel:${phone}`}
          className="bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          📞 Gọi ngay {phone}
        </a>
        <a
          href={`https://zalo.me/${zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl border border-primary-300 hover:bg-primary-100 transition-colors"
        >
          💬 Nhắn Zalo
        </a>
      </div>
    </section>
  );
}
