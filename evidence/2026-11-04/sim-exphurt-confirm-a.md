# sim-exphurt-confirm-a — VERDICT: INSUFFICIENT-DATA (pilot gate missed on the expedition-case leg; HALF 2 not run; hook neither confirmed nor killed)

Run: oversight-flesh-out-loop, run fleshout-20261104T1647Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-confirm-a. Axis: food-economy.
Arm: EXPHURT confirm (findings backlog #1699, claimed by this arm).
Binding prereg: evidence/2026-11-04/sim-exphurt-confirm-a-prereg.md
(committed BEFORE any judged sim, c520c97a4; read in full before
judging — this verdict is judged against it, §14).
Canon read first: docs/CANON.md; PRESERVATION.md and PARTY.md read
in the prior arm. No canon doc covers away-return timing or
hurt-return narration — the mechanism is code-read, not invented
canon. No sibling files touched (sim-bankfood-a, sim-fracchoice-b,
Loop B arms, scale-onramp axis all untouched); no main-tree touch;
no gate/price/deed/win-price change; no game-code change at all.

## THE QUESTION, IN ONE SENTENCE

Does the drafted hurt-clause hook for expedition homecomings
survive a confirming re-run on a fresh 16-seed band — i.e., does
the M1 blank (no expedition homecoming line mentions hurt) persist
at the pre-registered bar, with adequate N?

## WHAT HAPPENED, IN ORDER

1. Prereg committed first (c520c97a4): fresh 16-seed band
   99917–99932, staged HALF 1 (99917–99924, pilot-gate chunk)
   then HALF 2 (99925–99932, confirm chunk, only if the gate
   passes). Fresh-band check stated in the prereg (no 5-digit
   99917–99932 per-seed file anywhere in evidence/; the Oct-27
   spandraw files are 4-digit seeds 9991/9992).
2. Confirm instrument committed (f3837b70): sweep copy with the
   new band/corpus dir, D-at-last-hurt + M1-all lib, analyzer,
   proof test 19/19 green (plus prior lib proof 21/21 green) —
   all BEFORE any judged sim.
3. HALF 1 run: 8 seeds, competent policy, 100d death-aware cap,
   PLENTYDEPRI=1, DEPOSITGATE=1. Instrument health clean.
4. Pilot gate judged — and FAILED on one leg (below). Per the
   binding prereg, HALF 2 was NOT run. This is a stop, not a
   re-score: the gate was written to make exactly this call in
   advance, and §14 forbids moving it in the moment.

## PILOT GATE — MISSED ON ONE LEG (this is the verdict's hinge)

- 8 seeds complete: PASS. Instrument errors: 0: PASS.
  Unclassified cases: 0 (all 13 cases in exactly one outcome
  bucket): PASS.
- Expedition hurt cases opened: 2, bar >= 4: MISS. The bar was
  a lenient sniff test (half the prior arm's 0.75/seed rate,
  expected ~6 in 8 seeds); the observed rate here is 0.25/seed.
  The instrument is not broken — cases flow cleanly (13 total,
  hurt-return lines 10, retro-opened 2) — the expedition slice
  of the flow is just thin on this band.
- Consequence, stated plainly: HALF 2 not run; the pooled-16
  judgment (D-last denominator >= 8, M1 denominator >= 5) is
  unreachable from HALF 1 alone (2 expedition cases) and is NOT
  claimed. SPEC-READY is NOT confirmed. The hook is NEITHER
  confirmed NOR killed: §14a classification is SAMPLE FAILURE
  (inadequate N on the gated unit), not a disproven premise and
  not a guardrail failure. The drafted spec stays DRAFT. No
  hook was implemented, no game code touched, nothing to revert
  — a clean stop leaves no trace by construction.
- Why not run HALF 2 anyway: the prereg binds ("If any leg
  fails, STOP: no HALF 2"), and the staged design exists
  precisely so a thin pilot does not burn confirm spend on a
  verdict it cannot reach. Running HALF 2 after a gate miss
  would be post-hoc threshold shopping, the exact drift §14
  forbids. (For the record, not as a judgment: HALF 2 at the
  pooled prior+half1 rate of 0.5/seed would have yielded ~4
  more expedition cases, still short of the D-last denominator
  bar of 8 — the stop changes no verdict, it only saves spend.)

## THE NUMBERS (HALF 1 only, 8 seeds, 13 cases — NOT the pooled 16)

- By purpose: expedition 2, forage 2, water 2, leave 2, guard 3,
  visit 1, traps 1. By outcome: returned-hurt 10, died 3.
- D-open: 1/2 = 0.500 (denominator bar >= 8: NOT REACHED).
  Exped-shorter 1/2. Median signed gap 2.
- D-last (PRIMARY disconnect metric): 1/2 = 0.500 (denominator
  bar >= 8: NOT REACHED). Exped-shorter 1/2. Median signed gap 2.
  The one disconnect case is Sung (s99920): exped 10 vs away 12
  at both open and last hurt, gap 2, legs 11 — the expedHurt
  cap shape (legs+1 = 12 would be the cap; here the exped
  duration sits exactly at the legs count, away one leg longer).
  At-open and at-last-hurt agree on both HALF 1 expedition
  cases — no during-episode cap divergence was observed here,
  unlike the prior arm's Abderrazak case.
- M1 (PRIMARY, the blank): 0/2 = 0.000 — directionally the
  blank persists (no expedition homecoming line mentions hurt),
  but the denominator bar (>= 5) is NOT REACHED, so the
  pre-registered blank-persists bar (M1 <= 0.20 on >= 5) is NOT
  met as a judgment. Descriptive only.
- M1-all: 0/2 = 0.000 (both returned-hurt expedition cases were
  announced; no silent expedition return occurred here).
- M2: 2/2 = 1.000 — every announced hurt expedition return IS
  covered by the landed hurthome line, as in the prior arm.
- M3: 2/2 = 1.000 announced — both returns happened with the
  player at Haven, so the silence branch is again unmeasured
  for expeditions (not disproven).
- Latency: both returned-hurt expedition cases closed 1 part
  after the hurt event — the landed hurthome fix working as
  designed, third confirmation in a row (prior arm 5/5, here 2/2).
- Instrument health: errors 0, unclassified 0, hurt-return
  lines 10, retro-opened 2. Coverage: hurt-return lines 10 vs
  returned-hurt cases 10.

## SENSE TEST — BOTH RETURNED-HURT EXPEDITION RETURNS, QUOTED

Both pairs read exactly as the prior arm's five: a true hurt
line, then a celebration that erases it in the same tick.
Judgment unchanged: the homecoming line is the return's lasting
meaning, and it never carries the hurt.

1. Sung, s99920 (hp 5, the disconnect case, exped 10 vs away
   12): "🧭 Sung returns from the wilds hurt (health 5/100)
   — the trip cut short." then "🧭 Sung is back from far
   past the north (+726 kcal for the pantry, strange meat
   (unknown flesh — test it cautiously), 8 stories, a new scar)
   (Ask them what they saw.)" Eight stories and a scar for a
   hurt return at hp 5 — the celebration, not the hurt, is
   what the line remembers.
2. Ruby, s99920 (hp 6, exped 17 vs away 17, no disconnect):
   hurt line, then "🧭 Ruby is back from far past the south
   (+4674 kcal for the pantry, +1250 kcal of meat, strange
   meat (unknown flesh — test it cautiously), 5 stories, a new
   scar) (Ask them what they saw.)" A 5,924-kcal haul
   celebration after a hurt return at hp 6.

Judgment: the tonal contradiction the draft spec targets is
present in both cases, including the no-disconnect case — the
narration blank does not depend on the clock disconnect. This
is directional support for the spec, not a confirmation: N=2
cannot carry SPEC-READY, and this evidence says so instead of
rounding it up.

## REACHABILITY + VILLAGE ASSESSMENT (plain words, diag window)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 99917–99924 — an early/mid window, not a full-arc run,
and a DIAG corpus, not a scale panel. Nothing here claims scale
verdicts.
- Survived to 100d: 2/8 (99919, 99924); village-lost: 6/8
  (days 32–95). Median daysAlive 94 (sorted: 32, 81, 82, 83, 94,
  95, 100, 100).
- Wave reach: wave 4 on 5/8, wave 3 on 2/8, wave 2 on 1/8,
  wave 5 on 0/8. National / table / wins: 0/8, rank village
  on all 8 — the scale wall is untouched by this measurement
  arm, as expected.
- Deaths recorded: 121 across 8 seeds (21, 14, 14, 17, 7, 17,
  20, 11). Hurt travelers are again a small part of that story:
  only 3 of 13 hurt cases died, and every hurt expedition
  return made it home in 1 part. The village dies to the wider
  world, not to hurt returns lingering — the fix holds, and
  the remaining blank is what the homecoming SAYS.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not return narration. The
  blank this run re-documents is the record itself: hurt
  returns are narrated twice in one tick, and the second,
  lasting line forgets the hurt.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately: the panel
driver runs its own scorecard/cohort sims and cannot ingest
event-case corpora; it measures scale/cohort metrics, not
return-line text. Declared in the prereg BEFORE the sims. The
applicable before/after comparison (matched-seed re-run on
identical seeds) belongs to a LAND arm, which this run did not
become.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg (c520c97a4); confirm
  instrument + proof test (f3837b70); HALF 1 corpus (8 per-seed
  JSONs + sweep summary under evidence/2026-11-04/
  perseed-exphurt-confirm-a/); this evidence file.
- DOES NOT LAND: no game-code change; no hook; no hurthome-rule
  change; no gate/price/deed change; no clock write-back; no
  HALF 2 corpus (never run); no sibling files. No [needs-eyes]
  commit: nothing player-facing changed.

## PROOF

- scripts/test-exphurt-confirm-a.js: 19/19 green (D-last
  boundary incl. gap >= 2 vs < 2, missing-duration handling,
  M1-all announced-vs-silent handling, empty-denominator null).
- scripts/test-exphurt-a.js: 21/21 green (prior lib unchanged).
- Instrument errors: 0 across all 8 judged seeds. No
  unclassified cases. Retro-opened 2 (consistent with the
  fix-c coverage mechanism).
- node scripts/check.js --quick (after the instrument commit; no
  src/ change in this arm): 282 passed, 8 failed in 1029s.
  Reporting gap, stated plainly: the run's output was piped
  through `tail -15`, which truncated the failure list — the 8
  failing test names are NOT recoverable from this run's log,
  and this evidence does not invent them. What the visible tail
  does show: 120s per-test timeouts (test-table-endings-
  20261014.js 120s, test-capable-bot-20261014.js 120s,
  test-trust-observer-neutrality.js 102s as the slowest three)
  while sibling runs were concurrently loading the box (load
  ~9). Attribution: this arm touches zero src/ files (git diff
  HEAD -- src/ empty) and the green list contains zero exphurt
  entries, so none of the 8 failures can be caused by this
  arm's files — they are pre-existing/load-related, reported
  here, never waived. No re-run was spent to obtain a cleaner
  result: a second 17-minute run under the same sibling load
  would measure the load, not this arm.

## METRIC REVIEW (for the NEXT run, not a revision of this one)

- The expedition-case rate is itself unstable across bands:
  0.75/seed (prior pilot, 6/8) vs 0.25/seed (this HALF 1, 2/8),
  pooled 0.50/seed (8/16). A gate bar set from one band's rate
  will miss on the next band. Next run: budget from the POOLED
  rate, not the latest band — for D-last denominator >= 8 at
  0.5/seed, budget 24 seeds (expected ~12, with room for a
  thin band); for M1 denominator >= 5, the same 24 seeds give
  expected ~10 returned-hurt expedition cases at the observed
  returned-hurt share. Do NOT budget 16 and hope.
- Gate design: the staged pilot gate did its job (saved HALF 2
  spend on an unreachable verdict), but a rate-based gate leg
  on a thin, variable unit will keep stopping runs. Next run
  should EITHER pre-register a single un-staged band of 24+
  seeds with the gate on instrument health only (errors 0,
  unclassified 0), OR keep staging but set the pilot rate bar
  from the pooled 0.5/seed rate with a wide tolerance (e.g.
  >= 3 in 8, not >= 4). Either choice must be in the NEXT
  run's prereg before its sims — not applied retroactively
  here.
- D-open vs D-last: on this band they agree exactly (both
  1/2, same case). The prior arm's during-episode divergence
  (Abderrazak) did not recur. Keep D-last as the judged metric
  (it is the theoretically right snapshot), D-open for
  comparability — the pair costs nothing to report.
- M1/M1-all/M2/M3 worked exactly as designed; closing-part
  capture is clean (lines 10 = cases 10). Keep the quartet.
  M1-all added nothing here (no silent expedition returns),
  but it is the only metric that can catch the silence branch
  — keep it for the next run, where a silent expedition
  return may finally appear.
- Latency no longer discriminates anything (1 part every time,
  three confirmations running): future arms should not
  re-measure it as a primary.
- Convergence state for this axis (food-economy, exphurt
  blank): BEHAVIOR FIXED (hurthome fix, 1220Z), NARRATION
  MEASURED + SPEC DRAFTED (1445Z), CONFIRM STILL PENDING —
  second consecutive inadequate-N stop (6 then 2 expedition
  cases). The blank's direction has now been observed 7/7
  times (M1 0/5 + 0/2, descriptive pooling only, NOT a judged
  pooling); what is missing is a single adequately-powered
  band, not more directional evidence. The axis itself is not
  converged.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-return corpus: no wider dialogue verdict is
claimed — transcript capture was instrumented for hurt-traveler
lines, return lines, and lines naming case villagers only. No
new silence-branch instance was observed for any purpose in
HALF 1 (all 10 returned-hurt cases announced); the prior arm's
Meera visit-silence instance stands as the sole observed case.
