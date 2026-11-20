# sim-gunrate-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-gunrate-a · **Loop A run:** fleshout-20261120T0315Z
**Type:** BUILD + measure — the searcaster GUN-RATE lever for finding #2599
**Frozen:** 2026-11-20 ~09:35 UTC, before any judged sim.
**Branch:** `sim-gunrate-a` (worktree
`~/workspace/worktrees/sim-gunrate-a`). **Base:** master
59711ccc5 (verified with `git rev-parse HEAD` before any work).
**Builds on:** `evidence/2026-11-19/sim-searsupply-a.md` (NO-GO kind
SUPPLY) and `evidence/2026-11-19/sim-searsupply-a-prereg.md`.

## The question (finding #2599's named next lever)

The searsupply verdict, verbatim: "the lever fixed the cells and not
the gun. Cell supply rose sharply on the arm leg (appearances 13 vs 2;
grants 9 vs 3, all contest-prize; cell-holder-days 316 vs 0; max cells
ever held 2), but the searcaster itself did not: **1 searcaster grant
per leg, 1 appearance per leg** — the gun is still 1/15 per tier-4
contest prize, and tier-4 prizes are rare." Its named next lever:
"raise the GUN rate, not the cells — e.g. a searcaster-weighted
tier-4 contest prize, or more tier-4 prizes reaching villagers — and,
once a second holder exists, weight the recipient toward expedition
holders, who are the leads (bar 3's real gate)."

Counted from the searsupply corpora (this prereg, not a sim):
ctl 153 contest grants, 34 tier-4, 1 searcaster, 2 cells; arm 133
contest grants, 30 tier-4, 1 searcaster, 9 cells. So the tier-4
contest-prize pool is ~30–34 per 8-seed band, and at 1/15 the gun
arrives ~2 times per band by expectation (observed 1 + 1). The
expedition-holder lead share is real: expedition-holder leads were
63/172 (ctl) and 58/231 (arm) of wave-4+ meetings — the leads exist,
the gun just never reaches them.

## The mechanism (frozen, from code read — not a sim)

- **searcaster:** alien, lootTier 4, bonus 120, range 8, damageType
  energy, `weapon.ammo = fusion_cell`. **fusion_cell:** alien,
  lootTier 4, material, `findable: false`. No recipe, no ruin
  salvage, no pile stock, no player craft, no monster-kill loot.
- **Contest prizes** (`src/js/contests.js` `_cxItemPrize` ~169–200):
  `rollAlienLoot({wave, loot:{chance, tier, rewardSource:'contest'}})`
  → `alienLootGrant(loot, person)`; `person` is null for
  `who='player'` (lands in the scholar's pack) or the villager
  person object (lands in their `items`). Tier 4 requires
  extreme-risk + apex + the 0.25 apex roll.
- **`rollAlienLoot`** (`src/js/game.js` ~47216): pool = alien
  tier-4 items + `rewardEconomy.extraItems[4]` (11 items) = 15
  items; the pick is ONE draw, `pool[floor(random()*pool.length)]`.
  A tier-4 contest prize is a cell with probability 1/15, a
  searcaster 1/15.
- **Expedition holders lead.** `villager-agency.js`
  `expeditionMonster`: the `vid` is the expedition HOLDER — whoever
  launched the expedition leads its fights. Live state:
  `agencyState().exped[vid]` (currently on an expedition, set by
  `startExpedition`, cleared on return) and
  `agencyState().stats[vid].expeditions` (lifetime launches).
  Both are deterministic reads, zero RNG.
- **The scholar's pack is a dead end for these two items.**
  Searsupply diag: 3 of 4 searcaster grants went to the scholar's
  pack; the census never sees a ranged weapon on the scholar. The
  volley reads the LEAD fighter's equipped ranged weapon + their
  own ammo (`fieldFights.js` ~975–1060).
- **Equip is not the gap.** A searcaster in a villager's `items`
  is equipped by `villagerGearUp` → `autoEquip` (deterministic,
  no RNG), and the proof test proves the live chain (grant →
  gear-up → equipped searcaster → lead volley fires, cell consumed).

## The design (frozen; my call, Steve can overrule)

**GUNRATE=1** (default OFF; the turn-on decision is the
coordinator's, not this arm's). Three parts, ALL draw-neutral BY
CONSTRUCTION — no new `Math.random()` draw on either leg, so the
fix-a exposure confound cannot recur:

1. **Gun weight.** In `rollAlienLoot`, on rewardSource (contest)
   paths at tier 4 only, append 3 extra `searcaster` entries to
   the pool (searcaster probability 1/15 → 4/18 ≈ 22%). Same
   single pick draw, different mapping — draw count identical
   leg-to-leg. Kill loot, show gifts, trade, and corpse takes are
   untouched. Expected gun grants per band: ~32 tier-4 prizes ×
   4/18 ≈ **7** (vs ~2 at 1/15). Known cost, stated here: the
   other fourteen tier-4 items share falls from 14/15 to 14/18
   of tier-4 picks — the gun crowds the apex pool. If this arm
   goes GO, the landing weight is still tunable down; the pilot
   tests whether the gun rate is the wall, decisively.
2. **Expedition-holder redirect.** New `_gunRateFighter` in
   `contests.js`: when `who === 'player'` and the loot is a
   `searcaster` or `fusion_cell`, redirect the grant to the
   village's lead-weighted living villager instead of the
   scholar's pack. Score (deterministic, roster-order tie-break):
   currently on an expedition **+8**; expeditions launched **+2
   each, capped +8**; wave3Kill **+4**; wave2Kill **+2**;
   contestWin **+1 each**. Own eligibility, same as searsupply
   (NOT `contestEligible` — the day-14 casting gate must not
   decide who can carry the gun): alive, member, age 15–72,
   HP > 20, not severed; no away check — the System delivers
   wherever the fighter stands. If no eligible villager exists,
   the prize falls back to the player unchanged. Rationale: the
   searsupply verdict names expedition holders as the leads, and
   the deed heuristic picked a proven fighter who never leads.
   This changes who receives a player prize — a feel change, so
   the landing commit carries `[needs-eyes]`.
3. **Bundle (reused from searsupply, proven).** In
   `_cxItemPrize`, when the granted loot is a `searcaster`,
   grant +2 `fusion_cell` to the SAME recipient (deterministic
   consequence of an existing grant, zero draws). Without it,
   bar 3 is untestable: on the control substrate cells run
   ~3 per band, and a cell-less gun is the diag's empty-gun
   finding, not a volley test. The bundle is the gun arriving
   loaded; it is NOT a second supply lever — the searsupply
   cell reweight (tier-4 cell ×4) is NOT rebuilt here. Cells
   reach villagers only through the bundle now (plus the pool's
   residual 1/18 cell share, ~2 per band).

**NOT built here:** raising the tier-4 rate itself (the 0.25 apex
roll) — the weighted prize is the targeted mechanism, and raising
all tier-4 items would be a broader loot-economy change than the
verdict names. Alien-side ruin salvage for cells — villagers
almost never search ruins, unmeasurable on an 8-seed pilot
(searsupply prereg). No village craft for cells, ever — cells are
alien tech.

## Primary metric (BINDING, §14)

**GO iff ALL FOUR hold on the band (8 seeds, two legs, identical
seeds, panel §15):**

1. **Searcaster-holder-days floor:** villager searcaster-holder-days
   (arm) ≥ 40. (Searsupply arm: 22. Diag band: 97 from one holder.)
2. **Armed-holder entries floor:** wave-4+ fight entries with a
   searcaster holder carrying ≥ 1 cell (any participant, arm) ≥ 3.
   (Searsupply arm: 4.)
3. **Armed volley FIRED ≥ 1:** a volley FROM a searcaster in a
   wave-4+ fight (lead `rangedId === 'searcaster'` AND
   `volley.shots > 0`, arm). This is the proof bar #2599 names.
4. **No-regression guardrail, EXPOSURE-NORMALIZED** (searsupply
   §14, adopted — the raw deaths/run bar is retired for this arm
   because it punishes exposure, not game effects): deaths per
   engaged wave-4+ meeting (arm) ≤ 1.10 × control; AND median
   survival (arm) ≥ 0.80 × control. Deaths per engaged meeting is
   the binding guardrail number.

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
  fix-a and searsupply) — the next lever is lead-side, not more
  supply. A NO-GO on bar 1 with the gun grants still ~1 per leg
  is a WEIGHT finding (the weight did not move the grant rate —
  investigate the pool, do not just raise the weight blind).

## Secondary metrics (supporting, never re-scored)

- (a) Gun supply band-wide (tier-4 contest prizes, searcaster
  grants by source and by recipient — expedition holder vs
  deed-fighter vs scholar pack; holder-days; max cells held)
  arm vs ctl; cell grants arm vs ctl (bundle vs pool).
- (b) Armed leads (armed holder IS the lead) and armed volleys
  with damage; "no fusion cells" log lines; searcaster departures
  with/without cells; redirect-recipient mix (how often the
  expedition-holder term decided the recipient vs the deed terms).
- (c) Wall numbers every run: national / table / wins, wave-4 and
  wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.
- (d) Sense-test notes from transcripts (SENSE-TESTING LAW — read
  the fight logs; does the redirected prize read as the System
  arming a lead, or as loot appearing from nowhere? does the gun
  fire from the front of the party?).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the diag, fix,
  participation, and searsupply bands, for comparability). Dead
  villages stop simulating (+10d tail max).
