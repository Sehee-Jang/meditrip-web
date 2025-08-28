"use client";

import React, {
  createContext,
  useContext,
  type MutableRefObject,
  type RefObject,
} from "react";

// Dialog/Sheet 콘텐츠 ref는 div일 수도 있고 다른 HTMLElement일 수도 있음
type AnyElRef =
  | RefObject<HTMLElement | null>
  | MutableRefObject<HTMLElement | null>;

const PortalContainerContext = createContext<AnyElRef | null>(null);

export function PortalContainerProvider({
  value,
  children,
}: {
  value: AnyElRef;
  children: React.ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={value}>
      {children}
    </PortalContainerContext.Provider>
  );
}

// DropdownMenu/Popover/Tooltip에서 사용할 실제 컨테이너 엘리먼트 반환
export function usePortalContainer(): HTMLElement | null {
  const ref = useContext(PortalContainerContext);
  return ref?.current ?? null;
}
