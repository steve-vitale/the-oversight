#!/usr/bin/env node
// formthick-sweep.js — sim-formthick census (flesh-out loop arm
// sim-formthick, axis scale-onramp, the THICKENING half of the veterans
// coincidence trap).
//
// 8 seeds x {leadfeast, belongfeast} x {control, formthick} = 32
// paired configs, 180d death-aware, on the formation seed band (the band
// where formation-alone formed 10 distinct vids):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 (BOTH arms — the control IS
//   formation-alone, the proven GO layer)
//   control  = FT.controlFor(base)  = VF.formedFor(base) (FORMTHICK unset)
//   formthick= FT.thickFor(base), FORMTHICK=1 (pair-them second forming
//              slot OUTSIDE the formation layer)
//
// Instruments (all read-only):
//   - KILLDISC v2 (scripts/killdisc-instrument-20261021): per-source
//     tbDamage attribution on wave-3+ monsters (damage-majority diagnosis)
//   - state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans
//     bar reads — standing.js:278; the binding PRIMARY sensor, per the
//     vetkill-autopsy method)
//   - daily bearer census (kill-time attribution — sim-killtime MANDATORY)
//   - VF.tele() + FT.tele() per run + ctx.vfW4FightRows (engagement trace)
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-formthick/<arm>/s<seed>-<base>.json.
// The per-seed anchorCommit field is the #793 check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 \
//   ARM=control SEEDS=68805,68806 node scripts/formthick-sweep.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 FORMTHICK=1 \
//   ARM=formthick SEEDS=68805,68806 node scripts/formthick-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const FT = require(path.join(REPO, 'scripts', 'policies', 'formthick'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// Pinned-substrate env guard (formthick namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'VETFORMATION']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['VETREL', 'REPOSITION', 'VGEAR', 'FEASTDISC', 'SPLITCLOSE', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VGEARBEATS', 'SURPLUSFEED', 'WAVE4ENGAGE', 'VETRETENTION']) {
    if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const ARM = process.env.ARM || 'control';
  if (ARM !== 'control' && ARM !== 'formthick') { console.error('SWEEP STOP: ARM must be control|formthick.'); process.exit(2); }
  if (ARM === 'formthick' && process.env.FORMTHICK !== '1') { console.error('SWEEP STOP: FORMTHICK=1 required for ARM=formthick.'); process.exit(2); }
  if (ARM === 'control' && process.env.FORMTHICK === '1') { console.error('SWEEP STOP: FORMTHICK must be unset for ARM=control.'); process.exit(2); }
  if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
  return ARM;
}
const ARM = checkEnv();

// Seeds: the formation seed band (filename-verified 2026-10-23 — the band
// where formation-alone formed 10 distinct vids). The paired design
// cancels seed-specific effects regardless.
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [68805, 68806, 68807, 68808, 68809, 68810, 68812, 68814]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-formthick', ARM);
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
  return ARM === 'formthick' ? FT.thickFor(nb) : FT.controlFor(nb);
}
function policyTag(base) { return (base === 'belong' || base === 'belongfeast' ? 'belong' : 'lead') + (ARM === 'formthick' ? '-formthick' : '-vetformation'); }

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
  const { Game } = await loadGame({ seed, mode: 'formthick', fullTelemetry: false });
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

  VF.resetTele();
  FT.resetTele();
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const vfTele = VF.tele();
  const ftTele = FT.tele();
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
      try { const T = (typeof Game.tableState === 'function' ? Game.tableState() : null); winPath = T ? (T.path || null) : null; } catch (e) {}
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
  // veterans bar reads — standing.js:278). Entries {d, mid, w, by, via,
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

  // The engagement trace (from the formation layer's fight wrapper) +
  // the thickening layer's own counters.
  let vfW4FightRows = [];
  try { vfW4FightRows = ((lastCtx && lastCtx.vfW4FightRows) || []).map(r => Object.assign({}, r)); } catch (e) {}
  let ftPairDrafts = 0, ftBeats = 0;
  try { ftPairDrafts = (lastCtx && lastCtx.ftPairDrafts) | 0; ftBeats = (lastCtx && lastCtx.ftBeats) | 0; } catch (e) {}

  const out = {
    seed, base: normBase(base), arm: ARM, policyId: tag,
    instrument: 'formthick on KILLDISC-v2 + bearer <redacted> + direct waveKillLog read + VF fight trace + FT pair trace',
    substrate: 'formation pinned substrate — non-seat long substrate + ARMORYDRIVE=1 + VETFORMATION=1 (BOTH arms); FORMTHICK=1 armed only',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1' + (ARM === 'formthick' ? ' FORMTHICK=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, starvation, nDeathRows: deathRows.length, deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped, waveKillLog,
    nW4KillRows: w4killRows.length, w4killRows,
    nBearerDays: Object.keys(bearerByDay).length,
    vfTele,
    ftTele,
    ftPairDrafts, ftBeats,
    nVfW4FightRows: vfW4FightRows.length, vfW4FightRows,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `s${seed}-${normBase(base) === 'belongfeast' ? 'belong' : 'lead'}.json`), JSON.stringify(out, null, 1) + '\n');
  const w4kills = waveKillLog.filter(e => e.w >= 4).length;
  const w4vids = new Set(waveKillLog.filter(e => e.w >= 4 && e.by).map(e => e.by)).size;
  return { seed, base: normBase(base), arm: ARM, w4kills, w4vids, pairDrafts: ftTele.pairDrafts | 0, days: result.days, gameDays, national, table, won };
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
  console.log('FORMTHICK-SWEEP-DONE ' + JSON.stringify({ arm: ARM, seeds: SEEDS, bases: BASES, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
