# sim-medchannel-seed-a — MEDICINE-CHANNEL SEEDED-STASH MEASUREMENT (arm sim-medchannel-a)

Run: oversight-flesh-out-loop, run fleshout-20261109T1815Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-medchannel-a, branch sim-medchannel-a.
Substrate: worktree HEAD a81cb2d07 at prereg time (verified `git rev-parse
HEAD` in the worktree; tree clean). Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env (explicit, = shipped
defaults): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware cap
(dead villages stop; runDays endReason recorded per seed; no fixed-200d
run). Seeds: 95205–95212 (8 seeds — see Seed-band note and the
CORRECTION below: the prereg as first committed listed 95205–95208,
which is FOUR seeds, while saying "8 seeds" throughout). Zero src/js
changes in this arm — DIAG / measurement only. The seeder and recorder
live in scripts/ (sweep-medchannel-seed-a.js,
analyze-medchannel-seed-a.js) and are driver-side instrumentation,
removable without affecting the game.

## CORRECTION 2026-11-09 (seed-count miscount — recorded BEFORE the judged 8-seed run)

The prereg as first committed (785bda555) said "8 seeds" everywhere but
listed the band 95205–95208 — FOUR seeds. The sweep, analyzer, and proof
test were built on that 4-seed list, and the 4-seed before + seeded legs
were RUN before the miscount was caught (at the panel step: the panel
reported 4 cases). Those 4-seed numbers are DEMOTED to pilot
(unregistered — the prereg named 8 seeds): before leg medicine 0,
ability 57, median survival 85d; seeded leg medicine 0, ability 57,
identical trajectories, doses 20/20 untouched. The pilot numbers are
recorded in the evidence file; the corpus files are OVERWRITTEN by the
judged 8-seed sweep (which re-runs all 8 seeds fresh — deterministic,
so the 4 pilot seeds reproduce identically). The BINDING verdict comes
from the 8-seed run only. G1's threshold is UNCHANGED (≥5 medicine
cures across the 8-seed seeded leg). Extension seeds 95209–95212 were
freshness-checked 2026-11-09 (zero corpus filenames, zero evidence-.md
mentions, zero scripts mentions — same scope as the original check).
Band for the judged run: 95205–95212.

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
mundane pool of 6: gutrot, trichinosis, disease [generic fever], lockjaw,
wound_fever, trembles; alien pool of 9, never diagnosed/eased/cured by
mundane medicine; cure tiers folk → occupation medicine → specific ruin
medicine → healer deepenings → Fever's End). The CANON.md law "human
skills ≠ alien abilities" bounds this arm: nothing here creates a cure,
an ability, or a skill — it measures whether the existing medicine
channel in `medicDutyCureAttempt` (src/js/game.js) fires when the
pharmacy is stocked.

## The question (backlog 2026-11-08, medicine channel unexercised live)

The Haven medic duty can cure the sick two ways (Steve 2026-11-08
ruling: roster medics CAN cure, by healing ability OR proper medicine
found). The ability channel is measured and live (33 cures on
medicduty-a, 142 on wideduty-a confirm). The MEDICINE channel has 0
cures on 20 seeds because the Haven pharmacy never holds doses
(medicine is ruin-found and rare; the competent policy rarely deposits
it). The channel is proven only by a unit leg. Question: does the
medicine channel fire when medicine is actually in the pharmacy, and
what does it add beyond the ability channel?

## How the mechanism actually works (verified from the code BEFORE this prereg, not guessed)

- `medicDutyCureAttempt(holder, pid, nm)` (game.js:33169–33229).
  Channel 1 (ability): tries herbal_remedy / field_medicine / triage
  held by the holder; `cureEffectFor(did, ab) === 'cure'` AND
  (`!def.cure.needsDiagnosis` OR diagnosed) cures. Channel 2
  (medicine): for kinds antibiotics (class bacterial) /
  antiparasitic (class parasitic), needs
  `cureEffectFor(did, kind) === 'cure'` AND `def['class'] === kind-class
  or 'fever'`, then spends one dose from `stashState().medicine`
  (entry `medType === kind`, `doses > 0`; dose decremented, entry
  removed at 0). Medicine needs NO diagnosis (unlike the ability
  channel). Alien-pool patients refused outright (`def.pool ===
  'alien'`); unnamed vectors refused (`villagerDiseaseId` null).
