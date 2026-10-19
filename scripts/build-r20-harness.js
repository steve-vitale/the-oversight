#!/usr/bin/env node
// build-r20-harness.js — clone journey-deepening-r19-20261019.js into
// journey-deepening-r20-20261019.js with the r20 modifications applied.
// R20 question: is the wave-3 unlock (day 25 + 4 wave-2 ledger kill points)
// reachable by a COMPETENT player in the deepening window (days 25-80)
// without kill-farming? R19's pilot exposed the facing/killing gap — seed
// 9202 faced 10 distinct wave-2 types but scored 1 kill point and never
// unlocked wave 3 in 102 days. The gate is Steve's design (bar calibrated
// 5->4, 2026-10-11); this run measures reachability, it does not move the
// gate. A second policy (deed-seeking: competent + patrols for encounters,
// never flees at fight start) isolates "a player who seeks fights" from
// competent's "fights only with advantage".
// R20 keeps the r19 driver (competent base, conversation corpus, death-aware
// stop, census, wave-2 content census) and REMOVES nothing but the need for
// PROBE_W3 — the probe stays env-gated and OFF, so the unlock is natural.
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14 — BINDING):
//   R1 (reachability, PRIMARY): fraction of seeds with wave 3 unlocked by
//     day 80. GO (reachable for competent play): >=3/8 competent seeds.
//     <3/8 = reachability failure — report to Steve with evidence (his call
//     whether the kills-only gate stays).
//   R2 (kill economy, report-only): mean wave-2 ledger kill points by day 80;
//     facing-vs-kill ratio per seed; unlock day distribution.
//   M6 (winnable carry): alive at day 100 on >=4/8 combined (r19: 2/4 pilot).
//   §14c co-primary (roster): villager (non-scholar) combat/monster deaths
//     per seed — the roster, not the scholar, carries the wave-2 wall.
//   M5 people check (report-only; dialogue lane is the social loop's lane).
//   INTERESTING-FINDING BAR: any seed unlocking before day 40 (early); any
//     seed with >=8 distinct types faced and 0 kills; kill sources — who
//     actually lands the ledger points (player vs villagers).
//   Seeds: fresh 9301-9304 competent pilot (timed; expand to 9305-9308 only
//     on GO-shaped signal), deed-seeking paired on identical seeds.
//     DAYCAP=100, death-aware stop (+10d tail max, never tick a dead village).
// Canon read: CANON.md, MONSTER-WAVES.md (2026-10-19 — wave-2/3 gate canon).
//   No new canon invented. The kills-only gate is Steve's; this run tests,
//   never redesigns.
// Usage: POLICY=competent SEEDS=9301,9302 node scripts/journey-deepening-r20-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'journey-deepening-r19-20261019.js');
const DST = path.join(ROOT, 'scripts', 'journey-deepening-r20-20261019.js');

let s = fs.readFileSync(SRC, 'utf8');

const HEADER = `// journey-deepening-r20-20261019.js -- DEEPENING leg R20: wave-3 kill-gate
// reachability for competent play.
// Base: master@e61bb5c8 (r19 expedition-atom fixes on master).
// R20 question: is the wave-3 unlock (day 25 + 4 wave-2 ledger kill points)
// reachable by a COMPETENT player in days 25-80 without kill-farming? R19's
// pilot exposed the facing/killing gap: 9202 faced 10 distinct wave-2 types
// but scored 1 kill point, never unlocking wave 3 in 102 days. The gate is
// Steve's design (bar 5->4, 2026-10-11) — this run MEASURES reachability,
// never moves the gate. Deed-seeking (competent + encounter patrols, never
// flees at fight start) isolates "a player who seeks fights" from competent's
// "fights only with advantage".
// PRE-REGISTER (2026-10-19, MEASUREMENT.md sections 9-12, 14 — BINDING):
//   R1 (PRIMARY): seeds with wave 3 unlocked by day 80. GO (reachable):
//     >=3/8 competent seeds. <3/8 = reachability failure -> Steve, with
//     evidence (his call on the kills-only gate).
//   R2 (report-only): mean w2 ledger points by day 80; facing-vs-kill ratio;
//     unlock-day distribution; who lands ledger points (player vs villagers).
//   M6 (winnable carry): alive at day 100 on >=4/8 combined (r19 pilot 2/4).
//   ROSTER (§14c co-primary): villager non-scholar combat/monster deaths.
//   M5 people check (report-only; dialogue lane is the social loop's lane).
//   INTERESTING: unlock before day 40; >=8 types faced with 0 kills.
//   Seeds: 9301-9304 competent pilot (expand 9305-9308 on GO-shaped signal);
//     deed-seeking paired identically. DAYCAP=100, death-aware stop.
// Canon: CANON.md, MONSTER-WAVES.md (2026-10-19). No new canon.
// Usage: POLICY=competent SEEDS=9301,9302 node scripts/journey-deepening-r20-20261019.js
`;

// 1. Replace the header block (everything up to 'use strict';)
s = s.replace(/^[\s\S]*?'use strict';\n/, HEADER + "'use strict';\n");

// 2. Naming
s = s.split('journey-deepening-r19-').join('journey-deepening-r20-');
s = s.split('journey-deepening-r19-POLICYX').join('journey-deepening-r20-POLICYX');

// 3. PROBE_W3 stays env-gated and defaults OFF — natural unlock measurement.
//    (No code change needed: r19 gates on PROBE_W3 === '1'.)

fs.writeFileSync(DST, s);
console.log('wrote', DST, s.length, 'bytes');
