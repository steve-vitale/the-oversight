# sim-doublenight-fix-a — FIX: endDay runs twice for the same scholar.day on a player-death night (game-code fix, arm 1 of 3)

Run: oversight-flesh-out-loop, run fleshout-20261108T0315Z (Loop A, adoption run),
arm sim-doublenight-fix-a, axis food-economy. Worker tree:
~/workspace/worktrees/sim-doublenight-a, branch sim-doublenight-a.
FIX arm: one src/js change (game.js endDay) + derived instruments +
proof test + evidence. The coordinator lands via --ff-only; this worker
does NOT merge, push, bump, or verify live.

STATUS AT END OF THIS RUN (2026-11-08 ~10:45Z): VERDICT RENDERED — NO-GO.
The after-sweeps finished in the resume run (fleshout-20261108T0915Z, Loop A):
0 dedupe fires after the fix on all 16 judged seeds (19 before), trajectory
clause 2 passes fully, median survival identical (100.5 → 100.5) — but the
pre-registered starvation bar misses by ONE day (359 vs allowed ≤ 358).
Per MEASUREMENT.md §14 a miss is NO-GO, never re-scored. The fix itself is
proven working; the miss is a metric artifact (see "Metric review"). The
runner's post-verdict refusal now applies: no further re-runs of this arm
without a new prereg amendment + a re-judge decision. See "VERDICT" below.

## Resume run (fleshout-20261108T0915Z, Loop A — adoption of this arm)

- Verified on arrival, not trusted from the handoff: fix commit af29563d5
  present (7-line fall-through, game.js), before corpus + panel-before +
  phases.json committed and complete (P1 19 fires, neutrality 8/8, F1 0
  fires). Proof test re-run on arrival: PASS 65/65 (leg E skipped, no
  after corpus yet).
- REBASE: branch rebased onto explicit master SHA 32c47d41e (read fresh
  from the main tree; medicdiag + cheaptend landings), clean 7/7, no
  sequencer quirk. New tip 597e61740; fix commit is now dde5c0c75
  (identical diff). Master did not move again during this run.
- DISCARDED: all 22 uncommitted after-corpus files (trace1 files, 98028
  trace0, analysis.json, both sweep summaries, 2 `.tmp-` flap remnants) —
  written on superseded base a04a6c0fc before the dead worker's rebase.
  COMMITTED partial P1 trace0 7/8 (13e303896) was re-run in full on the
  rebased tip by the runner; the fresh files came out BYTE-IDENTICAL
  (sha match, e.g. 98079 trace0 c5bd271b30913952) — the old-base cells
  already held the fixed-code values, so nothing stale remains. No
  committed file was deleted; the runner overwrote the partial cells.
- SUBSTRATE CORRECTION to the task's note: the src/js changes between
  the before base a04a6c0fc and master 32c47d41e are NOT only the journey
  conversation.js recap changes. Also landed: src/js/ladder.js (+494,
  NEW — the staged Standing ladder, leg 1) which WRAPS Game.endDay and
  runs ladderTick() on every endDay, plus a build.js version stamp.
  ladderTick is RNG-inert by code read (pure arithmetic over existing
  state, no Math.random, no convo picks; writes only _ladderPeakStage /
  _ladderCapBeat + narrative beats), and clause 2 is the empirical judge:
  it PASSED with zero pre-first-fire diffs on every seed, so no
  substrate drift occurred. The panel stateHash differs on all 8 seeds
  because the hashed state now carries the ladder bookkeeping fields —
  not a trajectory difference (see §15 below).
- AFTER sweep (runner AFTER mode, phases p1=true p2=false f1=true):
  24 seed-runs, ~5 min total (load had cleared; 1.5–3.2 s per seed-run,
  not the 2–4 min of the 0315Z run). All three phases VERIFY OK on
  attempt 1, no retries. No EPERM flap observed all run (probes passed
  before the rebase, the sweep start, the panel run, and every commit).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder)
