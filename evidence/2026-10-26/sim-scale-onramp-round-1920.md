# sim-scale-onramp-round-1920 — coordinator evidence (run fleshout-20261026T1920Z)

Axis: scale-onramp (converging, NOT converged). Loop B live on food-economy
at run start (new trees sim-mealdraw-b + sim-stock9762-b appeared mid-run,
NOT touched); sibling eggroad-a tree still registered with a stale 15:59Z
heartbeat — NOT touched; journey2-endgame live — NOT touched.

## Pre-registration (evidence header, §14 binding)

- Primary metric: wave-4 encounter decomposition completeness + table-talk
  situation-snapshot completeness, on one shared band.
- Band: seeds 73671–73678, tableseat-nowait substrate, 180d death-aware
  horizon, scalemetric cost bar (starvation ≤ control+2 on totals AND
  arm-only deaths; median ≥ 0.8× control median).
- Arm 1 (sim-wave4enc-a) DIAG-GO bar: every faced wave-4 entity on ≥6/8
  seeds traced to exactly one outcome class AND the dominant class named
  with per-seed counts AND the fieldfinish question answered yes/no with
  counts. Otherwise DIAG-NO-GO.
- Arm 2 (sim-tabletalk-sit-a) DIAG-GO bar: ≥90% of tableWaitTalk fires carry
  a complete situation snapshot (pantry + wait duration + seat kind +
  stage) AND the readable-but-unused gap enumerated per template.
  Otherwise DIAG-NO-GO.
- Both arms DIAG ONLY: recorder/policy instruments, zero src/js, no default
  flips, no veterans-bar or demand-number changes, no dialogue changes.

## Arm 1 — sim-wave4enc-a (DIAG-GO, commit feba72024 after rebase onto
f21c0e7f7; proof 69/0 post-rebase AND on merged master)

Wave-4 encounter decomposition, band partition over 49 encounter units
(spawns 33; field fights 12; tb initiations 13; fought spawns only 9):

- spawned-never-fought 24, player-tb-lose-or-rout 13, field-flee-villager 8,
  field-lose 4, field-kill 0, field-flee-monster 0, field-evade 0,
  player-tb-kill 0. Band dominant: spawned-never-fought (24/49).
- Per seed: 73671 field-lose 2; 73672 never-fought 6; 73673 tb-lose 6;
  73674 zero encounters; 73675 never-fought 6; 73676 tie tb-lose 1 /
  never-fought 1; 73677 never-fought 6; 73678 zero encounters.
- Field fights (12, 1–3 rounds) deal 0–31 damage against 448–1000 HP
  monsters — two deal exactly 0 — and end in villager flight (8) or death
  (4); the monster never flees. All 13 tb fights end lost (doors:
  world-bump 10, feast-draw 2, contest-arena 1). Extreme case: 73673 loses
  SIX distinct tb fights to the same algorithm (seq45) in one day, after a
  0-damage field fight against it.
- FIELDFINISH QUESTION FOR WAVE 4: NO, with counts — 0 below-line arrivals
  (lowest start fraction 0.684, lowest end HP 448), 0 zero-round flights,
  0 1-HP arrivals, 0 strict wounded-repeats. The wave-3 stuck state never
  engages at wave 4 because villages cannot wound wave-4 monsters anywhere
  near the 15% break line. The drought's mechanism is unwinnable fights +
  unmet spawns, not unfinished fights.
- Documented, not fixed: (1) 73675 d90 ephemeral influencer field fight
  (pre-unlock, no world entity/seq, door unidentified by this recorder);
  (2) wave-4 defeats are mourned but never instructed in narration;
  (3) the scholar's six same-day tb losses cannot be split by this
  recorder into bot-policy persistence vs engine re-engagement.

## Arm 2 — sim-tabletalk-sit-a (DIAG-GO, commit f21c0e7f7; proof PASS on
merged master)

Pick-time situation snapshots for tableWaitTalk. 18/18 fires carry a
complete situation snapshot (100% ≥ 90% bar); gap enumerated for all 6
templates. No dialogue, template text, or picker behavior changed.

