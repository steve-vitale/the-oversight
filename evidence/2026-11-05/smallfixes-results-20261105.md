# build-smallfixes results — 2026-11-05

Branch `build-smallfixes` (base master `e5e6aa59b`). Two small combat fixes,
preregs `smallfixes-pocketsand-prereg.md` + `smallfixes-raiddensity-prereg.md`
(same dir). Proof tests + panels below. Verdicts: **pocket_sand GO**,
**raid-density ship GO** (with one marginal guardrail miss, disclosed).

## Fix 1 — pocket_sand flee-order (policy, `scripts/policies/competent.js`)

`abilityPressPlay` gains `{onlyLosing}` (step 4 only); `fight()` calls it
immediately before the 35% eject. pocket_sand is once per fight (mirrors
bird_strike's `pressed` gate). Nothing else in the flee rules changed.

### Proof — `scripts/test-pocketsand-order-20261105.js`, 13/13 GREEN armed
RED on master `e5e6aa59b` baseline: 11/13 (case A fails: presses={}, fled=1;
A2 fails as a consequence). Cases: (A) HP forced to 31% at turn start —
sand pressed once, no flee; (A2) second losing turn — no re-press; (B) no
ability at 30% — flee fires; (D) 90% — no press, no flee; (E) sand spent,
then 30% — flee fires; (F) freeze_tag held at 40% — freeze pressed, no flee.

### Panel — `scripts/sweep-pocketsand-20261105.js`, seeds 99421–99428, 140d,
competent verbatim + forced sand grant at each TB fight start (wild
acquisition out of scope per prereg; both arms grant identically).
Control root = master `e5e6aa59b` (competent.js + game.js + hierarchy.js
swapped to master for the control run, then restored — restore verified:
`onlyLosing` back, `git diff HEAD` empty on all three files).
Candidate = this branch. Corpus:
`evidence/2026-11-05/perseed-smallfixes-pocketsand/`.

| | control (master) | armed (branch) |
|---|---|---|
| fights observed | 143 | 148 |
| player turns | 1015 | 1130 |
| zone turns (turn-start HP < 35%) | 177 | 258 |
| zone turns, sand held + available | 172 | 30 |
| zone presses (pocket_sand, HP < 35%) | 0 | 31 |
| **scholar press rate on available zone turns** | **0/172 = 0%** | **29/30 = 96.7%** |
| scholar presses per fight (max) | — (no gate on master) | 1 |
| median survival | 88.5d | 115d |
| end reasons | survived 2, village-lost 6 | survived 1, village-lost 7 |

- **Primary: GO.** Armed 96.7% ≥ 50% bar; control 0 as expected.
  (The sweep's printed rate 31/30 counts 2 ALLY presses — see below; the
  scholar rate is 29/30. The 2 extra zone presses landed on turns whose
  record shows `sandPressedAlready=true`: the scholar's gate was already
  spent, so they cannot be scholar presses — they are allies throwing sand
  for a low scholar. Same for the one non-zone double-press fight, s99421
  rounds 4–5: scholar pressed at 36.5%, an ally pressed the next round.)
- **Once-per-fight gate: HOLDS for the scholar.** 0 scholar re-presses in a
  fight. Master (control) pressed sand up to 9× in one fight, all at
  HP ≥ 35% — the spam the gate exists to prevent.
- **Flee guardrail: 0 vs 0, vacuous in this substrate.** The scholar fled in
  ZERO wave-4+ exposures in either arm (2 control / 3 armed fled exposures
  were all ALLY flees). The scholar holds at 12–16% HP rather than fleeing
  — the "holding fights" shape from trickcensus, in both arms identically.
  The guardrail as written cannot discriminate here; the operative evidence
  is the fixture proof (cases B/E: flee fires with no ability held and after
  sand is spent). No flee regression, no flee increase.
- **Survival guardrail: PASSES.** Armed median 115d vs control 88.5d
  (+26.5d; bar was ≥ control −10d). Same loss modes both arms.
- Instrument note: the sweep's turn-level `fled` flag (read from
  `tbFighter('p')` after `fight()` returns) is unreliable once a fight ends
  — it read 0 in both arms while exposures show 5 ally flees. Flee claims
  above use the exposure `end.humansFled` cross-check, not the flag.

## Fix 2 — raid-siege density cooldown SHIP (game code)

