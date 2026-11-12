# sim-bisect-anchor-a — survival-collapse bisect ANCHOR leg (Loop B)

- **Run:** fleshout-20261111T2317Z, arm sim-bisect-anchor-a
- **Prereg:** `evidence/2026-11-11/sim-bisect-anchor-a-prereg.md` (committed `aa4b3c635` before any judged sim)
- **Base:** `3f136f07e` (journey-landing r126, the vetphantom fix-leg base as briefed; see §8 — that label turned out to be wrong in a material way)
- **Instrument / driver / analyzer / proof:** `scripts/vetfirst-instrument-20261111.js` (reused, unmodified — byte-identical to master) + `scripts/bisect-anchor-driver-20261111.js`, `scripts/bisect-anchor-analyze-20261111.js`, `scripts/test-bisect-anchor-a.js` (committed `cae93723c`, **41/41 green**)
- **Horizon / seeds / policy:** 150d death-aware (+10d tail max), seeds 190391–190398 — deliberately the SAME band as vetphantom and survivalcontrol (a control/bisect anchor re-runs the same seeds; stated in the prereg), competent verbatim, SINGLE leg, mode `fix` only (the roster-check fix is on this base, verified present at standing.js:239, sha `f8fda4295a99` recorded per seed — the same sha vetphantom-b §9 records for the fix leg)
- **Canon note:** docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4 (veteran bar) and Steve's 2026-11-10 scholar-counts ruling. No canon doc covers survival-collapse attribution; nothing here invents canon.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor-a/` — 8 per-seed JSONs; summary `evidence/2026-11-11/bisect-anchor-a-summary.json`
- **Run notes (infrastructure):** clean run, no write flap. The heartbeat script took ~2 min at run start (slow, as survivalcontrol-b also found) and then the driver ran 8 seeds in ~10 min with all 8 files landing first-try, 0 instrument errors on every seed. The `safe-commit.sh` index-clobber struck on BOTH commits in this arm (prereg + instrument); repaired both times with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe, verified `git status --short` empty + `git diff HEAD` empty. No work lost.

## Verdict: ANCHOR_NOT_REPRODUCED

The analyzer (`scripts/bisect-anchor-analyze-20261111.js`, exit 0) classifies **1/8 survived** under the prereg decision rule (≤2/8 → ANCHOR DOES NOT REPRODUCE). The old base `3f136f07e` does **not** reproduce the vetphantom fix leg's 6/8. Per the prereg this is **a measurement problem to report, not re-judge** — and the measurement problem has a name, worked out in §8: the vetphantom 6/8 was measured on `5157782a4`, the band was never re-run after the rebase to `3f136f07e`, and `3f136f07e` already contains the whole reconcile merge. The anchor is not the vetphantom base. The bisect's search window moves earlier (see §8).

| Rule (prereg) | Result |
|---|---|
| ≥5/8 survive → ANCHOR REPRODUCES | **not met: 1/8** |
| ≤2/8 survive → ANCHOR DOES NOT REPRODUCE | **MET: 1/8** |
| 3–4/8 → INCONCLUSIVE | not met |

## §1 The anchor table — same seeds, old base, collapse already present

| Seed | Vetphantom fix leg (`5157782a4`) | This anchor (`3f136f07e`) | Survivalcontrol (`d33ca69f9`) |
|---|---|---|---|
| 190391 | 150d survived, standing 199, maxWave 4, deaths 109 | **103d village-lost**, standing 165, maxWave 4, deaths 87 | 103d, 165, 4, 87 — **identical** |
| 190392 | 150d survived, standing 199, maxWave 4, deaths 102 | **126d village-lost**, standing 199, maxWave 4, deaths 73 | 126d, 199, 4, 73 — **identical** |
| 190393 | 150d survived, standing 325, maxWave 5, deaths 66 | **149d village-lost**, standing 199, maxWave 4, deaths 80 | 149d, 199, 4, 80 — **identical** |
| 190394 | 150d survived, standing 199, maxWave 4, deaths 89 | **91d village-lost**, standing 199, maxWave 4, deaths 80 | 91d, 199, 4, 80 — **identical** |
| 190395 | 109d village-lost, standing 199, maxWave 4, deaths 94 | **65d village-lost**, standing 199, maxWave 4, deaths 51 | 65d, 199, 4, 51 — **identical** |
| 190396 | 85d village-lost, standing 199, maxWave 4, deaths 81 | **150d SURVIVED**, standing 360, maxWave 5, deaths 98 | 150d, 360, 5, 98 — **identical** |
| 190397 | 150d survived, standing 325, maxWave 5, deaths 88 | **142d village-lost**, standing 370, maxWave 5, deaths 87 | 142d, 370, 5, 87 — **identical** |
| 190398 | 150d survived, standing 375, maxWave 5, deaths 78 | **103d village-lost**, standing 199, maxWave 4, deaths 59 | 103d, 199, 4, 59 — **identical** |
| **band** | **6/8 survived, median 150d, deaths 707** | **1/8 survived, median 126d, deaths 615** | **1/8, median 126d, deaths 615 — identical** |

