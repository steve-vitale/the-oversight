# sim-vanishcause-a — gun-vanish CAUSE (finding #2635)

- Arm: sim-vanishcause-a (DIAG), Loop A run fleshout-20261121T1415Z.
- Base master: `b6aad8942`. Branch: `sim-vanishcause-a`.
- Prereg: `evidence/2026-11-21/sim-vanishcause-a-prereg.md` (committed `9185f42ec`, frozen ~15:05 UTC 2026-11-21, before any judged sim).
- Instrument commits: `d85e7f573` (driver + analyzer + proof test + panel builder), `87e07a7af` (smoke catches), `47a51e305` (zero-units census fix), `068a987b3` (day-before seating lookup).
- Horizon: 150d death-aware. Seeds: 107221–107228 (fresh band, verified unused). Policy: competent (verbatim). Substrate: `GUNRATE=1 CELLGATE=1`; `LEND` off, `PRESENCE` off. Env (both legs identical): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.
- Two legs, leg1 + leg2, identical env — the second leg is the instrument-neutrality proof (a diag with no lever; the honest panel result is no material signal everywhere).

## Verdict: DIAG-GO

**The gun never vanishes.** Every holder change on the judged band has a cause, and no searcaster is ever lost to an unknown sink. The three censuses' ~70–80% "unexplained" was a measurement artifact with three parts: (1) the old holder map cannot see an equipped scholar gun, so every equip/unequip/succession read as a vanish/new-holder pair; (2) a holder who becomes the scholar keeps the gun, and the old map reads that as a vanish; (3) a holder who dies in the wild leaves the gun on their corpse, where it sits until someone takes it — the old detector recorded the death only for villagers, never for the scholar.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| Attribution rate (holder changes with a non-unexplained cause) | ≥ 80% | 8/8 = 100% (leg1) | ✅ |
| ≥ 1 vanish cause named with mechanism + code path | ≥ 1 | 2 vanish causes named (died-holding, succession) | ✅ |
| Instrument validity | proof test green + selftest green + 0 instrument errors + 0 rows without location + consistency match | proof test 57/57 green; analyzer selftest 27/27 green; instrumentErrors 0; rowsWithoutLocation 0; consistencyMatch true (recomputed legacy diff == driver rows on all 8 seeds) | ✅ |
| Guardrail neutrality (instrument does not perturb the sim) | --compare NEUTRAL + panel no material signal | --compare NEUTRAL, 0 mismatches, all 8 seeds identical sim fields; panel compare: every observed metric delta 0, no_material_signal | ✅ |

## Wall numbers (leg1, 8 seeds)

| Metric | Value |
| --- | --- |
| Wins | 0/8 |
| National scale access | 0/8 |
| Table | not instrumented (null) |
| Wave 5 reached | 1/8 (107225) |
| Wave 4 reached | 8/8 |
| Median survival | 150 days |
| Community lost | 3/8 (107221 d115, 107222 d111, 107227 d103) |
| Standing at end | 199 on 5 seeds, 280 (107225), 170 (107226), 100 (107227) |

The scale wall still binds: no village reaches national, none wins. This arm was a diag on the gun-vanish question, not a scale lever — the wall numbers are recorded, not moved.

## Per-seed table (leg1)

| Seed | Days | End | Wave | Standing | Deaths | Searcaster grants | Holder changes | Explained | Guns at end |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107221 | 115 | village-lost | 4 | 199 | 99 | 0 | 0 | — | 0 |
| 107222 | 111 | village-lost | 4 | 199 | 72 | 2 | 2 | 2 | 2 |
| 107223 | 150 | survived | 4 | 199 | 62 | 0 | 0 | — | 0 |
| 107224 | 150 | survived | 4 | 199 | 69 | 1 | 3 | 3 | 1 |
| 107225 | 150 | survived | 5 | 280 | 63 | 0 | 0 | — | 0 |
| 107226 | 150 | survived | 4 | 170 | 50 | 1 | 1 | 1 | 1 |
| 107227 | 103 | village-lost | 4 | 100 | 70 | 1 | 2 | 2 | 1 |
| 107228 | 150 | survived | 4 | 199 | 65 | 0 | 0 | — | 0 |

Totals: 5 searcaster grants across 8 seeds; 8 holder changes, all 8 explained; 5 guns at end, every one located — 3 on corpses (both of 107222's, 107227's), 1 in the scholar's pack (107224), 1 equipped on its living holder (107226, meera_reddy).

## 1. The smoke gate (pre-pilot, seed 107058)

The prereg required the instrument to attribute BOTH known vanishes from the presence band before any judged sim: catalina_reyes day 93 and the scholar's gun (day 119 on that band). Result: **4/4 attributed, DIAG-GO on the smoke seed** (150d, survived, wave 4, standing 199).

