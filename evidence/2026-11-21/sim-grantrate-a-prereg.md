# sim-grantrate-a — PREREG (frozen)

**Arm:** sim-grantrate-a · **Loop A run:** fleshout-20261121T1615Z
**Axis:** scale-onramp · **Type:** DIAG — searcaster contest-prize GRANT RATE (finding #2635 follow-up, named by sim-vanishcause-a §6)
**Base master:** `abfc8f466` (verify `git log --oneline -1` at worktree start; worktree
`~/workspace/worktrees/sim-grantrate-a`, `git status --short --untracked-files=no` empty)
**Branch:** `sim-grantrate-a`
**Frozen:** 2026-11-21 ~16:40 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief)

sim-vanishcause-a closed the gun-vanish question (no gun is ever lost to an
unknown sink) and moved the holder-supply question upstream: **4 of 8 pilot
seeds see ZERO searcaster grants in 150 days (5 grants in 8 runs)**, and the
gun enters the world only through contest prizes (plus one kill-loot drop to
a monster corpse nobody took, seed 107222 day 105). This arm measures the
grant stream itself, before anyone proposes a supply fix:

- grants per seed, grants per contest entered, grants per contest prize roll
- the searcaster's weight in the contest prize table (static + measured)
- cells per gun at grant
- second-chance behaviour: does a village that never wins a gun (or loses
  its first one) ever get another grant, or is one missed prize the end of
  the line?

**No src delta by construction.** Diagnosis, instrument + evidence only.

## 2. Code-read priors (the funnel, from code + data on this base — hypotheses to confirm, not conclusions)

Canon: docs/CONTESTS.md ("Prizes — every lane", prize table 60% / 75%
hardened, tier capped at 3, tier 4 only at 25% for extreme-risk wins at
wave 4). No canon doc covers the searcaster / grant-rate rules specifically;
the numbers below are read from code and data.

**The funnel, stage by stage** (each stage is a separate measured rate):

1. **Contest entry.** Contests fire from day 14+ (`contestTick`, ~2/week
   combined contests+shows budget; pilot guarantee: if day ≥ 21 and no pilot
   has aired, the schedule is forced). `fireContest(contest)` takes the
   participants; `_contestEnd(ac, outcome, prize)` resolves each one.
   Only WINNERS get a prize roll: `_cxItemPrize(ac, contest, who)` is called
   for the player win (contests.js:5340) and for villager wins / co-winners
   (contests.js:5309, 6305). Losers, survivors and the dead get no roll.
2. **Prize chance.** `_cxItemPrize` (contests.js:201): `chance` 0.60 base,
   0.75 hardened, +0.15 high risk, +0.30 extreme, capped 0.95.
   `rollAlienLoot` returns null when `Math.random() >= chance` — the "shy
   vault" (no item, no grant).
3. **Tier.** `tier = max(min(3, wave), broadcastRewardTier(who))`;
   `broadcastRewardTier`: tier 2 at 3 contest wins or 40 favor, tier 3 at
   6 wins or 70 favor. **Tier 4 ONLY when** `contest.risk === 'extreme'`
   AND apex (`wave >= 4` OR `wins >= 8` OR `apFavor >= 100`) AND
   `Math.random() < apexChance` (0.25, `reward-economy.json` broadcast).
   So a tier-4 roll needs an extreme-risk contest at wave 4+ (or a
   much-decorated winner) AND a 1-in-4 roll.
