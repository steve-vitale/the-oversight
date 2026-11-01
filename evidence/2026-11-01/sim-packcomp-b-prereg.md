# sim-packcomp-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1346Z,
axis food-economy, arm sim-packcomp-b. Worktree sim-packcomp-b,
branch sim-packcomp-b. Answers the coordinator's pack-composition
arm, following sim-depositkeep-b (evidence/2026-11-01/
sim-depositkeep-b.md, prereg sim-depositkeep-b-prereg.md, round
evidence sim-food-depositkeep-trendsensor-round-1305.md): with the
gate OFF (keep 2,000), scholar unload is nonzero on 4/8 pilot seeds
(2,850 / 5,980 / 2,040 / 1,320 kcal on seeds 51101 / 51102 / 51105 /
51106) and exactly 0 on the other four — and the four zero seeds
fail on pack COMPOSITION, not threshold: 51103/51104 carry zero
finished food at every return (unknowns, in-shell nuts, materials),
51107 peaks at 1,040 kcal finished, 51108 peaks at 0 finished kcal.
No keep value moves them. The question for this arm is whether
identification and/or shelling — the two processing steps that turn
the zero seeds' packs into finished food — would have pushed those
packs over the 2,000 keep.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing policy file or existing script. New files
only: this prereg, the packcomp trace driver, the packcomp
analyzer, the proof test (including pure counterfactual checks and
one live field-capture control on a NON-pilot seed), evidence,
census/corpus. scripts/sim-harness.js and
scripts/policies/competent.js are REUSED VERBATIM. This worker does
NOT push, bump, verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Canon note (read first)

docs/CANON.md read. NO canon doc defines the pack-composition
counterfactual as a system — the counting rules below are read from
the game's own code, not invented canon:
- Haul-block finished definition (game.js returnToVillage
  ~8726/8771): finished = kcalEach > 0 AND NOT isUnprocessed.
- isUnprocessed (food.js ~2488): foodState 'unknown', 'carcass',
  'in_shell', 'cleaned', or needsCooking — all belong on the
  counter, not in the pantry.
- Unknown foods (food.js harvest branch ~388, lump branch ~511):
  kcalEach 0, hiddenKcal = plant.caloriesPerUnit; a lump
  ('unknown shoots' etc.) carries no hiddenKcal itself but a
  composition map lump[plantId] = units, so its revealed value is
  sum over components of units x caloriesPerUnit from
  src/data/plants.json.
- Identification (food.js splitLumpOut ~545): an identified species
  leaves the lump as a real item — a nut species becomes in_shell
  (kcalEach 0, hiddenKcal = caloriesPerUnit), a must-cook species
  gains needsCooking (still unprocessed), an avoid-edibility
  species gets kcalEach 0 (not food). These are reported as
  SENSITIVITIES below, not folded into the judged channels, so the
  judged rules stay exactly as the coordinator prescribed them.
- Shelling (food.js shellNuts ~619): shelled kcalEach per unit =
  round(hiddenKcal x 0.75) — net < gross, shells weigh.
docs/PRESERVATION.md (food ladder) is adjacent, not the counting
rule. docs/FOOD-adjacent canon does not change any number below.

## Question

On the depositkeep pilot substrate exactly (same seeds 51101–
51108, same 30d competent window, same policy set, same
DEPOSITGATE=0 env contract), itemize every scholar return pack
into finished kcal, unrevealed/unknown food kcal, in-shell nuts
kcal, and materials/other — and compute, per return and per seed,
three counterfactual packs: (a) identification only, (b) shelling/
processing only, (c) both combined. Would any return pack exceed
the 2,000 kcal keep under each channel — i.e. would it unload
under gate-off keep-2000?

## Substrate replication (comparability contract)

