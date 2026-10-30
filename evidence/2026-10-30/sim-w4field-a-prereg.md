# sim-w4field-a — PRE-REGISTRATION (written BEFORE any sims, 2026-10-30)

Run: Loop A, axis scale-onramp, follow-up to sim-killconv-a.
Worktree: ~/workspace/worktrees/sim-w4field-a, branch sim-w4field-a.
Arm type: MEASUREMENT ONLY — no game-code change. The gating freeze
(Steve 2026-10-27/28) stands. This arm decomposes a measured cliff, it
does not build a lever for it.

## Question (from sim-killconv-a, evidence/2026-10-30/sim-killconv-a.md)

On an identical-seed band, villagers met wave-4 beasts in the wild
35 times and killed 0 (24 fled, 7 died, 4 evaded), while scholar TB
fights won 3/28. Killconv proved the wave-5 bar shortfall is
OPPORTUNITY (16/16) and that the opportunity failure sits at the
field fight itself. This arm opens the field fight: for each wave-4
field fight, what actually happened inside it — damage dealt vs beast
HP, rounds, outcome, flee trigger, party size, gear, wounds both ways,
scholar-party vs lone — and which of those is the binding factor.

## Ground facts (verified against code on THIS base, not quoted)

- `fieldFight(vid, mdef, m, opts)` (src/js/fieldFights.js) resolves
  blow-by-blow and returns a record: outcome (evade|vKill|mFlee|vFlee|
  vDie|alreadyDead), rounds, vTaken, mDealt, vHpLeft, mHpLeft, plus
  morale diagnostics: partySize, allyDealt, calledHelp, fleeHopeless,
  fleeLearn, fleeHpFrac, everWinning, everHopeless, minHpFrac,
  roundTotals, volley, intent/intentWhy, log[].
- Morale (fieldFights.js ~1500-1730): from round 2, hopeless =
  rounds-to-drop-villager < rounds-to-drop-lead x 0.85; winning =
  rounds-to-drop-lead <= rounds-to-drop-villager x 1.1. Learn-intent
  villagers withdraw at round >= 3 when not winning (fleeLearn).
  Hopeless-and-alone flees (fleeHopeless); a low-HP floor flee fires
  any round (fleeHpFrac, fleeHopeless = the round's hopeless flag).
  Round cap (15) disengages the worse-off side. Monster break line
  mBreak = 0.15 (wave >= 2): lead below 15% HP flees (mFlee).
- Wave-4 bands (docs/MONSTER-WAVES.md, anchored): damage 35-95,
  HP 850-1500, pierce 0.2-0.5. A mid build deals ~64 dmg/round in TB
  terms; field-fight villager damage uses weaponBonusOf folded
  (melee+ranged)/2 plus a bow volley opening.
- Canon: docs/CANON.md + docs/MONSTER-WAVES.md read first. No canon
  doc covers a field-fight decomposition — none is invented here.

## Instrument (new, read-only, this arm)

scripts/w4field-instrument-20261030.js (W4FIELD=1), wrapping
`Game.fieldFight` call-through only: zero game-state writes, zero RNG
draws. Before-hook reads (pure): fighter vid, monster id + hp range,
world-entity hp/maxHp when present, villager HP at entry, worn armor P
(`S.equipment.armorOf`), melee/ranged weapon bonus, ranged weapon id,
opts party (allies, allyVids), scholar identity. After-hook records
the returned record's fields (rounds, outcome, vTaken, mDealt,
allyDealt, vHpLeft, mHpLeft, partySize, calledHelp, allyVid,
fleeHopeless, fleeLearn, fleeHpFrac, everWinning, everHopeless,
minHpFrac, volley, intent/intentWhy, roundTotals, log[] copy).
Beast max HP: entity maxHp when the world entity carries it (ground
truth); otherwise mHpLeft + mDealt (estimate — valid when the lead
took all recorded damage and never healed; flagged `hpBasis` so
estimated fights are auditable, and any fight where the estimate
falls outside the mdef hp range is flagged, not silently trusted).
Flee-trigger classification (from the record, in this order):
evade -> EVADE; vKill -> KILL; mFlee -> DRIVE-OFF; vDie -> DEATH;
vFlee + fleeLearn -> LEARN-WITHDRAWAL; vFlee + fleeHopeless -> HOPELESS;
vFlee + round-cap log line -> ROUND-CAP; vFlee otherwise -> FLOOR.
Fighter class: scholar-party if vid is the scholar or the scholar is
among allyVids; else party if partySize > 1 or help was called; else
lone. Gear class: armored if worn armor P >= 10 (the wave-4 readiness
demand), else unarmored.

