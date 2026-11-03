# sim-awayration2-adopt-b — ADOPTION + PILOT VERDICT: NO-GO, ARM KILLED

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T1930Z.
Worker tree: ~/workspace/worktrees/sim-awayration2-adopt-b. Branch base:
master 77ff4a807 (current anchor at adoption time).
Axis: food-economy. Lever: AWAY-RATION dawn-pack sizing.
Adopts dead arm sim-awayration2-b (Loop B run 1630Z, died mid-armed-arm;
coordinator-verified dead: heartbeats 145 min stale, no processes).
Binding prereg: evidence/2026-11-03/sim-awayration2-b-prereg.md (read in
full before any judged leg; it binds this verdict — see §14 below).
Canon read first: docs/CANON.md, docs/PRESERVATION.md (food ladder; pack
food moves only what fits in the actual pack), docs/BALANCING.md (2,000
kcal/day adult anchor). No canon doc covers away-ration sizing — the size
tested here was a finding, not canon, and it is now a killed finding.

## ADOPTION RECORD (what was taken over, and how verified)

1. Cherry-picked dead commit 3b1c9804a onto this branch (clean, no
   conflicts) as 5a2535d89: prereg + diag instrument
   (scripts/sweep-awayration2-b.js, scripts/analyze-awayration2-b.js,
   proof scripts/test-awayration2-b.js) + diag pilot corpus
   (evidence/2026-11-03/perseed-awayration2-b/, 8 seeds 96101–96108).
2. Salvaged the uncommitted fix ONLY by reading the dead tree's diff
   (`git -C ~/workspace/worktrees/sim-awayration2-b diff`, 138 lines, 2
   files) and applying it deliberately into this tree — no wholesale
   working-file copy, nothing committed from the dead tree. The diff
   matched the prereg's exact formula: packKcal(vid, mealWant) sized to
   dayWant (max(200, round(mealWant)), NO random term, NO hunger
   deduction, NO bold bonus); theft callers pass no mealWant and get the
   old formula exactly; packMeal passes want; top-up block untouched.
   `git apply --check` passed on this tree's game.js before applying.
3. Copied the dead worker's armed pilot corpus into this tree's
   evidence/2026-11-03/perseed-awayration2-b-armed/ and verified
   completeness: 8 per-seed JSONs + sweep-competent.json + pilot-run.log,
   all JSONs parse.
4. Proof test re-run on this branch WITH the fix: ALL LEGS PASS
   (leg A fixture decomposition, leg B live wiring + determinism
   nPrimary=71 joinRate=1.000, leg C fix proof: mealDawn=1500 for want
   1200, theftPack=1000 for hunger-100 non-bold, floorDawn=500 for want
   100, fallbackPack=1000, topUpTake=1500). The fix does what the prereg
   specified. It just does not move the judged metric.
