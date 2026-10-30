# sim-woodshort-ledger-b — evidence (wood-short ledger route, backlog #1456 still-open sub-item)

Verdict: **INSUFFICIENT-DATA on the pinned base** — judged ONLY
against the base-pinning prereg bars in
`evidence/2026-10-30/sim-woodshort-ledger-b-prereg.md`
(committed as bea283ad7, BEFORE any judged leg). The ONE
staged route (stranded-night campfire) never acted on the
bank, so no wood-short creek evening was staged, no tail
was sense-tested, and no bar was lowered, re-scored, or
faked. The diagnosis below is the result: it sharpens the
"unplayable" question into its honest form — the line is
unplayed because the BOT never spends pack wood, not
because the GAME cannot produce wood-short — and it names
the exact trigger miss for the next prereg. No src/js
change, no policy-default change — measurement only.

## Base pin and what was run

- PINNED BASE: ff6bf0e04fecd10fab2aa2807a99b9003e8cd9e2
  (worktree HEAD at prereg writing time). The prereg
  commit added only the prereg file, and the final
  tracked diff vs the pin for `src/` is EMPTY and for
  tracked files under `scripts/policies/` is EMPTY —
  the legs ran on pinned-base game code verbatim. The
  only policy addition is the NEW measurement wrapper
  `scripts/policies/campfire.js` (no existing policy
  touched). New files are measurement scripts +
  evidence + corpora only.
- PILOT (instrument validation, part of the bank):
  seeds 15003, 15215, ON+c camp, 30 loop-days.
  Instrument valid (errs 0, camp records present with
  the full field set, evening loopDay sequences intact
  — no day-rollover inside the camp step). The pilot
  also surfaced the run's key finding early (all 3
  pilot still-refused evenings missed the camp
  trigger on no-raw-food); the trigger was NOT
  widened mid-run — widening the camp purpose is a
  next-prereg question, forbidden in this run's
  prereg, and the bank ran as pre-registered.
- BANK — JUDGED ON+c camp LEGS: all 10 qualifier
  seeds from the woodshort 500-seed screen, in screen
  order (15003, 15009, 15091, 15211, 15215, 15220,
  15221, 15337, 15376, 15439), 30 loop-days each,
  driver scripts/woodshort-ledger-trace-b.js, env
  POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
  CAMPFIRE=1. All 10 survived the 30 days.
- OFF GUARD LEGS: same 10 seeds, WOODCARRY=0
  CAMPFIRE=0, for the guard only (not re-screened,
  not judged for wood-short).
