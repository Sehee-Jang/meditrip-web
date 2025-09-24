import { Node, mergeAttributes } from "@tiptap/core";
import type { CommandProps } from "@tiptap/core";

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

// ===== Commands 타입 확장(선언 병합) =====
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mapIframe: {
      /**
       * 본문에 지도 iframe 노드 삽입
       */
      insertMapIframe: (attrs: MapIframeAttrs) => ReturnType;
    };
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
      src: {
        default: "",
      },
      width: {
        default: "100%",
      },
      height: {
        default: "400px",
      },
      loading: {
        default: "lazy" as LoadingAttr,
      },
      referrerpolicy: {
        default: "no-referrer-when-downgrade" as ReferrerPolicyAttr,
      },
      allowfullscreen: {
        default: true,
        // HTML 직렬화 시 true면 속성만 출력
        renderHTML: (attrs: { allowfullscreen?: boolean }) =>
          attrs.allowfullscreen ? { allowfullscreen: "true" } : {},
      },
      style: {
        default: "border:0;",
      },
      title: {
        default: "지도",
      },
      "data-type": {
        default: "map-iframe",
      },
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
      // 허용 안 되는 경우 placeholder 출력(선택)
      return [
        "div",
        { class: "map-iframe-blocked", "data-reason": "invalid-host" },
        "Unsupported map source",
      ];
    }

    const safeAttrs = mergeAttributes(
      { "data-type": "map-iframe" },
      {
        src: attrs.src,
        width: attrs.width ?? "100%",
        height: attrs.height ?? "400px",
        loading: attrs.loading ?? "lazy",
        referrerpolicy: attrs.referrerpolicy ?? "no-referrer-when-cross-origin",
        style: attrs.style ?? "border:0;",
        title: attrs.title ?? "지도",
      },
      attrs.allowfullscreen ? { allowfullscreen: "true" } : {}
    );

    return ["iframe", safeAttrs];
  },

  addCommands() {
    return {
      insertMapIframe:
        (payload: MapIframeAttrs) =>
        ({ chain }: CommandProps): boolean => {
          // 타입 안전 검증
          if (!payload.src || !isAllowedMapHost(payload.src)) {
            return false;
          }
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

          return chain()
            .insertContent({
              type: this.name,
              attrs,
            })
            .run();
        },
    };
  },
});
