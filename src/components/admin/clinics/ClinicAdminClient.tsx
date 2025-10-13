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
import { Plus, Download, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function ClinicAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["admin-clinics"],
    queryFn: () => listClinics(100),
  });

  const exportIcon = useMemo(() => {
    if (!isExporting) return Download;
    return function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
      const className = props.className
        ? `${props.className} animate-spin`
        : "animate-spin";
      return <Loader2 {...props} className={className} />;
    };
  }, [isExporting]);

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

  const handleExport = async () => {
    try {
      setExportError(null);
      setIsExporting(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/clinics/export", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "엑셀 내보내기에 실패했습니다.");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const fallbackName = `clinics-export-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      const filename = match ? decodeURIComponent(match[1]) : fallbackName;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setExportError(message);
    } finally {
      setIsExporting(false);
    }
  };

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

        {/* 오른쪽: 아이콘들(다운로드/등록) */}
        <div className='ml-auto flex items-center gap-2 shrink-0'>
          <IconOnlyAddButton
            label='엑셀 다운로드'
            ariaLabel='엑셀 다운로드'
            icon={exportIcon}
            variant='outline'
            onClick={() => {
              void handleExport();
            }}
            disabled={isExporting}
            disableHoverSpin={isExporting}
          />

          <IconOnlyAddButton
            label='업체 추가'
            ariaLabel='업체 추가'
            icon={Plus}
            variant='brand'
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      {exportError && (
        <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700'>
          엑셀 다운로드 실패: {exportError}
        </div>
      )}

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
