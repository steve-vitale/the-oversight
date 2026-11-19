# sim-slingstone-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-slingstone-b · **Loop A run:** fleshout-20261119T1815Z
**Axis:** scale-onramp. **Type:** DIAG — re-run of sim-slingstone-a
on the SAME band 107021–107028 with the census-epoch instrument
(finding #2608) + the #2609 window fix. **Frozen:** 2026-11-19
~20:40 UTC, before any judged sim.
**Branch:** `sim-slingstone-b` (worktree
`~/workspace/worktrees/sim-slingstone-b`). **Base:** master
**16975bb01** (sim-partysurvive-rerun-b) — rebased from the
registration base 7e0810eea (sim-winnability-round-1530 adoption
closeout) before any judged sim, per the brief: local master moved
while the arm was being set up (4 commits, linear descendant,
rebase clean, no picks). The coordinator registered the worktree
at 7e0810eea; the rebase is recorded here, not hidden. No own
commits existed at rebase time, so nothing was replayed.
**Builds on:** `evidence/2026-11-19/sim-slingstone-a-prereg.md` and
`evidence/2026-11-19/sim-slingstone-a.md` (verdict DIAG-NO-GO,
frozen, NOT re-scored here).

## The question

Finding #2600 (answered, narrowed, by slingstone-a): the drain is
the volley — 47 of 60 drained stones (78.3%, majority cause),
craft takes 0 in 1,029 duty-days — but the frozen verdict was
DIAG-NO-GO on two bars: completeness 0.783 < 0.90 and drain pool
18 < 25. The evidence (§5d) decomposed the residual exactly: 9
stones are a same-day ordering artifact of the instrument (the
daily census fires mid-day in `policy.daily`'s finally block while
fights stamped the same game day can fire AFTER the snapshot, so
a fight's spend lands in the wrong ledger interval — paired ±
residuals on adjacent intervals, net 0), and 4 stones are a
same-day-death analyzer edge (a carrier censused at 4 stones on
day 70, fights that day for 2 shots, dies the same day carrying
2 — the death lookup required the death day to be AFTER the last
census day, so the death was missed and the carrier filed as
"vanished" with 4 stones lost). This arm re-runs the SAME band
with the instrument fixed and judges on the SAME frozen bars.

## The instrument changes (frozen — the only delta from slingstone-a)

**Finding #2608 — census-epoch stamping (driver
`scripts/slingstone-driver-b.js`, a clone of
`scripts/slingstone-driver-a.js`; the launch-funnel recorder is
UNCHANGED).** The driver keeps one epoch counter: the day of the
last census snapshot taken (the day-0 baseline, then each daily
census in the `policy.daily` finally block, which advances the
epoch immediately AFTER the snapshot reads). Every stone-ledger
row is stamped with the epoch live when the event fires —
`censusEpoch` on `stoneFights` (fight rows, stamped pre-call),
`ammoDeparts` (departure top-ups), `stoneDutyTakes` (weapon /
ammo / armor / gear duty rows), `stoneLoot`, and `stoneDeaths`
(also on the non-ledger `ammoHomeCraft` / `ammoLoot` rows for
completeness). An event's epoch is the census it followed: a
fight stamped day 18 with epoch 18 fired AFTER the day-18
census and belongs to the interval (18, 19]; the same fight with
epoch 17 fired BEFORE the day-18 census and belongs to (17, 18].
The epoch is a pure read of driver-local state (no RNG, no
game-state writes); every game function still runs exactly once,
untouched.

**Finding #2609 — window fix (analyzer
`scripts/analyze-slingstone-b.js`, a clone of
`scripts/analyze-slingstone-a.js`).** Where the analyzer joins
day-stamped events to censuses, the window is now
**[prevRowDay, rowDay]** instead of (prevRowDay, rowDay] —
with the epoch as the primary join key: an event carrying a
`censusEpoch` joins the interval whose opening census day EQUALS
its epoch (`event.censusEpoch === prevRowDay`); an event with NO
epoch (legacy rows only — the b-driver stamps every row) falls
back to the closed-left day window `prevRowDay <= day <= rowDay`.
The analyzer counts epoch-less rows per corpus and reports the
count; on the judged b-corpus it must be 0. The death lookup is
now `death day >= last census day` (was `>`): a carrier who dies
on the same day as their last census row is found, and the death
interval joins that day's post-census events by epoch, so the
directly measured `carriedStone` closes the interval. The
vanished window uses the same epoch join. Nothing else in the
ledger arithmetic changes: O/I/X/P/R, D, completeness, and the
split are exactly the a-definitions.

