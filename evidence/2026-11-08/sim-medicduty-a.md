# sim-medicduty-a — HAVEN MEDIC DUTY (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261108T1315Z (Loop A, ADOPTION
of fleshout-20261108T1017Z — the 1017Z run died by cron timeout with this arm
half-built; the duty was never built and no after sweep ran). Axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medicduty-a, branch sim-medicduty-a.
Substrate: worktree HEAD 76c16eeae at prereg time (before leg, unmodified
game); after leg = the same tree + the duty commit (hash recorded below).
Policy: competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env:
PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds:
96301–96308 (8 seeds — the feveranat / tendsick / medicdiag band,
deliberate reuse; see prereg Seed-band note).

Full pre-registration (binding): evidence/2026-11-08/sim-medicduty-a-prereg.md
(original GO bar + Amendment A1 + Amendment A2).

## Pre-registered header (Amendment A1, the judged bar)

- PRIMARY (G1): after-leg NPC sick-days healer-present share ≥ 30%
  (before 24.6%, ceiling 32.9%) AND absent-with-medic sick-days ≤ 19
  (before 38).
- GUARDRAILS (G2): median survival ≥ 58.4d (0.8× before 73d); starvation
  deaths ≤ 10 (before 8 + 2); no new death-cause mode ≥ 2; produced/need
  ≥ 0.965 (before 0.995 − 0.03).
- PANEL (G3): §15 balanced panels before/after, compare attached; any
  regression_signal investigated, unexplained regression blocks a GO claim.
- PROOF (G4): scripts/test-medicduty-a.js green (all legs).
- SECONDARY (reported, not gated): sickness deaths, wound-fever NPC deaths,
  treatment coverage — NULL PREDICTION: no material change (±10pp band);
  duty mechanism (duty-days, blocked departures, holder changes);
  cure metric (A2, secondary, reported); wall numbers.
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.

## Results

### Before leg (base 76c16eeae, unmodified game) — MEASURED, all 8 seeds exit 0

Analyzer: `node scripts/analyze-medicduty-a.js --leg
evidence/2026-11-08/medicduty-a-corpus/before` (exit 0):

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":8,"5":1} medianSurvival=73d max=149d
PRIMARY: present=113 absent=346 share=24.6% absentWithMedic=38 absentNoMedic=308 (village-days=681 healerDays=315 medicDays=472 havenAvail=206)
DUTY: dutyDays=0/681 holders=0 holderChanges=0 blockedDepartures=0 joinMismatches=0
SECONDARY: episodes=156 treated=71 treatedShare=45.5% sicknessDeaths=19 woundFeverDeaths=16 starvationDeaths=8
GUARDRAILS: produced/need=0.995 deathCauses={"ambush":4,"a wound that wouldn't close":10,"monster":7,"starvation":8,"the wild":48,"alien":1,"the arena":2,"sickness":18,"dehydration":3,"a stranger":2,"the focus group":1,"spool":1,"lockjaw":1,"contest":1}
```

Corpus: evidence/2026-11-08/medicduty-a-corpus/before/ — 3 recorders × 8
seeds × (competent + bare) = 48 per-seed files + 3 summaries + 2 logs, all
exit 0. Join clean: duty/medicdiag day-by-day joinMismatches=0. Duty
columns are all zero/null on the before leg, as expected (no duty code
exists yet — the recorder reads `v.medicDuty`, which is undefined).

Balanced panel (before): evidence/2026-11-08/medicduty-a-panel-before/
(panel.json.gz, 8 rows, contract digest
37bbb0fad9471559345d72b35625c95a4aeb531872d29ee2c9fd887a0c7b55f4,
validity sourcesStable=true, neutrality match on competent/96301).
Cases/ cache deleted before commit per §15 (reproducible from seeds +
digests).

Baseline numbers that bind the gates (Amendment A1): present share 24.6%,
absent-with-medic 38, addressable pool 38, ceiling share 32.9%, median
survival 73d, starvation deaths 8, produced/need 0.995, treated share
45.5%, sickness deaths 19, wound-fever NPC deaths 16.

### After leg

(to be filled after the duty build + after sweep)

## Verdict

(to be filled — judged ONLY against the A1/A2 amended header)

## Metric review

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read on at least two
episodes: one where the duty holder tends, one where the village has
no medic; quote what the village actually says and whether the duty
reads as a person doing a job, not a flag)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
