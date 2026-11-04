# sim-hurthome-fix-b — VERDICT: NO-GO (primary met, BOTH guardrails breached; fix NOT landed)

Run: oversight-flesh-out-loop, run fleshout-20261104T1120Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-b. Axis: food-economy.
Arm: hurt-aware turn-home rule for TRIPS, re-judged with an EVENT-based
instrument — the NAMED NEXT ARM from Loop A sim-hurthome-fix-a
(evidence/2026-11-04/sim-hurthome-fix-a.md, INSUFFICIENT-DATA).
Binding prereg: evidence/2026-11-04/sim-hurthome-fix-b-prereg.md (read
in full before judging; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon doc
covers away-return timing or hurt-traveler behavior — the mechanism
is code-read, not invented canon.
Fix commit (TESTED, then REVERTED — see "What lands" below):
5cf217912 (cherry-pick of 299d94403 on this branch; game.js hurt
check + hurt return line + proof test, [needs-eyes]). The revert
commit is listed in the report; the fix commit stays in branch
history so a future arm can re-apply it exactly.

## THE DECISION UNDER TEST (chosen in the prereg, before any judged sim)

ONE mechanism: a health check on the return path. In npcNodeTravel
(game.js), a ledger-away villager on a TRIP (any purpose except
'leave') with hp <= 7 (the awayHungerVoice gate, alive) returns at
the next travel tick, regardless of the trip clock. LEAVE walk-outs
are excluded by purpose, not by clock arithmetic. The expedHurt
write-back was REJECTED (as in fix-a) and was NOT added mid-run.
The hurt-aware return line fires only on the hurt branch, only when
the player is at Haven to see it: "🧭 {first} returns from the wilds
hurt (health {hp}/100) — the trip cut short."

## INSTRUMENT (event-based, pinned in the prereg)

- scripts/hurthome-b-lib.js (pure case logic, proof-tested 20/20 by
  scripts/test-hurthome-b.js BEFORE any judged sim) +
  scripts/sweep-hurthome-fix-b.js + scripts/analyze-hurthome-fix-b.js.
  The dawn census is NOT reused for judging.
- CASE = one hurt episode of one ledger-away villager. Opens on an
  alive-and-hurt observation (hp 1..7) via the hurtVillager
  post-wrapper (source 'hurtVillager', with cause/dmg/hpAfter) or
  the per-part scan net after npcNodeTravel (source 'scan' — catches
  direct-write hurts and hurts-before-departure still hurt while
  away). One case per villager at a time; a healed interval breaks
  continuity (case closes 'healed-away' when a part scan finds its
  villager still away with hp > 7, so a later re-hurt opens a new
  case). Lethal one-shot hurts with no prior alive-hurt observation
  open NO case (the villager never entered the hurt population
  alive); they appear only in per-seed death counts.
- Cases close as exactly one of: returned-hurt (away record gone at
  a travel tick, pre-travel hp 1..7), returned-healed (pre-travel hp
  > 7), returned-unknown (pre-travel hp missing — excluded from the
  latency population, counted), died, healed-away, censored (still
  away-and-hurt at run end), censored-tripKeyChanged.
- RETURN LATENCY (parts) = (closeDay − eventDay) * 4 +
  (closePart − eventPart), for returned-hurt cases only, pooled
  case-level median (never a median of per-seed medians).
- TRIPS vs WALK-OUTS always split by purpose. Never pooled.
- Cell/code guard in the sweep: CELL=armed refuses to run without
  Game.shouldHurtReturn; CELL=baseline refuses to run with it.
  BASELINE ran first on HEAD~1 game.js (git diff showed exactly the
  fix hunk reversed, 1 insertion / 28 deletions); ARMED ran after
  restoring HEAD game.js (tree clean at the fix commit).
- §15 BALANCED PANEL — DECLARED INAPPLICABLE in the prereg before
  the pilot (panel measures no hurt-event latency metric;
  fabricating a compare file would be dishonest). Comparison
  instrument is the pre-registered per-seed matched table below
  (identical seeds, policy, horizon, env, one instrument).

## CELLS (identical except the one fix commit)

- Policy: competent, unchanged. Horizon: 100d death-aware cap.
  Env: PLENTYDEPRI=1, DEPOSITGATE=1. Seeds: PILOT 97601–97608,
  CONFIRM 97609–97616 (fresh band; zero s976* per-seed files and
  zero 976* files existed in evidence/2026-11-04/ before adoption).
- Corpus: evidence/2026-11-04/perseed-hurthome-fix-b/
  (16 per-seed JSONs per cell + sweep-baseline.json +
  sweep-armed.json). Instrument errors: 0 in both cells.
  Every case classified: 0 unclassified in both cells.
- PILOT GATE (prereg): trip event cases >= 8 in EACH cell.
  Baseline pilot: 17 trip cases. Armed pilot: 12 trip cases.
  GATE PASSED in both cells — the confirm band ran as budgeted.

## VERDICT: NO-GO

Judged census (pooled 16 seeds per cell): baseline trip cases 25
(>= 16 ✓), armed trip cases 24 (>= 16 ✓); returned-hurt trip cases
baseline 11 (>= 8 ✓), armed 22 (>= 8 ✓). The census is judged, not
withheld — unlike fix-a, this instrument yields a verdict.
- PRIMARY (trips, returned-hurt, pooled median latency): armed
  median 0 parts vs baseline median 2 parts. Condition (a) armed
  <= 2 parts: MET (0). Condition (b) armed < baseline: MET (0 < 2).
  PRIMARY MET — the rule does what it claims: hurt travelers come
  home at the next travel tick, not when the clock runs out.
- SECONDARY (non-contradiction): armed trip died-while-away share
  0.042 (1/24) vs baseline 0.240 (6/25) — armed <= baseline ✓.
  Hurt-return lines: armed 24 vs baseline 0. Source split (trips):
  baseline 24 hurtVillager + 1 scan; armed 24 hurtVillager — the
  scan net caught exactly one baseline case, so hurtVillager covers
  essentially every hurt path in this corpus.
- WALK-OUT EXCLUSION: armed walk-out returned-hurt cases 0;
  armed walk-out cases 4 (3 died, 1 healed-away); NO armed
  hurt-return line names a walk-out villager (walk-out case names
  Raj, Robin, Meera — none appears in the 24 lines). EXCLUSION
  HOLDS — no failure, nothing to void on this leg.
- NARRATION AUDIT: 24 armed hurt-return lines, >= 1 required;
  two quoted and judged TRUE below (Dorothy, Fernando — line hp
  matches each case's return snapshot). NARRATION PASSES.
- GUARDRAILS (hard, prereg — BOTH BREACHED, and a breach voids GO
  even if the primary passes):
  median daysAlive armed 84.5 vs baseline 100 (delta −15.5,
  tolerance −10) — BREACH.
  survived-seed count armed 6 vs baseline 9 (delta −3,
  tolerance −2) — BREACH.
  Total deaths: armed 230 vs baseline 201 (+29).
- NO-GO by the pre-registered hard rule. The primary is met, the
  mechanism is proven, the narration is true, the exclusion holds
  — and the run's villages still died sooner in the armed cell.
  That split is the finding, not a reason to re-score: §14 binds
  this run to its header, and the guardrail question (systematic
  survival cost of early returns vs RNG cascade noise — see
  "Metric review") goes to the NEXT run, never into this verdict.

## THE NUMBERS (pooled 16 seeds per cell, judged)

TRIPS (purpose != 'leave'):
- Baseline: n=25. Outcomes: returned-hurt 11, died 6,
  healed-away 7, returned-healed 1, censored 0, returned-unknown 0.
  Returned-hurt latencies (parts): [2,1,0,1,4,5,0,3,1,3,4],
  median 2, mean 2.18. Died-while-away share 6/25 = 0.240.
- Armed: n=24. Outcomes: returned-hurt 22, died 1,
  healed-away 1, returned-healed 0, censored 0, returned-unknown 0.
  Returned-hurt latencies (parts):
  [1,1,0,0,1,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,0],
  median 0, mean 0.41. Died-while-away share 1/24 = 0.042.
- What the rule changes, mechanically: it converts the baseline's
  died (6→1) and healed-away (7→1) cases into returned-hurt cases
  (11→22). Hurt travelers almost never die away or heal away
  anymore — they come home, immediately. That conversion is the
  mechanism working exactly as designed; it is also the prime
  suspect for the guardrail breach (see "Metric review").
WALK-OUTS (purpose 'leave'):
- Baseline: n=3, all died, 0 returned. Armed: n=4 (3 died,
  1 healed-away), 0 returned. Come-home 0 in both cells.
GUARDRAILS (hard, prereg):
- Median daysAlive: baseline 100, armed 84.5 (delta −15.5,
  tolerance −10) — BREACH.
- Survived seeds (daysAlive >= 100): baseline 9/16, armed 6/16
  (delta −3, tolerance −2) — BREACH.
WALL NUMBERS (this corpus — a 100d hurt-return corpus, not a scale
panel, and nothing here claims otherwise):
- National / table / wins: 0/16 in both cells. MaxWave 4 in both
  cells. The scale wall is untouched by this arm, as expected.

## PER-SEED MATCHED TABLE

seed | B days | B tripCases | B retHurt | A days | A tripCases | A retHurt | A hurtLines
97601 | 100 | 2 | 0 | 81 | 2 | 2 | 2
97602 | 100 | 2 | 1 | 100 | 1 | 1 | 1
97603 | 70 | 4 | 1 | 92 | 3 | 3 | 3
97604 | 78 | 5 | 3 | 72 | 3 | 2 | 2
97605 | 64 | 0 | 0 | 64 | 0 | 0 | 0
97606 | 59 | 3 | 2 | 55 | 1 | 0 | 1
97607 | 76 | 0 | 0 | 76 | 0 | 0 | 0
97608 | 100 | 1 | 0 | 88 | 2 | 2 | 2
97609 | 100 | 2 | 2 | 100 | 3 | 3 | 3
97610 | 100 | 0 | 0 | 100 | 0 | 0 | 0
97611 | 63 | 1 | 1 | 100 | 3 | 3 | 3
97612 | 28 | 1 | 0 | 36 | 1 | 1 | 1
97613 | 100 | 1 | 0 | 100 | 2 | 2 | 2
97614 | 100 | 1 | 1 | 80 | 1 | 1 | 1
97615 | 100 | 1 | 0 | 81 | 2 | 2 | 2
97616 | 100 | 1 | 0 | 100 | 0 | 0 | 1
Matched-seed MEDIANS are the unit of comparison — never individual
seeds. Note the cascade in both directions (97611: died d63 →
survived 100d; 97601: survived 100d → died d81), the same RNG
re-routing fix-a documented: one early hurt return re-routes the
whole village's future. That two-way flip pattern is why the
guardrail breach cannot be read as proof of a systematic survival
cost on 16 seeds — and also why it cannot be waved away: the
pre-registered guardrails breached, and only a fresh band (or a
larger one) can separate cascade noise from a real cost.

## SENSE TEST — HURT RETURNS READ AS PEOPLE COMING HOME HURT

Two hurt returns quoted and judged against their own case records
(SENSE-TESTING LAW: meaning, not just counts). A third note covers
the two lines the case instrument missed — the gap is understood
and bounded, not hidden.
- "🧭 Dorothy returns from the wilds hurt (health 4/100) — the trip
  cut short." (s97601, d25 p0, expedition.) Case: event d24 p3,
  hp 1, cause monster; away-meal line d24 p4 ("Dorothy eats away
  from the haven — 1392 kcal from the pack — while hurt (health
  1/100). They're still out on a long trek — the trip isn't over
  yet."); return d25 p0, pre-travel hp 4, latency 1 part. TRUE:
  name and hp 4 match the case's return snapshot exactly. The
  story reads as a person: mauled to 1 HP, ate from the pack while
  hurt, came home the next part — and the same part brings the
  expedition return line ("back from past the north, +4000 kcal
  of meat, 3 stories, a new scar"), then days later the fire tells
  Desmond's mauling story. Hurt → coming home, with consequences
  (meat, scar, stories) that persist after the return. The hp
  1→4 rise between event and return is healing the instrument
  does not attribute (meal? regen?) — the line still says the
  true hp at return, which is what it claims.
- "🧭 Fernando returns from the wilds hurt (health 5/100) — the trip
  cut short." (s97603, d42 p3, explore.) Case: event d42 p3, hp 5,
  cause monster, latency 0 parts, pre-travel hp 5. TRUE: name and
  hp match; the same part carries the mauling line ("🩸 The Spool
  mauled Fernando (−81 health) over 5 rounds. They're lucky to be
  breathing.") — hurt and return in the same part, because the
  hurt preceded travel in that part's processing. Next day he is
  back foraging (d43 p4, +584 kcal). A person mauled, home at
  once, working again tomorrow — not a clock running out.
- The two lines WITHOUT a returned-hurt case (24 lines vs 22
  cases) — understood, bounded, no verdict impact:
  (a) Boris (s97616, d49 p1, hp 4): NO trip case at all in that
  seed — he departed already hurt, so no hurt-while-away event
  was ever observed; the armed rule still returned him at the
  next travel tick (line + paired forage return line, +129 kcal,
  same part). The case instrument is blind to departed-hurt
  returns in the armed cell (the scan net runs after travel, so
  a same-tick hurt-branch return never opens a case); the line
  is still true by construction (fires only on the hurt branch,
  hp read at the tick).
  (b) Antonina (s97606, d17 p1, hp 6): her case closed
  'healed-away' (event d17 p0, hp 6, latency 1) and the line fired
  in the same part — a heal-then-rehurt within one part closed
  the case before the hurt-branch return. The line's hp is
  independently corroborated by the very next line ("🩹 Antonina
  is hurting (6 HP) — You patch them up before they head out.
  (6 → 31 HP)"), then she walks out with Omar the same part.
  TRUE, and the most human beat in the corpus: hurt, home, patched,
  back out with company.
  Adding these 2 latency-0/1 returns to the armed population (22
  → 24) would not move the armed median (0). The gap undercounts
  armed hurt returns by ~8%; it does not bias the primary.
Judgment: where the line fires, the behavior reads as a person
deciding (hurt → coming home), not a clock running out — and the
surrounding transcript (meals while hurt, mauling lines, patching,
walking out with company, fire stories) keeps making sense around
it. The line's limit is unchanged from fix-a: it fires only when
the player is at Haven at the return tick, so some hurt returns
still read as routine.

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 97601–97616 — an early/mid window, not a full-arc run.
- Survived to 100d: baseline 9/16, armed 6/16. Wave reach: wave 4
  in both cells (maxWave 4). National / table / wins: 0/16 in both
  cells — the scale wall is untouched by this arm, as expected.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck plus, in the armed cell, the
  RNG cascade after the first hurt return (two-way flips, see the
  matched table). The blank this run fills is the JUDGMENT fix-a
  could not make: the rule measurably works (median latency 2 → 0
  parts, died-away share 0.240 → 0.042, 24 true hurt-return lines)
  AND the run's villages still died sooner (median daysAlive
  100 → 84.5, survived 9 → 6, deaths 201 → 230). Both halves are
  real on these numbers; the open question is whether the second
  half is a cost of the rule or cascade noise, and 16 seeds cannot
  separate those. A future arm that wants this fix must first
  answer that question on a fresh, larger band — not by re-scoring
  this one.

## PROOF

- scripts/test-hurthome-fix-a.js: 10/10 green WITH the fix
  (cherry-picked fix commit, verified before the prereg and before
  any judged sim). It is REVERTED with the fix (see below) — it
  asserts a function the reverted tree does not have, so keeping
  it would be a red test, not evidence.
- scripts/test-hurthome-b.js: 20/20 green (pure case logic:
  open/count/close outcomes, latency across day rolls, pooled
  median, tripKey-change censoring, leave-purpose cases). It
  STAYS (it tests only the instrument lib, which stays).
- Cell/code guard: the sweep refused the wrong code by design
  (never tripped — every leg ran against its intended code; the
  guard's presence is verified by code-read, not by a trip).
- Baseline determinism: not re-run (the instrument is new; its
  value here is the matched comparison, not a determinism claim).
- Instrument errors: 0 across all 32 judged cell-seeds
  (16 baseline + 16 armed). No unclassified cases.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg + this evidence; baseline
  + armed corpora (32 per-seed JSONs + both sweep summaries);
  event instrument (hurthome-b-lib + sweep + analyzer + lib
  proof test), reusable by the next arm.
- DOES NOT LAND (reverted in the revert commit listed in the
  report): src/js/game.js hurt check + hurt line, and
  scripts/test-hurthome-fix-a.js. Reason: the verdict is NO-GO
  (guardrails breached) — an unproven behavior change must not
  ship through this branch. The fix commit (5cf217912, cherry-pick
  of 299d94403) remains in branch history; a future arm
  re-applies it, re-proofs it, and judges the guardrail question
  on a fresh band.
- DOES NOT LAND: no gate/price/deed/readyDemand change; no
  policy-default change; no other lane's files; no expedHurt
  write-back (rejected in the prereg, not added).

## NAMED NEXT ARM (documented, not landed)

sim-hurthome-fix-c (proposed): re-apply the fix, and judge the
GUARDRAIL question the primary cannot answer — is early return a
survival cost or cascade noise? Design it before running: a fresh
band (never 975xx/976xx), 16+ seeds per cell, pre-registered
guardrails with a cascade-noise analysis (per-seed flip directions
+ total-death decomposition: which deaths move, and whether early
returned villagers themselves die sooner after return). Keep the
event instrument, the trip/walk-out split, the LEAVE exclusion,
and the narration audit from this prereg. Do NOT re-litigate the
latency primary — it is settled (0 vs 2 parts).

## METRIC REVIEW

- Median return latency in parts was the RIGHT primary for this
  fix: it separates the rule from the clock (armed 0 vs baseline
  2, with the armed distribution piled at 0–1 as the next-tick
  mechanism predicts), where come-home rate could not (saturated
  baseline) and dawn episodes could not (wrong population). Keep
  it for any re-judgement.
- The guardrails did their job — including, uncomfortably, biting
  on a run whose primary passed. But on 16 seeds with two-way
  cascade flips, a −10-day / −2-seed guardrail may be tighter
  than the cascade noise floor: baseline and armed medians here
  rest on a handful of seeds near the 100d cap (baseline has
  nine 100d seeds; armed six). A future arm should pre-register
  a noise-aware guardrail (e.g. a larger band, or a flip-direction
  analysis alongside the medians) rather than loosening these
  thresholds after seeing the miss — loosening now would be
  re-scoring, and this run does not do it.
- The event instrument UNDERCOUNTS armed hurt returns by ~8%
  (24 lines vs 22 cases): departed-hurt returns never open a case
  (scan net runs after travel), and a heal-then-rehurt within one
  part can close a case before the hurt-branch return. Fix for
  the next arm: open a case retrospectively when a hurt-return
  line fires without an open case (the line itself is the event
  record), and report line-count vs case-count as a coverage
  check every run. The undercount does not bias this verdict
  (adding the 2 missing latency-0/1 cases leaves the armed
  median at 0).
- The scan net caught exactly 1 case in 32 seeds — hurtVillager
  covers essentially every hurt path in this corpus, so the scan
  net is cheap insurance, not a second population. Keep it.
- The trip/walk-out split, the LEAVE exclusion, and the
  "report died share alongside latency, never latency alone"
  rule all held up and must be kept: pooling would have hidden
  both the exclusion success and the guardrail breach.
- Convergence state for this axis (food-economy, hurt-traveler
  blank): BEHAVIOR MEASURED + FIX PROTOTYPED + MECHANISM PROVEN
  (latency 0 vs 2, died-away share down, narration true) BUT
  SURVIVAL UNPROVEN — the fix decision is open pending a
  guardrail-focused arm, and the pantry-empty story remains a
  separate question.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-traveler corpus: no wider dialogue verdict is
claimed — the transcript capture was instrumented for
hurt-traveler lines, return lines, and lines naming case villagers
only, so no broader robotic/static/repeated dialogue judgment is
made here.
