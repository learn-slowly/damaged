# damaged.kr 포트폴리오 리디자인 (V2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** damaged.kr 포트폴리오를 V2 디자인 시스템(70% 키네틱 폴리시 + 30% 시네마 다큐)으로 풀 재설계. 메인은 1페이지 long-scroll 다큐(2막 구조) 유지, 프로젝트·사진 챕터는 깊은 라우트(`/works/[slug]`, `/photos/[chapter]`)로 분리.

**Architecture:** Next.js 16 App Router + RSC + `generateStaticParams`로 빌드 시점 prerender. Notion DB(이미 가동 중)는 스키마 일부 확장. 기존 컴포넌트는 전부 폐기 후 새 디렉토리(`layout/`, `home/`, `works/`, `photos/`, `shared/`)로 재구성. 모션은 Lenis(전역) + Framer Motion(선택적) + 자체 IntersectionObserver 훅 혼합.

**Tech Stack:** Next.js 16.2.4, React 19, Tailwind 4, Framer Motion, Lenis, `next/font/local`(Pretendard Variable) + `next/font/google`(JetBrains Mono), `@notionhq/client` blocks API + 자체 렌더러, `@vercel/blob`(이미지, 기존 그대로).

**Verification model:** 이 레포에 테스트 프레임워크가 없고 본질이 시각·인터랙션이라 TDD가 적합하지 않음. 각 task의 verification은 (a) `npx tsc --noEmit` 타입 체크, (b) `npm run lint`, (c) `npm run build`(Notion fetch 포함되니 자연스러운 통합 검증), (d) `npm run dev` + 브라우저 시각 체크(해당 시). 마지막 Phase 8에서 수동 회귀 체크리스트 일괄 점검.

**Spec:** `docs/superpowers/specs/2026-05-04-portfolio-redesign-design.md`

---

## File Structure (목표)

```
src/
├── app/
│   ├── layout.tsx              # 변경 — Lenis/Grain mount, 새 폰트, 메타
│   ├── globals.css             # 변경 — V2 컬러 토큰, 그레인 SVG, 호흡 keyframe
│   ├── page.tsx                # 변경 — Act 1 + Act 2 합성, RSC fetch
│   ├── works/
│   │   ├── page.tsx            # 신규 — 인덱스
│   │   └── [slug]/page.tsx     # 신규 — 다큐 에세이
│   └── photos/
│       ├── page.tsx            # 신규 — 인덱스
│       └── [chapter]/page.tsx  # 신규 — 챕터 상세
│
├── components/
│   ├── layout/
│   │   ├── Grain.tsx           # 신규 — SVG 노이즈 오버레이
│   │   ├── LenisProvider.tsx   # 신규 — 전역 스무스 스크롤
│   │   └── BackNav.tsx         # 신규 — 라우트 좌상단 모노 nav
│   ├── home/
│   │   ├── Hero.tsx            # 신규 — damaged. + but alive + 메타
│   │   ├── Story.tsx           # 신규 — 카피 그대로
│   │   ├── Together.tsx        # 신규 — 카피 그대로 + CTA
│   │   ├── ProjectsList.tsx    # 신규 — 리스트형 + hover 미리보기
│   │   ├── PhotosTeaser.tsx    # 신규 — 풀블리드 + 챕터 리스트
│   │   └── Closing.tsx         # 신규 — B+C 하이브리드
│   ├── works/
│   │   ├── WorkHero.tsx        # 신규
│   │   ├── WorkBody.tsx        # 신규 — Notion blocks 컨테이너
│   │   └── WorkPager.tsx       # 신규 — 이전/다음
│   ├── photos/
│   │   ├── ChapterHero.tsx     # 신규 — Ken Burns 풀블리드
│   │   ├── ChapterGrid.tsx     # 이식 — 현재 Photos.tsx의 메이슨리 로직
│   │   ├── Lightbox.tsx        # 이식 — 현재 Photos.tsx의 라이트박스
│   │   └── ChapterPager.tsx    # 신규
│   └── shared/
│       ├── KenBurns.tsx        # 신규 — 풀블리드 줌·팬
│       ├── MagneticHover.tsx   # 신규 — 마그네틱 wrapper
│       ├── BreathingType.tsx   # 신규 — 가변 폰트 호흡
│       └── notion-blocks/
│           ├── index.tsx       # 신규 — 디스패처
│           ├── Paragraph.tsx
│           ├── Heading.tsx
│           ├── Image.tsx
│           ├── Quote.tsx
│           ├── Code.tsx
│           ├── List.tsx
│           └── Embed.tsx
│
├── lib/
│   ├── notion.ts               # 변경 — getProject, getProjectBlocks, 새 필드
│   ├── motion.ts               # 신규 — reduced-motion / 모바일 감지
│   └── fonts.ts                # 신규 — next/font 인스턴스
│
├── hooks/
│   ├── useScrollReveal.ts      # 유지 (현재 그대로)
│   └── useMagnetic.ts          # 신규
│
└── 폐기:
    └── src/components/{Hero,Story,Projects,Together,Photos,Closing,ProjectCard}.tsx
```

---

## Phase 1 — Foundation

### Task 1: 기존 컴포넌트 폐기 + 새 디렉토리 골격

**Files:**
- Delete: `src/components/Hero.tsx`, `src/components/Story.tsx`, `src/components/Projects.tsx`, `src/components/Together.tsx`, `src/components/Photos.tsx`, `src/components/Closing.tsx`, `src/components/ProjectCard.tsx`
- Create: `src/components/layout/`, `src/components/home/`, `src/components/works/`, `src/components/photos/`, `src/components/shared/`, `src/components/shared/notion-blocks/`
- Create (placeholder): `src/components/layout/.gitkeep` 등 — 빈 디렉토리 유지용 (선택, 다음 task에서 파일 생기면 제거)

- [ ] **Step 1: 기존 컴포넌트 모두 삭제**

```bash
rm src/components/Hero.tsx \
   src/components/Story.tsx \
   src/components/Projects.tsx \
   src/components/Together.tsx \
   src/components/Photos.tsx \
   src/components/Closing.tsx \
   src/components/ProjectCard.tsx
```

- [ ] **Step 2: 새 디렉토리 생성**

```bash
mkdir -p src/components/layout \
         src/components/home \
         src/components/works \
         src/components/photos \
         src/components/shared/notion-blocks
```

- [ ] **Step 3: app/page.tsx 임시 비활성화 (다음 task가 새 page.tsx를 만들기 전 빌드 깨짐 방지)**

`src/app/page.tsx`를 다음으로 교체:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center text-foreground">
      <p className="text-sm">페이지 재구성 중 — Phase 1 진행</p>
    </main>
  );
}
```

- [ ] **Step 4: 타입체크 + 빌드 통과 확인**

```bash
npx tsc --noEmit && npm run lint
```

Expected: 두 명령 모두 0 exit code. (현 시점 빌드는 아직 안 함 — Notion 데이터 fetch가 page.tsx에서 빠졌으니 OK.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "기존 컴포넌트 폐기 + V2 재구성용 새 디렉토리 골격"
```

---

### Task 2: V2 디자인 토큰 (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: globals.css 전면 교체**

`src/app/globals.css`를 다음으로 교체:

```css
@import "tailwindcss";

:root {
  /* V2 베이스 */
  --background: #0a0805;
  --foreground: #ececef;
  --foreground-soft: #c9c0b1;
  --foreground-mute: #a8a8b2;
  --foreground-strong: #ffffff;

  /* V2 카드 / 보더 */
  --card-bg: #14110d;
  --card-border: #2a241c;

  /* V2 액센트 */
  --accent-amber: #d4a16d;
  --accent-oxblood: #9c2a2a;
  --accent: var(--accent-amber);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-foreground-soft: var(--foreground-soft);
  --color-foreground-mute: var(--foreground-mute);
  --color-foreground-strong: var(--foreground-strong);
  --color-card-bg: var(--card-bg);
  --color-card-border: var(--card-border);
  --color-accent: var(--accent);
  --color-accent-amber: var(--accent-amber);
  --color-accent-oxblood: var(--accent-oxblood);

  --font-sans: var(--font-pretendard);
  --font-mono: var(--font-jetbrains-mono);
}

html, body {
  background: var(--background);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-pretendard), ui-sans-serif, system-ui, sans-serif;
}

/* 기본 스크롤 reveal — 기존 useScrollReveal 훅과 짝 */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* V2 그라디언트 액센트 (텍스트용) */
.text-accent-gradient {
  background: linear-gradient(90deg, var(--accent-amber), var(--accent-oxblood));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "V2 디자인 토큰 — 잉크블랙 베이스 + 앰버/옥스블러드 액센트"
```

---

### Task 3: 폰트 셋업 (Pretendard Variable + JetBrains Mono Variable)

**Files:**
- Create: `public/fonts/PretendardVariable.woff2` (다운로드)
- Create: `src/lib/fonts.ts`

**전제**: Pretendard Variable는 깃허브 릴리즈에서 다운로드, JetBrains Mono는 `next/font/google`로 self-host (Google이 variable 지원).

