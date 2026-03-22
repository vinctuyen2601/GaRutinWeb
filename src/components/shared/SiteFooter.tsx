import Link from 'next/link';

const PHONE = process.env.NEXT_PUBLIC_PHONE || '0901234567';
const ZALO = process.env.NEXT_PUBLIC_ZALO_PHONE || '0901234567';

export default function SiteFooter() {
  return (
    <footer className="bg-primary-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-bold mb-3">🐦 GaRutin</div>
          <p className="text-primary-200 text-sm">Trang trại gà rutin thuần chủng. Cam kết chất lượng, giao hàng toàn quốc.</p>
        </div>

        <div>
          <div className="font-semibold mb-3">Liên hệ</div>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li>📞 <a href={`tel:${PHONE}`} className="hover:text-white">{PHONE}</a></li>
            <li>💬 <a href={`https://zalo.me/${ZALO}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Zalo: {ZALO}</a></li>
            <li>📍 Việt Nam</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-3">Khám phá</div>
          <ul className="space-y-2 text-primary-200 text-sm">
            <li><Link href="/san-pham" className="hover:text-white">Sản phẩm</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog nuôi gà</Link></li>
            <li><Link href="/lien-he" className="hover:text-white">Liên hệ đặt hàng</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-primary-800 text-center text-primary-300 text-sm">
        © {new Date().getFullYear()} GaRutin. All rights reserved.
      </div>
    </footer>
  );
}
