# sim-tickbudget-b — tick-budget census: how often tick cost alone strands an evening

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z,
arm sim-tickbudget-b, axis food-economy. Worktree sim-tickbudget-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero new policy files, zero edits to any existing policy
file or existing script. Sibling trees, claims, and branches never
touched. The main tree never touched. Every judged number below
comes from THIS arm's own legs on the pinned base; sibling corpora
(fedexile, kcalshort, strandbank) were read for orientation and
prereg grounding only, never used as judged input.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-tickbudget-b-prereg.md (commit
8460bce8d). Pinned base f52f08600550b0da8159849ffcfd5665c75e04f0.
Primary metric: ticks-short evenings per strand leg, split by raw
gates into ticks-short-alone vs ticks-short-plus-food/wood-short,
each attributed to a named tick cost (PRESS-DECISIVE /
PRESS-CONTRIBUTING / ROUTINE-ONLY, counterpart rule in the
prereg). DIAG-GO bar, used exactly as written: DIAG-GO iff
ticks-short evenings attributable to a named morning tick cost
(press or other) occur on >= 2 distinct seeds OR on >= 2 legs
of the 15215 substrate, with full tick arithmetic shown (named
cost, bridge need 96, ticksToDayEnd, shortfall, counterpart
outcome where decisive is claimed). A single-seed, single-leg
anecdote is DIAG-NO-GO. Pilot gate (8 seeds x 4 legs before
confirm spend): all 32 pilot files present, errs 0, press
ticksSpent == 17 on every fired pilot morning, every pilot
creek evening classifiable by raw gates, reconciliation holds
on every pilot creek evening — all four held (see Instruments),
so confirm spend was authorized.

## Instruments (reuse + one probe driver, no reinvention)

- Variant policy: scripts/policies/pressb-diag.js UNMODIFIED
  (PRESSB=1 arms the morning press + eat; PRESSB=0 delegates
  untouched).
- Driver: scripts/tickbudget-trace-b.js (new, adapted from
  scripts/pressb-trace-b.js with ONLY the prereg-disclosed
  changes): pure-read tick probes between stack layers
  (dayTicks before/after each layer's daily — no RNG, no
  state edits, ctx passed through untouched), morning rows
  carrying morningDayTicks, evening rows carrying
  morningDayTicks, eveningDayTicks (driver-level, post-daily),
  and per-layer tickProbe records. Same stack
  (pressb(warmed(woodcarry(nighttravel)))), same env gates,
  same seed order, same write transport as pressb-trace-b.js.
  The driver diff vs pressb-trace-b.js was verified to contain
  only those changes. One cosmetic inheritance, disclosed:
  the driver's final log line still says "wrote N pressb
  files" (per-seed summaries say "tickbudget"); the wording
  was left as-run rather than edited mid-run.
- Analyzer: scripts/analyze-tickbudget-b.js (new, pure reads):
  creek-evening extraction, raw-gate classification, ticks-short
  split, morning-behavior table, probe own-cost decomposition +
  reconciliation, paired attribution with counterpart lookup,
  strand extraction, guardrail census, wave reach, wall numbers,
  and the §15 paired compare .md.
- Proof: scripts/test-tickbudget-b.js (241 checks, all green —
  see Proof).
- Pilot legs: 8 seeds x 4 legs into
  sim-tickbudget-b-corpus-pilot-<leg> (32 files). Judged
  (confirm) legs: all 10 bank seeds x 4 legs into
  sim-tickbudget-b-corpus-<leg> (40 files). Same env gates
  as fedexile (COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 DAYS=30).
  Determinism: all 32 pilot seed files byte-identical to
  their confirm counterparts (proof-checked).

## Band reproduction (pre-registered report, not a bar) — NO DRIFT

| leg | creek | still | rescued |
|-----|-------|-------|---------|
| ON control (PRESSB=0, WOODWARM=1) | 18 | 10 | 8 |
| ON variant (PRESSB=1, WOODWARM=1) | 25 | 17 | 8 |
| guard control (PRESSB=0, WOODWARM=0) | 12 | 3 | 9 |
| guard variant (PRESSB=1, WOODWARM=0) | 13 | 4 | 9 |

These reproduce fedexile's censuses EXACTLY on the new base
(same totals, same strand day-ranges: ON 7–16 / 7–23, guard
7–9 / 7–10 — see §3). The strand set is unchanged: 15215 is
still the only stranding seed on this bank, and the only
still evenings in the entire census are 15215's strand
evenings (every other seed's creek evening on every leg is
rescued). All 10 seeds survived 30 days on every leg;
errs 0/0/0/0; stalls 0. Non-creek refused evenings: 0 on
all legs (every classified refusal is a creek refusal).

