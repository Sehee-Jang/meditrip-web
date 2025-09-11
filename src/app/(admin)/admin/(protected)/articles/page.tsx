import React from "react";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import ArticlesAdminClient from "@/components/admin/articles/ArticlesAdminClient";

export default function AdminContentsPage() {
  return (
    <>
      <AdminHeaderBar
        title='K-웰니스 아티클 관리'
        description='블로그형 콘텐츠를 등록·수정하고 노출을 관리합니다.'
      />
      <ArticlesAdminClient />
    </>
  );
}
