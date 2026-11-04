# sim-exphurt-confirm-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1647Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-confirm-a. Axis: food-economy.
Arm: EXPHURT confirm (findings backlog #1699, claimed by this arm —
the coordinator updates the backlog file; this arm does not touch it).
Sibling arms untouched: sim-bankfood-a files, sim-fracchoice-b
deploy-fraction work, Loop B arms (tendfloor/tendseason, fracchoice),
the scale-onramp axis. No sibling tree, no main tree touched.

## CONTEXT (carried forward, not re-litigated)

- Prior arm sim-exphurt-a (run 1445Z, evidence/2026-11-04/sim-exphurt-a.md
  + sim-exphurt-a-prereg.md) returned INSUFFICIENT-DATA for SPEC-READY:
  pilot gate missed on one leg — expedition hurt cases opened 6 vs bar
  >= 8 (bar miscalibrated: 0.75 expedition cases/seed on the event
  instrument, not hurthome-a's 1.75 dawn-episodes/seed across all
  purposes). The pre-declared confirm (99909–99916) was NOT triggered
  (it fired only if returned-hurt expedition cases < 5; they were
  exactly 5) and was NOT run. Judged numbers carried forward:
  D-at-open 1/6, D-at-last-hurt 2/6 (descriptive), M1 0/5, M2 5/5,
  M3 5/5, median daysAlive 83 (days 32, 37, 65, 78, 88, 100, 100, 100).
- The hurthome turn-home fix (1220Z, landed) is NOT re-litigated.
  The drafted hurt-clause spec (prior evidence, "SPEC — DRAFT") is
  the candidate: a text-only hurt clause appended to
  expeditionReturn's playerAtHaven homecoming line when the
  returnee's hp at return is 1..7.
- No canon doc covers away-return timing or hurt-return narration
  (CANON.md read first; PRESERVATION.md and PARTY.md read in the
  prior arm — haul/pantry and villager-treatment canon unchanged
  by this arm). The mechanism is code-read, not invented canon.

## GUARDRAILS (carried forward unchanged)

- No gate, price, deed bar, or win-price change in this arm.
- The landed hurthome line (src/js/game.js npcNodeTravel) stays
  intact and still fires first; the hook touches ONLY
  expeditionReturn's playerAtHaven line block in
  src/js/villager-agency.js.
- No change to survival, pantry, trust, deeds, or haul logic.
- No RNG-draw change: pick(dirs) still drawn exactly once,
  unconditionally, as today (warning #1698: conditioning the draw
  would cascade seeds).
- The playerAtHaven gate is unchanged: the hook fires only where
  the line already fires. The player-away silence branch is a
  SEPARATE blank, not this hook.
- No clock write-back: expedHurt's cap is NOT written back into
  v.away.duration (prior arm: behaviorally moot — hurt returns
  fired at latency 1 part regardless of either clock, and no
  observed divergence changed an outcome). A future clock-parity
  arm must first prove a divergence changing an outcome.
- Scope decision (unchanged): the hook lands ONLY if it is the
  single small narration hook above. If it would touch the
  hurthome rule, survival, or pantry logic, or need to reorder
  npcNodeTravel/agencyTick, STOP at SPEC-READY and say so.

## INSTRUMENT (event-based, warning #1697)

- scripts/hurthome-b-lib.js (UNCHANGED) + scripts/exphurt-a-lib.js
  (UNCHANGED) for event cases and M1/M2/M3/D-at-open.
- NEW scripts/sweep-exphurt-confirm-a.js: same harness/policy/
  runDays pattern as sweep-exphurt-a.js, same env gates, same
  retro-open and closing-part capture — only the seed band and
  the corpus directory change (evidence/2026-11-04/
  perseed-exphurt-confirm-a/). It refuses any seed list other
  than the two pre-registered halves below.
- NEW scripts/exphurt-confirm-a-lib.js (pure, proof-tested):
  D-at-last-hurt (denominator: expedition cases with BOTH
  durations present at last hurt — expedDurationAtLastHurt vs
  awayDuration) and M1-all (among ALL returned-hurt expedition
  cases, share whose expeditionReturn line mentions hurt —
  unannounced cases count as misses, so the silence branch is
  inside the metric). No RNG reads, no game-value writes.
- NEW scripts/analyze-exphurt-confirm-a.js: pooled tables for
  D-open, D-last, M1, M1-all, M2, M3 + quoted return-line pairs.
- NEW scripts/test-exphurt-confirm-a.js: proof for the confirm
  lib (D-last boundary, missing-duration handling, M1-all
  announced-vs-silent handling) + the hook proof (see LAND
  section). Must be green BEFORE the judged sims; the hook
  proof is added before the re-run, not before the baseline.

## DESIGN (pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with the hurthome
  lineage and the prior arm; dead villages stop simulating).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: CONFIRM band 99917–99932 (16 seeds), staged in two
  halves: HALF 1 = 99917–99924 (pilot-gate chunk), HALF 2 =
  99925–99932 (confirm chunk, run only if the pilot gate
  passes). Fresh-band check, stated plainly: no per-seed file
  in the whole evidence/ tree carries a 5-digit seed 99917–99932
  (the Oct-27 spandraw files are 4-digit seeds 9991/9992, a
  different scale); the 99901–99908 pilot band is NOT re-judged,
  and the unrun 99909–99916 pre-declared confirm is NOT used
  here, so this band is fresh for this instrument.
- No other expansion: no horizon extension, no hp-gate widening,
  no seed re-picking. If the pooled gate below fails, the run
  ends — it does not shop for seeds.

## PRE-REGISTERED METRICS (judged exactly against this header, §14)

Unit: one event case (hurthome-b-lib). Disconnect denominators:
expedition-purpose cases with BOTH durations present (at open
for D-open, at last hurt for D-last).

