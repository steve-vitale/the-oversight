# sim-herald-b — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop B worker, axis scale-onramp, follow-up to sim-killconv-a and
sim-w4field-a. Arm type: MEASUREMENT ONLY (DIAG) — no game-code change,
no policy-default flips, no existing policy file edited. The gating
freeze (Steve 2026-10-27/28) stands. This arm measures refusal, it does
not build a lever for it. No roster/list-fed fix will be proposed for
anything found (Steve 2026-10-28 perception law: villagers know who's
around only through their own senses).

## Question (from sim-killconv-a, evidence/2026-10-30/sim-killconv-a.md)

Killconv's instrument note (NOT meetings): 40 startCombat calls against
the Herald produced no fight — 35 on seed 85106 (days 95–130), 5 on seed
85112 (day 77) — all excluded from killconv's 63 started meetings.
Sim-w4field-a later measured 30 wave-4 field meetings (3 evades, 20
fled, 7 died, 0 killed), of which 3 were Herald field fights (all
vFlee, all seed 85106). This arm answers: how much of the published
meeting counts is refusal-inflated, and what refusal IS in code?

## Ground facts (verified against code on THIS base, not quoted)

- `Game.startCombat(monsterId, options)` (src/js/game.js, `startCombat`):
  the ONLY in-body refusal is the live-fight guard — if `tbfight` is
  live and not over, it says "Already in a fight — finish this one
  first. (startCombat refused: a fight is live.)" and returns. An
  unknown id THROWS ("startCombat: unknown monster id ... — no silent
  fallback"), which is not a refusal. On a fought start, the pending
  encounter is cleared inside the body (game.js ~33824).
- `titanWrapCombat` (src/js/titans.js, `titanWrapCombat`, installed at
  load): wraps `Game.startCombat`. For a titan id (keys of
  src/data/titans.json minus `_`-prefixed entries: herald, finale,
  nielsen, the_network — monster id `herald` IS the titan key):
  - campaign-entry gate override (`Game.titanEntryGate`) answering
    not-ok -> says the gate reason, logs a game-side
    `state.titans.outcomes` record `{outcome:'refused', gate:'campaign'}`,
    returns null. No fight, no pending clear (the wrapper returns
    BEFORE the original body runs).
  - else the HARD GATE: `titanMusterReady(titanId)` false -> says
    "⛔ <Title> does not notice you the way prey notices a hunter...
    sound the call, muster <minAllies> allied blades (you have
    <have>). This is not courage. This is arithmetic.", logs a
    game-side outcomes record `{outcome:'refused', gate:'muster'}`,
    returns null. Again before the original body: pending (if any)
    survives, the world monster stays on its tile.
  - else the fight is built by the original, allied fighters are
    injected (`titanInjectAllies`), and a game-side outcomes record
    `{outcome:'fought'}` is logged.
  - Herald gate numbers (src/data/titans.json, `herald`): minAllies
    10. Monster data (src/data/monsters.json, `herald`): wave 4,
    aggression "heraldic", HP [700,900], "It does not attack. It
    ARRIVES."
- `finaleWrapCombat` (src/js/finale-campaign.js) adds further gates
  only for `finale_crew` / `finale_opening` (march order, surviving
  muster floor); it does not gate `herald`.
- `monsterWavePool` is titan-wrapped to EXCLUDE titans
  (src/js/titans.js): titans never spawn in the wild pool; they arrive
  by omen and are placed by `titanPlace` (lair tile). A titan on a
  tile can still be approached: the competent-policy hunt
  (scripts/policies/capable.js, deedHunt) walks to a known monster
  and calls `Game.startCombat(here.id)`, and checks afterwards
  whether a fight is live. A refused call therefore leaves the target
  in place for a later day's hunt — the repeat-loop hypothesis the
  census must confirm or refute from the stack traces, not assume.
- Field fights are a SEPARATE resolver: `fieldFight`
  (src/js/fieldFights.js) is not wrapped by the titan gate. A villager
  meeting the Herald in the wild fights it (w4field: 3 such fights,
  all vFlee). Refusal is a scholar-TB-channel phenomenon; it cannot
  inflate field-fight counts, and field-fight kills cannot be created
  or removed by correcting TB attempts.

## Instrument (new, read-only, this arm)

scripts/herald-instrument-20261030.js (HERALD=1), wrapping call-through
only: zero game-state writes, zero RNG draws, zero `Math.random` calls.
Wraps:
- `Game.startCombat` — every call. Before-hook (pure reads only):
  resolved mid (arg, else `pendingMonsterId` at entry, else null),
  monster wave + aggression from data, live-fight flag at entry,
  pending flag + pendingMonsterId at entry, titan muster state at
  entry (muster record present, raw allied count, haven-blade count,
  `titanMusterReady` boolean when the function exists), scholar tile
  vs world-monster tile when a world entity exists, and the call
  stack's top function names (for caller classification; no file
  contents, no arguments beyond the mid). After-hook: new-tbfight
  flag (fight id changed), return value, thrown error class if any,
  pending flag after, game-side titan outcomes record appended during
  the call (read, never written), and the say-ring lines emitted
  during the call (refusal line capture). Classification (in this
  order): THROW if it threw; FOUGHT if a new tbfight exists;
  REFUSED otherwise, with reason code: FIGHT-LIVE if a fight was
  live at entry; MUSTER-GATE if the game-side outcomes record for
  the call is refused/gate-muster, or the refusal say-line is
  present, or the titan was muster-not-ready at entry; CAMPAIGN-GATE
  if the outcomes record says gate-campaign; OTHER otherwise (must
  be explained, never silently folded into MUSTER-GATE).
