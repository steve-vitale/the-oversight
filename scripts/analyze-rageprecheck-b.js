// analyze-rageprecheck-b.js — aggregate rageprecheck per-seed corpora.
// (arm sim-rageprecheck-b, run fleshout-loop-b-20261114T0330Z.)
// Usage: node scripts/analyze-rageprecheck-b.js <beforeDir> <afterDir>
//   e.g. node scripts/analyze-rageprecheck-b.js \
//     evidence/2026-11-14/perseed-rageprecheck-b-confirm-before \
//     evidence/2026-11-14/perseed-rageprecheck-b-confirm-after
// Reads rageprecheck-b-s<seed>-<policy>-<run>.json files. Prints the
// pre-registered confirm verdict (Stage 2 prereg): primary = successful
// wholly-unspent refresh presses summed over competent + capable, GO = 0
// pooled AND 0 on the fresh-only subset (seeds 98801-98810); partly-spent
// refreshes must also read 0; guardrails vs the before leg as control
// (starvation <= control+2, median survival >= 0.8x control median, per
// policy). Exit 0 on GO, 1 on NO-GO, 2 on incomplete corpora.
'use strict';
const fs = require('fs');
const path = require('path');

const beforeDir = process.argv[2];
const afterDir = process.argv[3];
if (!beforeDir || !afterDir) {
  console.error('usage: node scripts/analyze-rageprecheck-b.js <beforeDir> <afterDir>');
  process.exit(2);
}

const SEEDS = process.env.SEEDS
  ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite)
  : (function () { const xs = []; for (let s = 98801; s <= 98816; s++) xs.push(s); return xs; })();
const POLICIES = ['competent', 'capable'];
const FRESH = new Set();
for (let s = 98801; s <= 98810; s++) FRESH.add(s);

function loadLeg(dir, runSuffix) {
  const out = {}; // seed -> policy -> record
  const missing = [];
  for (const seed of SEEDS) {
    out[seed] = {};
    for (const pol of POLICIES) {
      const f = path.join(dir, 'rageprecheck-b-s' + seed + '-' + pol + '-' + runSuffix + '.json');
      if (!fs.existsSync(f)) { missing.push(seed + '/' + pol); continue; }
      try { out[seed][pol] = JSON.parse(fs.readFileSync(f, 'utf8')); }
      catch (e) { missing.push(seed + '/' + pol + ' (unparsable: ' + e.message + ')'); }
    }
  }
  return { data: out, missing: missing };
}

// run suffix is embedded in the filename: ...-<run>.json. Derive it from
// any file present in the dir.
function runSuffixOf(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); });
  if (!files.length) return null;
  const m = files[0].match(/^rageprecheck-b-s\d+-[a-z]+-(.+)\.json$/);
  return m ? m[1] : null;
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function sumLeg(leg, seeds) {
  const agg = {
    n: 0, unspent: 0, partly: 0, presses: 0, fresh: 0, refused: 0,
    kcal: 0, strikes: 0, wave4: 0, wave5: 0, wins: 0,
    starvation: 0, villagerDeaths: 0, scholarDeaths: 0,
    maxPerFight: 0, days: [],
    byPolicy: {}, byCaller: {},
  };
  for (const pol of POLICIES) {
    agg.byPolicy[pol] = {
      n: 0, unspent: 0, partly: 0, presses: 0, fresh: 0, refused: 0,
      kcal: 0, strikes: 0, wave4: 0, wave5: 0, wins: 0,
      starvation: 0, villagerDeaths: 0, scholarDeaths: 0, days: [],
    };
  }
  for (const seed of seeds) {
    for (const pol of POLICIES) {
      const d = leg.data[seed] && leg.data[seed][pol];
      if (!d) continue;
      const p = agg.byPolicy[pol];
      agg.n++; p.n++;
      agg.unspent += d.ragePressRefreshUnspent || 0; p.unspent += d.ragePressRefreshUnspent || 0;
      agg.partly += d.ragePressRefreshPartly || 0; p.partly += d.ragePressRefreshPartly || 0;
      agg.presses += d.ragePressCount || 0; p.presses += d.ragePressCount || 0;
      agg.fresh += d.ragePressFresh || 0; p.fresh += d.ragePressFresh || 0;
      agg.refused += d.ragePressRefused || 0; p.refused += d.ragePressRefused || 0;
      agg.kcal += d.rageKcal || 0; p.kcal += d.rageKcal || 0;
      agg.strikes += d.strikesLanded || 0; p.strikes += d.strikesLanded || 0;
      const wk = d.waveKills || {};
      agg.wave4 += wk['4'] || 0; p.wave4 += wk['4'] || 0;
      agg.wave5 += wk['5'] || 0; p.wave5 += wk['5'] || 0;
      if (d.won) { agg.wins++; p.wins++; }
      agg.maxPerFight = Math.max(agg.maxPerFight, d.rageMaxPerFight || 0);
      agg.days.push(d.days); p.days.push(d.days);
      for (const x of (d.deaths || [])) {
        if (x.cause === 'starvation') { agg.starvation++; p.starvation++; }
        if (x.player) { agg.scholarDeaths++; p.scholarDeaths++; }
        else { agg.villagerDeaths++; p.villagerDeaths++; }
      }
      const callers = d.rageByCaller || {};
      for (const name of Object.keys(callers)) {
        const c = callers[name];
        if (!agg.byCaller[name]) agg.byCaller[name] = { presses: 0, fresh: 0, unspent: 0, partly: 0, refused: 0 };
        agg.byCaller[name].presses += c.presses || 0;
        agg.byCaller[name].fresh += c.fresh || 0;
        agg.byCaller[name].unspent += c.refreshUnspent || 0;
        agg.byCaller[name].partly += c.refreshPartly || 0;
        agg.byCaller[name].refused += c.refused || 0;
      }
    }
  }
  agg.medianDays = median(agg.days);
  for (const pol of POLICIES) agg.byPolicy[pol].medianDays = median(agg.byPolicy[pol].days);
  return agg;
}

