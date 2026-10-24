#!/usr/bin/env node
// vetaidcrisis-sweep.js — AID-CRISIS HAVEN-DEFENSE CHANNEL census (flesh-out
// loop arm sim-aidcrisis-b, axis scale-onramp, run fleshout-20261024T0615Z).
// DIAG arm: instrument-side, ZERO src/js changes. Namespace vetaidcrisis-*.
//
// Re-sweeps the defer5-rediag census band (seeds 70111–70122 x
// {leadfeast, belongfeast}, armorvillage+armorydrive pinned substrate,
// 180d death-aware) with the aid-crisis channel recorder attached
// (scripts/vetaidcrisis-instrument.js): per-fight crisis ctx, crisis
// raise/resolve timeline, death rows with crisis-active-at-death, tenure
// since succession, and blood-tenure since first wave-4+ kill.
//
// The pinned substrate and seed band are IDENTICAL to the vetautopsy census,
// so wave-4+ fight outcomes on identical seeds are byte-identical on the
// judged fields (verified in scripts/test-aidcrisis-b.js E2).
//
// Resume-safe: per-seed JSONs written once with sha256-after-write readback;
// an existing file with a matching anchor is skipped (deterministic re-run
// verified byte-identical). Sweep outputs to the worktree evidence dir, NEVER
// /tmp.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 \
//   node scripts/vetaidcrisis-sweep.js [SEEDS=70111,70112 POLICIES=lead EVID=... DAYS=180]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks'); // Date.now is frozen by the harness; use the monotonic clock
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
const VI = require(path.join(REPO, 'scripts', 'vetaidcrisis-instrument'));

// Pinned-substrate env guard (vetaidcrisis namespace). Same band as the
// vetautopsy census: deliberate re-sweep with a new instrument (asserted).
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
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-aidcrisis');
fs.mkdirSync(EVID, { recursive: true });
const RUNLOG = path.join(EVID, 'vetaidcrisis-sweep-runlog.txt');
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
      if (d.seed === seed && d.anchorCommit === ANCHOR && Array.isArray(d.deaths) && Array.isArray(d.fights) && Array.isArray(d.fightEnds) && Array.isArray(d.crisisEvents)) {
        return { seed, base: normBase(base), resumed: true, nDeaths: d.deaths.length, nFights: d.fights.length, nFightEnds: d.fightEnds.length, nCrisisEvents: d.crisisEvents.length, days: d.days };
      }
      logLine(`RE-RUN seed=${seed} base=${base}: existing file invalid or anchor mismatch (file=${d.anchorCommit}, now=${ANCHOR})`);
    } catch (e) { logLine(`RE-RUN seed=${seed} base=${base}: existing file unparseable (${String((e && e.message) || e)})`); }
  }

  const policy = AV.armedFor(normBase(base));
  const { Game } = await loadGame({ seed, mode: 'aidcrisis', fullTelemetry: false });
  const t = { crisisEvents: [], fights: [], fightEnds: [], deaths: [], successions: [], instrumentErrors: [] };
  const uninstall = VI.install(Game, t);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { t.instrumentErrors.push('uninstall: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Wall numbers.
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
    seed, base: normBase(base), policyId: (normBase(base) === 'belongfeast' ? 'belong' : 'lead') + '-armorvillage',
    instrument: 'vetaidcrisis aid-crisis channel recorder (tele + combat_start + aidFight + raiseAidCrisis + resolveAidCrisis + mantleBecome wraps; RNG-neutral, zero writes)',
    substrate: 'pinned: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; BLOODRESTRAINT/VETFORMATION/LINKFORM unset — armorvillage.armedFor (armorydrive pinned substrate + armor-economy drive)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1',
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    initialScholarVid: t.initialScholarVid || null, finalScholarVid, finalRoster,
    nCrisisEvents: t.crisisEvents.length, crisisEvents: t.crisisEvents,
    nFights: t.fights.length, fights: t.fights,
    nFightEnds: t.fightEnds.length, fightEnds: t.fightEnds,
    nDeaths: t.deaths.length, deaths: t.deaths,
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
    nCrisisEvents: t.crisisEvents.length, nFights: t.fights.length, nDeaths: t.deaths.length,
    nSuccessions: t.successions.length,
    days: result.days, endReason: result.endReason, maxWave, national, table, won,
    instrumentErrors: t.instrumentErrors.length,
  };
}

// The policy is passed through unmodified (the instrument needs no daily
// hook — everything is captured at tele/succession/crisis time). The shim
// exists only to keep the call shape identical to the other census composers.
function wrappedPolicyShim(policy) { return policy; }

(async () => {
  logLine(`VETAIDCRISIS-SWEEP-START anchor=${ANCHOR} seeds=${SEEDS.join(',')} bases=${BASES.join(',')} days=${DAYS}`);
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
  logLine(`VETAIDCRISIS-SWEEP-DONE ${JSON.stringify({ ran: done, resumed: rows.length - done, anchor: ANCHOR })}`);
})().catch(e => { logLine('SWEEP FAILED: ' + ((e && e.stack) || e)); process.exit(1); });
