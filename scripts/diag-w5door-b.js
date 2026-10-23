#!/usr/bin/env node
// diag-w5door-b.js — wave-5 DOOR-OPENERS census on current master
// (flesh-out loop arm sim-w5door-b, axis scale-onramp, run
// fleshout-20261023T0515Z). DIAG: instrument-only, zero src/js, zero
// scripts/policies changes. Namespace w5door-b.
//
// Sharp question: how does the wave-5 door open on current master? The
// prior census (sim-wave5door-openers, anchor 7f6f02487, VGEAR/leadfeast
// substrate) measured 1/12 doors, live-demand, post-win. Since then the
// substrate moved (finding #793: s65428's unlock was on a stale base;
// the 0120Z splitclose corpus shows control opening 4/16 doors on the
// armorydrive substrate). This census re-answers on the richest measured
// door substrate (armorydrive, paired control/armed) at the current
// master anchor.
//
// Substrate (pinned, FAIL LOUD):
//   control     = AD.substrateFor('leadfeast'): non-seat long substrate
//                 (SEATDRIVE=0; ARMORYDRIVE unset)
//   armorydrive = AD.armedFor('leadfeast'): SAME substrate + ARMORYDRIVE=1
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1. SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
// SURPLUSFEED/VGEAR/WAVE4ENGAGE must be UNSET.
//
// NO POSTWIN HOOK (deliberate, documented): SEATDRIVE=0 makes wins
// structurally 0, so the stock harness never hits the win flag — the
// 10-22 census's POSTWIN-ALLOW re-drive is dead code here. Matches the
// splitclose reference corpus (6/32 doors without postwin).
//
// Instruments (all UNMODIFIED, all landed on master):
//   - killdisc v2 (scripts/killdisc-instrument-20261021.js)
//   - windowstay window layer (scripts/instr-windowstay-20261021.js): daily
//     window trace (uw, raw, capped, r4/r5 readiness bars, w4/w5 faced)
//   - w5gates-lib (scripts/w5gates-lib.js): post-run unlock gate
//     decomposition (gateVector + attribute)
//   - channel split (scripts/windowreach-r4-channels-20261022.js)
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-w5door-b/{control,armorydrive}/s<seed>.json,
// incl. one JSON row per death (lesson #760: autopsy-grade sweeps persist
// death rows {day, who, kind, cause, player}). The per-seed anchorCommit
// field is the #793 check: a DIAG claiming "current master" must have
// anchorCommit == the landing commit, else re-run before landing.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARM=control SEEDS=65511,65512 node scripts/diag-w5door-b.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=armorydrive SEEDS=65511,65512 node scripts/diag-w5door-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));
const CH = require(path.join(REPO, 'scripts', 'windowreach-r4-channels-20261022'));

