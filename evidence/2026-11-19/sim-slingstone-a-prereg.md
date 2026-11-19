# sim-slingstone-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-slingstone-a · **Loop A run:** fleshout-20261119T1415Z
**Type:** DIAG — trace what drains carried sling stones between departures
(finding #2600). **Frozen:** 2026-11-19 ~09:05 UTC, before any new sim.
**Branch:** `sim-slingstone-a` (worktree
`~/workspace/worktrees/sim-slingstone-a`). **Base:** master
**de9bb3c22** (journey-succession r248) — rebased from the
registration base ce94f8ff3 (journey-deepening r244) before any
judged sim, per the brief: local master moved while the arm was
being set up (10 commits, linear descendant, rebase clean, no
picks). The coordinator registered the worktree at ce94f8ff3; the
rebase is recorded here, not hidden. No own commits existed at
rebase time, so nothing was replayed.
**Builds on:** `evidence/2026-11-19/sim-arrowsupply-a.md` (§§5, 10),
`evidence/2026-11-19/sim-bowsource-a.md`,
`evidence/2026-11-19/sim-scale-onramp-round-1215.md` and this
arm's parent prereg `sim-arrowsupply-a-prereg.md`.

## The question

Finding #2600 (arrowsupply-a §5c/§10): sling carriers hold ~0
stones on 93.5% of days (mean 0.33), phase_slings on 82.0% (mean
0.93), yet depart armed (13 pile-stone top-ups in the arrowsupply
band; 55 stones pocketed). What drains carried stones between
departures — volley spend vs weapon-craft consumption are both
candidates. This DIAG carries a per-villager stone ledger across
the day boundary and attributes every stone delta.

## Reuse verdict — parent corpora NOT reusable (checked before sims)

The arrowsupply corpora (`perseed-arrowsupply-a-diag/`, 8 files)
cannot answer this question:

- The fieldFight wrap records wave ≥ 4 only: 3 sling rows in the
  whole band, 2 of them EVADED before any volley (volley null) and
  1 with 0 ammo (0 shots). Volley spend in wave 1–3 fights,
  patrols, aid fights, and world-tick fights is unrecorded.
- No wrap on `villagerWeaponCraftDay` / `villagerAmmoCraftDay` /
  `villagerArmorCraftDay` / `villagerGearDay` with pre/post
  carried-stone reads — craft consumption of a sling carrier's own
  stones is unmeasured.
- No death-time stone read (stones dying with the holder are
  invisible; the census only shows the carrier gone).
- The census itself IS reusable in shape (daily carried + stashed
  ammo per villager; stashAmmo was 0 on all 9,794 parent rows —
  there is no stash sink), and the departure wrap IS reusable
  (top-ups). The new instrument keeps both and adds the missing
  wraps. **Fresh judged sweep on the same seed band.**

## The mechanism (frozen, from code read — not a sim)

**Stone taxonomy** (src/data/items.json, src/data/recipes.json —
data, not canon; no canon doc covers stone/sling supply):

| Ranged weapon | Ammo | Supply route |
|---|---|---|
| sling (8), phase_sling (35) | stone | communal pile, taken directly at departure (cap 6); own stash first (always empty in practice) |

**Volley** (src/js/fieldFights.js:960–1064): the LEAD fighter
only (allies never volley — no ally-volley code exists); each shot
costs 1 real ammo from the fighter's own items; shots =
min(ammo, clamp(1+floor(range/monster speed),1,4)), so at most 4
stones per fight. An evade can precede the volley (volley null —
the fight never reaches the volley block). `rec.volley.ammoLeft`
cross-checks shots against ammo at entry.

**Departure top-up** (`villagerPocketAmmo`, game.js:8025): stones
topped up to 6 from the pile (stash first). It NEVER removes
stones — read in full; the only writes are additions.

**Candidate drains, frozen from code read:**

1. **Volley spend** — the named candidate. Up to 4 stones per
   fight, lead fighter only, any wave, any origin (expedition /
   world-tick / patrol / aid).
2. **Weapon-craft consumption** — the named candidate, but the
   code as read makes it a NON-candidate for sling carriers, and
   the instrument must PROVE that rather than assert it:
   `villagerWeaponCraftDay` (villager-build.js:1285) serves
   WEAPONLESS villagers only (a sling carrier is armed and is
   skipped outright) and takes materials from the crafter's OWN
   pack first, never another villager's pack. A sling carrier's
   stones can therefore only be craft-consumed if the carrier
   first loses the sling — the wrap measures exactly that
   (pre/post carried stone per carrier per duty-day).
3. **Ammo-craft consumption** — excluded by construction:
   `villagerAmmoCraftDay` (villager-build.js:1465) continues
   unless the ammo id is `arrow` or `bolt`; sling carriers
   (ammo `stone`) never run it. The wrap proves the zero.
4. **Armor craft** — recipes are bark/hide only (bark_armor:
   bark 3 + vine 2; hide_armor: hide 2 + vine 1); no stone in any
   armor recipe. The wrap proves the zero.
5. **Gear moves (gift / armory)** — `villagerGearDay` moves
   weapons/armor (tele `villager_gear`), never materials or ammo.
   The wrap proves the zero for stones.
6. **Death** — stones die with the holder: the carrier leaves the
   census carrying whatever they held. Measured as death-carried
   via a `registerDeath` pre-read.
7. **Kill loot** — `villagerKillLoot` rolls the alien table only
   (bowsource §4.1); stone is not an alien-table drop as far as
   the table reads, but the wrap records any stone gain so a
   loot inflow cannot hide.
8. **Forage / other inflows** — no NPC forage-to-pack path, no
   villager `Game.craft` call, and no hunt-action stone
   consumption were found by grep (searched: `npcForage`,
   `villagerForage`, `.craft(` in villager-agency.js/game.js,
   hunt + stone/ammo). NOT proven absent — the ledger's
   unexplained-GAIN side is the check for any missed inflow, and
   the unexplained-DRAIN side is the check for any missed drain.
   If either side exceeds its bar, the verdict is NO-GO and the
   residual intervals are sampled for the source (see §"Residual
   rule" below).

## The instrument (frozen)

New driver `scripts/slingstone-driver-a.js` — a clone of
`scripts/arrowsupply-driver-a.js` (the launch-funnel recorder is
UNCHANGED: v4seeds / v4departs / v4gates / v4encounters with
origin, dawnbid capture, companionPool) PLUS the stone ledger:

- **fieldFight wrap, ALL waves:** every call whose lead fighter
  holds a sling/phase_sling records `stoneFights` (day, vid, wave,
  mid, origin, rangedId, ammoAtEntry, volley {shots,hits,dmg,
  ammoLeft}, outcome, rounds, allyVids). Spend = volley.shots;
  cross-check `ammoLeft == ammoAtEntry - shots` on every row.
  (The parent wrap recorded wave ≥ 4 only; this one records all
  waves for sling carriers.)
- **villagerPocketAmmo wrap:** reused as-is (departure top-ups:
  carriedBefore/After, pocketed, pileStoneBefore, outcome).
- **Duty wraps** (`villagerWeaponCraftDay`,
  `villagerAmmoCraftDay`, `villagerArmorCraftDay`,
  `villagerGearDay`): each call snapshots every living
  sling/phase_sling carrier's carried stone before and after;
  records per-vid deltas as `stoneDutyTakes` (day, duty, vid,
  before, after, took). A take is a craft/gift consumption only
  if the duty's own code took from the pack — the pre/post read
  is the measurement, the duty name is the attribution.
- **villagerKillLoot wrap:** pre/post carried stone per killer;
  records `stoneLoot` rows (day, vid, dropId, stoneBefore/After).
- **registerDeath wrap:** pre-call read of the dead vid's carried
  stone (kind `person` only); records `stoneDeaths` (day, vid,
  carriedStone, cause). The VF instrument's own deaths list is
  kept as the cross-check.
- **Daily census:** reused as-is (every living roster villager:
  ranged weapon + carried/stashed ammo; communal pile recipe
  materials) plus a day-0 baseline. Census rows are the ledger's
  anchors; events are timestamped by game day so attribution
  uses the window (prevCensusDay, censusDay].
- **Tele rows:** kept (VF tele wrap) — `villager_gear`,
  `weapon_craft`, `ammo_craft` cross-checks against the duty
  wraps.

All wraps are pure reads + driver-local writes (no RNG, no
game-state writes); the game functions run exactly once,
untouched.

## The ledger (frozen)

Per (vid, interval) between consecutive census rows of the same
living sling/phase_sling carrier:

- O = carried stone at the earlier census; C = carried stone at
  the later census.
- I = Σ recorded inflows with day in (prevDay, day] (departure
  pocketed stones, loot stone gains, any other recorded inflow).
- X = Σ recorded outflows in the window (volley shots, duty
  takes, gear/gift-out stone moves).
- P = O + I − X (predicted close); R = P − C (residual:
  R > 0 unexplained drain, R < 0 unexplained gain).
- **Death interval:** carrier present at census t, dead/absent at
  t+1 → death-carried = O + I − X (stones that left the world
  with the holder); counted as an attributed outflow (death), not
  residual.
- Total drain D = Σ over alive-intervals (X + max(0, R)) +
  Σ death-carried.
- **Completeness = 1 − Σ max(0, R) / D.**
- Split shares: volley = Σ volley shots / D; craft =
  Σ duty takes (weapon + ammo + armor craft) / D; death =
  Σ death-carried / D; gift = Σ gear/gift stone moves / D;
  residual = Σ max(0, R) / D. Unexplained gains reported
  separately as Σ max(0, −R) against total inflows.

**Residual rule:** if Σ max(0, R) / D > 0.10 (the completeness
bar fails) OR unexplained gains exceed 10% of total inflows, the
verdict is DIAG-NO-GO and the evidence samples the residual
intervals (vid, day, context: fights joined as ally, contests,
away/exped flags, last duty) to name the missed source for the
next run. The residual is never silently folded into a category.

## Primary metric (BINDING, §14)

**Delta-attribution completeness of the per-villager stone
ledger** (definition above), on sling + phase_sling carriers.

**Verdict ladder (frozen):**
- **DIAG-GO** iff ALL hold: (1) completeness ≥ 0.90; (2)
  departure pool — ≥ 15 stone-carrying sling/phase_sling
  departures across the band (parent band: 22 sling+phase
  departures, 13 pile-stone top-ups — the floor is sized to the
  parent count with slack for the base move); (3) drain pool —
  ≥ 25 census-intervals with a positive stone drain (the
  population the split is measured on); (4) the drain split is
  fully quantified — volley and craft shares both reported as
  measured numbers (0 counts as measured when the wrap proves
  liveness: the duty wrap ran, the take count is 0, and the
  code-path exclusion is cited), with the residual stated.
  The split must name a majority cause (one category ≥ 50% of D)
  OR state both named candidates' measured shares with the
  residual unexplained — either satisfies (4); the evidence says
  which.
- **DIAG-NO-GO** otherwise: completeness < 0.90, thin departure
  or drain pool, or an unquantified split. A NO-GO names what is
  missing, not a fix.

**If the diag finds a fixable lever** (e.g. volley spend rate,
a craft take that should not happen, a return-unload that
strips stones), it is named precisely and filed as the next arm
— NO game-code fix lands in this DIAG arm.

## Secondary metrics (supporting, never re-scored)

- (a) Drain split by category with counts: volley fights (n,
  shots, shots/fight), craft takes by duty (n, units), deaths
  (n, stones carried), gift moves (n, units), residual.
- (b) Volley cross-check: rows where ammoLeft ≠ ammoAtEntry −
  shots (instrument error if any); evades preceding the volley
  (volley null) among sling fights.
- (c) Top-up vs drain per departure: stones pocketed per
  departure vs stones spent before the next census (the
  departure-to-empty time).
- (d) Sling census re-check: zero share + mean carried stone by
  weapon (sling / phase_sling) on THIS base, beside the parent
  band's 93.5% / 82.0%.
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed.
- Table: not instrumented by this driver — reported as null,
  never faked.

## What this DIAG does NOT judge

- The bow-staging side (bowopen-a NO-GO stands) and the arrow
  supply side (arrowsupply-a NO-GO stands; the departure craft
  is vestigial).
- The fusion-cell supply (finding #2599 — the named next arm
  sim-fusioncell-a, a different supply chain).
- The launched-party fighter composition question (#2601).
- The rounds=0 "vKill" rows with mHpStart null are excluded by
  the engaged filter (rounds > 0), as in bowopen-a.
- No 12–16 seed confirm in this run — pilot only; the
  coordinator decides the confirm from the verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowopen /
  arrowsupply / bowsource bands, for comparability). Dead
  villages stop simulating (+10d tail max).
- **Seeds: 107021, 107022, 107023, 107024, 107025, 107026,
  107027, 107028 — the SAME seed set as the parent arrowsupply
  band, deliberately re-instrumented.** This is NOT a fresh band
  and is not claimed as one: the ledger runs on the same villages
  so departure/top-up numbers are directly comparable to the
  parent's. The base moved (ebea87dfb → de9bb3c22, journey
  r244–r248), so trajectories may differ slightly from the parent
  corpus; the ledger is self-contained per seed (inflows and
  outflows recorded inside the same run), so a base drift cannot
  bias attribution. Freshness note: no OTHER arm uses this band
  as a fresh band; the sibling bowsource band is 107001–107008.
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate — verified by grep on THIS
  base de9bb3c22 before freezing: all five flags present in
  `src/js/`; `LAUNCHPARTY` appears nowhere in `src/js/`).
  **Single leg (DIAG, no lever): MODE=diag, BOWOPEN unset** —
  the driver asserts the flag is unset, so the measured behavior
  is master's default. No ctl/arm split: there is no code change
  to compare.
