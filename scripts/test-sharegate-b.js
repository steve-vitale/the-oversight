#!/usr/bin/env node
// test-sharegate-b.js — proof for the sharegate upkeep-skip gate (arm
// sim-sharegate-b, run fleshout-loop-b-20261021T1257Z).
//
// PRE-SWEEP proof. All must pass before any pilot sims run. Writes NOTHING
// into the repo (OUT goes to os.tmpdir()).
//
// Fixtures (fake Game, real layer code — gateDecide + the second-pass
// weekly-dedupe path, the exact decision logic the sweep drives):
//   (a) TRUST-30 NEVER SKIPS: link trust 30, lean pantry, weeks 1-2 → the
//       gate COVERS both weeks (cover-fray); quiet skips = 0.
//   (b) SKIP CAP: trust 50, lean pantry, 5 eligible weeks →
//       skip,skip,cover-cap,skip,skip — max 2 consecutive quiet skips.
//   (c) BELONG TRUST-30: payTribute covered both weeks, no skips.
//   (d) BARE-PANTRY REFUSAL: engine refuses the cover (returns 0) → the
//       attempt is recorded, not claimed as kept; no crash.
// Driver checks (spawnSync, the real sweep driver):
//   ENGAGE: SHAREGATE_B=1 + SURPLUSFEED=1 on the 8802 leadfeast shape
//           (150d): the gate FIRES — covers > 0, trim still fires, every
//           quiet skip sits at trust >= 40 with streak <= 2.
//   RED:    SHAREGATE_B unset => variant policies byte-identical to the
//           base policies, control and SURPLUSFEED=1, identical seeds.
//   DET:    same seed twice in-process byte-identical, gate off AND gate on.
//
// Usage (ENV TRAP — read this header): FEASTSCALE_R13=1 SEATDRIVE=0 must be
// set explicitly, mirroring the sweep driver. The proof sets SURPLUSFEED /
// SHAREGATE_B per check below.
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-sharegate-b.js
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}

const { gateDecide, leadSecondPass, belongSecondPass, sgState, TRUST_FLOOR, MAX_QUIET_SKIPS } = require('./policies/sharegate-b');
const { gateCrossing } = require('./sharegate-metrics');

const DRIVER = path.join(__dirname, 'sweep-sharegate-b.js');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'sgproof-'));
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; failures.push(name); console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fixtures: fake Game, real layer ----------

function fakeGame({ side, week, trust, lean, refuse }) {
  const isLead = side === 'lead';
  const link = { id: 'L1', status: 'active', trust, tendedWeek: -1, tributePaidWeek: -1 };
  if (isLead) { link.primary = 'haven'; link.subordinate = 'emberhold'; }
  else { link.subordinate = 'haven'; link.primary = 'stonebridge'; link.tributeKcalPerWeek = 5000; }
  const pantry = [];
  const units = lean ? 100 : 1000; // lean: 10k kcal (below the base gates); rich: 100k
  for (let i = 0; i < units; i++) pantry.push({ kcalEach: 100, units: 1 });
  const lines = [], calls = [];
  const Game = {
    _week: () => week,
    state: { scholar: { day: week * 7 + 1 }, village: { pantry, roster: ['p1'] } },
    hierarchyState: () => [link],
    tendLink: (id) => { calls.push(['tend', id]); if (!refuse) { link.tendedWeek = week; return 1500; } return 0; },
    payTribute: (id) => { calls.push(['trib', id]); if (!refuse) { link.tributePaidWeek = week; return 5000; } return 0; },
    say: (m) => lines.push(String(m)),
    _ovName: (id) => (id === 'emberhold' ? 'Emberhold' : id === 'stonebridge' ? 'Stonebridge' : id),
    getPerson: () => ({ name: 'Mira Dawn', dead: false }),
  };
  return { Game, link, lines, calls };
}
function decisionsOf(ctx) { return ctx.sgDecisions || []; }
function actionsOf(ctx) { return decisionsOf(ctx).map(d => d.action); }

console.log(`LAYER constants: TRUST_FLOOR=${TRUST_FLOOR} MAX_QUIET_SKIPS=${MAX_QUIET_SKIPS}`);

