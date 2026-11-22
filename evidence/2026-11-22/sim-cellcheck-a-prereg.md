# sim-cellcheck-a — PREREG (frozen)

**Arm:** sim-cellcheck-a · **Loop A run:** fleshout-20261122T0615Z
**Axis:** scale-onramp · **Finding:** #2672 (killrate §6/§9 — contest guns
fire twice, then go dry)
**Type:** DIAG / instrument-only (no src/js change; recorder-only wraps)
**Base:** worktree `~/workspace/worktrees/sim-cellcheck-a`, branch
`sim-cellcheck-a`, HEAD `bda6ff495` (= local master; no commits after it)
**Frozen:** 2026-11-22 ~07:55 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + sim-killrate-a §6 + sim-fusioncell-a)

On the killrate band (107313–107320, 150d, competent, substrate
GUNRATE=1 + CELLGATE=1), seed 107316's contest searcaster fired 2
volleys (4 shots, 4 hits, ~134 dmg each) across two grants (days 88
and 101), and 15 other searcaster-carrying fights on the same seed
fired 0 shots — the gun spends its 2 cells and then is a paperweight
even in wave-4/5 fights. Prior supply picture (fusioncell-a,
107021–107028, NO GUNRATE/CELLGATE): 3 fusion cells band-wide, ALL
from contest prizes; bigbundle raised max cells held to 7 with zero
dry days, yet still 0 volleys (participation, not supply, was the wall
then). This arm asks the narrower question: **what cells does a
contest grant actually carry, and do holders ever re-arm (crafting?
corpse takes? trade? contest re-grants? ruin salvage? stash top-up?),
and how many wave-4+ volley opportunities are lost to dry guns?**

Numbering note: the tracker (convergence-tracker.md:39207/39219) calls
this same deferred work the "#2650 follow-up"; the brief and the
killrate evidence file it as finding #2672. This prereg uses #2672
(the killrate filing); the tracker reference is recorded here so the
two numbers are not mistaken for two different findings.

## 2. Frozen code mechanism (read from code + data on this base, BEFORE the judged band)

Canon: docs/CANON.md + docs/CONTESTS.md read (prize funnel: contest
prizes and monster loot share the alien-item pool). **No canon doc
covers fusion-cell supply, searcaster bundles, or re-arming** — said
here rather than inventing canon. The numbers below are read from
`src/js/game.js`, `src/js/contests.js`, `src/js/fieldFights.js`,
`src/data/items.json`, `src/data/recipes.json`,
`src/data/reward-economy.json` on base `bda6ff495`; the proof test
`scripts/test-cellcheck-a.js` re-derives each from the live game.

### 2a. What a grant carries

- `alienLootGrant(itemId, toCorpse)` (`game.js:47712`): the entry is
  built with `units: 1`, always. A **fusion_cell grant = +1 cell**.
  A **searcaster grant = the gun alone (+0 cells at grant level)**.
- `_cxItemPrize` (`contests.js:201-245`): under **GUNRATE=1**, a
  searcaster prize **bundles 2 fusion cells to the same recipient**
  (`{ itemId: 'fusion_cell', units: 2 }` pushed beside the gun).
  Player-won searcaster/fusion_cell prizes are REDIRECTED to
  `_gunRateFighter()` (a lead-weighted living villager); villager-won
  prizes stay with the winner. Without GUNRATE there is no bundle
  and no redirect. (This is why fusioncell-a, which ran WITHOUT
  GUNRATE, saw chen_wei's contest searcaster arrive with 0 cells,
  while killrate-a, WITH GUNRATE=1, saw 2 shots per grant window.)
- `villagerKillLoot` (`game.js:8174-8196`): under **KILLBUNDLE=1** a
  kill-loot searcaster bundles 2 cells. **KILLBUNDLE is UNSET in
  this substrate** (same as killrate-a ctl), so a kill-loot
  searcaster here carries +0 cells; a kill-loot fusion_cell is +1
  via `alienLootGrant`.

### 2b. What a volley spends (fieldFights.js:1001-1129)