- **Seeds: 107051, 107052, 107053, 107054, 107055, 107056, 107057,
  107058 — REUSED band, per the task** (paired before/after on
  identical seeds, one flag apart). The control leg is a FRESH
  run on this band with the new substrate (BOWOPEN+SPEARGATE on);
  the searsupply legs are historical context only, never the
  paired control — the two legs of THIS arm differ ONLY by
  GUNRATE. The reuse is deliberate: same seeds, same substrate,
  one flag apart is the cleanest before/after the band allows.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
  SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1` (same band as
  searsupply-a/bowsee-a plus the two bow/spear flags now live on
  master). **Two legs differing ONLY by GUNRATE** (ctl unset, arm
  `GUNRATE=1`). SEARSUPPLY, BOWCRAFT, FUSIONCELL unset on both
  legs (searsupply was reverted — its code is absent from master).
- **Instrument:** `scripts/gunrate-driver-a.js` (clone of
  `scripts/searsupply-driver-a.js` — all cell / searcaster census
  + grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — with `GUNRATE` in the summary row, BOWOPEN and
  SPEARGATE REQUIRED on both legs, and the panel builder's
  default band fixed to 107051–107058 per the searsupply §7
  note); analyzer `scripts/analyze-gunrate-a.js` (clone of
  `scripts/analyze-searsupply-a.js`, same four frozen bars);
  proof test `scripts/test-gunrate-a.js` (redirect-recipient
  fixtures — expedition holder beats deed-fighter beats
  roster-order — + bundle fixtures + live grant → gear-up →
  equipped searcaster → lead volley fires with a cell consumed +
  gun-weight on/off on a fixed-draw stub + control-leg identity:
  GUNRATE unset, same prize, no bundle, no redirect, no
  reweight). **§15 panel:**
  `scripts/build-gunrate-panels-a.js` (clone of the searsupply
  panel builder, two legs) + `node scripts/balance-panel.js
  compare`; the compare .md is attached to the evidence file.
  The panel is the instrument, the pre-registered threshold is
  the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the searsupply band saw 172 (ctl) / 231 (arm)
   wave-4+ meetings (engaged 123 / 191) on 8 seeds. The
   armed-entry floor (≥ 3) and the volley bar (≥ 1) are sized
   well below either pool — IF the new band behaves like it.
2. **Pool sizing:** bars 1–3 are counts, so they are powered by
   whatever pool arrives; bar 4 is a ratio, powered by the engaged
   meetings. Expected gun grants ~7 per band at 4/18 (vs 1
   observed per leg at 1/15); if the arm leg still grants ~1,
   bar 1 fails as a WEIGHT finding (see the ladder). If the band
   is quiet (few wave-4+ meetings), bars 2–3 fail honestly as a
   supply/participation finding, not as a metric error — the
   floors are the power guard.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-gunrate-a.js`, GREEN before the pilot) proves
   the redirect recipient rule on fixtures (expedition holder
   first, deeds second, roster-order tie-break), the bundle on
   fixtures, the tier-4 gun reweight on a fixed-draw stub, the
   live grant → gear-up → equip → lead-volley chain, and
   control-leg identity (GUNRATE unset: prize unchanged). The
   analyzer `--selftest` covers the judge shapes (GO,
   NO-GO per bar).
