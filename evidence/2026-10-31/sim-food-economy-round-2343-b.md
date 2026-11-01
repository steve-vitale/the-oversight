# Loop B round 2343Z — food-economy: TILE strand census NO-GO + travel-refused hunt HELD (merged locally, pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T2343Z, axis food-economy (converging).
Loop A live claim at run start (2156Z, scale-onramp: twoblow + contactrec) NOT touched; Loop A
landed during this run (round 2156 coordinator evidence b0973a64b: 1 BUILD GO + 1 instrument GO)
and its claim retired before this closeout. The batch ship loop also ran mid-run (version bump
24bf27d80), and journey-succession r89 (daf9e7c76) landed between the two arm bases. Both arms
were rebased onto the moving master, proofs re-run green after each rebase, and merged --ff-only
in sequence. Origin/master NOT fetched before merging (local-only merge per loop procedure; ship
loop owns pushes — no divergence claim made either way). check.js --quick NOT run at coordinator
closeout (arm proofs are the landing verification; --quick has hung under concurrent loop load in
recent rounds — cited neither as pass nor as failure).

## Arm sim-strandtile-b — DIAG-NO-GO (count bar only)

Worker branch sim-strandtile-b, base 5aa816b4e (Loop A's twoblow landing). Commits as landed
(post-rebase hashes; worker-reported pre-rebase hashes in parentheses): 9ecf9e781 prereg
(b6197f96), 80ea4fe18 instruments (c9da718c), 089533908 evidence (502172d5). Proofs re-run
green after rebase and post-merge in the main tree: test-strandtile-b 9/9, test-confirmednight-b 4/4.
Diff guard empty for src/ and scripts/policies/ (35 new files: prereg, evidence, analyzer, proof
test, 3 corpora / 24 per-seed files, 4 censuses, stderr logs).

Verdict judged exactly against the prereg: 4 of 5 bars passed, bar 4 (count bar) failed on its
second half — a miss is NO-GO, never re-scored.
- Instrument gate PASS: 24/24 legs, errs 0, decisions == evenings.
- Classification completeness PASS: 100% (12/12 confirmed nights classified, 0 unclassified).
- Strand reproduction PASS: both named P1 F2 strands re-derived exactly on current master.
- Count bar FAIL: pilot half passes (2 seeds with episodes) but the outside-pilot confirm cell
  (P1 F1 30d, 8 fresh seeds) has zero creek-tile evenings, zero confirmed nights, zero episodes.
  The 60d extension adds no new seed and no new episode.
- Sense PASS: 17513 days 5–9 reads as a person stuck working a creek line, not camping
  (creek mornings, out-of-reach every evening, three blocked crossings a day, foraging, learning
  counters, meeting Valeria; day 11 dawns at haven with a different vessel). Standing gap stated
  in the arm evidence: no line says "she turned for home" — the failed return is an outcome
  record plus refusals, not narrated homeward intent.

First strand-rate baseline (P1 nighttravel-stack only): pilot P1 F2 30d — 2/8 legs with >= 1
episode, 2 episodes, lengths {1: 1, 5+: 1}, ends {SUCCESSION: 1, MOVED-ELSEWHERE: 1}; 6 confirmed
nights, all 6 FAILED-RETURN, blocked-crossing flag 6/6. Confirm P1 F1 30d — 0/8 legs, 0 episodes
(one genuine absence, 17507, never a creek evening). Confirm P1 F2 60d — same 2 episodes, zero
new episodes in days 31–60. Distinct seeds with >= 1 episode: 2 of 16 (12.5%). No episode ends
by walk-home, attempt-stops, sleep-return, horizon, or village-death. Drift vs confirmednight:
ZERO on the shared P1 F2 30d cell, seed-for-seed — confirmednight's counts and named strands
remain current.
Named strands (unchanged): 17513 P1 F2 episode days 5–9 (length 5), end SUCCESSION; 17511 P1 F2
episode day 10 (length 1), end MOVED-ELSEWHERE. Retired: none. New named strands: none.
DIAG-NO-GO authorizes NO src/js fix and NO criterion merge.

## Arm sim-refusedband-b — DIAG-HELD (gate 2 stays untested as a band measurement, not failed)

Worker branch sim-refusedband-b, base 24bf27d80 (ship bump). Commits as landed (post-rebase
hashes; worker-reported pre-rebase hashes in parentheses): 6414ca641 prereg (d51826c63),
598b3b962 instruments (a949bafa7), e47bd84f4 evidence (8234ac6a8). Proof re-run green after
rebase and post-merge in the main tree: test-refusedband-b 39/39. Diff guard empty for src/ and
scripts/policies/ (105 new files: prereg, evidence, hunt driver, analyzer, proof test, 10 corpora,
10 censuses, stderr logs).

Verdict judged exactly against the prereg: GO required (a) instrument gate clean, (b) one cell
with >= 5 travel-refused evenings on >= 2 seeds, (c) gate-2 agreement N/D over that band's
block:creek evenings with D >= 1. Travel-refused evenings DO exist (37 in 2,855 judged
evenings), but all 37 sit on a single seed (17606), so no cell meets (b). Bounded search
exhausted → HELD, not GO, not killed.
Search space (10 cells, 80 legs, 2,855 evenings, prereg order): deed-seeking 30d G1 control
(240 ev, 0 ref) → BARE 30d G1 (240, 9 ref, 1 seed) → BARE 30d G2 (240, 0) → STRANDFIX 30d G1
(240, 9, 1 seed) → WAITSALIGN 30d G1 (240, 9, 1 seed) → SELECTTRIM 30d G1 (240, 9, 1 seed) →
P1 30d G1 (240, 1, 1 seed) → P1 30d G2 (240, 0) → P1 60d F2 (455, 0) → P1 60d F1 (480, 0).
Definitions verified against code before any judged leg: travel-refused = nighttravel.js
nightStep outcome 'travel-refused' (haven offered + one honest travelTo hop + post-hop position
!= haven; 'out-of-reach' is no attempt and never counts); gate-2 agreement = bucket 'creek' /
hop 'block:creek' via creekremedy-diag.js classifyRefusedEvening + bucketOf.
Single-seed lead (explicitly NOT a band result): all 37 refusals hop block:creek, bucket creek,
probeAgrees true, probeError null, narrated 37/37 — pooled agreement 37/37, never cited as a
band. Seed 17606: meadow (3,3), distance 2 from haven (4,4), refused at intermediate creek tile
(4,3) on days 4–9 and 13–15, identically on all four no-rescue stacks; a route-around exists
(length 2 via (3,4)) but the night step takes one direct hop only. On P1 the same seed refuses
only once (day 4) because woodcarry's bridge attempt succeeds (wood 4, kcal 2232, 111 ticks)
and rescues the vessel — a rescue stack collapses a refusal run to a single evening. No refusal
of any other block type anywhere; 60d horizons on the buckettile bands added 935 evenings and
0 refusals.
Caveat carried from the arm evidence (metric review): the P1 60d F2 census gate flag reads
false on one leg (17518, village-lost day 35) — NOT a broken instrument (35/35
decisions==evenings, errs 0, harness stop record engineOver/villageLost true); only the
analyzer's evening-row gameOver flag misses overs landing in the sleep step. Flag left as
computed, leg judged, verdict invariant (cell 0 refusals either way). Predicate fix filed
under metric review in the arm evidence for the next run.

## Village assessment (plain words)

The village, watched through these two lenses, strands rarely and only in one narrow place:
on the night-travel stack, two seeds out of sixteen leave someone sleeping by a creek unable
to get home, and one of those stays five nights, working the creek line, learning, meeting
people, and then turning up home under a different vessel's story. Everywhere else, people
either never reach a creek at night or get rescued by a bridge before a refusal can repeat.
The refusal story, where it does repeat, is fully narrated and fully consistent — a person
turned back at the same creek crossing night after night because the night step only tries
one direct hop. What is missing is not narration but population: a wider set of seeds, or a
way of living that actually puts villagers at creeks, before anyone can say how often
stranding happens, and a second refusal seed before the creek-block agreement can be judged
as a band rather than a single-seed lead.

## Infrastructure notes (this run)

- Container EPERM write flap active ~23:47–00:03Z: blocked registry heartbeats (fsync) and
  .git ref writes (worktree registration failed twice with "couldn't write ... .lock").
  Recovery was retries only, no force, no ref surgery, no registry hand-edits. Flap cleared
  by 00:10Z (heartbeats landing again). Safe-commit index clobber hit all three commits of
  each arm (committed files showing staged-as-deleted while byte-identical); workers repaired
  each time via --add --cacheinfo from HEAD blobs, hash-verified; coordinator re-verified
  clean status after every merge. Commits never in doubt.
- Registration contention: the first tree-2 retry collided with a concurrent
  journey2-succession-r89 registration; a 10-minute "still landing" wait reading was a
  self-match artifact of the wait pattern (pgrep matched its own command line) — corrected
  pattern used for the successful retry. Loop A's coordinator was mid-landing in the main
  tree during the flap window; no main-tree writes were attempted by this run until both
  sibling landings had completed.
- Reaper at closeout removed nothing (all remaining trees active or dirty — sibling-owned,
  refused as designed). Trees released as done-merged, branches deleted, main tree clean
  at closeout.

## Telemetry deviation check

Ran node scripts/telemetry-check.js against the scale-wall baseline on both census sets
(strandtile 4 files, refusedband 10 files): 3 LOUD lines each (national 12 -> 0, table
16 -> 0, wins 16 -> 0), INVESTIGATED as the known missing-field artifact (pre-seat censuses
carry no national/table/wins fields); baseline NOT rolled, no new investigation. Note for
the next run: the tool takes a single glob argument with the wildcard in the final segment
only ('evidence/2026-10-31/sim-*-census-*.json' works; a mid-path wildcard or an unquoted
multi-file expansion does not — it scandirs the literal segment or prints usage).

## Wall (last measured, NOT re-measured by these pre-seat censuses)

Full seat 0 / wave 5 reached 0 stand as the last measured wall state (Loop A lane).
food-economy stays converging (NOT converged): the strand program now has its first
strand-rate baseline (2 episodes, 2 of 16 seeds) and its first refusal lead (37 refusals,
1 seed) — but no strand lever has been judged yet, gate 2 is still untested as a band, and
no game change landed. scale-onramp untouched (sibling Loop A lane).

## Metric review

- Strandtile: a length>=2 episode bar would cut this baseline from 2 episodes to 1 — noted
  for the next prereg, not applied here. The count bar's outside-pilot half is doing the
  real work: a strand rate that exists only on named seeds is a curiosity, not a baseline.
- Refusedband: the band bar (>= 5 refusals on >= 2 seeds) held exactly as written; pooling
  the single seed's 37/37 would have manufactured a band from one route. If a future arm
  wants to claim gate 2 from single-seed runs, it must re-scope the bar in its own prereg
  before its legs — this evidence does not do that.

## Next blanks, in order

1. Strand arm on a wider seed band, a policy that actually puts villagers at creeks, or
   both — the strand program has specimens, not a population, and no strand mechanism can
   be measured as a rate until the count bar can pass outside the pilot set.
2. Gate-2 hunt, next: fresh bands on the BARE stack (preserves refusal runs; P1's rescue
   and longer horizons do not find bands) until a second refusal seed appears.
3. Narrated homeward attempts (design decision; strandtile's sense gap + refusedband's
   37/37 narrated refusals supply the counts — no wording landed here).
4. Death-aware camp-final unit (carried metric-review item); refusedband's sleep-step
   gameOver-flag predicate fix belongs in the next instrument pass.

Claim deleted; lock deleted. Merged locally, pending ship.
