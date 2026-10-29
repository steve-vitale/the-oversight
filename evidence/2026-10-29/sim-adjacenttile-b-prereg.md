# sim-adjacenttile-b — PREREGISTRATION (committed BEFORE any judged after-leg)

## Status of the prior run (never re-scored)
`sim-standinghome-retry-b` PASSED under its own prereg (pilot GO, pooled
GO: refused 7→0, no-move 5→0, G1 causal-window 0, G2 0) and that verdict
STANDS. This run does NOT re-score it. It is a NEW run under a NEW
prereg, per docs/MEASUREMENT.md §14, attacking the retry run's
documented blind spot only: on seed 10772 days 10–11 the player stands
at trail_edge (4,3), one hop from haven with a CLEAR hop, and the
standing step never fires because the step's already-home guard uses
`Game.playerAtHaven()`, which counts Manhattan distance ≤ 1 as "at
haven" (src/js/game.js: a narration-presence gate — "drifter presence
gate for home-village narration"), while the player is NOT on the haven
tile. The day-11 player starvation death is byte-identical in both legs
of the retry run.

## Question
Does changing ONLY the standing step's already-home guard to the tile
check alone rescue 10772's adjacent evenings — without causing
starvation deaths attributable to the step, and without any dishonest
step (a step claiming home while ending off-haven, or any teleport)?

## Substrate (identical to the standinghome-retry run)
- `GRANT_THIEF=1` in scripts/creekpath-trace-b.js: `{ id: 'thief',
  level: 1 }` pushed onto the scholar's abilities before day 1.
- Harness gates asserted FATAL: `COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1`, all legs.
- `COMPETENT_ROUTE_AROUND` UNSET in every leg.
- `COMPETENT_TRIPHOME_ROUTE_AROUND=1` in BOTH legs (Arm B's gate ON):
  the before leg IS the retry run's after behavior, so the judged
  comparison is the guard change alone.
- `COMPETENT_STANDING_HOME=1` in the AFTER leg (instrument ON, default
  OFF everywhere else). The instrument stays default OFF; the guard
  change lives inside the gated instrument.

## The change (policy-side ONLY, scripts/policies/competent.js)
In `goHomeStanding` ONLY: DELETE the `Game.playerAtHaven()` already-home
check. The already-home guard becomes the tile check alone
(`Game.map.px === hx && Game.map.py === hy` → skip). Everything else
in the step is UNCHANGED: gate OFF → no-op; game-over / combat → skip;
inside a tent → skip; haven tile not on this board → skip; the walk
itself is still Arm B's `walkHome` (engine `travelTo` steps, one hop at
a time — docs/MAP.md §6: NO TELEPORT, ever).
- Do NOT change `Game.playerAtHaven` itself (src/js, wide blast radius:
  narration-presence gate used by villageLives/ambientSocial and
  others). No src/js touched anywhere. No default flips. No other
  guard or gate touched. Do NOT touch scripts/policies/nighttravel.js
  (a sibling worker owns the evening-detour arm there this run).

## Legs
- BEFORE: REUSED banked corpora from the retry run (see Staging), NOT
  re-run except for a corrupt-file repair (deterministic re-run of only
  that seed, never overwriting a valid file).
- AFTER: fresh legs run by this run with the guard change, every other
  gate identical.
- The ONLY difference between legs is the already-home guard
  (playerAtHaven vs tile check).

