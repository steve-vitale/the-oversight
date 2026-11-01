# sim-dipslide2-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, arm sim-dipslide2-b, axis food-economy.
Worktree sim-dipslide2-b, branch sim-dipslide2-b.

Next sensor iteration after the 1430Z fresh-seed confirm NO-GO
(evidence/2026-11-01/sim-dipslide-confirm-b.md): the dip-vs-slide
sensor (trend unchanged + D>=8 exclusion + 5-evening recovery
confirmation, final-run counting only) fired falsely on 4/12 fresh
seeds (51204, 51207, 51210, 51211) = 33.3% vs the 25% cap, and bar (d)
was UNJUDGED (0 collapses). This arm designs the NEXT iteration as
a NEW prereg — never a re-score of the 51201–51212 band — and judges
it on FRESH seeds only.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all
named *-dipslide2-b.*: this prereg, the analyzer
(scripts/analyze-dipslide2-b.js, which imports the committed
dipslide analyzer's candidate helpers verbatim and adds only the new
confirmation rule plus the pilot/confirm bars), the proof test
(scripts/test-dipslide2-b.js), evidence, corpus
(evidence/2026-11-01/sim-dipslide2-b-corpus/). The depositgate
driver (scripts/depositgate-b-driver.js) and the dipslide analyzer
candidate helpers (scripts/analyze-dipslide-b.js) are REUSED
VERBATIM, read-only, never edited. scripts/policies/competent.js
is REUSED VERBATIM.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE as a
system — the mechanism below is read from the depositgate and
dipslide arms' preregs and evidence (fresh days > 4, hungryStreak
>= 3 stands the gate down), not invented canon. docs/PRESERVATION.md
(food ladder) is adjacent, not the gate: it explains why a falling
total pantry matters even while fresh days stay high (fresh is a
slice of the store, not the store).

## Design choice: exactly ONE of the three 1430Z-closeout designs

PICKED: (c) recovery-to-candidate-level test.

WHY (c), and why not (a) or (b) — decided from the already-judged
51201–51212 band's shapes (design calibration, disclosed here, NOT
a judged result; the judged test is the fresh band below):

- (a) WINDOW-EDGE RULE — rejected. It removes only confirmations
  landing on the window's final evening: on the prior band that is
  exactly one seed (51204, confirmed day 30). Worse, 51204 is a
  genuine late slide, not a shape failure — the rule would strike a
  real slide for being late, not for being wrong. And live play has
  no window edge: the game does not end at day 30, so the rule
  would be a measurement artifact, not a sensor improvement. A
  sensor that only looks better because the window ended is not a
  better sensor.
- (b) STEP-DOWN DISCRIMINATION (magnitude/slope floor) — rejected
  as the pick (it is the runner-up). A further-fall floor (e.g.
  require P(D+5) <= 0.95 * P(D)) rejects exactly one prior-band
  false fire (51211: further fall 1.38%, vs 10.1–34.2% for the other
  three fires and 19.6% for the pilot true positive 51101). That is
  calibration on a single hairline case, and it says nothing about
  the bounce-and-refall shape: 51207's pantry climbs back above its
  candidate level on D+1 and then falls again, and any magnitude
  floor still confirms it. Too narrow, too single-case.
