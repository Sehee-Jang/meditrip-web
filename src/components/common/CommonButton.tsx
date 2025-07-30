"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  variant?: "outline";
};

export default function CommonButton({
  children,
  variant,
  className = "",
  ...props
}: Props) {
  const base = "px-6 py-2 rounded shadow-none";
  const style =
    variant === "outline"
      ? "bg-white text-black border border-black hover:bg-gray-100"
      : "bg-black text-white hover:bg-gray-800";

  return (
    <Button className={`${base} ${style} ${className}`} {...props}>
      {children}
    </Button>
  );
}
