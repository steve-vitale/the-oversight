#!/usr/bin/env node
// test-rebuildaudit-sweep.js — sim-rebuildaudit sweep instrument (2026-10-18).
//
// Measures wave-4 reach on the PURE fightopen round-1 substrate on the named
// seed set [975..982] x {leadfeast, belongfeast} (16 runs), 180d death-aware,
// at an arbitrary anchor commit (checked out detached in the worktree).
//
// Derived from scripts/sweep-unlockdrift-20261018.js with ONE deliberate
// deviation: the FIGHTOPEN=1 hard requirement is dropped. The FIGHTOPEN layer
// did not exist at the pre-dc4 anchors (it merged 2026-10-16 20:28Z), and
// round-1 measured wave-4 reach FIGHTOPEN-independent (14/16 on BOTH arms,
// evidence/2026-10-16/sim-fightopen.md). FIGHTOPEN=1 may still be set in the
// shell for substrate fidelity — nothing at the old anchors reads it.
//
// Usage (from the scratch dir, worktree detached at the anchor):
//   REPO=~/workspace/worktrees/sim-rebuildaudit \
//   EVID=~/workspace/rebuildaudit-scratch/anchor-<label> LABEL=<label> \
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 FIGHTOPEN=1 \
//   node test-rebuildaudit-sweep.js
//
// Writes per-seed JSONs to <EVID> and prints a one-line summary.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
// NOTE: FIGHTOPEN check intentionally dropped (see header).

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [975, 976, 977, 978, 979, 980, 981, 982]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const LABEL = process.env.LABEL || 'nolabel';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-rebuildaudit', LABEL);
fs.mkdirSync(EVID, { recursive: true });

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'rebuildaudit', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const out = {
    seed, policyId, label: LABEL,
    substrate: 'pure round-1 (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1; FIGHTOPEN unset-inert at old anchors)',
    anchorCommit: process.env.ANCHOR || 'unknown',
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
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
        console.log(`done ${policyId} s${seed}: wave${r.maxWave} national=${r.national} table=${r.table} days=${r.days} (${r.endReason})`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, label: LABEL, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const w4 = ok.filter(r => r.wave4).length;
  const w5 = ok.filter(r => r.wave5).length;
  const nat = ok.filter(r => r.national).length;
  const tab = ok.filter(r => r.table).length;
  const days = ok.map(r => r.days).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  const summary = { label: LABEL, n: ok.length, errors: rows.length - ok.length, wave4: w4, wave5: w5, national: nat, table: tab, medianDays: med };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
