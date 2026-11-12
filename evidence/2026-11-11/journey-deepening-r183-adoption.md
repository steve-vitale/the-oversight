# r183 journey-deepening adoption (main session, 2026-11-11 ~23:21–23:45Z)

Lane A run `playtest-loop-a-20261111T2045Z` (r183, deepening leg 2) timed out at the 2h cron deadline with the after-panel, run note, gate, commit, release, rotation advance, and lock cleanup unreached. The coordinator was dead on adoption: registry heartbeat 22:31:48Z (54 min stale at first check, 23:26Z re-check), no live processes, no hbloop, no file writes in 42 min. The 16:45 CST Lane A occurrence had correctly stood down at 22:46Z (r183 alive then); the adoption re-checked at 23:21Z and found it dead. Adopted in the main session per the loop-closeout skill.

## What the run left

- Base `d33ca69f9`; branch `journey-deepening`; ONE modified file (`src/js/villager-agency.js` — the `convoTeachPlaceLine` fix + call site) and untracked: prereg, pilot/pilot2/smoke/before-analysis logs, driver, analyzer, analyzer proof test, place-rotation proof test. No run note.
- Before-panel complete (8 seeds 100018–100025, verdicts in prereg A2); proof test claimed 16/16 GREEN, RED-verified pre-fix.
- Lock orphaned: `playtest-loop.lock` still read run_id `2026-11-11T20:45:00Z` (created 20:45:47Z) — r183 never rewrote it; no matching registered tree. Deleted at closeout after verifying the run_id (stale-lock recovery, not the r183 run's own lock).

## What the adoption did

1. **Heartbeat first** (23:26:50Z) — the tree's heartbeat was 54 min stale; the reaper removes trees at ~4h stale.
2. **Proof test re-verified:** `node scripts/test-journey-deepening-r183-place-rotation-20261111.js` → **16/16 GREEN, exit 0**. Analyzer proof test → **23/23 GREEN, exit 0**.
3. **After-panel — first attempt CONTAMINATED, discarded.** Ran the driver in 4 chunks of 2 seeds (the prereg's "4 parallel chunks" shape). Result: all 4 second seeds diverged from the before-panel (e.g. 100019: chunk-run lost d66, 313,977 bytes vs before survived d100, 513,053 bytes) while all 4 first seeds were byte-identical. **Diagnosis: the driver leaks state between seeds in one process** — the second seed in a multi-seed process does not reproduce a fresh single-seed run (see finding below). The chunk-run outputs were discarded, never analyzed as the after-panel.
4. **After-panel — clean re-run, single-seed processes.** Re-ran all 8 seeds one-per-process (7 parallel + the 100019 single run from the diagnosis). **All 8 seed JSONs byte-identical to the before-panel** (`cmp` clean). 0 FATALs. Transcripts: the clean runs also recovered 20 panel transcripts the before-panel had lost to the flap (before corpus 90/110 → after corpus 110/110; the 6 missing-before files are the smoke seed 100026, correctly not re-run).
5. **Analyzer re-run on the clean corpus** → `journey-deepening-r183-after-analysis.log` (1460 lines, exit 0). Every verdict identical to the before-panel except favour-block total 6→7 (one `rightnext` firing from the recovered transcripts; same REPETITIVE verdict, same diagnosis). Q2-PLACEFRAME: NO-FRAMES both panels — the fix's rotation is unexercised in the wild (0 place lessons in 16 seed-runs); the binding bar is unexercised, not failed. The fix is a clean no-regression: trajectories byte-identical, survival 7/8 both, census identical.
6. **Before-panel corpus preserved:** all 105 before files moved to `hidden_files/evidence/2026-11-11/before-r183/` before the after-panel ran (so the after run could reuse the same filenames without overwriting the before record).
7. **Run note written** (`journey-deepening-r183.md`) + this adoption note; gate run (see below); commit; rebase onto current master; ff-only merge; release; rotation-a 2→3; lock deleted; telemetry check.

## New findings filed

- **[open] 2026-11-11 — journey-deepening driver multi-seed state leak (r183 adoption):** running 2 seeds in one `journey-deepening-r183-20261111.js` process diverges the second seed from a fresh single-seed run (100019 chunk-run: village-lost d66, 313,977 bytes; single-seed: survived d100, 513,053 bytes, byte-identical to the before-panel). All 4 second seeds diverged; all 4 first seeds matched. The before-panel's JSONs match fresh single-seed runs on all 8 seeds, so it ran single-seed-per-process. Until the driver resets state between seeds (re-seed + clear module-level caches), **run journey-deepening seeds one-per-process**; any past multi-seed chunk panel is suspect on its later seeds.
- **[open] 2026-11-11 — before-panel transcript loss to the flap (r183):** the before-panel captured 90/110 panel transcripts (20 sittings lost on 100019/100021/100025 during the flap window; transcript writes fail silently after the 30× retry exhausts). Verdicts were computed on the incomplete corpus; the clean after-panel recovered them and no verdict moved except favour-block total 6→7. The driver should throw (or the analyzer should warn) when a transcript write fails after retries, so an incomplete corpus is visible instead of silent.

## Gate

`node scripts/check.js --quick` in the worktree: **330 passed, 10 failed in 1270s — GO.** Adjudication:
- 6 × exact 120s timeouts (living-garden, occupation-panels, one-person-army, trust-observer-neutrality, synergy-stall, capable-bot) — all standalone-green on re-run (8/8, 25/25, 7/7, 6/6, exit 0, 40/40). Load artifacts, non-regressions.
- 1 × measurement-cache-flags (84.7s) — standalone-green 4/4. Load/staleness artifact, non-regression.
- 2 × measurement-proof staleness pair (proof-update + workflow) — STANDING. The b6 proof was already re-staled by r181's `src/js/game.js` change; this run's `src/js/villager-agency.js` change re-stales it further. The next proof-refresh round re-points (same accepted pattern as r180's convo-dialogue.js change).
- 1 × phone-frame-proof stale receipt — STANDING. The receipt was already stale on the base for index.html, foreignSpeech.json, table-endings.json, alienPlayers.js; r181 added regions.json + statusEffects.json; r183 adds villager-agency.js to an already-stale receipt. Receipt refresh is a separate job.

## Closeout

- Master tip after merge: (filled at closeout).
- Rotation-a: 2 → 3 (scale next).
- Lock `playtest-loop.lock` (orphaned 20:45:00Z run_id): deleted after verification.
- Worktree `journey-deepening` released and removed; branch deleted.
