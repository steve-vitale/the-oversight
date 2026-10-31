# sim-warmthfuel-b — warmth-fuel attribution + protected-wood counterfactual

Run: oversight-flesh-out-loop-b, arm sim-warmthfuel-b, axis
food-economy. Worktree sim-warmthfuel-b. DIAG ONLY:
zero src/js changes, zero policy-default flips, no
behavior probe built, run, or judged. Sibling trees
never touched; main tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-warmthfuel-b-prereg.md (commit
178bcde3c7). Pinned base 003a9c2f391edd56f31a0f6f9f1305d
(worktree HEAD at prereg time). Question: backlog
warmth item (kcalshort-b, 2026-10-30) — the warmth fire
spends bridge logs on strand nights, turning a 3-night
food-only guard strand into a 10-night food-and-wood
strand. Attribute EVERY strand night's warmth fuel on
the 15215 guard + ON legs, then compute the
protected-wood counterfactual from the recorded
trajectories. Substrate: POLICY=nighttravel,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank seeds 15003,
15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
15439, guard (WOODWARM=0) + ON (WOODWARM=1) legs.

## Instruments

Recorder: scripts/warmthfuel-trace-b.js — the kcalshort
driver verbatim PLUS read-only additions only (morning
branch count, post-evening wood count, post-evening
branch count; all pure reads). Analyzer:
scripts/analyze-warmthfuel-b.js — strand derivation,
fuel attribution, wood/branch trajectories,
protected-wood counterfactual, other-fire scan.
Proof: scripts/test-warmthfuel-b.js (unit 25/25 at
instrument commit; 59/59 with corpus assertions on the
judged corpora).

## Pilot gate (passed, then confirm)

Pilot: 8 seeds (15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337) on both legs — complete, zero
recorder errors on strand evenings, 15215 strands on
both legs (drift check passed: no strand-set movement),
warmth record present on every 15215 strand evening.
Confirm: full 10-seed bank on both legs (10/leg by
design per the prereg's note on the generic 12-16 band:
the judged denominator is the strand bank, covered in
full; a second stranding seed would have joined the
census automatically — none appeared).

## Equivalence bar (recorder behavior-neutral: PROVEN)

Confirm legs reproduce the kcalshort fresh baselines
EXACTLY, per seed and in total: guard creek 12 /
still 3 / rescued 9; ON creek 18 / still 10 / rescued
8; all 10 seeds survived 30 days on both legs.
Pilot and confirm agree number-for-number on every
shared seed (15215: guard wcRecords 4, ON wcRecords
10 / wwActed 6 on both). Every number below is
measured on the true trajectory.

## The current-master strand set (re-derived, not inherited)

Only ONE seed strands on current master: 15215 — the
same set as kcalshort, no drift. 15009 has ZERO creek
evenings on both legs (it does not strand, does not
even visit a creek evening). The census covers 100%
of the strand evenings that exist: guard 3 + ON 10 =
13 strand evenings, all 15215.

## 1. FUEL ATTRIBUTION — every strand night (judged measurement)

Fuel classes are fixed by the prereg and computed from
the warmth record + the engine fuel rule (game.js
fireFuel: branches >= 2 -> 2 branches; else wood >=
1 -> 1 log; else no fuel) + the warmth gate
(woodwarm.js warmDecision: branches >= 2 -> miss
'branches-available'). An acted warmth fire on
branchesBefore < 2 can only take wood fuel when it
lights. Guard-leg warmth records carry miss
'lever-off' only (no branch/wood fields — the lever
never runs there).

### ON leg (primary; warmth live) — strand nights 7-16

