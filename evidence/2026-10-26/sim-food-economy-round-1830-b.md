# Loop B round 1830Z — food-economy: fourth door + throttle denominators (coordinator evidence)

Run: fleshout-loop-b-20261026T1830Z. Axis: food-economy (second non-converged
axis). Loop A live on scale-onramp at run start (1816Z wave5gate + tableline
claim, NOT touched); A landed its round (1e215026f) mid-run and moved master
under both arms. Both arms rebased onto the new master, re-proved, then merged.
Merged locally, pending ship. Zero src/js in either arm. No push, no bump,
no live verification (ship loop owns deploys).

## Pre-registration (coordinator level)

Both arms pre-registered in their own prereg files before sweeping/analyzing,
and both were judged only against those preregs. This round's preregs:
- stockdoor: control re-derives exactly (327/289/38, 36/38 explained, same
  residuals) AND the fourth-door record accounts for BOTH residual days.
- throttledays: >= 95% of throttle-engagement days carry BOTH denominators,
  plus a reported disagreement share at the throttle's own bar.

## Arm 1 — sim-stockdoor-b (bc33ccdb8, rebased from d87328605): DIAG-NO-GO

Instrument: `scripts/stockdoor-capture.js` — a recorder-side wrapper around
`Game.stockSurplus` (the nightly meal's surplus path), recording day, vDay,
give, stored kcal, spoilDay (= vDay + 3, no granary bonus). No game-code hook
was needed; replay sees the method plainly, like the three existing doors.
Corpus: seeds 9750–9757, competent-nofeast, 100d, SEATDRIVE=0 (8 files).

Judged against its prereg:
- Control PASS exactly: 327/289/38, lag 1x32/2x4/3x1/4x1, coverage 36/38,
  residuals exactly (9750,83) and (9750,84) in the pre-fourth-door view.
- Determinism PASS: 8/8 seeds identical to the resid-b corpus on every
  game-output field; the wrapper moved nothing. No confirm band spent.
- Day-83 pile PASS exactly: every bound line faces exactly the 200-kcal x 10
  stack at spoilDay 85, no granaryDays.
- Day-84 pile PASS exactly: 3,567 kcal in five stacks (meal-surplus 200x10@85
  + day-80 granary stock 178+189@86g3 + ripened day-74 Winner's share
  300x2@86g3 x2); source records present.
- Fourth-door total FAIL (the verdict leg): day-82 stockSurplus records total
  2,800 kcal stored (600+200+800+1,200, all vDay 82, all spoilDay 85), not the
  pre-registered 2,000.

Proof `scripts/test-stockdoor-b.js` post-rebase: 23 PASS, 2 FAIL — the
day-82 gross-total check and the verdict flag. The two failures ARE the
verdict; nothing was re-scored.

Why gross != net (the finding): the night meal is a two-way door in one
night. Early villagers put surplus back (2,800 kcal on night 82); later
villagers eat dinner out of the same pantry, including some of what was just
put back. By day 83's first cook line, 4 of the 14 units (800 kcal) are gone.
Corroboration: night 81 stored 3,000 kcal and ZERO survived to day 82's first
cook. The fourth-door record names the door, day, and clock exactly — but a
night's gross write is an upper bound on what survives, never the surviving
pile. The next run's prereg should judge the pile match (gross and surviving
pile reported separately) and, to close the 800-kcal gap directly, add a
meal-draw record.

Wall (stockdoor band): national/table/wins 0/8, wave 4/5 0/8, wave 3 on 4
seeds, median 100d censored, deaths 43 (arena 15, starvation 7, monster 4,
wound 4, sickness 4, ambush 3, dehydration 3, old stare 1, alien 1, lockjaw 1).

Sense sample (seed 9750, day 83, Sierra at the wall): "The racks are already
full (13,033 kcal kept — more than the haven can eat before it turns), so
Sierra left the fresh pile for tonight's dinner instead of smoking it onto
the rot pile." The "fresh pile" is the village's own leftovers from the night
before, net of what the night itself ate. Nothing robotic in the residual
days. Out-of-arm observation: on seed 9755, Otto says the identical racks-full
sentence three mornings running (days 39–41) with fresh numbers each time —
honest and informative, but a candidate for voice variety.

## Arm 2 — sim-throttledays-b (f86c3e0b5, rebased from 1d91fba52): GO (measurement)

Instrument/analysis: `scripts/throttledays-capture.js` (new recorder;
garden-capture and inflow-capture untouched), sweep, analyzer, proof. Band:
seeds 9760–9767, competent-nofeast, 100d, SEATDRIVE=0 — the gardenbar band,
reproduced, not a fresh band (plus a fresh seed-9760 determinism re-run).

Judged against its prereg (written before any new analysis):
- Coverage 750/750 resolutions (100%) and 750/750 engagement days (100%)
  carry BOTH denominators (drain-days and need-days, same numerator, same
  moment). 0 throttle-flag mismatches vs garden-capture across 761
  resolutions; 0 engaged resolutions with drain-days <= 4; fallback share 0.
