// vetfinish-instrument-20261109.js — sim-vetfinish-b harvest instrument.
// The constructed wall-delivery instrument's harvest half: reads the
// pre-existing corpora (grind, finishersize pilot + adopt, vetfinish
// before-leg) and returns the observed below-break / near-tail meeting
// shapes the constructed legs re-drive through the real engine.
// Pure functions over committed JSON; no sims, writes nothing.
// Usage: node scripts/vetfinish-instrument-20261109.js  (prints the harvest)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

function readCorpus(dir, prefix) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.indexOf(prefix) === 0 && x.endsWith('.json'); })) {
    try { out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) { /* skip unreadable */ }
  }
  return out;
}

function w4fieldRows(objs) {
  const rows = [];
  objs.forEach(function (o) {
    (o.fieldFights || []).forEach(function (r) { if ((r.wave | 0) >= 4) rows.push(r); });
  });
  return rows;
}

function harvestShapes(repo) {
  repo = repo || REPO;
  const grind = readCorpus(path.join(repo, 'evidence', '2026-11-06', 'perseed-grind-a'), 'grind-');
  const fsPilotB = readCorpus(path.join(repo, 'evidence', '2026-11-06', 'perseed-finishersize-a'), 'fs-');
  const fsAdopt = readCorpus(path.join(repo, 'evidence', '2026-11-07', 'perseed-finishersize-adopt-a'), 'fs-');
  // pilotAdopt counts DISTINCT meetings: baseline legs only. Baseline and
  // armed legs run identical seeds, so counting both legs double-counts
  // every meeting (the 2 pilot meetings would read as 4).
  const vetBefore = readCorpus(path.join(repo, 'evidence', '2026-11-09', 'perseed-vetfinish-b'), 'fs-')
    .filter(function (o) { return String(o.run || '').indexOf('vetfinish-before') >= 0; });

  const gRows = w4fieldRows(grind);
  const vbRows = w4fieldRows(vetBefore);
  const paRows = w4fieldRows(fsPilotB.concat(fsAdopt).filter(function (o) {
    return String(o.run || '').indexOf('baseline') >= 0;
  }));

  function belowBreak(rows) {
    return rows.filter(function (r) { return r.entryFrac != null && r.entryFrac < 0.15; });
  }
  function shape(r) {
    return { day: r.day, mid: r.mid, entryHp: r.entryHp, entryMaxHp: r.entryMaxHp,
      entryFrac: r.entryFrac, contactHp: r.contactFinishBeastHp, contactDmg: r.contactFinishDmg,
      outcome: r.outcome, rounds: r.rounds, mDealt: r.mDealt, fsKind: r.committedFinishKind || null };
  }
  return {
    grind: {
      w4fieldRows: gRows.length,
      w4fieldKills: gRows.filter(function (r) { return r.outcome === 'vKill'; }).length,
      belowBreak: belowBreak(gRows).map(shape),
      contactAttempted: gRows.filter(function (r) { return r.contactFinishAttempted; }).map(shape),
      nearTailExits: gRows.filter(function (r) {
        return r.mHpLeftFrac != null && r.mHpLeftFrac >= 0.15 && r.mHpLeftFrac < 0.30 && (r.mHpLeft | 0) > 0;
      }).map(shape),
    },
    vetfinishBefore: {
      w4fieldRows: vbRows.length,
      w4fieldKills: vbRows.filter(function (r) { return r.outcome === 'vKill'; }).length,
      belowBreak: belowBreak(vbRows).map(shape),
      contactAttempted: vbRows.filter(function (r) { return r.contactFinishAttempted; }).map(shape),
      noCommitReasons: (function () {
        const o = {};
        vbRows.forEach(function (r) { if (r.fsNoCommitWhy) o[r.fsNoCommitWhy] = (o[r.fsNoCommitWhy] || 0) + 1; });
        return o;
      })(),
      fsCommits: vbRows.filter(function (r) { return r.fsCommitMhp != null; }).length,
    },
    pilotAdopt: {
      w4fieldRows: paRows.length,
      belowBreak: belowBreak(paRows).map(shape),
    },
  };
}

if (require.main === module) {
  console.log(JSON.stringify(harvestShapes(), null, 2));
}
module.exports = { harvestShapes: harvestShapes, readCorpus: readCorpus, w4fieldRows: w4fieldRows };
