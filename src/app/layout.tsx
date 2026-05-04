import type { Metadata } from "next";
import { pretendard, jetbrainsMono } from "@/lib/fonts";
import LenisProvider from "@/components/layout/LenisProvider";
import Grain from "@/components/layout/Grain";
import "./globals.css";

export const metadata: Metadata = {
  title: "damaged.",
  description: "손상을 안고 살아가는 사람의 기록",
  openGraph: {
    title: "damaged.",
    description: "손상을 안고 살아가는 사람의 기록",
    url: "https://damaged.kr",
    siteName: "damaged.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="font-sans">
        <Grain />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
