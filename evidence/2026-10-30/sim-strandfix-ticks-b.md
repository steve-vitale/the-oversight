# sim-strandfix-ticks-b — creek-wake hold day: does removing routine ticks rescue the strand?

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-ticks-b, axis food-economy. Worktree
sim-strandfix-ticks-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. One new policy
instrument (default OFF), one new driver, one analyzer, one
proof script. Sibling trees, claims, and branches never
touched. The main tree never touched. Every judged number
below comes from THIS arm's own legs on the pinned base;
sibling corpora (tickbudget, fedexile, kcalshort, warmfuel,
strandbank) were read for orientation and prereg grounding
only, never used as judged input.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-strandfix-ticks-b-prereg.md (commit
e80aec29). Pinned base 52df7e732d7e31c8cb6aae92c778f00cdebf8294
(worktree HEAD at prereg writing time; this base is NEWER
than tickbudget's pin f52f08600, so nothing from prior arms
is quoted as current without the fresh legs below).
Primary metric: ticks-short evenings on the strand seed(s),
control vs instrument, summed across guard + ON legs, with
per-evening shortfall and attribution class.
GO threshold, judged exactly as written: GO iff
ticks-short evenings fall by >= 2 across guard + ON
(control-variant total minus instrument total) AND at
least 1 control ticks-short evening is converted to
rescued/bridge-built (same seed, same loopDay, same
WOODWARM leg, creek evening with bridge attempted +
built). A fall driven only by ticks-cleared-not-rescued
evenings is NO-GO; a single conversion with a fall of 1
is NO-GO. Day 7 is reported separately, NOT part of the
GO bar, with the prereg expectation NOT MOVED (haven
wake, hold gate does not fire).

## Instruments (reuse + one policy + one driver, no reinvention)

- Variant policy: scripts/policies/pressb-diag.js UNMODIFIED
  (PRESSB=1 arms the morning press + eat; PRESSB=0 delegates
  untouched).
