#!/usr/bin/env node
// test-tabledeed-20261018.js — PROOF for the sim-tabledeed diagnostic arm.
//
// INSTRUMENT-ONLY: zero src/js changes, zero scripts/policies changes.
// Verifies the classifier/predicate story this diagnostic's verdict rests on:
//
//   1. CLASSIFIER fixtures: drive the REAL Game.tableSeat() /
//      Game.deedGateReady() with synthetic deed state and assert the
//      full/lesser/none matrix from docs/TABLE.md + MONSTER-WAVES.md.
//   2. SMOKE: on a short live run, the tableWaiting accessor captures a
//      set with a deed-state snapshot (proves the attribution machinery).
//   3. DET: instrument-on vs instrument-off re-runs are byte-identical
//      on all gameplay fields (the accessor perturbs nothing).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/test-tabledeed-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }
if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}

// Install the same tableWaiting accessor the sweep uses. Returns the
// set-log array and a restore function.
function installAccessor(Game) {
  const log = [];
  const prog = Game.progState();
  let val = prog.tableWaiting;
  delete prog.tableWaiting;
  Object.defineProperty(prog, 'tableWaiting', {
    configurable: true, enumerable: true,
    get() { return val; },
    set(v) {
      val = v;
      try {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        const stack = new Error().stack || '';
        const frame = stack.split('\n').map(s => s.trim())
          .find(s => /src\/js\/[^:]+\.js:\d+/.test(s) && !/installAccessor/.test(s)) || '';
        let seat = null, gate = null, arc = null, rank = null;
        try { seat = ((Game.tableSeat && Game.tableSeat()) || {}).seat || 'none'; } catch (e) {}
        try { gate = Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) {}
        try { arc = Game.progState().arc; } catch (e) {}
        try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
        log.push({
          day, value: !!v, callsite: frame.replace(/^at\s+/, ''),
          seat, arc, rank, gateOk: !!(gate && gate.ok),
          gateBars: gate ? { w1: gate.w1 | 0, w2: gate.w2 | 0, w3: gate.w3 | 0, w4: gate.w4 | 0, w5: gate.w5 | 0, contestsN: gate.contestsN | 0, crisesN: gate.crisesN | 0 } : null,
        });
      } catch (e) {}
    },
  });
  return { log, restore() { try { delete prog.tableWaiting; prog.tableWaiting = val; } catch (e) {} } };
}

// Set synthetic deed state on the real Game for classifier fixtures.
function deedSetup(Game, o) {
  const d = Game.deedState();
  d.wavesFaced = {};
  let n = 0;
  for (const [w, cnt] of [[1, o.w1], [2, o.w2], [3, o.w3], [4, o.w4 || 0], [5, o.w5 || 0]]) {
    for (let i = 0; i < (cnt | 0); i++) d.wavesFaced['m_w' + w + '_' + (n++)] = w;
  }
  d.contestsSurvived = o.contests | 0;
  const pg = Game.progState();
  pg.crises = {};
  for (let i = 0; i < (o.crises | 0); i++) pg.crises['c' + i] = 1;
  pg.sentimentTaught = !!o.foodDeeds;
  Game.state.scholar.prog.feastSurgeUsed = !!o.foodDeeds;
}

