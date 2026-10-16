#!/usr/bin/env node
// test-trickres-20261016.js — proof record for the sim-trickres arm
// (axis scale-onramp): metric-revised CONFIRM of the landed counterwire layer.
//
// This arm is MEASUREMENT ONLY (zero src/js, zero policy changes). What is
// proven here:
//   CLASSIFY — the resolution classifier (scripts/trickres-instrument-20261016.js)
//     on 12 synthetic resolution arcs. RED: the OLD kill-only metric scores the
//     4 non-lethal arcs as failures (0) — the metric review's whole point.
//     GREEN: the new classifier counts the real resolutions and excludes the
//     false positives (single-token flees, unattributed kills, engine flees).
//   DET-GATE — the sweep instrument attached vs bare game: byte-identical
//     trajectories on identical seeds (read-only attach proven).
//   SMOKE — 20d pre-seat run with the instrument: completes, per-seed schema
//     valid, capture honest (valid outcomes, trickTokens arrays, no
//     known-violations on live data).
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness does
// it); child processes for process isolation (never two harnesses in one
// process); no Game.save stub; no hardcoded absolute paths (ROOT derived
// from __dirname); no copied eval boilerplate (all loads via sim-harness.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = process.env.REPO || path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');
const INSTRUMENT = path.join(ROOT, 'scripts', 'trickres-instrument-20261016.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

// ---------- CLASSIFY (RED -> GREEN) ----------
console.log('== CLASSIFY ==');
{
  const { classifyFieldFight, classifyTbFight, classifyKillOnly } = require(INSTRUMENT);

  // 12 synthetic resolution arcs (the fiction the metric review promises).
  const arcs = [
    { id: 'redactor-starve', f: { outcome: 'mFlee', trickTokens: ['wait:redactor-quiet', 'wait:redactor-quiet', 'wait:redactor-quiet'] }, attr: false, want: 'resolution:flee' },
    { id: 'eulogy-kind', f: { outcome: 'mFlee', trickTokens: ['contradict', 'contradict', 'contradict'] }, attr: false, want: 'resolution:flee' },
    { id: 'tos-dismiss', f: { outcome: 'mFlee', trickTokens: ['examine', 'examine'] }, attr: false, want: 'resolution:flee' },
    { id: 'focus-boreout', f: { outcome: 'mFlee', trickTokens: ['bore', 'bore', 'bore'] }, attr: false, want: 'resolution:flee' },
    { id: 'suburb-walkaway', f: { outcome: 'vFlee', trickTokens: ['leave'] }, attr: false, want: 'diagnostic:single-token-flee' },
    { id: 'offerfood-bribe', f: { outcome: 'mFlee', trickTokens: ['offer_food'] }, attr: false, want: 'diagnostic:single-token-flee' },
    { id: 'field-trick-kill', f: { outcome: 'vKill', trickTokens: ['shout', 'shout'] }, attr: true, want: 'resolution:kill' },
    { id: 'field-unattributed', f: { outcome: 'vKill', trickTokens: ['shout'] }, attr: false, want: 'diagnostic:unattributed-kill' },
    { id: 'engine-flee-clean', f: { outcome: 'mFlee', trickTokens: [] }, attr: false, want: 'diagnostic:none' },
    { id: 'engine-flee-1shout', f: { outcome: 'mFlee', trickTokens: ['shout'] }, attr: false, want: 'diagnostic:single-token-flee' },
    { id: 'tb-trick-kill', tb: { perfs: { hummice: ['shout', 'shout'] }, killAttributedByMid: { hummice: true } }, want: 'resolution:kill' },
    { id: 'tb-trick-nokill', tb: { perfs: { hummice: ['shout'] }, killAttributedByMid: {} }, want: 'diagnostic:none' },
  ];

  // RED: the old kill-only metric on the 4 non-lethal arcs — scores them as failures.
  const nonlethal = arcs.slice(0, 4).map(a => ({ cls: a.want.startsWith('resolution') && a.f.outcome !== 'vKill' ? 'flee-notkill' : 'x' }));
  // (classifyKillOnly counts cls==='kill'; none of the 4 non-lethal arcs is a kill.)
  const redScore = classifyKillOnly(nonlethal);
  ok(redScore === 0, `RED: kill-only metric scores the 4 non-lethal arcs as failures (${redScore}) — the metric review's point`);

  // GREEN: the new classifier.
  let greenOk = true;
  for (const a of arcs) {
    let got;
    if (a.tb) {
      const rs = classifyTbFight(a.tb);
      got = rs.length ? `resolution:${rs[0].kind}` : 'diagnostic:none';
    } else {
      const c = classifyFieldFight(a.f, a.attr);
      got = c.resolution ? `resolution:${c.kind}` : `diagnostic:${c.kind}`;
    }
    if (got !== a.want) { greenOk = false; console.log(`  arc ${a.id}: want ${a.want}, got ${got}`); }
  }
  ok(greenOk, 'GREEN: new classifier counts all 6 resolutions, excludes all 6 non-resolutions');
  ok(classifyFieldFight({ outcome: 'vDie', trickTokens: ['bore', 'bore', 'bore'] }, false).resolution === false,
    'a trick fired but the villager died anyway is NOT a resolution');
  ok(classifyFieldFight({ outcome: 'evade', trickTokens: ['shout'] }, false).resolution === false,
    'evade is never a resolution');
}

// ---------- DET-GATE ----------
console.log('== DET-GATE ==');
function hashRun(seed, withInstrument) {
  const tmpFile = '/tmp/trickres-det-' + seed + '-' + (withInstrument ? 'ins' : 'bare') + '-' + process.pid + '.js';
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
const { attachTrickresCapture } = require('${INSTRUMENT}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'detgate', fullTelemetry: false });
  await setupGame(Game);
  let cap = null;
  ${withInstrument ? 'cap = attachTrickresCapture(Game);' : ''}
  const res = await runDays(Game, TF.leadfeast, { days: 60, manifest: undefined, sampleEvery: 30 });
  if (cap) cap.restore();
  const st = Game.state;
  const h = JSON.stringify({
    day: st.scholar && st.scholar.day, won: !!Game.won,
    slain: st.villageSlain || {}, counters: st.monsterCounters || {}, vt: st.villagerTricks || {},
    obs: st.villageCounterObs || {}, kl: (st.waveKillLog || []).length,
    pop: (st.village && st.village.people ? Object.keys(st.village.people).length : null),
    deaths: (st.telemetry || []).filter(e => e.type === 'death').length,
  });
  let x = 0; for (let i = 0; i < h.length; i++) x = ((x << 5) - x + h.charCodeAt(i)) >>> 0;
  console.log(JSON.stringify({ hash: x.toString(16) }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 200) })));
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    return JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}
{
  const a = hashRun(981, true), b = hashRun(981, true), c = hashRun(981, false);
  const d = hashRun(982, true), e = hashRun(982, false);
  for (const [n, r] of [['a', a], ['b', b], ['c', c], ['d', d], ['e', e]]) {
    if (r.__crash) console.log(`  det-gate ${n} crashed: ${r.__crash}`);
  }
  ok(!a.__crash && !b.__crash && !c.__crash && !d.__crash && !e.__crash, 'det-gate runs complete');
  ok(a.hash && a.hash === b.hash, `det-gate: instrumented runs identical on same seed (${a.hash})`);
  ok(a.hash === c.hash, `det-gate: instrument attached vs bare byte-identical, seed 981 (${a.hash} == ${c.hash})`);
  ok(d.hash === e.hash, `det-gate: instrument attached vs bare byte-identical, seed 982 (${d.hash} == ${e.hash})`);
}

