# sim-craftgate-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-craftgate-a · **Loop A run:** fleshout-20261127T1915Z
**Type:** DIAG (instrument + evidence only — no game-code fix lands).
**Frozen:** 2026-11-27 ~14:00 UTC, before any judged sim.
**Branch:** `sim-craftgate-a` (worktree `~/workspace/worktrees/sim-craftgate-a`).
**Base:** worktree HEAD 1d266ccf9 (sim-launchfit-b evidence-only landing).
**Builds on:** `evidence/2026-11-24/sim-aidammo-a.md` (§§3b, 4, 13) + prereg
— the 2115Z next blank #1 (the home-duty craft gate). The thrown-spear
opening (2115Z blank #2) is a Steve design call and is NOT this arm.

## §0. The question, in plain words

Home-duty craft supplies 85 of every 100 arrows a fighter holds when they
meet a wave-4 monster — but most ranged fighters never get a batch at all:
131 of the 149 fighters who walked into a wave-4 fight empty-quivered had
never once been handed ammunition in their whole life. One whole village
(seed 110501) made nothing in 150 days — one single craft attempt, which
failed. The gate that decides whether a bow-carrier at home gets arrows is
`villagerAmmoCraftDay`: at home + short of ammo + materials in hand. This
arm opens that gate and watches it, day by day, carrier by carrier: on
every day a bow-carrier needs arrows, was the carrier away from home, was
the pile empty of stick/stone/fiber, was the carrier home with materials
in hand but the duty still not crafting, or did the craft get attempted
and fail? The answer names which of those four causes the 131/149 gap is.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/PRESERVATION.md`.
**No canon doc covers ammunition supply or the home-duty craft gate
specifically** — said here rather than inventing one. Arrow-crafting is a
human skill (CANON.md), never an alien ability. PRESERVATION.md covers
the food ladder, not ammo; its "blind penalties teach" rule is the same
shape as the craft odds below (blind 35% / learned 85%, a blind success
teaches) but is not ammo canon.

**The gate, read from `src/js/villager-build.js:1584`
(`villagerAmmoCraftDay`), in check order.** The duty runs once a day
(from `villagerBuildDay`, the daily tick). Per villager, in order:

1. **Home set:** roster, not the scholar, not in `v.away`, not dead.
   No tile check — "home" here means not-away, not "standing on the
   Haven tile". (The instrument records node-vs-Haven separately so the
   analysis can test whether the two diverge.)
2. **Cooldown:** `v.arrowCraftCd[vid] > day - 3` → skip (≤1 attempt / 3d).
3. **Ranged weapon:** `eq.autoEquip` seats a carried bow, then
   `rangedWeaponOf` (fallback: equipped ranged slot). None → skip.
4. **Ammo id:** from the weapon def's `weapon.ammo`; only `arrow` /
   `bolt` continue. Spears carry no ammo id and fall out; searcaster
   (`fusion_cell`) is not craftable here.
5. **Already stocked:** carried matching ammo ≥ 5 (one batch) → skip.
6. **Recipe:** `recipes.json` entry for the ammo id (must exist).
7. **Materials:** for each `[mat, need]` in the recipe, own carried
   materials + communal pile materials ≥ need, else skip — and NO
   cooldown is spent on a materials skip.
8. **Attempt:** cooldown set to today, materials consumed (own first,
   then the pile), RNG roll: learned (level ≥ 2) 85%, blind 35%. Fail →
   materials wasted, `tele('ammo_craft', {ok:false})`. Success →
   level set to 2 (PRACTICE: a blind success teaches), one batch of 5
   placed in carried items, `tele('ammo_craft', {ok:true})`.

**Recipes (live from `src/data/recipes.json`):** arrow = 2 stick + 1 stone
+ 1 fiber, makes 5; bolt = 2 stick + 1 stone, makes 5. The pile is
`stashState().materials` (== `v.stash.materials`, `src/js/storage.js:248`)
— an id→count map; the instrument reads that map directly (pure read,
the same object the duty reads).

**§1a. Frozen taxonomy.** A **candidate** is an alive roster villager
(not the scholar) who equips OR carries a bow/crossbow (a ranged weapon
def with `weapon.ammo` of `arrow`/`bolt`). Carried-but-unequipped counts
because the duty's `autoEquip` would seat it; the gate row records
`weaponSource: 'equipped' | 'carried-autoequip'` so the analyzer can
report the autoEquip gap separately. A **needing-day** is a
candidate-day with carried matching ammo < 5, evaluated from the
pre-duty gate snapshot (the state the duty itself sees). Each
needing-day carries exactly one gate state, evaluated in duty order:

| Gate state | Meaning | Cause bucket |
|---|---|---|
| `away` | not in the duty home set (away flag) | **carrier-absent** |
| `cooldown` | home, short, weapon ok, within 3d of last attempt | **carrier-present-but-not-crafting** |
| `no-materials` | home, not cooldown, short, own + pile < recipe need | **pile-materials-absent** |
| `attempt-eligible` | home, not cooldown, short, materials sufficient — the duty attempts; outcome in the attempts table | attempt (success = batch received; fail → **other: attempt-failed**) |
| `stocked` | home, carried ≥ 5 | not a needing-day |
| `no-weapon` / `no-recipe` / `duty-not-run` | candidate with no seatable weapon, missing recipe, or a day the duty never ran | **other** (sub-counted) |

A **dead** candidate-day is not a needing-day (counted separately).
The four headline causes are exactly: **carrier-absent**,
**pile-materials-absent**, **carrier-present-but-not-crafting**,
**other** (attempt-failed + no-weapon/no-recipe/duty-not-run, each
sub-counted so a large "other" is never opaque).

**§1b. The pool and the decomposition (frozen).** The **empty pool** is
the distinct vids who entered ≥ 1 wave-4+ meeting (any origin, evades
included) with an ammo-capable ranged weapon and `ammoAtEntry === 0`
(lead + allies, from the encounter rows). A pool fighter is
**never-supplied** when the ammo ledger holds zero production events
for that vid with the ammo id their weapon needs, any source
(`home-duty`, `departure-craft`, `departure-pile-stones`, `loot`,
`starting-kit`, `other`). The variant excluding `starting-kit` is
reported alongside, never substituted. Each never-supplied fighter's
**primary cause** is the cause bucket covering the plurality of their
needing-days over the whole run (ties broken by the fixed order
away > no-materials > present-but-not-crafting > other, tie count
reported). Headline tables: fighters per primary cause AND pooled
needing-days per cause. A fighter with zero classified needing-days is
**unassigned** (a coverage failure, not a fifth cause).

**§1c. The instrument (driver-side, no game-code change).**
`scripts/craftgate-driver-a.js` (lean launchfit-style driver: one
process per seed) + `scripts/craftgate-instrument-a.js`:
- **Reused from aidammo (cite):** the ammo-provenance ledger —
  `createAmmoLedger`, `ledgerSeed`, `ledgerDaily`, `ammoSnapVid`,
  `ammoSnapAll`, `ammoRangedKit`, `provShares`, `provTake`,
  `provMove`, `provPush`, `AMMO_IDS`, `fightOrigin` — required from
  `scripts/aidammo-driver-a.js` (its `module.exports`), not copied.
  The ledger's `fieldFight` wrap is re-implemented lean in the
  instrument (pre-call kit + provenance for lead + allies, post-call
  spend diff via `provTake`, wave-4+ encounter rows with origin) —
  same row shape as aidammo's, so the aidammo analyzer's
  `ammoAtEntryAll` / `ledgerStats` / `ledgerHash` read this corpus
  unchanged.
- **New here:** a pure-read gate replica run inside the
  `villagerAmmoCraftDay` wrap BEFORE the original call — one gate row
  per candidate per duty-day (pre-duty state: away/home, node vs
  Haven, weapon + source, carried ammo, cooldown, own materials per
  recipe material, pile materials per recipe material, shortfall
  material(s), gate state, cause bucket) — plus a per-vid attempt row
  from the wrap's before/after diff (cooldown set ⇒ attempted;
  carried-ammo gain ⇒ success; `ammoCraft` level at attempt time for
  the blind/learned split), plus a daily pile snapshot in the
  policy-daily finally block (pile stick/stone/fiber + counts of
  candidates at home / short / materials-sufficient). All wraps call
  each original exactly once and draw no RNG.
- Analyzer `scripts/analyze-craftgate-a.js` (clone of
  `scripts/analyze-aidammo-a.js`'s ledger/pool machinery +
  `emptyFighterPool` / `gateDecomposition` / `judgeDiag`;
  `--selftest` green before the pilot). Per-seed JSONs under
  `evidence/2026-11-27/perseed-craftgate-a/`.

**Desk expectation (frozen, not a verdict):** the pile is the leading
hypothesis (aidammo §4: with a 35% blind rate, zero successes over any
real number of attempts is impossible, so attempts themselves must be
~zero — and the gate that blocks an attempt is materials). The pilot
measures it; if the ledger + gate rows show otherwise (carriers
away, or cooldown-bound, or failing blind rolls), the rows win.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm; there is no lever to compare).

- **Primary metric: the decomposition of the never-supplied empty
  pool.** Pool = distinct empty-quivered fighters at wave-4+ entry
  (see §1b). Never-supplied subset + primary cause per fighter +
  pooled needing-days per cause (four headline causes, sub-counts
  inside "other").
- **Pool floor:** distinct empty-quivered fighters ≥ 10. If the pool
  misses, the verdict is DIAG-NO-GO thin-pool, not a re-score.
- **Attribution completeness:** ≥ 0.90 (known-source units / total
  units at wave-4+ entries, lead + allies — the aidammo definition,
  same ledger).
- **Gate coverage:** needing-days carrying a gate row / all
  needing-days in the pool ≥ 0.90. A needing-day without a gate row
  (duty never ran, snapshot missed) is unobserved, never defaulted.
- **Decomposition completeness:** unassigned never-supplied fighters
  = 0 (every fighter in the never-supplied subset gets a primary
  cause from ≥ 1 classified needing-day).

**GO threshold (DIAG-GO):** pool floor met AND attribution
completeness ≥ 0.90 AND gate coverage ≥ 0.90 AND unassigned = 0.
**A miss on any bar is DIAG-NO-GO, never re-scored.**

**Determinism check (not a verdict bar):** after the pilot, re-run
seed 110801 with identical env and compare the craftgate hash (gate
rows + attempt rows + ledger events + encounter ammo fields). The
wraps draw no RNG and call each original exactly once, so the re-run
must match. A mismatch is reported as an instrument artifact in the
evidence, never claimed as a lever effect.

## §3. Secondary metrics (supporting, not binding)

- Pile-recipe availability: fraction of days the pile holds a full
  arrow recipe (2 stick + 1 stone + 1 fiber) and a full bolt recipe
  (2 stick + 1 stone), per seed and pooled.
- At-home carrier census: mean candidates at home / short of ammo /
  materials-sufficient per day, per seed and pooled.
- No-materials split: needing-days where the pile alone is short vs
  the carrier's own pack is short vs both short (which material,
  shortfall units).
- Attempts vs successes, split by blind (level 1) / learned (level 2)
  — observed success rate vs the frozen 0.35 / 0.85.
- Cooldown share of needing-days; attempt-failed share; duty-not-run
  days; autoEquip-gap days (weapon carried but not seated).
- Mechanism re-measure (report-only, never a verdict bar):
  ammo-at-entry vs 0.70, overall + by origin, lead + allies and
  lead-only, capable-only alongside (aidammo §3 table, same band
  shape).
- Desert check: any seed with 0 home-duty batches — its gate rows
  decomposed (the 110501 question, re-asked on a fresh band).
- Wall numbers: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, death-cause shares. Table not instrumented by
  this driver — reported as null, never faked.
- Sense-testing: ≥ 2 meeting transcripts read in full, judging
  whether the supply story reads sensibly (who had arrows, who did
  not, and whether any villager's ammo state contradicts what the
  gate rows say they should hold).

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the aidammo / ammosupply
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds (fresh 8-seed pilot band): 110801, 110802, 110803, 110804,
  110805, 110806, 110807, 110808.**
- **Seed-band freshness (skill local_seed_band_freshness, checked
  2026-11-27 ~13:50 UTC, before this prereg was frozen):**
  - `grep -rl "11080" evidence/*/sim-*-prereg.md` — **0 hits**.
  - `grep -rn "110801\|11080[1-8]" evidence/*/sim-*-prereg.md` —
    **0 hits**.
  - `grep -rn "11080" evidence/ --include="*.md"` — **0 hits**
    (the only "1108" substring hits anywhere are `51108` seeds
    from 2026-11-01 depositgate arms — a different band).
  - Forbidden / contaminated bands named in preregs: 73641–73648,
    73671–73678, the 871xx contact-finish band, 99201–99216,
    78201–78208, 76201–76208 — none intersects 110801–110808.
  - No `perseed-*1108*` corpus dir exists. Sibling same-day arm
    launchfit-b uses 111101–111108 — no collision. Neighbouring used
    bands avoided: 110101–110108, 110201–110208, 110401–110408,
    110501–110508.
  - Note: the goal `hidden_files/` tree holds no band-list file
    (only run logs + `sim-heraldband-pilot-prereg-2018.md`, checked:
    no `11080`); a full recursive grep there was abandoned as too
    slow (thousands of log files) — the prereg-wide + evidence-wide
    greps above are the check the skill requires.
  - **Band 110801–110808 is FRESH.**
- **Policies:** competent verbatim. **Substrate:** `VETREENGAGE=1 +
  PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`, `SENSEEXPED=1`,
  `SPEARGATE=1`, `BOWOPEN=1` (same as the aidammo pilot, so numbers
  compare). The driver asserts all seven flags and stops otherwise.
  The corpus files record `bowopenOn` + `speargateOn` +
  `senseexpedOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/craftgate-driver-a.js` +
  `scripts/craftgate-instrument-a.js` (RUN= craftgate-a, OUTDIR
  `evidence/2026-11-27/perseed-craftgate-a`).
  Analyzer `scripts/analyze-craftgate-a.js` (single-leg +
  gate-decomposition tables; `--selftest` green before the pilot).
  Per-seed JSONs under `evidence/2026-11-27/perseed-craftgate-a/`.
  **§15 panel:** single-leg DIAG — no before/after panel exists to
  compare (no lever, no control leg). The panel step is NOT
  APPLICABLE; said here rather than faked. The analyzer JSON is the
  instrument output.
- **PILOT ONLY (8 seeds).** No confirm: a DIAG arm measures once on
  the pilot band; a second band is a new prereg, never a silent
  extension.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a fighter is SERVED, so the fixture is
the departure / meeting itself, staged by the competent policy: a
geared scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-craftgate-a.js`, GREEN before
the pilot) runs on a LIVE loaded village with real roster/gear and
proves the gate replica (away → carrier-absent; home short with an
empty pile → no-materials; home short with materials → attempt-eligible;
stocked → stocked; cooldown → cooldown), the attempt wrap
(cooldown-set ⇒ attempted, carried gain ⇒ success), the pile
snapshot read, and a ledger smoke leg (a home-duty batch attributed
to its crafter). The pilot's per-seed corpora carry the encounter
averages (party size, gear, abilities, ranged-at-entry) beside the
verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   aidammo band: 21 pair-inclusive engaged per 8 seeds; bowopen
   band: 21 / 11 per 8 seeds. The pool floor (≥ 10 distinct
   empty-quivered fighters) is sized to that density; a miss is
   DIAG-NO-GO thin-pool, judged as written.
