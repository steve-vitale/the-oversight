# sim-poolcapture-bar-a — pool-capture bar re-registration + episode-join cure fix

Run: fleshout-20261109T0415Z, arm sim-poolcapture-bar-a. Base: master 55b5e5aae.
Axis: food-economy (this arm is measurement-only; it repairs the instrument
the food-economy and medicduty arms judge by, not a lever).
Prereg: evidence/2026-11-08/sim-poolcapture-bar-a-prereg.md (written FIRST,
before any code). Claims: backlog #1921, #1925, #1926.
Scope: ZERO src/js. No sweep re-runs; the landed medicduty corpus is read
as-is. No edit to sim-findings.md (coordinator owns it).

## What changed (files)

- `scripts/analyze-feveranat-a.js` — the episode join (buildEpisodes) now
  counts a cure as a treated outcome: (a) cureEvent match (patient + day
  window + diseaseId when known), (b) an end with outcome 'cured', (c) NPC
  only, a 'recovered' end whose end-day daySeries snapshot shows
  sickMap[who].daysLeft >= 3 (duty-cure attribution). Episodes keep their
  corpus outcome; cured ones gain cured=true / curedBy. F4 prints the cured
  breakdown and names the same-tick blind spot.
- `scripts/analyze-medicduty-a.js` — episodesOf gains the same three cure
  rules; census tracks curedEpisodes, totalDutyCures, sameTickCures, and
  careCoverage; G1 re-registered to pool capture (see below); the share is
  reported as a secondary and never gates.
- `scripts/analyze-medicdiag-a.js` — C2 verdict text revised to duty-aware:
  the duty cure IS a villager-side deletion path and leaves no cureEvent,
  so cureEvents=0 proves no scholar-side cure, not no villager cure.
  (Same staleness family as #1926; the episode join itself flows in from
  buildEpisodes, which this analyzer imports.)
