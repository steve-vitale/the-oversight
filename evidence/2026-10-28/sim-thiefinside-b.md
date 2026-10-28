# sim-thiefinside-b — the go-inside-then-tap evening, demonstrated

Run: oversight-flesh-out-loop-b, arm sim-thiefinside-b
(run fleshout-loop-b-20261028T1730Z).
MEASUREMENT ONLY: zero src/js changes, zero default flips.
Follow-up to sim-thiefhall-b (DIAG-GO exhaustive negative:
40/40 tap days 'none', 0 inside, because competent evenings
never step inside). This arm answers the named next item:
does a human "go inside, then tap" evening open the gate,
and what does the thief tap do from inside?

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-thiefinside-b-prereg.md, committed as f96d37d BEFORE any judged run)

**GO — gate opens on the button-handler route + genuine
thief tap; DOM-tap entry remains unproven (browser
follow-up).** 8/8 pilot seeds reached the inside thief tap
(bar: >= 6/8); havenStoresAccess() read 'inside' on 100%
of inside thief taps; every inside tap's outcome is
recorded. The verdict line carries the button-handler
label deliberately (see "Played vs instrumented" below):
the entry step reproduces the browser lodge button's
handler exactly, but node cannot render the DOM card, so
a finger-on-phone entry is NOT claimed here.

Confirm (16 fresh seeds 10050–10065, addendum committed as
bb93d47d BEFORE any confirm run): **CONFIRM-GO — 16/16
seeds** reached the inside thief tap (bar: >= 12/16);
havenStoresAccess() read 'inside' on 100% of inside thief
taps; every inside tap's outcome is recorded. Details in
"The confirm band" below; the pilot verdict stands on its
own band regardless, and the confirm strengthens its
generality rather than qualifying it.

## Played vs instrumented — read this before the numbers

- The thief tap is a GENUINE PLAYED TAP on every counted
  row: button read via `Game._actionAvailable` (null
  target, the bar's read); if and only if ok, issued
  through `Game.activateAbility('thief.steal_pantry')`
  with NO target — the same rule as thiefhall.
- The walk is PLAYED MOVEMENT: `beginPathWalk` +
  `pathStep` per square are exactly the verbs the
  browser's "Walk here" button runs (app.js
  `walkPathAnimated`). Animation skipped; verbs, ticks,
  kcal, and monster/animal/villager turns real.
- The entry is BUTTON-HANDLER-EQUIVALENT, never labelled
  "played entry" in this arm: the player must stand
  adjacent (Chebyshev <= 1) to a lodge cell — the app.js
  tile-card gate before 'Go inside' is offered — and
  `Game.cellActions` at that lodge cell must return
  'Go inside'; only then is the app.js `doContextAction`
  mapping invoked, whose entire body is
  `Game.enterBuilding(); refresh();` (app.js:1240, 2023;
  refresh is DOM-only and skipped). A bare
  `enterBuilding()` with no adjacency + cellActions
  checks never happens here; proof leg T4 enforces it
  (adjacency <= 1, button present, return true, lands
  (4,7) inside on the haven tile, on every walk entry).
- NOT demonstrated: a DOM/browser tap on the lodge card.
  That is the follow-up for a browser playtest, named in
  the backlog notes at the end — not claimed, not hidden.

## The evening, as demonstrated (pilot: 8 seeds 10040–10047, thief only, 2 lead + 5 tap days, competent-nofeast substrate)

- Instances: 8/8 survived, 40/40 tap days recorded, 0
  skipped, 0 game-over, 0 button-refused.
- Evenings completed: **36/40**. Entry method on all 36:
  walk + Go-inside (walk to the (4,5) doorstep dirt, tap
  lodge cell (3,4) at adjacency 1, cellActions returning
  'Go inside' — sometimes alongside 'Talk' when a
  villager stood nearby — then the handler entry, landing
  (4,7) inside, access 'inside'). Already-inside
  evenings: **0** — no tap day ever found the player
  already inside at evening time, so every inside tap
  was earned by that evening's own walk + entry. (That
  also means competent.daily exits the hall during the
  day, every day, on this band: the hall is never the
  evening's starting position, only its destination.)
