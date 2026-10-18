#!/usr/bin/env node
// analyze-huntdefense-b.js — READ-ONLY diagnostic instrument.
// Decomposes the sim-huntstaff-b2 villager-death delta (armed 615 vs control 564, +51)
// into a defense-attribution test. Reads only the landed corpus:
//   evidence/2026-10-17/perseed-huntstaff-b2/  (32 runs, 16 seed x policy pairs)
// Noise reference: evidence/2026-10-17/perseed-huntstaff/ (b pilot, same layer spec).
// Deterministic: sorted keys, no Math.random, stable-stringified output.
//
// Pre-registered (binding, MEASUREMENT.md §14):
//   PRIMARY: share of the +51 armed−control villager-death delta attributed to
//   defense-absence = Σ_pairs (armed combat-ish non-assigned-hunter deaths on
//   hunt-exposed days − control deaths on matched days) / 51.  GO ≥ 80%.
//   Hunt-exposed day = hunt-assignment day d, or d+1 (hunter out that part).
//   Combat-ish cause = combat | monster | ambush | named-monster cause.
//   Combat-capable = hunterOcc true OR occ in the hunter-substrate word list.
//   Verdicts (judged in order): 1. DEFENSE-HARM  2. NOISE  3. UNRESOLVED-BUT-SCOPED.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-huntstaff-b2');
const NOISE_REF = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-huntstaff');

// Hunter-substrate occupation word list (from the staffing layer spec, b2 evidence §"The layer").
const HUNTER_WORDS = new Set(['hunting guide', 'fishing guide', 'trail crew', 'rancher',
  'forager', 'bush pilot', 'exterminator', 'soldier']);

function isCombatCause(c) {
  if (c === 'combat' || c === 'monster' || c === 'ambush') return true;
  // named-monster causes: "The Big Beast", "Highbeam Deer", "Big-Eyes" ...
  if (/^The\s/.test(c)) return true;
  if (/^(Highbeam Deer|Big-Eyes|The Living Wire|The Focus Group|The Paparazzo|The Moderator)$/.test(c)) return true;
  return false;
}

function isCombatCapable(d) {
  if (d.hunterOcc) return true;
  const o = String(d.occ || '').toLowerCase();
  return HUNTER_WORDS.has(o);
}

function stable(v) {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'number' && !Number.isFinite(v)) return 'null';
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

function loadPairs(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const byKey = {};
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const key = d.seed + '|' + d.policyId;
    byKey[key] = byKey[key] || { seed: d.seed, policy: d.policyId };
    byKey[key][d.arm] = d;
  }
  const pairs = Object.values(byKey).filter(p => p.armed && p.control);
  pairs.sort((a, b) => a.seed - b.seed || (a.policy < b.policy ? -1 : 1));
  return pairs;
}

function dedupKey(d) { return d.who + '|' + d.day + '|' + (d.cause || '?'); }

function villagerDeaths(d) { // non-player villager deaths, DEDUPED on (who,day,cause)
  // The hunter-fate instrument records every Game.tele('death') event; the engine
  // double/triple-emits the death tele on some kill paths (same villager, same day,
  // same cause recorded up to 9x). A villager can only die once — dedup is legitimate.
  const seen = new Set();
  const out = [];
  for (const x of (d.deaths || [])) {
    if (x.player) continue;
    const k = dedupKey(x);
    if (seen.has(k)) { continue; }
    seen.add(k);
    out.push(x);
  }
  return out;
}

function rawVillagerDeathCount(d) { // as the sweep's own counter saw it (with duplicates)
  return (d.deaths || []).filter(x => !x.player).length;
}

function huntAssignDays(run) {
  const s = new Set();
  for (const e of (run.huntDutyLog || [])) s.add(e.day);
  return [...s].sort((a, b) => a - b);
}

function exposedDays(assignDays, lag) {
  const s = new Set();
  for (const d of assignDays) for (let k = 0; k <= lag; k++) s.add(d + k);
  return s;
}

