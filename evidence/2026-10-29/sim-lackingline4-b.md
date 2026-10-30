# sim-lackingline4-b — evidence (seventh lacking-line run, backlog #1450/#1455: re-judgment on current master)

Verdict: **DIAG-GO on current master** — judged ONLY against
the base-pinning prereg bars in
`evidence/2026-10-29/sim-lackingline4-b-prereg.md` (committed
as 341c21cc6, BEFORE any judged leg). The lacking-line was
played again on the pinned base, in a genuinely
still-refused ON creek evening, naming the actual lack
with the live number, and passed every guard (a)–(g).
This closes the #1450 blank BY MEASUREMENT on current
master — with a NEW staged evening, not a carry-over of
the old one. No policy change, no src/js change —
measurement only.

## Base pin and what drift did (read first)

- PINNED BASE: 60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479
  (worktree HEAD at prereg writing time). The prereg
  commit added only the prereg file, and the final
  tracked diff vs the pin for `src/` and
  `scripts/policies/` is EMPTY — the legs ran on
  pinned-base game code verbatim. New files are
  measurement scripts + evidence + corpora only.
- The old staged evening does NOT re-play: on the
  pinned base, seed 13421 (the lackingline3 staged
  seed, day 18 at 95 ticks) has ZERO creek evenings on
  either leg — its whole creek episode is gone on
  this base. Seven of the 13 banked seeds have zero
  creek evenings on the new base (13421, 13473,
  13556, 13592, 13703, 13714, 14125). This is the
  base drift the re-judgment was ordered to measure,
  and it is why the old DIAG-GO was NOT carried over.
- What survived drift is a different seed's episode:
  13480's 7-evening creek episode reproduces on the
  new base with ticks/kcal IDENTICAL OFF → ON on all
  7 days (day 4: 45 ticks / 2254 kcal on both legs;
  days 5–10: 245/24, 117/0, 125/0, 127/0, 127/0,
  119/0), wood 0 → 4 via the carry. The staged
  evening below is re-derived from the new-base
  census, in bank order, after the full ON census —
  never cherry-picked, never imported from the old
  run.

## Design (prereg summary, not re-litigated)

- Fixed bank, no fresh screen: all 13 published
  lackingline3 seeds in order — 13421, 13473, 13480,
  13556, 13592, 13703, 13714, 13869, 13899, 14041,
  14089, 14125, 14137 (13 ≥ 8-seed floor). Prior
  corpora are old-base evidence and were NOT reused
  as current-master evidence.
- Fresh legs on the pinned base, same driver
  (`scripts/woodcarry3-trace-b.js`, UNCHANGED) and
  env: POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  DAYS=30, WOODCARRY=0 (OFF) / 1 (ON). No thief
  grant, no taps, no state edits.
- Primary hunted line, carried over: ticks-short —
  the one gate the lever does not fix.

## New-base census (full bank, bank order)

Committed record:
`evidence/2026-10-29/sim-lackingline4-b-on-census.json`
(analyzer: `scripts/analyze-lackingline4-on-b.js`).
All 13 seeds: errs == 0, unclassified == 0, survived
30 days, on BOTH legs.

- OFF creek evenings (new base): 24 (13480: 7,
  13869: 7, 13899: 5, 14041: 4, 14089: 1; the other
  8 seeds: 0). Compare with care: the old combined
  OFF total was 73, but that summed two different
  old bases (prior 7 + fresh 6); the new 24 is a
  single-base count for the same 13 seeds. The drop
  is drift in episode presence, not a lever effect —
  OFF legs have the lever off.
- ON creek evenings (new base): 14. Still-refused:
  8. Rescued (bridge built, retry arrived): 6.
  Rescue rate on the banked band: 6/14 = 42.9%
  (old base: 8/18 = 44.4% — close, on a smaller
  band).
- Still-refused skip breakdown: ticks-short 2,
  kcal-short 6, wood-short 0, build-refused 0,
  retry-refused 0. No build/retry evening had to
  stand in for the primary gate-skip claim.
- Still-refused evenings, in bank order:
  - 13480 day 4 ticks-short (45 ticks), days 5–10
    kcal-short (24, then 0 kcal ×5);
  - 13869 day 7 ticks-short (79 ticks).
  - Seeds 13421, 13473, 13556, 13592, 13703, 13714,
    14125: 0 ON creek evenings.
  - Seeds 13899, 14041, 14089, 14137: ON creek
    evenings all rescued (1 each, except 14041
    with 2).
