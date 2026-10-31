# sim-strandfix-combined-b — the combined strand-fix prototype, measured

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-combined-b, axis food-economy. Worktree
sim-strandfix-combined-b. DIAG prototype: a new default-OFF
policy instrument, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file. Sibling
strandfix arms (parallel round) never imported or consumed;
the strand set is re-derived on this arm's own pinned base.
The main tree is never touched; nothing is merged by this
worker (the coordinator merges; report status: merged locally,
pending ship, via the final report).

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-strandfix-combined-b-prereg.md (commit
3c8f7a627). Pinned base 52df7e732d7e31c8cb6aae92c778f00cdebf8294
(worktree HEAD at prereg time). Primary metric: stranded
nights on the strand seed(s) vs control across guard + ON
legs, with per-evening raw-gate decomposition. GO iff
(a) the ON strand falls by >= 4 nights on FULL-ON, AND
(b) at least 1 control-both evening is converted same-day in
the variant. Prevention (variant strand ends before the
first control both-evening) is NOT conversion, by prereg
design. The fall clause's denominator is operationalized in
the prereg (legs with control strand >= 5 nights — ON only;
guard control strand is 3 and cannot fall by 4).

## Instruments

- Policy: scripts/policies/strandfix-combined-diag.js (new).
  Morning behavior on actionable stranded field mornings
  (previous loop-day: still-refused creek evening): kcal
  first (press forage + eat, 17 ticks, only when the sensed
  window holds a known food species), then sensed
  exploration walk to a standing cell adjacent to a sensed
  tree/bigtree and fell it (96 ticks, 80 kcal), or clear a
  sensed adjacent bush (+1 wood, 32 ticks, 40 kcal) when the
  deficit is exactly 1. PERCEPTION: the planner sees ONLY
  the union of 3x3 windows around cells visited this morning
  (wake cell + every cell actually stepped on). Tick
  guardrail: TICK_RESERVE = 136 (bridge 96 + routine
  allowance 40); an action fires only if projected
  ticks-left after it stays >= 136. The evening bridge is
  woodcarry's existing evening step; this file takes no
  evening action and imports no sibling arm file.
- Protection: driver constructs woodwarm with restraint R1
  when STRANDFIX_PROTECT=1 (landed woodwarm option, not an
  edit): the warmth fire acts only when the pack holds
  >= 5 logs, so bridge logs 1..4 are never spent. DEVIATION
  from warmfuel's counterfactual, disclosed in the prereg:
  live R1 suppresses the fire attempt entirely, so failed-
  fire kcal (-70 x2 on control nights 8, 10) is also saved.
- Driver: scripts/strandfix-combined-trace-b.js (adapted
  from tickbudget-trace-b.js: strandfix stack outside
  woodwarm, restraint option, kcalshort pantry/pack
  snapshots, strandfix records on evening rows; adaptation
  delta in its header). Fresh baselines: woodday driver
  verbatim, OUTDIR override only, WOODDAY=0.
- Analyzer: scripts/analyze-strandfix-combined-b.js (pure
  reads: census, strand extraction, raw-gate classes, paired
  conversion, warmfuel counterfactual, wall numbers).
- Proof: scripts/test-strandfix-combined-b.js (see Proof).

## Fresh baselines + det-gate — NO DRIFT, OFF leg exact

| leg | creek | still | rescued |
|-----|-------|-------|---------|
| fresh guard (woodday) | 12 | 3 | 9 |
| fresh ON (woodday) | 18 | 10 | 8 |
| OFF guard (strandfix driver, all off) | 12 | 3 | 9 |
| OFF ON (strandfix driver, all off) | 18 | 10 | 8 |

