'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function CartPage() {
  const { state, removeFromCart, updateQty, toggleCheck, setAllChecked, checkedItems, checkedTotal } = useCart();
  const router = useRouter();
  const items = state.items;
  const allChecked = items.length > 0 && items.every(i => state.checkedKeys.includes(i.product.id));

  if (!state.hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🐦</div>
        <p className="font-semibold text-gray-700 mb-4">Giỏ hàng đang trống</p>
        <Link
          href="/san-pham"
          className="inline-block bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition-colors"
        >
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Giỏ hàng ({items.length})</h1>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-3 bg-gray-50 border border-gray-200">
        <input
          type="checkbox"
          checked={allChecked}
          onChange={(e) => setAllChecked(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-primary-600"
        />
        <span className="text-sm font-semibold text-gray-700">Chọn tất cả ({items.length} sản phẩm)</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const checked = state.checkedKeys.includes(item.product.id);
          const price = Number(item.product.salePrice ?? item.product.price);
          const isOnSale = !!item.product.salePrice && item.product.salePrice < item.product.price;
          const discountPct = isOnSale
            ? Math.round((1 - item.product.salePrice! / item.product.price) * 100)
            : 0;
          const img = item.product.images?.[0];

          return (
            <div
              key={item.product.id}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl border transition-colors ${
                checked ? 'border-primary-300 bg-primary-50/30' : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCheck(item.product.id)}
                className="w-4 h-4 flex-shrink-0 cursor-pointer accent-primary-600"
              />

              <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {img ? (
                  <Image src={img} alt={item.product.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl">🐦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/san-pham/${item.product.slug}`} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-600">
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-sm font-bold text-primary-600">{fmt(price)}</span>
                  {isOnSale && (
                    <>
                      <span className="text-xs line-through text-gray-400">{fmt(item.product.price)}</span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white bg-red-500" style={{ fontSize: 10 }}>
                        -{discountPct}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-gray-400 hover:text-red-500 text-xs">
                  Xóa
                </button>
                <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-gray-200">
                  <button
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-gray-700"
                    onClick={() => updateQty(item.product.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-gray-700"
                    onClick={() => updateQty(item.product.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-semibold text-gray-700">{fmt(price * item.quantity)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Đã chọn {checkedItems.length}/{items.length} sản phẩm</p>
            <p className="text-base font-bold text-primary-600">{fmt(checkedTotal)}</p>
          </div>
          <button
            disabled={checkedItems.length === 0}
            onClick={() => router.push('/dat-hang')}
            className="bg-primary-600 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Đặt hàng ({checkedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
}
