#!/usr/bin/env node
// spikecontact-analyze-20261031.js — sim-spikecontact-a analyzer.
//
// Spike-vs-last-two separation (prereg
// evidence/2026-10-31/sim-spikecontact-a-prereg.md). Reads splitter
// output: <corpusDir>/leadfeast/s<seed>.json. Loads no game code,
// runs no sims, changes nothing.
//
// Proven blow: lead-strike damage after multipliers, >0 only.
// Log parse: a lead strike is a line `R<n>: <name> strikes for <vd>`
// that is the FIRST "strikes for" line of its round (the lead strikes
// before any ally in a round; ally "strikes again" lines never match,
// a later same-round ally "strikes for" line is excluded by the
// first-per-round rule). Volley ("loosed"), ambush ("Opening strike"),
// collision, and monster lines never match. A 0-damage strike line is
// dropped (not proven).
//
// Universes (never pooled):
// - U-COMMITTED: committedFinish === true, wave >= 3. Moment = FIRST
//   commit line in the log. Engine truth: twoblowCommitMhp,
//   twoblowCommitSum. Classified only if parsed strikes before the
//   first commit line reproduce twoblowCommitSum exactly.
// - U-FLIGHT: wave-3, outcome mFlee, rounds >= 1, log contains the
//   break-check marker "breaks — wounded past its line". Moment =
//   flight, remainingHp = mHpLeft. Classified only if parsed
//   last-two sum reproduces rec.twoblowLastTwo sum at fight end.
// Anything else is UNCLASSIFIED with a named reason, never forced.
//
// Usage: node scripts/spikecontact-analyze-20261031.js <corpusDir> <seed...> [--out <file>]
// Prints a band summary to stdout; with --out writes the full JSON.
'use strict';
const fs = require('fs');
const path = require('path');

const BREAK_MARKER = 'breaks — wounded past its line';
const COMMIT_MARKER = '(Committed finish, two-blow)';

// Outcome lines that prove a captured log covers the fight's end.
const OUTCOME_RE = /(breaks — wounded past its line|turns and runs|The lead falls|flees|runs while running still works|stands down|backs off, disengaging|already dead|gave it room|drove .* off with the bow)/;
function logTruncated(lines) {
  const hasOutcome = lines.some(l => OUTCOME_RE.test(l));
  const lastIsRound = lines.length > 0 && /^R\d+:/.test(lines[lines.length - 1]);
  return lastIsRound && !hasOutcome;
}

// Parse lead strikes from a fight log. Returns { strikes: [{round, dmg}],
// truncated: bool, damageSum: number|null }. truncated is computed on
// the log AS PASSED (callers passing a pre-commit slice must compute
// truncation on the full log instead — see parseStrikesBeforeCommit).
// damageSum = sum of ALL parsed damage-to-lead components (lead
// strikes + ally strikes + volley hits + ambush opener), for the
// reconciliation validation used where engine twoblow fields are
// absent (baseline legs, pre-rule code).
function parseLeadStrikes(log) {
  const lines = Array.isArray(log) ? log.map(String) : [];
  const byRound = new Map(); // round -> first strikes-for dmg
  const order = [];
  let damageSum = 0;
  for (const line of lines) {
    let m = /^R(\d+): (.+?) strikes for (\d+)/.exec(line);
    if (m) {
      const round = parseInt(m[1], 10);
      const dmg = parseInt(m[3], 10);
      damageSum += dmg;
      if (dmg <= 0) continue; // not a proven blow
      if (byRound.has(round)) continue; // ally's same-round strike
      byRound.set(round, dmg);
      order.push({ round, dmg });
      continue;
    }
    // Ally extra strikes ("strikes again, louder — N", "strikes again for N").
    m = /^R\d+: .+? strikes again(?:, louder)? — (\d+)/.exec(line) || /^R\d+: .+? strikes again for (\d+)/.exec(line);
    if (m) { damageSum += parseInt(m[1], 10); continue; }
    // Volley hits and the ambush opener.
    m = /loosed — it takes .* for (\d+)/.exec(line) || /Opening strike for (\d+)/.exec(line);
    if (m) { damageSum += parseInt(m[1], 10); continue; }
  }
  return { strikes: order, truncated: logTruncated(lines), damageSum, lines: lines.length };
}

// Strikes strictly before the first commit line (or null if no commit
// line). Truncation is judged on the FULL log, never on the slice:
// the slice ends at the commit line, which is not an outcome line.
function parseStrikesBeforeCommit(log) {
  const lines = Array.isArray(log) ? log.map(String) : [];
  const idx = lines.findIndex(l => l.indexOf(COMMIT_MARKER) >= 0);
  if (idx < 0) return null;
  const sliced = parseLeadStrikes(lines.slice(0, idx));
  sliced.truncated = logTruncated(lines);
  return sliced;
}

