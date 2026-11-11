# Journey succession r177 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r177 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r177 = next Lane B number after r176 crisis.
Base: master fc0ffb37c (journey-scale r130) at run start.

## Standing state (why this run plays leg 7 fresh)

r170 succession (2026-11-10) adopted r169, landed the ask:lately
structural exemption (Catalina d62 speaks the shared storm line now),
and validated the REVISED MANTLE-FINE analyzer rules on the r169 panel
(VILLAGE-OVER exclusion, SAME-DAY-CASCADE classification — revised
verdict PASS, matching the adjudicated substance; the r169 letter-FAIL
stands, un-rescored). This run is the first fresh panel judged under
those revised rules. No code change is planned going in; the run's job
is to judge the bars on new ground and watch the carried same-class
dry sites in the wild.

## Question (r177)

On a fresh 8-seed panel, under the r170-revised MANTLE-FINE rules:
(1) does every bearer death hand the mantle to a living successor
synchronously (no real deferral)? (2) does the r170 lately fix hold
(0 ask:lately fellBack anywhere)? (3) do the carried same-class dry
sites (convoThreadBeat `exh` closers, base `more` choice) stay dry-free
in the wild?

## Panel

- Driver: scripts/journey-succession-r177-20261111.js (r169 driver,
  rename only: r169 -> r177, EVID_DIR 2026-11-10 -> 2026-11-11).
- Analyzer: scripts/analyze-journey-succession-r177-20261111.js
  (r170 analyzer, rename only — it carries the revised MANTLE-FINE
  rules: VILLAGE-OVER exclusion + SAME-DAY-CASCADE classification).
- Seeds: FRESH BAND 34201–34208 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control, byte-identical across r161/r165/r166/r169).
- Pilot first: seed 34201 alone to verify the driver runs clean on
  this base; then the remaining 7 seeds sequentially.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34201–34208: 0 hits. (Comparison: 34178/34123 named
  elsewhere; 34011–34018 = r169 panel, 33998 + 34001–34008 = r165/r166
  — none reused.) No forbidden/contaminated band list names 342xx.
- Band 34201–34208 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation.

## Bars (binding, §14)

- MANTLE-FINE (binding, revised r170 rules): PASS — 0 flippedImmediate
  =false rows outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips.
- DRY CENSUS (binding): 0 ask:lately fellBack on the panel; 0 dry
  lines on the carried same-class sites (exh closers, base more);
  0 AGENCY-DRY / TEACH-DRY / OPENER-DRY (carried bars).
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA.
- CONTROLS (binding): smoke 33998 byte-identical tele to r161/r165/
  r166/r169 (deaths 1, alive 11, fallen 1, stage 3, mentions 2);
  DeAndre d+14 speaks the trapline line; pick rank 1, funeral INCALL
  true, selfReq 0 on every seed.
- FAMILY PROOFS (binding): r146 + r147 + r151 + r155 + r157 + r161 +
  r166 + r169 + r170 ALL GREEN on the final tip.
- GATE (binding): check.js --quick on the final tip; standing
  failures only, no new attributable failure.

## What would count as an interesting finding

- A MANTLE-FINE failure under the REVISED rules (a real deferral the
  r169 adjudication did not cover — new mechanism, not sampling).
- A NEW dry anywhere (especially ask:lately or the carried exh/more
  sites) — the fix class would be incomplete.
- A lately answer repeating verbatim back-to-back in a way that reads
  as parroting rather than shared news (the r170 exemption
  overreaching).
- Any control changing (smoke tele, trapline line, pick rank,
  funeral, self-request).
- A day-skip (the instrument's first positive — see metric review).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. Run on the r177
panel tele files. The r169/r170 precedent: the checker sums across
files while the baseline holds per-seed means — expect the same LOUD
summation artifact; judge per-seed means against the baseline, do NOT
roll the baseline forward on a summed artifact.

## Metric review (carried, to be filled after the panel)

- The day-skip instrument correction stays open (r166/r169/r170:
  zero day-skips across 67 deaths / 9 seeds / ~800 sleeps + 0 across
  the 34016 re-run's 102 sleep rolls, no deterministic staging path)
  — carried, not implemented. A first positive on this panel would
  be the first real data for it.
- CAP-NC denominator: stays descriptive. A decisive verdict needs a
  longer panel or a band with earlier arrivals — a future run's
  question, not this run's.
- Same-class dry sites (convoThreadBeat `exh` closers, base `more`
  choice): covered by the r170 design call; this run WATCHES them in
  the wild. If one dries, the fix lands here; if none dries again,
  the watch continues.
- If MANTLE-FINE passes under the revised rules on this fresh panel,
  the bar is confirmed for future runs; the r169 letter-FAIL stays
  standing history.
