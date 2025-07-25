import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { CategoryKey } from "@/constants/categories";

type VideoCardProps = {
  id: number;
  title: string;
  thumbnailUrl: string;
  viewCount: number;
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
      className='shorts-item w-[150px] border border-black/10 rounded-lg overflow-hidden bg-white relative'
      style={{
        filter: isBlocked ? "blur(4px)" : "none",
        pointerEvents: isBlocked ? "none" : "auto",
        opacity: isBlocked ? 0.5 : 1,
        transition: "all 0.3s ease",
      }}
    >
      <Link href={youtubeUrl} target='_blank'>
        <div className='relative w-full h-[150px]'>
          <Image src={thumbnailUrl} alt={title} fill className='object-cover' />
        </div>
        <div className='p-2'>
          <p className='text-sm text-gray-800'>
            {t(category, { fallback: category })}
          </p>
          <p className='text-sm font-bold mt-1 line-clamp-2'>{title}</p>
        </div>
      </Link>
    </div>
  );
}
