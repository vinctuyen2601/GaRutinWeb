'use client';
import { useCart } from '@/lib/CartContext';

export default function CartIcon() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-primary-600 transition-colors"
      aria-label="Giỏ hàng"
    >
      <span className="text-xl">🛒</span>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
