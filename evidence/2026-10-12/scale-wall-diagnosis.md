# Scale-wall diagnosis — the binding constraint (2026-10-12)

**Diagnosis only. No game-code changes.** Worktree `scale-wall-now`, branch for review.
Sibling sim-food-r8 is playing with the food lever; this probe does not touch game code.

## The binding constraint (one paragraph)

The LEAD road — the game's advertised primary path to national ("Three seasoned bonds under ONE head," beat 5) — is **structurally unreachable, not merely hard**. A subordinate link forms at trust 30; the one-time first-gesture gift (+10) takes link #1 to 40, but the weekly trust process in `linkTick` (hierarchy.js) has negative expected drift at every trust level below 80: arrival fires with probability trust/100, paying +1 on arrival and −4 on every miss, while −8 speaker-death haircuts and −4 shortfalls bypass the mourning choke. Monte Carlo of the exact coded process (20,000 trials): links #2+ (start 30, no gesture) have **P=0.0000** of ever holding trust ≥40; link #1 (start 40) holds ≥40 across the 30-day seasoning window with **P≈0.02–0.09** in the best case, collapsing to ~0.004 when the subordinate's pantry runs dry — and subordinate pantries are frozen between player approaches (`simVillageDay` runs only on approach/catch-up), so a flat 4,000 kcal/week tribute bankrupts them in ~2 weeks, after which every week is a −4 shortfall. National needs **three** seasoned links (30+ days old, trust 40+). 0.05 × 0 × 0 = 0. The covenant road works (deterministic +1/week pump + crisis-concede +8) and reaches national ~day 76–100, but the payoff is a food trap: the league pool pours 2,000 kcal/week/fire (6,000/week for three fires; 2,500 on counter-accepted terms) out of a pantry that is already marginal. The day 39–63 "starve mid-ambition" collapse is the base food economy (sibling's lever), not scale costs — pre-national scale costs are small (2,000 kcal gesture; covenant free). A secondary measurement artifact: the plain `competent` policy contains zero scale code (no proposals, no tending, no tribute), so "national 0/20" in competent sweeps partly measures the policy, not the game.

## The mechanical path (code citations)

- **Regional** — any active link ≥21 days old → Regional Dawn (`_checkRegional`, hierarchy.js:606; `networkLiveDay` set at :648). Canon: first bond 21+ days; regional before ~day 25 impossible (docs/SCALE.md).
- **National** — `_checkNational` (hierarchy.js:1850): requires `networkLive` AND `(day − networkLiveDay) ≥ 30` (one rung per season, :1943-1944), then the first qualifying polity in priority order: `polityOf(HOME)` (LEAD) → `_belongPolity()` → `_covenantPolity()` → `_tradePolity()` (:1946).
  - **LEAD**: ≥3 active subordinates, each `_linkSeasoned` — (day − link.day) ≥ 30 AND trust ≥ 40 (conquered: age only) (`_linkSeasoned`, :225; `polityOf`, :1649).
  - **BELONG**: Haven subordinate in good standing (trust ≥ 50, arrears 0, link ≥ 14 days) to a foreign primary whose realm has ≥4 villages (`polityOf`, :1665-1675). Foreign realms consolidate only via engagement (`_foreignPolitySim`, :1761; drift seeds pacts, realms need stir).
  - **COVENANT/TRADE**: ≥3 peer links, each ≥30 days + trust ≥ 40 (`_covenantPolity` :1703, `_tradePolity` :1714).
  - Beat stages the morning after the qualifying deed; every shape offers REFUSE (permanent).
- **Trust economy** (the wall):
  - Formation: trust 30 (`_formLink` :530, `_formPeerLink` trust:30). First-gesture gift: +10 (→40) once, first link only (`answerAccord`, :708; staged at :575 only when `!networkLive`).
  - Weekly `linkTick` (:854, gated weekly :857-859). Haven-primary subordinate branch (:918): `if (R() < link.trust/100)` → arrival: `_trustGain(link, 1)` + debit subordinate pantry up to 4,000 (:950-952); shortfall → trust −4 + arrears (:968). Else (no arrival): full 4,000 arrears + trust −4 (:974-975).
  - Expected weekly Δtrust at trust T (subordinate always pays): (T/100)(+1) + (1−T/100)(−4) = 5T/100 − 4. T=40 → −2/wk; T=30 → −2.5/wk; fixed point T=80. **Formation (30–40) is below the fixed point: drift is negative from birth.**
  - Speaker death: −8 + 7-day mourning (gains blocked, losses not) (`successionCrisis`, :1425; `_trustGain` choke :1297).
  - Snap: trust < 20 AND `(day − lastKept) ≥ 14` → `breakLink` (:1400/:1440). Only `_trustGain` stamps `lastKeptDay`; the −4s don't — bad streaks go stale, then snap.
  - **No repeatable tending verb exists for primary-Haven links.** Every other `_trustGain` caller is subordinate-only (`payTribute` :816, `answerDemand` :1118, `proveWorth` :1140), peer-only (`covenantTick`/`tradeTick` +1/wk, crisis concede +8 at :3037), one-shot (accord gesture, renegotiation gift/visit :1520-1538, national-beat answers :2076-2100), or the arrival +1 already counted. Canon says "tending required" (hierarchy.js:69) — but there is nothing to tend *with* on the LEAD road.
- **Subordinate food**: tribute debits `_otherVillage(sub).pantryKcal` (:950-952). NPC villages run `simVillageDay` (production − consumption, pantry capped at mouths×8000, game.js:8053) **only** on approach (`checkVillageProximity` → `catchUpSim`, game.js:8346) or when joined (`tickJoinedVillage`). Between approaches the pantry is frozen. Measured in-sim: subordinate pantry 8,816 kcal frozen across 35+ days while trust decayed 40→12 (−4/week, zero arrivals).
- **Covenant road** (the working road): pre-national `covenantTick` grants deterministic `_trustGain(link, 1)`/week (:2745); strain crises (trust<40, 10%/wk) answered 'concede' grant +8 (:3037) at zero pre-national cost (pool not live). Formation 30 → 40 in ~5–10 weeks; national ~day 76–100. Post-national: pool pours 2,500 kcal/week/fire from Haven's pantry (`covenantTick` :2704-2740); shortfalls −4 trust league-wide.

## Numbers

### Part A — LEAD trust-drift Monte Carlo (exact coded process, 20,000 trials/seed-set)
| config | P(hold ≥40 for 5 wks) | P(trust ≥40 at day 30) |
|---|---|---|
| link #1 (gesture→40), subordinate always pays, no deaths | 0.0321 | 0.0859 |
| link #1, always pays, 10%/wk speaker death | 0.0173 | 0.0519 |
| link #1, pays half the time, deaths | 0.0013 | 0.0037 |
| links #2+ (start 30, no gesture), always pays, no deaths | 0.0000 | 0.0000 |
| links #2+, always pays, deaths | 0.0000 | 0.0000 |
| links #2+, pays half, deaths | 0.0000 | 0.0000 |

National needs three seasoned links. Best-case joint probability ≈ 0.09 × 0 × 0 = **0**.

### Part B — live sims (scalecourt policy, 6 seeds × 200d, 2026-10-12)
| seed | end | max rank | links formed | link fates | max trust | national stages |
|---|---|---|---|---|---|---|
| 11 | village-lost d73 | regional (dawn d46) | 2 (sub) | #1 broke d49 'succession' (T16); #2 decayed 30→4 | 40 | 0 |
| 22 | survived d186 | village | 0 | — | — | 0 |
| 33 | village-lost d15 | village | 0 | — | — | 0 |
| 44 | village-lost d38 | village | 1 (sub) | village died d38; link was T45 rising | 45 | 0 |
| 55 | village-lost d19 | village | 0 | — | — | 0 |
| 66 | village-lost d122 | regional (dawn d46) | 2 (sub) | #1 broke d58 'succession' (T14); #2 decayed 30→4 | 41 | 0 |

- `_havenPolity()` never returned non-null on any seed (polityFirst=null everywhere): **no polity of any shape ever qualified.**
- Zero covenant/trade peer links formed in 6 seeds (policy's peer proposals not landing — courtship gating; cf. sim-food-r2 where 24 seeds yielded 5/24 covenant-national).
- Subordinate pantryKcal: seed 11: 8,816 frozen 35+ days (trust 40→12, −4/wk, zero arrivals); seed 44: 56,396→64,000 rich (trust 40→45 rising — arrivals fired); seed 66: 0–1,600 poor (trust 41→22, broke). **Tribute reliability tracks subordinate wealth, which is frozen/arbitrary between approaches.**
- Max link age: ~24 days (never reached the 30-day seasoning floor).
- Food (seed 11): pantry 51,620 (d30) → 270 (d70); drawdown 51,350 kcal. Scale outflows in window: 2,000 kcal gesture = **3.9% of drawdown**. Drawdown rate 1,284 kcal/day vs implied need ~12,667/day → production covered ~90–95% of need: a **production shortfall** (sibling's lever), not a scale-cost collapse. The LEAD road's promised 4,000/week/sub tribute income never materialized on any seed.

### Corroborating evidence (prior runs)
- journey-scale-r4 (LEAD driver, 9 seeds): 0/9 national. Three links by day 27, Dawn day 46–47; all snapped ~day 71 (trust<20 + 14-day neglect, mourning haircuts); re-courted links reset the 30-day seasoning clock. Never seasoned. (evidence/2026-10-12/journey-scale-r4.md)
- sim-food-r2 (scalecourt/covenant, 24 seeds): national 1/24 → 5/24 after expedition-starvation fix; national ~day 77–84; pool drawn in famine. Covenant road confirmed working-but-slow. (evidence/2026-10-11/sim-food-r2.md)
- wave-pacing r7 (maximal effort): 13/20 regional (dawn d24–26); wave-4 gate reachable 2/20 at days 99–150 — the gate isn't the wall. (evidence/2026-10-12/sim-wave-pacing-r7.md)

## Near-misses (what got closest)
- **Seed 44 (this probe)**: the only link that ever *rose* — formation 30 → gesture 40 → 45 via tribute arrivals, because the subordinate was rich (pantryKcal 56k→64k). Haven died of other causes at day 38. Distinguisher: subordinate wealth. A rich subordinate makes the trust math work; a poor/frozen one makes it a death spiral. Wealth is arbitrary (frozen between approaches).
- **Seed 11 (this probe)**: reached regional (dawn d46), link #1 hit T40 via gesture, then decayed 40→16 and snapped d49 ('succession': trust<20 + 14-day neglect). Distinguisher: the gesture buys a brief window, then the −4/week drift kills it.
- **sim-food-r2 (prior, 24 seeds)**: 5/24 reached covenant-national ~day 77–84 via the +1/week pump + crisis-concede +8 ratchet. Distinguisher: the covenant road has a deterministic trust pump; the LEAD road has none. No LEAD national has ever been observed in any sim.

### 1. Give the LEAD road a repeatable tending verb + de-spiral the tribute math (hierarchy.js `linkTick`, ~:918-975)
**Lever:** trust & social (5), food economy (0). **Expected impact: unblocks the advertised primary road.**
- Add a repeatable "send grain to their fire" verb on primary-Haven links (mirror the renegotiation gift: 1,500 kcal → `_trustGain(link, 8)`, real pantry cost, choked by mourning). This is the "tending" the canon already demands (hierarchy.js:69) but never provided.
- Fix the death spiral: attempt tribute deterministically each week (the subordinate pays what they have); keep −4 for true shortfalls but remove the `R() < trust/100` arrival lottery, or scale the miss penalty (−4 → −1) so the +1 arrivals and tending can sustain. The current fixed point (trust 80) sits above formation (30–40) — the relationship spirals down from birth.
- Why this first: without it, P(LEAD national) = 0 regardless of food, policy, or any other lever. Everything else is moot for this road.

### 2. Make linked subordinates economically real (game.js `simVillageDay` / hierarchy.js tribute)
**Lever:** food economy (0), travel & regional (8). **Expected impact: tribute actually flows; LEAD income materializes.**
- Run a light weekly `simVillageDay` for *linked* villages only (cheap: ~3 villages, not all foreign). Currently their pantry is frozen between approaches, so "their fields pay" (hierarchy.js:84) is false after ~2 weeks of 4,000/week debits — then every week is a −4 shortfall spiral.
- Alternative/complement: scale tribute to the subordinate's means (e.g., a share of their pantry, or 1,500/week base) — 4,000/week is ~17% of a 12-person village's total food budget, crushing at subsistence.
- Note: weekly sim must not reintroduce the tile-depletion pathology (game.js:8043 comment) — debit abstractly or gate depletion.

### 3. Fix the measurement policy (scripts/policies/competent.js or sweep harness)
**Lever:** none (measurement). **Expected impact: honest "national 0/N" numbers.**
- Plain `competent` contains zero scale code — no proposals, no tending, no tribute, no beat answers (verified by grep). "National 0/20" in competent sweeps measures the policy, not the game. Scale-reachability sweeps should use `scalecourt` (or competent gains a basic courtship layer: answer accords/counters, propose at day 25+, pay tribute when affordable).
- Steve's bar is "sims show everything can be accessed" — the sims must actually *try* to access it.

## What this probe did not do
- No game-code changes (diagnosis only, per brief; sibling owns the food lever).
- Did not re-run the LEAD driver (journey-scale-r4 already did: 0/9 national, links never seasoned — consistent with Part A).
- BELONG road not simmed: foreign 4-realms do form (~day 47–49 per journey-scale-r4), and its trust math (+4/wk when paying) is positive — it may be the currently-most-viable road, but no policy pursues it (scalecourt never proposes as subordinate; journey driver stayed LEAD). Flagged for the loops.

## Artifacts
- `scripts/probe-scale-wall-20261012.js` — Part A (trust-drift MC) + Part B (live link/food trace). Run: `PART=A|B|ALL SEEDS=.. DAYS=.. OUT=.. node scripts/probe-scale-wall-20261012.js`.
- `/tmp/sw-full.json` — Part B raw output (6 seeds; ephemeral — re-run to reproduce).
