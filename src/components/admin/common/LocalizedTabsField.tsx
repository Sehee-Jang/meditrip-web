"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import {
  LOCALES_TUPLE,
  REQUIRED_LOCALES,
  LOCALE_LABELS_KO,
  type LocaleKey,
} from "@/constants/locales";

type Mode = "input" | "textarea" | "number";

/** 공통 베이스 Props */
type BaseProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  placeholder?: string;
  rows?: number; // textarea
  mode?: Mode;

  /** 외부에서 활성 탭 제어(선택) */
  activeLocale?: LocaleKey;
  onActiveLocaleChange?: (loc: LocaleKey) => void;

  /** 한쪽만 에러일 때 자동으로 해당 탭으로 이동 */
  autoSwitchOnError?: boolean;

  /** RHF errors(동적 경로에서 에러 추출용) */
  errors?: FieldErrors<T>;
};

/** 하위호환: ko/ja 전용 경로 */
type KoJaVariant<T extends FieldValues> = {
  pathKo: Path<T>;
  pathJa: Path<T>;
  basePath?: undefined;
  locales?: undefined;
  labels?: undefined;

  /** (옵션) ko/ja 에러 메시지를 직접 전달하고 싶을 때 */
  errorKo?: string;
  errorJa?: string;
};

/** 동적 로케일: basePath + locales로 name을 구성(basePath.ko 등) */
type DynamicVariant<T extends FieldValues> = {
  basePath: Path<T>; // 예: "title" → "title.ko", "title.ja" ...
  locales?: readonly LocaleKey[]; // 기본 LOCALES_TUPLE
  labels?: Partial<Record<LocaleKey, string>>; // 기본 LOCALE_LABELS_KO
  pathKo?: undefined;
  pathJa?: undefined;
  errorKo?: undefined;
  errorJa?: undefined;
};

type Props<T extends FieldValues> = BaseProps<T> &
  (KoJaVariant<T> | DynamicVariant<T>);

