# Journey landing r41 — run note (2026-10-23, lane A)

## Pre-registration
- **Leg question A (blank):** NEW-VILLAGER MEAL GATE (c8d7c787d, Steve 2026-10-23) in natural 14-day play. Gates:
  - day-1 stranger half-ration fires on every seed (lineage empty, trust<30 → want 1000; beat text present in the d1 narration).
  - voice==share: the "Half ration" parenthetical appears in the stream on exactly the gate days and never on full-share days. Mismatch day = documented miss.
  - trust trajectory: competent social play climbs trust past 30 in the fortnight (the "earning your place" arc). Gate: trust>=30 by d14 on ≥3/4 seeds (a seed that never climbs is documented, not a silent miss).
  - the succession-voice proof: scripts/test-r41-meal-voice-20261023.js drives the fix's 5 scenarios + captures say(): beat says "Half ration" iff share==1000. 5/5 = GREEN.
- **Question B (stay-green carry):** r40's spine re-measured on the new tip: TEXTPIPE-AUDIT (0 warns), NEAR-DUPE (0), NV-WINDOWN (0 stuck, surfaced==closed), DEATH-LITURGY (exactly 1 grief beat/death, 0 headcount codas), THEFT-RATE (0), PLENTY-ENGAGE, FALLEN (0 dupes), debrief lines (r39 fix holds), self-sufficiency ≥0.70/seed, System contact ≤d10.
- **Seeds:** 501, 502 (pilot), 503, 504 (main) — FRESH (never in r37–r40 corpora). Policy: competent, PINNED. FAVOR_ACCEPT default ON. Horizon 14d, death-aware (+10d tail).
- **Canon read:** CANON.md reread; DECISIONS.md ruling for c8d7c787d (Steve 2026-10-23, verbatim). No new canon invented.

