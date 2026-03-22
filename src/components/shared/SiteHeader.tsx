import Link from 'next/link';
import Image from 'next/image';

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center no-underline">
          <Image src="/logo.svg" alt="GaRutin" width={190} height={44} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/san-pham" className="text-gray-600 hover:text-primary-600 transition-colors">Sản phẩm</Link>
          <Link href="/blog" className="text-gray-600 hover:text-primary-600 transition-colors">Blog</Link>
          <Link href="/lien-he" className="text-gray-600 hover:text-primary-600 transition-colors">Liên hệ</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a href={`tel:${PHONE}`} className="hidden md:flex items-center gap-1 text-sm text-primary-700 font-medium">
            📞 {PHONE}
          </a>
          <a
            href={`https://zalo.me/${ZALO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Đặt qua Zalo
          </a>
        </div>
      </div>
    </header>
  );
}
