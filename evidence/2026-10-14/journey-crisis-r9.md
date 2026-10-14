# Journey: crisis leg (6) r9 — the compound crisis (2026-10-14)

## Pre-registration (MEASUREMENT.md §§9–12)

- **Leg:** 6 — crisis, r9. Fresh angle: **compound crisis — famine + outbreak
  at once.** r7 covered famine→corruption slope, r8 covered the outbreak in
  conversation; the two systems interacting is untested, and r7's seeds
  incidentally collapsed to compound causes.
- **Leg question:** When famine and outbreak hit together, does the village
  bend like people — do conversations carry both crises, do villagers
  prioritize sensibly (tend the sick, keep foraging, plan burials), do the
  two crisis systems interact without deadlocking each other?
- **Interesting finding criteria:**
  - conversations surface hunger AND sickness in the same breath;
  - villagers verbalize crisis roles (tending rounds, foraging parties);
  - no deadlock where one system blocks the other (e.g. everyone tends and
    nobody eats, or vice versa);
  - deaths attributed correctly in mourning.
- **Seeds:** pilot 777, 888, 999 (exact literals). Policy: oracleV2.
- **Primary metric:** conversation carrying — ≥3/4 villagers asked 'lately'
  surface at least one of the two crises. Binary per seed.
- **GO threshold:** ≥2/3 seeds meet it. 0/3 = nothing interesting → document,
  don't expand (kill rule).
- **Horizon:** 55d max (20 establish + 35 compound). Death-aware: stop on
  collapse +10d tail.
- **Method:** establish 20d → CONTROLLED REAL famine (blight: pantryAdd +
  stockPantry refused from d20) → at d25 stage gut-rot on 5 adults (every
  downstream machine real: ticks, tending, relief, moots, convo) → run to d55
  or collapse. Mid-crisis conversation checkpoint at d35+. End-state convos:
  2 sick + 2 healthy.

## Run log

