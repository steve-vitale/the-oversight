# sim-bankpath-b — the DESIGNED bank-expansion path (loop B, 2026-10-15, food-economy axis)

**Verdict: KILLED AT PILOT — no-contact kill.** The layer was built, proof-verified
(ALL GREEN), and then deleted per kill protocol: the exercise gate cannot pass —
deep_reserves has no live offer path on the courtship road. The 32-run pilot was
not spent; the probe + structural bound decide the gate outright. Instruments
(probe, proof test) and this evidence are retained.

## Pre-registration (BINDING, docs/MEASUREMENT.md §§9–12, 14)

Written from the arm brief BEFORE any sims; judged exactly as written.

- **Lever**: the #314 bank-cap bind. kcalCap() (src/js/food.js:2076) = 2400 ×
  metabolicMult × bankMult() sits at ~2400 (a day) while an active courtship day
  burns ~4900 (sim-sleepin-b: meal-served-still-starved channel 353→512 — full
  bowls starve because the cap sits below the burn). Worse, fullLine() is also
  2400 × metabolicMult, so maxBank() = 0 without a bank multiplier: the scholar
  cannot carry any surplus above the fed line; every overfull meal is clamped.
- **Designed path**: "skillsets can expand the bank massively" — ability
  deep_reserves (Deep Reserves, food.bank_mult ×5, unlock system_offer, lane
  magic, src/data/abilities.json:853) and synergy war_chest (×1.5, requires
  deep_reserves + blood_magic, src/data/synergies.json:1360). The courtship
  scholar never earns it: the base competent policy auto-takes ch[0] of every
  System choice sheet (scripts/policies/competent.js).
