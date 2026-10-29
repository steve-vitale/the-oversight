# sim-detourgeo-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-detourgeo-b, axis
food-economy (evening-detour robustness). Worktree
sim-detourgeo-b. POLICY-SIDE ARM ONLY: zero src/js
changes, zero default flips, no driver adopts the policy
by default. The instrument under test is the default-OFF
evening-detour gate in scripts/policies/nighttravel.js
(COMPETENT_EVENING_DETOUR=1), already landed as an
instrument by sim-eveningdetour-b (pilot 15/15 + confirm
17/17 refused evenings rescued, 0 stopped, 0 no-path,
0 mid-detour combat across 32 detours).

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/MAP.md §6 (the way home): node travel is free;
  a human taps "Go around". No walk-home tax exists.
- Engine authority for the branches: Game.travelTo /
  travelBlockage / travelTargets (src/js/game.js) and
  scripts/policies/nighttravel.js (bfsDetourPath +
  detour loop). No canon doc covers evening-hop
  refusals specifically; nothing new is invented here.
- Repo precedent for scenario geometry: src/js/
  debug-scenarios.js sets tile blockFrom directly
  (line ~551) to stage a blocked path. Tile mutation
  below is scenario construction in that same class,
  NOT a game change: the instrument code under test
  is never edited to produce a branch.

## The gap this run closes

sim-eveningdetour-b proved the rescue path (32/32).
Three designed branches never fired in judged data:

1. detour-nopath — BFS finds no orthogonal
   travelBlockage-clean path home.
2. detour-stopped with stoppedReason 'step-refused' —
   a BFS-clean step refuses in travelTo.
3. detour-stopped with stoppedReason 'combat' —
   combat goes live mid-detour (checked before each
   step and after each step).