**What is NOT changed:** the ledger definitions, the frozen
verdict ladder (§"Primary metric" below), the seed band, the
horizon, the policy, the substrate, the departure/drain-pool
floors. The drain-pool floor stays 25 even though slingstone-a
§12 diagnosed it as mis-sized (sized on carrier-days, not
departures) — that diagnosis is a proposal for the NEXT run, not
a silent re-barring here. The frozen bars are judged as written.

## The mechanism (frozen, carried over from slingstone-a)

Unchanged from the a-prereg: one stone is one unit of sling
ammo, taken from the communal pile at departure (cap 6,
`villagerPocketAmmo`, game.js:8025 — it never removes stones);
each volley shot costs 1 stone from the lead fighter's own pack
(fieldFights.js volley block, max 4 shots per fight; allies
never volley; an evade can precede the volley, leaving it null);
`villagerWeaponCraftDay` serves WEAPONLESS villagers only and
takes from the crafter's OWN pack; `villagerAmmoCraftDay`
continues unless the ammo id is `arrow` or `bolt`; armor recipes
are bark/hide only; `villagerGearDay` moves weapons/armor, never
materials; stones die with the holder (measured via the
`registerDeath` pre-read). The wraps prove each of these live,
as in a.

## Primary metric (BINDING, §14 — IDENTICAL to slingstone-a)

**Delta-attribution completeness of the per-villager stone
ledger** (definition in the a-prereg, unchanged), on sling +
phase_sling carriers.

**Verdict ladder (frozen, identical to slingstone-a):**
- **DIAG-GO** iff ALL hold: (1) completeness ≥ 0.90; (2)
  departure pool — ≥ 15 stone-carrying sling/phase_sling
  departures across the band; (3) drain pool — ≥ 25
  census-intervals with a positive stone drain; (4) the drain
  split is fully quantified — volley and craft shares both
  reported as measured numbers (0 counts as measured when the
  wrap proves liveness: the duty wrap ran, the take count is 0,
  and the code-path exclusion is cited), with the residual
  stated. The split must name a majority cause (one category
  ≥ 50% of D) OR state both named candidates' measured shares
  with the residual unexplained — either satisfies (4); the
  evidence says which.
- **DIAG-NO-GO** otherwise: completeness < 0.90, thin departure
  or drain pool, or an unquantified split. A NO-GO names what is
  missing, not a fix.

**If the diag finds a fixable lever** (e.g. volley spend rate,
a craft take that should not happen, a return-unload that
strips stones), it is named precisely and filed as the next arm
— NO game-code fix lands in this DIAG arm.

## Expectation (NOT a verdict — stated so the judge cannot drift)

Slingstone-a §5d's sensitivity note (NOT a re-score) says the
corrected attribution closes the books exactly on the a-corpus:
residual drain 0, death-carried 2, D = 47 + 2 = 49,
completeness 1.000, split volley 47/49 = 0.959, death 2/49 =
0.041, craft 0. The drain pool (18 intervals) is a
census-derived count that re-attribution cannot change, so it
stays below the 25 floor. **The expected verdict of this re-run
is therefore DIAG-NO-GO on the drain pool alone, with
completeness repaired.** If the numbers come out otherwise —
completeness still < 0.90, a different residual shape, a drain
pool ≥ 25 — the evidence reports the actual numbers and judges
them on the frozen bars as written; the expectation does not
override the judge. The deliverable is the repaired instrument
and the re-measured split, not a forced GO.

## Secondary metrics (supporting, never re-scored)

- (a) Drain split by category with counts: volley fights (n,
  shots, shots/fight), craft takes by duty (n, units), deaths
  (n, stones carried), gift moves (n, units), residual.
- (b) Volley cross-check: rows where ammoLeft ≠ ammoAtEntry −
  shots (instrument error if any); evades preceding the volley
  (volley null) among sling fights.
- (c) Top-up vs drain per departure: stones pocketed per
  departure vs stones spent before the next census.
- (d) Sling census re-check: zero share + mean carried stone by
  weapon (sling / phase_sling) on THIS base, beside the parent
  band's 93.5% / 82.0%.
- (e) Instrument check: epoch-less rows in the judged corpus
  (must be 0); residual intervals sampled by epoch (any nonzero
  residual is decomposed as in a §5d, naming the source).
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed.
- Table: not instrumented by this driver — reported as null,
  never faked.

