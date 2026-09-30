import type { ItemCategory, PetSpecies, PetType, ShelterArea } from '../types/game';

/* ---------------- 동물 친구들 ---------------- */
export const PET_SPECIES: Record<string, PetSpecies> = {
  stray_cat_01: { id: 'stray_cat_01', type: 'cat', label: '길고양이', image: 'images/pets/cat.jpg', color: '#FFE0C2' },
  puppy_01: { id: 'puppy_01', type: 'dog', label: '유기견', image: 'images/pets/dog.jpg', color: '#D6ECFF' },
  bunny_01: { id: 'bunny_01', type: 'rabbit', label: '아기 토끼', image: 'images/pets/rabbit.jpg', color: '#D8F5E4' },
  persian_01: { id: 'persian_01', type: 'persian', label: '페르시안', image: 'images/pets/persian.jpg', color: '#ECE3FF' },
};

export const PET_ORDER = ['stray_cat_01', 'puppy_01', 'bunny_01', 'persian_01'];

export const PET_BY_TYPE: Record<PetType, PetSpecies> = {
  cat: PET_SPECIES['stray_cat_01']!,
  dog: PET_SPECIES['puppy_01']!,
  rabbit: PET_SPECIES['bunny_01']!,
  persian: PET_SPECIES['persian_01']!,
};

export const PET_NAMES = [
  '나비', '치즈', '까미', '모모', '코코', '보리', '콩이', '두부', '호두', '밤이',
  '초코', '루루', '별이', '달이', '구름', '망고', '토리', '설기', '쿠키', '라떼',
  '몽이', '해피', '솜이', '단추', '우유', '감자', '시루', '하루', '봄이', '짱아',
];

export const ORDER_LINES: Record<ItemCategory, string[]> = {
  food: ['배가 너무 고파요…', '맛있는 거 먹고 싶어요!', '꼬르륵… 밥 주세요', '오늘은 특별식이 먹고 싶어요'],
  toy: ['심심해요~ 놀아줘요!', '같이 놀아줄래요?', '새 장난감이 갖고 싶어요', '신나게 뛰어놀고 싶어요!'],
  medicine: ['몸이 아파요…', '발바닥을 다쳤어요', '콜록콜록… 약이 필요해요', '치료받으면 금방 나을 거예요'],
};

/* ---------------- 쉼터 복원 구역 ---------------- */
export const SHELTER_AREAS: ShelterArea[] = [
  {
    id: 'yard',
    name: '정문과 앞마당',
    emoji: '🏡',
    image: 'images/areas/yard.jpg',
    description: '잡초가 무성하고 울타리가 부서진 쉼터 입구예요. 동물들이 안심하고 들어올 수 있게 정비해요.',
    tasks: [
      { id: 'yard_weeds', name: '무성한 잡초 뽑기', emoji: '🌿', hearts: 5, coins: 0 },
      { id: 'yard_fence', name: '부서진 울타리 수리', emoji: '🔨', hearts: 8, coins: 30 },
      { id: 'yard_sign', name: '반짝이는 새 간판 달기', emoji: '🏷️', hearts: 12, coins: 60 },
    ],
    reward: { unlockPet: 'puppy_01', maxEnergy: 10 },
    rewardText: ['🐶 유기견 친구들 입소', '⚡ 최대 에너지 +10'],
  },
  {
    id: 'catroom',
    name: '햇살 고양이 방',
    emoji: '🐱',
    image: 'images/areas/catroom.jpg',
    description: '먼지 쌓인 창고를 고양이들이 낮잠 자기 좋은, 햇살 가득한 방으로 바꿔요.',
    tasks: [
      { id: 'cat_clean', name: '먼지와 거미줄 청소', emoji: '🧹', hearts: 10, coins: 0 },
      { id: 'cat_tower', name: '원목 캣타워 설치', emoji: '🐾', hearts: 12, coins: 80 },
      { id: 'cat_window', name: '햇살 드는 창문 교체', emoji: '🌤️', hearts: 15, coins: 120 },
    ],
    reward: { generators: ['food'], coins: 100 },
    rewardText: ['🧺 사료 창고 업그레이드 (고급 아이템 확률 ↑)', '💰 보너스 코인 +100'],
  },
  {
    id: 'dogrun',
    name: '신나는 강아지 운동장',
    emoji: '🐶',
    image: 'images/areas/dogrun.jpg',
    description: '돌멩이투성이 공터를 강아지들이 마음껏 뛰어놀 수 있는 푸른 운동장으로 만들어요.',
    tasks: [
      { id: 'dog_grass', name: '푸른 잔디 깔기', emoji: '🌱', hearts: 15, coins: 120 },
      { id: 'dog_agility', name: '어질리티 놀이기구 설치', emoji: '🎾', hearts: 18, coins: 160 },
      { id: 'dog_shade', name: '시원한 그늘막 설치', emoji: '⛱️', hearts: 22, coins: 200 },
    ],
    reward: { unlockPet: 'bunny_01', generators: ['toy'] },
    rewardText: ['🐰 아기 토끼 친구들 입소', '🎁 장난감 상자 업그레이드'],
  },
  {
    id: 'clinic',
    name: '따뜻한 진료실',
    emoji: '🏥',
    image: 'images/areas/clinic.jpg',
    description: '아픈 친구들을 바로 돌볼 수 있도록 낡은 진료실을 깨끗하게 복원해요.',
    tasks: [
      { id: 'clinic_table', name: '진료대 수리', emoji: '🔧', hearts: 20, coins: 200 },
      { id: 'clinic_cabinet', name: '약장 정리', emoji: '💊', hearts: 25, coins: 260 },
      { id: 'clinic_gear', name: '검사 장비 들이기', emoji: '🔬', hearts: 30, coins: 320 },
    ],
    reward: { unlockPet: 'persian_01', generators: ['medicine'], maxEnergy: 10 },
    rewardText: ['🐈 페르시안 친구들 입소', '🧰 구급 상자 업그레이드', '⚡ 최대 에너지 +10'],
  },
  {
    id: 'lounge',
    name: '행복한 입양 라운지',
    emoji: '💝',
    image: 'images/areas/lounge.jpg',
    description: '새 가족을 만나는 특별한 공간이에요. 모두가 웃을 수 있는 라운지를 완성해요!',
    tasks: [
      { id: 'lounge_sofa', name: '포근한 소파 배치', emoji: '🛋️', hearts: 30, coins: 300 },
      { id: 'lounge_photos', name: '추억의 사진 벽 꾸미기', emoji: '🖼️', hearts: 36, coins: 400 },
      { id: 'lounge_party', name: '입양 축하 파티 열기', emoji: '🎉', hearts: 45, coins: 500 },
    ],
    reward: { generators: ['food', 'toy', 'medicine'], maxEnergy: 20 },
    rewardText: ['🏆 쉼터 완전 복원!', '✨ 모든 생성기 업그레이드', '⚡ 최대 에너지 +20'],
  },
];
