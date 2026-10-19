#!/usr/bin/env node
// test-seasonblock-20261019.js — proof for the sim-seasonblock instrument
// (flesh-out loop arm sim-seasonblock, run fleshout-20261019T2015Z).
//
// Proves:
//   1. The analyzer's blocker naming measures what it claims (fixtures):
//      dipFailLeg names the failing leg per engine leg order; nameReset
//      classifies the age-reset cause from breakLink's day-exact history
//      note; stallVerdict names the blocker on synthetic bond timelines.
//      RED=1 runs one fixture against a deliberately WRONG expectation to
//      show the test actually discriminates (RED-verified).
//   2. The bond-census extraction reads what it claims: a fixture fake
//      Game with links of known age/trust/fires yields the expected
//      census rows (age, seasoned, rplus, dip, fires).
//   3. The DET gate: instrument-on vs instrument-off byte-identical
//      trajectories (mirrors the feastgap det-gate pattern: bare x2 +
//      census x2 on 2 seeds x 2 policies x 60d via the probe's DET mode).
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const A = require('./analyze-seasonblock-20261019');
const P = require('./probe-seasonblock-20261019');

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; }
  else { fail++; console.log(`  FAIL ${name}: got ${g}, want ${w}`); }
}
function ok(name, cond) {
  if (cond) pass++; else { fail++; console.log(`  FAIL ${name}`); }
}

const RED = process.env.RED === '1';

// --- 1a. dipFailLeg fixtures: engine leg order (age -> trust -> arrears -> rplus) ---
const B = (o) => Object.assign({ id: 'l1', st: 'active', dip: 0, age: 40, trust: 80, arrears: 0, rplus: true, fires: 5 }, o);
eq('leg age<30', A.dipFailLeg(B({ age: 12 })), 'age<30');
eq('leg trust<40', A.dipFailLeg(B({ trust: 30 })), 'trust<40');
eq('leg arrears', A.dipFailLeg(B({ arrears: 5000 })), 'arrears');
eq('leg polity<4fires', A.dipFailLeg(B({ rplus: false, fires: 2 })), 'polity<4fires');
eq('leg polity<4fires even with trust 90 (trust is not the blocker)', A.dipFailLeg(B({ rplus: false, fires: 2, trust: 90 })), 'polity<4fires');
eq('leg good-standing (rplus false, fires>=4)', A.dipFailLeg(B({ rplus: false, fires: 4 })), 'good-standing');
eq('leg granted', A.dipFailLeg(B({ dip: 1 })), 'granted');
eq('leg order: age beats trust', A.dipFailLeg(B({ age: 10, trust: 20 })), 'age<30');
eq('leg order: trust beats fires', A.dipFailLeg(B({ trust: 20, rplus: false, fires: 1 })), 'trust<40');

// --- 1b. nameReset fixtures: breakLink's history note names the cause ---
eq('reset walked -> v3 re-court', A.nameReset('Link broken (walked).'), 'age-reset by v3 re-court');
eq('reset succession -> succession', A.nameReset('Link broken (succession).'), 'age-reset by succession');
eq('reset revolt -> other', A.nameReset('Link broken (revolt).'), 'age-reset by other (Link broken (revolt).)');

