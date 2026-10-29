# sim-creekpath-armc-b — PREREGISTRATION (committed BEFORE any judged run)

## Question
Arm B (landed 927de35c2, evidence 2026-10-28/sim-creekpath-armb-b.md) cut
pooled stranded evenings 23 → 7, but the residual strands never RUN a
covered trip return, so no return leg — covered or not — can fix them:
- 10752: root day 12 MOVED with 0 detour steps (a return that was not a
  covered trip return, BFS route len 5 around rubble@2,4 exists), then
  continuation days 13–14 no-move, kcal 890 → 137 → 0, scholar dead day 15.
- 10762: root day 13 MOVED with 0 detour steps (BFS route len 2 around
  washed_out@5,4 exists), continuation days 14–16 no-move; then hop-clear
  no-move evenings at grove (4,3) days 18–22, never going home.
- 10772 day 11 (Arm B after leg): a starving villager (106 kcal) at
  hop-CLEAR (4,3) who never moves all day and starves — because no trip
  fired and nothing else says "go home".
The policy has NO standing "go home" rule. Arm C adds one.

## Substrate (identical to Arm B)
- `GRANT_THIEF=1` in scripts/creekpath-trace-b.js: `{ id: 'thief',
  level: 1 }` pushed onto the scholar's abilities before day 1. Plain
  competent ends every evening at home; the grant is the strand substrate.
- Harness gates asserted FATAL: `COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1`, all legs.
- `COMPETENT_ROUTE_AROUND` UNSET in every leg (Arm A tested alone, not
  A+B+C combined).
- `COMPETENT_TRIPHOME_ROUTE_AROUND=1` in BOTH legs (Arm B's gate ON):
  the before leg IS Arm B's after behavior, so the judged comparison is
  Arm C alone. The Arm B published after-leg numbers (pooled 7: pilot 3,
  confirm 4; pooled no-move refused 5) are the cross-check for the before
  leg, not the judged baseline — the judged baseline is this run's own
  before leg on identical seeds.
- The ONLY difference between before and after legs is the new gate below.

## The change (policy-side, scripts/policies/competent.js daily flow ONLY)
- New gate `COMPETENT_STANDING_HOME=1` (default OFF). New exported helper
  `goHomeStanding(Game, ctx)`: at the END of `daily()` (after
  `competentEat`), if and only if the player is still away from haven, it
  calls the existing Arm B `walkHome(Game, hx, hy)` with the detour flag
  on (via the Arm B gate, which is ON in both legs — the standing step
  adds the WHEN, Arm B supplies the HOW), and banks `ctx.standingHomeDays`
  (+1 per fired day) and `ctx.standingHomeDetours` (+ walkHome's returned
  detour-step count).
- Standing-step guards (all must hold for the step to fire):
  - `Game.playerAtHaven()` false (already home → skip; also covers days
    a trip already brought the player home).
  - Not `Game.over`, not `Game.tbfight`.
  - Not inside a tent (`scholar.insideTent` — a pitched camp is a
    deliberate stay, not a strand).
  - The haven tile must be on this board: `Game.tileAt(hx, hy)` has type
    `'haven'`, where (hx, hy) = village px/py (default 4,4), the same
    coordinates the probe uses. If the player has traveled to another
    node, the standing step does not apply and fires nothing.
- Deliberately NOT built (and why — single mechanism, no scope creep):
  - Trip-origin anchoring: unnecessary. A trip that returns to an away
    origin ends the day away, so the standing step walks origin → haven
    the same day. Same outcome, no trip-semantics change.
  - Detour flag on stoneRun's walkTo home walks: unnecessary for the same
    reason — stoneRun returns to its day-start tile, and the standing step
    takes it from there to haven when still away at day's end.
  - The step fires whenever the player ENDS the day away, generalizing the
    brief's "no trip fires that day" to also cover away-origin returns
    and failed trip returns: to the villager the distinction is
    unobservable — they are away at day's end and home is known. The
    movedDuringDay breakout in the analyzer keeps the no-move class
    separately visible, so the generalization cannot hide behind pooled
    counts.
- No sibling files, no src/js. scripts/creekpath-trace-b.js gains two
  non-destructive per-evening fields (delta of the new ctx counters):
  `standingHomeDays`, `standingHomeDetours`. The instrument is identical
  across both legs (before leg runs the new code with the C gate OFF),
  so before/after comparability holds.

## Legs
- BEFORE: modified competent.js with `COMPETENT_TRIPHOME_ROUTE_AROUND=1`,
  `COMPETENT_STANDING_HOME` unset. Banked upfront for BOTH bands before
  any judged after-leg spend.
- AFTER: same code with `COMPETENT_STANDING_HOME=1` added.
- No diagnostic leg: Arm B already split hop-by-hop vs detour attribution;
  Arm C's attribution is the gate itself (before = gate off, after = gate
  on, one variable).

## Primary metric (identical seeds, before/after)
Pooled STRANDED evenings = evenings ending away while the direct hop home
would be refused (probe `refused`, same census definition as Arm B).
- PILOT BAR (10750–10757): after ≤ floor(before/2), AND the no-move bar,
  strand guard, G1, G2 below all hold. All must hold for a pilot GO.
