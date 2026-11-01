# sim-gatecover-b — DIAG-GO: GATE MECHANISM NAMED + MARGIN RULE MEASURED, NO VERDICT CHANGES

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1930Z,
arm sim-gatecover-b, axis food-economy. Worktree sim-gatecover-b,
branch sim-gatecover-b. DIAG ONLY: zero src/js changes, zero
policy-default flips, zero edits to any existing script or policy
file. New files only, all named *-gatecover-b.*. The depositgate
driver, the dipslide/falsefire analyzers, and the competent
policy are REUSED VERBATIM, never edited. This worker does NOT
push, bump, verify live, or merge into master; the coordinator
merges.
Status to coordinator: committed on branch sim-gatecover-b,
pending coordinator merge.

## Verdict: DIAG-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-gatecover-b-prereg.md, commit
f502e856b57ed129e709a75cc7ad25d6c726cc68, written and committed
BEFORE any judged analysis (proof test 23/23 ran after the
prereg commit but before any judged application; the proof test
is pure, uses no judged seeds, and changes no prereg word).

- (G-1) GATE MECHANISM NAMED WITH TRACE EVIDENCE: PASS. The
  mechanism is named below with the full per-evening trace for
  the diagnostic 51608 re-run, which reproduces the published
  falsefire corpus trajectory row-for-row (28 rows, zero
  pantry/gate mismatches). The day-12 stand-down, the
  never-re-engage days 13-28, and the day-11 candidate's
  failed confirmation each have their exact failing condition
  shown, not asserted.
- (G-2) MARGIN RULE DECIDED AND VERDICT IMPACT MEASURED:
  PASS. The prereg's margin rule (105% breach OR sustained
  at-level pair in C+1..C+10) was applied to all 12 confirmed
  fires in the two corpora. Exactly one fire flips class
  (51316, false -> true). NO judged verdict changes: falsefire
  Q1 stays NO-GO, falsefire Q2 stays NO-GO-by-the-letter,
  dipslide3 GO stands untouched. Details below.

DIAG-GO means: the gate question is answered and the margin
question is measured. It does NOT mean the sensor is
deployable, and it does NOT settle the margin rule as the
standing definition — that adoption decision belongs to a
future arm's prereg, which now has this arm's numbers to
decide from.

## Q1 — THE MECHANISM, IN PLAIN WORDS

The gate is not a pantry-total sensor. It is a "fresh shelves
look plentiful" sensor with a hunger override, read fresh every
evening with no memory:

  gate engaged  =  gate armed  AND  fresh days-on-hand > 4
                   AND  nobody has gone hungry 3 days running.

In code (src/js/game.js): `_depositGateEngaged() =
_depositGateOn() && prodThrottleEngaged()`, and
`prodThrottleEngaged() = (hungryStreak < 3) AND
(pantryFreshDays() > 4)`, where `pantryFreshDays()` is the
FRESH slice only (preserved, rendered, and pemmican excluded;
spoiled excluded) divided by the measured burn rate — a ratio,
not a stock level. The sensor side is unchanged: a candidate
needs an engaged evening, a 20% fall over 5 evenings, and 3
consecutive falls; confirmation needs the D+5 evening to be
engaged AND inside the same final engaged run. So a village
whose fresh slice slips under 4 days does not merely lose a
warning — it loses the sensor's ability to count at all, and
there is no latch, no grace period, and no disengaged-state
rule to catch the fall afterward.

Why that kills 51608's warning, in one paragraph: the village
starts with 4.14 fresh days and flickers around the 4-day
line for 11 days (engaged days 1-4, 8-9, 11; disengaged days
5-7, 10 — every flicker decided by freshDays crossing 4,
never by hunger, never by the gate flag). On day 11 the fresh
slice reads 4.10 days with a 1-day hunger streak, so the gate
is engaged for the last time, and that evening IS an eligible
candidate (see below). On day 12 freshDays falls to 3.39 and
the gate stands down. From then on the fresh slice never
climbs back over 4 days — it falls 3.39 -> 0.14 over days
12-28 — except on day 25, when the player unloads 36,790 kcal
and freshDays spikes to 10.98, but by then the hunger streak
is 6, so the hunger override stands the gate down anyway.
The gate therefore has no engaged evening after day 11, the
final engaged run is day 11 alone, and the day-11 candidate's
D+5 evening (day 16, pantry 5,870, gate disengaged) cannot
confirm. The pantry's 16-day slide to 700 happens entirely
outside any engaged run, so final-run counting — the only
counting the program has — has nothing to score. The
instrument does not malfunction on 51608; it behaves exactly
as coded, and the code's definition of "plentiful" is what
goes quiet on a starving village.

