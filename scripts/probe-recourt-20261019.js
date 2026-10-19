#!/usr/bin/env node
// probe-recourt-20261019.js — re-court DEATH-MODE diagnostic instrument
// (flesh-out loop arm sim-recourt, run fleshout-20261019T2115Z, axis
// scale-onramp).
//
// Diagnostic arm: the unexplained half of the sim-seasonblock DIAG (landed
// 18f9f8440). Seasonblock named the SEASONING blocker per bond on the 3
// stall seeds (64201, 64202, 64207, belongfeast) with day-exact evidence;
// what it did NOT answer is why the runs/villages died when they did —
// s64201 d86 with the re-court bond at age 29 (one day short of the age
// bar), s64202 d83 at age 17, s64207 d149-150 (bond snapped d149 via the
// neglect snap, village died d150). This arm names, per re-court bond, the
// death mode and the day-exact mechanism: the neglect snap, the tribute
// ratchet, window combat, starvation (the scattering), extinction, the
// no-successor death — or something else.
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. All new reads are PURE engine calls (no state writes, no RNG
// draws): pantry, hungryDays/scattered/extinct flags, roster-living count,
// scholar-alive, the full death-tele capture (vendored installDeathCapture
// from probe-seasonblock — identical by construction), flow wraps (FG),
// and a filtered Game.say log (fiction around each death — SENSE-TESTING
// LAW). The DET gate pins instrument-on vs instrument-off byte-identical.
//
// SUBSTRATE (the feastgap/seasonblock substrate, verbatim):
//   withSeatDrive(withWinDefer(withReposition(TF base))) on belongfeast
//   tribfloor base. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
//   RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
//   KILLDISC=1. (SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION
//   unset -> inert; VETREL unset -> companion-veteran channel OFF;
//   KILLDISC=1 -> read-only kill census installed.)
//
// Seeds: 64201, 64202, 64207 (the stall seeds) x belongfeast. Horizon: 180d
// death-aware.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/probe-recourt-20261019.js
//   SMOKE=1 ...      # short smoke: village series live on 1 seed
//   DET=1 ...        # det-gate: instrument-on vs instrument-off byte-identical (3 seeds x 60d)
//   ONLY=belongfeast ... # policy filter (parallel batches)
//   SEEDS="64201,64207" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const FG = require('./probe-feastgap-20261019');
const SB = require('./probe-seasonblock-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — the feastgap substrate, verbatim.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (recourt substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1 (pre-seat substrate).'); process.exit(2); }
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1 (no-vetrel divergence surface).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64207]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-recourt');
const isBare = () => process.env.RECOURT_BARE === '1';

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// ---------------------------------------------------------------------------
// VILLAGE SNAP — per-day death-relevant state. PURE reads.
function villageSnap(G) {
  const day = scholarDay(G);
  const s = { d: day };
  try { s.pantry = Math.round(G.pantryKcalLive ? G.pantryKcalLive(G.state.village) : -1); } catch (e) { s.pantry = -1; }
  try {
    const v = G.state.village || {};
    s.hungryDays = (v.hungryDays | 0) || 0;
    s.scattered = !!v.scattered;
    s.extinct = !!v.extinct;
  } catch (e) { s.hungryDays = -1; s.scattered = false; s.extinct = false; }
  try {
    const v = G.state.village || {};
    const roster = v.roster || [];
    const rc = v.rosterChars || {};
    let living = 0;
    for (const id of roster) { const c = rc[id]; if (c && c.alive !== false) living++; }
    s.roster = roster.length; s.living = living;
  } catch (e) { s.roster = -1; s.living = -1; }
  try { s.scholarAlive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  try { s.scholarDead = !!(G.state && G.state.scholar && G.state.scholar.dead); } catch (e) { s.scholarDead = false; }
  try { s.vid = String(G.villagerId); } catch (e) { s.vid = '?'; }
  try { const pg = G.progState ? G.progState() : null; s.hungryStreak = (pg && (pg.hungryStreak | 0)) || 0; } catch (e) { s.hungryStreak = -1; }
  try { s.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { s.uw = -1; }
  return s;
}

// ---------------------------------------------------------------------------
// SAY-LOG CAPTURE — the fiction around each death (SENSE-TESTING LAW).
// Filtered to death-relevant beats only; call-through wrap, no state
// writes, no RNG draws.
const SAY_RES = [
  // village-death lines (the three village-lost paths, engine-verbatim)
  /scattering/, /nobody is left/, /no one is left to pick up/, /not scattered, not gone/,
  // starvation / famine
  /starv/, /hungr/, /famine/, /hollow look/, /granary/, /reserve bins/, /nothing to eat/, /empty pantry/,
  // bond death
  /link broken/, /snaps? /, /neglect/, /bond/, /tribute/, /arrears/, /grief/, /oath/,
  // combat death
  /raid/, /the wild/, /monster/, /attack/, /combat/, /defense/, /teeth/, /wave/,
  // death fiction
  /died/, /dies\b/, /\bdead\b/, /buried/, /grave/, /kill/,
];
function installSayCapture(G, C) {
  C.sayLog = [];
  try {
    const oSay = G.say.bind(G);
    G.say = function (x) {
      try {
        const t = String(x == null ? '' : x);
        const low = t.toLowerCase();
        if (SAY_RES.some(re => re.test(low))) {
          C.sayLog.push({ day: scholarDay(G), text: t.slice(0, 320) });
        }
      } catch (e) { C.instrumentErrors++; }
      return oSay.apply(this, arguments);
    };
  } catch (e) { C.instrumentErrors++; }
}

// ---------------------------------------------------------------------------
// runOne(seed, policyId, opts): one instrumented 180d death-aware run.
async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const bare = isBare();
  const C = { instrumentErrors: 0, hashes: [], vday: [], maxWave: 1, successionDays: [], _prevVid: null };
  const base = FG.policyFor(policyId);
  const policy = Object.assign({}, base);
  const holder = { monsterNames: null };
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { SB.installDeathCapture(G, C, holder.monsterNames || new Set()); } catch (e) { C.instrumentErrors++; }
      try { FG.installFlowRecording(G, C); } catch (e) { C.instrumentErrors++; }
      try { installSayCapture(G, C); } catch (e) { C.instrumentErrors++; }
      try { SB.installBeatCapture(G, C); } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      // Hashes ALWAYS recorded (bare and live alike) — the det-gate
      // compares these; gating them on !isBare() voids the gate.
      C.hashes.push(scholarDay(G) + ':' + dayHash(G));
    } catch (e) {}
    if (!bare) {
      try {
        const vs = villageSnap(G);
        C.vday.push(vs);
        if (vs.uw > C.maxWave) C.maxWave = vs.uw;
        if (C._prevVid != null && vs.vid !== C._prevVid) {
          C.successionDays.push({ day: vs.d, from: String(C._prevVid), to: vs.vid });
        }
        C._prevVid = vs.vid;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  let monsterNames = null;
  try {
    monsterNames = new Set();
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) monsterNames.add(String(m.name).toLowerCase());
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  holder.monsterNames = monsterNames;
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : FG.attributeDeaths(Game, C, monsterNames || new Set());
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  // End flags: which village-lost path fired (engine-verbatim).
  let endFlags = null;
  try {
    const v = (Game.state && Game.state.village) || {};
    const s = (Game.state && Game.state.scholar) || {};
    endFlags = {
      scattered: !!v.scattered, extinct: !!v.extinct,
      scholarDead: !!s.dead, over: !!Game.over, villageLost: !!Game.villageLost,
    };
  } catch (e) { endFlags = { error: String(e && e.message) }; }
  // Final pantry/arcs at death — the terminal observation.
  let endSnap = null;
  try { endSnap = bare ? null : villageSnap(Game); } catch (e) { endSnap = null; }
  const out = {
    seed, policyId, substrate: 'pre-seat-winside-novetrel',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won, endFlags, endSnap,
    maxWave: C.maxWave, successions: C.successionDays.length,
    successionDays: C.successionDays,
    instrumentErrors: C.instrumentErrors | 0,
    deathsFull: bare ? null : (attr ? attr.deaths : null),
    deathsSummary: attr ? { rawCount: attr.rawCount, attributedCount: attr.attributedCount, phantomCount: attr.phantomCount, nullWho: attr.nullWho } : null,
    flows: bare ? [] : ((C.flows || []).map(f => [f.day, f.kind, f.paid])),
    beats: bare ? [] : (C.beats || []),
    sayLog: bare ? [] : (C.sayLog || []),
    vday: bare ? [] : C.vday,
    linkDump: bare ? null : SB.linkHistoryDump(Game),
    hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = SEEDS;
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.RECOURT_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.RECOURT_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} live-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = SEEDS;
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      const lastV = out.vday[out.vday.length - 1];
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} vday=${out.vday.length} pantry=${lastV.pantry} living=${lastV.living}/${lastV.roster} saylog=${out.sayLog.length} ierr=${out.instrumentErrors}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const out = await runOne(seed, policyId);
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} flags=${JSON.stringify(out.endFlags)} deaths=${JSON.stringify(out.deathsSummary)} saylog=${out.sayLog.length} ierr=${out.instrumentErrors}`);
    }
  }
  console.log('SWEEP: done');
}

module.exports = { runOne, villageSnap, installSayCapture, SEEDS, POLICIES, EVID };

if (require.main === module) {
  main().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
}
