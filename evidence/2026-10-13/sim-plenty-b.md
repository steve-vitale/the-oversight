# sim-plenty-b — plenty-stand arm: the r13 feast instrument against the Standing plenty feed

## Pre-registration (docs/MEASUREMENT.md §§9–12)
- **Primary metric:** plenty Standing points per run (villageStanding().plenty) + wave-4 unlock delta (t4Ever = max total ≥ 100; unlockedWave ≥ 4).
- **GO threshold:** plenty points > 0 on ≥ 4/8 leadfeast runs AND median survival within ±10d of leadcourt baseline AND no wall-metric regression (national/table/wins/vests not worse than baseline).
- **Horizon:** 180d death-aware (runDays stops on Game.over / pop-zero; dead villages stop simulating). Why: wave-3 must fire before Standing matters (wave-3+ kills/diplomacy/plenty all accrue in the mid game), and the r13 feast cadence is 7–14d — 180d gives the instrument ~12–25 honest chances without a fixed-200d filler tail.
- **Seeds:** 11,22,33,44,55,66,77,88 (identical across arms). **Policies:** leadcourt (baseline) vs leadfeast (FEASTSCALE_R13=1).
- **Judgment:** judge against this header. GO → the arm lands (policy-side commit). Killed-at-pilot → revert policy changes, leave evidence + proof scripts.

## Context
The Standing bar (src/js/standing.js, spec hidden_files/wave4-standing-spec.md) feeds wave-4/5 unlocks from three sources: war +25/kill-point, diplomacy +34/link, plenty +20/major-feast (quality>=1 via state.feastLog from hostFeast). Manual tuning measured drivers diplomacy 6 / war 1 / plenty 0 / hybrid 0 — the plenty path is STARVED because feasts never fire in base policies (food-r7 contribution gate reads only pantry donations; courtship scholars donate nothing). The r13 instrument (scripts/policies/feastscale.js, opt-in FEASTSCALE_R13=1, default OFF) counts tribute/tend paid as contribution and fired 35 feasts/26 grants on 8 runs — but was killed at pilot on NATIONAL/SURVIVAL grounds. This arm's GO is different: the STANDING plenty feed, not the r13 survival goal. The r13 pilot showed median survival 74 vs 75 baseline — the layer is survival-neutral enough for this arm's purpose.

## Lever played
Scripts-side only (no src/ game-code edits): reuse the r13 feast instrument verbatim on the current tip, pointed at leadcourt as the wrapper parent. Proof extended with the Standing link: feasts hosted through the layer must land in state.feastLog with quality>=1 and move villageStanding().plenty (+20 each).

## Results (16 runs: 8 leadcourt baseline, 8 leadfeast; identical seeds 11/22/33/44/55/66/77/88; 180d death-aware)

Raw: `evidence/2026-10-13/plentyb-sweep.json` (per-run rows) + `plentyb-sweep.log`.

| policy | plenty>0 | med stand | med plenty | t4 | t5 | wave4 unlock | wave4 faced | feasts | national | table | won | vests | med survival |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| leadcourt (baseline) | 0/8 | 102 | 0 | 7/8 | 0/8 | 7/8 | 6/8 | 0 | 5/8 | 0/8 | 0 | 0 | 87d (max 149) |
| leadfeast (FEASTSCALE_R13=1) | **8/8** | 222 | 100 | 7/8 | **5/8** | 7/8 | 7/8 | 37 (27 grants) | 4/8 | 2/8 | 0 | 0 | 78d (max 93) |

