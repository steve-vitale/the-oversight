# sim-poolcapture-bar-a — PRE-REGISTRATION (measurement-only, ZERO src/js)

Run: fleshout-20261109T0415Z, arm sim-poolcapture-bar-a. Base: master 55b5e5aae.
Claims: backlog #1921, #1925, #1926 (claimed by this run).
Scope: re-register the pool-capture bar, fix the episode join so a cure counts
as a treated outcome, revise the stale medicdiag L2. This arm does NOT
re-judge the landed Haven Medic Duty build — the main-session decision
(2026-11-08 ~09:25 CST) forbids re-judging it against the broken share bar.
The corpus re-read below is CALIBRATION ONLY: it checks that the
re-registered bar and the corrected join reproduce the expected numbers on
the known medicduty corpus. The build's verdict stands from the main-session
decision; this arm only repairs the instrument.

## Background (established from the corpus, before this arm writes code)

- sim-medicduty-a corpus: evidence/2026-11-08/medicduty-a-corpus/{before,after},
  8 seeds (96301–96308), competent policy, 150d. Old-bar numbers (analyzer
  as landed): before present=113 absent=346 share=24.6% absentWithMedic=38;
  after present=110 absent=358 share=23.5% absentWithMedic=18;
  treated 71/156=45.5% -> 34/135=25.2%; duty cures 33 (ability 33, medicine 0);
  cureEvents 0 on both legs (the duty cure never calls cureStatus).
- #1925 (share bar confounded by survival): the duty extends village life
  (median survival 73d -> 95d, village-days 681 -> 739) and the added days
  are mostly no-medic days (4/8 seeds never have a medic), so the
  present-share falls (24.6% -> 23.5%) even as the duty works. The old G1
  (share >= 30% AND absentWithMedic <= 19) fails on the share leg alone.
- #1921 (treated-share taxonomy artifact): the episode join counts an episode
  "treated" only on a villagerCare tend event. A duty cure DELETES the record
  (`delete v.sick[pid]` in medicDutyCureAttempt, game.js:33141) — it is not
  a tend event, produces no cureEvent (cureStatus is never called), and the
  tick wrapper records the end as outcome 'recovered'. Cured episodes read
  as untreated.
- Cure anatomy found by this arm (probe, before writing code):
  - 33 duty cures decompose as 3 cured RECORDED episodes + 30 same-tick
    onset+cure (a patient infected in the tick's vector section and cured
    in the same tick's care section never appears as an onset or an end —
    the tick wrapper diffs before/after maps, and the record exists in
    neither). The 30 are invisible to ANY episode join: a RECORDER gap,
    not a join gap. The join fix cannot recover them; they are reported
    separately (see care-coverage line below).
  - The 3 recorded cured episodes are attributable by snapshot:
    an episode ending 'recovered' whose end-day daySeries snapshot shows
    daysLeft >= 3 ended early by an in-tick deletion during care — the
    duty cure is the only such path in code (treatVillager ends read
    'cured'; aid-medicine cures happen outside the tick and leave no end;
    natural expiry shows daysLeft == 1 on the end-day snapshot).
    Validated: before leg 132/132 'recovered' ends show daysLeft == 1
    (zero false positives); after leg 3 show >= 3 (Clarence s96303
    d31->d33 dl=3, Rosa s96303 d32->d33 dl=4, Nadia s96304 d10->d11 dl=4).
    Of the 3, Clarence and Nadia were already tended; only Rosa is newly
    treated. Residual: Nadia's d11 end has no cure on a nearby duty day
    (s96304 cures fall on ticks of d65+); mechanism unexplained, effect
    nil (she was already tended). Recorded here, not hidden.
  - Threshold is daysLeft >= 3 (not >= 2): the cure candidate filter
    requires daysLeft > 1 AFTER that day's decrement, and the snapshot is
    taken BEFORE the decrement, so a curable record shows >= 3.

## 1. The re-registered bar (#1925)

PRIMARY (pool capture, replaces the share leg): absent-with-medic pool
capture fraction = (absentWithMedic_before - absentWithMedic_after) /
absentWithMedic_before, GO iff >= 50%. On the medicduty corpus that is
absentWithMedic <= 19 (before 38). The old share >= 30% leg is REMOVED
from G1 and demoted to secondary reporting.
SECONDARY (reported, never gating): healer-present share (as before) AND
the medic-days-only share = present / (present + absentWithMedic), i.e.
the share of sick-days on days when a roster medic exists.
GUARDRAILS (G2, unchanged): median survival >= 0.8x before; starvation
<= before+2; no new death cause >= 2; produced/need >= before-0.03.
Calibration expectation: capture (38-18)/38 = 52.6% >= 50% PASS;
medic-days-only share 74.8% (113/151) -> 85.9% (110/128). If the
calibration does NOT match, say so plainly — do not tune the bar to match.