## Q1 — THE TRACE (diagnostic re-run, seed 51608, armed, 30d competent)

Reproduction: village-lost, 28 days alive, 28 rows — identical
to the falsefire corpus row-for-row on evening pantry AND
gate state (0 mismatches in 28 evenings). Fresh kcal equals
total pantry on every evening except day 26 (7,449 total,
6,097 fresh — a 1,352 kcal preserved slice appears that
evening). gateOn is true on all 28 evenings (DEPOSITGATE=1
armed); prodThrottleEngaged equals gateEngaged on all 28
evenings, as it must when the gate is armed. "Fail" names the
condition that fails that evening; "—" means engaged.

| day | gate | pantry | freshKcal | freshDays | streak | fail |
|---|---|---|---|---|---|---|
| 1 | on | 38,000 | 38,000 | 4.14 | 0 | — |
| 2 | on | 38,000 | 38,000 | 4.14 | 0 | — |
| 3 | on | 26,200 | 26,200 | 4.03 | 0 | — |
| 4 | on | 26,050 | 26,050 | 4.01 | 0 | — |
| 5 | off | 21,076 | 21,076 | 3.47 | 0 | not-plenty |
| 6 | off | 19,210 | 19,210 | 3.55 | 0 | not-plenty |
| 7 | off | 18,610 | 18,610 | 3.77 | 0 | not-plenty |
| 8 | on | 18,485 | 18,485 | 4.01 | 0 | — |
| 9 | on | 15,200 | 15,200 | 4.13 | 0 | — |
| 10 | off | 13,210 | 13,210 | 3.97 | 0 | not-plenty |
| 11 | on | 12,111 | 12,111 | 4.10 | 1 | — |
| 12 | off | 9,483 | 9,483 | 3.39 | 0 | not-plenty |
| 13 | off | 9,025 | 9,025 | 3.20 | 0 | not-plenty |
| 14 | off | 8,295 | 8,295 | 2.73 | 0 | not-plenty |
| 15 | off | 7,535 | 7,535 | 2.35 | 0 | not-plenty |
| 16 | off | 5,870 | 5,870 | 1.72 | 0 | not-plenty |
| 17 | off | 4,885 | 4,885 | 1.41 | 1 | not-plenty |
| 18 | off | 3,210 | 3,210 | 0.86 | 2 | not-plenty |
| 19 | off | 2,167 | 2,167 | 0.58 | 0 | not-plenty |
| 20 | off | 1,407 | 1,407 | 0.37 | 1 | not-plenty |
| 21 | off | 1,400 | 1,400 | 0.36 | 2 | not-plenty |
| 22 | off | 595 | 595 | 0.16 | 3 | not-plenty+exempt |
| 23 | off | 3,530 | 3,530 | 1.01 | 4 | not-plenty+exempt |
| 24 | off | 1,365 | 1,365 | 0.38 | 5 | not-plenty+exempt |
| 25 | off | 38,085 | 38,085 | 10.98 | 6 | hunger-exempt |
| 26 | off | 7,449 | 6,097 | 1.45 | 0 | not-plenty |
| 27 | off | 2,255 | 2,255 | 0.47 | 1 | not-plenty |
| 28 | off | 700 | 700 | 0.14 | 2 | not-plenty |

THE THREE QUESTIONS, ANSWERED WITH NUMBERS:

(i) Why day 12 stands down: day 11 ends engaged with freshDays
4.10 and streak 1; day 12 ends with freshDays 3.39 (below the
strict > 4 line) and streak 0. The ONLY condition that flips
is plenty: 4.10 -> 3.39 crosses 4. The hunger override plays
no part (streak 0 on both evenings, and 1 on day 11). The
stand-down is a fresh-slice crossing, not a hunger event and
not a gate-flag event.

