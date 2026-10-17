#!/usr/bin/env node
// scripts/sweep-wallcensus-20261017.js — WALL-STATE CENSUS on current master
// (flesh-out loop B, ARM sim-wallcensus-b, 2026-10-17, food-economy axis).
//
// WHY: Steve's 2026-10-16 root-cause ruling 0152a2ce closed the pantry
// granularity leak (all external deposits split to <=500-kcal pieces) AFTER
// the last pure food-economy wall census; crisis-tier fix and ledger-reset
// verify also landed since. This is the post-ruling census.
//
// 8 FRESH seeds [4201-4208] x {leadcourt, belongseek} = 16 runs, 180d
// death-aware, identical-seed lead/belong pairs. Base courtship policies
// ONLY (no policy layers).
//
// SUBSTRATE (asserted up front):
//   FEASTSCALE_R13=1
//   SEATDRIVE='0' EXPLICIT opt-out (unset now means driver ON after c004b9dd
//   — this census pins the driver OFF to measure the pre-seat substrate).
// No control/arm split: this is a census, not a lever.
//
// Per-seed JSONs carry EXACT numeric keys national, table, wins, exiled
// (schema-drift LOUD class: past sweeps emitted everTable or won and broke
// the coordinator's telemetry check). Wave keys: maxWave, wave4, wave5
// (0/1), wave4Day, wave5Day. Aid-channel instrument block "aid" + "links"
// + "trigger" feeds sim-aidchannel-b's analyzer (ARM 2 reuses these runs).
//
// Crumb instrument: wraps Game.depositPantryPieces (the 0152a2ce choke
// point) read-only; any deposit with pieceKcal > 500 is a violation.
// Records deposit count, max piece, violations, plus daily pantry max
// kcalEach sample. Instrument errors are COUNTED (t.errors) and reported —
// 0 instrument errors is a census completion gate.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-wallcensus-20261017.js
// Targeted re-runs: SEEDS="4201,4202" ONLY="leadcourt" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-wallcensus-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT (unset means driver ON post-c004b9dd)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [4201, 4202, 4203, 4204, 4205, 4206, 4207, 4208]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const POLICIES = { leadcourt, belongseek };
const ROAD_IDS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => POLICIES[s])
  : ['leadcourt', 'belongseek'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-wallcensus-b');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'wallcensus-b-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const pantryKcal = (Game) => {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
};
const pantryMaxPiece = (Game) => {
  try {
    const p = (Game.state.village || {}).pantry || [];
    let m = 0;
    for (const i of p) m = Math.max(m, +i.kcalEach || 0);
    return m;
  } catch (e) { return 0; }
};

// ---------- read-only instrument stack (errors counted, never silent) ----------
const BEAT_RE = /starv|hunger|thirst|dehydrat|water|feast|tend|aid|grain to|pantry|table |national|wave [45]|won|win |died|dead|exile|refus|mourning|rot|spoil/i;
function attachInstruments(Game) {
  const t = { beats: [], tendFires: [], linkFirst: {}, errors: 0 };
  const err = (where) => { t.errors++; if (process.env.VERBOSE_ERR) console.error('instrument error:', where); };
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) { err('beats'); }
  };
  try {
    const origSay = Game.say ? Game.say.bind(Game) : null;
    const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
    if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
  } catch (e) { err('say-wrap'); }
  // tendLink — aid verb fires (read-only: calls through, records result).
  try {
    const origTend = Game.tendLink ? Game.tendLink.bind(Game) : null;
    if (origTend) {
      Game.tendLink = function (linkId) {
        const d = gday(Game);
        let sub = null, paid = 0;
        try {
          const l = (Game.hierarchyState() || []).find(x => x && x.id === linkId);
          sub = l ? String(l.subordinate || '?') : null;
        } catch (e) { err('tend-pre'); }
        try { paid = origTend(linkId) | 0; } catch (e) { err('tend-call'); }
        t.tendFires.push({ day: d, linkId: String(linkId), sub, paid });
        return paid;
      };
    }
  } catch (e) { err('tend-wrap'); }
  // depositPantryPieces — the 0152a2ce choke point (read-only).
  t.depositCalls = [];
  try {
    const origDep = Game.depositPantryPieces ? Game.depositPantryPieces.bind(Game) : null;
    if (origDep) {
      Game.depositPantryPieces = function (v, src, pieceKcal) {
        try { t.depositCalls.push({ day: gday(Game), pieceKcal: +pieceKcal || 0 }); }
        catch (e) { err('dep-log'); }
        return origDep(v, src, pieceKcal);
      };
    } else { t.depositCalls = null; }
  } catch (e) { err('dep-wrap'); }
  // daily sample: primary-haven links + fresh-days trigger.
  t.sample = (linkSeen, trig) => {
    try {
      let links = [];
      try { links = Game.hierarchyState() || []; } catch (e) { err('links-read'); }
      for (const l of links) {
        if (!l || l.primary !== 'haven' || l.status !== 'active') continue;
        linkSeen.count++;
        const id = String(l.id);
        if (!t.linkFirst[id]) t.linkFirst[id] = { sub: String(l.subordinate || '?'), day: gday(Game), trust0: l.trust | 0 };
      }
      linkSeen.activeDays++;
    } catch (e) { err('sample-links'); }
    try {
      const fd = Game.pantryFreshDays ? (+Game.pantryFreshDays() || 0) : 0;
      if (fd > trig.max) trig.max = fd;
      if (fd > 4) {
        trig.days++;
        if (linkSeen.count === 0) trig.daysNoLink++; else trig.daysWithLink++;
      }
    } catch (e) { err('sample-fresh'); }
  };
  return t;
}

