import Image from 'next/image';
import Link from 'next/link';
import type { Khung } from '@/lib/reels';

/**
 * Dải video ngang, dẫn vào luồng /video.
 *
 * Dùng ở trang chủ và cuối bài viết. Tách ra vì hai nơi phải giống hệt nhau ở
 * một điểm không được sai: mỗi ô mở luồng bằng ?i=<số thứ tự>, mà số đó tính
 * theo danh sách dungKhung() dựng ra. Viết lại markup ở nơi thứ hai là sớm muộn
 * hai bên lệch nhau, bấm ô này ra clip khác — mà lỗi đó không báo gì cả.
 *
 * Nền tối và bo góc nằm trong chính thành phần, nên chỗ gọi chỉ cần lo khoảng
 * cách bên ngoài.
 */
export default function VideoStrip({
  khung,
  tieuDe = '🎥 Video thật tại trại',
  toiDa = 10,
  className = '',
}: {
  khung: Khung[];
  tieuDe?: string;
  toiDa?: number;
  className?: string;
}) {
  if (khung.length === 0) return null;

  return (
    <div className={`rounded-2xl bg-gray-900 p-4 ${className}`}>
      {/* min-w-0 + shrink-0: tiêu đề dài (ví dụ "Xem tận mắt trước khi mua")
          xuống dòng trong phần của nó, không đẩy và không đè lên "Xem tất cả".
          Thiếu hai lớp này thì trên màn 390px hai cụm chữ chồng lên nhau. */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-white min-w-0 leading-snug">
          {tieuDe}
        </h2>
        <Link
          href="/video"
          className="text-white/70 text-sm hover:underline shrink-0 whitespace-nowrap pt-0.5"
        >
          Xem tất cả →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {khung.slice(0, toiDa).map((k, i) => (
          <Link
            key={`${k.product.id}-${i}`}
            href={`/video?i=${i}`}
            className="relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-800 no-underline"
            style={{ width: 120, aspectRatio: '9/16' }}
          >
            {k.product.images?.[0] && (
              <Image
                src={k.product.images[0]}
                alt={k.product.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-9 h-9 rounded-full bg-black/55 flex items-center justify-center">
                <span className="ml-0.5 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 p-2 pt-6 bg-gradient-to-t from-black/85 to-transparent">
              <span className="block text-white text-xs leading-tight line-clamp-2">
                {k.product.name}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
