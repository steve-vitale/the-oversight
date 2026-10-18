# sim-prodrebound-b — attributing the production rebound (food-economy diagnostic)

Run: fleshout-loop-b-20261018T175233Z, arm sim-prodrebound-b (DIAGNOSTIC — no lever, no landing).
Worker tree: ~/workspace/worktrees/prodrebound-b.
Answers sim-findings #570: the killed sim-feastdraw-b lever's ATTRIBUTED perverse dose-response
(Pearson(fd nights, pair rot ratio) = +0.73; backfires lead 6206 rot 1.87x, belong 6202 rot 2.41x).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: the feastdraw lever ate the doomed pile at night, yet total rot ROSE on glut seeds
  (lead 6206: seconds ate 469k while rot rose 313k; belong 6202: ate 345k, rot rose 267k). WHICH inflow
  channels rebound, WHAT triggers the rebound, and is it a tunable knob or structural behavior?
- **Primary metric (binding)**: ≥80% of the backfire excess rot attributed to identified inflow
  channels with mechanism-level evidence (armed−control kcal deltas per channel on the two
  permanent-glut seeds + the pantry-feedback code path named).
- **Horizon**: 180d death-aware (dead villages stop, +10d tail). **Seeds**: 8 FRESH 6301–6308 ×
  {leadfeast, belongfeast} × {control, armed-replay} = 32 runs, plus targeted re-runs of the two
  known backfire pairs (lead 6206, belong 6202) × {control, armed-replay} = 8 runs.
- **Substrate**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat courtship); base
  policies only. Assert env up front; sweep stops on mismatch.
- **Armed condition**: scripts/prodrebound-feastdraw-replay.js — a DIAGNOSTIC-ONLY replay of the
  killed feastdraw layer (NOT a lever; never land it; never move it into scripts/policies/).
  Fidelity gate (scripts/test-prodrebound-b.js): the replay must reproduce the lead-6206
  backfire (rot ratio ≥1.5x) or the attribution is invalid. A miss is NO-GO, never re-scored.
- **Guardrails**: none pre-registered beyond the fidelity gate — this is a diagnostic, not a lever.
  The replay must not change control-side behavior (det-gate: gate-off byte-identical).
- **Balanced panel**: scripts/balance-panel.js before/after per §15 (panel = instrument,
  the ≥80% attribution bar = judge).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The diagnostic touches no game code
  (src/ untouched — policy-side replay + read-only telemetry wraps). "Rot can't be smoked back
  into food" holds: the replay's seconds draw runs through pantryDraw (spoiled stacks skipped).
- Inflow channels named from the engine: duty forage/garden/fish/hunt (resolveOneAssignment),
  duty cook smoke drive (in-place fresh→preserved), away-forage returns (npcNodeTravel),
  traps (objReturnEffect), field-fight carcass hauls (objReturnEffect 'haul'), villager
  surplus-share (stockSurplus), scout cache finds, kid foraging.

## Instruments

- scripts/prodrebound-feastdraw-replay.js — DIAGNOSTIC-ONLY replay (see header). Trigger
  200*roster, cap 400*roster/night, pantryDraw cook:true, per-villager hunger easing with the
  meal's own math, recordTakeHist kept, pantryKcal re-synced, one voice line, ctx telemetry.
