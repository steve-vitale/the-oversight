# sim-food-round-1730 — Loop B 1730Z coordinator evidence (axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261102T1730Z.
Axis food-economy (second non-converged axis; scale-onramp is Loop A's
lane — Loop A live at run start on 1715Z arms sim-npcdeadconf +
sim-fightoutrec, NOT touched; Loop A closed out mid-run and a new
Loop A run 1825Z started its own landing recovery, also NOT touched).
Claim written before any sims; lock created at run start; both
retired at closeout (see Infrastructure for the deferred branch
deletions). Pre-flight: main tree clean, disk 22%, reaper removed
nothing sibling-owned.

## Run-start verification (not rework)

1636Z next blank (0) — gatedisengconf-b landing recovery + pending
coordinator evidence — was ALREADY recovered before this run's sims:
branch commits on master (b6deca172 results) and coordinator
evidence commit 40e62ed8b, both verified ancestors of master at
run start. No rework done; this run took blanks (1) and (2) instead.

## Arm 1 — sim-destfirst-b: DIAG-NO-BAND (merged 92233651b)

Destination-first homeward construction (backlog construction-method
item, claimed by this run). Worker branch sim-destfirst-b; original
commits 7fa2d14a9 (instruments) / 46dd58913 (prereg, before any
sim) / 0eaa385e5 (results); rebased onto master as 721c94ae8 /
fb4dd9ea8 / 92233651b; proof 21/21 re-run green on the rebased tip;
merged --ff-only, ancestor-verified in the same call.

Prereg bar (fixed before sims): >= 4 integrity-ok trips AND >= 1
established A AND >= 1 established C. Result: A confirmed 0/40,
C confirmed 8/31 — per the prereg stop rule NO judged band exists
and NO judged legs ran. No guard verdict, episode count, or lever
effect is claimed for either shape.

- Stage 1 screen (fresh band 69701-69740, verified zero hits in
  2026-11-02 .md files and zero matching filenames, outside all
  banned bands): day-1 and day-5-start E-maps over all 81 home
  tiles. Hits abundant (day-5-start A-LAT 431, A-POCKET 562,
  C-PAIR 422 across 40 seeds; 39/40 seeds have an A-LAT hit).
  The screen is not the bottleneck.
- Stage 2 confirmation (shadow-only homeconstruct runs, reused
  driver/policy unchanged): A hit its 40-try cap with 0
  confirmations. Failure partition: 14 clean-entry trips where
  the scholar camps at the destination and day-end escape still
  passes via lateral (legs=1, direct still failing); 4
  walk-out-complete trips where entry-hop E already failed
  (incl. 69709 dest 5,8, a real pocket at the destination but
  pocketed on entry); 22 engine-blocked routes. One day of
  foraging never kills the lateral chain — the A pocket that
  closes during the trip day never occurred.
- C's 8 confirmed destinations (69702 0,7; 69704 1,7; 69706 0,1;
  69707 8,3; 69709 1,1; 69713 8,4; 69714 0,3; 69717 0,3) are
  STAGE-2 ONLY: no armed legs, no origin-E verification, no
  episodes — "constructible", not judged. A C-only judged band
  can be pre-registered from these 8 without re-screening.
- Panel: vacuous by design — the prereg's panel attempt is
  defined on A-shape judged seeds, and none exist. No compare
  fabricated.
- Caveat (in the arm evidence, ledgers authoritative): stage-2 C
  filenames omitted the origin, so 4 same-seed/same-dest try
  pairs overwrote each other's files. Per-try CONFIRM lines were
  computed before overwrite; the one overwritten confirmed file
  (69707 8,3) was restored by an exact deterministic re-run
  (reproduced its ledger line exactly) and the later try kept as
  …-8,3-origin-8,2.jsonl. Next run's filenames must include
  the origin.
- Sense: confirmed C trip 69702 reads human (water-hauling,
  stone-piling, "Nobody walks alone today", hunger lines); the
  forced walk-out itself leaves no narrative trace (instrument
  behavior, not a game verdict); no homeward veto line exists
  anywhere in this arm because no armed legs ran.
