# sim-bowcraft-a — evidence

- **Arm:** sim-bowcraft-a (BUILD + measure, axis scale-onramp)
- **Run:** fleshout-20261119T1415Z, Loop A
- **Base:** master `de9bb3c22`
- **Worktree:** `~/workspace/worktrees/sim-bowcraft-a`
- **Branch:** `sim-bowcraft-a` (fix commit `cb8dec615`)
- **Seeds:** 107001–107008 (the bowsource band — deliberately REUSED, not fresh: before/after on the measured band)
- **Horizon:** 150d, death-aware
- **Policy:** competent verbatim (`scripts/policies/competent.js`)
- **Substrate (both legs):** VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1; BOWOPEN unset, SPEARGATE unset, LAUNCHPARTY unset (dead flag)
- **Leg difference is BOWCRAFT only:** ctl unset, arm `=1`
- **Prereg:** `evidence/2026-11-19/sim-bowcraft-a-prereg.md` (frozen 2026-11-19 ~15:05 UTC, before any judged sim)
- **Verdict:** **BUILD-GO** (all four frozen bars pass — §2)
- **Closeout note:** the run timed out at closeout. The fix was already committed (`cb8dec615`) but no analyzer run, panel, or evidence file existed. This file was written by a finalize pass that re-verified everything from the files and git: both legs ran to completion on identical seeds, the analyzer and panels were run fresh, the proof test and analyzer selftest were re-run green, and the arm-leg corpora recovered from the log fallback were verified byte-identical to the dumps. Nothing in this file takes the timed-out run's word for anything.

## 1. The question

The bowsource diag (8 seeds × 150d, band 107001–107008) proved the home craft duty `villagerWeaponCraftDay` (villager-build.js) fired **0 times in 90 eligible-villager-days**: the duty serves weaponless villagers only, and bow knowledge is seeded only by handling a finished bow — so 1,138 of 1,228 knows-bow villager-days sit on armed villagers the duty skips, and the eligible remainder never attempts even on the 39 days the pile held branch+vine for a crude_bow. Materials are plentiful (pile branch on 86% of days); loot cannot supply earth bows (alien table only); the pile never holds a bow. This arm BUILDS the fix named in bowsource §5 and measures before/after on identical seeds: serve ranged-less villagers for the bow rungs, and seed bow knowledge from SEEING a bow equipped at home.

## 2. Verdict — BUILD-GO

All four frozen bars pass, as judged by the frozen analyzer (`scripts/analyze-bowcraft-a.js`, verdict `GO`):

| Bar (prereg §14) | Result | Pass |
| --- | --- | --- |
| 1. Craft attempts (bow rungs) arm ≥ 3 | **Arm 47** (ok 13, fail 34) vs ctl 0 | ✓ |
| 2. Bows crafted (bow / crude_bow, ok) arm ≥ 3 | **Arm 13** vs ctl 0 — crude_bow 10, bow 3 | ✓ |
| 3. Bowless departure share: arm < ctl by ≥ 0.05 absolute | **Ctl 0.795 (128/161) → arm 0.732 (120/164), delta 0.063** | ✓ |
| 4. No-regression guardrails | Median survival arm **150** vs ctl 143 (bar ≥ 0.8× ctl); starvation deaths arm **0** vs ctl 2 (bar ≤ ctl+2); deaths per run arm **74.9** vs ctl 72.0 (bar ≤ 1.10× ctl = 79.2) | ✓ |

**Headline, in one line:** the verb that never fired now fires — 47 attempts, 13 bows made by 13 different villagers, and the share of fighters setting out with no ranged weapon fell from 79.5% to 73.2%, with no survival or death regression.

**Caveats that belong next to the verdict, not buried:** bar 3 passes thin (0.063 against a 0.05 bar — see §12 for the seed-107002 sensitivity). The secondary attribution bar (≥ 0.90) MISSES as measured by the frozen analyzer (arm 0.719) — but §4.6 proves it is an instrument artifact, not missing bows: all 12 observed crafted bows and both loot bows first appear in the census row the day AFTER their event, outside the analyzer's gap window. A diagnostic recomputation with the window fixed gives arm 0.9375 — reported as a diagnostic only, never a re-score; the frozen analyzer's numbers stand as the record. The prereg's confirm leg (fresh band 107011–107018) was NOT run — it is owed, and the band is still fresh (§11). The §15 panel returns `review_required` on a deaths-per-run watch flag (§6) — the panel is the instrument, the frozen bars are the judge.

## 3. The mechanism (what was built)

**The fix — commit `cb8dec615`, one `src/` file (`src/js/villager-build.js`, +78/−5 lines), env-gated `BOWCRAFT=1` (node sims only; unset = the old duty, byte-identical).** In `villagerWeaponCraftDay` only:

(a) **Serve RANGED-LESS villagers.** Ranged-less = no volley-capable ranged weapon after the duty's `autoEquip` call (`volleyWeaponOf(p, defs) == null`) AND none carried in pack. Weaponless villagers keep the FULL ladder unchanged (spear first, then bow). Ranged-less-but-armed villagers (spear- or melee-holders) are served for **BOW rungs only** (`bow`, `crude_bow`) — never a second spear. Villagers WITH a volley weapon are still skipped entirely.

(b) **Seed bow knowledge from SEEING a bow — perception-gated only.** At duty start, snapshot the LADDER weapons EQUIPPED by home villagers (visible in hand, same tile = the home camp). Any home villager without L1 for a rung seeds L1 for each rung they SEE equipped on ANOTHER home villager. Equipped only — a bow in someone's pack or stash is not seen. Snapshot is taken before the per-villager loop, so a same-day craft cannot seed a same-day attempt (no ordering artifact). The existing handling-seeding (own wear/carry/stash → L1) is unchanged.

**Gate verification (re-checked in this finalize pass, not taken from the run's word).** The gate is read at exactly one site: `bowcraftOn = (typeof process !== 'undefined' && process.env && process.env.BOWCRAFT === '1')` (villager-build.js:1320). Every new behavior sits inside `if (bowcraftOn)` branches; the off path keeps `else if (armed) continue;` and the full `LADDER` rung list — the old duty, unchanged. `BOWCRAFT` appears nowhere else in `src/js`. The proof test covers the control-leg identity (BOWCRAFT unset: spear-armed skipped, no seeing-seeding) and the live smoke proves BOWCRAFT on/off. **With the flag unset there is no live behavior change.**

**Unchanged, as frozen:** ≤1 attempt / 3d cooldown; L1 35% / L2+ 85% odds; PRACTICE rule (L1 success teaches L2); materials own-carried-first then camp pile; `tele('weapon_craft')` on every attempt; at-home only; the scholar's own craft() untouched; the sharpened-stick whittle fallback untouched. The spear-out-of-slot MELEE-FIRST FALLBACK is NOT re-implemented (landed code, verified by the proof test: a crafted bow auto-equips to ranged, the spear moves to melee).

**NOT built (design calls, per the prereg):** teaching a recipe to a villager who has never seen a bow; heard-about seeding via gossip (gossip moves REP only); crossbow in the ladder. Filed as steve-calls, not smuggled in.

**The instrument** (all committed in `cb8dec615` except the recover script and this evidence):

- **Driver** `scripts/bowcraft-driver-a.js` — copy of `scripts/bowsource-driver-a.js` (launch-funnel recorder + bow-supply recorder unchanged) PLUS the BOWCRAFT flag assertion and the ranged-less census counts `nRangedlessKnowsBow` / `nSpearArmedKnowsBow` per census row.
- **Analyzer** `scripts/analyze-bowcraft-a.js` — copy of `scripts/analyze-bowsource-a.js` + the before/after judge on the frozen bars. Selftest **30 passed, 0 failed** (re-run in this finalize pass).
- **Panel builder** `scripts/build-bowcraft-panels-a.js` — adapted copy of the bowsource panel builder, same schema — + `node scripts/balance-panel.js compare`.
- **Proof test** `scripts/test-bowcraft-a.js` — **58 passed, 0 failed** (re-run in this finalize pass). Covers: ranged-less eligibility (weaponless full ladder; spear-armed bow-rungs only; volley-armed skipped); seeing-seeding (equipped bow on another home villager seeds L1; pack/stash bow does not; snapshot-before-loop, no same-day craft seeding); spear-out-of-slot equip; control-leg byte-identity; live 5-day smoke (recorder writes baseline + census rows, 0 instrument errors, BOWCRAFT on/off proof); analyzer interop on the live smoke corpus. Encounter-gear fixture: the competent policy stages the encounter itself (a geared scholar fighting with a party, never a fresh un-geared solo scholar).

**The run and the recovery.** The ctl leg ran 15:40–15:46 UTC, all 8 seeds, exit 0, 0 instrument errors. The arm leg ran 15:46–16:21 UTC, all 8 seeds to completion (days 82–150, 0 instrument errors) — but the host write flap (~15:47–16:13 UTC) refused the per-seed file writes for seeds 107002–107008, and the driver fell back to dumping each corpus as text into the sweep log (`@@FALLBACK <target path>` + full JSON). `scripts/recover-bowcraft-fallback-a.js` (written during the run, committed by this finalize pass) extracts each fallback block from the log, validates it (JSON parses; seed matches the target filename; mode arm; bowcraftOn true; anchor is the committed fix; non-empty bowCensus), and writes it back with write + readback verification, refusing to overwrite an existing non-empty corpus. It ran during the timed-out run (~16:21, the recovered files' timestamps) and recovered all 7. **This finalize pass verified the recovery independently:** the recovered files for seeds 107002, 107003, and 107008 are byte-identical to the log fallback dumps (re-serialized from the parsed dump, same length to the byte); all 8 arm corpora parse, carry the right seed/mode/anchor/bowcraftOn, and match the per-seed summaries in the arm log day-for-day. One 0-byte leftover, `bowcraft-a-s107002-bowcraft-a-arm.json.chunk-tmp` (writeRobust debris the recover script's `.tmp-` cleanup pattern did not match), was removed by this pass and is not committed. The recover script itself did NOT need to run again — there was nothing left to recover — and it was not re-run.

## 4. Headline numbers

### 4.1 Craft — the verb fires, 47 attempts, 13 bows, 13 crafters

| | Ctl | Arm |
| --- | --- | --- |
| Bow-rung craft attempts (bow / crude_bow) | 0 | **47** (ok 13, fail 34) |
| Bows crafted (ok) | 0 | **13** — crude_bow 10 (30 attempts), bow 3 (17 attempts) |
| Craft success rate | — | 13/47 = **27.7%** (mostly L1 attempts at 35%) |
| Craft events (all ranged rungs) | 0 | 47 (all 47 are bow rungs — no spear attempts from ranged-less villagers, as designed) |
| Distinct crafters (ok) | — | **13 villagers, 1 bow each** — the work spreads, it is not one workbench hero |

Per seed (arm): 107001: 13 attempts, 5 ok; 107002: 0/0 (village lost day 82, no eligible days); 107003: 11 attempts, 3 ok; 107004: 7 attempts, 2 ok; 107005: 1 attempt, 0 ok; 107006: 1 attempt, 0 ok; 107007: 10 attempts, 1 ok; 107008: 4 attempts, 2 ok.

**The attempt rate is low per opportunity day:** 47 attempts on 4,555 ranged-less-knows villager-days = **0.010 attempts/day**. The fix opens the door; the ≤1 attempt / 3d cooldown, at-home, and materials gates still throttle it — and seed 107006 shows the extreme (1,263 ranged-less-knows days, 1 attempt, 0 ok). The bar was written against attempts, not rate, and it passes by 15× — but a next arm that wants MORE bows should instrument the attempt line's gate failures directly (which of at-home / cooldown / materials binds on a given day), the same decomposition bowsource §11 asked for.

### 4.2 Knowledge — seeing seeds it everywhere

| Villager-days across the band | Ctl | Arm |
| --- | --- | --- |
| Knows a bow recipe (any) | 1,228 | **7,715** |
| Ranged-less AND knows a bow (new denominator) | 90 | **4,555** |
| Spear-armed AND knows a bow | 0 | **1,053** |
| Weaponless AND knows a bow (old denominator) | 90 | 663 |

The seeing-seeding works as designed and the effect is large: bow knowledge goes from a scarce, misplaced resource (93% of it on villagers the duty skipped) to a village-wide one. Knowledge at the day-30 census snapshot: ctl 12 villagers across the band know a bow recipe, arm 69. By day 60: ctl 9, arm 61. The knowledge is there now; the binding constraint moves downstream to attempts (see §4.1).

### 4.3 Bowless departures — down 6.3 points, and the shelf is still empty at departure time

| | Ctl | Arm |
| --- | --- | --- |
| Departures | 161 | 164 |
| Bowless departures | 128 (**79.5%**) | 120 (**73.2%**) |
| Wave-4 departures / bowless | 145 / 115 (79.3%) | 143 / 106 (74.1%) |
| Bowless carrying a spear | 48 | 49 |
| Bowless with a bow source available at departure | 0 / 128 | **0 / 120** |

The share falls, but a crafted bow is carried, not stashed: at the moment of departure there is still never a bow in the fighter's own stash, in the armory pile, or craftable from what the camp holds — because the bows the fix makes are already in hands. The departure source check (0/120) is not a failure of the fix; it is the same shelf-empty result with a different cause (bows now exist, but they are worn, not stored). A staging arm that wants to hand bows to departing fighters still has nothing to stage from — it would need the crafter to hand the bow over, which is a different lever.

Per seed (bowless/departures): ctl 16/22, 67/67, 4/7, 1/1, 8/21, 20/20, 11/21, 1/2; arm 2/2, 67/67, 7/21, 3/4, 8/19, 20/20, 10/24, 3/7. Seed 107002 dominates both legs (67/67 bowless — the village lost day 82 before any craft could help on either leg). Excluding 107002, the bowless share is ctl 61/94 = 64.9% vs arm 53/97 = 54.6%, delta 0.103 — reported as a sensitivity, not a re-score; the judged delta is 0.063 on the full band.

### 4.4 Bow stock over time — the drain stops being a drain

Village bow totals (held + stashed, all villagers) at census snapshots — band totals, seed order 107001–107008:

| Day | Ctl band total | Arm band total |
| --- | --- | --- |
| 1 | 28 | 28 |
| 30 | 23 | 26 |
| 60 | 18 | 28 |
| 90 | 15 | 20 |
| 120 | 7 | 15 |
| 150 | 2 | 4 |

Bowsource's story was a one-way drain (28 → 2). The fix does not reverse the drain — holders still die and bows still die with them (arm disappearances 51, all `diedWith`; 0 deposited, ever, on either leg) — but it slows it: at day 60 the arm band holds 28 bows against the control's 18, and at day 120 it holds 15 against 7. The stash-weapons pile held **0 bows on every census row on both legs** — the pile is still never a bow store.

### 4.5 Bow sources — crafted joins starting gear and new arrivals

| Source | Ctl | Arm |
| --- | --- | --- |
| Starting gear | 28 (sling 10, crude_bow 7, bow 7, crossbow 4) | 28 (same band, same day-1 baseline) |
| Crafted (attributed by the frozen analyzer) | 0 | **0 as attributed — see §4.6; 12 of the 13 ok crafts are observed in the census, misattributed as unexplained** |
| Looted | 1 (phase_sling, seed 107001) | 0 as attributed — see §4.6; 2 alien loot bows observed |
| Spawned (new arrival holding one) | 11 | 15 |
| Moved (gift / armory) | 0 (79 gear moves, 0 a bow) | 3 (70 gear moves, 4 bow moves) |
| Unexplained | 3 | 18 (see §4.6) |
| Appearances after baseline | 15 | 36 |

Loot still cannot supply earth bows: ctl 373 kill-loot drops, 3 bows (phase_sling ×2, starfall_bow ×1, all alien); arm 393 drops, 2 bows (phase_sling ×2, all alien). The 13 crafted bows are the only earth-bow supply added by either leg.

Per seed (starting / appearances, with the frozen attribution split crafted / looted / spawned / moved / unexplained):

| Seed | Days | End | Ctl starting / appeared | Arm starting / appeared |
| --- | --- | --- | --- | --- |
| 107001 | 143 / 150 | lost / survived | 2 / 5 (0/1/4/0/0) | 2 / 7 (0/0/2/0/5) |
| 107002 | 82 / 82 | lost / lost | 0 / 0 | 0 / 0 |
| 107003 | 150 / 150 | survived / survived | 7 / 0 | 7 / 9 (0/0/5/1/3) |
| 107004 | 143 / 150 | lost / survived | 3 / 2 (0/0/1/0/1) | 3 / 3 (0/0/1/0/2) |
| 107005 | 114 / 89 | lost / lost | 6 / 2 (0/0/2/0/0) | 6 / 5 (0/0/5/0/0) |
| 107006 | 150 / 150 | survived / survived | 1 / 0 | 1 / 0 |
| 107007 | 143 / 150 | lost / survived | 6 / 5 (0/0/3/0/2) | 6 / 8 (0/0/2/2/4) |
| 107008 | 147 / 150 | lost / survived | 3 / 1 (0/0/1/0/0) | 3 / 4 (0/0/0/0/4) |
| **Band** | **median 143 / 150** | **6 lost / 2 lost** | **28 / 15** | **28 / 36** |

### 4.6 Attribution — the secondary bar misses on an instrument artifact (diagnosed, not re-scored)

Attribution completeness (starting + attributed appearances) / (starting + all appearances):

| | Ctl | Arm |
| --- | --- | --- |
| As measured by the frozen analyzer | **0.930** (40/43) | **0.719** (46/64) — secondary bar ≥ 0.90 MISSED |
| Diagnostic recomputation (window fix, §12) | 0.977 (42/43) | 0.9375 (60/64) |

The arm leg's 18 unexplained appearances decompose exactly, by direct inspection of the corpora (not by the analyzer's word):

