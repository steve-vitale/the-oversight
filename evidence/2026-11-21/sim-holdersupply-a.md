# sim-holdersupply-a — NO-GO (PARTICIPATION) — full 8-seed pilot judged

**Arm:** sim-holdersupply-a · **Loop A run:** fleshout-20261121T0315Z · **Axis:** scale-onramp
**Type:** BUILD + measure — the BIGGER CELL BUNDLE lever for findings #2628 / #2631 / #2599
**Status: NO-GO, kind PARTICIPATION — the lever is REVERTED (game code leaves no trace).** The pilot ran to 16/16 seeds (ctl 107131–107138, arm 107131–107138). The analyzer judges the six frozen bars on the full band: bars 1, 2, 5, 6 pass; bar 3 (armed volleys ≥ 2) misses at zero; bar 4 (pool presence ≥ 25%) misses at 12.3%. Per the frozen ladder, a NO-GO reverts the game code before commit; instrument + evidence commit only.
**Prereg:** `evidence/2026-11-21/sim-holdersupply-a-prereg.md` (commit `abc5509a65`, frozen 2026-11-21 ~03:35 UTC, before any judged sim).
**Branch:** `sim-holdersupply-a`, base master `b7c8eff2c`.

## 1. The lever (frozen design, built as preregistered) — and why it is the bundle, not the combination

**The combination was already measured — verified, not assumed.** The task's first candidate was GUNRATE=1 + CELLGATE=1 together, on the premise it had never been measured. Reading the evidence before building showed it had been measured three times:

| Prior arm | Band | Combination as measured | Result |
|---|---|---|---|
| sim-cellgate-a (arm leg) | 107051–107058 | GUNRATE=1 + CELLGATE=1 | holder-days 194, armed entries 2 vs floor 3, armed volleys 1 (first ever), cell-days 58→182 |
| sim-lendfix-a (both legs) | 107081–107088 | GUNRATE=1 + CELLGATE=1 | holder-days 87, armed entries 20, pool 0 lendable moments |
| sim-lendpool-a (diag leg) | 107111–107118 | GUNRATE=1 + CELLGATE=1 env ON | holder-days 116, pool 2 moments; no-living-holder 130/141 (92.2%) |

Per the task instruction ("Do NOT run a combination that has already been measured"), the combination was rejected in prereg §1 and the named alternative taken instead.

**BIGBUNDLE=1** (default OFF). One shape only: in `src/js/contests.js` `_cxItemPrize`, the GUNRATE bundle beside a granted searcaster becomes **6 fusion cells** (`units: 6`) instead of 2, to the same redirected recipient. Same gun weight (4/18 tier-4), same redirect (`_gunRateFighter`), same wave-gated volley (CELLGATE). Zero new `Math.random()` draws by construction (the bundle is a constant, not a roll) — the proof test asserts draw counts. **LEND stays OFF on both legs.** The substrate GUNRATE + CELLGATE + LEND already lives on master env-gated OFF (landed via sim-lendfix-a, merged `37f01cb32`) — no rebuild was needed; presence verified in this worktree before building.

