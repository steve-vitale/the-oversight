# sim-doublenight-fix-a — FIX: endDay runs twice for the same scholar.day on a player-death night (game-code fix, arm 1 of 3)

Run: oversight-flesh-out-loop, run fleshout-20261108T0315Z (Loop A, adoption run),
arm sim-doublenight-fix-a, axis food-economy. Worker tree:
~/workspace/worktrees/sim-doublenight-a, branch sim-doublenight-a.
FIX arm: one src/js change (game.js endDay) + derived instruments +
proof test + evidence. The coordinator lands via --ff-only; this worker
does NOT merge, push, bump, or verify live.

STATUS AT END OF THIS RUN (2026-11-08 ~05:10Z): INTERIM — NO VERDICT YET.
The before-measurements are complete and committed, the fix is built,
proof-tested 65/65 and committed, the §15 panel-before is done — but the
after-sweeps did not finish inside this run's window (CPU contention with
sibling loops; each 150d seed-run took ~2–4 min instead of ~3–4 s).
The after-runner was left mid-P1-trace1 with a partial after-corpus
(committed). The next adoption run resumes by re-running the runner's
AFTER mode — it reads phases.json from the before corpus, repeats exactly
the before lists, and the sweep is deterministic, so re-running the full
lists overwrites the partial files identically. NO verdict line exists in
this file, so the runner's post-verdict refusal does not block the resume.

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

## AFTER results (fixed code, base a04a6c0fc)

PENDING — the after-runner was still in P1 trace0/trace1 at end of run.
Partial after-corpus committed at 05:06Z: P1 trace-off 7/8 seeds
(98067, 98052, 98079, 98062, 98034, 98095, 98022 done; 98028 in flight),
trace-on 0/8, F1 not started, no analysis.json yet. The resume run must:
1. `bash scripts/run-doublenight-fix-a.sh
   evidence/2026-11-07/doublenight-fix-a-corpus-after
   evidence/2026-11-07/doublenight-fix-a-corpus-before`
   (AFTER mode; phases.json says p2=false, f1=true — P1 trace0+trace1,
   then F1 trace1, then the before/after diff analysis with the goBar).
2. Run the proof test WITH the live-leg env
   (PLENTYDEPRI=1 DEPOSITGATE=1 MEALDAY_TRACE=1
   SEEDS=98067,98052,98079,98062,98034,98095,98022,98028 DAYS=150
   node scripts/test-doublenight-fix-a.js) so leg E runs.
3. Panel-after + compare, sense-read the after transcripts of d37/d10,
   write the verdict (GO/NO-GO per the prereg) with a VERDICT-RENDERED
   line, and finish this evidence file.

## Proof test

scripts/test-doublenight-fix-a.js — PASS 65 legs (leg E skipped: no
after-corpus yet). U1 (player-death: day +1 exactly, eats exactly 1,
succession, death recorded day N, dawn reset, no re-entry, second
endDay = next night), U2 (villageLost: no advance), U3 (over: no
advance, returnToVillage called), U4 (normal night control). Source
legs S1–S8 (fall-through shape, returns untouched, one increment, no
clock clamp). Analyzer legs incl. D9 (Amendment A2).

`node scripts/check.js --quick` was started after the fix and was still
running at end of run (~04:40–05:10Z, slowed by sibling-loop
contention); its result was NOT observed in this run — the resume run
must check it (or re-run it) before landing. The fix is a 7-line
fall-through in one branch; the binding proof is the 65-leg test above.

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

Not a scale-wall arm; the wall numbers from the before panel/corpus:
national 0, table 0, wins 0 on these 16 seeds (no seed reached national
or the table; 3 F1 seeds survived to the 150d cap, all P1 seeds ended
village-lost). Wave reach is not instrumented by this arm's recorder.

## Metric review (to fill post-run — interim)

- The metric was judged as pre-registered for the before half:
  neutrality exact 8/8, capture 100%, every fire classified, zero
  UNCLASSIFIED, 19 fires reproduced (≥ 1 non-vacuity, ≥ 4 so no P2).
  No re-scoring happened.
- Amendment A2 (analyzer neutrality aggregation) was needed because the
  coded goBar could never pass with F1 in the corpus — a pre-observation
  instrument correction, documented above, with a proof leg.
- Throughput note: each 150d seed-run took ~2–4 min under sibling-loop
  contention (load 10–21, four concurrent sweeps + jest suites), not the
  ~3–4 s the loop body assumes. The before sweep took ~60 min and the
  after sweep the same — a full before+after round does not fit one
  2-hour run window under that contention. That is an infrastructure
  observation, not a metric change.

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
- DOCUMENTED (for the resume run): check.js --quick result unobserved;
  panel-after + compare unrun; leg E unrun; after-sweeps partial.
  The before corpus, panel-before, and phases.json are committed and
  the resume is a single runner invocation + panel + verdict.
