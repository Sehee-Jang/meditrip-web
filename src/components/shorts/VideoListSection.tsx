import VideoCard from "./VideoCard";
import type { Video } from "@/types/video";

type Props = {
  title: string;
  videos: Video[];
};

export default function VideoListSection({ title, videos }: Props) {
  return (
    <section className='mb-8'>
      <h2 className='text-lg font-bold mb-4'>{title}</h2>

      {/* 사이트 공통 좌우 여백 + 중앙 정렬 */}
      <div className='mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8'>
        {/* 기본: 2열(모바일 전 기기). 태블릿 3열, 데스크탑 4~5열 */}
        <ul className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {videos.map((video) => (
            <li key={video.id} className='h-full'>
              <VideoCard {...video} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
