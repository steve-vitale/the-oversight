# sim-9954perstack-b — iteration-level per-stack walk on seed 9954 ONLY

Run: oversight-flesh-out-loop-b, arm sim-9954perstack-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever. This
arm does NOT re-judge the raidcallers GO, the genericremainder
PARTIAL verdict, or the 9954trace PARTIAL verdict — their verdicts
stand in their own evidence. Its verdict is ONLY whether the single
pilot row below is closed, narrowed, or left standing by the
iteration-level walk, judged ONLY against
evidence/2026-10-27/sim-9954perstack-b-prereg.md (committed as
07e0eb21e BEFORE any walk run in this arm).

## Verdict against the pre-registered GO: GO

GO required a single named door + stack identity + iteration
accounting for the FULL +3,700 analyzer residual (with the +3,800
correct-alignment figure stated alongside, never conflated), with
the walk's predicted-vs-actual remainder == 0. That is met, with
one composition fact stated in the verdict line itself rather than
buried: the mechanism is a SINGLE direct record from a SINGLE
door at a SINGLE iteration, whose items span TWO stack keys
(both named exactly below). The prereg's "stack key" wording is
read as exact stack identity — both keys listed, both amounts
exact — and the wording tightening is carried in metric review.
No remainder survives anywhere in the walk: every other interval
in the 101-interval run has D-total exactly 0, including the
post-run interval.

## Row (verbatim from sim-9954trace-b.md)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL. Survived to day 100, national rank, wave 4. Fresh +5,719
  NEW / +3,700 boundary; dried 0. Correct-alignment figure
  +3,800 kcal, stated alongside, never conflated: the 100 kcal
  difference is the day-100 inflow the analyzer counts
  pre-snapshot and the 9954trace arm proved post-snapshot.

## Step 0 — fidelity gate: PASS (faithful replay reproduces the corpus)

Seed 9954 re-run ONLY (no new seeds spent) as a FAITHFUL sweep
replication: scripts/sweep-9954perstack-b.js, vendored from
scripts/sweep-9954trace-b.js with NO capture changes except ONE
added read-only recorder (per-iteration stack snapshot + flow
array lengths at every snapshot moment, so each flow array can
be sliced exactly between consecutive snapshots). Same policy
(belongseek-nofeast), same env gates, same death suppression
(the sweep's registerDeath wrapper copied verbatim, still not
delegating to oDie). Replay output:
evidence/2026-10-27/sim-9954perstack-b-replay/
(9954perstack-b-belongseek-nofeast-s9954.json + the walk JSON).

Comparison (proof asserts each field): EVERY shared field
matches the committed raidcallers corpus
(sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json)
except `ms` and the new perstack fields — with one test-bug
correction disclosed here: the proof first compared the
9954trace-added stack fields (stackDays, stackDay100Start,
stackDay100Snap, stackPostRun) against the raidcallers corpus,
which does NOT contain them, and failed spuriously; those four
fields are compared against the 9954trace replay instead, where
they PASS, and the corpus comparison asserts their absence
there. The same applies to the stackTop truncation-window
normalization from the 9954trace arm (worktree-name length
shifts the 300-char window; normalized common-length comparison
passes on all 16 raid records). The added recorder consumed no
RNG and shifted nothing: headline (daysAlive 100, survived,
national, wave 4, deaths 7), all counters, and every list
(spoilDays 100, mealDrawRecords 1125, inflows 196,
stockdoorRecords 705, directRecords 262, raidRecords 16,
driedEvents 121, sweeps 100) deep-equal. The fidelity gate is
what proves it, not the claim.

## Step 1 — reproduction: PASS (independent recomputation)

From the NEW replay payload (proof re-derives, not via the
analyzer): NEW residual +5,719 (fresh +5,719, dried 0);
bridge stock100 +3,400 − meal100 −5,419 − cc100 0 = −2,019;
analyzer boundary residual +3,700; correct-alignment residual
+3,800. All figures match genericremainder / 9954trace exactly.

