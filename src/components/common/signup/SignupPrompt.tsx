"use client";

import { useRouter } from "next/navigation";

export default function SignupPrompt() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: "#fef3c7",
        borderTop: "1px solid #facc15",
        padding: "16px 24px",
        textAlign: "center",
        fontSize: 16,
        zIndex: 1000,
      }}
    >
      🙋 더 많은 콘텐츠를 보시려면 회원가입이 필요합니다.
      <button
        onClick={() => router.push("/signup")}
        style={{
          marginLeft: 12,
          background: "#facc15",
          border: "none",
          padding: "6px 12px",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        회원가입 하러가기
      </button>
    </div>
  );
}
