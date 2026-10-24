#!/usr/bin/env node
// vetautopsy-sweep.js — WAVE-4 KILLER AUTOPSY census (flesh-out loop arm
// sim-vetautopsy, axis scale-onramp, run fleshout-20261024T0446Z).
// DIAG arm: instrument-side, ZERO src/js changes. Namespace vetautopsy-*.
//
// Re-sweeps the defer5-rediag census band (seeds 70111–70122 x
// {leadfeast, belongfeast}, armorvillage+armorydrive pinned substrate,
// 180d death-aware) with the death-row recorder attached
// (scripts/vetautopsy-instrument.js). For every vid with ≥1 wave-4+ kill,
// the corpus carries a death row: firstKill day, death day, days
// blood-to-death, cause string, opponent (monster id/wave if combat), hp/
// armor state, starvation state, mantle-holder / 14d-blood-window /
// picked-successor flags, village context (national?, wave5 live?).
//
// Substrate (pinned, FAIL LOUD — identical to the defer5-rediag census):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; BLOODRESTRAINT explicitly unset
//   (the hook exists on current master, env-gated default OFF, but did not
//   exist at the rediag anchor — unset reproduces the census behavior).
//   policy = AV.armedFor(base) (armorvillage's armedFor wraps armorydrive's).
//   VETFORMATION/LINKFORM/FEASTDISC/HOMECOMING/SCHOLARDIST families unset.
//
// Resume-safe: per-seed JSONs are written once with sha256-after-write
// readback; an existing file with a matching anchor is skipped (the
// instrument is deterministic — a re-run is byte-identical on the judged
// fields, verified in scripts/test-vetautopsy.js E2). An anchor mismatch is
// re-run LOUD. Sweep outputs to the worktree evidence dir, NEVER /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 \
//   node scripts/vetautopsy-sweep.js [SEEDS=70111,70112 POLICIES=lead EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks'); // Date.now is frozen by the harness; use the monotonic clock
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const VI = require(path.join(REPO, 'scripts', 'vetautopsy-instrument'));

// Pinned-substrate env guard (vetautopsy namespace). The C1 freshness gate
// does NOT apply here: seeds 70111–70122 are the defer5-rediag band,
// re-swept DELIBERATELY with a new instrument (asserted below).
const REQUIRE1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE'];
const REQUIRE0 = ['VETFORMATION', 'LINKFORM', 'FEASTDISC', 'HOMECOMING', 'SCHOLARDIST', 'VETREL', 'REPOSITION', 'VGEAR', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETFORMATION2', 'BLOODRESTRAINT', 'TRUSTBUFFER'];
function checkEnv() {
  for (const k of REQUIRE1) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of REQUIRE0) {
    if (process.env[k] === '1' || (k in process.env && process.env[k] !== undefined && process.env[k] !== '')) {
      // BLOODRESTRAINT/TRUSTBUFFER: any set value (even '0') is a loud stop —
      // the rediag corpus ran with these hooks absent; only fully-unset matches.
      if (k === 'BLOODRESTRAINT' || k === 'TRUSTBUFFER') { console.error(`SWEEP STOP: ${k} must be UNSET (pinned substrate, hook absent at rediag anchor).`); process.exit(2); }
      if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, one arm only).`); process.exit(2); }
    }
  }
  if (!AV.avOn || !AV.avOn()) { console.error('SWEEP STOP: ARMORVILLAGE=1 not honored (armorvillage.avOn() false).'); process.exit(2); }
  if (typeof AV.armedFor !== 'function') { console.error('SWEEP STOP: AV.armedFor missing (armorvillage not on master?).'); process.exit(2); }
}
checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70111, 70112, 70113, 70114, 70115, 70116, 70117, 70118, 70119, 70120, 70121, 70122]).filter(Number.isFinite);
for (const s of SEEDS) {
  if (s < 70111 || s > 70122) { console.error(`SWEEP STOP: seed ${s} is outside the deliberate re-sweep band 70111-70122.`); process.exit(2); }
}
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetautopsy');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'vetautopsy-sweep-runlog.txt');
function logLine(s) {
  console.log(s);
  try { fs.appendFileSync(RUNLOG, new Date().toISOString() + ' ' + s + '\n'); } catch (e) {}
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
function seedFile(seed, base) {
  return path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`);
}