- ON creek evenings are NOT a subset of OFF creek
  evenings on this base: 14137 has 0 OFF creek
  evenings but 1 ON creek evening (day 26,
  rescued), and 14041 has an ON-only rescued
  evening on day 29. The lever changes day shape,
  so ON episodes can appear where OFF had none —
  the census judges ON outcomes, never OFF
  presence.

### Gate distributions + margins (14 banked ON creek evenings)

- Wood: every evening woodPlayer = 4 — exactly at
  the 4-log floor, never below (margin 0, never
  negative), never above. Wood-short never bound
  ON, as the carry predicts.
- Kcal: range 0–2363. Below the 60-kcal floor: 6
  evenings (24, 0 ×5; margins −36, −60 ×5). The
  next lowest kcal above the floor is 587
  (margin +527). Kcal-short binds only after a
  stranded day has drained the player (the 0-kcal
  run on 13480 days 6–10 follows the day-4
  stranding, exactly as on the old base).
- Ticks: range 45–245. Below the 96-tick floor: 2
  evenings (45, margin −51; 79, margin −17). The
  next lowest ticks above the floor is 109
  (margin +13), then 111 (+15). The judged
  evening's margin is −51 ticks: a wide, genuine
  shortfall, not a rounding artifact — dayTicks
  467 of a 512-tick day, 45 ticks left, bridge
  needs 96.

## Staged evening (prereg bar (a), re-derived AFTER the census)

- Staged seed: 13480 — the FIRST banked seed in
  combined order with ≥ 1 still-refused ON creek
  evening on the pinned base (13421 and 13473 have
  none on this base).
- Judged evening: 13480, loop-day 4 — its FIRST
  still-refused ON creek evening. Later
  still-refused evenings on the same seed (days
  5–10, kcal-short) are secondary evidence, not
  replacements.
- Classification: blockType creek, hopReturnKind
  block:creek, blocked tile (2,4), departure
  forest_floor tile (1,4), haven (4,4). Bridge:
  not attempted, skip ticks-short, built null,
  retry null, rescued false, evening position
  forest_floor, inside false, travelledHome false.
  Live numbers: woodPlayer 4, kcalLive 2254,
  ticksToDayEnd 45.
- Morning carry record for loop-day 4: acted
  false, skip already-carrying, woodBefore 4,
  pileBefore 19, kcal 2384. The pack already held
  its 4 logs at morning, so the carry did nothing
  — wood was never the lack, and the morning carry
  cost 0 ticks. ON ticks (45) equal OFF ticks (45)
  exactly, confirming the lackingline3 carry-cost
  correction a second time: already-carrying
  mornings preserve the OFF ticks number.

## Bars (a)–(g) — judged, one by one, on the pinned base

- (a) Staged still-refused ON creek evening: YES —
  13480 day 4 (plus 7 more still-refused evenings
  on the band; minimum-n 1 met eightfold).
- (b) Judged day's full tail contains the
  lacking-line for the actual skip reason, named
  number = live number: YES — "No bridge tonight
  — 45 ticks left in the day, and a bridge takes
  96 ticks." (45 = classification ticksToDayEnd;
  skip ticks-short; wood 4 and kcal 2254 are not
  the lack and are not named). Source:
  `scripts/policies/woodcarry.js` lackingLine,
  ticks branch, called from the bridge decision
  path for a no-attempt skip.
- (c) No OTHER lever line in that day's tail
  contradicts the classification: YES — exactly
  one "No bridge" line in the full day (line 31
  of 31). The two "The creek runs fast here — no
  crossing without a bridge or a swim." lines are
  the engine's own creek refusal voice, not a
  lever line, and they agree with the
  classification (a creek that needs a bridge).
- (d) Recorder/classifier errs == 0, judged
  evening classified creek, no probe/route error,
  unclassified == 0: YES — 13480 ON leg errs 0,
  unclassified 0; judged evening probeAgrees
  true, probeError null, routeAroundError null.
- (e) Determinism re-run of first banked seed ON
  (13421) byte-identical on the pinned base: YES
  — re-run into a worktree staging dir matched
  the judged corpus JSON byte for byte; staging
  dir deleted after comparison.