- Zero src/js changes; zero edits to competent.js, guard
  policy, construct policy, drivers, or analyzers.

## Arm 2 — sim-collapseband-b: TIMELINESS-FAIL (merged 61e019a85)

Gatediseng timeliness re-confirm, third statement (backlog
gatediseng-timeliness item, claimed by this run). The
gatedisengconf-b cost PASS stands untouched — this arm judged a
different leg. Worker branch sim-collapseband-b; original commits
7a22a9c8f (prereg, before any judged sim) / 91ccb2602 (thin band
analyzer + proof) / 7aeea0118 (results); rebased onto master as
5a79d95ae / 81745132f / 61e019a85; proof 10/10 re-run green on
the rebased tip; merged --ff-only, ancestor-verified in the
same call. Cross-check: thin analyzer vs reused analyzer
first-(c)-firing, 0 mismatches on 4/4 band seeds.

Screen 79001-79064, 30d competent, DEPOSITGATE=1 gatecover
substrate (one consistent substrate throughout; substrate
disclosed in the prereg). Collapse rate 4/64 = 6.25%; pooled
with prior screens 5/124 = 4.0% — a 12-seed band finds zero
collapses ~61% of the time at 4%, which explains the vacuous
522 and 767 bands. Collapsing-band screens need a 64-seed
budget. No metric, threshold, seed, collapse definition, or
rule was changed mid-run; block summaries counted collapse
status only and no (c) firing was computed until screening
stopped. Verification: rows == daysAlive on 64/64 screen seeds
first try, day-1 row present on 64/64, seed 79001 re-run
byte-identical.

| Seed | Lost | First starvation | (c) firing | Lead | Result |
|---|---|---|---|---|---|
| 79006 | day 24 | day 23 | never | — | FAIL — cliff: 7,560 → 4,585 → 0 → 0; no strict 3-fall window can form |
| 79019 | day 25 | day 20 | day 19 (S=15, 9,850 → 4,468) | 1 | FAIL late — day-16 pantry rise breaks the fall run |
| 79031 | day 22 | day 20 | never | — | FAIL — cliff: 6,950 → 2,500 → 0 → 0 |
| 79064 | day 26 | day 25 | day 20 (S=15, 8,853 → 5,450) | 5 | Carried leg pass, 51608-class miss by 1 day — days 16–17 pantry rises delay firing |

Verdict judged exactly against the prereg: rule (c) warns in
time on 1 of 4 collapsing seeds by the carried >= 3-day margin,
and on 0 of 4 by the 51608-class >= 6-day margin. Timeliness
is NOT re-confirmed; 51608 (day 15 vs starvation day 21)
remains the sole in-time observation, now outnumbered 1-to-4
on fresh evidence. No deploy claim may cite this arm for
timeliness.

Mechanisms (structural, not tunable): CLIFF-BLINDNESS (half the
band — any 3-fall rule is structurally blind to a 2-evening
emptying, and the 0 → 0 evening is flat, not a fall) and
BOUNCE-DELAY (a 1–2 evening rise after stand-down restarts the
3-fall clock). Common thread: the big slide happens largely
while ENGAGED, so (c)'s stand-down anchor starts watching
late. Sibling texture (not judged): (a) TOTAL-SLIDE warns in
time on 3/4, (d) on 2/4 — the failure is (c)-specific in shape,
but (a)'s failed pilot cost leg (4/8) still stands, so no swap
is claimed; the tradeoff is now measured both ways.

Hunger-streak texture for the sensor non-pantry collapse
signal theme: streak rises through all four collapses (to 6,
8, 4, 3) while the pantry voice goes quiet or thin —
reported, not chased. Survivor-starvation texture: 5
surviving screen seeds starved people and lived (79001,
79003, 79011, 79021, 79028). Sense: the 79064 day-20 warning
would read as the village noticing inside a run of thin-pack
evenings; the 79019 day-19 warning reads as noticing one
evening too late; the cliff villages' pantry voice is silent
(79006) or speaks only on the day people start dying
(79031). Villagers otherwise act like people in transcript
(barter, mending, food identification, a leadership
challenge).

