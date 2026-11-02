# sim-deadid-a — PREREG (written BEFORE any judged sim in this arm)

Arm: dead-id exclusion BUILD, Loop A run fleshout-loop-a-20261102T1515Z,
axis scale-onramp. Claimed backlog item #1823, build half only.
Follow-up to sim-rosterreturn-a (DIAG-GO, evidence/2026-11-02/
sim-rosterreturn-a.md) and sim-bearerorder-a. This arm BUILDS the
exclusion; it does not re-diagnose the mechanism.

## Background (proven, not re-litigated)

Rosterreturn traced, seed 97330, closecommit stack: membership.js
genApplicant() builds its `used` set from the CURRENT roster +
pending applications only — no dead/fallen check — so it re-draws
Nora Wilson from background_survivors.json after her d106 death.
She re-applies d109, is auto-accepted (thin-village rule), arrives
d111 endDay (arrivalTick appends her id last, trust 90 intact,
vpDead still true, ensureRosterPerson early-returns without clearing
dead), and wins the mantle d112 because betrayal.js npcIds() has no
dead filter. The return IS narrated but identity-blind: no line notes
she is the woman buried d107.

## Scope — exactly ONE, named here (never bundled)

(a) EXCLUSION BUILD ONLY. The minimal coherent gate set, both gates
in src/js/membership.js, one system, one commit:

1. genApplicant: exclude dead-flagged ids from the background pool.
   Dead = rec.dead true on the data.villagers record OR on the
   background_survivors record OR vpOf(id).dead (covers hydrated
   rosterChars records). The used-set rule is unchanged otherwise.
2. arrivalTick: refuse a dead-flagged arrival at walk-in time — drop
   the arrivals entry, NO roster push, NO trust assignment, NO
   walk-in line. This is the backstop for applications accepted
   BEFORE the applicant died and for any other queue path that
   already holds a dead charId. The refusal carries one generic
   honest non-arrival line (the dead don't walk in; no silent
   drops) — that line is NOT identity-aware narration.

Explicitly NOT in this arm, never bundled, never snuck in:

(b) Identity-aware narration (a line noting the applicant IS the
villager the village buried) is a SEPARATE future arm. No such line
is written here, and the refusal line above must not name the
burial, the grave, or the prior life.
(c) No npcIds() dead filter. Succession ordering is bearerorder's
territory and its rule is unchanged here. The entry gates close the
re-application path that fed succession a dead candidate; whether
succession itself should ALSO filter the dead is a separate call,
listed as open at closeout, not built here.
(d) No change to removeVillager death marking, trust preservation,
ensureRosterPerson hydration, auto-recruit thresholds, or the
drifter fallback. No policy-file changes.

## Code hypothesis (read BEFORE any judged sim; to be confirmed or killed)

- Gate 1 kills the traced chain at the draw: with Nora dead-flagged,
  genApplicant's filtered pool cannot return her id, so no d109
  application, no auto-accept, no d111 push, no d112 mantle.
- Gate 2 is unreachable on the traced chain (gate 1 fires first) but
  closes the accepted-before-death hole: a dead charId already
  queued in arrivals never reaches the roster.
- Both gates read the SAME dead mark removeVillager sets
  (betrayal.js ~1166: rec.dead = true on the villagers-or-bg
  record), so no new death bookkeeping is introduced.
- Rival hypothesis to be killed by the instrument: the dead mark
  lives on a record genApplicant cannot see (e.g. villagers and bg
  entries are divergent copies and only one carries the mark). The
  triple-source check (villagers + bg + vpOf) is built to kill this;
  if the proof test's live harness shows a dead-flagged id still
  drawable, the arm is NO-GO and the mark's true home is reported,
  not papered over.

## Canon

docs/CANON.md read first. No canon doc covers applicant generation,
arrival, or bearer succession ordering specifically (MONSTER-WAVES.md
covers wave law, not membership intake; the intake rules above are
read from src/js/membership.js, stated as code-read, not invented
canon). The "no silent actions" standing rule is why the arrival
refusal narrates its non-arrival generically.

## Primary metric (pre-registered, binds this arm)

Seed 97330, closecommit stack verbatim (see Seeds below), 180d cap,
death-aware (run ends early on village-lost / win as the harness
reports). Post-fix run, judged on the sweep driver's traps:

1. ZERO genApplicant draws returning charId or id nora_wilson at
   any point in the run (and zero dead-id draws of ANY id, where
   dead is judged at draw time by the same triple-source check).
