# sim-finishgate-a — how far short does the one-strike finish gate fall? (DIAG-GO)

Run: Loop A worker, axis scale-onramp (converging, NOT converged),
run fleshout-20261031T2058Z. Arm type: DIAG, analyzer-only.
NO new sims. NO game harness loads. ZERO src/js changes. No
[needs-eyes] (DIAG only). Pre-registration:
evidence/2026-10-31/sim-finishgate-a-prereg.md (committed BEFORE any
judged analysis, commit 82914aed3). This evidence judges ONLY the
landed fieldfinish2 pilot corpora (master 2d25029bb); it lands NO
gate redesign. Redesign options below are CANDIDATES for a future
BUILD arm, never landed changes.

## Question

The fieldfinish2 pilot proved the committed-finish one-strike gate
never fires on wave-3 beasts (0/71 wave-3 fights, lever leg). This
arm measures exactly how far short it falls, fight by fight, from
the corpus alone: for each wave-3 field fight ending in monster
flight (mFlee), gap = mHpLeft − maxStrike, where maxStrike is the
fight's own biggest proven single lead strike, parsed from the
fight log (`R<n>: <Name> strikes for <vd>`).

## Corpus and method (binding, from the prereg)

- BASELINE leg = PRIMARY (no rule, unperturbed):
  evidence/2026-10-31/perseed-fieldfinish2-baseline-pilot/leadfeast/
  (8 seeds: 87104, 87109, 87115, 87119, 87123, 87124, 87127, 87140).
- Lever leg = SECONDARY (rule present, cross-check only, never
  pooled — its trajectories diverged after wave-1/2 commits).
- Analyzer: scripts/finishgate-analyze-20261031.js. Proof test:
  scripts/test-finishgate-20261031.js (51 passed, 0 failed —
  synthetic parse/gap/classifier cases + corpus reconciliation).
- Classifier (every row gets exactly one class): unlogged;
  contact-break (met already below the 15% break line);
  no-lead-strike (fought, no strike line in the log);
  gap-table (fought break-line flight: mHpLeft < 15% of mMaxHp
  AND at least one strike line); non-break-flight (fled at or
  above the break line); missing-fields; multi-striker.
  Operationalization noted in the analyzer: contact-break takes
  precedence over multi-striker (a beast met below the line is a
  contact flight whatever its log holds); missing-fields is
  evaluated before any ratio class, since ratios are undefined
  without HP fields. Neither precedence mattered in practice:
  multi-striker is empty on both legs (every strike-bearing
  wave-3 mFlee log has exactly one striker name, consistent with
  solo wild fights), and unlogged is empty on both legs.

## Classification counts (reconciled, both legs)

| Class | Baseline (of 40 w3 mFlee) | Lever (of 18 w3 mFlee) |
| --- | ---: | ---: |
| contact-break (met below the line) | 27 | 0 |
| no-lead-strike (trick / talk, no blow) | 6 | 16 |
| gap-table (fought break-line flight) | 5 | 2 |
| non-break-flight (fled above the line) | 1 | 0 |
| missing-fields | 1 | 0 |
| unlogged | 0 | 0 |
| multi-striker | 0 | 0 |
| **Total (= corpus w3 mFlee)** | **40** | **18** |

Reconciliation (analyzer asserts, proof test re-proves): class
sums = w3 mFlee totals (40 / 18); wave totals sum to
fieldFights totals (1271 baseline: w1 964, w2 198, w3 104,
w4 5; 643 lever: w1 379, w2 184, w3 71, w4 9); w3 outcome
sums = w3 totals (baseline: vFlee 55, mFlee 40, evade 9;
lever: mFlee 18, vFlee 46, vDie 3, evade 4). Zero
unclassified rows on either leg. Coverage of baseline w3
mFlee rows = 40/40 = 100%.

What the classes are, in plain words:

- Contact-break (baseline 27/40, all rounds-0, mHpStart 1–36):
  volley drive-offs — the beast was met already wounded below
  its break line and broke before it ever closed. This is the
  sibling sim-contactbreak-a arm's class, not a gate gap.
  The lever leg has ZERO such rows: its trajectories diverged,
  and its wave-3 meetings never produced a volley drive-off
  in this pilot. Do not compare 27 vs 0 as a rule effect —
  the legs are different fights after divergence.
