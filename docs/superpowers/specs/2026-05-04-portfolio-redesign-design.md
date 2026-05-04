---
created: 2026-05-04
status: 정식 스펙 (사용자 검토 대기)
tags: [damaged, 포트폴리오, 리디자인, V2]
---

# damaged.kr 리디자인 설계 — V2

## 0. 상태

브레인스토밍의 모든 결정이 완료된 정식 스펙. 사용자 검토 → 승인 시 `writing-plans`로 구현 계획 작성. 그 전엔 코드/구현 시작 금지.

## 1. 배경 / 목표

기존 `damaged.kr`은 PRD에 "어둡고 조용한 톤", "화려하지 않되 절제된 움직임", "과도한 parallax/3D/파티클 사용 안 함"으로 명시된 웹다큐형 1페이지 포트폴리오. 정부사업 제안서 첨부, 강사 소개용으로 가동 중.

이번 리디자인 목표 — **담담한 서사 톤은 유지하되, 시각적 정성·인터랙션을 한 단계 끌어올린다.** 사용자 표현으로는 "고급스럽게 화려한 쪽". PRD의 모션 제약은 일부 완화(Ken Burns 허용).

기존 자산은 유지·재사용:
- Notion DB (프로젝트 9개, 사진 챕터 8개, 사진 103장)
- Vercel Blob 사진 호스팅
- 도메인 / Vercel 배포

기존 컴포넌트는 전부 폐기, 처음부터 재구성.

## 2. 디자인 시스템

### 2.1 방향성 — V2 (70% C / 30% B)

C(키네틱 폴리시) 70% 뼈대 + B(시네마 다큐) 30%의 따뜻함·사진감.

| 요소 | 결정값 |
|------|--------|
| 베이스 컬러 | 잉크블랙 `#0a0805` (기존 `#0a0a0a`보다 살짝 따뜻) |
| 액센트 | 앰버 `#d4a16d` ↔ 옥스블러드 `#9c2a2a` 그라디언트 |
| 본문 텍스트 | `#ececef` / 보조 `#c9c0b1` / 약화 `#a8a8b2` |
| 본문 폰트 | Pretendard Variable (한글) + Inter / system sans (영문) |
| 모노 폰트 | JetBrains Mono Variable — 라벨, 넘버, 메타 |
| 디스플레이 | Pretendard Variable의 `wght` 가변축 활용 (Pretendard에 stretch 축 없음 — 호흡은 wght + letter-spacing 합성으로) |
| 그레인 | 페이지 전체 SVG 노이즈 오버레이, `opacity .07`, `mix-blend-mode: overlay` |
| 사진 챕터 | 풀블리드 1장 + 그리드 (B 색채) |
| 분위기 키워드 | "한 사람 손에서 나온 도구 + 영화 한 컷 분위기" |

참고 mockup: `.superpowers/brainstorm/76770-1777894036/content/c-plus-b.html` (V1/V2/V3 농도 비교).

### 2.2 모션 스코프 — 추천 기본 세트 (10개)

PRD의 "no parallax/3D/파티클" 제약은 일부 완화 (특히 풀블리드 사진의 Ken Burns 허용). 모든 모션은 `prefers-reduced-motion: reduce` 시 비활성.

**Tier 1 — 기본 (CSS / IntersectionObserver만)**
- [01] 스크롤 텍스트 페이드인 — 기존 `useScrollReveal` 훅 유지
- [02] 페이지 그레인 — SVG 노이즈, `opacity .07`
- [03] 카드 hover 리프트 + 액센트 보더 — `transform / border-color`
- [04] 섹션 라벨 sticky — 좌상단에 `/ WORKS` 류 모노 라벨
- [05] 네비 클릭 → 스무스 앵커 이동

**Tier 2 — 도구감 핵심**
- [06] **Lenis 스무스 스크롤** — 휠/터치 가속 곡선 부드럽게 (~8KB), 라이트박스 시 disable
- [07] **Hero 가변 폰트 호흡** — `damaged.`의 `wght 300↔350` + `letter-spacing` 미세 변동, ~5초 주기 호흡 (2~3% 진폭)
- [08] **프로젝트 카드 마그네틱 호버** — 커서 근접 시 ±6px 끌림, 모바일 비활성

**Tier 3 — 시네마 (PRD 제약 완화)**
- [12] **사진 Ken Burns** — 챕터 풀블리드 사진이 ~9초에 미세 줌·팬
- [16] **사진 그리드 staggered 페이드** — 0.04s 간격으로 차례 등장

**제외**: T2-09 카운터, T2-10 우측 스크러버, T2-11 커스텀 커서, T3-13 스티키사진+텍스트 패닝, T3-14 인트로 애니메이션, T3-15 카드 틸트.

참고 mockup: `.superpowers/brainstorm/76770-1777894036/content/motion-live.html`.

