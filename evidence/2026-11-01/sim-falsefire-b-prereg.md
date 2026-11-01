# sim-falsefire-b — PREREGISTRATION (committed BEFORE any judged sweep or judged re-analysis)

Run: oversight-flesh-out-loop-b, arm sim-falsefire-b, axis food-economy.
Worktree sim-falsefire-b, branch sim-falsefire-b.

Settles the dipslide sensor program's open question from Loop B round
1725Z (evidence/2026-11-01/sim-food-dipslide3-multisweep-round-1725.md):
the dipslide3 tolerance rule fires cleanly (10/20 confirm, 0
hairline-only) yet scores 62.5% pilot / 41.7% confirm "false fires"
under the dipslide2 definition (a confirmed fire on a survived
seed) — above dipslide2's 25% cap — only because all 20 seeds
survived. The 1725Z verdict was explicitly NOT deployable, and the
two bars (sensitivity >= 3/8 confirming, false-fire <= 25%) are
jointly unsatisfiable on an all-survived band under that definition.
This arm settles the definition in this prereg, then applies it to
the dipslide3 corpus (20 seeds, 51311–51330) AND to a fresh 8-seed
pilot band. It also closes the hairline-only gap disclosed in
dipslide3's metric review (2): two separated sub-5% evenings
confirm unflagged.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all
named *-falsefire-b.*: this prereg, the analyzer
(scripts/analyze-falsefire-b.js, which imports the committed
dipslide3 analyzer's candidate/confirmation/hairline helpers
verbatim and adds only the false-fire classification, the
post-confirmation recovery scan, and the separated-wiggle flag),
the proof test (scripts/test-falsefire-b.js), evidence, corpus
(evidence/2026-11-01/sim-falsefire-b-corpus/). The depositgate
driver (scripts/depositgate-b-driver.js), the dipslide analyzers,
and scripts/policies/competent.js are REUSED VERBATIM, read-only,
never edited. The dipslide3 corpus files are READ-ONLY inputs to
the re-analysis, never edited or re-run.

## Canon note (read first)

docs/CANON.md read in full. NO canon doc defines DEPOSITGATE or the
dipslide sensor as systems — the mechanism below is read from the
depositgate and dipslide arms' preregs and evidence, not invented
canon. docs/PRESERVATION.md (food ladder) is adjacent, not the
sensor: it explains why a falling total pantry matters even while
fresh days stay high. This arm invents no game system: it settles
how an instrument's fires are SCORED, which is a measurement
decision, and says so.

## Q1 — THE SETTLED FALSE-FIRE DEFINITION (decided here, before judging)

PLAIN WORDS, ONE SENTENCE: a sensor warning is a false alarm only
if the pantry climbs back to where it was when the warning fired
within ten evenings — a slide that stays down for ten evenings and
only then recovers, or ends in collapse, was a real slide worth
warning about, even if the village survives.

EXACT DEFINITION. For a confirmed fire in a seed's final engaged
run under the dipslide3 tolerance rule (candidate/eligibility/
final-run counting unchanged), let L be the pantry on the candidate
evening and C the confirmedDay:

- COLLAPSED seed (endReason != 'survived') with a confirmed fire:
  TRUE WARNING, never a false fire. The slide ended in collapse;
  the warning described a real slide.
- Else, if the pantry reaches L at ANY evening in C+1..C+10 (the
  post-confirmation recovery horizon N = 10): FALSE FIRE
  ("quick recovery"). The "slide" was a transient dip that
  self-corrected within two confirmation windows.
- Else: TRUE WARNING ("sustained slide"). The store stayed below
  its candidate level for the full 10-evening horizon, whether the
  village later survived or not. SURVIVAL ALONE IS NEVER A FALSE
  FIRE under this definition.

WHY THIS DEFINITION, AND WHY N = 10 (decided on principle, not
fitted to the corpus):

- A warning instrument is scored on whether what it warned about
  was real, not on whether the village later died. The old
  definition scored "warned and lived" as failure, which punishes
  exactly the outcome a warning exists to produce (a village that
  notices a slide in time to live through it). Under the old
  definition a perfect slide-warning sensor on an all-survived
  band scores 100% false — the definition, not the sensor, is
  broken there.
