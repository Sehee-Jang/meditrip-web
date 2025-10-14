import path from "node:path";
import { readdir } from "node:fs/promises";

import type { FC } from "react";
import HeroSectionClient from "./HeroSectionClient";

// public/images/hero 안의 이미지 파일명만 허용할 확장자
const ALLOWED_EXTS = new Set<string>([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

async function getHeroImages(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "images", "hero");
  let files: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => ALLOWED_EXTS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  } catch {
    // 폴더가 없거나 오류가 나도 안전하게 빈 배열 반환
    files = [];
  }
  // public 하위 경로로 변환
  return files.map((name) => `/images/hero/${name}`);
}

const HeroSection: FC = async () => {
  const images = await getHeroImages();
  return <HeroSectionClient images={images} />;
};

export default HeroSection;
