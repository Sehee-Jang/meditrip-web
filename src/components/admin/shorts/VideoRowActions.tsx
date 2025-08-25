"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Trash2 } from "lucide-react";
import type { Video } from "@/types/video";

type Props = {
  video: Video;
  /** 부모에서 confirm 및 삭제 처리 */
  onDelete: (id: string) => void | Promise<void>;
};

export default function VideoRowActions({ video, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          aria-label='행 동작'
        >
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-40'>
        {/* (선택) 유튜브 열기 */}
        {video.youtubeUrl ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              window.open(video.youtubeUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className='mr-2 size-4' />
            YouTube 열기
          </DropdownMenuItem>
        ) : null}

        {/* 삭제 */}
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            void onDelete(video.id);
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 size-4' />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
