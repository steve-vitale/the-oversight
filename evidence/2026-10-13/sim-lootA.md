# Batch loot ("take all") — lever arm

_evidence/2026-10-13/sim-lootA.md — 2026-10-13_

Stall forensics (5a6f4629) driver #1: `corpseTakeItem` = 36.5% of stall
acts, one decision per item stack, no take-all. This arm implements Lever A.

## Pre-registered GO (MEASUREMENT.md §14 — binding)

- **Primary:** deliberate loot verbs per corpse cleared ↓≥60% vs
  identical-seed baseline (LOOT_ALL=0, the old per-item path).
- **Guardrail:** total loot yield (kcal hauled from corpses) ≥ baseline —
  more looting is GOOD; the metric is efficiency, not volume.
- Seeds: 8 (11/22/33/44/55/66/77/88) × competent + belongseek = 16 runs/arm.
- Horizon: 180d death-aware.

Judged ONLY against this. See "metric review" for doubts.

## What was built

**Engine** (`src/js/corpses.js`):
- New verb `corpseLootAll(cid, skipFn)`: ONE deliberate decision clears a
  corpse. Per-item carry-weight gate preserved and re-checked as the pack
  fills — overweight stacks stay on the corpse and are REPORTED ("Too heavy
  for the rest — left where it lies"), never silently dropped. `_left`
  items (player chose Leave) and `skipFn` matches are skipped. Rotting
  rules unchanged. First-touch trauma/disease/ticks fire once per corpse
  (idempotent), same as the per-item path. Returns
  `{ taken, left, skipped, looted }`.
- `corpseTakeItem` refactored onto the shared `_corpseTakeStack` helper —
  byte-identical behavior (proof test asserts parity).
- `_corpseCheckRange(c, quiet)`: optional quiet mode (no "Too far"
  narration) so policies can pre-check range without spamming the log.
  Engine callers pass nothing — their behavior is unchanged.

**UI** (`src/js/app.js`, `renderLootInline`): a "Take all" button alongside
the per-item Take/Use/Eat/Leave buttons. Wired to
`Game.corpseLootAll(cid, it => it.plantId === 'meat_human')` — take-all
skips human meat with honest narration ("Left the human meat. Trembles
has no cure."); the per-item Take button still allows a deliberate
human-meat take. Fits the existing panel (one button row, no new screen).

**Policy** (`scripts/policies/competent.js`, shared by competent/belongseek
via scalecourt): `lootCorpses` now calls `corpseLootAll` once per corpse
instead of `corpseTakeItem` per stack. `LOOT_ALL=0` restores the old
per-item body verbatim as the sweep baseline control. Two correctness
additions in the shared loop (both arms):
- **Range pre-check:** the old loop fired the verb on EVERY corpse on the
  map — measured 176/182 calls (97%) failing "Too far" on
  competent/s11/30d. A human doesn't tap loot on a body three tiles away.
  Out-of-range corpses are now skipped before spending a deliberate verb
  (quiet check, no narration spam).
- `_left` items respected (previously the policy would take items the
  player explicitly marked Leave; `_left` is UI-only so sim behavior is
  unchanged).

**Telemetry** (`scripts/sim-harness.js`): `corpseLootAll` registered in
`VERB_CAT` under `food`, matching the taxonomy fix (1ab8a2bc) that
refiled `corpseTakeItem` social→food.

## Proof of effect

`scripts/test-batch-loot-20261013.js` — **28/28 green**, including:
- one verb clears a 4-stack corpse (inventory, looted flag, 4×
  `loot_taken` teles, single "Taken:" narration)
- overweight: takes what fits, leaves + reports the rest, corpse not
  marked looted
- per-item path parity: 3× `corpseTakeItem` ≡ 1× `corpseLootAll` end state;
  same 8-tick first-touch cost
- human-meat skip + trembles narration; `_left` never swept
- byte-identical repeat runs (no RNG in the loot path)
- **old-code control:** pre-change `corpses.js` (5a6f4629) has no
  `corpseLootAll` — the batch scenario fails there, so the test is not
  vacuous
- **UI control:** `renderLootInline` extracted from the shipped `app.js`
  and rendered headless with stubs — the "Take all" button is present,
  wired, and calls `Game.corpseLootAll(cid, meat_human-skipper)` on click

## Key finding (changes the forensics picture)

The forensics' "537 calls in 7 days" was **mostly range-failed verb spam**,
not player grind: 97% of the policy's loot verbs failed `_corpseCheckRange`
("Too far"). The per-item granularity was real but secondary — the dominant
cost was the range-naive loop firing on every corpse on the map. The range
pre-check removes the spam from both arms, so the primary metric now
measures genuine decision compression. (A human player would never produce
this spam — this was a policy artifact, not a UI artifact.)

## Sweep results

### Run 1 (32 runs: 8 seeds × competent/belongseek × LOOT_ALL 0/1, 180d)

`evidence/2026-10-13/sim-lootA-sweep.json`

- **Primary — deliberate loot verbs per corpse cleared:**
  baseline 6.83 → batch 1.33 = **80.5% reduction** (GO bar: ≥60%). All
  16/16 seed-policy pairs improved (baseline vpc 3.1–15.1, batch 1.0–4.9).
- **Guardrail — kcal hauled: UNEVALUABLE.** Both arms hauled exactly 0 kcal
  across all 32 runs. Root cause: monster corpse loot tables are
  hides/glands/teeth/sinew/trophies, all `kcalEach: 0` — meat enters the
  pack via butchering (`cleanCarcass`), a separate verb this lever doesn't
  touch. The guardrail measured a structurally-zero quantity: a
  metric-design flaw, not a lever failure.
- Corpses cleared: batch ≥ baseline on 13/16 pairs (3 pairs slightly
  lower: divergent corpse availability from RNG-consumption divergence,
  not loot loss — the take path is the identical `_corpseTakeStack`).

**Run 1 verdict: GO on primary; guardrail UNEVALUABLE (metric flaw).**
Per anti-drift, the run was NOT re-scored against a substitute — the
revised guardrail below ran as a separate measurement (run 2).

### Run 2 (revised guardrail: item stacks hauled ≥ baseline)

`evidence/2026-10-13/sim-lootA-sweep2.json` — same 32-run design, wrapper
additionally counts successful stacks taken per arm.

- **Primary:** baseline 6.83 → batch 1.33 verbs/cleared = **80.5%
  reduction** (reproduced exactly).
- **Revised guardrail — item stacks hauled:** baseline mean 63.9 →
  batch mean 73.6 = **ratio 1.15 ≥ 1.0** ✓. No loot loss; the batch arm
  hauls ~15% MORE (it doesn't strand items behind the old 12-item
  per-call cap the same way — guardrail intent "more looting is GOOD").
- **Run 2 verdict: GO** (primary ≥60% AND guardrail ≥1.0).

### Final verdict: GO

- Proof test `scripts/test-batch-loot-20261013.js`: 28/28 green
  (incl. old-code control + UI click-through).
- Existing suite: `test-loot-action-20261006.js` 14/14 green;
  `test-corpses-loot-20261006.js` 6 passed / 9 failed — failures
  verified IDENTICAL on the pre-change base (pre-existing ontology
  assertions, unrelated).
- Sweep (2 runs × 32): 80.5% fewer deliberate loot verbs per corpse
  cleared; 1.15× stacks hauled; corpses cleared parity-or-better on
  13/16 pairs.

## Metric review

- The forensics' original proposal used "≥50% reduction in loot decisions
  per run"; this run's binding brief uses "≥60% verbs per corpse cleared".
  Both are reported; GO is judged on the latter only.
- "Per corpse cleared" excludes corpses the policy never touches and
  overweight leftovers revisited later — the right denominator for
  decision compression, but it does NOT measure the range-spam removal
  (that's reported separately as a policy-hygiene win, not GO credit).
- **Guardrail flaw (run 1):** kcal hauled via loot verbs is structurally
  zero — monster loot tables carry no kcal; meat comes from butchering.
  Revised guardrail for run 2: item stacks hauled from corpses
  (batch ÷ baseline ≥ 1.0). If a future run wants a kcal guardrail, it
  must instrument `cleanCarcass`/butchering, not the loot verbs.
- **Forensics correction:** the published "corpseTakeItem 36.5% of stall
  acts" was ~97% range-failed verb spam on the measured sample — the
  policy fired loot verbs on every corpse on the map. A human player
  would never do this. The stall driver is real (per-item granularity)
  but was overstated; the range pre-check is the larger win and applies
  to both arms.
