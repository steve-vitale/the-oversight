# sim-insideevening-b — PREREGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-insideevening-b
(run fleshout-loop-b-20261028T1930Z).
POLICY-SIDE ARM ONLY: one new file in scripts/policies/
extending competent — zero src/js changes, zero default
flips, zero changes to competent.js itself.

## Gap (from sim-thiefinside-b, GO, and sim-thiefhall-b, DIAG-GO)

competent.daily exits the hall every day, so no evening
ever starts inside: thiefhall traced 40/40 tap days
access 'none' (35 haven-grounds, 5 away, 0 inside), and
thiefinside proved only a MANUAL evening (walk to the
doorstep + 'Go inside' button + genuine thief tap) opens
the inside gate, 36/36 completed pilot evenings. The
open blank, named by both arms: a policy whose evenings
end inside, which would change every inside-gated tap's
reachability without any manual evening procedure.

## Canon read before building

- docs/CANON.md (manifest) — read first.
- docs/ABILITY-REFUSALS.md — pantry doors/ledger canon:
  the gate is `havenStoresAccess()` (insideHaven AND haven
  tile, exile override, stage-3 remote fallback); the
  inside position is the door every pantry flow passes
  through. This arm moves the PLAYER through that door
  at evening time; it does not change the gate, the
  ledger, or any refusal.
- No other canon doc covers "evenings end inside" as a
  policy rule — this is a player-behavior lever, not a
  system, so no canon is invented for it. The evening
  step reuses only honest player verbs already in the
  game (walk, 'Go inside'), exactly as thiefinside's
  manual evening did.

## The policy: scripts/policies/insideevening.js

Extends competent (requires ./competent, delegates
setup/upkeep/fight to it unchanged). Its daily() calls
competent.daily, then, as the evening's LAST step
(after competent.daily, before the harness's sleep —
the same slot thiefinside's manual evening occupied),
runs the evening step:

1. If game over / in combat: evening 'blocked-combat'
   (no walk, no entry — entering mid-fight is refused
   by the engine anyway).
2. If scholar.insideTent: evening 'blocked-tent'
   (enterBuilding refuses from a tent room by design).
3. If already inside (insideHaven true AND tile
   'haven'): evening 'already-inside', no walk, no
   entry call. Counts toward the evening rate.
4. If NOT on the haven tile (playerTile().type !=
   'haven'): evening 'not-attempted-away'. NO trek
   home is attempted: a day's walk away is not walked
   home in the evening just to sleep inside, and a
   multi-node trek would steer the day, not play the
   evening. Away evenings are enumerated, excluded
   from both the rate numerator and denominator.
5. If on the haven tile and outside: walk to a
   lodge-adjacent cell via the browser "Walk here"
   verbs (beginPathWalk + pathStep per square, the
   thiefinside walk, preferring the (4,5) doorstep
   dirt when reachable), read Game.cellActions at an
   adjacent lodge cell, and ONLY if the list contains
   'Go inside' AND Chebyshev adjacency <= 1, dispatch
   that label exactly as app.js doContextAction does
   (Game.enterBuilding(); refresh is DOM-only and
   skipped). Entry must return true AND land
   insideHaven true on the haven tile, else evening
   'entry-refused' (or 'walk-no-path' /
   'walk-interrupted-combat' / 'no-go-inside-button'
   per the failing step, recorded never teleported
   past). A bare enterBuilding() with no adjacency +
   cellActions checks NEVER happens here.

"At/near haven" in the task means step 5's domain:
on the haven tile (the grounds), walking the few
detail squares to the lodge. It does NOT mean
travelling home from another map node.

The policy does NOT exit in the morning: the next
day's competent.daily runs from wherever the night
left the player, and its own trips (travelTo etc.)
exit honestly when they travel. Morning persistence
(post-sleep, pre-daily inside flag) is RECORDED as a
secondary observation, never steered: sleep() contains
no insideHaven clearing (code-read, game.js sleep
body), so an evening inside should still be inside
at dawn unless an upkeep verb moved the player.

## Instrument: scripts/insideevening-trace-b.js

A driver on the thiefinside pattern (fresh game per
seed via scripts/sim-harness.js, same grant fixture:
thief ability granted at setup so the tap is offered).
Per loop-day it wraps policy.daily:

- BEFORE the day's daily (loop-day > 1): record the
  morning position (post-sleep, pre-daily): inside
  flag, tile type, access. This is the persistence
  observation for the PREVIOUS evening.
- The wrapped daily runs the policy (competent.daily
  + evening step for the insideevening policy;
  competent.daily alone for the control).
- AFTER the day's daily, BEFORE the harness sleep:
  record the evening position: at-haven (tile
  'haven'), inside flag, access, plus the evening
  step's own outcome/method (already-inside /
  walk+go-inside / away / blocked / refused, with
  walk/entry detail on the insideevening leg).
