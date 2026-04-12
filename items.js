// items.js — 5 groups × 5 items for testing

var GROUPS_DATA = [];

// Helper to create items
function make(groupId, labels) {
  var items = [];
  for (var i = 0; i < labels.length; i++) {
    items.push({
      id: groupId + "_i" + (i + 1),
      label: labels[i]
    });
  }
  return items;
}

// 1. Tech Companies
GROUPS_DATA.push({
  id: "g1",
  title: "Tech Companies",
  items: make("g1", [
    "Apple",
    "Microsoft",
    "Google",
    "Meta",
    "Netflix"
  ])
});

// 2. Sports
GROUPS_DATA.push({
  id: "g2",
  title: "Sports",
  items: make("g2", [
    "Soccer",
    "Baseball",
    "Football",
    "Pickleball",
    "Tennis"
  ])
});

// 3. Elements
GROUPS_DATA.push({
  id: "g3",
  title: "Elements",
  items: make("g3", [
    "Nitrogen",
    "Oxygen",
    "Carbon",
    "Helium",
    "Neon"
  ])
});

// 4. Building Materials
GROUPS_DATA.push({
  id: "g4",
  title: "Building Materials",
  items: make("g4", [
    "Wood",
    "Stone",
    "Concrete",
    "Rebar",
    "Metal"
  ])
});

// 5. Soccer Players
GROUPS_DATA.push({
  id: "g5",
  title: "Soccer Players",
  items: make("g5", [
    "Messi",
    "Ronaldo",
    "Vitinha",
    "Haaland",
    "Semenyo"
  ])
});
