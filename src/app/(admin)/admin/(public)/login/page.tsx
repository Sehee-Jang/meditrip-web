import AdminLoginForm from "@/components/admin/auth/AdminLoginForm";

export default async function AdminLoginPage() {
  return (
    <main className='min-h-dvh flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <h1 className='text-xl font-semibold mb-4'>관리자 로그인</h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
