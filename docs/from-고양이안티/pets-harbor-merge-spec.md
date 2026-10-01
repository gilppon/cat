# 유기동물 쉼터 복원 머지 (Pets Harbor & Home Restore) 전체 개발 사양서 & TypeScript Source Code

본 문서는 **유기동물 쉼터 복원 머지 (Pets Harbor & Home Restore)** 게임의 전체 시스템 아키텍처, 실행 가능한 Phaser 3 + TypeScript 풀 소스코드, 그리고 AI 이미지 에셋 생성 프롬프트 모음입니다.

---

## 1. 프로젝트 구조 (Project Structure)

Vite + TypeScript + Phaser 3 기반의 프로젝트 폴더 구조입니다.

```text
pets-harbor-merge/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts
    ├── types/
    │   └── game.ts
    ├── managers/
    │   ├── SaveManager.ts
    │   └── MergeManager.ts
    └── scenes/
        ├── BootScene.ts
        └── MainScene.ts
```

---

## 2. package.json & Vite 설정

```json
{
  "name": "pets-harbor-merge",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "phaser": "^3.80.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

---

## 3. TypeScript 타입 정의 (`src/types/game.ts`)

```typescript
export interface ItemConfig {
  id: string;
  category: 'food' | 'toy' | 'medicine';
  level: number;
  name: string;
  textureKey: string;
  maxLevel: number;
}

export interface BoardCell {
  row: number;
  col: number;
  item: ItemConfig | null;
}

export interface PetOrder {
  id: string;
  petName: string;
  petType: 'cat' | 'dog' | 'rabbit' | 'persian';
  requiredCategory: 'food' | 'toy' | 'medicine';
  requiredLevel: number;
  rewardCoins: number;
  rewardHearts: number;
  isHealthy: boolean;
}

export interface PlayerData {
  coins: number;
  hearts: number;
  energy: number;
  maxEnergy: number;
  shelterLevel: number;
  unlockedPets: string[];
  boardState: (ItemConfig | null)[][];
  lastEnergyRegenTime: number;
}
```

---

## 4. 데이터 저장 및 세이브 매니저 (`src/managers/SaveManager.ts`)

```typescript
import { PlayerData, ItemConfig } from '../types/game';

const SAVE_KEY = 'PETS_HARBOR_SAVE_V1';

export class SaveManager {
  private static defaultData: PlayerData = {
    coins: 100,
    hearts: 20,
    energy: 50,
    maxEnergy: 50,
    shelterLevel: 1,
    unlockedPets: ['stray_cat_01'],
    boardState: Array(5).fill(null).map(() => Array(5).fill(null)),
    lastEnergyRegenTime: Date.now()
  };

  public static load(): PlayerData {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...this.defaultData };
    try {
      return JSON.parse(raw) as PlayerData;
    } catch (e) {
      console.error('Failed to parse save data', e);
      return { ...this.defaultData };
    }
  }

  public static save(data: PlayerData): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  public static reset(): PlayerData {
    localStorage.removeItem(SAVE_KEY);
    return { ...this.defaultData };
  }
}
```

---

## 5. 코어 머지 로직 매니저 (`src/managers/MergeManager.ts`)

```typescript
import { ItemConfig } from '../types/game';

export const ITEM_DATABASE: Record<string, ItemConfig> = {
  // Food Line (Level 1~4)
  'food_1': { id: 'food_1', category: 'food', level: 1, name: '사료 작은 조각', textureKey: 'item_food_1', maxLevel: 4 },
  'food_2': { id: 'food_2', category: 'food', level: 2, name: '작은 사료 그릇', textureKey: 'item_food_2', maxLevel: 4 },
  'food_3': { id: 'food_3', category: 'food', level: 3, name: '풍성한 프리미엄 캔', textureKey: 'item_food_3', maxLevel: 4 },
  'food_4': { id: 'food_4', category: 'food', level: 4, name: '호화로운 영양 뷔페', textureKey: 'item_food_4', maxLevel: 4 },

  // Toy Line (Level 1~4)
  'toy_1': { id: 'toy_1', category: 'toy', level: 1, name: '작은 털실 뭉치', textureKey: 'item_toy_1', maxLevel: 4 },
  'toy_2': { id: 'toy_2', category: 'toy', level: 2, name: '딸랑이 쥐 인형', textureKey: 'item_toy_2', maxLevel: 4 },
  'toy_3': { id: 'toy_3', category: 'toy', level: 3, name: '푹신한 쿠션 방석', textureKey: 'item_toy_3', maxLevel: 4 },
  'toy_4': { id: 'toy_4', category: 'toy', level: 4, name: '화려한 캣타워 트라이브', textureKey: 'item_toy_4', maxLevel: 4 },
};

