# sim-spearlead-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-spearlead-a · **Loop A run:** fleshout-20261124T2315Z
**Type:** DIAG (instruments + evidence only — no game-code fix lands)
**Frozen:** 2026-11-25 ~01:00 UTC, before any judged sim.
**Branch:** `sim-spearlead-a` (worktree
`~/workspace/worktrees/sim-spearlead-a`). **Base:** worktree HEAD
b48b195db (one behind current master tip 519dbc69b, Loop B's
fleeguard-b — NOT this arm's; the coordinator rebases at landing).
**Builds on:** `evidence/2026-11-24/sim-spearopen-a.md` (§§3, 8, 10)
+ prereg. Finding #2544 (fight capability: damage output — the
spear-lead half). The thrown-spear opening itself is Steve's design
call; this arm is diagnosis only and builds NO volley branch.

## §0. The question, in plain words

The gate passes every spear departure on to the sources — 42 seen,
42 passed, ratio 1.000 — and yet no spear carrier ever led an
expedition wave-4 fight (0 of 10 expedition leads on the spearopen
band). Where do the 42 gate-passed spear departures GO? Do they
depart at all, do they reach wave-4 monsters, do they arrive as
companions instead of leads, or does the gate itself convert them
into bow carriers before they leave?

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md`. **No canon doc covers spears as thrown
weapons** — said here rather than inventing one, as spearopen-a
already records. A spear is a human weapon (CANON.md human-skills
lane), never an alien ability.

**What already exists (the ground this diagnostic stands on):**

- `villagerStageBow` (`src/js/game.js`, ~7842) runs inside
  `startExpedition` (`src/js/villager-agency.js`, ~524) — AFTER
  the companion-guard, gear-up, heal-check, sick, and range gates,
  BEFORE `villagerPocketAmmo`, and `st.exped[vid]` is set
  unconditionally afterwards. **A spearSeen bump therefore means
  the carrier actually departed** (hypothesis (a) is answered at
  the code level; the new `allStarts` ledger verifies it live).
  Its ONLY caller is `startExpedition`, and every departure route
  flows through it: autonomous (`villager-agency.js:453`), brain
  party_launch (`villager-brain.js:1350/1385/1409/1432/1448`),
  win-plan launchParty (`win-plan.js:1319/1345/1422/1441/1462`).
  So spearSeen counts ALL expedition departures by spear carriers
  — autonomous and win-plan alike.
- Staging for a spear carrier, in order: the slot read
  (`rangedWeaponOf`) finds the spear (melee, range 2, no ammo) and
  bumps `spearSeen` (and `spearPassed` with SPEARGATE=1); the gate
  read (`volleyWeaponOf`, SPEARGATE on) returns null for the spear,
  so the carrier passes on to the sources — a pack-carried real
  ranged weapon (`alreadyHad`), own stash (`fromStash`), communal
  armory (`fromArmory`), one craft attempt (`crafted` /
  `craftedFail`) — else `noSource`. **A source hit autoEquips a
  real ranged weapon: the carrier departs as a bow carrier, not a
  spear carrier.** That conversion is a live hypothesis this arm
  measures (bucket `converted-at-staging`). With `noSource` the
  spear stays in the ranged slot and the carrier departs with it.
- `bowOpenByVid` is a LAST-write map keyed by vid (overwritten on
  every staging call — seed 110604 has 46 staging calls but 5 map
  entries). It cannot join a departure to its outcome, and it
  never records the pre-staging slot weapon. The spearopen corpus
  therefore cannot answer this question — the per-call
  `spearDeparts` ledger is the new instrument, not a re-read.
- `expeditionMonster` (`src/js/villager-agency.js`, ~686) picks
  `m = pick(pool)` from `monsterWavePool()` — a RANDOM draw from
  the standing-gated pool, NOT the plan target. A spear expedition
  CAN meet a wave-4 monster on any draw once wave 4 is unlocked;
  the plan target sets the tile and duration, not the monster.
  `winPlanFightGate` may `avoid` (outmatched → no fight, no
  fieldFight row — the gate-avoid bucket). Otherwise
  `fieldFight(vid, ...)` runs with vid = the expedition HOLDER
  (`villager-agency.js:916`), allies joining via `allyVids` — so
  an expedition fight's lead IS the holder, and the lead
  attribution is honest: a spear carrier present as a companion
  shows in `allyKit`, never as the row's vid.
- The spearopen driver records wave-4+ fights only
  (`v4encounters`). Lower-wave expedition meetings are unrecorded
  there — the new `expFights` ledger (every expedition-origin
  fight, any wave) closes that gap.

**Desk diagnosis from the spearopen corpora (frozen numbers,
recomputed from `evidence/2026-11-24/perseed-spearopen-a-arm/`,
seed 110604 — the 23-spearSeen seed):** 46 staging calls
(alreadyHad 8, noSource 34, crafted 1, craftedFail 3); 26
`v4departs` rows; 3 expedition-origin wave-4 encounters, 0 spear
leads. The corpus does not say whether the 23 departed as spear
carriers, what they met below wave 4, or whether any returned
without a meeting. **Pre-registered expectation:** the ledger will
show most spear departures either converted at staging (a source
yielded a bow) or on autonomous expeditions that never draw a
wave-4 monster — with the gate-avoid and companion buckets small.
A spear departure leading a wave-4 expedition fight with a spear
in hand would overturn the spearopen zero and is the falsifier.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm pair; there is no lever to compare).
Population: ALL spear departures — every `spearDeparts` ledger
row (a staging call whose pre-staging slot weapon is a spear, read
from the live def: melee, range > 1, no `weapon.ammo`).

Terminal buckets (each departure assigned to EXACTLY ONE, in this
priority order — the first matching bucket wins):

1. `lead-w4-with-spear` — the departure's vid was the lead (row
   vid) of an expedition-origin wave-4+ fight with a spear in the
   ranged slot at entry. THE FALSIFIER — expect 0.
2. `companion-w4` — the vid appears in `allyKit` with a spear in
   an expedition-origin wave-4+ fight (never lead). Met wave 4, as
   a companion.
3. `gate-avoid-w4` — a `v4gates` row for this vid on/after the
   depart day with result `avoid` (met wave 4, gate said go back),
   and no wave-4 expedition fight as lead/companion after it.
4. `converted-at-staging` — the post-staging ranged weapon is
   ammo-capable (bow / crossbow / sling / searcaster by live def):
   departed as a ranged carrier, not a spear carrier.
5. `died-away` — died while away before any wave-4 meeting (lead,
   companion, or gate-avoid).
6. `plan-never-reached` — departed with a wave-4 plan
   (`planNeedWave` ≥ 4 or plan target in the wave-4 set) and
   returned home (or still away at end) having met no wave-4
   monster on expedition.
7. `autonomous-no-w4` — departed with no wave-4 plan and met no
   wave-4 monster on expedition (met lower waves, or nothing).
8. `still-away-at-end` — still away/on-expedition at run end, no
   wave-4 meeting yet (met counts so far recorded on the row).
9. `unattributed` — none of the above. Counted openly; the
   residual.

Cross-tabs (secondary, not binding): converted × later wave-4
lead (any weapon); planW4 × any wave-4 meeting; staging source ×
converted.

- **Pool floor:** spear departures (ledger rows) ≥ 10.
- **Primary metric:** classification completeness — departures in
  buckets 1–8 / all spear departures.
- **Zero-lead reconciliation (binding):**
  `lead-w4-with-spear` == 0 (reproducing spearopen's zero) AND
  the bucket counts sum to the total departures (the ledger is
  closed: no spear departure is missing from the story).
- **GO threshold:** pool floor met AND completeness ≥ 0.90 AND
  reconciliation holds AND instrument errors 0.
- **Instrument errors:** 0 on all per-seed files.

**Verdict:** DIAG-GO when all four bars pass (the question is
answered with a complete ledger — the dominant bucket names the
mechanism; if no bucket holds ≥ 0.50, the top two are named with
their combined share and the verdict still stands, because the
ledger is complete). DIAG-NO-GO kind THIN-POOL when the pool
floor misses; DIAG-NO-GO kind ATTRIBUTION when completeness
misses; DIAG-NO-GO kind LEAD-FOUND when a spear departure DOES
lead a wave-4 expedition fight with a spear (the spearopen zero
does not replicate — a different question, named with the count);
DIAG-NO-GO kind INSTRUMENT when errors > 0. A miss is NO-GO,
never re-scored against a friendlier metric mid-run.

**Staging sniff test (pilot gate):** the analyzer must show the
spear departure population is real on this band (ledger rows > 0
and the ledger count reconciles with the game-maintained
`spearSeen` counter per seed — a mismatch is reported as a
diagnostic, not silently pooled) before the verdict is read. If
the band carries no spear departure at all, the verdict is
DIAG-NO-GO THIN-POOL with the empty pool as the finding.

## §3. Secondary metrics (supporting, not binding)

- Staging conversion: converted / departures, by staging source
  (alreadyHad-pack-bow / fromStash / fromArmory / crafted /
  craftedFail / noSource — the last two leave the spear in hand).
- Expedition fight wave distribution for spear departures while
  away (expFights by wave: what did they actually meet?).
- Spear departures by plan (wave-4 plan vs autonomous) and by
  depart result (launch/hold from the `v4departs` + `allStarts`
  join).
- Gate-avoid counts and companion counts (buckets 2–3, per seed).
- Gate replication: `spearSeen` / `spearPassed` per seed and
  pooled, plus the ledger-vs-counter reconciliation per seed.
- Per-seed bucket tables (the 42-analog departures, seed by seed).
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares. Table not
  instrumented by this driver — reported as null, never faked.
- Sense-testing: 2–3 full transcripts where a spear departure's
  expedition meets a wave-4 monster (or the nearest thing: a spear
  carrier's expedition fight log), read in full — does the
  departure story read sensibly (a spear carrier walking out, the
  gate handing them a bow, a companion arriving with a spear)?
  SENSE-TESTING LAW: judge meaning, not counts.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as spearopen / ammosupply
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds (fresh 8-seed pilot band): 110711, 110712, 110713,
  110714, 110715, 110716, 110717, 110718.** Freshness check
  (skill local_seed_band_freshness): coordinator-verified FRESH
  with ripgrep — no prereg or evidence mentions (earlier hits were
  pantry-number/timestamp false positives). Neighbouring used
  bands avoided: 110501–110508 (aidammo), 110601–110608
  (spearopen), 109501–109508 (basedmg-b).
- **Policies:** competent verbatim. **Substrate (single leg):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` — the spearopen
  pilot's substrate, so numbers compare. No BOWOPEN-off leg: the
  gate counters and staging only exist when staging runs, and the
  question is about departures under the fixed gate ground, not
  about the gate itself.
