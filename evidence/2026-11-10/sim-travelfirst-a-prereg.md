# Travel / roads — first numbers: pre-registration (arm sim-travelfirst-a)

Run fleshout-20261111T0315Z, Loop A. Coverage Program Tier 2 (Steve order
2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any judged
sim. Base commit ad6a04b27 (worktree sim-travelfirst-a).

## Canon

- docs/CANON.md read first. **docs/MAP.md IS the travel canon doc** (one map:
  home board, beyond-edge tiles, leg boards, macro map, region registry, way
  home). Nothing is invented here; the code citations below are the source
  of truth.
- Travel mechanics as coded:
  - `Game.travelTo(x, y, force, combatExit)` (src/js/game.js ~12651): the
    only scholar node-move. Refuses null (game over / mid-combat without
    combatExit / not an offered target) or returns a blockage object
    `{kind:'blockage', blockType, x, y}` (destination or intermediate
    blockage on a shortest path); success moves, says "Travel N tiles to
    <tile>.", may spring the scholar's own pit trap (50%, 15–25 dmg, can
    kill with cause 'your own pit trap'). **Node travel is FREE by the
    standing rule — no kcal tax, no tick cost for the boundary itself.**
  - `Game.walkHome(maxSteps)` (game.js ~11801): the compass action — walks
    home tile by tile through travelTo (orthogonal steps only), tries the
    other homeward axis, then sidesteps perpendicular, stops honestly with
    the block named. Returns {reached, steps, path, blocked, interrupted}.
    The policy has its OWN walkHome (scripts/policies/competent.js ~1271)
    — a different function; the engine one is the compass button (app.js),
    never called by the policy.
  - `Game.travelBlockage(x, y, fx, fy)` (game.js ~12161): block classifier —
    blockType creek (needsBridge, no swimmer ability) / fallen_tree /
    rubble / washed_out, guarding an approach side.
  - `Game.tryNodeExit(dx, dy)` (game.js ~12569): stepping off the 9x9 rim
    crosses to the next node (beyond-edge generation).
  - Villager travel is NOT travelTo: `npcNodeTravel()` (game.js ~17136)
    moves villagers once per day-part between world nodes, driven by
    objectives (src/js/villager-objectives.js: FORAGE, WATER, TRAPS,
    VISIT, HAVEN_CHORE, EXPLORE, REST, EAT, LEAVE, HUNT). Away ledger
    `state.village.away[vid] = {purpose, sinceDay, sincePart, duration}`;
    returns run `objReturnEffect` (forage deposits 'Foraged food',
    explore brings news, haul deposits unknown flesh).
  - Road legs: `Game.nomad.enterLeg(i)` / `departLeg()` (src/js/nomad.js
    ~303), `state.road = {active, partyIds, ...}`. The road gate is global
    rank + a living known-region scattered kin; a leg is a 3-day
    living/search wait, not a teleport. **competent.js contains NO nomad /
    enterLeg call** (grep-verified) — the road is never started under
    competent; `tableRoad` lives only in capable.js. Road legs are
    expected 0 and will be PROVEN 0 via wraps + snapshots, not assumed.
  - Policy travel callers (competent.js): `forageTripSeedFirst` (~1544,
    the expedition: nearest unrevealed tile, real travelTo + real
    checkEncounter), `walkTo` (~1199, hop-by-hop honest walk), policy
    `walkHome` (~1271, trip returns), `thirstWalkHome` (~1306),
    `goHomeStanding` (~1376, end-of-daily still-away walk home),
    `stoneRun` (~1536), `tbBarrierExit` (mid-combat, passes combatExit).
- Audit row: hidden_files/coverage-audit-20261110.md §4, Travel/roads —
  **Partial**: played by default driver (travelTo, walkHome,
  routeAround); `sweep-travel-baseline/r4/r5` (Oct); `sim-routeblock-b`
  Nov 10; 31 travel tests; **no panel metric**.

## What sim-routeblock-b measured — and what it did NOT

routeblock-b (evidence/2026-11-01/sim-routeblock-b.md, PILOT NO-GO) measured,
on a 30d competent window with DEPOSITGATE=0: failed-trip day share
(0.450 pooled, unchanged by the gates), mean daily haul, away day-ends
(0/240 both arms), standing-home fires (0), counted trip-home detour steps
(3, all on one seed). Its metric review prescribes exactly this arm: "the
next stranding question belongs to a longer-horizon or farther-travel arm,
with away day-ends as its primary — NOT a re-run of the gates on the 30d
competent window" — and "the NEXT route-shaped arm must pre-register an
engagement floor or pick a substrate where stranding actually occurs".