OFF == fresh EXACTLY on every per-seed creek/still/rescued
count, both legs (proof-checked). The strand set re-derived
on this base: only 15215 strands (guard nights 7-9, ON
nights 7-16); 15009 has ZERO creek evenings on both legs
(fifth consecutive base). All 10 seeds survived 30 days on
every leg; strandfix + driver errs 0 everywhere. The OFF-ON
control evening table reproduces kcalshort's ON table
cell-for-cell (nights 7-16: ticks-only 1, kcal-only 2,
wood-only 2, both 5; every kcal-short evening at 0 kcal),
and the OFF-ON counterfactual reproduces warmfuel exactly
(independently rescued [10, 14], first rescue night 10,
shortening 7).

## Pilot gate (8 seeds; gate-only, never mixed into judged corpora)

Pilot legs: ON-OFF, ON-FULL (protection on), plus one
extension leg disclosed here (see below). All 8 seeds
survived 30 days on every pilot leg; errs 0 everywhere.
Pilot OFF on the 8-seed subset: creek 15 / still 10 /
rescued 5 — consistent with the full-bank fresh baselines
(the two missing seeds, 15376 and 15439, contribute 3
rescued creek evenings and no still evenings).

PILOT SNIFF JUDGMENT CALL (disclosed, coordinator may
overrule): sniff (iii) — >= 1 morning gain on 15215 —
FAILED on the FULL pilot leg (3 attempts, 0 ticks spent, 0
gains: days 8-9 wood-satisfied no-ops, day 10 press
tick-deferred on a 128-tick morning). But the failure's
cause is a confound the prereg did not anticipate:
protection's day-10 rescue pre-empts the later mornings
where wood-seek would act, so FULL cannot show morning
gains by construction. The extension leg (MORN-ON pilot:
morning components on, protection off) demonstrates
morning gains (presses E 540 / 720 / 810) and the morning
component's real behavior (see below). The gate is therefore
treated as PASSED for the combined prototype — protection
decisive, morning gains demonstrated — rather than killing
a prototype whose FULL leg demonstrably moves the strand.
The alternative strict reading (kill at pilot on the FULL
sniff alone) is recorded in metric review, not hidden. No
policy code changed between pilot and confirm; the refused
fell behavior below is measured as built, not fixed mid-run
(a fix would invalidate pilot comparability).

## 1. THE COMBINED RESULT (FULL legs — the judged prototype)

### ON leg: strand 10 -> 3 nights, bridge night 10

| leg | creek | still | rescued | 15215 strand |
|-----|-------|-------|---------|--------------|
| OFF ON | 18 | 10 | 8 | nights 7-16 |
| FULL ON | 12 | 3 | 9 | nights 7-9 |
| PROT ON | 12 | 3 | 9 | nights 7-9 |
| MORN ON | 29 | 21 | 8 | nights 7-27 |

FULL-ON and PROT-ON are IDENTICAL on every per-seed count,
every 15215 evening gate, and every warmth record. FULL-ON's
entire effect is protection; the morning component
contributes literally nothing to it (strand mornings spent
0 ticks: days 8-9 wood-satisfied no-ops, day 10 press
tick-deferred on a 128-tick morning, warmth acted 0).

FULL-ON 15215 evenings:

| night | class (control) | variant | wood | kcal | ticks | warmth |
|-------|----------------|---------|------|------|-------|--------|
| 7 | ticks-only | still | 4 | 2254 | 47 | off (ticks-short) |
| 8 | kcal-only | still | 4 | 0 | 239 | R1 miss (0 spent) |
| 9 | kcal-only | still | 4 | 0 | 109 | R1 miss (0 spent) |
| 10 | wood-only | BRIDGE | 4 | 180 | 110 | — |

Paired conversion (FULL-ON vs OFF-ON): day 10
single-converted (wood-only -> bridge); days 11, 12, 13, 15,
16 prevented-early-rescue (variant already home); day 14
prevented-early-rescue. Both-evenings converted same-day: 0.

### Guard leg: FULL == OFF exactly

