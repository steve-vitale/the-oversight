# sim-huntstaff-b — hunt-duty staffing lever (ARM sim-huntstaff-b)

Lever arm, loop B food-economy axis, run fleshout-b-20261017T1940Z.
Prereqs: sim-huntduty-b (0/672 hunt duties assigned — policy never asks;
finding #492), sim-huntroster-b (the ~0.6/seed was measurement artifact;
real substrate ~2.25 hunter-capable/roster; villagerCompetence +
includes('hunter') reference ghost occupations — dead code on 0/192).
This arm builds the policy-side staffing layer from huntroster's CORRECTED
handle.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §§9–12, 14)

- **PRIMARY (engagement):** hunt-duty assignments fired by the layer:
  `armed >= 8 across the 16 armed runs AND >= 4 of 8 seeds engage
  (>=1 assignment)`, vs `control == 0` (expected: no policy assigns hunt).
  GO requires BOTH the count bar and the seed bar — the mechanism must
  engage broadly, not on one lucky seed.
- **GUARDRAILS (every-gate; a miss is NO-GO, never re-scored):**
  - starvation deaths armed <= control + 2
  - villager deaths armed <= control (hunting is villager combat —
    injury 0.08–0.22, dmg 10–30; the layer must not trade villagers for meat)
  - no new death mode (armed death-cause set ⊆ control death-cause set)
  - det-gate: gate-OFF (HUNTSTAFF unset) trajectories byte-identical to
    pristine (no wrapper) — neutrality pinned before the sweep
  - national armed >= control - 2, median survival armed >= control - 10d
    (sanity gates; the layer should not move the scale wall)
- **HORIZON + why:** 180d death-aware (engine tail, no fixed 200d) — the
  hunt-duty blank is a mid-run staffing question and the wall metrics
  (national/table/Arc/wave reach, survival distribution) need full-run
  reachability; dead villages stop simulating (+10d tail max).
- **SEEDS:** 7801-7808 — fresh; verified zero overlap with every used
  list in evidence/2026-10-17 (cookbulk-b 7901-7908, huntroster-b
  7701-7708, huntduty-b 7611-7618, 7601-7608, camptasks-b 7101-7108,
  shelltask-b/feastvoice-b 6101-6108, 4801-4808, 4101-4108, 9701-9708,
  5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808, 962-969, 941-948,
  951-958, 4001-4004, 8901-8908, 8801-8808, 8701-8708, and all others
  grepped from the evidence dir).
- **POLICIES:** leadfeast, belongfeast × {armed (HUNTSTAFF=1), control}
  = 32 runs. Own in-sweep control, identical seeds. FEASTSCALE_R13=1 and
  SEATDRIVE=0 set EXPLICITLY (pre-seat r13 substrate, matches the
  huntduty/huntroster audits).
- **EVERY-GATE RULE:** all gates must pass for GO. A miss is NO-GO —
  killed arms leave no trace (layer deleted, zero-trace per kill
  protocol; evidence + instruments kept). Kill fast at pilot if the
  mechanism cannot engage.
- **§15 balanced panel:** per-seed panel-schema JSONs (schema
  'huntstaff-wall/1') for the wall metrics alongside the sweep output;
  run scripts/balance-panel.js compare --before <control> --after <armed>
  --out <prefix> and attach the compare .md. The panel is the instrument,
  the pre-registered threshold is the judge.
- **Sense-testing (law):** read at least one transcript day — does the
  village's hunting talk now have an actor? Is the fiction coherent (the
  System orders hunts; does the village answer)?
- **COMPLETION GATES:** 32/32 runs complete, schema-clean output, 0
  instrument errors, det-gate green, proof test RED/GREEN/det-gate green.

## Canon read

- docs/CANON.md: read. Hunting is human-skill lane (occupations grant it
  as background; npcSeedSkills seeds it) — the staffing layer assigns
  LABOR, never an alien ability. "If you don't know, it doesn't show" —
  the layer assigns people by what their backgrounds say they know.
  No silent actions: the engine's hunt-resolution beats are narrated by
  game.js already (resolveOneAssignment 'hunt' branch).
- docs/PRESERVATION.md: read. The hunt returns 'Game meat' to the
  pantry (cleaned state, ~2d shelf, risky) — the first rung of the
  preservation ladder; the village's cook/smoke machinery is the
  downstream. The layer only puts meat in the pipeline; it does not
  invent processing.
