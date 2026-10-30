# sim-floortime-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1122Z, worker
sim-floortime-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #3 from the 1107Z run; backlog item:
BLOCKEDRESTORE FLOOR FLAG NEEDS TIME-ORDERING.

DIAG ONLY, measurement only, zero src/js game changes, no
default flip, no gate move, no deed-bar move. No [needs-eyes]:
this arm changes no feel, combat, or UI — it only fixes an
analyzer corroboration field over an already-recorded corpus.
No new sweep, no new sims.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the
counterexample blocker is a wave-1 anaconda_empress, the
anchor blocker a wave-3 callback — the same characters as
the blockedrestore census). NO CANON-registered doc covers
a tbEnd restore, a blocked restore, or a floor-draft
corroboration flag specifically — the mechanism below is
read from code (src/js/game.js tbEnd, via the blockedrestore
prereg) and from the blockedrestore analyzer, never invented,
and is NOT canon.

## What is being fixed, and what is not

The blockedrestore analyzer's `floorDraftRow` flag on a
BLOCKED row is currently "the blocker uid has ANY draft row
in this seed ending at hpAfter == 1", with no day comparison.
That is "ever floored in this seed", not "floored before
this tbend". A draft row dated AFTER the block cannot
corroborate the blocker's state AT the block.

Counterexample (carried from blockedrestore, not re-judged
here): the s75113 anaconda blocker (hp 7 at d61) has a floor
draft row dated d64, AFTER its block. At block time it was a
legitimate 7-HP lingerer at (4,4), floored to 1 only later
when re-drafted while roaming.

This arm changes ONLY that corroboration field: a draft row
counts toward `floorDraftRow` iff it is for the same blocker
uid, ends at hpAfter == 1, AND its raid-event day is
strictly less than the tbend event's day (draft day <
tbend day). Same-day drafts do NOT count: a draft later the
same day than the block is not proven to precede it, and the
corpus records days, not intra-day order, for these events.
Every other analyzer behavior is kept identical: the
classification rules (RESTORED / BLOCKED /
BY-DESIGN-NOT-RESTORED / UNMEASURED-cause), the blocker
fields, the census counts, the 1-HP pattern verdict rule,
the anchor check, reconciliation, and the wall numbers.
In particular the 1-HP pattern verdict counts blocker hp,
not the floor flag, so it must not move on this fix.

## Corpus and substrate (binding, verbatim from the assignment)

- Corpus: evidence/2026-10-30/perseed-draftflag-a/ as
  committed by sim-draftflag-a (16 seeds 75101-75116),
  read-only. This arm runs NO new sweep and NO new sims.
  The analyzer reads the committed corpus read-only and
  writes only evidence/2026-10-30/sim-floortime-a-analysis.json
  (the re-judged analysis; the blockedrestore analysis JSON
  is NOT overwritten) plus this prereg, the test script,
  and the evidence file.
- Field vocabulary inspected before this prereg (instrument
  design only, no census count judged): raid events carry
  `day` and a `drafts` array whose rows carry `uid` and
  `hpAfter`; tbend events carry `day`, `origin`, and
  `occupantBefore`. That is sufficient to time-order the
  flag. No census count was judged before this prereg.
- Determinism scratch goes to a worktree scratch dir (not
  /tmp, so no sibling cleanup can touch it mid-run) and is
  removed afterwards. Nothing is ever written into the
  corpus.

## Primary metric (binding)

Time-ordered floor count over the 13 BLOCKED rows of the
blockedrestore census: the number of BLOCKED rows whose
blocker has a draft row with hpAfter == 1 on a raid day
strictly before that row's tbend day.

## Prediction (binding — judged against this, not re-scored)

Expected result: 4, not 5. The only ever-floored row that
fails time-ordering is the s75113 anaconda row (block d61,
floor draft d64); the four 1-HP rows were already stated in
blockedrestore as floor-corroborated in time order, and no
other BLOCKED row is expected to gain or lose the flag.
If the re-judged count is NOT 4, the run reports that
plainly as a failed prediction — it is NOT re-scored
against a friendlier reading (e.g. <=, or same-day counts).

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS
  required. (Field-vocabulary inspection and code reading
  preceded this prereg; no re-judged count was computed
  before it.)
