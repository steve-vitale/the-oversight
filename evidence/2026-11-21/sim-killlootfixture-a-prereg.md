# sim-killlootfixture-a — PREREG (frozen)

**Arm:** sim-killlootfixture-a · **Loop A run:** fleshout-20261121T2315Z, arm 3 of 3
**Axis:** scale-onramp · **Type:** FIXTURE (no live-game code change)
**Base master:** `70d9dda36` (worktree `~/workspace/worktrees/sim-killlootfixture-a`)
**Branch:** `sim-killlootfixture-a`
**Frozen:** 2026-11-22 ~00:20 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + finding #2649)

The kill-loot bundle pilot (sim-killlootbundle-a, evidence/2026-11-21/
sim-killlootbundle-a.md) was INCONCLUSIVE: 0 kill-loot searcaster
arrivals on either leg of the 8-seed pilot (107261–107268), so the frozen
zero-arrival rule fired. Mechanism PROVEN (proof test 12/12:
KILLBUNDLE=1 bundles exactly 2 cells on a forced searcaster drop, 0
when off, 0 for non-searcaster). The "reaches a fight" half is UNJUDGED
— both legs trajectory-identical. Finding #2649's next step, verbatim:
"16-seed band (P(≥1 arrival) ≈ 88%) or a forced-arrival fixture (stub
rollAlienLoot → searcaster, then a wave-4 door fight) — the fixture is
recommended first, it answers the volley question directly."

This arm builds the recommended fixture FIRST. No live-game code
change: KILLBUNDLE stays env-gated default-OFF; the fixture runs with
KILLBUNDLE=1 (arm) vs unset (control).

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read; docs/MONSTER-WAVES.md (wave-4 "Mirror
  Draft": Standing ≥ 100 gate, HP 850–1500, damage 35–95, pierce
  0.2–0.5; wave-4 door = the standing/readiness-gated entry to wave 4).
  **No canon doc covers the kill-loot bundle** — the 2-cell bundle shape
  is taken from the contest-prize code, as in the killlootbundle-a
  prereg §2. The fixture stages a wave-4 *fight* (fieldFight against a
  wave-4 mdef), not the standing gate itself — the gate is already
  measured open elsewhere; the question here is only whether a bundled
  kill-loot gun fires once it exists.
- `villagerKillLoot(vid, mdef)` (game.js): `rollAlienLoot(mdef,
  { id: vid })` → pushes the drop direct to the killer's `person.items`;
  with KILLBUNDLE=1 and a `'searcaster'` roll it also pushes 2
  `fusion_cell` entries to the same holder. Adds zero RNG draws.
- Volley (`fieldFights.js` fieldFight, ~:960–1081): before round 1, a
  ranged weapon + real ammo opens the fight — shots = min(ammo,
  clamp(1+floor(range/monster speed),1,4)); each shot costs 1 ammo;
  hit chance 0.85−0.06×range; damage lroll([4+wbR,8+wbR]) with wbR =
  round(rangedBonus/2). Searcaster: bonus 120 → wbR 60 → 64–68 dmg
  per hit; range 8. CELLGATE holds fire only when `wave < 4` and
  CELLGATE=1 — a wave-4 mdef fires. `rec.volley = { shots, hits, dmg,
  ammoLeft }` records it; `rec.log[]` is the fight transcript.
- Gear-up: fieldFight calls `villagerGearUp(vid, false)` at entry —
  re-equip only, no acquisition — so a searcaster carried in items is
  equipped as the ranged weapon before the volley is computed.
  (Setup gate below asserts the equipped weapon is the searcaster
  before the fight is judged.)
