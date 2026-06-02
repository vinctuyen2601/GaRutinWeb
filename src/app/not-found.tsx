import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl mb-4">🐦</p>
      <h1 className="text-6xl font-bold text-primary-600 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Trang không tồn tại</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Có vẻ chú gà rutin đã chạy mất rồi! Trang bạn tìm kiếm không còn ở đây nữa.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
        >
          Về trang chủ
        </Link>
        <Link
          href="/blog"
          className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          Xem blog
        </Link>
      </div>
    </div>
  );
}