(ii) Why days 13-28 never re-engage: days 13-21 fail on plenty
alone (freshDays 3.20 down to 0.36, streaks 0-2, never >= 3).
Days 22-24 fail on BOTH conditions (freshDays 0.16 / 1.01 /
0.38 AND streaks 3 / 4 / 5). Day 25 is the trap case: plenty
PASSES (freshDays 10.98 after the player's 36,790 kcal
unload) but the hunger override FAILS it (streak 6) — the one
evening the fresh slice recovers is the evening the village
has been hungry longest, so the gate stays down. Days 26-28
fail on plenty alone again (freshDays 1.45 / 0.47 / 0.14,
streaks 0 / 1 / 2). There is no evening after day 11 on which
both conditions hold at once.

(iii) Why the day-11 candidate cannot confirm: day 11 IS an
eligible candidate — loopDay 11 >= 8, gate engaged, 5-evening
fall 19,210 (day 6) -> 12,111 (day 11) = 37.0% (>= 20%), and
three consecutive falls ending at day 11 (15,200 -> 13,210
-> 12,111, via day 9's 15,200 after day 8's 18,485). The
analyzer on the trace confirms: eligibleCandidatesInRun =
[11], finalRun = [11, 11], levelStandDown = 12. Its
confirmation window (days 12-16: 9,483 -> 9,025 -> 8,295 ->
7,535 -> 5,870) never reaches the 12,111 level and shows no
tolerance-recovery — the pantry trajectory itself would
confirm. It fails SOLELY because its D+5 evening, day 16,
is disengaged and outside the final run (the run is day 11
alone). ConfirmedAnywhere is also null, because the
anywhere rule likewise requires the D+5 evening engaged.
The slide is real, the candidate is real, and the counting
rule has no engaged evening to stand on.

WHAT WAS EXCLUDED (so the mechanism is not a guess):

- NOT the gate flag: gateOn is true on all 28 evenings.
  DEPOSITGATE=1 armed throughout; nothing switches the gate
  off.
- NOT the hunger override alone: streaks are < 3 on days
  12-21, the whole first 10 days of the stand-down. The
  override explains day 25 only (and contributes days
  22-24, where plenty already fails).
- NOT a total-pantry threshold: totals cannot explain the
  flicker. Day 10 (13,210, fresh 3.97) is OFF while day 11
  (12,111, fresh 4.10) is ON — a LOWER total engages while a
  higher total does not, because freshDays, a ratio over
  the measured burn rate, crossed 4 in the other direction.
  Any total-only rule is refuted by that pair.
- NOT a latch or hysteresis: the gate re-engages after
  disengagements (days 8, 9, 11 follow days 5-7, 10 off),
  so there is no "once off, stays off" state. "Never
  re-engages" after day 11 is not a latch failure — it is
  the condition simply never holding again.
- NOT population: alive stays 12 through day 21 while the
  gate flickers and then stands down; the stand-down
  precedes the deaths, it does not follow them.
- NOT an intraday artifact (within the stated limit): the
  trace records the evening read, which is the read the
  sensor's counting uses. Intraday gate flicker is not
  measured and is not needed: the evening read alone
  decides scoring, and the evening condition values
  explain every evening's state.

## Q2 — THE MARGIN RULE AND ITS VERDICT IMPACT

MARGIN RULE (prereg, fixed before judging; symmetric with
the dipslide3 tolerance confirmation rule): a recovery in
C+1..C+10 counts only if some evening reaches >= 105% of the
candidate level (margin breach) OR two consecutive evenings
both reach >= the level (sustained at-level pair). A single
evening at or above the level, below 105%, undone the next
evening, is noise. The margin layer never changes
confirmation, candidates, or flagging; it only re-scores
already-confirmed fires. Margin recovery is a subset of
settled recovery, so it can only flip false -> true, never
true -> false — and that is exactly what happens, once.

