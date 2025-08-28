"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import {
  useForm,
  type SubmitHandler,
  useFieldArray,
  type FieldErrors,
  type Control,
  type Path,
  type UseFormSetValue,
  type UseFormWatch,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  createClinic,
  getClinicByIdAdmin,
  updateClinic,
} from "@/services/admin/clinics/clinics";
import type {
  ClinicDoc,
  ClinicWithId,
  Geo,
  ClinicCategory,
  DayOfWeek,
  DailyRange,
  AmenityKey,
} from "@/types/clinic";
import { clinicFormSchema, type ClinicFormValues } from "@/validations/clinic";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";

/** 요일 키 (UI 루프에 사용) */
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof DAY_KEYS)[number];

/** HH:mm 템플릿 타입 및 가드 */
type HHmm = `${number}${number}:${number}${number}`;
const isHHmm = (v: unknown): v is HHmm =>
  typeof v === "string" && /^\d{2}:\d{2}$/.test(v);

/** 카테고리 안전 변환 */
const CATEGORY_VALUES: readonly ClinicCategory[] = [
  "traditional",
  "cosmetic",
  "wellness",
] as const;
const asClinicCategory = (val: unknown): ClinicCategory | undefined =>
  CATEGORY_VALUES.includes(val as ClinicCategory)
    ? (val as ClinicCategory)
    : undefined;

/** 편의시설 키 집합 (프로젝트 타입과 일치하도록 정의) */
const AMENITY_VALUES: readonly AmenityKey[] = [
  "parking",
  "freeWifi",
  "infoDesk",
  "privateCare",
  "airportPickup",
] as const;
const asAmenityKeys = (arr: unknown): AmenityKey[] => {
  const xs = Array.isArray(arr) ? (arr as unknown[]) : [];
  return xs.filter((k): k is AmenityKey =>
    AMENITY_VALUES.includes(k as AmenityKey)
  );
};

/** 로케일 배열 베이스 경로 */
type LocalizedArrayBasePath =
  | "events"
  | "reservationNotices"
  | `doctors.${number}.lines`;

