import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    /**
     * Không dùng bộ tối ưu ảnh của Next/Vercel.
     *
     * Tài khoản Vercel đã hết hạn mức tối ưu ảnh: mọi yêu cầu /_next/image trả
     * về 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED và TOÀN BỘ ảnh trên web
     * biến mất, dù ảnh gốc trên R2 vẫn phục vụ bình thường.
     *
     * Thay vì phụ thuộc vào một hạn mức có thể vượt bất cứ lúc nào, ảnh được
     * nén sẵn ngay tại nguồn trên R2 (scripts/nen-anh.ts bên GaRutinBE): ảnh
     * chụp lưu dạng PNG 1,8 MB xuống còn ~150 KB WebP. Nén sẵn một lần thì
     * không còn khâu tối ưu lúc phục vụ để mà hỏng.
     *
     * R2 đứng sau Cloudflare nên vẫn có CDN; thứ mất đi là khả năng tự chọn
     * kích thước theo màn hình. Với ảnh ~150 KB thì đánh đổi đó chấp nhận được.
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  trailingSlash: false,

  /**
   * www → không-www. GỘP HAI BẢN SAO CỦA CÙNG MỘT SITE.
   *
   * Đo 15/09/2026 qua Search Console theo trang: www.garutin.com đang được
   * xếp hạng như một site RIÊNG, ôm 20% tổng hiển thị của cả tên miền —
   * 2.866 hiển thị và 133 nhấp trên 6 trang, tách hẳn khỏi bản chính.
   *
   *   www .../blog/mua-ga-rutin-tp-hcm      1.603 hiển thị · 120 nhấp
   *   www .../blog/phan-biet-ga-rutin         716 hiển thị
   *   www .../blog/may-ap-trung-ga-rutin      532 hiển thị
   *
   * Thẻ canonical ĐÃ khai đúng về garutin.com ở cả hai bản — nhưng canonical
   * chỉ là GỢI Ý, Google có quyền bỏ qua, và thực tế nó đang bỏ qua. Chỉ
   * chuyển hướng 301/308 mới là mệnh lệnh.
   *
   * 17fishing không dính: www.17-fishing.com không phân giải.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.garutin.com' }],
        destination: 'https://garutin.com/:path*',
        permanent: true,
      },
    ];
  },

};

export default nextConfig;
