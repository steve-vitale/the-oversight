# sim-preserveact-b — does preserver widening increase how much preserving villagers actually do?

Run: oversight-flesh-out-loop-b-20261025T2030Z, arm sim-preserveact-b,
axis food-economy. Worktree: `~/workspace/worktrees/sim-preserveact-b`,
branch sim-preserveact-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header. Prior runs' numbers quoted in the background
section are quoted, not recomputed and not re-judged.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- The preserver-widening commit 75fdd9258 widened
  SPECIALTIES.preserver from ghost occupations matching almost nobody
  to the real occupation pool (fisherman 3; fishing/hunting guides,
  sailor, chef, line cook, butcher, farmer, rancher 2; beekeeper,
  mushroom grower 1) and aligned TECHNIQUE_GRANTS.preserve the same
  way. It is a hypothesis about preservation, not a finding; this run
  tests one precise consequence of it: the COUNT of preserving work.
- No canon doc covers the preserve-action instrument — stated, not
  invented. The action count, the GO bar, and the cost guard below are
  measured instruments, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- sim-rotdecide2-b (evidence/2026-10-25/sim-rotdecide2-b.md, seeds
  9500-9515): the NEXT DECIDING rot corpus on the same pair (parent
  1f24a4ef -> commit 75fdd9258). Deciding verdict NO-GO on the rot
  question (G1+G2 failed, G3 held): median abs pd1 rot ROSE 27% on
  commit, zero genuine down-moves. That verdict stands and is NOT
  re-judged here. This run answers a NEW, different question on a
  NEW contrast (see below) and must not be read as overturning,
  confirming, or re-scoring the rot verdict.
