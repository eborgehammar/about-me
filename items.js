// items.js
// Helper to create items for a group
function createItems(groupId, baseLabel, count) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: groupId + "_i" + i,
      label: baseLabel + " " + i
    });
  }
  return items;
}

const GROUPS_DATA = [];

// 1. Sports
GROUPS_DATA.push({
  id: "g1",
  title: "Sports",
  items: createItems("g1", "Sport", 45)
});

// 2. Lord of the Rings Companies (generic, non-copyrighted)
GROUPS_DATA.push({
  id: "g2",
  title: "Lord of the Rings Companies",
  items: createItems("g2", "Middle-Earth Co.", 45)
});

// 3. Prefixes
GROUPS_DATA.push({
  id: "g3",
  title: "Prefixes",
  items: createItems("g3", "Prefix", 45)
});

// 4. Suffixes
GROUPS_DATA.push({
  id: "g4",
  title: "Suffixes",
  items: createItems("g4", "Suffix", 45)
});

// 5. Tech Companies
GROUPS_DATA.push({
  id: "g5",
  title: "Tech Companies",
  items: createItems("g5", "TechCo", 45)
});

// Extra group titles to reach 45 total groups
const EXTRA_GROUP_TITLES = [
  "Fruits",
  "Vegetables",
  "Musical Instruments",
  "Planets and Stars",
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
  "Mythological Figures",
  "Islands"
];

// Start from g6 because g1–g5 are used
for (let i = 0; i < EXTRA_GROUP_TITLES.length; i++) {
  const groupId = "g" + (6 + i);
  const title = EXTRA_GROUP_TITLES[i];
  GROUPS_DATA.push({
    id: groupId,
    title: title,
    items: createItems(groupId, title + " Item", 45)
  });
}