- (f) Fresh OFF guard legs for the combined bank
  on the pinned base contain NO lever
  lacking-line: YES — 390 OFF evenings scanned
  (13 × 30), 0 "No bridge" hits. The line fires
  only on the ON leg.
- (g) Sense-test: PASS (full read below).

Verdict: all of (a)–(g) hold on current master →
**DIAG-GO**.

## Sense-test (bar (g)) — judged evening's FULL day, end to end

Full-tail leg:
`scripts/lackingline4-trace-b.js` (created in Phase
4 only, per prereg: identical setup to
woodcarry3-trace-b.js, plus eveningSayFull = ALL say
lines of the loop-day). Tail corpus:
`evidence/2026-10-29/sim-lackingline4-b-corpus-tail/`
(seed 13480, ON). Its evening rows (excluding the
say fields) match the judged ON corpus exactly,
and its mornings match exactly — so this IS the
judged tail, not a lookalike. The day had 31 say
lines total.

Day 4, seed 13480, in full:

1. LEARNED: Old World Caches (Level 1) — where
   people hid things: floorboards, hollow trees,
   loose bricks.
2. "You've learned Old World Caches — it carries
   Eagle Eye."
3. "Travel 2 tiles to creek." (+ braided-creek
   flavor: gravel bars, crawdads)
4. "You saw the creek. Lena nods. 'Good. Now we
   know.' (+integration)"
5.–6. Smoke on the horizon: Emberhold (9 people,
   4 days in, fishing folk, 2 new plants) and
   Ashford (8 people, 2–3 new plants) — other
   villages, present all along.
7. "Travel 1 tile to creek." (+ moving-water flavor)
8. "Ashford's clearing. Voices, a cookfire,
   somebody else's home. You're a guest here —
   act like it."
9. "Travel 2 tiles to forest floor." (+ canopy
   flavor: fallen trunks, leaf-mold)
10. "Movement — a gray squirrel, chattering."
11. "It'll go straight up a tree when spooked.
    Bring something ranged, or wait it out."
12. "Travel 1 tile to forest floor." (+ woodpecker,
    mushrooms, cold shade)
13. "You clear the rubble, stone by stone. The
    path is clear."
14. "You pocket 3 good throwing stones. (sling
    ammo)"
15. "Travel 3 tiles to forest floor." (+ old
    growth, shafts of light, something rustled and
    decided not to be seen)
16. "Something pads into the clearing — a drumbeat
    with no drummer, getting closer. It's here."
17. "The creek runs fast here — no crossing
    without a bridge or a swim."
18. "Travel 1 tile to forest floor." (+ canopy
    flavor)
19. "It followed you. The drumbeat with no drummer
    is here."
20.–21. "Some of these unknown nuts are starting
    to look familiar — sort them at camp in good
    light and the name might come to you." (twice)
22. "Journal: Deep shade. The floor keeps its
    secrets."
23. "A shot in the dark — you take what's green:
    7× unknown nuts. Into the bag, unnamed. (Not
    food until identified — sort them at camp.)
    This patch is picked clean — it'll recover in
    a few days."
24. "Travel 1 tile to forest floor."
25. "It followed you. The drumbeat with no drummer
    is here."
26. "You make a Stone knife. flint knapped to an
    edge, bound with vine. cuts meat, wood, cord."
27. "It sits up and drums a little paradiddle,
    watching to see if you flinch."
28. "Terrence," they say, touching their chest.
    "I'm Terrence." You'll remember that.
29. "Journal: learned their name (Terrence)."
30. "The creek runs fast here — no crossing
    without a bridge or a swim."
31. "No bridge tonight — 45 ticks left in the day,
    and a bridge takes 96 ticks."

Judgement, meaning first: the line reads as a
person lacking something, not a debug string — a
named lack (time), a named number (45 ticks), a
named threshold (96 ticks), a named consequence
(no bridge tonight). No variable names, no
"skip:", no nulls anywhere in the day. The arc
explains HOW the lack came about: the day started
at the haven in the morning (inside, kcal 2384,
stage 0), the player travelled out through creek
and forest tiles, learned a cache skill, met two
neighboring villages' smoke, cleared rubble,
pocketed sling stones, foraged unknown nuts, knapped
a stone knife, met Terrence and a drumming
creature that kept following — and by evening was
still out at forest_floor tile (1,4), with 467 of
the day's ticks spent, 45 short of building. The
morning carry is part of the arc by its absence:
the pack already held 4 logs, so nothing about
wood explains the night out — time does. The
engine's repeated creek lines and the lever's
closing line agree: no crossing, no bridge,
tonight. The surrounding lines are ordinary
village life and exploration, not filler aimed at
the refusal — the day reads as a day, with the
refusal as its ending, not as a staged string
pasted onto an empty day.