Every headline number on this anchor matches survivalcontrol exactly — days, standing, maxWave, scale, death counts. That is not a resemblance; §2 proves it is the same trajectory.

## §2 The anchor IS survivalcontrol, seed for seed

A field-by-field comparison of this corpus against the survivalcontrol corpus on master (`evidence/2026-11-11/perseed-survivalcontrol-b/`, read-only):

| Seed | Head fields | Deaths list | Daily snapshots | ready4/ready5 |
|---|---|---|---|---|
| 190391–190398 (all 8) | identical | identical | **sha256-identical** | identical |

Daily-snapshot hashes match on all 8 seeds (e.g. 190391 `fb748d86bb56`, 190396 `49f54cfe6719`, 190398 `5720b0237149`). The per-seed JSONs differ only in arm/run/file names and the anchor commit. Two different bases (`3f136f07e` vs `d33ca69f9`) produce **deterministically identical trajectories** on all 8 seeds. That proves the one src/js change between them — `13e6f40ae` sim-mournblooded-b (standing.js) — does not touch the survival trajectory at all. **Mournblooded is exonerated as a collapse cause.** (It changes only the readiness counting, which does not feed back into these trajectories — and the fix sha `f8fda4295a99` is the same on both legs.)

## §3 Wall numbers — the wall is the same wall

| | Vetphantom fix leg | This anchor | Survivalcontrol |
|---|---|---|---|
| Survived | 6/8 | **1/8** | 1/8 |
| Median survival | 150d | **126d** | 126d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 3/8 | **2/8** | 2/8 |
| Wave-4 unlocks | 8/8 | 8/8 | 8/8 |
| Deaths (band) | 707 | **615** | 615 |
| Standing range | 199–375 | **165–370** | 165–370 |
| Blooded | 5/8 | **1/8 (190398 only)** | 1/8 (190398 only) |

Correction to survivalcontrol-b §2: its evidence text says "Blooded 0/8", but its own summary JSON (`survivalcontrol-b-summary.json`, `wall.blooded: 1`, per-seed 190398:true) says 1/8 — the text misread the analyzer. This anchor agrees with the summary JSON at 1/8. The vetphantom fix leg's 5/8 blooded (190392, 190393, 190395, 190397, 190398, per `vetphantom-b-summary.json`) falls to 1/8 on both later legs.

## §4 Death causes — identical counts, not just the same shape

615 deaths, all 8 seeds: villager combat 283, combat 100, expedition 100, the wild 102 — **585/615 (95%) combat / expedition / wild**. Starvation 0, sickness 0, thirst 0. Residual 30: monster 15, the arena 7, a stranger 2, ambush 1, contest 1, The Paparazzo 1, The Static Kite 1, Gavel 1, the night 1. These are not merely the same profile as survivalcontrol — they are the **identical per-cause counts** (survivalcontrol-b §3 lists the same numbers), because the death lists themselves are identical (§2). Villages die fighting, not hungry, on the old base exactly as on current master. What changed between bases is not *how* villages die but *how soon* — and that change is already in place at `3f136f07e`.

## §5 Veteran bars — the fix holds, the veterans don't (same as control)

- **Phantom days: 0 on all 8 seeds** (engine ready vs instrument recomputation, every daily snapshot). Shadow old-rule counts also agree everywhere (0 shadow days). The vetphantom roster-check fix holds on this base — the collapse is not the phantom returning. `standing.js` is byte-identical between the vetphantom fix leg and this anchor (`git diff 5157782a4..3f136f07e -- src/js/standing.js` is empty).
- **First veteran day:** d28–d45 across seeds — same range as survivalcontrol (d28–d45) and the old band (d28–d47). Veterans still form on schedule.
- **Living veterans at end:** 0/0 on 7 of 8 seeds. The exception is 190398, which dies d103 holding 3 wave-3 / 1 wave-4 living veterans — the village that died *with* its veterans, not after losing them. Same as survivalcontrol §4.
- **Tribute:** ready on 0/8 seeds at end (veterans 0 / payable 0, `veterans-short` everywhere). 190396 reached wave-5 readiness with max ready5 veterans 3 but its veterans all died before d150; 190397's max ready5 veterans is 1 — it never had the pair.
- **Blooded:** 1/8 (190398 only; was 5/8 on the vetphantom leg).

