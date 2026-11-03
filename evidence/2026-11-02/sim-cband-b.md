# sim-cband-b — C-only judged band for the homeward guard

Run: oversight-flesh-out-loop-b, arm sim-cband-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T2233Z, axis food-economy).
Worktree sim-cband-b, branch sim-cband-b.
Prereg: evidence/2026-11-02/sim-cband-b-prereg.md
(committed 6102d5c69 BEFORE any judged leg;
instruments committed 620314529 first).
This worker does NOT push, bump, verify live,
merge, or rebase; the coordinator lands the
branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **Pilot GO.** Integrity-ok 7/8 (>= 4) AND
  established-band 7/7 of the integrity-ok pairs
  (>= 1) AND the episodes analyzer runs clean
  (exit 0, EPISODES + VETO-TOTALS printed). No
  REPRO failure, no DAY1-IDENTITY failure. The
  C-only judged band EXISTS: 7 judged C trips on
  which the guard demonstrably fired on the
  attempt hop.
- **Secondary guard-shape read: 0 C episodes.**
  The inherited shapes-C episode definition
  demands a vetoed HOMEWARD hop; every veto on
  this band was outward (attempt hops and
  walk-out/forage hops away from haven), so the
  unchanged shapes analyzer reports EPISODES
  total=0, VETO-TOTALS total=0. That is NOT a
  pilot failure (episodes were never a pilot
  threshold) and NOT a guard NO-GO — it is the
  finding: the guard fences shape C by vetoing
  outward attempts into pocketed tiles, which the
  inherited episode definition does not count.
  Whether "fences shape C" should include outward
  attempt vetoes is a coordinator question (see
  metric review), not a re-score here.
- **Established-strict 0/8, exactly as the prereg
  predicted.** The homewardac literal clause
  (armed attempt veto originSimOk === true) is
  structurally inapplicable to this band: all 8
  attempt hops are outward, and the guard records
  originSimOk ONLY on homeward vetoes (outward
  vetoes keep originSimOk null). Under the
  literal reading alone, this band's verdict
  would be DIAG (definition inapplicable to
  outward attempts) — the prereg says so in those
  words, and this file reports both readings so
  the coordinator can apply either without
  re-running.

## What was built (new files ONLY, zero game-code change)

- scripts/analyze-cband-b.js — judged-C analyzer
  delta: per-destination DAY1-IDENTITY, REPRO
  (shadow day-6 start vs stage-2 actual), C
  integrity (homewardac verbatim), established-
  band (shadow hop simOk false + armed attempt
  vetoed) and established-strict (+ originSimOk
  true). Needed because the 1636Z analyzer
  hardcodes the (2,8)->(4,8) hop.
- scripts/test-cband-b.js — proof 25/25 (BFS
  route table for all 8 band trips, analyzer
  fixtures incl. outward-veto band-true/strict-
  false and homeward-veto strict-true, reused-
  files-unmodified).
- UNCHANGED, verified by the proof test's git
  check: homeconstruct driver, homeconstruct
  analyzer, shapes analyzer, destfirst screener /
  confirm / analyzer, construct policy, guard
  policy, competent.js, src/js. Zero src/js
  changes, zero default flips, zero bundled fix.
- Predecessor proof tests re-run post-pilot as
  regression checks, not re-authored: scripts/
  test-destfirst-b.js 21/21, scripts/
  test-homewardconstruct-b.js 15/15, scripts/
  test-homeward-shapes-b.js ALL PASS.

## Judged legs (8 pairs, 30d, construct-shadow / construct-armed)

Route env = BFS haven->screened origin (proof-
verified); hop env = screened-origin>dest
(policy uses only the dest). Every filename
carries origin AND destination (the destfirst
caveat, honored).

### Per-destination ledger

DAY1-IDENTITY 8/8 PASS. REPRO (shadow day-6
start = stage-2 actual) 8/8 PASS — the judged
legs reproduce the stage-2 trips exactly.

| Seed | Origin->Dest | Day-6 start (both legs) | Integrity | Shadow hop E | Armed attempt | Established band / strict | Armed day-6 end / E |
| 69702 | 0,6->0,7 | shadow (0,6), armed (3,6) | FAIL start-mismatch | false | not offered (armed start too far) | no / no | (3,6) / true |
| 69704 | 0,7->1,7 | (2,7) | OK | false | vetoed, silent (memory: same dest vetoed day 5) | yes / no (originSimOk null) | (3,6) / true |
| 69706 | 0,2->0,1 | (1,1) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (1,1) / true |
| 69707 | 7,3->8,3 | (7,3) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (7,3) / true |
| 69709 | 1,2->1,1 | (1,2) | OK | false | vetoed, spoken + silent repeat | yes / no (originSimOk null) | (1,2) / true |
| 69713 | 7,4->8,4 | (6,4) | OK | false | vetoed, spoken (jump (6,4)->(8,4)) | yes / no (originSimOk null) | (6,4) / true |
| 69714 | 0,4->0,3 | (1,4) | OK | false | vetoed, silent (memory: same dest vetoed day 5) | yes / no (originSimOk null) | (1,4) / true |
| 69717 | 0,4->0,3 | (0,4) | OK | false | vetoed, spoken | yes / no (originSimOk null) | (0,4) / true |

