# sim-bowopen-recheck-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-bowopen-recheck-a · **Loop A run:** fleshout-20261124T1515Z
**Type:** RE-MEASURE — finding #2544 (fight capability: damage output),
the ranged-opening half of the winning launched-party shape.
**Frozen:** 2026-11-24 ~11:00 UTC, before any judged sim.
**Branch:** `sim-bowopen-recheck-a` (worktree
`~/workspace/worktrees/sim-bowopen-recheck-a`). **Base:** worktree HEAD
8616c6b2f (journey-scale r283 closeout; re-verified at commit time).
**Builds on:** `evidence/2026-11-19/sim-bowopen-a.md` (§§5, 8, 10) +
adoption, `evidence/2026-11-19/sim-speargate-a.md`,
`evidence/2026-11-19/sim-spearstage-a.md` + prereg,
`evidence/2026-11-19/sim-bowcraft-a.md` + confirm (d56fbe819),
`evidence/2026-11-19/sim-bowknow-a.md`.

## §0. The ground changed — what this arm is, and is not (frozen, not a sim)

The Nov 19 verdict was NO-GO because the staging never staged a bow
in 400 departures (0 spare bows in villages; a spear in the ranged
slot blinded the gate; bow knowledge unreachable for the armed).
Since then BOTH halves of the fix landed on master:

- **SPEARGATE** (sim-speargate-a, landing 416e81241): the ammo check
  inside `villagerStageBow` (`equipment.volleyWeaponOf`); pilot GO
  12/12, gate replicates 54/54. Env-gated `SPEARGATE=1`, off by
  default in live play.
- **BOWCRAFT turn-on** (commit d56fbe819): the home duty serves
  ranged-less villagers and seeds bow knowledge from SEEING an
  equipped bow at home; pilot BUILD-GO + confirm GO. Env gate
  removed — duty always on in live play.

Two later arms measured gate+source together under that ground and
both found the serve still empty: spearstage-a (band 107041–107048,
BOWOPEN=1 both legs, SPEARGATE ctl vs arm): gate 49/49, SERVED 0,
volley-rate rise +0.000 — NO-GO. bowknow-a (band 107051–107058,
SPEARGATE=1 both legs, BOWKNOW ctl vs arm): mentoring serves 0,
volley-rate rise +0.030 — NO-GO. The bow line moved on since
(evadebow DIAG-GO, DEPMAT/ROLL35/AMMO substrate rebuild, M1RANGE
landed+reverted, M2STEP2 landed+reverted, crossvoice/searvoice).
**This arm asks only: on CURRENT master, with gate + source fixed,
does BOWOPEN=1 now stage bows, fire volleys, and raise kill share?**

**This arm builds NO new lever.** The mechanism (`villagerStageBow`,
env-gated `BOWOPEN=1`) is already in code. If the re-measure proves
the existing one cannot fire, the mechanism diagnosis is the finding
and NO new departure-only staging tweak is landed (bowopen-a §10
forbids it). The turn-on decision for BOWOPEN/SPEARGATE is the
coordinator's, NOT this arm's. The rage/carrier path is Loop B's
(sim-ragecarry-b) — never touched here. Gate calibration is never
touched here.

**Instrument note (frozen):** the bowopen-a driver
(`scripts/bowopen-driver-a.js`) is STALE on current master — it
hard-requires `LAUNCHPARTY=1` and the LAUNCHPARTY sense in
`src/js/party-wiring.js`, and `LAUNCHPARTY` no longer appears in
`src/js/` (dead flag; bowcraft-a §3 confirms). The current substrate
is `SENSEEXPED=1` (party-wiring.js `launch_first`, sim-senseexped-b).
This arm's driver is therefore a clone of the CURRENT instrument,
`scripts/speargate-driver-a.js` (which already exports `bowOpen` +
`bowOpenByVid`, the §12 gap fix), with the leg variable swapped from
SPEARGATE to BOWOPEN: `scripts/bowopen-driver-recheck-a.js`.
Analyzer: `scripts/analyze-bowopen-a.js` reused as-is (it takes
`--ctl/--arm` dirs and judges exactly these bars; verified compatible
before the pilot — corpora carry the same v4encounters/v4gates/
bowOpen shape). Panel builder: thin clone
`scripts/build-bowopen-panels-recheck-a.js` (new filename prefix +
2026-11-24 defaults).

