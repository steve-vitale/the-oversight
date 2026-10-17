#!/usr/bin/env node
// attrcensus-classify-20261017.js — pure taxonomy classifier for the
// sim-attrcensus diagnostic (flesh-out loop, axis scale-onramp, run
// fleshout-20261017T1102Z). No game dependency, no I/O, no side effects —
// safe to require anywhere. Shared by the proof test
// (scripts/test-attrcensus-20261017.js), the re-sweep
// (scripts/sweep-attrcensus-20261017.js), and the existing-data analysis.
//
// Taxonomy (pre-registered in evidence/2026-10-17/sim-attrcensus.md —
// fixed, never re-scored):
//   (a) ATTRIBUTION-LOSS — monster died by the trick, channel dropped it:
//       a1 tag-drop  — won/routed, trick-bearing monster died, perfs logged,
//                      but no tagged waveKillLog entry (ledger ran, tag missing).
//       a2 path-drop — trick-bearing monster died but no waveKillLog entry at
//                      all ('lost'/'fled' forfeit the per-kill ledger; pyrrhic).
//   (b) GENUINE NON-LETHAL — trick fired, monster not killed:
//       b1 performer-died — scholar died, fight lost, monster alive at tbEnd.
//       b2 target-fled    — routed/dismissed, trick-bearing monsters fled.
//       b3 target-survived— monster alive at fight end, no kill within ±1d.
//   (c) OTHER:
//       c2 cross-fight-kill — waveKillLog entry in ±1d with EMPTY trick: the
//                      monster died in a different encounter, not a trick kill.
//   instrument-error — tagged entry in ±1d but the join says unattributed
//                      (contradiction; loud, counts against the PRIMARY).
//   not-in-universe — no perfs (the c1 reverse-artifact is counted by the
//                      analysis, not by this classifier).
'use strict';

// classifyExtended(f):
//   f = { mid, kind, day, result, pAlive, nPerfs,
//         midDead, midAlive,                       // trick-bearing fighters of mid at tbEnd
//         wklSame: [{d, trick, by, via}],          // waveKillLog, same mid, |d-day|<=1
//         killAttributed: bool }                   // the ±1d non-empty-trick join
// Returns { cls, sub, note }. Deterministic: same input -> same output.
function classifyExtended(f) {
  if (!f || (f.nPerfs | 0) <= 0) return { cls: 'not-in-universe', sub: '', note: 'no perfs logged' };
  const wklSame = f.wklSame || [];
  const tagged = wklSame.filter(e => e && e.trick);
  const untagged = wklSame.filter(e => !(e && e.trick));
  if (!f.killAttributed && tagged.length > 0) {
    return { cls: 'instrument-error', sub: '', note: 'tagged waveKillLog entry in ±1d but join reports unattributed' };
  }
  if ((f.midDead | 0) > 0) {
    if (f.result === 'won' || f.result === 'routed') {
      return { cls: 'a1', sub: 'tag-drop', note: 'per-kill ledger ran on ' + f.result + ' with perfs logged; tagged entry missing' };
    }
    return { cls: 'a2', sub: 'path-drop', note: 'monster died but result=' + f.result + ' forfeits the per-kill ledger (pyrrhic/design-forfeit)' };
  }
  if (untagged.length > 0) {
    return { cls: 'c2', sub: 'cross-fight-kill', note: untagged.length + ' untagged kill(s) in ±1d from other encounter(s); not a trick kill' };
  }
  if (f.result === 'lost') return { cls: 'b1', sub: 'performer-died', note: 'scholar dead, monster alive at tbEnd' };
  if (f.result === 'routed') return { cls: 'b2', sub: 'target-fled', note: 'monsters routed, none of this mid died in the fight' };
  return { cls: 'b3', sub: 'target-survived', note: 'result=' + f.result + '; monster alive at fight end, no kill ±1d' };
}

// classifyExistingRow(r): reduced classifier for the trickfunnel per-seed
// rows (no fighter-mortality data there). 'lost' rows carry a pyrrhic flag —
// the re-sweep's mortality snapshot resolves whether any were a2.
function classifyExistingRow(r) {
  if (!r || !r.performed || r.kill_attributed) return { cls: 'not-in-universe', sub: '', note: '' };
  if (r.result === 'lost') {
    return { cls: 'b1', sub: 'performer-died', pyrrhicFlag: true,
      note: 'scholar dead; fighter mortality not in existing data — pyrrhic (a2) unresolved here, re-sweep measures the rate' };
  }
  if (r.result === 'routed' || r.dismissed) {
    return { cls: 'b2', sub: 'target-fled',
      note: 'in-fight kill ruled out by channel mechanics: the ledger runs on routed, perfs imply non-empty trickSummaryFor, so a dead mid would have joined' };
  }
  return { cls: 'b3', sub: 'target-survived', note: 'result=' + r.result };
}

module.exports = { classifyExtended: classifyExtended, classifyExistingRow: classifyExistingRow };
