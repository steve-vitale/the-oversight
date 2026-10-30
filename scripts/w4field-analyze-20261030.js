#!/usr/bin/env node
// w4field-analyze-20261030.js — sim-w4field-a analyzer.
//
// Reads evidence/2026-10-30/perseed-w4field/leadfeast/s*.json, plus the
// killconv corpus for the replay check, and prints the decomposition:
// outcome counts, failure attribution (prereg rule), damage fractions,
// rounds, party/gear splits, field completeness, replay mismatches,
// and one sense sample (first fight) per outcome class.
// Usage: node scripts/w4field-analyze-20261030.js [dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-w4field', 'leadfeast');
const KC_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-killconv', 'leadfeast');

function loadDir(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^s\d+\.json$/.test(f)) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}
function med(a) {
  const s = a.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((x, y) => x - y);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(a) {
  const s = a.filter(x => x !== null && x !== undefined && Number.isFinite(x));
  if (!s.length) return null;
  return s.reduce((p, x) => p + x, 0) / s.length;
}

const runs = loadDir(DIR);
const kc = loadDir(KC_DIR);
const kcBySeed = {};
for (const r of kc) kcBySeed[r.seed] = r;

const fights = [];
for (const r of runs) for (const f of r.fights) fights.push(Object.assign({ seed: r.seed }, f));

const outcomes = {};
for (const f of fights) outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
const fought = fights.filter(f => f.outcome !== 'evade' && f.outcome !== 'alreadyDead' && f.outcome !== 'unresolved');
const failures = fought.filter(f => f.outcome === 'vFlee' || f.outcome === 'vDie');
const attr = {};
for (const f of failures) attr[f.fleeClass] = (attr[f.fleeClass] || 0) + 1;
const successes = fought.filter(f => f.outcome === 'vKill' || f.outcome === 'mFlee');

const dmgFrac = fought.filter(f => f.beastMaxHp && f.beastMaxHp > 0)
  .map(f => (f.mDealt || 0) / f.beastMaxHp);
const fledDmgFrac = failures.filter(f => f.beastMaxHp && f.beastMaxHp > 0)
  .map(f => (f.mDealt || 0) / f.beastMaxHp);
const beastLeftFrac = failures.filter(f => f.beastMaxHp && f.beastMaxHp > 0)
  .map(f => (f.mHpLeft || 0) / f.beastMaxHp);

// Completeness: every captured fight must carry the prereg fields.
let complete = 0, incomplete = [];
for (const f of fights) {
  const ok = f.beastMaxHp !== null && f.rounds !== null && f.outcome && f.fleeClass &&
    f.mDealt !== null && f.partySize !== null && f.armorP !== null &&
    f.vHpStart !== null && f.vHpLeft !== null && f.mHpLeft !== null && Array.isArray(f.log);
  if (ok) complete++; else incomplete.push({ seed: f.seed, day: f.day, mid: f.mid, missing: [
    f.beastMaxHp === null ? 'beastMaxHp' : null, f.rounds === null ? 'rounds' : null,
    f.mDealt === null ? 'mDealt' : null, f.armorP === null ? 'armorP' : null,
    f.vHpStart === null ? 'vHpStart' : null, !Array.isArray(f.log) ? 'log' : null].filter(Boolean) });
}

// Replay check vs killconv: same seeds, same fights on day/vid/mid/outcome/rounds/mDealt.
let replayMismatches = [];
for (const r of runs) {
  const k = kcBySeed[r.seed];
  if (!k) continue;
  const mine = (r.fights || []).map(f => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mDealt].join('|')).sort();
  const theirs = (k.fieldFights || []).map(f => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mDealt].join('|')).sort();
  if (JSON.stringify(mine) !== JSON.stringify(theirs)) {
    replayMismatches.push({ seed: r.seed, mine: mine.length, theirs: theirs.length,
      onlyMine: mine.filter(x => theirs.indexOf(x) === -1), onlyTheirs: theirs.filter(x => mine.indexOf(x) === -1) });
  }
}

