"use client";

import React from "react";
import {
  deleteClinic,
  updateClinicRecommendation,
  updateClinicStatus,
} from "@/services/admin/clinics/clinics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClinicRowActions from "./ClinicRowActions";
import { ClinicWithId } from "@/types/clinic";
import { CATEGORY_LABELS_KO, type CategoryKey } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown } from "lucide-react";

type ClinicStatus = "visible" | "hidden";

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

  const handleChangeStatus = async (next: ClinicStatus) => {
    if (next === clinic.status) return;
    try {
      setUpdating(true);
      await updateClinicStatus(clinic.id, next);
      onUpdated();
    } finally {
      setUpdating(false);
    }
  };

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
    const ok = confirm(
      "삭제된 항목 탭에서 언제든 복구할 수 있습니다. 정말 삭제할까요?"
    );

    if (!ok) return;
    await deleteClinic(clinic.id);
    onUpdated();
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
      {/* No. */}
      <td className='px-4 py-3 text-center text-muted-foreground'>
        {index + 1}
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
      
      {/* 상태관리 */}
      <td className='px-4 py-3 text-center'>
        <Select
          value={clinic.status}
          onValueChange={(v) => handleChangeStatus(v as ClinicStatus)}
          disabled={updating}
        >
          <SelectTrigger className='h-8 w-[96px] px-2 text-xs'>
            <SelectValue placeholder='상태' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='visible'>노출</SelectItem>
            <SelectItem value='hidden'>숨김</SelectItem>
          </SelectContent>
        </Select>
      </td>

      {/* 이동 버튼 */}
      <td className='px-4 py-3 text-center'>
        <div className='inline-flex items-center gap-1'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={onMoveUp}
            disabled={isFirst || sortingDisabled}
            aria-label='위로'
            title='위로'
          >
            <ArrowUp className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={onMoveDown}
            disabled={isLast || sortingDisabled}
            aria-label='아래로'
            title='아래로'
          >
            <ArrowDown className='h-4 w-4' />
          </Button>
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
    </tr>
  );
}