PER-FIRE RE-SCORING (settled -> margin; corpora re-scored
from the existing files, no new sims; the analyzer's settled
layer reproduces the published falsefire tables exactly on
all 12 fires — candidate, level, confirmedDay, recoveryDay,
fire class, censoring: ZERO discrepancies, so the margin
comparison rests on verified inputs):

| seed | cand (level) | conf | settled | settled recDay | margin | margin recDay/reason |
|---|---|---|---|---|---|---|
| 51312 | 9 (21,800) | 14 | true | — | true | — |
| 51314 | 23 (12,250) | 28 | true (cens, 2 ev) | — | true (cens, 2 ev) | — |
| 51315 | 8 (22,500) | 13 | true | — | true | — |
| 51316 | 9 (21,250) | 14 | FALSE | 15 | TRUE | none: day 15 is 21,255 (+5, +0.02%, below 22,312.50), day 16 is 21,158 (below level); no breach, no sustained pair in days 15-24 |
| 51318 | 9 (21,300) | 14 | true | — | true | — |
| 51319 | 8 (19,500) | 13 | true | — | true | — |
| 51320 | 9 (24,600) | 14 | true | — | true | — |
| 51324 | 8 (21,350) | 13 | true | — | true | — |
| 51326 | 19 (11,681) | 24 | true (cens, 6 ev) | — | true (cens, 6 ev) | — |
| 51328 | 11 (16,271) | 16 | true | — | true | — |
| 51602 | 17 (18,300) | 22 | FALSE | 27 | FALSE | day 27: 22,097 (+20.7%, above 19,215.00 margin) — margin breach, same day as the settled recovery |
| 51604 | 19 (15,072) | 24 | true (cens, 6 ev) | — | true (cens, 6 ev) | — |

RATES AND VERDICT IMPACT:

- Dipslide3 corpus (20 seeds, 10 fires): settled judged
  1/8 = 12.5% (observed 1/10 = 10%); margin judged 0/8 = 0%
  (observed 0/10 = 0%). The corpus's only false fire
  disappears under the margin rule.
- Falsefire pilot (8 seeds, 2 fires): settled judged 1/1 =
  100% (observed 1/2 = 50%); margin judged 1/1 = 100%
  (observed 1/2 = 50%). Unchanged — 51602's recovery is a
  genuine +20.7% turnaround, not noise, and the margin rule
  correctly keeps it false.
- Pooled (28 seeds, 12 fires): settled judged 2/9 = 22.2%
  (observed 2/12 = 16.7%); margin judged 1/9 = 11.1%
  (observed 1/12 = 8.3%). Both pass the 25% cap.
- Falsefire Q1 under the margin rule: FF-1 pooled 11.1%
  PASS (was pass); FF-2 pilot sensitivity 2 < 3 FAIL
  (unchanged — the margin layer touches no confirmation);
  FF-3 pilot judged 1/1 = 100% FAIL (unchanged).
  Q1 verdict: STILL NO-GO. The margin rule halves the
  pooled rate but does not rescue deployability, because
  deployability was never blocked by 51316 — it was blocked
  by the quiet pilot band.
- Falsefire Q2 under the margin rule: extension-resting
  confirmations still 0 on both bands; sensitivity excluding
  extension still 10 (corpus) / 2 (pilot). Q2 verdict:
  UNCHANGED (NO-GO-by-the-letter on the pilot leg, for the
  same quietness reason as before).
- Dipslide3 GO under the margin rule: UNCHANGED. Confirmation
  counts (5 pilot / 5 confirm) and hairline-only counts (0 /
  0) are untouched by a scoring layer applied after
  confirmation.

So: the margin rule does real work (it removes exactly the
noise case it was built for, and only that case) and changes
no verdict. A future arm that adopts the margin rule as the
standing definition would report a cleaner corpus (0/8) and
the same pilot failure (1/1) — adoption is a defensible
cleanup, not a deployability rescue, and the pilot-quietness
problem, not the scoring, remains the blocker.