function sumLastTwo(strikes) {
  if (!strikes || strikes.length < 2) return null;
  return strikes[strikes.length - 1].dmg + strikes[strikes.length - 2].dmg;
}
function maxStrike(strikes) {
  if (!strikes || !strikes.length) return null;
  return Math.max.apply(null, strikes.map(s => s.dmg));
}

function classify(spikePass, lastTwoPass) {
  if (spikePass && lastTwoPass) return 'both';
  if (spikePass && !lastTwoPass) return 'spike-only';
  if (!spikePass && lastTwoPass) return 'last-two-only';
  return 'neither';
}

function analyzeCommitted(f) {
  const base = { day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
    rounds: f.rounds, committedRounds: f.committedRounds | 0,
    commitMhp: f.twoblowCommitMhp != null ? f.twoblowCommitMhp : null,
    commitSum: f.twoblowCommitSum != null ? f.twoblowCommitSum : null,
    commitVhpFrac: f.twoblowCommitVhpFrac != null ? f.twoblowCommitVhpFrac : null,
    intent: f.intent || null, caller: f.caller || null };
  if (!Array.isArray(f.log) || !f.log.length) {
    return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'log-missing (old recorder: wave>3 or non-wave-3 row)' });
  }
  const parsed = parseStrikesBeforeCommit(f.log);
  if (!parsed) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'no-commit-line-in-log' });
  if (parsed.truncated) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'log-truncated' });
  const strikes = parsed.strikes;
  if (!strikes.length) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'no-parsed-strikes-before-commit' });
  const parsedSum = sumLastTwo(strikes);
  if (parsedSum == null) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'fewer-than-2-parsed-strikes-before-commit' });
  if (f.twoblowCommitSum == null) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'engine-commitSum-missing' });
  if (parsedSum !== f.twoblowCommitSum) {
    return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'parse-vs-engine-mismatch', parsedSum, parsedStrikes: strikes.map(s => s.dmg) });
  }
  const mx = maxStrike(strikes);
  const spikePass = mx >= f.twoblowCommitMhp;
  const lastTwoPass = f.twoblowCommitSum >= f.twoblowCommitMhp; // true by construction
  return Object.assign(base, { cls: classify(spikePass, lastTwoPass), spikePass, lastTwoPass,
    maxStrike: mx, lastTwoSum: f.twoblowCommitSum, strikesBeforeCommit: strikes.map(s => s.dmg) });
}

function analyzeFlight(f) {
  const base = { day: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
    rounds: f.rounds, mHpLeft: f.mHpLeft != null ? f.mHpLeft : null,
    mMaxHp: f.mMaxHp != null ? f.mMaxHp : null, intent: f.intent || null,
    caller: f.caller || null, minHpFrac: f.minHpFrac != null ? f.minHpFrac : null,
    twoblowLastTwo: f.twoblowLastTwo ? f.twoblowLastTwo.slice() : null };
  if (!Array.isArray(f.log) || !f.log.length) {
    return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'log-missing' });
  }
  const parsed = parseLeadStrikes(f.log);
  if (parsed.truncated) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'log-truncated' });
  const strikes = parsed.strikes;
  if (!strikes.length) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'no-parsed-strikes' });
  if (strikes.length < 2) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'fewer-than-2-parsed-strikes', strikes: strikes.map(s => s.dmg) });
  const parsedSum = sumLastTwo(strikes);
  if (f.twoblowLastTwo && f.twoblowLastTwo.length === 2) {
    const engineSum = f.twoblowLastTwo[0] + f.twoblowLastTwo[1];
    if (parsedSum !== engineSum) {
      return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'parse-vs-engine-mismatch', parsedSum, engineSum, strikes: strikes.map(s => s.dmg) });
    }
  } else if (f.mDealt != null) {
    // Baseline legs (pre-rule code): no engine twoblow fields exist.
    // Validate by damage reconciliation instead: every parsed
    // damage component must sum to the recorded mDealt.
    if (parsed.damageSum !== f.mDealt) {
      return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'reconciliation-mismatch', parsedDamageSum: parsed.damageSum, mDealt: f.mDealt, strikes: strikes.map(s => s.dmg) });
    }
  } else {
    return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'engine-lastTwo-missing-and-no-mDealt', strikes: strikes.map(s => s.dmg) });
  }
  if (f.mHpLeft == null) return Object.assign(base, { cls: 'UNCLASSIFIED', reason: 'mHpLeft-missing', strikes: strikes.map(s => s.dmg) });
  const mx = maxStrike(strikes);
  const spikePass = mx >= f.mHpLeft;
  const lastTwoPass = parsedSum >= f.mHpLeft;
  const out = Object.assign(base, { cls: classify(spikePass, lastTwoPass), spikePass, lastTwoPass,
    maxStrike: mx, lastTwoSum: parsedSum, strikes: strikes.map(s => s.dmg) });
  // Blocking-gate hint for lever-leg flights that WOULD convert under L but fled.
  if (lastTwoPass) {
    if (f.intent !== 'engage') out.blockHint = 'gate4-intent-not-engage';
    else if (f.minHpFrac != null && f.minHpFrac < 0.60) out.blockHint = 'gate3-likely-minHpFrac-below-0.60';
    else out.blockHint = 'unattributed (struck-this-round, dance-round, or round structure)';
  }
  return out;
}

