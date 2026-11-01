# sim-dipslide3-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1725Z,
arm sim-dipslide3-b, axis food-economy. Worktree sim-dipslide3-b,
branch sim-dipslide3-b.

Next sensor iteration after the 1543Z pilot NO-GO
(evidence/2026-11-01/sim-dipslide2-b.md): the recovery-to-candidate-
level rule (c) went silent on fresh seeds (0/8 confirmed, (p2)
sensitivity FAIL), and its only old-rule fire (51308, candidate day
10 → confirmed day 15) died on a single +215 kcal (+0.99%) day-11
uptick — the third hairline bounce in program history (earlier +389
on 51207, +186 on 51211, all under 2.3%, all one-evening upticks on
trajectories that keep falling). A recovery test with no tolerance
measures noise, not recovery. This arm designs the tolerance rule
as a NEW prereg — never a re-score of the 51301–51308 band — and
judges it on FRESH seeds only.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all
named *-dipslide3-b.*: this prereg, the analyzer
(scripts/analyze-dipslide3-b.js, which imports the committed
dipslide analyzer's candidate helpers verbatim and adds only the
tolerance confirmation rule plus the pilot/confirm bars), the proof
test (scripts/test-dipslide3-b.js), evidence, corpus
(evidence/2026-11-01/sim-dipslide3-b-corpus/). The depositgate
driver (scripts/depositgate-b-driver.js), the dipslide analyzer
candidate helpers (scripts/analyze-dipslide-b.js), and
scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE as a
system — the mechanism below is read from the depositgate and
dipslide arms' preregs and evidence (fresh days > 4, hungryStreak
>= 3 stands the gate down), not invented canon. docs/PRESERVATION.md
(food ladder) is adjacent, not the gate: it explains why a falling
total pantry matters even while fresh days stay high (fresh is a
slice of the store, not the store).

## Design choice: exactly ONE tolerance rule (single, pre-registered)

The rule below is ONE rule, not a menu judged after the fact. It
combines the two candidate shapes named in dipslide2's metric
review — a noise margin AND a 2-evening sustained test — into a
single recovery definition. A candidate is rejected for recovery
iff EITHER branch fires inside its 5-evening window; otherwise, if
the endpoint condition also holds, it confirms. No other tolerance
variant is judged in this arm, and no branch is dropped or added
after seeing the pilot.

WHY this combination, decided before any judged seed:

- A margin-only rule (recovery = any evening >= 105% of candidate
  level) lets every sub-5% bounce through, including two-evening
  sags that sit at the level and never really fall — a village
  hovering at its candidate level for two evenings running has
  stopped falling, and calling that a slide would be the old
  endpoint rule's mistake in a thinner disguise.
- A 2-evening-only rule (recovery = two evenings running at or
  above the level) lets a single-evening +20% spike through — a
  genuine one-evening windfall that then vanishes is not a slide
  either, and a rule that confirms through it would cry wolf on a
  village that just had a good day.
- The combination is the strictest honest reading of "recovery":
  a real climb back (over the margin, even once) OR a real stop to
  the fall (at the level twice running) both count as recovery.
  What it forgives, and only what it forgives, is the documented
  noise shape: a single evening's sub-5% wiggle that the next
  evening undoes. All three historical hairline bounces (+389,
  +186, +215) are single-evening sub-5% upticks followed by
  further falls, so all three would be forgiven by this rule —
  disclosed here, not discovered after judging.

## The sensor rule (EXACT — tolerance confirmation rule, everything else unchanged)

Evening pantry series P(d) = evening pantryKcal on lived day d
(whole pantry, all food states, kcal). loopDay is the census day
label, as in the depositgate corpus. No retrospective peeking:
every condition is evaluated from evenings at or before the
confirmation evening, and the sensor's actionable day is the
confirmation evening itself, never the candidate day retroactively.

- CANDIDATE on evening D iff ALL of (unchanged from dipslide2):
  (i) at least 5 prior evening rows; (ii) P(D) <= 0.80 * P(D-5)
  (total store fell >= 20% over 5 evenings); (iii) P(D-2) < P(D-3)
  AND P(D-1) < P(D-2) AND P(D) < P(D-1) (three consecutive evening
  falls ending at D); (iv) gateEngaged true that evening. A day
  with a null pantry reading breaks all fall chains and is never
  a candidate day.
