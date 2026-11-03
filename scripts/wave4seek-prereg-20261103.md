# Pre-registration — sim-wave4encounter-lever (Loop A 20261103T0115Z)

Axis: scale-onramp. Arm question: does actively seeking wave-4 monsters
convert the known zero into deeds? Context: seed 97339 reaches NATIONAL
and unlocks wave 4 yet records ZERO wave-4 fought in 92 days
(evidence/2026-11-02/sim-scale-onramp-round-0011.md; probe
scripts/fullseat-97339-probe-20261103.js). Full-seat gate at run end:
w1 14, w2 9, w3 6, w4 0 (need >=3), w5 0 (need >=2) — binding list
["w4", "w5"] only.

## Primary metric

Distinct wave-4 monsters fought per seed = count of deed-feed
(`Game.deedState().wavesFaced`) entries whose wave is 4 at run end.
A fight counts when the engine records it (recordDeedFight on real
blow-by-blow fights; fled fights count — the deed is "faced", not
"killed"). Secondary (descriptive, never judged): wave-4 unlocked
(unlockedWave() >= 4), days survived, end reason, national/table/won,
patrol days (variant only), w5 faced.

## GO threshold (binds the run, MEASUREMENT.md §14)

GO iff >= 2/8 pilot seeds record >= 1 wave-4 fought under the VARIANT
vs 0/8 under the BASELINE on identical seeds. Anything else = KILLED.
A miss is NO-GO, never re-scored against a friendlier metric mid-run.

## Horizon + why

180d death-aware cap, matching the prior closecommit bands (1715Z/1825Z
drivers, round-0011). Dead villages stop simulating (harness runDays
ends at over/village-lost); no fixed-200d tail. 180d covers the
national/wave-4 window (97339 sat at d92) with room for patrol days
to accumulate after unlock.

## Seeds (pilot)

98301-98308. Freshness: verified by repo-wide exact-token grep before
any judged sim (no prior use as a sim seed; the only hits allowed are
this prereg and its own results). If any seed shows prior judged use,
the whole band falls to 98401-98408 and this file is amended BEFORE
any judged sim runs.

## Policies (POLICY-SIDE ONLY, zero game-code change)

- BASELINE ("closecommit"): the verbatim stack from
  scripts/fightoutcome-driver-20261102.js — tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag + titanroute + musterclose +
  mustergap. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald. One process per seed.
- VARIANT ("closecommit+wave4seek"): baseline + ONE new policy file,
  scripts/policies/wave4seek.js (`withWave4Seek` wrapper, deed-seeking
  patrol pattern). While wave 4 is unlocked AND distinct wave-4 faced
  < 3, patrol DAILY over up to 4 far wild tiles via travelTargets/
  travelTo + forage on arrival. Fight behavior UNCHANGED from baseline
  (this arm tests encounter opportunity, not fight tactics).

## Perception-law compliance (hard constraint)

The seek uses ONLY legitimate in-game knowledge channels, verified by
code reading before this prereg was written:

- Wave-4 unlocked: Game.unlockedWave() — the unlock is ANNOUNCED
  in-game (checkWaveUnlockBeat, "The Mirror Draft" beat). Player
  knowledge, not engine peeking.
- Deed progress: Game.deedState().wavesFaced — the village's OWN
  fight history. Not a roster.
- Destinations: Game.travelTargets() — the player's OWN revealed map.
  Tile choice farthest-first, undirected.
- NEVER read: Game.worldMonsters(), Game.nearestWorldMonster(),
  Game.monsterAt(), any monster position/roster/link list. The policy
  never knows where a monster is, so it never travels toward one.

Channel survey (why no targeted travel exists): perceptionHints()
(src/js/perceive.js) fires only for a monster on/adjacent to the
player's own tile (distance <= 1, <= 2 if observant) — by the time it
fires you are already on the monster. Scout reports map tiles, never
monster positions. The muster beat names a threat near Haven with no
tile. The titan lair report (tile x,y) is titans-only. No gossip,
rumor, or scout channel in the code reports a wild monster's position.
Consequence, pre-registered: if undirected patrol does NOT convert
the zero, the finding is that NO policy-side seek can — a targeted
seek would need a new in-game reporting channel, i.e. a game change,
which is out of scope for this arm and must be reported as a named
adoption item, NOT invented here.

## Comparison instrument

Balanced panel (scripts/balance-panel.js) §15: NOT applicable to this
comparison as built — POLICY_REGISTRY in scripts/sweep-compare.js is
a fixed list that contains neither the closecommit stack nor the
wave4seek wrapper, and editing the observer to admit them would change
the instrument mid-comparison. The judged comparison is therefore the
identical-seed driver table (scripts/wave4seek-driver-20261103.js +
analyzer), with per-seed w4 counts for both arms, attached as
evidence/2026-11-03/wave4seek-compare.md. This limitation is stated
here, before any sim, not discovered after.

## Sense-testing (SENSE-TESTING LAW)

Read at least one seek success (a patrol day that produces a wave-4
fight) or, if none, one patrol failure (patrol days with encounters
that are never wave-4, or patrol days with no encounter at all) from
the kept say transcript, and judge meaning/coherence — not just counts.

## Metric review

(To be filled at closeout. A miss here is NO-GO; a wrong metric is
proposed for the NEXT run, never re-scored in this one.)
