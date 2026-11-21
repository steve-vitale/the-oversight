# sim-tier4access-a — PREREG (frozen)

**Arm:** sim-tier4access-a · **Loop A run:** fleshout-20261121T2015Z
**Axis:** scale-onramp · **Type:** LEVER — tier-4 access for holderless villages
**Base master:** worktree HEAD `5accf69db` (task brief named base `320165c5a`;
the worktree as cut already contains `5accf69db` on top; no rebase mid-work
per brief — the coordinator rebases at landing)
**Branch:** `sim-tier4access-a`
**Frozen:** 2026-11-21 ~21:30 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief + grantrate evidence)

sim-grantrate-a (DIAG-GO, merged `c7be183e0`) measured the contest-prize
grant funnel on band 107237–107244 (150d, competent, GUNRATE=1 + CELLGATE=1):
5 grants in 8 seeds (1 per 24 contests), tier-4 rolls 26/164 = 15.9% per
prize roll, and the pool then pays the gun at its designed 22% — the funnel
loses the gun at the **tier-4 gate**, not the pool weight. Its named next
lever (this arm): **tier-4 access, not pool weight.**

This arm builds and judges one lever: a default-OFF env-gated second chance
at tier 4 on contest-prize rolls, for villages with **no living searcaster
holder**.

## 2. Code-read priors (frozen mechanism — hypotheses to confirm, not conclusions)

Canon: docs/CONTESTS.md ("Prizes — every lane": tier capped at 3, tier 4
only at 25% for extreme-risk wins at wave 4; prizes must be worth the fear).
No canon doc covers the searcaster grant rules specifically; the numbers
below are read from code and data.

- **The tier-4 gate lives in `_cxItemPrize`** (contests.js:201-213):
  `tier = max(min(3, wave), broadcastRewardTier(who))`; tier 4 ONLY when
  `contest.risk === 'extreme'` AND apex (`wave >= 4` OR wins >= 8 OR
  apFavor >= 100) AND `Math.random() < apexChance` (0.25,
  `reward-economy.json` broadcast). The roll is then passed to
  `rollAlienLoot({ wave, loot: { chance, tier, rewardSource: 'contest' } })`.
- **`rollAlienLoot`** (game.js:47508, the tier-roll function) takes
  `maxTier = loot.tier` for rewardSource paths: the up-roll and the
  tier4Chance override both skip rewardSource entries, so the contest tier
  is decided entirely upstream. The GUNRATE searcaster weighting sits just
  below (game.js:47576).
- **The tier roll is a loot-table gate, not a deed gate or win price**
  (verified by reading: no deed/win-price code touches `rollAlienLoot` or
  `_cxItemPrize`; the deed gate lives in the table/standing code). The
  brief's STOP condition does not trigger.
- **`_cxItemPrize` is the ONLY `rewardSource: 'contest'` caller** (grep:
  contests.js:212 only). A field added to its loot literal reaches only
  contest prizes.

## 3. The lever (frozen design — TIER4ACCESS)

Env-gated: `TIER4ACCESS=1` (node sims only; in the browser `process` is
undefined, so the lever is off — same pattern as GUNRATE). All of it lives
**inside `rollAlienLoot`** (game.js), plus a one-field pass-through in
`_cxItemPrize` so the lever can see the contest risk (see below). No other
game file is touched; `villagerKillLoot` is untouched (sibling arm owns it);
`villager-brain.js` / `win-plan.js` untouched (held).

On a contest-prize roll inside `rollAlienLoot`, after `maxTier` is set from
`loot.tier` and before pool selection:

- **Conditions (ALL must hold):** `loot.rewardSource === 'contest'`;
  `loot.risk === 'extreme'` (passed through from `_cxItemPrize` — the
  canon gate: tier 4 is for extreme-risk wins only); `wave >= 4` (the
  apex wave gate; the wins>=8 / favor>=100 apex paths are NOT covered —
  conservative, documented); `maxTier < 4` (the first 25% apex roll did
  NOT fire — this is a second chance, never a double tier-4); the village
  has **no living searcaster holder** (see below); `Math.random() < 0.25`
  (a second draw at the same apexChance rate).
