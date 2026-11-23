# sim-killbundle-b — PREREG (frozen)

**Arm:** sim-killbundle-b · **Loop B run:** fleshout-loop-b-20261123T1430Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2715
`[claimed]` — KILL-LOOT GUNS ARRIVE DRY AND NEVER FIRE (killarrive-b §9)
**Type:** JUDGE a lever (KILLBUNDLE=1, env-gated, no default flip) on the
kill-loot path only. No game-code change in this arm — the lever landed
in sim-killlootbundle-a (commit `48c1a692a`); this arm judges it.
**Base:** worktree `~/workspace/worktrees/sim-killbundle-b`, branch
`sim-killbundle-b`, HEAD `8a949703a`
**Frozen:** 2026-11-23 ~14:30 UTC, before any judged run. No judged run
has run.

## 1. The question (from the brief + killarrive-b §9)

Kill-loot guns arrive dry and never fire: the first kill-loot
searcaster in the program arrived on seed 107533 day 19 with 0 cells,
was carried into 15 fights over 73 days (0 shots in every one), and
ended on its holder's unburied corpse. Contest grants already arrive
with 2 cells (cellcheck-a) — this arm is ONLY the kill-loot path.
KILLBUNDLE=1 bundles exactly 2 fusion cells with a kill-loot
searcaster, to the same killer. Does the bundle make the gun fire?

## 2. Carried numbers (killarrive-b, NOT re-derived)

- Ctl corpus `evidence/2026-11-21/perseed-killarrive-b-ctl/` (49 seeds
  107533–107581): 399 kill-loot events, 31 tier-4 rolls = **7.77%**
  (Wilson 95% CI 5.5–10.8%), 1 kill-loot searcaster (seed 107533,
  day 19, dry), 0 kill-loot volleys; contest path 30 grants / 4
  volleys on the same band. Verified this run before freezing:
  49 files, one shared anchor `5fb502bd1`, policySha matches
  `scripts/policies/competent.js`, 0 instrument errors, 399 events,
  1 searcaster (`test-killarrive-b.js --dir` → PASS).
- Pooled measured rate (killrate-a): tier-4 8.81% of drops, 1/15
  searcaster per tier-4 roll, 8.04 drops/seed → P(≥1 arrival per
  seed) ≈ 4.6%, expected natural arrivals on 49 seeds μ ≈ **2.25**,
  P(0) ≈ 0.105.
- **Supply warning, designed around honestly:** at the measured
  rate ~1 kill-loot arrival is expected per 49 seeds. The primary
  bar is therefore judged PER ARMED ARRIVAL (volleys per armed
  arrival), not per seed — and because one natural arrival is too
  thin to carry a verdict alone, this prereg freezes TWO legs
  (§5): the matched 49-seed armed leg (the honest baseline, run
  regardless) AND a 16-seed staged leg that guarantees one armed
  arrival per seed (doorstage precedent: staged supply). The
  verdict rule (§7) says in advance how the two legs combine, so
  no leg is re-scored after the fact.

## 3. Base note

Worktree HEAD `8a949703a`. The ctl corpus was recorded on anchor
`5fb502bd1`; between the two anchors the `src/` diff is ONLY
`src/js/comms.js` (+18) and `src/js/convo-wants.js` (+15/−1) —
`src/js/game.js`, `src/js/fieldFights.js`, `src/js/contests.js`,
`scripts/policies/competent.js`, and `src/data/items.json` are
byte-identical. Nothing in the kill-loot / volley / contest-grant
path changed between the ctl leg and this arm's legs, so the
matched comparison stands despite the different anchor labels.
Recorded here; the armed and staged corpora will carry anchor
`8a949703a` (or its prereg-commit descendant — see §9).

## 4. Band freshness (local_seed_band_freshness skill)

- **Matched band: 107533–107581 (49 seeds) — REUSED BY DESIGN**
  (matched control). This is the killarrive-b band, already verified
  fresh by killarrive-b §4 (grepped every `evidence/*/sim-*-prereg.md`
  and `evidence/*/sim-*.md`, the convergence tracker, and the live
  claim files — zero hits). No new band is introduced by the matched
  leg, so no re-grep is needed for it.
- **Staged band: 107533–107548 (16 seeds) — a SUBSET of the matched
  band.** No new seeds anywhere in this arm. The staged leg forces
  the first kill-loot roll of each of these 16 seeds to searcaster;
  the seeds' natural rolls are overridden for that one call only,
  so no fresh-band verification applies (the arrival is staged, not
  sampled). Recorded, not grepped — there is no new band to check.
