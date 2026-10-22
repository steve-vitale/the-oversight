#!/usr/bin/env node
// Wave-5 window-loss attribution instrument (DIAG — re-analysis only, NO new sims).
//
// Reads the landed corpora over one question: for every wave-5 readiness
// window observed (opened or never-opened), what filled it, what blocked it,
// and what killed it — veterans | armor | rerun-escalation |
// mantle-succession | other.
//
// Corpora (all repo-relative; the stagemuster corpus landed on master this
// run, so it is present after any checkout at/after b73e4751e):
//   evidence/2026-10-22/perseed-armorydrive-confirm/  (64 configs; 4 armed windows)
//   evidence/2026-10-22/perseed-vetwindow/            (32 configs; 0 windows)
//   evidence/2026-10-22/perseed-vetwindow-probe/      (12 configs; 8 obs = 4 unique, probe-duplicates)
//   evidence/2026-10-22/perseed-stagemuster/         (32 configs; 4 windows, coarse)
//   evidence/2026-10-22/diag-vetwindow.json          (DIAG census + death rows for the 4 confirm windows)
//   scripts/windowloss-facts-20261022.json           (DIAG-derived breaking-death fact sheet, cited)
//
// A "window" is observed iff w5vetsMax >= 2 (the VETERANS readiness bar —
// 2 living roster members with wave-4+ kills in state.waveKillLog — filled
// at some point). Outcome: opened (wave5==1), killed (wave5==0, vetsEnd<2),
// held (wave5==0, vetsEnd>=2).
//
// Pure function of the corpora: no RNG, no clock, no network. Writes nothing;
// prints the markdown table (default) or --json for the full report object.
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const CORPORA = {
  'armorydrive-confirm': 'evidence/2026-10-22/perseed-armorydrive-confirm',
  'vetwindow-pilot': 'evidence/2026-10-22/perseed-vetwindow',
  'vetwindow-probe': 'evidence/2026-10-22/perseed-vetwindow-probe',
  'stagemuster': 'evidence/2026-10-22/perseed-stagemuster',
};
const FACTS_PATH = 'scripts/windowloss-facts-20261022.json';
const CHANNELS = ['veterans', 'armor', 'rerun-escalation', 'mantle-succession', 'other'];

