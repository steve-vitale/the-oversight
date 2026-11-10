# sim-spearvolley-b — prereg: spears are melee, not ranged (SPEAR-IN-RANGED-SLOT)

- Arm: sim-spearvolley-b (Loop B, BUILD arm, run fleshout-loop-b-20261110T0429Z)
- Branch: sim-spearvolley-b; base anchor `91650a90f` (worktree `~/workspace/worktrees/sim-spearvolley-b`)
- Lever from: sim-findings.md SPEAR-IN-RANGED-SLOT (open, 2026-11-09, Loop B
  sim-vetfinish-b, evidence/2026-11-09/sim-vetfinish-b.md V2 probe + scripts/test-vetfinish-b.js V2).

## Grounding (pre-existing evidence, no new computation yet)

- V2 probe (vetfinish-b): a bow+spear fighter never volleys — `rec.volley`
  null on 6/6 probe streams. Mechanism: `src/js/equipment.js`
  `autoEquip`/`equipScore` score spears as ranged (range 2), so a fighter
  carrying both a bow and a spear gets spear→ranged, bow→unequipped,
  melee→null — the bow's opening volley never happens. The contact finish
  still finds the spear as a carried melee weapon, so the fighter is not
  disarmed — they just lose the bow's identity.
- The wild volley shape is bow-only: 60/296 wave-4 field rows carry volley
  shots (vetfinish-b; wave-4 here = wave ≥ 4, the finishersize-analyzer
  population).
- The data already classifies spears as melee: every spear in
  `src/data/items.json` carries `weapon.type: 'melee'` with `range: 2`
  (hunting_spear 30, fire_hardened_spear 15, shard_spear 25,
  starfall_lance 80, godslayer_spear 85). The slot rule (`isRangedWeapon`:
  range > 1 → ranged) contradicts the data's own type field. The fix
  aligns the slot rule with the data, it does not invent a new rule.
- Canon note: no canon doc covers equipment slots (docs/CANON.md manifest
  lists none for equipment/gear). Stated, not invented. The data's
  `weapon.type` field is the source of truth used here, and the one
  explicit-slot precedent in data (godslayer_spear `slot: 'melee'`) agrees.

## The fix (to be implemented AFTER this prereg commits)

`src/js/equipment.js` only — one rule, one place:

1. `isRangedWeapon(def)`: trust `def.weapon.type` when present
   (`'ranged'` → true, `'melee'` → false); fall back to the existing
   range>1 / bow|sling|rifle|pistol|crossbow name rule when `type` is
   absent. Effect on current data: exactly the 5 spears/lance flip from
   ranged to melee; the other 20 weapons classify identically (verified by
   census before the change: every ranged-type weapon has range ≥ 4 and a
   ranged name; every other melee-type weapon has range 1). Update the
   `weapon_split` header comment and the `isRangedWeapon` comment to say
   the type field decides.
2. `migrateEquipment`: replace its inline range/name test with
   `isRangedWeapon(def)`, so legacy `eq.weapon` saves migrate by the same
   rule (a saved spear migrates to melee, not ranged).
3. Nothing else: no volley formula change, no `wb` fold-in change
   (`(melee+ranged)/2` stays), no `mBreak` change, no rounds-cap change,
   no contact-finish change, no gate / price / deed / readyDemand /
   win-price change. The contact finish's `kind: 'spear'` branch
   (fieldFights.js) becomes unreachable for equipped spears by design —
   a spear now arrives as the melee instrument, which the finish already
   prefers first.

Known trade-off, measured not assumed: a fighter carrying BOTH a machete
(bonus 35) and a hunting spear (bonus 30) used to get
`wb = (35+30)/2 = 33` (spear contributing through the ranged slot); after
the fix the machete wins the melee slot, the spear is unequipped, and
`wb = (35+0)/2 = 18`. A bow+spear fighter goes the other way:
`wb = (0+30)/2 = 15`, no volley → `wb = (30+22)/2 = 26` plus the bow's
volley. The before/after wild leg below measures the NET effect on
identical seeds; if the net is negative the run is a NO-GO and the
fallback for the next run is named in the metric review (melee-first
with ranged fallback), not built here.

## Primary metric (binds this run, §14)

**Constructed volley restoration on bow+spear fighters.** A fighter with
crude bow + 4 arrows + hunting spear + 1 from-start ally meets a wave-4
beast at FULL HP through the real `Game.fieldFight` on seeded streams
(same harness as scripts/test-vetfinish-b.js, seed 87104 family):
- Beasts: herald (700 HP) and audit (1200 HP), 30 streams each.
- Primary: volley fires (`rec.volley` non-null with `shots > 0`) on
  ≥ 27/30 streams per beast, AND median volley damage > 0 per beast.
- GO: both beasts pass. NO-GO: either fails.
- Before baseline (pre-existing): `rec.volley` null 6/6 streams
  (vetfinish V2 probe); this run re-measures 0/30 per beast by running
  the new proof test against the unfixed code (git stash) before judging
  the fixed code.

Why the primary is constructed, not wild: the wild pool of bow+spear
carriers is unknown and possibly tiny (the wild volley shape is bow-only
today precisely because the bug hides the mixed shape). A wild-only
primary would risk judging the fix on pool emptiness, not on the
mechanism. The wild leg below is the guard + wall-number report, not the
judge — stated here so a flat wild leg cannot be re-scored as a failure
and a moved wild leg cannot be claimed as the verdict.

## Wild leg (guard + wall numbers, PILOT, 8 seeds before/after)