What routeblock-b did NOT measure (this arm's scope):
- Any horizon past 30d (median survival on 150d bands is ~120d; the 30d
  window cannot strand — 0 away day-ends on both arms).
- Villager travel at all (npcNodeTravel objectives, departures/returns by
  purpose, villager away-days, villager road deaths).
- Road legs (enterLeg/departLeg/state.road — never wrapped, never counted).
- Deaths by position (no death was ever located at haven vs away).
- Travel time cost (steps per day, dayTicks, parts spent away).
- Purpose classification of travelTo calls (only trip-home detours were
  counted; forage/walk-home/thirst/stone/barrier-exit calls were one
  undifferentiated mass).
- Beyond-edge crossings (tryNodeExit, max distance from haven).
- Away-evening CAUSES on a plain competent band (the nighttravel arms used
  screened/thief-grant substrates, not plain competent 150d).
- Wall numbers in-window (30d cannot measure national/table/wins).

## Backlog claim

sim-findings.md line 1385 — [open] 2026-10-28 — food-economy/travel —
BLOCKED PATHS DOMINATE AWAY EVENINGS (nighttravel-screened-b: 62 of 103
away evenings blocked paths vs 7 within-reach) — CLAIMED by this arm
2026-11-10 (marked [claimed] in sim-findings.md before the prereg commit).
This arm re-measures away-evening causes + blocked-hop type shares on a
fresh 150d competent band (Metrics 2–4); the line becomes [fixed] on
landing only if the fresh-band numbers confirm or refute the dominance
with a stated verdict in the evidence. Related open items NOT claimed
(they are lever builds, not this measurement): #1360 nightly-travel-home
lever, #1392 evening blockage-clearing, #1394 detour narration blank,
#1416 blockage census (needs a two-stage banked screen; this arm's
type shares are a fresh-band contribution, not the banked census).

## Pre-pilot substrate checklist (§14b)

1. **Contact**: travelTo fires under competent — proven by routeblock-b
   (116 successful-trip days / 8 seeds in 30d) and the Oct sweep-travel
   baselines. Engine walkHome: competent never calls Game.walkHome
   (policy has its own; engine walkHome is the app.js compass button) —
   the pilot will confirm the zero via the wrap + prove the wrap live in
   a fixture, not assume it.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio to
   size. The addressable pool is every travelTo call + every villager
   away-ledger entry on the band.
3. **Verb existence**: travelTo, walkHome, tryNodeExit, nomad enterLeg /
   departLeg, npcNodeTravel all exist in the engine. The policy calls
   travelTo via walkTo / forageTripSeedFirst / walkHome / thirstWalkHome /
   goHomeStanding / stoneRun; the road verbs exist but are never called
   under competent — that asymmetry IS one of the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 122.5–140d); travel runs from day 1, stranding is a
   late-window phenomenon the 30d window could not see, so no late-window
   risk — the long horizon is the point.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of travel/roads** —
every scholar travelTo call classified by outcome + caller, every
villager departure/return counted by purpose, every away evening
classified by cause, every road leg counted (including a proven 0),
every death located (haven vs away), every metric in the list below
counted or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every travelTo call classified by outcome + caller, none 'other' | 0 unclassified calls across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–9; sense-test scenes quoted |
| Engagement floor (routeblock-b prescription) | ≥100 travelTo calls band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 9)

1. Scholar travelTo calls: total, by outcome (moved / refused-null /
   blocked by blockType / combat-refused / over), by caller
   (forageTripSeedFirst / walkTo / policy-walkHome / thirstWalkHome /
   goHomeStanding / stoneRun / engine-walkHome / tbBarrierExit / other),
   steps per trip (consecutive calls between non-travel actions), max
   Chebyshev distance from haven reached, beyond-edge crossings
   (tryNodeExit calls + travelTo to outside-0..8 coords).
2. Engine walkHome calls: count, reached / steps / blocked-type /
   interrupted; policy walkHome detours (travelTo caller = competent.js
   walkHome, incl. routeAround steps when COMPETENT_ROUTE_AROUND is off
   — the default — vs on; the flag stays OFF, this is a measurement).
3. Away evenings / stranded nights: scholar not at haven at day end,
   per seed; consecutive-away-night runs (strands); cause bucket per
   away evening (blocked-path / too-far / combat / tent / other — from
   that day's travel records); within-reach share (nighttravel
   classification, re-run on a plain band); scholar-days away vs haven
   days share.
