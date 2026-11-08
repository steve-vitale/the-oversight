# sim-winnability-round-0730 — Loop B 0730Z round evidence (coordinator)

**Run:** fleshout-loop-b-20261108T0730Z · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Loop A live on food-economy the whole run (0615Z claim: medicdiag/cheaptend/doublenight adoptions) — NOT touched.**

**Adoption:** the 0530Z run died before closeout (coordinator timed out ~07:21Z after telling the trialcombat worker to commit-now). This run adopted both of its arms in their existing worktrees/branches and completed them, then ran the bisect's first midpoint. All four arms below are LANDED on master, merged locally pending ship. Master: 1cac498d5 → 93404490d → e6207035b → fcb7bbc6a → **4664a474d**.

## Arm 1 — sim-trialcombat-b (ADOPTION, LANDED 93404490d): NO-GO at pilot

Pilot NO-GO, unchanged from the dead run's verdict. Trial-by-combat door reachable, fight unwinnable as staged: trial offered 6/6, entered 6/6, won 0/6. The Bearer died in all 6 fights; the Finale kept 79.6–97.9% of its health (closest 53908: 20.4% in 7 rounds with 2 allies). The walk still won 6/6 afterwards, so losing the trial costs an ally, not the seat. Panel (§15) review_required, driven by villageDeaths regression +0.875/run (CI [0.5, 1.25]) — exactly the 6 Bearer + 1 ally trial deaths. Proof 34/34 green pre-rebase (worker) and post-rebase (coordinator). Rebase onto d5223d14c clean (3/3 picks, no quirk); merged ff-only. Evidence: evidence/2026-11-08/sim-trialcombat-b.md.

## Arm 2 — sim-healerbisect-b COLLAPSED control (ADOPTION, LANDED e6207035b): CONTROL PASSES

Full-8 collapsed control at cf22937b8, seeds 53001–53008: median **70.5d** (bar ≤90d ✓), sits **0/8** (bar ≤2/8 ✓), 0 instrument errors. Every seed's death day matches the C2 reference exactly (88/84/68/73/54/66/63/92). Screen subset COLLAPSED 4/4. Proof 17/17 green. Evidence + 8 corpora: evidence/2026-11-08/sim-healerbisect-control-collapse-b.md.

## Arm 3 — sim-healerbisect-b HEALED control (ADOPTION, LANDED fcb7bbc6a): CONTROL PASSES

Full-8 healed control at c9fea16ee: median **145d** (bar ≥120d ✓), sits **4/8** (bar ≥4/8 ✓). Every seed reproduces its fightloop reference days exactly; the subset four match exactly on sit day, standing, and wave-4 kills. Proof 17/17 green. Per-seed: 53001 105d village-lost (standing 275, wave-5, 2× The Editor kills d86/d91, died d105 with no sit); 53002 140d; 53003 65d; 53004/53005/53006/53008 150d survived, lesser d90/d99/d90/d97; 53007 50d. Starvation 1 in 96 fallen (Boris, 53007 d47). Evidence + 8 corpora: evidence/2026-11-08/sim-healerbisect-control-healed-b.md.

## Arm 4 — sim-healerbisect-b midpoint #9 screen (LANDED 4664a474d): HEALED 3/4, flip in #1..#9

Midpoint #9 `4e6fa44ab` (r112 specialist ladder — foodXp buys skill from 0) on the screen subset {53004, 53005, 53006, 53008}: **HEALED** (3/4 reach 150d). 53004 150d exact healed match; 53006 150d, standing 675, wave-5, 11/8 w4/w5 kills — exceeds the healed endpoint; 53008 150d, lesser d141 (late sit vs healed d97); **53005 54d, exact collapsed match — does not heal at all**, fallen list identical to the collapsed control day for day. Subset median 150d, sits 3/4. Proof 17/17 green. Evidence + 4 corpora: evidence/2026-11-08/sim-healerbisect-midpoint9-b.md. **Next midpoint: #5 `19ee88466`** (r111 Q2 convoNextMenu) — NOT run this run. If #5 HEALED → flip in #1..#5, next #3; if COLLAPSED → flip in #5..#9, next #7 (the prodstore revert, a no-op step — a flip landing there is an instrument/base problem, do not credit). **53005 must be tracked separately at every screen** — its healer may be a second landing in #10..#17, or a combination.

## Wall numbers (this run's judged corpora)

