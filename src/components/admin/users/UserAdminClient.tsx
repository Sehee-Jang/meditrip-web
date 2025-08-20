import React from "react";
import UserTable from "./UserTable";

export default function UserAdminClient() {
  return (
    <div className='space-y-4'>
      {/* 여기에 필터 선택 영역 추가 */}
      <div></div>

      <UserTable />
    </div>
  );
}