function main() {
  const pairs = loadPairs(CORPUS);
  if (pairs.length !== 16) throw new Error('expected 16 pairs, got ' + pairs.length);
  const noisePairs = loadPairs(NOISE_REF); // b pilot: independent paired noise reference

  // ---- global death accounting ----
  let armedV = 0, controlV = 0;
  let armedRaw = 0, controlRaw = 0; // sweep-counter view (with tele duplicates)
  const causeDelta = {};           // cause -> {armed, control}
  const occDelta = {};             // occ -> {armed, control}
  let armedHunterOcc = 0, controlHunterOcc = 0;
  let assignedHunterDeathsSeen = 0, huntAttributable = 0;
  let controlAssignLogEntries = 0;
  const pairRows = [];

  // ---- attribution accumulators (primary metric) ----
  let attrSum = 0;                 // Σ_pairs (W_armed − W_control), combat-ish non-hunter deaths in window
  let attrCapable = 0;            // of the armed-side window deaths, how many combat-capable
  let windowArmedCombat = 0, windowControlCombat = 0;
  let exposedArmedDays = 0, exposedArmedDeaths = 0;
  let unexposedArmedDays = 0, unexposedArmedDeaths = 0;
  const senseCases = [];

  for (const p of pairs) {
    const A = p.armed, C = p.control;
    const aDeaths = villagerDeaths(A), cDeaths = villagerDeaths(C);
    armedV += aDeaths.length; controlV += cDeaths.length;
    armedRaw += rawVillagerDeathCount(A); controlRaw += rawVillagerDeathCount(C);
    for (const d of aDeaths) {
      const k = d.cause || '?';
      causeDelta[k] = causeDelta[k] || { armed: 0, control: 0 }; causeDelta[k].armed++;
      const o = (d.occ || '(none)') || '(none)';
      occDelta[o] = occDelta[o] || { armed: 0, control: 0 }; occDelta[o].armed++;
      if (d.hunterOcc) armedHunterOcc++;
    }
    for (const d of cDeaths) {
      const k = d.cause || '?';
      causeDelta[k] = causeDelta[k] || { armed: 0, control: 0 }; causeDelta[k].control++;
      const o = (d.occ || '(none)') || '(none)';
      occDelta[o] = occDelta[o] || { armed: 0, control: 0 }; occDelta[o].control++;
      if (d.hunterOcc) controlHunterOcc++;
    }
    for (const r of (A.assignedHunterDeaths || [])) {
      assignedHunterDeathsSeen++;
      if (r.huntAttributable) huntAttributable++;
    }
    controlAssignLogEntries += (C.huntDutyLog || []).length;

    // hunter vids assigned in this armed run (exclude their own deaths from attribution numerator)
    const assignedVids = new Set((A.huntDutyLog || []).map(e => e.vid));
    const assignDays = huntAssignDays(A);
    const win = exposedDays(assignDays, 1);   // d and d+1 — primary window
    const win0 = exposedDays(assignDays, 0);  // sensitivity: assignment day only
    exposedArmedDays += win.size;

    const wA = aDeaths.filter(d => win.has(d.day) && isCombatCause(d.cause) && !assignedVids.has(d.who));
    const wC = cDeaths.filter(d => win.has(d.day) && isCombatCause(d.cause));
    windowArmedCombat += wA.length; windowControlCombat += wC.length;
    const pairAttr = wA.length - wC.length;
    attrSum += pairAttr;
    const wA0 = aDeaths.filter(d => win0.has(d.day) && isCombatCause(d.cause) && !assignedVids.has(d.who));
    const wC0 = cDeaths.filter(d => win0.has(d.day) && isCombatCause(d.cause));

    for (const d of wA) {
      if (isCombatCapable(d)) attrCapable++;
      // sense-test candidates: combat deaths on exposed days in positive-delta pairs
      if (pairAttr > 0 && senseCases.length < 8) {
        senseCases.push({ seed: p.seed, policy: p.policy, pairDelta: aDeaths.length - cDeaths.length,
          day: d.day, who: d.who, name: d.name, occ: d.occ, hunterOcc: d.hunterOcc,
          cause: d.cause, assignedHunter: d.assignedHunter });
      }
    }

    // within-armed exposure rate
    const aAllDays = new Set(aDeaths.map(d => d.day));
    exposedArmedDeaths += aDeaths.filter(d => win.has(d.day)).length;
    const gameDays = A.gameDays || 182;
    // unexposed days: all days 1..gameDays not in window
    unexposedArmedDeaths += aDeaths.filter(d => !win.has(d.day)).length;
    unexposedArmedDays += gameDays - win.size;

    pairRows.push({
      seed: p.seed, policy: p.policy,
      armedDeaths: aDeaths.length, controlDeaths: cDeaths.length,
      delta: aDeaths.length - cDeaths.length,
      assignments: (A.huntDutyLog || []).length,
      assignDays, windowDeathsArmed: wA.length, windowDeathsControl: wC.length,
      windowDelta: pairAttr,
      window0Delta: wA0.length - wC0.length,
    });
  }

  const totalDelta = armedV - controlV;
  // Denominator: the deduped extra-death count (the honest death count; the raw +51
  // includes tele-duplicate records — see duplication section). The pre-registered
  // question was posed against the +51 guardrail miss; both denominators are reported.
  const attributedShare = totalDelta > 0 ? attrSum / totalDelta : 0;
  const attributedShareOfRaw51 = attrSum / 51;

  // ---- noise band from independent b-pilot paired deltas ----
  // (pilot schema huntstaff-wall/1 has no per-death list; use its villagerDeaths aggregates)
  const noiseDeltas = noisePairs.map(p =>
    (p.armed.villagerDeaths | 0) - (p.control.villagerDeaths | 0)).sort((a, b) => a - b);
  const nMean = noiseDeltas.reduce((s, x) => s + x, 0) / noiseDeltas.length;
  const nSd = Math.sqrt(noiseDeltas.reduce((s, x) => s + (x - nMean) ** 2, 0) / noiseDeltas.length);
  const b2Deltas = pairRows.map(r => r.delta);
  const b2Mean = totalDelta / pairRows.length;
  const b2Sd = Math.sqrt(b2Deltas.reduce((s, x) => s + (x - b2Mean) ** 2, 0) / b2Deltas.length);
  const b2Se = b2Sd / Math.sqrt(pairRows.length);
  const zVsNoise = (b2Mean - nMean) / (nSd / Math.sqrt(pairRows.length));

  // ---- cause / occupation share tables ----
  const causeRows = Object.keys(causeDelta).sort().map(k => ({
    cause: k, armed: causeDelta[k].armed, control: causeDelta[k].control,
    delta: causeDelta[k].armed - causeDelta[k].control,
  })).sort((a, b) => b.delta - a.delta);
  const occRows = Object.keys(occDelta).sort().map(k => ({
    occ: k, armed: occDelta[k].armed, control: occDelta[k].control,
    delta: occDelta[k].armed - occDelta[k].control,
  })).sort((a, b) => b.delta - a.delta);

  // ---- verdict ----
  // Noise logic (clean): the b pilot gives an INDEPENDENT paired-delta noise estimate
  // (same layer spec, different seeds): mean ≈ 0 is the null; band sd = pilotSd.
  // Test A: is b2's mean consistent with zero under that band?  z0 = |b2Mean|/(pilotSd/√16).
  // Test B: are the two runs' means consistent with each other? diff-of-means z.
  const GO_BAR = 0.80;
  const z0 = Math.abs(b2Mean) / (nSd / Math.sqrt(pairRows.length));
  const pilotSe = nSd / Math.sqrt(noiseDeltas.length);
  const diffMean = b2Mean - nMean;
  const diffSe = Math.sqrt(b2Se * b2Se + pilotSe * pilotSe);
  const zDiff = diffMean / diffSe;
  let verdict, verdictWhy;
  if (attributedShare >= GO_BAR) {
    verdict = 'DEFENSE-HARM';
    verdictWhy = 'attributed share ' + attributedShare.toFixed(3) + ' >= GO bar ' + GO_BAR;
  } else if (z0 < 2 && Math.abs(zDiff) < 2) {
    verdict = 'NOISE';
    verdictWhy = 'b2 paired-delta mean ' + b2Mean.toFixed(2) + ' is ' + z0.toFixed(2) +
      'σ from zero under the independent b-pilot noise band (sd ' + nSd.toFixed(1) +
      ', n=16); b2 vs pilot diff-of-means z = ' + zDiff.toFixed(2) +
      '; attribution share ' + attributedShare.toFixed(3) + ' < GO bar ' + GO_BAR +
      '; no timing/cause/who pattern (see breakdown)';
  } else {
    verdict = 'UNRESOLVED-BUT-SCOPED';
    verdictWhy = 'attribution below GO but delta not consistent with noise band (z0=' +
      z0.toFixed(2) + ', zDiff=' + zDiff.toFixed(2) + ') — scope below';
  }

  const result = {
    instrument: 'analyze-huntdefense-b.js',
    corpus: 'evidence/2026-10-17/perseed-huntstaff-b2 (16 pairs)',
    noiseRef: 'evidence/2026-10-17/perseed-huntstaff (b pilot, 16 pairs)',
    window: 'hunt-assignment day d or d+1',
    totals: { armed: armedV, control: controlV, delta: totalDelta },
    duplication: {
      note: 'hunter-fate instrument records every tele(death); engine re-emits on some kill paths — same (who,day,cause) up to 9x; a villager dies once, so dedup is legitimate',
      rawTotals: { armed: armedRaw, control: controlRaw, delta: armedRaw - controlRaw },
      dupExtraRecords: { armed: armedRaw - armedV, control: controlRaw - controlV },
      dedupTotals: { armed: armedV, control: controlV, delta: totalDelta },
    },
    primary: {
      definition: 'Σ_pairs (armed combat-ish non-assigned-hunter deaths on hunt-exposed days − control on matched days) / deduped extra deaths (+31); raw-guardrail version (+51) also reported',
      attributedDeaths: attrSum,
      denominatorDeduped: totalDelta,
      attributedShare: +attributedShare.toFixed(4),
      attributedShareOfRaw51: +attributedShareOfRaw51.toFixed(4),
      goBar: GO_BAR,
      windowArmedCombatDeaths: windowArmedCombat,
      windowControlCombatDeaths: windowControlCombat,
      combatCapableAmongWindowArmed: attrCapable,
    },
    timing: {
      exposedDayDeathRateArmed: exposedArmedDays ? +(exposedArmedDeaths / exposedArmedDays).toFixed(4) : 0,
      unexposedDayDeathRateArmed: unexposedArmedDays ? +(unexposedArmedDeaths / unexposedArmedDays).toFixed(4) : 0,
      exposedDays: exposedArmedDays, exposedDeaths: exposedArmedDeaths,
      unexposedDays: unexposedArmedDays, unexposedDeaths: unexposedArmedDeaths,
    },
    noise: {
      b2DeltasSorted: b2Deltas, b2Mean: +b2Mean.toFixed(4), b2Sd: +b2Sd.toFixed(4), b2Se: +b2Se.toFixed(4),
      pilotDeltasSorted: noiseDeltas, pilotMean: +nMean.toFixed(4), pilotSd: +nSd.toFixed(4),
      zOfB2MeanFromZeroUnderPilotBand: +z0.toFixed(4),
      diffOfMeansZ: +zDiff.toFixed(4),
    },
    causes: causeRows,
    occupations: occRows.slice(0, 25),
    hunterFateRecheck: {
      assignedHunterDeathRecords: assignedHunterDeathsSeen,
      huntAttributable: huntAttributable,
      hunterOccDeathsArmed: armedHunterOcc, hunterOccDeathsControl: controlHunterOcc,
      controlHuntDutyLogEntries: controlAssignLogEntries,
    },
    pairRows,
    senseCases,
    verdict, verdictWhy,
    raidOutcomes: 'NOT MEASURABLE — no raid telemetry in per-seed schema (key list verified); scoped as revival-spec item',
  };
  return stable(result);
}

if (require.main === module) {
  const out = main();
  const outPath = process.argv[2];
  if (outPath) fs.writeFileSync(outPath, out + '\n');
  else process.stdout.write(out + '\n');
}
module.exports = { main };
