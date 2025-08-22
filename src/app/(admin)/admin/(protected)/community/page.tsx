import React from "react";
import CommunityAdminClient from "@/components/admin/community/CommunityAdminClient";
import {
  parseAdminFilterFromSearchParams,
  type AdminFilter,
  type AdminFilterSearchParams,
} from "@/features/community/admin/filters";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";

export default async function AdminCommunityPage({
  searchParams,
}: {
  searchParams: Promise<AdminFilterSearchParams>;
}) {
  const sp = await searchParams;
  const initialFilter: AdminFilter = parseAdminFilterFromSearchParams(sp);

  return (
    <>
      <AdminHeaderBar
        title='1:1 상담 관리'
        description='커뮤니티 페이지에 등록된 문의 내용을 확인하고 관리하세요.'
      />
      <CommunityAdminClient initialFilter={initialFilter} />
    </>
  );
}
