# Tuning log, 2026-10-15

Steve: "Keep on running simulations and adjusting levers!" / "Those targets
are all flexible. If a subclass doesn't appear, that either means we need to
tweak the game or it's truly useless and maybe needs cut. Feel free to be
flexible."

**Method:** `scripts/sweep-dashboard.js`, the capable bot, 64 seeds × 150
days (the standard 16 plus seeds 10–41 and 43–58), one process per seed, 3
at a time. The same seeds every time. A full 64-seed sweep takes about 3
minutes. Each dashboard is in `dashboard-<label>.json` and `.md`. Compare
two of them with `node scripts/sweep-dashboard.js --compare a.json b.json`.

**Targets** (they guide; they don't gate):
- player level-ups about 8 (median)
- ascension in 25–40% of runs past day 100
- subclasses seen: 14 or more of 20
- wins don't depend on godhood
- THE NETWORK and THE HOSTS: almost impossible, but more than 0
- no single death cause dominates
- village survival no higher than about 75%

## Baseline (`dashboard-base`, origin/master 3a87e8fe)

| Metric | Base | Target |
|---|---|---|
| Won / sat / invited | 30 / 31 / 39 | — |
| Wins with / without a player ascension | 7/18 (39%) / 23/46 (50%) | not dependent: **met** |
| Village lost | 25 (survival 61%) | ≤ 75% survival: **met** |
| Median days | 98.5 | — |
| Player level-ups, median (min–max) | 9 (4–14) | about 8: close |
| Subclasses seen | 10 / 20 | 14: **not met** |
| Player ascension, runs past day 100 | 15/29 (52%) | 25–40%: **too high** |
| Overtime / Network / HOSTS | 0 / 0 / 0 | more than 0: **0** (see below) |
| Player deaths | 305: combat 208, contest 22, sickness 21, dehydration 20, starvation 19 | — |

**Other findings:**
- **Player track level-ups over 64 runs:** social 231, field 166, strange
  82, combat 78, **craft 1**. The bot never cooks (a villager is on cook
  duty), and its crafts almost all fail for lack of materials. So the
  player's craft kit (caregiver/healer, survivalist/furnace,
  forager/feaster) only reaches the player through the job lean on other
  tracks. Logged; not tuned.
- **Skill lessons:** 33 per run, all between villagers. The player never
  teaches or learns a skill (0 / 0). The bot doesn't use skill teaching; this
  is a bot gap, logged.
- **Overtime is never reached:** the capable bot takes the seat as soon as
  it is ready (day 90+). Without Overtime, THE NETWORK can't be summoned. To
  measure "almost impossible", a bot variant would have to wait. Logged.

## Round 1: bot fix, water and the way home (KEPT)

**Diagnosis.** Is dehydration a water problem or a bot problem? It's the
bot. I traced the bearer's day-by-day water state on the dehydration
deaths:
- **Seed 42:** the bearer stands at (3,5), next to Haven (4,4), for 5 days
  with no bottles. A fallen tree guards Haven's west and south approach.
  `competent.walkTo` gives up at the first refused step, so the bearer never
  gets home, starves and dries out.
- **Seeds 2026 and 43:** the bearer is fed (kcal over 2000) but sits on a
  trail tile for 6 days at hydration 0, while Haven's cistern holds clean
  water. `recovering()` only reads kcal and hp, so nothing sends a parched
  bearer home.

A human would tap "Go around" and walk home to drink. The water supply
(cistern 5–30 L clean) was never the problem.

**Fix (bot only, `scripts/policies/competent.js`, opt-in
`COMPETENT_ROUTE_AROUND=1`, set by capable):**
- `walkTo` routes around a refused step: a BFS over the orthogonal steps
  the engine's own `travelBlockage` allows.
- A new **thirst-home** step: when the bearer carries no water, hydration is
  under 45 and they aren't at Haven, they walk home and drink first.

Legacy policies are unchanged, because the gate is off for them.

| | Base | Route-around only | **Route-around + thirst-home** |
|---|---|---|---|
| Won / sat / invited | 30 / 31 / 39 | 27 / 27 / 34 | **32 / 32 / 39** |
| Village lost | 25 | 25 | **21** |
| Median days | 98.5 | 104 | 97.5 |
| Player level-ups, median | 9 | 9 | **8** |
| Subclasses seen | 10 | 11 | 10 |
| Ascension, runs past day 100 | 15/29 (52%) | 19/33 (58%) | 14/29 (48%) |
| Player deaths | 305 | 289 | **251** |
| dehydration | 20 | 15 | **4** |
| starvation | 19 | 6 | **5** |
| sickness | 21 | 15 | **12** |
| Villager deaths | 404 | 408 | 429 (+6%) |

**Decision: kept.**
- Player deaths from dehydration fell from 20 to 4 and from starvation from
  19 to 5.
- Wins rose by 2 (within noise) and villages lost fell by 4.
- Villager deaths rose 6%, under the 10% line. A bearer who lives longer
  leads more fights.

**Proof:** `scripts/test-capable-water-route-20261015.js` (6 checks, quick,
on the green list).

**Verdict for ROADMAP §3:** the rise in dehydration deaths after the origins
merge was a bot behaviour gap, not an eastern-woodlands water problem.