- Disagreement share: 91.6% (687/750). On 687 throttle firings the drain
  clock said "plenty" (> 4 drain-days) while the need clock said "scarce"
  (<= 4 need-days). Median firing day: 25.5 drain-days vs 1.49 need-days,
  on 32,968 fresh kcal for ~10.5 people. Sensitivity: 70.8% disagreement
  at a 2-need-day bar, 23.9% even at a 1-need-day bar.
- Reverse disagreement: 0/11. The 11 unthrottled days are exactly the 11
  NPC-sow days on seed 9763, when the pantry was genuinely near-empty on
  both clocks (need-days 0.06–0.30).
- Seed 9762 is the exception proving the mechanism: the one seed with a
  genuinely large pantry (median ~90,000 kcal) is the one seed where the
  clocks mostly agree (36.4% disagreement; all other seeds 100%).

Proof `scripts/test-throttledays-b.js` post-rebase: OVERALL PASS, including
reproduction vs gardenbar (761/761 resolutions, 750/750 engaged, 11/11 NPC
sows, 3167/3167 keeper turns, 32/32 beds, 235/235 player sows) and fresh
seed-9760 determinism (85/85 resolutions, all engaged tuples identical).

Wall (throttledays band): national/table/wins 0/8, wave 4/5 0/8, median 100d
(all 8 seeds survived to the horizon), wave reach 3,2,2,2,2,3,3,3, deaths 18,
none starvation (arena 6, monster 4, ambush 2, dehydration 2, wound 1,
expedition 1, "big ugly" 1, "extended warranty" 1). All seeds village rank.

Sense sample (seed 9760, day 8): Rosa says "Rosa waters and weeds the beds
before taking up other work. The harvest can wait." That day's numbers:
20,500 fresh kcal, 5.81 drain-days, but 0.85 need-days for 12 people. The line
is honest about what she does; the "can wait" is unfaithful to a pantry
holding less than one full day of food — the same voice-vs-function gap
freshdays found in the "250 days" line.

Design question, NOT decided here (steve-call, recorded plainly in the arm
evidence): whether the throttle should key on drain-days or need-days. At
the same > 4 bar, need-keying would have fired on only 63 of the 750 engaged
resolutions instead of all 750; the 11 genuinely-empty days would stand down
under either keying. No keying change recommended or made by this run.

## Metric review

- Stockdoor: the prereg's 2,000-kcal leg assumed the day-82 write equals the
  day-83 surviving pile. It does not — the night meal eats from its own
  write. The leg was honored as a fail, not re-scored; the next prereg must
  separate gross write from surviving pile and add a meal-draw record.
- Throttledays: coverage is 100% by construction of the replay (the recorder
  replays the same resolutions); the substance is the disagreement share and
  its sensitivity bars, which were pre-registered. The band is a
  reproduction of the gardenbar band, not fresh seeds — stated plainly, not
  presented as a fresh sweep; the fresh seed-9760 determinism re-run is the
  only fresh-seed evidence in this arm.
- Balanced panel: not applicable (recorder corpora, no panel ingest mode);
  paired identical-seed tables and the pre-registered bars are the comparison
  of record, as in the 1730Z round.

## Telemetry deviation check

Both corpora, same 3 LOUD lines each (national 12->0, table 16->0,
wins 16->0, n=8 files each) — the known SEATDRIVE=0 regime artifact class:
the checker reads top-level national/table/wins keys the recorder rows do
not carry, against a WINSEAT baseline. Baseline NOT rolled. No new
investigation.

## Infrastructure

- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo by the workers, commits
  verified correct. No clobber on the coordinator evidence commit (verified
  below).
- Master moved once under the run (loop A 1816Z round 1e215026f); both arms
  rebased clean (zero file overlap with the A round), re-proved on the merge
  base, then merged ff-only.
- No EPERM flap blocked this run. check.js --quick NOT re-run (zero src/js,
  sibling lanes live); attributable evidence is the arm proofs on merged
  master.
- Worktree registration slow (~3.5 min for two trees) but succeeded.
  Reap at closeout left only other runs'/lanes' trees standing (untouched).

## Convergence state

food-economy stays converging (NOT converged): the fourth pantry door is now
a first-class inflow record and the throttle denominator question is measured
(91.6% disagreement) — but no food-economy game-code fix has landed from
either arm, the residual-pair judgment is still open pending a meal-draw
record, the throttle keying is Steve's call, and the scale wall is untouched
by this axis. scale-onramp stays converging (untouched; sibling loop A).
Next blanks, in order: (1) meal-draw record + pile-match prereg for the
residual pair (gross vs surviving pile reported separately); (2) throttle
keying ruling (Steve's call — drain-days vs need-days, 91.6% disagreement
measured); (3) what seed 9762 stocks that the others don't; (4) presence-aware
share bar + next diversity arm; (5) plain-silenced indistinguishability;
(6) rule-R voice taxonomy rebuild; (7) scholar-donation visibility.

Evidence: evidence/2026-10-26/sim-stockdoor-b.md + prereg (bc33ccdb8) and
evidence/2026-10-26/sim-throttledays-b.md + prereg (f86c3e0b5). Merged
locally, pending ship.
