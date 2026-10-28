# sim-food-economy-round-2224-b — coordinator evidence (loop B, run fleshout-loop-b-20261028T2224Z)

Axis food-economy (converging). Loop A live on scale-onramp for the whole run
(its 2115Z round landed mid-run as 31e404838, fieldability + chainkill
DIAG-GO — NOT touched; its next trees tileparty/sortiedpr appeared late in
the run, NOT touched). B took the tracker's named next blanks in order: (1)
nighttravel metric-revised rerun, (2) dawn-hall fight-origin trace. Base at
arm start 118d865eb; final master 3b3525073 + this coordinator commit.
Pre-flight: main tree clean (the known ONTOLOGY.md 0-byte transient had
resolved itself before arm start), disk 17%. Reap: registry-aware, no
removals; it flagged sim-nighttravel-b uncommitted changes mid-run (the
running worker's in-progress work, left alone) and sim-chainkill-a
uncommitted changes (sibling's, left alone).

## Arm 1 — sim-nighttravel-rerun-b: INSUFFICIENT-DATA, NOT merged, branch HELD

Held branch sim-nighttravel-b (worktree sim-nighttravel-b, left registered
with a fresh heartbeat, worktree clean, only committed work). New commits on
the held branch, all via safe-commit.sh, all before/after as stated:
- c67e68d47 prereg, committed BEFORE any judged run: primary M1r =
  within-reach away-evening conversion, GO bar >= 0.50, minimum-n >= 8 pooled
  within-reach evenings, pre-declared extension band 10758-10765 after pilot
  10750-10757, same G1/G2/G3 guards, expedition-away and blocked-path-away
  as separate populations, streaks/taps secondary.
- bdf21b4b2 instrument: analyzer --rerun population partition + rerun proof,
  committed BEFORE any judged run, validated on the 2126Z corpus first
  (withinReach 2/2, expedition 18, verdict insufficient-data at n=2 — the new
  rule does NOT retroactively pass the old run).
- 29faec509 evidence + pilot/extension/pooled corpora + analyses (64 files).

Verdict, judged ONLY against the rerun prereg: INSUFFICIENT-DATA. Pilot
10750-10757 yielded withinReach n=0; pre-declared extension 10758-10765
yielded 0 more. Pooled 16 seeds / 480 evenings per leg: primary 0/0 = null,
n=0 < 8. No confirm spent. The lever was never exercised by this blind
band — not a lever failure and not a pass. Policy vs control corpora are
identical on every per-seed row (deaths, causes, inside taps, wave reach).

Populations (pooled, disjoint, summing to away 7): withinReach 0,
expeditionAway 0, blockedPathAway 6 (all seed 10757, forest_floor (3,3), d2
from haven, haven offered, every hop refused `block:creek`, days 25-30, all
5 tap days lost), blockedGuardAway 1 (seed 10751, blocked-combat),
havenUnknown 0, unclassified 0. Secondary: streaks broken 0/2, away taps
attempted 6 converted 0, withinReach taps 0/0.

Guards: G1 holds (median 30 vs 30, all 32 instances survived 30 loop-days);
G2 holds (starvation 0 vs 0). G3 flagged as implemented (6 violations) —
all 6 are the 10757 refused hops, whose arrival is recorded as their
departure (the honest refusal signature) but counted as landing failures by
the landing check. Zero mid-fight/tent entries, zero forced/multi hops,
agreeFalse 0. NOT fixed mid-run per §14; the fix is proposed for the next
run (landing check only for hops that moved; refused hops verified by
arrival == departure).

Sense: no travelled-home or out-of-reach evening exists in this corpus —
that absence is the finding. 10757 reads honestly in-transcript (the game
narrates the creek block nightly; mornings confirm the player still wakes
at (3,3)). The fix class is daytime crossing (bridge/swim/route), not
evening travel. 10751's blocked-combat night is a real fight (Ugly-Eyes x4),
guard correctly refusing travel mid-fight.

Proof: rerun proof PROOF-GREEN on the pooled corpus (R1-R11). Legacy proof
PROOF-RED on T3 + T8 only, both traced: T3 fails solely on the 6 refused
hops (same landing-check overcount as G3); T8 fails vacuously (0 converted
evenings, so no travelled-home tail exists). T1, T2, T4-T7, T9 pass.

Deliberately NOT done: 10714/10720 were NOT run — per prereg they are a
post-verdict diagnostic only, never part of the verdict. The prediction
(their tap-day positions sit in single-hop reach) remains unmeasured.

Coordinator judgment: NOTHING from this arm merges. Merging the held branch
would land the default-OFF policy file plus corpora of a lever never
exercised in this band; the branch stays held exactly as after 2126Z, for
a next run that (a) commits the G3 landing-check fix before any judged run
and (b) preregisters a seed strategy that can actually reach n>=8 (larger
band, longer horizon, or away-presence screening that never screens on
conversion outcome — blind 8+8 yielded 0). Evidence lives on the held
branch (evidence/2026-10-28/sim-nighttravel-rerun-b.md + prereg + pooled
analysis); this coordinator file is its master-side pointer.

## Arm 2 — sim-dawnhall-b: GO, LANDED

Branch sim-dawnhall-b, rebased cleanly onto 31e404838 (loop A landed first;
zero file overlap), proof re-run PROOF-GREEN on the rebased branch, merged
--ff-only as 3b3525073, proof re-verified on merged master, tree released,
branch deleted. Commits: d1852c779 prereg (before any judged run),
51440d4b6 tracer + analyzer + proof (measurement only, zero src/js),
3b3525073 evidence + corpora. Worker commits hit the safe-commit index
clobber variant each time; worker repaired via cacheinfo, commits verified
correct via git show --stat; coordinator re-verified status clean after
merge.

Verdict, judged only against the prereg: GO — fight-origin completeness
100% (3/3). Reproduction first, no expansion, no re-picking: same substrate
as morningpersist (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=insideevening, 30 days), seeds 10710-10725: 411
morning-after-inside-evening observations, exactly the morningpersist miss
set — 10712/21, 10720/18, 10722/30. Tracer trajectory-neutral (move counts
match the morningpersist corpus on all 16 seeds; 4,304 checkpoints / 3,993
verb records / 1,803 fight-origin records).

The answer — all three fights are the same arrival: a night haven RAID in
a village with no palisade ("No walls"), whose first still-standing raider
is sent at the player inside the haven, resolved by the harness contest
drive from pendingEncounter into a blow-by-blow hall fight, fled through
the doors. Pending creator on all 3: havenRaidTick (via progDaily/endDay);
fight creator on all 3: startCombat from the harness driveContests pending
fallback. Wanderer, feast-draw, and door-fled re-engage creators appear in
NO miss interval — those hypotheses are killed for this miss class.

- 10712/21: lone Murkcap (28/65 HP, not veteran); raid of 4; sleep REFUSED
  ("too late for real sleep"), dawn via the first wait's day-rollover endDay.
- 10720/18: Hushpuppy 4-pack (none veteran); raid of 5; same refused-sleep
  shape. A second, separately traced fight that morning (solo Choir Toad
  from a monsterTurn bump, no pending slot) proves the tracer distinguishes
  routes.
- 10722/30: Big Beast 4-pack (none veteran); the true sleep case — raid
  fired during sleep's endDay (phase sleep), pending already true
  post-sleep, fight live before upkeep-1.

Refinement of morningpersist (not an overturn): on 10712/10720 "the night"
was an awake wait in the hall, not sleep — dawn-rollover raids, not
sleep-chunk encounters. The mover (flee-by-door) and miss set are unchanged.
Sense read: with the fighter named, the arrival reads sensibly
in-transcript (raid announced, defenders named, BREACH line, fight intro).

Documented, not built (measurement only, per prereg):
1. Next-arm question (steve-call): should the hall itself shelter a sleeper
   from the raid's sleeping-player slot? No canon doc covers raids/palisade
   sleep; the rule as built is stated only in havenGrowth.js's header
   comment (no palisade -> one raider can reach the sleeping player;
   palisade -> safe sleep). All 3 misses sit on the no-palisade branch.
2. Wording gap: "eyes on your bedroll" fires for a player who never slept
   (sleep refused, awake in the hall) on 10712/10720.
3. Metric refinement for the next run: define the pending route by
   creation-in-interval, not post-sleep state — 2/3 misses had post-sleep
   pending FALSE because the raid hadn't fired yet.

## Wall (this run's judged corpora, NOT a win-seeking run)

Dawnhall (30d): national/table/wins 0/0/0 (not observable in 30 days,
reported not omitted); wave 4-5 reach 0 (max unlocked 3 on 10714 only);
wave kills 90; median survival 30d. Nighttravel rerun (30d): national/
table/wins 0; wave reach identical both legs (wave 1: 4 seeds, wave 2: 10,
wave 3: 2, waves 4-5: 0); median survival 30 vs 30. No wall movement claimed:
one measurement arm landed, one policy arm never exercised.

## Telemetry deviation check

On the dawnhall corpus (n=16): 3 LOUD lines (national 12->0, table 16->0,
wins 16->0), all the KNOWN field-shape + regime artifact class (30-day
pre-seat substrate vs WINSEAT baseline); no exiled LOUD line; baseline NOT
rolled.

## Metric review (MEASUREMENT.md §14)

- Nighttravel: the revised metric worked as an instrument (it partitioned
  the populations and refused to pass a never-exercised lever), but the
  blind-band seed strategy cannot reach n>=8 (0 in 16 seeds). Next run must
  preregister a reaching strategy, not a friendlier bar. The G3 landing
  check overcounts honest refusals — fix before any judged run, never
  mid-run.
- Dawnhall: pending-route definition should be creation-in-interval (see
  documented item 3 above); no verdict effect here (all 3 origins complete
  under either definition once traced).

## Backlog maintenance (sim-findings.md, this run)

Appended [open]: creek blocked-path (second blocked-path member after the
fallen-tree smoke finding); G3 landing-check fix + reaching seed strategy
as the next nighttravel run's prerequisites; hall-shelter steve-call
question; "eyes on your bedroll" wording gap for never-slept players.

food-economy stays converging (NOT converged): the dawn-hall origins are
now fully traced, but the nightly travel-home lever is still unmeasured in
its within-reach population (n=0 in 16 blind seeds) and its policy file
remains held, unlanded. scale-onramp stays converging (untouched; sibling
loop A lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-28/sim-dawnhall-b.md (on master) +
evidence/2026-10-28/sim-nighttravel-rerun-b.md (held branch
sim-nighttravel-b, NOT on master).
