# sim-homebirth-b prereg — is the home-birth blank a gap or the design? (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1030Z,
axis food-economy, arm sim-homebirth-b. Base: master at worktree
creation (branch sim-homebirth-b; exact base recorded in the
evidence file from `git log`). Committed BEFORE any judged sweep
or probe. Measurement only: zero src/js changes, no default
flips, no lever, no game behavior changed by this arm.

## Backlog item and what it meant

Tracker next blank 1 (from run fleshout-loop-b-20261028T0630Z,
origin evidence/2026-10-28/sim-food-economy-round-0630-b.md):
"home-village birth path (Steve-call game change, own prereg —
distant births alone can never reach the pantry door)."

That sentence is the 0444Z arm's finding
(evidence/2026-10-28/sim-childbirth-b.md, DIAG-NO-GO), not a
proposal: the only birth code runs for distant villages only,
distant children never get positions, turns, or pantry access,
and home rosters start adult-only with no path adding a child.
On its 300d band (seeds 10410-10417): home children 0/0 in 96
roster slots, distant children 40 living across 29 villages,
one distant birth (Nora, day 293, Ashford, seed 10417, gone
before end census), child pantry eats 0.

Since then a coordinator design-first note
(hidden_files/coord-homebirth-design.md, 2026-10-28) records
Steve's stated leaning (2026-10-28 02:53 CDT, paraphrased):
births super rare and only for people already pregnant; there
are no children in this game; he leans toward ignoring
pregnancy entirely; the game only takes place over 5-6 months;
people enter from other villages, but there is no biological
population growth. The note recommends NOT building a
home-birth path and closing the blank as verified-by-design.

This arm tests that note against fresh measurement instead of
assuming it. It does NOT build the path, and it does NOT
re-litigate the 300d window (0444Z already covered 270+ days).
It asks, inside the game's intended span: does home population
change come from arrivals at all, can the 270-day birth gate
even fire inside that span, and is there any pregnancy or
home-birth code path the 0444Z read missed?

## Canon

docs/CANON.md read first. docs/KIN.md read: the Taking took
half of adults at day zero and the taken half's children into
stasis; "Children of KEPT adults (villagers who remained)
stayed with the villages and grew up normally." KIN covers the
stasis kids and the table's kid-return; it does not cover a
home birth mechanic. No canon doc covers births mechanics or
pregnancy generally — the firing conditions below are read
from src/js code (file:line cited), not invented. Stated, not
invented: KIN's fiction says kept adults' children exist in
villages; whether any code path puts such a child in the HOME
roster, or any child at all, is what this band measures.

## Code read (before any probe — the mechanism question)

1. THE ONLY BIRTH CODE is `simVillageDay` (src/js/game.js,
   ~10086-10112 in this checkout): `if (village.roster &&
   village.day >= 270 && Math.random() < 0.005)` then, given
   >= 2 partnered adults aged 18-40, push an unnamed baby
   `{age: 0, birthDay: village.day}` onto `village.roster`
   with a "👶 A baby was born to <parent>" news line. The
   in-code comment says "The game is a year; most
   playthroughs see zero births."
2. `simVillageDay` runs ONLY for distant villages: via
   `catchUpSim` (on first approach, simming every day since
   game start) and `tickJoinedVillage` (the joined village,
   from endDay). It NEVER runs on `state.village` (home).
   Distant village day tracks game day through the same
   watermark, so a distant village cannot be past the game's
   own day.
3. Distant villages DO start with children: `genVillageRoster`
   (game.js ~9895-9921) generates 30% children, ages 1-14 —
   but in `otherVillages[].roster`, never the home roster.
4. Home population change paths (code-read, to be measured):
   (a) arrivals: `acceptApplication` (membership.js ~444)
   queues an arrival, `arrivalTick` (~600) pushes the id
   onto `state.village.roster` and hydrates the person via
   `ensureRosterPerson` → `genCharacter`; (b) village
   auto-recruit: `villageAutoRecruit` (membership.js ~497)
   accepts applications or invites waiting visitors when
   roster < 8 with housing room; (c) deaths shrink the
   roster; succession changes WHO the player is, not roster
   membership. No path pushes a child: `genCharacter` draws
   age from occupation bands `ageMin = occ.minAge || 19`
   (game.js ~1061), so every generated arrival is an adult
   by construction.
5. Pregnancy: a source scan for `pregnan` across src/js
   returns ZERO matches — no pregnancy state, timer, or
   "already pregnant" arrival story exists in code. This is
   a scan result, not a design claim: Steve's "already
   pregnant" leaning describes a story that has no code
   behind it today.
6. CONSEQUENCE (pre-registered hypothesis, to be tested, not
   assumed): inside a 5-6 month game, the birth block is
   dead code twice over — it never runs at home, and no
   village (home or distant) can reach day 270 inside the
   span. Home growth, if any, must come from arrivals, and
   every arrival must be an adult. If the band instead
   records a home child (by any path), a child joiner, or a
   birth news line inside the span, the hypothesis is WRONG
   in the direction that matters and the confirm rule fires.

## Instrument (adapted, not rebuilt)

New sweep script scripts/sweep-homebirth-b.js, adapted from
scripts/sweep-childbirth-b.js (same harness pattern:
loadGame/setupGame/runDays, sequential seeds in one process,
same env gates; stockdoors capture NOT needed — no pantry
door is judged here, and the child-eat door was already
fixture-proven by outflowzero). Per seed it records:
   (a) home census at setup AND at end (roster ids, npcAge
       per id, children age < 15, min age, positions count);
   (b) roster diff: end ids minus start ids (= joiners) and
       start ids minus end ids (= leavers/dead), each joiner
       with its end age (null if unresolvable — recorded as
       unknown, never assumed adult);
   (c) arrival narration cross-check: say-lines matching
       /walks in/ or /taken in/ captured during the run;
   (d) distant census at end: every otherVillages[] entry
       with a generated roster — roster size, living
       children, living birthDay members, village day, and
       any birth news lines;
   (e) max scholar day reached, end reason, wall fields
       (national/table/wins, wave reach, death causes via
       the childbirth death hook, reused unchanged).
