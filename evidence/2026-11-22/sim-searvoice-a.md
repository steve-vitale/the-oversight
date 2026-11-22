# sim-searvoice-a — Searcaster volley narration as a gun

- Arm: sim-searvoice-a (NARRATION FIX), Loop A run fleshout-20261122T0215Z, arm 3 of 3.
- Base: worktree HEAD `4266e6cce` (Loop B sim-doorflee2-b); branch `sim-searvoice-a`.
  Rebased from `fc915f94d` before any edit — zero local commits, clean
  fast-forward, no conflicts. Doorflee2's fieldFights.js changes (ally-3
  slot, DMGPIN/DOORFLEE2 gates, per-round snapshots) sit outside the volley
  block; none of its lines were touched.
- Prereg: `evidence/2026-11-22/sim-searvoice-a-prereg.md` (committed
  `a436bae3f`, frozen ~03:20 UTC 2026-11-22, before any judged run).
- Instrument commit: `a436bae3f` (prereg + `scripts/test-searvoice-a.js` +
  a 1-line, default-identical `EVIDENCE_DIR` override in
  `scripts/test-killlootfixture-a.js` so this arm's fixture re-runs land
  in `evidence/2026-11-22/` without overwriting the prior arm's judged
  JSONs in `evidence/2026-11-21/`).
