# sim-fusioncell-fix-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fusioncell-fix-a · **Loop A run:** fleshout-20261119T1815Z
**Type:** BUILD + measure — the fix for finding #2599 (the searcaster that
can never fire). **Frozen:** 2026-11-19 ~13:30 UTC, before any judged sim.
**Branch:** `sim-fusioncell-fix-a` (worktree
`~/workspace/worktrees/sim-fusioncell-fix-a`). **Base:** master
7e0810eea (verified with `git rev-parse HEAD` before any work; the diag
ran on 228ac0dd5 — the control leg below is re-measured on THIS base,
and the diag's numbers are reference only).
**Builds on:** `evidence/2026-11-19/sim-fusioncell-a.md` (DIAG-GO) and
`evidence/2026-11-19/sim-fusioncell-a-prereg.md`.

## The question

The diag answered finding #2599: 3 fusion cells band-wide, ALL from
contest prizes (pit x2, informant x1; max 1 per holder), 0 from
monster-kill loot, 0 from ruin salvage, 0 from trade, 0 from corpse
takes, 0 player crafts. 4 searcaster grants band-wide, all contest
prizes. Volley-opportunity pool 0 — the searcaster holder never met a
wave-4+ monster, and the only cell holder who did has no cell-weapon.
Expected armed volley ≈ 98 damage (7–12% of a wave-4 monster). This arm
BUILDS the fix the finding names and proves, on a panel, that a
searcaster holder with cells actually fires a volley in a wave-4+
fight.

## DESIGN CALL (coordinator's call, under Steve's "figure it out
yourself" grant — Steve can overrule)

A searcaster contest-prize grant BUNDLES 2 fusion cells with the weapon
— the grant that gives a searcaster also gives its holder 2 cells — AND
the standalone fusion-cell contest-prize weight goes up modestly
(rollAlienLoot: on a tier-4 contest-prize roll, with probability 0.25
the pick is a fusion_cell outright; otherwise the uniform tier-4 pool
pick stands — cell share of tier-4 contest prizes rises from 1/15
(~7%) to ~30%).

REJECTED alternative, recorded: ruin salvage — villagers almost never
search ruins (~1 ruin search per 2,000 forages), so a ruin source would
be a dead letter; the contest-prize channel is the ONLY proven cell
source. Cells are alien tech, so the source stays alien-side — never a
village craft.

The fix MUST be env-gated (FUSIONCELL=1, node sims only; unset = old
behavior byte-identical), following the SPEARGATE / BOWOPEN / BOWCRAFT
precedent. The fix lands env-gated OFF; the turn-on decision is
adoption's, NOT this arm's.

## The mechanism (frozen, from code read — not a sim)

- **Prize path** (`src/js/contests.js` `_cxItemPrize`, lines ~169–196):
  tier from wave / broadcastRewardTier; extreme-risk + apex + 25% rolls
  tier 4; `rollAlienLoot({wave, loot: {chance, tier, rewardSource:
  'contest'}})`; the roll result is granted via
  `alienLootGrant(loot, person)` — person is the villager object (or
  null for the player, which lands in the scholar inventory).
- **Grant path** (`src/js/game.js` `alienLootGrant`, ~47273): one entry
  per call, pushed to `toCorpse.items` when the second arg carries
  `.items` (a villager person object qualifies; a corpse qualifies),
  else to the scholar inventory. No RNG. The bundle reuses this exact
  call twice with the same recipient, so bundle cells are visible to
  the diag's grant wrap (caller classifies contest-prize by stack) and
  to the daily census exactly like the original prize.
- **Standalone weight** (`src/js/game.js` `rollAlienLoot`, ~47197):
  the tier-4 contest pool is 15 items (4 alien tier-4 + 11
  extraItems[4]); the pick is uniform. The 0.25 override runs AFTER
  the pool is built, ONLY when FUSIONCELL=1 AND rewardSource is
  'contest' AND tier is 4 AND the pool contains fusion_cell; it
  consumes one extra Math.random() draw per tier-4 contest roll, arm
  leg only. Trade ('trade') and kill-loot (no rewardSource) paths are
  untouched.
- **The volley** (`src/js/fieldFights.js`, ~975–1060): the opening
  volley is the LEAD fighter's only — it reads `vp` (the fighter vid),
  their equipped ranged weapon via `rangedWeaponOf`, and their OWN
  items for ammo; each shot costs 1 cell; hit chance 0.37 + tracking
  for the searcaster (range 8, bonus 120 → 64–68 damage per hit, up to
  4 shots, ≈ 98 expected). Allies strike in melee with their own
  weapons but do NOT loose a volley. Consequence, frozen: bar 2
  requires a searcaster holder to be the LEAD fighter of a wave-4+
  meeting — a holder standing as an ally cannot fire, however many
  cells they carry.

## Primary metric (BINDING, §14)

**GO iff ALL FOUR hold on the arm leg (8 seeds, panel-judged):**

1. **Armed holder at entry ≥ 1** — at least 1 searcaster holder with
   ≥1 fusion cell at a wave-4+ fight entry on the arm leg (any
   participant, fighter or ally, from `partyCells` at entry;
   control re-measured; diag measured 0).
2. **Armed volley FIRED ≥ 1** — at least 1 volley fired FROM a
   searcaster in a wave-4+ fight on the arm leg: an encounter row
   with `rangedId === 'searcaster'` AND `volley.shots > 0`. (The
   diag analyzer's looser `volleyFiredFromSearcaster` also counts a
   fighter's non-searcaster volley when an ally is armed — this bar
   does NOT count that; the volley must come from the searcaster
   itself.)
3. **Cell supply band-wide arm ≥ 6 cells** (sum of positive
   fusion-cell appearance deltas, villagers + scholar; control
   re-measured; diag measured 3) **OR searcaster holders with cells
   ≥ 2** (at least 2 distinct searcaster holders — villager census
   holders, plus the scholar where both a searcaster grant and a
   cell grant are contest-prize logged to them — holding ≥1 fusion
   cell at some point).
4. **No-regression guardrails** — median survival arm ≥ 0.8×
   control; village deaths per run (panel `villageDeaths`, mean
   over 8 seeds) arm ≤ control × 1.10.

**Verdict ladder (frozen):**
- **GO** = all four bars hold → finding #2599 moves toward FIXED; the
  lever lands env-gated OFF and the turn-on decision is adoption's.
- **NO-GO** = any bar misses → the fix is REVERTED before commit
  (killed arms leave no trace — game code reverted, only instrument +
  evidence commit). Do NOT re-score against a friendlier metric.

## Secondary metrics (supporting, never re-scored)

- (a) Volley damage dealt in wave-4+ fights from searcasters (sum of
  `volley.dmg` on searcaster-fighter rows); cell-holder days
  (villager + scholar); searcaster holder-days with cells.
- (b) Cell supply by source on each leg (contest-prize / bundle /
  kill-loot / trade / corpse-take / crafted); the bundle's share.
- (c) Searcaster departures with cells; "no fusion cells" log lines.
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.

## RISK NOTE (frozen before the sims — read before judging bars 1–2)

The bundle puts cells in searcaster holders' hands; it does NOT change
who leads wave-4+ fights. On the diag band chen_wei held the searcaster
97 days and never led (or joined) a wave-4+ fight — seed 107023's 8
wave-4+ meetings all had fighter raj_patel. Bars 1–2 therefore depend
on arm-leg participation as well as supply. A NO-GO on bars 1–2 with
bar 3 passing is a PARTICIPATION finding (the gun still never meets
the fight), not a supply finding — it is recorded in metric review and
does NOT re-score the bars, and the fix still reverts per the ladder
(the fix as designed cannot prove its volley on this band). The
follow-up then belongs to a participation arm, not a bigger bundle.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds: 107021, 107022, 107023, 107024, 107025, 107026, 107027,
  107028 — THE SAME BAND the diag used.** Deliberate reuse: the
  finding was observed on these villages; the fix is proven on the
  same villages. No freshness claim.
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate, same as the diag). **Two
  legs, ONE flag difference:** ctl runs FUSIONCELL unset (the old
  prize table, byte-identical); arm runs FUSIONCELL=1 (the fix).
  BOWOPEN, BOWCRAFT, SPEARGATE unset on both legs. Legs differ ONLY
  by FUSIONCELL.