This arm REPLICATES the depositkeep pilot substrate exactly: seeds
51101–51108, competent policy verbatim, DAYS=30, env
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0,
POLICY=competent, and the same ten must-NOT-be-1 flags. The driver
is a new file (packcomp-b-driver.js) but reuses the depositkeep
wrapper design (count-only returnToVillage / depositPantryPieces /
donateToPantry wrappers, no state-moving call in the judged path)
with ONE change: packBefore records the full item fields the
counterfactual needs (plantId, lumpForm, foodKind, foodState,
edible, needsCooking, hiddenKcal, unprocessed flag, and the lump
composition with per-component caloriesPerUnit / edibility /
preparation looked up from Game.data.plants at record time).
Finished-pack totals from this driver MUST tie to the depositkeep
census per seed (max finished pack, per-seed unload) within stack
granularity — a mismatch means the substrate drifted, and the run
stops before judging. The depositkeep census is cited, not re-run,
for the unload baseline; the finished-pack tie is the replication
check on THIS run's own data.

## Primary metric

Per seed, over the 30-day competent-policy window with
DEPOSITGATE=0: the combined counterfactual (c) pack per return,
and whether it exceeds 2,000 kcal. A seed counts as
"predicted-nonzero-unload" iff at least one of its live returns
carries a (c) pack strictly greater than 2,000 kcal. Returns are
the depositkeep live returns (returnToVillage calls with Game.over
false at entry); the endDay sensitivity count is reported but the
judged count stays the depositkeep rule for comparability.

## GO threshold (judged exactly against this header)

GO if the combined (c) counterfactual predicts nonzero unload on
>=6/8 seeds AND flips >=2 of the 4 depositkeep zero seeds (51103,
51104, 51107, 51108); NO-GO otherwise. A miss is NO-GO — never
re-scored against a friendlier metric mid-run (e.g. never
re-scored on channel (a) alone, on "any seed flips", on band-total
counterfactual kcal, or on a lower keep). If the metric proves
wrong, that goes under "metric review" and the revision applies to
the NEXT run, never to this one.
- Pilot GO -> NO confirm spend anyway: this task's pilot-only
  instruction overrides the usual confirm step. 8 seeds, NO 12–16
  seed confirm whatever the outcome. A GO here is a measured
  counterfactual, not a landed lever — the NEXT run's job is to
  test a real identification/processing lever, not to re-run this
  census bigger.
- Pilot NO-GO -> killed-at-pilot: evidence only, no confirm spend.

## Exact counterfactual counting rules (fixed now, applied by the analyzer)

Per live return, from packBefore (the pack the haul block pools):

- finished: sum over items with kcalEach > 0 AND NOT isUnprocessed
  of units x kcalEach. This is the as-is pack; it must reproduce
  the depositkeep finished-pack figure for the same return.
- unknown value (for channel a): sum over items with foodState
  'unknown' of their revealed value:
  - non-lump unknown (plantId set): revealed per unit =
    item.hiddenKcal if present, else the data caloriesPerUnit for
    its plantId. If the species' edibility is 'avoid', revealed
    value is 0 (identified — not food; the Codex knows its uses,
    the pantry does not eat it).
  - lump unknown (lump map set): sum over components of
    units x caloriesPerUnit for that component's plantId from
    Game.data.plants as recorded at record time; avoid-edibility
    components count 0. A component with a missing caloriesPerUnit
    is recorded as unknown-value null for that return and the
    return is flagged incomplete — never guessed, never zero-filled.
- shelled value (for channel b): sum over items with foodState
  'in_shell' of units x round(hiddenKcal x 0.75), with hiddenKcal
  falling back to the data caloriesPerUnit for the item's plantId
  if the field is absent. This is shellNuts' own arithmetic.
- materials/other: every remaining item (tools, relics, sticks,
  materials, bonded items, and any kcalEach-0 item not in the two
  channels above) counts 0 in every channel. Carcasses, cleaned
  (raw) meat, and needsCooking items that are NOT unknown/in-shell
  also count 0 in all three channels — cooking/butchering is out
  of scope for this arm, and the evidence will name how much
  unprocessed kcal sits in that residual bucket per zero seed so
  the next run can see it.