- The task's example sentence ("a survived slide with recovery is
  not a false alarm but a correct early warning") is resolved by
  the horizon, stated here so there is no ambiguity to re-litigate
  after judging: recovery WITHIN 10 evenings of confirmation
  makes the fire false (the slide was transient); recovery AFTER
  10 sustained-down evenings makes it a true warning (the slide
  was real and long, and the village lived through it, warned or
  not). "Survived slide with recovery" is true, not false, unless
  the recovery is quick.
- N = 10 is twice the 5-evening confirmation window: a slide that
  persists for twice as long as it took to confirm is not noise,
  and a recovery inside two windows is fast enough to call the
  original slide a dip. A longer horizon (e.g. to end of window)
  would call a 15-evening slide "false" because the village
  eventually recovered — the same survival-punishing mistake in a
  thinner disguise. A shorter horizon (e.g. 5) would call a
  6-evening dip "true" on thin persistence. 10 is the principled
  middle, fixed here, not tuned after seeing outcomes.
- THE CAP IS KEPT, AND ITS MEANING CHANGES WITH THE DEFINITION.
  The 25% cap is retained, but it now applies to a rate over
  CONFIRMED FIRES (false fires / confirmed fires), not over
  survivors. A sensor may warn often and still pass, provided at
  most 1 in 4 of its warnings is a transient dip. The old
  survived-seed rate is still REPORTED for comparability, but it
  is never a bar in this arm or any arm that adopts this
  definition.

CENSORING (pre-registered, conservative). If fewer than 10
evenings after C exist in the 30-day window and no recovery was
seen, the fire is a true warning AS OBSERVED, flagged censored
with its observed horizon length. For the JUDGED rate, censored
true fires are EXCLUDED from both numerator and denominator (the
conservative direction: dropping true cases can only raise the
false rate, so a pass under the judged rate is not bought with
thin observations). The observed rate (censored trues counted as
true) is also reported. If the two rates give different verdicts,
the evidence says so and the verdict carries a "censored"
qualifier. Recovery rows are numeric-pantry evenings only; null /
missing evenings are skipped and do not extend the horizon. Gate
engagement is NOT required for the recovery scan: the store is the
store whether the level rule is engaged or not.

WHAT WOULD CHANGE THE 1725Z "NOT DEPLOYABLE" VERDICT (stated
before judging): deployability on the false-fire leg requires the
bars below (FF-1 + FF-2 + FF-3) to pass under THIS definition.
Passing them makes the sensor deployable AS A SLIDE WARNING ONLY
— it does not make it a collapse predictor. Collapse earliness
remains unjudged program-wide (n = 1 collapse) and is NOT claimed
by any verdict here. Failing any bar leaves the sensor NOT
deployable, and the definition still stands as settled (the
settlement is the definition + cap; deployability is the verdict
under it, not the settlement itself).

## Q2 — THE HAIRLINE-ONLY GAP: TWO SEPARATED SUB-5% EVENINGS (decided here)

DECISION, PRE-REGISTERED: the extension is ADOPTED. Two separated
sub-5% evening wiggles (each undone the next evening, or separated
by at least one clean evening) MAY confirm, as an extension of
dipslide3's tolerance rule — the FIRING RULE IS UNCHANGED
(dipslide3 already confirms such windows: no margin breach, no
sustained pair). What changes is the FLAG: the gap is closed by
definition, not by re-firing. A confirmation whose first-confirming
candidate's window contains >= 2 evenings strictly above the
candidate level, ALL sub-margin (< 105% of level), with NO two
consecutive (by loopDay) above-level evenings, is classified
'separated' and counts as EXTENSION-RESTING: it rests on the
extension, i.e. it would NOT confirm under a strict variant that
treats any second above-level evening as recovery. Extension-
resting confirmations are counted and named on every band; they
never silently pass as clean.

WHY ADOPT (decided before judging): each separated wiggle is
individually the documented noise shape (a single evening's
sub-5% uptick, undone the next evening); two noise events
separated by a clean evening do not sum into a recovery — the
pantry never stays at the level, never breaches the margin, and
the endpoint stays below the level. Forbidding the second wiggle
would reintroduce dipslide2's brittleness (single-evening events
vetoing a real slide) in a new disguise. But honesty cuts the
other way too, hence the bars: the extension may not CARRY a
verdict. If extension-resting confirmations are numerous or load-
bearing on the pilot, the extension is not adopted for verdict
purposes and a future arm must decide whether to re-tighten
(reject separated shapes) before any deploy claim resting on them.

