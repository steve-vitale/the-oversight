#!/usr/bin/env node
// sweep-pyrrhic-verify-20261017.js — INDEPENDENT VERIFICATION of the landed
// sim-pyrrhic fix (commit 94f78198, flesh-out loop run fleshout-20261017T1223Z).
//
// CONTEXT: the coordinator's brief for this run assumed the a2 pyrrhic-kill
// blank was still open. It is not: 94f78198 already landed the tbEnd 'lost'
// ledger extension (recordPyrrhicKill), with proof test
// scripts/test-pyrrhic-20261017.js (13/13 GREEN, re-verified in this run's
// tree) and evidence/2026-10-17/sim-pyrrhic.md. This sweep is the independent
// re-measurement on a DIFFERENT substrate (feastscale-only, no tribfloor)
// with an armed/control before-after on identical seeds.
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — BINDING):
//   Question: does the landed fix recover pyrrhic trick kills (trick-bearing
//   monster dies, scholar dies, result 'lost') into waveKillLog+trick, codex
//   'slain', villageSlain — without touching wave-unlock deeds or loot?
//   PRIMARY (GO): >=2 pyrrhic trick kills recovered in waveKillLog on the
//   ARMED corpus (8 fresh seeds 1911-1918 x {leadfeast,belongfeast} = 16 runs).
//   CONTROL: the same pyrrhic fights on CONTROL (fix disabled at runtime via
//   a recordPyrrhicKill no-op — behaviorally identical to pristine: the
//   tbEnd per-kill loop's only side effects are the record call;
//   trickSummaryFor and tbSnakeLineageKey are pure reads, no RNG consumed)
//   must show the kills UNattributed, proving the blank is real without the fix.
//   GUARDRAILS: det-gate armed vs control on identical seeds — days,
//   endReason, nTbFights, nPerf, wall metrics compared; any divergence named
//   with mechanism (expected channel, per the 1223Z run's bisection:
//   villageSlain -> beasttricks teaching -> counter discovery). No new death
//   mode. Median survival within +-10d.
//   NOTE on §15: scripts/balance-panel.js cannot execute this measurement —
//   POLICY_REGISTRY has no leadfeast/belongfeast entry at the fix's base
//   commit 94f78198^ (added later in 84687a33), so the panel's child mode
//   throws "Unknown policy" against a pristine base. This paired sweep is
//   the before/after instrument instead; the pre-registered PRIMARY is the
//   judge (§15: "the panel is the instrument, the pre-registered threshold
//   is the judge"). Filed in the evidence metric-review for the coordinator.
//
// Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 explicit, TRIBFLOOR unset (default
// OFF layers stay off). 180d death-aware. Pre-seat by design.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 \
//     SEEDS=1911,1912,1913,1914,1915,1916,1917,1918 POLICIES=leadfeast,belongfeast DAYS=180 \
//     node scripts/sweep-pyrrhic-verify-20261017.js
//
// Per-seed JSONs: evidence/2026-10-17/perseed-pyrrhic-verify/<policy>-s<seed>-<armed|control>.json
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const FS = require(path.join(ROOT, 'scripts', 'policies', 'feastscale'));
const TFUN = require('./trickfunnel-instrument-20261016.js');
const { attachAttrcensusCapture } = require('./attrcensus-instrument-20261017.js');
const { classifyExtended } = require('./attrcensus-classify-20261017.js');

