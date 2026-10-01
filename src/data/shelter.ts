import type { ItemCategory, PetSpecies, PetType, ShelterArea } from '../types/game';

/* ---------------- Animal friends ---------------- */
export const PET_SPECIES: Record<string, PetSpecies> = {
  stray_cat_01: { id: 'stray_cat_01', type: 'cat', label: 'Stray Cat', image: 'images/pets/cat.webp', color: '#FFE0C2' },
  puppy_01: { id: 'puppy_01', type: 'dog', label: 'Rescue Dog', image: 'images/pets/dog.webp', color: '#D6ECFF' },
  bunny_01: { id: 'bunny_01', type: 'rabbit', label: 'Baby Bunny', image: 'images/pets/rabbit.webp', color: '#D8F5E4' },
  persian_01: { id: 'persian_01', type: 'persian', label: 'Persian', image: 'images/pets/persian.webp', color: '#ECE3FF' },
};

export const PET_ORDER = ['stray_cat_01', 'puppy_01', 'bunny_01', 'persian_01'];

export const PET_BY_TYPE: Record<PetType, PetSpecies> = {
  cat: PET_SPECIES['stray_cat_01']!,
  dog: PET_SPECIES['puppy_01']!,
  rabbit: PET_SPECIES['bunny_01']!,
  persian: PET_SPECIES['persian_01']!,
};

export const PET_NAMES = [
  'Nabi', 'Cheese', 'Kkami', 'Momo', 'Coco', 'Bori', 'Kongi', 'Dubu', 'Walnut', 'Bami',
  'Choco', 'Lulu', 'Byeoli', 'Dari', 'Cloud', 'Mango', 'Tori', 'Seolgi', 'Cookie', 'Latte',
  'Mongi', 'Happi', 'Somi', 'Button', 'Milk', 'Sweet Potato', 'Siru', 'Haru', 'Bomi', 'Jjang-a',
];

export const ORDER_LINES: Record<ItemCategory, string[]> = {
  food: ['My tummy is so hungry…', 'I want something tasty!', 'Rumble rumble… feed me, please!', 'I want a special treat today'],
  toy: ["I'm bored~ play with me!", 'Will you play with me?', 'I want a brand new toy', 'I want to run and play!'],
  medicine: ['I feel sick…', 'My paw pads hurt', 'Cough cough… I need medicine', "I'll be fine after treatment"],
};

/* ---------------- Shelter restore areas ---------------- */
export const SHELTER_AREAS: ShelterArea[] = [
  {
    id: 'yard',
    name: 'Gate & Front Yard',
    emoji: '🏡',
    image: 'images/areas/yard.webp',
    description: 'The shelter gate is buried in weeds with a broken fence. Tidy it up so animals feel safe coming in.',
    tasks: [
      { id: 'yard_weeds', name: 'Pull the Wild Weeds', emoji: '🌿', hearts: 5, coins: 0 },
      { id: 'yard_fence', name: 'Fix the Broken Fence', emoji: '🔨', hearts: 8, coins: 30 },
      { id: 'yard_sign', name: 'Hang a Shiny New Sign', emoji: '🏷️', hearts: 12, coins: 60 },
    ],
    reward: { unlockPet: 'puppy_01', maxEnergy: 10 },
    rewardText: ['🐶 Rescue dogs move in', '⚡ Max energy +10'],
  },
  {
    id: 'catroom',
    name: 'Sunny Cat Room',
    emoji: '🐱',
    image: 'images/areas/catroom.webp',
    description: 'Turn a dusty old shed into a sunny room where cats love to nap.',
    tasks: [
      { id: 'cat_clean', name: 'Sweep Dust & Cobwebs', emoji: '🧹', hearts: 10, coins: 0 },
      { id: 'cat_tower', name: 'Build a Wooden Cat Tower', emoji: '🐾', hearts: 12, coins: 80 },
      { id: 'cat_window', name: 'Swap in a Sunny Window', emoji: '🌤️', hearts: 15, coins: 120 },
    ],
    reward: { generators: ['food'], coins: 100 },
    rewardText: ['🧺 Food Pantry upgraded (better item odds)', '💰 Bonus coins +100'],
  },
  {
    id: 'dogrun',
    name: 'Happy Dog Run',
    emoji: '🐶',
    image: 'images/areas/dogrun.webp',
    description: 'Turn a rocky lot into a green play yard where dogs can run to their heart\'s content.',
    tasks: [
      { id: 'dog_grass', name: 'Lay Down Fresh Grass', emoji: '🌱', hearts: 15, coins: 120 },
      { id: 'dog_agility', name: 'Set Up Agility Gear', emoji: '🎾', hearts: 18, coins: 160 },
      { id: 'dog_shade', name: 'Add a Cool Shade Canopy', emoji: '⛱️', hearts: 22, coins: 200 },
    ],
    reward: { unlockPet: 'bunny_01', generators: ['toy'] },
    rewardText: ['🐰 Baby bunnies move in', '🎁 Toy Box upgraded'],
  },
  {
    id: 'clinic',
    name: 'Warm Clinic Room',
    emoji: '🏥',
    image: 'images/areas/clinic.webp',
    description: 'Restore the shabby clinic so sick friends can be cared for right away.',
    tasks: [
      { id: 'clinic_table', name: 'Repair the Exam Table', emoji: '🔧', hearts: 20, coins: 200 },
      { id: 'clinic_cabinet', name: 'Tidy the Medicine Cabinet', emoji: '💊', hearts: 25, coins: 260 },
      { id: 'clinic_gear', name: 'Bring in Test Gear', emoji: '🔬', hearts: 30, coins: 320 },
    ],
    reward: { unlockPet: 'persian_01', generators: ['medicine'], maxEnergy: 10 },
    rewardText: ['🐈 Persian cats move in', '🧰 First Aid Box upgraded', '⚡ Max energy +10'],
  },
  {
    id: 'lounge',
    name: 'Happy Adoption Lounge',
    emoji: '💝',
    image: 'images/areas/lounge.webp',
    description: 'A special place where new families meet. Restore the lounge so everyone can smile!',
    tasks: [
      { id: 'lounge_sofa', name: 'Place a Cozy Sofa', emoji: '🛋️', hearts: 24, coins: 240 },
      { id: 'lounge_photos', name: 'Decorate the Memory Wall', emoji: '🖼️', hearts: 30, coins: 320 },
      { id: 'lounge_party', name: 'Host an Adoption Party', emoji: '🎉', hearts: 36, coins: 400 },
    ],
    reward: { generators: ['food', 'toy', 'medicine'], maxEnergy: 20 },
    rewardText: ['🏆 Shelter fully restored!', '✨ All generators upgraded', '⚡ Max energy +20'],
  },
];