| Day | Row | Cause | Mechanism |
| --- | --- | --- | --- |
| 77 | new-holder → catalina_reyes | grant-contest-prize | `_cxItemPrize` → `alienLootGrant` (GUNRATE redirect), contests.js:229 |
| 93 | vanish catalina_reyes | pack-transfer | **playerDeath succession** (ledger.js:658): catalina became the scholar (old scholar gen_y4t6xan died "the wild"); the gun stayed equipped, now scholar-equipped — invisible to the old holder map |
| 95 | new-holder → __scholar__ | pack-transfer | **Game.equip displacement**: the policy equipped a fire_hardened_spear over the dry searcaster and the gun went back to the pack (no unequip call) |
| 108 | vanish __scholar__ | died-holding | **playerDeath** (ledger.js:658): the scholar died holding (pack); inventory + equipped gear → corpse death pack; successor naran_tumen; nothing auto-transfers |

Note on the gate as written: on the current master (b6aad8942) the scholar vanish lands day 108, not day 119 as on the presence band's older master — the trajectory moved when master moved, but the same two vanish shapes occur and both attribute. The gate is met in substance (both known vanish mechanisms named), not by day number.

The smoke caught four instrument bugs before the pilot (fixed in `87e07a7af`, all covered by new selftest/proof-test cases):
1. The analyzer read `sd.gunLocRows`; the corpus field is `v4gunLoc` — every row came back "no-prior-census" until fixed (selftest case 14 now uses the corpus shape).
2. The lend wrap recorded every `_lendSearcaster` CALL (62 on the smoke); the function returns null when LEND is off. It now records fires only (0 on every pilot seed, as required).
3. Equip displacement was unrecorded: `Game.equip` of another weapon over an equipped searcaster sends the gun to the pack with no unequip call. The wrap now records the displaced piece.
4. Succession was unattributed: the analyzer had no playerDeath-successor branch.

The pilot then caught two more (`068a987b3`, `47a51e305`):
5. The seating event lands the day BEFORE the census row changes: `villagerGearDay` (villager-build.js:906) runs after the driver's end-of-day snapshot. The analyzer now looks back a day for the autoEquip row.
6. **Zero-units stacks are taken, not present**: `_corpseTakeStack` (corpses.js:463) zeroes `it.units` instead of splicing the entry out, and the census's `(e.units || 1)` counted a taken gun as still on the corpse — seed 107224 ended with a phantom second gun. `countItemIn` now treats `units === 0` as absent. The pilot was re-run on the fixed instrument; the sims reproduced identically on every field and 107224's gun total corrected 2 → 1.

## 2. Every holder change on the judged band, with its cause

| Seed | Day | Row | Cause | Mechanism (code path) |
| --- | --- | --- | --- | --- |
| 107222 | 73 | new-holder → gen_gmy38x3 | pack-transfer | autoEquip seated a carried gun — villagerGearDay (villager-build.js:906), day 72: crude_bow → searcaster; granted day 72 via contest-prize |
| 107222 | 81 | vanish gen_gmy38x3 | died-holding | registerDeath (corpse corpse_81_mznm7d, cause "the wild") — gun on the corpse |
| 107224 | 111 | new-holder → gen_q9x1lf3 | pack-transfer | autoEquip seated a carried gun — villagerGearDay day 110: bow → searcaster; granted day 110 via contest-prize (auction) |
| 107224 | 126 | vanish gen_q9x1lf3 | pack-transfer | **playerDeath succession** (ledger.js:658): gen_q9x1lf3 became the scholar (old scholar gen_rc0dd1q died "the wild"); gun stayed equipped, now scholar-equipped |
| 107224 | 143 | new-holder → __scholar__ | corpse-take | **_corpseTakeStack** (corpses.js:463): the new scholar took the searcaster off gen_q9x1lf3's corpse (corpse_142_lgiqih) |
| 107226 | 59 | new-holder → meera_reddy | pack-transfer | autoEquip seated a carried gun — villagerGearDay day 58: (empty) → searcaster; granted day 58 via contest-prize |
| 107227 | 71 | new-holder → app_mgpsphsc177 | pack-transfer | autoEquip seated a carried gun — villagerGearDay day 70: (empty) → searcaster; granted day 70 via contest-prize |
| 107227 | 76 | holder-died app_mgpsphsc177 | died-holding | registerDeath (corpse corpse_76_jf610c, cause "the wild") — gun on the corpse |

Cause counts: pack-transfer 5 (4 seatings + 1 succession), died-holding 2, corpse-take 1, grant-contest-prize 0 as a row cause (every grant is followed a day later by a seating row, which carries the grant day — the grant itself is the arrival, the seating is the holder change the old map saw). No row is unexplained. No inter-villager transfer, gift, trade, theft, drop, or inventory-expiry occurs on any seed: 0 searcaster dropEvents, 0 searcaster stealEvents (stealFrom moves kcal only, as the code read said), 0 gift/trade paths fired, 0 lends fired.