- DIAGNOSTIC PROBE (not a judged leg):
  scripts/probe-woodshort-ledger-b.js, seed 15215,
  same policy chain, dumping the stranded player's
  pack on still-refused creek evenings. Its output
  explains the trigger miss (see below) and is
  diagnosis only — no judged count comes from it.
  (Probe note: runDays silences console output
  inside the day loop via quietLog, so the probe
  collects rows in memory and prints after the run;
  the first probe version printed nothing for exactly
  this reason, and the fix is recorded here so the
  next probe author doesn't re-learn it.)

## Code-led route survey (the prereg's survey, confirmed by the legs)

Pack-wood spenders in the engine (code reads, no legs):
buildBridge spends exactly 4 logs; makeFire/feedFire
spend exactly 1 log, only on success, only when the
player holds fewer than 2 branches; buildFoundShelter
is exile-only; dropItem is voluntary discard and was
refused as a route (staging, not play). NO engine
mechanism spends pack wood without a deliberate
player action — no auto-burn, no pack theft, no
combat item loss, no NPC taking. And the bot never
takes any of those actions: competent.js walkTo
BREAKS at a refused step instead of building, and
cookPack cooks only near an existing fire. So under
competent+nighttravel, pack wood can never fall
below 4 during a day — the 52-evening all-4 record
(plus this run's 15) is structural, not bad luck.
"Unplayable-by-construction" is therefore FALSE
about the game (spend verbs exist) and TRUE about
the bot policy (no spend behavior exists). CLOSE-
AS-UNPLAYABLE was not an available verdict on this
run's own terms, and it is not claimed.

## ON census (10-seed bank, pinned base)

Committed record:
`evidence/2026-10-30/sim-woodshort-ledger-b-census.json`
(analyzer: scripts/analyze-woodshort-ledger-b.js).

- ON creek evenings: 15. Still-refused: 4.
  Rescued: 11. This reproduces the woodshort ON
  census EXACTLY (15/4/11, same skips) — expected,
  and itself a check: because the campfire never
  acted, ON+c camp trajectories equal ON
  trajectories bit for bit in shape.
- Still-refused skip breakdown: kcal-short 3,
  ticks-short 1, wood-short 0, build-refused 0,
  retry-refused 0.
- Still-refused evenings, in screen order:
  - 15009 day 13 kcal-short (wood 4, kcal 24,
    ticks 127);
  - 15215 day 7 ticks-short (wood 4, kcal 2254,
    ticks 47);
  - 15215 day 8 kcal-short (wood 4, kcal 0,
    ticks 239);
  - 15215 day 9 kcal-short (wood 4, kcal 0,
    ticks 109).
- Wood: every evening woodPlayer = 4 — exactly at
  the 4-log floor, never below, never above. Now
  67 consecutive ON creek evenings across five
  bands, all wood 4 (52 before this run + 15 here).
- Campfire trigger: 300 evening records, acted 0,
  log-spent 0, fire-failed 0. Miss reasons:
  not-creek-refused 285, rescued 11,
  branches-available 1, no-raw-food 3.
  The 4 still-refused evenings account for the
  last two buckets exactly: 15009 day 13 missed
  on branches-available (2 branches held — a
  branch fire would have spent no log, so the
  policy correctly did not light); 15215 days
  7–9 missed on no-raw-food.

## Why no-raw-food is real, not a check bug (probe)

On seed 15215's three still-refused evenings, the
stranded player's pack held: a stick, a stone
knife, stones, a harmonica, 4 wood logs — and
food only as UNKNOWN shoots/berries (rawKcal null,
needsCooking false). No rawKcal item at all, so
even a rawKcal-only variant of the trigger would
have missed: the bot cooks what it knows during
the day and carries only unidentified forage it
cannot cook (knowledge-gating working as designed
— "if you don't know, it doesn't show" extends to
the cooking pot). Days 8–9 the player also holds
0 kcal: nothing to eat, let alone cook. The
cooking-purpose campfire therefore cannot stage on
this policy, on this bank, for a reason deeper
than the trigger wording: a competent bot's
stranded nights are foodless nights, not
cook-dinner nights. Note also the decision-order
detail: 15215 day 7 (47 ticks) would ALSO have
failed the ticks gate (47 < 48+40), but the
recorded miss is no-raw-food because the gate
checks food before ticks — the evidence names
both failures for that evening.

## Pile ledger (secondary, no bar)

- Haven mornings with pile recorded: 263.
  Pile day 1: 10 on all 10 seeds (as before).
- Min pile on haven mornings, days 2+: 8
  (15211 day 7) — but that morning's skip is
  already-carrying (pack 4), so the floor never
  bound: the pile touched the floor VALUE once
  and never went below it on any recorded haven
  morning, and never on a morning when the pack
  needed logs.
- Pile-floor mornings after day 1: 0. The pile
  route stays closed on this bank, re-confirmed.
- The other side of the trap, worth stating
  plainly: on OFF legs the player holds 0 logs at
  creek refusals (60 OFF creek evenings, wood 0
  throughout — the player never took wood without
  the carry). The wood-short precondition exists
  abundantly OFF, but the line fires only ON —
  and ON, the carry tops the pack to 4. The lever
  that enables the line also removes its
  precondition. Any future staging must spend
  wood AFTER the morning carry, which is exactly
  what the campfire route attempted.

## Bars — judged, one by one

- PRIMARY ≥ 1 honestly-staged wood-short creek
  evening (camp log-spend night N, wood-short
  skip + live-count line night N+1) with a full
  tail read for sense: NO — 0 staged. The bar is
  not met, and the verdict stops here by the
  prereg's own terms. No lowering, no re-scoring,
  no substitution (no ticks/kcal evening was used
  as a wood-short stand-in, no rescued tail was
  read as a sense pass).
- CLOSE-AS-UNPLAYABLE: NOT AVAILABLE and NOT
  CLAIMED — the code survey proves spend verbs
  exist. What is closed, narrowly: "wood-short is
  unplayable under competent+nighttravel bot
  play" (no bot spend behavior; see Steve-call
  note).
- INSTRUMENT bars: recorder/classifier errs == 0
  on judged legs (wc errs 0, camp errs 0, OFF
  errs 0) — HOLDS. Determinism re-run of 15003
  ON+c camp byte-identical — YES (staging dir
  deleted; the proof script re-runs this check on
  every invocation). OFF guard: 300 OFF evenings,
  0 "No bridge" hits, 0 camp records — HOLDS.
- SENSE-TEST: NOT PERFORMED — no staged evening
  exists, so no played still-refused tail was read
  for sense. The probe pack dumps are diagnosis,
  not a sense pass. Recorded, not hidden.

## Village assessment (plain words)

The 10 banked villages all survived the 30 days,
on both legs — partly selection (villages that
lived long enough to get caught at a creek), but
within that frame they are working villages: wave 1
in 10/10, wave 2 in 10/10, waves 3–5 not reached
in this 30-day window. They kill steadily (68
wave-1 kills, 8 wave-2 kills over 30 days) and
they lose people along the way — 109 death-log
entries, the same count as the woodshort run
(identical trajectories: the campfire never acted,
so nothing downstream changed). The two
still-refused villages are the familiar shape:
15215 gets stranded on day 7 for want of time (47
ticks), then strands again days 8–9 for want of
food (0 kcal) — a village that gets caught out,
runs down, and still survives the month, carrying
unidentified berries it cannot cook and a
harmonica it cannot eat. 15009 strands once, on
day 13, for want of food (24 kcal) after holding
2 branches — branches enough for a fire, but no
dinner to cook over it.

What was missing, and what this run documents:
a playable wood-short evening, and now the
reason the campfire route cannot supply it under
this policy. The blank this run fills is the
ledger route itself, designed and tested rather
than asserted: a stranded-night fire is a real
play (spend verbs exist, the decision point is
genuine, the signature was crisp) — but the bot's
stranded nights are foodless, so the cooking
purpose never triggers. What is still missing is
a bot that spends wood (bridge-building on a
blocked day walk, or fire for warmth on a
stranded night), or acceptance of the line
variant as unplayed-but-harmless. The next
prereg must argue one of those, not re-run this
trigger.

Wall numbers: NOT OBSERVABLE on 30-day evening
legs (pre-seat, no field). National / table /
wins are reported as NOT OBSERVABLE, never as
zeros. No national, table, or win claim is made
or implied by this run. Wave reach on the banked
band: wave 1 in 10/10 villages, wave 2 in 10/10,
waves 3–5 not reached in this 30-day window.
Median survival is 30 days (all 10 survived the
window, both legs) — a ceiling effect of the short
window and the banking selection, not a survival
claim.

## Steve-call note (for the coordinator's report)

Wood-short is unplayable under competent+
nighttravel bot play, and the reason is now
measured, not guessed: the bot never spends pack
wood (no bridge builds, no field fires), and its
stranded nights carry no cookable food, so even
an honest campfire staging cannot fire. The game
itself CAN produce wood-short (build a bridge
mid-day, or burn a log in a field fire, then face
a creek at nightfall — both are engine verbs a
real player has). The open question for Steve is
not about the line text (unit-proven, harmless):
should the bot learn a wood-spending behavior —
building a bridge when its day walk is blocked by
a creek, or lighting a fire for warmth on a
stranded night — or should the wood-short variant
stand as an unplayed line for real players only?
No design ruling is assumed here; the next prereg
argues one of those two paths.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- Minimum-n 1 for existence, kept — and NOT met:
  0 staged evenings. No lowering, no re-scoring,
  no substitution.
- The campfire trigger, judged as designed: the
  cooking purpose is the binding constraint, and
  it binds for a game reason (knowledge-gated
  forage cannot be cooked; the bot cooks known
  food during the day). The next prereg's honest
  options, in order: (a) fire for warmth on a
  stranded night — a real player behavior
  (temperature, the stranded night itself) that
  needs no food in the pack, but it must be
  argued as a purpose change, with its own
  trigger (cold/stranded-night conditions) and
  its own predicted signature, not smuggled in as
  a widened cooking check; (b) the daytime
  bridge-spend route with a mid-day policy design
  (the current blocker is competent.daily being
  monolithic — walkTo's refused step is inside
  it, and wrapping Game.travelTo would catch the
  judged evening hop too). What the next prereg
  must NOT do is drop the cooking purpose
  silently, light fires on non-stranded nights, or
  spend via dropItem.
- The pile ledger check, keep it: recording
  pileBefore on haven mornings is what lets this
  run re-confirm the pile route closed (min 8 on
  a full-pack morning) instead of merely counting
  zeros.
- The OFF-wood-0 observation, keep it in view:
  the line's precondition is abundant OFF and
  absent ON by construction of the carry. Any
  future route design should start from "spend
  after the morning carry," not from "find a
  morning the carry refuses."
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side behavior with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the
  pre-registered bars above are the judge.

## Proof

`scripts/test-woodshort-ledger-b.js` — all
checks green: campDecision unit gate (act case +
all 9 miss reasons); ON census recomputation (15
creek / 4 still / 11 rescued, skip kcal 3 /
ticks 1, wood 4 on all 15, camp acted 0 /
log-spent 0, misses 285 / 11 / 1 / 3, staged 0,
pile min 8 / pile-floor-after-day-1 0); OFF guard
(300 evenings, errs 0, 0 lever lines, 0 camp
acted); determinism (15003 ON+c camp re-run
byte-identical, staging dir deleted). Run:
`node scripts/test-woodshort-ledger-b.js`.

## Landing

- Prereg: already committed (bea283ad7), not
  recommitted.
- This commit: campfire policy
  (scripts/policies/campfire.js), driver
  (scripts/woodshort-ledger-trace-b.js), analyzer
  (scripts/analyze-woodshort-ledger-b.js),
  diagnostic probe (scripts/probe-woodshort-
  ledger-b.js), census JSON, ON corpora (10
  files), OFF corpora (10 files), evidence file
  (this file), proof script
  (scripts/test-woodshort-ledger-b.js).
- Measurement only: no src/js change, no
  policy-default change, no wording change. No
  [needs-eyes]: no line was played, so no wording
  is judged.
- Report: committed, pending coordinator merge.
  Verdict INSUFFICIENT-DATA on pinned base
  ff6bf0e0, 0 staged wood-short creek evenings on
  a 10-seed bank (camp acted 0/300 evenings: 3
  still-refused nights foodless, 1 branch-rich),
  with the bot-spend diagnosis and Steve-call note
  above.
