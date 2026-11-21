# sim-vanishcause-a — PREREG (frozen)

**Arm:** sim-vanishcause-a · **Loop A run:** fleshout-20261121T1415Z (adoption of the timed-out 1215Z run)
**Axis:** scale-onramp · **Type:** DIAG — gun-vanish CAUSE (finding #2635, 0715Z blank 3)
**Base master:** `b6aad8942` (verified `git log --oneline -1` at worktree start; worktree
`~/workspace/worktrees/sim-vanishcause-a`, `git status --short --untracked-files=no` empty, EXIT=0)
**Branch:** `sim-vanishcause-a`
**Frozen:** 2026-11-21 ~15:05 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief)

Three censuses all land ~70–80% unexplained on gun-holder changes, and the next work
needs a CAUSE, not another census:

| Census | Band | Sink rows | Unexplained |
|---|---|---|---|
| sim-presence-a (§6) | 107051–107058 | 3 vanishes, 0 transfers | 3/3 (100%) — victor_lopez d110 (107052), catalina_reyes d93 (107058), scholar's gun d119 (107058); repeat exactly on both legs; deterministic, lever-independent |
| sim-holdersupply-a (§6) | 107131–107138 | seed 107138 split: ctl re-grant to ursula_weber d105, arm vanish d94 → scholar d109 → vanish d116 | same death → holder-died+re-grant on one leg, vanish on the other |
| sim-shape2-a (§"Finding #2635") | 107161–107168 | ctl 9 rows (7 unexplained 77.8%), arm 5 rows (4 unexplained 80.0%) | 0 transfers, 0 holder-died, 0 dropEvents both legs |

The deliverable is a CAUSE: for each unexplained vanish on prior bands, say what
happened — mechanism + code path. The fix for the cause, if one is found, is a
SEPARATE arm; this arm builds no fix and no lever.

## 2. Code-read priors (hypotheses to confirm or refute — not conclusions)

Read before writing the instrument (all cited from code, not canon — no canon doc
covers the searcaster / contest-prize / holder-presence rules specifically; same
standing note as gunrate/cellgate/presence/lendpool/shape2/holdersupply):

- **Scholar-equip blind spot (prime suspect for the scholar's gun vanish).**
  `gunHoldersOf` (presence/lendpool driver) scans the scholar's `inventory` only.
  `Game.equip` (game.js ~13930) SPLICES the equipped piece OUT of inventory into
  `equipped[slot]`; `unequip` pushes it back. The competent policy's `gearUp`
  (scripts/policies/competent.js ~2032) equips the best weapon it owns. So a
  scholar who equips the searcaster reads as a VANISH, and unequipping it reads
  as a NEW-HOLDER, both `unexplained` — the gun never left the scholar.
- **Scholar death reads as vanish (old-detector bug).** `playerDeath`
  (src/js/ledger.js:658) puts non-sentimental inventory + equipped gear on the
  corpse as the lootable death pack; nothing auto-transfers. The old transfer
  detector skips the dead-check for `__scholar__` (`if (from !== '__scholar__')`),
  so a scholar death is always kind `vanish`, attribution `unexplained`, even
  though the gun sits on the corpse. The new instrument attributes scholar death
  as `died-holding`.
- **Villager death is already attributed.** A dead villager's items stay on their
  person record (lendfix probe, game.js `_returnLentSearcaster` comment); the old
  detector's `getPerson(from).dead` check fires → `holder-died`. Correct already.
- **Roster departure alive (candidate for living-holder vanishes).**
  `removeVillager` (src/js/betrayal.js:1109) removes the vid from the roster but
  keeps the person record AND its items; `dead` is NOT set for exiled/fled/
  splinter removals → the old detector reads `vanish` while the gun still sits in
  the leaver's pack. The new census scans ALL of `data.villagers` (not just the
  roster) so a departed holder's gun stays located.
