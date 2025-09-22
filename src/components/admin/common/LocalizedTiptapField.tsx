"use client";

import { Controller } from "react-hook-form";
import type {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import type { JSONContent } from "@tiptap/core";
import type { LocaleKey } from "@/constants/locales";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

// 문자열/미정 값을 Tiptap JSON으로 안전 변환
function toDoc(v: unknown): JSONContent {
  if (v && typeof v === "object" && (v as { type?: unknown }).type === "doc") {
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

// basePath와 locale을 붙여 RHF Path로 캐스팅
function makeLocalePath<TFieldValues extends FieldValues>(
  basePath: string,
  lc: LocaleKey
): Path<TFieldValues> {
  return `${basePath}.${lc}` as Path<TFieldValues>;
}

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  basePath: string;
  locales: readonly LocaleKey[];
  placeholder?: string;
  minHeight?: number;
  onUploadImage?: (file: File) => Promise<string>;
};

export function LocalizedTiptapField<TFieldValues extends FieldValues>({
  control,
  basePath,
  locales,
  placeholder,
  minHeight = 320,
  onUploadImage,
}: Props<TFieldValues>) {
  const first = locales[0];

  return (
    <Tabs defaultValue={first} className='w-full'>
      {/* 탭 바가 넘치면 탭 바 자체에서만 스크롤 */}
      <TabsList className='mb-2 max-w-full overflow-x-auto'>
        {locales.map((loc) => (
          <TabsTrigger key={loc} value={loc}>
            {loc.toUpperCase()}
          </TabsTrigger>
        ))}
      </TabsList>

      {locales.map((loc) => (
        <TabsContent
          key={loc}
          value={loc}
          className='mt-0 w-full overflow-x-hidden'
        >
          <Controller
            name={makeLocalePath<TFieldValues>(basePath, loc)}
            control={control}
            render={({
              field,
            }: {
              field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
            }) => (
              <SimpleEditor
                className='w-full'
                value={toDoc(field.value)}
                // SimpleEditor의 onChange는 (doc, plainText) 시그니처
                onChange={(doc) => {
                  field.onChange(doc);
                }}
                onUploadImage={onUploadImage}
                placeholder={
                  placeholder
                    ? `(${loc.toUpperCase()}) ${placeholder}`
                    : undefined
                }
                minHeight={minHeight}
              />
            )}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
