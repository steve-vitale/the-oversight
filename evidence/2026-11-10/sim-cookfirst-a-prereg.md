# Cooking — first numbers — PRE-REGISTRATION
(arm sim-cookfirst-a, run fleshout-20261110T1915Z, Loop A; Coverage Program
Tier 2 #1, Steve order 2026-11-10 11:11 CST "Measure all so we can improve
on all gaps")

## What this arm is
A MEASUREMENT arm, not a lever arm. It captures the FIRST NUMBERS for
cooking on the standard panel: cooking events by dish/method, calories
gained via cooking vs eating raw, cook skill gains and teaching moments,
spoilage avoided by cooking/preserving, and who cooks (which villagers,
which tracks). Zero src/js. Gates, prices, deeds, and readyDemand
untouched. The cookbulk arms (Oct 2026) measured a POLICY-side batch-cook
layer (feastscale policies + cookbulk-b), not the base game's everyday
cooking — this arm measures the base game under the plain competent
policy: the scholar's fire, the specialist's knife, and the villager
cook duty.

## Canon grounding (read before the judged pilot, not assumed)
- docs/CANON.md read first; docs/PRESERVATION.md read for the food
  ladder: cleaned (2d) < cooked (5d) < smoked (30d) < rendered fat (90d)
  < pemmican (120d). Blind penalties teach, never stupid-make (clean
  0.75x, smoke 0.80x, render 0.65x — one-time sting, the attempt teaches).
  Rot can't be smoked back into food. No nonsensical calorie loss.
  Smoking pace is 16 ticks. Pemmican is the payoff (needs rendering
  knowledge — the ladder gates itself).
- NO canon doc covers the cooking act itself (who cooks, outcomes,
  teaching) as a system. Mechanics below are grounded in code and stated
  as code facts, not canon.
- Code facts verified by reading/grep before this prereg:
  - Scholar cooks via `cookFood(idx, container)` (food.js wrapper over
    game.js:14731): meat (cleaned/undercooked, 32 ticks) and must-cook
    plants (16 ticks) go through `cookTransform` with a `cookOutcome`
    (knows: perfect 70% / decent 25% / burnt 5%; blind: decent 30% /
    undercooked 40% / burnt 30%). Meat: gross = cleaned total, perfect
    is 100% — the ladder's reward is shelf life + safety, never new
    calories. Plants keep the raw-digestibility model (tubers unlock
    at the fire). `cookAll(container)` batch-cooks rawKcal items with
    ONE outcome for the batch (knows=true). Rot is refused honestly
    (item spliced, "cooking won't save it") on every cook path.
  - Ladder rungs: `cleanCarcass` (carcass -> cleaned, 2d, specialist
    butcher 0.40+0.04*skill of gross, fat separated 20%); `preserveFood`
    (16 ticks, known 0.95x/30d, blind 0.80x/15d); `renderFat` (12 ticks,
    known 0.90x/90d, blind 0.65x); `makePemmican` (2 preserved meat + 1
    rendered fat + 2 berries -> ~97% retention bars, 120d, needs
    rendering knowledge). First attempt at each rung teaches the
    technique (`learnTechnique(t, 'trial')`); watching a specialist
    twice teaches it (`'watched'`, food.js:1494).
  - `askSpecialist(vid, idx, container, forceTask)`: scholar asks a
    villager specialist to butcher/cook/preserve; skill-scaled yields
    (cook: `cookTransform` with skillMult 1+0.05*skill); the specialist
    is picked from `specialistsHere(task)` (skill-sorted).
  - Villager cook duty (`resolveOneAssignment`, game.js:7187+): a
    staffed cook credits havenRoleCredit (~400) AND works the smoke
    racks — pantry surplus about to spoil (spoilDay - day <= 2, past a
    ~2-night dinner reserve) is smoked/dried up to a 4000 kcal/day
    budget at blind 0.80x/15d or specialist 0.95+0.02*skill (cap 1.0) /
    30+5*skill days; racks-full guard caps the preserved stockpile.
    Per-batch `foodXp['preserver']` grants (one per batch preserved).
    The duty ALSO fires the `_haulcount` tap (villagerPreserveBatches /
    villagerPreserveKcal) — a counting-only tap the instrument reads.
  - Villager skill: `specialistSkill(person, task)` is occupation base
    + self-taught ladder from `foodXp[task]`: holders +1 at 5 XP (cap
    3); self-taught 5 XP -> 1, 15 -> 2, 30 -> 3. Practice reps
    (`villagerPractice`) move competence rungs for the 'cook' task
    (8/20/36 cumulative reps). Scholar techniques live in
    `state.codex.techniques` (clean/cook/preserve/shell/render).
  - Eating: `tele('eat', {ateKcal, spoiled})` carries NO foodState —
    the instrument must attribute eaten kcal by foodState itself (wrap
    `eatOne` + pack-diff on `eat`). The village meal draws via
    `pantryDraw(v, want, {cook: false})` at the nightly meal
    (game.js:4216) and `{cook: true}` at game.js:30077 — the instrument
    wraps pantryDraw and records the cook flag + kcal drawn by
    foodState, so the village's cooked-vs-raw split is measured, not
    assumed.
  - Teaching: `teachSkill` (skill-teaching.js) covers skill-lane
    abilities; cooking techniques are NOT skill-lane abilities, so no
    teachSkill path teaches cooking — verified by grep (no 'cook' /
    'preserve' skillId in skill-teaching.js). Teaching moments for
    cooking are therefore: scholar learns by trial / by watching a
    specialist twice / by occupation grant; villagers learn by foodXp
    reps at the racks. Villager-to-villager cooking teaching has NO
    code path and is marked UNMEASURABLE-BY-DESIGN below.
  - Competent policy cooks: `cookPack` (up to 6 items/day-part at the
    fire), `prepareGardenFood`, and staffs a cook duty when fresh food
    is about to rot (skill-sorted, trust-20 gate, fallback down the
    list — the landed cook fallback, commit 908ad0f12).

## Definitions (binding for this arm)
- **Cooking event:** one item transformed by any rung — clean, cook,
  smoke (preserve), render, pemmican — classified by method + caller
  path from the stack: scholar-fire (cookFood/cookAll/cleanCarcass/
  preserveFood/renderFat/makePemmican called with origin 'policy' or
  'internal' — see origin note), specialist (via askSpecialist),
  villager-duty (the racks convert inside resolveOneAssignment — no
  method call; captured via the _haulcount tap + daily pantry diff,
  classified 'duty'), batch (cookAll). 'other' is a failure, not a
  class. Origin note: the harness wraps verbs with origin tags, but
  cookFood called by the policy vs by game code is distinguished by
  the STACK (policy file frames vs engine frames), not by the verb
  wrap — the instrument records the stack's first non-instrument
  frame.
- **Calories gained via cooking:** per transform, `cookTransform`
  returns {rawTotal, cookedTotal, outcome} — the instrument wraps
  cookTransform and records raw->cooked per call with caller path.
  For preserve/render/pemmican the gain is shelf-life, not kcal:
  recorded as kcal-in vs kcal-out (0.95x / 0.90x / ~0.97x) + days of
  shelf gained. Eating raw vs cooked: eaten kcal by foodState
  (cooked/smoked/preserved/rendered/pemmican/raw/cleaned/other) from
  the eat wraps; the headline is share of eaten kcal that was cooked
  (any rung beyond raw/cleaned) vs eaten raw.
- **Cook skill gains:** scholar techniques learned (which rung, source
  trial/watched/grant, day); villager foodXp gains by task
  (cook/preserver/butcher — read at daily snapshot from the person's
  record) + specialistSkill rungs reached; practice reps on 'cook'.
- **Teaching moments:** askSpecialist calls that taught the scholar
  ('watched' learn), specialist cook/preserve jobs done, and
  villager foodXp reps earned at the racks. Villager->villager
  cooking teaching: NO code path — UNMEASURABLE-BY-DESIGN (finding,
  not a gap in the instrument).
- **Spoilage avoided:** kcal rescued = items transformed (any rung)
  with spoilDay - day <= 2 at transform time ("about-to-rot"), plus
  villager-duty preserved kcal (haulcount tap), plus spoiled stacks
  refused/discarded at the fire (wrap-detected: item spoiled at call
  time). Rot that still happens is read from the daily pantry
  snapshot (items vanishing with spoilDay <= day — counted as
  spoiled-lost only when the engine purges them; see metric review).
- **Who cooks:** scholar (technique known/blind, occupation), the
  specialist (id, occupation, skill at call time), the duty-holder
  (id, occupation, preserver skill, foodXp). Tracks: cooking deeds
  via wrapped `noteDeed('cooking')` (craft track) and 'preserving'
  deeds (creditDeed at the racks).

## Primary metrics (per seed)
1. Cooking events by dish/method: clean / cook (meat vs plant) /
   smoke / render / pemmican counts, by caller path (scholar-fire /
   specialist / duty / batch); outcome distribution per method
   (perfect/decent/undercooked/burnt) + knows vs blind share.
2. Calories: rawTotal -> cookedTotal per cookTransform call, pooled
   and by caller; kcal-in vs kcal-out + shelf-days gained per
   preserve/render/pemmican event; eaten kcal by foodState; share of
   eaten kcal cooked vs raw (scholar pack + village meal separately).
3. Skill gains: scholar techniques learned (rung, source, day);
   villager foodXp deltas by task + specialistSkill rungs reached;
   practice reps on 'cook'; staffed-cook days + who held the duty.
4. Teaching moments: askSpecialist jobs by task + who taught whom;
   'watched' learns; racks foodXp reps.
5. Spoilage avoided: about-to-rot kcal rescued by rung; duty
   preserved kcal/batches; spoiled stacks refused at the fire;
   pantry spoiled-lost kcal per day (snapshot diff).
6. Wall numbers: wins / national / table / wave-4 / wave-5 unlocks,
   median survival, standing totals, scaleRank at end.

## GO threshold (instrument validity + complete first-numbers capture)
This is a measurement arm: GO means the instrument works and the first
numbers are captured cleanly. GO iff ALL of:
1. Every cooking transform classified by method + caller path; none
   'other', none forced. (cookTransform wrap is the backstop: if a
   caller-path wrap is dead, the transform is still counted and its
   path recorded from the stack.)
2. Every wrapped method's call path verified live in the proof
   miniature or marked dead in the evidence; a wrap with no live call
   observed is dead and its zero is never treated as evidence.
3. Neutrality — the instrument does not perturb the game: the
   no-instrument leg matches the instrumented leg exactly on per-seed
   days AND end pantry kcal AND death count (8/8 each). (Pattern
   from secondlink-a / diplo-a; the OFF leg is a re-run with the
   instrument uninstalled.)
4. Instrument errors 0 on all seeds, all legs.
5. Complete first-numbers capture: per-seed tables covering metrics
   1–6 above, with the sense-test scenes quoted. Every metric counted
   or explicitly marked unmeasurable (see below).
A GO verdict makes NO landing claim and spends NO confirm band: there
is no lever here to land. A confirm band is reserved only if a later
build arm needs one.

## Horizon + why
150d, death-aware (runDays ends on village death / win; +10d tail max).
Matches the diplo-a band so numbers compare directly. A shorter horizon
would cut the ladder (render needs a fat animal + a trial; pemmican
needs preserved meat + rendered fat + berries — all multi-week
accumulations) and the technique-learning window; a longer one adds
nothing at ~3–4s/seed-run cost.

## Seeds
Band: **180201–180208** (8 seeds, pilot). Seed-band freshness verified
at spawn per the local_seed_band_freshness skill: full grep of every
dated prereg under evidence/ (`grep -rn "180201|18020[0-9]|1802"
evidence/ --include="*prereg*"`) names NO seed 180201–180208. The only
"1802" hits are unrelated: seeds 61802 (sim-falseclose-b) and 41802
(journey-social-life-r141) and a code line number (convo-wants.js:1802).
No dated evidence .md file and no perseed filename names any seed
180201–180208. Recent bands in use and avoided: 170201–170208
(diplo-a), 150201–150208 (talkturn/raiserseat/tendexact/scholarcount),
150209–150216 (RESERVED for the talkturn re-judge — NOT spent here),
140201–140208 (vetcount), 160201–160208 (roleform-b), 99101–99108
(secondlink/trustgrowth), 110001–110016 (wallbase).
Confirm band (if a later build arm needs one): 180209–180216, NOT spent
by this measurement arm.

## Policies (TWO legs on identical seeds)
- **control:** competent verbatim, default env. The single judged leg.
- **neutral:** control policy, instrument OFF (no wraps, no snapshots;
  end-of-run wall numbers + days + end pantry kcal + deaths only),
  same seeds — must match the instrumented control leg exactly on
  days + end pantry kcal + death count (8/8).
No other policy change. No src/js change.

## Instrument (new, scripts only)
- NEW scripts/cookfirst-instrument-20261110.js (wraps only, record-only):
  wrap `cookFood`, `cookAll`, `cleanCarcass`, `preserveFood`,
  `renderFat`, `makePemmican`, `askSpecialist`, `cookTransform`
  (the kcal backstop: rawTotal/cookedTotal/outcome/knows per call,
  caller path from the stack), `learnTechnique` (rung + source),
  `eatOne` + `eat` (foodState attribution via pre-call item snapshot
  and post-call pack diff), `pantryDraw` (cook flag + kcal drawn by
  foodState), `noteDeed` (count 'cooking'/'preserving' deeds). Read
  the `_haulcount` tap per day (villager duty batches/kcal). All
  wraps call the original, return its value unchanged, never alter
  state, never consume RNG, never throw into the game (record-path
  failures logged to instrumentErrors, never thrown).
- Daily snapshot: pantry roll by foodState (counts + kcal + min
  spoilDay), scholar techniques known, assignments holding 'cook'
  (id/occupation/preserver skill/foodXp), villager foodXp by task
  (top movers), village meal draw (from the pantryDraw wrap),
  scholar kcal + pantry kcal.
- NEW scripts/cookfirst-driver-20261110.js (control + neutral legs;
  per-seed JSON to evidence/2026-11-10/perseed-cookfirst-a/; refuses
  to overwrite), scripts/cookfirst-analyze-20261110.js (per-seed +
  pooled tables, reconciliation, neutrality check; writes
  evidence/2026-11-10/cookfirst-summary-cookfirst-pilot.json), and
  scripts/test-cookfirst-a.js proving the instrument.
- Say-sample filter: /cook|smoke|render|pemmican|rack|preserv|fire|
  feast|meal|dinner|hungry|starv|rot|spoil|recipe|taste|flavor|
  butcher|carcass|fat|tallow|jerky/i (cooking + food voice; cap 200
  lines per seed, day-stamped).

## Proof (scripts/test-cookfirst-a.js, RED->GREEN where a behavior is asserted)
- cookTransform wrap records raw->cooked + outcome on fixtures
  (meat perfect 100%, plant tuber unlock, burnt 0.4x); caller-path
  classification covers scholar-fire / specialist / batch / duty
  (duty via _haulcount tap fixture) and 'other' fails.
- learnTechnique wrap records rung + source; askSpecialist wrap
  records task + specialist id/skill; eatOne wrap attributes kcal by
  foodState; pantryDraw wrap records cook flag + drawn kcal by state.
- Analyzer fixtures: a cooked meal vs a raw meal split; a pemmican
  set's kcal-in/out + shelf gain; neutrality comparison (identical
  days+pantry+deaths passes, differing fails).
