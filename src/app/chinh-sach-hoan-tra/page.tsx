import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chính sách hoàn trả hàng - GaRutin',
  description: 'Chính sách đổi trả hàng của GaRutin. Thời hạn 3 ngày sau khi nhận hàng, áp dụng cho gà rutin cảnh bị bệnh hoặc không đúng mô tả khi giao hàng.',
  alternates: {
    canonical: '/chinh-sach-hoan-tra',
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Chính sách hoàn trả hàng</h1>
      <p className="text-gray-500 text-sm mb-8">Cập nhật lần cuối: tháng 5/2025</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Cam kết của GaRutin</h2>
          <p>
            GaRutin cam kết giao gà rutin cảnh đúng mô tả, khỏe mạnh và được đóng gói an toàn.
            Nếu sản phẩm nhận được không đúng yêu cầu, chúng tôi sẵn sàng hỗ trợ đổi trả theo chính sách dưới đây.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Điều kiện được hoàn trả</h2>
          <p className="mb-3">Yêu cầu hoàn trả được chấp nhận khi đáp ứng <strong>đồng thời</strong> các điều kiện sau:</p>
          <ul className="space-y-2 list-none">
            {[
              'Gà bị chết hoặc có dấu hiệu bệnh nặng ngay khi nhận hàng',
              'Gà không đúng giống, màu lông hoặc giới tính so với đơn hàng',
              'Hàng bị hư hỏng do lỗi đóng gói từ phía GaRutin',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-amber-800 mb-3">3. Thời hạn yêu cầu hoàn trả</h2>
          <p className="text-amber-900 font-medium text-xl mb-2">3 ngày kể từ khi nhận hàng</p>
          <p className="text-amber-700 text-sm">
            Quý khách vui lòng kiểm tra hàng ngay khi nhận và liên hệ GaRutin trong vòng <strong>3 ngày</strong>.
            Yêu cầu gửi sau thời hạn này sẽ không được chấp nhận.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Chi phí trả hàng</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Trường hợp</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Chi phí vận chuyển</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-700">Lỗi từ phía GaRutin (giao sai, gà chết do đóng gói)</td>
                  <td className="px-4 py-3 font-medium text-green-700">GaRutin chịu 100%</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Gà bệnh sau khi nhận (không phải lỗi vận chuyển)</td>
                  <td className="px-4 py-3 font-medium text-orange-700">Khách hàng chịu phí ship</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">Đổi ý, không phù hợp sở thích</td>
                  <td className="px-4 py-3 text-gray-500 italic">Không áp dụng đổi trả</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Phí vận chuyển hoàn trả do khách hàng chi trả được tính theo bảng giá thực tế của đơn vị vận chuyển tại thời điểm gửi hàng.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Hướng dẫn thực hiện đổi trả</h2>
          <ol className="space-y-4">
            {[
              {
                title: 'Liên hệ GaRutin trong vòng 3 ngày',
                desc: 'Nhắn tin Zalo hoặc gọi điện, cung cấp mã đơn hàng và mô tả vấn đề.',
              },
              {
                title: 'Gửi ảnh/video bằng chứng',
                desc: 'Chụp ảnh hoặc quay video tình trạng gà ngay khi nhận hàng để làm cơ sở xét duyệt.',
              },
              {
                title: 'GaRutin xác nhận và hướng dẫn',
                desc: 'Chúng tôi sẽ phản hồi trong vòng 24 giờ và hướng dẫn cách gửi trả hàng (nếu được chấp nhận).',
              },
              {
                title: 'Giao hàng thay thế hoặc hoàn tiền',
                desc: 'Sau khi nhận lại hàng và xác nhận, GaRutin sẽ giao gà thay thế hoặc hoàn tiền trong 2-3 ngày làm việc.',
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Trường hợp không áp dụng đổi trả</h2>
          <ul className="space-y-2">
            {[
              'Yêu cầu gửi sau 3 ngày kể từ ngày nhận hàng',
              'Gà chết hoặc bệnh do cách chăm sóc của khách hàng sau khi nhận',
              'Thay đổi ý định mua hoặc không còn nhu cầu',
              'Không có bằng chứng ảnh/video tình trạng hàng khi nhận',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 flex-shrink-0 text-red-400">✕</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Liên hệ hỗ trợ</h2>
          <p className="text-blue-700 text-sm mb-3">
            Nếu bạn có thắc mắc về chính sách hoàn trả hoặc cần hỗ trợ, vui lòng liên hệ chúng tôi:
          </p>
          <Link
            href="/lien-he"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Liên hệ GaRutin
          </Link>
        </section>

      </div>
    </div>
  );
}
