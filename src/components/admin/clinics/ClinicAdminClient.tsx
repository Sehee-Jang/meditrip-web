"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClinicWithId } from "@/types/clinic";
import { listClinics } from "@/services/admin/clinics/clinics";
import SearchInput from "@/components/common/SearchInput";
import {
  FilterRow,
  VisibilitySelect,
} from "@/components/admin/common/FilterControls";
import ClinicFormDialog from "./ClinicFormDialog";
import ClinicTable from "./ClinicTable";
import IconOnlyAddButton from "../common/IconOnlyAddButton";

export default function ClinicAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");

  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["admin-clinics"],
    queryFn: () => listClinics(100),
  });

  const items = useMemo<ClinicWithId[]>(
    () => (data?.items ?? []) as ClinicWithId[],
    [data]
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((c) => {
      const hitKW =
        kw.length === 0 ||
        c.name.ko.toLowerCase().includes(kw) ||
        c.name.ja.toLowerCase().includes(kw) ||
        c.address.ko.toLowerCase().includes(kw) ||
        c.address.ja.toLowerCase().includes(kw);
      const hitStatus = status === "all" ? true : c.status === status;
      return hitKW && hitStatus;
    });
  }, [items, keyword, status]);

  useEffect(() => {
    // 필요 시 실시간 onSnapshot으로 대체 가능
  }, []);

  return (
    <div className='space-y-4'>
      {/* Toolbar */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <FilterRow>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder='이름/주소로 검색'
            icon
          />
          <VisibilitySelect value={status} onChange={setStatus} />
        </FilterRow>

        <div className='flex shrink-0 items-center gap-2'>
          <IconOnlyAddButton
            label='병원 추가'
            ariaLabel='병원 추가'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      {error && (
        <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700'>
          불러오기 실패: {(error as Error).message}
        </div>
      )}

      <ClinicTable
        items={filtered}
        totalCount={items.length}
        onChanged={refetch}
        loading={isFetching}
      />

      <ClinicFormDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          void refetch();
        }}
      />
    </div>
  );
}
