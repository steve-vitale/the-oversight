#!/usr/bin/env node
// analyze-abandonspeak-b.js — abandonment narration judge
// (sim-abandonspeak-b). Reads TWO JSONL legs produced by
// scripts/vetobudget-confirm-b-driver.js (DAYS=60):
//   baseline: guard+budget WITHOUT narration (1505Z reused leg)
//   narration: guard+budget WITH the abandonment line (this arm)
// Usage: node scripts/analyze-abandonspeak-b.js <baseline.jsonl> <narration.jsonl>
// Prints per-seed primary metric, no-harm bars, sayLines-diff
// confinement, and snapshot identity. Exit 0 on a successful parse
// (verdict is in the text, never the exit code); exit 2 on bad input.
//
// Definitions (same both legs, so ratios are internally consistent):
// - abandonment events: sum of days[].abandonments; spoken iff
//   sayLines contains ABANDON_LINE with scholar day == abandonment
//   loopDay, and total ABANDON_LINE count == total abandonments.
// - sayLines-diff confinement: the narration sayLines line sequence
//   must equal the baseline sequence with ONLY ABANDON_LINE
//   insertions (checked by walking both sequences in order).
// - mean daily haul: successful forages' added units * kcalEach,
//   summed over the run, divided by loop days.
// - away day-ends: day-end snapshot position != haven tile.
// - forageTrips: forage attempts (forages[].length summed).
// - identity: per-loopDay snapshots (pos, scholar kcal, pantry kcal,
//   roster count + id set); a day-record diverges if any field differs.
'use strict';
const fs = require('fs');
const { ABANDON_LINE } = require('./policies/competent-vetobudget-b');

function readJsonl(file) {
  const text = fs.readFileSync(file, 'utf8');
  const recs = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  if (!recs.length) throw new Error('no records in ' + file);
  return recs;
}

function analyzeSeed(rec) {
  const days = rec.days || [];
  const haven = (days[0] && days[0].start && days[0].start.haven) || { x: 4, y: 4 };
  let abandonments = 0, suppressions = 0, away = 0, attempts = 0, haulKcal = 0;
  const abandonDays = [];
  for (const d of days) {
    abandonments += d.abandonments || 0;
    suppressions += d.suppressions || 0;
    if (d.abandonments) abandonDays.push(d.loopDay);
    const e = d.end;
    if (e && e.pos && (e.pos.x !== haven.x || e.pos.y !== haven.y)) away++;
    attempts += (d.forages || []).length;
    for (const f of (d.forages || []).filter((x) => x.ok)) {
      for (const a of (f.added || [])) haulKcal += (a.units || 0) * (a.kcalEach || 0);
    }
  }
  const lines = (rec.sayLines || []).map((s) => s.line);
  const abandonLines = (rec.sayLines || []).filter((s) => s.line === ABANDON_LINE);
  const spokenDays = abandonLines.map((s) => s.day);
  const spokenEvents = abandonDays.filter((ld) => spokenDays.includes(ld)).length;
  return {
    seed: rec.seed, policy: rec.policy, daysAlive: rec.daysAlive,
    endReason: rec.endReason, maxWaveUnlocked: rec.maxWaveUnlocked,
    abandonments, suppressions, away, attempts,
    meanDailyHaul: days.length ? +(haulKcal / days.length).toFixed(1) : null,
    deaths: (rec.deaths || []).length,
    sayCount: lines.length, abandonLineCount: abandonLines.length,
    abandonDays, spokenDays, spokenEvents, lines, days,
  };
}

function diffConfinement(baseLines, narrLines) {
  // Walk both sequences; narration must be baseline + ABANDON_LINE only.
  let i = 0, insertions = 0, mismatch = null;
  for (const line of narrLines) {
    if (line === ABANDON_LINE && (i >= baseLines.length || baseLines[i] !== ABANDON_LINE)) { insertions++; continue; }
    if (baseLines[i] === line) { i++; continue; }
    mismatch = { atBaseline: i, expected: baseLines[i] || null, got: line };
    break;
  }
  if (!mismatch && i !== baseLines.length) mismatch = { atBaseline: i, expected: baseLines[i] || null, got: '(end of narration)' };
  return { confined: !mismatch, insertions, mismatch, leftoverBaseline: baseLines.length - i };
}

function snapSig(d) {
  const s = d.end || {};
  const r = s.roster || {};
  return JSON.stringify({ pos: s.pos, kcal: s.kcal, pantry: s.pantryKcal,
    rosterCount: r.count, rosterIds: r.ids });
}

