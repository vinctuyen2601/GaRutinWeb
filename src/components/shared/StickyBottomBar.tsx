'use client';

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default function StickyBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex">
        <a
          href={`tel:${PHONE}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-800 font-medium text-sm active:bg-gray-200"
        >
          📞 Gọi ngay
        </a>
        <a
          href={`https://zalo.me/${ZALO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-medium text-sm active:bg-primary-700"
        >
          💬 Đặt qua Zalo
        </a>
      </div>
    </div>
  );
}
