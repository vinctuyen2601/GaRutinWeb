'use client';
import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import type { Product } from '@/lib/api';

export default function AddToCartButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOutOfStock}
      className={
        className ??
        'w-full border border-primary-600 text-primary-600 font-medium py-2 rounded-lg text-sm hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      }
    >
      {isOutOfStock ? 'Hết hàng' : added ? '✓ Đã thêm' : '🛒 Thêm vào giỏ'}
    </button>
  );
}
