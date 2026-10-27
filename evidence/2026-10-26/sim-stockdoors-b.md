# sim-stockdoors-b — the stockSurplus door + the direct-pantry-consumption doors, instrumented (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0049Z, axis
food-economy. Arm: the driedpath metric review's named next blank —
TWO more pantry recorders before judging any family ledger closed.
Measurement only: zero src/js changes, no default flips, no lever.
This arm does NOT re-judge the driedpath NO-GO — its verdict is
ONLY whether the family ledgers close once the stockSurplus door
and the direct-pantry-consumption doors are captured. Judged ONLY
against its pre-registration
(evidence/2026-10-26/sim-stockdoors-b-prereg.md, committed BEFORE
any judged sweep as 9a298c981).

## Verdict against the pre-registered bar: NO-GO

The ledgers close almost everywhere — pooled bars pass on every
leg, the generic family closes, the dried channel closes — but
leg 3a fails, and the prereg requires ALL of legs 1–5. A miss is
NO-GO, never re-scored against a friendlier metric mid-run.

| leg | bar | result |
|-----|-----|--------|
| 1. Neutrality / det-gate | STOCKDOORS=0 vs 1 identical on inflow/mealdraw/spoilvol/driedpath/deaths/wall (seed 9820) | byte-identical ✓ (255/1249/4/163 both runs) |
| 2. Coverage | stockdoor records on >= 7/8 seeds; driedpath path still seen on >= 7/8, linked >= 95%; every wrapped path reported | 8/8; 8/8; 100.0% linked ✓ |
| 3. Named-family closure | (a) per-family-seed pass rate >= 80% AND (b) pooled \|residual\| within 1% of pooled named inflow | (a) 9/12 = 75.0% ✗; (b) 4,136 / 1,687,320 = 0.245% ✓ — FAIL on (a) |
| 4. Generic-family closure (separate) | (a) pass rate >= 80% AND (b) pooled \|residual\| within 1% of pooled generic inflow | (a) 7/8 = 87.5% ✓; (b) 4,412 / 2,225,865 = 0.198% ✓ — PASS |
| 5. Dried-channel closure | pooled \|dried residual\| within 2% of pooled transformed post-kcal | −5,456 / 774,536 = 0.70% ✓ — PASS |

Legs 1, 2, 4, 5 pass; leg 3 fails on its rate half alone. No
confirm band is spent: the pilot is NO-GO, so the prereg
forbids confirm spend, and seeds 9768–9779 stay unspent for
this arm's purposes.

## Band and instrument

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Pilot seeds
  9820–9827 REUSED as substrate (the driedpath pilot band —
  stated, no freshness claim). Horizon 100d, death-aware; all
  8 seeds survived to day 100.
- Instrument (DIAG only): scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, and scripts/stockdoor-capture.js
  (the stockSurplus recorder) reused UNCHANGED, plus the NEW
  scripts/stockdoors-capture.js (installed after loadGame,
  before setupGame; wraps npcTakeAction, npcChildAction
  (depth-guarded), apPlaygroundRaid, useAbility,
  _evTakePantryKcal, takeFromPantry, takeFromPantryBulk —
  snapshot-diff around each call, recording ONLY unit
  decreases, with per-path call counters so a zero-record path
  is distinguishable from an unwrapped path) and the NEW
  scripts/sweep-stockdoors-b.js (same band/env assertions as
  sweep-driedpath-b.js, plus all six recorders, day-end
  snapshots, opening-stock snapshot, smoke-rack say lines).
  STOCKDOORS=0 disables ONLY the stockdoors install
  (det-gate control). No sibling capture file modified.
  Corpus: evidence/2026-10-26/sim-stockdoors-b-corpus/ (8
  per-seed JSONs). Scripts: scripts/analyze-stockdoors-b.js,
  scripts/test-stockdoors-b.js (proof).
- Canon read: docs/CANON.md + docs/PRESERVATION.md, plus the
  driedpath, spoilvol, stockdoor, and mealdraw evidence. The
  code facts in the prereg (stockSurplus game.js ~28794;
  npcTakeAction ~20561 / npcChildAction ~20721; alien raids
  alienPlayers.js ~2448; Light Fingers abilityActions.js
  ~1654; event takes game.js ~25133; player takes game.js
  ~15730/~15886) were read before the prereg, not invented.