// (a) trust-30 never skips — lead
{
  const { Game, link, lines, calls } = fakeGame({ side: 'lead', week: 1, trust: 30, lean: true });
  const ctx = {}; const state = sgState(ctx);
  const attempted = new Set();
  leadSecondPass(Game, ctx, attempted);
  // week 2, trust still 30
  Game._week = () => 2; link.tendedWeek = -1;
  leadSecondPass(Game, ctx, attempted);
  const acts = actionsOf(ctx);
  check('(a) trust-30: both weeks covered', acts.length === 2 && acts[0] === 'cover-fray' && acts[1] === 'cover-fray', JSON.stringify(acts));
  check('(a) trust-30: tendLink called twice', calls.length === 2, 'calls=' + calls.length);
  check('(a) trust-30: zero quiet skips', (ctx.sgSkipHonest || 0) === 0, 'skips=' + (ctx.sgSkipHonest || 0));
  check('(a) trust-30: voice lines present', lines.some(l => /wearing thin \(trust 30\)/.test(l)), lines.length + ' lines');
}

// (b) skip cap — 5 eligible weeks at trust 50
{
  const ctx = {};
  for (let w = 1; w <= 5; w++) {
    const f = fakeGame({ side: 'lead', week: w, trust: 50, lean: true });
    // fresh link each week, but the LAYER's streak persists in run ctx
    leadSecondPass(f.Game, ctx, new Set());
  }
  const acts = actionsOf(ctx);
  check('(b) cap: skip,skip,cover-cap,skip,skip',
    JSON.stringify(acts) === JSON.stringify(['skip', 'skip', 'cover-cap', 'skip', 'skip']),
    JSON.stringify(acts));
  let run = 0, maxRun = 0;
  for (const a of acts) { run = (a === 'skip') ? run + 1 : 0; maxRun = Math.max(maxRun, run); }
  check('(b) cap: max consecutive skips exactly 2', maxRun === 2, 'maxRun=' + maxRun);
  check('(b) cap: every skip at trust>=40', decisionsOf(ctx).every(d => d.action !== 'skip' || d.trust >= 40));
}

// (c) belong trust-30 — tribute covered, no skips
{
  const ctx = {};
  for (const w of [1, 2]) {
    const f = fakeGame({ side: 'belong', week: w, trust: 30, lean: true });
    belongSecondPass(f.Game, ctx, new Set());
    // keep a handle to calls: rebuild check via decisions
    if (w === 2) {
      check('(c) belong trust-30: two covers, no skips',
        JSON.stringify(actionsOf(ctx)) === JSON.stringify(['cover-fray', 'cover-fray']) && (ctx.sgCoverTrib || 0) === 2,
        JSON.stringify(actionsOf(ctx)) + ' coverTrib=' + (ctx.sgCoverTrib || 0));
    }
  }
}

// (d) bare-pantry refusal — attempt recorded, not claimed
{
  const { Game, lines } = fakeGame({ side: 'lead', week: 1, trust: 30, lean: true, refuse: true });
  const ctx = {};
  leadSecondPass(Game, ctx, new Set());
  const dec = decisionsOf(ctx)[0] || {};
  check('(d) refusal: action recorded as cover-fray', dec.action === 'cover-fray', JSON.stringify(dec.action));
  check('(d) refusal: kept=false, paid=0', dec.kept === false && dec.paid === 0, JSON.stringify(dec));
  check('(d) refusal: counted as refused, not covered', (ctx.sgCoverRefused || 0) === 1 && (ctx.sgCoverTend || 0) === 0);
  check('(d) refusal: no layer cover-voice when engine refused', !lines.some(l => /wearing thin/.test(l)));
}

// ---------- driver checks ----------

