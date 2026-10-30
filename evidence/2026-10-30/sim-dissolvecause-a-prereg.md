# sim-dissolvecause-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T1215Z, worker
sim-dissolvecause-a. Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked-next #1 from the 1122Z run (dissolve-a
ranked-next #1, narrowed from the "dissolved meetings need a
dissolve-path recorder" backlog item: fate settled, cause open).

BUILD + MEASUREMENT. The recorder is built here (unlike
dissolve-a, which was read-only): a call-site field on the
scholarmelt recorder plus scholar HP at dissolve time, then a
fresh sweep on the draftflag substrate. Recorder-only,
additive, no behavior change, no default flip, no gate move,
no deed-bar move. No [needs-eyes]: this arm changes no feel,
combat, or UI — it only records. If implementing the recorder
would change game behavior, STOP and report that instead of
landing a behavior change.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the
dissolved population is wave-4 herald titans). NO CANON-registered
doc covers a scholar-fight dissolve specifically — the mechanism
below is read from code and stated exactly so it can be checked,
and is NOT canon.

## Mechanism, read from code (leads, NOT findings)

- A scholar fight dissolves silently when the fight object is
  gone with no tbEnd call: the scholarmelt recorder flushes
  such a start as result 'dissolved-no-tbend' when a later
  non-refused start, a mismatching tbEnd, or sweep-end
  finalize proves no fight is live. dayEnd on a flushed row
  is the FLUSH day, not the dissolve day; chain matching
  uses startDay, never dayEnd.
- The ONLY non-tbEnd dissolve site found in game code is
  tbBarrierExit's death-mid-crossing branch (game.js:
  tbfight.over=true, result='dissolved', tbfight=null, no
  tbEnd): it fires only when the scholar dies mid-crossing
  (Game.over set, or the mantle passes to a new bearer
  villagerId). It requires a LIVE fight, the player's turn,
  and a barrier push. Whether herald dissolved rows come
  from that site is UNMEASURED — it is the lead to check,
  not a finding.