function baseOf(policy) {
  return String(policy || '').replace(/-(armorydrive|vetwindow|stagemuster)$/, '');
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function scanCorpus(corpus, rel) {
  const dir = path.join(REPO, rel);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  return files.map(f => {
    const d = readJson(path.join(dir, f));
    return {
      corpus, file: f,
      seed: d.seed, policy: d.policy || '', arm: d.arm || null,
      base: baseOf(d.policy),
      days: d.days, endReason: d.endReason || null,
      vetsMax: d.w5vetsMax || 0, vetsEnd: d.w5vetsEnd || 0,
      wave5: d.wave5 ? 1 : 0,
      kills: (d.w4killRows || []).map(r => ({ day: r.day, mid: r.mid, byName: r.byName, via: r.via })),
      window: (d.w5vetsMax || 0) >= 2,
    };
  });
}

// Coarse attribution for windows without a DIAG census (stagemuster corpus:
// per-seed JSONs carry scalars + kill rows, no readiness census, no death rows).
function coarseWindow(obs) {
  const outcome = obs.wave5 === 1 ? 'opened' : (obs.vetsEnd < 2 ? 'killed' : 'held');
  const w = {
    id: null, rich: false,
    corpus: obs.corpus, file: obs.file, seed: obs.seed, base: obs.base,
    policy: obs.policy, days: obs.days, endReason: obs.endReason,
    vetsMax: obs.vetsMax, vetsEnd: obs.vetsEnd,
    outcome,
    fillDay: null, windowLengthDays: null,
    filledBy: obs.kills,
    fillNote: 'fill day unknown in this corpus (no readiness census); bar reached ' +
      obs.vetsMax + ' on the strength of these kill rows',
    blocker: 'unknown — no readiness census in this corpus',
    lossChannel: outcome === 'killed' ? 'veterans' : null,
    lossDetail: outcome === 'killed'
      ? 'veteran death inferred from vetsEnd(' + obs.vetsEnd + ') < vetsMax(' + obs.vetsMax +
        '); death detail unavailable — no death rows or census in this corpus'
      : null,
  };
  return w;
}

function analyze() {
  const facts = readJson(path.join(REPO, FACTS_PATH));

  // 1. Scan every corpus.
  const observations = [];
  const corpusCounts = {};
  for (const [corpus, rel] of Object.entries(CORPORA)) {
    const rows = scanCorpus(corpus, rel);
    corpusCounts[corpus] = rows.length;
    observations.push(...rows);
  }
  const windowObs = observations.filter(o => o.window);
  const byCorpusWindows = {};
  for (const o of windowObs) {
    (byCorpusWindows[o.corpus] = byCorpusWindows[o.corpus] || []).push(o);
  }

  // 2. Unique windows: the 4 DIAG-rich windows (fact sheet) + coarse stagemuster windows.
  //    Probe observations are duplicates of W1..W4 (same seed x base; the probe's
  //    control runs are macro-identical to the DIAG replay, the vetwindow runs
  //    byte-identical trajectories) — listed as replication, not new windows.
  const dupFiles = new Set();
  for (const w of Object.values(facts.windows)) {
    dupFiles.add(w.canonical);
    for (const d of w.duplicates) dupFiles.add(d);
  }
  const uniqueWindows = [];
  for (const [id, w] of Object.entries(facts.windows)) {
    uniqueWindows.push(Object.assign(
      { id, rich: true, corpus: 'armorydrive-confirm + DIAG' }, w));
  }
  let n = 5;
  for (const o of (byCorpusWindows['stagemuster'] || [])) {
    const cw = coarseWindow(o);
    cw.id = 'W' + (n++);
    uniqueWindows.push(cw);
  }
  uniqueWindows.sort((a, b) => a.id < b.id ? -1 : 1);

  // Probe-duplicate listing (replication evidence, excluded from the channel tally).
  const probeDupes = windowObs.filter(o => o.corpus === 'vetwindow-probe').map(o => ({
    file: o.file, seed: o.seed, base: o.base, policy: o.policy,
    days: o.days, endReason: o.endReason, vetsMax: o.vetsMax, vetsEnd: o.vetsEnd, wave5: o.wave5,
  }));

  // 3. Tally over UNIQUE windows.
  const tally = { opened: 0, killed: 0, held: 0 };
  const channels = {};
  for (const c of CHANNELS) channels[c] = 0;
  for (const w of uniqueWindows) {
    tally[w.outcome] = (tally[w.outcome] || 0) + 1;
    if (w.outcome !== 'opened' && w.lossChannel) {
      channels[w.lossChannel] = (channels[w.lossChannel] || 0) + 1;
    }
  }
  const killedN = tally.killed || 0;
  let dominant = 'no-dominant-channel';
  for (const c of CHANNELS) {
    if (channels[c] > killedN / 2) dominant = c;
  }

  // 4. Blocker consistency on fully-instrumented never-opened windows.
  let armorSoleDays = 0, instrumentedDays = 0;
  for (const w of uniqueWindows) {
    if (w.rich && w.outcome === 'killed' && w.blocker && w.blocker.windowDaysTotal) {
      instrumentedDays += w.blocker.windowDaysTotal;
      if (w.blocker.sole === 'armor') armorSoleDays += w.blocker.soleBlockerDays;
    }
  }

  const covered = uniqueWindows.length; // every unique window gets a table row
  const report = {
    instrument: 'windowloss-20261022 (DIAG re-analysis; no new sims)',
    corpora: CORPORA,
    corpusCounts,
    observationsScanned: observations.length,
    windowObservations: windowObs.length,
    windowObservationsByCorpus: Object.fromEntries(
      Object.entries(byCorpusWindows).map(([k, v]) => [k, v.length])),
    uniqueWindows: uniqueWindows.map(w => w.id),
    uniqueWindowCount: uniqueWindows.length,
    probeDuplicates: probeDupes,
    probeDuplicateCount: probeDupes.length,
    tally,
    channels,
    dominantLossChannel: dominant,
    armorSoleBlockerDays: armorSoleDays,
    instrumentedNeverOpenedDays: instrumentedDays,
    coverageRows: covered,
    coveragePct: uniqueWindows.length ? covered / uniqueWindows.length : 0,
    windows: uniqueWindows,
  };
  return report;
}

function mdTable(r) {
  const lines = [];
  lines.push('| Window | Seed x base (corpus) | Fill | Window | Blocked | Outcome | Loss channel |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const w of r.windows) {
    const fill = w.rich
      ? 'd' + w.fillDay + ': ' + w.filledBy.map(k => k.byName + ' d' + k.day + ' ' + k.mid + ' (' + k.via + ')').join('; ')
      : w.filledBy.map(k => k.byName + ' d' + k.day + ' ' + k.mid + ' (' + k.via + ')').join('; ') + ' — fill day unknown';
    const win = w.windowLengthDays === null ? 'unknown (no census)'
      : w.windowLengthDays === 0 ? '0d (opened on fill day)' : w.windowLengthDays + 'd (d' + w.windowDays[0] + '–d' + w.windowDays[1] + ')';
    const blocked = w.rich
      ? (w.blocker.sole === 'unknown' ? 'unknown (no census rows)'
        : w.blocker.windowDaysTotal
          ? w.blocker.sole + ' sole on ' + w.blocker.soleBlockerDays + '/' + w.blocker.windowDaysTotal + 'd'
          : w.blocker.sole + ' (transiently satisfied on fill day; window 0d)')
      : w.blocker;
    const chan = w.outcome === 'opened' ? '—'
      : w.lossChannel + (w.rich && w.contributing && w.contributing.length ? ' (+' + w.contributing.join(',+') + ')' : '');
    lines.push('| ' + w.id + ' | s' + w.seed + ' x ' + w.base + ' (' + w.corpus + ') | ' + fill +
      ' | ' + win + ' | ' + blocked + ' | ' + w.outcome + ' | ' + chan + ' |');
  }
  lines.push('');
  lines.push('Killed-window channel tally (unique windows, n=' + r.tally.killed + '): ' +
    CHANNELS.map(c => c + ' ' + r.channels[c]).join(', ') +
    ' → dominant: **' + r.dominantLossChannel + '**.');
  lines.push('Armor sole-blocker on fully-instrumented never-opened window-days: ' +
    r.armorSoleBlockerDays + '/' + r.instrumentedNeverOpenedDays + '.');
  lines.push('Probe duplicates (replication, excluded from tally): ' + r.probeDuplicateCount + ' observations.');
  lines.push('Coverage: ' + r.coverageRows + '/' + r.uniqueWindowCount + ' unique windows with table rows.');
  return lines.join('\n');
}

if (require.main === module) {
  const r = analyze();
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify(r, null, 1) + '\n');
  } else {
    process.stdout.write(mdTable(r) + '\n');
  }
}

module.exports = { analyze, mdTable, CORPORA, CHANNELS };
