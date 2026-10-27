# Seat-taker choice + seat-varying scenarios — Triage A6 (gap-seattaker)

Steve's ruling, 2026-10-26, item 495, two parts:
1. Path choice is player-only — no villager ever chooses the village's path.
2. Seat-taker choice — the player chooses who takes the seat: their own
   player character, or another villager, and plays out the scenario as
   that villager (normal seat, trial-by-combat, and so on).
Champion and god-raising are PHILOSOPHY LABELS (the village is the
protagonist; villagers can achieve like the player). They are NOT new
systems. This work builds no champion system and no god-raising system.

Standing principle, Steve 2026-10-27: the table must NOT be a forgone
conclusion — reaching the end must take skill most of the time. This
design honors it: the seat itself still has to be earned (full or lesser
seat, priced exactly as before), every path still has to be earned, and
every challenge still plays with the same meters and the same failure
rules. Choosing a different sitter changes whose story the beats tell
and whose standing colors them — it never waives a price, a meter, or a
failure. A weak sitter gets no free win; a strong sitter gets no free pass.

## 1. Still-open verdict (verified on current worktree HEAD a70555396)

- No seat-taker code exists anywhere in `src/js/`: zero hits for
  `seatTaker`, `SeatTaker`, `seat-taker`, `chooseSeat`, or a sitter
  concept (the only "sitters" hit is a System joke line in game.js).
- `tableTakeSeat()` (table.js) today goes straight to `tableScene()`,
  which locks the seat and offers the seven doors. The sitter is
  implicitly always the player character (`Game.villagerId`).
- Ascended villagers today only add +10 path strength each (capped at
  100, in `tableEarnedPaths`) and get voiced in the audit
  (`tableScene`). They play nothing: every path beat says "you" and
  means the player character.