- Base commit pinned: prereg parent e69842153. The judged
  sweep ran on the prereg commit (tooling-only, zero src/js);
  the proof records the sweep HEAD. NOTE (recovery, see
  below): the judged sweep was executed by the coordinator
  after the container write flap lifted, on the same
  worktree HEAD, with the unchanged instrument — the base
  for the judgment is unchanged; only the operator changed.

## Recovery note (reported, not hidden)

A container-wide write(2) EPERM flap blocked every file-data
write from ~01:11 UTC to ~02:52 UTC (~101 min). The worker's
judged sweep never landed a valid corpus: its files were
0-byte placeholders (9821–9827) and probe garbage (9820),
plus flap-probe dotfiles in the corpus directory — all
deleted by the coordinator before recovery, none committed.
The coordinator verified the flap had lifted with direct
data-write probes (evidence/, scripts/, /tmp, ~/workspace
— all WRITE-OK), then re-ran the full 8-seed pilot in file
mode with the unchanged instrument. The re-run reproduces
the driedpath corpus counts exactly on every seed (see
"Control"), so nothing was re-scored, re-barred, or
substituted in recovery: the prereg, the instrument, and
the legs are the worker's, untouched.

## Control: the det-gate (leg 1) and the OLD-definition ledger

Det-gate (seed 9820, STOCKDOORS=0 vs 1, stdout-JSON mode):
inflow, mealdraw, spoilvol, driedpath records, death lists,
and wall fields are BYTE-IDENTICAL excluding stockdoors
fields and `ms`. The on-run records stockdoor=640 and
direct=23; the off-run records no stockdoors fields. The
det-gate run reproduces the corpus seed-9820 counts exactly
(255/1249/4/163). The new recorders are neutral: they read,
they do not move the game.

Trajectory vs the driedpath corpus (base moved since 2309Z
— observation, not verdict input): deaths, wave reach, and
rank are IDENTICAL on all 8 seeds (9820: 4/wave 2; 9821:
1/wave 2; 9822: 4/wave 3; 9823: 9/wave 2; 9824: 10/wave 3;
9825: 6/wave 3; 9826: 2/wave 2; 9827: 2/wave 2). The OLD
definition (driedpath's definitions, computed on THIS
head's corpus) gives pooled residual 1,832,078 on pooled
inflow 2,026,185 = 90.420%, and pooled dried residual
−67,999 = 8.78% — EXACTLY driedpath's numbers (90.42% /
8.78%). There is no base-move drift to report: the control
ledger reproduces, and the improvement below is entirely
the new doors.

## What was measured: the two doors close two of the three gaps

### Coverage census (leg 2 detail)

| seed | stockdoor recs | stockdoor kcal | direct recs | direct kcal | direct by path (records / kcal) |
|------|---------------|----------------|-------------|-------------|----------------------------------|
| 9820 | 640 | 226,000 | 23 | 5,151 | player-take 20 / 4,451; npc-adult 3 / 700 |
| 9821 | 849 | 345,200 | 115 | 15,338 | player-take 113 / 15,038; npc-adult 2 / 300 |
| 9822 | 693 | 207,400 | 128 | 18,766 | player-take 113 / 16,516; npc-adult 15 / 2,250 |
| 9823 | 465 | 179,200 | 237 | 27,889 | player-take 234 / 26,894; npc-adult 3 / 995 |
| 9824 | 501 | 213,600 | 73 | 14,737 | player-take 59 / 11,928; npc-adult 14 / 2,809 |
| 9825 | 398 | 96,800 | 97 | 26,845 | player-take 68 / 20,150; npc-adult 29 / 6,695 |
| 9826 | 827 | 282,400 | 9 | 1,318 | player-take 5 / 750; npc-adult 4 / 568 |
| 9827 | 757 | 336,400 | 8 | 1,300 | player-take 5 / 750; npc-adult 3 / 550 |
| pooled | 5,130 | 1,887,000 | 690 | 111,344 | player-take 617; npc-adult 73 |

All seven wrapper paths installed on all 8 seeds
(wrappedPaths complete, missingPaths empty). Paths with
ZERO records on this band — alien-raid, thief.steal_pantry,
event-take, player-take-bulk — are reported as zero, not
claimed: no raid, lift, event take, or bulk take fired on
these 8 seeds (their call counts are 0; the only
useAbility keys that appear are green_thumb/green_whisper
cultivate, which never move the pantry). Event-take
retMismatch count is 0 everywhere. The reused driedpath
instrument still sees its path: 893 transformation events
(9820: 163, 9821: 109, 9822: 97, 9823: 107, 9824: 73,
9825: 139, 9826: 98, 9827: 107 — exactly driedpath's
census), linked transformed post 100.0%.

