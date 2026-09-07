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
 *
 * KHÔNG hiện danh mục nữa. Trường `category` trong CSDL là một mớ lẫn lộn giữa
 * slug và nhãn tiếng Việt — "chia-se", "tin-tuc", "kinh nghiệm",
 * "Thông tin gà đẻ trứng" — nên nó vừa xấu vừa không giúp người đọc quyết định
 * có bấm hay không. Chỗ đó nhường cho đoạn mô tả, thứ thật sự trả lời câu hỏi
 * "bài này có gì cho tôi": 89/90 bài đều có sẵn excerpt.
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
            className="flex gap-3.5 items-start bg-white border border-gray-200 rounded-xl p-3.5 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            {/*
              Ảnh vuông 88px và LUÔN chiếm chỗ, kể cả khi bài thiếu ảnh bìa: để
              ô ảnh biến mất thì thẻ đó tụt lề trái so với thẻ bên cạnh và cả
              lưới trông xộc xệch.
            */}
            <div className="relative w-[88px] h-[88px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {bai.coverImage && (
                <Image
                  src={bai.coverImage}
                  alt={bai.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="88px"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
                {bai.title}
              </p>

              {/*
                Đoạn mô tả là lý do người ta bấm vào: tiêu đề cho biết bài nói
                về cái gì, mô tả cho biết bài giải quyết vấn đề gì. 88/89 bài có
                excerpt dài hơn 160 ký tự nên bắt buộc phải cắt dòng.
              */}
              {bai.excerpt && (
                <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {bai.excerpt}
                </p>
              )}

              {bai.publishedAt && (
                <p className="text-gray-400 text-[11px] mt-2">
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
