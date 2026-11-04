# sim-hurthome-fix-c — VERDICT: GO (guardrail question answered: no systematic survival cost on this fresh band)

Run: oversight-flesh-out-loop, run fleshout-20261104T1220Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-c. Axis: food-economy.
Arm: guardrail-focused re-judgment of the hurt-aware turn-home rule for
TRIPS — the NAMED NEXT ARM from Loop A sim-hurthome-fix-b
(evidence/2026-11-04/sim-hurthome-fix-b.md, NO-GO: primary met, BOTH
guardrails breached). Binding prereg:
evidence/2026-11-04/sim-hurthome-fix-c-prereg.md (committed BEFORE any
judged sim; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon doc
covers away-return timing or hurt-traveler behavior — the mechanism
is code-read, not invented canon.
Fix commit (TESTED, JUDGED, LANDS on this branch): d16dec828
(cherry-pick of 5cf217912; game.js hurt check + hurt return line +
proof test, [needs-eyes]). The HURT-RETURN hunk diffed identical to
fix-b's. No revert: the verdict is GO.

## THE DECISION UNDER TEST (chosen in the prereg, before any judged sim)

ONE question, and only one: is early return a survival cost, or
cascade noise? Fix-b proved the mechanism (median latency 0 vs 2
parts) and breached both guardrails on band 97601–97616, with two-way
cascade flips in the matched table. This arm re-judges ONLY the
guardrail question on a FRESH band, with a pre-registered
decomposition leg (D1 flip directions, D2 death decomposition) that
decides what a breach would mean. The latency primary is SETTLED and
is reported descriptively only, never re-judged.

## BAND CHANGE (stated plainly, per the brief's freshness rule)

The brief's proposed 97701–97716 is NOT fresh: an exact seed file
exists (evidence/2026-11-02/perseed-creekwood-a/cw-base-s97701.json).
Bands 98101–98116 through 98601–98616 all have exact-seed files under
evidence/. Adopted band 98701–98716: ZERO exact-seed files under the
whole evidence/ tree (regex s987(0[1-9]|1[0-6]) + non-digit).
Pilot 98701–98708, confirm 98709–98716.

## INSTRUMENT (fix-b event instrument + the coverage fix)

- scripts/hurthome-b-lib.js + scripts/sweep-hurthome-fix-c.js +
  scripts/analyze-hurthome-fix-c.js. The fix-b instrument is reused
  unchanged in its case logic; the fix-c changes are the seed band,
  the corpus dir, the retro-open, and the D1/D2 legs.
- COVERAGE FIX (fix-b's metric review ordered it): when a hurt-return
  line fires for a villager with NO open case, the sweep opens a
  retrospective case at that tick (lib.retroCase, proof-tested
  6/6 by scripts/test-hurthome-c.js BEFORE the prereg). Result on
  this corpus: armed hurt-return lines 49 vs returned-hurt trip
  cases 48 — gap 1 line (2%), down from fix-b's 2/24 (8%). The one
  gap line is understood (see "The one uncovered line" below), and
  the retro mechanism demonstrably works in the judged corpus
  (s98716 Chen: line d42 p0 hp 4 → retro case closed returned-hurt,
  latency 0, preHp 4 — an exact match). The gap does not move any
  judged quantity: adding the missing case as returned-hurt would
  leave the armed latency median at 1.
- Cell/code guard: BASELINE ran first on pre-fix game.js
  (git show d16dec828^:game.js; git diff showed exactly the fix hunk
  reversed, 1 insertion / 28 deletions); ARMED ran after restoring
  the fix commit's game.js (tree clean at the fix commit, verified
  by git status both times). Cells differ by EXACTLY the fix commit.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE in the prereg before
  the pilot (same reason as fix-b). Comparison rests on the
  pre-registered per-seed matched table + analyzer aggregates.

## CELLS (identical except the one fix commit)

- Policy: competent, unchanged. Horizon: 100d death-aware cap.
  Env: PLENTYDEPRI=1, DEPOSITGATE=1. Seeds: PILOT 98701–98708,
  CONFIRM 98709–98716.
- Corpus: evidence/2026-11-04/perseed-hurthome-fix-c/
  (16 per-seed JSONs per cell + sweep-baseline.json +
  sweep-armed.json). Instrument errors: 0 in both cells.
  Every case classified: 0 unclassified in both cells.
- PILOT GATE (prereg): trip event cases >= 8 in EACH cell.
  Baseline pilot: 13 trip cases. Armed pilot: 23 trip cases.
  GATE PASSED in both cells — the confirm band ran as budgeted.

## VERDICT: GO

Judged census (pooled 16 seeds per cell): baseline trip cases 35
(>= 16 ✓), armed trip cases 53 (>= 16 ✓); returned-hurt trip cases
baseline 16 (>= 8 ✓), armed 48 (>= 8 ✓). The census is judged.
- PRIMARY (descriptive, NOT re-judged): pooled median return latency,
  trips, returned-hurt: armed 1 part vs baseline 1 part. The
  latency edge fix-b measured (0 vs 2) did not reproduce as a median
  on this band — the armed distribution still piles at 0–1 (mean
  0.52 vs baseline mean 1.50), and the mechanism's visible effect
  here is the died-away collapse (below), not the median. The
  primary is settled and is not re-litigated; nothing in the GO
  rule depends on it.
- SECONDARY (non-contradiction, descriptive): armed trip
  died-while-away share 0.019 (1/53) vs baseline 0.400 (14/35).
  Hurt travelers almost never die away anymore — they come home.
  Hurt-return lines: armed 49 vs baseline 0. Source split (trips):
  baseline 32 hurtVillager + 3 scan; armed 52 hurtVillager +
  1 retro-line — the scan net stays cheap insurance.
- GUARDRAILS (hard, prereg — BOTH HOLD, reversing fix-b's breach):
  median daysAlive armed 92 vs baseline 74 (delta +18, tolerance
  −10) — HOLDS.
  survived-seed count armed 8 vs baseline 4 (delta +4, tolerance
  −2) — HOLDS.
  Total deaths: armed 220 vs baseline 211 (+9) — up slightly while
  survived seeds doubled, because villages that live to 100d keep
  accumulating deaths over the longer exposure; the guardrails
  (median daysAlive, survived count) both favor armed, and the
  death count is confounded by exposure time (see D2).
- DECOMPOSITION LEG (pre-registered; reported, not needed to rescue
  a breach since none occurred):
  (D1) flips: outlives 8, underlives 3, ties 5 — NOT predominantly
  one-way (underlives 3 < 2x outlives 8). The two-way cascade
  pattern fix-b saw is present here too, but it nets toward armed.
  (D2) deaths: armed returned-villager deaths 33/220 (share 0.150,
  same-day subset 3) vs baseline hurt-episode-villager deaths
  30/211 (share 0.142, same-day subset 5) — excess +3 deaths on a
  base of ~30, with shares essentially equal (0.150 vs 0.142).
  No returned-villager death excess of any meaningful size, and no
  one-way flip pattern: the conjunction a systematic-cost verdict
  would have required is absent on every leg.
- WALK-OUT EXCLUSION: armed walk-out returned-hurt cases 0;
  NO armed hurt-return line names a walk-out villager (analyzer
  checked every line against every walk-out case name per seed).
  EXCLUSION HOLDS.
- NARRATION AUDIT: 49 armed hurt-return lines, >= 1 required;
  two quoted and judged TRUE below (Violet, Norman). NARRATION
  PASSES.
- GO by the pre-registered binding rule: census met AND guardrails
  hold AND exclusion holds AND narration passed AND instrument
  clean. The fix-b breach reads, on this fresh band, as cascade
  noise: fix-b's armed cell ran worse, this fresh band's armed cell
  runs better, flips run both ways both times, and returned
  villagers do not die at a higher share. That is exactly the
  pattern a 16-seed cascade produces, and it is not a systematic
  survival cost.

## THE NUMBERS (pooled 16 seeds per cell, judged)

TRIPS (purpose != 'leave'):
- Baseline: n=35. Outcomes: returned-hurt 16, died 14,
  healed-away 2, returned-healed 3, censored 0, returned-unknown 0.
  Returned-hurt latencies (parts):
  [0,0,1,1,2,1,3,4,6,1,0,3,0,0,1,1], median 1, mean 1.50.
  Died-while-away share 14/35 = 0.400.
- Armed: n=53. Outcomes: returned-hurt 48, died 1,
  healed-away 2, censored 2, returned-healed 0, returned-unknown 0.
  Returned-hurt latencies (parts):
  [0,1,1,0,1,0,0,1,0,0,1,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,0,1,1,1,0,0,0,0,1,0,1],
  median 1, mean 0.52. Died-while-away share 1/53 = 0.019.
- What the rule changes, mechanically: it converts the baseline's
  died-away cases (14 → 1) into returned-hurt cases (16 → 48).
  Hurt travelers come home instead of dying away — and on this
  band, the villages they come home to live longer.
WALK-OUTS (purpose 'leave'):
- Baseline: n=6 (3 died, 3 healed-away), 0 returned. Armed: n=7
  (4 died, 3 healed-away), 0 returned. Come-home 0 in both cells.
GUARDRAILS (hard, prereg):
- Median daysAlive: baseline 74, armed 92 (delta +18) — HOLDS.
- Survived seeds (daysAlive >= 100): baseline 4/16, armed 8/16
  (delta +4) — HOLDS.
WALL NUMBERS (this corpus — a 100d hurt-return corpus, not a scale
panel, and nothing here claims otherwise):
- National / table / wins: 0/16 in both cells. MaxWave 4 in both
  cells. The scale wall is untouched by this arm, as expected.

## PER-SEED MATCHED TABLE

seed | B days | B tripCases | B retHurt | A days | A tripCases | A retHurt | A hurtLines
98701 | 57 | 1 | 0 | 79 | 7 | 7 | 7
98702 | 93 | 4 | 3 | 100 | 2 | 2 | 2
98703 | 67 | 0 | 0 | 67 | 0 | 0 | 0
98704 | 45 | 1 | 1 | 77 | 4 | 4 | 4
98705 | 100 | 0 | 0 | 100 | 0 | 0 | 0
98706 | 43 | 2 | 1 | 39 | 1 | 1 | 1
98707 | 100 | 2 | 0 | 48 | 8 | 7 | 7
98708 | 72 | 3 | 2 | 84 | 1 | 1 | 1
98709 | 40 | 4 | 1 | 100 | 5 | 3 | 3
98710 | 75 | 5 | 2 | 100 | 6 | 6 | 6
98711 | 73 | 3 | 1 | 100 | 3 | 3 | 3
98712 | 100 | 2 | 2 | 100 | 6 | 4 | 5
98713 | 100 | 0 | 0 | 100 | 0 | 0 | 0
98714 | 98 | 4 | 0 | 100 | 5 | 5 | 5
98715 | 57 | 0 | 0 | 57 | 0 | 0 | 0
98716 | 82 | 4 | 3 | 78 | 5 | 5 | 5
Matched-seed MEDIANS are the unit of comparison — never individual
seeds. Note the two-way flips again (98709: died d40 → survived
100d; 98707: survived 100d → died d48, the largest single-seed
swing in either direction) — the same RNG re-routing fix-b
documented, now netting toward armed. One 16-seed band cannot
separate cascade from cost by itself; two bands pointing opposite
ways on the guardrails, with no returned-villager death excess on
either leg, jointly say noise, not cost.

## SENSE TEST — HURT RETURNS READ AS PEOPLE COMING HOME HURT

Two hurt returns quoted and judged against their own case records
(SENSE-TESTING LAW: meaning, not just counts), plus the one
uncovered line and the retro proof.
- "🧭 Violet returns from the wilds hurt (health 5/100) — the trip
  cut short." (s98701, d8 p3, water trip.) Case: event d8 p3,
  hp 5, cause monster, close d8 p3, pre-travel hp 5, latency 0.
  TRUE: name, hp, and tick all match the case exactly. Hurt and
  home in the same part — the rule firing at the next travel tick,
  not the clock running out.
- "🧭 Norman returns from the wilds hurt (health 4/100) — the trip
  cut short." (s98704, d24 p2, water trip.) Case: event d24 p2,
  hp 4, cause monster, close d24 p2, pre-travel hp 4, latency 0.
  TRUE: same exact match. A person fetching water, mauled to 4 HP,
  home at once.
- The one uncovered line (49 lines vs 48 returned-hurt cases) —
  understood, bounded, no verdict impact: Gabriela (s98712, d32
  p1, hp 3). Her d32 episode is a story, not a bug: at d32 p0 she
  killed a Grief Counselor alone out past the ridge ("8 rounds,
  117 taken") and walked home; the hurt-return line fires d32 p1
  at hp 3; she is patched the same part (3 → 28 HP) and walks out
  with Devon ("Nobody walks alone today"). Her case closed
  'healed-away' (event d32 p0 hp 3, close d32 p1) rather than
  returned-hurt — a classification edge where a return, a patch,
  and a re-departure all land in one part, so the heal-close and
  the return-close race. The line itself is TRUE (she was at 3 HP,
  the trip was cut short, the patch line corroborates the hp).
  Adding it as a returned-hurt case would leave the armed median
  at 1. The residual gap is a same-part race in the instrument,
  not a narration failure and not a mechanism failure.
- The retro proof (s98716 Chen, guard trip): line d42 p0 hp 4,
  retro case event d42 p0 hp 4, close d42 p0 preHp 4, latency 0.
  The coverage fix works on real judged sims: a line without a
  prior case becomes a case, closed correctly in the same tick.
Judgment: where the line fires, the behavior reads as a person
deciding (hurt → coming home), not a clock running out — and the
surrounding transcript (solo kills, patching, walking out with
company) keeps making sense around it. The line's limit is
unchanged from fix-b: it fires only when the player is at Haven at
the return tick, so some hurt returns still read as routine.

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 98701–98716 — an early/mid window, not a full-arc run.
- Survived to 100d: baseline 4/16, armed 8/16. Wave reach: wave 4
  in both cells (maxWave 4). National / table / wins: 0/16 in both
  cells — the scale wall is untouched by this arm, as expected.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck plus, in both cells, the RNG
  cascade after the first hurt return (two-way flips, see the
  matched table). The blank this run fills is the JUDGMENT fix-b
  could not make: the guardrail breach was cascade noise, not a
  systematic cost of early returns. Hurt travelers come home
  instead of dying away (died-away share 0.400 → 0.019), their
  villages live longer on this band (median 92d vs 74d, survived
  8 vs 4), and the villagers who come home do not die at a higher
  share afterwards (0.150 vs 0.142). The fix is safe to land on
  this evidence; a future 32-seed band could still tighten the
  estimate, but it is not required to overturn a GO — the burden
  for a NO-GO was a systematic cost, and no leg shows one.

## PROOF

- scripts/test-hurthome-fix-a.js: 10/10 green WITH the fix
  (cherry-picked fix commit, verified before the prereg and before
  any judged sim). It LANDS with the fix.
- scripts/test-hurthome-b.js: 20/20 green (pure case logic). It
  LANDS (it tests the instrument lib, which lands).
- scripts/test-hurthome-c.js: 6/6 green (retro-case logic: open at
  the return tick, latency-0 close, refusals for open cases /
  LEAVE / non-hurt hp). It LANDS with the instrument.
- Cell/code guard: the sweep refused the wrong code by design
  (never tripped — every leg ran against its intended code; the
  guard's presence is verified by code-read and by the baseline
  diff check, not by a trip).
- Instrument errors: 0 across all 32 judged cell-seeds
  (16 baseline + 16 armed). No unclassified cases.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not push,
  bump, or verify live): the fix commit d16dec828 (game.js hurt
  check + hurt line + proof test, [needs-eyes]); prereg 4ce056adc
  (already committed); this evidence; baseline + armed corpora
  (32 per-seed JSONs + both sweep summaries); event instrument
  (hurthome-b-lib retro addition + fix-c sweep + fix-c analyzer +
  lib proof test + retro proof test), reusable by the next arm.
- DOES NOT LAND: no gate/price/deed/readyDemand change; no
  policy-default change; no other lane's files; no expedHurt
  write-back (rejected in fix-a/fix-b, not added).
- NO REVERT: the verdict is GO, so the game.js change stands. (Had
  the verdict been NO-GO or INSUFFICIENT-DATA, the game.js change
  would have been reverted before reporting, per the prereg.)

## METRIC REVIEW

- The D1/D2 decomposition leg did its job: it turned fix-b's open
  question ("cost or noise?") into checkable claims, and every
  claim came back noise-side (flips 8–3 toward armed, death shares
  0.150 vs 0.142, guardrails +18d / +4 seeds). Keep D1/D2 for any
  future guardrail re-judgment; a guardrail breach without a
  decomposition leg is uninterpretable on 16 seeds.
- The retro-case coverage fix works (Chen, s98716, exact latency-0
  close) and cut the line/case gap from 8% to 2%. The residual
  1-line gap is a same-part return/patch/re-departure race in the
  case-closing order, not a missing population: the line is true
  and its villager's episode is classified (healed-away), just not
  as returned-hurt. A future instrument pass could order the
  return-close before the heal-close within a part scan; it is not
  needed for this verdict.
- The descriptive latency median (1 vs 1) vs fix-b (0 vs 2) is a
  reminder that a pooled median over 16–48 cases moves with the
  band: the mean (0.52 vs 1.50) and the died-away share (0.019 vs
  0.400) are the stabler mechanism signals here. Any future arm
  that re-opens the latency question should pre-register the mean
  and the died-away share alongside the median, not instead of it.
- The guardrails (±10 days / ±2 seeds) are still the right size
  for a 16-seed band: fix-b breached them by −15.5d / −3 seeds and
  this band clears them by +18d / +4 seeds. Two opposite breaches
  of that size on two fresh bands is the cascade-noise signature
  itself — the thresholds are neither too tight nor too loose.
- Convergence state for this axis (food-economy, hurt-traveler
  blank): BEHAVIOR MEASURED + FIX PROTOTYPED + MECHANISM PROVEN +
  GUARDRAIL QUESTION ANSWERED (no systematic survival cost) —
  the fix lands. The pantry-empty story remains a separate
  question.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-traveler corpus: no wider dialogue verdict is
claimed — the transcript capture was instrumented for
hurt-traveler lines, return lines, and lines naming case villagers
only, so no broader robotic/static/repeated dialogue judgment is
made here.