- `Game.tbEnd` — fought-TB outcome per fight id (join key to FOUGHT
  attempts; result string as given).
- `Game.fieldFight` — wave>=4 field meetings only, reusing the
  w4field record shape in miniature (day, vid, mid, wave, outcome,
  rounds, mDealt, vTaken, mHpLeft, vHpLeft) so the corrected
  field-fight numbers are measured on THIS band, not quoted.
- `Game.recordWaveKill` — wave>=4 kills only (day, mid, killer vid,
  via), the kill numerator for the corrected rates.
- `Game.soundTitanCall`, `Game.titanCommitOwn`, `Game.titanWarCouncil`
  (when present) — muster events only (day, titan, allied/haven
  counts after the call, pure reads). These explain what the driver
  did BETWEEN refusals; they are not counted as meetings.
- `Game.say` — narration ring buffer (last 400 lines), transcript
  source only. First-refusal and late-repeat Herald stretches are
  captured as ring slices, not whole-run narration.
- `Game.sleep` — daily census (day, unlocked wave, scale rank) only,
  for wall numbers and for dating muster state. No standing/readiness
  reads inside the sleep wrapper (killconv's sleep-wrapper reads are
  the prime suspect for its s85112 day-49 perturbation; this arm
  avoids them entirely — see metric review note in the final evidence).

Caller classification (from the captured stack top, in order):
policy-hunt if a capable/deedHunt/capHunt frame is present;
contest if a contest frame is present; feast-draw if a
faceFeastDraw/feastDraw frame is present; wild-contact if a
monster-movement/bump frame is present and no policy frame is;
other-game if any other game frame tops the stack; unknown if no
frame is captured. The raw stack-top names are stored per attempt so
the classification is auditable, not asserted.

## Primary metric

A complete startCombat-attempt census over the band: every startCombat
call resolving to a wave>=4 monster, classified FOUGHT / REFUSED
(with reason code) / THROW. Refusal rate (wave-4, all monsters) =
REFUSED / (FOUGHT + REFUSED); THROW reported separately and never
counted as refused. Herald refusal rate = the same ratio restricted
to mid `herald`. Completeness = classified attempts (FOUGHT or
REFUSED) / all wave>=4 startCombat attempts captured; cross-checks:
(i) every tbEnd wave-4 fight joins to a FOUGHT attempt; (ii) every
game-side titan `refused` outcomes record in-band joins to a REFUSED
attempt on the same titan and day. Both cross-check match rates are
reported; a mismatch is an instrument flag, not a dropped row.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: completeness >= 95% on the full band, cross-check match
  rates >= 95%, instrumentErrors = 0, >= 30 wave-4 startCombat
  attempts in the full band, AND a band verdict stating (a) the
  refusal rate overall and for heraldic, (b) the corrected
  fought-only TB numbers and fought-only field numbers with
  kills/flees/deaths recomputed, and (c) whether the published
  0-field-kill headline survives the correction (it must be judged
  on fought field fights only — refused TB attempts were never field
  fights, so a survival verdict must say so explicitly rather than
  implying refusals inflated the field count).