One seed tells the whole lifecycle (107224): the gun is won at an auction on day 110, seated the next morning, carried into the wave-4 fight that kills the scholar on day 126 — and the holder, who survives that fight, inherits the scholar's mantle and the gun with it — dies in the wild on day 142, and the next scholar takes the gun from their body on day 143. Nothing is lost at any step; the gun is located every single day of the 150.

## 3. What the prior censuses were actually seeing

- **shape2 (77.8% unexplained) and presence (three repeating vanishes)**: the "vanish" was the old holder map going blind, in exactly the two ways this instrument names. catalina_reyes day 93 (presence §6, cellgate #2624) is succession, not a sink — she became the scholar and kept the gun. The scholar's gun "vanish" is the scholar dying holding it (died-holding, gun on the corpse death pack) or equipping it (pack-transfer into the blind spot). The three vanishes that repeated exactly on both presence legs were deterministic because the underlying events (a contest grant, a succession, a death) are deterministic on the seed — not because a sink repeats.
- **holdersupply §6 (same death, holder-died on one leg, vanish on the other)**: the same death reads differently depending on whether the dead holder was the scholar. The old detector attributed villager deaths (holder-died) but never scholar deaths (vanish). The instrument fixes the scholar side: a scholar death is died-holding with the corpse named.
- **lendpool §10 ("died holding vs stopped holding")**: resolved. Both happen and the instrument tells them apart: died-holding (registerDeath/playerDeath, gun on the corpse) vs stopped-holding (equip displacement when the gun runs dry, or autoEquip seating/unseating). On this band the stopped-holding cases are the displacement (smoke day 95) and the seatings; no holder ever stops holding by dropping, gifting, trading, or being robbed.

## 4. Sense-test — do the villagers act like people?

Read the full telemetry for seed 107224 around the gun's life-chain (scripts/sense-vanishcause-a.js, same env, TELEMETRY_FULL=1; the driver wraps consume no RNG, so the trajectory reproduces the pilot corpus exactly). It reads as people, not bookkeeping:

- Day 110 dawn: the searcaster drops as loot and `broadcast_item_prize` names gen_q9x1lf3 as the auction winner. The same day, villagers gift each other gear (gen_q9x1lf3 gives nadia_khoury a bow; nadia_khoury gives gen_rc0dd1q hide armor) and share lingering meals (+2 trust both ways).
- Day 126 dusk: gen_q9x1lf3 logs an `outmatched_escape` against a wave-4 Reunion — they fled a fight they couldn't win. In the same dusk the scholar gen_rc0dd1q dies "the wild" in that fight (fight_finish: 4 rounds, Reunion), and `mantle_become` passes the scholar's mantle to gen_q9x1lf3 — the gun-holder, who survived the fight that killed the scholar, becomes the scholar.
- Day 142 midday: gen_q9x1lf3 (now the scholar) dies "the wild"; the mantle passes to lena_ruiz. Day 143 night: `loot_taken` — the searcaster, taken from the body.

The chain is legible end to end: win it, carry it, survive the fight your scholar dies in, inherit their place, die in the wild yourself, and have the next scholar take the gun from your body. The villagers gift, eat together, take in strangers (day 124: trust −1 "a stranger taken in without your word"), and flee fights they can't win. Sense-test passes. One narration gap carried forward from the prior arms (not this arm's scope): the opening-volley log lines are still bow-generic for the searcaster (sim-findings #2623).

## 5. Instrument-neutrality proof

- `--compare` leg1 vs leg2: **NEUTRAL, 0 mismatches** — all 8 seeds have identical sim fields (days, endReason, maxWave, standing, scaleRank, deaths, transfers, grants, corpseTakes, playerDeaths, lends, errors).
- Balanced panel (`scripts/build-vanishcause-panels-a.js` + `scripts/balance-panel.js compare`, attached as `evidence/2026-11-21/vanishcause-a-panel.md`): every observed metric has paired delta 0 — national 0→0, survival 1→1, village deaths 68.75→68.75, community loss 0.375→0.375 — all no_material_signal. The panel's overall decision reads `review_required` because most contract metrics are not observed by this instrument (table, player deaths, sampled NPC state) — that is the tool's default for a partial metric set, not a divergence; the observed metrics are all neutral.
- The re-run pilot (after the zero-units fix) reproduced the first run's sim fields exactly on all 8 seeds, confirming the driver fix is pure (reads only, no RNG, no state writes).
- 0 src delta: `git diff b6aad8942 -- src/` is empty. The instrument is driver wraps + analyzer only; no recorder hooks in src were needed (every transfer/loss event is a Game/Scattering namespace method visible to a driver wrap).

## 6. Named next lever (NOT built here — separate arm)

**Grant scarcity, not gun loss.** The vanish question is closed — no gun is ever lost to an unknown sink — but the holder-supply question moves upstream: 4 of 8 pilot seeds see ZERO searcaster grants in 150 days, and the band totals 5 grants in 8 runs. The gun enters the world only through contest prizes (plus one kill-loot drop to a monster corpse nobody took, seed 107222 day 105). A village that never wins a gun can never have a holder, and the two holders who did die both died "the wild" with the gun on their corpse — recovered only when a later scholar happens to loot that corpse. The next arm should measure the grant rate itself (contest-prize frequency per seed, and whether a holderless village ever gets a second chance) — a supply arm, not a fix to the transfer paths. No game fix is owed by this arm: succession, displacement, death, and corpse-take are all the game working as designed; the only defect found was in the old census (the blind spot), and the instrument, not the game, is the fix.

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed 9185f42ec ~15:05 UTC): attribution ≥ 80%, ≥ 1 vanish cause named, instrument validity, guardrail neutrality. All four pass on the judged pilot; no re-scoring, no bar moved after the fact.
- **Smoke-gate deviation, stated plainly:** the prereg named the scholar vanish as "day 119" from the presence band; on this master it lands day 108. The gate was judged on the mechanisms (both known vanish shapes attributed), not the day number; the shift is master movement between the presence run and b6aad8942, confirmed by the identical catalina day-93 reproduction.
- **Closed-set proposals for the next instrument revision** (not retroactively applied): the frozen set has no `succession` label — succession is currently mapped to pack-transfer with the mechanism naming playerDeath. A `succession` label would make it first-class. Likewise `left-with-holder` for a holder who leaves the roster alive (removeVillager exiled/fled/splinter with the gun in their pack) — that branch fired 0 times on this band, but the mechanism text is written for it.
- **Day-boundary timing:** events can land a day before the census row that shows them (villagerGearDay runs after the end-of-day snapshot). The analyzer looks back one day for autoEquip rows; the same one-day window should be assumed for any future event type whose caller runs after the snapshot.
- **Inherited quirk, noted not fixed:** the driver's `endPantryKcal` uses `(i.units || 1)` — the same zero-units shape as the census bug, for pantry food. It feeds no judged field and no evidence number in this report; a future driver-family cleanup should apply the same `units == null ? 1 : units` rule there.
- **Panel `review_required`:** driven by unobserved metrics, not by any observed signal. Do not read it as a failed guardrail; the guardrail bar is the --compare NEUTRAL plus the per-metric no_material_signal verdicts.
- **Heartbeat:** landed 15:52:59 UTC; one skip at ~15:38 UTC (registry lock held > 120s — "heartbeat skipped, retry later"), retried and landed. No write-flap window hit this run's file writes; the safe-commit index clobber struck on all four instrument commits (staged-as-deleted / MM forms) and was repaired each time with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified by empty status + empty diff HEAD + hash-object match.
- **What was NOT measured:** table entry/sitting (not instrumented — left null, never faked); player deaths per run (not instrumented); whether a corpse-taken gun is ever USED in a fight after recovery (the gun's combat value is the gunrate arm's question, not this one).

