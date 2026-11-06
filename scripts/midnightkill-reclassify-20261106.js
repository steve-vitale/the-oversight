// midnightkill-reclassify-20261106.js — re-match the two committed
// corpora with the sim-midnightkill-b ±1-day kill join (arm
// sim-midnightkill-b, run fleshout-loop-b-20261106T1730Z). READ-ONLY
// over the corpora: it loads the 32 committed per-seed files
// (perseed-partydamage-b, 87001–87008; perseed-fightinterior-b,
// 51001–51008), applies each instrument's OWN matcher to every
// wave-4+ trace, and prints per-leg matched kills vs the waveKillLog,
// the recovered kills with verification, unclassified and ambiguous
// counts, log reconciliation, and the GO verdict object. No file is
// written, no seed is re-run, no number is re-cut: if the
// re-classification disagrees with the preregged GO, the fix is
// wrong, not the bands.
//
// Matchers used (same logic as the live close path, not copies):
//   fightinterior: INST.classifyEnding + matchWonKills/matchLogKills
//   partydamage:   PD.matchWonKills + AN.matchPyrrhicKills
// Offline limits, stated honestly (same class as the pyrrhic
// reclassifier): the pre-fix corpora recorded no close path and no
// log snapshot, so the fightinterior re-classification passes
// closeKind 'unknown' and the whole log (the live snapshot guard is
// replaced by the mHpLeft === 0 guard + the killsLive exclusion),
// and the partydamage re-classification keeps recorded endings for
// 'lost'/'fled' traces (that instrument has no pyrrhic branch —
// deliberately not ported here) and leans on log reconciliation
// instead: every wave-4 log entry must be claimed by exactly one
// matched trace, so a hidden pyrrhic shape would surface as an
// unreconciled log kill, not a silent drop.
// Usage: node scripts/midnightkill-reclassify-20261106.js <partydamage-dir> <fightinterior-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const INST = require(path.join(__dirname, 'fightinterior-instrument-20261106'));
const AN = require(path.join(__dirname, 'fightinterior-analyze-20261106'));
const PD = require(path.join(__dirname, 'partydamage-instrument-20261106'));
const PDA = require(path.join(__dirname, 'partydamage-analyze-20261106'));

function normKey(e) {
  if (!e || typeof e !== 'object') return null;
  const day = (e.day != null) ? e.day : e.d;
  if (day == null || !e.mid) return null;
  return day + '|' + e.mid + '|' + (e.by || null) + '|' + (e.via || 'unknown');
}

// Pre-fix pyrrhic rule, preserved ONLY for the before-measurement:
// same-day, wave >= 4, killer in fighters, no mid check. It is not
// the matcher under test; it reproduces what the old analyzer counted.
function oldPyrrhicMatch(tr, log) {
  return (log || []).some(function (k) {
    const kd = (k && k.d != null) ? k.d : (k && k.day);
    return k && kd === tr.day && ((k.w != null ? k.w : k.wave) | 0) >= 4 &&
      (tr.fighters || []).indexOf(k.by) >= 0;
  });
}