/** Zod 입력/출력 타입 */
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

  /** 입력 전처리: 빈 문자열 → undefined */
  const toUndef = (v: unknown) => {
    const s = typeof v === "string" ? v.trim() : v;
    return s === "" ? undefined : s;
  };

  /** RHF + Zod */
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

      // 다국어 배열 필드
      events: { ko: [], ja: [], zh: [], en: [] },
      reservationNotices: {
        ko: ["", "", ""],
        ja: ["", "", ""],
        zh: ["", "", ""],
        en: ["", "", ""],
      },

      // 파일/태그
      images: [],
      tagKeys: [],

      // 연락처/웹/SNS
      phone: "",
      website: "",
      socials: {},

      // 영업 정보
      weeklyHours: {}, // reset 시 normalize
      weeklyClosedDays: [],
      hoursNote: { ko: "", ja: "", zh: "", en: "" },

      // 편의시설
      amenities: [],

      // 기타
      isFavorite: false,
      rating: 0,
      reviewCount: 0,
      status: "visible",

      // 의료진
      doctors: [],
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset, watch, control } =
    form;

  type SocialsInput = NonNullable<ClinicFormInput["socials"]>;
  const socialsErrors = formState.errors.socials as
    | FieldErrors<SocialsInput>
    | undefined;

  /** amenities가 boolean map으로 저장된 과거 문서도 배열로 변환 */
  const normalizeAmenities = (raw: unknown): string[] => {
    if (Array.isArray(raw))
      return raw.filter((v): v is string => typeof v === "string");
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      return Object.keys(obj).filter((k) => obj[k] === true);
    }
    return [];
  };

  /** weeklyHours: 각 요일 최소 1구간 보장(입력칸 표시 목적, 저장 시엔 정제) */
  type DailyRangeInForm = { open?: string; close?: string };
  type WeeklyHoursInForm = Partial<Record<DayKey, DailyRangeInForm[]>>;
  const normalizeWeeklyHours = (raw: unknown): WeeklyHoursInForm => {
    const src = (raw ?? {}) as WeeklyHoursInForm;
    const out: WeeklyHoursInForm = {};
    DAY_KEYS.forEach((d) => {
      const list = Array.isArray(src[d]) ? (src[d] as DailyRangeInForm[]) : [];
      out[d] = list.length > 0 ? list : [{ open: "", close: "" }];
    });
    return out;
  };

  /** 로케일 문자열/배열 보정 */
  const ensureLocalizedStrings = (obj: unknown): Record<LocaleKey, string> => {
    const src = (obj ?? {}) as Record<string, string>;
    const out = {} as Record<LocaleKey, string>;
    LOCALES_TUPLE.forEach((loc) => {
      out[loc] = typeof src[loc] === "string" ? src[loc] : "";
    });
    return out;
  };
  const ensureLocalizedStringArrays = (
    obj: unknown,
    padTo?: number
  ): Record<LocaleKey, string[]> => {
    const src = (obj ?? {}) as Record<string, unknown>;
    const out: Record<LocaleKey, string[]> = {} as Record<LocaleKey, string[]>;
    LOCALES_TUPLE.forEach((loc) => {
      const arr = Array.isArray(src[loc]) ? (src[loc] as string[]) : [];
      out[loc] =
        typeof padTo === "number"
          ? arr.concat(Array(Math.max(0, padTo - arr.length)).fill(""))
          : arr;
    });
    return out;
  };

  /** 편집 모드 로드 + 정규화 후 reset */
  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!clinicId) {
        reset(); // 새로 만들기
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

        events: ensureLocalizedStringArrays(
          (data as { events?: unknown }).events
        ),
        reservationNotices: ensureLocalizedStringArrays(
          (data as { reservationNotices?: unknown }).reservationNotices,
          3
        ),

        images: data.images ?? [],
        tagKeys: data.tagKeys ?? [],

        phone: data.phone ?? "",
        website: data.website ?? "",
        socials: data.socials ?? {},

        weeklyHours: normalizeWeeklyHours(
          (data as { weeklyHours?: unknown }).weeklyHours
        ),
        weeklyClosedDays: data.weeklyClosedDays ?? [],

        hoursNote: (data.hoursNote as Record<string, string>) ?? {
          ko: "",
          ja: "",
          zh: "",
          en: "",
        },

        amenities: normalizeAmenities(data.amenities),

        isFavorite: data.isFavorite ?? false,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        status: data.status ?? "visible",

        doctors:
          (
            data as {
              doctors?: Array<{
                name?: Record<string, string>;
                photoUrl?: string;
                lines?: Record<string, string[]>;
              }>;
            }
          ).doctors?.map((d) => ({
            name: ensureLocalizedStrings(d.name),
            photoUrl: d.photoUrl ?? "",
            lines: ensureLocalizedStringArrays(d.lines),
          })) ?? [],
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

  /** 폼 weeklyHours → 문서 weeklyHours (DailyRange[]) */
  const toDocWeeklyHours = (
    src: ClinicFormValues["weeklyHours"]
  ): Partial<Record<DayOfWeek, DailyRange[]>> => {
    const out: Partial<Record<DayOfWeek, DailyRange[]>> = {};
    DAY_KEYS.forEach((d) => {
      const list = Array.isArray(src?.[d]) ? src![d]! : [];
      const cleaned: DailyRange[] = list
        .map((r) => {
          const o = isHHmm(r?.open) ? (r.open as HHmm) : undefined;
          const c = isHHmm(r?.close) ? (r.close as HHmm) : undefined;
          // DailyRange가 open/close 모두 필요한 타입이라고 가정 → 둘 다 있을 때만 포함
          if (o && c) return { open: o, close: c } as DailyRange;
          return undefined;
        })
        .filter((v): v is DailyRange => !!v);
      if (cleaned.length > 0) out[d as DayOfWeek] = cleaned;
    });
    return out;
  };

  /** 제출 */
  const onSubmit: SubmitHandler<ClinicFormValues> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const { geo, category, weeklyHours, amenities, ...rest } = values;

      // geo 정합성
      const geoClean: Geo | undefined =
        geo && typeof geo.lat === "number" && typeof geo.lng === "number"
          ? { lat: geo.lat, lng: geo.lng }
          : undefined;

      // weeklyHours 정합성 (DailyRange[])
      const weeklyHoursClean = toDocWeeklyHours(weeklyHours);

      // category 정합성 (ClinicCategory)
      const categoryClean = asClinicCategory(category);

      // amenities 정합성 (AmenityKey[])
      const amenitiesClean = asAmenityKeys(amenities);

      // 최종 payload
      const finalPayload: Omit<ClinicDoc, "createdAt" | "updatedAt"> = {
        ...rest,
        weeklyHours: weeklyHoursClean,
        amenities: amenitiesClean,
        ...(geoClean ? { geo: geoClean } : {}),
        ...(categoryClean ? { category: categoryClean } : {}),
      };

      if (mode === "create") {
        await createClinic(finalPayload);
        onCreated?.();
      } else if (clinicId) {
        await updateClinic(clinicId, finalPayload);
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
            <Input
              {...register("phone", { setValueAs: toUndef })}
              placeholder='전화 (예: 02-123-4567, +82 10 1234 5678)'
            />
            <Input
              {...register("website", { setValueAs: toUndef })}
              placeholder='https://example.com'
            />
            <div />
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

          <div className='px-5 pb-4 text-sm text-destructive'>
            {formState.errors.phone?.message ?? ""}
            {formState.errors.website?.message ?? ""}
            {socialsErrors?.instagram?.message ?? ""}
            {socialsErrors?.line?.message ?? ""}
            {socialsErrors?.whatsapp?.message ?? ""}
          </div>
        </SectionCard>

        {/* ===== 영업시간 & 휴무/안내문 ===== */}
        <SectionCard title='영업시간 & 휴무'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-4'>
            {DAY_KEYS.map((d) => {
              const openName =
                `weeklyHours.${d}.0.open` as Path<ClinicFormInput>;
              const closeName =
                `weeklyHours.${d}.0.close` as Path<ClinicFormInput>;

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
            {AMENITY_VALUES.map((k) => (
              <label key={k} className='inline-flex items-center gap-2 text-sm'>
                <input type='checkbox' {...register("amenities")} value={k} />
                <span>{k}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ===== 소개(비전/미션/설명) ===== */}
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

        {/* ===== 예약 시 주의사항(ko/ja/zh/en) ===== */}
        <SectionCard title='예약 시 주의사항'>
          <LocalizedRepeaterFieldMulti
            register={register}
            setValue={setValue}
            watch={watch}
            basePath={"reservationNotices"}
            locales={LOCALES_TUPLE}
            addLabel='추가'
            removeLabel='삭제'
            placeholders={{
              ko: "주의사항(한국어)",
              ja: "注意事項(日本語)",
              zh: "注意事项(中文)",
              en: "Notice (EN)",
            }}
          />
        </SectionCard>

        {/* ===== 예약 이벤트(ko/ja/zh/en) ===== */}
        <SectionCard title='예약 이벤트'>
          <LocalizedRepeaterFieldMulti
            register={register}
            setValue={setValue}
            watch={watch}
            basePath={"events"}
            locales={LOCALES_TUPLE}
            addLabel='이벤트 추가'
            removeLabel='삭제'
            placeholders={{
              ko: "예) 9월 신규 10% 할인",
              ja: "例) 9月新規10%OFF",
              zh: "例) 9月新顾客9折",
              en: "e.g., Sep New 10% OFF",
            }}
          />
        </SectionCard>

        {/* ===== 의료진 소개(ko/ja/zh/en) ===== */}
        <SectionCard title='의료진 소개'>
          <DoctorsField
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        </SectionCard>

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
                preset='clinics'
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
      </form>
    </FormSheet>
  );
}

/* ==================== 하위 컴포넌트 ==================== */

/** 다국어 배열 반복 입력(ko/ja/zh/en) — useFieldArray 없이 watch/setValue로 동기화 */
function LocalizedRepeaterFieldMulti(props: {
  register: UseFormRegister<ClinicFormInput>;
  setValue: UseFormSetValue<ClinicFormInput>;
  watch: UseFormWatch<ClinicFormInput>;
  basePath: LocalizedArrayBasePath; // "events" | "reservationNotices" | `doctors.${number}.lines`
  locales: readonly LocaleKey[];
  addLabel: string;
  removeLabel: string;
  placeholders: Record<LocaleKey, string>;
}) {
  const {
    register,
    setValue,
    watch,
    basePath,
    locales,
    addLabel,
    removeLabel,
    placeholders,
  } = props;

  // 각 로케일의 현재 배열
  const valuesByLoc = locales.reduce<Record<LocaleKey, string[]>>(
    (acc, loc) => {
      const v = watch(
        `${basePath}.${loc}` as Path<ClinicFormInput>
      ) as unknown as string[] | undefined;
      acc[loc] = Array.isArray(v) ? v : [];
      return acc;
    },
    {} as Record<LocaleKey, string[]>
  );

  const length = Math.max(0, ...locales.map((loc) => valuesByLoc[loc].length));

  const appendAll = () => {
    locales.forEach((loc) => {
      const next = [...valuesByLoc[loc], ""];
      setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
        shouldDirty: true,
      });
    });
  };

  const removeAll = (index: number) => {
    locales.forEach((loc) => {
      const cur = valuesByLoc[loc];
      if (index >= 0 && index < cur.length) {
        const next = [...cur.slice(0, index), ...cur.slice(index + 1)];
        setValue(`${basePath}.${loc}` as Path<ClinicFormInput>, next, {
          shouldDirty: true,
        });
      }
    });
  };

  return (
    <div className='space-y-3 px-5 py-4'>
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className='grid gap-3'
          style={{
            gridTemplateColumns: `repeat(${locales.length}, minmax(0, 1fr))`,
          }}
        >
          {locales.map((loc) => (
            <Input
              key={`${String(loc)}-${i}`}
              {...register(`${basePath}.${loc}.${i}` as Path<ClinicFormInput>)}
              defaultValue={valuesByLoc[loc][i] ?? ""}
              placeholder={placeholders[loc]}
            />
          ))}
          <div className='col-span-full flex justify-end'>
            <Button type='button' variant='ghost' onClick={() => removeAll(i)}>
              {removeLabel}
            </Button>
          </div>
        </div>
      ))}
      <Button type='button' variant='outline' onClick={appendAll}>
        {addLabel}
      </Button>
    </div>
  );
}

