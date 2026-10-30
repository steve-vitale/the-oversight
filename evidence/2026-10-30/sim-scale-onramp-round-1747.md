# sim-scale-onramp-round-1747 — muster mechanism answered, recorder gap fixed, sweeteners exonerated

Run: flesh-out loop, run fleshout-20261030T1747Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Sibling loop B live on
food-economy throughout (its 1730Z claim: sim-sickstale-b,
sim-wakeforage-b) — NOT touched: no loop-B trees, claims, or axis.
Gaps-completion and the playtest loops active throughout — not touched.
Master moved under this run three times (gaps parity 6feb00cfe →
loop-B wakeforage a778b53e2 → loop-B sickstale b0dffbdcd); all three
landed branches rebased clean onto the moving tip after their workers
finished, proofs re-run green by the coordinator, merged --ff-only.

## Pre-flight and guard

No fleshout-loop.lock at run start (no live loop-A run to defer to);
lock created for this run (fleshout-20261030T1747Z, 17:51Z) and claim
written BEFORE any sims
(`hidden_files/lever-claims/fleshout-20261030T1747Z.json`: axis
scale-onramp, arms sim-muster-a, sim-recorderfix-a, sim-sweeten-a).
Pre-flight: main tree clean (0 lines); disk 22% (pass); reap 9/16
active, other loops' dirty trees refused (correct). Worktree
registration was slow: the register script's internal reap contended
with a sibling gaps-completion worktree removal (D-state git process)
for several minutes; it cleared on its own, no force used, all three
trees registered with heartbeats verified by read-back (18:06Z,
refreshed 18:23Z). Rotation file NOT advanced (stays 3): this is an
axis-directed run under the convergence protocol, not a rotation cycle.

## Arms

### sim-muster-a — DIAG-NO-GO on the letter; MECHANISM ANSWERED in full

Backlog #1546: why a muster never forms on Herald faces. The NO-GO is
a registration artifact, not a mechanism gap: the pilot-band matching
leg (reproduce the historical refusalsay corpus) failed because the
base moved under the corpus — an untouched refusalsay sweep on this
branch reproduces the muster run exactly (75102: days 61, wave 2, 16
meetings, 0 dissolved) vs the old corpus (days 86, wave 4, 62 meetings,
32 dissolved). Per §14 the leg was not re-scored. Coordinator
adjudication: if leg (b) is read as "100% of refused rows encountered
across this run's ≥8 seeds" rather than "100% of the historical pilot
corpus," (b) passes on 4/4 and the verdict flips to DIAG-GO with no
other change — the evidence supports both readings transparently, and
the NO-GO label stays in the arm evidence.

Mechanism, in plain words: a muster is not something villages do on
their own. It is an object that only comes into existence when somebody
presses "Sound the call" or "Commit Haven's blades." Nobody presses
them in sims — no policy does, and no game system does on its own
(runtime counters over 20 seeds: soundTitanCall 0, titanCommitOwn 0,
titanSelfDo 0, titanWarCouncil 0). So the muster object never exists,
and the gate's count, which reads that object's blade list
(`titanWrapCombat` in src/js/titans.js: have =
(titanState().musters[titanId] || { allies: [] }).allies.length), is
zero by construction, not by bad luck.

Layer two: on the one real refused state measured (75123 day 84, 4
faces of one state, 4/4 complete component snapshots), even pressing
the button would not have been enough. The village had three allied
villages but only one with free fighters; a sounded call yields exactly
2 blades (both Stonebridge) vs need 10. Haven's own blades could not be
committed at all: committing requires omen stage ≥ 2
(`titanCommitOwn`, two-tap, up to 3 blades), and on this face there was
no omen at all — the Herald arrived through a feast draw, not through
omens, so the game never offered the call or commit buttons
(`titanSelfActions` offers nothing until omen stage ≥ 2). Ceiling on
that state: 2 blades, 5 even with commit unblocked — still short of 10.

