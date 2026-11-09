# sim-winnability-round-0330 — Loop B 0330Z round evidence (winnability chain)

**Run:** fleshout-loop-b-20261109T0330Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Scheduled:** Sun 2026-11-08 21:30 CST · **Master:** `55b5e5aae` at spawn → `58aafe1db` at close (arm 2 `8aaca4244`, arm 3 `1f8c7f7ac`, arm 1 `58aafe1db`; all merged locally, pending ship) · **No push, no version bump, no live verification** (ship loop owns those).

## What this run did

Two jobs in one run. **Phase 1 — recovery of the dead 0130Z run:** its lock (created 2026-11-09T01:34:18Z) was ~119 min old with no registry heartbeat and no live worktrees; both arm commits were already on master (sitgap `2a7db0f56`, sitmetric `6a89df359`, blob-checked). Round evidence recovered as commit `9d5fe8ab6` (own branch `sim-winnability-round-0130`, ff-merged; safe-commit index clobber struck, repaired). `check.js --quick` on `c1aee407a`: **291 passed, 9 failed** (all 9 pre-existing in kind: 2 stale measurement proof, 2 × 120s load timeouts, 1 stale phone-frame receipt, 1 measurement-cache-flags, 1 mobile-combat-cadence Continue, 1 occupation-panels CLI, 1 establishment-r20 racks voice gate; none references `fieldFights.js` or `combatdiv-20261107.js`; fightblend's own test passes). The 0130Z claim was retired to `.DEAD`; its lock deleted. Loop A `0126Z` closed out clean during recovery (fightblend GO `3f405ff78` + measurement-proof refresh `fda320ccf`) — not touched.

**Phase 2 — three arms** (all DIAG/measurement, zero src/js anywhere in the run):

| Arm | Verdict | Commit |
|---|---|---|
| sim-sitgap-winseek-b (winseek reached-but-never-sat) | **DIAG-GO** — 8/8 classified, proof 49/49 | `58aafe1db` |
| sim-sitmetric-sweep-b (sweep compare side-by-side) | **NO-GO on bars 1+4 as written** — fix proven correct, proof 30/30, bar 3 proof refresh done | `8aaca4244` |
| sim-53007-bisect-b (post-endpoint bisect) | **ENDPOINT-MOVED — STOP, no bisect** — proof 22/2/8 (2 FAILs are the designed signal) | `1f8c7f7ac` |

## Lever played and before/after

No game lever was played this run — all three arms are measurement/DIAG, and that is the run's own finding: the winnability chain's binding link moved under the measurement itself.

- **Winseek sit gap (arm 1):** under winseek, 0/8 villages sit. 3 seeds (53001, 53002, 53007) hold a ready lesser seat for 27/25/6 days with the scholar at Haven every ready day and **zero sit-verb calls** — winseek extends base competent, never linkfeast, and competent never calls `tableTakeSeat`. The other 5/8 (53003–53006, 53008) price a lesser seat weeks before death and die before the day-90 floor (median survival 75d). Before: the gap was "villages reach the table and never sit" (policy unnamed). After: the gap is a property of the policy, not the seat — doorwalk sits 6/8 on the same band. The fix belongs to the policy: port `takeSeatDrive` into winseek or lift it into base competent.
- **Sweep compare (arm 2):** `compareSweepCorpora` now attaches per-policy `tableReach` (invited/sittings, display only) in the same shape as the §15 compare. Judged `table` values byte-identical to pre-change goldens on all six corpus pairs; decisions unchanged. Known cases now read correctly: takeseat invited 5/8 + sat 0/8→5/8; feareddoor 4/12 + 5/12; darkwit fresh 53701–53708 invited 5/8→6/8, sittings 5/8→2/8. NO-GO because bar 1's darkwit-fresh expectation was the worker's misread (imported sitmetric-b's conflated darkwit row; corrected expectation sittings 5/8→2/8 for the next run) and bar 4's takeseat verdict does not stand — the analyzer's substrate-sanity counts taken seats as earned (0/8 vs recorded earned 5/8), flipping GO → "NO-GO (substrate)". Repair is a follow-up arm (`pricedSeatOf`), not a re-score.
- **53007 bisect (arm 3):** the endpoint moved before the bisect could run. On current master 53007 survives 150d but sits d90 (was d95) at standing 199 (was 584), wave-4 kills 2 (was 5, faced 6×), fallen 9 combat-led (was 4 sickness-first). Neither midpoint ran; medic duty (`b74dc3007`) and double-night (`ff252c1ac`) are neither fingered nor cleared. Prime suspect: fightblend's numerator-aware fight judgment (`ecf3ff60d`/`3f405ff78`) — same fights, fewer kills, more wild deaths, standing down two-thirds on the same seed.

## Reachability verdict

The seat is reachable and priced on every seed that lives long enough (lesser from d33–d55 on the winseek band; the 53007 village sits lesser d90). What is not reachable is the *win*: national 0/8 under winseek, 0/1 on the bisect seed; wave-5 unlocks 0/8 and 0/1; wins 0 everywhere (winseek never walks a door by design; doorwalk baseline never walks a door by design). The chain's binding link this run is the policy's missing sit drive plus survival to day 90 — not the seat bar, which even the weakest village (53005, standing 45, wave 3 only) meets.

## Village assessment

Eight winseek villages, all lost, none past 122 days. They are deed-seekers that die seeking: wave-4 unlocks 7/8, wave-4 kills 3 band-wide (one each on 53001/53002/53004), standing 45–195, regional on all 8, national on none. The fallen lists are dominated by "the wild" on every seed. The pantry is empty at the end on the three offered-not-taken seeds — the seat was ready and the village starved beside it. The fiction is honest and the policy is silent: villagers talk about the waiting table by the fire ("It waits. We wait… the table doesn't fill the pantry"), the table tells the scholar twice to sit, and nobody sits. The 53007 village is a different, harder-fought village than its 53007-a self: it bleeds out in the wild d57–d87 (eight deaths in thirty days), the Red Table's tribute rising as it grieves (4,000 → 6,000 → 9,000 kcal/week), and still sits the lesser seat d90 with nine alive and a full pantry — a village that survived its wild, not one that solved it.

## Scale-wall numbers (this run)

- Winseek band (8 seeds, 150d death-aware): national 0/8, table sits 0/8, wins 0/8; wave-4 unlocks 7/8, wave-5 0/8; median survival 75.0d (59, 60, 69, 70, 80, 96, 117, 119); wave-4 kills 3.
- Bisect seed (53007, 1 seed): national 0/1, table sits 1/1 (lesser), wins 0/1; wave-4 unlocks 1/1, wave-5 0/1; survival 150d.
- Sweep arm: no sim corpus (measurement fix only).
- Frozen-band roots: 8/8 CHANGED vs `perseed-sitgap-b/` on the winseek leg (policy+master confounded, named); 53007's own headline moved on master alone (see arm 3).

## Blanks filled / documented

- **Filled:** winseek reached-but-never-sat classified seed by seed (arm 1); sweep compare shows invited vs sittings side-by-side (arm 2); the 53007 endpoint movement documented with a named prime suspect (arm 3); observer-neutral proof refreshed after the scorecard edit (arm 2 bar 3, coordinator resume).
- **Documented, not built:** winseek sit-drive build (next arm, prereg shape GO = sits ≥5/8, offered-not-taken empty); frozen-band re-baseline on the new master before any confirm leans on it; fightblend before/after on the same seed; takeseat analyzer earned-count repair (`pricedSeatOf`); sweep `table` contract question (Steve-call whether any arm should judge on sittings).
- **Findings backlog:** 14 items appended to `hidden_files/sim-findings.md` this run (4 sweep + 5 bisect + 5 winseek) — including the fightblend movement, Sam's verbatim begging ×3, "Thumbnails" trailer spam (~20–40 lines/day), repeating Codex monster names, deathSays catching "deadfall", "Daughter's Drawing" verbatim repeats, and snapshot gaps.

## Infrastructure

- **EPERM write flap** active ~04:20–05:05Z (with flickering after), refusing O_EXCL creates and plain writes minute-to-minute; python writes denied while shell/node writes mostly succeeded in the same seconds. It killed three corpus writes per arm, one sweep, and blocked arm 2's bar 3 until the window cleared ~05:09Z. Response per protocol: probe-gate every git write, no forced writes, no manual ref edits; drivers gained retry preloads (deleted after use, never committed). Heartbeats landed through the flap; registry intact.
- **Safe-commit index clobber** struck on every arm's commits (arm 1: all 5; arm 2: the landing commit; arm 3: all 3; plus the 0130Z recovery commit) — repaired each time via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash verified vs HEAD blob.
- **Master moves:** `55b5e5aae` at spawn → `8aaca4244` (arm 2) → `1f8c7f7ac` (arm 3) → `58aafe1db` (arm 1). Arm 1 was registered at `9d5fe8ab6` (before the journey-scale r112 landing); all landings rebased onto explicit fresh master SHAs. Loop A 0415Z run is active (two workers) — master may move again after this closeout.
- **Telemetry deviation check:** attempted against the winseek armed corpora; `telemetry-check.js` refuses recorder-corpus input by design (anchorCommit rows are sweep recorder rows, not runs), and the scale-wall baseline is a winseat-regime baseline that warns against comparing pre-seat substrates (spurious LOUD "wins disappeared"). No deviation signal exists for DIAG corpora; the neutrality proofs + roots deltas are the validity checks.
- **Runtime restart** mid-run lost arm 3's handoff delivery; recovered in full from its session file and verified independently before landing. Arm 1's handoff arrived intact.

## Convergence state

scale-onramp stays **converging** (NOT converged). The run answered its three blanks and the answers point the same way: the seat is priced and reachable, the policy never takes it, and the village that does take it is thinner than its old-master self. The next blanks, in order: (1) winseek sit-drive build (port `takeSeatDrive` or lift into base competent) + survival work for the day-90-floor half; (2) frozen-band re-baseline on the new master; (3) fightblend before/after on 53007; (4) takeseat analyzer `pricedSeatOf` repair; (5) the sweep `table` contract Steve-call.
