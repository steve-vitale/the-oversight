# sim-searsupply-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-searsupply-a · **Loop A run:** fleshout-20261120T0215Z
**Type:** BUILD + measure — the searcaster-supply lever for finding #2599
**Frozen:** 2026-11-20 ~03:25 UTC, before any judged sim.
**Branch:** `sim-searsupply-a` (worktree
`~/workspace/worktrees/sim-searsupply-a`). **Base:** master
c75503d6f (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-19/sim-fusioncell-a.md` (DIAG-GO),
`evidence/2026-11-19/sim-fusioncell-fix-a.md` (1815Z, NO-GO, fix
REVERTED), `evidence/2026-11-19/sim-fusioncell-participation-a.md`
(2215Z, DIAG-GO), and their preregs.

## The question (finding #2599's named next lever)

The diag proved the cell and the gun never meet: 1 searcaster in 8
villages (chen_wei, 97 days, 0 cells), 3 cells band-wide, all contest
prizes, max 1 per holder. The fix-a arm proved supply alone (bundle-2
cells + tier-4 roll 0.25) raises cells 3→14 and armed holders 0→3 —
but 0 volleys, because the one armed holder never leads, and the
deaths guardrail failed on an EXPOSURE CONFOUND (192 vs 85 wave-4+
meetings from one extra RNG draw per tier-4 contest roll).
Participation-a then proved the gun itself is the binding constraint
on a fresh band: 0 searcaster holders in 8 villages. #2599 is
answered at the supply level; this arm builds the supply lever it
names: put the gun AND cells in villagers' hands TOGETHER.

## The mechanism (frozen, from code read — not a sim)

- **searcaster:** alien, lootTier 4, bonus 120, range 8, damageType
  energy, `weapon.ammo = fusion_cell`. **fusion_cell:** alien,
  lootTier 4, material, `findable: false`. No recipe, no ruin
  salvage, no pile stock, no player craft, no monster-kill loot
  (diag §3).
- **Contest prizes** (`src/js/contests.js` `_cxItemPrize` ~169–200):
  `rollAlienLoot({wave, loot:{chance, tier, rewardSource:'contest'}})`
  → `alienLootGrant(loot, person)`; `person` is null for
  `who='player'` (lands in the scholar's pack) or the villager
  person object (lands in their `items`). Tier 4 requires
  extreme-risk + apex + the 0.25 apex roll.
- **`rollAlienLoot`** (`src/js/game.js` ~47212): pool = alien
  tier-4 items + `rewardEconomy.extraItems[4]` (11 items) = 15
  items; the pick is ONE draw, `pool[floor(random()*pool.length)]`.
  A tier-4 contest prize is a cell with probability 1/15, a
  searcaster 1/15.
- **The scholar's pack is a dead end for these two items.** Diag:
  3 of 4 searcaster grants went to the scholar's pack; the census
  never sees a ranged weapon on the scholar. Cells in the pack
  cannot fire either (the volley reads the LEAD fighter's equipped
  ranged weapon + their own ammo, `fieldFights.js` ~975–1060).
- **Equip is not the gap.** A searcaster in a villager's `items`
  is equipped by `villagerGearUp` → `autoEquip` (deterministic,
  no RNG; `game.js` ~7658–7678, fight-time gear-up), and the
  volley reads `volleyWeaponOf` (equipped ranged slot + ammo def).
  The proof test proves this live (grant → gear-up → equipped
  searcaster → lead volley fires, cell consumed).
- **Lead rule (participation-a prereg, frozen):** the expedition
  holder leads expedition fights; world-tick fights are led by the
  villager the monster met. Expedition holders are therefore the
  villagers most likely to lead a wave-4+ fight — the natural
  recipients for a gun that only fires from the lead.

## The design (frozen; my call, Steve can overrule)

**SEARSUPPLY=1** (default OFF; the turn-on decision is the
coordinator's, not this arm's). Three parts, ALL draw-neutral BY
CONSTRUCTION — no new `Math.random()` draw on either leg, so the
fix-a exposure confound cannot recur:

1. **Bundle.** In `_cxItemPrize`, when the granted loot is a
   `searcaster`, grant +2 `fusion_cell` to the SAME recipient
   (deterministic consequence of an existing grant, zero draws).
2. **Villager redirect.** When `who === 'player'` and the loot is
   a `searcaster` or `fusion_cell`, redirect the grant to the
   village's most fight-proven living villager instead of the
   scholar's pack: the eligible villager (from `contestEligible`,
   fighting age, alive, member) with the most wave-kill deeds
   (`wave3Kill` > `wave2Kill` > `contestWin`), tie-break earliest
   roster order. Deterministic — no draw. If no eligible villager
   exists, the prize falls back to the player unchanged. Rationale:
   the System arms the village's fighters; the scholar's pack
   already holds searcasters that never reach a fight (diag: 3 in
   the pack, 0 ever equipped as far as the census can see). This
   changes who receives a player prize — a feel change, so the
   landing commit carries `[needs-eyes]`.
3. **Cell weight.** In `rollAlienLoot`, on rewardSource (contest)
   paths at tier 4 only, append 3 extra `fusion_cell` entries to
   the pool (cell probability 1/15 → 4/18 ≈ 22%). Same single
   draw, different mapping — draw count identical leg-to-leg. Kill
   loot, show gifts, trade, and corpse takes are untouched.

**NOT built here:** alien-side ruin salvage for cells (the other
half of the task's "and/or") — villagers almost never search ruins
(~1 ruin search per 2,000 forages, MEMORY.md), so its yield would
be unmeasurable on an 8-seed pilot; documented as the follow-up
lever, not folded in. No village craft for cells, ever — cells are
alien tech (diag §9).

## Primary metric (BINDING, §14)

**GO iff ALL FOUR hold on the fresh band (8 seeds, two legs,
identical seeds, panel §15):**

1. **Searcaster-holder-days floor:** villager searcaster-holder-days
   (arm) ≥ 40. (Participation band: 0. Diag band: 97 from one holder.)
2. **Armed-holder entries floor:** wave-4+ fight entries with a
   searcaster holder carrying ≥ 1 cell (any participant, arm) ≥ 3.
   (Fix-a arm: 7. Participation band: 0.)
3. **Armed volley FIRED ≥ 1:** a volley FROM a searcaster in a
   wave-4+ fight (lead `rangedId === 'searcaster'` AND
   `volley.shots > 0`, arm). This is the proof bar #2599 names.
4. **No-regression guardrail, EXPOSURE-NORMALIZED** (fix-a §6
   proposal, adopted here — the raw deaths/run bar is retired for
   this arm because it punishes RNG-draw-count differences, not
   game effects): deaths per engaged wave-4+ meeting (arm) ≤
   1.10 × control; AND median survival (arm) ≥ 0.80 × control.
   Deaths per engaged meeting is the binding guardrail number.

**Verdict ladder (frozen):**
- **GO** = all four bars hold → the lever lands (game code +
  instrument + evidence, one commit, `[needs-eyes]` for the prize
  redirect).
- **NO-GO** = any bar misses → the game code is REVERTED before
  commit (killed arms leave no trace); instrument + evidence commit
  only. The kind is recorded (supply miss vs participation miss vs
  guardrail miss) and the coordinator decides the next lever.
- A NO-GO on bars 1–2 with bar 3 passing is impossible by
  construction (a volley needs an armed entry); a NO-GO on bar 3
  with bars 1–2 passing is a PARTICIPATION finding (same shape as
  fix-a) — the next lever is lead-side, not more supply.

## Secondary metrics (supporting, never re-scored)

- (a) Cell supply band-wide (appearances, grants by source,
  cell-holder-days, max cells held) arm vs ctl; searcaster grants
  arm vs ctl, by recipient (villager vs scholar pack).
- (b) Armed leads (armed holder IS the lead) and armed volleys
  with damage; "no fusion cells" log lines; searcaster departures
  with/without cells.
- (c) Wall numbers every run: national / table / wins, wave-4 and
  wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (d) Sense-test notes from transcripts (SENSE-TESTING LAW — read
  the fight logs; does the redirected prize read as the System
  arming a fighter, or as loot appearing from nowhere?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, fix, and
  participation bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds: 107051, 107052, 107053, 107054, 107055, 107056, 107057,
  107058 — FRESH band.** Verified 2026-11-20 ~03:15 UTC:
  `grep -rn "107051\|...\|107058" evidence/ --include="*.md"`
  returns NO hits across all dated evidence .md files (the 18 GB
  evidence/ tree makes a full-corpus grep impractical; the .md
  check is the prereg-band freshness check — preregs record bands
  in .md). Neighboring bands are taken: 107021–107028 (diag/fix),
  107031–107038 (participation), 107041–107048 (named in a
  2026-11-19 prereg).
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate, same as the diag, fix, and
  participation bands). **Two legs differing ONLY by SEARSUPPLY**
  (ctl unset, arm `SEARSUPPLY=1`). BOWOPEN, BOWCRAFT, SPEARGATE,
  FUSIONCELL unset on both legs.
- **Instrument:** `scripts/searsupply-driver-a.js` (clone of
  `scripts/fusioncell-participation-driver-a.js` — all cell /
  searcaster census + grant wraps + lead-rule + flee-cause
  instrumentation kept verbatim — with `SEARSUPPLY` in the summary
  row and armed-volley counting from the encounter rows);
  analyzer `scripts/analyze-searsupply-a.js` (clone of
  `scripts/analyze-fusioncell-participation-a.js` plus the
  searsupply judge on the four frozen bars); proof test
  `scripts/test-searsupply-a.js` (redirect-recipient fixtures +
  bundle fixtures + live grant → gear-up → equipped searcaster →
  lead volley fires with a cell consumed + control-leg identity:
  SEARSUPPLY unset, same prize, no bundle, no redirect, no
  reweight). **§15 panel:**
  `scripts/build-searsupply-panels-a.js` (clone of the
  participation panel builder, two legs) + `node
  scripts/balance-panel.js compare`; the compare .md is attached
  to the evidence file. The panel is the instrument, the
  pre-registered threshold is the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the participation band saw 125 wave-4+ meetings
   (engaged ~100) on 8 seeds; the diag band 85 (63 engaged).
   The armed-entry floor (≥ 3) and the volley bar (≥ 1) are sized
   well below either pool — IF the new band behaves like either.
2. **Pool sizing:** bars 1–3 are counts, so they are powered by
   whatever pool arrives; bar 4 is a ratio, powered by the engaged
   meetings. If the band is quiet (few wave-4+ meetings), bars
   2–3 fail honestly as a supply/participation finding, not as a
   metric error — the floors are the power guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-searsupply-a.js`, GREEN before the pilot)
   proves the redirect recipient rule on fixtures, the bundle on
   fixtures, the tier-4 cell reweight on a fixed-draw stub, the
   live grant → gear-up → equip → lead-volley chain, and
   control-leg identity (SEARSUPPLY unset: prize unchanged).
   The analyzer `--selftest` covers the judge shapes (GO,
   NO-GO per bar).