4. **Pool weight (static, verified in data).** `rollAlienLoot`
   (game.js:47508): for `rewardSource: 'contest'` the tier-4 pool is the
   15 items with `lootTier === 4` and (`origin === 'alien'` OR in
   `extraItems[4]`): adaptive_dermis, apex_bow, bloodplate,
   commanders_coat, conquerors_plate, farstrider_boots, fusion_cell,
   genesis_seed, godslayer_spear, lifebound_vestments, searcaster,
   second_skin_suit, starfall_lance, worldbreaker_maul, worldroot_plate.
   **Searcaster weight: 1/15 = 6.7% unweighted.** With `GUNRATE=1` the
   pool gets 3 extra searcaster copies → **4/18 = 22.2%**. (The gunrate
   comment's 1/15 → 4/18 is confirmed against live data.)
   `fusion_cell` is itself in the tier-4 pool: a tier-4 prize can be a
   lone cell (1 unit via `alienLootGrant`).
5. **Redirect + bundle (GUNRATE=1).** A player-won searcaster or fusion_cell
   is REDIRECTED to `_gunRateFighter()` (contests.js:174): lead-weighted
   living villager — +8 on expedition, +2 per expedition (cap 8), +4
   wave-3 kill, +2 wave-2 kill, +1 per contest win. A searcaster prize
   BUNDLES 2 fusion_cell units to the same recipient (pushed direct to
   `person.items`, bypassing `alienLootGrant` — the instrument must read
   the recipient's cells pre/post `_cxItemPrize`, not the grant wrap).
   Villager-won prizes go direct to that villager, no redirect.
6. **Other gun entries (measured, not assumed).** Kill loot:
   `villagerKillLoot` → `rollAlienLoot` → `alienLootGrant(dropId,
   lootCorpse)` — a searcaster drop lands on the monster's corpse and
   only enters a pack when the scholar takes it (`_corpseTakeStack`).
   Show gifts are tier ≤ 3, so no searcaster there. Trade
   (`betrayal.js` → `alienLootGrant`) is a fourth caller in the
   taxonomy; the instrument records it and must show its count (expected 0
   for searcaster).

**Static prior for the funnel** (before measuring): P(searcaster | one
`_cxItemPrize` call) = P(roll succeeds) × P(tier 4) × P(searcaster | tier 4).
P(tier 4) is the choke: it needs extreme-risk + apex + a 25% roll, so even
with the GUNRATE 22.2% pool weight the per-roll gun rate is small. The
binding constraint is expected to be tier-4 ACCESS, not the pool weight —
the measurement will say whether that prior holds.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107237–107244 (fresh).** Searched every prereg under
  `evidence/*/sim-*-prereg.md` (1,080 files) for `1072[3-9][0-9]` — the
  only hits are `107236` (2×, sim-m1range-a: its band is 107211–107236,
  pilot + confirm-extension 107229–107236). Searched
  `evidence/*/sim-*.md` for `107237|107238|107239|10724[0-4]` — zero
  hits. Searched the goal `hidden_files/sim-findings.md` for
  `1072[3-9][0-9]` — zero hits. No forbidden-band list file exists in
  the goal `hidden_files/` (checked 2026-11-21). Forbidden bands from
  the brief (106751–106766, 107221–107228, 107191–107198, 107131–107138,
  107111–107118, 107091–107098, 107081–107088, 107051–107058,
  107021–107028) do not overlap 107237–107244. Nearest used band:
  107229–107236 (m1range). The band is fresh by the skill's rule (a named
  band is used; this one is named nowhere).
- **sim-fusioncell-a.md: NOT FOUND.** The brief asked to read
  `evidence/2026-11-21/sim-fusioncell-a.md`; it exists in neither the
  worktree nor the main tree (`ls` + grep for `fusion`/`grantrate` in
  both trees, 2026-11-21). The fusion-cell evidence on this date lives
  in `fiberfetch-a` / `fibersupply-a` analysis files. Nothing is
  re-measured from it: this arm's only cell question is cells-per-gun-
  at-grant (§5 S4), measured live here.

## 4. Instrument (frozen design)

**No src hooks.** Every grant event is a `Game` namespace method visible
to a driver wrap, so the instrument is driver wraps + pure reads only;
**0 src delta by construction**. If the smoke (§7) shows an event the
wraps cannot see, that is reported in the evidence — no src hook is
added mid-run without a prereg amendment before the judged pilot.

- `scripts/grantrate-driver-a.js` — NEW compact driver (vanishcause
  driver PATTERN: wraps + daily census; not a 2500-line clone — this
  diag needs only the contest/grant funnel, the gun census, and wall
  fields). Wraps (pure reads + driver-local writes; every game function
  runs exactly once, untouched):
  - `fireContest(contest)` — contest fired: id, risk, variant, day,
    participants (ids + count).
  - `_contestEnd(ac, outcome, prize)` — resolution: outcome, participant,
    prize flag, day.
  - `_cxItemPrize(ac, contest, who)` — prize roll: who, contest id/risk,
    wave at call, return (granted bool), recipient cells pre/post
    (searcaster count + fusion_cell units on the recipient's items —
    the GUNRATE bundle bypasses `alienLootGrant`), monotonic seq.
  - `rollAlienLoot(mdef, fighter)` — every loot roll: args (chance, tier,
    rewardSource), result (item id or null), caller classification via
    stack (contest-prize / kill-loot / other), seq of the enclosing
    `_cxItemPrize` call when nested (the funnel join key).
  - `alienLootGrant(itemId, toCorpse)` — grant events with caller taxonomy
    + recipient (vanishcause `classifyGrantCaller` / `grantRecipientOf`,
    copied).
  - `villagerKillLoot(vid, mdef)` — kill-loot drops (dropId).
  - `_corpseTakeStack(c, it)` — scholar corpse takes (searcaster recovery
    of kill-loot guns).
  - daily snapshot (end of day, same hook point as the vanishcause
    driver): FULL gun-location census (`gunLocationsOf`, copied from the
    vanishcause driver — total guns + holder count per day) PLUS wall
    fields (standing, wave, survival, deaths).
- `scripts/analyze-grantrate-a.js` — per-seed funnel + grant timeline +
  second-chance answers (§5) + frozen-bar verdict (§6); `--selftest`
  green before pilot.
- `scripts/test-grantrate-a.js` — proof test: funnel fixtures (each tier
  path incl. tier-4 gating), join fixtures (prize roll ↔ loot roll ↔
  grant), second-chance fixtures (grant-after-first, re-grant-after-loss,
  zero-grant village), bundle fixture (2 cells with the gun). GREEN
  before pilot.
- `scripts/build-grantrate-panels-a.js` — panel builder (vanishcause
  builder pattern): two identical legs → before/after panel JSONs →
  `scripts/balance-panel.js compare` (§6 guardrail: the compare is the
  instrument-neutrality proof, not a lever comparison).

## 5. Second-chance definitions (frozen — the deliverable's taxonomy)

- **S1 — zero-grant villages:** for each seed with 0 searcaster grants in
  150d: contests fired, contests entered by the player/villagers,
  `_cxItemPrize` calls, `rollAlienLoot` contest rolls, tier-4 rolls.
  Distinguishes "never reached the roll" from "rolled and lost".
- **S2 — second grant after the first:** for each seed with ≥ 1 grant:
  grants after the first-grant day (count + days). A second grant in the
  same run is a second chance that arrived.
- **S3 — re-grant after LOSS:** a loss day is a day the gun total falls
  to 0 after having been ≥ 1 (daily census), or a holder-died day after
  which the gun sits on a corpse unrecovered for ≥ 7 days. For each loss:
  does a later grant arrive before day 150 / village loss? (Yes/no +
  days-to-re-grant.)
- **S4 — cells per gun at grant:** for each searcaster grant: fusion_cell
  units on the recipient immediately after the `_cxItemPrize` call
  (bundle 2 + any pre-existing cells on the recipient), plus any
  separate fusion_cell prize to the same recipient within ±1 day.
- **S5 — kill-loot entry:** searcaster drops to monster corpses per seed
  and whether the scholar ever takes one (`_corpseTakeStack`).

## 6. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every contest prize roll carries tier + result (no roll without a tier) | all must hold |
| 2 | **Coverage / attribution** — 100% of `_cxItemPrize` calls joined to a `rollAlienLoot` row; 100% of searcaster grant events attributed to a prize-roll or kill-loot source; 0 unclassified grant sources | all must hold |
| 3 | **Answer quantified** — per-seed table + funnel (contests → prize rolls → tier-4 rolls → searcaster grants) + all five second-chance answers S1–S5 named with numbers | all must hold |
| 4 | **Guardrail (instrument neutrality)** — leg1 vs leg2 corpora identical on all simulation fields (fidelity-style check); `v4lends` 0 (LEND off); panel compare no material signal on observed metrics; 0 src delta | all must hold |

No bar is re-scored mid-run (§14). A miss is NO-GO, recorded with a metric review.
DIAG-GO = all four bars pass: the grant stream is measured with a proven
instrument. DIAG-GO does NOT mean the rate is high — a scarce rate measured
cleanly is still GO; the rate itself is the finding.

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107222** first —
  the vanishcause band seed with the known grant history (1 contest-prize
  grant day 72 + 1 kill-loot searcaster drop to a monster corpse day 105,
  never taken). Gate: funnel joins 100% + 0 instrument errors + ≥ 1
  `_cxItemPrize` roll observed. The known-grant history is a CROSS-CHECK,
  not a day-number gate: the trajectory may have moved since base
  b6aad8942 (vanishcause smoke §1 precedent — same mechanisms, shifted
  days); the smoke reports what 107222 yields vs the vanishcause record
  and proceeds on the join/error gate.
- **Pilot (judged):** 8 seeds, **107237–107244**, horizon 150d death-aware,
  competent verbatim policy (`scripts/policies/competent.js`).
- **Substrate env (both legs, identical):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
  SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset; `PRESENCE` unset.
- **Two legs, IDENTICAL env (leg1 / leg2):** this is a diag with no lever, so the
  second leg is not a control — it is the instrument-neutrality proof for bar 4
  (the balanced-panel compare runs leg1 → leg2; the honest result is
  no-material-signal everywhere, proving the recorder does not perturb the sim).
- **Wall numbers** recorded per leg: national / table / wins, wave 4–5 unlocks,
  median survival.
- **Canon:** docs/CONTESTS.md (prize table); no canon doc covers the
  searcaster grant-rate rules; rules are cited from code + data (see §2).
  Said here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)