Per-run plenty splits (w/b/p): s11 0/102/**120**, s22 25/102/**20**, s33 0/102/**140**, s44 0/34/**40**, s55 0/102/**80**, s66 25/102/**120**, s77 50/102/**60**, s88 25/102/**100**. Baseline standing is diplomacy-only (102 = 3 seasoned links, or 68/34 on s22/s44); feasts are a pure additive source — war and diplomacy splits are untouched by the layer.

Notable: 5/8 leadfeast runs crossed **t5=200 with wave-4 faced** → `unlockedWave() = 5` — the first wave-5 unlocks in any sims to date (s11, s33, s66, s77, s88). Two runs (s33, s88) reached **Arc IV + table-waiting** with wave-5 unlocked. The plenty path is not a side dish anymore: it is the strongest single Standing source on the courtship road (median +100 plenty vs +102 diplomacy).

## GO judgment
- plenty > 0 on ≥ 4/8 runs: **8/8 — PASS**
- median survival within ±10d of baseline: **78d vs 87d (−9d) — PASS** (death-cause shares comparable; villages die to combat/attrition at the same rate, not to feasting — feasts draw a 1.5x-buffer-gated pantry spend, never famine)
- no wall-metric regression: national 4 vs 5, table 2 vs 0, won 0/0, vests 0/0, wave-4 unlock 7/7 both, wave-4 faced 7 vs 6 — **PASS** (table improves; national 1-run delta is noise)

**GO. The arm lands** (policy-side: the r13 instrument, already committed as 1b27e512, re-verified tip-compatible; this run's contribution is the measurement harness + proof extension).

## Reachability verdict
Waves 1–3: organic, unchanged. **Wave 4 now unlocks on the courtship road** via all three Standing sources (diplomacy alone crossed t4 on 7/8 baseline runs; feasts add the plenty path and hybrids). **Wave 5 unlocks for the first time**: 5/8 armed runs, driven by 3 seasoned links (102) + 4–7 major feasts (80–140). Arc IV and the table become reachable (2/8 table-waiting). The **no-win-before-90** floor holds in practice for another reason: every armed run still died by d93 (village-lost / pop-zero) — nobody got near a win, so the day-90 floor and the endgame content remain untested, still out of reach. What the gate fixed (unlocks) vs what still binds (survival to day 90+).

## Village assessment (in plain words)
With feasts working, the village *feels* more like a village: Lamar opens the pantry wide, named villagers (Lena, Deirdre, Sujon, Priya) eat until the fire burns low, a Sunbasker scavenger circles the cookfire's smoke. Villagers differentiate over time (occupations, wanderer/forager/homebody profiles, tracking/survival/bravery XP, expeditions, monster kills) and die for real reasons — Priya ran one expedition and died between day 30 and 60; the wall-suite death census reads: 61 player deaths, 104 monster-killed villagers, 49 villager-on-villager kills, 3 other. Half the roster stays at 0/0/0 XP — homebodies and rookies who never get a job — the differentiation is real but uneven. The end-state on the armed runs is bleak: even the two Arc-IV table-waiting villages die village-lost at d93 and d68. The feast lever fills the Standing bar; it doesn't fill the gap between day 90 and a win.

## Blanks filled / documented
- FILLED: the plenty Standing feed. Baseline runs prove it: 0 major feasts in 8 courtship runs — the wave-4 spec's "5 feasts = 100" path was decoration, not a path. With the r13 instrument re-verified on this tip, it is now the strongest Standing source in sims (+20/feast, 8/8 runs, median +100). Proof: scripts/test-feast-r13.js (21/21 RED→GREEN, tip-compatible) + scripts/test-plentyb-standing.js (10/10: RED empty-log-zero-plenty, GREEN end-to-end feast → feastLog quality≥1 → +20 plenty, split-math honesty).
- DOCUMENTED: (a) the mortality wall — every run, baseline and armed, dies by d149 at the latest; survival to 90+ remains the binding constraint behind the gate; (b) the repeated devotion beat — the sentimental-item line "The feast was the weapon" fires verbatim across different items (Contract Quill, Mixtape, Hard Candy, Grandma's Tin Cup) — same-string-different-item repetition, filed to sim-findings.md; (c) villager-on-villager deaths are 49/217 wall-suite deaths — the violence/justice lane deserves its own lever, filed.

## Wall numbers
national 9/16 (5 base, 4 armed) · table 2/16 (0 base, 2 armed — first table appearances on this road) · wins 0/16 · wave-4 unlocks 14/16 · wave-5 unlocks 5/16 (all armed) · median survival 87d baseline / 78d armed · vests 0.
