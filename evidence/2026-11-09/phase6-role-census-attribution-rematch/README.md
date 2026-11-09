# Phase 6 role census — attribution rematch (OVE-94)

Measurement-only rematch on tip **`bd7717ed4`** (PR #71 / OVE-90 max-score
`pickByTask` attribution). Same 16-seed capable/competent × 80d shape as
OVE-83. Muse lanes off. No Game/policy edits.

Before panel: OVE-83 `../2026-11-08/phase6-role-census-after-scout/` (tip
`84b54f4be`, feed-order `[0]` attribution undercounted scout).

## Headline

Cases: **32/32 observed, 0 failed**. Ads, total picks, practice, and five-track
GO shape are **identical** to OVE-83. Only `pickByTask` redistributes — as
expected from the probe fix.

| Policy | scout ads → picks (OVE-83 → rematch) | scout practice | Seeds w/ scout picks |
|---|---|---|---:|
| capable | 2622→4 → **2622→16** | 24 (ge8=1; unchanged) | 3/16 → **4/16** (3, 7, 9, 42) |
| competent | 2656→1 → **2656→12** | 13 (ge8=1; unchanged) | 1/16 → **3/16** (3, 5, 7) |

Secondary attribution cleanup (same bug): forage pick credit collapses to 0;
water absorbs most of that (forage is early in feed order and rarely max-`w`).

Scout thin-vs-ads story **still holds** quantitatively softer (16/2622 capable,
not 4/2622). OVE-88 `SCOUT_THIN_HONEST_COMPETITION` classification unchanged —
no new Game/wiring defect.

## Verdict

**ROLE_CENSUS_ATTRIBUTION_REMATCH_OK**

## Commands

```bash
SEEDS=7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9 \
  POLICIES=capable,competent DAYS=80 PAR=8 \
  OUT=evidence/2026-11-09/phase6-role-census-attribution-rematch \
  node scripts/probe-phase6-role-census-20261108b.js

node scripts/analyze-phase6-role-census-20261108b.js \
  --evid evidence/2026-11-09/phase6-role-census-attribution-rematch \
  --before evidence/2026-11-08/phase6-role-census-after-scout
```

## Files

- `panel.json` / `panel.log` — 32/32 cases
- `analysis.json` / `analysis.log` — pooled tables + beforeCompare vs OVE-83
- `rolecensus-p6-{capable,competent}-seed*.json` — per-seed

Store report: Project store `docs/ove-94-role-census-attribution-rematch-result.md`.