The veteran pipeline is intact at the front (first kills land on time) and broken at the back (nobody survives to bank them) — on the old base exactly as on current master.

## §6 Sense test — the village still feels like people; the gate still doesn't talk

The veteran-filtered say capture is honest outside the known Elderberry noise (the `/elder/` filter still matches "Elderberry" identification chains on 190393 — 148 lines, same instrument quirk flagged in survivalcontrol-b §5; the next arm reusing the vetfirst instrument should tighten it). Villagers still do people things on camera:

> 🍽️ Greta leaves the foraging basket at the door. "The pantry can't take more — sitting with the elders instead." (190396 d3)
> 🛡️ Niamh, Ayan, Ines and Greta met them at the door — 4 put down. Niamh, Ayan, Ines, Greta are hurt. (190396 d10)
> ⚠ This one is different — scarred, braced, waiting for your opening. A Scarred veteran. (190396 d26)
> 💧 A woman, maybe 30s, with a burn-scarred forearm returns with water: +2 clean. (190397 d1)
> 👂 Overheard — A woman, maybe 30s, with a burn-scarred forearm: "Correlation isn't cause, but three data points is a pattern. Noted." (190397 d2)
> 🍲 A woman, maybe 30s, with a burn-scarred forearm eats with A woman, maybe 30s, with tattooed arms — bowls side by side, talk low. (190397 d1)

And the gate still doesn't talk: across all 8 seeds, **zero** captured lines name the tribute, the table, or the wave door (0 tribute / 0 table / 0 wave-door mentions in the full vetSays capture). The military tribute remains voiceless (tributedeliv-b §5, survivalcontrol-b §5, still open). Nothing in the corpus is robotic or incoherent; the gap is absence, not nonsense.

## §7 Metric review (§14, never re-scored mid-run)

