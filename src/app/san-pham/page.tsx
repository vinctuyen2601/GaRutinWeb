import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/api';
import ProductCard from '@/components/shared/ProductCard';

export const metadata: Metadata = {
  title: 'Mua Gà Rutin - Đặt Hàng Toàn Quốc',
  description: 'Danh sách sản phẩm gà rutin: gà đực, cái, trứng, con giống... Giá tốt, chất lượng đảm bảo, giao hàng toàn quốc.',
};

export const revalidate = 1800;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(category ? `category=${category}` : undefined).catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🐦 Tất cả sản phẩm</h1>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <a href="/san-pham" className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!category ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-500'}`}>
            Tất cả
          </a>
          {categories.map((cat) => (
            <a key={cat.id} href={`/san-pham?category=${cat.id}`} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat.id ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-500'}`}>
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Chưa có sản phẩm nào</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
