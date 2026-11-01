# sim-dipslide-confirm-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1430Z, arm
sim-dipslide-confirm-b, axis food-economy. Worktree
sim-dipslide-confirm-b, branch sim-dipslide-confirm-b.

Fresh-seed confirm of the dip-vs-slide sensor whose pilot GO was judged
in run 1346Z (evidence/2026-11-01/sim-dipslide-b.md, prereg
evidence/2026-11-01/sim-dipslide-b-prereg.md). The pilot replayed the
depositgate armed corpus (seeds 51101–51108) and passed both pilot bars:
(a) 51101 earliness 5 (candidate day 8, confirmed day 13, level
stand-down day 18) and (b) false-fire cap 1 (only 51103 among 7
survivors). The pilot evidence states plainly that its numbers are
optimistic by construction (the design was motivated by that corpus's
own failure mode) and that the fresh-seed confirm is the real test.
This run is that test. DO NOT RE-TUNE: the rule below is tested
exactly as specified in sim-dipslide-b.md's "Exact sensor rule as
specified for the NEXT run's fresh-seed confirm" section.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-dipslide-confirm-b.*: this prereg, the confirm analyzer
(scripts/analyze-dipslide-confirm-b.js, which imports the committed
dipslide analyzer's analyzeSeed and adds only the confirm bars), the
proof test (scripts/test-dipslide-confirm-b.js), evidence, corpus
(evidence/2026-11-01/sim-dipslide-confirm-b-corpus/). The depositgate
driver (scripts/depositgate-b-driver.js) and the dipslide analyzer
(scripts/analyze-dipslide-b.js) are REUSED VERBATIM, read-only, never
edited. scripts/policies/competent.js is REUSED VERBATIM.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE as a
system — the mechanism below is read from the depositgate and
dipslide arms' preregs and evidence (fresh days > 4, hungryStreak
>= 3 stands the gate down), not invented canon. docs/PRESERVATION.md
(food ladder) is adjacent, not the gate: it explains why a falling
total pantry matters even while fresh days stay high (fresh is a slice
of the store, not the store).

## The sensor rule (EXACT — unchanged from the pilot)

Evening pantry series P(d) = evening pantryKcal on lived day d (whole
pantry, all food states, kcal). loopDay is the census day label, as in
the depositgate corpus. No retrospective peeking: every condition is
evaluated from evenings at or before the confirmation evening, and the
sensor's actionable day is the confirmation evening itself, never the
candidate day retroactively.

- CANDIDATE on evening D iff ALL of: (i) at least 5 prior evening
  rows; (ii) P(D) <= 0.80 * P(D-5) (total store fell >= 20% over 5
  evenings); (iii) P(D-2) < P(D-3) AND P(D-1) < P(D-2) AND P(D) <
  P(D-1) (three consecutive evening falls ending at D); (iv)
  gateEngaged true that evening. A day with a null pantry reading
  breaks all fall chains and is never a candidate day.
- ELIGIBLE iff loopDay D >= 8 (early-window exclusion: signals on
  loopDays 1–7 ignored entirely).
- CONFIRMS iff the loopDay-(D+5) evening row exists with a numeric
  pantry reading, lies inside the SAME final engaged run
  (gateEngaged true there), AND P(D+5) < P(D) (5-evening recovery
  confirmation). Because the candidate already satisfies
  P(D) <= 0.80 * P(D-5), this also implies P(D+5) < P(D-5).
- SCAN: eligible candidates inside the final engaged run, ascending
  loopDay order; the FIRST that confirms yields (candidateDay = D,
  confirmedDay = D+5). A candidate that fails recovery does NOT end
  the scan. If none confirms, confirmedDay is null. The actionable
  day is confirmedDay, never candidateDay.
- FINAL ENGAGED RUN = maximal consecutive gateEngaged=true evenings
  ending at the seed's last engaged evening. LEVEL STAND-DOWN day =
  first gateEngaged=false evening after that run (null if the seed
  ends engaged). EARLINESS = levelStandDown - confirmedDay.
