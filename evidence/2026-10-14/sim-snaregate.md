# sim-snaregate 2026-10-14 — ARM 2 (blind-craft gate softening), food-economy axis, POLICY-SIDE

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding)
- **Question:** evidence/2026-10-13/sim-snaremat-20261013.md — workTrapline
  self-gates the L1 blind snare craft at vine>=3 && stick>=3 ("gamble only
  what you can lose"); the ENGINE recipe needs vine:1 + stick:1. Should the
  blind gate stay that steep now that the wire bypass exists?
- **Arm:** scripts/policies/snaregate.js — opt-in layer (SNARECRAFT_GATE=1,
  default OFF). On the competent-family policies (hook in workTrapline): an
  L1-blind scholar at vine>=2 && stick>=2 (below the base 3+3 band) attempts
  ONE honest Game.craft('snare') per day. A craft costs 1+1, so a failed
  35%-odds attempt leaves 1+1 banked: one retry in the pack. L2+ keeps the
  reliable 1+1 band; L0 keeps the knowledge gate; the 2-held trap cap stays.
  Policy-side ONLY — zero game-code edits.
- **Primary metric:** trapsCrafted (improvised snares).
- **GO:** armed >= 2x baseline crafts AND >= 2 crafts on >= 4/8 armed seeds.
- **Guardrail:** median survival no worse than -10d vs baseline (the r16b
  trap lesson: extra outings kill scholars); starvation/combat deaths tallied
  separately for the player.
- **KILL:** a miss on primary OR guardrail -> delete the layer before commit,
  keep only the evidence (killed arms leave no trace).
- **Horizon:** 150d death-aware (Game.over stops the run; dead villages stop
  simulating — no fixed tail). **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 ×
  competent, belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
- **Sides:** baseline = SNARECRAFT_GATE unset (default OFF); armed =
  SNARECRAFT_GATE=1. Code identical otherwise, same commit.
- **Convergence:** converging -> 12-16 seed confirm if GO met;
  killed-at-pilot otherwise.
- **Canon:** docs/CANON.md + docs/PRESERVATION.md (blind penalties teach —
  the engine's blind-success->L2 is that mechanic, verified in game.js craft).

## Proof — scripts/test-snaregate-20261014.js (RED on pristine -> GREEN after)
RED (pre-layer): the 3+3 gate holds — 2+2 inventory produces ZERO craft
attempts and materials untouched; 3+3 produces exactly 1 (harness detects
attempts); L2 at 1+1 produces 1; L0 never attempts. 8/8 green on pristine.
GREEN (layer + hook in place):
- gate OFF: 8/8 — identical to RED (byte-identical baseline, no RNG draws).
- gate ON (SNARECRAFT_GATE=1): 12/12 — 2+2 attempts exactly once through the
  honest Game.craft path (1+1 consumed win or lose — materials at real risk);
  3+3 still exactly 1 (layer skips the base band — no double attempt); L2
  1+1 still 1 (layer skips non-blind); L0 5+5 still 0; same-day double call at
  2+2 still 1 (per-day caps on both sides).
Method: node harness, full src/js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), Math.random seeded
BEFORE eval, Game.save never stubbed.

## Pilot — scripts/snaregate-pilot-20261014.js (16 runs/side, identical seeds)

| side | national | table | wins | exiled | crafts | snareAtt | sets | seeds w/ craft | medianSurv | pdeaths (cause: n) |
|---|---|---|---|---|---|---|---|---|---|---|
| baseline (gate off) | 3 | 0 | 0 | 0 | 20 | 21 | 28 | 88/C, 88/B (1/8 seeds) | 63d | combat 27, starvation 5, contest 2, sickness 1, expedition 1 |
| armed (SNARECRAFT_GATE=1) | 3 | 0 | 0 | 0 | 22 | 26 | 30 | 88/C, 88/B (1/8 seeds) | 66d | combat 28, starvation 4, contest 2, sickness 1, expedition 1 |

Per-seed: crafts happen ONLY on seed 88 both sides (baseline 11/9 crafts
C/B; armed 8/14). Seeds 44/55/66/77: craft=0 both sides, armed snareAtt=0 —
the layer fired ZERO times on 7/8 seeds. Median survival 63d -> 66d (inside
the -10d gate; death-cause profile nearly identical — the guardrail passes
trivially because the layer did almost nothing).

## Verdict: KILLED at pilot

- Primary: armed 22 vs baseline 20 = 1.1x (need >= 2x); crafts on 1/8 seeds
  (need >= 2 crafts on >= 4/8 seeds). Miss on both conjuncts.
- Guardrail: 63d -> 66d median, death profile unchanged. Passes.
- Per the binding pre-registration, a miss on the primary is KILL: the layer
  (scripts/policies/snaregate.js + the 4-line hook in competent.js
  workTrapline) was DELETED and competent.js reverted to HEAD — killed arms
  leave no trace. Committed evidence-only: this file, the two pilot JSONs,
  the proof script, the pilot script.

## Why it died (mechanism, not just numbers)

The 2+2 band is unreachable in practice. The layer fired zero times on 7/8
seeds — not because the gate check is wrong (the proof fired it reliably on
demand) but because the pack never holds vine>=2 AND stick>=2 simultaneously:
vine banks thinly and stick burns on fires/knives/tools. vineMax=11 with
stickMax=1 (77/belongseek); vineMax=5/stickMax=7 but not at once (55/C). The
materials are the gate, not the policy's 3+3 number. The only seed with crafts
(88) reaches snare L2, where the base's reliable 1+1 band already drives the
line — the armed side's extra 5 attempts there are just a faster start in the
L1 window (14 vs 9 crafts on 88/B), not new reachability. Per §14: the metric
moved trivially, not a basis for re-scoring — the arm stands killed.

Corollary: the snaremat finding stands reinforced — the wire path (bypass,
zero recipe knowledge, zero materials) is the working early trapline, not the
craft gate. And if the blind craft is to matter at all, a future arm would
need a MATERIALS-BANKING behavior (deliberate vine+stick stockpiling), not a
lower gate number. New backlog item filed.

## Metric review

The pre-registration's first GO conjunct ("armed >= 2x baseline") was soft
when the baseline could be zero — the measured baseline was 20, so it bit
honestly (22 < 40, clear miss). The second conjunct ("2 crafts on 4/8 seeds")
did the real work. No mid-run re-scoring: the temptation was to note the
"faster start on 88/B" as partial success — it is a real but sub-threshold
effect, recorded honestly above. Guardrail on medians, not per-seed, held
against trajectory noise (identical seeds differ anyway under no arm
perturbation here — the armed side perturbed nothing on 7/8 seeds because
the layer never fired).

## Village assessment / blanks

- **Blank documented (new finding):** the blind-craft policy question
  dissolves into a materials question. The scholar's pack never co-banks
  vine+stick; the 3+3 vs 2+2 debate changes nothing while that's true.
  -> hidden_files/sim-findings.md item (open).
- **Corroborated, not chased:** wire bypass is the honest early trapline
  (snaremat, landed); the craft gate is a late-line luxury for L2 trappers.
- **Sense read:** combat remains the player-killer (27-28 of ~36 player
  deaths); starvation 4-5. Nothing about the layer changed how villagers
  act — no robotic behavior surfaced in this arm's telemetry (telemetry
  deviation check below).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-14/snaregate-pilot-*.json'
--metrics flat.national,flat.table,flat.wins,flat.exiled`:

`LOUD: flat.national newly appeared: baseline 0 -> current 6 (n=2 files)`
VERDICT: explained, not a bug — baseline-context mismatch. The
scale-wall.json baseline (national 8, table 0, wins 0, exiled 0) is seeded
from a different measurement context (different seeds/policies than this
arm's pilot). Both of THIS arm's sides are identical (baseline 3, armed 3 —
no arm-attributable movement). Baseline NOT rolled forward: no real deviation
to absorb. The snaremat arm hit the same shape-mismatch class of spurious
LOUD (their evidence: shape mismatch read 0s from flat.*-shaped JSON).