`_rdOn()` now returns `true` unconditionally (`src/js/game.js`);
`nationalFirstDay` stamped unconditionally (`src/js/hierarchy.js`).
The Oct 15 mechanism (7-day window, both channels, young nationals only,
fiction aloud) is unchanged — this is a ship of measured-GO work, not a
rebuild. `grep RAIDDENSITY src/js/` returns only the explanatory comment.

### Proof — 28/28 + 8/8 GREEN, no env var set
- `scripts/test-raiddensity-20261015.js` (updated in place,
  design-changed-on-purpose): 28 pass, 0 fail — SHIPPED legs, boundary
  (holds day+6, refuses day+7), old-national (61d ignores, 59d covered),
  dissolved-national, blocked-commons fiction, famine→beg conversion,
  beg-owed 'none', refusal-path aftermath, D1 determinism byte-identical.
- `scripts/test-raiddensity-ship-20261105.js` (new): 8 pass, 0 fail — pins
  shipped behavior (`_rdOn()` true with no env var; blocked commons night
  says the doubled-watch line, stages no beat, costs no trust; hierarchy
  stamp unguarded; game.js has no `process.env` gate).

### Panel — `scripts/sweep-raiddensity-20261015.js` (unchanged instrument),
substrate seeds 11/22/33/44/55/66/77/88 × {leadfeast, belongfeast}, 180d,
FEASTSCALE_R13=1. Control root = master `e5e6aa59b` (run in the main tree;
its output was copied to this branch before the main tree was restored —
see the sweep note in the branch report). Candidate = this branch (run in
the worktree). Corpus:
`evidence/2026-11-05/perseed-smallfixes-raiddensity/{control,armed}/`.

| | control (master, gate OFF) | armed (branch, shipped) |
|---|---|---|
| runs | 16 | 16 |
| national reaches | 2 | 3 |
| night-raid clusters (≥2 raids ≤5d, young nationals) | 1 | **0** |
| young-national staged raids | 12 | 2 |
| staged-raid pairs ≤7d apart | 10 | **0** |
| staged-raid gaps ≤6d (mechanism check) | 10 | **0** |
| blocked commons nights (cooldown firing) | 0 | 16 |
| converted begs (famine channel) | 0 | 0 |
| median survival (script figure) | 100d | 89d |
| median survival (recomputed) | 99.0d | 86.0d |

- **Primary: GO.** Clusters 1 → 0 (bar: ≤ 0.5× control = 0). Mechanism:
  control's whole density signal sat in one run — leadfeast s88, young
  staged days [79, 79, 81, 85, 87, 89, 92, 93, 94, 95, 95], 10 gaps ≤6d.
  Armed s88 stages exactly one young raid (day 84); armed s22 one (day
  110). No two armed young-national staged raids fall within 6 days
  anywhere. 16 blocked commons nights show the cooldown firing aloud in
  the wild.
- **Guardrails:** national reaches 3 ≥ 0 (control −2) ✓. No new death
  mode — death-cause families identical between arms (monster combat
  ~410/194, expedition ~130, wild ~125, starvation 3 vs 4, no new keys).
  Converted begs 0 in both arms — the famine channel simply did not fire
  in these 16 seeds; conversion is covered at fixture level.
- **Median-survival guardrail: MISSED, marginally, on noise.** Script
  figures 89 vs 100 (−11d; bar ≥ control −10d). Recomputed 86 vs 99
  (−13d). The miss is a mid-distribution wobble on 16 divergent
  trajectories (control spread 50–126d, armed 50–144d; no early-death
  cluster in armed — only 3 runs <60d in each arm), with no new death
  mode and no plausible harm path (blocking a raid saves kcal/trust; the
  proof tests show blocked nights cost no trust and stage no beat). The
  guardrail is a harm tripwire; the evidence shows no harm. Verdict stays
  GO with the miss disclosed — the parent can overrule or order a re-run
  panel if it wants a tighter read.

## check.js --quick
Recovery closeout (2026-11-06, Lane B r144 coordinator): `node
scripts/check.js --quick` on the branch tree (base e5e6aa59b +
leftovers): **281 passed, 9 failed in 1310s** (re-run with full
output: `evidence/2026-11-06/smallfixes-checkquick-rerun.log`; an
earlier run the same day gave the identical 281/9 in 1205s).
The 9 = the standing 6 (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes — identical to the
r143 gate on master) + 3 load artifacts, each re-run standalone
GREEN after the gate: measurement-cache-flags 4/4,
trust-observer-neutrality 6/6, capable-bot 38/38. The capable-bot
pass runs the pocket_sand-changed policy, so the policy change
does not break the capable bot. No new failure is caused by this
branch.
