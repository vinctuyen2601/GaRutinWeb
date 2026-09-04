import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import type { Post } from '@/lib/api';

/**
 * Danh sách bài viết dạng thẻ ngang, dùng ở cuối bài viết và cuối trang sản phẩm.
 *
 * Tách ra vì hai nơi phải giống hệt nhau: viết lại markup ở nơi thứ hai là sớm
 * muộn hai bên lệch nhau về khoảng cách, cỡ ảnh, số dòng cắt chữ — mà kiểu lệch
 * đó không báo lỗi gì, chỉ trông cẩu thả dần theo thời gian.
 *
 * Không tự lọc bài: nơi gọi biết rõ phải bỏ bài nào (ví dụ trang bài viết phải
 * bỏ chính nó). Trả về null khi danh sách rỗng để nơi gọi không phải tự kiểm.
 */
export default function PostStrip({
  baiViet,
  tieuDe,
  className = '',
}: {
  baiViet: Post[];
  tieuDe: string;
  className?: string;
}) {
  if (baiViet.length === 0) return null;

  return (
    <div className={`pt-8 border-t ${className}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{tieuDe}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {baiViet.map((bai) => (
          <Link
            key={bai.id}
            href={`/blog/${bai.slug}`}
            className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-primary-50 transition-colors group"
          >
            {bai.coverImage && (
              <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={bai.coverImage}
                  alt={bai.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {bai.category && (
                <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                  {bai.category}
                </span>
              )}
              <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors mt-0.5">
                {bai.title}
              </p>
              {bai.publishedAt && (
                <p className="text-gray-400 text-xs mt-1">
                  {dayjs(bai.publishedAt).format('DD/MM/YYYY')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
