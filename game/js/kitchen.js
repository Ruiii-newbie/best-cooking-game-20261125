// Sizzle & Serve — kitchen state, input, timers and scoring.
// One screen at a time: title -> play -> over. The cook's hand holds one
// item; the board chops, the grill cooks, the plate assembles, SERVE pays.

const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 56 },
  orders: { x: 16, y: 66, w: 400, h: 116, gap: 16 },
  bins: { x: 16, y: 200, w: 196, h: 104, gap: 16 },
  board: { x: 16, y: 330, w: 340, h: 250 },
  grill: { x: 372, y: 330, w: 340, h: 250 },
  plate: { x: 728, y: 330, w: 300, h: 250 },
  serveBtn: { x: 1044, y: 330, w: 220, h: 110 },
  trashBtn: { x: 1044, y: 456, w: 220, h: 60 },
  muteBtn: { x: 1044, y: 532, w: 220, h: 48 },
  bottom: { x: 16, y: 596, w: 1248, h: 184 },
};

const CHOP_TIME = 1.4;
const GRILL_TIME = 3.0;
const BURN_TIME = 5.0;
const MAX_PLATE = 6;
const MAX_STRIKES = 3;

const Game = {
  screen: 'title', // 'title' | 'play' | 'over'
  time: 0,
  level: 1,
  served: 0,
  coins: 0,
  combo: 0,
  bestCombo: 0,
  strikes: 0,
  orders: [],
  spawnIn: 2,
  hand: null, // { item, state }
  chop: null, // { item, progress, total }
  grill: [null, null], // { item, progress, total, done, burnIn }
  plate: [], // { item, state }
  floats: [], // { x, y, text, color, life }
  message: 'Welcome to Sizzle & Serve!',
  messageLife: 0,
  demo: false,
};

function resetGame() {
  Game.screen = 'play';
  Game.time = 0;
  Game.level = 1;
  Game.served = 0;
  Game.coins = 0;
  Game.combo = 0;
  Game.bestCombo = 0;
  Game.strikes = 0;
  Game.orders = [];
  Game.spawnIn = 2;
  Game.hand = null;
  Game.chop = null;
  Game.grill = [null, null];
  Game.plate = [];
  Game.floats = [];
  setMessage('First order in 2 seconds — grab a bun!');
}

function setMessage(text, seconds) {
  Game.message = text;
  Game.messageLife = seconds || 4;
}

function addFloat(x, y, text, color) {
  Game.floats.push({ x: x, y: y, text: text, color: color || '#fff', life: 1.6 });
}

function spawnOrder() {
  const recipe = pickRecipe(Game.level, Math.random);
  const total = orderTimeLimit(Game.level);
  Game.orders.push({ recipe: recipe, timeLeft: total, total: total, id: Game.time });
  setMessage('New order: ' + recipe.name + '!');
}

function plateKeys() {
  return Game.plate.map(itemKey).sort();
}

function orderMatches(order) {
  const want = recipeKeyList(order.recipe);
  const have = plateKeys();
  if (want.length !== have.length) return false;
  for (let i = 0; i < want.length; i++) {
    if (want[i] !== have[i]) return false;
  }
  return true;
}

function matchingOrderIndex() {
  for (let i = 0; i < Game.orders.length; i++) {
    if (orderMatches(Game.orders[i])) return i;
  }
  return -1;
}

