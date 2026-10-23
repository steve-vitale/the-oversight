# Journey leg: ESTABLISHMENT (days 14–40) r19 — 2026-10-23 (10:50 CDT run)

**Run provenance:** clean scheduled run (no lock at start; rotation read 1).
Leg 1 = establishment; rotation advances to 2 at landing. Worktree
`journey-establishment` on master 806a71bed (pull: already up to date).
Env gates at landed defaults (PLENTYDEPRI/DEPOSITGATE unset = ON) — this
run measures the live game.

Canon read: CANON.md (manifest + standing rules), CONTESTS.md (the show:
contests are its teeth, TV is its gossip), CONVERSATIONS.md (dialogue bar).
Food canon: docs/PRESERVATION.md (food ladder); the surplusfeed removal is
docs/DECISIONS.md 2026-10-21 (Steve's ruling). No new canon invented.

## PRE-REGISTER (§14 — a miss is NO-GO, never re-scored mid-run)

- **Question:** post-surplusfeed-removal (Steve 2026-10-21) + plentydepri/
  depositgate (behavioral, default-ON), does the establishment food economy
  behave sanely — no starvation waves, no rot cliffs, pantry healthy — and
  do the r16/r18 contest-gossip fixes hold in the wild, including
  PLAYER-LOSS gossip (r18 seeded it for the first time)?
- **Interesting:** starvation deaths with causes; pantry cliffs/negative
  pantry; plentydepri/depositgate ledgers silent on plentiful days;
  player-loss contests gossip-silent again.
- **Seeds:** 61, 82, 103, 124 (r15/r16/r18 comparability). Horizon 42d
  (+death-aware tail). Policy: competent PINNED.
- **Binding metrics:**
  - M1a (win surfacing): contests with outcome 'won'; surfaced if >=1 NAMED
    gossip line within 3d. GO if >=25%; NO-GO if <10%.
  - M1b (defeat surfacing): contests with outcome 'lost'|'died'; same 3d
    window. GO if >=25%; NO-GO if <10%.
  - M2 (food economy): starvation deaths <=1 across the pilot; pantry atom
    <=500 ALL seeds; pantryKcal never negative; villages alive at end.
  - M3 (people): >=6 full transcripts sense-read, 0 senseless.
  - Records/nulls (r16 fixes hold): ZERO placeholder champion lines; ZERO
    null renders in held convos.

## METRIC VERDICT

- M1a win surfacing — **METRIC-REVIEW: 2/11 = 18.2%** (10–25% band) on the
  pre-registered 42-day pilot. Per-seed: 61: 0/2, 82: 0/3, 103: 2/4,
  124: 0/2. Below r18's 6/20 (30%) but inside the review band — recorded,
  not re-scored. The two surfaced wins named the show and the winner
  ("Did you hear? You won Duel on the cameras"; "Wei walked out of The
  Informant. Alive."). Note: the 46-day seed-103 extension (run for the
  M1b window, below) aired one more win (The Echo, day 46) which also
  surfaced — 3/12 = 25.0% pooled with the extension. Recorded as an
  observation, NOT a re-score of the binding pilot metric.
- M1b defeat surfacing — **NO-GO: 0/1** (n=1: The Witness, lost, seed
  103 day 42). The competent policy rarely loses; one defeat in 4 seeds.
  The r18 seed fix VERIFIED working in the wild (see headline) — the
  miss is surfacing weight, not seeding.
- M2 food economy — **GO.** 0 starvation deaths (4 seeds); atom 250–500
  all seeds; pantry never negative; 4/4 villages alive at d42–43.
- M3 people — **GO.** 12 transcripts sense-read (below), 0 senseless.
- Records/nulls — **GO.** 0 placeholder champion lines, 0 null renders.

## HEADLINE: the loss gossip seeds, spreads, and still never surfaces — root-caused to branch priority (Steve's call)

The r19 driver instruments `_cxGossip` calls directly. Seed 103's The
Witness loss (day 42, extended to day 47 for a full probe window):

1. **Seeding works (r18 fix holds):** `('survived','player','The Witness')`
   seeded day 42, hearer alive. The r18 proof test's RED->GREEN is confirmed
   live, not just in the harness.
2. **Spread works:** the entry's heard-list grew 1 -> 7 villagers within
   2 days (day-43 probes: 2 tellers entry-available; day-44: 7). The
   village's secondhand-gossip propagation carries contest news.
3. **Surfacing fails on branch priority:** every probe (days 43–44, 9
   total) surfaced something else — `npcAbout` (the 50% "people talk about
   each other" branch) or `aboutOther` (the departure/return/deed churn).
   In `askAbout(vid,'gossip')` (game.js): npcGossipAbout fires first at
   50%, dark gossip second at 45%, then scandal-about-you, then the
   aboutOther pool where rumor-verbs outrank routine news and the walk-down
   serves freshest-first. A contest entry decays in 3 days while the
   village generates 5–10 ambient entries/day — the day-42 Witness entry
   never became the freshest unsaid item before it faded. The render path
   is fine (r16 CONTEST MEMORY names the show); the entry just never gets
   its turn.

This is the r18 "surfacing weight" proposal with the mechanism now
measured end-to-end: seed ✓, spread ✓, serve ✗. The r18 lever proposals
stand ((a) recency/salience boost for source==='contest' entries ~3d
post-airing; (b) a dedicated fireside beat the night after airing).
**Weighting remains Steve's call — NOT landed** (per r16). Per KILL
DISCIPLINE: the mechanism isn't broken, so no lever was killed or forced.

Metric-review proposal for the NEXT run: the current metric asks single
`ask:gossip` probes; the walk-down (r28) eventually reaches every unserved
entry, so a sharper instrument is "does the contest entry surface with
exhaustive 'tell me more' asking inside its 3-day life?" — that separates
weighting from availability cleanly.

## VILLAGE ASSESSMENT (plain words)

**Seed 61 — the brawler.** 11/12 alive d42, 11 deaths (hard world),
pantry 15–41k, ended 18k. 2 contests (Beastmaster, Bring Us Something
Interesting — both won). Wilhelm the vintner sings old Columbus songs
under his breath; Kate the dry cleaner dreams of the pods and her taken
nephew Joseph.
**Seed 82 — the calm kitchen.** 9 alive d42, 10 deaths, pantry 6.7–42k,
ended 7.9k. 3 contests, all won (Duel, Pattern Hunger, The Quiet Room).
James the truck driver needs hands at the Haven door; Lillian the
blacksmith tests whether she can trust you about her taken spouse Arlo;
Ruth the zookeeper confesses she sneaks out at night.
**Seed 103 — the winning streak.** 11 alive d47 (extended to 46d for the
Witness probe window), 6 deaths, pantry 33–49k. 6 contests: 5 wins + the
run's only loss (The Witness, d42). Mateo the dispatcher dreams of eight
un-afraid hours; Erin the PT aide is sick and asking for help; Ruth the
plumber's sister Sofia was taken.
**Seed 124 — the lean survivor.** 9 alive d43, 17 deaths, pantry ran
27k -> 5k -> 12.6k -> 3.6k -> 7k, ended 4.6k. A village living
hand-to-mouth for 30 days with zero starvation deaths. 2 contests, both
won (Duel, Windfall). Valentina and Peyton both run the water math with
you (9 liters, 7 liters — two favors, two days); Peyton: "Do the math
with me: 7 liters, 9 people. That's not tomorrow's water."

**Who leads:** trust-60+ tiers on every seed (r16 pattern holds).
**Who is miserable:** nobody at trust 0 flagged; Erin's sickness and
Hermann's sickness are needs, not misery.
**What is missing:** the show's defeats in the fire's talk — the one
defeat this run seeded and spread but never surfaced (headline).

## FOOD ECONOMY (the active target)

- plentydepri engaged 35–41 days/seed, 210–360 eased decisions/seed,
  **86–188k kcal of would-be surplus production eased per seed** — the
  mechanism is not decorative. Day voices name real instead-of work
  (seed 61: "Sitting with the fever cases instead — someone should";
  "Mending the nets instead"; "we eat at the fire, and the shelves
  keep"). 20 voice samples captured, all named work, no idle lines.
- depositgate held back 22–65k share kcal/seed (eaten at the fire,
  recorded 'depositgate-eased') + 13–44 return/bigHaul eases/seed.
- Seed 124 is the stress case: plentydepri kept easing through a 30-day
  lean stretch (pantry ~5k, 9 villagers). Coherent, not a bug: the
  plenty sensor reads `pantryFreshDays()` = fresh-kcal / the village's
  OWN recent burn — when the pantry is barely drawn (villagers self-feed
  from daily production), "plenty" by its own outflow is honest, and the
  hungryStreak>=3 exemption is the backstop (never fired; the meal loop
  kept everyone fed). Margin was thin but the design held: 0 starvation.
- **TELEMETRY: pantryKcal LOUD -67%** (244,182 -> 79,935 across the 4
  seeds) vs the 2026-10-21 baseline. Investigated same-run: EXPLAINED —
  the baseline predates the surplusfeed-removal ruling's full effect;
  smaller stockpiles + eat-at-the-fire is the intended behavioral
  outcome, confirmed by the ledgers, the voice lines, and the
  sim-plentydepri-confirm-b run (rot down, guardrails hold). Baseline
  rolled forward with provenance note. deaths 46->44, popAlive 38->40,
  pilotAired 4->4: all quiet.

## PEOPLE CHECK (12 transcripts sense-read, 0 senseless)

61: Wilhelm (vintner) — creek concerts, Columbus songs, tunes outlast
everything. Kate (dry cleaner) — pods dream, taken nephew Joseph,
"I do not know what cozy means at that scale" (KIN.md voice); the
commit-to-ask-the-System beat lands ("Even asking is more than the
silence"). Angelo (street artist) — "Have you ever hurt someone?...
I don't keep score on that. Score-keeping is how you stop sleeping."
82: James (truck driver) — Haven-door favor with escalating pushback
when the same question is spammed ("I've told you three times now").
Lillian (blacksmith) — trust test: "The wrong one would've been 'yes'
too fast." Ruth (zookeeper) — night-sneaking confession; gossip chain
serves ambient (departures, "People are talking about Maya") — the M1a
finding from the player's seat.
103: Mateo (dispatcher) — hope beat ("Eight hours of not being afraid").
Erin (PT aide) — sick-row favor ("achy and wrung out"). Ruth
(plumber) — taken sister Sofia; expedition cue yields a real learned
cue ("Flashbulb Moth — It lands. It hunts at night").
124: Valentina (tattoo artist) — cistern favor; decline lands a real
social close ("They won't raise it again"). Hermann (hunting guide) —
sick; dodges "tell me why" ("Gotta run. Literally. Bye!" — reads as a
deflect, noted not flagged). Peyton (musician) — the water math,
"They won't ask twice."
Hard-flag scan: 0 fallback lines, 0 phantom names, 0 verbatim repeats,
0 null renders in 12 held convos. Menus within the r16 cap.

## BLANKS FILLED / DOCUMENTED

1. **Documented (design, Steve's call):** contest-gossip surfacing weight
   — root-caused to ask:gossip branch priority + recency competition
   (above). Seed ✓ spread ✓ serve ✗, measured end-to-end. Not landed.
2. **Verified working (not a bug):** the r18 player-loss gossip seed
   fires in the wild with a living hearer; gossip propagation spreads
   contest entries (1->7 hearers/2d); plentydepri/depositgate engage and
   voice named instead-of work; seed-124 lean stretch coherent under the
   fresh-days sensor.
3. **Observed, not flagged:** Hermann's "Gotta run" dodge on a details
   ask; the 9L-vs-7L cistern readings are two favors from two days.
   The r19 driver's probe-line JSON slice (first 40) hid the Witness
   probes — fixed to full list in the driver.

## REACHABLE / FUN / WINNABLE

- **Reachable:** pilot + 2–5 contests on 4/4 seeds; all wins pay real
  prizes; show-talk available on ask; ambient contest gossip on 1/4
  seeds this run (the weight gap, not availability).
- **Fun:** the leg's texture holds — creek concerts, the water math,
  "They won't ask twice," fever-case sitting instead of surplus hauling.
  The plenty/deposit voices make the food economy legible as people
  making choices, not numbers moving.
- **Winnable:** 4/4 villages alive through 5–17 deaths; pantries 4.6–48k;
  succession carrying; zero starvation.

## METRIC REVIEW

- M1a landed 18.2% in the 10–25% METRIC-REVIEW band — recorded as such,
  not re-scored. Next-run proposal: keep the M1a/M1b split; add the
  exhaustive-walk-down instrument (does the entry surface with repeated
  "tell me more" inside its 3-day life?) to separate weighting from
  availability.
- M1b n=1 is a sample-size artifact of competent play (losses are rare).
  The r18 seed fix is verified live; the metric's binding threshold
  stands for the next run.
- M2's <=1-starvation bind held with 0; the seed-124 lean stretch suggests
  keeping it (not loosening) — the mechanism earned the margin.

## Files

- Run note: this file
- Harness: `scripts/journey-establishment-r19-20261023.js` (r18 probe
  lineage + M1a/M1b split + daily food census + plentydepri/depositgate
  ledgers + _cxGossip call instrumentation; seeds 61/82/103/124)
- Per-seed JSON + contest-window transcripts + held convos (4 seeds):
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/journey-establishment-r19-*`
  (seed 103's JSON is the 46-day extension run; seeds 61/82/124 are the
  42-day pilot)
- Telemetry baseline rolled forward:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/establishment.json`
