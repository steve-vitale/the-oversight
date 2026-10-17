#!/usr/bin/env node
// sweep-wincensus-c-20261017.js — the win-side-stack FOURTH fresh-seed confirm
// (flesh-out loop DIAGNOSTIC, 2026-10-17, scale-onramp axis, sim-wincensus-c:
// confirm the wins hold on FRESH seeds before any rotation resumes).
//
// 2 fresh seed sets x 8 seeds x {leadfeast, belongfeast} x {control, armed},
// 180d death-aware, identical seeds both sides, own in-sweep control per set.
// (#247 — never inherit a baseline.)
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1  ALLOWGATE2 unset (landed layer default-OFF)
//   control: SEATDRIVE=0 EXPLICIT (default-ON since 2026-10-16 sim-seatdefault;
//            deleting the var no longer opts out — the pre-seat courtship substrate)
//   armed:   SEATDRIVE=1 — the full win-side stack.
// Per-seed JSONs carry numeric national, table, wins, exiled, sittings,
// gameDays + set (A/B) for the coordinator's telemetry-check (keys EXACT —
// the won/wins schema-drift trap, three times now).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/sweep-wincensus-c-20261017.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/sweep-wincensus-c-20261017.js
// Targeted re-runs: SEEDS="51977,610043" SET="A" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SETS = {
  A: [51977, 610043, 730111, 840217, 950303, 1060511, 1170103, 1280207],
  B: [1390319, 1500427, 1610521, 1720609, 1830703, 1940809, 2050913, 2161013],
};

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.ALLOWGATE2 === '1') {
  console.error('SWEEP STOP: ALLOWGATE2=1 is set — the landed allowgate2 layer is default-OFF and stays OFF for this replicate. Substrate moved; STOP, do not rescore, report to coordinator.');
  process.exit(2);
}

const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-wincensus-c');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-17', 'wincensus-c-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Startup: fresh-seed collision assertion. Snapshot pre-existing *-s<seed>.json
// filenames BEFORE this run writes anything; none of this run's seed literals
// may appear there (the winconfirm3 collision discipline).
function existingSeedLiterals() {
  const out = new Set();
  const ev = path.join(__dirname, '..', 'evidence');
  const walk = (dir) => {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const m = /-s(\d+)\.json$/.exec(e.name);
        if (m) out.add(m[1]);
      }
    }
  };
  walk(ev);
  return out;
}

// Both sides share the same policy objects — SEATDRIVE is the only switch.
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
    process.env.SEATDRIVE = side === 'armed' ? '1' : '0'; // EXPLICIT both sides
    const { Game } = await loadGame({ seed: 51977, mode: `wincensus-c-smoke-${side}`, fullTelemetry: false });
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
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); process.exit(3); }
  console.log('SMOKE gate green.');
}