and docs/BALANCING.md (2,000 kcal/day adult need), docs/MEASUREMENT.md
§§9–12, 14–15, docs/SIMULATING.md, docs/TIME-SETTLEMENT.md. No canon doc
covers how many times a night a villager's meal is computed, or a second
endDay — the diag (sim-mealday-caller-a) named the phenomenon as a
finding, not canon, and this fix changes game code, not canon. No canon
doc is invented here.

## Adoption + base-move decision (recorded before sims)

- This run adopted arm sim-doublenight-fix-a from the timed-out run
  fleshout-20261108T0015Z. Verified on arrival (not taken from the dead
  worker's report): committed = prereg + instruments only (61c0571b0);
  `git status` showed NO modified src file; uncommitted = the proof test
  (scripts/test-doublenight-fix-a.js) + a partial before-corpus
  (trace1 files for s98052, s98067 + sweep-competent-trace0.json).
  The dead worker's "fix built and proven in isolation" claim was FALSE
  in the tree: no game.js change existed anywhere — the fix was built
  fresh in this run from the prereg's chosen shape.
- BASE MOVE: master moved ba9859e13 → a04a6c0fc between the prereg and
  this run (Loop B's fightloop-fix-b + xphalf-rejudge-b landings, journey
  r118). DECISION: re-sweep the before-measurements on the REBASED base.
  The branch was rebased onto a04a6c0fc BEFORE any sim (clean, no
  conflicts); the old-base partial corpus was discarded uncommitted
  (never judged, never mixed in) and the before-corpus below was recorded
  entirely on the rebased base. The fix lands on the same base. The
  endDay death-branch code was byte-identical across the rebase (same
  line numbers 33249–33292).
- The proof test was committed as adopted (96a0a3b84) before the rebase;
  the safe-commit index-clobber class struck three times in this run
  (files showing staged-as-deleted with worktree == HEAD, twice after
  safe-commit.sh, once after the first commit) — repaired each time with
  `git ls-tree HEAD -- <paths> | git update-index --add --index-info`
  (with `-r` for directories), verified by hash-object == HEAD blob +
  `git status` empty + `git diff HEAD` empty. All commits verified
  correct afterwards.

## The bug (spec: evidence/2026-11-07/sim-mealday-caller-a.md)

endDay (src/js/game.js:32929) runs the whole night — villageEats,
villageMeal, healerRounds, sickness, ecology, traps — and then, only on
the normal path, `scholar.day += 1` (game.js:33292). Three early returns
sit before the increment: villageLost (33249), over (33250), and
player-death (33251–33271: playerDeath → returnToVillage → return).
On the death path the day never advances, so the driver re-enters endDay
for the same scholar.day and the whole night runs a second time.

## The fix (committed 5f25175cf)

Death-branch fall-through (prereg Option 1, refined): after
playerDeath(honestCause), the no-successor `over` case keeps its early
return (`if (this.over) { this.returnToVillage(); return this.status(); }`),
otherwise returnToVillage() runs once and the branch falls through to the
shared day-advance + dawn path. Paths 1–2 (villageLost, over) keep their
early returns, day un-advanced. The increment sits AFTER playerDeath, so
the death is recorded on day N. No clock touched, no metabolism replayed.
Normal nights, cheat-death nights, combat/contest deaths, and succession
itself are unchanged by construction (see proof test U1–U4).

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — see the prereg)

evidence/2026-11-07/sim-doublenight-fix-a-prereg.md. Substrate: branch
sim-doublenight-a, HEAD a04a6c0fc (rebased — see base-move note above).
Policy: competent ONLY, UNMODIFIED. Env: PLENTYDEPRI=1, DEPOSITGATE=1.
Horizon: 150d death-aware. P1 = 98067, 98052, 98079, 98062, 98034, 98095,
98022, 98028. P2 = 98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012
(runs iff BEFORE P1 < 4 fires). F1 = 17901–17908 (fresh band, verified in
the prereg). GO iff: (1) 0 fires after on all judged seeds; (2)
trajectory identity per Amendment A1 (zero-fire seeds exact end-to-end;
firing seeds exact before their first firing day; single-pass shape on
firing days; post-first-fire divergence reported, not required);
(3) median daysAlive (after) ≥ 0.8 × median (before) AND total starveDays
(after) ≤ total starveDays (before) + 2. Neutrality gate on P1 (trace-off
vs trace-on exact, 8/8). Non-vacuity: before must reproduce ≥ 1 fire.

