#!/usr/bin/env node
// test-killdisc-layer-20261018.js — INFO-SKIP.
//
// The kill-discipline layer (scripts/policies/killdisc.js) was KILLED AT
// THE DIAGNOSTIC GATE on 2026-10-18 and deleted zero-trace per the kill
// protocol: the stage-1 diagnostic (16 runs, 44 wave-3 kills) measured
// companion damage-share 1.5% vs kill-share 0.0% — only 5/44 killing
// fights had ANY companion damage, so even perfect conversion caps at
// ~9-11% kill-share, below the pre-registered PRIMARY (≥15%, bar +8pp).
// The base channel has no companion damage to convert; the binding
// constraint is companion ABSENCE from wave-3 killing fights, not
// kill-securing. See evidence/2026-10-18/sim-killdisc.md.
//
// This stub keeps the proof-test name resolvable and exits 0 so the
// green list stays green. The layer's D0/D1/D2 proofs passed 20/20 before
// the kill (recorded in the evidence file); the layer itself is gone.
'use strict';
console.log('INFO-SKIP test-killdisc-layer-20261018: kill-discipline layer killed at the diagnostic gate (2026-10-18) — deleted zero-trace. See evidence/2026-10-18/sim-killdisc.md.');
process.exit(0);
