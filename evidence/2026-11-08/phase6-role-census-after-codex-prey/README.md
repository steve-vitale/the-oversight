# Phase 6 role census — after OVE-78 dutyKnownPrey←codex (OVE-82)

Measurement-only re-census on tip **`a6f4a21c3`** (OVE-78 / PR #63
`cursor/hunt-prey-opportunity-3ac6`). Same 16-seed capable/competent × 80d
shape as OVE-75 / OVE-77. Muse lanes off. No Game/policy edits.

Hypothesis: OVE-77 had hunt ads with **0** picks and **0** practice. OVE-78
lets `dutyKnownPrey` honor `codex.animals`, so known_prey hunt weights can
co-fire on the live panel. This census should show hunt DUTY picks > 0 and
hunt practice reps > 0 vs OVE-77 zeros.

## Headline

Cases: **32/32 observed, 0 failed**. **Hunt picks and practice move off 0.**

| Policy | hunt ads → picks (OVE-77 → this) | hunt practice | Seeds w/ hunt picks |
|---|---|---|---:|
| capable | 202→0 → **803→81** | **83** (was 0) | **6/16** |
| competent | 206→0 → **956→163** | **168** (was 0) | **6/16** |

- Seeds with hunt ads: **32/32**. Seeds with hunt picks: **12/32** (6 per policy).
- capable/seed7 residual: hunt ads 11, picks 0 (both prey stores empty — matches OVE-78 smoke).
- Teach picks/practice decline as hunt takes DUTY slots (secondary tradeoff).
- Scout remains 0 ads / 0 picks / 0 practice.

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=4 \
  OUT=evidence/2026-11-08/phase6-role-census-after-codex-prey \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-08/phase6-role-census-after-codex-prey \
  --before evidence/2026-11-08/phase6-role-census-after-hunt-pick
```

## Files

- `panel.json` / `panel.log` — 32/32 cases
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-77
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: OVE-77 `../phase6-role-census-after-hunt-pick/analysis.json`
(tip `ae3fb87c3`).

Store report: Project store `docs/ove-82-role-census-after-codex-prey-result.md`.