function servePlate() {
  if (Game.screen !== 'play') return;
  const idx = matchingOrderIndex();
  if (idx < 0) {
    if (Game.plate.length === 0) {
      setMessage('Plate is empty — build a dish first!');
    } else {
      setMessage('No open order matches this plate. Check the board!');
      Game.combo = 0;
      Sfx.fail();
    }
    return;
  }
  const order = Game.orders[idx];
  const tip = Math.round(5 * (order.timeLeft / order.total));
  const pay = order.recipe.price + tip;
  Game.coins += pay;
  Game.served += 1;
  Game.combo += 1;
  Game.bestCombo = Math.max(Game.bestCombo, Game.combo);
  Game.orders.splice(idx, 1);
  Game.plate = [];
  const card = orderCardRect(idx);
  addFloat(card.x + 200, card.y + 30, '+$' + pay, '#ffd94d');
  if (Game.combo >= 2) addFloat(card.x + 200, card.y + 58, 'COMBO x' + Game.combo + '!', '#7CFC00');
  Sfx.serve();
  setMessage('Served ' + order.recipe.name + ' for $' + pay + (tip > 0 ? ' (incl. $' + tip + ' tip)' : '') + '!');
  if (Game.served % 5 === 0) {
    Game.level += 1;
    Sfx.levelUp();
    setMessage('LEVEL UP! Level ' + Game.level + ' — orders arrive faster.', 5);
    addFloat(640, 300, 'LEVEL ' + Game.level + '!', '#ffd94d');
  }
}

function grabBin(item) {
  if (Game.screen !== 'play') return;
  if (Game.hand) {
    setMessage('Hands full — place or trash what you hold first.');
    return;
  }
  Game.hand = { item: item, state: 'raw' };
  Sfx.pickup();
}

function clickBoard() {
  if (Game.screen !== 'play') return;
  if (Game.chop) return; // already chopping
  if (!Game.hand) {
    setMessage('Grab a lettuce, tomato or onion first, then chop it here.');
    return;
  }
  if (ITEMS[Game.hand.item].prep !== 'chop') {
    setMessage(ITEMS[Game.hand.item].name + " doesn't need chopping.");
    return;
  }
  Game.chop = { item: Game.hand.item, progress: 0, total: CHOP_TIME };
  Game.hand = null;
  Sfx.chop();
}

function clickGrillSlot(slot) {
  if (Game.screen !== 'play') return;
  const g = Game.grill[slot];
  if (g && g.done) {
    if (g.burnt) {
      Game.grill[slot] = null;
      addFloat(grillSlotRect(slot).x + 70, grillSlotRect(slot).y + 20, 'Burnt! Tossed.', '#ff6b6b');
      Sfx.fail();
      return;
    }
    if (Game.hand) {
      setMessage('Hands full — place what you hold first.');
      return;
    }
    Game.hand = { item: 'patty', state: 'grilled' };
    Game.grill[slot] = null;
    Sfx.pickup();
    return;
  }
  if (g) return; // still cooking
  if (!Game.hand || Game.hand.item !== 'patty' || Game.hand.state !== 'raw') {
    setMessage('The grill only takes raw patties. Grab one from the bin.');
    return;
  }
  Game.grill[slot] = { item: 'patty', progress: 0, total: GRILL_TIME, done: false, burnIn: BURN_TIME, burnt: false };
  Game.hand = null;
  Sfx.place();
}

function clickPlate() {
  if (Game.screen !== 'play') return;
  if (!Game.hand) {
    setMessage('Grab an ingredient, prep it if needed, then add it here.');
    return;
  }
  if (Game.plate.length >= MAX_PLATE) {
    setMessage('Plate is full — serve it or trash something.');
    return;
  }
  Game.plate.push({ item: Game.hand.item, state: Game.hand.state });
  Game.hand = null;
  Sfx.place();
}

function clickPlateItem(i) {
  if (Game.screen !== 'play') return;
  if (i < 0 || i >= Game.plate.length) return;
  const removed = Game.plate.splice(i, 1)[0];
  addFloat(plateRect().x + 150, plateRect().y + 40, ITEMS[removed.item].name + ' off', '#ffb3b3');
}

function clickTrash() {
  if (Game.screen !== 'play') return;
  if (Game.hand) {
    Game.hand = null;
    setMessage('Tossed it. Fresh start.');
    return;
  }
  if (Game.plate.length > 0) {
    Game.plate = [];
    setMessage('Plate cleared.');
    return;
  }
  setMessage('Nothing to trash — your hands and plate are empty.');
}