- **Instrument:** `scripts/slingstone-driver-a.js` (clone of
  `scripts/arrowsupply-driver-a.js` + the stone-ledger wraps
  above); analyzer `scripts/analyze-slingstone-a.js` (fresh —
  the ledger + judge shapes, `--selftest` incl. the DIAG-GO /
  DIAG-NO-GO judge shapes and ledger fixtures with known
  splits); per-seed JSONs under
  `evidence/2026-11-19/perseed-slingstone-a-diag/`.
  **§15 panel:** `scripts/build-slingstone-panels-a.js` (adapted
  copy of the arrowsupply panel builder) + `node
  scripts/balance-panel.js compare`; single leg, so before==after
  is the same corpus — a zero-delta screen, stated as such in the
  evidence (the panel is the instrument, the frozen bars above
  are the judge; a DIAG carries no lever to compare).
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on fights the villagers actually fight, so the
fixture is the villagers' own expeditions, staged by the
competent policy: a geared scholar fighting with a party, never
a fresh un-geared solo scholar. The pilot's per-seed corpora
carry the encounter averages (party size, gear, abilities,
ranged-at-entry) beside the verdict in the evidence file. The
nearest measured point is the arrowsupply band (launched parties
geared by the launch gear-up; the volley population here is
ALL-wave sling fights, not the launched-party subset).

