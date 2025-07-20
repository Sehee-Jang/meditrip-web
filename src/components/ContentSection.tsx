"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useTranslations } from "next-intl";
// import SignupPrompt from "./SignupPrompt";
import Image from "next/image";
import Link from "next/link";
import { mockShorts } from "@/data/mockData";
import Container from "./layout/Container";

export default function ContentSection() {
  const t = useTranslations("Theme");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const viewedIds = useRef<Set<number>>(new Set());
  const viewedRatio = viewCount / mockShorts.length;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsAnonymous(user.isAnonymous);
    }
  }, []);

  useEffect(() => {
    if (isAnonymous && viewedRatio >= 1 / 3 && !showPrompt) {
      setShowPrompt(true);
    }
  }, [isAnonymous, viewedRatio, showPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          if (entry.isIntersecting && !viewedIds.current.has(id)) {
            viewedIds.current.add(id);
            setViewCount(viewedIds.current.size);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    const items = document.querySelectorAll(".shorts-item");
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className='py-10 bg-white'>
      <Container>
        <h2 className='text-xl font-bold mb-4'>{t("title")}</h2>

        <div className='flex flex-wrap gap-4 items-start justify-between'>
          {mockShorts.map((item) => {
            const isBlocked = showPrompt && !viewedIds.current.has(item.id);
            return (
              <div
                key={item.id}
                data-id={item.id}
                className='shorts-item w-[150px] border border-black/10 rounded-lg overflow-hidden bg-white relative'
                style={{
                  filter: isBlocked ? "blur(4px)" : "none",
                  pointerEvents: isBlocked ? "none" : "auto",
                  opacity: isBlocked ? 0.5 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                <Link href={item.youtubeUrl} target='_blank'>
                  <div className='relative w-full h-[150px]'>
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='p-2'>
                    <p className='text-sm text-gray-800'>{item.category}</p>
                    <p className='text-sm font-bold mt-1 line-clamp-2'>
                      {item.title}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}

          <div className='hidden md:flex w-[150px] h-[210px] items-center justify-center'>
            <Link
              href='/contents'
              className='px-4 py-2 bg-black text-white text-sm font-medium rounded-md'
            >
              {t("seeMore")}
            </Link>
          </div>
        </div>

        <div className='mt-8 md:hidden flex justify-center'>
          <Link
            href='/contents'
            className='block w-full  text-center px-6 py-2 bg-black text-white text-sm font-medium rounded-md'
          >
            {t("seeMore")}
          </Link>
        </div>

        {/* {showPrompt && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <SignupPrompt />
        </div>
      )} */}
      </Container>
    </section>
  );
}