async function oneRun(seed, base) {
  const fn = seedFile(seed, base);
  // Resume: an existing file with a matching anchor is deterministic-identical; skip.
  if (fs.existsSync(fn)) {
    try {
      const d = JSON.parse(fs.readFileSync(fn, 'utf8'));
      if (d.seed === seed && d.anchorCommit === ANCHOR && Array.isArray(d.deathRows) && Array.isArray(d.waveKillLog) && Array.isArray(d.successions)) {
        return { seed, base: normBase(base), resumed: true, nDeathRows: d.deathRows.length, nW4Kills: (d.waveKillLog || []).filter(e => (e.w | 0) >= 4).length, days: d.days };
      }
      logLine(`RE-RUN seed=${seed} base=${base}: existing file invalid or anchor mismatch (file=${d.anchorCommit}, now=${ANCHOR})`);
    } catch (e) { logLine(`RE-RUN seed=${seed} base=${base}: existing file unparseable (${String((e && e.message) || e)})`); }
  }

  const policy = AV.armedFor(normBase(base));
  const { Game } = await loadGame({ seed, mode: 'vetautopsy', fullTelemetry: false });
  const t = { deathRows: [], fights: [], successions: [], instrumentErrors: [] };
  const uninstall = VI.install(Game, t);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicyShim(policy), { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { t.instrumentErrors.push('uninstall: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Mantle-holder resolution (post-run; the lazy player getter has repaired by now).
  for (const row of t.deathRows) {
    let repaired = false;
    try { repaired = !!row.player; } catch (e) {}
    row.playerRepaired = repaired;
    row.mantleHolder = !!((row.who && row.scholarVidAtDeath && row.who === row.scholarVidAtDeath) || repaired);
  }

  // Wall numbers.
  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;

  // Deaths (guardrails).
  const deaths = {};
  let starvation = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starvation++;
    }
  } catch (e) { t.instrumentErrors.push('deaths: ' + String((e && e.message) || e)); }

  // waveKillLog DIRECT (the source the veterans bar reads).
  let waveKillLog = [];
  try {
    waveKillLog = (st.waveKillLog || []).map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  // Final roster (phantom/survivor join) + final scholar.
  let finalRoster = [], finalScholarVid = null;
  try { finalRoster = ((((st.village) || {}).roster) || []).map(String); } catch (e) {}
  try { finalScholarVid = String(((st.scholar || {}).villagerId) || ''); } catch (e) {}

  const out = {
    seed, base: normBase(base), policyId: (normBase(base) === 'belongfeast' ? 'belong' : 'lead') + '-armorvillage',
    instrument: 'vetautopsy death-row recorder (tele + combat_start + mantleBecome + aidFight wraps; RNG-neutral, zero writes)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; BLOODRESTRAINT/VETFORMATION/LINKFORM unset — armorvillage.armedFor (armorydrive pinned substrate + armor-economy drive)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1',
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, starvation,
    initialScholarVid: t.initialScholarVid || null, finalScholarVid, finalRoster,
    nWaveKillLog: waveKillLog.length, waveKillLog,
    nDeathRows: t.deathRows.length, deathRows: t.deathRows,
    nFights: t.fights.length, fights: t.fights,
    nSuccessions: t.successions.length, successions: t.successions,
    instrumentErrors: t.instrumentErrors,
  };
  const body = JSON.stringify(out, null, 1) + '\n';
  fs.writeFileSync(fn, body);
  const shaWrote = crypto.createHash('sha256').update(body).digest('hex');
  const shaRead = crypto.createHash('sha256').update(fs.readFileSync(fn)).digest('hex');
  if (shaWrote !== shaRead) { console.error(`WRITE-DENIAL: hash mismatch after write for ${fn}`); process.exit(3); }
  return {
    seed, base: normBase(base), resumed: false,
    nDeathRows: t.deathRows.length,
    nW4Kills: waveKillLog.filter(e => (e.w | 0) >= 4).length,
    nSuccessions: t.successions.length, nFights: t.fights.length,
    days: result.days, endReason: result.endReason, maxWave, national, table, won,
    instrumentErrors: t.instrumentErrors.length,
  };
}

// The policy is passed through unmodified (the instrument needs no daily
// hook — everything is captured at tele/succession time). The shim exists
// only to keep the call shape identical to the other census composers.
function wrappedPolicyShim(policy) { return policy; }

(async () => {
  logLine(`VETAUTOPSY-SWEEP-START anchor=${ANCHOR} seeds=${SEEDS.join(',')} bases=${BASES.join(',')} days=${DAYS}`);
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const t0 = performance.now();
      const r = await oneRun(s, b);
      r.secs = Math.round((performance.now() - t0) / 1000);
      rows.push(r);
      logLine('CONFIG ' + JSON.stringify(r));
      if (r.instrumentErrors) logLine(`INSTRUMENT-ERRORS seed=${s} base=${b}: ${r.instrumentErrors}`);
    }
  }
  const done = rows.filter(r => !r.resumed).length;
  logLine('VETAUTOPSY-SWEEP-DONE ' + JSON.stringify({ ran: done, resumed: rows.length - done, anchor: ANCHOR }));
})().catch(e => { logLine('SWEEP FAILED: ' + ((e && e.stack) || e)); process.exit(1); });
