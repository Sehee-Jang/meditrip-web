"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  listPackagesAdmin,
  deletePackage,
  updatePackageOrders,
} from "@/services/admin/clinics/clinics";
import type { PackageWithId } from "@/types/clinic";
import FormSheet from "@/components/admin/common/FormSheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SectionCard from "@/components/admin/common/SectionCard";
import PackageFormDialog from "./PackageFormDialog";
import { formatDuration, formatPrice } from "@/lib/format";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import PackageRowActions from "./PackageRowActions";
import IconOnlyAddButton from "../common/IconOnlyAddButton";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

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
  const formId = useId();
  const [items, setItems] = useState<PackageWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<boolean>(false);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<PackageWithId | undefined>(undefined);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetPackage, setTargetPackage] = useState<PackageWithId | null>(
    null
  );

  // 최초 순서를 기억해두었다가 취소 시 복원
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
    setTargetPackage(p);
    setDeleteOpen(true);
  };

  const confirmRemove = async (): Promise<void> => {
    if (!targetPackage) return;
    try {
      setDeleting(true);
      await deletePackage(clinicId, targetPackage.id);
      await reload();
    } finally {
      setDeleting(false);
      setTargetPackage(null);
    }
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

  // 순서 변경 취소: 최초 순서로 복원
  const resetOrder = (): void => {
    const desiredOrder = new Map<string, number>(
      initialOrderRef.current.map((id, i) => [id, i])
    );
    setItems((prev) =>
      [...prev]
        .sort(
          (a, b) =>
            (desiredOrder.get(a.id) ?? 0) - (desiredOrder.get(b.id) ?? 0)
        )
        .map((pkg, idx) => ({ ...pkg, displayOrder: idx }))
    );
  };

  const handleSubmitOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    await handleSaveOrder();
  };

  return (
    <>
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        title='패키지 관리'
        formId={formId}
        submitLabel={savingOrder ? "저장 중…" : "순서 저장"}
        cancelLabel='닫기'
        loading={savingOrder}
        submitDisabled={!isOrderDirty}
        widthClassName='sm:max-w-[920px]'
      >
        <form
          id={formId}
          onSubmit={(event) => {
            void handleSubmitOrder(event);
          }}
          className='space-y-6'
        >
          <SectionCard
            title='패키지'
            description='등록된 패키지를 수정하거나 삭제할 수 있습니다.'
          >
            <div className='flex items-center justify-between px-5 py-4'>
              <div className='text-[13px] text-muted-foreground'>
                {loading ? "불러오는 중…" : `총 ${items.length}개`}
              </div>
              <div className='text-[12px] text-red-600'>{error}</div>
              <div className='flex flex-wrap items-center justify-end gap-2'>
                {isOrderDirty ? (
                  <Button type='button' variant='outline' onClick={resetOrder}>
                    변경 취소
                  </Button>
                ) : null}
                <IconOnlyAddButton
                  label='패키지 추가'
                  ariaLabel='패키지 추가'
                  icon={Plus}
                  variant='brand'
                  onClick={handleCreate}
                />
              </div>
            </div>

            <div className='p-5'>
              {isOrderDirty ? (
                <div className='mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-[12px] text-indigo-800'>
                  패키지 순서가 변경되었습니다. 하단의 [순서 저장] 버튼을 눌러
                  반영하세요.
                </div>
              ) : null}
              {!loading && items.length === 0 ? (
                <div className='rounded-2xl border border-dashed p-6 text-center text-[12px] text-muted-foreground'>
                  등록된 패키지가 없습니다.
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  {items.map((p, index) => (
                    <Card
                      key={p.id}
                      className='rounded-2xl border bg-card p-4 transition-shadow hover:shadow-sm'
                    >
                      {/* 3열 그리드: 번호 / 본문 / 액션 */}
                      <div className='grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4'>
                        {/* 이동 버튼, 번호 */}
                        <div className='flex flex-col gap-1 self-start sm:self-auto'>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            aria-label='위로 이동'
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                            className='h-8 w-8'
                          >
                            <ChevronUp className='h-4 w-4' />
                            <span className='sr-only'>위로</span>
                          </Button>
                          {/* Index */}
                          <div className='flex h-8 w-8 items-center justify-center text-[12px] font-medium text-muted-foreground'>
                            {index + 1}
                          </div>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            aria-label='아래로 이동'
                            disabled={index === items.length - 1}
                            onClick={() => moveItem(index, 1)}
                            className='h-8 w-8'
                          >
                            <ChevronDown className='h-4 w-4' />
                            <span className='sr-only'>아래로</span>
                          </Button>
                        </div>
                        {/* 본문 */}
                        <div className='min-w-0 space-y-1'>
                          <div className='text-[14px] font-medium leading-5 break-keep line-clamp-1'>
                            {p.title.ko}
                          </div>

                          {p.subtitle?.ko && (
                            <p className='text-[12px] text-muted-foreground leading-4 break-keep line-clamp-1'>
                              {p.subtitle.ko}
                            </p>
                          )}
                          <div className='flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground'>
                            <span>{formatDuration("ko", p.duration)}</span>
                            <span aria-hidden>·</span>
                            <span>{formatPrice("ko", p.price.ko)}</span>
                          </div>
                        </div>

                        {/* 더보기 */}
                        <div className='flex flex-col items-end gap-2 whitespace-nowrap sm:flex-row sm:items-center sm:justify-end'>
                          {/* 병원 목록과 동일한 더보기 액션 */}
                          <PackageRowActions
                            onEdit={() => handleEdit(p)}
                            onDelete={() => void handleRemove(p)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </form>
      </FormSheet>

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

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setTargetPackage(null);
        }}
        title='패키지를 삭제할까요?'
        description={
          targetPackage
            ? `“${targetPackage.title.ko}” 항목이 삭제됩니다.`
            : undefined
        }
        confirmText='삭제'
        cancelText='취소'
        confirmVariant='destructive'
        loading={deleting}
        onConfirm={confirmRemove}
      />
    </>
  );
}