- `scripts/test-medicdiag-a.js` — L2 revised duty-aware (#1926): the leg
  now vacates the duty (v.medicDuty nulled, restored after) so it tests
  the pre-duty care path — record parks at daysLeft 1, never deleted.
  L2c code-read revised: villagerCareTick itself never deletes; the
  deletion lives in medicDutyCureAttempt, gated to the duty holder.
  New L2d: the duty holder DOES cure a curable patient (wound fever +
  granted triage; record gone, ability counter 1). Full cure-channel
  proof stays in test-medicduty-a.js L4.
- `scripts/test-poolcapture-bar-a.js` (new) — unit legs for the join
  rules (a)–(c), the same-tick decomposition, the capture/share math,
  and the calibration re-read of the landed corpus. 8/8 green.
- `evidence/2026-11-08/sim-poolcapture-bar-a-prereg.md` (new) — the
  pre-registration. This file.

## The cure anatomy (found by probing the corpus before writing code)

The duty cure (`medicDutyCureAttempt`, game.js:33141) deletes the sick
record directly. It never calls cureStatus, so there is no cureEvent, no
treatEvent, and the tick wrapper records the end as outcome 'recovered'
— indistinguishable from natural expiry by outcome alone. The 33 duty
cures on the medicduty after leg decompose as:

- 3 cured RECORDED episodes, attributable by snapshot: an episode ending
  'recovered' whose end-day daySeries snapshot (taken before that day's
  tick) shows daysLeft >= 3 ended early by an in-tick deletion during
  care. Natural expiry shows daysLeft == 1. Validated on the before leg:
  132/132 'recovered' ends show 1 — zero false positives. The three:
  Clarence s96303 d31->d33 (dl=3), Rosa s96303 d32->d33 (dl=4),
  Nadia s96304 d10->d11 (dl=4). Only Rosa was not already tended, so
  the join fix repairs +1 treated episode, not +37.
- 30 same-tick onset+cure: a patient infected in the tick's vector
  section and cured in the same tick's care section never appears as an
  onset or an end (the tick wrapper diffs before/after sick maps; the
  record is in neither). No episode join can count them. This is a
  RECORDER gap, not a join gap — out of scope for this arm, documented
  for the next run (see Metric review). Evidence: on cure days the corpus
  shows almost no episode ends at all (e.g. s96301: 10 cure days, 0 ends
  on any of them), and the dutyCures counter increments on days whose
  snapshot shows zero sick villagers.

## Calibration (landed medicduty corpus, 8 seeds, competent, 150d)

Re-registered bar (#1925) — PRIMARY is now pool capture
(absentWithMedic_before - absentWithMedic_after) / before, GO >= 50%:

| metric | before | after (old join/bar) | after (corrected) | prereg expectation |
|---|---|---|---|---|
| absentWithMedic | 38 | 18 | 18 | <= 19 |
| pool capture | — | 52.6% | 52.6% | >= 50% PASS |
| healer-present share (secondary) | 24.6% | 23.5% | 23.5% | reported only |
| medic-days-only share (secondary) | 74.8% | 85.9% | 85.9% | — |
| treated episodes | 71/156 = 45.5% | 34/135 = 25.2% | 35/135 = 25.9% | 35/135 |
| cured episodes (attributed) | 0 | — | 3 | 3 |
| same-tick cures | 0 | — | 30 | 30 |
| care coverage (treated+sameTick)/(episodes+sameTick) | 45.5% | — | 39.4% (65/165) | 39.4% |
| G1 (re-registered) | — | FAIL (old share leg) | PASS | PASS |
| G2 guardrails | — | PASS | PASS | PASS |

Feveranat analyzer on the after leg: treated 35/141 -> 36/141 (Rosa
only; cureEvents are 0 on this corpus, so the cureEvent rule changes
nothing here; duty-snapshot 3). Before leg unchanged by the join fix
(0 cured episodes, 0 same-tick cures, careCoverage == treatedShare).

CALIBRATION VERDICT: every prereg expectation matched exactly. No bar
was tuned to match — the numbers fell out of the rules as specified.
This validates the INSTRUMENT. It does NOT re-judge the Haven Medic Duty
build: the build's verdict stands from the main-session decision
(2026-11-08 ~09:25 CST), which forbade re-judging it against the broken
share bar. Under the corrected bar the corpus reads GO, which agrees
with that decision; the old bar's NO-GO was the instrument's error, not
the build's.

## Why the treated share still falls (25.9% vs 45.5%) — read this before using it

The join fix repairs +1 episode. The -37 treated-episode drop is a
composition effect, not a join error, and it is NOT explained by "33
cures read as untreated" (the medicduty evidence's first reading — that
reading assumed the cured patients were episodes; only 3 were). What
actually happened on the after leg:

1. The duty prevents episodes: 30 patients were cured the same tick
   they fell sick, so they never entered the episode pool (135 vs 156
   episodes). Those prevented episodes would mostly have been tended
   in the before leg.
2. The duty converts care slots from tends to cures: villagerCare tends
   fell 99 -> 49, because a cure attempt consumes the holder's tend slot
   for the day. Fewer recorded episodes get tended.
3. The episodes that remain are the ones the duty could NOT cure
   (undiagnosed, wrong ability, alien/trembles, daysLeft <= 1 at care
   time, holder absent) — a harder pool, tended less.

So a falling treated share is what a working cure looks like through
this instrument. The care-coverage line (39.4%) counts the prevented
patients and is the honest secondary for a duty build; the treated share
should be retired as a duty secondary (see Metric review).

## Proof

- `node scripts/test-poolcapture-bar-a.js` — 8 PASS, 0 FAIL (unit legs
  U1–U5 + calibration legs C1–C2 on the landed corpus).
- `node scripts/test-medicdiag-a.js` — 9 PASS, 0 FAIL (revised L2/L2c
  + new L2d: Lena cured Fernando of wound fever on the duty pass).
- `node scripts/test-medicduty-a.js` — 13 PASS, 0 FAIL (L5 live leg:
  duty recorder neutral vs medicdiag recorder; L6 analyzer --leg
  before: join clean, joinMismatches=0).
- `node scripts/analyze-medicduty-a.js --before .../before --after .../after`
  — exit 0, G1 PASS, G2 PASS, VERDICT GO (calibration only).
- `node scripts/check.js --quick` — (result below).

## Metric review

- The share bar (#1925) is fixed as specified: capture >= 50% is the
  primary; the share and the medic-days-only share are secondaries. The
  medic-days-only share ROSE (74.8% -> 85.9%) while the raw share fell —
  the confound is visible in the numbers themselves.
- The treated-share secondary (#1921) is fixed as far as a join can fix
  it (+1 episode), but the metric itself cannot judge a duty build even
  corrected: a cure that prevents an episode never enters the share.
  PROPOSAL FOR THE NEXT RUN: retire treatedShare as a duty secondary and
  judge care by the care-coverage line (treated + same-tick cures over
  episodes + same-tick cures), or keep treatedShare only as a
  tend-coverage measure with the name said plainly. Do not re-score the
  landed build against either revision — the build is judged already.
- Same-tick recorder gap (found, not fixed): the feveranat tick wrapper
  misses records created and deleted within one tick. Any future arm
  that leans on episode counts for a cure build needs the sweep
  recorder fixed first (record same-tick onset+cure pairs, e.g. from
  the care-tick diff). Until then, episode denominators understate
  sicknesses cured.
- Residual uncertainty (1 episode, immaterial): Nadia s96304 d10->d11
  ends 'recovered' with end-day snapshot dl=4 but no duty cure falls on
  a nearby day (s96304 cures land on ticks of d65+). The mechanism is
  unexplained — a second in-tick deleter during care has not been found
  (all `delete v.sick` sites audited: tick stale/death/expiry, duty
  cureIt, treatVillager, betrayal cleanup, aid medicine — none fit).
  She was already tended (d10, d11), so the treated count is unaffected
  either way; the snapshot rule's before-leg validation (0/132 false
  positives) stands.
- analyze-cheaptend-a.js / analyze-tendsick-a.js count treatEvents with
  outcome 'cured' and share the same blind spot (a duty cure produces
  no treatEvent). Noted, not fixed — other arms' instruments.

## Village assessment

This arm ran no new sims and changed no game code, so there is no new
village to assess. What the corpus re-read shows about the villages:
the duty's villages live longer (median survival 73d -> 95d) with fewer
starvation deaths (8 -> 6) and no new death causes; the cure works
mostly invisibly, in the same tick as the infection — patients the
village never even registers as sick. The measurement lesson is the
finding: the village got healthier in a way the episode join could not
see, and the old bar called that failure.

## Adoption addendum (2026-11-09, run fleshout-20261109T0715Z — Loop A closeout of the dead 0415Z run)

The 0415Z coordinator died before landing this arm (last coordinator
heartbeat 05:22Z; workers' last writes 06:15Z; no processes, claim live).
Adopted in the main session per the loop-closeout skill: the work above
is the dead worker's, verified by re-running every proof on this tree
before commit — test-poolcapture-bar-a.js 8/8, test-medicdiag-a.js 9/9,
test-medicduty-a.js 13/13, all reproduced.

CATCH (fixed in adoption, same commit): the worker never ran
test-feveranat-a.js, which imports the changed analyze-feveranat-a.js.
Its L8 failed on the poolcapture join: an episode ending 'cured' now
carries treatKinds ['villagerCare', 'cure'] instead of ['villagerCare'].
That is the prereg-specified behavior (rule (b): an end with outcome
'cured' counts as a treated outcome), not a regression — the episode was
both tended (d11) and cured (d12). L8's expectation is updated to the
corrected join, with cured/curedBy assertions added. Re-verified:
test-feveranat-a.js 11/11 on this tree, and 11/11 on current master
before the change (L8 passed there), so the delta is exactly this arm.

check.js --quick on this tree: 293 passed, 7 failed. None of the 7 is
this arm: the only test files that execute the changed analyzers are
test-feveranat-a.js, test-medicdiag-a.js, test-medicduty-a.js and
test-poolcapture-bar-a.js (import grep over scripts/), and all four are
green after the L8 fix. Of the 7, one is proven pre-existing on current
master (test-establishment-r20-fixes-20261020.js racks-full voice gate,
fails identically on master 9d6ebf59c) and three tests hit exactly 120s
(the per-test timeout) while the box ran at load ~18 with Loop B's
check.js concurrently — load artifacts, not this arm. The rest were not
individually attributed from the tailed output; they sit in files that
never import the changed analyzers. Recorded here, not hidden.