FULL-GUARD totals 12/3/9, strand nights 7-9, day-10 rescue
(pass: wood 4, kcal 180, ticks 110) — identical to OFF-GUARD
on every 15215 evening. Protection is vacuous warmth-off
and the morning attempts are idle (same 3 no-op/deferred
attempts as FULL-ON days 8-10). Guard fall: 0.

### GO verdict on the combined prototype

- Clause (a) STRAND FALL: HOLD. ON strand 10 -> 3 nights,
  fall 7 >= 4.
- Clause (b) BOTH-EVENING CONVERSION: FAIL. 0 control-both
  evenings converted same-day; all 5 both-evenings are
  prevented by the day-10 bridge, which by prereg design is
  NOT conversion.
- VERDICT: NO-GO (prevention, not conversion). The only
  conversion is single-gate (day 10, wood-only, by protected
  logs). Under a prevention-counts reading the verdict would
  be GO — that reading is NOT judged here; it is a revision
  proposal for the next run (see metric review). The
  prototype has not beaten the joint-failure finding: it
  never faced a both-evening and won one; it ended the
  strand before any both-evening arose, on the strength of
  the protection component alone.

## 2. COMPONENT ATTRIBUTION (why the combination is not joint)

- PROTECTION (PROT-ON): strand 10 -> 3, bridge night 10
  (wood 4, kcal 180, ticks 110), warmth acted 0 (control: 6
  acted, 4 logs spent). The live R1 result MATCHES warmfuel's
  sequential prediction (3 still nights, bridge night 10)
  exactly, despite the disclosed kcal deviation: the saved
  failed-fire kcal does not change any evening gate (variant
  day-10 kcal 180 vs control 240 — the routine earned less
  on the diverged trajectory, but still passes 60; variant
  ticks 110 vs control 238 — the morning dayTicks alignment
  shifted from 256 to 384 entry, but still passes 96).
  Protection alone is the whole FULL story.
- MORNING (MORN-ON): strand 10 -> 21 nights (nights 7-27),
  bearer death 17 -> 28 (+11 days, same bearer, same cause
  "the wild"), wave reach 15215: 1 -> 2, all-deaths 8 -> 12.
  Morning alone HURTS: it feeds exile without exiting it.
  Presses work (see §3); wood-seek never works (see §4).
  FULL-ON is not "protection + morning help": it is
  protection with morning idle. MORN-ON is not a component
  that FULL lacks: FULL's trajectory never reaches the
  mornings where MORN acts, because protection ends the
  strand first. The components do not compose — they race,
  and protection wins the race on day 10.
- TICKS (component b): the guardrail worked as designed
  and fixed nothing. On FULL, morning spend is 0 on every
  strand morning, so no ticks-short evening is created by
  the prototype. On MORN, morning spend on 256-tick mornings
  is 25-26 ticks (press 17 + steps 2-3 + refused fells 6);
  evening ticks on those days stay >= 103, so no evening is
  made ticks-short by morning spend. The two ticks-short-plus
  evenings on MORN (day 16 wood+kcal+ticks at 95, day 19
  wood+ticks at 95) occur on mornings where the prototype
  spent 0 ticks (128-tick mornings, all actions deferred) —
  their holes come from the extended trajectory's routine
  variation, not from prototype spend. Day 7 is unchanged on
  every leg (ticks-only, 47 ticks, routine + waits hole
  untouched), exactly as the prereg said a morning policy
  must leave it. Tick preservation here is a guardrail that
  prevents harm, not a lever that rescues: it defers the
  press on day 10 (FULL) and every 128-tick morning (MORN),
  and it terminates the refused-fell loop (§4) only by
  accident of arithmetic.

## 3. THE MORNING COMPONENT IN DETAIL (MORN-ON, 15215)

Presses fired on 3 mornings (all 256-tick mornings), each
with sensed known food and a walk to a fellable tree that
then refused:

| morning | wake | mKcal/mWood | press | steps | fell | morning ticks | evening |
|---------|------|-------------|-------|-------|------|---------------|---------|
| day 10 | (8,0) east | 0 / 3 | muscadine E540 -> 480 | 2 | bigtree (5,1) REFUSED | 25 | wood-only (586 kcal) |
| day 12 | (0,0) west | 0 / 2 | burdock E720 -> 660 (sensed after step 1) | 3 | bigtree (4,1) REFUSED | 26 | wood-only (1036 kcal) |
| day 14 | (8,0) east | 0 / 1 | muscadine E810 -> 750 | 2 | bigtree (5,1) REFUSED | 25 | wood-only (886 kcal) |

Press conversion is real and large: evening kcal on press
days is 586 / 1036 / 886 (control: 240 / 0 / 240). The press
turns both-evenings into wood-only evenings on days 12
(control both -> variant wood-only) and keeps day 11 both
(128-tick morning, press deferred, evening kcal 30). But
no press evening converts: wood never moves, so every
press evening still fails on wood. The walk-to-food design
works as built (day 12's burdock is sensed only after the
first exploration step — the sensed-window machinery does
walk the villager to food it had not seen from the wake
cell). The exploration walk itself is harmless in ticks
(2-3 steps) but displaces the villager: day-10/12/14
evenings end with the villager at the fell site's cell
((6,0) / (3,0) / (6,0)), and that displaced cell persists
as the next morning's wake cell.

On all other MORN strand mornings the prototype is idle:
west mornings with wood already 4 (days 8-9, wood-satisfied
no-ops) and every 128-tick morning (press, steps, and fell
all deferred by the reserve — 15 mornings of deferral on
days 11, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27
in various stop reasons). After day 16
the villager is fed (morning kcal 2098-2390, evening kcal
2100-2388) and woodless (0 logs from day 15 on): the fed
exile fedexile measured at +7 is here +11 (strand to day
27, window ends at the day-28 bearer death, not a rescue).

## 4. THE AXE GATE (the root cause of the wood-seek failure)

Every fell attempt is refused by the engine's cutTree
wrapper (src/js/storage.js): "No axe, no felling." The
stranded villager carries a Stone knife; the wrapper's
cutInfo gate (canFell) fails for bigtree/trunk work, and
the attempt costs 2 ticks with the spoken line "Your Stone
knife can't fell a giant — it takes branches, not trunks.
You need an axe." The villager has no axe on any
fell-attempt morning (days 10, 12, 14), so wood-seek by
felling fails on every morning it is tried — not merely
unattempted. This was not priced in the prototype design
(cutTree was assumed to work for any villager; the tool
prerequisite lives in a wrapper, not in game.js's cutTree
body). Caveat, stated plainly: later strand mornings never
attempted a fell (all tick-deferred on 128-tick mornings),
so whether an axe arrives later in the trajectory is
UNTESTED in this corpus — the claim is "no axe when it
mattered, days 10/12/14," not "no axe ever."

Worse, the prototype repeats the refusal: after a refused
fell, the tree still stands adjacent, wood is still short,
and the loop re-attempts — 3 refused attempts per fell
morning (day 10/12/14: 3 "can't fell" lines each in the day
transcript), stopping only when the tick guardrail bites
(256 - 17 - steps - 3x2 falls below the 136 reserve).
Recording limitation, stated plainly: the attempt record
stores only the LAST fell attempt (ticksSpent 2, wood
unchanged), so the x3 count is established from the day
transcripts + tick arithmetic (17 + steps + 6 = 25/26),
not from the record alone. The next run's fix is a canFell
pre-check (one refusal, then stop) — but that fix alone
changes nothing about conversion on fell-attempt mornings:
without an axe, the wood-seek half fails there. The design
question behind it (whether a field villager can ever
acquire an axe, and whether brush — absent from the creek
tile, 0 bushes — could substitute) is a backlog question,
not answered here. No axe on the mornings it tries, no
bridge wood, no conversion: the morning component cannot
move a wood gate on this tile on any morning it attempts
one.

