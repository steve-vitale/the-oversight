#!/usr/bin/env node
// sweep-w5reach2-20261015.js — the wave-5 reachability sweep on the
// PRE-SEAT stack (flesh-out loop, 2026-10-15, scale-onramp axis, ARM 1,
// sim-w5reach2).
//
// 8 FRESH seeds [151,262,373,484,595,706,817,928] x {leadfeast,belongfeast}
// x {control, armed}, 180d death-aware, identical seeds both sides. Own
// control in the SAME sweep.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE must be UNSET — fail loudly if set (that would be the
//   win-side stack, not the pre-seat stack the wincensus diagnostic
//   proved inert: 0/16 wins, 15/16 invites, 0 sittings).
//   control: W5R.leadseat/belongseat with WAVE5REACH unset (the seat layer
//     gate-offs to pure delegation when SEATDRIVE is unset)
//   armed:   the SAME objects + WAVE5REACH=1
//
// Wave-5 unlock DATING (finding #360): no engine telemetry event fires on
// wave unlock (wave5Day null on 32/32 prior runs) — this sweep samples
// Game.unlockedWave() DAILY and records the first day it reads 5.
//
// Hunt-liveness tracking: per run, liveDays (huntLive true at the daily
// check) vs busyDays (wave-4 window but tableBusy). The proof's gate-on
// diagnostic showed the landed layer's tableBusy = tableDone||tableWaiting
// strands the hunt while an invitation pends unsat — this sweep quantifies
// the stranding across all 16 armed runs.
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-15/sim-w5reach2.md):
//   PRIMARY: wave-5 unlocks armed >= control + 2 (n=16/side).
//   GUARDRAILS: national >= control - 2; no new death mode at n>=3;
//     wins expected 0 — ANY armed win is reported LOUD.
// Per-seed JSONs carry numeric national, table, wins, exiled, wave5,
// wave5Day for the coordinator's telemetry-check (keys EXACT — the
// won/wins schema-drift trap, twice today).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/sweep-w5reach2-20261015.js
// Targeted re-runs: SEEDS="151,262" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const W5R = require('./policies/wave5reach');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') {
  console.error('SWEEP STOP: SEATDRIVE must be UNSET for the pre-seat substrate.');
  process.exit(2);
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [151, 262, 373, 484, 595, 706, 817, 928]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-w5reach2');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'w5reach2-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same policy objects — WAVE5REACH is the only switch
// (the seatdrive composition pattern; the seat layer gate-offs when
// SEATDRIVE is unset).
function policyFor(policyId) {
  return policyId === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer. Keyed on wave-5/unlock/standing/death language
// for the SENSE-TESTING read (do the counter-learning hunts read as
// sensible villager behavior or robotic farming?).
const BEAT_RE = /wave ?5|producers|standing|unlock|readiness|facing|wave ?4|mirror draft|won|win |died|dead|national|exile|hunt|expedition/i;
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

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.WAVE5REACH = '1'; else delete process.env.WAVE5REACH;
    const { Game } = await loadGame({ seed: 151, mode: `w5reach2-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, w5Live = null, seatLive = null, deferLive = null;
    const base = policyFor('belongfeast');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, w5Live === (side === 'armed') && seatLive === false && deferLive === true,
      `w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.WAVE5REACH;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.WAVE5REACH = '1'; else delete process.env.WAVE5REACH;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `w5reach2-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, w5Live = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  // finding #360: sample unlockedWave() daily — the unlock day is the
  // first day the read hits the new wave.
  const waveTrace = { maxWave: 1, wave4Day: null, wave5Day: null, liveDays: 0, busyDays: 0 };
  const hashes = [];
  const beats = { beats: [] };
  const deathsT = { deaths: [] };
  attachBeats(Game, beats);
  attachDeaths(Game, deathsT);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0;
      if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
      const day = gday(G);
      if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
      if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      if (armed && uw >= 4 && uw < 5) {
        if (W5R.huntLive(G)) waveTrace.liveDays++;
        else {
          let tb = false;
          try { const p2 = G.progState ? G.progState() : {}; tb = !!(p2.tableDone || p2.tableWaiting); } catch (e) {}
          if (tb) waveTrace.busyDays++;
        }
      }
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(Game)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (w5Live !== armed || seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    exiled: hist.exiled ? 1 : 0,
    // wave5reach counters + liveness
    w5Hunts: (runCtx && runCtx.w5Hunts) || 0,
    w5HuntLegs: (runCtx && runCtx.w5HuntLegs) || 0,
    w5HuntSteps: (runCtx && runCtx.w5HuntSteps) || 0,
    w5HuntEngaged: (runCtx && runCtx.w5HuntEngaged) || 0,
    w5BloodFights: (runCtx && runCtx.w5BloodFights) || 0,
    w5FacingFights: (runCtx && runCtx.w5FacingFights) || 0,
    w5LiveDays: waveTrace.liveDays,
    w5BusyDays: waveTrace.busyDays,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, wave5 — all 0/1. gameDays is the survival day.
  // wave5Day is the daily-sampled unlock day (finding #360).
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} w5d=${out.wave5Day} table=${out.table} wins=${out.wins} hunts=${out.w5Hunts} live=${out.w5LiveDays} busy=${out.w5BusyDays} engaged=${out.w5HuntEngaged} exiled=${out.exiled}`);
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

  const recs = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(seed, policyId, side));
      }
    }
  }
  delete process.env.WAVE5REACH;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== w5reach2 sweep summary (pre-seat stack) ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`${side}: n=${n} w5=${sum('wave5')}/${n} wins=${sum('wins')} national=${sum('national')}/${n} ` +
      `table=${sum('table')}/${n} wave4=${sum('wave45')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `hunts=${sum('w5Hunts')} live=${sum('w5LiveDays')} busy=${sum('w5BusyDays')} engaged=${sum('w5HuntEngaged')} bloodFights=${sum('w5BloodFights')} facingFights=${sum('w5FacingFights')}`);
  }
  // PRIMARY surface: wave-5 unlocks, armed vs control (n=16/side).
  const w5a = by('armed').filter(r => r.wave5).length;
  const w5c = by('control').filter(r => r.wave5).length;
  console.log(`PRIMARY wave-5 unlocks: armed=${w5a}/16 control=${w5c}/16 (bar: armed >= control+2)`);
  // wave-5 unlock days (daily-sampled).
  for (const side of ['control', 'armed']) {
    const ds = by(side).filter(r => r.wave5Day != null).map(r => `s${r.seed}:${r.policyId}=d${r.wave5Day}`);
    console.log(`${side} wave-5 unlock days: ${ds.join(' ') || '(none)'}`);
  }
  // LOUD: any win on either side (expected 0 on the pre-seat stack).
  for (const side of ['control', 'armed']) {
    const w = by(side).filter(r => r.wins);
    if (w.length) console.log(`LOUD: ${side} WON ${w.length} run(s): ${w.map(r => `s${r.seed}:${r.policyId}`).join(' ')} — changes the interpretation`);
  }
  // Death-mode shares both sides (guardrail: no new death mode).
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
}
)().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