- rotdecide2's diagnostic haul/preserve columns (same policy,
  horizon, and cook-duty branch as here) are the scale reference for
  the GO bar below: villager resolutions medians pd0 39->35, pd1
  36->33; scholar attempts 0->0 on every cell (leadfeast never
  preserves — expected, backlog #1038); villager batches 0/0 BY
  CONSTRUCTION at those old anchors (the HAULCOUNT TAP postdated
  both anchors — the tap limit rotdecide2 pre-registered).
- The gap this run closes: rotdecide2 could not measure villager
  smoke-rack batches at all (tap absent at its anchors), and its
  resolutions signal actually FELL on commit. Whether widening
  increases preserving WORK — as opposed to rot outcomes — was never
  directly measured with a live batch count. This run measures it.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Pair, contrast, horizon, seeds

- Pair under test, ONLY pair: preserver widening OFF vs ON, on
  CURRENT master substrate. ON = the HEAD tree unmodified. OFF = the
  HEAD tree with ONLY the two widening hunks of 75fdd9258 reverted
  in src/js/food.js (committed patch scripts/preserveact-off.patch:
  SPECIALTIES.preserver back to chef 2 / fisherman 3 / farmer 2 /
  park ranger 1, TECHNIQUE_GRANTS.preserve back to chef / fisherman /
  farmer / smoker). The runner
  (scripts/sweep-one-preserveact-arm.sh) VERIFIES the extracted
  OFF tree differs from a fresh HEAD archive ONLY in src/js/food.js
  and FAILS LOUDLY otherwise — a wider diff would mean the contrast
  is not the widening alone. No other pair, no era anchor, no
  anchor-pair is run or judged. The historical parent/commit pair
  is deliberately NOT reused: its anchors predate the batch tap, so
  the primary metric would be blind there by construction.
- Anchor contrast (identical on both sides of the pair, identical on
  both arms): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (all asserted FATAL by the driver),
  PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware horizon (dead
  villages stop; +10d tail max) — the rotdecide2 substrate, matched
  deliberately so this corpus is comparable to the corpus it follows.
  Both pd sides are run because PLENTYDEPRI changes villager
  production behavior and could interact with preserve counts; the
  primary median pools both sides, and per-side medians are reported
  alongside. No header revision to the horizon is made after this line.
- Seeds, FRESH bands: PILOT 9750-9757 (8 seeds), CONFIRM 9758-9773
  (16 seeds) if the pilot GO passes. Band verification (before
  sweeping): filename-token inventory over evidence/ shows 9750-9773
  unused — the 9000s used bands are 9001-9064, 9214-9221, 9250-9281,
  9292-9295, 9300-9307, 9310-9325, 9400-9407, 9409-9417, 9421-9428,
  9500-9515, 9551-9558, 9701-9708, 9901-9948, and the near-miss band
  9600-9623 was REJECTED because journey-scale-r8 used 9601-9604.
  The band overlaps NONE of the forbidden bands — 9500-9515
  (rotdecide2), 73671-73678, or any band in the sibling arm's claim
  (the run claim lists arms sim-preserveact-b + sim-expedid-b with no
  seed bands; sim-expedid-b's worktree shows no 9750-9773 use).
  Configs: pilot 8 seeds x {pd0, pd1} x {off, on} = 32 configs; full
  corpus with confirm 24 seeds x {pd0, pd1} x {off, on} = 96 configs,
  all written to this worktree's
  evidence/2026-10-25/preserveact-b-corpus/ (a NEW corpus dir, never
  mixed into an older corpus).
- File names: preserveact-b-<arm>-<side>-dg1-leadfeast-s<seed>.json.
  Per-seed files are the analyzer's ONLY inputs; sweep-*.json
  summaries are NOT analyzer inputs.
- Driver method: the driver (scripts/sweep-preserveact-b.js, derived
  verbatim from scripts/sweep-rotdecide2-b.js) runs from a
  git-archive-extracted tree of HEAD per arm
  (<worktree>/bisect-scratch/<arm>/ — never /tmp worktrees, never
  bare `git worktree add`, never a checkout in the worktree). The
  driver is copied into each extracted tree; the extracted tree's
  own src/js is swept (OFF tree: food.js patched, everything else
  HEAD). No src/js file is modified in the worktree at either arm:
  all counting is runtime wrappers in the driver plus the pre-existing
  game.js HAULCOUNT TAP (which is in current master, in both arms).

### Instrument: what is measured, and why it decides

- PRIMARY per-cell preserve-action count = preserveVillagerBatches
  + preserveAttempts.
  - preserveVillagerBatches: cook-duty smoke-rack stacks converted,
    read from Game._haulcount (the HAULCOUNT TAP in game.js, LIVE in
    both arms here — the tap is in current master and the OFF patch
    touches only food.js). One batch = one pantry stack converted on
    the racks in one cook resolution. This is the villager
    smoke-rack work column, and it is REAL in this corpus — the
    rotdecide2 0/0 caveat does NOT apply.
  - preserveAttempts: scholar preserveFood/renderFat/makePemmican
    calls (item-state deltas for successes, as in rotdecide2).
    Under leadfeast the policy never calls scholar preserve verbs, so
    scholar attempts are EXPECTED 0 (backlog #1038). A 0 here is
    NEVER read as "nothing was preserved" — the villager batches
    carry the question, and the scholar columns are read TOGETHER
    with them (reported on every row and in every median block).
  - preserveVillagerResolutions (creditDeed 'preserving', one per
    cook resolution with n > 0) is the CROSS-CHECK: batches >=
    resolutions per cell by construction (one resolution converts
    >= 1 stack). A violation is an instrument defect, counted by the
    analyzer and failed by the proof test — never averaged away.
- MECHANISM, STATED BEFORE SWEEPING (why a count effect is plausible
  at all, and why a null is informative, not an instrument failure):
  the widening does not change the cook's 4000 kcal/resolution budget
  or the about-to-rot eligibility window, so batch counts are NOT
  mechanically tied to skill. The count channels are: (a) the
  competent policy staffs the cook preferring the highest preserver
  skill among FREE villagers — widening enlarges that pool, so the
  staffed cook is more often skilled; (b) a skilled cook's racks-full
  guard is looser (rackCap scales with ownShelf: blind 15d -> factor
  13 vs skilled 30+5*skill days -> factor 33+), so racks-full blocks
  fewer resolutions; (c) countervailing, longer skilled shelf keeps
  preserved stock on the racks longer, which can re-bind the guard.
  The sign on counts is therefore genuinely ambiguous ex ante — a
  null result says the quality channel (rate/shelf), not the count
  channel, is where widening acts. That is a finding, not a failure.
- SAY SAMPLES (sense-testing): Game.emit is wrapped (counting only)
  to record cook smoke-rack lines (matching /smoke racks|cooked for
  the haven|racks are already full/i), day-tagged, capped at 60, into
  TRACE files only. The wrapper delegates and never changes game
  behavior, so trace re-runs stay byte-identical. LIMIT, STATED NOT
  HIDDEN: per-seed files and traces carry aggregates, deposit/
  preserve EVENTS, and cook say-lines — not full villager dialogue,
  goals, or routines. No claim is made here about dialogue quality
  beyond the event-level and cook-line behavior the traces show. A
  transcript-capture instrument is a separate arm, not smuggled into
  this one.
- ROT ABSOLUTES (diagnostic only, backlog #1049): absolute rot per
  100 village-days (daysAlive denominator) + rotcompanion
  classification (genuine / denominator-driven / mixed / identical /
  up / degenerate) are computed for every seed. Degenerate seeds are
  COUNTED in the abs medians and EXCLUDED from any ratio only. The
  rot numbers can NEVER overturn the preserve-action verdict, in
  either direction.

### VERDICT RULE (binding — judge ONLY against this header)

GO holds if and only if ALL of P1, C1, C2 hold on the judged corpus
(pilot corpus for the pilot verdict; full 24-seed corpus for the
confirm verdict, judged on its own header-identical rule):

- P1 (preserve-action rise): median total-action count ON >= 1.25 x
  median OFF, pooled over both sides (all cells per arm).
  JUSTIFICATION (honest, from the rotdecide2 scale reference, not
  from this corpus): rotdecide2's live villager signal (resolutions)
  had medians 33-39/cell under the same policy/horizon/branch, and
  batches count stacks (>= resolutions), so a typical OFF cell
  plausibly preserves ~35+ times per 100d. A 25% median rise (~9+
  extra batches at the median) is a visible behavior change, not a
  one-seed wiggle — and it is reachable IF the racks-full channel
  binds (skilled rackCap 2.5-3.3x blind). A smaller rise is a wiggle,
  not an effect. EDGE CASES, FIXED HERE: OFF median 0 and ON median
  > 0 passes P1 (movement from nothing); both medians 0 fails P1 (no
  movement to measure).
- C1 (starvation guard, sim-scalemetric cost bar): total starvation
  deaths ON <= OFF + 2, pooled over both sides.
- C2 (survival guard): median daysAlive ON >= 0.8 x median OFF,
  pooled over both sides.

Otherwise the verdict is NO-GO, with the failed condition(s) named
(P1 / C1 / C2). A NO-GO HERE MEANS ONLY "widening does not increase
preserve-action counts" — it is NOT a recommendation to revert the
widening (its quality/rate/shelf effects are a separate question,
measured here only as the preserved-kcal secondary), and it does
NOT touch rotdecide2's rot NO-GO, which stands on its own corpus and
rule.

VALIDITY (preconditions, not verdict conditions): all per-seed
files for the judged band, all parsing, all arm/base tags + seeds +
contrast matching; every seed classified for the rot diagnostic (0
ambiguous); bucket closure on every file; batches >= resolutions on
every cell. If validity fails, there is NO verdict — the run fails
loudly as an instrument failure and does not claim GO or NO-GO.

### Pilot gate (§9)

- Pilot: the first 8 seeds (9750-9757) run first, all 4 cells each
  (32 configs). The pilot verdict is judged on the pilot corpus ONLY;
  a pilot GO authorizes the confirm spend, it does not pre-judge it.
- PILOT PASS BAR (all must hold, else NO confirm spend and the run
  ends as KILLED — evidence only, no game-code trace, no re-score):
  - 32/32 pilot files present, parsing, arm/base tags + seeds +
    contrast matching;
  - rot classifications computable for 8/8 pilot seeds (0 ambiguous);
  - invHaulActions > 0 on ALL 32 pilot files (haul non-vacuous);
  - preserve fields present (non-null integers) on ALL 32 pilot
    files (values reported regardless: scholar attempts expected 0;
    villager batches live and reported as observed);
  - batches >= resolutions on ALL 32 pilot cells.
- On a pilot pass, run the confirm band (9758-9773, 64 configs) to
  complete the 96-config corpus. Pilot seeds are NOT re-run for the
  full corpus (deterministic re-runs would reproduce them
  byte-identically); trace re-runs (HAULCOUNT_TRACE=1) on moved seeds
  must byte-compare their per-seed files to the corpus files.
- If the pilot GO FAILS, the arm is KILLED honestly: no confirm
  spend, no game-code change (there is none to revert — OFF/ON are
  scratch trees), evidence only. Do not re-score against a friendlier
  metric; metric doubts go under "metric review" for the NEXT run.

### Balanced panel (§15)

- This IS a before/after pair (OFF -> ON), so ATTEMPT
  scripts/balance-panel.js compare and attach the compare .md.
- EXPECTED FAILURE CLASS, STATED BEFORE ATTEMPTING: the panel
  compare ingests panel.json.gz cases built by the panel driver
  from sweep-compare policies — NOT env-gated arm-contrast recorder
  rows. If compare fails on ingesting the recorder corpus (the known
  recorder-row ingestion class, as in rotdecide2: TypeError reading
  'days' at balance-scorecard.js comparePanels), attach the
  analyzer's sweep-compare table instead and name the failure class.
  A tooling failure NEVER blocks or re-scores the verdict: the
  verdict is judged on the analyzer's paired rows (§15 fallback, as
  in leg2decide / rotragged / rotdecide2).
- If compare unexpectedly succeeds, its .md is attached and any
  disagreement with the GO rule is reported, not reconciled by
  re-scoring.

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: read per-seed stories for the moved seeds —
  meaning, coherence, consequences, not just counts. The per-seed
  table (batches, resolutions, attempts, haul, rot, days, wave,
  national) IS the sense evidence for moved seeds, plus trace
  samples: after classification, re-run ONE moved seed (largest
  batch move, either direction) with HAULCOUNT_TRACE=1 and quote
  haul / preserve event names AND cook smoke-rack say-lines from
  the traces in plain words. Trace re-runs must byte-compare their
  per-seed files to the corpus files (determinism check).
- WALL NUMBERS on this corpus: national / table / wins, wave 1-5
  reach, median survival (median daysAlive). NOTE: these files carry
  table = win flag (same convention as rotdecide2), and SEATDRIVE=0
  makes the table unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding, and is reported as
  such.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the corpus,
  national/wave divergence by seed, haul/preserve event names and
  cook say-lines from the trace samples. Anything robotic, static,
  or repeated is flagged; aggregate divergence tracking the food
  story is reported as people-like, not proven.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below (filled
  after the verdict; the verdict above is NOT re-scored by it).

### INSTRUMENT FIX (pre-sweep, before any sim executed)

The runner's OFF-tree verification as first written diffed two full
HEAD archives with diff -qr. That proof never finished: a HEAD archive
is ~2.1GB (the evidence tree), and the diff ran 10+ minutes I/O-bound
while thrashing the disk, with zero sweep configs run. The runner was
killed, the scratch trees deleted, and the verification replaced with
the equivalent cheap proof: (1) the patch names exactly one file
(src/js/food.js, header count checked); (2) git apply --check +
git apply succeed, so the OFF tree is archive(HEAD) plus that patch
and nothing else; (3) git apply --check --reverse succeeds
afterwards, proving the tree's food.js is exactly in the post-patch
state. Together these prove OFF differs from ON only in food.js,
without reading two 2.1GB trees. No sweep had run when this fix was
made, so no corpus file, seed, or threshold is affected; the
pre-registration above is otherwise unchanged.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/sweep-preserveact-b.js, scripts/analyze-preserveact-b.js,
scripts/test-preserveact-b.js, scripts/sweep-one-preserveact-arm.sh,
scripts/preserveact-off.patch, evidence/2026-10-25/preserveact-b-corpus/
(per-seed files, sweep summaries, trace files),
evidence/2026-10-25/sim-preserveact-b.md (this file). The OFF tree's
food.js revert exists ONLY in git-archive-extracted scratch trees
that are deleted after each arm run — never committed, never in the
worktree. No push, no version bump, no live verification — merged
locally, pending ship, by the coordinator.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)