- Fix commit: `48baef381` ("sim-searvoice-a: searcaster volley reads as a gun,
  not a bow [needs-eyes]").
- No live-game code change beyond narration: shots, hit chance, damage,
  ammo spend, and the CELLGATE hold are untouched. Default ON, no env
  gate — an env gate would ship the gun still "nocking arrows" by
  default, defeating the fix. If a reviewer path treats narration as
  balance, the answer is that no number moved (see §1 table: arm/ctl
  mechanics identical to the pre-fix RED run).
- Horizon (fixture): staged single fight, seed 7. Seeds: none (no band —
  this arm judges transcript assertions on the staged fixture).

## Verdict: GO — the gun now reads as a gun; the bow lines survive untouched

All six frozen bars pass on the judged run (exit 0). The arm volley
reads: "raises the Searcaster — the fight opens at range (2 shots)",
twice "fires wide — the discharge scorches the dirt beside the sky.
(cell spent)", "lowers the Searcaster — the sky is on them now. (0/2
hit)". The dry control leg reads: "has Searcaster but no fusion cells
— the trigger clicks on nothing." Zero bow language anywhere in either
transcript. The fixture that proved the bundle fires still passes
(`--compare` GO), and the mechanics are byte-identical to the pre-fix
run — arm 2 shots / 0 hits / 0 dmg, ctl 0 shots, both legs vKill in 11
rounds. The RED run before the fix failed exactly S1/S2/S3 (bow lines
present) while S5 passed, proving the instrument detects the defect.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| S1. Arm gun voice (opening 'raises the Searcaster', every shot 'fires' + miss '(cell spent)', closing 'lowers the Searcaster', shot lines === volley.shots) | all must hold | opening/closing gun-worded; 2/2 shot lines 'fires wide … (cell spent)' | ✅ |
| S2. Arm no bow language (whole transcript: none of 'nocks an arrow', 'the arrow', 'lowers the bow', 'string stays drawn') | must hold | 0 hits (also 0 on a case-insensitive arrow\|bow\|string-stays scan) | ✅ |
| S3. Ctl honest dry-gun line ('no fusion cells' + 'trigger'; no 'string stays drawn'; volley.shots === 0) | all must hold | dry line gun-worded; 0 bow phrases; 0 shots | ✅ |
| S4. Bow lines preserved, source-level (four original strings verbatim in fieldFights.js) | all must hold | all four present in the else branches | ✅ |
| S5. Fixture still GO (`--compare` exit 0 on refreshed legs) | must hold | compare GO, notes empty, armArrowLine false | ✅ |
| S6. Determinism (reruns match primaries on judged fields AND volley-line slices) | both must hold | ctl/arm reruns identical | ✅ |

## 1. The fix (fieldFights.js volley block, :989–1090)

One discriminator, following the block's own CELLGATE convention:
`var _isGun = (_rwId === 'searcaster');` — the searcaster is the only
energy gun in data (`items.json`: `weapon: { type: 'ranged', range: 8,
ammo: 'fusion_cell', damageType: 'energy' }`; no discriminator exists
in equipment.js, which classifies by ammo presence only). Five lines
branch on it; every non-searcaster weapon keeps the old string
byte-identical:

| Line | Bow (unchanged, else branch) | Gun (`_isGun`) |
| --- | --- | --- |
| Dry | `has <name> but no <ammo> — the string stays drawn, useless.` | `has <name> but no <ammo> — the trigger clicks on nothing.` |
| Opening | `sees <m> coming and nocks an arrow — the fight opens at range (<n> shot[s]).` | `sees <m> coming and raises the <name> — the fight opens at range (<n> shot[s]).` |
| Hit | `  loosed — it takes <m> for <d> (<hp> left).` | `  the <name> fires — it takes <m> for <d> (<hp> left).` |
| Miss | `  loosed wide — the arrow buries itself in the dirt. (spent)` | `  fires wide — the discharge scorches the dirt beside <m>. (cell spent)` |
| Closing | `lowers the bow — <m> is on them now. (<h>/<n> hit)` | `lowers the <name> — <m> is on them now. (<h>/<n> hit)` |

`<name>` is `(_rdef.name || 'Searcaster')` ('Searcaster' in practice;
the dry line falls back to `(_rdef.name || 'a gun')`, mirroring the old
`(_rdef.name || 'a bow')`). The CELLGATE hold line ("holds the
Searcaster — … the cells are saved for harder prey") was already
gun-worded and is untouched. Mechanics proof — judged run vs pre-fix
RED run, identical seeds and substrate:

| Field | RED (pre-fix) | Judged (post-fix) |
| --- | --- | --- |
| Arm volley | 2 shots, 0 hits, 0 dmg, 0 cells left | 2 shots, 0 hits, 0 dmg, 0 cells left |
| Ctl volley | 0 shots | 0 shots |
| Outcome / rounds | vKill / 11 both legs | vKill / 11 both legs |
| Holder HP left | arm 44, ctl 61 | arm 44, ctl 61 |
| Cells at arrival | arm 2, ctl 0 | arm 2, ctl 0 |

Only the log strings changed (arm `arrowLine` true → false; ctl
`arrowLine` was already false — the dry line never contained
'nocks an arrow').

## 2. Sense-test — both transcripts read aloud

Arm opening (verbatim): "the man in his 40s, with a long braid sees
the sky coming and raises the Searcaster — the fight opens at range
(2 shots)." Then twice: "fires wide — the discharge scorches the dirt
beside the sky. (cell spent)" and "lowers the Searcaster — the sky is
on them now. (0/2 hit)". It reads as a person firing an energy gun
twice and missing, each miss honestly spending a cell. The rest of the
fight is unchanged from the killlootfixture-a transcripts: both allies
charge in at the door, the holder strikes 64–68/round and lands the
killing blow at R11 (67 damage, 0 left), "The lead falls — the pack's
coordination shatters." Arm 60 log lines vs ctl 57 — the difference is
exactly the volley (4 lines) minus the dry line (1 line).

Control opening (verbatim): "the man in his 40s, with a long braid has
Searcaster but no fusion cells — the trigger clicks on nothing." The
constraint is stated honestly (no cells, so no shots) in gun words,
and the fight that follows is the same party fight as the arm leg.

Two notes, neither a defect in this fix:

1. **Both miss lines are identical.** The volley loop prints the same
   line per miss, so two misses read twice word-for-word. That
   repetition is pre-existing (the bow version printed "loosed wide"
   twice too) — the fix does not add or remove it. A future narration
   pass could vary repeated volley lines; not this arm's scope.
2. **"The sky" is still the Herald.** The beast is called "the sky"
   throughout ("beside the sky", "The sky is wounded past its line").
   Already judged not-a-bug by sim-killlootfixture-a §2: correct
   knowledge-gating (the herald's `unknown` descriptor is "the sky,
   with a face in it", truncated at the comma). The gun lines inherit
   the phrase honestly.

## 3. Wall numbers

Fixture, not a band — no wall numbers (no wins/national/table to count
from a staged fight). No band run.

## 4. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof test 12/12, analyzer selftest
  17/17, re-run on the rebased base before any judged run. Green.
- **RED run (NOT judged, proves the instrument):** `node
  scripts/test-searvoice-a.js` before the fix — S1/S2/S3 failed with
  the bow lines quoted verbatim, S4/S5/S6 passed, exit 1. The judged
  run after the fix passes all six, exit 0.
- **Index-clobber on the instrument commit (known class, AGENTS.md
  2026-10-22):** after safe-commit.sh created `a436bae3f`, the main
  index showed the two newly-added files staged-as-deleted (worktree
  files byte-identical to HEAD — hash-object matched the HEAD blobs).
  Repaired with the `git ls-tree -r HEAD | git update-index --add
  --index-info` pipe; verified empty cached diff + empty diff HEAD.
  The commit itself was always correct. Same repair to be checked
  after the fix commit.
- **Write-flap / host:** git operations in this worktree run slow
  under load (a pathspec `git diff` took ~6.5 min wall during the
  run's first hour, sibling band drivers at ~17–25% CPU each); no
  write failures. `git status --short` was not run whole-tree for
  that reason — cleanliness was verified by pathspec diff +
  hash-object match, as the prior arm did.
- **check.js --quick: NOT run to completion (load-starved, recorded
  honestly).** Started 03:28 UTC; after ~8 min the process had used
  0:00 CPU — the machine was at load 24 (a sibling check.js, three
  killloot16 band drivers, and godpath tests running concurrently on a
  1.5-CPU cell). Killed rather than compete with siblings. Substitute
  coverage for this change: (a) the searvoice test itself runs the
  real fieldFight end-to-end through the harness on both legs, GO;
  (b) proof test 12/12 + analyzer selftest 17/17 re-run post-fix,
  green; (c) a whole-green-list scan found NO test pinning the old
  bow lines (the two green-list fieldfight tests do not reference
  them; the analyzer scripts that mention the phrases count them,
  they do not assert a searcaster must say them). The change alters
  only `rec.log` strings on the searcaster branch. If the coordinator
  wants the full gate, re-run `check.js --quick` when load eases.

## 5. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg, committed
  `a436bae3f`): all six pass on the judged run; no bar was re-scored.
  The RED run is documented in §4, not judged.
- **The transcript bars are the right bars for a narration fix, but
  they are thin in one direction:** S1–S3 assert the exact frozen
  gun strings on the forced fixture's two legs (both volley shots
  missed, so the *hit* gun line — "the Searcaster fires — it takes
  …" — is asserted only by construction, never observed in a
  transcript). The hit line shares the branch and the template with
  the observed miss/closing lines, and S4 proves the bow hit line
  survives, so the residual risk is a typo in one unobserved string,
  not a logic gap. A future arm that forces a volley *hit* (higher
  hit-chance staging, e.g. a closer-range mdef) should read the hit
  line aloud. Noted here rather than weakening the bar.
- **Crossbow/sling still speak bow.** The volley block's bow lines
  are generic for every non-searcaster ranged weapon: a crossbow
  also "nocks an arrow" and "lowers the bow" (only its *dry* line
  got the right ammo name, via #2593). That is the same defect class
  on different weapons, deliberately left byte-identical by this
  arm's frozen scope ("keeping bow lines for bows exactly as-is").
  If a later arm branches crossbow/sling narration, the S4 bar
  (source still contains the bow strings) will need revising — the
  strings live on only while some weapon still uses them.

## 6. Findings (for the coordinator to append to sim-findings.md)

- [fixed] 2026-11-21 — narration — Searcaster volleys narrate as
  bow-and-arrow: the fieldFight volley block used bow language for a
  fusion-cell gun ("nocks an arrow", "loosed wide — the arrow buries
  itself in the dirt", "lowers the bow"; dry line "the string stays
  drawn"). FIXED by sim-searvoice-a (Loop A run
  fleshout-20261122T0215Z, evidence/2026-11-22/sim-searvoice-a.md,
  verdict GO, fix commit `48baef381`): the volley block now branches
  on `_rwId === 'searcaster'` (the block's own CELLGATE convention)
  — gun lines read trigger/discharge/cells spent, bow lines survive
  byte-identical for bows. This also closes finding #2623 (2026-11-20,
  sim-cellgate-a), the same defect filed first. #2635 (gun-vanish /
  holder supply) is a DIFFERENT issue and is NOT covered by this fix.
- (leftover, not filed as a new finding — same class, narrower scope)
  Crossbow/sling volleys still use bow lines ("nocks an arrow",
  "lowers the bow"); only their dry line names the right ammo
  (#2593). A narration arm that branches those weapons should revise
  the S4 source bar, which currently asserts the bow strings exist.

## 7. Run identity

- **Base:** worktree HEAD `4266e6cce`; branch `sim-searvoice-a`;
  prereg + instrument commit `a436bae3f`. **Rebased onto local
  master tip `4266e6cce`** before any edit (from `fc915f94d`, zero
  local commits, clean fast-forward, no conflicts).
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17.
- **RED (pre-fix, NOT judged):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node
  scripts/test-searvoice-a.js` → NO-GO, S1/S2/S3 fail, S5 pass,
  exit 1.
- **Judged (post-fix):** same command → GO, S1–S6 pass, exit 0.
- **Fix commit:** `48baef381` ("sim-searvoice-a: searcaster volley reads as
  a gun, not a bow [needs-eyes]").
- **Post-commit re-run:** `node scripts/test-searvoice-a.js` once after the
  fix commit → GO, S1–S6 pass, exit 0, assertions identical to the judged
  run; all four JSONs carry `anchorCommit: 48baef381`.
- **Gate:** `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-sim-searvoice-a` → NOT run to
  completion (load-starved at 0 CPU for ~8 min under load 24; killed —
  see §4). Substitute coverage: searvoice test GO, proof 12/12,
  selftest 17/17, green-list scan shows no test pins the old lines.

## Files

- Prereg: `evidence/2026-11-22/sim-searvoice-a-prereg.md` (`a436bae3f`)
- Instrument: `scripts/test-searvoice-a.js` (`a436bae3f`); 1-line
  `EVIDENCE_DIR` override in `scripts/test-killlootfixture-a.js`
  (`a436bae3f`)
- Fix: `src/js/fieldFights.js` (fix commit — see §7)
- Fixture outputs (this arm's dir):
  `evidence/2026-11-22/killlootfixture-a-ctl.json`,
  `killlootfixture-a-arm.json`, `killlootfixture-a-ctl-rerun.json`,
  `killlootfixture-a-arm-rerun.json`