4. Blocked-hop census (claim #1385): refused travelTo calls by blockType
   (creek / fallen_tree / rubble / washed_out) + intermediate vs
   destination refusals; blocked-path share of away evenings; type
   shares vs nighttravel-screened-b (62/103 blocked) and blocktype-b
   (fresh-band census INSUFFICIENT-DATA — this arm's type shares are a
   fresh-band contribution, not the banked census).
5. Villager travel: departures by purpose (forage / explore / leave /
   water / traps / visit / guard / haul / hunt) from the away ledger;
   returns by purpose; away-days per purpose; roster away-days share;
   max node distance per villager; objectives (objOf purpose/state) at
   snapshot; hurt-returns.
6. Road legs: enterLeg / departLeg calls (expected 0 under competent —
   proven via wraps + daily state.road snapshots); state.road active
   days; leg index reached; road departures/arrivals/arrival failures
   (all expected 0 — the zeros ARE the finding, with the mechanism named:
   competent never calls Game.nomad.start()).
7. Road deaths: every death located — scholar deaths by position at the
   tele('death') fire (at haven vs away, Chebyshev distance, dayPart);
   villager deaths by away-ledger state + node at death; cause
   breakdown for away deaths vs haven deaths; pit-trap travel deaths;
   travel vs haven days share at death.
8. Travel time cost: travelTo steps per scholar-day; scholar.dayTicks at
   day end (512 = a full day); day-parts with ≥1 travelTo call; parts
   spent away; days where travel displaced the day (travel steps while
   dayTicks near cap — reported as distribution, NOT a per-step tick
   price the engine does not charge).
9. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: travel is a whole-life question and stranding is a
  late-window phenomenon — the 30d routeblock-b window saw 0 away
  day-ends; sibling first-numbers pilots (cookfirst-a, preserve-a,
  fishfirst-a) ran 150d with median survival 122.5–140d, so 150d
  captures the full village life without ticking dead villages. Same
  horizon as the siblings for comparability.
- **Seeds: 180249–180256 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 180249–180256: zero
    hits (grep over all dated preregs; the only 1802xx seeds named
    anywhere in preregs are 180201/180208 cookfirst-a, 180209/180216
    preserve-a, 180217/180224 named in the preserve prereg as
    gardening's band, 180225/180232 named in the preserve prereg as its
    reserved confirm band, and 180233–180240 fishfirst-a).
  - Searched all dated evidence `.md` for 180249–180256: zero hits.
  - Searched all of evidence/ for the standalone 6-digit seeds 180249
    and 180250–180259 (word-boundary grep): zero hits. The only
    substring hits are fragments of longer numbers, not seed namings
    (7180249, 18024968635291, 0817180249, 1802504210361 — 13-digit ids
    inside old JSON corpus files, e.g. radsnap-a s96301, lqpersist-b
    s9760, wilddeath-cause panel cases).
  - No perseed directory names any seed 180249–180256.
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked; only preregs matched "band").
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + all dated evidence `.md` + full-tree
    word-boundary seed grep + perseed directory names + goal
    hidden_files listing. The coordinator's pre-spawn verification
    (fresh across ALL dated preregs and evidence .md files, no hits) is
    independently re-verified here and holds.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change. COMPETENT_ROUTE_AROUND
    stays OFF (default) — the gates are routeblock-b's killed lever, not
    this arm's question.

## Instrument

scripts/travelfirst-instrument-20261110.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- travelTo: every call — from/to, force, combatExit, return class
  (moved / refused-null / blocked:{blockType, intermediate?} /
  combat-refused), position change, day, part, caller frame (first
  engine/policy frame → forageTripSeedFirst / walkTo / policy-walkHome /
  thirstWalkHome / goHomeStanding / stoneRun / engine-walkHome /
  tbBarrierExit / other). The party.js wrapper stays underneath (this
  wrap installs after loadGame; it wraps the party-wrapped travelTo and
  calls through).
- walkHome (engine): every call — from, reached, steps, blocked type,
  interrupted, path length.
- tryNodeExit: every beyond-edge crossing attempt — direction, result,
  position change.
- nomad.enterLeg / nomad.departLeg: every road-leg entry/exit (expected
  0 under competent — proven live in fixture).
- tele('death'): death position — scholar pos + haven + Chebyshev
  distance + dayPart at the fire; villager deaths: npcNode + away-ledger
  purpose at death. (The harness wraps tele inside runDays AFTER this
  instrument installs, so the chain is harness → instrument → engine;
  the record fires inside.)
- Daily snapshot: scholar pos + Chebyshev distance from haven + atHaven,
  dayPart, scholar.dayTicks, away-ledger entries (vid/purpose/sinceDay/
  duration), villager nodes (npcNode per vid) + objectives (objOf
  purpose/state/target), state.road (active/leg/supplies), roster size,
  deaths today (from the harness sample, reconciled by day).
Driver: scripts/travelfirst-driver-20261110.js (mirrors fishfirst-driver;
Game.say wrap with a travel regex for the sense corpus, 200 lines/seed
cap — same early-game-only caveat as fishfirst-a, narrowed regex:
travel|walk home|heading home|blocked|fallen tree|rubble|washed out|
creek|detour|going around|stranded|too far|bed down). Analyzer:
scripts/travelfirst-analyze-20261110.js. Proof:
scripts/test-travelfirst-a.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b, cookfirst-a, preserve-a,
fishfirst-a). The control/neutral legs are the neutrality proof, not a
panel. Panel context: **no panel metric for travel** (coverage audit §4).

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (fishfirst-a: median survival 122.5d, 7/8 village-lost, 650 deaths
over 869 village-days). If the instrument changes any numeric field vs
the recorder-free baseline, the arm is NO-GO on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
