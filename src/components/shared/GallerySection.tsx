'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { GalleryItem } from '@/lib/api';

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

function MediaThumb({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const ytId = item.type === 'video' ? getYouTubeId(item.url) : null;
  const thumb = item.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return (
    <button
      onClick={onClick}
      className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-pointer w-full"
      aria-label={item.caption || 'Xem ảnh'}
    >
      {thumb ? (
        <Image
          src={thumb}
          alt={item.caption || (item.customerName ? `Ảnh từ ${item.customerName}` : 'Hình ảnh thực tế')}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 text-4xl">🐦</div>
      )}

      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
          <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <span className="text-primary-700 text-lg ml-0.5">▶</span>
          </div>
        </div>
      )}

      {item.customerName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-4">
          <p className="text-white text-xs truncate">📍 {item.customerName}</p>
        </div>
      )}

      {!item.customerName && item.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-xs line-clamp-2">{item.caption}</p>
        </div>
      )}
    </button>
  );
}

function Lightbox({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const ytId = item.type === 'video' ? getYouTubeId(item.url) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-3xl leading-none hover:text-gray-300 transition-colors"
          aria-label="Đóng"
        >
          ×
        </button>

        {item.type === 'video' && ytId ? (
          <div className="aspect-video w-full rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : item.type === 'video' ? (
          <video src={item.url} controls autoPlay className="w-full max-h-[80vh] rounded-xl" />
        ) : (
          <img
            src={item.url}
            alt={item.caption || ''}
            className="w-full max-h-[82vh] object-contain rounded-xl"
          />
        )}

        {(item.caption || item.customerName) && (
          <div className="mt-3 text-center">
            {item.caption && <p className="text-white text-sm">{item.caption}</p>}
            {item.customerName && <p className="text-gray-400 text-xs mt-1">📍 {item.customerName}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GallerySection({
  items,
  zaloPhone,
}: {
  items: GalleryItem[];
  zaloPhone: string;
}) {
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (items.length === 0) return null;

  const adminItems = items.filter((i) => i.source === 'admin');
  const customerItems = items.filter((i) => i.source === 'customer');

  return (
    <>
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🖼️ Hình ảnh &amp; Video thực tế</h2>
            <p className="text-gray-500 text-sm">Ảnh và video từ trang trại — không qua chỉnh sửa</p>
          </div>

          {adminItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {adminItems.map((item) => (
                <MediaThumb key={item.id} item={item} onClick={() => setSelected(item)} />
              ))}
            </div>
          )}

          {customerItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                ❤️ Ảnh thực tế từ khách hàng
                <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{customerItems.length} ảnh</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {customerItems.map((item) => (
                  <MediaThumb key={item.id} item={item} onClick={() => setSelected(item)} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">Bạn đang nuôi gà Rutin từ GaRutin?</p>
              <p className="text-sm text-gray-500 mt-0.5">Gửi ảnh thực tế qua Zalo — được đăng lên trang với tên của bạn!</p>
            </div>
            <a
              href={`https://zalo.me/${zaloPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors text-sm whitespace-nowrap"
            >
              💬 Gửi ảnh qua Zalo
            </a>
          </div>
        </div>
      </section>

      {selected && <Lightbox item={selected} onClose={close} />}
    </>
  );
}
