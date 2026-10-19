# SIM-DOOMDRAW-B — the doomed-only draw discipline (arm sim-doomdraw-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261018T174550Z · Worker tree: ~/workspace/worktrees/sim-doomdraw-b
Axis: food-economy (scale-wall lens) — the draw-side targeting discipline.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14–15 — binding, written BEFORE sims)

- **Question**: three killed draw-side variants (windfall feast, rackscap
  capacity, feastdraw seconds) were all VOLUME levers — how MUCH the village
  draws. The one draw-side idea never measured is a TARGETING discipline:
  WHICH food the draw takes. Can a doomed-first + fresh-reserve-floor
  discipline at every pantry draw cut rot without the volume levers'
  rebound/displacement costs?
- **The tension, stated honestly**: prodrebound-b's named next says "NEVER
  another draw-side lever (3 killed draw variants prove the draw
  exhausted)". Those three were volume levers (feastdraw scaled draw volume,
  windfall scaled glut feasts, rackscap doubled capacity). This arm is the
  one draw-side idea NOT yet measured: a targeting discipline (which food is
  drawn, not how much). If it fails at pilot, say so plainly — the draw
  program then closes permanently.
- **Lever**: scripts/policies/doomdraw.js (DOOMDRAW=1, default OFF; FOODLEVER
  pattern; wraps leadfeast/belongfeast as leaddoomdraw/belongdoomdraw). At
  every Game.pantryDraw (nightly meal, player villageMeal, hostFeast, all
  other callers): doomed (about-to-rot: bonus-inclusive spoilDay+bonus ==
  day+1) first in spoilage order; fresh only when the doomed pile can't
  cover the meal; NEVER draw fresh below the FLOOR_DAYS=2 fresh-days reserve
  floor. Partial-unit hold-back of the freshest non-doomed fresh-sink
  stacks, restored exactly. Doomed is NEVER held (feastdraw-b canon:
  tonight's draw is its only rescue path). A floor-caused shortfall
  suppresses shortOfFresh EXACTLY (engine's own effective-kcal math) so the
  drawSpoiled desperation path never fires on a floor artifact. One voice
  line per bound night names the cook and the reason (no lever name).
  Finding #546 fresh sink: foodState fresh/undefined/cleaned/cooked;
  preserved/rendered/pemmican/smoked/dried excluded; spoiled never in the sink.
- **MECHANISM HONESTY**: the engine's pantryDraw ALREADY draws
  soonest-spoiling-first at every draw (blitz-eatlast 2026-10-13, Steve
  design call). The ordering half of this discipline is ENGINE LAW, not a
  lever delta — the proof pins it (RED: wrapped==base). The UNMEASURED half,
  the only thing this arm tests, is the 2-fresh-days reserve floor. The
  floor's plausible rot channel is indirect at best (a fatter pantry may
  cool the production rebound the feastdraw arm measured at r=+0.73); its
  direct effect is famine insurance, which trades against hunger in lean
  villages. The primary is a reach — pre-registered anyway, per §14 the
  miss binds.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  base courtship policies only. 180d death-aware; dead villages stop (+10d
  tail max). Assert env up front; SWEEP STOPS on mismatch.
- **HORIZON WHY (§10)**: 180d — rot accumulates across the whole run and the
  reachability half of the mission (waves 4–5, national, table) needs the
  long window. Death-aware: dead villages stop simulating.
- **SEEDS**: pilot 8 FRESH seeds 6551–6558 x {leaddoomdraw, belongdoomdraw} x
  {control, armed} = 32 runs, IDENTICAL seeds both sides, own in-sweep
  paired control. Freshness verified 2026-10-18: 6551–6558 clean in
  scripts/sweep-*.js, scripts/test-*.js, and evidence/2026-10-1[678]/sim-*.md
  (the 6606 lesson: substring hits are float artifacts — scanned honestly
  with seed-declaration patterns, not substrings). 6951–6958 held in reserve
  for a possible confirm. Banned/used before this run: 4201–4208,
  4301–4308, 4401–4408, 4501–4508, 4601–4608, 17011–17018, 4801–4808,
  4811–4822, 4901–4908, 5111–5118, 5101–5108, 5601–5608, 6201–6208,
  6303, 6401–6408, 6606, 6808, 7001–7008, 7601–7608, 9292–9295,
  99101–99108, 9921–9928, 105101–105104.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — armed <= 0.85x control (the axis standard bar).
- **ENGAGEMENT** (kill-fast, the mechanism's own gate): floor-bound nights
  (draws where the floor truncated the meal) >= 8 across the armed side. If
  the floor never binds, the arm measured nothing — KILL at pilot as
  invisible. Secondary (discipline operating check): doomed-drawn share of
  all drawn kcal >= 60% on the armed side (expected on control too — the
  ordering is engine law; this confirms the targeting discipline is
  operating, not a lever delta).
- **Guardrail (a) — median survival** >= control−10d.
- **Guardrail (b) — dose-aware starve-rate** (the b2 revision; the 1.15x
  per-pair bar is RETIRED): FAIL only if the pooled starveDays/100d rate
  rises >+15% AND per-pair rate deltas correlate with mechanism dose
  (floor-bound nights per pair) at r > +0.3. Collapse-aware: pairs where
  both survived >30d.
- **Guardrail (c) — no new death mode** (the b2 revision): exposure-matched,
  ≥2 count floor — a cause counts only if ≥2x on the armed side AND each
  armed death counted only while its paired control twin was alive AND
  absent from the control cause set (thirst/dehydration canonicalized,
  dedup on (who,day,cause), person-kind only per #515/#517/#525/#544).
- **Guardrail (d) — laundering 0**, measured AT CONVERT TIME (cook-drive
  wrapper: a preserved/rendered stack spoiled before conversion). The layer
  converts nothing; the proof pins no-conversion by object identity.
- **Det-gate**: wrapped+DOOMDRAW-unset byte-identical to base over 40d
  (2 seeds × 2 policies); wrapped==wrapped identical. PROOF GREEN before
  any sims (scripts/test-doomdraw-b.js: 43 checks — RED gate-off delegation
  byte-identical incl. pantry state, GREEN floor binds/partial-unit
  hold/restore-exact/suppression-exact/doomed-never-held/preserved-excluded/
  voice-once/lever-name-absent/telemetry/determinism/idempotent-install/
  preview-copy; G-laundering by identity).
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js on
  the named registry policies (leaddoomdraw, belongdoomdraw — additive
  entries in scripts/sweep-compare.js, existing entries untouched), same 8
  seeds × 180d, gate-off (DOOMDRAW unset) vs DOOMDRAW=1, env FEASTSCALE_R13=1
  / SEATDRIVE=0 both builds. The panel is the instrument; the pre-registered
  primary/guards are the judge. The compare .md is attached. 8-seed pilot
  reports "screen only" per §15 confirmation sizing. src/ frozen for the
  panel's duration (policy-side lever: no src/ changes exist at all).
- **Sense-testing**: read the draw beats on the highest-engagement seed;
  prove they are sensical (SENSE-TESTING LAW); sample villager behavior
  (goals, routines, dialogue, reactions) — flag anything robotic.
- **Telemetry**: node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall-preseat.json --current
  '<per-seed-glob>' --metrics national,table,wins,exiled. Investigate every
  LOUD line (the winseat-regime artifact is documented — verify, don't assume).

## §14b pre-pilot substrate checklist (checked BEFORE the sweep)

1. **Contact**: the floor binds iff freshKcal − want − maxUnit < 2×burn —
   i.e. lean pantries. The engagement gate (≥8 bound nights) IS the contact
   probe; a miss kills as invisible, not as a rot verdict.
2. **Pool sizing**: control rot/100d on this substrate ≈ 130k (prior arms);
   the 0.85x bar needs ≈ 20k/100d saved. The floor withholds ≈ 1.5k per
   bound night; with 10–30 bound nights/run the withheld pool is 15–45k —
   but withheld ≠ saved (withheld fresh rots later or is eaten later). The
   rot-reduction channel is indirect (production-rebound cooling); the bar
   is the axis standard and the miss binds either way.
3. **Verb existence**: the discipline rides the engine's own pantryDraw —
   the verb exists; the layer only withholds.
4. **Horizon fit**: 180d death-aware contains the full rot accumulation and
   the reachability window.

## Instruments

- scripts/policies/doomdraw.js — the layer (DOOMDRAW=1, default OFF).
- scripts/test-doomdraw-b.js — proof: 43 checks ALL GREEN pre-sweep (RED
  gate-off byte-identical incl. pantry state; GREEN floor binds, partial-unit
  hold, restore-exact, suppression-exact, doomed-never-held,
  preserved-excluded, spoiled-untouched, voice-once, no lever name,
  telemetry, determinism, idempotent install, preview-copy floored honestly;
  laundering pinned by object identity).
- scripts/detgate-doomdraw-b.js — 2 seeds × 2 policies × 40d, wrapped+unset
  == base byte-identical, wrapped==wrapped identical. DET-GATE GREEN.
- scripts/sweep-doomdraw-b.js — 32 runs: rot:fresh vs rot:preserved split
  (deduped by item identity in sweepSpoiled), duty-time cook drive
  throughput + laundering at convert time, kind-aware person/villager deaths
  (deduped, canonicalized), starveDays (npcNeeds hunger>70), drawSpoiled
  desperation volumes, stockSurplus inflow, doomdraw telemetry
  (ctx._ddTele: draws/held/bound/withheld/doomedDrawn/drawnTotal/voiced).
- scripts/analyze-doomdraw-b.js — aggregator with the pre-registered verdict
  (primary ratio, engagement gates, dose-aware starve-rate with
  Pearson(dose, rate-delta), exposure-matched new-death-mode, wall numbers,
  per-pair table).
- scripts/sense-doomdraw-b.js — SENSE-TESTING LAW: re-runs the top-engagement
  seed armed, prints floor/hunger/spoil beats + talk sample + roster sample.

## Sweep results

### Pilot (32 runs: 8 fresh seeds 6551–6558 x {leaddoomdraw, belongdoomdraw} x {control, armed})

| metric | control (16) | armed (16) | pre-reg |
|---|---|---|---|
| rot/100d (**PRIMARY**) | 138,870 | 129,065 | **FAIL** (ratio 0.929 > 0.85) |
| floor-bound draws (engagement) | 0 | 1,720 | **PASS** (≥ 8 — massive) |
| doomed-drawn share (secondary) | — | 27% | **FAIL** (bar 60%) |
| withheld kcal | — | 1,471k | (info) |
| voiced nights | — | 401 | (info) |
| median survival | 134d | 163d | **PASS** (+29d ≥ -10d) |
| starveDays/100d (pooled) | 22.7 | 30.2 | (info, +33.4%) |
| dose Pearson(bound, rate-delta) | — | +0.27 | guard **PASS** (needs >+0.15 AND r>+0.3) |
| laundered | 0 | 0 | **PASS** |
| spoiledDrawn (desperation) | 0k | 0k | (info — suppression held) |
| new death mode | — | the night×2, the humming in the grass×2 | **FAIL** (strict, ≥2 floor) |
| national | 6/16 | 11/16 | (info) |
| table | 14/16 | 14/16 | (info) |
| wins | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 12/16 | 10/16 | (info) |
| wave 5 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-doomdraw-b/.

**Pilot verdict: NO-GO** (primary 0.929x vs the 0.85x bar). Per §14, a miss
is NO-GO, never re-scored. The arm is KILLED: layer deleted zero-trace;
evidence + instruments landed.

Dose-responses (the attribution autopsy):
- Pearson(bound draws, log rot-ratio) = **+0.03** (n=16) — the rot movement
  does NOT track mechanism dose. The 7% pooled rot shift is trajectory
  noise, not lever effect.
- Pearson(bound draws, survival delta) = +0.27 — weak, under the +0.3
  attribution bar.
- Pearson(withheld kcal, log rot-ratio) = +0.11; Pearson(withheld, survival
  delta) = +0.24 — same story.

Per-pair rot ratios (same-seed control vs armed):

| pair | rot C→A | ratio | bound | surv C→A | note |
|---|---|---|---|---|---|
| belong 6554 | 112k→1k | 0.01 | 120 | 141→94 | best pair |
| belong 6558 | 87k→5k | 0.05 | 99 | 180→162 | |
| lead 6554 | 115k→8k | 0.07 | 154 | 135→103 | |
| belong 6551 | 100k→25k | 0.25 | 69 | 150→154 | |
| lead 6552 | 320k→103k | 0.32 | 108 | 120→155 | |
| belong 6557 | 133k→44k | 0.33 | 157 | 86→179 | |
| lead 6555 | 479k→254k | 0.53 | 91 | 167→180 | |
| lead 6551 | 65k→78k | 1.19 | 62 | 141→136 | |
| lead 6553 | 14k→19k | 1.34 | 157 | 163→173 | |
| lead 6557 | 111k→201k | 1.81 | 103 | 61→143 | |
| belong 6552 | 239k→528k | 2.21 | 20 | 175→180 | backfire, low engagement |
| belong 6555 | 84k→300k | 3.56 | 89 | 133→180 | backfire |
| lead 6558 | 27k→135k | 4.92 | 32 | 95→180 | worst backfire, low engagement |
| lead 6556 | 0k→19k | — | 224 | 39→150 | early-collapse control |
| belong 6553 | 0k→32k | — | 99 | 97→164 | early-collapse control |
| belong 6556 | 0k→140k | — | 136 | 32→180 | early-collapse control |

The pattern: the biggest IMPROVEMENTS (0.01–0.07) and the biggest
BACKFIRES (2.21–4.92) both occur across the engagement range — the two
worst backfires have the LOWEST engagement (20, 32 bound draws). With
r=+0.03, neither direction is attributed to the mechanism: the floor
withholds food, the village's trajectory diverges, and rot follows the
trajectory, not the dose.

The new-death-mode trip: "the night"×2, "the humming in the grass"×2 —
both read as monster/event names, no mechanistic path from a pantry-draw
floor (no combat/water/social touch). Noise-level, strict by design —
noted, not investigated (same treatment as the feastdraw-b singletons).
The primary miss kills regardless.

### §15 balanced-panel compare

Built before/after through scripts/balance-panel.js on the named registry
policies (leaddoomdraw, belongdoomdraw — additive entries in
scripts/sweep-compare.js), same 8 seeds × 180d, gate-off (DOOMDRAW unset)
vs DOOMDRAW=1, env FEASTSCALE_R13=1 / SEATDRIVE=0 both builds. Both panels
valid (16 cases, neutrality proofs green, no validity errors — the manifest
is identical across builds since the lever is file-identical and only the
env gate differs). Compare: evidence/2026-10-18/doomdraw-panel-compare.md
(panel.json.gz + compare.json alongside; cases/ caches not committed per
§15).

**Panel decision: review_required** (screen only, 8 pairs — exploratory
intervals, not verdicts). Investigation notes:
- leaddoomdraw: Mean sampled living NPCs -1.14 (**regression_signal**,
  interval -1.98 to -0.29); sampled hydration below 25% +0.030
  (**regression_signal**); player deaths per run +2.875 (watch); community
  loss rate -0.5 (improvement, no_material_signal); sampled hungry NPCs
  +0.017 (watch).
- belongdoomdraw: Sampled hungry NPCs +0.035 (**regression_signal**,
  interval 0.010–0.067); player deaths per run +2.875 (watch); mean living
  NPCs -1.14 (watch); table invitation -0.125 (watch).

Per §15 these never override the pre-registered verdict — but two notes
survive: (1) the hunger cost the sweep measured (+33% starveDays) shows on
the panel too (hungry-NPC regression_signal on belong); (2) the
bearer-churn pattern REPEATS across food-economy arms — portionwindfall-b2's
panel showed lead-road player deaths +2.5/run, and doomdraw shows +2.875 on
BOTH roads, even as village-level survival improves (+29d median) and
community loss falls (-0.5 on lead). The village survives; the bearer <redacted>
The next food-economy iteration must reconcile village survival with
bearer churn before any land — the same standing question the windfall arm
filed.

## Wall numbers (every run)

Armed: national 11/16, table 14/16, wins 0/16, w4 10/16, w5 0/16,
median 163d, max 180d. Control: national 6/16, table 14/16, wins 0/16,
w4 12/16, w5 0/16, median 134d, max 180d. The wall stands (zero wins,
wave-4 ceiling, pre-seat). This arm does not attack the wall — but national
reach ticked up 6→11/16 on the armed side (info only; the panel judges
whether it's signal).

## Village assessment (plain words)

Thirty-two villages, sixteen twinned. The armed twins eat under a
discipline: the doomed pile first (as always — engine law), and never
below two days' fresh in the bins. The floor bound 1,720 draws and withheld
1.47M kcal across the pilot — on the leanest seed (6556) it bound 224 times,
voicing its line 45 nights in 90 days: the cook, every night, keeping two
days' food back while the village eats what won't keep.

Who thrived: the collapse seeds. 6556's control twins died at 39d/32d; the
armed twins lived 150d/180d. 6557: 61d→143d, 86d→179d. 6553 belong:
97d→164d. Twelve of sixteen armed twins outlived their controls (median
+29d). The mechanism is legible: the control twins eat their reserve in
lean stretches and then hit the bare-pantry famine cliff; the floor forces
the village to stretch food, so villagers go hungry (starveDays +33%
pooled) but the village doesn't die. Chronic mild hunger instead of
collapse — rationing beats feasting-then-famine.

Who died: the same early collapses take both twins sometimes, and on two
seeds the armed twin died earlier (6554: 135→103d, 141→94d — the floor's
hunger cost, uncompensated). Combat and sickness dominate the death ledger
as usual; the floor never manufactured a starvation (spoiledDrawn 0k both
sides — the suppression held).

What was missing: nothing about the mechanism's operation — the proof
pinned every behavior, the pilot engaged it 1,720 times. What is missing
is a rot-reducing channel: withheld fresh food is not doomed food. It sits
for tomorrow — and the d35 spoil beat on the sense seed shows it honestly:
"The village threw out spoiled stores: Garden harvest." Withheld food rots
later. The floor moves WHEN food is eaten, not WHETHER it rots. The
per-pair rot ratios (0.01 to 4.92, dose-unattributed r=+0.03) are the
village's trajectory answering, not the lever working.

Which blank I filled: the draw program's last unmeasured idea is now
measured. The targeting discipline (doomed-first ordering) was already
engine law; the reserve floor — the only unmeasured half — engages
massively, buys survival (+29d median), costs hunger (+33% starveDays), and
does not move rot (0.929x, unattributed). The draw side is now exhausted
for rot: four killed variants (windfall, rackscap, feastdraw, doomdraw).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-doomdraw-b.js, seed 6556 (highest engagement, 224 bound
draws), 90d, DOOMDRAW=1:

The floor's line reads as a cook making a sensible call, naming the right
person each night (Thabo, Alejandra, Gabriela, Nathan rotate as the cook
role moves): "🍽️ Thabo keeps 2 days' food back in the bins — tonight the
village eats what won't keep." It fires on consecutive lean-cluster nights
(d27–d31, d35–d37) — the substrate, not a bug — 45 voiced nights in 90
days on this chronically-lean seed.

The hunger beats track the floor honestly: "Alejandra went to sleep hungry.
Nobody says anything." on d1/d2, both floor nights. Villagers react to
short meals the way the engine always voices hunger — no new fiction
needed, none invented.

The spoil beat is the mechanism's cost made legible: d35 "The village threw
out spoiled stores: Garden harvest. Zoltan mutters: 'Should've smoked
that.'" — withheld food, rotted later. The narrative arc is coherent:
the floor withholds, the food sits, some of it turns.

**PASS with two polish notes** — (1) day-1 cook name renders as "A" ("A
keeps 2 days' food back") — the name-gate descriptor ("A hungry-looking…")
split on the first space; the line should use the full displayName.
Cosmetic, day-1 only. (2) 45 voiced nights/90d on chronic-lean seeds is
repetitive by construction — the line varies the cook's name, which is the
only humane variation available; acceptable.

Villager behavior sample (d92, roster 6/12): hunger 16–50, health 63–100,
occupations differentiated (Baker, blacksmith, mechanic, tailor, paramedic,
welder). Talk beats: the idle "You wait. The light changes." lines are the
headless policy waiting, not villager dialogue; the raid beat (d24, Ines of
Stonebridge demanding ~2,000 kcal) and the trust refusal (d30) read as
people with motives. Nothing robotic flagged in the sample — but the sample
is thin (one seed, 90d); the people-check is not the claim of this run.

## Blanks filled / documented

- **FILLED (finding)**: the doomed-only draw discipline is KILLED at pilot
  — primary 0.929x (bar 0.85x), engagement massive (1,720 bound draws,
  1.47M kcal withheld, 401 voiced nights), survival +29d median, starvation
  rate +33% pooled but dose-unattributed (r=+0.27 < +0.3), laundering 0,
  desperation-drawn 0k both sides (the shortOfFresh suppression held
  everywhere). The draw program's last unmeasured idea is measured: the
  ordering half was engine law; the floor half buys survival, not rot
  reduction. **The draw side closes permanently for rot levers.**
- **FILLED (finding)**: DOSE-UNATTRIBUTED — Pearson(bound draws, log
  rot-ratio) = +0.03. The floor's rot movement does not track its
  engagement. Per-pair ratios 0.01–4.92 are trajectory divergence, not lever
  effect. (Contrast feastdraw-b's +0.73 perverse dose-response: that lever
  was harmful where it engaged; this one is merely ineffective.)
- **FILLED (finding)**: the floor is a SURVIVAL lever wearing a rot lever's
  clothes — median +29d, 12/16 pairs outlive controls, national 6→11/16,
  at the price of chronic hunger (+33% starveDays pooled). Rationing beats
  feasting-then-famine: the floor prevents the bare-pantry famine cliff.
  A future arm could test the floor with SURVIVAL as the primary (new run,
  new pre-registration — not a re-score of this one).
- **DOCUMENTED (killed)**: the doomdraw layer is KILLED at pilot per §14
  (CONCEPT-DEAD as a rot lever: mechanism staged massively, metric fair,
  failed on merits, dose-unattributed). Layer deleted zero-trace per kill
  protocol (scripts/policies/doomdraw.js removed; registry entries removed
  from scripts/sweep-compare.js; src/ untouched — policy-side only). Proof
  43/43 GREEN pre-kill, det-gate 8/8 IDENTICAL pre-kill, both repaired to
  INFO-SKIP post-kill and verified. Instruments + evidence landed.
- **DOCUMENTED (panel)**: §15 panel built before/after on the named registry
  policies (leaddoomdraw/belongdoomdraw), gate-off vs DOOMDRAW=1, same 8
  seeds × 180d. Decision + notes below (instrument, not judge).
- **DOCUMENTED (polish)**: day-1 cook name renders "A" (name-gate
  descriptor split); consecutive-night voicing is the substrate.
- **DOCUMENTED (seed)**: 6556 is an early-collapse seed on control (39d
  lead / 32d belong) — the armed twins' +111/+148d gains dominate the
  survival median; noted for future seed selection.

## Metric review (§14)

- The primary (rot/100d ≤ 0.85x) FAILED at 0.929 — a 7.9pp miss. Per §14 it
  is NO-GO, never re-scored. The metric behaved as designed: the pooled
  absolute-per-100d showed the near-null that a pair-mean would have
  flattered or hidden — and the dose-response (+0.03) confirms the 7% is
  trajectory noise, not mechanism.
- The engagement gate (≥ 8 bound nights) PASSED at 1,720 — this is
  ineffectiveness with attribution data, not invisibility. The
  engagement-gate design is validated a fourth time.
- The doomed-share secondary (≥ 60%) FAILED at 27% — MISCALIBRATED, not
  mechanism-relevant. The share measures the seed's glut-vs-lean character
  (doomed pile size ÷ total diet), not the lever: it ranged 4–87% across
  armed seeds and would read the same on control (the ordering is engine
  law). A targeting-discipline engagement bar must measure the targeting,
  not the pool. Proposed revision for any next draw-side run: drop the
  share bar; the bound-night gate is the honest engagement metric.
- The dose-aware starve-rate guardrail PASSED (+33.4% pooled rise, but
  r=+0.27 < +0.3). The b2 revision worked as designed: it distinguished
  "hunger that tracks the mechanism" from "hunger that doesn't". The
  pooled rise is real and is reported honestly — the floor costs hunger —
  but per the pre-registered rule it does not fail the arm. (Had the
  primary passed, this would be the investigation note.)
- The new-death-mode guardrail tripped on "the night"×2 and "the humming in
  the grass"×2 (exposure-matched, ≥2 floor). Both read as monster/event
  names with no mechanistic path from a pantry-draw floor. The guardrail is
  strict by design and the trip is recorded; the primary miss kills
  regardless, so no adjudication was needed. Same treatment as the
  feastdraw-b singletons.
- §15 panel: built (decision below). Panel = instrument, threshold = judge.
- Metric-review note for the axis: the food-economy axis now has FOUR
  killed draw-side variants (windfall feast, rackscap, feastdraw,
  doomdraw). The draw program is closed for rot. The live direction is the
  inflow side (surplusfeed-b landed 2026-10-18: 0.459x pilot / 0.822x
  confirm) and the production-rebound question the feastdraw arm filed.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall-preseat.json
--current '/tmp/sim-doomdraw-b/agg-armed.json' --metrics national,table,wins,exiled`:
QUIET — no LOUD lines (1 file, 4 metrics). The preseat baseline is
regime-matched (SEATDRIVE=0, pre-seat courtship), so the winseat-regime
spurious LOUDs from prior runs do not appear. national 11 vs baseline 9,
table 14 = 14, wins 0 = 0, exiled 0. Not drift, not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on the primary — 0.929x vs the 0.85x bar;
dose-unattributed r=+0.03; CONCEPT-DEAD as a rot lever). The food-economy
axis is not converged. The draw program closes permanently for rot levers
(four killed variants). Named next for the axis: the inflow side
(surplusfeed-b landed); the floor's survival effect (+29d median) is a
candidate future arm with survival as primary.