function reclassifyFightinteriorFile(file) {
  const row = JSON.parse(fs.readFileSync(file, 'utf8'));
  const log = row.waveKillLog || [];
  const live = row.killsLive || [];
  const logW4 = log.filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const traces = (row.traces || []).filter(function (t) { return (t.wave | 0) >= 4; });
  const out = traces.map(function (tr) {
    const before = tr.ending || null;
    const cls = INST.classifyEnding(tr, log, live, 'unknown', !!row.villageLost);
    let cands = [], matchedEntry = null;
    if (tr.outcome === 'won') {
      cands = INST.matchWonKills(tr, live);
      matchedEntry = cands.length ? cands[0] : null;
    } else if (tr.outcome === 'lost') {
      cands = INST.matchLogKills(tr, log, live, true);
      matchedEntry = cands.length ? cands[0] : null;
    } else if (tr.outcome === 'unfinished') {
      cands = INST.matchLogKills(tr, log, live, false);
      matchedEntry = cands.length ? cands[0] : null;
    }
    return {
      seq: tr.seq, day: tr.day, mid: tr.mid, mids: (tr.mids || []).slice(),
      outcome: tr.outcome, fighters: (tr.fighters || []).slice(),
      rounds: tr.rounds, mHpLeft: tr.mHpLeft, entryHp: tr.entryHp,
      hits: (tr.hits || []).length,
      endingBefore: before, endingAfter: cls.ending,
      unfinishedKind: cls.unfinishedKind || null,
      matchCandidates: cands.length,
      ambiguous: cands.length > 1,
      matchedEntry: matchedEntry,
      matchedKey: matchedEntry ? normKey(matchedEntry) : null,
    };
  });
  const isKill = function (t) { return AN.KILL_ENDINGS.indexOf(t.endingAfter) >= 0; };
  return {
    file: path.basename(file), seed: row.seed, policy: row.policy,
    logW4: logW4,
    tracesW4: traces.length,
    matchedKillsBefore: traces.filter(function (t) { return t.ending === 'kill'; }).length,
    matchedKillsAfter: out.filter(isKill).length,
    traces: out,
    instrumentErrors: (row.instrumentErrors || []).length,
    log: log,
  };
}

function reclassifyPartydamageFile(file) {
  const row = JSON.parse(fs.readFileSync(file, 'utf8'));
  const log = row.waveKillLog || [];
  const live = row.killsLive || [];
  const logW4 = log.filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const traces = (row.traces || []).filter(function (t) { return (t.wave | 0) >= 4; });
  const out = traces.map(function (tr) {
    const before = tr.ending || null;
    let endingAfter = before, cands = [], matchedEntry = null, pyrrhic = false;
    if (tr.outcome === 'won') {
      cands = PD.matchWonKills(tr, live);
      matchedEntry = cands.length ? cands[0] : null;
      endingAfter = matchedEntry ? 'kill' : 'rout';
    } else if (tr.outcome === 'routed') endingAfter = 'rout';
    else if (tr.outcome === 'lost') endingAfter = 'scholar-death';
    else if (tr.outcome === 'fled') endingAfter = 'scholar-flee';
    else if (tr.outcome === 'unfinished') {
      cands = PDA.matchPyrrhicKills(tr, log);
      matchedEntry = cands.length ? cands[0] : null;
      pyrrhic = !!matchedEntry;
      endingAfter = 'unfinished';
    }
    return {
      seq: tr.seq, day: tr.day, mid: tr.mid, mids: (tr.mids || []).slice(),
      outcome: tr.outcome, fighters: (tr.fighters || []).slice(),
      rounds: tr.rounds, mHpLeft: tr.mHpLeft, entryHp: tr.entryHp,
      hits: (tr.hits || []).length,
      endingBefore: before, endingAfter: endingAfter,
      unfinishedKind: null,
      matchCandidates: cands.length,
      ambiguous: cands.length > 1,
      matchedEntry: matchedEntry,
      matchedKey: matchedEntry ? normKey(matchedEntry) : null,
      pyrrhicMatch: pyrrhic,
    };
  });
  // Analyzer rule (tbKillMatched): ending 'kill', OR 'unfinished' with
  // a pyrrhic log match. The re-derived 'won' endings feed the first
  // half; the second half is vacuous on this corpus (no 'unfinished'
  // traces) but the rule is applied as written.
  const matchedAfter = out.filter(function (t) {
    return t.endingAfter === 'kill' || (t.endingAfter === 'unfinished' && t.pyrrhicMatch);
  }).length;
  const matchedBefore = traces.filter(function (t) { return t.ending === 'kill'; }).length +
    traces.filter(function (t) { return t.ending === 'unfinished' && oldPyrrhicMatch(t, log); }).length;
  return {
    file: path.basename(file), seed: row.seed, policy: row.policy,
    logW4: logW4,
    tracesW4: traces.length,
    matchedKillsBefore: matchedBefore,
    matchedKillsAfter: matchedAfter,
    traces: out,
    instrumentErrors: (row.instrumentErrors || []).length,
    log: log,
  };
}

