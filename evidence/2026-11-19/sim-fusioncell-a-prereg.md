# sim-fusioncell-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fusioncell-a · **Loop A run:** fleshout-20261119T1415Z
**Type:** DIAG — quantify fusion-cell supply (finding #2599). **Frozen:**
2026-11-19 ~09:00 UTC, before any judged sim.
**Branch:** `sim-fusioncell-a` (worktree
`~/workspace/worktrees/sim-fusioncell-a`). **Base:** master
228ac0dd5 (rebased from f075dbb84 — the 1215Z round tip — before any
judged sim; rebase clean, no conflicts).
**Builds on:** `evidence/2026-11-19/sim-arrowsupply-a.md` (§5c, §10)
and `evidence/2026-11-19/sim-scale-onramp-round-1215.md`.

## AMENDMENT — instrument repair (2026-11-19 ~09:45 UTC, BEFORE any
judged verdict is written; the first sweep's analysis is an
instrument finding, not a game verdict)

The first sweep ran clean (8/8 seeds, 0 instrument errors) and
reproduced the arrowsupply trajectories bit-identically — but its
attribution came back 0/2: THREE appearances exist that the frozen
instrument cannot source (chen_wei gains a searcaster 107023 d54;
gen_d7qxdld gains a cell 107024 d142; mia_andersson gains a cell
107027 d103; the scholar also holds a cell from 107026 d76).
Forensics from the first corpus:

- The `teleLoot` attribution branch is DEAD: the VF instrument's
  `teleRows` carries only veteran-relevant tele types (skill/killer
  tales) — 0 `loot_dropped` rows across 3 seeds despite teleCounts
  20–28. No loot event can ever be attributed through it.
- The frozen instrument wrapped only `villagerKillLoot` (villager
  kills). The grant side of `rollAlienLoot` has FOUR more callers
  the instrument never saw: contest prizes (`_cxItemPrize`,
  contests.js:169 — tier 4 on extreme-risk + apex + 25%, pool =
  alien t4 + extraItems[4] = 15, winner's pack via
  `alienLootGrant`), show gifts (`apWackyGift`, alienPlayers.js —
  tier ≤ 3, so no cells), trade (betrayal.js — `alienLootGrant`),
  and player kill loot (`tbEnd` → `alienLootGrant(dropId,
  lootCorpse)` → corpse → scholar-only `_corpseTakeStack`,
  corpses.js). Supporting color: gen_d7qxdld killed a
  lockpick_raccoon via CONTEST the same day its cell appears;
  chen_wei killed a giant_mosquito via CONTEST the day before its
  searcaster appears; the scholar's cell follows player kills
  (mirrormoth d75, drumbelly d76).

Repair (driver v2, no game-code change, recorder-only): wrap
`Game.alienLootGrant` (every grant, classified by caller stack:
contest-prize / show-gift / trade / kill-loot-corpse / other),
`Game._cxItemPrize` (contest context: who + contest id), and
`Game._corpseTakeStack` (scholar corpse takes). The analyzer drops
the dead `teleLoot` branch and attributes from `grantEvents` +
`corpseTakeEvents`, and adds the SCHOLAR's cell series (cellPile
scholar cells) to the attribution denominator. Bars, band, horizon,
and policies are UNTOUCHED. The first corpus is deleted and all 8
seeds re-run; determinism is verified against the first run
(days / endReason / standing / wave / v4encounters identical) —
the repair changes labels only, never the game.

## The question

Finding #2599 (from sim-arrowsupply-a, same band): chen_wei carried
a searcaster 97 census-days with ZERO fusion cells on every one; 0
acquisition events of any kind (no recipe, no pile source, no loot,
no player craft). This DIAG quantifies fusion-cell supply: who holds
cells, how many, for how long; every acquisition event by source
(loot table? ruin salvage? recipe? pile? player craft? arrival
gear?); and cell-weapon holders' volley opportunities lost
(meetings with wave-4+ monsters while holding a cell-weapon with 0
cells). Attribution completeness for cell appearances, same bar
family as bowsource (≥ 0.90).

## The mechanism (frozen, from code read — not a sim)

**The weapon and the cell** (`src/data/items.json` — data, not
canon; no canon doc covers ammo supply, cell supply, or the
searcaster):

| Item | Def |
|---|---|
| searcaster | class weapon, origin alien, lootTier 4, tier 4; bonus 120, range 8, damageType energy, charsMeat; `weapon.ammo = fusion_cell` |
| fusion_cell | class material, origin alien, lootTier 4, tier 4; `findable: false`; `fuelBurnMult: 12` ("Fire fuel: burns 12x as long as a log") |

