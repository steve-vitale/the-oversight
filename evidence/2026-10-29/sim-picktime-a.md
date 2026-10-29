# sim-picktime-a — PICK-TIME JOIN: DIAG-NO-GO (the base moved under the funnel band; the join instrument is proven, the comparison band is not)

Run: flesh-out loop, run fleshout-20261029T1530Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-picktime-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes. This arm neither re-judges
nor rebuilds the build lane's hunthold pilot (its P1/G1/G2 NO-GO
stands), does not touch Loop B food-economy work, the build
lanes, or Steve-call #1409.
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-29/sim-picktime-a-prereg.md (commit 844f1f720).
VERDICT: DIAG-NO-GO — as written, two prereg legs fail, and
metric binding (§14) forbids re-scoring around them. The
failure is NOT the instrument and NOT the recorders; it is
the comparison premise. Read the whole verdict before
quoting it: the join machinery this arm was asked to build
is proven (fixtures 6/6, determinism byte-identical,
recorder-neutrality 19/19 on the current tree), and the
current-master measurement is complete — but the funnel-a
comparison the prereg required is unreproducible because
the game changed between the funnel-a corpus and this run
(see "Root cause" below). A future run must re-baseline
(see "Metric review"); this run does not waive its own leg.

## Plain words first

The question this arm was built to answer — for each wave-4
hunt pick, what time was it picked, what time did it walk,
and how does that differ from only knowing the walk? — has
no instance on this band on the current game, because
nobody picked a wave-4 hunt at all. Not one, in eight
villages. The famous pair from the old band — two women
who picked the eulogy hunt on the same morning, one
interrupted by dinner, one sick-held for two days — does
not exist anymore on these seeds: the villages play out
differently now, because villages now start with armor
they did not start with before (three bark wearers seeded
at creation), and the whole trajectory shifts from the
first week. The old band's numbers cannot be reproduced
on the current game, and pretending otherwise would be
fabricating a comparison.

What the current game DOES show, on the one village that
met wave-4 beasts and lived to remember them: five times
a villager was offered the trip back to a wave-4 beast
while its memory was still fresh — four times to a eulogy
she had fought a day or three before, once to a reunion —
and five times she chose something else: food, water, a
visit, chores. No wave-4 hunt departed anywhere on the
band. No wave-4 hunt ever even reached the doorway check
(zero departhold evaluations for wave-4 hunts on that
seed). So on the current game, the pick-time story is not
"picked and waited" but "offered and declined" — and the
machinery to tell picked-from-departed apart is built,
tested, and waiting for a band where a pick actually
happens.

## Header (pre-registered) vs result

Band seeds 75101-75108, tableseat-nowait substrate, 180d
death-aware, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FIELDPARTY=1, RETURNS=1, FUNNEL=1, DEPARTHOLD=1.
Corpus: evidence/2026-10-29/perseed-picktime-a/ (8 rows +
summary.json). Analyzer: scripts/test-picktime-a.js
(departlag classifyPick imported verbatim, NOT copied;
verdict join + dayPart stamps + departure-only
comparison added). Analysis JSON:
evidence/2026-10-29/picktime-a-analysis.json.

- LEG 1 — CORPUS VALIDITY 8/8: RESULT 8/8 rows, days >
  0, all four channels present, errs 0, overflow 0,
  installed true -> PASS.
- LEG 2 — JOIN COMPLETENESS, UNKNOWN <= 1: RESULT
  primary n=0, UNKNOWN 0 -> PASS (vacuously, stated
  as such: with zero primary picks there is no join
  to fail, and no distribution exists to report).
- LEG 3 — DETERMINISM, seed 75106 scratch re-run:
  RESULT byte-identical (cmp clean; scratch dir
  removed after comparison) -> PASS.
- LEG 4a — RECORDER-NEUTRALITY OFF vs ON, seed 75106:
  RESULT 19/19 comparable fields exact, 0 diffs
  (PICKTIME-NEUTRALITY PASS) -> PASS. The recorders
  do not perturb the current game.
- LEG 4b — FUNNEL-A CHANNEL NEUTRALITY: RESULT 62
  diffs across 8 seeds (meetings, departures, drops,
  notes, days, death totals, wave reach on every seed)
  -> FAIL. Root cause below: the base moved, not
  the recorders (4a proves the recorders; the control
  re-run below proves the base).