- Monster: `'herald'` (wave 4, HP 700–900, damage 30–50, speed 3) —
  the weakest wave-4 mdef in `src/data/monsters.json`, chosen so the
  holder + party have a real chance of standing through the fight.
  `m = null` (ephemeral meeting, per fieldFight's own contract).
  Party: holder + 2 living roster allies via
  `opts = { allies: 2, allyVids: [a1, a2], allyFromStart: true }` —
  a real party (PARTYSIZE4 substrate), so `intent` is 'engage' and
  party morale, not a lone villager, judges the fight. A lone
  villager vs a wave-4 beast is a death, not a test.
- Sense note (code-read, to be checked against the transcript):
  the volley log line reads "nocks an arrow" even for a searcaster
  (fieldFights.js ~:1058). A gun firing arrows is a narration gap
  to report, not a fixture failure.

## 3. Fixture spec (frozen)

Script: `scripts/test-killlootfixture-a.js` (extends the 2015Z
killlootbundle proof test + analyzer helpers; does not rebuild them).
One leg = one process; the script reads its mode from env:

- `CELLGATE=1` both legs (the hold logic is live; wave 4 → no hold).
- Arm leg: `KILLBUNDLE=1`. Control leg: `KILLBUNDLE` unset.
- Seed 7 (`loadGame({ seed: 7 })` + `setupGame`), same as the
  killlootbundle proof test. Math.random is seeded BEFORE eval by the
  harness; no second harness runs in the process.
- Holder: first living roster villager (not the scholar), as in the
  proof test. Allies: the next two living roster villagers.
- Staging: save `origRoll = Game.rollAlienLoot`; set
  `Game.rollAlienLoot = () => 'searcaster'`; call
  `Game.villagerKillLoot(holder, { wave: 4, id: 'fixture-beast' })`;
  snapshot-diff the holder's guns/cells (driver's `snapshotGunCells` /
  `diffGunCells`); restore `Game.rollAlienLoot = origRoll`
  IMMEDIATELY after staging, before the fight.