- **Mechanism**: policy layer scripts/policies/bankpath.js (BANKPATH=1, default
  OFF — DELETED per kill protocol): wrap Game.chooseAbility for the parent's
  daily/upkeep; prefer deep_reserves whenever it appears in a pending sheet.
  Chained, never clobbered (sim-findings #119). Zero src/js changes.
- **EXERCISE GATE** (binding): deep_reserves acquired on ≥4/16 armed runs, else
  KILL the arm no-contact.
- **PRIMARY**: scholar hunger-days armed ≤ 0.6× control (pooled, identical seeds).
- **GUARDRAILS**: starvation deaths armed ≤ control+2; national armed ≥
  control−2/16; no new death mode; median survival REPORT-ONLY.
- **GO** → land the layer. **MISS** → delete the layer per kill protocol,
  commit evidence + instruments as KILLED AT PILOT.
- **Horizon**: 180d death-aware (+10d tail max). **Seeds**:
  111/222/333/444/555/666/777/888 × {leadcourt,belongseek} × {control,armed} =
  32 runs, OWN control in the SAME sweep (never an inherited baseline),
  FEASTSCALE_R13=1 both sides.
- **Det-gate**: proof test RED→GREEN before sweep spend; SMOKE=1
  instrument-honesty gate.

## Canon

docs/CANON.md and docs/PRESERVATION.md read. **No food-distribution canon doc
exists** — stated here per the canon rule; mechanics read from src/js as-is,
cited. deep_reserves is lane 'magic' (a System gift), never a human skill —
the human-skills-vs-alien-abilities boundary (Steve 2026-10-11) is respected:
the layer only reorders which System gift the scholar accepts. No canon
invented.

## The layer (built, proven, then deleted)

scripts/policies/bankpath.js wrapped the feastscale courtship policies
(belongfeast/leadfeast) with a chooseAbility interceptor: any pending sheet
containing deep_reserves is taken as deep_reserves instead of ch[0], through
the real verb — no forced grant, no fabricated sheet. Distinct-sheet dedupe,
per-src counting, full-slot honesty (the preference fires, the engine's
replaceId rule still refuses — counted, never bypassed).

**Proof scripts/test-bankpath-20261015.js — ALL GREEN** (8 fixtures, live
RED→GREEN, 4/4 det-gate):
- A1–A3: gate off → wrapPolicy(base) === base; named exports are the feastscale
  policies; gate on → wrapped ids, base untouched.
- A4: sheet with deep_reserves → deep_reserves taken (redirect=1, acquired=1).
- A5: sheet without → ch[0], silent counters. A6: no sheet → passthrough.
- A7: full slots + level-up sheet → preference fired, engine refused (null),
  nothing acquired — honest. A8: retried sheet counted once.
- B1 RED (live engine): the BASE takes ch[0] (iron_stomach) of a crafted
  [iron_stomach, deep_reserves, cold_blooded] sheet — deep_reserves passed over.
- B2 GREEN (live engine): the layer acquires deep_reserves; kcalCap 2400 →
  12000 (bank_mult ×5), maxBank 0 → 9600. The bind is addressable *if* the
  offer fires.
- B3: no-deep sheet behaves exactly like base.
- PART C det-gate (30d × 2 seeds × 2 policies, base vs wrapped gate-on):
  byte-identical trajectories with the interceptor hot (3–4 sheets/run),
  zero redirects.
- **SMOKE=1 ALL GREEN**: policy drives (25 daily calls), interceptor hot on
  real sheets, counters consistent, forced deep_reserves sheet acquired
  end-to-end with kcalCap 2400→12000.

Two test bugs fixed during proving (both in the test, not the layer), one real
layer fix: the engine's chooseAbility returns null even on a successful grant,
so acquisition is read from the held abilities (ground truth), not the return
value.

## FIRST instrument: the exercise-feasibility probe

Per the brief, before any sweep spend: does the offer ever fire on the
courtship road? scripts/probe-bankpath-20261015.js (read-only instrument —
chooseAbility/say observers, zero game-code changes), FEASTSCALE_R13=1,
policies {leadfeast, belongfeast} (the courtship substrate), seeds {111,222},
180d death-aware, per-seed JSONs under evidence/2026-10-15/perseed-bankpath/.

| run | scholar-days | craft track | abilities held | distinct sheets | deep_reserves sheets |
|---|---|---|---|---|---|
| leadcourt s111 | 152 | 0L / 13xp | green_whisper | 9 | 0 |
| leadcourt s222 | 105 | 0L / 6xp | green_whisper, rage, green_thumb | 5 | 0 |
| belongseek s111 | 135 | 0L / 12xp | iron_stomach, night_eyes, lucky_rock | 11 | 0 |
| belongseek s222 | 131 | 0L / 12xp | the_touch, echo_location | 8 | 0 |

33 distinct sheets observed across 4 full-lifetime runs. **deep_reserves
appears in 0.** The craft track — the only track whose kit contains
deep_reserves (src/data/tracks.json, index 11/20) — never levels: 6–13 XP
against the L1 threshold of 18. The scholar levels social/field/strange/combat
tracks instead.

Sheet sources observed (src tags): `arrival` (day-7 first sheet),
`level_up:social`, `level_up:field`, `level_up:strange`, `level_up:combat`,
and untagged (contest prizes via _cxPrizeAbilityOffer, safety-net rewards via
safetynets.js, the fusion_reactor single offer) — every one of which
structurally excludes body_horror tier (see below).

## Structural analysis: every offer path enumerated

All writers of `state.scholar.abilityChoices` (grep, 2026-10-15):

| path | code | can carry deep_reserves? |
|---|---|---|
| arrival sheet | game.js:21759 firstAbilityChoices | NO — utility tier only (+wacky/underpowered wild slot); deep_reserves is body_horror |
| poison aid | game.js:22028 poisonAidChoices | NO — purify + 2 random utility/wacky |
| contest prize | contests.js:4967 _cxPrizeAbilityOffer | NO — dark tiers (vile, body_horror) explicitly excluded |
| safety-net reward | safetynets.js:498 | NO — fixed pools (scrounger/tracker/swimmer, triage/field_medicine, green_thumb/translator/night_eyes) |
| fusion reactor | game.js:22461 | NO — single id |
| Static pact | game.js:22352 (not a sheet — direct grant) | NO — overpowered tier only |
| track level-ups | tracks.js:405 pumpLevelUps → kitSheet | **YES — craft kit only** (index 11/20) |

The craft route needs the scholar to hold ≥6 of the craft kit's first 11
entries before deep_reserves enters the kitSheet window (window = first 6
unheld, weighted to earlier). Craft XP comes from cooking (n=1, perDay 1),
crafting (n=1, perDay 2), hunger_trial (n=3) — thresholds [18,48,96,192,384].
Measured pace on the courtship road: ~0.05–0.09 XP/day (6–13 XP per lifetime).
The scholar doesn't cook — the village's duty cook does (division of knowledge;
canon: specialists transform ingredients). Craft L1 (18 XP) is unreachable in
a lifetime, let alone the ~6 level-ups the window needs. The shapeOffers
class-path guarantee can pull beyond-window entries only for the recognised
class's path/payoff — deep_reserves is a Furnace *enabler*, not a payoff
(payoff is feast_engine), and no courtship scholar recognises Furnace without
the enablers first.

**Conclusion: deep_reserves is structurally unreachable on the courtship road
in-sim.** The layer's interceptor can never fire — not a tuning problem, a
missing route.

## Verdict

**EXERCISE GATE: 0/4 probe runs show deep_reserves in any sheet; structural
bound says 0/16. KILLED AT PILOT, no-contact.** The layer
(scripts/policies/bankpath.js) is DELETED per kill protocol — it was never
committed. The 32-run pilot was deliberately not spent: the probe plus the
structural bound decide the gate outright, and spending 32 runs to re-measure
a structural zero would be exactly the waste the pilot gate exists to prevent.

Note on gate scope: the gate counts *armed* runs, the probe ran the control
substrate — but the layer cannot conjure sheets, only reorder within them, so
the control-side zero transfers. The det-gate (Part C) independently confirms:
armed-but-silent trajectories are byte-identical to base.

## The blank documented (the real finding)

The DESIGNED bank-expansion path has no live route in-sim. deep_reserves is a
Furnace-subclass enabler (godpaths.json: survivalist → furnace, enablers
[deep_reserves, extra_stomach, stoke], payoff feast_engine) — the whole
survivalist/furnace bank fantasy, including the war_chest synergy, is gated
behind a track the courtship scholar never levels. #314's named design-side
next ("bank-cap-vs-need", per sim-sleepin-b) cannot be answered by preferring
an offer that never comes. Filed as a sim-findings open item (steve-call):
does the courtship scholar need ANY route to deep_reserves — via scholar
cooking (teach the bearer?), a non-craft offer path, or is the Furnace build
meant for other roads only?

## Metric review (§14)

- The pre-registered PRIMARY (scholar hunger-days ≤0.6×) was never measured —
  the exercise gate killed the arm before the pilot. Per §14 this is reported
  as a kill, not re-scored against a friendlier metric.
- The exercise gate did its job: it caught a structurally-unreachable lever
  before sweep spend. Lesson for the next #314 arm: establish a live offer
  path FIRST (instrument the sheet census), then build the preference.
- The det-gate + SMOKE discipline held: the layer was proven trajectory-neutral
  and mechanism-sound before the kill, so the kill is on *reachability*, not
  on a broken mechanism. A future arm with a live route can reuse this layer's
  tested interceptor verbatim.
- No guardrail was evaluated (no armed runs). Median survival: report-only by
  design; nothing to report.

## Sense-testing

Read the probe's offer beats (the System's sheets are this arm's sense
surface). The sheets read as a person being offered alien gifts, not a
vending machine: arrival sheets land day 8 with the System's watching-you
voice; track level-ups arrive per-track ("Earned, not given"); contest prizes
come with the show's flourish. No robotic repetition in the offer flow itself.
The deeper sense finding is the absence: across 4 lifetimes the System never
once offers the scholar a way to expand the bank it keeps clamping — the
fiction (a System that forgot food, genuinely trying) would notice the
starving bearer before the sims do. That absence is the design question filed
above, not a bug.