- COUNTING (final engaged run only): a fire counts as a false alarm
  only if it is a CONFIRMED fire (a confirmedDay) in a seed's final
  engaged run. Fires outside the final run are reported descriptively
  as confirmedAnywhere, never toward the bars.
- NO-RUN SEEDS: a seed with NO final engaged run (the gate never
  engaged) counts as no-run: it is NEITHER a false fire NOR a
  survivor for bar (c) — it is excluded from both the numerator and
  the denominator of the false-fire rate, and it is named in the
  evidence. (Pilot note: no pilot seed lacked a final engaged run,
  so this branch was unexercised there; it is covered by a unit check
  in the pilot proof test and again here.)
- COLLAPSED SEEDS: a confirmed fire on a collapsed seed is NOT a
  false alarm. Earliness is defined only when a level stand-down
  evening exists after the final run; a collapsed seed with a
  confirmedDay but no level stand-down has undefined earliness and
  cannot satisfy bar (d) — it is reported, not counted as passing.
- Confirmation evenings beyond the lived window, on a null-pantry
  row, or outside the final run: the candidate does NOT confirm
  (unconfirmed, not missing-data-imputed).
- CENSUS VALIDITY (reported, never patched): rows == daysAlive and
  gateEngaged boolean on every row. A seed failing it is excluded
  from the bars and named, not silently fixed.

## Question

Does the dip-vs-slide sensor — early-window exclusion (D >= 8) plus
5-evening recovery confirmation (P(D+5) < P(D)) on top of the
unchanged trend condition — hold up on seeds it has never seen:
a false-fire rate at or under the cap, and (if any seed collapses)
earliness >= 3 on at least one collapsed seed?

## Confirm design (fresh sims, armed only)

12 FRESH seeds, armed arm only (DEPOSITGATE=1; the level rule lives
in the armed arm — the control arm has no gateEngaged series to
judge, exactly as in the pilot). Policy: competent ONLY
(scripts/policies/competent.js, verbatim). Substrate gates, identical
to the depositgate/trendsensor/dipslide pilot: COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0; WOODCARRY/WOODWARM/MORNINGCARRY/
WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1; DEPOSITGATE=1.
Horizon + why: 30 days, death-aware (dead villages stop simulating;
no fixed 200d). 30d is the depositgate baseline window: the slide to
judge happened days 12–18 and the collapse day 25 in the pilot, so
the window covers both the sensor question and its outcome. A longer
window is a NEXT run's question, not this one's.
Driver: scripts/depositgate-b-driver.js, verbatim, one process per
seed (SEEDS=<single>), with a per-seed retry loop on EPERM-flap
failures (up to 6 tries, 1-valid-JSON-line verification per seed),
as the depositgate confirm did. Analyzer: the committed
scripts/analyze-dipslide-b.js analyzeSeed, verbatim, plus the new
confirm-bars wrapper scripts/analyze-dipslide-confirm-b.js.

## Seed freshness verification (done BEFORE this prereg was written)

Prior judged bands on this lane: pilot 51101–51108 (depositgate
armed pilot corpus, reused by trendsensor and dipslide pilots);
depositgate confirm 51109–51120 (both arms). This worktree's
evidence/2026-11-01/ was searched for seed assignments in the
51201–51212 band: no `"seed":512xx` field and no dated-.md band
mention of 51201–51212 exists anywhere in evidence/2026-11-01/.
Five-digit 512xx strings that DO occur in that directory are pantry
/ ledger kcal values inside the depositgate .jsonl files (e.g. share
51224, intake 51291), not seed assignments — verified by context.
Other same-day bands seen (51121, 51132 in other arms' notes;
journey seeds 85002, 29153, 17562, 17548) do not touch 51201–51212.
Conclusion: 51201–51212 is a verified-fresh band. If any seed in it
fails to run (flap or crash), it is retried, never replaced by a
previously judged seed; a seed that cannot be produced at all is
reported as missing and the denominator is stated as observed.

## Confirm seeds

