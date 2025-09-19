import { Timestamp } from "firebase/firestore";

interface Log {
  id?: string;
  points: number;
  description?: string;
  createdAt?: Timestamp | { toDate: () => Date };
}

interface Props {
  logs: Log[];
  emptyMessage?: string;
}

export default function PointLogList({ logs, emptyMessage }: Props) {
  if (logs.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        {emptyMessage || "포인트 내역이 없습니다."}
      </p>
    );
  }

  return (
    <ul className='space-y-4 max-h-[300px] overflow-y-auto mt-2'>
      {logs.map((log, idx) => {
        const date = log.createdAt?.toDate?.()?.toLocaleDateString("ko-KR");
        const isPlus = log.points > 0;
        return (
          <li
            key={log.id || idx}
            className='flex justify-between items-center border-b pb-2'
          >
            <div className='text-sm text-muted-foreground'>
              <p className='font-medium'>{log.description}</p>
              <p className='text-xs text-muted-foreground'>{date}</p>
            </div>
            <div
              className={`text-sm font-semibold ${
                isPlus
                  ? "text-green-600 dark:text-green-300"
                  : "text-red-500 dark:text-red-300"
              }`}
            >
              {isPlus ? "+" : ""}
              {log.points}P
            </div>
          </li>
        );
      })}
    </ul>
  );
}