- Fix scope: scripts/analyze-blockedrestore-a.js changes
  ONLY the floor-corroboration computation (draft day <
  tbend day). No classification, census, pattern, anchor,
  reconciliation, or wall-number code changes. Any other
  diff in that file fails this leg.
- Fixtures green: scripts/test-blockedrestore-a.js remains
  green (46/46 as reported by blockedrestore, re-verified
  here) AND scripts/test-floortime-a.js is green, proving:
  (a) RED pre-fix behavior on the anaconda fixture — the
  old ever-floored rule returns true for a d64 floor draft
  against a d61 block; (b) GREEN post-fix — the fixed
  analyzer returns false for that fixture; (c) at least
  one positive time-ordered fixture — a floor draft dated
  strictly before the block returns true; (d) a same-day
  draft fixture returns false (strict <); (e) the
  re-judged counts on the real corpus (time-ordered floor
  count, BLOCKED n, 1-HP k, pattern verdict).
- Corpus byte-unchanged: no file under
  evidence/2026-10-30/perseed-draftflag-a/ written by this
  arm (verified via git status clean on the corpus dir at
  every commit).
- Determinism: analyzer run twice into separate scratch
  outputs produces byte-identical analysis JSON; scratch
  removed after the diff.
- Pattern verdict re-checked: the 1-HP pattern verdict
  recomputed on blocker hp must remain COMMON BUT NOT THE
  RULE (n = 13, k = 4, 4/13 = 30.8%, between the rarity bar
  <= 25% and the rule bar > 50%). If it moves, the run is
  DIAG-NO-GO and the move is reported, not explained away.
- Census stability: BLOCKED n stays 13, lost RESTORED /
  BLOCKED / BY-DESIGN / UNMEASURED counts stay 11 / 13 /
  0 / 0, total tbend events stay 102, anchor reproduces
  exactly (s75116 d159 origin uid 29 blocked by callback
  uid 33 hp 1 at (4,4)). Any move in a census count fails
  this leg — the fix touches only the corroboration flag.
- Sense: the anaconda chain read end to end (block d61,
  census presence d58-62, re-draft d64 ending at (5,5)) for
  meaning, not just counts, plus at least one
  time-ordered floor row's chain. Node-sim stubs Game.say
  to no-op, so there is no say transcript; sense evidence
  is the structured trace, stated as such.

## Verdict rule

- DIAG-GO iff prereg PASS + fix-scope PASS + fixtures
  PASS + corpus byte-unchanged PASS + determinism PASS +
  pattern verdict still COMMON BUT NOT THE RULE + census
  stability PASS + sense PASS + prediction met (count 4).
- DIAG-NO-GO on any failed leg. A miss is NO-GO, never
  re-scored against a friendlier metric mid-run; metric
  doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm proposes no damage buff,
  gate move, deed-bar move, or game change. Its verdict
  is about the measurement instrument (whether the floor
  corroboration is time-ordered), not about building to
  anything.
- Blockedrestore's, draftflag's, scholarmelt's, and
  removal's verdicts are carried, never re-judged: this
  arm re-judges ONLY the floor flag's time-ordering. Wall
  numbers are report-only, carried from blockedrestore
  and verified against the corpus, never claimed as a
  before/after.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Fix scripts/analyze-blockedrestore-a.js (floor flag
   only) + fixtures scripts/test-floortime-a.js, committed
   after the prereg.
3. Re-run the analyzer on the read-only corpus (NO new
   sweep, NO new sims); determinism gate (second run to
   scratch, diff, scratch removed); sense reads per the
   bar above; verify scripts/test-blockedrestore-a.js
   still green.
4. Evidence evidence/2026-10-30/sim-floortime-a.md with a
   prereg-legs table, the re-judged floor count, census
   stability, confirmation the pattern verdict is
   unaffected, wall numbers (report-only, carried from
   blockedrestore and verified against the corpus),
   plain-words village assessment, metric review, and
   ranked next.
5. No src/js change, no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges).

## Node harness

No harness is run by this arm: the analyzer and the test
scripts are plain node scripts over committed JSON (the
draftflag corpus). No jest is run by this arm; the
--cacheDirectory rule is therefore vacuous here and is
recorded as such rather than claimed. The node-harness
rules in the assignment (full src/js eval order, seeded
Math.random, never stub Game.save) are vacuous for this
analyzer-only arm — stated here, not claimed as complied
with by a harness that never ran.
