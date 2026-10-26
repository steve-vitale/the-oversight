# journey-scale r41 — NEVER FOUGHT MEANS STILL STANDING THERE (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261026T1945Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + tail); write 3→0 on completion.
**Base:** master@6ef77e3e7 (scale-onramp 1920Z) at run start. No sibling landed
mid-run, so no rebase was needed. Main tree verified clean at start; disk 25%.
**Arm:** two measurement-only batches, zero src/js change.
1. **SPAWNFATE** — the 1920Z round's named next question (why are 24/33
   wave-4 spawns never fought). New recorder `scripts/policies/spawnfate-diag.js`
   (daily world-monster census: seq, type, wave, tile, distance to player),
   driver `scripts/test-spawnfate-diag.js` (wave4enc 4-recorder composition
   + census, tableseat-nowait, seeds 73671–73678, DAYCAP 180),
   analyzer inside the driver (`classifyFate`), proof test
   `scripts/test-journey-scale-r41-spawnfate.js` (46/0 green, recomputed
   from the corpus rows).
2. **JOURNEY** — the leg itself. Driver `scripts/journey-scale-r41-20261026.js`
   (r40 driver, labels/EVIDIR only, control mode — no picker variant),
   analyzer `scripts/analyze-scale-r41-20261026.js` (r40 analyzer, labels
   only), policy `scripts/policies/scalecourt-nogate.js` UNCHANGED,
   seeds 85001–85004 (matched r30–r40), DAYCAP 180, death-aware stop,
   EVIDIR `evidence/2026-10-26/journey-scale-r41` (scratch dir, never
   r40's dir).
**Pre-register:** `evidence/2026-10-26/journey-scale-r41-prereg.md` (written
before any sim; no corrections needed after either pilot).
**Pilots:** spawnfate 73671 first (4 spawns4, fully partitioned, 0 errors,
180 census days) then the batch; journey 85001 first (day 181, pop 2/2,
pantry 9,361, global, lesser seat, arc 4, pilgrimages 4, transcripts
produced) then the batch. Both pilots passed their gates.

## Pre-registered leg question
1. On the matched scale seeds, does the leg still reach regional→national
   and the table approach, and do villagers still read as people?
2. Why are wave-4 spawns never fought — never encountered, fled off the
   board, or removed beside the player?

## Verdicts (binding — none re-scored)
- **FATE-COMPLETE: GO — 8/8 seeds fully partitioned.** Every wave-4 spawn
  (33 total) sits in exactly one fate class; unclassified 0, diag errors 0,
  census overflow 0. The partition reproduces the wave4enc count exactly:
  never-fought 24 (21 alive-at-end + 3 vanished-near-player), fought 9
  (field 3, tb 2, both 4).
- **FATE-DOMINANT: alive-at-end, 21/24 (87.5%).** The answer to the
  1920Z question is: wave-4 spawns go unfought because they are STILL ON
  THE BOARD when the run ends — never encountered, not fled, not
  despawned. Vanished-edge 0, vanished-interior 0, unclassified 0 across
  the whole band. Nothing in this band ever despawns a wave-4 monster.
  The scale wall is an encounter problem, not a persistence problem:
  monsters sit on tiles for dozens of days (e.g. 73671's suburb at
  (2,4), distance 2, from day 162 on) while the village never walks
  into them.
- **FATE-HOLE: 3 vanished-near-player spawns investigated in-run —
  2 EXPLAINED, 1 OPEN.** The two 73675 cases are one mechanism, proven
  end to end from the corpus rows (see below). The one 73677 case
  (eulogy, seen a single day) has no fight row, no kill-log entry, and
  no captured removal — it is the only unexplained removal in the
  band (1/33). Candidate paths are the ambient removals in game.js
  (lost-sight >6, fearful flee) — settling it needs a removal-site
  recorder, which is next-run work, not a claim made here.
- **JOURNEY-PARITY: pilot byte-identical to r40 control.** 85001
  reproduces r40's Mode A pilot outcome line exactly (day 181, over
  false, pop 2/2, pantry 9,361, lead 1/0, rank global, seat lesser,
  arc 4) on the moved base — the instrument contaminates nothing and
  the base movement changed nothing on this seed.
- **JOURNEY-PEOPLE: 7/8 transcripts meaningful, 1 circling (known
  picker artifact).** Full reads below; 0 senseless, 0 fabricated.
- **JOURNEY-TABLE: 3/4 seeds reach a lesser seat in-window.**
  85001 global/lesser/waiting (arc 4, first wait d124), 85003
  regional/lesser/waiting (arc 4, first wait d86), 85004
  regional/lesser/waiting (arc 4, first wait d153); 85002 regional,
  arc 3, seat none (blocked w3 2/3, opinion<10). No village scattered;
  no seat entered (sitting is a commitment beyond the approach).