// Splits.
function splitRate(list, pred) {
  const a = list.filter(pred), b = list.filter(f => !pred(f));
  const rate = l => { const s = l.filter(f => f.outcome === 'vKill' || f.outcome === 'mFlee').length; return l.length ? (s + '/' + l.length) : '0/0'; };
  return { a: rate(a), b: rate(b), aN: a.length, bN: b.length };
}
const partySplit = splitRate(fought, f => f.fighterClass === 'party' || f.fighterClass === 'scholar-party');
const loneSplitDetail = {
  party: fought.filter(f => f.fighterClass === 'party' || f.fighterClass === 'scholar-party').length,
  lone: fought.filter(f => f.fighterClass === 'lone').length,
};
const armorSplit = splitRate(fought, f => f.armored === true);
const scholarSplit = splitRate(fought, f => f.fighterClass === 'scholar-party');

const wall = {
  seeds: runs.length,
  national: runs.filter(r => r.national).length,
  table: runs.filter(r => r.table).length,
  wins: runs.filter(r => r.won).length,
  wave4: runs.filter(r => r.wave4).length,
  wave5: runs.filter(r => r.wave5).length,
  medianDays: med(runs.map(r => r.gameDays)),
  maxDays: Math.max.apply(null, runs.map(r => r.gameDays)),
};
const errs = runs.reduce((n, r) => n + (r.instrumentErrors || []).length, 0);

const binding = (() => {
  let top = null, topN = 0, second = 0;
  for (const k of Object.keys(attr)) {
    if (attr[k] > topN) { second = topN; top = k; topN = attr[k]; }
    else if (attr[k] > second) second = attr[k];
  }
  return { top, topN, second, share: failures.length ? topN / failures.length : 0,
    binding: (failures.length && topN / failures.length > 0.5) ? top : 'NO-SINGLE-BINDING' };
})();

const sense = {};
for (const f of fights) {
  if (!sense[f.fleeClass]) sense[f.fleeClass] = { seed: f.seed, day: f.day, mid: f.mid, vid: f.vid, log: f.log };
}

const report = {
  wall, fightsTotal: fights.length, outcomes, fought: fought.length,
  failures: failures.length, successes: successes.length, attr, binding,
  medianDmgFrac: med(dmgFrac), meanDmgFrac: mean(dmgFrac),
  medianFledDmgFrac: med(fledDmgFrac), medianBeastLeftFrac: med(beastLeftFrac),
  medianRounds: med(fought.map(f => f.rounds)), meanRounds: mean(fought.map(f => f.rounds)),
  medianVTaken: med(fought.map(f => f.vTaken)), medianMinHpFrac: med(fought.map(f => f.minHpFrac)),
  everWinning: fought.filter(f => f.everWinning).length,
  everHopeless: fought.filter(f => f.everHopeless).length,
  partySplit, loneSplitDetail, armorSplit, scholarSplit,
  intent: fought.reduce((o, f) => { o[f.intentWhy || f.intent || 'null'] = (o[f.intentWhy || f.intent || 'null'] || 0) + 1; return o; }, {}),
  hpBasis: fights.reduce((o, f) => { o[f.hpBasis || 'null'] = (o[f.hpBasis || 'null'] || 0) + 1; return o; }, {}),
  completeness: { complete, total: fights.length, incomplete },
  replayMismatches, instrumentErrors: errs,
  perSeed: runs.map(r => ({ seed: r.seed, fights: (r.fights || []).length, maxWave: r.maxWave, nat: r.national, table: r.table, won: r.won, days: r.gameDays })),
  senseClasses: Object.keys(sense),
};
console.log(JSON.stringify(report, null, 1));
console.log('\n--- SENSE SAMPLES (first fight per class, log trimmed to 12 lines) ---');
for (const k of Object.keys(sense)) {
  const s = sense[k];
  console.log(`\n== ${k} s${s.seed} d${s.day} ${s.mid} fighter ${s.vid} ==`);
  console.log(((s.log || []).slice(0, 12)).join('\n'));
}
