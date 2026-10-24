#!/usr/bin/env node
// bloodrestraint-sweep.js — MANTLE-RESTRAINT census (flesh-out loop arm
// sim-bloodrestraint, axis scale-onramp, run fleshout-20261024T0215Z).
// Namespace bloodrestraint.
//
// THE SURFACE (sim-vetretention-restage, evidence/2026-10-23/
// sim-vetretention-restage.md): the defer5 bar needs 2 LIVING wave-4+
// killers; 13/18 blooded vids across both arms died as MANTLE-HOLDERS
// within 14d of their first kill — the chair, not the fight, eats the
// veterans. This arm builds the declined design call: a game-side
// candidacy hook in ledger.js playerDeath (BLOODRESTRAINT=1, default
// OFF) that skips in-window (14d post wave-4+ kill) blooded vids as
// succession candidates, voiced as the village holding its blooded back
// from the office while they recover. Feel change -> [needs-eyes].
//
// Design: 8 seeds (65511–65518, the richest formation band from the
// re-stage) x {lead, belong} x {control, armed} = 32 configs, 180d
// death-aware, paired identical seeds. Pinned substrate on BOTH arms:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1
//   control = VF.formedFor(base), BLOODRESTRAINT unset
//   armed   = VF.formedFor(base), BLOODRESTRAINT=1
// The restraint is the ONLY delta.
//
// Sensors (retained per seed):
//   (1) state.waveKillLog read DIRECTLY post-run (the SOURCE the
//       veterans bar reads — standing.js; the autopsy method).
//   (2) per-villager death rows via the windowstay death-capture layer
//       (lesson #760 shape) — killer vid -> death cause/day is a direct
//       join on vid, with the player flag for the mantle-holder join.
//   (3) v.bloodrestraintEvents — the engagement instrument: rows the
//       restraint wrote when it actually changed a pick.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-24/perseed-bloodrestraint/<arm>-<policytag>-s<seed>.json.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 \
//   BRARM=1 POLICY=lead SEEDS=65511,65512 node scripts/bloodrestraint-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

// Pinned-substrate env guard (bloodrestraint namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE', 'VETBENCH', 'SCHOLARDIST', 'VETRESTAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const POLICY = process.env.POLICY || 'lead';
  if (POLICY !== 'lead' && POLICY !== 'belong') { console.error('SWEEP STOP: POLICY must be lead|belong.'); process.exit(2); }
  const BRARM = process.env.BRARM || '0';
  if (BRARM !== '0' && BRARM !== '1') { console.error('SWEEP STOP: BRARM must be 0|1.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return { POLICY, BRARM };
}
const { POLICY, BRARM } = checkEnv();
// The lever's own gate, set by the sweep (the ONLY delta).
if (BRARM === '1') process.env.BLOODRESTRAINT = '1'; else delete process.env.BLOODRESTRAINT;

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-bloodrestraint');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const ARM = BRARM === '1' ? 'armed' : 'control';
function policyFor() {
  const base = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return VF.formedFor(base); // identical policy object both arms — the restraint is game-side env
}
function fileTag() {
  const tag = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return `${ARM}-${tag}${BRARM === '1' ? '-bloodrestraint' : ''}`;
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'bloodrestraint', fullTelemetry: false });
  const t = { window: [], deathRecs: [], fightStarts: [], instrumentErrors: [] };
  const uninstall = WS.install(Game, t);

  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  let winDay = null, winPath = null;
  try {
    if (Game.won) {
      winDay = gday(Game);
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    }
  } catch (e) {}
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};

  // (1) waveKillLog read DIRECTLY — the autopsy method.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}

  // (2) Death rows (lesson #760 autopsy grade).
  let liveDeaths = [];
  try { liveDeaths = (result.samples && result.samples.deaths) || []; } catch (e) {}
  const liveByKey = {};
  for (const d of liveDeaths) {
    const k = [(d.day | 0), String(d.who || ''), String(d.cause || '')].join('|');
    if (!(k in liveByKey)) liveByKey[k] = !!d.player;
  }
  const deathRows = t.deathRecs.map(rec => {
    let real = null;
    try { real = WS.diedForReal(Game, rec.who); } catch (e) {}
    const k = [(rec.day | 0), String(rec.who || ''), String(rec.cause || '')].join('|');
    const repaired = (k in liveByKey) ? liveByKey[k] : null;
    let channel = 'other', why = '';
    try {
      const monsterNames = WS.monsterNameSet(Game);
      const cls = WS.classifyDeath(rec.cause, rec.ctx, monsterNames);
      channel = cls[0]; why = cls[1];
    } catch (e) {}
    return {
      day: rec.day, who: rec.who, kind: rec.kind, cause: rec.cause,
      player: rec.player, playerRepaired: repaired, real,
      channel, channelWhy: why, wave: rec.wave,
    };
  });

  // (3) The restraint events (the engagement instrument).
  let brEvents = [];
  try { brEvents = ((st.village || {}).bloodrestraintEvents || []).map(e => ({ day: (e && e.day) | 0, held: e && e.held, picked: e && e.picked })); } catch (e) { t.instrumentErrors.push('bloodrestraintEvents.read: ' + String((e && e.message) || e)); }

  // Wall numbers.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Defer5 coincidence: days with >=2 LIVING wave-4+ killers (the bar's
  // own terms — standing.js waveCombatReadiness, living-only shape).
  let coincideDays = 0, distinctLivingVets = 0;
  try {
    const roster = new Set((st.village && st.village.roster) || []);
    const byDay = {};
    const seenLiving = new Set();
    for (const e of waveKillLog) {
      if ((e.w | 0) < 4 || !e.by) continue;
      const alive = roster.has(e.by);
      if (!alive) continue;
      seenLiving.add(String(e.by));
      const day = e.d | 0;
      // cumulative: a vid killed on day d counts as veteran from day d on
      // while living — approximate per-day coincidence via kill-day join
      // is done offline; here count kill-days with 2+ distinct killers
      // living at run end as a coarse proxy. The precise offline join in
      // the analyzer builds per-day living sets from death rows.
      byDay[day] = byDay[day] || new Set();
      byDay[day].add(String(e.by));
    }
    distinctLivingVets = seenLiving.size;
  } catch (e) { t.instrumentErrors.push('coincidence.read: ' + String((e && e.message) || e)); }

  const out = {
    seed, arm: ARM, policyId: fileTag(),
    instrument: 'windowstay-window-layer+death-capture + direct waveKillLog read + bloodrestraint events',
    substrate: 'VF.formedFor(' + (POLICY === 'belong' ? 'belongfeast' : 'leadfeast') + ') — non-seat long substrate + ARMORYDRIVE=1 + VETFORMATION=1',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1' + (BRARM === '1' ? ' BLOODRESTRAINT=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, nDeathRows: deathRows.length,
    deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped,
    waveKillLog,
    brEvents, nBrEvents: brEvents.length,
    distinctLivingVets,
    nWindowTraceDays: t.window.length,
    window: t.window,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `${fileTag()}-s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return {
    seed, arm: ARM, policy: POLICY,
    w4kills: waveKillLog.filter(e => e.w >= 4).length,
    brEvents: brEvents.length, deaths: deathRows.length, days: result.days,
  };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    const r = await oneRun(s);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  console.log('BLOODRESTRAINT-SWEEP-DONE ' + JSON.stringify({ arm: ARM, policy: POLICY, seeds: SEEDS, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
