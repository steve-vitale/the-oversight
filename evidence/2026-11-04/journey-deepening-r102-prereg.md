# Journey leg: DEEPENING (days 40–80) R102 — "DO VILLAGERS' LASTING GOALS STEER THEM?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r102 plays deepening, writes 2->3
at closeout. Base: master 7086b11f2 at worktree creation. Policy: competent
(pinned, r100 driver lineage + r102 changes below). Seeds: fresh 94101–94104
(fresh-band check: r100 used 93901–93904, r95 93801–93804, r94 93701–93704;
no 940xx/941xx band in evidence). Horizon: DAYCAP=100, death-aware stop.
Smoke seed 94100 (outside the main band) x DAYCAP=45 proves the r102 driver
before the main run; smoke outputs deleted after the check.

Context: the systemic villager-goals system landed live 2026-11-04 (Steve
2026-11-03 order: villagers executing a gameplan as drives — party up,
gear-check, bank veterans, build standing — reached only through
perception). The proof reported visiting companions roughly doubling with
goals on, but no journey-leg panel has yet measured goals in the wild in
the deepening window: whether villagers carry goals, whether those goals
steer dawn objectives, and whether a goal sticks across the window. This
run is that panel. It does NOT re-judge promise follow-through (r100,
carried as context: 3 DEAD / 1 SILENT / 1 NO-LATER-SITTING / 0 NAMED),
betrayal sittings (r94/r95), beast-trick teaching (r92), or the
standing/scale two-rulers finding (r93). No game change is pre-committed:
if goals read as steering, the instrument result is the finding; if they
read as absent or unreaching, the blank is documented, not redesigned
on the spot.

## Question: villager goals in the deepening window

At each convo day (45, 60, 80 — the leg's existing sitting days), the
driver snapshots every living roster villager (observer-pure reads only,
see below): stored top goal + sinceDay (`vgoalState`), full weight vector
(`vgoalWeights`, pure arithmetic), and current objective kind/state/goal/
goalLine (`objOf`). The capture log is also scanned for the eight goal
lines (the departure-line voice) as a timing-free second signal.

- G-ASSIGN (primary, descriptive + bar): share of living villagers with a
  stored top goal (non-null) at each sample day, and share with a nonzero
  top weight. INTERESTING if coverage is >= 50% on >= 2 sample days
  (goals are a live layer in this window) OR if coverage is ~0 on all
  sample days (the system is not engaging here — a blank).
- G-STEER (primary): among living villagers whose current objective
  carries a goal annotation (`obj.goal` non-null, objective state not
  done/returning), share whose objective kind belongs to that goal's
  kind set (party_up/build_standing->VISIT; gear_up->FORAGE/TRAPS;
  bank_veterans->HUNT; food_security->FORAGE/WATER/HAUL; bonds->
  VISIT/HAVEN_CHORE; knowledge->SEEK; safety->HAVEN_CHORE). Also reported:
  annotated share of all living villagers' objectives per sample day.
  INTERESTING if annotated share is >= 25% on any sample day (goals
  visibly steering) OR if annotated share is 0 while G-ASSIGN coverage
  is nonzero (goals assigned but not reaching objectives — a wiring
  blank). Stale objectives (state done/returning) are reported
  separately, never counted as steered or unsteered.

## Prereg amendment #1 (pre-scoring: written after the smoke seed proved
the driver, before any scored seed ran)

Smoke-seed inspection (94100, deleted per the prereg) plus a code read
found that `objPick` resets stale hunt/chore tags on a fresh pick but
does NOT reset `o.goal`/`o.goalLine` when the drawn candidate carries
no goal boost (src/js/villager-objectives.js: only line 517 writes
`o.goal`, inside `if (chosen.vgoal)`). A villager whose new objective
was not goal-boosted therefore keeps the previous objective's goal
annotation — and the departure line appends `obj.goalLine`
unconditionally, so a stale goal line can be spoken for an objective
the goal did not boost. Consequence for G-STEER: a FRESH annotated
pick is coherent by construction (vgoalBiasCands annotates a candidate
only with a goal whose kind set includes the candidate's kind, and
objPick sets kind + goal together), so any annotation-kind MISMATCH
among non-done/returning objectives is evidence of stale carry (or,
caveat, a post-pick kind mutation — both worth a look, neither
counted as incoherent steering). The amendment therefore splits
G-STEER into (a) annotated share (as above) and (b) mismatch share
among annotated non-done/returning objectives, reported as
stale-carry evidence: INTERESTING if mismatch > 0 on any scored seed
(a villager speaking a previous errand's reason — a sense defect to
verify against the capture log), in addition to the original
annotated-share bars. No scored seed has run; no metric is re-scored.
- G-STICK (primary): for villagers alive at all three sample days,
  share whose stored top goal is identical across 45->60->80 (the
  commitment promise: pursuits, not daily dice). INTERESTING if stick
  is >= 50% (commitment holds) OR if stick is < 50% with n >= 5
  (commitment not holding in the wild — a finding, not a defect claim
  on its own; weights move with state by design).
