#!/usr/bin/env node
// sweep-recallpolicy-b.js — sim-recallpolicy-b SWEEP (policy-side only,
// ZERO src/js changes). Prereg: evidence/2026-10-29/
// sim-recallpolicy-b-prereg.md (committed BEFORE any judged leg).
//
// Legs on IDENTICAL seeds, shared baseline: base policy belongfeast,
// substrate FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause substrate).
//   OFF leg (control): recall instrument observe-only (RECALLPOLICY_B
//     unset) — triggers recorded as would-fire, no reroute, no completion.
//   ON leg (treatment): RECALLPOLICY_B=1 — cliff-triggered villagers
//     are walked home via BFS-legal steps (see recallpolicy-instrument-b).
// Death attribution rides on the proven deathcensus instrument,
// installed first; the recall instrument wraps villagerMealDay +
// npcSetNode + sleep (sleep stacked after deathcensus's).
//
// Writes ONCE, on purpose, to evidence/2026-10-29/
// sim-recallpolicy-b-corpus-{off,on}/ (override with EVID).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-recallpolicy-b.js
//   FEASTSCALE_R13=1 SEATDRIVE=0 SEEDS=68101,68102 LEGS=on node scripts/sweep-recallpolicy-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));
const RP = require(path.join(REPO, 'scripts', 'recallpolicy-instrument-b'));
const { belongfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));

if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 is required.'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
for (const k of ['SURPLUSFEED', 'UPKEEPGATE', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'VGEAR', 'SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error('SWEEP STOP: ' + k + ' must be unset (substrate is FEASTSCALE_R13=1/SEATDRIVE=0 only).'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [68101, 68102, 68103, 68104, 68105, 68106, 68107, 68108]).filter(Number.isFinite);
const LEGS = (process.env.LEGS ? process.env.LEGS.split(',').map(s => s.trim()) : ['off', 'on']);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVIDBASE = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29');

// Inline seed-freshness assertion (same shape as sweep-deathcause-b,
// but excluding this arm's own corpus dirs so pilot->confirm re-runs
// and single-leg re-runs do not trip on their own output).
(function assertFresh() {
  const seeds = SEEDS.map(String);
  const hits = [];
  const ev = path.join(REPO, 'evidence');
  for (const day of fs.readdirSync(ev)) {
    const dd = path.join(ev, day);
    let st; try { st = fs.statSync(dd); } catch (e) { continue; }
    if (!st.isDirectory()) continue;
    const walk = (dir) => {
      for (const sub of fs.readdirSync(dir)) {
        const full = path.join(dir, sub);
        let s2; try { s2 = fs.statSync(full); } catch (e) { continue; }
        if (s2.isDirectory()) { if (full.indexOf('sim-recallpolicy-b-corpus') < 0) walk(full); continue; }
        for (const s of seeds) if (String(sub).indexOf('s' + s) >= 0) hits.push(path.join(day, sub));
      }
    };
    walk(dd);
  }
  const sc = path.join(REPO, 'scripts');
  for (const f of fs.readdirSync(sc)) {
    if (!/^sweep-.*\.js$/.test(f) || f === 'sweep-recallpolicy-b.js') continue;
    const txt = fs.readFileSync(path.join(sc, f), 'utf8');
    for (const s of seeds) if (txt.indexOf('s' + s) >= 0) hits.push('scripts/' + f + ':s' + s);
  }
  if (hits.length) { console.error('SWEEP STOP: seeds not fresh: ' + hits.slice(0, 10).join(', ')); process.exit(2); }
  console.log('seed freshness OK: ' + seeds.join(','));
})();

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, leg) {
  if (leg === 'on') process.env.RECALLPOLICY_B = '1'; else delete process.env.RECALLPOLICY_B;
  const { Game } = await loadGame({ seed: seed, mode: 'recallpolicy-b', fullTelemetry: false });
  const inst = DC.install(Game);
  const K = inst.K;
  const rp = RP.install(Game);
  const RK = rp.K;
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, belongfeast, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  let fin = null, rfin = null;
  try { fin = DC.finalize(Game, K); } catch (e) { K.instrumentErrors.push('finalize: ' + String((e && e.message) || e)); }
  try { rfin = RP.finalize(Game, RK, fin); } catch (e) { RK.errors.push('rfin: ' + String((e && e.message) || e)); }
  try { rp.uninstall(); } catch (e) {}
  try { inst.uninstall(); } catch (e) {}

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
    seed: seed, leg: leg, policy: 'belongfeast',
    instruments: ['deathcensus-instrument-20261021', 'recallpolicy-instrument-b'],
    substrate: 'FEASTSCALE_R13=1 SEATDRIVE=0, belongfeast',
    anchorCommit: ANCHOR,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, everNational: everNational, table: table, won: won, exiled: exiled,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    villageLost: fin ? fin.villageLost : null,
    deaths: fin ? fin.deaths : [],
    personDeaths: fin ? fin.personDeaths : 0,
    unexplained: fin ? fin.unexplained : -1,
    instrumentErrors: (fin ? fin.instrumentErrors : []).concat(rfin ? rfin.errors : []),
    recall: rfin,
    deathDayLines: fin ? fin.deathDayLines : [],
    lossDayLines: fin ? fin.lossDayLines : [],
  };
  const dir = path.join(EVIDBASE, 'sim-recallpolicy-b-corpus-' + leg);
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, 'recallpolicy-' + leg + '-s' + seed + '.json');
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const leg of LEGS) {
      try {
        const r = await oneRun(seed, leg);
        rows.push(r);
        const rc = r.recall || {};
        const starv = (r.deaths || []).filter((d) => d.pclass === 'starvation').length;
        console.log('done ' + leg + ' s' + seed + ': end=' + r.endReason + ' days=' + r.days +
          ' gameDays=' + r.gameDays + ' nat=' + r.national + ' table=' + r.table + ' won=' + r.won +
          ' wave5=' + r.wave5 + ' pdeaths=' + r.personDeaths + ' starv=' + starv +
          ' trig=' + (rc.triggered || 0) + ' rescued=' + (rc.rescuedStrict || 0) +
          ' steps=' + ((rc.steps || []).length) + ' errs=' + r.instrumentErrors.length);
      } catch (e) {
        console.error('FAILED ' + leg + ' s' + seed + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
        process.exitCode = 1;
      }
    }
  }
  for (const leg of LEGS) {
    const dir = path.join(EVIDBASE, 'sim-recallpolicy-b-corpus-' + leg);
    fs.writeFileSync(path.join(dir, '_summary.json'), JSON.stringify(rows.filter((r) => r.leg === leg).map((r) => ({
      seed: r.seed, leg: r.leg, maxWave: r.maxWave, national: r.national, everNational: r.everNational,
      table: r.table, won: r.won, exiled: r.exiled, gameDays: r.gameDays, endReason: r.endReason,
      villageLost: r.villageLost, personDeaths: r.personDeaths, unexplained: r.unexplained,
      starvDeaths: (r.deaths || []).filter((d) => d.pclass === 'starvation').length,
      triggered: (r.recall || {}).triggered || 0, rescuedStrict: (r.recall || {}).rescuedStrict || 0,
      instrumentErrors: r.instrumentErrors,
    })), null, 1) + '\n');
  }
  console.log('wrote ' + rows.length + ' per-seed JSONs');
})().catch(function (e) { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
