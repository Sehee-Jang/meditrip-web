"use client";

import React from "react";
import { useMemo, useState } from "react";
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
import { RotateCcw, Save, Plus } from "lucide-react";

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

  // 정렬 변경 상태(dirty) + Table 액션 바인딩
  const [tableDirty, setTableDirty] = useState(false);
  const actionsRef = React.useRef<{
    save: () => void;
    cancel: () => void;
  } | null>(null);

  return (
    <div className='space-y-4'>
      {/* Toolbar: 데스크탑에서 한 줄 고정 */}
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-nowrap'>
        {/* 왼쪽: 검색 + 필터 (영역 전체가 늘어나도록 flex-1) */}
        <div className='flex-1 min-w-0'>
          <FilterRow>
            {/* 검색창은 남는 폭을 전부 사용 */}
            <div className='flex-1 min-w-[300px] md:min-w-[360px] lg:min-w-[420px]'>
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder='이름/주소로 검색'
                icon
                className='w-full'
              />
            </div>
            <div className='shrink-0'>
              <VisibilitySelect value={status} onChange={setStatus} />
            </div>
          </FilterRow>
        </div>

        {/* 오른쪽: 아이콘들(취소/저장/등록) */}
        <div className='ml-auto flex items-center gap-2 shrink-0'>
          {tableDirty && (
            <>
              <IconOnlyAddButton
                label='변경 취소'
                ariaLabel='변경 취소'
                icon={RotateCcw}
                variant='outline'
                onClick={() => actionsRef.current?.cancel()}
                disableHoverSpin
              />
              <IconOnlyAddButton
                label='변경사항 저장'
                ariaLabel='변경사항 저장'
                icon={Save}
                variant='brand'
                onClick={() => actionsRef.current?.save()}
                disableHoverSpin
              />
            </>
          )}

          <IconOnlyAddButton
            label='병원 추가'
            ariaLabel='병원 추가'
            icon={Plus}
            variant='brand'
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
        onDirtyChange={setTableDirty}
        onBindActions={(a) => {
          actionsRef.current = a;
        }}
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