4. **Draw-neutrality check (frozen):** the implementation adds
   ZERO `Math.random()` calls on either leg — verified by grep
   over the diff (`git diff -U0 | grep -c "Math.random"` on added
   lines must be 0) before the pilot. The two legs therefore run
   identical RNG draw counts; any world divergence is a game
   effect, and the guardrail is exposure-normalized regardless.

## Canon note

`docs/CANON.md` (manifest), `docs/CONTESTS.md` (§Prizes: "Prizes
feed EVERY progression lane"; "Loot tie-in: contest prizes and
monster loot share the alien-item pool"), and
`docs/MONSTER-WAVES.md` (wave-4 bands, read by the prior arms)
were consulted for this arm. **No canon doc covers fusion-cell
supply, the searcaster, or cell-weapon volleys** — said here
rather than inventing canon (same as the diag, fix, and
participation arms). The prize, grant, equip, volley, lead, and
flee rules are cited from code (`contests.js` `_cxItemPrize`,
`game.js` `rollAlienLoot` / `alienLootGrant` / `villagerGearUp`,
`equipment.js` `autoEquip` / `volleyWeaponOf`,
`fieldFights.js` volley ~975–1060), not from canon. The redirect
is a design call (this arm's, Steve can overrule): the System
presses its rarest weapon into a fighter's hands, not the
scholar's pack.
