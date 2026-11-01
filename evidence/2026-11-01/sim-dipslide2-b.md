# sim-dipslide2-b — PILOT NO-GO: RECOVERY-TO-CANDIDATE-LEVEL SENSOR GOES SILENT

Run: oversight-flesh-out-loop-b, arm sim-dipslide2-b, axis
food-economy. Worktree sim-dipslide2-b, branch sim-dipslide2-b.
Next sensor iteration after the 1430Z fresh-seed confirm NO-GO
(evidence/2026-11-01/sim-dipslide-confirm-b.md): the dip-vs-slide
sensor fired falsely on 4/12 fresh seeds (33.3% vs the 25% cap).
This arm tests exactly ONE of the three designs named in that
closeout — (c) recovery-to-candidate-level — as a NEW prereg, never
a re-score of the 51201–51212 band. DIAG ONLY: zero src/js changes,
zero policy-default flips, zero edits to any existing script or
policy file. New files only, all named *-dipslide2-b.*: prereg,
analyzer, proof test, evidence, corpus. The depositgate driver and
the dipslide analyzer's candidate helpers are REUSED VERBATIM, never
edited. This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges.
Status to coordinator: committed on branch sim-dipslide2-b, pending
coordinator merge.

## Verdict: pilot NO-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-dipslide2-b-prereg.md, commit
f9925b79b79f34a8b52e73f1b906e283178d505f, written BEFORE any judged
sweep (pure proof tests 22/22 ran before the prereg commit; the
live retrospective on already-judged corpora ran after it and is
labeled calibration, not a judged result). The sensor rule tested:
trend condition unchanged (>= 20% fall over 5 evenings AND 3
evenings running AND level rule engaged) + D>=8 exclusion +
final-run counting, with the NEW confirmation rule: candidate D
confirms only if the pantry NEVER climbs back to the candidate
evening's level at any evening in the 5-evening window
(max{P(D+1)..P(D+5)} < P(D)). One intermediate evening at or above
P(D) kills the candidate, even if P(D+5) itself is below P(D).

(p1) PILOT FALSE-FIRE RATE: PASS, trivially. 0 of 8 surviving pilot
    seeds have a confirmed fire in their final engaged run — 0%
    against the 25% cap. But 0% by silence is not a sensor working;
    that is what (p2) exists to catch.
(p2) PILOT SENSITIVITY: FAIL. Zero pilot seeds have a confirmedDay
    in their final engaged run (survived or collapsed — and all 8
    survived, so the distinction is moot). The sensor confirms
    nowhere in the pilot band.
Pilot GO requires (p1) PASS + (p2) PASS. (p2) fails, so the verdict
is pilot NO-GO. Per the prereg's staged method and the pilot gate,
the run STOPS here: NO confirm band is run. Confirm seeds
51311–51322 were RESERVED by the prereg but never run, so they
remain fresh for a future run — they are not consumed by this one.
No re-scoring was done: the 0% rate was not celebrated, and the
old rule's single pilot fire (below) was not substituted in.

## Per-seed fire table (pilot sweep, armed only, 30d competent window)

cand = candidate day under the NEW rule (first confirming candidate;
"old 10→15" means the old endpoint rule would have confirmed),
conf = confirmedDay (new rule), levelSD = level stand-down evening
(null = seed ends engaged), false = survived seed with a confirmed
fire in its final run (new rule). eligInRun = eligible candidate
days (loopDay >= 8) inside the final run. confAny = confirmed day
anywhere in the window under the NEW rule (descriptive only).

| seed | end | days | cand | conf | levelSD | false | eligInRun | rejByRec | confAny | final run | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 51301 | survived | 30 | — | — | — | no | — | — | 13 (old-rule cand 8) | 29–30 | 1 |
| 51302 | survived | 30 | — | — | — | no | — | — | — | 1–30 | 2 |
| 51303 | survived | 30 | — | — | 18 | no | — | — | 16 (old-rule cand 11) | 16–17 | 2 |
| 51304 | survived | 30 | — | — | — | no | 24 | — | — | 1–30 | 2 |
| 51305 | survived | 30 | — | — | — | no | — | — | 22 (old-rule cand 17) | 30–30 | 2 |
| 51306 | survived | 30 | — | — | — | no | 9 | — | — | 1–30 | 2 |
| 51307 | survived | 30 | — | — | — | no | — | — | — | 1–30 | 2 |
| 51308 | survived | 30 | old 10→15 | — | — | no (new) | 10, 23 | [10] | — (new; old 15) | 1–30 | 2 |

