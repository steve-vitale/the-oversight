// pyrrhic-reclassify-20261106.js — re-classify the committed
// fightinterior corpus with the sim-pyrrhic-b close logic (arm
// sim-pyrrhic-b, run fleshout-loop-b-20261106T1630Z, findings #1811/
// #1822). READ-ONLY over the corpus: it loads the 16 committed
// per-seed files, applies the instrument's own classifyEnding to every
// wave-4+ trace, and prints per-leg fight-level kill counts vs the
// waveKillLog, the two named kills' new endings, and the 'unfinished'
// split. No file is written, no seed is re-run, no number is re-cut:
// if the re-classification disagrees with the preregged GO, the fix
// is wrong, not the band.
//
// Offline limits, stated honestly (prereg §Metric review): the
// pre-fix corpus recorded no close path and no log snapshot, so the
// re-classification passes closeKind 'unknown' (an unmatched
// 'unfinished' trace reports unfinishedKind 'unknown' instead of a
// guessed split) and the whole log (the live snapshot guard is
// replaced by the mHpLeft === 0 guard + the killsLive exclusion).
// On this band neither limit bites: the corpus holds exactly one
// 'unfinished' trace and it matches, and every 'lost' trace's
// pyrrhic candidacy is decided by the killsLive exclusion alone.
// Usage: node scripts/pyrrhic-reclassify-20261106.js <corpus-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const INST = require(path.join(__dirname, 'fightinterior-instrument-20261106'));
const AN = require(path.join(__dirname, 'fightinterior-analyze-20261106'));

function reclassifyFile(file) {
  const row = JSON.parse(fs.readFileSync(file, 'utf8'));
  const log = row.waveKillLog || [];
  const live = row.killsLive || [];
  const logW4 = log.filter(function (e) { return ((e.w | 0) >= 4); }).length;
  const liveW4 = live.filter(function (e) { return ((e.wave | 0) >= 4); }).length;
  const traces = (row.traces || []).filter(function (t) { return (t.wave | 0) >= 4; });
  const out = traces.map(function (tr) {
    const before = tr.ending || null;
    const cls = INST.classifyEnding(tr, log, live, 'unknown', !!row.villageLost);
    // Candidate count uses the same exclusion the live branch would:
    // pyrrhic ('lost') excludes killsLive entries; other outcomes don't.
    const cands = INST.matchLogKills(tr, log, live, tr.outcome === 'lost');
    return {
      seq: tr.seq, day: tr.day, mid: tr.mid, outcome: tr.outcome,
      fighters: (tr.fighters || []).slice(),
      endingBefore: before, endingAfter: cls.ending,
      unfinishedKind: cls.unfinishedKind || null,
      matchCandidates: cands.length,
      ambiguous: cands.length > 1,
    };
  });
  const killEndings = function (list) {
    return list.filter(function (t) { return AN.KILL_ENDINGS.indexOf(t.endingAfter) >= 0; }).length;
  };
  const killEndingsBefore = traces.filter(function (t) { return t.ending === 'kill'; }).length;
  return {
    file: path.basename(file), seed: row.seed, policy: row.policy,
    logW4: logW4, liveW4: liveW4,
    tracesW4: traces.length,
    fightKillsBefore: killEndingsBefore,
    fightKillsAfter: killEndings(out),
    traces: out,
    instrumentErrors: (row.instrumentErrors || []).length,
  };
}

function reclassifyDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) { return path.join(dir, f); }).sort();
  const perFile = files.map(reclassifyFile);
  const byLeg = {};
  ['baseline', 'staged'].forEach(function (leg) {
    const L = perFile.filter(function (r) { return r.policy === leg; });
    const sum = function (k) { return L.reduce(function (m, r) { return m + r[k]; }, 0); };
    const endingsAfter = {};
    L.forEach(function (r) {
      r.traces.forEach(function (t) { endingsAfter[t.endingAfter] = (endingsAfter[t.endingAfter] || 0) + 1; });
    });
    const unfinishedKinds = {};
    L.forEach(function (r) {
      r.traces.forEach(function (t) {
        if (t.endingAfter === 'unfinished' && t.unfinishedKind) {
          unfinishedKinds[t.unfinishedKind] = (unfinishedKinds[t.unfinishedKind] || 0) + 1;
        }
      });
    });
    byLeg[leg] = {
      files: L.length,
      logW4: sum('logW4'), liveW4: sum('liveW4'),
      fightKillsBefore: sum('fightKillsBefore'),
      fightKillsAfter: sum('fightKillsAfter'),
      endingsAfter: endingsAfter, unfinishedKinds: unfinishedKinds,
    };
  });
  const named = [];
  perFile.forEach(function (r) {
    r.traces.forEach(function (t) {
      if ((r.seed === 51005 && r.policy === 'staged' && t.day === 65 && t.mid === 'reunion') ||
          (r.seed === 51002 && r.policy === 'baseline' && t.day === 80 && t.mid === 'strike')) {
        named.push({ seed: r.seed, policy: r.policy, day: t.day, mid: t.mid,
          fighters: t.fighters || null,
          outcome: t.outcome, endingBefore: t.endingBefore, endingAfter: t.endingAfter,
          matchCandidates: t.matchCandidates, ambiguous: t.ambiguous });
      }
    });
  });
  const totalLog = byLeg.baseline.logW4 + byLeg.staged.logW4;
  const totalAfter = byLeg.baseline.fightKillsAfter + byLeg.staged.fightKillsAfter;
  const unclassified = perFile.reduce(function (m, r) {
    return m + r.traces.filter(function (t) { return AN.ENDINGS.indexOf(t.endingAfter) < 0; }).length;
  }, 0);
  const ambiguous = perFile.reduce(function (m, r) {
    return m + r.traces.filter(function (t) { return t.ambiguous; }).length;
  }, 0);
  // The day-65 Reunion was ground twice (two traces, same day+mid): the
  // pyrrhic one is the trace whose fighters include the killer.
  const greta = named.filter(function (n) { return n.seed === 51005 && (n.fighters || []).indexOf('greta_hansen') >= 0; })[0] || null;
  const grace = named.filter(function (n) { return n.seed === 51002; })[0] || null;
  const go = {
    G1_baseline_3: byLeg.baseline.fightKillsAfter === 3 && byLeg.baseline.logW4 === 3,
    G1_staged_6: byLeg.staged.fightKillsAfter === 6 && byLeg.staged.logW4 === 6,
    G1_total_9: totalAfter === 9 && totalLog === 9,
    G2_greta_pyrrhic: !!greta && greta.endingAfter === 'pyrrhic-kill',
    G2_grace_unclosed: !!grace && grace.endingAfter === 'kill-unclosed',
    G3_no_ambiguous: ambiguous === 0,
    G3_no_unclassified: unclassified === 0,
  };
  go.ALL = Object.keys(go).every(function (k) { return go[k]; });
  return {
    corpus: dir, files: perFile.length,
    instrumentErrors: perFile.reduce(function (m, r) { return m + r.instrumentErrors; }, 0),
    byLeg: byLeg, totalLogW4: totalLog, totalFightKillsAfter: totalAfter,
    namedKills: named, unclassified: unclassified, ambiguousMatches: ambiguous,
    go: go, perFile: perFile,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: pyrrhic-reclassify-20261106.js <corpus-dir>'); process.exit(2); }
  console.log(JSON.stringify(reclassifyDir(dir), null, 2));
}

module.exports = { reclassifyDir: reclassifyDir, reclassifyFile: reclassifyFile };
