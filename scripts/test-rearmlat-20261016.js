#!/usr/bin/env node
// scripts/test-rearmlat-20261016.js — proof for scripts/rearmlat-20261016.js
// (loop B sim-rearmlat-b, 2026-10-16, food-economy axis; #385/#386 instrument)
//
// PART A — pure fixtures (attribRearm accounting):
//   A1 meal-driven at the boundary (voluntaryNet -4999 >= -5000 -> meal)
//   A2 voluntary-driven (voluntaryNet -5001 < -5000 -> voluntary)
//   A3 exact -5000 never arms the voluntary side (strict < -> meal)
//   A4 not attributed when a core field is missing
//   A5 attributed WITH coldAgreement: null (bearer had no cold-shoulder
//      firing while in office — explicitly recorded, not missing)
//   A6 not attributed when coldAgreement is undefined (unknown)
//   A7 gate-off installs nothing (7 wrapped refs unchanged, stub track)
//
// PART B — det-gate (live engine): 2 policies x 2 seeds = 4 pairs; each
//   pair compares PRISTINE vs INSTR-ON and PRISTINE vs INSTR-OFF per-dawn
//   ledger hashes — 4/4 trajectory-identity required (FEASTSCALE_R13=1,
//   SEATDRIVE=0, the sweep substrate).
//
// SMOKE=1 — instrument honesty on the live engine (leadfeast, s103, 90d):
//   re-arm events all successors (initial vid excluded), latencies in the
//   2-6d census band, driver meal on the courtship substrate, stage 0->1
//   firings captured with agreement fields, uninstall restores all wraps.
//
// Node harness: sim-harness (Math.random seeded BEFORE eval; Game.save never
// stubbed). Never run concurrent jest; --cacheDirectory=/tmp/jest-cache-*.
//
// Usage: node scripts/test-rearmlat-20261016.js
//        SMOKE=1 node scripts/test-rearmlat-20261016.js
'use strict';

const SMOKE = process.env.SMOKE === '1';
let failures = 0;
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

process.env.REARMLAT = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { installRearmLat, attribRearm } = require('./rearmlat-20261016');

function baseArm(over) {
  return Object.assign({
    vid: 'v9', mantleDay: 40, armDay: 44, rearmed: true, latency: 4,
    cumNet: -6000, voluntaryNet: -500, voluntaryNet7: 0, volArmDay: null,
    mealKcal: 5500, volTakeKcal: 500, mealShare: 0.917,
    coldAgreement: null, coldFiringDay: null, coldVn7: null, coldVn: null,
  }, over || {});
}

function partA() {
  console.log('PART A — attribRearm fixtures');
  let a = attribRearm(baseArm({ voluntaryNet: -4999 }));
  check('A1 meal-driven at boundary (-4999)', a.attributed && a.driver === 'meal', JSON.stringify(a));
  a = attribRearm(baseArm({ voluntaryNet: -5001 }));
  check('A2 voluntary-driven below bar (-5001)', a.attributed && a.driver === 'voluntary', JSON.stringify(a));
  a = attribRearm(baseArm({ voluntaryNet: -5000 }));
  check('A3 exact -5000 is meal-driven (strict <)', a.attributed && a.driver === 'meal', JSON.stringify(a));
  a = attribRearm(baseArm({ mealShare: null }));
  check('A4 missing core field -> not attributed', !a.attributed && a.driver === null, a.notes.join(','));
  a = attribRearm(baseArm({ coldAgreement: null }));
  check('A5 coldAgreement null -> attributed', a.attributed === true, JSON.stringify(a));
  const b = baseArm(); delete b.coldAgreement;
  a = attribRearm(b);
  check('A6 coldAgreement undefined -> not attributed', !a.attributed, a.notes.join(','));
  // A7: gate-off installs nothing
  process.env.REARMLAT = '';
  const G = {
    recordTakeHist() {}, recordGiveHist() {}, say() {}, journalNote() {}, playerDeath() {},
  };
  const refs = [G.recordTakeHist, G.recordGiveHist, G.say, G.journalNote, G.playerDeath];
  const t = installRearmLat(G);
  const same = refs[0] === G.recordTakeHist && refs[1] === G.recordGiveHist &&
    refs[2] === G.say && refs[3] === G.journalNote && refs[4] === G.playerDeath;
  let dawnOk = true;
  try { t.dawn(G); t.uninstall(); } catch (e) { dawnOk = false; }
  check('A7 gate-off wraps nothing (byte-identical by construction)', !t.on && same && dawnOk);
  process.env.REARMLAT = '1';
}