- **Ruled out by code read (the instrument must still show 0, not assume 0):**
  theft — `stealFrom` (game.js:4243) moves kcal only, never item entries;
  inventory-expire — "Gear (no spoilDay) never spoils" (game.js:29189), and a
  granted searcaster carries spoilDay 9999; villager-to-villager gift/trade — no
  path found in code (the only villager-to-villager gun move is LEND, which is
  OFF on this run); autoEquip displacement — searcaster bonus 120 outscores
  every other ranged weapon (apex_bow 95, starfall_bow 50, crossbow 28), so
  `autoEquip` always seats a searcaster that is in the holder's items.
- **Burial is not a gun sink (data terms).** `buryCorpse` (src/js/corpses.js:876)
  sets `buried=true` and keeps `c.items` — the death pack "goes into the ground"
  in fiction but stays on the corpse object. The census scans `state.corpses`
  items, buried or not.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107221–107228 (fresh).** Searched every prereg under
  `evidence/*/sim-*-prereg.md` for `10722[1-8]` — zero hits — and for any
  `1072xx` band — zero hits anywhere (no prereg names a 1072xx band at all).
  Searched `evidence/2026-11-2*/sim-*.md` for `10722` — zero hits. Nearest used
  bands: 107161–107168, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058. No forbidden-band list file exists in the goal
  `hidden_files/` (checked 2026-11-21). The band is fresh by the skill's rule
  (a named band is used; this one is named nowhere).

## 4. Instrument (frozen design)

**No src hooks.** Every transfer/loss event is a `Game` or `Scattering`
namespace method visible to a driver wrap, so the instrument is driver wraps +
pure reads only; **0 src delta by construction**. If the smoke (§7) shows an
event the wraps cannot see, that is reported in the evidence — no src hook is
added mid-run without a prereg amendment before the judged pilot.

- `scripts/vanishcause-driver-a.js` — NEW compact driver (gunrate/cellgate
  driver PATTERN: wraps + daily census + diff; not a 2500-line clone — this
  diag needs only the gun census, the transfer wraps, and wall fields).
  Wraps (pure reads + driver-local writes; every game function runs exactly
  once, untouched):
  - grants: `Game.alienLootGrant` (caller taxonomy: contest-prize / show-gift /
    trade / kill-loot-corpse), `Game._cxItemPrize` (contest context),
    `Game.villagerKillLoot` (kill-loot drops)
  - corpse takes: `Game._corpseTakeStack`, `Game.corpseTakeItem`,
    `Game.corpseLootAll`, `Game.lootCorpse` (item ids taken, scholar only)
  - scholar pack moves: `Game.equip`, `Game.unequip`, `Game.stealFrom`,
    `Game.dropItem`, `Game.giftArmor` (armor-only — recorded to PROVE the gift
    path never moves a gun)
  - villager re-equip: `Scattering.equipment.autoEquip` (pre/post ranged slot
    per person; callers read the namespace property at call time, so the wrap
    sees every call)
  - death / departure: `Game.registerDeath` (vid + items on the corpse),
    `Game.removeVillager` (vid + how: killed/exiled/fled/splinter),
    `Game.playerDeath` (old scholar vid, successor vid, corpse id),
    `Game.buryCorpse` (corpse id + items buried with it)
  - lend guard: `Game._lendSearcaster`, `Game._returnLentSearcaster` (LEND off;
    must stay 0 — the v4lends recorder)
  - daily snapshot (end of day, in the `wrapped.daily` finally, same hook point
    as the lendpool driver): FULL gun-location census — every searcaster in the
    world, one location each: `equipped:<vid>` / `carried:<vid>` /
    `stashed:<vid>` for every person in `data.villagers` (living, dead,
    off-roster — the old census read the roster only); `scholar-pack` /
    `scholar-equipped:<slot>`; `stash:<section>` (communal stash sections);
    `corpse:<cid>` (every `state.corpses` item, buried or not). PLUS the legacy
    equipped-only holder map (for the v4transfers rows, same diff logic as
    presence/lendpool) PLUS wall fields (standing, wave, survival, deaths).
- `scripts/analyze-vanishcause-a.js` — reproduces the v4transfers rows (same diff
  logic), attributes each via the location transition + same-day event wraps
  (§5 mapping), judges the frozen bars (§6), `--selftest` green before pilot.
