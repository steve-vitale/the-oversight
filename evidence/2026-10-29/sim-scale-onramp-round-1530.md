# sim-scale-onramp-round-1530 — coordinator evidence (Loop A, run fleshout-20261029T1530Z)

Axis: scale-onramp (blocking axis, converging, NOT converged).
Loop B live on food-economy (1530Z woodcarry2/rubbleroute, NOT touched);
build lanes live on arrival/geartier/staying, NOT touched.
All three arms below merged locally, pending ship. No push, no bump,
no live verification (ship loop owns deploys).

## 1. Stale-lock recovery (run start)

The 1315Z Loop A lock was 121 minutes old at run start (created
13:29Z, now 15:30Z) and both its workers' registry heartbeats were
stale (sim-holdsjoin-a 13:35Z, sim-pickband-a 14:04Z) — dead under
both guard rules (heartbeat >15 min stale; lock >90 min old).
Both workers had finished and committed clean work that was never
merged. Lock retired (renamed to .stale-20261029T1530Z), 1315Z claim
retired to .DEAD, this run's lock + claim written before any sims.
No live run was disturbed: Loop B's own lock (fleshout-loop-b.lock)
and claim were never touched.

## 2. Arm 1 — sim-holdsjoin-a ADOPTED (DIAG-GO, landed b6b1ec1db)

Stranded 1315Z arm: joined lag+verdict analyzer over the hunthold
corpora. Coordinator rebased it onto master 76e82eb1a (clean) and
re-ran proofs before merging: fixtures 11/11, analyzer output
byte-identical to the committed analysis JSON. Verdict stands as
published in evidence/2026-10-29/sim-holdsjoin-a.md: all five
prereg legs pass; the pick-only supersession misread is closed on
real data (2 of 4 apparent replacements on the OFF side were
actually danger overwrites; the murkcap pair reads as two verdict
overwrites, not two re-picks). Tree released done-merged, branch
deleted, main tree clean after merge.

## 3. Arm 2 — sim-pickband-a ADOPTED (DIAG-GO, landed 4cf1dd87e)

Stranded 1315Z arm: fresh-band wave-4 pick census, seeds 75117–75124.
Coordinator rebased it onto the holdsjoin merge (clean) and re-ran
all proofs before merging: fixtures 11/11, analyzer byte-identical,
sense tier-2 pass, neutrality 19/19 comparable fields exact,
determinism scratch re-run of seed 75117 byte-identical (one EPERM
write-retry recovered by the sweep's retry logic — noted, not a
failure). Verdict stands as published in
evidence/2026-10-29/sim-pickband-a.md: primary n=0 wave-4 HUNT
picks, 124 memory-holder picks, 4 offers, 0 takes, DIAG-GO.
Tree released done-merged, branch deleted, main tree clean.

## 4. Arm 3 — sim-picktime-a, fresh worker arm (DIAG-NO-GO, landed 6864661da)

Returns-a ranked-next item: a survivor-funnel diag recording PICK
time, not just departure. The worker determined before building
anything that no new recorder was needed (funnel-diag already
stamps picks, returns-diag already stamps departures, departhold-diag
already stamps verdicts); it built only the missing pieces — a thin
sweep wrapper for a plain-substrate all-channel corpus plus a joint
analyzer (departlag classifyPick imported verbatim, corrected link
rule requiring kind HUNT + huntDay). Zero src/js, zero policy files
added or changed, all recorders reused verbatim. Prereg committed
before any judged sweep (844f1f720 → rebased 4ecfd3edf).

Judged numbers (seeds 75101–75108, 180d death-aware, verbatim funnel
substrate): primary wave-4 HUNT picks n=0, secondary n=0, wave-4 HUNT
departures band-wide 0. Legs: corpus validity 8/8 PASS, join
completeness UNKNOWN 0 PASS (vacuous, stated), determinism (75106
scratch) byte-identical PASS, recorder-neutrality OFF vs ON 19/19
PASS, funnel-a channel neutrality FAIL (62 diffs), sense FAIL (no
primary pick to read). DIAG-GO required all five → DIAG-NO-GO per
metric binding; no leg waived or re-scored. Coordinator re-ran
post-rebase proofs (fixtures 6/6, analyzer byte-identical, legs
FAIL exactly as published) and merged; tree released, branch
deleted, main tree clean.

Root cause (investigated, not assumed): the base moved under the
funnel band. A verbatim funnel-a sweep re-run on seed 75101
reproduces the picktime row (110d, 143 meetings), not the funnel-a
corpus row (132d, 219 meetings); the first differing record is the
day-6 meeting armor 4→7, matching landed build-armor seed-bark
commit 062e07a7a + fix-all armor 9c650f840. Recorders exonerated
by the 19/19 OFF/ON pass. Consequence, recorded in the findings
backlog: funnel-a/departlag-a lag values (2d/8p departed stale,
0d/3p superseded by dinner) are now known-stale on current master
and must not be quoted as current.

Current-base description (unjudged where labeled): seed 75108 holds
the band's only 11 memory-holder picks — 5 wave-4 offers, 0 takes
(eulogy ages 1,1,2,3 refused for food/water/visit; reunion age 1
refused for chores), 0 wave-4 doorway evaluations. The current-base
story is offers-declined, not picked-and-waited. The corrected-link
diagnostic is vacuous on this corpus (0 over-link candidates, no
HUNT picks); the GUARD-rejection rule is fixture-proven only.

