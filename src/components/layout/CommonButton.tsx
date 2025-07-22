"use client";

import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export default function CommonButton({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <Button
      className={`px-6 py-2 bg-black text-white rounded hover:bg-gray-800 shadow-none ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