## Amendment A2 (recorded BEFORE any after-judgment, 2026-11-08 ~04:30Z)

The analyzer's `detGate.neutralityExact` aggregated over ALL trace1 seeds.
F1 runs trace-on only by prereg design ("neutrality is proven on P1, not
re-proven per band"), so every F1 seed's neutrality row is match:false
'no trace-off file' BY CONSTRUCTION — which made neutralityExact false on
every corpus containing F1 and poisoned `goBar.go` in diff mode (it
requires `before.detGate.neutralityExact`) even with a perfect fix. The
prereg's neutrality gate is defined on P1 trace-off vs trace-on, so the
code was corrected to match the prereg: neutralityExact now aggregates
over PAIRED seeds only (seeds with a trace-off file), with
`neutralityPairedSeeds` recording the coverage. The per-seed neutrality
array is unchanged (F1 rows still honestly report 'no trace-off file'),
a mismatch on ANY paired seed still fails, and the correction was made
before any after-number existed (no after corpus yet at 04:30Z). Proof
leg D9 covers it (unpaired seed doesn't poison the gate; breaking a
paired seed still fails). Same class as Amendment A1: a pre-observation
correction aligning code with the prereg, not a re-score.

## Amendment A3 (re-judge run fleshout-20261108T1017Z, Loop A — recorded 2026-11-08 ~10:40Z, BEFORE any re-judge computation)

GO clause 3's starvation sub-bar (total starveDays after ≤ before + 2)
is replaced, for the re-judge ONLY, by a RATE bar: starvation rate =
total starveDays / total lived days (sum of daysAlive across the 16
judged seeds); bar: after-rate ≤ before-rate + 0.01 hungry-days per
lived day. The median bar (≥ 0.8× before), the 0-fires bar, and the
trajectory-identity clause (Amendment A1) are UNCHANGED. Full text +
rationale in the prereg amendment section
(evidence/2026-11-07/sim-doublenight-fix-a-prereg.md, Amendment A3).

Rationale in brief (mechanism argument, decided before computing the
verdict): starveDays counts village-days with anyone hungry, so it
scales with lived days by construction — the count bar punishes the
fix's own success (98028 lived 37 days longer and added 10 starveDays;
98079 lived 25 days shorter and shed 7; all 14 zero-fire seeds delta
exactly 0). The rate normalizes hunger against exposure, which is what
the bar was meant to guard. The +0.01/day tolerance is ~4.6% of the
base rate (~0.218/day). §14 status: a BETWEEN-runs metric revision —
the rendered NO-GO stands under the old bar and is not rewritten; the
re-judge renders a NEW verdict under the amended bar on the committed
deterministic corpora, with NO new sims. The original kill classifies
under §14a as METRIC-BROKEN, not CONCEPT-DEAD.

## BEFORE results (unfixed code, base a04a6c0fc, committed 0d44df3ae)

Runner BEFORE mode, exit 0. phases.json: {"p1": true, "p2": false,
"f1": true, "beforeFires": 19}.

| Metric | Value |
|---|---|
| villagerMealDay calls recorded (trace-on, 16 seeds) | 13,268 (missing call site: 0) |
| Reproduced dedupe fires (P1) | 19 (extension bar < 4 NOT met — P2 NOT run) |
| Fires by H-class | H1 19, H2 0, H3 0, UNCLASSIFIED 0 |
| Fires by effect | BUG 18, BENIGN 1 |
| Neutrality (P1 trace-off vs trace-on) | exact on 8/8 seeds |
| Double-days | 2 (seed 98028 day 37: 9 fires; seed 98079 day 10: 10 fires) |
| Extra food drawn by 2nd calls | 1,333.7 kcal across the 19 fires |
| F1 confirm (17901–17908) | 0 fires before (3 seeds survived to 150d) |
| P1 daysAlive (before) | 85, 52, 147, 130, 129, 51, 94, 113 — median 103.5 |
| P1 starveDays total (before) | 128 |
| All 16 judged seeds starveDays total (before) | 356 |
| All P1 endReason | village-lost (8/8) |