## Verdicts
- **Q-A1 day-1 half-ration: GO.** The beat fires on day 1 on all 4 seeds (stream-verified: first meal beat at stream line ~54; 14 beats/seed, one per day, all carrying "(Half ration — they don't trust you yet.)").
- **Q-A2 voice==share: GO (fixed this run).** Pre-fix the beat keyed on `trust < 30` alone while the share keys on `(trust < 30 && bodyIsNew)` — a taken-over established body at trust<30 banked 2000/2200 while the beat said "Half ration". Proof test was RED at scenario C pre-fix, GREEN 5/5 post-fix. In natural play (no succession in-window on 501/502/504; 503's death came day 15 as the loop exited) every day's beat matched the gate.
- **Q-A3 trust trajectory: NO-GO (binding miss — root-caused, see blank 2).** The meal gate reads `v.trust[playerId]`: flat 15.00 on all 4 seeds, all 14 days. The village's ACTUAL trust in the player (roster average of per-villager trust-in-you slots) reached 26.1/34.0/35.5/37.2 by d14 — 3 of 4 above the 30 gate — but the gate never sees it.
- **Q-B stay-green: GO.** textpipe 0/0 warns, near-dupe 0, NV 0 stuck (surfaced==closed 1/1 or 0/0), death-liturgy EXACT (501: 1 death→1 beat; 502: 1→1; 503: 2 deaths→2 beats — Hannah to the Hushpuppy d14, Wilhelm to the Highbeam Deer d15; 504: 0→0; 0 headcount codas), theft 0, plenty-voice 23–26/seed, fallen 0 dupes, debrief 6–8/seed, ss 0.83–0.97, System contact d8 on all 4 seeds. Telemetry-check vs landing.json baseline: QUIET (4 files, 2 metrics).

## Village assessment (plain words)
Four villages, first fortnight. Pantries held (self-sufficiency 0.83–0.97, nobody unfed), villagers visibly eased off production when shelves were full (plenty-voice 23–26 lines/seed — the r36 GO holding). The System arrived on day 8 everywhere, exactly itself. Villagers hauled water, wood, and stone; their trust in the player climbed to 26–37 on average — Jada hit 75 on 501. But the player's meal stayed at half rations the entire fortnight, because the gate reads a number that never moves (blank 2). 501 lost one villager (day 9, grieved properly); 502 lost one (day ~11, grieved properly); 503 lost Hannah to the Hushpuppy on day 14 and then Wilhelm himself to a Highbeam Deer on day 15 — the village grieved both, one beat each, the mantle passed mid-grief ("The Codex doesn't pause for grief"), and the new bearer <redacted> the run's learned abilities. 504 lost no one. Strangers became a village; the village just never stopped treating its scholar like a stranger at dinner.

## Blanks filled
1. **Half-ration voice lied post-c8d7c787d (src/js/game.js, 2 lines).** The beat's parenthetical keyed on `trust < 30` while the share keys on `(trust < 30 && bodyIsNew)`. Fix: hoist `const halfRation = (trust < 30 && bodyIsNew)` next to the share computation and key the beat on it — voice==share, never trust alone. Zero behavior change (share untouched; the original proof test-succession-meal-trust-20261023.js still 5/5). Proof: scripts/test-r41-meal-voice-20261023.js — RED at C pre-fix ("want=2000, voiceHalf=true"), ALL GREEN post-fix (5 scenarios × share+voice).
2. **Tooling (zero src/js):** per-day meal instruments in the r41 driver — `meal` snapshot (netBanked, player trust on the gate's own key, lineage length) and a "Half ration" beat scan attributed via capMarks, both reset per seed (the r40 bleed lesson).

## Observations (documented, not fixed)
1. **STALE-SLOT: the meal gate reads a trust number ordinary play never moves (headline blank, Steve's call).** `v.trust[playerId]` is seeded at 15 and, per betrayal.js's own trustInPlayer() comment, "ordinary play never moves" it — earned trust accumulates in per-villager trust-in-you slots instead. The moot already fixed its read to the roster average ("so earned trust never reached the moot"); the meal still uses the stale read, so the spawn comment's promise ("Trust builds through contribution, dialogue, sharing. This determines your meal share") is unfulfilled for the meal — while knowledge-trading reads per-villager slots and DOES follow earned trust. The meal is the outlier. Proposed fix: read `trustInPlayer()` (roster average) like the moot does. NOT applied: it changes daily food pressure (1000→2000 kcal/day from ~day 4–5 on competent play) mid food-economy measurement, and c8d7c787d (Steve, today) scoped itself to WHO the gate applies to, not the read. Steve's call.
2. **Pantry granularity overshoot (pre-existing):** share=1000 but netBanked 1000–1320 — indivisible pantry pieces make taken exceed want; CAPDRAW2 returns excess only above room. The beat honestly reports the banked amount alongside the gate's intent ("+1200 kcal … (Half ration …)"). Not caused by the gate; leaving it.
3. **Beat-scan attribution wobble (instrument note):** when the day rolls mid-iteration, capMarks attribution doubles a day and skips the next (502: [5,5]/[8,8]/[10,10], missing 6/9/11). The fullstream shows exactly 1 meal beat/day — the game is correct; the scan is approximate. The stream is the source of truth for beat counts.
4. **mealLedger shift (instrument note):** the day-d snapshot is taken before day d's end-of-day meal fires, so netBanked for "day d" usually reflects day d−1's meal. The voice==share audit doesn't depend on the shift; the proof test is the exact instrument.
5. **People check (3 transcripts sense-read):** Sari's seek_comfort beat is people-shaped (grief, engaged comfort, "Sorry. I need a minute." — PASS). Chloe's settled-favor beat is honest by design (the r7 "we got it handled" path — her sickness resolved before the sitting; menu correctly offers no dead ask — PASS). Liam's curious-stage-0 beat fizzles ("help me think through tomorrow's work" → "That's... pretty much all of it, honestly") — thin, the curiosity-about-you never surfaces; driver leaves after one exchange so depth is untested. Observation only, not a fix.
6. **RE-OFFER flags** at turns ≥2 remain benign menu persistence ([leave]/[silence]/[dlg:subject]/[recap]/[confront] — 0 content re-offers; consistent with r40's classification).

## Metric review
- Q-A3's trust>=30 gate MISSED (binding NO-GO per §14). The gate read the same slot the game reads, so the miss is real, not an instrument error: earned trust never reaches the meal. Root cause above (blank 2). Proposed revision for the next run: gate on the roster-average trust (the village's actual trust in the player) — or keep the slot-read and expect the miss until Steve rules on the fix.
- Beat-scan day attribution is approximate under mid-iteration day rolls (observation 3) — future runs should treat the stream, not the scan, as the beat-count source of truth.
- `MET.halfRationBeats` added to the per-seed reset list (r40 bleed lesson applied proactively).

## Reachable / fun / winnable
- **Reachable:** the landing leg plays clean; day-1 half-ration, System contact d8, death liturgy, plenty-voice, and the meal beat all fire as designed.
- **Fun:** villagers act like people (grief, deflection, monster-naming debates with named voter lists); the constant half-ration is pressure, not a blocker.
- **Winnable:** self-sufficiency 0.83–0.97 ≥ 0.70 on all seeds; no starvation. The missing "earning your place" arc is a design gap (blank 2), not a winnability blocker.

## Evidence
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/landing-r41/` — 4 census JSONs, 4 fullstreams, ~40 transcripts, 4 system-contact files, pilot/main logs, checkquick log.
Driver: scripts/journey-landing-r41-20261023.js (new). Proof: scripts/test-r41-meal-voice-20261023.js (new, 5/5; red-at-C pre-fix).