One plain-words note on the margin: unlike the old
base's one-tick miss, this miss is wide — 45 ticks
against a 96-tick build, less than half the time
needed. The line does not exaggerate the lack; it
reports it, and the width makes the number easier
to believe, not harder.

## Ticks-short sub-table (new base: OFF ticks-short evenings vs their ON outcomes)

| Seed | OFF loop-day | OFF ticks / kcal / wood | ON outcome, same loop-day |
|---|---|---|---|
| 13480 | 4 (first episode) | 45 / 2254 / 0 | Still-refused, ticks-short, 45 / 2254 / 4 — JUDGED evening |
| 13869 | 7 (first episode) | 79 / 2207 / 0 | Still-refused, ticks-short, 79 / 2207 / 4 |
| 13869 | 12 (later episode day) | 79 / 0 / 0 | No creek evening ON — evening completed (inside haven); the day-8 ON rescue broke the episode |

- First-episode ticks-short evenings reproduce
  exactly ON: 2/2, same loop-day, same ticks
  number, same kcal, wood 0 → 4 via the carry.
  Both mornings were already-carrying skips, so
  the carry cost 0 ticks — the lackingline3
  correction holds on the new base too.
- The later-episode ticks-short evening does NOT
  reproduce ON, for the same clean reason as on
  the old base: the lever rescues the episode's
  second evening ON (13869 day 8), the player
  sleeps at home, and the later episode days never
  become creek evenings at all. A ticks-short
  evening the lever prevents the player from ever
  reaching is not a failed prediction — it is the
  lever working.

## Before / after vs the held arm's base (lackingline3)

| Measure | Held arm (its base) | This run (pinned 60cfe8fe) |
|---|---|---|
| ON creek evenings | 18 | 14 |
| Still-refused / rescued | 10 / 8 | 8 / 6 |
| Still skip ticks / kcal | 4 / 6 | 2 / 6 |
| Staged seed / evening | 13421 day 18 | 13480 day 4 |
| Staged line | 95 ticks | 45 ticks |
| OFF creek evenings (same 13 seeds) | 73 (two old bases) | 24 (one pinned base) |
| OFF guard | 390 evenings, 0 lines | 390 evenings, 0 lines |
| Determinism (13421 ON) | byte-identical on its base | byte-identical on pinned base |

The verdict is the same kind (DIAG-GO) but the
evidence is new: the old staged evening is gone
on this base, and a new one stages in its place.
Quoting the old 95-tick line as current-master
behavior would have been wrong; the current-master
line is the 45-tick line above.

## Village assessment (plain words)

The 13 banked villages all survived the 30 days,
on both legs — that is partly the selection (these
are villages that lived long enough to get caught
at a creek), but within that frame they are
working villages, not ghost towns: they unlock
wave 1 everywhere, wave 2 in 10 of 13, wave 3 in
1 of 13 (13421 — the old staged seed, which still
climbs furthest even without any creek evening
on this base). They kill monsters steadily (96
wave kills over 30 days; 97 monster deaths in the
death log) and they lose people along the way —
18 villager/person deaths across the 13 villages
(the wild 9, monster 2, sickness 2, wound 1,
ambush 4), against the monster kills. The player
villages keep going after losses, which is the
shape of the game as designed.

The staged village (13480) is a wave-2 village
with 7 wave kills in 30 days and 9 death-log
entries, most of them monsters it killed. Its
creek episode is the whole story of the first
week: stranded on day 4 for want of time, then
stranded again days 5–10 for want of food (24
kcal, then nothing) — a village that gets caught
out, runs down, and still survives the month. The
line it hears on day 4 is the honest version of
that first stranding: not "you failed," but "you
are 45 ticks short of a bridge."

What was missing, and what this run fills: the
lackingline3 DIAG-GO could not be landed because
its base drifted, and its staged evening does not
exist on current master. The blank this run fills
is the re-proof: the line is heard in play on
current master, on a new staged evening, under a
pinned base. What is still missing is breadth,
not existence: wood-short has never been played
on any band (wood 4 on all 14 ON creek evenings
here, as on all 18 before), and kcal-short was
played only as the follow-on to a stranding,
never as a first-evening lack. Those are next-run
notes, not gaps in this verdict — the prereg's
primary hunted line was ticks-short, and
ticks-short is now played twice over on current
master.

