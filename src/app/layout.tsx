import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import StickyBottomBar from "@/components/shared/StickyBottomBar";

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
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <SiteHeader />
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <SiteFooter />
        <StickyBottomBar />
      </body>
    </html>
  );
}