- **Effect:** `maxTier = 4`. Nothing else changes: no extra draw, no pool
  change, no bundle change. The GUNRATE weighting then applies to the
  tier-4 pool exactly as for a first-roll tier 4.
- **Living searcaster holder** (local scan inside `rollAlienLoot`, pure
  reads, try/catch-guarded): the scholar's inventory or equipped slots
  hold a `searcaster`, OR any roster villager who is alive (`getPerson`,
  not `dead`) holds one in `items`. Corpses and the stash do NOT count —
  a gun nobody living can fire is not a holder. Once a village holds a
  gun, the lever switches itself off for that village (self-limiting:
  a catch-up, not a faucet).
- **Observability (transient, no save pollution):** the lever writes
  `this._t4aLast = { inTier, bumped, outTier, holderless, wave, risk }`
  on every contest-prize roll evaluation and accumulates
  `this._t4aStats = { evaluated, bumped }`. These are Game-instance
  fields, never `this.state`, so they cannot serialize into a save.
  The driver reads `_t4aLast` in its `rollAlienLoot` wrap right after the
  call returns and records the effective tier per roll.
- **Pass-through (contests.js:212, one field):** the loot literal gains
  `risk: contest.risk`. Inert when the lever is off (nothing else reads
  `loot.risk`); fail-closed in the lever (a missing risk never bumps).

**Static prior:** on grantrate's band, apex-eligible extreme rolls hit
tier 4 at 25% (first roll). With the second chance, apex-eligible extreme
rolls hit tier 4 at 1 − 0.75² = 43.75%. Expected band tier-4 rate:
15.9% → ~28% (the non-extreme / pre-wave-4 rolls are untouched), grants
per contest 4.2% → ~7%, IF holderless holds for most of the band (guns
are rare: 5 grants in 8 seeds on grantrate, so most villages stay
holderless most of the run).

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107251–107258 (fresh).** Searched `evidence/2026-11-21/*.md` +
  `evidence/2026-11-2*/*.md` for `107[0-9][0-9][0-9]`: the highest used
  seed number anywhere is 107248 (sim-shelterdraft-a pilot 107241–107248);
  grantrate used 107237–107244. Searched the goal
  `hidden_files/sim-findings.md` for `107251|10725` — zero hits. No
  `107251`–`107258` appears in any dated prereg or evidence file on this
  date. Forbidden bands from prior briefs (106751–106766, 107221–107228,
  107191–107198, 107131–107138, 107111–107118, 107091–107098, 107051–107058,
  107021–107028) do not overlap 107251–107258. The band is fresh by the
  skill's rule (a named band is used; this one is named nowhere).

## 5. Instrument (frozen design)

Cloned from the proven grantrate instrument (same schema, renamed):
- `scripts/tier4access-driver-a.js` — grantrate driver pattern (wraps +
  daily gun census + wall fields). Differences: `MODE=ctl|arm`
  (control vs lever, NOT leg1/leg2); requires `TIER4ACCESS=1` on arm,
  forbids it on ctl; reads `Game._t4aLast` in the `rollAlienLoot` wrap
  and records `effTier` (effective tier: input tier, or 4 when the lever
  bumped) per contest roll; records `t4aStats` at end of run.
- `scripts/analyze-tier4access-a.js` — grantrate analyzer + effective
  tier-4 counting + ctl-vs-arm comparison on identical seeds + frozen-bar
  verdict (GO / NO-GO); `--selftest` green before pilot. Reports the
  zero-grant split (rolled-and-lost vs thin gate vs died-before-gate, per
  grantrate §2) and gun ARRIVALS (contest + kill-loot) alongside contest
  grants.
- `scripts/test-tier4access-a.js` — proof test: lever unit cases (bump
  when holderless + extreme + wave 4 + first roll failed; no bump when a
  living holder exists; no bump wave < 4; no bump non-extreme; no bump
  when env off; no bump when input tier already 4; holder scan ignores
  corpses; `_t4aLast`/`_t4aStats` transient, not in state). GREEN before
  pilot.
