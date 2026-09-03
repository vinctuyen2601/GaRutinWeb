'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/api';
import type { Khung } from '@/lib/reels';
import OrderForm from './OrderForm';

/**
 * Bề rộng cột nội dung.
 *
 * Điện thoại (dưới 480px) thì phủ kín màn hình như TikTok. Máy tính thì bó lại
 * thành một cột dáng điện thoại giữa màn hình, đúng cách Instagram và TikTok
 * làm trên web — thả video dọc ra giữa màn 1440px thì nó bé tí giữa biển đen và
 * nút mua kéo dài cả mét.
 */
const COT = 'min(100%, 480px)';

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
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [dangXem, setDangXem] = useState(batDau);
  const [tatTieng, setTatTieng] = useState(true);
  const [hienGoiY, setHienGoiY] = useState(true);
  /** Sản phẩm đang mở tấm đặt hàng. null là chưa mở. */
  const [dangMua, setDangMua] = useState<Product | null>(null);

  /**
   * Khoá cuộn của trang nền khi luồng đang mở.
   *
   * Luồng phủ `fixed inset-0` nên trang dưới vẫn cuộn được. Trên điện thoại,
   * vuốt ở mép luồng có thể ăn sang trang nền và kéo theo cả thao tác kéo-để-
   * tải-lại của trình duyệt, làm mất khung đang xem.
   */
  useEffect(() => {
    const cu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = cu;
    };
  }, []);

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

  /**
   * Chạm vào video để dừng/phát.
   *
   * Thói quen sẵn có từ TikTok và Reels: muốn nhìn kỹ con giống thì chạm cho
   * dừng lại. Không có nó thì khách phải xem clip lặp mãi.
   */
  const chamVideo = (i: number) => {
    const v = refs.current[i];
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  /**
   * Mở tấm đặt hàng ngay trên video, không rời luồng.
   *
   * Trước đây nút này điều hướng sang /dat-hang — đúng chức năng nhưng mất hẳn
   * cảm giác TikTok: đang xem thì bị ném sang trang khác, xem tiếp phải quay
   * lại từ đầu. Nay tấm trượt lên, đặt xong đóng lại là xem tiếp đúng chỗ cũ.
   *
   * Tạm dừng video khi tấm mở. TikTok để chạy tiếp, nhưng ở đây khách đang gõ
   * tên và địa chỉ — bàn phím che gần hết màn hình nên video không ai thấy, mà
   * vẫn tốn dung lượng. Đóng tấm là chạy tiếp từ đúng chỗ đang dừng, không tua
   * về đầu.
   */
  const moMua = (p: Product) => {
    refs.current[dangXem]?.pause();
    setDangMua(p);
  };

  const dongMua = () => {
    setDangMua(null);
    refs.current[dangXem]?.play().catch(() => {});
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
          không cần vẽ lại cho từng khung.
          Căn theo mép phải của CỘT chứ không của màn hình — trên máy tính cột
          chỉ rộng 480px, dán nút vào góc màn hình thì chúng lạc lõng cách video
          cả nửa mét.
          paddingTop theo safe-area: thiếu là nút chui dưới tai thỏ iPhone. */}
      <div
        className="fixed inset-x-0 z-10 flex justify-end gap-2 px-4 pointer-events-none"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="w-full mx-auto flex justify-end gap-2 pointer-events-auto" style={{ maxWidth: COT }}>
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
      </div>

      {khung.map((k, i) => (
        <section
          key={`${k.product.id}-${i}`}
          // dvh chứ không vh: trên iOS thanh địa chỉ co giãn làm 100vh cao hơn
          // màn hình thật, khung bị lệch và lộ mép khung kế bên.
          className="relative h-dvh w-full snap-start snap-always flex items-center justify-center"
        >
          <div className="relative h-full w-full mx-auto flex items-center justify-center" style={{ maxWidth: COT }}>
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
            onClick={() => chamVideo(i)}
            className="max-h-full max-w-full object-contain cursor-pointer"
            /**
             * Chỉ khung đang xem mới tải đầy đủ; khung kế tải phần đầu để vuốt
             * tới là chạy ngay; còn lại không tải gì. Với khách 4G đây là khác
             * biệt giữa dùng được và tốn hết dung lượng.
             */
            preload={i === dangXem ? 'auto' : i === dangXem + 1 ? 'metadata' : 'none'}
          />

          {/* Nền mờ dưới đáy để chữ trắng đọc được trên mọi khung hình */}
          {/* paddingBottom theo safe-area: thiếu là nút MUA NGAY nằm dưới vạch
              home của iPhone, chạm vào lại thành vuốt-thoát-ứng-dụng. */}
          <div
            className="absolute inset-x-0 bottom-0 pt-20 px-4 bg-gradient-to-t from-black/80 to-transparent"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
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
              onClick={() => moMua(k.product)}
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
          </div>
        </section>
      ))}

      {/* Tấm đặt hàng trượt lên từ đáy, đè lên video.
          z cao hơn luồng (60) để nằm trên; nền mờ bấm vào là đóng.
          OrderForm dùng lại nguyên vẹn của trang chi tiết sản phẩm — nó tự có
          ô số lượng, tự gửi đơn và tự hiện màn thành công, nên không phải viết
          lại luồng đặt hàng thứ hai để rồi hai bên lệch nhau. */}
      {dangMua && (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Đóng"
            onClick={dongMua}
            className="absolute inset-0 w-full h-full bg-black/60"
          />
          <div
            className="absolute bottom-0 inset-x-0 mx-auto bg-gray-50 rounded-t-2xl overflow-y-auto"
            // 85dvh: chừa một dải video phía trên để khách vẫn thấy mình đang ở
            // trong luồng, không tưởng đã sang trang khác.
            style={{ maxWidth: COT, maxHeight: '85dvh' }}
          >
            {/* Không đặt tiêu đề ở đây: OrderForm đã có sẵn "Đặt hàng ngay",
                thêm nữa thành hai tiêu đề chồng nhau. */}
            <div className="sticky top-0 bg-gray-50 flex items-center justify-end px-4 pt-3 pb-2">
              {/* Vạch kéo quen thuộc của tấm trượt trên điện thoại */}
              <span className="absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full bg-gray-300" />
              <button
                type="button"
                onClick={dongMua}
                aria-label="Đóng"
                className="mt-2 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div
              className="px-4 pt-1"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              <OrderForm product={dangMua} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
