"use client";

import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import type { JSONContent } from "@/types/tiptap";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { Map } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { MapIframe } from "@/tiptap/extensions/map-iframe";
import type { MapIframeAttrs } from "@/tiptap/extensions/map-iframe"; // ★ 추가: 타입 가드용

// ===== insertMapIframe 커맨드 존재 체크(타입 가드) =====
function hasInsertMapIframe(
  ed: unknown
): ed is { commands: { insertMapIframe: (a: MapIframeAttrs) => boolean } } {
  const cmds = (ed as { commands?: unknown })?.commands;
  if (typeof cmds !== "object" || cmds === null) return false;
  const maybe = (cmds as Record<string, unknown>)["insertMapIframe"];
  return typeof maybe === "function";
}

export type SimpleEditorProps = {
  value: JSONContent;
  onChange: (doc: JSONContent, plainText: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onMapClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onMapClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        <MarkButton type='code' />
        <MarkButton type='underline' />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='superscript' />
        <MarkButton type='subscript' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align='left' />
        <TextAlignButton align='center' />
        <TextAlignButton align='right' />
        <TextAlignButton align='justify' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text='Add' />
        {/* 지도 삽입 버튼 */}
        <Button type='button' data-style='ghost' onClick={onMapClick}>
          <Map className='tiptap-button-icon' /> Add
        </Button>
      </ToolbarGroup>

      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style='ghost' onClick={onBack}>
        <ArrowLeftIcon className='tiptap-button-icon' />
        {type === "highlighter" ? (
          <HighlighterIcon className='tiptap-button-icon' />
        ) : (
          <LinkIcon className='tiptap-button-icon' />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  value,
  onChange,
  onUploadImage,
  placeholder = "여기에 내용을 입력하세요…",
  minHeight = 420,
  className,
}: SimpleEditorProps) {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");

  const [openMapDialog, setOpenMapDialog] = React.useState(false);
  const [mapSrc, setMapSrc] = React.useState<string>("");
  const [mapWidth, setMapWidth] = React.useState<string>("100%");
  const [mapHeight, setMapHeight] = React.useState<string>("400px");
  const [mapErr, setMapErr] = React.useState<string | null>(null);

  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({ horizontalRule: false }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Placeholder.configure({ placeholder }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 10,
        upload: async (file: File) => {
          if (onUploadImage) return await onUploadImage(file);
          return await handleImageUpload(file);
        },
        onError: (error) => console.error("Upload failed:", error),
      }),
      MapIframe,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as JSONContent, editor.getText());
    },
  });

  // 외부 value 변경 시 동기화(불필요 업데이트 방지)
  React.useEffect(() => {
    if (!editor) return;
    const prev = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (prev !== next) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") setMobileView("main");
  }, [isMobile, mobileView]);

  function isUrl(u: string): boolean {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  // ===== 패치: 지도 삽입 시 insertMapIframe 타입 가드로 안전 호출 =====
  const insertMap = (): void => {
    if (!editor) return;
    if (!isUrl(mapSrc)) {
      setMapErr("올바른 임베드 URL을 입력해 주세요.");
      return;
    }

    if (!hasInsertMapIframe(editor)) {
      setMapErr("지도 삽입 명령을 사용할 수 없습니다.");
      return;
    }

    const ok = editor.commands.insertMapIframe({
      src: mapSrc,
      width: mapWidth || "100%",
      height: mapHeight || "400px",
      loading: "lazy",
      referrerpolicy: "no-referrer-when-downgrade",
      allowfullscreen: true,
      style: "border:0;",
      title: "지도",
    });

    if (!ok) {
      setMapErr("허용되지 않은 도메인이거나 삽입에 실패했습니다.");
      return;
    }
    setOpenMapDialog(false);
    setMapSrc("");
    setMapWidth("100%");
    setMapHeight("400px");
    setMapErr(null);
  };

  return (
    <div className={["simple-editor-wrapper", className ?? ""].join(" ")}>
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? { bottom: `calc(100% - ${height - rect.y}px)` }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              onMapClick={() => setOpenMapDialog(true)}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        {openMapDialog && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertMap();
              }
            }}
          >
            <div className='w-[560px] max-w-[92vw] rounded-xl bg-white p-4 shadow-lg'>
              <h3 className='mb-3 text-lg font-semibold'>지도 임베드 추가</h3>

              <label className='mb-1 block text-sm'>
                임베드 URL (iframe의 src만)
              </label>
              <input
                className='w-full rounded border px-2 py-1'
                placeholder='https://www.google.com/maps/embed?pb=...'
                value={mapSrc}
                onChange={(e) => setMapSrc(e.target.value)}
              />

              <Accordion type='single' collapsible className='mt-2'>
                <AccordionItem value='embed-help' className='border rounded-md'>
                  <AccordionTrigger className='px-3 py-2 text-sm font-medium'>
                    임베드 URL 얻는 방법(퍼가기)
                  </AccordionTrigger>
                  <AccordionContent className='px-3 pb-3 pt-0 text-[13px] text-gray-700 leading-relaxed'>
                    <ol className='list-decimal pl-5 space-y-1'>
                      <li>
                        지도 서비스에서 원하는 화면(장소/뷰/로드뷰 등)을 연 뒤{" "}
                        <strong>공유</strong> → <strong>퍼가기(Embed)</strong>를
                        선택합니다.
                      </li>
                      <li>
                        표시되는 <code>{'<iframe ... src="여기">'}</code>의{" "}
                        <strong>src 값만</strong> 복사해 위 입력칸에
                        붙여넣습니다.
                      </li>
                    </ol>

                    <div className='mt-2'>
                      <strong>Google 지도</strong>: 공유 → 지도 퍼가기 →{" "}
                      <em>src</em> 복사
                      <br />
                      <strong>네이버 지도</strong>: 공유 아이콘 → 퍼가기 →{" "}
                      <em>src</em> 복사
                      <br />
                      <strong>카카오 지도</strong>: 공유 → 퍼가기 → <em>src</em>{" "}
                      복사
                    </div>

                    <div className='mt-2 text-gray-600'>
                      참고: 퍼가기는 보통 <em>Place(장소)/일반 뷰</em>만
                      지원합니다.
                      <br />
                      <strong>길찾기(Directions)</strong>를 페이지 안에
                      임베드하려면 <em>Google Maps Embed API</em>의 Directions
                      모드(URL 조립, API Key 필요)를 사용하거나, 본문에 “길찾기
                      열기” 버튼으로 외부 링크를 여는 방식을 권장합니다.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className='mt-3 grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block text-sm'>가로(width)</label>
                  <input
                    className='w-full rounded border px-2 py-1'
                    value={mapWidth}
                    onChange={(e) => setMapWidth(e.target.value)}
                    placeholder='100% 또는 800px'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm'>세로(height)</label>
                  <input
                    className='w-full rounded border px-2 py-1'
                    value={mapHeight}
                    onChange={(e) => setMapHeight(e.target.value)}
                    placeholder='400px'
                  />
                </div>
              </div>

              {mapErr && <p className='mt-2 text-sm text-red-600'>{mapErr}</p>}

              <div className='mt-4 flex justify-end gap-2'>
                <Button
                  data-style='ghost'
                  onClick={() => setOpenMapDialog(false)}
                >
                  취소
                </Button>
                <Button type='button' onClick={insertMap}>
                  삽입
                </Button>
              </div>
            </div>
          </div>
        )}

        <div style={{ minHeight }} className='rounded-xl border p-3'>
          <EditorContent
            editor={editor}
            role='presentation'
            className='simple-editor-content'
          />
        </div>
      </EditorContext.Provider>
    </div>
  );
}

export default SimpleEditor;