- `scripts/build-tier4access-panels-a.js` — panel builder (grantrate
  builder pattern): before = ctl corpora, after = arm corpora, same
  seeds → `scripts/balance-panel.js compare` (§15).

## 6. Frozen bars (judge: the analyzer on the full band, ctl vs arm)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Primary — tier-4 access** — effective tier-4 rolls per contest prize roll, arm vs ctl on identical seeds | arm rate ≥ 1.5× ctl rate AND arm rate ≥ 25% absolute (grantrate baseline 15.9%) |
| 2 | **Secondary — grants** — contest-prize searcaster grants per contest entered, arm vs ctl | arm ≥ 1.5× ctl (grantrate baseline 4.2%) |
| 3 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every contest prize roll carries tier + effective tier + result | all must hold |
| 4 | **Coverage / attribution** — 100% of `_cxItemPrize` calls joined to a `rollAlienLoot` row; 100% of searcaster grants attributed; 0 unclassified sources | all must hold |
| 5 | **Guardrails (scalemetric)** — median survival arm within ±10d of ctl; starvation death share arm not up > 5pts vs ctl; wins/national not regressed (both expected 0) | all must hold |
| 6 | **Answer quantified** — per-seed table + funnel (both legs) + zero-grant split + gun arrivals (contest + kill-loot) + sense read | all must hold |

GO = bars 1–6 all pass. A miss on bar 1 or 2 is NO-GO: revert the game
code before commit, keep instrument + evidence (§14 — never re-scored
against a friendlier metric mid-run).

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107251**
  (first band seed), arm leg only, gate: joins 100% + 0 instrument errors
  + ≥ 1 `_cxItemPrize` roll observed + ≥ 1 `_t4aLast` evaluation recorded.
- **Pilot (judged):** 8 seeds, **107251–107258**, horizon 150d
  death-aware, competent verbatim policy (`scripts/policies/competent.js`).
  Two legs on identical seeds: **ctl** (`TIER4ACCESS` unset) and **arm**
  (`TIER4ACCESS=1`). No confirm unless the pilot is GO and time remains.
- **Substrate env (both legs, identical except TIER4ACCESS):**
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

## Amendment A — smoke catch (before any judged sim, 2026-11-21 ~21:45 UTC)

The smoke on seed 107251 (arm leg, pre-pilot validation) caught a
stale-read bug in the instrument, fixed before the judged pilot (no judged
sim has run; the amendment is committed before the pilot, so no bar is
re-scored):

- **The catch:** smoke corpus 107251: 25 contest rolls, `_t4aStats`
  evaluated 18 / bumped 2, but the roll rows showed 3 bumped rows. The
  7-roll gap is the shy-vault nulls: `rollAlienLoot` returns early on the
  chance gate, BEFORE the lever block, so those rolls never evaluate and
  never overwrite `_t4aLast` — the driver's read after the call then
  inherits the PREVIOUS roll's diagnostic. One null row inherited a
  bumped predecessor, inflating the bump count 2 → 3. The bias is
  arm-only (ctl never sets `_t4aLast`), so it would have inflated the
  primary metric — it must be fixed, not noted.
- **Fix (diagnostic-only, zero game-behavior change):** the lever stamps
  a monotonic `seq` on every `_t4aLast` write (incremented per
  evaluation); the driver keeps `lastT4aSeq` and treats a repeated seq as
  stale, falling back to the input tier for that row. The proof test
  gains a seq-increment case; the analyzer is unchanged (it already
  counts `effTier` per row and cross-checks `t4aBumpedTotal` from stats).
- **Smoke gate re-check:** the gate is re-verified on seed 107251 of the
  pilot arm leg (fresh corpus, fixed code) before the ctl leg runs:
  joins 100% + 0 errors + `_t4aStats.bumped` equal to the bumped-row
  count. The original smoke corpus is discarded (regenerated by the
  pilot arm leg).
