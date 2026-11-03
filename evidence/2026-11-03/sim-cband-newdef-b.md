# sim-cband-newdef-b — C band re-judge under the DECIDED metric

Run: oversight-flesh-out-loop-b, arm sim-cband-newdef-b
(coordinator brief 2026-11-03, axis food-economy).
Worktree sim-cband-newdef-b, branch sim-cband-newdef-b.
Prereg: evidence/2026-11-03/sim-cband-newdef-b-prereg.md
(committed 9162f839d3fe BEFORE any judged leg;
instruments committed 2ec2e296e4b1df28a45935ad65bb49dc9e18b4f8
next). This worker does NOT push, bump, verify live,
merge, or rebase; the coordinator lands the branch.
Status to coordinator: committed in worktree, pending
coordinator merge.

## Verdict (DIAG, judged against the prereg header, never re-scored)

- **DIAG with counts: COMBINED 7, OUT 7, HOME 0.**
  Primary = combined decided episodes = 7. The
  guard fences shape C under the decided
  definition on this band: all 7 integrity-ok
  pairs produce an outward-attempt episode
  (armed attempt vetoed + armed day-6 stay on
  escapable ground).
- **Homeward-only = 0, same as the old
  definition's 0.** The homeward-rescue question
  stays OPEN: no vetoed-homeward-hop episode
  exists on this band under either definition.
  The three fresh homeward vetoes are all ENTRY
  vetoes (E passes, entry blocked), which the
  homeward form correctly excludes — they are
  not escape vetoes and not C episodes.
- **No deploy claim comes out of this arm.**
  This is a diagnostic re-judge: it settles
  what the decided definition counts on the
  known band (7, not 0), not whether the guard
  ships. cband's PILOT-GO under the old
  definition stands untouched and is NOT
  re-scored here.
- **Ledger integrity holds on fresh legs:**
  DAY1-IDENTITY 8/8, REPRO 8/8, integrity-ok
  7/8, established-band 7/7 of integrity-ok,
  established-strict 0/8 — the same shape as
  the archived band, with one instrument-move
  caveat below (entry vetoes are new, escape
  vetoes identical).

## What was built (new files ONLY, zero game-code change)

- scripts/analyze-cband-newdef-b.js — decided-
  definition OUT analyzer delta: per-pair
  integrity (same field reads as the cband
  analyzer) + NEWDEF-OUT (integrity-ok AND
  shadow attempt simOk false AND armed attempt
  vetoed AND armed day-6 dayEndReturnSim.ok
  true).
- scripts/test-cband-newdef-b.js — proof 9/9
  (OUT true exactly on the decided form; false
  when the armed stay fails with band still
  true, when the shadow hop passes, when the
  armed hop is not vetoed, on start-mismatch,
  on attempt-not-offered; two-pair summary
  counts 1 of 2; unchanged shapes analyzer
  emits EPISODE-C on a homeward fixture;
  reused files unmodified).
- UNCHANGED, verified by the proof test's git
  check: homeconstruct driver, homeconstruct
  analyzer, cband analyzer, shapes analyzer,
  destfirst screener / confirm / analyzer,
  construct policy, guard policy, competent.js,
  src/js. Zero src/js changes, zero default
  flips, zero edits to any existing script or
  policy file, zero bundled fix.
- Predecessor proof tests re-run green on the
  current base BEFORE judging: scripts/
  test-cband-b.js 25/25, scripts/
  test-homeward-shapes-b.js ALL PASS, scripts/
  test-destfirst-b.js 21/21, scripts/
  test-homewardconstruct-b.js 15/15.

## Judged legs (8 pairs, 30d, construct-shadow / construct-armed)

Route env = BFS haven->screened origin (proof-
verified); hop env = screened-origin>dest
(policy uses only the dest). Every filename
carries origin AND destination (the destfirst
caveat, honored). Fresh legs only — the
archived cband corpus is a base-move
comparison, never pooled.

### Per-destination ledger

