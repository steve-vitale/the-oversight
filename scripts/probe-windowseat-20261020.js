#!/usr/bin/env node
// probe-windowseat-20261020.js — window-death taxonomy sweep for arm
// sim-windowseat (flesh-out loop run fleshout-20261020T2145Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Wraps the policy daily with PURE engine reads (no state writes,
// no RNG draws) + the read-only WINDOWSEAT instrument
// (scripts/windowseat-instrument-20261020.js: recordWaveKill /
// recordPyrrhicKill / playerDeath-before-ctx / havenRaidTick / tele death
// capture for all person deaths / combat_start + router fight-start
// records) + the reused KILLDISC read-only instrument. The DET gate pins
// instrument-on vs instrument-off byte-identical trajectories.
//
// THE QUESTION: window-death taxonomy on the SEATDRIVE default-on
// substrate (the winning substrate — the wintrack/seat arm's LOSERS are
// unmeasured). Windows: maximal contiguous deferral(5)-true windows,
// outcomes died | won | released | regressed | horizon (the windowsurvive
// attemptsOf logic, identical by construction, plus the 'won' outcome —
// on this substrate villages win THROUGH the window via feared/light).
//
// SUBSTRATE (seatdrive natural win-side stack):
//   withSeatDrive(withWinDefer(TF base)) on {leadfeast, belongfeast}
//   tribfloor bases. SEATDRIVE UNSET (default-on since 2026-10-16 drives
//   the seat; SEATDRIVE=0 opts out — the guard rejects '0').
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1
//   (No VETREL, no REPOSITION, no TABLEPATHDRIVER, no RELAYDARK — the
//   natural track the wintrack audit measured, 12/12 wins feared/light.)
//
// Usage (READ THIS — the 2026-10-20 env-trap lesson: running without the
// documented env falsifies verdicts):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 \
//   node scripts/probe-windowseat-20261020.js
//   SMOKE=1 ...        # short smoke: both policies drive, census live
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=leadfeast ... # policy filter (parallel batches)
//   SEEDS="66001,66002" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const KD = require('./killdisc-instrument-20261018');
const WSI = require('./windowseat-instrument-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — the seatdrive natural win-side stack. SEATDRIVE must
// NOT be '0' (unset = default-on, the brief's exact instruction);
// VETREL/REPOSITION/TABLEPATHDRIVER/RELAYDARK must NOT be '1'.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'WINDOWSEAT'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (windowseat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '0') { console.error('SWEEP STOP: SEATDRIVE must NOT be 0 — unset (default-on) is the winning substrate.'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'TABLEPATHDRIVER', 'RELAYDARK']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (the natural track — no vetrel, no reposition, no drivers).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false (SEATDRIVE=0?).'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
if (!WSI.instrumentOn()) { console.error('SWEEP STOP: WINDOWSEAT instrument off despite WINDOWSEAT=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [66001, 66002, 66003, 66004, 66005, 66006, 66007, 66008]).filter(Number.isFinite);
// Filename-freshness (loop convention): 66001-66008 verified zero
// filename hits in evidence//scripts 2026-10-20 (65001-65008 are taken
// by winsupport-decomp; 64001-64008/64009-64014/64015-64022/64201-64208
// taken by sibling arms).
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-windowseat');
const isBare = () => process.env.WSEAT_BARE === '1';

// EPERM flap hardening (sim-armory 2026-10-19: sweep attempts lost to
// 0-byte JSONs from the host's EPERM flap on node writes). EPERM-only
// retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — the natural seatdrive win-side stack:
//   withSeatDrive(withWinDefer(TF base))
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + win-side stack + seatdrive (SEATDRIVE unset: default-ON)`);
}

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// stateSnap(G): the village's state at a death (or daily). PURE reads.
// Identical by construction with probe-windowsurvive-20261019.js.
function stateSnap(G) {
  const s = {};
  try {
    s.pantry = Math.round(G.pantryKcalLive ? G.pantryKcalLive(G.state.village) : -1);
  } catch (e) { s.pantry = -1; }
  try { const pg = G.progState ? G.progState() : null; s.hungryStreak = (pg && (pg.hungryStreak | 0)) || 0; } catch (e) { s.hungryStreak = -1; }
  try {
    const r5 = G.waveUnlockReady ? G.waveUnlockReady(5) : null;
    if (r5) { s.armored = r5.armored | 0; s.armed = r5.armed | 0; s.vets = r5.veterans | 0; s.tricks = r5.tricks | 0; s.short = (r5.short || []).slice(); s.rdy = !!r5.ready; }
    else { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['no-read']; s.rdy = false; }
  } catch (e) { s.armored = -1; s.armed = -1; s.vets = -1; s.tricks = -1; s.short = ['read-error']; s.rdy = false; }
  try {
    const vs = G.villageStanding ? G.villageStanding() : {};
    s.raw = (vs.total | 0) || 0; s.war = (vs.war | 0) || 0; s.dip = (vs.diplomacy | 0) || 0; s.plenty = (vs.plenty | 0) || 0;
  } catch (e) { s.raw = -1; s.war = -1; s.dip = -1; s.plenty = -1; }
  try { s.cap = G.standingPlentyCappedTotal ? (G.standingPlentyCappedTotal() | 0) : -1; } catch (e) { s.cap = -1; }
  try {
    const df = G.standingDeferral ? G.standingDeferral(5) : null;
    s.def5 = !!(df && df.deferred);
  } catch (e) { s.def5 = false; }
  try { s.roster = ((((G.state && G.state.village) || {}).roster) || []).length; } catch (e) { s.roster = -1; }
  try { s.scholarAlive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { s.scholarAlive = false; }
  return s;
}

// dailyRec(G): the daily window-series vector. PURE reads.
function dailyRec(G) {
  const day = scholarDay(G);
  const rec = { d: day, st: stateSnap(G) };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.peak = (G._standingPeakWave ? G._standingPeakWave() : 0) | 0; } catch (e) { rec.peak = 0; }
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const via = { player: 0, villager: 0, companion: 0, unknown: 0, other: 0 };
    let kills = 0;
    for (const e of log) {
      if (!e || ((e.w | 0) < 4)) continue;
      kills++;
      const v = String(e.via || 'unknown');
      if (Object.prototype.hasOwnProperty.call(via, v)) via[v]++; else via.other++;
    }
    rec.w4k = kills; rec.w4via = via;
  } catch (e) { rec.w4k = -1; rec.w4via = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  try { rec.won = !!G.won; } catch (e) { rec.won = false; }
  return rec;
}

// Phantom check: did `who` actually die? Identical-by-construction with
// vetwindow/windowsurvive: roster-living => phantom (excluded, counted);
// no person record and absent from roster => dead-and-removed (real);
// missing who => null (unverifiable, counted LOUD).
function diedForReal(Game, who) {
  if (who == null || who === '?' || who === 'unknown') return null;
  try {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(who) : null;
    if (vp) return !!vp.dead;
    const roster = (((Game.state && Game.state.village) || {}).roster || []).map(String);
    if (roster.includes(String(who))) return false;
    return true;
  } catch (e) { return null; }
}

// attributeDeaths(Game, T): merge scholar deaths (playerDeath — canonical,
// pre-mutation ctx) + villager tele deaths (dedup on who|day preferring
// playerDeath), phantom-check. Returns the raw attributed records; the
// wall-class classification lives in the analyzer (classifyWall).
function attributeDeaths(Game, T) {
  const seenPD = new Set((T.deaths || []).map(d => [String(d.who), d.day | 0].join('|')));
  const merged = (T.deaths || []).map(d => Object.assign({}, d));
  const names = WSI.monsterNameSet(Game);
  for (const t of (T.deathTeles || [])) {
    const key = [String(t.who), t.day | 0].join('|');
    if (seenPD.has(key)) continue; // playerDeath record is canonical for scholars
    merged.push(Object.assign({}, t));
  }
  const phantoms = [];
  const unverifiable = [];
  const attributed = [];
  const causeSpace = {};
  for (const t of merged) {
    const cause = String(t.cause || 'unknown');
    causeSpace[cause] = (causeSpace[cause] || 0) + 1;
    const real = diedForReal(Game, t.who);
    if (real === false) { phantoms.push({ who: t.who, day: t.day, cause }); continue; }
    if (real === null) { unverifiable.push({ who: t.who, day: t.day, cause }); continue; }
    let name = t.who;
    try { name = String(Game.displayName ? Game.displayName(t.who) : t.who).split(' ')[0]; } catch (e) {}
    attributed.push({
      who: String(t.who), name, day: t.day | 0, cause, kind: t.kind || null,
      player: !!t.player, source: t.source || 'tele', wave: t.wave != null ? (t.wave | 0) : null,
      ctx: {
        arena: !!t.arena, raidNight: !!t.raidNight, atHaven: !!t.atHaven,
        inTb: !!t.inTb, noFlee: !!t.noFlee, fightOver: !!t.fightOver,
        onExped: !!t.onExped, router: t.router || null, aid: !!t.aid,
        opps: (t.opps || []).map(o => ({ mid: o.mid || null, wave: o.wave != null ? (o.wave | 0) : null })),
        allies: (t.allies || []).slice(),
        loc: t.loc || null, scholarHp: t.scholarHp != null ? (t.scholarHp | 0) : null,
      },
      stateAtDeath: stateSnap(Game),
    });
  }
  return {
    rawCount: (T.deathTeles || []).length + (T.deaths || []).length,
    scholarDeaths: (T.deaths || []).length, teleDeaths: (T.deathTeles || []).length,
    attributed, attributedCount: attributed.length,
    phantoms, phantomCount: phantoms.length,
    unverifiable, unverifiableCount: unverifiable.length,
    causeSpace,
  };
}

async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const base = policyFor(policyId);
  const bare = isBare();
  const C = {
    recs: [], hashes: [],
    maxRank: 0, everTable: false, tableDay: null, exiled: false,
    maxWave: 1, wave4Day: null, wave5Day: null, nationalDay: null, wonDay: null,
    instrumentErrors: 0,
    kd: { kills: [], dmg: {}, census: [], engagements: [], instrumentErrors: [] },
    T: null,
  };
  const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try {
        C.T = { instrumentErrors: [] };
        WSI.install(G, C.T);
      } catch (e) { C.instrumentErrors++; }
      try { KD.install(G, C.kd); } catch (e) { C.instrumentErrors++; }
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
      C.hashes.push(scholarDay(G) + ':' + dayHash(Game));
    } catch (e) {}
    if (!bare) {
      try {
        const rec = dailyRec(G);
        C.recs.push(rec);
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        let pg = null;
        try { pg = G.progState ? G.progState() : null; } catch (e) {}
        if (pg && pg.tableWaiting) { C.everTable = true; if (C.tableDay == null) C.tableDay = rec.d; }
        if ((G.state.scholar || {}).exiled) C.exiled = true;
        if (rec.won && C.wonDay == null) C.wonDay = rec.d;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'windowseat', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : attributeDeaths(Game, C.T);
  let endRec = null;
  try { endRec = dailyRec(Game); } catch (e) { endRec = null; }
  // The folk-name map (sim-folkname-map 2026-10-21): a pure end-of-run
  // read of state.codex.monsters — after the last daily hash, so it
  // cannot perturb the DET-pinned trajectory.
  let folkNames = [];
  if (!bare) {
    try { folkNames = WSI.folkNameMap(Game) || []; }
    catch (e) { C.instrumentErrors++; folkNames = []; }
  }
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  let maxWave = C.maxWave;
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && C.wave5Day == null) C.wave5Day = gameDays;
    if (maxWave >= 4 && C.wave4Day == null) C.wave4Day = gameDays;
  } catch (e) {}
  const out = {
    seed, policyId, substrate: 'seatdrive-natural-win-side',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won, wonDay: C.wonDay,
    maxRank: C.maxRank, national: C.nationalDay != null ? 1 : 0, nationalDay: C.nationalDay,
    table: C.everTable ? 1 : 0, tableDay: C.tableDay, exiled: C.exiled ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    instrumentErrors: (C.instrumentErrors | 0) + ((C.T && C.T.instrumentErrors.length) | 0),
    kdErrors: (C.kd.instrumentErrors || []).length,
    kills: bare ? [] : (C.T.kills || []),
    fightStarts: bare ? [] : (C.T.fightStarts || []),
    raidNights: bare ? [] : (C.T.raidNights || []),
    folkNameMap: bare ? [] : folkNames, // sim-folkname-map 2026-10-21: the run's monsterDisplayName map per seed
    deathsAttributed: attr,
    recs: C.recs, endRec, hashes: C.hashes,
  };
  if (!opts.noWrite) {
    const dir = path.join(EVID, policyId);
    fs.mkdirSync(dir, { recursive: true });
    writeFileRetry(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66001, 66002]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.WSEAT_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.WSEAT_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66001, 66002]).filter(Number.isFinite);
    let ok = true;
    for (const seed of fseeds) {
      for (const policyId of POLICIES) {
        const p = path.join(EVID, policyId, `s${seed}.json`);
        if (!fs.existsSync(p)) { console.log(`  FIDELITY s${seed} ${policyId}: SKIP (no per-seed file)`); continue; }
        const before = fs.readFileSync(p, 'utf8');
        await runOne(seed, policyId);
        const after = fs.readFileSync(p, 'utf8');
        const pass = before === after;
        console.log(`  FIDELITY s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) ok = false;
      }
    }
    console.log(ok ? 'FIDELITY: ALL PASS' : 'FIDELITY: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66001]).filter(Number.isFinite);
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      const last = out.recs[out.recs.length - 1];
      const da = out.deathsAttributed || {};
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} recs=${out.recs.length} scholarDeaths=${da.scholarDeaths} teleDeaths=${da.teleDeaths} attributed=${da.attributedCount} phantoms=${da.phantomCount} kills=${(out.kills || []).length} fightStarts=${(out.fightStarts || []).length} ierr=${out.instrumentErrors} kdErr=${out.kdErrors} def5=${last && last.st.def5}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const out = await runOne(seed, policyId);
      results.push(out);
      const da = out.deathsAttributed || {};
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} table=${out.table} attributed=${da.attributedCount} unattrib=${da.unverifiableCount} phantoms=${da.phantomCount} kills=${(out.kills || []).length} ierr=${out.instrumentErrors}`);
    }
  }
  const n = results.length;
  const agg = (f) => results.filter(f).length;
  console.log(`SWEEP COMPLETE: ${n}/${SEEDS.length * POLICIES.length} runs, 0 errors`);
  console.log(`  national=${agg(r => r.national)} table=${agg(r => r.table)} wins=${agg(r => r.won)} wave4=${agg(r => r.wave45)} wave5=${agg(r => r.wave5)} exiled=${agg(r => r.exiled)}`);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(2); });
module.exports = { runOne, policyFor, dailyRec, stateSnap, attributeDeaths, diedForReal, daysNow };
