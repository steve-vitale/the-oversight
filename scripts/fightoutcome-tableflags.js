#!/usr/bin/env node
// fightoutcome-tableflags.js — tableWaiting / tableDone split for the
// fight-outcome recorder (sim-tabledone-split, Loop A 20261103, axis
// scale-onramp). The landed driver collapsed the end-of-run table
// latch into one field (`table = tableWaiting || tableDone`), so
// tableDone could not be reported as a distinct flag from any corpus
// it wrote (evidence/2026-11-02/sim-scale-onramp-round-0011.md).
//
// This module is the split, and nothing else. It is instrument only:
// it reads two booleans the game already sets independently —
//   tableWaiting: invitation pending, seat not yet taken
//     (progression.js, table.js re-offer path);
//   tableDone: seat taken, the table sequence sat
//     (table.js tableScene sitting + win-day-floor re-offer) —
// and reports them separately. It never infers done-ness from the
// latch, from `won`, or from any transcript line: where the split
// fields are absent from an old record, the split is UNKNOWN, not
// guessed (see splitFromLegacy).
//
// Pure functions, no game import, no I/O: unit-tested by
// scripts/test-tabledone-split-20261103.js.
'use strict';

// End-of-run extraction from a live progState() object. Missing or
// non-object input yields all zeros (the driver's old behavior on a
// progState failure was table=0 plus a recorded error, preserved by
// the driver wrapping this call in the same try/catch).
function tableFlags(pg) {
  if (!pg || typeof pg !== 'object') return { tableWaiting: 0, tableDone: 0, table: 0 };
  const tableWaiting = pg.tableWaiting ? 1 : 0;
  const tableDone = pg.tableDone ? 1 : 0;
  return { tableWaiting: tableWaiting, tableDone: tableDone, table: (tableWaiting || tableDone) ? 1 : 0 };
}

// Per-record split resolution for the analyzer, honoring backward
// compatibility WITHOUT mislabeling old corpora:
//   - split fields present (0/1): use them as recorded.
//   - legacy record, table === 0: neither state held, so both are 0
//     (the OR being false is the one case where the split IS
//     recoverable from the latch).
//   - legacy record, table === 1, or no table field at all: the
//     split is unrecoverable — return null for both, never a guess.
//     Callers count such records as unknown, never as 0.
function splitFromLegacy(rec) {
  if (!rec || typeof rec !== 'object') return { tableWaiting: null, tableDone: null };
  const hasW = rec.tableWaiting === 0 || rec.tableWaiting === 1;
  const hasD = rec.tableDone === 0 || rec.tableDone === 1;
  if (hasW && hasD) return { tableWaiting: rec.tableWaiting, tableDone: rec.tableDone };
  if (rec.table === 0) return { tableWaiting: 0, tableDone: 0 };
  return { tableWaiting: null, tableDone: null };
}

module.exports = { tableFlags, splitFromLegacy };
