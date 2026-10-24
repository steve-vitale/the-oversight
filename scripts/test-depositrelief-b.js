#!/usr/bin/env node
// test-depositrelief-b.js — DEPOSITRELIEF=1 buffer-aware deposit-gate
// stand-down proof (sim-depositrelief-b, 2026-10-24, axis food-economy).
//
// The lever: DEPOSITRELIEF=1. When the pantry reads plentiful fresh but the
// deep-reserve buffer is thin (pantryDaysEstimate() <= 4 — the SAME >4 line
// PLENTYDEPRI=2 used; read-only sensor read, no state writes, no RNG), the
// deposit gate STANDS DOWN: homecoming keep stays 2000 (no raise),
// _depositGateHoldback returns 0 (no holdback), the funnel.share ease is
// skipped — the haul flows to the pantry as before. Env-gated: active ONLY
// when process.env.DEPOSITRELIEF === '1'; browser (no process) OFF.
// Substrate: DEPOSITGATE=1, PLENTYDEPRI=0 (the deposit channel in isolation;
// PD unset would silently arm the landed PD=1 default).
//
// RED (DEPOSITRELIEF=0): relief unreachable — _depositReliefOn() false,
//   _depositReliefBufferClear() short-circuits true before any sensor read,
//   the gate eases exactly as landed (holdback holds, no ledger, no voice).
// GREEN (DR=1, buffer THICK): eases EXACTLY like landed DEPOSITGATE=1 —
//   same engaged flag, same holdback math, same voice; no relief ledger.
// GREEN (DR=1, buffer THIN): the gate stands down — engaged false, holdback
//   0, the stand-down is noted (vv._depositRelief, per-vid), the day voice
//   speaks the stand-down line ONCE (never silent), idempotent, real-
//   villager speaker, deterministic (no RNG). The sensor alone would ease
//   (prodThrottleEngaged true) — the stand-down is the relief, not the
//   throttle. On a LEAN day the gate would not ease anyway — no note, no
//   voice (never narrated when it didn't ease).
// DET-GATE: (a) DR=0 full-run legs never touch the relief (no ledger); (b)
//   unset == DR=0 byte-identical trajectories; (c) DR=1 deterministic.
//   The relief branch is unreachable by short-circuit unless
//   DEPOSITRELIEF=1, so gate-off trajectories cannot diverge from landed
//   DEPOSITGATE=1; the diff is confined to the gate region (cited in the
//   evidence file).
'use strict';
const crypto = require('crypto');
const vm = require('vm');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.DEPOSITGATE = '1';
process.env.PLENTYDEPRI = '0';

// freshKcal stocked as fresh food; roster of 12 => fallback burn 24000/d.
// 150000 => freshDays 6.25, deep estimate 6  (buffer CLEAR)
// 100000 => freshDays 4.17, deep estimate 4  (buffer THIN: plentiful fresh,
//            deep reserve at/below the same >4 line)
async function fixture(freshKcal) {
  const { Game } = await loadGame({ seed: 9001, mode: 'proof-depositrelief', fullTelemetry: false });
  await setupGame(Game);
  Game.state.scholar.day = 30; // set BEFORE stocking: stockPantry stamps
  const v = Game.state.village; // spoilDay relative to today; stocking first
  v.pantry = [];                // then advancing the day would spoil it
  if (freshKcal > 0) Game.stockPantry(freshKcal, 'Foraged food');
  return { Game, v };
}

function villagerOf(Game) {
  const v = Game.state.village;
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    const p = Game.getPerson(id);
    if (p && !p.dead) return { vid: id, person: p };
  }
  throw new Error('no living villager');
}

function fp(Game) {
  const st = Game.state || {};
  const s = JSON.stringify(st, (k, v) => (k === 'ms' || k === '_ms' || k === 'pacing' || k === 'lastTs' || k === 'dayMinutes' || k === 'totalMin' ? 0 : v));
  return crypto.createHash('sha256').update(s).digest('hex').slice(0, 24);
}