function summarizeLeg(files, legs) {
  const byLeg = {};
  legs.forEach(function (leg) {
    const L = files.filter(function (r) { return r.policy === leg; });
    const sum = function (k) { return L.reduce(function (m, r) { return m + r[k]; }, 0); };
    const endingsAfter = {};
    const endingsBefore = {};
    L.forEach(function (r) {
      r.traces.forEach(function (t) {
        endingsAfter[t.endingAfter] = (endingsAfter[t.endingAfter] || 0) + 1;
        endingsBefore[t.endingBefore] = (endingsBefore[t.endingBefore] || 0) + 1;
      });
    });
    byLeg[leg] = {
      files: L.length, logW4: sum('logW4'), tracesW4: sum('tracesW4'),
      matchedKillsBefore: sum('matchedKillsBefore'),
      matchedKillsAfter: sum('matchedKillsAfter'),
      endingsBefore: endingsBefore, endingsAfter: endingsAfter,
    };
  });
  return byLeg;
}

// Log reconciliation: every wave-4 log entry must be claimed by exactly
// one matched trace. Claims are keyed by the matched ENTRY's own
// fields (day|mid|by|via) — the entry's day may be ±1 from the trace's
// day, so the trace day is never part of the key.
function reconcile(files, isKillTrace) {
  const claims = {};
  files.forEach(function (r) {
    r.traces.forEach(function (t) {
      if (!isKillTrace(t)) return;
      if (!t.matchedKey) return;
      (claims[t.matchedKey] = claims[t.matchedKey] || []).push(
        { seed: r.seed, policy: r.policy, seq: t.seq, day: t.day, mid: t.mid });
    });
  });
  const unreconciled = [];
  const doubleClaimed = [];
  files.forEach(function (r) {
    (r.log || []).filter(function (e) { return ((e.w | 0) >= 4); }).forEach(function (e) {
      const k = normKey(e);
      const c = claims[k] || [];
      if (!c.length) unreconciled.push({ seed: r.seed, policy: r.policy, entry: e });
      else if (c.length > 1) doubleClaimed.push({ key: k, entry: e, claimedBy: c });
    });
  });
  return { claims: claims, unreconciled: unreconciled, doubleClaimed: doubleClaimed };
}

function reclassifyCorpus(dir, kind) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) { return path.join(dir, f); }).sort();
  const perFile = files.map(kind === 'fightinterior' ? reclassifyFightinteriorFile : reclassifyPartydamageFile);
  const legs = kind === 'fightinterior' ? ['baseline', 'staged'] : ['baseline', 'partydamage'];
  const byLeg = summarizeLeg(perFile, legs);
  const isKillTrace = kind === 'fightinterior'
    ? function (t) { return AN.KILL_ENDINGS.indexOf(t.endingAfter) >= 0; }
    : function (t) { return t.endingAfter === 'kill' || (t.endingAfter === 'unfinished' && t.pyrrhicMatch); };
  const rec = reconcile(perFile, isKillTrace);
  const unclassified = perFile.reduce(function (m, r) {
    return m + r.traces.filter(function (t) {
      const tax = kind === 'fightinterior' ? AN.ENDINGS : PDA.ENDINGS;
      return tax.indexOf(t.endingAfter) < 0;
    }).length;
  }, 0);
  const ambiguousTraces = [];
  perFile.forEach(function (r) {
    r.traces.forEach(function (t) {
      if (t.ambiguous) ambiguousTraces.push({ seed: r.seed, policy: r.policy, seq: t.seq, day: t.day, mid: t.mid, candidates: t.matchCandidates });
    });
  });
  const ambiguous = ambiguousTraces.length + rec.doubleClaimed.length;
  // Recovered kills: traces that become kills under the new matcher
  // (ending was not a kill ending before, is one after — or an
  // 'unfinished' trace newly counted via the pyrrhic match).
  const recovered = [];
  perFile.forEach(function (r) {
    r.traces.forEach(function (t) {
      const wasKill = kind === 'fightinterior'
        ? AN.KILL_ENDINGS.indexOf(t.endingBefore) >= 0
        : (t.endingBefore === 'kill');
      const nowKill = isKillTrace(t);
      if (!wasKill && nowKill) {
        recovered.push({
          seed: r.seed, policy: r.policy, seq: t.seq, day: t.day, mid: t.mid,
          outcome: t.outcome, endingBefore: t.endingBefore, endingAfter: t.endingAfter,
          rounds: t.rounds, mHpLeft: t.mHpLeft, entryHp: t.entryHp,
          hits: t.hits, fighters: t.fighters, matchedEntry: t.matchedEntry,
          matchCandidates: t.matchCandidates,
        });
      }
    });
  });
  const totalLog = legs.reduce(function (m, l) { return m + (byLeg[l] ? byLeg[l].logW4 : 0); }, 0);
  const totalAfter = legs.reduce(function (m, l) { return m + (byLeg[l] ? byLeg[l].matchedKillsAfter : 0); }, 0);
  const totalBefore = legs.reduce(function (m, l) { return m + (byLeg[l] ? byLeg[l].matchedKillsBefore : 0); }, 0);
  return {
    corpus: dir, kind: kind, files: perFile.length,
    instrumentErrors: perFile.reduce(function (m, r) { return m + r.instrumentErrors; }, 0),
    byLeg: byLeg,
    totalLogW4: totalLog, totalMatchedBefore: totalBefore, totalMatchedAfter: totalAfter,
    recovered: recovered,
    unreconciledLogKills: rec.unreconciled,
    doubleClaimed: rec.doubleClaimed,
    unclassified: unclassified,
    ambiguousTraces: ambiguousTraces, ambiguousMatches: ambiguous,
    perFile: perFile,
  };
}

