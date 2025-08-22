"use client";

import React, { useState } from "react";
import type { ClinicWithId } from "@/types/clinic";
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
import ClinicFormDialog from "./ClinicFormDialog";
import PackagesPanel from "./PackagesPanel";
import ClinicRowActions from "./ClinicRowActions";

interface Props {
  items: ClinicWithId[];
  onChanged: () => void;
  loading?: boolean;
}

export default function ClinicTable({ items, onChanged, loading }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [pkgClinicId, setPkgClinicId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  return (
    <div className='overflow-hidden rounded-2xl border shadow-sm'>
      <table className='w-full text-[13px]'>
        <thead className='bg-muted/50 text-left'>
          <tr>
            <th className='px-4 py-3'>이름</th>
            <th className='px-4 py-3'>카테고리</th>
            <th className='px-4 py-3'>상태</th>
            <th className='px-4 py-3 w-[260px] text-right'>액션</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className='border-t hover:bg-muted/30'>
              <td className='px-4 py-3'>{c.name.ko}</td>
              <td className='px-4 py-3'>{c.category ?? "-"}</td>
              <td className='px-4 py-3'>
                <Select
                  value={c.status}
                  onValueChange={async (v) => {
                    setUpdating(c.id);
                    await updateClinicStatus(c.id, v as "visible" | "hidden");
                    setUpdating(null);
                    onChanged();
                  }}
                  disabled={updating === c.id}
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
              <td className='px-4 py-3'>
                <div className='flex items-center jusfity-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setPkgClinicId(c.id)}
                  >
                    패키지
                  </Button>

                  <ClinicRowActions
                    onEdit={() => setEditId(c.id)}
                    onDelete={async () => {
                      if (!confirm("정말 삭제할까요?")) return;
                      await deleteClinic(c.id);
                      onChanged();
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (
            <tr>
              <td className='p-8 text-center text-muted-foreground' colSpan={4}>
                등록된 병원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editId && (
        <ClinicFormDialog
          clinicId={editId}
          open={true}
          onOpenChange={(v) => !v && setEditId(null)}
          onUpdated={() => {
            onChanged();
            setEditId(null);
          }}
        />
      )}

      {pkgClinicId && (
        <PackagesPanel
          clinicId={pkgClinicId}
          open={true}
          onOpenChange={(v: boolean) => {
            if (!v) setPkgClinicId(null);
          }}
        />
      )}
    </div>
  );
}