- Cure table (src/data/statusEffects.json, verified 2026-11-09):
  antibiotics 'cure' = lockjaw, wound_fever. Antiparasitic 'cure' =
  gutrot, trichinosis. Generic fever ('disease'): antibiotics 'ease'
  only — NOT a medicine cure. radiation_sickness: antibiotics /
  antiparasitic 'no' (class radiation — excluded twice over).
  trembles: 'no' at every tier. Ability cures: wound_fever
  (herbal/field/triage), lockjaw (field/triage), gutrot (herbal).
  Trichinosis has NO ability cure (all 'ease') — medicine's unique
  coverage on paper.
- REACHABLE-SET CORRECTION (verified from code, changes the brief's
  framing — recorded here before any judged computation): NPC sick
  records are created ONLY by the infection loop (game.js:32996–33008:
  vectors 'wound fever' / 'gut rot' / 'tick fever') and the food
  poisoning path (villagerFoodPoisoning, incl. 'radiation sickness').
  Lockjaw and trichinosis contract ONLY on the SCHOLAR via
  `contractDisease` (game.js:14174–14177, food.js trichinosis) — never
  as NPC `v.sick` records. `villagerDiseaseId` maps only 'wound fever'
  → wound_fever, 'gut rot' → gutrot, 'tick fever' → disease,
  'radiation sickness' → radiation_sickness. CONSEQUENCE: the duty's
  reachable medicine cures are wound_fever (antibiotics) and gutrot
  (antiparasitic) ONLY. Trichinosis medicine-unique cures are ZERO BY
  CONSTRUCTION, not by rarity — no NPC patient can ever present it.
  The analyzer still classifies every observed medicine cure as
  ability-available vs medicine-unique for that (disease, holder) pair
  and reports trichinosis separately (expected 0, with this reason).
  If a trichinosis medicine cure is ever observed, it falsifies this
  code reading and must be investigated, not celebrated.
- Diagnosis gate note: wound_fever / gutrot have
  `needsDiagnosis: false`, so diagnosis never gates the ability
  channel for the reachable set either. The brief's
  "lockjaw/trichinosis need diagnosis" check is moot for NPC patients;
  the analyzer reports diagnosed-ness of every medicine cure
  (expect: medicine cures on undiagnosed patients occur, because
  medicine does not need the name).
- Say-line (the sense-test surface): medicine cure says
  "`<Holder>` gives `<Patient>` the `<antibiotics|antiparasitic>`
  from the pharmacy stores. The `<disease>` breaks within the day.
  (`<Patient>` is going to make it.)"

## The seeding instrument (measurement only, zero src/js)

- `scripts/sweep-medchannel-seed-a.js`, env-gated: `MEDCHANNEL_SEED=1`
  seeds, `MEDCHANNEL_SEED` unset/0 does not. After `setupGame`, before
  `runDays`, it pushes two entries into `stashState().medicine` with
  exactly the item shapes the game itself uses (game.js:210–211):
  `{ id: 'med_antibiotics', name: 'Antibiotics (amoxicillin)',
  medType: 'antibiotics', doses: 20 }` and
  `{ id: 'med_antiparasitic', name: 'Antiparasitic (mebendazole)',
  medType: 'antiparasitic', doses: 20 }`.
- Dose justification (20 + 20 = 40): medicduty-a saw 33 duty cures
  TOTAL across 8 seeds (~4/seed) across both channels; medicine-
  eligible disease incidence is a strict subset of all sickness, and
  the ability channel takes its share first (it is tried before
  medicine in the same call). 40 doses is ~10x the expected medicine
  demand, so supply cannot bind on 8 seeds; the analyzer verifies
  this (doses remaining > 0 per seed, and spent == cures). If demand
  ever exceeded 20 of one kind, the shortfall would show as remaining
  0 for that kind and the run would be re-registered with a bigger
  stock, not silently accepted.
