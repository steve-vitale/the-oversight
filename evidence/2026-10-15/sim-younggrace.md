# sim-younggrace — consolidation-grace lever for young nationals (2026-10-15)

Worktree: `~/workspace/worktrees/sim-younggrace`. Run: oversight-flesh-out-loop,
run_id `fleshout-a-20261015T0615Z`, scale-onramp axis (standing scale
directive — political-attrition face of the wall, per evidence/2026-10-15/sim-holdloss.md).

Canon: docs/CANON.md read first. docs/SCALE.md read (inter-village
hierarchy, national as live state, raid/tribute canon). **No canon doc
covers a young-national consolidation grace — said plainly here instead
of invented:** this is a small balance lever on the political-attrition
face (raid/tribute pressure on young nationals), not a canon rewrite.
Steve's designs (commons raids, succession tribute-press-down, national
as live state) are left intact; the lever only softens their pressure
for the first 30 hold-days after the court sits.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** does easing rival raid + succession tribute pressure on
young nationals extend national-hold days on the hold face the
holdloss census named (political attrition, not monsters)?

**LEVER GO (binding):** total national-hold days (sum across runs,
horizon-capped) with YOUNGGRACE=1 ≥ **1.3×** the same-seed control.
GO → land as its own commit. MISS → kill: revert src/js per the kill
protocol (evidence + scripts only, no trace in src/js).

