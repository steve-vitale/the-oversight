#!/usr/bin/env node
// sim-foreignhelp-b-sweep.js — FOREIGN-HELP COMMS-CHAIN census (flesh-out
// loop arm sim-foreignhelp-b, axis scale-onramp, run
// fleshout-20261024T0925Z, backlog #872). DIAG + probe sweep.
// Instrument-side, ZERO src/js changes. Sweep outputs to the worktree
// evidence dir, NEVER /tmp.
//
// Seeds 70311-70318 x {leadfeast, belongfeast}, armorvillage+armorydrive
// pinned substrate IDENTICAL to the aidcrisis census (same env guard), so
// the only deliberate difference from aidcrisis is the seed band (fresh:
// aidcrisis used 701xx, wallseg/postunlock used 702xx — 703xx is unused)
// and the foreign-help instrument on top of the vetaidcrisis instrument.
//
// MODE=baseline (default): competent policies as-is (no call driver).
// MODE=callall: the sim-foreignhelp-b-callall probe policy wrapped around
// the same base (SIMFOREIGNHELP_CALLALL=1 in-process).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 \
//   node scripts/sim-foreignhelp-b-sweep.js [SEEDS=70311,70312 POLICIES=lead MODE=callall EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const VI = require(path.join(REPO, 'scripts', 'vetaidcrisis-instrument'));
const FH = require(path.join(REPO, 'scripts', 'sim-foreignhelp-b-instrument'));
const CALLALL = require(path.join(REPO, 'scripts', 'policies', 'sim-foreignhelp-b-callall'));

const REQUIRE1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE'];
const REQUIRE0 = ['VETFORMATION', 'LINKFORM', 'FEASTDISC', 'HOMECOMING', 'SCHOLARDIST', 'VETREL', 'REPOSITION', 'VGEAR', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETFORMATION2', 'BLOODRESTRAINT', 'TRUSTBUFFER'];
function checkEnv() {
  for (const k of REQUIRE1) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of REQUIRE0) {
    if (process.env[k] === '1' || (k in process.env && process.env[k] !== undefined && process.env[k] !== '')) {
      if (k === 'BLOODRESTRAINT' || k === 'TRUSTBUFFER') { console.error(`SWEEP STOP: ${k} must be UNSET (pinned substrate, hook absent at rediag anchor).`); process.exit(2); }
      if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, one arm only).`); process.exit(2); }
    }
  }
  if (!AV.avOn || !AV.avOn()) { console.error('SWEEP STOP: ARMORVILLAGE=1 not honored.'); process.exit(2); }
  if (typeof AV.armedFor !== 'function') { console.error('SWEEP STOP: AV.armedFor missing.'); process.exit(2); }
}
checkEnv();

const MODE = (process.env.MODE || 'baseline').trim();
if (MODE !== 'baseline' && MODE !== 'callall') { console.error(`SWEEP STOP: MODE must be baseline|callall, got "${MODE}".`); process.exit(2); }
if (MODE === 'callall') process.env.SIMFOREIGNHELP_CALLALL = '1';

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70311, 70312, 70313, 70314, 70315, 70316, 70317, 70318]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (s < 70311 || s > 70318) { console.error(`SWEEP STOP: seed ${s} is outside the fresh band 70311-70318.`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-foreignhelp');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'sim-foreignhelp-b-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}
function seedFile(seed, base) {
  return path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}-${MODE}.json`);
}

