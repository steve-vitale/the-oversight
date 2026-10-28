# sim-thiefhall-b — PREREGISTRATION (committed BEFORE any judged trace run)

Run: oversight-flesh-out-loop-b, arm sim-thiefhall-b.
DIAGNOSIS ONLY: zero src/js changes, zero default flips, zero
game-code changes of any kind. NEW scripts only (a copy of the
playpath instrument, extended with an access-state trace), plus
a new analyzer, a new proof, corpus files, and this evidence
file. This arm does NOT re-judge the playpath census and does
NOT re-score any span key.

## Gap (backlog, claimed this run)

sim-spandraw-playpath-b follow-up: thief.steal_pantry was
attempted 37/37 through genuine played taps but hall-refused
every time ("The pantry is in the hall. Your hands are not.",
src/js/abilityActions.js:1799-1801) while havenStoresAccess()
was 'none', even at the haven. The playpath follow-up asks:
whether a competent played position ever opens hall stores in
the first week is a separate reachability question. This arm
answers exactly that question, for the thief tap, on the
playpath substrate — nothing else.

## The gate, as read from code BEFORE any judged trace

Read before writing this prereg (no trace run has been made):

- `havenStoresAccess()` — src/js/game.js:11542-11562. Returns,
  in order: 'none' if `scholar.exiled`; 'inside' if
  `scholar.insideHaven` AND `playerTile().type === 'haven'`;
  'remote' if `integrationStage() >= 3`; otherwise 'none'.
  So the gate is a CONJUNCTIVE POSITION gate (flag AND tile),
  with an exile hard-override to 'none' and a late-game
  remote fallback — not a day gate, not a pantry-state gate,
  not a single flag alone.
- `thief.steal_pantry` impl — src/js/abilityActions.js:1797:
  the FIRST check is `havenStoresAccess() === 'none'` ->
  say "The pantry is in the hall. Your hands are not." and
  return false. No pantry-state check precedes it; the
  pantry scan, weight check, and caught/clean roll all sit
  behind the gate. A 'none' tap therefore never reaches
  pantry content, weight, or the 50% caught roll.