## Files

- Prereg: `evidence/2026-11-21/sim-vanishcause-a-prereg.md` (9185f42ec)
- Instrument: `scripts/vanishcause-driver-a.js`, `scripts/analyze-vanishcause-a.js` (selftest 27/27), `scripts/test-vanishcause-a.js` (57/57 green), `scripts/build-vanishcause-panels-a.js`, `scripts/sense-vanishcause-a.js`
- Smoke: `evidence/2026-11-21/perseed-vanishcause-a-smoke/` (seed 107058, 4/4 attributed), `evidence/2026-11-21/vanishcause-a-smoke-analysis.json`, `evidence/2026-11-21/vanishcause-a-smoke-v1.json` (pre-fix corpus, kept as the record of the first smoke), `evidence/2026-11-21/vanishcause-a-sense.log`
- Pilot: `evidence/2026-11-21/perseed-vanishcause-a-leg1/` (8 corpora), `evidence/2026-11-21/perseed-vanishcause-a-leg2/` (8 corpora), `evidence/2026-11-21/vanishcause-a-leg1-analysis.json`, `evidence/2026-11-21/vanishcause-a-neutrality.json`
- Panel: `evidence/2026-11-21/vanishcause-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Logs: `evidence/2026-11-21/vanishcause-a-leg1.log`, `vanishcause-a-leg2.log`, `vanishcause-a-smoke.log`, `vanishcause-a-smoke2.log`
