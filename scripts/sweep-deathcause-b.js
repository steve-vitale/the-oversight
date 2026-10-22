#!/usr/bin/env node
// sweep-deathcause-b.js — sim-deathcause-b SWEEP (DIAG, instrument-only,
// ZERO src/js changes, ZERO policy changes).
//
// 16 FRESH seeds (66049-66056, asserted unused inline) x {leadfeast, belongfeast}
// = 16 runs, 180d death-aware (dead villages stop; the harness loop ends on
// Game.over), on the FEASTSCALE_R13=1 / SEATDRIVE=0 substrate — the current
// master substrate (SURPLUSFEED removed, depositgate + plentydepri landed).
//
// Two instruments ride every run:
//   - scripts/deathcensus-instrument-20261021.js (proven, 75/75 green):
//     death rows, daily dawn series (pantry, feast/trim/tribute outflows,
//     nationalLive), village-lost trigger beats, sense corpus.
//   - scripts/starvechan-instrument-b.js (this arm): per-villager meal rows,
//     dawn rot scans, deposit source tags, homecoming windows, scholar meals.
//
// Writes ONCE, on purpose, to evidence/2026-10-22/perseed-deathcause-b/.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-deathcause-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=66049,66050 POLICIES=leadfeast node scripts/sweep-deathcause-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));
const SC = require(path.join(REPO, 'scripts', 'starvechan-instrument-b'));
const { leadfeast, belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

// SUBSTRATE guard (pinned env; nothing else).
if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
for (const k of ['SURPLUSFEED', 'UPKEEPGATE', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'VGEAR', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error('SWEEP STOP: ' + k + ' must be unset (substrate is FEASTSCALE_R13=1/SEATDRIVE=0 only).'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [66049, 66050, 66051, 66052, 66053, 66054, 66055, 66056]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-deathcause-b');
fs.mkdirSync(EVID, { recursive: true });
const POLICIES = { lead: leadfeast, belong: belongfeast };

// Inline seed-freshness assertion: sweep seeds must not appear in the repo's
// evidence filenames or sweep/proof SEEDS lists.
(function assertFresh() {
  const seeds = SEEDS.map(String);
  const hits = [];
  const ev = path.join(REPO, 'evidence');
  for (const day of fs.readdirSync(ev)) {
    const dd = path.join(ev, day);
    let st; try { st = fs.statSync(dd); } catch (e) { continue; }
    if (!st.isDirectory()) continue;
    for (const sub of fs.readdirSync(dd)) {
      const fn = String(sub);
      for (const s of seeds) if (fn.indexOf(s) >= 0) hits.push(path.join(day, fn));
    }
  }
  const sc = path.join(REPO, 'scripts');
  for (const f of fs.readdirSync(sc)) {
    if (!/^sweep-.*\.js$/.test(f) || f === 'sweep-deathcause-b.js') continue;
    const txt = fs.readFileSync(path.join(sc, f), 'utf8');
    for (const s of seeds) if (txt.indexOf(s) >= 0) hits.push('scripts/' + f + ':' + s);
  }
  if (hits.length) { console.error('SWEEP STOP: seeds not fresh: ' + hits.slice(0, 10).join(', ')); process.exit(2); }
  console.log('seed freshness OK: ' + seeds.join(','));
})();

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, base) {
  const policy = POLICIES[base];
  const { Game } = await loadGame({ seed: seed, mode: 'deathcause-b', fullTelemetry: false });
  const inst = DC.install(Game);
  const K = inst.K;
  const sic = SC.install(Game);
  const SK = sic.K;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let fin = null, sfin = null;
  try { fin = DC.finalize(Game, K); } catch (e) { K.instrumentErrors.push('finalize: ' + String((e && e.message) || e)); }
  try { sfin = SC.finalize(Game, SK, fin); } catch (e) { SK.errors.push('sfin: ' + String((e && e.message) || e)); }
  // Uninstall in REVERSE order of installation (SC wraps DC's sleep wrap).
  try { sic.uninstall(); } catch (e) {}
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
    instruments: ['deathcensus-instrument-20261021', 'starvechan-instrument-b'],
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0, current master (SURPLUSFEED removed, depositgate+plentydepri landed)',
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
    starvechan: sfin,
  };
  const fp = path.join(EVID, 'deathcause-' + base + '-s' + seed + '.json');
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
        const sc = r.starvechan || {};
        console.log('done ' + r.policy + ' s' + seed + ': end=' + r.endReason + ' days=' + r.days +
          ' nat=' + r.national + ' table=' + r.table + ' won=' + r.won + ' wave5=' + r.wave5 +
          ' pdeaths=' + r.personDeaths + ' unexpl=' + r.unexplained +
          ' starv=' + ((sc.starv || []).length) +
          ' vlost=' + (vl.lost ? vl.site + '@d' + vl.day : 'no') + ' errs=' + r.instrumentErrors.length + '/' + (sc.errors || []).length);
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
      unexplained: r.unexplained,
      starvDeaths: ((r.starvechan || {}).starv || []).length,
      instrumentErrors: r.instrumentErrors,
    };
  }), null, 1) + '\n');
  console.log('wrote ' + rows.length + ' per-seed JSONs to ' + EVID);
})().catch(function (e) { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