export class MergeManager {
  public static canMerge(a: ItemConfig | null, b: ItemConfig | null): boolean {
    if (!a || !b) return false;
    return a.category === b.category && a.level === b.level && a.level < a.maxLevel;
  }

  public static getNextLevelItem(current: ItemConfig): ItemConfig | null {
    const nextLevel = current.level + 1;
    const nextKey = `${current.category}_${nextLevel}`;
    return ITEM_DATABASE[nextKey] || null;
  }

  public static getRandomSpawnItem(): ItemConfig {
    const categories: ('food' | 'toy')[] = ['food', 'toy'];
    const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
    return ITEM_DATABASE[`${chosenCategory}_1`];
  }
}
```

---

## 6. 부트 및 리소스 씬 (`src/scenes/BootScene.ts`)

```typescript
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // UI Graphics Generation for Prototyping
    const g = this.add.graphics();

    // Placeholder textures for Items
    const colors: Record<string, number> = {
      item_food_1: 0xd2b48c,
      item_food_2: 0xcd853f,
      item_food_3: 0x8b4513,
      item_food_4: 0xffd700,
      item_toy_1: 0x87cefa,
      item_toy_2: 0x1e90ff,
      item_toy_3: 0x4169e1,
      item_toy_4: 0x00008b,
    };

    Object.entries(colors).forEach(([key, color]) => {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(4, 4, 56, 56, 12);
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeRoundedRect(4, 4, 56, 56, 12);
      g.generateTexture(key, 64, 64);
    });

    // Box Spawner Texture
    g.clear();
    g.fillStyle(0xff7f50, 1);
    g.fillRoundedRect(4, 4, 72, 72, 16);
    g.lineStyle(3, 0xffffff, 1);
    g.strokeRoundedRect(4, 4, 72, 72, 16);
    g.generateTexture('spawner_box', 80, 80);

    g.destroy();
  }

  create() {
    this.scene.start('MainScene');
  }
}
```

---

## 7. 메인 게임 씬 (`src/scenes/MainScene.ts`)

```typescript
import Phaser from 'phaser';
import { PlayerData, ItemConfig, PetOrder } from '../types/game';
import { SaveManager } from '../managers/SaveManager';
import { MergeManager } from '../managers/MergeManager';

export class MainScene extends Phaser.Scene {
  private playerData!: PlayerData;
  private boardGrid: (ItemConfig | null)[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  private tileSprites: Phaser.GameObjects.Container[][] = Array(5).fill(null).map(() => Array(5).fill(null));

  private coinsText!: Phaser.GameObjects.Text;
  private heartsText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private shelterLevelText!: Phaser.GameObjects.Text;

  private activeOrder: PetOrder = {
    id: 'order_1',
    petName: '치즈냥이',
    petType: 'cat',
    requiredCategory: 'food',
    requiredLevel: 3,
    rewardCoins: 50,
    rewardHearts: 15,
    isHealthy: false
  };

  private draggedItemContainer: Phaser.GameObjects.Container | null = null;
  private dragStartRow: number = -1;
  private dragStartCol: number = -1;

  constructor() {
    super('MainScene');
  }

  create() {
    this.playerData = SaveManager.load();
    if (this.playerData.boardState && this.playerData.boardState.length === 5) {
      this.boardGrid = this.playerData.boardState;
    }

    this.createHeaderUI();
    this.createShelterView();
    this.createMergeBoard();
    this.createSpawnerButton();
    this.createMonetizationButtons();

    this.renderBoard();
  }

  private createHeaderUI() {
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 0.9);
    bg.fillRect(0, 0, 480, 70);

    this.coinsText = this.add.text(20, 20, `💰 골드: ${this.playerData.coins}`, { fontSize: '18px', color: '#ffd700' });
    this.heartsText = this.add.text(140, 20, `❤️ 하트: ${this.playerData.hearts}`, { fontSize: '18px', color: '#ff6b6b' });
    this.energyText = this.add.text(260, 20, `⚡ 에너지: ${this.playerData.energy}/${this.playerData.maxEnergy}`, { fontSize: '18px', color: '#4cd137' });
    this.shelterLevelText = this.add.text(20, 45, `🏡 쉼터 레벨: Lv.${this.playerData.shelterLevel}`, { fontSize: '16px', color: '#ffffff' });
  }

