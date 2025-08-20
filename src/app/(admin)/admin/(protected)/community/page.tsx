import React from "react";
import CommunityAdminClient from "@/components/admin/community/CommunityAdminClient";
import {
  parseAdminFilterFromSearchParams,
  type AdminFilter,
  type AdminFilterSearchParams,
} from "@/features/community/admin/filters";

export default async function AdminCommunityPage({
  searchParams,
}: {
  searchParams: Promise<AdminFilterSearchParams>;
}) {
  const sp = await searchParams;
  const initialFilter: AdminFilter = parseAdminFilterFromSearchParams(sp);

  return (
    <div className='max-w-5xl mx-auto px-4 py-10 space-y-10'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>1:1 상담 관리</h1>
          <p className='text-gray-500 text-sm'>
            커뮤니티 페이지에 등록된 문의 내용을 확인하고 관리하세요.
          </p>
        </div>

        <CommunityAdminClient initialFilter={initialFilter} />
      </div>
    </div>
  );
}