- Live legs: a short determinism miniature (same seed twice,
  byte-identical cooking counters), and a neutrality miniature (ON vs
  OFF on a short horizon, days + pantry kcal + deaths identical).
- Live install/shape/tele/wrap legs: every wrapped method exists on
  the loaded Game; cookTransform fires in the miniature.
- KNOWN WRAP RISK (from secondlink-a / diplo-a): a wrap records
  nothing if the engine calls the closure instead of the Game method.
  The proof must verify EACH wrapped method's call path is live (a
  live call observed in the miniature, or the wrap is marked dead in
  the evidence and its zero is never treated as evidence).
  cookTransform is the backstop for kcal provenance: if the
  cookFood/cookAll wraps are dead, the kcal are still counted from
  the transform stack.

## Unmeasurable (explicit, not hidden)
- Villager->villager cooking teaching: no code path exists
  (teachSkill covers skill-lane abilities only). Recorded as a
  finding (coverage gap), not an instrument gap.
- Per-villager eaten foodState: the village meal draws from the
  pantry as an aggregate (pantryDraw returns kcal, not who ate
  what). The instrument measures the meal's cooked-vs-raw split,
  not individual villagers' plates.
- Spoiled-lost kcal: the engine purges spoiled pantry items at
  meal/draw time without a tele event; the instrument infers it
  from daily snapshot diffs (items vanishing with spoilDay <= day)
  and labels it INFERRED, never exact.