- (c) RECOVERY-TO-CANDIDATE-LEVEL TEST — picked. A dip is defined
  by recovery: if the pantry climbs back to the candidate evening's
  level at ANY evening inside the confirmation window, the village
  has shown recovery and the candidate dies — even if the pantry
  falls again by D+5. The old endpoint-only test (P(D+5) < P(D))
  counts a bounce-and-refall as "no recovery", which is exactly
  the 51207/51211 shape. On the prior band this rule rejects TWO
  of the four false fires: 51207 (D+1 bounce 17,841 > candidate
  17,452, +389 kcal) and 51211 (D+3 bounce 24,775 > candidate
  24,589, +186 kcal), while keeping 51204 and 51210 (no
  intermediate evening reaches the candidate level) — a
  retrospective 2/12 = 16.7% vs the old 33.3%. It also preserves
  the pilot's only collapse-earliness case: 51101's mid-window max
  is 20,500 < candidate 22,650, so it still confirms on day 13.
  The pilot residual 51103 still fires (mid-window max 22,850 <
  candidate 23,168) — disclosed, not hidden: (c) does not fix the
  deep-dip-eaten-through shape.

  HONEST CAVEAT (carried into the evidence file): both
  prior-band rejections ride on hairline bounces (+389 and +186
  kcal, under 2.3% of the candidate level). The discrimination may
  be fragile — a fresh band whose step-downs and drifts never
  bounce above the candidate level will still fire. That is what
  the fresh band tests. Also note (c) makes the sensor STRICTLY
  QUIETER than the old rule (its confirmations are a subset of
  the old rule's), so a trivially-silent sensor would pass a
  false-fire cap by never firing at all — hence pilot bar (p2),
  the sensitivity guard, below.

## The sensor rule (EXACT — new confirmation rule, everything else unchanged)

Evening pantry series P(d) = evening pantryKcal on lived day d
(whole pantry, all food states, kcal). loopDay is the census day
label, as in the depositgate corpus. No retrospective peeking: every
condition is evaluated from evenings at or before the confirmation
evening, and the sensor's actionable day is the confirmation
evening itself, never the candidate day retroactively.

- CANDIDATE on evening D iff ALL of: (i) at least 5 prior evening
  rows; (ii) P(D) <= 0.80 * P(D-5) (total store fell >= 20% over 5
  evenings); (iii) P(D-2) < P(D-3) AND P(D-1) < P(D-2) AND P(D) <
  P(D-1) (three consecutive evening falls ending at D); (iv)
  gateEngaged true that evening. A day with a null pantry reading
  breaks all fall chains and is never a candidate day.
- ELIGIBLE iff loopDay D >= 8 (early-window exclusion, unchanged).
- CONFIRMS (NEW) iff ALL of: the loopDay-(D+5) evening row exists
  with a numeric pantry reading, lies inside the SAME final engaged
  run (gateEngaged true there), AND the pantry FAILS TO RECOVER TO
  THE CANDIDATE LEVEL inside the window — i.e. max{P(D+1), ...,
  P(D+5)} < P(D), where P(D) is the candidate evening's pantry.
  A single intermediate evening at or above P(D) kills the
  candidate, even if P(D+5) itself is below P(D). (The old
  endpoint condition P(D+5) < P(D) is implied by this rule and is
  no longer the test.) Null intermediate rows carry no reading
  and cannot demonstrate recovery; they are ignored for the max.
  A missing intermediate loopDay row is likewise ignored. A null
  or missing D+5 row blocks confirmation (as before).
- SCAN: eligible candidates inside the final engaged run, ascending
  loopDay order; the FIRST that confirms yields (candidateDay = D,
  confirmedDay = D+5). A candidate that fails confirmation does NOT
  end the scan. If none confirms, confirmedDay is null. The
  actionable day is confirmedDay, never candidateDay.
- FINAL ENGAGED RUN = maximal consecutive gateEngaged=true evenings
  ending at the seed's last engaged evening. LEVEL STAND-DOWN day =
  first gateEngaged=false evening after that run (null if the seed
  ends engaged). EARLINESS = levelStandDown - confirmedDay.
- COUNTING (final engaged run only, unchanged): a fire counts as a
  false alarm only if it is a CONFIRMED fire (a confirmedDay) in a
  seed's final engaged run. Fires outside the final run are
  reported descriptively as confirmedAnywhere, never toward the
  bars. Seeds with NO final engaged run count as no-run: neither a
  false fire NOR a survivor for the rate bars — excluded from both
  numerator and denominator, and named in the evidence.
- COLLAPSED SEEDS: a confirmed fire on a collapsed seed is NOT a
  false alarm. Earliness is defined only when a level stand-down
  evening exists after the final run; a collapsed seed with a
  confirmedDay but no level stand-down has undefined earliness and
  cannot satisfy bar (d) — reported, not counted as passing.
- CONFIRMATION EVENINGS beyond the lived window, on a null-pantry
  row, or outside the final run: the candidate does NOT confirm
  (unconfirmed, not missing-data-imputed).
- CENSUS VALIDITY (reported, never patched): rows == daysAlive and
  gateEngaged boolean on every row. A seed failing it is excluded
  from the bars and named, not silently fixed.
- DIAGNOSTIC (descriptive only, not a bar): per seed, the count of
  eligible final-run candidates that would have confirmed under
  the OLD endpoint rule but are REJECTED by the new rule
  (intermediate recovery present) — the mechanism check that (c)
  is doing work on the fresh band, not merely being quiet.

## Question

Does the recovery-to-candidate-level sensor — candidate confirms
only if the pantry never climbs back to the candidate evening's
level at any evening in the 5-evening confirmation window — hold up
on seeds it has never seen: a false-fire rate at or under the cap,
without going silent, and (if any seed collapses) earliness >= 3 on
at least one collapsed seed?

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
as the prior confirms did. Analyzer: scripts/analyze-dipslide2-b.js.

## Seed freshness verification (done BEFORE this prereg was written)

Prior judged bands on this lane: pilot 51101–51108 (depositgate
armed pilot corpus, reused by trendsensor and dipslide pilots);
depositgate confirm 51109–51120 (both arms); dipslide confirm
51201–51212 (armed); shelling pilot 51401–51408 and confirm
51411–51422 (both legs). This worktree's evidence/2026-11-01/ was
searched for seed assignments in the 51301–51322 band: no
`"seed":513xx` field in any .jsonl, no dated-.md band mention of
51301–51322, and no 513xx-named corpus file exists. Five-digit
strings containing 513 that DO occur (e.g. 75131 in unrelated
sweep scripts) are different seed numbers, not 513xx assignments.
Conclusion: 51301–51308 (pilot) and 51311–51322 (confirm) are
verified-fresh bands. If any seed fails to run (flap or crash), it
is retried, never replaced by a previously judged seed; a seed that
cannot be produced at all is reported as missing and the
denominator is stated as observed. Confirm seeds are RESERVED by
this prereg, not consumed: they are run only on a pilot GO.

## Pilot seeds (run first; confirm gated on pilot GO)

51301, 51302, 51303, 51304, 51305, 51306, 51307, 51308. Armed only,
competent, 30d, substrate gates as above.

## Confirm seeds (run ONLY on pilot GO)

51311, 51312, 51313, 51314, 51315, 51316, 51317, 51318, 51319, 51320,
51321, 51322. Armed only, competent, 30d, substrate gates as above.
No seed from any prior judged band is reused.

## Primary metric and bars (judged exactly against this header)

GO requires pilot (p1) PASS + (p2) PASS, then confirm (c) PASS and
(d) PASS-or-UNJUDGED. A miss is NO-GO, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file and the revision applies to the
NEXT run, never to this one.

(p1) PILOT FALSE-FIRE RATE: at most 25% of surviving pilot seeds
    have a confirmedDay in their final engaged run. Precisely: let
    S = pilot seeds whose endReason is 'survived' AND that have a
    final engaged run (no-run seeds excluded from S; census-invalid
    seeds excluded and named). Let F = seeds in S with a
    confirmedDay in their final engaged run. Bar (p1) PASSES iff
    F / S <= 0.25 (with S > 0; if S = 0 the bar is UNJUDGED and
    reported as such, not passed).
(p2) PILOT SENSITIVITY (anti-silence guard): at least one pilot
    seed has a confirmedDay in its final engaged run (survived or
    collapsed). If the sensor confirms nowhere in the pilot band,
    bar (p2) FAILS — the effect is invisible and the run is killed
    at pilot per the staged method, even if (p1) passes trivially
    at 0%. Pilot GO requires (p1) PASS + (p2) PASS. Pilot NO-GO
    stops the run: NO confirm band is run.
(c) CONFIRM FALSE-FIRE RATE: same definition as (p1) on the
    confirm band: F / S <= 0.25 with S > 0, else UNJUDGED. The
    counted-anywhere false count (confirmedAnywhere on survived
    seeds, including outside the final run) is reported
    descriptively alongside the judged count, exactly as the prior
    arms did.
(d) CONFIRM COLLAPSE EARLINESS: IF at least one confirm seed
    collapses (endReason != 'survived', census-valid), bar (d)
    PASSES iff at least one collapsed confirm seed has
    levelStandDown - confirmedDay >= 3 (confirmedDay in its final
    engaged run, level stand-down evening existing). The full
    earliness distribution across collapsed seeds (including
    null/undefined cases) is reported, not just the pass/fail. IF
    zero confirm seeds collapse, bar (d) is UNJUDGED — reported as
    such, not as a pass or a fail — and the final verdict rests on
    (c).

Verdict mapping: pilot (p1) PASS + (p2) PASS = pilot GO (confirm
runs). Pilot (p1) FAIL or (p2) FAIL = pilot NO-GO (stop, no
confirm). Confirm (c) PASS + (d) PASS = GO. (c) PASS +
(d) UNJUDGED = GO (on the false-fire leg; earliness unmeasured,
stated as such). (c) FAIL = NO-GO regardless of (d). (c) PASS +
(d) FAIL = NO-GO. (c) UNJUDGED = no verdict (reported as UNJUDGED,
not GO).

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
  recovery-to-candidate-level sensor would first have disagreed,
  after confirmation", not a claim about any single intraday
  decision. The >= 3-day bar absorbs a 1-day slip.
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
- Retrospective calibration disclosed: the (c) design choice and
  its prior-band numbers (2/12 retrospective, 51101 preserved,
  51103 still firing) were computed from already-judged corpora
  during design. They are calibration, not judged results, and
  they do not count toward any bar in this prereg. Only the fresh
  513xx bands judge this sensor.

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run, never
to this one.)
