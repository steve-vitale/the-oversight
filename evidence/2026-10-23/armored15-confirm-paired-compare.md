# armored15-confirm — §15 manual paired analysis (in place of the balanced panel)

Run: fleshout-20261023T1115Z | corpus: 32 configs (seeds 68301–68308 ×
{leadfeast, belongfeast} × {control, armed}), 180d death-aware, anchor
db7a0456381dd2e8dff70c90f1a956d29f292fbb (single, verified).

## Why the panel is invalid-by-contract here (stated explicitly, per §15)

scripts/balance-panel.js is the instrument for GAME-CODE before/after changes:
its identity is a sourceDigest over src/ + scripts/policies + observer files,
its proofs are observer-neutrality proofs, and its judge is the all23 contract
metric set (scripts/balance-metrics.json). This confirm has:

1. NO source difference between arms — the tree is byte-identical; the ONLY
   difference is the env flag ARMORVILLAGE=1 read by policy code. The panel's
   sourceDigest/sourceHead comparison would judge nothing.
2. A binding primary OUTSIDE the contract — armored15 median-of-medians (a
   waveCombatReadiness(5).armored read) is not in the all23 metric set; the
   panel cannot instrument or judge the pre-registered metric.

So: no panel runs; the manual paired analysis below is the §15 instrument
replacement, with matched-seed pairing (the panel's pairing discipline) and the
§14 pre-registered bar as the judge.

## Paired analysis (seed × policy pairs, armed − control)

- PRIMARY armored15: per-seed medians control [6,3,3,3,2,2,4,3] → median 3;
  armed [7,3,6,4,5,2,7,3] → median 5. 7 of 16 pairs move up, 9 tie, 0 move
  down. **The pilot's 3→5 move replicates exactly on fresh seeds.**
- ENGAGEMENT: deposits ≥2 on 8/8 armed seeds (range 1–40/config); equipped
  from pile/hand-off ≥2 on 8/8 (range 3–39/config). The structure fires end
  to end on every seed; the pilot's mechanism bars replicate.
- Crafts: 0/8 armed (informational — the pilot root-caused this to the starved
  communal materials inflow, not a broken beat).
- Survival paired diffs: sorted [-54,-28,-18,-14,-5,-5,1,1,10,15,22,29,41,55,57,77],
  median +10d — the same symmetric deterministic-chaos tails as the pilot.
  Unpaired medians: control 122d, armed 144d.
- Starvation: control 8 / armed 12 over the corpus. Autopsy: excess concentrated
  in 2 of 16 pairs (68302-belongfeast +3, 68306-leadfeast +2, 68306-belongfeast
  +1) on seeds that starve in control too (68306: control 3, armed 6); 13 of 16
  pairs are 0 or negative. Activity↔starvation Pearson r = 0.149 (no lever
  tracking). Armed lived +184 more village-days (+9.3% exposure); starv/100
  village-days 0.41 → 0.56. Pilot+confirm combined: control 20 vs armed 23.
  The armorvillage policy has no food path (armor deposit/gift only, proven
  unit-conserving in the pilot). Verdict: rare-event noise + denominator
  blindness, NOT lever harm. The absolute-count guardrail as pre-registered is
  judged NO-GO without re-scoring; next run should use starv/100 village-days.
- Death-cause shares sane; no new death kinds armed-only.
- Wall block (matched corpus): wave-5 unlocks control 0/16 → armed 2/16
  (68301-leadfeast survived to d180 with arm15med 7; 68304-belongfeast d106).
  The wave-5 door's armor leg opened on armed seeds and on no control seed.
  national 4→6 (ever 10→11), table 15→15, wins 0→0, exiled 0→0.

## Telemetry deviation check (§14 step 10)

Against regime baseline scale-wall-preseat.json (the winseat scale-wall.json
regime block explicitly forbids pre-seat comparisons; --metrics
national,table,wins,won,exiled):
- LOUD control: national 21 → 4. LOUD armed: national 21 → 6.
- Verdict: EXPLAINED, not a bug. (1) n artifact: baseline corpus n=32, mine
  n=16 per arm (65.6% vs 25%/37.5%). (2) Regime artifact: the baseline
  substrate carries NODEWITNESS=1/VETREL=1 (the pro-diplomacy stack that
  national reach leans on); the pinned substrate here does not (ARMORYDRIVE=1,
  KILLDISC=1 pinned instead). National IS reachable here (control 4/16 final,
  10/16 ever — vs the standing directive's 2026-10-12 0/12×200d on yet another
  substrate), just at a lower rate. Within the matched corpus the lever does
  not depress national (4 → 6). table/wins/exiled all quiet (table 15/16 both
  arms, wins 0, exiled 0).
- Baseline NOT rolled forward: this run is not the regime's baseline source
  (different substrate); rolling it forward would corrupt the preseat baseline.
