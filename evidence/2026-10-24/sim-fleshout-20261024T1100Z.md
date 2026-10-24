# sim-fleshout-20261024T1100Z — scale-onramp, 3 arms, all NO-GO at pilot (coordinator evidence)

**Run:** fleshout-20261024T1100Z · **Axis:** scale-onramp (standing directive — blocking axis, still converging, NOT converged)
**Loop:** oversight-flesh-out-loop (loop A) · **Sibling loop B:** live on food-economy (keepceil/pdvalue/pddrift) — not touched; zero file overlap by design (all three arms policy/instrument/evidence-side, zero src/js).
**Claim:** written before any sims (`hidden_files/lever-claims/fleshout-20261024T1100Z.json`, deleted at closeout) · **Lock:** created/deleted per protocol, no stale-lock recovery needed (no lock at run start).
**Base at run start:** `7ee04fd0f` (loop-B pdvalue landing) · **Landing base at closeout:** `e80742ee8` (master moved twice mid-run: loop-B adoption run + gap-closure commits; each arm rebased in its own worktree onto current master, proof re-run post-rebase, ff-only merged).
**Merged locally, pending ship** — no push, no bump, no live verification (ship job owns deploys).

## Verdict, in one paragraph

Three arms, three clean kills, one convergent finding: **on plain competent play, the post-national / post-door levers never get to fire.** Table-sit never fires because no village reaches national (0/8 both arms, medians identical at 120d). Door-ready never fires because no village opens a door (0 matched doors; plain competent reaches wave 4 on 1/8 seeds, wave 5 on 0/8). Rerun-clock cannot be judged because no village reaches national/table/door at all (0/16, tier 0 on all 2,707 traced days, 0 rerun fights). The scale wall, for the competent baseline, sits *before* regional — no accord/link ever forms — not at the national/table door. The tier-6 rerun grind that postunlock2-b documented exists only on the wallseg-driven substrate; the next arm on this question must either use that substrate or first solve competent-scale. Scale-onramp stays **converging**.

## Arms and pre-registered bars (all binding, written before sweeping)

| Arm | Commit (rebased) | Bar | Result | Verdict |
|---|---|---|---|---|
| sim-tablesit — table-first posture after national (take ready seat, answer first-option, Haven-wait while table-waiting) vs competent, seeds 71101–71108, 180d death-aware | `fa69e1262` | armed median ≥ baseline + 15d AND table reach not lower | median 120d vs 120d (bar 135d); table 0 vs 0; per-seed days identical all 8 seeds; seat attempts 0, seats taken 0, wait days 0 | NO-GO, killed at pilot; policy file deleted |
| sim-doorready — defer door pursuit until margin bars met (armored ≥6, armed ≥8, tricks ≥4, veterans ≥3 living wave-4+ killers, roster ≥8) vs competent, seeds 71901–71908, 180d | `e29eb6b04` | ≥2 matched door configs AND armed mean post-door survival ≥ baseline + 20d | matched doors 0/8; leg 2 undefined, not zero | NO-GO, killed at pilot; policy file deleted |
| sim-rerunclock — DIAG census of overtime tier + rerun fights on pure competent (no env levers), seeds 73101–73116 (pilot 8 + extension 8 per pre-registered rule), 180d | `e80742ee8` | census complete AND tier trajectory + rerun counts named for every door/national config, verdict naming rerun-clock vs single-apex killer | census complete (16/16, 0 instrument errors) but qualifying population empty — verdict cannot be named; analyzer's `diagGo` flag is vacuously true on the empty population and is explicitly overruled in the evidence | NO-GO (DIAG bar unmet) |

## Wall numbers

| Arm corpus | n | national | table | wins | wave 4 | wave 5 | median survival |
|---|---|---|---|---|---|---|---|
| tablesit (both arms) | 16 configs | 0 | 0 | 0 | 6/16 | 0 | 120d |
| doorready (both arms) | 16 configs | 0 | 0 | 0 | 2/16 (1/8 seeds) | 0 | 180d |
| rerunclock (competent only) | 16 configs | 0 | 0 | 0 | 9/16 | 0 | 180d (12/16 to cap) |

Combined reading: wins 0 everywhere (expected — no village reaches the table on any of these baselines, and SEATDRIVE-style substrates were not in play); wave-5 doors 0 across all 48 configs in this run. Death causes across arms are combat-led (tablesit: combat/ambush/expedition dwarf starvation on 7/8 seeds; doorready: combat ~47–50%, villager combat ~30–33%, starvation ~2.3%; rerunclock: 170 deaths — combat 78, monster 25, sickness 11, ambush 10, wound 10, alien 8, starvation 7, dehydration 7, contest 7).

## Village assessment (plain words)

The competent villages in this run are going concerns that never climb. Two table-sit cap survivors held 17–24k kcal pantries with 69–76 known plants and still never left village rank. The rerun-clock census shows envoys arriving ("Other villages send envoys now") with no accord following — the envoy→accord step is the visible gap, not envoy arrival. The door-ready window on seed 71903 is the one crack of light: identical first-window snapshots (bars 4/8/24/0/8), baseline hosted 3 more feasts in-window and collapsed to a 1-person roster (lost d153), armed hosted zero feasts in-window and survived to cap — but veterans were 0 on all 72 window days in *both* arms, so the veteran bar was never satisfiable, and n=1 with post-divergence RNG makes this a hypothesis (feast pantry cost + feast-draw fights), not a claim.