Census validity: all 8 seeds valid (rows == daysAlive, gateEngaged
boolean on every row, zero null pantry rows). No seed was excluded.
No seed lacked a final engaged run, so the no-run counting branch
was not exercised on this corpus (it is covered by unit checks in
the proof test).

## The one case that matters: 51308, killed by a +215 kcal uptick

Under the OLD endpoint rule, the pilot band has exactly ONE
final-run fire: 51308, candidate day 10, confirmed day 15. Under
the NEW rule, that candidate is rejected by recovery — so (c) did
exactly its designed job on the only case it faced. But look at the
shape that did the rejecting:

- Candidate day 10: pantry 21,782 (down from 28,300 on day 5, three
  falls running). Window days 11–15: 21,997, 19,100, 18,363, 18,413,
  17,658. The day-11 reading is 215 kcal ABOVE the candidate level
  — a +0.99% one-evening uptick — and then the pantry falls every
  evening after, to 17,658 by day 15 and 12,641 by day 23, before
  recovering to 19,805 by day 30. The village survives.
- So the new rule's silence on 51308 comes from a 1% noise uptick,
  not from any genuine recovery. This is now the THIRD hairline
  bounce in the program's history doing (c)'s work: 51207 (+389),
  51211 (+186), 51308 (+215) — all under 2.3% of the candidate
  level, all one-evening upticks on trajectories that keep falling.
  A rule that lets a single evening's +1% decide between "slide"
  and "dip" is measuring noise, not recovery. That is the next
  design's problem (see metric review), not a reason to re-tune
  this run's numbers.

The other eligible final-run candidates show the band was quiet
beyond 51308, under BOTH rules:

- 51304 day 24 (22,300): window rises monotonically (23,231 →
  26,636) — genuine recovery, correctly no confirm under either
  rule.
- 51306 day 9 (21,700): window opens AT the candidate level
  (21,700 on day 10, the equality case) and ends above it
  (22,522) — no confirm under either rule.
- 51308 day 23 (12,641): window rises immediately (13,450, 13,706,
  ...) — recovery, no confirm under either rule.
- Confirmed-anywhere cases (51301 day 13, 51303 day 16, 51305 day
  22) all sit outside their seeds' final engaged runs (which start
  days 29, 16, and 30 after mid-window disengagements) — the
  final-run counting rule still doing its descriptive work, and a
  reminder that anywhere-counting would tell a different story
  (3 anywhere vs 0 final-run under the new rule).

Band-quietness caveat, stated plainly: the old rule fires only 1/8
in final runs on this band, vs 4/12 on the 51201–51212 band. Part
of the new sensor's silence is the band being quiet, not just (c)
being strict. But that caveat does not change the verdict: a pilot
that cannot show the sensor firing at all cannot license a confirm
spend, whatever the mix of causes. The staged method kills at
pilot precisely so a 12-seed confirm is not spent measuring silence.

## Sense test (SENSE-TESTING LAW: read, don't just count)