(async () => {
  // ---------- CLASSIFIER fixtures ----------
  {
    const { Game } = await loadGame({ seed: 54001, mode: 'tabledeed-proof', fullTelemetry: false });
    await setupGame(Game);
    // Runtime-only patches (test process; no src changes): pin the
    // predicates' environment so fixtures isolate the deed bars.
    const origRank = Game.scaleRank && Game.scaleRank.bind(Game);
    const origStage = Game.integrationStage && Game.integrationStage.bind(Game);
    let rankV = 'regional', stageV = 2;
    Game.scaleRank = function () { return rankV; };
    Game.integrationStage = function () { return stageV; };

    // 1. FULL: 5/5/4/3/2 + 3 contests + 3 crises + stage2 + foodDeeds
    deedSetup(Game, { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, foodDeeds: true });
    let g = Game.deedGateReady(), s = Game.tableSeat();
    check('classifier-full-gate-ok', g.ok === true, JSON.stringify(g));
    check('classifier-full-bars', g.w1 === 5 && g.w2 === 5 && g.w3 === 4 && g.w4 === 3 && g.w5 === 2, JSON.stringify({ w1: g.w1, w2: g.w2, w3: g.w3, w4: g.w4, w5: g.w5 }));
    check('classifier-full-seat', s.seat === 'full', s.seat);

    // 2. FULL bar short on w5 (1 < 2): gate fails, still lesser-eligible?
    // (5/5/4/3/1 + 3/3 + stage2 + food = lesser's 4/4/3 bar met, regional)
    deedSetup(Game, { w1: 5, w2: 5, w3: 4, w4: 3, w5: 1, contests: 3, crises: 3, foodDeeds: true });
    g = Game.deedGateReady(); s = Game.tableSeat();
    check('classifier-w5short-gate-not-ok', g.ok === false && g.waves === false, JSON.stringify({ ok: g.ok, waves: g.waves, w5: g.w5 }));
    check('classifier-w5short-seat-lesser', s.seat === 'lesser', s.seat);

    // 3. LESSER minimum exactly: 4/4/3 + 2 + 2 + regional + stage2 + food
    deedSetup(Game, { w1: 4, w2: 4, w3: 3, contests: 2, crises: 2, foodDeeds: true });
    rankV = 'regional'; stageV = 2;
    g = Game.deedGateReady(); s = Game.tableSeat();
    check('classifier-lesser-gate-not-ok', g.ok === false, JSON.stringify({ ok: g.ok }));
    check('classifier-lesser-seat', s.seat === 'lesser', JSON.stringify(s));

    // 4. BELOW lesser: 4/4/2 (w3 short) -> none
    deedSetup(Game, { w1: 4, w2: 4, w3: 2, contests: 2, crises: 2, foodDeeds: true });
    s = Game.tableSeat();
    check('classifier-below-lesser-none', s.seat === 'none', s.seat);

    // 5. Wave-3-only run with big w1-w3 counts: gate never fires (w4/w5 zero)
    deedSetup(Game, { w1: 15, w2: 15, w3: 9, contests: 10, crises: 5, foodDeeds: true });
    g = Game.deedGateReady(); s = Game.tableSeat();
    check('classifier-w3only-gate-not-ok', g.ok === false && g.w4 === 0 && g.w5 === 0, JSON.stringify({ ok: g.ok, w4: g.w4, w5: g.w5 }));
    check('classifier-w3only-seat-lesser', s.seat === 'lesser', s.seat);

    // 6. Lesser below scale floor (village): none even with deed bars
    deedSetup(Game, { w1: 4, w2: 4, w3: 3, contests: 2, crises: 2, foodDeeds: true });
    rankV = 'village';
    s = Game.tableSeat();
    check('classifier-lesser-scalefloor-none', s.seat === 'none', s.seat);
    rankV = 'regional';

    // 7. Full seat missing stage -> deedGateReady ok=false (stage bar in gate)
    deedSetup(Game, { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, foodDeeds: true });
    stageV = 1;
    g = Game.deedGateReady(); s = Game.tableSeat();
    check('classifier-full-stagefail-gate-not-ok', g.ok === false && g.stageOk === false, JSON.stringify({ ok: g.ok, stageOk: g.stageOk }));
    check('classifier-full-stagefail-seat-none', s.seat === 'none', s.seat); // lesser also needs stage>=2
    stageV = 2;

    if (origRank) Game.scaleRank = origRank;
    if (origStage) Game.integrationStage = origStage;
  }

  // ---------- SMOKE: accessor captures a live set ----------
  {
    const { Game } = await loadGame({ seed: 54001, mode: 'tabledeed-smoke', fullTelemetry: false });
    await setupGame(Game);
    const { log, restore } = installAccessor(Game);
    await quietLog(async () => { await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    Game.progState().tableWaiting = true; // synthetic set: proves capture
    check('smoke-capture', log.length >= 1, 'log=' + log.length);
    const e = log[log.length - 1];
    check('smoke-entry-shape', e && e.value === true && typeof e.day === 'number' && typeof e.callsite === 'string' && typeof e.seat === 'string' && typeof e.gateOk === 'boolean' && e.gateBars !== undefined, JSON.stringify(e));
    restore();
    check('smoke-restore', Game.progState().tableWaiting === true, String(Game.progState().tableWaiting));
  }

  // ---------- DET: instrument-on vs instrument-off byte-identical ----------
  {
    const gameplayFields = (j) => {
      const o = Object.assign({}, j);
      delete o.sets; delete o.instrument; delete o.label; delete o.mode;
      return JSON.stringify(o);
    };
    async function oneRun(withInstr) {
      const { Game } = await loadGame({ seed: 54002, mode: 'tabledeed-det', fullTelemetry: false });
      await setupGame(Game);
      let acc = null;
      if (withInstr) acc = installAccessor(Game);
      let result;
      await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 }); });
      if (acc) acc.restore();
      const st = Game.state || {};
      let national = 0, table = 0, won = 0, day = 0, arc = 0, seat = 'none', gateOk = false;
      try { const r = Game.scaleRank ? Game.scaleRank() : 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
      try { const pg = Game.progState(); if (pg.tableWaiting || pg.tableDone) table = 1; arc = pg.arc | 0; } catch (e) {}
      try { won = !!Game.won ? 1 : 0; } catch (e) {}
      try { day = (st.scholar && st.scholar.day) | 0; } catch (e) {}
      try { seat = ((Game.tableSeat && Game.tableSeat()) || {}).seat || 'none'; } catch (e) {}
      try { gateOk = !!(Game.deedGateReady && Game.deedGateReady().ok); } catch (e) {}
      const deathCauses = {};
      try { for (const d of (result.samples.deaths || [])) { const c = String((d && d.cause) || 'unknown'); deathCauses[c] = (deathCauses[c] || 0) + 1; } } catch (e) {}
      return { seed: 54002, policy: 'leadfeast', days: 60, finalDay: day, national, table, won, arc, seat, gateOk, maxWave: result.maxWaveUnlocked | 0, deathCauses };
    }
    const on = await oneRun(true), off = await oneRun(false);
    check('det-byte-identical', gameplayFields(on) === gameplayFields(off), '\non=' + gameplayFields(on) + '\noff=' + gameplayFields(off));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