## Sense-testing (SENSE-TESTING LAW)
Read transcripts / dialogue around cooking — judge meaning and
coherence, not just counts. Quote: the first cook scene per leg
where one exists; one specialist-cooked scene (if any); one
racks/smoke scene (if any); one pemmican scene (if any); one
spoiled-refusal line (if any). Flag template repetition (the same
"Cooked X: A -> B kcal" line shape on every seed is EXPECTED — it
is a report line, not dialogue; judge the surrounding voice) and
any robotic/static/repeated villager behavior around food.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)
Every evidence file carries one. Known candidates going in: the
talkturn-a cost bar is already known-wrong (raw-total deaths punish
longer survival; deaths per village-day is the proposed revision) —
this arm carries NO cost bar and does not re-judge it; the
spoiled-lost inference (snapshot diff, labeled INFERRED) is a
candidate for a proper tele event in a later build arm; the
"share of eaten kcal cooked" headline conflates scholar pack-eating
with the village meal — the analyzer splits them, and the next run
should decide which headline binds.

## Findings discipline
Do NOT chase findings outside this arm mid-run. APPEND any to
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md
in its format: `- [open] YYYY-MM-DD — area — observation (your run/evidence).`

## Base + landing
Base at spawn: master 70e3af870. If master moves before the run ends,
rebase onto the explicit master SHA read immediately before rebasing
and re-run proof green. Commit the prereg FIRST (this file), then the
instrument + proof, then the corpus + evidence. Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge — the coordinator merges
with --ff-only. Leave branch + worktree clean and committed.
