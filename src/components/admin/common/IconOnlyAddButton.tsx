"use client";
import { usePortalContainer } from "@/components/a11y/PortalContainerContext";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type Props = {
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 툴팁에 보여줄 레이블(접근성 텍스트로도 사용) */
  label: string;
  /** aria-label을 별도로 주고 싶으면 지정(미지정 시 label 사용) */
  ariaLabel?: string;
  /** 아이콘 컴포넌트 교체 가능(기본: Plus) */
  icon?: IconType;
  /** shadcn Button variant — 프로젝트에 'brand'가 있으면 그대로 사용 */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "brand";
  /** shadcn Button size — 프로젝트 커스텀에 맞춰 확장 */
  size?: "icon" | "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
};

export default function IconOnlyAddButton({
  onClick,
  label,
  ariaLabel,
  icon: Icon = Plus,
  variant = "brand",
  size = "icon",
  className,
  disabled = false,
}: Props) {
  const portalContainer = usePortalContainer();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type='button'
            onClick={onClick}
            variant={variant}
            size={size}
            aria-label={ariaLabel ?? label}
            title={label}
            disabled={disabled}
            className={[
              // 아이콘 전용 버튼 크기(원형)
              size === "icon" ? "h-9 w-9 rounded-full p-0" : "",
              // hover 시 아이콘 회전(모션 선호도 따라 정지)
              "group",
              className ?? "",
            ].join(" ")}
          >
            <Icon
              className='transition-transform duration-300 motion-safe:group-hover:rotate-90'
              aria-hidden='true'
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side='left'
          sideOffset={8}
          className='z-[9999]'
          container={portalContainer}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