2. ZERO dead-id arrivals (arrivalTick refusals logged, if any, with
   no roster push following).
3. Nora never on the roster after d106 (no reappearance in daily
   snapshots or roster traps).
4. Nora never bearer after d106.

## GO threshold (pre-registered, strict)

BUILD-GO ONLY if ALL hold:

- Primary 1–4 all hold on seed 97330 post-fix, AND the same seed's
  pre-fix (baseline) run reproduces the rosterreturn chain
  (application d109, arrival push d111, mantle d112 — snapshot-day
  labels per rosterreturn's metric review) so the comparison is
  real, not a stack that stopped reproducing.
- Guardrails G1–G4 all hold (below).
- Proof test scripts/test-deadid-a.js is RED pre-fix and GREEN
  post-fix (live harness: dead-flagged id undrawable by
  genApplicant AND refused by arrivalTick; plus sweep-JSON
  analysis of the judged runs).

A miss on any item is NO-GO, never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review" for the NEXT
run. A fix that kills the Nora chain but breaks applicant flow, or
that passes only by changing the policy stack, is NO-GO.

## Guardrails (pilot band, before/after on identical seeds)

G1. DET-GATE. Per-seed death days/names, endReason, survival days,
application counts, and arrival counts are byte-identical baseline
vs post-fix on every pilot seed where baseline drew no dead
applicant and arrived no dead id. Only dead-draw seeds may differ,
and only from the first dead-draw day onward. (Why this is
checkable: the gates consume no RNG and change no state unless a
dead id is drawn or queued, so untouched seeds must replay exactly.)
G2. APPLICANT FLOW INTACT. Band-wide post-fix application total and
arrival total are each within ±3 of baseline, and no pilot seed goes
from >=1 applications at baseline to 0 post-fix. (The drifter
fallback in genApplicant guarantees the pool is never empty, so a
dead exclusion must never starve intake.)
G3. NO NEW ERROR CLASS. The sweep driver's errors lists post-fix
contain no entry type absent from baseline (anchor/commit strings
excluded).
G4. PANEL GUARDRAIL (instrument, not judge). Balanced panel
(scripts/balance-panel.js, capable policy, pilot seeds, 180d)
before/after compare decision is no_material_signal, OR any signal
is investigated and explained in the evidence file before verdict.
Panel limitation, stated up front (as in creekwood): the panel runs
named registry policies only and cannot express the closecommit
stack, so it guards against broad regressions; the sweep driver is
the judged instrument for the dead-return metric.

## Seeds, horizon, policies

- PILOT GATE: 8 seeds before/after before ANY confirm spend:
  97330 (mandatory — the traced chain), 97338 (rosterreturn's
  second seed), 97331, 97332, 97333, 97334, 97335, 97336.
- CONFIRM (only if pilot GO): 12 seeds before/after = pilot 8 plus
  97337, 97339, 97340, 97341.
- Horizon: 180d cap, death-aware (same cap as rosterreturn /
  bearerorder; dead villages stop simulating, +10d tail max per
  loop method). Never a fixed 200d.
- Policy stack: the rosterreturn/bearerorder closecommit stack
  VERBATIM (scripts/policies: leadfeast + windefer + seatdrive +
  fullseat-diag, then titanroute + musterclose + mustergap
  commit-own; env flags FEASTSCALE_R13, TRIBFLOOR, WINPURSUIT,
  WINDEFER, SEATDRIVE, FULLSEAT, HERALD = 1). Reproduction
  scaffolding, not a re-landing. Policy files unchanged.
- Proof scripts: scripts/test-deadid-a.js (RED pre-fix, GREEN
  post-fix), scripts/deadid-driver-20261102.js (sweep instrument),
  scripts/sweep-deadid-a.js (band runner: baseline/post-fix,
  det-gate diff, panel compare invocation).
- SENSE-TESTING LAW: read the transcript lines around the d109
  application window post-fix (expect NO Nora application line) and
  judge whether the village's remaining application/arrival lines
  still read sensibly. Report the snippet verdict in the evidence
  file.

## Metric review (for the NEXT run, not this verdict)

To be filled at closeout: whether the triple-source dead check
needs a single canonical helper (isMember already encodes
on-roster + alive — whether intake should reuse it), whether the
det-gate's "only dead-draw seeds may differ" rule survives a fix
that changes pool composition (it does here only because the
filter, not the draw, changes), and whether npcIds filtering
belongs in a follow-up arm.