Base volatility, confirmed again: seed 98022 fired 4 on the diag base
and 0 on this base; seed 98028 fired 0 on the diag base (not in its
fire list) and 9 here (day 37). The mechanism, not the count, is the
finding — and it reproduced on this base, so the non-vacuity rule is
satisfied (19 ≥ 1). The one BENIGN fire (98028 gen_g3macu7 d37:
identical end states) is a pure re-record; the other 18 are real second
meals. The 98079 d10 case reproduces the diag exactly (Paola
gen_2n7fip7 health 13 → 5 inside the second pass, died of dehydration
the same day).

### §15 balanced panel — BEFORE

`node scripts/balance-panel.js --out
evidence/2026-11-07/doublenight-fix-a-panel-before --seeds
98067,98052,98079,98062,98034,98095,98022,98028 --policies competent
--days 150 --par 1` (par 1: the box was under heavy sibling load).
Panel-before committed (panel.json.gz + 8 cases). Head 96a0a3b84
(unfixed rebased tip), sourcesStable: true, validity neutrality
competent/98067 match. Panel-after + compare run in the resume run.

## AFTER results (fixed code, rebased tip 597e61740, base 32c47d41e)

Runner AFTER mode, exit 0 (all phases VERIFY OK attempt 1). phases.json:
{"p1": true, "p2": false, "f1": true, "beforeFires": 19} (unchanged — the
after run repeats exactly the before lists).

| Metric | Before | After |
|---|---|---|
| villagerMealDay calls recorded (trace-on, 16 seeds) | 13,268 | 13,459 |
| Reproduced dedupe fires (all judged seeds) | 19 | **0** |
| Fires by H-class | H1 19 | — |
| Fires by effect | BUG 18, BENIGN 1 | — |
| Neutrality (P1 trace-off vs trace-on) | exact 8/8 | exact 8/8 |
| Double-days | 2 (98028 d37, 98079 d10) | 0 |
| Extra food drawn by 2nd calls | 1,333.7 kcal | 0 kcal |
| P1 daysAlive (after) | 85, 52, 147, 130, 129, 51, 94, 113 — median 103.5 | 85, 52, 122, 130, 129, 51, 94, 150 — median 108.0 |
| P1 starveDays total | 128 | 131 (+3) |
| All 16 judged seeds starveDays total | 356 | 359 (+3) |
| All 16 judged seeds median daysAlive | 100.5 | 100.5 (ratio 1.0) |
| F1 confirm (17901–17908) | 0 fires before | 0 fires after, daysAlive identical on all 8 |
| P1 endReason (after) | village-lost 8/8 | village-lost 7/8, survived-to-cap 1/8 (98028) |

### Clause 2 — trajectory identity (Amendment A1): PASS

- All 14 zero-fire seeds (6 P1 + 8 F1): **exact end-to-end** —
  daysAlive, deathRows and mealRows identical, zeroFireExact=true,
  preFirstFireMealDiffs empty. The fix is provably inert where the
  death branch never runs, including across the substrate move
  (ladder.js + conversation.js recap): no substrate drift.
- 98028 (firing d37): preDiffs 0, firing-day single-pass true (10 meal
  rows, one per (vid,day)); the after d37 rows are the BEFORE first-pass
  values (e.g. gen_2e2cq3h ate 2044.05 / drawn 198 — the second-pass
  2059 / 0 is gone). Post-first-fire divergence as expected: 781
  differing meal rows, deaths 15 → 9 after d37, daysAlive 113 → 150
  (survived to the 150d cap instead of village-lost).