- Evenings not attempted: **4/40, all 'away'** — seed
  10041 tap days 4–7, on forest_floor at map 1,3, the
  same away stretch thiefhall traced. Per the prereg,
  no trek home was attempted: a human a day's walk away
  does not walk home in the evening just to steal, and
  those days are enumerated, not counted as gate
  failures. Seed 10041 still counts as a success on its
  single haven evening (tap day 3).
- No walk failed, no entry was refused, no button was
  missing: walk-no-path 0, no-go-inside-button 0,
  entry-refused 0, walk-interrupted-combat 0,
  blocked-tent 0. The walk itself: 3–5 squares per
  evening, quoted 6–10 kcal (one 5-square walk quoted
  15 kcal — see metric review), landing exactly on the
  doorstep every time.
- Inside taps: **36/36 read access 'inside' at tap
  time** (gate reproduction 0 mismatches pre-evening
  and at-tap, proof T3). Outcomes: **18 success-clean,
  18 success-caught** — the impl's 50% caught coin, dead
  even across the band. **0 hall refusals from inside.**
  Every success moved exactly 400 kcal from pantry to
  pack (pantry deltas -400 on all 36), and every tap
  cost exactly +5 ticks / -120 kcal tap-only (walk
  ticks/kcal separate: total evening delta 8–10 ticks,
  -126 to -135 kcal, i.e. walk + tap). The hall gate,
  not the pantry and not the coin, was the whole story
  in thiefhall — and it opens exactly as the code read
  said it would.
- Pre-evening access on the 36 completed evenings was
  'none' on all 36 (grounds, outside) — the same
  position thiefhall measured — so each evening is a
  before/after pair on the same day: 'none' on the
  grounds, 'inside' after the door, thief tap issued
  from inside.

## The confirm band (16 fresh seeds 10050–10065, same substrate and evening)

- Instances: 16/16 survived, 80/80 tap days recorded.
  Evenings completed: **73/80**, all walk + Go-inside,
  all landing (4,7) inside. Evenings not attempted:
  **6 away** (seed 10058 tap days 4–7; seed 10054 tap
  days 4 and 7) and **1 in-combat** (seed 10054 tap
  day 5 — the player was mid-fight at evening time, so
  no entry and no tap were attempted; that tap day
  still carries its access value). No walk failed, no
  entry was refused, no button was missing, no evening
  started already inside — the pilot's shape repeats
  exactly on fresh seeds.
- Seed success: **16/16** (bar >= 12/16). Even the two
  thinnest seeds succeed on a single haven evening:
  10058 on 1 completed evening (1 caught lift), 10054
  on 2 completed evenings (1 caught lift, plus the
  ownership row below).
- Inside taps: **73/73 read access 'inside' at tap
  time** (gate reproduction 0 mismatches pre + at-tap,
  confirm check C3). Outcomes: **42 success-clean,
  30 success-caught, 1 other-refusal** — the
  other-refusal is the ownership row below, not a gate
  refusal: **0 hall refusals from inside** on the
  confirm band too. Combined pilot + confirm: 109
  inside taps, 60 clean / 48 caught / 1 ownership
  refusal — the caught share (48/108 decided lifts,
  44%) sits within noise of the impl's 50% coin, and
  no band suggests the coin is anything but the coin.
- The ownership row (seed 10054, tap day 6 — the one
  row a summary must not smooth over): the granted
  thief ability had been lost by that day
  (`ownsThiefBefore` false; the grant-persistence
  confound thiefhall's metric review carried from
  playpath, where late taps lose the grant). The
  evening still completed — walk, 'Go inside' button,
  entry, access 'inside' — and the tap issued, but
  `activateAbility` answered "You don't have that
  ability. (Light Fingers)", tapResult false, pantry
  unchanged, +5 ticks and 0 kcal. Two honesty notes:
  (a) this row is classified as an ownership loss,
  NOT a gate observation, exactly as the prereg
  required — the gate opened; the ability was gone;
  (b) the button read ok on that row only because
  the harness calls `_actionAvailable` directly on
  the action object — the real bar lists only owned
  abilities, so an unowned ability would not be
  offered to a player at all. This row therefore
  proves nothing about a player-facing button bug;
  it proves the instrument records the confound
  instead of laundering it into a gate result.
