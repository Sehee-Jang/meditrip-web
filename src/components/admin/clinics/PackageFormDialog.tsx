"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import {
  useForm,
  useFieldArray,
  type SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createPackage, updatePackage } from "@/services/admin/clinics/clinics";
import type { PackageDoc, PackageWithId } from "@/types/clinic";
import { packageFormSchema } from "@/validations/clinic";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import SingleImageUploader from "@/components/admin/common/SingleImageUploader";
import { Button } from "@/components/ui/button";
import { LOCALES_TUPLE } from "@/constants/locales";

type PackageFormInput = z.input<typeof packageFormSchema>;
type PackageFormOutput = z.output<typeof packageFormSchema>;

export interface PackageFormDialogProps {
  clinicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg?: PackageWithId;
  onSaved?: (packageId: string) => void;
}

export default function PackageFormDialog({
  clinicId,
  open,
  onOpenChange,
  pkg,
  onSaved,
}: PackageFormDialogProps) {
  const mode: "create" | "edit" = pkg ? "edit" : "create";
  const formId = "package-form";
  const submittingRef = useRef<boolean>(false);
  const formElRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<PackageFormInput, unknown, PackageFormOutput>({
    resolver: zodResolver<PackageFormInput, unknown, PackageFormOutput>(
      packageFormSchema
    ),
    defaultValues: pkg
      ? {
          title: pkg.title,
          subtitle: pkg.subtitle,
          price: pkg.price,
          duration: pkg.duration,
          packageImages: pkg.packageImages ?? [],
          treatmentProcess: pkg.treatmentProcess ?? [],
          treatmentDetails: pkg.treatmentDetails ?? [],
          precautions: pkg.precautions,
        }
      : {
          title: { ko: "", ja: "" },
          subtitle: { ko: "", ja: "" },
          price: { ko: 0, ja: 0 },
          duration: { ko: 0, ja: 0 },
          packageImages: [],
          treatmentProcess: [],
          treatmentDetails: [],
          precautions: undefined,
        },
    mode: "onChange",
    shouldFocusError: false,
  });

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    formState,
    reset,
    clearErrors,
  } = form;

const {
  fields: processFields,
  append: appendProcess,
  remove: removeProcess,
  move: moveProcess,
} = useFieldArray({
  control,
  name: "treatmentProcess",
});

