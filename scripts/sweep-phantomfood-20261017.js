#!/usr/bin/env node
// scripts/sweep-phantomfood-20261017.js — remainder-carry fix sweep
// (sim-phantomfood-b, 2026-10-17, food-economy axis).
//
// WHY: stockSurplus's Math.round(give/200) mints systematic phantom food
// (~+72 kcal/call when give in [100,200); +6,731 over 93 calls/12d on seed
// 4301) and silently evaporates crumbs <100. The fix (game.js): the village
// carries its sub-unit surplus remainder (v._surplusRemainder) across
// shares; whole 200-kcal units emit, the fraction waits.
//
// 8 FRESH seeds 4311-4318 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds, own paired control in the
// SAME sweep. control = PHANTOMFOOD_FIX=0 (legacy path); armed = fix on.
// The det-gate script (scripts/det-gate-phantomfood-20261017.js) proves the
// legacy path is byte-identical to pristine, so the in-sweep control is a
// valid pristine stand-in.
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat courtship, food-economy). Banned-seed check: SWEEP STOPS on hit.
//
// Pre-registration (binding, MEASUREMENT.md §§9-12, 14 — see
// evidence/2026-10-17/sim-phantomfood-b.md):
//   PRIMARY: systematic phantom eliminated. stockSurplus wrapped
//     (fixture-level) to measure sum(units*200 - give) per run.
//     GO: |total phantom| <= 200 kcal on every armed run (vs control's
//     systematic positive, expect ~+5-7k/run). Judge against this header.
//   GUARDRAILS (all must hold): national >= control-2; median survival
//     within ±10d; starvation <= control+2; no new death mode; no crash.
//   DET-GATE: gate-off trajectories byte-identical to pristine on 4 seeds
//     (proves the fix is the only delta). Gate-on WILL differ — honest.
//   CONSERVATION: S0+in-out-rot=end must hold; any residual must be EXACTLY
//     the final carried remainder (explained, < 200 kcal) on armed runs,
//     exactly 0 on control.
//   SMOKE green before sweep spend. The 32-run sweep IS the pilot (8 seeds);
//     no confirm unless GO with a clean mechanism.
//   SENSE: 1-2 transcripts around surplus-sharing beats; fix must be
//     voice-invisible.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-phantomfood-20261017.js
// Targeted: SEEDS="4311,4312" ONLY="leadfeast" SIDES="armed" node ...
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
const WR = require('./wasterate-instrument-20261017');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

// ---- banned-seed check (the coordinator's list; sweep stops on any hit) ----
const BANNED = new Set();
for (const spec of ['982-989', '3101-3108', '3301-3308', '3201-3208',
    '931-938', '111-888', '11-88', '1201-1208', '991-998', '4201-4208',
    '5101-5108', '201-208', '1701-1708']) {
  const [a, b] = spec.split('-').map(Number);
  for (let s = a; s <= b; s++) BANNED.add(s);
}
for (const spec of ['171,282,393,504,615,726,837,948', '121,232,343,454,565,676,787,898',
    '131,242,353,464,575,686,797,908', '151,262,373,484,595,706,817,928',
    '163,274,385,496,607,718,829,940', '205,246,321,412,523,634,745,856',
    '307,418,529,640,751,862,973,84', '917,928,939,104,215,326,437,548',
    '141,252,363,474', '101,202,303,404,606,707,808,909',
    '137,248,359,470,581,692,803,914']) {
  for (const s of spec.split(',').map(Number)) BANNED.add(s);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4311, 4312, 4313, 4314, 4315, 4316, 4317, 4318]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
const POLICIES = ['leadfeast', 'belongfeast'];
const SIDES = ['control', 'armed'];
const DATE = '2026-10-17';
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-phantomfood');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'phantomfood-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Surplus-sharing beats: say-lines around food sharing / village meals.
// The fix must be voice-invisible — these are read for the SENSE section.
const BEAT_RE = /surplus|share|shares|shared|pantry|meal|feast|eats with|ate with|dinner|breakfast/i;
const BEAT_CAP = 60;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