// --- 1c. stallVerdict on synthetic bond timelines ---
function synthRun(links) {
  // links: [{prim, fday, brokenNote, brokenDay, ageDays:[{day,trust,arrears,fires}], succDays:[days], vid:'v1'}]
  const bond = [];
  const linkDump = [];
  for (const L of links) {
    const rows = L.ageDays.map((a, i) => ({
      id: 'link_' + L.prim, day: a.day, st: 'active', prim: L.prim, sub: 'haven', kind: null,
      trust: a.trust, age: a.day - L.fday, fday: L.fday, arrears: a.arrears, fires: a.fires,
      seasoned: (a.day - L.fday) >= 30 && a.trust >= 40,
      rplus: a.rplus, dip: ((a.day - L.fday) >= 30 && a.trust >= 40 && a.rplus) ? 1 : 0,
      vid: 'v1',
    }));
    for (const r of rows) {
      let dayRec = bond.find(b => b.d === r.day);
      if (!dayRec) { dayRec = { d: r.day, links: [] }; bond.push(dayRec); }
      dayRec.links.push(r);
    }
    linkDump.push({
      id: 'link_' + L.prim, st: L.brokenNote ? 'broken' : 'active', prim: L.prim, sub: 'haven', kind: null,
      fday: L.fday, endTrust: L.ageDays.length ? L.ageDays[L.ageDays.length - 1].trust : 0,
      history: [{ day: L.fday, kind: 'formed', note: 'Haven joined X as subordinate.' }].concat(
        L.brokenNote ? [{ day: L.brokenDay, kind: 'broken', note: L.brokenNote }] : []),
    });
  }
  return { bond, linkDump, beats: [], successionDays: [], gameDays: 180, endReason: 'survived' };
}
function agedDays(n, o) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(Object.assign({ day: 25 + i, trust: 85, arrears: 0, fires: 2, rplus: false }, o));
  return out;
}
// Fixture A: bond seasons to 40d at trust 90, fires never reaches 4 -> polity<4fires.
{
  const run = synthRun([{ prim: 'thornfield', fday: 25, ageDays: agedDays(40) }]);
  const v = A.stallVerdict(run);
  eq('verdict polity<4fires', v.bondBlockers[0].blocker, RED ? 'age-reset by succession' : 'polity<4fires');
  eq('verdict aged-day leg share names polity<4fires', Object.keys(v.bondBlockers[0].legShare || {}), ['polity<4fires']);
  eq('verdict unexplainedDays 0', v.unexplainedDays, 0);
}
// Fixture B: bond walked at d45 (age 25, before the age bar) by the
// consolidator, re-courted d48, re-court never seasons -> v3 re-court.
{
  const run = synthRun([
    { prim: 'oldhead', fday: 20, brokenNote: 'Link broken (walked).', brokenDay: 45, ageDays: agedDays(20).slice(0, 20) },
    { prim: 'newhead', fday: 48, ageDays: agedDays(15).map(a => Object.assign({}, a, { day: a.day + 28 })) },
  ]);
  const v = A.stallVerdict(run);
  eq('verdict v3 re-court', v.bondBlockers[0].blocker, 'age-reset by v3 re-court');
  ok('re-court detected within 14d', (v.bondBlockers[0].recourt || {}).prim === 'newhead');
  eq('verdict re-court product named', v.bondBlockers[1].blocker,
    'age-reset by v3 re-court (re-court product of the d45 walk; reached age 19 before death)');
}
// Fixture C: bond broken by the succession neglect-snap at d45 (age 25),
// re-courted d52 -> succession.
{
  const run = synthRun([
    { prim: 'oldhead', fday: 20, brokenNote: 'Link broken (succession).', brokenDay: 45, ageDays: agedDays(20).slice(0, 20) },
    { prim: 'newhead', fday: 52, ageDays: agedDays(15).map(a => Object.assign({}, a, { day: a.day + 32 })) },
  ]);
  const v = A.stallVerdict(run);
  eq('verdict succession', v.bondBlockers[0].blocker, 'age-reset by succession');
}
// Fixture D: no bond ever formed -> no-bond-formed (honest, not a blocker name).
{
  const v = A.stallVerdict(synthRun([]));
  eq('verdict no bond', v.blocker, 'no-bond-formed');
}
// Fixture E: bond seasons, grants dip d55-d62 (8d), then loses it to
// arrears d63-d74 (12d) -> the loss leg is named alongside the grant (the
// dip-HOLDING problem, outside the pre-registered set, flagged honestly).
{
  const days = agedDays(50).map((a, i) => Object.assign({}, a, {
    rplus: i < 38, arrears: i < 38 ? 0 : 11250,
  }));
  const run = synthRun([{ prim: 'thornfield', fday: 25, ageDays: days }]);
  const v = A.stallVerdict(run);
  const b = v.bondBlockers[0];
  eq('verdict dip granted day', b.dipGrantedDay, 55);
  eq('verdict dip held days', b.dipDays, 8);
  ok('verdict dipLost names the loss leg', !!(b.dipLost && b.dipLost.includes('arrears')));
  eq('verdict blocker is the grant-then-loss', b.blocker, 'dip granted d55, held 8d, lost to arrears');
}
// Fixture F: granted dip, lost it, then broken by succession -> the break
// (in the pre-registered set) is named with the dip history attached.
{
  const days = agedDays(50).map((a, i) => Object.assign({}, a, {
    day: a.day, rplus: i < 38, arrears: i < 38 ? 0 : 11250,
  }));
  const run = synthRun([
    { prim: 'thornfield', fday: 25, brokenNote: 'Link broken (succession).', brokenDay: 80, ageDays: days },
  ]);
  const v = A.stallVerdict(run);
  const b = v.bondBlockers[0];
  eq('verdict grant-then-loss ended by succession', b.blocker,
    'dip granted d55, held 8d, lost to arrears; ended d80 by age-reset by succession');
}