## Step 2 — the walk (scripts/walk-9954perstack-b.js)

Iteration indexing (prereg-fixed): iter 0 = opening per-stack
snapshot + flow counts; iter i (1..100) = the snapshot after
wrappedPolicy.daily of loop-day i (lockstep stackDays[i-1]);
iter 101 = post-run. 102 snapshots, 101 intervals. Stack key =
(channel, spoilDay, kcalEach, foodState). Walk scope: generic
family, fresh + dried keys together. Inflow/stockdoor records
carry no spoilDay/kcalEach, so they enter as family-channel
totals, never as invented keys.

### The walk table (only the nonzero row exists)

Running D-total (actual family total − predicted family total,
keyed flows + inflow + stockdoor) is 0 for intervals 1–34,
+3,800 at interval 35, and 3,800 flat through interval 101
(including the post-run interval, whose own D-total is 0).
There is exactly ONE nonzero interval in the entire run:

| iter | scholar days | D-total | running | doors active in the interval |
| ---- | ------------ | ------- | ------- | ------------------------------ |
| 35 | 34 -> 36 | +3,800 | 3,800 | inflow stock x1 (173); stockdoor x15 (3,400 stored, give 3,351 + 2 zero-kcal); meal pantryDraw x2 (player, other) + mealCall x17; direct player-take x8 + green_whisper.cultivate x1; raid payTribute x1; transforms 0; sweeps x2 (pantry 0) |

Interval 35 per-key divergence (D-key = actual − predicted
from keyed flows only; inflow/stockdoor NOT allocated to keys):

| stack key | prev -> actual | predicted | D-key | explanation |
| --------- | -------------- | --------- | ----- | ----------- |
| Foraged food, spoilDay 34, 200 kcal | 12u/2,400 -> 0 | -12u/-2,400 | +12u/+2,400 | cultivate record seq 124 (see mechanism) |
| Foraged food, spoilDay 36, 200 kcal | 11u/2,200 -> 4u/800 | -3u/-600 | +7u/+1,400 | cultivate record seq 124 (see mechanism) |
| Foraged food, spoilDay 37, 200 kcal | 0 -> 11u/2,200 | 0 | +11u/+2,200 | stockdoor spoilDay-37 sum in interval: 200+600+200+200+200+200+200+400 = 2,200 exactly |
| Foraged food, spoilDay 38, 200 kcal | 0 -> 6u/1,200 | 0 | +6u/+1,200 | stockdoor spoilDay-38 sum in interval: 200+200+200+200+400 = 1,200 exactly (2 zero-kcal records excluded) |
| Foraged food, spoilDay 41, 173 kcal | 0 -> 0 | -1u/-173 | +1u/+173 | inflow stock seq 81 (day 35, 173) created it; raid payTribute seq 4 took it in the same interval |
| all other generic keys (incl. all dried keys) | — | — | 0 | dried keys reconcile exactly: raid took 11u from (46,160) and 11u from (48,160); player-take took the remaining 4u from (46,160) |

D-key sum in interval 35 = 2,400 + 1,400 + 2,200 + 1,200 + 173
= 7,373 = D-total 3,800 + inflow 173 + stockdoor 3,400.
The three non-cultivate D-keys (3,573) are exactly the
interval's unkeyed inflow + stockdoor totals — they are
landing, not leaking. The residual is the cultivate pair
alone.

### The mechanism (named, with exact identity)

- Door: direct record, path green_whisper.cultivate —
  the stockdoors snapshot-diff wrapper around Game.useAbility
  (it records pantry decreases across a useAbility call,
  tagged by ability key). Exactly ONE such record exists in
  the whole run: seq 124, day 36, villager player.
- Iteration: 35 (first-divergence iteration, exact;
  scholar days 34 -> 36).
- Stack keys: (Foraged food, spoilDay 34, 200 kcal,
  foodState null) 12u/2,400 + (Foraged food, spoilDay 36,
  200 kcal, foodState null) 7u/1,400 = 3,800 kcal generic
  (the record's totalKcal is 3,820 including one Fish catch
  unit, 20 kcal — a different family's item, not part of
  the generic residual and not counted here).