CAVEAT, STATED PLAINLY: the margin rule's sustained-pair
clause never trips on any judged fire (51602 trips on the
margin clause; 51316 trips on neither). The sustained clause
is proven only by the pure proof test (a synthetic tiny
pair counts; separated tiny bounces do not), not by judged
data. A future band could still surprise it — e.g. two
consecutive +0.02% evenings would count as a recovery under
this rule, by design (durability over noise), and that
design choice, not just the 105% number, is what a future
arm adopts if it adopts this rule.

## Sense test (SENSE-TESTING LAW: read, don't just count)

The voice goes quiet at exactly the wrong moment, and the
trace shows why: the "shelves are full" redirect line only
fires while the gate is engaged, so the last such line in
the whole run is day 11 — the last engaged evening — and
then nothing of that kind ever speaks again, for 17 days,
while the village starves.

Day 11 (last engaged evening, pantry 12,111, fresh 4.10):
"Tariq checks the pantry before heading out — the shelves
are full, ~4 days of fresh on hand… leaves the fish nets
standing and turns to the water run instead. The pantry
can't take more; the wild will keep." And the depositgate
day voice the same evening: "Sam taps the pantry door —
full to bursting — and keeps the day's share in hand.
'Dinner's on me tonight, then.'" A player reading day 11
hears a village that thinks its shelves are full. The next
evening the fresh slice is 3.39 days and that voice simply
stops — no line announces the crossing, because the line
belongs to the engaged state that just ended.

Day 25 (the trap evening, pantry 38,085, fresh 10.98,
streak 6): "Tariq checks the pantry before heading out —
~11 days of fresh on hand, but someone has gone hungry
three days running. The hungry eat first: keeps working
the fish nets instead of turning to other work." This is
the hunger-exempt voice, and it is the ONLY line in the
run that names both halves of the gate's logic in one
breath: plenty AND hunger, with hunger winning. A player
hearing it would understand the gate's second condition
perfectly — and would have no way to know that this same
override is what keeps the sensor silent on the one evening
the pantry looks full again. The unload itself reads
bluntly in the transcript: "You keep a day's food (1950
kcal) and unload 36790 kcal into Haven's pantry." — and by
the next evening the pantry is back to 7,449.

Day 21 (first starvation): "Leo starved. Slowly. Somebody
keeps looking at the door, like they're still going to
walk in." with the crisis beat the same evening: "CRISIS —
THE HUNGER WINTER. Three days now the village has gone to
sleep hungry. The pantry is an echo."

Day 28 (collapse): "Cristian starved. Slowly. Nobody eats
much tonight. The pot stays full and nobody touches it."
— the known "pot stays full" prose line, reproducing here
on the collapse evening itself, beside starving people.
Recorded only, not re-litigated; already filed by the
depositgate arm. The sense judgment: the gate's silence
does NOT read sensibly to a player. Nothing in the voice
marks the day-12 crossing from "shelves full" to "sensor
off," and the village's own words keep saying "full" on
the last day anyone listens, then fall silent while people
starve. A warning instrument whose voice is gated on the
very plenty it is meant to watch will always go quiet
first on the village that needs it most — that is the
plain-words form of the Q1 finding.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins
— those are late-game states, and this sweep carries no such
fields. NO wall movement is claimed. Diagnostic seed 51608
(reproduced): village-lost day 28, wave reach 2, median/max
survival not meaningful on n = 1. Corpora wall numbers
stand as published in falsefire/dipslide3 (corpus 20/20
survived 30d, wave max 2; pilot 7/8 survived, 1 collapse) and
are not re-claimed here. Collapse supply program-wide is
still n = 2 (51101 + 51608); collapse earliness remains
unjudged on 51608 because it never confirmed — and this arm
now says WHY it never confirmed, which is the advance over
merely noting it.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's
inapplicability declaration (same reasoning as the prior
arms): this arm changes no game code, runs no lever, and
its primary metrics are within-trajectory instrument
diagnostics (a gate trace on one diagnostic seed; a
re-scoring of already-confirmed fires on identical evening
pantry series), not panel metrics. The tables above are
reported directly, on identical seeds and identical
trajectories.

## Metric review

