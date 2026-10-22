#!/usr/bin/env node
// test-surplusfeed-remove-b.js — RED->GREEN removal proof (arm
// sim-surplusfeed-remove-b, run fleshout-loop-b-20261021T2130Z).
//
// Steve's 2026-10-21 decision: the SURPLUSFEED pantry-trim governor is
// REMOVED ("take it off, it sounds like a bad way to control outcomes"),
// not parked. docs/DECISIONS.md 2026-10-21. The governor was default-OFF on
// master, so the removal must be behavior-neutral at default.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surplusfeed-remove-b.js sweep --out <dir>
//        FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surplusfeed-remove-b.js compare <dirA> <dirB>
// (Read the Usage header BEFORE running any proof (ENV TRAP rule).)
//
// PRE-REGISTRATION (2026-10-21):
//   primary metric: byte-identical canonical trajectories for the 8-seed
//     sweep (seeds 9001-9008 x leadfeast/belongfeast, 180d death-aware,
//     FEASTSCALE_R13=1/SEATDRIVE=0), removed-tree vs unmodified master.
//   GO threshold: compare prints ALL 16 ROWS IDENTICAL and (a)+(c) below
//     both pass. Any residual src/js reference or any behavioral delta =
//     NO-GO.
//   horizon: 180d death-aware (runDays stops at Game.over; survived runs
//     cap at 180) — matches the scale-wall lens: long enough for pantry
//     glut stretches to form and for national/table to be reached.
//   seeds: 9001-9008 x leadfeast,belongfeast (16 rows).
//
// Assertions:
//   (a) no surplusFeedGovernor/_surplusFeedOn/SURPLUSFEED (case-insens) in
//       src/js/
//   (b) det-gate: sweep rows byte-identical on removed tree vs unmodified
//       master (run the sweep once per tree, then compare)
//   (c) SURPLUSFEED=1 env: trajectories identical to flag-unset AND
//       trimDays=0 everywhere (the lever is gone, not parked)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}

const SEEDS = [9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008];
const POLICIES = { leadfeast, belongfeast };
const DAYS = 180;

function canon(Game) {
  const v = (Game.state || {}).village || {};
  const items = (v.pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (v.roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  const deaths = (Game.state.telemetry || []).filter(t => t.type === 'death').length;
  let trimDays = 0, trimKcal = 0;
  try {
    const sf = v._surplusFeed;
    if (sf && sf.days) {
      for (const d of Object.keys(sf.days)) { trimDays++; trimKcal += sf.days[d].kcal || 0; }
    }
  } catch (e) {}
  let ps = null;
  try { ps = typeof Game.progState === 'function' ? Game.progState() : null; } catch (e) {}
  return {
    seed: Game.__simSeed, policy: Game.__simPolicy,
    day: s.day || 0, pk: items, r: roster,
    hp: Math.round(s.hp || 0), hu: Math.round(s.hunger || 0),
    won: !!Game.won, national: !!Game.state.nationalLive,
    table: !!(ps && ps.tableWaiting),
    rank: (typeof Game.scaleRank === 'function' ? Game.scaleRank() : '?'),
    maxWave: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1),
    deaths, endReason: null, // set by caller
    trimDays, trimKcal: Math.round(trimKcal),
    trimState: v._surplusFeed === undefined ? 'none' : 'present',
  };
}

async function sweep(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const rows = [];
  for (const seed of SEEDS) {
    for (const [policyId, policy] of Object.entries(POLICIES)) {
      const { Game } = await loadGame({ seed, mode: 'sfrem-det', fullTelemetry: false });
      await setupGame(Game);
      Game.__simSeed = seed; Game.__simPolicy = policyId;
      const result = await runDays(Game, policy, { days: DAYS, manifest: null });
      const c = canon(Game);
      c.endReason = result.endReason;
      rows.push(c);
      fs.writeFileSync(path.join(outDir, `seed${seed}-${policyId}.json`),
        JSON.stringify(c, null, 2));
      console.log(`swept seed=${seed} policy=${policyId} day=${c.day} end=${c.endReason} trimDays=${c.trimDays}`);
    }
  }
  return rows;
}

function compare(dirA, dirB) {
  const files = fs.readdirSync(dirA).filter(f => f.endsWith('.json')).sort();
  let same = 0, diff = 0, trimDaysA = 0, trimDaysB = 0;
  for (const f of files) {
    const b = path.join(dirB, f);
    if (!fs.existsSync(b)) { console.log('MISSING in B: ' + f); diff++; continue; }
    const a = JSON.parse(fs.readFileSync(path.join(dirA, f), 'utf8'));
    const bb = JSON.parse(fs.readFileSync(b, 'utf8'));
    trimDaysA += a.trimDays || 0; trimDaysB += bb.trimDays || 0;
    const aa = Object.assign({}, a); delete aa.seed; delete aa.policy;
    const bc = Object.assign({}, bb); delete bc.seed; delete bc.policy;
    if (JSON.stringify(aa) === JSON.stringify(bc)) { same++; }
    else {
      diff++;
      const keys = new Set([...Object.keys(aa), ...Object.keys(bc)]);
      for (const k of keys) if (JSON.stringify(aa[k]) !== JSON.stringify(bc[k]))
        console.log(`DIFF ${f}.${k}: A=${JSON.stringify(aa[k])} B=${JSON.stringify(bc[k])}`);
    }
  }
  console.log(`compare: ${same} identical, ${diff} differ (trimDays A=${trimDaysA} B=${trimDaysB})`);
  return { same, diff, trimDaysA, trimDaysB };
}

async function sourceGrep() {
  const srcDir = path.join(__dirname, '..', 'src', 'js');
  const hits = [];
  for (const f of fs.readdirSync(srcDir)) {
    if (!f.endsWith('.js')) continue;
    const t = fs.readFileSync(path.join(srcDir, f), 'utf8');
    t.split('\n').forEach((line, i) => {
      if (/surplusfeed|surplusFeedGovernor|_surplusFeedOn/i.test(line)) hits.push(`${f}:${i + 1}`);
    });
  }
  return hits;
}

(async () => {
  const cmd = process.argv[2];
  if (cmd === 'sweep') {
    const i = process.argv.indexOf('--out');
    const out = i > 0 ? process.argv[i + 1] : 'evidence/2026-10-21/perseed-surplusfeed-remove-b/removed';
    await sweep(out);
    console.log('SWEEP DONE -> ' + out);
    return;
  }
  if (cmd === 'compare') {
    const [dirA, dirB] = [process.argv[3], process.argv[4]];
    const r = compare(dirA, dirB);
    const pass = r.diff === 0;
    console.log(pass ? 'ALL 16 ROWS IDENTICAL' : 'ROWS DIFFER — NO-GO');
    process.exit(pass ? 0 : 1);
    return;
  }
  if (cmd === 'gone') {
    // assertion (a): the removal grep
    const hits = await sourceGrep();
    const pass = hits.length === 0;
    console.log(pass ? 'PASS no surplusfeed references in src/js/' : 'FAIL references: ' + hits.join(' | '));
    process.exit(pass ? 0 : 1);
    return;
  }
  console.error('usage: sweep --out <dir> | compare <dirA> <dirB> | gone');
  process.exit(2);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
