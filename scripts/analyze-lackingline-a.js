#!/usr/bin/env node
// analyze-lackingline-a.js — lacking-line census (sim-lackingline-a).
// Pure reads over recorder corpora. No game writes, no RNG, no
// policy edits. For each corpus dir: extracts still creek
// evenings, classifies RAW refusal-time gates (woodPlayer < 4,
// kcalLive-or-kcal < 60, ticksToDayEnd < 96 — never the bridge
// skip, which IS the first-failure line under census), records
// the gate the narrated line names (bridge skip + narration
// verbatim), counts gate-combination classes, and counts the
// warmth-connection: still evenings directly following a strand
// evening whose warmth fire spent >= 1 bridge log, and whether
// that evening's refusal line mentions the spend (strict test:
// the lacking-line text itself contains fire/warmth/burn/spend
// language — none of the lackingLine templates do).
//
// Strand definition (as in analyze-woodday-b.js): a maximal run
// of still-refused creek evenings on consecutive loop-days.
// The census covers every still creek evening of every seed
// that has such a run of length >= 2; any still creek evening
// outside such a run is reported separately, never silently
// dropped.
//
// Usage: node scripts/analyze-lackingline-a.js <corpusDir> <leg>
//   prints JSON to stdout.
'use strict';
const fs = require('fs');
const path = require('path');

const WOOD_NEEDED = 4, KCAL_NEEDED = 60, TICKS_NEEDED = 96;
const SKIP_TO_GATE = { 'wood-short': 'wood', 'kcal-short': 'kcal', 'ticks-short': 'ticks' };
const GATE_ORDER = ['wood', 'kcal', 'ticks'];
const SPEND_WORDS = /fire|warmth|burn|spent|spend/i;

function classifyEvening(row) {
  const wc = row.woodcarry || null;
  if (!wc || wc.bucket !== 'creek' || wc.rescued) return null;
  const cls = wc.classification || null;
  if (!cls) return { loopDay: row.loopDay, unclassified: true, reason: 'no-classification' };
  const logs = (cls.woodPlayer === undefined ? null : cls.woodPlayer);
  const kcalLiveNull = (cls.kcalLive === undefined || cls.kcalLive === null);
  const kcal = kcalLiveNull ? (cls.kcal === undefined ? null : cls.kcal) : cls.kcalLive;
  const ticks = (cls.ticksToDayEnd === undefined ? null : cls.ticksToDayEnd);
  if (logs === null || kcal === null || ticks === null) {
    return { loopDay: row.loopDay, unclassified: true, reason: 'null-gate', logs, kcal, ticks };
  }
  const failing = [];
  if (logs < WOOD_NEEDED) failing.push('wood');
  if (kcal < KCAL_NEEDED) failing.push('kcal');
  if (ticks < TICKS_NEEDED) failing.push('ticks');
  const skip = (wc.bridge && wc.bridge.skip) || null;
  const named = SKIP_TO_GATE[skip] || null;
  const firstFailing = failing[0] || null;
  return {
    loopDay: row.loopDay,
    logs, kcal, kcalFallbackUsed: kcalLiveNull, ticks,
    failing, combo: failing.length === 1 ? failing[0] + '-only' : (failing.length ? failing.join('+') : 'none'),
    skip, named,
    narration: wc.narration || null,
    narrationInTail: Array.isArray(row.eveningSayTail) && wc.narration
      ? row.eveningSayTail.indexOf(wc.narration) !== -1 : null,
    skipAgreesFirstFailing: named !== null && named === firstFailing,
    hidden: failing.filter((g) => g !== named),
    warmth: row.warmth || null,
    fullDaySay: Array.isArray(row.fullDaySay) ? row.fullDaySay : null,
  };
}