- LEG 5 — SENSE, one verbatim pick→departure chain:
  RESULT no primary pick exists, so no chain can be
  read; scripts/test-picktime-a-sense.js reports
  "no primary pick to read" and exits 1 -> FAIL.
  A descriptive read of the band's only memory-holder
  picks (seed 75108) is given below as UNJUDGED
  analysis, not as a leg pass.
- DIAG-GO requires ALL FIVE legs. Legs 4b and 5 fail
  -> DIAG-NO-GO. No metric was changed mid-run.

## Root cause (investigated before judging, not assumed)

The prereg ordered exactly this: a different primary count
is a neutrality failure to investigate first. The
investigation, in order:

1. The picktime sweep itself was suspected first — but
   a control re-run of the VERBATIM funnel-a sweep
   (scripts/test-funnel-a-sweep.js --one 75101, no
   departhold) reproduces the picktime row, NOT the
   funnel-a row: days 110 (picktime) vs 132 (funnel-a
   corpus), meetings 143 vs 219. The divergence is
   in the base, not in this arm's wrapper.
2. The first differing record is the band's first
   field meeting (seed 75101, day 6, farid_ahmed vs
   sanjun): identical in every field EXCEPT
   readiness/armored 4 (funnel-a corpus) vs 7
   (current tree), and villageArmored10 4 vs 7.
   Exactly +3, at day 6 — before any player lever
   could act.
3. Between the funnel-a corpus commit (f67cc41df)
   and this run, master landed build-armor commit
   062e07a7a: "seed up to three staying bark wearers
   at village creation" (src/js/game.js, +93 lines:
   up to THREE generated villagers' kits gain a bark
   armor, worn from day 0), plus fix-all armor
   9c650f840 (craft live-enabled, bark inflow
   15->30%). The +3 in the day-6 record IS the
   seeding commit's "up to three" — the causal match
   is exact, not circumstantial.
4. The hunthold-off corpus reproducing funnel-a
   exactly on 75101 does NOT contradict this: that
   reproduction was verified at holdsjoin time, on
   the pre-armor tree. Trajectories are
   base-versioned; a corpus is a snapshot of the
   tree that ran it.
5. The recorders are separately exonerated: leg 4a
   (OFF vs ON on the current tree) is 19/19 exact,
   and the departhold recorder was already present
   in the hunthold corpora that reproduced the old
   band. The 62 diffs are base movement, counted
   honestly as a leg failure, not hidden behind
   the recorder proof.

Judgment: leg 4b's premise — "the funnel band is still
the funnel band" — was falsified by a landed game
change outside this arm's scope (build lane's armor
work, which this arm neither touches nor re-judges).
The correct response is a NO-GO on the prereg as
written plus a re-baseline order for the next run,
not a waived leg.

## Judged numbers (primary universe: wave-4 HUNT picks)

- COUNT: 0 wave-4 HUNT picks in 8 seeds. By joined
  class: DEPARTED-PICK-LINKED 0, OVERWRITTEN-BY-VERDICT
  0, SUPERSEDED 0, DIED-HOLDING 0, HELD-TO-HORIZON 0,
  UNKNOWN 0. Every class count carries its n (n=0) —
  there is no pick to list a villager, seed, pick
  day/part, or memory age for, and none is invented.
- LAG DISTRIBUTION: no departed picks, so no lag
  distribution; no superseded picks, so no
  supersession lag. The departlag-a band values
  (2d/8p departed stale, 0d/3p superseded by dinner)
  belong to the OLD base and are NOT carried forward
  as current-base numbers.
- DEPARTURE-ONLY vs PICK-JOINED COMPARISON: cannot be
  exercised — it needs a DEPARTED primary pick, and
  there is none. The comparison machinery is built
  (analyzer emits depOnlyComparison; fixtures prove
  it on synthetic picks) and awaits a band with a
  departed wave-4 pick. No comparison is quoted from
  n=0. What CAN be stated: band-wide wave-4 HUNT
  departures = 0, so a departure-only census on this
  band would report nothing at all — the entire
  wave-4 pick story on the current base lives before
  any departure, in offers declined (below).