function runDriver(env, seeds, policy, days, side) {
  const out = path.join(TMP, `r${runDriver.n++}.json`);
  const e = Object.assign({}, process.env, env, {
    SEEDS: seeds, POLICY: policy, DAYS: String(days), OUT: out, SIDE: side,
  });
  if (env.SHAREGATE_B === null) delete e.SHAREGATE_B;
  if (env.SURPLUSFEED === null) delete e.SURPLUSFEED;
  const r = spawnSync(process.execPath, [DRIVER], { env: e, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  if (r.status !== 0) {
    console.error('driver failed', { seeds, policy, days, env });
    console.error((r.stderr || '').slice(-3000));
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(out, 'utf8'));
}
runDriver.n = 0;

function normRow(row) {
  const c = JSON.parse(JSON.stringify(row));
  delete c.end.ms;
  return c;
}
function rowsEqual(a, b) {
  return JSON.stringify(normRow(a)) === JSON.stringify(normRow(b));
}

// ENGAGE: the gate fires on the exemplar shape
console.log('ENGAGE (8802 leadfeast-sharegate, SURPLUSFEED=1 + SHAREGATE_B=1, 150d)');
{
  const res = runDriver({ SURPLUSFEED: '1', SHAREGATE_B: '1' }, '8802', 'leadfeast-sharegate', 150, 'armed');
  const row = res.rows[0];
  const sg = row.end.sg || {};
  console.log(`  sg: coverTend=${sg.coverTend} coverTrib=${sg.coverTrib} skipHonest=${sg.skipHonest} refused=${sg.coverRefused} trimKcal=${row.end.trimKcal}`);
  check('ENGAGE gate fires (covers on the 8802 shape)', (sg.coverTend || 0) > 0, 'coverTend=' + (sg.coverTend || 0));
  check('ENGAGE trim still fires (engine governor untouched)', row.end.trimKcal > 0, 'trimKcal=' + row.end.trimKcal);
  const decs = sg.decisions || [];
  check('ENGAGE every quiet skip at trust>=40', decs.every(d => d.action !== 'skip' || d.trust >= 40),
    JSON.stringify(decs.filter(d => d.action === 'skip' && d.trust < 40)));
  // INDEPENDENT gate check: rebuild the per-link week ledger from the
  // upkeep instrument (a base-pass late-week tend keeps the week — it is
  // not a skip; a refused cover is an honest engine refusal, not a skip).
  const gx = gateCrossing(row.end);
  console.log(`  gate-crossing (independent): below40=${gx.below40} run3=${gx.run3}`);
  check('ENGAGE zero gate-crossing weeks (independent ledger)', gx.total === 0,
    JSON.stringify(gx.detail.slice(0, 6)));
  check('ENGAGE gate voice lines captured', (sg.lines || []).length > 0, 'lines=' + (sg.lines || []).length);
}

// RED: SHAREGATE_B unset => variant ≡ base (pilot's exact control env:
// SURPLUSFEED=1, SHAREGATE_B unset — the only gate-off env the design uses)
console.log('RED (SHAREGATE_B unset: variant vs base, byte-identical rows)');
{
  const pairs = [
    ['leadfeast-sharegate', 'leadfeast'],
    ['belongfeast-sharegate', 'belongfeast'],
  ];
  for (const [variant, base] of pairs) {
    const env = { SHAREGATE_B: null, SURPLUSFEED: '1' };
    const rv = runDriver(env, '8801,8802', variant, 60, 'control');
    const rb = runDriver(Object.assign({}, env), '8801,8802', base, 60, 'control');
    for (let i = 0; i < 2; i++) {
      check(`RED ${variant}≡${base} control seed=${rv.rows[i].seed}`,
        rowsEqual(rv.rows[i], rb.rows[i]));
    }
  }
}

// DET: repeat in-process byte-identical, gate off and on
console.log('DET (repeat in-process)');
{
  const r1 = runDriver({ SHAREGATE_B: null, SURPLUSFEED: '1' }, '8801,8801', 'leadfeast-sharegate', 60, 'control');
  check('DET gate-off repeat byte-identical', rowsEqual(r1.rows[0], r1.rows[1]));
  const r2 = runDriver({ SHAREGATE_B: '1', SURPLUSFEED: '1' }, '8802,8802', 'belongfeast-sharegate', 60, 'armed');
  check('DET gate-on repeat byte-identical', rowsEqual(r2.rows[0], r2.rows[1]));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.error('FAILED: ' + failures.join('; ')); process.exit(1); }
console.log('PROOF GREEN — pilot sweep may proceed');