- Nearest reservations, none overlapping: Loop A holds 107501–107532
  (launchsilence-a); Loop B screened 107471–107494
  (gateavoid-doorrich-b); killrate-a used 107313–107320.

## 5. Instrument (frozen design)

- `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused from the killloot16 /
  killrate / killarrive arms. ONE addition, frozen here and proved
  in `scripts/test-killbundle-b.js --live` before any judged run:
  **STAGE_SEAR=1** — an env-gated driver hook
  (`stageFirstKillLoot`, exported) that forces the FIRST
  `villagerKillLoot` call of a seed to return `'searcaster'`
  (the natural roll is discarded for that one call), then restores
  `rollAlienLoot` in a `finally`. Once-only per seed. Arm-only
  (the driver STOPs unless MODE=arm + KILLBUNDLE=1). The natural
  loot stream is untouched after the first call. The driver records
  `stageSearOn` per seed file, and the arm test's `--dir-stage`
  corpus mode asserts it.
- **Leg 1 — matched armed:** MODE=arm, KILLBUNDLE=1, same 49
  seeds, identical substrate, RUN token `killlootbundle-a`
  UNCHANGED, fresh OUTDIR `perseed-killbundle-b-arm`. Driver
  hardcodes `evidence/2026-11-21/<OUTDIR>` — corpus lands under
  2026-11-21 although this arm's evidence is 2026-11-23;
  recorded, not moved.
- **Leg 2 — staged:** MODE=arm, KILLBUNDLE=1, STAGE_SEAR=1,
  seeds 107533–107548 (16), same substrate, RUN token unchanged,
  fresh OUTDIR `perseed-killbundle-b-stage`. Guarantees 16 armed
  arrivals (one per seed) by construction; any natural searcaster
  later in a staged seed is counted separately in the analysis.
- **Substrate (both legs, identical to ctl):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset. Horizon 150d death-aware. Policy: competent
  (verbatim).
- **Tier tally:** `scripts/test-killrate-analysis-a.js` (lootTier
  lookup in `src/data/items.json`).
- **Arm test (NEW):** `scripts/test-killbundle-b.js` — frozen-band
  checks, staged-subset checks, sizing arithmetic on fixed inputs,
  driver-export check, live staged-forcing proof (`--live`),
  corpus validation modes (`--dir` armed 49, `--dir-stage`
  staged 16).
- **Parallelism:** 4 processes × 12–13 seeds (matched leg),
  2 processes × 8 seeds (staged leg), sequential within each
  process. Pilot (8 matched seeds) before any confirm spend.
  If the run window ends mid-band, corpus + progress note are
  committed and the exact done-seed list reported (coordinator
  adopts; nothing faked or extrapolated).

## 6. Definitions (frozen — killarrive-b §6, carried verbatim, plus bundle terms)

- **Kill-loot event:** a `villagerKillLoot` call returning a
  non-null `dropId`.
- **Tier-4 kill roll:** a kill-loot event whose `dropId` carries
  `lootTier: 4` in `src/data/items.json`.
- **Tier-4 kill-roll rate:** tier-4 kill rolls / kill-loot events.
- **Kill-loot searcaster arrival:** a kill-loot event with
  `dropId === 'searcaster'`.
- **Armed arrival:** a kill-loot searcaster arrival on a leg with
  KILLBUNDLE=1 (bundle expected).
- **Bundled arrival:** an armed arrival whose `gains` diff shows
  `cellsGained === 2` on the holder (analyzer `klBundled`).
- **Kill-loot volley:** a `volleyEvents` record with
  `rwId === 'searcaster'`, `shots > 0`, and `vid` equal to a
  kill-loot holder of that seed (analyzer `klVolleys`).
- **Per-arrival fire rate:** kill-loot volleys / kill-loot
  arrivals on a leg (staged leg: volleys / 16 staged arrivals).
- **Re-arm:** a kill-loot holder gaining a `fusion_cell` AFTER
  their first volley — via a kill-loot `fusion_cell` drop, a
  `fusion_cell` grant event to them, or a corpse take. Recorded
  from `killLootEvents` / `grantEvents` / `corpseTakeEvents`,
  reported, not a bar.

## 7. Frozen bars (judge: analyzer on the fresh legs + tier tally + panel)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof 12/12 + analyzer `--selftest` 17/17 + `test-killrate-a.js` 36/36 + `test-killrate-analysis-a.js` 14/14 + `test-killarrive-b.js` 12/12 + `test-killbundle-b.js` pre-run + `--live` green, all re-run on this base; 0 instrument errors on all 49 armed + 16 staged files; single anchor + policySha on every file in each corpus | all must hold |
| 2 | **Cells-at-arrival** — every kill-loot searcaster arrival in the armed leg AND in the staged leg carries exactly 2 cells (`klBundled == klArrivals`, `klDry == 0`, per leg) | must hold for GO |
| 3 | **Primary, matched leg** — armed-leg kill-loot volleys ≥ 1 (vs ctl 0). If the matched leg has 0 arrivals, this bar is INCONCLUSIVE (not a miss) and bar 4 decides | ≥ 1, or inconclusive |
| 4 | **Primary, staged leg** — staged-leg kill-loot volleys ≥ 1 across the 16 forced armed arrivals; per-arrival fire rate + shots/hits/dmg reported | ≥ 1 for GO |
| 5 | **Tier-4 no-regression** — armed-leg tier-4 kill-roll rate inside the ctl Wilson interval 5.5–10.8% (tally script on the armed dir). The staged-leg rate is reported only: the forced searcaster inflates it by construction (+1 tier-4 roll per seed), so it is not judged on this bar | must hold for GO |
| 6 | **Guardrails** (analyzer `--compare` ctl vs armed) — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO |
| 7 | **Balanced panel (§15)** — panels built ctl vs armed (49 matched seeds) via `scripts/build-killlootbundle-panels-a.js`; `node scripts/balance-panel.js compare` completes; decision `review_required`; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient} (no regression signal) | must hold for GO |
| 8 | **Re-arm record + sense-test delivered** — whether any holder re-arms after firing, and a transcript/census sense-test of the armed arrival(s) (does anyone notice, equip, comment on the gun and its cells), in the evidence file | must be delivered |

**Verdict rule (frozen):** GO = bars 1, 2, 5, 6, 7 pass AND
(bar 3 passes OR bar 4 passes). NO-GO = bar 3 fails (≥1 matched
arrival, 0 volleys) AND bar 4 fails (≥1 staged arrival, 0
volleys) — armed guns never fire on either leg — OR any of bars
1, 2, 5, 6, 7 fails. DIAG/INCONCLUSIVE = bars 1, 2, 5, 6, 7
pass AND bar 3 inconclusive (0 matched arrivals) AND bar 4
fails because the staged leg produced 0 arrivals (staging
failure — instrument, not game). A bar-3 miss with a bar-4 pass
is GO with the matched miss diagnosed in the evidence (why that
arrival didn't fire) — recorded as a finding, not hidden, and
not a re-score: the rule is frozen here. A miss is NO-GO, never
re-scored against a friendlier metric mid-run (§14). If the
staged per-arrival fire rate is low (e.g. 1/16), the GO stands
but the metric review says so plainly: the gun fires, but
rarely matters — the next question is fire frequency.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17; `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → 12/12;
  `node scripts/test-killbundle-b.js` → pre-run checks green;
  `node scripts/test-killbundle-b.js --live` → staged-forcing
  proof green — all re-run on base `8a949703a`.
