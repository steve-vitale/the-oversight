# sim-pickdepart-a — PICK-TO-DEPARTURE DECOMPOSITION: DIAG-NO-GO (narrow, n=4 tie)

Run: flesh-out loop, run fleshout-20261029T0315Z (adoption run).
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-pickdepart-a.
Assignment: PICK-TO-DEPARTURE decomposition, ranked next blank from
sim-lottery-a. DIAGNOSIS ONLY — zero src/js, zero game-behavior
changes, zero default flips, zero policy changes. This arm
decomposes wave-4 HUNT picks that never departed; it builds no
lever and lands no lever.
Preregistration (binding, committed BEFORE any new judged
analysis): evidence/2026-10-29/sim-pickdepart-a-prereg.md
(commit 8916a0816 on branch sim-pickdepart-a). This evidence
judges the decomposition against that prereg. No metric was
changed mid-run. No new sims were run: the re-run rule never
triggered, because every field the prereg needs (pick linkage,
gate reasons) is derivable from the existing corpora.

VERDICT: DIAG-NO-GO — on ONE narrow leg only. Completeness,
the nikos explanation, and the gate inventory all pass; the
single-class dominance leg fails on a 1/1/1/1 tie at n=4.
The decomposition itself is complete and is the fill: every
wave-4 HUNT pick on the pilot band is classified, the nikos
candidate-null rows are explained from a named gate, and the
departure gates are inventoried function by function. The
NO-GO means exactly this: at n=4, no SINGLE mechanism class
dominates, so the prereg's dominance leg cannot pass on a
strict per-class reading. The dominant PATTERN is reported
alongside, not substituted for the leg: replaced-before-
departure 3/4 = 75%.

## Plain words first

Four villagers on the pilot band ever picked a wave-4 hunt.
One walked out. The other three never left — and each for a
different reason, which is why there is no single villain.
One woman picked the hunt in the morning and chose dinner
that same afternoon. One man picked the hunt twice — on the
second-to-last day his memory was fresh, and again on the
last fresh day — and then never left: the next morning his
memory was one day too old, so the hunt was simply no longer
offered, and he spent the following days fetching water
instead. The fourth pick is the first man's first pick,
replaced the next day by his own second pick. So the
pick-to-departure break is not one gate. It is three ways
a decision dies before the walk: dinner replaces it, a
second pick replaces it, and old age removes it from the
menu. Underneath all three sits a quieter mechanism the
records imply but cannot yet prove: when a picked hunt's
walk looks dangerous, the game silently swaps it for an
indoor chore — no line, no record — and by the time the
villager decides again, the memory has aged out. Water
errands never suffer this fate: a water trip survives a
danger verdict by shrinking to a short walk, so it departs
the same hour it is picked, four days running, while the
hunt that was picked twice never departs at all.

## Header (pre-registered) vs result

Pilot band seeds 75101-75108, tableseat-nowait substrate
(identical to lottery), 180d death-aware. Corpora:
perseed-lottery-base/ (baseline) and perseed-lottery-arm/
(lever code; second decomposition population only — the
lever is already killed, nothing here re-judges it).

- GO LEG 1 — 100% of wave-4 HUNT picks classified, <= 1
  unknown across both corpora: RESULT 4/4 classified, 0
  unknown -> PASS.
- GO LEG 2 — at least one dominant mechanism quantified
  as a share: RESULT per-class split 1/1/1/1 (25% each),
  no single class dominates -> FAIL on the strict
  per-class reading. Family rollup (NOT substituted for
  the leg): replaced-before-departure 3/4 = 75%.
- GO LEG 3 — nikos d174+ candidate-null rows explained
  from a named gate, read from the records: RESULT age
  (memory day 170, d174 age 4 > 3; every other gate green
  on the d174 pick) -> PASS.
- GO LEG 4 — departure-gate inventory, function + file
  for every gate between pick and departure, verified by
  grep: RESULT complete (see inventory below) -> PASS.
- OVERALL: DIAG-GO requires ALL legs -> DIAG-NO-GO
  (narrow: leg 2 only, at n=4).