// ---- phantom instrument: wrap stockSurplus, measure sum(deposited - give) ----
function foragedKcal(v) {
  try {
    return ((v || {}).pantry || []).reduce((t, i) =>
      t + ((i && i.name === 'Foraged food' && (i.kcalEach || 0) === 200) ? (i.units || 0) * 200 : 0), 0);
  } catch (e) { return 0; }
}
function attachPhantom(Game, t) {
  t.phCalls = 0; t.phGive = 0; t.phDeposited = 0; t.phWrapFailed = false;
  t.phBand = { lt100: { n: 0, phantom: 0 }, b100_200: { n: 0, phantom: 0 }, ge200: { n: 0, phantom: 0 } };
  t.phCapAdj = 0; // calls where the pantry sat within 400 kcal of the cap
  const orig = Game.stockSurplus;
  if (typeof orig !== 'function') { t.phWrapFailed = true; return; }
  Game.stockSurplus = function (v, give) {
    const before = foragedKcal(v);
    let roomBefore = 1e15;
    try { roomBefore = Game.pantryCapKcal() - Game.pantryKcal(); } catch (e) {}
    const r = orig.apply(this, [v, give]);
    const after = foragedKcal(v);
    const dep = after - before;
    const g = Number(give) || 0;
    t.phCalls++; t.phGive += g; t.phDeposited += dep;
    const ph = dep - g;
    if (g < 100) { t.phBand.lt100.n++; t.phBand.lt100.phantom += ph; }
    else if (g < 200) { t.phBand.b100_200.n++; t.phBand.b100_200.phantom += ph; }
    else { t.phBand.ge200.n++; t.phBand.ge200.phantom += ph; }
    if (roomBefore < 400) t.phCapAdj++;
    return r;
  };
}

