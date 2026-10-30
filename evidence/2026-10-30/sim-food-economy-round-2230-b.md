# Loop B round 2230Z — food-economy strand triptych (3 DIAG arms, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T2230Z, axis
food-economy (converging). Loop A live on scale-onramp throughout
(claim fleshout-20261030T2215Z: sim-w4field-a, sim-w4party-a,
sim-linkgen-a) — NOT touched. All three arms DIAG ONLY: zero src/js,
zero policy-default flips, zero game-code changes. No food-economy
default flipped, no balance change landed.

Shared substrate (all arms): POLICY=nighttravel, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank
seeds 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
15439. Each arm re-derived its own strand set on its pinned base (no
arm consumed a sibling arm's output).

## Arm 1 — sim-strandbank-b (DIAG-GO)

Backlog #1554 (drift watch): re-derive strand membership per base.
Commits (rebased onto master 5a2ce64ce, proof re-run, merged
--ff-only): prereg 776886f54, evidence c2d707a4b.
Proof on merged master: scripts/test-strandbank-b.js 10/10.

- Strand set on current master: ONLY 15215 strands (guard nights
  7–9, ON nights 7–16; ON evening woods 4,4,4,3,3,2,1,0,0,0; warmth
  6 acted / 4 logs spent). 15009 strands on NO leg — 0 creek
  evenings on both legs, not merely zero still evenings.
- Drift vs wakeforage fresh baselines (guard 12/3/9, ON 18/10/8):
  ZERO on every seed, both legs, verified two ways (published
  totals + re-census of the wakeforage base corpora). The
  walktree→wakeforage drift is historical, not ongoing. Next
  strand arms may quote this run's strand set as current until
  the next base move.
- §15 panel: declared non-applicable in prereg (DIAG instrument,
  no game-root delta) — no compare fabricated.
- Evidence: evidence/2026-10-30/sim-strandbank-b.md (+ prereg).

## Arm 2 — sim-kcalshort-b (DIAG-GO)

Backlog #1499 (15009's strand is a food failure). Commits (rebased
onto master c2d707a4b, proof re-run, merged --ff-only): prereg
5bb919080, evidence b7d50b357.
Proof on merged master: scripts/test-kcalshort-b.js PASS 52 / FAIL 0.

- Census: 13 strand evenings, all 15215 (ON 10 + guard 3), 100%
  classified, 0 unclassified. ON: both 5, kcal-only 2, wood-only 2,
  ticks-only 1. Pooled: kcal-short 9/13 (0.69), median kcal gap 60
  (every kcal-short evening sits at EXACTLY 0 kcal, so the gap is
  always the full 60-kcal lashing cost); wood-short 7/13 (0.54),
  median wood deficit 3; ticks-short 2/13.
- #1499 answered on current data: the current strand fails on food
  AND wood jointly. A wood-only fix cannot move it (5 both-evenings
  would still fail on kcal) and a food-only fix cannot move it
  either (the 7 wood-short evenings). The 15009 day-13 case (4
  logs, 24 kcal) is HISTORICAL: 15009 does not strand on current
  master and the case cannot be re-verified.
- Instrument lesson (metric review): the bridge skip names only
  the first failing gate (wood, kcal, ticks order) and cannot
  express "both" — on 5/10 ON evenings the skip names wood-short
  while kcal is also 0. A future prereg must never accept skip
  reasons as failure modes; this census classifies from raw
  refusal-time gates.
- §15 panel: declared non-applicable in prereg (pure DIAG census).
- Evidence: evidence/2026-10-30/sim-kcalshort-b.md (+ prereg).

## Arm 3 — sim-fedexile-b (DIAG-GO)

Pressb open finding (fed exile extends the strand). Commits
(rebased onto master b7d50b357, proof re-run, merged --ff-only):
prereg 542cc5cd5, evidence ca8c40d85.
Proof on merged master: scripts/test-fedexile-b.js 42/42 (27 pure +
15 corpus checks, correctly paired determinism s15215 vs judged
variant s15215; a coordinator-side 41/1 run was a mismatched
s15215-vs-s15003 pairing, not an arm failure).

- Fed vs unfed, paired: 15215 strand 10 nights (control, days
  7–16) → 17 nights (variant, days 7–23): delta +7. Death-delay
  +6 days (bearer death day 17 → 23, same cause); 0 on four
  seeds, CENSORED on five; endReason never worsens; no new
  bearer-death cause. Wave reach +1 seed (15215 waves 1 → 2).
  Paired table complete 27/27 strand mornings (10 control + 17
  variant, variant-only flagged).
