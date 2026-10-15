#!/usr/bin/env node
// sweep-wave5reach-20261015.js — the wave-5 reachability sweep
// (flesh-out loop, 2026-10-15, scale-onramp axis, sim-wave5reach).
//
// 8 seeds x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1  SEATDRIVE=1
//   control: SD.leadseat/belongseat (seatdrive stack) + WAVE5REACH unset
//   armed:   the SAME objects + WAVE5REACH=1
//
// Pre-registered GO (binding, MEASUREMENT §14 — see
// evidence/2026-10-15/sim-wave5reach.md):
//   PRIMARY: wave-5 unlocks on NON-WINNING runs, armed >= control + 2.
//   SECONDARY: total wave-5 unlocks armed >= control.
//   GUARDRAILS: wins armed >= 8/16; national armed >= control - 2;
//     no new death mode at n>=3.
//   PILOT GATE: 8 pairs (SEEDS subset) first; kill if wave-5 delta <= 1
//     on non-winning runs.
// Per-seed JSONs carry numeric national, table, wins, exiled, wave5
// for the coordinator's telemetry-check (keys EXACT — the won/wins
// schema-drift trap, twice today).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-wave5reach-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-wave5reach-20261015.js
// Targeted re-runs: SEEDS="121,232" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const W5R = require('./policies/wave5reach');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [121, 232, 343, 454, 565, 676, 787, 898]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-wave5reach');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'wave5reach-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same policy objects — WAVE5REACH is the only switch
// (the seatdrive composition pattern).
function policyFor(policyId) {
  return policyId === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer. Keyed on wave-5/unlock/standing/death language
// for the SENSE-TESTING read (1-2 wave-5 unlock transcripts: earned or cheesy?).
const BEAT_RE = /wave ?5|producers|standing|unlock|readiness|facing|wave ?4|mirror draft|won|win |died|dead|national|exile/i;
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
    process.env.WINPURSUIT = '1';
    process.env.WINDEFER = '1';
    process.env.SEATDRIVE = '1';
    if (side === 'armed') process.env.WAVE5REACH = '1'; else delete process.env.WAVE5REACH;
    const { Game } = await loadGame({ seed: 121, mode: `wave5reach-smoke-${side}`, fullTelemetry: false });
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
    check(`${side}: layer-live markers honest`, w5Live === (side === 'armed') && seatLive === true && deferLive === true,
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
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  process.env.SEATDRIVE = '1';
  if (armed) process.env.WAVE5REACH = '1'; else delete process.env.WAVE5REACH;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `wave5reach-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, w5Live = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
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
  if (w5Live !== armed || seatLive !== true || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  const maxWave = result.maxWaveUnlocked || 1;
  // wave5 unlock day + standing at unlock: the earned-vs-cheesy evidence.
  let wave5Day = null, standingAtW5 = null, facedW4AtW5 = null;
  try {
    const tele = Game.state.telemetry || [];
    for (const ev of tele) {
      if (ev && ev.event === 'wave_unlock' && (ev.wave | 0) === 5) { wave5Day = ev.day != null ? ev.day : gday(Game); break; }
    }
  } catch (e) {}
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave5Day,
    exiled: hist.exiled ? 1 : 0,
    // seatdrive counters
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    seatDay: (runCtx && runCtx.sdSeatDay) || null,
    tableAnswers: (runCtx && runCtx.tableAnswers) || 0,
    guardRefused: (runCtx && runCtx.sdGuardRefused) | 0,
    // wave5reach counters
    w5Hunts: (runCtx && runCtx.w5Hunts) || 0,
    w5HuntLegs: (runCtx && runCtx.w5HuntLegs) || 0,
    w5HuntSteps: (runCtx && runCtx.w5HuntSteps) || 0,
    w5HuntEngaged: (runCtx && runCtx.w5HuntEngaged) || 0,
    w5BloodFights: (runCtx && runCtx.w5BloodFights) || 0,
    w5FacingFights: (runCtx && runCtx.w5FacingFights) || 0,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, wave5 — all 0/1. gameDays is the survival day.
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} w5=${out.wave5} w5day=${out.wave5Day} table=${out.table} sits=${out.sittings} wins=${out.wins} hunts=${out.w5Hunts} engaged=${out.w5HuntEngaged} facingFights=${out.w5FacingFights} exiled=${out.exiled}`);
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
  console.log('\n== wave5reach sweep summary ==');
  for (const side of ['control', 'armed']) {
    const rs = by(side);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`${side}: n=${n} w5=${sum('wave5')}/${n} sittings=${sum('sittings')} wins=${sum('wins')} national=${sum('national')}/${n} ` +
      `table=${sum('table')}/${n} wave4=${sum('wave45')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `hunts=${sum('w5Hunts')} engaged=${sum('w5HuntEngaged')} bloodFights=${sum('w5BloodFights')} facingFights=${sum('w5FacingFights')}`);
  }
  // PRIMARY surface: wave-5 unlocks on NON-WINNING runs.
  const nonWin = by('armed').filter(r => !r.wins);
  const nonWinC = by('control').filter(r => !r.wins);
  const w5nw = (rs) => rs.filter(r => !r.wins && r.wave5).length;
  console.log(`non-winning runs: armed n=${nonWin.length} control n=${nonWinC.length}; ` +
    `wave5 on non-winning: armed=${w5nw(by('armed'))} control=${w5nw(by('control'))}`);
  // Matched median survival on NON-WINNING runs (wintrace confound precedent).
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
}
)().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
