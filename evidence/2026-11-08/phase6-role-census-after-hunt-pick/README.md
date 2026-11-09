# Phase 6 role census — after hunt DUTY dawn picks (OVE-77)

Measurement-only re-census on tip **`ae3fb87c3`** (OVE-76 / PR #59
`cursor/hunt-duty-dawn-pick-d17a`). Same 16-seed capable/competent × 80d
shape as #49 / OVE-72 / OVE-73 / OVE-75. Muse lanes off. No Game/policy edits.

Hypothesis: OVE-75 had hunt practice 0 (ads without top-score picks). OVE-76
raised known-prey hunt weights so hunt can win `duty_top_score` and dawn-commit.
This panel should show hunt DUTY picks > 0 and hunt practice reps > 0 vs OVE-75.

## Headline

Cases: **32/32 observed, 0 failed**. **Hunt picks and practice stay 0** —
identical to OVE-75 on this matched panel. Teach/patrol practice unchanged.

| Policy | hunt ads → picks (OVE-75 → this) | hunt practice | teach practice | patrol practice |
|---|---|---|---|---|
| capable | 202→0 → **202→0** | **0** (unchanged) | 97 (unchanged) | 81 (unchanged) |
| competent | 206→0 → **206→0** | **0** (unchanged) | 82 (unchanged) | 82 (unchanged) |

- Seeds with hunt ads: **32/32**. Seeds with hunt picks: **0/32**.
- capable/seed7 smoke: hunt ads 11, picks 0, practice 0 (noted; panel agrees).
- OVE-76 unit/smoke proof (known-prey controlled cases) is not contradicted —
  this census says the live 80d capable/competent path still never lands hunt
  as top-score-first.

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=4 \
  OUT=evidence/2026-11-08/phase6-role-census-after-hunt-pick \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-08/phase6-role-census-after-hunt-pick \
  --before evidence/2026-11-08/phase6-role-census-after-duty-practice
```

## Files

- `panel.json` / `panel.log` — 32/32 cases
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-75
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: OVE-75 `../phase6-role-census-after-duty-practice/analysis.json`
(tip `11a8d2582`).

Store report: Project store `docs/phase6-role-census-after-hunt-pick.md`.
