# journey-scale r97 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-04T14:45CST (scheduled 14:45 CST 2026-11-04).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@f6ee419ec at branch creation (worktree journey-scale).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r96's
verdicts (pilgrimage walk works; 10/12 trips studied; 1 stale drop on
an edge tile; national 0/4 staged; people check 2/2 real). It answers
r96's single carried micro-question with the instrument r96 named.

## Standing context (read before scoring)
- r96 (2026-11-04 morning, seeds 85501–85504): 85503's trip to
  village_spl_28_58496, target (8,5) — the map's edge column — reset
  FOURTEEN consecutive courtship days: every eval at (4,4) Haven
  dist 5, every walk ending at (8,5) dist2 0, every next-day eval
  back at (4,4). Day 51: stale drop. The identical retry (d54 start)
  held on the second night (d55 walk → d56 eval AT (8,5) → study).
  All interior targets held first try. Mechanism demonstrated, mover
  unidentified: "what moves the player home between the courtship
  walk and the next morning's competent.daily on edge tiles, and why
  it stopped on the d55→56 night."
- Policy order (verified in code r96): scalecourt-nogate daily =
  competent.daily FIRST, then courtship. The overnight window between
  a walk (day N courtship) and the next eval (day N+1 courtship) is:
  sleep (end N) → 3× wait parts (morning N+1) → competent.daily
  (N+1) → courtship eval (N+1). Standing-home is gated OFF by
  default (COMPETENT_STANDING_HOME unset in the r96 driver), and
  sleep() shows no position teleport in its body — both are suspects
  to be ruled in/out by trace, not assumed.
- Canon (read): docs/CANON.md (no-silent-actions law), docs/SCALE.md
  (national = one primary with ≥3 seasoned subordinates, or
  BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season).

## Tooling (new instrument only; zero src/js)
- **mornTrace (Q1):** policy clone
  scripts/policies/scalecourt-nogate-morntrace.js = postrace clone
  (itself behavior-identical to scalecourt-nogate) PLUS logging-only
  rows in daily(): at daily entry (after sleep+waits, before
  competent.daily) `entry` {pos, hydration, pilgrim vid or -};
  after competent.daily `postCompetent` {pos, hydration, deltas of
  ctx.thirstHome / forageTrips / standingHomeDays / tripHomeDetours
  since entry}; after courtship `postCourt` {pos, pilgrim vid or -}.
  Diff vs the postrace clone must contain ONLY added logging lines
  + the export name. The standing scalecourt-nogate.js and postrace
  clone are untouched; this clone is this run's instrument only.
- Driver: scripts/journey-scale-r97-20261104.js = r96 driver,
  labels/seeds/EVIDIR only (85501–85504, DAYCAP 180), PLUS copying
  ctx.mornTrace daily and writing journey-scale-r97-morntrace-<seed>.txt
  at end. The r96 postrace output is kept (same file stem, r97 label)
  so Q1 can cross-check mornTrace against postrace eval/walk rows.
- Analyzer: scripts/analyze-journey-scale-r97-20261104.js = r96
  analyzer, labels only, PLUS a mornTrace classifier: for every
  pilgrimage day, classify the overnight move as SLEEP-WAITS
  (entry pos != previous postCourt pos), COMPETENT (postCompetent pos
  != entry pos), HELD (no move), or COURT (postCourt move — the walk
  itself). A reset is an eval at Haven after a postCourt at a target.

## Q1 — MORNING TRACE (binding; closes r96's micro-question)
**Question:** on the r96 band, which segment of the overnight window
moves the player from a courtship-walk target back to Haven, and does
the mover differ between edge targets (x=8 or y=8) and interior ones?
**FINDING clause (pre-registered, not re-scored):** the mover is
identified if ≥3 overnight resets on the band share one segment
(SLEEP-WAITS or COMPETENT) AND the corroboration matches (for
COMPETENT: a thirstHome/forage/standingHome counter delta on the
reset mornings, or hydration <45 at entry; for SLEEP-WAITS: entry
already at Haven with postCompetent unchanged). If resets split
across segments, or <3 resets occur, the verdict is INCONCLUSIVE on
count with the traced instances reported as-is — no re-scoring
against a friendlier threshold.
**What would count as interesting:** a single-segment answer with
counter corroboration (e.g. thirst-walk-home firing on edge nights
because the edge tile offers no water) — that names a fixable
policy/game interaction. A split answer is also interesting: it
would mean the reset is not one mover but a race.
**Pilot gate:** seed 85503 runs first; if its mornTrace shows no
pilgrimage trip at all, STOP and report (instrument failure, not a
game finding).

## Q2 — CENSUS CONTINUITY (report-only; r93–r96 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96)
One full sitting read in full from a surviving seed at day 90 if one
exists (85503/85504 pattern from r96); no day substitution if none
survives to day 90. Corpus size is reported, not padded. Verdict:
real vs filler/faked-history, with quoted lines.

## Metric review (carried)
- Q1's count gate (≥3 resets sharing a segment) is new for this run;
  r96's count gate (≥3 dropped trips) is NOT reused — the question
  changed from "how many drops" to "which mover", so the gate changed
  with it, stated here before any seed runs.
- Telemetry baseline: scripts/telemetry-check.js step 14 runs at
  closeout against telemetry-baselines/scale.json; baseline NOT
  rolled forward without a LOUD-line investigation.

## Fix gate (clause (a) discipline, as r96)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. Otherwise
the change set stays tooling + evidence + run note.