- On TAP DAYS only (the last 5 loop-days): issue the
  genuine thief tap exactly as thiefinside did
  (button read via Game._actionAvailable, null
  target; if and only if ok, Game.activateAbility
  ('thief.steal_pantry') with NO target) and record
  access at tap time, tap outcome class, pantry
  delta, ticks/kcal deltas. The tap is the played
  reachability probe: on the policy leg it should
  issue from inside with no manual evening; on the
  control leg it should reproduce thiefhall ('none',
  hall-refused). Tap days consume ticks/kcal like
  any played tap, so post-tap-day trajectories
  diverge from a tap-free run — stated, not hidden.
- No clock-setting, no waits, no kcal/health
  top-ups, no travelTo in the driver, no direct
  position writes, no steering of competent.daily.

## Substrate (asserted FATAL, same as the thief arms)

COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1. Both legs run on this substrate, so
the ONLY difference between control and policy is
the evening step.

## Horizon (death-aware, never a fixed 200d)

30 loop-days per instance. Why 30: 7 days (the thief
arms) gives at most 7 evenings and no survival
signal; 30 gives a real evening rate (up to 30
evenings per seed) and a month of survival exposure
while staying affordable (the thief arms ran 7 days
in ~100s for 8 instances; 30 days is budgeted at
~10 min per 8-seed leg). Dead instances stop
simulating (runDays ends on Game.over); their
already-made evenings count and the instance is
flagged ended-early. No +10d tail is needed: the
evening record stops at death, it is not projected.

## Seed bands (freshness verified BEFORE judging)

- Pilot: 10700–10707 (8 seeds). Confirm: 10710–10725
  (16 seeds). Verified fresh 2026-10-28: no dated
  evidence .md or corpus filename in evidence/
  uses 10700–10707 or 10710–10725 as judged seeds
  (107xx hits in the tree are kcal values, day
  numbers, and line numbers, not seed bands), and
  the heavily used recent B bands (10040–10065,
  104xx) are avoided. Baseline (competent) and
  policy run on IDENTICAL seeds in each band.
- Pilot gate: 8 seeds before/after before ANY
  confirm spend. A pilot miss kills the lever —
  no 16-seed run on an invisible effect.

## Primary metrics (the ONLY judged metrics)

Per seed, over its loop-days that reached an evening
record (i.e. the instance was alive at daily-end):

- M1 inside-evening rate = (evenings ending inside)
  / (evenings at haven at daily-end, pre-step).
  Evenings ending inside = 'already-inside' +
  'walk+go-inside' evenings. Denominator = at-haven
  evenings only: away evenings are excluded from
  both sides, blocked/refused at-haven evenings
  stay in the denominator (they are failures of
  the lever, not exclusions). A seed with ZERO
  at-haven evenings does NOT pass (no denominator
  is not a rate).
- Seed pass (M1): M1 >= 0.5.
- M2 inside-tap reachability (tap days only): on tap
  days whose evening ended inside, the genuine thief
  tap reads havenStoresAccess() 'inside' at tap
  time. Seed pass (M2): at least one tap day with
  access 'inside' at tap time AND an issued tap.
