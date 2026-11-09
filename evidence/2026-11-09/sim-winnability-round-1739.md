# sim-winnability-round-1739 — Loop B 1739Z round (2 arms, both DIAG, both LANDED, merged locally pending ship)

**Run:** fleshout-loop-b-20261109T1739Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Master at start:** 0fcff01ea · **Master at close:** 91869f106 (both arms landed) · **Claim:** hidden_files/lever-claims/fleshout-loop-b-20261109T1739Z.json (deleted at closeout) · **Lock:** fleshout-loop-b.lock (NOT deleted at closeout — the coordinator died after writing this note and before deleting the lock or committing the file; recovered 19:05Z by the Lane A playtest run, see recovery line at the end of this file).

No live Loop A claim or lock at run start; Loop A's 1315Z arms (wideduty, sametick) had landed and been closed by the main session. The re-point queue was fully disposed before this run (arm-2 toggle CLOSED 0630Z; flee-repair port is a Steve call, held branch sim-fleerepair-a; standing accumulation answered by the veterans-lock decomposition). This run took the 1530Z next blanks #1 (arena decomposition) and #3 (fightblend attribution re-ask #4) in order. Loop A started a new run mid-round (tree sim-medchannel-a appeared during closeout) — NOT touched; it may hold the food-economy axis.

## Arm 1 — sim-arenadecomp-b: DIAG-GO, LANDED 91869f106

Worker branch rebased onto explicit master a81cb2d07 (after the fightblend landing); proof re-run green post-rebase (68/68); merged --ff-only; tree released done-merged, branch deleted. Commits on master: prereg f8b0067e3, instrument 11670e362, sysSay-wrap fix 59ca88352, evidence + corpora 91869f106. Zero src/js.

Fresh band 43001–43008 (coordinator-verified clean across all dated .md + preregs + Nov/Oct json; the only json hits were false-positive substrings — floats like 3.84300248 and pantryKcal values like 43006, not seeds; the worker re-ran the full freshness check per the skill and recorded it in the prereg), winseek, 150d death-aware. Arena deaths **10/101 pre-90 (9.9%)** — between the parents (3.2% prefloor, 12.1% sicknessdiag): the gap was band/base noise, and the controlled number is ~10%. Wild dominant 88/101 (87.1%); sickness-disease collapsed to 1/101, starvation 1/101.

All 10 arena deaths classified, 0 unclassified: all contest-arena (0 fallback-label), all scholars, all Blood (Pit 7, Siege 2, Gauntlet 1), all lost on wave 1 vs wave-1/2 beasts, entered at full HP (median 100), 0 wave-4 killers, 3 offered a choice (all participated), 7 grabbed. Fights are long grinds (median 62.5 rounds, max 156). **No death-reduction lever follows** — share is a tenth of the wild, the mechanism is canon-correct (blood contests are meant to kill; fair long fights), and the choice worked where offered.

The one named follow-up is an honesty fix, not a death lever: `contestDeathsById` reads `{}` on all 8 seeds after 10 arena deaths (the arena-lost path never writes the ledger), so Sal is told "No one has died in this one yet" on d28, seven days after Howard died in The Pit (d21) in the same run. Fix: count arena deaths in the ledger. Instrument lesson: the harness silences `sysSay` with a no-op and it does not route through `say` — a say-wrap-only recorder measured 0 choice offers on 55 takes; fixed with a call-through sysSay wrap; the first build's 6 seeds were discarded and the full band re-run. Proof 68/68; G2 neutrality PASS 8/8; G3 PASS 8/8. Wall: floor 2/8, national 0/8, wins 0/8, wave-4 8/8, wave-5 0/8, median survival 81d.

Evidence: evidence/2026-11-09/sim-arenadecomp-b.md + prereg + evidence/2026-11-09/perseed-arenadecomp-b/.

## Arm 2 — sim-fightblend-reask-b: DIAG-STOP (endpoint-moved-again), LANDED a81cb2d07

Worker branch rebased onto explicit master cc0726591 (journey-establishment r118 landed mid-run); proof re-run green post-rebase (60 passed, 0 failed, 4 skipped); merged --ff-only; tree released done-merged, branch deleted. Commits on master: prereg 7219e3adc, evidence + proof + corpora a81cb2d07. Zero src/js.

