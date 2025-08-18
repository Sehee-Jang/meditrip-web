import EventContainer from "@/components/admin/events/EventContainer";

export default function AdminEventPage() {
  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>이벤트 설정</h1>
        <p className='text-gray-500 text-sm'>
          유저가 활동할 때 지급될 이벤트를 등록하고 관리하세요.
        </p>
      </div>
      <EventContainer />
    </div>
  );
}