- Per-template gap (all fires on 73672, lesser seat, stage 3): NO template
  mentions any situation fact as a value. T3 gestures at "pantry" (word
  only); T4 gestures at "stores" and overtime ("Herald feeds", no
  tier/penalty). Gestures are dice, not tracking: T4 fires at pantry
  19,795 with overtime tier 0 and at pantry 9,710 with tier 6 alike; T3
  fires at pantry 11,701 and at pantry 0 alike.
- Readable at pick time: pantry kcal/class, pellet-online-now, pellet
  installed-ever, pellet-in-pack, nation prod fired + day, overtime
  tier/days/penalty, live seat kind, stage, rank, arc, announced flag,
  roster pop, scholar id. The picker currently reads none of them as
  content (only waiting flag, day, last-fire day, roster, scholar id as
  PRNG salt).
- Not readable as stored: invitation-time seat kind (live recompute is
  the honest substitute); speaker's recent templates (havenGrowth stores
  only lastTableTalkDay). Waiting duration is observer-derived, not
  picker-native: no pg/state field stores the first waiting day (7
  candidate fields probed, all null on all 18 fires; picker-native
  completeness 0/18, disclosed alongside the GO). A future fix needs reads
  plus exactly ONE new field (first-seen waiting day) — no new data source.
- Canon note: no canon doc covers fireside table-talk variety specifically.
  CONVERSATIONS.md "No repeats, ever" governs convo-UI threads via
  convoPick; tableWaitTalk is a separate say() fireside beat, and TABLE.md
  prices the seat but says nothing about fireside talk naming it.
- Refinements pinned in arm evidence: (1) pick-time pantry ≠ daily-snapshot
  pantry intraday (day-114 T0 reads pantry 0 at pick time, not the
  tableline daily snapshot's 2,510; two class flips total). (2) First
  waiting day origin: wrapper dawn 61 vs daily snapshot 62; only T3 day 122
  flips class (mid→late) between conventions, and no template varies by
  either.
- Coverage gaps (not findings): entered-state and full-seat talk have zero
  occurrences (winners sit on day 1; the long waiter holds a lesser seat);
  73677's 22-day silence is dice (~6 cooldown-eligible calls at 22%).

## Wall numbers (this run's judged corpora — BOTH arms agree exactly)

Wins 2/8, national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
wave-3 8/8, wave-4 6/8, wave-5 0/8, median 152d, deaths 307, starvation 1.
Wave-4 kills 0/8 seeds; wave-4+ killers peak 0 everywhere — the wave5gate
veterans-bar finding reproduces.

## Base delta (stated, not absorbed — read this before citing any band table)

Against the 1816Z table, wins/national/entered/wave/starvation are
identical, but median is 152d vs 166d (−14) and deaths 307 vs 338 (−31).
Per-seed: 73671, 73672, 73676, 73678 identical; 73673 (longer survival,
global rank), 73674 (wins via lesser seat instead of dying, wave 3 not 4),
73675 (26 vs 42 deaths only), 73677 (loses instead of winning, wave 4 not
3) shifted. The only src/js + policy delta between base 9c9ac3e4f and the
arms' base 1377d03c3 is journey r53 (conversation.js ask_favor guard +
villageAgency.js falsy-0) plus the build stamp; the instruments cannot be
the cause (G2 identity 8/8 + 4 identical seeds prove pipeline fidelity).
FUTURE PER-SEED COMPARISONS MUST USE THIS RUN'S TABLE, NOT 1816Z'S —
notably the wave-4 seed set changed (73674 out, 73677 in) while wave-4
reach stayed 6/8. Table-talk arm's base additionally includes Lane B
endgame r54 (evidence-only, zero src/js); its band table matches this
run's table exactly, so the r54 delta is inert on this band.

## Village assessment (plain words)