Layer three: the feast draw that dealt the Herald stays pending after a
refusal, because the gate turns the scholar away before the part of
fight code that clears a pending encounter runs — so the scholar faces
the same pending Herald three more times the same day. Channel:
`castMonster` (game.js) pools data/monsters with wave ≤ unlockedWave
and NO titan exclusion (unlike `monsterWavePool`, which filters titans
out); the Herald sits in monsters.json (wave 4), so feast draws
(feastBuff.js `drawFeastScavenger`, faced via competent's
`feastFightRoad` → `faceFeastDraw`) can deal it. No code outside
titans.js reads state.titans.outcomes — no routing from a refused face
toward call/commit exists anywhere.

Perception law honored: no roster-fed muster proposed. The candidate
next lever's trigger (sound the call after a direct refused-face
encounter) is perception-grounded — the scholar saw the titan — but it
is a candidate for the next arm, not a build here, and it would still
fail 2/10 on the measured state without coalition-building toward
trust ≥ 70 / more links. Caveats (arm evidence): the exact repeat-call
driver for faces 2–4 on day 84 is not named (log proves the calls and
the pending survival; naming the driver without a trace would be
guessing); a bare-policy replay does NOT reproduce the day-84 faces
(one of the sweep's layers moves the trajectory — open for a future
arm); the 4 snapshots are one state faced 4×, not four independent
states.

Bands (current base, 180d death-aware, tableseat-nowait, MUSTER=1
instrument): pilot 75101–75108: 0 refusals (old corpus: 120). Confirm
75117–75128: 4 refusals, all seed 75123 day 84. Wall numbers — pilot:
won 4, nationalEver 6, nationalFinal 5, tableReached 4, tableEntered 4,
wave 8/8/7/3/0, median 112d, deaths 226. Confirm: won 5, nationalEver
10, nationalFinal 9, tableReached 6, tableEntered 5, wave
12/12/12/9/0, median 119d, deaths 404. Sense: 75104 contrast — Herald
present 41 census days at 700 HP, omen stage 2 from day 72, run ends
day 112, zero faces, zero calls, zero muster (world-placed Heralds need
tile contact; feast-drawn Heralds force it).

Commits (rebased onto master at closeout): 8af889060 prereg,
1bec3ced8 instrument (fixtures 11/11 green), ada564d0b evidence +
20-seed corpus (60 files) + sweep replay.

### sim-recorderfix-a — NO-GO on the prereg as written; FIX ADJUDICATED MERGEABLE

Backlog recorder loss-day gap: the tributecost recorder now takes an
end-of-run pantry/population snapshot (`endSnapshot: { scholarDay,
pantryKcal, pop }`, immediately after `runDays` returns, alongside the
existing end-of-run link snapshot) in scripts/sweep-tributecost-a.js
(+21/−2, strictly additive; existing series untouched). Proof
scripts/test-recorderfix-a.js 13/13 green; tributecost regression
18/18 green.

Verdict honestly NO-GO on two prereg clauses, adjudicated mergeable
(the round-1639 precedent: a NO-GO verdict is not a merge ban; the
evidence, instrument, and corpora land with the verdict intact):
- Leg (b) byte-identical-except-snapshot FAILS 0/3 — re-running
  loss-day seeds 9911/9913/9918 on current master gives
  180/village-lost (was 166), 76 (was 129), 119 (was 159); all 8 pilot
  seeds differ from the old corpus on 38–53 keys each. Cause is
  substrate drift since that corpus (leanlink policy and game code
  moved), NOT the fix: a control re-run of 9913 on the current
  substrate with the pre-fix recorder is deep-equal to the fixed row
  ignoring `endSnapshot`. The fix does not perturb outcomes.
- Leg (c) bar-2-under-new-wording FAILS as written — the clause
  `endSnapshot.scholarDay == result.days` holds only 4/8 (survived runs
  read scholar day 181 after a 180d horizon; 9918 reads 118 vs
  loop-count 119): `result.days` and the engine scholar-day counter
  are two different counters. Relabeling would fabricate a day, so the
  worker did not. The mechanism passes 8/8: series length days or
  (village-lost and days−1), tele == log, aggregate == log,
  `endSnapshot` present 8/8, and on all 4 current-substrate gap seeds
  the snapshot captures final state beyond the last series entry
  (9911 pantry 9451→5662, pop 4→0).
The analyzer was deliberately not updated — a separate instrument
change with its own prereg. No game code, no policy file, no other
instrument touched. No [needs-eyes]: instrument-only.

