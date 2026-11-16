# sim-ammocensus-a — PREREG (binding)

Run: fleshout-20261116T0315Z (Loop A), axis scale-onramp, arm
sim-ammocensus-a (DIAG — ammo census at wave-4 meetings).
Branch `sim-ammocensus-a`, worktree
`~/workspace/worktrees/sim-ammocensus-a`. Base at arm start:
`6ca37144b` (master tip at arm start; includes the vetparty
evidence-only landing, the grecorder landing, and the r218
succession/deepening work).
Binding prereg: THIS file — frozen before any judged sim. The
instrument, analyzer, and proof test are built AFTER this
commit; no judged numbers exist yet.

## The question, in plain words

Villagers walk into the hardest fights in the game carrying a
bow they cannot fire. The vetparty-a armed corpus quotes it
twice in the fight logs — "Koki has Crude bow but no arrows —
the string stays drawn, useless" (seed 100825 day 143, strike,
the launched pair's fight) and "Devon has Sling but no arrows"
(seed 100827 day 104, reunion, Devon dead in two rounds).
An armed villager whose ranged weapon has no ammunition fights
effectively unarmed at range — while counting as armed for the
gate's all-armed bar. This arm measures, for every wave-4
meeting in a fresh 8-seed corpus, how often that is true, and
whether the gate's all-armed bar counted ammo-less fighters
as armed.

## Prior art (read before building)

- Finding #2405 (2026-11-15, this arm's claim): the two
  vetparty quotes above; "needs a targeted check: how often
  'armed' villagers carry ammo-less ranged weapons, and
  whether the gate should count them."
  (`evidence/2026-11-15/sim-vetparty-a.md` § Sense-testing;
  corpus `evidence/2026-11-15/perseed-vetparty-a-on/`.)
- Finding #1486 (2026-10-30, sim-expaware-a): "wave-4
  fighters repeatedly enter with bows/crossbows/slings but no
  arrows — honest reporting, ammo-supply gap echo; a future
  arm should census arrow carriage at wave-4 meetings before
  claiming ranged capability."
- Finding #2064 (2026-11-10, sim-wave5face-b): the same line
  for four different fighters (Salvador, Jesse, Chloe, Miguel
  with a crossbow) at wave-5 face.
- Finding #2123 (sim-fightplay-b): 250/509 fights with no
  ranged weapon; 94 with a ranged weapon but no ammo; 59 with
  the wrong ammo type. Only 106 fights had any ammo at
  contact.
- sim-volley-a (2026-10-26, DIAG-GO): 1179 field fights, the
  volley fires 0 times; bow-no-ammo 389; carried ammo 0/1179
  at fight time. The volley is the bow's whole identity and
  it never happens.
- sim-ammostorage-a (2026-10-26, DIAG-GO): the storage-level
  census — whether arrows sit in village storage and never
  reach a fighter's pack — is ALREADY measured. This arm does
  NOT re-measure storage; it censuses the fighter at the
  meeting and the gate's count of that fighter.
- sim-ammo-a (2026-10-31): dawn home top-up lever killed
  (NO-GO). sim-arroworigin-a (2026-10-27): the village arrow
  economy is one single arrow, never carried. sim-spearxbow-a
  (2026-10-31): a spear takes the ranged slot, so a carried
  bow is never equipped and the volley requires a ranged
  weapon WITH an ammo field.
- Finding #1592 (sim-supply-b): a dry sling is narrated as
  missing arrows — the line is honest that the weapon cannot
  fire but names the wrong ammunition. Cosmetic wording, not
  chased here; this arm records which ammo type each dry
  weapon actually needs, so the mislabel rate is visible.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500, pierce
  0.2–0.5; readiness wave 4: 3 armored P≥10, **5 armed**,
  3 tricks, 1 wave-3+ killer — the ARMED bar this census
  interrogates, not changes). Wave 5 "The Producers"
  (standing ≥ 200 AND wave-4 faced). Doc drift noted: the
  doc lists 9 wave-4 monsters; the data has 10 (herald).
- Gear/ammo rules (read in code, no canon doc covers them —
  stated here, not invented): a ranged weapon def carries
  `weapon.ammo` (`sling`→stone, `crude_bow`/`bow`/
  `starfall_bow`/`apex_bow`→arrow, `crossbow`→bolt,
  `phase_sling`→stone, `searcaster`→fusion_cell;
  `src/data/items.json`); the field volley
  (`src/js/fieldFights.js`, volley block) counts the fighter's
  own ammo by itemId/material identity and fires 0 shots
  when the count is 0, logging "has <name> but no arrows —
  the string stays drawn, useless."; the gate's ARMED bar
  (`src/js/win-plan.js` `gearOf`, used by
  `winPlanFightGate`) counts a fighter armed when
  `weaponBonusOf > 0` OR they carry any item with
  `def.weapon` — **ammunition is never checked**. That is
  the gap this census measures, not a claim about intent.

