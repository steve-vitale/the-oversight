// policies/winvariants.js — win-stats-deep campaign variants (2026-10-12).
// Scripts-only policy work; NO src/ changes. Two new arms:
//   primeseek: PRIMACY-FIRST scale strategy — propose as primary (LEAD road),
//     walk away from subordinate counters, bid primacy aggressively on every
//     link Haven doesn't head, never pay tribute. Tests whether the lead/
//     conquest road reaches the table vs winseek's belong/subordinate road.
//   cautseek: CAUTIOUS fighter — same win-seeking everywhere, but engages
//     only up to 2x HP (vs 3.5x), avoids wave-2+ while hurt, flees at 40%
//     HP (vs 30%). Tests whether caution beats boldness for win rate.
'use strict';
const { winseek } = require('./winseek');

const primeseek = Object.assign({}, winseek, {
  id: 'primeseek',
  desc: 'win-seeking + PRIMACY-FIRST: propose as primary, walk subordinate counters, bid primacy, never tribute',
  daily(G, ctx) { ctx._primacyFirst = true; return winseek.daily(G, ctx); },
});

const cautseek = Object.assign({}, winseek, {
  id: 'cautseek',
  desc: 'win-seeking + CAUTIOUS fighter: 2x HP engage cap, flees earlier',
  fight(G, ctx) { ctx._cautious = true; return winseek.fight(G, ctx); },
});

module.exports = { primeseek, cautseek };