- docs/BEAR.md: read for the safety argument — hunting big game is real
  villager combat (maul 8–17 at range ≤2), hence gates (b)/(c): only
  hunter-substrate, HP≥40, trust≥40, one hunter at a time; the engine's
  own HP/in-person/obedience gates stay as the last word (the layer
  pre-filters; the engine enforces).
- No canon doc mandates hunter rarity or forbids village-organized hunts
  (huntroster canon read: VISION.md's "12 random people" is the only
  roster canon; the fiction EXPECTS hunters). No canon invented: the
  machinery (delegateTasks 'hunt', resolveOneAssignment 'hunt' branch,
  villagerHuntResolve) exists and is untouched — zero src/js changes.

## The layer (built per the corrected spec)

- scripts/policies/huntstaff.js — HUNTSTAFF=1 gate (default OFF; unset =
  pure delegation to the base policy). Zero src/js changes.
- Staffing handle (CORRECTED, from huntroster-b named fix spec §3 —
  NOT the ghost-occupation list from the old huntduty spec, which matches
  only 'infantry soldier'):
  `assignBest(Game,'hunt',['hunting guide','fishing guide','trail crew',
  'rancher','forager','bush pilot','exterminator','soldier'])`
  Gates:
  (a) lean/starvation day: pantryFreshDays() < 4 (the engine's own
      PRODTHROTTLE threshold — the village is eating into its buffer) OR
      scholar kcal < 50% cap OR scholar kcal < 500. The blank matters for
      food: a full pantry (>4 fresh days) is not a hunt day.
  (b) hunter-substrate villager: free (roster, alive, unassigned),
      formerOccupation matches the corrected word list, HP≥40 (read from
      village.health the engine's own way), trust≥40 (village.trust —
      avoids the 40% reluctant roll; the engine's trust-20 gate + HP gate
      + in-person gate still enforce themselves).
  (c) one hunter at a time: no existing 'hunt' assignment among
      village.assignments.
