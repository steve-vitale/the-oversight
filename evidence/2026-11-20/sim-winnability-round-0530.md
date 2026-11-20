# sim-winnability-round-0530 — Loop B 20261120T0530Z (axis winnability chain)

**Run status: CLOSED BY ADOPTION (Nov 20, ~07:30–09:00Z). Arm 1 judged NO-GO
and already merged evidence-only by the coordinator before the timeout; arm 2
judged NO-GO (guardrail) and HELD — verified by the adoption, never merged.
No push, no bump, no live verification (ship loop owns those).**

- Run: `fleshout-loop-b-20261120T0530Z`, Loop B, axis winnability chain.
- Base master `0d925556a` (ship bump `8cd4c0181-20261120-052438`).
- Coordinator timed out with both arms unsettled; adoption verified arm 1
  from its own branch/commits and waited for arm 2's worker to finish.
- Main tree clean at start; disk ~52%.

## Arm 1 — sim-dmgshape-b: NO-GO METRIC-BROKEN — VERIFIED BY ADOPTION, ALREADY ON MASTER

Damage-question re-measurement on the designated band 106181–106188
(finding #2605; follows the dmgsurvey GO designation from the 0130Z round).
ALLYSLOT3 ported first, as the 0130Z adoption's caveat required.

- Branch `sim-dmgshape-b`, tip `179bd09aa` (NOT an ancestor of HEAD — the
  coordinator rebased it onto master and merged the rebased commits
  `993f1faa0` / `c2b56f9a5` / `bdebb2259` at ~07:22Z before timing out).
  The coordinator's handoff claim "no merges" was imprecise — the merge
  happened, evidence-only, zero `src/js` changes in the landed range
  `0fd416c5d..bdebb2259` (verified by grep: ALLYSLOT3 absent from `src/js`
  on master).
- Prereg `8be39e1c3` (frozen ~06:40Z, before any judged sim; designated
  band 106181–106188, rerun bars verbatim, ALLYSLOT3 port `a1cd6cdc0`,
  policy `150229eda010`). Instrument `96728fb9f` (rerun driver copy,
  merged analyzer, proof test 9/9 + selftest 43/43 on the branch).
- Leg: single diagnostic leg, 8 seeds, 150d death-aware, substrate
  SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  ALLYSLOT3=1 (PORTED), LAUNCHSURVIVE=1. Competent verbatim.
- **Verdict NO-GO, kind METRIC-BROKEN.** Pool floor PASSES (9 first-fights
  ≥ 6; 6 fled ≥ 4) but classification FAILS: **3/9 = 0.333 vs the 0.90
  bar**. Four of six distinct first-fights dealt 0 damage — three Eulogy
  fights where the fighter spent every round on the "contradict"
  counter-trick instead of striking, and one Eater fight where the Rage
  holder died before landing a blow. The judged decomposition rests on
  TWO distinct strike-fights and its "passing" numbers are degenerate
  (accounted 1.236, top 179%, base-rate ceiling negative).
- **Third ally never fires:** 6 quad launches, but **0/156 recorded
  wave-4+ encounters carry ally3Vid**; ally3Dealt 0. The slot is live and
  staged-proven (18/18) but live play never invokes it — a sense-side
  investigation, not a slot fix.
- **Designation transferred in counts, not identity** (finding #2616
  QUALIFIED): 16 launches / 9 first-fights / 6 distinct on both the
  survey substrate and this leg — same counts, different events. One
  village (106184) crossed standing 199 → 530 and unlocked wave 5 on
  two kills (d135 Eulogy contact finish, d145 Influencer kill).
- Panel: RAN, decision `review_required`, no material signal (wins 0 → 0,
  national 0 → 0, deaths 89.125 → 88.875). Telemetry refused recorder
  corpora (same refusal as the rerun). Write flap QUIET this run.
- Adoption re-runs (not the worker's numbers): proof test
  `scripts/test-dmgshape-b.js` **8/9** in the adoption worktree on master
  — the one failure is §A, the analyzer selftest's §D driver smoke,
  which fails ONLY because ALLYSLOT3 is absent on master BY DESIGN (the
  driver refuses to run without the port: "ALLYSLOT3 slot code absent —
  the port is required for this diagnostic"). Analyzer selftest itself:
  **36/38** on master, the 2 failures being exactly that driver smoke;
  the other 36 checks pass, and §B corpus checks pass **8/8**. The
  worker's 9/9 + 43/43 were on the branch WITH the port. The test is not
  on the green list and is not run by `check.js`, so the gate is
  unaffected. The verdict stands on the branch-run corpus (8 files,
  0 instrument errors, reconciliation 0.0%).
- Evidence: `evidence/2026-11-20/sim-dmgshape-b.md` (+ prereg
  `evidence/2026-11-20/sim-dmgshape-b-prereg.md`, analysis JSON
  `evidence/2026-11-20/dmgshape-b-analysis.json`, panel files, perseed
  `evidence/2026-11-20/perseed-dmgshape-b/`) — landed on master with the
  coordinator's merge `bdebb2259`. The port commit `a1cd6cdc0` lives ONLY
  on the stale branch tip `179bd09aa`, never merged.
- Branch `sim-dmgshape-b` (stale tip `179bd09aa`): deleted at closeout.
  Adoption verified arm-file equivalence branch-vs-master first (empty
  diff across the evidence file, prereg, analysis JSON/log, leg log,
  panel files, perseed dir, and all four scripts). The port commit
  `a1cd6cdc0` is preserved on branch `sim-partysurvive-b` (`f4d1100ee`).

## Arm 2 — sim-deadgate-replace-b: NO-GO (guardrail) — VERIFIED BY ADOPTION, HELD, NOT MERGED

Re-placement of the dead-target gate (finding #2617) onto the brain
departure path (`vbrainExecuteDepart` party_launch) — the 0130Z adoption
established the `winPlanDepart` placement was wrong (gate wired into a
departure path launches never take; armed leg dead 2/6, GO bar failed).

- Branch `sim-deadgate-replace-b`, held tip `d75366901` (NOT merged, NOT
  an ancestor of master): prereg `0a2858061` (frozen before judged sims —
  brain-path gate, GO dead 2/6 → 0/6, armed launches ≥ 4; band
  106081–106088, the full designated #2617 band), gate build `92cb0a71d`,
  ONTOLOGY sync `28f142650`, evidence `d75366901`. Base master `0d925556a`
  + cherry-pick `3e37bf3c9` (the held arm's build commit `777efdde0`,
  applied cleanly, zero conflicts). The branch was NOT rebased by the
  adoption — the legs ran on this substrate, and the held branch is
  verified as-run.
- Gate build (verified statically by the adoption from the commit diff):
  `winPlanGateDeadTarget(vid)` helper in `win-plan.js` (flag-gated,
  non-creating plan read, same dissolve + `deadTargetHolds` bump as
  `winPlanDepart`); called from `vbrainExecuteDepart`'s `party_launch`
  branch BEFORE any `startExpedition`, returning `'normal'` on block.
  `winPlanDepart` gate kept as the backstop. Solo EXPEDITION fallback
  and `vbrainCommit` untouched, per the prereg's frozen scope.
- Worker status: alive through the armed leg (control leg log 08:01Z,
  armed leg driver 08:01–08:10Z), evidence committed `d75366901`, worker
  done 08:23:59Z. Adoption waited for its completion and did not
  duplicate its work.
- **Verdict NO-GO — primary GO, guardrail failed.** The gate works
  exactly as designed on the path that fires: **dead-target launches
  2/6 → 0/4** (armed launches 4, exactly on the floor — the two dead
  launches were blocked and replaced by nothing the analyzer counts),
  **the 106084 d136/d141 re-launch pair is gone** (armed 106084: 2
  launches, both live), **`deadTargetHolds` 5** (106081: 2, 106084: 1,
  106087: 2). But the guardrail fails: **median survival 150.5d →
  143.5d, survived 5/8 → 3/8**; starvation deaths flat 2 = 2. Two added
  famine scatterings, both on treated seeds, both diverging exactly at
  the first gate firing (106081 scatters d133, pantry 0, control ends
  3307; 106084 scatters d130, pantry 0, control survives 150d).
- **NEW — the retry hole (finding #2621, adoption-verified from the
  corpus):** the gate dissolves the plan and returns `'normal'` — and
  the villager still departs the same day. On armed 106084, brian_otieno
  d69: seq 128 result `'normal'`, stage `'party'`, target null, vidExped
  false (the block); seq 129 the SAME day result `'launch'`, stage
  `'hunt'`, target null, party of 2, vidExped true (targetless
  re-departure). He launched targetless 4 times (d69/d74/d79/d82) after
  the single block. Cause: `agencyTick` calls `vbrainExecuteDepart` up
  to 4× per villager per day and the only guard against a repeat launch
  is the `a.exped[vid]` check — a gate-blocked villager has no
  expedition, so the next day-part's tick re-executes the dissolved
  commit. Leading hypothesis for the guardrail miss: blocked hunters
  burn expedition time targetless instead of working the pantry
  (hypothesis, not proven cause: n=3 treated seeds). Owed: a same-day
  suppression fix (stamp the block day, return `'hold'` on later
  same-day calls) + guardrail confirm on this band, fresh prereg.
- **Silent dissolve (minor, flagged):** the gate dissolves a plan with
  no villager-facing beat — nobody says "we already killed the last
  herald." Steve's no-silent-actions law; a one-line fireside beat on
  `deadTargetHolds` would close it. Not built here (frozen scope).
- Control reproduces the held control corpus EXACTLY (6 launches, dead
  2/6, the 106084 pair; every per-seed trajectory number identical) —
  the determinism check passes; the gate code is inert with the flag
  off. Untreated seeds byte-identical both legs (106082/106083/106085/
  106086/106088); only the 3 treated seeds diverge.
- Panel: RAN, decision `review_required` (screen-only default);
  community loss 0.375 → 0.625 (+0.25, regression_watch) — the panel's
  version of the guardrail signal. Telemetry refused recorder corpora
  (same refusal as the held arm). Analyzer's own `verdict` field reads
  "DIAG-GO" on both corpora — that is the diagnostic instrument's
  verdict, not the gate verdict, which is judged here by hand against
  the prereg.
- Adoption re-runs (not the worker's numbers): proof test
  `scripts/test-deadtarget-gate-b.js` **73/73 green** and
  `scripts/test-deadtarget-diag-b.js` **22/22 green**, on the branch tip
  `d75366901`. Analyzer re-run by the adoption on both corpora:
  control launches 6, dead 2, live 4, unknown 0, classified 6/6;
  armed launches 4, dead 0, live 4, unknown 0, classified 4/4. Wall
  numbers re-computed by the adoption from the corpus JSONs: control
  median 150.5d, survived 5/8, holds 0; armed median 143.5d, survived
  3/8, holds 5. Retry hole confirmed row-by-row from the armed 106084
  corpus (seq 128/129 above).
- Evidence (HELD on the branch, NOT on master — same pattern as the
  0130Z held arm): `evidence/2026-11-20/sim-deadtarget-gate-replace-b.md`
  (+ prereg, both corpora `perseed-deadtarget-gate-replace-b-control/` +
  `-armed/`, leg logs, panel files). The gate code
  (`src/js/win-plan.js` `winPlanGateDeadTarget`,
  `src/js/villager-brain.js` gate call) stays on the held branch.
  Full record on the branch; this round file is the master summary.

## Wall numbers (dmgshape-b leg, 8 seeds, band 106181–106188)

Wins 0/8, national 0/8, table 0/8. Wave 5 reached 3/8 (survey 2/8),
wave 4 7/8, survived 150d 5/8, median survival 150.5d. Standing ≥ 200
on 3/8. Standing-199 stall: 3/8 (106181, 106183, 106186). Total deaths
711, starvation 4 (0.6%) — villages die fighting, not hungry.
Per-seed: 106181 150/151 survived / 4 / 199; 106182 150/150 survived /
5 / 425; 106183 150/151 survived / 4 / 199; 106184 150/151 survived /
5 / 530; 106185 117/116 village-lost / 4 / 155; 106186 145/144
village-lost / 4 / 199; 106187 60/61 village-lost / 3 / 99; 106188
150/151 survived / 5 / 515.

## Wall numbers (deadgate-replace legs, 8 seeds, band 106081–106088)

Wins 0/8, national 0/8, table 0/8 both legs. Wave 5 reached 4/8 both
legs, wave 4 8/8 both legs. Median survival 150.5d (control) → 143.5d
(armed); survived 5/8 → 3/8. Starvation deaths 2 = 2 (flat); total
deaths 756 → 737 (fewer armed). Per-seed armed: 106081 132 village-lost
/ 199 (control 151 survived / 410); 106082 151 survived / 199
(identical); 106083 142 village-lost / 445 (identical); 106084 130
village-lost / 345 (control 151 survived / 199); 106085 150 survived /
199 (identical); 106086 145 village-lost / 325 (identical); 106087 151
survived / 465 (control 151 survived / 390); 106088 140 village-lost /
199 (identical).

## Findings noted for the next run

- Finding #2605 — ANSWERED IN PART, pool-shape-blocked (dmgshape-b
  evidence §8): the re-measurement ran clean, the pool floor passed,
  and the designation transferred in counts — but the judged bars cannot
  be carried on this band under this policy because 4 of 6 distinct
  first-fights are 0-damage counterplay/death fights. The next run on
  this question needs a band whose first-fights STRIKE, or a
  decomposition that prices counterplay.
- NEW — third ally never reaches a live wave-4+ fight: 6 quad launches,
  0/156 encounters carry ally3Vid, ally3Dealt 0. Sense-side
  investigation, not a slot fix.
- NEW — counterplay fights need their own class: the Eulogy's contradict
  counter wins fights with 0 damage dealt (d110 mFlee). The damage
  decomposition cannot price that; a future prereg should classify
  strike-fights vs counterplay-fights before the pool floor is applied.
- Finding #2616 QUALIFIED — designation transferred in counts (16/9/6
  both substrates) but events re-rolled entirely.
- Finding #2617 — STILL OPEN, re-placement NO-GO (guardrail): the
  brain-path gate is proven placed and working (dead 2/6 → 0/4, pair
  gone, 5 holds) but the guardrail fails (median 150.5d → 143.5d,
  survived 5 → 3). The gate is HELD, not killed. Owed: the same-day
  suppression arm + guardrail confirm (fresh prereg, same bars), and a
  one-line fireside beat for the silent dissolve.
- NEW — the retry hole (finding #2621): a gate-blocked villager
  re-departs targetless the same day (agencyTick calls
  `vbrainExecuteDepart` up to 4×/day; no expedition set, so the next
  tick re-executes the dissolved commit). Verified row-by-row on armed
  106084 (brian_otieno d69 seq 128 block → seq 129 targetless launch,
  + d74/d79/d82). The same hole exists in the `winPlanDepart` path.
  Leading hypothesis for the guardrail miss.
- Standing-199 stall: 3/8 on this band; the 106184 crossing (199 → 530)
  shows two wave-4+ kills are enough to break it.

## Infrastructure

- GATE: fresh `check.js --quick` run by the adoption on base
  `59711ccc5` — log `evidence/2026-11-20/check-quick-round-0530.log`:
  **338 passed, 6 failed in 981s, 0 attributable.** The 5 standing
  failures (measurement-proof staleness pair, phone-frame stale
  receipt, 2 deed-attainment 120s timeouts) match the 0515Z adoption's
  fresh gate (339/5) profile; the 6th is `test-capable-bot-20261014.js`
  hitting check.js's 120s cap mid-sim (every assertion that ran
  passed) — re-run standalone in the adoption worktree by the 1030Z
  closeout: **42/42 PASS, exit 0** (slowness under load, not a
  failure). Zero `src/js` landed by this round (dmgshape
  evidence-only; deadgate HELD), so nothing in the round could
  produce a gate failure.
- Registry-lock jam at adoption start: `worktree-register.sh
  scratch-check-baseline` held REGISTRY.lock ~12 min on a slow
  `git reset --hard`; my adoption heartbeat (07:42:29Z) went ~14 min
  stale before landing 07:56:53Z. The deadgate worker's own heartbeat
  (07:21Z) was also jam-blocked. Same known jam family as the reaper
  skip streaks; no work lost. A second jam hit at 08:17Z (new Loop A
  run registering `sim-gunrate-a`); my 08:17Z heartbeat landed 08:28Z.
- VM restart ~07:20Z killed the deadgate worker's `check.js` re-run
  mid-flight (SIGTERM ~164s, /tmp wiped); run state in ~/workspace
  survived; heartbeat re-established first. A restart ~05:42Z preceded
  the run (brief note in the dmgshape evidence).
- Safe-commit index clobber: [PENDING at closeout.]
- Master moved once during the adoption (0515Z adoption closeout
  `59711ccc5`, gate 339/5); adoption worktree rebased onto it before
  the final gate. The Lane A r246 adoption was still running at
  closeout — master re-checked immediately before the merge.
- The deadgate worker's scratch baseline worktree registration was
  killed by the ~07:20Z restart and left a 17G orphaned partial
  evidence copy (unregistered, not a git worktree); the worker removed
  it with rm -rf.
- Claim + lock: [PENDING — deleted at closeout, same-call as the read,
  run_id verified.]

## Next blanks, in order

1. The damage question (#2605) — needs a band whose first-fights STRIKE,
   or a decomposition that prices counterplay (strike-rate loss term,
   §7 of the dmgshape evidence).
2. The third-ally sense question (#2619) — why a launched quad's sense
   never returns a third companion for a live wave-4+ fight.
3. The dead-target gate, next arm (#2617 / #2621): same-day suppression
   fix (block-day stamp, `'hold'` on later same-day calls) + guardrail
   confirm on band 106081–106088, fresh prereg, same bars; plus the
   silent-dissolve fireside beat.
4. The standing-199 stall (3/8 here; 15/32 on the 0130Z survey bands).

Winnability chain stays converging (NOT converged): the damage question is
still unanswered (pool-shape-blocked, not pool-thin), the dead-target
gate is proven placed but fails its guardrail, and nothing reaches
national or the table. Claim + lock deleted at closeout; this file is
the round record.