- Band: **99641–99648 RE-USED** — the grind-a / vetfinish-b measured band.
  NOT fresh and never claimed fresh. Re-use is justified because this IS
  the winnability-chain band with a known volley baseline (60/296 rows).
- Policy: competent, verbatim (scripts/policies/competent.js).
- Horizon: 150d, death-aware (same as grind-a / vetfinish-b).
- Legs: before-leg on the unfixed code (this branch base) via the FS
  driver (scripts/finishersize-driver-20261106.js, OUTDIR
  evidence/2026-11-10/perseed-spearvolley-b, RUN spearvolley-before);
  after-leg (RUN spearvolley-after) on the fixed code, identical seeds.
  Analyzer: scripts/finishersize-analyze-20261106.js.
- Reported per leg (wave ≥ 4 field rows, analyzer population):
  volley-carrying rows (volley non-null, shots > 0) and volley rate;
  field wave-4 kills; below-break meetings / kills; field-fighter deaths
  (vDie); scholar deaths; wave-4 kills all channels; veterans banked
  (peak living veterans per seed + end count, from readiness/veteran
  fields in the per-seed JSON); wave-4/5 unlocks; wave-5 kills; standing;
  rank; median survival.
- Cost bar (scalemetric, binds the GO): starvation deaths
  (teleDeaths cause exactly `'starvation'`) after ≤ before + 2, counted
  BOTH (a) across all teleDeaths and (b) among scholar deaths
  (scholarDeaths `causeArg` matching /starv/i); AND median survival after
  ≥ 0.8 × before median. A cost-bar breach is a NO-GO even if the primary
  passes.
- Confirm leg: a second band (99661–99668, FS pilot band) before/after
  runs ONLY if the wild pilot shows volley-rate movement (≥ +2
  volley-carrying rows) or field-kill movement; otherwise it is not run
  and the reason is recorded (vetfinish precedent: doubling a pool-empty
  wild band doubles the zeros). The pilot GO is on the constructed
  primary, not on the wild band.

## No-regression proof (binds the landing)

- scripts/test-spearvolley-b.js (new): unit leg — `autoEquip` on
  bow+spear (melee spear, ranged bow), spear-only (melee spear),
  bow-only (ranged bow), machete+spear (melee machete, spear
  unequipped), knife still melee, sling/crossbow still ranged; all 25
  weapons classify per their `weapon.type` (explicit-slot overrides
  respected); armor slots unaffected. Engine leg — the constructed
  primary above, plus a spear-only control (volley null, melee spear,
  contact-strike wb 15) and a bow-only control (volley fires, unchanged
  shape).
- scripts/test-spearxbow-20261031.js + its fixture/corpus: UPDATED BY
  DESIGN in the same commit (AGENTS.md green-list rule). That test pins
  the bug as expected behavior (SPEAR S1 ranged==spear, M3 pilot spear
  ranged, volley null 36/36). After the fix the SPEAR tier is
  machete-melee + crude-bow-ranged and volleys: S1/M3 become
  ranged==crude_bow, S2 becomes volley-fired ≥ 0.9, the volley-null
  invariant flips to volley-fired. The fixture's own gate definitions
  (m3, confirm.spear.pass) are updated the same way and the corpus
  (evidence/2026-10-31/perseed-spearxbow-a/fixture-band.json) is
  regenerated under the new slot rule — its anchor is the last commit
  touching src/, so regeneration is required, not optional. The
  ally-spear identity leg (12/12) is expected to hold unchanged: an
  ally carrying only a spear gets wb (0+30)/2 = 15 before and
  (30+0)/2 = 15 after, with no volley either way.
- `node scripts/check.js --quick` after the change; the green list stays
  green. test-gearup-spear-slot-20261012.js (green-listed) is expected to
  pass unchanged (fire-hardened spear routes to melee via slotForItem;
  equippedWeapon reads melee first, bonus still 15). test-combat-matrix
  routes via slotForItem itself, so it adapts; test-buildfund's
  "spear equipped (bonus 30)" reads equippedWeapon, unchanged.

## Balanced panel (§15) and telemetry

- scripts/balance-panel.js runs its own full panel and takes no corpus
  input — it cannot compare a single-leg verification on identical seeds
  (same precedent as grind-a, finishersize-a, adopt-a, vetfinish-b). No
  compare .md is fabricated; the pre-registered comparison is the
  identical-seed FS corpus + the constructed volley rate.
- Telemetry deviation check (scripts/telemetry-check.js, baseline
  .../telemetry-baselines/scale-wall.json, metrics national,table,wins,
  exiled) is attempted on the per-seed corpus; the recorder-corpus
  refusal recorded by grind-a/finishersize-a/vetfinish-b is the expected
  outcome and is recorded as the result, not worked around.

## Guards (all hold)

- No readyDemand, win-price, deed-gate, or gate change of any kind.
- No rounds-cap change (MAX_ROUNDS = 15 untouched), no armor-ignoring
  hits, no mBreak change, no volley formula change, no wb fold-in change.
- Wall numbers reported every leg (national / table / wins, wave 4–5
  unlocks, median survival).

## Metric review (to fill in the evidence)

- (to fill: primary verdict, cost-bar verdict, wild-leg movement, whether
  the machete+spear wb trade-off showed in the wild, confirm-leg decision)
- If the primary passes but the wild leg is flat: the fix is engine-proven
  and field-unmeasurable at this band scale — the finding closes as
  fixed-by-construction, not as a lever failure.
- If the net wild effect is negative: the fallback for the next run is a
  melee-first/ranged-fallback slot rule (spear takes melee when a real
  ranged weapon is present, ranged otherwise) — named here, not built
  here.
