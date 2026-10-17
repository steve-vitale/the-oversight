#!/usr/bin/env node
// scripts/sweep-cookwin-b.js — lever sweep for the cook-window arm
// (sim-cookwin-b, 2026-10-17, food-economy axis).
//
// WHY: the duty-time cook drive only sees the about-to-rot surplus
// (spoilDay-day<=2). Findings #71/#99/#462-context: the eligible-surplus
// definition (not the budget, not the 250/person reserve) is the binding
// constraint on smoking. The lever widens the window to <=4 under env gate
// COOKWIN_B=1 (default OFF; runtime read, FOODLEVER_R5 pattern) — smoking
// days-3..4-out fresh at the canon blind 0.80x yield (PRESERVATION.md),
// not a subsidy.
//
// 8 FRESH seeds 4701-4708 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds, own paired control in the SAME
// sweep. control = COOKWIN_B unset; armed = COOKWIN_B=1.
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat courtship, food-economy). Banned-seed check: SWEEP STOPS on hit.
//
// Pre-registration (binding, MEASUREMENT.md §§9-12, 14 — see
// evidence/2026-10-17/sim-cookwin-b.md):
//   PRIMARY: paired-median fresh waste-rate (freshRot/throughput/villager-day,
//     WR instrument) armed vs control. GO: paired median of per-pair
//     ratios <= 0.85.
//   VOLUME SANITY: aggregate armed day-3..4-window smoked kcal >= 2x control
//     (control is 0 by construction — the operative bar is >= 30k kcal
//     aggregate: the extension must actually engage, not just widen a
//     code path). KILL if missed.
//   HETEROGENEITY LENS: per-pair direction split reported (improved/worsened).
//   GUARDRAILS (all must hold): starvation <= control+2; national >=
//     control-2; matched median survival >= control-10d; half-ration rate
//     reported (finding #385); no new death mode; no crash.
//   DET-GATE: instrumented armed rerun byte-identical (r27 rule) before the
//     sweep spends seeds. SMOKE green before sweep spend.
//   SENSE: cook smoke beats captured on the first armed run per policy;
//     2-3 villager beats touching the drive read for honesty.
// Horizon: 180d death-aware (runDays stops on village death +10d tail;
// baseline median survival on this substrate is ~60-150d — the horizon is
// the question's ceiling, not the measurement).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-cookwin-b.js
// Targeted: SEEDS="4701,4702" ONLY="leadfeast" SIDES="armed" node ...
'use strict';
const fs = require('fs');
const path = require('path');
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
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
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4701, 4702, 4703, 4704, 4705, 4706, 4707, 4708]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
const POLICIES = ['leadfeast', 'belongfeast'];
const SIDES = ['control', 'armed'];
const DATE = '2026-10-17';
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-cookwin');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'cookwin-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// cook smoke beats — sense reads of the drive's narration
const BEAT_RE = /smoke racks|worked the smoke|preserv|racks are already full|left the fresh pile/i;
const BEAT_CAP = 80;
const MANTLE_RE = /Codex turns a page/i;