- PILOT GATE (after HALF 1, before HALF 2 spend): 8 seeds
  complete, instrument errors 0, unclassified cases 0 (every
  case in exactly one outcome bucket), expedition hurt cases
  opened >= 4 (sniff test at the prior 0.75/seed rate: expected
  ~6). If any leg fails, STOP: no HALF 2, verdict
  INSUFFICIENT-DATA.
- D-open (comparability with prior arm): share of denominator
  cases with |expedDurationAtOpen − awayDuration| >= 2.
  Also reported: exped-shorter share, median signed gap.
- D-last (PRIMARY disconnect metric, per prior metric review):
  share of D-last denominator cases with
  |expedDurationAtLastHurt − awayDuration| >= 2. Also reported:
  exped-shorter share, median signed gap.
- M1 (PRIMARY, the blank): among returned-hurt expedition cases
  WITH an expeditionReturn line in the closing part, the share
  whose expeditionReturn line mentions hurt.
- M1-all (pre-registered secondary): among ALL returned-hurt
  expedition cases, the share whose expeditionReturn line
  mentions hurt (silent returns count as misses).
- M2: among ALL returned-hurt expedition cases, the share with
  ANY closing-part return line mentioning hurt (hurthome line
  counts).
- M3: among returned-hurt expedition cases, the share with
  >= 1 closing-part return line at all.
- SENSE: every returned-hurt expedition return-line pair quoted
  and judged for meaning (does the homecoming read as hurt?),
  or at least 5 if more than 5 exist.
- Instrument health: errors 0, unclassified 0 across all 16.
- Wall numbers: reported descriptively from this diag corpus
  only (per-seed daysAlive, rank, maxWave, win flag); this
  corpus is a diag corpus, not a scale panel, and states so
  plainly if a wall number is unreadable from it.

## PRE-REGISTERED JUDGMENT

- SPEC-READY CONFIRMED (the confirm's own verdict) iff: pilot
  gate passed + pooled 16 complete + instrument health clean +
  D-last denominator >= 8 + M1 denominator >= 5 + M1 <= 0.20
  (the blank persists: at most 1 in 5 announced homecomings
  mentions hurt, against the prior 0/5). D-open is reported
  for comparability but does not gate the verdict; D-last is
  the judged disconnect metric, chosen here in advance — never
  the friendlier of the two after the fact.
- GO for LAND (the hook) iff SPEC-READY CONFIRMED + hook proof
  test green + same-seed re-run (99917–99932, hook armed) shows
  M1 >= 0.80 among announced expedition returns + median
  daysAlive delta (matched seeds, post-hook minus pre-hook)
  >= −5d + instrument errors still 0 + hook diff touching
  ONLY expeditionReturn's line block + node scripts/check.js
  --quick green after the change. A miss on any leg is NO-GO
  for LAND.
- If M1 > 0.20 with adequate N (M1 denominator >= 5, gate
  passed): the blank does NOT persist — verdict NO-GO, §14a
  KILLED (disproven premise: homecoming lines already carry
  hurt often enough that the hook is unnecessary). Kill
  cleanly: no game-code trace, policy files deleted, game-code
  reverted before the final commit.
- If the gate fails on N (too few cases) or instrument health:
  verdict INSUFFICIENT-DATA (§14a: sample/instrument failure —
  the hook is neither confirmed nor killed; the spec stays
  draft and the next run re-budgets seeds). Not a kill.
- If a post-hook guardrail fails: NO-GO for LAND, §14a KILLED
  (guardrail failure — hook reverted, no trace).
- A miss is never re-scored against a friendlier metric
  mid-run. If a metric proves wrong, it goes under "metric
  review" for the NEXT run.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE here, in advance:
  scripts/balance-panel.js is a panel driver with its own
  observer contract (scorecard/cohorts/luck sims); it cannot
  ingest event-case corpora and measures scale/cohort metrics,
  not return-line text. The applicable before/after comparison
  for the LAND re-run is the matched-seed event-instrument
  re-run on identical seeds (99917–99932), judged by the
  pre-registered M1 >= 0.80 bar and daysAlive guardrail above.
  No panel compare file is attached, deliberately, for the
  same reason the prior arm declared it.

## WHAT LANDS, WHAT DOES NOT

- LANDS (coordinator merges; worker does not push, bump, or
  verify live): this prereg; confirm instrument + proof test;
  confirm corpus (16 per-seed JSONs + sweep summary); evidence
  file; and, ONLY on a LAND verdict, the hook + its proof test
  + the re-run corpus. A player-facing narration change counts
  for [needs-eyes] — the hook commit message carries it.
- DOES NOT LAND: no hurthome-rule change, no gate/price/deed
  change, no clock write-back, no sibling files, no other
  lane's files. Killed arms leave no trace.

## HOOK SPEC (drafted, carried from the prior arm — final wording
## for the landing arm to finalize)

Write site: src/js/villager-agency.js, expeditionReturn(vid,
playerAtHaven), the playerAtHaven line block (bits/suffix/
pick(dirs)/this.say block, ~line 702). Predicate: returnee hp
at expeditionReturn time in 1..7 — the same gate as
shouldHurtReturn and awayHungerVoice; read as
(this.state.village.health || {})[vid]. Do NOT use
encounters-includes-'hurt' as the predicate (it would fire
for villagers hurt mid-expedition but healed before return).
Effect: the SAME expeditionReturn line, with a hurt clause
appended to its suffix when the predicate holds (requirement:
the word "hurt" in the line, so the M1 classifier and any
skimming player both see it). Healthy returns keep the
template byte-identical. pick(dirs) still drawn exactly once,
unconditionally.
