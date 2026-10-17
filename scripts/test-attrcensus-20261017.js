#!/usr/bin/env node
// test-attrcensus-20261017.js — proof record for the sim-attrcensus
// diagnostic (flesh-out loop, axis scale-onramp, run fleshout-20261017T1102Z).
// Read-only instrument: ZERO src/js, ZERO scripts/policies changes.
//
// Sections:
//   PURE   — classifyExtended / classifyExistingRow on synthetic fixtures:
//            every taxonomy branch (a1, a2-lost, a2-fled, b1, b2, b3, c2,
//            instrument-error, not-in-universe) plus the reduced existing-row
//            classifier (lost->b1+pyrrhicFlag, routed->b2, won/fled->b3).
//   DET    — analyzer determinism: the fixture set and the existing 43 rows
//            classify byte-identically across two runs.
//   SMOKE  — 20d pre-seat instrumented run (child process) completes;
//            output schema valid; tbfight interception attached.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it); child processes for process isolation (never two harnesses in
// one process); no Game.save stub; no hardcoded absolute paths (ROOT
// derived from __dirname); no copied eval boilerplate (all loads via
// sim-harness.js).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const HARNESS = path.join(ROOT, 'scripts', 'sim-harness.js');
const TRIBFLOOR = path.join(ROOT, 'scripts', 'policies', 'tribfloor.js');
const INSTRUMENT = path.join(ROOT, 'scripts', 'attrcensus-instrument-20261017.js');
const TFUN = path.join(ROOT, 'scripts', 'trickfunnel-instrument-20261016.js');
const CLASSIFY = path.join(ROOT, 'scripts', 'attrcensus-classify-20261017.js');
const EXISTDIR = path.join(ROOT, 'evidence', '2026-10-16', 'perseed-trickfunnel');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

const { classifyExtended, classifyExistingRow } = require(CLASSIFY);

// ---------- PURE ----------
console.log('== PURE ==');
function fx(o) {
  return Object.assign({ mid: 'hushwolf', kind: 'strike_lead', day: 50, result: 'lost',
    pAlive: false, nPerfs: 1, midDead: 0, midAlive: 1, wklSame: [], killAttributed: false }, o);
}
const cases = [
  // a1: won/routed, monster died, perfs logged, no tagged entry.
  ['a1 won', fx({ result: 'won', pAlive: true, midDead: 1, midAlive: 0 }), 'a1'],
  ['a1 routed', fx({ result: 'routed', pAlive: true, midDead: 2, midAlive: 1 }), 'a1'],
  // a2: monster died on lost/fled (ledger forfeited).
  ['a2 lost pyrrhic', fx({ result: 'lost', midDead: 1, midAlive: 0 }), 'a2'],
  ['a2 fled', fx({ result: 'fled', pAlive: true, midDead: 1 }), 'a2'],
  // b1: scholar died, monster alive.
  ['b1', fx({ result: 'lost', midDead: 0, midAlive: 2 }), 'b1'],
  // b2: routed, none died.
  ['b2', fx({ result: 'routed', pAlive: true, midDead: 0, midAlive: 3 }), 'b2'],
  // b3: won without killing this mid; fled with monster alive.
  ['b3 won-other-mid', fx({ result: 'won', pAlive: true, midDead: 0, midAlive: 1 }), 'b3'],
  ['b3 fled', fx({ result: 'fled', pAlive: true, midDead: 0, midAlive: 1 }), 'b3'],
  // c2: untagged kill in window from another encounter.
  ['c2', fx({ result: 'lost', midDead: 0, midAlive: 0, wklSame: [{ d: 51, trick: null, by: 'x', via: 'agency' }] }), 'c2'],
  // instrument-error: tagged entry in window but join says 0.
  ['instrument-error', fx({ wklSame: [{ d: 50, trick: 'strike_lead', by: 'p', via: 'player' }] }), 'instrument-error'],
  // not-in-universe: no perfs.
  ['not-in-universe', fx({ nPerfs: 0 }), 'not-in-universe'],
];
for (const [name, f, want] of cases) {
  const c = classifyExtended(f);
  ok(c.cls === want, `classifyExtended ${name} -> ${want} (got ${c.cls})`);
}
// a1 with an untagged entry present is still a1 (ledger should have tagged it).
ok(classifyExtended(fx({ result: 'won', pAlive: true, midDead: 1, wklSame: [{ d: 50, trick: null }] })).cls === 'a1', 'a1 beats untagged-entry');
// tagged + killAttributed=true is not in the unattributed universe for this classifier's error branch.
ok(classifyExtended(fx({ killAttributed: true, wklSame: [{ d: 50, trick: 'x' }], midDead: 0 })).cls === 'b1', 'tagged+attributed skips error branch (result lost -> b1)');

