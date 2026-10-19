#!/usr/bin/env node
// presencetend-sweep-20261019.js — sim-presencetend sweep.
//
// 16 FRESH seeds (65201-65216 — zero SEED-name hits in evidence/2026-10-19/
// perseed-*/ and scripts/ before the sweep; an evidence-wide grep for the
// 6520X family hit ONLY pantry kcal values in 2026-10-16 census files:
// false positives, not seeds) x {leadfeast, belongfeast} = 32 runs per arm,
// 180d death-aware, on the w5path substrate (SEATDRIVE=0, VETREL=1), with
// the KILLDISC read-only instrument.
//
// ARMS (ARM env):
//   control      — the full substrate stack (no presencetend)
//   presencetend — the stack + withPresencetend (PRESTEND=1)
//
// REVISED PRIMARY: living-VILLAGER-veterans at end of run =
// countLivingVillagerVeterans(Game) — DISTINCT living roster vids EXCLUDING
// the scholar vid with a wave-3+ kill in state.waveKillLog (the same engine
// read as the VETERANS bar, minus the scholar short-circuit; pinned by
// scripts/test-presencetend-20261019.js T1).
// GO = presencetend total >= control total + 4 on the 32-run corpus.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-19/perseed-presencetend/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 KILLDISC=1 \
//   ARM=presencetend PRESTEND=1 node scripts/presencetend-sweep-20261019.js
//   SEEDS="65201,65202" DAYS=180 POLICIES=leadfeast ...  # pilot / batches
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
// KILL-PROTOCOL: the presencetend layer may be deleted after a NO-GO. The
// sweep requires the layer; without it there is nothing to sweep.
let PT = null;
try { PT = require(path.join(REPO, 'scripts', 'policies', 'presencetend')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/presencetend.js deleted per kill protocol (sim-presencetend NO-GO) — sweep not applicable.');
  process.exit(0);
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));
const J = require(path.join(REPO, 'scripts', 'presencetend-analyze-20261019'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1 (pre-seat substrate).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true despite SEATDRIVE=0.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'presencetend') { console.error('SWEEP STOP: ARM must be control|presencetend.'); process.exit(2); }
if (ARM === 'presencetend' && !PT.layerOn()) { console.error('SWEEP STOP: PRESTEND=1 required for ARM=presencetend.'); process.exit(2); }
if (ARM === 'control' && PT.layerOn()) { console.error('SWEEP STOP: PRESTEND must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : Array.from({ length: 16 }, (_, i) => 65201 + i)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-19', 'perseed-presencetend');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// writeFileFlap: the host flaps EPERM on node writes in ~10-50 min windows
// (AGENTS.md 2026-10-18; 2026-10-19 3rd incident ~50 min). Retry EPERM-only
// with 60s backoff, up to 60 tries (~60 min); any other error throws.
function writeFileFlap(fp, data) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      const eperm = e && (e.code === 'EPERM' || /EPERM/.test(String(e.message)));
      if (!eperm || i >= 60) throw e;
      console.error(`FLAP: EPERM writing ${path.basename(fp)} (try ${i + 1}/60) — sleeping 60s`);
      execSync('sleep 60', { stdio: 'ignore' });
    }
  }
}

