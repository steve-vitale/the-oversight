#!/usr/bin/env node
// killdisc-sweep-20261021.js — sim-killdisc STAGE 2 diagnostic sweep
// (backlog #736, zero-veteran survivors).
//
// 8 seeds x {leadfeast, belongfeast} = 16 runs, 180d death-aware, on the
// SEATDRIVE=1 substrate (the fullseat seatdrive substrate —
// withSeatDrive(withWinDefer(TF leadfeast/belongfeast)), FEASTSCALE_R13=1)
// + KILLDISC v2 read-only instrument. Same seeds (64501-64508) as the
// committed fullseat corpus (evidence/2026-10-21/perseed-fullseat) on the
// same substrate, so per-day trajectory hashes can be checked against the
// committed corpus for base fidelity ("base pinned").
//
// INSTRUMENT: loadGame({seed, mode:'killdisc2', fullTelemetry:false}) +
// scripts/policies/tribfloor leadfeast/belongfeast + scripts/
// killdisc-instrument-20261021.js (KILLDISC=1) + runDays({days:180}).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-killdisc/{policy}/s<seed>.json and prints a
// summary. No timestamps or timings are written, so re-runs are
// byte-comparable (fight ids are never persisted — see the instrument
// header).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 KILLDISC=1 \
//   SEEDS=64501,64502 node scripts/killdisc-sweep-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() false despite SEATDRIVE=1.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag layerOn() false despite FULLSEAT=1.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64501, 64502, 64503, 64504, 64505, 64506, 64507, 64508]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-killdisc');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// Policy composition — the seatdrive substrate, identical to the fullseat
// corpus (scripts/probe-fullseat-20261021.js): withFullseatDiag(
// withSeatDrive(withWinDefer(TF base))). The fullseat-diag layer is a
// read-only instrument (proven byte-identical in the corpus); its ctx record
// also gives us the component vector for correlation.
function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  return FD.withFullseatDiag(sd, `${tag}-fullseat`, `${policyId} + full-seat component recorder (FULLSEAT=1)`);
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'killdisc2', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  let lastCtx = null;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      lastCtx = ctx;
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  let diag = null;
  try {
    const D = lastCtx && lastCtx._fullseatdiag;
    if (D) diag = { maxReach: D.maxReach, bestSeatEver: D.bestSeatEver, indispEver: D.indispEver };
  } catch (e) { diag = { err: String(e && e.message || e) }; }

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // wave-4+ unlock days from the census
  let w4Day = null, w5Day = null, maxRaw = 0, maxCapped = 0, veteranDays = 0, zeroVeteranAfterCapped200 = false;
  try {
    for (const c of t.census) {
      if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
      if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
      if ((c.raw | 0) > maxRaw) maxRaw = c.raw | 0;
      if ((c.capped | 0) > maxCapped) maxCapped = c.capped | 0;
      if ((c.veterans | 0) > 0) veteranDays++;
    }
    // #736 signature: capped standing >=200 reached while veterans stayed 0
    for (const c of t.census) {
      if ((c.capped | 0) >= 200 && (c.veterans | 0) === 0) { zeroVeteranAfterCapped200 = true; break; }
    }
  } catch (e) {}

  // wave-4+ kills with channel attribution
  const kills4 = [];
  let unexplainedKills = 0;
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  for (const k of t.kills) {
    if ((k.wave | 0) < 4) continue;
    const shape = KD.classifyKill(k, k.ctx);
    const unknownVia = !k.via || k.via === 'unknown';
    if (unknownVia) unexplainedKills++;
    const byScholar = !!(k.by && (k.by === scholarVid || k.by === 'player' || k.by === 'p' || (k.ctx && k.by === k.ctx.scholarVid)));
    kills4.push({
      d: k.day, mid: k.mid, w: k.wave, by: k.by, via: k.via, pyrrhic: !!k.pyrrhic,
      shape, unknownVia, byScholar,
    });
  }
  kills4.sort((a, b) => a.d - b.d);

  // wave-4+ field fights (villager-side engagements) with outcome classes
  const ff4 = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, w: f.wave, outcome: f.outcome,
    rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  ff4.sort((a, b) => a.d - b.d);

  // wave-4+ scholar TB engagements matched with tbEnd outcome + dmg + kills
  const tb4 = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    const end = e.fightId ? (t.tbOutcomes[e.fightId] || null) : null;
    const dt = e.fightId && t.dmg[e.fightId] ? {
      scholar: Math.round(t.dmg[e.fightId].scholar), companion: Math.round(t.dmg[e.fightId].companion),
      other: Math.round(t.dmg[e.fightId].other), hits: t.dmg[e.fightId].hits,
    } : null;
    const k4 = kills4.filter(k => k.d === e.day && k.mid === e.mid);
    tb4.push({ d: e.day, mid: e.mid, w: e.wave, shape: e.shape, party: e.partySize, end, dmg: dt, kills: k4.length, started: !!e.started });
  }
  tb4.sort((a, b) => a.d - b.d);

  // wave-4+ spawns (cast + world-entity paths)
  const sp4 = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({ d: s.day, mid: s.mid, w: s.wave, veteran: s.veteran, src: s.src }));
  sp4.sort((a, b) => a.d - b.d);

  const out = {
    seed, policyId, instrument: 'killdisc-v2',
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast/belongfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 + KILLDISC=1 (v2 instrument)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day, maxRawStanding: maxRaw, maxCappedStanding: maxCapped,
    zeroVeteranAfterCapped200, veteranCensusDays: veteranDays,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    w4Spawns: sp4.length, w4WorldSpawns: sp4.filter(s => s.src === 'world').length, w4FieldFights: ff4.length, w4TbEngagements: tb4.length,
    w4Kills: kills4.length, w4UnexplainedKills: unexplainedKills,
    spawns: sp4, fieldFights: ff4, tb: tb4, kills: kills4,
    hashes, diag,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: w4sp=${r.w4Spawns} w4ff=${r.w4FieldFights} w4tb=${r.w4TbEngagements} w4kills=${r.w4Kills} uxk=${r.w4UnexplainedKills} errs=${r.instrumentErrors.length} end=${r.endReason}`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, instrument: 'killdisc-v2', error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const summary = {
    instrument: 'killdisc-v2', n: ok.length, errors: rows.length - ok.length,
    totalW4Spawns: ok.reduce((a, r) => a + r.w4Spawns, 0),
    totalW4FieldFights: ok.reduce((a, r) => a + r.w4FieldFights, 0),
    totalW4Tb: ok.reduce((a, r) => a + r.w4TbEngagements, 0),
    totalW4Kills: ok.reduce((a, r) => a + r.w4Kills, 0),
    totalUnexplainedKills: ok.reduce((a, r) => a + r.w4UnexplainedKills, 0),
    runsWave4: ok.filter(r => r.wave4).length,
  };
  console.log(JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'), JSON.stringify(summary, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
