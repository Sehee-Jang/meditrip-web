"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClinicWithId } from "@/types/clinic";
import { listClinics } from "@/services/admin/clinics/clinics";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/common/SearchInput";
import ClinicFormDialog from "./ClinicFormDialog";
import ClinicTable from "./ClinicTable";
import { Plus } from "lucide-react";

export default function ClinicAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");

    const { data, refetch, isFetching, error } = useQuery({
      queryKey: ["admin-clinics"],
      queryFn: () => listClinics(100),
    });

    const items = (data?.items ?? []) as ClinicWithId[];

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
        <div className='flex flex-1 items-center gap-2'>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder='이름/주소로 검색'
            icon
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className='h-9 rounded-md border bg-background px-3 text-[13px]'
            aria-label='노출 상태 필터'
          >
            <option value='all'>전체</option>
            <option value='visible'>노출</option>
            <option value='hidden'>숨김</option>
          </select>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <div className='text-[12px] text-muted-foreground hidden md:block'>
            {isFetching ? "불러오는 중…" : `총 ${filtered.length}개`}
          </div>
          <Button
            onClick={() => setOpen(true)}
            variant='brand'
            size='md'
            className='gap-1'
            aria-label='병원 추가'
          >
            <Plus className='-ml-1' /> 병원 추가
          </Button>
        </div>
      </div>

      {error && (
        <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700'>
          불러오기 실패: {(error as Error).message}
        </div>
      )}

      <ClinicTable items={filtered} onChanged={refetch} loading={isFetching} />

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
