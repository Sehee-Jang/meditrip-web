"use client";

import React from "react";
import {
  deleteClinic,
  updateClinicStatus,
} from "@/services/admin/clinics/clinics";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClinicRowActions from "./ClinicRowActions";
import { ClinicWithId } from "@/types/clinic";

type ClinicStatus = "visible" | "hidden";

type Props = {
  clinic: ClinicWithId;
  onUpdated: () => void; // 상태 변경/삭제 후 목록 갱신
  onOpenPackages: (clinicId: string) => void;
  onEdit: (clinicId: string) => void;
};
export default function ClinicTableRow({
  clinic,
  onUpdated,
  onOpenPackages,
  onEdit,
}: Props) {
  const [updating, setUpdating] = React.useState(false);

  const handleChangeStatus = async (next: ClinicStatus) => {
    if (next === clinic.status) return;
    try {
      setUpdating(true);
      await updateClinicStatus(clinic.id, next);
      onUpdated();
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    await deleteClinic(clinic.id);
    onUpdated();
  };

  return (
    <tr className='border-t hover:bg-muted/20'>
      <td className='px-4 py-3'>{clinic.name?.ko ?? "-"}</td>
      <td className='px-4 py-3'>{clinic.category ?? "-"}</td>
      <td className='px-4 py-3 text-center'>
        <Select
          value={clinic.status}
          onValueChange={(v) => handleChangeStatus(v as ClinicStatus)}
          disabled={updating}
        >
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='visible'>노출</SelectItem>
            <SelectItem value='hidden'>숨김</SelectItem>
          </SelectContent>
        </Select>
      </td>

      <td className='px-4 py-3 text-right pr-4'>
        <div className='inline-flex items-center justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenPackages(clinic.id)}>
            패키지
          </Button>

          <ClinicRowActions
            onEdit={() => onEdit(clinic.id)}
            onDelete={handleDelete}
          />
        </div>
      </td>
    </tr>
  );
}
