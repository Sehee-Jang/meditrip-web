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
import { RotateCcw, Save, Plus, Download, Loader2, UploadCloud } from "lucide-react";
import { auth } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

type ImportRowError = {
  sheet: "Clinics" | "Packages";
  row: number;
  errors: string[];
};

export default function ClinicAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
 const [isImporting, setIsImporting] = useState(false);
 const [importError, setImportError] = useState<string | null>(null);
 const [importValidationErrors, setImportValidationErrors] = useState<
   ImportRowError[]
 >([]);
 const [importSummaryNote, setImportSummaryNote] = useState<string | null>(
   null
 );
  
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

    const importIcon = useMemo(() => {
      if (!isImporting) return UploadCloud;
      return function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
        const className = props.className
          ? `${props.className} animate-spin`
          : "animate-spin";
        return <Loader2 {...props} className={className} />;
      };
    }, [isImporting]);

  
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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  
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

  const handleImportFile = async (file: File) => {
    try {
      setImportError(null);
      setImportValidationErrors([]);
      setImportSummaryNote(null);
      setIsImporting(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/clinics/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          payload && typeof payload.error === "string"
            ? payload.error
            : "엑셀 업로드에 실패했습니다.";
        setImportError(message);
        setImportValidationErrors([]);
        setImportSummaryNote(null);
        return;
      }

      const clinicsCreated = payload?.summary?.clinics?.created ?? 0;
      const clinicsUpdated = payload?.summary?.clinics?.updated ?? 0;
      const packagesCreated = payload?.summary?.packages?.created ?? 0;
      const packagesUpdated = payload?.summary?.packages?.updated ?? 0;
      const note = payload?.summary?.packages?.note as string | undefined;

      setImportValidationErrors(
        Array.isArray(payload?.errors)
          ? (payload.errors as ImportRowError[])
          : []
      );
      setImportSummaryNote(note ?? null);
      toast({
        title: "엑셀 업로드 완료",
        description: `병원 ${clinicsCreated}개 생성, ${clinicsUpdated}개 업데이트 · 패키지 ${packagesCreated}개 생성, ${packagesUpdated}개 업데이트`,
      });
      setImportError(null);
      void refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setImportError(message);
      setImportValidationErrors([]);
      setImportSummaryNote(null);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className='space-y-4'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.xlsx'
        className='hidden'
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImportFile(file);
          }
        }}
      />
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
            label='엑셀 업로드'
            ariaLabel='엑셀 업로드'
            icon={importIcon}
            variant='outline'
            onClick={() => {
              fileInputRef.current?.click();
            }}
            disabled={isImporting}
            disableHoverSpin={isImporting}
          />

          <IconOnlyAddButton
            label='병원 추가'
            ariaLabel='병원 추가'
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

      {importError && (
        <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700'>
          엑셀 업로드 실패: {importError}
        </div>
      )}

      {importSummaryNote && !importError && (
        <div className='rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] text-blue-700'>
          {importSummaryNote}
        </div>
      )}

      {importValidationErrors.length > 0 && !importError && (
        <div className='rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900'>
          <p className='font-semibold'>
            엑셀 업로드 중 일부 행에서 오류가 발생했습니다.
          </p>
          <ul className='mt-1 space-y-1'>
            {importValidationErrors.map((item, idx) => (
              <li key={`${item.sheet}-${item.row}-${idx}`}>
                <span className='font-semibold'>
                  {item.sheet} 시트 {item.row}행:
                </span>{" "}
                {item.errors.join("; ")}
              </li>
            ))}
          </ul>
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
