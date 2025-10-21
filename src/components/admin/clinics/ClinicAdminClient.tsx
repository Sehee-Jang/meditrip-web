"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClinicWithId } from "@/types/clinic";
import { listClinics, type ListResult } from "@/services/admin/clinics/clinics";
import SearchInput from "@/components/common/SearchInput";
import {
  FilterRow,
  VisibilitySelect,
} from "@/components/admin/common/FilterControls";
import ClinicFormDialog from "./ClinicFormDialog";
import ClinicTable from "./ClinicTable";
import ClinicDeletedTable from "./ClinicDeletedTable";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import { Plus, Download, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabValue = "active" | "deleted";

export default function ClinicAdminClient() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "visible" | "hidden">("all");
  const [tab, setTab] = useState<TabValue>("active");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, refetch, isFetching, error } = useQuery({
    queryKey: ["admin-clinics"],
    queryFn: () => listClinics(100),
  });

   const patchClinic = useCallback(
     (clinicId: string, patch: Partial<ClinicWithId>) => {
       queryClient.setQueryData<ListResult<ClinicWithId> | undefined>(
         ["admin-clinics"],
         (prev) => {
           if (!prev) return prev;
           return {
             ...prev,
             items: prev.items.map((clinic) =>
               clinic.id === clinicId ? { ...clinic, ...patch } : clinic
             ),
           };
         }
       );
     },
     [queryClient]
   );

  const exportIcon = useMemo(() => {
    if (!isExporting) return Download;
    return function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
      const className = props.className
        ? `${props.className} animate-spin`
        : "animate-spin";
      return <Loader2 {...props} className={className} />;
    };
  }, [isExporting]);

  const items = useMemo<ClinicWithId[]>(() => {
    const all = (data?.items ?? []) as ClinicWithId[];
    return all;
  }, [data]);

  const activeItems = useMemo(
    () => items.filter((clinic) => clinic.isDeleted !== true),
    [items]
  );

  const deletedItems = useMemo(
    () => items.filter((clinic) => clinic.isDeleted === true),
    [items]
  );

  const filteredActive = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return activeItems.filter((c) => {
      const hitKW =
        kw.length === 0 ||
        c.name.ko.toLowerCase().includes(kw) ||
        c.name.ja.toLowerCase().includes(kw) ||
        c.address.ko.toLowerCase().includes(kw) ||
        c.address.ja.toLowerCase().includes(kw);
      const hitStatus = status === "all" ? true : c.status === status;
      return hitKW && hitStatus;
    });
  }, [activeItems, keyword, status]);

  const filteredDeleted = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const result = deletedItems.filter((c) => {
      if (kw.length === 0) return true;
      return (
        c.name.ko.toLowerCase().includes(kw) ||
        c.name.ja.toLowerCase().includes(kw) ||
        c.address.ko.toLowerCase().includes(kw) ||
        c.address.ja.toLowerCase().includes(kw)
      );
    });

    return result.sort((a, b) => {
      const getTime = (clinic: ClinicWithId): number => {
        const value = clinic.deletedAt;
        if (!value) return 0;
        if (value instanceof Date) return value.getTime();
        if (typeof (value as { toDate?: () => Date }).toDate === "function") {
          return (value as { toDate: () => Date }).toDate().getTime();
        }
        if (
          typeof value === "object" &&
          "seconds" in value &&
          typeof (value as { seconds: unknown }).seconds === "number"
        ) {
          return (value as { seconds: number }).seconds * 1000;
        }
        return 0;
      };

      return getTime(b) - getTime(a);
    });
  }, [deletedItems, keyword]);

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

  const renderToolbar = (options: {
    showStatus: boolean;
    showActions: boolean;
  }) => (
    <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:flex-nowrap'>
      <div className='flex-1 min-w-0'>
        <FilterRow>
          <div className='flex-1 min-w-[300px] md:min-w-[360px] lg:min-w-[420px]'>
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder='이름/주소로 검색'
              icon
              className='w-full'
            />
          </div>
          {options.showStatus ? (
            <div className='shrink-0'>
              <VisibilitySelect value={status} onChange={setStatus} />
            </div>
          ) : null}
        </FilterRow>
      </div>

      {options.showActions ? (
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
      ) : null}
    </div>
  );
  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
        className='space-y-4'
      >
        <TabsList className='w-full sm:w-auto'>
          <TabsTrigger value='active'>
            업체 목록 ({activeItems.length.toLocaleString()})
          </TabsTrigger>
          <TabsTrigger value='deleted'>
            삭제된 항목 ({deletedItems.length.toLocaleString()})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='active' className='space-y-4'>
          {renderToolbar({ showStatus: true, showActions: true })}
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
            items={filteredActive}
            totalCount={activeItems.length}
            onChanged={refetch}
            loading={isFetching}
            onClinicPatched={patchClinic}
          />
        </TabsContent>

        <TabsContent value='deleted' className='space-y-4'>
          {renderToolbar({ showStatus: false, showActions: false })}

          {error && (
            <div className='rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700'>
              불러오기 실패: {(error as Error).message}
            </div>
          )}

          <ClinicDeletedTable
            items={filteredDeleted}
            totalCount={deletedItems.length}
            onChanged={refetch}
            loading={isFetching}
          />
        </TabsContent>
      </Tabs>

      <ClinicFormDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          void refetch();
        }}
      />
    </>
  );
}