- G-SENSE (primary, strict): 0 SENSELESS sittings among all transcripts
  read in full. A sitting is SENSELESS only on a full read
  (contradiction, voided thread, fabricated history), never on a count.
- Carried, not re-judged: K-CONTEXT (lessons ok/total, moots,
  proposals), M5 winnable (descriptive, by endReason), STAY-GREEN
  (0 mislabels), rotation bound (max consecutive dlg:more/dlg:details
  <= 2), S-TRACE (standing verdicts, reported not judged),
  blocked-agreement (r100 fix regression check: every `blocked` entry
  has no same-day sitting with that villager).

## Observer purity (why the snapshot cannot steer the game)

The snapshot calls ONLY: `vgoalState` (reads/creates the stored
`{top, sinceDay}` record — the dawn lottery creates the same record on
first objPick, so no gameplay value changes), `vgoalWeights` (pure
arithmetic over character axes + perceived state, no RNG, no writes),
and `objOf` (read of the current objective). It NEVER calls `vgoalTop`
(which runs the commitment write) or `vgoalBiasCands` (which writes
weights onto candidates). The snapshot therefore reports the top goal
the last dawn lottery committed, not a fresh computation. Departure-line
goal counts come from the ordinary capture log, not from a new hook.

## R102 driver changes (harness only, zero game code)

1. Seed band 94101–94104; all output filenames r100 -> r102.
2. New `goalSnap(ctx)` in the daily hook on CONVO_DAYS, before sittings:
   per living roster villager `{vid, name, top, sinceDay, weights,
   objKind, objState, objGoal, objGoalLine}`; stored on
   `ctx.goalSnaps` by day and emitted in the per-seed JSON.
3. Analyzer gains a G-scan: G-ASSIGN / G-STEER / G-STICK from
   `goalSnaps`, plus a capture goal-line count per seed (transcripts
   are not re-scanned for lines; the capture-derived count is the
   timing-free signal). S-TRACE, K-CONTEXT, B-SIT, P-KEEP scans carried
   from the r100 analyzer unchanged.
4. Proof test: observer-purity (two snapshots leave the stored
   `vgoals` record byte-identical and weights identical) + analyzer
   G-scan on synthetic JSONs (assigned/steered/stuck/churned/stale
   shapes).

## Metric review (carried open items, not this run's bars)

- P-KEEP floor (r100 metric review): a future promise verdict needs
  >= 3 revisited-alive threads before the proportion judges anything.
  This run does not re-judge P-KEEP; promise threads are reported only
  as carried context if the analyzer surfaces them.
- Promise vs need (r100): need re-presentation is a softer signal than
  promise-naming; a future instrument could score them separately.
- Declined-thing plants (r95 open, still open): declines leave a
  pocketed thing never revisited in-window. Still open; needs its own
  pre-registered question.

## Canon note

No docs/ canon doc covers villager goals specifically (CANON.md manifest
searched: no goals entry). The governing records for this run are the
ontology header of src/js/villager-goals.js (perception-only scoring,
character weights, no-new-verbs, no gate changes, additive-no-RNG,
persistent commitment, narration) and Steve's 2026-11-03 order for the
systemic goals system, under the standing perception law (villagers
know who's around only through their own senses). The governing rule
for judging is Steve's sense-testing law (2026-10-11): a goal that
never shows in behavior is a villager who does not pursue — a people
blank, not a count defect.