- **Primary — survived count vs vetphantom fix leg 6/8: ANCHOR_NOT_REPRODUCED (1/8).** The analyzer is the judge; it exits 0 with the classification. The verdict was never re-scored: 1/8 falls squarely in the ≤2/8 band, and no secondary metric was consulted to soften it. The secondaries agree (median 126d vs 150d; deaths 615 vs 707; wave-5 unlocks 2/8 vs 3/8; blooded 1/8 vs 5/8).
- **What the metric set did NOT cover:** the prereg assumed the briefed base (`3f136f07e`) was the vetphantom measurement base. It was not (§8). The decision rule itself held — it correctly refused to certify an anchor that doesn't reproduce — but the *label* in the prereg ("the vetphantom fix-leg base") was wrong. A future anchor prereg should verify the measurement base from the prior arm's corpus (anchorCommit / standingSha in the per-seed JSONs, or the prior evidence's stated base) rather than from the brief.
- **The analyzer does not judge phantom days** (computed separately here: 0 on all seeds — the fix holds). The death-cause grouping counts the raw `cause` strings, so named-event causes inflate the tail; same note as survivalcontrol-b §7.
- **Panel (§15):** N/A — instrument-only single leg, no code change, no before/after pair on this base. The before/after IS the vetphantom fix leg vs this anchor on identical seeds, judged by the analyzer's decision rule. Same standing as survivalcontrol-b §7.
- **Telemetry check:** attempted and REFUSED by the tool itself — same refusal class as vetphantom-b, tributedeliv-b, and survivalcontrol-b ("recorder-corpus input ... compared with sweep-compare tables, never against a run baseline"). Recorded, not waived. No `--update-baseline` was passed: rolling the baseline forward on a non-reproduced anchor would be wrong.
- **Proof:** `scripts/test-bisect-anchor-a.js` 41/41 green before any judged sim (instrument three-way agreement alive + TB-fallen + day after; seed-band identity; driver fix-only leg guard; corpus completeness on synthetic corpora; survival read + decision-rule table for all nine survived counts 0–8).

## §8 Follow-up owed — the bisect's window moves earlier (not this arm)

The prereg's ≤2/8 outcome names a measurement problem. Here it is, with the receipts:

1. **The vetphantom 6/8 was measured on `5157782a4`, not `3f136f07e`.** Vetphantom-b's header says the band ran on base `5157782a4` and the branch was "rebased again onto current local master `3f136f07e` before finishing — clean rebase, proof re-run green". Only the *proof* was re-run after the rebase; the 8-seed band was never re-run on `3f136f07e`. The "vetphantom fix-leg base" in this arm's brief was the rebase target, not the measurement base.
2. **`git log --oneline 5157782a4..3f136f07e` contains the ENTIRE reconcile-divergence merge** (`e4dbe581b` "Merge origin/master into local master (divergence reconciliation, Steve-approved 2026-11-10)", the reconcile branch merges, plus journey-landing r126 `3f136f07e` itself and Cursor PRs #118–121). `git diff --stat` over the range: 117 files, +32,617/−669, including villager-brain.js +1,061, villager-objectives.js +613, godverbs +587, titans +427 — the same 4,677 src/js insertions tributedeliv-b §3 attributed to the reconcile merge.
3. **The coordinator archaeology premise was about the wrong pair.** "The ONLY src/js change between the two bases is `13e6f40ae`" holds for `3f136f07e` → `d33ca69f9` — and §2 proves it: identical trajectories, so mournblooded cannot be the collapse. But the collapse sits in `5157782a4` → `3f136f07e`, not in `3f136f07e` → `d33ca69f9`.
4. **One policy-side confound in the window.** Across `5157782a4..3f136f07e`, `scripts/sim-harness.js`, `scripts/vetfirst-instrument-20261111.js`, and `src/js/standing.js` are all byte-identical (empty diffs). The only harness/policy diff is `scripts/policies/competent.js` — one hunk in `workGarden`: the garden-keeper appointment moved before `makePlot` (OVE-160, Cursor PR #120, "restore garden caretaker appointment"). A garden-appointment reorder flipping 6/8 → 1/8 by itself is implausible, but deterministic chaos means any RNG-order change rerolls downstream trajectories, so it cannot be dismissed by inspection alone. **The next bisect arm must control for it** — e.g. run the `5157782a4` policy against the `3f136f07e` code (or vice versa) — before blaming game code alone.

**Next arm owed:** re-run this same 8-seed control on `5157782a4` (the true vetphantom measurement base) to confirm 6/8 reproduces there; then bisect `5157782a4` → `3f136f07e` against the survived-count metric, with the competent-policy garden hunk as an explicit bisect step. This arm does NOT attempt either — it anchors only, and the anchor it was given does not reproduce.

## §9 Instrument, files, and reproducibility

- **Instrument:** `scripts/vetfirst-instrument-20261111.js` (reused unmodified — byte-identical to master) + the driver's live shadow old-rule count per snapshot, same as vetphantom-driver and survivalcontrol-driver.
- **Driver:** `scripts/bisect-anchor-driver-20261111.js` (survivalcontrol-driver copied with corpus dir `perseed-bisect-anchor-a/`, RUN `bisect-anchor-pilot`, arm `bisect-anchor`, MODE hard-coded `fix`; leg guard: refuses to run unless standing.js carries the ROSTER CHECK marker; sha `f8fda4295a99` recorded per seed — matches the vetphantom fix sha).
- **Analyzer:** `scripts/bisect-anchor-analyze-20261111.js` (exit 0 on a classified outcome; writes `evidence/2026-11-11/bisect-anchor-a-summary.json`).
- **Proof:** `scripts/test-bisect-anchor-a.js`, 41/41 green.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor-a/bisect-anchor-s19039{1..8}-bisect-anchor-pilot-fix.json` (8 files). Summary: `evidence/2026-11-11/bisect-anchor-a-summary.json`.
- **Files in this arm:** prereg (`aa4b3c635`), instrument (`cae93723c`), this evidence file, the summary JSON, the 8 per-seed JSONs (evidence + corpus commit pending — coordinator merges).
- **No src/js change by this arm. No game-code change, no feel/combat/UI change — [needs-eyes] does not apply.**
- **Backlog:** the survival-collapse question is REFRAMED, not answered: the collapse predates the reconcile-merge-to-master step and sits in `5157782a4` → `3f136f07e`; mournblooded standing.js is exonerated; the true anchor base is `5157782a4`. Coordinator to queue the re-anchor + bisect arm per §8. New items for sim-findings.md: (a) vetSays `/elder/` filter matches "Elderberry" (instrument quirk, carried from survivalcontrol-b); (b) survivalcontrol-b §2 "Blooded 0/8" misreads its own summary JSON (1/8, 190398) — corrected here.
