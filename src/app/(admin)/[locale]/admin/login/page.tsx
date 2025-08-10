import AdminLoginForm from "@/components/admin/auth/AdminLoginForm";

export default async function AdminLoginPage() {
  // [locale] 세그먼트가 있어도 params를 굳이 받을 필요 없어요(미사용 변수 경고 회피).
  return (
    <main className='min-h-dvh flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-xl font-semibold mb-4'>관리자 로그인</h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
