#!/usr/bin/env node
// vetcontact-sweep.js — sim-vetcontact pilot census (flesh-out loop arm
// sim-vetcontact, axis scale-onramp, run 2026-10-24).
// The FORMATION half's havencontact lever: when the staging window is live
// (wave-4 unlocked && the wave-5 veterans bar unmet) AND a wave-4+ monster
// sits on the haven tile (the havencontact channel the sim-havencontact
// DIAG named), stage the kill-formation AT Haven immediately — the best
// armed fighter as anchor + best armed non-veterans, up to 3,
// consent-based, never dismisses, non-suicidal. Fires only when
// vetformation's travel-target signal is COLD (one delta, no
// double-staging). The landed finishing discipline operates unchanged.
//
// 8 seeds x {leadfeast, belongfeast} x {control, vetcontact} = 32 paired
// configs, 180d death-aware, on the full pinned substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
//   LINKFORM=2
//   control  = VC.controlFor(base)  = VF.formedFor(base) (VETCONTACT unset)
//   vetcontact = VC.contactFor(base) = withVetcontact(VF.formedFor(base)),
//              VETCONTACT=1
//
// Instruments (all read-only):
//   - KILLDISC v2 (scripts/killdisc-instrument-20261021): per-source
//     tbDamage attribution on wave-3+ monsters
//   - state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans
//     bar reads — standing.js; the binding PRIMARY sensor: wave-4+ kills
//     per config)
//   - daily bearer-by-day (kill-time attribution — sim-killtime MANDATORY)
//   - VC.tele() per run + ctx.vcW4FightRows (the engagement trace:
//     wave-4 fights with >=2 formation-committed companions engaged)
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-24/perseed-vetcontact/<arm>/s<seed>-<base>.json.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 \
//   LINKFORM=2 \
//   ARM=control SEEDS=70501,70504 node scripts/vetcontact-sweep.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 \
//   LINKFORM=2 VETCONTACT=1 \
//   ARM=vetcontact SEEDS=70501,70504 node scripts/vetcontact-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VC = require(path.join(REPO, 'scripts', 'policies', 'vetcontact'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// Pinned-substrate env guard (vetcontact namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION', 'TRUSTBUFFER']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  if (process.env.LINKFORM !== '2') { console.error('SWEEP STOP: LINKFORM=2 is required (pinned substrate).'); process.exit(2); }
  for (const k of ['VETREL', 'REPOSITION', 'VGEAR', 'FEASTDISC', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'BLOODRESTRAINT', 'VETRETENTION']) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate / sibling lane).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'vetcontact') { console.error('SWEEP STOP: ARM must be control|vetcontact.'); process.exit(2); }
  if (ARM === 'vetcontact' && process.env.VETCONTACT !== '1') { console.error('SWEEP STOP: VETCONTACT=1 required for ARM=vetcontact.'); process.exit(2); }
  if (ARM === 'control' && process.env.VETCONTACT === '1') { console.error('SWEEP STOP: VETCONTACT must be unset for ARM=control.'); process.exit(2); }
  if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

