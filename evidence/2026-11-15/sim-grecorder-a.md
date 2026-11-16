# sim-grecorder-a — G-Class Recorder Victim Identity

**Run:** fleshout-20261115T2115Z, Loop A, axis scale-onramp. **Arm:** sim-grecorder-a.
**Prereg:** `evidence/2026-11-15/sim-grecorder-a-prereg.md` (commit `4a4692ff4`), Correction 1 (`4c373322b`).
**Branch:** `sim-grecorder-a` (worktree `~/workspace/worktrees/sim-grecorder-a`, base `d073bd656`). **No game-code change, no shared-harness change — instrument only.**
**Analyzer:** `scripts/vetattrition-analyze-grecorder-20261115.js` (v4 logic for G corpora).
**Proof:** `scripts/test-grecorder-a.js` — **42/42 green** (§0 unit 12, §1 end-to-end 22, §2 analyzer 8).
**Judged output:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/grecorder-a-output.json`.

## Verdict: GO

The frozen per-class bar — **G-class legs ≥90% classified, 0 instrument errors** — is met on the fresh corpus: **18/18 drops classified (100%), 0 unclassified, 0 instrument errors.** The recorder gap that alone caused the vetattrition DIAG NO-GO is closed: every vet5 drop in the fresh G corpus now resolves to named veteran deaths with kill counts. The frozen gorgeprice2 corpora are NOT re-scored (the v4 analyzer refuses them loudly — verified, exit 2).

## §1 The fix

In `scripts/cascade-driver-20261115.js` (the G-class recorder), each top-level `deaths` row now carries:

- `vid` — the victim's villager id (`who` for kind `villager`/`person`; `null` for kind `monster`).
- `name` — display name via `Game.getPerson` (fallback: the vid).
- `veteran` — `true` iff the victim had ≥1 wave-4+ kill in `waveKillLog` with kill-day ≤ death-day.
- `w4kills` / `w5kills` — wave-4+ / wave-5 kill counts by the victim with kill-day ≤ death-day.
- `maxWave` — highest wave among the victim's kills with kill-day ≤ death-day (`null` if none).
- Monster-kind rows carry nulls for all six fields.

The annotation is **post-hoc from the run's final `waveKillLog`** (pure read, after `runDays` returns). That is exact, not approximate: the log is append-only in-run (capped at 1000 entries, ~60 in a 150d run), and a dead villager makes no later kills — so kill-day ≤ death-day is exactly "veteran at death", including pyrrhic kills whose entry day equals the death day. The per-seed output also carries the final `waveKillLog` (plain copy) so future analyzers can re-derive the flags without re-running. The existing `deaths` fields (`day, kind, who, cause, player`) keep their exact values — verified in the proof against the raw `samples.deaths` rows — so old analyzers keep working. No `src/` change, no `sim-harness.js` change, no behavior change: the annotation runs after the sim, reads only, and cannot move a sim number. A `waveKillLog`-capped warning (≥1000 entries) is recorded as an instrument error if it ever fires; it did not fire (max log length in the fresh corpus: 81).

## §2 Proof results

`scripts/test-grecorder-a.js` — **42/42 green**:

- **§0 unit (12):** `annotateDeathVictims` on a synthetic stub — pyrrhic same-day w5 kill counts (w4kills counts w4+, so a w5 kill is also a w4+ kill); kills after the death day excluded; wave-1 kills never count as veteran; monster rows null; missing log degrades to veteran-false, never an error.
- **§1 end-to-end (22):** 2 smoke seeds (100541, 100542; 150d, competent-answercourt-b), cascade output vs the vetfirst instrument on the same seeds in separate child processes. Victim ids match `regDeaths` row-for-row (21 vs 21 person deaths on 100541, 10 vs 10 on 100542) with matching causes; veteran flags agree with `vetsW4` snapshots; w4/w5 counts and maxWave agree with the log exactly; attached `waveKillLog` matches the vetfirst final log as a multiset; zero instrument errors both sides.
  - **Born-dead, confirmed live:** Grace Obi, seed 100541, day 141, "the wild" — flagged veteran, never appears in any `vetsW4` snapshot (her first wave-4 kill was on her death day). This is the vetfirst instrument's own born-dead case, and it is why prereg Correction 1 exists. Smoke-seed veteran deaths: 100541: 5 (4 wild, 1 monster); 100542: 2 (1 wild, 1 monster).
- **§2 analyzer (8):** synthetic G file — mag-2 drop classified from its 2 veteran deaths (a non-veteran death in the window ignored), NON-DEATH-EXIT, AMBIGUOUS residue, old-format refusal.
- **Regression:** `scripts/test-cascade-b.js` 4/4 green after the driver edit (static, unit-lingering, sim-mechanism, determinism).

Two proof failures on the first run were test-authoring errors, fixed before the green run: the unit test wrongly expected a w5 kill not to count toward w4kills (w4+ includes w5) and wrongly expected `maxWave: null` for a villager with a wave-1 kill; the veteran-flag check needed the born-dead exception (Correction 1).

## §3 Fresh legs (judged)

Re-ran the gorgeprice2-confirm setup on the fresh band **100541–100556** (freshness: every `*.md` under `evidence/` — 504 distinct seed numbers — plus goal `hidden_files/*.md`; the band appears nowhere as a seed band; the only near-matches are `pantryFreshBefore/After` kcal values like 100543 in 2026-10-16 census JSONs, not seed bands): 16 seeds, 150d, policy `competent-answercourt-b`, `RUN=grecorder-a`, `OUTDIR=perseed-grecorder-a`, current master. The lingerer guard is ON in this master, so this leg reproduces the gorgeprice2-confirm ARMED leg's game behavior; the control leg (guard reverted) was not re-run — this arm judges the recorder, not the lever. Corpus: `evidence/2026-11-15/perseed-grecorder-a/` (16 files, 0 instrument errors).

| seed | unlocked | vet5@u | vet5@end | drops | classified | survived | scale | maxWave |
|---|---|---|---|---|---|---|---|---|
| 100541 | yes | 2 | 1 | 3 | 3 | 150 | national | 5 |
| 100542 | yes | 1* | 2 | 2 | 2 | 150 | national | 5 |
| 100543 | yes | 2 | 1 | 2 | 2 | 150 | national | 5 |
| 100544 | — | — | 0 | 0 | 0 | 150 | regional | 4 |
| 100545 | yes | 2 | 3 | 3 | 3 | 150 | national | 5 |
| 100546 | — | — | 1 | 1 | 1 | 150 | regional | 4 |
| 100547 | — | — | 0 | 0 | 0 | 150 | national | 4 |
| 100548 | — | — | 1 | 1 | 1 | 150 | regional | 4 |
| 100549 | — | — | 1 | 0 | 0 | 150 | national | 4 |
| 100550 | — | — | 0 | 2 | 2 | 84† | regional | 4 |
| 100551 | — | — | 0 | 0 | 0 | 89† | national | 4 |
| 100552 | — | — | 1 | 1 | 1 | 97† | regional | 4 |
| 100553 | — | — | 1 | 1 | 1 | 150 | national | 4 |
| 100554 | — | — | 0 | 1 | 1 | 150 | regional | 4 |
| 100555 | — | — | 0 | 0 | 0 | 48† | regional | 3 |
| 100556 | — | — | 1 | 1 | 1 | 103† | regional | 4 |

\* 100542 reads vet5@unlock 1 — the mid-day unlock artifact documented in the DIAG (§12): the second veteran was made during the unlock day, after the snapshot. † Village lost (death-aware horizon).

**Pooled:** drops 18, classified 18, unclassified 0, share **1.000**. Cause shares (attributed veteran deaths): WILD 10 (55.6%), W5-ERA 3, OTHER:sickness 2, OTHER:the night 1, OTHER:a wound that wouldn't close 1, ARENA 1. **14/18 attributed deaths are scholar deaths (78%)** — the same scholar share the DIAG measured (79%), and WILD is again the dominant cause: the mechanism the DIAG named survives the residue being closed.

## §4 The 18 attributed veteran deaths (names, at last)

Every drop now resolves to a person. (Drop day = the series row day; death day is the same day or the day before, per the closed window.)

| seed | name | vid | death day | cause | w4 kills | w5 kills | scholar? | class |
|---|---|---|---|---|---|---|---|---|
| 100541 | Denise Adamczyk | gen_48z8eef | 56 | the wild | 1 | 0 | yes | WILD |
| 100541 | Nina Petrova | nina_petrova | 113 | the wild | 1 | 0 | yes | WILD |
| 100541 | Yuki Mori | yuki_mori | 144 | monster | 1 | 0 | no | W5-ERA |
| 100542 | Rehab Al-Shammari | visjoin_116 | 124 | monster | 1 | 0 | no | W5-ERA |
| 100542 | Amina Diallo | amina_diallo | 130 | the wild | 3 | 1 | yes | WILD |
| 100543 | Ibrahim Sabri | app_mgpspi32 | 138 | monster | 1 | 0 | no | W5-ERA |
| 100543 | Yuki Mori | yuki_mori | 140 | the wild | 1 | 1 | yes | WILD |
| 100545 | Brunhilde Piotrowski | gen_y6t8e5s | 87 | the wild | 1 | 0 | yes | WILD |
| 100545 | Miguel Santos | miguel_santo | 119 | the night | 1 | 1 | yes | OTHER:the night |
| 100545 | Ouarda Bennani | app_mgpsphr5 | 140 | a wound that wouldn't close | 1 | 0 | no | OTHER:wound |
| 100546 | Leo Martin | leo_martin | 123 | sickness | 3 | 0 | yes | OTHER:sickness |
| 100548 | Lucas Brown | lucas_brown | 139 | the wild | 3 | 0 | yes | WILD |
| 100550 | Tom Liu | gen_hnjkksr | 70 | the wild | 1 | 0 | yes | WILD |
| 100550 | Nikolai Volkov | nikolai_volk | 77 | the wild | 1 | 0 | yes | WILD |
| 100552 | Lillian Wallace | gen_0v7jgno | 88 | the wild | 1 | 0 | yes | WILD |
| 100553 | Chloe Dubois | chloe_dubois | 95 | sickness | 1 | 0 | yes | OTHER:sickness |
| 100554 | Robin Foster | gen_l0r9pt3 | 148 | the arena | 3 | 0 | yes | ARENA |
| 100556 | Akhmet Iskakov | gen_l0r9pt3 | 91 | the wild | 1 | 0 | yes | WILD |

Amina Diallo is the sharpest single line in the corpus: three wave-4 kills and a wave-5 kill as the scholar, dead in the wild on day 130. The veteran pipeline makes wave-5 killers and the wild still takes them — the DIAG's mechanism, now with names attached. No multi-veteran drop occurred in this corpus (all 18 drops are magnitude 1), so the v4 multi path is proven only synthetically (§2), not on a live corpus.

## §5 Wall numbers (reported, not judged)

National ever 8/16, table 0/16, wins 0/16, wave-5 unlocked 4/16, median survival 150 (horizon cap; 11/16 survived the full 150d, 5 villages lost at days 48–103). The scale wall stands: national is reached on half the seeds, the table on none.

## §6 Metric review

- **The per-class bar was the right bar.** Judging G alone (18/18) instead of pooling it with T is what let the recorder be judged on its own evidence. The pooled 90% bar mixed a class that could answer with one that could not; per-class judging is now the standing form for this DIAG family.
- **No drop stayed AMBIGUOUS.** The residue is zero, so there is nothing to sensitivity-test this time. The v4 AMBIGUOUS branch exists for future corpora where a drop's veteran-death count mismatches its magnitude.
- **The post-hoc annotation never disagreed with a live reading.** The §1 cross-check (veteran flags vs live `vetsW4` snapshots, counts vs the log) agreed on all 31 person deaths across the two smoke seeds, with the single born-dead case handled by Correction 1. The one asymmetry to remember: a snapshot can never show a veteran made and killed on the same day; the log can, and does.
- **100542's vet5@unlock 1** is the known mid-day unlock artifact (DIAG §12), not a recorder error: the unlock-day snapshot predates the second veteran's kill that day.
- **T-class:** no T legs were produced (cascade driver writes G only). The frozen T figure stands at 70/70 (100%), reported separately, never pooled.

## §7 Sense-testing

The new fields change what the corpus can say: the 100526-style pile-up from the DIAG (seven names dying around one drop, classifier blind) is now answerable — each veteran death carries its vid, name, and kill counts, so a multi-death day attributes exactly. In this corpus the names read like people, not rows: Amina Diallo's 3+1 kills, Leo Martin's 3 kills ending in sickness, Robin Foster's 3 kills ending in the arena. The death lines still never say the dead person was a veteran (the DIAG's silence finding stands — the recorder now knows, the fiction still doesn't say it aloud). That silence is a fiction blank, not a recorder blank, and it is out of this arm's scope; it belongs in the findings backlog, not here.

## §8 Telemetry

`scripts/telemetry-check.js` **REFUSED** the corpus, as prescribed for recorder corpora (all 16 rows carry top-level `anchorCommit` — sweep recorder rows, not runs). Recorded, not worked around; the baseline was **not** rolled. No LOUD lines apply to this arm.

## §9 Incidents

- **Proof re-run SIGTERM'd once** (2026-11-15 ~23:0xZ): the second proof run was killed at 161s with no output while a reaper run held `REGISTRY.lock`. Cause undetermined from inside the VM — no stray processes remained, the worktree was intact, and the identical re-run completed cleanly (173s, 34/34) immediately after. Not a test failure; recorded, not chased.
- **Heartbeat lock contention (coordinator flag):** `worktree-heartbeat.sh` blocks indefinitely on `REGISTRY.lock` (no timeout in the script) while the reaper holds it for its whole 9–14 min run; my heartbeat attempts timed out at 60–90s and the registry still shows `sim-grecorder-a` heartbeat `2026-11-15T22:29:23Z`. The tree was never reaped (it was dirty/active throughout), but the stale heartbeat is a real hazard for the next run's concurrency guard — the reaper-lock self-contention fix the tracker already owes would clear it. I did NOT hand-edit `REGISTRY.json` to work around it.
- **Safe-commit index clobber** struck on the prereg commit (prereg showed staged-deleted, byte-identical on disk). Repaired with the documented pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`), verified status empty + hash-object matches. The commit itself was correct. No clobber on the two later commits.
- **No game-code change, no push, no bump, no live verification, no merge** — coordinator merges.

## §10 Convergence state (scale-onramp)

**Recorder gap: closed.** The vetattrition DIAG's per-class bar is now measurable on G corpora (18/18, 100%), and the mechanism it named (scholar wild-death bleed; WILD 56% of fresh drops, 78% scholar deaths) is corroborated on fresh seeds with named victims. The axis stays **converging**: the binding constraint is named and quantified, the instrument that measures it is fixed, but the next lever (wave-4 re-engagement party, specified in the DIAG §9) is still unbuilt and the wall numbers are unchanged (national 8/16, table 0, wins 0). The next arm to touch veteran attrition should use the v4 analyzer on fresh G corpora and judge per class.
