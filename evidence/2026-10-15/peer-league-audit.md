# Peer leagues: a coverage gap becomes real play

Steve's playstyle audit asked whether noncombat routes earn useful gear and
whether unused features are actually dead. Covenant/charter actions were
absent from ordinary LEAD-road sweeps. This pass adds two capable peer-route
probes plus a common control; it changes no game rules, costs, rewards or
Table requirements.

## Existing mechanics and old measurement limitations

The game already supports courted equal covenants and trade charters, with
opinion 10+ before proposals, played accept/counter/decline, real first
accords, seasoned national founding and weekly obligations. Covenant pools
consume real food from Haven and other fires. Trade help sends actual people
away for three days and repays 1,500 kcal with their return. These are food,
relationships and availability choices; they do not directly hand out armor.

The old scalecourt probe uses the legacy competent brain. Both it and old
LEAD courtship check `pendingDefenseCall`, while the real peer request lives
in `pendingDefense`. The new probes use the actual field. This does not
silently rewrite those legacy policies or treat their missing calls as a
broken game mechanic.

## New strategies

`covenanter`, `charterer`, `peer-control` share capable's real fleeing,
abilities, choices, conversations and Table actions. All disable deliberate
hunting/feast patrols and drive off optional feast monsters. Normal defense
and unavoidable combat remain: these are not pacifist strategies.

The inherited LEAD proposal is suppressed for every callback, restored in
finally; no subordinate route silently fills the new probes' peer links.
The control suppresses both proposal routes. It may still benefit from normal
world diplomacy. Route policies propose only a known, unlinked, opinion-10+
village, from Haven, day 25+, with pantry above 12,000 kcal. They ask once a
day, with seven days between asks of a particular village, up to three peers.
No opinion, knowledge, food, mastery, link or rank is granted.

They answer counters, afford a first gift or make a visit, concede the real
priced crises, and answer defense/favor calls with a roster of at least six.
The game still determines actual availability and can return an empty bench.
Covenant relief draws at most 4,000 kcal per day toward a 12,000-kcal pantry
buffer, debiting the real pool. Peak-link/live/pool observations are sampled
at decisions, not exact founding timestamps or full weekly accounting.

## First 48-run screen: why ending silence needed another probe

`gear-usage-peer-routes-16.{json,md}`: same 16 seeds, 150 days, standard
sweep-compare driver, three policies. Reproducible source preserved at
`d164e8fc`; the report's earlier sourceHead is its parent revision, with
actual src/policy bytes identified by sourceHashes.

Both peer routes form three real equal links in **16/16 runs**; national
benefit flags become live in **13/16** per route. Covenant draws transfer
**121,013 kcal** across six runs. There are 22 successful defense dispatches
and 20 successful charter favor dispatches. All 48 runs personally earn
noncombat tier-3+ gear. All three policies take zero Table seats.

The traced baseline covenant seed 7 reaches national, 100 integration,
23 survived contests, numerous distinct faced monsters and three crises,
but stays arc 3 with sentimentTaught=true, feastSurge=1.5 and no
feastSurgeUsed; it has never hosted a feast. Removing LEAD tribute exposed a
bot limitation: the inherited feast routine counts recent personal food
donations plus LEAD tribute/tending. Real pool/peer work does not make that
bot-specific contribution check pass. This alone does not make the public
feast unavailable or prove that every missing seat has the same cause.

## Explicit hosting, applied equally to all three probes

All three now choose an actual armed feast at dusk when in Haven, using the
real plan, a 1.5x pantry buffer, seven-day shared cooldown and existing reactor
ceiling. They pay real commons food without requiring LEAD tribute. They do
not set feastSurgeUsed or force a fight: actual combat must use the real buff.
The normal inherited hosting cooldowns are updated only after real success,
preventing a second routine from immediately spending another feast.

Prepared shared-harness proof: **21 pass**, including real equal proposals,
paid first gesture, pool conservation, same-day bounds, real away parties,
delayed repayment, canonical defense request, priced crisis concession,
finally-safe LEAD suppression, exile, unaffordable hosting, paid hosting/buff,
no fabricated combat-use deed and shared hosting cooldown. The first fixture
mistakenly set dayTicks without setting the harness's dayPart; this was fixed
to an explicit dusk fixture before accepting the proof. No game roll or public
handler is replaced.