5. Analyzer re-run on the salvaged armed corpus by this worker (not the
   dead worker's numbers): see below. Then a full armed sweep re-run on
   this tree's base as a robustness check (see "Base drift" below).
6. Dead worker's leftover state, dispositioned, not trusted: the
   checkquick-armed.log is a TRUNCATED mid-run check.js quick log (2
   lines, no summary — the F's in it are uninterpretable, and no verdict
   is drawn from them); the dead tree's panel-before/ was NOT reused
   (it may have been built with the fix already in the working tree, so
   its "before" label is unverifiable) — both panels below were built
   fresh in this tree.

## PRE-REGISTERED VERDICT (binding, MEASUREMENT.md §14)

Primary metric (one): mean pack-meal shortfall (want − take, kcal) across
primary pack meals, competent policy, pilot seeds 96101–96108, 100d
death-aware cap. BASELINE (diag corpus): 13.8 kcal (11/417 short, max
1,229). GO (ALL required): armed mean ≤ 5.0 kcal AND armed shortfall-meal
share ≤ 0.010. Guardrails: (a) pack-day adequacy ≥ 0.98 (baseline 0.993)
AND starvation deaths ≤ baseline + 2 (= 8); (b) pantry draws honest real
items (proof leg C); (c) theft semantics unchanged (proof leg C).

JUDGED RESULT — armed (salvaged corpus, analyzer re-run by this worker):
- Primary pack meals: 327 (baseline 417 — fewer because the fix removes
  a Math.random consumption on the meal path, shifting the downstream
  RNG stream; trajectories diverge, which is expected, not a lever
  effect).
- Mean shortfall: 15.2 kcal (GO ≤ 5.0 — MISS, and worse than baseline
  13.8 in absolute terms; the move is noise around a pantry-empty floor,
  not an improvement).
- Shortfall-meal share: 0.024, 8/327 short (GO ≤ 0.010 — MISS; baseline
  0.026, 11/417).
- Decomposition: topUpGap share 1.000, theftGap 0.000, residual 0.000 —
  identical mechanism to baseline. ALL 8 shortfall meals were pantry-SHORT
  for their top-up request (mean pantry on shortfall meals 150 kcal vs
  21,419.8 on full meals). Dawn now tracks want (dawn mean 693 vs want
  mean 582, dawnGap mean −111 vs baseline −293) and the top-up almost
  never fires (mean 0) — because the dawn pack already covers want on
  pantry-plentiful days, and on pantry-empty days there is nothing more
  to draw. The diag's expectation is confirmed exactly.
- Guardrail (a): pack-day adequacy 0.985 ≥ 0.98 (PASS), BUT starvation
  deaths 13 > 8 (BREACH on the letter of the guardrail). All 13 are on
  pantry-0 seeds (96102 ×2 away, 96104 ×5, 96105 ×6) — the same
  empty-pantry collapse the baseline showed (6 deaths, 96104/96105
  pantry 0), amplified by RNG-stream divergence, not by any ration
  mechanism (adequacy holds; every shortfall meal is pantry-short).
  The breach is reported as written; it is not needed for the verdict,
  since the primary already misses by 3×.
- Guardrails (b) and (c): PASS by proof leg C (pantry loses exactly the
  drawn kcal; theft-path pack stays in the old-formula range).

VERDICT: NO-GO. Per the prereg, the arm is KILLED: the game-code fix is
reverted with no trace (see below). Confirm seeds 96109–96124 DO NOT RUN
— the prereg permits them ONLY on pilot GO. No re-scoring against any
friendlier metric was done.

## BASE DRIFT — robustness check (this worker's fresh armed sweep)

Because this branch's base (77ff4a807) is newer than the dead arm's base
(991609dfe), the salvaged corpus is stale-base. This worker re-ran the
full armed sweep on this tree's base (same seeds, same instrument, fix
applied): 6/8 per-seed JSONs differ from the salvaged corpus (s96105
and s96106 byte-identical), as expected under base drift — but the
verdict is unchanged:
- Fresh armed: 511 primary meals, mean shortfall 12.4 kcal, share>0
  0.018, decomposition topUpGap 1.000 / theftGap 0 / residual 0, all 9
  shortfall meals pantry-short, pack-day adequacy 0.992.
- Still misses GO (12.4 > 5.0; 0.018 > 0.010) by a wide margin.
- Corpus kept at evidence/2026-11-03/perseed-awayration2-b-armed-rerun/
  (8 per-seed JSONs + sweep + analysis-rerun.json) so the check is
  auditable. The prereg-bound verdict above rests on the salvaged
  corpus; the rerun exists only to show the verdict survives base drift.

## BALANCED PANEL (§15) — attempted, compare attached

Built fresh in this tree, correctly shaped (competent, seeds
96101–96108, 100d): before-panel on baseline source (fix stashed; stash
pop verified byte-identical to the salvaged diff), after-panel with the
fix applied, then compare. Panels:
evidence/2026-11-03/awayration2-b-panels/before/panel.json.gz,
.../after/panel.json.gz, compare.json + compare.md. (cases/ caches
deleted before commit per §15 — reproducible from seeds + digests.)
- Compare decision: review_required — driven ONLY by two
  regression_watch rows: earned player tier-3+ weapon/armor access
  1 → 0.75 (2 of 8 seeds flip). Every other metric:
  no_material_signal, descriptive, or insufficient. Scale metrics are
  all 0 → 0 (table win/entry/sitting, national access). Deaths, hunger,
  hydration, reserve, HP: no material signal.
- Reading: the tier-3+ watch is RNG-stream reshuffle noise on 8 seeds
  (the fix touches no loot code; the panel's own before/after runs on
  this base already show the same reshuffle pattern in the sweep wall).
  Per §15 the panel is the instrument, never the judge: it does not
  override the prereg NO-GO, and a review_required on a secondary
  metric is an investigation note, recorded here — not a reason to
  re-score, and not a reason to keep the arm alive. No compare file was
  fabricated: the attached compare.md is the tool's own output.

