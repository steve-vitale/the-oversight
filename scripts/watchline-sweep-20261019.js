#!/usr/bin/env node
// watchline-sweep-20261019.js — sim-watchline lever sweep.
//
// 8 fresh seeds (63401-63408 — verified filename-unused in
// evidence/2026-10-18/perseed-*/ before the sweep) x {leadfeast,
// belongfeast} x {control (WATCHLINE unset), armed (WATCHLINE=1)} = 32 runs,
// 180d death-aware, on the pure tribfloor base (NO vetstaff/vetblood/vetrel),
// with the COMPRESENCE read-only presence instrument for the join-rate
// secondary.
//
// STANDALONE driver (do NOT fold into scripts/sweep-compare.js — sibling
// loop B has live concurrent edits there).
//
// INSTRUMENT: loadGame({seed, mode:'watchline', fullTelemetry:false}) +
// scripts/policies/watchline leadfeast/belongfeast (WATCHLINE per arm) +
// scripts/compresence-instrument-20261018.js (COMPRESENCE=1) +
// runDays({days:180}).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-watchline/ and prints a summary. No
// timestamps or timings are written, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 COMPRESENCE=1 \
//   SEEDS=63401,63402 node scripts/watchline-sweep-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WL = require(path.join(REPO, 'scripts', 'policies', 'watchline'));
const CP = require(path.join(REPO, 'scripts', 'compresence-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'COMPRESENCE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (process.env.VETSTAFF === '1') { console.error('SWEEP STOP: VETSTAFF must be unset (pure tribfloor base).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!CP.instrumentOn()) { console.error('SWEEP STOP: COMPRESENCE instrument off despite COMPRESENCE=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63401, 63402, 63403, 63404, 63405, 63406, 63407, 63408]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-watchline');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(policyId) {
  // The WATCHLINE env var is the only switch — control and armed share the
  // same policy objects; the layer delegates byte-identically when off.
  return policyId === 'leadfeast' ? WL.leadfeast : WL.belongfeast;
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// veterans: waveKillLog entries with w>=3 whose killer is a villager (not
// the scholar). living = in roster and not dead at run end.
function veteransOf(Game) {
  const out = { living: [], ever: [] };
  try {
    const st = Game.state || {};
    const log = st.waveKillLog || [];
    const scholar = Game.villagerId;
    const roster = new Set(((st.village || {}).roster) || []);
    const seen = new Set();
    for (const e of log) {
      if (!e || (e.w | 0) < 3) continue;
      const by = e.by;
      if (!by || by === scholar) continue;
      if (!roster.has(by)) continue;
      if (seen.has(by)) continue;
      seen.add(by);
      out.ever.push({ vid: by, name: nameOf(Game, by), mid: e.mid, w: e.w, d: e.d, via: e.via });
      let dead = false;
      try { dead = !!((Game.vpOf(by) || {}).dead); } catch (e2) {}
      if (!dead) out.living.push({ vid: by, name: nameOf(Game, by), mid: e.mid, w: e.w, d: e.d, via: e.via });
    }
  } catch (e) {}
  return out;
}

async function oneRun(seed, policyId, arm) {
  if (arm === 'armed') process.env.WATCHLINE = '1';
  else delete process.env.WATCHLINE;
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'watchline', fullTelemetry: false });
  const t = { fights: [], kills: [], engagements: [], census: [], dmg: {}, fieldFights: [], instrumentErrors: [] };
  await setupGame(Game);
  try { t.rosterStart = CP.rosterOf(Game).length; } catch (e) { t.rosterStart = -1; }
  const uninstall = CP.install(Game, t);

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

  const vets = veteransOf(Game);

  // wave-3+ fight join-rate (COMPRESENCE census)
  const fights3 = (t.fights || []).filter(f => (f.wave | 0) >= 3);
  const joiners3 = fights3.reduce((a, f) => a + ((f.joiners || []).length), 0);
  const fightsWithJoin = fights3.filter(f => ((f.joiners || []).length || 0) > 0).length;

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}
  let starvation = 0;
  for (const [c, n] of Object.entries(deathCauses)) if (/starv/i.test(c)) starvation += n;

  const out = {
    seed, policyId, arm, watchline: WL.layerOn() ? 1 : 0,
    substrate: 'pure tribfloor (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1, COMPRESENCE=1, no vetstaff/vetblood/vetrel)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    rosterStart: t.rosterStart,
    livingVeterans: vets.living.length, everVeterans: vets.ever.length,
    vetDetail: vets,
    w3Fights: fights3.length, w3FightsWithJoin: fightsWithJoin, w3Joiners: joiners3,
    joinRate: fights3.length ? +(fightsWithJoin / fights3.length).toFixed(3) : null,
    starvation, deathCauses,
    instrumentErrors: t.instrumentErrors,
  };
  const fp = path.join(EVID, `${arm}-${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const arm of ARMS) {
    for (const seed of SEEDS) {
      for (const policyId of POLICIES) {
        try {
          const r = await oneRun(seed, policyId, arm);
          rows.push(r);
          console.log(`done ${arm} ${policyId} s${seed}: livVet=${r.livingVeterans} everVet=${r.everVeterans} w4=${r.wave4} nat=${r.national} days=${r.days}`);
        } catch (e) {
          console.error(`ERROR ${arm} ${policyId} s${seed}: ${e && e.message}`);
          rows.push({ seed, policyId, arm, error: String(e && e.message) });
        }
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const by = (arm) => ok.filter(r => r.arm === arm);
  const sum = (rs, f) => rs.reduce((a, r) => a + (f(r) || 0), 0);
  const med = (rs, f) => { const s = rs.map(f).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const summary = {
    n: ok.length, errors: rows.length - ok.length,
    arms: {},
  };
  for (const arm of ARMS) {
    const rs = by(arm);
    summary.arms[arm] = {
      n: rs.length,
      livingVeterans: sum(rs, r => r.livingVeterans),
      everVeterans: sum(rs, r => r.everVeterans),
      wave4: sum(rs, r => r.wave4), wave5: sum(rs, r => r.wave5),
      national: sum(rs, r => r.national), table: sum(rs, r => r.table), won: sum(rs, r => r.won),
      medianDays: med(rs, r => r.days), maxDays: Math.max(...rs.map(r => r.days)),
      starvation: sum(rs, r => r.starvation),
      w3Fights: sum(rs, r => r.w3Fights), w3FightsWithJoin: sum(rs, r => r.w3FightsWithJoin),
      instrumentErrors: sum(rs, r => (r.instrumentErrors || []).length),
    };
  }
  const c = summary.arms.control || {}, a = summary.arms.armed || {};
  summary.primaryDelta = (a.livingVeterans || 0) - (c.livingVeterans || 0);
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