## The instrument (frozen design — DIAG, no game change)

**NO game-code change. NO default flipped. NO balance
lever.** The recorder wraps `Game.fieldFight` and
`Game.winPlanFightGate` at runtime from the driver (the
vetparty pattern): pure reads plus writes to driver-local
arrays — no game-state writes, no RNG draws, no method
replacement in `src/`. Neutrality is proven, not assumed,
by the determinism legs (below).

New files only (never overwrite the vetparty instrument):
- `scripts/ammocensus-driver-20261115.js` (driver + recorder)
- `scripts/analyze-ammocensus-a.js` (analyzer)
- `scripts/test-ammocensus-a.js` (proof test)
- `evidence/2026-11-15/perseed-ammocensus-a/` (corpus)
- `evidence/2026-11-15/sim-ammocensus-a.md` (evidence)
- `evidence/2026-11-15/ammocensus-a-analysis.json`

The vetparty driver (`scripts/vetparty-driver-20261115.js`),
analyzer, and T-class instrument
(`scripts/vetfirst-instrument-20261111.js`) are READ-ONLY
reference; the vetfirst instrument is reused unmodified for
daily snapshots (wall numbers, ready4/ready5, waveKillLog)
exactly as the vetparty arm ran it. No file the sibling arm
sim-dawnbid-a needs is touched: this arm writes only
`ammocensus-*` names and its own corpus directory.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; re-read live by the driver so a stale roster
  refuses silently): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald` (10; the data rules over
  the doc's 9).
- **A wave-4 MEETING** is one `fieldFight` call with a
  wave-4 `mdef` (villager-side field fight, including aid
  fights that route through `fieldFight`). The scholar's
  turn-based fights are NOT meetings — the finding is about
  villagers, and the gate bar is villager-side. A meeting is
  FULLY CLASSIFIED when the fighter and every ally present
  (opts.allyVids plus a called-help allyVid) each carry a
  classification (below) and the meeting carries its gate
  snapshot (the most recent `winPlanFightGate` row for that
  vid, or explicit null when no gate call preceded it).
- **Fighter classification at a moment** (computed by pure
  reads, the volley's own identity rule — itemId/material
  match, units summed):
  - `rangedWeapon`: the equipped ranged weapon
    (`S.equipment.rangedWeaponOf`, `eq.ranged`) whose def
    has `weapon.type === 'ranged'` AND a `weapon.ammo`
    field; its `ammo` id and the fighter's units of it
    (`ammoN`). A spear in the ranged slot (melee type,
    range 2, no ammo field) is NOT a ranged weapon — it is
    recorded separately as `spearInRangedSlot`.
  - `meleeWeapon`: equipped melee (`eq.melee`/`eq.weapon`)
    or any carried item with `def.weapon` and
    `weapon.type !== 'ranged'`.
  - `carriesRangedUnequipped`: a ranged weapon with an ammo
    field carried in the pack but not equipped, with its own
    ammo count (the gate counts pack weapons as armed; the
    volley cannot fire them — recorded, not judged).
  - Classes:
    - `armed-with-ammo`: equipped ranged weapon with
      `ammoN >= 1`.
    - `armed-no-ammo`: equipped ranged weapon with
      `ammoN === 0` (sub-field `otherAmmoN`: units of any
      ammo-class item held — the wrong-ammo shape from
      #2123 — and `ammoNeed`: the weapon's ammo id, so the
      dry-sling mislabel is visible).
    - `unarmed`: no equipped ranged weapon (sub-fields:
      `hasMelee`, `spearInRangedSlot`,
      `carriesRangedUnequipped`).
- **Gate-armed (the gate's own rule, replicated):**
  `gearOf` — armed iff `weaponBonusOf > 0` OR carries any
  item with `def.weapon`. Ammunition is never consulted.
- **Effectively-armed (ammo-aware):** has a melee weapon
  OR (equipped ranged weapon with `ammoN >= 1`). A fighter
  whose ONLY weapon is a dry ranged weapon is NOT
  effectively armed — they fight unarmed at range and have
  no melee to fall back on.
- **Gate OVER-COUNT (per gate row):** the gate's party
  (ret.party) has `allArmed === true` under the replicated
  `gearOf` rule while at least one party member is NOT
  effectively armed. Per-row fields: `gateAllArmed`,
  `ammoAwareAllArmed`, `overCounted` (vids), and
  `overCountedDryOnly` (vids whose only weapon is dry
  ranged). The headline rate is the share of gate rows with
  `gateAllArmed === true` that over-count at least one
  member, and the share of fighters the gate counted armed
  who were ammo-less (dry-only).
- **A meeting is UNCLASSIFIED** if any fighter/ally present
  lacks a classification (missing person record, recorder
  error, or a gate snapshot that cannot be attached). The
  100% bar counts meetings, not fighters: 0 unclassified
  meetings in the corpus.
- **Instrument error:** any non-empty `instrumentErrors`,
  any per-seed file failing to parse, any seed whose
  wave-4 meeting count disagrees between the encounter rows
  and the gate rows in a way the analyzer cannot reconcile
  (a meeting with no gate row is explicit null, not an
  error — wild meetings often have none).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot (only leg): **100861–100868** (8 seeds), 150d,
  death-aware, policy competent verbatim.
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands), 100821–100828
  (vetparty pilot), 100841–100856 (vetparty confirm,
  reserved).
- Freshness check (2026-11-16, before this commit,
  re-verified by this arm — not taken on the coordinator's
  word): zero hits for `10086[0-9]` and for each exact seed
  100861–100868 in (a) all `*.md` under `evidence/`
  (every dated prereg, evidence file, and note), (b) all
  `*.md` under the goal `hidden_files/` (tracker, claims,
  findings, convergence notes), (c) per-seed filenames
  under `evidence/2026-11-15/perseed-*/`, and (d) `scripts/*.js`
  (driver band literals). The broad `grep -r` over all of
  `evidence/` returns decimal-fragment false positives only
  (e.g. `14796.466210086763` inside old October pantry-ledger
  JSON floats) — no `.md` hit and no seed reference. The
  band is fresh.
- **Shared with sibling arm sim-dawnbid-a:** the same 8
  seeds 100861–100868, which is also a neutral recorder.
  Sharing is safe by construction: separate worktrees,
  separate processes, separate corpus directories, no game
  change on either side; identical seeds make the two
  corpora comparable. Noted here so the coordinator can
  sequence merges (this arm touches no file the sibling
  needs).

## Horizon, policy, death-awareness, instrument

- Horizon 150 days, death-aware (dead villages stop
  simulating), policy **competent verbatim**
  (`scripts/policies/competent.js`, sha256 `74a890f0844e`
  — verified on this tree at prereg time, the same hash
  the vetparty arm ran under). The standing fix marker
  (`ROSTER CHECK`) is present in `src/js/standing.js` on
  this tree.
- Driver: `scripts/ammocensus-driver-20261115.js` (new).
  ONE driver, ONE leg (the instrument tip): it runs the
  vetfirst T-class instrument (daily snapshots) AND the
  wave-4 ammo census recorder (wraps `fieldFight` wave-4
  only and `winPlanFightGate` wave-4 only; per-seed rows
  `w4meetings`, `w4gates`). The driver refuses to overwrite
  an existing per-seed file. Recorder wraps are pure reads
  plus writes to driver-local arrays.
- Analyzer: `scripts/analyze-ammocensus-a.js` (new).
  Computes the per-meeting census table, the pooled
  classification shares, the gate over-count rates, and
  the wall numbers from the T-class snapshots.
- **Determinism legs (the neutrality proof, run BEFORE
  the judged corpus):** seed 100861, 60d, competent —
  (a) recorder ON, (b) recorder OFF (driver flag
  `RECORDER=off` installs no wraps), (c) recorder ON again.
  Neutral iff (a) ≡ (b) ≡ (c) on days, endReason, deaths
  (day/kind/who/cause), waveKillLog entries, and standing;
  and (a) ≡ (c) on the recorder rows themselves. Any
  divergence is a loud failure: the recorder is not
  neutral, the corpus does not run.
- Proof: `scripts/test-ammocensus-a.js` (new; see below).
  GREEN before the corpus runs.

## Primary metric + GO bar (frozen)

Primary metric: **share of wave-4 meetings fully
classified, and the ammo-less share among fighters counted
"armed" by the gate.**

GO (instrument validity) iff ALL hold:

1. **100% of wave-4 meetings in the corpus classified**
   (0 unclassified meetings).
2. **Corpus 8/8 files parse** (all 8 per-seed JSON files
   valid, with the expected top-level rows).
3. **Neutrality proven** (determinism legs green —
   recorder changes no trajectory).
4. **Proof test `scripts/test-ammocensus-a.js` green.**

This is a DIAG: there is no lever, so there is no lever GO /
NO-GO. A GO here means the census numbers are trustworthy
and the evidence merges. A failure on any bar means the
instrument is fixed and re-proven before any number is
reported — no partial census is published.

**Secondary (reported, not judged):** per-meeting
classification shares (armed-with-ammo / armed-no-ammo /
unarmed, fighter + allies separately); ammo-less share
among gate-counted-armed fighters; gate over-count rate
(rows and fighters); volley outcomes per meeting
(shots/hits/dmg, "no arrows" line count); dry-weapon ammo
needs (bow/arrow, crossbow/bolt, sling/stone) and the
wrong-ammo share; the two vetparty quotes re-found or not
in the fresh corpus; wall numbers (national / table / wins,
wave-4/5 unlocks, median survival).

## Per-seed table (evidence file)

Per seed: days survived, endReason, standing, maxWave,
wave-4 meetings, meetings fully classified, fighters
classified by class, gate rows, gate rows with
gateAllArmed true, over-counted rows, over-counted
fighters, volleys fired, "no arrows" lines. Plus pooled
rows: classification shares, ammo-less share among
gate-counted-armed, gate over-count rates, and the wall
numbers.

## Proof test

`scripts/test-ammocensus-a.js` proves, on synthetic
fixtures and a live in-memory run (no corpus numbers):

- Static: the driver/analyzer files exist under the
  `ammocensus-*` names; no `src/js/` file is modified by
  this arm (git diff over src/ is empty); the wave-4 id set
  matches `src/data/monsters.json` wave 4 exactly (10 ids).
- Unit: the classifier returns armed-with-ammo for a bow
  with arrows, armed-no-ammo for a bow with 0 arrows (and
  records ammoNeed `arrow`, otherAmmoN 0), armed-no-ammo
  with wrong ammo (bow + stones: ammoN 0, otherAmmoN > 0),
  armed-no-ammo for a dry sling (ammoNeed `stone` — the
  #1592 mislabel is visible, not repeated), unarmed for no
  ranged weapon (with hasMelee true when a melee weapon is
  carried), spear-in-ranged-slot recorded, not counted as
  ranged.
- Unit: effectively-armed is false for a dry-bow-only
  fighter, true for a dry bow + melee fighter, true for a
  bow with arrows; gate-armed (gearOf replica) is true for
  all three — the over-count is exactly the dry-only case.
- Unit: the gate over-count detector flags a gate row whose
  party is all gate-armed with one dry-only member, and
  passes a row where every member is effectively armed.
- Judge: the frozen GO bars implemented on fixtures
  (100% classified + 8/8 parse + determinism green +
  proof green = GO; any bar failing = NOT-GO).
- Recorder: synthetic fixtures for the two recorder rows
  (meeting row carries fighter + ally classifications and
  the gate snapshot; gate row carries per-member gear,
  gateAllArmed, ammoAwareAllArmed, overCounted).
- Determinism: the leg runner itself is exercised (seed
  100861, 20d, recorder on vs off — identical trajectories
  on the compared fields).

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`w4meetings[].log`) for 2–3 wave-4 fights and judge
whether the narration is honest about ammo-less ranged
weapons: does a dry bow read as useless (the honest line),
does a dry sling get mislabeled as missing arrows (#1592),
does a fighter with no ranged weapon get credited with a
bow (the contactfinish lie class)? Name the fight lines'
source (seed, day, fighter, monster) and the counts
searched. Re-find or fail to re-find the two vetparty
quotes in the fresh corpus and say so. Do not invent fight
narrative from kill counts.

## Metric review (to be filled in the evidence file)

Pre-registered here: the metric is the instrument's own
validity, not a lever effect. If the corpus holds few
wave-4 meetings (fewer than the vetparty corpus's 116
armed-leg encounters), the review will say whether the
census is still powered (meetings per seed) or whether the
band under-samples wave 4. If meetings exist but no gate
row precedes most of them (wild meetings with no gate
call), the review will say the gate over-count rate is
measured on the gated subset only, and name its size. If
the classifier's "unarmed" class is dominated by
melee-armed fighters, the review will say the class name
overstates the gap and propose splitting it (melee-armed
vs truly unarmed) for the NEXT run — never re-scored
mid-run. No metric revision is proposed now; the
instrument stands as frozen.
