# SIM-THIRSTBANK — the thirst-safe low-exposure banking shape (loop B ARM 1, 2026-10-15)

**Run:** fleshout-b-20261015T0927Z · ARM 1 of 3 · sim-findings **#286 / #264 / #299**
**Date:** 2026-10-15 · worktree `~/workspace/worktrees/sim-thirstbank`
**Axis:** food-economy (scale-wall lens)

## Canon note

docs/CANON.md read first, then docs/PRESERVATION.md and docs/STORAGE.md
(water economy). **There is no water/thirst canon doc** — stated per the canon
rule, not invented. All water mechanics (cistern 40L cap, villager 2L/day draw
via `villageDrinks`, health −5/day when unmet, `registerDeath` cause
`'thirst'`, hearth boiling 6L/wood, villager task `'water'` hauling 10–14L into
the dirty side, autonomous WATER objectives +2–4L clean when `clean<3`,
obedience-gated `assignTask`) are read from `src/js/game.js` /
`src/js/villager-objectives.js` / `scripts/policies/competent.js` as-is.
Zero src/js changes in this arm. Policy-side only.

## Lineage

sim-scholarreserve → sim-mealonly → sim-trusthalf (killed: exposure price) →
sim-bankleg (killed: thirst 9 vs ≤2) → sim-banklegrecal (killed: thirst 9 vs ≤2
on the letter) → sim-thirstinst (instrument; phenomenon absent unlayered) →
sim-thirstsafe v1 (pilot GO: thirst 1 vs 9, h1200 0.617×, trust 1.669×) →
sim-thirstsafe v2 (killed: whole-shape gate worse — thirst 3) → thirstsafe
killed-at-confirm (h1200 1.000× on 16 seeds — regime-dependent hunger win) →
**this arm: the full combined v1 shape re-measured at pilot scale on current
master (#299's named next)**.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE the pilot)

- **Question:** does the full combined thirst-safe banking shape — the
  always-on take-discipline (hunger engine) + the haven-adjacent pack-banking
  guarantee leg, the leg trust-gated at 25 (thirst-safe yield) — hold thirst,
  hunger, and trust on current master?
- **Layer:** `scripts/policies/thirstbank.js`, `THIRSTBANK=1` (default OFF).
  Rebuilt from `hidden_files/bankleg-layer-20261015.js.bak` (the r43b shape:
  take-discipline + haven-adjacent guarantee leg — garden harvest, fishing at
  haven, haven-forage; never a wild tile visit; tile-identity asserted per leg)
  PLUS the v1 trust-gate (below trust 25 the leg YIELDS the day to the base
  policy; `legYielded` counted, never silent). Zero src/js changes.
- **Road:** 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} ×
  {control, armed}, 180d death-aware, identical seeds both sides. Own control
  in the SAME sweep (CONTROL BASELINE DRIFT #247).
- **PRIMARY:** villager thirst deaths armed ≤ 2.
- **CO-PRIMARY 1:** h1200 (scholar hunger-days, daily min bar < 1200) armed
  ≤ 0.65× control.
- **CO-PRIMARY 2:** trust≥30d (scholar-days) armed ≥ 1.10× control.
- **GUARDRAILS:** median survival ≥ control−10d; national ≥ control−2/16;
  wild visits/d ≤ control×1.10; no new death mode (n≥3).
- **GO:** primary + both co-primaries + all guardrails. A miss is NO-GO (§14),
  never re-scored.
- **ANSWERABILITY:** if control h1200 < 8 across the 16 control runs, the
  ratio is noise-powered → INFO-SKIP, no verdict.
- **Confirm:** 12–16 seeds ONLY on pilot GO.
- **Gates before sims:** `scripts/test-thirstbank-20261015.js` — REAL RED
  phases (gate-off natural takes; gate-off wrapped == raw base 20d
  byte-identical; gate-on refuses voluntary takes / hatch real+narrated /
  hatch closed-states / trust-high leg fires / trust-low leg YIELDS with the
  take-discipline STILL refusing / exposure zero-travel).
  SMOKE=1 instrument-honesty (named-export unwrap + layer-live marker +
  policy.daily fires ≥10×/run + pacing >0). det-gate 32/32 (8 seeds ×
  2 policies × 2 sides, 60d, each side self-identical).

## Design note (written BEFORE the pilot)

This is a RE-MEASUREMENT, not a new design: the v1 thirst-safe shape on
current master, the design that held thirst 1 vs 9 at pilot (sim-thirstsafe).
The sibling run's confirm showed the hunger win is regime-dependent; this
pilot tests whether the same 8-seed substrate that GOed then GOes now
(#263: committed sweep JSONs are perishable — always re-baseline).

## Proof results

`scripts/test-thirstbank-20261015.js` — **92/92 assertions RED→GREEN** on a
live Game, both policies (belongseek + leadcourt):
- PART 0 (module + gate): all named exports incl. `trustMean`, `TRUST_GATE`;
  `TRUST_GATE===25`; gate off/on correct (`THIRSTBANK` unset/`=1`).
- PART 1 (RED): gate-off base.upkeep fires 12 real takeFromPantry calls
  drawing 2400 kcal — the voluntary-take bind is real.
- PART 2 (NON-AGGRESSION): gate-off wrapped == raw base, 20d byte-identical.
- PART 3 (GREEN): gate-on, 0 real kcal taken, 20 refusals, hatch shut while
  a meal is coming.
- PART 4 (HATCH): estranged, bar<1200, empty pack → REAL ledger-recorded
  take, hatchTakes==1, narrated ("The discipline breaks — hunger wins…").
- PART 5 (HATCH-CLOSED): fed / pack food / meal coming — all shut; hungry +
  empty + at hall + no meal → open.
- PART 6 (GUARANTEE, trust high): thin pack → exactly 1 leg; legYielded==0.
- PART 7 (TRUST-GATE, trust low): **NO leg, legYielded==1 — and the
  take-discipline STILL refuses (discipline ≠ leg)**. The v1 shape proven,
  not asserted.
- PART 8 (EXPOSURE): 3 direct leg calls, tile identical before/after, zero
  travelTo, 3 legs counted.
- SMOKE=1: instrument-honesty green both sides (unwrap + live marker +
  policy.daily ≥10×/run + pacing >0).
- det-gate: 32/32 self-identical (8 seeds × 2 policies × 2 sides, 60d).

## Sweep results

32 runs: 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} ×
{control, armed}, 180d death-aware, identical seeds both sides, own control
in the same sweep. Per-seed rows: `evidence/2026-10-15/perseed-thirstbank/`;
beats: `evidence/2026-10-15/thirstbank-beats/`; raw log:
`evidence/2026-10-15/thirstbank-sweep.log`.

### Per-policy (diagnostic)

| metric | belongseek armed/ctl | bar | verdict |
|---|---|---|---|
| **CO-PRIMARY h1200** | 171/223 = **0.767** | ≤ 0.650 | **MISS** |
| **CO-PRIMARY trust≥30** | 826/590 = **1.400** | ≥ 1.100 | GO |
| **PRIMARY villager thirst** | 0 | ≤ 2 | GO |
| median survival | 180 vs 155 | ≥ 145 | GO |
| national | 3/8 vs 4/8 | ≥ 2 | GO |
| wild visits/d | 1.011× | ≤ 1.10 | GO |

| metric | leadcourt armed/ctl | bar | verdict |
|---|---|---|---|
| **CO-PRIMARY h1200** | 151/206 = **0.733** | ≤ 0.650 | **MISS** |
| **CO-PRIMARY trust≥30** | 676/466 = **1.451** | ≥ 1.100 | GO |
| **PRIMARY villager thirst** | 0 | ≤ 2 | GO |
| median survival | 145 vs 146 | ≥ 136 | GO |
| national | 6/8 vs 4/8 | ≥ 2 | GO |
| wild visits/d | 0.990× | ≤ 1.10 | GO |

### Pooled verdict (pre-registered form)

| metric | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY villager thirst** | 0 / 0 | — | ≤ 2 | **GO** |
| **CO-PRIMARY h1200** | 322 / 429 | **0.751** | ≤ 0.650 | **MISS** |
| **CO-PRIMARY trust≥30** | 1502 / 1056 | **1.422** | ≥ 1.100 | **GO** |
| median survival | 147 / 146 | — | ≥ 136 | **GO** |
| national | 9/16 / 8/16 | — | ≥ 6 | **GO** |
| wild visits/d | 2.856 / 2.85 = 1.002× | ≤ 1.10 | **GO** |
| new death mode (n≥3) | none | — | none | **GO** |

**OVERALL: NO-GO at pilot.** The h1200 miss is pooled AND per-policy (both
roads miss by 0.08–0.12) — not a per-policy noise artifact. Per §14 the miss
is not re-scored. **Arm killed per protocol** (layer deleted;
proof 92/92 + det-gate 32/32 + SMOKE + sweep + evidence retained with
INFO-SKIP guards).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read belongseek-armed-s55 (survived 182d, hatch=29, legs=158/yield=12,
1,685 beats):
- d1–6: the village as wary strangers — "A person, maybe 60s shakes their
  head. 'Ask someone who trusts you.' (Trust too low.)" / "Village meal:
  +1154 kcal… (Half ration — they don't trust you yet.)" — knowledge-gated
  (no names before learning) and trust-gated, exactly as canon demands.
- d3–181: the water duty economy WORKS the whole run — Jesse, Dieter, Caleb,
  Lena, Leo, Fernando, Abraham, Salvatore, Elena, Vasyl hauling 7–17L of
  creek water daily. Cistern goes dry and refills repeatedly; the village
  keeps drinking. Zero thirst deaths. The trust-gated leg's purpose,
  visible in fiction.
- d19–23: the starvation hatch fires 29 times — "🍽️ The discipline breaks
  — hunger wins. The scholar takes 150 kcal from the pantry openly; the
  ledger will remember." — the survival-first valve doing real work,
  narrated, ledger-recorded, never silent. The scholar genuinely went
  hungry for a stretch and the discipline broke honestly.
- d45: "★ IDENTIFIED: Pokeweed. Smooth stalks, purple-red stems, dark berry
  clusters. Uses unknown — harvest, taste, and learn." — the discovery
  chain working.
- d50/57: "You give Emberhold 2,000 kcal from Haven's bins — real food,
  honestly counted. Sanne weeps, openly. 'The fire network. That's what
  it's FOR.' (Trust +4. They owe you — the ledger remembers.)" — a person
  weeping, obligation named. Reads as people.
- d109: "At the grave, Caleb, Lena, Vasyl and 3 more speak for Leo —
  'Salvatore trusted them. We saw it. Give them the fire's hearing.' The
  village listens." — a funeral with speakers, grief with witnesses.
- Robotic flags: the raid beat repeats verbatim across d45–127 (already
  filed: RAID AND PANTRY-CHECK BEAT TEMPLATES REPEAT VERBATIM IN LONG
  RUNS); the low-trust refusal lines repeat early (in-context wariness, not
  robotic); the water-haul beat repeats ~100× (same filed finding).
  Nothing new. **PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | exiled |
|---|---|---|---|---|---|---|---|---|
| control | 8/16 | 1/16 | 0/16 | 4 | 0 | 146d | 180d | 2 |
| armed | 9/16 | 0/16 | 0/16 | 5 | 0 | 147d | 180d | 0 |

The scale wall stands — 0 wins either side in 32 runs; table 1/16 control
only. The arm moves hunger/trust, not the wall.

## Death-cause shares (16-seed pilot)

Control (166 deaths): combat 72, villager combat 22, monster 18, starvation
16, "a wound that wouldn't close" 14, sickness 10, contest 7, Nevermore 2,
lockjaw 2, thirst 0, expedition 1. Armed (200): combat 106, starvation 21,
monster 20, villager combat 19, sickness 18, "a wound that wouldn't close"
8, contest 7, thirst 0, expedition 1, Ugly-Eyes 1. Scholar deaths: 32 armed
vs 35 control. No new death mode (n≥3).

The armed combat-death rise (106 vs 72) is NOT an exposure price (wild/d
1.002×, flat) — it rides combat-heavy trajectories on paired seeds
(SEED-88-CLASS NOISE #103/#111), while scholar deaths fall 35→32. The
starvation rise (21 vs 16) is the same regime effect the h1200 miss names:
on easy seeds the discipline lowers the eating equilibrium.

## Village assessment (plain words)

Thirty-two villages lived twice — once with the scholar's discipline, once
without. The discipline refused thousands of voluntary pantry takes
(belongseek-armed-s77: 5,340 refusals; leadcourt-armed-s55: 6,516) and
banked thin packs with haven-adjacent legs (gardens, haven fishing, haven
forage — zero extra wild visits, 2.856 vs 2.850 wild/d). The villages
trusted more (trust≥30d 1.42×), the cistern kept flowing (0 thirst deaths),
and the starvation hatch broke honestly when real hunger came (29 narrated
breaks on s55). But the scholars went hungry more days, not fewer (h1200
0.751×) — on easy seeds the discipline starves a scholar who wasn't
starving (misses on BOTH roads, not a policy artifact). The hunger win the
thirstsafe pilot saw on these same seeds (0.617) does not replicate on
current master. The shape is thirst-safe, trust-positive, and exposure-free —
and its hunger effect is real but regime-dependent. It is not a hunger lever.

## Blanks filled / documented

- **#299 — KILLED, confirmed.** The thirstsafe confirm's regime-dependent
  hunger verdict replicates at pilot scale on current master (h1200 0.751×
  pooled, both roads miss). The take-discipline + low-exposure banking
  shape is NOT a hunger lever; the axis's next hunger work needs the
  pantry-gated discipline or a regime-stratified metric (#299's own named
  next).
- **#286 — mechanism reconfirmed by absence.** The 9 collapse-thirst deaths
  need the ungated shape: with the trust-gated leg, 0 thirst deaths on 16
  armed runs (and 0 on 16 controls — the phenomenon is absent unlayered,
  per sim-thirstinst). The gate remains the proven thirst-safe mechanism.
- **#264 — exposure answered, lever dead anyway.** The low-exposure leg
  eliminated trusthalf's exposure price (wild/d 1.002×, armed vs control)
  while keeping trust 1.42×. The named next from #264 worked technically;
  the arm died on the hunger bar it inherited.

## Metric review (§14)

1. **PRIMARY (villager thirst armed ≤ 2): GO — 0.** Trivially GO (0 on both
   sides; the phenomenon is absent this run). The bar did its job as a
   guardrail, not as a discriminator.
2. **CO-PRIMARY h1200 (armed ≤ 0.65× control): MISS — 0.751 pooled, 0.767
   belongseek, 0.733 leadcourt.** Both roads miss by 0.08–0.12 — not
   per-policy noise, a real regime effect: on easy seeds the always-on
   discipline lowers the eating equilibrium and h1200 (a binary bar<1200
   count) penalizes it even when harmless. **NO-GO per §14.**
3. **CO-PRIMARY trust (armed ≥ 1.10× control): GO — 1.422.** Robust across
   roads and regimes.
4. **GUARDRAILS:** median GO (147≥136); national GO (9≥6); wild/d GO
   (1.002≤1.10); no new death mode GO.
5. **Answerability:** control h1200 = 429 ≥ 8 → the ratio is real, not
   noise-powered. Verdict stands.
6. **Discrepancy note:** this same substrate gave thirstsafe-v1 h1200 0.617
   (pilot GO). On current master the same 8 seeds give 0.751 (control drift
   381→429, armed 235→322). NARRATION->RNG COUPLING (#263) in the flesh:
   the tree moved under the shape. The confirm-scale verdict (1.000 on 16
   seeds) already said the pilot win was regime luck; this re-measurement
   agrees.
7. **Metric for the NEXT run:** any future hunger lever pre-registers a
   regime-aware bar (stratify by control hunger, or use a harm-anchored
   metric like starvation deaths, not the bar<1200 binary) — and considers
   gating the discipline on pantry stress rather than running it
   unconditionally.

## Convergence state

food-economy: **killed-at-pilot** (sim-thirstbank). The combined v1
thirst-safe banking shape fails its pre-registered h1200 bar on current
master (0.751 ≤ 0.650 miss, both roads) — the hunger win is regime-dependent
(confirms #299). The trust-gated leg's thirst safety stands (0 thirst
deaths; #286 reconfirmed by absence); the low-exposure leg's zero exposure
price stands (wild/d 1.002×; #264 answered technically); the trust win
stands (1.42×). The axis's next hunger work: pantry-gated discipline or a
regime-stratified hunger metric.
