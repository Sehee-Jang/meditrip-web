"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { listVideos, deleteVideo } from "@/services/contents/videos.client";
import type { Video } from "@/types/video";
import type { CategoryKey } from "@/constants/categories";
import { CATEGORY_KEYS, CATEGORY_LABELS_KO } from "@/constants/categories";
import ContentCategoryPill from "@/components/contents/table/ContentCategoryPill";
import Image from "next/image";

type CatFilter = CategoryKey | "all";

const FALLBACK_THUMB = "/images/placeholders/community_default_img.webp";
function Thumb({ src, alt }: { src: string; alt: string }) {
  const [s, setS] = useState(src);
  return (
    <div className='relative w-20 h-12'>
      <Image
        src={s}
        alt={alt}
        fill
        sizes='80px' // 최적화
        className='object-cover rounded-md '
        onError={() => setS(FALLBACK_THUMB)}
      />
    </div>
  );
}

export default function VideoTable() {
  const [items, setItems] = useState<Video[]>([]);
  const [q, setQ] = useState<string>("");
  const [cat, setCat] = useState<CatFilter>("all");
  const [loading, setLoading] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return items.filter((v) => {
      const matchCat = cat === "all" ? true : v.category === cat;
      const kw = q.trim().toLowerCase();
      const matchQ =
        kw.length === 0
          ? true
          : v.title.toLowerCase().includes(kw) ||
            v.category.toLowerCase().includes(kw);
      return matchCat && matchQ;
    });
  }, [items, q, cat]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listVideos({ limit: 100 });
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    try {
      await deleteVideo(id);
      toast.success("삭제되었습니다.");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했어요.");
    }
  };

  return (
    <section className='space-y-4'>
      <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
        <Input
          placeholder='제목 검색'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className='md:w-64'
        />

        <Select
          onValueChange={(v) => setCat(v as CatFilter)}
          defaultValue='all'
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='카테고리' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>모두</SelectItem>
            {CATEGORY_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {CATEGORY_LABELS_KO[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant='outline' onClick={() => load()} disabled={loading}>
          새로고침
        </Button>
      </div>

      <Table>
        <TableCaption>최대 100개까지 표시합니다.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>썸네일</TableHead>
            <TableHead>제목</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>YouTube</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                {v.thumbnailUrl ? (
                  <Thumb src={v.thumbnailUrl} alt={v.title} />
                ) : (
                  <div className='w-20 h-12 bg-slate-100 rounded-md' />
                )}
              </TableCell>

              <TableCell className='font-medium'>{v.title}</TableCell>

              <TableCell>
                <ContentCategoryPill category={v.category} />
              </TableCell>

              <TableCell>
                <a
                  href={v.youtubeUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='text-blue-600 underline'
                >
                  열기
                </a>
              </TableCell>

              <TableCell>
                {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}
              </TableCell>

              <TableCell>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(v.id)}
                >
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className='text-center text-gray-500'>
                {loading ? "불러오는 중..." : "데이터가 없습니다."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
