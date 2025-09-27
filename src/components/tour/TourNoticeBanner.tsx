"use client";
import { useEffect, useState } from "react";

export default function TourNoticeBanner() {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_TOUR_NOTICE_ENABLED === "true");
    setText(process.env.NEXT_PUBLIC_TOUR_NOTICE_TEXT ?? "");
  }, []);

  if (!enabled || !text) return null;
  return (
    <div className='mb-3 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
      {text}
    </div>
  );
}
