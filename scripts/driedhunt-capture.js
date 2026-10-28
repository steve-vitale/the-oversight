#!/usr/bin/env node
// driedhunt-capture.js — reuse adapter for sim-driedhunt-b (DIAG only).
//
// HISTORICAL NOTE: this module used to own the snapshot-diff wrapper
// on Game._removePantryKcal. Since sim-raidcapture-b (2026-10-27) that
// wrapper lives in scripts/stockdoors-capture.js as the folded
// 'remove-pantry-kcal' door, and this module is a thin adapter over
// the shared installer (installRemovePantryKcalCapture) — one wrapper,
// never two. The adapter preserves the driedhunt record shape
// ({day, caller, stack, asked, ret, items}) and snapshotStacks(), so
// existing consumers (scripts/sweep-driedhunt-b.js, the driedhunt
// corpora's readers) keep working unchanged. The stockdoors
// directRecords view and this takes view are the SAME events viewed
// twice: a ledger must count one view, never sum both.
//
// Installed AFTER loadGame and BEFORE setupGame, alongside the reused
// captures (which it does NOT modify). It writes ONLY to the caller's
// array. No Game.state write, no RNG consumption, no say/log write.
// Stack traces are read-only diagnostics (no state, no RNG).
'use strict';

const { installRemovePantryKcalCapture } = require('./stockdoors-capture');

function installDriedhuntCapture(Game) {
  return installRemovePantryKcalCapture(Game);
}

module.exports = { installDriedhuntCapture };
