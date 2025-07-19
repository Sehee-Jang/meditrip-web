type VideoCardProps = {
  title: string;
  thumbnailUrl: string;
  viewCount: number;
  youtubeUrl: string;
};

export default function VideoCard({
  title,
  thumbnailUrl,
  viewCount,
  youtubeUrl,
}: VideoCardProps) {
  return (
    <a
      href={youtubeUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='block'
    >
      <img
        src={thumbnailUrl}
        alt={title}
        className='rounded-md w-full aspect-video object-cover'
      />
      <div className='mt-2 text-sm font-medium'>{title}</div>
      <div className='text-xs text-gray-500'>
        조회수: 👁 {viewCount.toLocaleString()}
      </div>
    </a>
  );
}
