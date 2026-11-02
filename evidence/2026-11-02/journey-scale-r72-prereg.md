# journey-scale r72 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-02T10:45CST (scheduled 10:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
(Note: r71's closeout also wrote 3→0, yet this run's file read 3 again —
same pattern as r69. Queue position is scale either way; the write is
verified by read-back at closeout.)
**Base:** master@8471c5da3 at branch creation (journey-deepening r86 tip).
**No src/js or src/data change planned at pre-register time.** Tooling is the
r71 driver/analyzer with labels/seeds/EVIDIR only (diff verified: no
non-label line) + the r67 gossip analyzer reused unchanged. Evidence + run
note only, unless a fix gate below is met.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work; all instruments
read-only; the pickers only press offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** this run does not re-score the
already-proven scale shape (lesser waits, full unwon, wave 5 unfought —
r66–r71). Q2 is the new work; Q1/Q3 are continuity reporting only.

## Standing context (read before scoring)
- r71: SUBJECT_FIRST lifted gossip exposure to 3/8 sittings, 0 fallback
  pairs — gossip gate stays closed, Henrique (r66) stands as a single
  instance. Accept-then-abort reclassified: a designed sick veto
  (betrayal.js sick check), not a defect — class closed as explained.
  Duty counts: TENTH consecutive 0/4 for weapon-craft and deadfall-duty
  lines (armed-gate classification reproduces).
- r71 carried, taken as this run's Q2: the nod-back repeat — 85054 d90
  Nina (nonverbal sitting): the player nods twice and the NPC answers
  identically both times, "They answer at length. They nod back,
  slowly." Mechanism (code-read this run, before any scored seed):
  the foreign-react path in conversation.js (nvRespond, react branch)
  uses a SINGLE fixed narration per gesture kind (`nod: 'They nod
  back, slowly.'`), unlike the fluent nv: pool which already cycles
  through 3 variants via convoPickCycle. The r71 note cited the old
  line number; the current base has it at conversation.js:7677.
  The Boris nod-loop (r58) is a different sitting shape — not conflated.
- Carried, still open (NOT re-scored here unless evidence arises):
  fusionReactorOnline days 60–120 trace (r70 follow-up); r65 bank-trace
  finding; r63 mantle-pass proof; r58 Irving-displacement, subject-menu;
  r56 chooseAbility-unguarded note; r55 barrier pin form (guard confirmed
  working, not overturned).
- Canon (read): docs/CANON.md, docs/SCALE.md (ladder bars, one rung per
  season, national = primary + ≥3 seasoned subordinates), docs/TABLE.md
  (table prices the run, never gates on godhood), docs/CONVERSATIONS.md.

## Leg questions (binding)
1. **SCALE CONTINUITY (report-only):** fresh quad 85061–85064, r72 driver
   (r71 clone), policy scalecourt-nogate, WANT_SUBJECT=1 + GOSSIP_FIRST=1,
   DAYCAP 180, death-aware stop (+10d tail max). Report: census per seed
   (end, day, pop, pantry, rank, seat, arc, maxWave, pilgrimages),
   table-approach notes, duty counts (weapon-craft lines, deadfall-duty
   lines, wsplit classes — the ELEVENTH band for both duties), barrier-pin
   lines, pellet-beat firing per seed (report-only; the fusion trace stays
   queued unless the mechanism reads trivially off the beats). Judge
   REACHABLE / FUN / WINNABLE for the leg in plain words. No threshold is
   scored here, so no gate can be gamed; the verdicts are the report.
   PILOT GATE: seed 85061 runs first; if it crashes or pilgrimages == 0,
   STOP and report.
2. **FOREIGN NOD-BACK VARIATION FIX GATE (new work, fix only if met):**
   Diagnosis first: a new proof test (scripts/test-foreign-react-nod-r72.js)
   drives Game.nvRespond for a foreign speaker and records consecutive
   nod/smile/pointself lines. On current code the diagnosis must show the
   repeat: two consecutive nod lines sharing the identical fixed
   narration suffix.
   FIX GATE — land a src/js change ONLY if ALL hold:
   (a) the proof test is RED before (verbatim repeat) and GREEN after
   (consecutive gestures yield distinct narrations; the test asserts on
   the narration pool strings contained in the returned lines, so foreign
   text variation cannot fake the pass);
   (b) the fix varies ONLY the foreign-react narration map, through
   convoPickCycle with per-kind pools whose entries are all honest
   gesture narrations (nod pool keeps 'They nod back, slowly.' as one
   entry; same for smile/pointself — same repeat class, same map, not
   scope creep). No trust, temper, exposure, or routing behavior changes;
   (c) targeted proofs stay green (the new test, test-speak-it-back.js
   mediated-reaction section, test-gossip-r67.js, test-goal-opener-deep-r67.js);
   (d) check.js --quick shows no NEW failure vs r69's 6 pre-existing
   assertion failures (same names); any new failure blocks landing.
   If any clause fails, the item stays HELD with the diagnosis documented
   and no src/js change lands. A post-fix control re-run of the quad is
   report-only, never a re-score of Q1.
3. **PEOPLE CHECK (sense law):** read every r72 transcript in full.
   Conversations must have meaning: the NPC wants something, options
   engage or deflect it, endings resolve/plant/owe. No fabricated shared
   history, no filler loops, no static menus. Report per-transcript
   verdicts; any repeat class found is named, not averaged away.

## Metrics (bound; §14)
Census scalars unchanged from r51's list (19 scalars + covenant trusts),
plus fusion/ability columns (reads, not scores), the r61 end-state class,
weapon-craft-line and deadfall-duty-line counts, and gossip-exposure counts
(ask:gossip picks, THEM lines per transcript, sittings) from the r72 analyzer
(r71 analyzer, labels/seeds only). No metric is re-scored mid-run; doubts go
under "metric review".

## Telemetry deviation check (step 14)
After writing evidence, run telemetry-check.js against the scale-census
baseline with this run's per-seed trust JSONs. Any LOUD line is a same-run
investigation item BEFORE any baseline roll. The baseline is NOT rolled on
this run's numbers by default (r68's decision stands: the baseline sums a
different band's fates).