## Pre-pilot substrate checklist (§14b)

1. **Contact:** sling carriers depart and fight on the substrate
   — arrowsupply-a band: 22 sling/phase_sling departures, 13
   pile-stone top-ups, 3 wave-4 sling meetings on 8 seeds. The
   all-wave volley population is strictly larger (wave 1–3
   fights are the modal fight), so the drain pool floor (≥25
   drain intervals) is sized below the expected count.
2. **Pool sizing:** the departure floor (≥15) is sized to the
   parent band's 22 sling+phase departures; the drain floor
   (≥25 intervals) is sized to the carrier-day volume (1,211
   sling+phase carrier-days on the parent band) — even if only
   a few percent of carrier-days drain, the floor clears.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-slingstone-a.js`, GREEN before the pilot)
   proves the wraps attribute each ledger event on fixtures
   (volley spend 1/shot with the ammoLeft cross-check, departure
   top-up, duty take from own pack, death-carried, loot gain,
   gift move), the census reads carried/stashed stone, and the
   analyzer's judge shapes (DIAG-GO majority-cause, DIAG-GO
   both-candidates-measured, DIAG-NO-GO thin pool, DIAG-NO-GO
   low completeness) decide as written. The analyzer `--selftest`
   covers the ledger arithmetic, the residual rule, and all judge
   shapes.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500. **No canon doc covers stone/sling supply, the departure
top-up, or the home craft duties** — said here rather than
inventing canon. The stone taxonomy is cited from data
(`src/data/items.json` weapon.ammo, `src/data/recipes.json`) and
the supply mechanics from code (`game.js`
`villagerPocketAmmo`, `villager-build.js` the four build duties,
`fieldFights.js` volley), not from canon.