| night | fuel | warmth detail | refusal logs | kcal | ticks | branches | post-evening wood | next-morning wood | next-refusal wood |
|-------|------|---------------|--------------|------|-------|----------|-------------------|-------------------|-------------------|
| day 7 | NO-WARMTH-SPEND (ticks-short) | not attempted: 47 ticks < fire cost + 10 | 4 | 2254 | 47 | 0 | 4 | 4 | 4 |
| day 8 | NO-FUEL (friction failed) | attempted, spark did not catch, 0 spent | 4 | 0 | 239 | 0 | 4 | 4 | 4 |
| day 9 | WOOD (bridge log) | lit, 4 -> 3 | 4 | 0 | 109 | 0 | 3 | 3 | 3 |
| day 10 | NO-FUEL (friction failed) | attempted, spark did not catch, 0 spent | 3 | 240 | 238 | 0 | 3 | 3 | 3 |
| day 11 | WOOD (bridge log) | lit, 3 -> 2 | 3 | 0 | 111 | 0 | 2 | 2 | 2 |
| day 12 | WOOD (bridge log) | lit, 2 -> 1 | 2 | 0 | 239 | 0 | 1 | 1 | 1 |
| day 13 | WOOD (bridge log) | lit, 1 -> 0 | 1 | 0 | 111 | 0 | 0 | 0 | 0 |
| day 14 | NO-WARMTH-SPEND (no-wood) | nothing to burn | 0 | 240 | 238 | 0 | 0 | 0 | 0 |
| day 15 | NO-WARMTH-SPEND (no-wood) | nothing to burn | 0 | 0 | 111 | 0 | 0 | 0 | 0 |
| day 16 | NO-WARMTH-SPEND (no-wood) | nothing to burn | 0 | 0 | 111 | 0 | 0 | 0 | — (home day 17) |

ON totals: WOOD 4, NO-FUEL 2, NO-WARMTH-SPEND 4,
BRANCHES 0, WOOD-SURPLUS 0, OTHER-UNEXPLAINED 0,
UNATTRIBUTED 0. Warmth acted 6 times on the strand
(d8, d9, d10, d11, d12, d13); leg totals match
kcalshort exactly (acted 6, log-spent 4).

CORRECTION to the kcalshort prose: kcalshort named
spends on nights 9, 11, 13 but its own leg total said
log-spent 4. The fourth spend is night 12 (2 -> 1),
recovered here by the night-by-night trajectory. The
spend nights are 9, 11, 12, 13 — four, not three.

### Guard leg (secondary; warmth off) — strand nights 7-9

| night | fuel | refusal logs | kcal | ticks | post-evening wood | next-morning wood | next-refusal wood |
|-------|------|--------------|------|-------|-------------------|-------------------|-------------------|
| day 7 | NO-WARMTH-SPEND (lever-off) | 4 | 2254 | 47 | 4 | 4 | 4 |
| day 8 | NO-WARMTH-SPEND (lever-off) | 4 | 0 | 239 | 4 | 4 | 4 |
| day 9 | NO-WARMTH-SPEND (lever-off) | 4 | 0 | 109 | 4 | 4 | 4 |

Guard totals: NO-WARMTH-SPEND 3, everything else 0.
Day 10 (outside the strand) builds the bridge:
refusal-time pack 4 logs, post-evening wood 0 — the
bridge itself consumes the 4 logs it needs. The guard
strand is 3 nights, rescued day 10.

### Wood trajectory (the whole story in one line)

Refusal-time logs, ON leg, nights 7-16:
4, 4, 4, 3, 3, 2, 1, 0, 0, 0. Every step down is a
warmth spend (warmth delta = -1 on d9, d11, d12, d13;
0 on every other night — verified against the
warmth record's woodBefore/woodAfter on all 10
nights). Overnight deltas are 0 on all 9 measurable
nights (sleep spends no wood). Daytime deltas are 0
on all 9 measurable strand days (the villager gains
and loses NO wood during strand days — no cutting, no
gathering, no other spend). The wood trajectory is
purely warmth-driven: nothing else moves it.

### Branch trajectory (the empty column that decides option 2)

Branches are 0 on EVERY strand morning, EVERY strand
evening (branchesBefore), and EVERY post-evening
snapshot, on both legs. The villager never holds a
branch during the strand, never gathers one on a
strand day, and warmth never faces the
branches-available gate on a strand night (it faces
ticks-short once, no-wood three times, and lights or
fails on the rest). There is no branch fuel anywhere
in the strand to burn instead of logs.

### Other-fire scan: CLEAN

