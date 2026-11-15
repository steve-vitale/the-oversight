# Journey leg ESTABLISHMENT — r139 pre-registration (2026-11-14, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261115T004700Z` (scheduled Sat 2026-11-14
17:45 CST). Rotation read `1` (establishment); write `1→2` at run
start (done — file reads 2; deepening next).
**Base:** local master `910bff7f4` (batch ship: version bump
fa8f9289d-20261114-234552; r134 landing fa8f9289d underneath).
Pre-flight deviations (LOUD):
- **Registration interrupted by a runtime restart, then recovered.**
  The first `worktree-register.sh` was killed mid-checkout (the run's
  runtime restarted ~00:04Z): branch `journey-establishment` was
  created at master tip but the checkout stopped after `evidence/`
  only — no `.git` pointer, no registry entry, exec log 0 bytes.
  Recovery: verified the partial dir held only a partial checkout of
  committed master files, removed it, re-ran registration (queued
  behind two live sibling registrations, sim-holdbuild-b and
  sim-transplant8b-a, on the registry lock — normal contention, not
  a wedge). Second registration completed in ~7 min, REG_EXIT=0,
  heartbeat landed 00:07:01Z. Heartbeat loop runs from the worktrees
  dir (10-min cadence, PID 3305, exact-PID kill at closeout).
- **Reaper skipped at pre-flight** (registry lock held, 2nd
  consecutive skip) — known lock self-contention, not a wedge; no
  cleanup this run.
- `git status` in the main tree hung once on the wiped stat cache
  (known, same as r134); re-verified clean via
  `git status --porcelain --untracked-files=no` (empty). Disk 35%.
- `git pull` reported "Already up to date." No lock file was present
  at run start (no stale-lock recovery needed).
- **Write flap in progress from ~00:31Z** (host EPERM class,
  AGENTS.md 2026-11-12): fresh-file writes refused (the r139 driver
  `cp` left a 0-byte file; heartbeat python writes EPERM; flap-watch
  probes A/B/G/H FAIL). Appends to existing files with content still
  land (verified 00:35Z). The run works around it by retrying
  fresh-file creation until the window clears; nothing is forced.

## Leg question (r138's carried blank, promoted to primary)

**The spotter blank.** `foodXp['spotter']` is 0 on every panel for
seven straight runs (r131–r137 plus r138): a villager can stare at
the wild all day and learn nothing. The spotter specialty exists —
`SPECIALTIES.spotter` in food.js maps the real plant trades (wild
food forager 3, gardener/farmer/arborist/florist 2, mushroom grower
1) and `specialistSkill` grows it through the r116 self-taught
ladder (5 XP → skill 1) — but nothing ever grants spotter XP and
nothing ever reads spotter skill. The "(future: faster ID)" the
table promises was never wired.

## Diagnosis (established BEFORE the panel — code reading, not panel data)

- Grant sites exist for the other four food specialties, all in
  game.js, all through `grantFoodXpCredit` (r128 dial: first 5 XP
  1:1, then 1 XP per 2 units, odd unit carried): butcher per hunt
  kill (~6847), preserver up to 2/day per rack batch (~7420), cook
  first-per-day per cook resolution (~7521, r131 — the uncapped
  grant raced to skill 3 in 42 days, so the per-day cap is the
  pace precedent), builder first-per-day per mend (~7579).
  **No `grantFoodXpCredit(..., 'spotter', ...)` call exists anywhere
  in src/js.**
- Consumers: `specialistsHere('spotter')` / `villageHasSpecialty
  ('spotter')` exist but no call site passes 'spotter' (app.js reads
  cook/preserver/butcher/builder only; `askSpecialist` handles
  butcher/preserver/cook tasks only). `bumpPlantFamiliarity`
  (game.js ~27454) sets the per-plant learn threshold with
  occupation adjustments (hunter/cook/chef → 2, nurse+medicinal → 2,
  bus driver/accountant/dropout → 4) — the spotter occupations get
  no benefit, and the threshold is fixed at first encounter.
- Identification itself is NOT the consumer: KNOWLEDGE.md law —
  "identification happens BACK AT CAMP" (sortBag ritual), "handling
  a plant builds RECOGNITION, never naming." The spotter effect
  must touch the recognition threshold only, never name a plant in
  the field.

## The fix (src/js, small, precedent-following — NOT driver-only)

`src/js/game.js`, three changes:
1. **Villager grant** — in `resolveOneAssignment`, task 'forage'
   (~6940): after the kcal stocking, grant 1 spotter XP to the
   forager, first-per-day via `foodXpDay.spotter` (the r131 cook
   pattern verbatim). Foraging IS handling plants; every forage
   resolution handles them. Pace: a daily forager reaches skill 1
   in ~5 days, skill 2 in ~25, skill 3 in ~55 — cannot race inside
   the 42-day leg (same arithmetic as the capped cook).
