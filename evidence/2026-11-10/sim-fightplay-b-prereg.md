# sim-fightplay-b — Fight-play census, FIRST NUMBERS (prereg)

- Run: `fleshout-loop-b-20261111T0045Z`, Loop B, arm `sim-fightplay-b`,
  worktree `~/workspace/worktrees/sim-fightplay-b`, branch `sim-fightplay-b`.
- Base: master `6d7212cda` (verified in the main tree before the run; the
  worktree was rebased onto that explicit SHA — no bare `git rebase master`).
- This prereg was written and committed BEFORE any judged sims.
- Zero `src/js` expected (instrument + analyzer + proof test only). A real
  defect found is documented as evidence, not landed as a game-code fix.

## Authority

- COMBAT-PLAY GATE (Steve 2026-11-10 17:52 CST): before any
  monster-toughness / gear / ability tuning, establish whether villagers
  actually play combat properly. This census is the gate those tuning arms
  wait behind. It does NOT start the arm-2 toggle run or the flee-repair
  build.
- Coverage Program Tier 2, fight-play census, first numbers.
- Canon: docs/CANON.md, docs/MONSTER-WAVES.md, docs/CONTESTS.md read first.
  Monsters are fought blow-by-blow, never rolled (Steve 2026-10-08);
  contests are played, not RNG. The census measures the field-fight engine
  (`src/js/fieldFights.js`) as it actually plays, not a model of it.

## What counts as a REAL fight (grounded vs conjured)

The conjurefix fix is NOT on master (NO-GO verdict, branch
`sim-conjurefix-b` only) — so this census does NOT assume it. The
grounded-vs-conjured classification is adapted from
`scripts/conjurefix-analyze-20261110.js` on branch `sim-conjurefix-b`
(read-only reference; that tree was never modified):

