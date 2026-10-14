# sim-scale-r35 — scale-onramp three-arm run (flesh-out loop A, 2026-10-14 ~15:50 CDT)

Standing directive: every run attacks the scale wall until scale-onramp reads converged.
Tracker state at run start: scale-onramp = converging. Sibling loop B live on food-economy (not claimed).

## Stale-lock recovery (this run, 20:53Z)
Lock held run_id `fleshout-a-2026-10-14-1919` (created 19:34:04Z, 79 min old). Its run
COMPLETED before dying: all three arms (siegedef3, warroad, succbrake) killed at pilot,
evidence committed as c1f1ae42/bae4b189/a60273ad + run summary 1001b1df. No registered
tree for its run_id → run DEAD per the concurrency guard (no heartbeat evidence). Deleted
the lock and the dead run's claim file (per "delete the claim when the run ends, even on
failure"); no orphaned work remained. Loop B (fleshout-b-2026-10-14-1930) LIVE on
food-economy all run (sim-allowgate3, sim-overdraw3, sim-tribgate; tribgate landed its own
kill-evidence 6382bfc7 mid-run — its work, no conflict). No territory overlap at any point.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
Axis: scale-onramp. Three POLICY-side arms (scripts/policies/*.js new files, default-OFF
env gates — always safe together, zero game-code interaction). Each: 8-seed pilot on
identical paired seeds before any confirm; death-aware horizons; SMOKE=1 instrument
honesty; det-gate; proof REAL RED→GREEN. Killed arms leave no trace (layer deleted,
proof/sweep/evidence kept). Metric binding (§14): a miss is NO-GO, never re-scored mid-run.
Feast/tribute/allowance verbs untouched (loop B territory).

- ARM 1 sim-hybridroad (claims r34 blank #6 HYBRID-ROAD HINT): PRIMARY = villages alive
  at d+30 post-wave-4-unlock ≥ control AND wave-4 unlocks ≥ control−1. GUARDRAILS:
  median ≥ control−10d; national ≥ control−2; no new death mode (cause-family, n-floor).
  Baseline: r33/r34 propose substrate re-applied (competent + propose layer, 8 seeds
  11/22/33/44/55/66/77/88, 150d death-aware).
- ARM 2 sim-recoverylever (claims r34 blank #5 RECOVERY-LEVER CANDIDATE): PRIMARY
  (survival) = median survival ≥ control+5d. GUARDRAILS: national ≥ control−2; wave-5
  ≥ control−1; no new death mode. Baseline: succbrake courtship suite (leadcourt +
  FOURTHLINK=1, 8 seeds, 180d death-aware).
- ARM 3 sim-raiddef (claims sim-findings RAID-CHANNEL REMAINDER): PRIMARY = post-unlock
  non-draw Haven combat deaths per unlocker ≤ control × 0.70. GUARDRAILS: median ≥
  control−5d; national ≥ control−2; wave-5 ≥ control−1; no new death mode. Diagnostic
  screen FIRST on current tip; kill at precondition if non-draw <30% of the
  post-unlock Haven-death surface. Baseline: siegedef3 leadfeast substrate
  (leadfeast + FEASTSCALE_R13=1, 8 seeds, 180d death-aware).

## Results — 0 GO / 3 KILLED

### ARM 1 — sim-hybridroad: KILLED AT PILOT (commit ee47425b, landed)
Hybrid road FALSIFIED. Where the modest hunt drive fired (s22, s55, s66), it didn't add
"a little war" under the diplomacy road — it PULLED THE VILLAGE OFF the diplomacy road:
endStanding diplomacy = 0 on all three hunt seeds. Committed wave-3 fights turned the
scholar's days from courtship to combat. s55 is the tragedy: 5 wave-3 points banked,
links broke from deaths, wave 4 unlocked via the war lane at day 136 — 76 days late —
and the village died 7 days later to the Mirror Draft. Where the hunt didn't fire
(s11, s44 — diplomacy unlocks), the armed side died EARLIER than control (130→109,
150→120) despite the readiness hold firing: the hold kept the hurt scholar home eating
from a pantry nobody was filling. s66's recipe doesn't replicate as a deliberate drive —
the deliberate version eats the diplomacy it was meant to supplement.
PRIMARY missed both prongs (alive-at-d+30 2/8 < 3/8; unlocks 3/8 < 4);
median 130→109d MISSED the −10d guardrail (109 < 120); alien ×2 (singletons s22/s77)
fired the death-mode guardrail. Starvation deaths 5→14. Links formed 22→22
(seasoned 19→15). Table/wins 0/8 both; wave-5 0/8.
Blanks FILLED: (1) s66's 2 organic kills were survivorship, not a recipe; (2) readiness
hold as heal discipline moves nothing (5 holds/15 recover days) — a hold without a
defense to join is slower starvation; (3) policy-wrapper tooling bug caught pre-spend
(literal wrapper objects silently drop competent's setup/upkeep → villages starve by ~d30;
fixed with the courtkill Object.assign pattern).
Proof 10/10 + 11/11 RED→GREEN, det-gates 8/8 with 3184c187 INFO-SKIP guards; layers
deleted per kill protocol. Evidence evidence/2026-10-14/sim-hybridroad.md.

### ARM 2 — sim-recoverylever: KILLED AT CONFIRM (commit 53bbe028, landed)
The r34 accident re-tested with a survival primary. Layer (RECOVERYLEVER=1): any combat
death OF A PERSON opens a 2-day Haven hold — scholar Haven-bound (bounded walk-home),
travel guard declines wild sorties, guard-posture line once per window ("nobody ranges
till the watch stands down", names dead + living), chained deaths extend.
SENSE-TESTING CATCH mid-pilot: the first armed pilot fired windows on MONSTER deaths
(kind:'monster', cause 'combat' — a villager killing a monster) and narrated "After
Someone's death…" for a dead paparazzo. Fixed to people-only trigger (proof G10
added); post-fix transcripts read as mourning.
Pilot (8 registered seeds): median 147d vs 94d (+53d) → GO; 6/8 longer; two first-ever
180d survivals on this road (s44, s77). Guardrails held.
Confirm (12 FRESH seeds): median 130d vs 125.5d (+4.5d) — MISSED the ≥+5d bar by 0.5d
→ NO-GO per §14. Guardrails all passed (national 10/12 ≥ ctrl−2; w5 4/12; exiled 0;
no new death mode at n≥3 family floor).
THE REAL FINDING: the effect is regime-dependent — large on hard seeds (s33 37→123d,
s66 58→172d), ~zero on easy seeds (confirm's friendly regime: control 125.5d). Three
independent median-positive measurements now exist (+27.5d r34, +53d pilot, +4.5d
confirm). The throttle doesn't make villages strong; it makes them careful after loss,
and careful villages live long enough to become strong. But when the end comes in the
first month (s777: 29d), no regrouping helps — the trauma IS the end. Longer-lived
villages meet more Haven sieges (player:combat deaths 54 armed vs 30 control) —
r34's siege finding, replicated.
Blanks FILLED: (1) recovery throttle is a real, regime-dependent survival instrument —
not noise; (2) the trigger MUST be people-only (monster-death grieving is a bug, not
a feature). Metric review proposes a stratified/proportional bar and same-regime
confirm seeds for the next run — the +5d absolute bar is miscalibrated for
heterogeneous effects. Layer deleted per kill protocol (the bright-line rule is for
close calls). Proof 12/12 REAL-RED-verified + INFO-SKIP post-kill, sweep with
pre-registration, sense script. Evidence evidence/2026-10-14/sim-recoverylever.md.

### ARM 3 — sim-raiddef: KILLED AT PILOT (commits 6c7d999c + coordinator guard-fix bbe1e756, landed)
Diagnostic PASSED precondition (42.9% non-draw ≥ 30%) and transcript archaeology found
the mechanism: the "other" deaths are FOLLOWERS — mdef.follows monsters trail the
scholar to Haven's treeline, hold at the boundary ("The walls end the argument"), and
the scholar walks out alone ("You're on your own") and dies. Raid-night deaths happen
even with a palisade — raiders are physically on the haven grounds and the scholar
walks into them. The competent policy never builds a party.
Layer (raid watch + dawn clearing, 189 engagements, proof 57/57 GREEN, det-gate 8/8):
worked on raid-night (5→2) but FED SCHOLARS TO UNBEATABLE W5 THREATS — s33's same
editor(w5) killed three successive scholars on d80/d81/d82; s11/s22 similar spirals.
PRIMARY MISSED (2.00 vs ≤1.26 per unlocker; raid-night 5→2 ✓, other 4→12 ✗).
Guardrails: median 101→177d PASS; national 6/8 PASS; table 3/8→6/8; wave-5 5/8→7/8;
no-new-death-mode FAIL at n-floor (lockjaw, starvation — longevity confound).
DESIGN LESSON: AVOID wave-5 threats, don't engage them. The HP gate (w5 ≥50%) is
insufficient — a wave-5 apex still kills a prepared scholar. Notably the layer was GOOD
for survival (median 101→177d, table 3/8→6/8) — a w5-avoidance doctrine with a survival
primary is documented as a future-arm candidate, not built (out of this killed arm's
scope). Blanks: RAID-CHANNEL REMAINDER returned to [open] in sim-findings with the
kill note + design lesson. No feast/tribute/allowance verbs touched. Coordinator
applied the 3184c187-pattern landed-tree INFO-SKIP guards to proof/det-gate/sweep
(same FATAL-MODULE_NOT_FOUND-after-kill failure the warroad arm needed in r34).
Evidence evidence/2026-10-14/sim-raiddef.md.

## Village assessment (plain words)
Three roads, three ways the wall holds. The hybrid villages hunted and bled — not the
measured bleed of the war road, the worse kind: they courted *and* fought, and the
fighting ate the courtship. Where the hunt fired, diplomacy flatlined to zero; where
it didn't, the readiness hold just moved the death from the thicket to the pantry.
The recovery villages grieved properly — two days at home, the watch standing down,
the dead named — and careful-after-loss villages lived 50 days longer on hard seeds.
On easy seeds the lever had nothing to save, and the confirm missed by half a day.
The raid-defense villages answered every alarm — 189 engagements, raid nights cut in
half — and died to the thing that doesn't answer back: wave-5 apexes that linger at
the treeline and kill one scholar per dawn. The missing capability is still not
courage, kills, links, or feasts. It is that **nothing on offer answers a wave-5
apex at Haven except avoidance**, and the gate that unlocks wave 5 keeps arriving
before the doctrine for surviving it.

## Blanks filled / documented
1. HYBRID ROAD FALSIFIED (filled, ARM 1): s66's organic hybrid was survivorship, not a recipe — the deliberate version crowds out diplomacy.
2. RECOVERY THROTTLE = REAL, REGIME-DEPENDENT (filled, ARM 2): +27.5d / +53d / +4.5d across three independent measurements; people-only trigger mandatory.
3. FOLLOWERS ARE THE "OTHER" HAVEN DEATHS (filled, ARM 3): mdef.follows monsters trail the scholar to the treeline; the palisade answers bedrolls, not followers.
4. W5-AVOIDANCE DOCTRINE (documented, ARM 3): engagement is the wrong verb for apexes — a survival-primary avoidance arm is the named next step.
5. STRATIFIED CONFIRM BARS (documented, ARM 2): absolute +5d miscalibrates for heterogeneous effects — proportional/same-regime confirms next run.
6. TOOLING: policy-wrapper setup/upkeep drop bug (fixed pre-spend, ARM 1); 3184c187 guard pattern now on hybridroad + raiddef scripts (coordinator).

## Metric review (§14 — for the NEXT run)
- hybridroad: the dual primary was the right shape (it caught survival-without-arrival);
  the median guardrail bound (−10d) was tighter than the arm's own risk profile warranted
  given the unlock-prong miss already killed it. No change proposed.
- recoverylever: the +5d absolute bar is miscalibrated for regime-heterogeneous effects
  — propose a stratified bar (same-seed confirm regime as pilot) or a proportional
  threshold for the next run. Not re-scored this run (0.5d miss binds).
- raiddef: the primary assumed engagement reduces deaths — for w5 apexes it increases
  them. The right primary for the avoidance follow-up is survival or per-unlocker
  post-unlock Haven deaths WITH an avoidance (not engagement) mechanism.
- no-new-death-mode guardrail: r34's n-floor proposal validated (lockjaw ×3 / starvation
  ×2 at the longevity confound; alien ×2 singletons) — keep the floor.

## Wall numbers (this run's suites)
- hybridroad (competent/propose vs hybrid, 150d, 8 seeds): alive-d+30-post-w4 2/8 vs 3/8 ·
  wave-4 unlocks 3/8 vs 5/8 · national 0/8 both · table 0 · wins 0 · wave-5 0 · median
  130/109d · exiled 0.
- recoverylever (leadcourt+FOURTHLINK, 180d): pilot 8 seeds median 94/147d, national
  5/8→5/8; confirm 12 seeds median 125.5/130d, national 12/12→10/12, w5 3/12→4/12,
  exiled 0/20 both.
- raiddef (leadfeast+FEASTSCALE_R13, 180d, 8 seeds): non-draw Haven deaths/unlocker
  1.80→2.00 · national 5/8→6/8 · table 3/8→6/8 · wins 0 · wave-5 5/8→7/8 · median
  101/177d · exiled 0.
TELEMETRY: two LOUD lines vs scale-wall.json — both EXPLAINED artifacts: (1) national
8→25: the baseline's `national:8` is itself a rows[]-schema-mismatch roll (r9's honest
seed baseline was national 0/8; rows.length was rolled in); the current aggregate pools
three substrates' control sides (36 runs). Substrate-by-substrate, controls sit in the
wall's known regime (hybridroad 3/8, recoverylever 5/8+12/12, raiddef 5/8 — courtship/
plentycost roads reach national; scale-push roads don't). (2) table 0→3: all three
reads are raiddef's leadfeast plentycost control — r34's siegedef3 control was table
3/8 too. NOT a deviation. Baseline NOT rolled (killed-arm run; policy-experiment
convention).
