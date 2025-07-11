import "./globals.css";
import { ReactNode } from "react";
import AuthObserver from "@/components/AuthObserver";

export const metadata = {
  title: "Meditrip",
  description: "일본 타겟 사전 유입용 웹사이트",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ja'>
      <body>
        <AuthObserver /> {/* 여기에 트리거 추가 */}
        {children}
      </body>
    </html>
  );
}
