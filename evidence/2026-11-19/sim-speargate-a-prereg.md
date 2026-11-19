# sim-speargate-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-speargate-a · **Loop A run:** fleshout-20261119T0915Z
**Type:** BUILD — finding #2590 (spear in the ranged slot blinds the
staging gate). **Frozen:** 2026-11-19 ~09:50 UTC, before any new sim.
**Branch:** `sim-speargate-a` (worktree
`~/workspace/worktrees/sim-speargate-a`). **Base:** master 7235e2102
(the bowopen evidence/tooling landing; the bowopen lever + sense
substrate are NOT on this base — see §0).
**Builds on:** `evidence/2026-11-19/sim-bowopen-a.md` (§§5, 10, 12)
and `evidence/2026-11-19/sim-bowopen-a-prereg.md`.

## §0. What is ported in, and why (frozen, not a sim)

This branch's base (master 7235e2102) contains the bowopen
evidence + instrument commits but NOT the two code pieces the gate
fix operates on:

1. **The sense substrate** — CORRECTION (2026-11-19 ~10:00 UTC,
   before any sim; the frozen bars below are unchanged): the
   prereg as first written said the old LAUNCHPARTY sense block
   would be ported from merge 255682942. On reading the current
   base that is WRONG and the port is NOT done: master already
   carries a NEWER sense implementation, `SENSEEXPED=1`
   (sim-senseexped-b, finding #2583, in `src/js/party-wiring.js`),
   which supersedes the old LAUNCHPARTY block — same effect (the
   launch party answers first) with a better membership rule
   (current expedition companions from `agencyState().exped`,
   not `winPlan[vid].party`, which a re-launch, an early return,
   or a death can rewrite mid-hunt; see the two DIAG arms
   sim-sensecotravel-b + sim-sense-guard-diag-a). Porting the old
   block alongside it would double-apply two launch rules, the
   older one with the diagnosed stale-membership flaw. So the
   substrate is the LANDED SENSEEXPED sense, run as
   `SENSEEXPED=1` on BOTH legs, and the driver asserts
   SENSEEXPED presence instead of LAUNCHPARTY. The bowopen pilot
   ran on the old sense; this pilot runs on the new one — the
   launch pool may differ slightly, but the legs differ ONLY by
   SPEARGATE, so the verdict is still judged within this band,
   and the bowopen numbers are context, never the judge.
2. **The staging mechanism** (commit 2b29076e7):
   `Game.villagerStageBow` + its `startExpedition` call site +
   `scripts/test-bowopen-a.js` (36/36). Ported as its own commit
   (the prereg file in that commit is already on this base
   verbatim, so the port carries src + test only). The bowopen
   NO-GO on staging stands — the mechanism stages 0 bows on
   empty sources — but the GATE fix lives inside it, and the
   bowopen evidence §11 names this arm as the gate port arm that
   reuses the mechanism + proof test.

Both ports are byte-identical to their sources (verified by diff
before the fix commit). The fix itself goes in a separate commit
AFTER the ports, so the coordinator can see exactly what is ported
vs what is new. **Landing note:** the ports are HELD-origin code;
the coordinator decides landing at closeout — this arm's own
verdict covers the gate fix only, never the staging mechanism or
the sense fix on their own.

## The question

Finding #2590 (bowopen §5, source 3): a spear (melee type, range 2)
sits in the ranged slot when its carrier holds no real ranged
weapon, so `rangedWeaponOf` returns it and every ranged check
treats the fighter as ranged — but the volley needs ammo, which a
spear never has. 6/27 engaged meetings open with a spear and no
volley; 7 more hold nothing ranged. Any ranged-gated mechanism must
check `weapon.ammo`, not the slot. (Related: #2410,
sim-ammocensus-a — 58 spear-holders at wave-4 meetings.)

## The audit (frozen, done before any sim — read before judging)

Every `rangedWeaponOf` call site + every other slot-based ranged
test in `src/js/`, read in full:

| Site | What it gates | Spear behavior TODAY | Fix? |
|---|---|---|---|
| `game.js` `villagerStageBow` step 0 | launch staging: "already holds a ranged weapon" → no-op | spear → `alreadyHad`, staging never runs | **YES — the live bug** |
| `fieldFights.js:983` volley block | opening volley | already ammo-gated inline (`if (_w && _ammoId)`); spear yields no volley, no line, `rec.volley` null | NO — already correct |
| `game.js:7808` `villagerPocketAmmo` | departure ammo pocketing | already ammo-gated inline (`if (!ammoId) return out`); spear pockets nothing | NO — already correct |
| `villager-build.js:1473` `villagerAmmoCraftDay` | home ammo crafting | already ammo-gated inline + comment ("Spears carry no ammo id and fall out") | NO — already correct |
| `fieldFights.js:1130` contact-finish | contact-finish weapon kind | already handles the spear as its own kind (`kind: 'spear'`) | NO — already correct |
| `standing.js:317` ARMED bar + `villager-objectives.js:891` `objVillagerArmed` | wave-readiness "weapon to hand" | spear counts as ARMED — **correct**: the fighter holds a spear, a weapon to hand. Gating this on ammo would wrongly count spear-fighters unarmed and could hold wave unlocks | NO — deliberately not a ranged gate |
| `fieldFights.js:641-643` strike fold-in (`weaponBonusOf(...,'ranged')`) | melee strike damage `wb = round((melee+ranged)/2)` | spear bonus folds into strikes — **deliberate** (sim-meleefirst-b: "without [a real ranged weapon] the spear keeps the ranged slot and the old fold-in") | NO — a melee-damage rule, not a ranged gate |
| `equipment.js` `isRangedWeapon` / `slotForItem` / `autoEquip` + `app.js:15522`, `contests.js:4400`, `debug-scenarios.js:57` | slot assignment | assigns the spear to the ranged slot by range>1 — the slot rule itself, not a ranged gate | NO — assignment, not gating |

**Consequence for the primary (read this before judging the
verdict):** the volley and pocketAmmo are ALREADY ammo-gated, so
they cannot move under this fix; only the staging gate
misclassifies. Picking "volley fires per engaged meeting" as the
primary with a GO bar would be a rigged NO-GO — the fix cannot
create bows or arrows, and the bowopen pilot already proved the
staging sources are empty (0 staged in 400 departures). The
honest primary for a CORRECTNESS fix is the mechanism itself
(the gate classifying spear-holders correctly) plus
no-regression guardrails on the fight numbers. Volley share, kill
share and damage/round are secondaries + guardrails, reported,
never re-scored as the primary. The coordinator's claim wording
("measure volley fires + kill share + dmg/round") is answered by
measuring all three — as guardrails — with the mechanism as the
judge. If the coordinator wants the volley-share bar as the judge
instead, that is a different arm (gate + SOURCE), not this one.

## The mechanism (frozen, not a sim)

**What is built:** the ammo gate inside `villagerStageBow` step 0,
env-gated `SPEARGATE=1` (off = byte-identical old behavior):

- New `equipment.js` helper `volleyWeaponOf(v, itemDefs)`: the
  equipped ranged-slot entry, returned ONLY when its def carries
  `weapon.ammo` (a volley-capable weapon). Pure read, ungated;
  lives next to `rangedWeaponOf` / `isRealRangedWeapon` so the next
  ranged gate uses it instead of re-deriving the check inline.
  On current data all 8 type-`ranged` weapons carry ammo and no
  type-`melee` weapon does (verified from `src/data/items.json`:
  sling/stone, crude_bow/bow/starfall_bow/apex_bow/arrow,
  crossbow/bolt, phase_sling/stone, searcaster/fusion_cell;
  spears hunting/fire-hardened/shard/godslayer are melee, range 2,
  no ammo) — so type-`ranged` and ammo-bearing coincide today,
  and the gate checks ammo anyway, as the finding requires.
- `villagerStageBow` step 0, SPEARGATE on: the equipped read uses
  `volleyWeaponOf` (a spear in the ranged slot reads as NO ranged
  weapon) and the pack scan uses the same ammo test, so a
  spear-holder proceeds to sources (stash / armory / craft) instead
  of no-op'ing as `alreadyHad`. A spear-holder who ALSO packs a
  real bow still records `alreadyHad` — correctly, via the bow.
- Telemetry: two new counters in `v.bowOpen` — `spearSeen`
  (bumped whenever the equipped ranged-slot entry is a non-ammo
  weapon, EITHER leg — a pure observation) and `spearPassed`
  (bumped when SPEARGATE is on and the gate passes the spear over
  to the sources). The driver also exports the full
  `bowOpenByVid` map (bowopen §12 instrumentation gap: per-vid
  `{day, source, itemId}`), so alreadyHad-with-spear can be
  cross-checked by item id.
- **No other site changes.** The volley, pocketAmmo, ammo-craft,
  contact-finish, ARMED bar, fold-in and slot assignment are
  audited-and-left-alone per the table above, each with its reason.
- **#2593 (optional, separate commit):** the field-fight "no
  arrows" line (`fieldFights.js:1012`) names the weapon's actual
  ammo — arrows / crossbow bolts / stones / fusion cells, from the
  ammo item's own data name, lowercased + plural. Only that one
  line; the "nocks an arrow" / "the arrow buries itself" lines are
  out of scope and stay (noted as a finding if the fix lands).

**Env gates:** `SPEARGATE=1` gates the fix. `BOWOPEN=1` runs on
BOTH legs (the staging mechanism under test). Legs differ ONLY by
SPEARGATE — no code revert between legs. The driver asserts the
flag matches the MODE label and each corpus file records
`speargateOn` + `speargatePresent` + `bowopenOn` +
`bowopenPresent` + `wiringSha` + `gameSha`.

**Expected effect (frozen):** spear-holder departures move from
`alreadyHad` (ctl) to source attempts (arm: mostly `noSource`,
since the bowopen pilot proved the sources empty — 0 stashed bows,
0 armory bows, 0 bow knowledge in 400 departures). Staged stays 0
both legs (no conjuring). Volley share, kill share and
damage/round are UNCHANGED (the fix creates no bows, no arrows,
no volley) — that is the no-regression expectation, not a failure.
What changes is the CLASSIFICATION: on the arm leg, zero
spear-holders are recorded `alreadyHad`-with-a-spear. That is what
unblocks the follow-up source arm: its staging will actually reach
the 6/27 spear-holding fighters instead of no-op'ing on them.

## Primary metric (BINDING, §14)

**Spear-gate classification on staging departures** (the
mechanism, from live state at run end — never snapshots):

- `spearSeen` (arm) ≥ 10 — the pool floor: spear-holder
  departures exist on this band. (Bowopen's band: 6 spear-holders
  among 27 engaged meetings; departures run ~400/8 seeds, so the
  departure-level count should clear 10 comfortably.)
- `spearPassed / spearSeen == 1.0` on the arm leg — every
  spear-holder the gate saw was passed over to the sources (zero
  alreadyHad-with-a-spear).
- `spearPassed == 0` on the ctl leg — the old gate never passes a
  spear (control sanity: the flag is doing the work).
- Consistency: `arm.alreadyHad ≈ ctl.alreadyHad − ctl.spearSeen`
  and `arm.noSource ≈ ctl.noSource + arm.spearSeen` (within ±3,
  allowing for spear-holders who pack a real bow and record
  alreadyHad correctly on both legs).
- `staged == 0` both legs (`fromStash + fromArmory + crafted` —
  no conjuring: the gate fix must not invent bows).

**GO threshold:** pool floor met AND arm pass rate 1.0 AND ctl
pass 0 AND consistency within ±3 AND staged 0 both legs AND all
cost bars pass (below). **A miss on any of these is NO-GO, never
re-scored.**

**Cost bars (binding guardrails — the fix must not make fights
worse):** pair-inclusive kill share arm ≥ ctl − 0.05; mean
damage/round arm ≥ 0.9 × ctl; community loss arm ≤ ctl + 0.125;
starvation arm ≤ ctl + 2 (totals AND villager-only); median
survival arm ≥ 0.8 × ctl median. Instrument errors 0 on all
per-seed files.

**Verdict ladder (frozen):**
- Pool floor met + pass rate 1.0 + ctl pass 0 + consistency +
  staged 0 + all cost bars pass → **GO** (the gate now classifies
  spear-holders correctly and nothing regressed).
- Pool floor met + any other bar fails → **NO-GO** (the gate did
  not take, or it regressed fights — the mechanism section names
  which).
- Pool floor missed (arm spearSeen < 10) → **NO-GO** (thin pool,
  inconclusive — the band had too few spear-holders to judge the
  gate; no DIAG path: a spearless band cannot answer a
  spear question).

## Secondary metrics (supporting, not binding)

- **Fight numbers (guardrail context):** pair-inclusive kill
  share, win share, mean damage/round, volley-fire share, mean
  volley damage, ranged-at-entry share — per leg, on the bowopen
  population (origin expedition, wave ≥ 4, joined gate row,
  non-empty planParty, pair-inclusive, party present, engaged).
  Expected: identical or within noise of ctl (bowopen: kill share
  0.037, damage/round 42.4, volley 0.33).
- **Staging by source** per leg (alreadyHad / fromStash /
  fromArmory / crafted / craftedFail / noSource + spearSeen /
  spearPassed) — the classification shift, in full.
- **Spear share at the fight:** engaged meetings whose fighter's
  `rangedId` is a spear (bowopen: 6/27) — the population the gate
  fix reaches.
- **Trio+ population** (size ≥ 3, present, engaged): reported
  beside the primary, never substituted.
- **Gate question:** among LOSSES, how many had gate `avoid` vs
  `null`/`seek`.
- **Monster mix by outcome;** wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- **Table:** not instrumented by this driver — reported as null,
  never faked.
- **#2593 check (if landed):** the "no arrows" line in the
  persisted encounter logs names the correct ammo for the weapon
  held (searcaster → fusion cells, crossbow → bolts, sling →
  stones) — read from the logs, not asserted from the code.

## What this pilot does NOT judge

- The bow SOURCE (bowopen §5 source 1–2: 0 stashed/armory bows,
  bow knowledge unreachable for the armed) — that is a separate,
  still-open finding; this arm fixes the GATE only, and the pilot
  expects staged 0. Do NOT land another departure-only tweak for
  the source question on the back of this verdict.
- The Rage/carrier half (Loop B's work — do not touch it here).
- The 4th seat (engine-blocked) — out of scope.
- The rounds=0 "vKill" rows with mHpStart null and mDealt ~12–27
  are excluded by the engaged filter (rounds > 0) and counted as
  fight wins nowhere.
- No 12–16 seed confirm in this run — pilot only; the coordinator
  decides the confirm from the pilot verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowopen band, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 105901, 105902, 105903,
  105904, 105905, 105906, 105907, 105908.** Freshness check
  (skill local_seed_band_freshness): `grep -rhoE "105[0-9]{3}"`
  over `evidence/*/sim-*-prereg.md` — named 105xxx seeds are
  105001–105008, 105101, 105201–105208, 105301, 105401, 105501,
  105601, 105701–105708 (bowopen, AVOIDED), 105801 (named in the
  bowopen prereg's clear-but-not-picked list — AVOIDED per the
  skill's name-alone-reserves rule); `grep -rl "10590[1-8]"`
  over `evidence/ --include="*.md"` — **0 hits**;
  `grep -rl "10590[1-8]"` over `evidence/*/sim-*-prereg.md` —
  **0 hits**; `grep -c "10590[1-8]"` over goal
  `hidden_files/convergence-tracker.md` — **0**,
  `hidden_files/sim-findings.md` — **0**; `grep -rl "10590[1-8]"`
  over `hidden_files/lever-claims/*` — **0 hits**. Neighbouring
  used bands avoided: 105701–105708 (bowopen), 106001–106008
  (rage-setup-a), 106101–106108 (journey-scale r95/r96),
  106201 (named in bowopen prereg, avoided). Contaminated bands
  named in preregs: 9700–9711, 9930–9941, 73601–73608,
  74201–74208 — none overlap. Band 105901–105908 is fresh.
  (Checked 2026-11-19 ~09:45 UTC, before this prereg was frozen.)
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`. **Ctl = same code, SPEARGATE
  unset; arm = same code, SPEARGATE=1.** The legs differ ONLY by
  env — no code revert between legs. The driver asserts the flag
  matches the MODE label and each corpus file records
  `speargateOn` + `speargatePresent` + `bowopenOn` +
  `bowopenPresent` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/speargate-driver-a.js` (clone of
  `scripts/bowopen-driver-a.js` — the recorder is unchanged
  except BOWOPEN=1 required on both legs, SENSEEXPED=1 as the
  sense substrate (see §0 correction), the SPEARGATE flag
  assertions, and the `bowOpenByVid` export); analyzer
  `scripts/analyze-speargate-a.js` (clone of
  `scripts/analyze-bowopen-a.js` + the spear-gate judge:
  spearSeen/spearPassed/consistency/staged bars + the
  no-regression cost bars; `--selftest` incl. the
  pair-inclusive population and all judge shapes); per-seed JSONs
  under `evidence/2026-11-19/perseed-speargate-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-speargate-panels-a.js` (adapted
  copy of the bowopen panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether the staging gate CLASSIFIES a
departing fighter correctly, so the fixture is the departure
itself, staged by the competent policy: a geared scholar fighting
with a party, never a fresh un-geared solo scholar. The proof
test (`scripts/test-speargate-a.js`, GREEN before the pilot)
runs on a LIVE loaded village with real roster/gear — a geared
fighter holding a hunting spear in the ranged slot with a party
(a geared scholar + two companions, encounter-average gear from
the bowopen band: min armorP 17.7–28.3, launched-party gear-up)
— and proves: (a) SPEARGATE off = spear counts as ranged
(alreadyHad, old behavior — the old-code-fails control); (b)
SPEARGATE on = the same fighter is passed over to the sources
(spearPassed bumps, no alreadyHad-with-spear); (c) a real bow in
the ranged slot still records alreadyHad on both legs; (d) a
bow in the pack still records alreadyHad on both legs; (e) the
`volleyWeaponOf` helper returns null for every spear and the
correct def for every ammo-bearing weapon in data; (f) the
fold-in and the ARMED bar are unchanged for a spear-holder
(audited-and-left-alone sites, proved not moved). The pilot's
per-seed corpora carry the encounter averages (party size, gear,
abilities, ranged-at-entry) beside the verdict in the evidence
file, so a later reader can see the fixture gap without
re-running the panel.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen fresh band: 82 launched expedition meetings, 27
   pair-inclusive engaged per 8 seeds, on the sense substrate
   this branch now ports. The spear population at departure is
   ~400 departures/8 seeds with 6 spear-holders among 27 engaged
   meetings — the pool floor (arm spearSeen ≥ 10) is sized to
   that known density.
2. **Pool sizing:** see (1). The spearSeen floor is the powered
   population; the pair-inclusive fight numbers are guardrails,
   not the judge.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-speargate-a.js`, GREEN before the pilot) proves
   the gate on a live village (see the fixture section above),
   with the old-code-fails control (flag off = spear counts as
   ranged). The analyzer `--selftest` covers the join, the
   piecewise presence rule, the pair/trio shapes, evade/unjoined
   exclusions, volley aggregation, the spear-gate judge shapes
   (GO / NO-GO pass-rate / NO-GO consistency / NO-GO staged /
   thin-pool), and the cost bars.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". No canon doc covers the sim recorder, the
villager launch party, launch gear-up, or the ranged-slot rules —
said here rather than inventing canon. The launch mechanics are
cited from code (`win-plan.js`, `villager-agency.js`
`startExpedition`, `villager-brain.js`, `game.js`
`villagerGearUp`/`villagerPocketAmmo`/`villagerStageBow`,
`fieldFights.js` volley + strike fold-in, `equipment.js`
`autoEquip`/`rangedWeaponOf`/`isRealRangedWeapon`), not from
canon. The spear-in-ranged-slot rule is landed game behavior
(sim-meleefirst-b: a spear keeps the ranged slot + the old fold-in
when its carrier holds no real ranged weapon) — this arm does not
change it; it changes only what the STAGING GATE concludes from
it. The ammo names for #2593 come from `src/data/items.json`
(arrow → Arrow, bolt → Crossbow bolt, stone → Stone, fusion_cell
→ Fusion cell).
