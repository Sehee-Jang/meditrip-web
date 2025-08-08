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
      <div className='flex flex-wrap md:gap-4 items-start md:justify-between gap-4 justify-around'>
        {videos.map((video) => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </section>
  );
}
