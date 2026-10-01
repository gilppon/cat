# 🐾 Pet Shelter Restore Merge (Pets Harbor & Home Restore)

A cozy healing merge game that combines a Phaser 3 + TypeScript merge board with a React + Tailwind UI.
Restore an abandoned harbor shelter while you look after stray cats, rescue dogs, bunnies and Persian friends.

## Game Loop
1. **Tap the generators** – 🧺 Food Pantry / 🎁 Toy Box / 🧰 First Aid Box (costs ⚡1, refills 1 every 20 seconds)
2. **Merge** – drag two identical items together to move up one level (Lv.1~7 per category)
3. **Fill requests** – deliver the item a friend asked for (category + level) → 💰 coins + ❤️ hearts
4. **Restore the shelter** – spend hearts/coins to restore 5 areas (15 tasks) → new animal residents, generator upgrades, higher max energy

## Folder Structure
```
src/
├── main.tsx                 # React entry
├── App.tsx                  # Layout (mobile / desktop responsive)
├── types/game.ts            # ItemConfig, BoardCell, PetOrder, PlayerData
├── managers/
│   ├── SaveManager.ts       # localStorage save · load · range-clamped normalization
│   ├── MergeManager.ts      # ITEM_DATABASE, merge rules, generator odds
│   ├── OrderManager.ts      # Animal request generator / reward formula
│   └── GameStore.ts         # Single shared state store for Phaser ↔ React
├── game/
│   ├── main.ts              # Phaser.Game setup (Scale.FIT, transparent canvas)
│   └── constants.ts         # Board layout constants
├── scenes/
│   ├── BootScene.ts         # Generates every tile/item/fx texture on a canvas
│   └── MainScene.ts         # 6x6 board, drag & drop, merge/deliver effects, particles
├── components/              # TopBar, OrdersPanel, ShelterPanel, ShopModal, Overlays, PhaserBoard, TitleScreen, ItemInfoBar, ui
├── hooks/useGame.ts         # GameStore subscription (useSyncExternalStore) + useNow timer
├── data/shelter.ts          # Area · task · animal data
├── lib/                     # sfx(WebAudio), korean(particle helper), assets(BASE_URL path)
└── utils/cn.ts              # Class merging (ui.tsx's cx is a compat alias)
```

## Development
- `npm ci` → `npm run dev` (dev) / `npm run build` (tsc + vite singlefile) / `npm run typecheck`
- Deploys use `base: './'` plus the `asset()` helper so images load correctly from sub-paths
- Save key: `PETS_HARBOR_SAVE_V1` (plain JSON, range-clamped — not intended for server rankings)

## AI Image Asset Prompts
Common style: *soft hand-painted 2D cartoon illustration, cozy mobile merge game art style, pastel palette, no text*

| File | Prompt summary |
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

Item icons are emoji, rendered by BootScene as gradient tile textures, so no separate assets are needed.
