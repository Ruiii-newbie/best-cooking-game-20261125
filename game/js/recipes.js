// Sizzle & Serve — recipes and order generation.
// Every dish is an original invention for this kitchen. An item is named by
// its kind plus the prep it needs: "patty:grilled", "lettuce:chopped".
// A plate serves an order only when its items match the recipe exactly.

const ITEMS = {
  bun:     { name: 'Bun',     color: '#e8b96a', prep: null,      key: '1' },
  patty:   { name: 'Patty',   color: '#8a5a2e', prep: 'grill',   key: '2' },
  cheese:  { name: 'Cheese',  color: '#f7c948', prep: null,      key: '3' },
  lettuce: { name: 'Lettuce', color: '#6abe30', prep: 'chop',    key: '4' },
  tomato:  { name: 'Tomato',  color: '#e94f37', prep: 'chop',    key: '5' },
  onion:   { name: 'Onion',   color: '#b388eb', prep: 'chop',    key: '6' },
};

const BIN_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'];

// A recipe step: { item, state } where state is 'raw' (no prep needed),
// 'grilled' (patty off the grill) or 'chopped' (off the board).
const RECIPES = [
  {
    id: 'sunny-stack', name: 'Sunny Stack', price: 12, minLevel: 1,
    blurb: 'The house classic. Golden bun, sizzling patty, melty cheese.',
    steps: [
      { item: 'bun', state: 'raw' },
      { item: 'patty', state: 'grilled' },
      { item: 'cheese', state: 'raw' },
      { item: 'lettuce', state: 'chopped' },
    ],
  },
  {
    id: 'garden-crunch', name: 'Garden Crunch', price: 9, minLevel: 1,
    blurb: 'No grill, all crunch. Three fresh chops on one plate.',
    steps: [
      { item: 'lettuce', state: 'chopped' },
      { item: 'tomato', state: 'chopped' },
      { item: 'onion', state: 'chopped' },
    ],
  },
  {
    id: 'melty-cheese-melt', name: 'Melty Cheese Melt', price: 10, minLevel: 1,
    blurb: 'Cheese first, questions later. A quick one for the lunch rush.',
    steps: [
      { item: 'bun', state: 'raw' },
      { item: 'cheese', state: 'raw' },
      { item: 'tomato', state: 'chopped' },
    ],
  },
  {
    id: 'firehouse-stack', name: 'Firehouse Stack', price: 16, minLevel: 2,
    blurb: 'Two patties, one very hungry customer. Keep the grill hot.',
    steps: [
      { item: 'bun', state: 'raw' },
      { item: 'patty', state: 'grilled' },
      { item: 'patty', state: 'grilled' },
      { item: 'cheese', state: 'raw' },
    ],
  },
  {
    id: 'sunrise-special', name: 'Sunrise Special', price: 18, minLevel: 3,
    blurb: 'The full works. Five pieces, one plate, zero room for error.',
    steps: [
      { item: 'bun', state: 'raw' },
      { item: 'patty', state: 'grilled' },
      { item: 'cheese', state: 'raw' },
      { item: 'tomato', state: 'chopped' },
      { item: 'onion', state: 'chopped' },
    ],
  },
];

// "bun:raw" style key for one prepared item; plate and recipe compare on it.
function itemKey(step) {
  return step.item + ':' + step.state;
}

function recipeKeyList(recipe) {
  return recipe.steps.map(itemKey).sort();
}

// Pick a recipe the current level has unlocked, weighted toward cheap
// dishes early so the first minute teaches the loop instead of punishing it.
function pickRecipe(level, random) {
  const open = RECIPES.filter(function (r) { return r.minLevel <= level; });
  const pool = [];
  open.forEach(function (r) {
    const weight = r.minLevel === 1 ? 3 : 1;
    for (let i = 0; i < weight; i++) pool.push(r);
  });
  return pool[Math.floor(random() * pool.length)];
}

// Seconds an order lives: long early, tighter as the kitchen levels up.
function orderTimeLimit(level) {
  return Math.max(35, 75 - level * 5);
}

// Seconds between new orders arriving.
function orderSpawnInterval(level) {
  return Math.max(8, 15 - level);
}