### The correction to driedpath's suspicion

Driedpath suspected direct NPC eating was the larger dried
leak. The records say otherwise: the dried leak was the
PLAYER's own pantry takes. The worst case proves it: 9823
Burdock dried went from −15,806 (OLD) to 0 (NEW) — the
15,806 kcal of dried stock that "vanished" left through
recorded direct takes, dominated by player-take. NPC pantry
eating is real but small (73 records band-wide, 12,667 kcal
pooled). Alien raids and Light Fingers lifts contribute
nothing on this band — they are not the leak here, whatever
they do on other bands.

### Named-family ledgers (leg 3 detail; inflow >= 10,000 kcal)

| family-seed | inflow | residual | share | |
|-------------|--------|----------|-------|---|
| Burdock 9821 | 12,420 | 0 | 0.00% | PASS (was −3,827 / 30.81%) |
| Muscadine 9821 | 151,830 | 0 | 0.00% | PASS (was −356) |
| Burdock 9822 | 159,030 | 0 | 0.00% | PASS (was −3,741) |
| Muscadine 9822 | 147,960 | 0 | 0.00% | PASS |
| Burdock 9823 | 78,480 | 270 | 0.34% | PASS (was −15,536 / 19.80%) |
| Muscadine 9824 | 139,410 | 1,800 | 1.29% | FAIL (was 1,800 — unchanged) |
| Burdock 9824 | 117,180 | 1,800 | 1.54% | FAIL (was 1,620) |
| Muscadine 9825 | 222,750 | −864 | 0.39% | PASS (was −936) |
| Lamb's Quarters 9825 | 48,750 | 1,130 | 2.32% | FAIL (was 1,130 — unchanged) |
| Lamb's Quarters 9826 | 359,700 | 0 | 0.00% | PASS (calibration, was −50) |
| Burdock 9826 | 29,250 | 0 | 0.00% | PASS |
| Purslane 9827 | 220,560 | 0 | 0.00% | PASS |

Pooled named residual 4,136 on pooled inflow 1,687,320
(0.245%, bar <= 1% — passes with margin). Pass rate 9/12
= 75.0% (bar >= 80% — fails). The three failures share
one character: they are SMALL (1,130–1,800 kcal) and, for
two of them, UNTOUCHED by the new doors (9824 Muscadine
1,800 OLD → 1,800 NEW with zero direct records on it;
9825 LQ 1,130 OLD → 1,130 NEW with zero direct records).
The 9824 pair is the same round number on two families of
one seed — the shape of a single unrecorded 1,800-kcal
flow or a boundary artifact, not of a missing door. That
is a diagnostic for the next run, not a verdict input:
under this prereg, 75% < 80% is NO-GO, full stop.

### Generic-family ledgers (leg 4 detail, judged separately)

| seed | inflow (NEW) | residual | share | |
|------|--------------|----------|-------|---|
| 9820 | 273,700 | 459 | 0.17% | PASS (was 225,201 / 472.12%) |
| 9821 | 372,972 | 1,759 | 0.47% | PASS (was 341,126 / 1,228.31%) |
| 9822 | 240,102 | 3,177 | 1.32% | FAIL (was 198,681 / 607.55%) |
| 9823 | 231,434 | −602 | 0.26% | PASS (was 171,309 / 327.96%) |
| 9824 | 240,501 | −800 | 0.33% | PASS (was 209,157 / 777.51%) |
| 9825 | 180,645 | 510 | 0.28% | PASS (was 88,009 / 104.97%) |
| 9826 | 313,977 | −91 | 0.03% | PASS (was 282,091 / 893.34%) |
| 9827 | 372,534 | 0 | 0.00% | PASS (was 336,400 / 930.98%) |

Pooled generic residual 4,412 on pooled inflow 2,225,865
(0.198%). Pass rate 7/8 = 87.5%. The stockSurplus door
CLOSES the generic family: residuals that ran +88k to
+341k per seed now run −800 to +3,177. The one generic
failure (9822, 3,177) is the same small-residual class as
the named failures.

### Dried-channel ledgers (leg 5 detail)

