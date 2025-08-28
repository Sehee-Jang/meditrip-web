"use client";

import * as Popover from "@radix-ui/react-popover";
import React from "react";
import { usePortalContainer } from "@/components/a11y/PortalContainerContext";

/** 설명: Popover.Portal의 container를 Dialog/Sheet Content로 고정 */
export function PopoverPortalInTarget({
  children,
}: {
  children: React.ReactNode;
}) {
  const container = usePortalContainer();
  return (
    <Popover.Portal container={container ?? undefined}>
      {children}
    </Popover.Portal>
  );
}
