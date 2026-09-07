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
};

export default nextConfig;