## 1. MORNING-BEHAVIOR TICK COSTS, PER STRAND LEG

Morning behavior = an entry behavior the stack performs at
daily entry before the day routine (prereg definition). The
routine is the day's remainder, measured by probe — not a
morning behavior. Costs below are measured (probe own-cost
+ attempt ticksSpent), not assumed from the TIME table —
though they agree with it exactly (press: forage 16 + eat
1 = 17; carry: tickAction(2)).

| strand leg | strand mornings | press fired (17 ticks) | press skipped | carry acted (2 ticks) | carry skipped |
|------------|----------------|------------------------|---------------|----------------------|---------------|
| ON control (15215, days 7–16) | 10 | n/a (control delegates) | n/a | 0 | 10 (not-at-haven 9, already-carrying 1) |
| ON variant (15215, days 7–23) | 17 | 4 (days 10, 14, 18, 22) | 13 (no-known-kcal 12, prev-not-stranded 1) | 0 | 17 (not-at-haven 16, already-carrying 1) |
| guard control (15215, days 7–9) | 3 | n/a (control delegates) | n/a | 0 | 3 (not-at-haven 2, already-carrying 1) |
| guard variant (15215, days 7–10) | 4 | 1 (day 10) | 3 (no-known-kcal 2, prev-not-stranded 1) | 0 | 4 (not-at-haven 3, already-carrying 1) |
| TOTAL | 34 | 5 | 16 variant skips | 0 | 34 |

Read it plainly:

- The press costs 17 ticks whenever it fires (5/5 fired
  mornings measure ticksSpent == 17; probe pressbOwn == 17
  on the same days — two instruments agreeing). It fires
  on only 5 of 21 variant strand mornings: 14 skips are
  'no-known-kcal' (the wake sweep holds no known food —
  the press gate, working as designed) and 2 are
  'prev-not-stranded' (day 7 on both variant legs: the
  first strand evening has no still evening behind it,
  so no morning behavior can precede it).
- The woodcarry morning carry costs 2 ticks in the engine
  but NEVER fires on a strand morning (0/34 acted): the
  villager either wakes at the creek ('not-at-haven', 30)
  or already carries 4 logs ('already-carrying', 4 —
  the day-7 mornings, which wake with bridge wood in hand
  and still strand on ticks alone). A morning-behavior
  design that budgets the carry need budget only 2 ticks,
  and only on haven mornings.
- The press's own ticks gate (skip 'ticks-short' when
  morning ticksLeft < 17) NEVER binds on strand mornings:
  morning ticksLeft is 128 (20 mornings), 256 (13), or
  384 (1) — minimum 128, gate at 17. No morning behavior
  is ever itself gated by ticks on this substrate; ticks
  bind only at the evening bridge.
- Morning ticksLeft distribution (all 34 strand mornings):
  128 x 20, 256 x 13, 384 x 1. The 384 case (ON-variant
  day 17, morning dayTicks 128) is a waits-alignment
  variation — its evening is wood-short with 365 ticks
  left, not ticks-short — reported as observed variation,
  mechanism not isolated, no verdict resting on it.

## 2. BRIDGE NEED + LOOP-DAY TICK ANATOMY

Bridge need (verified against woodcarry.js, constant across
all legs): 96 ticks, 4 logs, 60 kcal, checked in that order
(wood, then kcal, then ticks). Shortfall = 96 -
ticksToDayEnd.

Loop-day anatomy (code reads, confirmed by probe on every
creek evening): each loop-day the harness waits 3x to part
boundaries BEFORE policy.daily, so daily entry already
carries morning dayTicks 256 or 384 (384 on every
ticks-short evening below); then entry behaviors + routine
run; the bridge decision reads ticksToDayEnd = 512 -
classification dayTicks, BEFORE the woodwarm post-step fire
(ON legs). So every ticks-short evening below decomposes
exactly as: morningDayTicks (waits) + pressbOwn + routine
(+ carryOwn 0) = classificationDayTicks; ticksLeft = 512 -
that; shortfall = 96 - ticksLeft. The waits are harness
pacing, not player choices — they are reported as their own
anatomy line so the reader can re-judge attribution with
waits excluded (see Metric review). With waits excluded,
the bridge question is whether entry + routine alone leave
< 96 ticks of the post-wait budget — and on the decisive
evening (§4) they leave exactly 93.