- No-lead-strike (baseline 6: 5 trick fights ending "holds the
  line — working the trick, not the damage race" + 1 talk-down,
  "walks in open-handed, talking"; lever 16: 15 trick + 1
  talk-down): fights where no blow was ever struck, so there
  is no proven strike for any gate to measure. Not gate gaps.
- Non-break-flight (baseline 1): seed 87123, day 74, chorus_line
  — 15 rounds, monster still at 124/300 HP, "Neither gives
  after 15 rounds — the worse-off side disengages." A round-cap
  disengagement, not a break flight.
- Missing-fields (baseline 1): seed 87124, day 33, chorus_line —
  the log DOES show a genuine break flight (final strike 36,
  "Chorus Line breaks — wounded past its line", 22 HP left),
  but the recorder left mHpStart and mMaxHp null, so no break
  line can be computed and no gap can be stated without
  inventing a max HP. Classified and counted, not imputed.
  Consequence: the gap table holds 5 of the 6 genuine baseline
  break flights, not 5 of 5 — a recorder gap, flagged here.

## The gap table (all 7 fought break-line flights in the corpus)

Baseline leg (PRIMARY):

| Fight (seed day monster) | mHpStart / mMaxHp | mHpLeft (line) | maxStrike (2nd) | Gap | Two-strike reach |
| --- | ---: | ---: | ---: | ---: | ---: |
| 87115 d83 callback | 60 / 260 | 36 (39) | 12 (12) | +24 | No (36 > 24) |
| 87123 d75 chorus_line | 124 / 300 | 33 (45) | 21 (18) | +12 | Yes (33 ≤ 39) |
| 87124 d43 spool | 280 / 280 | 28 (42) | 44 (43) | −16 | Yes |
| 87124 d71 callback | 80 / 260 | 25 (39) | 55 (—) | −30 | Yes |
| 87140 d183 redactor | 212 / 260 | 16 (39) | 110 (46) | −94 | Yes |

Lever leg (secondary):

| Fight (seed day monster) | mHpStart / mMaxHp | mHpLeft (line) | maxStrike (2nd) | Gap | Two-strike reach |
| --- | ---: | ---: | ---: | ---: | ---: |
| 87109 d89 spool | 44 / 280 | 37 (42) | 7 (—) | +30 | No (37 > 7) |
| 87115 d75 chorus_line | 188 / 300 | 28 (45) | 22 (22) | +6 | Yes (28 ≤ 44) |

## Distributions (gap-table rows only; small-n — read as case counts, not curves)

Baseline (n=5): mHpStart median 124 (quartiles 80/212, range
60–280); mHpLeft median 28 (25/33, range 16–36); gap median
−16 (quartiles −30/12, range −94 to +24); maxStrike median
44 (21/55, range 12–110). Quartiles at n=5 are interpolation
artifacts and are reported only because the prereg requires
them — the table above is the result.

Lever (n=2): the two rows ARE the distribution (mHpLeft 37
and 28; gaps +30 and +6; maxStrikes 7 and 22). No quartile is
meaningful at n=2, so none is claimed.

Shares (gap-table rows):

- gap ≤ 0: baseline 3/5 (60%), lever 0/2 (0%). The prereg
  expected 0; the baseline nonzero is itemized and explained
  below — it does NOT fail DIAG-GO (GO is coverage +
  reconciliation, and baseline has no rule, so its
  committedFinish is false by construction).
- Two-strike reach: baseline 4/5 (80%), lever 1/2 (50%).
  Among the 4 rows with a positive gap, two-strike reach is
  2/4: the +12 and +6 rows are covered by two proven blows,
  the +24 and +30 rows are not.

## Gate audit: the gap is NOT the whole story (the key finding)

For each gap-table row, which of the six fieldfinish2 gates
blocked the override? Gate 3 (villager ≥ 60% HP) is judged at
the break check; in all 7 rows the break is the fight's last
event, so final vHpLeft ÷ minHpFrac gives the break-check
fraction exactly (all 7 rows imply max HP 100). Gate 5 (struck
this round) holds on all 7 (each final round contains a
strike); gate 6 (not sealed) holds on all 7 (noFlee false);
gate 1 (lead alive) holds on all 7.

