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

---

## Baseline refresh 2026-11-08 (OVE-61)

Tip: `be39a0a4e` (post OVE-57 proof refresh). Seed/horizon/policy unchanged
(84101 / 30d / competent).

OVE-57 classified the tip quick-check failure
(`FORAGE`/`TRAPS` vs the `d229b58f5` prereg) as **pre-#41** — same class of
drift already present on `49341fd78`. Not bond-dawn-caused. Sibling OVE-60
owns villager-brain duty candidates; this refresh does **not** retune
`villager-brain.js` or Game errand weights.

Fresh panel on tip `be39a0a4e`:

```
kinds: { LEAVE:2, WATER:136, HAVEN_CHORE:49, EAT:34, VISIT:20, SEEK:25, TRAPS:1, FORAGE:3, EXPEDITION:1 }
maxTrust: 75
entries: 55
trustedOpen: 4
living: 8
```

Movement vs original `d229b58f5` non-aimed bar (±25%):

| kind | old | new | band | |
|---|---:|---:|---|---|
| LEAVE | 2 | 2 | 1.5..2.5 | in |
| WATER | 170 | 136 | 127.5..212.5 | in |
| EAT | 32 | 34 | 24..40 | in |
| SEEK | 21 | 25 | 15.75..26.25 | in |
| FORAGE | 1 | 3 | 0.75..1.25 | **out** |
| TRAPS | 4 | 1 | 3..5 | **out** |
| HUNT / HAUL | 0 | 0 | ≤2 | in |

`VISIT` / `HAVEN_CHORE` remain out of the non-aimed bar (bonds-goal).
`EXPEDITION:1` appeared on tip; not a non-aimed kind.

**Decision:** honest baseline refresh in
`scripts/test-person-trust-20261108.js` to the tip panel above. Prefer
rebaseline over Game retune; Muse lanes off.