const {
  fields: detailFields,
  append: appendDetail,
  remove: removeDetail,
  move: moveDetail,
} = useFieldArray({
  control,
  name: "treatmentDetails",
});

  useEffect(() => {
    reset(
      pkg
        ? {
            title: pkg.title,
            subtitle: pkg.subtitle,
            price: pkg.price,
            duration: pkg.duration,
            packageImages: pkg.packageImages ?? [],
            treatmentProcess: pkg.treatmentProcess ?? [],
            treatmentDetails: pkg.treatmentDetails ?? [],
            precautions: pkg.precautions,
          }
        : {
            title: { ko: "", ja: "" },
            subtitle: { ko: "", ja: "" },
            price: { ko: 0, ja: 0 },
            duration: { ko: 0, ja: 0 },
            packageImages: [],
            treatmentProcess: [],
            treatmentDetails: [],
            precautions: undefined,
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pkg?.id]);

  const focusFirstInvalid = (): void => {
    const formEl = formElRef.current;
    if (!formEl) return;
    const invalid = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const onSubmit: SubmitHandler<PackageFormOutput> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      if (mode === "create") {
        const newId = await createPackage(
          clinicId,
          values as Omit<PackageDoc, "createdAt" | "updatedAt">
        );
        onSaved?.(newId);
      } else if (pkg) {
        await updatePackage(
          clinicId,
          pkg.id,
          values as Partial<Omit<PackageDoc, "createdAt" | "updatedAt">>
        );
        onSaved?.(pkg.id);
      }
      onOpenChange(false);
    } finally {
      submittingRef.current = false;
    }
  };

  // 에러 발생 시: ja에 오류가 있으면 탭 전환 + 첫 오류로 스크롤/포커스
  const onInvalid: Parameters<typeof handleSubmit>[1] = (errs) => {
    if (errs?.packageImages) {
      document
        .getElementById("pkg-images")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    requestAnimationFrame(focusFirstInvalid);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "패키지 등록" : "패키지 수정"}
      description='필수 정보만 간결하게 입력하세요.'
      formId={formId}
      submitLabel={
        mode === "create"
          ? submittingRef.current
            ? "등록 중…"
            : "등록"
          : submittingRef.current
          ? "수정 중…"
          : "수정"
      }
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
            label='제목'
            control={
              <LocalizedTabsField
                register={register}
                basePath='title'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='패키지 제목'
              />
            }
          />
          <FormRow
            label='부제(선택)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='subtitle'
                locales={LOCALES_TUPLE}
                placeholder='부제'
                errors={formState.errors}
              />
            }
          />
          <FormRow
            label='가격(숫자)'
            helpText='단위(원/円)는 사용자 페이지에서 자동 표기'
            control={
              <LocalizedTabsField
                register={register}
                basePath='price'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='예) 10000'
                mode='number'
              />
            }
          />
          <FormRow
            label='소요시간(분)'
            helpText='단위(분/分)는 사용자 페이지에서 자동 표기'
            control={
              <LocalizedTabsField
                register={register}
                basePath='duration'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='예) 60'
                mode='number'
              />
            }
          />
        </SectionCard>

        {/* 이미지 */}
        <SectionCard title='이미지' description='여러 장 업로드 가능'>
          <FormRow
            label='패키지 이미지'
            control={
              <div id='pkg-images' className='space-y-2'>
                <Controller
                  name='packageImages'
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <ImagesUploader
                        value={field.value ?? []}
                        onChange={(urls: string[]) => {
                          field.onChange(urls); // RHF에 값 반영
                          if (urls.length > 0) clearErrors("packageImages"); // 에러 즉시 해제
                        }}
                        preset='packages'
                      />
                      {fieldState.error && (
                        <p className='text-xs text-red-600'>
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            }
          />
        </SectionCard>

        {/* 진행 단계 */}
        <SectionCard
          title='진행 단계'
          description='사용자 페이지 진행순서 영역에 Step 01, Step 02 등으로 노출됩니다.'
        >
          <div className='px-5 py-4'>
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  appendProcess({
                    title: { ko: "", ja: "" },
                  })
                }
              >
                단계 추가
              </Button>
            </div>

            <div className='mt-3 space-y-4'>
              {processFields.map((f, i) => (
                <div key={f.id} className='rounded-xl border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='text-[12px] font-semibold text-muted-foreground'>
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() => i > 0 && moveProcess(i, i - 1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() =>
                          i < processFields.length - 1 && moveProcess(i, i + 1)
                        }
                      >
                        ↓
                      </Button>
                      <Button
                        type='button'
                        variant='destructive'
                        onClick={() => removeProcess(i)}
                      >
                        제거
                      </Button>
                    </div>
                  </div>

                  <FormRow
                    label='제목'
                    control={
                      <LocalizedTabsField
                        register={register}
                        basePath={`treatmentProcess.${i}.title`}
                        locales={LOCALES_TUPLE}
                        placeholder='진행 단계 제목'
                        errors={formState.errors}
                      />
                    }
                  />
                </div>
              ))}
              {processFields.length === 0 && (
                <div className='rounded-lg border border-dashed p-6 text-center text-[12px] text-muted-foreground'>
                  아직 단계가 없습니다. ‘단계 추가’를 눌러 시작하세요.
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 상세 단계 */}
        <SectionCard
          title='진료 상세 단계'
          description='각 단계의 제목/설명/이미지(선택)를 입력하세요.'
        >
          <div className='px-5 py-4'>
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() =>
                  appendDetail({
                    title: { ko: "", ja: "" },
                    description: { ko: "", ja: "" },
                    imageUrl: undefined,
                  })
                }
              >
                단계 추가
              </Button>
            </div>

            <div className='mt-3 space-y-4'>
              {detailFields.map((f, i) => (
                <div key={f.id} className='rounded-xl border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='text-[12px] font-semibold text-muted-foreground'>
                      Step {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() => i > 0 && moveDetail(i, i - 1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type='button'
                        variant='secondary'
                        onClick={() => i < detailFields.length - 1 && moveDetail(i, i + 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        type='button'
                        variant='destructive'
                        onClick={() => removeDetail(i)}
                      >
                        제거
                      </Button>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <FormRow
                      label='제목'
                      control={
                        <LocalizedTabsField
                          register={register}
                          basePath={`treatmentDetails.${i}.title`}
                          locales={LOCALES_TUPLE}
                          placeholder='단계 제목'
                          errors={formState.errors}
                        />
                      }
                    />

                    <FormRow
                      label='설명'
                      control={
                        <LocalizedTabsField
                          register={register}
                          basePath={`treatmentDetails.${i}.description`}
                          locales={LOCALES_TUPLE}
                          placeholder='상세 설명'
                          mode='textarea'
                          rows={3}
                          errors={formState.errors}
                        />
                      }
                    />

                    <FormRow
                      label='이미지(선택)'
                      control={
                        <SingleImageUploader
                          value={
                            watch(`treatmentDetails.${i}.imageUrl`) as
                              | string
                              | undefined
                          }
                          onChange={(url?: string) =>
                            setValue(`treatmentDetails.${i}.imageUrl`, url, {
                              shouldDirty: true,
                            })
                          }
                          preset='packages'
                        />
                      }
                    />
                  </div>
                </div>
              ))}
              {detailFields.length === 0 && (
                <div className='rounded-lg border border-dashed p-6 text-center text-[12px] text-muted-foreground'>
                  아직 단계가 없습니다. ‘단계 추가’를 눌러 시작하세요.
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 주의사항 */}
        <SectionCard title='주의사항'>
          <FormRow
            label='주의사항'
            control={
              <LocalizedTabsField
                register={register}
                basePath='precautions'
                locales={LOCALES_TUPLE}
                placeholder='시술 전/후 주의사항'
                mode='textarea'
                rows={3}
                errors={formState.errors}
              />
            }
          />
        </SectionCard>
      </form>
    </FormSheet>
  );
}
