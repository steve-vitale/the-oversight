#!/usr/bin/env node
// sweep-heraldsplit-20261021.js — sim-heraldsplit diagnostic sweep
// (backlog #749, herald-split wave-4 census; run fleshout-20261021T1215Z,
// axis scale-onramp).
//
// 8 FRESH seeds x {leadfeast, belongfeast} = 16 runs, 180d death-aware, on
// the PINNED WINNING SUBSTRATE (VCE.armedFor: scripts/policies/
// vgearconfirm.js — the VGEAR=1 stack) + the herald-split attribution
// instrument (scripts/instr-heraldsplit-20261021.js, layering killdisc v2).
// ZERO src/js, ZERO scripts/policies changes. No lever, no control arm.
//
// Attribution (attributeRun, in-process — fight ids carry Date.now() and
// are never persisted): every wave-4+ census unit (TB engagement,
// villager field fight, unjoined kill, unmet spawn) with titan class
// (herald / wave4-monster / other-titan), trigger (omen/expedition/raid/
// other), outcome (entered/refused-solo/fled/unmet/delegated), and kill
// joins via killdisc v2.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-heraldsplit/{policy}/s<seed>.json and prints
// a summary. No timestamps or timings are written, so re-runs are
// byte-comparable (per-seed JSONs carry no fight ids).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEEDS=64871,64872 node scripts/sweep-heraldsplit-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const HS = require(path.join(REPO, 'scripts', 'instr-heraldsplit-20261021'));

// Exact pinned-substrate env — the sweep FAILS LOUD unless it matches.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate).`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('SWEEP STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!HS.instrumentOn()) { console.error('SWEEP STOP: heraldsplit instrument off despite KILLDISC=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64871, 64872, 64873, 64874, 64875, 64876, 64877, 64878]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-heraldsplit');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

async function oneRun(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'heraldsplit', fullTelemetry: false });
  const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, refusals: [], instrumentErrors: [] };
  const uninstall = HS.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  // In-process attribution (fight ids only joinable live).
  const attr = HS.attributeRun(Game, t);
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0, won = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { exiled = !!(st.scholar && st.scholar.exiled) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  let w4Day = null, w5Day = null;
  try {
    for (const c of t.census) {
      if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
      if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
    }
  } catch (e) {}

  // herald refusal rate (secondary)
  const heraldEng = attr.units.filter(u => u.kind === 'engagement' && u.cls === 'herald');
  const heraldRefused = heraldEng.filter(u => u.outcome === 'refused-solo').length;

  const out = {
    seed, policyId, instrument: 'heraldsplit-v1',
    substrate: 'VCE.armedFor (VGEAR=1 winning stack), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 + KILLDISC=1 (killdisc v2 + heraldsplit layer)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    w4Day, w5Day,
    national, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    nUnits: attr.units.length,
    unexplained: attr.unexplained,
    heraldEngagements: heraldEng.length, heraldRefused,
    units: attr.units,
    counts: attr.counts,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `s${seed}.json`);
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
        console.log(`done ${policyId} s${seed}: units=${r.units.length} unexplained=${r.unexplained} herald=${r.heraldEngagements}/${r.heraldRefused}ref errs=${r.instrumentErrors.length} w4=${r.wave4} w5=${r.wave5} end=${r.endReason}`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, instrument: 'heraldsplit-v1', error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const summary = {
    instrument: 'heraldsplit-v1', n: ok.length, errors: rows.length - ok.length,
    totalUnits: ok.reduce((a, r) => a + (r.nUnits || 0), 0),
    totalUnexplained: ok.reduce((a, r) => a + (r.unexplained || 0), 0),
    totalHeraldEng: ok.reduce((a, r) => a + (r.heraldEngagements || 0), 0),
    totalHeraldRefused: ok.reduce((a, r) => a + (r.heraldRefused || 0), 0),
    runsWave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
    table: ok.filter(r => r.table).length,
    wins: ok.filter(r => r.won).length,
    exiled: ok.filter(r => r.exiled).length,
    wave4unlocks: ok.filter(r => r.wave4).length,
    wave5unlocks: ok.filter(r => r.wave5).length,
  };
  console.log(JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'), JSON.stringify(summary, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