function freshDays(Game) {
  try { return +(Game.pantryFreshDays ? Game.pantryFreshDays() : 0) || 0; }
  catch (e) { return 0; }
}

// ---------- one census run ----------
// writeJson: false for det-gate replays (no evidence pollution).
async function runCensus(seed, policyId, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const writeJson = opts.writeJson !== false;
  const policy = POLICIES[policyId];
  if (!policy) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: `wallcensus-b-${policyId}` });
  await setupGame(Game);
  const inst = attachInstruments(Game);
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const waveHist = { dailyMax: 1, wave4Day: null, wave5Day: null };
  const hashes = [];
  const linkSeen = { count: 0, activeDays: 0 };
  const trig = { days: 0, daysNoLink: 0, daysWithLink: 0, max: 0 };
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      try {
        const ts = G.tableState ? G.tableState() : null;
        if (ts && (ts.staged || ts.seated || ts.done)) hist.everTable = true;
      } catch (e) {}
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      try {
        const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1;
        if (w > waveHist.dailyMax) {
          waveHist.dailyMax = w;
          if (w >= 4 && waveHist.wave4Day == null) waveHist.wave4Day = gday(G);
          if (w >= 5 && waveHist.wave5Day == null) waveHist.wave5Day = gday(G);
        }
      } catch (e) {}
      inst.sample(linkSeen, trig);
    } catch (e) { inst.errors++; }
    let r;
    if (oDaily) r = oDaily(G, ctx);
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 30 }); });
  policy.daily = oDaily; // restore (same process runs many seeds)
  // deaths
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const starveDeaths = Object.entries(deaths).filter(([k]) => /starv/i.test(k)).reduce((a, [, v]) => a + v, 0);
  const thirstDeaths = Object.entries(deaths).filter(([k]) => /thirst|dehydrat|water/i.test(k)).reduce((a, [, v]) => a + v, 0);
  // crumb: deposit choke-point violations + pantry piece samples
  const depCalls = inst.depositCalls || [];
  const depViol = depCalls.filter(c => c.pieceKcal > 500);
  let pantryMaxPieceEver = 0;
  const harnessMax = (result.maxWaveUnlocked || 1) | 0;
  const waveMax = Math.max(waveHist.dailyMax, harnessMax);
  const tendKcal = inst.tendFires.reduce((a, f) => a + (f.paid || 0), 0);
  const out = {
    seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths, starveDeaths, thirstDeaths,
    // NUMERIC wall keys (schema-drift LOUD class) — 0/1, never booleans.
    maxRank: hist.maxRank | 0, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: waveMax | 0, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    wave4Day: waveHist.wave4Day, wave5Day: waveHist.wave5Day,
    waveSampleNote: harnessMax > waveHist.dailyMax ? 'harness-max ' + harnessMax + ' exceeds daily ' + waveHist.dailyMax + ' (#375 edge)' : 'daily||harness agree',
    exiled: hist.exiled ? 1 : 0,
    crumb: {
      depositCalls: depCalls.length,
      maxDepositPieceKcal: depCalls.reduce((m, c) => Math.max(m, c.pieceKcal), 0),
      violations: depViol.length, // 0 = 0152a2ce holds in-sim
      violationDays: depViol.slice(0, 10).map(c => c.day),
      pantryMaxPieceKcalDaily: pantryMaxPiece(Game),
    },
    aid: {
      tendFires: inst.tendFires.length,
      tendKcal,
      tendSubs: [...new Set(inst.tendFires.map(f => f.sub).filter(Boolean))],
    },
    links: {
      havenPrimaryActiveDays: linkSeen.activeDays,
      havenPrimaryFormed: Object.keys(inst.linkFirst).length,
      formed: Object.entries(inst.linkFirst).map(([id, f]) => ({ id, sub: f.sub, day: f.day, trust0: f.trust0 })),
    },
    trigger: {
      freshDaysGt4Days: trig.days,
      triggerDaysNoLink: trig.daysNoLink,
      triggerDaysWithLink: trig.daysWithLink,
      maxFreshDays: +trig.max.toFixed(1),
    },
    instrumentErrors: inst.errors | 0,
    pantryKcalEnd: Math.round(pantryKcal(Game)),
    hashes,
  };
  if (writeJson) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
    if (inst.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(inst.beats, null, 1));
    }
  }
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} table=${out.table} wins=${out.wins} ex=${out.exiled} tend=${out.aid.tendFires} links=${out.links.havenPrimaryFormed} trig=${out.trigger.freshDaysGt4Days} err=${out.instrumentErrors}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  assertSubstrate();
  const recs = [];
  for (const policyId of ROAD_IDS) {
    for (const seed of SEEDS) {
      recs.push(await runCensus(seed, policyId, { days: EFF_DAYS }));
    }
  }
  console.log('\n== wallcensus-b summary ==');
  for (const policyId of ROAD_IDS) {
    const rs = recs.filter(r => r.policyId === policyId);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const tally = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) tally[k] = (tally[k] || 0) + v;
    console.log(`${policyId}: n=${n} national=${sum('national')}/${n} table=${sum('table')}/${n} wins=${sum('wins')}/${n} ` +
      `wave4=${sum('wave4')}/${n} wave5=${sum('wave5')}/${n} exiled=${sum('exiled')}/${n} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d max=${Math.max(...rs.map(r => r.gameDays))}d ` +
      `starve=${rs.reduce((a, r) => a + r.starveDeaths, 0)} thirst=${rs.reduce((a, r) => a + r.thirstDeaths, 0)} ` +
      `tend=${rs.reduce((a, r) => a + r.aid.tendFires, 0)} links=${rs.reduce((a, r) => a + r.links.havenPrimaryFormed, 0)} ` +
      `crumbViol=${rs.reduce((a, r) => a + r.crumb.violations, 0)} instErr=${rs.reduce((a, r) => a + r.instrumentErrors, 0)}`);
    console.log(`  death modes: ${Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + 'x' + v).join(', ')}`);
  }
}

module.exports = { runCensus, attachInstruments, assertSubstrate, ROAD_IDS, SEEDS };

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}