function analyzeCorpus(dir, leg) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const out = {
    leg, dir, files: files.length, seeds: {},
    strandSeeds: [], nonStrandStill: [],
    evenings: [], comboCounts: {}, namedCounts: {},
    skipAgreementMismatches: [], unclassified: [], anomalies: [],
    warmthConnection: { following: 0, connected: 0, cases: [] },
    spendNights: [],
  };
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seed = doc.seed;
    const rows = (doc.evenings || []).slice().sort((a, b) => a.loopDay - b.loopDay);
    const still = [];
    for (const row of rows) {
      const c = classifyEvening(row);
      if (c) still.push(c);
    }
    // Maximal consecutive runs of still evenings.
    const runs = [];
    let run = [];
    for (const c of still) {
      if (run.length && c.loopDay === run[run.length - 1].loopDay + 1) run.push(c);
      else { if (run.length) runs.push(run); run = [c]; }
    }
    if (run.length) runs.push(run);
    const strandRuns = runs.filter((r) => r.length >= 2);
    const strandDays = [];
    for (const r of strandRuns) for (const c of r) strandDays.push(c.loopDay);
    out.seeds[seed] = {
      evenings: rows.length, still: still.length,
      runs: runs.map((r) => r.map((c) => c.loopDay)),
      strandRuns: strandRuns.map((r) => r.map((c) => c.loopDay)),
      errs: (doc.woodcarryStore && doc.woodcarryStore.errs) || 0,
      wwErrs: (doc.warmthStore && doc.warmthStore.errs) || 0,
      daysAlive: doc.daysAlive, endReason: doc.endReason,
    };
    if (strandRuns.length) out.strandSeeds.push(seed);
    for (const c of still) {
      if (strandDays.indexOf(c.loopDay) === -1) out.nonStrandStill.push({ seed, loopDay: c.loopDay });
    }
    // Census + warmth connection over strand evenings only.
    for (const r of strandRuns) {
      for (let i = 0; i < r.length; i++) {
        const c = r[i];
        const rec = Object.assign({ seed, leg }, c);
        delete rec.fullDaySay;
        out.evenings.push(rec);
        out.comboCounts[c.combo] = (out.comboCounts[c.combo] || 0) + 1;
        out.namedCounts[c.named || ('skip:' + c.skip)] = (out.namedCounts[c.named || ('skip:' + c.skip)] || 0) + 1;
        if (c.unclassified) out.unclassified.push({ seed, loopDay: c.loopDay, reason: c.reason });
        else {
          if (!c.skipAgreesFirstFailing) out.skipAgreementMismatches.push({ seed, loopDay: c.loopDay, skip: c.skip, named: c.named, failing: c.failing });
          if (c.failing.length === 0) out.anomalies.push({ seed, loopDay: c.loopDay, kind: 'still-but-no-gate-fails' });
          if (c.narration === null) out.anomalies.push({ seed, loopDay: c.loopDay, kind: 'missing-narration' });
          if (c.narrationInTail === false) out.anomalies.push({ seed, loopDay: c.loopDay, kind: 'narration-not-in-eveningSayTail' });
        }
        const w = c.warmth || {};
        const spent = (w.acted && typeof w.logSpent === 'number') ? w.logSpent : 0;
        if (spent >= 1) {
          out.spendNights.push({ seed, loopDay: c.loopDay, logSpent: spent, woodBefore: w.woodBefore, woodAfter: w.woodAfter, fireLit: w.fireLit });
          if (w.woodBefore !== null && w.woodAfter !== null && (w.woodBefore - w.woodAfter) !== spent) {
            out.anomalies.push({ seed, loopDay: c.loopDay, kind: 'warmth-ledger-mismatch', woodBefore: w.woodBefore, woodAfter: w.woodAfter, logSpent: spent });
          }
        }
        // Warmth connection: this evening follows a spend evening in the same run.
        if (i > 0) {
          const prev = r[i - 1];
          const pw = prev.warmth || {};
          const prevSpent = (pw.acted && typeof pw.logSpent === 'number') ? pw.logSpent : 0;
          if (prevSpent >= 1) {
            const mentions = typeof c.narration === 'string' && SPEND_WORDS.test(c.narration);
            out.warmthConnection.following++;
            if (mentions) out.warmthConnection.connected++;
            out.warmthConnection.cases.push({
              seed, spendNight: prev.loopDay, spendLogs: prevSpent,
              evening: c.loopDay, eveningSkip: c.skip, eveningNamed: c.named,
              mentionsSpendInRefusalLine: mentions, narration: c.narration,
            });
          }
        }
      }
    }
  }
  out.evenings.sort((a, b) => (a.seed - b.seed) || (a.loopDay - b.loopDay));
  return out;
}

if (require.main === module) {
  const dir = process.argv[2], leg = process.argv[3] || path.basename(dir);
  if (!dir) { console.error('usage: analyze-lackingline-a.js <corpusDir> <leg>'); process.exit(2); }
  console.log(JSON.stringify(analyzeCorpus(dir, leg), null, 1));
}

module.exports = { classifyEvening, analyzeCorpus, WOOD_NEEDED, KCAL_NEEDED, TICKS_NEEDED };