- Channel packs, per return:
  (a) identification only = finished + unknown value.
  (b) shelling/processing only = finished + shelled value.
  (c) both combined = finished + unknown value + shelled value.
  No item is counted in two channels: foodState is single-valued
  ('unknown' vs 'in_shell' are disjoint), so (c) double-counts
  nothing. Spoilage is NOT re-applied: the counterfactual assumes
  the processing happened before the return, on the pack as
  recorded; a spoiled stack's fate under processing is a next-run
  question, flagged in metric review if any zero-seed pack carries
  spoiled stacks.
- Would-unload rule: a return "would unload" iff its channel pack
  is STRICTLY greater than 2,000 kcal (the haul block keeps whole
  stacks up to the keep and splits only above it; a pack at
  exactly 2,000 unloads 0 — the depositkeep separation showed
  zero unloads at or under 2,000). Pantry-cap caveat: if the
  pantry were full, the haul would stay in the pack regardless of
  pack size; the driver records pantry-cap say lines, and any
  return carrying a pantry-cap line is flagged — a flagged return
  still counts toward the judged "exceeds 2,000" question (the
  question is about pack composition, not pantry room), but the
  flag is reported alongside it.

## Sensitivities (reported, NEVER substituted for the judged channels)

- (a)-excluding-nut-species: identification alone leaves nut
  species in_shell (splitLumpOut), so the nut share of the unknown
  value would still need shelling before it could unload. Reported
  per zero seed so a GO resting on nut unknowns is visible.
- (a)-excluding-must-cook: identified must-cook species gain
  needsCooking and stay unprocessed. Reported per zero seed.
- (a)-excluding-avoid is already in the judged rule (avoid = 0),
  not a sensitivity.
- Residual unprocessed kcal per zero seed (carcass / cleaned /
  needsCooking, non-unknown, non-in-shell): the food the three
  channels deliberately leave behind.

## Pilot gates (before any judged verdict)

STOP (no judging, report as the result) if any gate fails:
  (1) POSITIVE CONTROLS: the proof test's pure counterfactual
      checks are green BEFORE any judged sim — constructed packs
      covering: finished-only pack; unknown non-lump at revealed
      value; unknown lump summed over components; avoid species
      at 0; in-shell nuts at round(hidden x 0.75); disjointness
      (no item in two channels); exact-2,000 boundary (no
      would-unload) vs 2,001 (would-unload); materials at 0 in
      all channels. PLUS one live field-capture control on a
      NON-pilot seed (51109, outside 51101–51108): the driver
      records at least one live return whose items carry foodState
      and hiddenKcal/lump fields, and whose finished total is
      computed by the same code path as the judged runs. A census
      from a recorder that never proved it can see hiddenKcal is
      suspect, not a result.
  (2) COMPLETE CAPTURE: every pilot seed yields full evening
      snapshots plus a finished-pack figure on every live return,
      and every live return's items carry foodState; any return
      with a null unknown-value component is flagged incomplete
      and reported — if any zero seed's flip verdict rests on an
      incomplete return, the verdict for that seed is reported as
      indeterminate, not flipped.
  (3) INSTRUMENT NEUTRALITY: the driver contains no travelTo,
      returnToVillage, eat, donateToPantry, shellNuts,
      identifyPlant, or other state-moving call in the judged
      path (wrappers count only; direct calls live ONLY in the
      proof test, never in the driver). Verified by code read,
      stated in evidence.
  (4) GATE-OFF CHECK: gate-engaged reads false on every judged
      return. Any true read = the env contract was violated; stop
      and report, do not judge.
  (5) SUBSTRATE TIE: per-seed max finished pack and unload totals
      from this run tie to the depositkeep census (max finished
      pack: 2970 / 5780 / 0 / 0 / 2910 / 3320 / 1040 / 0; unload:
      2850 / 5980 / 0 / 0 / 2040 / 1320 / 0 / 0). Small drift is
      expected ONLY if the base moved under the worktree (the
      depositkeep branch was rebased onto a newer master before
      merging); a tie failure is investigated, not papered over —
      if the base moved, the evidence says so and judges the
      counterfactual on this run's own packs, with the depositkeep
      zero-seed list retained as the flip target (the task's
      fixed flip set).

