import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Liên hệ - Tư vấn & Mua gà rutin cảnh',
  description: 'Liên hệ tư vấn và mua gà rutin cảnh thuần chủng qua Zalo hoặc điện thoại. Hỗ trợ chọn giống, màu lông, cách nuôi. Giao hàng toàn quốc.',
};

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2 text-center">📞 Liên hệ & Tư vấn</h1>
      <p className="text-center text-gray-500 mb-8">Tư vấn miễn phí — chọn giống, màu lông, cách nuôi gà rutin cảnh</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Liên hệ ngay</h2>
          <div className="space-y-3">
            <a
              href={`https://zalo.me/${ZALO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <span className="text-3xl">💬</span>
              <div>
                <div className="font-semibold text-blue-800">Đặt qua Zalo</div>
                <div className="text-blue-600 text-sm">{ZALO} — Phản hồi nhanh nhất</div>
              </div>
            </a>
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
            >
              <span className="text-3xl">📞</span>
              <div>
                <div className="font-semibold text-green-800">Gọi điện trực tiếp</div>
                <div className="text-green-600 text-sm">{PHONE}</div>
              </div>
            </a>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-2">
            <p>🕐 Giờ hỗ trợ: 7:00 - 21:00 (Thứ 2 - Chủ nhật)</p>
            <p>🐦 Chuyên gà rutin cảnh thuần chủng, nhiều màu lông đẹp</p>
            <p>📦 Giao hàng toàn quốc — đóng gói an toàn, đúng kỹ thuật</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Để lại thông tin, mình sẽ liên hệ lại</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