- **Instrument:** `scripts/fusioncell-driver-fix-a.js` (clone of
  `scripts/fusioncell-driver-a.js` — the grant wraps from the diag's
  v2 driver are kept verbatim — with MODE=ctl|arm, FUSIONCELL
  assertions, OUTDIR perseed-fusioncell-fix-a-ctl / -arm);
  analyzer `scripts/analyze-fusioncell-fix-a.js` (clone of
  `scripts/analyze-fusioncell-a.js` plus the cross-leg GO/NO-GO
  judge on the four frozen bars and the tightened searcaster-volley
  count); per-seed JSONs under
  `evidence/2026-11-19/perseed-fusioncell-fix-a-ctl/` and
  `evidence/2026-11-19/perseed-fusioncell-fix-a-arm/`.
  **§15 panel:** `scripts/build-fusioncell-panels-fix-a.js` (clone
  of the diag panel builder, two legs) + `node
  scripts/balance-panel.js compare`; the compare .md is attached to
  the evidence file. The panel is the instrument, the pre-registered
  threshold is the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched, so
the fixture is the encounter itself, staged by the competent policy:
a geared scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-fusioncell-fix-a.js`) stages
its live volley smoke the same way the diag did — a geared villager
fighter with a party (`fieldFight(vid, mdef, null, {allies: 1})`) —
plus the bundle checks (a searcaster prize grant gives the same
holder 2 cells; a standalone cell prize still works) and the
control-leg identity check (FUSIONCELL unset = old prize table,
same prize, no bundle).

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the diag band saw 85 wave-4+ meetings (63 engaged)
   on 8 seeds. The bars are sized to that — IF a searcaster holder
   ever leads one (see the risk note above).
2. **Pool sizing:** the holder population is 1 known searcaster
   holder (chen_wei) + 3 scholar searcasters on 8 seeds. The bundle
   converts every searcaster grant into 2 cells for its holder, so
   bar 3 is powered by the grant count (4 grants on the diag band →
   8 bundle cells); bars 1–2 are powered by participation, which is
   the measured unknown.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fusioncell-fix-a.js`, GREEN before the pilot)
   proves the bundle (searcaster prize → same holder + 2 cells, for
   villager and for player), the standalone cell prize still works,
   the control-leg identity (FUSIONCELL unset: same prize, no
   bundle, no override draw), the tier-4 contest pool read live
   (15 items, fusion_cell present), and the armed searcaster volley
   on the encounter-gear fixture. The analyzer `--selftest` covers
   the cross-leg judge shapes (GO, NO-GO per bar).

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500. **No canon doc covers fusion-cell supply, the searcaster,
or cell-weapon volleys** — said here rather than inventing canon
(same as the diag). The fix is cited from data
(`src/data/items.json` searcaster/fusion_cell defs,
`src/data/reward-economy.json` extraItems[4]) and code
(`contests.js` `_cxItemPrize`, `game.js` `rollAlienLoot` /
`alienLootGrant`, `fieldFights.js` volley), not from canon.