2. **Scholar grant** — in `bumpPlantFamiliarity` (~27454): grant 1
   spotter XP to the scholar, first-per-day via `foodXpDay.spotter`
   on the `getPerson(villagerId)` record. This is the single funnel
   for "handling a plant builds recognition" (forage sweep per
   species + nomad-wild examine paths), so the grant fires on any
   field handling.
3. **Faster ID (the consumer)** — in `bumpPlantFamiliarity`: the
   scholar's current spotter skill (`specialistSkill(person,
   'spotter')`, the same call game.js already uses for preserver/
   cook) lowers the learn threshold by 1, floor 1, when skill ≥ 1.
   Threshold is fixed at first encounter (existing shape), so the
   benefit applies to plants first met after the skill is earned.
   This wires the "(future: faster ID)" comment and nothing else:
   no field identification, no naming, no sortBag change.
- Deliberately NOT in scope: a spotter UI read (`askSpecialist`
  has no spotter task; the sortBag ritual is the spotter's natural
  UI home, but that is a design question, not a bug fix), and no
  change to the villager 25% learn event in forage resolution
  (the learn rate is a separate balance lever).
- FIX GATE: the fix lands only if the panel proves the grant fires
  in the wild (SPOTTER BAR) without regressing the carried guards.
  If the panel shows the grant never fires (e.g. nobody forages),
  the run reports NO-GO honestly and the fix does not land.

## Bars (binding, §14 — no mid-run re-scoring)
Driver: `scripts/journey-establishment-r139-20261114.js` (r138
driver clone + spotter instruments: read-only `bumpPlantFamiliarity`
wrap logging {day, pid, threshold, spotterSkill} + end snapshot of
`state.codex.plants` by-source counts; Q2 needle widened per r138
metric review; otherwise unchanged). Analyzer:
`scripts/analyze-journey-establishment-r139-20261114.js` (r138
analyzer clone + SPOTTER/LADDER/FASTER-ID bars + Q2 widened needle).
- **SPOTTER BAR (primary, new):** GO = panel total foodXp['spotter']
  ≥ 10 AND every panel seed contributes > 0 (was 0 on all 5 r138
  seeds, 0 on 7 straight runs). NO-GO = any panel seed with 0
  spotter XP total, or panel total < 10.
- **LADDER BAR (secondary):** GO = ≥1 villager reaches 5 XP
  (skill 1, first ladder rung) on ≥3/4 panel seeds. Report-only if
  the SPOTTER BAR is GO but this misses (pace read, not a kill).
- **FASTER-ID BAR (secondary):** GO = the threshold benefit fires
  (wrapped bump call with spotterSkill ≥ 1 and threshold below the
  no-skill value) on ≥2/4 panel seeds. NO-OPPORTUNITY = the scholar
  handles no plants on a seed (then the proof test carries the
  mechanism, staged). The proof test proves the mechanism regardless.
- **END BAR (carried, r85/r136/r137/r138 shape + bearer-change
  excuse):** GO = every broken-live forage run that (a) broke ≥ 2
  days before the run's end, (b) bearer is the player, (c) the
  ending status was ready on at least one dawn after breaking, is
  closed by the wedge within 2 dawns of breaking. NO-GO = any such
  run left live past that window, with each failure attributed.
  Bearer-change excuse stands (r138 stranded shape, out of scope).
  NO-OPPORTUNITY = zero broken-live forage runs across the panel.
- **STRANDED BAR (carried watch):** previous-bearer live runs are
  recorded in strandedLog with 0 work performed on them (r138
  mechanism). NO-OPPORTUNITY = zero such runs (expected: the
  precondition is rare — r138).
- **TRAVEL BRANCH (carried watch):** homeward sits hitting a
  clearable blockage reach home the same dawn. NO-OPPORTUNITY =
  zero such sits.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not
  drop across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
  r84 panel: ~15 on seed 994 alone; r85/r136/r137/r138: 0.
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel (r85/r136/r137/r138: 0).

## Q2 (report-only — canned-line variety watch, widened needle)
Count verbatim repeats of the standing-watch lines across the
panel's AFTER transcripts: taken-kin pod-dream closing (r135: 4×,
r136: 0, r137: 0, r138: 0), recap stitch "X — Still on Y" (r135: 5×,
r136: 1, r137: 0, r138: 0 verbatim), slope-reading lesson (r135: 4×,
r136: 0, r137: 1, r138: 0), "Walked in like they'd never left."
(r135: 5×, r136: 0, r137: 0, r138: 0), "Take it for what it's
worth." gossip closer (r135: 3×, r136: 0, r137: 0, r138: 0),
stew-bowl line (r135/r136/r137/r138: 0/1/0/0). **Widened per r138
metric review:** the recap needle now also counts the paraphrase
form /still (on|where we are)/ — r138's "that's still where we
are" (Lily, seed 2904) slipped the verbatim needle. No fix in this
run (scope is the spotter wiring); counts feed the next run's
question.

## Q3 (promoted — spotter is now the primary bar, see above)
The r131–r138 guard retires as a guard: foodXp['spotter'] is the
SPOTTER BAR now.

## Seeds, policy, horizon
Pilot: **5001** (band check complete — FRESH, see below; pilot runs on
the final driver, no R139_PILOT_BREAK — the pilot-break hold is a
wedge instrument for the END BAR, and this run's pilot gate is the
spotter instruments firing, not a forced break). Panel: **5002–
5005**, 42d horizon. Policy: competent (r85/r136/r137/r138 driver
shape — no withDelegate/HUNTSTAFF flags; verified in the driver).
Death-aware tail +10d.
Proof test: `scripts/test-journey-establishment-r139-spotter.js`
(staged: villager forage grants spotter XP once/day — second forage
same day grants nothing, non-forage task grants nothing; scholar
bumpPlantFamiliarity grants once/day; threshold 3 → 2 with spotter
skill 1, unchanged at skill 0, floor 1 with occupation threshold 2;
grant uses the r128 dial; det-gate: r139 driver twice, 5d pilot
seed, byte-identical outputs).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 5001–5005 is FRESH.** Pilot 5001, panel 5002–5005.
  Evidence-wide seed-context grep over `evidence/` + `scripts/`
  for 5001–5005: zero seed mentions (only 5-digit bands 65001–
  65016 / 65201–65216 matched the digit pattern as kcal/false
  positives). Prereg-name scan over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md`: only 85001–85004 and
  25001–25004 substring hits (different bands). Seed-name scan
  (`SEEDS=500[1-5]`, `seeds 500[1-5]`, `5001–5005`, `5001-5005`):
  zero files. Checked 2026-11-15 ~00:35Z.