## 3. 아키텍처

### 3.1 라우트 구조

| 경로 | 역할 | 데이터 |
|------|------|--------|
| `/` | 메인 다큐 long-scroll (Act 1 서사 + Act 2 작업 티저) | `getProjects()`, `getPhotos()` (둘 다 RSC fetch, 빌드 시 prerender) |
| `/works` | 프로젝트 인덱스 (전체 9개, 메인 리스트의 풀버전) | `getProjects()` |
| `/works/[slug]` | 프로젝트 상세 (다큐 에세이) | `getProject(slug)` + `getProjectBlocks(pageId)` (Notion blocks) |
| `/photos` | 사진 챕터 인덱스 (8 챕터) | `getPhotos()` |
| `/photos/[chapter]` | 챕터 상세 (풀블리드 + 그리드 + 라이트박스) | `getPhotos()` filtered to chapter |

전부 Next 16 RSC + `generateStaticParams`로 빌드 시점 prerender. ISR은 일단 안 씀 (Notion 변경 시 재배포로 충분).

### 3.2 메인 페이지 섹션 구조 — 2막

**Act 1 (서사)**
1. **Hero** — `damaged.` (가변 폰트 호흡) + ~2초 후 `but alive.` 1회 페이드인 + 우상단 모노 메타(`/ 백아형 · seoul · 2026`).
2. **Story** — 현재 카피 6줄 그대로 ("10년 동안 여섯 번 수술대에 올랐다 …").
3. **Together** — 현재 카피 3줄 + handson.ai.kr CTA 그대로.

**Act 2 (작업)**
4. **Projects (티저)** — 9개 리스트형 (번호·제목·연도·태그·짧은 설명). hover 시 옆에 스크린샷 미리보기 페이드인. 클릭 → `/works/[slug]`. 모바일은 텍스트만 (MVP). 자동 사이클 미리보기는 후속 작업으로 보류.
5. **Photos (티저)** — 대표 챕터(`대표` 마킹) 1~2개만 풀블리드 히어로 + Ken Burns. 나머지 챕터는 텍스트 리스트(번호·제목·시기·장수, hover 미리보기). 합계 8 챕터 노출. 클릭 → `/photos/[chapter]`.
6. **Closing** — B+C 하이브리드: 한 호흡 어둠 → 본문 모놀로그(2~4줄) → 한 박자 → `/ end of file` + 모노 메타(이메일·도메인·연도).

### 3.3 데이터 플로우

```
[Notion DB]                              [Vercel Blob]
   │                                       │
   ├── projects (9)                        ├── /photos/*.webp
   ├── photos (103)                        └── /screenshots/*.webp
   └── photo chapters (메타 from photos)
           │
           ▼
   src/lib/notion.ts (RSC, 빌드 시점 fetch)
           │
           ▼
   ┌───────┴────────┐
   ▼                ▼
 메인 /         라우트
                ├ /works/[slug]: getProject + getProjectBlocks
                └ /photos/[chapter]: getPhotos filtered
```

### 3.4 컴포넌트 트리 (목표 구조)

```
src/
├── app/
│   ├── layout.tsx              # Lenis mount, 폰트, 그레인 오버레이
│   ├── page.tsx                # 메인 (Act 1 + Act 2 합성)
│   ├── works/
│   │   ├── page.tsx            # 인덱스
│   │   └── [slug]/page.tsx     # 상세 (다큐 에세이)
│   └── photos/
│       ├── page.tsx            # 인덱스
│       └── [chapter]/page.tsx  # 챕터 상세
│
├── components/
│   ├── layout/
│   │   ├── Grain.tsx           # SVG 노이즈 오버레이
│   │   ├── LenisProvider.tsx   # 클라 컴포넌트, 전역 스무스 스크롤
│   │   └── BackNav.tsx         # 라우트 페이지 좌상단 / damaged · ← back
│   ├── home/
│   │   ├── Hero.tsx            # damaged. + but alive + 호흡
│   │   ├── Story.tsx           # 카피 그대로
│   │   ├── Together.tsx        # 카피 그대로 + CTA
│   │   ├── ProjectsList.tsx    # 리스트형 + hover 미리보기
│   │   ├── PhotosTeaser.tsx    # 풀블리드 히어로 + 챕터 리스트
│   │   └── Closing.tsx         # 모놀로그 + end of file
│   ├── works/
│   │   ├── WorkHero.tsx        # 풀블리드 + 메타
│   │   ├── WorkBody.tsx        # Notion blocks 렌더 컨테이너
│   │   └── WorkPager.tsx       # 이전/다음
│   ├── photos/
│   │   ├── ChapterHero.tsx     # Ken Burns 풀블리드
│   │   ├── ChapterGrid.tsx     # 메이슨리 그리드 (현재 로직 재사용)
│   │   ├── Lightbox.tsx        # 현재 로직 재사용
│   │   └── ChapterPager.tsx    # 이전/다음
│   └── shared/
│       ├── KenBurns.tsx        # 풀블리드 이미지 + 줌·팬
│       ├── MagneticHover.tsx   # 마그네틱 효과 wrapper
│       ├── BreathingType.tsx   # 가변 폰트 호흡 wrapper
│       └── notion-blocks/      # 자체 Notion blocks 렌더러
│           ├── index.tsx       # 디스패처
│           ├── Heading.tsx
│           ├── Paragraph.tsx
│           ├── Image.tsx
│           ├── Quote.tsx
│           ├── Code.tsx
│           ├── Embed.tsx
│           └── List.tsx
│
├── lib/
│   ├── notion.ts               # 기존 + getProject(slug), getProjectBlocks(pageId)
│   └── motion.ts               # reduced-motion 감지, 모바일 감지
│
└── hooks/
    ├── useScrollReveal.ts      # 기존 그대로
    └── useMagnetic.ts          # 마그네틱 호버 로직
```

