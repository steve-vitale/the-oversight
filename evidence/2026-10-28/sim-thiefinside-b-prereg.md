# sim-thiefinside-b — PREREGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-thiefinside-b
(run fleshout-loop-b-20261028T1730Z).
MEASUREMENT ONLY: zero src/js changes, zero default flips,
zero game-code changes of any kind. New scripts/instruments/
analyzers/proofs/corpus/evidence only.

## Gap (tracker next blank #2, from sim-thiefhall-b, DIAG-GO)

`havenStoresAccess()` (src/js/game.js:11542) is a conjunctive
POSITION gate — exile -> 'none'; `scholar.insideHaven` AND
`playerTile().type === 'haven'` -> 'inside';
`integrationStage() >= 3` -> 'remote'. Thiefhall traced 40/40
tap days 'none' (35 on the haven tile OUTSIDE the hall, 5 away,
0 inside) because competent evenings never step inside. The
inside position was code-read only (`enterBuilding` from the
haven node would pass the gate) — never demonstrated. This arm
demonstrates a human "go inside, then tap" evening under its
own prereg, and writes the design question for a §2-style
pre-payment precheck for thief (canon docs/ABILITY-REFUSALS.md
§1 post-payment refusal class, §2 pre-payment prechecks).

## Played vs instrumented — the disclosure this arm is judged by

Read this before the verdict rule, because it changes what
"played" can honestly mean in a node harness:

- The thief tap itself IS a genuine played tap, exactly as in
  thiefhall: button read via `Game._actionAvailable('thief',
  actObj)` (null target, the bar's read); if and only if the
  button reads ok, the tap is issued through
  `Game.activateAbility('thief.steal_pantry')` with NO target.
- The walk to the lodge IS played movement: `Game.beginPathWalk`
  + `Game.pathStep` per square are exactly the verbs the
  browser's "Walk here" button runs (src/js/app.js
  `walkPathAnimated`: `beginPathWalk`, then one `pathStep`
  per square via MoveAnim). The animation layer is skipped;
  the movement verbs, their per-square kcal, their ticks,
  and their monster/animal/villager turns are the real ones.
