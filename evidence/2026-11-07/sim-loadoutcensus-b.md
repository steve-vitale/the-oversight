# sim-loadoutcensus-b — loadout census evidence (DIAG)

**Arm:** sim-loadoutcensus-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261107T2130Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 (this arm is the bisect's fix-shape sketch Q1) · **Branch:** sim-loadoutcensus-b (base master `ece67e0b2`) · **Prereg:** `evidence/2026-11-07/sim-loadoutcensus-b-prereg.md` (commit `65a314dc4`, before any judged census read) · **Instrument:** day-0 keep-5 census driver `scripts/loadoutcensus-20261107.js` + analyzer `scripts/analyze-loadoutcensus-20261107.js` · **Proof:** `scripts/test-loadoutcensus-20261107.js` **34/34 green** (re-run at branch tip after the sweeps). Corpora: `evidence/2026-11-07/perseed-loadoutcensus-b-c1/` and `perseed-loadoutcensus-b-p2/` (8 seeds each, committed).

## Verdict: DIAG-NO-GO — the loadout pathway is NOT confirmed

The retune changes **nothing** about the opening loadout. Across 96 villagers × 8 seeds, **0 of 96 keep-5s changed** C1→P2, and every pooled aggregate is identical to three decimals:

| Pooled (96 villagers) | C1 | P2 | Δ |
|---|---|---|---|
| Mean weapons kept / villager | 0.594 | 0.594 | **0.000** |
| Mean tools kept / villager | 0.240 | 0.240 | 0.000 |
| Mean armor kept / villager | 0.698 | 0.698 | 0.000 |
| Mean sentimental kept / villager | 3.698 | 3.698 | 0.000 |
| Armor-kept share | 0.137 | 0.137 | **0.000** |
| Equipped-melee rate (day 0) | 0.271 | 0.271 | 0.000 |
| Equipped-ranged rate (day 0) | 0.302 | 0.302 | 0.000 |
| Mean armor pieces equipped | 1.55 | 1.55 | 0.000 |
| Weapons stashed (total) | 50 | 50 | 0 |
| Armor stashed (total) | 88 | 88 | 0 |

- **Bar A** (mean weapons kept down ≥1.0): Δ = 0.000 — fails. (Also see metric review: the bar was miscalibrated — the C1 baseline is 0.594, so a ≥1.0 drop was mathematically impossible. The bar fails on the numbers as written; no re-scoring.)
- **Bar B** (armor-kept share up ≥10pp): Δ = 0.000 — fails.
- Per-seed, every cell is identical too (weapons kept 8/6/6/8/8/8/7/6, armor kept 6/7/8/9/10/6/11/10, equipped melee 3/4/3/3/4/4/3/2 across seeds 53001–53008 — same at C1 and P2). Pool identity holds: 0 pool mismatches — the same 8-item pools generated at both checkouts, as a data-only change must.
- The instrument is proven to see a shift when one exists: the proof's synthetic-loadout control reads the hide-armor flip (weapon bonus 12 scores 120; armor 20→100 at C1, 30→150 at P2), and the P2 corpus itself carries the retuned scores (19 armor ids changed: military_vest 200→300, swat_vest 175→265, riot_gear 150→225, hide_armor 100→150, leather_jacket 75→115, bark_armor 50→75, down to knit_cap 5→10; itemsSha `a56a60af5` = the `50881fbf2` blob). The zero is a real zero, not an instrument miss.

Per the prereg, the verdict therefore goes to the **combat-divergence account**: first-divergence day + fight-outcome comparison, already partly done in the bisect — cite it, do not re-prove it. The bisect showed the first 2–5 fights identical on every seed, streams splitting d6–d9 (53003 identical through d6, split d8; 53006 identical through d8, split d9; 53001 same fighter, same day d7, different monster spawned — sanjun vs belltoad), first living-count divergence d10–d23. The retune's remaining pathways are combat math itself (`armorReduction` — higher protection should HELP in a fight, which makes the collapse more puzzling, not less) and downstream RNG re-rolls after an early combat outcome changes. The bisect's fix-shape sketch Q2 (freeze keep/equip scores at pre-retune protection) is **killed by this verdict** — it has no mechanism to fix, since the scores it would freeze never move a keep. Do not build it.

Scope note: this rules out the **day-0** loadout only. Later-game equip shifts from retuned loot (armor found in the wild scoring higher in `equipScore`) are not covered by a day-0 census and stay open — but they cannot explain the d6–d9 divergence, which happens before meaningful loot arrives.

## Reproduction gate (ran FIRST, before any judged census read — PASSED)

Doorwalk baseline driver, 150d, frozen band 53001–53008, same frozen instrument as the bisect:

**C1 `16369893c` — reproduces the bisect's C1 exactly** (median 150d, sits 5/8):

| Seed | Days | End | Standing | MaxWave | Seat | Sat | w4 kills |
|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | 175 | 4 | — | — | 0 |
| 53002 | 79 | village-lost | 125 | 4 | — | — | 0 |
| 53003 | 150 | survived | 344 | 5 | lesser | d90 | 3 |
| 53004 | 150 | survived | 260 | 5 | lesser | d94 | 2 |
| 53005 | 97 | village-lost | 230 | 5 | lesser | d90 | 3 |
| 53006 | 150 | survived | 849 | 5 | lesser | d90 | 8 |
| 53007 | 86 | village-lost | 99 | 3 | — | — | 0 |
| 53008 | 150 | survived | 199 | 4 | lesser | d90 | 0 |

**P2 (C1 + gear retune only) — reproduces the bisect's P2 shape exactly** (median 76d, sits 2/8):

| Seed | Days | End | Standing | MaxWave | Seat | Sat | w4 kills |
|---|---|---|---|---|---|---|---|
| 53001 | 122 | village-lost | 199 | 4 | — | — | 1 |
| 53002 | 68 | village-lost | 165 | 4 | lesser (earned, never sat) | — | 0 |
| 53003 | 150 | survived | 195 | 4 | lesser | d126 | 3 |
| 53004 | 75 | village-lost | 199 | 4 | lesser (earned, never sat) | — | 4 |
| 53005 | 77 | village-lost | 199 | 4 | lesser (earned, never sat) | — | 0 |
| 53006 | 75 | village-lost | 175 | 4 | — | — | 4 |
| 53007 | 63 | village-lost | 125 | 4 | — | — | 0 |
| 53008 | 150 | survived | 515 | 5 | lesser | d126 | 9 |

P2 construction (exactly as the bisect did): `git diff 16369893c 50881fbf2 -- src/data/items.json` applied onto a C1 checkout (patch verified to apply cleanly before the prereg; 20 hunks, protection values only, no code). Resulting `src/data/items.json` hash `a56a60af5` = the `50881fbf2` blob. Reproduction corpora in `/tmp/loadoutcensus-kit/repro/{c1,p2}/` (bisect working data, not committed); flip tables above are the durable record. 0 instrument errors on all 16 sweeps.

## Per-seed census table (C1 = P2 on every cell — one table serves both)

| Seed | Villagers | Weapons kept | Tools kept | Armor kept | Sentimental kept | Armor share | Melee equipped | Weapons stashed |
|---|---|---|---|---|---|---|---|---|
| 53001 | 12 | 8 | 4 | 6 | 44 | 0.100 | 3/12 | 6 |
| 53002 | 12 | 6 | 4 | 7 | 45 | 0.117 | 4/12 | 6 |
| 53003 | 12 | 6 | 4 | 8 | 45 | 0.133 | 3/12 | 6 |
| 53004 | 12 | 8 | 1 | 9 | 43 | 0.150 | 3/12 | 6 |
| 53005 | 12 | 8 | 2 | 10 | 44 | 0.167 | 4/12 | 6 |
| 53006 | 12 | 8 | 3 | 6 | 44 | 0.100 | 4/12 | 7 |
| 53007 | 12 | 7 | 2 | 11 | 45 | 0.183 | 3/12 | 7 |
| 53008 | 12 | 6 | 3 | 10 | 45 | 0.167 | 2/12 | 6 |

## Why zero flips — the mechanism (read off the dumps, not assumed)

**1. The sentimental lock.** Keepsakes score +1000; everything else scores 0–400. Mean sentimental kept is 3.70 of 5, and **39 of 96 villagers keep 5/5 keepsakes** — their keep-5 is fully locked before any gear scores are compared. Only ~1.3 slots per villager are contestable at all, and no armor score (max 300, military_vest at P2) can ever displace a keepsake.

**2. The contestable margin is wide where it matters.** The retuned armors actually in opening pools are mostly cheap clothing (protection 1–6 → scoreDet 5–30 at C1, 10–45 at P2) competing against weapons (bonus 5–35 → 50–350) and tools (50). The gaps at the cut are usually far larger than the retune's delta.

**3. The closest calls cancel out.** Corrected closest-call analysis (retuned stashed armor's P2 score minus the lowest *chosen*-kept score, across all 96 villagers): the maximum advantage is **+10** — Victor Lopez (mason, seed 53003), good_boots 25 vs canvas_pants 25 at P2, a tie (15 vs 15 at C1). The next five are all +5 (flannel_shirt / work_gloves / rain_poncho vs 10–20). And the tie is not a near-miss the random term saved: canvas_pants is itself retuned (15→25), so both sides of the cut rose together — the gap never moved. Zero of 75 villagers with a retuned stashed armor had an advantage over 10, i.e. none could flip regardless of the `Math.random()*10` idiosyncrasy term.

**4. The big armors never sit at the cut.** military_vest (200→300), swat_vest (175→265), riot_gear (150→225), hide_armor (100→150) are rare in opening pools (12 pool items above protection 25, of 146 armor items) and, where present, sit behind the sentimental lock (e.g. Vy Russell stashes a swat_vest at 265 while her fifth kept item is a keepsake at 1000). They were never the marginal item.

**5. A second armor channel the retune cannot touch.** 9 of 96 villagers carry a sixth item — always `bark_armor`, never in their pool. Provenance pinned: `seedArmorWearer()` (`src/js/game.js:17608`) grants bark_armor at founding to up to 3 staying villagers who carry no armor, then re-equips them. The grant is unconditional on protection, so the retune cannot change who gets seeded. (Census note: the keep-5 is not always 5 — see findings.)

## The keep-5 dumps (the proof artifact)

Seed 53003, C1 — identical at P2 on every row:

**Franz Stevens, butcher, the scholar.** Keeps: bus_map, lucky_coin, rope_50ft, photo_album, knife_roll — all sentimental. Stashes: grandfathers_knife (other, 0), **machete (weapon, bonus 35, scoreDet 400)**, flannel_shirt (armor, prot 2). Wears: bus_map as a hat, keepsakes as accessories. No weapon, no armor.

**Maeve Schulze, sailor.** Keeps: dog_tags, trail_compass, mixtape, paperback, knife_roll — all sentimental. Stashes: **fire_hardened_spear (weapon, bonus 15, scoreDet 150)**, rain_shell (armor, prot 3), binoculars. Wears dog_tags as a hat, keepsakes as accessories.

**Cheyenne Rong, aquarium_keeper.** Keeps: dispatchers_headset, reading_glasses, search_locket, boot_stone, seed_packet — all sentimental. Stashes: skull_helm (armor, prot 18, scoreDet 90), sharpened_stick (weapon, bonus 5), poultice_bandolier. Wears the headset as a hat, keepsakes as accessories.

**Vy Russell, seed 53005** (the apparent closest call — resolved, not a flip): keeps 5 keepsakes; stashes a crude_bow (180) and a swat_vest (175→265 at P2). Her sixth carried item is the seeded bark_armor (worn as torso). The swat_vest never competes with a keepsake.

## Sense-test: do the loadouts read like people gearing for the wild?

No — they read like people fleeing with their memories, which is human and heartbreaking, and also a scoring artifact. The butcher who is the village's scholar walks out of Haven wearing a bus map on his head, a lucky coin and a photo album in his pockets, while a machete — the best weapon in his pool by a factor of four — sits in his stash at his space in haven. The sailor stashes her only spear. The pattern is the design working as written (Steve 2026-10-09: keepsakes stay, +1000), not a bug — but it means the opening keep-5 is barely a gear choice at all: 39 of 96 villagers make no gear choice whatever. The mitigation is real and in the code — before ranging out, villagers fetch the best weapon and the best armor from their own stash (`game.js:7540` region) — so the machete is not lost, only not carried on day 0. What the census cannot say is whether that fetch happens in time: the equipped-melee rate at day 0 is 27%, and the first ambushes come in the first two weeks (bisect: no C1 village loses anyone before d28; P2 villages lose people by d9–d25). Whether the stash-fetch covers the early game is unmeasured — it is a finding, not a verdict (see `sim-findings.md`).

## Village assessment (reproduction corpora, doorwalk baseline leg)

**What the villages looked like.** At C1 the band is the healthy one the bisect recorded: five villages survive to the 150d cap, five sit the lesser seat (d90–d94), standing runs 99–849. At P2 the same eight villages, same pools, same people — and six die between d63 and d122, only 53003 and 53008 surviving to sit late (d126). The collapse is visible in the wall numbers before anything else: median 150d → 76d, sits 5/8 → 2/8, wave-5 unlocks 4/8 → 1/8.

**Who thrived and who died and why.** The two survivors at P2 are the villages whose fighters killed the most: 53008 makes 9 wave-4 kills (up from 0 at C1) and reaches standing 515; 53003 makes 3. The dead villages are not the ones whose fighters lost — P2 makes MORE wave-4 kills than C1 (21 vs 16) while dying sooner. Death causes shift the way the bisect described: wounds 12 → 4, sickness 18 → 14, starvation 1 → 4, 'the wild' 32 → 33, monster 14 → 12 (fallen totals 97 → 90 — fewer fallen because the villages die younger, with fewer people-days lived). The mechanism the bisect named still fits: early violent deaths thin the roster, then too few hands remain to keep anyone fed. What this arm adds is what it does NOT fit: it is not the opening loadout. The villages die with the same gear they always had.

**What knowledge/capabilities were missing.** Nothing about gear: the opening loadout is identical, the seeded bark_armor reaches the same villagers, the stash-fetch exists. What is missing is an account of the first week: the streams split d6–d9 on a retune that touches only defensive math, and the split is downstream of combat outcomes (different monster spawned for the same fighter on the same day). The missing capability is a first-divergence instrument — per-fight outcome comparison across the split — which the next arm needs.

## Wall numbers (this run's corpora, doorwalk baseline leg)

- C1: national 0/8, table-sat 5/8, wins 0/8 (baseline leg never walks a door), wave-4 unlocks 7/8, wave-5 unlocks 4/8, median survival 150d.
- P2: national 0/8, table-sat 2/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 1/8, median survival 76d.
- Telemetry deviation check: not run — this is a DIAG census, not a lever before/after; the reproduction gate (both endpoints exact) is the validity check.

## Convergence state

scale-onramp stays converging (NOT converged): the collapse is bisected to xp-gear and the loadout pathway is now ruled out, but the fix is unbuilt — the frozen band is still collapsed on current master, and the next winnability confirm (fresh band 53201–53212) must not lean on it until the fix arm lands. The doorwalk branch stays HELD. Next blanks, in order: (1) the combat-divergence probe — per-fight outcome comparison across the d6–d9 split at C1 vs P2 (first-divergence day, which fight's outcome moved, and whether the divergence is a damage-taken difference or a pure RNG re-roll); (2) the XP-half early-death probe (P1's 3/8); (3) metric revision (per-seed non-inferiority) + 12-seed confirm on 53201–53212.

## Metric review

- **Bar A was miscalibrated — recorded, not repaired mid-run.** The sketch assumed villagers kept ~2 weapons each; the measured C1 baseline is 0.594. A ≥1.0 drop was mathematically impossible from the start (floor 0). The bar fails at Δ = 0.000 exactly as written. The next census-style prereg must set bars from a measured baseline (pilot the C1 census first, then set the bar) — the pilot gate (§9) exists for this, and this arm ran its C1 census only after the prereg committed. Own the miss: the prereg should have piloted.
- Bar B was well-formed (armor share 0.137 at C1, 10pp of headroom) and failed cleanly at Δ = 0.000. No re-scoring happened: neither bar was swapped, relaxed, or re-read against a friendlier metric.
- One instrument correction made during analysis (disclosed): the first closest-call pass compared P2 stashed-armor scores against the C1 lowest-kept score, which overstated the near-misses — the lowest-kept item was often itself retuned (Victor Lopez: canvas_pants 15→25, same as good_boots 15→25). Corrected to compare P2-vs-P2 (retuned stashed vs lowest *chosen*-kept at P2 scores); the corrected max advantage is +10, a tie, and zero villagers exceed it. The verdict does not depend on the correction — the analyzer's kept-set diff (0/96) is the verdict, and the closest-call analysis only explains it.
- The proof's live determinism leg ran at branch tip (post-retune code) and re-ran 34/34 after the return; the census corpora themselves were produced at C1/P2 and are the judged read.
- The safe-commit index clobber hit this arm's second commit (all 4 committed files showed staged-as-deleted, worktree files byte-identical to HEAD); repaired via HEAD-blob cacheinfo, hashes verified, before any checkout. The commits were always correct; only the index lied.
- No balanced-panel compare (§15): the question is a census diff between two frozen checkouts, judged by the pre-registered bars; the reproduction sweeps are the validity check.

## Canon note

No canon doc covers the keep-5 / loadout system specifically (checked `docs/CANON.md` manifest). The design record is code: `choosePersonalFive` (`src/js/game.js:1920`), `equipScore` (`src/js/equipment.js:240`), `autoEquip` (equips only from kept items), the stash-fetch (`src/js/game.js:7540` region), `seedArmorWearer()` (`src/js/game.js:17573`).

**Merged locally, pending ship:** NOTHING merged — report ready-to-merge; the coordinator lands it. Branch `sim-loadoutcensus-b` at the corpus+evidence commit (see report).
