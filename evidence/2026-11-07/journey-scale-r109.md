# Journey-scale r109 — run note

Lane A leg 3 SCALE (days 80–140), run `laneA-20261107T1545Z`. Base master
`ece67e0b2` (2030Z round merged: witnessdoor GO, feaststopspend NO-GO,
frozen-band bisect GO — all policy/evidence, zero net src/js). Rotation 3
→ 0 at closeout.
Prereg: `evidence/2026-11-07/journey-scale-r109-prereg.md` (binding,
committed 0c2e813e5 before any scored seed).

## Pre-registration (summary)

**Q1 (PRIMARY, binding): does the scale driver sit a priced seat and play
a door?** New policy `scalecourt-nogate-morntrace3-linkraise-sit` wraps
the r108 linkraise policy with the two proven table drivers, reused via
require: `seatdrive.js` (preview-ready → `tableTakeSeat()`, engine-default
sitter — the policy never picks a villager sitter, Steve 2026-10-26) +
`modalplay.js` (plays the 7 doors by highest-strength EARNED door, beats
by the drain precedent, NEVER the trial). Sit opens the modal and the
drain plays it the SAME dawn. Matched seeds 97001–97004 (§15 deliberate
reuse of r107/r108's band), DAYCAP=180, death-aware. Two legs: BASELINE
(`SIT=0`, linkraise only, sit/modal forced off) vs ARMED (sit+modal on).
Verdicts judged against the replayed baseline: GO = seat sat ≥ 1/4 AND a
door played to a terminal; PARTIAL = seat taken but no terminal, or seat
priced but never sittable with a named reason; NO-GO = no seat taken
despite a priced seat, OR no seat priced on any seed — the wall is
PRICING, not sitting.

Second blank (r108): the raise-answer talks are invisible to the
instruments. This run records them (read-only transcript read in the
linkraise policy; one file per talk) so the people check reads ALL of
them.

## Q1 verdict: NO-GO — the wall is PRICING, not sitting

No seat was priced on ANY seed on EITHER leg. The sit drive never fired
once: preview seen 0/4, attempts 0/4, taken 0/4, guard refusals 0, drive
errors 0. The armed leg is byte-identical to the baseline on every seed
(regional JSONs diff empty; trust JSONs differ only in the `sit` flag) —
the layers are inert when there is nothing to sit, exactly as designed,
and the purity guard holds (NO-DIVERGENCE on all 4 seeds).

The pricing wall has one name, and it is the same on all four seeds:
**the feast surge was never used.** Every other lesser-seat bar is met
on every seed — waves 4/4/3 distinct, 2+ contests, 2+ crises, scale ≥
regional, stage ≥ 2, sentiment taught — and `foodDeeds` is False
everywhere because `feastSurgeUsed` is False everywhere. Even 97001,
which reached global with 5 wave-4 kills, 11 contests and 4 crises, was
priced nothing: the table counts the feast surge, and no village on this
band ever banked one. This is the same feast-surge road the 2030Z round
closed three times over — and it is now the scale leg's binding bar, not
the sitting.

Pooled (4 seeds, matched):

| leg | days lived | links ever | first link | Dawn | national | global | seat priced | seat sat | door |
|---|---|---|---|---|---|---|---|---|---|
| baseline replay | 76/72/83/107 | 14 | d10/d6/d19/d19 | d31/d27/d40/d40 | 1/4 | 1/4 | 0/4 | 0/4 | — |
| armed | 76/72/83/107 | 14 | d10/d6/d19/d19 | d31/d27/d40/d40 | 1/4 | 1/4 | 0/4 | 0/4 | — |

Per seed (both legs identical):

| seed | days | links | national / global | raises answered | end |
|---|---|---|---|---|---|
| 97001 | 76 | 4 | nat d62, glob d63 | 3/3 | hunger scatter, pantry 0, 4 alive |
| 97002 | 72 | 3 | — | 2/11 seen-days | hunger scatter, pantry 0, 1 alive |
| 97003 | 83 | 2 | — | 2/2 | all dead in combat, pantry 1,450 |
| 97004 | 107 | 5 | — | 5/8 (1 counter) | all dead in combat, pantry 5,200 |

Raise ledger (policy stats, both legs — identical): seen-days 24,
answered 12, linked 11, countered 1, skipped-not-ready 3, talk-failed 0,
not-offered 9 (all Mutlaq, see people check), errors 0. First
raise-talk days 10/6/19/19; first answers the same days.

## Baseline reproduction: NOT reproduced — base drift, named

The replayed baseline does NOT reproduce r108's rebased armed shape
(days 106/72/106/75, links ever 13, national 2/4). This run: days
76/72/83/107, links ever 14, national 1/4. The cause is base drift, not
the instrument: between r108's rebase base (9aa2698fc) and this base
(ece67e0b2), game code landed — the journey-establishment r112
specialist-ladder fix (food.js, game.js, party.js, villager-build.js:
foodXp buys skill from 0, village work grants foodXp) plus a betrayal
softlock fix. The trajectories still match r108's rebased armed on
gates/links/proposes/raises through the end of each seed (reggate rows
identical except one recorder-skipped day, d31, in r108's file and a
4-point bestDet wobble on d33); the villages just die earlier on this
base — the food/skill economy reshuffled survival. The raise-answer
behavior DOES reproduce (first link d10, accord d10, raises answered).
Per the prereg, this divergence is reported before any verdict is
claimed — and the verdicts ARE judged against this run's own replayed
baseline (same base, same driver, same policy modulo sit/modal), not
against r108's corpus. The before/after comparison is valid; the
r108 comparison is a reference that moved under us.

## Purity guard: OK on all 4 seeds

First reggate divergence: none on any seed (the legs are identical).
Floor (first raise-talk day / first priced-seat day): d10/d6/d19/d19.
No divergence before any armed-only action — there was no armed-only
action to precede. The baseline replay is the guard, and it holds.

## Village assessment (plain words)

Four villages, all dead before day 110, none ever offered a seat.

- **97001** (ended d76, four people left): the only one that reached
  national (d62) and global (d63). Four links, three seasoned, the realm
  held. It did not starve slowly — it scattered on its fourth hungry day
  with the pantry at zero (1 starvation death in the book, 33 of 56
  deaths in villager combat). It had everything the table wants except
  the one deed it never did: use the feast surge.
- **97002** (ended d72, one person left): the shortest life. Three
  links, one seasoned, pantry zero, 4 starvation deaths. Mutlaq raised
  a link idea nine days running and could never be answered (see people
  check). The lever bought standing; it did not buy dinner.
- **97003** (ended d83, nobody left): two links, never past regional,
  died fighting — 35 villager-combat deaths, 16 expedition deaths, 12
  combat deaths out of 79. Pantry 1,450 at the end; hunger did not kill
  this one, the wild did.
- **97004** (ended d107, nobody left): the longest life. Five links, one
  counter answered, pantry 5,200 at the end — fed, but dead: 29
  villager-combat deaths, 13 combat, 8 in the wild. Three lead links,
  none ever seasoned (trust/age), so national never staged. Julieta's
  water-haul ask (see people check) was the human center of this run.

What they knew: counters learned and shared (wave-4 kills 1/0/1/1, faced
types 5/0/3/6). What was missing: food, on the two seeds that scattered;
fighters, on the two that died in combat; and on all four, the feast
surge the table counts. Table approach: arc stayed 3 everywhere;
tableWaiting/tableAnnounced never fired; `tableDone=false` every day.
No full seat, no sitting, on either leg.

Realm dissolve / re-stage (r108 documented blank): 97001 dissolved and
re-staged twice (analyzer count 2) — national d62, global d63, then the
realm fell back and re-staged. The other three seeds never reached
national, so nothing dissolved. Count named, design question untouched.

## People check

One CONVO_DAYS transcript exists in the whole run (only 97004 lived
past day 90; no village reached day 120) plus all 21 raise-answer talks
(3+11+2+5), read in full.

- **Day 90, Julieta** (97004, farmer, bold, trust 55, want ask_favor):
  a real ask — haul water at first light, cistern nearly dry, "Two of
  us, half the trips. Will you come?" The scholar commits; she answers
  honestly that she is away from Haven and cannot promise a dawn meet
  while out — find her when she is back. She pivots to company ("Come
  get air with me. I need to think out loud."), the scholar goes, and
  she presses a spare tool into his hand — "Here. I made an extra."
  Warm, coherent, human. One wrinkle: the want advanced to stage 3
  while the favor itself (the water haul) still waits on her return —
  the want resolved as if arranged, the deed undone. The conversation
  also carries the run's only betrayal:accept pick (ordinary, not armed
  — the go-out-together accept). Ends "I should — yeah. Later."
- **Raise talks, accepted (12):** all read as real agreements. The
  raiser speaks the raise line ("I've heard good things about X. We
  should link with them — we'd be stronger together."), the scholar
  answers on the spot, the engine carries the proposal. Village news
  surfaces honestly (Leo d19: "There's still the matter of the murder
  of Rafael. Nobody's settled it."). Two recurring wrinkles, both
  cosmetic but universal: (a) the accept line is echoed — the scholar's
  "All right. Let's ask them." is repeated back verbatim as the NPC's
  line in 12/12 accepted talks; (b) the raise line is the same fixed
  template for every villager (it names the real village each time, so
  it reads naturally, but it is one line, not a voice).
- **Raise talks, not-offered (9, all Mutlaq, 97002):** the finding of
  the run's people check. Mutlaq speaks only Arabic — no shared words
  — so the conversation can never reach `link:accept`. He raised the
  link idea and the scholar talked to him nine days running (d14–16,
  d31–36); every talk is gestures, one proud English word ("Shit."),
  and the scholar leaving without the accept ever being offered. The
  language barrier is honest and the game is honest about it — but the
  policy keeps knocking on a door that cannot open, and the raise sits
  pending, expires, and re-raises. A competent player would stop asking
  after the second day, or find an interpreter (interpreters exist in
  this world). Design question, not a bug claim: should a raise from a
  no-shared-words villager be staged at all, or routed through an
  interpreter?

**0 senseless sittings.** No fabricated shared history, no filler loops
that break meaning. The Mutlaq talks repeat because the barrier
repeats, not because the dialogue is broken.

D-THING / bonds / betrayals: 1 betrayal accept in the band (97004
Julieta d90, ordinary). No bond-proposal sitting was separately tallied
this run.

## Blanks filled / documented

- **Blank FILLED (the run's lever, built + proven, unexercised live):
  the sit+modal drive.** `scalecourt-nogate-morntrace3-linkraise-sit.js`
  composes the proven seatdrive + modalplay layers over the r108
  linkraise policy; proof 16/16 green (seat verb, door rule by
  strength/tie-break, never-trial, gate-off delegation, same-dawn
  sit+drain, live smoke leg clean). It fired zero times on live seeds
  because no seat was ever priced — the lever is proven and waiting,
  not failed. The next scale run on a band where a seat prices will
  exercise it; until the feast-surge deed is reachable, it has nothing
  to sit.
- **Blank FILLED (r108): the raise-answer talks are visible now.** 21
  talks recorded and read in full (one file per talk,
  `journey-scale-r109-raisetalk-<seed>-<n>.txt`). The capture is a
  read-only transcript read; the proof pins it changes no counter and
  no game state.
- **Blank DOCUMENTED (not fixed): the feast surge is never used.**
  `feastSurgeUsed` False on 4/4 seeds, the sole failing lesser-seat bar
  on all four. The table counts it and no village banks it. Same road
  the 2030Z round closed three times over; the next work is a
  feast-surge lever, not another sit-drive tuning pass.
- **Blank DOCUMENTED (not fixed): Mutlaq's unanswerable raise.**
  A no-shared-words villager's raise can never be answered in
  conversation; the policy retries it daily until expiry. Interpreter
  routing or raise staging is a design question.
- **Blank DOCUMENTED (not fixed): the accept echo.** Every accepted
  raise talk repeats "All right. Let's ask them." as both the scholar's
  line and the NPC's line. Cosmetic; the accept narration should be
  its own line, not an echo of the player's.
- **Blank DOCUMENTED (not fixed): realm dissolve/re-stage churn.**
  97001 dissolved/re-staged twice after reaching global. Count named
  (analyzer `dissolveRestage`); whether the churn is intended pressure
  or a wobble in the staging bar stays a design question.

## Metric review

Q1 bound the run and the metric proved the right instrument: seat
priced + preview seen + seat taken + door terminal cleanly separated
the sitting question from the pricing question, and the NO-GO verdict
follows the prereg's own pricing-wall branch — not a re-score. The
baseline-reproduction check did its job as a guard: it caught the r112
base drift (survival reshuffled, 76 vs 106 days on 97001) and the run
reports it instead of hiding it. Revisions proposed for the NEXT run:
(1) a sit-drive run needs a seat-pricing precondition — run it on a
band/lever where the feast surge fires, or pair it with a feast-surge
lever, or the drive stays unexercised; (2) `raisesSeen` counts
raise-DAYS, not distinct raises (carried from r108 — the distinct
counts come from raiseHistory; rename or add a distinct counter);
(3) the analyzer's `dissolveRestage` counts rank transitions loosely
(any national/global in/out step) — tighten it to count only
national→below→national restores if the churn question is pursued.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
`hidden_files/telemetry-baselines/scale.json` (metrics firstCourt,
watchers, tableTele, fightsTotal, fightsByWave.4, maxGameDay), run
against the armed regional JSONs, printed LOUD "disappeared" lines
(fightsTotal 90→0, fightsByWave.4 3→0, maxGameDay 880→0). Investigated:
**shape artifact, not a real deviation** — same caveat as r107/r108. The
scale baseline was seeded from an old aggregate shape; this run's
per-seed files don't carry those metrics in resolvable form (the
regional JSONs are the reggate corpus). The baseline was **not** rolled
forward. Honest comparison from the census itself: fights happened on
every seed (wave-4 kills 1/0/1/1, faced types 5/0/3/6, 24–35
villager-combat deaths per seed), villages lived 72–107 days — no
overturning deviation, and the movement (or lack of it) is the lever's
non-firing, in the expected direction (identical legs).

## Regression

No full `check.js --quick` green this run — attempted, did not complete
in 280s on this slow box (killed by timeout mid-run, ~200/290 scripts
in, a handful of F's visible, consistent with the known pre-existing
set from the r114 gate 284/6). NOT claimed green. The regression cover
is: r109 proof 16/16 green (before any scored seed); the r108 proof
re-run AFTER the shared-policy edit, 11/11 green (the raise-talk record
changed no r108 behavior); pilot evidence (0 instrument errors, 0
policy errors on all 8 seed-runs); zero src/js changes. The r114 gate
(284/6, all adjudicated pre-existing) ran on the line this base
descends from; the gate is owed on the next run that touches src/js.

## Commits

- `0c2e813e5` — prereg + sit policy + raise-talk record + driver +
  analyzer + proof test (16/16)
- (this commit) — run note + analysis + evidence

## Closeout

- Merged locally, pending ship (no bump, no push, no live verification —
  the ship loop owns those).
- Rotation 3 → 0 written at closeout. NOTE: r108's note claims it wrote
  3→0 at closeout, but the rotation file still read 3 at this run's
  start — r108's write-back did not persist. This run verifies the
  write by re-reading the file after writing it.
- No stale-lock recovery needed this run (no lock file existed at
  start). Heartbeat loop ran the whole run; registry heartbeat stayed
  fresh.
- Safe-commit index clobber hit the prereg commit (5 new files D + ??,
  1 modified file MM — the commit itself was correct); repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` (the `-r` flag per the 2026-11-07 AGENTS.md update),
  verified `git status` empty + `git diff HEAD` empty.
