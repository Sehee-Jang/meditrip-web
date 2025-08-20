import UserAdminClient from "@/components/admin/users/UserAdminClient";

export default function AdminPointsPage() {
  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>회원관리</h1>
        <p className='text-gray-500 text-sm'>
          회원 목록을 조회하고, 포인트를 관리하세요.
        </p>
      </div>

      <UserAdminClient />
    </div>
  );
}