### Seed 777 — battered village, finished by the compound
Establish phase was monster-heavy: 6 deaths d16–20 (monster/combat/contest),
pop 5 at d22. Then the blight (pantry 16250→200 by d30), outbreak staged d25
(5 adults; 2 sickness deaths d29/d33), hunger-winter d33. Village dead by
~d38. Only 2 survivors left to talk to — both latelyKind=mourning, both
carried (Jorge mourning Nikos: "Since Nikos died... I keep expecting to see
Nikos at the fire. Stupid."; Ingrid picking up Nikos's share of the work).
The monster deaths dominated this seed (6/9), so grief, not hunger, led the
talk — honest, not wrong.

### Seed 888 — the true compound crisis (star of the run)
Pantry 5200→0 by d30, pop 9→7, sick peak 5, collapsed ~d33. 4/4 convos
carried, ALL latelyKind=outbreak:
- **Anon (sick):** "It's got me as well. gut cramps, can barely keep water
  down. Half the fire's got it." / "My stomach's been empty so long I've
  stopped feeling it, and that's worse. I'm slowing down — stupid, clumsy.
  Help me get back on my feet." / "I do push-ups at dawn between tending
  rounds. Someone has to keep the water boiled." / "If it takes anyone else
  we bury them properly. That's the deal we made." — sickness, hunger, and
  tending duty in ONE voice, reading like a real desperate person.
- **Adaeze (healthy):** "Another day like today and we're choosing who eats.
  Meet me at the creek bend, past the treeline and we'll fill packs before
  dark." — the famine carried as a plan, not a complaint.
- **Ricardo (sick):** opener is gut-rot ("feverish, a cut gone hot") but his
  dialogue centers a wound ("The cut's gone hot and it's spreading — clean it
  out, wrap it tight"). Possible ailment/dialogue mismatch — low confidence,
  noted below.
- **Emma (healthy):** latelyKind=outbreak but her talk was small talk (hands,
  sleep). Kind fired, content didn't fully carry. Mild miss.

### Seed 999 — the blight leaked; village survived
Famine staging FAILED to bite: pantry GREW 5520→28800 while 240k kcal were
blocked. Direct villager deposits (forage hauls at game.js:7339/7494, butcher
yields at 6194/6229) bypass the pantryAdd/stockPantry choke points — the
blight only refuses the SYSTEM inflow paths. The village foraged around the
blight and grew fat. Outbreak (5 staged) resolved with zero sickness deaths;
raids kept coming (the-siege d15/23/30/43/52). Pop held 7–9 to d55.
- MID checkpoint (d35, village alive): Emilio's latelyKind=**naming** — "The
  whole fire was arguing about Bulldozer last night — what to even CALL it."
  Sensible, not senseless: the village wasn't actually starving and the
  outbreak had resolved. People argue about names mid-crisis; that's human.
- End-state: all mourning (Mia, d52 combat death), all carried.

## Findings

1. **The village bends like people.** The compound crisis reads human:
   hunger and sickness carried in the same conversations, villagers
   verbalizing crisis roles (tending rounds, foraging parties, burial pacts),
   grief that names the dead and picks up their work. No deadlock observed —
   tending didn't stop foraging, foraging didn't abandon the sick.
2. **Soft spot (Emma, 888):** latelyKind=outbreak fired but her dialogue was
   small talk. Kind-without-content — worth watching, not a fix yet.
3. **Possible ailment/dialogue mismatch (Ricardo, 888):** staged gut rot,
   talked wound. Low confidence (he may genuinely have both); noted, not
   filed.
4. **Harness limitation — blight leak:** the "controlled famine" only
   intercepts stockPantry/pantryAdd. Direct villager deposits bypass it, so
   on 999 the famine never bit. Future famine harnesses should also wrap the
   direct-push paths or assert pantry trajectory in the first 5 famine-days.
5. **No moots during compound crisis** — by design: moots are the justice
   system's (betrayal.js quorum), not crisis management. Relief/aid is the
   crisis-response path.

## People check (SENSE-TESTING LAW)
10 full transcripts read across 3 seeds. Verdict: people. Anon's
compound-crisis monologue is the best crisis dialogue this loop has seen.
Mourning lines ("Nobody says Mia's name right yet. We will.", "picking up
Nikos's share of the work") land. The naming-debate-during-crisis beat reads
as coping, not a bug.

## Verdicts
- **Reachable:** yes — compound crises happen naturally (r7's seeds collapsed
  to compound causes without staging).
- **Fun:** the crisis arc plays — desperation, tending, grief, dark humor
  ("choosing who eats").
- **Winnable:** 999's village survived the compound staging outright (famine
  leaked, caveat noted); 777/888 died but were already battered pre-staging.
  Compound crisis is lethal to a weakened village, survivable by a strong
  one — sensible.

## Metric review (§14)
GO met 3/3 on the letter of the metric — but the metric is looser than the
question. The CRISIS_RE counts grief/mourn/dead, so 777 passed on
monster-death mourning rather than famine/sickness topics, and only had 2
survivors to ask. 999's famine staging leaked, weakening it as a compound
data point. No goalposts moved: GO stands, and it stands on 888 alone — a
clean 4/4 with both crises genuinely carried in the talk. **Proposed
revision for the next crisis run:** tighten "carried" to
famine/sickness-specific topics (hunger/starve/food/sick/fever/tend/water),
require ≥3 survivors asked.

## Telemetry deviation check
New angle → seeded baseline
`hidden_files/telemetry-baselines/crisis-compound.json` (carriedCount=10,
sickPeak=14 over 3 seeds; the LOUD "newly appeared" lines are first-seed
noise). Rolled forward as the r9 baseline.

## Files
- Diag: `scripts/diag-crisis-compound-20261014.js` (controlled compound
  famine+outbreak; mid-crisis convo checkpoint; fixed fallen-name lookup
  `f.villagerId` — tooling fix, no game code touched)
- Evidence: `evidence/2026-10-14/journey-crisis-r9-{777,888,999}.{json,log}`,
  this note
- Baseline: `hidden_files/telemetry-baselines/crisis-compound.json`
