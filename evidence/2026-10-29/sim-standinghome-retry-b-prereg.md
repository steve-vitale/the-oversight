# sim-standinghome-retry-b — PREREGISTRATION (committed BEFORE any judged after-run)

## Status of the killed run (never re-scored)
Creekpath Arm C (`evidence/2026-10-29/sim-creekpath-armc-b-prereg.md`,
adoption evidence `evidence/2026-10-29/sim-creekpath-armc-adopt-b.md`) was
KILLED at pilot under its own prereg, and that verdict STANDS. Under the
old prereg, mechanism worked (stranded 3→0, no-move 2→0, strand guard
PASS, G2 HOLD) but G1 failed (pooled starvation deaths 0→4, all on seed
10752 days 25–26, 13–14 days after the single day-12 standing step,
player starvation 0). This run does NOT re-score that verdict. It is a
NEW run under a NEW prereg, per docs/MEASUREMENT.md §14. The only guard
change vs the old prereg is G1 below; everything else is unchanged.

## Question
Same question as Arm C: the policy has NO standing "go home" rule, so a
villager who ends the day away (no trip fired, trip returned to an away
origin, trip return failed) simply stays away, even starving with a clear
hop home. Does the standing go-home rule fix the strand without causing
starvation deaths that can plausibly be attributed to it?

## Substrate (identical to Arm C)
- `GRANT_THIEF=1` in scripts/creekpath-trace-b.js: `{ id: 'thief',
  level: 1 }` pushed onto the scholar's abilities before day 1.
- Harness gates asserted FATAL: `COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1`, all legs.
- `COMPETENT_ROUTE_AROUND` UNSET in every leg.
- `COMPETENT_TRIPHOME_ROUTE_AROUND=1` in BOTH legs (Arm B's gate ON):
  the before leg IS Arm B's after behavior, so the judged comparison is
  the standing rule alone.
- The ONLY difference between before and after legs is the new gate below.

## The change (policy-side, scripts/policies/competent.js daily flow ONLY)
Rebuilt exactly as specified in sim-creekpath-armc-b-prereg.md, from the
stranded tree's delta (read-only reference
`~/workspace/worktrees/sim-creekpath-armc-b`, never modified):
- New gate `COMPETENT_STANDING_HOME` (default OFF). New exported helper
  `goHomeStanding(Game, ctx)`: at the END of `daily()` (after
  `competentEat`), if and only if the player is still away from haven, it
  calls Arm B's `walkHome(Game, hx, hy)` with the detour flag on (via the
  Arm B gate, which is ON in both legs — the standing step adds the WHEN,
  Arm B supplies the HOW), and banks `ctx.standingHomeDays` (+1 per fired
  day) and `ctx.standingHomeDetours` (+ walkHome's returned detour-step
  count).
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
- Deliberately NOT built: trip-origin anchoring, detour flag on stoneRun
  walks, any src/js narration change. No sibling files, no src/js.
- scripts/creekpath-trace-b.js gains two non-destructive per-evening
  fields (delta of the new ctx counters): `standingHomeDays`,
  `standingHomeDetours`. The instrument is identical across both legs
  (before leg runs the new code with the C gate OFF), so before/after
  comparability holds.
- If the rebuilt gate's behavior differs from this spec in any way, the
  run stops and reports it — it does not proceed to a judged leg.

## Legs
- BEFORE: REUSED banked corpora from Arm C (see Staging), NOT re-run
  except for a corrupt-file repair (deterministic re-run of only that
  seed, never overwriting a valid file).
- AFTER: fresh legs run by this run with `COMPETENT_STANDING_HOME=1`
  added, every other gate identical.
- No diagnostic leg: attribution is the gate itself (before = gate off,
  after = gate on, one variable).

## Primary metric (identical seeds, before/after)
Pooled STRANDED evenings = evenings ending away while the direct hop home
would be refused (probe `refused`, same census definition as Arm B).
- PILOT BAR (10750–10757): after ≤ floor(before/2), AND the no-move bar,
  strand guard, G1-REVISED, G2 below all hold. All must hold for a pilot
  GO.
- CONFIRM BAR (10758–10773, only if pilot passes): pooled (pilot +
  confirm) after ≤ floor(pooled before/2), AND the pooled no-move bar,
  strand guard, G1-REVISED, G2 all hold. All must hold for a GO.
- Expected values if the before leg reproduces Arm B's after leg exactly:
  pilot before 3 → bar ≤ 1; pooled before 7 → bar ≤ 3. If the before leg
  differs, the FORMULA governs, not the expected numbers, and the
  difference is disclosed as trajectory drift.
- A miss is NO-GO, never re-scored against a friendlier metric mid-run.

## No-move co-primary breakout (judged)
Pooled no-move refused evenings = refused evenings with
`movedDuringDay === false`. Bar: after ≤ floor(before/2), pilot and
pooled, same as the primary. Expected if reproduction holds: pilot
before 2 → bar ≤ 1; pooled before 5 → bar ≤ 2. A primary pass driven
only by move-day strands while no-move strands persist is NO-GO.

## Secondary (reported, not judged)
- Hop-clear away evenings (probe `hop-clear`): reported before/after
  per seed.
- Out-of-reach away evenings (probe `out-of-reach`): reported; the
  standing step's on-board guard means it cannot fix cross-node cases.
- Standing-step census (after leg): days fired, detour steps taken,
  evenings moved home by the step.

## Strand guard (trajectory-divergence guard, part of the verdict)
Per-seed strand-length table (consecutive `refused` evenings, with tile
and block kind) reported beside pooled counts, never averaged away.
Guard: no seed's longest strand may grow vs before UNLESS that seed's
refused-evening count fell. A primary pass with a guard violation is
NO-GO.