function analyzeSeed(obj) {
  const rows = obj.fieldFights || [];
  const committed = rows.filter(f => f.committedFinish === true && (f.wave | 0) >= 3).map(analyzeCommitted);
  const flights = rows.filter(f => f.wave === 3 && f.outcome === 'mFlee' && (f.rounds | 0) >= 1 &&
    Array.isArray(f.log) && f.log.some(l => String(l).indexOf(BREAK_MARKER) >= 0)).map(analyzeFlight);
  // Secondary: wave-3 vFlee flights (fighter fled; gate not faced at that moment).
  const vflee = rows.filter(f => f.wave === 3 && f.outcome === 'vFlee' && (f.rounds | 0) >= 1).map(analyzeFlight);
  const countCls = (arr) => {
    const c = { both: 0, 'spike-only': 0, 'last-two-only': 0, neither: 0, UNCLASSIFIED: 0 };
    for (const r of arr) c[r.cls] = (c[r.cls] || 0) + 1;
    return c;
  };
  return { seed: obj.seed, anchorCommit: obj.anchorCommit || null,
    national: obj.national | 0, table: obj.table | 0, won: obj.won | 0,
    wave4: obj.wave4 | 0, wave5: obj.wave5 | 0, gameDays: obj.gameDays | 0,
    endScaleRank: obj.endScaleRank || null, bestSeat: obj.bestSeat || null, fullSeat: obj.fullSeat != null ? obj.fullSeat : null,
    committed, committedCounts: countCls(committed),
    flights, flightCounts: countCls(flights),
    vflee, vfleeCounts: countCls(vflee),
    fieldW3N: rows.filter(f => f.wave === 3).length,
    fieldW3pN: rows.filter(f => (f.wave | 0) >= 3).length };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  let outFile = null;
  if (outIdx >= 0) { outFile = args[outIdx + 1]; args.splice(outIdx, 2); }
  const [corpusDir, ...seedArgs] = args;
  if (!corpusDir || !seedArgs.length) { console.error('usage: spikecontact-analyze-20261031.js <corpusDir> <seed...> [--out <file>]'); process.exit(2); }
  const perSeed = [];
  for (const seed of seedArgs) {
    const obj = JSON.parse(fs.readFileSync(path.join(corpusDir, 'leadfeast', `s${seed}.json`), 'utf8'));
    perSeed.push(analyzeSeed(obj));
  }
  const merge = (key) => perSeed.reduce((a, s) => { for (const [k, v] of Object.entries(s[key])) a[k] = (a[k] || 0) + v; return a; }, {});
  const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); if (!s.length) return null; const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const band = { seeds: seedArgs.map(Number), nSeeds: perSeed.length,
    national: perSeed.reduce((a, s) => a + s.national, 0), table: perSeed.reduce((a, s) => a + s.table, 0),
    won: perSeed.reduce((a, s) => a + s.won, 0), wave4: perSeed.reduce((a, s) => a + s.wave4, 0),
    wave5: perSeed.reduce((a, s) => a + s.wave5, 0),
    medianSurvival: median(perSeed.map(s => s.gameDays)), maxSurvival: Math.max.apply(null, perSeed.map(s => s.gameDays)),
    fullSeat: perSeed.every(s => s.fullSeat != null) ? perSeed.reduce((a, s) => a + s.fullSeat, 0) : null,
    committedCounts: merge('committedCounts'), flightCounts: merge('flightCounts'), vfleeCounts: merge('vfleeCounts'),
    fieldW3N: perSeed.reduce((a, s) => a + s.fieldW3N, 0), fieldW3pN: perSeed.reduce((a, s) => a + s.fieldW3pN, 0) };
  const result = { band, perSeed };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 1) + '\n');
  console.log(JSON.stringify(band, null, 1));
  for (const s of perSeed) {
    console.log(`s${s.seed}: committed=${JSON.stringify(s.committedCounts)} flights=${JSON.stringify(s.flightCounts)} vflee=${JSON.stringify(s.vfleeCounts)} fieldW3=${s.fieldW3N} nat=${s.national} table=${s.table} won=${s.won} w4=${s.wave4} w5=${s.wave5} days=${s.gameDays} seat=${s.bestSeat}`);
  }
}
if (require.main === module) main();
module.exports = { parseLeadStrikes, parseStrikesBeforeCommit, analyzeCommitted, analyzeFlight, analyzeSeed, classify };
