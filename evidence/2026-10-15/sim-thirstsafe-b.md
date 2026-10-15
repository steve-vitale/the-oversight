# SIM-THIRSTSAFE — thirst-safe banking shape (loop B ARM 1, 2026-10-15)

**Run:** fleshout-b-20261015T0805Z · ARM 1 of 3 · sim-findings **#286** (COLLAPSE-THIRST)
**Date:** 2026-10-15 · worktree `~/workspace/worktrees/sim-thirstsafe`
**Axis:** food-economy (scale-wall lens)

## Canon note

docs/CANON.md read first, docs/PRESERVATION.md read. **There is no
water/thirst canon doc** — stated per the canon rule, not invented. All water
mechanics (cistern 40L cap, villager 2L/day draw via `villageDrinks`, health
−5/day when unmet, `registerDeath` cause `'thirst'`, hearth boiling 6L/wood,
villager task `'water'` hauling 10–14L into the dirty side, autonomous WATER
objectives +2–4L clean when `clean<3`, obedience-gated `assignTask`) are read
from `src/js/game.js` / `src/js/villager-objectives.js` / `scripts/policies/competent.js`
as-is. Zero src/js changes in this arm.

## Lineage

sim-scholarreserve → sim-mealonly → sim-trusthalf → sim-bankleg (killed:
thirst 9 vs ≤2) → sim-banklegrecal (killed: h1200 GO 0.512, trust GO 1.419,
but thirst 9 vs ≤2 on the letter) → sim-thirstinst (instrument; phenomenon
absent on current master 0/16 — deleted-lever artifact) → **this arm**.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE the pilot)

- **Question:** the bankleg shape (take-discipline + low-exposure pack-banking)
  is mechanism-proven on hunger (h1200 0.512×), trust (1.419×), median
  survival (+8d), exposure (wild/d flat) — but killed twice by villager
  thirst deaths (9 vs ≤2). Can a thirst-safe shape keep the hunger/trust
  wins while holding the thirst guardrail?
- **Layer:** `scripts/policies/thirstsafe.js`, `BANKLEGSAFE=1` (default OFF).
  Full bankleg shape (take-discipline + low-exposure guarantee leg,
  behavior-identical to `hidden_files/bankleg-layer-20261015.js.bak`) PLUS
  the thirst-safe behavior: the guarantee leg is **TRUST-GATED**
  (`TRUST_GATE=25`) — below the gate the leg YIELDS the day to the base
  policy so the water/wood duty economy keeps working. The take-discipline
  (the hunger engine) is unchanged. Zero src/js changes.