async function oneRun(setName, seed, policyId, side) {
  const armed = side === 'armed';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  process.env.SEATDRIVE = armed ? '1' : '0'; // EXPLICIT both sides (default-ON: unset would drive)
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `wincensus-c-${side}`, fullTelemetry: false });
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
    seed, set: setName, policyId, side,
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
  console.log(`  [set${setName} ${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} sits=${out.sittings} wins=${out.wins} answers=${out.tableAnswers} holds=${holds} guardRef=${out.guardRefused} exiled=${out.exiled}`);
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

  // Fresh-seed collision assertion (before ANY run writes anything).
  const seedList = [];
  let setFilter = process.env.SET || null;
  for (const [name, seeds] of Object.entries(SETS)) {
    if (setFilter && name !== setFilter) continue;
    if (process.env.SEEDS) {
      const want = new Set(process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)));
      for (const sd of seeds) if (want.has(sd)) seedList.push({ set: name, seed: sd });
    } else {
      for (const sd of seeds) seedList.push({ set: name, seed: sd });
    }
  }
  const pre = existingSeedLiterals();
  const collisions = seedList.filter(({ seed }) => pre.has(String(seed)));
  if (collisions.length) {
    console.error('SWEEP STOP: seed literals already exist in evidence/ filenames: ' +
      collisions.map(c => `s${c.seed}`).join(', ') + ' — seeds are not fresh. STOP.');
    process.exit(2);
  }
  console.log(`seed collision check: ${seedList.length} seeds clean.`);

  if (process.env.SMOKE === '1') { await smokeGate(); }

  const recs = [];
  for (const { set, seed } of seedList) {
    for (const policyId of POLICIES) {
      for (const side of ['control', 'armed']) {
        if (!match(policyId, side)) continue;
        recs.push(await oneRun(set, seed, policyId, side));
      }
    }
  }

  // ---- per-set summary ----
  const sum = (rs, f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
  console.log('\n== wincensus-c sweep summary (per set) ==');
  for (const setName of Object.keys(SETS)) {
    const inSet = recs.filter(r => r.set === setName);
    if (!inSet.length) continue;
    for (const side of ['control', 'armed']) {
      const rs = inSet.filter(r => r.side === side);
      const n = rs.length;
      console.log(`set${setName} ${side}: n=${n} sittings=${sum(rs, 'sittings')} wins=${sum(rs, 'wins')} national=${sum(rs, 'national')}/${n} ` +
        `table=${sum(rs, 'table')}/${n} wave4=${sum(rs, 'wave45')}/${n} exiled=${sum(rs, 'exiled')}/${n} ` +
        `medianSurv(all)=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
        `answers=${sum(rs, 'tableAnswers')} holds=${sum(rs, 'holds')} guardRef=${sum(rs, 'guardRefused')}`);
    }
    // PRIMARY / CO-PRIMARY / guardrail verdict lines per set (numbers; the
    // evidence file records the binding verdict).
    const A = inSet.filter(r => r.side === 'armed'), C = inSet.filter(r => r.side === 'control');
    console.log(`set${setName} PRIMARY wins: armed=${sum(A, 'wins')}/${A.length} control=${sum(C, 'wins')}/${C.length} (GO needs armed >= 8/${A.length})`);
    console.log(`set${setName} CO-PRIMARY: control wins=${sum(C, 'wins')} (expect 0 — inert stays inert)`);
    console.log(`set${setName} guardrails: national armed=${sum(A, 'national')}/${A.length} (bar >= 4), table armed=${sum(A, 'table')}/${A.length} (bar >= 12), exiled A=${sum(A, 'exiled')} C=${sum(C, 'exiled')} (bar 0)`);
    // Matched non-winning pairs + successor metric (control survives >= armed seatDay).
    const pairs = [];
    let successor = 0, successorDenom = 0;
    for (const r of A) {
      const c = inSet.find(x => x.side === 'control' && x.policyId === r.policyId && x.seed === r.seed);
      if (c && !r.wins && !c.wins) pairs.push({ seed: r.seed, policyId: r.policyId, armed: r.gameDays, control: c.gameDays });
      if (c && r.wins && r.seatDay) { successorDenom++; if (c.gameDays >= r.seatDay) successor++; }
    }
    console.log(`set${setName} matched non-winning pairs: n=${pairs.length} ` +
      (pairs.length ? `medianSurv armed=${median(pairs.map(p => p.armed)).toFixed(1)}d control=${median(pairs.map(p => p.control)).toFixed(1)}d` : '(vacuous — see successor metric)') +
      `; successor control-survived>=armed-seatDay: ${successor}/${successorDenom} (bar >= 14/${A.length})`);
  }
  // Death-mode shares per set, both sides (for the "no new death mode" guardrail).
  for (const setName of Object.keys(SETS)) {
    const inSet = recs.filter(r => r.set === setName);
    if (!inSet.length) continue;
    for (const side of ['control', 'armed']) {
      const tally = {};
      for (const r of inSet.filter(r => r.side === side)) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
      console.log(`set${setName} ${side} death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + 'x' + v).join(', ') || '(none recorded)'}`);
    }
  }
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
