#!/usr/bin/env node
// sweep-seatdrive-20261015.js — the seat-driver sweep
// (flesh-out loop ARM 3, 2026-10-15, scale-onramp axis, sim-seatdrive).
//
// 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247 — never
// inherit a baseline).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   control: seatdrive's leadseat/belongseat (tribfloor base -> withWinDefer
//            -> withSeatDrive) with SEATDRIVE unset + WINPURSUIT=1 +
//            WINDEFER=1 — the current best, provably inert per wincensus.
//   armed:   the SAME objects + SEATDRIVE=1.
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-15/sim-seatdrive.md):
//   PRIMARY: sittings armed >= control+1 (control expected 0).
//   CO-PRIMARY: wins armed >= control+1.
//   GUARDRAILS: national >= control-2/16; median survival >= control-10d
//     (per-seed matched on NON-WINNING runs — pre-registered); no new
//     death mode at n>=3.
// Per-seed JSONs carry numeric national, table, wins, exiled, sittings
// for the coordinator's telemetry-check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-seatdrive-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-seatdrive-20261015.js
// Targeted re-runs: SEEDS="77,88" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [11, 22, 33, 44, 55, 66, 77, 88]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-seatdrive');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'seatdrive-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same policy objects — SEATDRIVE is the only switch
// (the tribfloor composition pattern).
function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer (sim-findings #303 lesson — fixed caps bias
// against late-game events). Keyed on table/seat/scale/death language for
// the SENSE-TESTING read.
const BEAT_RE = /table|seat|ring of pale|path of|defer|overtime|won|win |died|dead|starv|national|regional|exile|crisis|wave [345]|ascend|treaty/i;
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

function seatDetail(Game) {
  try {
    const d = (Game.deedState ? Game.deedState() : {}) || {};
    const faced = d.wavesFaced || {};
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++; else if (w === 4) w4++; else if (w === 5) w5++;
    }
    return { w1, w2, w3, w4, w5, contestsN: d.contestsSurvived | 0 };
  } catch (e) { return {}; }
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const side of ['control', 'armed']) {
    process.env.WINPURSUIT = '1';
    process.env.WINDEFER = '1';
    if (side === 'armed') process.env.SEATDRIVE = '1'; else delete process.env.SEATDRIVE;
    const { Game } = await loadGame({ seed: 11, mode: `seatdrive-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let ctxLive = null, seatLive = null, deferLive = null;
    const base = policyFor('belongfeast');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      ctxLive = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${side}: layer-live markers honest`, seatLive === (side === 'armed') && deferLive === true,
      `seat=${seatLive} defer=${deferLive}`);
    check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
  }
  delete process.env.SEATDRIVE;
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  if (armed) process.env.SEATDRIVE = '1'; else delete process.env.SEATDRIVE;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `seatdrive-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
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
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== armed || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const decisions = ((runCtx && runCtx._windefer && runCtx._windefer.decisions) || []).slice();
  const holds = decisions.filter(d => d.hold).length;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave: result.maxWaveUnlocked || 1, wave45: (result.maxWaveUnlocked || 1) >= 4 ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    // seatdrive counters
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    seatAttempts: (runCtx && runCtx.sdSeatAttempts) | 0,
    seatFailed: (runCtx && runCtx.sdSeatFailed) | 0,
    guardRefused: (runCtx && runCtx.sdGuardRefused) | 0,
    previewSeen: (runCtx && runCtx.sdPreviewSeen) | 0,
    seatDay: (runCtx && runCtx.sdSeatDay) || null,
    seatKind: (runCtx && runCtx.sdSeatKind) || null,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    seatDetail: seatDetail(Game),
    holds, decisions,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, sittings — all 0/1 except sittings (count).
  // gameDays is the survival day.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} sits=${out.sittings} wins=${out.wins} answers=${out.tableAnswers} holds=${holds} guardRef=${out.guardRefused} exiled=${out.exiled}`);
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
  delete process.env.SEATDRIVE;

  // ---- summary ----
  const by = (side) => recs.filter(r => r.side === side);
  console.log('\n== seatdrive sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`${side}: n=${n} sittings=${sum('sittings')} wins=${sum('wins')} national=${sum('national')}/16 ` +
      `table=${sum('table')}/16 wave4=${sum('wave45')}/16 exiled=${sum('exiled')}/16 ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `answers=${sum('tableAnswers')} holds=${sum('holds')} guardRef=${sum('guardRefused')}`);
  }
  // Matched median survival on NON-WINNING runs (pre-registered metric).
  const pairs = [];
  for (const r of by('armed')) {
    const c = recs.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
    if (c && !r.wins && !c.wins) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays });
  }
  console.log(`matched non-winning pairs: n=${pairs.length} ` +
    `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d ` +
    `control=${median(pairs.map(p => p.control)).toFixed(1)}d`);
  // Death-mode shares both sides.
  for (const side of ['control', 'armed']) {
    const tally = {};
    for (const r of by(side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
  }
  // PRIMARY / CO-PRIMARY / guardrail verdict lines (numbers; the evidence
  // file records the binding verdict).
  const A = by('armed'), C = by('control');
  const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
  console.log(`PRIMARY sittings: armed=${sum(A, 'sittings')} control=${sum(C, 'sittings')} (GO needs armed >= control+1)`);
  console.log(`CO-PRIMARY wins: armed=${sum(A, 'wins')} control=${sum(C, 'wins')} (GO needs armed >= control+1)`);
  console.log(`guardrail national: armed=${sum(A, 'national')} control=${sum(C, 'national')} (needs >= control-2)`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
