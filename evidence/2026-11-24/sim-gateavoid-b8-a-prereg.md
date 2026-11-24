# sim-gateavoid-b8-a — PREREG (DIAG, coordinator-run)

Frozen 2026-11-24T11:22Z by the Loop A coordinator, BEFORE any B8 census
was run. Copy into evidence/2026-11-24/sim-gateavoid-b8-a-prereg.md at
closeout; this hidden_files copy is the freeze record.

## Arm
sim-gateavoid-b8-a — DIAG + design-call brief. NO game-code change, NO new
sims. Axis scale-onramp, 0915Z round's next blank #1 (finding #2733).

## Question
B8 (`gate-avoid-plan-exists-no-retarget`, frozen in
scripts/analyze-retarget-a.js `classifyMeeting`): a gate-avoid meeting where
the holder already has a plan. The gate resets the plan's stage but never
sets the target. What does such a meeting DO to the holder's plan afterward?
Is B8 a real formation wall (holders blocked by a missing/wrong target), or
dead meetings on plans that were never going anywhere?

## Corpus (deliberate REUSE, not fresh)
Retarget band 109411–109418, BOTH legs, 8 seeds each (16 total):
- `evidence/2026-11-24/perseed-retarget-a-ctl/` (planretargetOn = false)
- `evidence/2026-11-24/perseed-retarget-a-arm/` (planretargetOn = true)
Band named in `evidence/2026-11-24/sim-retarget-a-prereg.md` §11 (freshness
search 2026-11-24 ~01:35 UTC; the only 1094xx hits elsewhere are 109401–
109403 in journey-deepening-r278). This DIAG reuses the band as a corpus and
declares it a replay: no fresh-seed claim, no new verdict on the retarget
lever. Policy on both legs: tableseat-nowait (layers off). Horizon 150d.

## Instrument
`scripts/analyze-gateavoid-b8-a.js` (new; committed with this arm):
- Reuses the frozen analyzer via `require('./analyze-retarget-a.js')`:
  `analyzeSeed` for the classified meeting rows (rule B8), `buildMeetings` /
  `classifyMeeting` untouched.
- Own trace per B8 meeting (rest of run, not the analyzer's 7-day
  wave-4-only `seededLater`): first later planCensus row with a non-null
  target; first later v4departs launch (target + targetWave); first later
  killCall by the holder (mid + wave); holder death (regDeaths/deaths);
  end-of-run state. Buckets: target-already-met / targetless / mistargeted,
  crossed with launched-on-met / launched-other / target-acquired-never-
  launched / never-targeted / died-before-launch.
- Selftest: fixtures for the trace buckets + determinism replay
  (two runs, byte-identical output) + analyzer selftest 38/38 as a
  dependency check.

## Bars (frozen)
- D1 ATTRIBUTION: 100% of B8 meetings land in a downstream bucket;
  0 unclassified / 0 untraced.
- D2 INSTRUMENT: analyzer selftest 38/38; DIAG selftest all green;
  determinism replay byte-identical; B8 counts reproduce the retarget
  evidence (35–36 per leg) exactly.
- D3 QUESTION ANSWERED: the evidence ends with a design-call
  recommendation with numbers — BUILD (gate sets the target, with the
  exact shape), NO-GO (B8 is not a formation wall), or STEVE-CALL
  (the numbers do not decide it). The verdict is the recommendation,
  not a lever GO/NO-GO; no lever is built or judged in this arm.

## Wall numbers (reported, never judged)
Wins / national / table / wave-5 / wave-4 reached / median survival /
villages lost / total deaths, per leg, from the reused corpora.

## Metric review (to fill at evidence time, never mid-run)
- Whether the B8 meetings' met monsters are wave-4+ (kill-relevant) or
  mostly wave-3 (a target set to them would not move the wave-4 wall).
- Whether targetless B8 holders are launch-blocked by the missing target
  specifically, or whether they never launch for other reasons (death,
  holds, no party) even after acquiring a target.
- Whether the 7-day analyzer window would have changed any verdict
  (the DIAG's rest-of-run trace vs `seededLater`).
