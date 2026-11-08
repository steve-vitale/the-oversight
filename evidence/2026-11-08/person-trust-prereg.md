# Person-trust map writers — prereg

Date: 2026-11-08
Tip baseline: `d229b58f5` (origin/master at branch cut)
Gap: game-gaps.md item 1 / `docs/VILLAGER-BRAIN.md` phase 2 writer slice

## Claim

Ordinary lived events write each villager's own `getPerson(vid).trust`
map (directional). Village-wide scholar trust (`state.village.trust`) is
a different number and is not the writer. Bond proposals keep the
existing warmth window in `bond-initiation.js`.

## Pre-change census (seed 84101, 30d, competent)

```
kinds: { LEAVE:2, WATER:170, HAVEN_CHORE:40, EAT:32, TRAPS:4, VISIT:40, FORAGE:1, SEEK:21 }
maxTrust: 0
entries: 0
trustedOpen: 0
living: 10
```

Confirms the bond-initiation note: person map stays at 0 while the
village still runs errands.

## Bars

1. **Map moves.** On the same seed/horizon, `maxTrust > 0` and
   `entries > 0` after the change.
2. **Bonds gate can fire.** `trustedOpen > 0` (someone's
   `vgoalGate(vid, 'bonds')` / census `trustedAnyoneN` is live).
3. **Warmth window preserved.** Fixture: `bondDriveLive` still opens
   on bond warmth 15..50 with an empty person map; proposals do not
   require the goals gate.
4. **Non-aimed errands.** Kinds this change did not aim at stay inside
   ±25% of the baseline counts above (zero-baseline allows ≤2 absolute):
   `WATER`, `FORAGE`, `TRAPS`, `EAT`, `SEEK`, `LEAVE`, `HUNT`, `HAUL`.
   `VISIT` and `HAVEN_CHORE` are bonds-goal kinds and may move.

## Out of scope

- Migrating `villagerFightAllies` / VISIT targeting off scholar trust
  (later phase-2 reader moves).
- Trust decay toward neutral.
- Muse lanes: policies, garden/ability numbers, regions/weather/nomad,
  feast/door levers, November journey succession/conversation/scale/
  language/betrayal files.