Pooled dried residual NEW −5,456 on pooled transformed
post 774,536 (0.70%, bar <= 2% — passes). Per-family
dried residuals that were the driedpath horror stories
now read: 9823 Burdock dried 0 (was −15,806); 9821
Burdock dried 0 (was −3,827); 9822 Foraged dried 0 (was
−11,896); 9824 Muscadine dried −2,430 (was −2,430 —
unchanged, part of the 9824 pair); 9820 Foraged dried
−1,036 (was −2,294); 9823 Foraged dried −396 (was
−7,685); 9825 Foraged dried +920 (was −8,381). The
dried channel is closed as barred.

### Non-focal note (reported, not judged)

9825 Fish catch moves from −5,776 (OLD) to +2,016 (NEW,
2.01%): its 7,792 kcal of direct records OVER-explain the
OLD shortfall by 2,016. Either some direct takes on that
seed double-count stock the meal also drew, or the OLD
shortfall had a second component the direct records
swamp. Non-focal families are not judged here, but the
over-explanation is a finding for the next run's ledger
work — a recorder that can overshoot needs its portion
rule re-examined before the next close claim.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)

First direct event (9820, day 7): an NPC pantry eat — the
analyzer renders the eater as "a person, maybe 60s" —
1 unit of Rice, 200 kcal, spoilDay 366. It reads as what
it is: a hungry villager feeding themselves outside the
meal, one unit at a time, not a system drain. Small,
human, and — at 73 records band-wide — not the story.

First stockSurplus night (9820, day 3): vDay 3, give 67,
stored 200, spoilDay 6. The night meal's leftover becomes
a 200-kcal Foraged-food unit in the pantry, good for three
days. The village does not "generate" surplus in the
abstract — one villager's uneaten share becomes tomorrow's
stock, night after night, 5,130 times across this band.
That is the generic pile's real biography, and it finally
has a ledger to match.

The smoke racks still read as people behavior (9820, day
12): "Megan cooked for the haven — meals stretched. Megan
worked the smoke racks too — 3 batches preserved (~1568
kcal, keeps for weeks)." The racks, the surplus door, and
the direct takes are all one village's food story now —
and the ledger watches all three.

## Village assessment

What the village looked like: 8 villages surviving the
full 100 days around pantries that are now fully watched
— 893 smoke-rack batches, 5,130 surplus pushes, 690 direct
takes, 799 spoil sweeps. The pantry is not a black box
anymore: every counted flow has a door, and the doors
that remain uncounted are small (1,130–3,177 kcal) and
named. Rank stayed village on all 8 seeds; no seed
approached regional, let alone national.

Who thrived and died and why: 38 deaths across 8 seeds
(9820: 4, 9821: 1, 9822: 4, 9823: 9, 9824: 10, 9825: 6,
9826: 2, 9827: 2) — identical to driedpath's band, as
determinism requires. Sickness dominates (17), then
monster 5, ambush 4, a wound that wouldn't close 4, the
arena 3, contest 2, sunback 1, alien 1, dehydration 1. No
death is starvation-shaped.

What knowledge/capabilities were missing: nothing big —
the two doors this arm was built to capture are captured.
What remains is small and specific: the 9824 1,800-pair,
the 9825 LQ 1,130, the 9822 generic 3,177, and the 9825
Fish catch over-explanation — four small residuals that
keep a 75% rate from an 80% bar.

Blanks filled: (1) the stockSurplus door is now
INSTRUMENTED and its totals are complete — 5,130 records,
1,887,000 kcal, and the generic family closes from
+88k…+341k per seed to −800…+3,177; (2) the direct-
consumption doors are INSTRUMENTED per path — 690
records, 111,344 kcal — and they close the dried channel
from 8.78% to 0.70%; (3) driedpath's suspicion is
CORRECTED: the dried leak was player pantry takes, not
NPC eating, raids, or lifts (which contribute zero on
this band); (4) the control ledger reproduces driedpath
exactly on this head, so the improvement is the doors,
not drift. Documented, not fixed: no game-code change was
made (DIAG only), and the verdict is NO-GO on leg 3a —
the ledgers do not close as barred, by one family-seed
(9/12 vs the 10/12 an 80% bar needs).

## Reachability verdict

