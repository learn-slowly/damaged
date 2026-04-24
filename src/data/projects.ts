export interface Project {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  url: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: "2026jp",
    title: "선거 디지털 통합 시스템",
    description: "구글시트로 관리하는 후보 40여명 웹명함+웹페이지",
    screenshot: "/screenshots/2026jp.png",
    url: "https://2026.justice21.org",
    tags: ["정치", "도구"],
  },
  {
    id: "1pyo",
    title: "참관인 모집 플랫폼",
    description: "2026 지방선거 참관인 모집·관리",
    screenshot: "/screenshots/1pyo.png",
    url: "https://1pyo.vercel.app",
    tags: ["정치", "도구"],
  },
  {
    id: "gasout",
    title: "전국 발전소 모니터링",
    description: "발전소 현황 + 기후시민 밸런스게임",
    screenshot: "/screenshots/gasout.png",
    url: "https://gasout.vercel.app",
    tags: ["기후", "콘텐츠"],
  },
  {
    id: "newsclipper",
    title: "AI 일일 뉴스 브리핑",
    description: "Claude API + SQLite + GitHub Actions 자동화",
    screenshot: "/screenshots/newsclipper.png",
    url: "",
    tags: ["자동화", "도구"],
  },
  {
    id: "file-reviewer",
    title: "노동상담 증거파일 검토 도구",
    description: "7,000개 파일 대량 검토 웹앱",
    screenshot: "/screenshots/file-reviewer.png",
    url: "https://exit-file-review.vercel.app",
    tags: ["도구"],
  },
  {
    id: "coupang-out",
    title: "인터랙티브 웹 다큐",
    description: "쿠팡아웃 웹 다큐멘터리",
    screenshot: "/screenshots/coupang-out.png",
    url: "https://www.coupang-out.com",
    tags: ["콘텐츠"],
  },
  {
    id: "myot",
    title: "내옷",
    description: "옷장+스타일 관리 웹앱",
    screenshot: "/screenshots/myot.png",
    url: "https://myot-five.vercel.app",
    tags: ["도구"],
  },
  {
    id: "localflow",
    title: "진주선거정보",
    description: "지역의 선거 관련 현황 및 정보",
    screenshot: "/screenshots/localflow.png",
    url: "https://localflow-blush.vercel.app",
    tags: ["정치", "콘텐츠"],
  },
  {
    id: "kwon",
    title: "권영국.com",
    description: "사회대전환연대회의 대통령후보 권영국 홈페이지",
    screenshot: "/screenshots/kwon.png",
    url: "https://www.xn--3e0b8b410h.com",
    tags: ["정치"],
  },
];
