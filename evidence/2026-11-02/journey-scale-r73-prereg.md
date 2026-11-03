# journey-scale r73 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-02T19:45CST (scheduled 19:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
(Note: r72's note records the same pattern — prior closeouts wrote 3→0 yet
the file read 3 again. Queue position is scale either way; the write is
verified by read-back at closeout.)
**Base:** master@90637bc7c at branch creation (includes r72 Q2 nod-cycling
fix f375ce36b, verified present in conversation.js).
**No src/js or src/data change planned at pre-register time, except the Q2
gate below.** Tooling is the r72 driver/analyzer with labels/seeds/EVIDIR
only (diff verified: no non-label line). Evidence + run note only, unless
a fix gate below is met.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all instruments
read-only; the pickers only press offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** this run does not re-score the
already-proven scale shape (lesser waits, full unwon, wave 5 unfought —
r66–r72). Q1/Q3 are continuity reporting only; Q2 is the new work.

## Standing context (read before scoring)
- r72: quad 85061–85064 all ended before the cap (101–173d), 3 scattered
  on hunger streaks, 1 died out. Lesser seat 3/4 (priced, waiting,
  announced, none sat); full seat 0/4; wave 5 0/4; national 0/4, global 0/4
  at end (85063 was national+global voiced mid-run). Direction to watch
  is food: the climb's waiting period is when the pantry bleeds out
  (courtPoor days 23, 53, 79, 17 across the band).
- r72 Q2 LANDED: foreign-react gesture narrations now cycle via
  convoPickCycle (nod/smile/pointself, 3-variant pools, old line kept
  first). Proof test scripts/test-foreign-react-nod-r72.js 10/10.
- r72 clause-(c) adjudication, carried as this run's Q2: test-speak-it-back.js
  cannot run on this base at all (harness error at init, `Game.state` null,
  before any nvRespond code; proven pre-existing against the unmodified
  file). Its mediated-reaction section is therefore untestable without
  migrating that old eval-boilerplate test to the shared harness.
- Carried, still open (NOT re-scored here unless evidence arises):
  fusionReactorOnline days 60–120 trace (r70 follow-up); r65 bank-trace
  finding; r63 mantle-pass proof; r58 Irving-displacement, subject-menu;
  r56 chooseAbility-unguarded note; r55 barrier pin form (guard confirmed
  working, not overturned); r72 observation: 85064's end snapshot shows
  pantry 2,472 kcal on the scatter day while the narration says the
  pantry echoes — snapshot kcal may count stock that is not an edible
  meal (observation, not a defect claim).
- Canon (read): docs/CANON.md, docs/SCALE.md (ladder bars, one rung per
  season, national = primary + ≥3 seasoned subordinates), docs/TABLE.md
  (table prices the run, never gates on godhood), docs/CONVERSATIONS.md.

## Leg questions (binding)
1. **SCALE CONTINUITY (report-only):** fresh quad 85071–85074, r73 driver
   (r72 clone), policy scalecourt-nogate, WANT_SUBJECT=1 + GOSSIP_FIRST=1,
   DAYCAP 180, death-aware stop (+10d tail max). Report: census per seed
   (end, day, pop, pantry, rank, seat, arc, maxWave, pilgrimages),
   table-approach notes, duty counts (weapon-craft lines, deadfall-duty
   lines, wsplit classes — the TWELFTH band for both duties), barrier-pin
   lines, pellet-beat firing per seed (report-only). Judge REACHABLE /
   FUN / WINNABLE for the leg in plain words. No threshold is scored
   here, so no gate can be gamed; the verdicts are the report.
   PILOT GATE: seed 85071 runs first; if it crashes or pilgrimages == 0,
   STOP and report.
2. **SPEAK-IT-BACK HARNESS MIGRATION (new work, tooling only):**
   Migrate scripts/test-speak-it-back.js from its old eval-boilerplate
   load to the shared harness (scripts/sim-harness.js loadGame), keeping
   every assertion's intent. Land the migration ONLY if ALL hold:
   (a) the migrated test RUNS on this base (no init error) and its
   mediated-reaction assertions pass on unmodified game code — i.e. the
   migration is a pure harness move, not a behavior change;
   (b) if the migrated run FAILS on an assertion, the failure is
   investigated as a candidate real finding (not waved through, not
   silently loosened): either the old test's expectation is shown stale
   against current canon (documented, assertion updated with reason) or
   the failure is filed as a held defect with a proof note — no
   assertion is loosened just to go green;
   (c) check.js --quick shows no NEW failure vs the pre-migration run
   on this base (same names); any new failure blocks landing.
   If any clause fails, the migration stays HELD (old file untouched)
   with the diagnosis documented. Zero src/js game-code change under Q2.
3. **PEOPLE CHECK (sense law):** read every r73 transcript in full.
   Conversations must have meaning: the NPC wants something, options
   engage or deflect it, endings resolve/plant/owe. No fabricated shared
   history, no filler loops, no static menus. Report per-transcript
   verdicts; any repeat class found is named, not averaged away.

## Metrics (bound; §14)
Census scalars unchanged from r51's list (19 scalars + covenant trusts),
plus fusion/ability columns (reads, not scores), the r61 end-state class,
weapon-craft-line and deadfall-duty-line counts, and gossip-exposure counts
(ask:gossip picks, THEM lines per transcript, sittings) from the r73 analyzer
(r72 analyzer, labels/seeds only). No metric is re-scored mid-run; doubts go
under "metric review".

## Telemetry deviation check (step 14)
After writing evidence, run telemetry-check.js against the scale-census
baseline with this run's per-seed trust JSONs. Any LOUD line is a same-run
investigation item BEFORE any baseline roll. The baseline is NOT rolled on
this run's numbers by default (r68's decision stands: the baseline sums a
different band's fates).
