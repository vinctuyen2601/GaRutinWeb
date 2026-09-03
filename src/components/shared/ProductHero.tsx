'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getYouTubeId, youtubeThumb } from '@/lib/youtube';

/**
 * Khung ảnh chính ở trang chi tiết sản phẩm.
 *
 * Có video thì VIDEO chiếm chỗ ảnh chính, ảnh lùi xuống hàng thu nhỏ. Lý do:
 * nỗi lo của khách mua cút giống là "có đúng giống không, có khoẻ không" — ảnh
 * tĩnh không trả lời được, con vật đang đi lại thì trả lời được ngay. Để video
 * xuống dưới thì phần lớn khách không cuộn tới.
 *
 * Hai loại video xử lý khác hẳn nhau:
 *
 *  - Tệp tự lưu: phát luôn, tắt tiếng, lặp vô hạn. Không có nút play — nút
 *    play thì khách lướt qua, còn hình ảnh động thì níu mắt lại. Đây mới là
 *    thứ "video thu hút hơn ảnh" nói tới.
 *
 *  - YouTube: KHÔNG nhúng sẵn. Trình phát YouTube kéo theo khoảng một megabyte
 *    JavaScript, nhúng sẵn là trang nặng thêm cho cả những người không bấm
 *    xem. Hiện ảnh đại diện trước, bấm mới nạp trình phát.
 */
export default function ProductHero({
  images,
  videoUrl,
  name,
}: {
  images: string[];
  videoUrl?: string | null;
  name: string;
}) {
  const [dangXem, setDangXem] = useState(false);

  const ytId = videoUrl ? getYouTubeId(videoUrl) : null;
  const coVideo = !!videoUrl;
  // Không có video thì ảnh đầu làm ảnh chính như cũ; có video thì mọi ảnh đều
  // xuống hàng thu nhỏ, không bỏ sót ảnh nào.
  const anhChinh = coVideo ? null : images?.[0];
  const anhNho = coVideo ? images.slice(0, 4) : images.slice(1, 5);

  return (
    <div>
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {ytId ? (
          dangXem ? (
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
              onClick={() => setDangXem(true)}
              className="absolute inset-0 w-full h-full group"
              aria-label={`Xem video ${name}`}
            >
              <Image
                src={images?.[0] || youtubeThumb(ytId)}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
                <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                  <span className="ml-1 border-y-[11px] border-y-transparent border-l-[18px] border-l-gray-900" />
                </span>
              </span>
              <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-black/60 px-2.5 py-1 rounded-full">
                Video thật quay tại trại
              </span>
            </button>
          )
        ) : coVideo ? (
          <>
            {/*
              poster: khách mạng chậm thấy ảnh ngay thay vì khung đen.
              playsInline: thiếu thuộc tính này thì Safari trên iPhone mở video
              toàn màn hình thay vì phát tại chỗ.
              muted: bắt buộc, trình duyệt chặn tự phát nếu có tiếng.
            */}
            <video
              src={videoUrl!}
              poster={images?.[0]}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute bottom-3 left-3 text-xs font-medium text-white bg-black/60 px-2.5 py-1 rounded-full">
              Video thật quay tại trại
            </span>
          </>
        ) : anhChinh ? (
          <Image
            src={anhChinh}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full text-8xl">🐦</div>
        )}
      </div>

      {anhNho.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {anhNho.map((img, i) => (
            <div
              key={i}
              className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