for (const k of ['FEASTSCALE_R13']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.TRIBFLOOR === '1') { console.error('SWEEP STOP: TRIBFLOOR must be off (plain feastscale substrate).'); process.exit(2); }
if (!FS.layerOn()) { console.error('SWEEP STOP: feastscale layerOn() false despite FEASTSCALE_R13=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1911]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-pyrrhic-verify');

function isPyrrhic(t, mid) {
  const perfs = (t.perfs[mid] || []).length;
  const mort = (t.mortality || {})[mid] || { dead: 0, alive: 0 };
  return t.result === 'lost' && t.pAlive === false && perfs > 0 && mort.dead > 0;
}

let PRISTINE_RPK = null; // captured from the first armed run; the gate-off no-op is restored to this

async function oneRun(seed, policyId, armed) {
  const policy = policyId === 'leadfeast' ? FS.leadfeast : FS.belongfeast;
  const { Game } = await loadGame({ seed, mode: 'pyrrhic-verify', fullTelemetry: false });
  await setupGame(Game);
  if (typeof Game.recordPyrrhicKill !== 'function') {
    console.error('SWEEP STOP: Game.recordPyrrhicKill missing — fix not present in this tree.');
    process.exit(2);
  }
  if (!PRISTINE_RPK) PRISTINE_RPK = Game.recordPyrrhicKill;
  // Defensive reset: guarantee the armed condition always runs the real fix,
  // the control condition always runs the no-op, regardless of harness object reuse.
  Game.recordPyrrhicKill = PRISTINE_RPK;
  if (!armed) Game.recordPyrrhicKill = function () { /* gate-off: pristine 'lost'-forfeit behavior */ };
  const cap = attachAttrcensusCapture(Game, TFUN);
  if (!cap.tbfightIntercepted) { console.error('SWEEP STOP: tbfight interception failed.'); process.exit(2); }

  let result;
  try {
    await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  } finally {
    cap.restore();
    Game.recordPyrrhicKill = PRISTINE_RPK; // never leak the no-op into the next run
  }

  const st = Game.state || {};
  const wkl = st.waveKillLog || [];

  const fights = [];
  const pyrrhicRows = [];
  const classCounts = {};
  let nPerf = 0, nAttr = 0, nUnattr = 0, nReverse = 0, nPyrrhic = 0, nPyrrhicAttr = 0, nPyrrhicUnattr = 0;
  for (const t of cap.tbFights) {
    for (const mid of (t.mids || [])) {
      const perfs = (t.perfs[mid] || []).length;
      const wklSame = wkl
        .filter(k => k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1)
        .map(k => ({ d: k.d | 0, trick: k.trick || null, by: k.by || null, via: k.via || null }));
      const killAttributed = wklSame.some(e => e.trick) ? 1 : 0;
      const mort = (t.mortality || {})[mid] || { dead: 0, alive: 0 };
      const row = {
        seq: t.seq, day: t.day, result: t.result, mid: mid, kind: t.kindByMid[mid] || null,
        nPerfs: perfs, pAlive: t.pAlive === true ? 1 : (t.pAlive === false ? 0 : null),
        midDead: mort.dead, midAlive: mort.alive,
        killAttributed: killAttributed, wklSame: wklSame,
      };
      const pyrrhic = isPyrrhic(t, mid);
      if (pyrrhic) {
        nPyrrhic++;
        if (killAttributed) nPyrrhicAttr++; else nPyrrhicUnattr++;
        pyrrhicRows.push(row);
      }
      if (perfs > 0) {
        nPerf++;
        if (killAttributed) { nAttr++; continue; }
        nUnattr++;
        const c = classifyExtended({
          mid: mid, kind: row.kind, day: t.day, result: t.result,
          pAlive: t.pAlive, nPerfs: perfs,
          midDead: mort.dead, midAlive: mort.alive,
          wklSame: wklSame, killAttributed: false,
        });
        classCounts[c.cls] = (classCounts[c.cls] || 0) + 1;
        fights.push(Object.assign({ cls: c.cls, sub: c.sub, note: c.note }, row));
      } else if (killAttributed) {
        nReverse++;
        fights.push(Object.assign({ cls: 'c1', sub: 'reverse-artifact',
          note: 'kill attributed with zero perfs — ±1d join over-attribution' }, row));
      }
    }
  }

  // Codex + villageSlain for mids that went pyrrhic (any mid, not just the known two).
  const codexMon = ((st.codex || {}).monsters) || {};
  const codexStages = {}, slainCounts = {};
  for (const r of pyrrhicRows) {
    codexStages[r.mid] = (codexMon[r.mid] || {}).stage || null;
    slainCounts[r.mid] = ((st.villageSlain || {})[r.mid] | 0);
  }

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const won = !!Game.won ? 1 : 0;

  const tag = armed ? 'armed' : 'control';
  const out = {
    seed: seed, policyId: policyId, arm: 'pyrrhic-verify', condition: tag,
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1, TRIBFLOOR off, SEATDRIVE=0 explicit; NODEWITNESS unset) + pyrrhic fix ' + (armed ? 'ON' : 'OFF (runtime no-op)'),
    gameCommit: (function () { try { return require('child_process').execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch (e) { return 'unknown'; } })(),
    days: result.days, endReason: result.endReason,
    national: national, table: table, won: won, wins: won, exiled: 0,
    nTbFights: cap.tbFights.length,
    nPerf: nPerf, nAttr: nAttr, nUnattr: nUnattr, nReverse: nReverse,
    nPyrrhic: nPyrrhic, nPyrrhicAttr: nPyrrhicAttr, nPyrrhicUnattr: nPyrrhicUnattr,
    classCounts: classCounts,
    pyrrhicRows: pyrrhicRows,
    codexStages: codexStages, villageSlain: slainCounts,
    fights: fights,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${tag}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ policy: policyId, seed: seed, cond: tag, days: result.days, end: result.endReason,
    tbFights: cap.tbFights.length, perf: nPerf, attr: nAttr, unattr: nUnattr,
    pyrrhic: nPyrrhic, pyrrhicAttr: nPyrrhicAttr, pyrrhicUnattr: nPyrrhicUnattr,
    national: national, table: table, won: won }));
  return out;
}

