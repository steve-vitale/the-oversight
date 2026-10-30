#!/usr/bin/env node
// scripts/test-titanexcl-a.js — sim-titanexcl-a proof test (prereg legs
// F1, F2, S). Fixture, not a sim: it proves the castMonster pool excludes
// titans and that feast draws never deal one.
//
// DISCLOSED INPUT CONTROLS (test-only, never game code):
// - Game.unlockedWave is stubbed to return 4, then 5, for the distribution
//   legs. castMonster is the function under test; unlockedWave is its
//   input, and on this base waveLedgerPoints has no live definition, so a
//   natural wave-4 state cannot be built honestly through state alone.
// - Game.feastedActive is stubbed to () => true ONLY for the sense leg's
//   faceFeastDraw step, so feastDrawPending returns the draw (a real feast
//   buff grant is out of scope for this fixture).
// - Game.say is wrapped to capture say-text (the pattern conversation.js
//   and abilityActions.js use); it still calls through.
// No RNG is drawn by the test itself; every draw comes from game code.
//
// Usage: node scripts/test-titanexcl-a.js [seed]
// Exit 0 iff: wave-4 titan draws == 0 AND wave-5 titan draws == 0 AND
// feast titan draws == 0 (the ARMED behavior). On the pre-fix control
// this exits 1 — the printed titan counts ARE the leak demonstration
// (prereg pilot gate: control wave-4 titan count > 0).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.argv[2] || process.env.SEED || '4242', 10);
const N_CAST = 2000, N_FEAST = 500;

function titanSet(Game) {
  const set = {};
  try {
    const raw = (Game.data && Game.data.titans) || {};
    Object.keys(raw).forEach((k) => {
      if (k.charAt(0) === '_') return;
      set[k] = true;
      if (raw[k] && raw[k].monster) set[raw[k].monster] = true;
    });
  } catch (e) {}
  return set;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'titanexcl-a', fullTelemetry: false });
  await setupGame(Game);
  const TITANS = titanSet(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (t) {
    try { said.push({ text: String(t), surface: 'narration' }); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const origWave = Game.unlockedWave;
  const isTitan = (id) => !!TITANS[id];

  // --- F1: cast distribution at wave 4 and 5 ---
  const f1 = {};
  for (const w of [4, 5]) {
    Game.unlockedWave = () => w;
    let titan = 0; const byId = {}; let total = 0;
    for (let i = 0; i < N_CAST; i++) {
      const cast = Game.castMonster();
      const id = (typeof cast === 'string') ? cast : (cast && (cast.id || cast.monsterId));
      total++;
      if (id && isTitan(id)) { titan++; byId[id] = (byId[id] || 0) + 1; }
    }
    f1['wave' + w] = { total, titan, byId };
  }
  // Natural wave (no stub) reference: wave 1 on a fresh game, titans impossible by wave filter.
  Game.unlockedWave = origWave;
  let natTitan = 0;
  for (let i = 0; i < N_CAST; i++) {
    const cast = Game.castMonster();
    const id = (typeof cast === 'string') ? cast : (cast && (cast.id || cast.monsterId));
    if (id && isTitan(id)) natTitan++;
  }
  f1.natural = { total: N_CAST, titan: natTitan };

  // --- F2: feast draws at wave 4 ---
  Game.unlockedWave = () => 4;
  let feastTitan = 0; const feastById = {}; let feastTotal = 0;
  for (let i = 0; i < N_FEAST; i++) {
    try { Game.pendingEncounter = false; } catch (e) {}
    try { if (Game.state && Game.state.scholar) delete Game.state.scholar.feastDraw; } catch (e) {}
    let r = null;
    try { r = Game.drawFeastScavenger(); } catch (e) { r = { drawn: false, why: 'threw: ' + e.message }; }
    if (r && r.drawn) {
      feastTotal++;
      if (isTitan(r.monsterId)) { feastTitan++; feastById[r.monsterId] = (feastById[r.monsterId] || 0) + 1; }
    }
  }
  const f2 = { total: feastTotal, titan: feastTitan, byId: feastById };

  // --- S: sense transcripts ---
  // Find one Herald draw (pre-fix) or prove none (post-fix), capturing narration.
  Game.unlockedWave = () => 4;
  let heraldDraw = null, firstDrawText = null;
  const mark = said.length;
  for (let i = 0; i < N_FEAST && !heraldDraw; i++) {
    try { Game.pendingEncounter = false; } catch (e) {}
    try { if (Game.state && Game.state.scholar) delete Game.state.scholar.feastDraw; } catch (e) {}
    const before = said.length;
    let r = null;
    try { r = Game.drawFeastScavenger(); } catch (e) {}
    if (r && r.drawn && !firstDrawText) firstDrawText = said.slice(before).map((s) => s.text).join('\n');
    if (r && r.drawn && r.monsterId === 'herald') {
      heraldDraw = { drawIndex: i, narration: said.slice(before).map((s) => s.text).join('\n') };
    }
  }
  let face = null;
  if (heraldDraw) {
    // The draw left pendingEncounter=true + pendingMonsterId='herald'.
    const origFeasted = Game.feastedActive;
    Game.feastedActive = () => true;
    const before = said.length;
    let res = null;
    try { res = Game.faceFeastDraw(); } catch (e) { res = { ok: false, why: 'threw: ' + e.message }; }
    const afterSay = said.slice(before).map((s) => s.text).join('\n');
    let pendingAfter = null, pendingIdAfter = null, feastDrawAfter = null;
    try { pendingAfter = !!Game.pendingEncounter; pendingIdAfter = Game.pendingMonsterId || null; } catch (e) {}
    try { feastDrawAfter = !!((Game.state && Game.state.scholar) || {}).feastDraw; } catch (e) {}
    face = { res, refusalSay: afterSay, pendingAfter, pendingIdAfter, feastDrawAfter };
    Game.feastedActive = origFeasted;
  }
  Game.unlockedWave = origWave;

  const out = {
    seed: SEED, titanIds: Object.keys(TITANS).sort(),
    f1, f2,
    sense: {
      heraldDrawn: !!heraldDraw, heraldDraw,
      firstNonHeraldDrawNarration: heraldDraw ? null : firstDrawText,
      face,
    },
  };
  console.log(JSON.stringify(out, null, 2));
  const pass = f1.wave4.titan === 0 && f1.wave5.titan === 0 && f2.titan === 0;
  console.log(pass
    ? 'TITANEXCL PASS: no titan in castMonster (w4/w5) or feast draws'
    : `TITANEXCL FAIL (control leak or regression): w4 titan=${f1.wave4.titan} w5 titan=${f1.wave5.titan} feast titan=${f2.titan}`);
  process.exit(pass ? 0 : 1);
}

main().catch((e) => { console.error('TITANEXCL HARNESS ERROR', e && e.stack || e); process.exit(2); });
