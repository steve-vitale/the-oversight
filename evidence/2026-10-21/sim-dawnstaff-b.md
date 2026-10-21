# sim-dawnstaff-b — LEVER: the four-condition hunt-staffing proposal

Run: fleshout-loop-b-20261021T1545Z, arm sim-dawnstaff-b (LEVER, policy-side,
zero src/js). Worker tree: ~/workspace/worktrees/sim-dawnstaff-b (branch at
current master 1aadc167d; base verified vs master before any work).
Axis: food-economy. The huntstaff-decomp-b DIAG's EXPLICIT named next
(backlog #703 answered).

## The question
sim-huntstaff-b was KILLED (additive duty:hunt staffing: real +2550 kcal/d
inflow, yet starvation 11v7, survival −53d). The DIAG (64-run paired sweep)
attributed the harm completely to four mechanisms and prescribed: "Any
future hunt-staffing proposal must address all four — dawn-timed staffing,
throttle-aware channel design, carcass-processing capacity, and hunter
survivability — or it will re-measure this kill." This arm BUILDS that
proposal: scripts/policies/dawnstaff.js (DAWNSTAFF_B=1, default-OFF), a
wrapper around the competent-family base (leadfeast/belongfeast).

## Pre-registration (binding — written BEFORE the pilot sweep, docs/MEASUREMENT.md §§9–12, 14–15)
- **Pilot**: 8 seeds (8951–8958) × {leadfeast, belongfeast} × {control, armed}
  × {rep1 measurement, rep2 det-gate pair} = 64 runs, 180d death-aware,
  paired same-commit control (historical corpora are not controls — #746).
  Confirm (12–16 seeds) ONLY on pilot GO.
- **PRIMARY — all four must pass for GO** (fast kill: any miss →
  KILLED-AT-PILOT, layer deleted zero-trace):
  - P1 median survival armed ≥ control − 10d
  - P2 starvation deaths armed ≤ control + 1
  - P3 hunter-starvation-class deaths armed ≤ control
  - P4 duty:hunt inflow armed ≥ control + 500 kcal/d (the engagement bar)
- **Guardrails** (recorded, investigated if breached): novel death modes vs
  the killed arm's {big loud, hunting, congregation, highbeam deer}; wave-4/5
  reach; national/table recorded (wins structurally 0 on this substrate).
- **Substrate** (asserted up front, LOUD STOP): FEASTSCALE_R13=1,
  SEATDRIVE=0 explicit, SURPLUSFEED unset.
- **Proof**: scripts/test-dawnstaff-20261021.js — RED→GREEN (part-histogram
  pins dawn; no throttle-bound duty ever drafted; capacity coupling fires;
  gates hold on hostile probes) + det-gate byte-identical. 23/23 GREEN.
- **Panel (§15)**: before/after through scripts/balance-panel.js
  (scripts/build-dawnstaff-panels-b.js); compare .md attached. The panel is
  the instrument, the pre-registered bars are the judge.
- **SENSE**: hunt beats from armed runs read per SENSE-TESTING LAW.

## The four-condition design (the calls I made — Steve can overrule)

**C1 — Dawn-timed staffing** (DIAG Finding 0: the killed arm's "never
re-tasks" guard was void because policy.daily fires at END-of-day; its
staffing histogram pinned 1887 staffings at part 3). The layer staffs in the
wrapper's `upkeep` — the harness calls upkeep at the START of each of the 3
day-parts — gated to `Game.dayPart === 0` (dawn) only, once per day (ctx key
on `Game.state.scholar.day`), BEFORE the base's upkeep consumes the labor.
Every staffing records the part; the sweep LOUD-STOPS if <95% land on part
0. Day 1 has no dawn (afternoon spawn, dayPart starts at 1) — the layer
honestly skips it. Proof G1: 100% of pilot staffings on part 0.

**C2 — Throttle-aware channel design** (DIAG H1: hunt is unthrottled and
games the pantry-full sensor — armed throttle 0.88 vs 0.79, fish 301→113
kcal/d). Two sub-gates: (a) THROTTLE GATE — staff ONLY when
`!Game.prodThrottleEngaged()` (pantryFreshDays ≤ 4, or the hunger-exemption
crisis). When the pantry is full the village doesn't need hunt inflow; the
unthrottled channel can no longer game the sensor because it only fires when
the sensor is off. (b) DUTY-POOL GATE — a read-only `Game.assignTask`
observer (installed only when the layer is on; zero Game writes, zero RNG)
keeps a 2-day duty history in ctx; villagers whose last duty was
water/fish/wood/stone/cook/garden/tend/teach/mend are never drafted (the
killed arm's 60.1% dusk-drafting of chore workers). Drafts come from the
forage/scout/patrol/rest/idle pool.

**C3 — Carcass-processing capacity** (DIAG H2: +1986 kcal/d as lumpy raw
carcasses; 121.8% of the fast-rot excess was hunt-channel meat). The
capacity instrument is the ENGINE's own cook duty (the cook works the smoke
racks, ~4000 kcal/part, DINNER-FIRST + RACKS-FULL guards intact — reused
from scripts/policies/kitchen.js + cookbulk-b3.js's design, not reinvented).
The layer staffs a RACK-TENDER ('cook', preserver-skill preferred) alongside
the hunters whenever none is on duty, and HUNT DRAFTING IS GATED ON IT: no
tender available → no hunter. The carcass and its processing arrive together.

**C4 — Hunter survivability** (DIAG H3: 117/230 armed deaths were staffed
hunters; 92% ever-staffed mortality). The layer refuses where the engine
would merely wince: personHp (huntstaff.js wound-ledger TRUE value, reuses
installWoundWatch) ≥ 60 (stricter than the engine's 40-HP outdoor line);
never within 3d of a wounding hunt resolve; never draft a hungry villager
(npcNeeds hunger < 60, pure read — npcNeeds WRITES state so it's never
called); consecutive-hunt-day cap (max 2 in a row, then 2 rest days — the
grind that killed the killed arm's cohort); no drafting under wave-4+ threat
(unlockedWave ≥ 4 stands the layer down); trust ≥ 20 (DESIGN CALL: the
engine's own dangerous-work line via checkObedience — hunt asks trust≥20
with a 40% reluctant refusal below 40 — is the last word; the killed arm's
40 was stricter than the game and blocked engagement for weeks while adding
no mechanism the four conditions don't already cover); scholar never;
garden keeper never. Cap: 2 hunters/day (the killed arm's cap stands).

## Results (pilot: 64 runs, 8 seeds × 2 policies × 2 sides × 2 reps, 180d death-aware)

**In-sweep det-gate**: 32/32 rep1/rep2 pairs byte-identical. **Part-histogram**:
60/60 staffings on part 0 (100% ≥ 95% — C1 pin holds, no loud stop).
**Proof**: 23/23 GREEN (test-dawnstaff-20261021.js). **Panel (§15)**:
`review_required`; leadfeast national regression_signal (−0.375),
communityLost regression_watch (+0.25). The panel is the instrument; the
pre-registered bars are the judge.

### PRIMARY bars (all four must pass — judged as written, §14)

| Bar | Control | Armed | Verdict |
|-----|---------|-------|---------|
| P1 median survival ≥ control−10d | 148d | 141d (bar 138) | **PASS** |
| P2 starvation ≤ control+1 | 12 | 7 (bar 13) | **PASS** |
| P3 hunter-starvation ≤ control | 0 | 2 (bar 0) | **FAIL** |
| P4 duty:hunt inflow ≥ control+500 kcal/d | 0 | 15 (bar 500) | **FAIL** |

**Engagement**: 60 hunter-staffings + 81 rack-tenders across 16 armed runs
(3.75 staffings/run); gate open 146/2880 dawns (5%). The layer fired, but at
~1/27th the rate the P4 bar assumed.

### P3 autopsy (the 2 hunter-starvation deaths — belongfeast s8954)
Diana Osei (staffed d90, d92, d93; starved d93 — the SAME day as her third
staffing) and Devon Okafor (staffed d78, d79, d85, d91, d92; starved d114).
Both passed every C4 gate at staffing time (hp 72–100, hunger < 60 at dawn,
no recent wound, rest days honored). The hunger gate is POINT-IN-TIME;
starvation is a PROCESS. Diana was below the hunger line at dawn, hunted
instead of eating, and starved by dusk. The C4 survivability gates do not
cover intra-day starvation on the hunt — a real mechanism leak, not noise.
(The killed arm's H3 was hunters DYING to the wild; this is hunters STARVING
on the duty — a new failure mode of the staffing itself.)

### P4 autopsy (why the channel never fired)
The throttle gate (C2a) is the binding constraint: the village's pantry
holds >4 fresh days on ~95% of days (the competent-family village solves
its food problem in week 1 and never looks back). The layer correctly
stands down — it is a lean-times instrument on a substrate with no lean
times. When it does fire (146 gate-open dawns), the duty-pool + trust +
hp/hunger gates admit ~40% (60 staffings). Mean inflow 15 kcal/d vs the
500 bar. The bar assumed killed-arm-like engagement; the four-condition
design's safety IS its quietness.

### Guardrails
- **Novel death modes**: none beyond roster lottery. Armed-only names ("the
  thing with headlights for eyes"×2, "hushpuppy"×4, etc.) are wave-monster
  roster rolls, same class as control's "monster"×53. The killed arm's
  {big loud, hunting, congregation, highbeam deer} did NOT recur; no
  'hunting'-cause deaths (the duty itself didn't kill).
- **Wave reach**: control w4 15/16, armed w4 14/16; w5 0/16 both (the wave-5
  door remains shut game-wide on this substrate).
- **Wall numbers**: national 9/16 → 7/16; table 15/16 → 16/16; won 0/16 both.
- **H2 watch**: fast-rot 2.77× control (479 → 1328 kcal/d); hunt-channel
  fast-rot excess 13,932 kcal total. The C3 capacity coupling did NOT fix
  the rot — MECHANISM FAILURE: the rack-tender is staffed at dawn and
  resolves at part 0 BEFORE the hunter's meat arrives (tender resolves
  first in insertion order); the one-part assignment is gone before the
  carcass needs smoking. The meat (spoilDay day+3) becomes smoke-eligible on
  day+1, when no tender is on duty. The coupling is mistimed by construction.
- **H1 watch**: throttle engagement 0.85 → 0.87 (slight rise); duty:fish
  163 → 168 kcal/d (NO cannibalization — the C2 duty-pool gate worked).

## Village assessment (plain words)
The villages looked like places that almost never needed hunters. The
pantry stayed full, the throttle kept the foragers on other work, and the
dawn staffing layer — built to fire only when the village was lean — stood
down day after day, correctly. On the rare lean dawns it sent out a hunter
with a rack-tender in tow, and the meat came home in lumps and mostly rotted
anyway, because the tender worked the racks before the carcass arrived. Two
hunters starved on the duty — not to monsters, but to the hunt itself taking
them away from food on a day they couldn't afford. The layer didn't kill any
villages (P1/P2 pass), but it didn't feed them either. The four conditions
made the staffing safe; they also made it pointless. The village's food
problem, on this substrate, is not a shortage of meat.

## Sense-testing (SENSE-TESTING LAW)
Read armed-run sayLines for hunt beats (60 staffings). The beats read as
people: dawn departures narrated ("At dawn ___ takes up the spear — the
pantry's lean and the treeline's the honest play"), kills with the honest
wound tax ("brings back meat (+___ kcal) but got hurt out there"). No
robotic decision-making observed. Filed, not chased: the stalk-fail beat
("it winds them and it's gone. Nothing to bring home.") still repeats
verbatim — the narration blank from the DIAG (sim-findings.md) is unchanged
by this arm.

## Metric review
- P3's bar (armed ≤ control = 0) is strict by construction — the control
  side cannot have hunter-starvation deaths (nobody staffed). Any
  ever-staffed hunter who starves, for any reason, fails it. The 2 deaths
  are real mechanism leaks (intra-day starvation), not bar artifacts.
- P4's bar (+500 kcal/d) assumed killed-arm engagement rates. The
  four-condition design cannot reach it by construction (the throttle gate
  is the point). The bar correctly killed the arm — a quiet lever is not a
  food-economy lever.
- The C3 mistiming (tender resolves before the meat arrives) is a design
  flaw in this arm, not a metric flaw. A future proposal would need the
  tender to work AFTER the kill (next-day staffing, or the base's
  end-of-day cook staffing catching the day+1 eligibility window).
- Det-gate held 32/32; proof 23/23; part-histogram 100% dawn. The
  measurement is trustworthy; the lever is not viable.

## Verdict
**KILLED-AT-PILOT** (P3 FAIL, P4 FAIL). The four-condition design is safe
(P1/P2 pass, no novel death mechanisms, fish channel intact) but non-viable:
it cannot engage enough to move the food economy (P4), it leaks
hunter-starvation through a point-in-time hunger gate (P3), and its capacity
coupling is mistimed (H2 recurs at 2.77×). Per the pre-registration, the
layer is DELETED ZERO-TRACE. No confirm. No lever ships.

The deeper lesson for the food-economy axis: the village does not lack
inflow — it lacks lean times. Hunt staffing, even done right, is a solution
to a problem this substrate doesn't have. The axis needs a different lever.

Wall numbers (pilot corpus, rep1, n=32): national 16/32, table 31/32,
won 0/32, wave4 29/32, wave5 0/32, median survival 144d.