- A fight row is an AGENCY fight when channel === 'field' and
  cls === 'other' (the census's agency-expedition class).
- An agency fight is CONJURED when seq == null (the fought object was
  never registered by the spawnWorldMonster wrapper) — on current master
  every `expeditionMonster` fight is conjured by construction
  (`fieldFight(vid, m, null, ...)` in villager-agency.js:449).
- A waveKillLog entry with via === 'agency' is CONJURED unless a fight
  row on the same day, same fighter, same mid, outcome 'vKill' carries
  a non-null seq. No matching fight row at all => 'unmatched'.
- `psycho_*` rows are person-vs-person violence from psychoViolenceTick
  (corruption.js), NOT monster fights — excluded, as in conjurefix.
- A REAL (grounded) wild fight is a field fight with seq != null, i.e.
  the fighter met a real world-monster instance: `villagerMonsterTick` /
  `resolveWildMonsterEncounter` meetings (cls 'world'), `aidFight`
  lingering-raider fights (cls 'other', real `m`), and any other
  fieldFight call carrying a registered instance. Contest/feast/trap
  channels are staged or social, not wild — counted separately, never
  as wild fights. Player turn-based fights (`startCombat`, channel
  'player-tb') are the scholar's, not villagers' — context counts only.

## Metrics (per REAL wild fight; every metric counted or explicitly marked unmeasurable)

1. **Party size at fight start** — `rec.partySize` (leader + opts.allies),
   plus `allyVid` / `calledHelp`. Distribution over grounded fights.
2. **Ability uses per fight, by villager** — `rec.ffFired` (leader's held
   abilities/skills that actually fired, recorded by the engine at each
   firing point) + per-round `roundsDetail[].abilities`. Ally ability use
   is NOT recorded by the engine (allies strike with their own weapon;
   no per-ally firing record exists) — marked UNMEASURABLE from the
   record, with the reason, if the corpus confirms no such field.
3. **Flee/engage call vs THAT villager's monster knowledge** — four
   decision points, each cross-tabulated by knowledge at the moment of
   the call:
   - win-plan pre-fight gate (`winPlanFightGate`): avoid / seek / null.
   - pre-fight awareness evade (`outcome === 'evade'`: "saw it, gave it
     room") — contact declined.
   - fight intent (`rec.intent`: 'learn' vs 'engage', and `intentWhy`).
   - mid-fight morale flee (`outcome === 'vFlee'`) vs vKill / mFlee / vDie.
   - Knowledge as it exists in the code (sim-knowledge-b audit §3: no
     per-villager monster-knowledge store; village-wide stores only):
     village trick-known (`villageKnowsTrick(mid)` — counter known or
     `villagerTricks[mid]`), and the fighter's personal fought list
     (`a.know[vid].fought` contains mid) + seen count
     (`a.know[vid].monsters`). Both are captured at fight entry.
4. **Trick use** — `rec.trickLog` executions by type; trick-known fights
   where NO trick executed (conditions-never-met); trick-unknown fights
   (no execution possible by construction).
5. **Ammo pocketed / used** — ammo at contact (counted from the fighter's
   own items against their equipped ranged weapon's ammo id, before the
   fight) and ammo spent (volley shots actually fired; `rec.volley`
   {shots, hits, dmg, ammoLeft}). Fights with no ranged weapon:
   pocketed = 0, reason 'no-ranged-weapon'. Fights with a ranged weapon
   but no ammo: pocketed = 0, reason 'ranged-no-ammo'. Note: the
   engine's `rec.volley.shots` is the PLANNED shot count (the loop can
   break early on a volley kill), so ammo spent is derived from
   before-minus-after counts, not from `shots` alone.

## Instrument

- `scripts/fightplay-instrument-20261110.js` — pure-read wrappers +
  daily snapshots, following the encounterprod-instrument pattern
  (stack-classified source, object-reference instance tracking via the
  spawnWorldMonster wrapper). Wraps: `spawnWorldMonster` (seq),
  `castMonster`, `startCombat` (context), `fieldFight` (rich fight rows:
  pre-fight knowledge + ammo capture, post-fight rec fields),
  `winPlanFightGate` (record-only; returns the original result
  untouched). Wrappers never throw into game code; a recording failure
  is counted in instrumentErrors and the original call's result is
  returned untouched. Zero game-state writes, zero RNG draws.
- `scripts/fightplay-driver-20261110.js` — competent policy verbatim,
  150d death-aware horizon, per-seed JSON to
  `evidence/2026-11-10/perseed-fightplay-b/`. Refuses to overwrite.
- `scripts/fightplay-analyze-20261110.js` — pure, deterministic analyzer
  over the per-seed JSONs (grounded/conjured classification adapted
  from conjurefix-analyze with attribution; psycho exclusion).
- `scripts/test-fightplay-b.js` — proof test: classification fixtures
  (grounded / conjured / psycho / contest), analyzer determinism on a
  synthetic corpus, neutrality + determinism legs (instrument on vs off,
  3 seeds x 30d, end-state digests identical), capture smoke.

## Pre-registered run parameters

- Primary metric: instrument validity + complete first-numbers capture
  (this is a measurement arm, not a tuning lever — the deliverable is
  the first numbers, not a moved number).
- GO threshold (all must hold; a miss is NO-GO, never re-scored):
  1. Instrument runs to completion on every pilot seed: 8/8 per-seed
     JSONs, no seed crash, no missing section.
  2. **0 instrument errors** across all 8 seeds.
  3. Capture completeness: every metric in §Metrics has a counted table
     OR an explicit `unmeasurable` marking WITH its reason.
  4. Neutrality leg: MODE=on vs MODE=off end-state digests identical
     on all 3 proof seeds.
  5. Determinism leg: MODE=on repeat runs identical on all 3 proof
     seeds (modulo the run label itself).
  6. Proof test green: `scripts/test-fightplay-b.js` all checks pass.
- Horizon: **150d max, death-aware** (never a fixed 200d). Why: fight
  play needs wave-3/4/5 meetings — wave 3 unlocks day 25+, wave 4 needs
  standing >= 100, wave 5 needs standing >= 200 + wave-4 faced. A 100d
  horizon truncates the wave-4 fight sample (knowledge-b at 100d: 2/8
  seeds reached W5, most stopped at W4 with barely any W4 fights).
  The 150d cap follows the conjurefix pilot's survival distribution
  (median 126.5d control / 101d after on the same policy), so most
  seeds run near the cap and dead villages stop early (+10d tail max,
  MEASUREMENT.md §10). No fixed 200d: villages that die at day 63
  must not be ticked to fill a horizon.
- Seeds: **180225–180232** (8 seeds, competent policy verbatim).
- Policies: `competent` verbatim only (measurement arm; MEASUREMENT.md
  §2's second policy isolates a lever question — this run has no lever).

## Seed-band freshness record

Searched, before choosing the band (per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):

- All preregs `evidence/*/sim-*-prereg.md` for band numbers and ranges.
  Bands already named there include 140101–140224, 150201–150216,
  160201–160216, 160501–160508, 170201–170232, 180201–180216, plus
  110001–110016 and 120101–120116.
- `evidence/2026-11-10/sim-coverage-tier2-round-2115.md` reserves
  180201–180208 (preservation) and 180217–180224 (gardening); the
  coordinator freshness-verified both. First choice 180217–180224
  COLLIDED with the gardening reservation and was NOT taken.
- Full `evidence/**/*.md` grep for `180225`: zero hits.
- Forbidden/contaminated lists named in preregs (e.g.
  sim-medcure-b-prereg.md: 96301–96308, 99101–99108, 58201–58208,
  95205–95208, 99201–99208): none collide with 180225–180232.
- Result: **180225–180232 is FRESH** — named nowhere before this prereg.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — from the
pilot corpus + daily snapshots.

## Sense-testing

Read fight transcripts (`fightSays` + `rec.log` excerpts in the corpus):
do villagers gang up, use what they know, flee sensibly, waste turns?
Judge meaning, coherence, consequences — never just counts. The
evidence file carries the village assessment: what the village looked
like, who fought and how, what knowledge/capabilities were missing.

## Out of scope

Findings outside this census go under "Findings for backlog" in the
evidence file (the coordinator appends them to the findings backlog);
they are NOT chased mid-run. A real defect found is documented as
evidence; no game-code fix lands in this arm.

## Metric review

(To be filled in the evidence file after the pilot. If the metric proves
wrong — bad proxy, taxonomy artifact, blind channel — write it here and
propose the revised metric FOR THE NEXT RUN. Never re-score this run.)
