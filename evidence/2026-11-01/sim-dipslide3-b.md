# sim-dipslide3-b — PILOT GO + CONFIRM GO: TOLERANCE RULE RESTORES FIRING WITHOUT RESTING ON HAIRLINE SHAPES

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1725Z,
arm sim-dipslide3-b, axis food-economy. Worktree sim-dipslide3-b,
branch sim-dipslide3-b. Next sensor iteration after the 1543Z pilot
NO-GO (evidence/2026-11-01/sim-dipslide2-b.md): the
recovery-to-candidate-level rule (c) went silent (0/8) because a
single +215 kcal (+0.99%) uptick counted as recovery. This arm tests
the tolerance rule from dipslide2's metric review as a NEW prereg,
never a re-score of the 51301–51308 band. DIAG ONLY: zero src/js
changes, zero policy-default flips, zero edits to any existing
script or policy file. New files only, all named *-dipslide3-b.*:
prereg, analyzer, proof test, evidence, corpora. The depositgate
driver, the dipslide analyzer's candidate helpers, and the competent
policy are REUSED VERBATIM, never edited. This worker does NOT push,
bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch sim-dipslide3-b, pending
coordinator merge.

## Verdict: pilot GO + confirm GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-dipslide3-b-prereg.md, commit
9e987f51976d5a90e818876c13dea0e9c5dd4983, written and committed
BEFORE any judged sweep (pure proof tests 34/34 ran before the
prereg commit; the live retrospective on the already-judged
dipslide2 corpus ran after it and is labeled calibration, not a
judged result). The sensor rule tested: candidate/eligibility/
final-run counting unchanged from dipslide2, with the NEW tolerance
confirmation rule: a candidate confirms only if the endpoint stays
below the candidate level AND the window shows NO tolerance-
recovery — recovery = any evening at or above 105% of the candidate
level (margin breach), OR two consecutive evenings at or above the
candidate level (sustained at-level). A single sub-5% evening
wiggle, undone the next evening, is forgiven.

PILOT (seeds 51311–51318, armed only, 30d competent):

- (GO-1) CONFIRM COUNT: PASS. 5 of 8 pilot seeds confirm (51312,
  51314, 51315, 51316, 51318) against the >= 3 bar.
- (GO-2) HAIRLINE-ONLY: PASS. Zero of the 5 confirming candidates
  is hairline-only under the prereg's exact definition (a single
  strict uplift under 5% with no second evening strictly above
  level). Every pilot confirmation window either never reaches
  the candidate level at all (51312, 51314, 51316, 51318) or, for
  51315, wiggles only BELOW the level (see below).
- Verdict: pilot GO. The confirm band runs.

CONFIRM (seeds 51319–51330, armed only, 30d competent, freshness
re-checked by seed-field scan immediately before the confirm sweep:
no 51319–51330 seed assignment existed anywhere on the lane):

- (c3-1) CONFIRM COUNT: PASS. 5 of 12 confirm seeds confirm
  (51319, 51320, 51324, 51326, 51328) against the >= 4 bar.
- (c3-2) HAIRLINE-ONLY: PASS. Zero of the 5 confirming candidates
  is hairline-only.
- Verdict: confirm GO.

COMBINED: 10 of 20 fresh seeds confirm, 0 hairline-only
confirmations across both bands. No re-scoring was done: no bar,
seed, leg, or rule definition was changed mid-run, and the
retrospective calibration below did not count toward any bar.

READ THE GO CORRECTLY (stated in the prereg before judging, repeated
here because it is easy to misread): this GO means tolerance
restores firing without resting on hairline shapes. It does NOT
mean the sensor is deployable. By the program's standing
false-fire definition (a confirmed fire on a survived seed), the
reported false-fire rates are 5/8 = 62.5% (pilot) and 5/12 = 41.7%
(confirm) — both above dipslide2's 25% cap, because every seed in
both bands survived. The prereg deliberately did NOT gate this arm
on the (p1) cap (on an all-survived band, >= 3/8 confirming already
implies >= 37.5% false-fire, so the two bars cannot both pass).
A landing arm would still have to re-judge false-fire — and, as
metric review (1) argues, to decide whether "survived slide" should
count as a false alarm at all.

## Per-seed fire tables (armed only, 30d competent window)

