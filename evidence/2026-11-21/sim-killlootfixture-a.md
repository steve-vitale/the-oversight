# sim-killlootfixture-a — KILL-LOOT forced-arrival fixture + 16-seed re-judge

- Arm: sim-killlootfixture-a (FIXTURE), Loop A run fleshout-20261121T2315Z, arm 3 of 3.
- Base: worktree HEAD `70d9dda36`; branch `sim-killlootfixture-a`.
- Prereg: `evidence/2026-11-21/sim-killlootfixture-a-prereg.md` (committed
  `dde89606c`, frozen ~00:20 UTC 2026-11-22, before any judged run).
- Instrument commit: `dde89606c` (prereg + fixture script
  `scripts/test-killlootfixture-a.js`). Instrument corrections after the
  freeze (see §6): gear-up-before-read, holder-alive read, FIGHTALLY2
  gate — bars unchanged, no judged verdict was written before the
  corrections.
- No live-game code change in this arm. KILLBUNDLE stays env-gated,
  default OFF, exactly as the pilot left it.
- Horizon (fixture): staged single fight, seed 7. Horizon (band):
  150d death-aware. Seeds (band): 107281–107296 (fresh, verified).
  Policy: competent (verbatim). Substrate (both legs, fixture and
  band): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`
  (fixture legs additionally differ only in `KILLBUNDLE`).

## Verdict: FIXTURE GO — the bundled kill-loot gun reaches a fight and fires

**The "reaches a fight" half is now judged.** The forced-arrival
fixture stages exactly what the pilot could not observe: a kill-loot
searcaster drops (rollAlienLoot stubbed → `'searcaster'`), the bundle
lands (2 cells, same holder as the gun), and the holder + a 2-ally
party fight a wave-4 Herald. Arm leg: **2 shots fired** from the
bundled gun before round 1 (cells 2 → 0, honestly spent); control
leg: **0 shots** — the dry gun says "has Searcaster but no fusion
cells — the string stays drawn, useless." All five frozen bars pass
on the corrected instrument; determinism re-runs are identical on
every judged field; the fixture perturbs nothing but the bundle
(neutrality diff empty). The holder stands through the fight on
both legs (arm 44 HP left, ctl 61 HP left) and lands the killing
blow. Finding #2649's fixture question is answered: **GO**.

The honest nuance: both volley shots MISSED (hit chance 0.37 each
at range 8; P(0/2) ≈ 40% — an ordinary outcome, not a fluke). The
bundle's cells bought a volley that dealt 0 damage; the kill came
from the gun's melee fold-in (the holder strikes 64–68/round with
the searcaster in hand, allies 4–8). So the bundle fires — but on
this draw the volley itself changed nothing. The supply reaches the
fight; whether it matters is a hit-chance story, not a supply story.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Arrival (arm cells === 2 same holder, ctl === 0) | both must hold | arm 2, ctl 0; same holder `gen_v5jnyte`, 1 gun each leg | ✅ |
| 2. PRIMARY volley (arm ≥ 1 shot, ctl === 0) | both must hold for GO | arm 2 shots, ctl 0 shots | ✅ |
| 3. Determinism (re-runs byte-identical on judged fields) | both must hold | ctl rerun ≡ ctl, arm rerun ≡ arm (volley, cells, outcome, rounds, mHpLeft, vHpLeft) | ✅ |
| 4. Neutrality (stub restored; pre-fight arm/ctl differ only in holder cells +2; 0 instrument errors) | all must hold | stub restored both legs; neutrality diff empty; errors 0/0 | ✅ |
| 5. Holder fate (REPORT, not GO-gating) | recorded | holder alive both legs — arm vHpLeft 44, ctl vHpLeft 61 (corrected party-of-3 runs; first-pass misread reported dead, see §6) | recorded |
| 6. Instrument validity (proof 12/12 + selftest 17/17 + KILLBUNDLE present) | all must hold | proof 12/12 re-run; selftest 17/17 re-run + inline in compare; lever present both legs; setup gates passed | ✅ |

## 1. The fixture — both legs (seed 7, Herald, party of 3)

| Field | Ctl (KILLBUNDLE unset) | Arm (KILLBUNDLE=1) |
| --- | --- | --- |
| Holder | `gen_v5jnyte` ("the man in his 40s, with a long braid") | same |
| Allies | `gen_39chf6i`, `gen_4u8b7cv` | same |
| Monster | Herald, wave 4 (HP 700–900, dmg 30–50, speed 3) | same |
| Drop | `searcaster` | `searcaster` |
| Cells at arrival | 0 | **2** |
| Guns at arrival | 1 | 1 |
| Equipped pre-fight | searcaster | searcaster |
| Volley | 0 shots, 0 hits, 0 dmg, 0 cells left | **2 shots, 0 hits, 0 dmg, 0 cells left** |
| Outcome / rounds | vKill / 11 | vKill / 11 |
| Party size / allies joined | 3 / both | 3 / both |
| Holder HP at end (vHpLeft) | 61 | 44 |
| Holder alive | yes | yes |
| Cells after fight | 0 | 0 |
| Stub restored | yes | yes |
| Instrument errors | 0 | 0 |

(Corrected party-of-3 runs supersede the first-pass runs; see §6.
The compare verdict above is computed on the corrected runs only.)

## 2. Sense-test — the transcripts read as people fighting, with two narration gaps

Arm opening (verbatim): "the man in his 40s, with a long braid sees
the sky coming and nocks an arrow — the fight opens at range
(2 shots)." Then twice: "loosed wide — the arrow buries itself in
the dirt. (spent)" and "lowers the bow — the sky is on them now.
(0/2 hit)". The fight itself reads as a real party fight: both
allies charge in ("already at the door — charges in"), armor absorbs
("gear absorbs 23/32/36..."), the committed-finish beats land
("holds — the sky is two blows from falling"), the Herald holds its
ground twice ("wounded past its line — and holds its ground. It is
not leaving. (Committed)"), and the holder finishes it at R11.
Nobody stands around; nobody repeats a line; the holder's 64–68
strikes vs the allies' 4–8 make the gun-holder the party's spearhead
and the allies the flanks — legible, human, tense.

Two gaps, both narration, neither a fixture failure:

1. **The gun fires arrows.** The whole volley is bow language —
   "nocks an arrow", "loosed", "lowers the bow" — for a fusion-cell
   gun. The control leg's dry-gun line is honest about the constraint
   ("has Searcaster but no fusion cells") but still says "the string
   stays drawn". A searcaster volley should read as a gun: trigger,
   discharge, cells spent. Filed as a finding (see §8).
2. **"The sky" is the Herald.** The beast is called "the sky"
   throughout ("sees the sky coming", "The sky is wounded past its
   line"). This is correct knowledge-gating, not a bug: the herald's
   `unknown` descriptor is "the sky, with a face in it", and
   monsterNoun truncates at the comma, so an unnamed Herald IS "the
   sky" to a village that has never named it. It reads oddly in a
   kill line ("The sky is wounded") but it is the engine telling the
   truth about what the fighters know. Noted, not filed as a defect.

## 3. The 16-seed band re-judge (prereg §7) — NOT RUN, recorded as the next blank

The band was STARTED (ctl leg, seeds 107281–107296) and then stopped
by coordinator decision, not by a verdict: the driver runs ~2.7
min/seed under current machine load (seed 107281: 160s; 107282:
166s), so both legs (32 seed-legs) would need ~85 min of compute —
beyond this run's remaining window. Per prereg §7, the band is
recorded as the next blank with the fixture as its justification,
not run and not faked.

Partial ctl data (UNJUDGED smoke — no arm leg, no compare, no
verdict drawn): seed 107281 survived 150d, wave 5, standing 370,
regional, 0 kill-loot searcasters, 0 searcaster volleys; seed 107282
survived 150d, wave 5, standing 475, regional, 0 kill-loot
searcasters, 0 searcaster volleys. Files:
`evidence/2026-11-21/perseed-killlootfixture-a-ctl/killlootbundle-a-s107281-killlootfixture-a-ctl.json`
and `...-s107282-....json`. A future band run must use a fresh RUN
id (the driver refuses to overwrite existing seed files) or a fresh
OUTDIR.

Wall numbers from the partial ctl smoke (2 seeds, NOT a band
verdict): wins 0/2, national 0/2, table not instrumented, wave 5
2/2, wave 4 2/2, median survival 150d. The scale wall still binds
on this substrate — no national, no wins — but n=2 smoke proves
nothing; the fixture, not the band, is this arm's verdict.

## 4. Wall numbers

Fixture: not a band — no wall numbers (no wins/national/table to
count from a staged fight). Band: not run (see §3); the only wall
data is 2 seeds of unjudged ctl smoke (wins 0/2, national 0/2, wave
5 2/2, median survival 150d).

## 5. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof test 12/12, analyzer selftest
  17/17, both re-run on this base before any judged run. Green.
- **Write-flap / host:** `git status` on this worktree times out
  (>280s, exit 124) — the 15 MB index under load ~15 makes a full
  restat pathological; the main tree's status returns in <20s.
  Worktree cleanliness was verified by mtime scan (nothing modified
  after checkout) + pathspec diff (game.js clean) + the write probe
  (`git update-ref refs/heads/probe HEAD`, OK, ref deleted after).
  safe-commit.sh (private index) commits fine. Not a flap — writes
  work; only the status scan is slow.
- **Instrument corrections (§6, pre-verdict, bars unchanged):**
  three fixes to the fixture script between the first-pass legs and
  the judged legs. No verdict was written before the corrections;
  the first-pass legs are superseded, not judged.

## 6. Corrections to the instrument (before any verdict)

1. **Gear-up before read (ctl false start).** First ctl run exited
   SETUP-FAIL: `equipped=null cells=0`. The gun sits in items until
   fieldFight's entry gear-up equips it, so a pre-fight equipped-slot
   read sees null. Fix: the fixture now runs the engine's own entry
   step (`Game.villagerGearUp(holder, false)` — deterministic, no
   acquisition, idempotent; fieldFight runs the identical call again
   at entry) before the setup-gate read. The frozen gate text is
   unchanged; the script now reads what the fight will see.
2. **Holder-alive read (both first-pass legs misread dead).** First
   legs reported `holderAlive: false` on both legs while the
   transcripts show the holder landing the killing blow (arm R12
   47 HP, ctl R11 58 HP). Cause: `state.village.health` carries NO
   entry for the holder at setup (null before and after) — fieldFight
   reads HP with a 100 default and never writes it back to the map
   in this path — so a health-map read always reports dead. Fix: the
   sealed record's `rec.vHpLeft` is the authoritative post-fight HP
   (arm 44, ctl 61 on the corrected runs). Bar 5 was report-only, so
   no bar changes; the corrected value is what §1 reports.
3. **FIGHTALLY2 gate (first-pass party was 2, not 3).** First legs
   ran without `FIGHTALLY2=1`, so only 1 ally joined (partySize 2
   in the transcript — the second ally never appears) although the
   prereg stages holder + 2 allies. Fix: the script now STOPS unless
   `FIGHTALLY2=1`, and judged legs run with the full pilot substrate
   env. Corrected legs: partySize 3, both allies joined and fighting.

## 7. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg, committed
  `dde89606c`): bars 1–4 and 6 pass on the corrected instrument; bar
  5 recorded (holder alive both legs). No bar was re-scored. The
  first-pass legs were discarded as instrument defects before any
  verdict — the corrections are documented in §6, and the compare
  verdict is computed on the corrected legs only.
- **The volley bar (shots > 0) is the right bar for the question
  asked, but it is a thin bar.** It proves the bundle's cells are
  spent in a real fight. It does not prove they matter: on this draw
  both shots missed at 0.37 hit chance, and the kill came from the
  gun's melee fold-in, which needs no cells. A future arm that wants
  the *value* of the bundle (not just its firing) should pre-register
  on volley *damage* across several forced fights, or on the
  hit-chance itself (range-8 searcaster volleys hit ~37%/shot — is
  that the intended price of the longest gun?). The fixture as
  frozen answers "does it fire"; it does not answer "does it help".
- **The holder-alive misread is a reusable lesson.** Any future
  fixture that reads post-fight HP must read it from the fight's
  sealed record (`rec.vHpLeft`), never from `state.village.health`
  — the map is sparsely populated at setup and fieldFight does not
  write it back on this path.
- **The party-size env gate is a trap for fixture authors.**
  `opts.allies: 2` alone joins one ally; the second needs
  `FIGHTALLY2=1`. A fixture that stages a party must assert
  `rec.partySize` after the fight, not just pass ally vids in.

## 8. Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-21 — narration — Searcaster volleys narrate as
  bow-and-arrow: the volley log reads "nocks an arrow", "loosed
  wide — the arrow buries itself in the dirt", "lowers the bow" for
  a fusion-cell gun; the dry-gun line says "the string stays drawn".
  The volley block in fieldFights.js uses bow language for every
  ranged weapon. A gun should read as a gun (trigger/discharge/
  cells spent). (sim-killlootfixture-a, evidence/2026-11-21/
  sim-killlootfixture-a.md; fixture transcripts killlootfixture-a-
  arm.json / -ctl.json)

## Files

- Prereg: `evidence/2026-11-21/sim-killlootfixture-a-prereg.md`
  (`dde89606c`)
- Instrument: `scripts/test-killlootfixture-a.js` (fixture + compare;
  proof test `scripts/test-killlootbundle-a.js` 12/12 and analyzer
  `scripts/analyze-killlootbundle-a.js` selftest 17/17 reused
  unchanged from the pilot)
- Fixture outputs: `evidence/2026-11-21/killlootfixture-a-ctl.json`,
  `killlootfixture-a-arm.json`, `killlootfixture-a-ctl-rerun.json`,
  `killlootfixture-a-arm-rerun.json` (corrected legs; first-pass
  legs superseded, overwritten in place)
- Band: `evidence/2026-11-21/perseed-killlootfixture-a-ctl/` (2 ctl
  seeds only, unjudged smoke; arm leg never started — band recorded
  as the next blank, see §3)

## Run identity

- **Base:** worktree HEAD `70d9dda36`; branch
  `sim-killlootfixture-a`; prereg + instrument commit `dde89606c`.
  **Rebased onto local master tip `caaf6742c`** (version bump
  `70d9dda36-20261122-000556`, batch ship) before finishing — branch
  tip now `58874b937` (3 commits replayed clean, no conflicts). The
  rebase first refused on the safe-commit index-clobber class (all 9
  committed files staged-as-deleted in the main index); repaired with
  the `git ls-tree -r HEAD | git update-index --add --index-info`
  pipe, verified empty cached diff + empty diff HEAD + hash-object
  match per file, then rebased clean. **Proofs re-run after the
  rebase** (same commands as above): proof test 12/12, selftest
  17/17, all four fixture legs + compare → GO, identical results;
  refreshed JSONs differ from the pre-rebase ones only in
  `anchorCommit` (1 line each).
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17.
- **Fixture (judged, corrected legs):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node
  scripts/test-killlootfixture-a.js` (ctl) and the same +
  `KILLBUNDLE=1` (arm); each run twice (`rerun` arg) for the
  determinism gate. **Compare:** `node
  scripts/test-killlootfixture-a.js --compare` → verdict GO, all
  bars true, exit 0.
- **Band (judged, started then stopped by time — see §3):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl
  OUTDIR=perseed-killlootfixture-a-ctl SEEDS=107281,...,107296
  RUN=killlootfixture-a node scripts/killlootbundle-driver-a.js`
  — killed after seeds 107281–107282 (~2.7 min/seed; both legs
  would need ~85 min). Arm leg never started.
