# Raid danger: one heard-filtered read (game-gaps item 2)

Date: 2026-11-08
Base: origin/master `d229b58f5`
Closes: VILLAGER-BRAIN seam 4 (danger half); pantry/cistern belief remains open.

## Gap

Goals filtered gossip through the hearer (`dangerHeard`). Objective
pickers (`objDanger`, `objVillageDanger`, `objRallyFreshRaid`) summed the
whole gossip store. A villager could be held home by a raid they were
never told about, or cleared to leave by a filter the feet did not read.

## Change

One read: `Game.objDangerBelief(vid)` → `{ score, threat, freshRaid }`.
Gossip counts only if `vid` is in the entry's `heard` list (3-day window).

| Consumer | How it uses the read |
|---|---|
| Door `objDanger` | `belief.score` + weather/distance/temper |
| `objVillageDanger(vid)` | `belief.score` + weather (expedition gate passes vid) |
| Rally `objRallyFreshRaid(vid)` | `belief.freshRaid`; AskCompanion rallyOnly skips unhearing volunteers |
| Safety drive `dangerHeard` | `belief.threat` |

Commons raid seed (`game.js`) now names hearers at the fire (same shape
as havenGrowth), so empty-heard raids no longer silently arm nothing.

Not touched: `scripts/policies/`, garden/ability numbers, regions/weather/
nomad, feast/door levers, November journey files, person-trust-map (PR #4).

## Proof

```
node scripts/test-raid-danger-heard.js   # 21/21
node scripts/test-win-rallyguard.js      # 21/21
node scripts/test-retarget-gossip.js     # ALL GREEN
node scripts/test-villager-goals-20261103.js gates  # safety pass
node scripts/check-wired.js src/js/villager-objectives.js  # 0 unwired
node scripts/validate-ontology.js        # green
node scripts/check.js --quick --only raid-danger|win-rally|retarget-gossip  # green
```

`check.js --quick` still reports 6 unrelated master failures (stale
measurement/phone-frame proofs, mobile-combat cadence, occupation panels,
establishment-r20 racks-full day reset). Confirmed on clean origin/master
for measurement-proof-update and establishment-r20.

Probe cases: hearer reacts (door heat, safety 1, rally true); unhearing
villager ignores the same raid on door/safety/rally; hearing protect
volunteer guards; unhearing protect volunteer stays home.