New analyzer scripts/analyze-homebirth-b.js aggregates the
corpus and judges the bar below. No sibling capture file is
modified. No src/js change is planned under any outcome: a
game change here is a Steve-call, and this arm's deliverable
is the measured answer plus a ruling specification.

## Unscripted band (shared baseline, no lever)

Policies (MEASUREMENT.md §2, multi-policy):
- Primary: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off,
  COMPETENT_WARM default ON).
- Variant: competent-nofeast-warmoff (same env gates,
  COMPETENT_WARM=0) — varies social intake behavior
  (applications, debates, welcomes) while holding the birth
  mechanism fixed. If both policies agree, the structural
  claim is policy-independent, not a policy artifact.
Pilot seeds 10510-10517 (8 fresh seeds — checked against
2026-10-28 evidence .md files and scripts/*.js; corpus dir
is new, so no overwrite risk). Same 8 seeds under both
policies (identical-seed comparison across policies, §1).
Horizon: DEATH-AWARE cap 180d (dead villages stop; runDays
stops on death/win — the cap is not a fixed horizon).
Justification: Steve's stated span is 5-6 months
(~150-180d); 0444Z already covered the 270+ window at 300d,
so re-running 300d would re-prove the old window instead of
testing the intended span. A village that dies before 180
contributes its days to the denominator; it does not
invalidate the band.

## Pre-registered primary metric and GO bar (binds the run)

PRIMARY METRIC: home-roster population-change attribution
over the 180d band, per policy: (births at home, arrivals
joined, joiner ages, deaths) + (max village day reached vs
the 270 birth gate, distant birth news lines).

Operational definitions:
- homeChild: a home-roster member with age < 15 at setup or
  end (npcAge; null age = unknown, counted separately).
- homeBirth: any homeChild at end that was not at setup
  (birth or child arrival — the band splits them by the
  joiner list; either one overturns the hypothesis).
- joiner: a roster id at end that was not at setup.
- arrivalLine: a captured say-line matching /walks in/ or
  /taken in/ (narration cross-check; roster diff is the
  primary truth — if they disagree, both are reported and
  the roster diff judges).
- gateReached: max over (scholar day, every distant
  village day) >= 270, or any birth news line in the corpus.

QUESTION-ANSWERED (the diagnostic bar — NOT a game-change
threshold) iff ALL of:
- (Q1) 16/16 corpus files complete (8 seeds x 2 policies),
  each with setup/end census, roster diff, distant census,
  and wall fields present and parseable;
- (Q2) homeChild count exact on every seed (0 or >= 1 with
  the joiner/birth path named — a count of "unknown" on any
  seed fails Q2 unless that seed's roster diff is still
  fully computable from ids alone);
- (Q3) joiner count exact on every seed with joiner ages
  recorded (adult / child / unknown split, no silent
  defaulting of null ages to adult);
- (Q4) gateReached classified on every seed (max day + birth
  news lines recorded, 0 or >= 1).
Otherwise the verdict is INCONCLUSIVE (never a fake answer,
never a re-scored pass).

CONFIRM RULE: a confirm band (12-16 fresh seeds, same
policies and instrument) is spent ONLY if the pilot records
>= 1 homeChild at end, >= 1 child joiner, or >= 1 birth news
line inside the span (something exists whose recurrence is
worth confirming). If the pilot is QUESTION-ANSWERED with
all zeros on births/children (the expected structural
result), no confirm is spent — there is nothing to confirm,
and the 0444Z 300d band already covers the longer window.

KILL/NARROW RULE (pilot gate, §9): if >= 2 seeds crash or
produce incomplete corpora, or arrival instrumentation
returns "unknown" (roster diff uncomputable) on >= 2 seeds,
narrow to a code-audit-only report and verdict
INCONCLUSIVE — do not claim a measured answer from a broken
instrument. Zero births or zero arrivals alone is NOT a kill
reason: absence is the signal here, provided Q1-Q4 classify
it exactly (that is what distinguishes this diagnostic from
a lever pilot).

## Sense requirement

Quote arrival lines verbatim (walks-in / taken-in) and any
birth news lines if they appear. Say what the village looked
like without children at home — who joined, who died, and
whether anything in the transcripts ever mentions a child at
the fire, a pregnancy, or a birth. If arrivals are the only
growth, judge whether the arrival narration reads as people
joining a village (names, packs, welcomes) or as numbers.

## Wall numbers (reported, not judged)

National / table / wins, wave reach 1-5, four-realm
formation if the harness reports it, median/max survival,
and death-cause shares for the pilot band (per policy, never
pooled across policies), plus the telemetry-deviation check
against the scale-wall baseline (loop-B body step 10) with
any LOUD line investigated same-run.

## Panel statement (section 15)

No balance-panel comparison exists: measurement only, no
lever, no game-code change, no before/after leg. The
standing panel exception applies — corpus is census rows
with no panel-ingest mode, stated explicitly, no panel
faked. (Same exception as childbirth/outflowzero.)
Determinism check: the analyzer re-run on the frozen corpus
must reproduce the verdict; a single-seed re-run is NOT
treated as a reproduction (0444Z method note: multi-seed
single-process sweeps do not reproduce seed-by-seed).

## Metric review (section 14 — filled at report time)

To be filled in the evidence file: whether the bar worked as
written, any definition that proved wrong (proposed revision
for the NEXT run only), and the panel-exception statement.
