# sim-thiefhall-b — the thief hall gate, named and traced

Run: oversight-flesh-out-loop-b, arm sim-thiefhall-b.
DIAGNOSIS ONLY: zero src/js changes, zero default flips.
Follow-up to sim-spandraw-playpath-b (thief.steal_pantry
attempted 37/37, hall-refused 37/37). This arm answers the
follow-up's exact question: does a competent played position
ever open hall stores in the first week?

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-thiefhall-b-prereg.md, committed as dc36600e BEFORE any judged trace run)

**DIAG-GO — gate named AND reachability determined by
exhaustive negative.** The gate is named below with code
sites, the gate function reproduces all 40 traced access
values with zero mismatches, and every played tap day's
access is 'none' with positions enumerated. No played
position in this band opens the gate; that is a documented
reachability finding, not a failure to try harder — no
src/js change is authorized in this arm, and none was made.

## The gate, named

`havenStoresAccess()` — src/js/game.js:11542-11562. In
order: exile -> 'none'; `scholar.insideHaven` AND
`playerTile().type === 'haven'` -> 'inside';
`integrationStage() >= 3` -> 'remote'; otherwise 'none'.

So the gate is a **conjunctive position gate: the inside
flag AND the haven tile, both at once** — with an exile
hard-override to 'none' and a late-game remote fallback.
It is NOT a day gate, NOT a pantry-state gate, and NOT
the `playerAtHaven()` map-distance test (within 1 of the
village node): 35 tap days were "at the haven" in that
sense and still 'none', because they stood on the haven
tile OUTSIDE the hall.

The thief impl — src/js/abilityActions.js:1797-1801 —
checks the gate FIRST, before the pantry scan, the
weight check, and the 50% caught/clean roll. A 'none'
tap never reaches pantry content at all.

