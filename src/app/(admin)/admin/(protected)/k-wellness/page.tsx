import React from "react";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import WellnessAdminClient from "@/components/admin/k-wellness/WellnessAdminClient";

export default function AdminContentsPage() {
  return (
    <>
      <AdminHeaderBar
        title='K-웰니스 콘텐츠 관리'
        description='블로그형 콘텐츠를 등록·수정하고 노출을 관리합니다.'
      />

      <WellnessAdminClient />
    </>
  );
}
