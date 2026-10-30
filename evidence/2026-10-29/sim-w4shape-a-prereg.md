# sim-w4shape-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0320Z (coordinator-assigned
worker sim-w4shape-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). DIAG arm, MEASUREMENT ONLY — zero src/js game changes,
no default flip, no wave-4 lever built on this run.

## The blank (from prior evidence, not re-judged here)

Finding #1437 (evidence/2026-10-29/sim-breakline-a.md) records the
W4DPR2 band no longer reproduces (wave-4 wild meetings 24 -> 9, on
1/8 seeds, build-armor drift) and orders: re-baseline wave 4 before
any wave-4 lever judgment. The tracker direction for the next arm is:
change what a fight is for (here: wave-4 meeting shape) — NOT re-count
heads, NOT re-narrate endings, NOT lower win-prices. This arm supplies
the current, citable wave-4 baseline that order requires.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
gate village standing >= 100, earned by blood/bonds/bread, never pure
calendar; 9 monsters; bands damage 35-95, HP 850-1500, pierce 0.2-0.5;
a 4-6 round fight for a godhood build). NO CANON-registered doc covers
a wave-4 meeting-shape census specifically — the shape/outcome
taxonomy below is code-derived from the recorders' own fields and
stated exactly so it can be checked. Governing canon rules: CANON.md
"Monster encounters are fought, not rolled" and the perception law
(Steve 2026-10-28): tile-mate presence below is REPORTED from recorded
state only (fieldparty `tile`, a pure nodePos read) — never fed into
any decision, never a roster feed.

## Band and substrate (binding)

- Seeds 75101–75108 (8, the shoutrec/breakline/joinendlines pilot
  band verbatim), 180d death-aware, scripts/policies/tableseat-nowait.js
  VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1 — the full
  joinendlines recorder stack, every recorder reused verbatim, never
  edited. This matches sim-joinendlines-a.md and its prereg exactly.
- NO NEW RECORDER: this arm installs no new engine wrap. Every field
  the census needs already exists in the stack: shape from fieldparty
  `channel`, caller from fieldparty `caller`, tile presence from
  fieldparty `tile` (excluding deadKnown), fighter gear from fieldparty
  `leader` (armed, armorP, veteranW3) + w4dpr `loadoutPost`
  (melee/ranged/carriedWeapons), outcome/rounds from breakline/w4dpr,
  flee sub-shape from breakline `branch`, transcripts from w4dpr
  `log` (stored verbatim for wave 3/4 only). The only new code is
  scripts/test-w4shape-a-sweep.js (a copy of the joinendlines sweep
  writing to perseed-w4shape-a) and scripts/test-w4shape-a.js (a pure
  analyzer: reads corpus JSON, never touches game state).
- RE-DERIVATION CLAUSE (backlog #1457 substrate drift, binding): this
  run's own corpus IS the baseline. Do NOT quote shoutrec /
  partycounter / breakline / joinendlines band numbers as current.
  Comparisons to breakline's wave-4 counts are drift diagnostics only,
  never GO/NO-GO legs. If this corpus diverges from breakline's,
  the divergence is reported, not forced.

## Universe and taxonomy (binding, fixed here)

UNIVERSE: every joined row with fieldparty wave == 4, all channels,
all callers, scholar-led included (scholar-led rows are flagged as a
sub-row, never silently pooled or silently dropped — breakline's
judgedA universe excluded them, so a wave-4 census that copied that
filter would hide real wave-4 meetings).

SHAPE (meeting shape = fieldparty `channel`, verbatim):
- wild = channel 'field'; raid = channel 'raid'; other = channel
  'other'. Wild-judged sub-count for breakline comparability (reported
  alongside, never substituted for the shape split): channel 'field'
  AND caller in {resolve, patrol, aid} AND leader NOT scholar.

OUTCOME (one class per meeting, in this order):
- PRE-CONTACT-SCATTER: rounds < 1 AND outcome mFlee (beast leaves
  before contact — the breakline modal ending, now measured at wave 4).
- PRE-CONTACT-KILL: rounds < 1 AND outcome vKill (round-0 volley kill).
- KILL: rounds >= 1 AND outcome vKill.
- DRIVE-OFF: rounds >= 1 AND outcome mFlee.
- FLEE: rounds >= 1 AND outcome vFlee, sub-split by breakline branch
  (HOPELESS-BRANCH / FLOOR-BRANCH / LEARN-BRANCH / CAP / TRICK-EXIT).
- DEATH: rounds >= 1 AND outcome vDie.
- OTHER: anything else (including rounds < 1 with any other outcome).
  OTHER > 0 fails COMPLETENESS (see below) — the taxonomy must assign
  every wave-4 meeting, or say why it cannot.

SOLO vs TILE-MATE PRESENCE (recorded state only): tile-mate present
iff fieldparty `tile` filtered to deadKnown !== true has length >= 1
(the breakline convention); else solo-tile. This is a report split,
never an input to any decision.

FIGHTER GEAR AT MEETING: fieldparty `leader` (armed bool/null,
armorP, veteranW3) + w4dpr `loadoutPost` (melee, ranged,
carriedWeapons), preferring post (gearUp at entry can change equipped)
with pre as fallback, disclosing which was used. Armor is reported as
the recorded armorP number; no armor effectiveness is claimed.

WAVE-4 KILL COUNT (headline): fought vKill count (rounds >= 1),
reported per shape, per seed, and band-total. Pre-contact kills are
reported alongside, NEVER pooled into the headline silently.

FIRST MET PER SEED: the first universe row in call order per seed:
day, channel, caller, monster id, leader, outcome, rounds, tile
presence, gear. A seed with zero wave-4 meetings reports "none" — a
zero is data, not a missing row.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 8/8 valid seeds (days > 0) AND every
  recorder (fieldparty, w4dpr, breakline, shoutrec, tilejoin,
  joinendlines) errs 0 with overflow empty AND joins 100% (all six
  recorders index-aligned per seed; mid/vid/day match at every index;
  join errors 0) AND every universe row assigned a shape + outcome
  class AND OTHER = 0.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a scratch
  EVID dir; its row JSON byte-identical to the corpus row. Scratch
  dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): >= 3 wave-4 meeting transcripts read
  end to end (w4dpr verbatim logs), OR all fought wave-4 meeting logs
  read when fewer than 3 fought wave-4 meetings exist in-band. The
  read set must include at least one transcript of each outcome class
  present in-band when that class has a log (pre-contact meetings
  have no fight log — they are never counted toward the sense bar).
  Judgment is meaning/coherence/consequences, not counts (SENSE-
  TESTING LAW).
