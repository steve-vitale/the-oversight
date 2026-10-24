#!/usr/bin/env node
// test-wallseg.js — proof for the sim-wallseg DIAG arm (run
// fleshout-20261024T0215Z, axis scale-onramp). ALL GREEN required BEFORE
// the census.
//
// P1  classifier unit tests: synthetic standing trajectories for each
//     end-binding class (defer5 bar-never-met:veterans,
//     met-but-not-simultaneous, overlap-before-standing, gate-released,
//     stand-raw, plenty-cap, w3rung, unlocked) + the UNEXPLAINED trap.
// P2  stand-raw dip/links sub-classifier: dip-driven / links-driven /
//     stand-other / UNNAMED synthetic trajectories.
// P3  determinism: same seed => same classification (two 2-day sims on the
//     FULL landed substrate, in-memory, write:false; classification-
//     relevant snapshot compared deep-equal).
// P4  freshness gate: banned seeds refused, fresh band accepted; env-guard
//     refusal (LINKFORM!=2 => SWEEP STOP exit 2) via subprocess.
//
// Namespace: wallseg-*. Reuses classify() from defer5rediag-analyze.js
// (required, not copied) and subClassifyStandRaw() from wallseg-analyze.js.
'use strict';
const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

const { classify } = require(path.join(REPO, 'scripts', 'defer5rediag-analyze'));
const { subClassifyStandRaw } = require(path.join(REPO, 'scripts', 'wallseg-analyze'));

const DEM5 = { armored: 4, armed: 6, tricks: 3, veterans: 2 };
const DEM4 = { armored: 3, armed: 5, tricks: 3, veterans: 1 };

// A synthetic daily trace row. Defaults describe a healthy mid-game day;
// overrides shape the scenario.
function row(d, o) {
  return Object.assign({
    d, l2: 9, w4faced: 1, uw: 0, peak: 4,
    capped: 250, raw: 250,
    r4: { armored: 9, armed: 9, tricks: 9, veterans: 9, ready: true },
    r5: { armored: 8, armed: 9, tricks: 20, veterans: 0, ready: false },
    dip: 0, links: 0, war: 100, plenty: 50, warPts: 0, feasts: 0,
  }, o || {});
}
function cfg(trace, gv, extra) {
  return Object.assign({
    seed: 1, base: 'leadfeast',
    gateTrace: trace,
    gateVector: gv,
    demand4: DEM4, demand5: DEM5,
    defer5HeldDays: 0, defer4HeldDays: 0,
    maxWave: 4,
  }, extra || {});
}
function gvFor(binding, outcome, dist) {
  return { attr: { binding, outcome: outcome || 'held' }, dist: dist || {} };
}

let pass = 0;
function T(name, fn) {
  try { fn(); pass++; console.log(`ok - ${name}`); }
  catch (e) { console.error(`FAIL - ${name}: ${(e && e.message) || e}`); process.exitCode = 1; }
}

// ---------- P1: end-binding classifier ----------

T('P1a defer5 bar-never-met:veterans', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 1, ready: false } }));
  const c = cfg(tr, gvFor('defer5', 'held', { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 1 } }));
  const r = classify(c);
  assert.strictEqual(r.channel, 'bar-never-met:veterans', JSON.stringify(r));
  assert.strictEqual(r.bars.veterans, 'never-met');
  assert.strictEqual(r.recomputed, 'defer5');
  assert.strictEqual(r.mismatch, false);
});

T('P1b defer5 met-but-not-simultaneous', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) {
    if (d >= 50 && d <= 60) tr.push(row(d, { r5: { armored: 2, armed: 9, tricks: 20, veterans: 2, ready: false } }));
    else tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 0, ready: false } }));
  }
  const c = cfg(tr, gvFor('defer5', 'held', { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 2 } }));
  const r = classify(c);
  assert.strictEqual(r.channel, 'met-but-not-simultaneous', JSON.stringify(r));
  assert.strictEqual(r.overlapDays, 0);
});

T('P1c defer5 overlap-before-standing', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) {
    if (d === 80) tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 2, ready: false }, capped: 150, raw: 150 }));
    else tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 0, ready: false } }));
  }
  const c = cfg(tr, gvFor('defer5', 'held', { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 2 } }));
  const r = classify(c);
  assert.strictEqual(r.channel, 'overlap-before-standing', JSON.stringify(r));
  assert.strictEqual(r.overlapDays, 1);
});

