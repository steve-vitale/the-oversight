# Preservation — first numbers — PRE-REGISTRATION
(arm sim-preserve-a, run fleshout-20261110T2215Z, Loop A; Coverage Program
Tier 2 #2, Steve order 2026-11-10 11:11 CST "Measure all so we can improve
on all gaps")

## What this arm is
A MEASUREMENT arm, not a lever arm. It captures the FIRST NUMBERS for
preservation on the standard panel: preservation events by method, shelf-life
gained and spoilage avoided in kcal, who preserves, preservation skill and
teaching moments, and the stock of preserved food over time. Zero src/js.
Gates, prices, deeds, and readyDemand untouched. The sibling Tier 2 #1
arm (sim-cookfirst-a, evidence/2026-11-10/sim-cookfirst-a.md) measured
cooking and counted the duty racks in passing (460 batches / 390,085 kcal
on 8 seeds) — this arm goes deep on preservation itself: every rung of the
ladder above cooking, by method and caller, with shelf-life gained per
event and the preserved stock tracked day by day. It reuses the cookfirst
instrument pattern (wraps + _haulcount tap + daily snapshots + neutral leg)
and adds two things cookfirst did not have: an exact duty-racks capture
via a resolveOneAssignment wrap (per-item conversion diff, not just the
tap), and object-tracked spoiled-lost preserved kcal (reconciled against
pantryDraw, not just a snapshot-diff inference).

## Canon grounding (read before the judged pilot, not assumed)
- docs/CANON.md read first; docs/PRESERVATION.md read for the food ladder:
  cleaned (2d) < cooked (5d) < smoked (30d) < rendered fat (90d) <
  pemmican (120d). Blind penalties teach, never stupid-make (smoke
  0.80x/15d, render 0.65x — one-time sting, the attempt teaches). Rot
  can't be smoked back into food. No nonsensical calorie loss. Smoking
  pace is 16 ticks. Pemmican is the payoff (needs rendering knowledge —
  the ladder gates itself).
- NO canon doc covers who preserves, or the village racks as a system,
  as a design. Mechanics below are grounded in code and stated as code
  facts, not canon.

## Code facts verified by reading/grep before this prereg
- The engine has THREE preservation methods, not five. Drying, salting
  and pickling do NOT exist as separate mechanics:
  - **smoke/dry** — one method, `preserveFood` (food.js:870, 16 ticks):
    cleaned/cooked meat -> 'preserved', solid 0.95x/30d, blind 0.80x/15d
    (fuel died also earns the rough job). Scholar smoke always names the
    product "(smoked)". The duty racks name fish "(smoked)" and other
    meat "(dried)" — the verb follows the food, the rung is one.
  - **render** — `renderFat` (food.js:957, 12 ticks): raw fat ->
    'rendered', solid 0.90x/90d, blind 0.65x. Raw fat carries kcalEach 0
    with hiddenKcal as the real value; the rendered unit takes
    hiddenKcal * 0.90/0.65.
  - **pemmican** — `makePemmican` (food.js:1080, 20 ticks): 2 preserved
    meat + 1 rendered fat + 2 berries -> bars at ~97% retention,
    spoilDay day+120. Gated on knowing 'render' — the ladder gates
    itself. Bars inherit the strongest input parasiteRisk.
  - "Salt" in the code is a river-trader trade good, a contest flavor
    line ("Dry the fish", contests.js:4312 — narrative, no mechanic),
    and a word in the preserver table's comment. No salting mechanic,
    no pickling mechanic, no sun-drying mechanic. Any evidence table
    that lists drying/salting/pickling as engine methods would be
    inventing them; this arm records smoke/render/pemmican only, and
    records the drying-vs-smoking naming split as a label, not a method.
- `preserved` items are created in exactly THREE transform places plus
  one exogenous source:
  - food.js:908 scholar `preserveFood`; food.js:1479 `askSpecialist`
    preserver branch (0.95+0.02*skill capped 1.0, 30+5*skill days);
    game.js:7355 duty racks convert (same rates, blind 0.80x/15d);
    game.js:26994 river-trader gift (2 smoked fish, 200 kcal, exogenous
    — counted as a source of stock, never as a transform).
- Scholar-side preservation is expected to be ~zero under competent:
  cookfirst-a measured preserveFood 0, renderFat 0, makePemmican 0,
  askSpecialist 0 on 8 seeds / 857 village-days, because the policy
  never calls these verbs (grep of scripts/policies/competent.js:
  no preserveFood/renderFat/makePemmican/askSpecialist calls; the
  policy's food work is cookPack + staffing a cook duty when fresh food
  is about to rot, competent.js:1855-1888). The wraps are still installed
  and proven live in fixtures — a zero here is the finding, as in
  cookfirst-a, not an instrument gap.
- Villager cook duty (`resolveOneAssignment`, game.js:7225+): a staffed
  cook credits havenRoleCredit (~400) AND works the smoke racks.
  Eligible = pantry items with a real spoilDay, not already
  preserved/rendered, not bonded/keepsake, spoilDay - day <= 2
  (about-to-rot), not already spoiled (rot is discarded honestly, never
  laundered onto the racks). A ~2-night dinner reserve is held fresh
  first (reserve = 250 kcal * roster size; soonest-spoiling stays
  fresh). Conversion: 4000 kcal/day budget, per-stack; blind 0.80x/15d,
  specialist 0.95+0.02*skill (cap 1.0) / 30+5*skill days. Racks-full
  guard: preservedKcal >= rackCap (125 * roster * max(1, ownShelf-2))
  blocks ALL smoking that resolution (FOODLEVER_R5=1 stands the guard
  down; default OFF in this arm — pristine parity). Per-batch
  _haulcount tap (villagerPreserveBatches / villagerPreserveKcal),
  creditDeed(vid, 'preserving'), and grantFoodXpCredit(person,
  'preserver', n) — one foodXp rep per BATCH while under the first rung
  (5 XP), 1 XP per 2 batches above it (odd batch carried).
- The duty does NOT render fat and does NOT make pemmican — smoking
  only. Rendering and pemmican are scholar-fire (or specialist)
  verbs only.
- Skill: `specialistSkill(person, 'preserver')` (food.js:1230):
  occupation base (fisherman 3; fishing guide / hunting guide / sailor
  / chef / line cook / butcher / farmer / rancher 2; beekeeper /
  mushroom grower 1) + self-taught ladder from foodXp['preserver']:
  holders +1 at 5 XP (cap 3); self-taught 5 XP -> 1, 15 -> 2, 30 -> 3.
  Scholar technique grants: 'preserve' granted by occupation (chef,
  fisherman, fishing guide, hunting guide, sailor, line cook, butcher,
  farmer, rancher, beekeeper); 'render' is granted by NO occupation —
  it can only be learned by trial (first render attempt) or by watching
  a specialist twice ('watched', food.js:1494).
- Teaching: `askSpecialist` preserver jobs grant the specialist +1
  foodXp['preserver'] and count a foodWatch[tech] rep for the scholar;
  two watches teach the technique ('watched'). Scholar self-trial
  teaches on the first smoke/render ('trial'). Villager->villager
  preservation teaching: NO code path (same as cooking — teachSkill
  covers skill-lane abilities only; verified by the cookfirst-a grep).
  Marked UNMEASURABLE-BY-DESIGN below.
- Eating preserved food: the scholar eats via eat/eatOne/eatStashOne
  (tele('eat') carries no foodState — the instrument attributes by
  foodState itself, as in cookfirst-a). The village meal draws via
  pantryDraw (fresh-first, soonest-spoiling first) — preserved stock is
  drawn when fresh is gone. Cookfirst-a measured the scholar's eaten
  kcal as 47.5% preserved on its band; this arm re-measures the split
  on a fresh band and adds the meal-drawn preserved kcal.
- Spoilage of preserved stock: preserved items still rot (spoilDay
  day+30/15) and the dawn/meal purge removes them without a tele
  event. Cookfirst-a could only infer spoiled-lost from snapshot
  diffs. This arm tracks pantry objects by identity across daily
  snapshots: an object that vanishes with spoilDay <= day at last
  sighting is spoiled-lost; the analyzer reconciles vanished preserved
  kcal against pantryDraw-drawn preserved kcal the same day, so the
  residual is object-tracked, not snapshot-inferred.

## Definitions (binding for this arm)
- **Preservation event:** one item transformed by any rung — smoke
  (preserveFood / askSpecialist-preserver / duty racks convert),
  render (renderFat), pemmican (makePemmican, per SET) — classified by
  method + caller path from the stack: scholar-fire, specialist,
  duty, batch (cookAll never preserves — recorded only if observed).
  'other' is a failure, not a class. The duty racks convert has no
  method call of its own; it is captured EXACTLY by a
  resolveOneAssignment wrap (pantry identity diff pre/post) AND
  cross-checked against the _haulcount tap — the two must agree on
  batches/kcal (reconciliation §, analyzer asserts it).
- **Shelf-life gained:** per event, (new spoilDay - day) minus
  (old spoilDay - day) — net days banked, not the gross shelf. Smoke:
  30/15 minus remaining shelf (<=2d at the duty by eligibility; up to
  5d scholar-side from cooked meat). Render: 90 minus raw fat's
  remaining shelf (raw fat spoilDay is day+3 at separation). Pemmican:
  120 minus the input-weighted remaining shelf (min input spoilDay -
  day, recorded per set). Duty: same per converted item, from the
  resolveOneAssignment diff.
- **Spoilage avoided (kcal):** kcal of items transformed with
  spoilDay - day <= 2 at transform time ("about-to-rot rescued"),
  plus duty preserved kcal (all duty conversions are about-to-rot by
  eligibility), plus spoiled stacks refused/discarded at the fire
  (wrap-detected). Rot that still happens: preserved/rendered/pemmican
  kcal lost to spoilage, object-tracked (see above) and reconciled
  against draws.
- **Who preserves:** scholar (technique known/blind, occupation,
  technique-grant at start), the specialist (id, occupation, skill at
  call time), the duty-holder (id, occupation, preserver skill,
  foodXp, days held). Tracks: 'preserving' deeds via wrapped
  noteDeed (player) and creditDeed (villager).
- **Preservation skill/teaching:** scholar techniques learned (which
  rung, source trial/watched/grant, day); villager foodXp['preserver']
  deltas + specialistSkill rungs reached; askSpecialist preserver jobs
  + 'watched' learns; racks foodXp reps (grantFoodXpCredit counts, via
  foodXp deltas). Villager->villager preservation teaching: NO code
  path — UNMEASURABLE-BY-DESIGN (finding, not a gap).
- **Stock of preserved food over time:** daily snapshot series —
  pantry kcal by foodState (preserved / rendered / pemmican / cooked /
  cleaned / none), with min spoilDay per preserved state; pack roll
  likewise; peak preserved stock, end stock, preserved share of
  pantry, preserved kcal eaten (scholar pack + village meal draws).
  Racks-full days: days where the guard blocked smoking while eligible
  surplus existed (measured from the resolveOneAssignment wrap:
  about-to-rot kcal present at resolution start, converted 0, and the
  racks-full say line fired — count both the wrap signal and the say
  line; they must agree in direction).

## Primary metrics (per seed)
1. Preservation events by method: smoke (scholar-fire / specialist /
   duty; duty split fish-"(smoked)" vs meat-"(dried)" by name) /
   render / pemmican (sets + bars); counts, kcal-in vs kcal-out,
   shelf-days gained per event (net), solid vs rough share
   (knows/blind/fuel-died).
2. Shelf-life + spoilage: about-to-rot kcal rescued by method;
   duty preserved kcal/batches; spoiled stacks refused at the fire;
   preserved/rendered/pemmican kcal spoiled-lost (object-tracked,
   draw-reconciled); racks-full blocked days + about-to-rot kcal left
   to rot on those days; trader-gift preserved kcal (exogenous).
3. Who preserves: scholar technique state (preserve/render known at
   start vs learned); duty holders (id/occupation/skill/foodXp, days);
   specialist preserver jobs (id/occupation/skill).
4. Skill + teaching: scholar learns (rung, source, day); villager
   foodXp['preserver'] deltas + skill rungs reached (top movers);
   askSpecialist 'watched' learns; racks foodXp reps.
5. Stock over time: daily preserved/rendered/pemmican kcal series
   (pantry + pack); peak + end stock; preserved share of pantry;
   preserved kcal eaten (scholar + meal); preserved kcal still on the
   racks at end (spoilDay - end day).
6. Wall numbers: wins / national / table / wave-4 / wave-5 unlocks,
   median survival, standing totals, scaleRank at end.

## GO threshold (instrument validity + complete first-numbers capture)
This is a measurement arm: GO means the instrument works and the first
numbers are captured cleanly. GO iff ALL of:
1. Every preservation transform classified by method + caller path;
   none 'other', none forced. (resolveOneAssignment wrap is the duty
   backstop; the _haulcount tap cross-check must agree with it on
   batches/kcal within rounding — a mismatch is an instrument error,
   not a rounding note.)
2. Every wrapped method's call path verified live in the proof
   miniature or marked dead in the evidence; a wrap with no live call
   observed is dead and its zero is never treated as evidence.
3. Neutrality — the instrument does not perturb the game: the
   no-instrument leg matches the instrumented leg exactly on per-seed
   days AND end pantry kcal AND death count (8/8 each). (Pattern
   from secondlink-a / diplo-a / cookfirst-a; the OFF leg is a re-run
   with the instrument uninstalled.)
4. Instrument errors 0 on all seeds, all legs.
5. Complete first-numbers capture: per-seed tables covering metrics
   1–6 above, with the sense-test scenes quoted. Every metric counted
   or explicitly marked unmeasurable (see below).
A GO verdict makes NO landing claim and spends NO confirm band: there
is no lever here to land. A confirm band is reserved only if a later
build arm needs one.

## Horizon + why
150d, death-aware (runDays ends on village death / win; +10d tail max).
Matches the cookfirst-a / diplo-a band so numbers compare directly. A
shorter horizon would cut the ladder (render needs a fat animal + a
trial; pemmican needs preserved meat + rendered fat + berries — all
multi-week accumulations) and the technique-learning window; a longer
one adds nothing at ~3–4s/seed-run cost.

## Seeds
Band: **180209–180216** (8 seeds, pilot). Seed-band freshness verified
at spawn per the local_seed_band_freshness skill:
- Full grep of every dated prereg under evidence/
  (`grep -rn "180201|18020[0-9]|1802" evidence/ --include="*prereg*"`,
  plus the 6-digit seed census) names NO seed 180209–180216 as a judged
  corpus. The band is named in exactly TWO places, neither a corpus:
  (a) evidence/2026-11-10/sim-cookfirst-a-prereg.md names 180209–180216
  as its (unspent) confirm band — "NOT spent by this measurement arm",
  no lever to land, no confirm ever run; (b)
  evidence/2026-11-10/sim-coverage-tier2-round-2115.md (coordinator
  round note, 2115Z) RESERVES 180209–180216 for THIS arm ("Coverage
  Tier 2 #2 preservation (band 180209–180216)... Both bands
  freshness-verified by the coordinator... the bands are reserved by
  this record") and directs the next run to take this arm with this
  band (re-verified at spawn — this prereg is that re-verification).
  The coordinator reservation supersedes the cookfirst confirm
  reservation: the confirm was conditional ("if a later build arm
  needs one") and no build arm claimed it; the reservation is explicit
  and current.
- Full .md grep of evidence/ for 180217–180224 returns only the same
  round-2115 note (gardening's band — NOT spent here). No dated
  evidence .md file and no perseed filename names any seed 180209–
  180216 as a corpus. Recent bands in use and avoided: 180201–180208
  (cookfirst-a, spent), 170201–170208 (diplo-a), 150201–150208
  (talkturn/raiserseat/tendexact/scholarcount), 150209–150216
  (RESERVED for the talkturn re-judge — NOT spent here), 140201–
  140208 (vetcount), 160201–160208 (roleform-b), 99101–99108
  (secondlink/trustgrowth), 110001–110016 (wallbase).
Confirm band (if a later build arm needs one): 180225–180232, NOT spent
by this measurement arm. (Freshness of 180225–180232 checked at prereg
time: zero .md hits in evidence/; the next arm re-verifies at spawn.)

## Policies (TWO legs on identical seeds)
- **control:** competent verbatim, default env. The single judged leg.
- **neutral:** control policy, instrument OFF (no wraps, no snapshots;
  end-of-run wall numbers + days + end pantry kcal + deaths only),
  same seeds — must match the instrumented control leg exactly on
  days + end pantry kcal + death count (8/8).
No other policy change. No src/js change. FOODLEVER_R5 unset (default
OFF — pristine parity; the racks-full guard stays live so its blocking
is measured, not disabled).

## Instrument (new, scripts only)
- NEW scripts/preserve-instrument-20261110.js (wraps only, record-only):
  wrap `preserveFood`, `renderFat`, `makePemmican`, `askSpecialist`
  (per-item pre/post snapshots incl. spoilDay/kcalEach/foodState,
  spoiled-refusals, about-to-rot rescues, net shelf-days gained),
  `resolveOneAssignment` (pantry identity diff pre/post for the cook
  task: converted items, kcal in/out, shelf gained, about-to-rot
  present/converted/left, racks-full signal), `learnTechnique` (rung +
  source), `eatOne` + `eatStashOne` + `eat` (foodState attribution via
  pre-call item snapshot and post-call pack diff — same machinery as
  cookfirst-a) + tele('eat') capture, `pantryDraw` (cook flag + kcal
  drawn by foodState), `noteDeed` + `creditDeed` ('preserving' deeds).
  Read the `_haulcount` tap per day (villager duty batches/kcal) and
  cross-check it against the resolveOneAssignment diff. All wraps call
  the original, return its value unchanged, never alter state, never
  consume RNG, never throw into the game (record-path failures logged
  to instrumentErrors, never thrown).
- Daily snapshot: pantry roll by foodState (counts + kcal + min spoilDay
  for preserved/rendered/pemmican), pack roll likewise, scholar
  techniques known, assignments holding 'cook' (id/occupation/
  preserver skill/foodXp), villager foodXp by task (top movers),
  pantry-object tracking map (for spoiled-lost preserved kcal),
  scholar kcal + pantry kcal.
- NEW scripts/preserve-driver-20261110.js (control + neutral legs;
  per-seed JSON to evidence/2026-11-10/perseed-preserve-a/; refuses
  to overwrite), scripts/preserve-analyze-20261110.js (per-seed +
  pooled tables, reconciliation incl. duty-diff-vs-tap and
  vanish-vs-draw, neutrality check; writes
  evidence/2026-11-10/preserve-summary-preserve-pilot.json), and
  scripts/test-preserve-a.js proving the instrument.
- Say-sample filter: /preserv|smoke|rack|render|pemmican|tallow|fat|
  jerky|dried|spoiled|spoil|rot|smoked|dried|salt|pickle/i (preservation
  + rot voice; cap 200 lines per seed, day-stamped). The racks-full
  line and the "Should've smoked that" mutter are the two voice lines
  this arm must quote if they fire.

## Proof (scripts/test-preserve-a.js, RED->GREEN where a behavior is asserted)
- preserveFood wrap records kcal in/out + net shelf gained on fixtures
  (solid 0.95x/30d, blind 0.80x/15d, spoiled-refusal discards rot);
  renderFat wrap records hiddenKcal->rendered + 90d shelf; makePemmican
  wrap records sets/bars/inKcal/outKcal + 120d shelf (needs 'render'
  known — fixture grants it; the untaught refusal is also proven).
- resolveOneAssignment wrap records a duty conversion diff (converted
  item, kcal, shelf gained, about-to-rot present/converted/left) and
  agrees with the _haulcount tap on batches/kcal; racks-full fixture
  (preserved stock above rackCap) records 0 conversions + the guard
  signal.
- askSpecialist wrap records a preserver job (task, specialist id/occ/
  skill, pre/post) and the 'watched' learn after two watches;
  learnTechnique wrap records rung + source.
- eat wraps attribute preserved/rendered/pemmican kcal by foodState;
  pantryDraw wrap records drawn kcal by state.
- Object-tracking: a preserved item whose spoilDay passes vanishes
  from the pantry map and is counted spoiled-lost; a drawn preserved
  item is NOT counted lost (draw reconciliation fixture).
- Analyzer fixtures: a smoke/render/pemmican split; a duty-vs-tap
  agreement case and a mismatch case (mismatch fails); neutrality
  comparison (identical days+pantry+deaths passes, differing fails).
- Live legs: a short determinism miniature (same seed twice,
  byte-identical preservation counters), and a neutrality miniature
  (ON vs OFF on a short horizon, days + pantry kcal + deaths identical).
- Live install/shape/tele/wrap legs: every wrapped method exists on
  the loaded Game; preserveFood/renderFat fire in the miniature
  (or the wrap is marked dead with the reason recorded).
- KNOWN WRAP RISK (from secondlink-a / diplo-a / cookfirst-a): a wrap
  records nothing if the engine calls the closure instead of the Game
  method. The proof must verify EACH wrapped method's call path is
  live (a live call observed in the miniature, or the wrap is marked
  dead in the evidence and its zero is never treated as evidence).
  The resolveOneAssignment wrap is the duty backstop: if the
  _haulcount tap ever disagrees with it, the tap is the suspect, not
  the diff.

## Unmeasurable (explicit, not hidden)
- Villager->villager preservation teaching: no code path exists
  (teachSkill covers skill-lane abilities only). Recorded as a
  finding (coverage gap), not an instrument gap.
- Per-villager eaten foodState: the village meal draws from the
  pantry as an aggregate (pantryDraw returns kcal, not who ate
  what). The instrument measures the meal's preserved-vs-fresh split,
  not individual villagers' plates.
- Drying / salting / pickling as separate methods: they do not exist
  in the engine (verified by grep — see code facts). The arm measures
  what exists (smoke/render/pemmican) and says so; it does not invent
  the missing methods as zero-counts.
- Scholar rendering/pemmican under competent: expected zero (policy
  never calls the verbs). The wraps are proven live in fixtures, so a
  pilot zero is a finding about the policy, not an instrument gap —
  but it must be reported as "policy never calls it", never as "the
  engine can't do it".
- Preserved food eaten off-village (travel rations, tribute gifts):
  the eat wraps cover the scholar's pack; pantryDraw covers the
  village meal; food eaten on the road from another village's stores
  is not attributed. Marked unmeasured, not zero.

## Sense-testing (SENSE-TESTING LAW)
Read transcripts / dialogue around preservation — judge meaning and
coherence, not just counts. Quote: the first racks/smoke scene per leg
where one exists; one render scene (if any); one pemmican scene (if
any); one racks-full line (if any); one "Should've smoked that" mutter
(if any); one spoiled-refusal line (if any). Flag template repetition
(the same "Smoked N batches" report line shape on every seed is
EXPECTED — it is a report line, not dialogue; judge the surrounding
voice) and any robotic/static/repeated villager behavior around food
keeping. Judge specifically: does the village's preservation voice
sound like people saving food for winter, or like a counter?

## Metric review (for the NEXT run, §14 — no in-run re-scoring)
Every evidence file carries one. Known candidates going in: the
talkturn-a cost bar is already known-wrong (raw-total deaths punish
longer survival; deaths per village-day is the proposed revision) —
this arm carries NO cost bar and does not re-judge it; the
"share of eaten kcal preserved" headline conflates scholar pack-eating
with the village meal — the analyzer splits them, and the next run
should decide which headline binds; the duty-vs-tap cross-check may
show the tap undercounts partial-stack conversions (the tap counts
one batch per stack touched, the diff counts per item converted) —
if so, the next run should decide which count binds for "batches".

## Findings discipline
Do NOT chase findings outside this arm mid-run. APPEND any to
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md
in its format: `- [open] YYYY-MM-DD — area — observation (your run/evidence).`

## Base + landing
Base at spawn: master 3daa1a9b6. If master moves before the run ends,
rebase onto the explicit master SHA read immediately before rebasing
and re-run proof green. Commit the prereg FIRST (this file), then the
instrument + proof, then the corpus + evidence. Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge — the coordinator merges
with --ff-only. Leave branch + worktree clean and committed.
