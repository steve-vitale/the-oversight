#!/usr/bin/env node
// scripts/probe-handbookloot-b.js — HONEST Trapper Handbook surface-rate probe
// (sim-handbookloot-b, loop B food-economy axis, run fleshout-loop-b-20261019T1230Z).
//
// Re-measures the book channel on CURRENT master (pitknowledge-b landed +
// day-0 beat; pithear-b killed) with FRESH seeds (9409-9416; the
// 2026-10-18 traphandbook probe consumed 105101-105108). Same honest
// design as scripts/probe-traphandbook.js (not modified — that script is
// another arm's committed instrument):
//   - surfacing: the say line `You find a book: "Trapper Handbook".` AND
//     inventory items with `bookId === 'trappers_handbook'`
//   - reading: readBook -> grantKnowledge('recipe','pit_trap',3,
//     {type:'read', by:'Trapper Handbook'})
// It exercises the real mechanic (travel to each world-map ruin, forage to
// search it — the book roll fires on the FIRST search of each ruin) on the
// current base, no lever.
//
// INSTRUMENT HONESTY NOTE: the probe tops up the scholar's kcal between
// ruin searches so the MECHANIC tour isn't cut short by starvation. This
// is a mechanics probe (rate per ruin-search), not a survival measurement.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { walkTo } = require('./policies/competent');

const SEEDS = [9409, 9410, 9411, 9412, 9413, 9414, 9415, 9416];

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
  const { Game } = await loadGame({ seed, mode: 'probe-handbookloot-b', fullTelemetry: false });
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
  let searched = 0, wildRuins = 0, wildSearched = 0;
  for (const r of ruins) {
    const isWild = wildNear(Game, r.x, r.y) >= 3;
    if (isWild) wildRuins++;
    try { walkTo(Game, r.x, r.y); } catch (e) {} // honest hop-by-hop, like a player
    let pt = null;
    try { pt = Game.playerTile(); } catch (e) {}
    if (!pt || pt.type !== 'ruin') continue; // travel blocked/refused — honest miss
    try { Game.doAction('forage'); searched++; if (isWild) wildSearched++; } catch (e) {}
    // feed the probe scholar so the tour isn't cut short by starvation
    try { Game.state.scholar.kcal = Math.max(Game.state.scholar.kcal || 0, 4000); } catch (e) {}
  }
  let handbookInInv = 0;
  try {
    for (const it of (Game.state.scholar.inventory || [])) {
      if (it && it.bookId === 'trappers_handbook') handbookInInv++;
    }
  } catch (e) {}

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
    seed, ruins: ruins.length, wildRuins, searched, wildSearched,
    bookSay, handbookSay, handbookInInv, readHandbook,
    pitAfterRead, pitVia, pitBy,
  };
}

(async () => {
  const rows = [];
  await quietLog(async () => {
    for (const s of SEEDS) rows.push(await probeOne(s));
  });
  let ruins = 0, searched = 0, wildSearched = 0, bookSay = 0, hb = 0;
  for (const r of rows) {
    console.log(JSON.stringify(r));
    ruins += r.ruins; searched += r.searched; wildSearched += r.wildSearched;
    bookSay += r.bookSay; hb += r.handbookSay;
  }
  console.log(`TOTALS ruins=${ruins} searched=${searched} wildSearched=${wildSearched} bookFinds=${bookSay} handbookFinds=${hb}`);
  console.log(`honest base rate: ${(hb / Math.max(1, searched) * 100).toFixed(2)}% handbook per ruin-search (wild ${(hb / Math.max(1, wildSearched) * 100).toFixed(2)}%)`);
})();
