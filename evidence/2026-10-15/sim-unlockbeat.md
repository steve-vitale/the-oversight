# sim-unlockbeat — the Standing-path wave-unlock announcement fix (2026-10-15)

Worktree: `~/workspace/worktrees/sim-unlockbeat`. Run: oversight-flesh-out-loop, scale-onramp axis, lever-2 (wave pacing) lens.
Claim: `hidden_files/lever-claims/fleshout-20261015-unlockbeat.json` (scale-onramp, arms: standing-unlock-beat; other loops stay off).

CANON NOTE: there is NO canon doc for unlock-announcement timing / beat-readiness — the canon rule says say so, not invent one. docs/MONSTER-WAVES.md covers the wave gates (waves 4–5 unlock on Standing: blood/bonds/bread; the fiction: "the System's *response* to your standing. You've been noticed."). This fix adds no new fiction, no new system, no new voice — it makes the existing fiction honest by routing the two Standing sources into the existing idempotent beat choke point.

## The blank (diagnostic evidence/2026-10-15/sim-readinessbind.md §6)

`checkWaveUnlockBeat()` fires only from kill/engagement paths (game.js recordWaveKill, tbCombatEnd, progression.js recordDeedFight) — never from hostFeast or link-seasoning. Waves 4–5 unlock on Standing (unlockedWave reads villageStandingTotal() live; castMonster reads unlockedWave() directly), so the wave is in the spawn pool BEFORE the System says "New casting directives incoming." Measured lag: 0–6 days, never preceding (15 re-runs: 0,0,0,0,0,0,0,0,1,1,1,2,2,3,6).

## The fix (game-code, minimal)

Two Standing-path callers into the existing idempotent `checkWaveUnlockBeat()` — the same System voice (`waveUnlockBeat` w4 "MIRROR DRAFT" / w5 "PRODUCERS" text), untouched:

1. **BREAD path** — `hostFeast()`, right after `state.feastLog.push(...)` (the moment the feast's +20 plenty lands). The System reacts at the feast.
2. **BONDS path** — `endDay()`, right after the day tick (link seasoning is a passive threshold — hierarchy.js `_linkSeasoned`: 30+ days, trust 40+ — with no event to hang a caller on; the diplomacy unlock crosses at dawn). Catches the same morning (lag 0), plus any trust-crossing from the previous day's tending.

The **BLOOD path** (ledger kills → recordWaveKill) was already covered.

Guarantees by construction:
- **No double-fire**: the choke point's `state._waveAnnounced` watermark no-ops when the kill path already announced the same unlock.
- **No early fire**: `unlockedWave()` reads live Standing — the gate hasn't crossed until it crossed.
- Harness gate `Game._standingBeatOff` (default falsy, production-true): the sweep's control side sets it to replay the pre-fix tree byte-identically (precedent: `Game._attrKills` in recordWaveKill).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Axis**: scale-onramp. **Lever**: 2 (wave unlock pacing) — announcement timing, not gate difficulty. The gates themselves are untouched.
- **Substrate**: leadfeast (leadcourt + r13 feast layer) × belongfeast (belongseek + r13 feast layer) — the Standing-path unlock substrate. `FEASTSCALE_R13=1`.
- **Seeds**: 11/22/33/44/55/66/77/88 (pilot). Confirm: 12–16 seeds on GO.
- **Horizon**: 180d death-aware (harness stops dead villages; +10d tail).
- **Control**: own control in the SAME sweep, identical seeds (`Game._standingBeatOff = true`; CONTROL BASELINE DRIFT #247: never inherit baselines).
- **Instrument**: scripts/unlockbeat-sweep.js — daily samples of unlockedWave()/standing/living/rank + say/sysSay ring with day stamps; unlock-day = first observed day at wave ≥ w; beat-day = first ring entry on/after unlock day matching "New casting directives incoming" / "MIRROR DRAFT" / "PRODUCERS"; lag = beatDay − unlockDay.
- **PRIMARY (mechanism)**: ≥ 80% of Standing-path w4/w5 unlocks announced within 1 day of the unlock (lag ≤ 1d; baseline 0–6d, never preceding). Non-coincident unlocks only (a 3→5 single-day jump backfills w4 with coincident=true; the beat fires once for the highest wave).
- **GUARDRAILS**: (a) median survival ≥ control−10d; (b) national ≥ control−2/16; (c) no new death mode at the cause-family level (armed-only, n≥3).
- **SECONDARIES (reported, non-binding)**: 30d post-unlock holder/death/hollow split — does early warning change village behavior? Sense-test the beat in context (news vs noise; mid-crisis arrivals).
- **Gates before spend**: proof scripts/test-unlockbeat-20261015.js REAL RED→GREEN — (R1) beat fires on a scripted Standing unlock (feast-driven); (R2) does NOT fire early (beat-day ≥ unlock-day, and no beat before the gate crosses); (R3) does NOT double-fire when the kill path already announced (`_waveAnnounced` watermark). det-gate byte-identical (armed re-run determinism); SMOKE=1.
- **NO-GO**: primary < 80%, any guardrail miss, or proof-gate failure. A miss is NO-GO, never re-scored mid-run (§14).

## Gates (all green before spend)

- **Proof** `scripts/test-unlockbeat-20261015.js`: REAL RED→GREEN. RED (pre-fix tree, game.js reverted via patch dance): 18 passed / 5 failed — the wave unlocks (unlockedWave()≥4 asserted) but the beat never fires (beats=0): the diagnostic's blank reproduced in fixtures. GREEN (fixed tree): 23/23 — beat fires inside hostFeast on the 5th feast (standing 100, same day); beat fires at dawn in endDay on link-seasoning (standing 102, lag 0); no early beat below the gate (standing 80); no double-fire (still exactly 1 beat after a 6th feast crossing nothing new); Mirror Draft voice preserved.
- **SMOKE=1** `scripts/unlockbeat-sweep.js`: 32 runs (2 policies × 8 seeds × armed/control) unwrap, sampler collects, no crash, zero unlocks on 3d (none expected).
- **DETGATE=1**: seeds 11,22 armed re-run byte-identical per-seed JSON (4/4 IDENTICAL). Determinism holds with the fix live.
- **Instrument fix mid-gate**: the first det-gate run exposed a capped-ring eviction (day-55 beats pushed out by day 180) — beats are now captured at fire time (beatHits/beatCtx), re-verified IDENTICAL + PRIMARY 100% on the det subset (4 unlocks, lags 0,0,0,0).
- Pilot (8 seeds × leadfeast/belongfeast × armed/control, 180d death-aware, identical seeds) launched after gates; own control in the same sweep.

## Results

32-run pilot (8 seeds × leadfeast/belongfeast × armed/control, 180d death-aware, identical seeds) + 16-seed confirm (8 fresh seeds × same design). Own control in the same sweep both times.

| side | unlocks (w4/w5) | beats observed | lag ≤ 1d | PRIMARY | lag dist |
|---|---|---|---|---|---|
| pilot armed | 20 (11/9) | 20/20 | 20/20 | **100.0%** | all 0 |
| pilot control | 20 (11/9) | 19/20 | 18/20 | 90.0% | 18×0, 1×5 |
| confirm armed | 19 (11/8) | 19/19 | 19/19 | **100.0%** | all 0 |
| confirm control | 20 (12/8) | 20/20 | 19/20 | 95.0% | 19×0, 1×2 |

**PRIMARY: GO — 39/39 Standing-path w4/5 unlocks announced at lag 0 on the armed side** (pilot 20/20 + confirm 19/19), vs the diagnostic's 0–6d kill-gated baseline. Zero early beats anywhere (the no-early guarantee holds in the wild, not just fixtures).

Guardrails (both sets):

| guardrail | pilot armed vs control | confirm armed vs control | verdict |
|---|---|---|---|
| median survival ≥ control−10d | 110d vs 110d | 102d vs 102d | GO |
| national ≥ control−2/16 | 7 vs 6 | 7 vs 7 | GO |
| no new death mode (family level, armed-only n≥3) | none | none | GO |

Secondaries (reported, non-binding): 30d post-unlock split — pilot armed {held:15, died:3, hollow:2} vs control {held:14, died:3, hollow:2, held-censored:1}; confirm armed {held:14, died:4, hollow:1} vs control {held:13, died:7}. Early warning does not move the 30d split — the beat is a broadcast, not a buff; villages live or die on the same post-unlock dynamics the readinessbind diagnostic named (/77 vs /88).

Instrument note (honest): the first pilot run's matcher searched a capped say-ring after the run and missed 4 beats (day-55 beats evicted by day 180) — the instrument was fixed to capture beats at fire time, and a second artifact was found and corrected: unlocks crossing during sleep()/endDay fire with the pre-increment day-stamp while the daily sample (taken pre-sleep) first sees the wave a day late. The beat cannot precede the unlock (choke point reads live unlockedWave; proven no-early in fixtures), so beatDay = sampleDay−1 ⇒ true lag 0. The correction is one-directional and conservative (it can only move measured lag 1→0 in the proven-impossible direction, never hide a real lag). Both artifacts are documented here; the numbers above are post-correction.

## Metric review (§14 — for the NEXT run, not this one)

1. **The primary's denominator was the right call.** Non-coincident w4/w5 unlocks only — coincident 3→5 jumps (2 across both sets) backfill w4 with one beat for the highest wave; counting them would have punished the fix for the watermark's correct no-double-fire behavior.
2. **The control side's 90–95% is not a threat to the primary.** The kill-gated baseline often lands at lag 0 (a kill crossing the gate announces immediately); the diagnostic's 0–6d tail is the real phenomenon (pilot control showed a lag-5, confirm control a lag-2). The primary measures the fix's coverage, not the control's failure — correctly.
3. **Sleep-artifact correction belongs in the sweep, documented.** Future beat-timing instruments should sample post-sleep or capture beats at fire time (as this one now does) rather than correcting after the fact.
4. **The 30d split secondary confirmed non-informative** — as pre-registered, non-binding. A future run asking "does warning change behavior" needs a behavioral instrument (fight participation, learning rate in the 30d window), not an outcome split.

## Metric review (§14 — for the NEXT run, not this one)

1. **The primary's denominator was the right call.** Non-coincident w4/w5 unlocks only — coincident 3→5 jumps (2 across both sets) backfill w4 with one beat for the highest wave; counting them would have punished the fix for the watermark's correct no-double-fire behavior.
2. **The control side's 90–95% is not a threat to the primary.** The kill-gated baseline often lands at lag 0 (a kill crossing the gate announces immediately); the diagnostic's 0–6d tail is the real phenomenon (pilot control showed a lag-5, confirm control a lag-2). The primary measures the fix's coverage, not the control's failure — correctly.
3. **Sleep-artifact correction belongs in the sweep, documented.** Future beat-timing instruments should sample post-sleep or capture beats at fire time (as this one now does) rather than correcting after the fact.
4. **The 30d split secondary confirmed non-informative** — as pre-registered, non-binding. A future run asking "does warning change behavior" needs a behavioral instrument (fight participation, learning rate in the 30d window), not an outcome split.

## Village assessment (plain words)

The leadfeast villages feast their way up: five major feasts by ~day 55 buys wave 4, and the same fire plus seasoned friendships buys wave 5 within days — the plenty accelerator the diagnostic named. The belongfeast villages are slower diplomats, seasoning links toward the same gates. With the fix, the System now speaks at the feast that earns the wave — "RATINGS ARE UP! … New casting directives incoming" lands in the feast's own broadcast sequence, or at the dawn the bonds season. The villages look the same as the diagnostic's (median survival 102–110d both sides, national 6–7/16, no table) — the fix changes what the village HEARS, not what it can do. The /77-vs-/88 lesson stands: the beat is honest now, but honesty doesn't save villages; post-unlock dynamics do.

## SENSE-TESTING (beats read for meaning)

- **News, not noise.** leadfeast s22 w4 (d55): the beat lands directly after the feast beats ("FEASTED ×2.03… a proper feast") — the System reacting to the exact feast that crossed the gate. The fiction is finally honest: the village earns notice, the System says so, same breath.
- **The brink feast.** belongfeast s77 w5 (d88, 3 living): a dying village holds a televised feast (play-by-play, color commentary, "Nobody dies on television. That is the rule. Probably.") and the Producers announcement lands mid-broadcast while The Eater circles. Chilling and correct — the System escalates on a village that's already bleeding. No fabricated history, no wrong voice.
- **Dawn broadcasts.** w5 beats at dawn sit among ordinary morning lines (spoilage, day-dawn) — a morning news bulletin, not an interruption. No beat arrived mid-combat or mid-crisis in a way that read wrong; the broadcast channel is the same one every System beat uses.
- **Voice preserved.** The w4 beat is still the Mirror Draft text, w5 the Producers text — byte-identical to the kill-path beats. Nothing new was invented.

## Blanks filled / documented

- **FILLED**: the Standing-path unlock announcement — two callers (hostFeast, endDay) into `checkWaveUnlockBeat`. Proof scripts/test-unlockbeat-20261015.js (REAL RED→GREEN); sweep scripts/unlockbeat-sweep.js (+ compare-unlockbeat-20261015.js).

## Files

- `src/js/game.js` — hostFeast + endDay Standing-path callers (2 small blocks, `_standingBeatOff`-gated).
- `scripts/test-unlockbeat-20261015.js` — proof, REAL RED→GREEN.
- `scripts/unlockbeat-sweep.js` — the armed/control sweep (SMOKE=1 gate).
- `scripts/compare-unlockbeat-20261015.js` — combined table + PRIMARY verdict.
- `evidence/2026-10-15/sim-unlockbeat.md` — this file.
- `evidence/2026-10-15/perseed-unlockbeat/` — 32 per-seed JSONs (pilot: 8 seeds × 2 policies × armed/control).
- `evidence/2026-10-15/perseed-unlockbeat-confirm/` — 32 per-seed JSONs (confirm: 8 fresh seeds × 2 policies × armed/control).
- `evidence/2026-10-15/unlockbeat-pilot.json` / `unlockbeat-confirm.json` — aggregate sweep results.
- `evidence/2026-10-15/unlockbeat-pilot.log` / `unlockbeat-confirm.log` — sweep run logs.
