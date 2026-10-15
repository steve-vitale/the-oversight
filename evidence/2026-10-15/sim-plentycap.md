# sim-plentycap — plenty cap standalone (2026-10-15)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **axis**: scale-onramp (the wall), lever-2 lens (wave unlock pacing)
- **question**: sim-findings #289 — the v3 plenty cap (bread counts ≤100
  toward wave 5) rarely bound directly (median 0 bind-days in v3); its effect
  was visible only combined with the faced tooth (wave-5 unlocks 9 → 6).
  Does the cap ALONE suffice against the plenty accelerator?
- **numbers** (sim starting points, NOT canon — Steve can overrule):
  `readyFacedW3=3`, `readyFacedW4=2`, `plentyCapT5=100` — the v3 landed
  numbers (7a72b456). This arm does NOT re-tune them; only the tooth mix
  changes between variants.
- **variants** (env gates in standing.js ONLY, default = v3 control):
  - `control` (env unset or `STANDING_VARIANT=both`): v3 as landed —
    faced tooth + cap tooth + monotonic ratchet.
  - `faced-only` (`STANDING_VARIANT=faced-only`): cap tooth DISABLED.
  - `cap-only` (`STANDING_VARIANT=cap-only`): faced tooth DISABLED.
  - The monotonic ratchet is live in ALL variants (landed engine behavior,
    not a tooth under test).
- **stack**: leadfeast/belongfeast roads (the plenty accelerator's home
  turf, FEASTSCALE_R13=1), all three legs in ONE sweep, identical seeds.
