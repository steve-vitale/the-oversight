#!/usr/bin/env node
// sweep-restraint-20261023.js — sim-restraint-b PILOT sweep.
//
// *** KILLED-AT-PILOT 2026-10-23 (see evidence/2026-10-23/sim-restraint-b.md).
// The policy module (scripts/policies/restraint.js) was deleted per the kill
// protocol; this script is retained as the instrument record of what ran and
// will throw MODULE_NOT_FOUND if executed again. ***
//
// 8 FRESH seeds (65721-65725,65727-65729 — 65726 used by
// evidence/2026-10-21/perseed-surpluskeep2-b; 65701/65703/65705/65708/65709
// used by 2026-10-20 evidence) x {leadfeast, belongfeast} x {control,
// restraint} = 32 paired configs, 180d death-aware, on the mantlechain DIAG
// substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   ARMORYDRIVE=1 (RESTRAINT=1 for the armed side only;
//   no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
//   TWOVETS/VGEAR/WAVE4ENGAGE/FEASTDISC)
//
//   control   = RS.controlFor(base) = AD.armedFor(base) (RESTRAINT unset)
//   restraint = RS.armedFor(base)    = withRestraint(AD.armedFor(base))
//
// Composition honesty pinned by scripts/test-restraint-20261023.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: the mantlechain DIAG instrument
// (scripts/mantlechain-instr-20261022.js — succession events, wave-4
// combat_start rows, death rows with live-fight wave context, say
// windows; read-only, RNG-neutral) + a restraint-namespace extension
// (per wave-4 combat_start: feasted state + at-haven; restraint layer
// counters from ctx; daily bearer <redacted> for kill-time attribution).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-restraint/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 ARM=control SEEDS=65721,65722 \
//   node scripts/sweep-restraint-20261023.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 RESTRAINT=1 ARM=restraint SEEDS=65721,65722 \
//   node scripts/sweep-restraint-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const RS = require(path.join(REPO, 'scripts', 'policies', 'restraint'));
const MC = require(path.join(REPO, 'scripts', 'mantlechain-instr-20261022'));

// Mantlechain-DIAG substrate guard (pinned substrate, nothing else).
// KILLDISC=1 pins the substrate env exactly as the DIAG ran it; the KD
// instrument itself is NOT installed (its install() is what instruments).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (mantlechain DIAG substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'FEASTDISC']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'restraint') { console.error('SWEEP STOP: ARM must be control|restraint.'); process.exit(2); }
if (ARM === 'restraint' && process.env.RESTRAINT !== '1') { console.error('SWEEP STOP: RESTRAINT=1 required for ARM=restraint.'); process.exit(2); }
if (ARM === 'control' && ('RESTRAINT' in process.env)) { console.error('SWEEP STOP: RESTRAINT must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65721, 65722, 65723, 65724, 65725, 65727, 65728, 65729]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-restraint');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = AD.normBase(base); return ARM === 'restraint' ? RS.armedFor(t) : RS.controlFor(t); }
function policyTag(base) { return AD.normBase(base) + (ARM === 'restraint' ? '-restraint' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// EPERM-flap-hardened write (finding #621): node writeFileSync flaps EPERM
// in long windows; shell writes succeed. Retry EPERM-only with backoff.
function writeFileFlap(fp, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      last = e;
      if (!/EPERM/i.test(String((e && e.code) || '') + String((e && e.message) || ''))) throw e;
      execSync('sleep 20');
    }
  }
  throw last;
}

// Sense material (restraint namespace): say lines around succession events
// (+-2d) and wave-4 deaths (+-1d), filtered to succession/fight/death
// content, bounded. For the SENSE-TEST (does the restraint read as the
// village holding someone back, or as the bot idling?).
function senseWindows(T) {
  const rx = /mantle|codex|scholar|succession|not her|picked up|keep writing|killed|slain|died|death|dead|strike|fight|party|wave|veteran|wound|patrol|hold|wait|restrain|feast/i;
  const out = [];
  const push = (label, lo, hi) => {
    const win = T.sayAll.filter(l => l.day >= lo && l.day <= hi && rx.test(l.text));
    if (win.length) out.push({ label, lo, hi, lines: win.slice(0, 120).map(l => `[d${l.day}] ${l.text}`) });
  };
  for (const s of T.successions) push(`SUCCESSION d${s.day}: ${s.oldName} → ${s.newName} (trust ${s.trust}, ${s.veteran ? 'VETERAN' : 'not-veteran'})`, s.day - 2, s.day + 2);
  for (const d of T.deaths) { if (d.fightWave >= 4) push(`DEATH d${d.day}: ${d.whoName} (${d.cause}, ${d.fightBasis})`, d.day - 1, d.day + 1); }
  return out;
}

