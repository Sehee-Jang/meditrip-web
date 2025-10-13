"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import {
  FormProvider as RHFProvider,
  useForm,
  type SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import type { z } from "zod";
import {
  createClinic,
  getClinicByIdAdmin,
  updateClinic,
} from "@/services/admin/clinics/clinics";
import type { ClinicDoc, ClinicWithId, Geo } from "@/types/clinic";
import { clinicFormSchema, type ClinicFormValues } from "@/validations/clinic";
import { LOCALES_TUPLE, type LocaleKey } from "@/constants/locales";
import FormSheet from "@/components/admin/common/FormSheet";
import SectionCard from "@/components/admin/common/SectionCard";
import FormRow from "@/components/admin/common/FormRow";
import LocalizedTabsField from "@/components/admin/common/LocalizedTabsField";
import { LocalizedTiptapField } from "@/components/admin/common/LocalizedTiptapField";
import ImagesUploader from "@/components/admin/common/ImagesUploader";
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
  asAmenityKeys,
} from "./form-utils";
import CleanFormLayout from "@/components/admin/common/CleanFormLayout";
import TagPicker from "@/components/admin/clinics/fields/TagPicker";
import { useTagsCatalog } from "@/services/tags/tags";
import {
  CATEGORY_KEYS,
  CATEGORY_LABELS_KO,
  CATEGORY_ICONS,
  type CategoryKey,
} from "@/constants/categories";
import type { JSONContent } from "@/types/tiptap";
import { Checkbox } from "@/components/ui/checkbox";
import { uploadClinicRichImage } from "@/services/storage/uploadClinicRichImage";

