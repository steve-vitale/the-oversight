# sim-bowopen-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-bowopen-a · **Loop A run:** fleshout-20261119T0615Z
**Type:** LEVER — the ranged-opening half of the winning launched-party
shape (finding #2544 / fightcap-a §10 candidate (c)). **Frozen:**
2026-11-19 ~06:30 UTC, before any new sim.
**Branch:** `sim-bowopen-a` (worktree
`~/workspace/worktrees/sim-bowopen-a`). **Substrate:** the sense fix
HELD on branch `sim-launchparty-sense-a` (tip d01eaf0a5), merged into
this branch as its own commit (255682942); the merge conflicted only
in `src/js/villager-brain.js` on the partyTrios counter, where master's
newer version (winPlanStats() + PARTYSIZE4/PARTYQUADS) subsumes the
sense branch's older hunk — HEAD side kept whole, noted in code.
This run's own work goes in separate commits AFTER that merge. At
closeout the coordinator lands only this arm's commits, never the
substrate merge.
**Builds on:** `evidence/2026-11-18/sim-fightcap-a.md` (§§2, 5, 10)
and `evidence/2026-11-18/sim-fightcap-dmg-a.md` (§§5, 10, 12).

## The question

Launched parties almost never win wave-4 fights: 2 kills in 34
pair-inclusive engaged meetings across both fightcap-a bands (kill
share 0.059); the damage arm's band 0/13. Typical parties deal
~40–60 damage/round and need ~39 rounds to kill a ~1130-HP monster.
The ONLY two kills came from one party shape: Rage x2.5 on the
fighter + a bow opening (~50–60 damage) + all three members hitting
every round, ~111 damage/round, wins in 9–12 rounds. The Rage/carrier
half is Loop B's work (carriersetup-b NO-GO THIN-POOL; ragepreempt-b
DIAG in flight) — this arm does NOT touch the Rage/carrier mechanism,
the fieldBegin Rage branch, or anything in godpath.js's Rage path.
This arm tests ONLY the ranged-opening half: launched parties stage
a bow and arrows at launch gear-up so the party opens ranged.

## The mechanism (frozen, not a sim)

**What is built:** `Game.villagerStageBow(vid)` (new, `src/js/game.js`,
next to `villagerPocketAmmo`), called from `startExpedition`
(`src/js/villager-agency.js`) between `villagerGearUp(vid, true)` and
`villagerPocketAmmo(vid)` — i.e. at launch gear-up, after the sick
sit-out return, so a villager who stays home stages nothing. Every
expedition departure passes through it (holder + companions alike);
it is the departure site, not a fight site — no mid-fight staging
(the fieldFight acquire=false rule stands).

**Env gate:** `BOWOPEN=1` (off = byte-identical old behavior; guard
pattern `(typeof process !== 'undefined' && process.env &&
process.env.BOWOPEN === '1')`, as other game.js gates). Legs differ
ONLY by BOWOPEN.

**Staging order (honest sources, mirroring villagerGearUp /
villagerPocketAmmo — nothing conjured):**
0. Already holds a ranged weapon (equipped ranged, or a ranged
   weapon in the pack — gearUp already ran autoEquip) → no-op;
   pocketAmmo then arms it as today.
1. Own stashed ranged weapon → move to pack + autoEquip.
2. Communal armory deposited ranged weapon → borrow the best-bonus
   one, ledgered like gearUp's armory borrow, + autoEquip.
3. ONE craft attempt per departure for a bow from the EXISTING
   recipes (`bow`: wood 1 + vine 2; `crude_bow`: branch 1 + vine 1),
   bow first then crude_bow (the villagerWeaponCraftDay ladder
   order), using the SHARED `v.weaponCraft[vid]` knowledge record
   (seeded only by handling the weapon; L1 35% blind, L2 85%;
   blind success teaches — the PRACTICE rule, exactly as
   craft() / villagerPocketAmmo). Materials: own carried first,
   then the communal pile. No knowledge → no attempt; no materials
   → no attempt. A failed craft spends the materials (same rule as
   the existing departure ammo craft).
4. Nothing available → the villager goes without, as today
   (recorded as `noSource`).

**Then pocketAmmo runs as today** (already ordered after gear-up),
so a newly staged bow gets its arrows (own stash → communal pile →
one arrow-craft attempt, cap 5, volley cap 4 shots/fight).