(1) THE GATE RULE MAKES FINAL-RUN COUNTING FRAGILE BY
    CONSTRUCTION, AND THIS ARM PROVES IT WITH A TRACE
    RATHER THAN AN ARGUMENT. Final-run counting requires an
    engaged D+5 evening inside a trailing engaged run; the
    gate is a memoryless evening ratio (freshDays > 4, no
    hysteresis, no grace). Any village whose fresh slice
    dips under 4 days during its slide loses the sensor
    mid-slide, and the longer the slide runs, the less
    likely a re-engagement becomes — because the slide
    itself drives freshDays down, and the hunger override
    blocks the one recovery shape (a big unload during a
    hunger stretch) that could re-engage it. A future arm
    that wants a deployable warning must decide, in its
    own prereg, whether the sensor needs a disengaged-state
    rule (e.g. counting a candidate whose window stays
    below level even while disengaged, or a stand-down
    itself as a signal) or a different gate (e.g. total
    pantry, or freshDays with hysteresis) — this arm names
    the mechanism and deliberately proposes no rule change,
    per its DIAG scope.
(2) THE MARGIN RULE IS MEASURED, NOT SETTLED. Its verdict
    impact is nil (no verdict changes) and its cleanup
    value is real (corpus false 1 -> 0, pooled judged
    22.2% -> 11.1%). Both halves matter: a future arm
    should not cite this run as "the margin rule fixes
    false-fire" (it fixes one corpus case and no verdict),
    nor as "the margin rule does nothing" (it removes
    exactly the noise case and keeps the genuine reversal).
    The sustained-pair clause is the untested half and
    should be named as such in any adoption prereg.
(3) FRESHDAYS IS A RATIO, AND THE TRACE SHOWS THE RATIO
    MOVING AGAINST THE STOCK. Day 10 -> day 11 is the
    cleanest proof: total falls 13,210 -> 12,111 while
    freshDays rises 3.97 -> 4.10 and the gate flips off ->
    on. Any future gate proposal that reasons about "the
    pantry" without saying fresh vs total, and stock vs
    burn-rate ratio, will misread this trace. The burn-rate
    denominator's own behavior (why it falls as the village
    eats less) is outside this arm's scope and is not
    claimed here.
(4) EVENING-ONLY ATTRIBUTION, RESTATED. The sensor leg
    reads evenings; the gate decides intraday. This arm's
    claim is about the evening read that decides scoring,
    and the trace records exactly that read plus its
    condition values. An intraday gate history could show
    flicker the evening read hides, but it cannot change
    any scoring outcome in this program, because scoring
    reads evenings. A future arm that wants intraday
    claims needs an intraday recorder, not a re-reading of
    this trace.
(5) No metric, threshold, seed, leg, or margin definition
    was changed mid-run. Prereg committed (f502e856b)
    before any judged analysis; the proof test (23/23)
    ran after the prereg commit and before the judged
    applications, uses no judged seeds, and changes no
    prereg word; the diagnostic re-run reproduces the
    published trajectory row-for-row (0 mismatches); the
    margin analyzer's settled layer reproduces the
    published falsefire tables with zero discrepancies
    before the margin comparison is drawn. The verdict is
    judged only against the prereg header.

## Village assessment (plain words)

One village, watched day by day, and the story is in what
goes quiet. For eleven days its shelves read "full" — four
days of fresh on hand, give or take a hair — while the
store underneath thins from 38,000 to 12,111. The people
sound alive throughout: they wave off shares at a full
pantry door, they fish, they forage, they keep a day's food
and unload the rest. Then on day 12 the fresh slice slips
under four days, and the voice that said "full" simply
stops — not because anyone decided to stop warning, but
because the warning's own switch is wired to the fullness
it watches. From there the village slides in silence:
9,483, 8,295, 5,870, 3,210, 1,400, 595. People start
starving on day 21. On day 25 someone unloads a mountain
of food and the shelves read eleven days of fresh again —
but by then everyone has gone hungry too many days running,
so the switch stays off for the other reason, and by the
next evening the mountain is gone. On day 28 the village
scatters, and the last line beside the starving is about a
pot staying full that nobody touches. The margin question
turns out to be the smaller story: yes, a five-calorie
bounce should not count as a recovery, and fixing that
cleans up the old villages' scorecard — but no scoring
fix rescues a sensor that stops listening on day 12. The
next work is not a better score for the warnings the
sensor gives; it is a sensor that still has something to
say on day 13.