- The seeder touches no game rule: it writes two stash entries that
  the game already knows how to hold (storage.js:690 keeps medType /
  doses on stash entries) and spend (medicDutyCureAttempt channel 2).
  It changes no spawn, no policy, no cure table. Removing the sweep
  script removes the seeding entirely.
- Recorder (same sweep, non-bare mode only): wraps
  `Game.medicDutyCureAttempt` (call-through, no RNG, no Game-state
  writes — pure observation into an external array) and `Game.say`
  (records only lines containing 'from the pharmacy stores'), plus a
  `stashLog` wrapper recording medicine takes with taker, and the
  medicduty-style daily snapshot extended with pharmacy doses
  remaining, duty-held flag, and cumulative duty cures. BARE mode
  skips ALL wrappers but KEEPS the seeding when MEDCHANNEL_SEED=1
  (so bare-vs-recorded fingerprints test recorder neutrality under
  seeding); bare without seeding tests it on the before leg.

## Legs (identical seeds, one shared baseline)

- BEFORE: seeds 95205–95208, competent, 150d, MEDCHANNEL_SEED unset
  (no seeding). Expect medicine cures 0 (replicating the known 0/20)
  and pharmacy doses 0 at day 1; any before-leg medicine cure or
  deposit is a finding, reported, not hidden.
- AFTER (seeded): same seeds, same policy, same horizon,
  MEDCHANNEL_SEED=1 (20 + 20 doses at day 1, verified by the day-1
  snapshot in every per-seed file).
- Both legs write per-seed JSON to
  evidence/2026-11-09/medchannel-seed-a-corpus/ (before:
  `medchannel-seed-a-before-s<seed>.json`; after:
  `medchannel-seed-a-seeded-s<seed>.json`) plus bare fingerprints
  (`medchannel-seed-a-bare-before-s<seed>.json`,
  `medchannel-seed-a-bare-seeded-s<seed>.json`).

## Pre-registered GO thresholds (binding, MEASUREMENT.md §14)

- G1 PRIMARY: medicine cures ≥ 5 across the 8-seed seeded leg (the
  channel fires repeatedly, not once), AND zero medicine cures on
  alien-pool or trembles patients, AND duty-attributed dose
  decrements == medicine cures (no dose wasted on a non-cure: each
  medicine cure decrements exactly one dose of the matching kind;
  total stash balance reconciles as seeded + deposited − remaining ==
  medicine cures + scholar takes + other takes, with other takes
  itemized and expected 0).
- G2 GUARDRAILS: median survival (seeded) ≥ 0.8× unseeded median;
  starvation deaths (seeded) ≤ unseeded + 2.
- G3 BALANCED PANEL (§15): `scripts/balance-panel.js` compare .md
  attached (before/after panels, seeds 95205–95208, policy competent,
  150d). The panel CANNOT express the driver-side seeder — it runs
  the unseeded competent policy on the current source for both legs,
  so the two panels are identical by construction on a zero-src/js
  arm. G3 passes iff the compare decision is `no_material_signal`
  or `review_required` with no `regression_signal`, WITH this
  explanation recorded. The panel's role here is to confirm the
  source itself carries no regression; the paired before/after sweep
  is the instrument for the seeding question. A `regression_signal`
  on any metric is a same-run investigation item.
- G4 PROOF: scripts/test-medchannel-seed-a.js — legs covering:
  (a) seeder puts the seeded doses in the stash at day 1 and doses
  decrement ONLY on a cure; (b) analyzer joins medicine cures to
  disease/kind/dose-spend and classifies ability-available vs
  medicine-unique (incl. trichinosis reported separately as 0 by
  construction); (c) recorder neutrality (recorder on/off reads the
  same headline on one seed); (d) corpus integrity (daily rows, no
  gaps unreported).

## Also reported (not gating)

- Ability cures on both legs; duty-held share both legs; pharmacy
  doses remaining at end per seed; medicine cures on undiagnosed
  diseases (expect > 0 — medicine needs no diagnosis); medicine-cure
  say-lines quoted verbatim (sense-test); wall numbers every run
  (national / table / wins, wave 4–5 unlocks, median survival);
  death-cause shares; before-leg deposits/takes if any.

