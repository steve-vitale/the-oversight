'use strict';
// scripts/policies/wave3bar-diag.js — sim-wave3bar-a recorder (DIAG ONLY).
// Pure observer around Game.recordDeedFight: it calls the original exactly
// once, in the same position, with the same args and `this`, and records
// only reads (day, monster id, the wavesFaced value after the call, a
// stack-derived route class, and whether the faced monster is the
// current feast draw). It adds no game call, removes none, reorders
// none, consumes no RNG, and writes no game state. Neutrality is proved
// by this arm's det-gates (plain vs wrapped on pilot seed 73901) before
// any band is spent — a det-gate failure stops the column.
// Route classes (from the Error stack of the recordDeedFight call):
//   'fieldFight'    — villager blow-by-blow fight (patrol / wild /
//                     expedition); the deed feed's fieldFight wrap.
//   'startCombat-draw' — player TB fight against the current feast draw.
//   'startCombat'   — player TB fight, not the feast draw (world
//                     encounter / patrol encounter / contest / etc.).
//   'recordWaveKill'— kill feed (a kill is the first record of the
//                     monster when no fight record preceded it).
//   'other'         — any other caller (reported, never smoothed).
// First call per monster id wins: the deed feed is keyed by id, so the
// first face is the route that earned the count; later calls for the
// same id change nothing in wavesFaced.
const MONSTERS = (() => {
  try { const m = require('../../src/data/monsters.json'); return Array.isArray(m) ? m : (m.monsters || []); }
  catch (e) { return []; }
})();
const WAVE_OF = {};
for (const m of MONSTERS) { try { if (m && m.id) WAVE_OF[m.id] = (m.wave | 0) || 0; } catch (e) {} }
const W3_IDS = MONSTERS.filter(m => m && (m.wave | 0) === 3).map(m => m.id);

function newStore() {
  return { faces: [], byMid: {}, deedCalls: [], installed: false, errs: [] };
}

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; }
  catch (e) { return 0; }
}

function drawMidOf(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    if (s.feastDraw && s.feastDraw.monsterId) return s.feastDraw.monsterId;
    if (typeof Game.feastDrawPending === 'function') {
      const p = Game.feastDrawPending();
      if (p && p.monsterId) return p.monsterId;
    }
  } catch (e) {}
  return null;
}

function classifyStack(stack, mid, drawMid) {
  const st = String(stack || '');
  if (/fieldFight/.test(st)) return 'fieldFight';
  if (/recordWaveKill/.test(st)) return 'recordWaveKill';
  if (/startCombat/.test(st)) return (drawMid && mid === drawMid) ? 'startCombat-draw' : 'startCombat';
  return 'other';
}

function installWave3barDiag(Game, store) {
  if (!Game || typeof Game.recordDeedFight !== 'function') {
    try { store.errs.push('recordDeedFight missing at install'); } catch (e) {}
    return false;
  }
  if (Game._wave3barDiagWrapped) return true;
  const orig = Game.recordDeedFight;
  Game._wave3barDiagWrapped = true;
  Game.recordDeedFight = function (monsterId) {
    const r = orig.apply(this, arguments);
    try {
      const mid = monsterId;
      const day = dayOf(this);
      const dm = drawMidOf(this);
      let wave = WAVE_OF[mid] || 0;
      try {
        const ds = (this.state && this.state.scholar && this.state.scholar.prog && this.state.scholar.prog.deeds && this.state.scholar.prog.deeds.wavesFaced) || null;
        if (ds && ds[mid] != null) wave = ds[mid] | 0;
      } catch (e) {}
      const stack = (new Error('wave3bar-diag').stack || '');
      const route = classifyStack(stack, mid, dm);
      store.deedCalls.push({ day, mid, wave, route, drawMid: dm || null });
      if (mid && !store.byMid[mid]) {
        const face = { mid, wave, day, route, drawMid: dm || null };
        store.byMid[mid] = face;
        store.faces.push(face);
      }
    } catch (e) { try { store.errs.push(String((e && e.message) || e).slice(0, 160)); } catch (e2) {} }
    return r;
  };
  store.installed = true;
  return true;
}

// Pure-read snapshot of the deed feed: reads state.scholar.prog.deeds
// .wavesFaced directly (never deedState(), which would CREATE pg.deeds).
// Returns { faced: {mid: wave}, w1..w5 counts, w3Ids: [...] }.
function wave3Snap(Game) {
  const out = { faced: {}, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, w3Ids: [] };
  try {
    const ds = (Game.state && Game.state.scholar && Game.state.scholar.prog && Game.state.scholar.prog.deeds && Game.state.scholar.prog.deeds.wavesFaced) || null;
    if (ds && typeof ds === 'object') {
      for (const mid of Object.keys(ds)) {
        const w = ds[mid] | 0;
        out.faced[mid] = w;
        if (w === 1) out.w1++;
        else if (w === 2) out.w2++;
        else if (w === 3) { out.w3++; out.w3Ids.push(mid); }
        else if (w === 4) out.w4++;
        else if (w === 5) out.w5++;
      }
    }
  } catch (e) {}
  return out;
}

module.exports = { newStore, installWave3barDiag, wave3Snap, WAVE_OF, W3_IDS };
