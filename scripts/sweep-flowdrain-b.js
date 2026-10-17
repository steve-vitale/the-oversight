#!/usr/bin/env node
// scripts/sweep-flowdrain-b.js — FLOW-triggered aid drawdown sweep
// (sim-flowdrain-b, 2026-10-17, food-economy axis — finding #444 lesson (c):
// trigger on FLOW (income rate), not STOCK (pantry size).
//
// control: leadfeast / belongfeast (the FEASTSCALE_R13=1 substrate, no layer)
// armed:   flowlead / flowbelong (FLOWDRAIN_B=1 — aid on fresh-income days)
//
// 8 FRESH seeds 4301-4308 x leadfeast x {control, armed} = 16 runs,
// 180d death-aware, identical seeds both sides. LEAD-ROAD ONLY: the aid
// verb (tendLink) requires a subordinate link (link.primary === 'haven');
// the belong road never builds subordinate links (SUBSTRATE-MISSING for
// belong — the verb is structurally absent there). Own control in the SAME
// sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Banned-seed check: SWEEP STOPS if any seed is banned.
//
// Pre-registered GO (binding, MEASUREMENT §§9-12, 14 — see
// evidence/2026-10-17/sim-flowdrain-b.md):
//   PRIMARY: paired-median waste-rate <= 0.85x armed/control, where
//     wasteRate = freshRotKcal / (villagerDays * meanDailyPantryKcal)
//     (rot per mouth-day per unit stocked — the #444 consequence-(c) prize:
//     waste rate, not absolute rot).
//   VOLUME SANITY (mandatory): max theoretical drawdown (flowDays x 1500)
//     vs the prize's required delta (15% of control rot); theoretical max <
//     25% of required delta => NO-COVERAGE (reported honestly, not a GO).
//   MECHANISM-ENGAGEMENT (vacuous-pass protection): (a) flow-days >= 30
//     across the sweep; (b) layer aids fired >= 10 armed-side; (c) aid-days
//     <= flow-days (sanity). Mechanism never engages => KILL, not GO.
//   GUARDRAILS: starvation <= control+2; national >= control-2;
//     matched median survival >= control-10d (one-sided — the trig6 lesson);
//     table >= control-2; dehydration <= control+1; wins 0=0 (pre-seat);
//     exiled 0=0; no new death mode; half-ration rate reported (#385).
//   HETEROGENEITY LENS: per-pair waste-rate direction split.
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-flowdrain-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-flowdrain-b.js
// Targeted re-runs: SEEDS="4301,4302" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
let FD = null;
try { FD = require('./policies/flowdrain'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: flowdrain layer deleted per kill protocol (NO-GO on engaged primary + guardrail breaches, 2026-10-17)');
    process.exit(0);
  }
  throw e;
}
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

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4301, 4302, 4303, 4304, 4305, 4306, 4307, 4308]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
// LEAD-ROAD ONLY (plumbing 2026-10-17): the aid verb (tendLink) requires
// link.primary === 'haven' — a subordinate to tend. The belong road never
// builds subordinate links (the scholar joins; diagnostic: 0 links across
// 80 flow-days on belongfeast s4301) — the verb is structurally absent
// there (SUBSTRATE-MISSING for belong, not a design flaw). The arm sweeps
// leadfeast only. flowbelong stays in the policy file (gate-off identical,
// never fires) but is not swept.
const POLICIES = ['leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-flowdrain');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'flowdrain-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? FD.flowlead : FD.flowbelong;
  return policyId === 'leadfeast' ? leadfeast : belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

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

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