function policyFor(policyId) {
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

// ---- smoke-window instrument: bucket converted kcal by pre-convert
// spoilDay-day window (w12 / w34 / wOther), with a convert-time laundering
// check (finding #101 lesson: measured AT CONVERT TIME, never post-hoc).
// Stacks WR before attaching: WR's resolveOneAssignment wrap is the inner
// call-through; this wrap stamps pre-convert state via temp props (deleted
// in the same call) so partial-split copies inherit the parent's window.
function attachSmokeWindow(Game, s) {
  s.win = { w12: 0, w34: 0, wOther: 0, launderedKcal: 0, launderedItems: 0, resolutions: 0 };
  s.smokeWrapFailed = false; s.smokeErr = 0;
  let orig = null;
  try { orig = Game.resolveOneAssignment; } catch (e) { s.smokeWrapFailed = true; return; }
  if (typeof orig !== 'function') { s.smokeWrapFailed = true; return; }
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  Game.resolveOneAssignment = function (vid, a) {
    let v = null;
    try { v = Game.state.village || null; } catch (e) {}
    const day = gday();
    let isSpoiled = null;
    try { isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null; } catch (e) {}
    try {
      for (const it of (v && v.pantry) || []) {
        if (!it) continue;
        const sd = it.spoilDay;
        it._ckw = (sd === undefined || sd === null) ? 9999 : (sd - day);
        it._ckwPres = (it.foodState === 'preserved' || it.foodState === 'rendered');
        it._ckwSpoiled = isSpoiled ? !!isSpoiled(it, 0) : (it._ckw <= 0);
      }
    } catch (e) { s.smokeErr++; }
    let r, err = null;
    try { r = orig.apply(this, arguments); } catch (e) { err = e; }
    try {
      for (const it of (v && v.pantry) || []) {
        if (!it) continue;
        const w = it._ckw, wasPres = it._ckwPres, wasSpoiled = it._ckwSpoiled;
        delete it._ckw; delete it._ckwPres; delete it._ckwSpoiled;
        if (it.foodState === 'preserved' && !wasPres) {
          const k = Math.round((it.kcalEach || 0) * (it.units || 0));
          if (w <= 2) s.win.w12 += k;
          else if (w <= 4) s.win.w34 += k;
          else s.win.wOther += k;
          if (wasSpoiled) { s.win.launderedKcal += k; s.win.launderedItems++; }
        }
      }
      if (a && a.task === 'cook') s.win.resolutions++;
    } catch (e) { s.smokeErr++; }
    if (err) throw err;
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
      if (side === 'armed') process.env.COOKWIN_B = '1'; else delete process.env.COOKWIN_B;
      const { Game } = await loadGame({ seed: SEEDS[0], mode: `cookwin-smoke-${policyId}-${side}`, fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const t = {};
      WR.attachWasteRate(Game, t);
      WR.snapshotStart(Game, t);
      const s = {};
      attachSmokeWindow(Game, s);
      const inst = {};
      LW.attachDeathInstrument(Game, inst);
      LW.attachFoodInstruments(Game, inst);
      const base = policyFor(policyId);
      let r = null;
      await quietLog(async () => { r = await runDays(Game, Object.assign({}, base), { days: 15, sampleEvery: 30 }); });
      check(`${policyId}/${side}: smoke instrument live`, !s.smokeWrapFailed && s.win.resolutions > 0,
        `resolutions=${s.win.resolutions}`);
      check(`${policyId}/${side}: S0 recorded`, t.pantryStartKcal > 0, `S0=${t.pantryStartKcal}`);
      check(`${policyId}/${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
      check(`${policyId}/${side}: no laundering at convert time`, s.win.launderedItems === 0,
        `laundered=${s.win.launderedItems}`);
      const c = WR.conservation(Game, t);
      check(`${policyId}/${side}: smoke conservation |rel|<=3%`, Math.abs(c.rel) <= 0.03,
        `rel=${(c.rel * 100).toFixed(2)}%`);
    }
  }
  delete process.env.COOKWIN_B;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function instrumentDetGate() {
  // r27 rule: bit-identical reruns WITH the instruments attached — proves the
  // instruments are pure read + call-through before trusting comparisons.
  for (const policyId of POLICIES) {
    process.env.COOKWIN_B = '1';
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: SEEDS[0], mode: `cookwin-det-${policyId}`, fullTelemetry: false });
      await quietLog(async () => { await setupGame(Game); });
      const t = {};
      WR.attachWasteRate(Game, t);
      WR.snapshotStart(Game, t);
      const s = {};
      attachSmokeWindow(Game, s);
      const inst = {};
      LW.attachDeathInstrument(Game, inst);
      LW.attachFoodInstruments(Game, inst);
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
  delete process.env.COOKWIN_B;
  console.log('Instrument DET gate green.');
}

async function oneRun(seed, policyId, side) {
  if (side === 'armed') process.env.COOKWIN_B = '1'; else delete process.env.COOKWIN_B;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `cookwin-${policyId}-${side}`, fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxFires: 0, starvedDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const t = {};
  WR.attachWasteRate(Game, t);
  WR.snapshotStart(Game, t);
  const s = {};
  attachSmokeWindow(Game, s);
  // light wall extras: counter discoveries + mantle transfers (young-link
  // succession survival: transfer followed by 30d+ village survival)
  const wall = { counterDiscovered: 0, mantleTransfers: [] };
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    if (oTele) {
      Game.tele = function (type, data) {
        try { if (type === 'counter_discovered') wall.counterDiscovered++; } catch (e) {}
        return oTele(type, data);
      };
    }
  } catch (e) { inst.errors = (inst.errors || 0) + 1; }
  // SENSE capture: cook smoke beats + mantle beats on the first armed run per policy
  const beats = [];
  const wantBeats = (side === 'armed' && seed === SEEDS[0]);
  let origSay = null;
  if (wantBeats) {
    origSay = Game.say.bind(Game);
    Game.say = function (m) {
      const str = String(m == null ? '' : m);
      if ((BEAT_RE.test(str) || MANTLE_RE.test(str)) && beats.length < BEAT_CAP) {
        beats.push({ day: gday(Game), text: str.slice(0, 400) });
      }
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
  // mantle transfers ride the say channel; the beats capture has them
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (wantBeats) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-armed-s${seed}.json`), JSON.stringify(beats, null, 1));
    Game.say = origSay;
  }
  const gameDays = result.gameDays;
  const mantleBeats = beats.filter(b => MANTLE_RE.test(b.text));
  for (const mb of mantleBeats) wall.mantleTransfers.push({ day: mb.day });
  const succSurvived30 = wall.mantleTransfers.filter(mt => gameDays >= mt.day + 30).length;
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
  const wr = WR.wasteRate(t);
  const halfRationDays = Object.values(inst.meals || {}).filter(m => m.halfRation).length;
  const mealsDays = Object.keys(inst.meals || {}).length;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays, endReason: result.endReason,
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
    halfRationDays, halfRationRate: mealsDays ? +(halfRationDays / Math.max(1, gameDays)).toFixed(4) : 0,
    counterDiscovered: wall.counterDiscovered,
    mantleTransfers: wall.mantleTransfers.length,
    mantleSurvived30: succSurvived30,
    // PRIMARY instrument: fresh waste-rate (+ per-vday variant)
    freshRotKcal: Math.round((t.pantryRotKcal || 0) + (t.desperationRotKcal || 0)),
    wasteRate: +wr.toFixed(5),
    wasteRatePerVDay: vd ? +(wr / vd).toFixed(9) : 0,
    pantryStartKcal: t.pantryStartKcal || 0,
    pantryInKcal: t.pantryInKcal || 0,
    pantryOutKcal: t.pantryOutKcal || 0,
    pantryRotKcal: t.pantryRotKcal || 0,
    desperationRotKcal: t.desperationRotKcal || 0,
    pantryEndKcal: c.end,
    conservationResidual: c.residual, conservationRel: +c.rel.toFixed(5),
    // smoke-window instrument (the lever's mechanism):
    smokeW12: s.win.w12, smokeW34: s.win.w34, smokeWOther: s.win.wOther,
    smokeResolutions: s.win.resolutions,
    launderedKcal: s.win.launderedKcal, launderedItems: s.win.launderedItems,
    smokeWrapFailed: !!s.smokeWrapFailed, smokeErr: s.smokeErr || 0,
    instrumentErrors: (inst.errors | 0) + (t.wrErrors | 0),
    wrapFailed: t.wrapFailed || [],
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} w34=${out.smokeW34} w12=${out.smokeW12} launder=${out.launderedItems} wr=${out.wasteRate} nat=${out.national} wave=${out.maxWave} starv=${out.starvation}`);
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
  delete process.env.COOKWIN_B;

  // ---- summary ----
  console.log('\n== cookwin sweep summary ==');
  const pairs = [];
  for (const policyId of POLICIES) {
    const cs = recs.filter(r => r.policyId === policyId && r.side === 'control');
    const as = recs.filter(r => r.policyId === policyId && r.side === 'armed');
    for (const a of as) {
      const c = cs.find(x => x.seed === a.seed);
      if (!c) continue;
      const ratio = (c.wasteRatePerVDay > 0 && a.wasteRatePerVDay >= 0)
        ? a.wasteRatePerVDay / c.wasteRatePerVDay : null;
      pairs.push({ policyId, seed: a.seed, ratio,
        improved: ratio == null ? null : ratio < 1,
        aW34: a.smokeW34, cW34: c.smokeW34,
        aStarv: a.starvation, cStarv: c.starvation,
        aDays: a.gameDays, cDays: c.gameDays });
    }
  }
  const ratios = pairs.map(p => p.ratio).filter(r => r != null && isFinite(r));
  const pm = median(ratios);
  const improved = pairs.filter(p => p.improved === true).length;
  const worsened = pairs.filter(p => p.improved === false).length;
  const aW34tot = pairs.reduce((t, p) => t + p.aW34, 0);
  const cW34tot = pairs.reduce((t, p) => t + p.cW34, 0);
  console.log(`PRIMARY paired-median fresh waste-rate ratio (armed/control): ${pm.toFixed(4)} (GO <= 0.85)`);
  console.log(`  per-pair: improved=${improved} worsened=${worsened} null=${pairs.length - improved - worsened}`);
  for (const p of pairs) {
    console.log(`    ${p.policyId} s${p.seed}: ratio=${p.ratio == null ? 'null' : p.ratio.toFixed(3)} ` +
      `aDays=${p.aDays} cDays=${p.cDays} aW34=${p.aW34} cW34=${p.cW34} aStarv=${p.aStarv} cStarv=${p.cStarv}`);
  }
  console.log(`VOLUME SANITY: armed w34=${aW34tot} vs control w34=${cW34tot} (ratio ${cW34tot > 0 ? (aW34tot / cW34tot).toFixed(1) : 'inf'}x; GO >=2x AND >=30k aggregate)`);
  const sum = (f, side) => recs.filter(r => r.side === side).reduce((a, r) => a + (r[f] | 0), 0);
  const medDays = (side) => median(recs.filter(r => r.side === side).map(r => r.gameDays));
  console.log(`GUARDRAILS: starvation armed=${sum('starvation', 'armed')} control=${sum('starvation', 'control')} (armed <= control+2)`);
  console.log(`  national armed=${sum('national', 'armed')} control=${sum('national', 'control')} (armed >= control-2)`);
  console.log(`  median survival armed=${medDays('armed').toFixed(1)}d control=${medDays('control').toFixed(1)}d (armed >= control-10d)`);
  const halfR = (side) => median(recs.filter(r => r.side === side).map(r => r.halfRationRate || 0));
  console.log(`  halfRationRate median armed=${halfR('armed').toFixed(3)} control=${halfR('control').toFixed(3)}`);
  // new death mode: cls with armed >= 3 and control == 0
  const clsA = {}, clsC = {};
  for (const r of recs) for (const [k, v] of Object.entries(r.clsCounts || {})) (r.side === 'armed' ? clsA : clsC)[k] = ((r.side === 'armed' ? clsA : clsC)[k] || 0) + v;
  const newModes = Object.keys(clsA).filter(k => clsA[k] >= 3 && !(clsC[k] > 0));
  console.log(`  death cls armed=${JSON.stringify(clsA)} control=${JSON.stringify(clsC)} newModes=${JSON.stringify(newModes)}`);
  const laund = sum('launderedItems', 'armed');
  console.log(`  laundering at convert time: armed items=${laund} (must be 0)`);
  // wall numbers
  for (const side of SIDES) {
    const rs = recs.filter(r => r.side === side);
    const n = rs.length;
    const cnt = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const wave = (w) => rs.filter(r => r.maxWave >= w).length;
    console.log(`WALL ${side}: n=${n} wins=${cnt('wins')}/${n} national=${cnt('national')}/${n} table=${cnt('table')}/${n} ` +
      `w1=${wave(1)}/${n} w2=${wave(2)}/${n} w3=${wave(3)}/${n} w4=${wave(4)}/${n} w5=${wave(5)}/${n} ` +
      `arc2=${cnt('arc2')}/${n} arc3=${cnt('arc3')}/${n} arc4=${cnt('arc4')}/${n} fourRealm=${cnt('fourRealm')}/${n} ` +
      `median=${medDays(side).toFixed(1)}d max=${Math.max(...rs.map(r => r.gameDays))}d ` +
      `counters=${cnt('counterDiscovered')} mantle=${cnt('mantleTransfers')} mantleSurv30=${cnt('mantleSurvived30')}`);
  }
  fs.writeFileSync(path.join(EVID, '..', 'cookwin-sweep-summary-20261017.json'),
    JSON.stringify({ pairs, pm, aW34tot, cW34tot, verdict: 'see evidence/2026-10-17/sim-cookwin-b.md' }, null, 1));
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