## Sensor rule (unchanged from dipslide3, restated for completeness)

Candidate / eligibility (loopDay >= 8) / final-engaged-run counting
/ tolerance confirmation rule (margin breach >= 105% of candidate
level OR two consecutive evenings >= candidate level) are
IDENTICAL to dipslide3. The only additions are the Q1 scoring
layer (applied AFTER confirmation, never changing whether a seed
confirms) and the Q2 flag layer (applied to confirming windows,
never changing whether a seed confirms). No firing behavior
changes in this arm: it is instrument settlement, not a new sensor.

## Staged design (corpus re-analysis + fresh pilot, no confirm band)

Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Substrate gates, identical to dipslide3: COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0; WOODCARRY/WOODWARM/MORNINGCARRY/
WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING not 1; DEPOSITGATE=1
(armed only). Horizon + why: 30 days, death-aware (dead villages
stop simulating; no fixed 200d), matching dipslide3 exactly so
the corpus and pilot bands are comparable. Driver:
scripts/depositgate-b-driver.js, verbatim, one process per seed
(SEEDS=<single>), with a per-seed retry loop on EPERM-flap
failures (up to 6 tries, 1-valid-JSON-line verification per seed),
as the prior confirms did. Analyzer: scripts/analyze-falsefire-b.js.

STEP 1 — CORPUS RE-ANALYSIS (judged, no new sims): apply the
settled definition + separated-wiggle flag to the dipslide3 corpus
files (sim-dipslide3-b-pilot-armed.jsonl + sim-dipslide3-b-
confirm-armed.jsonl, seeds 51311–51330) with the new analyzer.
This is a judged result under this prereg (the task orders the
corpus application), not a re-score of dipslide3's verdict:
dipslide3's GO (tolerance restores firing, 0 hairline-only) stands
as published; this arm scores those same fires under the new
definition. Expectation from dipslide3's published tables (NOT a
bar): all 10 first-confirmation windows never reach candidate
level, so the extension-resting count on the corpus should be 0;
the re-analysis verifies this mechanically rather than assuming it.

STEP 2 — FRESH PILOT (judged sims, only after this prereg commit):
8 seeds, armed only, 30d competent, same substrate gates. No
confirm band is run in this arm: the pilot is the fresh test of
the settled definition, and the corpus is the 20-seed settlement
base. A confirm band, if needed, belongs to a NEXT arm's prereg.

## Seed freshness verification (done BEFORE this prereg was written)