Totals: integrity-ok 7/8, established-band 7/7
of integrity-ok, established-strict 0/8.

### The one failure (69702), mechanism exactly as predicted

Shadow day-5 walk-out hops (3,6)->(2,6),
(2,6)->(1,6), (1,6)->(0,6) all carry simOk
false. The armed guard vetoes the walk-out at
(3,6)->(2,6) (spoken), competent.daily then
tries the (3,6)->(1,6) jump and is vetoed again
(spoken), and the scholar camps at (3,6) with
day-5 end E true. Day-6 armed start is (3,6),
not the shadow's (0,6); the attempt to (0,7) is
not offered from (3,6) (distance 4, unrevealed).
Integrity FAIL start-mismatch. This is the guard
fencing OUTWARD on day 5, not a homeward rescue
— the same outward-prevention shape as the 1636Z
day-5 vetoes. It does not break the band: 7/8
integrity-ok clears the prereg bar, and the
failure mode is itself informative (a walk-out
through E-failing tiles cannot establish a C
pair, because the armed scholar never gets
there).

### Episodes + veto E table (unchanged shapes analyzer, band files)

```
EPISODES total=0 A=0 C=0 cLooseDays=0
VETO-TOTALS total=0 disagree=0 hopExplains=0 agreeFail=0 agreePass=0
```

No VETO lines at all: the analyzer tabulates
only vetoed HOMEWARD hops, and this band
produced zero homeward vetoes on any leg, any
day. The full armed veto picture, from the hop
logs (all outward, all simOk false, all
originSimOk null):