- Wood-seeking conversion on fed mornings: 0/4 (0.000), with
  skipped split 0/13, next-day 0/4, positive-delta 0/4,
  disagreements 0. The routine has NO wood move on the wake tile
  at all (0 adjacent sources, 8 whole-tile bigtrees, no walk, no
  verb, no gain). The pressb design question ("fed but still
  stuck — acceptable, or convert to wood-seeking?") is now
  measured; the decision stays with the coordinator / Steve.
- §15 paired compare: evidence/2026-10-30/sim-fedexile-b-compare.md
  (deviation stated on its face: the official panel driver cannot
  express the strand stack; paired form used instead, same
  standing as pressb).
- Evidence: evidence/2026-10-30/sim-fedexile-b.md (+ prereg).

## Wall numbers (this round's judged corpora — 30d pre-seat bands)

National / table / wins: NOT OBSERVABLE, reported as the window's
structural value, never claimed (all three arms: national 0/10,
table 0/10, wins 0/10 on their 30-day evening legs; the legs
contain no national/table/win content). Median survival 30d
(10/10 seeds survived 30 days on every leg — ceiling effect of
the window + banking selection, not a survival claim). Wave
reach: wave 1 in 10/10, wave 2 in 8/10, wave 3 in 1/10 (15439),
waves 4–5 in 0/10, identical on guard and ON legs.
Overall wall UNCHANGED: full seat 0, wave 5 reached 0 stands as
context (no scale sweep this round).

## Village assessment (plain words)

One village, one creek, one story, told three ways. The only
village that ever gets stuck is 15215's: it wakes at the creek
with known food nearby, eats what it can, and then cannot get
home because it is short of bridge logs, short of calories, or
both — usually both by the late nights. Feeding it (the morning
press) does not get it home; it just lets it stay stuck a week
longer, dying six days later of the same causes, because nobody
on that tile has any move that makes wood. Warmth makes it
worse in one direction: the fire that warms the villager burns
the very logs the bridge needs, turning a 3-night food-only
strand into a 10-night food-and-wood one. The strand is not a
wood problem or a food problem. It is both, at once, and the
narration only ever names the first half.

## Telemetry deviation check (coordinator)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/sim-fedexile-b-corpus-on-variant/*.json'
--metrics national,table,wins,exiled --sweep-rows`:
3 LOUD lines (national 12→0, table 16→0, wins 16→0, n=10 seed
rows); exiled clean. INVESTIGATED as regime artifacts: the
corpus is a 30-day pre-seat strand band whose legs contain no
national/table/win content by construction (each arm's wall
section says so), and the WINSEAT baseline's own _regime note
forbids comparing pre-seat substrates against it. All three arms
are zero-src/js measurement, so no game change could have moved
these metrics. Baseline NOT rolled, no investigation item.

## Backlog dispositions (appended to hidden_files/sim-findings.md)

- #1554 re-derived this base: zero drift (strandbank). The watch
  recurs every base move; the cause of the 15009 loss is still
  open, now precisely shaped as zero creek evenings.
- #1499 answered on current strand (food AND wood jointly);
  the 15009 day-13 case is historical, not re-verifiable.
- Pressb open finding (fed exile extends the strand) answered
  with counts (fedexile).
- New open items: lacking line names only the first gate
  (kcalshort); warmth extends the strand it warms (kcalshort);
  press tick cost creates a ticks-short still evening
  (fedexile guard variant); rescue-day starvation spam
  (fedexile, cosmetic); fireside gossip on fireless nights,
  fourth sighting (strandbank).
- Steve-call items NOT taken: competent courtship drive (#1524)
  and generation-dealt vs earnable vests (#1533) still await
  Steve's ruling; this run did not touch them.

## Infrastructure

- Master moved 3 times under the run (gapscomp-returns landing
  a18488b7e, warmthdisp disposition 5a2ce64ce, own merges);
  all three branches rebased clean in their own worktrees, proofs
  re-run green after every rebase and on merged master.
- Registration was slow (~30 min for 3 trees): the register
  script's internal reap contended with sibling ops and spun on
  a `git status` in the live journey2-succession tree; only the
  coordinator's own read-only status process was killed — no
  sibling work touched, no ref surgery. Kcalshort's checkout
  then wrote ~5 GB (evidence corpora) before completing.
- BOTH the fedexile and kcalshort workers ended "completed"
  WITHOUT a final chat report. Recovery: the coordinator verified
  each branch directly (prereg + evidence commits present,
  worktree clean, proof suites run on branch tips and again on
  merged master) and landed both normally. No re-spawn was
  needed — the work was complete; only the reports were lost.
  The strandbank worker reported normally.
- Safe-commit index clobber hit the strandbank worker's commits
  (repaired by the worker via HEAD-blob cacheinfo, verified);
  no clobber on the coordinator merges. No EPERM flap blocked
  this run.
- check.js --quick NOT re-run by the coordinator (zero src/js,
  zero policy files, sibling Loop A live — concurrent-jest rule);
  arm proof suites green on merged master (strandbank 10/10,
  kcalshort 52/52, fedexile 42/42).
- Worktrees released as merged, branches deleted:
  sim-strandbank-b, sim-kcalshort-b, sim-fedexile-b. Claim
  retired to .DEAD at closeout; lock deleted. Main tree clean
  at closeout (master ca8c40d85).

food-economy stays converging (NOT converged): the strand is now
fully priced (food AND wood, with ticks as a third gate on
press-cost mornings), but no strand fix has landed and no
food-economy default flipped. Next blanks in order: the two
Steve-call items (competent courtship drive; generation-dealt
vs earnable vests) still await rulings; then a strand-fix design
that reckons with the joint failure (a wood-only or food-only
lever cannot move a both-evening) — and the warmth-fuel
question (should the fire burn non-bridge fuel, or should
bridge logs be protected from it). scale-onramp untouched
(sibling Loop A lane).

Merged locally, pending ship.