(async () => {
  if (require.main !== module) return;
  const armed = {}, control = {};
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const key = `${policyId}-s${seed}`;
      // RESUME: skip combos whose output file already exists (service restarts
      // wipe /tmp but the per-seed JSONs under evidence/ survive).
      const aFile = path.join(EVID, `${policyId}-s${seed}-armed.json`);
      const cFile = path.join(EVID, `${policyId}-s${seed}-control.json`);
      if (fs.existsSync(aFile)) {
        console.log(`RESUME SKIP ${key} armed (exists)`);
        armed[key] = JSON.parse(fs.readFileSync(aFile, 'utf8'));
      } else {
        armed[key] = await oneRun(seed, policyId, true);
      }
      if (fs.existsSync(cFile)) {
        console.log(`RESUME SKIP ${key} control (exists)`);
        control[key] = JSON.parse(fs.readFileSync(cFile, 'utf8'));
      } else {
        control[key] = await oneRun(seed, policyId, false);
      }
    }
  }
  // ---- det-gate + PRIMARY summary ----
  let totPyrrhicAttr = 0, totPyrrhicUnattrCtrl = 0;
  const gateFails = [];
  const survArmed = [], survCtrl = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const key = `${policyId}-s${seed}`;
      const a = armed[key], c = control[key];
      totPyrrhicAttr += a.nPyrrhicAttr;
      totPyrrhicUnattrCtrl += c.nPyrrhicUnattr;
      survArmed.push(a.days); survCtrl.push(c.days);
      for (const k of ['days', 'endReason', 'nTbFights', 'nPerf', 'national', 'table', 'won']) {
        if (a[k] !== c[k]) gateFails.push(`${key}.${k}: control=${c[k]} armed=${a[k]}`);
      }
    }
  }
  const med = xs => { const s = xs.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const summary = {
    PRIMARY_GO: totPyrrhicAttr >= 2,
    totPyrrhicAttrArmed: totPyrrhicAttr,
    totPyrrhicUnattrControl: totPyrrhicUnattrCtrl,
    medianSurvivalArmed: med(survArmed), medianSurvivalControl: med(survCtrl),
    detGateFails: gateFails,
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('\nVERIFY SUMMARY: ' + JSON.stringify(summary, null, 1));
  console.log('\nSWEEP DONE (pyrrhic-verify) — per-seed JSONs in evidence/2026-10-17/perseed-pyrrhic-verify/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun: oneRun };
