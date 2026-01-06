---
name: Feature
about: Feature implementation or major task
title: '✨ Market UI: 코인 목록 + 검색 + 즐겨찾기 + 무한스크롤'
labels: ['enhancement', 'frontend', 'P0']
assignees: []
---

## 🎯 Goal

코인 목록을 표시하고, 검색 및 즐겨찾기 기능을 제공합니다.
무한 스크롤로 모바일/데스크톱 모두에서 자연스러운 UX를 제공합니다.

## 📌 Scope

- 포함:

  - 코인 목록 카드 UI (반응형)
  - 무한 스크롤 (Intersection Observer)
  - 검색 기능 (서버 keyword 필터링)
  - 즐겨찾기 토글 (localStorage)
  - 즐겨찾기 필터 탭

- 제외:

  - 차트 UI (별도 이슈)
  - 서버 저장 즐겨찾기 (P1)
  - 정렬 옵션 변경 (기본 시가총액순 고정)

## 🧩 Tasks

- [ ] Market API hooks 구현 (`useCoinsInfinite`, `useCoinDetail`)
- [ ] 코인 목록 컴포넌트 (`CoinList`)
- [ ] 코인 카드 컴포넌트 (`CoinCard`)
- [ ] 검색 입력 컴포넌트 (`SearchInput`)
- [ ] 즐겨찾기 필터 탭 (`FilterTabs`)
- [ ] 무한 스크롤 hook (`useIntersectionObserver`)
- [ ] 로딩/에러/빈 상태 처리

## ✅ Acceptance Criteria

- [ ] 코인 목록 표시 (이름, 심볼, 가격, 변동률)
- [ ] 스크롤 시 다음 페이지 자동 로드
- [ ] 검색어 입력 시 서버 필터링
- [ ] 즐겨찾기 토글 시 상태 유지 (새로고침 후에도)
- [ ] 모바일/데스크톱 반응형 레이아웃
- [ ] 로딩 중 스켈레톤 표시

## 🔗 Related Docs / Issues

- Frontend 상태 관리 설정 (완료)
- Market API (완료)

## 📝 Notes

- 검색은 서버 keyword 파라미터 사용
- 정렬은 기본값(시가총액순) 고정
- 카드형 레이아웃으로 모바일/데스크톱 통일
