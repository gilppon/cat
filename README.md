# 🐾 유기동물 쉼터 복원 머지 (Pets Harbor & Home Restore)

Phaser 3 + TypeScript 머지 보드와 React + Tailwind UI를 결합한 힐링 머지 게임입니다.
버려진 항구 쉼터를 복원하며 길고양이 · 유기견 · 토끼 · 페르시안 친구들을 돌봐요.

## 게임 루프
1. **생성기 탭** – 🧺 사료 창고 / 🎁 장난감 상자 / 🧰 구급 상자 (⚡1 소모, 20초마다 1 회복)
2. **머지** – 같은 아이템 2개를 드래그해 합치면 한 단계 상승 (카테고리별 Lv.1~7)
3. **요청 해결** – 동물 친구의 요청(카테고리 + 레벨)에 맞는 아이템을 전달 → 💰 코인 + ❤️ 하트
4. **쉼터 복원** – 하트/코인으로 5개 구역(15개 작업)을 복원 → 새 동물 입소, 생성기 강화, 최대 에너지 증가

## 폴더 구조
```
src/
├── main.tsx                 # React 엔트리
├── App.tsx                  # 레이아웃 (모바일 / 데스크톱 반응형)
├── types/game.ts            # ItemConfig, BoardCell, PetOrder, PlayerData
├── managers/
│   ├── SaveManager.ts       # localStorage 저장 · 불러오기 · 범위 클램프 정규화
│   ├── MergeManager.ts      # ITEM_DATABASE, 머지 규칙, 생성기 확률
│   ├── OrderManager.ts      # 동물 요청 생성 / 보상 공식
│   └── GameStore.ts         # Phaser ↔ React 공유 단일 상태 저장소
├── game/
│   ├── main.ts              # Phaser.Game 설정 (Scale.FIT, 투명 캔버스)
│   └── constants.ts         # 보드 레이아웃 상수
├── scenes/
│   ├── BootScene.ts         # 모든 타일/아이템/이펙트 텍스처를 캔버스로 생성
│   └── MainScene.ts         # 6x6 보드, 드래그&드롭, 합치기/전달 연출, 파티클
├── components/              # TopBar, OrdersPanel, ShelterPanel, ShopModal, Overlays, PhaserBoard, TitleScreen, ItemInfoBar, ui
├── hooks/useGame.ts         # GameStore 구독 (useSyncExternalStore) + useNow 타이머
├── data/shelter.ts          # 구역 · 작업 · 동물 데이터
├── lib/                     # sfx(WebAudio), korean(조사), assets(BASE_URL 경로)
└── utils/cn.ts              # 클래스 병합 (ui.tsx의 cx는 호환 별칭)
```

## 개발
- `npm ci` → `npm run dev` (개발) / `npm run build` (tsc + vite singlefile) / `npm run typecheck`
- 배포는 `base: './'` + `asset()` 헬퍼로 서브패스에서도 이미지 정상 로드
- 저장 키: `PETS_HARBOR_SAVE_V1` (평문 JSON, 범위 클램프 적용 — 서버 랭킹용 아님)

## AI 이미지 에셋 프롬프트
공통 스타일: *soft hand-painted 2D cartoon illustration, cozy mobile merge game art style, pastel palette, no text*

| 파일 | 프롬프트 요약 |
| --- | --- |
| `images/areas/yard.jpg` | Cozy seaside animal shelter at a harbor town, wooden gate, picket fence, lighthouse & sailboats |
| `images/areas/catroom.jpg` | Cat room with cat towers, cushions, yarn balls, sunny window with harbor view |
| `images/areas/dogrun.jpg` | Outdoor dog run with agility tunnel, doghouses, shade canopy, sea in background |
| `images/areas/clinic.jpg` | Friendly vet clinic room, examination table, medicine cabinet, mint & cream palette |
| `images/areas/lounge.jpg` | Adoption lounge with sofas, pet photo wall, fairy lights, balloons, golden hour harbor |
| `images/pets/cat.jpg` | Chibi orange tabby stray kitten portrait, bandage on ear, peach background |
| `images/pets/dog.jpg` | Chibi brown & white rescue puppy portrait, red collar, sky blue background |
| `images/pets/rabbit.jpg` | Chibi white baby bunny holding a carrot, mint background |
| `images/pets/persian.jpg` | Chibi fluffy cream Persian cat with pink bow, lavender background |

아이템 아이콘은 이모지를 BootScene 에서 그라데이션 타일 텍스처로 렌더링하므로 별도 에셋이 필요 없습니다.
