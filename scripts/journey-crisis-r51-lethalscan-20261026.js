#!/usr/bin/env node
// journey-crisis-r51-lethalscan-20261026.js — CRISIS LEG (6) r51, Phase A: SCAN.
// Play oracleV2 day-by-day to the FIRST lingerer set (max 120d) WITHOUT
// answering it. Record at first sight: day, lingerers (id, hp), muster
// (Game._musterAway(3,'defense')), leader health, and each beast's max
// single hit from src/data/monsters.json. Rank windows by maxHit/leaderHp.
// This script NEVER answers a lingerer and NEVER wounds anyone — the
// windows it reports are natural. The drive phase re-plays the best seed.
// Usage: SEED=9405 node scripts/journey-crisis-r51-lethalscan-20261026.js
// (ONE seed per process — never two harnesses in one node process, shared
// state. Drive the seed list from the shell, sequentially.)
// Output: one JSON record to stdout.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '9405', 10);
const MAXD = parseInt(process.env.MAXD || '120', 10);

let MON = [];
try { MON = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'monsters.json'), 'utf8')); } catch (e) {}
function maxHit(id) {
  const m = MON.find(x => x && x.id === id);
  if (!m) return null;
  let best = 0;
  const add = (d) => { if (Array.isArray(d) && d.length === 2 && Number.isFinite(d[1])) best = Math.max(best, d[1]); };
  if (m.attack) add(m.attack.damage);
  for (const a of (m.attacks || [])) add(a && a.damage);
  return best || null;
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function healthOf(Game, vid) {
  try { const h = (Game.state.village || {}).health || {}; if (h[vid] != null) return h[vid]; } catch (e) {}
  try { const vp = Game.vpOf(vid); if (vp && vp.hp != null) return vp.hp; } catch (e) {}
  return 100;
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } }).length;
  } catch (e) { return 1; }
}

async function scanOne(seed) {
  const { Game } = await loadGame({ seed, mode: 'crisis-lethalscan-r51', fullTelemetry: true });
  await setupGame(Game);
  const policy = {
    id: 'crisis-journey-r51-scan',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) { try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {} },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };
  let deadTail = 0;
  for (let d = 1; d <= MAXD; d++) {
    try { await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { return { seed, found: false, endReason: 'threw:' + e.message, days: d }; }
    if (Game.over) return { seed, found: false, endReason: 'game-over', days: d };
    if (livingCount(Game) <= 0) { if (++deadTail >= 10) return { seed, found: false, endReason: 'village-dead', days: d }; }
    else deadTail = 0;
    let lingering = [];
    try { lingering = (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) {}
    if (!lingering.length) continue;
    let muster = [];
    try { muster = Game._musterAway ? Game._musterAway(3, 'defense') : []; } catch (e) {}
    const leader = muster[0] || null;
    const leaderHp = leader ? healthOf(Game, leader) : null;
    const beasts = lingering.map(m => ({ id: m.id, hp: m.hp || 0, maxHit: maxHit(m.id) }));
    const best = beasts.reduce((b, x) => (!b || (x.maxHit || 0) > (b.maxHit || 0) ? x : b), null);
    return {
      seed, found: true, day: dayOf(Game), alive: livingCount(Game),
      lingerers: beasts,
      muster: muster.map(id => ({ id, name: rawName(Game, id), hp: healthOf(Game, id) })),
      leader: leader ? { id: leader, name: rawName(Game, leader), hp: leaderHp } : null,
      bestBeast: best, ratio: (best && best.maxHit != null && leaderHp) ? +(best.maxHit / leaderHp).toFixed(3) : null,
    };
  }
  return { seed, found: false, endReason: 'horizon-no-lingerer', days: MAXD };
}

(async () => {
  try { console.log(JSON.stringify(await scanOne(SEED))); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, found: false, endReason: 'threw:' + e.message })); }
})();
