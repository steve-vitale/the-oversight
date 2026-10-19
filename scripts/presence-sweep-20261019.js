#!/usr/bin/env node
// presence-sweep-20261019.js — sim-presence PILOT sweep.
//
// 8 fresh seeds (63521-63528, verified filename-unused in
// evidence/2026-10-19/perseed-*/ before the sweep) x {lead,belong} = 16
// runs per arm, 180d death-aware, on the pre-seat courtship substrate, with
// the KILLDISC read-only instrument (per-source tbDamage attribution on
// wave-3+ monsters — the pilot primary's mechanism metric).
//
// ARMS (ARM env):
//   control  — TF.leadfeast / TF.belongfeast (pure tribfloor base, PRESENCE unset)
//   presence — PR.leadpresence / PR.belongpresence (PRESENCE=1)
//
// LAYER TELEMETRY: the presence beat counts its own honest actions in ctx
// (presenceGoInside, presenceStep) — read back at end of run. No wraps
// needed: the layer never calls assignTask/takeWeapon (proof A9), and any
// call would be a loud failure, not telemetry.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-19/perseed-presence-pilot/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   ARM=presence PRESENCE=1 SEEDS=63521,63522 node scripts/presence-sweep-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
// KILL-PROTOCOL: the presence layer may be deleted after a pilot NO-GO. The
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

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63521, 63522, 63523, 63524, 63525, 63526, 63527, 63528]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence-pilot');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// writeFileFlap: the host flaps EPERM on node writes in ~10-15 min windows
// (AGENTS.md 2026-10-18; sim-armory 2026-10-19 lost 4 sweep runs to it).
// Retry EPERM-only with 60s backoff, up to 15 tries (~15 min); any other
// error throws immediately.
function writeFileFlap(fp, data) {
  for (let i = 0; ; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      const eperm = e && (e.code === 'EPERM' || /EPERM/.test(String(e.message)));
      if (!eperm || i >= 15) throw e;
      console.error(`FLAP: EPERM writing ${path.basename(fp)} (try ${i + 1}/15) — sleeping 60s`);
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
  const { Game } = await loadGame({ seed, mode: 'presence-pilot', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);
  await setupGame(Game);
  // ctx capture: the presence beat counts into the ctx object passed to daily/upkeep.
  // runDays creates its own ctx; we read the counts back via a wrapper.
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

  // --- wave-3+ kills with damage tables (the pilot primary's mechanism) ---
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

  // living veterans at end of run (confirm primary, reported for context)
  let livingVeterans = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
    livingVeterans = (r && r.veterans) | 0;
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
    maxWave, wave4, wave5, national, table, won, livingVeterans,
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
  console.log(`  [${tag} seed ${seed}] days=${result.days} end=${result.endReason} w3kills=${kills3.length} compKills=${out.w3CompanionKills} beat=${JSON.stringify(beatCounts)}`);
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
    won: o.won, livingVeterans: o.livingVeterans, w3Kills: o.w3Kills,
    w3CompanionKills: o.w3CompanionKills, dmgAttached: o.dmgAttached,
    beat: o.beat, deathCauses: o.deathCauses, instrumentErrors: o.instrumentErrors.length,
  })), null, 1));
  console.log(`wrote ${fp} (${outs.length} runs)`);
})().catch(e => { console.error('SWEEP FAIL', e); process.exit(1); });