## The question

Bowopen baseline (band 105701–105708): 27 pair-inclusive engaged
meetings, kill share 0.037, damage/round 42.4, volley fired 9/27
(0.33). Spearstage proved the gate passes spear-holders to empty
sources; bowknow proved mentoring teaches but serves nothing.
**With the gate fixed (SPEARGATE=1) and the source live (BOWCRAFT
always-on), does switching BOWOPEN on stage bows at departure —
and does that reach the fight as a volley and as kills?**

## Primary metric (BINDING, §14) — the bowopen-a frozen bars, reused verbatim

Wave-4+ engaged meetings, pair-inclusive (size ≥ 2, present,
engaged), from the live corpora (never snapshots). Legs differ ONLY
by BOWOPEN.

- **Pool floor:** arm pair-inclusive engaged ≥ 10 (bowopen band: 27).
- **Kill share (pair-inclusive):** arm ≥ 0.25 (bowopen band: 0.037).
- **Damage/round (pair-inclusive):** arm ≥ 70 (bowopen band: 42.4).
- **Mechanism check — volley fired:** ≥ 0.50 of engaged meetings
  (bowopen band: 0.33, identical both legs).
- **Staging sniff test (pilot gate):** arm staged = fromStash +
  fromArmory + crafted > 0 AND volleys fire on the arm leg. If the
  pilot stages 0 bows, the verdict is NO-GO on the pilot with the
  mechanism diagnosis as the finding — NO 12–16 seed confirm is run
  on a null.
- **Gate replication (check, not a verdict bar):** arm
  spearPassed/spearSeen == 1.0; ctl spearPassed/spearSeen == 1.0
  (gate on both legs — bowknow-a precedent); consistency
  arm.alreadyHad ≈ ctl.alreadyHad and arm.noSource ≈ ctl.noSource
  within ±3 after the staged delta (PARTITION formula: minus
  arm.staged − ctl.staged). A miss here is diagnosed, never used
  to re-score the primary bars.

**GO threshold:** pool floor met AND kill share ≥ 0.25 AND
damage/round ≥ 70 AND volley fired ≥ 0.50 AND all cost bars pass
(below). **A miss on any bar is NO-GO, never re-scored.**

**Cost bars (binding guardrails):** community loss arm ≤ ctl +
0.125; villager starvation arm ≤ ctl + 2 (totals AND villager-only);
median survival arm ≥ 0.8 × ctl; instrument errors 0 on all
per-seed files.

## Secondary metrics (supporting, not binding)

- Staging by source per leg (alreadyHad / fromStash / fromArmory /
  crafted / craftedFail / noSource + spearSeen / spearPassed).
- Volley-capable share at wave-4+ meeting entry (fighter's
  `rangedId` carries `weapon.ammo`) per leg; spear share at the
  fight per leg; mean volley damage; ranged-at-entry share.
- Trio+ population (size ≥ 3, present, engaged) beside the primary,
  never substituted. Zero-damage fights classified explicitly
  (contradict / died-before-strike), never silently pooled
  (dmgshape lesson). Gate question among losses. Monster mix by
  outcome. Wall numbers every run: national / table / wins,
  wave-4 and wave-5 unlocks, median survival, death-cause shares,
  per leg. Table not instrumented by this driver — reported as
  null, never faked.
