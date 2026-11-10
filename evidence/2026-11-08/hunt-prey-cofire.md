# OVE-78: Hunt ads co-fire — dutyKnownPrey reads wrong store

Base tip: `ae3fb87c3` (`origin/cursor/hunt-duty-dawn-pick-d17a` / OVE-76).
Branch: `cursor/hunt-prey-opportunity-3ac6`.

## Verdict

**GAME_WIRING_DEFECT → fixed.** `dutyKnownPrey` only read
`village.animals` (filled solely by successful hunt-duty resolve). On the
matched 16×2×80d panel that store stayed empty (**0/32** endVillageAnimalsGe1)
while player `codex.animals` reached level≥1 on **22/32** cases, including
**274** dawn-days with pantryLow ∧ codex-only. Hunt ads therefore stayed
soft `pantry_protein` and lost to forage — OVE-76's known-prey ladder never
engaged. Not honest opportunity.

## Pre-fix co-fire (tip `ae3fb87c3`)

Probe: `scripts/probe-hunt-prey-cofire-20261108.js`
Out: `evidence/2026-11-08/hunt-prey-cofire/` (32/32).

| Policy | hunt feed ads | known_prey | pantry_protein | endVillage≥1 | endCodex≥1 seeds | pantryLow∧codex-only days |
|---|---:|---:|---:|---:|---:|---:|
| capable | 354 | **0** | 354 | **0**/16 | 10/16 | 99 |
| competent | 419 | **0** | 419 | **0**/16 | 12/16 | 175 |

Seed7 capable: both stores empty on pantryLow → pantry_protein-only is an
honest residual **for that seed**, but the panel as a whole shows the wiring
miss (e.g. capable/8: endCodex=32, 73 pantryLow∧codex-only days, still 0
known_prey).

## Fix

`dutyKnownPrey` also honors `state.codex.animals` level≥1 — the same depth
store encounters / `_noteAnimalDepth` / tasting write. Village carcass ledger
kept. Soft pantry_protein under forage retained when **both** stores empty.

## Proof

| Check | Result |
|---|---|
| `scripts/test-combat-social-duty-dawn.js` | **54/54** (+codex-only known_prey + empty-store failing control + dawn-commit) |
| `check-wired` villager-brain | 0 unwired |
| After-fix smoke capable/8 | known_prey **406**, pantry_protein **0** (was 73 pantry_protein) |
| After-fix smoke capable/7 | still pantry_protein 3 (both stores empty — residual) |
| balance panel seed7 × 4 / 150d + proof-update | green |
| phone-frame | pending / see phone-ove78 note |

## Files

- `src/js/villager-brain.js` — `dutyKnownPrey` reads village.animals ∪ codex.animals
- `scripts/test-combat-social-duty-dawn.js` — OVE-78 codex-only + failing control
- `scripts/probe-hunt-prey-cofire-20261108.js` — panel probe
- `evidence/2026-11-08/hunt-prey-cofire/` + `hunt-prey-cofire-after/`
- balance: `neutral-ove78-hunt-prey-codex-panel.json.gz`