## Amendment A — smoke catch (before any judged sim, 2026-11-21 ~17:05 UTC)

The smoke on seed 107222 caught one wrong code-read prior in §2, fixed
before the judged pilot (no judged sim has run; the amendment is committed
before the pilot, so no bar is re-scored):

- **§2 prior, corrected:** kill loot has TWO shapes, not one.
  `villagerKillLoot` (game.js:8145) pushes the drop DIRECT to the killer's
  pack — no `alienLootGrant` call at all. The corpse path is the PLAYER's
  kill reward, `tbKillRewards` (game.js:47786): `rollAlienLoot` →
  `corpseForKill` → `alienLootGrant(dropId, lootCorpse)`. `corpseForKill`
  is a SIBLING of the roll/grant calls, not an ancestor, so the stack
  names `tbKillRewards` — the first smoke run classified the day-105
  corpse grant as caller `other` (frame `tbKillRewards@game.js:47790`).
- **Fix (instrument only, 0 src delta):** `classifyGrantCaller` and
  `classifyRollCaller` gain a `tbKillRewards` branch (→ `kill-loot-corpse`
  / `kill-loot`). Analyzer S5 counts player-kill corpse grants as
  kill-loot drops alongside villagerKillLoot drops. Proof test + analyzer
  selftest gain tbKillRewards cases (selftest 20/20, proof test 39/39).
- **Smoke re-run reproduces the trajectory exactly** (same days, counts,
  and sim fields on 107222) and now resolves the cross-check exactly:
  contest-prize grant day 72 to gen_gmy38x3 (2 cells bundled) +
  tbKillRewards corpse drop day 105, never taken — matching the
  vanishcause record. Smoke gate passes: joins 100%, 0 instrument errors,
  19 prize rolls observed.
