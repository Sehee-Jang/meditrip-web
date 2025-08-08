import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserPointTable from "@/components/admin/points/UserPointTable";

export default function AdminPointsPage() {
  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>포인트 관리</h1>
        <p className='text-gray-500 text-sm'>
          커뮤니티 포인트 이벤트를 설정하고 유저별 포인트 적립 현황을
          관리하세요.
        </p>
      </div>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              유저 포인트 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserPointTable />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