// Seeds: verified fresh 2026-10-24 — 70501, 70504, 70505, 70802, 70903,
// 70905, 70907 have zero word-boundary seed-use hits across evidence/ +
// scripts/; 71001 appears only in evidence/2026-10-12/journey-deepening
// (ancient, different substrate — acceptable per the corpus convention).
// The paired design cancels seed-specific effects regardless.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [70501, 70504, 70505, 70802, 70903, 70905, 70907, 71001]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetcontact', ARM);
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function normBase(base) {
  if (base === 'lead' || base === 'leadfeast') return 'leadfeast';
  if (base === 'belong' || base === 'belongfeast') return 'belongfeast';
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`);
  process.exit(2);
}
function policyFor(base) {
  const nb = normBase(base);
  return ARM === 'vetcontact' ? VC.contactFor(nb) : VC.controlFor(nb);
}
function policyTag(base) { return (base === 'belong' || base === 'belongfeast' ? 'belong' : 'lead') + (ARM === 'vetcontact' ? '-vetcontact' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}
function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'vetcontact', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Bearer-by-day + ctx capture (kill-time attribution, sim-killtime
  // MANDATORY; the engagement trace lives on ctx).
  let lastCtx = null;
  const bearerByDay = {};
  const oDaily = policy.daily;
  const wrappedPolicy = Object.assign({}, policy, {
    daily(G, ctx) {
      lastCtx = ctx;
      try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
      return oDaily(G, ctx);
    },
  });

  VC.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const vcTele = VC.tele();
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let winDay = null, winPath = null;
  try {
    if (Game.won) {
      winDay = gameDays;
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    }
  } catch (e) {}

  // Deaths (guardrails: starvation count, new death kinds).
  const deaths = {};
  let starvation = 0;
  const deathRows = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starvation++;
      deathRows.push({ day: d.day | 0, who: d.who || null, kind: d.kind || null, cause: k, player: !!d.player });
    }
  } catch (e) {}

  // THE binding sensor: state.waveKillLog read DIRECTLY (the source the
  // veterans bar reads — standing.js). Entries {d, mid, w, by, via,
  // trick}; by = killer vid.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, byName: nameOf(Game, e && e.by), via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  // Damage-majority diagnosis (the feastdisc-confirm convention):
  // kill-time villager kill = w=4, by != bearer-on-that-day, by != 'player';
  // damage-majority = >=50% of the kill's fight damage from non-scholar.
  const w4killRows = [];
  try {
    for (const k of (t.kills || [])) {
      if ((k.wave | 0) !== 4) continue;
      const d = k.dmg || {};
      const sD = Math.round(d.scholar || 0), cD = Math.round(d.companion || 0), oD = Math.round(d.other || 0);
      const tot = sD + cD + oD;
      const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
      const dmgMaj = nonScholarShare >= 0.5;
      const bearerAtKill = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
      const killTimeVillager = k.by && k.by !== bearerAtKill && k.by !== 'player';
      w4killRows.push({
        day: k.day, mid: k.mid, by: k.by, byName: nameOf(Game, k.by), via: k.via,
        bearerAtKill, killTimeVillager: !!killTimeVillager,
        dmgScholar: sD, dmgCompanion: cD, dmgOther: oD,
        nonScholarShare: Math.round(nonScholarShare * 100) / 100, dmgMaj,
      });
    }
  } catch (e) { t.instrumentErrors.push('w4killRows: ' + String((e && e.message) || e)); }

  // The engagement trace (from the policy's own fight wrapper).
  let vcW4FightRows = [];
  let vcCtx = {};
  let vfCtx = {};
  try {
    vcW4FightRows = ((lastCtx && lastCtx.vcW4FightRows) || []).map(r => Object.assign({}, r));
    vcCtx = {
      vcContactStages: (lastCtx && lastCtx.vcContactStages) | 0,
      vcBeats: (lastCtx && lastCtx.vcBeats) | 0,
      vcW4Fights: (lastCtx && lastCtx.vcW4Fights) | 0,
      vcW4FightsFormed2: (lastCtx && lastCtx.vcW4FightsFormed2) | 0,
      vcW4FightsVcFormed2: (lastCtx && lastCtx.vcW4FightsVcFormed2) | 0,
    };
    // Vetformation's own affirmed trace (the control arm's staged-fight
    // instrument — same shape as the armed arm's union counter).
    vfCtx = {
      vfW4Fights: (lastCtx && lastCtx.vfW4Fights) | 0,
      vfW4FightsFormed2: (lastCtx && lastCtx.vfW4FightsFormed2) | 0,
    };
  } catch (e) {}

  const out = {
    seed, base: normBase(base), arm: ARM, policyId: tag,
    instrument: 'vetcontact on KILLDISC-v2 + bearer-by-day + direct waveKillLog read + VC fight trace',
    substrate: 'full pinned substrate (BOTH arms): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2; VETCONTACT=1 armed only',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2' + (ARM === 'vetcontact' ? ' VETCONTACT=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, starvation, nDeathRows: deathRows.length, deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped, waveKillLog,
    nW4KillRows: w4killRows.length, w4killRows,
    nBearerDays: Object.keys(bearerByDay).length,
    vcTele,
    nVcW4FightRows: vcW4FightRows.length, vcW4FightRows,
    vcCtx, vfCtx,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`), JSON.stringify(out, null, 1) + '\n');
  const w4kills = waveKillLog.filter(e => e.w >= 4).length;
  const w4vids = new Set(waveKillLog.filter(e => e.w >= 4 && e.by).map(e => e.by)).size;
  return { seed, base: normBase(base), arm: ARM, w4kills, w4vids, days: result.days, gameDays, national, table, won };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    for (const b of BASES) {
      const r = await oneRun(s, b);
      rows.push(r);
      console.log(JSON.stringify(r));
    }
  }
  console.log('VETCONTACT-SWEEP-DONE ' + JSON.stringify({ arm: ARM, seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
