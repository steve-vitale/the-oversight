#!/usr/bin/env node
// scripts/sweep-floorday3-20261016.js — floor-isolation sweep (sim-floorday3-b,
// 2026-10-16, food-economy axis — finding #200 named next).
//
// The SAME layer runs on both sides; only the floor constant differs:
//   control: FLOORDAY3 unset (default) -> 2-day floor (the killed arm's exposure, verbatim)
//   armed:   FLOORDAY3=1               -> 3-day floor
//
// 8 FRESH seeds x {leadfeast, belongfeast} x {control, armed} = 32 runs,
// 180d death-aware, identical seeds both sides. Own control in the SAME
// sweep (#247 — never inherit a baseline).
//
// Substrate (asserted up front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit
// (pre-seat). Base policies: floorday3lead / floorday3belong (the
// floorday3 layer over leadfeast / belongfeast).
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-16/sim-floorday3-b.md):
//   PRIMARY: starvation deaths (absolute), armed <= control.
//   GUARDRAILS: national >= control-2; median survival within 10d of
//     control; fresh-rot kcal <= 1.15x control (rate-normalized per
//     villager-day if longevity differs); no new death mode.
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (the schema-drift LOUD class).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 SMOKE=1 node scripts/sweep-floorday3-20261016.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-floorday3-20261016.js
// Targeted re-runs: SEEDS="201,202" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
let FD3 = null;
try { FD3 = require('./policies/floorday3'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: floorday3 layer deleted per kill protocol (invisible effect, 2026-10-16)');
    process.exit(0);
  }
  throw e;
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat substrate).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [201, 202, 203, 204, 205, 206, 207, 208]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-floorday3');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'floorday3-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? FD3.floorday3lead : FD3.floorday3belong;
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

const BEAT_RE = /feast|not the rot|mountain tonight|starv|hungr|national|regional|died|dead|raid|gorge|exile|wave [345]|table/i;
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

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.FLOORDAY3 = '1'; else delete process.env.FLOORDAY3;
    const { Game } = await loadGame({ seed: 201, mode: `floorday3-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    const base = policyFor('belongfeast');
    let runCtx = null, floorN = null;
    const pol = Object.assign({}, base);
    const oSetup = base.setup;
    pol.setup = (G, ctx) => { runCtx = ctx; floorN = FD3.floorDaysN(); if (oSetup) return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, pol, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`,
      base.id === 'floorday3belong' && runCtx && Array.isArray(runCtx._fd3FeastEvents) && floorN === (side === 'armed' ? 3 : 2),
      `id=${base.id} floor=${floorN}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }
  delete process.env.FLOORDAY3;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function detGate() {
  // r27 rule: bit-identical reruns before trusting comparisons.
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.FLOORDAY3 = '1'; else delete process.env.FLOORDAY3;
    const runs = [];
    for (let rep = 0; rep < 2; rep++) {
      const { Game } = await loadGame({ seed: 201, mode: `floorday3-det-${side}` });
      await setupGame(Game);
      const base = policyFor('leadfeast');
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
  delete process.env.FLOORDAY3;
  console.log('DET gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.FLOORDAY3 = '1'; else delete process.env.FLOORDAY3;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `floorday3-${side}`, fullTelemetry: false });
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
  attachBeats(Game, beats);
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
  let starvation = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (k === 'starvation') starvation++;
    }
  } catch (e) {}
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  let hungryDays = 0;
  try { hungryDays = ((Game.state.village || {}).hungryDays || 0); } catch (e) {}
  const out = {
    seed, policyId, side, floorDays: armed ? 3 : 2,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, starvation,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    exiled: hist.exiled ? 1 : 0,
    villagerDays: hist.villagerDays,
    freshRotKcal: rot.freshRotKcal || 0, freshRotItems: rot.freshRotItems || 0,
    hungryDays,
    fd3Aid: (runCtx && runCtx.fd3Aid) || 0,
    fd3Feasts: (runCtx && runCtx.fd3Feasts) || 0,
    fd3AidKcal: (runCtx && runCtx.fd3AidKcal) || 0,
    fd3FeastKcal: (runCtx && runCtx.fd3FeastKcal) || 0,
    fd3GateHeld: (runCtx && runCtx.fd3GateHeld) || 0,
    fd3FeastEvents: ((runCtx && runCtx._fd3FeastEvents) || []).slice(-40),
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
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} end=${out.endReason} starv=${out.starvation} nat=${out.national} wave=${out.maxWave} table=${out.table} rot=${Math.round(out.freshRotKcal / 1000)}k aid=${out.fd3Aid} feasts=${out.fd3Feasts} gates=${out.fd3GateHeld}`);
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
  delete process.env.FLOORDAY3;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== floorday3 sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const vd = rs.reduce((a, r) => a + (r.villagerDays || 0), 0);
    const rot = rs.reduce((a, r) => a + (r.freshRotKcal || 0), 0);
    console.log(`${side}: n=${n} starvation=${sum('starvation')} (PRIMARY) national=${sum('national')}/${n} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `freshRot=${Math.round(rot / 1000)}k (${(rot / Math.max(1, vd)).toFixed(0)}/vday) ` +
      `table=${sum('table')}/${n} wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} ` +
      `wins=${sum('wins')}/${n} exiled=${sum('exiled')}/${n} ` +
      `aid=${sum('fd3Aid')} feasts=${sum('fd3Feasts')} gates=${sum('fd3GateHeld')}`);
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
  // per-seed starvation deltas (paired)
  const deltas = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c) deltas.push({ seed: r.seed, policyId: r.policyId, d: r.starvation - c.starvation });
  }
  console.log('paired starvation deltas (armed-control): ' +
    deltas.map(x => `${x.policyId}/s${x.seed}:${x.d >= 0 ? '+' : ''}${x.d}`).join(' '));
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(2); });
