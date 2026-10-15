#!/usr/bin/env node
// scripts/test-wave4ready-20261014.js — PROOF for the wave4ready arm.
//
// Two runs:
//   node scripts/test-wave4ready-20261014.js
//     # pristine: expect REAL RED (the gate is off; the export is the
//     # underlying proposelayer export, reference-equal)
//   PROPOSELAYER=1 WAVE4READY=1 node scripts/test-wave4ready-20261014.js
//     # armed: expect GREEN
//
// RED phase: R1 asserts the ARMED identity and FAILS on pristine (REAL RED);
// R2/R3 document the inert chain (gate-off export IS the proposelayer export;
// the daily cannot fire the propose verb).
//
// GREEN phase: the readiness doctrine, through the real engine —
//   G1 identity; G2 the gate HOLDS the 3rd proposal while not-ready;
//   G3 the gate RELEASES the 3rd proposal once ready; G4 the tend verb holds
//   the 3rd+ link at arm's length while not-ready (tends the 2 oldest) and
//   releases when ready; G5 the never-ready edge — 60 days of held passes,
//   no 3rd proposal ever, Standing stays below 100; G6 combatReady unit
//   checks (each signal necessary, all three sufficient).
'use strict';
const fs = require('fs');
const path = require('path');
const ARMED = process.env.WAVE4READY === '1';
const { loadGame, setupGame } = require('./sim-harness');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

