"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  lang: "ko" | "ja"; // 페이지에서 넘겨줌
};

type Option = { label: string; value: string };

const THEMA_OPTIONS: Option[] = [
  { label: "전체", value: "" },
  { label: "온천/사우나/스파", value: "EX050100" },
  { label: "찜질방", value: "EX050200" },
  { label: "한방 체험", value: "EX050300" },
  { label: "힐링 명상", value: "EX050400" },
  { label: "뷰티 스파", value: "EX050500" },
  { label: "기타 웰니스", value: "EX050600" },
  { label: "자연 치유", value: "EX050700" },
];

export default function TourFiltersClient({ lang }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [sido, setSido] = React.useState<string>(sp.get("sido") ?? "");
  const [sigungu, setSigungu] = React.useState<string>(sp.get("sigungu") ?? "");
  const [theme, setTheme] = React.useState<string>(sp.get("theme") ?? "");

  const [sidoOptions, setSidoOptions] = React.useState<Option[]>([
    { label: "전체", value: "" },
  ]);
  const [sigunguOptions, setSigunguOptions] = React.useState<Option[]>([
    { label: "전체", value: "" },
  ]);
  const [loadingSido, setLoadingSido] = React.useState(false);
  const [loadingSigungu, setLoadingSigungu] = React.useState(false);

  // 시도 옵션 로드
  React.useEffect(() => {
    let aborted = false;
    const ac = new AbortController();
    const run = async () => {
      setLoadingSido(true);
      try {
        const res = await fetch(`/api/kto/ldong?scope=sido&lang=ko`, {
          signal: ac.signal,
          cache: "no-store",
        });
        const json = (await res.json()) as { options?: Option[] };
        if (!aborted && Array.isArray(json.options))
          setSidoOptions(json.options);
      } finally {
        setLoadingSido(false);
      }
    };
    run();
    return () => {
      aborted = true;
      ac.abort();
    };
  }, [lang]);

  // 시군구 옵션 로드(시도 변경 시)
  React.useEffect(() => {
    let aborted = false;
    const ac = new AbortController();
    const run = async () => {
      setSigungu("");
      if (!sido) {
        setSigunguOptions([{ label: "전체", value: "" }]);
        return;
      }
      setLoadingSigungu(true);
      try {
        const res = await fetch(
          `/api/kto/ldong?scope=sigungu&sido=${sido}&lang=ko`,
          {
            signal: ac.signal,
            cache: "no-store",
          }
        );
        const json = (await res.json()) as { options?: Option[] };
        if (!aborted && Array.isArray(json.options))
          setSigunguOptions(json.options);
      } finally {
        setLoadingSigungu(false);
      }
    };
    run();
    return () => {
      aborted = true;
      ac.abort();
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

    const setParam = (key: string, value?: string) => {
      if (typeof value !== "string") return;
      if (value) q.set(key, value);
      else q.delete(key);
    };
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
          {lang === "ko" ? "시도" : "Sido"}
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
          {lang === "ko" ? "시군구" : "Sigungu"}
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
          {THEMA_OPTIONS.map((op) => (
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
