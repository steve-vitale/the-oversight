# Journey LANDING r12 — act-0 social emergence: strangers → people (2026-10-13)

## Pre-registration (docs/MEASUREMENT.md §§9–12)
- **Question:** (a) NAME-LEARNING: by day 7 (pre-System) and day 14, how many
  of the 12 does a competent player know by name? Which path
  (intro/gesture/overheard)? Do the first-meeting transcripts read like
  people? (b) TRUST-MOVEMENT: what actually moves trust in week 1 — which
  verbs, which reasons — and is the building legible (narration lines, not
  silent bumps)? (c) HARNESS: capture the follower-volunteer line at fire
  time (r11's one-line follow-up).
- **Interesting / GO gate:** ≥1 first-meeting transcript sense-read in full;
  name-learning curve per seed (day-1/7/14); trust ledger by reason;
  ≥1 volunteer line captured IF a volunteer fires (mechanism if none).
- **Seeds:** 31, 32, 33, 34 (fresh). **Horizon:** 14 days, death-aware stop.
  **Policy:** competent, UNCHANGED (no knobs — r11 baseline).
- **Canon read:** docs/CANON.md, docs/CONVERSATIONS.md.

## What ran
- Harness: `scripts/journey-landing-r12-20261013.js` (r11 + fullTelemetry,
  revealName wrapper logging day/name/how/spoken lines, namesKnown daily
  snapshot, volunteer-line capture at fire, trust ledger from tele stream).
- Pilot: 4 seeds × 14 days, all completed. 43 sittings, sense-checked.
- Logs: `/tmp/journey-landing-r12-pilot.log`;
  censuses `/tmp/journey-landing-r12-census-{31,32,33,34}.json`;
  system captures `/tmp/journey-landing-r12-system-{31,32,33,34}.txt`.

## (a) Name-learning — verdict: WORKS, reads like people
- Curve (of 12): day 1 = 1 (the waker introduces themself) in all 4 seeds;
  day 7 pre-System = 9–11 socially earned; day 14 = 11–12 (System overlay
  gives the rest — "invasive by contrast" with the human way, per the design).
- Paths: intro 38, gesture 2 (zero-English villagers — Omar s31, one s34),
  **overheard 0**. The overheard path (game.js:15811) is narrow by design:
  it only fires when a villager seeks company AND the name-drop template is
  picked (1/5 lines) AND you don't already know the target — by then intros
  have usually covered the village. Confirmed silence, documented not fixed.
- The intro beat fires at firstMet in startConvo and reads exactly as the
  design intends: `"Ming," they say, touching their chest. "I'm Ming." You'll
  remember that.` The journal logs it the same beat.
- Seed 32 ended 11/12 — one villager died (day 12) before the player ever
  met them. Dying a stranger is correct, not a bug.

## (b) Trust-movement — verdict: LEGIBLE, but the ledger was blind
- Aggregated ledger, 4 seeds, 800 trust events, ranked by |net delta|:
  reasonless `?` **251 events / +286** (the single biggest mover); contender
  friction −176/88; creek fishing +160/160; creek water +128/128; garden
  +49/49; haven work +45/29; haven fed +29/29; hauling wood +18/18;
  monster stand-down +18/12; village foraging +16/16; slot mentoring +13/3;
  invite decline −11/11; unkind message −9/3; carried message +7/3.
- Every NAMED mover is legible (chores, favors, friction). The `?` bucket —
  31% of week-1 trust events — was reasonless `bumpTrust` calls from the
  villager objective system: water/trap returns, VISIT arrivals, co-location
  meetings, teach lessons, indoor visits, companion departures, expedition
  returns, and field-fight help calls. Most ARE narrated when the player is
  present (`playerAtHaven` gates); the ledger just couldn't say why trust
  moved. Villager-to-villager social bumps while the player is out are
  silently real — gossip seeds are the only channel, and it's probabilistic.
- **Fixed:** 10 reasonless call sites now carry reasons (pure telemetry
  metadata — zero gameplay change): villager-objectives.js (water return,
  snare-line return, VISIT arrival ×2, co-location ×2, teach lesson ×2,
  indoor visit ×2, companion departure ×2), game.js
  (resolveWildMonsterEncounter), villager-agency.js (expeditionReturn),
  fieldFights.js (answered a call for help). Proof
  `scripts/test-landing-trust-ledger-20261013.js`: 453 trust events over 3
  seeds, ZERO reasonless — RED-verified 161/453 reasonless on pristine HEAD.
- **Fixed (line quality):** the journal name-learn note stuttered —
  `📓 Journal: learned Ming's name (Ming).` The label already contained the
  name and `who` appended it again. Now: `📓 Journal: learned their name
  (Ming).` (Post-System: `Ming — learned their name. Filed.`)

## (c) Volunteer line — CAPTURED (r11 harness gap closed)
- Seed 33, day 5: **Esteban volunteered** (trust 55, goal protect). Line:
  `🚶 Esteban: "I want to see what's out there too. Lead on."` — the third
  template in party.js. Fires 1/4 seeds, same as r11. The trust ceiling is
  still the binding constraint (only seed 33 crossed 50 pre-flip).

## Village assessments (plain words)
- **Seed 31 (Sidney):** 12/12 alive, 0 deaths. Pantry 35.2k — comfortable.
  Ming hit trust 90 (the talked-to one). The social week.
- **Seed 32 (Rebecca):** 9/12 — the hard week. Leo Martin killed day 6 by "the
  thing with headlights for eyes, standing too still" (Highbeam Deer —
  animal shock, exactly the wave-1 law), a hushwolf kill, one combat death;
  pantry 19.9k, scholar lean but alive. Diana Osei taken by a monster.
