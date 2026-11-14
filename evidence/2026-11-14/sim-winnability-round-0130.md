# sim-winnability-round-0130 — Loop B coordinator evidence (run fleshout-loop-b-20261114T0130Z)

Axis: winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5 facing → full seat). Loop A live throughout on scale-onramp (0015Z transplant 4/5/6, then 0215Z transplant 4b/5b/7) — NOT touched. Master at run start a1d201e8e; at closeout 486405e05.

## Stale-lock recovery (run start)

Lock fleshout-loop-b-20261113T2230Z was 3h old; all three of its trees' heartbeats 62+ min stale (transplant-raid-b 22:51Z, rageloop-b 00:21Z, retribution-b 00:26Z); zero file writes in any of the three trees in 60+ min. Dead per the guard. Lock deleted, claim retired to `.DEAD`, new lock + claim written (fleshout-loop-b-20261114T0130Z). The dead run's four arms were dispositioned, not re-run blind:

- proofrefresh-b12: already landed on master (8cb7e17b4, 938c8df62, ef1ba74eb) — GO 12/12 on its tip, NO-GO on final tip 249da4729 by 2 version-stamp keys. Round 13 owed.
- transplant-raid-b: conflict-STOP record, uncommitted evidence update in tree.
- rageloop-b: prereg commit + untracked test only.
- retribution-b: 3 commits, GO claimed.

Pre-flight: main tree clean, disk 41%, flap probe passing. Worktree cap was 16/16 ACTIVE at run start — registration of the proofrefresh-b13 tree FAILED on the cap. Cause verified: the seven ancient Loop A/playtest trees (Nov 9–11) are ALL dirty (2–270 files each), and the reaper never auto-removes dirty trees; sim-inffight-ab alone is 270 files dirty. Not mine to touch. The slot was freed by landing transplant-raid-b first, then the b13 tree registered clean.

## Arm 1 — sim-transplant-raid-b adoption: LANDED 102853490 (conflict-STOP record)

Coordinator-adopted. Committed the dead run's uncommitted conflict-STOP evidence update (5f0893e3a), rebased onto a1d201e8e clean, proofs green on the rebased tip (test-transplant-raid-b 62/62, test-culpritbisect-a 116/116), merged ff-only. No subject, no sim: cherry-pick of merge 7ddcdfff9 (family 2, PR #6 raid-danger-heard) onto far end 203a32775 conflicts on exactly one file, scripts/green-list.txt lines 916–924 (test manifest, not game code); all four src/js files merged cleanly. Family 2 is unmeasured by this arm — and superseded anyway: Loop A's 2215Z run landed the same family as sim-transplant2-a (UNMEASURED, same conflict) and measured the narrowed 2b re-run AMBIGUOUS 2/8 twice. This record is the independent reproduction + the line-level analysis (far end already carries the three raid lines; only test-person-trust-20261108.js is genuinely new). Subject branch transplant-raid-b-subject left clean at 203a32775 per the prereg. Safe-commit index clobber struck the adoption commit (MM form); repaired with the ls-tree -r pipe, verified. Tree released done-merged, branch deleted.

## Arm 2 — sim-retribution-b adoption: LANDED ae515c0ff (GO)

