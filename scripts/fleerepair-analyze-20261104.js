// fleerepair-analyze-20261104.js — turn-economy analyzer (arm sim-fleerepair-a).
// VERBATIM reuse of the tbfinish analyzer: turn classes, outcome classes,
// and the damage-ledger rule are unchanged by the round-1 pending buffer
// (pending turns are ordinary turn records with turnSeq 0). Re-exported
// rather than copied so the two analyzers cannot drift.
'use strict';
module.exports = require('./tbfinish-analyze-20261103');