## What this DIAG does NOT judge

- The bow-staging side (bowopen-a NO-GO stands) and the arrow
  supply side (arrowsupply-a NO-GO stands; the departure craft
  is vestigial).
- The fusion-cell supply (finding #2599).
- The launched-party fighter composition question (#2601).
- The rounds=0 "vKill" rows with mHpStart null are excluded by
  the engaged filter (rounds > 0), as in bowopen-a.
- The slingstone-a verdict itself: DIAG-NO-GO stands frozen and
  is NOT re-scored here. This arm re-runs with a fixed
  instrument and judges the NEW corpus on the same bars.
- No 12–16 seed confirm in this run — pilot only; the
  coordinator decides the confirm from the verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the bowopen /
  arrowsupply / bowsource / slingstone-a bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds: 107021, 107022, 107023, 107024, 107025, 107026,
  107027, 107028 — the SAME seed set as the slingstone-a band,
  deliberately re-instrumented.** This is NOT a fresh band and
  is not claimed as one: the ledger runs on the same villages so
  departure/top-up numbers are directly comparable to the a
  corpus. The base moved (de9bb3c22 → 16975bb01, journey r248 →
  partysurvive-rerun-b), so trajectories may differ slightly
  from the a corpus; the ledger is self-contained per seed
  (inflows and outflows recorded inside the same run), so a base
  drift cannot bias attribution. Freshness note: no OTHER arm
  uses this band as a fresh band; the sibling bowsource band is
  107001–107008.
- **Policies:** competent verbatim. **Substrate:**
  `SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
  FIGHTALLY2=1` (live master substrate — verified by grep on THIS
  base 16975bb01 before freezing: all five flags present in
  `src/js/`; `LAUNCHPARTY` appears nowhere in `src/js/`).
  **Single leg (DIAG, no lever): MODE=diag, BOWOPEN unset** —
  the driver asserts the flag is unset, so the measured behavior
  is master's default. No ctl/arm split: there is no code change
  to compare.
- **Instrument:** `scripts/slingstone-driver-b.js` (clone of
  `scripts/slingstone-driver-a.js` + the census-epoch stamp
  above); analyzer `scripts/analyze-slingstone-b.js` (clone of
  `scripts/analyze-slingstone-a.js` + the epoch join, the #2609
  closed-left fallback window, and the `>=` death lookup;
  `--selftest` incl. epoch-attribution fixtures: a same-day
  post-census fight attributing to the later interval, a
  same-day death closing with the directly measured
  carriedStone, and the legacy closed-window fallback, plus the
  a-analyzer's judge shapes carried over); per-seed JSONs under
  `evidence/2026-11-19/perseed-slingstone-b-diag/`.
  **§15 panel:** `scripts/build-slingstone-panels-b.js` (adapted
  copy of the slingstone-a panel builder) + `node
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
nearest measured point is the slingstone-a band (launched
parties geared by the launch gear-up; the volley population here
is ALL-wave sling fights, not the launched-party subset).

## Pre-pilot substrate checklist (§14b)

1. **Contact:** sling carriers depart and fight on the substrate
   — slingstone-a band: 22 sling/phase_sling departures, 13
   pile-stone top-ups, 116 all-wave sling fights, 47 volley
   shots on 8 seeds. The drain pool floor (≥25 intervals) is
   sized as in a (see the expectation above: it is expected to
   stay unmet at 18).
2. **Pool sizing:** the departure floor (≥15) is sized to the a
   band's 22 sling+phase departures; the drain floor (≥25
   intervals) is carried over unchanged from a, with the
   mis-sizing diagnosis from a §12 recorded as a proposal for
   the next run, not applied here.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-slingstone-b.js`, GREEN before the pilot)
   proves the epoch stamp attributes each ledger event on
   fixtures (a same-day post-census fight lands in the later
   interval; a same-day death closes on the measured
   carriedStone; the legacy closed-window fallback joins a
   prevDay-stamped row), the census reads carried/stashed
   stone, and the analyzer's judge shapes (DIAG-GO
   majority-cause, DIAG-GO both-candidates-measured, DIAG-NO-GO
   thin pool, DIAG-NO-GO low completeness) decide as written.
   The analyzer `--selftest` covers the ledger arithmetic, the
   epoch join, the death `>=` lookup, and all judge shapes.

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