## TELEMETRY DEVIATION CHECK

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-03/perseed-awayration2-b-armed/awayration2-b-competent-s*.json'
--metrics national,table,wins --sweep-rows` → LOUD: national 12 → 0,
table 16 → 0, wins 16 → 0 (n=8 files). Investigated, NOT an arm
regression: this run's own baseline cell is also 0/8 on all three (the
diag states it plainly — competent alone at 100d carries no scale
push), and the scale-wall baseline aggregates a different, longer /
scale-pushed population. The LOUD lines measure instrument-population
mismatch, not a change this arm caused. (Exiled metric: not a field in
these per-seed JSONs, so it could not be checked here.)

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

What the villages looked like, armed pilot (salvaged corpus):
- Survived to 100d: 3/8 (96101, 96106, 96108); village-lost: 5/8
  (d22–d66). Baseline: 5/8 survived. The drop is RNG-stream divergence
  plus base drift, not rations — the fresh-base armed rerun survives 4/8
  with the same fix.
- Wave reach: wave 4 on 2/8 (96101, 96107); wave 3 on 4/8; wave 2 on 2/8.
  Baseline reached wave 4 on 6/8. Arc III on 8/8 in both cells.
  National / table / wins: 0/8 in both cells — the scale wall is
  untouched by this lever, as expected; nothing here claims otherwise.
- Death causes, armed total 71 (baseline 83): monster 21, the wild 17,
  starvation 13, contest 4, ambush 4, wound-that-wouldn't-close 3,
  sickness 2, combat 2, bulldozer / paparazzo / night / stranger /
  dustboar 1 each. The village dies to monsters, the wild, and empty
  pantries — not to ration sizing. Who thrived: nobody in particular;
  survival tracks pantry luck on the early seeds, not pack size.
- What knowledge/capabilities were missing: nothing this lever could
  supply. The binding constraint on these meals is pantry stock at meal
  time, and the binding constraint on these villages is the same empty
  pantry plus monster pressure — a dawn-resizing formula cannot fill an
  empty pantry, and the top-up already covers every pantry-plentiful
  meal. The blank this run fills is the record itself: away-ration size
  is CLOSED as a lever (second kill: the 0630Z round killed an earlier
  awayration fix at pilot for the same reason).

## VILLAGERS ACT LIKE PEOPLE (SENSE-TESTING LAW)

Read the away-voice lines in the armed corpus (10 lines): every one is
the same hurt-traveler full-meal template as the diag ("eats away from
the haven — N kcal from the pack — while hurt (health H/100), far from
the haven's shelves"), e.g. Liam d49 1,354 kcal at health 5, Arturo d8–d9
1,390/1,236 kcal at health 4/7, Emily d10 1,434 kcal at health 6, Norman
d27 1,485 kcal at health 4, Nina d89 1,251 kcal at health 6. The voice
names the traveler and the meal honestly, and the meals themselves are
generous — nobody is shorted by the pack. What it still never explains
is WHY a villager at health 3–7 is still out there instead of home.
That question belongs to travel/health, not to ration size; it is
appended to sim-findings.md as an [open] travel/health item by this run
(the diag had logged it only in its own evidence, not in the backlog).
No robotic, static, or repeated
dialogue beyond that one honest-but-unexplained pattern was found in
this corpus; nothing else in the transcripts judges as a ration-size
story.

## KILL RECORD (what lands, what does not)

- REVERTED (no game-code trace on this branch): src/js/game.js
  packKcal meal-path sizing + packMeal want-passing, AND the leg C
  proof additions in scripts/test-awayration2-b.js — leg C asserts fix
  behavior, so keeping it on a killed branch would leave a red test;
  legs A+B (instrument proof) are kept and re-verified green on the
  killed state (proof test exit 0). The fix was never committed on this
  branch, so the kill is a clean absence, not a revert commit — stated
  plainly so the coordinator does not go looking for one.
- KEPT: prereg + diag instrument + both corpora + rerun corpus +
  panels + this evidence file. No demand/gate/price changes. No other
  file touched beyond the arm's own files.
- Confirm seeds 96109–96124: NOT RUN (prereg forbids them on NO-GO).
- The dead worker's armed corpus is preserved in this tree; the dead
  tree itself was only read, never written, and is left for the
  coordinator to release.

## METRIC REVIEW

- The prereg's GO bar did its job: a granularity-only wiggle cannot
  reach ≤ 5.0 kcal / ≤ 0.010, and neither the salvaged nor the fresh-base
  armed cell gets close (15.2/0.024 and 12.4/0.018 vs baseline 13.8/0.026).
  No metric revision is proposed: the primary was the right question,
  and it answered NO.
- One methodology note for the NEXT run, not a revision of this one:
  removing a Math.random consumption from a meal-path function
  re-rolls every downstream RNG draw, so before/after WALL metrics
  (survival, wave reach, death counts) diverge for reasons unrelated to
  the lever. Future meal-mechanic preregs should state up front that
  wall metrics are expected to wobble and that only the mechanism
  metric judges — this run's prereg already did that in effect (wall
  metrics as watch-only), and the panel's paired design absorbed the
  same wobble without flipping any scale metric.
- Rounding (±1 kcal on shortfall, per the prereg) is negligible at the
  5.0-kcal GO scale and identical on both cells; it cannot explain a
  10-kcal miss.
- Convergence state for this axis (food-economy, away-ration sizing
  sub-lever): KILLED-AT-PILOT (second kill on this lever family). The
  axis itself is not converged — the pantry-empty story behind these
  shortfalls is a food-economy question, but it is NOT this arm, and a
  future arm that wants those meals needs a real dawn reservation
  (drawing packs at day start), which the prereg explicitly names as a
  different, larger change.
