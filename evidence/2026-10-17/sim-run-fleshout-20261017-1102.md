# Run summary — flesh-out loop fleshout-20261017T1102Z (2026-10-17)

Axis: scale-onramp (blocking). Standing directive still in force (directive lift is a Steve call).

## Run shape
THREE-ARM RUN: 1 DIAGNOSTIC-GO / 1 PRIMARY-GO-GUARDRAIL-SPLIT (parked) / 1 PRIMARY-NO-GO (killed).
Landed commits: 78d797fd (sim-attrcensus) + 6234a8c6 (sim-helpcall2, evidence+instruments) + 304c3cee (sim-vetcompose, evidence+instruments) + this summary.
All three arms scripts/evidence-only — lane constraint honored (loop B owns src/js/game.js + src/js/engine/calories.js; their claim fleshout-b-20261017T09:25:32Z live all run, zero file overlap; B landed their own commits mid-run: rackschannel-b + three more trees registered).

## Stale-lock check
No lock existed at run start (previous run's lock was already deleted). Own lock created fleshout-2026-10-17T11-01-17Z; all three worktrees registered with WT_RUN_ID matching the lock's run_id (the 2026-10-16 lesson) — no stale-lock incident this run.

## Arms

### sim-attrcensus — DIAGNOSTIC GO (LANDED 78d797fd)
The trick-funnel's bottom gap (98 performed → 56 kill-attributed): 80/80 performed-but-unattributed fights classified, 0 unattributed, 0 instrument errors (43 from existing trickfunnel data + 37 from a fresh 8-run read-only instrument re-sweep).
- 49% performer-died (scholar dies performing the trick — discovery, not a kill); 48% target-fled (disengage/dismissal isn't death). a1 tag-drop = 0/80 — when a trick-bearing monster dies in a won fight, the trick IS attributed. The attribution channel is healthy.
- One fixable blank (~4%): 3 pyrrhic kills — trick-bearing monster died AND scholar died, result 'lost' forfeited the whole kill ledger (no waveKillLog, no codex 'slain', no villageSlain, no wave deed). Named fix for a future arm: extend tbEnd's ledger to 'lost' (ledger + codex; loot stays forfeit). Steve-call: do pyrrhic kills grant wave-unlock deeds? (the 'lost'-forfeit is deliberate design).
- Verdict: LETHALITY/DESIGN question, feeds the #411 fight-shape mismatch — not win-truncation. Proof 25/25 GREEN (coordinator re-verified). 3 LOUD telemetry lines, all explained (pre-seat substrate-mismatch + seed noise n=8); baseline kept.

### sim-helpcall2 — PRIMARY GO 0.467x, GUARDRAILS SPLIT → PARKED (LANDED 6234a8c6, evidence+instruments)
The crisistier named next: aid-engaging policy (HELPCALL=1) on the crisistier-fixed substrate, pre-seat. 32/32 runs, 8 fresh seeds.
- PRIMARY GO: post-invite raid-attributed deaths armed 14 vs control 30 = 0.467x ≤ 0.75x; paired deltas 7 negative / 1 positive / 8 ties — systematic.
- SECONDARY: 38 placements (33 sent / 2 nolink / 3 died), 30 accepted / 3 refused = 0.909 acceptance, 100% attribution. Refusals read as the crisistier apex penalty working ("The Red Table said no.").
- GUARDRAIL SPLIT: median survival 155.5 vs 172d (need ≥162d — sign test p≈0.45, statistically weak; worst pair sense-read as ordinary raid attrition, not aid-caused); aid-runner deaths 3 ≥ 3 (engine-designed honest cost of the RUNNER call verb, not a novel pathology; 3 runners vs 16 prevented raid deaths).
- Verdict per §14: PARKED — the lever works but its costs need the follow-up before promotion. Named nexts: cost-accounting arm (fresh-seed replication of the survival gap + runner-absence instrumentation, pre-register aid-runner as counted cost); the engagement-volume question (38 placements this run vs 13 on the prior arm — unexplained).
- COORDINATOR CORRECTION: my brief's premise was factually wrong. I told the worker the prior arm ran on a broken pre-crisistier substrate; in fact crisistier committed 15:09Z, the prior arm started 17:15Z, and the prior arm's 13 placements are mechanistically impossible on the broken substrate (the gate reads crisis.wave≥3, which pre-fix always read 1). The prior null WAS on the fixed substrate; the GO-vs-null delta belongs to substrate deltas (NODEWITNESS, TRIBFLOOR gate, fresh seeds) + unexplained engagement volume — not the fix. Documented in the evidence's metric review.

### sim-vetcompose — PRIMARY NO-GO (binding) → KILLED (LANDED 304c3cee, evidence+instruments)
The wave4census named next: vetrel's companion-veteran channel composed into the FULL win-side stack (seatdrive-composed, SEATDRIVE=1), 8 fresh seeds × {leadseat,belongseat} × 2, 180d.
- PRIMARY MISS: runs ever showing ≥2 living veterans armed 1/16 vs control 0/16 (bar ≥+3) — NO-GO. MECHANISM GO: companion wave-3 kills 8 vs 0 (bar ≥+6) — the channel works.
- Why: the win-side stack TRUNCATES at the win — 28/32 runs ended ~day 90; the only armed run that ever showed 2 living veterans was the one that did NOT win (full horizon, 4 companion kills). Two other runs showed "(1 of 2 veterans)" then fell back to 0 (the blooded killer died before a second was blooded). The systems work on incompatible clocks.
- Named next: the readiness-gate steve-call (#427) is now specific — is the 2-living-veteran demand the intended tightness when the win stack truncates the horizon the proven companion channel needs? (Options: loosen the demand — standingCfg calls it "sim starting point" — or count veteran kills rather than living veterans, with fiction consequences.)
- Guardrails all PASS (wins 13 vs 15 ≥ control−2; national 14 vs 13; exiled 0; no new death mode). Proof 32/32 GREEN on rebased base (coordinator re-verified). Measurement correction in evidence metric review: the sweep read result.won (undefined) — 28/32 wins were repaired via asserted 1:1 sit/winline consistency; primary/mechanism never touched wins.
- Sense: the vet2 transcript reads as a village story (Rahmat, Sanne, Meera, Tariq, Yuki, Ines bringing down wave-3 monsters "Together"); off-screen companion kills are narratively silent. Two [open] fiction gaps appended to sim-findings.

## Wall numbers this run
- Full-stack + seatdrive (vetcompose, 32 runs): wins armed 13/16 vs control 15/16, national 14 vs 13, wave-4 unlocks 1/16 (non-win path), median ~90d (win-truncated).
- Pre-seat (helpcall2, 32 runs): national 10 vs 11, table 12=12, wins 0=0, wave45 0 vs 2, median 155.5 vs 172d.
- scale-onramp stays converging: the veteran bind is now precisely located (2 living veterans never sustained on the win stack's truncated horizon; the proven channel needs design-shape resolution, not more composition), the aid chain works with real costs, and the funnel's bottom is a lethality/design question — not an attribution bug.

## Telemetry
Consolidated coordinator check (vetcompose + helpcall2 globs vs scale-wall baseline): vetcompose 3 LOUD (national 12→27, table 16→32, wins 16→28) — EXPLAINED: 32-file glob vs 16-run baseline counts (n-mismatch); per-side paired comparison armed 13 vs control 15 wins, wall unchanged. helpcall2 2 LOUD (national 12→21, wins 16→0) — EXPLAINED: n-mismatch + pre-seat substrate-mismatch by design (own control 0=0). Baseline kept everywhere. No roll.

## Metric review
- attrcensus: diagnostic PRIMARY (100% attribution) met as pre-registered. No metric doubts.
- helpcall2: PRIMARY met; guardrails split per binding rules — parked, not re-scored. The brief-premise correction is a finding about THIS run's brief, not a re-score.
- vetcompose: PRIMARY missed cleanly (+1 vs +3 bar) — killed per §14, not re-scored. The wins-correction was instrument repair, not a metric change.

## Blanks filled / documented
- FILLED: the funnel's bottom gap attributed (80/80); the pyrrhic-kill ledger blank named for a future arm.
- DOCUMENTED: aid acceptance/refusal split (0.909 acceptance on apex raids); win-stack truncation vs veteran-horizon incompatibility; #427 sharpened to the specific demand-shape question.
- SENSE: all three arms read transcripts — the eater/acceptance/refusal beats, the companion-hunt village story; hold beats name the veteran bind honestly.

## Infrastructure notes
- One stale-index resync this run (shared index held the 05:40 UTC bump's staged version files; HEAD and worktree both correct at the 11:24 UTC tag; `git read-tree HEAD` per the documented lesson) — no sibling work harmed (index-only content, already superseded).
- Master moved under the run twice (B's rackschannel-b mid-registration; the attrcensus worker rebased onto the batch-ship bump 39970a23): every landing rebase-then-merge in the worker tree + proof re-run green on the new base + unpiped merge with MERGE_EXIT checked; no conflicts (all arms scripts/evidence-only).
- Rotation file untouched (standing directive overrides while scale-onramp ≠ converged).

## For the next coordinator
- The readiness-gate steve-call (#427) has its sharpest form yet: 2-living-veteran demand + win-stack truncation = the bind, measured on 3 consecutive runs. Next arm on the axis should either run the cost-accounting arm (helpcall2's named next) or address the #427 demand shape — no further vetrel composition.
