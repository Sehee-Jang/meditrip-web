"use client";

import { Button } from "@/components/ui/button";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type CommonButtonProps = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  "variant"
> & {
  // 링크를 버튼처럼 감싸서 쓰려면 true:
  asChild?: boolean;
  variant?: "solid" | "outline";
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
};

export default function CommonButton({
  children,
  asChild = false,
  variant = "solid",
  className = "",
  type = "button",
  ...props
}: CommonButtonProps) {
  const base =
    "px-6 py-2 rounded shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black";
  const style =
    variant === "outline"
      ? "bg-white text-black border border-black hover:bg-gray-100"
      : "bg-black text-white hover:bg-gray-800";

  return (
    <Button
      asChild={asChild}
      type={type}
      className={[base, style, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Button>
  );
}
