# sim-tier4pool-a — PREREG (frozen)

**Arm:** sim-tier4pool-a · **Loop A run:** fleshout-20261121T2315Z (arm 2 of 3)
**Axis:** scale-onramp · **Type:** LEVER — tier-4 POOL weight for holderless villages
**Base master:** worktree HEAD `70d9dda36` (brief-named base at cut; rebase onto
the current master tip before finishing, proofs re-run after every rebase)
**Branch:** `sim-tier4pool-a`
**Frozen:** 2026-11-22 ~00:30 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief + tier4access evidence)

sim-tier4access-a (NO-GO, evidence/2026-11-21/sim-tier4access-a.md) lifted
effective tier-4 rolls 21 → 29 (+38%) yet grants fell 5 → 2: the arm's
tier-4 rolls paid the gun only 2/29 (6.9%) vs the 22.2% design rate (ctl
5/21, 23.8%). Finding **#2647**: at 16.8% tier-4 access the POOL DRAW, not
the gate, decides whether a village that reaches the gate gets a gun (arm
seed 107252: 7 effective tier-4 rolls, 0 grants). Finding **#2648**: a 25%+
band tier-4 rate needs wider eligibility — a design question, not a knob on
the gate lever. This arm tests the POOL knob, not the gate again: weight the
tier-4 pool toward guns (searcaster) for HOLDERLESS villages — villages with
no living searcaster holder get a better draw from the tier-4 pool they
already reached. The zero-grant split (rolled-and-lost dominates both legs)
is the primary lens; the verdict is judged on TIER-4 ROLLS (the pay rate),
with grants as a secondary on a WIDER band (12 seeds).

## 2. Code-read priors (frozen mechanism — hypotheses to confirm, not conclusions)

Canon: docs/CONTESTS.md ("Prizes — every lane": tier capped at 3, tier 4
only at 25% for extreme-risk wins at wave 4; prizes must be worth the fear;
"Release restoration": extreme contests have an earned apex opportunity).
No canon doc covers the searcaster grant rules specifically; the numbers
below are read from code and data.

- **The tier-4 contest pool is 15 items** (verified live against
  src/data/items.json + src/data/reward-economy.json extraItems[4]:
  4 alien-origin tier-4 items + 11 extraItems[4] entries, searcaster
  included). Unweighted, a tier-4 roll pays the gun 1/15 (6.7%).
- **GUNRATE (substrate, both legs)** weights it x4: 4 searcaster copies
  of 18 draws = 22.2% (game.js rollAlienLoot, sim-gunrate-a). Trade and
  kill-loot paths are untouched by that weighting.
- **`rollAlienLoot`** (game.js) is the single draw: pool selection by tier,
  then `pool[Math.floor(Math.random() * pool.length)]`. The pool array is
  built fresh per call (filter), so pushing extra searcaster copies
  weights exactly that one draw and cannot accumulate across calls.
- **`_cxItemPrize`** (contests.js:201-213) is the ONLY `rewardSource:
  'contest'` caller of rollAlienLoot. A pool change gated on
  `rewardSource === 'contest'` reaches only contest prizes.
- **Living searcaster holder** (same scan as tier4access-a prereg §3):
  the scholar's inventory or equipped slots hold a `searcaster`, OR any
  roster villager who is alive (`getPerson`, not `dead`) holds one in
  `items`. Corpses and the stash do NOT count — a gun nobody living can
  fire is not a holder. Once a village holds a gun, the lever switches
  itself off for that village (self-limiting: a catch-up, not a faucet).

## 3. The lever (frozen design — TIER4POOL)

Env-gated: `TIER4POOL=1` (node sims only; in the browser `process` is
undefined, so the lever is off — same pattern as GUNRATE). All of it lives
**inside `rollAlienLoot`** (game.js), immediately after the GUNRATE block.
No other game file is touched.

On a contest-prize roll inside `rollAlienLoot`, after pool selection and
after the GUNRATE weighting:

- **Conditions (ALL must hold):** `loot.rewardSource === 'contest'`;
  `tier === 4` (the drawn tier — the pool that was actually selected);
  the village has **no living searcaster holder** (see §2).
- **Effect:** push **10 extra searcaster copies** into the pool. On the
  GUNRATE substrate the gun goes from 4/18 (22.2%) to **14/28 (50%)**.
  Nothing else changes: no extra draw, no tier change, no bundle change.
- **Observability (transient, no save pollution):** the lever writes
  `this._t4pLast = { seq, inTier, boosted, holderless, poolSize,
  searCopies }` on every contest-prize roll that reaches pool selection,
  and accumulates `this._t4pStats = { evaluated, boosted }`. These are
  Game-instance fields, never `this.state`, so they cannot serialize into
  a save. The monotonic `seq` (Amendment A pattern from tier4access-a)
  lets the driver tell a fresh diagnostic from a stale one: rolls that
  return early on the chance gate (shy-vault nulls) never reach the lever
  block, so a repeated seq means the row inherited the previous roll's
  diagnostic and must fall back to the input tier with boosted=false.
- **Default OFF.** If GO, the lever stays env-gated OFF; a default flip is
  a Steve/design call (cf. the dmgpin precedent: port held, flip is a
  design call). If NO-GO, the game code is reverted before commit; the
  instrument + evidence stay.

**Static prior:** on tier4access's band, ctl tier-4 rolls paid the gun
5/21 (23.8%, at the 22.2% design rate). With the pool at 50% for
holderless rolls and most villages holderless most of the run (guns are
rare: 5 grants in 8 seeds on grantrate, 7 grants in 16 legs on
tier4access), the arm pay rate should land near ~45–50% on holderless
tier-4 rolls and the band pay rate near ~40% (some rolls land after a
village already holds a gun and draw unboosted). Expected grants per
contest ~4.5% → ~8–9% IF the tier-4 roll count holds (~25–30 per band).

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107271–107282 (12 seeds, fresh).** Searched
  `evidence/*/sim-*-prereg.md` for `107[0-9][0-9][0-9]`: the highest used
  seed number anywhere is **107268**; no `10727x` / `10728x` / `10729x`
  appears in any dated prereg. Searched all of `evidence/` for
  `1072[789][0-9]`: the hits are incidental numbers inside old October
  corpora — kcal counts, not seeds (e.g. `"Foraged food": 107278` in
  evidence/2026-10-13/sim-scale-wall-r15b-pilot.json,
  `"mealKcal": 107281` in evidence/2026-10-14/mealonly-pilot.json).
  Searched the goal `hidden_files/sim-findings.md` for `10727|10728` —
  zero hits. Forbidden bands from prior briefs (106751–106766,
  107221–107228, 107191–107198, 107131–107138, 107111–107118,
  107091–107098, 107051–107058, 107021–107028) and the tier4access band
  107251–107258 do not overlap 107271–107282. The band is fresh by the
  skill's rule (a named band is used; this one is named nowhere as a
  seed band).

## 5. Instrument (frozen design)

Cloned from the proven tier4access instrument (same schema, renamed):
- `scripts/tier4pool-driver-a.js` — tier4access driver pattern (wraps +
  daily gun census + wall fields). Differences: `MODE=ctl|arm`; requires
  `TIER4POOL=1` on arm, forbids it on ctl; reads `Game._t4pLast` in the
  `rollAlienLoot` wrap with the monotonic-seq stale guard and records
  `t4pBoosted` / `t4pHolderless` / `t4pPoolSize` / `t4pSearCopies` /
  `t4pStale` per contest roll; records `t4pStats` at end of run.
- `scripts/analyze-tier4pool-a.js` — tier4access analyzer + pay-rate
  judging (searcaster results per effective tier-4 roll, split by
  holderless) + pool-shape audit (every boosted row must show 28 draws /
  14 searcasters) + stats cross-check (lever boosted total == boosted
  rows) + frozen-bar verdict (GO / NO-GO); `--selftest` green before
  pilot. Reports the zero-grant split (rolled-and-lost vs thin gate vs
  died-before-gate, per grantrate §2) and gun ARRIVALS (contest +
  kill-loot) alongside contest grants.