- The pass fires in the wrapper's upkeep + daily hooks (once per day,
  ctx-day key, same cadence as the sibling withCookBulk wrapper) when the
  scholar is at Haven (in-person assignment is the engine's honest line).
- Best-scoring hunter-substrate villager assigned; ctx telemetry
  (ctx._hsAssignments, .bySeed-day log) only written when the layer fires
  (gate-off: zero writes — the det-gate pins this).

## Results

COMPLETION GATES (pre-registered): 32/32 runs complete (8 fresh seeds
7801-7808 × {leadfeast,belongfeast} × {armed,control}, 180d death-aware),
0 instrument errors, all 32 per-seed JSONs schema-clean
(evidence/2026-10-17/perseed-huntstaff/, schema 'huntstaff-wall/1').
Det-gate (test-huntstaff-b.js Part B): 16/16 wrapped-off byte-identical
to base, 0 layer-attributable divergences. Proof test: 12/12 fixture
checks (RED/GREEN), smoke green — ALL GREEN before the sweep.

### PRIMARY — engagement: GO (decisive)

| | armed | control |
|---|---|---|
| hunt-duty assignments fired | **48** (bar: ≥8) | 0 |
| seeds engaging (≥1 assignment) | **5/8** (bar: ≥4) | 0/8 |
| assignTask hunt attempts (instrument) | 48 | 0 |
| villagerHuntResolve calls (instrument) | 48 | 0 |
| kills (kcal > 0) | 41 | 0 |
| hunt kcal to village pantries | **177,065** | 0 |

Engaging seeds: 7801, 7804, 7805, 7806, 7808. The corrected staffing
handle works: every assignment resolved through the real
villagerHuntResolve machinery (real animal, real tile wildlife, injury
roll), 41/48 kills, zero engine refusals escaping the gate pre-filter
(attempts == assignments fired == 48 — the trust≥40/HP≥40/in-person
pre-filter held).

### GUARDRAILS — five pass, one misses

| gate | armed | control | bar | verdict |
|---|---|---|---|---|
| starvation deaths | 2 | 3 | ≤ control+2 (5) | PASS |
| villager deaths | 645 | 690 | ≤ control | PASS |
| new death mode | none | — | armed ⊆ control modes | PASS* |
| det-gate | 16/16 identical | — | byte-identical gate-off | PASS |
| national | 14/16 | 14/16 | ≥ control−2 | PASS |
| **median survival** | **150.5d** | 163d | ≥ control−10d (153) | **MISS (−2.5d)** |

\* "Ugly-Eyes" appears in armed causes but not control — verified a
wave-3 monster name (evidence/2026-10-17/sim-casualtyseq.md), i.e. an
instance of the existing monster death mode, not a new mode. Zero
hunt-attributable death causes in armed (no cause string mentions hunt;
the hunting injury roll killed no one).

Wall numbers (standing directive): wins 0=0 (pre-seat substrate — no
modal driver, same as the huntduty/huntroster audits), table 15 vs 14,
national 14 vs 14, Arc IV 15 vs 14, wave-4 0/16, wave-5 0/16, max
survival 182d both. The scale wall did not move.

### §15 balanced panel

scripts/build-huntstaff-panels.js → evidence/2026-10-17/huntstaff-panel.{json,md}
(+ -before/-after.json.gz). Decision: **review_required**.
regression_watch flags: playerDeaths leadfeast +0.875 (CI −0.125..2),
playerDeaths100Days belongfeast +0.92 (CI −0.004..2.08), communityLost
belongfeast +0.25 (CI 0..0.625) — all CIs touch or include 0
(exploratory, not significance). The communityLost watch is the same two
flipped runs behind the median miss (s7804/s7808 belongfeast
survived→village-lost). Table/national/survival30/60: no_material_signal.
The panel is the instrument; the pre-registered threshold is the judge.

### The median miss, investigated (same-run diagnostics)

The miss is 2.5d on a median over 16 runs. Paired survival deltas
(armed−control): +15, +43, 0, 0, 0, 0, −32, −33, +22, 0, +81, −38, 0, 0,
+7, −69 — range −69..+81, **mean −0.25d**. No dose-response: the
heaviest-engagement run (s7806 leadfeast, 11 assignments, 78,534 kcal)
went village-lost→survived **+81d**; the largest negative (−69d, s7808
belongfeast, 6 assignments) and a −33d (s7804 belongfeast, 10
assignments) sit beside a +43d (s7801 belongfeast, 2 assignments).

s7804 belongfeast autopsy (deterministic re-run, hunter-fate
instrument): hunts d24–d46 put ~62.9k kcal into the pantry (peak 44.8k);
the meat was EATEN, not rotted (pantry drained to ~1k by d131). Hunter
Karen Jang died d79 in ordinary **combat** — not a hunting death (the
injury roll never killed anyone all pilot). No eligible hunter remained
after her; the village ate through its stocks and scattered d149 on the
famine mechanic ("village-lost" = the scattering at 3 hungry days,
game.js 28552 — a starvation game-over, not a hunt mechanic). Control
survived to 182 on different combat RNG with 49 villager deaths vs
armed's 25. The divergence is combat-lottery, not layer harm: zero
hunt-attributable deaths, fewer total villager deaths, no mechanism.

Conclusion: the layer's measured survival effect is ≈0; the ±10d median
gate sits far below the substrate's combat-noise band and false-fired on
noise. Metric-broken, not layer-harmful — but §14 binds the miss all the
same (see Metric review).

### Verdict: KILLED-AT-PILOT (every-gate rule) — metric-broken

The pre-registered every-gate rule is explicit: all gates must pass for
GO, and a miss is NO-GO never re-scored. The median-survival sanity gate
missed (150.5 < 153). **This run is NO-GO.** Per the kill protocol the
layer is deleted zero-trace; evidence + instruments + proof test are
kept. Per Steve's approved §14 escape hatch (metric-broken kills re-run
as new runs; the original NO-GO stands), the corrected re-run is named
below — it does not rescue this run.

