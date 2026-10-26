# sim-throttledays-b — drain-days vs need-days on garden throttle days (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, axis food-economy. Measurement only: zero
src/js changes, no default flips. This arm answers the design question
left open by sim-freshdays-b, in tracker order after the stockSurplus
door: should the garden production throttle key on drain-days or on
need-days? Throttle garden-branch intent is Steve's call — this arm
MEASURES, it does not decide it.

Pre-registration (written BEFORE any new sweep or analysis):
evidence/2026-10-26/sim-throttledays-b-prereg.md. Judged ONLY against it.

## Definitions (as pre-registered, from code + prior evidence)
- DRAIN-DAYS = Game.pantryFreshDays() at garden-resolution entry:
  pantryFreshKcal / mean of positive village burnHistory entries
  (rolling 7-day honest net), fallback roster x 2000 pre-endDay.
- NEED-DAYS = the SAME pantryFreshKcal / (roster x 2000) at the same
  entry — the freshdays arm's "fallbackDays", computed at resolution
  entry. Only the denominator changes.
- PLENTY (primary) = days > 4 on each clock — the throttle's own bar
  (game.js prodThrottleEngaged: pantryFreshDays() > 4, subject to the
  hungryStreak >= 3 exemption, which the recorder also stores).
- Sensitivity: need-plenty at need-days > 1 and > 2 (reported, not
  judged). The freshdays "under 700 fresh kcal" note grounds the
  contrast: 4 drain-days at a 171-kcal burn is ~684 kcal, while 4
  need-days for a 9-person roster is 72,000 kcal.

## Band and instrument
- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off. Seeds 9760-9767,
  100d, death-aware. This 8-seed band IS the pilot (per the brief); no
  confirm band was spent, because coverage did not fail.
- Instrument (DIAG only): scripts/inflow-capture.js + scripts/
  garden-capture.js reused UNCHANGED, plus the NEW scripts/
  throttledays-capture.js installed AFTER garden-capture, which wraps
  resolveOneAssignment a further time and records, at entry to every
  garden resolution, the throttle flag, hungryStreak, hunger-exempt
  flag, freshKcal, freshDays, burnMean, burnN, roster, needDays,
  totalKcal, and the fallback flag. No Game.state write, no RNG use,
  no say/log write. It does NOT modify garden-capture, inflow-capture,
  or any sibling file, and touches nothing named *stockdoor*.
- Corpus: evidence/2026-10-26/sim-throttledays-b-corpus/ (8 per-seed
  JSONs). Scripts: scripts/sweep-throttledays-b.js,
  scripts/throttledays-capture.js, scripts/analyze-throttledays-b.js.
  Proof: scripts/test-throttledays-b.js (green, exit 0 — see below).
- Canon read: docs/CANON.md + docs/GARDENS.md + docs/PRESERVATION.md
  (ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d). Nothing invented.

## Reproduction: the gardenbar band, reproduced
All six gardenbar trajectory counts reproduce EXACTLY, so the band is
"the gardenbar band, reproduced", not a fresh band: 761 garden
resolutions, 750 engaged (98.6%), 11 NPC sows, 3,167 keeper turns,
32 beds, 235 player sows. The throttle-flag cross-check agrees on all
761 resolutions (my flag, read just before garden-capture's, vs its
flag: 0 mismatches), and the drain-days rebuild from components
(freshKcal / burnMean) matches the reported value on all 761 checked
resolutions (0 beyond 1%, max rel diff 0.000%).

## Verdict against the pre-registered bar: GO (measurement GO)
| measure | result | bar |
|---------|--------|-----|
| Coverage, resolutions with BOTH denominators | 750/750 = 100.0% | >= 95% ✓ |
| Coverage, engagement days with BOTH denominators | 750/750 = 100.0% | >= 95% ✓ |
| Disagreement share reported (primary + sensitivities) | yes (below) | required ✓ |

The disagreement share itself carries no pass/fail bar in the
pre-registration: whatever it is, it IS the answer. It is 91.6%.

## The answer in numbers
On 687 of 750 throttle firings (91.6%), the two clocks disagreed about
"plenty": the drain clock said plenty (drain-days > 4, which is what
firing means) while the need clock said scarce (need-days <= 4). Each
firing day carries exactly one engaged resolution (750 engagement days
= 750 engaged resolutions; 0 multi-engaged days), so the day share and
the resolution share are the same 91.6%.

