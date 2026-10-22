# sim-storageshed-b2 — STORAGESHED re-implementation + metric-review-corrected pilot (2026-10-22)

Re-implementation of the STORAGESHED lever (the STORAGE half of Steve's
2026-10-21 ruling: "villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the decision). The previous run's
game.js STORAGESHED draft was NEVER committed (only instruments landed:
scripts/analyze-storageshed-b.js, det-gate-storageshed-b.js,
sense-storageshed-b.js); the full design spec + pilot autopsy is
evidence/2026-10-22/sim-storageshed-b.md. This run re-implements the layer
faithfully from that spec — the lost draft is not the judge; the new proof
test + this pilot judge the new code. Record of the re-implementation is
itself a blank filled (the dead run's work is no longer lost).

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- PRIMARY: rack-kcal-smoked-during-plenty, armed/control ≤ 0.70.
  Hypothesis: during plenty the shed halves each about-to-rot surplus batch
  once and caps the whole shed day's rack budget 4000→2000, so rack
  throughput while prodThrottleEngaged is true should fall to ~half of
  control. (The task allowed pre-registering preserved-rot/100d ≤ 0.80
  instead; rack-kcal-smoked-during-plenty is chosen because it directly
  measures the lever's behavior — the previous pilot showed preserved rot
  is a weak downstream proxy at 8 seeds.)
  Measurement: the cook's honest day-stream line ("worked the smoke racks
  too — N batches preserved (~X kcal, …)" — the same number the player
  sees), parsed in the sweep, classified plenty/non-plenty by
  prodThrottleEngaged() at the moment the line is spoken (synchronous, same
  resolution as the rack loop). Identical measurement both sides; no
  game-code instrumentation.
- GO threshold: ≤ 0.70 (overall AND per-policy).
- rot/100d absolute is DEMOTED to guardrail: no significant increase vs
  control (flag > 1.20x). The previous pilot's rot primary missed at 0.983x
  for documented reasons: rot is ~90% inflow-driven fresh rot the storage
  half cannot touch; the lever's addressable fraction is ~10%; rot/100d
  penalizes longer survival.
- Engagement (kill-fast): shedKcal > 0 on ≥ 6/16 armed runs. If the shed
  never fires in sims, the lever is decoration — kill at pilot.
- Guardrails: median survival armed ≥ control−10d; starvation deaths (pair
  sums) ≤ control+2; national(end) ≥ control−2; no new death-cause modes
  (per-run monster names canonicalized to monster/combat BEFORE comparing —
  metric-review fix from the previous pilot); no inflow-channel laundering
  >2x (named channels: share_surplus/away/tribute/traps/duty/system/ambient).
- Horizon: 180d death-aware (dead villages stop simulating; +10d tail max).
  Why 180d: the lever only fires during plenty, which needs an established
  village; 180d covers establishment + a long plenty tail without a fixed
  200d run.
- Seeds: 8 FRESH per policy per side (61001–61008; fresh = not used as sim
  seeds by any prior run — verified against evidence/ + scripts/; the
  wincensus script's 610043 is a different seed).
- Policies: leadfeast, belongfeast (competent-player policy + variant).
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- Before/after comparisons run through the balanced panel
  (scripts/balance-panel.js) per §15 — the panel is the instrument, the
  pre-registered threshold is the judge. Known contract limitation:
  automated compare reports "Unmatched flags" for env-gated levers — both
  panels + manual paired row analysis are attached.

## Implementation (the re-implemented layer)

src/js/game.js, cook resolution (resolveOneAssignment, task 'cook'), all
inside `_storageShedOn()` (env-gated STORAGESHED; default-ON; STORAGESHED=0
is the control) AND `prodThrottleEngaged()` (pantryFreshDays() > 4;
hungryStreak >= 3 stands it down — the SAME plenty definition the
production half reads):

1. SHED (once per cook-day): on the cook's first resolution of the day with
   eligible about-to-rot surplus batches (post-dinner-reserve — the reserve
   is untouched), each batch's units are halved ONCE: floor(u/2) units stay
   FRESH in the pantry (honest copy, pre-conversion name, original
   spoilDay — the fresh-first nightly meal gets a chance at them), the rest
   goes to the racks. Gate `shedDayByVid[vid] = day`.
2. The gate/ledger/budget engage ONLY when something was actually shed:
   floor(u/2)=0 batches are skipped; if nothing shed, no day record, no
   budget cut, gate unconsumed (a later resolution with real batches can
   still shed).
3. DAY-GATED EASED BUDGET: the whole shed day gets 2000 rack kcal across
   ALL resolutions (shedder's later passes + other cooks), spend
   accumulating per resolution. Non-shed days keep 4000.
4. DAY VOICE: `_storageShedDayVoice(v)` called once/day after the meal
   loop (FOODVOICE2 pattern), only on shed days. Rotating speaker
   (day-keyed, different rotation from the production-half voice), 12-line
   instead-of-work pool naming REAL work (mending nets, splitting firewood,
   tending fever cases, teaching snares, hauling water, carving bowls,
   weeding gardens — never idle, never storage work). Prefix 🍽️◦ —
   differentiated from the production half's 🍽️ (fills the 2026-10-22 open
   cosmetic blank: on plenty days both voices fire and no longer blend).
5. The cook still cooks the haven meal; the dinner reserve is untouched; no
   RNG anywhere in the path (deterministic halving, ledger-only state).

Proof: scripts/test-storageshed-b2.js 36/36 green — gate-off RED (no ledger,
no shed voice, full 4000-budget rack smoke 2800→2240) vs gate-on GREEN
(shedKcal=1300 on the fixture, batches halved exactly once, once-per-day
gate holds across 3 resolutions, no compounding — no halved-of-halved fresh
copies, day spent ≤ 2000, tiny stacks engage nothing and leave the gate
unconsumed, dinner reserve intact, 🍽️◦ voice once/day with rotating speaker,
all 12 pool lines reachable, armed ledger byte-identical across runs).
Det-gate: STORAGESHED=0, 8 runs — ledger never created, all STABLE; AND
old-code vs new-code gate-off trajectory digests byte-identical on
9101/9102 × leadfeast/belongfeast (4/4 match) — the re-implementation adds
zero behavior when the gate is off.

## Pilot results

Sweep: scripts/sweep-storageshed-b2.js, 8 fresh seeds (61001–61008) × 2
policies (leadfeast, belongfeast) × 2 sides = 32 runs, 180d death-aware
horizons, FEASTSCALE_R13=1/SEATDRIVE=0. Proof: scripts/test-storageshed-b2.js
36/36 green. Det-gate: STORAGESHED=0, 8 runs, ledger never created, all
STABLE; old-code vs new-code gate-off digests byte-identical (4/4).

- PRIMARY rack-kcal-smoked-during-plenty (armed/control): **0.941 overall**
  (GO ≤ 0.70) → **NO-GO**. Per-policy: leadfeast 1.045, belongfeast 0.856.
- ENGAGEMENT: shedKcal > 0 on **16/16** armed runs (need ≥ 6) → OK.
  950 shed-days, 1,312 shed decisions, 5,129,088 kcal shed. The lever fires
  reliably; it is not decoration.
- GUARD rot/100d absolute: 132,596 → 182,677 = **1.378×** (flag > 1.20×)
  → TRIPPED. Split: fresh 174,581 → 266,987 (+53%); preserved 25,899 →
  18,533 (−28%).
- GUARD median survival: control 128.5d, armed 125.5d (need ≥ 118.5d) → OK.
- GUARD starvation deaths: control 6, armed 5 (need ≤ 8) → OK.
- GUARD national(end): control 10, armed 13 (need ≥ 8) → OK (armed better).
- GUARD death modes: raw comparison flagged "choir toad", "mosquito",
  "the algorithm", "the night" as armed-only. "choir toad" and "mosquito"
  are roster monsters (monsters.json), "the night" is pre-existing endDay
  content (game.js:11825 "endDay blamed 'the night'"), "the algorithm" a
  show flavor — all content, not lever effects (the diff adds zero
  registerDeath calls). Mode classes after roster-aware canonicalization:
  control [contest/show, dehydration, monster/combat, sickness, starvation,
  wound] vs armed + [night] (4 deaths / 16 runs, sampling asymmetry).
  → OK with documented rationale (same handling as the previous pilot).
- GUARD channel laundering: no named inflow channel > 2× control → OK.
- Wall (pilot): national(end) 10 → 13; table ~0 both; wins 0 both; wave-4
  12/16 → 13/16; wave-5 0/16 both; median survival 128.5d → 125.5d. The
  scale wall stands (no table, no wins, no wave 5).

### Root cause of the primary miss (measured, not guessed)

Per-seed paired analysis (rack-kcal-smoked-during-plenty):

| seed (lf) | total ratio | per-day rate ratio | plenty-days a/c | rot100d ratio |
|---|---|---|---|---|
| 61001 | 0.57 | 0.47 | 110/91 | 0.68 |
| 61002 | 1.68 | 0.59 | 69/24 | 6.88 |
| 61003 | 1.08 | 0.54 | 52/26 | 0.41 |
| 61004 | 5.60 | 0.80 | 77/11 | Inf (c=0) |
| 61005 | 1.30 | 0.97 | 63/47 | 7.78 |
| 61006 | 1.38 | 0.62 | 31/14 | 8.54 |
| 61007 | 0.73 | 0.57 | 60/47 | 1.28 |
| 61008 | 1.18 | 0.52 | 57/25 | 1.83 |

(belongfeast shows the same pattern: per-day rates 0.33–0.72, mean 0.55;
plenty-days armed > control on 13/16 seeds overall.)

1. **The mechanism works**: per-plenty-day rack rate is 0.47–0.97× across
   16 seeds (mean ≈ 0.59×; 15/16 reduced). The racks genuinely run at about
   half pace during plenty — the behavioral lever does what Steve's ruling
   asks.
2. **The total is confounded by exposure**: rack-days-plenty rises 39 → 68
   (+74%). Mechanism: the shed keeps food fresh instead of converting it to
   preserved, and plenty is measured in *fresh* days (pantryFreshDays > 4) —
   the lever's own success at keeping food fresh extends the plenty regime
   it operates in. Total = rate × days → 0.59 × 1.74 ≈ 1.03 ≈ measured 0.94.
   The arithmetic closes; the primary measured the equilibrium, not the
   behavior.
3. **rot/100d confirmed unmeasurable for this lever**: per-seed ratios span
   0.02–18.27 with two infinities (control rot = 0 on early-death seeds).
   The 1.378 aggregate is noise-dominated. The *split* shift is
   mechanistically consistent (preserved rot −28%: less smoked; fresh rot
   +53%: the left-fresh surplus the nightly meal can't finish rots fresh),
   but the absolute is not a usable judge at 8 seeds.

The lever is NOT confirmed wrong: it faithfully implements Steve's explicit
"deprioritize production AND storage" ruling, the behavioral mechanism
measures at ~0.6×/day, it fires on 16/16 runs, survival/starvation are flat,
national reach improves, and nothing new can die from it. Per Steve's kill
discipline (2026-10-21), a missed bar is not a kill: the miss is a
metric-design miss (total vs rate), not a lever miss. **PARKED, not killed**
— same standing as the previous pilot.

## metric review

- The pre-registered primary (TOTAL rack-kcal-smoked-during-plenty ≤ 0.70)
  confounds the lever's behavioral effect with its equilibrium effect. The
  lever halves the per-day rack pace (0.59× measured) but extends plenty-day
  exposure (+74%), because keeping food fresh keeps pantryFreshDays > 4
  longer. A total-kcal bar cannot pass while the lever succeeds at its own
  job. Proposed for the NEXT run: primary = per-plenty-day rack rate
  (rackKcalPlenty / rackDaysPlenty) ≤ 0.70, with total as a reported
  secondary; or pre-register the exposure explicitly (plenty-days as a
  covariate).
- rot/100d absolute is confirmed unusable as a primary for the storage half
  (per-seed 0.02–18.27, infinities). Keep it as a guardrail, but judge it on
  the split (preserved-rot share) rather than the absolute, or drop it —
  the production half owns inflow-driven waste.
- The death-mode guardrail's naive string-set comparison false-flagged a
  SECOND batch of content names (this time wave-1/2 monsters + show/night
  flavors; last time wave-4 names). Fixed with roster-aware canonicalization
  (monsters.json names → monster/combat; show/night → their classes) in
  analyze-storageshed-b2.js. Residual "night" asymmetry is sampling noise
  over pre-existing content.
- The rot guardrail (flag > 1.20×) tripped at 1.378× on a noise-dominated
  aggregate. The mechanistically honest read is the split: preserved −28%
  (good — less smoked-then-rotted), fresh +53% (the cost — left-fresh
  surplus the meal can't finish). Whether that trade is acceptable is a
  design question for the food-economy axis, recorded here rather than
  judged.

## Reachability

Waves 1–5: wave-4 reached 12/16 → 13/16; wave-5 0/16 both (the wave-5 wall
stands — window survival, not path design; unchanged by this lever). Arc:
not separately tracked (rank reached global/national). Regional →
national: national(end) 10 → 13. Table: 0 both. Wins: 0 both. Vests: not
tracked. The lever does not gate or unlock any content — it is a behavioral
economic lever, reachability-neutral.

## Village assessment

The village during plenty: the pantry reads >4 fresh days, the cook still
cooks the haven meal, and the racks run at about half pace — ~0.6× the
per-day rack kcal of control, one shed decision per cook per day, named
honestly. Sense test (60d armed, seed 61001): 44 🍽️◦ shed voice lines, 26
unique (speaker+line), 0 consecutive-day verbatim repeats, 44 shed days, 3
distinct speakers (Kelly, Layla, Howard). The lines name real instead-of
work (mending nets, splitting firewood, tending fever cases, teaching
snares, hauling water, carving bowls, weeding gardens) — never idle, never
storage work. On plenty days both voices fire (44/44 shed days also voiced
plenty) and the 🍽️◦ vs 🍽️ prefixes read distinct — the blend blank is
filled. The day stream around shed days reads like a living village (water
runs, wood hauling, meals, gossip, fire-tending, teaching).

Who thrived: villages reaching sustained plenty kept food fresh longer
(more plenty-days) and reached national more often (10 → 13). Who died:
wave-3/4 monsters dominate deaths both sides — the lever doesn't touch
combat. What was missing: the instead-of work is narration-only; the cook's
assignment doesn't mechanically change (they still cook, just less rack
work). Honest (the voice claims the absence of rack work, not a fictional
reassignment), but a future pass could make the instead-of work real. The
fresh-rot cost (+53%) is the real trade: the village keeps more food fresh
than the nightly meal can eat.

## Balanced panel (§15)

Before panel `evidence/2026-10-22/storageshed-b2-panel-before/`: 18 case
files / 16 observed rows, 8 fresh seeds (61001–61008) × {leadfeast,
belongfeast}, 150d, FEASTSCALE_R13=1, SEATDRIVE=0, STORAGESHED=0
(env-gated control), sourceHead f678af5d8, sourcesStable, neutrality
proofs green.

After panel `evidence/2026-10-22/storageshed-b2-panel-after/`: completed
from the dead run's 8 cases — 8 reused, 10 built this run (same
options/seeds, STORAGESHED=1), 16 rows, sourcesStable true, neutrality
proofs match 2/2 (leadfeast + belongfeast, seed 61001, observe on/off
byte-identical), sourceHead f678af5d8. Case JSONs live in the tree's
cases/ dirs (not committed — panel case caches never commit);
panel.json.gz for both sides committed.

Compare `storageshed-b2-panel-compare.{json,md}`: **Decision: invalid —
Unmatched flags** (STORAGESHED=0 vs STORAGESHED=1). This is the
pre-registered contract limitation for env-gated levers: the env flag IS
the lever, so comparator options can never match. The panel as instrument
is sound — matched seeds/policies, stable sources, green neutrality —
but the automated compare cannot score it. The judge is the
pre-registered threshold, applied to the 180d death-aware sweep on
identical seeds: primary 0.941 > 0.70 → **NO-GO stands** (PARKED, not
killed — verdict section unchanged).

## Blanks filled / documented

- FILLED (re-implementation): the dead run's uncommitted STORAGESHED draft
  is no longer lost — re-implemented from the spec, proof-tested 36/36,
  det-gated byte-identical off.
- FILLED (spent-accounting bug, caught in proof): the day-eased budget's
  spend accumulated only on the shedder's first pass (the 2nd/3rd
  resolutions skipped the shed block via the per-day gate and never
  accumulated) — the 2000/day cap leaked. Fixed by keying spent
  accumulation on the day record's shed flag on EVERY resolution of a shed
  day. The proof's multi-resolution probe caught it (spent stuck at 1500
  while res2 smoked 400 more).
