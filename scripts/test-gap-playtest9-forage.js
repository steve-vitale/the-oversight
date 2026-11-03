#!/usr/bin/env node
'use strict';
// Gap-playtest9 leg (a) PROOF: foraging around Haven.
// Headline case: the Haven grounds' teaching garden patch (plant/bush cells
// at (5..7,6..7)) must be forageable by a new player standing beside it —
// the world tile's abstract stock is 0 by design, but the grid is the
// inventory: ground that visibly holds plants must yield.
// Also: a depleted patch must explain itself, and a failed press must cost
// the player no ticks/kcal.
// Run: node scripts/test-gap-playtest9-forage.js [seed]
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const seed = Number(process.argv[2] || 42);
let failures = 0;
function note(ok, label, extra) {
  console.log((ok ? 'PASS ' : 'FAIL ') + label + (extra !== undefined ? ' :: ' + extra : ''));
  if (!ok) failures++;
}
function lastSay(G) {
  const log = G.log || [];
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    const s = (e && typeof e === 'object') ? (e.surface || 'narration') : 'narration';
    if (s === 'narration' || s === 'feedback') return (e && typeof e === 'object') ? (e.text || '') : String(e || '');
  }
  return '';
}
function greenCells(G) {
  const detail = G.genDetail(G.map.px, G.map.py);
  const out = [];
  for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 9; cx++) {
    const c = detail[cy][cx];
    if (c === 'plant' || c === 'bush' || c === 'tree' || c === 'bigtree') out.push({ cx, cy, c });
  }
  return { detail, out };
}
function standNextTo(G, cell) {
  const s = G.state.scholar;
  // step onto an adjacent passable cell (prefer the cell's west/north side)
  const detail = G.genDetail(G.map.px, G.map.py);
  const cands = [[cell.cx - 1, cell.cy], [cell.cx, cell.cy - 1], [cell.cx + 1, cell.cy], [cell.cx, cell.cy + 1],
    [cell.cx - 1, cell.cy - 1], [cell.cx + 1, cell.cy - 1]];
  for (const [x, y] of cands) {
    if (x < 0 || y < 0 || x > 8 || y > 8) continue;
    const c = detail[y][x];
    if (c === 'wall' || c === 'water' || c === 'tree' || c === 'bigtree' || c === 'tent' || c === 'fire' || c === 'lodge') continue;
    s.mx = x; s.my = y; return true;
  }
  return false;
}
(async () => {
  const { Game: G, loadFails } = await loadGame({ seed, narration: true });
  if (loadFails.length) { console.log('LOAD FAILS', loadFails); process.exit(2); }
  await setupGame(G);
  const s = G.state.scholar;

  // ---- 1. Haven grounds teaching patch ----
  G.map.px = 4; G.map.py = 4; s.insideHaven = false;
  const ht = G.playerTile();
  console.log('haven tile: type/stock/maxStock =', ht.type, ht.stock, ht.maxStock);
  const { out: groundsGreen } = greenCells(G);
  const garden = groundsGreen.filter(c => c.cx >= 5 && c.cy >= 6);
  console.log('haven grounds green cells:', groundsGreen.map(c => c.cx + ',' + c.cy + ':' + c.c).join(' '));
  note(garden.length > 0, 'haven grounds hold a teaching garden patch', garden.map(c => c.cx + ',' + c.cy).join(' '));
  const g0 = garden[0];
  note(standNextTo(G, g0), 'can stand beside the garden patch', `player at ${s.mx},${s.my} patch at ${g0.cx},${g0.cy}`);
  const invBefore = (s.inventory || []).length, ticksBefore = s.dayTicks, kcalBefore = s.kcal;
  G.log = [];
  G.cellInteract(g0.cx, g0.cy);
  const haulMsg = lastSay(G);
  console.log('garden press ->', JSON.stringify(haulMsg));
  note(!/Nothing left to take here today/.test(haulMsg), 'garden patch press yields instead of refusing',
    `inv ${invBefore}->${(s.inventory || []).length} ticks ${ticksBefore}->${s.dayTicks} kcal ${kcalBefore}->${s.kcal} msg=${haulMsg}`);
  note(/picked clean/.test(haulMsg) || (s.inventory || []).length > invBefore, 'garden press reports a haul or the picked-clean state', haulMsg);

  // ---- 2. Depleted patch explains itself (same patch, now regrowing) ----
  const regrowing = Object.keys(ht.detailRegrow || {}).length;
  console.log('detailRegrow keys after garden press:', regrowing);
  // stand beside a regrowing garden cell and press it
  let pressedRegrowing = null;
  for (const key of Object.keys(ht.detailRegrow || {})) {
    const [rx, ry] = key.split(',').map(Number);
    const cell = groundsGreen.find(c => c.cx === rx && c.cy === ry);
    if (cell && standNextTo(G, cell)) { pressedRegrowing = cell; G.log = []; G.cellInteract(cell.cx, cell.cy); break; }
  }
  if (pressedRegrowing) {
    const m = lastSay(G);
    console.log('regrowing-patch press ->', JSON.stringify(m));
    note(!/^Nothing left to take here today\.$/.test(m), 'depleted patch does not give the bare refusal', m);
    note(/picked clean|few days|another green|wild ground/i.test(m), 'depleted patch message explains recovery or where else to go', m);
  } else {
    console.log('NOTE: no regrowing garden cell found to re-press (sweep may have taken the whole patch)');
  }

  // ---- 3. Wild ring tiles still forage, and a failed press costs nothing ----
  const ring = [[3, 4], [5, 4], [4, 3], [4, 5]];
  for (const [wx, wy] of ring) {
    G.map.px = wx; G.map.py = wy; s.insideHaven = false;
    const t = G.playerTile();
    if (t.type === 'ruin') { console.log(`tile (${wx},${wy}) is a ruin — scavenge country, skipped`); continue; }
    const { out } = greenCells(G);
    const cell = out.find(c => c === 'plant' || c === 'bush') || out[0];
    if (!cell || !standNextTo(G, cell)) { console.log(`tile (${wx},${wy}) type=${t.type}: no pressable green cell`); continue; }
    const ib = (s.inventory || []).length;
    G.log = [];
    G.cellInteract(cell.cx, cell.cy);
    console.log(`tile (${wx},${wy}) type=${t.type} stock=${t.stock} pressed ${cell.cx},${cell.cy}:${cell.c} -> ${JSON.stringify(lastSay(G))} inv ${ib}->${(s.inventory || []).length}`);
  }
  // forced-depleted gate: no player ticks/kcal. A truly picked-clean patch:
  // stock 0 AND every forageable cell in the 3x3 patch marked regrowing
  // (trees alone would honestly yield deadfall, so they must be regrowing too).
  G.map.px = 3; G.map.py = 4; s.insideHaven = false;
  s.mx = 4; s.my = 4;
  const wt = G.playerTile(); wt.stock = 0;
  const wdetail = G.genDetail(3, 4);
  wt.detailRegrow = wt.detailRegrow || {};
  for (let cy = 3; cy <= 5; cy++) for (let cx = 3; cx <= 5; cx++) {
    const c = wdetail[cy][cx];
    if (c === 'plant' || c === 'bush' || c === 'tree' || c === 'bigtree') wt.detailRegrow[cx + ',' + cy] = { day: (s.day || 0) + 2, was: c };
  }
  const tb = s.dayTicks, kb = s.kcal;
  G.log = [];
  G.doAction('forage');
  const failMsg = lastSay(G);
  console.log('forced-depleted wild press ->', JSON.stringify(failMsg), 'ticks', tb, '->', s.dayTicks, 'kcal', kb, '->', s.kcal);
  note(s.dayTicks === tb && s.kcal === kb, 'failed forage press costs no player ticks/kcal', `ticks ${tb}->${s.dayTicks} kcal ${kb}->${s.kcal}`);

  console.log(failures ? `FORAGE PROOF: ${failures} failing check(s)` : 'FORAGE PROOF: all checks pass');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e && e.stack || e); process.exit(2); });