**Why a bow moves more than the volley** (the mechanism math, from
code read before any sim): the field-fight strike formula folds the
ranged bonus into every melee strike — `wb = round((meleeBonus +
rangedBonus)/2)` (`fieldFights.js:641-643`, same for allies
`:1343-1346`). A bow (bonus 22) staged where no ranged weapon was
held lifts wb by ~+11, i.e. ~+11 damage per strike, every round,
for every striker — on top of the opening volley itself
(`fieldFights.js:951-1053`: 1–4 shots, hit chance 0.85−0.06×range,
each hit `lroll([4+wbR, 8+wbR])`, wbR = round(bonus/2); bow wbR 11
→ ~17/hit, ~3 shots at ~55% → expected volley ~25–35 damage; the
winning shape's opening was 51–63). Expected total lift per meeting:
volley ~30 + strike lift ~11 × ~2.5 strikes/round × ~5 rounds
≈ +165 — roughly 14% of a ~1200-HP monster. That is the size of
effect the GO bars below are sized to detect. If the staging never
fires (no bows, no knowledge, no materials), the pilot measures a
null and the mechanism section says so — it is not scored as a
capability result.

**Telemetry (from the field engine, never from 30-day snapshots —
fightcap-dmg-a §12 retired the snapshot proxy):** village state
`v.bowOpen` counters (staged / alreadyHad / fromStash / fromArmory
/ crafted / craftedOk / craftedFail / noSource) + per-vid last
staging; the driver records on every wave-4+ encounter row
`row.volley` (`rec.volley`: shots/hits/dmg, null when no ranged
kit) and `row.rangedId` / `row.ammoAtEntry` (fighter's ranged weapon
+ ammo at fight entry, pre-call read). Carrier-fire detection is
therefore direct: volley shots > 0 means the opening fired.

## Primary metric (BINDING, §14)

**Kill share on pair-inclusive engaged launched wave-4 meetings**
(the same population fightcap-a judged): v4encounters row with
origin `expedition`, wave ≥ 4, joined to its v4gates row (same
day+vid+mid, first match) with a non-empty planParty, restricted to
|planParty| ≥ 1 (full launched party size ≥ 2), launched party
PRESENT (corrected arrival, piecewise as fightcap-a), and ENGAGED
(rounds > 0; evades join nobody).

**Kill** = outcome `vKill` (party kills the monster). Win share
(vKill + mFlee) is reported beside it, never substituted.

**GO threshold:** arm kill share ≥ 0.25 **AND** arm
pair-inclusive mean damage/round (mDealt/rounds) ≥ 70.
The damage bar is sized from the mechanism math above: the typical
launched party deals ~40–60/round (fightcap fresh band vFlee 61.0,
vDie 39.7; dmg band ~44 blended); the winning shape dealt ~111.
70 sits ~40% above the typical rate and ~63% of the winning rate —
the lift the volley + fold-in should produce if staging fires.
**Cost bars (binding guardrails):** community loss (endReason
village-lost / village-dead / pop-zero) arm share ≤ ctl share +
0.125; starvation arm ≤ ctl + 2 (totals AND villager-only); median
survival arm ≥ 0.8 × ctl median. Instrument errors 0 on all
per-seed files.

**Verdict ladder (frozen):**
- Pool floor met (arm n ≥ 10) + kill share ≥ 0.25 + damage/round
  ≥ 70 + all cost bars pass → **GO** (the ranged opening turns
  launched parties into winners at the pilot bar).
- Pool floor met + kill share < 0.25 or damage/round < 70 or any
  cost bar fails → **NO-GO** (the opening alone does not close the
  gap; the mechanism section names how far it got).
- Pool floor missed (arm n < 10) → **DIAG-GO** iff the mechanism
  checks below show the opening fired on the available meetings
  AND the kill share + damage numbers are decisively below the
  bars on the powered reading (volley fired, kill share ≤ 0.10) —
  i.e. the decomposition answers the question despite the thin
  pool. Otherwise **NO-GO** (thin pool, inconclusive).

## Secondary metrics (supporting, not binding — except as the DIAG-GO path above)

- **Mechanism checks (explain the verdict, never re-score it):**
  staging rate per departure by source (alreadyHad / stash /
  armory / crafted / noSource); fraction of arm pair-inclusive
  engaged meetings with volley.shots > 0 (expect ≥ 0.50); mean
  volley damage per engaged meeting (expect ≥ 20 — the honest
  expected value of a 3-shot bow volley at ~55% hit chance; the
  winning shape's opening was 51–63); mean damage/round by
  outcome; volley drive-offs (mFlee at 1 round after volley damage).
- **Pair-inclusive decomposition** (fightcap-a §5 shape): per-outcome
  rounds, damage share (mDealt/mHpStart where present), damage
  taken, party size, min armorP, abilities/member, fighter damage
  share — per leg.
- **Trio+ population** (size ≥ 3, present, engaged): reported
  beside the primary, never substituted (fightcap-a: n=3; dmg-a:
  n=1 — expect thin again).
- **Gate question:** among LOSSES, how many had gate `avoid` vs
  `null`/`seek`. (Fightcap-a: 0 avoids among 28 arm losses
  combined — the gate measures size+gear, never damage.)
- **Monster mix by outcome;** wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- **Table:** not instrumented by this driver — reported as null,
  never faked.

## What this pilot does NOT judge

- The Rage/carrier half (Loop B's work — do not touch it here).
- The 4th seat (engine-blocked: `fieldFights.js:1230` slices
  allyVids to 2) — out of scope; the trio+ population is the
  engine's full expression.
- The rounds=0 "vKill" rows with mHpStart null and mDealt ~12–27
  (likely off-screen/environmental kill attributions) are excluded
  by the engaged filter (rounds > 0) and counted as fight wins
  nowhere.
- No 12–16 seed confirm in this run — pilot only; the coordinator
  decides the confirm from the pilot verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 105701, 105702, 105703, 105704,
  105705, 105706, 105707, 105708.** Freshness check (skill
  local_seed_band_freshness): `grep -rhoE "105[0-9]{3}"` over
  `evidence/*/sim-*-prereg.md` — named 105xxx seeds are 105001–
  105008, 105101, 105201–105208, 105301, 105401, 105501 (105301 /
  105401 / 105501 appear only in "verified CLEAR but not picked"
  lists — avoided anyway); `grep -rl "105701|105801|106101|106201"`
  over `evidence/ --include="*.md"` — 105701: **0 hits**, 105801:
  0, 106101: 0, 106201: 0 (105601: 2 hits — avoided); `grep -c
  "10570[1-8]"` over goal `hidden_files/convergence-tracker.md`,
  `lever-claims/*`, `sim-findings.md` — **0 hits**. Neighbouring
  used bands avoided: 104501–104508 (fightcap-a), 104601–104608
  (fightcap-dmg-a), 105201–105208 (partysize4-b). Contaminated bands
  named in preregs: 9700–9711, 9930–9941, 73601–73608, 74201–74208
  — none overlap. Band 105701–105708 is fresh.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `LAUNCHPARTY=1`. **Ctl = same code, BOWOPEN unset; arm = same
  code, BOWOPEN=1.** The legs differ ONLY by env — no code revert
  between legs. The driver asserts the flag matches the MODE label
  and each corpus file records `bowopenOn` + `launchpartyOn` +
  wiringSha + gameSha.
- **Instrument:** `scripts/bowopen-driver-a.js` (clone of
  `scripts/fightcap-dmg-driver-a.js` — the recorder is unchanged
  except the added volley/ranged-at-entry capture on the encounter
  row); analyzer `scripts/analyze-bowopen-a.js` (clone of
  `scripts/analyze-fightcap-a.js` + volley/mechanism section,
  `--selftest` incl. the pair-inclusive population and all judge
  shapes); per-seed JSONs under
  `evidence/2026-11-19/perseed-bowopen-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowopen-panels-a.js` (adapted copy
  of the fightcap panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched, so
the fixture is the encounter itself, staged by the competent policy:
a geared scholar fighting with a party, never a fresh un-geared solo
scholar. The pilot's per-seed corpora carry the encounter averages
(party size, gear, abilities, ranged-at-entry) beside the verdict in
the evidence file, so a later reader can see the fixture gap without
re-running the panel. The nearest measured point for the encounter
gear is the fightcap band (launched parties geared by the launch
gear-up, min armorP 17.7–28.3); the pilot does not re-derive gear —
the competent policy plays it, and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   fightcap-a fresh band: 45 arm / 29 ctl launched meetings per 8
   seeds; dmg-a band: 32/leg; the engaged pair-inclusive pool is
   22 arm / 4 ctl (fightcap) and 13/leg (dmg). The trio+ pool is
   thin (3 arm / 0 ctl; 1/leg) — the pool floor + DIAG-GO path
   above are sized to that known thinness.
2. **Pool sizing:** see (1). The pair-inclusive floor (n ≥ 10) is
   the powered population; the trio+ floor is reported, not judged.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-bowopen-a.js`, GREEN before the pilot) stages a
   bow on a bowless villager at departure from each honest source
   (stash / armory / craft, incl. the no-knowledge and
   no-materials no-ops), leaves a bow-holder untouched, seats the
   bow in the ranged slot beside the melee weapon (fold-in lift
   verified: wb 10 → 21 on a bonus-20 melee fighter), fires the
   volley in a staged field fight, and proves BOWOPEN off is
   byte-identical old behavior. The analyzer `--selftest` covers
   the join, the piecewise presence rule, the pair/trio shapes,
   evade/unjoined exclusions, volley aggregation, and all judge
   shapes incl. the DIAG-GO thin-pool path.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read for
this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". The decomposition's damage yardstick (~220
dmg/round vs the measured ~40–60) comes from that canon band, not
from invention. No canon doc covers the sim recorder, the villager
launch party, or launch gear-up — said here rather than inventing
canon. The launch mechanics are cited from code (`win-plan.js`,
`villager-agency.js` `startExpedition`, `villager-brain.js`,
`game.js` `villagerGearUp`/`villagerPocketAmmo`, `fieldFights.js`
volley + strike fold-in, `equipment.js` `autoEquip`), not from
canon. The bow itself is canon-adjacent: `src/data/items.json`
carries bow (bonus 22, range 5, ammo arrow) and crude_bow (18/5);
`src/data/recipes.json` carries both recipes; the volley engine and
the strike fold-in are landed game behavior, not new rules.
