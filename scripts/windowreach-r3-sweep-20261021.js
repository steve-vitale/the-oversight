#!/usr/bin/env node
// windowreach-r3-sweep-20261021.js — post-unlock-window diagnostic sweep,
// round 3 (flesh-out loop arm sim-windowreach-r3, axis scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Three phases (one invocation per phase; SEEDS/POLICIES/DAYS/EVID
// select the work):
//   Phase 1 (reproducibility screen): SEEDS=64406,64703,64858
//     POLICIES=leadfeast,belongfeast DAYS=180 — do the measured unlocks
//     survive the sim-w5drift drift (00412b13f partial-pantry-gifts)?
//   Phase 2 (fresh-seed unlock screen): SEEDS=65001..65016 (verified unused)
//     POLICIES=leadfeast,belongfeast DAYS=120 — a screen, not a census.
//   Phase 3 (window census): the unlocking runs from phases 1+2 re-run at
//     DAYS=180. Phase-1 unlocking runs already ran 180d — they serve as
//     their own census; only phase-2 unlocks need the extension (deterministic
//     rerun = true extension: the first 120 days are trajectory-identical).
//
// Substrate: VCE.armedFor(base) (VGEAR=1 winning substrate, pinned in
// scripts/policies/vgearconfirm.js).
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// VGEAR=1 KILLDISC=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset.
// SWEEP FAILS LOUD unless the env matches exactly.
//
// INSTRUMENT: scripts/windowreach-r3-instrument-20261021.js (the r3 window
// layer on top of the killdisc v2 base — NOT modified). Fight ids contain
// Date.now() — they are used in-process only for the engagement<->kill/
// outcome joins and are NEVER persisted (bool flags only), so per-seed JSONs
// are re-run byte-identical.
//
// #760 fields (the vgear/twovets instruments never recorded them): on every
// run the sweep records winTrack{path,branch,resolution,phase} (from
// Game.tableState() when Game.won — every win variety sets these before
// won=true; Game.wipe() only deletes the save blob, never Game.state),
// seat (Game.tableSeat(), pure), rankAtEnd (Game.scaleRank()), maxRank +
// everNational (from the daily rank trace). All pure reads.
//
// Writes per-seed JSONs ONCE, on purpose, to
// $EVID/{policy}/s<seed>.json and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEEDS=64406,64703,64858 POLICIES=leadfeast,belongfeast DAYS=180 \
//   EVID=evidence/2026-10-21/perseed-windowreach-r3/phase1 \
//   node scripts/windowreach-r3-sweep-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));
const WI = require(path.join(REPO, 'scripts', 'windowreach-r3-instrument-20261021'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`SWEEP STOP: ${k} must be UNSET on this substrate.`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('SWEEP STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!WI.instrumentOn()) { console.error('SWEEP STOP: window instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64406, 64703, 64858]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-windowreach-r3');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'windowreach-r3', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
  };
  const uninstall = WI.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const byScholar = (by) => !!(by && (by === scholarVid || by === 'player' || by === 'p'));

  // wave-4+ engagements with the fight-id joins done IN PROCESS (raw fight
  // ids are never persisted — bool flags only).
  const engagements = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
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
      d: e.day, mid: e.mid, wave: e.wave, shape: e.shape,
      party: e.partySize, started: !!e.started,
      fightIdPresent: !!e.fightId, outcome, outcomeSource,
      killJoin, killBy, killVia, killerIsScholar,
    });
  }
  engagements.sort((a, b) => a.d - b.d);

  const fieldFights = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
    rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  fieldFights.sort((a, b) => a.d - b.d);

  const kills = t.kills.filter(k => (k.wave | 0) >= 4).map(k => ({
    d: k.day, mid: k.mid, wave: k.wave, by: k.by, via: k.via,
    pyrrhic: !!k.pyrrhic, shape: KD.classifyKill(k, k.ctx),
    byScholar: byScholar(k.by), hasFightId: !!(k.ctx && k.ctx.fightId),
  }));
  kills.sort((a, b) => a.d - b.d);

  const spawns = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({
    d: s.day, mid: s.mid, wave: s.wave, veteran: s.veteran, src: s.src,
  }));
  spawns.sort((a, b) => a.d - b.d);

  // Wall numbers + deaths.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}

  // #760: winTrack{path,seat} + regional-at-win + ever-national. All pure
  // reads; the win varieties all set tableState() before won=true.
  let winTrack = null, seat = null, rankAtEnd = 'unknown';
  if (won) {
    try {
      const ts = (typeof Game.tableState === 'function') ? Game.tableState() : {};
      winTrack = {
        path: ts.path || null, branch: ts.branch || null,
        resolution: (ts.resolution && ts.resolution.title) || null,
        finalId: (ts.resolution && ts.resolution.finalId) || null,
        phase: ts.phase || null,
      };
    } catch (e) { winTrack = { error: String((e && e.message) || e) }; }
    try {
      const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
      seat = s ? { seat: s.seat || null, detail: s.detail || null } : null;
    } catch (e) { seat = { error: String((e && e.message) || e) }; }
  }
  try { const r = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : 'unknown'; rankAtEnd = (typeof r === 'string' && r) ? r : 'unknown'; } catch (e) {}
  let maxRank = 'village', everNational = 0;
  try {
    let mo = -1;
    for (const w of t.window) {
      const ro = WI.rankOrd(w.rank);
      if (ro > mo) { mo = ro; maxRank = w.rank; }
    }
    everNational = mo >= WI.rankOrd('national') ? 1 : 0;
  } catch (e) {}

  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Unlock days from the window trace (first day uw >= 4 / >= 5).
  let w4Day = null, w5Day = null;
  for (const w of t.window) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }

  const out = {
    seed, policyId, instrument: 'windowreach-r3-on-killdisc-v2',
    substrate: 'VCE.armedFor (withVillagerGear(withSeatDrive(withWinDefer(TF base)))) + KILLDISC=1 (v2 base + r3 window layer)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1, SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, national, table, won,
    winTrack, seat, rankAtEnd, maxRank, everNational,
    days: result.days, gameDays, endReason: result.endReason,
    deaths, deathList,
    nWindowTraceDays: t.window.length,
    w4Engagements: engagements.length, w4FieldFights: fieldFights.length,
    w4Kills: kills.length, w4Spawns: spawns.length,
    window: t.window,
    engagements, fieldFights, kills, spawns,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  console.log(`windowreach-r3 sweep: seeds=${SEEDS.join(',')} policies=${POLICIES.join(',')} days=${DAYS}`);
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w5Day=${r.w5Day} won=${r.won} ` +
          `winPath=${r.winTrack ? r.winTrack.path : '-'} seat=${r.seat ? r.seat.seat : '-'} rank=${r.rankAtEnd} everNat=${r.everNational} ` +
          `w4eng=${r.w4Engagements} w4ff=${r.w4FieldFights} w4kills=${r.w4Kills} errs=${r.instrumentErrors.length} ` +
          `(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  console.log(JSON.stringify({
    instrument: 'windowreach-r3', n: ok.length, errors: rows.length - ok.length,
    runsUnlocked5: ok.filter(r => r.w5Day != null).length,
    runsUnlocked4: ok.filter(r => r.w4Day != null).length,
    totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
  }, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'),
    JSON.stringify({ n: ok.length, errors: rows.length - ok.length, seeds: SEEDS, policies: POLICIES, days: DAYS }, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
