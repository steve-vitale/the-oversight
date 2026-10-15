# sim-succpolity — succession-persistence lever (2026-10-15)

Worktree: `~/workspace/worktrees/sim-succpolity`. Run: oversight-flesh-out-loop (loop A),
ARM 1 of 2, run fleshout-a-20261015T0915Z, scale-onramp axis.
Assignment: sim-findings #301 (measured 2026-10-15 by sim-tworung2): when the scholar dies,
the engine dissolves the polity ("the dead hold no treaties" → "the realm came apart"),
dropping Haven national→regional even with links intact and arrears clean. Measured 1/13
national reaches.

Canon read first: docs/CANON.md, docs/SCALE.md. The lever touches ONLY src/js/hierarchy.js,
env-gated SUCCPOLITY=1 (default OFF).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Question**: does making the polity persist through succession reduce
  succession-collapse national demotions, without changing the wall's other faces?
- **Lever**: SUCCPOLITY=1. onLeaderDeath stamps each shaken link with its pre-death
  standing (`_succDay`/`_succTrust`); for 14 days after, the polity-membership trust bars
  (BELONG's >= 50, seasoned >= 40 on the lead/covenant/trade roads) read the INHERITED
  standing. The chaos is untouched: the -8 haircut still lands on link.trust, the 7-day
  mourning choke still gags gains, tribute still renegotiates (x1.5 / x0.75), the neglect
  snap (trust < 20 + 14d no upkeep) still kills. Past the 14-day proving window without
  re-tending, the realm dissolves aloud as before — persistence is a proving window,
  not immunity. Standing's diplomacy count (standing.js) keeps the shaken trust:
  the grace is polity membership only, not wave math.
- **Design rationale** (Steve can overrule): Steve's young-bond ruling (2026-10-13/14)
  says the bearer inherits the obligations — no automatic relief, renegotiation is the
  asked-for path. The funeral-hour dissolution ("the dead hold no treaties") contradicts
  that inheritance: the realm's fires judge the new speaker in the funeral hour instead
  of over the proving window. The existing successionCrisis haircut IS the
  chaos-renegotiation; this lever adds no new relief valve.
- **Why 14 days**: mourning gags trust gains for 7 days, so a 7-day grace would dissolve
  the moment it expires; 14 days gives one real week of tending after mourning. Matches
  the BELONG standing bar's 14-day cadence and the neglect cadence.
- **PRIMARY (§14, absolute counts)**: succession-collapse demotions (national→regional
  on scholar/person death ±3d, nothing else firing — the tworung-lib-20261015.js
  nationalHold taxonomy) armed ≤ control, identical seeds, own control in the same sweep.
  (CONTROL BASELINE DRIFT #247: never inherit baselines.)
- **GUARDRAILS**: national reaches armed ≥ control−2/16; median survival armed ≥
  control−10d; no new national-loss mode at n≥3; table/wins report-only.
- **Substrate**: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
  {control, SUCCPOLITY=1}, 180d death-aware, FEASTSCALE_R13=1.
- **Wall numbers every run**: national / table / wins, wave 4–5 unlocks, median survival.

## Gates (all green before spend)

- Proof `scripts/test-succpolity-20261015.js`: **REAL RED pre-change** (R1/R2/R3 —
  belong/lead/covenant fixtures: the levered assert correctly FAILED on the unmodified
  engine, 3/3 PASS(red)), **GREEN 7/7 post-change**:
  G1–G3 the three roads persist through the 14d grace (covenant crisis stays staged/played);
  G4 grace expiry without re-tending → the realm dissolves ALOUD (nationalLive clears via
  _checkNational — persistence is not immunity); G5 the chaos is untouched (-8 haircut
  lands on link.trust, belong tribute x1.5 renegotiation fires, mourning marks);
  G6 the neglect snap still kills (death + neglect, not death alone); G7 gate OFF →
  the old funeral-hour collapse still happens (the env var is the switch).
  NOTE: post-change, the R1–R3 RED asserts no longer fail (they are the lever's asserts
  on the levered engine) — the RED was demonstrated on the pre-change run; see sweep log.
- SMOKE=1: 4/4 green (2 policies × 2 arms, 15d, samples collect, no crash).
- DETGATE=1: **GREEN** — D1 gate-off determinism (11/leadfeast/60d ×2 byte-identical);
  D2 armed determinism (×2 byte-identical); D3 mechanism isolation (11/belongfeast/60d:
  control had zero leader-death beats → armed trajectory byte-identical to control —
  the lever touches nothing outside the succession path).

## Results

32 runs (8 seeds × {leadfeast, belongfeast} × {control, SUCCPOLITY=1}, 180d death-aware),
deterministic across re-runs (D1/D2). Full rows:
`evidence/2026-10-15/sim-succpolity-runs.json`; per-seed records:
`evidence/2026-10-15/perseed-succpolity/`; sweep log:
`evidence/2026-10-15/sim-succpolity-sweep.log`.

**PRIMARY: GO — succession-collapse demotions armed 0 ≤ control 1.**

| arm (n=16) | succ-collapse | national | table | wins | w4 | w5 | med surv | max | loss modes |
|---|---|---|---|---|---|---|---|---|---|
| control | **1** | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | 180d | village-death 2, held-to-end 2, succession-collapse 1 |
| armed | **0** | 5/16 | 8/16 | 0/16 | 8/16 | 6/16 | 128.5d | 180d | village-death 2, held-to-end 3 |

Per policy: leadfeast national 5/8 both arms, table 4/8, w4/w5 4/8, med 128.5d;
belongfeast national 0/8 both arms, table 4/8, w4 4/8, w5 2/8, med 108.5d.
Ends: identical distributions (leadfeast: 4 village-lost / 3 survived / 1 village-dead
both arms; belongfeast: 6 village-lost / 2 survived both arms). Vests 0/16 both arms.
Arcs: 8 at arc 3, 8 at arc 4, both arms. Mean nationalHeldDays 21.1 control → 25.4 armed.

**The one conversion — leadfeast s44, identical seeds:**
- control: scholar Devon Okafor dies in combat d115 → "the dead hold no treaties" →
  "◈ The realm came apart" the same day → national held 39d, succession-collapse.
- armed: the same death d115 fires the same funeral beat → the realm holds →
  national held 105d to the d180 horizon (held-to-end).

Everything else is byte-identical between arms (D3 isolation held in the suite:
no other run's trajectory diverged). The lever did exactly one thing in 32 runs:
it converted the single funeral-hour dissolution into a held rank. No tribute-collapse
shift, no new mode, no survival change.

**Guardrails: all green.** national 5 ≥ 5−2 ✓; median survival 128.5 ≥ 128.5−10 ✓;
no new national-loss mode at n≥3 (armed modes ⊆ control modes + held-to-end) ✓;
table/wins report-only (8/16, 0/16 both arms) ✓.

## Village assessment (plain words)

Thirty-two villages, two fates per seed. The leadfeast villages are the long-lived
ones — five reach national on both arms, four unlock wave 5, and the scholar's death
is the only thing that ever took the rank off one of them. Seed 44 is the story:
Devon Okafor dies fighting on day 115. In the control telling, the funeral ends the
realm the same afternoon — "National and global no longer describe this village. The
climb starts over" — a 39-day national reign closed by a death. In the armed telling,
the same funeral fires, the same grief is said aloud, and the realm simply continues:
the new speaker inherits the table, the fires re-tend the trust over the next two
weeks, and the village is still national at day 180. The death still costs — the
haircut, the mourning, the tribute pressure all fire — it just doesn't end the story.
The belongfeast villages never reached national on either arm this run (0/8 both) —
their story is the courtship that never quite seasons, identical under both arms.
Nobody wins (0/32); the table's lesser seat is reachable (8/32); wave 5 opens for the
feast-heavy lead road (6/16). The wall's face is unchanged: survival and the win flag,
not succession.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Two moments read:

1. **leadfeast s44, d115, control vs armed (the conversion):** control reads
   "🕯️ Devon is dead — and the dead hold no treaties. Every link Haven has shakes."
   then "◈ The realm came apart — no polity answers to Haven now, and Haven is a free
   fire again. National and global no longer describe this village. The climb starts
   over." Armed reads the funeral beat and then *nothing* — the realm holds through
   the silence. The armed version is the better village story: the death has full
   weight (the beat still fires, the haircut/mourning/tribute moves still land) but
   the funeral doesn't end the polity. PASS.
2. **belongfeast s44 armed, the succession drumbeat:** 12 representative/scholar
   deaths, each firing the identical "dead hold no treaties" line verbatim
   (d21 Howard, d26 Carlos, d57 Minh, d58 Leandro, d61 Divya, d84 Kai, d87 Ivy,
   d97 Zoe, d100 Konrad, d107 Devon, d108 Aria, d115 Fatima). The repetition reads
   robotic on the twelfth funeral — the same template-recognition note as tworung2's
   night-raid beats. Filed as a finding (below), not chased.

## Blanks filled / documented

- **FILLED**: the succession-collapse mechanism, demonstrated on fixtures — the polity
  bars read the funeral hour's shaken trust; the lever moves that read to the inherited
  standing for a 14-day proving window (proof 7/7 GREEN, REAL RED 3/3 pre-change).
- **FILLED**: scripts/test-succpolity-20261015.js (proof) + scripts/sweep-succpolity-20261015.js
  (SMOKE/DETGATE/sweep; reuses tworung-lib-20261015.js nationalHold taxonomy) — reusable
  for future succession arms.
- **DOCUMENTED (sim-findings.md)**: the "dead hold no treaties" succession beat repeats
  verbatim for every representative death (12× in one 180d run) — template repetition
  visible in long runs, same class as the night-raid beat note from sim-tworung2.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply to the NEXT run)

1. **Death-cause shares unmeasured this run** (instrument gap): the sweep persisted
   succession beats only — deathFam/deathKinds were not computed. The lever's D3
   mechanism-isolation (byte-identical trajectories absent a leader death) plus the
   identical end-state and wave/table distributions make a death-profile shift
   implausible, but it is unmeasured, not proven. NEXT RUN: persist deathFam in the
   sweep rows.
2. **succession-collapse is rare** (1/16 control here; 1/13 in sim-tworung2). The
   absolute-count PRIMARY is the honest metric and it passed, but it is low-power —
   the mechanism proof (fixtures) and the identical-seed conversion (s44: 39d →
   held-to-end) carry the causal story, not the count. A future arm wanting power
   would need a succession-enriched substrate (a design question, not a measurement
   fix).
3. **The belong road reached 0/8 nationals on both arms** (vs 3/8 in sim-tworung2 on
   the same policies and seeds). Identical in both arms, so it is substrate variance
   in the belong courtship, not the lever — but it means the lever's measured action
   this run was lead-road only. Noted for the next succession arm's substrate choice.

## Convergence

**GO: the lever lands.** succession-collapse 0/16 armed vs 1/16 control (identical
seeds, own control), guardrails green, mechanism isolated by det-gate, fixtures
REAL RED→GREEN. scale-onramp stays the blocking axis: wins 0/32, table 8/32 with
0 wins (the lesser seat reachable, the win flag not), wave-5 6/16 on the lead road.
The succession face of the wall is now measured and levered; the remaining faces
are survival and the win flag.
