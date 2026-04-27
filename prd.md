---
created: '2026-04-24'
status: 기획
tags:
  - damaged
  - 포트폴리오
  - 웹다큐
---
# damaged.kr PRD

## 1. 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | damaged.kr |
| 한 줄 설명 | 손상을 안고 살아가는 사람의 기록 — 개인 웹다큐 포트폴리오 |
| 목적 | 개인 포트폴리오 + 삶의 서사를 한 페이지로. 교육 사업(handson.ai.kr) 강사 소개, 정부사업 제안서 첨부용 |
| 타겟 사용자 | 정부사업 심사위원, 교육 의뢰자, 활동가, 협업 제안자 |
| 기술 스택 | Next.js + TypeScript + Tailwind CSS |
| 배포 환경 | Vercel → damaged.kr 도메인 연결 |
| 상태 | 기획 단계 |

## 2. 배경 및 문제 정의

damaged.kr은 개인 도메인. "Living with Damage" 철학에서 따온 이름.

현재 handson.ai.kr(교육 브랜드)은 있지만, "이 사람이 누구인지"를 보여주는 개인 페이지가 없다. 정부사업 제안서에 강사 포트폴리오를 첨부할 때, 프로젝트 목록을 한눈에 볼 수 있는 페이지가 필요.

단순 포트폴리오가 아니라, 스크롤하면 한 편의 웹다큐처럼 서사가 흐르는 구조.

## 3. 핵심 기능

### 3.1 스크롤 기반 웹다큐 서사

- **설명**: 스크롤 내리면 섹션별로 이야기가 펼쳐지는 원페이지 구조
- **사용자 시나리오**: 방문자가 페이지에 진입하면 어두운 첫 화면 → 스크롤하며 서사를 읽음 → 프로젝트 확인 → 교육 브랜드 → 사진 → 닫는 문장
- **우선순위**: 필수

### 3.2 프로젝트 카드

- **설명**: 대표 프로젝트 6개를 카드형으로 표시
- **데이터**: 프로젝트명, 한 줄 설명, 스크린샷, 라이브 URL
- **우선순위**: 필수

### 3.3 사진 갤러리

- **설명**: "멈추는 것" 섹션에 사진 작업물 갤러리
- **데이터**: 사진 이미지 파일. 현재 소량, 추후 꿈꽃팩토리 복귀 후 추가 예정
- **우선순위**: 필수 (섹션은 만들되, 사진이 적으면 소수만 배치)

### 3.4 교육 브랜드 연결

- **설명**: "같이 만드는 것" 섹션에서 handson.ai.kr로 연결
- **우선순위**: 필수

### 3.5 연락처

- **설명**: 이메일, 필요시 SNS 링크
- **우선순위**: 필수

## 4. 기술 아키텍처

### 4.1 기술 스택
- 프레임워크: Next.js 15 + TypeScript
- 스타일링: Tailwind CSS
- 애니메이션: CSS 기반 스크롤 애니메이션 (Intersection Observer). 무거운 라이브러리 지양
- 배포: Vercel
- 이미지 최적화: Next.js Image 컴포넌트

### 4.2 외부 API/데이터 소스
| API/소스 | 용도 | 키 필요 여부 | 비고 |
|----------|------|-------------|------|
| 없음 | 정적 사이트 | - | 데이터는 코드 내 하드코딩 또는 JSON |

### 4.3 프로젝트 구조
```
damaged-kr/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 메인 원페이지
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Hero.tsx           # 첫 화면 — "damaged." + 본명
│   │   ├── Story.tsx          # 서사 섹션 — 병력 + 코딩 시작
│   │   ├── Projects.tsx       # 혼자 만든 것 — 프로젝트 카드
│   │   ├── Together.tsx       # 같이 만드는 것 — handson.ai.kr
│   │   ├── Photos.tsx         # 멈추는 것 — 사진 갤러리
│   │   ├── Closing.tsx        # 닫는 문장
│   │   └── ProjectCard.tsx    # 개별 프로젝트 카드
│   ├── data/
│   │   └── projects.ts        # 프로젝트 데이터
│   └── hooks/
│       └── useScrollReveal.ts # 스크롤 애니메이션 훅
├── public/
│   ├── screenshots/           # 프로젝트 스크린샷
│   └── photos/                # 사진 작업물
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 5. 데이터 모델

### 프로젝트 데이터 (projects.ts)
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  url: string;
  tags: string[];
}
```