- Path choice today is already player-only in code: the only caller of
  `tableStartPath` is `chooseTableOption` (the player's modal choice),
  plus telemetry/feel wraps that observe it but never call it. No
  villager code path starts a path. Part (1) is therefore already true
  in code; this work keeps it true and proves it, rather than changing it.
- Loop A 1430Z arm `sim-fullseatfixture-a` owns these files and was NOT
  touched: `scripts/policies/fullseat-diag.js`,
  `scripts/test-fullseat-diag-20261021.js`,
  `scripts/test-fullseatfixture-a.js`,
  `evidence/2026-10-27/sim-fullseatfixture-a*.md`.
- NOT touched, per the task limits: the stage bar (TABLE.md says stage
  >= 3, code enforces >= 2 — still awaiting Steve's word), group C and
  group D items, Loop B / Loop A 1315Z work, and any other worker's area.

## 2. Design (written before building)

### Where the choice sits

The choice fires at the exact moment the seat is taken, and nowhere
else. Flow, in plain words:

1. The player has earned a seat (full or lesser — `tableSeat()` says so)
   and the table has been announced. The Haven panel shows the seat
   button, as today.
2. The player taps the seat button. BEFORE the sitting locks anything,
   the same table sheet asks one question: "Who takes the seat?"
   Options: "Sit yourself" plus one option per eligible villager
   ("Send <name> to the seat").
3. The player picks. That pick is recorded on the sitting
   (`pg.table.seatTaker = {id, name, self}`) and said aloud ("<name>
   takes the seat..."). Only then does `tableScene()` run: the audit,
   the locked ending key, and the seven doors, exactly as today.
4. The player then picks a path, as today — player-only, unchanged.
   The sitter's scenario plays; the path is still the player's choice.

Refinement before building (2026-10-27, pre-build, before any proof
run): the Haven button is the choice point, via a new
`tableOfferSeatTaker()` entry — NOT by changing `tableTakeSeat()`.
Reason, found while reading the existing tests: `tableTakeSeat()` is
also the programmatic/committed seat call (debug scenes, the tablesit
bot policy, and `test-table-entry.js` all rely on "take seat commits
the doors at once"), and changing it would rewire those flows for no
player benefit. The player-facing choice is identical either way: the
Haven button — the only way a human player takes a seat — offers the
choice first. `tableTakeSeat()` keeps its contract: it sits with a
previously chosen sitter if one was chosen, otherwise with the player
character (the unchanged default). A bot or debug flow that calls
`tableTakeSeat()` directly therefore still sits as the player
character, exactly as today.

Rules that keep the choice honest:

- Eligibility: a villager can sit if they are alive, present (not away),
  and not the player character. Dead villagers can never sit (the same
  liveness rule as ascension). The player character is always an option.
- The choice fires only on an earned seat: `tableTakeSeat()` still
  requires a live `tablePreview()` first, so an unearned or withdrawn
  seat never reaches the question. No seat, no choice.
- The choice locks for the sitting: once the sitting has begun (the
  doors are offered or a challenge is running), the sitter cannot be
  swapped mid-sitting. A new sitting asks again.
- If a sitting starts without a choice (an older saved flow, a debug
  scene, a direct `tableScene()` call), the sitter defaults to the
  player character. Every existing flow therefore behaves exactly as
  before — self-pick is the unchanged default, not a new behavior.
- No villager ever chooses the path: the sitter choice sets only WHO
  sits. It never sets a path, never starts a challenge, and never
  touches the earned-paths list. After the sitter is chosen, the table
  is still in its "choose a door" state with no path chosen until the
  player picks one.
- The ending key stays the village's build (locked at sitting, as
  TABLE.md requires). The sitter varies the beats, not the key. A
  sitter-specific ending key is remainder work, not part of this slice.
- Trial-by-combat guard (Feared path): a villager sitter cannot
  currently fight the table's champion as themselves — the trial fight
  is staged for the player character. If a villager sitter demands the
  champion, the table says so plainly, withdraws the trial door for
  that walk, and the calibration continues without it (the same
  honest-withdrawal pattern the Feared path already uses when the
  champion does not come). No silent substitution, no bearer fighting
  in the sitter's name. A real sitter trial fight is remainder work.

### How the scenario varies by seat — the general rule

The SAME path scenario, with beats varying by seat. Every path keeps
its beats, its choices, its meters, and its failure rules. What varies
is: who the beats are about, whose standing the table names, and whose
story the witnesses and the table address. The sitter's own standing
feeds the beats through the existing ascension score
(`villagerAscensionScore`: System abilities held, knowledge taught,
notability, boldness, village trust, relay held) — read, never
invented, and named only when the score's own notes say it.

### Worked example: the Witness path (one path, fully varied)

The Witness path is the right worked example because its whole trial
already turns on WHO is being judged: the defense argues the person in
the seat. Three concrete seat variations, all played (choices, meters,
and failure rules unchanged):

- V1 — Opening charges, read by the sitter. When a villager sits, the
  opening beat names the sitter as the reader ("<name> reads the
  charges") and, when the sitter's ascension notes say so, names what
  the village knows them for (bold, trusted, relay-holder, taught and
  teaching). When the player sits, the opening is byte-identical to
  today's text.
- V2 — The defense argues the sitter. The defense beat's framing
  changes from "it argues *you*" to "it argues <sitter name>", and the
  two witnesses are drawn from villagers OTHER than the sitter (a
  sitter cannot testify about themselves). Their testimony lines are
  the same honest lines, now plainly about the sitter in the seat.
  When the player sits, witness selection and framing are unchanged.
- V3 — The final beat addresses the sitter. The light settlement
  offer ("NAME YOUR TERMS") and the dark chant (the gavel) are spoken
  to the sitter by name. The choices, the swing meter, and the
  convict-mid-trial tripwire are unchanged.

Self-pick regression rule: when the player picks themselves, every
varied beat returns exactly today's text. The proof asserts this by
comparing self-pick beat text against the pre-change text.

### Remainder (documented, not half-built)

- Seat-varying beats for the other six paths (same rule, per path).
- Sitter naming in path finals and in the shared epilogue (today's
  epilogue says the player character walks out alone).
- A real trial-by-combat fight for a villager sitter (Feared path).
- A sitter-specific ending key (today the key stays the village's).
- A phone-screen check of the seat-taker sheet (node proof only in
  this slice; the sheet reuses the existing table sheet, so no new
  UI surface is introduced).

## 3. Pre-registered bars (written BEFORE building; a miss is NO-GO)

Primary metric: the seat-taker slice works end to end on a full-seat
approach in the node harness — choice fires, sitter scenario plays
with the worked-example variations, self-pick unchanged, no villager
ever chooses a path.

GO thresholds (all must pass; no re-scoring after the run):
- G1 Choice fires: on a full-seat approach, the Haven seat button
  (via `tableOfferSeatTaker()`, the button's real handler) offers a
  seat-taker choice (player character + every eligible villager,
  dead villagers excluded) instead of sitting immediately, and the
  chosen sitter is recorded before the doors are offered. A direct
  `tableTakeSeat()` call without a prior choice still sits as the
  player character, as today (see the pre-build refinement above).
- G2 Sitter scenario plays: with a villager sitter, the Witness path
  plays all three beats with V1, V2, and V3 present (sitter-named
  opening, sitter-argued defense with witnesses excluding the sitter,
  sitter-addressed final beat); the swing meter and choices are
  unchanged in shape.
- G3 Self-pick unchanged: with the player character as sitter, the
  Witness beats are identical to the pre-change text, and the
  Feared-path trial still offers and stages as before.
- G4 Player-only path choice: after a sitter is chosen and before any
  player door pick, no path is chosen and no challenge is running;
  the only path-starting call in the flow is the player's door pick.
  No code path lets a villager start a path.
- G5 No champion/god-raising system: no new system, registry, or
  progression for champions or god-raising is introduced; the words
  appear only in comments explaining they are philosophy labels.
- G6 No regressions in the touched area: the existing table proof
  scripts that cover the seat, the Witness path, and the Feared trial
  still pass, and `node scripts/check.js --quick` is green (or any
  failure is shown to pre-date this change on the same checkout).

Seeds: 7 and 42 (the harness's usual pair), plus a full-seat fixture
built in the proof script itself (seat forced via the real
`deedGateReady` inputs where possible; where the harness cannot reach
a full seat naturally, the fixture sets the same deed/scale/stage
fields the real gate reads and the proof asserts the gate itself
reports full — the fixture never stubs `tableSeat`).

Policies: none — this is a table-flow proof, not a balance sim. No
balance numbers change: no path strength, meter, price, or failure
rule is altered by the sitter choice.

### Metric review (for the NEXT run; never re-scored here)

- Whether the sitter's ascension score should also move path
  strength (today: unchanged — ascension bonus already prices every
  ascended villager regardless of sitter).
- Whether a villager sitter should be gated on ascension standing
  (today: any living, present villager may sit — the skill bar is the
  earned seat and the failable challenge, not the sitter's resume).
- Whether the ending key should become sitter-specific (today: the
  village's build, per TABLE.md's lock-at-sitting rule).

## 4. Build

- `src/js/table.js`: seat-taker plumbing — `tableSeatTaker()`,
  `tableSeatTakerOptions()`, `tableChooseSeatTaker(id)`,
  `tableOfferSeatTaker()`; the seat-taker branch in
  `chooseTableOption` (a sitter choice sets only the sitter, never a
  path); the self default and the one-line sitter voicing in
  `tableScene`; `tableTakeSeat()` accepts an optional sitter id and
  otherwise keeps its old contract exactly.
- `src/js/table-witness.js`: the worked example — V1 sitter-read
  opening with ascension-note line, V2 defense argues the sitter with
  witnesses excluding the sitter, V3 final beat addressed to the
  sitter by name. Self-pick returns today's text unchanged in all
  three beats. Choices, swing meter, and the convict-mid-trial
  tripwire are untouched.
- `src/js/table-feared.js`: trial guard — a villager sitter's
  champion demand withdraws the trial aloud (TRIAL WITHHELD) and the
  calibration continues; the bearer never fights in a sitter's name.
- `src/js/app.js`: one line — the Haven seat button now calls
  `tableOfferSeatTaker()` (falling back to `tableTakeSeat()` if the
  method is absent). No new UI surface: the choice reuses the
  existing table sheet.
- `scripts/test-seattaker-gap.js`: the proof (new).
- No balance numbers changed: no path strength, meter, price, or
  failure rule moves with the sitter. No champion system, no
  god-raising system, no stage-bar change, no Loop A/B file touched.
- Commit(s): (to fill in at commit time)

## 5. Proof results

- Proof script: `scripts/test-seattaker-gap.js`, run once per seed
  (separate processes, as the harness requires), seeds 7 and 42.
  Full-seat fixture built from the real fields `deedGateReady()`
  reads (waves 5/5/4/3/2, 3 contests, 3 crises, stage 3 via
  integration 80, food-thesis deeds, `nationalLive`); the proof
  asserts the real gate reports full — `tableSeat` is never stubbed.
  `Game.save` is never stubbed (only the test's localStorage
  environment is provided, as in `test-table-entry.js`).
- Seed 7: 42 passed, 0 failed. Seed 42: 42 passed, 0 failed.
- G1 PASS: the real Haven button handler (extracted from app.js, not
  re-implemented) offers self + every eligible villager; dead and
  away villagers are excluded; the sitter is recorded before the
  doors are offered.
- G2 PASS: with a villager sitter, the Witness path plays all three
  beats with V1 (sitter reads the charges, standing notes named),
  V2 (defense argues the sitter, two witnesses, sitter excluded),
  V3 (settlement offered to the sitter by name), and reaches finals.
- G3 PASS: self-pick beats match the pre-change text in all three
  beats; no sitter line is added; direct `tableTakeSeat()` still
  commits the doors as the player character; the self Feared trial
  still stages a real fight.
- G4 PASS: after a sitter choice, path is null and phase is paths
  with only path options offered; the sitter cannot be swapped once
  the sitting begins; no code path maps a sitter to a path.
- G5 PASS: no `godRaising`, champion registry/system, or new
  `tableChampion` method in the changed table files.
- G6 PASS with two documented load/pre-existing caveats (neither is a
  code failure):
  `scripts/godpath/test-table-entry.js` 42/42;
  `scripts/test-table-endings-20261014.js` 61/61 standalone;
  `node scripts/check.js --only table --jobs 2`: 9 passed, 1 failed —
  the 1 failure is `test-table-endings-20261014.js` hitting check.js's
  120-second per-job timeout under heavy sibling load (its log tail
  shows only passing lines before the timeout; it passes 61/61
  standalone on this same checkout). Full `check.js --quick` was
  killed by the worker after ~19 minutes with no output yet: four
  sibling worktrees were running their own `--quick` checks at the
  same time, and this box was saturated — that is a load timeout, not
  a test result, and it is reported here rather than claimed as green.
  Exception: `scripts/test-table-witness-20261011.js` and
  `scripts/test-table-feared-20261011.js` fail on this checkout —
  and fail IDENTICALLY on the pristine base files (verified by
  checking out HEAD versions of the four changed files, running
  both tests, and restoring my files byte-identical by sha256).
  The cause is their 2026-10-11 harness (`head -90` script list and
  old init flow), not this change. They are pre-existing failures,
  recorded here, not waived silently.

## 6. Metric review notes from the run

- The sitter's ascension score is voiced (V1 notes) but does not
  move path strength — ascension bonus already prices every ascended
  villager regardless of sitter. Whether a sitter should move
  strength is a next-run question, not a change made here.
- Any living, present villager may sit; the skill bar is the earned
  seat plus the failable challenge, not the sitter's resume. Whether
  to gate sitters on standing is likewise a next-run question.
- The ending key stays the village's build. A sitter-specific key,
  sitter naming in finals/epilogue, seat-varying beats for the other
  six paths, and a real sitter trial fight remain remainder work
  (see §2). The phone-screen check of the seat-taker sheet is also
  remainder: the sheet reuses the existing table sheet, and this
  slice's proof is node-only.