A branch counts as PLAYED only when a real evening
step (nighttravel.nightStep, the exact function the
policy's daily invokes as its evening step) produces
it from a real Game state: an honest hop refusal
first, then the instrument's own BFS and loop. Calling
bfsDetourPath directly, or setting pendingEncounter /
inCombat state by hand, is a unit call, NOT a played
branch, and is never reported as one. Forbidden
shortcuts, stated so they stay forbidden: no direct
position writes (player moves only via Game.travelTo),
no hand-set combat state (no pendingEncounter,
tbfight, or scholar.monster injection to fake a
fight), no clock-setting (no dayTicks / dayPart
writes to force a part boundary), no Game.save
stubbing, no src/js edits.

## Constructions (all honest by the rule above)

Setup for every constructed evening (fresh game per
seed via scripts/sim-harness.js loadGame + setupGame,
seeded BEFORE eval per harness rules; say-log
captured as in the eveningdetour trace driver):

- The player starts at the haven node (4,4). Move
  away with honest Game.travelTo steps (d=1,
  engine-offered) only. If the first honest step
  fails on a seed, try the other three adjacent
  directions in order W, N, E, S; if none succeeds,
  the seed is skipped and recorded, never forced.
- Geometry is then staged by tile mutation only
  (blockFrom / creek needsBridge flags on named
  tiles). The evening itself is then played by
  calling nightStep(Game, {}) with the gate ON.
  A gate-OFF control on the identical construction
  must yield 'travel-refused' with no detour
  attempted — proving the branch is instrument
  behavior, not construction artifact.

### Track N — no-path (expected FIRE)

Player on a haven-adjacent tile P (e.g. (3,4) west
of haven). Stage: haven tile (4,4) gets blockFrom
guarding entry from P (bf.dx = -dx of the P->haven
step, type 'rubble'); the OTHER three haven
neighbours become creek tiles with needsBridge=true,
bridged=false (travelBlockage refuses creek entry
from every side). Then: the direct hop is offered
(d=1, travelTargets) and refused (haven's own
blockFrom); BFS cannot step onto any haven
neighbour (three creek-blocked, P-side entry
blocked), so BFS returns null and the instrument
must report outcome 'detour-nopath',
stoppedReason 'no-path', with the player still
standing on P. Pilot: 8 distinct seeds.

### Track C — mid-detour combat (attempted, may not fire)

Detour path of >= 2 steps (direct hop refused by
a blockFrom on haven from the player's side, BFS
path around it, as in the rescued cases). Attempts,
in order, each on fresh games:

- C1: a world monster staged on a detour-path tile
  (spawnWorldMonster, the engine's own spawn
  function) — tests whether stepping onto an
  occupied tile starts combat through travelTo.
- C2: the wanderer staged on a detour-path tile
  (state.wanderer on the path tile, encounterDone
  false) — tests the checkEncounter wanderer-contact
  path during a detour step.
- C3: a busy-world long detour (several world
  monsters + wanderer present, 4–5 step path) —
  tests whether any travelTo side effect
  (worldTick, travelTimeStep world step) starts
  combat mid-detour.
- C4 (natural): the gate-ON sweep below — any
  detour-stopped/combat evening in real sim days.

Mechanism note, stated BEFORE judging so a miss
is informative, not embarrassing: reading travelTo
shows node travel starts no player combat by
itself — checkEncounter's spawn roll and wanderer
contact spawn a world monster but set no
pendingEncounter/tbfight, and travelTimeStep's
world step runs villagerTurn only. The one
theoretical route found in code is a detour step
whose tickAction crosses a day-part boundary, so
advancePart's moveWanderer walks into the player
and triggerEncounter fires — but engineering that
without clock-setting is not available (see
Forbidden shortcuts), so C-track success is NOT
assumed. If no C attempt fires, the verdict for
this branch is DIAG-NO-GO with the gap named
(see Verdicts), not a lowered bar.

### Track S — step-refused (attempted, expected NO FIRE)

Mechanism note, stated BEFORE judging: for a
d=1 detour step, BFS-clean and travelTo-clean are
the same check (travelBlockage from the same
origin, same tile state) — and no runtime system
creates a blockage mid-detour (blockages are set
only at world-gen; clear/bridge only remove them;
checked by grep over blockFrom/needsBridge
writes). So a step-refused firing would require a
mid-detour world mutation that the code does not
offer. Attempts: the C3 busy-world long detours,
plus the natural sweep. If none fires, the verdict
for this branch is DIAG-NO-GO with this proof
sketch, and the branch is documented as defensive
dead code under the current engine — NOT "fixed"
by inventing a mutation, and NOT claimed played.

### Natural sweep (seed-selection route, staged)

- Pilot: gate-OFF scan of fresh seeds (range
  11520+, same driver/substrate as
  sim-eveningdetour-b: COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
  POLICY=nighttravel, 30 loop-days, tap days
  last 5) until 8 refused-prone seeds qualify
  (>= 1 refused evening), then fresh gate-ON legs
  on those 8. Any detour-stopped / detour-nopath
  / combat-step evening in these legs is judged
  data for its branch.
- Confirm (only if pilot's constructed + natural
  legs leave a branch unfired but plausible):
  12–16 further seeds by the same screen, same
  bars. Confirm is NOT spent to re-prove a branch
  already played at pilot, and never to chase a
  branch the pilot mechanism analysis already
  rules out (S-track) — that would be burning
  seeds on a known-negative.

## Primary metric, bars, guards (judge ONLY against these)

Per-branch coverage bar (PLAYED branches only):
each branch fires at least once with honest
handling, where honest handling is checked per
firing by the guards below. Minimum-n per branch:
1 played firing with all guards holding (a branch
is a code path, not a rate — one honest firing
with clean guards proves the handling; a second
firing on a different seed is reported when
available but is not required for the bar).

- GO (whole run) requires: Track N fired played
  (>= 1, guards hold) AND every other branch is
  either played (>= 1, guards hold) OR closed
  DIAG-NO-GO with its construction gap named
  (see Verdicts). A run that plays N but leaves C
  or S merely "unattempted" is INCOMPLETE, not GO.
- Guards (zero-tolerance, per firing):
  - H1 (no teleports): every detour step moves
    exactly one orthogonal tile (Manhattan 1),
    and the player's position changes only via
    travelTo (pre/post snapshots agree with the
    instrument record).
  - H2 (arrival == departure on unrescued legs):
    on detour-nopath and detour-stopped evenings,
    the evening position equals the departure
    position (for stopped: equals the last
    successfully stepped-to tile, and every
    recorded step's from/to chain is contiguous
    from departure).
  - H3 (path lengths recorded): BFS path length
    vs steps walked recorded per firing; a
    rescued evening must walk its full BFS path
    onto haven (prior run's rule, kept).
  - H4 (no deaths by construction): no firing
    may end with Game.over true unless the
    branch itself is detour-died (not a judged
    branch here); kcal before/after the detour
    recorded (node travel is free by engine law;
    any detour-step kcal charge is a violation).
  - H5 (gate control): the identical construction
    with the gate OFF yields 'travel-refused'
    with detourAttempted false.
- Starvation/median guards (natural sweep only,
  same bands as sim-eveningdetour-b): G1 median
  daysAlive after >= before - 2; G2 starvation
  deaths after <= before + 2; G3 honesty as in
  the prior prereg (0 teleport steps, 0
  rescued-off-haven, 0 combat-then-inside,
  0 still-refused-moved). Constructed evenings
  carry no survival statistic and claim none.

## Verdicts

- GO: N played with guards holding, and C and S
  each either played with guards holding or
  closed DIAG-NO-GO (gap named, mechanism cited,
  attempts listed). The evidence file states
  branch by branch which verdict each branch got
  — a whole-run GO never implies an unplayed
  branch was played.
- DIAG-NO-GO (per branch): the branch did not
  fire under any honest construction or in the
  natural sweep, AND the mechanism gap is named
  (for S: BFS-clean == travelTo-clean for d=1
  steps + no runtime blockage creation; for C:
  node travel sets no combat state + the only
  code route needs a part-boundary wanderer
  walk-in that cannot be staged without
  clock-setting). No forcing, no bar-lowering:
  a DIAG-NO-GO branch stays unplayed, and any
  future adoption claim must exclude it.
- NO-GO (lever-level): any played firing violates
  a guard (teleport, moved-while-unrescued,
  death by construction, gate-OFF control
  detouring) — the branch handling is dishonest
  and the instrument needs a policy-side fix
  before any adoption claim. A small policy-side,
  default-OFF fix to a misbehaving branch is in
  scope for this run; a game-code change is NOT
  (document it instead).
- INSUFFICIENT-DATA: fewer than 8 pilot seeds
  yield a stageable N construction (no honest
  adjacent step on enough seeds) — the run
  reports the staging failure, not a verdict.

## Horizon + why (death-aware, never a fixed 200d)

Natural sweep: 30 loop-days, same as the
eveningdetour legs — the refused pattern is
visible inside 30 days and the question is
branch firing, not survival. Dead villages stop
simulating (+10d tail cap). Constructed
evenings: a single played evening each, no
horizon claim.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before judging, for the same
reason as sim-eveningdetour-b: this is a
policy-side instrument measurement with zero
src/js changes, so there is no game-root delta
for a panel to compare. The before/after
instrument is the constructed-evening battery
plus the custom driver on identical seeds, and
the bars above are the judge.

## Landing rule

- GO / DIAG-NO-GO: lands evidence + scripts +
  prereg only (this run builds no new gate and
  flips no default). If a small policy-side
  default-OFF fix to a misbehaving branch proves
  necessary and green, it lands as its own
  commit with proof; otherwise NO nighttravel.js
  change at all.
- This worker does NOT merge to master —
  coordinator merges. Worktree contains only
  committed work at handoff.

## Sense-testing (mandatory, in the evidence file)

Read the say-log tails for at least: one
detour-nopath evening (does stopping where you
stand read honestly — what did the player hear,
is the refusal line the last word?); one
detour-stopped evening if any fires (does the
stop read as a real interruption, not a
vanish?); one rescued detour evening from the
natural sweep if any occurs (continuity with
the prior run). Judge meaning, not counts.

## Village assessment + wall numbers (mandatory)

Plain words: what the constructed evenings and
the sweep villages looked like; which blank was
filled (a played branch) or documented (a
DIAG-NO-GO gap). Wall numbers (national /
table / wins, wave 4–5 reach, median survival)
reported for the natural-sweep corpora where
observable, never claimed as movement.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. If a
metric proves wrong (e.g. the single-firing bar
for a code path, or the BFS-judge statement),
write it under "metric review" and propose the
revision for the NEXT run — never re-score
mid-run.