- The volley is the **LEAD fighter's only**; allies get no volley
  (their ranged weapon folds into melee only when ammo > 0,
  `fieldFights.js:1239`).
- `_shots = min(ammoN, clamp(1 + floor(range / mSpeed), 1, 4))`;
  searcaster range 8 → maxShots 2–4 by monster speed; each shot
  spends **1 cell**. Killrate observed 2 shots with 2 cells (maxShots
  ≥ 2 on those fights). With the 2-cell bundle, one volley empties
  the gun.
- Hit chance `clamp(0.85 − 0.06×8, 0.35, 0.85) = 0.37` + tracking
  (≤ 0.15); damage `lroll([4+wbR, 8+wbR])`, searcaster bonus 120 →
  wbR 60 → **[64, 68] per hit**. Expected armed volley at 2 cells ≈
  2 × 0.37 × 66 ≈ **49 damage** (4-shot ceiling ≈ 98, fusioncell-a
  §3); observed killrate volleys were 2/2 hits, ~134 dmg each.
- **CELLGATE=1** (`fieldFights.js:1032-1041`): a searcaster lead
  HOLDS fire below wave 4 when cells > 0 — the bundle's cells
  survive low-wave fights. A cell-less gun still says "no fusion
  cells" (the dry line lives in the `_shots < 1` branch).

### 2c. Re-arm channels — what exists in code

- **No recipe** for fusion_cell (36 recipes, none — re-derived in
  the proof test). **No ruin salvage** pool entry (all 20 regions).
  **No pile material** (not a MAT_ID). **No starting gear** (alien /
  lootTier > 2 filtered out). (fusioncell-a §3, re-proved here.)
- `villagerPocketAmmo` (`game.js:8075-8123`): step 1 moves **stashed
  ammo of ANY kind — including fusion_cell — from the personal stash
  to the pack, up to cap 5**. Step 2 (communal pile) is stone-only;
  step 3 (departure craft) is arrow/bolt only. So **stash→pack
  top-up IS a real re-arm channel — but only if cells ever sit in a
  stash** (grants land in the pack, never the stash; the proof test
  shows the top-up working live).
- Corpse takes (`_corpseTakeStack`) are **scholar-only**; a villager
  cannot strip cells off a corpse. Trade grants pass through
  `alienLootGrant` (caller `trade`) and are visible to the grant
  wrap. Show gifts are tier ≤ 3, so no cells.
