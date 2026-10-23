# sim-storageshed-b6 — STORAGESHED 6th unpark (2026-10-23)

6th UNPARK of the parked STORAGESHED lever — the STORAGE half of Steve's
2026-10-21 ruling ("villagers deprioritize PRODUCTION and STORAGE when food
is plentiful" — behavioral, bottom-up, at the decision). Parked five times:
b (rot/100d absolute 0.983 > 0.80), b2 (total rack-kcal-smoked-during-plenty
0.941 > 0.70, confounded by +74% plenty-day exposure), b3
(preserved-rot/100d: overall 0.538 GO but belongfeast leg 2.316 > 0.80 NO-GO,
confounded by the lever's own plenty-extending equilibrium on an 8-seed
leg), b4 (primary GO on all legs 0.552/0.586/0.511, but guardrail (b) failed
on worker miscalibration — strict raw counts, armed 26 vs control 24 —
with pantry median UP 3.46x and fresh rot DOWN; §14 bound the NO-GO), b5
(GO on every bar — 0.589/0.607/0.546, engagement 30/32, all five guardrails
pass — landed PARKED evidence-only; the default flip is Steve's call).

Spec: evidence/2026-10-22/sim-storageshed-b.md. Autopsies:
evidence/2026-10-22/sim-storageshed-b2.md,
evidence/2026-10-22/sim-storageshed-b3.md,
evidence/2026-10-23/sim-storageshed-b4.md,
evidence/2026-10-23/sim-storageshed-b5.md.

Implementation: PARKED PATCH at ~/workspace/storageshed-parked.patch — the
b3-corrected re-implementation (honest fresh copy of the shed half,
PRESERVATION.md-compliant). Verified `git apply --check` CLEAN on this
arm's base (30b6ad6e3) before any sims — no refresh needed. The patch is
applied sweep-only and NEVER committed as game code (GO here still parks
the lever — the default flip is Steve's call); this run commits only
instruments + evidence (+ patch refresh if it had drifted — it didn't).

Behavior (unchanged from b3/b4/b5):
- Env-gated `_storageShedOn()` (STORAGESHED=0 control; default-ON). No RNG,
  ledger-only state.
- SHED once per cook-day (shedDayByVid gate): on the cook's first resolution
  with eligible about-to-rot surplus (post-dinner-reserve), floor(u/2) units
  of each batch are pushed back to the pantry as an honest fresh copy
  (pre-conversion name, original spoilDay); the rest goes to the racks.
  Tiny stacks (floor(u/2)=0) engage nothing; gate unconsumed.
- DAY-GATED EASED BUDGET: a shed day's rack budget is 2000 kcal across ALL
  resolutions (shedder's later passes + other cooks), spend accumulating per
  resolution on the day record's shed flag (the b2 spent-accounting fix).
  Non-shed days 4000.
- DAY VOICE `_storageShedDayVoice(v)`: once/day after the meal loop,
  rotating speaker, 12-line instead-of-work pool (real work — never idle,
  never storage work), prefix 🍽️◦ distinct from the production half's 🍽️.

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)

- QUESTION: does the STORAGESHED storage-half lever behave as Steve's
  2026-10-21 ruling asks — racks running at about half pace during plenty —
  measured on the exposure-invariant behavioral metric, on a sixth corpus?
- LEVER: STORAGESHED (sweep-only env-gated patch; default-ON behavior
  intended on GO).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- POLICIES: leadfeast, belongfeast (competent-player policy + variant).
- SEEDS: PILOT 8 FRESH per policy per side (92801–92808; fresh = not used
  as sim seeds by any prior run — verified by script-seed scan +
  evidence-filename scan before the sweep; hits were kcal/hex substrings,
  not seed uses). If the pilot passes the sniff test (primary direction GO
  on both policies + engagement fires), extend to 16 seeds per policy per
  side (92801–92816, APPEND mode) = 64 configs before rendering verdict.
- HORIZON: 100d death-aware (dead villages stop simulating; +10d tail max).
  Why 100d: the tracker's named horizon for this unpark — the storage
  half's effect window; the lever only fires during plenty, which needs an
  established village; 100d covers establishment + the plenty regime
  without a fixed 200d run.
- PRIMARY (binding GO): per-plenty-day rack rate
  (rackKcalPlenty / rackDaysPlenty, sums-per-side), armed/control ≤ 0.70,
  OVERALL AND PER-POLICY. Stable behavioral measure across FIVE
  measurements (b2: ~0.59×; b3: 0.556/0.568/0.567; b4: 0.552/0.586/0.511;
  b5: 0.589/0.607/0.546). Sums-per-side aggregation (not mean-of-per-run
  ratios) so thin plenty days don't dominate.
- GO threshold: ≤ 0.70 (overall AND per-policy).
- SECONDARY (reported, NOT the judge): preserved-rot/100d absolute, with
  the documented equilibrium-confounder caveat (it scales with
  plenty-regime length, which the lever itself extends — b2 +74%, b3 +57%,
  b4 +36%, b5 +55%; per-policy legs unstable at n ≤ 16).
- ENGAGEMENT (kill-fast): shedKcal > 0 on ≥ 6/16 armed runs (pilot) /
  ≥ 12/32 (confirm) — the original 6/16 ratio. If the shed never fires in
  sims, the lever is decoration — killed-at-pilot.
- GUARDRAILS:
  (a) CHAOS-AWARE starvation (per the depinteraction metric review): PAIRED-
      DIRECTION analysis, NOT strict corpus totals. Median of per-
      (policy,seed) armed−control starvation-rate diffs (deaths per 100
      villager-days) ≤ slack, slack = 2/(armedVD/100) (the b4/b5 justified
      tolerance in rate terms, now judged on the paired distribution so
      single-seed exposure asymmetry cannot drive the corpus). Corpus
      totals are reported info-only. Judge: armed not systematically worse.
  (b) median of paired (armed − control) survival diffs ≥ −10d (pairs by
      policy×seed — the 100d horizon censors unpaired medians).
  (c) no pantry collapse: median endFreshDays armed ≥ control − 2d.
  (d) no new death-cause modes — roster-aware canonicalizer AND the
      pre-registered expedition content rule (/expedition/ → its own mode
      class; player expedition deaths are pre-existing content,
      game.js:8672 — the patch adds zero registerDeath calls).
  (e) no inflow-channel laundering >2x (named channels:
      share_surplus/away/tribute/traps/duty/system/ambient); national(end)
      armed ≥ control−2 (national reach not regressed).
- ENGAGEMENT MEASURED: plenty-rack-days/shed-days — the mechanism must fire.
- WATCHERS (flags, not verdict triggers): rot/100d absolute (flag >1.20x);
  fresh-rot/100d (flag >1.50x).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15: the panel is the instrument, the pre-registered threshold is the
  judge. Known contract limitation (b4/b5): env-gated flag → compare
  decision "invalid — Unmatched flags" (descriptive-by-construction); the
  manual paired analysis on identical seeds judges. Attach compare .md.
- Verdict classes: GO (stays PARKED — the default flip is Steve's call) /
  NO-GO (stays parked, metric review) / killed-at-pilot.

## metric review (pre-sims)

- The primary (per-plenty-day rack rate ≤ 0.70) is confirmed STABLE across
  FIVE measurements on four corpora — it is the right judge for this lever
  and stays the primary. If it moves off ≤0.70 on this corpus, the
  mechanism itself has drifted — that is a lever miss, not a metric miss.
- Guardrail (a) is the b6 design per the depinteraction metric review:
  paired-direction (armed not systematically worse) rather than the b5
  corpus-total rate comparison. The exposure-bias autopsy (b4) still binds
  the slack's justification; the paired formulation removes the remaining
  single-seed asymmetry driver.
- Guardrail (c) is the stricter fresh-days form of b5's end-pantry
  continuity info line (b5: median armed 0.764× control kcal) — the pantry
  failure mode this lever could hide is days-of-fresh, not kcal.
- Guardrail (b)'s paired-diff formulation is kept (100d horizon censors
  unpaired medians — b3/b4/b5).

## Proof + determinism (run BEFORE the sweep — never sweep on an unproven patch)

- Patch `git apply --check` clean on arm base 30b6ad6e3 (verified pre-sims,
  above).
- scripts/test-storageshed-b6.js (red/green proof of the spec, 36 checks)
  — run AFTER patch application, BEFORE the sweep.
- Det-gate scripts/det-gate-storageshed-b6.js: 4 configs (63001/63002 ×
  leadfeast/belongfeast, 40d, STORAGESHED=0) run on UNPATCHED game.js, then
  on PATCHED game.js with the gate off — digests must be byte-identical
  (the patch adds zero behavior when the gate is off), ledger never
  created. ALL GREEN before sweeping.

## Results

Sweep: `scripts/sweep-storageshed-b6.js`, 16 FRESH seeds (92801–92816) ×
{leadfeast, belongfeast} × {control (STORAGESHED=0), armed (STORAGESHED=1)} =
64 runs, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. The pilot (seeds
92801–92808, 32 configs) passed the sniff test: primary direction GO on
both policies (0.597 leadfeast / 0.723 belongfeast — the belongfeast leg
marginally above the 0.70 threshold at n=8, the known noisy-leg class) +
engagement 16/16 fires. Extended to 16 seeds via APPEND mode (92809–92816);
analyzer run on the full 64 with ENGAGE_NEED=12
(`evidence/2026-10-23/sweep-b6/analyze-b6.txt` — 1 pre-registered check
failed, see guardrail d root cause below). Proof:
`scripts/test-storageshed-b6.js` **36/36 green** (red/green, multi-resolution
compounding, tiny-stacks, day-voice, 12-line pool reachability,
determinism). Det-gate: unpatched vs patched gate-off trajectory digests
byte-identical on 63001/63002 × leadfeast/belongfeast (4/4) — the patch
adds zero behavior when the gate is off.

- PRIMARY per-plenty-day rack rate (sums-per-side) ≤ 0.70:
  - all: control 1708/d vs armed 884/d → **0.518 → GO**
  - leadfeast: 1848 vs 927 → **0.502 → GO**
  - belongfeast: 1583 vs 839 → **0.530 → GO**
  - 6th measurement of the stable behavioral metric: b2 0.59; b3
    0.556 / 0.568 / 0.567; b4 0.552 / 0.586 / 0.511; b5
    0.589 / 0.607 / 0.546; b6 0.518 / 0.502 / 0.530. The shed halves rack
    pace during plenty on BOTH policies — the belongfeast pilot wobble
    (0.723 at n=8) resolved decisively at n=16.
  - Plenty-regime exposure (rackDaysPlenty): control 734 → armed 999
    (+36% — the lever's plenty-extending equilibrium, same class as b2's
    +74% / b3's +57% / b4's +36% / b5's +55%; the rate metric is
    exposure-invariant).
- SECONDARY preserved-rot/100d (reported, exposure-confounder caveat):
  all 0.591 (4708→2783); leadfeast 0.659; belongfeast 0.535 — down on all
  legs, consistent with the shed leaving less on the racks.
- SECONDARY rack-kcal-smoked-during-plenty total: all 0.704 (same
  confounder as above).
- ENGAGEMENT (kill-fast) shedKcal>0 ≥ 12/32: **30/32 → GO**. 1060
  shed-days, 1194 shed decisions, 2,449k kcal shed. The lever fires
  everywhere; not decoration.
- GUARD(a) CHAOS-AWARE starvation (paired-direction): median of 32
  per-(policy,seed) armed−control rate diffs = **0.000/100vd** ≤ slack
  +0.007 → GO. Armed-worse pairs 3, armed-better pairs 5 — armed is NOT
  systematically worse. Corpus totals (info only, not the judge):
  control 18d/28,344vd = 0.064/100vd; armed 16d/28,073vd = 0.057/100vd.
- GUARD(b) median paired (armed−control) survival diff ≥ −10d: **0d over
  32 pairs → GO** (unpaired medians 100d/100d — the 100d horizon censors;
  minima 27d/27d, both the paired early-collapse seed 92811).
- GUARD(c) no pantry collapse (median endFreshDays): **4d control = 4d
  armed → GO**. Median end pantry kcal 7k → 8k (1.137×) — continuity.
- GUARD(d) no new death modes (mechanism classes): **NO-GO as
  implemented** — armed-new = [night]. Investigation: ONE death,
  armed-belongfeast 92807, day 49, cause "the night". Root cause:
  pre-existing content, NOT a lever effect. "The night" is the
  overnight-death attribution in src/js/engine/calories.js:100,146 — a
  player entering the night at 0 HP with no wounds/disease, or with a
  trivial kcal deficit the day had already claimed ("the night found a
  body the day had already claimed"). The patch adds zero registerDeath
  calls (proof-tested); it touches only the cook's smoke-rack code and
  cannot dispatch night deaths. 1/32 vs 0/32 is sampling asymmetry over
  pre-existing content — the SAME artifact class as b3's wave-4 names,
  b2's "night", and b4/b5's expedition deaths (the latter two whitelisted
  in their pre-registrations as pre-existing content). The pre-registered
  rule did not name 'night', so per §14 the NO-GO binds; the fix belongs
  to the next run's pre-registration (metric review).
- GUARD(e) national(end) armed ≥ control−2: **22 ≥ 16 → GO** (armed +4).
  No inflow-channel laundering >2x → GO.
- WATCHERS: rot/100d absolute 1.009 (≤1.20 ok); fresh-rot/100d 1.045
  (≤1.50 ok — the b2-measured trade present, bounded).

### Root cause of the guardrail (d) miss (measured, not guessed)

The analyzer's set-difference (roster-aware canonicalizer + the
pre-registered expedition whitelist) flags any mechanism class absent
from the control set. 'night' is a pre-existing content class:
src/js/engine/calories.js:100 assigns killedBy='the night' when the
player enters the night at 0 HP with no wounds/disease; line 146 assigns
it for a trivial kcal deficit on a full belly ("a body the day had
already claimed"). Both code paths predate this lever by months and are
untouched by the patch. The lever's only writes are the _storageShed
ledger and the shed voice line. A 1-death sampling asymmetry (1/32 vs
0/32) over pre-existing content is not a new death mode — this is the
fourth such flag in six runs (b's wave-4 names, b2's show/night, b3's
expedition, b4/b5's expedition) and the canonicalizer keeps earning the
same lesson: content names are not death modes.

Per §14 the pre-registered implementation binds: the whitelist named
only expedition, so the NO-GO stands. The metric fix (whitelist 'night'
as pre-registered pre-existing content) belongs to the NEXT run. Per
Steve's kill discipline (2026-10-21), a missed bar is not a kill: the
lever is not confirmed harmful — the primary passes decisively on all
three legs (0.518/0.502/0.530), engagement is 30/32, survival is flat,
starvation is not systematically worse, the pantry holds 4d fresh both
sides, national is UP. **PARKED, not killed** — sixth parking, same
standing as the five prior runs.

## Sense test

`scripts/sense-storageshed-b6.js` (seed 92802, leadfeast, 60d, armed):
`evidence/2026-10-23/sense-b6-transcript.txt`. SENSE-TESTING LAW read — the
shed voice must read as people, not robots. **PASS.**

16 shed lines (🍽️◦), 15/16 unique strings, 0 consecutive-day verbatim
repeats, 2 distinct speakers (Regina, Eli) over 16 shed days:
- "Regina leans the smoking forks against the wall and picks up the net needle. 'Racks can wait — these nets won't mend themselves.'"
- "Eli sets the smoking racks aside and gathers the young ones. 'Smoke can wait a day. Teaching snares instead — they learn by doing.'"
- "Eli stacks the unworked strips back on the fresh pile and laughs. 'The racks don't need it all. Patching boots instead — half the haven's leaking.'"
- "Regina closes the smokehouse door on a half-load and finds the elders. 'The racks will survive a slow day. Sitting with the elders instead.'"

Judgment: each line pairs a body action (leans the smoking forks aside,
banks the smoke fire to coals, shoulders the water yoke, sits down with
the carving) with a rack-state justification ("Racks can wait", "Half
pace today", "Plenty of smoke already", "Racks are half-done by design")
and a concrete instead-of reason ("these nets won't mend themselves",
"the cistern's low", "half the haven's leaking", "someone keeps the
stories"). These read as judgment calls, not automation. Every line names
REAL instead-of work — net mending, snare teaching, palisade mending,
sitting with elders, boot patching, bowl carving, water hauling, fire
tending, wood splitting — never idle, never storage work. The one repeat
(day 39/44, "net needle" line, 5 days apart) is the pool working as
designed, not a loop. The 🍽️◦ prefix is visually distinct from the
plentydepri 🍽️ lines; 16/16 shed days also voiced plenty (both fire on
plenty days, prefixes never confused in the transcript).

The surrounding day stream reads like a living village: a Thornfield aid
offer with a trust-cost refusal ("Heard your bins are echoing. Thornfield
has grain to spare — 2,158 kcal, no tribute, no ceremony"), gossip whose
details drift ("The truth left this story two fires ago. What's left is
better theater"), the village NAMING a monster itself ("The Loud Beast.
They'll fight it out"), a season turning with the Codex growing (73 new
entries) and Wilhelm's memorial ("Their names are spoken, then the fire
is quiet a while"), strangers and fever cases as background context.
Nothing robotic, nothing repeated verbatim day-to-day. The village acts
like people deciding the racks can wait.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-23/sweep-b6/telemetry-*.json' --metrics
national,table,wins,exiled` (aggregates built per the b4/b5 method —
`sweep-b6/telemetry-{control,armed}.json`: control {national:18, table:0,
wins:0, exiled:0, n:32}, armed {national:22, table:0, wins:0, exiled:0,
n:32}) → LOUD: "national swung 233%: baseline 12 → current 40",
"table disappeared: baseline 16 → current 0", "wins disappeared: baseline
16 → current 0" — **EXPLAINED, regime artifact, not a lever effect**
(same pattern as b4/b5, documented there and in sim-armordrive.md
2026-10-22). The baseline is the winseat regime (SEATDRIVE=1,
WINPURSUIT=1, ~100%-win suite); this run's pre-registered substrate is
SEATDRIVE=0, where wins and table are structurally 0 — the baseline's own
_regime block says exactly this. The national line is a cross-regime sum
(64-run total vs 16-run baseline). The lever-attributable read: national
18/32 control → 22/32 armed — armed is UP, not regressed. **No
lever-attributable telemetry deviation.**

## Balanced panel (§15)

Before panel `evidence/2026-10-23/storageshed-b6-panel-before/`: 32 cases
(16 fresh seeds 92801–92816 × {leadfeast, belongfeast}, 100d,
FEASTSCALE_R13=1, SEATDRIVE=0, STORAGESHED=0 — patch applied, gate off),
panel.json.gz written, sources stable. After panel
`evidence/2026-10-23/storageshed-b6-panel-after/`: 32 cases (same
options/seeds, STORAGESHED=1), 32 cases, panel.json.gz written. Case JSONs
in the panels' cases/ dirs (not committed — panel case caches never
commit); panel.json.gz for both sides committed.

Compare `storageshed-b6-panel-compare.{json,md}`: **Decision: invalid —
Unmatched flags** (STORAGESHED=0 vs STORAGESHED=1). This is the
pre-registered contract limitation for env-gated levers: the env flag IS
the lever, so comparator options can never match — reproduced for the
third run in a row (b4, b5, b6). The panel as instrument is sound —
matched seeds/policies, stable sources, observer/contract digests
identical across sides — but the automated compare cannot score it.
Manual paired analysis on the 64-config sweep (identical seeds) judges:
national 18→22, table 0→0, won 0→0, wave4 19→19, wave5 0→0, median
paired survival diff 0d; death-class diffs are the single pre-existing
'the night' content death documented above, no new lever-caused classes.
No broad-balance footprint; the sweep's pre-registered threshold remains
the judge: PRIMARY GO on all legs, guardrail (d) NO-GO as implemented →
**PARKED**.

## Reachability / wall

(n=64: 32 control / 32 armed, 100d death-aware)
- national(end): **18/32 control → 22/32 armed** (guardrail: ≥16 — GO;
  armed +4, both directions occur across 24 differing pairs — no
  mechanistic path from rack economics to rank, but the direction is
  positive).
- table: 0 / 0. wins: 0 / 0.
- wave reach (1–5): control 32/32/31/**19**/0 → armed 32/32/32/**19**/0.
  Wave 5 reached 0/64 both.
- median survival: 100d / 100d (censored at the 100d horizon; minima
  27d control / 27d armed — the paired early-collapse seed 92811, both
  sides). Median paired (armed−control) diff: 0d.
- arcs: control 19×III / 13×IV → armed 13×III / 19×IV (IV completions +6
  armed).
- death-cause shares (235 control / 231 armed deaths): combat/monster/
  ambush dominates both (77.4%→77.5%); starvation 7.7%→6.9%; sickness
  6.8%→8.2%; wound 3.4%→2.6%; contest/show 1.7%→1.3%; dehydration ~1%
  both; expedition 0.4% both; alien 0.9%→0.0%; the single 'night' death
  sits in armed's 1.7% 'other' — no new mechanism classes (see
  guardrail d).
- vests: not tracked this run.

The scale wall stands: no table, no wins, no wave 5 on this substrate
(SEATDRIVE=0). The lever is reachability-neutral — it neither gates nor
unlocks content. Steve's standing directive binds: nothing in this run
moved the national/table numbers except armed-side noise-or-positive.

## Village assessment

What the village looked like: during plenty (pantry >4 fresh days, no
hungry streak) the cook still cooks the haven meal and the racks run at
half pace — 1060 shed-days across the 32 armed runs, each a named
instead-of day. The plenty regime itself runs longer on the armed side
(999 vs 734 rackDaysPlenty, +36%): leaving the about-to-rot surplus fresh
feeds the fresh-first nightly meal and stretches plenty, the same
equilibrium the b2/b3/b4/b5 corpora showed. End pantries hold (median 4d
fresh both sides, kcal 7k→8k) — the shed doesn't starve the larder; it
delays the smoke. Preserved rot collapses (4696→2762 mean/100d), fresh
rot is flat (1.045×, under the 1.50× flag).

Who thrived: villages reaching sustained plenty banked the most shed
days (armed-leadfeast 92810: 66 shed decisions, global rank, wave 4,
100d; armed-belongfeast 92810: 135 shed decisions, global, wave 2, 100d).
National reach ticked up 18→22 on the armed side; Arc IV completions
+6. Starvation deaths ticked down (18→16, paired-direction median 0.000,
3 armed-worse vs 5 armed-better pairs).

Who died and why: wave-3/4 monsters dominate deaths on both sides
(~77.5% of all deaths are combat/monster/ambush) — the lever doesn't
touch combat and wasn't expected to. The paired early-collapse seed
(92811: both sides dead by day 27, wave 1) anchors the minima — identical
on both sides. Nothing in the death-cause shares points at the shed.

What was missing: the instead-of work remains narration-only; the cook's
assignment doesn't mechanically change (they still cook, just less rack
work). The voice is honest about it ("Racks are half-done by design",
never a fictional reassignment), which is why it reads as people rather
than a system lying to the player. Making the instead-of work real remains
a future pass (documented since b). The single 'night' death (armed,
day 49) is pre-existing content, not a lever effect.

## Blanks filled / documented

- FILLED (instrument): b6 sweep + analyzer with the chaos-aware
  paired-direction starvation guardrail (a) — the depinteraction metric-
  review design — the new median-endFreshDays pantry guardrail (c), and
  APPEND mode for pilot→confirm extension (pilot 32 configs + confirm 32
  = 64 on the same fresh seed block, no re-runs).
- FILLED (instrument): `scripts/det-gate-storageshed-b6.js` — unpatched
  vs patched gate-off trajectory digests byte-identical (4/4 configs);
  the patch adds zero behavior when the gate is off, verified before any
  sims on this arm's base.
- FILLED (seed hygiene): 92801–92816 verified fresh by script-seed scan +
  evidence-filename scan (hits were kcal/hex substrings, not seed uses).
- FILLED (per-seed evidence): `evidence/2026-10-23/perseed-storageshed-b6/`
  — 64 per-seed JSONs ({policy}-s{seed}-{side}-full.json).
- DOCUMENTED (open, carried since b): the instead-of work is
  narration-only; the cook's assignment doesn't mechanically change.
  Honest (the voice never claims a fictional reassignment), but a future
  pass could make the instead-of work real.
- DOCUMENTED (open, carried since b): 🍽️◦ vs 🍽️ prefix blend on plenty
  days (16/16 sense shed days also voiced plenty). The transcript shows
  the prefixes read distinct; still cosmetic.
- DOCUMENTED (metric fix for the next run): the death-mode canonicalizer
  needs a 'night' → pre-existing-content rule — the fourth
  content-name false-flag in six runs (b's wave-4 names, b2's show/night,
  b3/b4/b5's expedition, now 'the night'). Pre-registered content
  reachable on either side; its one-sided appearance is sampling noise.
- DOCUMENTED (steve-call, filed in sim-findings.md): flipping the
  STORAGESHED default ON is Steve's call. The lever stays parked until he
  rules — the GO parks it, it does not land it.

## metric review (post-results)

- PRIMARY confirmed stable across SIX measurements on five corpora (b2
  0.59; b3 0.556/0.568/0.567; b4 0.552/0.586/0.511; b5 0.589/0.607/0.546;
  b6 0.518/0.502/0.530): per-plenty-day rack rate ≤ 0.70 is the right
  instrument for the storage half — exposure-invariant, policy-stable,
  mechanism-direct. The belongfeast pilot wobble (0.723 at n=8) resolved
  to 0.530 at n=16 — the staged pilot→confirm design worked exactly as
  intended: n=8 per-policy legs are noisy, n=16 decides.
- Guardrail (a)'s paired-direction formulation behaved as designed:
  median 0.000/100vd, 3 armed-worse vs 5 armed-better pairs — the lever
  is not systematically worse on starvation. The corpus totals (info
  only) agree. The b4 strict-count miscalibration class is fully retired.
- Guardrail (c)'s fresh-days form held (4d = 4d) — the pantry-side
  failure mode this lever could hide is not hiding.
- Guardrail (d): the pre-registration's whitelist must enumerate ALL
  known pre-existing content classes ('expedition', 'night', and any
  future one-sided sampling artifact) rather than naming only the most
  recent flag. The set-difference implementation is correct machinery;
  its input list keeps learning the same lesson run by run. For the next
  unpark: pre-register 'night' (engine/calories.js:100,146) alongside
  'expedition'.
- The 100d horizon censors guardrail (b) (unpaired medians both 100d) —
  the paired-diff formulation salvages it (0d over 32 pairs). Keep the
  paired formulation.
- preserved-rot/100d as a secondary behaved well (0.591) — the
  equilibrium confounder's strength is corpus-dependent, as b4/b5 noted.
  It remains a secondary, never the judge.

## Verdict

**NO-GO on pre-registered guardrail (d) (one armed-side 'the night' death
flagged by the set-difference; armed-new = [night]) — PARKED, not
killed.** Per §14 the miss binds: the pre-registered whitelist named
only 'expedition', so the lever does not land as a GO. Per Steve's kill
discipline (2026-10-21), a missed bar is not a kill: the lever is not
confirmed wrong — the primary passes decisively on all three legs
(0.518/0.502/0.530, the sixth consistent measurement), engagement is
30/32, guardrails (a) (b) (c) (e) all pass, survival is flat, starvation
is not systematically worse, the pantry holds, national is UP (18→22),
and the (d) miss root-causes to a measurement artifact (a pre-existing
content class appearing 1/32 vs 0/32 by sampling — the patch adds zero
registerDeath calls), not to lever harm. Killing it would override
Steve's design direction on the basis of a canonicalizer input list.
The parked patch (~/workspace/storageshed-parked.patch, verified
applying cleanly to this base) stays sweep-only with zero trace in the
commit. The evidence records the NO-GO and the metric review for the
next unpark (pre-register the 'night' content rule; keep the
per-plenty-day rack rate primary).
