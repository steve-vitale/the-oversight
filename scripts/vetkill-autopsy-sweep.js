#!/usr/bin/env node
// vetkill-autopsy-sweep.js — WAVE-4 KILLER AUTOPSY census (flesh-out loop arm
// sim-vetkill-autopsy, axis scale-onramp, run fleshout-20261023T1115Z).
// DIAG arm: instrument-only, ZERO src/js changes. Namespace vetkill-autopsy.
//
// Named next from #837 (sim-defer5gate, evidence/2026-10-23/sim-defer5gate.md):
// the defer5 DIAG proved veterans is the universal binder (short 16/16
// defer5 configs; only 1/16 ever held 2 living veterans; they decayed as
// killers died). The named next: AUTOPSY WHAT KILLS THE WAVE-4 KILLERS —
// death-cause shares on waveKillLog `by` vids.
//
// VERIFIED GRANULARITY GAP (fail-loud, no invention): the retained corpora
// (evidence/2026-10-23/perseed-w5door-b/*/s<seed>.json, 24 configs; plus
// defer5gate-attribution.json) contain NO waveKillLog and empty `kills`
// lists — wave-4+ killer vids are unrecoverable offline. So this script runs
// a FRESH instrumented census and retains the two missing sensor streams:
//   (1) per-event wave-4+ kill records from state.waveKillLog (the SOURCE the
//       gate reads — standing.js waveCombatReadiness(5): entries
//       {d, mid, w, by, via, trick}; the killdisc wrapper's t.kills missed
//       these in w5door-b, so waveKillLog is read directly, never via wrapper)
//   (2) per-villager death rows (lesson #760 format {day, who, kind, cause,
//       player, wave, channel}) so killer vid -> death cause/day is a direct
//       join on vid.
//
// Design: 8 seeds x {lead, belong} = 16 configs, 180d death-aware, the
// armorydrive pinned substrate on both arms (the richest measured door
// substrate — where veterans actually form). Same policies as w5door-b's
// armorydrive arm, split lead/belong.
//
// Substrate (pinned, FAIL LOUD):
//   lead   = AD.armedFor('leadfeast')   + ARMORYDRIVE=1
//   belong = AD.armedFor('belongfeast') + ARMORYDRIVE=1
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1 ARMORYDRIVE=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/
// VETREL/VGEARBEATS/SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
//
// Instruments (all UNMODIFIED, all landed on master):
//   - windowstay window + death-capture layer (scripts/instr-windowstay-20261021.js)
//     via WS.install(Game, t): daily window trace (uw, raw, capped, r4/r5
//     readiness bars incl. veterans count, w4/w5 faced) + t.deathRecs from
//     the 'death' tele (who=villagerId, cause, wave of killer monster).
//   - state.waveKillLog read DIRECTLY post-run (both write sites live in
//     game.js recordWaveKill/recordPyrrhicKill; capped at 1000 entries).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-vetkill-autopsy/{lead,belong}/s<seed>.json.
// The per-seed anchorCommit field is the #793 check: claiming "current
// master" requires anchorCommit == the landing commit, else re-run.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 \
//   ARM=lead SEEDS=65511,65512 node scripts/vetkill-autopsy-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

// Pinned-substrate env guard (vetkill-autopsy namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (armorydrive pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'lead';
  if (ARM !== 'lead' && ARM !== 'belong') { console.error('SWEEP STOP: ARM must be lead|belong.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetkill-autopsy');
fs.mkdirSync(EVID, { recursive: true });

// The #793 anchor: recorded per seed, checked post-rebase before landing.
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() { return ARM === 'belong' ? AD.armedFor('belongfeast') : AD.armedFor('leadfeast'); }
function policyTag() { return (ARM === 'belong' ? 'belong' : 'lead') + '-armorydrive'; }

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'vetkill-autopsy', fullTelemetry: false });
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

  // (1) THE wave-4+ kill sensor: state.waveKillLog read DIRECTLY — the source
  // the veterans bar reads (standing.js:278). Entries {d, mid, w, by, via,
  // trick}; by = killer vid (scholar's own vid for the player). Kept whole
  // (cap 1000 in-engine); the analyzer filters w>=4.
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

  // Scholar vid for the is-scholar flag on kill events.
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}

  // (2) Death rows (lesson #760 autopsy grade) — same shape as w5door-b so
  // the analyzer can reuse the join.
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

  const out = {
    seed, arm: ARM, policyId: policyTag(),
    instrument: 'vetkill-autopsy on windowstay-window-layer+death-capture + direct waveKillLog read',
    substrate: 'AD.armedFor(' + (ARM === 'belong' ? 'belongfeast' : 'leadfeast') + ') — non-seat long substrate + ARMORYDRIVE=1',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1',
    anchorCommit: ANCHOR,
    maxWave, national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, nDeathRows: deathRows.length,
    deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped,
    waveKillLog,
    nWindowTraceDays: t.window.length,
    window: t.window,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, ARM);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return { seed, arm: ARM, w4kills: waveKillLog.filter(e => e.w >= 4).length, deaths: deathRows.length, days: result.days };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    const r = await oneRun(s);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  console.log('VETKILL-AUTOPSY-SWEEP-DONE ' + JSON.stringify({ arm: ARM, seeds: SEEDS, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