- Setup gate (judged only if it passes; a failure is a fixture
  defect, NOT a verdict): pre-fight, the holder's equipped ranged
  weapon is `'searcaster'` (via the driver's `rangedKitOf`) AND
  holder cells === 2 (arm) / === 0 (ctl). If the gate fails, the run
  stops, reports the gate failure, and no bar is scored.
- Fight: `Game.fieldFight(holder, heraldMdef, null,
  { allies: 2, allyVids: [a1, a2], allyFromStart: true })`.
- Captured per leg (canonical JSON, written to
  `evidence/2026-11-21/killlootfixture-a-<mode>.json`):
  holder + ally ids, drop id, cells-at-arrival, pre-fight equipped
  weapon + cells, `rec.volley`, `rec.outcome`, `rec.rounds`,
  `rec.mDealt`, `rec.vHpLeft`, `rec.mHpLeft`, holder alive at end,
  holder HP before/after, cells after the fight, full `rec.log[]`
  transcript, stub-restored flag, instrument errors.
- Determinism re-run: each leg is run twice as separate processes
  with identical env; the judged fields must be byte-identical.

## 4. Definitions (frozen)

- **Cells-at-arrival:** the snapshot-diff `cellsGained` on the holder
  in the same `villagerKillLoot` call that returns `'searcaster'`.
- **Kill-loot volley:** the fixture fight's `rec.volley` with
  `shots > 0` while the holder's equipped ranged weapon is
  `'searcaster'` and the holder received the kill-loot searcaster
  earlier in the same process (arm leg). Control-leg volleys are
  counted the same way (the gun is dry, so any volley would be a
  defect in the control).
- **Holder intact:** holder alive (`!person.dead` and village health
  > 0) at fight end. RECORDED, not GO-gating (see §6 bar 5 note).
- **Instrument errors:** any exception or failed assertion inside
  the fixture's own wraps/checks (0 required).

## 5. Band freshness (local_seed_band_freshness skill)

- **Fixture seed: 7** (proof-test seed; a staged fixture, not a band).
- **16-seed band (only if the fixture GOes and time permits):
  107281–107296.** Grepped every prereg under
  `evidence/*/sim-*-prereg.md` for the standalone tokens 107281–
  107296 (no hits); grepped `evidence/*/sim-*.md` for the same
  tokens (no hits); grepped the goal `hidden_files/sim-findings.md`
  and `hidden_files/convergence-tracker.md` for the same tokens (no
  hits). Nearest used bands: 107261–107268 (killlootbundle-a pilot),
  107237–107248 (grantrate / shelterdraft). Forbidden bands from
  prior briefs (106751–106766, 107221–107228, 107191–107198,
  107131–107138, 107111–107118, 107091–107098, 107081–107088,
  107051–107058, 107021–107028) do not overlap 107281–107296.
  **Band FRESH.**

## 6. Frozen bars (judge: the fixture script on both legs + determinism re-runs)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Arrival** — arm cells-at-arrival === 2 on the same holder as the gun; ctl cells-at-arrival === 0 | both must hold |
| 2 | **PRIMARY — volley** — arm kill-loot volleys ≥ 1 (shots > 0); ctl kill-loot volleys === 0 | both must hold for GO |
| 3 | **Determinism** — arm re-run byte-identical on judged fields (volley, cells, outcome, rounds, mHpLeft, vHpLeft); ctl re-run byte-identical | both must hold |
| 4 | **Neutrality** — `rollAlienLoot` stub restored after staging (identity check) in both legs; pre-fight arm/ctl snapshots differ ONLY in holder fusion_cell count (+2 arm); 0 instrument errors | all must hold |
| 5 | **Holder fate (REPORT, not GO-gating)** — holder alive at fight end, recorded. If the holder dies AFTER firing (volley landed, death by monster damage in rounds), the volley verdict stands and the death is reported + metric-reviewed: a wave-4 door fight is a hard fight and a post-volley death does not un-fire the gun. If the holder dies BEFORE any volley could fire (setup failure), bar 2 already fails. | recorded |
| 6 | **Instrument validity** — proof test `scripts/test-killlootbundle-a.js` still 12/12 on this base (re-run before the fixture); analyzer `--selftest` 17/17; KILLBUNDLE lever code present in game.js `villagerKillLoot` (source check, script stops if absent) | all must hold |

GO = bars 1–4 and 6 pass (bar 5 recorded). GO means: a bundled
kill-loot gun arrives with ammo and fires in a real wave-4 fight,
while the dry control gun does not, deterministically and without
the fixture perturbing anything but the bundle. NO-GO = bar 2 fails
with bar 1 passing (the gun arrives bundled but never reaches a
fight even when forced — the mechanism named in the evidence).
A miss is NO-GO, never re-scored against a friendlier metric
mid-run (§14). The revert rule applies to NO-GO only; this fixture
changes no live-game code, so there is nothing to revert — a NO-GO
leaves the lever env-gated default-OFF as it stands.

## 7. Optional 16-seed band re-judge (only if the fixture GOes and time permits)

- Same instrument as the pilot: `scripts/killlootbundle-driver-a.js`
  + `scripts/analyze-killlootbundle-a.js --compare` +
  `scripts/build-killlootbundle-panels-a.js` + `scripts/balance-panel.js
  compare` (§15). Band 107281–107296 (fresh, §5), horizon 150d
  death-aware, competent verbatim, substrate identical to the pilot
  (`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`).
- Bars: the pilot prereg §6 bars 1–5 unchanged, including the frozen
  zero-arrival rule (both legs 0 arrivals → INCONCLUSIVE, not GO,
  not NO-GO). GO additionally requires the fixture's bar 2 to have
  passed first.
- Wall numbers recorded per leg: wins, national, table, wave 4–5
  unlocks, median survival.
- If time does NOT permit, the band is recorded as the next blank
  with the fixture as its justification — not run, not faked.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** re-run `node
  scripts/test-killlootbundle-a.js` (expect 12/12) and `node
  scripts/analyze-killlootbundle-a.js --selftest` (expect 17/17)
  on this base. Proceed on green, not on any fixture count.
- **Fixture (judged):** `CELLGATE=1 node
  scripts/test-killlootfixture-a.js` (ctl) then `CELLGATE=1
  KILLBUNDLE=1 node scripts/test-killlootfixture-a.js` (arm),
  each twice (determinism re-runs). Outputs to
  `evidence/2026-11-21/killlootfixture-a-<mode>.json` (+
  `-rerun.json` for the determinism copies).
- **Sense-test (judged reading, not a count):** read the arm leg's
  `rec.log[]` transcript; judge whether the holder's gun use reads
  as a person fighting (naming, ammo honesty, volley→melee
  continuity), and note the "nocks an arrow" line if present.
- **Optional band (judged, only per §7).**
- **Canon:** docs/MONSTER-WAVES.md (wave-4 door fight); no canon
  doc covers the kill-loot bundle — the bundle shape is code-derived
  (see §2), said here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
