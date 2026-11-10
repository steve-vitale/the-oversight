# Phase 6 role census — after DUTY objective practice (OVE-75)

Measurement-only re-census on tip **`11a8d2582`** (OVE-74 / PR #57
`cursor/duty-objective-practice-b2fe`). Same 16-seed capable/competent × 80d
shape as #49 / OVE-72 / OVE-73. Muse lanes off. No Game/policy number edits.

Hypothesis: OVE-73 had teach/patrol DUTY picks live but competence + practice
cells at 0. OVE-74 accrues `villagerPractice` on teach/patrol/hunt objective
completion — this panel should show practice deltas > 0 for those cells
(competence may still sit under the 8-rep first-rung threshold).

## Headline

Cases: **32/32 observed, 0 failed**. DUTY ads/picks identical to OVE-73.

| Policy | teach practice (reps / vill / max / ge8 / comp) | patrol | hunt | scout |
|---|---|---|---|---|
| capable | **97 / 44 / 9 / 1 / 1** (was 0) | **81 / 38 / 8 / 1 / 1** (was 0) | 0 | 0 |
| competent | **82 / 45 / 5 / 0 / 0** (was 0) | **82 / 38 / 6 / 0 / 0** (was 0) | 0 | 0 |

- Practice win is real for teach/patrol. Competence still mostly under the 8-rep first rung (capable crosses once each; competent maxEnd 5–6).
- Hunt: ads fire, no top-score-first picks → no practice. Scout: not offered.
- capable/seed7 smoke: teach +17 (max 4), patrol +14 (max 7), competence 0 — matches panel seed file.

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=4 \
  OUT=evidence/2026-11-08/phase6-role-census-after-duty-practice \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-08/phase6-role-census-after-duty-practice \
  --before evidence/2026-11-08/phase6-role-census-after-combat-social
```

## Files

- `panel.json` / `panel.log` — 32/32 cases
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-73
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: OVE-73 `../phase6-role-census-after-combat-social/analysis.json`
(practice-augmented re-derive from PR #56 seeds; focus practice were 0).

Store report: Project store `docs/phase6-role-census-after-duty-practice.md`.