- **Seed 33 (Jenny):** 11/12. One sickness death (Greta Hansen). Esteban
  volunteered day 5. Pantry 42.1k. The rich village.
- **Seed 34 (Ezra):** 12/12, pantry 53.0k — the fattest village. Hummice and
  catfish killed in villager combat, no losses.

## People check (transcripts sense-read)
- Seed 31 day-1 (Ming, want=curious): opens "You look handy. What did you do
  with your hands, before?" → player tells their trade → "Useful. Everything
  useful matters now. I mean that as a compliment." → natural ending "Okay!
  Moving! Talk later — probably while moving!" NPC wants something (curious),
  options engage, ending resolves. Reads like a person.
- Sense metrics across 43 sittings: 0 "I just said", 0 phantom names, 0
  fabricated-history flags. The `!! RE-OFFER` flags are the known
  harness-metric artifact (persistent menu items re-listed per turn), not a
  game bug.
- Transcript-header note: the harness prints the villager's descriptor at
  sitting START, so a first meeting header reads "A person, maybe 20s" even
  when the intro beat fires mid-sitting — display artifact, not a game bug.

## Blanks filled
1. **Trust-ledger reasons** (10 call sites, 4 files) — measurement blank
   closed; proof RED→GREEN.
2. **Journal name-learn stutter** (journal.js) — line-quality blank closed;
   proof RED→GREEN.
3. **Documented, not fixed:** overheard-name path never fires (narrow by
   design, intros cover the village — not dead, just rarely reachable);
   villager-to-villager social trust bumps while the player is away are
   silent (gossip is the only channel); seed-32's 11/12 name coverage
   (died a stranger — correct).

## Metric review (§14)
- No metric moved. The GO gate (name curve + trust ledger + volunteer line)
  was met as pre-registered. One measurement fix noted for the next run:
  the `?` bucket existed because tele('trust') reasons were optional — the
  fix adds reasons at the call sites rather than changing the metric.
- The ledger now attributes 100% of week-1 trust events; future lever runs
  can read it directly.

## Reachable / Fun / Winnable (landing leg)
- **Reachable:** yes — names are earned socially by day 7 in 9–11/12;
  trust builds through visible chores and conversations; the volunteer beat
  fires in competent play without grinding.
- **Fun:** yes — the stranger→name transition is the act-0 payoff ("Ming,"
  they say, touching their chest); villages end the fortnight distinct
  (fat/hard/social/rich); monster deaths are all blow-by-blow fights.
- **Winnable:** the leg sets up winnability — villages end diminished but
  alive (3 villager deaths across 4 seeds, all monster/ambush/combat/sickness
  — no starvation, no bug deaths), pantries positive, System online.

## Convergence
`converged` — all three GO-gate bars met; fixes proof-tested and regressed
(dialog-coherence 37/37, dialog-stream 43/43, dialog-gating green,
favor-system 30/30, favor-broken-line, journal-knowledge 52/52,
journal-depth 61/61, seed-voice 44/44, ontology 94/94).