Prior judged bands on this lane (seed-field scan of every *.jsonl
under evidence/, not bare-numeral grep): 51101–51120, 51201–51212,
51301–51330, 51401–51408 + 51411–51422, 51501–51508, 51801–51808.
The 51600–51699 range contains NO seed-field assignment in any
corpus, and no dated-.md file mentions 51601–51608 (checked by
grep over evidence/2026-11-01/*.md). Conclusion: pilot
51601–51608 is a verified-fresh band. If any seed fails to run
(flap or crash), it is retried, never replaced by a previously
judged seed; a seed that cannot be produced at all is reported as
missing and the denominator is stated as observed.

## Pilot seeds (run only after this prereg commit)

51601, 51602, 51603, 51604, 51605, 51606, 51607, 51608. Armed only,
competent, 30d, substrate gates as above.

## Primary metrics and GO bars (judged exactly against this header)

Q1 — FALSE-FIRE DEFINITION SETTLED + DEPLOYABILITY VERDICT.
GO (deployable as a slide warning) requires ALL of:

- (FF-1) POOLED JUDGED RATE: (corpus false + pilot false) /
  (corpus confirmed + pilot confirmed, censored trues excluded
  from numerator and denominator) <= 0.25. Pooled, because the
  settlement base is corpus + pilot together; per-band rates are
  reported alongside.
- (FF-2) PILOT SENSITIVITY: pilot confirmed count >= 3 (the
  dipslide3 GO-1 guard, kept: a sensor that fires nowhere on
  fresh seeds cannot be called deployable, whatever its rate).
- (FF-3) PILOT JUDGED RATE: pilot false / pilot confirmed
  (censored trues excluded, same rule) <= 0.25. The pooled rate
  must not hide a fresh-band failure.

Q1 NO-GO (NOT deployable) = any of FF-1/FF-2/FF-3 fails. The
definition itself remains settled either way; only the
deployability verdict changes. A miss is NO-GO, never re-scored
against a friendlier metric mid-run (in particular, never
re-scored against the OLD survived-seed rate, and never by
dropping censored cases differently than pre-registered here).

Q2 — SEPARATED-WIGGLE EXTENSION. GO (extension adopted as the
standing rule) requires ALL of:

- (W-1) EXTENSION INCIDENCE: pilot extension-resting
  confirmations <= 2.
- (W-2) EXTENSION NOT LOAD-BEARING: pilot sensitivity excluding
  extension-resting confirmations >= 3 (the pilot still fires
  >= 3 times without the extension).

Q2 NO-GO = either bar fails: the flag stands, but the extension
is NOT adopted for verdict purposes, and any future deploy claim
must first decide (in its own prereg) whether separated shapes
confirm or are rejected. The corpus extension-resting count is
reported descriptively (it does not gate Q2, which is a pilot
question), and any pilot verdict change vs the dipslide3 rule is
reported explicitly: by construction the firing rule is unchanged,
so NO verdict can change on firing — only on flagging. If the
re-analysis finds otherwise (a seed whose confirm/flag differs
from dipslide3's published tables for any reason other than the
new layers), that is a loud analyzer discrepancy to report, not a
verdict change to smooth over.

VERDICT MAPPING: Q1 GO + Q2 GO = full GO (settled definition,
deployable as a slide warning, extension adopted). Any other
combination = partial / NO-GO as specified per question, with each
question's verdict stated separately. No combined verdict may
hide a per-question miss.

## Balanced panel (§15) — inapplicability declared (same reasoning as the prior arms)

No balanced-panel compare is fabricated for this arm. The panel
compares lever arms through its own standardized observer,
scorecard, and cohort rows; this arm changes NO game code, runs
NO lever, and its primary metric is a within-trajectory instrument
scoring (sensor fires scored under a new definition on identical
evening pantry series), not a panel metric. The fire tables are
reported directly in the evidence file instead, on identical seeds
and identical trajectories. If a panel compare genuinely applied
it would be attached; it does not, for the same reason the prior
arms declared.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins:
those are late-game states, and this sweep carries no such fields.
NO wall movement is claimed. What is reported: wave reach
(maxWaveUnlocked per seed), median/max survival (days alive),
collapse count, all in-window, for the pilot band (the corpus
band's wall numbers stand as published in dipslide3).

## Sense test (SENSE-TESTING LAW)

Quote the actual "shelves full" say-lines against the pantry
trajectory around each pilot confirmed fire (and around any
corpus fire re-scored as false, if any), and judge in plain words
whether the settled definition's verdict reads sensibly to a
player: does a "true warning" fire on a slide a player would
recognize, and does a "false" fire (if any) read like a dip a
player would shrug at? At least one line is quoted in the
evidence file. Also note any recurrence of the known "pot stays
full" prose line, recorded only, not re-litigated. Include a
short sense read: do the confirming evenings read like a real
pantry slide to a player?

## Attribution limits (stated before judging)

- Evening snapshots only: the sensor reads evening pantry while
  the gate decides intraday. A confirmed day is "the evening a
  tolerance-rule sensor would first have disagreed, after
  confirmation", not a claim about any single intraday decision.
- The sensor is judged, not the gate: whether banking eased kcal
  would have saved a collapsed seed is unmeasured (the
  counterfactual changes the trajectory).
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a GO on a
  20-seed re-analysis + 8-seed pilot does not prove the sensor
  works in general — it settles the definition and its first
  application, and any landing case would need the coordinator's
  judgment on the combined picture.
- Calibration disclosure: the definition's N = 10 and the adoption
  reasoning are decided on principle in this prereg (above), NOT
  fitted to corpus outcomes. The corpus re-analysis runs AFTER
  this prereg commit and is a judged result under it — but the
  corpus trajectories predate the definition, so the corpus leg
  is settlement-by-application, and the pilot leg is the fresh
  test. Both legs are reported separately so the distinction is
  auditable.

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run, never
to this one.)
