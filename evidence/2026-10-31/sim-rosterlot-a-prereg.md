# sim-rosterlot-a — pre-registration (committed BEFORE any judged sims)

Arm: sim-rosterlot-a, ROSTER-LOTTERY CENSUS. Run fleshout-20261031T1850Z,
Loop A, axis scale-onramp. DIAG ONLY: zero src/js changes, zero policy
changes, zero lever build. Answers patrolsilent N2 (measurement, not a fix):
how often does a village START with zero combat occupations AND no kills
pathway — the 85107 shape.

## Code-read definitions (exact, from this base)

- STARTING ROSTER: `Game.state.village.roster` immediately after
  `setupGame(Game)` returns (the sim-harness start: `loadGame({seed,
  mode: 'deadfall-diag'})` then `setupGame`, same substrate call as
  patrolsilent, but NO days are run — the read is generation-time, not
  mid-run). Expected size 12 = 6 generated (player + 5 others, game.js
  `genRoster`: 4 candidates + 2 extras) + 6 background survivors drawn
  from `background_survivors.json` (game.js `newGame` bg draw). Any other
  size is reported, not forced.
- ASKABLE POOL: starting roster minus the scholar (`Game.villagerId`).
  Delegate (`scripts/policies/delegate.js` `livingVillagers`) never asks
  the scholar, so a combat-occupation PLAYER does not help patrol.
  Expected size 11. The player-is-combat case is reported separately
  (secondary), never folded into the askable rate.
- COMBAT OCCUPATION: the delegate regex VERBATIM, on the lowercased
  `formerOccupation` string:
  `/(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/`
  (delegate.js `combatCred`, occ branch). Persons are read from
  `Game.data.villagers` (post-`newGame` this holds the generated cast
  PLUS the hydrated background survivors — verified: `newGame` pushes
  each hydrated bg seed into `data.villagers`), falling back to the
  `background_survivors.json` seed row if an id is missing there. NEVER
  via `Game.getPerson` (it hydrates seeds — patrolsilent's read-only
  discipline). A roster id found in neither array is `personMissing`
  and fails the seed's completeness bar (see DIAG-GO 1).
- COMBAT-OCC HOLDER: an askable pool member whose `formerOccupation`
  matches the regex above.
- KILLS AT GENERATION: `state.village.agency.stats[vid].monsterKills`,
  read RAW when the agency object already exists, else null (never a
  default 0 presented as measured — patrolsilent discipline). Expected:
  absent/zero for every member on every seed (agency stats are earned
  in play, `villager-agency.js` kill resolution). Any nonzero kill at
  generation is a definition failure: FAIL LOUDLY, do not judge that
  seed, do not silently re-define.
- 85107 SHAPE (generation-time, PRIMARY): the askable pool contains
  ZERO combat-occ holders. The kills clause of the 85107 shape is
  satisfied trivially at generation — kills are zero/absent for
  everyone by construction — and is stated as such, NOT hidden. The
  mid-run rescue (a village starting shape-shaped that later earns
  kills: patrolsilent's mechanic 3 kills, farmer 2 kills, street
  artist / paramedic / ESL teacher 1 kill each) is a SEPARATE,
  already-measured phenomenon and is NEVER folded into this
  generation-time rate. Likewise fit-first trapping (85111/85114) is
  a separate phenomenon and is not counted here.
- EDGE CASES, counted separately, never folded into holders:
  - `hunting guide`: regex-NEGATIVE (verified: /hunter/ does not match
    "hunting guide"; game.js line ~6677 notes formerOccupation
    'hunter' fires on zero persons in the starting cast). It carries
    `knowsSnare` + `knowsPit` in `characterGen.json`, so it is
    trap-knowledge-adjacent, but it is NOT a delegate combat
    occupation. Reported under "trap-knowledge" secondary count.
  - Other trap-knowledge occupations (characterGen.json `knowsSnare`
    and/or `knowsPit`, all regex-negative except soldier): farmer,
    trail crew lead, fishing guide, exterminator, rancher, wild food
    forager, bush pilot (+ hunting guide above). Secondary count
    only. NOTE: patrolsilent's kills-earned holders span occupations
    WITH and WITHOUT trap knowledge (mechanic, street artist,
    paramedic, ESL teacher, blacksmith have none), so trap knowledge
    is NOT a kills-pathway gate — it is reported as context, never
    as a pathway claim.
  - Mid-run rescue channels EXCLUDED from the generation rate:
    drifter applicants with literal occupation `hunter` (membership.js
    `genApplicant` light list: cook/carpenter/nurse/farmer/mechanic/
    teacher/hunter — this explains patrolsilent s85103's 'hunter'
    holder, an `app_` joiner, not a starting villager) and later
    background-survivor applicants (70% branch of the same function).
    Documented here so no reader mistakes a mid-run holder for a
    starting holder.
  - `marine` / `ranger` / `boxer` / `mma` regex arms: NO occupation
    in the 78-entry generated pool or the 100-entry background pool
    matches them (verified by scan). The pool's combat occupations
    are exactly 4: firefighter, police officer, infantry soldier,
    night security guard (generated pool); the same 4 names in the
    background pool (4 of 100 seeds). If a census seed surfaces any
    other matching occupation, it is reported verbatim and the pool
    scan is re-run — the definition does not change mid-run.