- **Instrument:** `scripts/spearlead-driver-a.js` (clone of
  `scripts/spearopen-driver-a.js` + the five additions below;
  RUN=spearlead-a, OUTDIR
  `evidence/2026-11-24/perseed-spearlead-a-arm`). Analyzer
  `scripts/analyze-spearlead-a.js` (new; reuses the spearopen
  analyzer's `weaponClass` / `ammoCapable` / `loadDefs` via
  require — one definition of the weapon taxonomy; `spearStats` +
  `judgeSpear` + bucket classification + `--selftest` green before
  the pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-spearlead-a-arm/`.
  - (1) `spearDeparts` ledger: wrap `Game.villagerStageBow` —
    EVERY staging call, flag `isSpear`; pre-staging slot ranged
    id, staging source / staged item id / staged flag, post-staging
    ranged id + ammo, plan stage / target / needWave / party at
    depart time. Pure reads + driver-local writes; the original
    runs exactly once, untouched.
  - (2) `allStarts`: extend the `startExpedition` wrap to record
    EVERY call (day, vid, directed, target, stage, expedAfter) —
    the empirical close of "did they depart".
  - (3) `v4departs` rows (both wraps): add `holderRangedId` /
    `holderAmmo` / `partyRanged` (post-call pure reads).
  - (4) `expFights`: every expedition-origin `fieldFight`, ANY
    wave (light rows: day, vid, mid, wave, outcome, rounds,
    rangedId, allyVids, allySpearVids).
  - (5) `spearTrack`: daily lifecycle rows for open spear
    departures (alive / away / exped / node / met counts) +
    close-out rows (`returned` / `died` / `still-away-at-end` /
    `superseded` when a vid re-departs while an earlier departure
    is still open — counted openly, never double-counted).
- **§15 panel:** NOT APPLICABLE — single-leg diagnostic, no
  before/after pair to compare. The balanced panel compares two
  legs; there is no second leg here. Said here rather than
  fabricating a compare. The frozen bars (§2) are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot earns one;
  a DIAG arm earns a confirm only if the pool is thin but the
  ledger is decisive — the coordinator decides from the pilot
  verdict.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what a departing villager carries out of the
village, so the fixture is the departure itself, staged by the
competent policy: a geared scholar fighting with a party, never a
fresh un-geared solo scholar. The proof test
(`scripts/test-spearlead-a.js`, GREEN before the pilot) runs live
on a loaded village — a spear departure row recorded with
pre/post-staging ranged ids (noSource leaves the spear in hand; a
staged bow converts the carrier), depart rows carrying
holderRangedId, a lower-wave expedition fight landing in
expFights, and the analyzer classifying fixture departures into
each bucket — plus the spearopen proof chain it extends (spear
volley null + silent; bow volley fires + ammo spent; dry bow
blocked + "no arrows"). The pilot's per-seed corpora carry the
encounter averages beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   spearopen band: 133 wave-4+ encounters per 8 seeds, 10 of them
   expedition-origin; 42 spear departures. The pool floor (≥ 10
   spear departures) is sized to that known density.
2. **Pool sizing:** see (1). The completeness bar (≥ 0.90) is set
   against the spearopen corpora, where every departure is
   joinable in principle (departure vid + day appear in
   `v4departs` / `bowOpenByVid` / `v4encounters`); the residual
   unattributed rate should be ~0. If live play shows a new
   unattributed class, the bar fails honestly and the class is the
   finding.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-spearlead-a.js`, GREEN before the pilot) proves
   the measurement chain on live departures (see §5). The analyzer
   `--selftest` covers the bucket classification (all nine buckets
   + priority order + cross-tabs + ledger/counter reconciliation)
   and the judge shapes (DIAG-GO, THIN-POOL, ATTRIBUTION,
   LEAD-FOUND, INSTRUMENT).

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4: The
Mirror Draft, standing ≥ 100; damage 35–95, HP 850–1500, pierce
0.2–0.5; wave 5: standing ≥ 200 AND wave-4 faced), and
`docs/BALANCING.md` (ranged opening volleys: shots = min(ammo,
clamp(1 + floor(range / monster speed), 1, 4)), each shot spends 1
real ammo; empty quiver → narrated "no arrows") read before the
run. **No canon doc covers spears as thrown weapons** — said here
rather than inventing canon, as the prereg already records. A
spear is a human weapon (CANON.md human-skills lane), never an
alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2544: claimed by this arm for its spear-lead half; on
  DIAG-GO the spear-lead question is answered with a complete
  ledger — where the 42-analog departures go, bucket by bucket —
  and the next arm is named from that proof (a thrown-weapon
  opening remains a design question for Steve, not a silent code
  tweak). On DIAG-NO-GO the finding stays open with the failing
  bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for the
  clear. The flap was ACTIVE at prereg-freeze time (two consecutive
  probe failures ~01:00 UTC, 2026-11-25) — the prereg file is
  written and committed on the first clear window, before any
  judged sim; the freeze timestamp above is the freeze, the commit
  timestamp is the commit, and the two are recorded separately.