Wall numbers: NOT OBSERVABLE on 30-day evening
legs (pre-seat, no field). National / table /
wins are reported as NOT OBSERVABLE, never as
zeros. No national, table, or win claim is made
or implied by this run. Wave reach on the banked
band: wave 1 all 13 villages, wave 2 in 10 of 13,
wave 3 in 1 of 13 (13421); waves 4–5 not reached
in this 30-day window. Median survival is 30 days
(all 13 survived the window, both legs) — a
ceiling effect of the short window and the
banking selection, not a survival claim.

## Metric review (prereg doubts, answered; revisions for the NEXT run)

- Minimum-n 1, kept — and exceeded: 8
  still-refused evenings, 2 of them the primary
  hunted line. No lowering, no re-scoring, no
  substitution (no build/retry evening was needed
  or used).
- Base pinning, validated as a method: the pin
  caught exactly what it was designed to catch —
  the old staged evening vanished, and the run
  still reached a verdict without importing it.
  Future re-judgments must pin the same way; a
  verdict must never be rebased onto a new base
  without fresh legs.
- Banking trait is base-sensitive (new finding
  for the NEXT run): the same 13 seeds yield 73
  OFF creek evenings across the old bases but 24
  on the pinned base, and 7 seeds yield none at
  all here. A bank imported from another base is
  a seed list, not a trait guarantee — future
  preregs that depend on episode presence should
  either re-derive the bank on the pinned base or,
  as this run did, fix the seed list and judge
  only the new-base outcomes, reporting the
  presence drop as drift, not failure.
- Carry-cost correction, confirmed again:
  already-carrying mornings preserve the OFF
  ticks number exactly (13480: 45 → 45; 13869:
  79 → 79). The correction from lackingline3 is
  now twice-confirmed and should stay in future
  lacking-line-style preregs.
- Wood-short remains unplayed. Proposed next-run
  revision (not adopted here, carried from
  lackingline3): a wood-short hunt needs a
  different staging route than banking on creek
  episodes, because the morning carry structurally
  prevents wood-short on creek evenings (pack 4
  on all 14 ON creek evenings). A future prereg
  should either name a route that defeats the
  carry honestly (e.g. a pile-floor morning,
  where the pile holds fewer than 4 logs) or
  record wood-short as unplayable-by-construction
  under the shipped carry and close that
  sub-claim on those grounds. Do not weaken the
  carry to stage it.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side lever with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the
  pre-registered bars above are the judge.

## Proof

`scripts/test-lackingline4-b.js` — all checks green:
census recomputation (bank 13, creek 14, still 8,
rescued 6, skip ticks 2 / kcal 6, OFF creek 24);
staged seed/evening/line (13480 day 4,
ticks-short, 45, wood 4, kcal 2254, already-
carrying morning); tail match (evening rows and
mornings exact, exactly one lacking line, equals
staged narration, no debug strings); OFF guard
(390 evenings, 0 lever lines); determinism
(13421 ON re-run byte-identical, staging dir
deleted). Run: `node scripts/test-lackingline4-b.js`.
Note: the proof's determinism leg re-runs seed
13421 (the first banked seed, per prereg), which
has 0 creek evenings on this base — determinism
is about the instrument, not about staging, and
it holds regardless.

## Landing

- Prereg: already committed (341c21cc6), not
  recommitted.
- This commit: analyzer
  (`scripts/analyze-lackingline4-on-b.js`), ON
  census JSON, fresh pinned-base OFF corpora (13
  files), fresh pinned-base ON band corpora (13
  files), tail corpus (1 file) + tail driver
  (`scripts/lackingline4-trace-b.js`), evidence
  file (this file), proof script
  (`scripts/test-lackingline4-b.js`).
- Measurement only: no src/js change, no policy
  change, no wording change. No [needs-eyes]: the
  judged line reads cleanly in play and needs no
  design ruling.
- Report: committed, pending coordinator merge.
  Verdict DIAG-GO on pinned base 60cfe8fe, staged
  seed 13480, judged evening loop-day 4,
  ticks-short line with 45 ticks.
