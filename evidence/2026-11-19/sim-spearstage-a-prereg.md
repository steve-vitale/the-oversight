# sim-spearstage-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-spearstage-a · **Loop A run:** fleshout-20261119T2215Z
**Type:** MEASURE (confirm) — finding #2590 (spear in the ranged slot
blinds the staging gate), gate + source interaction under the new
ground. **Frozen:** 2026-11-19 ~00:30 UTC, before any new sim.
**Branch:** `sim-spearstage-a` (worktree
`~/workspace/worktrees/sim-spearstage-a`). **Base:** master 7d71cb971
(the ship loop's version bump on top of 5e38f3f7b; `git show --stat
HEAD` verified: index.html is `?v=` cache-bust churn only, plus
src/js/build.js + version.json — no game-code change).
**Builds on:** `evidence/2026-11-19/sim-bowopen-a.md` (§§5, 8, 10),
`evidence/2026-11-19/sim-speargate-a.md` + prereg,
`evidence/2026-11-19/sim-bowcraft-a.md` + confirm.

## §0. The ground changed — what this arm is, and is not (frozen, not a sim)

The coordinator's brief asked this arm to BUILD the #2590 fix under a
new `SPEARSTAGE=1` flag. On reading the base, that fix is ALREADY
BUILT, PILOTED GO, AND LANDED on master:

- `sim-speargate-a` (adoption closeout a1f0392bb, landing commit
  416e81241): `equipment.volleyWeaponOf` (ammo check, not the slot)
  + `villagerStageBow` step 0 behind `SPEARGATE=1` + #2593 ammo
  naming. Pilot GO 12/12 frozen bars on band 105901–105908
  (54/54 spear-holder departures passed, staged 0 both legs —
  sources empty). Both flags default OFF in live play.
- `sim-bowcraft-a` + confirm (BOWCRAFT turn-on d56fbe819, 1815Z
  adoption): the home duty is LIVE in play now.

Building a second `SPEARSTAGE` flag duplicating the landed
`SPEARGATE` gate would be wasteful and confusing, so this arm builds
**no new game code and no new flag**. What it does instead is the
measurement the bowopen §8 hook froze and neither prior pilot could
run: **gate + source TOGETHER**. Speargate's pilot ran while the
bowcraft duty still served the weaponless only, so its sources were
empty by construction (staged 0 expected). Bowcraft's pilot + confirm
ran with `SPEARGATE` off, so the staging gate still no-op'd on
spear-holders. Now the ground is: BOWCRAFT live (spear-holders get
bow knowledge from seeing + home bow crafts) AND the SPEARGATE gate
live-but-off. This pilot measures whether switching the gate on, on
top of the live source, actually puts volley-capable weapons into
spear-holders' hands at wave-4+ meeting entry — and whether the
volley rate moves. That is the bowopen hook's second half ("the bow
source must exist at departure"), tested for the first time with both
halves present.

**The turn-on decision is the coordinator's/adoption's, NOT this
arm's.** This arm judges the measurement; it recommends nothing
about live flags beyond reporting the verdict.

## §0a. The bowcraft-duty audit (brief part b — answered before any sim)

Read in full before judging: `src/js/villager-build.js`
`villagerWeaponCraftDay` (~1240–1470).

- The duty ALREADY serves spear-holders. Lines 1375–1393: a villager
  with no volley-capable ranged weapon is served even when armed —
  `eq.volleyWeaponOf(p, defs)` (line ~1383) plus a pack scan for any
  ammo-bearing weapon; a spear in the ranged slot is not a ranged
  weapon by this read. Armed-but-ranged-less villagers craft BOW
  rungs only (`BOW_RUNGS`, line ~1411); a villager holding a volley
  weapon is still skipped. Turned on 1815Z (d56fbe819, env gate
  removed; `bowcraftOn = true`, line ~1320).
- Knowledge seeding (lines 1359–1368, BOWCRAFT seeing): a ladder
  weapon EQUIPPED by another villager at home teaches L1 — so a
  spear-holder who has SEEN a bow at home now carries bow knowledge
  into the departure craft, which is exactly the source the frozen
  hook requires. The departure craft itself (`game.js`
  `villagerStageBow` step 3) never seeds knowledge — it reads the
  shared `v.weaponCraft` record.
- **Scope consequence:** the fix is staging-only. No bowcraft-duty
  change is needed, and none is made. The only remaining question is
  whether the departure sources (own stash / armory / craft) now
  yield for the spear-holders the gate passes — measured here.

## §0b. The staging-gate audit (read before judging)

`src/js/game.js` `villagerStageBow` (~7813–8020), `equipment.js`
`volleyWeaponOf` (~366–390), `villagerPocketAmmo` (~8025+),
`fieldFights.js` volley block (~975–1064):

- Step 0 (gate): SPEARGATE on → equipped read via
  `volleyWeaponOf`, pack scan via the ammo test (`isVolley`); off →
  the old slot/type read, byte-identical. Telemetry `spearSeen` /
  `spearPassed` on both legs. Sources 1–3 (stash / armory / craft)
  use `isStageable` = ammo test when on.
- Volley block and `villagerPocketAmmo` are already ammo-gated
  inline (speargate prereg audit table — re-verified on this base by
  reading both sites; spear yields no volley, pockets nothing).
  No change needed, none made.
- Canon: `docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md`
  read. Wave-4 bands damage 35–95, HP 850–1500, pierce 0.2–0.5.
  No canon doc covers launch gear-up, the ranged-slot rules, or the
  sim recorder — said here rather than inventing canon. The
  spear-in-ranged-slot rule is landed game behavior
  (sim-meleefirst-b); this arm changes no game code at all.

## The question

Bowopen baseline (band 105701–105708): 6/27 engaged meetings open
with a spear and no volley; 7 more hold nothing ranged; only 9/27
volley at all. Speargate proved the gate classifies spear-holders
correctly (54/54 passed) but staged 0 — sources empty. Bowcraft
proved the home source now serves spear-holders (confirm: attempts
54, bows 15 on band 107011–107018). **Does the gate, switched on
over the live source, serve spear-holders at departure — and does
that reach the fight as a volley?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by SPEARGATE.

- **Pool floor:** arm `spearSeen` ≥ 10 (spear-holder departures
  exist on this band; speargate's band: 54).
- **Gate replication:** arm `spearPassed / spearSeen == 1.0`;
  ctl `spearPassed == 0`; consistency
  `arm.alreadyHad ≈ ctl.alreadyHad − ctl.spearSeen` and
  `arm.noSource ≈ ctl.noSource + arm.spearSeen` (within ±3).
  (The landed gate must still take on this base/band.)
- **SERVED (the new question):** `arm.staged − ctl.staged ≥ 3`,
  where staged = fromStash + fromArmory + crafted. The gate's
  attributable yield: bows actually put into spear-holders' hands
  at departure. (Legs are seeded-identical, so the staged delta is
  attributable to the gate; speargate's pilot had fight numbers
  byte-identical between legs.)
- **Volley rate:** among wave-4+ pair-inclusive engaged meetings,
  volley-fire share arm − ctl ≥ +0.10 (bowopen baseline 9/27 =
  0.33; speargate band 4/8 = 0.50 — the bar is a rise over THIS
  band's ctl, not over either baseline).
- **Control identity:** ctl `spearPassed == 0` AND ctl spear
  behavior matches the speargate baseline (spear-holders record
  `alreadyHad`; ctl staged ≈ 0 unless a none-holder stages — any
  ctl staged bow is reported by source, never hidden).

**GO threshold:** pool floor met AND gate replication holds AND
served ≥ 3 AND volley-rate rise ≥ +0.10 AND all cost bars pass
(below). **A miss on any bar is NO-GO, never re-scored.** In
particular: gate-correct-but-served-0 is a NO-GO on the served
bar — it would mean the bowopen hook's second half is still unmet
at departure (the home source does not reach the departure), and
the evidence must say so, not re-score the gate as the judge.

**Cost bars (binding guardrails):** pair-inclusive kill share
arm ≥ ctl − 0.05; mean damage/round arm ≥ 0.9 × ctl; median
survival arm ≥ 0.8 × ctl; deaths per engaged wave-4+ meeting
(exposure-normalized) arm ≤ ctl × 1.10; community loss
arm ≤ ctl + 0.125; starvation arm ≤ ctl + 2 (totals AND
villager-only). Instrument errors 0 on all per-seed files.

## Secondary metrics (supporting, not binding)

- Volley-capable share at wave-4+ meeting entry (fighter's
  `rangedId` carries `weapon.ammo`) per leg; spear share at the
  fight (`rangedId` is a spear) per leg.
- Staging by source per leg (alreadyHad / fromStash / fromArmory /
  crafted / craftedFail / noSource + spearSeen / spearPassed).
- Mean volley damage, ranged-at-entry share, trio+ population
  (size ≥ 3, present, engaged) beside the primary, never
  substituted. Gate question among losses. Monster mix by
  outcome. Wall numbers every run: national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per leg.
  Table not instrumented by this driver — reported as null, never
  faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 107041, 107042, 107043,
  107044, 107045, 107046, 107047, 107048.** Freshness check
  (skill local_seed_band_freshness): `grep -rl "10704[1-8]"`
  over `evidence/ --include="*.md"` — **0 hits**;
  over `evidence/2026-11-19/*prereg*.md` +
  goal `hidden_files/sim-findings.md` +
  `hidden_files/convergence-tracker.md` +
  `hidden_files/lever-claims/*.json` — **0 hits** (checked
  2026-11-20 ~00:25 UTC, before this prereg was frozen).
  Neighbouring used bands avoided: 107001–107008 (bowsource),
  107011–107018 (bowcraft confirm), 107021–107028 (slingstone /
  arrowsupply). No 10703x/10704x band is named anywhere in
  evidence. Band 107041–107048 is fresh.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1` (the staging mechanism under test).
  BOWCRAFT is always-on in code on both legs (live ground, not a
  flag). **Ctl = same code, SPEARGATE unset; arm = same code,
  SPEARGATE=1.** The legs differ ONLY by env — no code change
  between legs, none on the branch at all. The driver asserts the
  flag matches the MODE label and each corpus file records
  `speargateOn` + `speargatePresent` + `bowopenOn` +
  `bowopenPresent` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/speargate-driver-a.js` REUSED
  unchanged (RUN=spearstage-a, OUTDIR=perseed-spearstage-a-{ctl,
  arm} — env-parametrized, no fork); analyzer
  `scripts/analyze-speargate-a.js` — CLI checked before use; if
  it hardcodes speargate paths, a thin clone
  `scripts/analyze-spearstage-a.js` carries the same judge plus
  the served + volley-rate bars, with `--selftest` covering the
  new bars. Per-seed JSONs under
  `evidence/2026-11-19/perseed-spearstage-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-speargate-panels-a.js` (already
  parametrized: `--before/--after/--out/--seeds`) + `node
  scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. The panel is the instrument,
  the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing spear-holder is SERVED,
so the fixture is the departure itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The proof test
(`scripts/test-spearstage-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a hunting spear in the ranged slot with a party (a geared
scholar + two companions, encounter-average gear from the bowopen
band) — and proves: (a) SPEARGATE off = the spear-holder records
`alreadyHad` with the spear (old behavior — the old-code control);
(b) SPEARGATE on + bow knowledge seeded (lv[bow] ≥ 1, as BOWCRAFT
seeing seeds it) + materials reachable = the same fighter is
passed to the sources and a departure craft ATTEMPTS (crafted or
craftedFail, never alreadyHad-with-spear); (c) SPEARGATE on with
NO bow knowledge = noSource (no conjuring — knowledge still
gates the craft); (d) a real bow in the ranged slot still records
alreadyHad on both legs; (e) flag unset = old behavior
byte-identical (the (a) control IS the byte-identity proof for
the gate). The existing landed proofs (`test-speargate-a.js`
31/31, `test-bowcraft-a.js` 59/59) are re-run on this base before
the pilot to confirm the landed pieces still pass. The pilot's
per-seed corpora carry the encounter averages (party size, gear,
abilities, ranged-at-entry) beside the verdict in the evidence
file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen band: 82 launched expedition meetings, 27
   pair-inclusive engaged per 8 seeds; speargate band: 54
   spear-holder departures, 8 pair-inclusive engaged per 8 seeds.
   The spearSeen floor (≥ 10) is sized to that known density.
2. **Pool sizing:** see (1). The served bar (≥ 3 staged) is
   sized against the bowcraft confirm (15 home bows / 8 seeds):
   if the departure craft fires for even a fifth of the
   spear-holders the home duty now seeds, the bar clears; if the
   departure sources are still empty, the bar fails loudly and
   honestly.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-spearstage-a.js`, GREEN before the pilot)
   proves the gate+source interaction on a live village (see the
   fixture section above). The analyzer `--selftest` covers the
   spear-gate judge shapes plus the new served / volley-rate
   bars (GO / NO-GO served-zero / NO-GO volley-flat /
   thin-pool).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the gate+source
  interaction is confirmed under live BOWCRAFT ground — the
  finding's staging consequence is fixed (the gate fix itself was
  already landed by speargate-a; this arm closes the interaction
  question). On NO-GO the finding stays open with the failing bar
  named.