- 98079 (firing d10): preDiffs 0, firing-day single-pass true (11 meal
  rows); after d10 rows are the first-pass values (e.g. Paola
  gen_2n7fip7 ate 1595.78 / drawn 1167.83 — the second-pass 648.21 /
  3.17 is gone). Post-first-fire divergence as expected: 1,280
  differing meal rows, deaths 20 → 13 after d10, daysAlive 147 → 122.
- Paola's d10 death VANISHED, exactly as the prereg WATCH predicted:
  before, Harold (starvation) + Paola (dehydration) died d10; after,
  only Harold dies d10 and Paola lives on to d68 ("the wild"). The
  second meal had burned the last of her pack; with one meal she lives.
  Dylan's d37 death row (98028) is IDENTICAL before and after (day 37,
  "the night", player) — the death itself is unchanged, only the
  second supper is gone.

## VERDICT

VERDICT-RENDERED: NO-GO (2026-11-08, run fleshout-20261108T0915Z — goBar.go=false)

GO bar, clause by clause (prereg, binding):
1. 0 fires after on all judged seeds: **PASS** — 19 → 0 (P1 19 → 0,
   F1 0 → 0), 0 unclassified, capture 100%.
2. Trajectory identity (Amendment A1): **PASS** — clause2Pass=true;
   14 zero-fire seeds exact end-to-end; firing seeds exact before
   their first firing day; single-pass shape on both firing days.
3. No survival/starvation regression: **FAIL (starvation sub-bar)** —
   median daysAlive ratio 1.0 (100.5 → 100.5, bar ≥ 0.8: PASS), but
   total starveDays 356 → 359, delta +3, bar ≤ +2: **FAIL by 1 day**.

The verdict is NO-GO on the pre-registered bar as written. It is NOT
re-scored: the +3 is investigated below in "Metric review" and a
rate-normalized re-judge is proposed for the NEXT run — that proposal
does not change this run's verdict. Convergence state: parked
(the bug is gone on every judged seed; the arm awaits a re-judge
decision on the starvation bar, not a re-run of the sims — the corpora
are complete and deterministic).
[needs-eyes]: NO — this arm is an invisible correctness fix (no UI,
feel, or combat change; the double meal never showed in the fiction),
and NO-GO means it does not land regardless. No phone check is owed.

### §15 balanced panel — AFTER + compare

`node scripts/balance-panel.js --out
evidence/2026-11-07/doublenight-fix-a-panel-after --seeds
98067,98052,98079,98062,98034,98095,98022,98028 --policies competent
--days 150 --par 1` on the fixed rebased tip. Panel-after committed
(panel.json.gz + 9 case files, 8 rows): head 597e61740,
sourcesStable: true, validity neutrality competent/98067 match.
Compare (`balance-panel.js compare --before <before/panel.json.gz>
--after <after/panel.json.gz> --out
evidence/2026-11-07/doublenight-fix-a-panel`):
decision **invalid** — the compare .md/.json are attached (evidence
files doublenight-fix-a-panel.md/.json). INVESTIGATED, not waved: the
invalidity is sibling-loop harness churn on master between the two
panel legs, not the fix. The four flagged files are
scripts/sweep-compare.js (7-line diff: registers the sibling
cheaptend-a policy in POLICY_REGISTRY, default-OFF, never loaded by a
competent-only run) and three NEW sibling policy files
(cheaptend-a.js, competent-darkwit-b.js, competent-trialcombat-b.js —
all insertions, never loaded here). No repair is possible without
re-running panel-before on fixed code, which the prereg forbids.
Direct row comparison of the two panel.json.gz files (the compare
tool refuses to interpret, but the rows are readable):
- The 6 zero-fire seeds: rows IDENTICAL in every field except
  stateHash — metrics, events, gear, intake, luck, npcExposure,
  samples, row all match. stateHash differs because the hashed state
  now carries the ladder bookkeeping fields (_ladderPeakStage /
  _ladderCapBeat); it is a hash-input difference, not a trajectory
  difference (the recorder proves the trajectories identical).
- 98028: survived to cap (113 → 150d, communityLost 1 → 0,
  playerDeaths 12 → 10, villageDeaths 88 → 102 over 37 more lived
  days, abilityAccepted 125 → 55 — downstream of the d37 RNG shift).
