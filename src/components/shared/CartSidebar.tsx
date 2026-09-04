'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { giaBan, giaGach } from '@/lib/gia';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function CartSidebar() {
  const { state, removeFromCart, updateQty, closeCart, totalItems, totalPrice } = useCart();

  if (!state.open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">Giỏ hàng ({totalItems})</h2>
          <button onClick={closeCart} className="text-2xl leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-5 space-y-3">
          {state.items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🐦</div>
              <p className="text-sm">Giỏ hàng trống</p>
            </div>
          ) : (
            state.items.map(item => {
              const img = item.product.images?.[0];
              const price = giaBan(item.product);
              return (
                <div key={item.product.id} className="flex gap-3 rounded-xl p-3 bg-gray-50">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {img ? (
                      <Image src={img} alt={item.product.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-2xl">🐦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.product.name}</p>
                    <p className="text-sm font-bold text-primary-600">{fmt(price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
                    <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-gray-200">
                      <button className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:text-primary-600"
                              onClick={() => updateQty(item.product.id, item.quantity - 1)}>−</button>
                      <span className="w-7 text-center text-sm">{item.quantity}</span>
                      <button className="w-7 h-7 flex items-center justify-center text-sm text-gray-600 hover:text-primary-600"
                              onClick={() => updateQty(item.product.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {state.items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Tổng cộng</span>
              <span className="font-bold text-lg text-primary-600">{fmt(totalPrice)}</span>
            </div>
            <Link
              href="/gio-hang"
              onClick={closeCart}
              className="block w-full text-center py-3 rounded-xl font-bold text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Xem giỏ hàng ({totalItems}) →
            </Link>
            <button onClick={closeCart} className="w-full py-2.5 text-sm rounded-xl border border-gray-200 text-gray-600 hover:border-primary-400 transition-colors">
              Tiếp tục mua hàng
            </button>
          </div>
        )}
      </div>
    </>
  );
}