| Fight | Gap | Villager HP at break | Intent | Blocking gate(s) |
| --- | ---: | ---: | --- | --- |
| Baseline callback d83 | +24 | 53% | engage | 2 AND 3 |
| Baseline chorus d75 | +12 | 85% | engage | **2 only — the pure near-miss** |
| Baseline spool d43 | −16 | 17% | engage | **3 only (gate 2 held)** |
| Baseline callback d71 | −30 | 88% | learn | **4 only (gate 2 held)** |
| Baseline redactor d183 | −94 | 29% | engage | **3 only (gate 2 held)** |
| Lever spool d89 | +30 | 69% | engage | **2 only — but a weak fighter (one 7-damage blow)** |
| Lever chorus d75 | +6 | 40% | engage | 2 AND 3 |

So, of 7 fought break-line flights:

- 2 are blocked by gate 2 alone (the gate this arm was asked
  to measure): short by 12 and by 30 HP.
- 3 are blocked by ANOTHER gate although gate 2 HELD (gap ≤ 0):
  two fighters at 17% and 29% HP (gate 3), one learn-intent
  fighter who never flipped to engage (gate 4, despite a
  55-damage opening blow).
- 2 fail both gate 2 and gate 3.

In plain words: the one-strike gate does not fall short by a
single clean margin. On the baseline leg the median gap is
NEGATIVE (−16) — the biggest proven blow already covered the
remainder in most fought break flights. What kept those fights
from converting is mostly NOT strike size: it is that the
fighter was nearly dead (17%, 29%), or had not committed
(learn intent), or both. And the fought break flight itself
is rare: only 5 of 40 baseline wave-3 flights (12.5%) and 5
of 104 baseline wave-3 fights (4.8%) ever reach the table.
The dominant wave-3 flight is the contact-break volley
drive-off (27/40 baseline), which no in-round gate can ever
touch by construction.

Two cautions on the gap numbers themselves:

- The redactor −94 rests on a single stacked blow: Aim 2.5× ×
  Rage 2× for 110 damage, followed by 40 and 46. Counting the
  spike as "proven one-blow range" flatters the gate — but
  even at the follow-up size (46), the gap would be −30, so
  the row's conclusion (gate 2 held, gate 3 blocked) stands.
- The lever spool +30 is a weak-fighter row, not a strong
  near-miss: one damaging blow of 7 in 4 rounds against a
  beast met at 44 HP (barely above its 42 line). No threshold
  tweak aimed at the +12/+6 near-misses would touch it
  without swallowing the whole gate.

## Sense-testing (SENSE-TESTING LAW)

Read: baseline chorus_line 87123 d75 (pure near-miss) and
baseline spool 87124 d43 (gate-2-held, HP-blocked).

1. Chorus, Kate vs Chorus Line (33 HP left, biggest blow 21,
   Kate at 85 HP): this reads as a genuine near-miss. Kate
   trades steadily for six rounds — 18, 21, 18, 16, 18 damage
   — takes almost nothing back (the chorus mostly counts
   beats and misses), and the beast turns and runs at 33 HP
   while Kate is healthy and still landing. One more solid
   exchange, or two ordinary blows (21 + 18 = 39 ≥ 33),
   would have ended it. The flight reads as the beast
   quitting while still dangerous, not as a rout — the
   finish that never happened is believable as a decision
   Kate could have taken.
2. Spool, Victor vs Spool (28 HP left, biggest blow 44,
   Victor at 17 HP): this reads as the opposite — a hold
   that would have been suicide, correctly refused. Victor
   lands 39–44 damage blows round after round while the
   spool replays his own strikes back at him, grinding him
   from full health to 17 HP (a single 56-damage replay in
   round 5, field medicine, then 14 + 14). The beast breaks
   at 28 HP with Victor's proven 44 on the table — but
   Victor at 17 HP stepping in for one more blow against a
   beast that just hit him for 56 is not courage, it is
   how villagers die. The 60% HP gate blocking here reads
   RIGHT, and any redesign that relaxes it to convert this
   row should have to answer the HOLD-pilot collapse first.

## Verdict: DIAG-GO

1. Coverage: 40/40 = 100% of baseline-leg wave-3 mFlee rows
   are in the gap table or explicitly classified with a
   reason (≥ 90% required). Lever leg: 18/18 = 100%.
2. Reconciliation: exact on both legs (see counts above;
   proof test re-proves every sum). Zero unclassified rows.
The prereg's expected gap≤0 = 0 did NOT hold on baseline
(3/5) — itemized above, explained by other gates blocking
(gates 3 and 4) on a leg where the rule does not exist, and
therefore not a DIAG failure. The measurement is complete.

## What gate redesign the numbers imply (CANDIDATE, not landed)