51201, 51202, 51203, 51204, 51205, 51206, 51207, 51208, 51209, 51210,
51211, 51212. Armed only, competent, 30d, substrate gates as above.
No seed from any prior judged band is reused.

## Primary metric and CONFIRM bars (judged exactly against this header)

GO requires (c) PASS and (d) PASS-or-UNJUDGED. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric proves
wrong, it goes under "metric review" in the evidence file and the
revision applies to the NEXT run, never to this one.

(c) FALSE-FIRE RATE: at most 25% of surviving confirm seeds have a
    confirmedDay in their final engaged run. Precisely: let S =
    confirm seeds whose endReason is 'survived' AND that have a final
    engaged run (no-run seeds excluded from S, per the counting rule
    above; census-invalid seeds excluded and named). Let F = seeds
    in S with a confirmedDay in their final engaged run. Bar (c)
    PASSES iff F / S <= 0.25 (with S > 0; if S = 0 the bar is
    UNJUDGED and reported as such, not passed). The counted-anywhere
    false count (confirmedAnywhere on survived seeds, including
    outside the final run) is reported descriptively alongside the
    judged count, exactly as the pilot did (pilot: final-run 1,
    anywhere 3).
(d) COLLAPSE EARLINESS: IF at least one confirm seed collapses
    (endReason != 'survived', census-valid), bar (d) PASSES iff at
    least one collapsed confirm seed has levelStandDown -
    confirmedDay >= 3 (confirmedDay in its final engaged run, level
    stand-down evening existing). The full earliness distribution
    across collapsed seeds (including null/undefined cases) is
    reported, not just the pass/fail. IF zero confirm seeds collapse,
    bar (d) is UNJUDGED — reported as such, not as a pass or a fail
    — and the final verdict rests on (c).

Verdict mapping: (c) PASS + (d) PASS = GO. (c) PASS + (d) UNJUDGED =
GO (on the false-fire leg; earliness unmeasured, stated as such).
(c) FAIL = NO-GO regardless of (d). (c) PASS + (d) FAIL = NO-GO.
(c) UNJUDGED = no verdict (reported as UNJUDGED, not GO).

## Balanced panel (§15) — inapplicability declared (same reasoning as the pilot)

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer, scorecard,
and cohort rows; this arm changes NO game code, runs NO lever, and
its primary metric is a within-trajectory instrument comparison
(dip/slide sensor vs level rule on identical evening pantry series),
not a panel metric. The level-vs-sensor table is reported directly
in the evidence file instead, on identical seeds and identical
trajectories. If a panel compare genuinely applied it would be
attached; it does not, for the same reason the pilot declared.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states, and this sweep carries no such fields. NO wall
movement is claimed. What is reported: wave reach
(maxWaveUnlocked per seed), median/max survival (days alive),
collapse count, all in-window, for the confirm band.

## Sense test (SENSE-TESTING LAW)

Quote the actual "shelves full" say-lines against the pantry
trajectory around each confirmed fire in the confirm band (and
around any collapsed seed's slide), and judge in plain words whether
the sensor's action would read sensibly to a player (a village
noticing a slide, or crying wolf on a dip?). At least one line is
quoted in the evidence file. Also note any recurrence of the known
"pot stays full" prose line, recorded only, not re-litigated.

## Attribution limits (stated before judging)

- Evening snapshots only: the sensor reads evening pantry while the
  gate decides intraday. A confirmed day is "the evening a dip/slide
  sensor would first have disagreed, after confirmation", not a claim
  about any single intraday decision. The >= 3-day bar absorbs a
  1-day slip.
- The sensor is judged, not the gate: earliness is a sensor property,
  not a survival claim; whether banking eased kcal would have saved
  a collapsed confirm seed is unmeasured (the counterfactual changes
  the trajectory).
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive confirm, NOT a causal claim: even a GO on 12 fresh
  seeds does not prove the sensor works in general — it is one
  confirm band, and any landing case would need the coordinator's
  judgment on the combined pilot + confirm picture.

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run, never
to this one.)