### 프로젝트 목록 (대표 9개)
| id            | title           | description                              | url                         |
| ------------- | --------------- | ---------------------------------------- | --------------------------- |
| 2026jp        | 선거 디지털 통합 시스템   | 구글시트로 관리하는 후보 40여명 웹명함+웹페이지              | 2026.justice21.org          |
| 1pyo          | 참관인 모집 플랫폼      | 2026 지방선거 참관인 모집·관리                      | 1pyo.vercel.app             |
| gasout        | 전국 발전소 모니터링     | 발전소 현황 + 기후시민 밸런스게임                      | gasout.vercel.app           |
| newsclipper   | AI 일일 뉴스 브리핑    | Claude API + SQLite + GitHub Actions 자동화 | -                           |
| file-reviewer | 노동상담 증거파일 검토 도구 | 7,000개 파일 대량 검토 웹앱                       | exit-file-review.vercel.app |
| coupang-out   | 인터랙티브 웹 다큐      | 쿠팡아웃 웹 다큐멘터리                             | www.coupang-out.com         |
| myot          | 내옷              | 옷장+스타일 관리 웹앱                             | myot-five.vercel.app        |
| localflow     | 진주선거정보          | 지역의 선거 관련 현황 및 정보                        | localflow-blush.vercel.app  |
| 권영국.com       | 대선 후보 홈페이지      | 사회대전환연대회의 대통령후보 권영국 홈페이지                 | www.xn--3e0b8b410h.com      |

## 6. 개발 단계 (Phase)

### Phase 0: 환경 설정 ✅
- [x] 프로젝트 초기화 (Next.js + TypeScript + Tailwind)
- [x] Vercel 배포 + damaged.kr 도메인 연결 + SSL 인증서
- [x] 기본 폰트 설정 (Noto Sans KR 300/400/500)

### Phase 1: MVP — 서사 + 프로젝트 ✅
- [x] Hero 컴포넌트 (어두운 배경, "damaged." + 본명)
- [x] Story 컴포넌트 (병력 서사 텍스트, 스크롤 시 한 줄씩 나타남)
- [x] Projects 컴포넌트 (프로젝트 카드 9개, 스크롤 시 하나씩 등장)
- [x] Together 컴포넌트 (handson.ai.kr 연결)
- [x] Closing 컴포넌트 (닫는 문장 + 이메일)
- [x] 스크롤 애니메이션 (Intersection Observer 기반 fade-in)
- [x] 반응형 (모바일 우선)
- [x] Notion CMS 연동 (프로젝트 DB, @notionhq/client v5)
- [x] 프로젝트 스크린샷 9개 캡처 + Notion DB에 등록
- [x] ISR 설정 (revalidate: 3600)
- [x] GitHub repo (learn-slowly/damaged) + Vercel 자동 배포

### Phase 2: 사진 + 마감
- [ ] Photos 컴포넌트에 실제 사진 추가 (Notion 사진 DB 연동은 완료)
- [ ] 글 DB 연동 (확장용, 당장은 비워둬도 됨)
- [ ] og:image 제작 및 삽입
- [ ] 파비콘
- [ ] 전체 톤 점검 및 마감

### Phase 3: 운영
- [ ] 프로젝트 추가/수정 시 Notion에서만 업데이트
- [ ] 사진 추가 (꿈꽃팩토리 복귀 후)
- [ ] 필요시 "글" 섹션 추가

## 7. UI/UX 가이드

