# journey-scale r64 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261101T0045Z (scheduled 19:45 CDT 2026-10-31; lock created 00:43:57Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57–r63 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r63's note promised the 3→0 write at its
closeout, and its landing section claims it, but the rotation file
still read 3 at this run's start (mtime Oct 31 23:58) — the same
anomaly r61–r63 recorded. Staying on scale is queue-correct under
the body (play THIS run's leg as read). This run writes 0 on
success and verifies the write by reading the file back at
closeout; if it reverts again, that is flagged loudly as a
system issue, not assumed done.
**Base:** master@daf9e7c76 at worktree creation (worktree slug
journey-scale-r64 — the plain journey-scale slug was again a
stale merged branch, this time at 4c92bbb04 journey-deepening r75,
and was deleted after an ancestor check; a fresh slug avoids
touching it, per r62/r63 precedent).
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q1 is measurement, Q2 is a read-only instrument re-run
with a same-base purity gate, Q3 reads transcripts, Q4 is counts.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
drivers read only engine-exposed state, as before.

## Infrastructure note (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Worktree registration slow, not failed:** register for the plain
  journey-scale slug took ~80s, then a fresh journey-scale-r64
  registration took ~6 minutes (its checkout ran at high CPU
  throughout, as r63 recorded). No ref surgery was attempted.
  The stale plain branch was deleted only after
  `git merge-base --is-ancestor 4c92bbb04 master` passed.
- **Heartbeat:** manual heartbeat at registration verified landed
  (00:55:16Z) plus a 10-minute background loop with its log in
  /tmp/journey-scale-r64-hb.log.
- **Range since r63's measurement base (7daa1e3d8..HEAD, src/js + src/data):**
  exactly TWO files — build.js (version stamp) and fieldFights.js
  (+68, 695c1b0b1 sim-twoblow-a: two-blow finish window behind the
  60% HP gate, wave-3+ only, plus the committed-finish 40% floor).
  No generation, loot, wave, table, or pellet code changed. So
  unlike r62-vs-r61 (loot-pool re-roll), **parity vs r63 IS a live
  question this run**, with the divergence, if any, expected to
  localize to wave-3+ field fights. The commit comment claims
  wave-1/2 fights are byte-identical to baseline — that claim is
  tested by the capture diffs, not assumed.

## Standing context (read before scoring)
- r63 (base 7daa1e3d8): quad parity PASSED vs r62 (capture diffs
  0 lines, identical census scalars on all four seeds; the
  topicLabels change surfaced nowhere). Quad: 85001 SCATTERED d28,
  85002 ALIVE d181, 85003 ALIVE d181, 85004 DEAD d169 lesser arc4
  waiting+announced. Lesser seat 1/4, full seat 0/4, wave 5 reached
  0/4. Weapon-craft lines 0/4 seeds, deadfall-duty lines 0/4 seeds
  (third consecutive 0/4 for both duties).
- r63 Q2 closed the pellet story: mantle pass PROVEN — every
  pellet-offline event in both wide arms (10/10) falls on a
  scholar-change day. r63's named next instrument, if the pellet
  story is pursued further: trace the bank itself (which
  feast/combat use sets feastSurgeUsed under the banking bearer),
  since the flag's setter is still untraced. That instrument is
  Q2 of this run.
- "Wave 5 reached" counts ONLY census maxWave >= 5 (r60 definition,
  kept). End states split ALIVE / SCATTERED / DEAD (r61 definition,
  kept). Lesser-seat bars (table.js): w1>=4, w2>=4, w3>=3,
  contests>=2, crises>=2, rank regional+, stage>=2, foodDeeds
  (sentimentTaught AND feastSurgeUsed), scored at CENSUS.
- feastSurgeUsed setter (code, read before scoring): feastBuff.js
  _spendFeastedPower — first real combat use (an ability resolved
  while feasted and in combat, via the tbDamage hook, source in
  prog.feastSurgeBy) or landed bonus healing spends the armed
  devotion once, sets prog.feastSurgeUsed, clears prog.feastSurge.
  A feast that warms no blades marks nothing. So the bank event
  is a feasted combat use or a feasted bonus heal, never a feast
  alone — Q2 classifies which, per bank, from the bank day's
  day-attributed feast/surge/devotion lines plus feastSurgeBy.

## Leg questions (binding)
1. **QUAD-PARITY-R64:** same 4 seeds (85001–85004), control picker,
   policy scalecourt-nogate UNCHANGED, DAYCAP 180, death-aware stop.
   Driver = r63 driver, labels/EVIDIR only
   (scripts/journey-scale-r64-20261031.js).
   PILOT GATE (r62's revised gate, kept): seed 85001 runs first; if
   it crashes or its capture is empty, STOP. Pilgrimages==0 is NOT
   a stop condition (r62/r63: a day-28 scatter cannot reach
   pilgrimages).
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r63. ANY scalar difference triggers r52's
   first-divergence audit (capture diff vs r63, first differing
   line class, weapon-craft-line count, deadfall-line count) before
   any attribution. Capture diffs are expected to be 0 lines
   outside wave-3+ fight lines; a scalar difference with no
   capture divergence is still reported as a divergence, not
   explained away.
2. **BANK-TRACE (feastSurgeUsed setter trace, measurement only):**
   a COPY of the r64 driver plus ONE read-only daily instrument
   (scripts/journey-scale-r64-bank-20261031.js): each day record
   feastSurge (state.scholar.prog.feastSurge), feastSurgeUsed,
   feastSurgeBy, scholarVid (Game.villagerId), scholarName
   (displayName), arc, seat; plus day-attributed capture lines
   matching /feast|surge|devotion/i. No engine input is touched;
   the instrument reads only.
   PURITY GATE (same-base, as r62/r63 corrected): bank driver vs
   r64 driver on quad seeds 85001–85004 must give 0-line capture
   diffs and identical census scalars. ANY diff → STOP, do not
   score banks, report instrument impurity as the finding.
   If the gate passes, run the instrument on wide-band seeds
   85101–85108, CURRENT arm only (nofetch arm is NOT re-run this
   run: the pellet story it served is closed, and the patch
   machinery's cost exceeds the bank question's need).
   Verdict rule, decided BEFORE reading results: for each seed/arm
   that banks, the bank is classified COMBAT (feastSurgeBy set,
   bank-day lines show a feasted combat use) or HEALING (bank-day
   lines show landed bonus healing, feastSurgeBy 'p') or
   UNCLASSIFIED (flag flips with no bank-day feast line — reported
   as unclassified, not guessed). Report per seed/arm: bank day
   or never, scholarVid/name at bank, feastSurgeBy, class, arc at
   census. No fix landing follows from Q2 alone.
3. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58), Dale
   gossip tail (r62/r63 blemish).
4. **DUTY REACHABILITY (counts, report-only):** per Q1 seed, count
   weapon-craft lines (capture lines matching /spent the afternoon
   at the workbench and made/) and deadfall-duty lines (/deadfall/i
   with the duty line "gathers deadfall —" split out). r61+r62+r63
   all 0/4; a nonzero count here is a finding, a fourth 0/4 is
   continuity.

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class (ALIVE / SCATTERED / DEAD), the weapon-craft-line
count, and the deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r64
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
