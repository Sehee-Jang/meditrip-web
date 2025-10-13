"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  listPackagesAdmin,
  deletePackage,
} from "@/services/admin/clinics/clinics";
import type { PackageWithId } from "@/types/clinic";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SectionCard from "@/components/admin/common/SectionCard";
import PackageFormDialog from "./PackageFormDialog";
import { formatDuration, formatPrice } from "@/lib/format";

export interface PackagesPanelProps {
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PackagesPanel({
  clinicId,
  open,
  onOpenChange,
}: PackagesPanelProps) {
  const [items, setItems] = useState<PackageWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<PackageWithId | undefined>(undefined);

  async function reload(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const list = await listPackagesAdmin(clinicId);
      setItems(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) void reload(); // 시트 열릴 때만 최신화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clinicId]);

  const handleCreate = (): void => {
    setEditing(undefined);
    setOpenForm(true);
  };

  const handleEdit = (p: PackageWithId): void => {
    setEditing(p);
    setOpenForm(true);
  };

  const handleRemove = async (p: PackageWithId): Promise<void> => {
    if (!confirm(`패키지 "${p.title.ko}" 를 삭제하시겠어요?`)) return;
    await deletePackage(clinicId, p.id);
    await reload();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='w-full sm:max-w-[920px] p-0'>
          <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='sticky top-0 z-10 border-b bg-background'>
              <div className='flex items-center justify-between px-6 py-4'>
                <SheetHeader className='space-y-0'>
                  <SheetTitle className='text-base font-semibold'>
                    패키지 관리
                  </SheetTitle>
                </SheetHeader>
                <div className='flex items-center gap-2'>
                  <Button
                    className='bg-indigo-700 hover:bg-indigo-800'
                    onClick={handleCreate}
                  >
                    패키지 추가
                  </Button>
                  <Button variant='outline' onClick={() => onOpenChange(false)}>
                    닫기
                  </Button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className='min-h-0 flex-1 overflow-y-auto px-6 py-6'>
              <SectionCard
                title='패키지'
                description='등록된 패키지를 수정하거나 삭제할 수 있습니다.'
              >
                <div className='flex items-center justify-between px-5 py-4'>
                  <div className='text-[13px] text-muted-foreground'>
                    {loading ? "불러오는 중…" : `총 ${items.length}개`}
                  </div>
                  <div className='text-[12px] text-red-600'>{error}</div>
                </div>

                <div className='px-5 py-5'>
                  {!loading && items.length === 0 ? (
                    <div className='rounded-lg border border-dashed p-6 text-center text-[12px] text-muted-foreground'>
                      등록된 패키지가 없습니다.
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      {items.map((p) => (
                        <Card key={p.id} className='p-4'>
                          <div className='mb-1 flex items-center justify-between gap-3'>
                            <div className='min-w-0'>
                              <div className='truncate text-[14px] font-medium'>
                                {p.title.ko}
                              </div>
                              {p.subtitle?.ko && (
                                <div className='truncate text-[12px] text-muted-foreground'>
                                  {p.subtitle.ko}
                                </div>
                              )}
                            </div>
                            <div className='shrink-0 space-x-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => handleEdit(p)}
                              >
                                수정
                              </Button>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => void handleRemove(p)}
                              >
                                삭제
                              </Button>
                            </div>
                          </div>

                          <div className='text-[12px] text-muted-foreground'>
                            {formatDuration("ko", p.duration)} ·{" "}
                            {formatPrice("ko", p.price.ko)}
                          </div>

                          {p.packageImages && p.packageImages.length > 0 && (
                            <div className='mt-1 text-[11px] text-muted-foreground'>
                              이미지 {p.packageImages.length}장
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* 추가/수정 */}
      <PackageFormDialog
        clinicId={clinicId}
        open={openForm}
        onOpenChange={(v: boolean) => setOpenForm(v)}
        pkg={editing}
        onSaved={async () => {
          await reload();
          setOpenForm(false);
          setEditing(undefined);
        }}
      />
    </>
  );
}