## Findings for the coordinator (to append to the backlog)

- Gate mechanism NAMED (closes falsefire metric review 3
  as a question, opens the design decision): 51608's gate
  is _depositGateOn AND freshDays > 4 AND hungryStreak < 3,
  read fresh each evening with no memory; day 12 stands
  down on plenty (3.39), days 13-28 never re-engage
  (plenty fails throughout; day 25 passes plenty at 10.98
  but fails on hunger-exempt streak 6); the day-11
  candidate fails confirmation solely on D+5 gate/run
  membership. A future arm must pre-register a
  disengaged-state rule or a different gate before any
  deploy claim — a warning instrument wired to plenty goes
  quiet first on the village that starves.
- Margin rule MEASURED (for a future adoption prereg):
  105%-breach-or-sustained-pair recovery flips exactly one
  fire (51316 false -> true), moves pooled judged 22.2% ->
  11.1%, and changes no verdict (falsefire Q1 still NO-GO
  on pilot quietness, Q2 unchanged, dipslide3 GO
  untouched). The sustained-pair clause is proven only by
  pure proof test, not by judged data.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after
  commit f502e856b the main index showed the committed
  prereg as a staged deletion alongside an untracked copy.
  Repaired via git update-index --add --cacheinfo from the
  HEAD blob, then verified git status --short clean and
  worktree hash matches HEAD. The commit itself was
  correct throughout.
- PROOF TEST: 23/23 pure checks, no judged seeds. One
  proof-test label was fixed before the judged runs (a
  synthetic 51602-like series started its breach a day
  early; the analyzer was correct, the test's day label
  was not) — the fix touched only the test file, before
  any judged application.
- DIAGNOSTIC RE-RUN CLEAN, FIRST TRY: seed 51608 verified
  on first try (rows == daysAlive == 28), evening pantry
  and gate series identical to the falsefire corpus
  row-for-row (0 mismatches). No EPERM-flap retry needed.
- SETTLED-LAYER VERIFICATION: the margin analyzer's
  settled layer reproduces the published falsefire corpus
  and pilot tables with zero discrepancies on all 12
  fires (candidate, level, confirmedDay, recoveryDay, fire
  class, censoring) before any margin comparison is drawn.
- check.js --quick NOT re-run: zero src/js, zero green-list
  files on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-gatecover-b-prereg.md
  (commit f502e856b57ed129e709a75cc7ad25d6c726cc68, before
  any judged analysis)
- Tracer: scripts/trace-gatecover-b.js (new recorder:
  evening gate read + freshKcal + freshDays + hungryStreak
  + both condition values, per evening)
- Analyzer: scripts/analyze-gatecover-b.js (imports the
  committed falsefire analyzer's helpers verbatim; adds
  only the margin-recovery scan, the gate-condition
  helpers, and the margin re-scoring summary)
- Proof test: scripts/test-gatecover-b.js (23 pure checks,
  no judged seeds)
- Evidence: evidence/2026-11-01/sim-gatecover-b.md (this file)
- Corpora: evidence/2026-11-01/sim-gatecover-b-corpus/
  sim-gatecover-b-trace-51608.jsonl (diagnostic re-run,
  1 line, seed 51608, armed),
  sim-gatecover-b-dipslide3-margin-summary.json (margin
  re-scoring of seeds 51311-51330),
  sim-gatecover-b-falsefire-pilot-margin-summary.json
  (margin re-scoring of seeds 51601-51608)
- Reused verbatim, never edited: scripts/depositgate-b-driver.js,
  scripts/analyze-dipslide-b.js, scripts/analyze-dipslide2-b.js,
  scripts/analyze-dipslide3-b.js, scripts/analyze-falsefire-b.js,
  scripts/policies/competent.js
- Consumed by this run (diagnostic only, not a judged band):
  seed 51608 re-run for diagnosis (already consumed by
  falsefire; this re-run does not consume a fresh seed)
