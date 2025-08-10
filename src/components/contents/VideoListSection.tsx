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
        {/* 핵심: 고정 카드폭 트랙 + 왼쪽 정렬 */}
        <div
          className='
            [--card:160px] sm:[--card:180px] lg:[--card:220px]
            grid justify-start md:justify-center
            gap-x-4 gap-y-6
            [grid-template-columns:repeat(auto-fill,minmax(var(--card),var(--card)))]
          '
        >
          {videos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>
    </section>
  );
}
