import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Liên hệ - Đặt hàng gà rutin',
  description: 'Liên hệ đặt hàng gà rutin qua điện thoại hoặc Zalo. Tư vấn miễn phí, giao hàng toàn quốc.',
};

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">📞 Liên hệ & Đặt hàng</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Cách đặt hàng</h2>
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
            <p>🕐 Giờ làm việc: 7:00 - 21:00 (Thứ 2 - CN)</p>
            <p>📍 Địa chỉ: Việt Nam</p>
            <p>📦 Giao hàng: Toàn quốc qua xe khách/bưu điện</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Gửi yêu cầu</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
