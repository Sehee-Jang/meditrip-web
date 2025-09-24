import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps, RawCommands } from "@tiptap/core";

// ===== 타입 정의 =====
export type LoadingAttr = "lazy" | "eager";
export type ReferrerPolicyAttr =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "origin"
  | "origin-when-cross-origin"
  | "same-origin"
  | "strict-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url";

export interface MapIframeAttrs {
  src: string;
  width?: string; // 기본 "100%"
  height?: string; // 기본 "400px"
  loading?: LoadingAttr;
  referrerpolicy?: ReferrerPolicyAttr;
  allowfullscreen?: boolean;
  style?: string;
  title?: string;
}

const ALLOWED_HOSTS: readonly string[] = [
  "google.com",
  "naver.com",
  "kakao.com",
];

function isAllowedMapHost(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    return ALLOWED_HOSTS.some(
      (host) => u.hostname === host || u.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

// ===== 노드 구현 =====
export const MapIframe = Node.create({
  name: "mapIframe",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      src: { default: "" },
      width: { default: "100%" },
      height: { default: "400px" },
      loading: { default: "lazy" as LoadingAttr },
      referrerpolicy: {
        default: "no-referrer-when-downgrade" as ReferrerPolicyAttr,
      },
      allowfullscreen: {
        default: true,
        renderHTML: (attrs: { allowfullscreen?: boolean }) =>
          attrs.allowfullscreen ? { allowfullscreen: "true" } : {},
      },
      style: { default: "border:0;" },
      title: { default: "지도" },
      "data-type": { default: "map-iframe" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-type="map-iframe"]',
        getAttrs: (node: unknown) => {
          if (!(node instanceof Element)) return false;
          const src = node.getAttribute("src") ?? "";
          return isAllowedMapHost(src) ? {} : false;
        },
      },
      {
        tag: "iframe",
        getAttrs: (node: unknown) => {
          if (!(node instanceof Element)) return false;
          const src = node.getAttribute("src") ?? "";
          return isAllowedMapHost(src) ? { "data-type": "map-iframe" } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as Partial<MapIframeAttrs> & {
      ["data-type"]?: string;
    };

    if (!attrs.src || !isAllowedMapHost(attrs.src)) {
      return [
        "div",
        { class: "map-iframe-blocked", "data-reason": "invalid-host" },
        "Unsupported map source",
      ];
    }

    // 기본값을 addAttributes와 동일하게 유지
    const safeAttrs = mergeAttributes(
      { "data-type": "map-iframe" },
      {
        src: attrs.src,
        width: attrs.width ?? "100%",
        height: attrs.height ?? "400px",
        loading: attrs.loading ?? "lazy",
        referrerpolicy: attrs.referrerpolicy ?? "no-referrer-when-downgrade",
        style: attrs.style ?? "border:0;",
        title: attrs.title ?? "지도",
      },
      attrs.allowfullscreen ? { allowfullscreen: "true" } : {}
    );

    return ["iframe", safeAttrs];
  },

  addCommands() {
    const commands = {
      insertMapIframe:
        (payload: MapIframeAttrs) =>
        ({ chain }: CommandProps): boolean => {
          if (!payload.src || !isAllowedMapHost(payload.src)) return false;
          const attrs: MapIframeAttrs = {
            src: payload.src,
            width: payload.width ?? "100%",
            height: payload.height ?? "400px",
            loading: payload.loading ?? "lazy",
            referrerpolicy:
              payload.referrerpolicy ?? "no-referrer-when-downgrade",
            allowfullscreen: payload.allowfullscreen ?? true,
            style: payload.style ?? "border:0;",
            title: payload.title ?? "지도",
          };
          return chain().insertContent({ type: this.name, attrs }).run();
        },
    };

    // 핵심: RawCommands(의 부분집합)으로 인식시키기
    return commands as unknown as Partial<RawCommands>;
  },
});
