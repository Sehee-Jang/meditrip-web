import React from "react";
import ContentAdminClient from "@/components/admin/contents/ContentAdminClient";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";

export default function AdminContentsPage() {
  return (
    <>
      <AdminHeaderBar
        title='컨텐츠 관리'
        description='동영상을 등록하고 카테고리/검색으로 목록을 관리하세요.'
      />
      <ContentAdminClient />
    </>
  );
}
