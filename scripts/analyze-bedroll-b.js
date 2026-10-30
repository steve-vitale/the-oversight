#!/usr/bin/env node
// analyze-bedroll-b.js — bedroll-line census over bedroll-trace corpora.
// Usage:
//   node scripts/analyze-bedroll-b.js --dir <corpus-dir> --seeds 10710,...,10725 [--out <json>]
//   node scripts/analyze-bedroll-b.js --before <dir> --after <dir> --seeds ... [--out <json>]
//     (second form adds the neutrality deep-equal with ONLY the two
//      player-line variants normalized to one placeholder).
// A (seed, night) group = nightSay entries sharing callIdx (the night
// after evening N has callIdx N; its morning is loopDay N+1). Player
// lines: /coming for YOU.*bedroll/ (bedroll line) and
// /coming for YOU.*eyes on you/ (awake line). Never-slept = player
// line sleeping flag false AND the night carries the sleep-refusal
// marker with no settle marker. Slept = sleeping flag true.
'use strict';
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1] === undefined || argv[i + 1].startsWith('--') ? true : argv[++i];
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));
const seeds = (args.seeds || '10710,10711,10712,10713,10714,10715,10716,10717,10718,10719,10720,10721,10722,10723,10724,10725')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);

const BEDROLL_RE = /coming for YOU.*eyes on your bedroll/;
const AWAKE_RE = /coming for YOU.*eyes on you\./;
const SETTLE_RE = /Sleep takes you/;
const REFUSAL_RE = /too late for real sleep/;

function analyzeDir(dir) {
  const perSeed = {};
  const nights = []; // every (seed, callIdx) group with a player line
  const disagreements = [];
  let lieCount = 0;
  let sleptBedroll = 0, neverSleptBedroll = 0, awakeLines = 0, playerLineNights = 0;
  for (const seed of seeds) {
    const f = path.join(dir, `bedroll-b-insideevening-s${seed}.json`);
    if (!fs.existsSync(f)) { perSeed[seed] = { missing: true }; continue; }
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    const groups = new Map();
    for (const e of (j.nightSay || [])) {
      const k = String(e.callIdx);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(e);
    }
    const seedNights = [];
    for (const [callIdx, entries] of groups) {
      const playerLines = entries.filter((e) => BEDROLL_RE.test(e.line) || AWAKE_RE.test(e.line));
      if (!playerLines.length) continue;
      const settle = entries.some((e) => SETTLE_RE.test(e.line));
      const refusal = entries.some((e) => REFUSAL_RE.test(e.line));
      for (const pl of playerLines) {
        playerLineNights++;
        const isBedroll = BEDROLL_RE.test(pl.line);
        const isAwake = AWAKE_RE.test(pl.line);
        const neverSlept = pl.sleeping === false && refusal && !settle;
        const slept = pl.sleeping === true;
        // Signal agreement: sleeping flag must agree with transcript markers.
        if (slept && !settle) disagreements.push({ seed, callIdx, kind: 'slept-but-no-settle', line: pl.line.slice(0, 120) });
        if (pl.sleeping === false && settle && !refusal) disagreements.push({ seed, callIdx, kind: 'awake-but-settle-no-refusal', line: pl.line.slice(0, 120) });
        if (isBedroll && neverSlept) { lieCount++; neverSleptBedroll++; }
        if (isBedroll && slept) sleptBedroll++;
        if (isAwake) awakeLines++;
        seedNights.push({ seed, callIdx: Number(callIdx), morningLoopDay: Number(callIdx) + 1, kind: isBedroll ? 'bedroll' : 'awake', sleeping: pl.sleeping, settle, refusal, neverSlept, slept, line: pl.line, transcript: entries.map((e) => e.line) });
      }
    }
    perSeed[seed] = { daysAlive: j.daysAlive, endReason: j.endReason, checkpoints: (j.checkpoints || []).length, moves: (j.moves || []).length, origins: (j.fightOrigins || []).length, nightSay: (j.nightSay || []).length, playerLineNights: seedNights.length };
    nights.push(...seedNights);
  }
  return { perSeed, nights, disagreements, lieCount, sleptBedroll, neverSleptBedroll, awakeLines, playerLineNights };
}

