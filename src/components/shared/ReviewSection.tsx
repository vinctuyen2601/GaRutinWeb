'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product, Review } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const TOI_DA_ANH = 3;
const TOI_DA_CHU = 2000;
const TOI_THIEU_CHU = 10;

type TrangThai = 'dang-nhap-lieu' | 'dang-gui' | 'da-gui' | 'da-gui-roi';

const ngay = (s: string) => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
};

/** Chữ cái đầu của tên, cho ô đại diện. */
const chuDau = (ten: string) =>
  ten.trim().split(/\s+/).slice(-2).map(t => t[0]?.toUpperCase() ?? '').join('') || '?';

function Sao({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
             fill={i <= n ? '#f59e0b' : 'none'} stroke={i <= n ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function ReviewSection({ product }: { product: Product }) {
  const [danhSach, setDanhSach] = useState<Review[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [trangThai, setTrangThai] = useState<TrangThai>('dang-nhap-lieu');
  const [loi, setLoi] = useState('');

  const [ten, setTen] = useState('');
  const [sao, setSao] = useState(5);
  const [nhanXet, setNhanXet] = useState('');
  const [anh, setAnh] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [dangTaiTep, setDangTaiTep] = useState(false);
  const [loiTep, setLoiTep] = useState('');

  const oAnh = useRef<HTMLInputElement>(null);
  const oVideo = useRef<HTMLInputElement>(null);

  const nap = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/reviews/product/${product.id}`);
      if (res.ok) setDanhSach(await res.json());
    } catch {
      // Không có đánh giá vẫn phải xem được sản phẩm — im lặng bỏ qua.
    }
    setDangTai(false);
  }, [product.id]);

  useEffect(() => { nap(); }, [nap]);

  /**
   * Đánh giá đã đủ hợp lệ để cho phép đính kèm ảnh/video hay chưa.
   *
   * Cố ý KHÓA phần tải tệp cho tới khi nội dung hợp lệ. Cho tải trước rồi mới
   * báo "nhận xét quá ngắn" là bắt khách tốn dung lượng 4G tải ảnh lên để rồi
   * đơn bị từ chối, và để lại tệp mồ côi trong kho lưu trữ.
   */
  const hopLe =
    ten.trim().length >= 2 &&
    sao >= 1 &&
    nhanXet.trim().length >= TOI_THIEU_CHU &&
    nhanXet.trim().length <= TOI_DA_CHU;

  const nhacHopLe = (() => {
    if (ten.trim().length < 2) return 'Nhập tên của bạn';
    if (nhanXet.trim().length < TOI_THIEU_CHU)
      return `Viết nhận xét ít nhất ${TOI_THIEU_CHU} ký tự (còn ${TOI_THIEU_CHU - nhanXet.trim().length})`;
    if (nhanXet.trim().length > TOI_DA_CHU) return 'Nhận xét quá dài';
    return '';
  })();

  const taiTep = async (file: File, loai: 'anh' | 'video') => {
    setLoiTep('');
    setDangTaiTep(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/reviews/upload`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoiTep(data?.message || 'Tải tệp thất bại, thử lại giúp mình nhé');
        return;
      }
      if (loai === 'anh') setAnh(cu => [...cu, data.url].slice(0, TOI_DA_ANH));
      else setVideo(data.url);
    } catch {
      setLoiTep('Không gửi được tệp. Kiểm tra kết nối mạng rồi thử lại.');
    } finally {
      setDangTaiTep(false);
    }
  };

  const gui = async () => {
    if (!hopLe || trangThai === 'dang-gui') return;
    setLoi('');
    setTrangThai('dang-gui');
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: ten.trim(),
          rating: sao,
          comment: nhanXet.trim(),
          images: anh,
          ...(video ? { video } : {}),
        }),
      });

      if (res.status === 409) {
        setTrangThai('da-gui-roi');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Máy chủ gom thông điệp vào `details`; lấy câu cụ thể ra thay vì hiện
        // "Dữ liệu không hợp lệ" — khách không đoán được sai chỗ nào.
        const cuThe = data?.details?.[0]?.errors?.[0];
        setLoi(cuThe || data?.message || 'Gửi không thành công, thử lại giúp mình nhé');
        setTrangThai('dang-nhap-lieu');
        return;
      }
      setTrangThai('da-gui');
    } catch {
      setLoi('Không gửi được. Kiểm tra kết nối mạng rồi thử lại.');
      setTrangThai('dang-nhap-lieu');
    }
  };

  const diem = Number(product.avgRating ?? 0);
  const soDanhGia = danhSach.length || Number(product.reviewCount ?? 0);

  return (
    <div id="danh-gia" className="mt-12 pt-8 border-t scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900">Đánh giá từ khách hàng</h2>
        {soDanhGia > 0 && (
          <span className="flex items-center gap-1.5 text-sm text-gray-500">
            <Sao n={Math.round(diem)} />
            {diem > 0 && <b className="text-gray-700">{diem.toFixed(1)}</b>}
            <span>({soDanhGia})</span>
          </span>
        )}
      </div>

      {/* Danh sách đánh giá */}
      {dangTai ? (
        <p className="text-sm text-gray-400 py-4">Đang tải đánh giá…</p>
      ) : danhSach.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          Chưa có đánh giá nào. Bạn là người đầu tiên nhé!
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {danhSach.map(dg => (
            <div key={dg.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {chuDau(dg.customerName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <b className="text-sm text-gray-900">{dg.customerName}</b>
                    <Sao n={dg.rating} size={14} />
                    <span className="text-xs text-gray-400">{ngay(dg.createdAt)}</span>
                  </div>
                  {dg.comment && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{dg.comment}</p>
                  )}
                  {(dg.images?.length || dg.video) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dg.images?.map((u, i) => (
                        <a key={i} href={u} target="_blank" rel="noreferrer"
                           className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 block">
                          <Image src={u} alt={`Ảnh đánh giá ${i + 1}`} fill sizes="64px" className="object-cover" />
                        </a>
                      ))}
                      {dg.video && (
                        <video
                          src={dg.video}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-28 h-16 rounded-lg border border-gray-200 object-cover bg-black"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form gửi đánh giá */}
      {trangThai === 'da-gui' ? (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold text-primary-700">Cảm ơn bạn đã đánh giá!</p>
          <p className="text-sm text-gray-600 mt-1">
            Đánh giá của bạn đang chờ trại duyệt và sẽ hiện trên trang sau ít phút.
          </p>
        </div>
      ) : trangThai === 'da-gui-roi' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">✋</div>
          <p className="font-bold text-amber-700">Bạn đã đánh giá sản phẩm này rồi</p>
          <p className="text-sm text-gray-600 mt-1">
            Mỗi người chỉ gửi được một đánh giá cho mỗi sản phẩm. Cảm ơn bạn đã góp ý!
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
          <h3 className="font-bold text-gray-900 mb-3">Viết đánh giá của bạn</h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">Chấm điểm:</span>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setSao(i)}
                aria-label={`${i} sao`}
                className="p-0.5"
              >
                <svg width="24" height="24" viewBox="0 0 24 24"
                     fill={i <= sao ? '#f59e0b' : 'none'} stroke={i <= sao ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          <input
            value={ten}
            onChange={e => setTen(e.target.value)}
            placeholder="Tên của bạn *"
            maxLength={120}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm mb-2 focus:outline-none focus:border-primary-500"
          />
          <textarea
            value={nhanXet}
            onChange={e => setNhanXet(e.target.value)}
            placeholder="Gà nhận được thế nào? Đóng gói, vận chuyển ra sao? *"
            rows={4}
            maxLength={TOI_DA_CHU}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:border-primary-500"
          />

          {/* Đính kèm — khoá cho tới khi nội dung hợp lệ */}
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Ảnh & video thật {anh.length > 0 || video ? '' : '(không bắt buộc)'}
              </span>
              <span className="text-xs text-gray-400">
                {anh.length}/{TOI_DA_ANH} ảnh{video ? ' · 1 video' : ''}
              </span>
            </div>

            {!hopLe ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-xs text-gray-500">
                🔒 {nhacHopLe} rồi mới thêm được ảnh/video.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {anh.map((u, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <Image src={u} alt={`Ảnh ${i + 1}`} fill sizes="64px"
                             className="object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setAnh(cu => cu.filter((_, k) => k !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white text-xs leading-none"
                        aria-label="Xoá ảnh"
                      >×</button>
                    </div>
                  ))}
                  {video && (
                    <div className="relative w-24 h-16">
                      <video src={video} className="w-full h-full object-cover rounded-lg border border-gray-200 bg-black" preload="metadata" />
                      <button
                        type="button"
                        onClick={() => setVideo(null)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white text-xs leading-none"
                        aria-label="Xoá video"
                      >×</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    disabled={anh.length >= TOI_DA_ANH || dangTaiTep}
                    onClick={() => oAnh.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm disabled:opacity-40"
                  >
                    📷 Thêm ảnh
                  </button>
                  <button
                    type="button"
                    disabled={!!video || dangTaiTep}
                    onClick={() => oVideo.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm disabled:opacity-40"
                  >
                    🎥 Thêm video
                  </button>
                  {dangTaiTep && <span className="text-sm text-gray-500 self-center">Đang tải lên…</span>}
                </div>

                <input ref={oAnh} type="file" accept="image/*" hidden
                       onChange={e => { const f = e.target.files?.[0]; if (f) taiTep(f, 'anh'); e.target.value = ''; }} />
                <input ref={oVideo} type="file" accept="video/*" hidden
                       onChange={e => { const f = e.target.files?.[0]; if (f) taiTep(f, 'video'); e.target.value = ''; }} />

                <p className="text-xs text-gray-400 mt-1.5">Ảnh tối đa 8 MB · video tối đa 18 MB</p>
              </>
            )}
            {loiTep && <p className="text-sm text-red-600 mt-2">{loiTep}</p>}
          </div>

          {loi && <p className="text-sm text-red-600 mt-3">{loi}</p>}

          <button
            type="button"
            onClick={gui}
            disabled={!hopLe || trangThai === 'dang-gui' || dangTaiTep}
            className="w-full mt-4 bg-primary-600 text-white font-bold py-3 rounded-xl disabled:opacity-40"
          >
            {trangThai === 'dang-gui' ? 'Đang gửi…' : 'Gửi đánh giá'}
          </button>
          {!hopLe && (
            <p className="text-xs text-gray-500 text-center mt-2">{nhacHopLe}</p>
          )}
        </div>
      )}
    </div>
  );
}
