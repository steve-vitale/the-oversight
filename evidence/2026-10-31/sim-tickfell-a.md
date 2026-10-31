# sim-tickfell-a — tick-budgeted morning fell gate: NO-GO at pilot, axe-starved

Run: oversight-flesh-out-loop, Loop A run fleshout-20261031T0643Z,
arm sim-tickfell-a, axis food-economy, tracker next-blank (1)
(strand-fix design reckoning: a near-minimal routine — fed +
axe mornings still need a day-part-cheap wood move),
adjacent to (NOT duplicating) Loop B's landed deadfall duty
(a haven staffing duty for sticks/fiber; this arm is a
field-morning fell by the stranded villager itself, no duty,
no haven staffing, no stick gathering). Worktree
sim-tickfell-a. POLICY PROTOTYPE ONLY: one new policy file,
zero edits to any existing policy file, zero src/js changes,
zero policy-default flips. Sibling trees never touched;
main tree never touched. Do NOT merge (coordinator merges);
do NOT push, bump, or verify live.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-tickfell-a-prereg.md (commit
7edc9581b) plus evidence/2026-10-31/
sim-tickfell-a-prereg-addendum.md (commit 7ae032ab,
committed BEFORE any judged leg; narrows clause (c)'s
"death" to the vessel's own death or a game-over — see
Metric review). Pinned base 3c03d468bbd6f752a35da27aaa53
5601538a1d15 (branch sim-tickfell-a; the prereg and
addendum commits add only their own files, so the legs
run on pinned-base game/policy code verbatim plus the
new files added after them, which the proof's
tracked-diff guard checks are new files only, never
edits). Primary metric: the stranded-evening census on
seed 15215, guard + ON legs, extracted exactly as in
lackingline (still = woodcarry bucket creek + rescued
false; rescued = bucket creek + rescued true; strand =
maximal run of still evenings on consecutive loop-days).
GO threshold, judged exactly as written: GO iff (a) >= 1
both-evening (a loop-day still on BOTH control legs)
is rescued (same loop-day woodcarry bucket creek +
rescued true) on at least one tickfell leg; AND (b)
strand length (total still count AND maximal still-run
length) does not increase on EITHER tickfell leg versus
its same-WOODWARM control leg; AND (c) no death (vessel
death or game-over, per the addendum) moves earlier
versus the control legs. Otherwise NO-GO — including
a pilot with zero tickfell attempts, which the prereg
names explicitly as a substrate finding, not a pass.

## Canon

docs/CANON.md read. No canon doc covers the bridge/fell
tick budget itself: docs/TIME-ECONOMY.md covers ticks
and day-parts (the 96-tick fell cost and the 96-tick
bridge cost are engine constants, verified in code:
cutTree tickAction(96), bridge gate 96 in
woodcarry.js); docs/PRESERVATION.md covers food, not
wood. The strand-fix blank itself has no canon doc —
stated here instead of inventing canon. Standing rules
that bear on it: CANON.md's "no silent actions" and
the perception law (Steve 2026-10-28).

## Prior evidence read in full before designing anything

sim-strandfix-morning-b.md, sim-strandfix-ticks-b.md,
sim-selecttrim-a.md, sim-tickbudget-b.md,
sim-warmfuel-b.md (all evidence/2026-10-30),
sim-lackingline-a.md (evidence/2026-10-31), and
sim-axearrival-a.md (evidence/2026-10-30, read in
addition because axe presence decides whether this arm
can fire at all).

## Instruments (new, this arm)

- scripts/policies/tickfell-diag.js — the prototype
  (DELETED before the final commit per the NO-GO rule;
  see Instrument notes). Wrapper tickfell(warmed(
  woodcarry(nighttravel))), env-gated TICKFELL=1/0.
  Strand morning = previous evening travel-refused /
  creek / not rescued, wake not at haven, not inside
  haven, not game-over, not in combat. Gates in order:
  pack (wood < 4) -> BFS target on the occupied tile
  only (tree/bigtree, smallest path, bigtree > tree,
  row-major) -> TOOL, CHECKED FIRST via
  Game.cutInfo(target).canFell, zero cutTree calls on
  a false read, never a re-attempt (backlog #1590
  lesson) -> kcal floor (morning kcal >= 80, the
  fell's engine cost) -> TICK GATE (projected =
  morningTicksLeft - walkSteps - 96 - 40 >= 96).
  ONE fell per morning, then stop regardless of pack.
  Every morning carries a record (attempt or skip
  with reason) and an axe snap (woodcutTier tier/name
  + canFell), so a never-fires pilot is provable.