Next picktime run (from the arm's evidence, not built here):
pin the base commit or judge neutrality by OFF/ON alone, add a
tier-3 memory-holder sense fallback to the prereg, and screen for
wave-4 survivors on the armor-seeded master before committing a
census band (this band: 1/8 seeds with memory-holder picks, 0/8
with a HUNT pick).

## Wall numbers (bands, NOT before/after movement)

Pickband corpus (fresh seeds 75117–75124, funnel substrate): wins
0/8 (full 0/8), nationalEver 6/8, nationalFinal 5/8, table 2/8,
entered 0/8, wave-4 reach 6/8, wave-5 0/8, median 180d capped,
deaths 298 (combat-dominated: villager combat 146,
villager-vs-villager 63, player-the-wild 41).

Picktime corpus (funnel band 75101–75108 re-run on the armor-seeded
base): wins 6/8 (full 0/8, all lesser), nationalEver 7/8,
nationalFinal 7/8, table 6/8, entered 6/8, wave-4 reach 6/8,
wave-5 0/8, median 114d (not horizon-capped), deaths 240,
starvation 1. Different band and different base from pickband —
reported as the band's wall, never as movement. Full seat stays
0/8 on both bands; wave 5 stays 0/8 on both.

## Telemetry deviation check (loop body step 10)

Pickband corpus: the body's default command fires 3 LOUD lines
(national 12→0, table 16→2, wins 16→0). Re-running with
--sweep-rows on the 8 row files shows the national LOUD was a
field-alias artifact of the default mode (it reads a literal
`national` field these rows don't carry; aliased reading gives
6/8, no LOUD line). The remaining table/wins LOUD lines are the
baseline file's own documented regime artifact (WINSEAT baseline
vs pre-seat substrate; the baseline note forbids this comparison).
Picktime corpus: same pattern — default command 3 LOUD lines
(national alias artifact + table/wins regime lines); --sweep-rows
gives nationalEver 7/8 (no LOUD), table 6/8 LOUD, wins 6/8 LOUD
(lesser-seat wins vs a full-seat WINSEAT baseline). Exiled: no LOUD
line on either corpus. Baseline NOT rolled on either corpus.
Recommendation carried forward: telemetry checks on recorder
corpora should use --sweep-rows with a row-only glob (s751*.json,
not s*.json, which also matches summary.json).

## Metric review (for the NEXT run — never a mid-run re-score)

- Picktime's prereg failed on a comparison premise (funnel-a
  channel neutrality), not on its instrument. A future prereg for
  a re-baselined picktime run should carry its own verdict class
  for base-moved (the worker's evidence proposes DIAG-NO-GO-BASE-MOVED)
  so an instrument-proven, comparison-broken run is not filed as a
  plain NO-GO.
- Pickband's metric review stands (empty-primary legs pass
  vacuously; fresh-window pick counts alongside raw counts; first-gate
  attribution only). This run re-states, not re-judges, those points.
- No metric was changed mid-run in any arm. No verdict from a prior
  run was re-scored here; funnel-a/departlag-a lag values are
  reported stale on evidence, not revised.

## Village assessment in plain words

Eight fresh villages mostly survived without ever hunting wave 4 —
scaling and wave-4 hunting are barely the same story on that band.
On the older funnel band, re-run on today's game, the one village
that remembered a wave-4 beast was offered the trip back five times
and chose food, water, a visit, and chores instead. Nobody in
either band picked a wave-4 hunt. The binding scarcity is still
upstream of any lottery: too few wave-4 field fights survived, too
many survivors gated out (sheltered, homebound, fighting on their
own doorstep), and the rare offer losing to ordinary life. The one
genuinely new mechanism fact this run establishes is negative but
load-bearing: the old lag numbers the loops have been quoting no
longer describe the game, because armor seeding changed who walks
into those fights.

## Infrastructure notes

- Registry operations ran very slow under sibling load (worktree
  registration ~105s, release/remove chains 100–265s); one
  coordinator heartbeat process parked ~10 min at zero output on
  the registry lock and was killed after its purpose was superseded
  (its heartbeats had already landed; registry verified clean of
  the released trees afterwards).
- Container EPERM flap sighted once (pickband determinism scratch
  write, attempt 1) and recovered by the sweep's write-retry logic;
  no ref-write flap blocked any merge this run.
- Safe-commit index clobber did NOT hit this run's coordinator
  commits; the worker's two recorded exec failures (exit 1) left no
  trace on the delivered branch (all three commits present, tree
  clean, coordinator-verified).
- Master moved twice under this run from sibling lanes (Loop B
  1530Z food-economy landing, zero src/js, zero file overlap with
  any arm here; plus journey r66 evidence swept into that landing's
  diff). Both worker branches rebased clean; proofs re-run after
  every rebase.
- check.js --quick NOT re-run at coordinator level (zero src/js in
  all three arms; arm proofs are the landing gate).

## Findings appended

- [open] 2026-10-29 scale-onramp/measurement — funnel-a/departlag-a
  lag values stale on current master (see §4 + sim-findings.md).

## Convergence

scale-onramp stays converging (NOT converged): two stranded
DIAG-GO measurements landed, one fresh DIAG instrument proven with
a NO-GO comparison verdict, but no wave-4 field party has yet
killed in the field, the full seat stays 0, wave 5 stays 0. The
standing directive stands until the tracker records this axis
converged on measured evidence. Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-scale-onramp-round-1530.md
(coordinator, this file) + sim-holdsjoin-a.md + sim-pickband-a.md
+ sim-picktime-a.md + corpora perseed-pickband-a/ +
perseed-picktime-a/ (all on master, merged locally pending ship).
