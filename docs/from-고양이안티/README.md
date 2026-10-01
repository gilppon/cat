# 고양이안티 → 고양이 통합 메모 (2026-10-01)

## 판정: 고양이(React+Phaser)를 정본으로 유지, 고양이안티는 아카이브

| 항목 | 고양이 (정본) | 고양이안티 (아카이브) |
|---|---|---|
| 스택 | React 19 + Phaser 3.90 + Tailwind | Phaser 3.80 only, React 없음 |
| 보드 | 6x6, 3카테고리 x7Lv = 21종 | 5x5, 2카테고리 x4Lv = 8종 |
| 상태 | GameStore + SaveManager normalize + OrderManager | SaveManager 기본형, Order 하드코딩 |
| UI | TopBar/Orders/Shelter/Shop/Overlays 완비 | Phaser 텍스트 UI만 |
| 문서 | README만 | PRD/ISSUES/spec 601줄 (본 폴더로 이관됨) |

## 고양이안티에서 살린 것
- `PRD.md`, `ISSUES.md`, `pets-harbor-merge-spec.md` → 본 폴더 (기획 스펙창고)
- `adapters/` → PlatformAdapter 패턴 (Poki/Telegram 확장용, 고양이에는 없음. 필요시 이식)
- `audio-reference/` → WebAudio 합성음 원형 (고양이 lib/sfx.ts가 진화형)

## 버린 것 (의도적)
- 5x5 보드, 8종 아이템 DB, MainScene 하드코딩 퀘스트 → 고양이가 상위호환
- Phaser-only 구조 → React Shell이 있어야 다작 템플릿이 되므로 미채택

원본: `E:\solarena\_archive\고양이안티_20261001\`
