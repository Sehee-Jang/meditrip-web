"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createVideo,
  type CreateVideoInput,
} from "@/services/shorts/videos.client";
import {
  CATEGORY_VALUES_TUPLE,
  CATEGORY_KEYS,
  CATEGORY_LABELS_KO,
  type CategoryKey,
} from "@/constants/categories";

// Shorts / watch?v= / embed / youtu.be 모두 지원
function extractYouTubeId(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");

    // youtu.be/VIDEOID
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return id && id.length === 11 ? id : null;
    }

    // *.youtube.com
    if (host.endsWith("youtube.com")) {
      // /watch?v=VIDEOID
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;

      const parts = u.pathname.split("/").filter(Boolean);

      // /embed/VIDEOID
      const embedIdx = parts.indexOf("embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]?.length === 11) {
        return parts[embedIdx + 1];
      }

      // /shorts/VIDEOID
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx !== -1 && parts[shortsIdx + 1]?.length === 11) {
        return parts[shortsIdx + 1];
      }
    }

    return null;
  } catch {
    return null;
  }
}

function buildThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  youtubeUrl: z
    .string()
    .url("유효한 URL을 입력해주세요.")
    .refine(
      (v) => extractYouTubeId(v) !== null,
      "유효한 YouTube URL이어야 해요."
    ),
  // 리터럴 유니언(값은 키 그대로)
  category: z.enum(CATEGORY_VALUES_TUPLE),
  thumbnailUrl: z.string().url("유효한 URL이어야 해요.").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VideoCreateForm({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      youtubeUrl: "",
      category: CATEGORY_VALUES_TUPLE[0],
      thumbnailUrl: "",
    },
  });

  const youtubeUrl = watch("youtubeUrl");

  useEffect(() => {
    const id = extractYouTubeId(youtubeUrl || "");
    if (id) {
      setValue("thumbnailUrl", buildThumbnailUrl(id), { shouldValidate: true });
    }
  }, [youtubeUrl, setValue]);

  const onSubmit = async (values: FormValues) => {
    const id = extractYouTubeId(values.youtubeUrl)!;

    const payload: CreateVideoInput = {
      title: values.title.trim(),
      youtubeUrl: values.youtubeUrl.trim(),
      category: values.category as CategoryKey, // 동일 리터럴 유니언이므로 안전
      thumbnailUrl:
        values.thumbnailUrl && values.thumbnailUrl.length > 0
          ? values.thumbnailUrl
          : buildThumbnailUrl(id),
    };

    try {
      await createVideo(payload);
      toast.success("등록되었습니다.");
      reset();
      onCreated?.();
    } catch (e) {
      console.error(e);
      toast.error("등록에 실패했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 max-w-xl'>
      <div className='space-y-2'>
        <Label htmlFor='title'>제목</Label>
        <Input
          id='title'
          {...register("title")}
          placeholder='예: ‘여름철 면역력 높이는 식단’'
        />
        {errors.title && (
          <p className='text-sm text-red-500'>{errors.title.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='youtubeUrl'>YouTube URL</Label>
        <Input
          id='youtubeUrl'
          {...register("youtubeUrl")}
          placeholder='https://www.youtube.com/shorts/XXXXXXXXXXX'
        />
        {errors.youtubeUrl && (
          <p className='text-sm text-red-500'>{errors.youtubeUrl.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label>카테고리</Label>
        <Select
          defaultValue={CATEGORY_VALUES_TUPLE[0]}
          onValueChange={(v) =>
            setValue("category", v as FormValues["category"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='카테고리를 선택하세요' />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {CATEGORY_LABELS_KO[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className='text-sm text-red-500'>{errors.category.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='thumbnailUrl'>썸네일 URL (자동 생성, 수정 가능)</Label>
        <Input
          id='thumbnailUrl'
          {...register("thumbnailUrl")}
          placeholder='자동으로 채워져요'
        />
        {errors.thumbnailUrl && (
          <p className='text-sm text-red-500'>{errors.thumbnailUrl.message}</p>
        )}
      </div>

      <div className='pt-2'>
        <Button type='submit' disabled={isSubmitting} variant='outline'>
          {isSubmitting ? "등록 중..." : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
