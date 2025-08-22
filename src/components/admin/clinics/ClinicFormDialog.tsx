"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  createClinic,
  getClinicByIdAdmin,
  updateClinic,
} from "@/services/admin/clinics/clinics";
import type { ClinicDoc, ClinicWithId } from "@/types/clinic";
import { clinicFormSchema, type ClinicFormValues } from "@/validations/clinic";

import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import { Input } from "@/components/ui/input";

type ClinicFormInput = z.input<typeof clinicFormSchema>;
type ClinicFormOutput = z.output<typeof clinicFormSchema>;

export interface ClinicFormDialogProps {
  clinicId?: string; // 없으면 생성
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  onUpdated?: () => void;
}

export default function ClinicFormDialog({
  clinicId,
  open,
  onOpenChange,
  onCreated,
  onUpdated,
}: ClinicFormDialogProps) {
  const mode: "create" | "edit" = clinicId ? "edit" : "create";
  const formId = "clinic-form";
  const submittingRef = useRef<boolean>(false);
  const formElRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<ClinicFormInput, unknown, ClinicFormOutput>({
    resolver: zodResolver<ClinicFormInput, unknown, ClinicFormOutput>(
      clinicFormSchema
    ),
    defaultValues: {
      name: { ko: "", ja: "" },
      address: { ko: "", ja: "" },
      geo: undefined,
      intro: { title: { ko: "", ja: "" }, subtitle: { ko: "", ja: "" } },
      category: undefined,
      vision: { ko: "", ja: "" },
      mission: { ko: "", ja: "" },
      description: { ko: "", ja: "" },
      events: { ko: [], ja: [] },
      images: [],
      isFavorite: false,
      rating: 0,
      reviewCount: 0,
      status: "visible",
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset } = form;

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!clinicId) {
        reset();
        return;
      }
      const data: ClinicWithId | null = await getClinicByIdAdmin(clinicId);
      if (!data) return;
      reset({
        name: data.name,
        address: data.address,
        geo: data.geo,
        intro: data.intro,
        category: data.category,
        vision: data.vision,
        mission: data.mission,
        description: data.description,
        events: data.events ?? { ko: [], ja: [] },
        images: data.images ?? [],
        isFavorite: data.isFavorite ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        status: data.status ?? "visible",
      });
    };
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clinicId]);

  /** 첫 invalid 필드로 스크롤/포커스 */
  const focusFirstInvalid = (): void => {
    const formEl = formElRef.current;
    if (!formEl) return;
    const invalid = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const onSubmit: SubmitHandler<ClinicFormValues> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      if (mode === "create") {
        await createClinic(
          values as Omit<ClinicDoc, "createdAt" | "updatedAt">
        );
        onCreated?.();
      } else if (clinicId) {
        await updateClinic(
          clinicId,
          values as Partial<Omit<ClinicDoc, "createdAt" | "updatedAt">>
        );
        onUpdated?.();
      }
      onOpenChange(false);
    } finally {
      submittingRef.current = false;
    }
  };

  // 에러 발생 시: ja 에러가 있으면 탭 전환 + 첫 오류로 스크롤/포커스
  const onInvalid = (): void => {
    requestAnimationFrame(focusFirstInvalid);
  };

  const images = form.watch("images") ?? [];

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "병원 등록" : "병원 수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      submitLabel={mode === "create" ? "등록" : "수정"}
      widthClassName='sm:max-w-[860px]'
    >
      <form
        id={formId}
        ref={formElRef}
        className='space-y-6'
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        {/* 기본 정보 */}
        <SectionCard title='기본 정보'>
          <FormRow
            label='병원명'
            control={
              <LocalizedTabsField
                register={register}
                pathKo='name.ko'
                pathJa='name.ja'
                placeholder='병원명'
                errorKo={formState.errors.name?.ko?.message}
                errorJa={formState.errors.name?.ja?.message}
              />
            }
          />
          <FormRow
            label='주소'
            control={
              <LocalizedTabsField
                register={register}
                pathKo='address.ko'
                pathJa='address.ja'
                placeholder='주소'
                errorKo={formState.errors.address?.ko?.message}
                errorJa={formState.errors.address?.ja?.message}
              />
            }
          />
          <FormRow
            label='소개 부제(선택)'
            control={
              <LocalizedTabsField
                register={register}
                pathKo='intro.subtitle.ko'
                pathJa='intro.subtitle.ja'
                placeholder='소개 부제'
                errorKo={formState.errors.intro?.subtitle?.ko?.message}
                errorJa={formState.errors.intro?.subtitle?.ja?.message}
              />
            }
          />
        </SectionCard>

        {/* 이미지 */}
        <SectionCard
          title='이미지'
          description='대표 이미지 등을 업로드하세요.'
        >
          <FormRow
            label='이미지'
            control={
              <ImagesUploader
                value={images}
                onChange={(urls: string[]) =>
                  setValue("images", urls, { shouldDirty: true })
                }
                dir={`clinics`}
              />
            }
          />
        </SectionCard>

        {/* 좌표/주소 고급(선택) */}
        <SectionCard
          title='좌표/주소(선택)'
          description='위도와 경도를 추가하면 지도에 정확한 위치를 표시할 수 있습니다.'
        >
          <div className='grid grid-cols-2 gap-3 px-5 py-4'>
            <div>
              <label className='mb-1 block text-xs text-muted-foreground'>
                위도
              </label>
              <Input
                type='number'
                step='any'
                {...register("geo.lat", { valueAsNumber: true })}
                placeholder='예) 37.5665'
              />
            </div>
            <div>
              <label className='mb-1 block text-xs text-muted-foreground'>
                경도
              </label>
              <Input
                type='number'
                step='any'
                {...register("geo.lng", { valueAsNumber: true })}
                placeholder='예) 126.9780'
              />
            </div>
          </div>
        </SectionCard>
      </form>
    </FormSheet>
  );
}
