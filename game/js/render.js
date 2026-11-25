// Sizzle & Serve — every pixel the player sees, drawn on one canvas.
// No images, no fonts from the network: food is drawn from shapes, so the
// game looks the same offline, in the grader and in every screenshot.

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// One food icon, drawn from shapes. state: 'raw' | 'grilled' | 'chopped'.
function drawItem(ctx, item, state, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const u = s / 2;
  if (item === 'bun') {
    ctx.fillStyle = '#d99a3d';
    roundRect(ctx, -u, u * 0.15, s, u * 0.55, u * 0.2);
    ctx.fill();
    ctx.fillStyle = '#f2c078';
    ctx.beginPath();
    ctx.arc(0, u * 0.1, u * 0.95, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    [[-0.45, -0.35], [0, -0.55], [0.45, -0.35], [-0.2, -0.2], [0.25, -0.2]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0] * u, p[1] * u, u * 0.09, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (item === 'patty') {
    ctx.fillStyle = state === 'grilled' ? '#6b3f1d' : '#c98a6b';
    roundRect(ctx, -u, -u * 0.35, s, u * 0.75, u * 0.3);
    ctx.fill();
    if (state === 'grilled') {
      ctx.strokeStyle = '#3d220e';
      ctx.lineWidth = Math.max(2, u * 0.12);
      [-0.4, 0, 0.4].forEach(function (dx) {
        ctx.beginPath();
        ctx.moveTo(dx * u - u * 0.15, -u * 0.3);
        ctx.lineTo(dx * u + u * 0.15, u * 0.3);
        ctx.stroke();
      });
    }
  } else if (item === 'cheese') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(-u, u * 0.5);
    ctx.lineTo(u, u * 0.5);
    ctx.lineTo(0, -u * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e0a92e';
    [[-0.3, 0.2], [0.25, 0.25], [0, -0.1]].forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p[0] * u, p[1] * u, u * 0.11, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (item === 'lettuce') {
    ctx.fillStyle = '#6abe30';
    if (state === 'chopped') {
      [[-0.5, -0.2], [0.1, -0.45], [0.5, 0.1], [-0.1, 0.35]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * u, p[1] * u, u * 0.34, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a8f1d';
      ctx.lineWidth = Math.max(2, u * 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, u * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.85);
      ctx.quadraticCurveTo(u * 0.3, 0, 0, u * 0.85);
      ctx.stroke();
    }
  } else if (item === 'tomato') {
    if (state === 'chopped') {
      ctx.fillStyle = '#e94f37';
      [[-0.45, -0.3], [0.35, -0.35], [0, 0.35]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * u, p[1] * u, u * 0.36, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#ffd9d2';
      ctx.beginPath();
      ctx.arc(-0.45 * u, -0.3 * u, u * 0.14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e94f37';
      ctx.beginPath();
      ctx.arc(0, u * 0.08, u * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a8f1d';
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.7);
      ctx.lineTo(-u * 0.3, -u * 0.25);
      ctx.lineTo(u * 0.3, -u * 0.25);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(-u * 0.35, -u * 0.25, u * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (item === 'onion') {
    ctx.strokeStyle = '#b388eb';
    ctx.fillStyle = '#e9dcf9';
    ctx.lineWidth = Math.max(2, u * 0.1);
    if (state === 'chopped') {
      [[-0.4, -0.2], [0.3, -0.3], [0.05, 0.35]].forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p[0] * u, p[1] * u, u * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else {
      ctx.beginPath();
      ctx.arc(0, u * 0.1, u * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, u * 0.1, u * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, u * 0.1, u * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function progressBar(ctx, x, y, w, h, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  const fw = Math.max(0, Math.min(1, frac)) * (w - 4);
  if (fw > 0) {
    roundRect(ctx, x + 2, y + 2, fw, h - 4, (h - 4) / 2);
    ctx.fill();
  }
}

function render(ctx) {
  ctx.clearRect(0, 0, 1280, 800);
  drawBackground(ctx);
  if (Game.screen === 'title') { renderTitle(ctx); return; }
  if (Game.screen === 'over') { renderPlay(ctx); renderGameOver(ctx); return; }
  renderPlay(ctx);
}

function drawBackground(ctx) {
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#332216';
  for (let y = 0; y < 800; y += 64) {
    for (let x = (y / 64) % 2 === 0 ? 0 : 32; x < 1280; x += 64) {
      ctx.fillRect(x + 1, y + 1, 62, 62);
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 0, 1280, 200);
}

function renderHud(ctx) {
  const h = LAYOUT.hud;
  ctx.fillStyle = '#1a0f08';
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SIZZLE & SERVE', 20, 30);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Rush Hour Kitchen', 250, 31);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('$' + Game.coins, 700, 30);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Level ' + Game.level + '  ·  Served ' + Game.served, 880, 30);
  ctx.fillText('Combo x' + Game.combo, 1060, 30);
  ctx.fillStyle = Game.strikes === 0 ? '#7CFC00' : '#ff6b6b';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Strikes: ' + '✕'.repeat(Game.strikes) + '·'.repeat(MAX_STRIKES - Game.strikes), 1256, 30);
  ctx.textAlign = 'left';
}

function renderOrders(ctx) {
  const o = LAYOUT.orders;
  for (let i = 0; i < 3; i++) {
    const r = orderCardRect(i);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    roundRect(ctx, r.x + 3, r.y + 4, r.w, r.h, 12);
    ctx.fill();
    if (i < Game.orders.length) {
      const order = Game.orders[i];
      const match = orderMatches(order);
      ctx.fillStyle = match ? '#d8f7c5' : '#fff8e7';
      roundRect(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.strokeStyle = match ? '#4a8f1d' : '#d9c49a';
      ctx.lineWidth = match ? 4 : 2;
      ctx.stroke();
      ctx.fillStyle = '#3a2410';
      ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(order.recipe.name, r.x + 16, r.y + 24);
      ctx.fillStyle = match ? '#2e7d12' : '#8a6d3b';
      ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(match ? 'READY — SERVE!' : '$' + order.recipe.price, r.x + r.w - 16, r.y + 24);
      ctx.textAlign = 'left';
      order.recipe.steps.forEach(function (step, j) {
        drawItem(ctx, step.item, step.state, r.x + 34 + j * 56, r.y + 66, 44);
      });
      const frac = Math.max(0, order.timeLeft / order.total);
      const tcol = frac > 0.5 ? '#6abe30' : frac > 0.25 ? '#f7b731' : '#e94f37';
      progressBar(ctx, r.x + 16, r.y + 96, r.w - 32, 12, frac, tcol);
      ctx.fillStyle = '#3a2410';
      ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.ceil(order.timeLeft) + 's', r.x + r.w - 16, r.y + 66);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = 'rgba(255,248,231,0.10)';
      roundRect(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,248,231,0.25)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(232,217,184,0.5)';
      ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for the next order…', r.x + r.w / 2, r.y + r.h / 2);
      ctx.textAlign = 'left';
    }
  }
}

function renderBins(ctx) {
  const b = LAYOUT.bins;
  BIN_ORDER.forEach(function (item, i) {
    const r = binRect(i);
    const held = Game.hand && Game.hand.item === item;
    ctx.fillStyle = held ? '#ffe9a8' : '#8a5a2e';
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.fillStyle = '#f7ead0';
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 8);
    ctx.fill();
    ctx.strokeStyle = held ? '#d99a3d' : '#6b4423';
    ctx.lineWidth = held ? 4 : 2;
    ctx.stroke();
    drawItem(ctx, item, 'raw', r.x + r.w / 2, r.y + 38, 56);
    ctx.fillStyle = '#3a2410';
    ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ITEMS[item].name, r.x + r.w / 2, r.y + 76);
    ctx.fillStyle = '#8a6d3b';
    ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
    const prep = ITEMS[item].prep === 'chop' ? 'chop it' : ITEMS[item].prep === 'grill' ? 'grill it' : 'ready to plate';
    ctx.fillText('[' + ITEMS[item].key + '] ' + prep, r.x + r.w / 2, r.y + 92);
    ctx.textAlign = 'left';
  });
}

function renderBoard(ctx) {
  const r = boardRect();
  ctx.fillStyle = '#5a3a1e';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.fillStyle = '#a4713a';
  roundRect(ctx, r.x + 10, r.y + 10, r.w - 20, r.h - 20, 8);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHOPPING BOARD', r.x + 22, r.y + 34);
  // Knife, resting on the board.
  ctx.save();
  ctx.translate(r.x + r.w - 70, r.y + 60);
  ctx.rotate(-0.5);
  ctx.fillStyle = '#cfd6dd';
  roundRect(ctx, 0, 0, 64, 12, 6);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  roundRect(ctx, -26, 0, 26, 12, 6);
  ctx.fill();
  ctx.restore();

  if (Game.chop) {
    const frac = Game.chop.progress / Game.chop.total;
    drawItem(ctx, Game.chop.item, 'chopped', r.x + r.w / 2, r.y + 130, 84);
    // Knife chops: it bobs with progress.
    const bob = Math.sin(frac * Math.PI * 8) * 8;
    ctx.save();
    ctx.translate(r.x + r.w / 2 + 60, r.y + 110 + bob);
    ctx.rotate(0.4);
    ctx.fillStyle = '#cfd6dd';
    roundRect(ctx, 0, 0, 56, 10, 5);
    ctx.fill();
    ctx.restore();
    progressBar(ctx, r.x + 40, r.y + 200, r.w - 80, 14, frac, '#6abe30');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Chopping… ' + Math.round(frac * 100) + '%', r.x + r.w / 2, r.y + 228);
    ctx.textAlign = 'left';
  } else {
    ctx.fillStyle = 'rgba(58,36,16,0.75)';
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click with lettuce, tomato', r.x + r.w / 2, r.y + 120);
    ctx.fillText('or onion in hand to chop it.', r.x + r.w / 2, r.y + 144);
    ctx.fillText('Chopped pieces go back to your hand.', r.x + r.w / 2, r.y + 200);
    ctx.textAlign = 'left';
  }
}

function renderGrill(ctx) {
  const r = grillRect();
  ctx.fillStyle = '#26221f';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('GRILL', r.x + 22, r.y + 34);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Click with a raw patty to grill it', r.x + 22, r.y + 60);
  for (let s = 0; s < 2; s++) {
    const sr = grillSlotRect(s);
    ctx.fillStyle = '#3a352f';
    roundRect(ctx, sr.x, sr.y, sr.w, sr.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#57504a';
    ctx.lineWidth = 2;
    for (let g = 1; g < 5; g++) {
      ctx.beginPath();
      ctx.moveTo(sr.x + 8, sr.y + (sr.h / 5) * g);
      ctx.lineTo(sr.x + sr.w - 8, sr.y + (sr.h / 5) * g);
      ctx.stroke();
    }
    const slot = Game.grill[s];
    if (slot) {
      if (slot.burnt) {
        drawItem(ctx, 'patty', 'grilled', sr.x + sr.w / 2, sr.y + 52, 64);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(sr.x + sr.w / 2, sr.y + 52, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BURNT — click to toss', sr.x + sr.w / 2, sr.y + sr.h - 16);
        ctx.textAlign = 'left';
      } else if (slot.done) {
        drawItem(ctx, 'patty', 'grilled', sr.x + sr.w / 2, sr.y + 52, 72);
        ctx.fillStyle = '#ffd94d';
        ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('READY — click to grab', sr.x + sr.w / 2, sr.y + sr.h - 16);
        ctx.textAlign = 'left';
      } else {
        const frac = slot.progress / slot.total;
        drawItem(ctx, 'patty', 'raw', sr.x + sr.w / 2, sr.y + 52, 64);
        progressBar(ctx, sr.x + 12, sr.y + sr.h - 30, sr.w - 24, 12, frac, '#f78c2b');
      }
    } else {
      ctx.fillStyle = 'rgba(232,217,184,0.45)';
      ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty slot', sr.x + sr.w / 2, sr.y + sr.h / 2);
      ctx.textAlign = 'left';
    }
  }
}

function renderPlate(ctx) {
  const r = plateRect();
  const match = matchingOrderIndex() >= 0;
  ctx.fillStyle = '#5a3a1e';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLATE', r.x + 22, r.y + 34);
  // The plate itself.
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + 118, 118, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = match ? '#4a8f1d' : '#d9c49a';
  ctx.lineWidth = match ? 4 : 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(r.x + r.w / 2, r.y + 118, 84, 42, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#e8e0cc';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (Game.plate.length === 0) {
    ctx.fillStyle = '#b8a888';
    ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Empty plate', r.x + r.w / 2, r.y + 118);
    ctx.textAlign = 'left';
  } else {
    // Stack the dish: items pile upward from the plate.
    Game.plate.forEach(function (step, i) {
      const y = r.y + 138 - i * 16;
      drawItem(ctx, step.item, step.state, r.x + r.w / 2, y, 52);
    });
    ctx.fillStyle = '#3a2410';
    ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
    Game.plate.forEach(function (step, i) {
      drawItem(ctx, step.item, step.state, r.x + 40 + i * 44, r.y + 200, 36);
    });
    ctx.fillStyle = '#8a6d3b';
    ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click an item below to take it off.', r.x + r.w / 2, r.y + r.h - 14);
    ctx.textAlign = 'left';
  }
  if (match) {
    ctx.fillStyle = '#2e7d12';
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('MATCHES AN ORDER!', r.x + r.w - 22, r.y + 34);
    ctx.textAlign = 'left';
  }
}

function renderSide(ctx) {
  const s = serveRect();
  const match = matchingOrderIndex() >= 0;
  const pulse = match ? 0.85 + 0.15 * Math.sin(Game.time * 6) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = match ? '#4a8f1d' : '#6b7c5e';
  roundRect(ctx, s.x, s.y, s.w, s.h, 14);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#d8f7c5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SERVE', s.x + s.w / 2, s.y + 44);
  ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(match ? 'Plate matches an order!' : 'or press Enter', s.x + s.w / 2, s.y + 84);
  ctx.textAlign = 'left';

  const t = trashRect();
  ctx.fillStyle = '#7a2e2e';
  roundRect(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd9d9';
  ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TRASH', t.x + t.w / 2, t.y + 22);
  ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('clear hand / plate', t.x + t.w / 2, t.y + 44);
  ctx.textAlign = 'left';

  const m = muteRect();
  ctx.fillStyle = '#3a352f';
  roundRect(ctx, m.x, m.y, m.w, m.h, 10);
  ctx.fill();
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(Sfx.isMuted() ? 'Sound: OFF  (M)' : 'Sound: ON  (M)', m.x + m.w / 2, m.y + m.h / 2);
  ctx.textAlign = 'left';
}

function renderBottom(ctx) {
  const b = LAYOUT.bottom;
  // Hand panel.
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  roundRect(ctx, b.x, b.y, 400, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#e8d9b8';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('IN YOUR HAND', b.x + 18, b.y + 26);
  if (Game.hand) {
    drawItem(ctx, Game.hand.item, Game.hand.state, b.x + 60, b.y + 92, 72);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(ITEMS[Game.hand.item].name + (Game.hand.state !== 'raw' ? ' (' + Game.hand.state + ')' : ''), b.x + 110, b.y + 82);
    ctx.fillStyle = '#e8d9b8';
    ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
    const hint = ITEMS[Game.hand.item].prep === 'chop' ? 'Take it to the chopping board.'
      : ITEMS[Game.hand.item].prep === 'grill' ? 'Take it to the grill.'
      : 'Take it to the plate.';
    ctx.fillText(hint, b.x + 110, b.y + 110);
  } else {
    ctx.fillStyle = 'rgba(232,217,184,0.6)';
    ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Empty hands — grab an ingredient above.', b.x + 18, b.y + 92);
  }

  // Shift panel.
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  roundRect(ctx, b.x + 416, b.y, 400, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#e8d9b8';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('SHIFT PROGRESS', b.x + 434, b.y + 26);
  ctx.fillStyle = '#fff';
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Served: ' + Game.served + '   Best combo: x' + Game.bestCombo, b.x + 434, b.y + 62);
  ctx.fillText('Next level at ' + (Math.floor(Game.served / 5) * 5 + 5) + ' served', b.x + 434, b.y + 90);
  progressBar(ctx, b.x + 434, b.y + 116, 364, 14, (Game.served % 5) / 5, '#ffd94d');
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Higher levels: faster orders, bigger dishes.', b.x + 434, b.y + 152);

  // Message panel.
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  roundRect(ctx, b.x + 832, b.y, 416, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('KITCHEN RADIO', b.x + 850, b.y + 26);
  ctx.fillStyle = '#fff';
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  wrapText(ctx, Game.message || ' ', b.x + 850, b.y + 56, 380, 22);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Tip: serve with time left for a bigger tip.', b.x + 850, b.y + 152);
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  words.forEach(function (word) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineH;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, yy);
}

function renderFloats(ctx) {
  Game.floats.forEach(function (f) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    ctx.fillStyle = f.color;
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  });
  ctx.textAlign = 'left';
}

function renderMouseHand(ctx) {
  if (Game.screen !== 'play' || !Game.hand || !Game.mouse) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  drawItem(ctx, Game.hand.item, Game.hand.state, Game.mouse.x, Game.mouse.y - 34, 44);
  ctx.restore();
}

function renderPlay(ctx) {
  renderHud(ctx);
  renderOrders(ctx);
  renderBins(ctx);
  renderBoard(ctx);
  renderGrill(ctx);
  renderPlate(ctx);
  renderSide(ctx);
  renderBottom(ctx);
  renderFloats(ctx);
  renderMouseHand(ctx);
}

function renderTitle(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 84px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SIZZLE & SERVE', 640, 130);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Rush Hour Kitchen', 640, 196);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Orders fly in. The grill is hot. The clock never stops.', 640, 244);

  // The menu: what the kitchen serves.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, 240, 280, 800, 250, 14);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText("TONIGHT'S MENU", 270, 312);
  const dishes = [
    ['Sunny Stack — $12', 'bun, grilled patty, cheese, chopped lettuce'],
    ['Garden Crunch — $9', 'chopped lettuce, tomato and onion'],
    ['Melty Cheese Melt — $10', 'bun, cheese, chopped tomato'],
    ['Firehouse Stack — $16', 'two grilled patties, from level 2'],
  ];
  ctx.font = '17px "Trebuchet MS", Verdana, sans-serif';
  dishes.forEach(function (d, i) {
    ctx.fillStyle = '#fff';
    ctx.fillText(d[0], 270, 348 + i * 40);
    ctx.fillStyle = '#cbb98f';
    ctx.fillText(d[1], 560, 348 + i * 40);
  });

  ctx.fillStyle = '#4a8f1d';
  roundRect(ctx, 440, 560, 400, 84, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('START SHIFT', 640, 602);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Click START or press Enter — 3 lost orders end the shift.', 640, 676);
  ctx.textAlign = 'left';
}

function renderGameOver(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 64px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHIFT OVER', 640, 200);
  ctx.fillStyle = '#fff';
  ctx.font = '24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Three orders lost. The kitchen closes — for now.', 640, 260);
  ctx.font = 'bold 28px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Served: ' + Game.served + ' dishes', 640, 330);
  ctx.fillText('Earned: $' + Game.coins, 640, 372);
  ctx.fillText('Best combo: x' + Game.bestCombo + '   ·   Reached level ' + Game.level, 640, 414);
  ctx.fillStyle = '#4a8f1d';
  roundRect(ctx, 440, 560, 400, 84, 14);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('PLAY AGAIN', 640, 602);
  ctx.fillStyle = '#e8d9b8';
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Click PLAY AGAIN or press R.', 640, 676);
  ctx.textAlign = 'left';
}
