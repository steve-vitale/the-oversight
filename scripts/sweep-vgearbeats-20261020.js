#!/usr/bin/env node
// sweep-vgearbeats-20261020.js — sim-vgearbeats measurement corpus.
//
// 4 fresh seeds (64023-64026) x {leadfeast, belongfeast} x {vgear, vbeats}
// = 16 runs, 180d death-aware, on the exact w5doormeasure pre-seat+windefer
// substrate (same as the sim-villagergear pilot):
//
//   policy = withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (VETREL/REPOSITION unset ->
//        inert; SEATDRIVE=0 -> seatdrive pure delegation)
//   vgear arm  = VG.withVillagerGear(<stack>) OUTSIDE the stack, VGEAR=1
//   vbeats arm = VB.withVGearBeats(<vgear>) OUTSIDE vgear, VGEAR=1+VGEARBEATS=1
//
// The sweep FAILS LOUD unless the env matches exactly.
//
// Instruments (all call-through, zero state writes, zero RNG):
//   - Game.say wrap: counts vgearbeats voice lines in the say stream
//     ("visible beat" confirmation) and buffers them with day stamps.
//   - policy wrap: holds the run ctx (layer counters vgDonations/
//     vgInvitesOk/vgYields + beats counters + fired stretch keys) and
//     pushes per-day dayHash trajectory hashes (det-gate pairs).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-20/perseed-vgearbeats/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   ARM=vgear SEEDS=64023,64024 node scripts/sweep-vgearbeats-20261020.js
//   VGEAR=1 ARM=vgear ... (vgear arm)
//   VGEAR=1 VGEARBEATS=1 ARM=vbeats ... (beats arm)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
let VG = null, VB = null;
try { VG = require(path.join(REPO, 'scripts', 'policies', 'villagergear')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/villagergear.js deleted per kill protocol — sweep not applicable.');
  process.exit(0);
}
try { VB = require(path.join(REPO, 'scripts', 'policies', 'vgearbeats')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/vgearbeats.js deleted per kill protocol (sim-vgearbeats NO-GO) — sweep not applicable.');
  process.exit(0);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (RP.layerOn()) { console.error('SWEEP STOP: REPOSITION must be unset (inert) for the wall baseline.'); process.exit(2); }
if (VR.vetrelOn()) { console.error('SWEEP STOP: VETREL must be unset (inert) for the wall baseline.'); process.exit(2); }
if (!VG.vgearOn()) { console.error('SWEEP STOP: VGEAR=1 is required (both arms narrate/are the layer).'); process.exit(2); }

const ARM = process.env.ARM || 'vgear';
if (ARM !== 'vgear' && ARM !== 'vbeats') { console.error('SWEEP STOP: ARM must be vgear|vbeats.'); process.exit(2); }
if (ARM === 'vbeats' && !VB.beatsOn()) { console.error('SWEEP STOP: VGEARBEATS=1 required for ARM=vbeats.'); process.exit(2); }
if (ARM === 'vgear' && VB.beatsOn()) { console.error('SWEEP STOP: VGEARBEATS must be unset for ARM=vgear.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64023, 64024, 64025, 64026]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-20', 'perseed-vgearbeats');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-windefer', tag + '-windefer + seatdrive');
  const g = VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
  if (ARM === 'vbeats') return VB.withVGearBeats(g, tag + '-vbeats', tag + ' + vgearbeats');
  return g;
}
function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}" (want lead|belong|leadfeast|belongfeast).`);
  process.exit(2);
}
function policyFor(base) { const t = normBase(base); return stackFor(t === 'leadfeast' ? TF.leadfeast : TF.belongfeast, t); }
function policyTag(base) { return normBase(base) + (ARM === 'vbeats' ? '-vbeats' : '-vgear'); }

// vgearbeats voice markers (must match scripts/policies/vgearbeats.js lines).
const BEAT_RES = [/on the armory rack/, /joins the armory/, /stand ready/, /hold your strike/, /This kill belongs to/];
function isBeatLine(s) { return BEAT_RES.some(re => re.test(s)); }

async function oneRun(seed, base) {
  const inner = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'vgearbeats-corpus', fullTelemetry: false });

  // Say-wrap: count + buffer vgearbeats voice lines (call-through).
  const beatLines = [];
  let sayErrors = 0;
  try {
    const oSay = Game.say.bind(Game);
    Game.say = function (x) {
      try {
        const s = String(x);
        if (isBeatLine(s)) {
          const day = ((Game.state || {}).scholar || {}).day || 0;
          beatLines.push({ day, line: s.slice(0, 300) });
        }
      } catch (e) { sayErrors++; }
      return oSay.apply(this, arguments);
    };
  } catch (e) { sayErrors++; }

  // Policy wrap: hold the run ctx + per-day trajectory hashes + a light
  // daily series for stretch-level coverage analysis.
  let runCtx = null;
  const traj = [];
  const dailySeries = [];
  const yieldFightSeqs = new Set();
  const oDaily = inner.daily, oFight = inner.fight;
  const policy = Object.assign({}, inner, {
    daily(G, ctx) {
      runCtx = ctx;
      let r;
      try { r = oDaily ? oDaily(G, ctx) : undefined; } catch (e) { throw e; }
      try {
        const day = (G.state.scholar.day | 0);
        traj.push(day + ':' + dayHash(G));
        dailySeries.push({
          day,
          donEpoch: ctx._vgBeatsDonEpoch | 0, vgDon: ctx.vgDonations | 0,
          stageEp: ctx._vgBeatsStageEp | 0, vgInv: ctx.vgInvitesOk | 0,
          pickVid: (ctx._vgStagePick && ctx._vgStagePick.id) || null,
          vgYield: ctx.vgYields | 0,
        });
      } catch (e) {}
      return r;
    },
    fight(G, ctx) {
      runCtx = ctx;
      const r = oFight ? oFight(G, ctx) : undefined;
      try { if (ctx._vgYield && (ctx._vgBeatsFightSeq | 0) > 0) yieldFightSeqs.add(ctx._vgBeatsFightSeq | 0); } catch (e) {}
      return r;
    },
  });

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  const c = runCtx || {};
  let national = 0, table = 0, won = 0, gameDays = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const cc = String((dd && dd.cause) || 'unknown');
      deathCauses[cc] = (deathCauses[cc] || 0) + 1;
    }
  } catch (e) {}
  const wkl = (st.waveKillLog || []).slice();
  const w4villager = wkl.filter(e => e && (e.w | 0) === 4 && e.by && e.by !== scholarVid && e.by !== 'player').length;
  let w5vetsEnd = 0;
  try { const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; w5vetsEnd = (r && r.veterans) | 0; } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'say-wrap+ctx-hold',
    substrate: 'w5doormeasure pre-seat+windefer (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1; VETREL/REPOSITION inert), VGEAR=1' + (ARM === 'vbeats' ? ' VGEARBEATS=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, w5vetsEnd, w4villagerKills: w4villager,
    days: result.days, gameDays, endReason: result.endReason,
    deathCauses,
    // layer counters (the events, as counted by the layer)
    vgDonations: c.vgDonations | 0, vgInvitesOk: c.vgInvitesOk | 0, vgYields: c.vgYields | 0,
    // beats counters (vbeats arm only)
    beatsDon: c._vgBeatsDonBeats | 0, beatsInv: c._vgBeatsInvBeats | 0, beatsYield: c._vgBeatsYieldBeats | 0,
    donEpochs: c._vgBeatsDonEpoch | 0, stageEps: c._vgBeatsStageEp | 0,
    donEpochsBeaten: Object.keys(c._vgBeatsFiredDon || {}).length,
    firedDonKeys: Object.keys(c._vgBeatsFiredDon || {}),
    firedDonCounts: c._vgBeatsFiredDon || {},
    invPairsBeaten: Object.keys(c._vgBeatsFiredInv || {}).length,
    firedInvKeys: Object.keys(c._vgBeatsFiredInv || {}),
    yieldFights: yieldFightSeqs.size,
    beatLinesSay: beatLines.length,
    beatLines: beatLines.slice(0, 60),
    beatErrors: (c._vgBeatsDailyError | 0) + (c._vgBeatsFightError | 0) + sayErrors,
    trajHash: require('crypto').createHash('sha256').update(traj.join('|')).digest('hex'),
    trajDays: traj.length,
    dailySeries,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${r.policy} s${seed}: don=${r.vgDonations}/${r.beatsDon} inv=${r.vgInvitesOk}/${r.beatsInv} yld=${r.vgYields}/${r.beatsYield} sayBeats=${r.beatLinesSay} beatsErr=${r.beatErrors} w4v=${r.w4villagerKills} nat=${r.national} end=${r.endReason}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won,
    gameDays: r.gameDays, endReason: r.endReason,
    vgDonations: r.vgDonations, vgInvitesOk: r.vgInvitesOk, vgYields: r.vgYields,
    beatsDon: r.beatsDon, beatsInv: r.beatsInv, beatsYield: r.beatsYield,
    beatLinesSay: r.beatLinesSay, beatErrors: r.beatErrors, trajHash: r.trajHash,
    deathCauses: r.deathCauses,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