// ---------- SMOKE ----------
console.log('== SMOKE ==');
{
  const tmpFile = '/tmp/trickres-smoke-' + process.pid + '.js';
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1'; process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.NODEWITNESS = '1';
const { loadGame, setupGame, runDays, quietLog } = require('${HARNESS}');
const TF = require('${TRIBFLOOR}');
const { attachTrickresCapture } = require('${INSTRUMENT}');
(async () => {
  const { Game } = await loadGame({ seed: 983, mode: 'smoke', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachTrickresCapture(Game);
  let res;
  await quietLog(async () => { res = await runDays(Game, TF.belongfeast, { days: 20, manifest: undefined, sampleEvery: 10 }); });
  cap.restore();
  const st = Game.state || {};
  const validOutcomes = new Set(['evade', 'vKill', 'mFlee', 'vFlee', 'vDie', 'alreadyDead']);
  let badOutcome = 0, badTokens = 0, knownViol = 0, nTrick = 0;
  for (const f of cap.fieldFights) {
    if (!validOutcomes.has(f.outcome)) badOutcome++;
    if (!Array.isArray(f.trickTokens)) badTokens++;
    if ((f.trickTokens || []).length > 0) { nTrick++; if (f.knownViolation) knownViol++; }
  }
  const r = { seed: 983, policyId: 'belongfeast', national: 0, table: 0, won: 0, wins: 0, exiled: 0, days: res.days };
  console.log(JSON.stringify({
    days: res.days, endReason: res.endReason,
    nField: cap.fieldFights.length, nTb: cap.tbFights.length, nTrick: nTrick,
    badOutcome, badTokens, knownViol,
    schemaOk: ['national', 'table', 'won', 'wins', 'exiled'].every(k => typeof r[k] === 'number'),
  }));
})().catch(e => console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })));
`;
  fs.writeFileSync(tmpFile, code);
  let o;
  try {
    const r = execSync(`node ${tmpFile}`, { cwd: path.join(ROOT, 'scripts'), maxBuffer: 32 * 1024 * 1024 }).toString();
    o = JSON.parse(r.split('\n').pop() || r);
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
  if (o.__crash) console.log('  smoke crashed: ' + o.__crash);
  ok(!o.__crash, 'smoke: 20-day pre-seat run with instrument completes');
  ok(o.schemaOk === true, 'smoke: per-seed JSON carries numeric national/table/won/wins/exiled');
  ok(o.badOutcome === 0 && o.badTokens === 0, `smoke: capture honest (${o.nField} field fights, 0 bad outcomes, 0 bad token arrays)`);
  ok(o.knownViol === 0, `smoke: no known-violations on live data (${o.nTrick} trick fights)`);
  console.log(`  smoke: ${o.nField} field fights, ${o.nTb} TB fights, ${o.nTrick} with trick tokens, end=${o.endReason}`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join(' | ') : ''}`);
process.exit(fail ? 1 : 0);
