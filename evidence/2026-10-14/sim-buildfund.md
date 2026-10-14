# sim-buildfund — scale-wall r19: policy-side wave-3 build funding (2026-10-14)

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Axis/lens:** scale-onramp, lever-2 (wave unlock pacing) lens on the war path.
- **Primary metric:** seeds with ≥3 wave-3 ledger points.
- **GO:** ≥2/8 seeds with ≥3 pts AND median survival within ±10d of the identical-seed baseline.
- **KILL:** <2/8 seeds at ≥3 pts, OR median survival outside ±10d.
- **Horizon:** 180d death-aware (WIN-PATH HORIZON 180; dead villages stop simulating).
- **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 (superset of the brief's 11/22/33/44; 8-seed pilot per throughput policy).
- **Policies:** baseline `leadcourt` (gate off) vs armed `buildfund-lead` (BUILDFUND=1), identical seeds.
- **Proof:** scripts/test-buildfund-20261014.js — 26/26 green, every gate-on assertion with a gate-off (or knowledge-off) RED contrast.

## Context

r18 measured that the courtship scholar LOSES wave-3 attrition fights (capability, not motivation — the tribute/tend economy doesn't fund a mid build); the r18 COURTKILL hunting arm was KILLED AT PILOT (3 wave-3 ledger pts across 16 armed runs vs 1/16 baseline); the 9067410c kill-attribution correction shows villager wave-3 kills are ~never (5/6 were the player's turn-based combat, 1 genuine villager kill, 0 trick-involved). The wave-4 war rung is scholar-only in practice.

## Lever played

`scripts/policies/buildfund.js` — BUILDFUND=1 (default OFF), layered on leadcourt. Courtship verbs run first and fully; the fund leg is additive. All verbs already exist in the engine; no game-code changes:

1. **Craft the best honest weapon** — hunting_spear (bonus 30, range 2, no ammo) when recipe L1+ and branch+stone+vine on hand (one attempt/recipe/day; craft() enforces every gate; L1 blind = 35% with materials at risk, success teaches L2). The base policy only ever EQUIPPED what the world gave (stone_knife, bonus 12).
2. **Seek armor** — craft hide_armor (P=20) when recipe known and 2 hide + vine on hand; wear the best armor owned. Base only crafts bark_armor (P=10) as a fallback.
3. **Non-lethal counter play** — the scholar plays wave-3 signature counterplay ONLY when `Game.villageKnowsTrick(mid)` (the same gate the field-fight AI uses; knowledge arrives via villager observation of survived encounters, never kill-gated, never fabricated):
   - spool + record phase → tbPlayerWait (the replay is silence);
   - chorus_line + beat-4 incoming + in the kick cone → step out of the cone (moving on the beat = 0.25×);
   - buffering + 'predict' announced → wait (it whiffs); else close-eyes → guaranteed faintest-frame strike.
4. **Honest fight-selection** — assess the damage race with the FUNDED build (weapon bonus + armor via the variant-B curve + 0.7 discount when a trick is known; wave-aware pessimistic priors: w3=45, w2=25 — the generic 20 prior would make every wave-3 race look winnable). Winnable races mark `ctx._huntCommit` (the committed-fight flag courtkill taught competent.js — reused, not reinvented); unwinnable races decline through the normal flee. The <50% HP suicide guard holds under the gate.

## Pilot results (8 seeds × 2 arms, 180d death-aware, identical seeds)

Verdict: **NO-GO — killed at pilot.** Full JSON: evidence/2026-10-14/sim-buildfund.json.

| arm | GO | w3pts med/max | national | daysMed | court prop/tend |
|---|---|---|---|---|---|
| baseline leadcourt | 0/8 | 0/0 | 3/8 | 65 | 3/17 |
| armed buildfund-lead | 0/8 | 0/0 | 3/8 | 65 | 3/17 |

GO needed ≥2/8 seeds at ≥3 pts: measured 0/8 (MISS). Survival within ±10d: met — per-seed trajectories byte-identical (65 vs 65).

**Why the layer never moved the needle** (all three upstream of the lever):

1. **The recipe chain never starts.** Spear crafts 0/0 tries, hide 0/0 tries on all 8 armed seeds. The honest chain (handle a spear → L1 → blind craft → L2) needs the world to first GIVE the item — on the courtship road, within the survival window, the scholar never handles a hunting_spear or hide_armor. `bfEquipBest` re-equipped best-owned (eq=4–10) but there was nothing better to wear.
2. **Wave-3 unlock is rare on this road.** Only s55 faced wave-3 (3 distinct types); 7/8 seeds never saw a wave-3 monster. The wave-2 ledger bar (4 kill points) doesn't fill on the courtship road — and wave-4 unlocks independently via Standing (s44/s77 faced 2–3 distinct wave-4 with wave-3 never unlocked: diplomacy/plenty opens the gate without the war rung).
3. **Where fights happened, the honest answer was decline.** s55: 6 assessments, 6 declines, 0 commits. The unfunded build (stone_knife DPR 25, no armor) loses every wave-3 race on the numbers — the layer declined rather than feeding the ledger attempts. Trick knowledge `known=[]` on all runs: the village never accumulated 2 observations of one wave-3 type.

**No regressions:** courtship counters identical per seed (prop 2–3, tends 2–56); death causes match the wall profile (monster:combat 134, monster:villager 52, villager:monster 44, sickness 36, starvation 20 across 16 runs); exiled 0/16.

## Reachability verdict

Wave-3 kills are unreachable on the courtship road in this seed set — not because the scholar fights badly, but because the road never delivers the prerequisites: no wave-3 unlock on 7/8 seeds (the wave-2 kill ledger doesn't fill), no spear/hide recipe on 8/8 (the world never hands the scholar the item that starts the knowledge chain), and villages die at median 65d (before any build compounds). The layer's honest selection (decline unwinnable races) is the correct behavior for the builds the road actually funds — it just can't fund them. Wave-4 remains reachable via the diplomacy/plenty Standing paths (6/16 wave-4 unlocks, 0 via war).

## Village assessment

The villages look like villages: grain tends flow (up to 56 on s77), proposals go out (2–3), Leo speaks at Emberhold's table, grandmothers remember who fed them. Then they die — median 65d, max 88d, all village-lost. The death census says combat (134 monster:combat, 52 monster:villager, 44 villager:monster, 32 villager:combat) with sickness (36) and starvation (20) behind it — the same mortality wall the intraviol arm is dissecting. Nobody thrives; the longest-lived (s55, d88) is the one that faced wave-3 and wave-4 and still died with zero wave-3 kills. The missing capability is exactly what the lever named — a funded mid build — but the missing *knowledge* is upstream of the lever: the recipe chain's first link (the world giving the scholar a spear to handle) never fires on this road.

SENSE-TESTING read (s55 transcript): the beats read as a coherent courtship story — tends, proposals, national seat at d78, deaths. The sentimental-item devotion line repeats verbatim across items (already in the findings backlog). Nothing in the transcript contradicts the numbers: the scholar's 6 declined wave-3 races leave no narrative trace, which is itself honest — a declined fight is a non-event.

## Metric review

- The metric (≥3 wave-3 ledger pts on ≥2/8 seeds) measures kills, the correct rung-1 currency — no revision proposed for the metric itself.
- Metric doubt (for the NEXT run, not this one): the metric tests the END of a three-link chain (recipe arrival → wave-3 unlock → winnable race), and this pilot shows links 1–2 are the bind, not link 3. A future build-funding arm should pre-register on an intermediate metric (e.g. seeds where the spear recipe reaches L1+, or seeds where wave-3 unlocks) rather than jumping straight to ledger points. The verdict stands as NO-GO under the registered metric — it is not re-scored.
- Honest-selection note: the layer DECLINES unwinnable races by design, so a seed with zero commits is the layer working, not the layer inert — the ctx counters (bfAssessments 6 / bfDeclines 6 / bfCommits 0 on s55) distinguished the two as designed.

## Blanks filled / documented

- FILLED (policy, then reverted per kill protocol): the courtship scholar never crafted its weapon or sought armor — the build-funding leg closed it behind an opt-in gate (26/26 proof, REAL RED phases). Killed at pilot; policy file deleted, proof + sweep + evidence kept.
- DOCUMENTED: the scholar's OWN survived wave-3 encounters generate no trick observations — `noteVillagerTrickObservation` excludes `vid === 'player'`, so the scholar learns signature counterplay only through villagers' eyes. Appended to the findings backlog.
- DOCUMENTED: the spear/hide recipe chain (handle → L1 → blind craft → L2) requires the world to first GIVE the item — the policy cannot invent the recipe, and on 8/8 courtship seeds the item never arrived. Appended to the findings backlog.
- DOCUMENTED: wave-4 unlocks independently of wave-3 (Standing gate) — s44/s77 faced wave-4 with wave-3 never unlocked. The war rung is one path among three, not the gate.

## Wall numbers

national 6/16 · table 0/16 · wins 0/16 · wave-4 unlocks 6/16 (all via Standing, 0 via war) · wave-5 unlocks 0/16 · median survival 65d · max 88d · exiled 0/16 · peopleDeaths 182