- **Pilot (judged):** 8 matched armed seeds, 107533–107540.
  Instrument check (anchor, policySha, 0 errors, STAGE_SEAR off)
  before any confirm spend.
- **Confirm (judged):** remaining 41 matched armed seeds
  (107541–107581) + 16 staged seeds (107533–107548).
- **Analysis (judged):** analyzer `--dir` per leg;
  `--compare` ctl vs armed; tier tally per leg; panel build +
  compare; per-seed table in the evidence file (columns: days,
  end, wave, standing, deaths, contests, prize rolls, contest
  sear grants, kill-loot events, tier-4 rolls, kill-loot sear,
  sear volleys — as killarrive-b §1) for the armed leg, plus a
  staged-leg table (seed, staged arrival day/holder, cells,
  fights with gun, volleys, shots/hits/dmg, re-arm).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median/max survival.
- **Sense-test:** read the census/volley/grant records for the
  armed arrival(s) as a village story; the driver records no
  dialogue text, so the sense-test judges from equip/carry/fight
  behavior and any grant/corpse-take narration in the records —
  said plainly, not faked.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read; no canon
  doc covers the kill-loot roll table or the bundle — the numbers
  are code-derived (killrate-a §2), said here rather than
  inventing canon.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
- The prereg + driver change + arm test commit AFTER the
  pre-flight re-run on base `8a949703a` and BEFORE any judged
  seed runs. If that commit moves the anchor, the armed/staged
  corpora will carry the prereg-commit anchor (recorded in the
  evidence file); the ctl-vs-armed comparison is unaffected
  because no `src/` file changes between the two anchors (§3).