4. **Draw-neutrality check (frozen):** the implementation adds
   ZERO `Math.random()` calls on either leg — verified by grep
   over the diff (`git diff -U0 | grep -c "Math.random"` on added
   lines must be 0) before the pilot, and by the proof test's
   draw-count assertions (2 draws `rollAlienLoot`, 3 draws
   `_cxItemPrize`, identical on both legs). The two legs therefore
   run identical RNG draw counts; any world divergence is a game
   effect, and the guardrail is exposure-normalized regardless.

## Canon note

`docs/CANON.md` (manifest), `docs/CONTESTS.md` (§Prizes: "Prizes
feed EVERY progression lane"; "Loot tie-in: contest prizes and
monster loot share the alien-item pool"; "Extreme contests have an
earned apex opportunity; ordinary wins cap at tier3"), and
`docs/MONSTER-WAVES.md` (wave-4 bands, read by the prior arms)
were consulted for this arm. **No canon doc covers fusion-cell
supply, the searcaster, or cell-weapon volleys** — said here
rather than inventing canon (same as the diag, fix, participation,
and searsupply arms). The prize, grant, equip, volley, lead, and
expedition-holder rules are cited from code (`contests.js`
`_cxItemPrize`, `game.js` `rollAlienLoot` / `alienLootGrant` /
`villagerGearUp`, `equipment.js` `autoEquip` / `volleyWeaponOf`,
`fieldFights.js` volley ~975–1060, `villager-agency.js`
`startExpedition` / `expeditionMonster` / `agencyState`), not from
canon. The redirect is a design call (this arm's, Steve can
overrule): the System presses its rarest weapon into a lead's
hands — the villager who walks out front — not the scholar's pack.