T('P1d gate-released binding-moved-to:stand-raw', () => {
  const tr = [];
  for (let d = 1; d <= 179; d++) tr.push(row(d));
  tr.push(row(180, { raw: 150, capped: 150 }));
  const c = cfg(tr, gvFor('stand-raw', 'held', {}), { defer5HeldDays: 30, firstDefer5Day: 60 });
  const r = classify(c);
  assert.strictEqual(r.channel, 'gate-released', JSON.stringify(r));
  assert.strictEqual(r.sub, 'binding-moved-to:stand-raw');
  assert.strictEqual(r.recomputed, 'stand-raw');
});

T('P1e stand-raw never-bound', () => {
  const tr = [];
  for (let d = 1; d <= 179; d++) tr.push(row(d));
  tr.push(row(180, { raw: 150, capped: 150 }));
  const c = cfg(tr, gvFor('stand-raw', 'held', {}));
  const r = classify(c);
  assert.strictEqual(r.channel, 'never-bound', JSON.stringify(r));
  assert.strictEqual(r.recomputed, 'stand-raw');
});

T('P1f plenty-cap', () => {
  const tr = [];
  for (let d = 1; d <= 179; d++) tr.push(row(d));
  tr.push(row(180, { raw: 250, capped: 150 }));
  const c = cfg(tr, gvFor('plenty-cap', 'held', {}));
  const r = classify(c);
  assert.strictEqual(r.recomputed, 'plenty-cap', JSON.stringify(r));
  assert.strictEqual(r.channel, 'never-bound');
});

T('P1g w3rung', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) tr.push(row(d, { l2: 2 }));
  const c = cfg(tr, gvFor('w3rung', 'held', {}));
  const r = classify(c);
  assert.strictEqual(r.recomputed, 'w3rung', JSON.stringify(r));
});

T('P1h unlocked door-opened', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) tr.push(row(d, { uw: d >= 103 ? 5 : 0, peak: d >= 103 ? 5 : 4 }));
  const c = cfg(tr, gvFor(null, 'unlocked', {}), { defer5HeldDays: 40, firstDefer5Day: 60, maxWave: 5 });
  const r = classify(c);
  assert.strictEqual(r.channel, 'gate-released', JSON.stringify(r));
  assert.strictEqual(r.sub, 'door-opened');
  assert.strictEqual(r.recomputed, 'unlocked');
  assert.strictEqual(r.mismatch, false);
});

T('P1i UNEXPLAINED trap: binding defer5 with standing-live coincidence', () => {
  const tr = [];
  for (let d = 1; d <= 180; d++) {
    if (d === 80) tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 2, ready: false }, capped: 250, raw: 250 }));
    else tr.push(row(d, { r5: { armored: 8, armed: 9, tricks: 20, veterans: 0, ready: false } }));
  }
  const c = cfg(tr, gvFor('defer5', 'held', { defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 2 } }));
  const r = classify(c);
  assert.strictEqual(r.channel, 'UNEXPLAINED', JSON.stringify(r));
});

// ---------- P2: stand-raw dip/links sub-classifier ----------

function dipRow(d, dip, links, raw) { return { d, dip, links, raw }; }

T('P2a dip-driven: built 136, lost it all post-formation', () => {
  const tr = [dipRow(1, 0, 0, 120), dipRow(50, 136, 4, 256), dipRow(100, 136, 4, 256), dipRow(101, 0, 0, 120), dipRow(180, 0, 0, 120)];
  const r = subClassifyStandRaw({ gateTrace: tr });
  assert.strictEqual(r.sub, 'dip-driven', JSON.stringify(r));
  assert.strictEqual(r.dipPeak, 136);
  assert.strictEqual(r.dissolutionMag, 136);
  assert.strictEqual(r.nDissEvents, 1);
});

T('P2b dip-driven: gradual erosion still counts (no single -102 day)', () => {
  const tr = [dipRow(1, 0, 0, 120), dipRow(50, 136, 4, 256), dipRow(100, 102, 3, 222), dipRow(150, 34, 1, 154), dipRow(180, 0, 0, 120)];
  const r = subClassifyStandRaw({ gateTrace: tr });
  assert.strictEqual(r.sub, 'dip-driven', JSON.stringify(r));
  assert.strictEqual(r.dissolutionMag, 136);
  assert.strictEqual(r.nDissEvents, 0);
});

