"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface GtmBridgeProps {
  enabled?: boolean;
}

type PageViewEvent = {
  event: "page_view";
  page_location: string;
  page_path: string;
  page_title?: string;
};

export default function GtmBridge({ enabled = true }: GtmBridgeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;

    const path = pathname ?? "/";
    const qs = searchParams?.toString();
    const href = qs
      ? `${window.location.origin}${path}?${qs}`
      : `${window.location.origin}${path}`;

    const ev: PageViewEvent = {
      event: "page_view",
      page_location: href,
      page_path: path,
      page_title: document.title,
    };

    // dataLayer가 없으면 안전하게 초기화
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(ev);
  }, [enabled, pathname, searchParams]);

  return null;
}
