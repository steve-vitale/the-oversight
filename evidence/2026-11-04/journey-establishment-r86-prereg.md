# Journey leg ESTABLISHMENT — r86 pre-registration (2026-11-04)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (from r85's metric review, not a re-proof of r85)
r85 found every establishment village at wave 3 by day 43 — past this leg's
"wave 1" framing — but recorded only the END wave, never when waves arrived
or what wave 3 cost. This run asks: in the establishment window, when do
waves 2 and 3 actually arrive, is wave 3 earned (kills, per canon) and
survivable, and does it land before the village has geared up (the r85
armor-bootstrap gap: armor effectively arrives only via starting wearers)?

## Why this question is fresh
- Canon (docs/MONSTER-WAVES.md): wave 2 from System arrival day 7+; wave 3
  needs day 25+ AND 4 wave-2 ledger points, kills only (1/kill, 2 per
  counter-kill, 2-point per-type cap). Facing/fleeing never unlocks waves.
- r85 measured end-state only (wave 3 on 4/4, pantry fat, 0 starvation
  deaths, armor attempts 0/4). It never measured arrival days, ledger
  progress, wave-3 fights faced, or roster cost around arrival.
- If wave 3 arrives early and is survived comfortably, the leg description
  ("wave 1") is stale and should be re-scoped — that re-scope verdict is
  this run's deliverable, not another measurement batch.

## Method
- Driver: `scripts/journey-establishment-r86-20261104.js` — clone of the r85
  driver loop (competent policy, 3 day-parts/day, fights + contests driven,
  sleep) with NO favor wedge, NO door-walk, NO travel-out. Added instruments
  (read-only): daily `unlockedWave()` + `waveLedgerPoints(2)` trace, SYS
  lines mentioning wave/ledger, end telemetry summary (death rows by cause
  and kind, contest rows). Kept from r85: Game.craft armor wrap,
  villagerArmorCraftDay wrap, per-dawn material trace, daily alive + pantry
  trace, end census, 2 held end-of-run convos (goon-first, r81–r85 method).
- Seeds (fresh, unused band): 1201, 1202, 1203, 1204. One process per seed.
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Canon: docs/CANON.md + docs/MONSTER-WAVES.md read before running (wave
  gates above). No canon doc covers armor crafting specifically — the craft
  flow is taken from landed code + the r85 note, not invented.

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)
- M1 WAVE-SCOPE: wave reached by day 42 per seed. VERDICT (not a game
  failure): if >= 3/4 seeds reach wave 3, the leg's "wave 1" framing is
  STALE — recommend re-scoping the leg description to waves 1–3. If <= 1/4
  reach wave 3, r85's 4/4 was a seed-band effect; say so.
- M2 WAVE3-ARRIVAL (descriptive, with a named interesting bar): day wave 3
  first appears in the daily trace, wave-2 ledger points that day, armor
  worn by the roster that day, roster alive that day. INTERESTING if wave 3
  arrives before day 35 on >= 2/4 seeds, or if any seed faces a wave-3
  monster while wearing zero armor roster-wide.
- M3 SURVIVAL-42: village not over AND >= 1 villager alive at day 42.
  GO: >= 3/4 seeds.
- M4 PANTRY-GUARDRAIL: no death with cause matching starvat|hunger|thirst
  before end of run. GO: >= 3/4 seeds with zero such deaths.
- M5 PEOPLE: 2 held convos per seed, read IN FULL, judged on meaning /
  coherence / consequence (SENSE-TESTING LAW) — verdict per convo in the
  run note, not exchange counts. A nonsense convo is a blank to fill or
  document.
- M6 ARMOR-GUARDRAIL (descriptive, NON-binding): armor craft attempts
  (player + NPC beat) and armor worn at end, as an r85 replication check on
  fresh seeds. A repeat 0/4 strengthens r85's bootstrap-gap finding; it
  does not re-bind this run.

## What counts as an interesting finding
- Wave 3 on >= 3/4 with arrival days + ledger proof: leg re-scope verdict
  (the deliverable) + whether arrival was kill-earned per canon.
- Wave 3 arriving while the roster wears no armor: the r85 gear gap meets
  the wave gate in-window — a concrete player-facing squeeze, not just a
  dead-end chase.
- A seed where wave 3 arrival coincides with roster collapse (alive drops
  >= 4 within 3 days of arrival): survivability finding, trace the fights.
- Either way: no re-scoring against a friendlier metric mid-run. If a
  metric proves wrong, it goes under "metric review" for the NEXT run.

## Out of scope
- No armor-on vs armor-off panel (still needs a villager-armor toggle
  that does not exist). No game-code change unless the run finds a
  concrete, fixable blank; any fix gets its own proof test and a re-run
  of affected seeds.
- No live-build screenshot pass this run (no dialogue/UI change is in
  scope); the people check is transcript-based, as in r81–r85.
