import React from "react";

import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import ReservationAdminClient from "@/components/admin/reservations/ReservationAdminClient";

export default function AdminReservationsPage() {
  return (
    <>
      <AdminHeaderBar
        title='예약 관리 페이지'
        description='예약을 관리할 수 있는 페이지입니다.'
      />
      <ReservationAdminClient />
    </>
  );
}