Warmth fires are post-decision context, never attribution:
on 15215's still evenings the ON legs light (or attempt)
a warmth fire AFTER the bridge refusal on 14 confirm
evenings (ON control days 8–13, ON variant days 8–15),
each costing 48 ticks ("-0 kcal, 48 ticks of work, gone
either way" on failed friction attempts). Because the fire
runs after the decision, its 48 ticks cannot cause that
evening's refusal — and the reconciliation proof enforces
this (classification dayTicks excludes woodwarmOwn on
every still evening, 0 mismatches).

## 3. THE TICKS-SHORT CENSUS (judged measurement)

68 creek evenings total (34 still + 34 rescued). 8 are
ticks-short (ticksToDayEnd < 96), ALL on seed 15215, ALL
still evenings. The other 60 creek evenings pass the ticks
gate (including all 34 rescued evenings, by construction:
a bridge builds only at >= 96). Split by raw gates:

- ticks-short-alone: 5 (wood >= 4, kcal >= 60, ticks < 96
  — the bridge line names ticks-short, honestly).
- ticks-short-plus-wood: 2 (wood fails too — the line
  names wood-short and never mentions the ticks hole).
- ticks-short-plus-both: 1 (wood AND kcal fail too —
  the line names wood-short; two further failures hidden).
- ticks-short-plus-kcal: 0.

Full arithmetic per ticks-short evening (need 96 ticks;
anatomy = waits + press + routine + carry = decision
dayTicks; warmth, if any, runs after and is excluded):

| leg / day | class | wood | kcal | ticksLeft | shortfall | skip (spoken) | anatomy (waits + press + routine + carry = dayTicks) | attribution |
|-----------|-------|------|------|-----------|-----------|---------------|--------------------------------------------------------|-------------|
| ON control d7 | alone | 4 | 2254 | 47 | 49 | ticks-short | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| ON variant d7 | alone | 4 | 2254 | 47 | 49 | ticks-short | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| guard control d7 | alone | 4 | 2254 | 47 | 49 | ticks-short | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| guard variant d7 | alone | 4 | 2254 | 47 | 49 | ticks-short | 384 + 0 + 81 + 0 = 465 | ROUTINE-ONLY |
| guard variant d10 | alone | 4 | 500 | 93 | 3 | ticks-short | 384 + 17 + 18 + 0 = 419 | PRESS-DECISIVE |
| ON variant d13 | plus-both | 2 | 0 | 95 | 1 | wood-short | 384 + 0 + 33 + 0 = 417 (+48 warmth after) | ROUTINE-ONLY |
| ON variant d18 | plus-wood | 0 | 1246 | 93 | 3 | wood-short | 384 + 17 + 18 + 0 = 419 | PRESS-CONTRIBUTING |
| ON variant d22 | plus-wood | 0 | 1420 | 93 | 3 | wood-short | 384 + 17 + 18 + 0 = 419 | PRESS-CONTRIBUTING |

Counts: alone 5/8 (0.625), plus 3/8 (0.375). Skip-line
agreement: the spoken skip matches the first-failing raw
gate on all 68 creek evenings (proof-checked) — which is
exactly why the plus evenings matter: their lines are
TRUE (the pack IS short of logs) but INCOMPLETE (they
never say ticks are also short).

## 4. ATTRIBUTION (the answer to #1570, per evening)

- PRESS-DECISIVE: 1 evening — guard-variant day 10 (the
  #1570 case itself, reproduced on the new base with full
  arithmetic). Press 17 >= shortfall 3; counterpart
  guard-control day 10 is NOT ticks-short (ticksLeft 110,
  bridge built, rescued); and the probe ISOLATES the
  press, not merely observes it: counterpart routine
  total equals variant routine total (18 == 18), so the
  press is the only differing cost between the legs
  that day. Without the press, the variant evening
  stands at 402 dayTicks / 110 ticks left — the bridge
  builds. This is the census's one isolated
  morning-behavior-strands-an-evening case.
- PRESS-CONTRIBUTING: 2 evenings — ON-variant days 18
  and 22 (plus-wood). The press fires (17 ticks) and the
  ticks hole is exactly shortfall 3, but the wood gate
  fails regardless (0 logs), so the still outcome stands
  with or without the press; the press deepens a hole
  that does not decide the evening. Their counterparts
  have no creek evening (the control villager is home
  by then — the ON control strand ended day 16), so no
  decisive claim is available or made.
- ROUTINE-ONLY: 5 evenings — day 7 alone on all 4 legs,
  plus ON-variant day 13 plus-both. Day 7 is the
  census's most replicated finding: NO morning behavior
  fires (press skips 'prev-not-stranded', carry skips
  'already-carrying'), yet the villager strands 49 ticks
  short with bridge wood in hand and 2254 kcal — the
  routine day alone (81 ticks on top of 384 waits)
  spends past the bridge. Counterpart routine totals
  are equal across all four day-7 pairs (81 == 81), so
  the routine attribution is isolated too: there is no
  morning behavior to blame on day 7 on any leg. Day 13
  is the narrowest miss in the census (shortfall 1 tick,
  no press — 'no-known-kcal' skip — routine 33 on top
  of 384 waits; counterpart routine differs, 17 vs 33,
  so this one stays at observed difference, and its
  outcome is wood+kcal-decided regardless).
- Headline, stated so the verdict cannot be misread:
  the census GO (below) is carried by ROUTINE-attributed
  evenings replicated across legs (day 7 on 4 legs) plus
  the single PRESS-DECISIVE evening — NOT by press
  decisiveness in general. Press-decisive stranding is
  1 evening on 1 leg. A morning-behavior design that
  budgets only the press would still strand day 7 on
  every leg: the day-7 hole is 49 ticks of routine +
  waits, and no morning behavior exists on that morning
  to budget.

## 5. WHAT THE NARRATION HIDES (plus evenings)

On the 3 plus evenings, the spoken bridge line names the
earlier gate and never mentions ticks: day 13 says "the
pack holds 2 logs, and a bridge needs 4" while ticks sit
at 95 (1 short) and kcal at 0; days 18/22 say the same
wood line while ticks sit at 93 (3 short). A player
reading only the narration would call all three pure wood
failures — the same first-failure incompleteness
sim-kcalshort-b filed for wood+kcal "both" evenings, now
extended to ticks. The alone evenings, by contrast, speak
their cause exactly ("93 ticks left in the day, and a
bridge takes 96 ticks"). The narration is never false
here; it is incomplete exactly when two or three gates
fail at once. Whether the line should name concurrent
failures is a design question for the coordinator /
Steve, not a wording change proposed by this DIAG arm.

## Sense-test (law — read end to end, judged for meaning)

Guard-variant day 10 (the decisive evening), full day
lines: the villager wakes at 0 kcal, works the patch
("5x Muscadine Grapes — and 5x unknown shoots, 6x
unknown berries you can't name yet"), eats the muscadine
(450 kcal), travels to wetland, works Purslane (180
kcal), eats it, travels to creek, and is refused: "No
bridge tonight — 93 ticks left in the day, and a bridge
takes 96 ticks." PASS on mechanism: the line explains
the TIME shortfall plainly — a person running out of day
with food in hand and 4 logs in the pack, not a food or
wood failure. The near-miss itself (3 ticks — three
steps' worth of time) draws no reaction: the villager
does not remark on how close the bridge was, and the day
gives no sense of hurrying. That is a narration texture
note, not a failure: the cause is named, the feeling of
the near-miss is not. Day 7 reads the same way at larger
scale — a full, varied day (wetland, forest floor, a
raccoon with too many fingers, learning Old World
Caches, knapping a Stone knife, meeting Dakota) ending
47 vs 96: a person who lived a whole day and still ran
out of it, not a robot farming ticks. Day 13's plus
evening is the counter-case: a big day (a snare set, a
Fusion Reactor pellet installed — "You will never be
hungry again") ending on a wood line that hides a
1-tick time miss and a 0-kcal hand. The transcript
proves the census's point: time shortfall is speakable
(the alone line speaks it) and is spoken only when it
is the first failing gate.

## Villager-behavior sample (out of the sims)

Sample drawn from the recorded still-evening transcripts
(the driver records full day lines on still evenings and
pressed mornings; haven days carry no full transcript in
this corpus — coverage limit, stated). The days read as
people: travel with place-feel ("Reeds taller than you.
The wind makes them talk to each other, and you are not
part of the conversation"), learning beats with voice
("You step around it, not through it. Some rules are
older than knowledge"), social fragments ("You catch
fragments by the fire — Dakota telling Nora about
Fatima. The story's getting bigger than what happened"),
and the press day's normal foraging arc. No static or
repeated villager routines beyond fedexile's already-filed
Tao catchphrase note (not re-observed here — no teaching
lines appear in these transcripts). Nothing here changes
the arm's verdict.

## Reachability

No new content reached by a game change (no game change
landed — policy variant only, default off). Wave reach
on the 10-seed legs (maxWaveUnlocked per seed):
wave >= 1 on 10/10 on all 4 legs; wave >= 2 on 8/10
ON control, 9/10 ON variant, 8/10 guard control, 9/10
guard variant; wave 3 on 1/10 ON legs (15439) and 1/10
guard variant (15215 — the longer, fight-richer warmth-off
trajectory fedexile noted); waves 4–5 not reached in this
30-day window (same window as pressb/wakeforage/woodday/
fedexile). The variant moves wave reach on exactly the
seed it feeds (15215: ON 1 → 2, guard 1 → 3), nowhere else.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no
field) — reported as the window's structural value, not
a game verdict: national 0/10, table 0/10, wins 0/10 on
all 4 legs (the legs contain no national/table/win
content, and the driver records no such fields — same
standing as fedexile). Median survival: 30 days (all 10
seeds survived 30 days on all 4 legs — ceiling effect of
the window + banking selection, not a survival claim).
Death-cause pairing (bearer deaths, control → variant):
ON 15215 day 17 → day 23, same cause "the wild"
(reproduces fedexile's +6 death-delay exactly); every
other seed identical across ON legs (15091 days 8 + 30,
15009 day 18 contest, 15221 day 31, 15376 day 17, rest
none); guard legs identical control → variant on all
seeds (15215 none on either guard leg).

## Verdict against the prereg

- DIAG-GO (measurement verdict only). Ticks-short
  evenings attributable to a named tick cost occur on
  4 legs of the 15215 substrate (day 7 ROUTINE-ONLY on
  all 4 legs, day 10 PRESS-DECISIVE on guard-variant,
  days 18/22 PRESS-CONTRIBUTING and day 13 ROUTINE-ONLY
  on ON-variant), each with full tick arithmetic
  (named cost, need 96, ticksToDayEnd, shortfall,
  counterpart outcome where decisive is claimed) and
  0 reconciliation mismatches. The bar's distinct-seed
  clause is NOT met (15215 only) — the >= 2 legs clause
  is what carries GO, stated so the single-seed scope
  is not hidden.
- PRESS-DECISIVE headline (separate from the verdict):
  1 evening, 1 leg (guard-variant day 10, isolated by
  equal routine totals). Press-decisive stranding is a
  real but single-leg finding; routine-attributed
  stranding is the replicated one (day 7, 4 legs).
- This verdict certifies the tick-budget numbers; it
  does NOT land any behavior, flip any default, or rule
  the design question. The "morning behaviors must
  budget ticks" decision — and whether the day-7
  routine hole (49 ticks, no morning behavior to
  budget) or the plus-evening narration gap is in
  scope for it — stays with the coordinator / Steve,
  now with counts in hand: tick cost alone strands an
  evening on 5 of 8 ticks-short evenings (the alone
  class), tick cost concurrently holes 3 more, and the
  press itself decisively strands 1.

## Proof

scripts/test-tickbudget-b.js: 241/241 checks pass on the
judged corpora, including: pure gate classification (all
four ticks-short splits + skip cross-check + shortfall
arithmetic); attribution classes (decisive / contributing
/ routine / missing-counterpart-never-decisive);
own-cost decomposition (guard day-10 shape: daily 35 =
press 17 + routine 18; decision sum excludes warmth);
strand extraction; corpus checks (40/40 confirm files,
errs 0, evenings 30/30, press ticksSpent == 17 on every
fired morning, pilot==confirm byte-identical on all 32
overlapping files, reconciliation mismatches 0, skip
agrees with raw gates on all 8 ticks-short evenings,
ticksLeft arithmetic 512 - classificationDayTicks on
all 8, decisive claim re-verified per evening, morning
rows complete, src/ + scripts/policies/ diff empty vs
pinned base f52f08600, no tracked modifications left).

## Metric review

- Raw-gate split vs first-failure line: the split is the
  right unit for "tick cost strands an evening" — the
  first-failure line alone would report 5 ticks-short
  evenings and hide 3 (the plus class, 3/8 of the
  ticks-short total). The evidence never counts a plus
  evening as "stranded by ticks" without the plus
  qualifier: plus evenings stay still on their wood/kcal
  gates regardless of ticks.
- Waits in the anatomy: the harness waits (384 ticks on
  every ticks-short evening) are reported as their own
  line, not folded into "routine" or "morning behavior."
  With waits excluded, the decisive test still holds:
  post-wait budget 128, day-10 spend 35 (press 17 +
  routine 18), leftover 93 < 96; without the press,
  leftover 110 >= 96. The counterpart comparison is the
  instrument that survives the waits question, because
  both legs wait identically — and routine-total
  equality (18 == 18 on day 10, 81 == 81 on day 7)
  isolates the attribution beyond observed difference
  where it holds. Day 13 (routine 33 vs 17) shows the
  limit: unequal routines keep that attribution at
  observed difference, and it is reported as such.
- Counterpart refinement (disclosed, bar-neutral): the
  prereg's decisive rule required the counterpart to be
  "NOT ticks-short." A counterpart with no creek evening
  at all (ON-variant days 18/22: control villager home)
  does not establish that, so it falls to
  PRESS-CONTRIBUTING with counterpartStatus recorded.
  This only makes decisive harder to claim; no decisive
  claim in this evidence rests on a missing counterpart.
- Press ticks-gate: checked, never binds on strand
  mornings (minimum morning ticksLeft 128 vs gate 17).
  The gate could bind only on a morning starting with
  < 17 ticks left — impossible on this substrate's
  waits alignment — so no separate finding arises.
- No metric revision is proposed for the raw-gate split,
  the attribution classes, or the reconciliation
  equalities: they separated the gates cleanly (alone
  vs plus, decisive vs contributing vs routine, decision
  moment vs post-decision warmth), which is exactly why
  the verdict can say tick cost alone strands 5 evenings
  and the press itself decisively strands 1 — instead of
  just "8 ticks-short evenings."

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/tick-budget — TICK
  COST ALONE STRANDS EVENINGS (this arm): 5
  ticks-short-alone evenings on 15215 (day 7 on all 4
  legs, guard-variant day 10), plus 3 ticks-short-plus
  evenings whose ticks hole the spoken line hides
  (ON-variant days 13, 18, 22). Press-decisive: 1
  evening (guard-variant day 10, isolated). The
  morning-behavior design question for the coordinator
  / Steve: budget ticks, not just kcal — and note the
  day-7 hole (49 ticks, no morning behavior to budget)
  is a routine + waits hole, not a press hole.
  (evidence: this file.)
- [open] 2026-10-30 — narration/bridge-line — PLUS
  EVENINGS HIDE THE TICKS HOLE (this arm): on
  ticks-short-plus evenings the bridge line names only
  the first failing gate (wood-short), never the
  concurrent ticks shortfall (95/93 vs 96) — the same
  first-failure incompleteness class kcalshort filed
  for wood+kcal. Whether the line should name
  concurrent failures is a design question, not a
  wording change proposed here. (evidence: this file,
  §5.)
- [open] 2026-10-30 — narration/near-miss — DECISIVE
  EVENING DRAWS NO REACTION TO THE NEAR-MISS (this
  arm, guard-variant day 10): the villager strands 3
  ticks short of a bridge it could have built and the
  day gives no sense of hurrying or of noticing how
  close it was. The cause is named honestly; the
  feeling of the near-miss is not. Texture note only.
  (evidence: this file, Sense-test.)
- [open] 2026-10-30 — food-economy/reactor-gate —
  REACTOR DAY STILL KCAL-GATED (this arm, observed,
  not measured): ON-variant day 13 installs the Fusion
  Reactor ("You will never be hungry again") and still
  ends kcal-gated (0 kcal in hand) on a plus-both
  evening. Whether effort-kcal for lashing should
  count reactor coverage is a design question — the
  bridge cost is effort, not metabolism, so the gate
  may already be correct. Not investigated here.
  (evidence: ON-variant corpus, 15215 day 13.)

## Files

- Prereg: evidence/2026-10-30/sim-tickbudget-b-prereg.md
  (commit 8460bce8d)
- Evidence (this file): evidence/2026-10-30/sim-tickbudget-b.md
- Driver: scripts/tickbudget-trace-b.js; analyzer:
  scripts/analyze-tickbudget-b.js; proof:
  scripts/test-tickbudget-b.js (241/241)
- Corpora: evidence/2026-10-30/
  sim-tickbudget-b-corpus-on-control, -on-variant,
  -guard-control, -guard-variant (10 seeds each);
  sim-tickbudget-b-corpus-pilot-<leg> (8 seeds each)
- Census + morning table + compare:
  sim-tickbudget-b-census.json,
  sim-tickbudget-b-morning-table.json,
  sim-tickbudget-b-compare.md (plus -pilot equivalents)
