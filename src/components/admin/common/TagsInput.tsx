"use client";

import * as React from "react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
};

export default function TagsInput({
  value,
  onChange,
  placeholder = "#태그입력",
  className,
}: Props) {
  const [input, setInput] = React.useState("");

  const addTag = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setInput("");
  };

  const removeTag = (t: string) => onChange(value.filter((x) => x !== t));

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input.length === 0 && value.length) {
      e.preventDefault();
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div
      className={[
        "min-h-10 w-full rounded-md border px-2 py-1.5",
        "flex flex-wrap items-center gap-1",
        className ?? "",
      ].join(" ")}
    >
      {value.map((t) => (
        <span
          key={t}
          className='inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs'
        >
          #{t}
          <button
            type='button'
            aria-label={`${t} 태그 제거`}
            className='text-muted-foreground'
            onClick={() => removeTag(t)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={value.length === 0 ? placeholder : undefined}
        className='flex-1 min-w-[120px] border-0 bg-transparent outline-none text-sm'
      />
    </div>
  );
}
