# Dawn villager-brain scoring entry (phase 1 coherence)

Date: 2026-11-08  
Branch: `cursor/dawn-villager-brain-8df9`  
Base: `origin/master` (independent of open PRs #4 person-trust and #6 raid-danger-heard)

## Order

Steve (2026-11-06): one coherent villager brain. Gap report item 3 / OVE-4.
`docs/VILLAGER-BRAIN.md` marks the product-of-curves IAUS formula, ×1.15
commitment multiplier, and top-3 weighted pick **for review** — not shipped.

## Design choice (scoring)

**Built:** one dawn scoring entry (`src/js/villager-brain.js`) that:

- logs every gate pick (`vbrainLogGate`) and lottery pick (`vbrainScorePick`)
  with per-candidate considerations;
- keeps the **legacy additive weights + weighted lottery** for core objective
  kinds (byte-stable vs pre-brain objPick RNG);
- feeds win-plan stage intents and EXPEDITION as extras (logged; may override
  via priority / deterministic hash without consuming `Math.random`);
- writes a dawn commitment; `agencyTick` honors it through
  `vbrainExecuteDepart` and **does not chance-roll** when `vbrainOwnsDawn()`.

**Deferred (for Steve review):** §4 product-of-curves, compensation factor,
top-3 weighted pick among scores, ×1.15 commitment multiplier, drive re-home
curves, belief-state danger/pantry unification (phase 3 / PR #6), trust map
writers (phase 2 / PR #4).

## Seams closed

| Seam | Before | After |
|---|---|---|
| 1 dawn stacked engines | goals bias + objPick lottery + win-plan agency re-decide | one entry; win-plan feeds dawn |
| 2 two departure brains | agency chance roll vs objectives | EXPEDITION candidate + commitment execute |
| 10 goals "not a brain" | lottery weight adder only | still a feeder; brain is the arbiter |

## Proof

```
node scripts/test-villager-brain-dawn.js
→ pass:true
```

Pre-registered panel (500 picks, seed 20261108, tolerance ±0.08 absolute on
core kinds, extras-off vs extras-on in separate harness processes):

- all CORE_KINDS absDelta = 0
- gate REST logged with considerations
- expedition_hash override fires (materialize stays core; commit = EXPEDITION)
- agency source guard present

Also: `node scripts/check-wired.js --strict src/js/villager-brain.js` → 0 unwired  
`node scripts/validate-ontology.js` → green (villager-brain registered)

## Muse / merge risk

- Does **not** redo PR #4 (person trust) or PR #6 (raid danger / `objDangerBelief`).
- Touches `villager-objectives.js` and `villager-agency.js` — same files as #6
  in part. Prefer merging #6 first or expecting a small conflict on objectives
  gate/danger call sites (this branch does not change danger reads).
- Outside Muse lanes (policies, food economy, gardens, regions).

## Files

- `src/js/villager-brain.js` (new)
- `src/js/villager-objectives.js` (gate log + score entry hook)
- `src/js/villager-agency.js` (dawn commitment execute; no chance roll)
- `index.html` (load order after villager-goals.js)
- `docs/VILLAGER-BRAIN.md`, `docs/ONTOLOGY.md`
- `scripts/test-villager-brain-dawn.js`, `scripts/green-list.txt`