| figure at engaged resolutions | value |
|-------------------------------|-------|
| drain-days (median) | 25.5 days (p25 15.3, p75 46.3, max 242.9) |
| need-days (median) | 1.49 days (p25 1.02, p75 2.12, max 5.12) |
| freshKcal (median) | 32,968 kcal (p25 21,868, p75 44,805, max 102,414, min 2,365) |
| roster (mean) | 10.47 people (range 6-12) |
| fallback (no positive burn history) | 0/750 — no drain==need-by-construction inflation |
| engaged with drain-days <= 4 (anomaly) | 0 |

Sensitivity (disagreement at other need-plenty bars):
- need-days > 2 as "plenty": disagreement 70.8% (531/750).
- need-days > 1 as "plenty": disagreement 23.9% (179/750) — even
  against a bar of ONE full day of food, nearly a quarter of firings
  happened while the village held less than a day's need.

Reverse disagreement (the other direction): 0/11. All 11 non-engaged
resolutions are drain-scarce AND need-scarce (seed 9763, days 25-33
and 40-41, pantry 1,000-5,485 kcal, need-days 0.06-0.30) — and those
11 days are exactly the 11 NPC-sow days. There were 0 hunger-exempt
stand-downs (drain > 4 with hungryStreak >= 3) on this band. So the
clocks never disagree in the reverse direction here: whenever the
throttle stood down, the pantry was genuinely near-empty on both
clocks, and that is precisely when NPC duty sowed.

Per-seed (engaged / disagreement / median need-days / median freshKcal):
| seed | engaged | disagree | median need | median kcal | median drain |
|------|---------|----------|-------------|-------------|--------------|
| 9760 | 85 | 85 (100.0%) | 1.26 | 30,297 | 24.7 |
| 9761 | 96 | 96 (100.0%) | 1.54 | 32,950 | 20.4 |
| 9762 | 99 | 36 (36.4%) | 4.34 | 89,967 | 42.5 |
| 9763 | 78 | 78 (100.0%) | 0.85 | 16,196 | 35.1 |
| 9764 | 99 | 99 (100.0%) | 2.03 | 44,608 | 96.5 |
| 9765 | 99 | 99 (100.0%) | 1.08 | 24,250 | 12.3 |
| 9766 | 98 | 98 (100.0%) | 0.96 | 17,310 | 52.9 |
| 9767 | 96 | 96 (100.0%) | 2.25 | 38,522 | 19.5 |

Seed 9762 is the exception that proves the mechanism: it is the one
seed whose pantry genuinely holds a large stockpile (median ~90,000
fresh kcal), and it is the one seed where the clocks mostly agree
(only 36.4% disagreement). On the other seven seeds the throttle
fired on every engaged day while the village held at most 4
need-days — on six of them, at a median of roughly 1-2 need-days.

## What this means, in plain words
The throttle's "4 days" is measured on a clock that runs slow
whenever the village eats mostly around its pantry. A village that
draws little from the pantry reads as holding weeks of food, so the
throttle stands its gardeners down to weeding — even on days when
the same pantry holds barely a day or two of food for everyone in
it. The gardenbar finding (throttle on 98.6% of resolutions, NPC sows
down to 11) is not a separate mystery from the freshdays finding
(drain-days, not survival days): it is the same number doing the
work. When the pantry truly empties — seed 9763's 11 days — the
throttle lifts on both clocks at once, and NPC duty sows on every
one of those days. The throttle is not misfiring randomly; it is
firing exactly as its drain-day definition says, and that definition
is what makes it fire on pantries holding ~33,000 kcal for ~10
people.

## STEVE-CALL item (plainly, with the numbers — not this arm's ruling)
Whether the garden throttle should key on drain-days or on need-days
is Steve's design call. The measured consequences of each keying, at
the same > 4 bar on this band, are:
- Drain-keying (current): the throttle fires on 750/750 engaged
  resolutions; on 687 of them (91.6%) the village holds <= 4
  need-days of fresh food, and on 179 of them (23.9%) it holds <= 1
  need-day.