  private createShelterView() {
    const shelterBg = this.add.graphics();
    shelterBg.fillStyle(0x34495e, 1);
    shelterBg.fillRoundedRect(20, 80, 440, 160, 16);

    const title = this.add.text(35, 95, '🐾 치료 대기 중인 유기동물', { fontSize: '18px', color: '#ffffff', style: 'bold' });
    const questText = this.add.text(
      35, 130, 
      `환자: [${this.activeOrder.petName}]
요구 치료제: ${this.activeOrder.requiredCategory === 'food' ? '프리미엄 캔 (Lv.3)' : '장난감 (Lv.3)'}
보상: 💰 ${this.activeOrder.rewardCoins}  |  ❤️ ${this.activeOrder.rewardHearts}`, 
      { fontSize: '15px', color: '#ecf0f1' }
    );

    const deliverBtn = this.add.text(340, 180, '🎁 치료 전달', {
      fontSize: '16px', color: '#ffffff', backgroundColor: '#27ae60', padding: { x: 10, y: 8 }
    }).setInteractive({ useHandCursor: true });

    deliverBtn.on('pointerdown', () => this.fulfillOrder());
  }

  private createMergeBoard() {
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0xdcdde1, 1);
    boardBg.fillRoundedRect(20, 260, 440, 440, 16);

    const startX = 40;
    const startY = 280;
    const tileSize = 72;
    const gap = 12;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const x = startX + c * (tileSize + gap);
        const y = startY + r * (tileSize + gap);