// Pinned-substrate env guard (w5door-b namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'armorydrive') { console.error('SWEEP STOP: ARM must be control|armorydrive.'); process.exit(2); }
  if (ARM === 'armorydrive' && process.env.ARMORYDRIVE !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required for ARM=armorydrive.'); process.exit(2); }
  if (ARM === 'control' && ('ARMORYDRIVE' in process.env)) { console.error('SWEEP STOP: ARMORYDRIVE must be unset for ARM=control.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-w5door-b');
fs.mkdirSync(EVID, { recursive: true });

// The #793 anchor: recorded per seed, checked post-rebase before landing.
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() { return ARM === 'armorydrive' ? AD.armedFor('leadfeast') : AD.substrateFor('leadfeast'); }
function policyTag() { return 'leadfeast' + (ARM === 'armorydrive' ? '-armorydrive' : ''); }
function policyDir() { return ARM; }

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'w5door-b', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    deathRecs: [], fightStarts: [],
  };
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

  // No POSTWIN re-drive (documented deviation): SEATDRIVE=0 makes wins
  // structurally 0; the stock harness never hits Game.won. Record the
  // (defensive) win fields anyway.
  let winDay = null, winPath = null;
  let wonFirst = false;
  try { wonFirst = !!Game.won; } catch (e) {}
  if (wonFirst) {
    winDay = gday(Game);
    try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
  }
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const byScholar = (by) => !!(by && (by === scholarVid || by === 'player' || by === 'p'));

  // Engagement census, channel-split (canon #749): herald/titan engagements
  // NEVER enter the TB/field-fight channels — the muster channel is read
  // separately from state.titans.outcomes.
  const engagements = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    const chan = CH.channelOf(Game, e.mid);
    let outcome = null, outcomeSource = 'unrecorded';
    let killJoin = false, killBy = null, killVia = null, killerIsScholar = false;
    if (e.fightId) {
      const o = t.tbOutcomes[e.fightId];
      if (o != null) { outcome = String(o); outcomeSource = 'tbEnd'; }
    }
    for (const k of t.kills) {
      if ((k.wave | 0) < 4) continue;
      const fidMatch = e.fightId && k.ctx && k.ctx.fightId === e.fightId;
      const dayMidMatch = !e.fightId && k.day === e.day && k.mid === e.mid;
      if (fidMatch || dayMidMatch) {
        killJoin = true; killBy = k.by; killVia = k.via; killerIsScholar = byScholar(k.by);
        break;
      }
    }
    engagements.push({
      d: e.day, mid: e.mid, wave: e.wave, channel: chan,
      shape: e.shape, party: e.partySize, started: !!e.started,
      fightIdPresent: !!e.fightId, outcome, outcomeSource,
      killJoin, killBy, killVia, killerIsScholar,
    });
  }
  engagements.sort((a, b) => a.d - b.d);

  const fieldFights = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, channel: CH.channelOf(Game, f.mid),
    outcome: f.outcome, rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  fieldFights.sort((a, b) => a.d - b.d);

  const fieldFightsAll = t.fieldFights.map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
  }));
  fieldFightsAll.sort((a, b) => a.d - b.d);

  const kills = t.kills.filter(k => (k.wave | 0) >= 4).map(k => ({
    d: k.day, mid: k.mid, wave: k.wave, channel: CH.channelOf(Game, k.mid),
    by: k.by, via: k.via, pyrrhic: !!k.pyrrhic,
    byScholar: byScholar(k.by), hasFightId: !!(k.ctx && k.ctx.fightId),
  }));
  kills.sort((a, b) => a.d - b.d);

  const spawns = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({
    d: s.day, mid: s.mid, wave: s.wave, channel: CH.channelOf(Game, s.mid),
    veteran: s.veteran, src: s.src,
  }));
  spawns.sort((a, b) => a.d - b.d);

  // Titan (muster) channel: the herald split. Outcomes recorded by the
  // engine in state.titans.outcomes — 'refused'|'fought'|'stood-down' then
  // 'slain'|'fled'.
  const titanOutcomes = CH.readTitanOutcomes(Game);

  // Unlock days from the window trace (first day uw >= 4 / >= 5) + the
  // readiness-bar release days for waves 4/5.
  let w4Day = null, w5Day = null;
  for (const w of t.window) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }
  let demand5 = null, demand4 = null;
  try {
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    demand5 = (sc && sc.readyDemand && sc.readyDemand[5]) || null;
    demand4 = (sc && sc.readyDemand && sc.readyDemand[4]) || null;
  } catch (e) {}
  const barRelease = { armored: null, armed: null, tricks: null, veterans: null };
  const barRelease4 = { armored: null, armed: null, tricks: null, veterans: null };
  if (demand5) {
    for (const w of t.window) {
      const b = w.r5 || {};
      if (barRelease.armored == null && (b.armored | 0) >= (demand5.armored | 0)) barRelease.armored = w.day;
      if (barRelease.armed == null && (b.armed | 0) >= (demand5.armed | 0)) barRelease.armed = w.day;
      if (barRelease.tricks == null && (b.tricks | 0) >= (demand5.tricks | 0)) barRelease.tricks = w.day;
      if (barRelease.veterans == null && (b.veterans | 0) >= (demand5.veterans | 0)) barRelease.veterans = w.day;
    }
  }
  if (demand4) {
    for (const w of t.window) {
      const b = w.r4 || {};
      if (barRelease4.armored == null && (b.armored | 0) >= (demand4.armored | 0)) barRelease4.armored = w.day;
      if (barRelease4.armed == null && (b.armed | 0) >= (demand4.armed | 0)) barRelease4.armed = w.day;
      if (barRelease4.tricks == null && (b.tricks | 0) >= (demand4.tricks | 0)) barRelease4.tricks = w.day;
      if (barRelease4.veterans == null && (b.veterans | 0) >= (demand4.veterans | 0)) barRelease4.veterans = w.day;
    }
  }

  // w5gates-lib attribution (UNMODIFIED): the end-of-run gate vector.
  let gateVector = null, gateErr = null;
  try { gateVector = G5.gateVector(Game); } catch (e) { gateErr = String((e && e.message) || e); }

  // Death rows: lesson #760 autopsy grade — one row per death.
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
    instrument: 'w5door-b on killdisc-v2+windowreach-layer+death-capture',
    substrate: ARM === 'armorydrive'
      ? 'AD.armedFor(leadfeast) — non-seat long substrate + ARMORYDRIVE=1'
      : 'AD.substrateFor(leadfeast) — non-seat long substrate (ARMORYDRIVE unset)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1' + (ARM === 'armorydrive' ? ' ARMORYDRIVE=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, barRelease, barRelease4, demand5, demand4,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, nDeathRows: deathRows.length,
    deathRows,
    nWindowTraceDays: t.window.length,
    nTitansOutcomes: titanOutcomes.length,
    titanOutcomes,
    gateVector, gateErr,
    engagements, fieldFights, fieldFightsAll, kills, spawns,
    fightStarts: t.fightStarts,
    window: t.window,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyDir());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