- **12 are the ok crafts.** Every ok craft's bow first appears in the census row the day AFTER the craft (craft day D, first holding row D+1 — verified for all 12 observed crafts: e.g. seed 107001, crude_bow crafted day 24, first held day 25; day 66 → 67; day 83 → 84; day 103 → 104; day 141 → 142). The analyzer's gap window is `(prevRowDay, rowDay]` — for the row where the gain is first seen, that window is (D, D+1], which excludes the day-D event. The live census row for day D is taken BEFORE the day-D duty runs (dawn snapshot), so a craft can only ever appear in the D+1 row — the frozen window can never attribute a live craft. The selftest fixture never caught this because its craft and its appearance share one census row (day 10), a cadence live data never produces.
- **2 are kill-loot drops** with the same D/D+1 shape (arm seed 107007: phase_sling dropped day 28, first held day 29; day 54 → 55). Same window miss, same cause.
- **4 are genuinely unattributed** alien-bow appearances with no recorded loot event (seeds 107003: 1, 107007: 1, 107008: 2). These are the true residue. The control leg has the same shape: 2 of its 3 unexplained are D+1 loot misses (seed 107007, days 28 and 37), 1 (seed 107004) is genuinely unattributed.

A diagnostic recomputation — the analyzer copied to scratch with the window widened to `[prevRowDay, rowDay]` and nothing else changed — attributes 12 crafted + 2 looted on the arm leg (unexplained 18 → 4, unexplained-earth 12 → 0, completeness 0.719 → 0.9375) and 2 more looted on the control leg (unexplained 3 → 1, completeness 0.930 → 0.977), with the verdict unchanged (GO, all four bars pass either way — no bar depends on attribution). **This is a diagnostic, not a re-score:** the frozen analyzer's numbers are the record; the fix (inclusive window) is proposed for the next run in §12. The secondary bar's miss therefore does not overturn the verdict — the secondary bar is not binding, and its miss is fully explained by a proven instrument artifact with zero unexplained earth bows remaining under the corrected window.

