import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import UserAdminClient from "@/components/admin/users/UserAdminClient";

export default function AdminPointsPage() {
  return (
    <>
      <AdminHeaderBar
        title='회원관리'
        description=' 회원 목록을 조회하고, 포인트를 관리하세요.'
      />

      <UserAdminClient />
    </>
  );
}
