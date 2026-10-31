# journey-scale r63 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261031T1950Z (scheduled 14:45 CDT 2026-10-31; lock created 19:50:58Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(r57–r62 discipline: a failed run does not advance the rotation).
Note on the repeated leg: r62's note promised the 3→0 write at its
closeout, but the rotation file still read 3 at this run's start —
the same anomaly r62 recorded about r61, and r61 about r60. Staying
on scale is queue-correct under the body (play THIS run's leg as
read). This run writes 0 on success and records the anomaly here
rather than assuming the earlier write happened.
**Base:** master@7daa1e3d8 at worktree creation (worktree slug
journey-scale-r63 — the plain journey-scale slug is a stale merged
branch left in place since r62's EPERM flap; a fresh slug avoids
touching it).
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q1 is measurement, Q2 is a read-only instrument re-run
with a same-base purity gate, Q3 reads transcripts, Q4 is counts.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
drivers read only engine-exposed state, as before.

## Infrastructure note (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Worktree registration slow, not failed:** `git worktree add` for
  journey-scale-r63 took ~5 minutes (its `git reset --hard` checkout
  ran at high CPU the whole time) before succeeding. No ref surgery
  was attempted. Heartbeat verified landed after registration
  (19:57:24Z) plus a 10-minute background loop with its log in goal
  hidden_files (journey-scale-r63-heartbeat.log).
- **Range since r62's measurement base (47162b801..HEAD, src/js + src/data):**
  exactly TWO files — build.js (version stamp) and conversation.js
  (+44/−4, dbce3829a journey-establishment r68: want-thread
  topicLabels name the thing — goal want-phrases, request via
  want/need, secret as confided, seek_taken mapped). No generation,
  loot, wave, table, or pellet code changed. So unlike r62-vs-r61
  (loot-pool re-roll), **parity vs r62 IS a live question this run**,
  with one named presentation exception below.

## Standing context (read before scoring)
- r62 (base 47162b801): quad descriptive (parity N/A — base re-rolled
  generation, first divergence at line 6, keepsake swap). Quad:
  85001 SCATTERED d28, 85002 ALIVE d181, 85003 ALIVE d181, 85004 DEAD
  d169 lesser arc4 waiting+announced. Lesser seat 1/4, full seat 0/4,
  wave 5 reached 0/4. Weapon-craft lines 0/4 seeds, deadfall-duty
  lines 0/4 seeds.
- r62 Q2/Q3 findings carried forward: (a) arc-gate decomposition —
  foodDeeds on 4 divergent arms, w3 breadth on 2, one tick-lag;
  (b) simple pellet-order hypothesis REFUTED; true predictor on
  that band: a surge EVER banked (all 8 arc4 arms banked; 7/8 arc3
  arms never banked; the banked arc3 arm misses w3 alone);
  (c) three pellet-before-bank arc4 cases (85101C, 85107C, 85102N)
  where the pellet went OFFLINE before the surge was banked — the
  mantle-pass explanation, INFERRED from the flag, not proven.
  r62's named next instrument: record the scholar id at each pellet
  transition, so a mantle pass is proven rather than inferred.
  That instrument is Q2 of this run.
- "Wave 5 reached" counts ONLY census maxWave >= 5 (r60 definition,
  kept). End states split ALIVE / SCATTERED / DEAD (r61 definition,
  kept). Lesser-seat bars (table.js): w1>=4, w2>=4, w3>=3,
  contests>=2, crises>=2, rank regional+, stage>=2, foodDeeds
  (sentimentTaught AND feastSurgeUsed), scored at CENSUS.

## Leg questions (binding)
1. **QUAD-PARITY-R63:** same 4 seeds (85001–85004), control picker,
   policy scalecourt-nogate UNCHANGED, DAYCAP 180, death-aware stop.
   Driver = r62 driver, labels/EVIDIR only
   (scripts/journey-scale-r63-20261031.js).
   PILOT GATE (r62's revised gate, kept): seed 85001 runs first; if
   it crashes or its capture is empty, STOP. Pilgrimages==0 is NOT
   a stop condition (r62: a day-28 scatter cannot reach pilgrimages).
   Verdict rule, decided BEFORE reading results: report census
   scalars per seed vs r62. ANY scalar difference triggers r52's
   first-divergence audit (capture diff vs r62, first differing
   line class, weapon-craft-line count, deadfall-line count) before
   any attribution. Capture diffs are expected to be 0 lines; the
   ONE named exception is transcript-label wording from dbce3829a
   (topicLabel strings: 'that taken person', 'what they confided',
   'wanting <goal want>', ask_favor need labels such as 'that food
   share', and the 'their request' fallback) — such diffs, and only
   such diffs, are classified as presentation, not sim divergence.
   A scalar difference with no capture divergence outside that
   class is still reported as a divergence, not explained away.
2. **PELLET-TIMING-V2 (scholar-id instrument, measurement only):**
   a COPY of the r63 driver plus ONE read-only daily instrument
   (scripts/journey-scale-r63-pellet-20261031.js): each day record
   pelletOnline (fusionReactorOnline), feastSurgeUsed
   (state.scholar.prog.feastSurgeUsed), sentimentTaught, arc, seat,
   PLUS scholarVid (Game.villagerId), scholarName (displayName),
   holderVid + holderWho (state.fusionReactorHolder). No engine
   input is touched; the instrument reads only.
   PURITY GATE (same-base, as r62 corrected): pellet driver vs r63
   driver on quad seeds 85001–85004 must give 0-line capture diffs
   and identical census scalars. ANY diff → STOP, do not score
   timing, report instrument impurity as the finding.
   If the gate passes, run the instrument on wide-band seeds
   85101–85108, BOTH arms (current; nofetch = the r62 temporary
   worktree-only patch neutralising vesselStashFetch +
   vesselArmorFetch in villager-build.js, reverted with
   `git checkout -- src/js/villager-build.js` immediately after
   each nofetch seed, verified `git diff -- src/js/` 0 lines).
   Verdict rule, decided BEFORE reading results: for each of the
   three r62 pellet-before-bank arc4 cases (85101C, 85107C, 85102N),
   the mantle-pass explanation is PROVEN only if the daily record
   shows scholarVid changing (a new mantle bearer) on or before
   the pellet-offline day AND the surge banked under the new
   scholarVid; otherwise the case is reported as UNPROVEN, not as
   a pass. Report per seed/arm: pellet-install day, pellet-offline
   day(s), scholarVid at install / at offline / at bank, bank day,
   order class, arc at census. No fix landing follows from Q2 alone.
3. **PEOPLE CHECK (sense law):** read the Q1 quad transcripts in
   full (driver's d90/d120 talks). Judge meaning, coherence,
   relevance, consequences — never just exchange counts. Known
   blemish classes to check for recurrence (not re-scored as new):
   Irving one-sitting displacement, Thabo withdrawal-only talk,
   Meera gossip tail, Boris nod-loop (untested since r58), Dale
   gossip tail (r62 blemish).
4. **DUTY REACHABILITY (counts, report-only):** per Q1 seed, count
   weapon-craft lines (capture lines matching /spent the afternoon
   at the workbench and made/) and deadfall-duty lines (/deadfall/i
   with the duty line "gathers deadfall —" split out). r61+r62 both
   0/4; a nonzero count here is a finding, a third 0/4 is continuity.

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class (ALIVE / SCATTERED / DEAD), the weapon-craft-line
count, and the deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r63
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