// --- 2. bondCensus reads what it claims (fixture fake Game) ---
{
  const fakeG = {
    state: { scholar: { day: 70 } },
    villagerId: 'vil_7',
    hierarchyState: () => ([
      { id: 'l_up', status: 'active', primary: 'thornfield', subordinate: 'haven', trust: 90, day: 25, arrears: 0 },
      { id: 'l_old', status: 'broken', primary: 'emberhold', subordinate: 'haven', trust: 10, day: 10, arrears: 0 },
    ]),
    _linkSeasoned: (l) => ((70 - (l.day || 0)) >= 30 && (l.trust || 0) >= 40),
    _linkRegionalPlus: (l) => (l.primary === 'thornfield' ? false : true),
    foreignPolities: () => ([{ primary: 'thornfield', subs: ['a'] }]),
  };
  const bc = P.bondCensus(fakeG);
  eq('census day', bc.d, 70);
  const up = bc.links.find(l => l.id === 'l_up');
  eq('census age', up.age, 45);
  eq('census trust', up.trust, 90);
  eq('census seasoned', up.seasoned, true);
  eq('census rplus', up.rplus, false);
  eq('census dip', up.dip, 0);
  eq('census fires (2+subs)', up.fires, 3);
  const old = bc.links.find(l => l.id === 'l_old');
  eq('census broken link kept', old.st, 'broken');
  ok('census vid recorded', up.vid === 'vil_7');
}

// --- 4. vendored installDeathCapture is verbatim (parity guard: it must
// stay IDENTICAL BY CONSTRUCTION to the feastgap probe's, which we did not edit)
{
  const fs = require('fs');
  const grab = (src) => {
    const i = src.indexOf('function installDeathCapture(Game, C, monsterNames)');
    if (i < 0) return null;
    const tail = src.slice(i);
    const end = tail.indexOf('\n}\n');
    return end < 0 ? null : tail.slice(0, end + 3);
  };
  const mine = grab(fs.readFileSync(path.join(__dirname, 'probe-seasonblock-20261019.js'), 'utf8'));
  const fgp = grab(fs.readFileSync(path.join(__dirname, 'probe-feastgap-20261019.js'), 'utf8'));
  ok('vendored installDeathCapture found in both', !!(mine && fgp));
  eq('vendored installDeathCapture verbatim', mine, fgp);
}

// --- 3. DET gate (mirror the feastgap pattern, through the probe's DET mode) ---
if (!process.env.SKIP_DET) {
  console.log('  DET: instrument-on vs instrument-off byte-identical (2 seeds x 2 policies x 60d)...');
  const env = 'FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 DET=1';
  try {
    const out = execSync(env + ' node ' + path.join(__dirname, 'probe-seasonblock-20261019.js'), { timeout: 900000, maxBuffer: 64 * 1024 * 1024 }).toString();
    const lines = out.trim().split('\n');
    const allPass = lines.filter(l => l.includes('DET s')).every(l => l.includes('PASS'));
    const hasAll = lines.filter(l => l.includes('DET s')).length === 4;
    ok('DET 4/4 byte-identical', allPass && hasAll);
    console.log(out.trim().split('\n').filter(l => l.includes('DET')).map(l => '  ' + l.trim()).join('\n'));
  } catch (e) {
    fail++; console.log('  FAIL DET gate crashed: ' + String((e && e.message) || e).slice(0, 300));
  }
}

console.log(`\nseasonblock-proof: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