## Primary metric

Attribution distribution over FAILURE fights: fought (non-evade)
wave-4 field fights ending vFlee or vDie, each assigned exactly one
flee/death class above. Kills and drive-offs are successes, reported
separately, never folded into the failure denominator.

## Binding-factor rule (stated now, judged later, never re-scored)

A class is THE binding factor iff it holds > 50% of failure fights.
If no class clears 50%, the verdict is NO-SINGLE-BINDING and the top
two classes are reported with shares. Two mechanism checks ride
alongside (they explain the classes, they do not override the rule):
(a) median damage fraction mDealt / beastMaxHp across fought fights —
below 0.35 means the beast was barely scratched when the fight ended,
so damage shortfall underlies the flee classes whatever their split;
(b) party-vs-lone and armored-vs-unarmored outcome splits — a >= 2x
drive-off/kill rate for party or armored fighters would name
solo-vs-party or gear as the actionable lever even when the flee
class splits.

## DIAG verdict thresholds (judged against this header)

- DIAG-GO: instrument field-complete on >= 95% of captured wave-4
  field fights, replay-identical fights vs the killconv corpus on
  pilot seeds (day/vid/mid/outcome/rounds/mDealt), AND >= 10 fought
  wave-4 field fights in the full band for a classifiable
  decomposition.
- DIAG-NO-GO: instrument incomplete on > 10% of captured fights, or
  a replay mismatch with no read-only explanation.
- INSUFFICIENT-DATA: fewer than 8 fought wave-4 field fights in the
  full 16-seed band, or fewer than 8 usable seeds.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's `Game.over` (village
lost or won). Identical to killconv: wave-4 door openings ran as late
as day ~165 in prior bands, so a shorter cap would censor the climb;
the death-aware stop keeps cost at the survival distribution.

## Seeds (exact literals — the killconv band, for direct comparability)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112, 85113, 85114,
  85115, 85116 (16 seeds total).
- Pilot GO gate (sniff test, §9): instrument fires on all 8 seeds
  with zero instrument errors; every captured wave-4 field fight is
  field-complete; fights replay-identical to the killconv corpus on
  the same seeds. Pilot size is NOT the decomposition: killconv showed
  fights concentrate on few seeds (21 on s85109 alone), so the pilot
  validates the instrument and the confirm carries the verdict.

## Policies (single-base measurement; no control leg by design)

Identical to killconv, every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + W4FIELD=1 instrument. Policy-side only, no game change.

## Panel (§15)

Single-base measurement: no before/after comparison exists in this
arm, so `scripts/balance-panel.js` does not apply. No panel compare
is attached and none is fabricated. (A later lever arm reusing this
corpus as its baseline runs the panel then.)

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median survival (game
days), plus: wave-4 field fights by outcome, kills, drive-offs,
median damage fraction, median rounds.

## Sense-testing (SENSE-TESTING LAW)

Read at least one full fight record (log[]) per outcome class
present (evade / vFlee-learn / vFlee-hopeless / vFlee-floor /
vDie / drive-off / kill if any) and judge whether it reads as a
real fight with consequences — not just counts. Killconv's metric
review #2 noted field fights resolve through the record, not the
say stream; this instrument therefore captures rec.log itself.

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
