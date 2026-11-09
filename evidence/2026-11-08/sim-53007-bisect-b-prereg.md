# sim-53007-bisect-b — prereg (DIAG, zero src/js)

**Arm:** sim-53007-bisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0330Z (Loop B, arm 3 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-53007-bisect-b, base master `55b5e5aaee4d8f980af9b239cb7044921edd95d7` (current master at spawn; verified unchanged in the main tree before this commit). **Prereg committed BEFORE any judged computation.**

## The question

Which post-endpoint landing removed 53007's death? Endpoints: current master (survives 150d, sits d95, standing ≥ 500) vs `c9fea16ee` (dies 50d, sickness-first). Read `evidence/2026-11-08/sim-53007-a.md` in full (§ Lever candidate, § What removed the death, Method note on git-archive extraction + the anchor quirk) + its prereg + amendments + `docs/MEASUREMENT.md` §§9–12, 14–15.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/DISEASES.md` (two pools; ambient tick/mosquito fever vs monster-fight alien viruses; cures by tier, medic cure channels) and `docs/PRESERVATION.md` (food ladder, spoilage) for the pantry read. No canon doc covers a "seed supposed to die" — the question is answered from measurement, not invented.
- Prime suspect from 53007-a: **Haven Medic Duty (`b74dc3007`)** — medicDutyTick at dawn; holder tends first + sickest; A2 cure channels (a healing ability, or proper medicine from the Haven stash pharmacy) — Steve's 2026-11-07 ruling that medics CAN cure the sick, not just tend them. On current master the sick recover where they died at the endpoint; the cure channels are the only post-endpoint change that acts directly on sick villagers. Secondary suspect: **double-night fix (`ff252c1ac`)** — the endDay death branch falls through to the shared day-advance + dawn; no more double-night.

## Endpoints actually read

- **Current-master endpoint — RE-VERIFIED in this arm, not assumed.** Seed 53007 is re-run on current master `55b5e5aae` FIRST (doorwalk baseline leg, 53007 DIAG recorder armed, 150d death-aware). Roots decay with every src change (fieldFights.js moved in the fightblend landing `3f405ff78`); if current-master 53007 no longer survives 150d / sits d95, STOP and report the endpoint as moved, do NOT bisect a ghost.
- **Healed endpoint `c9fea16ee` — REUSED, do NOT re-run.** Committed control corpus `evidence/2026-11-08/perseed-53007-endpoint-a/` (53007: 50d, village-lost, standing 75, maxWave 3, 8 fallen, 48 snapshots, 0 errors, sickness-first). This arm's endpoint leg is the current-master re-verification; the healed side is the committed corpus.

## Midpoints, IN ORDER

1. **`b74dc3007` (Haven Medic Duty) FIRST.**
2. **If it still dies at ~50d, next midpoint `ff252c1ac` (double-night).**

Ancestry fact (verified from git before this prereg, not assumed): `c9fea16ee` → … → `ff252c1ac` (107 commits in) → … → `b74dc3007` (145 commits in) → … → `55b5e5aae` (240 commits post-endpoint). `ff252c1ac` IS an ancestor of `b74dc3007`, so a survival at `b74dc3007` strictly attributes the removal to the range (`c9fea16ee`..`b74dc3007`], which contains the double-night fix as well as medic duty. The stop rule below attributes it to medic duty as the prime suspect per the assigned brief; the ancestry is disclosed here so the verdict is not overstated.

## GO bar (binding)

The midpoint must reproduce the **current-master headline** (150d survived + sits d95 + standing ≥ 500) **or** the **endpoint headline** (50d + sickness-first), not a middle shape. A middle shape (e.g. survives 150d without sitting, or dies at 80d) is NEITHER headline and is reported as an unjudged midpoint, not forced into either verdict.

## Stop rule (binding)

- If medic duty (`b74dc3007`) reproduces survival → the finger is medic duty, bisect STOPS, one midpoint is the answer.
- If it dies ~50d → run `ff252c1ac`.
- If `ff252c1ac` also dies ~50d → report both midpoints as non-removers and name the next suspects from the 53007-a list (Standing ladder legs 1–3, preserver XP per batch `f2c892be3`, pellet boost + cost `09ed9c109`/`34788b037` — the last already argued out for this seed: no pellet bearer), do NOT keep bisecting ad hoc.

## Substrate

- DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged from 53007-a) on seed 53007 ONLY, competent doorwalk leg (`scripts/doorwalk-53007-driver-20261108.js`, unchanged), BASELINE only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware.
- Midpoint extraction (same as 53007-a Amendment 1): `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C scratch-<sha>/`, recorder + driver overlaid from the branch tip, run with `REPO=<scratch>` and OUTDIR into the worktree evidence dir.
- Code identity: verify by game.js hash match against the commit blob (`git rev-parse <sha>:src/js/game.js` vs the scratch file) — the corpus `anchorCommit` will read the worktree tip, not the midpoint (the driver runs `git rev-parse HEAD` in REPO and the scratch dir has no `.git`, so git walks up to the worktree). Record the midpoint SHA explicitly, as 53007-a did.
- Corpora under `evidence/2026-11-08/perseed-53007-bisect-b/`. Scratch dirs deleted after use (reproducible from `git archive`).
- Classification rule: the 53007-a prereg rule, applied mechanically via `scripts/analyze-53007-20261108.js` (unchanged). Cause groups VIOLENT / ATTRITION / OTHER as registered there; "dehydration" / "Ad Break" / "The Eulogy" carried as OTHER, never silently bucketed.

