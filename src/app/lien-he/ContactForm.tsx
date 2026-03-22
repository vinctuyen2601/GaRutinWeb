'use client';

export default function ContactForm() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
      <input
        type="text"
        placeholder="Họ và tên"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <textarea
        placeholder="Nội dung (muốn mua gì, số lượng...)"
        rows={4}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      <button
        onClick={() => alert('Chúng tôi sẽ liên hệ lại trong vòng 24h!')}
        className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors"
      >
        Gửi yêu cầu
      </button>
      <p className="text-xs text-gray-400 text-center">Hoặc liên hệ trực tiếp qua Zalo/điện thoại để được phản hồi nhanh hơn</p>
    </div>
  );
}
