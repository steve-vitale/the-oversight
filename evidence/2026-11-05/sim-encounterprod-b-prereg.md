# Pre-registration — arm sim-encounterprod2-b (Loop B run fleshout-loop-b-20261105T0330Z)

DIAGNOSTIC + ONE POLICY-SIDE PROBE, zero src/js game changes. No
gate/price/deed/readyDemand/VETSHAPE-default change. If the probe GOes,
the game-code build is a NEXT run's arm, not a silent addition here.
This arm takes the 0330Z run's arm 2 (wave-4 encounter production,
upstream of the trigger): why do some seeds never unlock wave 4, and
why do unlocked seeds never meet it?

Context (NOT re-judged here): vetprod-b's 99101–99108 tie included
NEVER-FACED seeds (99102/99106 unlocked-but-unmet, 99107/99108 never
unlocked) vs killed-dead-killer seeds, 0 FACED-NO-KILL. Trigger-b
(2330Z, DIAG-GO) found the player never stops on spawn tiles
(player-left-the-tile 18/18) — the trigger BUILD is a held arm, not
this one. This arm's question is upstream: encounter OPPORTUNITY.

## Corpus

- Band/seeds: 99141–99148 (8 seeds, fresh — no overlap with
  99101–99108, 99111–99126, or any prior arm's band).
- Policies: baseline = competent policy VERBATIM; probe = competent +
  seek sorties (scripts/policies/competent-encseek-b.js), both on the
  SAME seeds. Default env.
- Horizon: 150d death-aware (dead villages stop simulating, +10d tail
  max), same as vetprod/standaccum2/trigger-b.
- Instrument: scripts/encounterprod-instrument-20261105.js (spawn/cast/
  fight wrappers after trigger-instrument-20261104's proven pattern;
  daily snapshots extend the vetprod snapshot with the wave-4 unlock
  components w2pts/bar2/dayFloor/gated/t4/scaleRank). unlockedWave()
  is NEVER called mid-run (standaccum parity: the gated snapshot
  already calls the side-effecting villageStandingTotal daily; an
  extra unlockedWave call would double-call it).
- Driver: scripts/encounterprod-driver-20261105.js. Analyzer:
  scripts/encounterprod-analyze-20261105.js. Proof:
  scripts/test-encounterprod-20261105.js (analyzer fixtures for every
  class + sub-cause, seek cleanliness leg, live smoke, determinism,
  instrument neutrality, seek hook-preservation + engagement legs).
- Pilot gate: these 8 seeds ARE the pilot (brief: pilot 8 seeds).
  Confirm 12–16 fresh seeds ONLY on pilot GO, same design.

## Definitions (fixed before any judged sim)

- unlockDay = first snapshot day with day >= dayFloor (25, from
  waveLedgerCfg) AND w2pts >= bar2 (5) AND gated >= t4 (100, from
  standingCfg). This is the derived wave-4 unlock day (unlockedWave()
  returns 4 exactly when day >= dN, pts(2) >= bar[2], standing >= t4,
  given wave 3 already unlocked — wave 3's rung, day >= dN and
  pts(2) >= bar[2], is the same condition minus standing, so the
  derived day is the wave-4 day whenever the w3 rung is met first,
  which the snapshot sequence shows).
- unlocked = unlockDay != null OR finalize unlockedWave >= 4 OR
  maxWave >= 4. A seed meeting the derived rungs counts as unlocked
  even if finalize disagrees; the disagreement is flagged as
  unlockMismatch and investigated, never silently resolved.
- faced = >= 1 wave-4 fight (any channel, any stack class) in
  t.fights. Wild-only faced (cls == 'world') is reported separately.
- class = UNLOCKED-FACED / UNLOCKED-UNMET / NEVER-UNLOCKED.
- Primary sub-cause (exactly one per unmet/never-unlocked seed):
  - NEVER-UNLOCKED: DIED-EARLY (village lost before dayFloor) |
    LEDGER (survived to dayFloor, final w2pts < bar2) |
    STANDING (dayFloor met, w2pts >= bar2, gated peak < t4) |
    NON-COINCIDENT (each rung met at some point, never together) |
    ANOMALY (derived rungs met yet no unlock — reachable only via
    the unlockMismatch flag on the UNLOCKED side; listed here for
    completeness of the census table).
  - UNLOCKED-UNMET: NO-SPAWN (zero post-unlock w4 spawns, spawn day
    >= unlockDay) | SPAWN-NO-TILE (spawns > 0, zero on-player-tile
    w4 spawns post-unlock) | TILE-NO-FIGHT (on-player-tile w4
    spawns > 0, zero w4 fights). For TILE-NO-FIGHT seeds, the
    departure sub-mechanism is trigger-b's proven result
    (player-left-the-tile, first-episode rule), cited — not
    re-derived with monsterTurn traces in this arm.
- Post-unlock windows use spawn/fight day >= unlockDay (unlockDay is
  a snapshot day, so same-day spawns count as post-unlock).

## Seek probe (fixed here, not improvised mid-run)

competent-encseek-b: competent verbatim + ONE pre-step per day. The
player remembers tiles where a tile-entry spawn was ANNOUNCED
("Something moves out there — ...", heard while standing on that
tile) on an EARLIER day, or where a monster stands on the player's
own tile at a daily start. At most one seek step per day, only from
a safe tile, only to an unsought remembered tile from an earlier
day: honest travelTo (never forced) + ONE forage action (competent's
normal on-tile behavior), then competent.daily runs as usual.
Bounds: memories expire after 14 days, at most 5 kept, a sought tile
is never sought twice, travel failure or a starting fight ends the
step with no second try.

PERCEPTION LAW: the memory uses only announced lines + own-tile
perception. It NEVER reads a roster or world array (cleanliness leg
asserts the absence of those tokens in the policy file, comments
included). WAVE-AGNOSTIC (stated, not hidden): the spawn line names
the village display name, never the true id or wave, so a remembered
tile is not known to hold a wave-4 beast; post-unlock, tile-entry
spawns are ~60% newest-wave by spawnWaveTarget, so the probe still
biases sorties toward wave-4 opportunity without claiming wave
knowledge the player does not have.

## PRIMARY metric + GO (both clauses, else DIAG-NO-CANDIDATE)

- Clause A (mechanism concentration): ONE sub-cause accounts for
  >= 50% of the unmet/never-unlocked seeds (problem seeds =
  UNLOCKED-UNMET + NEVER-UNLOCKED, baseline arm).
- Clause B (probe movement): seek faced-seeds >= baseline faced-seeds
  + 2 (same 8 seeds, faced = any wave-4 fight).
- GO (for a BUILD candidate) iff Clause A AND Clause B both hold.
  Otherwise DIAG-NO-CANDIDATE, with the mechanism census as the
  deliverable. A miss is NO-GO, never re-scored against a friendlier
  metric mid-run.

## Secondary (reported, never re-scored)

Wall numbers (national / table / wins, wave 4–5 unlocks, wave-4
faced, wave-5 faced, median survival); unlock-day distribution;
fights per unlocked day; post-unlock spawn counts by source
(checkEncounter / background / other) and on-player-tile share;
seek-call counts (calls / arrived / fightStarted); sense-read of
one unmet seed's transcripts (did the village know a monster was
near? — spawn say lines + wanderer announcements vs any fight).

## Balanced panel (§15)

INAPPLICABLE as a before/after Game-root comparison: this is a pure
diagnostic census plus a policy-side probe with no Game-root change,
so there is no before/after pair to run through balance-panel.js.
The baseline-vs-seek comparison on identical seeds IS the probe's
control, reported as faced-seed counts, not fabricated into a
panel compare.

## Metric review (to be completed in the evidence file)

To be written after the judged runs: whether the derived unlock day
matched finalize unlockedWave on all seeds, whether any sub-cause
definition proved wrong, and any revision proposed for the NEXT run.
