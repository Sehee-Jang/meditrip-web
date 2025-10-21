"use client";

import React from "react";
import {
  deleteClinic,
  updateClinicRecommendation,
  updateClinicStatus,
} from "@/services/admin/clinics/clinics";
import { toast } from "sonner";
import ClinicRowActions from "./ClinicRowActions";
import { ClinicWithId } from "@/types/clinic";
import { CATEGORY_LABELS_KO, type CategoryKey } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp } from "lucide-react";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

type Props = {
  clinic: ClinicWithId;
  index: number;
  flash?: boolean;
  onUpdated: () => void; // 상태 변경/삭제 후 목록 갱신
  onOpenPackages: (clinicId: string) => void;
  onEdit: (clinicId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  sortingDisabled?: boolean;
};

export default function ClinicTableRow({
  clinic,
  index,
  flash = false,
  onUpdated,
  onOpenPackages,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  sortingDisabled = false,
}: Props) {
  const [updating, setUpdating] = React.useState(false);
  const [recommendationUpdating, setRecommendationUpdating] =
    React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleToggleRecommendation = async (checked: boolean) => {
    try {
      setRecommendationUpdating(true);
      await updateClinicRecommendation(clinic.id, checked);
      onUpdated();
    } finally {
      setRecommendationUpdating(false);
    }
  };

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  // 삭제 확정 로직 분리
  const confirmDelete = async (): Promise<void> => {
    try {
      setDeleting(true);
      await deleteClinic(clinic.id);
      onUpdated();
    } finally {
      setDeleting(false);
    }
  };

  // categoryKeys를 한국어 라벨로 변환
  const categoryKeys = (clinic.categoryKeys ?? []) as CategoryKey[];
  const categoryLabels = categoryKeys.map((k) => CATEGORY_LABELS_KO[k] ?? k);

  return (
    <tr
      className={[
        "border-t transition-colors",
        flash ? "bg-black/5 dark:bg-white/5" : "hover:bg-muted/20",
      ].join(" ")}
    >
      <td className='px-2 py-2 align-middle'>
        <div className='flex flex-col items-center gap-1'>
          <Button
            type='button'
            size='icon'
            variant='ghost' // 테두리 제거
            aria-label='위로'
            title='위로'
            onClick={onMoveUp}
            disabled={isFirst || sortingDisabled}
            className='h-7 w-7'
          >
            <ChevronUp className='h-4 w-4' />
          </Button>

          <div className='flex h-7 w-7 items-center justify-center text-xs font-medium text-muted-foreground'>
            {index + 1}
          </div>

          <Button
            type='button'
            size='icon'
            variant='ghost' // 테두리 제거
            aria-label='아래로'
            title='아래로'
            onClick={onMoveDown}
            disabled={isLast || sortingDisabled}
            className='h-7 w-7'
          >
            <ChevronDown className='h-4 w-4' />
          </Button>
        </div>
      </td>

      {/* 업체명 */}
      <td className='px-4 py-3'>{clinic.name?.ko ?? "-"}</td>

      {/* 카테고리 */}
      <td className='px-4 py-3'>
        {categoryLabels.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {categoryLabels.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className='rounded border px-2 py-0.5 text-xs'
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          "-"
        )}
      </td>

      {/* 추천 토글 */}
      <td className='px-4 py-3 text-center'>
        <Switch
          checked={clinic.isRecommended === true}
          onCheckedChange={handleToggleRecommendation}
          disabled={recommendationUpdating}
          aria-label={
            clinic.isRecommended === true ? "추천 해제" : "추천으로 설정"
          }
        />
      </td>

      {/* 추천 토글 */}
      {/* <td className='px-4 py-3 text-center'>
        <div className='inline-flex items-center justify-center gap-2'>
          <Switch
            checked={clinic.isRecommended === true}
            onCheckedChange={handleToggleRecommendation}
            disabled={recommendationUpdating}
            aria-label={
              clinic.isRecommended === true ? "추천 해제" : "추천으로 설정"
            }
          />
          <span className='text-[12px] text-gray-500'>
            {clinic.isRecommended ? "추천" : "일반"}
          </span>
        </div>
      </td> */}

      {/* 노출 상태관리 */}
      <td className='px-4 py-3 text-center'>
        <div className='inline-flex items-center justify-center gap-2'>
          <Switch
            checked={clinic.status === "visible"}
            onCheckedChange={async (checked) => {
              const next = checked ? "visible" : "hidden";
              if (next === clinic.status) return;
              try {
                setUpdating(true);
                await updateClinicStatus(clinic.id, next);
                onUpdated();
              } catch (err) {
                console.error(err);
                toast.error("상태 변경에 실패했습니다.");
              } finally {
                setUpdating(false);
              }
            }}
            disabled={updating}
            aria-label='노출 상태 전환'
          />
          {/* <span className='text-[12px] text-gray-500'>
            {clinic.status === "visible" ? "노출" : "숨김"}
          </span> */}
        </div>
      </td>

      {/* 액션: 패키지, 더보기 */}
      <td className='px-4 py-3 text-right pr-4'>
        <div className='inline-flex items-center justify-end gap-2'>
          <ClinicRowActions
            onEdit={() => onEdit(clinic.id)}
            onDelete={handleDelete}
            onOpenPackages={() => onOpenPackages(clinic.id)}
          />
        </div>
      </td>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='업체를 삭제할까요?'
        description='삭제된 항목 탭에서 언제든 복구할 수 있습니다.'
        confirmText='삭제'
        cancelText='취소'
        confirmVariant='destructive'
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </tr>
  );
}
