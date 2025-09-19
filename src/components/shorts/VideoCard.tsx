import { useTranslations } from "next-intl";
import Image from "next/image";
import type { CategoryKey } from "@/constants/categories";

type VideoCardProps = {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount?: number;
  youtubeUrl: string;
  category: CategoryKey;
  isBlocked?: boolean;
};

export default function VideoCard({
  id,
  title,
  thumbnailUrl,
  youtubeUrl,
  category,
  isBlocked = false,
}: VideoCardProps) {
  const t = useTranslations("categories");

  return (
    <div
      data-id={id}
      className='shorts-item w-full h-full border border-black/10 rounded-lg overflow-hidden bg-background relative'
      style={{
        filter: isBlocked ? "blur(4px)" : "none",
        pointerEvents: isBlocked ? "none" : "auto",
        opacity: isBlocked ? 0.5 : 1,
        transition: "all 0.3s ease",
      }}
    >
      <a href={youtubeUrl} target='_blank' rel='noopener noreferrer'>
        {/* 고정 높이/너비 제거 → 비율로 통일 */}
        <div className='relative w-full aspect-[9/16]'>
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className='object-cover'
            sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 20vw'
            priority={false}
          />
        </div>

        <div className='p-2'>
          <p className='text-xs text-muted-foreground'>
            {t(category, { fallback: category })}
          </p>
          <p className='text-sm font-bold mt-1 line-clamp-2'>{title}</p>
        </div>
      </a>
    </div>
  );
}