cand = candidate day under the TOLERANCE rule (first confirming
candidate), conf = confirmedDay, levelSD = level stand-down evening
(null = seed ends engaged), false = survived seed with a confirmed
fire in its final run (dipslide2 definition, reported), eligInRun
= eligible candidate days inside the final run, confAny = confirmed
day anywhere in the window under the tolerance rule (descriptive
only). Census validity: all 20 seeds valid (rows == daysAlive,
gateEngaged boolean on every row, zero null pantry rows). No seed
was excluded.

### Pilot band 51311–51318

| seed | end | days | cand (level) | conf | hairline | levelSD | false | eligInRun | restored | confAny | final run | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51311 | survived | 30 | — | — | — | — | no | 8, 9 | — | — | 1–30 | 2 |
| 51312 | survived | 30 | 9 (21,800) | 14 | no | — | yes | 9, 24 | — | 14 | 5–30 | 2 |
| 51313 | survived | 30 | — | — | — | — | no | — | — | — | 1–30 | 2 |
| 51314 | survived | 30 | 23 (12,250) | 28 | no | — | yes | 15, 16, 23–28 | — | 28 | 5–30 | 2 |
| 51315 | survived | 30 | 8 (22,500) | 13 | no | 22 | yes | 8, 9, 10, 14, 15, 16 | 10, 15 | 13 | 1–21 | 2 |
| 51316 | survived | 30 | 9 (21,250) | 14 | no | — | yes | 9, 10 | — | 14 | 1–30 | 2 |
| 51317 | survived | 30 | — | — | — | — | no | — | — | — | 1–30 | 1 |
| 51318 | survived | 30 | 9 (21,300) | 14 | no | — | yes | 9, 24, 25 | — | 14 | 1–30 | 2 |

### Confirm band 51319–51330

| seed | end | days | cand (level) | conf | hairline | levelSD | false | eligInRun | restored | confAny | final run | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51319 | survived | 30 | 8 (19,500) | 13 | no | — | yes | 8, 9, 22–25 | — | 13 | 1–30 | 2 |
| 51320 | survived | 30 | 9 (24,600) | 14 | no | — | yes | 9, 10, 11, 25–27 | 11 | 14 | 1–30 | 2 |
| 51321 | survived | 30 | — | — | — | — | no | — | — | — | 1–30 | 2 |
| 51322 | survived | 30 | — | — | — | — | no | — | — | — | 1–30 | 2 |
| 51323 | survived | 30 | — | — | — | — | no | — | — | 17 | 29–30 | 2 |
| 51324 | survived | 30 | 8 (21,350) | 13 | no | — | yes | 8, 9, 18, 19 | 9 | 13 | 1–30 | 2 |
| 51325 | survived | 30 | — | — | — | — | no | — | — | — | 1–30 | 1 |
| 51326 | survived | 30 | 19 (11,681) | 24 | no | — | yes | 11, 19–23 | 23 | 24 | 1–30 | 2 |
| 51327 | survived | 30 | — | — | — | — | no | — | — | 28 | 26–30 | 2 |
| 51328 | survived | 30 | 11 (16,271) | 16 | no | — | yes | 11–15, 17–20 | 19 | 16 | 1–30 | 2 |
| 51329 | survived | 30 | — | — | — | — | no | 13, 14 | — | — | 11–30 | 2 |
| 51330 | survived | 30 | — | — | — | — | no | — | — | — | 30–30 | 2 |

## The cases that matter

THE CLEAN CONFIRMATIONS (why GO-2 passes honestly). None of the
10 first-confirming windows reaches its candidate level at all,
except by below-level wiggles:

- 51312, candidate 9 (21,800): window 20,900 → 19,700 → 19,673 →
  19,131 → 18,777. Pure fall.
- 51314, candidate 23 (12,250): window 11,050 → 9,650 → 9,050 →
  7,750 → 5,573. Pure fall, the deepest slide in the run.
- 51315, candidate 8 (22,500): window 20,900 → 19,500 → 19,998 →
  18,100 → 16,650. The day-11 reading (19,998) rises from day 10
  but stays 2,502 BELOW the candidate level — a wiggle, not a
  recovery, and not a hairline shape at all (nothing crosses the
  level). Earliness note: this seed's final run ends day 21 with a
  level stand-down day 22, so its descriptive earliness is 9 — but
  the seed SURVIVED, so it is not collapse earliness and counts
  toward nothing.
- 51316, candidate 9 (21,250): window 19,700 → 19,700 → 20,960 →
  20,800 → 20,100. The day-12 reading (20,960) sits above the two
  prior evenings yet 290 below the candidate level.