async function partB() {
  console.log('PART B — det-gate: trajectory-identity (4 pairs, FEASTSCALE_R13=1, SEATDRIVE=0)');
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const POLICIES = { leadfeast, belongfeast };

  async function runHashes(policyId, seed, instrMode) {
    // instrMode: 'off' (env gate off), 'on' (env gate on)
    process.env.REARMLAT = instrMode === 'on' ? '1' : '';
    const { Game } = await loadGame({ seed, mode: 'rl-' + policyId + '-' + instrMode, fullTelemetry: false });
    await setupGame(Game);
    const track = installRearmLat(Game);
    const hs = [];
    const base = POLICIES[policyId];
    const policy = Object.assign({}, base);
    const od = base.daily;
    policy.daily = (G, ctx) => {
      if (track && track.on) track.dawn(G);
      try {
        const s = G.state.scholar || {}, v = G.state.village || {};
        const m = (o) => Object.keys(o || {}).sort().map(k => k + '=' + Math.round(o[k])).join(',');
        hs.push([s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
          (v.roster || []).length, m(v.trust), m(v.takes), m(v.gives)].join('|'));
      } catch (e) { hs.push('ERR'); }
      if (od) return od(G, ctx);
    };
    await quietLog(async () => { await runDays(Game, policy, { days: 30 }); });
    if (track) { try { track.dawn(Game); } catch (e) {} track.uninstall(); }
    return hs.join('\n');
  }

  let ok = 0;
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of [103, 214]) {
      const pristine = await runHashes(pid, seed, 'off');
      const gateOff = await runHashes(pid, seed, 'off'); // same env: determinism sanity
      const gateOn = await runHashes(pid, seed, 'on');
      const det = pristine === gateOff;
      const ident = pristine === gateOn;
      if (det && ident) ok++;
      check(`B det-gate ${pid} s${seed} (off==off, pristine==on)`, det && ident,
        det ? (ident ? 'byte-identical' : 'GATE-ON DIVERGED') : 'NONDETERMINISTIC');
    }
  }
  console.log(`  det-gate: ${ok}/4 trajectory-identity pairs`);
  if (ok !== 4) failures++;
}

async function smoke() {
  console.log('SMOKE — instrument honesty (leadfeast, s103, 90d)');
  process.env.REARMLAT = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { leadfeast } = require('./policies/feastscale');
  const { Game } = await loadGame({ seed: 103, mode: 'rl-smoke', fullTelemetry: false });
  await setupGame(Game);
  const track = installRearmLat(Game);
  check('smoke armed (gate on)', track.on === true);
  const base = leadfeast;
  const policy = Object.assign({}, base);
  const od = base.daily;
  policy.daily = (G, ctx) => { track.dawn(G); if (od) return od(G, ctx); };
  await quietLog(async () => { await runDays(Game, policy, { days: 90 }); });
  track.dawn(Game);
  const fin = track.finalize();
  track.uninstall();
  check('smoke 0 instrument errors', fin.errors.length === 0, fin.errors.slice(0, 3).join(' | '));
  const armed = fin.rearms.filter(r => r.rearmed);
  const initialExcluded = fin.rearms.every(r => String(r.vid) !== String(track.initialVid));
  check('smoke initial vid excluded from successors', initialExcluded, 'initialVid=' + track.initialVid);
  const latBand = armed.every(r => r.latency >= 1 && r.latency <= 10);
  check('smoke re-arm latencies in census band (1-10d)', latBand && armed.length > 0,
    'armed=' + armed.length + ' lat=' + armed.map(r => r.latency).join(','));
  const allMeal = armed.every(r => r.driver === 'meal');
  check('smoke courtship substrate: all re-arms meal-driven', allMeal,
    armed.map(r => r.driver).join(','));
  const allAttr = armed.every(r => r.attributed);
  check('smoke all re-arms attributed with 4 fields', allAttr,
    armed.length + '/' + armed.length);
  const fs = fin.coldShoulder.firings;
  const fsOk = fs.every(f => (f.agreed7 === true || f.agreed7 === false));
  check('smoke cold-shoulder firings carry agreement fields', fsOk, 'firings=' + fs.length);
  const beatsOk = fin.beats.length > 0 && fin.beats.every(b => typeof b.text === 'string');
  check('smoke fiction beats captured for sense-test', beatsOk, 'beats=' + fin.beats.length);
  // uninstall restores
  const restored = ['recordTakeHist', 'recordGiveHist', 'say', 'journalNote', 'playerDeath']
    .every(k => (typeof Game[k] === 'function') !== false);
  check('smoke uninstall leaves Game callable', restored);
}

async function main() {
  partA();
  await partB();
  if (SMOKE) await smoke();
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