- Trialcombat (8 seeds × 2 legs): sits 6/8 both legs (lesser, d90), wins 6/8 both legs, national 0/8, wave-5 0/8, median 90d.
- Collapsed control: national 0/8, table sits 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 0/8, median 70.5d.
- Healed control: national 0/8, table sits 4/8 (lesser only), wins 0/8, wave-4 7/8, wave-5 1/8, median 145d.
- Midpoint #9 subset: national 0/4, table sits 3/4 (lesser), wins 0/4, wave-4 4/4, wave-5 1/4, median 150d.
- **Full seat 0 everywhere. National 0 everywhere.** The healer is narrowed from 17 landings to 9 (#1..#9), but no landing is fingered yet.

## Village assessment — what the villages looked like

The collapsed villages tell the same story on all eight seeds: the same early deaths the healed villages take — an ambush, a monster wearing a dead villager's face, the wild — and then the second-month thinning, five people starving in two days on 53005, the seat earned on paper and never taken. The healed villages take the same first deaths and keep going: they lose twenty-odd people over five months and still sit down at the lesser table, because the pantry never empties. And the midpoint shows the heal is real but partial: three of the four discriminating villages come back to life at #9, one does not — 53005 dies the same death it always died, down to the day. The difference between a village that lives and one that dies is still, on this band, whether it can feed itself after the first month of dying — and #9 buys that for most villages, but not all. The trial door is a different kind of wall: the village earns the seat, walks the feared path, is offered the trial, and the Bearer dies in seven rounds while the Finale barely notices. The door is open; the fight is not.

Sense-check: no dialogue in these corpora reads robotic on its face; the death lists cohere across endpoints (same first deaths, divergent endings). The sit instrument is honest throughout (collapsed `seatTaken` 0/8, `sitAttempts` 0/8).

## Telemetry deviation check

`scripts/telemetry-check.js` on the trialcombat armed corpus: **refused recorder-corpus input by design** (all 8 rows carry top-level anchorCommit) — no LOUD line, no compare performed. The §15 panel (trialcombat-panel.md, review_required on villageDeaths) is the sanctioned comparison for these corpus shapes, same justification class as the 0214Z run. Baseline NOT rolled. The healer corpora were not checked either (DIAG bisect; endpoint reproductions are the validity check, same as the 0530Z run).

## Metric review

- All four arms were judged against pre-registered bars with no re-scoring: trialcombat's frozen primary (wins ≥1/8) fails at 0/8; both controls meet their bars exactly (collapsed median 70.5d = C2's 70.5d; healed median 145d, sits exactly 4/8); the midpoint screen rule (≥3/4 reach 150d = HEALED) is met at 3/4 with the 53005 exception carried openly, not averaged away.
- One bar-shape note, carried not fixed: the analyzer's COLLAPSED bar reads sits ≤1/8 while the prereg reads ≤2/8 — both pass at 0/8, no conflict, no re-judgment.
- The midpoint's 53006 exceeds the healed endpoint (standing 675, wave-5, 11 w4 kills) — the screen rule counts it HEALED, correctly, but it is not "the healed shape": the r112 ladder over-heals on seeds where the village was already close. The flip interval narrows on the rule, not on the shape.

## Infrastructure

- **Write-denial flap live most of the run** (EPERM on git index.lock/ref writes, O_EXCL probes alternating OK/FAIL minute to minute; `git update-ref refs/heads/probe` failed at 07:45/07:49/07:54/08:04/08:16Z and passed at 08:19/08:20/08:26Z). All git writes were probe-gated; nothing forced. The flap is per-process-tree as much as per-minute: a node extractor spinning on its first file for 5 min was killed and relaunched into a good tree, which wrote all 9839 files in ~22s (collapsed worker's lesson, recorded in its evidence).
- **Flap-resilient extraction method:** all three healer sweeps ran from `git archive` extractions (no `git checkout` of the old SHAs), with only the 3 frozen instrument files overlaid from tip 1cac498d5 (byte-identical, verified). The healed run found the full require closure the hard way: 3 transitive instrument requires (`stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`) were missing from the first selective extraction and broke the smoke before any judged seed; the midpoint run verified all 17 closure files before its smoke. The next run should extract the whole tree, not a selective file list.
- **Safe-commit index clobber** hit all three worker commits (files shown D + ?? after correct commits); repaired via HEAD-blob cacheinfo each time, hashes verified, status clean.
- **Registry flock queue:** the manual registry write for the two healer trees waited ~20 min behind long-lived flock holders (journey-establishment register + heartbeat waiters); a probe-gated retry loop landed it at 08:06:32Z (attempt 22). The trialcombat heartbeat was refreshed in the same write. `worktree-heartbeat.sh` hung twice (60s timeout, killed) and worked once (<1s).
- **Master moved 3 times under the run** before the landings (journey-landing r118 f5cf45250, journey-social r154 d5223d14c); all four branches rebased clean onto the current tip before merging (trialcombat onto d5223d14c; controls + midpoint onto the moving tip after each merge). No rebase quirk struck this run. All proofs re-ran green on rebased tips (trialcombat 34/34, healer 17/17 ×3).
- Main tree had one sibling file at closeout check (`.r114_plain_12257.tmp`, journey-establishment r114 flap-probe debris, untracked) — left alone, not mine; the coordinator commit lists only the round file.
- check.js --quick NOT re-run: zero src/js changes across all four arms; the standing 280/7 profile was just recorded by the 2315Z/2215Z runs and no green-list file was touched.

## Findings appended (sim-findings.md)

- Scholar deaths stamp `atHaven: true` with home-tile coords even for wild-combat deaths (healed worker).
- Wave 5 unlocked with end-state `readiness5` veterans 0 on 53006 (midpoint worker).

## Convergence state

scale-onramp stays **converging** (NOT converged): the healer is narrowed to #1..#9 with the flip's first half identified and one seed (53005) still unhealed at #9, the trial door is measured reachable-but-unwinnable as staged, national is 0 everywhere and the full seat unreached. food-economy stays converging (untouched; sibling Loop A live). Next blanks, in order: (1) midpoint #5 `19ee88466` screen (same method, full require closure, smoke first, track 53005 separately); (2) the 53005 question — a second healer in #10..#17 or a combination — once the main flip is found; (3) national Binding (LEAD realm formation) behind the full seat; (4) the fight-loop fix candidate (b) stays unbuilt/unjudged until the healer is known — re-point it at the flip landing once identified; (5) the trial-by-combat staging question (steve-call if it needs a ruling: should the trial be winnable by the party the sit produces, or is it meant to be lost?). Claim deleted; lock deleted. Evidence: evidence/2026-11-08/sim-trialcombat-b.md (93404490d), sim-healerbisect-control-collapse-b.md (e6207035b), sim-healerbisect-control-healed-b.md (fcb7bbc6a), sim-healerbisect-midpoint9-b.md (4664a474d).