- Need-keying (same > 4 bar, same numerator): the throttle would
  have fired on only 63 of the 750 engaged resolutions (the ones
  with need-days > 4); the other 687 firings would not have fired,
  and NPC garden duty on those days would have run its unthrottled
  branch (sow/harvest) instead of weeding.
- Reverse direction: need-keying would not have stood the throttle
  down anywhere drain-keying fired it up on this band (0 reverse
  disagreements), and the 11 genuinely-empty days would still
  stand the throttle down under either keying.
No keying change is recommended here and none was made: this arm
flips no defaults and changes no game code.

## Sense transcripts (SENSE-TESTING LAW — meaning, not just counts)
Seed 9760, day 8 — Rosa's throttle day, read in full:
- Spoken: "🌱 Rosa waters and weeds the beds before taking up other
  work. The harvest can wait."
- That day's numbers at resolution entry: freshKcal 20,500,
  drain-days 5.81, burnMean 3,530 kcal/day, roster 12, need-days
  0.85. Hunger exemption off (hungryStreak 0).
- Judgment: the line is honest about what Rosa does (maintenance,
  not food work), and it names the mechanism plainly ("the harvest
  can wait"). What reads odd against the numbers is the "can wait"
  itself: the village she is weeding for holds less than one full
  day of food for its 12 people. A villager with eyes on a pantry
  holding 0.85 days of food would not say the harvest can wait —
  she would say it because the drain gauge tells her the pantry
  holds nearly six days. The voice is faithful to the function and
  unfaithful to the pantry, exactly as freshdays found for the
  "250 days" line. The same day's other lines are coherent: the
  player sows Blackberry ("180 days to first harvest"), Kwame is
  named as the next keeper, Green Thumb is granted — the village
  reads like people doing their rounds while the gauge misleads
  them about how much food they have.

## Village assessment
What the village looked like: on all 8 seeds, villages that survived
the full 100 days (no village lost on this band) living around
pantries that read as full on the drain gauge — foraging, depositing
scholar hauls, and standing garden duty down to weeding on 98.6% of
garden resolutions. Seed 9766 is still the never-sown village from
gardenbar (98 engaged resolutions, 0 NPC sows, beds built but
nothing planted); seed 9763 is the counter-example where a real
empty pantry let NPC duty sow 11 times.

Who thrived and died and why: 18 deaths across 8 seeds, none of them
starvation (same cause shape as gardenbar): the arena 6, monster 4,
ambush 2, dehydration 2, a wound that wouldn't close 1, the
expedition 1, "big ugly" 1, "extended warranty" 1. Per seed: 9760: 0,
9761: 2, 9762: 2, 9763: 3, 9764: 1, 9765: 1, 9766: 5, 9767: 4. The
deaths are contest/arena/monster-shaped, not pantry-shaped — the
throttle question is about garden contribution, not survival on
this band.

What knowledge/capabilities were missing: nothing in this arm's
scope — the blank was the denominator question, and it is now
filled with numbers on both clocks for every firing day. The
remaining gap is the design ruling itself (steve-call item above).

Blanks filled: (1) every throttle-engagement day on the gardenbar
band now carries BOTH denominators, computed at the same moment
from the same numerator (100% coverage, 0 flag mismatches, 0
rebuild errors); (2) the disagreement share at the throttle's own
bar (91.6%) and at 1- and 2-day need bars (23.9%, 70.8%); (3) the
reverse direction is empty (0/11) and the 11 unthrottled days are
exactly the 11 NPC-sow days — closing the loop between the
gardenbar finding and the throttle mechanism.
Documented, not fixed: no game-code change was made (DIAG only),
and no prior evidence needs numeric revision — gardenbar's 98.6%
and freshdays' 2.4-day equivalent both reproduce exactly.

## Wall numbers (this band, competent-nofeast, seeds 9760-9767)
National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9760: 3, 9761: 2, 9762: 2, 9763: 2, 9764: 2, 9765: 3, 9766: 3,
9767: 3. Median survival: 100d (censored at the 100d horizon; all 8
seeds survived to day 100). Rank stayed village on all 8 seeds. Arc
II/III/IV and regional-stage reach are not recorded in this corpus
and are not estimated here. The scale wall stands on this band;
this arm closes a measurement-meaning blank, it does not move the
wall numbers.

## Metric review (MEASUREMENT.md section 14)
- The pre-registered metric worked as written: coverage is 100% on
  both units, and the disagreement share is reported at the primary
  bar and both sensitivities. One respect in which the bar was
  easy: coverage is 100% by construction once the recorder reads
  both functions at entry (a null would require a throwing read),
  so the bar's real work was forcing the recorder to exist and the
  cross-checks (flag agreement, drain rebuild) to run. A future run
  reusing this metric should pre-register a bar on the disagreement
  share itself if it wants a miss to be possible.
- "Engagement day" needed no first-vs-any adjudication: every
  engagement day carries exactly one engaged resolution, so the day
  share equals the resolution share and the first-vs-any sensitivity
  is 0 days. On a band with busier garden duty (multiple keepers or
  assignments per day), the day rollup rule in the pre-registration
  would matter; here it is vacuous, and that is reported, not
  assumed.
- The fallback share is 0, which removes a subtle threat: had burn
  history been empty on firing days, drain-days would have equalled
  need-days by construction and agreement would have been inflated.
  No such day exists in this corpus.
- No revision is proposed for THIS metric: it answered its question.
  For a future run that wants the keying decision tested rather
  than measured: run the band with the throttle keyed on need-days
  (a game-code arm, Steve's call first) and report NPC sows,
  harvests, and pantry trajectories against this band's 750-firing
  baseline.

## Out-of-arm observations (for the coordinator's sim-findings backlog;
not chased, not edited into the backlog from this worktree)
- Seed 9762's pantry (median ~90,000 fresh kcal at engaged
  resolutions) is the only seed where the clocks mostly agree —
  a future pantry-composition arm could ask what 9762 stocks that
  the other seeds don't, since it is the one seed where the
  throttle's drain reading and the village's real stockpile line up.