**Supply routes — frozen code-read verdicts (each to be confirmed
by the sim's zero/positive counts):**

1. **Recipe: NONE.** `src/data/recipes.json` (36 recipes) contains
   no fusion_cell recipe. `Game.craft` therefore cannot make one.
2. **Ruin salvage: NONE.** Ruin/building/cache tile loot is drawn
   from `regionScavenge()` (`regions.json` people.scavenge, 20
   regions) plus the legacy `SCAVENGED` pool; `fusion_cell` appears
   in NONE of them (checked by grep + python over all 20 regions).
3. **Communal pile: NONE.** The pile holds `MAT_IDS` materials
   (`storage.js` MAT_DEFS: wood, branch, stone, fiber, cloth,
   charcoal, container, stick, vine, bark, hide) — fusion_cell is
   not a MAT_ID, so `stashState().materials` can never hold it.
   The stash sections (weapons/armor/tools/medicine) are
   deposit-gated; a cell could in principle be deposited as an
   item, but nothing ever creates one to deposit — the census
   reads all four sections anyway.
4. **Departure pocketing: NONE.** `villagerPocketAmmo`
   (game.js:8025) returns before the craft for any ammo kind other
   than arrow/bolt/stone ("other ammo kinds have no pile recipe
   and are left alone, never invented"). A searcaster departure
   can only top up from own stash or (never — no pile stock) the
   pile. The home duty `villagerAmmoCraftDay` serves arrow/bolt
   only.
5. **Starting gear: NONE.** Character generation
   (`take('weapon', …)` + the wild-card pick, game.js:1881+) takes
   only `lootTier <= 2 AND origin !== 'alien'` — "Jackpots exist,
   but you don't start with a searcaster." No fusion_cell either
   (same filter on the wild card).
6. **Loot: THE ONLY IN-CODE ROUTE.** `rollAlienLoot` (game.js)
   builds its tier pool as `(origin === 'alien' OR killItems[tier]
   OR extraItems[tier]) AND lootTier === tier`. Alien tier-4 items
   are exactly 4 (`fusion_cell`, `starfall_lance`, `genesis_seed`,
   `searcaster`); `reward-economy.json` killItems[4] names 11 more
   (bloodplate, void_cloak, ironfist_wraps, consensus_crown,
   first_steps_boots, hearthstone_amulet, undying_heart,
   beastcall_horn, causality_lens, lifespring_vial,
   warlords_standard). So a tier-4 kill drop is a fusion_cell with
   probability 1/15 — IF the pool is exactly those 15 (the sim's
   loot wrap + the proof test's live pool read confirm the count).
   Tier-4 drops themselves are rare: apex kills, `tier4Chance`
   entries, or the loot taper up (wave 2: 5%, wave 3: 10%, wave 4:
   15%, wave 5+: 20%). `villagerKillLoot` puts the drop in the
   killer's pack as a bare string entry.
7. **Arrival gear: UNESTABLISHED in code, measured empirically.**
   New arrivals are generated by the same character generation as
   starting gear (same alien/tier filter), so an arrival holding a
   cell or a searcaster would contradict the filter — the
   attribution step tests this directly (a 'spawned' appearance
   with a cell/searcaster in hand).

**What the volley is worth** (fieldFights.js, frozen): shots =
min(ammo, clamp(1+floor(range/monster speed),1,4)); each shot
costs 1 cell; hit chance 0.85 − 0.06×range (+tracking, cap
+0.15); a hit lands lroll([4+wbR, 8+wbR]) with wbR =
round(bonus/2). For the searcaster: range 8, bonus 120 → wbR 60,
hit chance 0.37 + tracking, damage 64–68 per hit, up to 4 shots.
An armed searcaster volley expects ≈ 4 × 0.37 × 66 ≈ 98 damage
against a wave-4 monster (HP 850–1500) — roughly 7–12% of the
monster, before any drive-off. At 0 cells the volley is
`{shots: 0, hits: 0, dmg: 0}` and the log reads "has Searcaster
but no fusion cells — the string stays drawn, useless." (the
#2593 fix names the actual ammo). The fold-in (melee + ranged
halved) does NOT need cells — a cell-less searcaster still strikes
with bonus 120 folded in — so the volley-loss cost is the opening
volley only, bounded above by that ~98 expected damage.

**Telemetry:** the driver wraps `villagerPocketAmmo` (every
departure call site) and `villagerKillLoot` (ammo/ranged drops,
fusion_cell included) and `Game.craft` (ALL recipe calls, so a
fusion_cell craft — or its absence — is visible), and takes a
daily cell census (every living roster villager: ranged kit +
carried/stashed fusion_cell; communal pile materials + all four
stash sections for cells; scholar inventory cells + scholar kit)
plus a day-0 baseline. The fieldFight wrap adds `partyCells`:
fighter + each ally's ranged kit + cells at entry (pre-call
read). AMENDMENT (driver v2): the driver also wraps
`Game.alienLootGrant` (every alien-loot grant, classified by
caller: contest-prize / show-gift / trade / kill-loot-corpse),
`Game._cxItemPrize` (contest context), and
`Game._corpseTakeStack` (scholar corpse takes) — the grant side
of the loot table, which the v1 instrument never saw (see the
amendment above). Acquisition attribution mirrors bowsource: every
fusion_cell first-appearance in a villager's personal union
(held + stashed) after baseline is attributed to starting /
looted (villager kill) / contest-prize / show-gift / trade /
spawned (new roster vid) / crafted / moved (same-day
loss+gain) / unexplained; searcaster appearances are attributed
the same way (where did chen_wei's searcaster come from?). The
scholar's cell appearances (cellPile scholar series) are
attributed the same way (corpse-take / contest-prize / trade /
crafted / unexplained) and count in the attribution denominator.

## Primary metric (BINDING, §14)

**Fusion-cell supply on the band, judged on three frozen bars:**

1. **Holder census coverage complete on all 8 seeds** — every
   seed has a day-0 baseline + a daily cell census with zero
   instrument errors; holder-days and cell-days counted for every
   searcaster holder and every cell holder.
2. **Acquisition-event attribution ≥ 0.90** — attributed cell
   appearances / all cell appearances after baseline. If cell
   appearances are ZERO, the bar is scored PASS-vacuous ONLY when
   bar 1 passes AND the frozen mechanism above names loot as the
   sole route (the zero-supply conclusion then stands on the
   census + the loot-pool math, not on an empty denominator).
3. **Volley-opportunity pool floor ≥ 5** — wave-4+ meetings in
   which a participant (fighter or ally) holds a cell-weapon
   (searcaster) with 0 cells. If the pool is thin (< 5), the
   rare-rate conclusion applies instead (arrowsupply precedent):
   the evidence states the pool size, whether searcaster holders
   are rare or never meet, and the volley-loss cost is reported as
   unmeasurable-on-this-band rather than re-scored.

**Verdict ladder (frozen):**
- **DIAG-GO** iff all three bars hold (with the vacuous /
  rare-rate paths as written above).
- **DIAG-NO-GO** otherwise: incomplete census, attribution
  < 0.90 with a non-zero appearance count, or a thin pool with no
  rare-rate conclusion stated. A NO-GO names what is missing,
  not a fix.

**If the diag confirms zero supply,** the fix arm is named
precisely in the evidence: loot-table weight vs ruin salvage is a
design call — cells are alien tech, so the source must be
alien-side, not a village craft. NO game-code fix lands in this
DIAG arm. Do NOT fold this into bow/arrow work; it is a different
supply chain.

## Secondary metrics (supporting, never re-scored)

- (a) Searcaster holders by seed: holder-days, cell-days, max
  cells ever held, days at zero cells; searcaster appearances by
  source (starting / looted / spawned / moved / unexplained).
- (b) Cell acquisition by source (loot / ruin salvage / recipe /
  pile / player craft / arrival gear / starting stock) with event
  counts and unit counts; pile cells by section over time.
- (c) Searcaster departures: count, outcomes (no-source-kind and
  the rest of the pocketAmmo taxonomy), zero-cell share.
- (d) Volley-opportunity cost: wave-4+ meetings with a
  cell-weapon participant at 0 cells — volley fired (0 by
  construction), the log line, outcome shares; the armed side
  (cells > 0) if any exists; the expected-volley bound from the
  frozen math above.
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed.
- Table: not instrumented by this driver — reported as null,
  never faked.

## What this DIAG does NOT judge

- The bow/arrow supply chains (bowsource-a GO, arrowsupply-a
  NO-GO stand).
- The sling-stone question (#2600, sim-slingstone-a).
- The launched-party fighter composition question (#2601).
- No 12–16 seed confirm in this run — pilot only; the
  coordinator decides the confirm from the verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the
  bowsource/arrowsupply bands, for comparability). Dead villages
  stop simulating (+10d tail max).
- **Seeds: 107021, 107022, 107023, 107024, 107025, 107026,
  107027, 107028 — THE SAME BAND as arrowsupply-a, by brief.**
  This is a deliberate reuse, not a freshness claim: the finding
  (#2599) was observed on these villages, and this diag
  re-measures the same villages with the cell instrument (the
  chen_wei searcaster lives on this band). No freshness check is
  claimed; the band is assigned. Neighbouring bands for
  reference: 107001–107008 (bowsource-a), 105701–105708
  (bowopen-a).
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate — verified by grep on
  base 228ac0dd5: SENSEEXPED in party-wiring.js, PARTYSIZE4 in
  villager-brain.js/win-plan.js, VETREENGAGE in game.js/
  villager-brain.js/win-plan.js, FLEEREPAIR2 in win-plan.js,
  FIGHTALLY2 in fieldFights.js/party-wiring.js; LAUNCHPARTY
  appears nowhere in src/js/). **Single leg (DIAG, no lever):
  MODE=diag, BOWOPEN unset** — the driver asserts the flag is
  unset, so the measured behavior is master's default. No ctl/arm
  split: there is no code change to compare.
- **Instrument:** `scripts/fusioncell-driver-a.js` (clone of
  `scripts/arrowsupply-driver-a.js` — the full launch-funnel
  recorder is unchanged — plus the cell census, the all-recipes
  craft wrap, and `partyCells` on encounter rows);
  analyzer `scripts/analyze-fusioncell-a.js` (fresh: cell +
  searcaster attribution, departure + encounter aggregation,
  `--selftest` incl. the DIAG-GO / DIAG-NO-GO judge shapes);
  per-seed JSONs under
  `evidence/2026-11-19/perseed-fusioncell-a-diag/`.
  **§15 panel:** `scripts/build-fusioncell-panels-a.js` (adapted
  copy of the arrowsupply panel builder) + `node
  scripts/balance-panel.js compare`; single leg, so before==after
  is the same corpus — a zero-delta screen, stated as such in the
  evidence (the panel is the instrument, the frozen bars above
  are the judge; a DIAG carries no lever to compare).
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched,
so the fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The pilot's per-seed corpora carry the
encounter averages (party size, gear, abilities, ranged-at-entry)
beside the verdict in the evidence file. The nearest measured
point is the arrowsupply band (launched parties geared by the
launch gear-up); the pilot does not re-derive gear.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the arrowsupply band (same seeds, same substrate)
   saw 32 launched expedition meetings / 9 pair-inclusive engaged
   on 8 seeds. The volley-opportunity floor (≥5) is sized to
   that — IF a searcaster holder ever meets a wave-4+ monster.
   The arrowsupply census says exactly one searcaster holder
   existed on the band (chen_wei, 97 days), so the pool may be
   thin; the rare-rate path above covers that.
2. **Pool sizing:** the holder population is 1 known searcaster
   on 8 seeds. The census bar (complete on all 8 seeds) is the
   load-bearing bar; the pool floor is a reporting bar, not a
   power bar — a thin pool is a finding.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fusioncell-a.js`, GREEN before the pilot)
   proves the wraps classify each pocketAmmo outcome on fixtures
   (incl. the fusion-cell no-source path), the cell census reads
   ranged kit + cells + pile sections + scholar inventory, the
   loot wrap logs fusion_cell drops, the craft wrap logs all
   recipes, and the analyzer's judge shapes (DIAG-GO,
   DIAG-NO-GO thin pool, DIAG-NO-GO attribution miss,
   PASS-vacuous zero-appearance) decide as written. The analyzer
   `--selftest` covers the cell attribution, the searcaster
   attribution, the departure aggregation, the encounter pool,
   and all judge shapes.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500 — "a 4–6 round fight for a godhood build (~220
dmg/round)". **No canon doc covers fusion-cell supply, the
searcaster, or cell-weapon volleys** — said here rather than
inventing canon. The taxonomy is cited from data
(`src/data/items.json` searcaster/fusion_cell defs,
`src/data/recipes.json`, `src/data/reward-economy.json`,
`src/data/regions.json` scavenge pools) and the supply mechanics
from code (`game.js` `villagerPocketAmmo` / `rollAlienLoot` /
`villagerKillLoot` / character generation, `storage.js`
MAT_DEFS, `fieldFights.js` volley), not from canon.