## Village assessment (plain words)

Four courtship villages lived 105–152 days on the feastscale substrate. The
scholars leveled as generalists — social, field, strange, combat tracks —
picking up green_whisper, rage, iron_stomach, night_eyes, the_touch,
echo_location: the competent generalist build, never a specialist. Nobody
touched the craft track; the village cooks while the scholar ranges, and the
division of knowledge holds all run long. The villages look like what they
are: courtship-phase settlements where the bearer is a forager-fighter, not a
cook — which is exactly why the Furnace fantasy can't start here. One
notable event: leadcourt s111's scholar acquired the Fusion Reactor on day 23
via the pellet-reactive path (maybeOfferFusionReactor — the System noticed the
pellet in the pack, offered the surgery, the base policy took it; one
reactor/world per the landed singularity). "You never need to eat again" —
working as designed, and food-economy relevant on that seed, but orthogonal
to this arm. Who thrived: generalist scholars with 2–3 abilities by day 100. Who died: the run ends are
ordinary courtship mortality (the probe didn't instrument death causes —
documented gap, not chased; the kill needed no mortality data). The blank I
documented instead of filled: the bank-expansion route doesn't exist on this
road, for anyone.

## Wall numbers

No sweep was run (no-contact kill), so there are no arm wall numbers. Probe
substrate observations (FEASTSCALE_R13=1 courtship, 4 runs): scholar survival
105–152d; track level-ups seen on social/field/strange/combat; 0 national /
table / wins recorded by the probe instrument (not instrumented — the probe
measured the offer census only). The coordinator's sibling arms carry this
run's wall numbers.

## Instruments retained

- scripts/probe-bankpath-20261015.js — the exercise-feasibility probe
  (offer census + craft-track sampling + offer-beat transcripts), with
  per-seed JSONs under evidence/2026-10-15/perseed-bankpath/.
- scripts/test-bankpath-20261015.js — proof test, ALL GREEN pre-kill
  (8 fixtures, live RED→GREEN, 4/4 det-gate, SMOKE green); post-kill it
  INFO-SKIPs via skipIfLayerGone (layer absent).
- scripts/policies/bankpath.js — DELETED per kill protocol (was never
  committed). The tested interceptor design is documented above for reuse.

## Convergence

`killed-at-pilot` (exercise gate, no-contact). Axis food-economy stays
converging — the #314 bank-cap bind is still open; its remaining face is now
the design-side offer-route question filed in sim-findings.