- FIXTURE BAR (blocks judging): scripts/test-w4shape-a.js must prove,
  before the corpus is judged, on synthetic rows: every outcome-class
  mapping above (including pre-contact scatter vs kill, fought kill
  vs drive-off, vFlee branch sub-split, and OTHER on an unknown
  outcome), the tile-presence rule (deadKnown excluded), and the
  shape mapping (field/raid/other + wild-judged filter).

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + DETERMINISM PASS + SENSE PASS +
  FIXTURE PASS + one RANKED NEXT named with numbers (which meeting
  shape, if any, is the bridgeable wave-4 question — a ranked next,
  NOT a build in this arm).
- A completeness/determinism/sense/fixture failure is DIAG-NO-GO.
  Below-minimum-n on any shape is reported as INSUFFICIENT-DATA for
  that shape, never as GO for it.
- STALE-BAND VERDICT (reported, not a GO leg): "REPAIRED" iff this
  run produces a complete, deterministic, citable current-master
  baseline (the stale W4DPR2/breakline band numbers are superseded,
  not reproduced). "STILL DRIFTING" iff completeness or determinism
  fails. Separately, drift-vs-breakline is reported as a diagnostic:
  per-seed wave-4 meeting totals now vs breakline's (9 total, seed
  75108 only) — movement there means the base moved again, not that
  this census is wrong.
- LEVER LICENSE (reported, not a GO leg): a wave-4 lever judgment is
  licensed for a shape iff that shape has >= 5 meetings in-band
  (fought + unfought). Below 5, any lever on that shape is
  INSUFFICIENT-DATA. The license sentence names each shape's n and
  verdict.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.

## Neutrality basis (disclosed, not re-proven)

No new engine wrap is installed, so there is no new neutrality surface
to prove. The recorder stack is the joinendlines stack, whose
before/after legs were byte-identical after stripping log arrays
(sim-joinendlines-a.md: NEUTRALITY GATE PASS, wall numbers identical
per seed). This arm reuses that stack verbatim on current master; the
determinism gate above proves this run's own pipeline reproduces.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep + analyzer + fixtures), committed before the
   judged sweep is analyzed (fixture bar green first).
3. Sweep (8 seeds), determinism gate (one seed, scratch dir, removed
   after diff), >= 3 sense transcripts read end to end.
4. Evidence evidence/2026-10-29/sim-w4shape-a.md with header-vs-result,
   shape-split tables, wave-4 kill count, first-met per seed, stale-
   band verdict, lever license, and a RANKED NEXT.
5. No src/js change, no push, no bump, no live verification. Report
   'merged locally, pending ship' readiness (coordinator merges).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js). Seed
Math.random BEFORE eval (modules capture it at load). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-w4shape-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
