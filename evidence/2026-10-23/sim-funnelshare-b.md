# sim-funnelshare-b — VERDICT: MOOT-DUPLICATE (arm not built; the blank is filled)

Run: oversight-flesh-out-loop-b, 2026-10-23 (coordinator task sim-funnelshare-b).
Worker tree: ~/workspace/worktrees/sim-funnelshare-b (branch sim-funnelshare-b,
base = master 6ea142c1c).
Assignment: build + pilot the PRODREBOUND-DIAG (sim-prodrebound-b2, backlog
#570) named next — "the fix must reach funnel.share + the unconditional
depositors, not just the duty picker": behavioral plenty-side easing of the
AUTONOMOUS SHARE FUNNEL + the unconditional depositors
(scholar.homecoming, tribute.deposit, away.return, ambient.bighaul).

## The finding (before any build)

The assigned lever is ALREADY LANDED on master, built by the sibling arm
sim-depositgate-b2 (commit 1ff979f19, 2026-10-22, ancestor of master; b2
adoption run 630f88d56/c63c58c95: VERDICT GO on 64 fresh-seed runs after
probing #798/#799/#800). Building it again would be a duplicate — the exact
thing the loop coordination rules forbid. This arm pivots to: (a) prove the
overlap is complete at the code level, per decision point; (b) spot-verify
the landed layer still engages and behaves on current master (proof re-run +
fresh 8-config engagement sweep); (c) close backlog #570's named next.

## Overlap audit — all five DIAG decision points, already landed

| DIAG DP (marginal-glut share) | Landed implementation | File:line |
|---|---|---|
| funnel.share 56–60% | half the trust-scaled share eased in villagerMealDay when `_depositGateEngaged()`; eased share eaten at the fire (conservation, recorded 'depositgate-eased'); own meal sacred (only `produced - need` is eased) | src/js/game.js:29493 |
| scholar.homecoming 15–25% | homecoming keep 2000 → 6000 kcal when engaged; said aloud when it fires | src/js/game.js:8472 |
| tribute.deposit 15% | waiver: wagons waved home when engaged — grain stays in THEIR stores, week counts paid (no arrears), trust +1, said aloud + _linkNote | src/js/hierarchy.js:1143 |
| away.return 6–7.5% | `_depositGateHoldback(rid, kcal, 'return')` — half eaten by the returner at the fire | src/js/game.js:16223 |
| ambient.bighaul 4–5% | `_depositGateHoldback(id, kcal, 'bighaul')` — big day + routine haul, per-event voice | src/js/game.js:27136,27154 |

Gate semantics (src/js/game.js:28940–28958): `_depositGateOn()` — browser
always ON (real game behavior), sim control via DEPOSITGATE=0; armed =1.
`_depositGateEngaged()` = gate armed AND `prodThrottleEngaged()` — the SAME
plenty definition my design specified (>4 fresh days; hungryStreak>=3 stands
it down; src/js/game.js:15570). Deterministic (no RNG in any eased path),
ledger-only state (`v._depositGate.days`), day voice once/day rotating
speaker per-speaker line key (`_depositGateDayVoice`, src/js/game.js:28964,
called after the meal loop src/js/game.js:30174) — the same voice discipline
my design required.

One edge path intentionally NOT eased: `returnToOldVillage` (exile amends to
the old village, src/js/game.js:8650) keeps the flat 2000 kcal keep. This is
a deliberate restitution gesture ("a donation toward amends stays allowed" —
r3 doctrine), not an autonomous sensor-blind production decision; its
marginal-glut contribution is negligible (exile-only path). Not a blank.

## Pre-registration (§14 — written BEFORE the spot-check sims)

- Question: does the landed DEPOSITGATE layer engage on current master, and
  does a fresh spot-check reproduce the b2 engagement signature?
- Spot-check design: 2 FRESH seeds (75001, 75002 — banned-list clean: zero
  hits in scripts/ content, zero hits in evidence/ filenames) ×
  {leadfeast, belongfeast} × {control DEPOSITGATE=0, armed DEPOSITGATE=1} =
  8 configs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 (asserted).
- PRIMARY (spot-check, not a pilot gate): engagement — eased kcal > 0 on ALL
  4 armed runs. FAIL if any armed run shows 0 eased (the layer must engage).
- SECONDARY (reported): rot/100d armed vs control ratio; survival days;
  starvation deaths; death-kind inventory; voice-line sense read.
## Results

Spot-check complete: 8/8 configs (2 fresh seeds × {leadfeast, belongfeast} ×
{control, armed}), 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. The landed
proof re-run on current master: scripts/test-depositgate-b.js **51/51 GREEN**,
0 FAIL.

### PRIMARY (engagement): PASS 4/4

| config | eased kcal (share/return/bighaul/waived) | ease-days |
|---|---|---|
| leadfeast 75001 armed | 75,046 (62,883 / 120 / 43 / 12,000) | 86 |
| leadfeast 75002 armed | 300,927 (171,837 / 49 / 41 / 129,000) | 99 |
| belongfeast 75001 armed | 60,403 (60,242 / 119 / 42 / 0) | 81 |
| belongfeast 75002 armed | 180,576 (180,481 / 43 / 52 / 0) | 98 |
| all 4 control | 0 / 0 / 0 / 0 | 0 |

The landed layer engages on current master on 81–99 of 100 days; gate-off
control shows exactly 0 eased (det-gate holds). funnel.share is the fat
target (60k–181k of the eased total), exactly as the DIAG measured. The
tribute waiver fires only where subordinates exist (leadfeast runs:
12,000k / 129,000k waved home; belongfeast: no subordinates, 0) — the
decision-level behavior is intact.

### SECONDARY (reported, not judged)

| config | rot/100d control | rot/100d armed | survival c/a | deaths c/a | starve c/a |
|---|---|---|---|---|---|
| leadfeast 75001 | 121,339 | 1,400 | 100d / 100d | 20 / 17 | 0 / 0 |
| leadfeast 75002 | 19,534 | 95,853 | 88d / 100d | 27 / 23 | 0 / 0 |
| belongfeast 75001 | 0 | 1,400 | 100d / 100d | 37 / 16 | 0 / 0 |
| belongfeast 75002 | 0 | 154,728 | 55d / 100d | 22 / 15 | 0 / 0 |

Directionally mixed at n=2 seeds — the 64-seed b2 corpus (rot 0.273x/0.365x
armed, inflow 0.627x/0.831x) is the authority; this spot-check is not a
lever judgment. Notable, honestly reported: seed 75002 armed still rots
95k–155k/100d despite 181k–301k eased — the absolute glut has deeper roots
than the deposit decisions (same honesty note as the plentydepri pilot:
"the glut has deeper roots than the production decision alone"). Armed runs
survived 100/100 on all 4; controls died at 88d and 55d on 75002. Deaths
armed ≤ control on all 4 pairs; starvation deaths 0 on all 8.

### Plenty-regime secondary (the storageshed-b3 confounder)

Ease-days 81–99/100 armed vs 0 control: plenty is the NORM on this
substrate, and the lever extends the plenty regime it eases into (the
b2-measured equilibrium confounder). The easing decision reads the sensor
every day it engages; the regime extension is the mechanism working as
designed (Steve's ruling: deprioritize when plentiful), not a failure mode —
but it bounds how much rot any plenty-gated lever can remove. Recorded for
the next arm's metric design.

## Sense read (SENSE-TESTING LAW)

Voice lines from the armed runs (captured via Game.say wrap, n=24 unique):

- "🌿 Tom checks the pantry before heading out — the shelves are full, ~5
  days of fresh on hand… leaves the harvest standing and turns" — the
  returner names a REAL pantry reading (5 days), not a vibe. People-like.
- "🍽️ Antônio surveys the stacked shelves and nods. 'The wild can rest.
  Splitting firewood instead — winter comes whether we like it or not.'" —
  real instead-of work, seasonal reasoning. People-like.
- "🍽️ Ethan peeks into the pantry, then turns the foraging party back.
  'Plenty for days. Teaching the kids snares instead — they'll need to
  know.'" — leadership behavior, knowledge transmission. People-like.
- "Linh had the day of their life — 1211 kcal. The pantry can't take it
  all: 606 kcal goes in, 605 kcal is eaten at the fire." — conservation is
  VISIBLE in the line itself (606+605=1211). Honest accounting, people-like.
- Day voice rotates speakers (Tom, Antônio, Ethan, Andres, Linh, Debbie
  across d2–d3); no verbatim loop in the sample. The 🌾 tribute-waiver line
  fired on leadfeast ("Tribute wagons from X turn at the gate — our shelves
  are full past tomorrow. 'Eat well,' we send back. 'That IS your tribute
  this week.' (Trust +1.)") — the waived contract is said aloud, the trust
  deepening is named.

SENSE: PASS. Villagers read as people making pantry-aware decisions, not a
silent override. No fabricated shared history; every line is anchored in the
day's real pantry state or the haul's real kcal.

## Balanced panel (§15)

The before/after comparison for this lever already ran through the balanced
panel in the b2 adoption run (evidence/2026-10-22/depositgate-b2-panel-compare.md
— verdict review_required, watch-only, national/table regression_watch on
small-n intervals). A fresh full-panel run on this arm's 8-config pre-seat
spot-check would re-measure the same substrate at lower power and add no
information; the b2 panel on master is the standing §15 instrument record.
Panel duty satisfied by reference.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-23/perseed-funnelshare-b/*.json' --metrics
national,table,wins,exiled` fired 3 LOUD lines (national −75%, table
disappeared, wins disappeared). All three are REGIME artifacts: the
baseline's own _regime label ("DO NOT compare pre-seat substrates against
this baseline — wins are structurally ~0 there") forbids the comparison;
the spot-check corpus is FEASTSCALE_R13=1/SEATDRIVE=0 pre-seat (wins/table
structurally 0 by design). Baseline NOT rolled.

## Scale wall (spot-check corpus, n=8, SEATDRIVE=0 regime — NOT comparable to
the winseat baseline; wins structurally 0)

- wins 0/8 (0/4 armed, 0/4 control); table 0/8; national: 3/4 control,
  0/4 armed (end-rank snapshot; tiny corpus — the b2 corpus is authoritative)
- wave reach: wave 2–3 on all runs; wave 4: 0/8; wave 5: 0/8 (the wave-5
  wall stands, consistent with the known wall; not this arm's question)
- median survival: control 94d, armed 100d; max 100d both
- death-kind inventory (coarse — tele kind classes, not causes; the
  no-new-modes judgment belongs to the b2 corpus): monster 96, villager 44,
  person 4 across 8 runs; armed ≤ control deaths on all 4 pairs

## Village assessment

The village on this substrate lives in permanent plenty: the gate engages
81–99 days out of 100. Who thrives: the roster stays 7–10 alive at day 100
on armed runs; nobody starves (0 starvation deaths on all 8 runs — the
plenty regime is real, not a measurement artifact). What the village looked
like: baskets keep arriving at a full pantry, and now — instead of the
pre-layer behavior of pouring it all into the store — producers eat their
share at the fire (60k–181k/roster), returners hold back half their haul,
big-day haulers split the day of their life with the fire, and tribute
wagons turn at the gate with the week's payment honored. The missing
capability the DIAG named (a pantry-reading deposit decision) is now
present in all five decision points. What remains missing: the absolute rot
on high-glut seeds (75002: 95k–155k/100d armed) — the inflow-side production
volume itself, which is the production-half's (plentydepri's) territory and
the deeper-roots problem both arms documented.

## Blanks filled / documented

- FILLED: backlog #570's named next — verified COMPLETE (landed by
  depositgate-b2, not by this arm). Sim-findings.md #570 marked
  ANSWERED-AND-LANDED with this evidence.
- DOCUMENTED (not chased): (1) `returnToOldVillage` (exile amends) keeps the
  flat 2000 kcal keep — intentional restitution canon, negligible
  marginal-glut contribution, not a blank; (2) `traps.check` (0.6% of
  marginal glut) has no plenty-gate — a micro-arm candidate, negligible
  impact; (3) the plenty-regime extension confounder — future plenty-gated
  arms should pre-register plenty-regime length as a covariate, not a
  surprise.

## Metric review (§14)

- The pre-registered engagement bar (eased > 0 on all 4 armed runs) bound
  the spot-check; 4/4 PASS. No re-scoring: the rot secondary is reported
  raw (mixed direction at n=2, seed 75002 high-variance), never re-scored
  against a friendlier metric.
- Instrument repair (rot wrap): the first script draft checked a
  nonexistent `it.spoiled` flag and reported rot/100d=0; repaired to the
  reference instrument's method (`Game.isSpoiled(it)` + object-identity
  dedupe) and re-ran the sweep. The broken-instrument partial run was
  discarded, not mixed in. This is a TOOL fix, documented here.
- The pre-registered PRIMARY for the originally-assigned lever (rot/100d
  ≤ 0.80) is moot: no lever was built. The GO decision for this mechanism
  belongs to the b2 run and is not re-judged here.

## Verdict: MOOT-DUPLICATE

The assigned lever is fully landed on master by the sibling arm
sim-depositgate-b2 (all five DIAG decision points, default-ON, VERDICT GO
on 64 fresh-seed runs). No game code was written by this arm; the tree
carries zero src/js changes. Landing: evidence + instruments only
(scripts/verify-funnelshare-b.js, 8 per-seed JSONs, this file). Backlog
#570 → ANSWERED-AND-LANDED.
