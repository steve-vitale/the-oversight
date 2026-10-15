# Network commitment and march coverage — 2026-10-15

The next recovery gap is the Network's real nine-node march. This pass found
and repaired a recruitment loophole before extending prepared coverage.

## One coalition means Haven too

`docs/TABLE.md` requires no new blades once the Network march begins. The
foreign-call wrapper already refused new people, but `titanCommitOwn` still
accepted two Haven taps after `network.started`. A real shared-game probe
added three actual villagers through this path.

Now the public API rejects an in-march Haven commitment, clears a stale
Network confirmation and leaves workforce/muster untouched. The self bar
also stops offering the commitment. Before the march, the normal two taps
still work. Other campaign confirmations are preserved, and the Finale's
allowed reinforcement remains available. No gate number or combat stat changed.

## Policy and probe repairs

- The campaign policy uses the actual Network survivor floors after entry:
  five for ordinary later nodes, ten for the heart. Initial entry stays
  twenty. Its food budget follows the actual remaining force/floor, and it
  never tries fresh recruitment in the started Network march.
- Campaign travel now scopes the ordinary capable bot's existing paid
  route-around behavior around `walkTo`, restoring the environment even on
  error. It had stopped at blockages the ordinary capable route could pass.
- `campaign-prepared.js --titan the_network` explicitly supplies overtime 3
  and prior titan achievements, validates `networkKeyReady`, then calls the
  real summon. These prerequisites are fixtures, **not played boss victories
  or natural waiting evidence**. All nine pieces come from real Network
  placement; no post-setup teleport or node-clear assignment.
- The probe continues a routed node only when real Network resolution
  actually advances the index. That game rule accepts a destroyed piece
  when its surviving escorts disengage; a random routed fight is not a clear.

## Proof

- `test-network-commit-lock-20261015.js`: 15 pass / zero fail. Against frozen
  parent `845116b4`: 9 pass / 6 fail. Includes pre-start confirmation,
  stale second tap, public dispatcher, UI action list, workforce conservation,
  repeat calls, preserved Finale behavior and actual later-node policy gates.
- Campaign policy proof: 19 pass / zero fail. The new travel assertion fails
  on the old policy (18 pass / 1 fail); its other assertions remain intact.
- Quick suite: 121 scripts pass, zero fail, 42 seconds.
- Ontology: 111 systems, zero errors. Titans: 43 functions, zero unwired.
- Full suite: **893 scripts pass, zero fail, 183 seconds**.

## Prepared Network screen

`network-march-prepared-16.json` compares two explicitly selected tactics on
the same sixteen seeds and current source: caregiver guard/heal, and that
tactic plus the capable policy's existing public signature-counter priorities.
Both use the prior advanced-gear/strong-alliance/food/six-slot caregiver
fixtures. No claim of natural acquisition or a Network win rate.

| Actual outcome | Guard/heal | Guard/heal + extra counters |
|---|---:|---:|
| Worlds entering a Network fight /16 | 11 | 11 |
| Fights won, total | 10 | 4 |
| Nodes actually cleared, total | 12 | 6 |
| Most nodes cleared in one world | 3 | 3 |
| Extra signature-counter uses | 0 | 27 |
| Complete nine-node campaigns | 0 | 0 |

Earlier diagnostics stopped at ordinary blockages and even after legal
routed clears. The final matrix is the authoritative source for the table.
It is a coverage screen,
not a small probability improvement claim. More counter calls did not produce
better results here; the extra-counter experiment is not promoted to natural
play. The ordinary guard already uses Binding Q and earned Finale tools.

Across all 32 prepared runs, later fights contain no ally outside their
initial force, no duplicate identity inside a fight and no previously dead
ally. The public lock therefore is not bypassed by the probe. Attrition and
retreat remain real. Five worlds per tactic stop before a marked fight on
ordinary recruitment/travel/health conditions; failed access is not a victory.

Replay a prepared route:
`node scripts/campaign-prepared.js --seed 99 --titan the_network --loadout advanced --build caregiver --tactic guard-heal --trace 1`.

## Natural matched regression screen

`network-march-natural-before.json` / `network-march-natural-after.json`:
16 identical seeds × two policies × 240 days using the standard driver.
Source manifests differ only in `campaigner.js` and `titans.js`. All **32/32
final gameplay-state hashes match**. Control Table wins remain 12/16,
campaigner wins 10/16 and Herald kills 8/16. No campaign-policy errors.
These runs still do not reach the Network; they establish regression
neutrality over the screen, not natural coverage of the new lock.

## Phone proof

Fresh local origin, 390×844, real app renderer, service worker disabled.
An explicitly labeled recruitment-boundary fixture supplies the entry
prerequisites and calls the real summon. Pressing the real Commit Haven
button creates a first-tap confirmation. A fixture control then simulates
`network.started` (not a played node victory). The commitment button
disappears. A stale action through the public self dispatcher is refused,
clears pending confirmation, and leaves Haven blades/workforce flags 0/0.
The real refusal and readout are visible in `network-march-phone.png`.
No hidden-state browser evaluation. Test tab closed, viewport restored and
temporary server stopped.

## Remaining

A full Network march remains unverified. Investigate troop attrition,
escort counter choices, group support and retreat near a nearly defeated
escort before any difficulty tuning. Natural overtime/food/coalition access
and broader livelihood/material/storage/peer-trade/item-power coverage remain
open, alongside the unchanged content roadmap.
