# sim-fedevening-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1430Z,
arm sim-fedevening-b, axis food-economy. Worktree sim-fedevening-b.
POLICY PROTOTYPE ONLY: one new policy file
(scripts/policies/fedevening-diag.js), zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. Sibling
trees never touched; main tree never touched. The coordinator merges;
this worker does NOT push, bump, or verify live.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts;
bridge 96 ticks + 60 kcal; fell 96 ticks + 80 kcal; gatherFallen 16
ticks + 10 kcal, bare-hands, no tool gate; forage 16 ticks + 60 kcal)
and docs/PRESERVATION.md (the ladder; unknown food is not food until
identified — eat() refuses edible===false items). No canon doc covers
the strand-fix blank itself — stated here instead of inventing canon.
Standing rules that bear on it: "no silent actions" (every act
narrated), perception law (Steve 2026-10-28: decisions from what the
villager senses — its own tile, its own pack, its own clock, the
detail grid it stands on; the probe reads only those, plus the
previous evening's woodcarry record, which is its own lived evening),
and "if you don't know, it doesn't show" (pack unknowns carry
kcalEach 0 and can never be eaten).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-morningcarry-b.md (NO-GO: daily haven
  packing re-routes the whole trajectory; fed-but-ticks-short is
  real; wood-bleed still blocks fed evenings).
- evidence/2026-10-31/sim-windowcarry-b.md + sim-windowcarry-b-prereg.md
  (NO-GO: a bounded pre-strand bank still moves the strand earlier
  on 15215 and creates a new late stranding on 15337; fed-but-ticks-
  short re-measured; wood, not kcal, binds the strand's tail).
- evidence/2026-10-30/sim-strandfix-morning-b.md (NO-GO: morning
  recovery feeds but never converts a both-evening; tool gate is
  fourth gate; fell cost strands the one morning it succeeds).
- evidence/2026-10-31/sim-tickfell-a.md (NO-GO at pilot: zero
  attempts; tool 7/7, kcal-floor 7/7, ticks 4/7 on wood-short
  strand mornings; axe never held on this stack).
- evidence/2026-10-31/sim-jointgate-b.md (DIAG-GO: joint
  fed+axe+roomy never holds on any strand morning; axe seeds don't
  strand, the strand seed has no axe; morning kcal collapses
  overnight; the fix's precondition must co-occur with the strand).
- evidence/2026-10-30/sim-warmthrestr2-b.md (R1/R2 GO
  GUARD-EQUIVALENT: never spending bridge logs reproduces the
  3-night guard strand exactly, with ZERO warmth benefit retained —
  "no middle" between unconditional warmth (trap) and never lighting
  (guard), on this bank. This arm tests the one middle R1/R2 did
  not test: lighting fires with branches instead of logs.)

## The design decision (worker call, justified)

FEDEVENING: a strand-EVENING deadfall branch-fire substitution.
It acts AT the strand (on a still-creek evening, after the bridge
attempt has already failed), never before it — so the trajectory
up to the first still evening is untouched by construction, and
the windowcarry/morningcarry re-route failure mode cannot occur.
It needs NEITHER of the two gates that killed every prior morning
arm: no axe (gatherFallen is bare-hands, no tool gate) and no food
(it does not feed anyone; it burns branches, not calories, for
warmth). It names its failure precisely: WOOD-BLEED — the warmth
fires on still nights spending bridge logs (ON leg: 4 successful
log fires, nights 9/11/12/13, pack 4 -> 0) — reckoned jointly with
TICKS (every verb tick-gated; the rescue itself needs 96 evening
ticks). It explicitly does NOT address: kcal-short evenings (a
branch fire is not food; days 8-9 stay stranded on kcal), the
ticks-short day-7 evening (47 ticks cannot hold a fire; gather
only), the tool gate for felling (never attempted), or the 15337
day-20 retry-refusal (bridge built, retry refused, combat
intervened — a different blank, documented as out-of-scope below,
NOT claimed as wood-bleed).

The mechanism, in order, on a still-creek evening (woodcarry bucket
creek + rescued false), AFTER inner.daily (the bridge attempt):

1. GATHER (max 2 gathers, max 2 walk steps): while branches < 2,
   find the nearest deadfall cell (tree/bigtree/bush/thicket) in
   the occupied tile's 9x9 detail grid by the strandfix BFS
   (non-blocking cells; stance adjacent to the target; smallest
   path, bigtree > tree > bush > thicket tie-break, row-major);
   if the stance path is > 2 steps, miss 'deadfall-far'; walk it
   by microMove (1 tick + 2 kcal/step, each step requiring
   ticksLeft >= 11, the +10 no-day-roll margin); gather via
   Game.gatherFallen (16 ticks + 10 kcal, requiring ticksLeft >=
   26, the same +10 margin). Each gather yields 1 branch (30% 2)
   + bark strips on tree/bigtree (disclosed side effect: bark
   enters the pack and could feed later routine crafting; measured
   via guardrails, never assumed away).
2. FIRE (only if branches >= 2 — NEVER on branch fuel shortage,
   because fireFuel() falls back to a LOG when branches < 2 and
   this arm must never spend a bridge log itself): if a fire is
   already near, miss 'fire-near'; if no fire ground in the 3x3
   around the villager (woodwarm's fireGroundOK + non-plot test),
   miss 'no-ground'; if ticksLeft < fireCost + 10 (fireCost 48,
   32 with beard_moss, 8 with lighter — woodwarm's rule), miss
   'ticks-short-fire' (branches kept; see below); else
   Game.makeFire (friction lottery is the engine's own; a failed
   attempt spends kcal/ticks but no fuel).
3. THE SUBSTITUTION (the point): the wrapper sits INSIDE woodwarm
   — warmed(fedevening(woodcarry(nighttravel))). After this
   policy returns, woodwarm evaluates on the new state: a lit
   branch fire reads nearFire -> miss 'fire-near'; unlit branches
   >= 2 read -> miss 'branches-available'. Either way NO LOG FIRE
   lights that night, and the bridge logs stay in the pack. On a
   night where branches stay < 2, woodwarm proceeds exactly as
   before (a log fire may light; recorded in the warmth record,
   not hidden).

Say lines (one per still evening acted on, never silent, never
prescient — the villager does not know a strand is coming, only
that tonight it sleeps out and its logs are bridge wood):
- fire lit: "A branch fire takes the night — the bridge logs stay
  in the pack."
- fire failed (friction): "The branches are laid, but the fire
  won't catch — the logs stay in the pack regardless."
- gather-alone, branches >= 2, no fire (ticks/ground): "Branches
  gathered for the night — the bridge logs stay in the pack."
Gather and fire verbs also carry their own engine lines. No line
claims warmth when the fire failed.

## The chain under test (and the JOINT gating condition)

Control ON strand (fresh legs, this base): still 7-16. Night 7:
ticks-short, no fire either way. Nights 8-9: kcal-short evenings
that stay stranded regardless (branch fire is not food) — but
their nights must not spend logs. Night 10 (predicted): fed
(kcal >= 60), roomy (ticks >= 96), and — if nights 8-9 preserved
the wood — wooded (4 logs) -> bridge -> RESCUED. The strand
falls 10 -> 3 (days 7-9), the guard strand length, WITH fires
lit — the middle R1/R2 proved does not exist under restraint.

JOINT GATE (the fix's precondition must co-occur with the strand —
jointgate's lesson, frozen here): a LINKED RESCUE is a variant
rescued evening D such that ALL hold: (a) D is inside that leg's
control still range (ON 7-16, guard 7-9); (b) wood at D is 4;
(c) some still evening E < D on the same leg carries a fedevening
record with branchesAfter >= 2 AND that night's warmth record
spent no log (miss 'branches-available' or 'fire-near', logSpent
0/null — i.e., the substitution demonstrably blocked the log
fire). A rescue with no such E is unlinked and does not pass
clause (a), however large the fall. A fall with no rescue inside
the control range is re-route prevention, not this chain, and
does not pass clause (a) either (windowcarry's lesson, kept).

## Substrate (asserted FATAL in the driver)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
FEDEVENING=0 (control/OFF) / 1 (variant), DAYS=30, MORNINGCARRY,
WINDOWCARRY, STRANDFIX, PRESSB all unset/0 (each FATAL if 1).
Control legs run through the existing trace driver (unmodified,
FEDEVENING unset); variant and OFF legs run through the new
fedevening driver (same warmed stack, fedevening wrapper inside
woodwarm, gate 0 = OFF). OFF legs must reproduce the control legs
exactly on per-seed creek/still/rescued counts (det-gate, as in
windowcarry/morningcarry). RNG-stream note: variant legs gather
and fire on still evenings only; post-first-still-evening
divergence from control is EXPECTED and is the mechanism, never
hidden — but pre-first-still-evening trajectory identity is
required: ON/OFF variant evenings must match control evenings
exactly through loop-day 7 (the first still evening) on 15215;
any earlier divergence is an instrument failure and the arm is
KILLED, not judged.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead
villages stop simulating; the +10d tail is the harness's own end
handling). 30 days covers the whole control strand (guard nights
7-9, ON nights 7-16, plus the day-17/18 tail) and 13 post-strand
guardrail days, and matches every prior strand arm's census
window, so counts compare exactly. A 150-day panel would measure
a different question on a different substrate and cannot express
this stack (see §15 below). Wall numbers (national/table/wins)
are NOT observable on a 30d pre-seat census and will be reported
as such, not fabricated.

## Primary metric + GO threshold (judged exactly as written)

Primary metric: the stranded-evening census on seed 15215, guard
+ ON legs, extracted exactly as in morningcarry/windowcarry
(still = woodcarry bucket creek + rescued false; rescued =
bucket creek + rescued true; strand = maximal run of still
evenings on consecutive loop-days).

GO iff ALL of:
  (a) still-count FALL >= 2 on the 15215 ON variant leg vs its
      same-WOODWARM control leg, AND at least one LINKED RESCUE
      (joint gate above) on that leg. Guard leg reported, not
      barred here (guard has no log fires to substitute; any
      guard shortening is a secondary finding, any guard
      lengthening fails clause (b)).
  (b) strand length does NOT increase on EITHER variant leg vs
      its control (total still count AND maximal still-run, both
      non-increasing), on EVERY seed (15215 plus any surprise
      strand seed in the confirm band).
  (c) GUARDRAILS (all must hold):
      - no earlier vessel death / game-over day on any seed's
        variant leg vs its control (vessel death = first
        morning vesselId succession, or game-over day);
      - no new death mode: no death cause on a variant leg
        absent from that seed's control leg (whole deaths-list
        scope, as in prior arms);
      - no newly ticks-short still evening on any seed
        (per-leg ticks-short still-evening count <= control);
      - no increase in creek still counts on any seed
        (control 0 -> variant must be 0; this is the
        windowcarry-15337 creation guardrail);
      - starvation cost bar (sim-scalemetric): total
        starvation deaths across the confirm band, guard+ON
        pooled — deaths-list entries whose serialized form
        contains 'starv' (case-insensitive) — variant total
        <= control total + 2;
      - median survival on the confirm band not worse than
        0.8x control (both legs pooled: variant median
        daysAlive >= 0.8 * control median daysAlive);
  (d) INSTRUMENT INTEGRITY: zero driver errors on judged legs;
      det-gate OFF == control on every seed, both legs;
      determinism re-run of the 15215 ON variant leg
      byte-identical; pre-first-still-evening identity through
      loop-day 7 on 15215 (see Substrate); no policy verb
      ever spends a bridge log (every fedevening fire record
      with fuel kind wood is an instrument failure and the
      arm is KILLED, not judged).
Otherwise NO-GO. A GO with zero branch fires lit is NOT a
warmth-preserving GO: if strand = guard strand (3) but branch
fires lit = 0 on all strand nights (preservation via
gather-alone only), the verdict is GO (GUARD-EQUIVALENT) with
the warmth benefit recorded as 0 — the R1/R2 interpretation
rule, kept. GO (WARMTH-PRESERVING) requires clause (a)-(d)
PLUS >= 1 branch fire lit on a 15215 ON strand night.

## Staging

- PILOT (sniff only, never judged): 8 seeds
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337), ON
  variant leg only. Pass iff 8/8 files present, errs 0, every
  15215 ON still evening carries a complete fedevening record,
  the gather/fire gates are evaluated on real 15215 still
  evenings (act or honest miss with reason), and pre-first-
  still-evening identity holds through loop-day 7. Pilot files
  are NEVER mixed into judged corpora.
  - If the pilot shows ZERO gathers on 15215 (no deadfall in
    reach of any strand-evening stance): the design is
    unreachable on this stack — arm KILLED-AT-PILOT, verdict
    DIAG (deadfall unreachable at strand evenings; the
    mechanism cannot fire), NO confirm spend. A confirm
    could not change a zero-denominator verdict (tickfell
    staging precedent).
  - If the pilot shows >= 1 gather on 15215: proceed to
    confirm. (A gather is not a rescue: conversion is the
    judged outcome.)
- CONFIRM (judged): 12 seeds x 6 legs (guard/ON x
  control/variant/OFF) + determinism re-run of the ON variant
  leg (byte-identical corpus required). Confirm seeds: the
  10-seed bank (15003, 15009, 15091, 15211, 15215, 15220,
  15221, 15337, 15376, 15439) + 15005, 15007 (fresh seeds,
  stated here; all legs re-run fresh, so no inherited data).
- SENSE TEST (law): read the say lines of every acted still
  evening on 15215 (gather lines, fire lines, substitution
  lines, bridge lines) and the dawn lines after branch-fire
  nights end to end. The fix must be NARRATED, never silent.
  A conversion with no narration in the transcript is a sense
  failure even if the census passes. A line claiming warmth
  on a failed fire is a sense failure. The substitution lines
  must NOT mention the strand as foreseen (the villager knows
  only tonight's sleep-out and its logs).

## §15 panel (applicability, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract
(registry policies, community-exposure rows, 150d win/vest
scorecard). It cannot express the nighttravel+woodcarry+woodwarm
strand stack, the 30-day creek-evening census, or an env-gated
single-mechanism probe — the same declaration every prior strand
arm made and every coordinator accepted. The comparison here is
control-vs-variant legs on identical seeds through the census
analyzer, and is never labeled a panel comparison. The paired
compare is evidence/2026-10-31/sim-fedevening-b-compare.md,
generated from the census JSON. If the panel tool is invoked on
this corpus it will be recorded with its output verbatim; no
panel result is fabricated.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by re-scoring:
- Whether a branch fire (128 burn ticks) lasts till dawn and
  protects on cold nights as a log fire (192) does: the benefit
  metric counts fires lit, but cold-night protection itself is
  only observable via dawn lines / morning health on cold nights
  in the confirm band. If the band holds no cold strand night,
  the warmth benefit is "fires lit", not "cold nights survived"
  — stated, not upgraded.
- Whether gather-alone nights (branches >= 2, no fire) should
  count toward warmth benefit: NO under this prereg (warmth
  benefit = fires lit only); gather-alone counts toward wood
  preservation only. A future prereg could argue otherwise with
  fireside-sleep evidence.
- Whether the bark-strip side effect matters: bark enters the
  pack on tree/bigtree gathers and could feed later routine
  crafting (armor-craft is bark-fed). Guardrails catch harm;
  any bark-craft beat in a judged transcript is reported as a
  secondary finding.
- Whether the 15337 day-20 retry-refusal (bridge built, retry
  refused, combat intervened, wood 0 next morning because the
  bridge spent the logs) is one blank or two (retry path vs
  combat interruption): NOT judged here; the evidence file
  carries it as an out-of-scope finding for the coordinator's
  backlog. This arm must not create a second 15337 still
  evening (guardrail (c)), and must not claim the existing one
  as wood-bleed.
- Whether the starvation-total rule (serialized 'starv' match
  over whole deaths lists) over-counts NPC/monster starvation
  vs vessel starvation: vessel-starvation is reported alongside
  as a secondary number; the bar as written uses the total.
