#!/usr/bin/env node
// presence-confirm-sweep-20261019.js — sim-presence CONFIRM sweep.
//
// 16 FRESH seeds (63541-63556 — verified filename-unused in
// evidence/2026-10-19/perseed-*/ and scripts/ before the sweep;
// families in use: presence pilot 63521-63528, diagnostic/armory 63511-63518,
// winsupport 64001+, vetrel1 63901+, loop-B doomrevive 7401-7408,
// cookbulk-b3 94101-94108, cookbulk-confirm-b 95101-95116)
// x {lead,belong} = 32 runs per arm, 180d death-aware, on the pilot
// substrate, with the KILLDISC read-only instrument.
//
// ARMS (ARM env):
//   control  — TF.leadfeast / TF.belongfeast (pure tribfloor base, PRESENCE unset)
//   presence — PR.leadpresence / PR.belongpresence (PRESENCE=1)
//
// CONFIRM PRIMARY: living-veterans at end of run =
// waveCombatReadiness(4).veterans (living roster members with a wave-3+ kill
// in state.waveKillLog — the engine's own VETERANS bar, design call #4).
// GO = presence total >= control total + 4 on the 32-run corpus
// (+2 per 16 runs, the pre-registered bar scaled to the corpus).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-19/perseed-presence-confirm/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=presence PRESENCE=1 node scripts/presence-confirm-sweep-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
// KILL-PROTOCOL: the presence layer may be deleted after a confirm NO-GO. The
// sweep requires the layer; without it there is nothing to sweep.
let PR = null;
try { PR = require(path.join(REPO, 'scripts', 'policies', 'presence')); }
catch (e) {
  console.log('INFO-SKIP: scripts/policies/presence.js deleted per kill protocol (sim-presence NO-GO) — sweep not applicable.');
  process.exit(0);
}
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'presence') { console.error('SWEEP STOP: ARM must be control|presence.'); process.exit(2); }
if (ARM === 'presence' && !PR.layerOn()) { console.error('SWEEP STOP: PRESENCE=1 required for ARM=presence.'); process.exit(2); }
if (ARM === 'control' && PR.layerOn()) { console.error('SWEEP STOP: PRESENCE must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : Array.from({ length: 16 }, (_, i) => 63541 + i)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence-confirm');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// writeFileFlap: the host flaps EPERM on node writes in ~10-50 min windows
// (AGENTS.md 2026-10-18; 2026-10-19 5th incident ~50 min). Retry EPERM-only
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
  if (ARM === 'presence') return base === 'lead' ? PR.leadpresence : PR.belongpresence;
  return base === 'lead' ? TF.leadfeast : TF.belongfeast;
}
function policyTag(base) { return (ARM === 'presence' ? (base === 'lead' ? 'leadpresence' : 'belongpresence') : (base === 'lead' ? 'leadfeast' : 'belongfeast')); }

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
  const { Game } = await loadGame({ seed, mode: 'presence-confirm', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);
  await setupGame(Game);
  // ctx capture: the presence beat counts into the ctx object passed to daily/upkeep.
  let beatCounts = { presenceGoInside: 0, presenceStep: 0 };
  const wrappedPolicy = Object.assign({}, policy);
  const origDaily = policy.daily ? policy.daily.bind(policy) : null;
  const origUpkeep = policy.upkeep ? policy.upkeep.bind(policy) : null;
  if (origDaily) wrappedPolicy.daily = (G, ctx) => { const r = origDaily(G, ctx); try { beatCounts.presenceGoInside = ctx.presenceGoInside || 0; beatCounts.presenceStep = ctx.presenceStep || 0; } catch (e) {} return r; };
  if (origUpkeep) wrappedPolicy.upkeep = (G, ctx) => { const r = origUpkeep(G, ctx); try { beatCounts.presenceGoInside = ctx.presenceGoInside || 0; beatCounts.presenceStep = ctx.presenceStep || 0; } catch (e) {} return r; };
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

  // --- CONFIRM PRIMARY: living-veterans at end of run ---
  // waveCombatReadiness(4).veterans = living roster members with a wave-3+
  // kill in state.waveKillLog (the engine's own VETERANS bar, design call #4).
  // veterans5 (wave-4+ killers, living) is the depth readout.
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
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1',
    anchorCommit: ANCHOR,
    maxWave, wave4, wave5, national, table, won, livingVeterans, veterans5,
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
  console.log(`  [${tag} seed ${seed}] days=${result.days} end=${result.endReason} vets=${livingVeterans} vets5=${veterans5} w3kills=${kills3.length} compKills=${out.w3CompanionKills} beat=${JSON.stringify(beatCounts)}`);
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
    won: o.won, livingVeterans: o.livingVeterans, veterans5: o.veterans5, w3Kills: o.w3Kills,
    w3CompanionKills: o.w3CompanionKills, dmgAttached: o.dmgAttached,
    beat: o.beat, deathCauses: o.deathCauses, instrumentErrors: o.instrumentErrors.length,
  })), null, 1));
  console.log(`wrote ${fp} (${outs.length} runs)`);
})().catch(e => { console.error('SWEEP FAIL', e); process.exit(1); });