- scripts/tickfell-trace-a.js — driver adapted from
  kcalshort-trace-b.js (same warmed stack + tickfell
  wrapper, same evening/morning records, plus morning
  axe snaps and the tickfell store export; OUTDIR
  override only). Env gates asserted FATAL:
  POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
  WOODWARM=0/1, TICKFELL=0/1, DAYS=30; STRANDFIX=1
  and PRESSB=1 both FATAL (neither is in this stack).
- scripts/analyze-tickfell-a.js (pure reads: strand
  extraction, both-evening overlap, rescue check,
  length comparison, death comparison, projection
  audit, axe-presence table) and scripts/
  test-tickfell-a.js (proof).
- §15 panel: not applicable, as declared in the
  prereg — scripts/balance-panel.js runs
  sweep-compare registry policies on 150-day horizons
  with its own scorecard; it cannot express the
  nighttravel+woodcarry+woodwarm strand stack, the
  30-day creek-evening census, or an env-gated
  single-mechanism probe, and a 150-day win/vest
  panel would measure a different question on a
  different substrate. The comparison here is
  control-vs-tickfell legs on identical seeds
  through the census analyzer, and is never labeled
  a panel comparison.

## Verdict: NO-GO (at pilot — no confirm spend, per staging)

| clause | bar | result |
|--------|-----|--------|
| (a) >= 1 both-evening rescued | 0 rescued (both-evenings 7, 8, 9 still on both tickfell legs) | FAIL |
| (b) no strand lengthening, either leg | guard 3 -> 3, maxRun 3 -> 3; ON 10 -> 10, maxRun 10 -> 10 | PASS |
| (c) no earlier death, either leg | guard none -> none; ON day 17 -> day 17 | PASS |

The pilot fails clause (a) with zero tickfell attempts
on either leg, so the confirm band (9 seeds x 4 legs)
was NOT run — spending it could not change clause (a),
and the prereg's staging forbids confirm spend after
a pilot NO-GO. The prototype policy file was DELETED
before the final commit (killed arms leave no trace);
prereg, addendum, evidence, census, corpora, analyzer,
driver, and proof are kept (see Instrument notes for
the dependency consequence, flagged for the
coordinator).

## 1. THE STRAND SET RE-DERIVED (this base, not inherited)

Zero drift from lackingline, on a new base (sixth base
to show the same strand shape, counting wakeforage,
pressb, kcalshort, warmfuel, and lackingline):

| leg | creek | still | rescued | strand |
|-----|-------|-------|---------|--------|
| guard control | 4 | 3 | 1 (day 10) | 15215 nights 7-9 |
| ON control | 10 | 10 | 0 | 15215 nights 7-16 |
| guard tickfell | 4 | 3 | 1 (day 10) | 15215 nights 7-9 |
| ON tickfell | 10 | 10 | 0 | 15215 nights 7-16 |

Tickfell legs are census-identical to their controls
on every number: still days, rescued days, death day,
wave reach, warmth acted (ON: 6, both legs). The
wrapper's neutrality when it never fires is therefore
measured, not assumed: zero attempts, zero walks,
zero cutTree calls, zero RNG draws of its own — and
the trajectories agree exactly. Per-evening refusal
gates on the control legs match lackingline verbatim:
guard day 7 ticks-only (4 logs, 2254 kcal, 47 ticks),
days 8-9 kcal-only (4, 0, 239/109); ON days 7-9 the
same, then wood-short days 10-16 (3, 3, 2, 1, 0, 0, 0
logs; kcal 240/0/0/0/240/0/0; ticks 238/111/239/111/
238/111/111). Guard's day-10 rescue (bridge built:
4 logs, 180 kcal, 110 ticks) is a CONTROL rescue on
both guard legs, not a tickfell rescue of a
both-evening — days 7-9 are the both-evenings, and
all three stay still on both tickfell legs.

## 2. WHY ZERO ATTEMPTS: THE AXE NEVER ARRIVES ON THIS STACK

Morning axe snaps (tickfell legs; control legs carry
no wrapper store, but their trajectories are identical
and the driver's morning snaps on tickfell legs are
the re-derived presence table):

| mornings | tier / tool | canFell |
|----------|-------------|---------|
| guard L2 | none / bare hands | false |
| guard L3-7 (haven) | none | false |
| guard L8-10 (creek strand mornings) | whittle / Stone knife | false |
| guard L11+ (haven, post-rescue) | whittle | false |
| ON L2-7 (haven) | none, then whittle from L8* | false |
| ON L8-16 (creek strand mornings) | whittle / Stone knife | false |
| ON L17+ (haven, post-succession) | none | false |