function alivePop(Game) {
  try {
    const v = Game.state.village || {};
    const health = v.health || {};
    let n = 0;
    for (const id of (v.roster || [])) {
      const h = health[id];
      if ((h == null ? 100 : h) > 0) n++;
    }
    return n;
  } catch (e) { return 0; }
}
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    for (const side of SIDES) {
      process.env.PHANTOMFOOD_FIX = (side === 'control') ? '0' : '1';
      const { Game } = await loadGame({ seed: SEEDS[0], mode: `phantomfood-smoke-${policyId}-${side}`, fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const t = {};
      WR.attachWasteRate(Game, t);
      WR.snapshotStart(Game, t);
      attachPhantom(Game, t);
      const base = policyFor(policyId);
      let r = null;
      await quietLog(async () => { r = await runDays(Game, Object.assign({}, base), { days: 15, sampleEvery: 30 }); });
      check(`${policyId}/${side}: phantom instrument live`, t.phCalls > 0 && !t.phWrapFailed,
        `calls=${t.phCalls}`);
      check(`${policyId}/${side}: S0 recorded`, t.pantryStartKcal > 0, `S0=${t.pantryStartKcal}`);
      check(`${policyId}/${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
      const c = WR.conservation(Game, t);
      check(`${policyId}/${side}: smoke conservation |rel|<=3%`, Math.abs(c.rel) <= 0.03,
        `rel=${(c.rel * 100).toFixed(2)}%`);
    }
  }
  delete process.env.PHANTOMFOOD_FIX;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function instrumentDetGate() {
  // r27 rule: bit-identical reruns WITH the instruments attached — proves the
  // instruments are pure read + call-through before trusting comparisons.
  for (const policyId of POLICIES) {
    process.env.PHANTOMFOOD_FIX = '1';
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: SEEDS[0], mode: `phantomfood-det-${policyId}`, fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const t = {};
      WR.attachWasteRate(Game, t);
      WR.snapshotStart(Game, t);
      attachPhantom(Game, t);
      const base = policyFor(policyId);
      const hashes = [];
      const pol = Object.assign({}, base);
      const oDaily = base.daily;
      pol.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 1 }); });
      runs.push(hashes);
    }
    const same = runs[0].length === runs[1].length && runs[0].every((h, i) => h === runs[1][i]);
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${policyId}/armed, instrumented): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  delete process.env.PHANTOMFOOD_FIX;
  console.log('Instrument DET gate green.');
}

async function oneRun(seed, policyId, side) {
  process.env.PHANTOMFOOD_FIX = (side === 'control') ? '0' : '1';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `phantomfood-${policyId}-${side}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxFires: 0, starvedDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const t = {};
  WR.attachWasteRate(Game, t);
  WR.snapshotStart(Game, t);
  attachPhantom(Game, t);
  // SENSE capture: surplus-sharing beats on the first armed run per policy
  const beats = [];
  const wantBeats = (side === 'armed' && seed === SEEDS[0]);
  let origSay = null;
  if (wantBeats) {
    origSay = Game.say.bind(Game);
    Game.say = function (m) {
      const s = String(m == null ? '' : m);
      if (BEAT_RE.test(s) && beats.length < BEAT_CAP) beats.push({ day: gday(Game), text: s.slice(0, 400) });
      return origSay(m);
    };
  }
  const policy = Object.assign({}, base);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      hist.villagerDays += alivePop(G);
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) { inst.errors = (inst.errors || 0) + 1; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (wantBeats) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-armed-s${seed}.json`), JSON.stringify(beats, null, 1));
    Game.say = origSay;
  }
  const causeCounts = {}, clsCounts = {};
  for (const d of (inst.deaths || [])) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
  }
  const starvation = clsCounts.STARVATION || 0;
  const vd = hist.villagerDays || 0;
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const c = WR.conservation(Game, t);
  const remEnd = (function () { try { return Number((Game.state.village || {})._surplusRemainder) || 0; } catch (e) { return 0; } })();
  const phantom = (t.phDeposited || 0) - (t.phGive || 0);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    // wall-metric key set as NUMBERS (schema-drift LOUD class):
    national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    sits: 0, // SEATDRIVE=0: no sitting substrate — schema completeness
    starvation, starvationPerVDay: vd ? +(starvation / vd).toFixed(6) : 0,
    causeCounts, clsCounts,
    maxRank: hist.maxRank,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    villagerDays: vd, starvedDays: hist.starvedDays,
    // phantom-food PRIMARY instrument:
    phantomCalls: t.phCalls || 0,
    phantomGiveKcal: Math.round(t.phGive || 0),
    phantomDepositedKcal: Math.round(t.phDeposited || 0),
    phantomKcal: Math.round(phantom),
    phantomBand: {
      lt100: { n: t.phBand.lt100.n, phantom: Math.round(t.phBand.lt100.phantom) },
      b100_200: { n: t.phBand.b100_200.n, phantom: Math.round(t.phBand.b100_200.phantom) },
      ge200: { n: t.phBand.ge200.n, phantom: Math.round(t.phBand.ge200.phantom) },
    },
    phantomCapAdjCalls: t.phCapAdj || 0,
    phantomWrapFailed: !!t.phWrapFailed,
    surplusRemainderEnd: +remEnd.toFixed(4),
    // conservation (wasterate-b method):
    pantryStartKcal: t.pantryStartKcal || 0,
    pantryInKcal: t.pantryInKcal || 0,
    pantryOutKcal: t.pantryOutKcal || 0,
    pantryEndKcal: c.end,
    conservationResidual: c.residual, conservationRel: +c.rel.toFixed(5),
    residualMinusRemainder: +((c.residual || 0) - remEnd).toFixed(4),
    instrumentErrors: (inst.errors | 0) + (t.wrErrors | 0),
    wrapFailed: t.wrapFailed || [],
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} calls=${out.phantomCalls} phantom=${out.phantomKcal} remEnd=${out.surplusRemainderEnd.toFixed(1)} consRel=${(out.conservationRel * 100).toFixed(2)}% nat=${out.national} wave=${out.maxWave} starv=${out.starvation}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

(async () => {
  let only = null, sidesOnly = null;
  if (process.env.ONLY) only = new Set(String(process.env.ONLY).split(';').map(x => x.trim()).filter(Boolean));
  if (process.env.SIDES) sidesOnly = new Set(String(process.env.SIDES).split(',').map(x => x.trim()).filter(Boolean));
  const match = (p) => !only || only.has(p);
  const matchSide = (s) => !sidesOnly || sidesOnly.has(s);

  if (process.env.SMOKE === '1') { await smokeGate(); }
  await instrumentDetGate();

  const recs = [];
  for (const policyId of POLICIES) {
    if (!match(policyId)) continue;
    for (const side of SIDES) {
      if (!matchSide(side)) continue;
      for (const seed of SEEDS) {
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.PHANTOMFOOD_FIX;

  // ---- summary ----
  console.log('\n== phantomfood sweep summary ==');
  for (const policyId of POLICIES) {
    for (const side of SIDES) {
      const rs = recs.filter(r => r.policyId === policyId && r.side === side);
      const n = rs.length;
      if (!n) continue;
      const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
      const mean = (f) => rs.reduce((a, r) => a + (r[f] || 0), 0) / Math.max(1, n);
      console.log(`${policyId}/${side}: n=${n} phantom=${Math.round(rs.reduce((a, r) => a + r.phantomKcal, 0))} ` +
        `phantomMaxAbs=${Math.max(...rs.map(r => Math.abs(r.phantomKcal)))} ` +
        `consRel_max=${(Math.max(...rs.map(r => Math.abs(r.conservationRel))) * 100).toFixed(2)}% ` +
        `residMinusRem_max=${Math.max(...rs.map(r => Math.abs(r.residualMinusRemainder))).toFixed(2)} ` +
        `national=${sum('national')}/${n} medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
        `starvation=${sum('starvation')} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n}`);
    }
  }
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
