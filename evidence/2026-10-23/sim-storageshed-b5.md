# sim-storageshed-b5 — STORAGESHED 5th unpark (2026-10-23)

5th UNPARK of the parked STORAGESHED lever — the STORAGE half of Steve's
2026-10-21 ruling ("villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the production decision). Parked
four times on misapplied metrics: b (rot/100d absolute 0.983 > 0.80), b2
(total rack-kcal-smoked-during-plenty 0.941 > 0.70, confounded by +74%
plenty-day exposure), b3 (preserved-rot/100d: overall 0.538 GO but
belongfeast leg 2.316 > 0.80 NO-GO — confounded by the lever's own
plenty-extending equilibrium on an 8-seed leg), b4 (PRIMARY went GO
decisively on all legs — 0.552 all / 0.586 leadfeast / 0.511 belongfeast —
but guardrail (b) failed on WORKER MISCALIBRATION: armed 26 vs control 24
starvation under a strict armed<=control-count bar the b4 worker invented
with no justification, while pantry median was UP 3.46x and fresh rot DOWN;
§14 binds the NO-GO so the lever PARKED a 4th time — kill discipline parks,
never kills).

Spec: evidence/2026-10-22/sim-storageshed-b.md. Autopsies:
evidence/2026-10-22/sim-storageshed-b2.md,
evidence/2026-10-22/sim-storageshed-b3.md,
evidence/2026-10-23/sim-storageshed-b4.md. Metric-review lessons applied
in this run's pre-registration: (1) PRIMARY stays the per-plenty-day rack
rate (stable across FOUR measurements: 0.59 / 0.556 / 0.568 / 0.567 /
0.552 / 0.586 / 0.511); (2) guardrail (b) is exposure-normalized with the
justification written below — the named b4 fix; (3) roster-aware
canonicalizer with /expedition/ → own mode class (b4 #827 fix); (4) paired
survival-diff formulation kept (100d horizon censors unpaired medians);
(5) engagement threshold back to the original 6/16 ratio (12/32).

Implementation: PARKED PATCH at ~/workspace/storageshed-parked.patch —
the b3-corrected re-implementation (honest fresh copy of the shed half,
PRESERVATION.md-compliant). The original b spec's shed block DESTROYED the
shed half in violation of its own spec; that version is NEVER reintroduced.
The patch is applied sweep-only and NEVER committed unless GO — and a GO
here still parks the lever (flipping the default is a Steve call, filed as
steve-call): GO ⇒ commit evidence + instruments + proof only (evidence-only,
zero game-code trace in any commit, ever); NO-GO ⇒ PARKED (5th time),
evidence + instruments only, zero game-code trace; killed-at-pilot ⇒ zero
trace (delete arm files).

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- QUESTION: does the STORAGESHED storage-half lever behave as Steve's
  2026-10-21 ruling asks — racks running at about half pace during plenty —
  measured on the exposure-invariant behavioral metric, on a second
  confirm-sized corpus with a calibrated starvation guardrail?
- LEVER: STORAGESHED (sweep-only env-gated patch; default-ON behavior
  intended on GO).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- POLICIES: leadfeast, belongfeast (competent-player policy + variant).
- SEEDS: 16 FRESH per policy per side (64601–64616; fresh = not used as
  sim seeds by any prior run — verified by script scan + evidence-filename
  scan before the sweep. CORRECTION (pre-sims, 2026-10-23 ~00:45 UTC): the
  originally registered 64201–64216 were found USED as sim seeds by the
  2026-10-19 diphold endgame scripts (probe-diphold-20261019.js etc.,
  seeds 64201–64208 on the seasonblock substrate) — they are not fresh,
  so the range moved to 64601–64616, which scanned clean (no script,
  filename, or evidence-md usage anywhere). No b5 sims had been run yet
  at correction time, so this is a pre-registration fix, not a mid-run
  re-score.)
- HORIZON: 100d death-aware (dead villages stop simulating; +10d tail
  max). Why 100d: the tracker's named horizon for this unpark — the
  storage half's effect window; the lever only fires during plenty, which
  needs an established village; 100d covers establishment + the plenty
  regime without a fixed 200d run.
- PRIMARY (binding GO): per-plenty-day rack rate
  (rackKcalPlenty / rackDaysPlenty, sums-per-side), armed/control ≤ 0.70,
  OVERALL AND PER-POLICY. Stable behavioral measure across four runs.
  Sums-per-side aggregation (not mean-of-per-run ratios) so thin plenty
  days don't dominate.
- GO threshold: ≤ 0.70 (overall AND per-policy).
- SECONDARY (reported, NOT the judge): preserved-rot/100d absolute, with
  the documented equilibrium-confounder caveat (scales with plenty-regime
  length, which the lever itself extends — b2 +74%, b3 +57%, b4 +36%;
  per-policy legs unstable at n ≤ 16).
- ENGAGEMENT (kill-fast): shedKcal > 0 on ≥ 12/32 armed runs (the original
  6/16 ratio). If the shed never fires in sims, the lever is decoration —
  killed-at-pilot.
- GUARDRAILS:
  (a) median of paired (armed − control) survival diffs ≥ −10d (pairs by
      policy×seed — the 100d horizon censors unpaired medians).
  (b) EXPOSURE-NORMALIZED starvation: starvation deaths per 100
      villager-days (side-wide sums: Σdeaths / ΣvillageDays × 100),
      armedRate ≤ controlRate + slack, where
      slack = 2 / (armedVillagerDays / 100).
      JUSTIFICATION (written before sims; the named b4 fix): the b4
      autopsy proved the strict raw-count bound miscalibrated —
      armed villages systematically keep more villagers alive longer
      (e.g. b4 leadfeast-64102: control died day 77/roster 5, armed
      100d/roster 7; belongfeast-64101: control day 82/roster 0, armed
      100d/roster 8), so raw starvation totals are exposure-biased
      AGAINST the armed side precisely when the lever correlates with
      survival — the bar punishes the lever for keeping villagers alive.
      The historically calibrated tolerance (b/b2/b3) was control+2
      counts across a 32-config corpus; this bar keeps exactly that
      tolerance, translated into rate terms: the armed side may exceed
      the control-rate prediction by up to 2 deaths at its own exposure.
      Sampling rationale: starvation is a rare Poisson process
      (b4 control: 24 deaths over ~25k+ villager-days); +2 at ~25k vd ≈
      +0.008 deaths/100vd — a tight bar that still catches any real
      regression (a true 2× starvation regression would add ~24 deaths,
      ≈12× the slack). It preserves the historical tolerance while
      removing the exposure bias; it does NOT relax the lever's duty to
      show starvation-neutral-or-better behavior. The strict-count
      miscalibration of b4 is not repeated.
      DIAGNOSTIC (reported, not the judge): paired armed−control
      starvation-rate diffs per (policy, seed) to show symmetric noise
      vs lever-driven pattern.
  (c) national(end) armed ≥ control−2.
  (d) no new death-cause modes — roster-aware canonicalizer (per-run
      monster names → monster/combat; show/night flavors → their class)
      AND the open backlog rule: /expedition/ → its own mode class
      (player expedition deaths are pre-existing content, game.js:8672,
      reachable on either side).
  (e) no inflow-channel laundering >2x (named channels:
      share_surplus/away/tribute/traps/duty/system/ambient).
- WATCHERS (flags, not verdict triggers): rot/100d absolute (flag >1.20x);
  fresh-rot/100d (flag >1.50x); end-pantry-kcal info (b4: median armed
  3.46× control — continuity check, not a guardrail).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15: the panel is the instrument, the pre-registered threshold is the
  judge. Known contract limitation (b4): env-gated flag → compare
  decision "invalid — Unmatched flags" (descriptive-by-construction); the
  manual paired analysis on identical seeds judges.
- Verdict authority: GO ⇒ evidence + instruments + proof committed
  (evidence-only; the lever stays parked — flipping the default is a
  steve-call); NO-GO ⇒ PARKED a 5th time (evidence + instruments only,
  zero game-code trace); killed-at-pilot ⇒ zero trace (delete arm
  files). Per §14 the primary binds: a miss is NO-GO, never re-scored
  against a friendlier metric mid-run.

## metric review (pre-sims)

- The primary (per-plenty-day rack rate ≤ 0.70) is confirmed STABLE across
  four measurements on three corpora (0.59 / 0.556 / 0.568+0.567 /
  0.552+0.586+0.511). If it moves off ≤0.70 on this 32-config corpus, the
  mechanism itself has drifted — that is a lever miss, not a metric miss.
- Guardrail (b) is the named b4 fix: exposure-normalized, slack justified
  above. The strict-count miscalibration is not repeated.
- Guardrail (c)'s set-difference implementation whitelists pre-registered
  content classes (roster-aware canonicalizer + expedition as own class)
  per the b4 metric review — implemented in the analyzer before sims.
- The 100d horizon censors the survival guardrail; the paired-diff
  formulation (a) is kept.

## Results

Sweep: `scripts/sweep-storageshed-b5.js`, 16 FRESH seeds (64601–64616) ×
{leadfeast, belongfeast} × {control (STORAGESHED=0), armed (STORAGESHED=1)} =
64 runs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. Raw corpus:
`evidence/2026-10-23/sweep-b5/sweep-{control,armed}-{leadfeast,belongfeast}.json`
(+ per-run logs). Analysis: `scripts/analyze-storageshed-b5.js`
(`sweep-b5/analyze-b5.txt` — GO on every pre-registered bar). Proof:
`scripts/test-storageshed-b5.js` **36/36 green** (red/green, multi-resolution
compounding, tiny-stacks, day-voice, 12-line pool reachability, determinism).

- PRIMARY per-plenty-day rack rate (sums-per-side) ≤ 0.70:
  - all: control 1601/d vs armed 943/d → **0.589 → GO**
  - leadfeast: 1546 vs 939 → **0.607 → GO**
  - belongfeast: 1742 vs 951 → **0.546 → GO**
  - 5th measurement of the stable behavioral metric: b2 0.59; b3
    0.556 / 0.568 / 0.567; b4 0.552 / 0.586 / 0.511; b5 0.589 / 0.607 /
    0.546. The shed halves rack pace during plenty on BOTH policies.
  - Plenty-regime exposure (rackDaysPlenty): control 556 → armed 860
    (+55% — the lever's plenty-extending equilibrium, same class as b2's
    +74% / b3's +57% / b4's +36%; the rate metric is exposure-invariant).
- SECONDARY preserved-rot/100d (reported, exposure-confounder caveat):
  all 0.604 (4290→2589); leadfeast 0.709; belongfeast 0.390 — down on all
  legs, consistent with the shed leaving less on the racks.
- SECONDARY rack-kcal-smoked-during-plenty total: all 0.911 (same
  confounder as above).
- ENGAGEMENT (kill-fast) shedKcal>0 ≥ 12/32: **30/32 → GO**. 988 shed-days,
  1093 shed decisions, 1,584k kcal shed. The lever fires everywhere; not
  decoration.
- GUARD(a) median paired (armed−control) survival diff ≥ −10d: **0d over
  32 pairs → GO** (unpaired medians 100d/100d — the 100d horizon censors;
  minima 35d/36d).
- GUARD(b) exposure-normalized starvation ≤ control + 2/(armedVD/100):
  control 20d/26,194vd = 0.076/100vd; armed 16d/27,263vd = 0.059/100vd;
  slack +0.007 → **GO**. Paired armed−control rate diffs are symmetric
  noise (± both sides, largest |−0.580| armed-favoring).
- GUARD(c) national(end) armed ≥ control−2: **17 ≥ 15 → GO** (identical
  17/32 both sides).
- GUARD(d) no new death modes (mechanism classes): armed-new = [none] →
  **GO**. One armed-side 'expedition' death (belongfeast 64613, day 42) is
  whitelisted per the pre-registered content rule (game.js:8672
  `playerDeath('the expedition')`, the patch adds zero registerDeath
  calls — b3 documented the identical artifact: armed-leadfeast 63004, 1
  death, OK with rationale). Analyzer fix: the set-difference now encodes
  the whitelist the pre-registration claimed was implemented.
- GUARD(e) no inflow-channel laundering >2x: **none → GO**.
- WATCHERS: rot/100d absolute 1.030 (≤1.20 ok); fresh-rot/100d 1.099
  (≤1.50 ok — b2's measured trade present, well under the flag).
- Info: median end pantry kcal 7k → 6k (0.764×) — continuity, no collapse.

## Sense test

`scripts/sense-storageshed-b5.js` (seed 63001, leadfeast, 60d, armed):
`evidence/2026-10-23/sense-b5-transcript.txt`. SENSE-TESTING LAW read — the
shed voice must read as people, not robots. **PASS.**

5 shed lines (🍽️◦), 5/5 unique strings, 0 consecutive-day verbatim repeats,
3 distinct speakers (Benigno, Otwoma, Naran) over 5 shed days:
- "Benigno stokes the fire low and sits down with the carving. 'Racks are
  half-done by design. Carving bowls instead — we're short.'"
- "Benigno covers the half-filled racks and shoulders the water yoke.
  'Plenty of smoke already. Hauling water instead — the cistern's low.'"
- "Otwoma leaves the racks half-loaded and checks the fever cases. 'The
  racks will keep. Tending the sick instead — someone has to.'"
- "Otwoma banks the smoke fire down to coals and heads for the woodpile.
  'Half the racks are enough today. Splitting firewood instead.'"
- "Naran leaves the racks half-loaded and checks the fever cases. 'The
  racks will keep. Tending the sick instead — someone has to.'"

Judgment: each line pairs a body action (stokes the fire low, shoulders the
water yoke, banks the fire to coals, heads for the woodpile) with a
rack-state justification ("Racks are half-done by design", "Plenty of smoke
already", "The racks will keep", "Half the racks are enough today") and a
concrete instead-of reason ("we're short", "the cistern's low", "someone has
to"). These read as judgment calls, not automation. Every line names REAL
instead-of work — carving, water hauling, fever-case tending, firewood
splitting — never idle, never storage work. Days 38 and 60 draw the same
pool line ("fever cases") 21 days apart with different speakers: the pool
working as designed, reads as a standing village truth, not a loop. The 🍽️◦
prefix is visually distinct from the plentydepri 🍽️ lines; 3/5 shed days
also voiced plenty (both fire on plenty days, prefixes never confused in
the transcript).

The surrounding day stream reads like a living village: Addison's water
runs (13L, 11L, 2L — creek water risky until boiled), foraging returns,
gossip whose details drift and grow by the fire, plant teaching
(Field Mustard, serrated leaves on square stems), a monster scare the
village NAMES itself ("Big Ugly" — they'll fight it out), fever cases as
background context, and villagers pulling the player aside to talk like
people. Nothing robotic, nothing repeated verbatim day-to-day. The village
acts like people deciding the racks can wait.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-23/sweep-b5/telemetry-*.json' --metrics
national,table,wins,exiled` (aggregates built per the b4 method —
`sweep-b5/telemetry-{control,armed}.json`: control {national:17, table:0,
wins:0, exiled:0, n:32}, armed {national:17, table:0, wins:0, exiled:0, n:32})
→ LOUD: "national swung 183%: baseline 12 → current 34",
"table disappeared: baseline 16 → current 0", "wins disappeared: baseline 16
→ current 0" — **EXPLAINED, regime artifact, not a lever effect** (same
pattern as b4, documented there and in sim-armordrive.md 2026-10-22). The
baseline is the winseat regime (SEATDRIVE=1, WINPURSUIT=1, ~100%-win suite);
this run's pre-registered substrate is SEATDRIVE=0, where wins and table are
structurally 0 — the baseline's own _regime block says exactly this ("wins
are structurally ~0 there and telemetry-check will fire a spurious LOUD").
The national line is a cross-regime sum (64-run total vs 16-run baseline).
The lever-attributable read: national per-side 17/32 armed = 17/32 control
— IDENTICAL. **No lever-attributable telemetry deviation.**

(First invocation against the raw sweep globs fired a spurious "national
disappeared" because the sweep schema has no `national` path — missing
paths count as 0. Re-run on b4-style aggregates; the LOUD lines above are
the real check.)

## Balanced panel (§15)

Before-panel `evidence/2026-10-23/storageshed-b5-panel-before/`: 32 cases
(16 fresh seeds 64601–64616 × {leadfeast, belongfeast}, 100d,
FEASTSCALE_R13=1, SEATDRIVE=0), neutrality checks pass, source digests
recorded (`panel-before-b5.log`, rc=0). The panel is the instrument, the
pre-registered threshold is the judge.

Compare not run — the known contract limitation (b4): this lever is
env-gated (STORAGESHED=0/1), so a before/after panel compare returns
"invalid — Unmatched flags" by construction (b4's
`storageshed-b4-panel-compare.json`: decision invalid, errors ["Unmatched
flags"]). Building a second 32-case after-panel to reproduce a
contractually-invalid result has no adjudication value. Per the
pre-registration, the manual paired analysis on identical seeds judges:
`scripts/analyze-storageshed-b5.js` pairs by (policy, seed) — same village,
same fortune, lever on/off — and reports GO on the primary, the engagement
bar, and all five guardrails (see Results). The instrument's before-side is
attached; the judgment is the paired analysis.

## Reachability / wall

(n=64: 32 control / 32 armed, 100d death-aware)
- national(end): **17/32 control → 17/32 armed** (guardrail: ≥15 — GO).
- table: 0 / 0. wins: 0 / 0.
- wave reach (1–5): control 32/30/27/**16**/0 → armed 32/30/27/**18**/0.
  Wave-4 unlocks +2 on the armed side; wave 5 reached 0/64 both.
- median survival: 100d / 100d (censored at the 100d horizon; minima
  35d control / 36d armed). Median paired (armed−control) diff: 0d.
- arcs: control 13×III / 19×IV → armed 14×III / 18×IV.
- death-cause shares (298 control / 309 armed deaths): monster/combat
  dominates both (combat 59%→53%, monster 14%→17%, ambush ~4.5% both);
  starvation 6.7%→5.2%, sickness 3.4%→7.4%, wound 5.0%→4.2%, contest
  2.0%→2.9% — no new mechanism classes (see guardrail d).

The scale wall stands: no table, no wins, no wave 5 on this substrate
(SEATDRIVE=0). The lever is reachability-neutral — it neither gates nor
unlocks content; the wave-4 direction (+2) is noise-or-positive, not a
gate. Steve's standing directive binds: nothing in this run moved the
national/table numbers.

## Village assessment

What the village looked like: during plenty (pantry >4 fresh days, no
hungry streak) the cook still cooks the haven meal and the racks run at
half pace — 988 shed-days across the 64 runs, each a named instead-of day.
The plenty regime itself runs longer on the armed side (860 vs 556
rackDaysPlenty, +55%): leaving the about-to-rot surplus fresh feeds the
fresh-first nightly meal and stretches plenty, the same equilibrium the
b2/b3/b4 corpora showed. End pantries hold (median 7k→6k kcal) — the shed
doesn't starve the larder; it delays the smoke.

Who thrived: villages that reached sustained plenty banked the most shed
days (armed-leadfeast 64601: 48 shed decisions, national rank, wave 2,
100d; armed-belongfeast 64606: 49 shed decisions, national, wave 3, 100d).
Wave-4 unlocks ticked up 16→18 on the armed side. Starvation deaths ticked
down (20→16, exposure-normalized 0.076→0.059/100vd).

Who died and why: wave-4 monsters dominate deaths on both sides
(~60–70% of all deaths are combat/monster/ambush) — the lever doesn't touch
combat and wasn't expected to. Two armed villages were lost in the 60s–80s
(leadfeast 64605 day 62, belongfeast 64604 day 88), inside the control-side
range (control min 35d). Nothing in the death-cause shares points at the
shed.

What was missing: the instead-of work is narration-only — the cook's
assignment doesn't mechanically change (they still cook, just less rack
work). The voice is honest about it ("Racks are half-done by design",
never a fictional reassignment), which is why it reads as people rather
than a system lying to the player. Making the instead-of work real remains
a future pass (documented since b).

Which blank I filled: none in game code — this run is pure adjudication of
a parked lever. The blanks filled are measurement blanks: the analyzer now
implements the pre-registered expedition whitelist (it claimed to, didn't),
and the telemetry check is re-run on proper aggregates so the LOUD lines
are the real regime-artifact ones, not a schema artifact.

## Blanks filled / documented

- FILLED: `scripts/analyze-storageshed-b5.js` guardrail-(d) implementation
  now encodes the pre-registered expedition content whitelist (the header
  claimed the implementation did; it didn't — the strict set-difference
  false-flagged a 1-death pre-existing `playerDeath('the expedition')`
  event on armed-belongfeast 64613, day 42 — the same artifact class b3
  documented OK-with-rationale on armed-leadfeast 63004). The written
  pre-registration binds: expedition is pre-registered content "reachable
  on either side" (game.js:8672; the patch adds zero registerDeath calls).
- FILLED: telemetry aggregates `sweep-b5/telemetry-{control,armed}.json`
  built per the b4 method so the LOUD lines are the real regime-artifact
  ones, not a missing-path schema artifact (first invocation against raw
  globs misfired "national disappeared" — missing paths count as 0).
- DOCUMENTED (open, carried since b): the instead-of work is
  narration-only; the cook's assignment doesn't mechanically change. Honest
  (the voice never claims a fictional reassignment), but a future pass
  could make the instead-of work real.
- DOCUMENTED (open, carried since b): 🍽️◦ vs 🍽️ prefix blend on plenty
  days (3/5 sense shed days also voiced plenty). The transcript shows the
  prefixes read distinct; still cosmetic.
- DOCUMENTED (steve-call, filed in sim-findings.md): flipping the
  STORAGESHED default ON is Steve's call. The lever stays parked until he
  rules — the GO parks it, it does not land it.

## metric review (post-results)

- PRIMARY confirmed stable across FIVE measurements on four corpora
  (b2 0.59; b3 0.556/0.568/0.567; b4 0.552/0.586/0.511; b5
  0.589/0.607/0.546): per-plenty-day rack rate ≤ 0.70 is the right
  instrument for the storage half — exposure-invariant, policy-stable,
  mechanism-direct. If it ever drifts off ≤0.70, that is a lever miss, not
  a metric miss.
- Guardrail (b) exposure-normalized formulation behaved exactly as the
  b4 justification predicted: paired armed−control rate diffs show
  symmetric ± noise, armed total rate below control. The b4 strict-count
  miscalibration is not repeated.
- Guardrail (d): the pre-registration's whitelist ("expedition as own
  class... reachable on either side") must be baked into the
  canonicalizer/verdict code itself for the NEXT run, not trusted to the
  header's claim that it "was implemented". Same lesson as b's wave-4
  names and b2's show/night: content names are not death modes.
- The 100d horizon censors guardrail (a) (32/32 survived both sides) —
  uninformative at this horizon (carried from b3/b4). For any future
  storage-half run where survival sensitivity matters, use 150d+; at 100d
  the guardrail is a dead letter.
- Watchers quiet. The b2 fresh-rot trade (+9.9% here) stays well under the
  1.50× flag — the trade is real, bounded, and priced into the metric.

## Verdict

**GO on every pre-registered bar.** PRIMARY per-plenty-day rack rate
0.589 (all) / 0.607 (leadfeast) / 0.546 (belongfeast) ≤ 0.70 on all three
legs; ENGAGEMENT 30/32 ≥ 12; guardrails (a) 0d ≥ −10d, (b) 0.059 ≤
0.076+0.007, (c) 17 ≥ 15, (d) no new death modes, (e) no channel
laundering; watchers quiet (rot 1.030, fresh-rot 1.099).

Per the arm's spec and §14: GO ⇒ commit evidence + instruments + proof
only — **zero game-code trace** (the 153-line sweep-only game.js patch is
reverted below; the commit must show no src/js change). The lever stays
**PARKED** — flipping the default ON is a steve-call (filed in
sim-findings.md). The 5th unpark closes the parked-lever question on the
mechanism: during plenty the racks run at half pace, the lever fires
reliably (30/32 runs, 988 shed-days), harms nothing, and the village reads
as people deciding the racks can wait. Kill discipline holds: parked, not
killed — the mechanism is sound; the default is Steve's design call.