T('P2c links-driven: dip+links zero all run', () => {
  const tr = [dipRow(1, 0, 0, 90), dipRow(90, 0, 0, 90), dipRow(180, 0, 0, 90)];
  const r = subClassifyStandRaw({ gateTrace: tr });
  assert.strictEqual(r.sub, 'links-driven', JSON.stringify(r));
  assert.strictEqual(r.dipPeak, 0);
});

T('P2d links-driven: one thin link, never a layer', () => {
  const tr = [dipRow(1, 0, 0, 90), dipRow(90, 34, 1, 124), dipRow(180, 0, 0, 90)];
  const r = subClassifyStandRaw({ gateTrace: tr });
  assert.strictEqual(r.sub, 'links-driven', JSON.stringify(r));
});

T('P2e stand-other: diplomacy held, raw short on war/plenty', () => {
  const tr = [dipRow(1, 68, 2, 188), dipRow(90, 68, 2, 188), dipRow(180, 68, 2, 188)];
  const r = subClassifyStandRaw({ gateTrace: tr });
  assert.strictEqual(r.sub, 'stand-other', JSON.stringify(r));
  assert.strictEqual(r.dissolutionMag, 0);
});

T('P2f UNNAMED: empty trace', () => {
  const r = subClassifyStandRaw({ gateTrace: [] });
  assert.strictEqual(r.sub, 'UNNAMED');
});

// ---------- P3: determinism (same seed => same classification) ----------
// (async — runs in the wrapper at the bottom; T() cannot await.)

// ---------- P4: freshness gate + env guard ----------

T('P4a freshnessOK: fresh band accepted', () => {
  const sweep = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
  for (const s of [70201, 70206, 70212]) assert.strictEqual(sweep.freshnessOK(s), true, `seed ${s} should be fresh`);
});

T('P4b freshnessOK: used blocks refused', () => {
  const sweep = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
  for (const s of [70111, 70122, 69001, 69012, 68901, 92801, 92816, 68501, 68408, 66501]) {
    assert.strictEqual(sweep.freshnessOK(s), false, `seed ${s} should be banned`);
  }
});

T('P4c env guard: LINKFORM!=2 refuses with SWEEP STOP', () => {
  const env = Object.assign({}, process.env, { LINKFORM: '1' });
  let failed = false;
  try {
    execFileSync(process.execPath, ['-e', `require(${JSON.stringify(path.join(REPO, 'scripts', 'wallseg-sweep.js'))})`], { env, stdio: 'pipe' });
  } catch (e) { failed = (e.status === 2); }
  assert.strictEqual(failed, true, 'LINKFORM=1 must exit 2');
});

T('P4d env guard: missing TRUSTBUFFER refuses', () => {
  const env = Object.assign({}, process.env);
  delete env.TRUSTBUFFER;
  let failed = false;
  try {
    execFileSync(process.execPath, ['-e', `require(${JSON.stringify(path.join(REPO, 'scripts', 'wallseg-sweep.js'))})`], { env, stdio: 'pipe' });
  } catch (e) { failed = (e.status === 2); }
  assert.strictEqual(failed, true, 'missing TRUSTBUFFER must exit 2');
});

// P3 runs here (async; the harness path needs awaiting).
(async () => {
  try {
    const sweep = require(path.join(REPO, 'scripts', 'wallseg-sweep'));
    async function snap() {
      const out = await sweep.oneRun(70301, 'leadfeast', { write: false, days: 2 });
      const tr = (out.gateTrace || []).map(t => [t.d | 0, t.raw | 0, t.dip | 0, t.links | 0, (t.r5 || {}).veterans | 0]);
      return {
        binding: (out.gateVector && out.gateVector.attr && out.gateVector.attr.binding) || null,
        nTrace: tr.length, trace: tr,
        gvDip: (out.gateVector || {}).dip | 0,
        gvLinks: (out.gateVector || {}).links | 0,
        gameDays: out.gameDays,
      };
    }
    const a = await snap();
    const b = await snap();
    assert.deepStrictEqual(a, b, 'same seed must classify identically');
    pass++;
    console.log('ok - P3 determinism (async rerun): two 2-day sims identical');
  } catch (e) {
    console.error(`FAIL - P3 determinism (async rerun): ${(e && e.message) || e}`);
    process.exitCode = 1;
  }
  console.log(`\ntest-wallseg: ${pass} passed${process.exitCode ? ' (WITH FAILURES)' : ''}`);
})();
