"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  listPackagesAdmin,
  deletePackage,
  updatePackageOrders,
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
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

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
  const [savingOrder, setSavingOrder] = useState<boolean>(false);
  
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<PackageWithId | undefined>(undefined);

  const initialOrderRef = useRef<string[]>([]);

  const currentOrder = useMemo(() => items.map((item) => item.id), [items]);
  const isOrderDirty = useMemo(() => {
    const original = initialOrderRef.current;
    if (original.length !== currentOrder.length) return true;
    return currentOrder.some((id, idx) => id !== original[idx]);
  }, [currentOrder]);

  async function reload(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const list = await listPackagesAdmin(clinicId);
      setItems(list);
      initialOrderRef.current = list.map((item) => item.id);
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

  const moveItem = (index: number, delta: number): void => {
    setItems((prev) => {
      const next = [...prev];
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const [removed] = next.splice(index, 1);
      next.splice(targetIndex, 0, removed);
      return next.map((pkg, idx) => ({ ...pkg, displayOrder: idx }));
    });
  };

  const handleSaveOrder = async (): Promise<void> => {
    if (!isOrderDirty) return;
    setSavingOrder(true);
    try {
      const orderMap = items.map((pkg, idx) => ({
        id: pkg.id,
        displayOrder: idx,
      }));
      await updatePackageOrders(clinicId, orderMap);
      initialOrderRef.current = orderMap.map((o) => o.id);
      setItems((prev) =>
        prev.map((pkg, idx) => ({ ...pkg, displayOrder: idx }))
      );
      setError(null);
    } catch (e) {
      setError((e as Error).message ?? "패키지 순서를 저장하지 못했습니다.");
    } finally {
      setSavingOrder(false);
    }
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
                    variant='outline'
                    disabled={!isOrderDirty || savingOrder}
                    onClick={() => void handleSaveOrder()}
                  >
                    {savingOrder ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        저장 중...
                      </>
                    ) : (
                      "순서 저장"
                    )}
                  </Button>
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
                    <div className='flex flex-col gap-4'>
                      {items.map((p, index) => (
                        <Card key={p.id} className='p-4'>
                          <div className='mb-3 flex items-start justify-between gap-4'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-8 w-8 items-center justify-center rounded-md border text-[12px] font-medium text-muted-foreground'>
                                {index + 1}
                              </div>
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
                            </div>
                            <div className='flex shrink-0 items-center gap-2'>
                              <Button
                                size='icon'
                                variant='outline'
                                disabled={index === 0}
                                aria-label='위로 이동'
                                onClick={() => moveItem(index, -1)}
                              >
                                <ArrowUp className='h-4 w-4' />
                              </Button>
                              <Button
                                size='icon'
                                variant='outline'
                                disabled={index === items.length - 1}
                                aria-label='아래로 이동'
                                onClick={() => moveItem(index, 1)}
                              >
                                <ArrowDown className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>

                          <div className='mb-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground'>
                            <span>{formatDuration("ko", p.duration)}</span>
                            <span>·</span>
                            <span>{formatPrice("ko", p.price.ko)}</span>
                          </div>

                          {p.packageImages && p.packageImages.length > 0 && (
                            <div className='mt-1 text-[11px] text-muted-foreground'>
                              이미지 {p.packageImages.length}장
                            </div>
                          )}

                          <div className='flex items-center justify-end gap-2'>
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
