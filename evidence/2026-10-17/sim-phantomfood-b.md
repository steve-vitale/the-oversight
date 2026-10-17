# sim-phantomfood-b — remainder-carry kills the stockSurplus rounding blank; the metric, not the fix, broke
Date: 2026-10-17 · Loop B (fleshout-loop-b run fleshoutb-20261017-044925) · food-economy axis
Claim: sim-findings.md `[claimed by loop B sim-phantomfood-b, run fleshoutb-20261017-044925]`
Worktree: ~/workspace/worktrees/sim-phantomfood-b · main tree untouched · coordinator owns landing

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14)
- PRIMARY: systematic phantom eliminated. Instrument stockSurplus (wrap or fixture-level) to measure sum(units*200 − give) per run. GO: |total phantom| ≤ 200 kcal on every armed run (vs control's systematic positive, expect ~+5–7k/run on the wasterate seeds). Judge against this header only.
- GUARDRAILS (all must hold): national ≥ control−2; median survival within ±10d; starvation ≤ control+2; no new death mode; no crash. (Villages get honestly leaner — guardrails catch catastrophe, not the intended leanness.)
- DET-GATE: gate-off (fix disabled) trajectories byte-identical to pristine on 4 seeds (proves the fix is the only delta). Gate-on trajectories WILL differ — honest, pantry levels change.
- CONSERVATION: pantry conservation identity S0+in−out−rot=end must hold at 0.00% residual (per the wasterate-b method) — the fix must not break accounting.
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat courtship, food-economy). 8 fresh seeds × {leadfeast,belongfeast} × {control,armed} = 32 runs, 180d death-aware, identical seeds, own paired control in the same sweep.
- SMOKE green before sweep spend. PILOT GATE: the 32-run sweep IS the pilot (8 seeds); no confirm unless GO with a clean mechanism.
- SENSE: read 1–2 transcripts around surplus-sharing beats; the fix must be voice-invisible.

## THE BLANK
stockSurplus `Math.round(give/200)` mints systematic phantom food: ~+72 kcal/call (+6,731 over 93 calls/12d on seed 4301) when `give` sits in [100,200). The "symmetric error" comment is wrong for the observed give distribution. Phantom is real pantry kcal (eaten, rots); inflates absolute levels. Needs an engine fix (remainder-carry), not an instrument fix. (sim-findings.md, claimed 2026-10-17)

## THE FIX (src/js/game.js, stockSurplus + one gate helper — nothing else touched)
Remainder-carry: the village carries its sub-unit surplus in `v._surplusRemainder`
(always < 200 kcal, a plain number on the village object). `units =
floor((remainder + give) / 200)`; the fraction waits for the next share. This
kills BOTH dishonesties: the +72/call phantom mint in [100,200), and the silent
evaporation of crumbs < 100. PRESERVED: 200-kcal unit size, freshDay = v.day+3
clock, spoilDay-matched stacking, the pantry-cap door (lossy exactly as before),
the 'Foraged food' item shape. No narration changes.
Legacy gate: `PHANTOMFOOD_FIX=0` (node only, the repo's established
`typeof process !== 'undefined'` pattern) restores the pristine Math.round path
byte-for-byte for the det-gate proof; the legacy branch never writes the
remainder field. Save safety: plain deterministic number, JSON-safe, lazy-inits
on legacy saves; the trajectory hash reads pantry kcal only.

## PROOFS
- Fixture scripts/test-phantomfood-20261017.js: RED on pristine (5 failures —
  5×150 deposits 1000 for 750 given = +250 minted; 4×50 evaporates 200),
  GREEN on fixed (15/15: exact units, remainder accumulates then emits, cap +
  fresh-clock + stacking + item shape preserved, legacy gate restores
  Math.round, voice-invisible).
- Det-gate scripts/det-gate-phantomfood-20261017.js: gate-off (PHANTOMFOOD_FIX=0
  on the fixed tree) BYTE-IDENTICAL to pristine on 4 seeds × {leadfeast,
  belongfeast}, 40d each (8/8 digests match). The fix is the only delta.
- Instrument det-gate (r27): with both instruments attached, 40d reruns
  byte-identical per policy — instruments are pure read + call-through.
- SMOKE: 15d × {leadfeast,belongfeast} × {control,armed}, instrument live
  (~107–109 stockSurplus calls/run), conservation |rel| ≤ 3% — all green.

## RESULTS (32-run sweep, scripts/sweep-phantomfood-20261017.js + analyze)
Per-seed JSONs: evidence/2026-10-17/perseed-phantomfood/ (numeric wall keys).
- PRIMARY (letter): MISS on all 16 armed runs — |phantom| 90k–692k, not ≤ 200.
  Control is systematically NEGATIVE (−11k to −943k, mean −341k), not the
  pre-registered +5–7k. The 12-day measurement that motivated the claim caught
  the early mint regime; over 180d the pantry pins at cap and the cap door
  evaporates 200–900k/run of shared surplus (ge200 band: −5.26M control /
  −6.19M armed over the sweep).
- MECHANISM (the actual blank): rounding residual = −remEnd, |·| ≤ 199 on ALL
  16 armed runs (max 198.96 < 200 bound). Decomposition per run, e.g.
  leadfeast-armed-s4313: phantom −630,961 = rounding(−161.3) + capTrunc(−630,800).
  The Math.round mint and the crumb evaporation are both dead; 100% of the
  PRIMARY miss is cap-truncation — the mechanism the task ordered preserved.