- FILLED (open cosmetic blank): the 🍽️ day-voice prefix is now
  differentiated — production half keeps 🍽️, storage half uses 🍽️◦ — on
  plenty days both fire and read distinct.
- DOCUMENTED (open): the instead-of work remains narration-only; the
  cook's assignment doesn't mechanically change (they still cook, just less
  rack work). Honest (the voice claims the absence of rack work, not a
  fictional reassignment), but a future pass could make the instead-of work
  real.

## Verdict

**NO-GO on the pre-registered primary (0.941 > 0.70) — PARKED, not killed.**
Per §14 the miss binds: the lever does not land as a GO. Per Steve's kill
discipline (2026-10-21), a missed bar is not a kill: the lever is not
confirmed wrong — it faithfully implements Steve's explicit "deprioritize
production AND storage" ruling, the behavioral mechanism measures at
~0.59×/day (15/16 seeds), it fires on 16/16 runs, survival/starvation are
flat, national reach improves (10 → 13), and the root cause is a
metric-design miss (the total-kcal primary confounds the halved per-day
rate with the +74% plenty-day exposure the lever itself creates). Killing
it would override Steve's design direction on the basis of my metric
choice. The branch is kept; the evidence records the NO-GO and the metric
review for the next run (proposed primary: per-plenty-day rack rate ≤ 0.70).