function normalize(v) {
  if (typeof v === 'string') {
    return v.replace(/One of them is coming for YOU — .*?, inside the haven, eyes on your bedroll\./g, 'PLAYERLINE')
      .replace(/One of them is coming for YOU — .*?, inside the haven, eyes on you\./g, 'PLAYERLINE');
  }
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = normalize(v[k]);
    return o;
  }
  return v;
}
function firstDiff(a, b, trail) {
  if (typeof a !== typeof b) return trail + ` (type ${typeof a} vs ${typeof b})`;
  if (a === null || b === null || typeof a !== 'object') return a === b ? null : trail + ` (${JSON.stringify(a)} vs ${JSON.stringify(b)})`;
  if (Array.isArray(a) !== Array.isArray(b)) return trail + ' (array vs object)';
  if (Array.isArray(a)) {
    if (a.length !== b.length) return trail + ` (length ${a.length} vs ${b.length})`;
    for (let i = 0; i < a.length; i++) { const d = firstDiff(a[i], b[i], trail + `[${i}]`); if (d) return d; }
    return null;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (!(k in a) || !(k in b)) return trail + '.' + k + ' (missing on one side)';
    const d = firstDiff(a[k], b[k], trail + '.' + k);
    if (d) return d;
  }
  return null;
}
// Collect EVERY diff (bounded) so a first-diff report cannot hide a
// second divergence class behind it. Stack-frame normalization
// strips ONLY :LINE:COL from strings shaped like a caller frame
// ("at Game.progDaily (src/js/havenGrowth.js:907:18)"); the fix
// adds lines to havenGrowth.js, so every recorded frame below the
// insertion shifts — a tracer artifact, not a behavior change.
// The proof test asserts the unnormalized diff set contains ONLY
// such frame shifts, and the frame-normalized corpora are equal.
function normalizeStacks(v) {
  if (typeof v === 'string') return v.replace(/(at .*\(src\/js\/[^:]+):\d+:\d+(\))/g, '$1:N:N$2');
  if (Array.isArray(v)) return v.map(normalizeStacks);
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = normalizeStacks(v[k]);
    return o;
  }
  return v;
}
function collectDiffs(a, b, trail, acc) {
  if (acc.length >= 200) return;
  if (typeof a !== typeof b) { acc.push(trail + ` (type ${typeof a} vs ${typeof b})`); return; }
  if (a === null || b === null || typeof a !== 'object') { if (a !== b) acc.push(trail + ` (${JSON.stringify(a)} vs ${JSON.stringify(b)})`); return; }
  if (Array.isArray(a) !== Array.isArray(b)) { acc.push(trail + ' (array vs object)'); return; }
  if (Array.isArray(a)) {
    if (a.length !== b.length) { acc.push(trail + ` (length ${a.length} vs ${b.length})`); return; }
    for (let i = 0; i < a.length; i++) collectDiffs(a[i], b[i], trail + `[${i}]`, acc);
    return;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (!(k in a) || !(k in b)) { acc.push(trail + '.' + k + ' (missing on one side)'); continue; }
    collectDiffs(a[k], b[k], trail + '.' + k, acc);
  }
}
function isStackShiftDiff(d) {
  // "path (\"at ...:NNN:CC\" vs \"at ...:MMM:DD\")" with identical text modulo numbers.
  const m = d.match(/^\S+ \("(.*)" vs "(.*)"\)$/);
  if (!m) return false;
  const strip = (s) => s.replace(/:\d+:\d+/g, ':N:N');
  return strip(m[1]) === strip(m[2]) && /^at .*\(src\/js\//.test(m[1]);
}

const result = {};
if (args.dir) result.single = analyzeDir(args.dir);
let neutrality = null;
if (args.before && args.after) {
  const before = analyzeDir(args.before);
  const after = analyzeDir(args.after);
  result.before = before; result.after = after;
  neutrality = { perSeed: {}, allEqual: true, stackNormalizedEqual: true, nonStackDiffs: [] };
  for (const seed of seeds) {
    const bf = path.join(args.before, `bedroll-b-insideevening-s${seed}.json`);
    const af = path.join(args.after, `bedroll-b-insideevening-s${seed}.json`);
    if (!fs.existsSync(bf) || !fs.existsSync(af)) { neutrality.perSeed[seed] = { equal: false, reason: 'missing file' }; neutrality.allEqual = false; neutrality.stackNormalizedEqual = false; continue; }
    const nb = normalize(JSON.parse(fs.readFileSync(bf, 'utf8')));
    const na = normalize(JSON.parse(fs.readFileSync(af, 'utf8')));
    const diffs = [];
    collectDiffs(nb, na, '$', diffs);
    const nonStack = diffs.filter((d) => !isStackShiftDiff(d));
    const sb = normalizeStacks(nb), sa = normalizeStacks(na);
    const stackDiff = firstDiff(sb, sa, '$');
    neutrality.perSeed[seed] = { equal: diffs.length === 0, diffCount: diffs.length, diffs: diffs.slice(0, 5), nonStackDiffCount: nonStack.length, stackNormalizedEqual: stackDiff === null };
    if (diffs.length) neutrality.allEqual = false;
    if (stackDiff !== null) neutrality.stackNormalizedEqual = false;
    if (nonStack.length) neutrality.nonStackDiffs.push({ seed, diffs: nonStack.slice(0, 5) });
  }
  result.neutrality = neutrality;
}
if (args.out) fs.writeFileSync(args.out, JSON.stringify(result, null, 2) + '\n');
const show = result.single || result.before;
if (show) console.log(`seeds=${seeds.length} playerLineNights=${show.playerLineNights} bedrollLie=${show.lieCount} sleptBedroll=${show.sleptBedroll} neverSleptBedroll=${show.neverSleptBedroll} awakeLines=${show.awakeLines} signalDisagreements=${show.disagreements.length}`);
if (result.after) console.log(`AFTER playerLineNights=${result.after.playerLineNights} bedrollLie=${result.after.lieCount} sleptBedroll=${result.after.sleptBedroll} neverSleptBedroll=${result.after.neverSleptBedroll} awakeLines=${result.after.awakeLines} signalDisagreements=${result.after.disagreements.length}`);
if (neutrality) console.log(`NEUTRALITY allEqual=${neutrality.allEqual} stackNormalizedEqual=${neutrality.stackNormalizedEqual} nonStackDiffSeeds=${neutrality.nonStackDiffs.length} ` + seeds.map((s) => `${s}:${neutrality.perSeed[s].equal ? 'EQ' : 'DIFF' + neutrality.perSeed[s].diffCount}`).join(' '));
if (neutrality && neutrality.nonStackDiffs.length) for (const x of neutrality.nonStackDiffs) console.log(`  NON-STACK DIFF seed ${x.seed}: ${x.diffs.join(' | ')}`);