- CORRECTED LINK RULE (holdsjoin flagged defect):
  corpus over-link candidates = 0 — vacuous, because
  there are no HUNT picks for a GUARD departure to
  over-link to. The rule itself is proven by fixture
  (GUARD departure with the same huntMid/huntDay is
  rejected; HUNT departure links; different-huntDay
  overwrites do not leak across windows), not by
  the corpus count. The hunthold-on GUARD case
  (seed 75107, visjoin_171) does not occur on the
  plain substrate: plain-substrate seed 75107 holds
  zero funnel picks in both the funnel-a corpus and
  this corpus — it was a diverged-trajectory
  artifact of the lever corpus, stated here so the
  next analyzer does not go hunting for it.
- SECONDARY UNIVERSE (all HUNT picks by wave-4 memory
  holders, any wave): n=0 as well. The 11 funnel
  picks below are memory-holder picks whose chosen
  kind was never HUNT.

## Descriptive analysis (UNJUDGED — same corpus, not a re-score)

Seed 75108 is the band's only seed with funnel picks
(11) or wave-4 field meetings that produced memories.
Its 9 judgedA meetings (all vFlee except 3 deaths:
giulia_bianchi reunion d89 vDie, app_mgpsphm923 suburb
aid d94 vDie, ava_garcia reunion d94 vDie) produced
the following memory-holder picks. "Offer" here means
the recorder's recomputed candidate is non-null AND
wave-4 (the candidate can also be a wave-3 beast, e.g.
diana's callback offer — counted separately, never as
a wave-4 offer):

- diana_osei d86 EAT, post-flee resting, candidate null
  (memory formed that day: eulogy + callback at (5,4)).
- diana_osei d87 SEEK, candidate callback (wave-3,
  age 1) — refused for a SEEK errand. Not a wave-4
  offer.
- ava_garcia d87 VISIT, post-flee resting, candidate
  null.
- ava_garcia d88 EAT, candidate eulogy (wave-4, age 1)
  — OFFER 1, refused for food.
- app_mgpsphm923 d89 WATER, candidate eulogy (wave-4,
  age 1) — OFFER 2, refused for water.
- ava_garcia d89 VISIT, candidate eulogy (wave-4,
  age 2) — OFFER 3, refused for a visit.
- ava_garcia d90 WATER, candidate eulogy (wave-4,
  age 3, last fresh day) — OFFER 4, refused for water.
- ava_garcia d91 WATER, candidate null (memory stale:
  eulogy day 87 is 4 days old); d92 WATER, null; d94
  VISIT, null (stale throughout).
- app_mgpsphm923 d94 HAVEN_CHORE, candidate reunion
  (wave-4, age 1) — OFFER 5, refused for chores.

Totals, labeled: wave-4 offers 5, takes 0/5 (n=5 — an
offer count, not a rate to generalize). Fresh-window
offers 5/5 (all ages 1-3); stale-window picks 3 (all
candidate null, correctly — the offer does not exist
once the memory ages out). Chosen kinds across the 11
picks: WATER 4, VISIT 3, EAT 2, SEEK 1, HAVEN_CHORE 1,
HUNT 0. Departhold evaluations for wave-4 hunts on
seed 75108: 0 — no ready wave-4 hunt ever reached a
doorway check, so there is no verdict terminal to join
on this seed either. The shape matches pickband-a's
fresh-band shape (4 offers, 0 takes) on a different
band and base — offers exist, takes do not — but the
two bands are different populations and are NOT pooled
here.

Sense read (descriptive, not the leg): ava_garcia's
four-day window reads as a person with a fresh wound
to avenge and a life that keeps intervening — offered
the eulogy trip on d88 (food), d89 (a visit), d90
(water, last fresh day), and each time the ordinary
errand wins. She dies d94 to a reunion, not the
eulogy. Nothing in the record marks the eulogy offer
as refused-with-regret or as forgotten: the candidate
simply stops being offered once the memory ages past
day 3, and the fiction never says she chose against
it. That silence — an offer made four times, declined
four times, never narrated — is the same narration
blank returns-a documented for attempts, now
documented for offers.

## Current-band wall (8 seeds; reported, NOT claimed as movement)