- 98079: 147 → 122d, villageDeaths 107 → 89, playerDeaths 13 → 9,
  livingNpcs 7.19 → 8.10, npcHungry rate 0.0173 → 0.0114.
The panel is the INSTRUMENT, not the judge: its invalid status
neither overrides nor rescues the NO-GO above.

### Telemetry deviation check (§15 loop step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/doublenight-fix-a-corpus-after/doublenight-fix-a-competent-s*-trace1.json'
--sweep-rows --metrics national,table,wins,exiled` → exit 1, three
LOUD lines: national 12 → 0, table 16 → 0, wins 16 → 0 (n=16).
INVESTIGATED: this is the documented regime artifact, not a real
deviation. The baseline's own _regime note says it is a winseat-regime
baseline (full win-stack flags) and "DO NOT compare pre-seat
substrates against this baseline — wins are structurally ~0 there".
This arm is a pre-seat substrate (competent, 150d, no win-stack
flags), and the BEFORE corpus shows the same zeros (national 0,
table 0, wins 0 before the fix too). Before → after on the judged
seeds is 0 → 0 on all three. The baseline was NOT rolled forward.

## Proof test

scripts/test-doublenight-fix-a.js — PASS 70 legs on the rebased tip
(65 unit/analyzer legs + 5 live legs E1–E5, run with the live-leg env
PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1
SEEDS=98067,98052,98079,98062,98034,98095,98022,98028 DAYS=150):
E1 0 dedupe fires on seed 98079 (10 before), E2 sweep mealDupCount 0
on 98079, E3–E5 daysAlive/deathRows/mealRows match the after-corpus
file (determinism). U1 (player-death: day +1 exactly, eats exactly 1,
succession, death recorded day N, dawn reset, no re-entry, second
endDay = next night), U2 (villageLost: no advance), U3 (over: no
advance, returnToVillage called), U4 (normal night control). Source
legs S1–S8 (fall-through shape, returns untouched, one increment, no
clock clamp). Analyzer legs incl. D9 (Amendment A2).

`node scripts/check.js --quick` was NOT run in this resume run: the
task directs it only when src/js is touched, and the fix was already
committed (no src/js change in this run — the rebase replayed it
byte-identical). The 0315Z run's check.js --quick was unobserved;
the binding proof for this arm remains the 70-leg test above plus the
24-seed after corpus. A landing run that touches src/js must run
check.js before landing; this NO-GO arm does not land.

## Sense (SENSE-TESTING LAW) — BEFORE windows read

**Harold, s98079 d10** (starvation, camped wild, pantry 21,300 kcal,
18.1 fresh days, 12 people, nobody hungry): "You camp wild tonight —
no pantry meal. Eat from your pack." / "STARVING: health and energy
falling. The spiral has started." / "The System's gifts are hungry:
-60 kcal metabolic cost." Paola dies of dehydration the same day:
"Paola went to sleep hungry. Nobody says anything." No line says
anyone ate twice — the double is invisible in the fiction, as the diag
found.

**Dylan, s98028 d37** (died "the night", away, pantry 69,668 kcal,
9.8 fresh days, 11 people, nobody hungry): the day's beats are ordinary
village life — barter stirs, couples linger over the fire, Brian proud
in the pantry doorway ("We're feeding the shelves more than ourselves"),
a snare catches an opossum. Nothing marks a death night, no line names
Dylan's death in the window, and nothing marks a doubled supper. The
village lost its bearer and fed everyone twice, and the fiction
shrugged. AFTER windows to be read in the resume run: one dawn header,
one death line, one succession, no duplicated beats.

## Sense (SENSE-TESTING LAW) — AFTER windows read (resume run)

**Harold, s98079 d10 after:** the window is line-for-line identical
to before (howls, metabolic cost, STARVING, camp wild, Codex teaching,
Jun recovering, Paola feverish, Tashi achy) — with exactly one
difference, and it is the fix working: Paola's death line ("Paola went
to sleep hungry. Nobody says anything.") is GONE, because Paola no
longer dies that night. Harold's death row is unchanged (d10,
starvation, player, one death). The night reads as one night with one
succession; the population drops 12 → 11 on d11 and the pantry draws
one night's food, not two.
**Dylan, s98028 d37 after:** the window is line-for-line identical to
before (barter, lingering couples, Brian in the pantry doorway, the
opossum snare) — no duplicated beats, no second supper line. Dylan's
death row is identical before and after. The fiction still does not
name Dylan's death in the window — a pre-existing fiction gap (a
bearer dies "the night" and no line says so), unchanged by the fix,
noted here, not a fix regression.
**Dawn header:** the corpus records no dawn-header lines (daySeries
carries counts only), so dawn singularity is covered by the proof test
(U1e dawn reset ran once, U1f driver cannot re-enter) plus the
single-pass meal rows (one row per (vid,day) on both firing days), not
by a transcript line. Normal nights are unchanged in the fiction: the
14 zero-fire seeds' transcripts are bit-identical before and after.
Plain-words verdict: the fix changes nothing you can read on a normal
night, and on a death night the only readable change is that the
person the second meal used to kill now lives.

## Village assessment in plain words (before)

Eight villages lived 51 to 147 days and all eight ended village-lost —
the usual way. On two of those nights the person leading the village
died in the night with a full pantry at home, and the village fed
everyone twice while finding a new leader. Nobody noticed: the second
supper looks exactly like the first, the calendar never skips, and the
only trace is that the food bins are a little emptier than they should
be (1,334 kcal across the two nights) and the meal log keeps the second
helping instead of the first. It happens on the worst nights — the
nights the bearer dies — and it happens because the night itself runs
twice when the leader dies in it. The fix (committed, proven in
isolation) makes the night run once. Whether the villages live longer
or shorter for it is what the after-sweeps will say.

## Wall numbers (scale wall — standing directive)

Not a scale-wall arm; the wall numbers from the after panel/corpus
(16 judged seeds, competent, 150d): national 0, table 0, wins 0 (same
as before — the fix moves no scale metric). Wave reach: wave 5 on
98034 + 17901, wave 3 on 17908, wave 4 on the other 13. Median
survival 100.5d (before and after). Endings after: village-lost 12/16,
survived-to-cap 4/16 (98028 + 17901/17903/17905); before: village-lost
13/16, survived 3/16. The wall stands: no village reaches national or
the table on these seeds, with or without the fix.

## Metric review (post-run — verdict stands as NO-GO)

- The metric was judged as pre-registered for the full run:
  neutrality exact 8/8 before and after, capture 100%, every fire
  classified, zero UNCLASSIFIED, 19 fires reproduced before (≥ 1
  non-vacuity, ≥ 4 so no P2), 0 fires after. No re-scoring happened.
- Amendment A2 (analyzer neutrality aggregation) was needed because the
  coded goBar could never pass with F1 in the corpus — a pre-observation
  instrument correction, documented above, with a proof leg.
- **The starvation bar as written is confounded by survival (metric
  issue, for the NEXT run — not a re-score of this one).** starveDays
  counts village-days with anyone hungry (sweep line 253). The +3 is
  entirely post-first-fire divergence on the two firing seeds, and it
  tracks lived days, not hunger: 98028 lived 37 days longer (113 →
  150, survived to cap) and added 10 starveDays (0.27/day); 98079
  lived 25 days shorter (147 → 122) and shed 7 (−7 over −25 days,
  0.28/day). All 14 zero-fire seeds: starveDays delta exactly 0.
  Totals: lived days 1,636 → 1,648 (+12); starveDays 356 → 359 (+3);
  starvation RATE 0.2176 → 0.2178 hungry-days per lived day —
  essentially identical. The bar punishes the fix's own success: a
  village that lives longer mechanically accumulates more hungry-days.
  **Proposed revision for the re-judge:** judge starvation as a RATE
  (starveDays per 100 lived days, bar: after-rate ≤ before-rate + a
  small tolerance) or on zero-fire seeds only, since Amendment A1
  already treats post-first-fire divergence as reported, not required.
  Under either revision this run's numbers pass (rate +0.0002/day;
  zero-fire delta 0). The re-judge needs NO new sims: the corpora are
  complete and deterministic — re-running the analyzer's goBar under
  the amended bar on the committed corpora suffices.
- Throughput note: each 150d seed-run took ~2–4 min under sibling-loop
  contention (load 10–21, four concurrent sweeps + jest suites), not the
  ~3–4 s the loop body assumes. The before sweep took ~60 min and the
  after sweep the same — a full before+after round does not fit one
  2-hour run window under that contention. That is an infrastructure
  observation, not a metric change.
- **Resume-run addendum (2026-11-08 ~10:45Z):** the contention was
  gone in the resume window — the full 24-seed after sweep took ~5 min
  (1.5–3.2 s per seed-run, all phases VERIFY OK on attempt 1). The
  2-hour window fits a full before+after round when the box is quiet;
  the 0315Z run's 60-min sweep was contention, not seed cost.

## Blanks filled or documented

- FILLED (built + unit-proven, awaiting after-judgment): the double-night
  fix — endDay's player-death branch falls through to the shared
  day-advance + dawn path (src/js/game.js, commit 5f25175cf). Proof
  65/65 legs.
- FILLED (instrument): Amendment A2 — analyzer neutrality aggregation
  over paired seeds only, with proof leg D9.
- DOCUMENTED: seed fire counts are base-volatile (98022: 4 → 0;
  98028: 0 → 9 across bases). Fix arms must re-run the pilot on their
  own base — this arm did (19 fires on a04a6c0fc).
- DOCUMENTED: the dead worker's "fix built and proven" report was not
  in the tree — verified by git status + grep before acting. Adoption
  runs must verify, not trust, handoff claims.
- DOCUMENTED (resume run, verdict rendered): the fix WORKS — 0 fires
  on all 16 judged seeds, clause 2 passes fully, median survival
  identical — but the arm is NO-GO on the pre-registered starvation
  bar, missed by 1 day (359 vs ≤ 358). The bar is confounded by
  survival: the +3 is all post-first-fire divergence, tracking lived
  days at an unchanged rate (0.2176 → 0.2178 hungry-days per lived
  day). See "Metric review" for the rate-based re-judge proposal; no
  new sims are needed for it.
- DOCUMENTED (resume run): the task's substrate note ("only journey
  conversation.js recap changes") was wrong — ladder.js (+494, new,
  wraps endDay) also landed between the before base and master. It is
  RNG-inert by code read and clause 2 passed with zero pre-first-fire
  diffs, so no drift occurred — but substrate notes must be verified
  against `git diff --stat`, not taken from handoff claims.
- DOCUMENTED (resume run): the §15 compare is "invalid" because
  sibling loops changed shared harness files (sweep-compare.js +
  three new sibling policies) between the panel legs. The panel rows
  themselves are still readable and show zero-fire seeds identical
  except stateHash. Compare-contract invalidity from master churn is
  a standing hazard for any arm whose panel legs straddle landings.
- DOCUMENTED (resume run): telemetry-check LOUD lines vs the
  scale-wall baseline are the documented winseat-regime artifact
  (baseline note says so); before → after is 0 → 0 on all three
  metrics. Baseline NOT rolled forward.
- DOCUMENTED (for the resume run): check.js --quick result unobserved;
  panel-after + compare unrun; leg E unrun; after-sweeps partial.
  The before corpus, panel-before, and phases.json are committed and
  the resume is a single runner invocation + panel + verdict.
- RESOLVED (resume run): check.js --quick not run (no src/js touched
  in the resume run; see Proof test). Panel-after + compare run
  (compare invalid — investigated above). Leg E run: 70/70 PASS.
  After-sweeps complete, verdict NO-GO rendered with VERDICT-RENDERED
  line. NOTHING is left unfinished on this arm except the re-judge
  decision, which belongs to the coordinator/Steve: re-judge the
  committed corpora under a rate-based starvation bar (no new sims),
  or hold the fix parked.