- The entry step is BUTTON-HANDLER-EQUIVALENT, NOT a DOM tap,
  and is labelled so everywhere in this arm (never "played
  entry", never "played tap" for the entry itself). Why: node
  excludes app.js (DOM-only), so the browser's lodge tile
  card cannot render in this harness. What the harness does
  instead reproduces the card's decision faithfully and
  nothing more: (1) the player must stand adjacent
  (Chebyshev distance <= 1) to a lodge cell — the same
  gating the app.js tile card applies before it offers
  'Go inside' (dist > 1 offers only "Walk here"); (2)
  `Game.cellActions(lodgeCx, lodgeCy)` — the Game method
  the UI reads to decide which buttons exist — must return
  a list containing 'Go inside'; (3) only then is the
  app.js `doContextAction` mapping for that label invoked,
  whose entire body is `Game.enterBuilding(); refresh();`
  (app.js:1240 and 2023) — refresh is DOM-only and skipped,
  disclosed here. No other engine state is touched by the
  dispatch. A bare `enterBuilding()` call with no adjacency
  check and no cellActions read would be INSTRUMENTED, and
  this arm never does that: every entry row carries the
  adjacency, the cellActions list, and the dispatch label.
- What remains unproven after this arm, stated plainly: a
  DOM/browser tap on the lodge card (a human finger on a
  phone). That needs a browser playtest, which this node
  subagent cannot perform; it is named as the follow-up,
  not claimed here. The verdict below therefore judges the
  GATE question (does the inside position open the gate,
  and what does the thief tap do there) on the
  button-handler route + genuine thief tap — and the
  evidence file's verdict line will carry the
  button-handler label with it, never a bare "played".

## Instrument (copy of the thiefhall driver, extended)

`scripts/thiefhall-trace-b.js` is COPIED to
`scripts/thiefinside-trace-b.js` (never modified in place).
Same substrate, same timing, same grant fixture, same
genuine thief tap — plus, per tap day, AFTER
competent.daily and BEFORE the thief tap, the evening
procedure below. Nothing else changes.

Evening procedure (recorded step by step, never steered
past a refusal):

1. Record pre-evening position/access exactly as thiefhall
   did (access, inside flag, tile type, map/detail coords,
   exile, stage, pantry, ownership, kcal, ticks, combat).
2. If game over -> 'game-over'. If in combat -> evening
   'not-attempted-in-combat' (no entry, no tap; the tap
   day still carries its access value).
3. If already inside at pre-evening (inside flag true AND
   tile haven): entryMethod 'already-inside', no walk, no
   entry call; proceed to the thief tap. (A previous
   evening's entry may persist; competent.daily's own
   enter/exit pairs are its business, recorded not
   steered.)
4. If insideTent: evening 'blocked-tent' — `enterBuilding`
   refuses from a tent room by design; no entry attempted.
5. If NOT on the haven tile (tile type != 'haven'): evening
   'not-attempted-away'. NO trek home is attempted: a human
   a day's walk away does not walk home in the evening
   just to steal, and a multi-node trek would be steering
   the day, not playing the evening. The tap day still
   carries its access value ('none' expected) but no thief
   tap is issued from away — issuing it would only repeat
   thiefhall's hall refusal, which is already proven 37/37.
   (Away days are NOT gate failures and NOT inside
   successes; they are enumerated per seed.)
6. If on the haven tile and outside: walk to the lodge.
   Walk target = the nearest lodge-adjacent cell (ring
   around lodge footprint rows 3-4, cols 3-5: row 2
   cols 3-5, row 5 cols 3-5, col 2 rows 3-4, col 6
   rows 3-4) reachable by `findPath` from the current
   cell, preferring the (4,5) doorstep dirt when it is
   reachable. Walk via `beginPathWalk(tx, ty)` then
   `pathStep` per square until arrival or a step returns
   false. Record: walk target, path length, steps landed,
   kcal/ticks before and after, combat onset mid-walk
   ('walk-interrupted-combat' — stop, no entry, no tap).
   If no path exists to any adjacent cell: evening
   'walk-no-path' (recorded, never teleported past).
7. At the adjacent cell, pick a lodge cell at Chebyshev
   distance <= 1, read `Game.cellActions(lx, ly)`, and
   record the full list. If 'Go inside' is absent: evening
   'no-go-inside-button' (recorded; no entry call).
8. Only if steps 6-7 pass: dispatch 'Go inside' via the
   app.js mapping (`Game.enterBuilding()`), recording
   its return, its say lines, and position/access AFTER
   entry (mx/my must read 4,7 and inside true for a
   successful entry; any other result is recorded as
   'entry-refused' with its say line, and no thief tap
   is issued from a refused entry).
9. Thief tap, exactly as thiefhall: button read; if ok,
   `Game.activateAbility('thief.steal_pantry')` with NO
   target; record return, say window, outcome class
   (success-clean / success-caught / impl-refused-hall /
   impl-refused-empty / impl-refused-heavy / other-refusal
   with its verbatim line), ticks/kcal deltas, access
   before and after the tap, and pantry delta. If the
   button refuses (e.g. hunger after the walk): outcome
   'button-refused' with its why — the gate still opened
   (access 'inside' recorded), but no tap was issued, so
   the tap day does NOT count toward the seed-success
   count (which requires an issued inside tap).

No clock-setting, no waits, no kcal/health top-ups, no
`travelTo`, no direct position writes, no steering of
competent.daily. Positions are ones competent played days
genuinely reach, plus the evening's own walked steps.

## Trace band (identical substrate to thiefhall)

- Seeds: 10040-10047 (8 seeds, the thiefhall band — reusing
  it with a different evening action is stated here, so
  per-seed comparison against thiefhall's positions is
  legitimate; the evening action is the only difference).
- Key: thief.steal_pantry ONLY (8 instances, 40 tap days
  planned; tap days lost to game-over / in-combat /
  away / hunger are recorded with their reason, never
  dropped silently).
- Horizon: 7 harness days per instance (2 lead + 5 tap).
  Death-aware: an instance that ends early counts its
  already-made tap days and is flagged ended-early.
- Output: one file per instance under
  evidence/2026-10-28/sim-thiefinside-b-corpus/, plus
  scripts/analyze-thiefinside-b.js producing the
  evening/outcome table, plus scripts/test-thiefinside-b.js
  proving the instrument and the measurement (instrument
  determinism + gate-reproduction legs in the thiefhall
  T3 style).

## Primary metric (this arm's ONLY judged metric)

Per seed: whether at least one tap day completes the
evening (walk + button-handler entry, or already-inside)
AND issues a genuine thief tap from the inside position
(access 'inside' at tap time), with that tap's outcome
recorded. Plus, for EVERY inside tap: havenStoresAccess()
reads 'inside' at tap time. The gate question is the
verdict — a caught roll still proves the gate opened;
a clean lift still proves it; only a hall refusal from
inside would contradict the code-read gate.

## Verdict rule (judged ONLY against this prereg)

- GO: >= 6/8 seeds reach the inside thief tap as defined
  above, havenStoresAccess() reads 'inside' on 100% of
  inside thief taps, and every inside tap's outcome is
  recorded (success-caught / success-clean / other
  refusal, each with its verbatim say line). The verdict
  line carries the button-handler label: "gate opens on
  the button-handler route + genuine thief tap; DOM-tap
  entry remains unproven (browser follow-up)".
- NO-GO: fewer than 6/8 seeds reach the inside thief tap,
  OR any inside tap reads access != 'inside', OR any
  inside tap's outcome is unrecorded. The blocking step
  is named per failing seed (away / walk-no-path /
  no-go-inside-button / entry-refused / button-refused /
  walk-interrupted-combat / game-over), with counts —
  NOT a failure to try harder, and NOT re-scored against
  a friendlier metric (e.g. counting a refused entry or
  an unissued tap as a success).
- DIAG-NO-GO (instrument failure, distinct from NO-GO):
  the corpus is incomplete (tap days missing access
  values, evening steps, or tap outcomes), or any claimed
  inside tap rests on an entry that skipped the adjacency
  + cellActions checks. A DIAG-NO-GO invalidates the run,
  not the gate.

## Sense-check (pre-registered)

Read at least one full inside-evening transcript (walk
steps + entry line + thief tap + caught/clean narration)
and judge plainly: does stepping inside and lifting read
like a sensible played evening — a thief who walked to
the hall, went in, and reached the pantry — or like a
harness artifact (a position no evening would reach, a
line that contradicts the position)? Say which, with the
trace numbers behind it. Do not fill silence with
invention: if no transcript line explains a step, say so.

## Design-question deliverable (in the evidence file, NOT landed)

A §2-style pre-payment precheck for thief: what it would
check (the gate, exactly as the impl checks it — access
!= 'none', mirroring the impl, no new eligibility), what
it would cost/save the player (thiefhall: every
hall-refused tap currently pays +5 ticks / -120 kcal
first; a precheck would refuse before payment, and the
button would carry the why on its disabled row per canon
§3), what breaks if the precheck is wrong (the
scan-default / button-honesty risks: a precheck that
refuses where the impl would succeed strands a working
lift; one that passes where the impl refuses preserves
the paid refusal — the asymmetry matters, and the
inside-position check must read the same flag+tile
conjunct, not playerAtHaven distance), and what needs
Steve's call (whether thief deserves a §2 precheck at
all, and whether the button why should name the hall
position or just the refusal). Do NOT land a precheck
change in this arm — it is a specified next arm.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This arm has NO before/after game leg: zero game changes,
zero lever variants, nothing to panel. Panel metrics
(national/table/wins) do not exist for 7-day instances
and are not estimated. So NO balance-panel compare .md is
produced for this arm, as in thiefhall. The thiefhall
comparison (same seeds, different evening) is a corpus
comparison, not a panel compare, and is labelled so.

## Metric review (carried, not re-scored)

- `playerAtHaven()` is NOT the gate: published separately,
  never merged into the gate columns (thiefhall metric
  review, carried).
- Tap-day vs game-day (carried from thiefhall/playpath):
  tap days are harness days; a daily crossing midnight
  can put two harness tap days on one game day. Game day
  is published per tap day alongside the harness count.
- The walk's kcal/ticks are part of the evening's honest
  price, not a confound: they are recorded per step-leg
  so a button refusal after the walk (hunger) is
  attributable to the walk, not mysterious.
- Already-inside tap days count toward seed success only
  when a genuine thief tap is issued from inside on that
  day; the entry that put the player inside must itself
  be traceable to a prior evening in the same instance
  (entryMethod chain) or to spawn/competent play — an
  inside flag with no traceable entry is a
  DIAG-NO-GO instrument finding, not a success.
- Grant persistence (thiefhall metric review, carried):
  ability ownership is recorded at tap time; a thief tap
  refused "You don't have that ability." is an ownership
  loss, NOT a gate observation, and the access value is
  still recorded.
