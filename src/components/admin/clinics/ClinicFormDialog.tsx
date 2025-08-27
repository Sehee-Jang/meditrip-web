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
import type { ClinicDoc, ClinicWithId, Geo } from "@/types/clinic";
import { clinicFormSchema, type ClinicFormValues } from "@/validations/clinic";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import { Input } from "@/components/ui/input";
import { LOCALES_TUPLE } from "@/constants/locales";

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof DAY_KEYS)[number];
type OpenPath = `weeklyHours.${DayKey}.0.open`;
type ClosePath = `weeklyHours.${DayKey}.0.close`;

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

  // 입력 전처리 유틸
  const toUndef = (v: unknown) => {
    const s = typeof v === "string" ? v.trim() : v;
    return s === "" ? undefined : s;
  };

  // RHF + Zod: ko/ja 필수, zh/en은 빈 문자열 기본
  const form = useForm<ClinicFormInput, unknown, ClinicFormOutput>({
    resolver: zodResolver<ClinicFormInput, unknown, ClinicFormOutput>(
      clinicFormSchema
    ),
    defaultValues: {
      name: { ko: "", ja: "", zh: "", en: "" },
      address: { ko: "", ja: "", zh: "", en: "" },
      geo: undefined,
      intro: {
        title: { ko: "", ja: "", zh: "", en: "" },
        subtitle: { ko: "", ja: "", zh: "", en: "" },
      },
      category: undefined,
      vision: { ko: "", ja: "", zh: "", en: "" },
      mission: { ko: "", ja: "", zh: "", en: "" },
      description: { ko: "", ja: "", zh: "", en: "" },
      events: { ko: [], ja: [] },
      images: [],
      tagKeys: [],
      phone: "",
      website: "",
      socials: {},
      weeklyHours: {},
      weeklyClosedDays: [],
      hoursNote: { ko: "", ja: "", zh: "", en: "" },
      amenities: [],
      isFavorite: false,
      rating: 0,
      reviewCount: 0,
      status: "visible",
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset, watch } = form;

  // 편집 모드 로드
  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!clinicId) {
        reset();
        return;
      }
      const data: ClinicWithId | null = await getClinicByIdAdmin(clinicId);
      if (!data) return;

      reset({
        name: (data.name as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        address: (data.address as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        geo: data.geo,
        intro: {
          title: (data.intro?.title as Record<string, string>) ?? {
            ko: "",
            ja: "",
            zh: "",
            en: "",
          },
          subtitle: (data.intro?.subtitle as Record<string, string>) ?? {
            ko: "",
            ja: "",
            zh: "",
            en: "",
          },
        },
        category: data.category,
        vision: (data.vision as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        mission: (data.mission as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        description: (data.description as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        events: data.events ?? { ko: [], ja: [] },
        images: data.images ?? [],
        tagKeys: data.tagKeys ?? [],
        phone: data.phone ?? "",
        website: data.website ?? "",
        socials: data.socials ?? {},
        weeklyHours: data.weeklyHours ?? {},
        weeklyClosedDays: data.weeklyClosedDays ?? [],
        hoursNote: (data.hoursNote as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },
        amenities: data.amenities ?? [],
        isFavorite: data.isFavorite ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        status: data.status ?? "visible",
      });
    };
    if (open) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clinicId]);

  /** 첫 invalid 필드로 포커스/스크롤 */
  const focusFirstInvalid = (): void => {
    const el = formElRef.current;
    if (!el) return;
    const invalid = el.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  /** 제출: category/geo의 undefined 제거(옵션 B) */
  const onSubmit: SubmitHandler<ClinicFormValues> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const { geo, category, ...rest } = values;

      // geo: lat/lng 모두 number일 때만 포함
      const geoClean: Geo | undefined =
        geo && typeof geo.lat === "number" && typeof geo.lng === "number"
          ? { lat: geo.lat, lng: geo.lng }
          : undefined;

      const base: Omit<ClinicDoc, "createdAt" | "updatedAt"> = {
        ...rest,
        ...(geoClean ? { geo: geoClean } : {}),
      };

      // category가 undefined면 키 제거
      const payload =
        typeof category === "string" ? { ...base, category } : base;

      if (mode === "create") {
        await createClinic(payload);
        onCreated?.();
      } else if (clinicId) {
        await updateClinic(clinicId, payload);
        onUpdated?.();
      }
      onOpenChange(false);
    } catch (e) {
      console.error("create/update clinic failed:", e);
      alert(
        e instanceof Error
          ? `등록 실패: ${e.message}`
          : "등록 실패(알 수 없는 오류)"
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const onInvalid = (): void => {
    requestAnimationFrame(focusFirstInvalid);
  };

  const images = watch("images") ?? [];

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
        {/* ===== 기본 정보 ===== */}
        <SectionCard title='기본 정보'>
          <FormRow
            label='병원명'
            control={
              <LocalizedTabsField
                register={register}
                basePath='name'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='병원명을 입력하세요.'
                mode='input'
              />
            }
          />

          {/* 주소 입력란 */}
          <FormRow
            label='주소'
            control={
              <LocalizedTabsField
                register={register}
                basePath='address'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='주소를 입력하세요.'
                mode='input'
              />
            }
          />

          {/* 소개 제목/부제 */}
          <FormRow
            label='소개 제목(선택)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='intro.title'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='소개 제목을 입력하세요.'
                mode='input'
              />
            }
          />
          <FormRow
            label='소개 부제(선택)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='intro.subtitle'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='소개 부제를 입력하세요.'
                mode='input'
              />
            }
          />

          {/* 카테고리 */}
          <FormRow
            label='카테고리(선택)'
            control={
              <select
                {...register("category")}
                className='h-9 rounded border px-2 text-sm'
                aria-invalid={!!formState.errors.category}
              >
                <option value=''>선택 안 함</option>
                <option value='traditional'>한방/통합의학</option>
                <option value='cosmetic'>미용/성형</option>
                <option value='wellness'>웰니스</option>
              </select>
            }
          />
        </SectionCard>

        {/* ===== 연락처 & 웹·SNS ===== */}
        <SectionCard title='연락처 & 웹·SNS'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-4'>
            {/* 전화번호: 하이픈 없어도 저장 가능 */}
            <Input
              {...register("phone", { setValueAs: toUndef })}
              placeholder='전화 (예: 02-123-4567, +82 10 1234 5678)'
            />
            {/* 웹사이트: 빈칸 허용 */}
            <Input
              {...register("website", { setValueAs: toUndef })}
              placeholder='https://example.com'
            />
            <div />
            {/* 소셜: 아이디만 */}
            <Input
              {...register("socials.instagram", { setValueAs: toUndef })}
              placeholder='인스타 아이디 (예: onyu.health)'
            />
            <Input
              {...register("socials.line", { setValueAs: toUndef })}
              placeholder='LINE 아이디 (예: @onyu 또는 onyu)'
            />
            <Input
              {...register("socials.whatsapp", { setValueAs: toUndef })}
              placeholder='WhatsApp 아이디'
            />
          </div>

          {/* 에러 표시(옵션) */}
          <div className='px-5 pb-4 text-sm text-destructive'>
            {(formState.errors.phone?.message as string) ?? ""}
            {(formState.errors.website?.message as string) ?? ""}
            {(formState.errors.socials as any)?.instagram?.message ?? ""}
            {(formState.errors.socials as any)?.line?.message ?? ""}
            {(formState.errors.socials as any)?.whatsapp?.message ?? ""}
          </div>
        </SectionCard>

        {/* ===== 영업시간 & 휴무/안내문 ===== */}
        <SectionCard title='영업시간 & 휴무'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-4'>
            {DAY_KEYS.map((d) => {
              const openName = `weeklyHours.${d}.0.open` as OpenPath;
              const closeName = `weeklyHours.${d}.0.close` as ClosePath;

              return (
                <div key={d} className='space-y-2'>
                  <div className='text-xs text-muted-foreground uppercase'>
                    {d}
                  </div>
                  <div className='flex gap-2'>
                    <Input
                      {...register(openName, { setValueAs: toUndef })}
                      placeholder='09:00'
                    />
                    <Input
                      {...register(closeName, { setValueAs: toUndef })}
                      placeholder='18:00'
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <FormRow
            label='정기 휴무 요일'
            control={
              <div className='flex flex-wrap gap-3 px-5 py-2'>
                {(
                  ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
                ).map((d) => (
                  <label key={d} className='inline-flex items-center gap-2'>
                    <input
                      type='checkbox'
                      value={d}
                      {...register("weeklyClosedDays")}
                    />
                    <span className='uppercase text-sm'>{d}</span>
                  </label>
                ))}
              </div>
            }
          />

          <FormRow
            label='휴무/영업 안내문(선택)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='hoursNote'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='예) 매주 일요일 휴무'
                mode='input'
              />
            }
          />
        </SectionCard>

        {/* ===== 편의시설 ===== */}
        <SectionCard title='편의시설'>
          <div className='px-5 py-4 grid grid-cols-2 md:grid-cols-5 gap-3'>
            {(
              [
                "parking",
                "freeWifi",
                "infoDesk",
                "privateCare",
                "airportPickup",
              ] as const
            ).map((k) => (
              <label key={k} className='inline-flex items-center gap-2 text-sm'>
                <input type='checkbox' {...register("amenities")} value={k} />
                <span>{k}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ===== 병원 소개(비전/미션/설명) ===== */}
        <SectionCard title='소개'>
          <FormRow
            label='비전(Vision)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='vision'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='병원의 비전을 입력하세요.'
                mode='input'
              />
            }
          />
          <FormRow
            label='미션(Mission)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='mission'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='병원의 미션을 입력하세요.'
                mode='input'
              />
            }
          />
          <FormRow
            label='설명(Description)'
            control={
              <LocalizedTabsField
                register={register}
                basePath='description'
                locales={LOCALES_TUPLE}
                errors={formState.errors}
                placeholder='병원 소개/설명을 입력하세요.'
                mode='textarea'
              />
            }
          />
        </SectionCard>

        {/* ===== 의료진 소개 ===== */}

        {/* ===== 이미지 ===== */}
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
                preset='clinics' // hospitals/clinics 경로 프리셋
              />
            }
          />
        </SectionCard>

        {/* ===== 좌표/주소(선택) ===== */}
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
                {...register("geo.lat", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
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
                {...register("geo.lng", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
                placeholder='예) 126.9780'
              />
            </div>
          </div>
        </SectionCard>

        {/* 예약시 주의사항 */}
      </form>
    </FormSheet>
  );
}
