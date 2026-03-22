import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/api';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0];
  const isOutOfStock = product.stockStatus === 'out_of_stock';

  return (
    <Link href={`/san-pham/${product.slug}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {img ? (
            <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl">🐦</div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded">Hết hàng</span>
            </div>
          )}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded">🌟 Nổi bật</div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
          {product.weightPerUnit && (
            <p className="text-xs text-gray-400 mb-1">{product.weightPerUnit}/{product.unit}</p>
          )}
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="font-bold text-primary-600">{formatVND(product.salePrice)}</span>
                <span className="text-gray-400 text-xs line-through">{formatVND(product.price)}</span>
              </>
            ) : (
              <span className="font-bold text-primary-600">{formatVND(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