function update(dt) {
  if (Game.screen !== 'play') return;
  Game.time += dt;
  if (Game.messageLife > 0) Game.messageLife -= dt;

  // Orders arrive on a timer while fewer than 3 are open.
  Game.spawnIn -= dt;
  if (Game.spawnIn <= 0) {
    if (Game.orders.length < 3) spawnOrder();
    Game.spawnIn = orderSpawnInterval(Game.level);
  }

  // Order timers run out: a strike, and three strikes end the shift.
  for (let i = Game.orders.length - 1; i >= 0; i--) {
    Game.orders[i].timeLeft -= dt;
    if (Game.orders[i].timeLeft <= 0) {
      const lost = Game.orders.splice(i, 1)[0];
      Game.strikes += 1;
      Game.combo = 0;
      Sfx.fail();
      setMessage('Order lost: ' + lost.recipe.name + '! Strike ' + Game.strikes + '/' + MAX_STRIKES + '.', 5);
      if (Game.strikes >= MAX_STRIKES) {
        Game.screen = 'over';
        setMessage('', 0);
      }
    }
  }

  // Chopping finishes and the chopped item lands back in hand.
  if (Game.chop) {
    Game.chop.progress += dt;
    if (Game.chop.progress >= Game.chop.total) {
      const item = Game.chop.item;
      Game.chop = null;
      if (!Game.hand) {
        Game.hand = { item: item, state: 'chopped' };
        Sfx.chopDone();
      }
    }
  }

  // Grill slots cook, then sit done until picked up or burnt.
  for (let s = 0; s < Game.grill.length; s++) {
    const g = Game.grill[s];
    if (!g) continue;
    if (!g.done) {
      g.progress += dt;
      if (g.progress >= g.total) {
        g.done = true;
        Sfx.grillDone();
        addFloat(grillSlotRect(s).x + 70, grillSlotRect(s).y + 20, 'Patty ready!', '#ffd94d');
      }
    } else if (!g.burnt) {
      g.burnIn -= dt;
      if (g.burnIn <= 0) g.burnt = true;
    }
  }

  for (let i = Game.floats.length - 1; i >= 0; i--) {
    Game.floats[i].life -= dt;
    Game.floats[i].y -= 22 * dt;
    if (Game.floats[i].life <= 0) Game.floats.splice(i, 1);
  }
}

// --- Hit-testing: rectangles shared with the renderer. ---

function orderCardRect(i) {
  const o = LAYOUT.orders;
  return { x: o.x + i * (o.w + o.gap), y: o.y, w: o.w, h: o.h };
}