- [ ] **Step 1: Pretendard Variable woff2 다운로드**

```bash
mkdir -p public/fonts
curl -L -o public/fonts/PretendardVariable.woff2 \
  https://github.com/orioncactus/pretendard/raw/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2
```

검증:

```bash
ls -lh public/fonts/PretendardVariable.woff2
```

Expected: 약 1MB 내외 파일 존재.

- [ ] **Step 2: src/lib/fonts.ts 작성**

`src/lib/fonts.ts` 신규 생성:

```ts
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
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add public/fonts/PretendardVariable.woff2 src/lib/fonts.ts
git commit -m "Pretendard Variable + JetBrains Mono Variable self-host 셋업"
```

---

### Task 4: Grain 오버레이 컴포넌트

**Files:**
- Create: `src/components/layout/Grain.tsx`

- [ ] **Step 1: Grain.tsx 작성**

```tsx
export default function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.07] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        backgroundSize: "200px 200px",
      }}
    />
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Grain.tsx
git commit -m "Grain 오버레이 — SVG 노이즈, opacity .07, mix-blend-overlay"
```

---

### Task 5: lib/motion.ts — reduced-motion / 모바일 감지

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1: motion.ts 작성**

```ts
"use client";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/motion.ts
git commit -m "motion.ts — reduced-motion / 터치·모바일 감지 유틸"
```

---

### Task 6: Lenis 설치 + LenisProvider

**Files:**
- Modify: `package.json` (lenis 추가)
- Create: `src/components/layout/LenisProvider.tsx`

- [ ] **Step 1: lenis 설치**

```bash
npm install lenis
```

- [ ] **Step 2: LenisProvider 작성**

`src/components/layout/LenisProvider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion, isTouchDevice } from "@/lib/motion";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/layout/LenisProvider.tsx
git commit -m "Lenis 도입 + LenisProvider — 데스크톱 전역 스무스 스크롤"
```

---

### Task 7: app/layout.tsx 리셋 — 폰트·그레인·Lenis 마운트

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsx 교체**

```tsx
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
```

- [ ] **Step 2: 빌드 확인 (Notion 환경변수 + .env.local 있다고 가정)**

```bash
npm run build
```

Expected: 빌드 성공. 임시 page.tsx만 prerender.

- [ ] **Step 3: dev server 시각 체크**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열고 확인:
- 배경 잉크블랙 톤 (`#0a0805`)
- 그레인 노이즈 오버레이 보임
- 한글 텍스트가 Pretendard로 렌더 (시스템 폰트 아님)

문제 없으면 Ctrl+C로 dev server 종료.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "layout.tsx — Pretendard/JetBrains 마운트, Grain·Lenis 전역 적용"
```

---

## Phase 2 — Notion 데이터 + Blocks 렌더러

### Task 8: Notion DB 스키마 변경 가이드 (수동 작업 안내)

**Files:**
- Create: `docs/notion-schema.md`

**참고**: 이 task는 코드 변경 없음. 사용자가 Notion에서 수동으로 처리할 가이드 문서. 실제 콘텐츠 채우기는 Phase 8 후 출시 전.

- [ ] **Step 1: 가이드 문서 작성**

`docs/notion-schema.md` 신규 생성:

```markdown
# Notion DB 스키마 변경 가이드

리디자인 V2 구현 시 다음 필드를 Notion에서 추가/사용. 코드는 필드가 없어도 안전 fallback 처리.

## Projects DB (NOTION_PROJECTS_DS)

기존 필드 유지 + 다음 추가:

| 필드명 | 타입 | 용도 |
|--------|------|------|
| `역할` | rich_text | "기획·개발", "PM", "리서치·디자인" 등 |
| `기간` | rich_text | "2024~", "2023.06~12" 등 |

추가로 — **각 프로젝트의 Notion 페이지 본문**에 다큐 에세이를 직접 작성. 코드는 페이지 본문(blocks) 을 자동으로 fetch해서 `/works/[slug]` body에 렌더. block 종류: heading, paragraph, image, quote, code, list, embed.

## Photos DB (NOTION_PHOTOS_DS)

기존 필드 유지 + 다음 추가:

| 필드명 | 타입 | 용도 |
|--------|------|------|
| `대표` | checkbox | 메인 페이지 풀블리드 히어로로 노출할 사진. 챕터당 1장 권장 |
| `챕터 서문` | rich_text | (옵션) 같은 챕터의 첫 사진에 작성하면 챕터 풀블리드 위에 노출 |

대표 마킹 0장 챕터는 코드가 첫 사진을 자동 fallback.

## 출시 전 채우기 우선순위

1. 모든 프로젝트의 `역할` / `기간` (9개)
2. 사진 챕터별 `대표` 사진 마킹 (8개 챕터)
3. 프로젝트 페이지 본문 — 점진적 (출시 시점엔 3~4개라도 OK)
4. 챕터 서문 — 필요한 챕터만
```

- [ ] **Step 2: Commit**

```bash
git add docs/notion-schema.md
git commit -m "Notion 스키마 변경 가이드 — Projects/Photos 추가 필드"
```

---

### Task 9: lib/notion.ts 확장 — 새 필드 + getProject + getProjectBlocks

**Files:**
- Modify: `src/lib/notion.ts`

- [ ] **Step 1: notion.ts 전체 교체**

```ts
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export interface NotionProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  screenshot: string;
  tags: string[];
  order: number;
  role: string;
  period: string;
}

export interface NotionPhoto {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  location: string;
  date: string;
  order: number;
  isHero: boolean;
  chapterIntro: string;
}

export interface PhotoChapter {
  chapter: string;
  photos: NotionPhoto[];
  heroPhoto: NotionPhoto;
  intro: string;
}