(async () => {
  let fail = 0;
  const check = (name, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + name); if (!cond) fail++; };

  // ---------- RED: DR=0 — relief unreachable, gate eases as landed ----------
  {
    process.env.DEPOSITRELIEF = '0';
    const { Game, v } = await fixture(100000); // THIN buffer
    const { vid } = villagerOf(Game);
    check('RED fixture plentiful (freshDays>4)', Game.pantryFreshDays() > 4);
    check('RED fixture buffer thin (deep<=4)', Game.pantryDaysEstimate() <= 4);
    check('RED relief off', Game._depositReliefOn() === false);
    check('RED buffer gate clear (short-circuit)', Game._depositReliefBufferClear() === true);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    check('RED gate engages on thin buffer (landed behavior)', Game._depositGateEngaged(vid) === true);
    const held = Game._depositGateHoldback(vid, 600, 'return');
    check('RED holdback holds half as landed', held === 300);
    const depR = (Game.state.village || {})._depositRelief;
    check('RED no relief ledger', depR === undefined);
    const dg = (Game.state.village || {})._depositGate;
    check('RED gate ledger counted the ease (landed)', !!(dg && dg.days && dg.days[30] && dg.days[30].returnEased === 1));
    Game._depositReliefDayVoice(v);
    check('RED relief day voice silent, no state', lines.length === 0 && (Game.state.village || {})._depositRelief === undefined);
    Game.say = oSay;
  }

  // ---------- DR=1 THICK: eases exactly like landed ----------
  let thickHeld = null;
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game, v } = await fixture(150000); // THICK buffer
    const { vid } = villagerOf(Game);
    check('DR1-THICK buffer clear (deep>4)', Game.pantryDaysEstimate() > 4);
    check('DR1-THICK relief armed', Game._depositReliefOn() === true);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    check('DR1-THICK gate engages (like landed)', Game._depositGateEngaged(vid) === true);
    thickHeld = Game._depositGateHoldback(vid, 600, 'return');
    check('DR1-THICK holdback holds half (like landed)', thickHeld === 300);
    check('DR1-THICK no relief ledger on clear buffer', (Game.state.village || {})._depositRelief === undefined);
    Game._depositReliefDayVoice(v);
    check('DR1-THICK relief voice silent (nothing stood down)', lines.length === 0);
    Game.say = oSay;
  }

  // ---------- DR=1 THIN: stand-down (keep 2000, holdback 0, ledger, voice) ----------
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game, v } = await fixture(100000); // THIN buffer
    const { vid } = villagerOf(Game);
    check('DR1-THIN sensor alone would ease (prodThrottleEngaged)', Game.prodThrottleEngaged() === true);
    const lines = [];
    const oSay = Game.say; Game.say = (s) => { lines.push(String(s)); };
    check('DR1-THIN gate stands down', Game._depositGateEngaged(vid) === false);
    const held = Game._depositGateHoldback(vid, 600, 'return');
    check('DR1-THIN holdback returns 0 (no holdback)', held === 0);
    const lr = (Game.state.village || {})._depositRelief;
    check('DR1-THIN relief ledger noted the stand-down', !!(lr && lr.days && lr.days[30] && lr.days[30].standDown >= 1));
    check('DR1-THIN relief ledger named the villager', !!(lr && lr.days[30].vids.indexOf(vid) !== -1));
    // the homecoming keep decision reads the same gate: engaged false means
    // KEEP_KCAL stays 2000 (no raise) — the keep raise is unreachable.
    check('DR1-THIN homecoming keep unrised (gate false)', Game._depositGateEngaged(Game.villagerId) === false);
    check('DR1-THIN stand-down voices nothing yet (day-level voice)', lines.length === 0);
    Game._depositReliefDayVoice(v);
    check('DR1-THIN stand-down voice fired exactly once', lines.length === 1);
    check('DR1-THIN voice names the thin buffer', /thin|back shelves|deep/.test(lines[0]));
    check('DR1-THIN voice is a send-it-to-the-pantry choice', /pantry|store|deposit/i.test(lines[0]));
    check('DR1-THIN voice is not the ease voice', !/eat at the fire|full shelves don.t need|dinner.s on me/i.test(lines[0]));
    const spk = (l) => { const m = /^🍽️ (\S+)/.exec(l || ''); return m ? m[1] : '?'; };
    const spk1 = spk(lines[0]);
    check('DR1-THIN speaker is a real villager', spk1 !== '?' && spk1 !== 'Someone');
    Game._depositReliefDayVoice(v);
    check('DR1-THIN voice idempotent', lines.length === 1);
    // next day: a fresh stand-down voices again
    Game.state.scholar.day = 31;
    Game._depositGateEngaged(vid);
    Game._depositReliefDayVoice(v);
    check('DR1-THIN voices again next day', lines.length === 2);
    Game.say = oSay;
  }

  // ---------- invariants ----------
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game } = await fixture(0); // LEAN pantry
    const { vid } = villagerOf(Game);
    Game.say = () => {};
    check('DR1-LEAN gate would not ease anyway', Game._depositGateEngaged(vid) === false);
    check('DR1-LEAN no relief note on a lean day', (Game.state.village || {})._depositRelief === undefined);
    const lines = [];
    Game.say = (s) => { lines.push(String(s)); };
    Game._depositReliefDayVoice(Game.state.village);
    check('DR1-LEAN relief voice silent (never narrated when it did not ease)', lines.length === 0);
  }
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game } = await fixture(100000);
    const { vid } = villagerOf(Game);
    Game.say = () => {};
    const a = Game._depositGateEngaged(vid);
    const b = Game._depositGateEngaged(vid);
    check('DR1 deterministic (no RNG in path)', a === b);
  }
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game } = await fixture(100000);
    Game.progState().hungryStreak = 3;
    const { vid } = villagerOf(Game);
    Game.say = () => {};
    check('DR1 hunger-stretch: gate off, no relief note', Game._depositGateEngaged(vid) === false && (Game.state.village || {})._depositRelief === undefined);
  }
  // gate OFF entirely: relief cannot engage through a dead gate
  {
    process.env.DEPOSITRELIEF = '1';
    process.env.DEPOSITGATE = '0';
    const { Game } = await fixture(100000);
    const { vid } = villagerOf(Game);
    Game.say = () => {};
    check('DR1 gate-off: engaged false, no note', Game._depositGateEngaged(vid) === false && (Game.state.village || {})._depositRelief === undefined);
    process.env.DEPOSITGATE = '1';
  }

  // ---------- browser path (no process): relief off ----------
  {
    process.env.DEPOSITRELIEF = '1';
    const { Game } = await fixture(0);
    const src = '(' + Game._depositReliefOn.toString().replace(/^[A-Za-z_$][\w$]*\s*\(/, 'function(') + ')';
    const fn = vm.runInNewContext(src, {});
    check('DR browser path (no process) off', fn() === false);
  }

  // ---------- DET-GATE: full-run trajectories ----------
  async function runFp(drVal, seed) {
    if (drVal === 'UNSET') delete process.env.DEPOSITRELIEF; else process.env.DEPOSITRELIEF = drVal;
    const { Game } = await loadGame({ seed, mode: 'detgate-depositrelief', fullTelemetry: false });
    await setupGame(Game);
    await runDays(Game, Object.assign({}, leadfeast), { days: 40, manifest: null });
    const v = Game.state.village || {};
    const relief = v._depositRelief;
    const reliefN = relief ? Object.values(relief.days || {}).reduce((t, d) => t + (d.standDown || 0), 0) : 0;
    return fp(Game) + ':relief=' + reliefN + ':ledger=' + (relief ? 'yes' : 'no');
  }
  {
    const a = await runFp('0', 9001), c = await runFp('0', 9001);
    check('DETGATE DR=0 deterministic across runs', a === c);
    check('DETGATE DR=0 relief ledger absent', /ledger=no/.test(a));
    const u1 = await runFp('UNSET', 9003), d0 = await runFp('0', 9003);
    check('DETGATE unset == DR=0 byte-identical', u1 === d0);
    const t1 = await runFp('1', 9004), t2 = await runFp('1', 9004);
    check('DETGATE DR=1 deterministic across runs', t1 === t2);
  }

  delete process.env.DEPOSITRELIEF;
  console.log(fail === 0 ? 'ALL GREEN' : fail + ' FAILURES');
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