- Closing arithmetic: walk running residual at the day-100
  snapshot = 3,800; mechanism = 3,800; remainder = 0.
  Per key, excluding the cultivate record from the ledger's
  draws makes the predictions exact: (34,200) 12−12 = 0 =
  actual; (36,200) 11−7 = 4 = actual. Analyzer figure:
  3,800 − 100 (the post-snapshot day-100 inflow, re-verified
  below) = 3,700. Both figures closed, never conflated.
- Why the cultivate record is the phantom count (direction
  argument, stated explicitly — the walk alone proves a
  duplication; this paragraph argues which count is phantom):
  the record's items are EXACTLY the interval's meal-draw
  items: player pantryDraw seq 466 (spoilDay 34, 200 kcal,
  11u/2,200) + other pantryDraw seq 474 (spoilDay 34, 1u/200
  + Fish 1u/20 + spoilDay 36, 7u/1,400) sum to 3,820,
  key-for-key and unit-for-unit the cultivate record. One
  physical removal (snapshot: 12u left (34,200), 7u left
  (36,200)) was counted TWICE in the ledger — once as meal
  draws, once as the useAbility diff. The meal draws are
  pantryDraw's own returned draw lists (the function really
  removed those units: it decrements units and splices
  emptied stacks). The cultivate diff is an inferred
  attribution around a call whose own purpose draws nothing
  like 3,820 from the pantry: green_whisper cultivate costs
  200 kcal per bed, paid from the scholar's kcal via
  useAbility (code comment in gardenCultivation.js), and
  3,820 is not a multiple of 200. No recorded door can
  replenish spoilDay-34/36 stacks on day 35/36 (interval
  inflows/stockdoor create spoilDay 37/38/41 only;
  transforms 0; pantry sweeps 0), so a real-removal-plus-
  replenishment story has no mechanism, while the
  double-count story has an exact item-level match. The
  follow-up (next arm) proves the nesting — e.g. whether
  the meal pantryDraw calls execute inside the useAbility
  span (the direct record is dated day 36, read after the
  call, while the meal draws inside the interval are dated
  day 35) — but it does not reopen the arithmetic: the
  ledger's +3,800 IS this record, and excluding it closes
  the walk with zero remainder.

### Door-family re-verification (from slices, not day totals)

Slice sums equal corpus totals for every door (proof
asserts): inflows 196, stockdoor 705, mealDraw 1125, direct
262, raid 16, dried 121, sweeps 100. Run-wide census matches
the 9954trace census exactly: inflow doors stock 166 /
deposit 20 / pantryAdd 10 (generic: stock only, 121);
stockdoor give sum 282,249 − kcal sum 282,200 = gap 49,
zero-kcal records 124; meal kinds pantryDraw 206 +
mealCall 919 (mealCall carries no items — a summary, not a
door); 'other' max want 1,496 < 1,500 feast floor — feast
previews did NOT fire (re-verified); direct paths
player-take 257 / npc-adult-pantry 4 /
green_whisper.cultivate 1; raid callers payTribute 10 /
villageAgencyDaily 3 / answerAccord 1 / answerAidBeg 1 /
answerNationalChoice 1 (16 records, 0 unknown); transforms
cook-racks 111 / cook-racks-split 10, in-place 111 / split
10, unlinked 0; sweeps 100, day range 2–101; alien-raid
direct paths 0. Day-100 timing re-verified: window P
(day-100 start counts -> snapshot-moment counts) has ZERO
records in every array; the post interval reproduces window
Q exactly (fresh generic 12,490 -> 10,571, net −1,919;
inflow +100, stockdoor +3,400, keyed draws −5,419,
D-total 0). 9954 survived to day 100, so no death-day
adjustment applies (stated, not assumed).

## Sense transcript (SENSE-TESTING LAW — reported, not judged)