// layer-verb beats: the standard food beats PLUS the flowdrain cause line.
const LAYER_BEAT_RE = /feast|ration|hungr|starv|meal|cook|grumb|eat\b|eating|share|gave|give|food|dinner|breakfast|pantry|shelves|rot pile|ran heavy|national|regional|died|dead|raid|gorge|exile|wave [345]|table/i;
function attachLayerBeats(Game, t) {
  t.layerBeats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (LAYER_BEAT_RE.test(s)) {
        t.layerBeats.push({ day: gday(Game), text: s });
        if (t.layerBeats.length > 4000) t.layerBeats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

// fresh-rot instrument: snapshot spoiled FRESH kcal just before the
// engine's sweep runs (the trig6 convention).
function attachRot(Game, t) {
  t.freshRotKcal = 0; t.freshRotItems = 0;
  const orig = Game.sweepSpoiled ? Game.sweepSpoiled.bind(Game) : null;
  if (!orig) return;
  const isSpoiled = Game.isSpoiled ? Game.isSpoiled.bind(Game) : null;
  Game.sweepSpoiled = function () {
    try {
      const scan = (arr) => {
        for (const it of (arr || [])) {
          if (!it) continue;
          if (it.foodState === 'preserved' || it.foodState === 'rendered' || (it.foodKind || '') === 'pemmican') continue;
          let spoiled = false;
          try { spoiled = isSpoiled ? !!isSpoiled(it) : false; } catch (e) {}
          if (spoiled) {
            t.freshRotKcal += Math.round((it.kcalEach || 0) * (it.units || 1));
            t.freshRotItems++;
          }
        }
      };
      scan((Game.state.scholar || {}).inventory);
      try {
        const ps = Game.prepStash ? Game.prepStash() : null;
        if (ps && ps !== Game.state.scholar.inventory) scan(ps);
      } catch (e) {}
      scan((Game.state.village || {}).pantry);
    } catch (e) {}
    return orig.apply(this, arguments);
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  check('flowdrain FLOW_KCAL honest (4000)', FD.FLOW_KCAL === 4000, `FLOW_KCAL=${FD.FLOW_KCAL}`);
  check('flowdrain AID_KCAL honest (1500)', FD.AID_KCAL === 1500, `AID_KCAL=${FD.AID_KCAL}`);
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.FLOWDRAIN_B = '1'; else delete process.env.FLOWDRAIN_B;
    const { Game } = await loadGame({ seed: 4301, mode: `flowdrain-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    const base = policyFor('belongfeast', side);
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    const wantId = side === 'armed' ? 'flowbelong' : 'belongfeast';
    const live = side === 'armed'
      ? (base.id === wantId && runCtx && typeof runCtx._fdInTotal === 'number')
      : (base.id === wantId);
    check(`${side}: layer-live markers honest`, live, `id=${base.id}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.FLOWDRAIN_B;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  // r27 rule: bit-identical reruns before trusting comparisons.
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.FLOWDRAIN_B = '1'; else delete process.env.FLOWDRAIN_B;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4301, mode: `flowdrain-det-${side}` });
      await setupGame(Game);
      const base = policyFor('leadfeast', side);
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
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (${side}): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  delete process.env.FLOWDRAIN_B;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.FLOWDRAIN_B = '1'; else delete process.env.FLOWDRAIN_B;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `flowdrain-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0, maxArc: 1, maxFires: 0, starvedDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const inst = {};
  LW.attachDeathInstrument(Game, inst);
  LW.attachFoodInstruments(Game, inst);
  const beats = {};
  attachLayerBeats(Game, beats);
  const rot = {};
  attachRot(Game, rot);
  const pantrySamples = [];
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
      pantrySamples.push(pantryKcal(G));
    } catch (e) { inst.errors = (inst.errors || 0) + 1; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
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
  let hungryDays = 0;
  try { hungryDays = ((Game.state.village || {}).hungryDays || 0); } catch (e) {}
  const halfRationDays = Object.values(inst.meals || {}).filter(m => m.halfRation).length;
  const mealsDays = Object.keys(inst.meals || {}).length;
  const meanPantry = pantrySamples.length ? pantrySamples.reduce((a, b) => a + b, 0) / pantrySamples.length : 0;
  const rotKcal = rot.freshRotKcal || 0;
  const wasteRate = (vd > 0 && meanPantry > 0) ? rotKcal / (vd * meanPantry) : 0;
  const verbDays = runCtx && runCtx._fdVerbDays ? Object.keys(runCtx._fdVerbDays).length : 0;
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
    dehydration: (clsCounts['WATER-DEHYDRATION'] || 0),
    thirst: (clsCounts['WATER-THIRST'] || 0),
    maxRank: hist.maxRank,
    maxArc: hist.maxArc, arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    villagerDays: vd, starvedDays: hist.starvedDays, hungryDays,
    halfRationDays, halfRationRate: mealsDays ? +(halfRationDays / Math.max(1, result.gameDays)).toFixed(4) : 0,
    freshRotKcal: rotKcal, freshRotItems: rot.freshRotItems || 0,
    meanPantryKcal: Math.round(meanPantry),
    wasteRate: +wasteRate.toExponential(3),
    // flowdrain mechanism instruments (0/undefined on the control side):
    fdFlowDays: (runCtx && runCtx._fdFlowDays) || 0,
    fdAid: (runCtx && runCtx._fdAid) || 0,
    fdAidKcal: (runCtx && runCtx._fdAidKcal) || 0,
    fdGateHeld: (runCtx && runCtx._fdGateHeld) || 0,
    fdNoLink: (runCtx && runCtx._fdNoLink) || 0,
    fdRefused: (runCtx && runCtx._fdRefused) || 0,
    fdInTotal: Math.round((runCtx && runCtx._fdInTotal) || 0),
    fdVerbDays: verbDays,
    instrumentErrors: inst.errors | 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if ((beats.layerBeats || []).length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.layerBeats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} waste=${out.wasteRate} rot=${Math.round(rotKcal / 1000)}k nat=${out.national} wave=${out.maxWave} flowd=${out.fdFlowDays} aid=${out.fdAid} gates=${out.fdGateHeld} nolink=${out.fdNoLink}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

(async () => {
  let only = null;
  if (process.env.ONLY) {
    only = new Set();
    for (const part of String(process.env.ONLY).split(';')) {
      const [p, s] = part.split(',').map(x => x.trim());
      if (p && s) only.add(p + '|' + s);
    }
  }
  const match = (p, s) => !only || only.has(p + '|' + s);

  if (process.env.SMOKE === '1') { await smokeGate(); }
  await detGate();

  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.FLOWDRAIN_B;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== flowdrain sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
    const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
    const starv = sum('starvation');
    console.log(`${side}: n=${n} starvation=${starv} national=${sum('national')}/${n} medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `freshRot=${Math.round(rot / 1000)}k table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} ` +
      `wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} dehydr=${sum('dehydration')} ` +
      `arc2=${sum('arc2')}/${n} arc3=${sum('arc3')}/${n} arc4=${sum('arc4')}/${n} fourRealm=${sum('fourRealm')}/${n} ` +
      `halfRationDays=${sum('halfRationDays')} flowd=${sum('fdFlowDays')} aid=${sum('fdAid')} aidKcal=${sum('fdAidKcal')} gates=${sum('fdGateHeld')} nolink=${sum('fdNoLink')}`);
  }
  // PRIMARY: paired-median waste-rate ratio
  const ratios = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (!c) continue;
    const cw = c.wasteRate, aw = r.wasteRate;
    let ratio;
    if (cw > 0) ratio = aw / cw;
    else ratio = aw > 0 ? Infinity : 1;
    ratios.push({ seed: r.seed, policyId: r.policyId, ratio, aw, cw });
  }
  const finiteRatios = ratios.filter(x => isFinite(x.ratio)).map(x => x.ratio);
  console.log(`PRIMARY paired waste-rate ratios (armed/control): ` +
    ratios.map(x => `${x.policyId}/s${x.seed}:${isFinite(x.ratio) ? x.ratio.toFixed(3) : 'Inf'}`).join(' '));
  console.log(`PRIMARY paired-median ratio = ${median(finiteRatios).toFixed(3)} (GO <= 0.85)`);
  const improved = ratios.filter(x => x.ratio < 1).length;
  console.log(`HETEROGENEITY: ${improved}/${ratios.length} pairs improved (ratio < 1)`);
  // VOLUME SANITY
  const A = by('armed'), C = by('control');
  const flowDays = A.reduce((a, r) => a + r.fdFlowDays, 0);
  const maxTheoretical = flowDays * FD.AID_KCAL;
  const controlRot = C.reduce((a, r) => a + r.freshRotKcal, 0);
  const requiredDelta = 0.15 * controlRot;
  console.log(`VOLUME SANITY: max theoretical drawdown=${Math.round(maxTheoretical / 1000)}k vs required delta (15% of control rot)=${Math.round(requiredDelta / 1000)}k ` +
    `=> ${(maxTheoretical / Math.max(1, requiredDelta) * 100).toFixed(1)}% of required ${maxTheoretical >= 0.25 * requiredDelta ? '(COVERAGE OK)' : '(NO-COVERAGE)'}`);
  // MECHANISM
  const aids = A.reduce((a, r) => a + r.fdAid, 0);
  const vdays = A.reduce((a, r) => a + r.fdVerbDays, 0);
  console.log(`MECHANISM: flow-days=${flowDays} (>=30), aids=${aids} (>=10), aid-days=${vdays} (<= flow-days: ${vdays <= flowDays})`);
  // death-cause shares per side
  for (const side of ['control', 'armed']) {
    const agg = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.causeCounts || {})) agg[k] = (agg[k] || 0) + v;
    console.log(`${side} death causes: ` + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  }
  // per-policy starvation
  for (const policyId of POLICIES) {
    const c = by('control').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    const a = by('armed').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    console.log(`starvation ${policyId}: control=${c} armed=${a}`);
  }
  // paired starvation deltas (heterogeneity lens)
  const deltas = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) deltas.push({ seed: r.seed, policyId: r.policyId, d: r.starvation - c.starvation });
  }
  console.log('paired starvation deltas (armed-control): ' +
    deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
  console.log('max paired delta: ' + (deltas.length ? Math.max(...deltas.map(x => x.d)) : 'n/a'));
  // paired aids vs waste-rate-delta (the trig6 enrichment autopsy, flow form)
  console.log('per-pair aids vs waste-rate ratio: ' +
    ratios.map(x => {
      const r = by('armed').find(y => y.policyId === x.policyId && y.seed === x.seed);
      return `${x.policyId}/s${x.seed}:aid=${r ? r.fdAid : '?'} ratio=${isFinite(x.ratio) ? x.ratio.toFixed(2) : 'Inf'}`;
    }).join(' '));
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
