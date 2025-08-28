"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import {
  FormProvider as RHFProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
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
import ContactsAndSocials from "./fields/ContactsAndSocials";
import WeeklyHoursGrid from "./fields/WeeklyHoursGrid";
import ClosedDaysChecklist from "./fields/ClosedDaysChecklist";
import AmenitiesChecklist from "./fields/AmenitiesChecklist";
import LocalizedRepeaterFieldMulti from "./fields/LocalizedRepeaterFieldMulti";
import DoctorsField from "./fields/DoctorsField";
import {
  normalizeWeeklyHours,
  ensureLocalizedStrings,
  ensureLocalizedStringArrays,
  normalizeAmenities,
  toDocWeeklyHours,
  asClinicCategory,
  asAmenityKeys,
} from "./form-utils";
import CleanFormLayout from "@/components/admin/common/CleanFormLayout";

/* ====== 타입 별칭 ====== */
type ClinicFormInputZod = z.input<typeof clinicFormSchema>;
type ClinicFormOutputZod = z.output<typeof clinicFormSchema>;

export interface ClinicFormDialogProps {
  clinicId?: string;
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

  const form = useForm<ClinicFormInputZod, unknown, ClinicFormOutputZod>({
    resolver: zodResolver<ClinicFormInputZod, unknown, ClinicFormOutputZod>(
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
      events: { ko: [""], ja: [""], zh: [""], en: [""] },
      reservationNotices: { ko: [""], ja: [""], zh: [""], en: [""] },
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
      doctors: [],
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset, watch } = form;

  // 데이터 로딩
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

  const focusFirstInvalid = (): void => {
    const el = formElRef.current;
    if (!el) return;
    const invalid = el.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: true });
      invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const onSubmit: SubmitHandler<ClinicFormValues> = async (values) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const { geo, category, weeklyHours, amenities, ...rest } = values;

      const geoClean: Geo | undefined =
        geo && typeof geo.lat === "number" && typeof geo.lng === "number"
          ? { lat: geo.lat, lng: geo.lng }
          : undefined;

      const weeklyHoursClean = toDocWeeklyHours(weeklyHours);
      const categoryClean = asClinicCategory(category);
      const amenitiesClean = asAmenityKeys(amenities);

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

  const sections = [
    { id: "sec-basic", label: "기본 정보" },
    { id: "sec-contacts", label: "연락처·웹/SNS" },
    { id: "sec-hours", label: "영업시간·휴무" },
    { id: "sec-about", label: "소개" },
    { id: "sec-amenities", label: "편의시설" },
    { id: "sec-notices", label: "주의사항" },
    { id: "sec-events", label: "이벤트" },
    { id: "sec-doctors", label: "의료진 소개" },
    { id: "sec-media", label: "이미지" },
    { id: "sec-geo", label: "좌표/주소" },
  ] as const;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "병원 등록" : "병원 수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      // 제출 버튼은 CleanFormLayout 하단 고정바에서 노출하므로 여기선 라벨은 사용 안 함
      submitLabel={mode === "create" ? "등록" : "수정"}
      widthClassName='sm:max-w-[980px]' // 살짝 넓게
    >
      <RHFProvider {...form}>
        <form
          id={formId}
          ref={formElRef}
          onSubmit={handleSubmit(onSubmit, onInvalid)}
        >
          <CleanFormLayout sections={sections}>
            {/* ===== 기본 정보 ===== */}
            <section
              id='sec-basic'
              data-section='sec-basic'
              className='scroll-mt-24'
            >
              {" "}
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
            </section>

            {/* ===== 연락처 & 웹·SNS ===== */}
            <section
              id='sec-contacts'
              data-section='sec-contacts'
              className='scroll-mt-24'
            >
              {" "}
              <SectionCard title='연락처 & 웹·SNS'>
                <ContactsAndSocials />
              </SectionCard>
            </section>

            {/* ===== 영업시간 & 휴무/안내문 ===== */}
            <section
              id='sec-hours'
              data-section='sec-hours'
              className='scroll-mt-24'
            >
              <SectionCard title='영업시간 & 휴무'>
                <WeeklyHoursGrid />
                <FormRow
                  label='정기 휴무 요일'
                  control={<ClosedDaysChecklist />}
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
            </section>

            {/* ===== 병원 소개(비전/미션/설명) ===== */}
            <section
              id='sec-about'
              data-section='sec-about'
              className='scroll-mt-24'
            >
              <SectionCard title='소개'>
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
              </SectionCard>
            </section>

            {/* ===== 편의시설 ===== */}
            <section
              id='sec-amenities'
              data-section='sec-amenities'
              className='scroll-mt-24'
            >
              <SectionCard title='편의시설'>
                <AmenitiesChecklist />
              </SectionCard>
            </section>

            {/* ===== 예약 시 주의사항===== */}
            <section
              id='sec-notices'
              data-section='sec-notices'
              className='scroll-mt-24'
            >
              <SectionCard title='예약 시 주의사항'>
                <LocalizedRepeaterFieldMulti
                  basePath='reservationNotices'
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
            </section>

            {/* ===== 예약 이벤트 ===== */}
            <section
              id='sec-events'
              data-section='sec-events'
              className='scroll-mt-24'
            >
              <SectionCard title='예약 이벤트'>
                <LocalizedRepeaterFieldMulti
                  basePath='events'
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
            </section>

            {/* ===== 의료진 소개 ===== */}
            <section
              id='sec-doctors'
              data-section='sec-doctors'
              className='scroll-mt-24'
            >
              <SectionCard title='의료진 소개'>
                <DoctorsField />
              </SectionCard>
            </section>

            {/* ===== 이미지 ===== */}
            <section
              id='sec-media'
              data-section='sec-media'
              className='scroll-mt-24'
            >
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
            </section>

            {/* ===== 좌표/주소(선택) ===== */}
            <section
              id='sec-geo'
              data-section='sec-geo'
              className='scroll-mt-24'
            >
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
            </section>
          </CleanFormLayout>
        </form>
      </RHFProvider>
    </FormSheet>
  );
}
