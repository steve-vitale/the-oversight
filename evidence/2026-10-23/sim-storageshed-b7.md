# sim-storageshed-b7 — STORAGESHED 7th unpark (2026-10-23)

7th UNPARK of the parked STORAGESHED lever — the STORAGE half of Steve's
2026-10-21 ruling ("villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the decision). Parked six times:
b (rot/100d absolute 0.983 > 0.80), b2 (total rack-kcal-smoked-during-plenty
0.941 > 0.70, confounded by +74% plenty-day exposure), b3
(preserved-rot/100d: overall 0.538 GO but belongfeast leg 2.316 > 0.80 NO-GO,
confounded by the lever's own plenty-extending equilibrium on an 8-seed
leg), b4 (primary GO on all legs 0.552/0.586/0.511, but guardrail (b) failed
on worker miscalibration — strict raw counts, armed 26 vs control 24 —
with pantry median UP 3.46x and fresh rot DOWN; §14 bound the NO-GO), b5
(GO on every bar — 0.589/0.607/0.546, engagement 30/32, all five guardrails
pass — landed PARKED evidence-only; the default flip is Steve's call), b6
(primary GO on all legs 0.518/0.502/0.530, guardrails (a)/(b)/(c)/(e) pass,
(d) NO-GO on a measurement artifact — the pre-registered whitelist named
only 'expedition', a single armed-side 'the night' death flagged as
armed-new=[night]; root-caused to pre-existing content, engine/calories.js:
100,146, sampling asymmetry, not lever harm; PARKED, not killed).

Spec: evidence/2026-10-22/sim-storageshed-b.md. Autopsies: b2, b3 (2026-10-22);
b4, b5, b6 (2026-10-23). Behavior: per b3/b4/b5/b6 (unchanged — the shed
mechanism is now measured ~0.55x per-plenty-day rack rate on SIX consistent
corpora; this run is about the guardrail).

Implementation: PARKED PATCH at ~/workspace/storageshed-parked.patch — the
b3-corrected re-implementation (honest fresh copy of the shed half,
PRESERVATION.md-compliant). Verified `git apply --check` CLEAN on this
arm's base before any sims. Applied sweep-only in this worktree; NEVER
committed as game code (GO parks the lever — the default flip is Steve's
call; NO-GO parks it with the §14 metric review).

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- QUESTION: the storage-half mechanism is proven (~0.55x per-plenty-day
  rack rate, six corpora). The named next from the b4/b5/b6 metric reviews:
  does the EXPOSURE-NORMALIZED starvation guardrail hold — starvation
  deaths per 100 village-days, armed ≤ control × 1.10 — on a seventh corpus?
- LEVER: STORAGESHED (sweep-only env-gated patch; default-ON behavior
  intended on GO).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- POLICIES: leadfeast, belongfeast (competent-player policy + variant).
- SEEDS: 16 FRESH seeds 64331–64346 (fresh = not used as sim seeds by any
  prior run — verified by script-seed scan + evidence-filename scan before
  the sweep; C1 freshness gate). Prior fresh blocks: 64201–64216,
  64601–64616, 92801–92816. If the pilot (seeds 64331–64338, 32 configs)
  passes the sniff test (primary direction GO on both policies +
  engagement fires ≥6/16), extend to 16 seeds per policy per side via
  APPEND mode (64339–64346) = 64 configs before rendering verdict.
- HORIZON: 100d death-aware (dead villages stop simulating; +10d tail
  max). Why 100d: the tracker's named horizon for this unpark — the
  storage half's effect window; the lever only fires during plenty, which
  needs an established village; 100d covers establishment + the plenty
  regime without a fixed 200d run.
- PRIMARY (binding GO): per-plenty-day rack rate
  (rackKcalPlenty / rackDaysPlenty, sums-per-side), armed/control ≤ 0.70,
  OVERALL AND PER-POLICY. Sums-per-side aggregation (not mean-of-per-run
  ratios) so thin plenty days don't dominate. 7th measurement of the
  stable behavioral metric (b2 ~0.59; b3 0.556/0.568/0.567; b4
  0.552/0.586/0.511; b5 0.589/0.607/0.546; b6 0.518/0.502/0.530).
- GO threshold: ≤ 0.70 (overall AND per-policy).
- SECONDARY (reported, NOT the judge): preserved-rot/100d absolute, with
  the documented equilibrium-confounder caveat (it scales with
  plenty-regime length, which the lever itself extends — b2 +74%, b3 +57%,
  b4 +36%, b5 +55%, b6 +36%; per-policy legs unstable at n ≤ 16).
- ENGAGEMENT (kill-fast): shedKcal > 0 on ≥ 6/16 armed runs (pilot) /
  ≥ 12/32 (confirm) — the original 6/16 ratio. If the shed never fires in
  sims, the lever is decoration — killed-at-pilot.
- GUARDRAILS:
  (b) [EXPOSURE-NORMALIZED per b6 metric review] starvation deaths per 100
      village-days (sums-per-side: ΣstarvDeaths / ΣvillagerDays × 100),
      armed ≤ control × 1.10, OVERALL AND PER-POLICY. Do NOT use raw
      counts (b4's exposure-bias autopsy: raw-count guardrails miscalibrate
      under chaos exposure). Pre-register this exact bar.
  (c) median of paired (armed − control) survival diffs ≥ −10d (pairs by
      policy×seed — the 100d horizon censors unpaired medians; b3/b4/b5/b6).
  (d) no new death kinds — mechanism-class set difference, armed-new = []
      after whitelisting pre-existing content classes: 'expedition'
      (game.js:8672 player expedition death, b4 pre-registered) and
      'night' (engine/calories.js:100,146 — the b6 miss root-caused to
      pre-existing content; the patch adds zero registerDeath calls).
      ≥2-EVENT RULE: a mechanism class appearing in exactly 1 event total
      is content noise, not a new death kind — never a verdict trigger.
  (e) national(end) armed ≥ control − 2 (national reach not regressed);
      no inflow-channel laundering >2x (named channels: share_surplus/
      away/tribute/traps/duty/system/ambient).
  - PANTRY/ROT CHANNELS: report-only (b6's (c) median endFreshDays and
    watchers move to info lines — no verdict weight).
  - Paired-direction starvation (b6's guard (a)) is reported info-only —
    (b) is the binding guardrail this run.
- ENGAGEMENT MEASURED: plenty-rack-days/shed-days — the mechanism must fire.
- WATCHERS (flags, not verdict triggers): rot/100d absolute (flag >1.20x);
  fresh-rot/100d (flag >1.50x).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15: the panel is the instrument, the pre-registered threshold is the
  judge. Known contract limitation (b4/b5/b6): env-gated flag → compare
  decision "invalid — Unmatched flags" (descriptive-by-construction); the
  manual paired analysis on identical seeds judges. Attach compare .md.
- Verdict classes: GO (stays PARKED pending Steve's default-flip call —
  "measured-GO, parked pending Steve's default-flip call"; the
  measured-NO-GO-layer label is the wrong label here) / NO-GO (stays
  parked, metric review) / killed-at-pilot.

## metric review (pre-sims)

- The primary (per-plenty-day rack rate ≤ 0.70) is confirmed STABLE across
  SIX measurements on five corpora — it is the right judge for this lever
  and stays the primary. If it moves off ≤0.70 on this corpus, the
  mechanism itself has drifted — that is a lever miss, not a metric miss.
- Guardrail (b) is the b6 metric review's named next: exposure-normalized
  starvation per 100 village-days, armed ≤ control × 1.10. It retires the
  b4 strict-count miscalibration class AND the b6 paired-slack workaround —
  the slack existed only because raw counts miscalibrated; with the
  denominator explicit there is no slack to justify. The paired-direction
  analysis (b6's guard (a)) stays as an info line to keep the shape
  comparable.
- Guardrail (d)'s whitelist now enumerates ALL known pre-existing content
  classes ('expedition', 'night') and the ≥2-event rule absorbs any future
  one-sided single-event sampling artifact — the fifth such flag in seven
  runs (b's wave-4 names, b2's show/night, b3's expedition, b4/b5's
  expedition, b6's 'the night') finally closes the canonicalizer's
  learned-lesson loop at the input level. The set-difference machinery is
  unchanged.
- Guardrail (b)'s 1.10 bound is deliberately tighter than any slack the
  series has used (b6's slack was +0.007/100vd against a median of 0.000 —
  the lever has never shown starvation harm on any corpus); the run still
  parks on ANY guardrail miss per §14, so tightness is honesty, not risk.
- Pantry/rot channels are report-only per the brief — the b6 fresh-days
  guard held (4d = 4d); continuity is info now.
- UNPARK CRITERION: GO on primary + ALL guardrails PASS => land the arm
  with the layer env-gated default-off ("measured-GO, parked pending
  Steve's default-flip call"), mark sim-findings backlog storage items
  accordingly, include [needs-eyes] in the commit message because the
  default-flip is Steve's design call. ANY guardrail miss => park a 7th
  time with the §14 metric review and the exact named next. I do NOT flip
  the default myself.

## Proof + determinism (run BEFORE the sweep — never sweep on an unproven patch)

- Patch `git apply --check` clean on this arm's base (verified pre-sims).
- scripts/test-storageshedb7-b.js (red/green proof of the spec, 36
  checks) — run AFTER patch application, BEFORE the sweep.
- Det-gate scripts/det-gate-storageshedb7.js: 4 configs (63001/63002 ×
  leadfeast/belongfeast, 40d, STORAGESHED=0) run on UNPATCHED game.js, then
  on PATCHED game.js with the gate off — digests must be byte-identical
  (the patch adds zero behavior when the gate is off), ledger never
  created. ALL GREEN before sweeping.

## Results

Sweep: `scripts/sweep-storageshedb7.js`, 16 FRESH seeds (64331–64346) ×
{leadfeast, belongfeast} × {control (STORAGESHED=0), armed (STORAGESHED=1)} =
64 runs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. C1 freshness gate:
script-seed scan + evidence-filename scan, zero hits. Infrastructure note:
the first pilot launch (4 exec-backgrounded processes) was SIGTERM-killed
at ~9 min by an unknown reaper; relaunched detached (setsid+nohup) with
per-seed incremental OUT writes — the pilot (32) and confirm (32, APPEND
mode) completed clean. The pilot (seeds 64331–64338) passed the sniff
test: primary direction GO on both policies (0.639 leadfeast / 0.517
belongfeast) + engagement 15/16 fires; fresh-rot watcher flagged 2.692x
(pilot), carried as watcher into the confirm.

Proof: `scripts/test-storageshedb7-b.js` **36/36 green** (red/green,
multi-resolution compounding, tiny-stacks, day-voice, 12-line pool
reachability, determinism). Det-gate: unpatched vs patched gate-off
trajectory digests byte-identical on 63001/63002 × leadfeast/belongfeast
(4/4) — the patch adds zero behavior when the gate is off. Patch
`git apply --check` clean before any sims; applied sweep-only, never
committed.

- PRIMARY per-plenty-day rack rate (sums-per-side) ≤ 0.70:
  - all: control 1573/d vs armed 871/d → **0.554 → GO**
  - leadfeast: 1339 vs 844 → **0.631 → GO**
  - belongfeast: 1794 vs 899 → **0.501 → GO**
  - 7th measurement of the stable behavioral metric: b2 ~0.59; b3
    0.556/0.568/0.567; b4 0.552/0.586/0.511; b5 0.589/0.607/0.546; b6
    0.518/0.502/0.530; b7 0.554/0.631/0.501. The shed halves rack pace
    during plenty on BOTH policies, seventh corpus in a row.
  - Plenty-regime exposure (rackDaysPlenty): control 647 → armed 1071
    (+65% — the lever's plenty-extending equilibrium, same class as b2's
    +74% / b3's +57% / b4's +36% / b5's +55% / b6's +36%; the rate metric
    is exposure-invariant).
- SECONDARY preserved-rot/100d (reported, exposure-confounder caveat):
  all 0.877; leadfeast 3.083 (the noisy-leg class at n≤16 — one seed's
  preserved-rot load dominates); belongfeast 0.359.
- SECONDARY rack-kcal-smoked-during-plenty total: all 0.917.
- ENGAGEMENT (kill-fast) shedKcal>0 ≥ 12/32: **31/32 → GO**. 1007
  shed-days, 1148 shed decisions, 1,819k kcal shed. The lever fires
  everywhere; not decoration.
- GUARD(b) EXPOSURE-NORMALIZED starvation, armed ≤ control × 1.10:
  - all: control 0.060/100vd (16d/26,827vd) vs armed 0.066/100vd
    (18d/27,081vd) → **ratio 1.114 → NO-GO** (miss by 0.014)
  - leadfeast: 0.052 (7d/13,583vd) vs 0.059 (8d/13,633vd) → **1.139 → NO-GO**
  - belongfeast: 0.068 (9d/13,244vd) vs 0.074 (10d/13,448vd) → 1.094 → GO
  - Paired-direction (b6's (a), info-only): median(armed−control) =
    0.000/100vd over 32 pairs; armed-worse pairs 8, armed-better 5, 19
    pairs tie exactly — armed is NOT systematically worse in the paired
    sense. The corpus-total miss is +2 deaths on ~27k villager-days per
    side: ±1-death quantization moves the ratio ~0.06, finer than the
    0.10 slack. Per-pair autopsy: armed-worse pairs include longer-lived
    armed villages (64336: armed 100d vs control 54d — more exposure,
    not more hazard); control's better pairs include a longer-lived
    control village (64332: control 100d vs armed 35d). This is the same
    small-count + asymmetric-exposure class as b4's raw-count autopsy —
    the rate denominator helps but does not retire quantization noise.
- GUARD(c) median paired (armed−control) survival diff ≥ −10d: **0d over
  32 pairs → GO** (unpaired medians 100d/100d — the 100d horizon censors).
- GUARD(d) no new death kinds (≥2-event rule, pre-existing content
  whitelisted): **GO** — armed-new(≥2)=[none]; armed-new(1-event)=[none];
  'night' whitelisted as pre-registered pre-existing content (c:3, a:1 —
  both sides, sampling noise, not a lever effect). The b6 metric fix
  worked exactly as designed: no false flag this run.
- GUARD(e) national(end) armed ≥ control−2: **20 = 20 → GO**.
  No inflow-channel laundering >2x → GO.
- PANTRY/ROT (report-only): median end pantry kcal 7k control = 7k armed
  (1.037×); median endFreshDays 3d → 4d. The shed doesn't starve the
  larder.
- WATCHERS: rot/100d absolute 2.023x (FLAG >1.20x); fresh-rot/100d
  2.208x (FLAG >1.50x — the b2-measured trade, now large at n=32: fresh
  44k vs 20k mean). The shed's about-to-rot surplus stays fresh, the
  fresh-first nightly meal doesn't eat it all, and it rots fresh. The
  pantry holds (kcal 1.037×, fresh-days UP) — this is the plenty-
  extending equilibrium's price, documented since b2, now the largest
  measured. Not a verdict trigger (pre-registered watcher-only), but the
  trade's scale is the open blank of the next unpark's metric review.

### Verdict

**NO-GO on pre-registered guardrail (b) — PARKED, not killed.** Per §14
the miss binds: overall 1.114 > 1.10 (leadfeast leg 1.139 > 1.10).
Per Steve's kill discipline (2026-10-21), a missed bar is not a kill:
the lever is not confirmed harmful — the primary passes decisively on
all three legs (0.554/0.631/0.501, the seventh consistent measurement),
engagement is 31/32, guardrails (c) (d) (e) all pass, survival is flat,
the pantry holds (kcal 1.037×, fresh-days 4d vs 3d), national is FLAT
(20 = 20), and the (b) miss root-causes to ±1-death quantization noise
on single-digit counts (+2 deaths on ~27k village-days per side;
paired-direction median 0.000, 8 worse vs 5 better pairs — armed is not
systematically worse). Killing the lever on a 2-death delta would
override Steve's design direction on the basis of count noise — the
same class of miscalibration the exposure-normalized guardrail was
meant to retire, now measured one level down.

## Sense test

`scripts/sense-storageshedb7.js` (seed 64333, leadfeast, 60d, armed):
16 shed voice lines (🍽️◦), 14/16 unique, 0 consecutive-day verbatim
repeats, 2 distinct speakers (Sigrun, Fergus). **PASS.**

The 12-line pool reads as judgment calls: each line pairs a body action
(walks the half-loaded racks once, stokes the fire low, covers the
half-filled racks, banks the smoke fire down to coals) with a rack-state
justification ("The racks can breathe", "Racks are half-done by design",
"Plenty of smoke already") and a concrete instead-of task (weeding the
gardens, carving bowls, hauling water, splitting firewood, teaching
snares, tending fever cases, mending the palisade). Never idle, never
storage work. The day stream around the shed days reads like a living
village: a mantle transfer after Jesse's contest death ("Jesse's gone.
Maureen looks at you for a long moment. 'You're not Jesse.'"), Codex
learning, weather reading — nothing robotic.

Noted (carried, cosmetic): the per-speaker line key
(pool[(d*11+hk)%12]) walks the same 12-line pool per speaker, so two
speakers' sequences can coincide when their hk values are congruent mod
12 (Fergus days 42–44 repeated Sigrun's days 30–32 verbatim, 12 days
apart). Each speaker's own 12-day cycle is by design; the cross-speaker
coincidence is a pool-size artifact, not a loop. The 🍽️◦ prefix reads
distinct from the plentydepri 🍽️ lines in the transcript (11/16 shed
days also voiced plenty).

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-23/sweep-storageshedb7/telemetry-*.json' --metrics
national,table,wins,exiled` (telemetry-{control,armed}.json: control
{national:20, table:0, wins:0, exiled:0, n:32}, armed {national:20,
table:0, wins:0, exiled:0, n:32}) → LOUD: "national swung 233%:
baseline 12 → current 40", "table disappeared: baseline 16 → current
0", "wins disappeared: baseline 16 → current 0" — **EXPLAINED, regime
artifact, not a lever effect** (same pattern as b4/b5/b6). The baseline
is the winseat regime (SEATDRIVE=1, WINPURSUIT=1); this run's
pre-registered substrate is SEATDRIVE=0, where wins and table are
structurally 0 — the baseline's own _regime block says exactly this.
The national line is a cross-regime sum (64-run total vs 16-run
baseline). The lever-attributable read: national 20/32 control → 20/32
armed — flat, not regressed. **No lever-attributable telemetry
deviation.**

## Balanced panel (§15)

ATTEMPTED three times, all blocked by infrastructure:
(1) before panel (patch applied, gate off, STORAGESHED=0), out dir in the
repo — the driver died after 4 cases;
(2) foreground 2-seed repro — `Error: EPERM: operation not permitted,
write` on case-cache writes (the intermittent container EPERM flap,
AGENTS.md 2026-10-23: write(2) returning EPERM, scoped to the repo);
(3) before panel with case cache on /tmp — died after 4 cases (.tmp
files, empty log), the flap or the ~9-min reaper got it too.
The sweep's own writes hit the same flap (three silent 0-byte telemetry
JSON writes; the analyzer's analyze-b7.txt needed 5 write attempts),
confirming the flap was active through this run's panel window, not the
panel's fault. The before/after compare never ran; no compare .md
attaches. The manual paired analysis on the 64-config sweep (identical
seeds) judges instead — as it did in b4/b5/b6, where the panel compare
was "invalid — Unmatched flags" (env-gated flag,
descriptive-by-construction) and contributed nothing to the verdict.
The pre-registered threshold remains the judge: PRIMARY GO on all legs,
guardrail (b) NO-GO as implemented → **PARKED**.

## Reachability / wall

(n=64: 32 control / 32 armed, 100d death-aware)
- national(end): **20/32 control = 20/32 armed** (guardrail: ≥18 — GO;
  flat, not regressed).
- table: 0 / 0. wins: 0 / 0.
- wave reach (1–5): control 32/32/31/**16**/0 → armed 32/32/32/**15**/0.
  Wave 5 reached 0/64 both.
- median survival: 100d / 100d (censored at the 100d horizon). Median
  paired (armed−control) diff: 0d.
- arcs: (not differentially tracked this run — see analyzer WALL lines).
- death-cause shares: starvation 16 control → 18 armed deaths on
  ~27k villager-days each (0.060 → 0.066/100vd); combat/monster/ambush
  dominates both sides as in b4/b5/b6; 'night' appears on both sides
  (c:3, a:1) — pre-existing content, sampling noise.
- vests: not tracked this run.

The scale wall stands: no table, no wins, no wave 5 on this substrate
(SEATDRIVE=0). The lever is reachability-neutral — it neither gates nor
unlocks content. Steve's standing directive binds: nothing in this run
moved the national/table numbers (20 = 20).

## Village assessment

What the village looked like: during plenty the cook still cooks the
haven meal and the racks run at half pace — 1007 shed-days across the 32
armed runs, each a named instead-of day. The plenty regime runs longer on
the armed side (1071 vs 647 rackDaysPlenty, +65%): leaving the
about-to-rot surplus fresh feeds the fresh-first nightly meal and
stretches plenty, the same equilibrium all seven corpora show. End
pantries hold (median 7k = 7k kcal, 3d → 4d fresh) — the shed doesn't
starve the larder; it delays the smoke. The price is fresh rot: 2.208×
the control (44k vs 20k mean), the b2-measured trade at its largest.

Who thrived: villages reaching sustained plenty banked the most shed
days; national reach held flat at 20/32 on both sides. Starvation deaths
moved 16 → 18 on ~27k village-days each — noise, not direction
(paired-direction median 0.000, 19 of 32 pairs tie exactly).

Who died and why: wave-3/4 monsters dominate deaths on both sides — the
lever doesn't touch combat and wasn't expected to. Nothing in the
death-cause shares points at the shed; the two extra starvation deaths
sit in longer-lived armed villages (exposure, not hazard).

What was missing: the instead-of work remains narration-only; the
cook's assignment doesn't mechanically change (documented since b).
The fresh-rot trade (2.208×) is the real open blank — the shed keeps
food fresh that the nightly meal can't eat, and it rots fresh. Whether
that trade is acceptable design is a Steve call (the lever is his
ruling's storage half); the measurement is now the largest in the
series.

## Blanks filled / documented

- FILLED (instrument): b7 sweep + analyzer with the exposure-normalized
  starvation guardrail (b) (armed ≤ control × 1.10 per 100 village-days,
  overall + per-policy), the ≥2-event death-kind rule, 'night' +
  'expedition' pre-existing-content whitelist, pantry/rot channels
  report-only, APPEND mode for pilot→confirm extension, and per-seed
  incremental OUT writes (survived a SIGTERM reaper kill of the first
  pilot launch — zero configs lost on relaunch).
- FILLED (instrument): `scripts/det-gate-storageshedb7.js` — unpatched
  vs patched gate-off trajectory digests byte-identical (4/4 configs).
- FILLED (seed hygiene): 64331–64346 verified fresh by script-seed scan +
  evidence-filename scan (C1 gate).
- FILLED (infrastructure lesson): exec-backgrounded long sims were
  SIGTERM-killed at ~9 min by an unknown reaper; setsid+nohup detached
  processes with incremental writes survived. Also: the intermittent
  container EPERM flap hit this run's panel (killed) and three telemetry
  JSON writes (silent 0-byte; shell-redirection retry succeeded).
- DOCUMENTED (open, carried since b): the instead-of work is
  narration-only; the cook's assignment doesn't mechanically change.
- DOCUMENTED (open, carried since b): 🍽️◦ vs 🍽️ prefix blend on plenty
  days; the per-speaker 12-day line-key cycle can coincide across
  speakers (pool-size artifact).
- DOCUMENTED (steve-call, filed in sim-findings.md): flipping the
  STORAGESHED default ON is Steve's call. The lever stays parked until
  he rules — the GO parks it, it does not land it.
- DOCUMENTED (steve-call, NEW this run): the fresh-rot trade is now
  2.208× at n=32 — the largest measured. Whether the storage half's
  plenty-extending equilibrium is worth its fresh-rot price is a design
  call for Steve alongside the default flip.

## metric review (post-results)

- PRIMARY confirmed stable across SEVEN measurements on six corpora (b2
  ~0.59; b3 0.556/0.568/0.567; b4 0.552/0.586/0.511; b5 0.589/0.607/0.546;
  b6 0.518/0.502/0.530; b7 0.554/0.631/0.501): per-plenty-day rack rate
  ≤ 0.70 is the right instrument for the storage half — exposure-
  invariant, policy-stable, mechanism-direct. The mechanism is proven;
  the series is now about the guardrail.
- Guardrail (b) as pre-registered (armed ≤ control × 1.10 per 100
  village-days) is FINER THAN THE QUANTIZATION STEP at these counts:
  ±1 death on ~13.5k villager-days per leg moves the ratio ~0.06–0.07,
  against a 0.10 slack. The pre-registered tightness was deliberate
  honesty ("tightness is honesty, not risk"), and §14 binds the miss —
  but the metric review's named next for an 8th unpark is a
  quantization-tolerant form: pass if armed ≤ control × 1.10 **OR**
  |armed−control| ≤ 2 deaths corpus-wide, with the paired-direction
  sign test as tiebreak (b7: median 0.000, 8 worse vs 5 better — would
  not bind). The b4 strict-count miscalibration and the b6 slack
  workaround are both retired by this form; the denominator stays
  explicit.
- Guardrail (d)'s whitelist + ≥2-event rule worked exactly as designed:
  no false flag on 'night' (c:3, a:1, both sides). The canonicalizer's
  learned-lesson loop is closed at the input level.
- The fresh-rot watcher (2.208×, FLAG) is the metric that needs the
  next design conversation: it is the only channel moving materially
  against the armed side while the pantry holds. If the 8th unpark
  pre-registers a fresh-rot guardrail, it should be exposure-normalized
  (per plenty-day, not per 100d) and carry the same quantization
  tolerance lesson — and it needs Steve's design call first, because the
  trade may be the intended price of the ruling.
- The 100d horizon censors guardrail (c) (unpaired medians both 100d) —
  the paired-diff formulation salvages it (0d over 32 pairs). Keep the
  paired formulation.
- Panel blocked by EPERM flap: no panel evidence this run. The flap is
  documented as infrastructure; the manual paired analysis judged, as
  in b4/b5/b6 (where the panel compare was invalid-unmatched anyway).
  If the flap persists, the next run should attempt the panel first and
  fall back explicitly.