## Staging verification (done BEFORE this prereg was committed)
All 24 banked before-leg files
(`evidence/2026-10-29/sim-standinghome-retry-b-corpus-after-pilot`,
`-after-confirm`) parse, are non-zero, and reproduce the retry run's
published after-leg numbers exactly:
- Pilot (10750–10757): refused 0, hop-clear 0, standing fired 10752
  day 12 only, starvation deaths 4 (all villager, days 25–26, outside
  the day-12 step's 12–19 window).
- Confirm (10758–10773): refused 0, hop-clear 2 (10772 only), standing
  fired 10762 day 13 and 10770 day 5, starvation deaths 7 (10760: 4,
  10761: 2, 10772: 1 player day 11).
- Adjacent-away census (evenings ending off-haven at Manhattan distance
  1 from haven, any probe): EXACTLY 2 in all 24 seeds — both 10772,
  loopDays 10 and 11, hop-clear at (4,3) trail_edge, kcal 588 → 106,
  movedDuringDay false both days. No other seed has any adjacent-away
  evening, any blocked-combat evening, or any haven-unknown evening.
- Consequence, stated in advance: the "other seeds that show hop-clear
  away evenings in the before leg" band is EMPTY — 10772 is the only
  hop-clear seed in the corpus. The pilot band below is built from
  that fact, not from cherry-picking after results.

## Primary metric (identical seeds, before/after)
Hop-clear away evenings = evenings ending away while the direct hop
home is clear (probe `hop-clear`, same census definition as the retry
run). The judged question is the adjacent-tile class: evenings ending
off-haven at distance 1 from haven with a clear hop.
- PILOT BAR (4 seeds: 10772 + controls below): 10772 loopDay-10 AND
  loopDay-11 evenings in the after leg BOTH probe `at-home` (2/2),
  AND pooled pilot hop-clear after ≤ floor(pilot before/2) (pilot
  before = 2 → bar ≤ 1), AND all guards below hold. All must hold for
  a pilot GO.
- CONFIRM BAR (13 seeds below, judged POOLED pilot + confirm, 17
  seeds): pooled hop-clear after ≤ floor(pooled before/2) (pooled
  before = 2 → bar ≤ 1), AND the 10772 2/2 conversion still holds,
  AND all guards below hold. All must hold for a GO.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. A pooled win MUST NOT mask a 10772 miss: the 10772 2/2
  requirement is separately necessary at pilot and at pooled.

## Seeds
- PILOT (4 seeds): 10772 (index case — the only hop-clear seed) plus
  the three standing-firing controls 10752, 10762, 10770. The controls
  prove the guard change does not break existing standing behavior:
  their standing steps must still fire on the same gameDays as the
  before leg (12, 13, 5) and their refused count must stay 0. Their
  pre-step trajectories contain no adjacent-away evening, so any
  control divergence is a finding, not trajectory noise.
- CONFIRM (13 seeds, retry confirm band minus pilot seeds):
  10758, 10759, 10760, 10761, 10763, 10764, 10765, 10766, 10767, 10768,
  10769, 10771, 10773. Within the 12–16 band.
- NOT RUN (7 seeds, declared, with reason): 10750, 10751, 10753, 10754,
  10755, 10756, 10757. Before leg shows zero away evenings of every
  kind (refused 0, hop-clear 0, out-of-reach 0, blocked-combat 0) and
  zero standing fires on these seeds, so no step-fire-eligible evening
  exists for the guard change to alter; their trajectories are
  deterministic given identical code paths up to the first
  guard-difference evening, and there is none. They are provably
  no-op under this change, not skipped for convenience.

## Guards (all must hold)
- G1 (causal-window starvation deaths, per the retry prereg): for a
  seed, let S be the set of gameDays on which a standing step fired in
  the AFTER leg (evenings with `standingHomeDays > 0`, by `gameDay`).
  A starvation death (death matching /starv|hunger/) on day d counts
  iff there exists D in S with D ≤ d ≤ D+7. G1 HOLDS iff the after-leg
  count of such causal-window starvation deaths is 0, pilot and pooled.
  Player starvation deaths are broken out separately. A causal-window
  starvation death in the after leg is a KILL, even if the primary
  passes. Pooled TOTAL starvation deaths (all windows, before vs
  after) MUST STILL BE REPORTED IN FULL but are NOT JUDGED under this
  prereg.
- G2 (honesty, zero-tolerance): (a) 0 evenings in the after leg with
  `standingHomeDays > 0` whose evening row does NOT end on the haven
  tile (probe `at-home` AND map px/py == haven px/py); (b) 0 teleports:
  the step moves only via `walkHome` engine `travelTo` steps (proved
  by the placement test — the step never sets position directly).
  ANY G2 violation KILLS at pilot — no confirm, no re-score.
- G3 (perception-lawful only): decisions use only the player's own
  tile, home haven (lived in), and engine-offered adjacent steps
  (the shipped `routeAround` precedent). No roster, crew list, or
  snapshot is fed into any decision. The guard change itself removes
  a presence-gate from a decision; it adds no new information source.

## Kill rule (pilot)
10772 evenings not rescued (not 2/2), OR any G1 violation, OR any G2
violation → KILLED at pilot: no confirm, no re-score, guard change
reverted (leave no trace beyond evidence/scripts/prereg), kill
reported with its numbers.

## Secondary (reported, NOT judged)
- Pooled stranded (refused) evenings and no-move refused evenings,
  before/after — reported in full. Deliberately NOT judged: the
  primary is the adjacent-tile class, and a refused regression via
  trajectory divergence is a finding for metric review, not a silent
  re-score of the primary. (Before leg: refused 0 on all 17 judged
  seeds, so any refused evening in the after leg is visible at once.)
- Standing-step census (after leg): days fired, detour steps, evenings
  moved home by the step.
- Deaths by cause, median survival, wave reach (max wave unlocked).
- Wall numbers (national / table / wins): NOT OBSERVABLE in a 30-day
  horizon — reported as such, never as movement.

## Horizon + why
30 days, death-aware (runDays stops at death; dead villages contribute
only their lived evenings; +10d tail max). Why 30: the index evenings
are days 10–11; a 30-day horizon covers the rescue and its 7-day causal
window twice over without a 200-day tail the question does not need.
Never a fixed 200d.

## Proof test (BEFORE any judged after-run)
scripts/test-adjacenttile-b.js:
- Placement behavior: fresh game, player placed at an away tile;
  C-gate OFF → `goHomeStanding` moves nothing and banks nothing;
  C-gate ON → reaches haven on a clear hop, reaches haven via detour
  when the probe's BFS route exists, moves nothing when no route
  exists, and fires nothing when already on the haven tile or inside
  a tent.
- THE FIX CASE: fresh game, player placed on a tile adjacent to haven
  (distance 1, NOT the haven tile) where `playerAtHaven()` returns true
  (the blind-spot condition, asserted) and the hop is clear or a BFS
  route exists (branched on the probe, same pattern as the retry
  proof): C-gate ON → reaches the haven tile and banks a fired day.
  If no fresh-map adjacent case with a clear hop or route exists
  across the corpus seeds, the proof FAILS LOUDLY instead of passing
  vacuously — the 10772 after leg itself is then the fix evidence,
  and the proof says so.
- Staging check: the banked before corpora reproduce the published
  numbers above (refused, hop-clear, standing census, adjacent-away
  census = 2, both 10772).
- Verdict computation under THIS prereg from corpus directories
  (primary 10772 2/2 + pooled halving bar, control census, G1 causal
  window, pooled total reported-not-judged, G2 honesty), so pilot /
  confirm / pooled verdicts are computed, not hand-counted.
- The proof must print PROOF-GREEN before any judged after leg runs.

## Sense-test
Read the 10772 after-leg evenings (and, if the harness exposes day
narration, the days 10–11 narration): judge whether the rescued
evenings read as a real return home — a villager walking one tile into
Haven — not a teleport and not a ledger artifact. Document what the
record actually says. Do NOT build src/js narration in this arm —
this arm is policy-side only.

## Panel limitation (same as the retry run)
No scripts/balance-panel.js compare is attached: the panel's contract
metrics do not include hop-clear / stranded evenings. Panel-style
guard metrics (deaths, starvation, wave reach) are reported from the
corpora instead. This is the prereg's stated limitation, not a skipped
step.

## Metric review
(Completed in the evidence file at run end. A miss is NO-GO, never
re-scored mid-run; metric doubts go here and revisions apply to the
NEXT run.)

## Perception law (Steve 2026-10-28, binding)
Sense channels used: the player's own tile (stood on), haven (home,
lived in), adjacent engine-offered steps walked one hop at a time.
The detour BFS peeks at blockage state exactly the way competent's
landed `routeAround` already does. NEVER a roster, crew list, or
snapshot into a decision.

## Canon note (no invention)
No canon doc covers travel/pathing/blocked-path crossings in full.
Authority: docs/MAP.md §6 (walkHome walks tile by tile through
`travelTo`; NO TELEPORT, ever), docs/TIME-ECONOMY.md (node travel
free), and the engine (`travelBlockage` / `travelTo` /
`playerAtHaven` as a narration-presence gate, src/js/game.js header
comment). Nothing invented.