- DIAG-NO-GO: completeness < 95%, or either cross-check < 95%, or
  instrumentErrors > 0 with no read-only explanation, or fewer than
  30 wave-4 startCombat attempts in the full band.
- INSUFFICIENT-DATA: fewer than 8 usable seeds, or no wave-4
  startCombat attempt at all in the band.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: instrument fires on all 8 pilot seeds with zero
instrument errors; seed 85106 reproduces a Herald refusal cluster
(>= 20 Herald REFUSED attempts, all MUSTER-GATE or CAMPAIGN-GATE,
0 FOUGHT Herald attempts — killconv recorded 35 on this seed, so 20
allows drift without moving the goalpost); every pilot wave-4 TB
fight joins to a FOUGHT attempt. Pilot size is NOT the verdict: the
confirm carries it. If the pilot fails, the run stops at pilot and
the verdict is DIAG-NO-GO (or INSUFFICIENT-DATA if the no-attempt
clause triggers).

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's `Game.over` (village
lost or won). Identical to killconv/w4field: wave-4 door openings ran
as late as day ~165 in prior bands, and killconv's Herald cluster ran
to day 130, so a shorter cap would censor the refusal tail; the
death-aware stop keeps cost at the survival distribution.

## Seeds (exact literals — the killconv/w4field band, for comparability)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112, 85113, 85114,
  85115, 85116 (16 seeds total).

## Policies (single-base measurement; no control leg by design)

Identical to killconv/w4field, every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + HERALD=1 instrument. Policy-side only, no game change.

## Re-attempt / subsequent-behavior measures (reported, not judged)

Per titan-run (seed x titan): attempt count, first/last day, span,
max attempts on one day, gaps between consecutive attempts, muster
events between first and last refusal (calls, councils, commits,
allied/haven counts after each), whether the titan ever reached
FOUGHT in-band, and whether a refused titan's world entity was still
present at run end (pure end read). The question "does the villager
re-attempt, how many times, does anything else happen" is answered
from these rows plus the transcript stretches — not from counts
alone.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival (game
days), plus: wave-4 startCombat attempts by class and reason, wave-4
field meetings by outcome, wave-4 kills by channel (TB vs field).

## Panel (§15)

Single-base measurement: no before/after comparison exists in this
arm, so `scripts/balance-panel.js` does not apply. No panel compare
is attached and none is fabricated. (A later lever arm reusing this
corpus as its baseline runs the panel then.) Same declaration as
sim-killconv-a and sim-w4field-a.

## Sense-testing (SENSE-TESTING LAW)

Read at least one full Herald transcript stretch: the say-ring slice
around the FIRST refused Herald attempt on seed 85106, and the slice
around a LATE repeat (day >= 120 if one exists, else the last
refusal), plus one Herald field-fight record from this band's own
capture. Judge: does the game narrate WHY no fight starts, does the
refusal line land as an explanation a person would understand, does
anything change between the first and the twentieth refusal, and
does the villager's subsequent behavior read as a person reacting
or a driver hammering a button? Counts alone do not pass this arm.

## Known instrument-hygiene flag (carried, not assumed)

Killconv seed s85112 was irreproducible on its base (15 other seeds
replayed identically; w4field's pristine re-run matched w4field, not
killconv, diverging at day 49 — before any wave-4 fight). If any seed
in this band fails to replay against the killconv/w4field corpora,
it is reported as an instrument flag with the divergence day, not
silently dropped, and the verdict states whether the flag touches
the refusal numbers (it touches them only if the divergent seed
carries Herald attempts).

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
