"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import SignupPrompt from "./SignupPrompt";

const mockContents = [
  { id: 1, title: "멘탈케어" },
  { id: 2, title: "다이어트" },
  { id: 3, title: "면역관리" },
  { id: 4, title: "여성질환" },
  { id: 5, title: "안티에이징" },
];

export default function ContentSection() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const viewedIds = useRef<Set<number>>(new Set());

  const viewedRatio = viewCount / mockContents.length;

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
  }, [viewCount, isAnonymous]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          if (entry.isIntersecting && !viewedIds.current.has(id)) {
            viewedIds.current.add(id);
            setViewCount((prev) => prev + 1);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    const items = document.querySelectorAll(".content-item");
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ padding: 16 }}>
      <h2>콘텐츠</h2>

      {mockContents.map((item) => (
        <div
          key={item.id}
          data-id={item.id}
          className='content-item'
          style={{
            height: 600,
            marginBottom: 24,
            border: "1px solid #ddd",
            padding: 12,
          }}
        >
          📺 {item.title}
        </div>
      ))}

      {showPrompt && <SignupPrompt />}
    </section>
  );
}
