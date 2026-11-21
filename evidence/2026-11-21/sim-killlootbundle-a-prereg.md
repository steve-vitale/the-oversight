# sim-killlootbundle-a — PREREG (frozen)

**Arm:** sim-killlootbundle-a · **Loop A run:** fleshout-20261121T2015Z, arm 2 of 2
**Axis:** scale-onramp · **Type:** LEVER — kill-loot searcaster bundle
**Base master:** `3329f4441` (worktree `~/workspace/worktrees/sim-killlootbundle-a`)
**Branch:** `sim-killlootbundle-a`
**Frozen:** 2026-11-21 ~21:50 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief)

sim-grantrate-a (DIAG-GO, evidence/2026-11-21/sim-grantrate-a.md) found a
second supply leak beside the tier-4 gate: kill-loot searcasters arrive
DRY. Seed 107237: amina_diallo's kill drops a searcaster straight into her
pack on day 71 (`villagerKillLoot` — no grant row, by design); it arrives
with **0 cells** and the census shows cells 0 for its whole life (days
71–87 equipped, then on the corpse) — under CELLGATE it could never have
fired. Only contest-prize guns get the 2-cell bundle. A sixth gun on the
grantrate band arrived this way and never fired. A gun that arrives dead
is supply that never reaches a fight.

This arm tests the fix: **give kill-loot searcasters the same 2-cell
bundle contest prizes get.**

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/CONTESTS.md prize funnel as cited in
  the grantrate prereg §2 (prize table, tier-4 gate, GUNRATE redirect +
  bundle). **No canon doc covers the kill-loot bundle** — the 2-cell
  bundle shape is taken from the contest-prize code
  (`contests.js` `_cxItemPrize`: `{ itemId: 'fusion_cell', name: 'Fusion
  cell', units: 2, kg: 0.4 }` pushed to the same recipient), not invented.