One loose end: **1 ok craft is never observed at all** — seed 107003, day 86, gen_5n7gjt0, crude_bow. The villager stays in the roster until day 103 with no death record, and the bow appears in no later census row (held or stashed). A craft whose product vanishes before the next dawn snapshot — gifted off-roster, lost, or a same-day departure — is possible; the instrument cannot say which. It is 1 of 13, and it does not touch any bar.

### 4.7 Encounters — more bow-armed fighters at the meeting

Engaged expedition wave-4+ meetings (the analyzer's `v4encounters` rows): ctl **7 meetings, 2 with a ranged weapon at entry (28.6%)**; arm **5 meetings, 4 with a ranged weapon at entry (80%)**. Direction is as the prereg's secondary metric hoped (arm > 0), but n is small and the meeting count itself fell (5 vs 7) — read as consistent with the bow supply rising, not as a tight estimate. (The prereg's "control 0/32" was the brief's different meeting set; the numbers here are this instrument's definition on both legs.)

## 5. The lever, named precisely — and what lands

**Finding #2597 is FIXED on the pilot band.** The home weapon-craft duty now serves ranged-less villagers for the bow rungs and seeds bow knowledge from seeing — 47 attempts and 13 bows where there were 0 and 0, on identical seeds, with no survival or death regression. The fix is env-gated (`BOWCRAFT=1`); **the gate stays, and adoption decides un-gating** (mirroring speargate). Nothing in this arm changes live play: with the flag unset the duty is byte-identical, and the flag is unset everywhere except these sims.

What the fix does NOT do (for the next arms, not this one): it does not put bows in the stash or the pile (0 deposited, 0 pile bows — §4.4), so a departing fighter still cannot be handed a bow from stock; it does not supply arrows (arrowsupply NO-GO stands — a crafted bow still needs arrows); it does not teach a recipe to someone who has never seen a bow (the design call stays open); and it fires rarely per opportunity day (0.010 attempts per ranged-less-knows day — §4.1). The bowless share falls 6.3 points, not to zero: 73% of departures are still bowless, and 49 of the 120 bowless departures carry a spear instead.

## 6. §15 balanced panel — review_required (deaths watch, no material signal)

`node scripts/build-bowcraft-panels-a.js` (before=ctl, after=arm) + `node scripts/balance-panel.js compare` → decision **`review_required`**. Attached: `evidence/2026-11-19/bowcraft-a-panel.md` (and `bowcraft-a-panel.json`, `bowcraft-a-panel-before.json.gz`, `bowcraft-a-panel-after.json.gz`).

| Metric | Before (ctl) | After (arm) | Paired delta | 95% exploratory interval | Status |
| --- | ---: | ---: | ---: | --- | --- |
| Table win rate | 0 | 0 | 0 | 0 to 0 | descriptive |
| National scale access | 0 | 0 | 0 | 0 to 0 | no_material_signal |
| Village deaths per run | 72 | 74.875 | +2.875 | −8.125 to 14.125 | **regression_watch** |
| Village deaths per 100 calendar days | 56.205 | 60.111 | +3.906 | −6.7483 to 16.4729 | **regression_watch** |
| Community loss | 0.75 | 0.25 | −0.5 | −0.875 to −0.125 | no_material_signal |
| First bearer survives through day 30 / 60 | 1 / 1 | 1 / 1 | 0 | 0 to 0 | no_material_signal |

The `review_required` is driven by the deaths-per-run watch flag; the interval includes 0, so it is a watch, not a material regression — and the frozen no-regression bar (deaths/seed ≤ 1.10× ctl) passes (74.9 ≤ 79.2). The panel is the instrument, the frozen bars are the judge: the panel flags the deaths number for review, the bars clear it. The community-loss improvement (0.75 → 0.25) is the panel's other movement, in the fix's favor. Everything else is zero-delta or not observed (player deaths, sampled NPC stats, luck percentiles — the recorder corpus does not carry those rows).

## 7. Reachability verdict / wall numbers

- **National: 0/8 both legs. Table: 0/8 both legs. Wins: 0/8 both legs.** Scale rank regional 8/8 both legs.
- **Wave 4 reached 8/8 both legs. Wave 5 reached 0/8 ctl → 4/8 arm** (seeds 107001, 107003, 107004, 107008). The wave-5 door opened on half the arm band and none of the control band — reported as observed wall movement, not a bar and not a causal claim by this arm (n=8; the arm was designed to attribute bow supply, not wave-5 unlocks; the confirm leg is the test of whether it replicates).
- **Median survival 143 days ctl → 150 days arm** (ctl: 82, 114, 143, 143, 143, 147, 150, 150; arm: 82, 89, 150, 150, 150, 150, 150, 150); 6 villages lost / 2 survived ctl → 2 lost / 6 survived arm.
- **Standing:** ctl max 199 (107004: 100, 107007: 195, rest 199 — the familiar 199 stall). Arm breaks past it on four seeds: 107001: 340, 107003: 270, 107004: 200, 107008: 445; the other four sit at 199.
- **Starvation: 2 ctl (1 villager) → 0 arm.** Deaths are fighting deaths, as in the collapse pattern, not hunger.
- **Village deaths per run: 72 ctl → 74.9 arm** (panel). Total deaths across the band: 576 ctl → 599 arm.

The bow shortage sits on the winnability chain's wave-4 link, and the fix moves the numbers downstream of that link in the right direction (more bows held, more bow-armed meetings, more villages surviving to 150d, wave 5 opening) — but the seat is still nowhere in sight on either leg, and no village reaches national on either leg.

## 8. Village assessment (plain words)

Eight villages, 150 days each, twice over — once with the old workbench rule, once with the new one. Under the old rule, nobody ever made a bow. Under the new one, thirteen villagers did, one bow each: a spear-carrier who had watched someone else's bow at home, spent an afternoon at the workbench, and walked out carrying their own work. The villages still lose bows when their owners die — that drain hasn't stopped — but for the first time the drain isn't one-way. By day 60 the new-rule villages hold 28 bows against the old rule's 18, and twice as many villages are still standing at day 150.

Four out of five fighters still set out with no ranged weapon — the fix moves that to roughly three in four, not to zero. The workbench is used, but rarely: for every hundred days a villager knows how to make a bow and has no ranged weapon, the workbench is tried about once. And when a fighter leaves, there is still never a spare bow sitting in the pile to hand them — the bows that exist are in hands, not on shelves.

The most striking change isn't in the bow counts at all. Under the old rule, no village ever opened the wave-5 door. Under the new rule, half of them did — and four villages pushed their standing past the 199 wall that had held every village on the control leg, one reaching 445. That may be the bows doing their work downstream, or it may be eight small villages and a lucky draw; the numbers are too small to say which. But the direction is the one the fix was built for: more ranged weapons in more hands, more fighters coming home, more villages alive at day 150.

## 9. Sense testing (what the player would see)

708 `vetSays` lines across both legs. Read them: villagers act like people — hauling wood, checking the pantry, teaching snares, the SYSTEM calling out veteran kills. What the lines never say, on either leg, is the bow story: the only bow/craft/workbench matches are level-up "Craft 2" offers and a false-positive "bowl". **No vetSays line mentions a villager wanting, making, lacking, or losing a bow.**

That silence needs its cause stated precisely, because the craft narration DOES exist in code: "🗡️ {name} spent the afternoon at the workbench and made a {pieceName} — and carries it now, their own work in their own hands." (villager-build.js:1467). It is gated on `atHaven` — the SCHOLAR being home (`this.playerAtHaven()`). In these sims the competent-policy scholar is usually away on expedition, so `atHaven` is false and no say line fires; a raw-text search of all 16 corpora finds zero "workbench and made" lines despite 13 ok crafts. The 13 crafts are proven by the tele events plus the bows appearing in the crafters' hands the next day — not by voice. A player at home in live play WOULD see the line when a villager crafts; a player away would see nothing spoken, but would see the bow in the villager's hands and on the next departure. The silence in this corpus is a witness condition (scholar away), not a narration gap — and it means the sim cannot verify the line actually renders; that check belongs to a live playtest with the scholar home, not to this arm.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2597 (THE BOW-CRAFT VERB NEVER FIRES) — FIXED (BUILD-GO, pilot band).** Append: "FIXED by sim-bowcraft-a (run fleshout-20261119T1415Z, evidence/2026-11-19/sim-bowcraft-a.md, BUILD-GO, identical seeds 107001–107008): BOWCRAFT fix (commit cb8dec615, src/js/villager-build.js, env-gated) — serve ranged-less villagers for the bow rungs + seed bow knowledge from seeing an equipped bow at home. Before/after: craft attempts 0 → 47, bows crafted 0 → 13 (crude_bow 10, bow 3, 13 distinct crafters), bowless departure share 0.795 (128/161) → 0.732 (120/164), delta 0.063 (bar ≥ 0.05). No regression: median survival 143 → 150d, starvation deaths 2 → 0, deaths/seed 72.0 → 74.9 (bar ≤ 79.2). Gate stays; adoption decides un-gating. Confirm leg (fresh band 107011–107018) NOT run — owed. Secondary attribution bar missed as measured (arm 0.719 < 0.90) on a proven analyzer window artifact — 12 of 18 unexplained are ok crafts first seen in the D+1 census row; diagnostic recomputation with the window fixed gives 0.9375 (see evidence §4.6/§12)."
- **NEW finding — ANALYZER GAP-WINDOW OFF-BY-ONE (sim-bowcraft-a, same run).** The attribution gap window `(prevRowDay, rowDay]` excludes events dated prevRowDay, but the live census row for day D is taken before the day-D duty runs, so a craft or loot event on day D first appears in the D+1 row and can never be attributed. On this band it misattributes 12 crafts + 2 loot drops on the arm leg (and 2 loot drops on the control leg). Proposed fix for the next run: window `[prevRowDay, rowDay]` — verified by diagnostic recomputation (arm completeness 0.719 → 0.9375, ctl 0.930 → 0.977, verdict unchanged). The frozen analyzer is NOT re-scored; the fix belongs to the next run's instrument.
- **NEW finding — WAVE-5 DOOR OPENED ON THE ARM LEG (sim-bowcraft-a, same run, observed not attributed).** Wave-5 unlocks 0/8 ctl → 4/8 arm on identical seeds; community loss 6/8 → 2/8; standing breaks past 199 on four arm seeds (max 445). The arm was not designed to attribute wave-5 unlocks and n=8, so this is wall movement to be tested by the confirm leg, not a causal claim. Do not cite it as "bows unlock wave 5" until the confirm replicates it.

## 11. Blanks, limits, and things not done

- **Confirm leg NOT run.** The prereg gates a confirm on the pilot passing all four bars, and it did — fresh band 107011–107018, 8 seeds per leg. The timed-out run never reached it, and this finalize pass did not run it (finalize scope: verify and close the pilot, not extend the sweep). The band is still fresh: re-grepped in this pass — the only `.md` hit in `evidence/` is the prereg itself naming the band; 0 hits in goal `hidden_files/` and `~/memory/*.md`. The coordinator should schedule it (or waive it in writing) before adoption/un-gating — it is the replication test for the thin bar-3 delta (0.063) and the wave-5 wall movement.
- **Attribution is 0.719 as measured, not 1.0** — §4.6/§12. The miss is diagnosed and bounded (12 crafts + 2 loot = window artifact; 4 genuinely unattributed alien bows), but the frozen analyzer is the record and its window fix is a next-run change, not a mid-run edit.
- **The attempt gate is not fully decomposed.** The instrument proves 47 attempts on 4,555 ranged-less-knows days (0.010/day) but does not separate which of the remaining gates (at-home vs. ≤1/3d cooldown vs. materials) binds on a given day. Seed 107006 (1,263 opportunity days, 1 attempt) is the sharpest case. A next arm that wants more bows should instrument the attempt line's gate failures directly.
- **One ok craft never observed** (seed 107003, day 86, gen_5n7gjt0, crude_bow) — §4.6. The product vanishes before the next dawn snapshot; the instrument cannot say where it went.
- **Encounter n is small.** 7 meetings ctl, 5 arm; the 80% ranged-at-entry share on the arm leg rests on 4 of 5 meetings.
- **The craft narration is unverified in live play** (§9) — it fires only when the scholar is home, and the sim scholar is usually away. A live playtest with the scholar home is the check, not this arm.
- **No live verification** (ship loop owns deploys). No push, no version bump. No merge to master by this arm — the coordinator merges.
- **The run timed out at closeout** — the analyzer, panels, and this evidence file were produced by the finalize pass, not the run. The recover script's 7 recovered corpora were verified independently (§3).

## 12. Metric review

- **Primary metric held.** All four frozen bars pass on the pilot band, judged by the frozen analyzer — attempts 47 ≥ 3, crafted 13 ≥ 3, bowless delta 0.063 ≥ 0.05, no-regression guardrails all clear. The verdict is BUILD-GO.
- **Bar 3 is thin, and one seed carries it.** Delta 0.063 against a 0.05 bar. Seed 107002 contributes 67 bowless departures to both legs (village lost day 82, no craft possible on either leg) and drags both shares toward each other; excluding it, the delta is 0.103. The bar as written uses the full band and passes — the sensitivity is reported, not substituted. The confirm leg is the real test of whether 0.063 holds on fresh seeds.
- **Secondary attribution bar missed on an instrument artifact — diagnosed, not re-scored.** Arm completeness 0.719 < 0.90 as measured. Direct corpus inspection proves the cause: the analyzer's gap window `(prevRowDay, rowDay]` cannot attribute any live craft or loot event, because the day-D census row is taken before the day-D duty runs and the product first appears in the D+1 row. The diagnostic recomputation (scratch copy, window `[prevRowDay, rowDay]`, nothing else changed) gives arm 0.9375 and ctl 0.977 with the verdict unchanged. **Proposed revision for the NEXT run:** widen the analyzer's gap window to include prevRowDay, and add a selftest fixture with the live cadence (craft day D, appearance row D+1) so the fixture cannot pass while live data fails. The frozen analyzer and its numbers are NOT edited mid-run.
- **The panel's review_required is a watch, not a verdict.** Deaths per run 72 → 74.875 with an interval covering 0; the frozen no-regression bar (≤ 1.10×) passes. The panel flags it for review; the bars clear it. No re-scoring.
- **What the metric cannot say.** The bowless-sourced check (0/120 on the arm leg) is a same-day snapshot at departure — it cannot say whether a bow existed earlier in the day and was taken, or whether a fighter could have crafted one with a day's lead time. The craft denominator (4,555 ranged-less-knows days) is the honest bound on that question. The wave-5 wall movement (0/8 → 4/8) is observed, not attributed — the arm's instrument cannot separate "bows caused it" from "identical seeds, different trajectories" beyond the before/after itself.
- **Seed-band reuse is by design, not an accident.** The pilot deliberately reuses the bowsource band (107001–107008) for a before/after on the measured band. The confirm band (107011–107018) is the fresh replication — see §11.

## 13. Files

- `evidence/2026-11-19/sim-bowcraft-a-prereg.md` — frozen prereg (frozen 2026-11-19 ~15:05 UTC)
- `evidence/2026-11-19/sim-bowcraft-a.md` — this file
- `evidence/2026-11-19/bowcraft-a-analysis.json` — analyzer output (verdict GO, all four bars pass)
- `evidence/2026-11-19/perseed-bowcraft-a-ctl/` — 8 corpus files (`bowcraft-a-s<seed>-bowcraft-a-ctl.json`)
- `evidence/2026-11-19/perseed-bowcraft-a-arm/` — 8 corpus files (`bowcraft-a-s<seed>-bowcraft-a-arm.json`; seeds 107002–107008 recovered from the log fallback by `recover-bowcraft-fallback-a.js`, verified byte-identical to the dumps for 107002/107003/107008)
- `evidence/2026-11-19/bowcraft-a-panel-before.json.gz`, `bowcraft-a-panel-after.json.gz` — §15 panel legs (ctl, arm)
- `evidence/2026-11-19/bowcraft-a-panel.json`, `bowcraft-a-panel.md` — §15 compare (`review_required`, deaths watch)
- `evidence/2026-11-19/bowcraft-a-ctl.log`, `bowcraft-a-ctl.err` — ctl sweep log (8 seeds, exit 0; .err empty)
- `evidence/2026-11-19/bowcraft-a-arm.log`, `bowcraft-a-arm.err` — arm sweep log (8 seeds to completion; .err empty; the log carries the 7 `@@FALLBACK` corpus dumps the recover script extracted)
- `scripts/bowcraft-driver-a.js` — bow-supply recorder driver (+ BOWCRAFT assertion, ranged-less census counts)
- `scripts/analyze-bowcraft-a.js` — analyzer + judge (selftest 30/30)
- `scripts/build-bowcraft-panels-a.js` — panel builder
- `scripts/test-bowcraft-a.js` — proof test (58/58)
- `scripts/recover-bowcraft-fallback-a.js` — fallback-corpus recovery from the sweep log (ran during the timed-out run; recovered 7 corpora; not re-run by this pass — nothing left to recover)
- `src/js/villager-build.js` — the fix (commit `cb8dec615`, env-gated BOWCRAFT; the only `src/` change)
