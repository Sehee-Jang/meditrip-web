import React from "react";
import ContentManager from "@/components/admin/contents/ContentManager";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";

export default function AdminContentsPage() {
  return (
    <>
      <AdminHeaderBar
        title='컨텐츠 관리'
        description=' 컨텐츠를 관리할 수 있는 페이지입니다.'
      />
      <ContentManager />
    </>
  );
}
