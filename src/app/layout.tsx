import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-sans-kr",
});

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <body className="font-[var(--font-noto-sans-kr)]">{children}</body>
    </html>
  );
}
