# Trigger build — PRE-REGISTRATION (arm sim-triggerbuild-b)

Run: fleshout-loop-b-20261105T0139Z. Loop B re-point queue, winnability
chain, 2330Z next blank #1 (BUILD the trigger). Committed BEFORE any
judged sim. Game-code change (default-ON), not a policy change: the
competent policy runs VERBATIM in both legs, so any movement is the
game's, not the bot's.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §Wave 4: wave 4
  is The Mirror Draft (standing >= 100). Wave 5 needs standing >= 200
  AND wave-4 faced. No canon invented.
- `docs/CONTESTS.md` read for fight classification (unchanged from
  trigger-b: contest/feast/trap/world/other, precedence fixed).
- Standing rules honored: monsters do NOT flee unless their kind
  carries an explicit flee component (no flee component touched);
  perception law (no roster-fed or list-fed decisions — the mechanism
  below reads only the monster on the player's own tile, which the
  engine already perceives via `playerMonster()`); havens stay safe
  (lingerers excluded, see below); "If you don't know, it doesn't
  show" (the beat line uses `monsterDisplayName`, never the true
  name); no silent actions (the beat is narrated).

## The blank (2330Z trigger arm, measured not inferred)

On the gearbar band 99101–99108 (competent verbatim, 150d
death-aware), of 18 wave-4 monsters that shared the player's tile
without ever being fought, ALL 18 ended their first stay because the
player left the tile, and 17/18 never got a single contact turn.
Mechanically: tile-entry spawns land on the tile the player just
entered; the player's next action is very often another step toward
home; node travel (`travelTo`) runs NO monster turn for the tile
being left, so a monster spawned on an entry tile gets zero contact
turns unless the player happens to act on that tile first. Contact
odds, stance commitment, and line of sight are NOT the fix — they
touch at most the 1 instance in 18 that ever got a turn.

## The mechanism (fixed here, one mechanism only)

THE PARTING TURN. In `travelTo`, after the blockage checks and
before the position update, when the monster on the departing tile
(`playerMonster()`) is a world monster of wave >= 4 that is NOT a
lingerers (`m.lingering` — the lingerer beat keeps its own
endure/sortie choice, untouched) and the player is not already in
combat, the monster gets ONE `monsterTurn()` on the departing tile,
framed by one narrated line:

"You turn to leave — behind you, the <display name> stirs."

Then travel proceeds exactly as before (follower logic, arrival,
checkEncounter all unchanged). If the parting turn commits the
monster to combat (`startCombat`), travel aborts (`return null`,
player stays on the tile, fight live) — the barrier exit remains
the legitimate mid-fight way out. If no fight starts, the player
leaves as before: the player can still leave, but never leaves a
wave-4 monster's tile without that monster getting its turn. That
turn is the stopped moment: a beat, not a forced fight, not a
price, not a roster decision. Scope is wave >= 4 only, because the
blank is wave-4 facing and lower waves have working dynamics of
their own (deer flee, etc.) that this arm must not disturb.

Why one turn is enough to judge: tile-entry spawns land in the
4±2 detail box (Chebyshev <= 2 from the player), so a parting turn
is a real turn — ambush within 2 commits immediately, grazing
notices and warns, territorial warns, hungry closes, curious
watches — and repeated departures escalate (territorial
warn -> warnTurns -> commit). The turn is recorded by the
instrument as an ordinary `monsterTurn` call, plus a new trace
field `viaTravel` (stack names `travelTo`) so conversions are
attributed to the mechanism, not to background movement.

What this arm does NOT change (hard constraints, not re-litigated):
no gate/price/deed/readyDemand change, no win-price change, no
VETSHAPE flip, no flee-component change, no contact-odds tuning,
no stance/LOS tuning, no ability-use follow-up files (main
session owns those — untouched here).

## Primary metric (fixed before any judged sim)