| Seed | Armed vetoes (day: hop, spoken/silent) |
| 69702 | d5: (3,6)->(2,6) spoken, (3,6)->(1,6) spoken; d6: none |
| 69704 | d5: (2,7)->(1,7) spoken (walk-out final step; same outcome as shadow engine refusal, no divergence); d6: (2,7)->(1,7) silent (attempt) |
| 69706 | d5: (1,1)->(2,0) spoken + 2 silent repeats, (1,2)->(0,0) spoken, (1,2)->(2,0) silent; d6: (1,1)->(0,1) spoken (attempt) + 5 silent repeats of pocketed forage hops |
| 69707 | d6: (7,3)->(8,3) spoken (attempt) |
| 69709 | d6: (1,2)->(1,1) spoken (attempt) + silent repeat |
| 69713 | d6: (6,4)->(8,4) spoken (attempt jump) |
| 69714 | d5: (1,4)->(0,3) spoken (competent.daily's own day-5 attempt toward the dest); d6: (1,4)->(0,3) silent (attempt) |
| 69717 | d6: (0,4)->(0,3) spoken (attempt), (1,4)->(0,2) spoken, (1,4)->(1,3) spoken |

Day-6 ends, armed vs shadow: on all 7
integrity-ok pairs the armed scholar ends day 6
at the day-6 start with dayEnd E true; the
shadow scholar ends pocketed (dayEnd false) on
69707 (8,3), 69709 (1,1), 69717 (0,3), and
passing elsewhere. The fence's observable effect
is a scholar kept on escapable ground instead of
camping in a pocket — clearest on 69707 (below).

## Sense-testing law — transcript sample (69707, day 6)

Shadow day 6: the scholar steps into (8,3)
(#438 "Travel 1 tile to forest floor"), meets a
black bear ("It's not scared — it's DECIDING"),
forages unknown nuts, sleeps rough, and ends
STARVING ("the spiral has started") at (8,3)
with dayEnd E false. A pocket with real
consequences: the scholar went in, could not get
home, and paid for it in hunger.
Armed day 6: at the same beat (#438) the line
is "You don't walk there — you couldn't get home
from there." — then "Travel 1 tile to wetland."
The scholar turns aside instead of stepping in,
and ends the day at (7,3) with dayEnd E true.
The refusal reads as a person deciding, with a
reason, followed by a different move — not a
system error and not a silent block. This is the
fence working as narration AND trajectory.
Two qualifications, both real:
- Silent repeats (69704, 69714): the day-6
  attempt veto is silent because veto memory
  already spoke the same destination on day 5.
  A reader watching only day 6 sees a refused
  step with no explanation — a mild tension with
  "no silent actions", by design (no spam), but
  the day-6 refusal itself is unexplained on the
  page.
- Dogged retries (69706): the armed scholar
  tries the pocketed (1,1)->(2,0) forage hop
  three times in a day, refused each time (first
  spoken, rest silent). The guard's silence on
  repeats is correct; the underlying retry loop
  looks stubborn rather than sensible — that
  loop belongs to competent.daily's forage trips,
  not to the guard, and is noted here, not fixed
  here.
Nothing robotic in the veto lines themselves;
the village around the trips reads as people
(gossip chains, garden work, creek crews) in
both legs, identical until the fence fires
(day-1 identity + pre-trip transcripts match).

## Village assessment (plain words)

The village in these legs is a working camp in
its first month: gardens watered, creek crews
fishing, pantry meals in the hall, gossip
traveling and picking up decorations as it goes.
The scholar is the one who walks out — and on
the shadow legs, the walk out is where the
trouble starts: three scholars camp the night in
a tile they cannot get home from, one of them
starving there. On the armed legs the same
scholars are stopped at the edge of exactly
those tiles, once, with a plain reason, and
spend the night on ground they can leave. The
blank this run fills is narrow but real: the
1730Z C destinations were "constructible", not
judged — now 7 of them are judged, and the guard
is shown firing on the attempt itself, not
merely on paper. What is still missing is a
homeward-shaped episode: nobody on this band
was ever fenced while walking HOME, so the
question "does the guard rescue anyone
homeward?" is still open — this band answers
"does the guard stop anyone walking INTO a
pocket?", and the answer is yes, 7 times.

## Wall numbers (honestly-limited, 30d construction substrate)

16/16 legs survived the 30d window (all
endReason "survived"; median survival 30d,
censored). Wave reach in-window: wave 2 on all
16 legs, wave 3 on 14/16 (69702 shadow and 69707
shadow stopped at wave 2). National / table /
wins: 0/16 — the 30d construction window does
not reach them, and no wall movement is shown or
claimed. Pooled death records across the 16 legs
(329 records, village-wide over 30d, not scholar
deaths): villager combat 246 (74.8%), combat 38
(11.6%), expedition 18 (5.5%), monster 13
(4.0%), the wild 7 (2.1%), the rest singletons
(wound, starvation, contest, named foes). These
are substrate deaths in constructed-trip legs,
not a natural-play wall reading.

## Balanced panel (§15)

VACUOUS by prereg design (see prereg): the
panel expresses the guard policies on natural
campaigns; this band's before/after IS the
shadow/armed pair on identical seeds and route
env. No compare file is fabricated.

## Metric review (for the NEXT run, not this one)

- The homewardac literal established clause
  (originSimOk === true) does not transfer to
  outward attempts: the guard never records
  originSimOk there. Either the clause needs an
  outward-attempt form (e.g. armed attempt
  vetoed + armed day-6 stay on escapable ground,
  both true on all 7 established trips here), or
  the guard needs to record origin E on outward
  vetoes too. Proposed for the next run's prereg,
  NOT applied here.
- The shapes-C episode definition demands a
  vetoed homeward hop; a band whose fence fires
  only on outward attempts can be GO with 0 C
  episodes. Whether "fences shape C" should
  include outward attempt vetoes is a coordinator
  question for the next run, not a re-score here.
- The 69702 prediction in the prereg (armed
  walk-out veto -> start-mismatch) reproduced
  exactly. A follow-up band that wants C pairs
  through E-failing walk-out tiles will need a
  different construction (the armed scholar
  cannot be walked through tiles the guard
  fences).
- Silent day-6 attempt vetoes (veto memory from
  day 5) leave the day-6 refusal unexplained on
  the page. If the guard ever ships as a player-
  facing aid, the first veto OF THE DAY (not just
  of the run) may need to speak.

## Findings for the coordinator (sim-findings format; NOT
written to hidden_files/sim-findings.md — that file is
0 bytes after a truncation, restoration pending another lane)

- [open] 2026-11-02 — homeward-guard — outward
  attempt vetoes carry originSimOk null by guard
  construction (origin E recorded only on
  homeward vetoes), so the homewardac literal
  established clause cannot judge outward-fenced
  C trips (this run's evidence: 7 established-
  band trips, 0 established-strict).
- [open] 2026-11-02 — homeward-guard — shapes-C
  episode definition (vetoed homeward hop) sees
  nothing on a band fenced entirely outward:
  0 episodes despite 7 fired attempt vetoes
  (this run's evidence).
- [open] 2026-11-02 — guard-narration — veto
  memory silences a day-6 attempt veto when the
  same destination was vetoed on day 5, leaving
  the day-6 refusal unexplained on the page
  (69704, 69714 armed legs, this run's evidence).
- [open] 2026-11-02 — construction-method — a
  C pair whose walk-out crosses E-failing tiles
  cannot establish under an armed guard: the
  armed scholar is vetoed on the way out and
  never reaches the pair (69702, this run's
  evidence; prereg prediction reproduced).

## Corpora

- evidence/2026-11-02/sim-cband-b-prereg.md
- evidence/2026-11-02/sim-cband-b.md (this file)
- evidence/2026-11-02/sim-cband-b-judged-<seed>-<origin>-to-<dest>-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-cband-b-band-{shadow,armed}.jsonl
- evidence/2026-11-02/sim-cband-b-integrity.txt
- evidence/2026-11-02/sim-cband-b-episodes.txt
- scripts/analyze-cband-b.js
- scripts/test-cband-b.js
