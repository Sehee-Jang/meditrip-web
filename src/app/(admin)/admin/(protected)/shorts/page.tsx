import React from "react";
import ContentAdminClient from "@/components/admin/shorts/ShortsAdminClient";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";

export default function AdminContentsPage() {
  return (
    <>
      <AdminHeaderBar
        title='쇼츠 관리'
        description='유튜브 쇼츠 영상을 등록하고 카테고리/검색으로 목록을 관리하세요.'
      />
      <ContentAdminClient />
    </>
  );
}
