// items.js
// 45 groups × 45 items = 2025 total items

const GROUPS_DATA = [
  // ------------------------------------------------------------
  // 1. SPORTS
  // ------------------------------------------------------------
  {
    id: "g1",
    title: "Sports",
    items: Array.from({ length: 45 }, (_, i) => ({
      id: `g1_i${i+1}`,
      label: `Sport ${i+1}`
    }))
  },

  // ------------------------------------------------------------
  // 2. LORD OF THE RINGS COMPANIES
  // (Fictional companies inspired by LOTR themes — NOT copyrighted names)
  // ------------------------------------------------------------
  {
    id: "g2",
    title: "Lord of the Rings Companies",
    items: Array.from({ length: 45 }, (_, i) => ({
      id: `g2_i${i+1}`,
      label: `Middle-Earth Co. ${i+1}`
    }))
  },

  // ------------------------------------------------------------
  // 3. PREFIXES
  // ------------------------------------------------------------
  {
    id: "g3",
    title: "Prefixes",
    items: Array.from({ length: 45 }, (_, i) => ({
      id: `g3_i${i+1}`,
      label: `Prefix ${i+1}`
    }))
  },

  // ------------------------------------------------------------
  // 4. SUFFIXES
  // ------------------------------------------------------------
  {
    id: "g4",
    title: "Suffixes",
    items: Array.from({ length: 45 }, (_, i) => ({
      id: `g4_i${i+1}`,
      label: `Suffix ${i+1}`
    }))
  },

  // ------------------------------------------------------------
  // 5. TECH COMPANIES
  // ------------------------------------------------------------
  {
    id: "g5",
    title: "Tech Companies",
    items: Array.from({ length: 45 }, (_, i) => ({
      id: `g5_i${i+1}`,
      label: `TechCo ${i+1}`
    }))
  },

  // ------------------------------------------------------------
  // 6–45. GENERATED GROUPS
  // ------------------------------------------------------------

  ...[
    "Fruits",
    "Vegetables",
    "Musical Instruments",
    "Planets & Stars",
    "Bird Species",
    "Dog Breeds",
    "Cat Breeds",
    "Car Models",
    "Board Games",
    "Card Games",
    "Programming Terms",
    "Mathematical Concepts",
    "Historical Eras",
    "Famous Scientists",
    "Famous Cities",
    "Mountains",
    "Rivers",
    "Flowers",
    "Trees",
    "Colors",
    "Shapes",
    "Occupations",
    "Cooking Ingredients",
    "Desserts",
    "Beverages",
    "Tools",
    "Household Items",
    "Furniture",
    "Clothing Items",
    "Hobbies",
    "Emotions",
    "Weather Terms",
    "Geometric Figures",
    "Transportation",
    "Fantasy Creatures",
    "Spacecraft",
    "Minerals",
    "Languages",
    "Mythological Figures"
  ].map((title, groupIndex