- Rejected bands (this run): 3001–3005 — seeds 3004/3005 used in
  journey-social r32 pilot (2026-10-20, `journey-social-r32-pilot.
  log` + s3004/s3005 transcripts), and band 3001–3010 named in
  journey-landing r107/r108 preregs as having prior corpora.
  3101–3105 — seeds 3101–3108 used in sim-crumbdefault-b
  (2026-10-16, 32 runs) and journey-social r32/r33 (2026-10-20).
  3201–3205 — seeds 3201–3208 used in sim-aidfeastint-b
  (2026-10-16, 64 runs) and journey-crisis r22 (2026-10-18).
- Contaminated bands NOT reused for new questions (r135/r136/r137/
  r138 list carried): 1502, 1504, 1603, 1604, 17101–17112, 1142–1151,
  1801–1804, 1901–1916, 2001–2010, 2101–2116, 2201–2216, 2301–2316,
  2401–2416, 100001–100008, 1200–1209, 2501–2516, 2601–2616,
  2701–2705, 2801–2805, 2901–2905, plus 3001–3005, 3101–3105,
  3201–3205 (this run's rejections).

## Canon
docs/CANON.md + docs/KNOWLEDGE.md read at run start. KNOWLEDGE.md
laws binding this fix: "Human skills ≠ alien abilities" (spotter
is earthly knowledge — practice earns it, never a System slot);
"identification happens BACK AT CAMP" (the fix touches only the
recognition threshold, never names a plant in the field); "handling
a plant builds RECOGNITION, never naming" (bumpPlantFamiliarity's
own comment). **No canon doc covers the spotter specialty itself**
(the food.js "(future: faster ID)" comment is the only statement);
per loop rules this run says so instead of inventing canon. The
fix follows the r116/r128/r131 food-XP precedent (ladder, dial,
per-day cap) rather than a new system.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137/r138; the proof
test stages for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Steve RULED 2026-11-13 18:00 CST on the medicine holder-less lever:
ALL FOUR levers — (a) scholar fetches medicine, (b) traveling
healer visits, (c) any villager can search for medicine once
taught, (d) level-ups offer healing abilities with more incentive.
Build brief: goal
hidden_files/medicine-holderless-levers-brief-2026-11-13.md. This
run does NOT take that build — it belongs to a dedicated arm
(build-medicduty-h, live in the tree list) — but the panel's
wound-fever/healer numbers are relevant context and are reported.
Standing design question for Steve also stands, unchanged: should
the game release a dead bearer's outing on succession, or should it
linger in the successor's ledger forever? (r138 diagnosis.)

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND spotter instruments fire (≥1 bumpPlantFamiliarity wrap record
AND ≥1 villager forage resolution observed) AND the wedge closes
any broken-live run it meets. If the pilot forces a driver or fix
change, the panel restarts on fresh seeds and the pilot seed is NOT
scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133/r134/r135/r136/r137/r138 did
NOT roll forward. This run's panel is the r85/r136/r137/r138 driver
regime on a fresh band — guardrails should stay quiet; any LOUD
line is adjudicated as band noise vs real bug BEFORE rolling the
baseline forward. Metrics: guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths
(r135's set). The r138 checker runs hit the known schema mismatch
(the r85/r136/r137/r138 driver never emits `guardrails.*` fields,
so the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run DOES change src/js (the spotter wiring),
so unlike r138 a guardrail move cannot be dismissed by
construction — any LOUD line gets a real investigation.
