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
  width?: string;
  height?: string;
  loading?: LoadingAttr;
  referrerpolicy?: ReferrerPolicyAttr;
  allowfullscreen?: boolean;
  style?: string;
  title?: string;
}

/** TipTap Commands 모듈 보강: insertMapIframe 타입을 전역으로 알림 */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mapIframe: {
      insertMapIframe: (attrs: MapIframeAttrs) => ReturnType;
    };
  }
}