**GUARDRAILS (binding):** median survival ≥ control−10d; national
formations ≥ control−2/8; no new death mode (n≥3).

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × leadfeast ×
{control: YOUNGGRACE unset, armed: YOUNGGRACE=1}, own control in the
SAME sweep (never inherited). FEASTSCALE_R13=1 asserted up front
(#312 lesson — leadfeast is a feastscale policy).

**Horizon + why:** 180d death-aware (dead villages stop, +10d tail
max). Nationals reach ~d77–150 on this tip; the hold question needs the
post-reach months. Same justification as sim-holdloss.

**The lever (ONE mechanism, three effect points, opt-in gate):**

`Game.youngGraceOn()` — new helper in src/js/hierarchy.js (near
scaleRank): true when `YOUNGGRACE=1` in the environment AND
`state.nationalLive` AND fewer than 30 hold-days have elapsed since
formation (reuses the existing `state.nationalDay` formation date,
hierarchy.js:2492). 30 = one season (canon: 1 season = 30 days,
docs/SCALE.md 2026-10-11). Default OFF — gate-absent trajectories must
be byte-identical (det-gate D1).

Effect points (all under grace only):
1. **Rival night-raid frequency halved** — src/js/game.js:19208,
   `commonsTick()`: roll `Math.random() < 0.08` → `< 0.04` under grace.
2. **Rival night-raid take halved** — src/js/game.js:19219,
   `commonsRaid()`: `take = 500 + floor(rand*1001)` halved under grace
   (the "carried off ~N kcal from the pantry" channel). The
   `pantryDraw` verb at game.js:19230 is NOT touched — only the `take`
   argument is scaled (sim-capdraw owns the pantry-draw verb).
3. **Succession tribute-press-down softened** — src/js/hierarchy.js:1570,
   `successionCrisis()`: the "presses the tribute down while the chair
   is empty" cut `×0.75` → `×0.9` under grace (said aloud in the line).

NOT touched (out of arm, or other arms' claims): the pantry-draw verb
(sim-capdraw), scripts/succhain-*, scripts/policies/tribshield.js,
middaymeal.js, rangerefill.js, the monster night raids in havenGrowth.js
(a different pressure face), theirLeaderDied paths, garden-trampling
branch, rebellion/sabotage, rebellion trust logic.

**Proof:** scripts/test-younggrace-20261015.js — REAL-RED/GREEN
(mechanism demonstrably absent with the gate off, present with it on,
direct unit invocations on pristine trajectories) + det-gate (gate-off
trajectories byte-identical) + SMOKE=1 instrument-honesty gate.

**Telemetry:** per-seed records {run, seed, policy, national, table,
wins, exiled} (0/1) in evidence/2026-10-15/telemetry-younggrace/
(runs named `younggrace-control` / `younggrace-armed`).

## Results

**PRIMARY: MISS — armed total national-hold days 326 vs control 337 (0.97× < 1.3×).**
Per the binding kill protocol: the src/js lever is REVERTED byte-clean
(`git checkout HEAD -- src/js/game.js src/js/hierarchy.js` — zero hits
for youngGraceOn/YOUNGGRACE in src/js after revert, both files
node --check clean). Evidence + scripts only, no trace in src/js.

| arm | hold-sum | national | median surv | wins | table |
|---|---|---|---|---|---|
| control | 337d | 5/8 | 128.5d | 0/8 | 4/8 |
| armed (YOUNGGRACE=1) | 326d | 5/8 | 128d | 0/8 | 4/8 |

Per-seed armed vs control holds: s22 78 vs 72, s33 105 vs 105,
s44 51 vs 39, s55 0 vs 0, s66 75 vs 105, s77 17 vs 16, s11/s88 0 vs 0
(both never reach national). The armed gains (+6, +12, +1) are
swallowed by the s66 swing (−30: control held-to-end, armed lost the
rank d150 on a combat+starvation entanglement).

**GUARDRAILS:** median survival 128d ≥ control−10d (118.5) ✓; national
formations 5/8 ≥ 3/8 ✓; no new death mode — death-cause families
(control: combat 207, starvation 12, monster 9, sickness 10, wounds 7,
'Big-Bane' 1; armed: combat 217, starvation 13, monster 8, sickness 10,
wounds 6, 'Big-Bane' 1) — every armed family exists in control ✓.

**The mechanism FIRED — this is "no effect," not "no signal."**
A grace-window firecheck (same seeds, YOUNGGRACE=1, instrumented) on
the 5 armed national runs: 158 grace-active days total (s22 30, s33 30,
s44 51, s66 30, s77 17; s44 re-armed when the realm dissolved and
re-formed — by design), with **34 rival raids halved** and **39
tribute presses softened ×0.75→×0.9** inside the grace window. The
unit proof (15/15 GREEN: REAL-RED on pristine rates/presses, exact-half
take on identical seed 1323→662, boundary at 30d, det-gate D1
byte-identical) stands; the lever did exactly what it was built to do
and the holds did not move.

**Loss-mode mix shifted, durations didn't.** Control national loss
modes: succession-chain ×2, held-to-end ×2, other-named ×1. Armed:
succession-chain ×1, held-to-end ×1, combat ×1, starvation ×1,
other-named ×1. The grace moved s22 from succession-chain to a
mixed combat/starvation entanglement and s44 held 12d longer through a
softer succession shock, but s66's entanglement (raid → funeral →
tribute press → starvation) played out in full at d130–150, past the
grace window — the pressure that kills young nationals is real, and
halving it for 30 days only reschedules the entanglement, not the
outcome.

Sweep: 16 runs in ~129s. Summary:
evidence/2026-10-15/sim-younggrace-runs.json; per-seed records:
evidence/2026-10-15/perseed-younggrace/ (loss + narrative + `-full`
with deaths/beats/scale rows); sweep log:
evidence/2026-10-15/sim-younggrace-sweep.log; telemetry (coordinator
check): evidence/2026-10-15/telemetry-younggrace/ (16/16 valid records).

## Loss narratives (SENSE-TESTING LAW — read, not counted)

**1. armed s22 — other-named, village-lost d178 (78d hold, nat d77–147).**
Elif Demir dies in combat d133 → "the dead hold no treaties. Every
link Haven has shakes." → Stonebridge, Thornfield, and Emberhold
each press the tribute down the same day, each watching to see if
Haven holds without its dead. Thornfield raids the pantry d134
("carried off ~1120 kcal" — full-size; the grace window closed at
d107, so this is correct behavior). Combat deaths d143–165, the rank
falls d148. The narrative reads as genuine politics: three villages
independently test the empty chair on the funeral day, then the pantry
raid lands the economic blow. The succession-chain attribution the
control run earned became a mixed entanglement armed — the
mechanism moved the mode, not the outcome.

**2. armed s66 — combat (instrument) / raid→succession→starvation
entanglement (honest read), village-lost d150 (75d hold, nat d77–151).**
STARVING beats fire d130–131; Emberhold raids the pantry d131 (~978
kcal); Aroha Ngata dies in combat d132 → the dead hold no treaties →
Stonebridge, Thornfield, Emberhold press the tribute down on the
funeral day; Peter starves d150 and the rank falls. The instrument's
combat plurality is honest by its rule but the story is the same
entanglement the holdloss census named: rivals bleed the pantry, the
funeral triggers the tribute test, hunger finishes the hold. The
villagers act like people throughout — working, feasting, learning a
counter for Static mid-collapse, holding moots — and the neighbors act
like political agents, not pressure valves. Nothing in these two
narratives reads senseless or robotic.

## Village assessment (plain words)

Eight leadfeast villages, five reaching national at d77 (the other
three die young: s11 d34, s55 d106, s88 d59 — identical trajectories
both arms, the grace never armed for them). The nationals all die or
hold on the same terrain the holdloss census mapped: two hold to the
horizon untouched (s33, 105d holds both arms — the grace changes
nothing where the village is strong), two lose to funeral-day politics
(s22, s44 — one softened, one rescheduled), one loses to the full
entanglement (s66), one dies 17 days into the hold eaten by raids
(s77). The grace did not save a single hold; it gave s44 twelve more
days and s22 a different loss name. The villages that hold long hold
because their succession chain holds, not because their pantry is
raided less — and the villages that die, die on the funeral day, not
the raid day. That is the honest blank this run fills: **the
political-attrition face is succession-first, raid-second**, and a
30-day pressure holiday addresses the second.

## Blanks filled / documented

- **FILLED (instrument, retained):** the YOUNGGRACE unit proof
  (scripts/test-younggrace-20261015.js, 15/15 GREEN — REAL-RED on
  pristine raid rate/press/take, exact-half determinism, 30d boundary,
  det-gate D1 byte-identical) and the 16-run sweep
  (scripts/sweep-younggrace-20261015.js, SMOKE/SWEEP green, per-seed
  telemetry records for the coordinator's check). Reusable for future
  grace/pressure arms; the kill verdict is a result, not waste.
- **FILLED (killed lever, reverted byte-clean):** the
  consolidation-grace lever itself — no trace in src/js. Kill
  protocol honored: evidence + scripts only.
- **DOCUMENTED (for the findings backlog):** the hold wall is
  over-determined — easing young-national raid/tribute pressure fires
  as designed (34 raids halved, 39 presses softened) and buys zero
  holds; it shifts loss modes rather than extending durations. Next
  pressure-side arms should target the succession day itself (the
  succhain instrument's sub-bar-link finding is the open candidate),
  not the raid channel.
- **DOCUMENTED:** the s44 grace re-arm — when the realm dissolved and
  re-formed, nationalDay re-dated and the grace restarted (51
  grace-days). By design in the lever; worth stating so a future arm
  doesn't mistake re-arming for a bug.
- **DOCUMENTED:** armed s66's loss window is a second independent
  sighting of the holdloss s77 entanglement class
  (raid→succession-shock→starvation) — the taxonomy's other-named
  remainder has a shape now, even if this run's instrument didn't name
  it.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **The GO bar was honest and the miss is real.** 0.97× on the
   primary with the mechanism provably firing is a kill, not a
   metric artifact. No revision to the 1.3× bar is warranted — the
   lever's effect size is ~zero, not ~1.2×.
2. **Small-n composition risk is real but binds anyway.** The −30d
   s66 swing dominates the 8-seed sum; a 16-seed confirm might have
   washed it out. But the pilot gate's job is to kill cheaply, and a
   lever whose best case is "maybe the swing washes out" is not a
   lever to confirm — the firecheck proved the mechanism had 158
   grace-days to work with, which is plenty of exposure for a
   first-order effect.
3. **The hold-day sum is the right primary for pressure levers.**
   Formations (5/8 both arms) and median survival (128 vs 128.5) were
   untouched — a lever that only reshuffles loss modes shows up
   nowhere. If a future arm targets the succession day itself, the
   same primary (hold-sum ratio) applies unchanged.
