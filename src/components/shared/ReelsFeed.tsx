'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import type { Khung } from '@/lib/reels';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Number(n)) + '₫';

/**
 * Luồng video vuốt dọc kiểu Reels/TikTok, mỗi khung một clip của một sản phẩm.
 *
 * Chỉ nhận clip tự lưu — video YouTube đã bị lọc từ trang cha. Khung nhúng
 * YouTube kéo theo khoảng một megabyte JavaScript mỗi cái và trình duyệt chặn
 * tự phát, không thể cho cảm giác vuốt-là-chạy liền mạch.
 *
 * Phủ toàn màn hình bằng `fixed` thay vì sửa layout gốc: header, chân trang và
 * thanh Zalo (z-50) đều nằm dưới z-[60] này.
 */
export default function ReelsFeed({
  khung,
  batDau = 0,
}: {
  khung: Khung[];
  batDau?: number;
}) {
  const router = useRouter();
  const { muaNgay } = useCart();
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [dangXem, setDangXem] = useState(batDau);
  const [tatTieng, setTatTieng] = useState(true);
  const [hienGoiY, setHienGoiY] = useState(true);

  // Gợi ý vuốt chỉ có ích ở giây đầu. Để mãi thì nó che mất chính video.
  useEffect(() => {
    const t = setTimeout(() => setHienGoiY(false), 3500);
    return () => clearTimeout(t);
  }, []);

  /**
   * Chỉ khung đang nhìn mới được phát.
   *
   * Ngưỡng 0.6 chứ không phải 0.5: ở đúng 0.5 hai khung liền nhau có thể cùng
   * vượt ngưỡng trong lúc cuộn và cùng phát một nhịp.
   *
   * Khung rời tầm nhìn thì tua về 0 chứ không chỉ dừng — quay lại nên xem từ
   * đầu, và tua về 0 cũng cắt luôn phần tải ngầm.
   */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          const i = Number(v.dataset.i);
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setDangXem(i);
            // play() có thể bị từ chối (chính sách tự phát, tab nền). Nuốt lỗi
            // chứ không để nó thành unhandled rejection làm bẩn console.
            v.play().catch(() => {});
          } else {
            v.pause();
            v.currentTime = 0;
          }
        }
      },
      { threshold: [0, 0.6, 1] },
    );
    refs.current.forEach((v) => v && obs.observe(v));
    return () => obs.disconnect();
  }, [khung.length]);

  // Mở từ trang chủ với ?i=n thì nhảy thẳng tới khung đó.
  useEffect(() => {
    if (batDau > 0) refs.current[batDau]?.scrollIntoView();
  }, [batDau]);

  useEffect(() => {
    refs.current.forEach((v) => {
      if (v) v.muted = tatTieng;
    });
  }, [tatTieng, khung.length]);

  const mua = (p: Product) => {
    muaNgay(p);
    router.push('/dat-hang');
  };

  if (khung.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] bg-black text-white flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <p className="font-semibold mb-2">Chưa có video nào</p>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Luồng này chỉ chiếu clip tải trực tiếp lên trang. Trại tải clip vào mục
          &quot;Video sản phẩm&quot; là video sẽ xuất hiện ở đây.
        </p>
        <Link
          href="/san-pham"
          className="px-6 py-2.5 rounded-full bg-white text-gray-900 font-bold text-sm no-underline"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-y-scroll snap-y snap-mandatory overscroll-contain">
      {/* Nút đóng và bật tiếng nằm ngoài vòng lặp: chúng đứng yên khi cuộn,
          không cần vẽ lại cho từng khung. */}
      <div className="fixed top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setTatTieng((t) => !t)}
          aria-label={tatTieng ? 'Bật tiếng' : 'Tắt tiếng'}
          className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-lg"
        >
          {tatTieng ? '🔇' : '🔊'}
        </button>
        <Link
          href="/san-pham"
          aria-label="Đóng"
          className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center text-xl no-underline"
        >
          ✕
        </Link>
      </div>

      {khung.map((k, i) => (
        <section
          key={`${k.product.id}-${i}`}
          // dvh chứ không vh: trên iOS thanh địa chỉ co giãn làm 100vh cao hơn
          // màn hình thật, khung bị lệch và lộ mép khung kế bên.
          className="relative h-dvh w-full snap-start snap-always flex items-center justify-center"
        >
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            src={k.videoUrl}
            poster={k.product.images?.[0]}
            loop
            muted
            playsInline
            // object-contain chứ không cover: clip quay ngang mà cắt thành 9:16
            // thì mất gần hết khung hình.
            className="max-h-full max-w-full object-contain"
            /**
             * Chỉ khung đang xem mới tải đầy đủ; khung kế tải phần đầu để vuốt
             * tới là chạy ngay; còn lại không tải gì. Với khách 4G đây là khác
             * biệt giữa dùng được và tốn hết dung lượng.
             */
            preload={i === dangXem ? 'auto' : i === dangXem + 1 ? 'metadata' : 'none'}
          />

          {/* Nền mờ dưới đáy để chữ trắng đọc được trên mọi khung hình */}
          <div className="absolute inset-x-0 bottom-0 pt-20 pb-5 px-4 bg-gradient-to-t from-black/80 to-transparent">
            <Link
              href={`/san-pham/${k.product.slug}`}
              className="text-white font-bold text-lg no-underline block leading-snug"
            >
              {k.product.name}
            </Link>
            <div className="flex items-baseline gap-2 mt-1 mb-3">
              <span className="text-white font-bold text-xl">
                {fmt(k.product.salePrice ?? k.product.price)}
              </span>
              {k.product.salePrice != null && (
                <span className="text-white/60 line-through text-sm">{fmt(k.product.price)}</span>
              )}
              <span className="text-white/60 text-sm">/{k.product.unit}</span>
            </div>
            <button
              type="button"
              onClick={() => mua(k.product)}
              className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-base active:scale-[0.98] transition-transform"
              style={{ background: '#16a34a' }}
            >
              🛒 MUA NGAY
            </button>
          </div>

          {i === 0 && hienGoiY && khung.length > 1 && (
            <div className="absolute inset-x-0 bottom-44 flex justify-center pointer-events-none">
              <span className="text-white/80 text-sm bg-black/40 px-3 py-1.5 rounded-full animate-pulse">
                Vuốt lên để xem tiếp ↑
              </span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