- ELIGIBLE iff loopDay D >= 8 (early-window exclusion, unchanged).
- CONFIRMS (TOLERANCE RULE) iff ALL of: the loopDay-(D+5) evening
  row exists with a numeric pantry reading, lies inside the SAME
  final engaged run (gateEngaged true there), P(D+5) < P(D)
  (endpoint still below the candidate level), AND the pantry
  shows NO tolerance-recovery inside the window D+1..D+5, where
  tolerance-recovery means EITHER:
  (a) MARGIN BREACH: some evening d in D+1..D+5 has
      P(d) >= 1.05 * P(D) (climbed back above the candidate level
      by at least the 5% noise margin; exactly 105% counts as a
      breach, so the margin partition has no gap); OR
  (b) SUSTAINED AT-LEVEL: two consecutive evenings d, d+1, both
      inside D+1..D+5, both with numeric pantry readings, both
      with P >= P(D) (stayed at or above the candidate level for
      2 evenings running, at any magnitude including equality).
  Null or missing intermediate rows carry no reading: they cannot
  satisfy (a), and they BREAK consecutiveness for (b) (a
  null/missing evening cannot be part of a consecutive pair).
  A null or missing D+5 row blocks confirmation (as before).
- HAIRLINE-ONLY CONFIRMATION (exact definition, used only for the
  GO bar below): a confirmed candidate counts as hairline-only
  iff its confirmation window contains a single-day uplift <5%
  above the candidate level with no second evening above level.
  Formally: there exists an evening d in D+1..D+5 with
  P(D) < P(d) < 1.05 * P(D) (a strict uplift, under the margin),
  AND the total count of evenings in D+1..D+5 with P > P(D) is
  exactly 1 (no second evening strictly above level; an evening
  exactly AT the level does not itself count as an above-level
  evening for this count). (A confirmation whose
  window never reaches the candidate level is NOT hairline-only;
  a confirmation whose window has two or more above-level evenings
  is NOT hairline-only under this definition, even if both are
  sub-5% and non-consecutive — that gap is disclosed in the
  metric review, not patched mid-run.)
- SCAN: eligible candidates inside the final engaged run, ascending
  loopDay order; the FIRST that confirms yields (candidateDay = D,
  confirmedDay = D+5). A candidate that fails confirmation does NOT
  end the scan. If none confirms, confirmedDay is null. The
  actionable day is confirmedDay, never candidateDay.
- FINAL ENGAGED RUN = maximal consecutive gateEngaged=true evenings
  ending at the seed's last engaged evening. LEVEL STAND-DOWN day =
  first gateEngaged=false evening after that run (null if the seed
  ends engaged). EARLINESS = levelStandDown - confirmedDay.
- COUNTING (final engaged run only, unchanged): a fire counts
  toward the bars only if it is a CONFIRMED fire (a confirmedDay)
  in a seed's final engaged run. Fires outside the final run are
  reported descriptively as confirmedAnywhere, never toward the
  bars. Seeds with NO final engaged run count as no-run: neither
  a confirm NOR a survivor for the rate bars — excluded from both
  numerator and denominator, and named in the evidence.
- COLLAPSED SEEDS: a confirmed fire on a collapsed seed is NOT a
  false alarm (dipslide2 definition, kept for the reported
  false-fire count). Earliness is defined only when a level
  stand-down evening exists after the final run; a collapsed seed
  with a confirmedDay but no level stand-down has undefined
  earliness and cannot satisfy any earliness bar — reported, not
  counted as passing.
- CONFIRMATION EVENINGS beyond the lived window, on a null-pantry
  row, or outside the final run: the candidate does NOT confirm
  (unconfirmed, not missing-data-imputed).
- CENSUS VALIDITY (reported, never patched): rows == daysAlive and
  gateEngaged boolean on every row. A seed failing it is excluded
  from the bars and named, not silently fixed.
