# Phase 6 role census — after combat/social DUTY offers (OVE-73)

Measurement-only re-census on tip **`b2da71ec9930`** (OVE-71 / PR #55
`cursor/combat-social-duty-offer-c32d`), which includes assignTask dawn-commit
(#54) and DUTY pick (`duty_top_score`). Same 16-seed capable/competent × 80d
shape as #49 / OVE-72. Muse lanes off. No Game/policy number edits.

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=4 \
  OUT=evidence/2026-11-08/phase6-role-census-after-combat-social \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-08/phase6-role-census-after-combat-social
```

## Headline

| Policy | OVE-72 DUTY_ad | OVE-72 DUTY_picked | After DUTY_ad | After DUTY_picked | duty_top_score |
|---|---:|---:|---:|---:|---:|
| capable | 2172 | 737 | **2935** | **1043** | 1043 |
| competent | 2158 | 693 | **3050** | **1050** | 1050 |

- Cases: **32/32 observed, 0 failed**. Seeds with picks: **16/16** both policies.
- All counted picks carry `override=duty_top_score`.
- New ad tasks vs OVE-72: **hunt / teach / patrol** (scout still absent — not in OVE-71 offer set).
- New pick-task presence vs OVE-72: **teach / patrol** (hunt ads fire; cook ads still do not win top-score).
- Competence cells for **hunt / scout / patrol / teach remain 0**. Offer+pick live; practice→competence does not move under capable/competent because OVE-71 is brain-offer only (no auto-`assignTask`).

## Files

- `panel.json` / `panel.log` — 32/32 ok
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-72
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Before baseline: OVE-72 `../phase6-role-census-after-duty-pick/` (tip `c47d7df53`).
Store report: Project store `docs/phase6-role-census-after-combat-social.md`.