### 3.5 Notion 스키마 변경

**Projects DB**에 필드 추가:
- `longDescription` — 페이지 본문 (Notion blocks 자체. 별도 rich_text 필드 안 만들고 `pages.children.list`로 가져옴)
- `role` (rich_text) — 예: "기획·개발"
- `period` (rich_text) — 예: "2024~", "2023.06~12"

**Photos DB**에 필드 추가:
- `대표` (checkbox) — 메인 풀블리드로 노출할 사진 마킹 (챕터당 1장 권장)
- `챕터 서문` (rich_text, 옵션) — 챕터 풀블리드 위에 표시할 짧은 글 (없으면 생략)

기존 필드는 그대로(`제목`, `설명`, `URL`, `스크린샷`, `태그`, `순서`, `공개`).

## 4. 모션 매핑 (어디에 어떤 모션)

| 위치 | 모션 |
|------|------|
| 전역 | T1-02 그레인, T2-06 Lenis |
| 메인 Hero | T2-07 가변 폰트 호흡, `but alive` 페이드인 |
| 메인 Story / Together / Closing 본문 | T1-01 스크롤 텍스트 페이드인 |
| 메인 Projects 리스트 | T1-01 페이드인 + hover 미리보기 페이드 |
| 메인 Photos 풀블리드 | T3-12 Ken Burns |
| 메인 Photos 챕터 리스트 | T1-01 페이드인 + hover 미리보기 |
| 라우트 좌상단 nav | T1-04 sticky 모노 라벨 |
| `/works/[slug]` Hero | T2-07 호흡(타이틀), Ken Burns(스크린샷) |
| `/works/[slug]` Pager | T2-08 마그네틱 |
| `/works/[slug]` Body | T1-01 페이드인 (블록 단위) |
| `/photos/[chapter]` Hero | T3-12 Ken Burns |
| `/photos/[chapter]` Grid | T3-16 staggered 페이드 |
| Closing | 한 호흡 어둠(어둠 페이드) → 본문 페이드인 → end of file 페이드인 (T1-01 변주) |

## 5. 카피

### 5.1 Hero
- 메인 디스플레이: `damaged.`
- 페이드인: `but alive.` (Hero 진입 ~2초 후 1회만)
- 우상단 메타: `/ 백아형 · seoul · 2026` (모노)

### 5.2 Story / Together
**그대로 유지**. 최근 커밋 c392b32에서 이미 압축 완료.

### 5.3 Closing
- 본문 (모놀로그 2~4줄): **출시 전 사용자가 직접 작성** — "but alive"에 대한 답·해석 톤. 초안 옵션 제공 가능.
- 메타: `/ end of file` + `redoutk@gmail.com  ·  damaged.kr  ·  2026` (모노).

### 5.4 라우트 페이지 좌상단 nav
모노 라벨: `/ damaged   ← back` (홈으로) — 또는 컨텍스트별로 `/ damaged / works   ← back`.

## 6. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16.2.4 (현재) + React 19 + Tailwind 4 |
| 스무스 스크롤 | Lenis 전역 (`app/layout.tsx`에서 클라 마운트), 라이트박스/`prefers-reduced-motion` 시 disable |
| 애니메이션 | Framer Motion 선택적 — Ken Burns(T3-12)·마그네틱(T2-08)·시퀀싱·Closing 시쿼스. 단순 페이드는 기존 `useScrollReveal` + CSS |
| 폰트 | Pretendard Variable + JetBrains Mono Variable, `next/font/local`로 self-host. Hero 호흡은 `wght 300↔350` + `letter-spacing` 합성 (Pretendard에 stretch 축 없음) |
| Notion 본문 렌더 | `@notionhq/client` blocks API + 자체 `notion-blocks/` 렌더러 (`react-notion-x` 사용 안 함 — 무겁고 톤 망가짐) |
| 이미지 | `next/image` + `@vercel/blob` (현재 그대로). 풀블리드는 `priority` + `placeholder="blur"` |
| 그레인 | 인라인 SVG noise, `opacity .07`, `mix-blend-mode: overlay`. JS 없음 |
| 데이터 | RSC fetch + `generateStaticParams`로 빌드 시점 prerender |