- Decisive prior-corpus fact (read from the draftflag
  corpus before this prereg; NOT this arm's judged result):
  all 120 prior dissolved rows carry startPostFightGone=true
  AND dissolvedFlushed=true, with fightersStart null and
  worldOrigin null on all 120. That means every prior
  dissolved fight was ALREADY GONE at its own startCombat
  post-record — tbfight null at return, no tbEnd seen —
  and was only flushed later by the next start. A fight
  that dissolves inside its own startCombat call never
  reaches a player turn, so the barrier-death site (which
  needs a player-turn barrier push) does NOT fit the prior
  rows on its face — but "does not fit on its face" is
  not a measurement. This arm measures it: the recorder
  stamps a row 'barrier-death' ONLY when the tbBarrierExit
  wrap observes the barrier-death condition for that row's
  fight (post-call fight gone, no tbEnd recorded, bearer
  changed or Game.over set). A stamp count of 0 on the
  fresh sweep is a measured rejection of the lead, not an
  assumption.
- Glossary discipline (from dissolve-a, binding here):
  "restore" for dissolved rows means presence-at-flush,
  never a tbEnd restore; lingerer-origin for dissolved
  rows is defined via lift.lingering, never worldOrigin
  (null by construction).

## The build (scripts/policies/scholarmelt-diag.js ONLY)

Zero src/js changes. The recorder is policy-side; the sweep
reads it through the same install path as the draftflag
sweep. Additive fields only, on the scholarmelt row:

- `dissolveCause` (string|null, null on non-dissolved rows):
  set at the moment a row is OBSERVED dissolved, never
  overwritten by a later flush:
  - 'start-post-gone': fight gone at startCombat
    post-record, no tbEnd seen. (The prior corpus's only
    branch.)
  - 'flush-next-start' / 'flush-tbend-mismatch' /
    'flush-sweep-end': a pending row flushed later by
    that trigger, with no earlier start-post observation.
  - 'barrier-death': OVERWRITES the trigger label only
    when the tbBarrierExit wrap stamped the row BEFORE
    its dissolve observation (barrier-death condition
    observed for that fight). The trigger is kept in
    dissolveObservedAt, so the overwrite is auditable.
- `dissolveObservedAt`: 'start-post' | 'next-start' |
  'tbend-mismatch' | 'sweep-end'. For start-post rows this
  is 'start-post' even though the flush happens later.
- `scholarHpAtDissolve` (number|null): scholar HP at the
  dissolve observation. For start-post rows this is
  EXACT dissolve-time HP: the post-record runs
  immediately after the dissolving call returns, with no
  intervening action. For flush rows it is FIRST-
  OBSERVATION HP (a bound, not exact: actions between
  dissolve and flush may have moved HP) — the evidence
  must say which rows are exact and which are bounds,
  never blend them.
- `dissolveProbe` (object|null, start-post rows only):
  the discrimination snapshot at post-record: tbfight
  state ('null' | 'over'), bearer (villagerId) before vs
  after the call, Game.over before vs after, scholar
  HP before vs after, scholar.monster id after, and
  pendingMonsterId after. This snapshot is what answers
  question (a) if the barrier stamp is 0: bearer
  unchanged + over false + tbfight null means the fight
  vanished inside startCombat without death or mantle —
  and the remaining in-call path is then named as STILL
  OPEN with this snapshot as its evidence, never guessed.
- tbBarrierExit wrap (new, same discipline as the
  existing wraps: delegate, record after, never throw
  into the engine, engine throws rethrown unchanged):
  pre-call bearer/over/pending; post-call, for each
  pending row whose fight is gone with no tbEnd result
  recorded, if bearer changed OR Game.over is set, stamp
  the row barrier-death (fields above + scholar HP at
  stamp time). Normal barrier paths call tbEnd('fled'),
  which the tbEnd wrap records, so they never stamp.
- flushDissolved gains a trigger parameter; finalize
  passes 'sweep-end'. A flush NEVER overwrites an
  already-set dissolveCause / scholarHpAtDissolve /
  dissolveProbe — it only fills result, dayEnd, and the
  restored* identity fields.
- No other recorder, policy, or game file is touched.
  The sweep (scripts/sweep-dissolvecause-a.js) is a
  verbatim copy of scripts/sweep-draftflag-a.js with
  ONLY the default EVID dir changed (to
  perseed-dissolvecause-a) and the header comment
  updated — same seeds, horizon, policy, env, and
  recorders, so the substrate is identical by
  construction and row-minus-scholarmelt must be
  byte-identical to the draftflag rows (substrate leg).

## Corpus and substrate (binding)

- Fresh sweep: seeds 75101-75116, 180d death-aware
  horizon, tableseat-nowait policy, env
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  W4DPR=1, BREAKLINE=1, TILEJOIN=1, SHOUTREC=1,
  JOINENDLINES=1, REMOVAL=1, SCHOLARMELT=1,
  DRAFTFLAG=1 (set inside runOne, as in the draftflag
  sweep). EVID: evidence/2026-10-30/perseed-dissolvecause-a/
  (fresh dir; the draftflag corpus is READ-ONLY and
  untouched).
- Analyzer: scripts/analyze-dissolvecause-a.js (new;
  REUSES classifyDissolved/isLingererOrigin from
  scripts/analyze-dissolve-a.js by require — never
  re-implemented — and adds the cause/HP analysis).
  Fixtures: scripts/test-dissolvecause-a.js.

## Populations and rules (binding)

DISSOLVED POPULATION — every scholarmelt meeting in the
fresh corpus with result 'dissolved-no-tbend'. Each is
classified exactly one way by the restored-first rule
(from dissolve-a, verbatim via require) AND carries a
dissolveCause + dissolveObservedAt + scholarHpAtDissolve.
Cause distribution is reported split by observedAt, and
the exact-HP rows (start-post) are reported separately
from the bound-HP rows (flush) in every HP claim.

CAUSE-COVERAGE — a dissolved row counts as
cause-covered iff dissolveCause is a non-null string
from the taxonomy above. A row with a null cause is an
instrument failure, counted against the GO bar.

HP-COVERAGE — a dissolved row counts as HP-covered iff
scholarHpAtDissolve is a finite number.

QUESTION (a) — what code path starts a herald fight with
no tile monster (the s75104 phantom-herald pattern: 45
spawn-ended dissolved fights, scholar grinding 100->35
HP over d96-d101 in the prior corpus)? Answered from
the fresh corpus: the cause distribution on
spawn-ended (no-lift) dissolved rows, the barrier-stamp
count on those rows, and the dissolveProbe snapshots
(bearer/over/tbfight state). If the fresh corpus has
no spawn-ended dissolved rows, the question is answered
as "pattern absent on this sweep" with the counts, not
as a pass by absence — and the verdict rule below
still applies (0 dissolved rows total = NO-GO).
QUESTION (b) — within-day scholar HP steps at
successive dissolved starts: do dissolved starts
themselves cost HP? Answered ONLY from exact-HP rows:
for consecutive dissolved rows on one seed, the
within-fight delta (scholarHpAtDissolve minus
scholarHpStart of the SAME row) is the dissolved
fight's own HP cost on start-post rows; the
between-fight delta (next row's scholarHpStart minus
this row's scholarHpAtDissolve) is intervening-action
HP. A claim that dissolved starts cost HP requires a
systematically negative within-fight delta on
start-post rows. Flush rows contribute NO within-fight
claim (their HP is a bound).

## GO thresholds (binding)

- Prereg committed BEFORE any judged analysis: PASS
  required. (Corpus reads, code reads, and the
  startPostFightGone counts above preceded this prereg
  as design input; this arm's judged numbers come only
  from the fresh sweep.)
- Pilot gate (8 seeds 75101-75108, before any confirm
  spend): fixtures green + pilot sweep rows valid
  (days > 0, scholarmelt errs 0, overflow empty, census
  sorted + lastDay within 1) + instrument firing
  evidenced (pilot dissolved rows, if any, carry cause
  + HP; scholarmelt installed true) + substrate leg on
  pilot seeds (row-minus-scholarmelt byte-identical to
  draftflag pilot rows). A failed pilot gate stops the
  run.
- Seeds: 16/16 valid on the confirm sweep, same
  validity criteria.
- Cause coverage: dissolveCause present on >= 95% of
  dissolved rows. HP coverage: scholarHpAtDissolve
  present on ALL dissolved rows (100%). A fresh sweep
  with 0 dissolved rows is an instrument NO-GO to
  report, never a pass.
- Questions: both (a) and (b) answered from the fresh
  corpus under the rules above (including "pattern
  absent" as an answer for (a) only if dissolved rows
  exist but no spawn-ended rows do; (b) requires
  exact-HP start-post rows to exist — if all dissolved
  rows are flush-only, (b) is UNANSWERED and the
  verdict is NO-GO).
- Classification completeness: every dissolved row
  classified (exactly one fate each), 0 UNCLASSIFIED —
  carried from dissolve-a's rule, re-checked here.
- Substrate: row-minus-scholarmelt byte-identical to
  the draftflag corpus rows on 16/16 seeds, census
  files byte-identical to draftflag census files on
  16/16 seeds. Any divergence is investigated before
  judging; the recorder must not move the game.
- Determinism: pilot rows saved to worktree scratch,
  full-sweep rows for pilot seeds byte-identical to
  pilot rows; scratch removed after the diff.
- Sense: at least 2 dissolved chains read end to end
  for meaning (a same-seed day-cluster of dissolved
  rows plus the census snapshots bracketing it: does
  the cause label cohere with the tile/census state,
  does the HP path cohere, does anything read as a
  melt). Node-sim stubs Game.say to no-op, so there is
  no say transcript; sense evidence is the structured
  trace + census, stated as such.
- Fixtures: scripts/test-dissolvecause-a.js green
  before the judged analysis: cause assignment on
  synthetic rows (start-post sets cause+HP+probe and
  flush never overwrites; flush triggers set cause+HP
  when unset; barrier stamp overwrites trigger label
  and keeps observedAt; barrier stamp never fires when
  a tbEnd result is recorded; tbEnd-result rows never
  get a cause), the exact-vs-bound HP rule, and the
  analyzer's cause distribution + within/between HP
  deltas on synthetic corpora.
- Wall numbers: recomputed from the fresh corpus rows
  (same definitions as dissolve-a: wins, national ever/
  final, table reached/entered, wave reach, median
  survival, deaths) and checked against the draftflag
  numbers; any divergence is reported, never smoothed
  (divergence is EXPECTED to be zero if the substrate
  leg holds — a nonzero divergence contradicts the
  substrate leg and is investigated, not averaged).

## Verdict rule

- DIAG-GO iff prereg PASS + pilot gate PASS + 16/16
  seeds + cause coverage PASS + HP coverage PASS +
  questions (a) and (b) answered + classification
  completeness PASS + substrate PASS + determinism
  PASS + sense PASS + fixtures PASS.
- DIAG-NO-GO on any failed leg, including 0 dissolved
  rows. A miss is NO-GO, never re-scored against a
  friendlier metric mid-run; metric doubts go under
  "metric review" for the NEXT run. Every evidence file
  carries a "metric review" section.
- NO lever verdict: this arm proposes no damage buff,
  gate move, deed-bar move, or any game change. The
  recorder is an instrument; its findings may name a
  follow-up fix, but no fix lands here.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Recorder (scholarmelt-diag.js edit) + sweep copy +
   analyzer + fixtures, committed before the judged
   analysis is run (fixture bar green first).
3. Pilot: seeds 75101-75108 — fixtures + per-seed
   validity + instrument firing + substrate leg —
   before the confirm sweep is judged.
4. Confirm: full 16 seeds, determinism gate (pilot
   rows to scratch, diff, scratch removed), sense
   reads per the bar above.
5. Evidence evidence/2026-10-30/sim-dissolvecause-a.md
   with a prereg-legs table, the judged cause numbers,
   the (a) and (b) answers plainly, sense notes, wall
   numbers (recomputed), plain-words village assessment,
   metric review, and ranked next.
6. No src/js change, no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges; sibling loop B may move master
   under this branch — rebase cleanly at the end and
   re-run the proof; rebase conflict = FAIL LOUDLY, no
   force, no merge).

## Node harness

The sweep runs through scripts/sim-harness.js (the
shared kit: seeded Math.random before eval, full
src/js list in index.html order minus DOM-only files,
window stubbed then deleted for sync combat, never
stubbing Game.save). No jest is run by this arm unless
a changed test needs it; any jest invocation uses
--cacheDirectory=/tmp/jest-cache-sim-dissolvecause-a
and never runs concurrently with another jest.