\* ON L7 morning tier is none in the snap table's
haven rows; the Stone knife is in hand from L8, the
first creek morning — matching morning-b's "best tool
on strand mornings is a Stone knife (whittle tier)".

Strand-morning skip reasons, ON leg (10 strand
mornings: the morning after each still evening):

| morning | after still | wood | kcal | ticksLeft | skip | projected |
|---------|-------------|------|------|-----------|------|-----------|
| L8 | L7 | 4 | 44 | 256 | pack-ready | — |
| L9 | L8 | 4 | 0 | 128 | pack-ready | — |
| L10 | L9 | 3 | 0 | 256 | tool-gate | 118 |
| L11 | L10 | 3 | 31 | 128 | tool-gate | -10 |
| L12 | L11 | 2 | 0 | 256 | tool-gate | 117 |
| L13 | L12 | 1 | 0 | 128 | tool-gate | -11 |
| L14 | L13 | 0 | 0 | 256 | tool-gate | 118 |
| L15 | L14 | 0 | 52 | 128 | tool-gate | -10 |
| L16 | L15 | 0 | 0 | 128 | tool-gate | -11 |
| L17 | L16 | — | — | — | haven-morning (succession: vessel died day 17, new vessel wakes at haven) | — |

Guard leg strand mornings: L8, L9, L10, all
pack-ready (wood 4 in hand — the guard strand strands
on ticks/kcal, never on wood, so there is nothing
for a fell to fix there even with an axe).

Read the ON table three gates deep, because the
recorded skip names only the first:

1. TOOL: all 7 wood-short strand mornings fail
   canFell (whittle Stone knife; the BFS found a
   bigtree in reach on every one — targets (5,0) and
   (4,0) alternating with the wake cell — so the
   failure is the tool, never the target). Zero
   cutTree calls were made on any morning: the
   check-first rule held, and no 2-tick refused-fell
   hint line was ever paid.
2. KCAL: all 7 also fail the kcal floor (morning
   kcal 0, 31, 0, 0, 0, 52, 0 — all < 80). Even an
   axe arriving alone would not have fired a fell on
   any of these mornings without food too.
3. TICKS: the tick gate splits 3/4 — roomy mornings
   (256 left: L10, L12, L14) project 117-118, which
   WOULD pass the gate; tight mornings (128 left:
   L11, L13, L15, L16) project -10/-11, which would
   correctly skip. The gate discriminates; it is
   starved, not vacuous.

The reckoning the tracker blank asks for, in one
sentence: on the census stack, a fell-able morning
needs fed AND axe AND roomy ticks TOGETHER, and no
strand morning supplies even two of the three — the
mornings with wood in hand (guard L8-10, ON L8-9)
need no fell, and the mornings needing wood (ON
L10-16) hold a knife, no food, and (half the time)
no hours. The axe arrival the variant stack shows
(day-15 corpse loot, day-17 fed fell) never happens
on this stack: axearrival's warmed-only control
never held an axe in 30 days on its base, and this
pilot re-derives the same absence on the new base —
no axe-tier snap on any recorded morning of either
tickfell leg (loop-days 2-30; creek mornings whittle,
haven mornings none/whittle). The tick gate is therefore not the
binding constraint on this substrate; axe
acquisition (and, behind it, morning food) is.

## 3. SENSE-TEST (law — read end to end)

ON still evenings L10, L14, L16 (fullDaySay on the
judged tickfell-ON corpus): L10 works a Purslane
patch (240 kcal), eats it, travels to the creek, and
is refused on 3 logs; L14 deepens Green Thumb to L2,
gains Lucky Rock from the System, works and eats
Purslane, and is refused on 0 logs; L16 takes unknown
shoots (not food until identified), travels to the
creek, and is refused on 0 logs with 0 kcal in hand.
PASS on meaning: these read as a person living a day
— foraging, learning, being granted things — and
ending where the walk took them, with an honest
refusal. The tool-gate mornings themselves carry no
in-story line about the nearby bigtrees: the wrapper
takes no action, so no narration is owed under
no-silent-actions (an unattempted fell is not an
action), but the consequence is that the villager's
want — a tree in reach, no axe to fell it — is
invisible in the story. That invisibility is a
property of check-first design, disclosed here, not
a claim that the story says it. No fell day exists
to sense-read: there is no fell day on either leg.

## Village assessment (plain words)