function policyFor(base) {
  const tag = base === 'lead' ? 'lead' : 'belong';
  const policyId = base === 'lead' ? 'leadfeast' : 'belongfeast';
  const tfBase = base === 'lead' ? TF.leadfeast : TF.belongfeast;
  const rp = RP.withReposition(tfBase, `${tag}-rp`, `${policyId} + reposition (REPOSITION unset: inert)`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${policyId} + reposition + VETREL=1 (companion veteran channel LIVE)`);
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=0: pure delegation)`);
  if (ARM === 'presencetend') {
    return PT.withPresencetend(sd, `${tag}-presencetend`, `${policyId} + win-side stack + PRESTEND=1 (presence-routing + def5-window tend at Haven, cap 2/day)`);
  }
  return sd;
}
function policyTag(base) { return (ARM === 'presencetend' ? (base === 'lead' ? 'leadpresencetend' : 'belongpresencetend') : (base === 'lead' ? 'leadfeast' : 'belongfeast')); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'presencetend', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);
  await setupGame(Game);
  // ctx capture: the presencetend beats count into the ctx object passed to daily/upkeep.
  const beatCounts = { presencetendGoInside: 0, presencetendStep: 0, presencetendTends: 0 };
  const wrappedPolicy = Object.assign({}, policy);
  const origDaily = policy.daily ? policy.daily.bind(policy) : null;
  const origUpkeep = policy.upkeep ? policy.upkeep.bind(policy) : null;
  const grab = (G, ctx) => { try { for (const k of Object.keys(beatCounts)) beatCounts[k] = ctx[k] || 0; } catch (e) {} };
  if (origDaily) wrappedPolicy.daily = (G, ctx) => { const r = origDaily(G, ctx); grab(G, ctx); return r; };
  if (origUpkeep) wrappedPolicy.upkeep = (G, ctx) => { const r = origUpkeep(G, ctx); grab(G, ctx); return r; };
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // --- wave-3+ kills with damage tables (mechanism continuity) ---
  const kills3 = [];
  let dmgAttached = 0;
  for (const k of t.kills) {
    if ((k.wave | 0) < 3) continue;
    const shape = KD.classifyKill(k, k.ctx);
    const companion = !!(k.by && k.ctx && k.by !== k.ctx.scholarVid);
    if (k.dmg) dmgAttached++;
    const d = k.dmg || null;
    const tot = d ? (d.scholar + d.companion + d.other) : 0;
    kills3.push({
      d: k.day, mid: k.mid, w: k.wave, by: k.by, byName: nameOf(Game, k.by),
      via: k.via, pyrrhic: !!k.pyrrhic, shape, companion,
      dmg: d ? {
        scholar: d.scholar, companion: d.companion, other: d.other,
        compShare: tot > 0 ? +(d.companion / tot).toFixed(4) : null,
      } : null,
    });
  }
  kills3.sort((a, b) => a.d - b.d);

  // --- REVISED PRIMARY: living-villager-veterans at end of run (scholar excluded) ---
  let livingVillagerVeterans = 0, villagerVeteranVids = [];
  try {
    const vv = J.countLivingVillagerVeterans(Game);
    livingVillagerVeterans = vv.count | 0; villagerVeteranVids = vv.vids;
  } catch (e) {}
  // informational: the engine's own VETERANS bar (includes the scholar)
  let livingVeterans = 0, veterans5 = 0;
  try {
    const r4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
    livingVeterans = (r4 && r4.veterans) | 0;
    const r5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    veterans5 = (r5 && r5.veterans) | 0;
  } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  // wave-4/5 reach
  let wave4 = 0, wave5 = 0;
  try {
    const uw = Game.unlockedWave ? Game.unlockedWave() : 1;
    wave4 = uw >= 4 ? 1 : 0; wave5 = uw >= 5 ? 1 : 0;
  } catch (e) { wave4 = maxWave >= 4 ? 1 : 0; wave5 = maxWave >= 5 ? 1 : 0; }

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc',
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1',
    anchorCommit: ANCHOR,
    maxWave, wave4, wave5, national, table, won,
    livingVillagerVeterans, villagerVeteranVids, livingVeterans, veterans5,
    days: result.days, gameDays, endReason: result.endReason,
    w3Kills: kills3.length,
    w3CompanionKills: kills3.filter(k => k.companion).length,
    dmgAttached,
    kills: kills3,
    engagements: t.engagements.length,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
    beat: beatCounts,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1));
  console.log(`  [${tag} seed ${seed}] days=${result.days} end=${result.endReason} vvets=${livingVillagerVeterans} vets=${livingVeterans} vets5=${veterans5} w3kills=${kills3.length} compKills=${out.w3CompanionKills} beat=${JSON.stringify(beatCounts)}`);
  return out;
}

(async () => {
  const outs = [];
  for (const base of BASES) {
    for (const seed of SEEDS) {
      console.log(`run ${ARM}/${base} seed ${seed}...`);
      outs.push(await oneRun(seed, base));
    }
  }
  const fp = path.join(EVID, `_summary-${ARM}.json`);
  writeFileFlap(fp, JSON.stringify(outs.map(o => ({
    seed: o.seed, policy: o.policy, days: o.days, gameDays: o.gameDays, endReason: o.endReason,
    maxWave: o.maxWave, wave4: o.wave4, wave5: o.wave5, national: o.national, table: o.table,
    won: o.won, livingVillagerVeterans: o.livingVillagerVeterans, livingVeterans: o.livingVeterans,
    veterans5: o.veterans5, w3Kills: o.w3Kills, w3CompanionKills: o.w3CompanionKills,
    dmgAttached: o.dmgAttached, beat: o.beat, deathCauses: o.deathCauses,
    instrumentErrors: o.instrumentErrors.length,
  })), null, 1));
  console.log(`wrote ${fp} (${outs.length} runs)`);
})().catch(e => { console.error('SWEEP FAIL', e); process.exit(1); });