Pilot band (leanlink 9911–9918, 180d death-aware, current substrate,
NOT a before/after vs the old corpus): national 5/8, table 4/8, wins
0/8, village-lost 5/8, global 5/8; median survival 180d, max 180d; wave
8/8/8/6/0; 285 deaths, monster-combat share 73.3%; Haven-paid tribute
0 kcal on all 8.

Commit (rebased): 30e80e915.

### sim-sweeten-a — DIAG-GO

Backlog leanlink-never-sweetens, answered seed by seed from the
tributecost leanlink corpus (9911–9918, reused, no new sims): 30
proposals → 28 formed a link directly (judgeLink score ≥ 55), 0
declined, only 2 counters staged, 2 answered, 0 sweeten, 2 accept.
- T-NEVER (trigger never reached): 9912–9918 — each proposed exactly 3
  times (the cap-3 limit), all formed outright, then proposing stopped
  entirely. 9916 sat above 25,000 kcal on 129/180 days and still never
  sweetened — pantry size is irrelevant when no counter exists.
- C-FAILS (pantry condition failed): 9911 only — links broke,
  proposing resumed (9 proposals), 2 counters staged days 143/144 and
  answered days 144/145 at pantry 12,713 / 12,873 kcal (accepted,
  forming flipped 5,000-kcal/week links). Trap for future analysis:
  9911 was over 25,000 kcal on 127/165 days, but the answers landed in
  a collapse trough (pantry 30,040 day 132 → 20 day 140); a brief
  recovery to ~27,000 on days 150–154 came with no counter pending.
  "Pantry ever over 25,000" gets this seed exactly wrong — only pantry
  at answer matters.
Recorder trust check: the analyzer's definition (answerCounter with
pantryDelta < 0) cannot hide a policy sweeten — the policy only calls
'sweeten' above 25,000 kcal, where whole-unit removal takes ≥ 1,500
kcal; the corpus holds exactly 2 answerCounter calls, both 'accept',
both delta 0; staged = answered on every seed. Mechanism (code only;
no canon doc covers it): middle-band proposals (score 35–54) draw a
counter ("we'll take Haven at 5,000 kcal/week"); Haven may accept,
sweeten (1,500 kcal for a re-judgment at its own terms — food kept
either way, success needs re-judged score + 12 ≥ 45), or walk away
(leanlink.js `leanCourtship`; hierarchy.js `proposeLink` →
`_stageCounter` → `answerCounter`). Direct accepts dominate because
judgeLink starts at base 38 plus standing/opinion/alliance bonuses and
clears 55 most of the time by day 25. Branch proven LIVE by execution,
not grep: fixture scripts/test-sweeten-a-branch.js 11/11 green — a
staged counter answered 'sweeten' with a 30,000-kcal pantry loses
exactly 1,500 kcal and clears the counter; a 1,000-kcal pantry returns
'counter' and leaves it standing. Competent control: 0
staged/answered/sweeten on all 8 seeds. Verdict: sweeteners are KILLED
as a leanlink cost hypothesis on this evidence, NOT killed as a
mechanic. The test that would matter is a courtship variant that
actually reaches the counter band (colder villages, or proposing past
the cap), on the same seeds, counting sweeten calls/successes/outcomes;
if no variant counters regularly, whether the 35–54 band is tuned too
narrow to matter is a Steve-call. No [needs-eyes]: DIAG-only.

Commit (rebased): 9c046429a (5 files, 490 insertions: prereg,
evidence, 3 test scripts).

## Reachability verdict (this run)

Waves 1–5: 1–4 reached across all bands; wave 5 reached 0 everywhere
(muster pilot 3/8 wave-4, confirm 9/12; recorderfix leanlink 6/8).
Regional → national: reached (muster confirm nationalEver 10/12;
recorderfix leanlink 5/8). Table: reached (muster confirm 6/12) but
entered-and-won only as lesser seats; full seat 0 everywhere. Win
flag: lesser-seat wins only (muster pilot 4, confirm 5; recorderfix
0/8). Nothing in this run moves the wall numbers past the standing
picture — but the wall's sharpest mechanism is now answered rather
than merely confirmed: the full seat's door needs 10 allied blades
from a muster nobody ever creates, and on the one measured state the
ceiling was 2.