The village is the same working village the strand
arms have always seen, on a new base with no drift:
it survives 30 days on all four pilot legs, its
scholar sleeps out by the creek for 3 nights with
the fire off and 10 nights with it on, and the
fire-on road ends the same way it always has — the
stranded villager dies in the wild on day 17 and a
successor wakes at haven. The pack tells the story
in one line: 4 logs, then 3, 2, 1, 0, as the fires
eat the bridge a log at a time, while the villager
carries a Stone knife past bigtrees it cannot fell
and wakes with 0 kcal on five of the seven
wood-short mornings. The tick-budgeted fell was
designed for a morning that never comes on this
road: a fed villager with an axe and hours to spare.
What the village is missing is not a smarter fell
gate — it is the axe itself, and the morning food
that would let an axe be swung. Until those arrive
on this stack, every wood fix measured here is
gated on a tool the villager does not hold.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Creek/bridge content
reached on all four pilot legs (guard 4 creek / 1
rescued, ON 10 / 0). Wave reach (maxWaveUnlocked):
wave 1 on all four legs; waves 2-5 in 0/4 in this
30-day window (same window as the prior strand arms;
the strand seed's climb stalls at the creek, not at
a wave gate, on these legs).

## Wall numbers

NOT OBSERVABLE as reachability on 30-day evening legs
(pre-seat, no field) — reported, never claimed.
Observed counts on all four pilot legs, all seeds
alive at day 30 (daysAlive 30, endReason survived;
the ON vessel death day 17 is a succession, not a
village loss): national 0, table 0, wins 0
(structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling —
all legs survived the window).

## Proof

scripts/test-tickfell-a.js: 71/71 checks pass
(33 unit + 38 corpus), including: strandDecision
cases (game-over, combat, prev-not-stranded x3,
haven-morning x2, fires); tickProjection arithmetic
including the exact 96/95 boundary (232 -> 96 fires,
231 -> 95 ticks-gate); fellDecision order
(pack-ready beats tool-gate beats kcal-floor beats
ticks-gate; cutinfo-unknown; wood-unknown; walk
pushing under the gate); findWoodTarget (empty
null, bush ignored, adjacent path empty, bigtree
tie-break, wall-unreachable null, diagonal-stance
path); corpus checks on all four pilot legs (errs 0
in every store, daysAlive 30, every strand morning
on tickfell legs recorded, control stores empty, at
most one attempt per morning, every attempt (none)
vacuously canFell-true with projected >= 96, every
tool-gate/cutinfo-unknown skip with no attempt that
loop-day, judgement clauses boolean and verdict
matching); determinism: tickfell-ON 15215 re-run
BYTE-IDENTICAL to the judged file.
NOTE: the proof was run BEFORE the prototype policy
file was deleted (see Instrument notes). Re-running
it after deletion fails at require time on the
missing module — that failure is the deletion
working as ordered, not a broken proof; the counts
above are the run's record.

## Metric review

- The addendum's death narrowing was necessary and
  is the right call in retrospect: the ON corpus's
  death record holds background monster/NPC deaths
  from day 3 onward, and judging clause (c) on them
  would have failed any diverging arm for noise.
  The narrowed clause (vessel death day 17 on both
  ON legs, none on guard legs) behaved cleanly.
  Future preregs should define death this way from
  the start, not by addendum.
- The both-evening definition behaved well: the
  overlap (7, 8, 9) is exactly the guard strand, and
  the guard day-10 rescue (a control rescue on both
  guard legs) correctly does NOT count as a
  both-evening rescue, because day 10 is not still
  on the ON control leg. A rescue definition that
  counted any rescued evening would have misread
  the guard strand's natural end as a tickfell win.
- The ROUTINE_ALLOWANCE (40) is UNVALIDATED by a
  fired fell: no fell fired, so no projection error
  (actual evening ticks minus projected) was ever
  measured. The allowance's arithmetic is proven
  (unit boundary tests), its accuracy as a routine
  forecast is not — a future arm that actually fells
  must audit it before trusting the gate. Do not
  cite 40 as a validated routine forecast.
- The tick gate's discrimination (3 pass / 4 fail
  on tool-gate mornings) is a counterfactual audit,
  not a result: projected values on mornings where
  the tool gate fired first. It shows the gate is
  not vacuous, and it must not be reported as "the
  gate would have rescued 3 evenings" — on those
  mornings the kcal floor also fails, so no fell
  would have fired even with an axe in hand.
