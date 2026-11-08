# Phase 6 role census — after DUTY dawn pick (2026-11-08b)

Measurement-only re-census on tip **`c47d7df534fe`** (QC #52), which includes DUTY dawn pick #51 (`ddb7f90da`+, `duty_top_score`).

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=4 \
  OUT=evidence/2026-11-08/phase6-role-census-after-duty-pick \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js
```

## Headline

| Policy | DUTY_ad (#49 before) | DUTY_picked (#49) | DUTY_ad (after) | DUTY_picked (after) | duty_top_score |
|---|---:|---:|---:|---:|---:|
| capable | 2484 | **0** | 2172 | **737** | 737 |
| competent | 2987 | **0** | 2158 | **693** | 693 |

Seeds with picks: **16/16** both policies (was 0/16). All picks via `override=duty_top_score`. Pick mix: water-dominated + some forage; cook ads fire but did not win top-score on this panel.

Role census remains **GO 5/5**. Combat/social competence cells still **0** (hunt/scout/patrol/teach/tend/mend resolve 0) → OVE-71.

## Files

- `panel.json` / `panel.log` — 32/32 ok
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: `../phase6-role-census/` (#49 / tip `206fe4931`).
Store report: Project store `docs/phase6-role-census-after-duty-pick.md`.