- `scripts/test-tier4pool-a.js` — proof test: lever unit cases (off
  without env; on + holderless + tier 4 → pool 28 / 14 searcasters, ~50%
  pay over 300 rolls; scholar holder blocks, pool stays 18/4; living
  villager holder blocks; dead holder does NOT block; tier-3 rolls never
  boost; kill-loot rolls never boost and never write _t4pLast;
  `_t4pLast`/`_t4pStats` transient, not in state). GREEN before pilot.
- `scripts/build-tier4pool-panels-a.js` — panel builder (tier4access
  builder pattern): before = ctl corpora, after = arm corpora, same
  seeds → `scripts/balance-panel.js compare` (§15).

## 6. Frozen bars (judge: the analyzer on the full 12-seed band, ctl vs arm)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Primary — tier-4 PAY rate** — searcaster results per effective tier-4 contest roll, arm vs ctl on identical seeds | arm pay rate ≥ 1.5× ctl pay rate AND arm pay rate ≥ 15% absolute (tier4access ctl baseline 23.8%) |
| 2 | **Secondary — grants** — contest-prize searcaster grants per contest entered, arm vs ctl | arm ≥ 1.5× ctl (tier4access baseline 4.5%) |
| 3 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every contest prize roll carries tier + effective tier + result; 0 pool-shape mismatches on boosted rows; lever boosted total == boosted rows | all must hold |
| 4 | **Coverage / attribution** — 100% of `_cxItemPrize` calls joined to a `rollAlienLoot` row; 100% of searcaster grants attributed; 0 unclassified sources | all must hold |
| 5 | **Guardrails (scalemetric cost bar)** — total starvation deaths arm ≤ ctl + 2; starvation deaths on arm-leg village-lost seeds whose ctl twin survived ("arm-only deaths") ≤ 2; median survival arm ≥ 0.8× ctl median; wins/national not regressed (both expected 0) | all must hold |
| 6 | **Answer quantified** — per-seed table + funnel (both legs) + zero-grant split + gun arrivals (contest + kill-loot) + sense read | all must hold |

GO = bars 1–6 all pass. A miss on bar 1 or 2 is NO-GO: revert the game
code before commit, keep instrument + evidence (§14 — never re-scored
against a friendlier metric mid-run). The guardrail reading of
"arm-only deaths" is frozen here as starvation deaths on seeds where the
arm leg lost the village but the identical-seed ctl leg survived (the
analyzer computes it per-seed); the interpretation is recorded so the
next reader can audit it.

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107271**
  (first band seed), arm leg only, gate: joins 100% + 0 instrument errors
  + ≥ 1 `_cxItemPrize` roll observed + `t4pStats.evaluated` > 0 +
  boosted rows present with poolSize 28 / searCopies 14. Discarded after
  the gate (regenerated by the pilot arm leg).
- **Pilot (judged):** first 8 seeds, **107271–107278**, horizon 150d
  death-aware, competent verbatim policy (`scripts/policies/competent.js`).
  Two legs on identical seeds: **ctl** (`TIER4POOL` unset) and **arm**
  (`TIER4POOL=1`). The pilot's gate is instrument validity only (bar 3
  on 8 seeds); the effect verdict is NOT judged on the pilot.
- **Confirm (judged):** remaining 4 seeds, **107279–107282**, both legs,
  same horizon/policy/env. The verdict is judged on the full 12-seed
  band (bars 1–6).
- **Substrate env (both legs, identical except TIER4POOL):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset; `PRESENCE`
  unset.
- **Wall numbers** recorded per leg: national / table / wins, wave 4–5
  unlocks, median survival.
- **Canon:** docs/CONTESTS.md (prize table, tier-4 gate); no canon doc
  covers the searcaster grant rules; rules are cited from code + data
  (see §2). Said here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
