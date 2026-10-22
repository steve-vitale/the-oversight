#!/usr/bin/env node
// sweep-hurtvillager-id-b.js — sim-hurtvillager-id-b SWEEP (instrument-only
// corpus producer for the death-attribution fix, backlog #788).
//
// 16 seeds (66041-66048 — SAME seeds as the committed deathcensus-b corpus,
// asserted unused elsewhere inline) x {leadfeast, belongfeast} = 16 runs,
// 180d death-aware, on the FEASTSCALE_R13=1 / SEATDRIVE=0 substrate.
//
// The deathcensus instrument is installed on every run; per-seed JSONs carry
// the full autopsy-grade payload (death rows WITH monsterId/monsterName as
// threaded by the fix, daily series, wall flags). Writes to
// evidence/2026-10-22/perseed-hurtvillager-id-b/ by default (override with
// EVID=). Subset with SEEDS= / POLICIES=.
//
// This sweep exists to feed PART C of scripts/test-hurtvillager-id-b.js:
// a same-base before/after comparison (BEFORE = pristine engine on the same
// base, AFTER = this tree). The dead worker's original PART C design
// compared against the committed 2026-10-21 corpus, whose anchor
// (961321a40857) predates behavior-changing commits (SURPLUSFEED removal,
// journey-succession r36 death mechanics, cisterncheck-b dispatch,
// plentydepri) — byte-identity across that base gap is unachievable and not
// evidence about this fix. Same-base before/after is the honest gate.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-hurtvillager-id-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 EVID=evidence/2026-10-22/perseed-hurtvillager-id-b-BEFORE node scripts/sweep-hurtvillager-id-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=66041,66042 POLICIES=leadfeast node scripts/sweep-hurtvillager-id-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

// SUBSTRATE guard (pinned env; nothing else).
if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
for (const k of ['SURPLUSFEED', 'UPKEEPGATE', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'VGEAR', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error('SWEEP STOP: ' + k + ' must be unset (substrate is FEASTSCALE_R13=1/SEATDRIVE=0 only).'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66041, 66042, 66043, 66044, 66045, 66046, 66047, 66048]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-hurtvillager-id-b');
fs.mkdirSync(EVID, { recursive: true });
const POLICIES = { lead: leadfeast, belong: belongfeast };

// Inline seed-freshness assertion: seeds 66041-66048 are the deathcensus-b
// corpus seeds (deliberate reuse for same-seed attribution comparison).
// They must not appear in any OTHER sweep/proof seed list.
(function assertFresh() {
  const seeds = SEEDS.map(String);
  const hits = [];
  const sc = path.join(REPO, 'scripts');
  for (const f of fs.readdirSync(sc)) {
    if (!/^sweep-.*\.js$/.test(f) || f === 'sweep-deathcensus-b.js' || f === 'sweep-hurtvillager-id-b.js') continue;
    const txt = fs.readFileSync(path.join(sc, f), 'utf8');
    for (const s of seeds) if (txt.indexOf(s) >= 0) hits.push('scripts/' + f + ':' + s);
  }
  if (hits.length) { console.error('SWEEP STOP: seeds not fresh: ' + hits.slice(0, 10).join(', ')); process.exit(2); }
  console.log('seed check OK: ' + seeds.join(',') + ' (deathcensus-b corpus seeds, intentional reuse)');
})();

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, base) {
  const policy = POLICIES[base];
  const { Game } = await loadGame({ seed: seed, mode: 'hurtvillager-id-b', fullTelemetry: false });
  const inst = DC.install(Game);
  const K = inst.K;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let fin = null;
  try { fin = DC.finalize(Game, K); } catch (e) { K.instrumentErrors.push('finalize: ' + String((e && e.message) || e)); }
  try { inst.uninstall(); } catch (e) {}

  // Wall fields (the engine's own verdicts).
  let national = 0, table = 0, exiled = 0, won = 0, maxWave = 1;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  let everNational = 0;
  try { for (const e of ((fin && fin.realmNatEvents) || [])) if (e.kind === 'sat') { everNational = 1; break; } } catch (e2) {}
  let gameDays = 0;
  try { gameDays = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}

  const out = {
    seed: seed, policy: base + 'feast', base: base,
    instrument: 'deathcensus-instrument-20261021',
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0 (hurtvillager-id-b #788 corpus)',
    anchorCommit: ANCHOR,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, everNational: everNational, table: table, won: won, exiled: exiled,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    villageLost: fin ? fin.villageLost : null,
    deaths: fin ? fin.deaths : [],
    personDeaths: fin ? fin.personDeaths : 0,
    unexplained: fin ? fin.unexplained : -1,
    unexplainedRows: fin ? fin.unexplainedRows : [],
    daily: fin ? fin.daily : [],
    realmNatEvents: fin ? fin.realmNatEvents : [],
    sayLineCount: fin ? fin.sayLineCount : 0,
    deathDayLines: fin ? fin.deathDayLines : [],
    lossDayLines: fin ? fin.lossDayLines : [],
    instrumentErrors: K.instrumentErrors,
  };
  const fp = path.join(EVID, 'hurtvillager-' + base + '-s' + seed + '.json');
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        const vl = r.villageLost || {};
        console.log('done ' + r.policy + ' s' + seed + ': end=' + r.endReason + ' days=' + r.days +
          ' nat=' + r.national + ' table=' + r.table + ' won=' + r.won + ' wave5=' + r.wave5 +
          ' pdeaths=' + r.personDeaths + ' unexpl=' + r.unexplained +
          ' vlost=' + (vl.lost ? vl.site + '@d' + vl.day : 'no') + ' errs=' + r.instrumentErrors.length);
      } catch (e) {
        console.error('FAILED ' + base + ' s' + seed + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(rows.map(function (r) {
    return {
      seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national,
      everNational: r.everNational, table: r.table, won: r.won, exiled: r.exiled,
      gameDays: r.gameDays, endReason: r.endReason,
      villageLost: r.villageLost, personDeaths: r.personDeaths,
      unexplained: r.unexplained, instrumentErrors: r.instrumentErrors,
    };
  }), null, 1) + '\n');
  console.log('wrote ' + rows.length + ' per-seed JSONs to ' + EVID);
})().catch(function (e) { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