- Sense-testing: volley-fired and volley-missing fight transcripts
  read in full. Note whether the "no arrows" narration line still
  misnames non-arrow ammo (bowopen-a §10; the #2593 fix names the
  weapon's actual ammunition — verified live in this band if a
  searcaster/crossbow/sling holder hits the line).

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  spearstage/bowknow bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 110201, 110202, 110203,
  110204, 110205, 110206, 110207, 110208.** Freshness check
  (skill local_seed_band_freshness): `grep -rl "11020[1-8]"`
  over `evidence/*/sim-*-prereg.md` — **0 hits**; over
  `evidence/2026-11-2*/*.md` — **0 hits** (checked 2026-11-24
  ~11:00 UTC, before this prereg was frozen). Neighbouring used
  bands avoided: 104401–104608, 106181–106188, 107301–107648,
  109201–109432; sibling arm sim-fightcap-recheck-a suggested
  110101–110108 — this band is different by construction. No
  1102xx band is named anywhere in evidence.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1` (the fixed gate ground).
  BOWCRAFT is always-on in code on both legs (live ground, not a
  flag). **Ctl = same code, BOWOPEN unset; arm = same code,
  BOWOPEN=1.** The legs differ ONLY by env — no code change
  between legs, none on the branch at all (this arm changes no
  `src/`). The driver asserts the flag matches the MODE label and
  each corpus file records `bowopenOn` + `bowopenPresent` +
  `speargateOn` + `speargatePresent` + `senseexpedOn` + `wiringSha`
  + `gameSha`.
- **Instrument:** `scripts/bowopen-driver-recheck-a.js` (clone of
  `scripts/speargate-driver-a.js`, leg variable BOWOPEN;
  RUN=bowopen-recheck-a, OUTDIR
  `evidence/2026-11-24/perseed-bowopen-recheck-a-{ctl,arm}`).
  Analyzer `scripts/analyze-bowopen-a.js` (`--ctl/--arm`, plus
  `--selftest` green before the pilot). Per-seed JSONs under
  `evidence/2026-11-24/perseed-bowopen-recheck-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowopen-panels-recheck-a.js`
  (clone of the bowopen panel builder, new prefix/defaults) +
  `node scripts/balance-panel.js compare`; the compare `.md` is
  attached to the evidence file. The panel is the instrument,
  the frozen bars above are the judge.
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot passes
  the sniff test (staging stages + volleys fire); the coordinator
  decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing villager is SERVED, so
the fixture is the departure itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The proof test
(`scripts/test-bowopen-a.js`, re-run GREEN on this base before the
pilot) runs on a LIVE loaded village with real roster/gear and
proves the staging mechanism (every source leg, both craft
outcomes, the no-knowledge / no-materials no-ops, the fold-in
lift, a real wave-4 volley off a staged bow + pocketed arrows,
the startExpedition end-to-end wiring, the player skip, the Rage
guard). The pilot's per-seed corpora carry the encounter
averages (party size, gear, abilities, ranged-at-entry) beside
the verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   bowopen band: 82 launched expedition meetings, 27
   pair-inclusive engaged per 8 seeds; speargate band: 54
   spear-holder departures, 8 pair-inclusive engaged per 8 seeds;
   spearstage band: 49 spear-holder departures, 10 pair-inclusive
   engaged per 8 seeds. The pool floor (≥ 10) is sized to that
   known density.
2. **Pool sizing:** see (1). The kill-share (≥ 0.25) and
   damage/round (≥ 70) bars are the bowopen-a frozen bars — the
   winning shape needs ~111/round; 70 is the halfway bar the
   opening must clear to be worth a confirm.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-bowopen-a.js`, GREEN before the pilot) proves
   the staging mechanism on a live village (see the fixture
   section above). The analyzer `--selftest` covers the judge
   shapes (GO / NO-GO null / thin-pool).

## Canon

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` read.
Wave-4 canon: the Mirror Draft, standing ≥ 100; damage 35–95,
HP 850–1500, pierce 0.2–0.5. Wave 5: standing ≥ 200 AND wave-4
faced. No canon doc covers launch gear-up, the ranged-slot
rules, or weapon-craft knowledge seeding — said here rather than
inventing canon.

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2544: claimed by this arm; on GO the ranged-opening
  half is confirmed under gate+source-fixed ground — the opening
  stages, volleys, and raises kill share. On NO-GO the finding
  stays open with the failing bar + mechanism diagnosis named,
  and the next arm is named from the diagnosis (not another
  departure-only tweak).
