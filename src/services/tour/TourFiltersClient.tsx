"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TOUR_THEME_LABELS } from "@/types/kto-wellness";

type Props = {
  lang: "ko" | "ja"; // 페이지에서 넘겨줌
};

type Option = { label: string; value: string };

function allLabel(lang: "ko" | "ja") {
  return lang === "ja" ? "すべて" : "전체";
}
function langKeyOf(lang: "ko" | "ja"): "KOR" | "JPN" | "ENG" {
  return lang === "ko" ? "KOR" : "JPN";
}
// 테마 표시 순서를 고정하고 싶으면 아래 배열을 사용
const THEME_ORDER = [
  "EX050100",
  "EX050200",
  "EX050300",
  "EX050400",
  "EX050500",
  "EX050600",
  "EX050700",
];

export default function TourFiltersClient({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [sido, setSido] = useState<string>(sp.get("sido") ?? "");
  const [sigungu, setSigungu] = useState<string>(sp.get("sigungu") ?? "");
  const [theme, setTheme] = useState<string>(sp.get("theme") ?? "");

  const [sidoOptions, setSidoOptions] = useState<Option[]>([
    { label: "전체", value: "" },
  ]);
  const [sigunguOptions, setSigunguOptions] = useState<Option[]>([
    { label: "전체", value: "" },
  ]);
  const [loadingSido, setLoadingSido] = useState(false);
  const [loadingSigungu, setLoadingSigungu] = useState(false);

  // 테마 옵션을 라벨 맵에서 생성
  const themeOptions = useMemo<Option[]>(() => {
    const key = langKeyOf(lang);
    const list = THEME_ORDER.filter(
      (code) => TOUR_THEME_LABELS[code]?.[key]
    ).map((code) => ({
      value: code,
      label: TOUR_THEME_LABELS[code]![key]!,
    }));
    return [{ label: allLabel(lang), value: "" }, ...list];
  }, [lang]);

  // 시도 옵션 로드
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoadingSido(true);

      try {
        const res = await fetch(`/api/kto/ldong?scope=sido&lang=${lang}`, {
          signal: ac.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load sido options");
        const json = (await res.json()) as { options?: Option[] };
        if (ac.signal.aborted) return;
        setSidoOptions(
          Array.isArray(json.options)
            ? json.options
            : [{ label: "전체", value: "" }]
        );
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error(err);
      } finally {
        if (!ac.signal.aborted) setLoadingSido(false);
      }
    })();

    return () => {
      ac.abort("component-unmounted");
    };
  }, [lang]);

  // 시군구 옵션 로드(시도 변경 시)
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      // 시도 변경 시 선택 초기화
      setSigungu("");

      if (!sido) {
        setSigunguOptions([{ label: "전체", value: "" }]);
        return;
      }

      setLoadingSigungu(true);
      try {
        const res = await fetch(
          `/api/kto/ldong?scope=sigungu&sido=${encodeURIComponent(
            sido
          )}&lang=${lang}`,
          { signal: ac.signal, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load sigungu options");
        const json = (await res.json()) as { options?: Option[] };
        if (ac.signal.aborted) return;
        setSigunguOptions(
          Array.isArray(json.options)
            ? json.options
            : [{ label: "전체", value: "" }]
        );
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error(err);
      } finally {
        if (!ac.signal.aborted) setLoadingSigungu(false);
      }
    })();

    return () => {
      ac.abort("component-unmounted");
    };
  }, [sido, lang]);

  const updateQuery = (next: {
    sido?: string;
    sigungu?: string;
    theme?: string;
  }) => {
    const q = new URLSearchParams(sp.toString());
    q.set("mode", "area");
    q.set("page", "1");
    const setParam = (k: string, v?: string) => (v ? q.set(k, v) : q.delete(k));
    setParam("sido", next.sido);
    setParam("sigungu", next.sigungu);
    setParam("theme", next.theme);
    router.push(`${pathname}?${q.toString()}`);
  };

  const onApply = () => updateQuery({ sido, sigungu, theme });
  const onReset = () => {
    setSido("");
    setSigungu("");
    setTheme("");
    updateQuery({ sido: "", sigungu: "", theme: "" });
  };

  return (
    <section className='mb-4 w-full flex flex-col gap-2 md:flex-row md:items-center md:gap-4'>
      {/* 시도 */}
      <label className='flex-1 min-w-0 flex items-center gap-2'>
        <span className='w-14 shrink-0 text-sm text-muted-foreground'>
          {lang === "ko" ? "시도" : "Province"}
        </span>
        <select
          className='w-full min-w-0 rounded-md border bg-background px-2 py-1 text-sm'
          value={sido}
          onChange={(e) => setSido(e.target.value)}
          disabled={loadingSido}
        >
          {loadingSido ? (
            <option>불러오는 중…</option>
          ) : (
            sidoOptions.map((op) => (
              <option key={`${op.value}-${op.label}`} value={op.value}>
                {op.label}
              </option>
            ))
          )}
        </select>
      </label>

      {/* 시군구 */}
      <label className='flex-1 min-w-0 flex items-center gap-2'>
        <span className='w-14 shrink-0 text-sm text-muted-foreground'>
          {lang === "ko" ? "시/군/구" : "City"}
        </span>
        <select
          className='w-full min-w-0 rounded-md border bg-background px-2 py-1 text-sm'
          value={sigungu}
          onChange={(e) => setSigungu(e.target.value)}
          disabled={!sido || loadingSigungu || sigunguOptions.length <= 1}
        >
          {sigunguOptions.map((op) => (
            <option key={`${op.value}-${op.label}`} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </label>

      {/* 테마 */}
      <label className='flex-1 min-w-0 flex items-center gap-2'>
        <span className='w-14 shrink-0 text-sm text-muted-foreground'>
          {lang === "ko" ? "테마" : "Theme"}
        </span>
        <select
          className='w-full min-w-0 rounded-md border bg-background px-2 py-1 text-sm'
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          {themeOptions.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </label>

      {/* 액션 */}
      <div className='ml-auto flex items-center gap-2 md:flex-none'>
        <button
          type='button'
          onClick={onApply}
          className='rounded-md border px-3 py-1.5 text-sm hover:bg-accent'
        >
          {lang === "ko" ? "적용" : "Apply"}
        </button>
        <button
          type='button'
          onClick={onReset}
          className='rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent'
        >
          {lang === "ko" ? "초기화" : "Reset"}
        </button>
      </div>
    </section>
  );
}