/** 에러 메시지 안전 접근 */
function getErrorMessage<T extends FieldValues>(
  errors: FieldErrors<T> | undefined,
  path: string
): string | undefined {
  if (!errors) return undefined;
  const segs = path.split(".");
  let cur: unknown = errors as unknown;
  for (const s of segs) {
    if (typeof cur !== "object" || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[s];
  }
  const maybe = cur as { message?: unknown };
  return typeof maybe?.message === "string" ? maybe.message : undefined;
}

/** base.locale 조합 유틸 */
function joinPath<A extends string, B extends string>(a: A, b: B): `${A}.${B}` {
  return `${a}.${b}` as `${A}.${B}`;
}

export default function LocalizedTabsField<T extends FieldValues>(
  props: Props<T>
) {
  const {
    register,
    placeholder,
    rows = 3,
    mode = "input",
    activeLocale,
    onActiveLocaleChange,
    autoSwitchOnError = true,
    errors,
  } = props;

  // 동적/정적 모드 판별
  const isDynamic = "basePath" in props && typeof props.basePath === "string";

  // locales 계산을 별도 useMemo로 고정
  const resolvedLocales = useMemo<readonly LocaleKey[]>(() => {
    return isDynamic
      ? props.locales && props.locales.length > 0
        ? props.locales
        : LOCALES_TUPLE
      : (["ko", "ja"] as const);
  }, [isDynamic, props.locales]);

  // 라벨 병합
  const labels: Record<LocaleKey, string> = useMemo(() => {
    return { ...LOCALE_LABELS_KO, ...(isDynamic ? props.labels : undefined) };
  }, [isDynamic, props.labels]);

  // 제어/비제어 탭 상태
  const controlled = typeof activeLocale !== "undefined";
  const [tab, setTab] = useState<LocaleKey>(resolvedLocales[0]);
  const current = controlled ? (activeLocale as LocaleKey) : tab;

  const setCurrent = useCallback(
    (loc: LocaleKey) => {
      if (controlled) onActiveLocaleChange?.(loc);
      else setTab(loc);
    },
    [controlled, onActiveLocaleChange]
  );

  // locales가 바뀌었을 때(동적) 현재 탭이 유효하지 않으면 첫 로케일로 보정
  const errorMap = useMemo<Partial<Record<LocaleKey, string>>>(() => {
    const map: Partial<Record<LocaleKey, string>> = {};
    for (const loc of resolvedLocales) {
      if (isDynamic) {
        const path = joinPath(props.basePath as string, loc);
        map[loc] = getErrorMessage(errors, path);
      } else {
        if (loc === "ko")
          map[loc] =
            (props as KoJaVariant<T>).errorKo ??
            getErrorMessage(errors, String((props as KoJaVariant<T>).pathKo));
        else if (loc === "ja")
          map[loc] =
            (props as KoJaVariant<T>).errorJa ??
            getErrorMessage(errors, String((props as KoJaVariant<T>).pathJa));
      }
    }
    return map;
  }, [errors, isDynamic, resolvedLocales, props]);

  // 문자열 키로 의존성 안정화
  const errorMapKey = useMemo(() => JSON.stringify(errorMap), [errorMap]);

  // basePath 루트 에러 추출 (예: "필수 언어(ko, ja)를 입력하세요.")
  const baseError: string | undefined = isDynamic
    ? getErrorMessage(errors, String(props.basePath))
    : undefined;

  // 에러가 있으면 자동으로 해당 탭으로 이동 (루트 에러는 ko로 고정)
  useEffect(() => {
    if (!autoSwitchOnError) return;
    const hasCurrent =
      Boolean(errorMap[current]) ||
      Boolean(baseError && REQUIRED_LOCALES.includes(current));
    if (!hasCurrent) {
      const hit = resolvedLocales.find((loc) => Boolean(errorMap[loc]));
      if (hit && hit !== current) {
        setCurrent(hit);
        return;
      }
      if (baseError) {
        setCurrent(REQUIRED_LOCALES[0]);
        return;
      } // ko
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    autoSwitchOnError,
    baseError,
    current,
    errorMapKey,
    resolvedLocales,
    setCurrent,
  ]);

  const numberProps = {
    type: "number" as const,
    inputMode: "numeric" as const,
    pattern: "\\d*",
    min: 0,
    step: 1,
  };

  return (
    <Tabs value={current} onValueChange={(v) => setCurrent(v as LocaleKey)}>
      <TabsList className='mb-2'>
        {resolvedLocales.map((loc) => {
          const isRequired = (
            REQUIRED_LOCALES as readonly LocaleKey[]
          ).includes(loc);
          const hasLocaleErr = Boolean(errorMap[loc]);
          const hasBaseErrOnThis = Boolean(
            baseError && loc === REQUIRED_LOCALES[0]
          ); // 루트 에러는 ko 탭에 표시
          return (
            <TabsTrigger key={loc} value={loc}>
              {labels[loc] ?? loc.toUpperCase()}
              {isRequired && <span className='ml-0.5 text-red-500'>*</span>}
              {(hasLocaleErr || hasBaseErrOnThis) && (
                <span
                  aria-label='오류 있음'
                  className='ml-1 inline-block h-1.5 w-1.5 rounded-full bg-red-600'
                />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {resolvedLocales.map((loc) => {
        const name: Path<T> = isDynamic
          ? (joinPath(
              (props as DynamicVariant<T>).basePath as string,
              loc
            ) as Path<T>)
          : ((loc === "ko"
              ? (props as KoJaVariant<T>).pathKo
              : (props as KoJaVariant<T>).pathJa) as Path<T>);

        const localeErr = errorMap[loc];
        const displayErr = loc === current && baseError ? baseError : localeErr;

        const Control =
          mode === "textarea" ? (
            <Textarea
              rows={rows}
              {...register(name)}
              placeholder={placeholder}
              aria-invalid={Boolean(displayErr) || undefined}
            />
          ) : mode === "number" ? (
            <Input
              {...numberProps}
              {...register(name, {
                setValueAs: (v) =>
                  v === "" || v === null ? undefined : Number(v),
              })}
              placeholder={placeholder}
              aria-invalid={Boolean(displayErr) || undefined}
            />
          ) : (
            <Input
              {...register(name)}
              placeholder={placeholder}
              aria-invalid={Boolean(displayErr) || undefined}
            />
          );

        return (
          <TabsContent
            key={loc}
            value={loc}
            className='mt-0 hidden data-[state=active]:block' // 비활성 숨김
            forceMount // 등록 유지
          >
            {Control}
            {displayErr && (
              <p className='mt-1 text-[11px] text-red-600'>{displayErr}</p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