Worker-verified independently, rebased twice (onto a1d201e8e by the worker, onto 102853490 by the coordinator after the transplant-raid landing), proof green on every tip (18/18 + 29/29, final tip ae515c0ff). Fix: `retribution.unleash` in src/js/abilityActions.js passes `{quiet:true, deferDeathLines:true}` to the tbDamage calls and flushes death lines after the RETRIBUTION summary — death lines no longer precede the narration. Same opt-in shape as the strikefall fix (#2303). Check vs after byte-identical on all 8 steeple-band seeds. Gate log: check.js --quick 334 passed, 6 failed in 871s — 3 pre-existing staleness + 3 pre-existing 120s timeouts, 0 attributable (adjudicated in the evidence file). Evidence file was a draft in one spot (Commits section "(to come)"); worker finished it + added an Adoption section (a3b90384a, keeps [needs-eyes]). Hash discrepancy resolved: run record cites 53659af89/59fa40913, recovered branch carries 9e16c0b40/75f37133d — content-identical (fix diff md5-identical), recorded in evidence. Finding #2313 (RETRIBUTION NARRATED AFTER ITS KILL) marked [fixed] in sim-findings.md at merge. Carried finding filed: RETRIBUTION NEVER EXERCISED BY COMPETENT PLAY (scholar never holds the ability in 16 long sims; needs an ability-offer arm). Clobber struck the adoption commit (MM); repaired, verified. Tree released done-merged, branch deleted.

Wall (retribution bands): steeple 1/8 survived, median 135.5d, maxWave 5 on 1 seed, standing 145–370, all regional, **0 national, 0 table, 0 wins**; fresh band 2/8 survived, median 113d, maxWave 5 on 3 seeds, standing 75–530, all regional, **0 national, 0 table, 0 wins**. Narration-only arm; the wall stands.

## Arm 3 — sim-proofrefresh-b13: LANDED 150638abf (GO on panel tip, NO-GO on final tip)

Fresh neutral panel regen on base 102853490 + re-point + evidence, following the b11/b12 pattern exactly. Owed-check: proof-update FAILED as expected; exactly 3 of 526 manifest keys differed (build.js + index.html version stamps from bump 249da4729; conversation.js from journey-landing r130). One clean panel attempt 01:53:49–02:23:53Z, 64 cases, PANEL_EXIT=0, sha256 c70edd6f811a111b6335459a2cf228f8802d45532fcd781ba117fa5b18d6e8ea; b13-new 0 stale, b12 3 stale, b11 4 stale. Retained as evidence/2026-11-13/neutral-proofrefresh-b13.json.gz; scripts/balance-proof.json re-pointed. GO legs on the panel tip: (a) proof-update 9/9, (b) workflow 9/9, (c) cache-flags 4/4 outright (first run flap-killed; cleared-box re-run 4/4), (d) neutrality reproduces b12 + b11, warnings 0, (e) test-proofrefresh-b13.js 12/12 incl. stale-input negatives, (f) ontology exit 0, 138 systems. Master moved during the run to 62c19318e (transplant 4/5/6 + retribution-b), touching one manifest file: src/js/abilityActions.js (the retribution fix — real game code, not a version stamp). Branch rebased onto it (tip 150638abf; rebase stop-at-pick quirk struck pick 2, recovered via documented continue). Leg (a) re-verified on the final tip: FAILS exit 1, exactly 1 stale key (abilityActions.js). Per the prereg rule (legs judged only on the final tip) the round is NO-GO there. No second panel regenerated — same call as rounds 10–12. The branch still improves master (b12 panel 4 stale keys on 62c19318e → b13 panel 1 stale). Coordinator verified before merging: test-proofrefresh-b13.js on the final tip reads 8–9 passed / 3–4 failed, all failures tracing to the single stale key (validate, proof-update, workflow's staleness leg) plus the load-flaky cache-flags leg (3/4 on the coordinator's re-run vs 4/4 on the worker's cleared-box re-run — the known load artifact, not a change effect). Merged ff-only as-is. Round 14 owed immediately on 62c19318e — next B run's work, not this one.

Panel's own wall rows (64 rows, 150d): national 12/64, wins 15/64, entered 15/64 (all capable 15/16; other policies 0/16), table 55/64 (Arc-IV reach), wave-5 9/64, wave-4 63/64 (sole miss winseek seed 42, village-lost d30 wave 3 — same row as b8–b12), maxArc IV 55 / III 9, median survival 90d, max 150, village-lost 47 / over-other 15 / survived 2, vests 24, vestsVillager 41. **0 of 64 rows differ from b12** — the r130 conversation change moved no panel row. Reported as carried, not a balance verdict.

Flap episode ~02:28–02:30Z: killed the first full proof-test run (cache-flags EPERM + ONTOLOGY.md truncated to 0 lines — third sighting of the 2026-11-12 mode); `git checkout --` failed twice with EPERM on the index.lock write while plain writes passed; restored via `git show HEAD:docs/ONTOLOGY.md > docs/ONTOLOGY.md`, hash-identical to the HEAD blob. Full test re-ran 12/12 after clearance. Clobber struck all three worker commits; repaired each time. Tree released done-merged, branch deleted.

## Arm 4 — sim-rageloop-b completion: NO-GO (METRIC-BROKEN), NOT merged

Worker ran the full arm per the dead run's prereg. Guard (A) works exactly as pinned on competent: refresh presses 62 → 0, worst fight 24 → 1 press, strikes 631 → 645, rage kcal 4380 → 900. But the pre-registered primary (wholly-unspent refresh presses summed competent + capable, seeds 98801–98808, 150d) went 117 → 7 against a GO bar of 0. Per metric binding (§14) a miss is NO-GO, never re-scored: **the lever is killed on the bar, kill class METRIC-BROKEN**. The residual 7 are a second mechanism the prereg assumed away: capable presses rage once through its own guard, then competent's fallback presses it a second time through a separate once-per-fight map — two independent per-fight maps, one fight, two presses (caller probe: seed 98802 capable, day-76 fight round 3 via capable.js:363, refresh round 6 via competent.js:2569). The prereg's "already-guarded contrast" premise for capable was wrong in mechanism; capable's refreshes were competent-fallback presses all along (55 → 7, max/fight 22 → 2). The fix for the residual is lever (B), the haymaker-shape engine precheck — a new arm, not built here.

Proof: test-rageloop-b.js 9/9 static + 15/15 game legs, exit 0, on the rebased tip (RED first on the prereg commit). Judged band before → after: competent presses 73 → 15, refresh 62 → 0, kcal 4380 → 900, W4 kills 19 → 19, W5 kills 2 → 3, won 0/8 → 0/8; capable presses 75 → 26, refresh 55 → 7, kcal 4500 → 1560, W4 kills 13 → 15, W5 kills 6 → 7, won 8/8 → 8/8; total refresh 117 → 7, kcal 8880 → 2460, strikes 856 → 878, W4 kills 32 → 34, W5 kills 8 → 10, won 8/16 → 8/16. Guardrails HELD: starvation 1 → 0 competent, 0 → 0 capable; median survival 121 → 118.5d competent (0.98×), 90 → 90d capable; villager deaths 413 → 417 / 510 → 504. Balanced panels both valid (16 cases each); panel compare INVALID by contract for policy levers ("Policy/harness changed: scripts/policies/competent.js") — secondaries are the driver's identical-seed numbers. check.js --quick did NOT finish in 600s on this box (340 scripts; 5 F's seen before timeout); targeted --only rage showed 6 failures, all the same pre-existing `Text is not defined` at genRoster in old forage/storage tests, verified identical on base master 443255263; test-steeple-a.js passes 32/0.

Disposition (coordinator): killed arms leave no trace — the branch was NOT merged. Tree released done-abandoned, worktree removed, **branch sim-rageloop-b kept unmerged at e4c716b82** as the record (prereg, RED→GREEN proof test, driver, evidence, corpora, panels). The guard commit (7d4bc8bd0) does NOT land. Metric review (in the evidence file): the summed-0 bar assumed one presser per fight; proposed revision for the next run — judge the primary PER PRESSER (competent refresh-unspent = 0, PASSED here; capable-fallback residual assigned to the (B) engine-precheck arm). Three findings filed in sim-findings.md: cross-policy double press → (B) arm; capable 8/8 wins by ~day 90 vs competent 0/8 on identical seeds; panel-compare-invalid methodology note for policy arms.

Wall (rageloop band): national/global capable 5/8 both legs, competent 0/8; wins capable 8/8 both legs, competent 0/8; wave 5 competent on 98805/98806/98807, capable on 98802/98808, both legs; median survival competent 121 → 118.5d, capable 90 → 90d.

## Telemetry deviation check

Attempted on the retribution after-corpus: REFUSED (recorder-corpus class — all 8 rows carry top-level anchorCommit; same known refusal as the bisect/transplant arms). Attempted on the rageloop after-corpus: ENOENT — the branch was not merged, so the corpora live only on the branch, not in the main tree. The proofrefresh panel is a .gz (known limitation, cannot parse). No LOUD lines, no investigation item; baseline NOT rolled.

## Infrastructure

- Host write flap: episode ~02:28–02:30Z during proofrefresh (panel run itself clean; see Arm 3). Flap-watch watcher state not re-verified this run (its log froze 23:37Z on Nov 13 per Loop A 2215Z; the panel worker's probes + heartbeats carried this run).
- Safe-commit index clobber struck every commit in this run (workers' + coordinator's, incl. the MM form twice); repaired with the ls-tree -r pipe each time, commits verified correct. No work lost.
- Rebase stop-at-pick quirk struck the proofrefresh rebase (pick 2); recovered via documented continue after verifying clean tree + unapplied pick.
- check.js --quick NOT re-run by the coordinator on merged master: the retribution gate (334 passed / 6 failed, 0 attributable) was adjudicated on its tip and the merged change is byte-identical; transplant + proofrefresh touch zero src/js and zero green-list files (proofrefresh re-points scripts/balance-proof.json only). The rageloop quick run timed out at 600s (see Arm 4) — no gate is owed for an unmerged arm.
- Master moved repeatedly under the run (transplant-raid-b landing, retribution-b landing, proofrefresh-b13 landing, Loop A transplant 4/5/6, Loop A transplant-7, journey-succession r197). No pushes, no version bumps, no live verification (ship loop owns deploys).

## Wall (this run's judged corpora)

- Retribution bands: national 0, table 0, wins 0 (16 seeds, narration-only arm).
- Rageloop band: national capable 5/8 / competent 0/8; wins capable 8/8 / competent 0/8; wave-5 reached both legs; median survival 121 → 118.5d competent, 90d capable.
- Proofrefresh panel (64 rows): national 12/64, wins 15/64, wave-5 9/64, median 90d.
- The winnability chain's binding link stays wave-4 kills → living veterans: the rage guard moves strikes and kcal but no W4-kill count (19 → 19 competent) and no win (0/8 competent); capable's 8/8 wins on the same seeds are the standing anomaly to chase, not the guard.

## Next blanks (for the next Loop B run)

1. Lever (B) — haymaker-shape engine precheck refusing rage re-press while live (rageloop residual 7; metric review proposes per-presser judging).
2. Proof refresh round 14 on 62c19318e+ (leg (a) stale by 1 key: abilityActions.js).
3. Ability-offer arm — why the scholar never holds retribution (16 long sims, 0 lines).
4. Capable-vs-competent win-path gap (8/8 by ~day 90 vs 0/8, identical seeds).
5. Family 2b AMBIGUOUS stays on the suspect list (Loop A program).

winnability chain stays converging (NOT converged): two arms landed (narration fix + instrument re-proof), one killed on a broken metric with its mechanism decomposed, no win-price or deed gate moved. Claim deleted; lock deleted.