New base, new trajectories — these numbers are the
corpus's own wall, not a before/after: wins 6/8 (full
0/8, lesser 6/8). National ever 7/8, final 7/8. Table
invited 6/8, entered 6/8. Wave-4 reach 6/8, wave-5 0/8.
Median days 114 (NOT horizon-capped: only 1/8 seeds
reached day 180). Deaths 240, starvation deaths 1.
JudgedA 9 (all seed 75108), formed 0, kills 0. HUNT
departures (all waves) 166, true drops 156.
Per-seed: s75101 110d over-other wave3 won1 natEver1
deaths23; s75102 180d survived wave3 won0 natEver1
deaths32; s75103 104d over-other wave4 won1 natEver1
deaths31; s75104 114d over-other wave4 won1 natEver1
deaths18; s75105 90d over-other wave4 won1 natEver1
deaths31; s75106 136d over-other wave4 won1 natEver1
deaths38; s75107 149d over-other wave4 won1 natEver1
deaths30; s75108 102d village-lost wave4 won0 natEver0
deaths37 starv1.
Death-cause shares (n=240): villager combat 104,
villager-vs-villager combat 62, player the wild 26,
villager expedition 19, villager monster 6, player the
arena 4, villager ambush 3, player contest 3,
villager thirst 2, villager sickness 2, villager
starvation 1, player the night 1, player a stranger 1,
villager alien 1, villager wound-that-wouldn't-close 1,
villager a toad like a war drum 1, villager Choir Toad 1,
villager Chorus Line 1, villager The Eater 1.

## Metric review (for the NEXT run — never a mid-run re-score)

- BASE-VERSIONED CORPORA: a funnel-a-equality leg
  assumes the base did not move between corpora. It
  did (armor seeding). The next picktime prereg must
  EITHER pin the base commit the comparison corpus
  ran on and re-baseline when a game change lands,
  OR drop cross-corpus equality and judge recorder
  neutrality by OFF/ON on the current tree alone
  (leg 4a, which passed here and is the operative
  proof). Cross-base counts must never be pooled
  silently.
- SENSE-BAR HIERARCHY (missing here, present in
  pickband-a): this prereg's sense leg had no tier-2
  fallback, so an empty primary fails sense outright.
  The next prereg should pre-register the pickband
  hierarchy (tier 1 departed primary; tier 2
  superseded primary; tier 3 memory-holder chain)
  and name the tier used — this run's descriptive
  75108 read is tier-3 material, reported as such,
  not as a leg pass.
- EMPTY-PRIMARY VERDICT CLASS: with legs 4b and 5
  both failing on an empty primary, this evidence
  reports DIAG-NO-GO per its prereg. A future prereg
  should decide in advance whether "instrument
  proven + primary empty + base moved" is its own
  verdict class (e.g. DIAG-NO-GO-BASE-MOVED) so the
  next reader does not mistake it for an instrument
  failure — it is not one.