function getPropertyValue(property: any): any {
  switch (property.type) {
    case "title":
      return property.title.map((t: any) => t.plain_text).join("");
    case "rich_text":
      return property.rich_text.map((t: any) => t.plain_text).join("");
    case "url":
      return property.url ?? "";
    case "checkbox":
      return property.checkbox;
    case "number":
      return property.number ?? 0;
    case "select":
      return property.select?.name ?? "";
    case "multi_select":
      return property.multi_select.map((s: any) => s.name);
    case "files":
      if (property.files.length === 0) return "";
      const file = property.files[0];
      return file.type === "file" ? file.file.url : file.external?.url ?? "";
    case "date":
      return property.date?.start ?? "";
    default:
      return "";
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function queryAll(dataSourceId: string, filter: any, sorts: any[]) {
  const all: any[] = [];
  let cursor: string | undefined;
  do {
    const response = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter,
      sorts,
      start_cursor: cursor,
    });
    all.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return all;
}

export async function getProjects(): Promise<NotionProject[]> {
  const results = await queryAll(
    process.env.NOTION_PROJECTS_DS!,
    { property: "공개", checkbox: { equals: true } },
    [{ property: "순서", direction: "ascending" }]
  );

  return results.map((page: any) => {
    const title = getPropertyValue(page.properties["제목"]);
    return {
      id: page.id,
      slug: slugify(title),
      title,
      description: getPropertyValue(page.properties["설명"]),
      url: getPropertyValue(page.properties["URL"]),
      screenshot: getPropertyValue(page.properties["스크린샷"]),
      tags: getPropertyValue(page.properties["태그"]),
      order: getPropertyValue(page.properties["순서"]),
      role: getPropertyValue(page.properties["역할"]),
      period: getPropertyValue(page.properties["기간"]),
    };
  });
}

export async function getProject(slug: string): Promise<NotionProject | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProjectBlocks(pageId: string): Promise<any[]> {
  const all: any[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    all.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return all;
}

export async function getPhotos(): Promise<PhotoChapter[]> {
  const results = await queryAll(
    process.env.NOTION_PHOTOS_DS!,
    { property: "공개", checkbox: { equals: true } },
    [{ property: "순서", direction: "ascending" }]
  );

  type WithChapter = NotionPhoto & { chapter: string };
  const photos: WithChapter[] = results.map((page: any) => ({
    id: page.id,
    title: getPropertyValue(page.properties["제목"]),
    imageUrl: getPropertyValue(page.properties["이미지"]),
    description: getPropertyValue(page.properties["설명"]),
    location: getPropertyValue(page.properties["장소"]),
    date: getPropertyValue(page.properties["촬영일"]),
    order: getPropertyValue(page.properties["순서"]),
    chapter: getPropertyValue(page.properties["챕터"]),
    isHero: Boolean(getPropertyValue(page.properties["대표"])),
    chapterIntro: getPropertyValue(page.properties["챕터 서문"]),
  }));

  const grouped = new Map<string, NotionPhoto[]>();
  for (const { chapter, ...photo } of photos) {
    if (!chapter) continue;
    if (!grouped.has(chapter)) grouped.set(chapter, []);
    grouped.get(chapter)!.push(photo);
  }

  return Array.from(grouped.entries())
    .map(([chapter, list]) => {
      const heroPhoto = list.find((p) => p.isHero) ?? list[0];
      const intro = list.find((p) => p.chapterIntro)?.chapterIntro ?? "";
      return { chapter, photos: list, heroPhoto, intro };
    })
    .sort((a, b) => a.chapter.localeCompare(b.chapter));
}

export function chapterSlug(chapter: string): string {
  return slugify(chapter);
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/notion.ts
git commit -m "notion.ts 확장 — 역할/기간/대표/챕터 서문 필드, getProject·getProjectBlocks·chapterSlug"
```

---

### Task 10: Notion blocks 렌더러 — 디스패처 + Paragraph + Heading

**Files:**
- Create: `src/components/shared/notion-blocks/index.tsx`
- Create: `src/components/shared/notion-blocks/Paragraph.tsx`
- Create: `src/components/shared/notion-blocks/Heading.tsx`

- [ ] **Step 1: 디스패처 작성**

`src/components/shared/notion-blocks/index.tsx`:

```tsx
import Paragraph from "./Paragraph";
import Heading from "./Heading";
import NotionImage from "./Image";
import Quote from "./Quote";
import Code from "./Code";
import List from "./List";
import Embed from "./Embed";

export default function NotionBlocks({ blocks }: { blocks: any[] }) {
  // 인접한 같은 종류 list block은 하나의 List로 묶음
  const grouped: Array<{ type: string; items: any[] }> = [];
  for (const b of blocks) {
    const t = b.type;
    if (t === "bulleted_list_item" || t === "numbered_list_item") {
      const last = grouped[grouped.length - 1];
      if (last && last.type === t) {
        last.items.push(b);
        continue;
      }
      grouped.push({ type: t, items: [b] });
    } else {
      grouped.push({ type: t, items: [b] });
    }
  }

  return (
    <div className="prose-notion space-y-6 max-w-[680px]">
      {grouped.map((g, i) => {
        const b = g.items[0];
        switch (g.type) {
          case "paragraph":
            return <Paragraph key={i} block={b} />;
          case "heading_1":
          case "heading_2":
          case "heading_3":
            return <Heading key={i} block={b} />;
          case "image":
            return <NotionImage key={i} block={b} />;
          case "quote":
            return <Quote key={i} block={b} />;
          case "code":
            return <Code key={i} block={b} />;
          case "bulleted_list_item":
          case "numbered_list_item":
            return <List key={i} type={g.type} items={g.items} />;
          case "embed":
          case "video":
          case "bookmark":
            return <Embed key={i} block={b} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export function richText(rt: any[]): React.ReactNode {
  if (!rt) return null;
  return rt.map((t: any, i: number) => {
    let node: React.ReactNode = t.plain_text;
    const ann = t.annotations ?? {};
    if (ann.code) node = <code className="rounded bg-card-bg px-1.5 py-0.5 font-mono text-[0.9em]">{node}</code>;
    if (ann.bold) node = <strong className="font-medium text-foreground-strong">{node}</strong>;
    if (ann.italic) node = <em>{node}</em>;
    if (ann.underline) node = <u>{node}</u>;
    if (ann.strikethrough) node = <s>{node}</s>;
    if (t.href) node = <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-4 hover:underline">{node}</a>;
    return <span key={i}>{node}</span>;
  });
}
```

- [ ] **Step 2: Paragraph.tsx 작성**

```tsx
import { richText } from "./index";

export default function Paragraph({ block }: { block: any }) {
  const rt = block.paragraph?.rich_text ?? [];
  if (rt.length === 0) return <p className="h-4" aria-hidden="true" />;
  return (
    <p className="text-base font-light leading-[1.85] text-foreground md:text-lg">
      {richText(rt)}
    </p>
  );
}
```

- [ ] **Step 3: Heading.tsx 작성**

```tsx
import { richText } from "./index";

export default function Heading({ block }: { block: any }) {
  const level = block.type as "heading_1" | "heading_2" | "heading_3";
  const rt = block[level]?.rich_text ?? [];
  const cls = {
    heading_1: "text-2xl font-light text-foreground-strong md:text-3xl",
    heading_2: "text-xl font-light text-foreground-strong md:text-2xl",
    heading_3: "text-lg font-light text-foreground-strong md:text-xl",
  }[level];
  const Tag = ({ heading_1: "h2", heading_2: "h3", heading_3: "h4" } as const)[level];
  return <Tag className={`${cls} mt-12 mb-4 tracking-tight`}>{richText(rt)}</Tag>;
}
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass. (Image/Quote/Code/List/Embed가 다음 task에서 추가되니 import error는 없어야 함 — 디스패처가 import만 하고 안 쓰는 건 OK 가 아니니, 이 task에서 stub 파일들을 같이 만들어야 함.)

- [ ] **Step 5: 다음 task가 추가할 컴포넌트의 stub 작성 (import 에러 방지)**

`src/components/shared/notion-blocks/Image.tsx`:
```tsx
export default function NotionImage(_: { block: any }) { return null; }
```

`src/components/shared/notion-blocks/Quote.tsx`:
```tsx
export default function Quote(_: { block: any }) { return null; }
```

`src/components/shared/notion-blocks/Code.tsx`:
```tsx
export default function Code(_: { block: any }) { return null; }
```

`src/components/shared/notion-blocks/List.tsx`:
```tsx
export default function List(_: { type: string; items: any[] }) { return null; }
```

`src/components/shared/notion-blocks/Embed.tsx`:
```tsx
export default function Embed(_: { block: any }) { return null; }
```

- [ ] **Step 6: 타입 체크 다시**

```bash
npx tsc --noEmit && npm run lint
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/notion-blocks/
git commit -m "Notion blocks 디스패처 + Paragraph/Heading + 나머지 stub"
```

---

### Task 11: Notion blocks — Image + Quote + Code 구현

**Files:**
- Modify: `src/components/shared/notion-blocks/Image.tsx`
- Modify: `src/components/shared/notion-blocks/Quote.tsx`
- Modify: `src/components/shared/notion-blocks/Code.tsx`

- [ ] **Step 1: Image.tsx 작성**

```tsx
import Image from "next/image";
import { richText } from "./index";

export default function NotionImage({ block }: { block: any }) {
  const img = block.image;
  const url = img?.type === "external" ? img.external.url : img?.file?.url;
  if (!url) return null;
  const caption = img.caption ?? [];

  return (
    <figure className="my-10 -mx-6 md:mx-0">
      <div className="relative w-full overflow-hidden rounded-lg bg-card-bg">
        <Image
          src={url}
          alt={caption.map((c: any) => c.plain_text).join("") || ""}
          width={1280}
          height={720}
          className="h-auto w-full object-contain"
          sizes="(max-width: 768px) 100vw, 720px"
        />
      </div>
      {caption.length > 0 && (
        <figcaption className="mt-3 text-center text-xs font-light text-foreground-mute md:text-sm">
          {richText(caption)}
        </figcaption>
      )}
    </figure>
  );
}
```

**참고**: Notion `file` URL은 1시간 만료되므로 빌드 시점 fetch + prerender 패턴이 필수. ISR 없이 매 배포 재빌드.

- [ ] **Step 2: Quote.tsx 작성**

```tsx
import { richText } from "./index";

export default function Quote({ block }: { block: any }) {
  const rt = block.quote?.rich_text ?? [];
  return (
    <blockquote className="my-10 border-l-2 border-accent-amber pl-6 text-base font-light italic leading-[1.85] text-foreground-soft md:text-lg">
      {richText(rt)}
    </blockquote>
  );
}
```

- [ ] **Step 3: Code.tsx 작성**

```tsx
import { richText } from "./index";

export default function Code({ block }: { block: any }) {
  const rt = block.code?.rich_text ?? [];
  const language = block.code?.language ?? "";
  return (
    <pre className="my-8 overflow-x-auto rounded-lg border border-card-border bg-card-bg p-4 font-mono text-sm text-foreground-soft">
      {language && (
        <div className="mb-2 text-xs uppercase tracking-widest text-foreground-mute">
          / {language}
        </div>
      )}
      <code>{richText(rt)}</code>
    </pre>
  );
}
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit && npm run lint
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/notion-blocks/Image.tsx src/components/shared/notion-blocks/Quote.tsx src/components/shared/notion-blocks/Code.tsx
git commit -m "Notion blocks — Image / Quote / Code 렌더러"
```

---

### Task 12: Notion blocks — List + Embed 구현

**Files:**
- Modify: `src/components/shared/notion-blocks/List.tsx`
- Modify: `src/components/shared/notion-blocks/Embed.tsx`

- [ ] **Step 1: List.tsx 작성**

```tsx
import { richText } from "./index";

export default function List({ type, items }: { type: string; items: any[] }) {
  const Tag = type === "numbered_list_item" ? "ol" : "ul";
  const cls =
    type === "numbered_list_item"
      ? "list-decimal pl-6 space-y-2 text-base font-light leading-[1.85] text-foreground md:text-lg marker:text-foreground-mute"
      : "list-disc pl-6 space-y-2 text-base font-light leading-[1.85] text-foreground md:text-lg marker:text-foreground-mute";

  return (
    <Tag className={cls}>
      {items.map((b, i) => {
        const rt = b[type]?.rich_text ?? [];
        return <li key={i}>{richText(rt)}</li>;
      })}
    </Tag>
  );
}
```

- [ ] **Step 2: Embed.tsx 작성**

```tsx
export default function Embed({ block }: { block: any }) {
  const url =
    block.embed?.url ?? block.video?.external?.url ?? block.bookmark?.url ?? "";
  if (!url) return null;

  // YouTube embed
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) {
    return (
      <div className="my-10 aspect-video w-full overflow-hidden rounded-lg bg-card-bg">
        <iframe
          src={`https://www.youtube.com/embed/${yt[1]}`}
          title="YouTube video"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // bookmark / 일반 링크
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-10 block rounded-lg border border-card-border bg-card-bg p-4 text-sm text-accent transition-colors hover:border-accent-amber"
    >
      / {url.replace(/^https?:\/\//, "")}
    </a>
  );
}
```

- [ ] **Step 3: 타입 체크 + 빌드**

```bash
npx tsc --noEmit && npm run lint
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/notion-blocks/List.tsx src/components/shared/notion-blocks/Embed.tsx
git commit -m "Notion blocks — List / Embed 렌더러"
```

---

## Phase 3 — 메인 Act 1 (서사)

### Task 13: BreathingType 공유 컴포넌트

**Files:**
- Create: `src/components/shared/BreathingType.tsx`

- [ ] **Step 1: BreathingType 작성**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  /** 호흡 주기(ms). 기본 5000 */
  period?: number;
  /** wght 변동 진폭. 기본 25 (예: 300↔325) */
  weightAmp?: number;
  /** 베이스 wght. 기본 300 */
  baseWeight?: number;
  /** letter-spacing 진폭(em). 기본 0.005 */
  trackingAmp?: number;
}

export default function BreathingType({
  children,
  className = "",
  period = 5000,
  weightAmp = 25,
  baseWeight = 300,
  trackingAmp = 0.005,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) % period) / period; // 0..1
      const phase = (1 - Math.cos(2 * Math.PI * t)) / 2; // 0..1 부드러운
      const w = baseWeight + weightAmp * phase;
      const ls = (trackingAmp * (phase - 0.5) * 2).toFixed(4); // -amp..+amp
      el.style.fontVariationSettings = `"wght" ${w.toFixed(1)}`;
      el.style.letterSpacing = `${ls}em`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [period, weightAmp, baseWeight, trackingAmp]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariationSettings: `"wght" ${baseWeight}` }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/BreathingType.tsx
git commit -m "BreathingType 공유 — 가변 폰트 wght+letter-spacing 호흡 (RAF, reduced-motion off)"
```

---

### Task 14: Hero 컴포넌트 (메인)

**Files:**
- Create: `src/components/home/Hero.tsx`

- [ ] **Step 1: Hero 작성**

```tsx
"use client";

import { useEffect, useState } from "react";
import BreathingType from "@/components/shared/BreathingType";

export default function Hero() {
  const [showAlive, setShowAlive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowAlive(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <p className="absolute right-6 top-6 font-mono text-xs uppercase tracking-[0.2em] text-foreground-mute md:text-sm">
        / 백아형 · seoul · 2026
      </p>

      <h1 className="text-7xl tracking-tight text-foreground-strong md:text-[10rem]">
        <BreathingType>damaged.</BreathingType>
      </h1>

      <p
        className={`mt-6 text-lg font-light text-accent-amber transition-opacity duration-[1500ms] md:text-xl ${
          showAlive ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!showAlive}
      >
        but alive.
      </p>

      <div className="absolute bottom-12 animate-bounce text-foreground-mute" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "Hero — damaged. 호흡 + but alive 페이드인(2s) + 우상단 모노 메타"
```

---

### Task 15: Story / Together 컴포넌트

**Files:**
- Create: `src/components/home/Story.tsx`
- Create: `src/components/home/Together.tsx`

- [ ] **Step 1: Story 작성**

```tsx
"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "10년 동안 여섯 번 수술대에 올랐다.",
  "떼어낼 수 있는 건 다 떼어냈는데,",
  "원인은 유전자에 있었다.",
  "",
  "그 사이에 코드를 짜기 시작했다.",
  "코드를 읽을 줄 모른 채로.",
];

export default function Story() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="reveal mb-12 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / story
      </p>
      <div className="max-w-[650px] space-y-4">
        {lines.map((line, i) =>
          line === "" ? (
            <div key={i} className="h-8" />
          ) : (
            <p
              key={i}
              ref={setRef(i + 1)}
              className="reveal text-lg font-light leading-relaxed text-foreground md:text-xl"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              {line}
            </p>
          )
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Together 작성**

```tsx
"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const lines = [
  "혼자 만들 수 있다는 걸 알았다.",
  "그 다음 질문은 하나였다.",
  '"이걸 다른 사람도 할 수 있게 하려면?"',
];

export default function Together() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="reveal mb-12 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / together
      </p>
      <div className="max-w-[650px] space-y-4">
        {lines.map((line, i) => (
          <p
            key={i}
            ref={setRef(i + 1)}
            className="reveal text-lg font-light leading-relaxed text-foreground md:text-xl"
            style={{ transitionDelay: `${(i + 1) * 100}ms` }}
          >
            {line}
          </p>
        ))}
        <div
          ref={setRef(lines.length + 1)}
          className="reveal pt-12"
          style={{ transitionDelay: `${(lines.length + 1) * 100}ms` }}
        >
          <a
            href="https://handson.ai.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block rounded-lg border border-card-border bg-card-bg px-8 py-6 transition-all duration-300 hover:border-accent-amber hover:shadow-lg hover:shadow-black/30"
          >
            <p className="text-xl font-light tracking-tight text-foreground-strong">손에 잡히는 미래</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent-amber">
              handson.ai.kr →
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit && npm run lint
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Story.tsx src/components/home/Together.tsx
git commit -m "Story / Together — 카피 그대로, V2 톤 + 모노 섹션 라벨"
```

---

## Phase 4 — 메인 Act 2 (작업)

### Task 16: useMagnetic 훅 + MagneticHover 공유 컴포넌트

**Files:**
- Create: `src/hooks/useMagnetic.ts`
- Create: `src/components/shared/MagneticHover.tsx`

- [ ] **Step 1: useMagnetic 훅 작성**

```ts
"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion, isTouchDevice } from "@/lib/motion";

export function useMagnetic<T extends HTMLElement = HTMLDivElement>(
  strength = 6
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isTouchDevice()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let tx = 0;
    let ty = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      tx = Math.max(-1, Math.min(1, dx)) * strength;
      ty = Math.max(-1, Math.min(1, dy)) * strength;
      schedule();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      schedule();
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
        rafId = 0;
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.style.transition = "transform 200ms cubic-bezier(.2,.8,.2,1)";

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = "";
      el.style.transition = "";
    };
  }, [strength]);

  return ref;
}
```

- [ ] **Step 2: MagneticHover 컴포넌트 작성**

```tsx
"use client";

import { useMagnetic } from "@/hooks/useMagnetic";

export default function MagneticHover({
  children,
  strength = 6,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useMagnetic<HTMLDivElement>(strength);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMagnetic.ts src/components/shared/MagneticHover.tsx
git commit -m "useMagnetic 훅 + MagneticHover wrapper — 마우스 근접 ±6px 끌림"
```

---

### Task 17: ProjectsList 컴포넌트 (메인 티저)

**Files:**
- Create: `src/components/home/ProjectsList.tsx`

- [ ] **Step 1: ProjectsList 작성**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { type NotionProject } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

export default function ProjectsList({ projects }: { projects: NotionProject[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const setRef = useScrollRevealMultiple(0.2);

  const hoveredProject = projects.find((p) => p.id === hovered);

  return (
    <section className="relative flex min-h-screen flex-col px-6 py-32">
      <p className="reveal mb-16 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / works {String(projects.length).padStart(2, "0")}
      </p>

      <div className="relative mx-auto w-full max-w-[1100px]">
        {/* hover 미리보기 (데스크톱만, sticky 우측) */}
        <div className="pointer-events-none fixed right-12 top-1/2 hidden -translate-y-1/2 transition-opacity duration-500 md:block">
          {hoveredProject?.screenshot && (
            <div className="relative aspect-[16/10] w-[360px] overflow-hidden rounded-lg border border-card-border bg-card-bg">
              <Image
                src={hoveredProject.screenshot}
                alt={hoveredProject.title}
                fill
                sizes="360px"
                className="object-cover object-top"
              />
            </div>
          )}
        </div>

        <ul className="divide-y divide-card-border">
          {projects.map((p, i) => (
            <li
              key={p.id}
              ref={setRef(i + 1)}
              className="reveal group"
              style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
            >
              <Link
                href={`/works/${p.slug}`}
                className="grid grid-cols-[40px_1fr_auto] items-baseline gap-6 py-6 transition-colors duration-300 hover:bg-card-bg/30 md:grid-cols-[60px_1fr_200px_auto] md:gap-10"
              >
                <span className="font-mono text-xs text-foreground-mute md:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-2xl">
                    {p.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm font-light text-foreground-soft md:hidden">
                    {p.description}
                  </p>
                </div>
                <p className="hidden truncate text-sm font-light text-foreground-soft md:block">
                  {p.description}
                </p>
                <span className="font-mono text-xs uppercase tracking-widest text-foreground-mute group-hover:text-accent-amber">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ProjectsList.tsx
git commit -m "ProjectsList — 리스트형 티저, hover 시 우측 sticky 미리보기, 모바일은 텍스트만"
```

---

### Task 18: KenBurns 공유 컴포넌트

**Files:**
- Create: `src/components/shared/KenBurns.tsx`

- [ ] **Step 1: KenBurns 작성**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

interface Props {
  src: string;
  alt: string;
  /** 9000ms 한 사이클 기본 */
  duration?: number;
  className?: string;
  priority?: boolean;
}

export default function KenBurns({ src, alt, duration = 9000, className = "", priority = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const start = performance.now();
    const dirX = Math.random() > 0.5 ? 1 : -1;
    const dirY = Math.random() > 0.5 ? 1 : -1;

    const tick = (now: number) => {
      const t = ((now - start) % duration) / duration; // 0..1
      const phase = (1 - Math.cos(2 * Math.PI * t)) / 2; // 0..1
      const scale = 1.06 + 0.04 * phase; // 1.06..1.10
      const px = dirX * 1.5 * (phase - 0.5) * 2; // -1.5..+1.5 %
      const py = dirY * 1.0 * (phase - 0.5) * 2;
      el.style.transform = `scale(${scale.toFixed(4)}) translate(${px.toFixed(2)}%, ${py.toFixed(2)}%)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={ref} className="absolute inset-0" style={{ transform: "scale(1.06)" }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/KenBurns.tsx
git commit -m "KenBurns 공유 — 풀블리드 9초 줌·팬, reduced-motion off"
```

---

### Task 19: PhotosTeaser 컴포넌트 (메인)

**Files:**
- Create: `src/components/home/PhotosTeaser.tsx`

- [ ] **Step 1: PhotosTeaser 작성**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { type PhotoChapter, chapterSlug } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";
import KenBurns from "@/components/shared/KenBurns";

export default function PhotosTeaser({ chapters }: { chapters: PhotoChapter[] }) {
  const heroChapters = chapters.filter((c) => c.heroPhoto?.isHero).slice(0, 2);
  const fallbackHero = heroChapters.length === 0 ? chapters.slice(0, 1) : [];
  const featured = [...heroChapters, ...fallbackHero];
  const featuredIds = new Set(featured.map((c) => c.chapter));
  const rest = chapters.filter((c) => !featuredIds.has(c.chapter));

  const [hovered, setHovered] = useState<string | null>(null);
  const setRef = useScrollRevealMultiple(0.2);

  const splitChapter = (label: string) => {
    const m = label.match(/^(\d+)\s+(.+)$/);
    return m ? { number: m[1], title: m[2] } : { number: "", title: label };
  };

  return (
    <section className="relative px-0 py-32">
      <p className="reveal mb-16 px-6 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm" ref={setRef(0)}>
        / photos {String(chapters.length).padStart(2, "0")}
      </p>

      {/* 풀블리드 히어로 챕터 */}
      <div className="space-y-2">
        {featured.map((c, i) => {
          const { number, title } = splitChapter(c.chapter);
          return (
            <Link
              key={c.chapter}
              href={`/photos/${chapterSlug(c.chapter)}`}
              ref={setRef(i + 1) as any}
              className="reveal group relative block h-[80vh] w-full overflow-hidden"
              style={{ transitionDelay: `${(i + 1) * 100}ms` }}
            >
              <KenBurns src={c.heroPhoto.imageUrl} alt={c.heroPhoto.title || c.chapter} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
              <div className="absolute bottom-12 left-6 right-6 md:left-12">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-mute md:text-sm">
                  / chapter {number}
                </p>
                <h3 className="mt-3 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
                  {title}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-accent-amber group-hover:underline">
                  {c.photos.length}장 →
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 나머지 챕터 리스트 */}
      <div className="relative mx-auto mt-16 w-full max-w-[1100px] px-6">
        <div className="pointer-events-none fixed right-12 top-1/2 hidden -translate-y-1/2 transition-opacity duration-500 md:block">
          {hovered &&
            (() => {
              const c = rest.find((c) => c.chapter === hovered);
              if (!c?.heroPhoto?.imageUrl) return null;
              return (
                <div className="relative aspect-[3/4] w-[280px] overflow-hidden rounded-lg border border-card-border bg-card-bg">
                  <Image src={c.heroPhoto.imageUrl} alt={c.chapter} fill sizes="280px" className="object-cover" />
                </div>
              );
            })()}
        </div>

        <ul className="divide-y divide-card-border">
          {rest.map((c, i) => {
            const { number, title } = splitChapter(c.chapter);
            return (
              <li
                key={c.chapter}
                ref={setRef(featured.length + i + 1) as any}
                className="reveal group"
                style={{ transitionDelay: `${(featured.length + i + 1) * 80}ms` }}
                onMouseEnter={() => setHovered(c.chapter)}
                onMouseLeave={() => setHovered((h) => (h === c.chapter ? null : h))}
              >
                <Link
                  href={`/photos/${chapterSlug(c.chapter)}`}
                  className="grid grid-cols-[40px_1fr_auto] items-baseline gap-6 py-6 transition-colors duration-300 hover:bg-card-bg/30 md:grid-cols-[60px_1fr_120px_auto] md:gap-10"
                >
                  <span className="font-mono text-xs text-foreground-mute md:text-sm">{number}</span>
                  <h3 className="text-xl font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-2xl">
                    {title}
                  </h3>
                  <p className="hidden font-mono text-xs uppercase tracking-widest text-foreground-mute md:block">
                    {c.photos.length}장
                  </p>
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground-mute group-hover:text-accent-amber">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/PhotosTeaser.tsx
git commit -m "PhotosTeaser — 대표 챕터 풀블리드(KenBurns) + 나머지 챕터 리스트(hover 미리보기)"
```

---

### Task 20: Closing 컴포넌트 (B+C 하이브리드)

**Files:**
- Create: `src/components/home/Closing.tsx`

- [ ] **Step 1: Closing 작성**

```tsx
"use client";

import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";

const monologue = [
  "[ 출시 전 채울 자리 ]",
  // 사용자가 직접 작성. 2~4줄. "but alive"에 대한 답·해석.
];

export default function Closing() {
  const setRef = useScrollRevealMultiple(0.3);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32">
      {/* 한 호흡 어둠 — 본문 위 빈 공간 */}
      <div className="h-[20vh]" aria-hidden="true" />

      {/* 본문 (B 다큐 모놀로그) */}
      <div className="max-w-[600px] space-y-3 text-center">
        {monologue.map((line, i) => (
          <p
            key={i}
            ref={setRef(i)}
            className="reveal text-lg font-light leading-relaxed text-foreground md:text-xl"
            style={{ transitionDelay: `${i * 200}ms` }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* 한 박자 정지 */}
      <div className="h-[10vh]" aria-hidden="true" />

      {/* 메타 (C 키네틱 폴리시) */}
      <div
        ref={setRef(monologue.length)}
        className="reveal flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm"
        style={{ transitionDelay: `${monologue.length * 200 + 400}ms` }}
      >
        <p>/ end of file</p>
        <p>
          <a href="mailto:redoutk@gmail.com" className="hover:text-accent-amber">redoutk@gmail.com</a>
          {" · "}
          damaged.kr
          {" · "}
          2026
        </p>
      </div>
    </section>
  );
}
```

**참고**: monologue 배열의 placeholder 줄은 출시 전 사용자가 실제 카피로 교체. 이 task에선 placeholder 그대로 둠.

- [ ] **Step 2: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/Closing.tsx
git commit -m "Closing — B+C 하이브리드 (모놀로그 placeholder → end of file 메타)"
```

---

## Phase 5 — 메인 페이지 통합

### Task 21: app/page.tsx 메인 페이지 통합

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: page.tsx 교체**

```tsx
import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";
import Together from "@/components/home/Together";
import ProjectsList from "@/components/home/ProjectsList";
import PhotosTeaser from "@/components/home/PhotosTeaser";
import Closing from "@/components/home/Closing";
import { getProjects, getPhotos } from "@/lib/notion";

export default async function Home() {
  const [projects, chapters] = await Promise.all([getProjects(), getPhotos()]);

  return (
    <main>
      {/* Act 1 — 서사 */}
      <Hero />
      <Story />
      <Together />

      {/* Act 2 — 작업 */}
      <ProjectsList projects={projects} />
      <PhotosTeaser chapters={chapters} />
      <Closing />
    </main>
  );
}
```

- [ ] **Step 2: 빌드**

```bash
npm run build
```

Expected: 빌드 성공. Notion fetch 정상.

- [ ] **Step 3: dev server 시각 체크**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`:
- Hero: damaged. 호흡, 2초 후 but alive. 페이드인, 우상단 메타
- Story / Together: 카피 + 모노 라벨, 스크롤 페이드인
- ProjectsList: 9개 리스트, hover 시 우측 미리보기
- PhotosTeaser: 대표 챕터 풀블리드(Ken Burns 움직임), 나머지 리스트
- Closing: 모놀로그 placeholder → end of file 메타

문제 있으면 수정, 없으면 종료.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "메인 페이지 통합 — Act 1(Hero·Story·Together) + Act 2(Projects·Photos·Closing)"
```

---

## Phase 6 — Works 라우트

### Task 22: WorkHero / WorkBody / WorkPager 컴포넌트

**Files:**
- Create: `src/components/works/WorkHero.tsx`
- Create: `src/components/works/WorkBody.tsx`
- Create: `src/components/works/WorkPager.tsx`

- [ ] **Step 1: WorkHero 작성**

```tsx
import Image from "next/image";
import { type NotionProject } from "@/lib/notion";
import BreathingType from "@/components/shared/BreathingType";

export default function WorkHero({ project }: { project: NotionProject }) {
  return (
    <header className="relative">
      {project.screenshot && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-card-bg md:aspect-[21/9]">
          <Image
            src={project.screenshot}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
        </div>
      )}

      <div className="mx-auto mt-12 max-w-[800px] px-6 md:mt-16">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-mute md:text-sm">
          / works
        </p>
        <h1 className="mt-4 text-3xl tracking-tight text-foreground-strong md:text-5xl">
          <BreathingType baseWeight={300} weightAmp={20}>{project.title}</BreathingType>
        </h1>

        <dl className="mt-8 grid grid-cols-1 gap-y-3 font-mono text-xs uppercase tracking-widest text-foreground-mute md:grid-cols-[80px_1fr] md:gap-y-2 md:text-sm">
          {project.role && (
            <>
              <dt>/ role</dt>
              <dd className="text-foreground-soft normal-case tracking-normal">{project.role}</dd>
            </>
          )}
          {project.period && (
            <>
              <dt>/ period</dt>
              <dd className="text-foreground-soft normal-case tracking-normal">{project.period}</dd>
            </>
          )}
          {project.tags?.length > 0 && (
            <>
              <dt>/ tags</dt>
              <dd className="flex flex-wrap gap-2 text-foreground-soft normal-case tracking-normal">
                {project.tags.map((t) => (
                  <span key={t} className="rounded border border-card-border px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>

        {project.description && (
          <p className="mt-10 max-w-[680px] text-lg font-light leading-relaxed text-foreground md:text-xl">
            {project.description}
          </p>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: WorkBody 작성**

```tsx
import NotionBlocks from "@/components/shared/notion-blocks";

export default function WorkBody({ blocks, externalUrl }: { blocks: any[]; externalUrl?: string }) {
  if (blocks.length === 0 && !externalUrl) return null;

  return (
    <article className="mx-auto mt-16 max-w-[800px] px-6 md:mt-24">
      {blocks.length > 0 && <NotionBlocks blocks={blocks} />}

      {externalUrl && (
        <div className="mt-16 border-t border-card-border pt-10">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
            / live site
          </p>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-block text-xl font-light tracking-tight text-foreground-strong hover:text-accent-amber md:text-2xl"
          >
            {externalUrl.replace(/^https?:\/\//, "")}
            <span className="ml-2 font-mono text-base text-accent-amber transition-transform group-hover:translate-x-1 inline-block">→</span>
          </a>
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: WorkPager 작성**

```tsx
import Link from "next/link";
import MagneticHover from "@/components/shared/MagneticHover";
import { type NotionProject } from "@/lib/notion";

export default function WorkPager({ prev, next }: { prev: NotionProject | null; next: NotionProject | null }) {
  return (
    <nav className="mx-auto mt-24 grid max-w-[800px] grid-cols-2 gap-4 border-t border-card-border px-6 py-12 md:mt-32">
      <div>
        {prev && (
          <MagneticHover strength={4}>
            <Link href={`/works/${prev.slug}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                ← prev
              </p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {prev.title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
      <div className="text-right">
        {next && (
          <MagneticHover strength={4}>
            <Link href={`/works/${next.slug}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                next →
              </p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {next.title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: 타입 체크**

```bash
npx tsc --noEmit
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/works/
git commit -m "WorkHero / WorkBody / WorkPager — 다큐 에세이 골격"
```

---

### Task 23: BackNav 컴포넌트 + works/[slug]/page.tsx

**Files:**
- Create: `src/components/layout/BackNav.tsx`
- Create: `src/app/works/[slug]/page.tsx`

- [ ] **Step 1: BackNav 작성**

```tsx
import Link from "next/link";

export default function BackNav({ trail }: { trail?: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-card-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm">
          / damaged{trail ? ` / ${trail}` : ""}
        </Link>
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute hover:text-accent-amber md:text-sm">
          ← back
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: works/[slug]/page.tsx 작성**

```tsx
import { notFound } from "next/navigation";
import { getProjects, getProject, getProjectBlocks } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import WorkHero from "@/components/works/WorkHero";
import WorkBody from "@/components/works/WorkBody";
import WorkPager from "@/components/works/WorkPager";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const [blocks, allProjects] = await Promise.all([
    getProjectBlocks(project.id),
    getProjects(),
  ]);

  const idx = allProjects.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? allProjects[idx - 1] : null;
  const next = idx < allProjects.length - 1 ? allProjects[idx + 1] : null;

  return (
    <main>
      <BackNav trail="works" />
      <WorkHero project={project} />
      <WorkBody blocks={blocks} externalUrl={project.url} />
      <WorkPager prev={prev} next={next} />
    </main>
  );
}
```

- [ ] **Step 3: 빌드 + 타입 체크**

```bash
npm run build
```

Expected: 빌드 성공. `/works/<slug>` 9개 prerender.

- [ ] **Step 4: dev server 시각 체크**

```bash
npm run dev
```

`http://localhost:3000` → 메인 → 프로젝트 카드 클릭 → `/works/<slug>` 페이지 정상 렌더 확인.
- Hero(스크린샷 + 메타) 표시
- Body는 Notion 페이지 본문 채워진 프로젝트만 노출, 비어있으면 외부 링크만
- Pager 이전/다음
- 좌상단 BackNav `/ damaged / works · ← back`

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/BackNav.tsx src/app/works/[slug]/page.tsx
git commit -m "/works/[slug] 라우트 — 다큐 에세이 페이지 + BackNav"
```

---

### Task 24: app/works/page.tsx (인덱스)

**Files:**
- Create: `src/app/works/page.tsx`

- [ ] **Step 1: works/page.tsx 작성**

```tsx
import { getProjects } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import ProjectsList from "@/components/home/ProjectsList";

export default async function WorksIndexPage() {
  const projects = await getProjects();

  return (
    <main>
      <BackNav trail="works" />
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
          / works {String(projects.length).padStart(2, "0")}
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
          혼자 만든 것
        </h1>
        <p className="mt-4 max-w-[600px] text-base font-light text-foreground-soft md:text-lg">
          치료는 길고 공격적이었다. 마침 ai란 게 생겨나서 하나 하나 물어가며 필요한 것들을 만들었다.
        </p>
      </div>
      <ProjectsList projects={projects} />
    </main>
  );
}
```

- [ ] **Step 2: 빌드 + 시각 체크**

```bash
npm run build
```

Expected: pass.

```bash
npm run dev
```

`/works` 인덱스 페이지 확인. 메인의 ProjectsList와 같은 컴포넌트 재사용.

- [ ] **Step 3: Commit**

```bash
git add src/app/works/page.tsx
git commit -m "/works 인덱스 페이지 — ProjectsList 재사용"
```

---

## Phase 7 — Photos 라우트

### Task 25: ChapterHero / ChapterGrid / Lightbox / ChapterPager

**Files:**
- Create: `src/components/photos/ChapterHero.tsx`
- Create: `src/components/photos/ChapterGrid.tsx`
- Create: `src/components/photos/Lightbox.tsx`
- Create: `src/components/photos/ChapterPager.tsx`

기존 `src/components/Photos.tsx`에서 메이슨리 + 라이트박스 로직을 분리해 이식. (이미 폐기됐으므로 git history에서 참조: `git show HEAD~N:src/components/Photos.tsx` — 또는 직접 새로 작성.)

- [ ] **Step 1: ChapterHero 작성**

```tsx
import { type PhotoChapter } from "@/lib/notion";
import KenBurns from "@/components/shared/KenBurns";

export default function ChapterHero({ chapter }: { chapter: PhotoChapter }) {
  const m = chapter.chapter.match(/^(\d+)\s+(.+)$/);
  const number = m?.[1] ?? "";
  const title = m?.[2] ?? chapter.chapter;

  return (
    <header className="relative h-[90vh] w-full overflow-hidden">
      {chapter.heroPhoto?.imageUrl && (
        <KenBurns
          src={chapter.heroPhoto.imageUrl}
          alt={chapter.heroPhoto.title || chapter.chapter}
          className="absolute inset-0"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="absolute bottom-12 left-6 right-6 mx-auto max-w-[1100px] md:bottom-20 md:left-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground-soft md:text-sm">
          / chapter {number}
        </p>
        <h1 className="mt-3 text-4xl font-light tracking-tight text-foreground-strong md:text-6xl">
          {title}
        </h1>
        {chapter.intro && (
          <p className="mt-6 max-w-[600px] text-base font-light leading-relaxed text-foreground-soft md:text-lg">
            {chapter.intro}
          </p>
        )}
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-foreground-mute md:text-sm">
          {chapter.photos.length}장
        </p>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Lightbox 작성**

```tsx
"use client";

import { useEffect } from "react";
import Image from "next/image";
import { type NotionPhoto } from "@/lib/notion";

interface Props {
  photos: NotionPhoto[];
  index: number;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}

function caption(date: string, location: string) {
  const formatDate = (iso: string) => {
    if (!iso) return "";
    const [y, m] = iso.split("-");
    return m ? `${y}. ${parseInt(m, 10)}.` : y;
  };
  return [formatDate(date), location].filter(Boolean).join(" ");
}

export default function Lightbox({ photos, index, onClose, onNavigate }: Props) {
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNavigate(-1);
      else if (e.key === "ArrowRight") onNavigate(1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onNavigate]);

  if (!photo) return null;
  const cap = caption(photo.date, photo.location);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-2xl font-light text-foreground hover:text-foreground-strong"
      >
        ×
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
        aria-label="이전"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-light text-foreground hover:text-foreground-strong md:left-8"
      >
        ←
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
        aria-label="다음"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-light text-foreground hover:text-foreground-strong md:right-8"
      >
        →
      </button>

      <div className="relative flex flex-1 items-center justify-center p-12" onClick={(e) => e.stopPropagation()}>
        <Image
          src={photo.imageUrl}
          alt={photo.title || ""}
          width={1600}
          height={1200}
          className="max-h-full max-w-full object-contain"
          sizes="100vw"
        />
      </div>

      {(photo.title || cap) && (
        <div className="px-6 pb-6 text-center font-light text-foreground-soft" onClick={(e) => e.stopPropagation()}>
          {photo.title && <p className="text-base md:text-lg">{photo.title}</p>}
          {cap && <p className="mt-1 font-mono text-xs uppercase tracking-widest text-foreground-mute">{cap}</p>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: ChapterGrid 작성**

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { type NotionPhoto } from "@/lib/notion";
import { useScrollRevealMultiple } from "@/hooks/useScrollReveal";
import Lightbox from "./Lightbox";

export default function ChapterGrid({ photos }: { photos: NotionPhoto[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const setRef = useScrollRevealMultiple(0.05);

  const navigate = (delta: number) => {
    setOpenIdx((i) => {
      if (i === null) return i;
      const n = i + delta;
      if (n < 0) return photos.length - 1;
      if (n >= photos.length) return 0;
      return n;
    });
  };

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        <div className="columns-1 gap-3 sm:columns-2 md:columns-3 lg:columns-4">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              ref={setRef(i) as any}
              className="reveal mb-3 block w-full break-inside-avoid overflow-hidden rounded-md bg-card-bg transition-transform hover:scale-[1.01]"
              style={{ transitionDelay: `${i * 40}ms` }}
              onClick={() => setOpenIdx(i)}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.title || ""}
                width={800}
                height={1000}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-auto w-full"
              />
            </button>
          ))}
        </div>
      </div>

      {openIdx !== null && (
        <Lightbox
          photos={photos}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onNavigate={navigate}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: ChapterPager 작성**

```tsx
import Link from "next/link";
import { type PhotoChapter, chapterSlug } from "@/lib/notion";
import MagneticHover from "@/components/shared/MagneticHover";

function splitLabel(label: string) {
  const m = label.match(/^(\d+)\s+(.+)$/);
  return m ? { number: m[1], title: m[2] } : { number: "", title: label };
}

export default function ChapterPager({
  prev,
  next,
}: {
  prev: PhotoChapter | null;
  next: PhotoChapter | null;
}) {
  return (
    <nav className="mx-auto mt-16 grid max-w-[1100px] grid-cols-2 gap-4 border-t border-card-border px-6 py-12 md:mt-24">
      <div>
        {prev && (
          <MagneticHover strength={4}>
            <Link href={`/photos/${chapterSlug(prev.chapter)}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">← prev chapter</p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {splitLabel(prev.chapter).title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
      <div className="text-right">
        {next && (
          <MagneticHover strength={4}>
            <Link href={`/photos/${chapterSlug(next.chapter)}`} className="group block">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">next chapter →</p>
              <p className="mt-2 text-base font-light text-foreground-soft group-hover:text-accent-amber md:text-lg">
                {splitLabel(next.chapter).title}
              </p>
            </Link>
          </MagneticHover>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: 타입 체크**

```bash
npx tsc --noEmit && npm run lint
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/photos/
git commit -m "ChapterHero / ChapterGrid / Lightbox / ChapterPager — Photos 라우트 컴포넌트"
```

---

### Task 26: app/photos/[chapter]/page.tsx + app/photos/page.tsx

**Files:**
- Create: `src/app/photos/[chapter]/page.tsx`
- Create: `src/app/photos/page.tsx`

- [ ] **Step 1: photos/[chapter]/page.tsx 작성**

```tsx
import { notFound } from "next/navigation";
import { getPhotos, chapterSlug } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";
import ChapterHero from "@/components/photos/ChapterHero";
import ChapterGrid from "@/components/photos/ChapterGrid";
import ChapterPager from "@/components/photos/ChapterPager";

export async function generateStaticParams() {
  const chapters = await getPhotos();
  return chapters.map((c) => ({ chapter: chapterSlug(c.chapter) }));
}

export default async function PhotoChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const chapters = await getPhotos();
  const idx = chapters.findIndex((c) => chapterSlug(c.chapter) === slug);
  if (idx === -1) notFound();
  const chapter = chapters[idx];
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <main>
      <BackNav trail="photos" />
      <ChapterHero chapter={chapter} />
      <ChapterGrid photos={chapter.photos} />
      <ChapterPager prev={prev} next={next} />
    </main>
  );
}
```

- [ ] **Step 2: photos/page.tsx (인덱스) 작성**

```tsx
import Link from "next/link";
import Image from "next/image";
import { getPhotos, chapterSlug } from "@/lib/notion";
import BackNav from "@/components/layout/BackNav";

export default async function PhotosIndexPage() {
  const chapters = await getPhotos();

  return (
    <main>
      <BackNav trail="photos" />
      <div className="mx-auto max-w-[1100px] px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute md:text-sm">
          / photos {String(chapters.length).padStart(2, "0")}
        </p>
        <h1 className="mt-4 text-3xl font-light tracking-tight text-foreground-strong md:text-5xl">
          그렇게 주운 것들
        </h1>
        <p className="mt-4 max-w-[600px] text-base font-light text-foreground-soft md:text-lg">
          빨리 가지 못하므로, 자주 멈춰섰고, 멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2 md:grid-cols-3">
        {chapters.map((c) => {
          const m = c.chapter.match(/^(\d+)\s+(.+)$/);
          const number = m?.[1] ?? "";
          const title = m?.[2] ?? c.chapter;
          return (
            <Link
              key={c.chapter}
              href={`/photos/${chapterSlug(c.chapter)}`}
              className="group block overflow-hidden rounded-md border border-card-border bg-card-bg transition-all hover:border-accent-amber"
            >
              {c.heroPhoto?.imageUrl && (
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={c.heroPhoto.imageUrl}
                    alt={c.chapter}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-foreground-mute">
                  / chapter {number} · {c.photos.length}장
                </p>
                <h3 className="mt-2 text-lg font-light tracking-tight text-foreground-strong group-hover:text-accent-amber md:text-xl">
                  {title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: 빌드 + 시각 체크**

```bash
npm run build
```

Expected: 빌드 성공. `/photos`, `/photos/<chapter>` (8개) prerender.

```bash
npm run dev
```

브라우저:
- 메인 → 챕터 클릭 → `/photos/<chapter>` 진입
- ChapterHero 풀블리드 + Ken Burns
- ChapterGrid 메이슨리 staggered 페이드
- 사진 클릭 → Lightbox + 좌우/ESC
- ChapterPager 이전/다음
- `/photos` 인덱스 페이지에서 8 챕터 그리드 확인
- BackNav 좌상단 정상

- [ ] **Step 4: Commit**

```bash
git add src/app/photos/
git commit -m "/photos 라우트 — 챕터 상세 + 인덱스 페이지"
```

---

## Phase 8 — Polish & QA

### Task 27: 수동 회귀 체크리스트 + 빌드 통과

이 task는 코드 수정 없이 **검증만**. 발견된 이슈는 그때그때 수정 + 별도 commit.

**Files:** (변경 가능성 있음, 발견 시)
- 어떤 컴포넌트든 수정 가능

- [ ] **Step 1: 클린 빌드**

```bash
rm -rf .next && npm run build
```

Expected: 0 error, 0 warning(타입/린트 관련).

- [ ] **Step 2: dev server 시작**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 열기.

- [ ] **Step 3: 메인 long-scroll 회귀 (스펙 §8 체크리스트 #1~6)**

다음을 순차적으로 확인:
- [ ] Hero → Closing 끝까지 스크롤, 모션 끊김 없음 (Lenis 동작)
- [ ] Hero `damaged.` 가변 폰트 호흡 시각 확인 (5초 주기, 미세한 굵기 변화 보임)
- [ ] `but alive.` 페이드인 1회만, 새로고침 후 재현 (~2초 후 등장)
- [ ] Story / Together 카피 페이드인, 모노 라벨 표시
- [ ] ProjectsList: hover 시 우측 미리보기 페이드인, 9개 다 노출
- [ ] PhotosTeaser: 대표 챕터 풀블리드 Ken Burns(미세 줌·팬 끊김 없음), 나머지 챕터 리스트 hover 미리보기
- [ ] Closing: placeholder 모놀로그 → end of file 메타 페이드인

- [ ] **Step 4: 라우트 진입·복귀 회귀 (#7~8)**

- [ ] 프로젝트 카드 클릭 → `/works/[slug]` 페이지 진입 (기존 longDescription 채워진 게 있으면 본문 정상, 비어있으면 Hero+외부 링크만)
- [ ] WorkPager `prev` / `next` 동작
- [ ] BackNav `← back` 클릭 → 홈으로 복귀
- [ ] 메인 PhotosTeaser → 챕터 클릭 → `/photos/[chapter]` 진입
- [ ] ChapterGrid 메이슨리 + staggered 페이드
- [ ] 사진 클릭 → Lightbox 열림, 좌우 화살표 / ESC / 외부 클릭으로 닫힘 정상, body scroll lock
- [ ] ChapterPager `prev` / `next` 동작
- [ ] `/works`, `/photos` 인덱스 페이지 진입 (메인 메뉴엔 없지만 직접 URL로)

- [ ] **Step 5: prefers-reduced-motion 회귀 (#9)**

OS 설정에서 모션 줄이기 활성화 (macOS: 시스템 설정 > 손쉬운 사용 > 디스플레이 > 동작 줄이기).
- [ ] Lenis 비활성 (네이티브 휠 스크롤)
- [ ] Hero 호흡 정지
- [ ] Ken Burns 정지
- [ ] 마그네틱 호버 정지
- [ ] reveal 페이드인 즉시 visible

설정 원복.

- [ ] **Step 6: 모바일 회귀 (#10)**

크롬 devtools 모바일 에뮬레이터(iPhone 14 Pro / Pixel 7) 또는 실기기:
- [ ] Lenis 비활성 (네이티브 스크롤)
- [ ] 마그네틱 비활성
- [ ] ProjectsList hover 미리보기 비활성 (텍스트만)
- [ ] PhotosTeaser hover 미리보기 비활성
- [ ] 풀블리드 Ken Burns는 그대로 동작

- [ ] **Step 7: 그레인 회귀 (#11)**

- [ ] 모든 페이지에서 그레인 오버레이 visible (어두운 영역에서 잘 보임)
- [ ] 본문 가독성에 영향 없음

- [ ] **Step 8: 발견된 이슈 수정 + 통합 commit**

발견된 모든 이슈를 fix:

```bash
git add -A
git commit -m "Phase 8 폴리시 — 회귀 체크리스트 통과 후 발견 이슈 수정"
```

이슈가 0개면 commit 생략.

- [ ] **Step 9: 최종 빌드 1회 + 모든 라우트 prerender 확인**

```bash
rm -rf .next && npm run build 2>&1 | tee /tmp/build.log
grep -E "(/works/|/photos/)" /tmp/build.log
```

Expected: `/`, `/works`, `/works/[slug]` 9개, `/photos`, `/photos/[chapter]` 8개 모두 ● (Static) 마크 확인.

---

### Task 28: 배포 전 PR 생성 (선택, 사용자 결정)

이 task는 사용자가 PR/배포 모델을 선택했을 때만 진행. 단일 main 운영 중이라 PR 없을 수도 있음.

- [ ] **Step 1: 배포 모델 확인**

사용자에게 묻기: "main 직접 푸시 vs 별도 브랜치 + PR + Vercel preview 후 promote?"

- 직접 푸시: `git push origin main` → Vercel 자동 배포
- PR 흐름: 새 브랜치(`redesign/v2`)로 push, PR 생성, preview URL 확인, 통과 시 main merge

- [ ] **Step 2: 사용자 결정에 따라 진행**

PR 흐름이면:
```bash
git checkout -b redesign/v2
git push -u origin redesign/v2
gh pr create --title "포트폴리오 V2 리디자인 — 풀 재설계" --body "$(cat <<'EOF'
## Summary
- damaged.kr V2 디자인 시스템(70C/30B) 풀 재설계
- 메인 2막 구조(Act 1 서사 / Act 2 작업), 깊은 라우트(`/works/[slug]`, `/photos/[chapter]`) 추가
- Lenis + Framer Motion + Pretendard Variable + 자체 Notion blocks 렌더러 도입
- 기존 컴포넌트 7개 폐기, 새 디렉토리 구조 (layout/home/works/photos/shared)

## Spec
`docs/superpowers/specs/2026-05-04-portfolio-redesign-design.md`

## Test plan
- [ ] preview URL 메인 long-scroll 회귀
- [ ] /works/[slug] 9개 라우트 진입 + 본문 렌더
- [ ] /photos/[chapter] 8개 라우트 + Lightbox
- [ ] prefers-reduced-motion + 모바일 분기
- [ ] Notion 콘텐츠 채움 후 시각 점검 (출시 전)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

직접 푸시 모델이면 이 task 건너뜀.

---

## 자기 검토 (Self-Review)

스펙 § vs plan task 매핑:

| 스펙 섹션 | 구현 task |
|----------|----------|
| §2.1 디자인 시스템 (V2 토큰, 폰트, 그레인) | Task 2, 3, 4, 7 |
| §2.2 모션 스코프 — Tier 1 (페이드인, 그레인, sticky 라벨) | 기존 useScrollReveal 유지 + Task 4 + Task 23 BackNav |
| §2.2 — Tier 2 (Lenis, 호흡, 마그네틱) | Task 6, 13, 16 |
| §2.2 — Tier 3 (Ken Burns, staggered) | Task 18 + Task 25 ChapterGrid |
| §3.1 라우트 5개 | Task 21, 23, 24, 26 |
| §3.2 메인 2막 | Task 14, 15, 17, 19, 20, 21 |
| §3.3 데이터 플로우 (Notion fetch RSC) | Task 9, 21, 23, 24, 26 |
| §3.4 컴포넌트 트리 | Task 1, 4, 6, 13~20, 22, 23, 25 |
| §3.5 Notion 스키마 | Task 8, 9 |
| §4 모션 매핑 | Task 13~26 + Phase 8 회귀 |
| §5 카피 (Hero, Story/Together, Closing) | Task 14, 15, 20 |
| §6 기술 스택 | Task 3, 6, 9, 10~12 |
| §7 에러·엣지 케이스 11종 | Task 9 (대표 0장 fallback), Task 6/13/16 (reduced-motion), Task 17/19 (모바일 분기) — Phase 8에서 일괄 검증 |
| §8 테스트 (자동/수동) | Phase 8 Task 27 |
| §9 출시 전 채울 것 | Task 8 가이드 + Task 20 placeholder + 운영 가이드(README 추가는 별도) |

**갭 없음 확인**.

**Placeholder scan**:
- Task 20 `monologue` 배열의 `[ 출시 전 채울 자리 ]` — **의도된 placeholder**. 사용자가 출시 전 직접 작성. spec §9에 명시.
- Task 28 PR/배포 선택은 **사용자 결정 의존**, plan 자체가 불완전한 게 아니라 user gate.
- 그 외 TBD/TODO/없음.

**타입 일관성**:
- `NotionProject` 인터페이스 (Task 9) → `slug`, `role`, `period` 필드를 Task 17, 22 등에서 사용 — 일관됨.
- `PhotoChapter` 인터페이스 (Task 9) → `heroPhoto`, `intro` 필드를 Task 19, 25 등에서 사용 — 일관됨.
- `chapterSlug()` 함수 (Task 9) → Task 19, 26에서 import — 일관됨.
- `BreathingType` props (Task 13) → Task 14 (`baseWeight`, `weightAmp`), Task 22 (`baseWeight`, `weightAmp`) — 일관됨.
- `KenBurns` props (Task 18) → Task 19 (`src`, `alt`, `className`), Task 25 (`priority` 추가) — 일관됨.

**셀프 리뷰 통과**.

---