- Total-pantry need-days (including preserved/rendered) were
  recorded per resolution but not used in the disagreement
  computation. They do not rescue the picture: median total-pantry
  need-days at engaged resolutions is 2.98 days (p25 1.63, p75 4.11)
  vs median fresh need-days 1.49 — preserved stock adds roughly
  27,000 kcal at the median (median totalKcal 59,991 vs median
  freshKcal 32,973), but the whole pantry still holds under 3
  need-days on the median firing day. (Evidence: throttledays corpus
  totalKcal / totalNeedDays per resolution.)

## Reproduction check (this run)
- Sweep scripts/sweep-throttledays-b.js ran 8 seeds, 100d,
  competent-nofeast, in ~13s of sim time per the per-seed ms
  figures (plus container overhead); corpus at
  evidence/2026-10-26/sim-throttledays-b-corpus/ (8 files, pure JSON).
- Analyzer scripts/analyze-throttledays-b.js prints reproduction,
  coverage, disagreement, secondaries, and wall numbers.
- Proof scripts/test-throttledays-b.js green in this worktree, exit
  0: unit need-days definition (2.3715 vs freshdays 2.4), corpus
  validity (8 seeds, policy fields, throttle records), coverage
  >= 95% on both units (observed 100.0%), flag agreement
  (0 mismatches / 761), no drain anomaly (0), disagreement shares
  printed, reproduction exact (761/750/11/3167/32/235), and
  determinism (fresh seed-9760 re-run reproduces all 85
  resolutions and all engaged (day, freshKcal, freshDays, needDays)
  tuples identically). No jest was run (nothing to test in jest —
  the proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- No game-code change: zero src/js files touched. Files in this
  commit: scripts/throttledays-capture.js,
  scripts/sweep-throttledays-b.js, scripts/analyze-throttledays-b.js,
  scripts/test-throttledays-b.js,
  evidence/2026-10-26/sim-throttledays-b-prereg.md,
  evidence/2026-10-26/sim-throttledays-b.md, and the 8 corpus files.

## Verdict (judged against the pre-registered bar, not re-scored): GO
Coverage 100.0% on both units (>= 95%), disagreement share reported
at primary and sensitivity thresholds: day disagreement 91.6% at
need-days > 4 (687/750), 70.8% at > 2, 23.9% at > 1. The design
question is answered with numbers; the keying decision itself is
Steve's call (see steve-call item above).