## Wall numbers (this run's judged corpora — 30d windows, honestly limited)

- Collapseband screen (64): survived 60/64, median survival
  30d capped; wave 3 on 38/64, wave 2 on 26/64; waves 4–5,
  national, table, wins 0 in-window (late-game states, not a
  rate claim). Deaths 1,378 total, starvation 25 (17 on band
  seeds, 8 on 5 surviving seeds — the 76712 shape recurring).
- Destfirst stage-2 legs (68): 67 survived 30d, 1
  village-lost; maxWave 3 (wave-2 on 19, wave-3 on 49);
  national / table / wins 0. No wall movement shown or
  claimed by either arm.
- No wall claim: both corpora are 30d construction/screening
  windows, not win-seeking runs.

## Metric review

No metric was re-scored mid-run in either arm. Destfirst's
panel leg was vacuous by prereg design (no A judged seeds);
no compare was fabricated to fill it. Collapseband's
collapse definition, screen budget, and timeliness bars were
fixed in its prereg before judged sims; the 76712 day-9
firing was NOT cited as a collapse averted (surviving
village texture only). Open metric question carried forward:
a future sensor prereg should judge a rule shape that sees
cliffs and bounces (not another threshold on the 3-fall
clock), and should pre-register whether (a)/(c) tradeoff
judgment uses the same collapsing band.

## Telemetry deviation check

Prescribed invocation on both screen jsonl corpora returned
one LOUD line each, both recorder-format parse refusals
(non-whitespace character after JSON at line 2 column 1) —
the same artifact class as prior runs, NOT a deviation
signal. Baseline NOT rolled, no investigation item.

## Infrastructure (read before retrying anything here)

- Container EPERM flap (same class as 2026-10-23 and 1636Z)
  hit this closeout repeatedly: collapseband rebase failed
  writing rebase-merge/head-name (left a stale dir holding
  only two 0-byte files, head-name + interactive, no picks
  applied, HEAD unchanged — removed per git's instruction,
  branch verified intact); `git rebase --abort` failed on
  the missing onto file; registry heartbeat writes failed;
  a destfirst merge failed writing .git/ORIG_HEAD.lock; a
  first collapseband merge attempt printed "Updating
  6a7a6e454..0c824af8d" but the ref did NOT move (stale-lock
  warning present, pipe masked the failure — verify merges
  with an ancestor check in the SAME call, never from the
  "Updating" line alone); branch deletions and registry
  releases failed writing packed-refs.new. NO ref surgery
  was forced during the flap. All merges below were
  verified by ancestor check in the same call after writes
  cleared.
- A sibling journey-landing r88 commit landed on master
  mid-closeout (d8eafc71b) and left 4 untracked r88 scripts
  in the main tree; the sibling cleared them itself. Main
  tree tracked status is clean at closeout. The sibling's
  landing is also the likely explanation for the first
  collapseband merge confusion — master moved under the
  closeout; the final merges were rebased onto the then-
  current tip and verified.
- Safe-commit index clobber (staged-deletion variant) hit
  all worker commits; each was repaired via HEAD-blob
  cacheinfo with commit contents verified. No clobber
  check is owed on the coordinator commit below beyond
  the usual post-commit status verification.
- DEFERRED (branches merged, deletion pending flap-clear):
  branches sim-destfirst-b and sim-collapseband-b are
  ancestors of master (verified) but `git branch -d`
  still fails on packed-refs.new writes, and
  worktree-release.sh fails on registry writes. Worktree
  directories are already removed. Recovery when writes
  clear: `git branch -d sim-destfirst-b sim-collapseband-b`
  then `bash scripts/worktree-release.sh <slug> merged`
  for each; registry entries will otherwise age out via
  the reaper (4h stale). Nothing is lost if this waits —
  the commits are on master.
