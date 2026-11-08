# Person-trust map writers — result

Date: 2026-11-08
Branch: `cursor/person-trust-map-41aa`
Prereg: `evidence/2026-11-08/person-trust-prereg.md`

## What landed

New module `src/js/person-trust.js` (loaded from `index.html` after
`skill-teaching.js`):

- `bumpPersonTrust(from, toward, n, reason)` — single writer onto
  `getPerson(from).trust[toward]` (unset reads as 0).
- `personTrustOf` / `personTrustCensus` — readers / panel instrument.
- Wraps lived events only: `bondAdd` (mutual, applied warmth delta),
  `resolveConsequence` (villager → scholar, applied convo delta),
  `teachSkill` (+1 each way), `noteSharedFight` (+1 each way).
- Never writes `state.village.trust`.

`bond-initiation.js` comment updated: person map is written now;
proposals still use the warmth window.

## Proof

```
node scripts/test-person-trust-20261108.js
→ PASS all 19
```

Panel (seed 84101, 30d, competent):

| metric | prereg baseline | after |
|---|---|---|
| maxTrust | 0 | 48 |
| entries | 0 | 65 |
| trustedOpen | 0 | 5 |
| WATER | 170 | 170 |
| EAT | 32 | 32 |
| TRAPS | 4 | 4 |
| FORAGE | 1 | 1 |
| LEAVE | 2 | 2 |
| SEEK | 21 | 20 |
| VISIT (aimed) | 40 | 37 |
| HAVEN_CHORE (aimed) | 40 | 44 |

Non-aimed errands inside ±25%. Warmth-window fixture holds with an
empty person map.

## Maintenance proofs

- Offline assets regenerated (`sw.js` ASSETS +1 script URL);
  `node scripts/test-offline-assets.js` green (196 checks).
- `node scripts/check-wired.js src/js/person-trust.js` → 0 unwired.
- Observer-neutral panel re-observed (seed 7, 4 policies, 150d) into
  `evidence/2026-11-08/neutral-person-trust.json.gz`; 
  `scripts/balance-proof.json` re-pointed. measurement-proof-update +
  measurement-workflow green.

## Quick gate

`node scripts/check.js --quick` → 289 passed, 4 failed. Failures match
clean `origin/master` tip before this branch (phone-frame receipt
staleness vs current `index.html`/boot inputs — needs a fresh browser
receipt pair, no Playwright in this VM; occupation-panels CLI workflow;
establishment-r20 racks-full day-reset; mobile-combat cadence). Same
triage pattern as alien-expansion 2026-11-07. Person-trust proof itself
is green (`--only person-trust`).

## Muse-overlap risk

Low. Touches `bondAdd` / `resolveConsequence` / `teachSkill` /
`noteSharedFight` via wraps; does not edit `scripts/policies/`,
garden/ability numbers, regions/weather/nomad, feast/door levers, or
November journey succession/conversation/scale/language/betrayal files.
Reader migration (fight-allies order, VISIT targeting) is deferred.