async function runPhase(label, seeds) {
  const rows = [];
  console.log(`w5door-b ${label}: arm=${ARM} seeds=${seeds.join(',')}`);
  for (const seed of seeds) {
    const t0 = Date.now();
    try {
      const r = await oneRun(seed);
      rows.push(r);
      console.log(`done ${r.policyId} s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w4Day=${r.w4Day} w5Day=${r.w5Day} won=${r.won} ` +
        `titans=${r.nTitansOutcomes} eng5=${r.engagements.filter(e => e.wave === 5 && e.channel === 'monster').length} errs=${r.instrumentErrors.length} ` +
        `(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e) {
      console.error(`ERROR ${ARM} s${seed}: ${e && e.message}`);
      rows.push({ seed, arm: ARM, error: String(e && e.message) });
    }
  }
  return rows;
}

module.exports = { checkEnv, policyFor, policyTag, ANCHOR };

if (require.main === module) {
  (async () => {
    const rows = await runPhase('pilot', SEEDS);
    const ok = rows.filter(r => !r.error);
    const unlocked = ok.filter(r => r.w5Day != null);
    console.log(`pilot done: n=${ok.length} errors=${rows.length - ok.length} doors=${unlocked.length}`);
    console.log(JSON.stringify({
      instrument: 'w5door-b', arm: ARM, n: ok.length, errors: rows.length - ok.length,
      runsUnlocked5: unlocked.length,
      runsUnlocked4: ok.filter(r => r.w4Day != null).length,
      totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
      totalTitanOutcomes: ok.reduce((a, r) => a + (r.nTitansOutcomes || 0), 0),
    }, null, 1));
    fs.writeFileSync(path.join(EVID, `corpus-summary-${ARM}.json`),
      JSON.stringify({
        arm: ARM, anchor: ANCHOR, n: ok.length, errors: rows.length - ok.length,
        runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, w4Day: r.w4Day || null, w5Day: r.w5Day || null, won: r.won || 0 })),
        unlocked: unlocked.map(r => ({ seed: r.seed, policyId: r.policyId, w5Day: r.w5Day })),
      }, null, 1) + '\n');
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