// classifyExistingRow (reduced; no mortality data).
const er = (o) => classifyExistingRow(Object.assign({ performed: 1, kill_attributed: 0, result: 'lost', survived: 0, dismissed: 0 }, o));
ok(er({}).cls === 'b1' && er({}).pyrrhicFlag === true, 'existing lost -> b1 + pyrrhicFlag');
ok(er({ result: 'routed', dismissed: 1 }).cls === 'b2', 'existing routed -> b2');
ok(er({ result: 'fled' }).cls === 'b3', 'existing fled -> b3');
ok(er({ result: 'won' }).cls === 'b3', 'existing won -> b3');
ok(classifyExistingRow({ performed: 1, kill_attributed: 1 }).cls === 'not-in-universe', 'existing attributed -> not-in-universe');
ok(classifyExistingRow({ performed: 0, kill_attributed: 0 }).cls === 'not-in-universe', 'existing unperformed -> not-in-universe');

// ---------- DET ----------
console.log('== DET ==');
const detInput = cases.map(c => c[1]);
const run1 = JSON.stringify(detInput.map(classifyExtended));
const run2 = JSON.stringify(detInput.map(classifyExtended));
ok(run1 === run2, 'fixture set byte-identical across runs');
// The existing 43 rows classify byte-identically across runs.
const rows43 = [];
for (const fn of fs.readdirSync(EXISTDIR).filter(f => f.endsWith('.json'))) {
  const d = JSON.parse(fs.readFileSync(path.join(EXISTDIR, fn), 'utf8'));
  for (const r of (d.rows || [])) {
    if (r.performed && !r.kill_attributed) rows43.push(r);
  }
}
ok(rows43.length === 43, `existing universe is 43 rows (got ${rows43.length})`);
const e1 = JSON.stringify(rows43.map(classifyExistingRow));
const e2 = JSON.stringify(rows43.map(classifyExistingRow));
ok(e1 === e2, 'existing 43 byte-identical across runs');
const eclasses = {};
for (const r of rows43) { const c = classifyExistingRow(r).cls; eclasses[c] = (eclasses[c] || 0) + 1; }
ok(eclasses.b1 === 27 && eclasses.b2 === 16, `existing 43 -> b1=27 b2=16 (got ${JSON.stringify(eclasses)})`);
ok(rows43.every(r => { const c = classifyExistingRow(r); return (!!c.pyrrhicFlag) === (c.cls === 'b1'); }), 'pyrrhicFlag exactly on b1 rows');

// ---------- SMOKE ----------
console.log('== SMOKE ==');
try {
  // Child script via temp file (established gameEval pattern — avoids
  // shell-quoting of embedded paths through node -e).
  const tmpFile = '/tmp/attrcensus-smoke-' + process.pid + '.js';
  const code = `
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1'; process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require(${JSON.stringify(HARNESS)});
const TF = require(${JSON.stringify(TRIBFLOOR)});
const TFUN = require(${JSON.stringify(TFUN)});
const { attachAttrcensusCapture } = require(${JSON.stringify(INSTRUMENT)});
(async () => {
  const { Game } = await loadGame({ seed: 1809, mode: 'attrcensus-smoke', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachAttrcensusCapture(Game, TFUN);
  if (!cap.tbfightIntercepted) { console.log(JSON.stringify({ ok: false, why: 'intercept' })); process.exit(0); }
  let result;
  await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: 20, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();
  const t0 = cap.tbFights[0];
  const schemaOk = Array.isArray(cap.tbFights) && (!t0 || (
    typeof t0.seq === 'number' && typeof t0.day === 'number' &&
    Array.isArray(t0.mids) && typeof t0.perfs === 'object' &&
    typeof t0.mortality === 'object' && 'pAlive' in t0));
  let mortOk = true;
  for (const t of cap.tbFights) for (const mid of Object.keys(t.mortality || {})) {
    const m = t.mortality[mid];
    if (typeof m.dead !== 'number' || typeof m.alive !== 'number') mortOk = false;
  }
  console.log(JSON.stringify({ ok: schemaOk && mortOk, tbFights: cap.tbFights.length, days: result.days }));
  process.exit(0);
})().catch(e => { console.log(JSON.stringify({ ok: false, why: String(e && e.message || e).slice(0, 200) })); process.exit(0); });
`;
  fs.writeFileSync(tmpFile, code);
  let out;
  try {
    out = execSync(`node ${tmpFile}`, { encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024, cwd: ROOT }).toString();
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
  const line = out.trim().split('\n').filter(l => l.startsWith('{')).pop();
  const r = JSON.parse(line);
  ok(r.ok === true, 'SMOKE schema-clean 20d run (' + JSON.stringify(r) + ')');
} catch (e) {
  ok(false, 'SMOKE crashed: ' + String(e && e.message || e).slice(0, 200));
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ' — ' + fails.join('; ') : ''}.`);
process.exit(fail ? 1 : 0);