## Analyzer classification rules (binding)

- Each medicine cure event carries: seed, day, patient, diseaseId
  (from the pre-call record via villagerDiseaseId), diseaseName,
  kind (antibiotics/antiparasitic — from which stash entry
  decremented), diagnosed (rec.diagnosed or villageKnowsDisease at
  cure time), holder, holder abilities held at cure time
  (npcHasAbility for herbal_remedy / field_medicine / triage).
- ability-available iff some held ability has
  cureEffectFor(diseaseId, ability) === 'cure' AND
  (!def.cure.needsDiagnosis OR diagnosed). Otherwise
  medicine-unique. For the reachable set (wound_fever, gutrot):
  herbal_remedy cures both, so a cure is medicine-unique only when
  the holder holds no curing ability for that disease (e.g. a
  triage-only holder curing gutrot, or a field-only holder curing
  gutrot — field 'ease' on gutrot — or any holder curing a disease
  whose curing ability they lack).
- Alien-pool / trembles medicine cures: expected 0 by code; any
  observed event fails G1 outright.

## Seed-band note (freshness check, full scope — coordinator band BURNED)

- Coordinator-assigned 94001–94008 ("coordinator-verified fresh") is
  BURNED: per-seed corpus exists at
  evidence/2026-10-24/pdvalue-b-corpus/pdvalue-b-pd0-dg0-{belongfeast,
  leadfeast}-s94001..s94008.json, and evidence/2026-11-08/../2026-10-24/
  sim-pdvalue-b.md names the band (PILOT 94001–94008, CONFIRM
  94011–94026). DO NOT RUN ON 94001–94008. The coordinator's
  verification missed it; this prereg records the collision so the
  next worker does not repeat it.
- Other bands checked and avoided (corpus filename + evidence-.md +
  scripts, same scope): 94101–94108 burned (cookbulk-b3,
  evidence/2026-10-19/perseed-cookbulk-b3/); 94301–94308 burned
  (pantrystarve-b, evidence/2026-10-24/); 94401–94901 burned (Oct
  24–25 runs: fullpantry-diag-b, awayration-size-b,
  fullpantry-casecount-b, awayration-cover-b, awayvoice-b);
  95201–95204 burned (journey-deepening r110,
  scripts/journey-deepening-r110-20261106.js, evidence/2026-11-06/
  journey-deepening-r110-prereg.md); 95501/95503/95504/95505 NAMED
  (journey-scale r104/r105 preregs, sim-sumconfirm-a-prereg,
  sim-tendbelow-b-prereg — a named band counts as used even without
  a corpus); 95601–95604 burned (journey-deepening r113,
  scripts/journey-deepening-r113-20261107.js). Brief-named burned
  bands re-checked: 97501–97508, 97701/97704/97707/97708,
  98101–98108, 98501–98508, 99001–99008, 99201–99208 — all avoided
  (not re-verified file-by-file here; they were never candidates).
- CHOSEN 95205–95212 (as corrected — originally 95205–95208, four seeds;
  extended per the CORRECTION above): zero corpus filenames
  (`find evidence -name '*9520[5-9]*'`, `'*9521[0-2]*'` → none), zero
  evidence-.md mentions (full-tree `grep --include='*.md' -E '9520[5-9]|9521[0-2]'` →
  none), zero scripts mentions, zero dated-prereg mentions. Scope:
  all of evidence/ (10G tree, .md content + filenames), scripts/,
  goal hidden_files/ (transcript-JSON seq-number substring hits only
  — no band naming; a band is named by a prereg/script/corpus
  assignment, not by a transcript line number). Checked 2026-11-09
  12:41–13:00 CST (95205–95208) and 2026-11-09 ~13:20 CST (95209–95212),
  before any judged computation on the extended band.
- If a later search finds 95205–95208 named earlier, this run gets a
  correction commit naming the missed source (per
  local_seed_band_freshness).

## Metric review (to be filled at closeout)

- (Pending — filled in the evidence file at closeout, with any
  proposal for the NEXT run. A miss here is NO-GO, never re-scored
  mid-run.)
