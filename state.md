# 고양이 게임 진행 상태

갱신: 2026-10-06

## Solarena 바이럴성 개선

- 보호소 복구 축하창에 선택형 `Invite a friend to help` 공유 버튼을 추가했다.
- 공유 내용은 실제 완료 구역과 그 보상으로 열린 동물만 사용한다. Poki에서는 `PokiSDK.shareableURL`에 `type=shelter_restore`, `area=<area id>`를 넘기고, SDK가 없으면 현재 게임 주소에 `restore=<area id>`를 붙인다.
- 초대 링크로 시작하면 타이틀 화면에 친구가 복구한 구역을 표시한다. `restore`, Poki의 `gdarea`, `PokiSDK.getURLParam('area')`를 읽는다.
- 확인: `npm run build` 통과(TypeScript + Vite, dist/index.html 1,586.50 kB / gzip 444.30 kB). `git diff --check` 통과.
- 실제 브라우저에서 `?restore=yard` 시작 문구를 확인했다. 저장 진행도를 격리 브라우저에 준비해 Gate & Front Yard 복구 보상 화면을 실제 게임 UI로 띄웠다. 공유 호출 payload에 구역, Rescue Dog 보상, 초대 링크가 포함되고 완료 안내가 나타나는 것을 확인했다.
- 제한: Web Share는 브라우저 함수 대체(mock)로 호출 전달을 확인했다. 실제 모바일 공유 시트, 클립보드 fallback, Poki SDK 실환경, 사람 플레이/공유 전환율은 미검증. 콘솔의 `frame-ancestors` meta 경고는 기존 Vite 페이지 설정 경고로, 기능 JS 오류는 아니었다.
- 코드: `src/lib/share.ts`, `src/components/Overlays.tsx`, `src/components/TitleScreen.tsx`.
- 다음: 첫 구역까지 실제 신규 플레이에 걸리는 시간과 진행 동기를 계측해 조정하고, 복구 공유를 모바일/Poki에서 검증한다.


## 신규 플레이어 첫 보드 흐름 (2026-10-06)

- 일일 보상 모달은 첫 핵심 튜토리얼을 마치거나 건너뛴 뒤에 표시되도록 변경했다. 보상 계산, 지급, 세이브 데이터는 바꾸지 않았다.
- 확인: TypeScript/Vite 빌드 통과(1,586.52 kB / gzip 444.30 kB), diff 검사 통과. 격리 브라우저 신규 세이브에서 Play 직후 일일 모달 없이 1/4 Merge 안내가 나타났다. Skip 뒤 Day 1 streak 모달과 Claim 20 coins 버튼이 나타났다.
- 모바일/실제 사람의 튜토리얼 시간 및 첫 merge 시간은 미검증.