- Guards (relative, per the 2026-10-28T1736Z round
  lesson — absolute 120d bars are unpassable on some
  substrates, so NO absolute survival bar is set):
  G1 median loop-days survived (policy) >= 0.8x
  median loop-days survived (control) on the same
  band; G2 starvation deaths (policy, by endReason /
  death cause where recorded) <= control + 2.

## Verdict rule (judged ONLY against this prereg)

- GO (pilot): >= 6/8 seeds pass M1, >= 6/8 seeds
  pass M2, G1 and G2 both hold. Then confirm on
  10710–10725 under a confirm addendum committed
  BEFORE any confirm run.
- GO (confirm): >= 12/16 seeds pass M1, >= 12/16
  seeds pass M2, G1 and G2 both hold on the confirm
  band. The arm is then landable as a policy file
  (policy-side, no game change).
- NO-GO: any leg misses its bar. The blocking step
  is named per failing seed (away / walk-no-path /
  no-go-inside-button / entry-refused /
  button-refused / walk-interrupted-combat /
  game-over / zero-at-haven-evenings), with counts
  — NOT re-scored against a friendlier metric
  (e.g. counting away evenings as inside, counting
  a refused entry as inside, or counting a tap
  issued from the grounds as an inside tap).
- DIAG-NO-GO (instrument failure, distinct from
  NO-GO): the corpus is incomplete (evenings missing
  position/access, tap days missing tap outcomes),
  or any claimed inside evening rests on an entry
  that skipped the adjacency + cellActions checks.
  A DIAG-NO-GO invalidates the run, not the lever.
- KILL DISCIPLINE: on a pilot NO-GO, the policy
  file is DELETED (killed arms leave no trace except
  evidence) and the report is NO-GO with numbers.

## Sense-check (pre-registered)

Read at least one full inside evening end-to-end
(the day's last lines: walk quote, "You step into
the Haven hall.", sleep, dawn position) and judge
plainly: does coming home, stepping inside, and
sleeping in the hall read like a sensible played
evening — a villager going indoors for the night —
or like a harness artifact (a position no evening
would reach, a line contradicting the position)?
Say which, with the trace numbers behind it. Do
not fill silence with invention: if no transcript
line explains a step, say so.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here (arenalabel precedent): this
leg is a 30-day position/reachability measurement,
not a game change, and panel metrics (national /
table / wins, wave reach) cannot move — and cannot
even be observed — inside 30-day instances. A panel
compare over zero-variance panel metrics would be a
fake comparison. The before/after instrument for
this leg is the custom driver on identical seeds
(control competent vs policy insideevening), and
the pre-registered thresholds above are the judge.
If either guard (G1/G2) fails, a longer-horizon
panel run is the named follow-up before any landing
claim, not a mid-run rescue.

## Metric review (carried, not re-scored)

- playerAtHaven() is NOT the gate and NOT the
  denominator: the denominator is the haven TILE at
  daily-end (playerTile().type === 'haven'), never
  map-distance to the village node (thiefhall
  proved 35 "at haven" days were still 'none').
- Tap-day vs loop-day vs game-day: loop-days are
  harness days; game day is published per evening
  row. A daily crossing midnight can put two
  loop-days on one game day.
- The walk's kcal/ticks are part of the evening's
  honest price, recorded per step-leg, as in
  thiefinside.
- Absent fields reported as absent: exile /
  systemArrived absent reads falsy in the gate,
  same as false; gate reproduction is unaffected,
  but "absent" is not "measured false".
- Ownership: the grant fixture is recorded per
  instance; a tap refused "You don't have that
  ability." is an ownership loss, NOT a gate
  observation, and the access value is still
  recorded (thiefinside confirm precedent).
- Tap divergence: tap days consume ticks/kcal, so
  a tap day's evening record is pre-tap and clean,
  but later evenings on the same instance follow a
  tapped trajectory. Evening-rate rows are labelled
  tap-day or not so this is visible.
