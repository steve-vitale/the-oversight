# sim-overtime-a — OVERTIME STANDING DOCKS census: INCONCLUSIVE — CLOCK NEVER ELIGIBLE

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp.
Worker: sim-overtime-a. Worktree: `~/workspace/worktrees/sim-overtime-a`
(branch sim-overtime-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
census of overtime-clock firings on a FRESH band, and whether the
standing "docks" move peak standing.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-overtime-a-prereg.md (commit f54372397).
Corpus: evidence/2026-10-27/perseed-overtime-a/ (8 rows + summary.json
+ sense-75001.txt). Instruments: scripts/test-overtime-a-sweep.js
(census + OT computation), scripts/test-overtime-a.js (proof validator,
ALL PROOFS PASS incl. G10-OT and G11), scripts/test-overtime-a-sense.js
(non-measured sense replay).

## Plain words

The overtime clock never started on any village on this band — so
the question "do the docks move peak standing?" has no answer here,
and that non-answer is itself the finding. The clock only runs
while a village is waiting at a table it has been invited to, and
no village on this band was ever invited: all eight stall at Arc
III, the chapter before the table, because none of them ever
qualifies even for the lesser seat. Three villages are one deed
short (they never complete the food-thesis deeds — teaching the
food truth and using a feast surge), three more are one monster
short (they never meet three kinds of wave-3 monster), one is
short on both, and one dies young. National standing is not the
problem — seven of eight villages reach national — but national
alone does not set the table. The w5seq band's late-run overtime
firings (days 147/154, docks −16/−26) came from villages that had
reached the table; this band's villages never get that far, so
there is no clock to fire, no dock to measure, and no peak for a
dock to move. The dock question is not answered, not refuted —
it is unasked on this band, because the road to the table ends
earlier than the clock.

One plain-words correction to the question as asked, established
from the code before sweeping and confirmed by the census shape:
the "dock" is not a deduction from a village's standing total.
It is a seat price: each overtime tier, plus each Haven person
lost while waiting, subtracts from the strength of the paths on
offer at the table (penalty = min(40, 4 × tier + 3 × losses)),
and it shows as a cost on the table preview. It never touches
the standing number that gates waves. So even on a band where
the clock fires, a dock cannot move peak standing through the
penalty channel — it could only matter through the clock's
other effects (harder rerun fights, sooner raids). A future
census on a table-reaching band should test those channels,
not look for a standing deduction that the code never makes.

## Verdict: INCONCLUSIVE — CLOCK NEVER ELIGIBLE (binding prereg, no re-score)

The prereg's verdict forms allow exactly one inconclusive form,
and this band meets it exactly:
- G-C1 corpus complete: 8/8 rows, days > 0, every gate + overtime
  + deed field present, zero null overtime points (validator
  V1/V7/G10-OT/G11).
- G-C2 every firing recorded: vacuously complete — firings = 0
  on all 8 seeds, and the validator's independent recount of
  firings from the daily series also gives 0 on all 8 seeds.
- G-C3 substrate-activation gate: FAILS in the inconclusive
  sense — zero seeds ever show tableWaiting = true in their
  daily series (everWaiting 0/8, everAnnounced 0/8,
  everStarted 0/8, max tier 0, max penalty 0 on all seeds).
  The other activation legs pass: policy ctx present on every
  national seed (tsNationalDay), daily overtime series live
  on every point (0 null points), live overtimeStanding()
  formula verified against code (G11).
- G-C4 verdict sentence: this one. INCONCLUSIVE — CLOCK NEVER
  ELIGIBLE.

Per the binding confirm-band rule there is NO second judged band
on new wording in this run. The finding goes back to the
coordinator with the exact eligibility counts below, not to
another 8 seeds. Prior bands are comparison-only, never
re-scored. The w5seq replay's firings remain sense-only notes,
not census data, and nothing here confirms or overturns them.

## The band (binding design, as pre-registered)

- Seeds 75001-75008, fresh band (verified zero hits in committed
  2026-10-27 evidence *.md before sweeping; the band was assigned
  by the coordinator for this run). Single arm:
  scripts/policies/tableseat-nowait.js VERBATIM (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the w5block/w5twokey/
  w5seq substrate, so wall numbers compare in shape. No armed
  leg: no lever under test.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~12 min for 8 seeds (slower than w5seq's
  ~5 min: the daily overtime series calls tableSeat()/
  deedGateReady() per day).
- Read discipline: the daily series uses ONLY pure reads
  (villageStanding, standingPlentyCappedTotal,
  waveCombatReadiness, waveEngaged, waveLedgerPoints,
  deedGateReady, state reads, plus the overtime pure reads
  progState fields, overtimeTier(), overtimeStanding(),
  overtimeActive(), winDayFloorOk(), tableSeat().seat). It never
  calls villageStandingTotal() or unlockedWave() daily — the
  daily gated total and daily unlocked wave are computed from
  the pure reads by the w5seq replication, so the census cannot
  push the gate it measures. The engine's own numbers are called
  once at end and checked by the validator (V3/V4): computed ==
  engine on all 8 seeds.
- No re-scoring of 74401-74408, 74311-74318, 74301-74308, or any
  prior band: the verdict above is judged ONLY on 75001-75008.
  Prior bands appear below only as comparison columns.

## Wall numbers (every run needs these)

| field | this band (75001-75008) | w5seq (74401-74408) |
|---|---|---|
| national ever / final | 7/8 / 5/8 | 8/8 / 6/8 |
| table invited / entered | 0/8 / 0/8 | 5/8 / 3/8 |
| wins | 0/8 | 3/8 (all feared lesser) |
| full seat | 0/8 | 0/8 |
| lesser seat | 0/8 | 3/8 |
| wave-4 unlock | 3/8 | 7/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival (upper median, see note) | 180d | 153d |
| deaths | 246 | 273 |
| starvation deaths | 1 (0.4%) | 1 (0.4%) |
| max Arc | 3 (all 8 seeds) | 4+ on table seeds |

Median-survival note: row days are 75, 131, 131, 180, 180, 180,
180, 180 — the aggregate's medianOf takes the upper middle
(180). Five villages survive the full 180 days; the three that
fall do so at days 75, 131, 131. This band is not a dying band;
it is a stalled band. Villages live, climb to national, and sit
at Arc III with no table in sight.

## Overtime table (the census itself — all zeros, and why)

| seed | days | end | firings | max tier | max penalty | ever waiting | ever announced | ever started | seat (daily) |
|---|---|---|---|---|---|---|---|---|---|
| 75001 | 180 | survived | 0 | 0 | 0 | no | no | no | none |
| 75002 | 131 | village-lost | 0 | 0 | 0 | no | no | no | none |
| 75003 | 180 | survived | 0 | 0 | 0 | no | no | no | none |
| 75004 | 180 | survived | 0 | 0 | 0 | no | no | no | none |
| 75005 | 75 | village-lost | 0 | 0 | 0 | no | no | no | none |
| 75006 | 131 | village-lost | 0 | 0 | 0 | no | no | no | none |
| 75007 | 180 | survived | 0 | 0 | 0 | no | no | no | none |
| 75008 | 180 | survived | 0 | 0 | 0 | no | no | no | none |

Totals: firings 0, seeds with firings 0/8, seeds with
peakAfter < peakBefore 0/8 (no first firing exists, so the
windowed-peak comparison is undefined on every seed, not zero),
seeds where a dock moved peak standing 0/8, seeds where a dock
changed an unlock or threshold crossing 0/8, end overtime
penalty 0 on all seeds, end earned-path strengths unreduced
(tableEarnedPaths penalty channel never engaged — there is no
table at which to price anything).

Peak standing (for the wall comparison; no dock exists to move
it): peak capped 102, 142, 127, 252, 142, 102, 147, 202; peak
gated 99, 99, 127, 199, 99, 99, 147, 99. Two standing notes, both
dock-free: 75004 peaks at capped 252 / gated 199 (the rd5
199-hold: veterans 1/2, the w5seq shape again, now with the
killer alive — see finding 3); 75008 peaks at capped 202 /
gated 99 (the rd4 99-hold: wave 4 never reached, so the
standing it earned is held at 99 despite clearing 200 capped).

## Why the clock never started (the eligibility chain, each link measured)

The overtime clock (overtimeActive) needs ALL of: tableWaiting,
tableDone false, tableAnnounced, day >= 90, tableSeat().seat
!= 'none'. The chain breaks at the FIRST link on all 8 seeds:

1. Arc IV never fires (max Arc 3 on 8/8). Arc IV requires
   (progression.js checkArc): Arc III held AND tableSeat()
   full or lesser. No seed ever qualifies for either seat.
2. The lesser seat (tableSeat(), table.js) requires ALL of:
   wave-1 faced >= 4, wave-2 faced >= 4, wave-3 faced >= 3,
   contests survived >= 2, crises >= 2, regional+ standing,
   integration stage >= 2, food-thesis deeds (sentimentTaught
   AND feastSurgeUsed). Daily-series check: ZERO days on any
   seed satisfy all lesser bars together (0/8 seeds, 0 days).
3. Per-seed lesser misses at end (daily peak w3 in brackets):
   - 75001: food deeds ONLY (w3 peak 8).
   - 75002: w3 1 < 3 AND food deeds (w3 peak 1).
   - 75003: food deeds ONLY (w3 peak 5).
   - 75004: w3 1 < 3 ONLY (food deeds met).
   - 75005: w3 2 < 3 ONLY (died day 75, before day 90 anyway).
   - 75006: food deeds ONLY (w3 peak 3).
   - 75007: w3 2 < 3 ONLY (food deeds met).
   - 75008: w3 0 < 3 ONLY (food deeds met).
   Every other lesser bar is met on every seed (contests,
   crises, stage 3, regional+ at peak). The table is blocked
   by exactly two bars: the food-thesis deeds (3 seeds solely,
   4 with w3) and meeting three kinds of wave-3 monster
   (3 seeds solely, 4 with food). Neither bar is the scale
   bar: national is reached on 7/8 seeds, and the three
   food-only misses are all national at end.
4. Because Arc IV never fires, tableWaiting is never set
   (progression.js: the Arc IV re-fire is the only
   tableWaiting path on this substrate), tableAnnounced is
   never set, and overtimeActive() is false on every daily
   point of every seed (validator G10-OT recount confirms
   tier 0 throughout). The clock's arming step
   (overtimeStarted) never happens, so no tier, no spoken
   dock line, no penalty, no rerun scaling, no raid-knob
   change. The substrate did run (see Infrastructure notes):
   this is a game-state outcome, not a harness miss.

## Census findings (each number traceable to the corpus)

1. THE DOCK QUESTION IS UNASKED ON THIS BAND, NOT ANSWERED.
   Firings 0/8, penalty 0/8, clock-started 0/8. Any report
   claiming overtime docks do or do not move peak standing
   from this band would be inventing data: there is no
   before/after pair anywhere in the corpus. The prereg's
   dormant-vs-inconclusive distinction matters here: this is
   NOT "dormant" (clock eligible but never fired — that would
   need tableWaiting observed), it is INCONCLUSIVE (clock
   never eligible). A dormant verdict would have meant the
   table waits patiently; the truth is the table never comes.
2. THE TABLE'S BINDING BARS ON THIS BAND ARE FOOD DEEDS AND
   WAVE-3 FACED, NOT SCALE. National 7/8, global peak on
   75004/75007/75008, yet lesser seat 0/8. The scale-onramp
   picture shifts one step upstream: on the w5seq band the
   binding question was wave 5's veteran key; on this band
   the binding question is the lesser seat's two bars. A
   future overtime census needs a band that clears those bars
   first — i.e. a substrate or seed family that teaches the
   food truth and meets wave 3 — or it will measure the same
   zero a second time. (This is a direction for the
   coordinator, not a proposal from this measurement-only arm.)
3. WAVE-4 KILLERS SURVIVE HERE, UNLIKE THE TWO PRIOR BANDS.
   Wave-4 kills 2 (75004, 75007), living wave-4 killers 2/2
   at end — against w5seq's 1 kill / 0 living and twokey's
   1 / 0. The "killer dies, bar empties" pattern does NOT
   repeat on this band. The two killers are single kills each
   (rd5 veterans peak 1/2 on both seeds), so the wave-5 door
   still does not move (wave 5 needs 2), but the survivorship
   leg of the w5seq story is not a law: on this band the
   proof survives its bearer. Reported as a secondary
   observation, not a verdict input — the census question
   was overtime, and this does not bear on it except to
   show the band is not a degenerate no-fighting band.
4. THE SEQUENTIAL WAVE-5 STRUCTURE STILL HOLDS (secondary,
   w5seq comparison). seqOk = TRUE on this band (S1 8/8, S2
   8/8 seeds with the wave-4-door deferral, S3 8/8, sole-short
   8/8), rep74316 seeds = 1 (75004: capped 252, veterans 1,
   gated 199 — the standing-met shape, one veteran short of
   the full key). The w5seq findings are not re-scored here;
   this is a comparison column only.
5. DEATH CAUSES (246 deaths): villager combat 74 (30.1%),
   villager-vs-villager combat 72 (29.3%), player arena 27
   (11.0%), villager monster 20 (8.1%), villager expedition
   20 (8.1%), remainder singles and small counts (ambush 4,
   sickness 7, thirst 7, wounds 3, dehydration 3, starvation
   1, alien 4, named-monster 2, the night 1). Combat dominates
   (70.4% across the three combat causes); starvation does
   not — same as both parent bands. The scale wall here is
   not food collapse either: it is the lesser-seat bars.

## Village assessment (plain words)

Seven of these eight villages grow into nations — linked,
feasting, known across valleys — and then stop. They do not
die (five live out the full 180 days); they do not win; they
do not get invited anywhere. The village that climbs highest,
75008, reaches global standing, banks standing past 200, and
still sits at Arc III because it has never met a third kind of
wave-3 monster. The village that fights furthest, 75007, faces
seven kinds of wave-4 monster, kills one, keeps the killer
alive — and still has no table, because it is one wave-3 kind
short and its food deeds are done but its monster list is
not. The villages that look most ready on paper — 75001,
75003, 75006, all national, all with deep monster lists —
are each missing the same single thing: the food truth taught
and a feast surge used, the deeds that turn a strong village
into a village the table prices. The shape of the run is a
waiting room with no door: national villages living well,
with nothing left in the game to invite them onward. That is
why there is no overtime here — overtime is the cost of
waiting at a table, and these villages never reach one.

## Sense-testing read (seed 75001, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: no firings on any seed,
so the seed nearest the clock (longest tableWaiting-unseated
stretch — all zero, tie broken by lowest seed) is 75001.
Replay: scripts/test-overtime-a-sense.js, seed 75001, 180 days,
output saved alongside the corpus (perseed-overtime-a/
sense-75001.txt, 317 lines, 313 life/gate hits from d150,
1 fight start at d163).

What the replay shows, in plain words, is a village living well
with no endgame in the air at all:

- The pantry is full to bursting every day ("~4-5 days of fresh
  on hand… the pantry can't take more; the wild will keep"),
  the garden is tended daily, Alex cooks and smokes racks
  until they hold 15,000+ kcal the haven cannot eat before it
  turns — abundance, not scarcity, is the late-run weather.
- People teach, talk, and notice each other: Stan teaches Fish
  Mint to the whole village ("The Codex grows without you
  lifting a finger"), Xinran and Nina speak no shared language
  ("just eyes, hands, and patience"), Stan sits down to "talk,
  like people used to."
- The System's show is present but not the table: d180, "WORD
  TRAVELS — riders from The Red Table bring talk of Haven. Out
  there they call you the Feared." Reputation travels; no
  invitation follows.
- What the replay does NOT show, on any of its 313 hits: a
  single OVERTIME line, a single RERUN line, a single "table
  is being set" line, a single seat price. Grep counts: 0
  OVERTIME, 0 RERUN. The replay agrees with the census in the
  negative — the absence is consistent across both instruments
  — but the replay proves wording and presence only, never
  counts, and its trajectory may differ from the census run's
  (here it does not need to differ to agree: both end with no
  table).
- The one fight start (d163, "Turn-based now") is an ordinary
  fight line, not a rerun: no RERUN scaling speaks, because
  the tier that scales fights is 0.

Sense judgment: the late run reads as people living comfortably
at national scale — and as a village the endgame has forgotten.
The sense gap and the census gap are the same gap: no table,
no clock, no dock, no price. The villagers pass the people
test; the road to the table does not exist for them to walk.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its prereg: CENSUS-GO iff G-C1 (8/8 complete) AND G-C2
(every firing recorded) AND G-C3 (activation gate) AND G-C4
(verdict sentence stated). Result: G-C1 pass, G-C2 pass
(vacuously, 0 firings), G-C3 fails in the prereg's inconclusive
sense (tableWaiting 0/8), G-C4 satisfied by the inconclusive
verdict form. Verdict INCONCLUSIVE — CLOCK NEVER ELIGIBLE, with
the failing link named (lesser-seat bars, not overtime). The
confirm-band rule was honored: no second judged band was run.

Method notes, each a proposal for the NEXT run, never a revision
of this one:

1. THE DORMANT/INCONCLUSIVE DISTINCTION EARNED ITS KEEP. Had
   the prereg offered only "dormant" for zero firings, this
   band would have been misreported as "the table waits
   patiently" — the opposite of the truth (the table never
   comes). Future overtime censuses should keep the two
   forms separate, and should pre-register the upstream
   eligibility chain (Arc IV, lesser-seat bars) as the
   census's first table, not as an afterthought.
2. THE "DOCK" WORDING NEEDS RETIRING. The assignment's phrase
   "standing docks" reads, in plain words, as if standing is
   deducted. The code deducts nothing from standing: the
   penalty prices paths at the table. The next run's prereg
   should call it a seat price throughout, and should test
   the channels a clock actually moves (rerun fight scaling,
   raid knobs, path-strength pricing) rather than hunting a
   standing deduction. This note does NOT change this run's
   verdict — the verdict is inconclusive for eligibility
   reasons, and the wording correction is a proposal for the
   next prereg.
3. G11 VALIDATOR CORRECTION (instrument, not data). The
   validator as first written failed G11 on seed 75005 for
   "no policy ctx counters" — but tableseat's preview leg only
   runs at national+, and 75005 never reached national (died
   day 75, regional day 47), so empty ts counters are the
   EXPECTED never-national shape, not a substrate failure.
   G11 was corrected (validator only; corpus untouched) to:
   national seeds must show ts counters; never-national
   seeds must show rank progression past village (75005:
   regional day 47) or die before day 25. After the correction
   ALL PROOFS PASS. The corpus, the sweep, and the verdict are
   unchanged by this correction; only the proof gate's logic
   was wrong, and it is documented here rather than hidden.
4. DAILY SAMPLING EDGE, SAME CLASS AS W5SEQ. 75005's daily deed
   w3 peaks at 1 while its end deed w3 is 2 (death-day
   meeting after the last daily sample: daily last day 74,
   run days 75). No verdict input uses daily deed peaks for
   the primary (the lesser-eligibility daily check uses deed
   tuples per day and is 0 days on all seeds under either
   reading of 75005). Future censuses should keep noting
   death-day events as a known one-day edge.
5. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (grep: 0 hits for
   ingest/corpus; `--out <panel-directory>` is required and
   it builds panels from live roots). A panel compare was
   NOT started as a live run: per the w5seq precedent, starting
   it would build panels from live roots, not from the corpus,
   which is the wrong instrument for this census, not a failed
   comparison. No panel artifact was faked; the sweep table +
   validator output are the comparison of record. Same standing
   exception as the w5seq corpus.
6. MEDIAN CONVENTION. The aggregate's medianOf takes the upper
   middle of 8 (180 here), not the mean of the two middles.
   Reported as 180d with the row days listed, so the convention
   is visible and the number cannot mislead.

## Telemetry deviation check (loop body step 10)

`node scripts/telemetry-check.js --baseline ~/workspace/goals/
the-scattering-roguelite-survival-game/hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-overtime-a/*.json' --metrics
national,table,wins,exiled` -> 3 LOUD lines (national 12->0,
table 16->0, wins 16->0, n=9 files). Verdict: KNOWN ARTIFACT,
no investigation, baseline NOT rolled. Two independent reasons,
both documented (same as w5seq): (a) the baseline's own regime
note forbids this comparison (a ~100%-win winseat suite vs a
tableseat-nowait census substrate — wins are structurally lower
here); (b) the field-shape artifact repeats (per-seed rows carry
nationalEver/entered/won, not top-level national/table/wins paths;
summary.json is the 9th file). The corpus's real wall numbers are
nationalEver 7/8, table entered 0/8, wins 0/8 — the zero table and
zero wins are real on this band and are already the headline of
this evidence, not a telemetry surprise. No exiled LOUD line.

## Blanks filled or documented

- FILLED (answered, with numbers): the overtime census on a
  fresh band — firings 0/8, penalty 0/8, clock-started 0/8, with
  the eligibility chain measured link by link (Arc IV 0/8,
  lesser-eligible days 0/8, per-seed lesser misses); the
  penalty channel re-derived from code (seat price, not a
  standing deduction) and its spoken amounts reconciled to
  the w5seq replay (−16 = tier 1 + 4 losses, −26 = tier 2 + 6
  losses); the wall numbers for the band; the sequential
  wave-5 structure holding as a comparison column; wave-4
  killer survivorship 2/2 on this band (against 0/2 across the
  two prior bands).
- FILLED (gate re-derivation, verified against code): validator
  V5 confirms live demand (w5: 4/15/6/3/2; w4: 3/10/5/3/1);
  G10-OT confirms the firing table, windowed peaks, and the
  penalty formula (min(40, 4t+3l)) from the daily series; G11
  confirms the live overtimeStanding() formula on a synthetic
  progState.
- DOCUMENTED, NOT FIXED (for the coordinator, not chased here):
  (1) The overtime question itself is unasked on this band —
  the next overtime census needs a table-reaching band (food
  deeds + wave-3 faced cleared) or it will measure the same
  zero. (2) The lesser-seat bars (food deeds, wave-3 faced)
  are the upstream wall on this band, ahead of the wave-5
  veteran key. (3) The "dock" wording should be retired in
  favor of "seat price" (see Metric review §2). (4) Replay
  narration repeats ambient daily lines heavily (pantry-full
  beat, garden beat daily) — same noise class as prior runs,
  not a game bug.
- CARRIED (not chased here): the veteran-survivorship question
  (now with a counter-example: 2/2 survive here); the melt
  stage; the empty nonat x w4 class; the live rule-(3) firing
  band (needs defiance NOT offered).

## Findings for backlog (coordinator appends to sim-findings.md)

- [candidate] 2026-10-27 — overtime / table-onramp — on band
  75001-75008 the overtime clock never becomes eligible
  because no village ever qualifies for the lesser seat
  (food deeds and wave-3 faced are the binding bars, not
  scale); a future overtime census needs a table-reaching
  band first, or it re-measures zero (sim-overtime-a).
- [candidate] 2026-10-27 — wording — "standing docks" misleads:
  the overtime penalty is a seat price on path strengths at
  the table (min(40, 4t+3l)), never a deduction from standing
  totals; retire "dock" for "seat price" in future preregs
  (sim-overtime-a).
- [candidate] 2026-10-27 — lesser seat — food-thesis deeds
  (sentimentTaught + feastSurgeUsed) block the table on 4/8
  seeds of a national-reaching band while wave-3 faced blocks
  4/8; the two bars, not national standing, are the table's
  door on this band (sim-overtime-a).

## Infrastructure notes

- Sweep: scripts/test-overtime-a-sweep.js, 8 seeds, ~12 min
  wall. Corpus: evidence/2026-10-27/perseed-overtime-a/
  (8 rows + summary.json + sense-75001.txt). Validator:
  scripts/test-overtime-a.js — ALL PROOFS PASS (V1-V7 + G4 +
  G5 + G10 + G10-OT + G11, after the documented G11 correction).
- Safe-commit index clobber hit BOTH pre-sweep commits
  (prereg f54372397, instruments 30ea4990a) — the known class:
  commit correct, main index showing bogus staged deletions +
  untracked twins. Repaired via HEAD-blob cacheinfo both times,
  verified with git status --short (only expected untracked
  files) + git diff HEAD empty, before any sweep ran.
- No EPERM flap blocked this run's writes; all rows wrote first
  try (the writer subprocess retry loop was not needed beyond
  its first attempt).
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the w5seq/w5twokey/w5block
  precedent for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the
  sense script only READS beats on a replay).
- Panel attempt not started as a live run (see Metric review
  §5): the panel tool builds from live roots, not from a
  census corpus.
- Commit: sim-overtime-a, INCONCLUSIVE — CLOCK NEVER ELIGIBLE
  (firings 0/8, table 0/8), zero src/js diff. Branch ready,
  pending coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).