The position transitions (code-read, consistent with the
trace): spawn sets `insideHaven = true` (game.js:2730);
`exitBuilding()` sets it false and lands the player on
the haven grounds; `enterBuilding()` sets it true ONLY
from the haven node (refuses elsewhere);
`travelTo()` arriving anywhere sets it false
("Arriving at Haven puts you on the grounds — tap the
lodge to go back inside", game.js:12351).

## The trace (8 seeds 10040–10047, thief only, 2 lead + 5 tap days, competent-nofeast substrate)

- Instances: 8/8 survived, 40/40 tap days recorded, 0
  skipped, 0 game-over. Attempted 37, button-refused 3
  (all hunger: "Running on empty — eat first.
  (Abilities need 500+ kcal.)", all on seed 10041).
- Access: **40/40 'none'** — before the tap on all 40,
  and after the tap on all 37 attempted taps (the 3
  button-refused taps issue no tap, so no access-after
  exists for them by construction; their access-before
  is recorded).
- Position enumeration (the exhaustive negative):
  - haven tile, OUTSIDE the hall: **35/40** (map 4,4,
    insideHaven false, grounds detail cells mx/my
    4,0 / 8,0 / 8,1 / 0,0 / 0,1 / 7,0 / 8,8 — never
    the hall interior 4,4 or the enterBuilding landing
    4,7). These are the tap days the playpath arm
    described as "at the haven": atHaven true on all
    35, access 'none' on all 35. The haven tile alone
    does not open the gate; the inside flag is the
    missing conjunct, and competent evenings never set it.
  - off the haven tile, outside: **5/40** — seed 10041
    tap days 4–7 on forest_floor at map 1,3 (the
    evening found the player away from home, then
    hungry), and seed 10042 tap day 7 on trail_edge
    at map 4,1.
  - inside the hall: **0/40**. No competent tap day in
    this band ever stood inside at tap time.
- Gate components, all 40 tap days: exile never true
  (the field is absent on 40/40, which reads falsy in
  the gate — same as false, stated plainly rather
  than claimed as a measured false); integration
  stage 0 on 40/40, `systemArrived` absent on 40/40
  (pre-Day 7 the System does not exist yet, so the
  'remote' branch is unreachable in-band, as the
  prereg predicted); pantry never empty (2–6 stacks,
  17,642–33,500 kcal — 'none' is not an empty-pantry
  artifact); granted thief ability owned on 40/40
  (no ownership-loss confound in this trace, unlike
  the playpath arm's late taps on other keys).
- Gate reproduction: the gate function as read from
  code, applied to each row's traced components,
  predicts that row's access value on **40/40 rows,
  0 mismatches** (proof leg T3). The named gate is not
  a guess fitted to the outcome; it is the code's own
  rule, confirmed against every observation.
- Tap outcomes: 37 attempted taps, **37 hall-refused
  with the verbatim line** ("The pantry is in the
  hall. Your hands are not. (Light Fingers)"),
  **0 successes**. The playpath arm's 37/37 is
  reproduced exactly on the identical substrate — the
  trace band and the playpath band agree to the tap.

## The paid refusal (found in the trace, documented not fixed)

Every attempted tap paid before it refused: **+5 ticks
and −120 kcal on all 37**, uniformly. The button read
ok (thief has no entry in ABILITY_ACTION_PRECHECKS —
the landed world-state prechecks in canon
docs/ABILITY-REFUSALS.md §2 cover challenge,
end_it_before, and trophy, not thief), the tap issued
through the UI dispatcher, the cost was taken, and
only then did the impl refuse on the hall gate. That
is the canon §1 post-payment refusal class: a refusal
the game only discovers after payment, narrated as a
cost. A player tapping Light Fingers from any position
competent evenings reach therefore spends an evening
tap's time and food and learns only that their hands
are not in the hall — while the button, which carries
no why on an enabled row, gave no warning. Whether
thief deserves a §2-style precheck (refuse before
payment, like challenge) is a design question for a
future arm, NOT a change made here: diagnosis only.

## Sense-testing (read end-to-end, judged on meaning)

Seed 10040, tap day 3 (game day 4, ticks 5, part 0):
the previous daily crossed midnight, so the "evening"
tap lands at dawn on the haven grounds (map 4,4,
mx 4,my 0, inside false, pantry 3 stacks / 31,600
kcal, player at 1,010 kcal). The tap fires and the
game answers in its own voice: "The pantry is in
the hall. Your hands are not. (Light Fingers)" —
and the tap has cost 5 ticks and 120 kcal. Seed
10044, tap day 4 (ticks 470, part 3, the latest tap
in the band): same grounds position, same line, same
cost. Seed 10041, tap day 4 (map 1,3, forest_floor,
ticks 433): the player is a day's walk from home
and the same line answers — correctly, since the
pantry is not there at all.

Judgment: the refusal reads as a **sensible rule
stated to a player in the wrong place** — the
sentence is literally true on all 35 haven-tile days
(the player IS outside the hall) — but as a played
outcome it reads as a **missing position the
competent evening never offers**, not as a thief
failing at thieving. Nothing in the evening's play
ever steps back inside the hall before the tap, and
nothing in the tap's own surface suggests doing so:
the button is enabled, the pantry is full and
visible in the ledger sense, and the refusal arrives
only after payment. The game DOES offer the position
in principle — `enterBuilding()` from the haven node
is an honest player verb ("tap the lodge to go back
inside"), and on the 35 haven-tile days a human who
stepped inside first would pass the gate per the
code — but this arm did NOT demonstrate that, because
no competent played tap day ever occupied the
position, and manufacturing it by steering is
forbidden by the prereg. The demonstrated claim is
narrow and exact: competent played evenings never
open the gate. The human-step-inside-first claim is
code-read only, and is the natural next arm under
its own prereg.

## Village assessment (plain words, within what 7-day instances can say)

These are not lived villages — each instance is one
village played for 7 harness days, tapped on the last
5. What they show, repeated 8 times, is a village
whose evenings end on the haven grounds: the player
comes home, stands on the grounds among tents and
the fire pit, and reaches for the pantry with
magician's hands — and the hall door stays shut
because nobody walked through it. The pantry itself
is never the problem (17,000–33,000 kcal on every
tap day); the hands are never the problem (the
granted ability survives all 40 tap days); the
position is the whole story. One village (10041)
spent its last evenings away from home and hungry —
its last three taps never even left the button,
honestly refused for want of food — and still the
gate read 'none' on those days too, because a
button refusal is not a gate observation gap: the
trace records access on refused days as well.
Blanks filled: (1) the gate named with code sites
and reproduced against every observation; (2) the
exhaustive negative over competent played positions
(35 haven-grounds days, 5 away days, 0 inside days);
(3) the paid-refusal shape of the thief tap (button
ok, +5 ticks, −120 kcal, then the hall line).
Documented, not fixed: the missing thief precheck;
the human-step-inside-first reachability question
(code-read only, next arm's prereg).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

This trace has NO before/after game leg: zero game
changes, zero lever variants, nothing to panel. Panel
metrics (national/table/wins) do not exist for 7-day
instances and are not estimated. So NO balance-panel
compare .md is produced for this arm, as pre-registered.

## Metric review (MEASUREMENT.md §14)

- Trace scope, stated plainly: the trace proves
  TAP-TIME positions only. It does not track the
  player's position through the whole day, so it
  cannot say whether competent play ever steps
  inside mid-day (the code's enter/exit pairs net
  outside, but whether they fired in this band is
  not measured here). The verdict claims only what
  the trace shows: at tap time, inside was false
  on 40/40.
- Absent fields are reported as absent, not as
  false: `exiled` absent 40/40, `systemArrived`
  absent 40/40, village `px/py` absent (the
  playerAtHaven default 4,4 applies). The gate
  treats absent as falsy, so the gate reproduction
  (T3) is unaffected — but a reader should not
  mistake "field absent" for "measured false".
- Instrument incident, disclosed: the first trace
  run wrote its 8 files into the playpath corpus
  directory (the OUTDIR edit missed the
  comma-separated path segment; the header comment
  was fixed but the code constant was not). The
  files were held aside, the constant fixed, the
  band re-run, and the re-run proved BYTE-IDENTICAL
  to the first run on all 8 files; the strays were
  then deleted from the playpath corpus and the
  playpath corpus verified unmodified (git status
  shows no change there). The judged corpus is the
  re-run in evidence/2026-10-28/sim-thiefhall-b-corpus/.
  No number in this file comes from the stray run
  except through that byte-identical re-run.
- Tap-day vs game-day (carried from playpath): tap
  days are harness days; a daily crossing midnight
  puts two harness tap days on one game day (e.g.
  seed 10040 tap days 3–4 share game day 4). Game
  day is published per tap day in the corpus.
- The −120 kcal tap cost is measured, not explained:
  the data cost for steal_pantry is time only
  (time_min 10 → 5 ticks); the 120 kcal moved with
  the tap on all 37 attempted taps, uniformly. The
  mechanism of that 120 (useAbility cost handling
  vs tick metabolism) was not traced and is not
  claimed here — only that the refused tap was not
  free.

## Proof

- `node scripts/test-thiefhall-b.js` — 22/22 checks
  across legs T1–T7, exit 0, verdict PROOF-GREEN
  (corpus completeness, exhaustive negative, gate
  reproduction 40/40, no confounds, copy-not-modified,
  paid refusal, button-refused access carried).
- Trace: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 node scripts/thiefhall-trace-b.js` —
  8 files, exit 0, corpus
  evidence/2026-10-28/sim-thiefhall-b-corpus/,
  analysis evidence/2026-10-28/sim-thiefhall-b-analysis.json.
  Wall-clock ~30s for 8 instances; re-run
  byte-identical (see metric review).
- No jest (proofs are node, not jest). No [needs-eyes]:
  measurement/tooling only, nothing player-visible.
  Zero src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] human-step-inside-first: on haven-node
  tap days a human who enters the hall (enterBuilding,
  honest player verb) before tapping would pass the
  gate per code (inside + haven tile, pantry
  non-empty). NOT demonstrated here — needs its own
  prereg and its own instrument (a played "go inside,
  then tap" evening, not a steered position).
  (sim-thiefhall-b)
- [follow-up] thief precheck gap: thief.steal_pantry
  has no ABILITY_ACTION_PRECHECKS entry, so its hall
  refusal is post-payment (+5 ticks, −120 kcal) while
  challenge / end_it_before / trophy refuse before
  payment under canon §2. Whether thief deserves
  the same precheck is a design question, not a
  measurement tweak. (sim-thiefhall-b)
- [follow-up] competent evenings never end inside:
  competent.daily's trips end with travelTo home
  (grounds, inside false) and its enter/exit pairs
  net outside, so evening taps — including any
  future inside-gated ability — always read from the
  grounds. A policy whose evenings end inside would
  change every inside-gated tap's reachability, and
  needs its own prereg. (sim-thiefhall-b)

## Convergence line

thiefhall-gate — hall-gate diagnosis (DIAGNOSIS ONLY,
zero src/js): gate named (havenStoresAccess,
game.js:11542 — insideHaven AND haven tile, exile
override, stage-3 remote fallback) and reproduced
40/40 against the trace; exhaustive negative over
seeds 10040–10047, 2 lead + 5 tap days: 40/40 tap
days access 'none' (35 haven-grounds days, 5 away
days, 0 inside days), 37 attempted taps all
hall-refused at +5 ticks / −120 kcal paid, 0
successes, pantry never empty, stage 0 throughout.
Competent played evenings never open the gate;
human-step-inside-first reachability is code-read
only, not demonstrated. Proof 22/22 PROOF-GREEN.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-GO (exhaustive negative)