### 전체 톤
- **어둡고 조용한 톤**. 배경 거의 검정(#0a0a0a ~ #111). 텍스트 밝은 회색(#e0e0e0).
- 화려하지 않되, 스크롤할 때 텍스트가 조용히 나타나는 정도의 절제된 움직임
- "웹다큐" 느낌 — 영상은 없지만, 스크롤이 타임라인 역할

### 타이포그래피
- 본문: 가늘고 깔끔한 산세리프 (Pretendard Light 또는 Noto Sans KR 300)
- 강조: 같은 폰트 Regular~Medium
- "damaged." 히어로 텍스트: 크고 얇게

### 레이아웃
- 원페이지 스크롤
- 각 섹션은 최소 100vh (화면 하나를 꽉 채움)
- 텍스트 중앙 정렬, 좁은 max-width (600~700px)
- 프로젝트 카드만 넓게 (max-width 1000px)

### 섹션별 화면 구성

**[Hero]** — 화면 중앙에 "damaged." 크게. 아래 작게 본명. 배경 검정. 스크롤 유도 화살표 또는 미세한 힌트.

**[Story — 서사]** — 스크롤하면 한 줄씩 fade-in:
```
10년 동안 여섯 번 수술대에 올랐다.
떼어낼 수 있는 건 다 떼어냈는데,
원인은 유전자에 있었다.

그 사이에 코드를 짜기 시작했다.
코드를 읽을 줄 모른 채로.
```

**[혼자 만든 것]** — 도입 텍스트 fade-in:
```
치료는 길고 공격적이었다.
아프니 집에서라도 활동을 해야했다.
마침 ai란게 생겨나서
하나 하나 물어가며 필요한 것들을 만들었다.
```
→ 프로젝트 카드 6개가 하나씩 나타남. 카드: 스크린샷 + 제목 + 한 줄 설명 + 링크. hover 시 미세한 움직임.

**[같이 만드는 것]** — 도입 텍스트:
```
혼자 만들 수 있다는 걸 알았다.
그 다음 질문은 하나였다.
"이걸 다른 사람도 할 수 있게 하려면?"
```
→ 손에 잡히는 미래 — handson.ai.kr 링크/카드

**[멈추는 것]** — 도입 텍스트:
```
빨리 가지 못하므로, 자주 멈춰섰고,
멀리 가지 못하므로, 한 번 더 뒤돌아 봤다.
그렇게 주운 것들이다.
```
→ 8개 챕터로 묶인 사진 (00 이스탄불 / 01 사람이 있는 풍경 / 02 일하는 사람들 / 03 빛과 그림자 / 04 쭈그려 앉기 / 05 상처난 것들과 사라져 가는 것들 / 06 자전거 / 07 셀카). 각 챕터는 번호+제목 헤더 + 사진 그리드(1·2·3열) + 각 사진 아래 `YYYY. M. 장소` 캡션. 사진은 Vercel Blob에 호스팅, Notion DB에 외부 URL로 등록.

**[Closing]** —
```
— damaged, but alive
```
→ 연락처 (이메일)

### 인터랙션
- 스크롤 시 텍스트 fade-in (Intersection Observer, threshold 0.3)
- 프로젝트 카드 hover: 미세한 scale(1.02) + shadow 변화
- 과도한 parallax, 3D 효과, 파티클 등은 사용하지 않음
- 스크롤 속도를 강제하지 않음 (snap 사용 안 함)

### 색상
| 용도 | 색상 |
|------|------|
| 배경 | #0a0a0a |
| 본문 텍스트 | #d4d4d4 |
| 강조 텍스트 | #f5f5f5 |
| 프로젝트 카드 배경 | #1a1a1a |
| 프로젝트 카드 보더 | #2a2a2a |
| 링크 / 액센트 | #888 (화려한 색 없음) |

## 8. 제약 사항 및 주의점

- **정치색 배제**: 자기소개에 정당명 넣지 않음. "시민사회 활동가"로 표현
- **톤 유지**: 감성적이되 과하지 않게. 자기연민이 아니라 담담한 기록
- **성능**: 이미지 최적화 필수. 사진 갤러리 lazy loading
- **접근성**: 텍스트 콘트라스트 비율 준수, 스크린리더 대응
- **모바일**: 모바일에서도 서사가 깨지지 않게. 텍스트 크기 조절
- **본명 표기**: 히어로에 본명 사용 (레고 아님)
- **프로젝트 URL**: 비공개 프로젝트는 URL 없이 설명만
- **사진 섹션**: 현재 사진이 적으면 3~5장이라도 넣고, 추후 추가 가능한 구조


## 9. CMS 연동 (Notion)

### 9.1 개요
콘텐츠(프로젝트, 사진, 글)를 코드 수정 없이 Notion에서 관리. Notion에 항목 추가하면 사이트에 자동 반영.

### 9.2 Notion 데이터베이스 구조

**프로젝트 DB**
| 속성 | 타입 | 설명 |
|------|------|------|
| 제목 | Title | 프로젝트명 |
| 설명 | Text | 한 줄 설명 |
| URL | URL | 라이브 링크 (없으면 비워둠) |
| 스크린샷 | Files | 프로젝트 스크린샷 이미지 |
| 태그 | Multi-select | 정치, 기후, 자동화, 도구, 콘텐츠 |
| 공개 | Checkbox | 사이트에 표시 여부 |
| 순서 | Number | 표시 순서 |

**사진 DB**
| 속성 | 타입 | 설명 |
|------|------|------|
| 제목 | Title | 사진 제목 (선택) |
| 이미지 | Files | 사진 파일 |
| 설명 | Text | 한 줄 캡션 (선택) |
| 챕터 | Select | 00 이스탄불 / 01 사람이 있는 풍경 / 02 일하는 사람들 / 03 빛과 그림자 / 04 쭈그려 앉기 / 05 상처난 것들과 사라져 가는 것들 / 06 자전거 / 07 셀카 |
| 장소 | Text | 촬영 장소 (예: "부산 다대포") |
| 촬영일 | Date | 촬영 날짜 |
| 공개 | Checkbox | 사이트에 표시 여부 |
| 순서 | Number | 챕터 내 표시 순서 |

**글 DB** (추후 확장용)
| 속성 | 타입 | 설명 |
|------|------|------|
| 제목 | Title | 글 제목 |
| 본문 | Rich text | 글 내용 |
| 날짜 | Date | 작성일 |
| 공개 | Checkbox | 사이트에 표시 여부 |

### 9.3 기술 구현
- Notion API (@notionhq/client) 사용
- Next.js ISR (Incremental Static Regeneration)로 빌드 시 Notion에서 데이터 가져옴
- revalidate: 3600 (1시간마다 갱신) 또는 수동 revalidate 엔드포인트
- 이미지는 Notion에서 가져온 URL을 Next.js Image로 최적화

### 9.4 콘텐츠 업데이트 워크플로우
1. Notion 데이터베이스에 새 항목 추가 (또는 기존 항목 수정)
2. "공개" 체크박스 ON
3. 최대 1시간 내 사이트에 반영 (또는 수동 갱신 URL 호출)
4. 코드 수정, git push 필요 없음

### 9.5 Phase 수정

Phase 1에 추가: ✅ 완료
- [x] Notion 데이터베이스 3개 생성 (프로젝트, 사진, 글)
- [x] Notion API 연동 (@notionhq/client v5, dataSources.query)
- [x] 프로젝트 데이터를 Notion에서 fetch
- [x] ISR 설정 (revalidate: 3600)
- [x] Vercel 환경변수 등록 (NOTION_API_KEY, NOTION_PROJECTS_DS, NOTION_PHOTOS_DS, NOTION_POSTS_DS)

Phase 2에 추가:
- [ ] 사진 DB에 사진 업로드 → Photos 컴포넌트에 반영
- [ ] 글 DB 연동 (확장용, 당장은 비워둬도 됨)
