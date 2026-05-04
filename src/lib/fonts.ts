import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

export const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920", // Pretendard Variable 의 wght 축 범위
  display: "swap",
  preload: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: "variable",
  display: "swap",
});
