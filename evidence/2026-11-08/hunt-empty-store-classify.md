# OVE-85: Hunt empty-store ads-without-picks classify

Tip: `a6f4a21c3` (`origin/cursor/hunt-prey-opportunity-3ac6` / OVE-78 PR #63).
Branch: `cursor/hunt-empty-store-classify-9b40`.
Measurement only — no Game/brain/policy edits.

## Verdict

**HUNT_EMPTY_STORE_HONEST_OPP**

Capable/seed7 hunt ads after OVE-78 are soft `pantry_protein` under forage when
both `village.animals` and `codex.animals` stay empty. They never claim
`known_prey`, never beat forage, and never win `duty_top_score` hunt picks.
Zero picks are correct.

## Method

Probe: `scripts/probe-hunt-empty-store-classify-20261108.js`
Out: `evidence/2026-11-08/hunt-empty-store-classify/`

| Case | Role |
|---|---|
| capable/7 × 80d | residual (OVE-82: 11 ads / 0 picks) |
| capable/5 × 80d | hunt-pick control |
| capable/42 × 80d | hunt-pick control |

Cross-check: `scripts/probe-phase6-role-census-20261108.js` on seeds 7 and 5.

## Residual (capable/7)

| Counter | Value |
|---|---:|
| daysPreyEmpty / daysPreyKnown | **80 / 0** |
| endVillageAnimalsGe1 / endCodexAnimalsGe1 | **0 / 0** |
| hunt feed ads | 3 (all `pantry_protein`) |
| empty-store `known_prey` ads | **0** |
| hunt beats forage / under forage | **0 / 3** |
| vbrain hunt ads (census-compatible) | **11** |
| hunt picks | **0** |
| day-2 sample huntWMax / forageWMax | 2.07 / 2.53 |

Census cross-check seed7: `adByTask.hunt=11`, `pickByTask.hunt` absent.

## Controls

| Seed | known_prey feed ads | pantry_protein | endCodex≥1 | census/log hunt picks |
|---:|---:|---:|---:|---:|
| 5 | 413 | 1 | 1 | **6** |
| 42 | 285 | 0 | 1 | **12** |

When prey knowledge lands, ads retag `known_prey` and hunt can win dawn picks.
Seed7 never lands prey knowledge under capable play — soft residual only.

## Answers

1. **Why ads with empty `dutyKnownPrey`?** Soft path: `huntFromNeed` when
   pantryLow and `!preyKnown` → `pantry_protein` at 1.8–2.0 (OVE-76 failing-
   control shape, retained by OVE-78).
2. **Different path?** Yes — not `known_prey` / commit ladder. Day-2 sample:
   three soft ads, forage higher (2.53 > 2.07).
3. **0 picks honest?** Yes — soft weight stays under forage; census and probe
   both show 0 hunt picks. Not a scoring bug.

## Rejected labels

| Label | Why not |
|---|---|
| `HUNT_EMPTY_STORE_AD_BUG` | zero empty-store `known_prey` ads |
| `HUNT_EMPTY_STORE_PICK_BUG` | no known prey on seed7; control seeds do pick |
| `INCONCLUSIVE` | residual + control contrast complete |

## Files

- `scripts/probe-hunt-empty-store-classify-20261108.js`
- `evidence/2026-11-08/hunt-empty-store-classify/{summary,huntempty-capable-seed{7,5,42}}.json`