## Matched hosting comparison

`gear-usage-peer-feast-routes-16.{json,md}` uses the same seeds, driver and
150-day horizon. Recorded src/policy manifests differ **only in peer-league.js**.
These are whole-run strategies: Table entry can end a run before national
founding, so lower later-stage exposure must not be read as weaker founding.

| Policy | Wins before → after /16 | Seats | Bearer deaths | Explicit added feasts | After live national benefit runs | After three-peer runs |
|---|---:|---:|---:|---:|---:|---:|
| Control | 0 → 1 | 0 → 1 | 13 → 7 | 171 | 0 | 0 |
| Covenant | 0 → 7 | 0 → 9 | 17 → 12 | 164 | 7 | 12 |
| Charter | 0 → 8 | 0 → 11 | 11 → 9 | 180 | 8 | 12 |

Every arm still has **16/16 personally earned noncombat tier-3+ gear runs**,
excluding starting items, inheritance and corpses. After hosting, covenant
relief is 8,000 kcal (two runs); there are 12 successful defense dispatches
and 12 successful charter favor dispatches. Earlier endings and changed
trajectories change the time available for these actions. Both screens have
zero observer and reported peer-policy errors. Final hashes match across the
hosting arms in one control run and no covenant/charter runs.

This establishes naturally reached peer-route wins on the current game,
using public actions with real costs. **It is not a 64-seed balance verdict,
a charter-versus-covenant ranking, or proof for every occupation/subclass.**
Food buffs still go unused in some runs (including the follow-up seed 7);
food-use cadence/defense exposure remains a strategy question, not grounds to
remove the existing deed gate. No reward or combat difficulty is tuned to
make these probes win.

The 150-day covenant seed-7 observer-on/off replay has an identical full
normalized gameplay hash, ending and deaths. See
`peer-observer-parity-7.json`. Source hashes still match the final files.
The existing generic observer-purity proof also remains in the quick suite.

## Remaining work

- Measure actual weekly tariff receipts, upkeep, feast spending and public
  pantry draws before claiming net economic value. Peak flags and call counts
  are reachability observations, not a full food balance sheet.
- Mobile peer proposal → founding → pool/help controls have old wiring tests;
  this pass changes no production UI and adds no fresh browser proof.
- Keep party orders, natural fat/pemmican, merchant career budgets, class/job
  balance and the broader roadmap open. Do not manufacture a dead-system
  diagnosis from a policy that never chooses the feature.

## Validation and reproduction

- First probe: **130 quick / 902 full scripts passed**, before adding explicit
  hosting (50 / 175 seconds).
- Final hosting policy: **130 quick scripts passed**, 38 seconds. Full run:
  **901 passed, 1 failed**, 152 seconds. The known unseeded legacy
  `test-drifter-grab-20261006.js` failed its distant-village catch-up/pantry
  assertions; unchanged isolated retry passed **11/11**. It loads an explicit
  old game-module list and never imports the changed peer policy/registry.
  This is disclosed as a full-run flake, not reported as a wholly green full
  run. Determinizing that old test remains a known-issues follow-up.
- Final focused peer proof: **21/21**. No src/data files change; no ontology
  or region changes. `git diff --check` clean (line-ending warnings only).
- No remote push, release or service-worker version bump. Full roadmap goal
  remains active.

Reproduce final natural screen:

```powershell
node scripts/gear-usage-audit.js --label peer-feast-routes-16 --policies peer-control,covenanter,charterer --n 16 --days 150 --par 6
node scripts/test-peer-policy-20261015.js
```

To reproduce the first screen, use the policy/registry bytes at `d164e8fc`
with the same first-screen label, seeds, driver and horizon. To check observer
parity, run the child with `--policy covenanter --seed 7 --days 150 --observe 0`
and compare its stateHash with the final observed matrix. Retain the policy
and gameplay source hashes when comparing any later revision.