The full day's say lines on all 13 strand evenings
were scanned with the narrowed fuel-spending pattern
(feedFire wood/branch lines, tent-fire feeding).
Zero non-warmth fuel-spending lines. (The broad
pattern was rejected during the pilot: gossip
("fragments by the fire") and codex counters ("They
fear fire") mention fire without spending fuel, and
counting them would have fabricated spends. The
narrowed scan is what the proof pins.)

### Strand exits (what actually ends each strand)

- Guard: bridge built day 10 (4 logs, 180 kcal per
  kcalshort's guard corpus row; post-evening wood 0).
- ON: after 10 still nights, the villager wakes
  INSIDE the haven on morning 17 (map 4,4) and day
  17's lines narrate the homecoming ("You come home
  after 11 days"). No bridge is built: the day-16
  record already shows a 3-step route-around path to
  the haven ([2,5] -> [3,5] -> [3,4] -> [4,4]). The
  ON strand ends by walking home, not by bridging —
  7 nights later than the guard rescue, with an empty
  pack.

## 2. PROTECTED-WOOD COUNTERFACTUAL (computed, never run)

Method (prereg-fixed): wood'(evening) =
refusalWood + cumulative WOOD spends on EARLIER
strand evenings, holding daytime deltas, kcal, and
ticks at their recorded values. Refusal-time kcal /
ticks are measured BEFORE the warmth step, so a
warmth spend cannot change the same evening's gates;
it can only change later evenings' wood. First
evening passing all three gates (wood' >= 4, kcal >=
60, ticks >= 96) converts and ends the strand.

### ON leg

| night | wood actual | wood' (protected) | kcal | ticks | gates under protection |
|-------|-------------|-------------------|------|-------|------------------------|
| day 7 | 4 | 4 | 2254 | 47 | FAIL (ticks) |
| day 8 | 4 | 4 | 0 | 239 | FAIL (kcal) |
| day 9 | 4 | 4 | 0 | 109 | FAIL (kcal) |
| day 10 | 3 | 4 (3 + d9 spend) | 240 | 238 | PASS — CONVERTS |
| day 11-16 | — | — | — | — | never reached |

Counterfactual ON strand length: 3 (nights 7, 8, 9),
rescued day 10 — IDENTICAL to the guard strand. Only
ONE night converts (day 10); nights 11-16 vanish as a
consequence of the day-10 rescue, they are not six
further conversions. The single d9 spend is the
pivotal one: without it, day 10 holds 4 logs with 240
kcal and 238 ticks, and every gate passes. The d11,
d12, d13 spends matter only because the strand
survived past day 10 to burn them.

### Guard leg

Zero warmth spends -> wood' = wood on every night ->
no conversion inside the strand (d7 ticks, d8/d9
kcal) -> counterfactual length 3, reproducing the
actual guard strand exactly, as the prereg required.

### What the counterfactual does NOT price (stated limit)

It prices bridge gates only. It does NOT price
sleep-quality / healing differences of cold nights
(fireside vs ground sleep; the fire-died-in-the-night
cold cut) — a protected-logs build that lights no
fire on nights 8-10 changes what the villager sleeps
beside, and this DIAG measures no HP/healing
trajectory to price that. It also holds behavior
fixed: a real build could diverge (friction draws,
cold-night consequences, different foraging). The
counterfactual answers "which nights does wood alone
block" (answer: day 10, via the day-9 spend), not
"what would a build do".

## 3. THE DESIGN DECISION, FRAMED (no game change)

Three options, with measured consequences on this
strand:

1. PROTECT BRIDGE LOGS (e.g. the woodwarm R1
   restraint shape: never burn a log when the pack
   holds <= 4 — on this strand the pack never exceeds
   4, so no strand-night fire lights at all).
   Measured consequence: ON strand 10 -> 3 nights,
   rescue day 10, 4 log-spends avoided, 7 exposed
   nights removed. Cost paid in fires: the 4 lit
   fires (d9, d11, d12, d13) do not happen (d8/d10
   failed anyway; d7 never attempted). Unpriced cost:
   cold-night sleep quality / healing (see limit
   above) — the build that takes this option must
   measure it, because the guard leg proves only that
   3 cold nights end in rescue, not that cold nights
   are free.
2. BURN A NON-BRIDGE FUEL. Measured consequence on
   this strand: NONE AVAILABLE. Branches are 0 on
   10/10 ON strand nights and 3/3 guard nights, and
   the villager gathers none on strand days. This
   option cannot save a single log until a branch
   supply exists first — a gather-branches behavior
   on strand days, or a branch carry into the field.
   As a standalone switch it is vacuous here; as a
   design it is really "add branch supply, then
   prefer branches", a two-part build.
3. LEAVE AS-IS. Measured consequence: strand stays
   10 nights; 4 bridge logs burn (d9, d11, d12, d13);
   2 friction failures waste 48 ticks each for no
   flame (d8, d10; d10's failed attempt also costs 70
   kcal, 240 -> 170, though the day-10 rescue is
   judged at refusal time and so is unaffected); 3 nights end with an empty pack
   and nothing to burn (d14-16); the villager still
   gets home day 17 by the route-around, and still
   survives 30 days. The price is 7 extra exposed
   nights and a bridge forgone on day 10 — paid in
   time and exposure, not in death, on this seed.

The decision is a design call (Steve-call if it needs
his ruling: protection changes what a survival fire
may burn). This DIAG arm builds nothing and judges
no probe.

## Sense-test (law — read end to end, judged for meaning)

Judged ON corpus, seed 15215, night 9 — the first
bridge-log burn, full day's lines (16 lines):
a day of worked-out patches and unknown berries
("A shot in the dark — you take what's green: 5x
unknown berries. Into the bag, unnamed. (Not food
until identified...)"), the creek refusal naming
kcal honestly ("No bridge tonight — 0 kcal in hand,
and the lashing takes 60"), then the warmth fire
catching ("The tinder catches. A real flame,
breathing. You feed it twigs — fire. Yours. (-0 kcal,
48 ticks.)"). The sequence coheres as the census
says: a villager with unknown food it cannot eat, a
bridge refused for food, and a fire lit after the
refusal that the record proves costs a log (4 -> 3).

One narration wrinkle, same honesty class as the
kcalshort both-evenings line (filed below, not
chased): the fire line says "You feed it twigs" while
the engine spends a LOG — the pack holds 0 branches,
and fireFuel falls through to wood. The story claims
twig fuel; the ledger loses a bridge log. A player
reading only the narration would never know the
bridge just got shorter. PASS on meaning for the
attribution itself; the twigs-vs-log wording is the
one line that does not match its record.

## Village assessment (plain words)

The banked villages are the same working villages
the strand arms have always seen: all 10 survived 30
days on both legs (ceiling effect of the window +
banking selection, not a survival claim). What this
arm adds is the fire's ledger: the stranded villager
never carries a branch, never gathers one, and lights
its survival fires with the only fuel it has — the
bridge logs. The fire is not wasteful in intent (it
keeps the villager warm on nights it would otherwise
sleep cold) but it is ruinous in accounting: one
log on night 9 costs the bridge on night 10, and
the three later logs burn on nights that only exist
because the bridge was already lost. Protect the
logs and the villager walks home on night 10 with
the same food, the same ticks, the same day behind
it. Leave them unprotected and the villager still
comes home — a week later, on foot, with an empty
pack, having learned nothing it could not have
learned at home. The warmth question is not whether
the fire is worth lighting. It is whether a bridge
log is the right thing to light it with, when the
pack holds nothing else and the bridge is one log
away.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached (ON: 18 creek evenings, 8 rescued; guard: 12
creek evenings, 9 rescued). Waves 1-2 in 9/10 banked
villages on both legs, wave 3 in 1/10 (15439); waves
4-5 not reached in this 30-day window (same window
as kcalshort/jointgate).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day pre-seat
evening legs — reported, never claimed. Observed
counts on both legs, all 10 seeds alive at day 30:
national 0, table 0, wins 0 (structurally
unreachable in this band, not a wall measurement);
wave reach: wave 1 in 10/10, wave 2 in 8/10, wave 3
in 1/10 (15439), waves 4-5 in 0/10; median survival
30 days (ceiling — all seeds survived the window);
harness death-sample counts 6-18 per seed (village
deaths over the 30 days as recorded by the harness,
not a mortality claim). ON leg 15215 deaths 8 vs
guard 6 (post-strand divergence on one seed, not a
wall movement).

## Proof

scripts/test-warmthfuel-b.js: 59/59 checks pass
(attribution unit cases for every fuel class + every
miss reason; counterfactual unit cases incl. guard
reproduction, surplus handling, unclassified
poisoning, never-reached listing; corpus assertions:
10/10 seeds, 30/30 days alive, 0 unclassified, 0
unexplained, 0 recorder errs, counterfactual
recomputed independently identical, warmth-delta
consistency on every strand night, 15215 strand
nights guard 7-9 / ON 7-16, guard CF reproduces
actual, ON CF converts d10 length 3 neverReached
11-16, guard log-spends 0, ON log-spends 4;
tracked-diff guard: src/ and scripts/policies/
clean vs HEAD; recorder source contains no engine
verb calls). Determinism: 15215 ON re-run
byte-identical to the judged ON 15215 file.
Equivalence: confirm legs reproduce kcalshort fresh
baselines exactly (see above).

## Metric review

- The prereg's fuel classes separated cleanly: 13/13
  strand evenings attributed, 0 OTHER-UNEXPLAINED, 0
  unattributed, 0 trajectory breaks, 0 other-fire
  lines. The classes were the right instrument — in
  particular, NO-FUEL (friction failed) matters: 2 of
  the 6 warmth attempts spend nothing, and counting
  attempts as spends would have overstated the bleed
  by half. Any future warmth census must keep
  attempted vs lit distinct.
- The counterfactual's hold-fixed assumption is
  sound for bridge gates (refusal-time gates precede
  the warmth step) but explicitly does NOT cover
  sleep-quality/healing. A future prereg for a
  protection build must pre-register an HP/healing
  trajectory measure, or it will repeat this arm's
  blind spot with a build attached.
- The "100% of strand nights" bar behaved well again
  on a single-seed strand set, with the same fragility
  as kcalshort's: had a second seed stranded, the bar
  would have demanded its nights too. The
  bank-composition reading (cover what exists, name
  what vanished) is what made it satisfiable, and
  the next prereg should keep that clause.
- The other-fire scan's first (broad) pattern was
  wrong and was caught by the pilot, not by the
  proof: gossip and codex lines mention fire without
  spending fuel. The narrowed pattern is pinned in
  the proof's recorder-source checks only by
  presence of the snapshot fields, not by the pattern
  itself — a future edit to the pattern should add a
  unit case with gossip lines. Noted, not retrofitted
  (the judged corpora were scanned with the narrowed
  pattern; the pilot corpora prove it).
- No metric revision is proposed for the fuel classes
  or the gates.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/narration — FIRE
  LINE SAYS TWIGS, LEDGER LOSES A LOG: on ON strand
  nights 9, 11, 12, 13 the makeFire success copy says
  "You feed it twigs" while the engine spends a bridge
  log (branches 0, fireFuel falls through to wood).
  A player reading only narration never learns the
  bridge got shorter. Whether the line should name
  the fuel actually spent is a design call.
  (evidence: sim-warmthfuel-b ON corpus, 15215.)
- [open] 2026-10-31 — food-economy/warmth — COLD-NIGHT
  COST UNPRICED: the protected-wood counterfactual
  prices bridge gates only; fireside-vs-ground sleep
  quality and the fire-died cold cut are not measured
  on this arm. A protection build must pre-register
  an HP/healing trajectory measure before its verdict
  can count the cold nights as free. (evidence:
  sim-warmthfuel-b counterfactual limit section.)

## Verdict

DIAG-GO. Bar (a): fuel attribution complete on 100%
of strand nights on both legs (guard 3/3, ON 10/10),
every night attributed exactly one fuel class, zero
OTHER-UNEXPLAINED, zero unattributed, wood
trajectory complete night by night with every delta
explained (warmth -1 on spend nights, 0 otherwise;
overnight 0; daytime 0). Bar (b): protected-wood
counterfactual computed for both legs — ON converts
day 10, length 10 -> 3, neverReached 11-16; guard
reproduces actual (length 3, no conversion). Bar
(c): decision framed as protect / non-bridge fuel /
leave-as-is with measured consequences, no game
change. Bar (d): determinism 15215 ON byte-identical;
proof suite 59/59 green.

## Files

- Prereg: evidence/2026-10-31/sim-warmthfuel-b-prereg.md
  (commit 178bcde3c7)
- Evidence (this file): evidence/2026-10-31/sim-warmthfuel-b.md
- Compare (guard vs ON side by side):
  evidence/2026-10-31/sim-warmthfuel-b-compare.md
- Recorder driver: scripts/warmthfuel-trace-b.js;
  analyzer: scripts/analyze-warmthfuel-b.js; proof:
  scripts/test-warmthfuel-b.js
- Pilot corpora: evidence/2026-10-31/
  sim-warmthfuel-b-corpus-pilot-{guard,on}; censuses:
  sim-warmthfuel-b-census-pilot-{guard,on}.json
- Judged corpora: evidence/2026-10-31/
  sim-warmthfuel-b-corpus-{guard,on}; censuses:
  sim-warmthfuel-b-census-{guard,on}.json
- Determinism: evidence/2026-10-31/
  sim-warmthfuel-b-corpus-determinism (15215 ON
  re-run, byte-identical to the judged ON 15215 file)