On this band (competent-nofeast, seeds 9820–9827, 100d):
waves 1–3 reached (wave 3 on 9822/9824/9825, wave 2 on the
rest); waves 4–5 reached on 0/8 seeds. Regional, national,
table, and wins: 0/8. Rank stayed village on all 8 seeds.
Arc II/III/IV, four-realm formation, trap acquisition,
counter discovery/kill, and young-link succession survival
are not recorded in this corpus and are not estimated here.
The scale wall stands on this band; this arm measures a
pantry ledger, it does not move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9820–9827)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave
reach per seed: 9820: 2, 9821: 2, 9822: 3, 9823: 2, 9824: 3,
9825: 3, 9826: 2, 9827: 2. Median survival: 100d (censored
at the 100d horizon; all 8 seeds survived to day 100).
Deaths: 38 total (causes above).

## Confirm band: NOT spent

Per the prereg, confirm seeds 9768–9779 (12 seeds) are
spent ONLY if the pilot verdict is GO. The pilot verdict
is NO-GO, so no confirm band is spent and 9768–9779 remain
unspent for this arm's purposes.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the
  verdict follows from it: leg 1 passes byte-identically,
  leg 2 passes completely (8/8, 8/8, 100% linked), leg 4
  passes (87.5%, 0.198%), leg 5 passes (0.70% vs 2%), leg
  3 fails on its rate half alone (75.0% vs 80%; pooled
  0.245% vs 1% passes with margin). No re-scoring was done
  (no dropping the generic family — it passes anyway, no
  switching to base-only residuals, no single-seed rescue,
  no ignoring unlinked events — there are none, no
  reverting to the OLD draw definition).
- Bar lesson for the NEXT run: leg 3's two halves now
  disagree in the informative direction — pooled passes
  easily while the rate fails by one family-seed (9/12 vs
  the 10/12 an 80% bar needs). The rate bar is doing all
  the work, and it is doing it on residuals of 1,130–1,800
  kcal against inflows of 48,750–139,410. The next ledger
  arm should EITHER keep the 80% bar and hunt the four
  small residuals directly (the 9824 1,800-pair first — a
  single flow or boundary artifact would flip two
  family-seeds at once and take the rate to 11/12), OR
  pre-register a materiality floor (e.g. residuals under
  2,000 kcal count as closing) — but that floor belongs
  in the next prereg, never retrofitted into this verdict.