- `scripts/test-vanishcause-a.js` — proof test: location-census fixtures
  (equipped/carried/stashed/scholar-pack/scholar-equipped/stash/corpse),
  attribution fixtures (each cause in §5 incl. scholar-death → died-holding and
  scholar-equip → pack-transfer), wrap-installation checks. GREEN before pilot.
- `scripts/build-vanishcause-panels-a.js` — panel builder (gunrate builder
  pattern): two identical legs → before/after panel JSONs →
  `scripts/balance-panel.js compare` (§6 guardrail: the compare is the
  instrument-neutrality proof, not a lever comparison).

## 5. Cause mapping (frozen — closed set from the brief)

Closed set: `grant-contest-prize / died-holding / gift / trade / theft / drop /
corpse-take / loot / pack-transfer / inventory-expire / unexplained-with-evidence`.
Attribution reads the gun's previous-day location + today's wrapped events:

- **new-holder `to`:**
  - gun was on `corpse:<cid>` yesterday + corpse-take event today → `corpse-take`
  - gun was `carried:<to>` yesterday (same person, already in their items) →
    `pack-transfer` (autoEquip seated a carried gun; the autoEquip wrap names the
    trigger; the grant day is noted when a prior grant to `to` exists)
  - grant event to `to` today with contest caller → `grant-contest-prize`
  - kill-loot drop to `to` today → `loot`
  - gun was in `stash:<section>` yesterday → `pack-transfer` (stash take)
  - gift/steal event moving the gun to `to` → `gift` / `theft` (expected never)
  - gun not found anywhere yesterday → `unexplained-with-evidence`
- **vanish `from`:**
  - `from` died today (`registerDeath` / `removeVillager` killed, or scholar
    death via `playerDeath`) and the gun is now on a corpse or still in the dead
    person's items → `died-holding` (this FIXES the old detector's scholar-death
    mislabel)
  - gun now `carried:<from>` / `stashed:<from>` (same holder, still in their kit)
    → `pack-transfer` (unequip / displace; the autoEquip wrap names the trigger)
  - gun now `scholar-pack` / `scholar-equipped` + a drop/steal/corpse event →
    `drop` / `theft` / `corpse-take` as the event says
  - gun now equipped/carried by another villager → covered by that arrival row
    (kind `transfer`; cause from the arrival attribution)
  - gun not found anywhere + no wrapped event today → `unexplained-with-evidence`
    (must carry the last-known location + the full location census for that day)
  - `from` left the roster ALIVE (`removeVillager` exiled/fled/splinter) with the
    gun still in their pack → NOT in the closed set: recorded as
    `unexplained-with-evidence` with the mechanism spelled out in the evidence
    field (`holder left roster alive via removeVillager '<how>' with gun in
    pack; gun located carried:<vid> off-roster`). The metric review (§9 of the
    evidence) proposes a `left-with-holder` label for the next run — a proposal,
    NOT a re-score.
- **holder-died rows:** attribution `died-holding` by construction (same as the
  old detector for villagers; extended to the scholar).

## 6. Frozen bars (judge: the analyzer on the full band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Attribution rate** — holder changes (v4transfers rows: new-holder + vanish + holder-died + transfer) with a non-`unexplained*` cause | ≥ 80% (shape2 baseline ~20–22%: ctl 2/9, arm 1/5) |
| 2 | **≥ 1 vanish cause named** with mechanism + code path (the deliverable) | ≥ 1 |
| 3 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every v4transfers row joined to a before/after gun location (no row without a location transition) | all must hold |
| 4 | **Guardrail (instrument neutrality)** — leg1 vs leg2 corpora identical on all simulation fields (fidelity-style check); `v4lends` 0 (LEND off); 0 src delta | all must hold |

No bar is re-scored mid-run (§14). A miss is NO-GO, recorded with a metric review.

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107058** first — the
  band with the known vanishes (catalina_reyes d93, scholar's gun d119). The
  instrument must attribute BOTH before the judged pilot runs. If it cannot,
  the run stops here and the gap is reported (no judged sims on a blind
  instrument).
- **Pilot (judged):** 8 seeds, **107221–107228**, horizon 150d death-aware,
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
- **Canon:** none covers the searcaster / contest-prize / holder-presence rules;
  rules are cited from code (see §2). Said here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
