#!/usr/bin/env node
// scripts/sweep-drawcap-20261017.js — drawdown-cap sweep (sim-drawcap-b,
// 2026-10-17, food-economy axis — finding #422 named next).
//
// control: base courtship policies (leadfeast / belongfeast) — the
//   FEASTSCALE_R13=1 substrate, SEATDRIVE=0, no drawdown layer.
// armed:   drawcaplead / drawcapbelong (DRAWCAP=1) — the overdraw4 vehicle
//   rebuilt with NO floor and the 1x-burn daily outflow cap on fd<6 days.
//
// 8 FRESH seeds 4101-4108 x {leadfeast, belongfeast} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds both sides. Own control in the
// SAME sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). SWEEP STOPS on mismatch.
//
// Seeds are checked against the coordinator's banned list up front; the
// sweep STOPS if any seed is banned.
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-17/sim-drawcap-b.md):
//   PRIMARY: starvation deaths (absolute), armed <= control; per-day-alive
//     rate armed <= control x 1.15.
//   CO-PRIMARY: fresh-rot kcal, armed <= 0.75x control.
//   GO = both gates (every-gate rule).
//   ENGAGEMENT: (a) layer verbs fire >= 20 combined armed-side;
//     (b) cap BINDS on >= 8 candidate-days (osCapHeld >= 8). A miss on
//     engagement is KILL (invisible effect), not GO.
//   GUARDRAILS: national >= control-2; median survival within 10d of
//     control; no new death mode; table >= control-2; dehydration <=
//     control+1; wins 0=0 both sides (pre-seat); exiled 0 both sides.
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-drawcap-20261017.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-drawcap-20261017.js
// Targeted re-runs: SEEDS="4101,4102" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
let DC = null;
try { DC = require('./policies/drawcap'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: drawcap layer deleted per kill protocol (NO-GO 2026-10-17: PRIMARY + CO-PRIMARY fail, cap invisible)');
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

const BANNED = new Set([
  ...[982, 983, 984, 985, 986, 987, 988, 989],
  ...[3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108],
  ...[3301, 3302, 3303, 3304, 3305, 3306, 3307, 3308],
  ...[3201, 3202, 3203, 3204, 3205, 3206, 3207, 3208],
  ...[171, 282, 393, 504, 615, 726, 837, 948],
  ...[931, 932, 933, 934, 935, 936, 937, 938],
  ...Array.from({ length: 778 }, (_, i) => 111 + i),
  ...[121, 232, 343, 454, 565, 676, 787, 898],
  ...[131, 242, 353, 464, 575, 686, 797, 908],
  ...[151, 262, 373, 484, 595, 706, 817, 928],
  ...[163, 274, 385, 496, 607, 718, 829, 940],
  ...[1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708],
  ...[205, 246, 321, 412, 523, 634, 745, 856],
  ...[307, 418, 529, 640, 751, 862, 973, 84],
  ...[917, 928, 939, 104, 215, 326, 437, 548],
  ...[141, 252, 363, 474],
  ...[101, 202, 303, 404, 606, 707, 808, 909],
  ...[137, 248, 359, 470, 581, 692, 803, 914],
  ...Array.from({ length: 78 }, (_, i) => 11 + i),
  ...[1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208],
  ...[991, 992, 993, 994, 995, 996, 997, 998],
  ...[4201, 4202, 4203, 4204, 4205, 4206, 4207, 4208],
  ...[5101, 5102, 5103, 5104, 5105, 5106, 5107, 5108],
  ...[201, 202, 203, 204, 205, 206, 207, 208],
]);

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (BANNED.has(s)) { console.error(`SWEEP STOP: seed ${s} is on the coordinator's banned list.`); process.exit(2); }
}
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-drawcap');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'drawcap-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId, side) {
  if (side === 'armed') return policyId === 'leadfeast' ? DC.drawcaplead : DC.drawcapbelong;
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

const BEAT_RE = /feast|not the rot|mountain tonight|starv|hungr|ration|national|regional|died|dead|raid|gorge|exile|wave [345]|table|surplus|rot-pit/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
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

// half-ration instrument (the #340 watch): per-day {halfRation} from the
// village meal's own narration. Read-only wrap.
const HALF_RATION_RE = /Half ration/;
function attachMeals(Game, t) {
  t.meals = {};
  try {
    if (typeof Game.villageMeal !== 'function') return;
    const orig = Game.villageMeal;
    Game.villageMeal = function () {
      const beats = [];
      const oSay = this.say;
      this.say = function (msg) { try { beats.push(String(msg && (msg.text || msg.msg || msg.message) || msg || '')); } catch (e) {} return oSay.apply(this, arguments); };
      let out;
      try { out = orig.apply(this, arguments); }
      catch (e) { this.say = oSay; throw e; }
      this.say = oSay;
      try { t.meals[gday(Game)] = { halfRation: HALF_RATION_RE.test(beats.join('\n')) }; } catch (e) {}
      return out;
    };
  } catch (e) {}
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.DRAWCAP = '1'; else delete process.env.DRAWCAP;
    const { Game } = await loadGame({ seed: 4101, mode: `drawcap-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    const base = policyFor('belongfeast', side);
    let runCtx = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    if (side === 'armed') {
      check(`${side}: layer-live markers honest`,
        base.id === 'drawcapbelong' && runCtx && Array.isArray(runCtx._dcFeastEvents),
        `id=${base.id}`);
    } else {
      check(`${side}: control is the bare base policy`,
        base.id === 'belongfeast' && !(runCtx && runCtx._dcFeastEvents),
        `id=${base.id}`);
    }
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  process.env.DRAWCAP = '1';
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  // r27 rule: bit-identical reruns before trusting comparisons.
  process.env.DRAWCAP = '1';
  for (const seed of [4101, 4102]) {
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed, mode: `drawcap-det` });
      await setupGame(Game);
      const base = policyFor('leadfeast', 'armed');
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
    console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate (armed s${seed}): 40d rerun byte-identical — n=${runs[0].length}/${runs[1].length}`);
    if (!same) { console.error('DET-GATE FAILED'); process.exit(3); }
  }
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.DRAWCAP = '1'; else delete process.env.DRAWCAP;
  const base = policyFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `drawcap-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, villagerDays: 0 };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const hashes = [];
  const beats = { beats: [] };
  const rot = {};
  const meals = {};
  attachBeats(Game, beats);
  attachRot(Game, rot);
  attachMeals(Game, meals);
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
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  let starvation = 0, dehydration = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (k === 'starvation') starvation++;
      if (/dehydrat|thirst/i.test(k)) dehydration++;
    }
  } catch (e) {}
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  let hungryDays = 0;
  try { hungryDays = ((Game.state.village || {}).hungryDays || 0); } catch (e) {}
  const halfRationDays = Object.values(meals.meals || {}).filter(m => m && m.halfRation).length;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, starvation, dehydration,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    exiled: hist.exiled ? 1 : 0,
    villagerDays: hist.villagerDays,
    freshRotKcal: rot.freshRotKcal || 0, freshRotItems: rot.freshRotItems || 0,
    hungryDays, halfRationDays,
    halfRationRate: hist.villagerDays ? +(halfRationDays / Math.max(1, result.gameDays)).toFixed(4) : 0,
    dcAid: (runCtx && runCtx.osAid) || 0,
    dcFeasts: (runCtx && runCtx.osFeasts) || 0,
    dcAidKcal: (runCtx && runCtx.osAidKcal) || 0,
    dcFeastKcal: (runCtx && runCtx.osFeastKcal) || 0,
    dcGateHeld: (runCtx && runCtx.osGateHeld) || 0,
    dcCapDays: (runCtx && runCtx.osCapDays) || 0,
    dcCapHeld: (runCtx && runCtx.osCapHeld) || 0,
    dcFeastEvents: ((runCtx && runCtx._dcFeastEvents) || []).slice(-40),
    hashes,
  };
  // Numeric keys the coordinator's telemetry-check reads: national,
  // table, wins, exiled — 0/1.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} nat=${out.national} wave=${out.maxWave} table=${out.table} rot=${Math.round(out.freshRotKcal / 1000)}k aid=${out.dcAid} feasts=${out.dcFeasts} capHeld=${out.dcCapHeld} halfr=${out.halfRationDays}`);
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
  delete process.env.DRAWCAP;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== drawcap sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
    const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
    const starv = sum('starvation');
    console.log(`${side}: n=${n} starvation=${starv} (PRIMARY, armed<=control) ` +
      `starv/vday=${(starv / Math.max(1, vd) * 1000).toFixed(2)}/1000 ` +
      `national=${sum('national')}/${n} medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `freshRot=${Math.round(rot / 1000)}k (${(rot / Math.max(1, vd)).toFixed(0)}/vday, CO-PRIMARY armed<=0.75x) ` +
      `table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} ` +
      `wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} dehydr=${sum('dehydration')} ` +
      `halfr=${sum('halfRationDays')}d ` +
      `aid=${sum('dcAid')} feasts=${sum('dcFeasts')} gates=${sum('dcGateHeld')} capDays=${sum('dcCapDays')} capHeld=${sum('dcCapHeld')}`);
  }
  // death-cause shares per side
  for (const side of ['control', 'armed']) {
    const agg = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths || {})) agg[k] = (agg[k] || 0) + v;
    console.log(`${side} death causes: ` + Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
  }
  // per-policy starvation (road concentration check)
  for (const policyId of POLICIES) {
    const c = by('control').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    const a = by('armed').filter(r => r.policyId === policyId).reduce((a, r) => a + r.starvation, 0);
    console.log(`starvation ${policyId}: control=${c} armed=${a}`);
  }
  // per-seed starvation deltas (paired) — heterogeneity lens: max <= +3
  const deltas = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) deltas.push({ seed: r.seed, policyId: r.policyId, d: r.starvation - c.starvation });
  }
  console.log('paired starvation deltas (armed-control): ' +
    deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
  console.log('max paired delta: ' + (deltas.length ? Math.max(...deltas.map(x => x.d)) : 'n/a'));
  // half-ration rates
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const hr = rs.reduce((a, r) => a + r.halfRationDays, 0);
    const gd = rs.reduce((a, r) => a + r.gameDays, 0);
    console.log(`${side} half-ration: ${hr}d / ${gd} game-days = ${(hr / Math.max(1, gd)).toFixed(4)}/day`);
  }
  // byte-identical pair check (vacuity detector)
  let identical = 0;
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && r.hashes.length === c.hashes.length && r.hashes.every((h, i) => h === c.hashes[i])) identical++;
  }
  console.log(`byte-identical armed/control pairs: ${identical}/${by('armed').length}`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
