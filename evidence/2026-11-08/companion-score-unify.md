# CompanionScore unify (OVE-54 / VILLAGER-BRAIN Phase 4 residual)

## Verdict

**Done.** Door ask, party launch pick, and favor-company partner preference
all rank through one shared `companionScore` / `companionRank`. Seeded proof
shows the three call sites agree on ranking for a prepared scene. Overwrite
count on refuse stays **0** (OVE-45). Phone-frame proof refreshed for the new
boot input.

## SHAs / base

| What | SHA / note |
|---|---|
| Base tip | `6e53adc62` (`origin/master`, #43 phone-frame after bond/#42) |
| Feature commit | `45fe1c057` on `cursor/companion-score-unify-a1e9` |
| PR | https://github.com/steve-vitale/the-oversight/pull/45 |

## Gap (pre-fix)

| Site | Private formula |
|---|---|
| Door (`objAskCompanion`) | Inline additive: outdoor errand +4, bold/warm +2, scholar-trust >40 +1, social >65 +1 |
| Party (`findCompanion` in win-plan + villager-brain) | First eligible roster match (trust≥15, ranger) — no shared rank |
| Favor-company | No partner preference score |

## Fix

| Piece | Role |
|---|---|
| `src/js/companion-score.js` | `companionScore` + `companionRank` (stable id tie-break); reads errand / temper / personTrust∪pairAffinity∪scholar-trust / social |
| `objAskCompanion` | Ranks via `companionRank` after local eligibility |
| `findCompanion` (win-plan + villager-brain) | Collect eligibles, pick top `companionRank` — only the party companion pick; bond-candidate ads untouched |
| `companyPartnerScore` | Thin wrapper → `companionScore`; `companyMeetingStep` orders waiting partners by it |
| Proof | `scripts/godpath/test-companion-score-unify.js` (seed 20261108) |

## Probe

```
node scripts/godpath/test-companion-score-unify.js
→ 18 passed, 0 failed
```

| Case | Result |
|---|---|
| Prepared hi/mid/lo scores 8/6/0 | door = party = company order |
| Door accept (`roll:0`) | picks top-ranked companion |
| Door refuse (`roll:1`) | null; companion objective untouched |
| Failing control (errand-only private formula) | score vector diverges from shared |
| Overwrite (OVE-45) | still 0 on refuse; `test-companion-objective-overwrite.js` 25/25 |

Also: `check-wired.js src/js/companion-score.js` → 0 unwired; `validate-ontology.js` green.

## Phone-frame

Boot input `companion-score.js` (+ touched callers) required a fresh witness:

- Receipts: `evidence/2026-11-08/phone-companion-frame-{736,844}-r1.json`
- Updated: `scripts/phone-frame-proof.json` via `phone-frame-proof-update.js` (not hand-edited)
- `node scripts/godpath/test-phone-frame-proof.js` → **12 passed, 0 failed**

## Outside scope

- bond-initiation.js / bond dawn candidate ads (OVE-51 / #41)
- combat / fieldFights / villager-agency fighterState (OVE-52 / #42)
- Muse lanes (`scripts/policies/`, food/garden, regions/nomad)
- Pre-existing tip failures: `test-win-rallyguard.js` (companion=null on main arm) and person-trust errand-mix ±25% — reproduced on clean `6e53adc62` without this branch
