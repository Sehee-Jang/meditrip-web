import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import ClinicAdminClient from "@/components/admin/clinics/ClinicAdminClient";

export default function AdminClinicsPage() {
  return (
    <>
      <AdminHeaderBar
        title='업체관리'
        description='업체 등록/수정하고 노출 상태와 패키지를 관리하세요.'
      />

      <ClinicAdminClient />
    </>
  );
}
