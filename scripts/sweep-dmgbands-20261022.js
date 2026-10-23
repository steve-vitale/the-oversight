#!/usr/bin/env node
// sweep-dmgbands-20261022.js — sim-dmg-bands DIAG corpus sweep.
//
// 8 FRESH seeds (65561-65568, filename-verified 2026-10-22) x
// {leadfeast, belongfeast} = 16 configs, 180d death-aware, on the pre-seat
// substrate (FEASTSCALE_R13=1, SEATDRIVE=0) with the dmgbands instrument
// (DMGBANDS=1). DIAG ONLY — no lever arms, no game-code changes.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-dmg-bands/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 DMGBANDS=1 \
//   SEEDS=65561,65562 node scripts/sweep-dmgbands-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const FS = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
const DB = require(path.join(REPO, 'scripts', 'dmgbands-instrument-20261022'));

// Substrate guard (the brief's pre-seat substrate + this arm's instrument).
for (const k of ['FEASTSCALE_R13', 'DMGBANDS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
// Nothing else on: no staging/discipline layers, no other instruments.
for (const k of ['ARMORYDRIVE', 'STAGEMUSTER', 'WAVE4ENGAGE', 'KILLDISC', 'VGEAR', 'VETREL', 'REPOSITION', 'FULLSEAT']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (DIAG corpus, no layers).`); process.exit(2); }
}
if (DB.instrumentOn() !== true) { console.error('SWEEP STOP: dmgbands instrument off despite DMGBANDS=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65561, 65562, 65563, 65564, 65565, 65566, 65567, 65568]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-dmg-bands');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) {
  if (base === 'leadfeast') return FS.leadfeast;
  if (base === 'belongfeast') return FS.belongfeast;
  console.error(`SWEEP STOP: unrecognized POLICIES entry "${base}".`); process.exit(2);
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const { Game } = await loadGame({ seed, mode: 'dmgbands-corpus', fullTelemetry: false });
  const t = {};
  const uninstall = DB.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  uninstall();

  const st = Game.state || {};
  let national = 0, table = 0, exiled = 0, won = 0, gameDays = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;

  const enc = t.enc.map(e => DB.encJSON(e));
  // Attribution enrichments per encounter (analyzer-grade, kept raw here).
  for (const e of enc) {
    const tot = (e.dmgScholar || 0) + (e.dmgCompanion || 0) + (e.dmgOther || 0);
    e.totalDmg = Math.round(tot);
    e.nonScholarShare = tot > 0 ? Math.round(((e.dmgCompanion || 0) + (e.dmgOther || 0)) / tot * 100) / 100 : null;
    e.dmgMaj = e.nonScholarShare != null && e.nonScholarShare >= 0.5;
    const bearer = e.killBearer;
    e.killTimeVillager = !!(e.kill && e.killBy && e.killBy !== 'player' && e.killBy !== bearer);
    e.killByName = e.killBy ? nameOf(Game, e.killBy) : null;
    e.topCompanion = null; e.topCompanionDmg = 0; e.topCompanionName = null;
    for (const vid of Object.keys(e.byVid || {})) {
      if ((e.byVid[vid] || 0) > e.topCompanionDmg) { e.topCompanionDmg = e.byVid[vid]; e.topCompanion = vid; }
    }
    if (e.topCompanion) e.topCompanionName = nameOf(Game, e.topCompanion);
    e.stagedNames = (e.stagedVids || []).map(v => nameOf(Game, v));
  }

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const out = {
    seed, policy: base, arm: 'dmgbands-diag',
    instrument: 'dmgbands-20261022 (TB per-source + field per-villager, wave-4 only)',
    substrate: 'pre-seat (FEASTSCALE_R13=1, SEATDRIVE=0; no staging/discipline layers)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    nEncounters: enc.length,
    nKills: enc.filter(e => e.kill).length,
    encounters: enc,
    orphanKills: t.orphanKills,
    midfightJoins: t.midfightJoins,
    deathCauses,
    instrumentErrors: t.instrumentErrors,
  };
  const fp = path.join(EVID, `dmgbands-${base}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out) + '\n');
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const r = await oneRun(seed, base);
      rows.push(r);
      console.log(`done ${r.policy} s${seed}: enc=${r.nEncounters} kills=${r.nKills} orphans=${r.orphanKills.length} errs=${r.instrumentErrors.length} wave5=${r.wave5} won=${r.won} end=${r.endReason}`);
    }
  }
  const tot = k => rows.reduce((t, r) => t + ((r[k] | 0) || 0), 0);
  console.log(`n=${rows.length} enc=${tot('nEncounters')} kills=${tot('nKills')} won=${tot('won')} national=${tot('national')} wave4=${tot('wave4')} wave5=${tot('wave5')}`);
}

main().catch(e => { console.error('SWEEP FAIL:', e && e.stack || e); process.exit(1); });