DAY1-IDENTITY 8/8 PASS. REPRO (shadow day-6
start = stage-2 actual) 8/8 PASS — the fresh
legs reproduce the stage-2 trips exactly.

| Seed | Origin->Dest | Day-6 start (both legs) | Integrity | Shadow hop E | Armed attempt | Established band / strict | Armed day-6 end / E | Shadow day-6 end / E | NEWDEF-OUT |
| 69702 | 0,6->0,7 | shadow (0,6), armed (3,6) | FAIL start-mismatch | false | not offered (armed start too far) | no / no | (3,6) / true | (0,6) / false | no |
| 69704 | 0,7->1,7 | (2,7) | OK | false | vetoed, silent (memory: same dest vetoed day 5) | yes / no (originSimOk null) | (3,6) / true | (3,6) / true | YES |
| 69706 | 0,2->0,1 | (1,1) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (1,1) / true | (1,1) / true | YES |
| 69707 | 7,3->8,3 | (7,3) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (7,3) / true | (8,3) / false | YES |
| 69709 | 1,2->1,1 | (1,2) | OK | false | vetoed, spoken + silent repeat | yes / no (originSimOk null) | (1,2) / true | (1,1) / false | YES |
| 69713 | 7,4->8,4 | (6,4) | OK | false | vetoed, spoken (jump (6,4)->(8,4)) | yes / no (originSimOk null) | (6,4) / true | (6,4) / true | YES |
| 69714 | 0,4->0,3 | (1,4) | OK | false | vetoed, silent (memory: same dest vetoed day 5) | yes / no (originSimOk null) | (1,4) / true | (1,4) / true | YES |
| 69717 | 0,4->0,3 | (0,4) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (0,4) / true | (0,3) / false | YES |

Totals: integrity-ok 7/8, established-band 7/7
of integrity-ok, established-strict 0/8,
NEWDEF-OUT 7/7 of integrity-ok.

### The one failure (69702), unchanged from archived

Same mechanism as cband: the armed guard
vetoes the day-5 walk-out at (3,6)->(2,6)
(escape) and the (3,6)->(1,6) jump, the scholar
camps at (3,6), day-6 armed start is (3,6),
the attempt to (0,7) is not offered.
Integrity FAIL start-mismatch. Not an OUT
episode (no integrity, no attempt), same as
archived.

### Episodes + veto E table (unchanged shapes analyzer, fresh band files)

```
VETO seed=69706 day=5 hop=1,1->3,4 hopTimeE=true originE=true dayEndE=true silent=false disagree=false
VETO seed=69707 day=6 hop=7,2->6,3 hopTimeE=true originE=true dayEndE=true silent=false disagree=false
VETO seed=69714 day=6 hop=1,4->3,3 hopTimeE=true originE=true dayEndE=true silent=false disagree=false
EPISODES total=0 A=0 C=0 cLooseDays=0
VETO-TOTALS total=3 disagree=0 hopExplains=0 agreeFail=0 agreePass=3
```

Homeward form: NEWDEF-HOME = 0 episodes. The
three VETO lines are ENTRY vetoes (vetoCause =
entry on every one: E passes, entry blocked),
so they fail the homeward form's simOk=false
clause and are correctly excluded. One A-shape
near-miss, not counted: 69707 day 6 qualifies
as an A day (shadow end false + armed
homeward vetoes >= 1 + armed end true) but the
shapes analyzer rejects the run
(A-RUN-REJECTED, no haven-prefix walk-out all
pass) — the day-6 entry veto does not make an
A episode either.

### Combined decided count

NEWDEF-OUT 7 + NEWDEF-HOME 0 = COMBINED 7.
Homeward-only (old definition) 0, reported
alongside, never substituted. Under the decided
definition the archived corpus would also give
7 + 0 — the fresh re-run reproduces the count,
it does not revise it.

### Honest split inside the 7 OUT episodes