/* ====== 카테고리 다중선택 UI (체크리스트) ====== */
function CategoriesChecklist({
  value,
  onChange,
  disabled,
}: {
  value: CategoryKey[];
  onChange: (next: CategoryKey[]) => void;
  disabled?: boolean;
}) {
  const toggle = (k: CategoryKey) => {
    const has = value.includes(k);
    onChange(has ? value.filter((x) => x !== k) : [...value, k]);
  };

  return (
    <div className='flex flex-wrap gap-2'>
      {CATEGORY_KEYS.map((k) => {
        const checked = value.includes(k);
        const Icon = CATEGORY_ICONS[k];
        const label = CATEGORY_LABELS_KO[k] ?? k;
        return (
          <button
            key={k}
            type='button'
            onClick={() => toggle(k)}
            disabled={disabled}
            className={[
              "inline-flex items-center gap-2 h-8 rounded-md border px-3 text-sm",
              checked ? "border-primary ring-1 ring-primary" : "opacity-80",
            ].join(" ")}
            aria-pressed={checked}
          >
            <Icon size={16} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

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

  const EMPTY_DOC: JSONContent = {
    type: "doc",
    content: [{ type: "paragraph" }],
  };

  function isDoc(v: unknown): v is JSONContent {
    return (
      !!v && typeof v === "object" && (v as { type?: unknown }).type === "doc"
    );
  }

  // 부분 레코드(일부 undefined) → 모든 로케일을 가진 완전한 레코드로 보정
  function ensureLocalizedRichText(
    input: Partial<Record<LocaleKey, unknown>> | undefined
  ): Record<LocaleKey, JSONContent> {
    const out = {} as Record<LocaleKey, JSONContent>;
    for (const lc of LOCALES_TUPLE) {
      const v = input?.[lc];
      out[lc] = isDoc(v) ? v : EMPTY_DOC;
    }
    return out;
  }

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
      categoryKeys: [],
      isExclusive: false,
      description: {
        ko: EMPTY_DOC,
        ja: EMPTY_DOC,
        zh: EMPTY_DOC,
        en: EMPTY_DOC,
      },
      highlights: {
        ko: EMPTY_DOC,
        ja: EMPTY_DOC,
        zh: EMPTY_DOC,
        en: EMPTY_DOC,
      },
      events: { ko: [], ja: [], zh: [], en: [] },
      reservationNotices: { ko: [], ja: [], zh: [], en: [] },
      images: [],
      tagSlugs: [],
      phone: "",
      website: "",
      socials: {},
      weeklyHours: {},
      weeklyClosedDays: [],
      hoursNote: { ko: "", ja: "", zh: "", en: "" },
      amenities: [],
      rating: 0,
      reviewCount: 0,
      status: "visible",
      doctors: [],
    },
    mode: "onChange",
    shouldFocusError: true,
  });

  const { register, setValue, handleSubmit, formState, reset, watch, control } =
    form;

  const { data: tagCatalog, loading: tagsLoading } = useTagsCatalog();
  const currentLocale = LOCALES_TUPLE[0]; // 관리자 UI 기본 표시언어

  function asDoc(v: unknown): JSONContent {
    if (
      v &&
      typeof v === "object" &&
      (v as { type?: unknown }).type === "doc"
    ) {
      return v as JSONContent;
    }
    if (typeof v === "string" && v.trim().length) {
      return {
        type: "doc",
        content: [{ type: "paragraph", content: [{ type: "text", text: v }] }],
      };
    }
    return EMPTY_DOC;
  }

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
        categoryKeys: Array.isArray(
          (data as { categoryKeys?: unknown }).categoryKeys
        )
          ? (data as { categoryKeys: CategoryKey[] }).categoryKeys
          : [],
        isExclusive: data.isExclusive ?? false,
        description: LOCALES_TUPLE.reduce(
          (acc, lc) => {
            acc[lc] = asDoc(
              (data.description as Record<string, unknown>)?.[lc]
            );
            return acc;
          },
          {
            ko: EMPTY_DOC,
            ja: EMPTY_DOC,
            zh: EMPTY_DOC,
            en: EMPTY_DOC,
          } as Record<LocaleKey, JSONContent>
        ),

        highlights: LOCALES_TUPLE.reduce(
          (acc, lc) => {
            acc[lc] = asDoc((data.highlights as Record<string, unknown>)?.[lc]);
            return acc;
          },
          {
            ko: EMPTY_DOC,
            ja: EMPTY_DOC,
            zh: EMPTY_DOC,
            en: EMPTY_DOC,
          } as Record<LocaleKey, JSONContent>
        ),

        events: ensureLocalizedStringArrays(
          (data as { events?: unknown }).events
        ),
        reservationNotices: ensureLocalizedStringArrays(
          (data as { reservationNotices?: unknown }).reservationNotices
        ),
        images: data.images ?? [],
        tagSlugs: data.tagSlugs ?? [],
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
      const { geo, weeklyHours, amenities, description, highlights, ...rest } =
        values;

      const geoClean: Geo | undefined =
        geo && typeof geo.lat === "number" && typeof geo.lng === "number"
          ? { lat: geo.lat, lng: geo.lng }
          : undefined;

      const weeklyHoursClean = toDocWeeklyHours(weeklyHours);
      const amenitiesClean = asAmenityKeys(amenities);

      // 여기서 필수/옵션 로케일 관계없이 모두 채워서 완전한 타입으로 만든다.
      const descriptionClean = ensureLocalizedRichText(description);
      const highlightsClean = ensureLocalizedRichText(highlights);

      const finalPayload: Omit<ClinicDoc, "createdAt" | "updatedAt"> = {
        ...rest, // categoryKeys 포함
        description: descriptionClean,
        highlights: highlightsClean,
        weeklyHours: weeklyHoursClean,
        amenities: amenitiesClean,
        ...(geoClean ? { geo: geoClean } : {}),
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
    { id: "sec-intro", label: "소개" },
    { id: "sec-highlights", label: "하이라이트" },
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
      title={mode === "create" ? "업체 등록" : "업체 수정"}
      description='필수 정보를 입력하세요.'
      formId={formId}
      submitLabel={mode === "create" ? "등록" : "수정"}
      widthClassName='sm:max-w-[980px]'
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
              <SectionCard title='기본 정보'>
                <FormRow
                  label='업체명'
                  control={
                    <LocalizedTabsField
                      register={register}
                      basePath='name'
                      locales={LOCALES_TUPLE}
                      errors={formState.errors}
                      placeholder='업체명을 입력하세요.'
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
                  label='소개 제목 (선택)'
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
                  label='소개 부제 (선택)'
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
                {/* 기존 단일 category는 제거, 다중 categoryKeys로 전환 */}
                <FormRow
                  label='카테고리(다중 선택)'
                  control={
                    <Controller
                      name='categoryKeys'
                      control={control}
                      render={({ field }) => (
                        <CategoriesChecklist
                          value={field.value ?? []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  }
                />
                <FormRow
                  label='태그 (선택)'
                  control={
                    <TagPicker
                      value={watch("tagSlugs") ?? []}
                      onChange={(next) =>
                        setValue("tagSlugs", next, { shouldDirty: true })
                      }
                      catalog={tagCatalog}
                      locale={currentLocale as LocaleKey}
                      placeholder='태그 검색 또는 클릭하여 선택'
                      disabled={tagsLoading}
                    />
                  }
                />
                <FormRow
                  label='단독 입점 여부 (선택)'
                  className='items-center'
                  control={
                    <Controller
                      name='isExclusive'
                      control={control}
                      render={({ field }) => (
                        <div className='flex items-center gap-2 pt-2'>
                          <Checkbox
                            id='isExclusive'
                            checked={!!field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                          <label
                            htmlFor='isExclusive'
                            className='text-sm text-foreground'
                          >
                            단독 입점
                          </label>
                        </div>
                      )}
                    />
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
              <SectionCard title='연락처 & 웹·SNS (선택)'>
                <ContactsAndSocials />
              </SectionCard>
            </section>

            {/* ===== 영업시간 & 휴무/안내문 ===== */}
            <section
              id='sec-hours'
              data-section='sec-hours'
              className='scroll-mt-24'
            >
              <SectionCard title='영업시간 & 휴무 (선택)'>
                <WeeklyHoursGrid />
                <FormRow
                  label='정기 휴무 요일 (선택)'
                  control={<ClosedDaysChecklist />}
                />
                <FormRow
                  label='휴무/영업 안내문 (선택)'
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

            {/* ===== 업체 소개 ===== */}
            <section
              id='sec-intro'
              data-section='sec-intro'
              className='scroll-mt-24'
            >
              <SectionCard title='업체 소개 (선택)'>
                <div className='px-5 py-4 space-y-2'>
                  <div className='text-xs text-muted-foreground'>
                    설명(Description)
                  </div>
                  <LocalizedTiptapField
                    control={control}
                    basePath='description'
                    locales={LOCALES_TUPLE}
                    placeholder='업체 소개/설명을 입력하세요.'
                    minHeight={100}
                    onUploadImage={uploadClinicRichImage}
                  />
                </div>
              </SectionCard>
            </section>

            {/* ===== 하이라이트 ===== */}
            <section
              id='sec-highlights'
              data-section='sec-highlights'
              className='scroll-mt-24'
            >
              <SectionCard
                title='하이라이트 (선택)'
                description='기관 인증 및 선정 이력'
              >
                <div className='px-5 pb-4'>
                  <LocalizedTiptapField
                    control={control}
                    basePath='highlights'
                    locales={LOCALES_TUPLE}
                    placeholder='예) 기관 인증/선정 이력을 항목별로 작성'
                    minHeight={100}
                    onUploadImage={uploadClinicRichImage}
                  />
                </div>
              </SectionCard>
            </section>

            {/* ===== 편의시설 ===== */}
            <section
              id='sec-amenities'
              data-section='sec-amenities'
              className='scroll-mt-24'
            >
              <SectionCard title='편의시설 (선택)'>
                <AmenitiesChecklist />
              </SectionCard>
            </section>

            {/* ===== 예약 시 주의사항===== */}
            <section
              id='sec-notices'
              data-section='sec-notices'
              className='scroll-mt-24'
            >
              <SectionCard title='예약 시 주의사항 (선택)'>
                <LocalizedRepeaterFieldMulti
                  basePath='reservationNotices'
                  locales={LOCALES_TUPLE}
                  addLabel='주의사항 추가'
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
              <SectionCard title='예약 이벤트 (선택)'>
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
              <SectionCard title='의료진 소개 (선택)'>
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
                title='좌표/주소 (선택)'
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
