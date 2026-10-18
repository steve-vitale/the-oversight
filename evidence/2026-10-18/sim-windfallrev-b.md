# SIM-WINDFALLREV — portion-scaled windfall feast + the two b2 reconciliations (arm sim-windfallrev-b, loop B, food-economy)

Date: 2026-10-18 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261018T1930Z · Worker tree: sim-windfallrev-b
Axis: food-economy (scale-wall lens) — REVIVAL of the killed portion-scaled
windfall feast (sim-portionwindfall-b: 0.774x rot, +20d survival, killed on
miscalibrated guardrails; sim-portionwindfall-b2: 0.645x rot, +7d survival,
killed on the 1.15x per-pair starve-rate bar that fired on trajectory noise,
r=-0.58) under the REVISED guardrails, with the two b2 reconciliations.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE sims)

- **Question**: does the portion-scaled windfall, with the two reconciliations
  (scavenger-draw yield; duty-smoke-drive yield), cut rot under the
  dose-aware guardrails?
- **Lever**: scripts/policies/portionwindfall.js (PORTIONWINDFALL=1, default
  OFF; zero src/js changes), rebuilt from the b2 spec: 300*roster doomed
  trigger, NO frequency cap, cost capped at 275*roster via the top-trust
  guest subset (engine 400/head; tiny rosters invite everyone), all feast
  gates kept (dusk, haven, one/day, have>=scaledCost*1.5, contribution
  >=1500/7d via recentGives+recentTribute), doomed-fresh via the
  rot-accounting split (preserved/rendered excluded; foodState-undefined
  stacks count — finding #546), urgency-first draw via the engine's own
  hostFeast/pantryDraw, cadence clock resets on a windfall, one honest voice
  line naming the why.
- **Reconciliation (3)** — the scavenger-draw yield (WINDFALL_RECONCILE,
  default ON, '0' disables for attribution): a fresh ARMED grant rolls the
  feast's scavenger lottery (guaranteed draw, feast-surge.json) and the
  competent fight road faces the draw while feasted — through a glut
  cluster that's a new beast every ~2 days, the lead-road bearer-churn path
  the §15 panel flagged (player deaths +2.5/run). The windfall never invites
  a second beast while one is circling (Game.feastDrawPending()) or one was
  drawn within 3 days (draw days snooped from every hostFeast, parent's
  included): a would-be fresh armed grant then stands down (the doomed pile
  rots — honest, counted). Refreshes (buff live) and unarmed feasts (no
  draw) fire normally. Per-fire attribution detail recorded
  (buffLive/surgeArmed/freshGrant/scavDrawn).
- **Reconciliation (4)** — the duty-smoke-drive yield (WINDFALL_YIELD_SMOKE,
  default ON, '0' disables for attribution): when the racks are thin (not
  racks-full per the engine's own math), the whole doomed pile fits one
  cook part's 4000-kcal budget, and the smoke drive has recently absorbed
  food (fail-safe: an idle drive never earns the yield), the windfall
  stands down and lets the duty smoke drive preserve the pile instead of
  tonight's supper. Counted. The pilot judges whether the timing works.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat);
  HUNTSTAFF unset; base courtship policies only. 180d death-aware; dead
  villages stop. Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 6801-6808 (verified unused in scripts + recent
  evidence) x {leadfeast, belongfeast} x {control, full, norecon, noyield} =
  64 runs, IDENTICAL seeds all sides, own in-sweep paired control.
- **PRIMARY** (binding): (rot:preserved + rot:fresh) ABSOLUTE per 100 days
  alive — full <= 0.80x control.
- **ENGAGEMENT** (kill-fast, cluster-tails per #558): windfall tail-burn
  fires (a fire with another windfall fire <=2d earlier) >= 8 on the full
  side. Mean fires reported, not gating.
- **Guardrail (a) — DOSE-AWARE** (the 1.15x per-pair ratio bar is RETIRED —
  it fired on noise twice): FAIL iff Pearson(windfall count, per-pair
  starve-rate delta) > +0.3 AND the pooled starve-rate rises > +15%.
- **Guardrail (b)**: new-death-mode, exposure-matched with a >=2 count
  floor (kept — it worked).
- **Guardrail (c)**: median survival >= control-10d (dose-response reported).
- **Guardrail (d)**: laundering 0, measured AT CONVERT TIME.
- **Reconciliation checks** (diagnostic, not gating): bearer-churn
  dose-response Pearson(fresh-grant fires, bearer-change delta); suppression
  and yield counts per arm; dutyPreserved recovery on the yield arm.
- **Det-gate**: wrapped+PORTIONWINDFALL-unset byte-identical to base over
  40d (2 seeds), reconciliation flags at junk values; SMOKE+proof GREEN
  before any sims.
- **Balanced panel (§15)**: before/after through scripts/balance-panel.js on
  the named registry policies (leadwindfallrev, belongwindfallrev), same 8
  seeds x 180d, gate-off vs PORTIONWINDFALL=1 (both reconciliations default
  on), env FEASTSCALE_R13=1 / SEATDRIVE=0 both builds. The panel is the
  instrument; the pre-registered primary/guards are the judge. The compare
  .md is attached.

## Proof results (run BEFORE any sims)

- scripts/test-windfallrev-b.js: PROOF GREEN (36 checks) — reconciliations
  default ON; independently disable-able; scavenger yield engages on fresh
  armed grants with a recent/circling draw (suppression counted, no voice);
  refreshes and unarmed feasts fire normally; smoke yield engages when
  racks thin + pile fits + drive active; fires on pile > 4000, racks full,
  and idle drive (fail-safe); draw tracking + per-fire attribution detail;
  gate-off RED leaks nothing; deterministic.
- scripts/test-portionwindfall-b.js (the prior arm's 37 pins, rerun against
  the rebuild): PROOF GREEN — the base layer is behavior-identical in the
  fixtures.
- scripts/detgate-windfallrev-b.js: DET-GATE GREEN — wrapped+unset ==
  base byte-identical over 40d x2 seeds, wrapped==wrapped identical.

## Sweep results

### Pilot (64 runs: 8 fresh seeds 6801-6808 x {leadfeast, belongfeast} x {control, full, norecon, noyield})

| metric | control (16) | full (16) | norecon (16) | noyield (16) | pre-reg |
|---|---|---|---|---|---|
| rot/100d (**PRIMARY**) | 183,456k | 150,708k | 137,005k | 137,827k | **FAIL** (full 0.821 > 0.80) |
| tail-burn fires (engagement) | 0 | 448 | 493 | 372 | **PASS** (≥ 8) |
| mean fires (informative) | 0 | 539 | 546 | 470 | — |
| fresh-grant fires | 0 | 479 | 480 | 403 | — |
| scavenger draws | 0 | 102 | 111 | 109 | — |
| recon-suppressed | 0 | 45 | 0 | 53 | (attribution) |
| smoke-yielded | 0 | 7 | 8 | 0 | (attribution) |
| doomed-seen / doomed-eaten | — | 3919k / 844k | 3880k / 799k | 3314k / 733k | (info) |
| median survival | 139d | 134d | 126d | 129d | **PASS** (-5d ≥ -10d) |
| starveDays/100d (pooled median) | 16.2 | 17.3 (+7.1%) | 17.1 | 17.5 | (a) **PASS** |
| dose r (windfall, rate delta) | — | -0.12 | — | — | (a) **PASS** (not > +0.3) |
| bearer-changes | 122 | 112 (-10) | 122 (+0) | 117 (-5) | (3) diagnostic |
| dose r (fresh-grant, bearer delta) | — | -0.23 | — | — | (3) diagnostic |
| duty preserved | 1883k | 1750k | 1770k | 1630k | (4) diagnostic |
| laundered | 0 | 0 | 0 | 0 | **PASS** |
| new death mode (exp-matched, ≥2) | — | none | — | — | **PASS** |
| national | 8/16 | 9/16 | 7/16 | 9/16 | (info) |
| table | 13/16 | 13/16 | 12/16 | 13/16 | (info) |
| wins | 0/16 | 0/16 | 0/16 | 0/16 | (pre-seat) |
| wave 4 | 15/16 | 15/16 | 13/16 | 15/16 | (info) |
| wave 5 | 0/16 | 0/16 | 0/16 | 0/16 | (info) |

Per-seed: evidence/2026-10-18/perseed-windfallrev-b/sweep-*.json
Analyzer: scripts/analyze-windfallrev-b.js (run: `node scripts/analyze-windfallrev-b.js
'/tmp/sim-windfallrev-b/sweep-control-*.json' '/tmp/sim-windfallrev-b/sweep-full-*.json'
'/tmp/sim-windfallrev-b/sweep-norecon-*.json' '/tmp/sim-windfallrev-b/sweep-noyield-*.json'`)

**Pilot verdict: NO-GO** — the primary misses (full 0.821x > 0.80x). Per §14,
a miss is NO-GO, never re-scored. The arm is KILLED: layer deleted
zero-trace; instruments + evidence landed.

Dose-response: Pearson(windfall count, survival delta) = +0.11 (n=16) —
unattributed. Pearson(windfall count, starve-rate delta) = -0.12 — the
dose-aware bar passes cleanly (the retired 1.15x bar would have fired on
noise a third time; the dose-aware bar holds).

The reconciliation attribution (the reason for the miss):
- The base economics replicate a THIRD time on fresh seeds: norecon
  (reconcile off) 0.747x, noyield (yield off) 0.751x — both beat the bar
  with all guardrails green. The two reconciliations TOGETHER cost ~0.07x:
  45 scavenger-yield suppressions + 7 smoke yields on the full side, each a
  feast that didn't happen and a doomed pile left to rot.
- Reconciliation (3): the bearer-churn signal did NOT replicate at sweep
  level — full had 10 FEWER bearer changes than control (112 vs 122),
  norecon flat (122). Pearson(fresh-grant fires, bearer-change delta) =
  -0.23 (no positive dose relationship). The yield "worked" (churn below
  control) but the churn wasn't the windfall's on these seeds. The 3-day
  quiet window is too aggressive as a feast suppressor: it trades rot for
  a churn reduction nobody needed here.
- Reconciliation (4): nearly inert — 7-8 smoke yields across 16 runs. Duty
  preserved: full 1750k vs noyield 1630k (+120k nudge) vs control 1883k.
  The -11% duty-preserved gap persists; the yield's conjunction (racks thin
  + pile ≤ 4000 + drive recently active) rarely engages, so the question
  "should the windfall yield to the smoke drive" is NOT answered — the
  yield as designed is too tight to test it.

Per-pair survival deltas (full-control): -44d (belong 6807, wf=13), -42d
(lead 6807, wf=27), -37d (belong 6805, wf=62), -33d (lead 6808, wf=14),
-24d (belong 6801, wf=18), -4d (lead 6802, wf=4), -1d (belong 6806, wf=1),
+0d (lead 6801 wf=0 / lead 6806 wf=94 — both 180d), +7d (lead 6804, wf=99),
+9d (belong 6803, wf=87; belong 6804, wf=5), +14d (lead 6805, wf=22), +17d
(belong 6802, wf=29; lead 6803, wf=32), +72d (belong 6808, wf=32).

## Wall numbers (every run)

Full: national 9/16, table 13/16, wins 0/16, w4 15/16, w5 0/16, median 134d,
max 180d. Control: national 8/16, table 13/16, wins 0/16, w4 15/16, w5 0/16,
median 139d, max 180d. The wall stands (zero wins, wave-4 ceiling, pre-seat).
The arm does not attack the wall.

## Village assessment (plain words)

Sixty-four villages, sixteen quads. The full-side twins hold portion-scaled
windfall feasts — 539 across the pilot, 448 of them tail-burns (fires
within 2d of another: the glut-cluster tails the old frequency cap used to
leave to rot), eating 844k kcal of doomed food out of 3919k seen. Their
pantries are leaner (rot down 18%, ratio 0.821) — but not lean enough: the
two reconciliations suppressed 52 feasts (45 scavenger-yield + 7 smoke),
and each suppressed feast is a doomed pile left to rot. The unreconciled
twins (norecon 0.747x, noyield 0.751x) show what the economics look like
without the suppressions.

Who thrives: villages that live long enough to feast — the biggest gains
(+72d belong 6808, +17d belong 6802 / lead 6803) eat substantial doomed
piles; the feast converts would-rot food into eaten food. Who dies: the
early collapses (combat and sickness dominate — 119 combat, 61 monster vs 3
starvation on the full side; the feast is never the killer).

The hunger picture is quiet: pooled starvation rate +7.1% (16.2 → 17.3),
dose-response -0.12 — the meal-displacement mechanism does not track the
lever. The bearer picture is the surprise: full-side villages change
bearers 10 FEWER times than control (112 vs 122) — the b2 panel's lead-road
churn (+2.5 player deaths/run) does not replicate at sweep level on these
seeds; the scavenger-draw yield suppressed 45 feasts to buy a churn
reduction nobody needed.

Seed 6804 is the showcase: leadfeast fires 99 windfalls (full side),
94 on the noyield twin — a season-long glut burned across consecutive days.
Seed 6801 is the null: no doomed pile ever crosses the trigger on either
side (180d both, regional, wave 4) — the windfall is an overflow valve, and
some villages never overflow.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

scripts/sense-windfallrev-b.js, seed 6804 (highest engagement, 99 fires),
60d, 5 windfall feasts:

d54: "🍖 The Foraged food won't keep till tomorrow — Daniyar calls a feast
to eat it before it turns." Followed by the engine report (10× Foraged
food; Ursula, Onni, Caleb, Chantal eat; "Somebody laughs so hard they cry.
For one evening, nobody is surviving — they're just together."). Then the
honest refusal: "The feast is warm and good — but your reactor hums its
steady note underneath, and the fire never catches. (Feast buff refused:
the reactor is a ceiling as well as a floor.)" — this scholar runs a
fusion reactor, so no buff and no scavenger draw, ever, on this run.

**PASS with two notes** — the line reads as a person making a sensible
call (names the food, the caller, the reason); the engine's emotional
register tracks each night (laughter, then the quiet register as the
pantry thins). (1) The SUBSET invitation is still unexplained in-fiction
(4–5 people eat; the rest of the village isn't mentioned) — carried over
from both prior arms; name the impromptu circle if the voice ever lands.
(2) NEW: on fusion-reactor runs the buff-refusal line follows EVERY
windfall — honest, but it makes the feast read as a failed ritual rather
than a salvage supper. If the windfall ever lands, the refusal line wants
a windfall-specific variant (or silence — the reactor's ceiling is already
established).

## Blanks filled / documented

- **FILLED (finding)**: the portion-windfall economics replicate a THIRD
  time on fresh seeds — norecon 0.747x, noyield 0.751x, both beating the
  0.80 bar with every revised guardrail green. The cluster-tail mechanism
  is seed-robust (448 tail-burns on the full side).
- **FILLED (finding)**: the dose-aware starve-rate guardrail works — r =
  -0.12, pooled +7.1%, PASS cleanly where the retired 1.15x bar would have
  fired on noise a third time.
- **FILLED (finding)**: the b2 panel's lead-road bearer-churn does NOT
  replicate at sweep level on these seeds (full 112 vs control 122 bearer
  changes; dose r = -0.23). The scavenger-draw yield bought a churn
  reduction nobody needed, at a rot cost of ~0.07x.
- **DOCUMENTED (killed)**: the revival with reconciliations is KILLED at
  pilot — primary 0.821x (MISS by 0.021), engagement 448 tail-burns (PASS),
  survival -5d (PASS), dose-aware starve-rate (PASS), new-death-mode
  (PASS), laundering 0 (PASS). Per §14 the primary miss binds: NO-GO.
  Layer deleted zero-trace per kill protocol; instruments + evidence
  landed.
- **DOCUMENTED (reconciliation)**: the 3-day scavenger quiet window is too
  aggressive as designed — it suppresses the FEAST (the rot lever) to
  avoid the DRAW, and the engine already throttles draws via the
  no-clobber rule (a live pending draw refuses the next). A narrower
  reconciliation (yield only while a draw is actually pending, or a
  1-day window) is the named next for (3). The smoke-drive yield is
  nearly inert (7 fires) — its conjunction is too tight to test the
  question; the -11% duty-preserved gap is still open. Named next for (4):
  loosen the engagement (drop the drive-active fail-safe, or widen the
  budget) or kill the question.
- **DOCUMENTED (polish)**: the subset invitation is unexplained in-fiction
  (carried over); the fusion-reactor buff-refusal line repeats after every
  windfall on reactor runs (new note).
- **DOCUMENTED (seed)**: 6801 is a null seed for this lever (no doomed
  pile ever crosses 300*roster on either side, 180d both) — contributes
  nothing to the rot metric; worth noting for future seed selection.

## Metric review (§14)

- The primary (rot/100d ≤ 0.80x) FAILED (0.821). The bar was set to beat
  the frequency-cap variant's 0.885x — the full layer beats that (0.821 <
  0.885) but not the bar. The metric is sound; the miss is real and binds.
- The engagement bar (≥ 8 tail-burn fires) PASSED (448). Keep this metric.
- Guardrail (a) dose-aware PASSED (r=-0.12, pooled +7.1%). The revision
  works — adopt it as the standing starve-rate guardrail for the axis.
- Guardrail (b) exposure-matched ≥2 PASSED cleanly. Keep.
- Guardrail (c) survival PASSED (-5d). The #538 split rule never engaged.
- Guardrail (d) laundering PASSED (0).
- §15 panel: built and attached (evidence/2026-10-18/panel-windfallrev-b/
  compare.md — panel.json.gz + compare.json alongside; cases/ caches not
  committed per §15). **Decision: review_required** (screen only, 8 pairs —
  exploratory intervals, not verdicts). leadwindfallrev: player deaths/run
  +1.625 (interval -1.5 to 5.125 — regression_watch, NOT signal; the b2
  panel's +2.5/run regression_signal attenuated); bearer changes +1.375
  (descriptive); hungry NPCs IMPROVED -0.0036 (interval clear of 0).
  belongwindfallrev: player deaths -1.125, bearer changes -1.0, hungry
  NPCs -0.0049 (interval clear of 0). No regression_signal on any metric.
  Per §15 the panel never overrides the pre-registered verdict — but it
  corroborates the sweep: the bearer-churn signal is attenuated vs b2, and
  the hunger picture improved on both roads. (Panel build note: the
  lever-env flags were briefly added to balance-panel.js's flagNames for
  provenance; this broke the before/after compare ("Unmatched flags" —
  flags must match, the lever differs by design). Reverted; the two
  built panels had the three lever keys stripped from recorded options.flags
  and the compare re-run. Future panels: never put the lever env in
  flagNames.)
- **Named next for the axis**: (1) recalibrate the scavenger-draw yield —
  the 3-day window suppresses feasts to avoid draws the engine already
  throttles; try a pending-only yield or a 1-day window, measured against
  the same primary; (2) rethink or kill the smoke-drive yield — 7 fires
  can't answer the question; (3) the base portion-windfall economics are
  proven 3x (0.774/0.645/0.747-0.751) — the remaining question is purely
  the reconciliation cost, not the rot math.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '/tmp/sim-windfallrev-b/agg/agg-*.json' --metrics national,table,wins,exiled`:
3 LOUD: "national swung 175%", "table swung 219%", "wins disappeared:
baseline 16 -> current 0". ALL explained by regime mismatch + aggregation:
the baseline is labeled winseat-regime (this run is pre-seat courtship,
SEATDRIVE=0, where wins are structurally 0) and the agg sums 4 arms (n=4
files). The exact spurious LOUD the two prior runs documented. Not drift,
not a bug.

## Convergence state

**killed-at-pilot** (NO-GO on the pre-registered primary — full 0.821x >
0.80x; see Metric review for the reconciliation-cost case). The
food-economy axis is not converged. The portion-scaled windfall's
economics are proven 3x; the blocker is now the reconciliation cost, not
the rot math.