Population (same as trigger-b): player-reaching wave-4 instances
that never fought a WORLD fight, per seed, band-wide. For each,
FIRST-EPISODE contact turns = `monsterTurn` calls for that
instance with event index in [firstCoIdx, first departure marker)
— the first tile-change marker after first co-location (markers
are recorded by the instrument's monsterTurn wrapper on the first
call after the tile key changes, so the parting turn, which runs
BEFORE the position update, falls inside the episode; a later
return episode's calls fall after the marker). If no departure
marker follows, all of the instance's calls count, flagged
`firstEpFallback` (an upper bound, reported, not hidden).

Primary: first-episode contact-turn incidence = share of the
population with first-episode turns >= 1.

## GO bar (binding — judge only against this)

GO iff ALL of:
1. First-episode contact-turn incidence (armed) >= 1/2 of the
   population (baseline expectation from trigger-b: 1/18; the
   judged comparison is THIS run's matched baseline leg, not
   trigger-b's number — if this run's baseline differs, the
   1/2 bar still applies to the armed leg, and the baseline
   number is reported alongside).
2. Zero-turn player-left count (armed, population instances with
   subCause player-left AND first-episode turns = 0) <= 1/2 of
   the same count in THIS run's baseline leg.
3. Mechanism attribution: of the armed population instances with
   first-episode turns >= 1, at least half carry a `viaTravel`
   parting turn inside their first episode (the mechanism, not
   background movement, produced the turn).
4. Cost bar clean: starvation-caused fallen (fallen cause
   matching /starv|hunger/i) armed <= baseline + 2, AND median
   run-days armed >= 0.8 x baseline median. (If both legs show
   zero starvation fallen, the clause is satisfied 0 vs 0 and
   reported as such, not as evidence of anything.)
5. Instrument errors 0 on all judged seeds, both legs.
6. No new dead-end: wave-4 faced (world fights > 0) armed >=
   baseline faced count (the mechanism must not reduce facing),
   and no seed's run ends in an error state introduced by the
   hook (travel-abort-into-fight is a live fight, not an error;
   any `over` without a fight or death cause is reported).

A miss on any clause is NO-GO, never re-scored against a
friendlier metric mid-run. INSUFFICIENT-DATA only if more than
2 seeds carry instrument errors in either leg.

## Secondary metrics (reported, never substituted for the bar)

- Per-seed and band: player-left share among the population;
  world wave-4 fights; wave-4 kills; break/binding steps;
  wave-4 unlocks/faced; wave-5 unlocks/faced; readiness-5-ready
  days; scale-wall numbers (wins, national, table, wave 4-5
  unlocks, median survival) for both legs.
- Parting-turn outcomes: of all parting turns band-wide, how many
  committed to combat (travel aborted), warned, closed distance,
  or did nothing visible — from `viaTravel` mtCall records and
  the say sample (the parting line itself is captured via the
  SAY_PAT extension `/turn to leave/`).
- Sense-test: one real transcript line quoted in the evidence
  (the parting line firing on a real seed), plus a judgment of
  what the player sees when the stopped moment fires.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env, both legs. No policy variants.
- Seeds: 99101–99108, the gearbar band, 150d death-aware.
  Pilot scale: 8 seeds before/after on identical seeds before
  any confirm spend. No confirm in this run unless the pilot
  GOes and the coordinator asks for one — the brief judges the
  pilot.
- Instruments: trigger-b's probe + analyzer, copied (not
  overwritten) to `scripts/triggerbuild-*-20261105.js` with two
  extensions only: (a) `viaTravel` on mtCall records (stack
  names `travelTo`), (b) first-episode turn counts + the
  aggregates above in the analyzer, (c) SAY_PAT gains
  `/turn to leave/`. No other instrument change.
- Order (matched legs, no contamination): baseline leg runs
  FIRST on unmodified game code (instrument only, zero src/js
  — the game change is not yet in the tree), then the game
  change + proof land, then the armed leg. Baseline and armed
  corpora are separate RUN names under
  `evidence/2026-11-05/perseed-triggerbuild-b/`; the driver
  refuses overwrites.
- Balanced panel (§15): attempted on both corpora; the tool has
  refused recorder-corpus shape on every recent run (2330Z
  verbatim: "refusing recorder-corpus input: all 8 --current
  rows carry top-level anchorCommit"). If it refuses again,
  the refusal is recorded verbatim and the run is judged on
  the matched-seed prereg metric instead — never a fabricated
  compare.
- Proof: `scripts/test-triggerbuild-20261105.js` — travelTo
  parting-turn legs (turn fires + travel proceeds; ambush/
  territorial-commit aborts travel with a live fight; wave-3
  and lingerer exclusions; no-monster neutrality), plus
  analyzer first-episode fixtures (parting turn inside the
  episode, return-episode calls excluded, no-marker fallback
  flagged). Run via the shared harness; no concurrent jest
  (`--cacheDirectory=/tmp/jest-cache-sim-triggerbuild-b`).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the first-episode
  marker rule fairly counts parting turns (any instance where
  the parting turn fell outside the computed episode); whether
  the 1/2 incidence bar was the right strength (a mechanism
  that fires on every departure should in principle convert
  ~all first episodes — a lower bar would hide a firing
  failure); whether `viaTravel` attribution stayed clean
  (any baseline-leg `viaTravel` hit would mean another path
  calls monsterTurn from travelTo); whether the cost bar's
  starvation clause measured anything (zero-zero risk); and
  whether wave >= 4 scoping vs all-waves should be revisited
  by a later arm (not this one).
