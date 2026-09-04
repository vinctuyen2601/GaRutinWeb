'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import type { CartItem } from '@/lib/CartContext';
import { giaBan, giaGach } from '@/lib/gia';
import { ghiNhan, layVisitorId } from '@/lib/track';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
const LAST_CUSTOMER_KEY = 'garutin_last_customer';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

type CustomerCache = { customerName: string; customerPhone: string; customerAddress: string };

export default function CheckoutPage() {
  const { state, checkedItems, checkedTotal, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [orderedTotal, setOrderedTotal] = useState(0);

  // Pre-fill from last order
  useEffect(() => {
    try {
      const last: Partial<CustomerCache> = JSON.parse(localStorage.getItem(LAST_CUSTOMER_KEY) || '{}');
      if (last.customerPhone) setForm((f) => ({ ...f, ...last } as typeof f));
    } catch {}
  }, []);

  // Vào trang đặt hàng là bước "vào đặt hàng" của phễu. Ghi một lần cho mỗi
  // sản phẩm đang có trong giỏ, dùng đường dẫn của chính sản phẩm để khớp với
  // lượt xem — ghi theo /dat-hang thì không biết là đang định mua món nào.
  const daGhiPheu = useRef(false);
  useEffect(() => {
    if (daGhiPheu.current || checkedItems.length === 0) return;
    daGhiPheu.current = true;
    checkedItems.forEach(i => ghiNhan('begin_checkout', `/san-pham/${i.product.slug}`));
  }, [checkedItems]);

  const getItemPrice = (i: CartItem) => giaBan(i.product);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại');
      return;
    }
    setLoading(true);
    try {
      const items = checkedItems.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        quantity: i.quantity,
        price: getItemPrice(i),
        unit: i.product.unit,
      }));
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          notes: form.notes,
          items,
          totalAmount: checkedTotal,
          // Nối đơn với người đã xem trang: không có mã này thì bảng phễu đếm
          // được đơn nhưng không biết bao nhiêu NGƯỜI đã mua.
          visitorId: layVisitorId(),
          source: 'web',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Đặt hàng thất bại, vui lòng thử lại');
      }
      const data = await res.json();
      localStorage.setItem(LAST_CUSTOMER_KEY, JSON.stringify(form));
      setOrderedItems(checkedItems);
      setOrderedTotal(checkedTotal);
      setOrderNumber(data.orderNumber);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (orderNumber) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center mb-4">
          <div className="text-5xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Đặt hàng thành công!</h1>
          <p className="text-sm text-gray-500 mb-3">Chúng tôi sẽ liên hệ xác nhận trong vòng 24h</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 border border-primary-200 mb-4">
            <span className="text-xs font-semibold text-gray-500">Mã đơn</span>
            <span className="font-mono font-bold text-primary-700">{orderNumber}</span>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link href="/san-pham" className="inline-block bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 text-sm font-bold text-gray-700">🛍️ Sản phẩm đã đặt</div>
          <div className="divide-y divide-gray-100">
            {orderedItems.map((item) => {
              const price = getItemPrice(item);
              const img = item.product.images?.[0];
              return (
                <div key={item.product.id} className="flex gap-3 px-5 py-3 items-center">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {img ? <Image src={img} alt={item.product.name} fill className="object-cover" sizes="48px" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{fmt(price)} × {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600">{fmt(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 flex justify-between items-center bg-gray-50 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-500">Tổng cộng</span>
            <span className="text-lg font-bold text-primary-600">{fmt(orderedTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!state.hydrated) return null;

  /* ── No items selected ── */
  if (checkedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-semibold text-gray-700 mb-4">Không có sản phẩm nào được chọn</p>
        <Link href="/gio-hang" className="inline-block bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-700 transition-colors">
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Đặt hàng</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Order summary */}
        <div className="w-full lg:w-[360px] flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Đơn hàng của bạn</span>
            <span className="text-sm font-bold text-gray-700">{checkedItems.length} sản phẩm</span>
          </div>
          <div className="divide-y divide-gray-100">
            {checkedItems.map((item) => {
              const price = getItemPrice(item);
              const img = item.product.images?.[0];
              return (
                <div key={item.product.id} className="flex gap-3 px-5 py-3.5">
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {img ? <Image src={img} alt={item.product.name} fill className="object-cover" sizes="56px" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</p>
                    <span className="text-xs text-gray-500">{fmt(price)} × {item.quantity}</span>
                  </div>
                  <span className="text-sm font-bold text-primary-600 flex-shrink-0">{fmt(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-500">Tổng cộng</span>
            <span className="text-lg font-bold text-primary-600">{fmt(checkedTotal)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

          <input
            required
            type="text"
            placeholder="Họ và tên *"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            required
            type="tel"
            placeholder="Số điện thoại *"
            value={form.customerPhone}
            onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Địa chỉ giao hàng"
            value={form.customerAddress}
            onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            placeholder="Ghi chú (tùy chọn)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl text-base hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Đang xử lý...' : '✅ Hoàn tất đơn hàng'}
          </button>
          <p className="text-xs text-gray-400 text-center">Thanh toán khi nhận hàng (COD). Chúng tôi sẽ gọi xác nhận trong vòng 24h.</p>
        </form>
      </div>
    </div>
  );
}