        const slotBg = this.add.graphics();
        slotBg.fillStyle(0xf5f6fa, 1);
        slotBg.fillRoundedRect(x, y, tileSize, tileSize, 12);
      }
    }
  }

  private createSpawnerButton() {
    const spawnerBtn = this.add.container(240, 740);
    const boxImg = this.add.image(0, 0, 'spawner_box');
    const label = this.add.text(0, 45, '📦 상자 열기 (-1⚡)', { fontSize: '16px', color: '#2c3e50', style: 'bold' }).setOrigin(0.5);

    spawnerBtn.add([boxImg, label]);
    boxImg.setInteractive({ useHandCursor: true });
    boxImg.on('pointerdown', () => this.spawnItem());
  }

  private createMonetizationButtons() {
    // IAA Reward Ad Button
    const adBtn = this.add.text(20, 800, '🎬 광고 보고 에너지 +20 충전 (IAA)', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#8e44ad', padding: { x: 12, y: 8 }
    }).setInteractive({ useHandCursor: true });

    adBtn.on('pointerdown', () => {
      this.playerData.energy = Math.min(this.playerData.maxEnergy, this.playerData.energy + 20);
      this.saveAndRefreshUI();
      alert('보상형 광고 시청 완료! 에너지가 +20 충전되었습니다.');
    });

    // IAP Store Button
    const iapBtn = this.add.text(260, 800, '💎 귀족 페르시안 입양 패스 (IAP)', {
      fontSize: '14px', color: '#ffffff', backgroundColor: '#e67e22', padding: { x: 12, y: 8 }
    }).setInteractive({ useHandCursor: true });

    iapBtn.on('pointerdown', () => {
      alert('인앱 결제 창 연결: 귀족 페르시안 고양이 특별 패스 구매 완료!');
    });
  }

  private spawnItem() {
    if (this.playerData.energy <= 0) {
      alert('에너지가 부족합니다! 광고를 보거나 대기하여 충전하세요.');
      return;
    }

    const emptySlots: { r: number; c: number }[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!this.boardGrid[r][c]) emptySlots.push({ r, c });
      }
    }

    if (emptySlots.length === 0) {
      alert('보드가 꽉 찼습니다! 같은 아이템을 머지하여 공간을 확보하세요.');
      return;
    }

    const slot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    const newItem = MergeManager.getRandomSpawnItem();
    this.boardGrid[slot.r][slot.c] = newItem;
    this.playerData.energy -= 1;

    this.saveAndRefreshUI();
    this.renderBoard();
  }

  private renderBoard() {
    const startX = 40;
    const startY = 280;
    const tileSize = 72;
    const gap = 12;

    // Clear previous sprites
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (this.tileSprites[r][c]) {
          this.tileSprites[r][c].destroy();
          this.tileSprites[r][c] = null!;
        }
      }
    }

    // Render items
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const item = this.boardGrid[r][c];
        if (!item) continue;

        const x = startX + c * (tileSize + gap) + tileSize / 2;
        const y = startY + r * (tileSize + gap) + tileSize / 2;

        const container = this.add.container(x, y);
        const img = this.add.image(0, 0, item.textureKey);
        const lvlText = this.add.text(20, 18, `Lv.${item.level}`, { fontSize: '12px', color: '#ffffff', backgroundColor: '#000000' }).setOrigin(0.5);

        container.add([img, lvlText]);
        container.setSize(tileSize, tileSize);
        container.setInteractive({ draggable: true });

        this.input.setDraggable(container);

        container.on('dragstart', () => {
          this.draggedItemContainer = container;
          this.dragStartRow = r;
          this.dragStartCol = c;
          container.setDepth(100);
        });

        container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
          container.x = dragX;
          container.y = dragY;
        });

        container.on('dragend', (pointer: Phaser.Input.Pointer) => {
          container.setDepth(1);
          this.handleDrop(r, c, pointer.x, pointer.y);
        });

        this.tileSprites[r][c] = container;
      }
    }
  }

  private handleDrop(startR: number, startC: number, pointerX: number, pointerY: number) {
    const startX = 40;
    const startY = 280;
    const tileSize = 72;
    const gap = 12;

    const targetC = Math.floor((pointerX - startX) / (tileSize + gap));
    const targetR = Math.floor((pointerY - startY) / (tileSize + gap));

    if (targetR < 0 || targetR >= 5 || targetC < 0 || targetC >= 5) {
      this.renderBoard();
      return;
    }

    if (startR === targetR && startC === targetC) {
      this.renderBoard();
      return;
    }

    const sourceItem = this.boardGrid[startR][startC];
    const targetItem = this.boardGrid[targetR][targetC];

    if (!targetItem) {
      // Move Item
      this.boardGrid[targetR][targetC] = sourceItem;
      this.boardGrid[startR][startC] = null;
    } else if (MergeManager.canMerge(sourceItem, targetItem)) {
      // Merge Item
      const upgradedItem = MergeManager.getNextLevelItem(sourceItem!);
      this.boardGrid[targetR][targetC] = upgradedItem;
      this.boardGrid[startR][startC] = null;
    }

    this.saveAndRefreshUI();
    this.renderBoard();
  }

  private fulfillOrder() {
    let foundR = -1, foundC = -1;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const item = this.boardGrid[r][c];
        if (item && item.category === this.activeOrder.requiredCategory && item.level === this.activeOrder.requiredLevel) {
          foundR = r;
          foundC = c;
          break;
        }
      }
      if (foundR !== -1) break;
    }

    if (foundR === -1) {
      alert(`치료 조건 미달! [${this.activeOrder.requiredCategory === 'food' ? '프리미엄 캔 (Lv.3)' : '장난감 (Lv.3)'}] 아이템을 머지해서 만들어 주세요.`);
      return;
    }

    // Consume item & give reward
    this.boardGrid[foundR][foundC] = null;
    this.playerData.coins += this.activeOrder.rewardCoins;
    this.playerData.hearts += this.activeOrder.rewardHearts;
    this.playerData.shelterLevel += 1;

    alert(`🎉 치료 성공! 유기동물 [${this.activeOrder.petName}] 치료 완료!
보상: 골드 +${this.activeOrder.rewardCoins}, 하트 +${this.activeOrder.rewardHearts}`);

    // Cycle order
    this.activeOrder = {
      id: 'order_2',
      petName: '아픈 멍멍이',
      petType: 'dog',
      requiredCategory: 'toy',
      requiredLevel: 3,
      rewardCoins: 80,
      rewardHearts: 25,
      isHealthy: false
    };

    this.saveAndRefreshUI();
    this.renderBoard();
  }

  private saveAndRefreshUI() {
    this.playerData.boardState = this.boardGrid;
    SaveManager.save(this.playerData);

    this.coinsText.setText(`💰 골드: ${this.playerData.coins}`);
    this.heartsText.setText(`❤️ 하트: ${this.playerData.hearts}`);
    this.energyText.setText(`⚡ 에너지: ${this.playerData.energy}/${this.playerData.maxEnergy}`);
    this.shelterLevelText.setText(`🏡 쉼터 레벨: Lv.${this.playerData.shelterLevel}`);
  }
}
```

---

## 8. AI 이미지 생성 프롬프트 (Midjourney / Flux / DALL-E 3)

### A. 머지 아이템 에셋 (Merge Items Sprite Sheet)
* **사료 라인 (Level 1~4)**:
  ```text
  2D game item sprite sheet, pet food progression levels: level 1 single dry kibble piece, level 2 small bowl of food, level 3 opened premium canned cat food, level 4 luxurious golden gourmet feast, cute cozy cartoon vector art, clean white background, isolated --v 6.0
  ```
* **장난감 라인 (Level 1~4)**:
  ```text
  2D game item sprite sheet, pet toy progression levels: level 1 small yarn ball, level 2 squeaky mouse toy, level 3 fluffy cushion bed, level 4 multi-tier luxurious cat tower, cute flat vector art style, isolated on white background --v 6.0
  ```

### B. 유기동물 캐릭터 (Pet Sprites)
* **치즈 고양이 (아픈 상태 vs 치료 상태)**:
  ```text
  2D cartoon game sprite, sad dirty ginger stray kitten with bandages, cute emotional expression, flat vector art style, isolated on solid white background --v 6.0
  ```
  ```text
  2D cartoon game sprite, happy healthy fluffy ginger cat wearing a cute red bow tie, joyful expression, flat vector art style, isolated on solid white background --v 6.0
  ```
* **귀족 페르시안 고양이 (IAP 프리미엄)**:
  ```text
  2D game character sprite, elegant fluffy white Persian cat wearing a small golden crown and royal cape, cute noble expression, flat vector art, isolated white background --v 6.0
  ```

### C. 쉼터 배경 & UI (Shelter Background & UI)
* **쉼터 내부 배경**:
  ```text
  2D cozy animal shelter interior background, pastel colors, warm sunlight filtering through windows, comfortable pet beds and toys, cartoon art style for mobile games --ar 16:9
  ```
* **아이템 보드 백그라운드**:
  ```text
  2D game UI element, 5x5 rounded grid board container, soft beige wood texture background, clean vector style for mobile puzzle game --ar 1:1
  ```

---

## 9. 빌드 및 배포 가이드 (Vercel / Poki / Telegram)

1. **로컬 실행**:
   ```bash
   npm install
   npm run dev
   ```
2. **무료 Vercel 배포**:
   * `npm run build` 실행 후 생성된 `dist` 폴더를 Vercel 또는 GitHub Pages에 연결하면 단 1분 만에 웹 배포 URL이 완성됩니다.
3. **Poki / Telegram SDK 연동**:
   * `index.html` 상단에 Poki SDK 스크립트(`<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>`) 및 Telegram WebApp 스크립트(`<script src="https://telegram.org/js/telegram-web-app.js"></script>`)를 삽입하여 보상형 광고 및 가상 화폐 결제를 즉시 연동할 수 있습니다.