- scripts/sweep-prodrebound-b.js — 40-run sweep with per-channel inflow telemetry:
  stockPantry attributed by duty-task flag (resolveOneAssignment wrap) / return-purpose flag
  (objReturnEffect wrap) / name classification; stockSurplus wrapped separately; PRODTHROTTLE
  sensor wrapped (engagement counts); Game.sleep wrapped for the dawn sensor snapshot
  (pantryFreshKcal, pantryFreshDays, burnHistory avg — what the day's duties see); assignTask
  mix counted; rot split fresh/preserved by item identity; kind-aware deaths; starveDays.
- scripts/test-prodrebound-b.js — proof: det-gate (gate-off byte-identical 40d×2 seeds),
  GREEN fixture (trigger/cap/telemetry/hunger/history/empty-pantry), conservation (channel
  sums == independent stockPantry total), fidelity (lead-6206 backfire ≥1.5x).
- scripts/analyze-prodrebound-b.js — aggregator: per-channel deltas, throttle/sensor
  deltas, attribution shares, wall numbers.

## Mechanism mapping (code + measurement, pre-sweep)

### Inflow channels, ranked (measured: lead 6206 control, 163d)

| channel | kcal | share | governed by |
|---|---|---|---|
| `share_surplus` (villager autonomous production → stockSurplus) | 828k | 84% | NOTHING (structural) |
| `away_wild` (away-forage returns, scout finds, kid forage) | 108k | 11% | objPick pantry gate (<4000, weak) |
| `other` | 38k | 4% | — |
| `traps` (objReturnEffect) | 7k | <1% | — |
| `duty_fish` | 5k | <1% | PRODTHROTTLE |
| `duty_forage` | 0k | 0% | PRODTHROTTLE (98.6% redirected) |

### The two feedback paths

1. **PRODTHROTTLE** (game.js:14539 `prodThrottleEngaged()`, called from
   `resolveOneAssignment`:6327): `pantryFreshDays() > 4` → duty
   forage/garden/fish redirect to wood/water/stone. TUNABLE KNOB (the `> 4`
   threshold). Measured: 98.6% engaged on the glut control (870/882).
   The replay's seconds disengage it to 87.5% (506/578) — the
   pantry-feedback IS real and DOES respond. But duties are a minor
   channel on glut seeds; the disengagement moved duty_fish +48k, not
   the +782k of the original's excess.

2. **Policy cook staffing** (scripts/policies/competent.js:1472): staff a
   cook when about-to-rot fresh > 1500. This is a RESPONSE to surplus
   (explains the original's +25% smoke drive), not a driver of
   production.

### The structural channel

`share_surplus` comes from `villagerDayProduction` (game.js:27513:
`villagerExpectedDaily * gritRoll * mentorBonus * rally`) via
`villagerMealDay` (game.js:27824): each living villager produces every
day, eats `need` from it, shares `(produced - need) * trustFactor` via
`stockSurplus` (game.js:27274). This channel:
- is NOT governed by PRODTHROTTLE,
- is NOT governed by duties or the policy,
- scales LINEARLY with living villagers (~625 kcal/villager-day measured),
- has NO pantry feedback — villagers produce at the same rate whether
  the pantry holds 144 days or 4 days of fresh.

### Fidelity failure (blocking)

The pre-registered fidelity gate FAILED: a faithful replay of the
killed feastdraw layer does NOT reproduce the original's backfire.

| seed | original control | original armed | replay control | replay armed |
|---|---|---|---|---|
| lead 6206 | 361k (180d) | 674k (1.87x) | 660k (164d) | 332k (0.55x) |
| belong 6202 | 189k (157d) | 455k (2.41x) | 684k (180d) | 293k (0.43x) |

The replay's trigger engages (fdNights 79–131, cf. original 106–134)
and the seconds fire, but rot goes DOWN, not up — and the inflow
channels do NOT rebound (share_surplus 883k vs 903k on belong 6202;
essentially identical). The original's control trajectories are not
reproducible on current master despite zero src/js changes between the
feastdraw kill commit and HEAD — the original's corpus was produced
under conditions that no longer hold (or the original layer behaved
differently in an unrecoverable way; it was deleted zero-trace and
never committed).

Per §14, the primary metric (≥80% attribution of the backfire excess)
is NO-GO: the backfire does not reproduce, so there is no excess to
attribute. The diagnostic value is the mechanism map above, which
answers the three questions structurally (see "Attribution verdict").

## Results

### Diagnostic sweep (32 fresh runs + 4 backfire re-runs, 180d death-aware)

**Fresh seeds 6301–6308 × {leadfeast, belongfeast} × {control, armed-replay}** (n=16 pairs):

| metric | control | armed | delta |
|---|---|---|---|
| rot (pooled) | 1,618k | 811k | **0.501x** (lever WORKS) |
| production inflow (pooled) | 8,194k | 7,860k | **-334k** (NO rebound) |
| throttle engagement | 84.8% | 86.3% | +1.5pp (no disengagement) |
| share_surplus delta | — | — | **-227k** (dominant channel DOWN) |
| duty_fish delta | — | — | -108k (DOWN) |
| away_wild delta | — | — | +12k (noise) |

**Backfire-pair re-runs** (lead 6206, belong 6202 — the original's 1.87x/2.41x seeds):

| pair | rot C→A | ratio | inflow delta | throttle C→A |
|---|---|---|---|---|
| lead 6206 | 660k→214k | **0.32x** | -104k | 98.6%→87.5% |
| belong 6202 | 685k→293k | **0.43x** | -15k | 100%→100% |

Channel deltas on backfire pairs: duty_fish +48k (throttle disengagement,
real but tiny), away_wild +18k (noise), share_surplus **-182k** (DOWN).

**Dose-response**: Pearson(fdNights, rotRatio) = **+0.118** (n=17) in the
replay vs **+0.73** in the original. Only 3/17 pairs have ratio>1. The
perverse dose-response does NOT reproduce.

### Attribution verdict (the three diagnostic questions)

**1. WHICH inflow channels rebound?** NONE, in a faithful replay. The
dominant channel (`share_surplus`, 84–88% of inflow) DECREASED (-182k to
-227k). The only channel that increased was `duty_fish` (+48k on the
backfire seeds), from a measured throttle disengagement (98.9%→90.4%).
This is a real but tiny effect — 48k vs the original's 782k excess.
`away_wild` (+12–18k) is noise-level.

**2. WHAT triggers the rebound?** The only real pantry-feedback is
**PRODTHROTTLE** (game.js:14539 `prodThrottleEngaged()`, called from
`resolveOneAssignment`:6327): `pantryFreshDays() > 4` redirects duty
forage/garden/fish to wood/water/stone. It DOES respond to the seconds
(measured disengagement), but it governs only the minor duty channels.
The dominant channel (`share_surplus` via `villagerDayProduction`,
game.js:27513) has NO pantry feedback — it is structural, scaling with
living villagers × health × knowledge. It cannot "rebound"; it just
continues. The policy cook-staffing (competent.js:1472, staff cook when
about-to-rot >1500) is a RESPONSE to surplus, not a driver.

**3. Tunable knob or structural?** BOTH, but the knob is the wrong one:
- **PRODTHROTTLE threshold** (`> 4` days): TUNABLE KNOB, but saturated on
  glut (98.9%) and governs only duties (<1% of inflow on glut).
- **`villagerDayProduction` / `share_surplus`**: STRUCTURAL (engine
  behavior, game.js:27513/27824/27274). This is 84–88% of inflow and has
  no governor. The "rebound" the original measured — if real — was this
  channel scaling with survivors, not a feedback loop.

### §15 balanced-panel compare

evidence/2026-10-18/prodrebound-panel-primary.{json,md} (+ -before/-after
.json.gz). Decision: **review_required** — driven by a leadfeast table
invitation regression_watch (delta -0.25, CI [-0.625, 0]); belongfeast
shows no signal. Small-sample wobble on a diagnostic (the replay is not
a lever candidate). The panel is the instrument, the ≥80% attribution
bar is the judge (NO-GO — see Metric review).

### Wall numbers (fresh-seed sweep)

control: national 4/16, table 15/16, wins 0/16, w4 13/16, w5 0/16, median
128d, max 180d. armed: national 5/16, table 13/16, wins 0/16, w4 12/16,
w5 0/16, median 147d, max 180d. The wall stands (zero wins, wave-5
ceiling, pre-seat). This diagnostic does not attack the wall.

### Village assessment (plain words)

Eighteen villages, twinned. The replay served seconds at the fire on
doomed nights — 79–100 trigger nights on the glut seeds, 300–338k kcal
of doomed eaten that would have rotted at dawn. And the rot went DOWN,
not up (0.32x–0.50x). The village did not answer with more production;
the inflow channels stayed flat or fell. The throttle — the only real
pantry-feedback — twitched (98.9%→90.4% on the glut seeds, duty fish
hauled 48k more), but the great river of food, the villagers' own daily
production shared as surplus (84% of everything the village makes),
flowed on unchanged, governed by nothing but the number of living hands.

Who thrived: the villages where the seconds cleared a doomed pile —
rot halved, survival +19d median on armed. Who died: the early
collapses (seeds 6302/6308: the trigger never engaged; nothing to
attribute). What was missing: not a feedback loop, but a governor —
the autonomous production has no pantry feedback, so on glut seeds the
village drowns in its own surplus. Which blank I filled: the mechanism
map — the channels are named, the throttle is measured, the structural
vs tunable distinction is drawn. The original's "production rebound"
does not reproduce with a faithful replay; the fidelity failure is
documented, not hidden.

## Metric review (§14)

- **Primary (≥80% attribution of backfire excess): NO-GO.** The
  pre-registered fidelity gate failed: a faithful replay of the killed
  feastdraw layer does not reproduce the original's backfire (lead 6206:
  0.32x vs 1.87x; belong 6202: 0.43x vs 2.41x; dose-response +0.12 vs
  +0.73). There is no excess rot to attribute. Per §14, a miss is NO-GO,
  never re-scored.
- **What the diagnostic proved instead** (instruments all GREEN):
  det-gate byte-identical (gate-off), GREEN fixture (trigger/cap/
  telemetry/hunger/history), conservation (channels sum to independent
  total). The instruments are valid; the phenomenon is not reproducible.
- **Hypotheses for the original's backfire** (unverifiable — the layer
  was deleted zero-trace, never committed): (a) the original layer had
  an unrecoverable behavioral difference from the spec; (b) the
  original's corpus was produced under different runner conditions
  (its control trajectories do not reproduce on current master despite
  zero src/js changes — 361k/180d vs 660k/164d on lead 6206 control).
  Either way, the +0.73 dose-response and 2.10x/1.87x backfires should
  not be treated as established facts about the lever — they are
  measurements of a deleted implementation.
- **The mechanism map stands**: the channel ranking, the throttle
  measurement, and the structural-vs-tunable distinction are
  implementation-independent (they're engine properties, verified in
  code and in the replay's measurements).

## Named next lever spec (for the food-economy axis)

**Target**: the ungoverned autonomous production (`share_surplus`,
84–88% of inflow). The PRODTHROTTLE is the wrong knob (saturated,
wrong channel). The draw side is exhausted (3 killed variants).

**Direction**: add pantry-feedback to `villagerDayProduction`
(game.js:27513) — e.g., scale the surplus-share (not the eating) when
`pantryFreshDays()` exceeds a threshold. This is game-code (structural),
not policy-side. Design note: villagers should still produce and eat
(they're people); it's the SURPLUS that needs a governor, mirroring
the PRODTHROTTLE's "honest foraging practice" rationale for duties.

**Alternative**: scale preservation to match production (cook
throughput: the 4000 kcal/part budget and racks-full guard are the
game-side bottlenecks per FOOD R8). But the axis has killed 3
preservation-adjacent variants; the production governor is the
unexplored direction.

**Do NOT**: build another draw-side lever. The draw is not the binding
constraint — the ungoverned inflow is.

## Convergence state

**diagnostic-complete** (primary NO-GO on fidelity; mechanism map
delivered). The food-economy axis is not converged. The production
rebound (#570) is reclassified: the original's perverse dose-response
does not reproduce with a faithful replay; the structural finding is
that autonomous production (share_surplus) has no pantry governor.
Named next: govern the surplus-share or scale preservation — not
another draw lever.