The decided form counts a pair on vetoed +
armed stay alone, without requiring the shadow
scholar to end pocketed (see metric review).
Only 3 of the 7 show the sharp contrast
(shadow day-6 end pocketed, armed escapable):
69707, 69709, 69717. On the other 4
(69704, 69706, 69713, 69714) BOTH legs end
day 6 on escapable ground — the guard's veto
lands where the engine would refuse the
attempt hop anyway (shadow attempt simOk
false on all four), so the fence's marginal
trajectory effect there is nil on day 6 even
though the episode counts. The 7 is the
decided-definition count, stated as decided;
the 3-vs-4 split is the finding about what
that count means.

### Full armed veto picture, fresh legs (vetoCause from hop records)

All shadow legs: zero vetoes (the guard is
armed-only, as designed). Armed escape vetoes
are identical to archived on judged days; the
only new vetoes are entry-cause (see base-move
note).

| Seed | Armed vetoes (day: hop, cause) |
| 69702 | d5: (3,6)->(2,6) escape, (3,6)->(1,6) escape; d6: none |
| 69704 | d5: (2,7)->(1,7) escape; d6: (2,7)->(1,7) escape silent, (3,6)->(2,7) entry (NEW) |
| 69706 | d5: (1,1)->(3,4) entry (NEW, homeward), (1,1)->(2,0) escape x3, (1,2)->(0,0) escape, (1,2)->(2,0) escape; d6: (1,1)->(0,1) escape + pocketed forage-hop escapes |
| 69707 | d6: (7,3)->(8,3) escape, (7,2)->(6,3) entry (NEW, homeward) |
| 69709 | d6: (1,2)->(1,1) escape + silent repeat |
| 69713 | d5: (6,4)->(7,4) entry (NEW); d6: (6,4)->(8,4) escape |
| 69714 | d5: (1,4)->(0,4) entry (NEW), (1,4)->(0,3) escape, (1,4)->(2,3) entry (NEW), (1,4)->(2,2) entry (NEW); d6: (1,4)->(0,3) escape silent, (1,4)->(2,2) entry (NEW), (1,4)->(3,3) entry (NEW, homeward) |
| 69717 | d6: (0,4)->(0,3) escape, (1,4)->(0,2) escape, (1,4)->(1,3) escape |

## Base-move notes (fresh vs archived, never pooled)

Judged days 5-6 show NO divergence in any
judged field — day-6 starts, integrity reasons,
attempt offers, escape vetoes, day-6 ends and
dayEnd ok are identical to archived on all 8
pairs. The divergences are of two other kinds:

1. INSTRUMENT MOVE, not a game-code move: the
   fresh legs run under the entry-checked guard
   deployed 0807Z (sim-guarde-deploy-b), after
   cband. Archived hop records carry no
   allowPrime / vetoCause / entryBlockers
   fields; fresh ones do. EVERY newly-vetoed
   hop on fresh legs is entry-cause (listed
   NEW above); zero new escape vetoes. The
   entry check broadens what the guard vetoes
   but does not touch the judged escape
   picture or any count in this arm. Whether
   the entry-block statuses themselves moved
   with game code is not separated here — it
   does not affect the verdict.
2. POST-WINDOW / NARRATION drift, judged days
   unaffected: 69704 days 18-20 end/start
   positions diverge on BOTH legs (fresh ends
   (8,1), archived haven (4,4)) — after the
   judged window, both legs together, so it is
   a base drift in later natural play, not a
   guard effect. 69707 shadow whole-run
   maxWaveUnlocked moves 2 -> 3 (archived wave
   3 on 14/16, fresh 15/16). sayLines counts
   differ on all 16 legs even where day records
   are structurally identical (e.g. 69702
   shadow 2629 fresh vs 2751 archived) —
   narration volume drifted with intervening
   landings while trajectories on judged days
   did not. Sense readings below are from
   FRESH transcripts, not archived ones.

## Sense-testing law — transcript samples (fresh legs)