- **Road:** 8 seeds (11/22/33/44/55/66/77/88) × {belongseek, leadcourt} ×
  {control, armed}, 180d death-aware, identical seeds both sides. Own
  control in the SAME sweep (CONTROL BASELINE DRIFT #247).
- **PRIMARY:** villager thirst deaths armed ≤ 2 (the exact guardrail that
  killed the prior shape twice).
- **CO-PRIMARY 1:** h1200 (scholar hunger-days, daily min bar < 1200) armed
  ≤ 0.65× control (bankleg measured 0.512×).
- **CO-PRIMARY 2:** trust≥30d (scholar-days) armed ≥ 1.10× control (bankleg
  measured 1.419×).
- **GUARDRAILS:** median survival ≥ control−10d; national ≥ control−2/16;
  wild visits/d ≤ control×1.10; no new death mode (n≥3).
- **GO:** primary + both co-primaries + all guardrails. A miss is NO-GO
  (§14), never re-scored.
- **ANSWERABILITY:** if control h1200 < 8 across the 16 control runs, the
  primary ratio is noise-powered → INFO-SKIP.
- **Confirm:** 12–16 seeds ONLY on pilot GO.
- **Gates before sims:** `scripts/test-thirstsafe-20261015.js` — REAL RED
  phases (gate-off natural takes; gate-off wrapped == raw base 20d
  byte-identical; gate-on refuses voluntary takes / hatch real+narrated /
  hatch closed-states / trust-high leg fires / trust-low leg YIELDS /
  take-discipline unaffected by the gate / exposure zero-travel).
  SMOKE=1 instrument-honesty (named-export unwrap + layer-live marker +
  policy.daily fires ≥10×/run). det-gate 32/32 (8 seeds × 2 policies ×
  2 sides, 60d, each side self-identical).

## Mechanism hypothesis (written BEFORE the pilot sims; the pilot judges it honestly)

The collapse-thirst deaths are a **trust-gated water-duty failure** — a
positive-feedback spiral, not a water-economy shortfall. Established by the
diagnostic probe (`scripts/diag-water-20261015.js`, reproduced the exact 9
deaths: belongseek-s33×4, belongseek-s88×1, leadfeast-s33×4):

1. **Duty displacement (d1–14):** the take-discipline suppresses the
   village's water/wood duty economy. Trust events on the s33 collapse:
   "fetched creek water" 97→68, "hauled wood for the pile" 23→6. The
   guarantee leg AMPLIFIES it (bisection: takeonly 1 thirst death, full 5;
   legonly 0). Neither half alone reproduces the collapse — it is the
   interaction.
2. **Obedience gate:** cistern input comes ONLY through the assigned
   `'water'` duty (+10–14L dirty, needs hearthBoil + wood) and autonomous
   WATER objectives (+2–4L clean, weight 3.5, only when `clean<3`).
   Assigned duty is obedience-gated (`checkObedience`: trust<20 hard
   refusal; trust<40 40% reluctant refusal). Villagers never fetch water
   autonomously outside the objective. At trust ~11–15, every water/wood
   assignment is refused (s33-diag d16+: water:refused×3/day,
   wood:refused×3/day).
3. **Wood lockout:** wood duty equally refused → wood=0 → hearthBoil can't
   convert dirty→clean. The cistern fills with unboilable dirty water
   (d12: 4+40); villagers drink dirty → sickness.
4. **Deterministic drain:** 2L/villager/day draw with zero input → cistern
   0 (d20) → health −5/day → villager thirst deaths (d20, d30×2, d32).
   Scholar thirst 0/0 throughout — the scholar drinks from bottles, never
   the cistern. **Cistern-draw competition RULED OUT** (scholar
   `fillWater` draws ~3L/8d at haven — negligible vs 24L/day village draw).
5. **Why the layer:** the layer doesn't cause the early combat, but its
   trust trajectory sits below the obedience floor (diag mean 11–18 vs
   control 25–40 by d10), so the water/wood duty economy can't survive
   early pressure. Control stays above the floor and recovers (d24: 2 ok
   water assignments, cistern rebounds 0+15).

**The thirst-safe bet:** gate the leg (the amplifier) on trust; keep the
take-discipline (the hunger engine) always-on. Below `TRUST_GATE=25` the
leg yields, the base policy's duty mix runs, and the village keeps water
flowing. Prototype (belongseek, 8 seeds, 180d): h1200 0.60×, trust≥30d
2.54×, thirst 1 (vs 5 ungated), median 161d.

## Proof results

`scripts/test-thirstsafe-20261015.js` — **88/88 assertions RED→GREEN** on a
live Game, both policies (belongseek + leadcourt):
- PART 0 (module + gate): all named exports incl. `trustMean`, `TRUST_GATE`;
  `TRUST_GATE===25`; gate off/on correct.
- PART 1 (RED): gate-off base.upkeep fires real takeFromPantry calls drawing
  kcal (the voluntary-take bind is real).
- PART 2 (NON-AGGRESSION): gate-off wrapped == raw base, 20d byte-identical.
- PART 3 (GREEN): gate-on, 0 real kcal taken, refusals climb, hatch shut
  when a meal is coming.
- PART 4 (HATCH): estranged, bar<1200, empty pack → REAL ledger-recorded
  take, hatchTakes==1, narrated ("The discipline breaks — hunger wins…").
- PART 5 (HATCH-CLOSED): fed / pack food / meal coming — all shut; hungry +
  empty + at hall + no meal → open.
- PART 6 (GUARANTEE, trust high): thin pack → exactly 1 leg; legYielded==0.
- PART 7 (TRUST-GATE, trust low): **NO leg, legYielded==1** — the
  thirst-safe behavior proven, not asserted; take-discipline still refuses
  (discipline ≠ leg).
- PART 8 (EXPOSURE): 3 direct leg calls, tile identical before/after, zero
  travelTo, 3 legs counted.
- SMOKE=1: instrument-honesty green both sides (unwrap + live marker +
  policy.daily ≥10×/run + pacing >0).
- det-gate: 32/32 self-identical (8 seeds × 2 policies × 2 sides, 60d).

## Sweep results

32 runs: 8 seeds × {belongseek, leadcourt} × {control, armed}, 180d
death-aware, identical seeds both sides, own control in the same sweep.
Per-seed rows: `evidence/2026-10-15/perseed-thirstsafe/`; beats:
`evidence/2026-10-15/thirstsafe-beats/`.

**DESIGN EVOLUTION (documented honestly):** the pilot tested design v1
(trust-gated LEG only; take-discipline always-on). v1 8-seed GOed on all
pooled bars. The 16-seed confirm revealed h1200 heterogeneity (1.000× —
the hunger win doesn't replicate on easier seeds), leading to design v2
(whole-shape trust gate: leg yields AND discipline suspends when trust
low). v2 16-seed was WORSE (h1200 0.998×, thirst 3). Both designs fail the
pre-registered h1200 bar on 16 seeds. **Verdict: NO-GO at confirm.**

### v1 pilot (8 seeds: 11/22/33/44/55/66/77/88) — GO on pooled bars

| metric (pooled) | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY villager thirst** | 1 / 0 | — | ≤ 2 | **GO** |
| **CO-PRIMARY h1200** | 235 / 381 | **0.617** | ≤ 0.650 | **GO** |
| **CO-PRIMARY trust≥30** | 1425 / 854 | **1.669** | ≥ 1.100 | **GO** |
| median survival | 120 / 106 | — | ≥ 96 | **GO** |
| national | 10/16 / 9/16 | — | ≥ 7 | **GO** |
| wild visits/d | 2.92 / 2.75 | 1.062 | ≤ 1.10 | **GO** |
| new death mode (n≥3) | none | — | none | **GO** |

Per-policy (diagnostic): belongseek GOes all bars; leadcourt misses 4 bars
by razor margins (h1200 0.655 vs 0.650; trust 1.095 vs 1.100; median 103 vs
105; wild/d 1.105 vs 1.100) — noise-level, reported per §14 honesty.

### v1 confirm (16 seeds: +99/111/122/133/144/155/166/177) — h1200 MISS

| metric (pooled) | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY villager thirst** | 1 / 0 | — | ≤ 2 | **GO** |
| **CO-PRIMARY h1200** | 605 / 605 | **1.000** | ≤ 0.650 | **MISS** |
| **CO-PRIMARY trust≥30** | 2340 / 1645 | **1.422** | ≥ 1.100 | **GO** |
| median survival | 120 / 103 | — | ≥ 93 | **GO** |
| national | 20/32 / 18/32 | — | ≥ 16 | **GO** |

The hunger win is **seed-regime dependent**: on hungry seeds (old: control
h1200 rate 0.21) the layer helps (armed rate 0.12–0.22); on easy seeds
(new: control rate 0.14) the layer hurts (armed rate 0.21–0.23). The
take-discipline lowers the scholar's eating equilibrium; h1200 (bar<1200
binary) penalizes this even when harmless.

### v2 (whole-shape gate) 16-seed — h1200 MISS + thirst MISS

| metric (pooled) | armed / control | ratio | bar | verdict |
|---|---|---|---|---|
| **PRIMARY villager thirst** | 3 / 0 | — | ≤ 2 | **MISS** |
| **CO-PRIMARY h1200** | 604 / 605 | **0.998** | ≤ 0.650 | **MISS** |
| **CO-PRIMARY trust≥30** | 2277 / 1645 | **1.384** | ≥ 1.100 | **GO** |

v2 (suspending the discipline when trust is low) does NOT fix h1200 and
BREAKS thirst safety (leadcourt s88: 3 thirst deaths). The discipline
suspension removes the hunger engine without restoring the duty economy.
**v2 is strictly worse than v1. Do not pursue.**

**OVERALL: NO-GO at confirm** — the pre-registered h1200 bar misses on 16
seeds (v1: 1.000; v2: 0.998). Per §14 the miss is not re-scored. **Arm
killed per protocol** (layer deleted; proof 94/94 + det-gate 32/32 +
sweeps + evidence retained with INFO-SKIP guards).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read belongseek-armed-s88 (the 1 thirst death in v1) d35–59. The village
reads as people under raid pressure:
- d35–45: water duty working — "💧 Oscar returns with 10L of creek water.
  Risky until the hearth boils it." / "Jude returns with 12L, but the
  cistern only holds 5L more." / "Oscar checks the pantry before heading
  out — the shelves are full, ~26 days of fresh on hand… leaves the fish
  nets standing and turns to the water run instead. The pantry can't take
  more; the wild will keep." — people reading the pantry and choosing
  work, not loot cycles.
- d37–54: raids hammer — "🌙 Raid — Emberhold came in the night from the
  north. They carried off ~845 kcal from the pantry. Nobody's dead, but
  the message is clear." (×10 raids, Trust −10 each).
- d53: "At the grave, Owen speaks for Jude — 'Rosa trusted them. We saw
  it. Give them the fire's hearing.' The village listens." — a funeral
  with a speaker, grief with a witness.
- d55: "💀 Ivy died of thirst. There was nothing to drink." — honest,
  names the cause. The thirst death is a RAID-casualty (trust collapsed
  from −10×10, water duty faltered), not the obedience-spiral collapse.
- d56–58: "💧 Onni returns with 7L of creek water." — the duty RECOVERS.
  The village bends without breaking.

No robotic flags. **PASS.**

## Wall numbers (every run — v1 16-seed)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 18/32 | 0/32 | 0/32 | 14/32 | 0/32 | 103d | 182d |
| armed | 20/32 | 0/32 | 0/32 | 12/32 | 0/32 | 120d | 182d |

The scale wall stands — no table, no wins either side in 64 runs. The arm
moves hunger/trust/thirst, not the wall. (v2 16-seed: national 22/32 vs
18/32, median 127d vs 103d — directionally better on survival/scale but
fails the pre-registered bars.)

## Death-cause shares (v1 16-seed)

Control (431 deaths): combat 231, monster 48, villager combat 42, sickness
28, starvation 27, contest 15, wound 14, lockjaw 4, thirst 0.
Armed (447): combat 218, monster 71, starvation 38, villager combat 35,
sickness 27, contest 14, wound 15, thirst 1, expedition 2. Scholar-side
thirst: 0 vs 0. No new death mode (n≥3).

The armed monster-death rise (71 vs 48) rides the same road's combat bleed
as bankleg — the leg added zero wild visits (wild/d 1.062×, within the
1.10 guardrail).

## Village assessment (plain words)

Thirty-two villages lived twice — once with the scholar's banking gated
by trust, once without. On hungry seeds, the disciplined scholars ate from
their packs and the villages trusted them sooner (trust≥30d 1.67×) while
going hungry less often (h1200 0.62×) — and the cistern kept flowing
because the leg yielded when trust faltered (thirst 1 vs the ungated 9).
On easy seeds, the same discipline made scholars undereat slightly (h1200
1.00× — the win doesn't replicate where hunger isn't the problem), but
the villages still trusted more (1.42×) and didn't die of thirst. The
shape is thirst-safe and trust-positive; the hunger win is real but
regime-dependent. The v2 whole-shape gate was a wrong turn — suspending
the discipline during low trust removed the hunger engine without
restoring the duty economy, and thirst broke through (3 deaths).

## Blanks filled / documented

- **#286 COLLAPSE-THIRST — MECHANISM NAMED.** The 9 deaths are a
  trust-gated water-duty failure (diagnostic probe reproduced 9/9:
  belongseek-s33×4, s88×1, leadfeast-s33×4): take-discipline suppresses
  water/wood duties (d1–14 trust events 97→68 / 23→6); the leg amplifies
  (takeonly 1, full 5); obedience refusals → cistern 0 + wood 0 → thirst.
  Scholar thirst 0/0; cistern-draw competition RULED OUT.
- **DOCUMENTED (design): trust-gated leg PREVENTS the thirst deaths.**
  v1 (leg yields below trust 25): thirst 1 vs 9 ungated, robust across 16
  seeds. The gate is the thirst-safe mechanism, proven.
- **DOCUMENTED (limitation): hunger win is regime-dependent.** h1200
  0.62× on hungry seeds, 1.00× on easy seeds (16-seed pooled). The
  take-discipline lowers the scholar's eating equilibrium; h1200 penalizes
  this even when harmless. A future arm could gate the discipline on
  pantry stress rather than running it unconditionally.
- **DOCUMENTED (negative): whole-shape gate FAILS.** v2 (discipline
  suspends when trust low): thirst 3, h1200 1.00×. Do not pursue.

## Metric review (§14)

1. **PRIMARY (villager thirst armed ≤ 2): GO — 1 (v1 16-seed).** The
   thirst-safe mechanism works. v2's 3 is a separate design's failure.
2. **CO-PRIMARY h1200 (armed ≤ 0.65× control): MISS — 1.000 (v1 16-seed).**
   The 8-seed 0.617 was regime luck (hungry seeds). On 16 seeds the win
   evaporates. The metric is honest; the layer's hunger effect is
   heterogeneous. **NO-GO per §14.**
3. **CO-PRIMARY trust (armed ≥ 1.10× control): GO — 1.422 (v1 16-seed).**
   Robust across regimes.
4. **GUARDRAILS (v1 16-seed):** median GO (120≥93); national GO (20≥16);
   wild/d GO (1.062≤1.10); no new death mode GO.
5. **Per-policy noise (v1 8-seed):** leadcourt missed 4 bars by ≤0.005 —
   reported, not re-scored; pooled is the verdict form per precedent.
6. **Metric for the NEXT run:** h1200's regime-dependence suggests
   stratifying by seed hunger (control h1200 rate) or using a
   harm-anchored hunger metric (starvation deaths, not bar<1200 days).
   Any thirst-lever arm should pre-register against the v1 armed-side
   numbers, not relitigate this arm's.

## Convergence state

food-economy: **killed-at-confirm** (sim-thirstsafe). The #286 mechanism is
named and the trust-gated leg is proven thirst-safe (1 vs 9), but the
pre-registered h1200 bar misses on 16 seeds (1.000×) — the hunger win is
regime-dependent. The axis's next work: a hunger lever that holds across
regimes, or a pantry-gated discipline. The thirst instrument
(sim-thirstinst) remains the diagnostic for future water/siege levers.