// Restraint-namespace extension: per wave-4 combat_start, the fight context
// the mantlechain instrument doesn't capture (feasted state, at-haven).
// Wraps OUTSIDE the instrument's tele wrap; uninstalls inside-out.
function installRestraintExt(Game, T) {
  const otele = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    let r;
    try { r = otele.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      if (type === 'combat_start' && data && (data.wave | 0) >= 4) {
        let feasted = null, atHaven = null;
        try { feasted = !!(Game.feastedActive && Game.feastedActive()); } catch (e) {}
        try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
        T.w4ctx.push({ day: gday(Game), mid: data.vs || null, wave: data.wave | 0, feasted, atHaven });
      }
    } catch (e) { T.extErrors.push('tele:' + String((e && e.message) || e)); }
    return r;
  };
  return { uninstall() { try { Game.tele = otele; } catch (e) {} } };
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'restraint-pilot', fullTelemetry: false });
  const inst = MC.installMantlechain(Game);
  const ext = { w4ctx: [], extErrors: [] };
  const uninstallExt = installRestraintExt(Game, ext);

  // Daily bearer <redacted> (kill-time attribution) + restraint ctx capture.
  const oDaily = policy.daily;
  const bearerByDay = {};
  let lastCtx = null;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstallExt.uninstall(); } catch (e) {}
  inst.uninstall();

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const sg = Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : null; if (sg != null && sg >= 200) table = 1; } catch (e) {}
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Wave-4 kills, kill-time bearer-attributed (sim-killtime MANDATORY):
  // villager kill = w=4, by != bearer-on-that-day, by != 'player'.
  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  // Restraint layer counters (from the run's ctx).
  const rc = {};
  try {
    for (const k of ['restraintPatrolSkips', 'restraintHoldDays', 'restraintSuccessions']) {
      if (lastCtx && Number.isFinite(lastCtx[k])) rc[k] = lastCtx[k];
    }
  } catch (e) {}

  const deathCauses = {};
  let villagerCombatDeaths = 0, starvationDeaths = 0, scholarCombatDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (/starv/i.test(c)) starvationDeaths++;
      if (/combat|fight|monster|wound|bleed|titan/i.test(c)) {
        if (dd.player) scholarCombatDeaths++;
        else villagerCombatDeaths++;
      }
    }
  } catch (e) {}

  const waveKillLog = [];
  try {
    for (const e of (st.waveKillLog || [])) {
      if (!e) continue;
      waveKillLog.push({ d: e.d | 0, mid: e.mid, by: e.by, byName: nameOf(Game, e.by), w: e.w | 0, via: e.via || null });
    }
  } catch (e) {}

  const out = {
    seed, base, arm: ARM, policy: tag,
    instrument: 'mantlechain (succession events + wave-4 combat_start rows + death rows with live-fight wave context) + restraint-ext (per-fight feasted/at-haven, restraint ctx counters, kill-time bearer)',
    substrate: 'mantlechain DIAG substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 ARMORYDRIVE=1)' + (ARM === 'restraint' ? ' +RESTRAINT=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    scaleRank: (() => { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    standing: (() => { try { return Game.villageStandingTotal ? (Game.villageStandingTotal() | 0) : null; } catch (e) { return null; } })(),
    // mantlechain rows (the analyzer's input)
    successions: inst.T.successions,
    fights: inst.T.fights,
    deaths: inst.T.deaths,
    waveKillLog,
    senseWindows: senseWindows(inst.T),
    sayLinesTotal: inst.T.sayAll.length,
    instrumentErrors: inst.T.instrumentErrors.concat(ext.extErrors),
    // restraint mechanism
    restraint: rc,
    w4ctx: ext.w4ctx,
    // guardrails
    w4kills: w4.length,
    nW4Villagers: w4villagers.size,
    w4scholarKills,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    deathCauses, villagerCombatDeaths, starvationDeaths, scholarCombatDeaths,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const tag = policyTag(base);
      const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      console.log(`RUN seed=${seed} base=${base} arm=${ARM}`);
      const t0 = Date.now();
      try {
        const out = await oneRun(seed, base);
        const rc = out.restraint || {};
        console.log(`  done ${(Date.now() - t0) / 1000 | 0}s days=${out.gameDays} w4fights=${out.fights.length} w4kills=${out.w4kills} villW4=${out.nW4Villagers} patrolSkips=${rc.restraintPatrolSkips | 0} holdDays=${rc.restraintHoldDays | 0} errs=${out.instrumentErrors.length} end=${out.endReason} won=${out.won}`);
        rows.push(out);
      } catch (e) {
        console.error(`  RUN FAIL seed=${seed} base=${base}: ${(e && e.message) || e}`);
      }
    }
  }
  console.log(`sweep complete: ${rows.length} configs`);
})().catch(e => { console.error('SWEEP FAIL: ' + (e && e.stack || e)); process.exit(1); });