Say lines around the divergence days (scholar 34–36) do NOT
name cultivate or any double-count: day-33 smoke line (David
cooked, 3 smoke-rack batches), day-36 smoke lines (Nathan
cooked, 8 + 5 batches), day-36 treeline line ("Night. The
treeline is just a sound now."). The say recorders cover
smoke-rack and treeline lines only — a recorder-scope gap,
recorded explicitly, not papered over. The mechanism is a
ledger phenomenon, invisible to the game's speech; the
transcript neither confirms nor contradicts it, and sense
here is reported, not judged, and never substitutes for the
arithmetic above.

## Proof (scripts/test-9954perstack-b.js)

117/117 checks PASS, exit 0 — the first exit-0 proof in this
row's lineage, and it passes for the prereg's reason (the
mechanism closes the row), not by a relaxed bar. The proof
asserts: fidelity (vs raidcallers corpus + vs 9954trace
replay, with the trace-only-field correction disclosed
above); reproduction (NEW 5,719/0, boundary 3,700, correct
3,800, bridge 3,400/5,419/100); walk slice sums, running
series consistency, first-divergence match, and the verdict
mechanism accounting (cultivate record unique run-wide and
in-interval; per-key D == item kcal; remaining D-keys ==
inflow + stockdoor; all other intervals 0; remainder 0;
analyzer reconciliation 3,800 − 100 = 3,700). Proof command
(from the worktree root): `node scripts/test-9954perstack-b.js`
(exit 0, verdict GO printed). Walk command:
`node scripts/walk-9954perstack-b.js` (exit 0; its
goCandidate field uses a narrower single-key + inflow-match
definition and is null — the test's prereg-faithful
mechanism check supersedes it for the verdict, as disclosed
above; the walk series itself is what both use). Sweep
command: `COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1 POLICY=belongseek SEEDS=9954 DAYS=100 node
scripts/sweep-9954perstack-b.js` (2s compute, written clean).
No jest (proofs are node, not jest). No [needs-eyes]: this
lands a measurement, not a player-visible change. No
game-code change: zero src/js files touched; files in this
arm: prereg, evidence, replay corpus (1 file) + walk JSON,
sweep-9954perstack-b.js, walk-9954perstack-b.js,
test-9954perstack-b.js.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered GO/PARTIAL/NO-GO did its job: the
  ±1 kcal bar was not relaxed, both figures (3,700 / 3,800)
  were judged separately from the start, and the walk's
  iteration indexing (not day labels) is what found the
  single-interval entry — a per-day walk would have smeared
  interval 35 across scholar days 35–36 and could have
  missed the exact duplication.
- Wording tightening for the NEXT prereg (not a re-score
  here): the GO clause says "stack key" (singular) but the
  found mechanism is one record spanning two keys. The
  verdict reads it as exact stack identity (keys listed),
  which the arithmetic supports, but a future prereg
  should write "exact stack identity (key or keys listed)"
  to avoid a forced PARTIAL on a wording technicality.
- Symmetric-exclusion note (honesty, not a reopening): the
  walk alone proves the meal draws and the cultivate diff
  count ONE removal twice; it does not by itself prove
  which count is phantom. The direction argument above
  (pantryDraw return lists vs inferred diff; 200-kcal/bed
  cost vs a 3,820 diff) is evidence, not walk proof. If the
  follow-up nesting proof reversed the direction (meals
  phantom, cultivate real), the ROW would still be closed
  by the same duplication with the same remainder 0 — only
  the fix target (which instrument to de-duplicate) would
  change. That follow-up is measurement, not a verdict
  change, unless it found a third count — it cannot, since
  all intervals except 35 are exactly 0.
- Instrument lesson, new in this arm: the stockdoors direct
  wrapper's header claims disjointness from mealdraw
  ("a kcal is never recorded by both instruments") because
  none of its wrapped methods call pantryDraw. That claim
  fails for useAbility: whatever pantryDraw calls execute
  inside (or across) a useAbility span are recorded twice
  — once as pantryDraw return lists, once as the useAbility
  diff. Any future ledger that sums directRecords +
  mealDrawRecords must de-duplicate ability-span draws, or
  it will re-create this exact +3,800-class residual.
- Balanced panel (MEASUREMENT.md §15): NO comparison
  exists — this arm changes no lever and no game code, so
  there is no before/after to panel. The fidelity gate
  (replay vs corpus) is the instrument before/after. Not
  forced, not faked.

## Reachability + wall numbers (reused corpus, no new band)

No new band was run (seed 9954 replay only): wall numbers are
the raidcallers numbers, not re-judged — pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20.
Seed 9954 itself: wave 4, national rank, survived 100 days.

## Village assessment (plain words)

One village, 100 days, still standing at national rank — and
its books now balance to the unit. The pantry economy is big
and busy (318,089 kcal of foraged food moved through it, weekly
tributes walking out toward Emberhold, lingering monsters
gorging at the treeline at night), and for months the books
showed 3,800 kcal that nobody could find — not a missing
feast, not a raid, not a timing trick at the last day. The
walk found it in a single stretch of play, days 34 to 36:
the village ate its meals (2,200 for the player, 1,620 more
at the edges), and the garden magic that coaxed the beds
forward got counted as if it had eaten the same meals a
second time. One removal, two tallies. Take the second tally
away and every stack in the pantry lands exactly where the
records say it should, from the first day to day 100, with
nothing left over. What knowledge/capabilities were missing:
none in the village — the gap was in the instruments
counting it. Blanks filled: (1) the 9954 generic-remainder
row is CLOSED — first-divergence iteration 35, door
green_whisper.cultivate direct record seq 124, keys
(34,200) + (36,200), 3,800 correct / 3,700 analyzer, remainder
0; (2) the per-iteration walk method itself, proven on a real
row (slices by snapshot-moment counts, no day-label
smearing); (3) the useAbility/mealdraw double-count class,
documented for every future ledger. Documented, not fixed:
no game-code change was made (DIAG only) — the fix belongs
to the counting instruments, and that is the next arm's job.

## Next arm (fix, not re-trace)

- 9954 row: CLOSED (GO above). Do NOT re-trace 9954, do NOT
  re-open day-100 timing, feast previews, alien raids,
  stockdoor carry, or cooking bonus — all excluded with
  numbers across this lineage.
- Next arm, in order: (1) a nesting proof for the cultivate
  duplication (writer-wrap replay on seed 9954: does the
  meal pantryDraw execute inside the cultivate useAbility
  span? — name the call stack, not just the equality);
  (2) the instrument fix that follows from it (de-duplicate
  ability-span pantryDraw calls in the ledger/analyzer, or
  scope the useAbility diff to exclude pantryDraw-driven
  decreases — whichever the nesting proof indicts);
  (3) a re-run of the family ledger with the fix, showing
  the generic residual at 0 on the same corpus. Only then
  is the fix landed — this arm changes no counting code,
  by design (DIAG only).

## Convergence line

closed — the 9954 generic-remainder row is closed by the
iteration-level per-stack walk: sole entry interval 35
(scholar 34 -> 36), single direct record
green_whisper.cultivate seq 124 (day 36) spanning keys
(34,200) 2,400 + (36,200) 1,400 = 3,800 correct-alignment /
3,700 analyzer, remainder 0 at the day-100 snapshot, all
other intervals exactly 0, window P zero, window Q exact.
The mechanism is a ledger double-count (meal draws +
useAbility diff counting one removal twice); the follow-up
is a nesting proof + instrument fix, not a re-trace.

## Verdict (judged against the pre-registered bar, not re-scored): GO

A single named door (direct / useAbility
green_whisper.cultivate, seq 124) + exact stack identity
((34,200) + (36,200)) + exact first-divergence iteration
(35) accounts for the FULL residual: 3,800 correct-alignment
(3,700 analyzer via the re-verified 100 gap) with remainder
0, fidelity and reproduction both PASS.
