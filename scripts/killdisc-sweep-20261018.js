#!/usr/bin/env node
// killdisc-sweep-20261018.js — sim-killdisc STAGE 1 diagnostic sweep.
//
// 8 fresh seeds x {leadfeast, belongfeast} = 16 runs, 180d death-aware, on
// the compchan pre-seat substrate (pure tribfloor base — NO vetstaff/
// vetblood/vetrel), with the KILLDISC read-only instrument.
//
// INSTRUMENT: loadGame({seed, mode:'killdisc', fullTelemetry:false}) +
// scripts/policies/tribfloor leadfeast/belongfeast + scripts/
// killdisc-instrument-20261018.js (KILLDISC=1) + runDays({days:180}).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-killdisc-diag/ and prints a summary. No
// timestamps or timings are written, so re-runs are byte-comparable
// (fight ids are never persisted — see the instrument header).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   SEEDS=63201,63202 node scripts/killdisc-sweep-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (process.env.VETSTAFF === '1') { console.error('SWEEP STOP: VETSTAFF must be unset (pure tribfloor base).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63201, 63202, 63203, 63204, 63205, 63206, 63207, 63208]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-killdisc-diag');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'killdisc', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // --- kill attribution (w3+) with damage tables ---
  const kills3 = [];
  let misTagCount = 0, dmgAttached = 0, singleMonster = 0;
  for (const k of t.kills) {
    if ((k.wave | 0) < 3) continue;
    const shape = KD.classifyKill(k, k.ctx);
    const companion = !!(k.by && k.ctx && k.by !== k.ctx.scholarVid);
    const scholarKill = !!(k.by && k.ctx && k.by === k.ctx.scholarVid);
    const misTag = companion && k.via === 'player';
    if (misTag) misTagCount++;
    if (k.dmg) { dmgAttached++; if (k.dmg.singleMonster) singleMonster++; }
    const d = k.dmg || null;
    const tot = d ? (d.scholar + d.companion + d.other) : 0;
    kills3.push({
      d: k.day, mid: k.mid, w: k.wave, by: k.by, byName: nameOf(Game, k.by),
      via: k.via, pyrrhic: !!k.pyrrhic, shape,
      companion, scholarKill, misTag,
      dmg: d ? {
        scholar: d.scholar, companion: d.companion, other: d.other, hits: d.hits,
        byVid: d.byVid, singleMonster: d.singleMonster,
        compShare: tot > 0 ? +(d.companion / tot).toFixed(3) : null,
        scholarShare: tot > 0 ? +(d.scholar / tot).toFixed(3) : null,
        otherShare: tot > 0 ? +(d.other / tot).toFixed(3) : null,
      } : null,
    });
  }
  kills3.sort((a, b) => a.d - b.d);

  // --- death causes + survival (guardrail context) ---
  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const out = {
    seed, policyId, instrument: 'killdisc',
    substrate: 'pure round-1 tribfloor (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1, no vetstaff/vetblood/vetrel)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    w3Kills: kills3.length,
    w3CompanionKills: kills3.filter(k => k.companion).length,
    w3ScholarKills: kills3.filter(k => k.scholarKill).length,
    misTagCount,
    dmgAttached, singleMonsterKills: singleMonster,
    kills: kills3,
    engagements: t.engagements.length,
    censusDays: t.census.length,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
  };
  const fp = path.join(EVID, `${policyId}-s${seed}.json`);
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
        console.log(`done ${policyId} s${seed}: w3=${r.w3Kills} comp=${r.w3CompanionKills} sch=${r.w3ScholarKills} dmg=${r.dmgAttached}/${r.w3Kills} single=${r.singleMonsterKills} errs=${r.instrumentErrors.length}`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, instrument: 'killdisc', error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const summary = {
    instrument: 'killdisc', n: ok.length, errors: rows.length - ok.length,
    totalW3Kills: ok.reduce((a, r) => a + r.w3Kills, 0),
    totalCompanionKills: ok.reduce((a, r) => a + r.w3CompanionKills, 0),
    totalScholarKills: ok.reduce((a, r) => a + r.w3ScholarKills, 0),
    dmgAttached: ok.reduce((a, r) => a + r.dmgAttached, 0),
    wave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
  };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
