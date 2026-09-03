import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import StickyBottomBar from "@/components/shared/StickyBottomBar";
import TrackVisit from "@/components/shared/TrackVisit";
import CartSidebar from "@/components/shared/CartSidebar";
import { CartProvider } from "@/lib/CartContext";

/**
 * Font chữ cho toàn web.
 *
 * Trước đây KHÔNG khai font nào cả — cả web chạy bằng ngăn xếp mặc định của
 * Tailwind, tức là font hệ thống. Hệ quả: mỗi máy hiện một kiểu, và dấu tiếng
 * Việt thường phải lấy từ font dự phòng khác với phần chữ Latin, nên nét chữ và
 * độ cao dấu không khớp nhau — nhìn lệch lạc, nhất là ở những chữ nhiều dấu như
 * "Sản phẩm", "Liên hệ", "Trứng cút lộn".
 *
 * subsets PHẢI có 'vietnamese'. Chỉ 'latin' và 'latin-ext' là thiếu đúng những
 * ký tự đặc thù tiếng Việt (ế ệ ự ữ ơ ư kèm dấu), và chúng lại rơi về font dự
 * phòng — đúng lỗi mà 17Fishing đang dính.
 *
 * Be Vietnam Pro do người Việt thiết kế riêng cho tiếng Việt: dấu đặt gọn, không
 * đội cao làm giãn dòng như phần lớn font phương Tây khi phải ghép dấu.
 */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com"
  ),
  title: {
    template: "%s | GaRutin - Gà Rutin Cảnh Việt Nam",
    default: "GaRutin - Gà Rutin Cảnh Thuần Chủng, Nhiều Màu Đẹp",
  },
  description:
    "Chuyên cung cấp gà rutin cảnh thuần chủng — gà tí hon nhỏ nhất thế giới, nhiều màu lông đẹp, tính cách hiền lành. Phù hợp nuôi trong căn hộ, nhà phố. Giao hàng toàn quốc.",
  icons: { icon: "/favicon.svg" },
  keywords: [
    "gà rutin",
    "gà rutin cảnh",
    "gà tí hon",
    "king quail",
    "chinese painted quail",
    "gà rutin thuần chủng",
    "mua gà rutin",
    "gà rutin nhiều màu",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "GaRutin",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "GaRutin - Gà Rutin Cảnh Thuần Chủng",
  description:
    "Chuyên cung cấp gà rutin cảnh thuần chủng, nhiều màu lông đẹp, giao hàng toàn quốc",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com",
  telephone: process.env.NEXT_PUBLIC_PHONE || "",
  image: `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com"
  }/logo.svg`,
  priceRange: "₫₫",
  address: {
    "@type": "PostalAddress",
    addressCountry: "VN",
    addressLocality: "Việt Nam",
  },
  sameAs: [`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || ""}`],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <CartProvider>
          <SiteHeader />
          <main className="min-h-screen pb-20 md:pb-0">{children}</main>
          <SiteFooter />
          <StickyBottomBar />
          <CartSidebar />
        </CartProvider>
        <TrackVisit />
        {/* Google tag — loads gtag.js once for all properties */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18180783236"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18180783236');
          gtag('config', 'G-GCTB0DCD1V');
        `}</Script>
      </body>
    </html>
  );
}