- **Prediction:** a holder re-arms ONLY via (a) a new grant — a
  contest re-grant bundle (+2 with the gun, or a bare fusion_cell
  grant +1), a kill-loot fusion_cell (+1), a trade grant (+1) — or
  (b) stash→pack top-up of cells already stashed. Nothing else.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107367–107374 (8 seeds).** Grepped every prereg under
  `evidence/*/sim-*-prereg.md` and every `evidence/*/sim-*.md` for
  each standalone token 107367–107374. Results: 107368, 107369,
  107370, 107371, 107372, 107373 — **0 files each**. 107367 and
  107374 — **1 file each, the same file**:
  `evidence/2026-11-22/sim-scale-onramp-round-1115.md`, line 198:
  "Cellcheck's band 107367–107374 was verified fresh (0 hits) but
  never spent — it stays free for the next run's cellcheck arm."
  That is the coordinator's reservation line for THIS arm, not a
  judged corpus. The tracker (`hidden_files/convergence-tracker.md`
  lines 39207, 39219) names the same band in the same way
  ("verified fresh, unspent" / "verified fresh (0 hits) but never
  spent"). **No judged corpus anywhere names any seed in this band.**
- Nearest used bands do not overlap: leadgate 107359–107366
  (adjacent below), killrate 107313–107320, hpgate probes
  107331–107348 / 107351–107358. Forbidden/contaminated lists
  checked: none names 107367–107374 except as the unspent
  reservation above.
- **Search scope:** all `evidence/*/sim-*-prereg.md` + all
  `evidence/*/sim-*.md` (whole tree), plus the round record and the
  convergence tracker. A named band counts as used even with no
  judged corpus behind it — this band has no such naming except its
  own reservation.

## 4. Instrument (frozen design — fusioncell driver + grant-delta wraps)

- `scripts/cellcheck-driver-a.js`: a copy of
  `scripts/fusioncell-driver-a.js` (v2 grant wraps, daily cell
  census, `partyCells` on every wave-4+ encounter row, lead volley
  from the fight record) with RUN=`cellcheck-a`,
  OUTDIR=`perseed-cellcheck-a-diag`, and three NEW recorder-only
  wraps (pure reads + driver-local writes; every game function runs
  exactly once, untouched):
  1. `alienLootGrant` — records `cellsBefore`/`cellsAfter` for the
     destination container (villager pack / scholar inventory /
     corpse items) alongside the existing grant row (item, caller,
     recipient). Expected deltas: fusion_cell +1, searcaster +0.
  2. `_cxItemPrize` — records the recipient's cells before/after
     the WHOLE prize call (the bundle push happens inside it, after
     `alienLootGrant` returns). Expected delta: searcaster +2
     (bundle) under GUNRATE=1, fusion_cell +1, anything else +0.
     Bundle size = prize-level delta − grant-level delta for the
     same recipient.
  3. `villagerKillLoot` — records the killer's cells before/after.
     Expected delta: +0 always here (KILLBUNDLE unset); a searcaster
     kill-loot would carry +2 only if KILLBUNDLE were set — the wrap
     is the control that proves the unset.
  Plus substrate flags `gunrateOn`/`cellgateOn`/`speargateOn` on the
  output (self-description; the fusioncell driver records only
  bowopen/senseexped). The BOWOPEN-unset assertion is DROPPED: this
  arm runs the killrate substrate (BOWOPEN=1) deliberately, for
  comparability with the band where #2672 was observed. New
  assertions: GUNRATE=1, CELLGATE=1, SPEARGATE=1, BOWOPEN=1,
  KILLBUNDLE unset — a mis-set flag is a loud stop, never a silent
  mislabel.
- `scripts/analyze-cellcheck-a.js`: reads the corpus; emits the
  grant-bundle table (every searcaster/fusion_cell grant: item,
  caller, recipient, grant-level delta, prize-level delta, bundle),
  the fight-entry classification (every v4encounter with a
  searcaster participant: lead-armed / lead-dry / ally-armed /
  ally-dry, with volley shots/hits/dmg and outcome), the re-arm
  ledger per lead-dry entry (grants received with bundle sizes,
  volleys spent, days since last cell, days since last grant, stash
  cells at entry), the lost-volley count + damage estimate, and the
  wall numbers. `--selftest` on fixed fixtures.
- `scripts/test-cellcheck-a.js`: proof test — re-derives §2 from the
  live game (defs, no-recipe/no-salvage/no-pile, pool = 15,
  GUNRATE bundle live via `_cxItemPrize` on a staged winner,
  KILLBUNDLE-unset kill-loot live, volley spend at 2 cells, the
  stash→pack top-up) + pure-function fixtures for the classifier,
  the bundle reconciliation, and the ledger builder.

## 5. Definitions (frozen)

- **Grant:** a `grantEvents` row with `itemId` ∈ {searcaster,
  fusion_cell}. **Bundle:** the prize-level cell delta minus the
  grant-level cell delta for the same recipient on the same grant.
- **Fight entry:** a `v4encounters` row (wave ≥ 4) whose
  `partyCells` names a searcaster holder (lead = `partyCells[0]`,
  the `vid`; ally = any other participant). **Engaged** = outcome
  not in (`evade`, `alreadyDead`) — the volley only exists on a
  fight that happens; evaded meetings are counted separately, never
  as lost volleys.
- **Lead-armed:** lead holds searcaster with cells ≥ 1 at entry.
  **Lead-dry:** lead holds searcaster with 0 cells at entry.
  **Ally-armed / ally-dry:** same, for a non-lead participant
  (no volley exists for an ally; a dry ally loses the melee fold-in
  only — counted separately).
- **Lost volley:** an engaged lead-dry entry. Lost damage ≈ (lost
  volleys) × (band mean damage per armed volley); the frozen ceiling
  per volley is ~49 expected at 2 cells (~98 at 4 shots).
- **Re-arm ledger (per lead-dry entry):** the holder's grants
  received (item, caller, day, bundle size), volleys spent (shots
  per fight, days), days since the holder last held a cell, days
  since the holder's last grant, stash cells at entry.
- **Attribution completeness (primary metric):** attributed /
  (grants + fight entries), where a grant is attributed when its
  grant-level AND prize-level cell counts are non-null and the
  observed deltas join to the frozen code path (§2a) or the
  deviation is recorded with its cause; a fight entry is attributed
  when `partyCells` is non-null, the entry is classified, and — for
  lead-dry entries — the re-arm ledger is present. Unattributed =
  null counts, or a delta/ledger that cannot be joined to any
  recorded event.

## 6. Frozen bars (judge: analyzer on the fresh band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test green; analyzer `--selftest` green; 0 instrument errors on all 8 seed files; det-gate: recorder-on vs recorder-off trajectories identical on 1 seed (days / endReason / standing / maxWave / v4encounters total) | all must hold |
| 2 | **Attribution completeness ≥ 0.95** (primary) — every searcaster grant's cell bundle at grant time, and every wave-4+ fight entry by a searcaster holder classified armed vs dry with each dry case's re-arm history accounted for | ≥ 0.95 |
| 3 | **Grant-bundle table reported** — every searcaster grant's bundle cells + every fusion_cell grant's units, by caller (contest-prize / kill-loot / show-gift / trade / corpse) | must be reported |
| 4 | **Lost-volley count reported** — engaged lead-dry entries (lost volleys) + ally-dry entries + armed volleys fired, each dry case with its re-arm ledger; lost damage estimated from the band's own armed-volley mean | must be reported |
| 5 | **Wall numbers reported** — wins, national, table (not instrumented — recorded as not instrumented, never faked), wave 4–5 unlocks, median survival | must be reported |

GO = all five bars pass. DIAG-NO-GO = bar 1 fails (the instrument
cannot attribute — a real result, not a failure to hide) or bar 2 <
0.95. A miss is NO-GO, never re-scored against a friendlier metric
mid-run (§14). The lost-volley count itself is NOT a GO bar: it is
the measured answer, whatever it is — including zero.

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-fusioncell-a.js`
  (regression on this base) + `node scripts/test-cellcheck-a.js` +
  `node scripts/analyze-cellcheck-a.js --selftest` — all green
  before the band. Det-gate: 1 seed recorder-on vs recorder-off.
- **Band (judged):** 8 seeds, **107367–107374**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). Single diag leg. Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `KILLBUNDLE` unset;
  `LEND` unset; `PRESENCE` unset. (Identical to killrate-a's
  substrate, so the band is directly comparable to the band where
  #2672 was observed.)
- **Parallelism:** 2 detached processes × 4 seeds. If the run
  window ends mid-band, corpus + progress note are committed and
  the exact done-seed list reported (coordinator adopts; nothing
  faked or extrapolated).
- **Per-seed table + grant-bundle table + lost-volley ledger** in the
  evidence file from the analyzer output.
- **Sense-test:** read 2–3 transcripts/beats where a holder enters
  a wave-4+ fight dry or armed and judge whether the narration is
  honest and coherent (the "no fusion cells" / hold-fire lines).
- **Canon:** docs/CONTESTS.md (prize funnel); no canon doc covers
  fusion-cell supply, searcaster bundles, or re-arming — the numbers
  are code-derived (§2), said here rather than inventing canon.

## 8. Base note

Worktree HEAD `bda6ff495` = local master (the 1115Z round record);
`git log HEAD..master` is empty — nothing to fast-forward to. No
rebase needed. If master moves before the judged band lands, the
rebase rule from killrate-a §"Rebase onto 4681e740f" applies (scope
verify, re-run proofs, band stands only if the moved range touches
none of this arm's inputs).

## 9. Metric review (to be filled in the evidence file).