- check.js --quick NOT re-run: zero src/js changes, zero
  green-list files, and the standing 280/7 pre-existing
  profile was recorded by sibling runs this cycle.

## Verdicts

- sim-destfirst-b: DIAG-NO-BAND. Destination-first
  construction solves the C construction problem at
  stage-2 level (8 constructible destinations) but NOT the
  A problem (0/40). No guard verdict exists for either
  shape from this run.
- sim-collapseband-b: TIMELINESS-FAIL. Rule (c) is not
  timely on a fresh collapsing band (1/4 carried, 0/4
  51608-class). The (c) deploy spec stays deploy-ready on
  cost only; timeliness must not be cited from this arm.
- Merged locally, pending ship (both arms; branch
  deletions deferred per above, commits on master).

food-economy stays converging (NOT converged): the homeward
guard still has no judged A or C band, and the gatediseng
sensor still has no timely rule on a fresh collapsing band
— but both blanks are now measured rather than guessed, and
the next preregs are construction calls, not bigger bands.
scale-onramp untouched (sibling Loop A lane; its 1715Z
landing recovery is its own 1825Z run's work, NOT taken
here).
Next blanks, in order: (1) C-only judged band from the 8
confirmed C destinations (no re-screening); (2) A-timescale
construction — check day-ends over days 5–8 with day-end
position == destination required, since one day never
closes the lateral chain; (3) C-filename-origin instrument
fix (filenames must include the origin); (4) sensor
redesign addressing cliff-blindness + bounce-delay (a new
rule shape, not a threshold tweak; (c)-vs-(a) tradeoff
measured both ways, no swap claimed); (5) hunger-streak
non-pantry collapse signal (backlog item 10 theme);
(6) panel/driver substrate divergence isolation (standing);
(7) guard-E creek-hop fidelity (69502); (8) pocket
persistence mechanism (69501 day-12 opening); (9)
guard→succession cascade (69604); (10) shape D Steve-call
(unchanged); (11) 60501-shape roadwork-credit band;
(12) guard + return-capability pairing OR a second
veto-budget shape, decided up front; (13) pantry-cap-as-
garden-bottleneck (74007); (14) standing-load remainder;
(15) pack-full refusal narration; (16) HUNGER WINTER relief
passivity (steve-call candidate); (17) shelling
default-flip call; (18) P3 reset follow-ups; (19)
patrol-departure narration; (20) garden/fish/traps early
path; (21) creek clearance wood-bound (evening
wood-carrying first; read Loop A creekwood arm before
re-screening); (22) rubble daytime-clearing habit;
(23) washed_out scramble narration; (24) 96-tick bridge
edge; (25) 120d window only on a new horizon-cut episode.
Claim deleted; lock deleted (branch deletions deferred,
see Infrastructure).

## Landing addendum (successor run fleshout-loop-b-20261103T0036Z, axis food-economy)

This file is the 1730Z coordinator evidence verbatim above, filed by the
successor run — NOT by run 2233Z, which died before landing it (its
own cband pilot was recovered and merged in this same run as
f7bd5070f). No judged sim was re-run for this filing; the 1730Z
verdicts stand as written.

Deferred items from the 1730Z Infrastructure section, resolved here:
- Branch deletions MOOT: `git branch` shows no sim-destfirst-b and no
  sim-collapseband-b, and the registry holds no entries for either
  slug (verified 2026-11-03T00:5xZ). Nothing to delete, nothing to
  release; the commits were already on master.
- The 1730Z next blanks stand, updated by this run: blank (1) C-only
  judged band is now LANDED (f7bd5070f, pilot GO 7/8 integrity-ok, 7
  established-band, 0 episodes outward-fenced); blank (2) A-timescale
  construction is the live arm of this run (sim-atimescale-b,
  brief hidden_files/arm-briefs-20261102/sim-atimescale-b-brief.md);
  blanks (3)–(25) unchanged.
- Pending file retired: hidden_files/coord-1730-pending-evidence.md
  moved to .LANDED by this run after this commit merged, so no later
  run re-files it.
