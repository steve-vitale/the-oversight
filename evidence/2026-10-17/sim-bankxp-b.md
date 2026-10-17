# sim-bankxp-b — policy-side craft-XP drive: is the craft track (and the designed deep_reserves bank-expansion path) reachable on the courtship road? (loop B, 2026-10-17, food-economy axis)

**Verdict: NO-GO — KILLED AT PILOT. Layer deleted zero-trace; evidence + instruments retained.**

Reachability arm on finding #364. sim-craftxp-b (evidence/2026-10-16/sim-craftxp-b.md)
measured the gap: 0 craft threshold crossings in any bearer tenure across 16x180d
runs; scholar-side XP sources are hunger_trial (16/16) + thin crafting; cooking
(the track's signature verb) fired 0 times — it is the duty cook's verb, not the
scholar's; deep_reserves needs >=6-of-first-11 craft-kit holds + a craft sheet
(observed max 2 holds), and the 5 lifetime sheets cap at 5 holds — unreachable
via craft XP alone. This arm played the named-next lever: a policy-side
craft-XP drive — the competent policy deliberately exercising the scholar's
crafting verb in honest idle windows (real engine verbs, not a fixture).
The drive never engaged. The kill is for the right reason, and the reason is
the finding.

## Pre-registration (BINDING, docs/MEASUREMENT.md §§9–12, 14)

Written from the arm brief BEFORE any sims; judged exactly as written.

- **Lever**: BANKXP_B=1 (default OFF). scripts/policies/bankxp.js — `drive(Game, ctx)`,
  called once/day from competent.daily() after cleanCatch, before donateHaul
  (pack still holds the day's haul, scholar home, fire near). Gates: at haven,
  near fire, no fight, scholar kcal >= 60% cap, hp >= 50% max, and the policy's
  own needTrip() is false (no food run needed — the honest "idle/secure day").
  Then: (1) cook — Game.cookAll() one fire session if the pack holds anything
  cookable (deed cap 1/day); (2) craft — one practice craft from materials on
  hand (stone_knife if knifeless; else snare under the same 2-held cap as
  workTrapline; deed cap 2/day). Every gate and every deed is the engine's
  own (knowledge/material gates, per-day deed books, fuel, ticks).
- **PRIMARY GO**: >=6/16 pilot runs with >=1 craft-track threshold crossing
  during a bearer tenure (tele('track_level', {who:'player', track:'craft'})).
  Baseline 0/16 on the craftxp-b census substrate. (Brief says >=3/8; pilot is
  16 runs = 8 seeds x 2 policies, threshold scaled to the same rate.)
- **SECONDARY GO**: deep_reserves offered >=2/16 runs (brief says >=1/8;
  same rate scaling). Offer = 'deep_reserves' appears in a craft level-up
  sheet's offer list (captured at chooseAbility).
- **GO** -> land the layer (default OFF, scripts + evidence). **MISS** ->
  evidence + instruments only, layer DELETED zero-trace per kill protocol.
- **Horizon**: 180d death-aware (+10d tail max, harness built-in). **Seeds**:
  1701-1708 (fresh) x {leadfeast, belongfeast} = 16 runs/side, control
  (BANKXP_B unset) vs armed (BANKXP_B=1) on identical seeds. **Policies**:
  leadfeast / belongfeast (feastscale-wrapped courtship policies).
  **Substrate**: FEASTSCALE_R13=1, SEATDRIVE=0 explicit.
- **Guardrails**: wall metrics (national/table/wins/wave-4/5) + starvation —
  crafting/cooking time has an opportunity cost; armed must not starve more
  than control (death-cause share comparison).
- **Proof**: scripts/test-bankxp-20261017.js RED->GREEN on the real engine
  before pilot spend. Det: layer is policy-side; BANKXP_B unset = byte-identical
  trajectories (the drive returns before any state touch — T1 proves it).

## Canon

docs/CANON.md, docs/PRESERVATION.md read. Human-skills-vs-alien-abilities
boundary respected: deep_reserves is a System ability (magic lane); the drive
grants nothing, it only exercises the track's SKILLS-lane practice verbs
(cooking, crafting). **No canon doc covers the bank-expansion path**:
deep_reserves appears in no docs/*.md — the Furnace build
(deep_reserves -> feast_engine, war_chest) exists in tracks.json/godpaths.json
only. Stated per the canon rule; nothing invented.

## The instrument

scripts/bankxp-pilot-20261017.js: 16 runs/side, per-seed JSONs under
evidence/2026-10-17/perseed-bankxp/ with the full wall-metric key set plus
crossed / craftCrossings / craftSheets / deepReservesOffered / craftOffers /
craftLevel / craftXP / first11Held. Offer capture wraps chooseAbility (pure
observer); crossing capture wraps tele (pure observer).

Proof scripts/test-bankxp-20261017.js — ALL GREEN (T1–T5):
- T1 (disarmed no-op): BANKXP_B unset on a primed Game -> no deeds, no XP,
  inventory untouched. Also the RED gate: armed assertions fail disarmed.
- T2 (armed): cookAll + craft('stone_knife') through REAL verbs -> exactly
  1 cooking deed + >=1 crafting deed, craft XP rises by exactly the deeds,
  hasCuttingTool() true (the knife is real gear).
- T3/T4/T5 (gates): starving / thin-pantry (needTrip) / empty-pack -> zero
  deeds, zero XP.

## Results

### PRIMARY GO (>=6/16 crossings): MISS — 2/16 armed vs 2/16 control. NO-GO.

| side | crossed | craftSheets | deepReservesOffered | national | table | entered | won | wave45 | maxWave | medianDays | starvDeaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control (16) | 2 | 2 | 0 | 13 | 14 | 0 | 0 | 0 | 3 | 155 | 4 |
| armed (16) | 2 | 2 | 0 | 13 | 14 | 0 | 0 | 0 | 3 | 155 | 4 |

Per-policy: leadfeast 1/8 crossed both sides (seed 1707); belongfeast 1/8
crossed both sides (seed 1707). The armed crossings are on the EXACT same
seeds as control — the drive contributed zero marginal crossings.

Stronger: final-scholar craftXP per run is IDENTICAL across all 16 seeds
([56,1,0,5,13,0,2,0,0,0,12,0,13,0,50,1] both sides, mean 9.6). Deterministic
sims + identical trajectories = the drive never changed a single trajectory.

### SECONDARY GO (deep_reserves offered >=2/16): MISS — 0/16 both sides. NO-GO.

Max first-11-held across all 32 runs: 1 (a single off-road grant). The
structural bar (>=6 of the first 11 held) was never approached.

### Why the drive never engaged (the finding)

Focused diagnostics (60d, BANKXP_B=1, BANKXP_DEBUG=1, seeds 1702/1707):
- **cookableDays = 0/60** — the scholar's pack NEVER held cookable food at
  the evening window. The division of labor routes everything cookable to
  the pantry/duty cook immediately: the haul is unknowns (not cookable until
  sorted), sorted food is eaten or donated the same day, meat goes through
  cleanCatch and is donated. The scholar's own fire has nothing to cook.
- **secureday = 1/60** — "honest idle days" (fed + sound + !needTrip) occur
  ~once in 60 days. The scholars are perpetually marginal: needTrip is true
  via the no-give-in-3-days clause (they don't haul), kcal < 50%, or thin
  pantry. The drive's craft step (optional work) correctly refused every day.
- The two observed crossings (1707, both policies, both sides) are
  base-policy deeds (hunger_trial + workTrapline crafts), not the drive.

**The kill is for the right reason:** the craft track's scholar-side practice
surface does not exist on the courtship road — not for lack of policy
trying, but because (1) cookable food never sits in the scholar's hands
(the division of labor gives it to the duty cook), and (2) secure idle days
are ~1/60 (the scholar is perpetually marginal). A policy-side drive cannot
fix this; it needs a game-side design answer — the same open design question
as #364 (does the courtship scholar need ANY route to deep_reserves?).

### Wall numbers + guardrails

- national 13/16 | table 14/16 (invited) | entered 0/16 | wins 0/16 —
  identical both sides.
- wave45: 0/16 both sides; maxWave 3 both sides.
- median survival 155d both sides.
- starvation deaths: 4 both sides — the drive changed nothing (it never fired).
- Telemetry deviation check vs scale-wall baseline (national 12, table 16,
  wins 16, exiled 0): wins 16->0 LOUD — same substrate difference as the
  craftxp-b census (courtship policies with SEATDRIVE=0 don't drive the win;
  the baseline's 16 wins come from a win-pursuit policy stack). Not a
  regression; the armed side is identical to control. No action.

### Death causes (32 runs)

Monster combat dominates, as in the census substrate. (Per-seed death maps
in evidence/2026-10-17/perseed-bankxp/.)

## Sense-testing (SENSE-TESTING LAW)

The drive never fired in 16 armed runs (0 deeds; identical trajectories), so
there is no drive-craft day to sense-read — and inventing one would be the
opposite of the law. What the proof test verified instead (T2, on the real
engine): the drive's verbs speak honestly when they fire — Game.cookAll()
narrates the batch ("Cooked N items..."), Game.craft() narrates the attempt
including blind-copy honesty ("You've only SEEN a snare..."). No new voice
was added by the layer; the engine's own lines carry it. The base policy's
craft verbs were sense-read in sim-craftxp-b ("The scholar's craft verbs read
honest when they fire") — unchanged here.

## Village assessment (plain words)

Sixteen courtship villages on the feastscale substrate, 39–180 days (median
155). The picture is the census's, sharpened: the bearer is a marginal
forager-fighter who rarely hauls (the no-give clause fires needTrip most
days), eats from the pantry, and dies of monster combat around wave 3 while
the village follows. Nobody in these villages is idle and secure — the
"honest idle window" the drive was designed for occurs about once in 60 days.
The duty cook still does all the cooking; the scholar's pack at day-end holds
unknowns, seed packets, and a few materials — never anything cookable. Two
bearers (both on seed 1707, one per policy) crossed Craft 1 on base-policy
deeds alone and were offered 2 sheets (leadfeast) / 0 sheets (belongfeast —
the crossing fired but pumpLevelUps found no sheet, systemArrived timing);
deep_reserves was never in any offer list on any run. The village looks like
a settlement where the makers make and the bearer fights — and the System's
bank-expansion path has no door on this road, for anyone, by design or by
neglect. That is the blank, documented.

## Metric review (§14)

- PRIMARY GO (>=6/16 crossings): **MISS** — 2/16 armed, 2/16 control, same
  seeds. The metric was honest and the lever failed it. No re-scoring: the
  16-run pilot stands as designed (8 seeds x 2 policies; threshold scaled
  from the brief's >=3/8 at the same rate).
- SECONDARY GO (deep_reserves >=2/16): **MISS** — 0/16 both sides.
- The pre-registered "baseline 0/16" from the census was slightly stale:
  this seed set shows 2/16 control crossings (base-policy deeds on 1707).
  The lever is judged against its own control, not the stale baseline —
  recorded here, not re-scored.
- Telemetry LOUD (wins 16->0): substrate difference, same as the census;
  armed identical to control. No action.
- The drive's gate design was revised mid-run (strict gates -> split
  cook/craft gates) BEFORE the final pilot; the pilot measured the final
  code. The proof test was re-verified GREEN on the final code. The two
  earlier pilot attempts (cookFood version; strict-gate version) were killed
  and their partial outputs deleted — only the final-code pilot's 32 runs
  are in evidence.

## New findings filed

- [open] 2026-10-17 — craft-track/reachability — The scholar's pack NEVER
  holds cookable food at the evening window (0/60 sampled days): the
  division of labor routes everything cookable to the pantry/duty cook the
  same day (haul is unknowns until sorted; sorted food is eaten or donated;
  meat is cleaned and donated). A scholar-side cooking practice has no
  honest surface without changing the donation flow (sim-bankxp-b,
  evidence/2026-10-17/sim-bankxp-b.md). Design-adjacent to #364.
- [open] 2026-10-17 — craft-track/reachability — "Secure idle days" are
  ~1/60 on the courtship substrate (needTrip true via no-give-in-3-days,
  kcal < 50%, or thin pantry). Any future craft-XP lever predicated on
  scholar idle time must first establish that idle time exists
  (sim-bankxp-b).
- [open] 2026-10-17 — tracks/sheets — belongfeast-1707: a player-side craft
  threshold crossing fired ZERO sheets (crossed=1, sheets=0) — the crossing
  tele'd but pumpLevelUps produced no offer (systemArrived timing or empty
  offer list). A crossing that buys nothing is a silent milestone
  (sim-bankxp-b, evidence/2026-10-17/perseed-bankxp/armed-belongfeast-1707.json).

## Instruments retained

- scripts/test-bankxp-20261017.js — proof, ALL GREEN on the real engine
  before the kill (T1–T5; now tolerant no-op with the layer deleted).
- scripts/bankxp-pilot-20261017.js — the 32-run pilot sweep (resumable).
- evidence/2026-10-17/perseed-bankxp/ — 32 per-seed JSONs (full wall-metric
  key set: national/table/wins/entered/wave/maxArc/deaths) + bankxp-pilot-summary.json.
- DELETED zero-trace: scripts/policies/bankxp.js, the competent.js wiring
  (reverted), scripts/bankxp-sense-20261017.js (wrapped the deleted layer).

## Convergence

`killed-at-pilot` — the policy-side craft-XP drive does not engage on the
courtship substrate (no cookable food in the scholar's hands, no secure idle
days). The #364 design question stands unchanged: does the courtship scholar
need ANY route to deep_reserves, or is the Furnace build for other roads only?
The craft track remains bearer-dead on this road; the missing piece is
game-side, not policy-side.