## The explained hole: winning a contest wave deletes the bystanders (73675)
Day 145, seed 73675, is a gauntlet contest at Haven (player tile (4,4)).
Three tb fights, all won by the player (lockpick_raccoon, nevermore,
speedbump_turtle — all wave 1, all contest waves, arenaContest gauntlet).
Each fight's start row names the monster standing on the player tile at
that moment as tileMonster: sweeps_week s19 (wave 1), eater s28 (wave 4,
712/950 HP), eulogy s31 (wave 4, 675/900 HP) — all three flagged
lingering (raid raiders holding the treeline). All three are absent
from the day-145 census, with no field fight, no kill-log entry, no
death record anywhere.
**Mechanism, read from code (game.js startCombat ~33081, tbEnd ~43563):**
startCombat lifts the tile monster off the world list
(`removeWorldMonster(playerMonster())`) on EVERY tb fight, whatever the
fight is about, and records it as worldOrigin only if titan/lingering.
tbEnd restores it only when the result is NOT 'won' (lingerers: only on
fled/lost). So winning a tb fight on an occupied tile silently deletes
whatever was standing there — including full-health wave-4 monsters and
besieging raiders — because the code assumes the tile monster IS the
fight's monster, and contest waves break that assumption. The siege
ends with no 'treeline quiet' resolution and no record.
**Fix direction (NOT implemented — measurement run, combat-code change
needs its own proof and Steve's eyes, not a drive-by):** restore the
lifted origin on 'won' when the fight's monster is not the origin, or
don't lift when the fight's monster differs from the tile monster.
Either way the bystander must survive a fight it never fought.
**Scope note:** this is not wave-4-specific — s19 (wave 1) died the
same way. Any tb fight on an occupied tile can eat a bystander.

## The open one: 73677's single-day eulogy
Spawned day 120 (tile-entry, (6,2)), censused once (day 120, (5,2),
distance 0 — on the player tile), gone by the day-121 census. No tb
start names it, no field fight, no kill log. A day-121 tb end ('lost',
villager gen_g38w18q, monsterIds []) has no start row at all — a
direct-build fight the recorders never saw start — but nothing ties it
to the eulogy. It may be an ambient removal (lost-sight, fearful flee)
or a lifted-but-unrestored fight; the corpus cannot distinguish them.
Next run: wrap removeWorldMonster with a stack-hinted removal log and
re-run 73677 alone.

## Village assessment (plain words)
- **85001 — the village of two that reached the table.** Ends day 181
  with 2 living people, pantry 9,361, global rank, a lesser seat
  waiting since day 124, arc 4. Five villages known, all linked (1
  primary-sub, 3 covenant, 1 trade); pool drawn 20,747. The player died
  9 times in the arena across the run (each death a new villager
  taking the mantle) — the village-as-protagonist story, told honestly:
  the table waits for a village that has been ground down to a pair.
- **85002 — the fat, stuck village.** Ends day 180 with 10 living
  people, pantry 58,076, regional rank, arc 3, no seat — blocked on
  wave-3 deeds (2/3) and on opinion (four known villages below the bar).
  Nobody starved, nobody scattered; it simply never earned the approach.
- **85003 — the thin village that still got there.** Ends day 181 with
  3 living people, pantry 1,055 (the thinnest larder of the four),
  regional rank, a lesser seat waiting since day 86, arc 4. Seven
  villages known, pool drawn 39,269. The approach arrived earliest here
  and the pantry nearly ran out anyway.
- **85004 — the comfortable village.** Ends day 181 with 9 living
  people, pantry 61,320, regional rank, a lesser seat waiting since
  day 153, arc 4. Nothing broke; it arrived latest and fattest.
- **Standing blank, again:** no seed grows by arrival. The roster only
  shrinks (arena deaths, no newcomers) — the same arrivals-0 shape as
  r44's establishment run. A village that reaches the table with 2
  people is the leg's honest shape until arrivals exist.

## People check (all 8 transcripts read in full)
- 85001-d90 Irving (anxious baker, curious): shared fear at the
  treeline — "So it's not just me. Good. That's... good to know. Bad,
  but good." Real. Ends open, not resolved — fine for a curious talk.
- 85001-d120 Irving (curious): "I dream about soup. Actual soup, with
  a spoon." Specific, human, not filler.
- 85002-d90 Keisha (sardonic musician, curious): "Noted. Filing that
  under 'extremely useful.'" Voice matches temperament. Real.
- 85002-d120 Keisha (curious): "Then it's not gone. Not really. Keep
  going back, anyway." Real.
- 85003-d90 Joshua (earnest arborist, seek_taken stage 1): THE talk
  of the run. He wants news of taken kin; the player commits to ask
  the System about the pods; "Even asking is more than the silence."
  A want, an engagement, a promise — the quality bar met outright.
- 85003-d120 Pamela (dry farmer, ask_favor stage 1): "I can't reach
  this properly. Could you clean it out for me? Please." → commit →
  "Careful with it. And — thank you." Short, but the want is named and
  committed. (r40 proved subject-first would add the why; control
  commits straight from the opener — known, not re-litigated.)
- 85004-d90 Dorothy (anxious mechanic, curious): a real dream image —
  Columbus, Ohio, the street that keeps getting longer, waking tired
  "like I actually walked it." Not filler.
- 85004-d120 Dorothy (curious stage 0): THE wart, and a known one.
  more/react ×7 circling the restless thread ("I'm not built for
  staying", "I'd rather be moving toward maybe than sitting in
  certainly-not"). The thread is real and the lines are good, but the
  talk never takes the offered dlg:subject / dlg:doubt / dlg:invite —
  the control picker never takes them, exactly as r40 diagnosed, and
  r40 proved subject-first breaks the circle. In control it persists.
  Verdict: circling, not senseless; picker artifact, not a content gap.
- No fabricated shared history, no filler loops besides the one
  circling talk, no static menus. Betrayal accepts 0/8 (no betrayal
  subjects offered in this batch).

## Reachable / fun / winnable (leg 3)
- **Reachable:** YES for the approach — 3/4 seeds price a lesser seat
  in-window, and the approach is voiced (table lines present on all
  three). The full seat is NOT reached (w5 0 everywhere; wave-4
  monsters go unfought because they are never encountered — this run's
  mechanism finding). The wave-5 wall stands on the encounter side.
- **Fun:** YES with the known wart — the talks that land (Joshua's
  pods promise, Dorothy's Columbus dream) are the game at its best;
  the one circling talk is the control picker's, and the fix direction
  is already proven (r40 subject-first). The villages' thin end-states
  (2–3 people at the table) read as earned attrition, not as a bug —
  but they sharpen the arrivals blank.
- **Winnable:** PARTIAL — lesser seats are winnable in-window; the
  full seat is not, and this run names why on the encounter side
  (monsters persist unencountered) plus the bystander-deletion hole
  on the removal side. No win claimed; no win possible on this band
  without the encounter problem moving.

## Telemetry check
`telemetry-check.js` against scale.json with metrics day, popAlive,
pantryKcal: "quiet (4 files, 3 metrics, no large deviations)". HONEST
CAVEAT (same standing gap as r37–r40): the metric paths do not resolve
in journey trust JSONs (the values live under `census`, not top-level)
and scale.json is not journey-shaped, so this quiet is vacuous, not a
verification. Baseline NOT rolled. A journey-shaped baseline is still
owed by a future run (contract area, not done here).

## Test suites
- Proof test `test-journey-scale-r41-spawnfate.js`: 46 PASS, 0 FAIL
  (recomputed from corpus rows; verdict rule, band totals, per-seed
  partitions all match).
- Analyzer `analyze-scale-r41-20261026.js`: exit 0 on all 4 journey
  seeds.
- node --check green on driver, analyzer, recorder, sweep, proof test.
- check.js --quick: 278 passed, 9 failed in 556s (first run 278/9 in
  427s; rerun to capture the full failing list). The 9 are exactly
  r40's set: the standing 8 (hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014) PLUS the
  r20-fixes racks-voice gate (next-day-voice failure, pre-existing on
  base). Zero EPERM mentions. Nothing attributable to this run — it
  changed zero src/js. Full log: goal hidden_files
  journey-scale-r41-checkquick.log (kept out of the repo per the
  r53 pattern).

## Metric review
- FATE-COMPLETE and FATE-DOMINANT both GO on their pre-registered bars;
  no metric revision proposed. The dominant-class metric did its job:
  it forced the mechanism (alive-at-end) instead of the count (24).
- FATE-HOLE behaved as designed: it surfaced 3 cases, 2 explained with
  a code-read mechanism, 1 honestly open. No revision, but the next
  run's pre-registration should include a removal-site recorder so a
  single-day spawn is never left as "unknown removal" again.
- JOURNEY-PARITY's pilot gate (no crash, pilgrimages > 0, transcripts)
  passed; the byte-identical pilot outcome vs r40 control was a bonus,
  not the bar, and is reported as such.
- The telemetry-check shape gap (vacuous quiet) belongs under metric
  review for the NEXT run: either seed a journey-shaped baseline from
  trust JSONs (contract area — needs a baseline owner, not a silent
  roll) or drop the step for journey runs and say so. This run did
  neither silently: it ran the check, reported it vacuous, and did not
  roll.
