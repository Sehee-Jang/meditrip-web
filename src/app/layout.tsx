import "./globals.scss";
import Script from "next/script";
import GtmBridge from "@/components/system/GtmBridge";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? "";

  return (
    <html lang='ko'>
      <head>
        {/* 동의 기본값: GTM 로드 이전(beforeInteractive)에 선언 */}
        <Script id='consent-default' strategy='beforeInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
          `}
        </Script>

        {/* GTM 로더: 공식 head 스니펫과 동일 역할 */}
        {gtmId && (
          <Script id='gtm-loader' strategy='afterInteractive'>
            {`
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
        )}
      </head>
      <body>
        {/* JS 비활성 사용자 대응용 noscript 권장 */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height='0'
              width='0'
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* SPA 라우팅 시 page_view 커스텀 이벤트 푸시 */}
        <Suspense fallback={null}>
          <GtmBridge enabled={Boolean(gtmId)} />
        </Suspense>

        {children}
      </body>
    </html>
  );
}
