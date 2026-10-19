#!/usr/bin/env node
// scripts/probe-traphandbook.js — HONEST Trapper Handbook surface-rate probe
// (sim-traphandbook-b, loop B food-economy axis).
//
// The pitstaff probe read "0/8 handbook surfacings" through a probe BUG:
// it scanned scholar inventory for `itemId === 'trappers_handbook'`, but
// books are pushed with `bookId`, not `itemId`. This probe counts the
// honest channel:
//   - surfacing: the say line `You find a book: "Trapper Handbook".` AND
//     inventory items with `bookId === 'trappers_handbook'`
//   - reading: readBook -> grantKnowledge('recipe','pit_trap',3,
//     {type:'read', by:'Trapper Handbook'})
//
// It exercises the real mechanic (travel to each world-map ruin, forage to
// search it — the book roll fires on the FIRST search of each ruin) on the
// CURRENT BASE, no lever. Seeds: the pitstaff probe seeds (105101-105104).
//
// NOTE (instrument honesty): the probe tops up the scholar's kcal between
// ruin searches so the MECHANIC tour isn't cut short by starvation. This is
// a mechanics probe (rate per ruin-search), not a survival measurement —
// the sweep policies never do this.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { walkTo } = require('./policies/competent');

const SEEDS = [105101, 105102, 105103, 105104, 105105, 105106, 105107, 105108];

function ruinTiles(Game) {
  const out = [];
  for (let y = 0; y <= 8; y++) for (let x = 0; x <= 8; x++) {
    try {
      const t = Game.tileAt(x, y);
      if (t && t.type === 'ruin') out.push({ x, y });
    } catch (e) {}
  }
  return out;
}

function wildNear(Game, x, y) {
  let wild = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const ax = x + dx, ay = y + dy;
    if (ax < 0 || ax > 8 || ay < 0 || ay > 8) continue;
    const ty = (Game.tileAt(ax, ay) || {}).type;
    if (ty === 'forest' || ty === 'grove' || ty === 'water' || ty === 'creek' || ty === 'wetland') wild++;
  }
  return wild;
}

async function probeOne(seed) {
  const { Game } = await loadGame({ seed, mode: 'probe-traphandbook', fullTelemetry: false });
  await setupGame(Game);

  let bookSay = 0, handbookSay = 0;
  const oSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg || '').match(/You find a book: "([^"]+)"/);
      if (m) { bookSay++; if (m[1] === 'Trapper Handbook') handbookSay++; }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  const ruins = ruinTiles(Game);
  let searched = 0, handbookInInv = 0, wildRuins = 0;
  const seen = new Set();
  for (const r of ruins) {
    if (wildNear(Game, r.x, r.y) >= 3) wildRuins++;
    try { walkTo(Game, r.x, r.y); } catch (e) {} // honest hop-by-hop, like a player
    let pt = null;
    try { pt = Game.playerTile(); } catch (e) {}
    if (!pt || pt.type !== 'ruin') continue; // travel blocked/refused — honest miss
    try { Game.doAction('forage'); searched++; } catch (e) {}
    // feed the probe scholar so the tour isn't cut short by starvation
    try { Game.state.scholar.kcal = Math.max(Game.state.scholar.kcal || 0, 4000); } catch (e) {}
    try {
      for (const it of (Game.state.scholar.inventory || [])) {
        if (it && it.bookId === 'trappers_handbook') { handbookInInv++; break; }
      }
    } catch (e) {}
    seen.add(r.x + ',' + r.y);
  }

  // now read anything readable and check the grant path
  let readHandbook = false, pitAfterRead = 0, pitVia = null, pitBy = null;
  try {
    const inv = (Game.state.scholar.inventory || []).slice();
    for (const it of inv) {
      if (it && it.bookId) {
        Game.readBook(it.bookId);
        if (it.bookId === 'trappers_handbook') readHandbook = true;
      }
    }
    const rk = ((Game.state.codex || {}).recipes || {}).pit_trap || {};
    pitAfterRead = rk.level || 0; pitVia = rk.via || null; pitBy = rk.learnedFrom || null;
  } catch (e) {}

  return {
    seed, ruins: ruins.length, wildRuins, searched,
    bookSay, handbookSay, handbookInInv, readHandbook,
    pitAfterRead, pitVia, pitBy,
  };
}

(async () => {
  const rows = [];
  await quietLog(async () => {
    for (const s of SEEDS) rows.push(await probeOne(s));
  });
  let ruins = 0, searched = 0, bookSay = 0, hb = 0;
  for (const r of rows) {
    console.log(JSON.stringify(r));
    ruins += r.ruins; searched += r.searched; bookSay += r.bookSay; hb += r.handbookSay;
  }
  console.log(`TOTALS ruins=${ruins} searched=${searched} bookFinds=${bookSay} handbookFinds=${hb}`);
  console.log(`honest base rate: ${(hb / Math.max(1, searched) * 100).toFixed(2)}% handbook per ruin-search`);
})();
