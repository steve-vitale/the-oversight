# journey-scale r65 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261101T0045Z (scheduled 23:45 CDT 2026-10-31; lock created 04:56:54Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a failed run does not advance the rotation).
Note on the repeated leg: r64's note records the same "still reads 3"
anomaly, but THIS run's read is explained, not anomalous: HEAD is
fa2c896d5 journey-deepening r78 (committed 04:51:05Z) and the rotation
file's mtime is 04:52:41Z — the deepening closeout's 2→3 write, 96
seconds after its merge commit. The 3 this run reads is fresh and
queue-correct. This run still verifies the 3→0 write by reading the
file back at closeout.
**Base:** master@fa2c896d5 at branch creation (branch journey-scale-r65
verified at fa2c896d5 before any worktree existed; worktree
registration itself was delayed by the intermittent .git-write EPERM
flap — see run note).
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q1 is measurement, Q2 is a read-only diagnostic + code
read, Q3 reads transcripts, Q4 is counts.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
drivers read only engine-exposed state, as before.

## Infrastructure note (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Worktree registration hit the intermittent EPERM flap** (same class
  as the 2026-10-23 lesson, scoped to ~/workspace/the-scattering/.git/):
  first register failed on checkout writes, second failed with
  "could not write to '.git/worktrees/journey-scale-r65/locked':
  Operation not permitted". The branch journey-scale-r65 already exists
  in refs at fa2c896d5 (verified via git rev-parse); no ref surgery
  was attempted. Registration retried via probe-gated loops and then
  a register-every-attempt loop; attempt 12 succeeded at 05:24:28Z
  (11 fast failures on the same locked-write EPERM in between; a
  sibling lane-B tree, journey2-crisis-r91, registered successfully
  during the same window, confirming the flap is intermittent
  per-call, not a hard outage). Heartbeat verified landed in the
  registry immediately after registration (05:24:47Z) plus a
  10-minute background heartbeat loop for the whole run.
- **Range since r64's final base (cc67af1b7..HEAD, src/js + src/data):**
  exactly ONE file — betrayal.js (+12, 785cef89c journey-social r78:
  the NO-SHARED-WORDS gate — case interrogation menu options
  press/site/witnesses/investigate/moot/etc. are no longer offered in
  a nonverbal conversation with no interpreter present; ambush
  survival and invitation picks untouched; with an interpreter the
  gate opens). No generation, loot, wave, table, pellet, or hierarchy
  code changed. So **parity vs r64 IS a live question this run**, with
  any divergence expected to localize to nonverbal betrayal menus —
  and the quad's people-check transcripts are exactly where such a
  menu change could surface.

## Standing context (read before scoring)
- r64 (final base cc67af1b7): quad parity FAILED vs r63 on exactly one
  seed (85003 diverged via the twoblow field-fight change; 85001,
  85002, 85004 byte-identical). Quad: 85001 SCATTERED d28, 85002 ALIVE
  d181, 85003 DEAD d154 lesser arc4 waiting+announced, 85004 DEAD d169
  lesser arc4 waiting+announced. Lesser seat 2/4, full seat 0/4, wave 5
  reached 0/4. Weapon-craft lines 0/4 seeds, deadfall-duty lines 0/4
  seeds (fourth consecutive 0/4 for both duties, r61–r64).
- r64 Q2 closed the bank story: every bank is a feast-night combat use
  (8/8 COMBAT, 0 HEALING); banking is gated by feast-night combat
  opportunity, not by feasting. Pellet story closed in r63. Neither is
  re-tested this run.
- r64 people check: 5 of 6 transcripts fully real; 1 partial blemish
  (85003 d90 Olivia betrayal accept → post-accept aphorism loop:
  three "Tell me more" prompts, three stoic one-liners, no thread, no
  resolution/plant/owe).
- "Wave 5 reached" counts ONLY census maxWave >= 5 (r60 definition,
  kept). End states split ALIVE / SCATTERED / DEAD (r61 definition,
  kept). Lesser-seat bars (table.js): w1>=4, w2>=4, w3>=3,
  contests>=2, crises>=2, rank regional+, stage>=2, foodDeeds
  (sentimentTaught AND feastSurgeUsed), scored at CENSUS.

## Leg questions (binding)
1. **QUAD-PARITY-R65:** same 4 seeds (85001–85004), control picker,
   policy scalecourt-nogate UNCHANGED, DAYCAP 180, death-aware stop.
   Driver = r64 driver, labels/EVIDIR only
   (scripts/journey-scale-r65-20261031.js).
   PILOT GATE (r62's revised gate, kept): seed 85001 runs first; if
   it crashes or its capture is empty, STOP. Pilgrimages==0 is NOT
   a stop condition (a day-28 scatter cannot reach pilgrimages).
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r64. ANY scalar difference triggers r52's
   first-divergence audit (capture diff vs r64, first differing
   line class, weapon-craft-line count, deadfall-line count) before
   any attribution. Capture diffs are expected to be 0 lines
   outside nonverbal betrayal-menu lines; a scalar difference with
   no capture divergence is still reported as a divergence, not
   explained away.
2. **DUTY-GATE (why weapon-craft + deadfall duties never fire):**
   diagnostic, measurement only. From the Q1 quad captures plus a
   code read of the duty-assignment paths, report per duty: (a) the
   count of assignment/offer lines on each seed, (b) the code gate
   (function + condition) that blocks it on this policy path, (c)
   the classification: POLICY (the picker never offers it) vs
   PRECONDITION (offered, never taken, precondition unmet) vs
   MISSING (no assignment path exists on this path at all).
   Instrument: a COPY of the r65 driver plus ONE read-only daily
   instrument (the village weaponCraft knowledge map, the
   weaponCraftCd last-attempt-day map, and the assignments map's
   deadfall-task entries, plus roster size and player-at-Haven) —
   no engine input touched. PURITY GATE
   (same-base, as r64 Q2): duty driver vs r65 driver on quad seeds
   85001–85004 must give 0-line capture diffs and identical census
   scalars. ANY diff → STOP, do not score duties, report instrument
   impurity as the finding.
   Verdict rule, decided BEFORE reading results: the classification
   is reported as found, even if it is "no assignment path exists".
   No fix landing follows from Q2 alone; any fix is a next-run item
   with its own proof test. The deadfall arm is diagnosis only on
   the scalecourt-nogate path — the loop-B deadfall staffing policy
   is NOT imported or run here (cross-lane package).
3. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58), Dale
   gossip tail (r62/r63 blemish), Olivia post-accept aphorism loop
   (r64 blemish).
4. **DUTY REACHABILITY (counts, report-only):** per Q1 seed, count
   weapon-craft lines (capture lines matching /spent the afternoon
   at the workbench and made/) and deadfall-duty lines (/deadfall/i
   with the duty line "gathers deadfall —" split out). r61–r64 all
   0/4; a nonzero count here is a finding, a fifth 0/4 is
   continuity.

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class (ALIVE / SCATTERED / DEAD), the weapon-craft-line
count, and the deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r65
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