The villages get big enough to be noticed — regional, then national on six
of eight seeds — and two of them sit down at the lesser table and win
through it. But the road past that table is empty. The wave-4 monsters
(the Mirror Draft) mostly never even meet a villager: of 33 that appear,
24 are never fought at all, and the ones that are fought are never beaten
— villagers run or die, and the player loses every turn-based fight
against them, sometimes six times to the same one in a single day. So
nobody alive has ever killed a wave-4 monster, and the full table's
veterans bar sits at zero on every seed. Meanwhile the village waits at
the lesser table for months talking about the table in six different
voices — but never once mentioning how much food is in the pantry, how
long it has waited, or what kind of seat it holds. The talk floats free
of the village's actual situation, and the fix for that needs only one
new fact recorded (the day waiting started); everything else the talk
could mention is already readable at the moment it speaks.

## Metric review (§14)

- No pre-registered leg was re-scored. Wave4enc's DIAG-GO does not depend
  on a fieldfinish-YES bar (≥1 zero-round flight, not met) — the bar
  requires the question be answered, and NO with counts is an answer.
  Tabletalk's GO is judged on the recorded (instrument) snapshot; the
  picker-native 0/18 figure is disclosed in the same breath, and a future
  restatement of this bar should split instrument completeness from
  picker-native completeness.
- Two wave4enc instrument corrections before judging, both disclosed in
  arm evidence: (1) analyzeNonworldkill returns counts only, so the tb
  start↔end join is built in the sweep from the exported classifyStart;
  (2) the never-fought typeTbAfter flag now counts only tileSeq-null tb
  events (false for all 24 never-fought spawns after the fix).
- Note for the next run (proposed, not applied retroactively): "fully
  traced" passes vacuously on zero-encounter seeds; a future bar wanting
  encounter coverage should require a minimum encounter count per seed
  separately from trace completeness.
- Balanced panel (§15): not applicable (no corpus-ingest mode for recorder
  corpora; no panel file faked). Paired identical-seed tables are the
  comparison of record.

## Telemetry deviation check

Ran telemetry-check.js on both corpora against
telemetry-baselines/scale-wall.json: wave4enc 2 LOUD lines (national
12→0, wins 16→0), tabletalk 3 LOUD lines (national 12→0, table −75%,
wins 16→0). All are the known recorder-row counting artifact (the checker
reads top-level national/wins keys the recorder rows do not carry; actuals
are national-ever 6/8, table 4/8, wins 2/8). Baseline NOT rolled, no new
investigation item.

## Infrastructure

- Master moved twice under this run (Lane B endgame r54 evidence-only
  commits, then the tabletalk merge). Tabletalk merged ff-only directly
  (base = master tip). Wave4enc rebased clean in its own worktree onto
  the tabletalk merge (zero file overlap, evidence-only delta), proof
  69/0 post-rebase AND on merged master; ff-only merge then clean.
- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time, commits verified
  correct, worktrees clean before release. No EPERM flap this run.
- check.js --quick NOT re-run (zero src/js, sibling loops live);
  attributable evidence is the arm proofs on merged master.
- Trees released done-merged, branches deleted, main tree clean at
  closeout. No push, no version bump — merged locally, pending ship.

## Findings backlog

- Wave-4 faced-but-never-killed line (1816Z) flipped to fixed with this
  decomposition; new open line: why 24/33 wave-4 spawns are never fought.
- Situation-blind table-talk line stays open (availability now measured;
  the dialogue change itself still needs Steve's ruling); new open line
  records the availability result + the one-new-field finding.

scale-onramp stays converging (NOT converged): wave 5 still 0/8, full
seat still unreached, wins still only via the lesser seat — but the wall
now has a fight-by-fight shape (unmet spawns dominate, then unwinnable
fights, never unfinished fights) and the dialogue blank has a measured
fix shape (reads + one new field). Next blanks, in order: (1) wave-4
encounter opportunity — why 24/33 spawns are never fought (spawn
placement vs villager routing vs meeting rules); (2) wave-4 fight
winnability — 0–31 damage vs 448–1000 HP, what makes a field fight
winnable (opportunity arm first; no demand-number moves on this
evidence); (3) situation-aware table-talk variety arm once Steve rules
(spec ready + availability measured); (4) dead-entry drop ruling (Steve,
carried); (5) remaining 1354Z steve-calls (choice-price, met-below-line
finishing, melt — still skipped, not re-measured); (6) defnarr proposal 3
(specifiable, ruling pending). food-economy stays converging (untouched;
sibling loop B). Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
