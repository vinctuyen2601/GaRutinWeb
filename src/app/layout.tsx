import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from '@/components/shared/SiteHeader';
import SiteFooter from '@/components/shared/SiteFooter';
import StickyBottomBar from '@/components/shared/StickyBottomBar';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://garutin.vn'),
  title: { template: '%s | GaRutin - Trang Trại Gà Rutin Việt Nam', default: 'GaRutin - Gà Rutin Tươi Sống Từ Trang Trại' },
  description: 'Mua gà rutin tươi sống chất lượng cao, thuần chủng, nuôi tự nhiên. Giao hàng toàn quốc. Liên hệ đặt hàng qua Zalo hoặc điện thoại.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'GaRutin',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'GaRutin - Trang Trại Gà Rutin',
  description: 'Trang trại gà rutin thuần chủng, giao hàng toàn quốc',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://garutin.vn',
  telephone: process.env.NEXT_PUBLIC_PHONE || '',
  address: { '@type': 'PostalAddress', addressCountry: 'VN' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <SiteHeader />
        <main className="min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <StickyBottomBar />
      </body>
    </html>
  );
}
