# sim-9954trace-b — wider per-stack trace on seed 9954 ONLY, across the day-100 snapshot boundary

Run: oversight-flesh-out-loop-b, arm sim-9954trace-b. DIAG/measurement
ONLY: ZERO src/js changes, no default flips, no game-code lever. This
arm does NOT re-judge the raidcallers GO, the genericremainder
PARTIAL verdict, or the 9970 closure — their verdicts stand in their
own evidence. Its verdict is ONLY whether the single pilot row below
is traced, narrowed, or left standing, judged ONLY against
evidence/2026-10-27/sim-9954trace-b-prereg.md (committed as
d14dff51c BEFORE any trace run in this arm).

## Verdict against the pre-registered GO: PARTIAL (not GO)

GO required a named door/timing accounting for the FULL +3,700
boundary residual with exact stack identity. No door does. What
this arm delivers is the prereg's PARTIAL clause (b): the fidelity
gate and reproduction both PASS, and a previously live candidate —
day-100 snapshot timing — is excluded ENTIRELY with numbers,
raising the unexplained floor from 300 kcal to 3,700 kcal
(analyzer definition) / 3,800 kcal (correct alignment). The row is
narrowed from "at least 300 unexplained, timing possibly covering
the rest" to "exactly 3,700 pre-existing at day-100 start, timing
covering none of it." A narrowed bound, however tight, is not a
closure, and it is reported as such — never rounded up to GO.

## Row (verbatim from sim-genericremainder-b.md)

- Pilot seed 9954, generic (Foraged food) family-seed row,
  caller-complete boundary residual +3,700 kcal (1.16% of inflow),
  FAIL. Survived to day 100, national rank, wave 4. Fresh +5,719
  NEW / +3,700 boundary; dried 0.

## Step 0 — fidelity gate: PASS (faithful replay reproduces the corpus)