## Primary metric

Rate of 85107-shape starting rosters = (seeds with zero combat-occ
holders among the 11 askable) / (judged seeds). Reported ALWAYS as
counts AND proportion, never a bare percentage. A Wilson 95%
interval (analyzer-computed, formula pinned in the proof test) is
reported alongside, labelled as interval, not as the rate.

Naive-draw expectation (approximation, for comparison only — NOT a
judged metric): generated draws are ~without-replacement from 78
(4 combat; the `usedOccs` guard rejects duplicates) and bg draws
~without-replacement from 100 (4 combat), first-name guard ignored
(occupation ~ independent of name). P(0 combat among 5 askable
generated) = C(74,5)/C(78,5); P(0 among 6 bg) = C(96,6)/C(100,6);
product ≈ 0.59. If the judged rate lands far from ~0.59, the
evidence file must say why (pool scan wrong? guard stronger than
assumed? player-position effect?) rather than quietly re-baselining.

## Seed plan (fresh band; no reuse as judged data)

- Pilot: 8 fresh seeds 85201–85208.
- Extension (only if pilot passes DIAG-GO 1–2): 85209–85224, for
  24 judged seeds total. Extension is pre-committed here, not
  decided after seeing pilot numbers — the only pilot gate is
  cleanliness/determinism, never the rate.
- NO judged re-use of patrolsilent's band (85101–85116). Corpus
  reads done during definition work (s85103 'hunter' joiner,
  s85107 zero-holder confirmation, first-beat roster size 11)
  were definition checks only and contribute ZERO judged rows.
- Harness: one process per seed is NOT required; the sweep runs
  seeds sequentially in one process via `loadGame` + `setupGame`
  per seed (patrolsilent pattern), and the determinism leg
  re-runs one seed in a FRESH process and compares roster tables
  byte-for-byte. `Math.random` is seeded by `loadGame` before
  eval (harness rule); no `Game.save` stubbing; no policy is run.

## DIAG-GO bars (judged exactly against this file)

1. Pilot cleanliness — GO iff 8/8 pilot seeds yield complete roster
   reads: roster size reported, askable size 11, personMissing 0,
   recorder errors 0, kills absent/zero for all members. Any seed
   failing this is retried once (EPERM-flap tolerance); a seed
   failing twice is listed as FAILED (not silently dropped) and
   the denominator is judged seeds only, with failures named.
2. Determinism — GO iff one pilot seed re-run in a fresh process
   yields a byte-identical roster table (same ids, occupations,
   order, scholar id).
3. Extension completeness — GO iff all 24 seeds have a roster
   table in the per-seed corpus and the analyzer derives every
   judged number from those JSONs only (never re-runs sims).
4. Sense test — GO iff at least 2 generated rosters are read in
   full and judged as people (one 85107-shape, one contrast with
   ≥1 holder). If the pilot holds no shape seed, the shape roster
   comes from the extension; if NO seed in 24 is shape-shaped
   (against a ~0.59 expectation, near-impossible), the sense test
   uses the lowest-holder seed and says so.
5. Reporting — GO iff the evidence file reports: shape rate as
   counts + proportion + Wilson interval, holder-count
   distribution, holders by occupation and by source
   (generated vs background), trap-knowledge secondary count,
   player-is-combat count, full-roster (incl. player) holder
   count as secondary, and the wall-numbers paragraph below.

## Wall numbers (NOT observable here — stated, never fabricated)

This is a generation-time census: national / table / wins and wave
reach are NOT observable on it, and no long-horizon follow is run
(scope discipline; no follow is pre-committed here). The evidence
file reports that plainly. Patrolsilent's band numbers (national
10/16, table 11/16, wins 11/16 on its policy substrate) are NOT
this arm's numbers and are not re-claimed.

## Panel (§15) and needs-eyes

Panel: NOT APPLICABLE, none fabricated — single-base DIAG census,
not a before/after lever comparison (same declaration as
patrolsilent-a). A later lever arm reusing this corpus as its
baseline runs the panel then. No [needs-eyes]: measurement only,
nothing player-facing ships.

## Files (planned)

- This prereg: evidence/2026-10-31/sim-rosterlot-a-prereg.md
- Evidence: evidence/2026-10-31/sim-rosterlot-a.md
- Census sweep: scripts/rosterlot-sweep-20261031.js
- Analyzer: scripts/rosterlot-analyze-20261031.js
- Proof: scripts/test-rosterlot-20261031.js
- Corpus: evidence/2026-10-31/perseed-rosterlot-a/s85201–s85224.json