/** 의료진 카드 반복(이름/경력 모두 ko/ja/zh/en) */
function DoctorsField({
  control,
  register,
  setValue,
  watch,
}: {
  control: Control<ClinicFormInput>;
  register: UseFormRegister<ClinicFormInput>;
  setValue: UseFormSetValue<ClinicFormInput>;
  watch: UseFormWatch<ClinicFormInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "doctors",
  });

  const placeholdersByLoc: Record<LocaleKey, { name: string; line: string }> = {
    ko: { name: "이름(한국어)", line: "경력/소개(한국어)" },
    ja: { name: "氏名(日本語)", line: "経歴/紹介(日本語)" },
    zh: { name: "姓名(中文)", line: "履历/介绍(中文)" },
    en: { name: "Name (EN)", line: "Career/Intro (EN)" },
  };

  const addOne = () =>
    append({
      name: Object.fromEntries(LOCALES_TUPLE.map((l) => [l, ""])) as Record<
        LocaleKey,
        string
      >,
      photoUrl: "",
      lines: Object.fromEntries(LOCALES_TUPLE.map((l) => [l, [""]])) as Record<
        LocaleKey,
        string[]
      >,
    });

  return (
    <div className='space-y-4 px-5 py-4'>
      {fields.map((f, i) => (
        <div key={f.id} className='rounded-md border p-4 space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input
              {...register(`doctors.${i}.photoUrl` as Path<ClinicFormInput>)}
              placeholder='사진 URL (https://...)'
            />
            <div />
          </div>

          {/* 이름: 로케일 전부 렌더 */}
          <div
            className='grid gap-3'
            style={{
              gridTemplateColumns: `repeat(${LOCALES_TUPLE.length}, minmax(0, 1fr))`,
            }}
          >
            {LOCALES_TUPLE.map((loc) => (
              <Input
                key={`name-${String(loc)}`}
                {...register(
                  `doctors.${i}.name.${loc}` as Path<ClinicFormInput>
                )}
                placeholder={placeholdersByLoc[loc].name}
              />
            ))}
          </div>

          {/* 경력/소개: 로케일별 반복 입력 */}
          <LocalizedRepeaterFieldMulti
            register={register}
            setValue={setValue}
            watch={watch}
            basePath={`doctors.${i}.lines`}
            locales={LOCALES_TUPLE}
            addLabel='경력/소개 추가'
            removeLabel='삭제'
            placeholders={
              Object.fromEntries(
                LOCALES_TUPLE.map((loc) => [loc, placeholdersByLoc[loc].line])
              ) as Record<LocaleKey, string>
            }
          />

          <div className='flex justify-end'>
            <Button type='button' variant='ghost' onClick={() => remove(i)}>
              의료진 제거
            </Button>
          </div>
        </div>
      ))}
      <Button type='button' variant='outline' onClick={addOne}>
        의료진 추가
      </Button>
    </div>
  );
}