## Reachability verdict

- Wave 4: reachable (all three corpora).
- Wave 5 door / national / table / win flag: NOT reached on any baseline in this run — not a decoration verdict, a baseline verdict. The door-reaching substrate (wallseg stack) reaches them; plain competent does not. Any future arm that needs doors must pre-register against a door-reaching baseline.
- Arc II/III/IV, vests: not measured by these arms — not claimed either way.

## Sense-testing (SENSE-TESTING LAW) — PASS, all three arms

Each arm read a non-measured narration replay. Villagers act like people: grief beats, distinct successors, keepsake channeling, communal funerals, voiced ration/hunt/rally deliberation at an empty pantry, teaching by the fire, gossip mutating as it travels, pantry-full behavioral shifts ("Shelves are full to bursting. Patching the boots today."). Notes documented, not chased: Eulogy verses repeat verbatim across successive scholars in one day; competent never answers the village relief beat; keepsake lines repeat; idle-day "You wait. The light changes." filler repeats; a STARVING flag vs full-pantry feel note on doorready.

## Metric review (§14 — for the NEXT run, not re-scored here)

1. Post-national / post-door bars are untestable on a baseline that never reaches national. Next arms on this axis must pre-register their baseline's reach (door rate, national rate) and set bars against it.
2. The rerun-clock analyzer's `diagGo` flag must require ≥1 qualifying config before another arm leans on it (vacuous-true on an empty population — caught by the evidence overruling it, not by the flag).
3. A follow-up table arm could gate seat-taking on tableWaiting at any rank (the engine prices a lesser seat without national) — needs its own pre-registration; not attempted here.
4. Balanced panel (§15): NO panel compare attached. All three before/after comparisons are degenerate — tablesit corpora byte-identical, doorready/rerunclock door populations empty — so a panel would be theater, not measurement. The pre-registered thresholds are the judge and they ruled. This is a stated deviation from the §15 instrument rule, justified by degeneracy, not an omission by oversight.
5. Telemetry deviation check: see below.

## Blanks filled or documented (for sim-findings.md)

- Filled (kill records landed): post-national table posture is inert on competent (trigger never fires); door deferral is untestable on competent (door window out of reach); rerun-clock question is unanswerable on pure competent (no village reaches the clock).
- Documented (open, appended to sim-findings.md by the coordinator): envoy→accord gap in competent play; veteran scarcity (0 living wave-4 killers in the only door window); analyzer vacuous-diagGo flag; feast-cost hypothesis from seed 71903 (n=1, unclaimed).

## Infrastructure notes (LOUD where it matters)

- Safe-commit index clobber struck all three workers (staged-deletion variant) — each repaired via `git update-index --add --cacheinfo` with HEAD blobs, commits verified correct, worktrees clean afterward. Known class, no work lost.
- Coordinator error, owned: re-running `scripts/test-tablesit-sweep.js` in default mode post-rebase is a full pilot sweep, not a proof gate — it overwrote the pilot corpus incrementally and the background session vanished mid-run, leaving a truncated corpus in the worktree. Recovered by restoring the file from the rebased HEAD commit (byte-identical to the worker's committed corpus) and re-running only `--detgate` (PASS, 26d = 26d). Lesson restated: post-rebase verification uses gate-only modes, never default sweep modes.
- Background session loss also hit one worker's first pilot attempt and one worker's sweep (SIGTERM, per-seed files intact, resume-skip recovered). Sweeps should run chunked with resume-skip and incremental writes.
- Master churn: two mid-run master moves (loop-B adoption landing, gap-closure commits) forced three rebases; the rebase-then-merge-in-one-call pattern closed the race. Other loops' trees (gap-*, journey-deepening, sim-belongcost-b, sim-leg2drift-b) were left untouched; the reaper correctly refused their dirty trees.
- Rerun-clock worker notes `node scripts/check.js --quick` hung 6+ minutes (piped tail buffers output) and was killed with no repo effect; no src/js changed in this run, so this does not block landing. Full quick check was not run to completion — stated, not hidden.

## Telemetry deviation check (§15 step 10)

Command: `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-24/perseed-rerunclock/*.json' --metrics national,table,wins,exiled` (plus a tablesit-pilot run of the same check).

LOUD lines: national 12 → 0, table 16 → 0, wins 16 → 0; no LOUD line for exiled (0 = 0).

Verdict: **REGIME ARTIFACT, explained, not a real bug.** The baseline's own `_regime` block labels it "winseat — full win-side win stack" (SEATDRIVE=1, WINPURSUIT=1, WINDEFER=1, etc., measured national 12/16, table 16/16, wins 16/16) and warns verbatim not to compare pre-seat substrates against it because wins are structurally ~0 there. This run's corpora are plain competent with no win stack, so 0 national/table/wins is the expected structural outcome, consistent across all three arms and with the arms' own wall numbers. No layer deviation inside the run (all three arms agree). **Baseline NOT rolled** — rolling it would destroy the winseat reference that the note protects.

## Convergence state

scale-onramp: **converging** (NOT converged). Three more clean kills, zero GO arms. The binding wall for the competent baseline is pre-regional (accord formation), and the post-door grind question now has a stated substrate precondition (wallseg stack or a competent-scale solution first).