**Legs (differ ONLY by bundle size):** control GUNRATE=1 + CELLGATE=1 (bundle 2); arm + BIGBUNDLE=1 (bundle 6). Common env (both legs, matching the lendpool band): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1`.

**The honest tension (prereg §4, recorded before the run):** cellgate §4 and the finding #2629 entry say "a bigger bundle is NOT the next lever" — presence, not supply, is binding. This arm ran the bundle anyway because the coordinator named it as the alternative, and because it tests a distinct mechanism cellgate did not: **armed-window length** (6 cells = up to three wave-4 volleys, so a holder who reaches one wave-4 fight stays armed for the next ones). The prereg's falsifier: if armed entries stay ≤ 2 and presence stays ~8% despite 3× cells, presence is confirmed binding and the bundle is killed. The verdict below is that falsifier, almost exactly as written — with one refinement (§6): entries did reach 4 on both legs, but volleys stayed 0, so the binding constraint is narrower than "presence": it is **leadership** — no holder ever leads.

## 2. Proof (before any sim)

- `scripts/test-holdersupply-a.js` **26/26 GREEN** on base `b7c8eff2c` before the pilot: searcaster/fusion_cell defs; bundle 2 with BIGBUNDLE unset (3 draws, draw-neutral); bundle 6 with BIGBUNDLE=1 (exactly +6 cells, 3 draws); redirect + bundle 6 to the expedition holder (gun + 6 cells, scholar pack untouched); a fusion_cell prize still redirects as exactly +1 cell (bundle is searcaster-only); ordinary prizes stay with the player; BIGBUNDLE alone (GUNRATE unset) bundles 0 cells; the 6-cell gun under CELLGATE=1 holds fire below wave 4 (0 shots, all 6 cells kept, hold line) and fires at wave 4+ leaving cells for a second volley (6 − loosed > 0).
- `scripts/analyze-holdersupply-a.js --selftest` **88 passed, 0 failed** (84 inherited + 4 new `judgeHoldersupply` shapes: GO at 30% presence; NO-GO at the 7.8% lendpool baseline; NO-GO entries 2 < 3 with presence passing; NO-GO no unarmed population).
- Substrate re-proven unmodified against the lever: `test-gunrate-a.js` **39/39**, `test-cellgate-a.js` **12/12**, `test-lendpool-a.js` **35/35**.

## 3. Pilot status (16 of 16 seeds — COMPLETE)

- **Band:** fresh **107131–107138** (verified per prereg §3: no seed in any dated evidence .md, prereg, corpus filename, or sim-findings entry; neighbouring used bands 107111–107118, 107091–107098, 107081–107088, 107051–107058). Horizon 150d, death-aware. Competent verbatim policy.
- **Done:** ctl 8/8, arm 8/8, both exit 0 (~11 min per leg in parallel). All 16 corpora valid, 0 instrument errors, 0 `@@FALLBACK` writes, no `.tmp` leftovers. Near-miss coverage **100%** on both legs (ctl 160/160, arm 169/169 incl. raid rows; 0 orphans, 0 unclassified). Pool counter re-verified on both legs (lendable 0 vs `v4lendPool` moments 0 — agree); `v4lends` 0 on all 16 (LEND off).
- **Smoke first:** seed 107131 both legs, exit 0 both. The two smoke corpora are byte-identical except the `bigbundleOn` flag (114d village-lost, w4, st125 on both) — no searcaster grant on that seed, so the legs correctly do not diverge. Smoke corpora kept in `evidence/2026-11-21/perseed-holdersupply-a-smoke/`.
- **Run notes (this run):**
  - The cloned driver inherited the lendpool driver's `MODE must be diag` guard and both smoke legs exited 2 immediately. Fixed pre-pilot (commit `24fcda8e6`): two-leg MODE=ctl|arm guard, BIGBUNDLE leg-consistency guard (arm requires BIGBUNDLE=1, ctl forbids it), BIGBUNDLE presence check, `bigbundleOn`/`bigbundlePresent` in corpus metadata. The prereg is frozen and was NOT edited; the fix is recorded here.
  - The safe-commit index-clobber pattern struck on both commits (just-committed files staged-as-deleted / MM); repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified status clean + `git diff HEAD` empty + hash-object matches HEAD.
  - The panel builder clone carried a sed quote-stripping fault (`POLICIES = [holdersupply-a]`, `policy: holdersupply-a` — unquoted identifiers); fixed by hand before the panel build. No judged data was touched.
  - No write-flap strike this run; no machine restart during the pilot (uptime 32 min at pilot start, unbroken through both legs).
- **Analysis:** `evidence/2026-11-21/holdersupply-a-analysis.json` (analyzer verdict NO-GO / PARTICIPATION). Per-leg diag: `holdersupply-a-analysis-ctl.json` / `-arm.json` (both DIAG-GO — see §4). Panel: `evidence/2026-11-21/holdersupply-a-panel-before.json.gz` / `-after.json.gz` + `holdersupply-a-panel.md` (compare decision `review_required` — see §4, it does not overturn the prereg judge).

## 4. Verdict — NO-GO (PARTICIPATION)

| Frozen bar | Ctl (8 seeds) | Arm (8 seeds) | Bar | Result |
|---|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | 170 | **164** | 40 | **PASS** |
| 2. Armed-holder entries ≥ 3 | 4 | **4** | 3 | **PASS** |
| 3. Armed volleys fired ≥ 2 | 0 | **0** | 2 | **FAIL** |
| 4. Pool presence ≥ 25% | 16/121 (13.2%) | **16/130 (12.3%)** | 25% | **FAIL** |
| 5. Guardrail (exposure-normalized) | deaths/engaged 4.03; median 150d | deaths/engaged **3.91** (bar ≤ 4.43); median **150d** (bar ≥ 120) | — | PASS |
| 6. Starvation guardrail | 4 villager starvation deaths | **4** (bar ≤ 6) | — | PASS |

**Why it is PARTICIPATION, and why the bundle changed nothing measurable:** the bundle did exactly what it was built to do — in the inventories. Arm max cells ever held: **7** (6 bundle + 1 cell prize) vs ctl 4; arm holders show maxCells 6, 7, 6 vs ctl 2, 3, 2, 4; arm cell-days 164 = holder-days 164 (zeroDays **0** — every holder-day was armed, vs ctl 167/170 with zeroDays 3). But armed entries are **4 = 4**, armed volleys **0 = 0**, pool presence **12.3% vs 13.2%** — the legs are indistinguishable on every judged outcome. The four armed entries are the SAME four fights on both legs (§6): the bundle changed the ammo count in the party row (2 → 6) and nothing else — same fights, same leads, same flees. The volley is lead-only and **no holder ever led a wave-4+ fight on either leg** (armedLeads 0 both legs), so the extra cells never got a chance to fire. Presence did rise against the lendpool baseline (7.8% → 12.3%), but the control leg rose identically (13.2%) — the gain is band variance, not a bundle effect: on this band the holders who exist are sheltered in 16/16 present cases (§6).

**The panel's `review_required` does not change the verdict.** The balanced-panel compare flags "Village deaths per run" as `regression_watch` (+2, interval 0–6). Deaths per 100 calendar days actually FELL (−0.83), community loss is identical (0.5 vs 0.5), and the frozen exposure-normalized guardrail PASSES (3.91 vs 4.03, medians 150d/150d). The +2 raw deaths are the arm leg's extra surviving days on seed 107138 (144d vs 107d — more days alive = more deaths counted) plus 187 vs 178 meetings. Per §14 metric binding, the panel is the instrument and the pre-registered threshold is the judge; the raw-deaths flag is recorded here as a watch item, not a re-score — the same retired-metric resurfacing the gunrate and cellgate arms recorded.

**Instrument validity (per-leg diag):** both legs DIAG-GO — near-miss coverage 100% (0 unclassified, 0 orphans), pool re-verified (lendable 0 = moments 0), lend stayed OFF. The verdict is a census of the population, not a sampling artifact.

## 5. Wall numbers (full 16-seed band)

- National **0/16**, table not instrumented (null, never faked), wins **0/16**. Wave 4 reached 16/16, wave 5 reached 5/16 (ctl 2/8, arm 3/8). Median survival 150d on both legs. Community lost 4/8 ctl, 4/8 arm. Scale rank regional on all 16.
- Standing: ctl 125–485 (five seeds pinned at the 199 wave-4 floor), arm 125–485 (same). The wall is unmoved — the pilot band carries the wall numbers, as expected; the lever was never a scale lever.

Per-seed (days / end / max wave / standing / wave-4+ meetings / engaged / armed entries / searcaster grants):

| Seed | Ctl | Arm |
|---|---|---|
| 107131 | 114d lost w4 st125 m13 e6 a0 g0 | 114d lost w4 st125 m13 e6 a0 g0 |
| 107132 | 131d lost w4 st199 m5 e5 a0 g0 | 131d lost w4 st199 m5 e5 a0 g0 |
| 107133 | 150d survived w4 st199 m43 e40 a2 g1 | 150d survived w4 st199 m43 e40 a2 g1 |
| 107134 | 150d survived w4 st199 m19 e18 a0 g1 | 150d survived w4 st199 m19 e18 a0 g1 |
| 107135 | 150d lost w5 st380 m50 e48 a0 g0 | 150d lost w5 st380 m50 e48 a0 g0 |
| 107136 | 150d survived w4 st199 m2 e1 a0 g1 | 150d survived w4 st199 m2 e1 a0 g1 |
| 107137 | 150d survived w5 st485 m42 e33 a0 g0 | 150d survived w5 st485 m42 e33 a0 g0 |
| 107138 | 107d lost w4 st199 m4 e3 a2 g3 | 144d lost w5 st375 m13 e12 a2 g1 |

Six of eight seeds are outcome-identical across legs (same days, end, wave, standing, meetings). Only 107138 diverges — and it diverges on the gun's post-death fate, not on the bundle (§6).

## 6. The mechanism (why bars 3–4 are what they are)

**The bundle landed.** Same holders, same windows, more cells: greta_hansen (107134) 64 holder-days, maxCells 2→6; gen_0czzk3y (107136) 78 holder-days, maxCells 3→7; gen_7etsrtw (107138) 22 holder-days, maxCells 2→6. All three kept their cells to the end of their holder window on the arm leg (zeroDays 0). Grants: 6 searcaster grants ctl vs 4 arm (contest prizes 166 vs 174 — band variance in the prize stream, not a bundle effect; the bundle does not change grant counts).

**The four armed entries are the same four fights, twice.** Both legs, identical (only the party cell count differs, 2 → 6):

| Seed / day | Monster | Lead (unarmed) | Holder (ally, armed) | Outcome |
|---|---|---|---|---|
| 107133 / 82 | eulogy | sigrun_eiriksdottir (crossbow, 0 bolts) | fatima_hassan, searcaster :2→:6 | vFlee |
| 107133 / 82 | eater | sam_wilson (sling, 0 stones) | fatima_hassan, searcaster :2→:6 | vFlee |
| 107138 / 75 | strike | gen_nalpnbn (sling, 0 stones) | gen_7etsrtw, searcaster :2→:6 | evade |
| 107138 / 86 | congregation | yara_haddad (no ranged) | gen_7etsrtw, searcaster :2→:6 | vDie (lead dies) |

`volleyFiredFromSearcaster` 0 and `noFusionCellsLines` 0 on both legs — the empty-gun line never even appears, because the holders were armed. The gun is loaded, present, and never fired, because the volley belongs to the lead and the holder is never the lead. This is the same shape as searsupply's ella (armed ally, lead fires a crude bow) and cellgate's naran (loaded ally, lead dies round 1) — now measured with the ammo depth removed as an explanation: with 6 cells in hand, the holder still never leads, so the volley still never fires.

**Presence is shelter-blocked on this band.** Near-miss breakdown (arm, 130 unarmed launches): no-living-holder 114 (87.7%), **sheltered 16 (12.3%)**, every other state 0. The control leg is the same shape (105/121 no-holder, 16 sheltered). Whenever a holder exists at a launch, he is sheltered — usually on the very same tile (dist 0: 2, adjacent: 9, 2-away: 5). Earshot base rate over all non-raid wave-4+ launches: armed 11/130 (8.5%), eligible **0/130 (0.0%)** — no eligible holder was ever in earshot on either leg. The lendable-moment count is 0 on both legs (pool moments 0), agreeing with the near-miss rows.

**Seed 107138 — the divergence, and what caused it.** Both legs: gen_7etsrtw granted day 72, died day 94. After that the gun's fate splits: on ctl it reappears with ursula_weber + visjoin_103 on day 105 (`new-holder`, attribution `unexplained`) and the village loses day 107 after two more day-104 contest searcaster grants; on arm it `vanish`es day 94 (attribution `unexplained`), reappears with the scholar day 109, vanishes again day 116, and the village survives to 144d (w5, st375) with no further grants. The legs' contest streams diverge after the death because the gun's holder changed who stands where — the divergence is downstream of the gun's post-death fate, not of the bundle size (the bundle changes no draw: the first grant is identical on both legs). The arm leg's 2 vanishes vs ctl 0 is the catalina gun-vanish sink recurring (gunrate §6, cellgate §6) — now with the twist that the SAME death produces a holder-died + re-grant path on one leg and a vanish path on the other. The sink is still unrecorded (gift / trade / theft / drop / corpse-take); the next arm that counts guns should instrument transfers (backlog item, cellgate §12).

## 7. Sense testing (transcripts read, not just counted)

- **107133 day 82, eater (arm leg)** — the whole pilot in one fight. Sam leads with a stone-less sling, shouts for help, and **Fatima charges in with a loaded searcaster (6 cells)** — and never fires it. She fights with melee (74 damage), takes hits, goes down in round 4, and Sam flees. The fight log never mentions the gun — no volley (allies don't volley), no hold line, nothing. The fiction doesn't know she has it. The wording is human throughout (shouts, charges, "Sam sees how this ends — and runs while running still works"); the gap is the gun's invisibility when its holder isn't the lead.
- **107133 day 82, eulogy (arm leg)** — Sigrun leads with a bolt-less crossbow; Fatima stands in the party with the loaded searcaster; the log never mentions Fatima at all — she doesn't charge in, the lead "holds the line" and then runs. A loaded alien gun stands in the second row while the lead flees with an empty crossbow.
- **107138 day 86, congregation (both legs)** — yara_haddad leads with no ranged weapon at all and dies while gen_7etsrtw stands by as an ally with the loaded searcaster. The lendfix day-127 shape again (lead dead in 2 rounds, holder a tile away) — but here the holder is IN the fight and still cannot fire, because the volley is the lead's.
- Nothing robotic in the wording; the gap is a role gap (who gets to fire), not a voice gap. The cellgate narration item (bow-generic volley verbs — "nocks an arrow") never arises: no volley fires at all.

## 8. How it finished

The pilot ran as two background legs (ctl ~11 min, arm ~11 min in parallel):

```
cd ~/workspace/worktrees/sim-holdersupply-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-holdersupply-a-ctl SEEDS=107131,107132,107133,107134,107135,107136,107137,107138 RUN=holdersupply-a node scripts/holdersupply-driver-a.js > evidence/2026-11-21/holdersupply-a-sweep-ctl.log 2> evidence/2026-11-21/holdersupply-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 BIGBUNDLE=1 MODE=arm OUTDIR=perseed-holdersupply-a-arm SEEDS=107131,107132,107133,107134,107135,107136,107137,107138 RUN=holdersupply-a node scripts/holdersupply-driver-a.js > evidence/2026-11-21/holdersupply-a-sweep-arm.log 2> evidence/2026-11-21/holdersupply-a-sweep-arm.err
```

Then:

```
cd ~/workspace/worktrees/sim-holdersupply-a
node scripts/analyze-holdersupply-a.js --ctl evidence/2026-11-21/perseed-holdersupply-a-ctl --arm evidence/2026-11-21/perseed-holdersupply-a-arm --out evidence/2026-11-21/holdersupply-a-analysis.json
node scripts/analyze-holdersupply-a.js --dir evidence/2026-11-21/perseed-holdersupply-a-ctl --out evidence/2026-11-21/holdersupply-a-analysis-ctl.json
node scripts/analyze-holdersupply-a.js --dir evidence/2026-11-21/perseed-holdersupply-a-arm --out evidence/2026-11-21/holdersupply-a-analysis-arm.json
node scripts/build-holdersupply-panels-a.js
node scripts/balance-panel.js compare --before evidence/2026-11-21/holdersupply-a-panel-before.json.gz --after evidence/2026-11-21/holdersupply-a-panel-after.json.gz --out evidence/2026-11-21/holdersupply-a-panel
```

**Revert (NO-GO per the frozen ladder):** the game code was reverted before commit — the lever leaves no trace in `src/`. `src/js/contests.js` was restored to the pre-lever version (`git checkout 78666cc38^ -- src/js/contests.js`); the revert diff vs the lever commit is the exact inverse (5 deletions, 1 insertion restoring `units: 2`), and the worktree hash equals the base blob `b7c8eff2c:src/js/contests.js` (`302d0d6187e7cf06506c97c08850d3b3ddab73ea` on both). Verified: 0 `BIGBUNDLE` refs in `src/`, `node --check` clean. The proof test now reads **24/26** (the two 6-cell count assertions fail against reverted code — granting 2, as the reverted code must — the other 24 pass, including draw-neutrality, gate hold/fire, and the analyzer selftest) — the same record the gunrate/cellgate NO-GO arms left for their tests. Substrate tests post-revert: gunrate **39/39**, cellgate **12/12**, lendpool **35/35**. The test is NOT on the green list.
`node scripts/check.js --quick` after the revert: **339 passed, 5 failed in 849s** (exit 1; `evidence/2026-11-21/holdersupply-a-check-quick.log`). The 5 are (1) `test-living-garden-deed-attainment.js` and (2) `test-one-person-army-deed-attainment.js`, both 120s timeouts on slow godpath deed-attainment tests under sibling load (the same timeout class the gunrate post-revert check showed); (3) `test-measurement-proof-update.js` ("Proof source inputs are not current") and (4) `test-measurement-workflow.js` ("retained neutrality proof covers the current Game/controller/harness inputs"); (5) `test-phone-frame-proof.js` (retained browser inputs / phone receipt stale vs current `index.html` + data files). None is in contest, loot, or prize areas, and none can be caused by this arm: post-revert `src/` is hash-identical to the base (the revert cannot change behavior under any flag), and this arm touched no `index.html`, data, harness, or controller file. The proof-freshness / phone-receipt failures are stale retained proofs on this base; the timeouts are sibling-load slowness. The count matches the gunrate arm's post-revert record on its base exactly (339/5). The arm proof suite (26/26 pre-revert) is the lever's own green.

## 9. Metric review (§14)

- No bar was re-scored; the verdict is the analyzer's frozen-bar judge on the full band. The guardrail held with room (3.91 vs 4.03 deaths/engaged; medians equal), and the panel's raw-deaths flag (§4) is the retired metric resurfacing in the panel instrument — it must not be re-introduced as a guardrail at judging time.
- The metric that proved wrong is bar 4's premise as a measure of THIS lever: pool presence measures holder EXISTENCE at launches, which the bundle moves only through armed-window length — and on this band the armed windows were already 100% of holder-days on the control leg (cellDays 167/170), because CELLGATE already keeps the 2 cells alive. The bundle's extra 4 cells bought zero additional armed days (arm cellDays 164 vs ctl 167 — fewer, from band variance in grants). Bar 4's floor (≥ 25%) demands a presence gain from a lever whose mechanism (longer armed windows) had no room left to move once the gate exists. The revision for the next run is a lever that moves WHO leads (armed leads, currently 0 on every band in this chain) and a bar that counts armed LEADS alongside entries (the counter is fixed in this analyzer — see §4 of the prereg), so a leadership failure shows up before the volley floor does.
- Bar 3's floor (≥ 2) was the discriminating bar by design (the bundle's point is a second volley) — and it is the bar that kills the lever cleanly: 0 volleys on both legs, because the volley is lead-only and no holder leads. The bar did its job; the lever, not the metric, is what failed.
- The prereg's falsifier (§4) fired almost exactly as written: armed entries did reach 4 (not ≤ 2), but volleys stayed 0 and presence stayed ~12% — so the conclusion is narrower and stronger than the falsifier's wording: presence is confirmed binding AND the binding constraint within presence is leadership, not ammo depth. A bigger bundle is not re-tried after this.
- Bar 1's floor (40) passed 4.1× — the weight overshot the floor's purpose again (gunrate 4.4×, cellgate 4.9×). The binding constraint has moved downstream of the grant rate, of cell survival, AND of ammo depth; none of those is the next lever (see §10).

## 10. Village assessment (plain words)

Ten of the sixteen villages lived to day 150; six died out (three per leg, at 107–144 days). Every village reached wave 4; five reached wave 5; none reached national, none won. Most villages sit pinned at standing 199 — the wave-4 floor — for the whole back half of the run: they survive, they fight, they do not climb. The two strongest villages (both legs of 107137 at 485) are the ones that kept a full 150 days.

People die out in the wild and in fights, not at home: the arm leg's deaths per engaged meeting actually fell (3.91 vs 4.03), and median survival is identical (150d vs 150d). Five villages in eight finally saw the System's rarest weapon stay loaded — and on the arm leg it stayed loaded with six cells instead of two, for the whole run. And it never once fired. The village's best fighter carries a loaded alien gun into the hardest fights of the run — as the second person in the party, watching the lead fight with an empty crossbow and a stone-less sling. The supply line works now, three times over: the gun arrives, the cells survive, the ammo lasts. What the village needs is not more guns, more cells, or more volleys per gun — it needs the person holding the gun to be the person in front.

## 11. Named next lever

**LEAD-SIDE — put the armed holder in front (or the gun in the hands of the fighters already going).** Two shapes, in order:

1. **Lead-weighted redirect (recipient rule):** weight the gun recipient toward villagers who LEAD wave-4+ fights — a `wave4Lead` term in `_gunRateFighter` (e.g. +4 per wave-4+ launch led, mirroring the wave-3-kill term), replacing or augmenting the expedition term. Premise: the expedition holder is the wrong pick when he never leads the hard fights; the fighters already going are the ones who can fire. Bars for the prereg: armed leads ≥ 2, armed volleys ≥ 1, holder-days ≥ 40, guardrail as frozen here.
2. **Draft the armed holder as lead (launch rule):** when a wave-4+ fight launches and a living armed holder exists in the village, the holder leads (or is drafted into the party as lead). This is a bigger design call — it changes who fights, not just who holds — and should be weighed against shape 1 after shape 1 is measured. The lend re-test prices its participation floor from the measured 0-moment pool (§6) and is still premature until a holder leads.

**NOT the next lever:** a bigger bundle (killed here — 6 cells bought zero volleys); a higher gun rate (killed by gunrate — grants 1→6 bought zero entries); a wider gate (proven by cellgate — the gate works). The chain's binding constraint is now, measurably, leadership.

## 12. Files

- Prereg: `evidence/2026-11-21/sim-holdersupply-a-prereg.md` (commit `abc5509a65`)
- Lever (REVERTED — no trace in `src/`): `src/js/contests.js` restored to base `b7c8eff2c` (hash-verified, see §8)
- Instrument (committed, this run): `scripts/holdersupply-driver-a.js` (clone of the lendpool driver; two-leg MODE guard + BIGBUNDLE checks), `scripts/test-holdersupply-a.js` (26/26 pre-revert on `b7c8eff2c`; 24/26 post-revert, 6-cell assertions only), `scripts/analyze-holdersupply-a.js` (clone of the lendpool analyzer; `judgeHoldersupply` = judgeLend + pool-presence bar; selftest 88/88), `scripts/build-holdersupply-panels-a.js` (rename of the gunrate panel builder)
- Sweeps (complete corpora): `evidence/2026-11-21/holdersupply-a-sweep-ctl.log` / `.err`, `evidence/2026-11-21/holdersupply-a-sweep-arm.log` / `.err`, `evidence/2026-11-21/perseed-holdersupply-a-ctl/` (8 files), `evidence/2026-11-21/perseed-holdersupply-a-arm/` (8 files)
- Smoke (pre-pilot, seed 107131 both legs): `evidence/2026-11-21/holdersupply-a-smoke-ctl.log` / `.err`, `evidence/2026-11-21/holdersupply-a-smoke-arm.log` / `.err`, corpus in `evidence/2026-11-21/perseed-holdersupply-a-smoke/` (2 files, byte-identical except the flag)
- Analysis + panel: `evidence/2026-11-21/holdersupply-a-analysis.json`, `evidence/2026-11-21/holdersupply-a-analysis-ctl.json`, `evidence/2026-11-21/holdersupply-a-analysis-arm.json`, `evidence/2026-11-21/holdersupply-a-panel-before.json.gz`, `evidence/2026-11-21/holdersupply-a-panel-after.json.gz`, `evidence/2026-11-21/holdersupply-a-panel.json`, `evidence/2026-11-21/holdersupply-a-panel.md`
- Quick check (post-revert, backgrounded during evidence writing): `evidence/2026-11-21/holdersupply-a-check-quick.log` / `.err`
- This evidence file
