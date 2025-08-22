import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import EventContainer from "@/components/admin/events/EventContainer";

export default function AdminEventPage() {
  return (
    <>
      <AdminHeaderBar
        title='이벤트 설정'
        description='유저가 활동할 때 지급될 이벤트를 등록하고 관리하세요.'
      />
      <EventContainer />
    </>
  );
}