## GO bars (binding — DIAG-GO requires ALL)

1. Current-master re-verification of 53007 reproduces the 53007-a headline (150d, survived, lesser d95, standing ≥ 500) — or the endpoint-moved STOP fires and the run ends there, reported honestly.
2. Each midpoint run produces a full daily corpus with an end snapshot (rows span d2..`gameDays`, diag on every row, 0 instrument errors) — the G3 shape as revised by 53007-a Amendments 1–2.
3. The midpoint headline is judged against the GO bar above (current-master headline OR endpoint headline, no middle shape forced).
4. **G1 det-gate PASS** (proof `scripts/test-53007-bisect-b.js`: classifier reproduces the judged P1-53007 label on the committed corpus fixture; a broken recorder fails the integrity leg; midpoint headline assertions run against the committed corpora).
5. **G2 recorder neutrality PASS** on the current-master re-verification (armed run matches the committed 53007-a corpus for 53007 — identical headline + trajectory, byte-identical sans anchorCommit — the same instrument already proven neutral in 53007-a; the midpoint runs reuse that instrument, and the midpoint headline is read from the armed run only).
6. **G3 corpus integrity PASS** on every new corpus in `perseed-53007-bisect-b/` (rows span d2..`gameDays`, diag present on every row, 0 instrument errors, end snapshot present; gaps enumerated, not failed).

## Proof

`scripts/test-53007-bisect-b.js` (det-gate + neutrality on the midpoint run + corpus integrity legs). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-53007-bisect-b`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Panel (§15): not a panel verdict — this is a DIAG bisect on a recorder corpus, same standing as 53007-a; `balance-panel.js` refuses recorder corpora by design (recorded, not forced). Record that honestly.
- Flap protocol: probe-gate EVERY git write; if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit. Safe-commit index clobber: after EVERY safe-commit, run `git status --short`; if files show as staged-deleted with worktree files intact, repair via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify status empty + `git diff HEAD` empty + hash-object matches HEAD blob.

## Metric review (pre-registered note)

- The primary metric is the midpoint headline (survival + sit + standing, or death day + mechanism class), judged against the GO bar above — not a friendlier re-scoring. A middle shape is reported as unjudged, never forced.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- The stop rule attributes a survival at `b74dc3007` to medic duty as the prime suspect; the ancestry disclosure above (double-night inside the same range) is the honest bound on that attribution, and belongs in the evidence file's metric review, not as a re-score.
