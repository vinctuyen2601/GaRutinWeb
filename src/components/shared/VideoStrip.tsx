'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Khung } from '@/lib/reels';

/**
 * Dải video ngang, dẫn vào luồng /video.
 *
 * Dùng ở trang chủ, cuối bài viết và cuối trang sản phẩm. Tách ra vì ba nơi
 * phải giống hệt nhau ở một điểm không được sai: mỗi ô mở luồng bằng
 * ?i=<số thứ tự>, mà số đó tính theo danh sách dungKhung() dựng ra. Viết lại
 * markup ở nơi thứ hai là sớm muộn hai bên lệch nhau, bấm ô này ra clip khác —
 * mà lỗi đó không báo gì cả.
 *
 * Là client component vì hai nút chuyển cần biết đang cuộn tới đâu. Dữ liệu vẫn
 * do trang phía máy chủ truyền vào, nên không phát sinh lời gọi mạng nào.
 */
export default function VideoStrip({
  khung,
  tieuDe = 'Video thật tại trại',
  toiDa = 10,
  className = '',
}: {
  khung: Khung[];
  tieuDe?: string;
  toiDa?: number;
  className?: string;
}) {
  const dai = useRef<HTMLDivElement>(null);
  const [coTruoc, setCoTruoc] = useState(false);
  const [coSau, setCoSau] = useState(false);

  const capNhatNut = useCallback(() => {
    const el = dai.current;
    if (!el) return;
    // Trừ 2px cho sai số làm tròn của trình duyệt: thiếu nó thì cuộn tới cuối
    // rồi nút "tiếp" vẫn sáng và bấm không đi đâu cả.
    setCoTruoc(el.scrollLeft > 2);
    setCoSau(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    capNhatNut();
    const el = dai.current;
    if (!el) return;
    const ro = new ResizeObserver(capNhatNut);
    ro.observe(el);
    return () => ro.disconnect();
  }, [capNhatNut, khung.length]);

  /**
   * Cuộn đúng MỘT ô mỗi lần bấm.
   *
   * Đo bề rộng ô thật thay vì cuộn theo phần trăm khung nhìn: ô rộng khác nhau
   * giữa điện thoại và máy tính, cuộn theo phần trăm thì có lúc dừng giữa hai ô
   * và nhìn như bị lệch.
   */
  const chuyen = (huong: 1 | -1) => {
    const el = dai.current;
    if (!el) return;
    const o = el.firstElementChild as HTMLElement | null;
    const buoc = o ? o.offsetWidth + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: huong * buoc, behavior: 'smooth' });
  };

  if (khung.length === 0) return null;

  const danhSach = khung.slice(0, toiDa);

  return (
    <div className={`rounded-2xl bg-gray-50 p-4 ${className}`}>
      {/* min-w-0 + shrink-0: tiêu đề dài xuống dòng trong phần của nó, không
          đẩy và không đè lên "Xem tất cả". Thiếu hai lớp này thì trên màn 390px
          hai cụm chữ chồng lên nhau. */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 min-w-0 leading-snug">
          {tieuDe}
        </h2>
        <Link
          href="/video"
          className="text-primary-600 text-sm font-medium hover:underline shrink-0 whitespace-nowrap pt-0.5"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="relative">
        <div
          ref={dai}
          onScroll={capNhatNut}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {danhSach.map((k, i) => (
            <Link
              key={`${k.product.id}-${i}`}
              href={`/video?i=${i}`}
              className="relative flex-shrink-0 snap-start rounded-xl overflow-hidden bg-gray-200 no-underline w-[180px] sm:w-[150px]"
              style={{ aspectRatio: '9/16' }}
            >
              {k.product.images?.[0] && (
                <Image
                  src={k.product.images[0]}
                  alt={k.product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 180px, 150px"
                />
              )}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-11 h-11 rounded-full bg-black/55 flex items-center justify-center">
                  <span className="ml-1 border-y-[7px] border-y-transparent border-l-[12px] border-l-white" />
                </span>
              </span>
              {/* Nền chuyển sắc vẫn cần dù thẻ đã sáng màu: chữ nằm TRÊN ẢNH,
                  ảnh sáng thì chữ trắng biến mất. */}
              <span className="absolute inset-x-0 bottom-0 p-2 pt-6 bg-gradient-to-t from-black/85 to-transparent">
                <span className="block text-white text-xs leading-tight line-clamp-2">
                  {k.product.name}
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* Nút chuyển: chỉ hiện khi còn chỗ để đi. Nút bấm không đi đâu cả còn
            khó chịu hơn là không có nút. */}
        {coTruoc && (
          <button
            type="button"
            onClick={() => chuyen(-1)}
            aria-label="Video trước"
            className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center active:scale-95"
          >
            <span className="border-y-[6px] border-y-transparent border-r-[9px] border-r-gray-700 mr-0.5" />
          </button>
        )}
        {coSau && (
          <button
            type="button"
            onClick={() => chuyen(1)}
            aria-label="Video tiếp theo"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center active:scale-95"
          >
            <span className="border-y-[6px] border-y-transparent border-l-[9px] border-l-gray-700 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
