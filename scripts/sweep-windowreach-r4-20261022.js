#!/usr/bin/env node
// sweep-windowreach-r4-20261022.js — the first post-UNLOCK wave-5 REACH
// census on current master (flesh-out loop arm sim-windowreach-r4, axis
// scale-onramp). DIAG: instrument-only, no lever.
//
// INSTRUMENT-ONLY: zero src/js changes, zero scripts/policies changes.
// Layers (all UNMODIFIED, all proven):
//   - killdisc v2 base (scripts/killdisc-instrument-20261021.js): TB
//     engagements (incl. TB-REFUSED), kills, field fights, spawns,
//     tbOutcomes, per-source damage.
//   - windowreach window layer (via instr-windowstay-20261021.js): daily
//     window trace (uw, raw, capped, r4/r5 readiness bars, w4/w5 faced,
//     roster, rank).
//   - death-capture layer (via instr-windowstay-20261021.js): death teles,
//     phantom check, player-flag repair cross-check, fight routers.
//   - w5gates-lib (scripts/w5gates-lib.js, UNMODIFIED): post-run unlock
//     gate decomposition (gateVector + attribute).
//   - windowreach-r4-channels (scripts/windowreach-r4-channels-20261022.js):
//     herald-vs-monster channel split (canon #749 — titans fight through
//     the coalition/muster channel, monsters through TB/field fights).
//
// POST-WIN CONTINUATION (the windowstay-r2 oneRun pattern): the stock
// harness stops at the win flag (Game.over=true) while the village is
// alive in memory. The sweep flips Game.over=false (the ONE documented
// engine mutation in this arm's tooling, POSTWIN-ALLOW) and re-drives the
// same state for (180 - winDay) days. A post-win village-lost sets
// Game.over WITHOUT Game.won — the hook never fires and the death-aware
// end is preserved.
//
// Phase A: s65428 x {leadfeast,belongfeast} (the first unlocking seed on
// current master, from the sim-armorcatch pilot corpus: maxWave 5 BOTH
// arms). DIAG-GO (a): unlock re-verified on the plain VGEAR stack.
// Phase B (expansion, only if zero unlocks in phase A): 65421-65428 x
// {leadfeast,belongfeast}. Zero unlocks anywhere -> DIAG insufficient-data
// (report-only, NOT a kill).
//
// Substrate: VCE.armedFor (VGEAR=1 winning substrate, plain — no armorcatch
// layer). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
// SEATDRIVE=1 VGEAR=1 KILLDISC=1 POSTWIN=1;
// SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED
// unset. SWEEP FAILS LOUD unless the env matches exactly.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-windowreach-r4/{policy}/s<seed>.json,
// incl. one JSON row per death (lesson #760: autopsy-grade sweeps persist
// death rows {day, who, kind, cause, player}).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 POSTWIN=1 \
//   node scripts/sweep-windowreach-r4-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib'));
const CH = require('./windowreach-r4-channels-20261022');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC', 'POSTWIN']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument/postwin).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED']) {
  if (process.env[k] != null) { console.error(`SWEEP STOP: ${k} must be UNSET on this substrate.`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('SWEEP STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }

const PHASE_A = { seeds: [65428], policies: ['leadfeast', 'belongfeast'] };
const PHASE_B = { seeds: [65421, 65422, 65423, 65424, 65425, 65426, 65427, 65428], policies: ['leadfeast', 'belongfeast'] };
const EVID = path.join(REPO, 'evidence', '2026-10-22', 'perseed-windowreach-r4');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'windowreach-r4', fullTelemetry: false });
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
  let result = await quietLog(async () => { return await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  // POST-WIN CONTINUATION (windowstay-r2 oneRun pattern, proven on 16 runs).
  let winDay = null, winPath = null, winResumed = false, postWinDays = 0, endReasonFirst = result.endReason;
  let wonFirst = false;
  try { wonFirst = !!Game.won; } catch (e) {}
  if (Game.over && wonFirst) {
    winDay = gday(Game);
    try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    const remaining = Math.max(0, 180 - winDay);
    if (remaining > 0) {
      Game.over = false; // POSTWIN-ALLOW: the one documented engine flip
      winResumed = true;
      result = await quietLog(async () => { return await runDays(Game, wrapped, { days: remaining, manifest: undefined, sampleEvery: 30 }); });
      postWinDays = gday(Game) - winDay;
    }
  }
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const byScholar = (by) => !!(by && (by === scholarVid || by === 'player' || by === 'p'));

  // Engagement census, channel-split (canon #749): herald/titan engagements
  // NEVER enter the TB/field-fight channels — the muster channel is read
  // separately from state.titans.outcomes (see titanOutcomes below).
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
  // readiness-bar release days for wave 5 (r5.* first day >= demand).
  let w4Day = null, w5Day = null;
  for (const w of t.window) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }
  let demand5 = null;
  try {
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    demand5 = (sc && sc.readyDemand && sc.readyDemand[5]) || null;
  } catch (e) {}
  const barRelease = { armored: null, armed: null, tricks: null, veterans: null };
  if (demand5) {
    for (const w of t.window) {
      const b = w.r5 || {};
      if (barRelease.armored == null && (b.armored | 0) >= (demand5.armored | 0)) barRelease.armored = w.day;
      if (barRelease.armed == null && (b.armed | 0) >= (demand5.armed | 0)) barRelease.armed = w.day;
      if (barRelease.tricks == null && (b.tricks | 0) >= (demand5.tricks | 0)) barRelease.tricks = w.day;
      if (barRelease.veterans == null && (b.veterans | 0) >= (demand5.veterans | 0)) barRelease.veterans = w.day;
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
    seed, policyId, instrument: 'windowreach-r4-on-killdisc-v2+windowreach-layer+death-capture',
    substrate: 'VCE.armedFor (withVillagerGear(withSeatDrive(withWinDefer(TF base)))) plain — no armorcatch layer',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 POSTWIN=1, SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/SURPLUSFEED unset',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, barRelease, demand5,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endReasonFirst, wonFirst,
    winDay, winPath, winResumed, postWinDays,
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
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

async function runPhase(label, seeds, policies) {
  const rows = [];
  console.log(`windowreach-r4 ${label}: seeds=${seeds.join(',')} policies=${policies.join(',')}`);
  for (const seed of seeds) {
    for (const policyId of policies) {
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w5Day=${r.w5Day} won=${r.won} ` +
          `winResumed=${r.winResumed} winDay=${r.winDay} winPath=${r.winPath} titans=${r.nTitansOutcomes} ` +
          `eng5=${r.engagements.filter(e => e.wave === 5 && e.channel === 'monster').length} errs=${r.instrumentErrors.length} ` +
          `(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, error: String(e && e.message) });
      }
    }
  }
  return rows;
}

(async () => {
  let rows = await runPhase('phaseA', PHASE_A.seeds, PHASE_A.policies);
  let ok = rows.filter(r => !r.error);
  let unlocked = ok.filter(r => r.w5Day != null);
  if (!unlocked.length) {
    console.log('phaseA: ZERO unlocks — expanding to phaseB (65421-65428 x 2 policies)');
    const bRows = await runPhase('phaseB', PHASE_B.seeds, PHASE_B.policies);
    rows = rows.concat(bRows);
    ok = rows.filter(r => !r.error);
    unlocked = ok.filter(r => r.w5Day != null);
  }
  console.log(JSON.stringify({
    instrument: 'windowreach-r4', n: ok.length, errors: rows.length - ok.length,
    runsUnlocked5: unlocked.length,
    runsUnlocked4: ok.filter(r => r.w4Day != null).length,
    runsWinResumed: ok.filter(r => r.winResumed).length,
    totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
    totalTitanOutcomes: ok.reduce((a, r) => a + (r.nTitansOutcomes || 0), 0),
  }, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'),
    JSON.stringify({
      n: ok.length, errors: rows.length - ok.length,
      runs: rows.map(r => ({ seed: r.seed, policyId: r.policyId, w5Day: r.w5Day || null, won: r.won || 0 })),
      unlocked: unlocked.map(r => ({ seed: r.seed, policyId: r.policyId, w5Day: r.w5Day, winDay: r.winDay })),
    }, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
