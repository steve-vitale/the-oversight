#!/usr/bin/env node
// sweep-dissolvetax-20261021.js — sim-dissolvetax SWEEP.
//
// 8 FRESH seeds (64901-64908, asserted unused inline) x {leadfeast, belongfeast}
// = 16 runs, 180d death-aware, on the VGEAR=1 winning substrate
// (scripts/policies/vgearconfirm.js armedFor):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1
// No control arm — diagnostic on the winning substrate; the contrast is
// between CAUSES, not arms. The dissolvetax instrument is installed on every
// run; attributions computed post-run from the census records.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-dissolvetax/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 \
//   SEEDS=64901,64902 node scripts/sweep-dissolvetax-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const DT = require(path.join(REPO, 'scripts', 'dissolvetax-instrument-20261021'));

// WINNING-SUBSTRATE guard (pinned env; nothing else).
const REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR'];
for (const k of REQ) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS', 'SURPLUSFEED']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}

let VCE = null;
try { VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm')); }
catch (e) { console.error('SWEEP STOP: scripts/policies/vgearconfirm.js missing.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64901, 64902, 64903, 64904, 64905, 64906, 64907, 64908]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-dissolvetax');
fs.mkdirSync(EVID, { recursive: true });

// Inline seed-freshness assertion: seeds 64901-64908 must not appear in the
// repo's seed registries (evidence per-seed filenames + sweep SEEDS lists).
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
    if (!/^sweep-.*\.js$/.test(f) || f === 'sweep-dissolvetax-20261021.js') continue;
    const txt = fs.readFileSync(path.join(sc, f), 'utf8');
    for (const s of seeds) if (txt.indexOf(s) >= 0) hits.push('scripts/' + f + ':' + s);
  }
  if (hits.length) { console.error('SWEEP STOP: seeds not fresh: ' + hits.slice(0, 10).join(', ')); process.exit(2); }
  console.log('seed freshness OK: ' + seeds.join(','));
})();

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = VCE.normBase(base); return VCE.armedFor(t); }

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const { Game } = await loadGame({ seed, mode: 'dissolvetax', fullTelemetry: false });
  const inst = DT.install(Game);
  const K = inst.K;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.uninstall(); } catch (e) {}

  // Attributions for every lost edge.
  const attributions = [];
  try {
    for (const e of (K.natEvents || [])) {
      if (e.kind !== 'lost') continue;
      const a = DT.attributeDissolution(K, e);
      attributions.push({ d: e.d, shape: e.shape, class: a.class, sub: a.sub, evidence: a.evidence });
    }
  } catch (e) { K.instrumentErrors.push('attr: ' + String((e && e.message) || e)); }

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let everNational = 0;
  try { for (const e of (K.natEvents || [])) if (e.kind === 'sat') { everNational = 1; break; } } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const out = {
    seed, policy: VCE.normBase(base) + '-vgear-dissolvetax', base: VCE.normBase(base),
    instrument: 'dissolvetax-20261021',
    substrate: 'VGEAR=1 winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, everNational, table, won, exiled,
    days: result.days, gameDays, endReason: result.endReason,
    attributions,
    natEvents: K.natEvents.map(e => ({ d: e.d, kind: e.kind, shape: e.shape })),
    breaks: K.breaks,
    rumors: K.rumors.filter(r => r.kind === 'schism' || r.kind === 'succession'),
    instrumentErrors: K.instrumentErrors,
    deathCauses,
    censusDays: K.census.length,
  };
  // The full census is large; keep a compact but complete copy for the
  // honesty cross-check (hand-recomputation from raw state reads).
  const fp = path.join(EVID, `dissolvetax-${VCE.normBase(base)}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  const fpC = path.join(EVID, `dissolvetax-${VCE.normBase(base)}-s${seed}.census.json`);
  fs.writeFileSync(fpC, JSON.stringify({ seed, base: VCE.normBase(base), census: K.census, dissolveLines: K.dissolveLines }, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        const attr = r.attributions.map(a => `${a.shape}/${a.class}`).join(',') || 'none';
        console.log(`done ${r.policy} s${seed}: nat=${r.national} ever=${r.everNational} table=${r.table} won=${r.won} wave5=${r.wave5} errs=${r.instrumentErrors.length} end=${r.endReason} attrs=[${attr}]`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, everNational: r.everNational,
    table: r.table, won: r.won, exiled: r.exiled, gameDays: r.gameDays, endReason: r.endReason,
    attributions: r.attributions, deathCauses: r.deathCauses,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