On 51308's old-rule confirmation evening (day 15), the voice says
what it always says while the total store falls: "Alex checks the
pantry before heading out — the shelves are full, ~7 days of fresh
on hand… leaves the harvest standing and turns to the water run
instead. The pantry can't take more; the wild will keep." The total
store that evening is 17,658, down from 21,782 on day 10 and headed
for 12,641 — the fresh slice genuinely looks healthy while the whole
store slides, the same level-vs-stock gap every dipslide arm has
diagnosed. The new sensor staying quiet here reads as a village
that never notices the slide — which is honest about the voice
(the player hears nothing alarming either) but is not a village
noticing anything. On day 10, the transcript reads like people, not
a census: paired outings ("Lamia walks out with Ellie. 'Nobody
walks alone today.'"), gossip that distorts across retellings
("It's barely the same story now. That's what fires do."), a first
grave that lands as a crisis ("The village digs its first grave,
and everyone understands at once: this place can kill you."), and
a teaching moment that catches its own repetition ("Hold on — I
already showed you this one. Hickory Nuts. You remember."). One
mildly robotic note, recorded not chased: Ellie's "Not today.
Sorry. (Low trust — reluctant.)" repeats three times on day 10.
The known "pot stays full" prose line did NOT reproduce in this
band (no potLine on any of the 8 seeds) — recorded only, not
re-litigated.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this sweep carries no such fields. NO wall
movement is claimed. In-window: wave reach max 2 (7/8 seeds; wave 1
on 51301 only); waves 3–5 not reached in 30 days (expected — early
window). Median survival 30 days (max 30); collapses 0/8. Arc
II/III/IV, regional → national, table, win flag: not reachable in
this window, not measured, not claimed. Collapse earliness remains
n=1 across the whole program (pilot 51101 only) and bar (d) was
never reached in this arm, since the pilot gate stopped the run.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the prior arms): this arm changes no
game code, runs no lever, and its primary metric is a
within-trajectory instrument comparison (sensor vs level rule on
identical evening pantry series), not a panel metric. The
level-vs-sensor table above is reported directly, on identical
seeds and identical trajectories.

## Metric review

(1) (p2) DID ITS JOB — AND THE 0% MUST NOT BE MISREAD. The
    sensitivity guard exists precisely because (c) makes the sensor
    strictly quieter: without (p2), a never-firing sensor would
    "pass" the false-fire cap at 0% and earn a confirm. The pilot
    NO-GO is the guard working, not a borderline call. Any future
    arm that weakens (p2) or drops it to let a quiet sensor through
    would be gutting the gate that caught this.
(2) (c) AS SPECIFIED IS TOO BRITTLE — THE NEXT DESIGN'S QUESTION.
    All three of (c)'s rejections in program history ride on a
    single evening's ~1% uptick (51207 +389, 51211 +186, 51308
    +215). A recovery test with no tolerance treats noise as
    recovery. The natural next designs — none judged here — are a
    tolerance band (recovery = climbing back ABOVE candidate level
    by more than a noise margin, e.g. 5%, or staying above it for
    2 evenings running) or a sustained-recovery test (max over a
    smoothed window, not a single evening). Either belongs in a new
    prereg on fresh seeds, with its own pilot, and must keep (p2):
    a tolerance that restores firing without restoring false fires
    is the thing to prove, and a silent sensor must keep failing
    at pilot until it does.
(3) THE OLD RULE'S PILOT-BAND FIRE RATE (1/8) vs ITS CONFIRM-BAND
    RATE (4/12) is a warning about band variance: single-band
    sensor rates swing widely, and the 51201–51212 retrospective
    (2/12 under the new rule) looked passable only because that
    band happened to contain two bounce shapes. Retrospective
    calibration on one band is weak evidence — which is why the
    prereg disclosed it as calibration and why the fresh pilot,
    not the retrospective, judges the design.
(4) EARLINESS IS STILL n=1, AND THE PROGRAM HAS A COLLAPSE SUPPLY
    PROBLEM: 0 collapses in this pilot band (combined pilot +
    confirm history: 1 collapse in 20+8 seeds at 30d competent).
    Any future sensor arm that wants bar (d) judged needs a
    collapse-bearing design (longer window, harder policy, or a
    band seeded to collapse) — each with its own selection-bias
    caveat, to be pre-registered, not improvised.
(5) FINAL-RUN COUNTING IS STILL LOAD-BEARING: anywhere-counting
    under the new rule gives 3 (51301, 51303, 51305) vs 0 in final
    runs; under the old rule it gives 4 (adding 51308) vs 1. A
    future arm that changes the counting rule changes the verdict
    class entirely and must say so in its prereg.
(6) No metric, threshold, seed, or leg definition was changed
    mid-run. Prereg committed (f9925b79b) before the judged sweep;
    the sweep ran only after the prereg commit; the verdict is
    judged only against its header. The pilot's interrupted first
    sweep (below) did not change any seed, threshold, or rule: the
    5 completed seeds were verified line-by-line and kept, and only
    the 3 unrun seeds were run afterwards.

## Village assessment (plain words)

Eight fresh villages, and every single one survives the month —
again, the story is how quiet the month is. The new sensor, built
to stop crying wolf on villages that bounce and recover, ends up
saying nothing at all: on the one village where the old sensor
would have spoken (51308, sliding from 21,782 down toward 12,641),
the new sensor hears a single evening's 215-calorie uptick — less
than one percent — and decides the village has recovered. It has
not; it keeps falling for two more weeks and then climbs back on
its own. The sensor is not wrong that the village survives — it is
wrong about why it stays quiet, and a sensor whose silence rests on
a rounding-sized bounce cannot be trusted to speak when it matters.
The villages themselves sound alive in the transcript — people
walking out in pairs, stories warping as they are retold, a first
grave that stops everyone cold — but no village in this band gives
the sensor a clean slide to catch, and the one slide it gets, it
misses on a technicality of its own making. What is missing is not
a stricter sensor but a more forgiving one: a recovery test that
knows the difference between a village climbing back and a pantry
wiggling by a percent overnight.

## Findings for backlog (for the coordinator to append)

None from this arm beyond this verdict itself. The noise-tolerance
question for the recovery test (metric review 2) and the collapse
supply problem (metric review 4) are this arm's metric review, not
new backlog items; the "pot stays full" line was already filed by
the depositgate arm and did NOT reproduce here.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after commit
  f9925b79b the main index showed the three prereg files as staged
  deletions alongside untracked copies. Repaired via
  git update-index --add --cacheinfo from the HEAD blobs, then
  verified git status --short clean and worktree hashes match HEAD.
  The commit itself was correct throughout.
- PILOT SWEEP INTERRUPTED, RECOVERED WITHOUT RE-RUNS: the first
  pilot-sweep exec was aborted by the runtime after 5 seeds
  (51301–51305) had completed and been appended to the pilot
  .jsonl. Recovery: verified the 5 lines (seed matches, rows ==
  daysAlive == 30 each), then ran only the 3 unrun seeds
  (51306–51308), each first try, and appended them. No seed was
  re-run, no line was duplicated, final file is 8 verified lines.
- FRESHNESS VERIFICATION NUANCE: a background grep over
  evidence/2026-11-01/ returned bare 513xx numerals (51302, 51311,
  51313, 51318, 51319, 51325) — these are non-seed values (pantry /
  ledger kcal figures and, by the time that grep finished, this
  arm's own prereg mentions) in unrelated files. The authoritative
  check is seed assignments: no `"seed":513xx` field existed in
  any .jsonl or .json corpus before this run, and no dated-.md
  band mention of 51301–51322 existed before this arm's prereg.
  The 513xx bands were fresh when the prereg was written; the
  pilot file itself is now the first 513xx seed assignment on the
  lane. Confirm seeds 51311–51322 remain unrun and fresh.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-dipslide2-b-prereg.md
  (commit f9925b79b79f34a8b52e73f1b906e283178d505f, before any
  judged sweep)
- Analyzer: scripts/analyze-dipslide2-b.js (imports the committed
  scripts/analyze-dipslide-b.js candidate helpers verbatim; adds
  only the new confirmation rule plus the pilot/confirm bars)
- Proof test: scripts/test-dipslide2-b.js (22 pure checks;
  --live: 8 retrospective checks on already-judged corpora —
  calibration only, NOT a judged result — 30/30 total)
- Evidence: evidence/2026-11-01/sim-dipslide2-b.md (this file)
- Corpus: evidence/2026-11-01/sim-dipslide2-b-pilot-armed.jsonl
  (8 lines, seeds 51301–51308, armed only),
  evidence/2026-11-01/sim-dipslide2-b-corpus/
  sim-dipslide2-b-pilot-summary.json (full per-seed new-rule
  analysis, pantry series, and sense lines for the 8-seed pilot)
- Reused verbatim, never edited: scripts/depositgate-b-driver.js,
  scripts/analyze-dipslide-b.js, scripts/policies/competent.js
- NOT run, still fresh: confirm seeds 51311–51322 (reserved by the
  prereg; the pilot NO-GO means they were never consumed)
