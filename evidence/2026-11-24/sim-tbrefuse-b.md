# What happens to a refused TB start? — Loop B, run fleshout-loop-b-20261124T1630Z, arm sim-tbrefuse-b (DIAG)

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes. Answers
bloodcluster §Next blanks #4 (the "92 refused TB starts").

- Anchor: `2c82596ce` (branch sim-tbrefuse-b; prereg v1 at `e7c6741ad`,
  Amendment #1 at `ef885b18c`, pilot corpus at `2c82596ce`).
- Judged RUN: `tbrefuse-b-v2`, 16 seeds 109310–109325, 150d, competent
  policy verbatim, death-aware horizon. Determinism replay: seed 109312,
  RUN `tbrefuse-b-v2-replay`.
- Corpus: `evidence/2026-11-24/perseed-tbrefuse-b/` (16 judged JSONs +
  1 replay JSON; the 8 pilot `tbrefuse-b` JSONs are smoke-only, NOT
  pooled). Analysis: `evidence/2026-11-24/tbrefuse-b-v2-analysis.json`.
- Prereg: `evidence/2026-11-24/sim-tbrefuse-b-prereg.md` (Amendment #1
  frozen before the judged leg).

## Verdict: DIAG-GO

Judged ONLY on the amended frozen bars (Amendment #1). All five bars
pass. The pilot's premise correction stands and is now proven on the
full band: **there is no guard-refusal phenomenon on this band at all**
— zero `startCombat` calls were ever made while a fight was live.
What the bloodcluster instrument counted as "refused starts" is two
different things, and the v2 instrument separates them cleanly.

| Bar (amended) | Result |
|---|---|
| 1. Classification completeness — every non-building start has one call kind + one fate; 0 `noop-unexplained`, 0 `gone-untracked` | PASS — 91/91 classified; 0 `noop-unexplained`, 0 `gone-untracked`, 0 rows without a fate |
| 2. Caller taxonomy complete — 0 `caller-unknown`, every row has a stack frame | PASS — 0 `caller-unknown` |
| 3. Player-visible evidence — every row carries `linesDuringCall` (empty = silent, stated); titan-line firings per titan per day reported | PASS — 91/91 carry `linesDuringCall`; 43 rows with lines, 48 silent; titan line fired on 28 distinct (titan, day) groups, 0 dedup violations |
| 4. Kill accounting — every later kill attributed to its channel; not-killed-in-window reported by fate, delayed vs not-killed never collapsed | PASS — see Kill accounting below |
| 5. Instrument health — 0 instrument errors; determinism: seed 109312 twice yields identical no-op rows + identical line counts; 0 unlinked kills | PASS — 0 errors, 0 unlinked kills; replay identical (see Determinism) |

## Classification counts (91 non-building starts, 16 seeds)

| Call kind | Rows | Share |
|---|---|---|
| `titan-refusal` (titan hard gate, "no solo titans") | 76 | 84% |
| `instant-resolve` (fight built and ended inside the `startCombat` call, opening turns) | 15 | 16% |
| `guard-refusal` (fight live before the call, guard fired) | 0 | 0% |
| `noop-unexplained` (fail-closed bucket) | 0 | 0% |

- 83/91 rows (91%) are wave-4+; all 76 titan rows are wave 4
  (`herald` only — the only titan mid met on this band).
- Distinct world monsters: 21 (6 heralds + 15 instant-resolve
  monsters). Repeat refusals: 70 — the same herald refusing over and
  over is the story of this band, not 76 separate monsters.
- Pending-refusals: 0. There is no pending-refusal episode to tell on
  this band (see Sense-testing).
- Cross-check vs the bloodcluster base: rebuilt-false `tbStarts`
  rows = 91, instrument non-building starts = 91, mismatch 0.
  (Bloodcluster counted 101 all-wave / 92 wave-4+ on the same band at
  its anchor; the anchor moved, so the count is a cross-check, not a
  bar. This band's base wave-4+ rebuilt-false count is 83.)

## Caller table (91 rows)

| Caller | Rows | Kinds |
|---|---|---|
| `monsterTurn` (a world monster steps onto the player tile) | 81 | 76 titan, 5 instant |
| `feast-draw` (`faceFeastDraw`) | 5 | 5 instant |
| `contest-arena` (`_contestArena`) | 4 | 4 instant |
| `other-driveContestsImpl` | 1 | 1 instant |
| `caller-unknown` | 0 | — |

No `trap`, `waiting-monsters`, or `policy` callers on this band. The
single `other-driveContestsImpl` row is seed 109321 day 14,
`alien_tick` (wave 2), an instant-resolve that fled in the opening
— a contest drive firing a start that built and routed at once.

## Fate table (91 rows)

| Fate | Rows | Distinct monsters | What it means |
|---|---|---|---|
| `killed-field` | 28 | 3 heralds | Refused herald later killed in the field (never in TB) |
| `still-waiting-at-end` | 48 | 3 heralds | Refused herald still in the world at day 150 |
| `fled-in-opening` | 14 | 14 monsters | Instant-resolve: fight built, monster routed/fled in the opening turns |
| `killed-in-opening` | 1 | 1 monster | Instant-resolve: the monster DIED in the opening round |
| `re-engaged-tb` | 0 | 0 | No refused monster was ever lifted into a later TB fight |
| `removed-vanished`, `removed-fled-across`, `pending-unresolved-at-end`, `lost-in-opening`, `instant-other` | 0 | 0 | — |

## Per-seed table

| Seed | Days | End | Refusals | titan | instant | Fates |
|---|---|---|---|---|---|---|
| 109310 | 150 | survived | 0 | 0 | 0 | — |
| 109311 | 150 | survived | 2 | 0 | 2 | 1 killed-in-opening, 1 fled-in-opening |
| 109312 | 150 | survived | 4 | 0 | 4 | 4 fled-in-opening |
| 109313 | 97 | village-lost | 0 | 0 | 0 | — |
| 109314 | 150 | survived | 1 | 0 | 1 | 1 fled-in-opening |
| 109315 | 96 | village-lost | 0 | 0 | 0 | — |
| 109316 | 49 | village-lost | 0 | 0 | 0 | — |
| 109317 | 150 | survived | 20 | 19 | 1 | 19 killed-field, 1 fled-in-opening |
| 109318 | 150 | survived | 4 | 1 | 3 | 1 killed-field, 3 fled-in-opening |
| 109319 | 150 | survived | 14 | 13 | 1 | 13 still-waiting, 1 fled-in-opening |
| 109320 | 150 | survived | 31 | 31 | 0 | 31 still-waiting |
| 109321 | 97 | village-lost | 10 | 8 | 2 | 8 killed-field, 2 fled-in-opening |
| 109322 | 150 | survived | 0 | 0 | 0 | — |
| 109323 | 68 | village-lost | 0 | 0 | 0 | — |
| 109324 | 150 | survived | 0 | 0 | 0 | — |
| 109325 | 150 | survived | 5 | 4 | 1 | 4 still-waiting, 1 fled-in-opening |

## Player-visible verdicts (`linesDuringCall` per row)

- 43 rows carried lines; 48 rows were silent (empty list — the
  verdict, not missing data).
- Titan rows: the titan line fired on 28 distinct (herald, day)
  groups and was deduped to once per day by the game — 0 dedup
  violations. The other 48 titan rows are same-day repeats of a
  line the player already saw that day: silent. On seed 109320 day
  131 the herald was refused **13 times in one day** — the line
  fired once, then 12 silent refusals.
- Instant rows: all 15 carried lines (8 lines each, the opening
  turns narrating themselves). The guard refusal line
  ("Already in a fight — finish this one first.") fired **0 times
  on the whole band** — because no guard refusal ever happened.
- `refusalSayCount` (guard-line firings) = 0, `sayFiringsSum` = 0,
  mismatch 0.

## Kill accounting — delayed vs not-killed-in-window, never collapsed

**Instant-resolve kills (died in the opening round, NOT delayed by
a refusal): 1.** Seed 109311 day 100, `suburb` (wave 4): the fight
built and ended `won` inside the `startCombat` call; the kill is in
`tbKillCtx` (fight `fmgpspk64_c2rba2`, killed by `mara_vasquez`
via companion). The player saw a full fight's worth of lines
("Mara laughs, disbelieving. 'Did you SEE that?'", "WINNER! Style
score: 0…", "You came back bloody. Nobody asks. Someone saves you
the good seat by the fire.") — a real kill that the old instrument
misread as a refusal because `tbfight` was null after the call.

**Instant-resolve fled (not killed, but never refused — the fight
happened and the monster ran): 14.** Every one ended `routed` in
the opening turns with the same honest narration: "It comes apart
— no one in reach, no one chasing. The fight ends; they melt back
into the wilds." / "It got away. No meat, no trophy — but you're
breathing, and now you know its moves." Each also banked a Codex
sighting (1/2 toward the trick). These are not lost kills — the
monster was met, fought for one round, and left.

**Titan-refusal monsters killed later (delayed, in the field): 3
distinct heralds, 28 rows.** None was ever re-engaged into a TB
fight (0 `re-engaged-tb`) — every titan kill on this band happened
in the field, by villagers or the scholar, never through the TB
system the gate protects:
- Seed 109317: herald refused 19× (days 83–112), killed day 130
  in the field (`aid-crisis`) by the scholar, taking no damage.
- Seed 109318: herald refused 1× (day 127), killed day 144 in
  the field (`wild`), taking no damage.
- Seed 109321: herald refused 8× (days 76–88), killed day 91 in
  the field (`wild`) by `tashi_sherpa` + `yuki_mori` in 6 rounds
  (129 + 60 dealt, 34 taken) — after it had already killed a
  villager (see Sense-testing).

**Titan-refusal monsters not-killed-in-window: 3 distinct heralds,
48 rows, all `still-waiting-at-end`.** Seed 109319 (13 rows, days
111–112), seed 109320 (31 rows, days 85–142), seed 109325 (4 rows,
day 130). These heralds are still walking the world at day 150 —
unfaced, unmustered, uncounted as kills. They are not "lost" by a
refusal; they are **never faced at all**, because the only way to
face a titan is a 10-blade muster the villages never assemble
("muster 10 allied blades (you have 0)").

**Summary:** delayed (later killed): 3 distinct monsters.
Not-killed-in-window: 3 distinct heralds still waiting + 14
instant-resolve monsters that fled in the opening (fought, not
refused). 0 kills were lost to a guard refusal, because no guard
refusal exists on this band.

## Determinism

Seed 109312 run twice (judged `tbrefuse-b-v2` vs replay
`tbrefuse-b-v2-replay`): identical no-op rows — seq, day, mid,
caller, callKind, fate, ended fight id, and line counts all match
(4 rows: `landlord` d58 feast-draw, `cliffhanger` d60 monsterTurn,
`cancellation` d81 monsterTurn, `strike` d98 feast-draw, all
instant-resolve / fled-in-opening). `tbEnds` and `tbKillCtx`
identical as well. Bar 5 determinism leg passes.

## Sense-testing law — the episodes, in plain words

### Richest no-op episode: the herald of seed 109320 (31 refusals, never faced)

Day 85, a wave-4 Herald walks onto the scholar's tile. The game
says, once, in full: "⛔ THE HERALD does not notice you the way
prey notices a hunter. It notices you the way weather notices a
field. You cannot face this alone — sound the call, muster 10
allied blades (you have 0). This is not courage. This is
arithmetic." That is a good line — it tells the player exactly
why, exactly what's missing, and it has voice. Then nothing
happens. The herald stays on the tile. It comes back on day 119
(the line fires again, once), day 130, day 131 — **thirteen times
in a single day** — day 132, day 142. Thirty-one refusals across
six days, and the player hears the line six times and silence
twenty-five times. The herald never leaves, never attacks, never
gets faced, and at day 150 it is still there. The village
survived to day 150; the herald is still waiting.

Judged as a player experience, this is coherent but hollow: the
line is honest, the dedup is merciful (thirteen identical lines a
day would be spam), but the monster becomes furniture. A titan
that walks up to you thirty-one times and is turned away by a
speech check is not a threat — it is a weather report. The
silence after the first line of the day is the tell: the game has
nothing more to say about a monster it will never let you fight
and never makes leave. The design question is not the refusal —
"no solo titans" is a real rule, and the line states it well — it
is that a refused titan has no next beat: no muster prompt that
actually assembles blades, no wandering off, no escalation. It
just waits, and the player learns to ignore it.

### The herald of seed 109321 (8 refusals, one villager's life, then a kill)

Day 76, the herald steps onto the scholar's tile six times; the
line fires once, then silence. Day 85 a villager walks up to it
in the field and fights it alone-ish (one ally joined, called for
help): three rounds, takes 54, deals 37, flees at 21 HP with the
herald still at 313 HP — and that villager dies the same day to a
monster. Day 87 two more villagers die out in the wild. Day 88
another villager engages it, takes 92, deals 22, and dies with
the herald at 291 HP. Day 91 `tashi_sherpa` and `yuki_mori` kill
it in six rounds (129 + 60 dealt, 34 taken, 51 HP left). This is
the only herald on the band that cost a life — and the kill came
from villagers choosing to engage in the field, not from any TB
fight. It reads as people, not numbers: they kept walking up to
the thing that had already hurt them, and the third pair finished
it. The refusal gate never enters this story after day 76 — the
village solved the herald the only way the game allows, by
walking up to it in the field and bleeding.

### Pending-refusal episode: none exists

The judged band has 0 pending-refusals, and the pilot's one
ambiguous row is settled: the `glasswing` of seed 109311 day 121
(via `faceFeastDraw`) is an **instant-resolve, fled-in-opening**
(ended fight `fmgpspkij_9ybqzg`) — the v2 linkage of `tbEnd`s fired
during the call proves it. The feast draw did fire the fight; the
fight routed in the opening turns. No pending-refusal episode
exists to tell. (Note: all five feast-draw rows on the band are
instant-resolves that fled — the draw fires, the fight builds and
routes at once, and the draw is consumed. Whether consuming a
feast draw on a fight that routes in round one is intended is a
follow-up question, not a verdict of this arm.)

### Instant-resolve texture (the other 14)

Fourteen times a fight built and routed before the player could
act, and the game is admirably honest about it every time: the
combat banner fires ("COMBAT! THE AUDIT! The gamblers lean in.
ROUND 1 — FIGHT!"), then "It comes apart — no one in reach, no
one chasing." The one incoherence is the banner itself: the game
announces a fight that is already over, and the "Style score: 0.
The gamblers wanted blood, but they'll settle for drama" line
reads as if a fight happened when the player did nothing. It is
a small thing — the routing narration is otherwise exactly right
— but the player is told "ROUND 1 — FIGHT!" and then told the
monster ran before round 1 existed. One line of the opening
("It comes apart — no one in reach…") is doing the work of
explaining that no fight happened; the banner is doing the
opposite.

## Village assessment (plain words)

Sixteen villages, 150 days each. Eleven survived to day 150, five
died out (days 49, 68, 96, 97, 97). Nobody won anything: 0 wins,
0 national, 0 at the table — every survivor is still regional.
Six villages unlocked wave 5, five actually faced it, seven
wave-5 kills across the band. Wave-4 kills: 44 with a log entry
(48 raw). Twenty-nine villagers across the band hold a wave kill
each — 19 of them dead by run's end, 10 alive. What this band adds is the herald-shaped hole in

The villages bleed the same way every band does: 1,310 death events
across the sixteen — 1,142 monster deaths (by villager combat 502,
expedition 433, combat 202, ambush 5) and 168 villager deaths
(4–18 per village), led by the wild (67) and monsters (42), then
the arena (10), starvation (10), wounds that wouldn't close (8),
and sickness (6). Of the 29 villagers who hold a wave kill, 19 are
dead by the end of the run (combat 10, wild 8, starvation 1) and 10
are alive — the veteran pipeline is thin but real: the best village
(109312) has four killers and nine wave-4 kills; the worst
survivors have none.
the middle of it: six wave-4 titans walked the world, three were
killed in the field by villagers who chose to engage, three are
still out there at day 150 because no village ever mustered ten
blades. The titan gate works as written. The muster it demands
does not exist yet as something a village can do — so the gate
reads, in practice, as "this monster is not for you, forever,"
and the villages route around it in the field at whatever cost.

## Blanks filled / documented

- **Filled (the arm's question):** what happens to a refused TB
  start. Answer: on this band there is no refused TB start — the
  guard never fires. The 91 non-building starts are 76 titan-gate
  refusals of one monster kind (the Herald, always wild, always
  "muster 10, you have 0") and 15 fights that built and ended in
  the opening turns (14 fled, 1 killed). Every row is classified,
  every fate is tracked, every line the player saw is captured.
- **Filled (pilot ambiguity):** the `glasswing` day-121 row is an
  instant-resolve, proven by the v2 `tbEnd`-during-call linkage.
- **Documented (not fixed — DIAG only):** the feast-draw path
  consumes the draw even when the start no-ops / routes in the
  opening (5 rows); the titan gate fires on every wild herald
  encounter with no muster (76 rows, 6 monsters); a refused titan
  has no next beat — it waits in the world indefinitely (3
  heralds still waiting at day 150, 48 rows).
- **Documented:** the opening-turns banner ("ROUND 1 — FIGHT!")
  fires for fights that end before round 1 exists.

## Next blank

The titan muster: **can a village ever assemble the 10 allied
blades the herald gate demands, and if not, is "no solo titans"
a gate or a wall?** Three of six heralds on this band were never
faced at all — not because the village was too weak to kill them
(the field kills prove they can be killed), but because the TB
path demands a muster nobody performs and the field path is the
only way through. The follow-up arm is a census of the muster
itself: does any village on any band ever hold 10 allied blades
at a herald encounter, what would it take, and should the gate
count field kills, or a smaller muster, or a muster the player can
actually call? (Preregistered separately; this arm lands no fix.)

## Scale-wall numbers (every run)

- Wins: **0/16**. National: **0/16**. Table: **0/16**.
- Scale ranks: regional 15, village 1.
- Wave 5 unlocked: **6/16** (109310, 109311, 109312, 109313, 109314,
  109317). Wave 5 faced: **5/16**. Wave-5 kills: **7**.
- Wave-4 kills (log entries): **44** (48 raw kill events).
- Median survival: **150d** (max 150d). Survived to 150d: 11/16.
  Village-lost: 5/16 (days 49, 68, 96, 97, 97).
- Living veterans (max snapshot): 3. Killers (villagers with a
  wave kill): 29 across the band.

## Metric review (§14)

- **The metric was right; the premise was wrong, and the prereg
  said so.** Amendment #1 (frozen before the judged leg) already
  redefined the judged phenomenon from "guard refusals" to "all
  non-building starts" after the pilot proved the guard never
  fires. The judged band confirms it at full power: 0 guard
  refusals in 91 rows. No mid-run re-scoring happened — the bars
  judged are the amended frozen ones.
- **Bar 1's fail-closed bucket earned its keep by staying empty.**
  `noop-unexplained` = 0 on 91 rows means the v2 classification
  (tbEnd-during-call → instant, guard/titan line → refusal, titan
  mid → refusal) covers the space. The pilot's one ambiguous row
  is the proof the bucket was needed: v1 could not classify it;
  v2 does.
- **Count cross-check, not a bar:** 91 non-building starts vs
  bloodcluster's 101 all-wave on the same band at its anchor.
  The anchor moved (this band's base wave-4+ rebuilt-false count
  is 83 vs bloodcluster's 92), so a 10-row drift is expected
  anchor drift, not instrument disagreement — the within-run
  cross-check (base 91 = instrument 91, mismatch 0) is the clean
  one.
- **One instrument description was inaccurate:** Amendment #1 says
  `linesDuringCall` is "capped at 6"; the instrument stores the
  full call window (`callLines.slice()`, lines truncated to 300
  chars each) — the suburb killed-in-opening row carries 8 lines.
  No bar depends on the cap; the evidence uses the full lists.
  A future instrument note should say "full call window" instead.
- **`sayFired` / `refusalSayCount` count only the guard line.**
  They are 0 because no guard refusal happened — correct, but a
  reader of the raw JSON could mistake 0 for "nothing was said."
  The amended bar 3 (`linesDuringCall` present on every row) is
  the right visibility measure; the guard-line counters are
  legacy from v1 and should be read alongside it.
- **Balanced panel (§15): INAPPLICABLE** — census, no before/after
  change. The analysis JSONs are attached instead; no comparison
  is fabricated.
- **Metric for the next arm:** the muster question needs a
  different instrument (allied-blade counts at herald encounters,
  muster-call attempts, field-vs-TB kill attribution per titan).
  This arm's refusal rows cannot answer it — they can only show
  the gate firing with "you have 0" every time.
