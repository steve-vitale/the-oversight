#!/usr/bin/env node
// scripts/test-unlockbeat-20261015.js — proof for the Standing-path unlock
// announcement fix (sim-unlockbeat, 2026-10-15).
//
// REAL RED→GREEN: on the pre-fix tree the assertions FAIL (the blank: a
// Standing-driven wave unlock fires no beat — the System stays silent while
// the wave is already in the spawn pool); on the fixed tree they PASS.
//   node scripts/test-unlockbeat-20261015.js
// Exit 0 = GREEN (fixed behavior). Non-zero = RED (pre-fix / regression).
//
// Engine-honest: seeded RNG (the harness seeds Math.random BEFORE eval, so
// load-time captures stay deterministic), full module list, real newGame,
// real hostFeast / real endDay, real mship links, real feastLog shape. No
// stubs (never stub Game.save), no monkey-patching of engine methods.
//
// Scenarios:
//   BREAD (no-early + fires-on-crossing): rig 3 feasts in state.feastLog
//     (standing 60), adopt _waveAnnounced=1, then drive the 4th and 5th
//     feasts through the REAL Game.hostFeast. 4th (standing 80): NO beat.
//     5th (standing 100): the beat fires inside hostFeast, same day.
//   BONDS (dawn catch): rig 3 subordinate links at day-29/trust-45 in the
//     REAL mship links array, adopt _waveAnnounced=1, run the REAL
//     Game.endDay. At dawn the links season (30d), standing 102,
//     unlockedWave()=4: the beat fires.
//   NODOUBLE (kill path already announced): with state._waveAnnounced=4,
//     a further feast (crossing nothing new) fires NO additional beat.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let PASS = 0, FAIL = 0;
function check(name, cond, extra) {
  if (cond) { PASS++; console.log('  ok   ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
const BEAT_RE = /New casting directives incoming/;
const MIRROR_RE = /MIRROR DRAFT/;

function ringWrap(Game) {
  const ring = [];
  const oSay = Game.say, oSys = Game.sysSay;
  Game.say = function (m) { try { ring.push('say: ' + String(m).slice(0, 220)); } catch (e) {} return oSay.apply(this, arguments); };
  Game.sysSay = function (m) { try { ring.push('sys: ' + String(m).slice(0, 220)); } catch (e) {} return oSys.apply(this, arguments); };
  return ring;
}
const beatCount = (ring) => ring.filter(l => BEAT_RE.test(l)).length;

function stockPantry(Game) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  const ids = ['smoked_turkey', 'pemmican_cakes', 'dried_berries', 'acorn_flour', 'smoked_fish'];
  for (const id of ids) v.pantry.push({ itemId: id, name: id.replace(/_/g, ' '), kcalEach: 600, units: 60 });
}
function guests(Game) {
  const v = Game.state.village, me = Game.villagerId;
  return (v.roster || []).filter(id => id !== me).slice(0, 6);
}
function atHaven(Game) {
  const v = Game.state.village || {};
  Game.map.px = (v.px == null ? 4 : v.px);
  Game.map.py = (v.py == null ? 4 : v.py);
}
const standing = (Game) => { try { return Game.villageStandingTotal(); } catch (e) { return -1; }; };
const uwave = (Game) => { try { return Game.unlockedWave(); } catch (e) { return -1; }; };

async function breadScenario() {
  console.log('\n[BREAD] feast-driven w4 unlock via real hostFeast');
  const { Game } = await loadGame({ seed: 20261015, mode: 'unlockbeat-bread' });
  await setupGame(Game);
  const ring = ringWrap(Game);
  atHaven(Game);
  stockPantry(Game);
  const g = guests(Game);
  check('bread: 6 guests available', g.length >= 5, 'guests=' + g.length);
  // Rig 3 engine-shaped feasts (standing 60 < t4=100).
  Game.state.feastLog = [{ day: 1, quality: 1 }, { day: 1, quality: 1 }, { day: 1, quality: 1 }];
  check('bread: standing rigged to 60', standing(Game) === 60, 'standing=' + standing(Game));
  check('bread: wave still 1 pre-unlock', uwave(Game) === 1, 'uwave=' + uwave(Game));
  // Adopt the watermark at the current wave (parity path: old saves adopt silently).
  Game.checkWaveUnlockBeat();
  check('bread: adopt fires no beat', beatCount(ring) === 0, 'beats=' + beatCount(ring));
  // 4th feast through the REAL hostFeast (standing 80 — below the gate).
  const r4 = Game.hostFeast({ guests: g });
  check('bread: 4th feast held, quality>=1', !!(r4 && r4.ok && (r4.quality | 0) >= 1), JSON.stringify(r4 && { ok: r4.ok, why: r4.why, q: r4.quality }));
  check('bread: standing 80 after 4th feast', standing(Game) === 80, 'standing=' + standing(Game));
  check('bread: NO early beat below the gate', beatCount(ring) === 0, 'beats=' + beatCount(ring));
  Game.endDay();
  // 5th feast (standing 100 — the gate crosses).
  stockPantry(Game);
  const dayBefore = (Game.state.scholar || {}).day || 0;
  const r5 = Game.hostFeast({ guests: g });
  check('bread: 5th feast held, quality>=1', !!(r5 && r5.ok && (r5.quality | 0) >= 1), JSON.stringify(r5 && { ok: r5.ok, why: r5.why, q: r5.quality }));
  check('bread: wave 4 unlocked by the feast', uwave(Game) >= 4, 'uwave=' + uwave(Game) + ' standing=' + standing(Game));
  check('bread: beat fired on the unlock (inside hostFeast)', beatCount(ring) === 1, 'beats=' + beatCount(ring));
  check('bread: beat is the Mirror Draft voice', ring.some(l => MIRROR_RE.test(l)));
  // NODOUBLE: one more feast crosses nothing new — no second beat.
  Game.endDay();
  stockPantry(Game);
  const r6 = Game.hostFeast({ guests: g });
  check('bread: 6th feast held', !!(r6 && r6.ok), JSON.stringify(r6 && { ok: r6.ok, why: r6.why }));
  check('bread: no double-fire (still exactly 1 beat)', beatCount(ring) === 1, 'beats=' + beatCount(ring));
  return { dayBefore };
}

async function bondsScenario() {
  console.log('\n[BONDS] link-seasoning w4 unlock via real endDay');
  const { Game } = await loadGame({ seed: 20261016, mode: 'unlockbeat-bonds' });
  await setupGame(Game);
  const ring = ringWrap(Game);
  // Day 31; links formed day 2 (29 days ago — one dawn from seasoning).
  Game.state.scholar.day = 31;
  if (Game.state.village) Game.state.village.day = 31;
  Game.mshipState().links = ['oakvale', 'millrun', 'cinderford'].map(s => ({
    status: 'active', primary: 'haven', subordinate: s, day: 2, trust: 45,
  }));
  check('bonds: links unseasoned pre-dawn', !Game._linkSeasoned(Game.mshipState().links[0]));
  check('bonds: standing 0 pre-dawn', standing(Game) === 0, 'standing=' + standing(Game));
  check('bonds: wave 1 pre-dawn', uwave(Game) === 1, 'uwave=' + uwave(Game));
  Game.checkWaveUnlockBeat();
  check('bonds: adopt fires no beat', beatCount(ring) === 0, 'beats=' + beatCount(ring));
  const dayBefore = (Game.state.scholar || {}).day || 0;
  Game.endDay();
  const dayAfter = (Game.state.scholar || {}).day || 0;
  check('bonds: day advanced exactly 1', dayAfter === dayBefore + 1, dayBefore + '->' + dayAfter);
  check('bonds: links seasoned at dawn', !!Game._linkSeasoned(Game.mshipState().links[0]));
  check('bonds: standing 102 (3 seasoned regional links)', standing(Game) === 102, 'standing=' + standing(Game));
  check('bonds: wave 4 unlocked at dawn', uwave(Game) >= 4, 'uwave=' + uwave(Game));
  check('bonds: beat fired at dawn (lag 0)', beatCount(ring) === 1, 'beats=' + beatCount(ring));
  check('bonds: beat is the Mirror Draft voice', ring.some(l => MIRROR_RE.test(l)));
}

async function main() {
  try {
    await breadScenario();
    await bondsScenario();
  } catch (e) {
    FAIL++;
    console.log('  FAIL harness threw: ' + (e && e.stack || e));
  }
  console.log(`\nUNLOCKBEAT PROOF: ${PASS} passed, ${FAIL} failed`);
  if (FAIL) { console.log('RED — pre-fix behavior or regression'); process.exit(1); }
  console.log('GREEN — Standing-path unlocks announce on unlock day');
}

main();