- No metric revision is proposed for the GO bar
  itself: clause (a) failing on zero attempts is
  the correct verdict for a gate that never reaches,
  and clauses (b) and (c) passing on identical
  trajectories is the correct non-harm result, not
  a consolation pass.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tool — AXE NEVER
  HELD ON CENSUS-STACK STRAND MORNINGS (this arm):
  0 axe-tier snaps on any morning of either tickfell
  leg; all 7 wood-short ON strand mornings fail
  canFell with a whittle Stone knife while a bigtree
  stands in reach. Any field-wood fix on this stack
  is gated on axe acquisition first, not on its own
  gate. (evidence: this file; judged tickfell corpora,
  15215.)
- [open] 2026-10-31 — food-economy — FED+AXE+ROOMY
  NEVER CO-OCCUR ON STRAND MORNINGS (this arm):
  the 7 wood-short ON strand mornings fail tool
  7/7, kcal-floor 7/7 (0-52 kcal vs 80), and ticks
  4/7 (projected -10/-11 on tight mornings); the 3
  roomy mornings (projected 117-118) still fail tool
  and kcal. The near-minimal routine needs all three
  jointly; the stack supplies none jointly.
  (evidence: this file; judged tickfell corpora,
  15215.)
- [open] 2026-10-31 — food-economy/narration —
  TOOL-GATE SKIP IS INVISIBLE IN-STORY (this arm):
  strand mornings with a fellable tree in reach and
  no axe produce no line — the villager's want is
  nowhere in the day's text. Check-first design
  avoids the refused-fell hint cost, but it also
  removes the only line that would name the want.
  Whether a want line belongs here is a design call,
  not landed here. (evidence: this file; judged
  tickfell-ON fullDaySay, days 10/14/16.)

## Instrument notes (disclosed)

- safe-commit index clobber (known class): after BOTH
  the prereg commit and the addendum commit, the
  worktree's main index showed the just-committed
  file as a staged deletion while the file itself was
  present. Repaired both times with `git update-index
  --add --cacheinfo` from the HEAD blob (hash
  verified equal to the worktree file); `git status`
  after each repair shows only genuine untracked
  files, and `git show --stat HEAD` confirms each
  commit holds exactly its file. The same check will
  be run after the final commit.
- PROTOTYPE DELETION, READ CAREFULLY (coordinator):
  per the task's NO-GO rule, scripts/policies/
  tickfell-diag.js is DELETED before the final
  commit, and the final commit does NOT contain it.
  Consequence: scripts/tickfell-trace-a.js (driver)
  and scripts/test-tickfell-a.js (proof) require
  that module, so neither runs after deletion — the
  driver crashes on load, the proof fails at
  require. That is loud, not silent: nothing can
  silently arm tickfell from the merged tree, because
  the only file that implements it is gone. At merge
  the coordinator should either drop the driver +
  proof with the policy (they are this run's record,
  preserved in this evidence file's counts) or keep
  them explicitly as record-only files. scripts/
  analyze-tickfell-a.js does NOT require the policy
  and stays runnable over the corpora.
- No EPERM flap on this run: all four pilot legs
  plus the determinism leg wrote first-try, exit 0.
- Confirm band NOT run: pilot NO-GO per staging
  (see Verdict). No 9-seed numbers exist for this
  arm, and none are claimed.

## Files

- Prereg: evidence/2026-10-31/sim-tickfell-a-prereg.md
  (commit 7edc9581b; pinned base 3c03d468bb)
- Addendum: evidence/2026-10-31/
  sim-tickfell-a-prereg-addendum.md (commit 7ae032ab)
- Evidence (this file): evidence/2026-10-31/
  sim-tickfell-a.md
- Analyzer: scripts/analyze-tickfell-a.js; proof:
  scripts/test-tickfell-a.js (71/71, run before
  prototype deletion — see Instrument notes);
  driver: scripts/tickfell-trace-a.js
- Prototype (DELETED before final commit, per NO-GO
  rule): scripts/policies/tickfell-diag.js — no
  longer in the tree; its behavior is specified in
  the prereg and this file.
- Judged pilot corpora: evidence/2026-10-31/
  sim-tickfell-a-corpus-control-guard,
  -corpus-control-on, -corpus-tickfell-guard,
  -corpus-tickfell-on; census:
  sim-tickfell-a-census-pilot.json; pilot log:
  sim-tickfell-a-pilot.log
- Determinism: evidence/2026-10-31/
  sim-tickfell-a-corpus-determinism (15215
  tickfell-ON re-run, byte-identical to the judged
  tickfell-ON file)