## 7. 에러 / 엣지 케이스

| 시나리오 | 처리 |
|----------|------|
| Notion fetch 실패(빌드 시) | 빌드 실패 (배포 막음). 메인 `try/catch` 후 빈 상태 fallback은 안 함 — 빌드 자체가 실패하는 게 바람직 |
| 사진 이미지 로딩 실패 | `next/image`의 `onError` → `bg-card-bg` placeholder + 캡션은 그대로 노출 |
| 프로젝트에 `longDescription` 비어있음 | Hero(스크린샷 + 메타)만, Body 섹션 자체 미렌더. 외부 URL CTA + Pager는 그대로 |
| 프로젝트에 외부 URL 없음 | CTA 미노출. Body만으로 마무리 |
| 챕터에 `대표` 사진 0장 | 코드에서 자동 fallback — 해당 챕터의 첫 사진(`order` 가장 작은) 사용. 운영자가 마킹 잊어도 페이지 안 깨짐. 풀블리드로 띄울 챕터 자체는 `대표`가 있는 챕터 우선, 없으면 1번 챕터 1장만 |
| Pretendard Variable 로딩 실패 | system sans fallback. FOIT 대신 FOUT 허용 (`font-display: swap`) |
| `prefers-reduced-motion: reduce` | Lenis · Ken Burns · 호흡 · 마그네틱 · staggered 전부 disable. 페이드인은 즉시 visible |
| 모바일 (touch) | 마그네틱 비활성, hover 미리보기 비활성, Lenis 비활성 (native scroll) |
| 라이트박스 진입 | Lenis disable, body scroll lock (현재 패턴 그대로) |

## 8. 테스트

웹다큐 사이트라 단위 테스트보단 **수동 시각·인터랙션 회귀 체크리스트** 중심.

**자동**:
- TypeScript 타입 체크 (`tsc --noEmit`)
- ESLint
- Next 빌드 성공 (`next build` — Notion fetch 포함되니 자연스러운 통합 테스트)
- Lighthouse CI는 후속(GA 이후)

**수동 회귀 체크리스트** (출시 전 + 큰 변경 후):
1. 메인 long-scroll: Hero → Closing 끝까지 모션 끊김 없음
2. Hero 가변 폰트 호흡 시각 확인 (5초 주기, 2~3% 진폭)
3. `but alive.` 페이드인 1회만, 새로고침 후 재현
4. Projects 리스트 hover 미리보기 정상, 모바일에선 텍스트만
5. Photos 풀블리드 Ken Burns 부드러움(끊기지 않음)
6. 카드/챕터 클릭 → 라우트 페이지 진입 + back nav로 메인 복귀
7. `/works/[slug]` Notion blocks 렌더(텍스트·이미지·인용·코드) 정상
8. 라이트박스: 좌우 화살표·ESC·외부 클릭 정상, body scroll lock
9. `prefers-reduced-motion` ON 시 모션 전부 정지(브라우저 설정으로 토글)
10. 모바일(iOS Safari, Android Chrome) — Lenis off / 마그네틱 off / hover 미리보기 off
11. 그레인 오버레이 모든 페이지에서 visible, 본문 가독성 영향 없음

## 9. 출시 전 채울 것 (구현 완료 후)

- [ ] Closing 본문 모놀로그 (2~4줄, 사용자가 직접 작성)
- [ ] Notion Projects DB의 `longDescription` 페이지 본문 — 9개 중 우선 3~4개 채우고 나머지는 점진적
- [ ] Notion Projects DB의 `role`, `period` 9개 다 채움
- [ ] Notion Photos DB의 `대표` 체크박스 — 챕터당 1장
- [ ] 챕터 서문이 필요한 챕터에 `챕터 서문` 작성

## 10. 참고

- 원본 PRD: `prd.md`
- Visual Companion 세션: `.superpowers/brainstorm/76770-1777894036/content/`
  - `direction.html` / `direction-detailed.html` — A/B/C 방향성 비교
  - `c-plus-b.html` — V1/V2/V3 농도 비교
  - `motion-live.html` — 16개 모션 라이브 데모
- 현재 컴포넌트(폐기 예정): `src/components/{Hero,Story,Projects,Together,Photos,Closing,ProjectCard}.tsx`
- 현재 데이터: `src/lib/notion.ts`, Vercel Blob
- 결정 시점: 2026-05-04
