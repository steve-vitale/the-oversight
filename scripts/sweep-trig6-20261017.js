#!/usr/bin/env node
// scripts/sweep-trig6-20261017.js — lifted-trigger drawdown sweep (sim-trig6-b,
// 2026-10-16/17, food-economy axis — sim-findings #200 named next).
//
// control: leadfeast / belongfeast (the FEASTSCALE_R13=1 substrate, no layer)
// armed:   trig6lead / trig6belong (TRIG6=1 — the lifted-trigger drawdown)
//
// 8 FRESH seeds 4101-4108 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds both sides. Own control in the
// SAME sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Banned-seed check: SWEEP STOPS if any seed is banned.
//
// Pre-registered GO (binding, MEASUREMENT §§9-12, 14 — see
// evidence/2026-10-17/sim-trig6-b.md):
//   PRIMARY: starvation deaths (absolute), armed <= control; per-day-alive
//     rate armed <= control x 1.15.
//   CO-PRIMARY: fresh-rot kcal armed <= 0.75x control.
//   GO = both gates (every-gate rule).
//   MECHANISM-ENGAGEMENT (vacuous-pass protection): (a) layer drawdown verbs
//     fire >= 20 combined armed-side; (b) lifted-trigger candidate-days
//     (fd>6) >= 30 across the sweep; (c) verb-days <= 0.9x fd4-candidate-days
//     (the lift discriminates). Mechanism never engages => KILL, not GO.
//   GUARDRAILS: national >= control-2; median survival within 10d of control;
//     no new death mode; table >= control-2; dehydration <= control+1;
//     wins 0=0 both sides (pre-seat); exiled 0 both sides.
//   HETEROGENEITY LENS: max per-seed starvation delta (armed-control) <= +3;
//     report half-ration rate both sides.
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-trig6-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-trig6-20261017.js
// Targeted re-runs: SEEDS="4101,4102" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
process.env.LEANWINTER_LIB = '1';
const LW = require('./sweep-leanwinter-20261017');
let T6 = null;
try { T6 = require('./policies/trig6'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trig6 layer deleted per kill protocol (NO-GO on engaged co-primary, 2026-10-17)');
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

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-trig6');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'trig6-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? T6.trig6lead : T6.trig6belong;
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

// layer-verb beats: the standard food beats PLUS the trig6 cause lines
// (the aid line's diction misses FOOD_BEAT_RE).
const LAYER_BEAT_RE = /feast|ration|hungr|starv|meal|cook|grumb|eat\b|eating|share|gave|give|food|dinner|breakfast|pantry|shelves|not the rot|mountain tonight|national|regional|died|dead|raid|gorge|exile|wave [345]|table/i;
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
// engine's sweep runs (fresh = spoil-risk food, the pantryFreshKcal
// convention: preserved/rendered/pemmican excluded). Pure read +
// call-through; behavior unchanged.
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
  check('trig6 trigger constant honest (fd > 6)', T6.TRIG_TRIGGER === 6, `TRIG_TRIGGER=${T6.TRIG_TRIGGER}`);
  check('trig6 reference constant honest (fd > 4)', T6.REF_TRIGGER === 4, `REF_TRIGGER=${T6.REF_TRIGGER}`);
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.TRIG6 = '1'; else delete process.env.TRIG6;
    const { Game } = await loadGame({ seed: 4101, mode: `trig6-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    const base = policyFor('belongfeast', side);
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    const wantId = side === 'armed' ? 'trig6belong' : 'belongfeast';
    const live = side === 'armed'
      ? (base.id === wantId && runCtx && Array.isArray(runCtx._t6FeastEvents))
      : (base.id === wantId);
    check(`${side}: layer-live markers honest`, live, `id=${base.id}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.TRIG6;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  // r27 rule: bit-identical reruns before trusting comparisons.
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.TRIG6 = '1'; else delete process.env.TRIG6;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 4101, mode: `trig6-det-${side}` });
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
  delete process.env.TRIG6;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.TRIG6 = '1'; else delete process.env.TRIG6;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `trig6-${side}`, fullTelemetry: false });
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
  const verbDays = runCtx && runCtx._t6VerbDays ? Object.keys(runCtx._t6VerbDays).length : 0;
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
    freshRotKcal: rot.freshRotKcal || 0, freshRotItems: rot.freshRotItems || 0,
    freshRotPerVDay: vd ? +((rot.freshRotKcal || 0) / vd).toFixed(1) : 0,
    // trig6 mechanism instruments (0 on the control side — layer absent):
    t6Aid: (runCtx && runCtx.t6Aid) || 0,
    t6Feasts: (runCtx && runCtx.t6Feasts) || 0,
    t6AidKcal: (runCtx && runCtx.t6AidKcal) || 0,
    t6FeastKcal: (runCtx && runCtx.t6FeastKcal) || 0,
    t6GateHeld: (runCtx && runCtx.t6GateHeld) || 0,
    t6Fd6Days: (runCtx && runCtx.t6Fd6Days) || 0,
    t6Fd4Days: (runCtx && runCtx.t6Fd4Days) || 0,
    t6VerbDays: verbDays,
    t6FeastEvents: ((runCtx && runCtx._t6FeastEvents) || []).slice(-40),
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
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} dehydr=${out.dehydration} nat=${out.national} wave=${out.maxWave} table=${out.table} rot=${Math.round(out.freshRotKcal / 1000)}k halfr=${out.halfRationDays} aid=${out.t6Aid} feasts=${out.t6Feasts} gates=${out.t6GateHeld} fd6=${out.t6Fd6Days} fd4=${out.t6Fd4Days} vdays=${out.t6VerbDays}`);
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
  delete process.env.TRIG6;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== trig6 sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
    const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
    const starv = sum('starvation');
    console.log(`${side}: n=${n} starvation=${starv} (PRIMARY; per-vday=${(starv / Math.max(1, vd)).toFixed(6)}) ` +
      `national=${sum('national')}/${n} medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `freshRot=${Math.round(rot / 1000)}k (${(rot / Math.max(1, vd)).toFixed(0)}/vday) ` +
      `table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} ` +
      `wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} ` +
      `dehydr=${sum('dehydration')} thirst=${sum('thirst')} ` +
      `arc2=${sum('arc2')}/${n} arc3=${sum('arc3')}/${n} arc4=${sum('arc4')}/${n} fourRealm=${sum('fourRealm')}/${n} ` +
      `halfRationDays=${sum('halfRationDays')} (rate=${(sum('halfRationDays') / Math.max(1, rs.reduce((a, r) => a + r.gameDays, 0))).toFixed(4)}/d) ` +
      `aid=${sum('t6Aid')} feasts=${sum('t6Feasts')} gates=${sum('t6GateHeld')} fd6=${sum('t6Fd6Days')} fd4=${sum('t6Fd4Days')} vdays=${sum('t6VerbDays')}`);
  }
  // death-cause shares per side
  for (const side of ['control', 'armed']) {
    const agg = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.causeCounts || {})) agg[k] = (agg[k] || 0) + v;
    console.log(`${side} death causes: ` + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  }
  // per-policy starvation (road concentration check)
  for (const policyId of POLICIES) {
    const c = by('control').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    const a = by('armed').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    console.log(`starvation ${policyId}: control=${c} armed=${a}`);
  }
  // per-seed starvation deltas (paired) — the heterogeneity lens
  const deltas = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) deltas.push({ seed: r.seed, policyId: r.policyId, d: r.starvation - c.starvation });
  }
  console.log('paired starvation deltas (armed-control): ' +
    deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
  console.log('max paired delta: ' + (deltas.length ? Math.max(...deltas.map(x => x.d)) : 'n/a'));
  // mechanism-engagement checks
  const A = by('armed');
  const verbs = A.reduce((a, r) => a + r.t6Aid + r.t6Feasts, 0);
  const fd6 = A.reduce((a, r) => a + r.t6Fd6Days, 0);
  const fd4 = A.reduce((a, r) => a + r.t6Fd4Days, 0);
  const vdays = A.reduce((a, r) => a + r.t6VerbDays, 0);
  console.log(`MECHANISM: verbs=${verbs} (>=20), fd6days=${fd6} (>=30), vdays=${vdays} vs fd4=${fd4} (need vdays <= 0.9*fd4 = ${(0.9 * fd4).toFixed(1)})`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