- Proof-fix disclosure (coordinator recovery, same class
  as driedpath's instrument fix): the proof's first run
  failed on ONE leg — its independent dried-residual check
  summed transformed post over focal family-seeds only
  (658,464) while the analyzer's leg-5 denominator is the
  BAND total transformed post (774,536, the leg-2 totPost;
  the prereg says "pooled transformed post-kcal" with no
  focal qualifier). The residual itself matched exactly
  (−5,456 = −5,456); only the denominator was mis-scoped.
  The test was fixed to sum the band total (scripts/
  test-stockdoors-b.js, commented in place), and the
  proof re-ran green. Leg 5 passes under either denominator
  (0.70% band / 0.83% focal, bar 2%), so no verdict
  changes — the fix makes the independent check reproduce
  the analyzer instead of disagreeing with it. The prereg
  itself was NOT amended.
- Instrument lesson for the NEXT run: the direct recorder
  can OVER-explain (9825 Fish catch −5,776 → +2,016) —
  before the next close claim, its portion rule needs a
  second look on seeds where direct draws exceed the OLD
  shortfall. And the zero-record paths (alien raids,
  thief lifts, event takes, bulk takes) need a band where
  they actually fire before their accounting is trusted —
  this band proves the wrapper, not those paths.
- Definition lesson (carried): draws are now defined as
  pantryDraw + drawSpoiled + direct-consumption records,
  stated in this arm's prereg — the definition driedpath
  asked the next run to state. Future ledger arms inherit
  it; they do not re-litigate it.
- Balanced panel (MEASUREMENT.md §15): NO comparison
  exists — this arm changes no lever and no game code, so
  there is no before/after to panel. The det-gate (leg 1)
  is the before/after comparison: identical records with
  the instrument off vs on. The before/after that DOES
  exist is instrument before/after: driedpath's ledgers
  without the new doors vs this run's with them — pooled
  90.42% → 0.245% named (pooled), 90.42% → 0.198%
  generic (pooled), dried 8.78% → 0.70% — reported via
  the control ledger above.

## Out-of-arm observations (for the coordinator's sim-findings backlog; not chased)

- The dried leak was player pantry takes, not NPC eating,
  raids, or lifts — driedpath's suspicion corrected with
  records (9823 Burdock dried −15,806 → 0 via direct).
- The 9824 1,800-pair (Muscadine + Burdock, same seed,
  same round number, both largely untouched by the new
  doors) smells like one unrecorded flow or boundary
  artifact — the next ledger arm's first diagnostic.
- 9825 Fish catch direct records over-explain the OLD
  shortfall by 2,016 kcal — the direct recorder's portion
  rule needs a second look before the next close claim.
- Alien raids, thief lifts, event takes, and bulk takes
  fired zero times on this band — their accounting is
  unproven here and needs a band where they fire.
- Sickness remains the top death cause on this band
  (17/38), as in driedpath — same shape, same band, no
  change.

## Reproduction check (this run)

- Sweep scripts/sweep-stockdoors-b.js ran 8 pilot seeds,
  100d, competent-nofeast (by the coordinator post-flap,
  same worktree HEAD, unchanged instrument); corpus at
  evidence/2026-10-26/sim-stockdoors-b-corpus/ (8 files,
  pure JSON).
- Analyzer scripts/analyze-stockdoors-b.js prints per-seed
  per-family ledgers under BOTH definitions, the per-path
  direct census, stockSurplus totals, GO legs, wall
  numbers, and the sense block.
- Proof scripts/test-stockdoors-b.js green on re-run
  (after the proof-fix above), exit 0: det-gate
  byte-identical (255/1249/4/163 both runs, stockdoor
  640 / direct 23 on-run, none off-run), corpus-9820
  counts reproduced, independent named pooled residual
  matches analyzer (4,136 / 1,687,320, 9/12),
  independent generic pooled residual matches analyzer
  (4,412 / 2,225,865, 7/8), independent dried pooled
  residual matches analyzer (−5,456; denominator fixed
  to the band total 774,536), verdict follows from legs
  (NO-GO: leg1 true, leg2 true, leg3 false, leg4 true,
  leg5 true), stockdoor invariant holds (spoilDay =
  vDay + 3, name Foraged food), event-take retMismatch 0,
  no direct record claims an unknown path, trajectory vs
  driedpath identical on all 8 seeds, control OLD
  pooled 90.420% / dried 8.78% reproduced, and hygiene
  (0 src/js files modified, 0 sibling capture files
  modified, no modified tracked file outside this run's
  own files). No jest was run (nothing to test in jest —
  the proof is node, not jest). No [needs-eyes]: this
  lands a measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files
  in this arm's commits: prereg commit 9a298c981
  (scripts/stockdoors-capture.js,
  scripts/sweep-stockdoors-b.js,
  evidence/2026-10-26/sim-stockdoors-b-prereg.md), plus
  the evidence commit (scripts/analyze-stockdoors-b.js,
  scripts/test-stockdoors-b.js,
  scripts/sweep-stockdoors-b.js (modified post-prereg,
  transport-only: writeRobust replaced by tryWrite +
  pending-flush + staging fallback, commented in place —
  the judged sweep ran on this version and wrote all 8
  files directly, no flush needed),
  evidence/2026-10-26/sim-stockdoors-b.md, and the 8
  corpus files). The worker's pipe-driver scratch scripts
  (run-stockdoors-pipe.js, run-stockdoors-pipe2.js,
  write-one-file.js) and flap probes (impair-test.js,
  plain-write-test.js) are flap-era workarounds, NOT part
  of the judged instrument, and were deleted before commit.
- Infrastructure notes (loud): the container write flap
  blocked all file-data writes ~01:11–02:52 UTC (see
  Recovery note); the worker's corpus was invalid at
  handoff and was rebuilt from scratch by the coordinator;
  no ref surgery was performed at any point. The
  safe-commit index-clobber variant is checked after
  every commit per the documented recipe.

## Verdict (judged against the pre-registered bar, not re-scored): NO-GO

Leg 1 (det-gate byte-identical), leg 2 (coverage 8/8, 8/8,
100% linked), leg 4 (generic 87.5%, 0.198%), and leg 5
(dried 0.70% vs 2%) all pass; leg 3 fails on its rate half
(9/12 = 75.0% vs the 80% bar; pooled 0.245% passes). The
two doors this arm was built to capture ARE captured —
the generic family closes from +88k…+341k to −800…+3,177
per seed and the dried channel closes from 8.78% to 0.70%
— but the named-family ledgers do not close as barred, by
one family-seed. The confirm band 9768–9779 is unspent.
