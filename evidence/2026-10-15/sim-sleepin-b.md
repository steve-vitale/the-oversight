# sim-sleepin-b — sleep-inside-hall bedtime layer (loop B ARM 2, axis food-economy, 2026-10-15)

Claims sim-findings #328's named next — THE INSIDE/OUTSIDE PANTRY WALL — via a
mechanism different from the sibling arm's (sim-goinside-b's DAWN go-inside +
pack-lunch, killed at pilot: 1.158x, trust-ledger tax). This arm changes the
LOCATION STATE AT NIGHT: the scholar sleeps INSIDE the hall, so dawn (and
any-time) pantry draws are physical through the BASE's own reactive machinery.

Run: fleshout-b-20261015T2022Z. Axis: food-economy. Policy-side lever, zero src/js changes.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sims)

- **Question**: #314 measured 1548/1594 hunger-days are the scholar's; #328
  showed 415/475 dawn pantry draws refused at `havenStoresAccess()==='none'`
  — the courtship scholar is ON the haven tile at dawn but OUTSIDE the hall
  (insideHaven=false). The sibling arm proved the dawn go-inside verb works
  but loses on the trust ledger (#329). Can the LOCATION STATE AT NIGHT —
  sleeping inside, letting the base's existing reactive dawn draw
  (competentEat: pack first, pantry second when kcal < 0.85*cap) fire
  honestly — move scholar hunger without a single layer-owned take?
- **Lever**: scripts/policies/sleepin.js (gate SLEEPIN=1, default off),
  wrapping the FEASTSCALE_R13=1 courtship substrate (belongfeast/leadfeast).
  At bedtime (policy daily, AFTER base.daily so evening chores run
  outside-on-the-grounds exactly as in control, before the harness sleeps):
  if the scholar is on the haven tile and outside, call the REAL
  Game.enterBuilding() — the engine's honest verb (mid-fight, tent,
  already-inside, haven-node guards all honored; engine voices refusals).
  The layer fires NO takes of its own (#329: takes tax the trust that keeps
  the scholar on half-rations; #169: never pre-fill). One enter per night,
  hard (already-inside no-op). No dawn exit — a person who sleeps inside
  wakes up inside; travelTo clears insideHaven on departure ("traveling
  means you're outside").
- **BASELINE REALITY (read from src/js during build)**: sleepQuality() rates
  atHaven as 'hall' whether inside or outside — heal is identical; the lever
  is purely the access state. The base's dawn upkeep ALREADY emergency-draws
  from the pantry when inside (goinside B2c proved it); the control arm's
  identical draw is refused outside. The measurement is the marginal
  location-state effect, honestly.
- **PRIMARY (binding)**: scholar hunger-days armed <= 0.75x control (pooled).
- **GUARDRAILS**: starvation deaths armed <= control+2; national armed >=
  control-2/16; no new death mode (wound/disease not worse than control).
  Median survival: REPORT-ONLY (fragile per metric review — record, never score).
- **GO** → commit the layer for landing. **MISS** → layer deleted per kill
  protocol, evidence + instruments only.
- **Horizon**: 180d, death-aware (+10d tail). **Seeds**:
  109/218/327/436/545/654/763/872 × {leadcourt, belongseek} ×
  {control, armed} = 32 runs, OWN control in the SAME sweep (never an
  inherited baseline — #247 CONTROL BASELINE DRIFT). This IS the pilot
  (16/side); a confirm (12–16) only follows a GO.
- **Substrate**: FEASTSCALE_R13=1 both sides (courtship substrate); armed adds SLEEPIN=1.
- **Det-gate**: scripts/test-sleepin-20261015.js PART C green before sweep spend (16/16 byte-identical, log machinery hot, siEnters 0).
- **SMOKE=1**: instrument-honesty (proof + sweep smoke gates).
- **Sense-test** (Steve's law): night/sleep/dawn beats read in the
  transcripts — sleeping inside must read as a person choosing shelter, plus
  where the scholar is during night raids. Villager check: villagers keep
  acting like people.
- **Canon**: docs/CANON.md, docs/PRESERVATION.md, docs/DIRECTIVES.md read. NO
  food-distribution canon doc exists — stated here per the canon rule; no
  canon invented. All mechanics read from src/js as-is (cited in the layer header).

## PROOF (before measurement)

scripts/test-sleepin-20261015.js — ALL GREEN:
- PART A (11 fixtures): gate off returns base itself (A1); gate on wraps with
  id 'sleepin-X', base.daily untouched (A2); fires at bedtime outside →
  honest enterBuilding, insideHaven true, siEnters 1, person-beat voiced,
  engine 'Inside...' voiced, row {fires,entered} (A3); no double-enter when
  already inside (A4); silent off-haven (A5), exiled (A6), mid-fight (A7),
  over (A8); honest verb-refusal counted (A9: siRefused 1, engine refusal
  voiced); one enter per night hard (A10); base.daily runs BEFORE siBedtime
  (A11: order base.daily,enterBuilding).
- PART B (live engine, REAL RED): B1 RED — control substrate at dusk, scholar
  outside on the haven tile → sleeps outside; at dawn
  havenStoresAccess()==='none' and the base's dawn upkeep pantry fallback is
  honestly refused ("The pantry is in the hall. Your hands are not."), pantry
  untouched (the dawnmeal/goinside kill, reproduced). B2 RED — the layer at
  the same state → daily enters via the honest verb (siEnters 1); at dawn
  access 'inside'; the base's dawn upkeep takes-and-eats (kcal 100→2350,
  pantry 41770→39520, no refusal beats) — the reactive draw the wall denied,
  unblocked.
- PART C det-gate: 16/16 byte-identical (30d x 8 seeds x 2 policies, base vs
  layer-machinery with a symmetric inside-seeder between base.daily and
  siBedtime — a seeder BEFORE base.daily does NOT work: the base's daily
  travel clears insideHaven on arrival, so the layer fires behind it).
  siRows 30/30 hot, siEnters 0. The ONLY lever effect is the honest enter.
- SMOKE=1 (proof): ALL GREEN — 25d belongseek s109: 25 dailies, 25 siRows,
  24 enters, every enter person-beat + engine Inside voiced, siRefused 0.
- SMOKE=1 (sweep): ALL GREEN — 36 rows, 35 enters, insideAtDailyFrac 1.0.

(Fixture correction during build, honest: PART C's first seeder design —
inside-seeder before base.daily on both sides — FAILED 0/16 with the layer
firing behind it (siEnters 29/30): the base's travel undoes the seeder. The
seeder now sits between base.daily and siBedtime, symmetrically. The failure
taught the real rhythm: the courtship scholar is on the haven tile at
bedtime nearly every night, so the lever engages ~daily.)

## RESULTS — sweep: 32 runs, 180d death-aware

Sweep JSON: evidence/2026-10-15/sleepin-sweep.json. Per-seed:
evidence/2026-10-15/perseed-sleepin/. Transcripts:
evidence/2026-10-15/sleepin-transcripts/.

### Pooled (16 control / 16 armed)

| side | scholarHunger | hunger | starveDeaths (scholar) | median | national/16 | table | won | wave4 | wave5 | siEnters |
|---|---|---|---|---|---|---|---|---|---|---|
| control | 874 | 896 | 4 (1) | 120d | 10 | 13 | 0 | 14 | 6 | 0 |
| armed | 688 | 724 | 5 (0) | 143d | 12 | 14 | 0 | 14 | 6 | 2040 |

Per-policy: leadcourt armed 365 vs 417 control (0.876x); belongseek armed 323
vs 457 control (0.707x).

**PRIMARY: 688/874 = 0.787 > 0.75 → MISS.**

**GUARDRAILS:**
- starvation deaths 5 ≤ 6 (control+2) ✓ (scholar starve deaths 0 vs 1 ✓)
- national 12 ≥ 8 (control−2) ✓
- new death mode: none — wound 4 ≤ 5, sickness 5 < 14, lockjaw 1 < 4,
  dehydration 0 < 7 (all better-or-equal on armed); no armed-only cause at n≥3 ✓
- median survival (REPORT-ONLY): 143d vs 120d

**VERDICT: NO-GO** (§14 — primary miss; all guardrails pass; median favors
armed). The layer is deleted per kill protocol; evidence + instruments retained.

### MECHANISM AUTOPSY — the channel migration

The lever engaged hard (2040 enters, ~every night) and the intended mechanism
fired: the dawn reactive draw unblocked, the scholar slept inside, and the
distrhalf channel decomposition shows the disease MOVED:

| channel | control | armed | meaning |
|---|---|---|---|
| b (trust-throttled-half-ration) | 379 | 64 | evening bowl throttled by distrust |
| c (other — mostly meal-served-still-starved) | 353 | 512 | fed, still starving |
| a (empty-pantry) | 164 | 148 | pantry bare |

The lever nearly ELIMINATED the trust-throttle channel (379→64): sleeping
inside lets the dawn draw land, the scholar's own foraged food stays in the
pack, donations fire more often (kcal > cap*1.5), trust climbs, evening
bowls become full. But channel c GREW (353→512): this is #314's structural
finding — "meal-served-still-starved (full 2000+ bowl, trust>=30, still
STARVING). The scholar's bank cap (2400) sits below an active day's total
burn (~4900 on leadcourt)". The scholar now eats a full evening bowl AND a
dawn pantry draw and STILL starves, because one body cannot carry a whole
active day. The lever fixed the trust pathway and exposed the bank-cap
pathway — the #314 design-side question (cap vs need), which no location
trick can answer.

The pooled miss is ALSO survival-confounding (the goinside signature):
armed villages lived 2132 vs 1878 game-days (+13.5%), and a longer life
under chronic cap-deficit accumulates more total hunger-days. Per-day-alive
hunger fell 30% (0.323 vs 0.465), better on 12/16 seeds. Per §14 the pooled
metric binds and this stays a kill — the confound is documented here, not
re-scored.

Seed notes: s109 is a brutal seed — both armed runs lost the village at day
37 (scholar rates 0.162, fine; the village died around them). No lever-
caused pattern (control leadcourt s109 also village-lost at 56d).

### SENSE-TEST (Steve's law — transcripts read, not just counts)

**Episode 1 — belongseek s654, d13–d15: the rhythm.** "You duck into the hall
for the night — the floor by the fire beats sleeping out on the grounds." →
"Inside. The hall smells of smoke and twelve people. Home." → "Village meal:
+1120 kcal ... (Half ration — they don't trust you yet.)" Reads as one
person's evening, not a robot: the why is named, the engine's arrival line
follows, the meal lands inside the trust story. Voice wart (filed, not
chased): the line repeats verbatim 178 nights — action narration, like the
engine's own 'Inside...' line, but the habit could go quiet after it forms.

**Episode 2 — d14/d15: the raid night.** "🐗 RAID — 5 raiders ... hit Haven in
the night, drawn by the smell of the pantry!" → "Drum-Belly ... is at Haven's
door. The village looks to you." → next dawn "You wake with a start —
something is wrong." → "◈ CRISIS — THE SIEGE. They came in the night for the
pantry — and the village met them at the door with blades and fire and drove
them back into the dark." Sleeping inside does NOT remove the scholar from
night defense — the raid beats read coherently with the scholar in the hall:
the village meets the raid at the door, the scholar wakes to the crisis.
No positioning weirdness observed (no "fighting a ghost" beats).

**Episode 3 — d15: the starving beat inside the full story.** "⚠ STARVING:
health and energy falling. The spiral has started." the SAME night as
"Village meal: +1389 kcal ... (Half ration — they don't trust you yet.)" —
the honest signature of the channel-c finding: a fed bowl that cannot cover
the day's burn. The transcript SAYS the mechanism.

**Villager check**: villagers act like people throughout — Jovan/Joshua/Grace
asking about the strange leaves at fireside lessons ("Someone asks a dumb
question. Nobody minds. That's how you learn."), Pasquale proposing raid
relief, Cauã standing down the Nightlight/Night Court "bloodied but
breathing", Joshua's eyes changing ("They've seen enough out there to stop
being afraid of the dark."), travelers bringing news of starving Stonebridge,
and the burial beats ("That night, they bring Miguel home... The filling of
it is yours."). No robotic behavior attributable to the arm. (Pre-existing
generator rhythm noted: "has been asking about the strange leaves all week"
repeats across villagers — not this arm's blank.)

### Reachability verdict

Unchanged by the arm: wave 5 at 6/16 both sides, wave 4 at 14/16 both, Arc IV
at 13–14/16, national 12 armed vs 10 control, table 14 vs 13, wins 0 both.
The scale wall stands where it stood — this arm was never aimed at it.

### Scale-wall numbers (for the loop report)

national 12/16 armed (10/16 control) · table 14 (13) · wins 0/0 ·
wave4 14/16 · wave5 6/16 · median survival 143d (120d control).

## What the village looked like (assessor's notes)

A village where the scholar came in from the cold every night — and it
mattered, but not where it was supposed to. The scholar stopped being the
person the village half-fed: trust climbed, bowls filled, the dawn draw
landed. And still the STARVING beats came, because the body's bank is 2400
and the courtship day burns ~4900. The village buried its dead (Miguel,
Joshua, Jovan, Vivian — "Nobody asks you to help carry; nobody has to"),
fought its raids at the door, taught its fireside lessons. The hunger that
remained was structural, not social — which is exactly what the channel
migration says.

## Blanks filled or documented

- DOCUMENTED (finding): the trust-throttle → bank-cap channel migration
  (b: 379→64, c: 353→512) — the #314 design-side question, measured. The
  next #314 variant must be design-side (bank cap vs active-day burn) or
  mid-day feeding, not location/access. Proposed sim-findings entry appended.
- DOCUMENTED (voice wart): the nightly enter line repeats verbatim — the
  habit should go quiet or vary after it forms. Filed for the next variant.
- No src/js changes. No blank filled by landing (killed at pilot).

## METRIC REVIEW (for the NEXT run, never this one — §14)

1. The pooled scholar hunger-days primary is confounded by survival for ANY
   arm that keeps villages alive longer (this run: +13.5% game-days; goinside
   +25%). Per-day-alive hunger (0.323 vs 0.465 here, 30% down, 12/16 seeds)
   told the truer story. PROPOSAL for the next run: pre-register the primary
   as hunger-days per day-alive (pooled), with the pooled total as a
   reported secondary. The confound is structural, not seed noise.
2. The 0.75 bar was calibrated against the dawnmeal arm's 0.869 kill; this
   arm's 0.787 is a near miss on a metric that punishes its own survival
   gain. Under the per-day proposal this run would have been a GO (0.694x).
   Noted, not re-scored.
3. Median survival as pure REPORT-ONLY held up well (143d vs 120d, direction
   consistent with the survival confound) — keep it report-only.