- `villagerKillLoot(vid, mdef)` (game.js:8143): `rollAlienLoot(mdef,
  { id: vid })` → pushes the drop id direct to the killer's
  `person.items` (no `alienLootGrant` call, no bundle, no cell). The
  sibling arm (sim-tier4access-a) owns the tier-roll function
  (game.js ~47530–47598) — this arm does NOT touch it. `villager-brain.js`
  and `win-plan.js` are NOT touched (held by sim-pinquaddoor-b, #2605).
- The bundle adds **zero RNG draws**: it fires only when the roll already
  returned `'searcaster'`. Ordinary drops stay put. Default OFF:
  env-gated `KILLBUNDLE=1` (node sims only; `process.env` is undefined
  in the browser, so the lever is off there — same pattern as GUNRATE).
- Volley path (`fieldFights.js` `fieldFight`, :482): `rec.volley`
  records `{ shots, hits, dmg, ammoLeft }`; a searcaster volley spends 1
  fusion cell per shot. CELLGATE holds fire below wave 4 when cells are
  held — so a bundled kill-loot gun's cells survive to wave 4+, and a
  volley from it is the observable "supply reached a fight".
- Static prior: kill-loot searcaster arrivals are rare — 1 in 8 seeds on
  the grantrate band (107237 day 71). The pilot band may see 0–2
  arrivals per leg. The verdict table (§6) handles the zero-arrival
  case honestly instead of re-scoring it.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107261–107268 (fresh).** Grepped every prereg under
  `evidence/*/sim-*-prereg.md` for the standalone tokens 107261–107268
  (no hits); grepped `evidence/*/sim-*.md` for the same tokens (no
  hits); grepped the goal `hidden_files/sim-findings.md` and
  `hidden_files/convergence-tracker.md` for the same tokens (no hits).
  Forbidden bands from the brief (106751–106766, 107221–107228,
  107191–107198, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058, 107021–107028) do not overlap
  107261–107268. Nearest used bands: 107237–107244 (grantrate),
  107241–107248 (shelterdraft). **Band FRESH.**

## 4. Instrument (frozen design)

Reuse of the grantrate driver family — adapt, don't rebuild:

- `scripts/killlootbundle-driver-a.js` — clone of
  `scripts/grantrate-driver-a.js` (same wraps: fireContest, _contestEnd,
  _cxItemPrize with pre/post snapshot diff, rollAlienLoot with caller
  taxonomy, alienLootGrant, _corpseTakeStack, daily gun-location census,
  wall fields), PLUS:
  - `villagerKillLoot(vid, mdef)` wrap with pre/post `snapshotGunCells`
    diff → each kill-loot drop records `{ dropId, gains: [{ holder,
    gunsGained, cellsGained, cellsAfter }] }` (the bundle bypasses
    `alienLootGrant`, so the grant wrap alone cannot see it — same
    reason the prize wrap diffs snapshots).
  - `fieldFight(vid, mdef, m, opts)` wrap → each fight records the
    fighter's pre-call equipped ranged weapon id + `rec.volley`
    (`{ shots, hits, dmg }`); a searcaster volley with shots > 0 is a
    fired gun. Analyzer splits volleys by whether the fighter ever
    received a kill-loot searcaster (kill-loot-holder set).
  - `MODE=ctl|arm` (not leg1/leg2): ctl requires `KILLBUNDLE` unset,
    arm requires `KILLBUNDLE=1`. Substrate identical both legs:
    `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
    BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
    `PRESENCE` unset. Driver STOPS unless the KILLBUNDLE lever code is
    present in game.js `villagerKillLoot`.
- `scripts/analyze-killlootbundle-a.js` — per-leg analysis + `--compare`
  ctl arm: kill-loot searcaster arrivals + cells bundled at arrival,
  contest grants, total gun ARRIVALS (contest + kill-loot), volleys
  fired from kill-loot guns (shots/hits/dmg), holder-days with cells
  (daily census: days a kill-loot holder's equipped gun shows cells >
  0), wall numbers, guardrails. `--selftest` green before pilot.
- `scripts/test-killlootbundle-a.js` — proof test (mechanism proof):
  staged `villagerKillLoot` with `rollAlienLoot` stubbed to return
  `'searcaster'` → KILLBUNDLE=1 bundles exactly 2 cells to the killer,
  KILLBUNDLE unset bundles 0; stubbed non-searcaster drop bundles 0
  even with KILLBUNDLE=1; bundle lands on the same holder as the gun.
  GREEN before pilot.
- `scripts/build-killlootbundle-panels-a.js` — panel builder (grantrate
  builder pattern): ctl → before, arm → after panel JSONs →
  `scripts/balance-panel.js compare` (§15).

## 5. Definitions (frozen)

- **Kill-loot arrival:** a `villagerKillLoot` event with
  `dropId === 'searcaster'`.
- **Bundled arrival:** a kill-loot arrival whose snapshot diff shows
  `cellsGained === 2` on the same holder, same call.
- **Kill-loot volley:** a `fieldFight` volley with `shots > 0` from a
  fighter whose equipped ranged weapon is `searcaster` AND who is in
  the kill-loot-holder set (received a kill-loot searcaster earlier in
  the run).
- **Holder-days with cells:** daily census days on which a kill-loot
  holder's equipped searcaster shows `cells > 0`.
- **Guardrails (scalemetric):** starvation deaths per leg + median
  survival; panel compare ctl → arm must show no material signal on
  either (the lever adds ammo, never food — a starvation move is a
  real bug, not noise).

## 6. Frozen bars (judge: the analyzer on the full band + panel compare)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every kill-loot searcaster drop carries a cells-at-arrival diff | all must hold |
| 2 | **Mechanism proof** — proof test: KILLBUNDLE=1 bundles exactly 2 cells on a forced searcaster drop, 0 when off, 0 for non-searcaster drops | all must hold |
| 3 | **Pilot GO** — arm leg: ≥ 1 bundled kill-loot arrival AND ≥ 1 kill-loot volley (shots > 0). Control leg: 0 bundled arrivals | all must hold for GO |
| 4 | **Coverage** — 100% of kill-loot searcaster drops attributed with cells-at-arrival; 100% of gun arrivals (contest + kill-loot) counted; 0 unclassified searcaster sources | all must hold |
| 5 | **Guardrails** — panel compare ctl → arm: no material signal on starvation deaths or median survival; total gun arrivals reported (contest + kill-loot) | all must hold |

**Zero-arrival rule (frozen, no re-scoring):** kill-loot arrivals are
rare (≈1 per 8 seeds on the grantrate band). If BOTH legs see 0
kill-loot searcaster arrivals, bar 3 is **INCONCLUSIVE** (not GO, not
NO-GO): the mechanism stands proven by bar 2 only, and the pilot
cannot judge the effect — the evidence says so and names the wider
band (or forced-arrival fixture) the next run needs. If arrivals exist
but no kill-loot volley fires, bar 3 is **NO-GO** on the "reaches a
fight" half. A miss is NO-GO, never re-scored against a friendlier
metric mid-run (§14).

GO = all five bars pass. GO means: kill-loot guns now arrive with
ammo and at least one fires in a real fight, with no scale-metric
cost. NO-GO = revert the game code before commit; keep instrument +
evidence.

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107261**,
  ctl then arm, gate: 0 instrument errors + driver runs to completion
  on both legs + kill-loot wrap records drops (if any). Proceed on the
  gate, not on any arrival count.
- **Pilot (judged):** 8 seeds, **107261–107268**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Two legs, ctl vs arm, identical
  seeds + substrate; only `KILLBUNDLE` differs.
- **Wall numbers** recorded per leg: national / table / wins, wave 4–5
  unlocks, median survival.
- **Canon:** docs/CONTESTS.md (prize funnel); no canon doc covers the
  kill-loot bundle — the bundle shape is code-derived (see §2), said
  here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