- 51318, candidate 9 (21,300): window 21,203 → 20,850 → 20,650 →
  20,872 → 20,736. Same below-level wiggle shape.
- 51319, candidate 8 (19,500): window 19,476 → 18,928 → 18,450 →
  17,873 → 17,195. Pure fall.
- 51320, candidate 9 (24,600): window 21,450 → 20,500 → 20,500 →
  20,308 → 18,700. Pure fall.
- 51324, candidate 8 (21,350): window 20,267 → 20,294 → 19,500 →
  19,180 → 20,221. The endpoint itself rises from day 12 yet stays
  1,129 below the candidate level.
- 51326, candidate 19 (11,681): window 9,300 → 7,966 → 6,531 →
  6,300 → 6,396. The endpoint ticks up 96 kcal, far below level.
- 51328, candidate 11 (16,271): window 16,050 → 15,650 → 14,863 →
  13,650 → 13,050. Pure fall.

THE RESTORED SET (tolerance doing work, but never carrying the
verdict). Five seeds have later eligible candidates that confirm
under the tolerance rule but are rejected by the dipslide2 rule:
51315 (candidates 10, 15), 51320 (11), 51324 (9), 51326 (23),
51328 (19). These are the hairline-tolerated shapes the rule was
built to forgive — and in every case the seed ALREADY confirmed on
an earlier clean candidate, so no verdict rests on them. That
separation is exactly what GO-2 was designed to prove: tolerance
rescues bounce shapes downstream without letting a bounce BE the
confirmation.

THE REJECTED SET IS EMPTY BY CONSTRUCTION, AND THAT IS WORTH
SAYING. rejectedByTolerance is empty on all 20 seeds — not by luck
but by logic: the tolerance rule is a pure relaxation of (c). Any
candidate confirming under (c) (window max below the level)
automatically passes the tolerance test (no margin breach, no
sustained pair, endpoint below level). The tolerance rule can only
ADD confirmations relative to dipslide2, never remove one. Any
future arm that claims a tolerance-style rule "tightened" the
sensor should be asked to show its work against this inclusion.

THE NON-CONFIRMING SHAPES (the rule still saying no, correctly).
51311 is the mirror of the pilot's clean confirms: candidate 8
(22,900) has window 22,300 → 22,300 → 22,683 → 24,151 → 23,652 —
day 12 (24,151) is +5.46% above the candidate level, a margin
breach, and the pantry then climbs to 41,791 by day 30. Genuine
recovery, correctly no confirm under either rule. Candidates on
51329 (days 13, 14) and the anywhere-only confirms on 51323 (day
17) and 51327 (day 28) sit outside their seeds' final runs
(starting days 11, 29, and 26 after mid-window disengagements) —
final-run counting still doing its descriptive work: anywhere-
counting would give 12 confirms across both bands vs 10 in final
runs.

CALIBRATION (NOT a judged result — retrospective on the
already-judged dipslide2 pilot corpus, run AFTER the prereg commit,
exactly as dipslide2 did): the tolerance rule restores exactly one
confirmation on 51301–51308 — 51308, candidate 10 → confirmed 15,
flagged hairline-only, restored set [10] — and changes nothing else
(51301/51303/51305 anywhere-confirms unchanged; rejected set empty).
The design forgives precisely the hairline shape it was built for,
and the fresh bands then show the sensor does not NEED that shape
to fire: 10 clean first-confirmations, 0 hairline-only.

## Sense test (SENSE-TESTING LAW: read, don't just count)