function main() {
  const [baseFile, narrFile] = process.argv.slice(2);
  if (!baseFile || !narrFile) { console.error('usage: analyze-abandonspeak-b.js <baseline.jsonl> <narration.jsonl>'); process.exit(2); }
  const base = readJsonl(baseFile), narr = readJsonl(narrFile);
  const baseBySeed = new Map(base.map((r) => [r.seed, analyzeSeed(r)]));
  const narrBySeed = new Map(narr.map((r) => [r.seed, analyzeSeed(r)]));
  const seeds = [...narrBySeed.keys()].sort((a, b) => a - b);
  let totAband = 0, totSpoken = 0, totLines = 0;
  console.log('seed | aband | spokenEvents | abandonLines | sayCount base->narr | diffConfined | deaths base->narr | haul base->narr | away base->narr | attempts base->narr | identityDiv');
  const band = { base: [], narr: [] };
  for (const seed of seeds) {
    const b = baseBySeed.get(seed), n = narrBySeed.get(seed);
    if (!b) { console.log(seed + ' | NO BASELINE RECORD'); continue; }
    totAband += n.abandonments; totSpoken += n.spokenEvents; totLines += n.abandonLineCount;
    const dc = diffConfinement(b.lines, n.lines);
    let div = 0;
    const maxDays = Math.max(b.days.length, n.days.length);
    for (let i = 0; i < maxDays; i++) {
      const bd = b.days[i], nd = n.days[i];
      if (!bd || !nd || snapSig(bd) !== snapSig(nd)) div++;
    }
    band.base.push(b); band.narr.push(n);
    console.log(seed + ' | ' + n.abandonments + ' | ' + n.spokenEvents + ' | ' + n.abandonLineCount +
      ' | ' + b.sayCount + '->' + n.sayCount + ' | ' + (dc.confined ? 'YES (+' + dc.insertions + ')' : 'NO ' + JSON.stringify(dc.mismatch)) +
      ' | ' + b.deaths + '->' + n.deaths + ' | ' + b.meanDailyHaul + '->' + n.meanDailyHaul +
      ' | ' + b.away + '->' + n.away + ' | ' + b.attempts + '->' + n.attempts + ' | ' + div);
  }
  const med = (arr) => { const s = [...arr].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
  const sum = (arr, f) => arr.reduce((t, s) => t + f(s), 0);
  const bMed = med(band.base.map((s) => s.daysAlive)), nMed = med(band.narr.map((s) => s.daysAlive));
  const bDeaths = sum(band.base, (s) => s.deaths), nDeaths = sum(band.narr, (s) => s.deaths);
  const bHaul = sum(band.base, (s) => s.meanDailyHaul), nHaul = sum(band.narr, (s) => s.meanDailyHaul);
  const bAway = sum(band.base, (s) => s.away), nAway = sum(band.narr, (s) => s.away);
  const bAtt = sum(band.base, (s) => s.attempts), nAtt = sum(band.narr, (s) => s.attempts);
  const ratio = (n, b) => (b === 0 ? (n === 0 ? '1.00 (0/0)' : 'INF') : (n / b).toFixed(3) + 'x');
  const inBand = (n, b) => b === 0 ? n === 0 : (n / b >= 0.95 && n / b <= 1.05);
  console.log('BAND seeds=' + seeds.length + ' abandonments=' + totAband + ' spokenEvents=' + totSpoken +
    ' abandonLines=' + totLines + ' PRIMARY=' + (totAband ? (totSpoken + '/' + totAband + ' = ' + (totSpoken / totAband * 100).toFixed(0) + '%') : 'NO-ABANDONMENTS'));
  console.log('NOHARM medianSurvival ' + bMed + '->' + nMed + ' ratio ' + ratio(nMed, bMed) + ' pass=' + inBand(nMed, bMed));
  console.log('NOHARM deaths ' + bDeaths + '->' + nDeaths + ' ratio ' + ratio(nDeaths, bDeaths) + ' pass=' + inBand(nDeaths, bDeaths));
  console.log('NOHARM meanDailyHaul(sum) ' + bHaul.toFixed(1) + '->' + nHaul.toFixed(1) + ' ratio ' + ratio(nHaul, bHaul) + ' pass=' + inBand(nHaul, bHaul));
  console.log('NOHARM away ' + bAway + '->' + nAway + ' ratio ' + ratio(nAway, bAway) + ' pass=' + (inBand(nAway, bAway) && nAway <= bAway + 2));
  console.log('NOHARM forageTrips ' + bAtt + '->' + nAtt + ' ratio ' + ratio(nAtt, bAtt) + ' pass=' + inBand(nAtt, bAtt));
  const allConfined = seeds.every((seed) => baseBySeed.has(seed) && diffConfinement(baseBySeed.get(seed).lines, narrBySeed.get(seed).lines).confined);
  const primaryPass = totAband > 0 && totSpoken === totAband && totLines === totAband;
  console.log('VERDICT primary100=' + primaryPass + ' diffConfinedAll=' + allConfined +
    ' noharmAll=' + (inBand(nMed, bMed) && inBand(nDeaths, bDeaths) && inBand(nHaul, bHaul) && inBand(nAway, bAway) && nAway <= bAway + 2 && inBand(nAtt, bAtt)));
  console.log('WALL narration: national/table/wins 0 (driver is pre-seat 60d; wave/maxWave per seed above in analysis rows)');
  for (const seed of seeds) {
    const n = narrBySeed.get(seed);
    console.log('WALL seed ' + seed + ' maxWave=' + n.maxWaveUnlocked + ' end=' + n.endReason + ' daysAlive=' + n.daysAlive);
  }
}

if (require.main === module) main();
module.exports = { analyzeSeed, diffConfinement, ABANDON_LINE };