For a future BUILD arm to judge, in order of what the numbers
support:

1. **Two-blow window (strongest candidate):** of the 4
   positive-gap rows, 2 are covered by two proven blows
   (baseline chorus +12 → 21+18; lever chorus +6 → 22+22).
   A "committed finish within two blows" rule would convert
   the baseline pure near-miss outright. It would NOT
   convert the lever chorus (+6) without also moving gate 3
   (fighter at 40% HP), and it would NOT touch the +24 or
   +30 rows. Expected yield on this corpus: 1 conversion,
   not a wave-3 kill pipeline.
2. **Threshold change (weak):** covering the +12 near-miss
   needs the gate to accept a remainder up to ~1.6× the
   biggest proven strike (33/21); covering +30 needs ~5.3×
   (37/7). No single multiplier covers both near-misses
   without making the gate nearly vacuous for weak
   fighters — the +30 row is a different problem (a fighter
   landing one 7-damage blow), not a threshold problem.
3. **HP-gate relaxation (do NOT pursue on this evidence):**
   the two HP-blocked gap≤0 rows are fighters at 17% and
   29% HP. Relaxing gate 3 to convert them is exactly the
   HOLD pattern that collapsed villages in the 2026-10-25
   pilots. The spool sense-read above is the argument
   against it, in plain words.
4. **Learn-intent handling (open question, not a number):**
   the learn fighter who opened with a 55-damage blow and
   never flipped to engage is a design question — should a
   killing-range blow itself count as commitment? — not
   something this corpus can answer (n=1, baseline leg).
   A future arm may take it up; it is not recommended here
   on one row.
5. **The bigger finding is outside the gate:** 27/40
   baseline wave-3 flights are contact-break drive-offs and
   6/40 are no-blow trick/talk fights. Even a perfect
   in-round gate addresses at most the 5 fought break
   flights per 40 flights. If wave-3 field kills are the
   goal, the contact-break class (sibling arm) and the
   no-blow classes are where the volume is — the in-round
   gate, however redesigned, is a narrow lever on a small
   denominator.

## Metric review (mandatory, §14)

- The classifier needed NO class beyond the prereg's seven;
  unlogged and multi-striker are both empty, as probed.
- gap≤0 DID occur (baseline 3/5) — the prereg's "must be 0"
  expectation was wrong for the baseline leg, for the
  reason stated: gate 2 is necessary, never sufficient, and
  baseline has no rule. The lever leg's gap≤0 = 0/2 is
  consistent with its 0 wave-3 commits, and its two gap
  rows are both positive-gap, so no lever row tests the
  other-gates-block story directly. Future DIAG preregs
  should state gap≤0 as "itemize and explain", not "must
  be 0", on any no-rule leg.
- Two-strike reach is the more informative redesign input
  than the one-strike gap: it separates the convertible
  near-misses (+12, +6) from the weak-fighter rows (+24,
  +30) that no window short of the whole fight would fix.
- Small-n warning: baseline gap n=5, lever gap n=2. Every
  share in this file is a case count over a handful of
  fights. The distributions are reported as required but
  the gap TABLE is the evidence; do not quote a median
  gap without its n.
- Recorder gap (loud, for the next arm): one genuine
  baseline break flight (87124 d33 chorus_line, 22 HP left
  after a 36 strike, "breaks — wounded past its line") is
  missing mHpStart/mMaxHp in the corpus and therefore
  cannot enter any gap table. Future recorders should
  assert non-null HP fields on every logged fight row, or
  the gap table will silently undercount break flights.

## Blanks filled or documented

- FILLED (answered, DIAG-GO): the exact wave-3 gate gap,
  fight by fight — the table above, with the gate audit
  showing gate 2 alone blocks only 2 of 7 fought break
  flights.
- DOCUMENTED (not built): the redesign candidates above,
  for a future BUILD arm; the contact-break volume (sibling
  arm's class); the recorder missing-fields gap.
- NOT changed: no game code, no sims, no harness loads, no
  merge by this worker. Branch state below is "committed
  on branch, pending coordinator merge".

## Wall numbers (this corpus, for context only — not re-judged)

Per sim-fieldfinish2-a: baseline national 7/8, table 7/8,
wins 7/8, wave-4 4/8, wave-5 0/8; lever national 2/8, table
7/8, wins 7/8, wave-4 5/8, wave-5 0/8. This DIAG arm adds no
new wall numbers.
