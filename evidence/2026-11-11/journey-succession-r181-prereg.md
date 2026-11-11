# Journey succession r181 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r181 play. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r181 = next Lane B number after r180 crisis.
Base: master ae53134ae (sim-kinfirst-b) at run start.

## Standing state (why this run plays leg 7 fresh)

r177 succession (2026-11-11, this morning) was the first fresh panel
judged under the r170-revised MANTLE-FINE rules (VILLAGE-OVER
exclusion, SAME-DAY-CASCADE classification): PASS on 49 deaths, dry
census PASS, controls PASS on the 5 headline numbers but MISS on
strict full-file byte-identity — investigated and pinned to the r170
ask:lately exemption shifting the conversation RNG stream (second-order
counters move; headline 1/11/1/3/2 unchanged; r176/r177 tele agreement
is the new reference). r177's metric review PROPOSED restating the
smoke bar as the 5 headline numbers + MANTLE-FINE + trapline line +
selfReq 0, not full-file byte-identity. This run ADOPTS that revision
in its prereg (the proposal was made for the NEXT run; this is it).
Since r177, master moved through r178 endgame, r179 social-life, r180
crisis (Q3 voice-line stacking fixes in conversation.js /
convo-wants.js) and the kinfirst-b merge. Per r180's trajectory note,
dialogue-only fixes are NOT trajectory-neutral while voiceLine draws
RNG — judge this panel on its own bars; second-order counter movement
on the smoke is expected, not a defect. No code change is planned
going in; the run's job is a second fresh-panel confirmation under the
revised rules, plus watching the carried same-class dry sites in the
wild.

## Question (r181)

On a fresh 8-seed panel, under the r170-revised MANTLE-FINE rules and
the r177-proposed revised smoke bar: (1) does every bearer death hand
the mantle to a living successor synchronously (no real deferral)?
(2) does the r170 lately fix hold (0 ask:lately fellBack anywhere)?
(3) do the carried same-class dry sites (convoThreadBeat `exh`
closers, base `more` choice) stay dry-free in the wild? (4) does the
smoke control hold its 5 headline numbers (deaths 1, alive 11,
fallen 1, stage 3, mentions 2)?

## Panel

- Driver: scripts/journey-succession-r181-20261111.js (r177 driver,
  rename only: r177 -> r181).
- Analyzer: scripts/analyze-journey-succession-r181-20261111.js
  (r177 analyzer, rename only — it carries the revised MANTLE-FINE
  rules: VILLAGE-OVER exclusion + SAME-DAY-CASCADE classification).
- Seeds: FRESH BAND 34211–34218 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control).
- Pilot first: seed 34211 alone to verify the driver runs clean on
  this base; then the remaining 7 seeds sequentially.

## Seed-band freshness (local_seed_band_freshness)

- Searched evidence/*/journey-*-prereg.md + evidence/*/sim-*-prereg.md
  for each seed 34211–34218: 0 hits. (Comparison: 34201–34208 = r177
  panel; 34011–34018 = r169 panel; 33998 = standing smoke control;
  34174/34175/34178/34184 named elsewhere.) No forbidden/contaminated
  band list names 342xx (no band list exists in the goal hidden_files;
  the only "forbidden" hits are unrelated prose).
- Band 34211–34218 is FRESH. The smoke seed 33998 is a re-run of the
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
- CONTROLS (binding, REVISED per r177 metric review): smoke 33998
  holds the 5 headline numbers (deaths 1, alive 11, fallen 1, stage
  3, mentions 2) + MANTLE-FINE clean + DeAndre d+7 speaks the
  trapline line + pick rank 1, funeral INCALL true, selfReq 0 on
  every seed. Full-file byte-identity is NO LONGER the bar:
  second-order counters (pantryEnd, deed/bump counts) are expected
  to move with conversation-ledgering changes (r180) and are not a
  defect signal. Reference tele for the smoke is the r176/r177
  agreement.
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
- Any control changing (smoke headline numbers, trapline line, pick
  rank, funeral, self-request).
- A day-skip (the instrument's first positive — see metric review).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. Run on the r181
panel tele files. The r169/r170/r177 precedent: the checker sums across
files while the baseline holds per-seed means — expect the same LOUD
summation artifact; judge per-seed means against the baseline, do NOT
roll the baseline forward on a summed artifact.

## Metric review (carried, to be filled after the panel)

- The day-skip instrument correction stays open (r166/r169/r170/r177:
  zero day-skips across 116 deaths / 26 seeds / ~1700 sleeps, no
  deterministic staging path) — carried, not implemented. A first
  positive on this panel would be the first real data for it.
- CAP-NC denominator: stays descriptive. A decisive verdict needs a
  longer panel or a band with earlier arrivals — a future run's
  question, not this run's.
- Same-class dry sites (convoThreadBeat `exh` closers, base `more`
  choice): covered by the r170 design call; this run WATCHES them in
  the wild. If one dries, the fix lands here; if none dries again,
  the watch continues.
- If MANTLE-FINE passes under the revised rules on this second fresh
  panel, the bar is confirmed twice over; the r169 letter-FAIL stays
  standing history.
- Smoke bar revision: ADOPTED this run (see CONTROLS above). If the
  smoke headlines hold while second-order counters move again, the
  revision is validated and stands for future runs.