- CONFIRM BAR (10758–10773, only if pilot passes): pooled (pilot +
  confirm) after ≤ floor(pooled before/2), AND the pooled no-move bar,
  strand guard, G1, G2 all hold. All must hold for a GO.
- Expected values if the before leg reproduces Arm B's after leg exactly:
  pilot before 3 → bar ≤ 1; pooled before 7 → bar ≤ 3. If the before leg
  differs, the FORMULA governs, not the expected numbers, and the
  difference is disclosed as trajectory drift.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.

## No-move co-primary breakout (Arm C's target class, judged)
Pooled no-move refused evenings = refused evenings with
`movedDuringDay === false`. Bar: after ≤ floor(before/2), pilot and
pooled, same as the primary. Expected if reproduction holds: pooled
before 5 → bar ≤ 2. This is a co-primary, not a footnote: Arm C exists
to fix exactly the no-move class, so a primary pass driven only by
move-day strands while no-move strands persist is NO-GO.

## Secondary (reported, not judged)
- Hop-clear away evenings (probe `hop-clear`): the 10762 days 18–22
  class — away, unblocked, never going home. The standing step should
  clear these too; reported before/after per seed.
- Out-of-reach away evenings (probe `out-of-reach`): reported; the
  standing step's on-board guard means it cannot fix cross-node cases,
  and any movement there is disclosed.
- Standing-step census (after leg): days fired, detour steps taken,
  evenings moved home by the step (movedDuringDay true with
  standingHomeDays > 0).

## Strand guard (trajectory-divergence guard, part of the verdict)
Per-seed strand-length table (consecutive `refused` evenings, with tile
and block kind) reported beside pooled counts, never averaged away.
Guard: no seed's longest strand may grow vs before UNLESS that seed's
refused-evening count fell. A primary pass with a guard violation is
NO-GO.

## Guards (all must hold)
- G1: no starvation-death increase vs before (deaths matching
  /starv|hunger/, pooled; player starvation deaths broken out).
- G2 (counterfactual counting, per Arm B metric review): a player death
  counts against the arm ONLY if it falls on a day with
  `tripHomeDetours > 0` OR `standingHomeDetours > 0` (a detour/standing
  day) or the following day, AND does NOT also occur in the before leg
  for the same seed on the same day with the same cause (cause || kind).
  A death identical in the before leg cannot be attributed to the arm.
- G3: perception-lawful only — decisions use only the player's own tile,
  home haven (lived in), and engine-offered adjacent steps (the shipped
  `routeAround` precedent: BFS over the engine's own `travelBlockage`
  check, walked one hop at a time). No roster, crew list, or snapshot is
  fed into any decision.

## Horizon + why
30 days, death-aware (runDays stops at death; dead villages contribute
only their lived evenings). Why 30: the strands appear days 12–22; a
30-day horizon covers the full pattern without a 200-day tail the
question does not need. Never a fixed 200d.

## Seeds
- PILOT: 10750–10757 (8 seeds; 10752 is the index case).
- CONFIRM: 10758–10773 (16 seeds, identical seeds before/after).
- No confirm spend on an after leg until the pilot passes its gate.

## Proof test (BEFORE any judged after-run)
scripts/test-creekpath-armc-b.js:
- Placement behavior: fresh game, player placed at an away tile; C-gate
  OFF → `goHomeStanding` moves nothing and banks nothing; C-gate ON →
  reaches haven on a clear hop, reaches haven via detour when the probe's
  BFS route exists, moves nothing when no route exists, and fires
  nothing when already at haven or inside a tent.
- Determinism + gate-off neutrality: a C-gate-off trace of the pilot
  band reproduces the Arm B after-pilot corpus evening probes exactly
  (probe + tile + map coords per evening per seed). This is the before
  leg itself, banked before any after spend.
- The proof must print PROOF-GREEN before any judged after leg runs.

## Sense-test
Read a sample of standing-step evenings (debug run, same substrate,
seeds 10752 and 10762 if they strand in the before leg): the day's last
lines, the standing walk home, and the next morning — judged for
meaning, not just counts. A villager who ends the day away, remembers
home, and walks back — narrated step by step — is a pass; a silent
teleport or a nonsensical path is a finding, even if counts move.

## Panel limitation (same as Arm B)
No scripts/balance-panel.js compare is attached: the panel's contract
metrics do not include stranded evenings. Panel-style guard metrics
(deaths, starvation, wave reach) are reported from the corpora instead.
Wall numbers (national / table / wins) are NOT OBSERVABLE in a 30-day
horizon — reported as such, never as movement.

## Metric review
(Completed in the evidence file at run end. A miss is NO-GO, never
re-scored mid-run; metric doubts go here and revisions apply to the NEXT
run.)

## Perception law (Steve 2026-10-28, binding)
Sense channels used: the player's own tile (stood on), haven (home, lived
in), adjacent engine-offered steps walked one hop at a time. The detour
BFS peeks at blockage state exactly the way competent's landed
`routeAround` already does. NEVER a roster, crew list, or snapshot into a
decision.

## Canon note (no invention)
No canon doc covers travel/pathing/blocked-path crossings. Authority:
the engine (travelBlockage / travelTo / clearBlockage / buildBridge), the
blockage card in app.js (bridge / swim / "Go around"), and
docs/TIME-ECONOMY.md (node travel free). Nothing invented.