## Village assessment (plain words)

Villages climb, reach national, and sit at tables — then stop at a
door nobody opens. The muster isn't a broken system; it's an unpressed
button, and on feast-drawn Heralds an unoffered one (no omen, so no
buttons at all). Leanlink villages court, link, and climb without ever
paying a sweetener — the climb's price is margin, not courtship
sweeteners and not tribute (both now exonerated as cost channels).
The instrument shelf is one step stronger: village-lost runs now leave
a final pantry/population snapshot instead of a one-day hole.

## Blanks filled or documented

- FILLED (landed): muster mechanism (#1546) — unpressed-button + no
  omen + pending-survival layers, with code sites, counters, and a
  counterfactual ceiling; recorder loss-day gap — endSnapshot landed,
  proven non-perturbative; sweetener trigger (#1546's sibling item) —
  trigger-never vs condition-fails split, branch proven live.
- DOCUMENTED (not chased): castMonster titan-exclusion candidate arm
  (next arm, own prereg + proof test); refused-face routing steve-call
  #1538 strengthened (re-faces 3× same day; feast-drawn Heralds carry
  no omen); recorderfix re-baseline owed (pre-fix vs fixed pair for
  the other 7 pilot seeds + bar-2 scholarDay rewording; analyzer
  update separate); muster repeat-call driver unnamed; sweep-layer
  trajectory mover for the day-84 faces unnamed; courtship variant
  reaching the counter band (sweetener live test).
- Backlog touched: #1546 answered, sweeten fixed, recorder gap fixed,
  #1538 strengthened, 2 new open items (castMonster exclusion +
  recorderfix re-baseline).

## Metric review (for the NEXT run, not these verdicts)

- Muster pilot-matching leg: a historical corpus is not a substrate
  leg once the base moves. Future muster measurement preregs must
  include a same-base control sweep (untouched instrument re-run on
  the current base) as the substrate leg, before any band is judged
  against an old corpus.
- Recorderfix leg (b): re-baseline to a pre-fix vs fixed pair on the
  current substrate (9913 done; 7 seeds remain). Leg (c): reword the
  scholarDay clause to "present, finite/non-negative, and scholarDay ≥
  last series scholarDay" — all 8 pilot seeds already satisfy the
  corrected clause, so re-judging needs no new sims.
- No metric was re-scored mid-run in any arm: both NO-GO verdicts
  stand as written, with adjudications recorded here, not substituted
  for GO.

## Telemetry deviation check (coordinator, this run)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-30/perseed-muster-a/*.json' --metrics
national,table,wins,exiled --sweep-rows` → QUIET (61 seed rows, 0
non-row files skipped, 4 metrics, no large deviations). Caveat (same
as round 1639): 61 rows for 20 distinct seeds — census + fresh files
both ingested — so the check's per-row aggregates (nationalEver
16/61, table 10/61, won 9/61) are NOT per-seed wall numbers; the
workers' analyzer wall numbers above stand. Baseline NOT rolled (no
LOUD line to investigate, no regime change to record).

## Convergence state

scale-onramp stays CONVERGING (NOT converged): full seat 0, wave 5 0
across every band this run. What changed: the axis's sharpest open
item moves from "why a muster never forms" (now answered: unpressed
buttons + unoffered buttons + pending survival, ceiling 2/10 on the
measured state) to "how to make a muster formable" — a build/design
question (castMonster exclusion, refused-face routing call, coalition
building toward quota), not another measurement. food-economy untouched
(sibling loop B lane).

## Landing

Merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys). No [needs-eyes]: no feel,
combat, or UI change in any arm (DIAG + one additive instrument
field). Coordinator re-ran all arm proof suites on the merged tree:
test-muster-a 11/11, test-recorderfix-a 13/13, test-sweeten-a-branch
11/11, test-sweeten-a-corpus + propose-detail clean, test-tributecost-a
18/18 — all green, main tree clean after. All three worktrees released
as merged, removed, branches deleted. Main tree clean at closeout.
Safe-commit index clobber hit all three workers (repaired each time
via HEAD-blob cacheinfo, verified); the coordinator evidence commit
itself was clean. Claim retired to .DEAD at closeout; lock deleted.