- CONSERVATION: residual EXACTLY 0.00, |rel| 0.0000% on all 32 runs. The
  remainder is off-book by design (never enters the pantry); accounting holds.
- GUARDRAILS: national 7/8 vs 7/8 (leadfeast) ✓, 4/8 vs 5/8 (belongfeast) ✓;
  starvation 5 vs 3 ✓, 6 vs 4 ✓; no crash (32/32) ✓; no systematic new death
  mode ✓ (one NIGHT-OVER singleton — hunger-adjacent overnight death, explicitly
  not starvation per the classifier — on 1/16 armed runs: trajectory noise).
  Median survival: leadfeast 170d vs 139d — letter-miss, but in the BENEFICIAL
  direction (see village assessment); belongfeast 140.5 vs 136 ✓; pooled
  147.5 vs 136 ✓.
- WALL (pooled): control national 12/16, table 14/16, wins 0/16, wave4 0/16,
  wave5 0/16, median 136d, max 182d; armed national 11/16, table 16/16,
  wins 0/16, wave4 1/16, wave5 0/16, median 147.5d, max 182d, starvation 11 vs 7.
  The scale wall stands (no wins, wave 5 unreached); one armed wave-4 unlock.

## SENSE READ (evidence/2026-10-17/phantomfood-beats/, 2 transcripts × 60 beats)
Villagers read as people: checking the pantry before heading out ("the shelves
are full, ~6 days of fresh on hand… leaves the fish nets standing and turns to
the water run instead"), foragers returning with specific hauls ("Catalina came
back with 529 kcal of something edible. The pantry breathes."), the half-ration
trust beat ("they don't trust you yet"), someone getting a stomach ache from a
bad meal. The fix is voice-invisible: zero beats mention the mechanism (two
regex hits were false positives: "round fruit", "their foragers are on your
turf"). Coherent, consequential, no robotic repetition.

## VILLAGE ASSESSMENT (who thrived/died/why)
1,587 classified deaths across 32 runs: 1,563 NON-HUNGER (967 combat, 324
villager combat, 140 monster, 56 expedition, 26 contest), 18 STARVATION, 1
NIGHT-OVER, 5 WATER-DEHYDRATION. The villages EAT — there is no starvation
spiral — and then wave 3 kills them: 30 of 32 runs end village-lost at wave 3,
d97–182. The food economy keeps them fed; the combat wall ends them.
Seed s4318 is the lean-start collapse (d39–45, wave 2, the only early
starvation deaths); the fix extends it (d75/d107) because carried crumbs —
not evaporated ones — feed the lean early game. Seed s4317 survives to d182 on
both sides. Armed villages survive LONGER on 12 of 16 seeds (mean delta +17d):
the median-survival "miss" is the fix's intended mechanism working, not
catastrophe.
BLANK FILLED: the stockSurplus rounding blank (mint + crumb evaporation) is
dead by mechanism on all 16 armed runs. BLANK DOCUMENTED (new, filed in
sim-findings.md): the pantry-cap door evaporates 200–900k/run of villager
shared surplus once the pantry pins at cap — while v.gives ledgers record the
full share. The contribution ledger overstates actual village receipts under
cap pressure; a future arm owns the cap-door semantics (this arm was ordered to
preserve them).

## METRIC REVIEW (§14 — doubts and revisions for the NEXT run, never re-scored here)
1. The PRIMARY's control expectation ("systematic positive, ~+5–7k/run") was
   measured in the 12-day mint regime and is wrong in sign and scale over 180d:
   control is systematically −200k to −900k (cap-evaporation dominates once the
   pantry pins). The bar |total phantom| ≤ 200 conflates two mechanisms —
   rounding-phantom (the claimed blank, killed: |−remEnd| ≤ 200 on 16/16) and
   cap-truncation (preserved by design per the task brief).
2. Proposed corrected PRIMARY for the next run: rounding-phantom = −remEnd,
   GO |·| ≤ 200 on every armed run; cap-truncation reported separately as its
   own instrumented blank (it deserves an arm, not a footnote).
3. The "median survival within ±10d" guardrail needs a direction clause:
   as written it fails a fix that makes villages live LONGER (170d vs 139d).
   Guardrails catch catastrophe; add "or longer-lived" to the pass condition.
4. The "no new death mode" check should run at the classifier's cls level,
   not on raw cause strings (monster names like 'Sir Blinds-A-Lot' diverge
   with trajectories and are not modes). Singleton classes (n=1) with the
   starvation guardrail green are noise until replicated.

## VERDICT
NO-GO on the literal pre-registered PRIMARY (|total phantom| ≤ 200 missed on
16/16 armed runs — 100% cap-truncation evaporation, the preserved mechanism).
Classification per the kill-value taxonomy: METRIC-BROKEN, not concept-dead.
The fix does exactly what the claimed blank asked: the Math.round mint and the
crumb evaporation are both dead by exact mechanism on all 16 armed runs
(rounding residual ≤ 199 < 200 bound), fixtures RED→GREEN, det-gate
byte-identical, conservation 0.00% exact, guardrails green on intent (the two
letter-misses are a beneficial survival direction and a singleton noise death).
RECOMMENDATION: do not kill the fix — re-run with the corrected metric
(metric review §2) as a new run per the §14 escape hatch. The cap-door
evaporation is filed as a new [open] blank for a future arm.

## CONVERGENCE
Axis: food economy. State: mechanism proven, metric misregistered —
converging on the corrected metric, not yet converged. The rounding blank is
closed as a mechanism; the cap-door blank is open and now instrumented.