const beforeRun = runSuffixOf(beforeDir);
const afterRun = runSuffixOf(afterDir);
if (!beforeRun || !afterRun) { console.error('no per-seed JSON found in one of the dirs'); process.exit(2); }
const before = loadLeg(beforeDir, beforeRun);
const after = loadLeg(afterDir, afterRun);
if (before.missing.length || after.missing.length) {
  console.log('INCOMPLETE corpora.');
  if (before.missing.length) console.log('  before missing: ' + before.missing.join(', '));
  if (after.missing.length) console.log('  after missing: ' + after.missing.join(', '));
  process.exit(2);
}

const b = sumLeg(before, SEEDS);
const a = sumLeg(after, SEEDS);
const bFresh = sumLeg(before, SEEDS.filter(function (s) { return FRESH.has(s); }));
const aFresh = sumLeg(after, SEEDS.filter(function (s) { return FRESH.has(s); }));

function line(label, bb, aa) {
  console.log('  ' + label + ': ' + bb + ' -> ' + aa);
}
console.log('sim-rageprecheck-b Stage 2 confirm — 16 seeds 98801-98816, competent + capable, 150d');
console.log('PRIMARY (successful wholly-unspent refresh presses, GO = 0):');
line('pooled', b.unspent, a.unspent);
line('fresh-only 98801-98810', bFresh.unspent, aFresh.unspent);
console.log('SECONDARIES (must also read 0):');
line('partly-spent refreshes (pooled)', b.partly, a.partly);
line('partly-spent refreshes (fresh-only)', bFresh.partly, aFresh.partly);
console.log('Per-presser refresh-unspent (before -> after):');
for (const name of Object.keys(b.byCaller).sort()) {
  console.log('  ' + name + ': ' + (b.byCaller[name] ? b.byCaller[name].unspent : 0) + ' -> ' + (a.byCaller[name] ? a.byCaller[name].unspent : 0));
}
console.log('Context:');
line('presses (fresh/total)', b.fresh + '/' + b.presses, a.fresh + '/' + a.presses);
line('refused presses', b.refused, a.refused);
line('rage kcal', b.kcal, a.kcal);
line('strikes landed', b.strikes, a.strikes);
line('wave-4 kills', b.wave4, a.wave4);
line('wave-5 kills', b.wave5, a.wave5);
line('wins', b.wins + '/' + b.n, a.wins + '/' + a.n);
line('max presses in one fight', b.maxPerFight, a.maxPerFight);
console.log('Guardrails (control = before leg):');
let guardOk = true;
for (const pol of POLICIES) {
  const bp = b.byPolicy[pol], ap = a.byPolicy[pol];
  const starvOk = ap.starvation <= bp.starvation + 2;
  const survOk = ap.medianDays >= 0.8 * bp.medianDays;
  console.log('  ' + pol + ': starvation ' + bp.starvation + ' -> ' + ap.starvation + ' (bar <= ' + (bp.starvation + 2) + ') ' + (starvOk ? 'HELD' : 'BREACHED')
    + '; median survival ' + bp.medianDays + 'd -> ' + ap.medianDays + 'd (bar >= ' + (0.8 * bp.medianDays).toFixed(1) + 'd) ' + (survOk ? 'HELD' : 'BREACHED'));
  if (!starvOk || !survOk) guardOk = false;
}
console.log('Villager (non-scholar) deaths: ' + b.villagerDeaths + ' -> ' + a.villagerDeaths + '; scholar deaths: ' + b.scholarDeaths + ' -> ' + a.scholarDeaths);

const go = a.unspent === 0 && aFresh.unspent === 0 && a.partly === 0 && aFresh.partly === 0 && guardOk;
console.log('VERDICT: ' + (go ? 'GO' : 'NO-GO')
  + (a.unspent !== 0 ? ' (pooled primary ' + a.unspent + ' != 0)' : '')
  + (aFresh.unspent !== 0 ? ' (fresh-only primary ' + aFresh.unspent + ' != 0)' : '')
  + (a.partly !== 0 ? ' (partly-spent ' + a.partly + ' != 0)' : '')
  + (!guardOk ? ' (guardrail breached)' : ''));
process.exit(go ? 0 : 1);
