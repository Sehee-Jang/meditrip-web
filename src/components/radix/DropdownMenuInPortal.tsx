"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React from "react";
import { usePortalContainer } from "@/components/a11y/PortalContainerContext";

/** 설명: DropdownMenu.Portal의 container를 Dialog/Sheet Content로 고정 */
export function DropdownMenuPortalInTarget({
  children,
}: {
  children: React.ReactNode;
}) {
  const container = usePortalContainer();
  return (
    <DropdownMenu.Portal container={container ?? undefined}>
      {children}
    </DropdownMenu.Portal>
  );
}