- DIAGNOSTICS (descriptive only, not bars): per seed, (i) eligible
  final-run candidates that confirm under the dipslide2 rule but
  are rejected by the tolerance rule (margin breach or sustained
  recovery — the tolerance rule being stricter in that direction);
  (ii) eligible final-run candidates that confirm under the
  tolerance rule but are rejected by the dipslide2 rule (the
  restored set — exactly the hairline-tolerated shapes); (iii)
  the hairline-only flag on the seed's confirming candidate.

## Question

Does the tolerance recovery rule — recovery = climbing back above
the candidate level by at least 5%, OR staying at or above it for
2 evenings running — restore sensor firing on seeds it has never
seen, without its confirmations resting on hairline-only shapes?

## Staged design (fresh sims, armed only)

Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Substrate gates, identical to the depositgate/trendsensor/dipslide
arms: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0;
WOODCARRY/WOODWARM/MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/
FEDEVENING not 1; DEPOSITGATE=1 (armed only — the level rule lives
in the armed arm; the control arm has no gateEngaged series to
judge, exactly as in the prior arms). Horizon + why: 30 days,
death-aware (dead villages stop simulating; no fixed 200d). 30d is
the depositgate baseline window: the slide to judge happened days
12–18 and the collapse day 25 in the pilot, so the window covers
both the sensor question and its outcome. A longer window is a
NEXT run's question, not this one's. Driver:
scripts/depositgate-b-driver.js, verbatim, one process per seed
(SEEDS=<single>), with a per-seed retry loop on EPERM-flap
failures (up to 6 tries, 1-valid-JSON-line verification per seed),
as the prior confirms did. Analyzer: scripts/analyze-dipslide3-b.js.

## Seed freshness verification (done BEFORE this prereg was written)

Prior judged bands on this lane: pilot 51101–51108; depositgate
confirm 51109–51120; dipslide confirm 51201–51212; shelling pilot
51401–51408 and confirm 51411–51422; dipslide2 pilot 51301–51308.
Freshness check for this arm (seed-field scan, not bare-numeral
grep — bare 513xx numerals in unrelated files are pantry/ledger
figures, per dipslide2's documented nuance): every *.jsonl under
evidence/2026-11-01/ was parsed and its "seed" field collected for
the 51300–51400 range. Result: the ONLY 513xx seed assignments in
the lane are 51301–51308 (dipslide2 pilot). No "seed":51311–51330
field exists in any corpus, and no 513xx-named corpus file exists
beyond the dipslide2 pilot. Dated-.md mentions of 51311–51322 are
reservations only (dipslide2 prereg + evidence + the 1543Z
coordinator evidence), never runs. Conclusion: pilot 51311–51318
and confirm 51319–51330 are verified-fresh bands. If any seed fails
to run (flap or crash), it is retried, never replaced by a
previously judged seed; a seed that cannot be produced at all is
reported as missing and the denominator is stated as observed.
Confirm seeds are RESERVED by this prereg, not consumed: they are
run only on a pilot GO, after a fresh seed-field re-check.

## Pilot seeds (run first; confirm gated on pilot GO)

51311, 51312, 51313, 51314, 51315, 51316, 51317, 51318. Armed only,
competent, 30d, substrate gates as above.

## Confirm seeds (run ONLY on pilot GO)

51319, 51320, 51321, 51322, 51323, 51324, 51325, 51326, 51327, 51328,
51329, 51330. Armed only, competent, 30d, substrate gates as above.
No seed from any prior judged band is reused.

## Primary metric and GO bar (judged exactly against this header — commit verbatim)

Primary = confirmed recoveries under the tolerance rule on the
pilot band. GO requires ALL of:

- (GO-1) at least 3 of the 8 pilot seeds confirm: the count of
  pilot seeds with a confirmedDay in their final engaged run is
  >= 3; AND
- (GO-2) zero hairline-only confirmations: no pilot seed's
  confirming candidate (its first confirming candidate in the
  final run) is hairline-only under the exact definition above.

Verdict mapping: (GO-1) PASS + (GO-2) PASS = pilot GO (confirm
runs, judged on the confirm bars below). Pilot (GO-1) FAIL or
(GO-2) FAIL = pilot NO-GO (stop, no confirm). A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file and the revision applies to
the NEXT run, never to this one.

Sensitivity framing, kept from dipslide2's (p2) for comparability:
dipslide2's (p2) required at least one pilot seed to confirm (the
anti-silence guard: a never-firing sensor must fail at pilot).
This arm RAISES that guard to >= 3/8 (GO-1) and adds the
hairline-only guard (GO-2): a sensor that fires only by tolerating
single-evening noise must not pass on the strength of those fires
alone. The (p2) concept is unchanged — only its threshold and its
guard are stricter, stated here before judging.