## Horizon + why

30 days, death-aware: villages that die stop simulating (no fixed
200d; a dead village contributes its days-alive only, flagged,
never padded; +10d tail max is moot — runDays stops at engine
ending). 30d matches the depositkeep window exactly, so packs are
comparable seed for seed against the cited census, and keeps the
band inside the early game where the scale wall bites. A longer
window is a NEXT run's question, not this one's.

## Seeds and policies

Pilot seeds (reuse depositkeep, for seed-for-seed comparability):
51101, 51102, 51103, 51104, 51105, 51106, 51107, 51108.
Live-control seed (NOT judged, NOT in the pilot band): 51109.
NO confirm seeds: pilot only, whatever the outcome.
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Env contract (FATAL if violated):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
  POLICY=competent, DAYS=30
  COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
  COMPETENT_TRIPHOME_ROUTE_AROUND, WOODCARRY, WOODWARM,
  MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING
  must NOT be 1.
Note: DEPOSITGATE=0 is the substrate (sim control value), not a
policy change — no policy file is edited, and the competent base
defaults are otherwise untouched.

## Also reported (not judged)

- Per-return census tables for the four zero seeds (all returns,
  or the top returns by (c) pack if the full table is unwieldy —
  the full per-return data lands in the census JSON either way).
- Per-seed channel summaries: finished max, unknown-value max,
  shelled-value max, (a)/(b)/(c) max, returns over 2,000 per
  channel, would-unload seed verdict per channel.
- Survival / collapses, wave reach, median survival in-window.
- A sense-test read of one return transcript per zero seed: does
  the pack read sensibly (a small haul, not a missed unload, was
  the depositkeep sense note — confirm or correct it with quotes).

## Balanced panel (§15) — declared inapplicable, with reason

No panel compare is built for this arm. §15 panels compare a base
panel against a lever-applied panel on identical seeds through the
panel's standardized observer/scorecard/cohort rows; this arm
applies NO game-code lever and its primary metric is a custom
return-pack census with arithmetic counterfactuals, not a panel
metric, and its baseline is a PUBLISHED census, not a freshly run
panel. The counterfactual tables are reported directly in the
evidence file instead. No compare is fabricated.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states. The evidence will say so plainly and will NOT
claim wall movement. What is reported: wave reach (maxWaveUnlocked
per seed), median/max survival (days alive), collapse count, all
in-window.

## Sense test (SENSE-TESTING LAW)

Read one return transcript per zero seed end to end (the return's
own say lines plus the surrounding day lines): judge whether the
pack reads sensibly — the haul the scholar actually carried, the
keep/unload voice, the counter staging — or whether the numbers
and the narration disagree. Quote lines in evidence.

## Metric review (pre-run notes; completed in evidence after judging)

- The judged (a) rule counts unknown nuts at revealed value even
  though identification alone leaves them in_shell: the
  nut-species sensitivity exists precisely so a GO resting on nut
  unknowns is visible and cannot smuggle shelling into the
  identification channel. If the verdict flips on that
  sensitivity, the evidence will say the GO is really a (c) GO,
  not an (a) GO — but the JUDGED verdict stays the (c)-based rule
  as written, which is unaffected (both channels combined).
- The counterfactual is arithmetic on recorded packs, not a
  re-sim with identification/shelling actually performed: it does
  not charge ticks, does not change forage targets, does not
  re-route the day. A GO here licenses a real-lever run, it does
  not prove the lever's in-game effect.
- If zero-seed packs turn out to be materials-dominated (not even
  unknowns/nuts), the NEXT run's question is forage targets, not
  processing — and this run's bar will have measured the wrong
  processing step. That doubt is recorded here BEFORE judging; it
  does not change this run's bar.