69707 armed day 6 (an OUT episode with the
sharp contrast): at seq 438 the line is "You
don't walk there — you couldn't get home from
there." — then "Travel 1 tile to wetland." The
scholar turns aside, forages unknown nuts,
learns a crow counter from a villager ("Step
OFF the strafing lane... Punish the landing."),
and camps at (7,3) with dayEnd E true. The
second refusal the same day (seq 442, "You
can't step there — you couldn't get in from
here.") is the entry veto on (7,2)->(6,3):
a different reason, in different words, for a
different blocked step — the two veto lines
distinguish their causes instead of repeating
one generic block. The shadow leg's same beat
steps into (8,3), meets a black bear
("powerful and intelligent-eyed"), and ends
STARVING. The fence reads as a person
deciding twice, with reasons, then doing
something else — not machinery. Qualification
carried from the fresh transcript: the armed
scholar still hits a STARVING line that night
(seq 455) — the fence keeps them out of the
pocket, it does not feed them. Escapable
ground is not dinner.
69717 armed day 6 (OUT episode): three spoken
refusals, each a different destination
((0,4)->(0,3) escape at seq 470, then
(1,4)->(0,2) and (1,4)->(1,3) escapes) —
each explained on first veto, then "Travel 1
tile to grove" and sleep rough on escapable
ground. The shadow leg ends pocketed at
(0,3), STARVING, after a raccoon steals its
unknown nuts mid-fight ("Its hands blur — and
suddenly it's holding your unknown nuts!").
The pocket has consequences; the fence has a
voice. Nothing robotic in the veto lines
themselves; the village around the trips reads
as people (gossip chains picking up
decorations, garden work, creek crews) in both
legs, identical until the fence fires.

## Village assessment (plain words)

The village in these legs is the same working
camp cband saw: gardens watered, creek crews
fishing, pantry meals in the hall, gossip
traveling and getting better with each
retelling. The scholar walks out, and on the
shadow legs the walk out is still where the
trouble starts: three scholars camp the night
in a tile they cannot get home from, two of
them starving there, one robbed by a raccoon
on the way. On the armed legs the same
scholars are stopped at the edge of exactly
those tiles, with a plain reason, and spend
the night on ground they can leave. What this
re-judge adds is narrow but decisive for the
bookkeeping: under the rule the coordinator
has now decided, those seven stops ARE the
episodes — the C question is no longer "0
episodes, definition TBD" but "7 outward
episodes, 0 homeward episodes." What is still
missing is a homeward-shaped episode: nobody
on this band was ever fenced while walking
HOME by an escape veto, so the question "does
the guard rescue anyone homeward?" is still
open — this band answers "does the guard stop
anyone walking INTO a pocket?", and the
answer is yes, 7 times, 3 of them with the
shadow scholar actually stuck in the pocket
they were kept out of.

## Wall numbers (honestly-limited, 30d construction substrate)

16/16 legs survived the 30d window (all
endReason "survived"; median survival 30d,
censored). Wave reach in-window (maxWave
unlocked, whole-run field): wave 3 on 15/16,
wave 2 on 1/16 (69702 shadow only; archived
had 69707 shadow at wave 2 as well — see
base-move note). National / table / wins:
0/16 — the 30d construction window does not
reach them, and no wall movement is shown or
claimed. Pooled death records across the 16
legs (358 records, village-wide over 30d, not
scholar deaths): villager combat 262 (73.2%),
combat 41 (11.5%), expedition 23 (6.4%),
monster 10 (2.8%), the wild 5 (1.4%), the rest
singletons (starvation 2, ambush 4, wound 3,
named foes, contest, lockjaw, mosquito). These
are substrate deaths in constructed-trip legs,
not a natural-play wall reading.

## Balanced panel (§15)

INAPPLICABLE by prereg design (see prereg):
the panel expresses the guard policies on
natural campaigns; this band's before/after IS
the shadow/armed pair on identical seeds and
route env. No compare file is fabricated.

## Metric review (for the NEXT run, not this one)

- The decided outward-attempt form drops the
  shadow-end condition, and this run shows the
  cost of that: 4 of 7 OUT episodes end with
  BOTH legs on escapable ground, where the
  guard's veto duplicates an engine refusal.
  If the next prereg wants episodes to mean
  "the fence changed the trajectory", it needs
  a stricter form (e.g. OUT + shadow day-6
  end E false) — that form would give 3 on
  this band, not 7. NOT applied here: the
  decided form counts 7, and this file reports
  both numbers so the next prereg can apply
  either without re-running.
- The homeward form's C-qualifying days can
  occur on any day of the 30d window, while
  OUT episodes are day-6 only; the combined
  count mixes a one-day form with a
  thirty-day form. The per-form split above
  keeps that visible; a future prereg that
  wants like-for-like should scope HOME to
  day 6 as well (on this band: still 0 — the
  day-6 homeward vetoes are entry-cause).
- Entry vetoes now outnumber escape vetoes on
  some fresh legs (69714: 5 entry, 2 escape)
  and the shapes VETO table tabulates them
  without distinguishing cause. A future
  analyzer revision should split VETO-TOTALS
  by vetoCause, so an entry-veto broadening
  like this run's cannot be mistaken for an
  escape-veto change.
- Routing note (not a metric change): this
  run's prereg said findings go in the
  evidence file instead of hidden_files/
  sim-findings.md, following cband's 0-byte
  truncation. That file has since been
  restored (1.3MB, live appends from other
  lanes), so this run's findings are appended
  there as well as listed below — the prereg's
  routing premise, not its metrics, changed
  under it.

## Findings for the coordinator (sim-findings format; also
appended to hidden_files/sim-findings.md)

- [open] 2026-11-03 — homeward-guard — C
  QUESTION ANSWERED OUTWARD, STILL OPEN
  HOMEWARD (this run's evidence): under the
  decided definition the C band counts 7
  outward-attempt episodes + 0 homeward
  episodes (combined 7); the guard stops
  scholars walking INTO pockets 7 times, 3
  with a shadow-pocketed contrast, but no
  escape veto on a homeward hop exists on
  this band, so the homeward-rescue question
  stays open under both definitions.
- [open] 2026-11-03 — homeward-guard — DECIDED
  OUT FORM OVER-COUNTS TRAJECTORY CHANGE
  (this run's evidence): 4 of 7 OUT episodes
  end with both legs on escapable ground (the
  veto duplicates an engine refusal); a
  trajectory-change form (OUT + shadow day-6
  end E false) would give 3 on this band.
  Next C prereg to decide whether episodes
  mean vetoes or changed trajectories.
- [open] 2026-11-03 — homeward-guard — ENTRY
  VETOES BROADENED UNDER THE DEPLOYED GUARD
  (this run's evidence): fresh legs under the
  entry-checked guard (0807Z deploy) veto 9
  hops archived legs did not, all entry-cause
  (69714 alone: 5 entry vs 2 escape); the
  shapes VETO table does not split by
  vetoCause, so entry broadening reads as
  veto growth. Future analyzer should split
  VETO-TOTALS by cause.
- [open] 2026-11-03 — guard-narration —
  FENCE KEEPS SCHOLARS OUT BUT DOES NOT FEED
  THEM (this run's evidence): 69707 armed
  day 6 ends escapable yet still hits a
  STARVING line that night — escapable ground
  is not dinner, and any player-facing fence
  narration should not imply the scholar is
  fed because they were kept out.

## Corpora

- evidence/2026-11-03/sim-cband-newdef-b-prereg.md
- evidence/2026-11-03/sim-cband-newdef-b.md (this file)
- evidence/2026-11-03/sim-cband-newdef-b-judged-<seed>-<origin>-to-<dest>-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-03/sim-cband-newdef-b-band-{shadow,armed}.jsonl
- evidence/2026-11-03/sim-cband-newdef-b-integrity.txt
- evidence/2026-11-03/sim-cband-newdef-b-out.txt
- evidence/2026-11-03/sim-cband-newdef-b-episodes.txt
- evidence/2026-11-03/sim-cband-newdef-b-basemove.txt
- scripts/analyze-cband-newdef-b.js
- scripts/test-cband-newdef-b.js