## 5. SENSE-TEST (law — read end to end, judged for meaning)

FULL day 10 (the bridge evening): a coherent homecoming.
The villager works the patch ("6x Purslane (180 kcal).
This patch is picked clean"), eats it, and the bridge
builds on woodcarry's honest line ("You lash logs
together. A rough bridge spans the gap. Rough wood,
though — a bad storm could take it."), then walks into
Haven ("Knew you'd walk back in. You always do.").
PASS on mechanism, with the same quiet gap warmfuel
noted: nothing in the narration says the 4th log survived
because no fire burned it — the bridge line judges the
pack without mentioning the fire that didn't happen. The
morning prototype contributes no lines (deferred, 0 ticks),
so the day reads as an ordinary routine day that happens
to have bridge wood — which is exactly the protection
story, and exactly why protection is hard to see in play.

MORN day 12 (press + refused fell): the press reads as a
person feeding herself (Burdock 720, eaten; then routine
Muscadine 450), and the refusal reads as a person hitting
a tool wall ("Your Stone knife can't fell a giant — it
takes branches, not trunks. You need an axe.") — spoken
three times, which reads as nagging, not as a person
learning: after the first refusal a person would stop
trying the same tree. The evening refusal is honest
("the pack holds 2 logs, and a bridge needs 4") and the
failed fire follows honestly ("The coal glows... and
dies."). PASS on mechanism, FAIL on repetition texture:
the triple refusal is the prototype's loop, not the
villager's judgment.

MORN day 17 (late fed strand): a fed villager (morning
2340 kcal) working picked-clean patches, catching
fireside fragments, and sleeping out a 10th extra night
for want of wood ("the pack holds 0 logs"). It reads as
exile normalized — not starving, not working its way out,
just living at the creek because nothing in the day
reaches for wood it cannot cut. That is the fed-exile
finding in narrative form, and it is coherent precisely
because it is sad: the villager is fine and stuck.

## Village assessment (plain words)

The banked villages are the same working villages the
strand arms have always seen: all 10 survived 30 days on
every leg (ceiling effect of the window + banking
selection, not a survival claim). The story this arm adds
is a race with one winner and one casualty. Protection
wins the race on night 10: the fire that would have
burned the fourth log never lights, the bridge builds on
a fed-enough evening (180 kcal, 110 ticks), and the
villager walks home three nights after the strand opened
instead of ten — and the bearer who would have died in
the wild on day 17 lives (no player death in the window).
The morning half, left to itself, is the casualty: it
feeds the villager (presses worth 540-810 kcal) and walks
her to trees she cannot cut, so she survives longer at
the creek — eleven extra nights, fed, woodless, dying
there on day 28 instead of day 17. The village at home is
not poor through any of this: the home pantry holds
21,968 kcal on night 7 and grows past 30,000 by night 16
on control, while the stranded villager's problem was
never the village's stock — it was a log the fire ate,
and then an axe she didn't have. The combined prototype,
as built, is protection wearing a morning costume: the
costume does nothing on the winning leg and hurts on its
own leg, and the win belongs to the fire that never lit.

## Reachability

No new content reached by a game change (no game change
landed — policy variant only, default off). Creek/bridge
content reached on every leg. Wave reach on the 10-seed ON
legs (maxWaveUnlocked per seed): wave >= 1 on 10/10 on all
legs; wave >= 2 on 8/10 OFF, 8/10 FULL, 8/10 PROT, 9/10
MORN (15215 reaches wave 2 on the longer fed trajectory
only); wave 3 on 1/10 all legs (15439); waves 4-5 not
reached in this 30-day window (same window as all prior
strand arms). No per-seed wave movement except 15215 on
MORN; all other seeds are byte-identical per-seed on
creek/still/rescued and wave reach across every leg.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field)
— reported as the window's structural value, not a game
verdict: national 0/10, table 0/10, wins 0/10 on all legs
(the legs contain no national/table/win content). Median
survival: 30 days (all 10 seeds survived 30 days on all
legs — ceiling effect of the window + banking selection,
not a survival claim). Death-delay: FULL/PROT — control
player death day 17 ("the wild") -> variant NO player
death in the window (avoided, not a delay number);
MORN — day 17 -> day 28 (+11 days, same bearer, same cause
"the wild"); guard legs — no player death on either leg.

## Proof

scripts/test-strandfix-combined-b.js: 292/292 checks pass
(37 pure unit tests + 255 corpus checks), including: gate
and budget unit cases (reserve boundary 120 allows / 121
denies on 256 ticks); sensed-view planning on fixture grids
(west walk to a bigtree standing cell in 3 steps; unsensed
bigtree invisible to the planner); classification unit cases
for all classes + kcalLive fallback; warmfuel counterfactual
fixture (rescued [10, 14], shortening 7); paired-conversion
fixture (both-converted / still / prevented-early-rescue);
corpus checks (10/10 seeds on all 8 judged legs, 30
evenings + 30 days alive per seed, strandfix errs 0;
OFF == fresh per-seed on both legs; determinism FULL-ON
15215 re-run byte-identical; tracked-diff guard: src/
clean, scripts/policies/ gains only
strandfix-combined-diag.js, no existing file modified).
Instrument notes (disclosed): the pilot OFF leg ran under
the driver's default OUTDIR (corpus-on-control) because
OUTDIR was exported only for the FULL pilot leg; the dir
was renamed to corpus-pilot-on-off before commit (file
bytes untouched). The first batch-1 command's pilot
naming accident is the only transport deviation; no judged
number comes from a pilot file.

## Metric review

- The fall-clause denominator operationalization behaved
  as the prereg predicted: guard (control strand 3) cannot
  fall by 4, so the judged denominator is ON only. The
  literal both-legs reading would verdict NO-GO on the fall
  clause too (guard fall 0 < 4) — recorded, not substituted.
- Prevention vs conversion is the verdict's load-bearing
  distinction, and this run is the case that proves why the
  prereg drew it strictly: FULL shortens by 7 AND converts
  nothing joint. If the coordinator rules prevention counts,
  the verdict under that reading is GO (fall 7 + strand
  rescued) — but that ruling must come from the coordinator
  for the NEXT run, not as a re-score of this one. A future
  prereg that counts prevention must also say what, if
  anything, distinguishes a joint-fix prototype from a
  protection-only prototype that happens to rescue early —
  because on this evidence they are the same trajectory.
- The tick-reserve value 136 (96 + 40) behaved as a
  guardrail, not a measurement: it deferred every 128-tick
  morning and terminated the refused-fell loop, but it
  never decided a conversion (no evening sits within 40
  ticks of the bridge need on a prototype-acted morning).
  The reserve's routine allowance (40) exceeds every
  observed non-day-7 routine spend on acted mornings
  (17-33), so no reserve revision is proposed — but the
  reserve also never faced a morning where a fell would
  have fit AND converted, because no fell ever succeeded.
  The reserve is untested as a conversion enabler, only as
  a deferral rule.
- The pilot sniff confound (FULL pre-emption) is a
  threshold-design lesson for the next combined prereg:
  a sniff that requires morning gains on the FULL leg will
  always fail when an early component rescues first. The
  sniff should be specified per component leg (morning gains
  judged on the morning-only leg, protection judged on the
  protection-only leg), not on the combined leg alone. The
  extension leg used here is the corrected form, applied
  transparently mid-pilot and disclosed, not hidden.
- The warmfuel counterfactual's live validation is the
  run's cleanest methodological result: live R1 reproduces
  the accounting prediction exactly (3 still nights, bridge
  night 10) despite the kcal deviation, because neither the
  saved failed-fire kcal nor the dayTicks alignment shift
  crosses an evening gate. Counterfactuals of this form
  (preserved-log accounting with gates held at observed
  values) are trustworthy predictors here — but only for
  the protection component, and the analyzer's
  counterfactual output on VARIANT legs (e.g. MORN) is NOT
  valid (its warmth spends differ from control's) and is
  never quoted in this evidence.
- The fell-record limitation (only the last attempt stored)
  understated the refused-fell count in the record; the
  x3 count comes from transcripts + tick arithmetic. A
  future prototype must log every attempt (or stop after
  the first refusal via a canFell pre-check, which is the
  substantive fix, not just a logging fix).
- No metric revision is proposed for the raw-gate classes,
  the strand definition, or the paired-conversion verdicts:
  they separated the outcomes cleanly (single-converted vs
  prevented vs still vs extended), which is exactly why the
  verdict can say protection rescued early, morning extended
  late, and nothing converted a both-evening — instead of
  just "strand shortened by 7."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — narration/repetition — REFUSED
  FELL LINE REPEATS 3x PER MORNING (this arm): the
  prototype's re-attempt loop prints "Your Stone knife
  can't fell a giant..." three times on each fell morning.
  A person would stop after the first refusal; the
  repetition is the loop's, not the villager's. A canFell
  pre-check fixes both the ticks and the narration.
  (evidence: this file; MORN-ON corpus, 15215 day 12.)
- [open, re-confirmed] 2026-10-30 — food-economy/drift —
  15009 STRAND LOSS STANDS, FIFTH BASE: 15009 has 0 creek
  evenings on both legs on base 52df7e73, exactly as on
  the wakeforage, pressb, kcalshort, strandbank, and
  warmfuel bases. (evidence: this file's fresh baselines.)

## Verdict

NO-GO (prevention, not conversion). Clause (a) holds (ON
strand 10 -> 3, fall 7 >= 4); clause (b) fails (0
both-evenings converted same-day; the sole conversion is
day-10 wood-only, by protection alone). Component verdicts:
protection GO-equivalent on its own terms (live R1
reproduces warmfuel's prediction exactly and rescues the
strand at night 10); morning NO-GO on its own terms
(presses gain kcal but never wood — axe gate — and the
strand extends 10 -> 21 nights, fed but woodless, death
delayed 17 -> 28); tick guardrail neutral (prevents harm,
rescues nothing, day 7 untouched). The combined prototype
as built does not beat the joint-failure finding, because
its only rescue arrives before any both-evening exists and
its joint half cannot cut wood on any morning it tries. What would beat it is now
precisely priced: a wood source the villager can actually
use without an axe, or an axe in the villager's hand, plus
a morning that survives the 128-tick days — the next arm's
design problem, not this run's re-score.

## Files

- Prereg: evidence/2026-10-30/sim-strandfix-combined-b-prereg.md
  (commit 3c8f7a627; pinned base 52df7e732d)
- Evidence (this file): evidence/2026-10-30/sim-strandfix-combined-b.md
- Paired compare (NOT an official panel run):
  evidence/2026-10-30/sim-strandfix-combined-b-compare.md
- Policy: scripts/policies/strandfix-combined-diag.js;
  driver: scripts/strandfix-combined-trace-b.js; analyzer:
  scripts/analyze-strandfix-combined-b.js; proof:
  scripts/test-strandfix-combined-b.js (292/292)
- Fresh baselines: evidence/2026-10-30/
  sim-strandfix-combined-b-corpus-base-guard, -base-on
- Judged corpora: evidence/2026-10-30/
  sim-strandfix-combined-b-corpus-off-guard, -off-on,
  -full-guard, -full-on, -prot-on, -morn-on
- Determinism: evidence/2026-10-30/
  sim-strandfix-combined-b-corpus-det-full-on (15215 FULL-ON
  re-run, byte-identical to the judged FULL-ON 15215 file)
- Pilot (gate-only): evidence/2026-10-30/
  sim-strandfix-combined-b-corpus-pilot-on-off,
  -pilot-on-full, -pilot-on-morn