- NEXT BAND DESIGN (NOT a lever): the next run that
  wants a pick→departure lag on the current base
  should screen for wave-4 field survivors on the
  CURRENT (armor-seeded) master before committing a
  census band — the funnel band's hit rate on this
  base is 1/8 seeds with memory-holder picks and
  0/8 with a HUNT pick. Prefer bands whose survivors
  are unsheltered and roaming in the fresh window
  (pickband's gate-layer lesson, unchanged), and keep
  the census (primary + offers + gate attribution +
  fresh-window pick count) comparable to this one
  within the new base only.
- PANEL NOTE (standing): scripts/balance-panel.js has
  no census-ingest mode; identical-substrate corpora
  are the §15 substitute, as in prior rounds — and
  this run is exactly why the substitute must be
  base-versioned. No panel artifact faked, no panel
  verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10):
  corpus path for the coordinator's check is
  evidence/2026-10-29/perseed-picktime-a/*.json
  (metrics national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in prior
  rounds: the baseline's regime does not match this
  substrate, and per-seed rows carry
  nationalEver/entered/won, not top-level
  national/table/wins paths. The band's true wall
  numbers are nationalEver 7/8, entered 6/8, wins 6/8.
  Baseline NOT rolled by this arm; the coordinator
  judges any LOUD lines.

## Blanks filled or documented

- FILLED (instrument, not a game fix): the
  pick→departure join itself — departlag's lag class
  imported verbatim, verdict terminal joined with the
  CORRECTED link rule (kind HUNT + huntDay required;
  GUARD over-link rejected by fixture), dayPart stamps
  carried pick-side and departure-side without
  conversion, and the departure-only comparison
  implemented. The next run with a departed wave-4
  pick needs no new instrument for this join.
- FILLED (diagnosis, current base): the funnel band
  on the armor-seeded master holds 0 wave-4 HUNT
  picks in 8 seeds, 5 wave-4 offers refused on its
  one survivor seed, 0 wave-4 HUNT departures
  band-wide, 0 wave-4 doorway evaluations on that
  seed. The pick-time question on the current base
  is an offers-declined story, not a lag story.
- DOCUMENTED (for the next arm, not built here):
  (a) base-versioning of corpora — funnel-a counts
  are stale on the current master (armor seeding
  +3 wearers, day-6 record proof); any arm still
  quoting funnel-a/departlag-a lag values as current
  is quoting the old base; (b) the offer-narration
  blank — four fresh offers declined in silence;
  (c) the corrected-link rule and the departure-only
  comparison both await their first corpus occurrence
  (fixture-proven only).
- NOT re-judged: funnel-a DIAG-GO, departlag-a
  DIAG-GO, holdsjoin-a DIAG-GO, pickband-a DIAG-GO,
  and the hunthold pilot P1/G1/G2 NO-GO all stand as
  published — on their own bases. Funnel-a's numbers
  are reported here as stale-base numbers, not
  revised.

## Test and infrastructure notes

- `node --check` clean on all five new files;
  scripts/test-picktime-a-fixtures.js exits 0 with
  PICKTIME-FIXTURES PASS (6/6, incl. GUARD rejection,
  departed-eval cross-check, death-day UNKNOWN,
  different-huntDay exclusion);
  scripts/test-picktime-a.js exits 1 with
  PICKTIME-LEGS: FAIL on leg 4b only (validity +
  join + determinism-note + sense-note reported;
  analysis JSON written regardless);
  scripts/test-picktime-a-sense.js exits 1 with no
  primary pick (the leg-5 failure, stated);
  scripts/test-picktime-a-neutrality.js 75106 exits 0
  with PICKTIME-NEUTRALITY PASS (19/19 fields, 0
  diffs); sweep --summary exits 0 with corpus 8/8 ok.
- Determinism gate: seed 75106 re-run into a scratch
  dir inside this worktree byte-identical to the
  corpus row (cmp clean; scratch removed after the
  comparison). Control re-run: funnel-a sweep --one
  75101 into a scratch dir reproduces the picktime
  row (days 110), not the funnel-a corpus row — the
  base-movement proof; scratch removed after use.
- Sweep runtime: 8 seeds in ~2 min (faster than
  pickband's 6.5 min — the armor-seeded villages end
  earlier; median 114d vs pickband's capped 180d).
- Safe-commit index clobber hit the prereg commit and
  the instruments commit (staged-deletion twins of
  byte-identical files); repaired via HEAD-blob
  `git update-index --add --cacheinfo` with status-empty +
  diff-HEAD-empty + hash-match verification, never
  `git reset`. No .git EPERM flap this run. No ref
  surgery.
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed (all four
  recorders reused verbatim); no other arm's corpus
  touched (predecessor corpora read-only; the
  picktime corpus lives in its own dir,
  perseed-picktime-a/). No push, no bump, no live
  verification (ship-loop line). Ready for
  coordinator merge, pending ship — via the
  coordinator.
- This DIAG arm should not need Steve's eyes: no feel,
  combat, or UI change exists to look at. No
  [needs-eyes] flag.

## Commits

- 844f1f720 prereg (before any judged sweep).
- 1e04c095f instruments (sweep + analyzer + fixtures +
  sense + neutrality).
- Corpus + analysis + this evidence: final commit(s)
  on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
pick-time join is now an implemented, proven instrument
with a current-base measurement (0 wave-4 HUNT picks,
5 offers refused, 0 wave-4 departures on 75101-75108)
and a named re-baseline order for the next run — but
no wave-4 field party has yet killed in the field, the
full seat stays 0, wave 5 stays 0, and the funnel band's
old lag values are now known-stale on the current
master. The directive stands until the tracker records
this axis converged on measured evidence.