**Named re-run: sim-huntstaff-b2** — rebuild the layer from this
evidence (spec §"The layer" above, unchanged), corrected
pre-registration: (a) survival gate on the paired-MEAN delta with a
noise-scaled tolerance (|mean Δ| ≤ 20d, set from this pilot's measured
±70d band) or wall-only (national/table/wins/arc — the actual scale-wall
metrics); (b) hunter-fate instrument as standard (track assigned
hunters' death causes — the /tmp/diag-huntstaff.js design); (c) 8 fresh
seeds (suggest 7811-7818 — VERIFY against all used lists at re-run
time; 7801-7808 are now used). The engagement bar (≥8 assignments,
≥4/8 seeds) and the four safety guardrails carry over unchanged.

## Sense-test (law)

Read d24, s7804 belongfeast (first hunt day), as a player:

- `📋 Karen — 🏹 Hunt. They'll report back by next part.` — the
  assignment is narrated, in the duty voice.
- `🏹 Karen brings down a Black Bear — clean kill, +18000 kcal to the pantry.` —
  the village's hunting talk now HAS AN ACTOR. Karen Jang the
  exterminator, eleven seasons of reading sign in another life, walks
  out and the System itself watches: `◈ THE SYSTEM has been watching
  Karen — Field 1. Three offers; they took Bloodhound.`
- d26: `🏹 Karen brings down a Eastern Chipmunk — clean kill, +90 kcal
  to the pantry.` — bear one day, chipmunk the next: honest ecological
  variance through the real wildlife machinery, not a flat roll.
- The fiction is coherent: the System orders hunts (`Catch something!
  Anything!` challenges circulate on these seeds) and now the village
  answers — with a name, a background, and meat that lands in the
  pantry the village actually eats.
- One slightly busy beat: a same-day `💧 Karen returns with water`
  alongside the bear kill — a person doing two things, not incoherent,
  but worth a look in the re-run.

## Village assessment

Nine villages learned what a hunt looks like: 48 assignments where the
census measured 0/672, 177k kcal of real meat through the real
resolution machinery (41 kills, real species, real injury rolls, zero
attributable deaths), and the fiction gained a hunter with a name —
Karen Jang, who the System itself started watching. The villages that
engaged ate the meat (starvation deaths fell 3→2; the s7804 pantry
drained 44.8k→1k over 85 days of being eaten). Who died: fighters, as
always on this substrate (combat 467-class); the hunters died in
ordinary combat, not on the hunt. The blank I filled: the policy now
knows the corrected staffing handle and the gates that make it safe —
the re-run inherits all of it. What I could not fill: the median gate
fired on combat noise, and §14 does not let me un-fire it. The layer is
deleted; the spec survives in this file.

## Metric review (mandatory)

- PRIMARY (engagement) answered exactly: 48 armed vs 0 control, 5/8
  seeds, instrument agrees (48 attempts = 48 resolves).
- The median-survival gate (±10d on an n=16 median) **proved wrong for
  this substrate**: paired deltas span −69..+81d on combat RNG (mean
  −0.25d), so the tolerance sits an order of magnitude below the noise
  band — it cannot distinguish layer harm from the combat lottery at the
  pre-registered bar. It false-fired here: zero attributable harm
  mechanism, wall metrics unmoved, no dose-response.
- Per the approved §14 escape hatch this is recorded as **metric-broken**:
  the original NO-GO stands; the corrected pre-registration (noise-scaled
  tolerance, hunter-fate instrument, fresh seeds) applies to the NEXT run
  (sim-huntstaff-b2), never rescored into this one.
- No other metric was re-scored mid-run. The "no new death mode" gate was
  judged at the MODE level (Ugly-Eyes = wave-3 monster instance), set
  before spend, not rescored.
- Det-gate ran 60d per the proven pattern (test-cookbulk-b.js Part C);
  the sweep's 180d horizons are death-aware (engine tail).
- Panel-schema JSONs emitted per seed
  (evidence/2026-10-17/perseed-huntstaff/, schema 'huntstaff-wall/1');
  balance-panel compare attached (evidence/2026-10-17/huntstaff-panel.md,
  decision review_required — the instrument; the header is the judge).
- One evidence-hygiene note: the first build-huntstaff-panels.js draft put
  HUNTSTAFF in the panel flags, which the panel correctly rejected as
  "Unmatched flags" (invalid comparison). Fixed to the cookbulk pattern:
  panels describe the identical substrate; the treatment is the
  before/after split; neutrality comes from the det-gate. The invalid
  draft outputs were deleted, not kept.

## Findings for sim-findings.md

- [open] 2026-10-17 — huntstaff median-gate metric-broken — the ±10d
  n=16 median-survival sanity gate false-fires on this substrate's
  combat-noise band (paired deltas −69..+81, mean −0.25). Corrected
  re-run sim-huntstaff-b2 spec'd in evidence/2026-10-17/sim-huntstaff-b.md
  (noise-scaled tolerance, hunter-fate instrument, fresh seeds).
  (run fleshout-b-20261017T1940Z)
- [open] 2026-10-17 — hunter mortality signal (weak) — hunter-substrate
  villagers may die faster in ordinary combat (huntroster: 38.9% vs 50%
  day-90 retention; this run: Karen Jang d79 combat). Is it exposure
  (hunters take risks) or the layer pulling defenders? The b2
  hunter-fate instrument is built to answer it. (run
  fleshout-b-20261017T1940Z)