- Position transitions that move the gate (code-read only,
  to be confirmed against the trace, never steered):
  spawn sets `insideHaven = true` at mx=4,my=4 (game.js:2730);
  `exitBuilding()` sets it false and lands the player on
  the haven grounds; `enterBuilding()` sets it true ONLY
  from the haven node (`playerTile().type === 'haven'`,
  otherwise refuses); `travelTo()` arriving anywhere sets
  it false ("Arriving at Haven puts you on the grounds —
  tap the lodge to go back inside", game.js:12351).
  Competent policy itself enters and exits in one move
  for promise draws (policies/competent.js ~838-863) and
  its trips end with travelTo home — so a competent
  evening plausibly ends ON the haven node but OUTSIDE
  the hall (grounds), which is 'none' even though
  `playerAtHaven()` (map within 1 of the village node)
  reads true. That distinction — at-haven vs inside-hall —
  is the hypothesis the trace tests; it is NOT assumed
  in the verdict.
- `integrationStage()` — src/js/progression.js:132-138:
  0 while `!state.systemArrived` (pre-Day 7 the System
  does not exist yet), 1/2/3 at integration 5/40/80 after
  arrival. In a first-week band the 'remote' branch is
  unreachable by construction (stage 0), so the only
  opening in-band is 'inside'. Exile is recorded per tap
  day so an exile 'none' is never confused with a
  position 'none'.

## Instrument (copy, never modify in place)

`scripts/playpath-spandraw-b.js` is COPIED to
`scripts/thiefhall-trace-b.js` and extended ONLY to record,
per played tap day, in addition to the playpath tap record:

- `havenStoresAccess()` value BEFORE the tap (and after,
  for completeness), read live from the game object.
- Player position: `map.px,map.py`, village node
  `village.px,village.py`, `scholar.mx,scholar.my`,
  `playerTile().type`, `scholar.insideHaven` (raw flag),
  `scholar.insideTent`, `playerAtHaven()` boolean.
- Gate components separately: `exiled` flag,
  `integrationStage()` value, `systemArrived` boolean.
- Pantry/hall state: pantry stack count and fresh kcal
  (read-only snapshot), so a 'none' is never misread as
  an empty pantry, and an 'inside' with an empty pantry
  is never misread as a gate failure.
- The steal_pantry tap outcome exactly as the playpath
  instrument issues it: button read via
  `_actionAvailable('thief', actObj)` (null target); if
  and only if the button reads ok, a genuine tap through
  `Game.activateAbility('thief.steal_pantry')` with NO
  target; the tap's return, its say-window lines
  (refusal verbatim or caught/clean narration), and
  the outcome class (button-refused / impl-refused /
  succeeded). A fixture-only `useAbility` call is NEVER
  counted as a played success.

No other change to the instrument's shape: same grant
fixture (thief ability pushed at setup, disclosed as
setup, same as playpath), same competent-nofeast
substrate (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, asserted FATAL), same 2 lead + 5 tap
days, same "day's last player act after competent.daily"
tap timing. NO clock-setting, NO waits-to-dusk as a
steering device, NO steering the policy to manufacture
a position: positions must be ones competent played days
genuinely reach. If a candidate opening state appears
(access != 'none' at a tap time), it is demonstrated
with the genuine tap above, not with a fixture-only call.

## Trace band (identical substrate to the playpath pilot)

- Seeds: 10040–10047 (8 seeds, the playpath pilot band).
- Key: thief.steal_pantry ONLY (8 instances, 40 tap-days
  planned; tap-days lost to game-over / in-combat /
  button-refusal are recorded with their reason, never
  dropped silently).
- Horizon: 7 harness days per instance (2 lead + 5 tap).
  Death-aware: an instance that ends early counts its
  already-made tap-days and is flagged ended-early.
- Output: one file per instance under
  evidence/2026-10-28/sim-thiefhall-b-corpus/, plus
  scripts/analyze-thiefhall-b.js producing the
  access-state table, plus scripts/test-thiefhall-b.js
  proving the instrument and the measurement.

## Primary metric (this arm's ONLY judged metric)

The hall gate mechanism, named with its code site, PLUS a
complete havenStoresAccess() access-state trace over the
band: for EVERY played tap day, the access value with its
position / tile / flag / exile / stage components and
the tap outcome. The metric is the gate + the trace
together — a named gate without the trace, or a trace
without the named gate, is not a pass.

## Verdict rule (judged ONLY against this prereg)

- DIAG-GO: the gate is named (mechanism + code sites,
  matching the code as read and the trace as measured)
  AND reachability is determined, by EITHER:
  (a) >=1 genuine played steal_pantry success
  demonstrated from a played position (button ok, UI
  tap, impl returned true, success narration in the
  say window, access value at tap time recorded), OR
  (b) an exhaustive negative proven over the band:
  EVERY played tap day's access = 'none', with the
  positions / tile states enumerated (how many tap
  days on the haven node vs off it, how many inside
  vs outside, exile count, stage values), so a reader
  can see exactly which positions competent play
  reached and that none of them opened the gate.
- DIAG-NO-GO: the gate is unnamed (mechanism not
  pinned to code + trace), OR the trace is incomplete
  (tap days missing access values, positions, or tap
  outcomes), OR a claimed success rests on a
  fixture-only call rather than a genuine played tap.
- A DIAG-GO exhaustive negative is a documented
  reachability finding, NOT a failure to try harder:
  if no played position opens the gate, the arm's job
  is to name the gate and publish the positions, not
  to manufacture one. No src/js change is authorized
  to "fix" the finding in this arm.

## Sense-check (pre-registered)

Read at least one full tap-day transcript (day's played
actions + tap + refusal/success lines) and judge plainly:
does the hall refusal read like a sensible played
outcome — a thief standing on the haven grounds whose
hands are not in the hall — or like a missing position
the game never offers (competent play never steps back
inside the hall before evening taps)? Say which, with
the trace numbers behind it. Do not fill silence with
invention: if no transcript line explains the position,
say so.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This trace has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. Panel
metrics (national/table/wins) do not exist for 7-day
instances and are not estimated. So NO balance-panel
compare .md is produced for this arm, as in playpath.

## Metric review (carried, not re-scored)

- `playerAtHaven()` is NOT the gate: it reads map
  distance (<=1 from the village node), while the gate
  reads the inside flag AND the tile type. A tap day
  that is "at the haven" in the playerAtHaven sense
  can still be 'none'. The analyzer must publish both
  columns separately and never merge them.
- Button-refused taps still carry an access value:
  the trace records access on EVERY tap day, including
  button-refused and skipped ones, so a refused button
  is never mistaken for a gate observation gap.
- Grant persistence (playpath's 11 late taps on
  10041/10042 losing the granted ability): the trace
  records ability ownership at tap time. If a thief
  tap is refused "You don't have that ability.", it is
  classified as an ownership loss, NOT as a hall-gate
  observation, and the access value is still recorded.
- Tap-day vs game-day (playpath metric review): tap
  days are harness days; a daily crossing midnight can
  put two harness tap days on one game day. The
  analyzer publishes game day per tap day alongside
  the harness count.