function setPantry(Game, kcal) {
  const v = Game.state.village;
  v.pantry = v.pantry || [];
  const cur = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  if (kcal > cur) v.pantry.push({ id: 'w4r-rig', name: 'rig grain', kcalEach: Math.round(kcal - cur), units: 1, foodState: 'fresh' });
  else if (kcal < cur && cur > 0) {
    let need = cur - kcal;
    for (const it of v.pantry) {
      if (need <= 0) break;
      const k = (it.kcalEach || 0) * (it.units || 1);
      if (k <= 0) continue;
      const cut = Math.min(k, need);
      const units = it.units || 1;
      const cutUnits = Math.min(units, Math.ceil(cut / (it.kcalEach || 1)));
      it.units = units - cutUnits;
      need -= cutUnits * (it.kcalEach || 0);
    }
    v.pantry = v.pantry.filter(it => (it.units || 1) > 0);
  }
  return v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function rig(seed) {
  const { Game } = await loadGame({ seed, mode: 'wave4ready-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  Game.state.pendingCounter = null;
  Game.state.pendingAccord = null;
  Game.state.pendingNational = null;
  Game.state.pendingGlobal = null;
  return Game;
}

function spyOn(Game, name) {
  const calls = [];
  const orig = Game[name];
  Game[name] = function (...a) { calls.push(a); return orig.apply(this, a); };
  return { calls, restore() { Game[name] = orig; } };
}

// openWindow: day>=25, pantry>12000, one known+unlinked candidate.
function openWindow(Game) {
  Game.state.scholar.day = 30;
  const v = Game.state.otherVillages[0];
  v.rumored = true;
  setPantry(Game, 13000);
  return v;
}

(async () => {
  console.log(`wave4ready proof — ${ARMED ? 'ARMED (WAVE4READY=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  let mod = null;
  try { mod = require('./policies/wave4ready'); } catch (e) { mod = null; }
  if (!mod) {
    console.log('INFO-SKIP: policies/wave4ready.js absent (killed arm, layer deleted per kill protocol). Pre-kill RED→GREEN 12/12 stands; nothing to run on the landed tree.');
    process.exit(0);
  }
  const { wave4ready, combatReady, resolveVillager, WAVE4READY_ON } = mod;
  const plMod = require('./policies/proposelayer');
  const { courtshipPass } = plMod;

  if (!ARMED) {
    // ---- RED: the doctrine is inert ----
    ok('R1-armed-identity', wave4ready.id === 'wave4ready' && WAVE4READY_ON === true,
      `id=${wave4ready.id} on=${WAVE4READY_ON} — the doctrine is inert on pristine`);
    ok('R2-gate-off-chain', wave4ready === plMod.proposelayer,
      'gate-off export IS the underlying proposelayer export (reference-equal)');
    const Game = await rig(11);
    openWindow(Game);
    const sp = spyOn(Game, 'proposeLink');
    try { wave4ready.daily(Game, {}); } catch (e) {}
    sp.restore();
    ok('R3-zero-fires-bare', sp.calls.length === 0,
      `proposeLink calls under the inert export on the open-window fixture: ${sp.calls.length}`);
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the doctrine is inert).`);
    process.exit(bad.length ? 1 : 0);
  }

  // ---- GREEN ----
  const { competent } = require('./policies/competent');
  ok('G1-armed-identity', wave4ready.id === 'wave4ready' && WAVE4READY_ON === true && typeof combatReady === 'function',
    `id=${wave4ready.id} on=${WAVE4READY_ON}`);
  ok('G1b-base-is-competent-daily', typeof wave4ready.daily === 'function' && wave4ready.id !== competent.id,
    'the armed policy has its own daily (competent base + gated courtship)');

  // G2 — the gate HOLDS the 3rd proposal while not-ready.
  {
    const Game = await rig(21);
    openWindow(Game);
    const fakes = [1, 2].map(i => ({ id: 'w4r' + i, status: 'active', primary: 'haven', conquered: false, subordinate: 'v' + i, day: 20 }));
    const origHS = Game.hierarchyState;
    Game.hierarchyState = () => fakes;
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx, { readinessGate: () => ({ ready: false }) });
    sp.restore();
    Game.hierarchyState = origHS;
    ok('G2-gate-holds', sp.calls.length === 0 && !ctx.plProposed,
      `proposeLink calls with 2 subs + not-ready: ${sp.calls.length} (the 3rd proposal is deferred)`);
  }

  // G3 — the gate RELEASES the 3rd proposal once ready.
  {
    const Game = await rig(22);
    const v = openWindow(Game);
    const fakes = [1, 2].map(i => ({ id: 'w4r' + i, status: 'active', primary: 'haven', conquered: false, subordinate: 'v' + i, day: 20 }));
    const origHS = Game.hierarchyState;
    Game.hierarchyState = () => fakes;
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    courtshipPass(Game, ctx, { readinessGate: () => ({ ready: true }) });
    sp.restore();
    Game.hierarchyState = origHS;
    const [tgt, opts] = sp.calls[0] || [];
    ok('G3-gate-releases', sp.calls.length === 1 && ctx.plProposed === 1 && tgt === v.id &&
      opts && opts.asSubordinate === false && opts.tributeKcalPerWeek === 4000,
      `proposeLink calls with 2 subs + ready: ${sp.calls.length} target=${tgt}`);
  }

  // G4 — tend holds the 3rd+ link at arm's length while not-ready; releases when ready.
  {
    const mkFakes = () => [20, 25, 28].map((d, i) => ({
      id: 'w4t' + i, status: 'active', primary: 'haven', conquered: false,
      subordinate: 'vx' + i, day: d, tendedWeek: -1,
    }));
    // not-ready: only the 2 oldest tended
    {
      const Game = await rig(23);
      Game.state.scholar.day = 30;
      const origHS = Game.hierarchyState;
      Game.hierarchyState = () => mkFakes();
      setPantry(Game, 25000);
      const sp = spyOn(Game, 'tendLink');
      const ctx = {};
      courtshipPass(Game, ctx, { readinessGate: () => ({ ready: false }) });
      sp.restore();
      Game.hierarchyState = origHS;
      const tended = sp.calls.map(c => c[0]).sort();
      ok('G4a-tend-hold', sp.calls.length === 2 && tended[0] === 'w4t0' && tended[1] === 'w4t1' && ctx.plTended === 2,
        `tended while not-ready: [${tended.join(',')}] (youngest w4t2 held)`);
    }
    // ready: all three tended
    {
      const Game = await rig(24);
      Game.state.scholar.day = 30;
      const origHS = Game.hierarchyState;
      Game.hierarchyState = () => mkFakes();
      setPantry(Game, 25000);
      const sp = spyOn(Game, 'tendLink');
      const ctx = {};
      courtshipPass(Game, ctx, { readinessGate: () => ({ ready: true }) });
      sp.restore();
      Game.hierarchyState = origHS;
      ok('G4b-tend-release', sp.calls.length === 3 && ctx.plTended === 3,
        `tended while ready: ${sp.calls.length} (hold lifted)`);
    }
  }

  // G5 — the never-ready edge: 60 days of held passes, no 3rd proposal ever,
  // Standing stays below 100. Real links via the engine's _formLink.
  {
    const Game = await rig(25);
    const ovs = Game.state.otherVillages;
    ovs[0].rumored = true; ovs[1].rumored = true; ovs[2].rumored = true;
    Game._formLink(ovs[0].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
    Game._formLink(ovs[1].id, { asSubordinate: false, tributeKcalPerWeek: 4000 }, null);
    setPantry(Game, 60000);
    const sp = spyOn(Game, 'proposeLink');
    const ctx = {};
    for (let d = 30; d < 90; d++) {
      Game.state.scholar.day = d;
      courtshipPass(Game, ctx, { readinessGate: () => ({ ready: false }) });
    }
    sp.restore();
    const subs = (Game.hierarchyState() || []).filter(l => l && l.status === 'active' && l.primary === 'haven' && !l.conquered).length;
    let standing = -1;
    try { standing = Game.villageStandingTotal(); } catch (e) {}
    ok('G5-never-ready', sp.calls.length === 0 && subs === 2 && standing >= 0 && standing < 100,
      `60d held: proposeLink calls=${sp.calls.length} subs=${subs} standing=${standing} (bar never crossed)`);
  }

  // G6 — combatReady unit checks: each signal necessary, all three sufficient.
  {
    const Game = await rig(26);
    const r0 = combatReady(Game);
    ok('G6a-bare-not-ready', r0.ready === false,
      `bare fixture: ready=${r0.ready} signals=${JSON.stringify(r0.signals)}`);
    // rig all three signals through the real code paths
    Game.state.scholar.equipped = { torso: { itemId: 'hide_armor' } }; // prot 20
    const rids = (Game.state.village.roster || []).slice(0, 3);
    for (const id of rids) {
      const v = resolveVillager(Game, id);
      if (v) v.equipped = { melee: { itemId: 'stone_knife' } }; // bonus 12
    }
    try { Game.recordWaveKill('redactor', 'player', 'test', null); } catch (e) {}
    const r1 = combatReady(Game);
    ok('G6b-all-three-ready', r1.ready === true &&
      r1.signals.armorP >= 20 && r1.signals.armedVillagers >= 3 && r1.signals.warPts >= 1,
      `rigged fixture: ready=${r1.ready} signals=${JSON.stringify(r1.signals)}`);
    // each signal alone is insufficient
    const Game2 = await rig(27);
    Game2.state.scholar.equipped = { torso: { itemId: 'hide_armor' } };
    ok('G6c-armor-alone', combatReady(Game2).ready === false, 'armorP>=20 alone: not ready');
    const Game3 = await rig(28);
    for (const id of (Game3.state.village.roster || []).slice(0, 3)) {
      const v = resolveVillager(Game3, id);
      if (v) v.equipped = { melee: { itemId: 'stone_knife' } };
    }
    ok('G6d-weapons-alone', combatReady(Game3).ready === false, '3 armed villagers alone: not ready');
    const Game4 = await rig(29);
    try { Game4.recordWaveKill('redactor', 'player', 'test', null); } catch (e) {}
    ok('G6e-war-alone', combatReady(Game4).ready === false, 'warPts>=1 alone: not ready');
  }

  const bad = results.filter(r => !r.ok);
  console.log(`\n${bad.length ? 'RED' : 'GREEN'}: ${results.length - bad.length}/${results.length} passed${bad.length ? ' — FIX BEFORE SPEND' : ' — the readiness doctrine holds below 100 pre-ready and releases post-ready.'}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
