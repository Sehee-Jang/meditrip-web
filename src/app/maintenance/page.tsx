export const metadata = {
  title: "준비 중입니다",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className='min-h-screen flex items-center justify-center px-6'>
      <div className='max-w-md text-center'>
        <h1 className='text-2xl md:text-3xl font-semibold'>
          홈페이지 준비 중입니다
        </h1>
        <p className='mt-3 text-muted-foreground'>
          더 나은 서비스를 위해 현재 페이지를 준비 중입니다.
          <br />
          잠시만 기다려 주세요.
        </p>
        <div className='mt-6 text-sm text-muted-foreground'>
          문의:{" "}
          <a href='mailto:contact@example.com' className='underline'>
            wellness.meditrip@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
