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
(src/js/food.js, ---/+++ header pair count checked — the patch is
plain diff -u output, not git-style, so it carries no "diff --git"
header; the first version of the check looked for one and failed
loudly on a good patch, before any sim ran); (2) git apply --check +
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

ADOPTION NOTE (2026-10-25, loop B run fleshout-loop-b-20261025T2230Z):
this arm was adopted from the dead 2030Z B run, whose coordinator died
mid-run. Stranded state as found: pilot corpus 32/32 files present
(seeds 9750-9757 x off/on x pd0/pd1); confirm band 9758-9773 NOT run;
RESULTS empty; one uncommitted analyzer line; 647M of bisect-scratch
left over. Adoption work below was done entirely in this worktree
(`~/workspace/worktrees/sim-preserveact-b`, branch sim-preserveact-b);
the main tree at `~/workspace/the-scattering` was never touched and
remains clean. No push, no version bump, no live verification.

CORPUS BASE TAG: the pilot per-seed files carry
baseCommit 9f11741afc05741afac6581de23cf4eb13e1b245 (the branch head
at pilot sweep time). The branch head at adoption is 11daf7fb6 (a
runner trace-summary fix landed after the pilot sweep). The analyzer
must be run with `--base 9f11741af...` to match the corpus tags; an
adoption run first passed the branch head and got 32/32 "base tag
mismatch" fatals, then re-ran with the corpus base tag and got a
clean analysis. This is a tag-matching note, not a corpus defect:
the pilot trees were both extracted from the 9f11741af tree, so the
OFF/ON contrast is intact.

INSTRUMENT FIX REVIEW (the uncommitted diff): the single uncommitted
line is `const rows = res.rows;` in main() of
scripts/analyze-preserveact-b.js. It is a LEGITIMATE fix, kept and
committed with this evidence. Proof: the committed main() prints
per-seed rows with `for (const r of rows)` but never defines `rows`
in main() scope, so the committed analyzer crashes with a
ReferenceError before printing any per-seed table; the added line
supplies the definition. The proof test's T4 corpus mode (which
exercises the analyzer end to end) passes only with it in place.
CORRECTION to the adoption handoff: the runner
scripts/sweep-one-preserveact-arm.sh was NOT uncommitted — it is
tracked and clean (git ls-files confirms); only the analyzer line
was uncommitted. bisect-scratch/ (leftover extracted OFF tree) was
deleted before committing and is never committed.

PILOT PASS BAR (all hold — verified by proof test T4 corpus+pilot
mode, 37 PASS / 0 FAIL, plus analyzer exit 0 with zero fatals):
- 32/32 pilot files present, parsing, arm/base tags + seeds +
  contrast matching (0 fatal).
- Rot classifications computable for 8/8 pilot seeds, 0 ambiguous
  (counts: degenerate 2, genuine 1, up 3, identical 1, mixed 1).
- invHaulActions > 0 on ALL 32 pilot cells (0 zero-haul cells).
- Preserve fields present (non-null integers) on ALL 32 pilot cells.
- batches >= resolutions on ALL 32 pilot cells (0 violations).
Validity therefore holds: there IS a verdict, and it is judged below
on the pilot corpus only.

