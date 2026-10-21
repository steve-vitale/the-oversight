#!/usr/bin/env node
// sweep-killtime-20261021.js — corpus re-runs with the killtime census
// instrument (sim-killtime, 2026-10-21, backlog #753).
//
// Re-runs kill-bearing configs from the twovets and vgearconfirm corpora
// with scripts/killtime-census-20261021.js (daily bearer census on top of
// killdisc v2) and joins every waveKillLog w>=4 entry against the census of
// THAT DAY — never the end-of-run roster.
//
// USAGE (substrate pinned per corpus — sweep FAILS LOUD on env mismatch):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   ARM=vgear SEEDS=64841,64843,64844,64845 POLICIES=belong \
//   node scripts/sweep-killtime-20261021.js
// ARM: control | vgear  (twovets-armed is NOT re-runnable — twovets.js was
// deleted per kill protocol; its single kill is attributed from the corpus's
// own kill-time bearerAtKill instead.)
// Output: evidence/2026-10-21/perseed-killtime/<arm>-<policy>-s<seed>.json
// (NEVER overwrites the landed corpora.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

// ---- env guard (substrate pinned, identical to both corpora) ----
// vgearconfirm corpus: control = VGEAR unset; armed = VGEAR=1.
// twovets corpus:    control = VGEAR=1 stack (re-run as ARM=vgear here);
//                   twovets-armed (TWOVETS=1) is NOT re-runnable (deleted).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate is the clean one, nothing else).`); process.exit(2); }
}
const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vgear') { console.error('SWEEP STOP: ARM must be control|vgear.'); process.exit(2); }
if (ARM === 'vgear' && process.env.VGEAR !== '1') { console.error('SWEEP STOP: VGEAR=1 required for ARM=vgear.'); process.exit(2); }
if (ARM === 'control' && ('VGEAR' in process.env)) { console.error('SWEEP STOP: VGEAR must be unset for ARM=control.'); process.exit(2); }

const KD_MOD = process.env.KD_MOD || 'killdisc-instrument-20261021';
const KD = require(path.join(REPO, 'scripts', KD_MOD));
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }
const KT = require(path.join(REPO, 'scripts', 'killtime-census-20261021'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
if (!SEEDS.length) { console.error('SWEEP STOP: SEEDS required (explicit config list, e.g. SEEDS=64841,64843).'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-killtime');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = VCE.normBase(base); return ARM === 'vgear' ? VCE.armedFor(t) : VCE.seatStackFor(t); }
function policyTag(base) { return VCE.normBase(base) + (ARM === 'vgear' ? '-vgear' : ''); }

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'killtime', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KT.install(Game, t, KD);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstall) uninstall(); } catch (e) {}

  const st = Game.state || {};
  const endScholarVid = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
  const attr = KT.attributeKills(Game, t, endScholarVid);
  const report = KT.correctionReport(attr);

  // Succession log from the census.
  const bearerChanges = [];
  try {
    const days = Object.keys(t.bearerByDay || {}).map(Number).sort((a, b) => a - b);
    let prev = null;
    for (const d of days) {
      const v = (t.bearerByDay[d] || {}).scholar || null;
      if (v !== prev) { bearerChanges.push({ day: d, vid: v, name: KT.nameOf(Game, v) }); prev = v; }
    }
  } catch (e) {}

  // Fidelity: raw wave-4 kill rows to compare against the landed corpus.
  const killRows = [];
  try {
    for (const e of ((st.waveKillLog || []).slice())) {
      if (e && ((e.w | 0) >= 4)) killRows.push({ d: e.d, mid: e.mid, by: e.by, via: e.via });
    }
  } catch (e) {}

  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killtime-census on killdisc-v2',
    anchorCommit: ANCHOR,
    days: result.days, gameDays, won, endReason: result.endReason,
    endScholarVid, endScholarName: KT.nameOf(Game, endScholarVid),
    attribution: attr.rows,
    correctionReport: report,
    bearerChanges,
    killRows,
    censusDays: Object.keys(t.bearerByDay || {}).length,
    instrumentErrors: t.instrumentErrors,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  console.log(`wrote ${fp}: ${report.kills} w4+ kills, ${report.deltas.length} flips, ${attr.unexplained.length} unexplained, ${t.instrumentErrors.length} errors`);
  return out;
}

(async () => {
  for (const seed of SEEDS) for (const base of BASES) {
    console.log(`== killtime ${ARM} s${seed} ${base} ==`);
    await oneRun(seed, base);
  }
  console.log('done');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