function reclassifyBoth(pdDir, fiDir) {
  const pd = reclassifyCorpus(pdDir, 'partydamage');
  const fi = reclassifyCorpus(fiDir, 'fightinterior');
  const go = {
    a_armed_1_to_2: pd.byLeg.partydamage.matchedKillsAfter === 2 &&
      pd.byLeg.partydamage.matchedKillsBefore === 1 &&
      pd.byLeg.partydamage.tracesW4 === 24 &&
      pd.byLeg.partydamage.logW4 === 2,
    a_baseline_3_stays: pd.byLeg.baseline.matchedKillsAfter === 3 &&
      pd.byLeg.baseline.logW4 === 3,
    b_fightinterior_9_eq_9: fi.totalMatchedAfter === 9 && fi.totalLogW4 === 9 &&
      fi.byLeg.baseline.matchedKillsAfter === 3 && fi.byLeg.staged.matchedKillsAfter === 6,
    c_no_false: pd.unreconciledLogKills.length === 0 && fi.unreconciledLogKills.length === 0 &&
      pd.byLeg.partydamage.matchedKillsAfter <= pd.byLeg.partydamage.logW4 &&
      pd.byLeg.baseline.matchedKillsAfter <= pd.byLeg.baseline.logW4 &&
      fi.totalMatchedAfter <= fi.totalLogW4,
    d_unclassified_0: pd.unclassified === 0 && fi.unclassified === 0,
    d_ambiguous_0: pd.ambiguousMatches === 0 && fi.ambiguousMatches === 0,
  };
  go.ALL = Object.keys(go).every(function (k) { return go[k]; });
  return { partydamage: pd, fightinterior: fi, go: go };
}

function main() {
  const pdDir = process.argv[2];
  const fiDir = process.argv[3];
  if (!pdDir || !fiDir) {
    console.error('usage: midnightkill-reclassify-20261106.js <partydamage-dir> <fightinterior-dir>');
    process.exit(2);
  }
  console.log(JSON.stringify(reclassifyBoth(pdDir, fiDir), null, 2));
}

if (require.main === module) main();
module.exports = { reclassifyCorpus: reclassifyCorpus, reclassifyBoth: reclassifyBoth,
  reclassifyFightinteriorFile: reclassifyFightinteriorFile,
  reclassifyPartydamageFile: reclassifyPartydamageFile };
