#!/usr/bin/env node
// diff-deathattr-before-after.js — prove no gameplay change from the
// player-kind death wiring. Compares the before/after wall-suite JSONs on
// identical seeds: every gameplay field must match byte-for-byte; the ONLY
// allowed delta is the new 'player:<cause>' telemetry keys (rekeyed from
// 'villager:<cause>').
// Usage: node scripts/diff-deathattr-before-after.js <before.json> <after.json>
'use strict';
const fs = require('fs');
const [beforePath, afterPath] = process.argv.slice(2);
if (!beforePath || !afterPath) { console.error('usage: diff-deathattr-before-after.js <before> <after>'); process.exit(2); }
const B = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
const A = JSON.parse(fs.readFileSync(afterPath, 'utf8'));

let fails = 0;
function check(name, cond, detail) {
  if (cond) console.log('  PASS ' + name);
  else { fails++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// Gameplay fields that must be byte-identical per run.
const GAMEPLAY_FIELDS = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'maxRank', 'national', 'table', 'vests', 'exiled', 'bearerDeaths'];
const bRuns = {}, aRuns = {};
for (const r of B.runs) bRuns[r.policy + '/' + r.seed] = r;
for (const r of A.runs) aRuns[r.policy + '/' + r.seed] = r;
check('same run set', JSON.stringify(Object.keys(bRuns).sort()) === JSON.stringify(Object.keys(aRuns).sort()));
for (const k of Object.keys(bRuns).sort()) {
  const b = bRuns[k], a = aRuns[k];
  if (!a) { check('run present after: ' + k, false); continue; }
  for (const f of GAMEPLAY_FIELDS) {
    if (JSON.stringify(b[f]) !== JSON.stringify(a[f])) {
      check(`gameplay field identical [${k}] ${f}`, false, `before=${JSON.stringify(b[f])} after=${JSON.stringify(a[f])}`);
    }
  }
  // Death totals must match; only the keying may differ.
  const tot = o => Object.values(o || {}).reduce((t, v) => t + v, 0);
  if (tot(b.deaths) !== tot(a.deaths)) check(`death totals identical [${k}]`, false, `${tot(b.deaths)} vs ${tot(a.deaths)}`);
  if (tot(b.peopleDeaths) !== tot(a.peopleDeaths)) check(`peopleDeath totals identical [${k}]`, false, `${tot(b.peopleDeaths)} vs ${tot(a.peopleDeaths)}`);
  // The allowed delta: player-kind keys exist after, and the villager-kind
  // keys they were rekeyed from drop by exactly the player count.
  const pKeys = Object.keys(a.peopleDeaths || {}).filter(x => x.startsWith('player:'));
  const pCount = pKeys.reduce((t, x) => t + a.peopleDeaths[x], 0);
  if (pCount !== (a.nPlayerDeaths || 0)) check(`player key count = nPlayerDeaths [${k}]`, false, `${pCount} vs ${a.nPlayerDeaths}`);
  for (const pk of pKeys) {
    const cause = pk.slice('player:'.length);
    const vk = 'villager:' + cause;
    const bV = (b.peopleDeaths || {})[vk] || 0;
    const aV = (a.peopleDeaths || {})[vk] || 0;
    const aP = (a.peopleDeaths || {})[pk] || 0;
    if (bV !== aV + aP) check(`rekey conservation [${k}] ${vk}`, false, `before=${bV} afterV=${aV} afterP=${aP}`);
  }
  // No other key may differ between before and after.
  for (const kk of new Set([...Object.keys(b.peopleDeaths || {}), ...Object.keys(a.peopleDeaths || {})])) {
    if (kk.startsWith('player:')) continue;
    const cause = kk.startsWith('villager:') ? kk.slice('villager:'.length) : null;
    const bV = (b.peopleDeaths || {})[kk] || 0;
    const aV = (a.peopleDeaths || {})[kk] || 0;
    const aP = cause ? ((a.peopleDeaths || {})['player:' + cause] || 0) : 0;
    if (bV !== aV + aP) check(`no unexplained key delta [${k}] ${kk}`, false, `before=${bV} after=${aV}+${aP}`);
  }
}
// Summary-level wall metrics must match.
for (const f of ['national', 'table', 'wins', 'waveReach', 'medianDays', 'maxDays', 'exiled', 'bearerDeaths']) {
  check('summary identical: ' + f, JSON.stringify(B.summary[f]) === JSON.stringify(A.summary[f]),
    `before=${JSON.stringify(B.summary[f])} after=${JSON.stringify(A.summary[f])}`);
}
console.log(fails ? `\n${fails} FAILURES` : '\nALL GAMEPLAY-IDENTICAL (only player-kind telemetry keys differ)');
process.exit(fails ? 1 : 0);