2. **Pool sizing:** see (1). The empty pool on the aidammo band was
   149 fighter-entries; distinct vids will be fewer — the floor of
   10 distinct vids is conservative against that.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-craftgate-a.js`, GREEN before the pilot) proves the
   gate replica + attempt wrap + pile snapshot on a live village
   (see §5). The analyzer `--selftest` covers the judge shapes
   (DIAG-GO / DIAG-NO-GO thin-pool / DIAG-NO-GO attribution /
   DIAG-NO-GO coverage / DIAG-NO-GO unassigned) plus the
   decomposition shapes (all four causes, tie order, desert seed).

## §7. Canon

`docs/CANON.md` (manifest) and `docs/PRESERVATION.md` read.
PRESERVATION.md covers the food ladder, not ammo — recorded, not
stretched. **No canon doc covers ammunition supply or the home-duty
craft gate specifically** — said here rather than inventing canon.
Arrow-crafting is a human skill (CANON.md), never an alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- The 2115Z blank #1 is claimed by this arm as the craft-gate DIAG;
  on DIAG-GO the decomposition names the cause (or causes) of the
  131/149 gap and the next lever is named from the gate rows, not
  from a departure tweak. On DIAG-NO-GO the blank stays open with
  the failing bar named.
- Finding #2544 stays OPEN (the ammunition-supply half): this DIAG
  does not close it — it decomposes the gap. Finding #2602
  (departure craft vestigial) is background, not re-judged here.
- Write-flap: probe (`git update-ref refs/heads/probe HEAD`) passed
  at prereg time (~13:48 UTC) in the worktree; machine uptime 42 min
  (restart ~19:06 UTC — inside the flap's known post-restart shape).
  Probe before every material write; if it fails, stop writing and
  wait for the clear.
