'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getYouTubeId, youtubeThumb } from '@/lib/youtube';

type Media = { type: 'video' | 'image'; url: string };

/**
 * Khung ảnh/video ở trang chi tiết sản phẩm.
 *
 * Video đứng TRƯỚC ảnh. Nỗi lo của khách mua cút giống là "có đúng giống
 * không, có khoẻ không" — ảnh tĩnh không trả lời được, con vật đang đi lại thì
 * trả lời ngay. Để video xuống dưới thì phần lớn khách không cuộn tới.
 *
 * Ba loại media xử lý khác hẳn nhau:
 *
 *  - Tệp video tự lưu: phát luôn, tắt tiếng, lặp vô hạn, không có nút play.
 *    Nút play thì khách lướt qua; hình ảnh động mới níu mắt lại.
 *
 *  - YouTube: KHÔNG nhúng sẵn. Trình phát YouTube kéo theo khoảng một megabyte
 *    JavaScript, nhúng sẵn là bắt cả những người không bấm xem phải tải. Hiện
 *    ảnh đại diện trước, bấm mới nạp.
 *
 *  - Ảnh: next/image như cũ.
 *
 * Chỉ dựng media ĐANG chọn. Dựng hết rồi ẩn bằng CSS thì các video khác vẫn
 * tải và vẫn chạy ngầm — tốn dữ liệu của khách mà không ai xem.
 */
export default function ProductHero({
  images,
  videos,
  name,
}: {
  images: string[];
  videos?: string[] | null;
  name: string;
}) {
  const [idx, setIdx] = useState(0);
  // Bấm play là chuyện của riêng từng video YouTube. Lưu theo chỉ số chứ không
  // dùng một cờ chung: chuyển sang media khác rồi quay lại thì không nên tự
  // phát tiếp, mà cũng không nên bắt bấm lại từ đầu.
  const [dangXem, setDangXem] = useState<number | null>(null);

  const media: Media[] = [
    ...(videos ?? []).map((url) => ({ type: 'video' as const, url })),
    ...(images ?? []).map((url) => ({ type: 'image' as const, url })),
  ];

  const hienTai = media[idx];
  const ytId = hienTai?.type === 'video' ? getYouTubeId(hienTai.url) : null;
  // Ảnh đầu tiên làm ảnh chờ cho video: khách mạng chậm thấy ngay thứ gì đó
  // thay vì khung đen.
  const anhCho = images?.[0];

  const di = (buoc: number) =>
    setIdx((i) => Math.min(Math.max(i + buoc, 0), media.length - 1));

  return (
    <div>
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 select-none"
        onTouchStart={(e) => {
          (e.currentTarget as HTMLDivElement).dataset.tx = String(e.touches[0].clientX);
        }}
        onTouchEnd={(e) => {
          const tx = Number((e.currentTarget as HTMLDivElement).dataset.tx ?? 0);
          const dx = e.changedTouches[0].clientX - tx;
          // Ngưỡng 40px để không nhầm cú chạm run tay thành vuốt.
          if (Math.abs(dx) > 40) di(dx < 0 ? 1 : -1);
        }}
      >
        {!hienTai ? (
          <div className="flex items-center justify-center h-full text-8xl">🐦</div>
        ) : ytId ? (
          dangXem === idx ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title={name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setDangXem(idx)}
              className="absolute inset-0 w-full h-full group"
              aria-label={`Xem video ${name}`}
            >
              <Image
                src={anhCho || youtubeThumb(ytId)}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={idx === 0}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                  <span className="ml-1 border-y-[11px] border-y-transparent border-l-[18px] border-l-gray-900" />
                </span>
              </span>
            </button>
          )
        ) : hienTai.type === 'video' ? (
          <video
            // key: đổi media là React dựng thẻ mới thay vì đổi src trên thẻ cũ.
            // Không có key thì trình duyệt giữ lại trạng thái phát của video
            // trước và tiếng/hình có thể chạy tiếp sang media mới.
            key={hienTai.url}
            src={hienTai.url}
            poster={anhCho}
            autoPlay
            muted
            loop
            // playsInline: thiếu thì Safari trên iPhone mở toàn màn hình thay
            // vì phát tại chỗ.
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={hienTai.url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={idx === 0}
          />
        )}

        {hienTai?.type === 'video' && dangXem !== idx && (
          <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-black/60 px-2.5 py-1 rounded-full pointer-events-none">
            Video thật quay tại trại
          </span>
        )}

        {/* Mũi tên chỉ hiện khi còn chỗ để đi, để không có nút bấm vô tác dụng */}
        {media.length > 1 && idx > 0 && (
          <button
            type="button"
            onClick={() => di(-1)}
            aria-label="Ảnh trước"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 shadow flex items-center justify-center"
          >
            <span className="border-y-[7px] border-y-transparent border-r-[10px] border-r-gray-900 -ml-0.5" />
          </button>
        )}
        {media.length > 1 && idx < media.length - 1 && (
          <button
            type="button"
            onClick={() => di(1)}
            aria-label="Ảnh sau"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 shadow flex items-center justify-center"
          >
            <span className="border-y-[7px] border-y-transparent border-l-[10px] border-l-gray-900 ml-0.5" />
          </button>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              key={`${m.type}-${m.url}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Xem ${m.type === 'video' ? 'video' : 'ảnh'} ${i + 1}`}
              aria-current={i === idx}
              className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
              style={{
                outline: i === idx ? '2px solid #16a34a' : 'none',
                outlineOffset: -2,
              }}
            >
              {m.type === 'video' ? (
                <>
                  {getYouTubeId(m.url) ? (
                    <Image
                      src={youtubeThumb(getYouTubeId(m.url)!)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    // Thẻ video thay vì ảnh: tệp tự lưu không có ảnh đại diện
                    // sẵn, trình duyệt tự dựng khung hình đầu.
                    <video
                      src={m.url}
                      muted
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-6 h-6 rounded-full bg-black/55 flex items-center justify-center">
                      <span className="ml-0.5 border-y-[4px] border-y-transparent border-l-[7px] border-l-white" />
                    </span>
                  </span>
                </>
              ) : (
                <Image src={m.url} alt="" fill className="object-cover" sizes="80px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