- Guards (restated from the rows, not re-scored):
  starvation base 1 / arm 1; median survival base 146 /
  arm 119; wave-4 reach base 6/8 / arm 5/8; wins base 3 /
  arm 5 (all lesser seats in both, per lottery evidence);
  death totals base 286 / arm 248. No guard is claimed
  as movement — these are the lottery rows, restated.

## The classified universe (4 picks, all of them)

Primary universe: every pick record in either pilot corpus
whose chosen.kind == 'HUNT' and whose huntMid maps to a
wave-4 monster in src/data/monsters.json. (The funnel
recorder captures every such pick: it records any pick
where the villager held a wave-4 memory OR chose a
wave-4 HUNT, so no wave-4 HUNT pick can hide from it.)

BASELINE (2 picks, seed 75106, both d135, both eulogy
huntDay 132, both picked at dayPart 0):

- visjoin_115/eulogy, d135 part 536 -> DEPARTED-PICK-
  LINKED. Departure d137 part 544 (lag 2 days, 8 parts),
  no intervening pick (next pick d138 part 549,
  HAVEN_CHORE, candidate null — the (5,3) memory spent
  by the arrival drop). This is the band's only wave-4
  HUNT departure, and it found an empty tile (returns-a
  / funnel-a: drop d137 at (5,3), quarry gone).
- visjoin_113/eulogy, d135 part 536 -> SUPERSEDED-BY-
  NEEDS-PICK. First later pick d135 part 539 (same day,
  dayPart 3) chose EAT while the candidate was still
  eulogy. She hunted the next day — a gallowdeer, not
  the eulogy. Dinner replaced the hunt within 3 parts.

ARM (2 picks, seed 75104, nikos_papadopoulos, both
eulogy huntDay 170):

