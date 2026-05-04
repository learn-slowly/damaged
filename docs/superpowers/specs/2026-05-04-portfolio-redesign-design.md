---
created: 2026-05-04
status: 진행 중 (브레인스토밍, 미완료)
tags: [damaged, 포트폴리오, 리디자인, V2]
---

# damaged.kr 리디자인 설계 — V2

## 0. 상태

**현재 단계**: 브레인스토밍 진행 중. 이 문서는 지금까지의 결정을 기록한 **중간 체크포인트**임. 디자인 섹션 제시 / 승인 / 스펙 셀프리뷰 / 사용자 검토 단계 미진행. 따라서 구현 시작 금지 — writing-plans 호출 전.

## 1. 배경 / 목표

기존 `damaged.kr`은 PRD에 "어둡고 조용한 톤", "화려하지 않되 절제된 움직임", "과도한 parallax/3D/파티클 사용 안 함"으로 명시된 웹다큐형 1페이지 포트폴리오. 정부사업 제안서 첨부, 강사 소개용으로 가동 중.

이번 리디자인 목표는 — **담담한 서사 톤은 유지하되, 시각적 정성·인터랙션을 한 단계 끌어올린다.** 사용자 본인의 표현으로는 "고급스럽게 화려한 쪽".

## 2. 결정 사항

### 2.1 방향성 — **V2 (70% C / 30% B)**

비교 후 선택. C(키네틱 폴리시)를 뼈대로 B(시네마 다큐)의 따뜻함·사진감을 30% 끼얹는 농도.

| 요소 | 결정값 |
|------|--------|
| 베이스 컬러 | 잉크블랙 `#0a0805` (기존 `#0a0a0a`보다 살짝 따뜻) |
| 액센트 | 앰버 `#d4a16d` ↔ 옥스블러드 `#9c2a2a` 그라디언트 |
| 본문 텍스트 | `#ececef` / 보조 `#c9c0b1` / 약화 `#a8a8b2` |
| 베이스 폰트 | Pretendard Variable (한글) + Inter / system sans (영문) |
| 모노 폰트 | JetBrains Mono — 라벨, 넘버, 메타 |
| 디스플레이 | Pretendard Variable의 wght/stretch 가변축 활용 |
| 그레인 | 페이지 전체 SVG 노이즈 오버레이, `opacity .07` |
| 사진 챕터 | 풀블리드 1장 + 그리드 (B 색채) |
| 분위기 키워드 | "한 사람 손에서 나온 도구 + 영화 한 컷 분위기" |

**참고 mockup**: `.superpowers/brainstorm/<session>/content/c-plus-b.html` (V1/V2/V3 농도 비교).

### 2.2 모션 스코프 — **추천 기본 세트** (10개)

PRD의 "no parallax/3D/파티클" 제약 일부 완화 (특히 풀블리드 사진의 Ken Burns 허용).

**Tier 1 — 기본 (CSS / IntersectionObserver만)**
- [01] 스크롤 텍스트 페이드인 — 기존 보유, 유지
- [02] 페이지 그레인 — SVG 노이즈, `opacity .07`
- [03] 카드 hover 리프트 + 액센트 보더 — `transform / border-color`
- [04] 섹션 라벨 sticky — 좌상단에 `/ WORKS` 류 모노 라벨
- [05] 네비 클릭 → 스무스 앵커 이동

**Tier 2 — 도구감 핵심**
- [06] **Lenis 스무스 스크롤** — 휠/터치 가속 곡선 부드럽게 (~8KB)
- [07] **Hero 가변 폰트 호흡** — "damaged."의 wght/stretch가 ~5초 주기 미세 호흡 (2~3% 진폭)
- [08] **프로젝트 카드 마그네틱 호버** — 커서 근접 시 ±6px 끌림, 모바일 비활성

**Tier 3 — 시네마 (PRD 제약 완화)**
- [12] **사진 Ken Burns** — 챕터 풀블리드 사진이 ~9초에 미세 줌·팬
- [16] **사진 그리드 staggered 페이드** — 0.04s 간격으로 차례 등장

**제외**:
- T2-09 카운터 (과한 듯)
- T2-10 우측 스크러버 (지금은 안 씀, 추후 검토)
- T2-11 커스텀 커서 (절제 라인 넘음)
- T3-13 스티키사진+텍스트 패닝 (자기연민 위험)
- T3-14 인트로 애니메이션 (1회용 비용 대비 효과)
- T3-15 카드 틸트 (마그네틱과 중복)

**참고 mockup**: `.superpowers/brainstorm/<session>/content/motion-live.html` (16개 모션 라이브 데모).

## 3. 미결정 사항 (다음 단계에서 정할 것)

### 3.1 구현 접근 — **A / B / C** ⏳ 사용자 답변 대기 중
- A · 점진적 — 컴포넌트 구조 유지, 톤·모션만
- B · **부분 재구성 (추천)** — Hero/Photos/Projects 새로 짜고, Story/Together/Closing은 톤만
- C · 풀 재설계 — 처음부터 다시

### 3.2 카피
- Hero에 "but alive" 끌어올릴지 (현재는 Closing에만 있음)
- 본명 표기 위치/크기

### 3.3 구조
- 상단 nav 추가 (WORKS / STORY / PHOTOS / CONTACT) — Q5 답에 따라
- 프로젝트 9개 정렬: 평면 vs 태그 그룹(civic / climate / doc / labor / brand)
- Photos: 8개 챕터 각각 풀블리드 1장 + 그리드 구조 확정 → 어떤 사진을 "히어로 컷"으로 자동 선정할지 (Notion 메타? "히어로" 체크박스 추가?)

### 3.4 기술 스택
- Lenis 도입 위치 (전역 vs 특정 라우트)
- 가변 폰트 로딩 전략 (Pretendard Variable 서브셋)
- Framer Motion 도입 여부 (현재 없음, IO + CSS 중심으로 갈 수 있음)

## 4. 다음 스텝

1. **Q5 답** — 구현 접근 A/B/C 선택
2. 카피·구조 확정 (3.2 / 3.3)
3. 기술 스택 확정 (3.4)
4. 디자인 섹션별 제시 + 승인 (브레인스토밍 6단계)
5. 본 문서를 정식 스펙으로 보강 (현재 체크포인트에서 → 최종)
6. 셀프 리뷰 / 사용자 검토
7. `writing-plans` 호출 → 구현 계획 작성

## 5. 참고

- 원본 PRD: `prd.md`
- Visual Companion 세션 디렉토리: `.superpowers/brainstorm/76770-1777894036/content/`
  - `direction.html` — A/B/C 방향성 비교
  - `direction-detailed.html` — 각 방향 상세 미리보기
  - `c-plus-b.html` — V1/V2/V3 농도 비교
  - `motion-live.html` — 16개 모션 라이브 데모
- 현재 컴포넌트: `src/components/{Hero,Story,Projects,Together,Photos,Closing,ProjectCard}.tsx`
- 데이터 소스: Notion DB (프로젝트/사진/글) — `src/lib/notion.ts`