- NEW policy: scripts/policies/strandfix-ticks-diag.js
  (default OFF; STRANDFIX=1 arms it). Creek-wake hold day:
  at daily entry, if the villager woke on a creek tile, is
  not inside haven, is not in a tent, is not dead or in
  combat, and morningDayTicks >= 384 (ticksLeft <= 128),
  skip the competent routine and run ONLY nighttravel's
  exported nightStep (with nighttravel.daily's ctx
  bookkeeping), so the evening travel attempt and the
  outer woodcarry bridge decision still happen. The
  wrapper never calls microMove, cutTree, clearBrush,
  forage, eat, or travelTo itself. It is a DESIGN
  MEASUREMENT — the upper bound of routine-trimming on
  creek days ("if the villager spent the strand day idle
  at the creek, would the bridge build?") — NOT a
  proposed villager behavior; a real design built on a
  GO here would trim selectively, not idle the whole
  day. The WAITS part of the hole is NOT moved by any
  policy: the 384 waits ticks are spent before daily
  entry, and no policy can unspend them (waits alone
  leave 128 >= 96, so waits alone never strand;
  routine + waits do).
- Control driver: scripts/tickbudget-trace-b.js UNMODIFIED,
  OUTDIR override only.
- NEW driver: scripts/strandfix-ticks-trace-b.js (adapted
  from tickbudget-trace-b.js with ONLY the prereg-disclosed
  changes: strandfix stack insertion + STRANDFIX FATAL gate,
  strandfix-layer pure-read tick probe, strandfixHold/Skip
  on evening rows, fullDaySay also on held mornings).
- Analyzer: scripts/analyze-strandfix-ticks-b.js (pure reads:
  raw-gate classification, ticks-short split, tickbudget
  attribution classes, hold census + routine-zero probe
  check, paired conversion table, strand extraction,
  guardrail census, warmth comparison, death-delay pairing,
  wave reach, wall numbers, §15 paired compare .md).
- Proof: scripts/test-strandfix-ticks-b.js (295/295, see Proof).
- Disclosure (analyzer fix, post-pilot, pre-confirm):
  the analyzer as committed in e80aec29 crashed on its first
  pilot run (two undefined identifiers in the census assembly
  lines: `instrument` for `instr`, `instrumentTicksTotal` for
  `instrTicksTotal`). The fix renamed the two identifiers and
  nothing else — no definition, threshold, gate, or leg changed
  — and the pilot analyzer was re-run with the fixed script
  before any confirm leg. Policy, driver, proof, and prereg
  are byte-identical since e80aec29 (verified by diff);
  only the analyzer differs, by those two lines.
- Pilot gate (8 seeds x 4 legs, before confirm spend):
  all 32 pilot files present, errs 0; strandfix rows cover
  every instrument pilot loop-day (holds + skips = 240 per
  instrument pilot leg); routine-zero probe check holds on
  every pilot hold evening (strandfix probe 0, no
  nighttravel probe); every pilot creek evening classifiable
  by raw gates (0 null-gate evenings) — all four held, so
  confirm spend was authorized. The pilot is an instrument
  gate, not a verdict: no judged number comes from pilot
  legs alone (pilot compare: fall 4, conversions 0 — the
  same shape the confirm legs then judged).

## Band reproduction + strand-set re-derivation (pre-registered report, not a bar)

Canonical strand census (control-control legs, PRESSB=0,
this arm's own legs on the pinned base):

| leg | creek | still | rescued | ticks-short |
|-----|-------|-------|---------|-------------|
| guard (fresh) | 12 | 3 | 9 | 1 |
| ON (fresh) | 18 | 10 | 8 | 1 |

Exactly kcalshort's / fedexile's / strandbank's /
tickbudget's fresh numbers on the guard and ON control
legs (guard 12/3/9, ON 18/10/8) — NO DRIFT on the
canonical legs despite the newer base. The strand set is
re-derived, not inherited: only 15215 strands (guard
nights 7-9, ON nights 7-16); 15009 has ZERO creek
evenings on both legs (it does not strand, does not even
visit a creek evening — the #1554 loss stands on a
fifth base). Per-seed control-control table: every other
seed's creek evenings are all rescued (15003 1/0/1, 15091
1/0/1, 15211 2/0/2, 15337 1/0/1, 15376 2/0/2, 15439 1/0/1,
on both legs); 15009, 15220, 15221 have 0 creek evenings.
All 10 seeds survived 30 days on every judged leg; errs 0
on all 8 confirm legs; non-creek refused evenings 0 on
the canonical legs (every classified refusal is a creek
refusal).

Control-variant legs (PRESSB=1, the GO bar's control),
this arm's own legs:

| leg | creek | still | rescued | ticks-short |
|-----|-------|-------|---------|-------------|
| guard variant | 13 | 4 | 9 | 2 |
| ON variant | 25 | 17 | 8 | 4 |

These reproduce tickbudget's guard-variant (13/4/9) and
fedexile's ON-variant (25/17/8) totals exactly on the new
base — the variant censuses did not drift either.

## 1. THE CONTROL TICKS-SHORT CENSUS (judged measurement)

6 ticks-short evenings, ALL on seed 15215, ALL still
evenings. Split: alone 3, plus-wood 2, plus-both 1,
plus-kcal 0. Full arithmetic per evening (need 96 ticks;
anatomy = waits + press + routine + carry = decision
dayTicks; warmth, if any, runs after and is excluded):

| leg / day | class | wood | kcal | ticksLeft | shortfall | anatomy (waits + press + routine + carry = dayTicks) | attribution |
|-----------|-------|------|------|-----------|-----------|--------------------------------------------------------|-------------|
| guard variant d7 | alone | 4 | 2254 | 47 | 49 | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| guard variant d10 | alone | 4 | 500 | 93 | 3 | 384 + 17 + 18 + 0 = 419 | PRESS-DECISIVE |
| ON variant d7 | alone | 4 | 2254 | 47 | 49 | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| ON variant d13 | plus-both | 2 | 0 | 95 | 1 | 384 + 0 + 33 + 0 = 417 (+48 warmth after) | ROUTINE-ONLY |
| ON variant d18 | plus-wood | 0 | 1246 | 93 | 3 | 384 + 17 + 18 + 0 = 419 | PRESS-CONTRIBUTING |
| ON variant d22 | plus-wood | 0 | 1420 | 93 | 3 | 384 + 17 + 18 + 0 = 419 | PRESS-CONTRIBUTING |

Attribution notes (counterpart = control-control, same
seed, same loopDay, same WOODWARM):
- PRESS-DECISIVE, guard d10, ISOLATED on the fresh base
  exactly as tickbudget found it: press 17 >= shortfall
  3; counterpart control-control d10 is NOT ticks-short
  (ticksLeft 110, bridge built, rescued); and the probe
  isolates the press — counterpart routine total equals
  variant routine total (18 == 18), so the press is the
  only differing cost that day. Without the press, the
  variant evening stands at 402 dayTicks / 110 ticks
  left — the bridge builds. This is the census's one
  isolated morning-behavior-strands-an-evening case,
  reproduced on a newer base with identical arithmetic.
- PRESS-CONTRIBUTING, ON d18/d22 (plus-wood): the press
  fires (17 ticks) and the ticks hole is exactly
  shortfall 3, but the wood gate fails regardless (0
  logs), so the still outcome stands with or without
  the press. No decisive claim is made or available.
- ROUTINE-ONLY, day 7 on both legs (no press fired;
  routine 81 on top of 384 waits; counterpart routine
  totals equal, 81 == 81) and ON d13 (no press fired;
  routine 33; counterpart routine differs, 17 vs 33, so
  d13 stays at observed difference, and its outcome is
  wood+kcal-decided regardless — same limit tickbudget
  reported).

## 2. THE HOLD CENSUS (instrument legs)

Holds fire ONLY on 15215, on BOTH instrument legs, and
only with morningDayTicks 384 (every hold morning):
guard 5 holds (loopDays 9-13), ON 8 holds (loopDays
9-16). No other seed holds on either leg (holds 0 on
the other 9 seeds, both legs) — the gate is narrow in
practice, not a general day-shortener. Every hold
evening passes the routine-zero probe check:
strandfix probe spent 0, NO nighttravel probe record
(inner.daily never ran — the competent routine is
provably absent, not merely small). Every hold evening
ends ticks 128 (384 waits + 0 routine + 0 press — the
press never fires on any instrument leg, see §3), wood
and kcal as listed:

| leg | hold days (evening wood / kcal / ticks) |
|-----|------------------------------------------|
| guard | d9 4/0/128, d10 4/0/128, d11 4/0/128, d12 4/0/128, d13 4/0/128 |
| ON | d9 4/0/128, d10 3/0/128, d11 3/0/128, d12 2/0/128, d13 1/0/128, d14 0/0/128, d15 0/0/128, d16 0/0/128 |

Note what the hold does NOT do: it never creates a fed
morning (morning kcal on hold days is 0 throughout,
after d8's 44 is spent) and never gains a log (evening
woods walk down only by warmth spends on ON legs).
The hold preserves ticks and nothing else — which is
why §3's conversion table reads the way it does.

## 3. THE INSTRUMENT RESULT (judged measurement)

Instrument legs (PRESSB=1, STRANDFIX=1), this arm's own
legs:

| leg | creek | still | rescued | ticks-short |
|-----|-------|-------|---------|-------------|
| guard instrument | 15 | 7 | 8 | 1 |
| ON instrument | 18 | 10 | 8 | 1 |

ON instrument totals EQUAL the control-control ON
totals (18/10/8) exactly — in census terms the ON
instrument leg IS the unfed strand with holds: the
press never fires, so the fed extension (variant
25/17/8) never happens, and the strand runs its unfed
course (7-16) with ticks cleared on hold days.

Conversion table (control ticks-short -> instrument
same seed, same loopDay, same WOODWARM leg):

| leg / day | control | instrument same-day | outcome class |
|-----------|---------|--------------------|---------------|
| guard d7 | alone 47 (shortfall 49) | wood 4, kcal 2254, ticks 47, held false | still-ticks-short |
| guard d10 | alone 93 (shortfall 3) | wood 4, kcal 0, ticks 128, held true | ticks-cleared-not-rescued |
| ON d7 | alone 47 (shortfall 49) | wood 4, kcal 2254, ticks 47, held false | still-ticks-short |
| ON d13 | plus-both 95 (shortfall 1) | wood 1, kcal 0, ticks 128, held true | ticks-cleared-not-rescued |
| ON d18 | plus-wood 93 (shortfall 3) | no creek evening (completed, villager home) | no-creek-evening (NOT a conversion) |
| ON d22 | plus-wood 93 (shortfall 3) | no creek evening (completed, villager home) | no-creek-evening (NOT a conversion) |

GO-bar arithmetic: control ticks-short total 6 (guard
2 + ON 4) -> instrument total 2 (guard 1 + ON 1, both
day 7) = FALL 4 (>= 2, clause PASS). Bridge-built
conversions: 0 (clause FAIL). The two ticks-cleared
evenings (guard d10, ON d13) are still still evenings
— guard d10 strands on kcal (0 vs 60), ON d13 strands
on wood + kcal (1 log, 0 kcal) — and the two
no-creek evenings (ON d18/d22) are NOT conversions
under the prereg: the villager is home those nights
because the instrument strand ended at day 16 (the
unfed course), not because a bridge was built on
those days. Counting either class as a conversion
would misstate the result, and neither is counted.

### Why the rescue clause fails: the hold suppresses the press

Press attempts, whole bank: control-variant guard 1
(15215 d10, E 450), control-variant ON 4 (15215 d10
E 540, d14 E 900, d18 E 810, d22 E 990); instrument
guard 0, instrument ON 0 — on ALL seeds, both legs.
The mechanism is positional, and it is measured, not
inferred: on the control guard leg, the d9 routine
walks within the creek tile from the west corner
(wake cell (0,0): dirt, grass, water — nothing green)
to the east corner (wake cell (8,0)), where the
morning sweep holds assigned, known muscadine (1
known-capable cell, species muscadine) — so the d10
press fires. On the instrument guard leg, the d9 hold
freezes the villager at the west corner: the d10
morning sweep holds dirt, grass, water and 0
known-capable cells, so the press skips
'no-known-kcal' — and it skips that way on every
instrument strand morning (all instrument press skips
on 15215 are 'no-known-kcal' except boundary
haven/prev-not-stranded days). The hold preserves
ticks by freezing position, and the frozen position
is the foodless corner; the routine day the hold
replaces is the day that walks the villager to the
food. A selective trim that skipped expensive beats
but kept the within-tile walk to the green patch
might preserve both — that is the next design's
question (see Out-of-scope findings), not a result
claimed here. The press-suppression is structural,
not seed noise: it holds on both legs, all 13 hold
days, with 0 press attempts on either instrument leg.

### Costs of the hold (secondary, reported with the verdict)

- GATE-SHIFT COST, guard d11: control guard d11 is
  RESCUED (press-fed bridge: wood 4, kcal 60, ticks
  111); instrument guard d11 is STILL (wood 4, kcal 0,
  ticks 128, held). The hold does not merely fail to
  rescue d10 — by suppressing the press, it LOSES
  the d11 rescue the control leg already had. Guard
  still evenings rise 4 -> 7, rescued fall 9 -> 8.
  Guard d12/d13 are strand-extension evenings (the
  control villager is home those nights; the
  instrument villager is still stranded) — a
  consequence of the d11 loss, listed separately from
  the d11 gate-shift, not as independent gate-shifts.
- NEWLY-TICKS-SHORT: none (0 on both legs) — the hold
  creates no new time failure anywhere on the bank.
- DEATH-DELAY (bearer-death day, control-variant ->
  instrument; every other seed identical, 0 or
  CENSORED): guard 15215: none -> day 13 (cause
  sickness; the successor wakes at haven on day 14 —
  the instrument guard strand ends by succession,
  not by rescue). ON 15215: day 23 -> day 17 (delay
  -6, same bearer, same cause "the wild") — the fed
  death-delay (+6, fedexile) is exactly reversed:
  the unfed villager dies on the unfed day (17,
  identical to control-control ON's bearer-death day).
  All-deaths on 15215: guard 12 -> 11, ON 14 -> 10
  (fewer combat entries on the shorter, unfed
  trajectories).
- WARMTH: instrument ON warmth acted evenings are
  IDENTICAL to control-control ON warmth (6 acted:
  d8 failed, d9 spend 4->3, d10 failed, d11 spend
  3->2, d12 spend 2->1, d13 spend 1->0) — the hold
  does not change the warmth ledger; the ON
  instrument strand burns its logs exactly as the
  unfed strand does. Control-variant ON warmth acted
  8 (the longer fed trajectory's extra nights).
- WAVE REACH: guard 15215 falls 3 -> 2 (the
  press-fed fight-richer trajectory is gone; w3 seeds
  guard: control 15215 + 15439, instrument 15439
  only); ON 15215 stays 2 on both legs; every other
  seed's wave reach is identical control vs
  instrument on both legs (w1 10/10, w2 9/10, w3
  1/10 on instrument legs; waves 4-5 in 0/10
  everywhere in this 30-day window). The ON
  instrument's wave 2 vs control-control ON's wave 1
  for 15215 is reported as observed, mechanism not
  isolated (same class as fedexile's guard wave
  note) — it does not change the verdict.
- KCAL/WOOD GATES ON CONVERTED EVENINGS: vacuous —
  there are no converted evenings, so no gate-shift
  rescue is claimed anywhere. The two ticks-cleared
  evenings are explicitly NOT rescues (see table).

## 4. DAY 7 (reported separately, NOT part of the GO bar)

NOT MOVED on either leg, exactly as the prereg
expected — and the mechanism is confirmed, not
assumed: day-7 mornings wake AT HAVEN on both
instrument legs (inside, tile haven, 4 logs, 2364
kcal, morningDayTicks 384), so the creek-wake gate
does not fire (held false, both legs); the routine
runs whole (81 ticks); the evening arithmetic is
identical to control on both legs (wood 4, kcal
2254, ticks 47, shortfall 49, skip ticks-short).
The day-7 transcript is byte-identical control vs
instrument on the guard leg (26 lines — the full,
varied haven day: wetland, forest floor, the raccoon
with too many fingers, learning Old World Caches,
knapping a Stone knife, meeting Dakota — ending 47
vs 96). No morning-behavior design and no
creek-wake design can move day 7, because day 7's
morning is not a creek morning: the villager starts
the day at home with a bridge's worth of logs and
food, travels out, and runs out of day at the creek.
The day-7 hole (49 ticks, routine + waits, no
morning behavior to budget) stands exactly as
tickbudget priced it, on a second base.

## Sense-test (law — read end to end, judged for meaning)

(a) FIRST TICKS-CLEARED EVENING, guard instrument
d10 (no converted evening exists, so the prereg's
fallback applies): the day's full transcript is
TWO lines — "The creek runs fast here — no crossing
without a bridge or a swim." and "No bridge tonight
— 0 kcal in hand, and the lashing takes 60." That
is the instrument's cost made visible: a person who
spent the whole day idle at a creek, foraging
nothing, learning nothing, meeting no one, and
ending the day exactly as hungry as it started, with
time to spare (128 ticks) that buys nothing because
the hands are empty. The ticks gate is cleared and
the evening is no better for it — the day reads as
an absence, not as a person saving time for a
bridge. PASS on mechanism (the transcript proves
the hold did what it claims: routine 0, ticks 128),
FAIL on sense as a behavior (nobody would play
this day). That pair is the verdict in miniature:
the bound is real and the behavior is not.
(b) ON instrument d13 (ticks-cleared, plus-both):
three lines — creek line, wood refusal ("the pack
holds 1 log, and a bridge needs 4"), warmth fire
catching ("The tinder catches. A real flame,
breathing."). Same shape: time preserved, bridge
unbuilt, fire burning the last log. The warmth line
still never connects the spend to the bridge (the
warmfuel narration gap, unchanged by this arm).
(c) NEAR-MISS TEXTURE: tickbudget's finding (the
decisive evening draws no reaction to the near-miss)
is CHANGED by this instrument, and only in this
narrow sense: guard d10 no longer strands on a
3-tick near-miss at all — its line is now a
60-kcal food failure (0 in hand), not a near-miss.
The near-miss disappears with the ticks gate; no
reaction to it is needed because there is nothing
near about 0 kcal. No wording change is proposed
or measured here; the texture change is reported
because the instrument caused it, not as a design
recommendation.

## Villager-behavior sample (out of the sims)

Outside hold days, the villages read as before:
haven days with teaching, gossip, and fight reports
in voice; the day-7 routine day reads as a person
living a whole day. Hold days read as the opposite
— two-to-three-line days with no foraging, no
learning, no social beat — which is the instrument
working as specified, not a villager bug: the policy
tells the villager to do nothing, and the transcript
shows nothing done. No static or repeated villager
routines beyond fedexile's already-filed Tao
catchphrase note (not re-observed here — no teaching
lines appear in the hold-day transcripts, and the
sampled haven days vary). Nothing here changes the
arm's verdict.

## Reachability

No new content reached by a game change (no game
change landed — policy instrument only, default
off). Creek/bridge content reached (control-variant:
guard 13 creek evenings, 9 rescued; ON 25 creek
evenings, 8 rescued; instrument: guard 15 creek
evenings, 8 rescued; ON 18 creek evenings, 8
rescued). Waves 1-2 in 9/10 banked villages on every
judged leg, wave 3 in 1-2/10 (15439 everywhere;
15215 additionally on control-variant guard only);
waves 4-5 not reached in this 30-day window (same
window as pressb/wakeforage/woodday/fedexile/
tickbudget). The instrument moves wave reach on
exactly the seed it strands (15215 guard 3 -> 2),
nowhere else.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no
field) — reported as the window's structural value,
not a game verdict: national 0/10, table 0/10, wins
0/10 on all 8 confirm legs (the legs contain no
national/table/win content, and the driver records
no such fields — same standing as fedexile/
tickbudget). Median survival: 30 days (all 10 seeds
survived 30 days on all 8 legs — ceiling effect of
the window + banking selection, not a survival
claim). Death-cause pairing (bearer deaths,
control-variant -> instrument): ON 15215 day 17 ->
day 23 in the fed direction (instrument dies
earlier, see §3); guard 15215 none -> day 13
(sickness); every other seed identical across legs
(15091 days 8 + 30, 15009 day 18 contest, 15221 day
31, 15376 day 17, rest none).

## Verdict against the prereg

- NO-GO (judged exactly as written; a miss is NO-GO,
  never re-scored). Fall clause: PASS — ticks-short
  evenings fall by 4 (control 6 -> instrument 2,
  guard 2 -> 1, ON 4 -> 1), >= 2. Rescue clause:
  FAIL — bridge-built conversions 0, < 1. Both
  clauses must hold; one does not. The fall is real
  (the hold clears the ticks gate on every hold
  evening it touches: guard d10, ON d13, plus the
  strand-ending that removes ON d18/d22 as creek
  evenings), but no ticks-short evening becomes a
  bridge-built rescue — because the evenings whose
  ticks gate clears strand on kcal and/or wood, and
  the one evening whose gates could all pass (guard
  d10, press-fed) loses its feed to the hold itself.
- DAY-7 CLAUSE: NOT MOVED on either leg (still
  ticks-short, identical arithmetic, held false) —
  the prereg expectation holds, and the mechanism
  (haven wake) is confirmed on the fresh base.
- This verdict certifies the hold measurement; it
  does NOT land any behavior, flip any default, or
  rule the design question. The instrument as built
  (whole-day idle on creek days) must NOT be shipped
  in any form: it clears ticks gates while losing a
  rescue (guard d11), bringing a bearer death
  forward on both legs (guard new death day 13,
  ON -6 days), and emptying the strand days it
  touches. What the measurement DOES establish, for
  the coordinator's next design: routine ticks are
  removable (routine-zero holds on all 13 hold days
  with 0 reconciliation mismatches), the ticks gate
  clears whenever routine is removed (every hold
  evening ends ticks 128), and the binding
  constraint on a selective trim is NOT the ticks
  budget — it is keeping the within-tile walk that
  feeds the press (west corner -> east muscadine
  patch) while skipping the expensive beats. A trim
  that keeps the walk and skips the rest is the
  design this bound motivates; a trim that idles
  the day is refuted by this run's costs.

## Proof

scripts/test-strandfix-ticks-b.js: 295/295 checks pass
on the judged corpora, including: pure gate tests
(all fire/skip branches incl. 384 boundary, haven
wake, tent, combat, game-over, null morningDayTicks);
raw-gate classification (all four ticks-short splits
+ 96/95 boundary + kcalLive fallback); attribution
classes (decisive / contributing / routine-only +
missing-counterpart-never-decisive + plus-never-
decisive); conversion classes (incl. rescued-requires-
built and avoided-evening-is-not-conversion);
reconciliation arithmetic fixtures (day-7, day-10,
hold shapes); strand extraction (rescued breaks,
non-creek breaks); corpus checks (12 corpus dirs:
4 pilot x 8 seeds + 8 confirm x 10 seeds, errs 0
everywhere, press ticksSpent == 17 on every fired
morning, strandfix rows cover every instrument
loop-day, hold evenings carry no nighttravel probe,
det-gate legs carry 0 holds, pilot==confirm
byte-identical on all 32 overlapping files,
det-gate census + trajectory identity 0 mismatches,
reconciliation mismatches 0 on all 8 confirm legs,
src/ diff empty vs pinned base 52df7e732, no
pre-existing policy/script file modified, no stray
untracked scripts/src). Pure tests alone: 36/36
before any leg (prereg commit e80aec29).

## Metric review

- Leg-total fall vs paired-evening fall: the leg
  total is the right GO unit here, and this run
  proves why — the hold changes later days'
  trajectories (press suppression, strand ending),
  so a paired-evening fall would undercount the
  effect (ON d18/d22 have no instrument creek
  evening at all) while hiding the mechanism. The
  paired conversion table alongside the leg total
  is what keeps the fall honest: the fall (4) is
  decomposed into ticks-cleared (2), strand-ended
  (2), and still-ticks-short (2), with zero
  conversions — a fall-only headline ("ticks-short
  down 4") without that decomposition would have
  misread as a fix.
- Ticks-cleared-not-rescued counting toward the
  fall: they do count (they are no longer
  ticks-short), but never toward the rescue clause —
  that split is what makes the NO-GO verdict
  possible instead of a misleading GO. Keep the
  split, always.
- The hold's kcal cost (skipped routine foraging
  that would have fed the evening) IS priced in the
  verdict: guard d11 is the priced case (rescue lost
  to 0 kcal), and the press-suppression mechanism
  generalizes it (every hold morning's sweep stays
  unknown). A future prereg for a selective trim
  must carry a gate-shift bar (no rescued evening
  lost) alongside any ticks bar, or it will repeat
  this run's shape with a smaller trim.
- Waits in the anatomy: reported as their own line,
  never folded into routine. With waits excluded,
  the hold question is whether entry + routine alone
  leave < 96 — and on hold days the answer is no
  by construction (entry 0 + routine 0, 128 left).
  The counterpart comparison survives the waits
  question because both legs wait identically, and
  routine-total equality (18 == 18 on guard d10,
  81 == 81 on day 7) isolates the attribution where
  it holds. ON d13 (routine 33 vs 17) shows the
  limit and is reported at observed difference.
- Det-gate test design: census + trajectory identity
  (not byte identity) is the right neutrality test
  for a driver that adds a probe layer — the probe
  records differ by design (one extra layer record
  per loop-day), the trajectory must not, and it
  does not (0 mismatches on every seed/evening/
  gate/dayTicks comparison). A byte-identity test
  would have failed spuriously on probe records
  alone.
- Pilot attribution note (disclosed, bar-neutral):
  the pilot compare's d10 attribution read
  PRESS-CONTRIBUTING because the pilot legs do not
  include control-control legs (counterpart missing
  -> contributing by the refinement rule). The
  confirm attribution, with counterparts present,
  correctly reads PRESS-DECISIVE (isolated, routine
  totals equal). No judged number comes from the
  pilot attribution; the confirm table above is the
  judged one.
- No metric revision is proposed for the raw-gate
  split, the attribution classes, the conversion
  definition (bridge-built required, avoided evenings
  excluded), or the reconciliation equalities: they
  separated the gates cleanly (alone vs plus,
  decisive vs contributing vs routine, cleared vs
  rescued vs avoided), which is exactly why the
  verdict can say ticks-short down 4 with zero
  rescues — instead of just "the hold works" or
  "the hold fails."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tick-preservation —
  SELECTIVE TRIM MUST KEEP THE WITHIN-TILE WALK
  (this arm): the whole-day hold refutes itself as
  a behavior (press suppressed 0/13 hold mornings
  via frozen west-corner position; guard d11 rescue
  lost; bearer deaths forward on both legs), but it
  motivates the next design: a trim that skips
  expensive routine beats while keeping the
  within-tile walk from the west corner to the east
  muscadine patch — the walk that makes the next
  morning's press fire. Whether such a trim exists
  inside competent.daily without editing it (it
  cannot be a wrapper over competent.daily, which
  runs monolithically) is a design/implementation
  question for the coordinator. (evidence: this
  file, §3.)
- [open] 2026-10-31 — food-economy/wave-reach — ON
  INSTRUMENT WAVE 2 vs UNFED WAVE 1 (this arm,
  observed, mechanism not isolated): 15215 reaches
  wave 2 on the instrument ON leg but wave 1 on the
  control-control ON leg, with identical strand
  censuses (18/10/8) and identical warmth ledgers.
  The hold days' RNG-stream change is a candidate
  mechanism (skipped routine draws), not a finding.
  Not investigated here. (evidence: this file, §3;
  judged ON instrument corpus, 15215.)
- [open] 2026-10-31 — narration/near-miss — TICKS
  NEAR-MISS REMOVED WITH THE TICKS GATE (this arm,
  guard d10): the instrument changes tickbudget's
  near-miss texture finding — the d10 line is no
  longer a 3-tick near-miss (93 vs 96) but a 60-kcal
  food failure (0 in hand), so no near-miss reaction
  is called for. Whether near-miss evenings in
  general should draw a reaction remains a design
  question; this arm proposes no wording. (evidence:
  this file, Sense-test.)

## Files

- Prereg: evidence/2026-10-30/sim-strandfix-ticks-b-prereg.md
  (commit e80aec29; pinned base 52df7e732)
- Evidence (this file): evidence/2026-10-30/sim-strandfix-ticks-b.md
- Policy instrument: scripts/policies/strandfix-ticks-diag.js
  (default OFF); driver:
  scripts/strandfix-ticks-trace-b.js; analyzer:
  scripts/analyze-strandfix-ticks-b.js; proof:
  scripts/test-strandfix-ticks-b.js (295/295)
- Corpora: evidence/2026-10-30/
  sim-strandfix-ticks-b-corpus-control-variant-guard,
  -control-variant-on, -instrument-guard, -instrument-on,
  -control-control-guard, -control-control-on,
  -detgate-guard, -detgate-on (10 seeds each);
  sim-strandfix-ticks-b-corpus-pilot-<leg> (8 seeds each:
  control-variant + instrument, guard + ON)
- Census + hold table + compare:
  sim-strandfix-ticks-b-census.json,
  sim-strandfix-ticks-b-hold-table.json,
  sim-strandfix-ticks-b-compare.md (plus -pilot equivalents)