On every confirming evening, the voice still says what it always
says while the total store falls: "checks the pantry before heading
out — the shelves are full, ~N days of fresh on hand… leaves the
harvest standing and turns to the water run instead. The pantry
can't take more; the wild will keep." The sharpest instance is
51326 on day 24: total store 6,396 kcal — the lowest confirming
endpoint in the run — while the voice reports "~5 days of fresh on
hand" and villagers wave off shares ("No more into the store — we
eat at the fire, and the shelves keep."). The fresh slice genuinely
looks healthy while the whole store slides; the level-vs-stock gap
every dipslide arm has diagnosed is unchanged, and a sensor firing
here would read to a player as a village noticing a slide its own
voice is not announcing. Whether that notice is a warning or a
false alarm is exactly the metric-review question (1) — the voice
cannot settle it, because the voice is the thing that stays quiet.
The transcripts themselves still read like people, not a census:
paired outings on 51319 day 13 ("Sinh walks out with Felipe.
'Nobody walks alone today.'"), and a teaching moment that catches
its own repetition twice on the same day ("Hold on — I already
showed you this one. White Oak Acorns. You remember." / "…
Hickory Nuts. You remember."). The known "pot stays full" prose
line did NOT reproduce in either band (0/20 seeds) — recorded only,
not re-litigated.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this sweep carries no such fields. NO wall
movement is claimed. In-window, combined bands: 20/20 survived 30
days (median 30, max 30); collapses 0/20; wave reach max 2 (18/20
seeds reach wave 2; wave 1 only on 51317 and 51325); waves 3–5 not
reached in 30 days (expected — early window). Arc II/III/IV,
regional → national, table, win flag: not reachable in this window,
not measured, not claimed. Collapse earliness remains UNJUDGED
(program-wide collapse supply: still n=1, the 51101 pilot case, across
all dipslide bands at 30d competent) — see metric review (4).

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the prior arms): this arm changes no
game code, runs no lever, and its primary metric is a
within-trajectory instrument comparison (sensor vs level rule on
identical evening pantry series), not a panel metric. The
level-vs-sensor tables above are reported directly, on identical
seeds and identical trajectories.

## Metric review

(1) THE FALSE-FIRE DEFINITION IS NOW THE PROGRAM'S OPEN QUESTION.
    This arm's GO (10 clean confirmations, 0 hairline-only) and the
    standing false-fire definition (survived seed + confirmed fire
    = false alarm) point in opposite directions: the sensor fires
    on genuine, clean, multi-evening slides — 51314 falls from
    12,250 to 5,573 — and every one of those villages survives the
    month. Either the sensor is crying wolf on survivable slides,
    or "a village slid and lived" is a true warning, not a false
    alarm, and the program has been scoring warnings as failures.
    This run does not resolve that — it was not designed to, and
    its verdict is not re-scored against the (p1) cap after the
    fact. The NEXT arm must pick a side in its prereg: keep
    survived= false (and then the sensor needs a collapse-predicting
    bar, not just a slide bar), or redefine a true positive as a
    genuine slide regardless of survival (and then collapse
    earliness becomes a separate, harder question). Until that
    choice is made, no sensor in this program can pass both a
    sensitivity bar and a false-fire bar on an all-survived band —
    the two bars are jointly unsatisfiable there, and this run
    proves it with numbers (5/8 and 5/12 confirming, 0 collapses).
(2) THE HAIRLINE-ONLY DEFINITION HAS A DISCLOSED GAP, STILL OPEN.
    The prereg's definition flags only exactly-one-above-level
    windows. Two separated sub-5% evenings (proof test 8) confirm
    and are NOT flagged. No such shape carried a verdict in this
    run (all 10 first-confirmations are clean), but a future band
    could produce one, and the definition would call it clean.
    The revision belongs in a next prereg: count total above-level
    evenings, or total sub-margin uplift mass, rather than
    exactly-one.
(3) THE TOLERANCE RULE'S ASYMMETRY IS NOW PROVEN, NOT ASSUMED.
    Tolerance is a pure relaxation of (c) (rejected set empty on
    20/20 seeds, and by the inclusion argument above). That means
    the program's sensor strictness now moves in only one direction
    per design change unless a future arm deliberately re-tightens
    something else (a magnitude floor, a steeper fall requirement).
    A future "stricter sensor" claim must name what it tightens,
    because tolerance alone cannot tighten.
(4) COLLAPSE SUPPLY IS STILL THE BINDING MEASUREMENT PROBLEM.
    0 collapses in 20 fresh seeds at 30d competent (combined
    program history at this horizon: 1 collapse in 40+ seeds).
    Collapse earliness has now been UNJUDGED on three consecutive
    sensor arms. Any future arm that wants earliness judged needs
    a collapse-bearing design (longer window, harder policy, or a
    band seeded to collapse) — each with its own selection-bias
    caveat, to be pre-registered, not improvised.
(5) FINAL-RUN COUNTING IS STILL LOAD-BEARING: anywhere-counting
    gives 12 vs 10 in final runs across both bands (51323, 51327
    anywhere-only). A future arm that changes the counting rule
    changes the verdict class entirely and must say so in its
    prereg.
(6) No metric, threshold, seed, or leg definition was changed
    mid-run. Prereg committed (9e987f519) before the judged sweeps;
    both sweeps ran only after the prereg commit; the verdict is
    judged only against its header. The confirm band's freshness
    was re-verified by seed-field scan immediately before the
    confirm sweep (no 51319–51330 assignment existed anywhere on
    the lane at that point).

## Village assessment (plain words)

Twenty fresh villages, and every single one survives the month —
but this time the sensor finally speaks, and it speaks cleanly.
On ten villages it catches a real slide: pantries falling evening
after evening, sometimes by more than half, with no bounce back to
where they started and no two evenings spent hovering at the old
level. None of those ten confirmations leans on a one-evening
wiggle — the tolerance rule forgives wiggles, but the villages
that fired did not need the forgiveness. The five villages that
did not fire either never slid in the sensor's sense at all, or —
like 51311 — genuinely climbed back, up past the old level and on
to a pantry twice as full by month's end. The uncomfortable part
is what the sensor's speech is worth: every village it warned
about lived anyway, so by the program's old scorecard all ten
warnings count as false alarms. Either the scorecard is wrong and
a slide survived is still a slide worth noticing, or the sensor
needs to learn the difference between sliding and dying — and
that is the next design's question, not this run's verdict. The
villages themselves sound alive throughout: people walking out in
pairs, teachers catching themselves repeating a lesson, fresh
shelves praised while the whole store quietly thins underneath.

## Findings for backlog (for the coordinator to append)

None appended by this arm, following the dipslide2 precedent: the
false-fire-definition question (metric review 1) and the
hairline-only gap (metric review 2) are this arm's metric review,
not new backlog items. The "pot stays full" line was already filed
by the depositgate arm and did NOT reproduce here (0/20).

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + ANALYZER-COMMIT INDEX CLOBBER (same known class,
  twice in this run): after each safe-commit the main index showed
  the committed files as staged deletions alongside untracked
  copies. Repaired both times via git update-index --add
  --cacheinfo from the HEAD blobs, then verified git status
  --short clean and worktree hashes match HEAD. Both commits
  themselves were correct throughout.
- SWEEPS CLEAN, FIRST TRY EVERY SEED: all 8 pilot seeds and all 12
  confirm seeds verified on first try (rows == daysAlive == 30
  each); no EPERM-flap retry was needed, no seed was re-run, no
  line was duplicated. The 1543Z EPERM flap did not recur in this
  run's window.
- FRESHNESS VERIFICATION: seed-field scan (parse every *.jsonl
  "seed" field), not bare-numeral grep — the only 513xx assignments
  before this run were 51301–51308, and the confirm re-check
  immediately before the confirm sweep found zero 51319–51330
  assignments. Confirm seeds 51319–51330 are now consumed by this
  run; 51331+ remain fresh (unverified for any specific band until
  a future arm checks).
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-dipslide3-b-prereg.md
  (commit 9e987f51976d5a90e818876c13dea0e9c5dd4983, before any
  judged sweep)
- Analyzer: scripts/analyze-dipslide3-b.js (imports the committed
  scripts/analyze-dipslide-b.js candidate helpers verbatim and
  scripts/analyze-dipslide2-b.js confirms2 for diagnostics; adds
  only the tolerance confirmation rule, the hairline-only flag,
  and the pilot/confirm bars)
- Proof test: scripts/test-dipslide3-b.js (34 pure checks, no
  judged seeds; --live mode intentionally omitted — retrospective
  calibration is reported above, labeled, and counts toward
  nothing)
- Evidence: evidence/2026-11-01/sim-dipslide3-b.md (this file)
- Corpora: evidence/2026-11-01/sim-dipslide3-b-pilot-armed.jsonl
  (8 lines, seeds 51311–51318, armed only),
  evidence/2026-11-01/sim-dipslide3-b-confirm-armed.jsonl
  (12 lines, seeds 51319–51330, armed only),
  evidence/2026-11-01/sim-dipslide3-b-corpus/
  sim-dipslide3-b-pilot-summary.json,
  sim-dipslide3-b-confirm-summary.json (full per-seed tolerance-rule
  analysis, pantry series, and sense lines for both bands)
- Reused verbatim, never edited: scripts/depositgate-b-driver.js,
  scripts/analyze-dipslide-b.js, scripts/analyze-dipslide2-b.js,
  scripts/policies/competent.js
- Consumed by this run (no longer fresh): pilot 51311–51318,
  confirm 51319–51330
