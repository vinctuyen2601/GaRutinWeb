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
import { LienHeProvider } from "@/lib/LienHeContext";
import { layLienHe } from "@/lib/lienHe";
import { getProducts, getPosts } from "@/lib/api";

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
    /*
     * Đuôi CỐ Ý NGẮN — chỉ tên thương hiệu.
     *
     * Google hiện khoảng 60 ký tự tiêu đề. Đuôi cũ " | GaRutin - Gà Rutin Cảnh
     * Việt Nam" dài 35 ký tự, mà tiêu đề bài trung bình đã dài hơn thế — đo
     * 15/09/2026: 69/69 bài bị cắt cụt, tức MỌI kết quả tìm kiếm đều hiện một
     * câu dở dang. Rút xuống "GaRutin" đưa con số đó về 39/69.
     *
     * Đừng nhét từ khoá vào đây. Đuôi lặp trên mọi trang thì Google coi là vụn,
     * và mỗi ký tự thêm vào là một ký tự cắt mất của phần phân biệt trang.
     */
    template: "%s | GaRutin",
    default: "Gà Rutin — Gà Cảnh Nhỏ Nhất Thế Giới, Đặc Điểm & Giá Bán",
  },
  description:
    "Gà rutin nặng 50–70g, cao 7–10cm, sống 3–5 năm, hơn 20 màu lông. Hiền, ít mùi, nuôi được trong căn hộ. Xem đặc điểm, cách nuôi và bảng giá tại trại.",
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
  // KHÔNG đặt `alternates.canonical` ở đây. Metadata khai trong layout gốc
  // được MỌI route kế thừa, nên một canonical trỏ về SITE_URL biến từng trang
  // sản phẩm và từng bài viết thành "bản trùng của trang chủ" trong mắt Google
  // — tự tay bảo nó đừng lập chỉ mục mình. Đã xảy ra thật: cả 20 trang sản
  // phẩm và 69 bài viết đều khai canonical về trang chủ.
  //
  // Mỗi route tự khai canonical của nó, đường dẫn tương đối so với
  // metadataBase. Đừng đưa canonical trở lại tầng này.
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

const dungJsonLd = (lienHe: { phone: string; address: string; zalo: string }) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "GaRutin - Gà Rutin Cảnh Thuần Chủng",
  description:
    "Chuyên cung cấp gà rutin cảnh thuần chủng, nhiều màu lông đẹp, giao hàng toàn quốc",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com",
  telephone: lienHe.phone,
  image: `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://garutin.com"
  }/logo.svg`,
  priceRange: "₫₫",
  address: {
    "@type": "PostalAddress",
    addressCountry: "VN",
    // Địa chỉ thật từ CMS: Google hiển thị mục doanh nghiệp địa phương theo
    // trường này, ghi trống chung chung thì không lên được tìm kiếm quanh đây.
    streetAddress: lienHe.address,
    // TÁCH thành phố ra khỏi địa chỉ đầy đủ.
    //
    // Trước đây cả streetAddress lẫn addressLocality đều nhận nguyên chuỗi
    // "Trại gà rutin Bình Tân, tp Hồ Chí Minh, Việt Nam" — Google đọc ra một
    // địa phương tên là cả cụm đó, tức là không khớp với địa phương nào. Mà
    // nhóm từ khoá mạnh nhất của shop toàn là địa phương: "mua gà rutin ở
    // tphcm" hạng 5,1 · 26 nhấp, "gà rutin tphcm" hạng 5,0.
    addressLocality: "TP Hồ Chí Minh",
  },

  /*
   * PHẠM VI PHỤC VỤ — cách đúng để nói "chúng tôi bán cho các tỉnh này".
   *
   * Google Autocomplete xác nhận có người tìm thật: "gà rutin đồng nai",
   * "gà rutin bình dương", "mua gà rutin ở bình dương", "gà rutin vũng tàu",
   * "mua gà rutin ở cần thơ".
   *
   * KHÔNG đẻ mỗi tỉnh một trang. Shop từng làm đúng vậy với 21 quận của TPHCM
   * và đo ra CHỈ 1/21 trang có lưu lượng — 20 trang còn lại đã phải gộp bỏ.
   * `areaServed` nói đúng điều đó với Google mà không sinh trang rác.
   *
   * Mô tả doanh nghiệp vốn đã ghi "giao hàng toàn quốc" nên khai ở đây là
   * đúng sự thật đã công bố, không phải lời hứa mới.
   */
  areaServed: [
    { "@type": "City", name: "TP Hồ Chí Minh" },
    { "@type": "State", name: "Đồng Nai" },
    { "@type": "State", name: "Bình Dương" },
    { "@type": "State", name: "Bà Rịa - Vũng Tàu" },
    { "@type": "State", name: "Long An" },
    { "@type": "State", name: "Tây Ninh" },
    { "@type": "State", name: "Bình Phước" },
    { "@type": "City", name: "Cần Thơ" },
    { "@type": "Country", name: "Việt Nam" },
  ],

  sameAs: [`https://zalo.me/${lienHe.zalo}`],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lấy MỘT lần ở đây rồi truyền xuống: header, footer, thanh dính đáy và
  // trang đặt hàng đều cần cùng bộ số này.
  const lienHe = await layLienHe();
  const jsonLd = dungJsonLd(lienHe);

  // Liên kết cho chân trang. Hỏng thì chân trang rút gọn lại chứ KHÔNG được
  // làm chết cả site — đây là layout, mọi trang đều đi qua đây.
  const [sanPhamChan, baiChan] = await Promise.all([
    getProducts().then((ds) => ds.filter((p) => p.isActive !== false).slice(0, 6)).catch(() => []),
    getPosts('limit=6').then((r) => r.data ?? []).catch(() => []),
  ]);

  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-gray-900 antialiased font-sans">
        <LienHeProvider giaTri={lienHe}>
        <CartProvider>
          <SiteHeader lienHe={lienHe} />
          <main className="min-h-screen pb-20 md:pb-0">{children}</main>
          <SiteFooter lienHe={lienHe} sanPham={sanPhamChan} baiViet={baiChan} />
          <StickyBottomBar />
          <CartSidebar />
        </CartProvider>
        </LienHeProvider>
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