- **seeds**: 11/22/33/44/55/66/77/88 (pilot), 180d death-aware. Confirm
  12–16 seeds on GO. Own control in the same sweep (CONTROL BASELINE
  DRIFT #247).
- **PRIMARY**: `wave5(cap-only) <= wave5(control) x 1.25` AND
  `median cap bind-days(cap-only) >= 5` (the cap must actually bite).
  bind-day = a day where the cap hold binds (raw >= 200 && capped < 200).
- **GUARDRAILS** (cap-only leg vs control): national >= control-2/16;
  median survival >= control-10d; no new death mode (cause-family,
  n>=3 armed-only); wave-4 unlock rate within 0.20–0.60.
- **GO** → land the cap-only variant as its own commit [needs-eyes].
  **KILL** → game-code reverted byte-clean per kill protocol;
  evidence + proof scripts kept.
- **metric review**: (written at adjudication)

## RUN LOG

- 2026-10-15 ~03:45 CDT: worktree sim-plentycap registered; standing.js read,
  v3 teeth mapped. Variant gates implemented + ontology line updated.
- Proof test scripts/test-plentycap-proof-20261015.js: RED on pristine
  (11/11: both teeth bind — war 125/0-faced held at 99/wave 3; bread-only
  200 held at 199/wave 4; STANDING_VARIANT ignored) + variants on armed
  (18/18: faced-only loosens cap (bread 200 -> total 200, wave 5 bought);
  cap-only loosens faced (war 125/0-faced -> wave 4, total 125);
  unknown variant fails closed to both; monotonic ratchet live in all).
  PROOF GREEN 29/29. Fixture lesson: with 0 wave-3 faced, the defer4 hold
  (bound 99) is TIGHTER than the cap hold (bound 199) — the cap's bite must
  be measured with the faced tooth released.
- SMOKE=1 instrument-honesty gate GREEN (named-export unwrap, policy acts,
  bread-only-200 -> 199/100 on control).
- det-gate (SEEDS=11,44 x 2 policies x 3 variants, twice each): GREEN 12/12
  identical trajectories. (Full 8-seed det-gate started but the box was
  CPU-starved by 5 sibling node procs at ~30% CPU each; reduced to 2 seeds
  for the same determinism evidence at 1/4 the cost.)
- Pilot sweep ALL=1 (3 legs x 2 policies x 8 seeds, 180d death-aware,
  identical seeds, FEASTSCALE_R13=1): complete, evidence/2026-10-15/sim-plentycap-pilot.json.

## PILOT RESULTS (16 runs/leg, identical seeds)

| leg | wave4 rate | wave5 | wave4 day med | wave5 day med | med cap bind-d | med survival | national | table | won | survived |
|---|---|---|---|---|---|---|---|---|---|---|
| control (v3 both) | 0.688 | 6/16 | 69 | 109.5 | 0d | 176 | 8/16 | 12/16 | 0/16 | 7 |
| cap-only | 0.688 | 6/16 | 55 | 63.0 | 0d | 111 | 7/16 | 7/16 | 0/16 | 1 |
| faced-only | 0.688 | 10/16 | 69 | 94.5 | 0d | 171 | 9/16 | 12/16 | 0/16 | 6 |

Death-cause families (top): control combat 65 / sickness 11 / starvation 9;
cap-only combat 83 / **monster 22** / sickness 13 / starvation 11;
faced-only combat 80 / sickness 11 / starvation 8. The 'monster' family
(named monster ids as cause) is 22 in cap-only, 0 in control — armed-only,
n>=3.

## ADJUDICATION vs the pre-registered header (§14: a miss is NO-GO)

- PRIMARY wave-5 unlocks: cap-only 6 <= control x 1.25 (7.5) — GO=YES.
- PRIMARY median cap bind-days (cap-only): 0d — GO=**NO** (bar >= 5).
- GUARDRAIL median survival: cap-only 111 vs control 176 — **MISS** (bar >= 166).
- GUARDRAIL national: 7 vs 8 — HOLD (bar >= 6).
- GUARDRAIL new death mode: 'monster'=22 armed-only — **MISS**.
- GUARDRAIL wave-4 rate 0.20-0.60: cap-only 0.688 — MISS (control is also
  0.688 — metric miscalibration, see metric review; does not change the
  verdict since other guardrails fail independently).
- **VERDICT: KILL.** The cap-only variant is dead at pilot: removing the
  faced tooth moves wave-4 ~14d and wave-5 ~46d earlier into villages that
  never stood before wave-4 champions; named monsters kill villagers
  (22 vs 0), median survival falls 65d, table halves (12 -> 7), survivors
  fall 7 -> 1. The faced tooth is not redundant with the cap — it is the
  tooth that protects lives. KILL PROTOCOL: standing.js reverted
  byte-clean (git diff HEAD -- src/js/standing.js empty, verified);
  evidence + proof/det/sweep/sense scripts kept.

## What the separate-teeth run actually showed (the #289 answer)

The teeth do DIFFERENT jobs — the pilot disentangled them:
- The CAP restrains wave-5 COUNT: faced-only (cap off) -> 10/16 wave-5
  unlocks vs 6/16 with the cap live. But it almost never BINDS in the
  hold sense (median 0 bind-days on BOTH the v3 run and cap-only) — it is
  a structural ceiling (bread beyond 100 can't count toward 200), not an
  active deferral. "Median bind-days >= 5" was the wrong probe for a
  ceiling; the count delta (10 -> 6) is where it shows.
- The FACED tooth protects SURVIVAL: cap-only (faced off) holds wave-5 at
  6/16 like control but unlocks ~46d earlier, and the village pays in
  blood — 22 named-monster deaths, median survival -65d, table -5.
- v3's combination is justified by the separation: the cap holds the
  wave-5 count down, the faced tooth makes each unlock survivable.
  Neither tooth alone suffices; the question "does the cap alone suffice"
  answers NO on the survival axis even though it holds the count.

## SENSE-TESTING (3 transcripts read)

1. control / leadfeast / s77 (wave4 d60, wave5 d83): the deferral beats
   track the faced count weekly — "The fifth draft stays in the wings...
   1 of 2 kinds faced." (d67, d74, d81) — then d83 "the Producers have
   greenlit the fifth draft" after the second wave-4 kind is faced. The
   wait reads as the village NOT BEING READY, never as a silent gate.
   standingLine narrates the hold honestly ("HELD at wave 4: the fifth
   draft waits (1/2 wave-4 kinds faced)").
2. cap-only / leadfeast / s88 (wave4 d55, wave5 d57): wave 4 opens d55,
   wave 5 opens d57 — two days later, ZERO wave-4 types faced, NO deferral
   beats at all. Two RATINGS beats back to back; the gate opens silently
   and immediately. Reads cheap and unearned — and this is the run class
   that dies to named monsters.
3. faced-only / belongfeast / s22 (wave5 d83): bread 140 + war 75 = 215,
   no cap — but the faced gauntlet still ran (defer4 d50-60 "2 of 3 kinds
   faced", release d60, wave-5 release d83 after 2 wave-4 kinds faced).
   The cap's absence is invisible (no beat says "bread bought the fifth
   draft") — slightly unearned-feeling, but the village fought its way in
   and survival holds (171d median on the leg).

Nothing robotic in the beats; the 7-day reminders advance the faced
count; no fabricated history, no filler loops. The deferral-beat voice
is the legibility layer — removing the tooth removes the only beat that
makes a hold read as "not ready."

## Metric review (§14)

- "Median cap bind-days >= 5" mis-probes a ceiling as a hold. The cap is
  structural (bread >100 never counts toward the T5 bar); it binds only
  on days when raw >= 200 AND capped < 200, which the plenty road rarely
  sustains. PROPOSED for next run: measure the cap's effect as the
  wave-5 count delta with/without the cap (this run: 10 -> 6), not
  bind-days.
- The wave-4 unlock-rate band 0.20-0.60 is miscalibrated for the
  feastscale substrate: control itself is 0.688 (v3 noted the same).
  PROPOSED: control ± 0.15, as the v3 run used.
- Neither revision would have changed this verdict (survival + death-mode
  guardrails fail independently).

## Convergence state

scale-onramp: still blocking — cap-only variant KILLED AT PILOT.
wall numbers this run (control leg, 16 runs): national 8/16, table 12/16,
wins 0/16, wave4 11/16 (med d69), wave5 6/16 (med d109.5), median
survival 176d. The wall is NOT breached by loosening the unlock gate;
if anything this run re-confirms the gate's protective value.