## 2. The join fix (#1921)

An episode counts as treated when ANY of these holds (all three analyzers
that build episodes share buildEpisodes; analyze-medicduty-a.js adds the
same-tick line on top):
- (a) a villagerCare tend lands in [onsetDay, endDay] (existing rule);
- (b) a cureEvent matches: same patient (target == who; 'scholar' for the
  scholar), day in [onsetDay, endDay], diseaseId matches when both are
  known (scholar episodes always; NPC food-name episodes have null
  diseaseId and match on who+day only);
- (c) the episode's end outcome is 'cured' (treatVillager path);
- (d) the episode ends 'recovered' AND its end-day daySeries snapshot
  shows sickMap[who].daysLeft >= 3 (duty-cure attribution; see anatomy
  above). The episode keeps outcome 'recovered' (the corpus fact); it
  gains cured=true, treatKind 'cure', curedBy='duty-snapshot'.
Calibration expectation: medicduty treated 34/135 -> 35/135 = 25.9%
(only Rosa is newly treated). The fix repairs +1 episode, NOT +37:
the -37 drop is a composition effect (30 prevented episodes + care slots
spent on cures instead of tends, 99 -> 49 tends), not a join error.
NEW SECONDARY (medicduty analyzer only): care coverage =
(treated_corrected + sameTickCures) / (episodes + sameTickCures), where
sameTickCures = totalDutyCures - attributedCuredEpisodes (33 - 3 = 30).
Calibration expectation: (35 + 30) / (135 + 30) = 65/165 = 39.4%.
This line counts patients cured before an episode was ever recorded; it
is reported alongside treatedShare, never replacing it.
Also fixed in passing (same staleness family, same files): the C2 verdict
text in analyze-medicdiag-a.js, which claims no villager-side code path
deletes a v.sick record — the duty cure is such a path. And the F4 note
in analyze-feveranat-a.js naming the duty-cure blind spot of the
feveranat-only join (no duty corpus there, so no same-tick line).
OUT OF SCOPE: the same-tick recorder gap (the tick wrapper missing
records created and deleted within one tick) — a sweep-recorder fix for
a future run, documented in the evidence, not attempted here. The
treatEvents-outcome counters in analyze-cheaptend-a.js /
analyze-tendsick-a.js share the same blind spot (no treatEvent exists
for a duty cure); noted, not fixed — other arms' instruments.

## 3. The L2 revision (#1926)

test-medicdiag-a.js L2 ("care never cures") is stale post-duty: the duty
holder's care tick cures (proved by test-medicduty-a.js L4). Revision:
- L2 becomes duty-aware: a NON-duty-holder medic's care tick tends only,
  never deletes the record (record parks at daysLeft 1 over repeated
  ticks). Falls back to a trembles patient + the holder when the roster
  holds only one medic (trembles has no cure at any tier, so the holder
  can only tend).
- L2c code-read revised: villagerCareTick itself still only tends
  (daysLeft -= 1, no direct delete); the deletion lives in
  medicDutyCureAttempt, called from the care tick for the duty holder
  only. The code-read asserts that split, plus the duty cure's
  alien/trembles refusals.
- L2d (new, short): the duty holder DOES cure a curable patient
  (wound fever + granted triage), asserting record gone + counter
  incremented — the medicdiag-side statement of what
  test-medicduty-a.js L4 proves in full.
- L2b (treatVillager refuses) unchanged.

## 4. Proof (scripts/test-poolcapture-bar-a.js)

Unit legs on synthetic episode sets for join rules (a)–(d), the
same-tick decomposition arithmetic, the capture-fraction math
(38->18 PASS, 38->20 FAIL), and the medic-days-only share math.
Calibration leg: run analyze-medicduty-a.js --before/--after on the
landed corpus and assert absentWithMedic 38->18, capture 52.6%,
treated 35/135, sameTickCures 30, G1 PASS under the re-registered bar,
exit 0; run analyze-feveranat-a.js on the after leg and assert the
treated count moves 35 -> 36/141 (Rosa only; cureEvents are 0 on this
corpus so rule (b) changes nothing here).
Also re-run test-medicdiag-a.js and test-medicduty-a.js green.

## 5. What this arm will NOT do

- No src/js change (measurement-only). No re-run of the sweeps (the
  corpus is read as landed). No edit to sim-findings.md (coordinator
  owns it). No verdict on the Haven Medic Duty build itself: the
  calibration numbers above validate the INSTRUMENT, not the build.
- Metric review (for the evidence file): the treated-share secondary
  cannot judge a duty build even after the join fix — a cure that
  prevents an episode never enters the share. The next run should
  retire treatedShare as a duty secondary in favor of the care-coverage
  line, or keep it only as a tend-coverage measure with the name said
  plainly. The same-tick recorder gap should be fixed in the sweep
  before any future arm leans on episode counts for a cure build.