- Confirm check: `scripts/test-thiefinside-confirm-b.js`
  CONFIRM-PROOF-GREEN (legs C1–C4, C6, C8). The
  analyzer's determinism field reads false on the
  confirm band by construction — it compares first
  tap days against thiefhall rows that do not exist
  for fresh seeds — and is not a failure; the confirm
  check deliberately omits that leg, and the pilot
  proof's determinism leg (8/8) is where determinism
  is actually proven.

## Sense-testing (read end-to-end, judged on meaning)

Seed 10040, tap day 3 (the band's first inside evening):
pre-evening the player stands on the haven grounds at
(4,0), 1,010 kcal, pantry 31,600 kcal, access 'none'.
The evening says, in the game's own voice, "Walking 5
squares (10 kcal)…" — then "You step into the Haven
hall." — then the tap: "The food disappears. Magic.
(It's not magic. Nobody saw. Light Fingers.)" plus the
understanding line and "(−120 kcal — food becomes
thief.)". At tap time the player stands at (4,7)
inside, 1,000 kcal, access 'inside'; after the tap,
880 kcal and pantry 31,200.

Seed 10040, tap day 5 (first caught lift in the band):
walk "3 squares (6 kcal)…", "You step into the Haven
hall.", then "A hand closes on your wrist. 'Really?'
-20 trust. The pantry remembers. (Light Fingers —
caught.)" — the caught consequence landing exactly
where the theft happened, inside the hall whose stores
were lifted.

Judgment: the inside evening reads as a **sensible
played evening, not a harness artifact**. Each step
narrates itself (the walk quotes its price, the door
says you stepped in, the lift says what happened and
what it cost), the position and the narration agree at
every step (grounds → hall → pantry lift), and the
caught/clean coin is the only chance in the sequence —
the gate itself never rolls. The one silence worth
naming: nothing in the game's own lines tells a
grounds-standing player to go inside first — the
evening's walk-to-the-lodge is the driver's procedure,
not a hint the game gave. A player who never thinks to
step inside still meets thiefhall's paid refusal, which
is exactly why the precheck question below matters.

## Village assessment (plain words, within what 7-day instances can say)

These are not lived villages — each instance is one
village played for 7 harness days, tapped on the last
5. What they show, repeated 8 times, is a village whose
evenings now have a door in them: the player comes
home, walks the few squares to the lodge, steps
inside, and reaches the pantry with magician's hands —
and half the time nobody sees, half the time a hand
closes on their wrist and the village remembers (-20
trust, in the record, not just the sentence). The
pantry is never the problem (18,000–33,500 kcal on
inside tap days); the hands are never the problem (the
granted ability survives all 40 tap days); the coin is
fair (18/18). One village (10041) spent its last
evenings away from home — the same away stretch as
thiefhall — and its thief simply never got an evening
at home those days, which is honest: away means away.
Blanks filled: (1) the inside position demonstrated,
not just code-read — walk + button-handler entry opens
the gate on 36/36 completed evenings; (2) the thief
tap's inside behavior measured — 18 clean / 18 caught,
400 kcal per lift, +5 ticks / -120 kcal per tap;
(3) the evening's own price measured — 3–5 walked
squares plus the tap's price, separately accounted.
Documented, not fixed: the thief precheck (below);
the DOM-tap entry (browser follow-up).

## The design question: a §2-style pre-payment precheck for thief

Canon docs/ABILITY-REFUSALS.md §1 states the law: a
refusal the game can see coming must refuse BEFORE
payment; §2 lists the three landed world-state
prechecks (challenge, end_it_before, trophy), which
run both when the button state is read
(`_actionAvailable`) and inside `useAbility` before
any cost is paid. Thief has no entry in
`ABILITY_ACTION_PRECHECKS`, so its hall refusal is
post-payment: thiefhall measured +5 ticks / -120 kcal
on all 37 hall-refused taps, and this arm measures
the same +5 / -120 as the price of a successful tap
too — the refusal costs exactly what success costs.

### What it would check

The gate, exactly as the impl checks it — nothing
more, nothing less, at least for the first version:
`game.havenStoresAccess() === 'none'` -> refuse.
That means calling the gate function itself, not
re-implementing the flag+tile conjunct: the gate's
three branches (exile override, inside+ haven tile,
stage-3 remote) are then the precheck's branches by
construction, and a future gate change cannot strand
the precheck in disagreement with the impl (the calm
lesson: mirror the impl's own test). This check is
unusually precheck-friendly, and that matters:
unlike challenge / end_it_before / calm, thief needs
no target scan and no scan-default pattern — the bar
passes no target, but the gate reads only the
player's own position, exile flag, and integration
stage, all available at button-read time with a null
target. There is no audience to resolve, no fight to
scan. The precheck would be target-independent, like
mediator / dress_game / green_thumb.ask in canon §3.

Scope question (for the next arm's prereg, not decided
here): gate-only, or gate + the impl's other two
refusals? The impl also refuses "Nothing worth
lifting." (empty pantry) and "Too heavy for even a
light lift." (pack full) after payment. Both read
world state available at button time (pantry stacks,
carry capacity), so both COULD be prechecked — but
they are less payment-stable than the gate: the tap's
own time cost can roll the day, and a day roll can
move the pantry (night meals) between the precheck
read and the impl dispatch, so a precheck that passes
on a full pantry could still meet an emptied one.
The gate's inputs (position, exile, stage) do not
move under a tick. Gate-only is the safe, exact
mirror; gate+empty+heavy is the complete one with a
day-crossing edge to handle honestly.

### What it would cost / save the player

- Save, per refused tap: +5 ticks and -120 kcal that
  thiefhall proved are currently paid before the
  refusal — plus the day-roll tail risk: a refused tap
  at day's end whose +5 ticks cross midnight pays with
  a day turn (canon §1's refused-but-crossed class),
  which a pre-payment refusal cannot do (the span
  never ticks, the day never rolls inside the tap).
- Cost, per refused tap: nothing — a precheck refusal
  is 0/0/0 by the canon §1 proof shape (button read,
  full button list, and hunger-gate reads move day,
  ticks, and kcal by exactly 0).
- Change to successful taps: none. The tap price
  (+5 ticks / -120 kcal) and the 50% caught/clean coin
  are untouched; a precheck only decides whether the
  tap is offered at all. A player inside the hall taps
  exactly as today.
- What the player sees: per canon §3, a disabled
  button carries its why verbatim. Outside the hall,
  Light Fingers would sit greyed with the refusal
  sentence on it, instead of live and silent and then
  paid-and-refused. The button would teach the
  position requirement (the hall) before the player
  spends anything — which is also the one teaching
  this arm found missing (see sense-testing: nothing
  in the game tells a grounds-standing player to go
  inside first).

### What breaks if the precheck is wrong

The asymmetry is the whole risk, and it runs one way:

- FALSE REFUSAL (precheck refuses, impl would have
  succeeded): the worst failure. A working lift is
  stranded behind a greyed button, the button lies
  about the room (the calm bug's exact shape, canon
  §4), and a player who IS inside — or remote at
  stage 3 — cannot steal at all. This is why the
  precheck must call `havenStoresAccess()` itself and
  must never substitute `playerAtHaven()` distance
  (within 1 of the village node): thiefhall proved
  35 tap days were "at the haven" in that sense and
  still 'none'. A distance-based precheck would refuse
  from inside the hall's own grounds correctly but
  would ALSO pass on... no — worse, it would pass
  from the grounds (distance true, gate 'none') and
  preserve the paid refusal, or refuse from a remote
  position the gate would pass. Either direction, a
  re-implemented conjunct drifts; the function call
  does not.
- FALSE PASS (precheck passes, impl refuses): the
  status quo, not a regression. The tap pays +5 / -120
  and refuses, exactly as today. A gate-only precheck
  that passes on a day-crossing pantry change (empty /
  heavy scope only) degrades to today's behavior on
  that edge, never worse.
- The caught/clean coin is unaffected either way: it
  sits behind the gate, after the pantry scan and
  weight check, and no precheck can or should predict
  it. A precheck must never promise clean or caught —
  only whether the hands are in the hall.

### What needs Steve's call

1. Whether thief deserves a §2 precheck at all. The
   mechanical case is clean (target-independent gate,
   payment-stable inputs, exact mirror available),
   but the design case is his: is the paid "hands are
   not" lesson part of the theft's feel — a thief
   learns the hall by paying for the attempt — or is
   it the same paid-refusal class §2 already fixed
   for challenge, end_it_before, and trophy?
2. The button why's wording. Reusing the impl
   sentence verbatim ("The pantry is in the hall.
   Your hands are not.") is the canon §3 shape
   (disabled buttons show their why, verbatim) and
   teaches the position requirement. A more directive
   why ("Go inside the hall first.") would teach
   harder — whether the button should hand the player
   the move, or only name the refusal, is a design
   call, not a measurement one.
3. Scope: gate-only (exact, payment-stable, safe) vs
   gate + empty + heavy (complete, with the
   day-crossing edge to handle). The next arm should
   preregister one scope and prove it; it should not
   drift between them mid-run.
4. Whether the remote branch (stage >= 3) staying a
   pass is intended for the button too — it follows
   automatically from calling the gate function, but
   if Steve ever wants remote stealing to feel
   different from inside stealing, the button why
   would need to distinguish them, and that is a
   separate design question.

NOT landed here: no precheck change of any kind was
made in this arm. This writeup is the specified next
arm's grounding, not its implementation.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This arm has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. Panel
metrics (national/table/wins) do not exist for 7-day
instances and are not estimated. So NO balance-panel
compare .md is produced for this arm, as in thiefhall.
The thiefhall comparison (same seeds, different
evening: 37 hall-refused taps there, 36 inside taps
here) is a corpus comparison, not a panel compare,
and is labelled so. Note the divergence honestly:
after the first evening, trajectories diverge from
thiefhall (the evening consumes ticks/kcal and moves
the player), so only tap day 3's pre-evening state is
identical seed-for-seed (proof T7, 8/8) — e.g. seed
10042's tap day 7 was away in thiefhall and inside
here. The comparison is valid as "same substrate,
different evening", not as "same days replayed".

## Metric review (MEASUREMENT.md §14)

- Played-vs-instrumented, restated so it cannot be
  misquoted: the GATE verdict rests on the
  button-handler route + genuine thief tap. The DOM
  tap is unproven. Any summary that drops
  "button-handler" from the verdict line misstates
  this arm.
- Walk-quote variance, observed not explained: 35 of
  36 walks quoted 2 kcal/square (6/8/10 kcal for
  3/4/5 squares); one 5-square walk (seed 10044, tap
  day 6) quoted 15 kcal. The game's own quote is
  recorded per evening; the mechanism of the 15 (vs
  the usual 10) was not traced and is not claimed.
  It does not affect any verdict: the walk completed
  and the tap issued on that evening like all others.
- Tap-only cost decomposition, measured: total evening
  deltas (8–10 ticks, -126 to -135 kcal) decompose
  exactly into walk ticks (= steps, 1 tick each) +
  tap ticks (5, all 36) and walk kcal + tap kcal (-120,
  all 36). The -120 kcal mechanism (useAbility cost
  handling vs tick metabolism) was already unclaimed
  in thiefhall's metric review and remains so; only
  the decomposition is new here.
- Pantry uniformity, observed: every inside success
  moved exactly 400 kcal (2 units of the largest
  stack). That uniformity is a property of this band's
  pantries (largest stack 200 kcal/unit), not a rule
  of the lift — the impl takes min(units, 2) of the
  largest stack, so other pantries will lift other
  amounts. Do not generalize "400 kcal per lift".
- Away days are not failures: seed 10041's 4 away
  days are counted in the 40 tap days, enumerated as
  not-attempted-away, and excluded from both the
  success numerator (they issued no tap) and the gate
  denominator (they never reached a position). The
  seed still succeeds on its 1 haven evening; the
  bar is per-seed (at least one inside tap), not
  per-tap-day, exactly as preregistered.
- Absent fields reported as absent (carried from
  thiefhall): exile / systemArrived absent on
  pre-evening rows read falsy in the gate, same as
  false; the gate reproduction (T3) is unaffected,
  but "absent" is not "measured false".
- Tap-day vs game-day (carried): tap days are harness
  days; game day is published per tap day in the
  corpus.
- Ownership refusal's cost shape differs from the hall
  refusal's, and neither is the precheck's business in
  the same way: the confirm ownership row paid +5
  ticks and 0 kcal (pantry unchanged), versus +5 / -120
  for hall refusals and successes alike. The 0-kcal
  shape plus the harness-only button read (real bar
  lists owned abilities only) marks it as an instrument
  confound to record, not a player-facing refusal class
  to precheck — a future precheck arm must not chase
  it as a button bug.
- Confirm determinism, stated so the analyzer field
  cannot be misread: the confirm analyzer's
  determinism.allMatch=false is the expected value for
  fresh seeds (no thiefhall rows to compare against),
  not a failed check. Determinism is proven on the
  pilot band (proof T7, 8/8 first tap days identical
  to thiefhall); the confirm band's reproducibility
  rests on the same seeded harness and the same
  instrument, not on a cross-corpus comparison that
  cannot exist for new seeds.

## Proof

- `node scripts/test-thiefinside-b.js` — PROOF-GREEN
  (legs T1–T8; corpus completeness, verdict numbers,
  gate reproduction 0 mismatches pre + at-tap, entry
  honesty, copy-not-modified, no src/ changes,
  determinism 8/8 first tap days identical to
  thiefhall, already-inside chain).
- Confirm check: `node
  scripts/test-thiefinside-confirm-b.js` —
  CONFIRM-PROOF-GREEN (legs C1–C4, C6, C8; 16 files,
  80 tap days, seed success 16/16, gate reproduction
  0 mismatches, entry honesty, no src/ changes).
- Trace: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 node scripts/thiefinside-trace-b.js` —
  8 pilot files, exit 0, corpus
  evidence/2026-10-28/sim-thiefinside-b-corpus/,
  analysis evidence/2026-10-28/sim-thiefinside-b-analysis.json.
  Wall-clock ~100s for 8 instances.
- Confirm trace: same command with SEEDS=10050–10065
  and OUTDIR=evidence/2026-10-28/sim-thiefinside-b-confirm-corpus/
  — 16 files, exit 0, analysis
  evidence/2026-10-28/sim-thiefinside-b-confirm-analysis.json.
  Wall-clock ~140s for 16 instances.
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible.
  Zero src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] DOM-tap entry for the lodge: a browser
  playtest tapping the lodge card's 'Go inside' button
  on a phone, then tapping Light Fingers, is the
  remaining step to call the inside evening fully
  played. Node proves the handler route + genuine
  thief tap; only the DOM card tap is unproven.
  (sim-thiefinside-b)
- [follow-up] thief precheck (specified next arm):
  §2-style pre-payment precheck for thief.steal_pantry
  — gate-only vs gate+empty+heavy scope, button why
  wording, and whether thief deserves a precheck at
  all are Steve's calls (see design question above);
  the next arm preregisters one scope and proves it.
  (sim-thiefinside-b)
- [follow-up] competent evenings end outside: on this
  band, competent.daily exits the hall every day, so
  no evening ever starts inside. A policy whose
  evenings end inside would change every inside-gated
  tap's reachability — same class as thiefhall's
  note, now with the inside evening demonstrated as
  the manual route. (sim-thiefinside-b)

## Convergence line

thiefinside-evening — inside-evening demonstration
(MEASUREMENT ONLY, zero src/js): button-handler entry
(adjacency + 'Go inside' button + handler dispatch)
plus genuine thief tap opens the gate on 36/36
completed pilot evenings, seeds 10040–10047, 2 lead +
5 tap days: 8/8 seeds reach the inside tap (bar
>= 6/8), access 'inside' on 36/36 inside taps, 18
clean / 18 caught, 0 hall refusals from inside, 400
kcal per lift, tap-only +5 ticks / -120 kcal; 4 away
days (seed 10041) not attempted, enumerated; proof
PROOF-GREEN. DOM-tap entry remains unproven (browser
follow-up); thief precheck is a specified next arm
with Steve's calls named, not landed. Confirm:
CONFIRM-GO (16/16 seeds, 73 inside taps, 42 clean /
30 caught / 1 ownership refusal, 0 hall refusals from
inside, confirm proof CONFIRM-PROOF-GREEN).

## Verdict (judged against the pre-registered bar, not re-scored): GO (button-handler route + genuine thief tap; DOM-tap entry unproven)