function binRect(i) {
  const b = LAYOUT.bins;
  return { x: b.x + i * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}

function boardRect() { return LAYOUT.board; }
function grillRect() { return LAYOUT.grill; }

function grillSlotRect(slot) {
  const g = LAYOUT.grill;
  const w = (g.w - 48) / 2;
  return { x: g.x + 16 + slot * (w + 16), y: g.y + 84, w: w, h: 120 };
}

function plateRect() { return LAYOUT.plate; }
function serveRect() { return LAYOUT.serveBtn; }
function trashRect() { return LAYOUT.trashBtn; }
function muteRect() { return LAYOUT.muteBtn; }

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function handleClick(x, y) {
  if (Game.screen === 'title') {
    if (inRect(x, y, { x: 440, y: 560, w: 400, h: 84 })) resetGame();
    return;
  }
  if (Game.screen === 'over') {
    if (inRect(x, y, { x: 440, y: 560, w: 400, h: 84 })) resetGame();
    return;
  }
  if (inRect(x, y, muteRect())) {
    const m = Sfx.toggleMute();
    setMessage(m ? 'Sound off.' : 'Sound on.');
    return;
  }
  for (let i = 0; i < 3; i++) {
    if (i < Game.orders.length && inRect(x, y, orderCardRect(i))) {
      servePlate();
      return;
    }
  }
  for (let i = 0; i < BIN_ORDER.length; i++) {
    if (inRect(x, y, binRect(i))) {
      grabBin(BIN_ORDER[i]);
      return;
    }
  }
  if (inRect(x, y, boardRect())) { clickBoard(); return; }
  if (inRect(x, y, grillRect())) {
    for (let s = 0; s < 2; s++) {
      if (inRect(x, y, grillSlotRect(s))) { clickGrillSlot(s); return; }
    }
    return;
  }
  if (inRect(x, y, plateRect())) {
    const pr = plateRect();
    if (Game.hand) { clickPlate(); return; }
    // No hand: clicking an item icon under the plate removes it.
    if (y >= pr.y + 182 && y <= pr.y + 218) {
      const idx = Math.floor((x - pr.x - 18) / 44);
      if (idx >= 0 && idx < Game.plate.length) { clickPlateItem(idx); return; }
    }
    return;
  }
  if (inRect(x, y, serveRect())) { servePlate(); return; }
  if (inRect(x, y, trashRect())) { clickTrash(); return; }
}

function handleKey(key) {
  if (Game.screen === 'title' || Game.screen === 'over') {
    if (key === 'Enter' || key === ' ') resetGame();
    return;
  }
  if (key >= '1' && key <= '6') {
    grabBin(BIN_ORDER[Number(key) - 1]);
    return;
  }
  if (key === 'Enter') { servePlate(); return; }
  if (key === 'r' || key === 'R') { resetGame(); return; }
  if (key === 'm' || key === 'M') {
    const m = Sfx.toggleMute();
    setMessage(m ? 'Sound off.' : 'Sound on.');
  }
}

// --- Screenshot states: deterministic scenes, rendered once, no loop. ---

function demoState(shot) {
  Game.demo = true;
  Game.screen = 'play';
  Game.time = 0;
  Game.level = 2;
  Game.served = 7;
  Game.coins = 48;
  Game.combo = 3;
  Game.bestCombo = 4;
  Game.strikes = 0;
  Game.orders = [];
  Game.spawnIn = 9;
  Game.hand = null;
  Game.chop = null;
  Game.grill = [null, null];
  Game.plate = [];
  Game.floats = [];
  Game.messageLife = 0;

  if (shot === 'start') {
    Game.screen = 'title';
    Game.level = 1;
    Game.served = 0;
    Game.coins = 0;
    Game.combo = 0;
    Game.message = 'Welcome to Sizzle & Serve!';
    return;
  }

  const sunny = RECIPES[0];
  const garden = RECIPES[1];
  const melty = RECIPES[2];

  if (shot === 'play') {
    Game.orders = [
      { recipe: sunny, timeLeft: 42, total: 65, id: 1 },
      { recipe: garden, timeLeft: 58, total: 70, id: 2 },
    ];
    Game.plate = [
      { item: 'bun', state: 'raw' },
      { item: 'patty', state: 'grilled' },
      { item: 'cheese', state: 'raw' },
    ];
    Game.chop = { item: 'lettuce', progress: 0.84, total: CHOP_TIME };
    Game.grill = [{ item: 'patty', progress: 2.1, total: GRILL_TIME, done: false, burnIn: BURN_TIME, burnt: false }, null];
    Game.hand = { item: 'tomato', state: 'raw' };
    Game.message = 'Sunny Stack needs chopped lettuce — chop it, then serve!';
    Game.messageLife = 99;
    return;
  }

  if (shot === 'serve') {
    Game.orders = [
      { recipe: sunny, timeLeft: 31, total: 65, id: 1 },
      { recipe: melty, timeLeft: 52, total: 70, id: 2 },
    ];
    Game.plate = [
      { item: 'bun', state: 'raw' },
      { item: 'patty', state: 'grilled' },
      { item: 'cheese', state: 'raw' },
      { item: 'lettuce', state: 'chopped' },
    ];
    Game.message = 'Plate matches Sunny Stack — SERVE it!';
    Game.messageLife = 99;
    Game.floats = [{ x: 880, y: 300, text: '+$17', color: '#ffd94d', life: 1.6 }];
    return;
  }

  // Unknown shot: plain title.
  Game.screen = 'title';
}