async function oneRun(seed, base) {
  const fn = seedFile(seed, base);
  if (fs.existsSync(fn)) {
    try {
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.seed === seed && d.anchorCommit === ANCHOR && d.mode === MODE && Array.isArray(d.crisisEvents) && d.fh && Array.isArray(d.fh.resolveSnaps)) {
        return { seed, base: normBase(base), mode: MODE, resumed: true, nCrisisEvents: d.crisisEvents.length, nResolveSnaps: d.fh.resolveSnaps.length, days: d.days };
      }
      logLine(`RE-RUN seed=${seed} base=${base} mode=${MODE}: existing file invalid or anchor/mode mismatch`);
    } catch (e) { logLine(`RE-RUN seed=${seed} base=${base}: unparseable (${String((e && e.message) || e)})`); }
  }

  let policy = AV.armedFor(normBase(base));
  if (MODE === 'callall') policy = CALLALL.withCallAll(policy, normBase(base) + '-foreignhelp-callall', normBase(base) + ' + sim-foreignhelp-b-callall probe');
  const { Game } = await loadGame({ seed, mode: 'aidcrisis', fullTelemetry: false });
  const t = { crisisEvents: [], fights: [], fightEnds: [], deaths: [], successions: [], instrumentErrors: [], fh: null };
  const uninstallVI = VI.install(Game, t);
  const uninstallFH = FH.install(Game, t);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstallFH(); } catch (e) { t.instrumentErrors.push('uninstallFH: ' + String((e && e.message) || e)); }
  try { uninstallVI(); } catch (e) { t.instrumentErrors.push('uninstallVI: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;

  let finalRoster = [], finalScholarVid = null;
  try { finalRoster = ((((st.village) || {}).roster) || []).map(String); } catch (e) {}
  try { finalScholarVid = String(((st.scholar || {}).villagerId) || ''); } catch (e) {}

  const out = {
    seed, base: normBase(base), mode: MODE,
    policyId: (normBase(base) === 'belongfeast' ? 'belong' : 'lead') + '-armorvillage' + (MODE === 'callall' ? '-foreignhelp-callall' : ''),
    instrument: 'vetaidcrisis + sim-foreignhelp-b comms-chain recorder (callForHelp/aidAskVillage/aidHelpArrived/raise+resolve snapshots, first-crisis say transcript)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1',
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    initialScholarVid: t.initialScholarVid || null, finalScholarVid, finalRoster,
    nCrisisEvents: t.crisisEvents.length, crisisEvents: t.crisisEvents,
    nFights: t.fights.length, fights: t.fights,
    nFightEnds: t.fightEnds.length, fightEnds: t.fightEnds,
    nDeaths: t.deaths.length, deaths: t.deaths,
    nSuccessions: t.successions.length, successions: t.successions,
    fh: t.fh,
    instrumentErrors: t.instrumentErrors,
  };
  const body = JSON.stringify(out, null, 1) + '\n';
  // EPERM write flap (container, 2026-10-24): evidence-dir writes fail
  // intermittently with EPERM, leaving a 0-byte file. Retry in-process with
  // backoff — the sim result is already in memory, so no recompute, and
  // outputs still land directly in evidence/ (never /tmp staging).
  // NOTE: Date.now is FROZEN by the sim harness — a Date.now busy-wait
  // returns instantly (all 20 "10s" retries landed in the same second on
  // 2026-10-24). Use the monotonic clock (performance.now) for backoff.
  const sleepSync = ms => { const end = performance.now() + ms; while (performance.now() < end) {} };
  // EPERM flap, process-scoped observation (2026-10-24): a long-running
  // sweep process's writeFileSync calls failed 16+ times in a row while
  // fresh processes wrote 80KB files to the same directory fine. So odd
  // attempts use fs, even attempts shell out to a FRESH `cat` process
  // (content via stdin, filename via $1 — no shell interpolation of body).
  const { execFileSync } = require('child_process');
  let wrote = false, lastErr = null;
  for (let attempt = 1; attempt <= 30 && !wrote; attempt++) {
    try {
      if (attempt % 2 === 0) execFileSync('sh', ['-c', 'cat > "$1"', 'sh', fn], { input: body });
      else fs.writeFileSync(fn, body);
      const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
      const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
      if (shaWrote !== shaRead) throw new Error('hash mismatch after write');
      wrote = true;
    } catch (e) {
      lastErr = e;
      logLine(`WRITE-RETRY seed=${seed} base=${base} attempt=${attempt} via=${attempt % 2 === 0 ? 'shell-cat' : 'fs'} err=${String((e && e.message) || e)}`);
      if (attempt < 30) sleepSync(15000);
    }
  }
  if (!wrote) { console.error(`WRITE-DENIAL after 30 retries for ${fn}: ${String((lastErr && lastErr.message) || lastErr)}`); process.exit(3); }
  return {
    seed, base: normBase(base), mode: MODE, resumed: false,
    nCrisisEvents: t.crisisEvents.length, nResolveSnaps: (t.fh && t.fh.resolveSnaps ? t.fh.resolveSnaps.length : 0),
    nCalls: (t.fh && t.fh.calls ? t.fh.calls.length : 0), nAsks: (t.fh && t.fh.asks ? t.fh.asks.length : 0),
    nArrivals: (t.fh && t.fh.arrivals ? t.fh.arrivals.length : 0),
    days: result.days, endReason: result.endReason, maxWave, national, table, won,
    instrumentErrors: t.instrumentErrors.length,
  };
}

(async () => {
  logLine(`SIM-FOREIGNHELP-B-SWEEP-START anchor=${ANCHOR} mode=${MODE} seeds=${SEEDS.join(',')} bases=${BASES.join(',')} days=${DAYS}`);
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const t0 = performance.now();
      const r = await oneRun(s, b);
      r.secs = Math.round((performance.now() - t0) / 1000);
      rows.push(r);
      logLine('CONFIG ' + JSON.stringify(r));
    }
  }
  logLine(`SIM-FOREIGNHELP-B-SWEEP-DONE ${JSON.stringify({ ran: rows.filter(r => !r.resumed).length, resumed: rows.filter(r => r.resumed).length, anchor: ANCHOR, mode: MODE })}`);
})().catch(e => { logLine('SWEEP FAILED: ' + ((e && e.stack) || e)); process.exit(1); });
