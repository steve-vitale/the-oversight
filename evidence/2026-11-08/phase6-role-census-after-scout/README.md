# Phase 6 role census — after OVE-81 scout DUTY offers (OVE-83)

Measurement-only re-census on tip **`84b54f4be`** (OVE-81 / PR #64
`cursor/scout-duty-dawn-offer-8c04`, includes OVE-78 prey). Same 16-seed
capable/competent × 80d shape as OVE-75 / OVE-77 / OVE-82. Muse lanes off.
No Game/policy edits in this arm.

Hypothesis: OVE-82 still had scout **0** ads / picks / practice on the
pre-scout tip. OVE-81 wires `dutyScoutOpportunity` + scout DUTY feed from
unmapped ±2 haven ring. This census should show scout ads > 0 and scout
picks or practice > 0 vs OVE-82 zeros. Hunt should stay live.

## Headline

Cases: **32/32 observed, 0 failed**. **Scout ads, picks, and practice move off 0.**

| Policy | scout ads → picks (OVE-82 → this) | scout practice | Seeds w/ scout picks |
|---|---|---|---:|
| capable | 0→0 → **2622→4** | **24** (ge8=1; was 0) | **3/16** (3, 9, 42) |
| competent | 0→0 → **2656→1** | **13** (ge8=1; was 0) | **1/16** (3) |

- Seeds with scout ads: **32/32**.
- Hunt stays live (slight pick/practice decline vs OVE-82; ge8 unchanged capable 2 / competent 8).
- Teach picks up slightly; patrol near-flat / slight down on competent — scout competes for slots.

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=8 \
  OUT=evidence/2026-11-08/phase6-role-census-after-scout \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-08/phase6-role-census-after-scout \
  --before evidence/2026-11-08/phase6-role-census-after-codex-prey
```

## Files

- `panel.json` / `panel.log` — 32/32 cases
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-82
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: OVE-82 `../phase6-role-census-after-codex-prey/analysis.json`
(tip `a6f4a21c3`).

Store report: Project store `docs/ove-83-role-census-after-scout-result.md`.