## Guards (all must hold)
- G1-REVISED (THE ONLY GUARD CHANGE — the core change of this prereg):
  a starvation death counts against the arm ONLY if it falls within 7
  days after a standing-home step fired for that seed. Precisely: for a
  seed, let S be the set of gameDays on which a standing step fired in
  the AFTER leg (evenings with `standingHomeDays > 0`, by `gameDay`). A
  starvation death (death matching /starv|hunger/) on day d counts iff
  there exists D in S with D ≤ d ≤ D+7. G1-REVISED HOLDS iff the
  after-leg count of such causal-window starvation deaths is 0. (The
  before leg has the gate OFF, so its causal-window count is 0 by
  definition; the bar is therefore "no starvation death within a week of
  a standing step".)
  - Rationale: the killed run's cluster fell 13–14 days after the step,
    outside any plausible causal window for a walk home that fed the
    player (after-leg day 13 kcal 2390 vs before-leg strand kcal
    890 → 137 → 0). Counting deaths two weeks later as the cost of a
    rescue conflates trajectory divergence with mechanism cost.
  - Player starvation deaths are broken out separately within the
    causal-window count and within the pooled total.
  - POOLED TOTAL starvation deaths (all windows, before vs after) MUST
    STILL BE REPORTED IN FULL in the evidence file, but are NOT JUDGED
    under this prereg. Saying so explicitly here is the point: the
    pooled number is visible, it simply does not decide this verdict.
  - A causal-window starvation death in the after leg is a KILL, even
    if the primary passes. No re-scoring.
- G2 (counterfactual counting, UNCHANGED from Arm C): a player death
  counts against the arm ONLY if it falls on a day with
  `tripHomeDetours > 0` OR `standingHomeDetours > 0` (a detour/standing
  day) or the following day, AND does NOT also occur in the before leg
  for the same seed on the same day with the same cause (cause || kind).
  A death identical in the before leg cannot be attributed to the arm.
  G2 HOLDS iff that count is 0.
- G3 (UNCHANGED): perception-lawful only — decisions use only the
  player's own tile, home haven (lived in), and engine-offered adjacent
  steps (the shipped `routeAround` precedent: BFS over the engine's own
  `travelBlockage` check, walked one hop at a time). No roster, crew
  list, or snapshot is fed into any decision.

## Horizon + why
30 days, death-aware (runDays stops at death; dead villages contribute
only their lived evenings). Why 30: the strands appear days 12–22; a
30-day horizon covers the full pattern without a 200-day tail the
question does not need. Never a fixed 200d.

## Seeds
- PILOT: 10750–10757 (8 seeds; 10752 is the index case).
- CONFIRM: 10758–10773 (16 seeds, identical seeds before/after).
- No confirm spend on an after leg until the pilot passes its gate.

## Staging (mandatory)
- PILOT FIRST (8 seeds). Before-leg: REUSE the banked before-pilot corpus
  `evidence/2026-10-29/sim-creekpath-armc-b-corpus-before-pilot`
  (verify all 8 files parse, are non-zero, and reproduce Arm B's
  published after-pilot numbers: refused 3, no-move 2 — if any file is
  corrupt, deterministic re-run ONLY that seed, never overwrite a valid
  file).
- Run a FRESH after-pilot leg (deterministic re-run is expected to
  reproduce the killed run's after numbers: refused 0, no-move 0,
  standing 1 day / 2 detours on 10752, pooled starvation 4; ANY divergence
  is a finding, reported, not hidden). Judge pilot under THIS prereg.
- ONLY if pilot passes ALL bars, run confirm: reuse banked
  before-confirm corpus
  `evidence/2026-10-29/sim-creekpath-armc-b-corpus-before-confirm`
  (16 seeds, verified the same way) + fresh after-confirm leg, judged
  POOLED (pilot + confirm) under this prereg.
- If pilot fails ANY bar → KILLED, no confirm spend, policy reverted,
  evidence-only commit. If confirm fails any pooled bar → NO-GO,
  policy reverted, evidence-only commit.

## Proof test (BEFORE any judged after-run)
scripts/test-standinghome-retry-b.js:
- Placement behavior: fresh game, player placed at an away tile; C-gate
  OFF → `goHomeStanding` moves nothing and banks nothing (with the Arm B
  gate ON, the before-leg config); C-gate ON → reaches haven on a clear
  hop, reaches haven via detour when the probe's BFS route exists, moves
  nothing when no route exists, and fires nothing when already at haven
  or inside a tent.
- Determinism + gate-off neutrality: the banked before-pilot corpus
  reproduces the Arm B after-pilot corpus evening probes exactly
  (probe + tile + map coords per evening per seed).
- Verdict computation under THIS prereg from corpus directories
  (primary, no-move, strand guard, G1 causal-window count, pooled total
  reported-not-judged, G2), so the pilot/confirm verdicts are computed,
  not hand-counted.
- The proof must print PROOF-GREEN before any judged after leg runs.
  (Placement + neutrality sections; verdict computation is exercised on
  the pilot corpora once the after-pilot leg exists.)

## Sense-test
Read the 10752 after-leg transcript; judge whether the routed return
reads as a detour. KNOWN blank (from sim-findings.md, documented in the
Arm C adoption evidence): "Travel N tiles to Haven" with no "going
around" line. Document what the transcript actually says. Do NOT build
src/js narration in this arm — this arm is policy-side only.

## Panel limitation (same as Arm C)
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