- d172 part 685 (dayPart 1) -> SUPERSEDED-BY-RE-PICK.
  First later pick d173 part 690 chose HUNT for the
  same eulogy while the candidate was still eulogy.
  This is a re-affirmation, not a change of mind: the
  same decision, picked twice. (Lottery's reading of
  d172 as "superseded by the d173 re-pick" is adopted
  verbatim by the prereg's taxonomy.)
- d173 part 690 (dayPart 2, age 3 — the LAST fresh day)
  -> CANDIDATE-NULL-AFTER-PICK. First later pick d174
  part 692 (dawn, dayPart 0) chose SEEK with candidate
  null, while pre still lists ["eulogy",3,4,170,3].
  Closed gate: AGE ONLY. On the d174 pick, armed true,
  sheltered false, postFleeResting false, maxD 1, hunt
  tile (3,4) at distance 1 from haven (4,4) — every
  gate green except age: d174 - 170 = 4 > 3, so
  objHuntCandidate filters the memory out. The memory
  itself never leaves the store: pre still lists the
  eulogy on every pick through d180 (age 10). The
  store does not expire; only the OFFER filters by
  age. That is why candidate=null rows coexist with a
  listed memory — the list is the past, the candidate
  is the offer, and they are different things.

Pooled: departed-pick-linked 1/4 (25%), superseded-by-
needs-pick 1/4 (25%), superseded-by-re-pick 1/4 (25%),
candidate-null-after-pick 1/4 (25%), gate-blocked 0,
died-before-departure 0, horizon 0, unknown 0.
Replaced-before-departure family: 3/4 = 75%.
Departed share: 1/4 = 25%.

SECONDARY CENSUS (all-wave HUNT picks among funnel-
recorded picks — i.e. picks by wave-4 memory holders
only, so this is a subset of all HUNT picks, labeled
as such): base 8 picks — departed-pick-linked 4,
superseded-by-re-pick 2, superseded-by-needs-pick 2;
arm 3 picks — departed-pick-linked 1 (the callback
hunt, d177 pick -> d178 departure -> drop), re-pick 1,
candidate-null 1. All-wave departed share 5/11 = 45%,
against wave-4's 1/4 = 25%: wave-4 pick-to-departure
is worse than HUNT pick-to-departure in general, on
a small base. The callback departure is the control
case that the machinery works: a fresh (age-1)
memory, picked d177, departed d178, dropped — the
same villager, the same week, a different beast.

## The nikos explanation (what changed at d174, and why WATER fired)

What changed at d174 is exactly one thing: the calendar.
Memory day 170 + 3 fresh days = d173 is the last day
objHuntCandidate offers the eulogy. On d174 the memory
is age 4 and the offer is gone, even though the memory
is still stored, still armed, still in range, and the
villager is neither sheltering nor resting. No state
changed except the day count. The d174+ candidate=null
rows are staleness, not a bug, not a range failure, not
a resting flag: the analyzer names age as the sole
closed gate, and every other gate reads green on the
d174 record itself.

Why WATER departures fired while the HUNT departure
never did is a two-part answer, and the two parts have
different evidence strengths:

(a) PROVEN FROM RECORDS: every WATER pick in the
window departed in the SAME part it was picked (d174
part 694 pick -> part 694 departure; d175 part 697 ->
697; d176 part 700 -> 700; d177 part 704 -> 704).
A WATER objective is a fresh decision that departs
immediately when the danger verdict is 'go', and it
SURVIVES a non-'go' verdict by tightening to a 1-node
short walk (objTightenOrDefer tightens FORAGE/WATER/
TRAPS and still departs). The HUNT pick at d173 part
690 had, at most, parts 690-691 to depart in before
the next pick record at part 692 — and it produced no
departure record at all.

(b) INFERRED BY ELIMINATION (verdict unrecorded —
flagged, not proven): between the d173 HUNT pick
(part 690, dayPart 2) and the d174 SEEK pick (part
692, dawn dayPart 0), the HUNT objective left 'ready'
without a departure and without a pick record. The
code leaves exactly one path for that: objMaybeDepart's
danger verdict was not 'go', and for a HUNT every
non-'go' verdict ends in overwrite — 'ask' cannot
ask (HUNT never drags a companion, code comment:
"a hunt also takes the no-companion fallthrough"),
'tighten' cannot tighten (HUNT is not FORAGE/WATER/
TRAPS), 'defer' overwrites directly — all three land
in HAVEN_CHORE indoor with no pick record and no
narration. The indoor chore then ticks down (2-3
parts) and completes, and the dawn re-pick fires —
by which time the memory is age 4 and the hunt is
no longer offered. Heal-gate sat-out cannot explain
it (it leaves the objective 'ready', and dawn re-pick
never touches a 'ready' objective, so a sat-out HUNT
would persist, not yield a SEEK pick). Dawn re-pick
itself cannot explain it (it fires only for idle /
done / returning objectives, never 'ready'). No other
objPick caller exists (grep: only objMaybeDepart
line 1060 and objTick lines 1315/1332). The inference
is therefore tight, but it IS an inference: no
recorder in these corpora captures the danger verdict,
so a departure-hold recorder is the ranked next
measurement (see Ranked next steps #1) before any
lever assumes this path.

The asymmetry is the finding in one sentence: WATER
survives a bad danger verdict by shrinking and still
leaving; HUNT dies on a bad danger verdict by being
silently replaced with housework.

## Departure-gate inventory (all in src/js/villager-objectives.js unless noted)

Between a HUNT pick (objPick outcome, state 'ready')
and a departure, the code applies, in order:

1. objMaybeDepart(rid, node, atHaven, hx, hy) — runs
   once per day-part per villager AT HAVEN only.
   Early returns (no departure attempt, objective
   untouched): agency expedition owns the villager;
   already away; engaged; sick (v.sick); heal sat-out
   today (hurtGate satOut). Re-pick branch: if the
   objective is idle/done (or indoor, which returns
   early to objTick), objPick fires fresh and the new
   objective departs in the SAME call — this is why
   same-part pick->departure exists for WATER. A
   'ready' objective is NEVER re-picked here.
2. objDanger(vid, tx, ty, hx, hy) — the verdict. Score:
   village gossip attack/murder/raid within 3 days +2
   each (capped 4), death within 3 days +1; rain +1;
   distance > maxD +2, > 2/3 maxD +1 (maxD clamped
   >= 1 here, unlike the candidate's >= 0 floor);
   temperament cautious/withdrawn +1, bold/restless
   -1; goal 'escape' -2. Verdicts: score <= 1 'go',
   <= 3 'ask', <= 5 'tighten', > 5 'defer'. NO
   daylight / part-of-day gate exists in this path
   (grep: no dayPart read in objMaybeDepart) — a
   HUNT may depart at any part, and did (d137 dep
   at dayPart 1; callback d178 dep at dayPart 0).
3. objAskCompanion — SKIPPED for HUNT by rule: "a HUNT
   is the knower's own errand — it never drags along
   a villager who has not seen the beast." 'ask' for a
   HUNT therefore falls through exactly like
   no-companion. (Perception law lives here: no
   roster is consulted for a hunt companion, because
   no companion is ever asked.)
4. objTightenOrDefer — tightens ONLY FORAGE/WATER/
   TRAPS (exactly 1 orthogonal node, partsLeft <= 2,
   still departs). HUNT is not tightenable, so
   'ask'-without-companion and 'tighten' both land
   here and overwrite: kind HAVEN_CHORE, purpose
   chore, indoor, state 'indoor', partsLeft 2-3.
   'defer' overwrites identically, inline in
   objMaybeDepart. The overwrite writes NO pick
   record, NO departure record, NO narration line.
5. objHealGate(vid, obj, hx, hy, playerAtHaven) —
   runs inside objDepart (and in the 'ask' branch
   before departing): hurt villagers are patched
   (pharmacy -> healer -> sit-out) or sat out for the
   day. Sat-out does NOT overwrite the objective;
   it blocks objMaybeDepart retries that day via the
   hurtGate early return. LEAVE is exempt from
   sit-out. One verdict per villager per day.
6. objDepart(vid, obj, hx, hy, playerAtHaven) — heal
   gate re-checked, then the move: node set to the
   hunt tile, away entry written, state 'out',
   departure line spoken ONLY if the player is at
   haven. The HUNT line names the beast by village
   descriptor, never the true name (knowledge gate).
7. Re-pick paths that can REPLACE a 'ready' objective:
   NONE. objTick dawn re-pick fires only for idle /
   done / returning objectives; objMaybeDepart re-pick
   fires only for idle / done. The only way a 'ready'
   HUNT becomes a new pick is via the step-4/5
   overwrite to indoor (then chore completion ->
   state done -> re-pick) or via departure itself.
   This is why the danger overwrite is load-bearing:
   it is the only silent replacement path.
8. Offer-side gates (NOT departure gates, but they
   decide whether a re-pick can ever re-offer the
   hunt): objHuntCandidate — fresh age 0-3 days ONLY
   (day - memory day), armed (equipped or carried
   weapon), 1 <= Chebyshev distance <= npcMaxDist,
   not sheltering, not post-flee resting, not the
   player, not dead. Homebodies (maxD 0) can never
   be offered (maxD < 1 returns null). Memory store
   rules: cap 4 per villager, oldest dropped first;
   objDropMonsterSighting spends a memory when a
   hunter reaches the remembered tile and the quarry
   is gone; the store itself never expires entries.
9. Needs thresholds are PICK gates, not departure
   gates: hunger > 55 + pantry > 500 -> EAT pre-gate,
   REST gate at energy < 35, and the lottery weights
   (HUNT 2.0 vs WATER up to 8.5) all act inside
   objPick. Once a HUNT is picked, no needs threshold
   re-checks it before departure — only danger and
   heal gates do.

CANON GAP (stated, not invented): no CANON-registered
doc covers departure gates, the daily pick lottery,
travel-to-known-monsters, or field-fight returns.
docs/MAP.md covers the map/travel surface generally
and names a travel-vs-departure ruling, but does not
document these gates. The inventory above is derived
from code, verified by grep, and is the thing a
future canon note should cite.

## Baseline departed case vs never-departed cases: what differed

The departed case (visjoin_115) differs from every
never-departed case in exactly one observable respect:
NO intervening pick between pick and departure. Her
pick (d135 part 536) survived 8 parts / 2 days with
no replacement, and then departed. Every never-
departed pick was replaced within 0-1 days: 113 by
EAT in 3 parts the same day; nikos d172 by his own
d173 re-pick the next day; nikos d173 by a SEEK pick
at the next dawn (via the inferred danger overwrite
+ chore completion, above). The departed case also
had the longest departure lag in the set (2 days) —
lag alone does not kill a hunt; replacement does.
And the departed case is the ONLY pick whose
departure lag crossed the freshness boundary and
still departed (picked age 3, departed age 5): the
departure gates never re-check memory age, so a
picked hunt CAN depart stale — it is the OFFER that
expires, not the walk. Nikos's hunt died because it
was replaced before departure, not because it aged:
had the d173 objective survived to d174, it could
still have departed (age is not a departure gate).

## Sense review (verbatim traces, SENSE-TESTING LAW)

Nikos trace (arm corpus, seed 75104 — analyzer
--sense output, verbatim pick/departure lines):

```
  PICK d171 part=681 chosen=HAVEN_CHORE candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d172 part=685 chosen=HUNT/eulogy candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d173 part=690 chosen=HUNT/eulogy candidate=eulogy@(3,4)/day170 pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d174 part=692 chosen=SEEK candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d174 part=694 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d175 part=696 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d175 part=699 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d176 part=702 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3],["callback",4,3,176,2]] gates={"armed":true,"sheltered":false,"postFleeResting":true,"maxD":1}
  PICK d177 part=706 chosen=HUNT/callback candidate=callback@(4,3)/day176 pre=[["eulogy",3,4,170,3],["callback",4,3,176,2]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d179 part=713 chosen=WATER candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d180 part=718 chosen=EAT candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d180 part=719 chosen=EAT candidate=null pre=[["eulogy",3,4,170,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  DEP d174 part=694 WATER  -> (4,5)
  DEP d175 part=697 WATER  -> (3,4)
  DEP d176 part=700 WATER  -> (4,3)
  DEP d177 part=704 WATER  -> (4,5)
  DEP d178 part=708 HUNT callback huntDay=176 -> (4,3)
```

Judgment: this reads as an errand queue overwriting a
decision, not a person making a choice. A villager who
decides twice to go back for a beast, then never leaves
while water errands depart four days running and a
different beast's hunt departs and drops, has not
changed his mind — his decision was replaced by a
mechanism that leaves no trace. The one human-shaped
beat in the window is the callback hunt (d177 pick ->
d178 departure -> drop): a decision that survived to
a walk, even though it found nothing. The eulogy
decision has no such beat — it exists only in a
recorder, exactly like visjoin_113's d135 decision in
funnel-a. By contrast the baseline departed case
(visjoin_115: five refused offers, a last-day take,
a two-day wait, a walk to an empty tile) reads as a
person: the decision is visible at every step, even
in failure. The sense bar passes (a full trace is
quoted and judged) and the judgment cuts against the
current wiring: a picked hunt that dies by silent
overwrite is a narration blank as well as a funnel
blank — the player at haven hears nothing when a
decision is replaced, only when one departs.

## Village assessment in plain words

The village does not lack hunters who decide. It lacks
decisions that survive until morning. On this band, a
wave-4 hunt pick is a promise the game keeps only one
time in four — and the one time it kept it, the walk
ended at an empty tile anyway. The people are not
cowards and they are not forgetful: one woman waited
two days and walked out; one man decided twice. What
they lack is a decision with a lock on it — something
that says "I decided this yesterday, it still stands
today" through a dangerous afternoon and a night's
sleep. Water has that lock (it shrinks and still
leaves); the hunt does not (it is swapped for
housework). Until a picked hunt can survive a bad
danger verdict, raising its pick weight further only
produces more decisions that die the same way — the
lottery lever proved that, twice picked and zero
departed. Who thrived: nobody, on this measure — the
band's wave-4 hunts produced zero meetings. Missing
capabilities, in order: a danger verdict a hunt can
survive; a record of that verdict so the next
measurement does not have to infer it; and still,
behind both, a way to find a beast that moved.

## Ranked next steps (FOLLOW-UP runs — none built here)

Every step below obeys Steve's perception law (2026-
10-28): villagers know who's around only through their
own senses — same tile, shout heard, following someone
seen. No step proposes a roster, a list feed, a live-
monster lookup, or a magic return address. Each names
the prereg it would need.

1. DEPARTURE-HOLD RECORDER (diag, FIRST). Wrap
   objMaybeDepart / objDanger / objTightenOrDefer /
   objHealGate (diag recorder only, RETURNS/FUNNEL-
   style, zero game writes, zero RNG draws) to record,
   per ready objective per part: the danger verdict
   (go/ask/tighten/defer + score), the heal verdict,
   and whether the objective was overwritten to indoor.
   Universe: ready HUNT objectives on the funnel band.
   Prereg it would need: verdict taxonomy + overwrite
   count as primary; GO = verdict split quantified
   over >= 8 pilot seeds with <= 1 unrecorded overwrite
   (every 'ready'->indoor transition accounted for).
   This turns the nikos inference (this evidence's
   section b) into a measurement, and it must run
   BEFORE any lever assumes the danger-overwrite path.
   Perception-safe: pure observation of the villager's
   own objective state.
2. HUNT HOLDS THROUGH DANGER (lever candidate,
   SECOND, only after #1 confirms the overwrite path).
   A picked HUNT survives a non-'go' danger verdict
   by STAYING 'ready' and retrying next part, instead
   of being overwritten to HAVEN_CHORE indoor — the
   hunt waits out the danger like a person would,
   rather than being silently replaced by housework.
   No new knowledge: the target is still the villager's
   own fight memory, the same tile, the same gates.
   Prereg it would need: primary = pick-linked wave-4
   HUNT departures on the pilot band (outcome, never
   take-rate over trajectory-dependent triples);
   GO bar set against the baseline 1 (this evidence:
   departed 1/4 picks); guards = starvation deaths,
   median survival, wave-4 reach, and a sense bar
   (a held hunt must read as waiting, not idling —
   a line when the hold starts, or the hold is itself
   a narration blank to fix). Feel note for the next
   prereg: villagers visibly waiting instead of
   choring is a behavior change a player could notice;
   the next run decides [needs-eyes] on its own facts.
3. NEEDS-CARRYING HUNT (lever candidate, THIRD,
   design-first, not a silent build). A picked HUNT
   that cannot depart today because the village is
   dry/hungry still departs when needs are met — in
   practice, the hunt objective is re-offered at the
   next dawn while fresh instead of competing fresh
   against the morning's water run. This is the
   funnel-a sense direction ("an offer that survives
   a dry cistern"), narrowed to the departure side.
   Design-first because it touches the dawn re-pick
   rule (which currently never touches 'ready'
   objectives) and must be drawn before it is built.
   Prereg it would need: primary = wave-4 HUNT
   meetings (not picks, not departures) on the pilot
   band; the arrival question (empty tile) must be
   answered in the same prereg or the step is not
   ready to judge.
4. HOMEBODY-RANGE RULING (Steve-call, CARRIED, not a
   build). maxD 0 villagers can never be offered a
   HUNT, on any memory, ever (funnel-a rank #2,
   lottery prereg). No lever in this queue assumes
   they can until Steve rules. No prereg until the
   ruling exists.
5. EMPTY-TILE ARRIVAL (context, NOT this arm's next
   step — returns-a rank #2 stands unchanged). Even
   perfect pick-to-departure conversion on this band
   yields meetings only if the beast is still on the
   remembered tile; the band's arrival-empty rate is
   91% (297/326, returns-a). Any return lever must
   answer arrival lawfully (tracks, sound, following
   — never a roster or live lookup). This rank cannot
   be skipped by fixing departure alone.

## Metric review (for the NEXT run — never a mid-run re-score)

- (a) SINGLE-CLASS vs FAMILY DOMINANCE: this run's
  leg 2 failed on the strict per-class reading
  (1/1/1/1) while the replaced-before-departure
  family is 3/4 = 75%. The next prereg should EITHER
  pre-register the family rollup as the dominance
  metric (with the per-class split reported alongside)
  OR keep per-class dominance and require a larger
  band (more picks) before judging it. What it must
  not do is pick the reading after seeing the split.
- (b) CANDIDATE-NULL vs SUPERSESSION SPLIT: the
  prereg splits candidate-null-after-pick from
  superseded-by-re-pick by the first later pick's
  candidate state (null vs still offered). The
  nikos chain shows the split is load-bearing (d172
  re-pick vs d173 null), but a future analyzer
  should ALSO report the candidate-state flag on
  every supersession, so the two classes can be
  merged without losing the distinction.
- (c) DEPARTURE-HOLD BLIND SPOT: danger/heal verdicts
  are not recorded by the returns recorder, so
  'horizon' and 'held' cannot currently be split for
  picks with no later pick — and the danger-overwrite
  inference in this evidence rests on elimination,
  not on a verdict record. Ranked step #1 exists
  to close this. Until it runs, no evidence should
  claim a specific verdict (ask vs tighten vs defer)
  for any individual overwrite.
- (d) RECORDER COVERAGE CAVEAT: funnel picks are
  recorded only for wave-4 memory holders or wave-4
  HUNT choosers. A "first later pick" is therefore
  the first later RECORDED pick; if a villager's
  wave-4 memory were dropped/evicted between the
  HUNT pick and the next pick, the next pick would
  go unrecorded and the class could misread as
  horizon/gate-blocked. No pick in this universe
  hits that case (all four have a recorded later
  pick or a linked departure), but the caveat binds
  future bands with larger universes.
- (e) FIRST-LATER-PICK RULE: the class is set by the
  FIRST later pick, so a pick superseded on day N+5
  counts the same as one superseded in 3 parts.
  The evidence reports lag alongside every class
  (departure lag 2d/8 parts; needs supersession 0d/
  3 parts; re-pick 1d; candidate-null 1d) so a future
  prereg can judge lag-weighted conversion without
  re-reading the corpora.
- (f) PANEL NOTE (standing): scripts/balance-panel.js
  has no census-ingest mode; identical-seed corpora
  are the §15 substitute, as in returns-a/funnel-a/
  lottery-a. No panel artifact faked, no panel
  verdict claimed.

## Reproducibility

- Analyzer: scripts/test-pickdepart-a.js (pure reads;
  node --check clean; determinism: two runs byte-
  identical output). Run: node scripts/test-pickdepart-
  a.js --sense --out evidence/2026-10-29/
  pickdepart-a-analysis.json -> primary base 2
  (needs 1, departed 1), arm 2 (re-pick 1,
  candidate-null 1), pooled 4, unknown 0; secondary
  base 8 / arm 3; guards as above.
- Corpora reused read-only (never overwritten):
  evidence/2026-10-29/perseed-lottery-base/ and
  perseed-lottery-arm/ (8 rows each + summary.json).
  No new sims, no sweep, no lever commit mid-anything
  (lottery contamination lesson: nothing was committed
  except the prereg, the analyzer, the analysis JSON,
  and this evidence).
- No confirm sweep (diag arm; pilot band is the
  universe, and the universe is 4 picks — a confirm
  band would add picks only by adding seeds, which
  the next run's prereg should decide, not this one).
- Zero src/js diff on this branch (verified at
  closeout). No push, no bump, no live verification
  (ship-loop line). Ready for coordinator merge,
  pending ship — via the coordinator.

## Commits

- 8916a0816 prereg (before any judged analysis).
- Analyzer + analysis JSON + this evidence: final
  commit(s) on this branch (hashes in the run report
  to the coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
pick-to-departure blank is now decomposed pick by
pick (4/4 classified, nikos explained from age, gates
inventoried, danger-overwrite inference fenced as
inference with a recorder step ranked to prove it) —
but no wave-4 field party has yet killed in the field,
the full seat stays 0, wave 5 stays 0, and the
departure fix itself is still unbuilt. The directive
stands until the tracker records this axis converged
on measured evidence.