Seed 9954 re-run ONLY (no new seeds spent) as a FAITHFUL sweep
replication: scripts/sweep-9954trace-b.js, vendored from
scripts/sweep-raidcallers-b.js with NO capture changes except ONE
added read-only stack recorder (spoilvol snapshotAll() pantry
stacks at every daily snapshot moment, at day-100 start, and
post-run). Same policy (belongseek-nofeast), same env gates, same
death suppression (the sweep's registerDeath wrapper copied
verbatim, still not delegating to oDie — changing it would change
every trajectory and is a coordinator/Steve call, not this arm's).
Replay output: evidence/2026-10-27/sim-9954trace-b-replay/
(one file, 9954 only).

Comparison (proof asserts each field): EVERY shared field matches
the committed corpus
(sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json)
except `ms` (excluded by design) and the new stack fields —
headline (daysAlive 100, survived, national, wave 4, deaths 7,
deathCauses, deathList), all counters, and every list
(spoilDays 100, smokeSayLines 44, driedEvents 121, mealDrawRecords
1125, inflows 196, stockdoorRecords 705, directRecords 262,
raidRecords 16, raidSayLines 118, spoilEvents sweeps 100,
openingStock) deep-equal. The single apparent exception proves
the rule: raidRecords.stackTop strings differ ONLY because the
capture truncates stackTop to 300 chars
(stockdoors-capture-raidcallers.js .slice(0, 300)) and the two
worktree names differ in length (sim-raidcallers-b 17 chars vs
sim-9954trace-b 15 chars), shifting the truncation window — after
name normalization the strings agree on their full common length
on all 16 records, and all non-stackTop raid fields deep-equal.
The added stack recorder consumed no RNG and shifted nothing:
the fidelity gate is what proves it, not the claim.

Base note: current worktree HEAD descends from the raidcallers
base 6ae5049d8 with only a one-line build.js stamp differing in
src/js (verified before the prereg) — trajectory-neutral, and the
fidelity gate confirms it empirically.

## Step 1 — reproduction: PASS (independent recomputation)

From the replay payload (proof re-derives, not via the analyzer):
NEW residual +5,719 (fresh +5,719, dried exactly 0); predicted
fresh closing 6,771; bridge stock100 +3,400 − meal100 −5,419 −
cc100 0 = −2,019; analyzer boundary residual +3,700
(boundary closing 10,471 − predicted 6,771). All figures match
genericremainder exactly.

## Step 2 — per-stack boundary accounting (the settling step)

### Window P (day-100 start → snapshot moment): net 0, exactly

The day-100 start snapshot (before policy.daily on day 100) and
the day-100 snapshot-moment snapshot (after policy.daily, the
corpus closing snapshot) are IDENTICAL: all 38 stack keys, all
channels, same units and kcal. Day-100 policy daily added
nothing to the pantry and removed nothing. There are NO
pre-snapshot day-100 flows for any family — the snapshot moment
IS the start of day 100 for pantry purposes.

### Window Q (snapshot moment → post-run): observed = recorded, per key

Post-run fresh generic: 12,490 → 10,571, net −1,919. Per-key
diffs match the recorded day-100 flows EXACTLY:
- draws −5,419: (99, 200) −3u/−600; (100, 200) −16u/−3,200;
  (100, 219) −1u/−219; (101, 200) −7u/−1,400;
- stockdoor +3,400: (103, 200) +17u/+3,400;
- inflow +100: (106, 100) +1u/+100.
No other fresh key moved. Two non-generic keys also moved
post-snapshot: Purslane (100, 30, ready) −30 (drawn after the
snapshot — Purslane's +30 NEW residual IS post-snapshot timing,
unlike generic's) and Winner's share (113, 300) +600 (the
day-101 pantryAdd inflow, a different family, post-horizon —
consistent with genericremainder's Winner's −600).
Conclusion: ALL day-100 recorded flows are post-snapshot, and
there are NO unrecorded post-snapshot generic flows. The
boundary model's post-snapshot set (stockdoor + meals) is
confirmed per key — and extended: the +100 inflow is ALSO
post-snapshot (see below).

### The floor, closed upward: 300 → 3,700 (analyzer) / 3,800 (correct alignment)

Because window P is 0 and window Q is fully recorded, NO
snapshot-timing story can touch the +3,700: the residual was
already in the books at day-100 start. Under correct alignment
(snapshot minus flows recorded day < 100, valid by append-order
— every day-<100 record precedes every day-100 snapshot record
in the run), the residual at the snapshot moment is:
12,490 − 8,690 = +3,800. The analyzer reports +3,700 because it
misattributes the +100 day-100 inflow as pre-snapshot (it counts
it in the ≤100 prediction but does not adjust the closing for
it). The +100 is therefore a boundary-DEFINITION gap, not a
closure: it makes the settled residual BIGGER (+3,800), not
smaller. Reported under "metric review" for the next run's
prereg; no verdict in this arm depends on it, and the judged row
remains +3,700 under the analyzer's definition.
Either way the old "≥300 under any timing model" bound is dead:
the minimum unexplained amount is now 3,700 (analyzer) /
3,800 (correct alignment), with timing explaining exactly 0 of
it beyond the already-adjusted 2,019.

### Wider door census (all stacks, all doors, both directions)

Every door re-verified on the replay (= corpus, fidelity-proved);
prior-arm exclusions re-verified, not assumed:
- Inflow doors (all families): stock 166, deposit 20, pantryAdd
  10. Generic: stock only (121). Excluded records: stock ≤ 0:
  0; pantryAdd-unadded: 0. (Deposit/pantryAdd are other
  families' doors, not generic's.)
- Stockdoor: give−kcal gap 49 (not 5,719); zero-kcal records 124,
  give sum 8,564 (documented no-stores, not hidden inflow).
- Meal draws: kinds pantryDraw 206 + mealCall 919 (mealCall
  records carry NO items — a summary, not a door, so counting
  only pantryDraw/drawSpoiled double-counts nothing).
  Contexts: player 175, villager-home 692, villager-away 232,
  other 26. Feast re-check: 'other' max want 1,496 < 1,500 feast
  floor — feast-preview copy-draws did NOT fire (same as prior
  arm, re-verified).
- Direct draws: paths player-take 257, npc-adult-pantry 4,
  green_whisper.cultivate 1. Alien-raid direct paths: 0.
- _removePantryKcal takes: callers payTribute 10,
  villageAgencyDaily (raid-unanswered) 3, answerAccord 1,
  answerAidBeg 1, answerNationalChoice 1 — 16 records, 0 unknown.
- Transforms: paths cook-racks 111, cook-racks-split 10; kinds
  in-place 111, split 10; unlinked events 0 (all families).
- Sweeps: 100 sweeps, days 2–101; day-100 sweep removes nothing
  from pantry; day-101 sweep removes nothing from pantry;
  violations (removed-not-spoiled + kept-spoiled) 0.
- All-family NEW residuals (reproduce genericremainder exactly):
  Foraged food +5,719; Fish catch +20; Purslane +30; Winner's
  share −600; Blackberry, Garden harvest, Muscadine Grapes,
  System-replicated stew all 0. The residual is family-specific
  (generic only, at scale), not a systematic failure.
- Death-day flows: 9954 survived to day 100 — no death-day
  adjustment applies (stated, not assumed).
- Tributes/dues/aid (named group): all 13 non-raid
  _removePantryKcal records above; all recorded, all counted.

### Why per-day residual series oscillate (instrument finding, not a leak)

A per-day residual series R(d) = snapshot(d) − flows(day<d)
oscillates wildly (0, 179, 0, 119, −3,000, 3,800, 598, …) and
returns to exactly 3,800 on many days — because the snapshot
series is PER-ITERATION, not per-day: wrappedPolicy.daily runs
once per runDays iteration, and scholar.day does not advance
every iteration (day 36 has TWO stackDays entries; several days
have none). Flows recorded day d SPLIT across same-day
snapshots. Worked example, day 36: stackDays[34] fresh 6,297 →
stackDays[35] fresh 3,730 (Δ −2,567) = 6 cook-racks transforms
firing between the two same-day snapshots (pre 186+200+500+13+
468+1,200 = 2,567); the remaining day-36 transforms (227+127)
fired after the second snapshot. Same recorded day, different
snapshot side. Any future arm that localizes the +3,800 by day
MUST walk iterations (stackDays entries in order), not days —
per-day attribution will manufacture phantom leaks. This is the
same day-lag class the prior arms warned about, now shown at
stack level with a worked example.

## Sense transcript (SENSE-TESTING LAW — reported, not judged)

Replay raidSayLines, days 99–100 (the sweep's treeline recorder):
- Day 99: "lingering The Big Thing gorges at the treeline — 600
  kcal gone", "lingering The Influencer gorges — 1,603 kcal",
  "lingering Big-Eyes gorges — 1,471 kcal".
- Day 100: "lingering The Big Thing gorges — 1,030 kcal",
  "lingering The Influencer gorges — 800 kcal", "lingering
  Big-Eyes gorges — 1,400 kcal".
The game names the mechanism behind the 'other'-context draws:
named lingering monsters eating at the treeline at night, with
amounts in the same range as the recorded day-100 'other' draws
(600/400/800/1,400). Coherent with the ledger; the repetition
(nightly gorge lines) is the mechanism's honest shape, not a
dialogue loop. Post-horizon, day-101 lines ("A kite over the
treeline. Nobody is holding the string.") show the game still
narrating past the snapshot — consistent with the post-run
snapshot containing the day-101 Winner's inflow: the run's
clock runs past the corpus closing snapshot, and only the
Winner's family uses that extra time. No transcript surfaces
tribute/demand narration (the say recorders cover smoke-rack
and treeline lines only — a recorder-scope gap, recorded
explicitly, not papered over).

## Proof (scripts/test-9954trace-b.js)

70/71 checks PASS; the single FAIL is the prereg GO check itself
(accounted 0 vs bar 3,700 ± 1) — that failure IS the honest
result for a PARTIAL verdict, and the script exits 1 for it.
All fidelity (with the stackTop truncation-window explanation),
reproduction, exclusion, and window checks pass. Proof command
(from the worktree root): `node scripts/test-9954trace-b.js`
(exit 1, verdict PARTIAL printed). Trace command:
`node scripts/trace-9954trace-b.js` (exit 0, prints the full
analysis). No jest (proofs are node, not jest). No
[needs-eyes]: this lands a measurement, not a player-visible
change. No game-code change: zero src/js files touched; files
in this arm: prereg, evidence, replay corpus (1 file),
sweep-9954trace-b.js, trace-9954trace-b.js, test-9954trace-b.js.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered GO/PARTIAL/NO-GO did its job: it prevented
  the narrowed bound (floor 3,700/3,800) from being rounded up
  to a closure, and it forced the timing exclusion to be proved
  per key (P identical, Q recorded exactly) rather than argued
  from bounds. The ±1 kcal closure bar was not relaxed.
- Boundary-definition note, new in this arm, for the NEXT run's
  prereg (not this run's verdict): the analyzer's boundary
  definition misattributes the day-100 inflow as pre-snapshot.
  Empirically the +100 inflow is post-snapshot (absent at snap,
  present post-run), so the analyzer's boundary residual (+3,700)
  understates the settled residual (+3,800) by exactly that
  inflow. A future prereg should either adjust the boundary
  closing for day-100 inflows as well as stockdoor/meals, or
  define the judged row as the correct-alignment residual
  (snapshot minus flows day < horizon). This changes no verdict
  here: under either definition the row is unexplained at
  ≥3,700.
- Instrument lesson, new in this arm: the snapshot series is
  per-iteration, not per-day (duplicate and missing scholar-days
  in spoilDays/stackDays). Any future trace that attributes flows
  to snapshots by DAY will manufacture phantom divergences; the
  attribution key must be iteration order (stackDays index), with
  same-day splits handled explicitly (see the day-36 example).
- Instrument lesson 2: stackTop's 300-char truncation interacts
  with worktree-name length — a fidelity comparison that
  compares stackTop strings literally across worktrees will
  always fail spuriously. Compare normalized strings on their
  common length (or strip stackTop and compare the rest).
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. The fidelity gate (replay vs corpus) is
  the instrument before/after. Not forced, not faked.

## Reachability + wall numbers (reused corpus, no new band)

No new band was run (seed 9954 replay only): wall numbers are
the raidcallers numbers, not re-judged — pilot
national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20.
Seed 9954 itself: wave 4, national rank, survived 100 days.

## Village assessment (plain words)

One village, 100 days, still standing at national rank — and
its books now have a precise shape to the mystery. The pantry
economy is big and busy (318,089 kcal of foraged food moved
through it, 96,134 kcal smoked onto the racks, weekly tributes
walking out toward Emberhold, lingering monsters gorging at
the treeline at night — and the game says so, with names and
amounts). Every door in that economy is now watched down to
the individual stack: tributes, demands, accords, aid, raids,
cooking, smoking, sweeping, stocking — all recorded, all
counted, all reconciled. What the wider trace proved is where
the mystery ISN'T: it isn't the last day. The snapshot that
closes the books was taken at the very start of day 100, before
anything happened that day, and everything after it is
accounted for to the unit. The 3,700 kcal (3,800 by the stricter
count) was already sitting in the books when day 100 dawned —
it arrived somewhere in the first 99 days, through a door the
instruments don't yet see, or a door they see but mislabel.
What knowledge/capabilities were missing: one fresh-channel
inflow (or overcounted outflow) of ≥3,700 kcal, mechanism
unknown, localized to pre-day-100. Blanks filled: (1) the
day-100 timing story is closed — per key, not by bounds;
(2) the unexplained floor is raised from 300 to 3,700/3,800;
(3) the boundary definition's +100 inflow misattribution is
documented; (4) the per-iteration (not per-day) snapshot
structure is documented with a worked example, so the next
trace doesn't chase phantom day leaks. Documented, not fixed:
no game-code change was made (DIAG only).

## Next arm (fix, wider trace, or close)

- 9954 row: NOT closed. Next arm, in order: (1) an
  ITERATION-level per-stack walk (stackDays entries in order,
  same-day splits handled explicitly) to localize the +3,800 to
  an iteration window — the day-36 example shows the method
  works, and the walk may name the door directly (an unmatched
  stack appearing at a specific iteration, with its key listed);
  (2) if the walk still leaves a nonzero point value, a
  fresh-channel inflow instrument wrapping every remaining
  pantry writer on a same-seed faithful replay (candidates:
  any pantry push outside stockPantry/depositPantryPieces/
  pantryAdd/stockSurplus — the 9954 corpus shows none for this
  family, so the replay must prove the writer exists before it
  is named); (3) only then a named mechanism with closing
  arithmetic. Do NOT re-attribute the row to day-100 timing,
  feast previews, alien raids, stockdoor carry, or cooking
  bonus — all are excluded above with numbers, and re-opening
  them without new evidence would be re-scoring, not tracing.

## Convergence line

partial — the 9954 generic-remainder blank is narrowed, not
closed: the day-100 timing candidate is excluded per stack key
(P identical, Q recorded exactly), the unexplained floor rises
from 300 to 3,700 (analyzer) / 3,800 (correct alignment), and
the boundary definition's +100 inflow misattribution plus the
per-iteration snapshot structure are documented for the next
arm. The next arm is an iteration-level per-stack walk on 9954
only (plus, if needed, a writer-wrap replay) — not a re-trace
of 9970 and not a re-judgment of any standing verdict.

## Verdict (judged against the pre-registered bar, not re-scored): PARTIAL

No door closes the full +3,700 (accounted 0 vs bar 3,700 ± 1);
the day-100 timing candidate is excluded with per-key numbers;
the floor is raised to 3,700/3,800. A narrowed bound is not a
closure.
