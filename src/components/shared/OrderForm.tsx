'use client';

import { useState } from 'react';
import type { Product } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function OrderForm({ product }: { product: Product }) {
  const price = product.salePrice ?? product.price;
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          notes: form.notes,
          items: [{ productId: product.id, name: product.name, quantity: qty, price, unit: product.unit }],
          totalAmount: price * qty,
          source: 'web',
        }),
      });
      if (!res.ok) throw new Error('Đặt hàng thất bại, vui lòng thử lại');
      const data = await res.json();
      setSuccess(`Đặt hàng thành công! Mã đơn: ${data.orderNumber}. Chúng tôi sẽ liên hệ lại trong vòng 24h.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="font-semibold text-green-800 mb-1">Đặt hàng thành công!</p>
        <p className="text-green-700 text-sm">{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">🛒 Đặt hàng ngay</h2>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

      <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
        <span className="font-medium text-gray-700 text-sm">{product.name}</span>
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-lg flex items-center justify-center">−</button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-lg flex items-center justify-center">+</button>
        </div>
      </div>

      <div className="text-right">
        <span className="text-sm text-gray-500">Thành tiền: </span>
        <span className="font-bold text-primary-600 text-lg">{formatVND(price * qty)}</span>
      </div>

      <div className="space-y-3">
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl text-base hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {loading ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
      </button>

      <p className="text-xs text-gray-400 text-center">Chúng tôi sẽ gọi xác nhận trong vòng 24h</p>
    </form>
  );
}