PILOT VERDICT (binding P1 + C1 + C2, pilot corpus seeds 9750-9757):
NO-GO, failed=P1.
- P1 FAILS: median total-action count (batches + scholar attempts)
  pooled OFF=113.5, ON=102.0, ratio 0.899 — below the pre-registered
  1.25x bar, and in the wrong direction. Per side: pd0 110.5 -> 109.0
  (flat), pd1 122.0 -> 94.5 (down ~23%). Scholar attempts are 0 on
  every cell of both arms (expected under leadfeast, backlog #1038),
  so batches carry the whole total: batches pooled OFF=113.5,
  ON=102.0. Cross-check resolutions pooled OFF=43.0, ON=38.0.
- C1 HOLDS: total starvation deaths pooled OFF=13, ON=5; bar
  ON <= OFF+2 (= 15) holds with room.
- C2 HOLDS: median daysAlive pooled OFF=100, ON=100; bar
  ON >= 0.8x OFF holds.
Because P1 fails, the pilot GO fails. THE ARM IS KILLED HONESTLY:
no confirm spend (band 9758-9773 NOT run — verified: no 9758+ files
in the corpus), no game-code change (there is none to revert —
OFF/ON were scratch trees only), no re-score against any friendlier
metric. What this NO-GO means, per the header: ONLY that preserver
widening does not increase preserve-action counts on this corpus.
It is NOT a recommendation to revert the widening (its quality /
rate / shelf effects are a separate question), and it does NOT
touch rotdecide2's rot NO-GO, which stands on its own corpus.

PER-SEED TABLE (batches / resolutions / scholar attempts;
total actions = batches + attempts; days; national pd1; max wave pd1):
- 9750 degenerate | pd0 97/38/0 -> 127/44/0 | pd1 131/46/0 -> 91/39/0 | actions pd0 97->127 | pd1 131->91 | days 88->100 | 100->100 | national true->true | wave 3->4
- 9751 degenerate | pd0 25/17/0 -> 115/40/0 | pd1 159/46/0 -> 111/29/0 | actions pd0 25->115 | pd1 159->111 | days 95->100 | 100->100 | national true->false | wave 2->4
- 9752 genuine | pd0 114/41/0 -> 78/32/0 | pd1 101/44/0 -> 83/28/0 | actions pd0 114->78 | pd1 101->83 | days 100->100 | 100->100 | national true->true | wave 4->4
- 9753 up | pd0 193/62/0 -> 55/24/0 | pd1 113/45/0 -> 92/32/0 | actions pd0 193->55 | pd1 113->92 | days 100->100 | 100->100 | national true->true | wave 4->4
- 9754 up | pd0 59/27/0 -> 0/0/0 | pd1 72/32/0 -> 0/0/0 | actions pd0 59->0 | pd1 72->0 | days 100->100 | 100->100 | national true->true | wave 4->4
- 9755 identical | pd0 134/43/0 -> 134/43/0 | pd1 138/45/0 -> 138/45/0 | actions pd0 134->134 | pd1 138->138 | days 100->100 | 100->100 | national true->true | wave 3->3
- 9756 mixed | pd0 121/34/0 -> 111/47/0 | pd1 222/65/0 -> 187/67/0 | actions pd0 121->111 | pd1 222->187 | days 100->100 | 100->100 | national true->true | wave 2->4
- 9757 up | pd0 107/43/0 -> 107/43/0 | pd1 82/29/0 -> 97/37/0 | actions pd0 107->107 | pd1 82->97 | days 100->100 | 100->100 | national false->false | wave 3->3

ROT-ABS (diagnostic only, never the judge): medians pd0
31634 -> 50035, pd1 35271 -> 13447; ratio medians (non-degenerate
seeds only) OFF=0.338, ON=0.330, median-step 0.978. Per-seed abs
(pd0 OFF->ON | pd1 OFF->ON): 9750 0->30081 | 0->1000; 9751
0->52656 | 61316->26357; 9752 309949->72865 | 70821->8117; 9753
249790->3300 | 2671->4301; 9754 53589->47414 | 23988->42997; 9755
5093->5093 | 52134->52134; 9756 9678->66440 | 46553->8994; 9757
111584->111584 | 16740->17899. The rot numbers move both ways by
seed and side and cannot overturn the preserve-action verdict in
either direction, per the header.

WALL NUMBERS (pilot corpus, 32 configs): national=28, table=0,
wins=0, wave reach distribution {2: 3, 3: 8, 4: 21} (no wave-1-only
and no wave-5 cells; wave = max reach per cell), median
daysAlive=100, max daysAlive=100, total deaths=243. Table 0 is a
construction fact (SEATDRIVE=0 makes the table unreachable by
construction), not a scale-wall finding. National reach is high
(28/32) while wins/table stay at zero — the wall on this corpus
sits past national, at the table, exactly where SEATDRIVE=0 puts it.

DEATH-CAUSE SPREAD (corpus totals, 243 deaths): the arena 143,
monster 20, ambush 19, starvation 18 (OFF 13 / ON 5 — the C1 guard),
contest 11, sickness 9, a wound that wouldn't close 8, combat 2,
bad belly 2, dehydration 3, alien 3, big ugly 1, the night 1,
grief counselor 1, the bright bastard 1, the expedition 1. The
arena alone is ~59% of all deaths: on this policy and horizon,
villages do not mainly starve — they die in the show. Starvation
falling on ON (13 -> 5) while preserve counts also fell is a
reminder that the two are not mechanically tied here; neither
number re-scores P1.

SENSE-TESTING (read the moved seeds, not just the counts):
- Largest single move: 9753 pd0, 193 -> 55 batches (-138). The
  village still lived 100 days and stayed national on both sides —
  the count collapse did not read as a village collapse.
- Most striking seed: 9754. ON produced ZERO preserving work on
  both sides (0 batches, 0 resolutions, 0 attempts) against OFF
  59/72 batches, yet the village still lived the full 100 days and
  stayed national. A village surviving 100 days with no preserving
  at all, on both food-behavior sides, is coherent only if its food
  story ran on fresh haul and fast turnover rather than stored
  food — and the pooled haul numbers point that way (invHaul kcal
  pooled OFF=106394, ON=116353). This single seed does not change
  the verdict, but it is the clearest candidate for a follow-up
  diagnostic: why would widening zero out cook resolutions on one
  seed entirely? That question is documented here, not answered
  by re-scoring.
- Null seeds: 9755 is identical on every cell (widening changed
  nothing at all there), and 9757 pd0 is identical too. Widening
  is not a uniform dial — on some seeds it moves nothing, on one
  it removes everything.
- Trace samples (existing OFF traces from the stranded run's trace
  invocations, seeds 9753/9754, both sides): preserve events use
  verb villagerCook and their counts match the mains' resolutions
  exactly (62/27/45/32), day ranges 14-99, 26-100, 23-99, 25-85 —
  preserving work spread across the whole horizon, not bunched at
  the start. LIMIT, STATED: saySamples = 0 on all four trace files
  — no cook smoke-rack say-lines were captured, so no cook dialogue
  can be quoted from this corpus; and every trace preserve event
  carries items: 0 (stack counts live only in the haulcount tap,
  not the event recorder). No fresh trace re-run was performed on
  a moved seed: the arm was killed at pilot, so the run is evidence
  only, and a fresh extract + re-run would be spend on a verdict
  that is already final. The header's moved-seed byte-compare trace
  re-run belongs to a run that proceeds past pilot.
- Villager behavior, plain words: villagers haul constantly
  (invHaulActions > 0 on all 32 cells; pooled medians ~200 actions
  per 100 days), preserve steadily across the horizon when they
  preserve at all, and die overwhelmingly in the arena rather than
  of hunger. Nothing in the traces reads robotic or static — the
  divergence that does appear (9754's ON silence, 9755's exact
  null) tracks the food story seed by seed rather than repeating
  identically. No dialogue-quality claim is made beyond the
  event-level behavior above, per the header's stated limit.

VILLAGE ASSESSMENT (plain words): the villages in this corpus are
hardy, not hungry. Nearly every village lived the full 100 days,
nearly every one reached national standing, and none reached the
table — but the table was switched off for this run by design, so
that zero says nothing about the real scale wall. Widening who
counts as a preserver did not make villagers preserve more — if
anything they preserved slightly less, with one village stopping
entirely — while starvation deaths actually fell. The plain-words
reading: the widening's effect, if any, runs through the quality
of preserved food (longer shelf, better yield — villager
preserved-kcal pooled OFF=63723, ON=66625, diagnostic only), not
through how often villagers do the work. The count channel the
header hypothesized (a bigger skilled-cook pool loosening the
racks-full guard) did not show up in the counts.

BALANCED PANEL (§15): ATTEMPTED. No panel.json.gz cases exist for
this arm: the panel compare ingests panel-driver cases built from
sweep-compare policies, and this corpus is env-gated arm-contrast
recorder rows — the exact expected-failure class the header
pre-stated (recorder-row ingestion, as in rotdecide2). No panel
inputs were fabricated to force a compare run. The analyzer's
per-seed table above is the §15 fallback instrument, and the
verdict is judged on it. A tooling gap of this class never blocks
or re-scores the verdict.

METRIC REVIEW (§14 — for the NEXT run; this verdict is NOT re-scored):
- The pooled median hides a per-side split (pd0 flat, pd1 down
  ~23%). A next run could pre-register per-side medians as a
  secondary read, but the pooled rule stands for this verdict.
- Scale surprise, recorded not re-judged: OFF batches median 113.5
  is ~3x the rotdecide2 resolutions scale (~33-39) the 25% bar was
  justified from — batches count stacks, resolutions count cook
  resolutions, so the bar meant ~28 extra batches at the median.
  The observed move was -11.5. The bar was reachable in principle;
  the count channel moved the wrong way.
- Seed 9754's ON zero is the strongest follow-up lead: a dedicated
  diagnostic arm (why cook resolutions vanish entirely on one seed
  under widening) would be more informative than re-running this
  count question on more seeds.
- Trace say-matcher: saySamples = 0 on all four existing traces
  means the cook-line matcher either never matched or no matching
  lines fired. A next run that wants sense quotes should verify the
  matcher against a known cook smoke-rack line before relying on it.
- Scholar attempts 0 confirmed for a third corpus running: under
  leadfeast the scholar never preserves (backlog #1038 stands);
  any future preserve-action metric should either keep scholar
  attempts as the expected-zero companion column or use a policy
  that actually calls scholar preserve verbs.
- No other metric doubt: C1/C2 guards behaved, validity checks
  all held, and the instrument (tap + analyzer + proof test) is
  sound — the fix to main() above is the only instrument change,
  and it restores the analyzer to its intended behavior.

CONVERGENCE STATE for this axis (food-economy, preserve-action
question): KILLED-AT-PILOT. The preserve-action question is closed
on this corpus with NO-GO (P1 failed); the widening itself is NOT
killed (quality/rate/shelf effects unmeasured here beyond the
diagnostic kcal column).