Confirm bars (judged only if the pilot GO runs the confirm band):
(c3-1) at least 4 of the 12 confirm seeds confirm (>= 1/3, the
pilot's 3/8 proportion rounded to the 12-seed band); (c3-2) zero
hairline-only confirmations on the confirm band. Confirm GO
requires (c3-1) PASS + (c3-2) PASS. Any confirm-band miss is
confirm NO-GO.

FALSE-FIRE COUNT (reported, not a GO gate for this arm — stated
before judging, with the tension disclosed): the false-fire count
is the dipslide2 count (survived seeds with a confirmedDay in the
final run) and its rate (count / census-valid survived seeds with
a final run) is reported alongside the GO verdict for
comparability with dipslide2's (p1) 25% cap. It is NOT an
additional GO gate here, because on an all-survived band GO-1
(>= 3/8 confirm) already implies a false-fire rate >= 37.5%,
above dipslide2's 25% cap — the two bars cannot both pass on such
a band. That tension is the point of stating it now: a pilot GO
for THIS arm means tolerance restores firing, NOT that the sensor
is deployable; a landing arm would still have to re-judge
false-fire (and collapse earliness) under its own prereg. Nothing
in this paragraph licenses re-scoring this arm's verdict against
the (p1) cap after the fact.

## Balanced panel (§15) — inapplicability declared (same reasoning as the prior arms)

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer, scorecard,
and cohort rows; this arm changes NO game code, runs NO lever, and
its primary metric is a within-trajectory instrument comparison
(sensor vs level rule on identical evening pantry series), not a
panel metric. The level-vs-sensor table is reported directly in the
evidence file instead, on identical seeds and identical
trajectories. If a panel compare genuinely applied it would be
attached; it does not, for the same reason the prior arms declared.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states, and this sweep carries no such fields. NO wall
movement is claimed. What is reported: wave reach
(maxWaveUnlocked per seed), median/max survival (days alive),
collapse count, all in-window, for each judged band.

## Sense test (SENSE-TESTING LAW)

Quote the actual "shelves full" say-lines against the pantry
trajectory around each confirmed fire in each judged band (and
around any collapsed seed's slide), and judge in plain words whether
the sensor's action would read sensibly to a player (a village
noticing a slide, or crying wolf on a dip?). At least one line is
quoted in the evidence file. Also note any recurrence of the known
"pot stays full" prose line, recorded only, not re-litigated.

## Attribution limits (stated before judging)

- Evening snapshots only: the sensor reads evening pantry while the
  gate decides intraday. A confirmed day is "the evening a
  tolerance-rule sensor would first have disagreed, after
  confirmation", not a claim about any single intraday decision.
- The sensor is judged, not the gate: earliness is a sensor property,
  not a survival claim; whether banking eased kcal would have saved
  a collapsed seed is unmeasured (the counterfactual changes the
  trajectory).
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: even a GO on
  8 pilot + 12 confirm fresh seeds does not prove the sensor works
  in general — it is two bands, and any landing case would need the
  coordinator's judgment on the combined pilot + confirm picture.
- Calibration disclosed: the tolerance design's forgiveness of the
  three historical hairline bounces (+389, +186, +215) is computed
  from already-judged corpora during design. It is calibration,
  not a judged result, and it does not count toward any bar in this
  prereg. Only the fresh 51311–51330 bands judge this sensor.

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run, never
to this one.)