Re-asked the fightblend attribution against the MIDDLE headline on current master 0fcff01ea. L0 (seed 53007, doorwalk baseline leg, 150d) did **not** reproduce MIDDLE — a **fifth shape**: 150d survived, standing **184** (15 below MIDDLE's 199, outside the ±5 tolerance), lesser seat d90, **1 wave-4 kill** (Strike d89, Omar via player), **6 wave-4 faced**, 10 fallen, combat-led (7/10 frozen, 8/10 corrected), living 8, pantry 4,274 kcal, veterans 0/2. Counts match MIDDLE, but not one grave is in common (first death Se-ri d17 to a Hushpuppy); first divergence from MIDDLE is **d4**, the earliest yet (d2 rows byte-identical). The unrecorded control reproduces L0 exactly (G2 PASS) — the movement is master movement. Per the pre-registered stop rule, L1–L4 (`b98ac0730`, `e3ef2b612`) never ran; neither suspect is fingered nor exonerated.

**Single-seed attribution is RETIRED.** The frozen-band replacement is **53011–53018** (freshness-checked in the prereg: zero hits across 677 preregs + all evidence .md + scripts + corpus filenames; 53101–53108, 53201–53212, 53701–53712 avoided as used). The next run freezes each seed's current-master endpoint on the doorwalk baseline leg and re-asks fightblend against the band. Suspect set for the MIDDLE→FIFTH step (hypothesis only): the 4 src commits in `8419eefa4`→`0fcff01ea` — `5e190b6ef` truth.js coach deflect, `48c93b22b` game.js medic-duty widen (most plausible alongside the coach fix — divergence opens with a d4 sickness difference), `ae7daf40c` convo-wants.js first-reveal guard, `1cc46630c` progression.js feast tooltip. New classifier gap: the game emits a monster's *name* as the death cause (`'Hushpuppy'`, monsterId hushwolf) — unmapped in both VIOLENT maps, sits in OTHER; label robust here (combat-led under all three readings).

Evidence: evidence/2026-11-09/sim-fightblend-reask-b.md + prereg + evidence/2026-11-09/perseed-fightblend-reask-b/.

## Wall (this run's judged corpora — substrates differ, do not pool)

- Arena band (winseek, 8 configs): national 0/8, table sits 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 0/8, floor-reach 2/8, median survival 81d.
- Fightblend single seed (doorwalk baseline leg): national 0/1, table 1/1 (lesser, d90), wins 0/1, wave-4 1/1, wave-5 0/1, 150d survived.
- The pre-floor decomposition is now closed on both halves: sickness (fever healed, wound deaths are fight attrition) and arena (~10%, contest-arena scholar deaths, no death lever). The wild stays the binding killer at 87–88% of pre-90 deaths, and the wave-4 kill link (1/6 faced on the lead seed's current trajectory, veterans 0/2) stays the chain's binding number.

## Telemetry deviation check (coordinator, body step 10)

Arena corpus: `node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-09/perseed-arenadecomp-b/arenadecomp-b-winseek-s*.json' --metrics national,table,wins,exiled` — 3 LOUD lines (national 12→0, table 16→0, wins 16→0), all EXPLAINED REGIME ARTIFACTS (winseek never sits or wins by design; same lines as the parent arms). Baseline NOT rolled. Fightblend corpora REFUSED BY DESIGN (recorder corpus, same as the 1030Z precedent).

## Infrastructure

- Master moved once under the run (journey-establishment r118 cc0726591, zero overlap with either arm); both branches rebased clean onto explicit SHAs in their own worktrees; proofs re-ran green after every rebase and on the rebased tips (fightblend 60/60 + 4 skipped, arena 68/68).
- Safe-commit index clobber struck both fightblend worker commits — repaired via the documented `ls-tree -r` pipe, hashes verified against HEAD. No clobber on the arena worker commits or the coordinator commit (verify at commit time).
- The arena worker ended without delivering its final report (subagent completed with no result text); its work was complete and committed (4 commits, worktree clean, memory note written), so the coordinator verified the evidence file and proof in full before landing it — no re-spawn needed.
- Worktree registration slow (~3 min per tree, not failed). No EPERM flap this run.
- check.js --quick on merged master 91869f106: 296 passed, 4 failed (534s) — the standing pre-existing set only (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20-fixes); the measurement-proof pair passes. [Filled in at recovery, 2026-11-09 19:05Z, by the Lane A playtest run — see recovery line at the end of this file.]

## Findings filed (coordinator appends to sim-findings.md)

Arena (a)–(f) + fightblend DIAG-STOP/retirement + frozen band + monster-name classifier gap + ladder/scaleRank disagreement + d22 G3 gap + wave-4 kill link 1/6. The 1530Z arena runner-up line is annotated DIAG-GO (decomposed, not a lever).

## Convergence state

**converging** — the pre-floor decomposition is now closed on both measured halves (sickness: fever healed; arena: ~10%, contest-arena scholar deaths, no death lever, one honesty fix owed), and the single-seed attribution route is retired with a frozen-band replacement specified. The axis (scale-onramp / winnability chain) is NOT converged: national stays 0/8, wave-5 stays 0/8 under winseek, wins stay 0/8, floor-reach is 2/8 at an 81d median, and the wave-4 kill link (1/6 faced, veterans 0/2) is the chain's binding number. Next blanks, in order: (1) freeze the 53011–53018 band's current-master endpoints and re-ask the fightblend attribution against the band; (2) the `b98ac0730` / `e3ef2b612` single-commit before/afters, re-asked on the band once it is frozen; (3) the honest-stakes ledger fix (count arena deaths in `contestDeathsById`) — small game-code build; (4) flee-repair build (Loop B queue item 2, Steve call — still held); (5) sit-becomes-win Steve-call; (6) sweep table contract question (Steve-call); (7) capstone readiness; (8) trial-by-combat staging (Steve-call); (9) Binding-never-fires follow-up; (10) gating leg-4 recalibration (decision owed). food-economy stays converging (untouched; sibling Loop A live on it at closeout).

## Recovery (Lane A playtest run, 2026-11-09 19:05Z)

The 1739Z coordinator wrote this note at 18:40Z and died before finishing: the check.js line was left PENDING, the file was never committed, and fleshout-loop-b.lock (run_id fleshout-loop-b-20261109T1739Z, 17:39Z) was never deleted. Verified dead before recovery: both arm workers completed, no coordinator agent running, no registry tree for the run, no live 1739Z process, file 15+ min stale. This run filled in the check.js result above (296/4, standing set only), corrected the lock line, and committed this file on its own branch with a fast-forward-only merge. The stale lock was deleted after the commit landed. No content of the round note was changed beyond those two completions.
