# LOOP B RECOVERY RUN fleshout-loop-b-20261016T1722Z (1 GO / 1 KILLED-AT-ADJUDICATION, all landed — 8bf32c80 + 95ce25b0)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b · Axis: food-economy.
Stale-lock recovery on run fleshout-loop-b-20261016T1435Z (lock 1h54m old, both arm trees' heartbeats >15min stale, no live subagents). Both workers had delivered complete, uncommitted work; the coordinator verified proofs independently, adjudicated, committed via safe-commit.sh, rebased onto master, merged --ff-only, released trees. Precedent: 2026-10-16 0955Z recovery run.

## sim-drawvol-b — GO (LANDED 95ce25b0)

Daily drawdown-outflow cap (2500 kcal) when fresh-days < 6. New policy file scripts/policies/drawvol.js (DRAWDVOL=1 default OFF, unset = byte-identical delegation), zero src/js. 32 runs (8 fresh seeds [982–989] x {belongfeast,leadfeast} x {control,armed}, 180d death-aware, pre-seat courtship, own paired control).

- PRIMARY GO: starvedDays 48 <= 50 (control).
- ENGAGEMENT GO: 13 holds when fd<6 (>= 8) — 12 feast + 1 aid.
- Guardrails GO: national 14=14; median 135.5 >= 122.0; no new death mode; social verbs 203 >= 103.5 (aid+feast count); 9/16 pairs byte-identical (non-engaged).
- Proof 31/31 GREEN (coordinator re-ran with the documented FEASTSCALE_R13=1 SEATDRIVE=0 env — an env-less first attempt failed 7 checks; env sensitivity documented in the evidence file header). Det-gate byte-identical both sides; SMOKE green.
- Mechanism autopsy (evidence/sim-drawvol-b.md): the cap as built is predominantly a big-feast brake on thin pantries (12/13 holds fired with dayTotalBefore=0 — the feast's own 2.8–3.2k cost exceeded the 2.5k cap on fd 1.0–5.4); only one hold exercised the obligated+discretionary stacking the #200 hypothesis named. Aid volume moved 54k→41k; feast volume flat. Effect: starvedDays -4% on noisy paired deltas — a marginal-drain trim, not a starvation fix. Named next: measure whether the stacking channel (obligated+discretionary co-occurrence) is actually a live drain before another volume arm.

## sim-crumbdefault-b — NO-COVERAGE diagnostic, KILLED (instruments+evidence LANDED 8bf32c80)

No-fractionating DEFAULT on the granular substrate (Steve's 2026-10-16 redirect; #121 ruling as default, root cause closed by 0152a2ce). src/js/game.js pantryDraw floor1 (whole-piece take default, stoppedForCrumbs removed) + takeHist min(taken,dayWant). 32 runs (8 fresh seeds [3101–3108] x {leadcourt,belongseek} x {control,armed}, 180d death-aware, pre-seat courtship, own paired control).

- Proof RED→GREEN→DETGATE→DETCMP→SMOKE ALL GREEN (coordinator re-ran the full patch dance; mechanism engages 18–26 crumb-takes/40d vs 0 pristine).
- Adjudication per the pre-registered header: PRIMARY NO-GO (starvedDays 41 > 37); COVERAGE split (stoppedRefusals 1439 >= 20 GO, crumbs-left starvedDays 0 >= 2 NO-GO → no-coverage diagnostic); HETEROGENEITY NO-GO (max per-seed +7, leadcourt-s3104 1→8); guardrails: national 13>=12 GO, median 171>=170 GO, freeloadStage2 0<=1 GO, dehydration 3 vs 0 NO-GO (new-death-mode bar n>=3, tripped at the noise floor).
- Verdict per §14 binding: NO-COVERAGE diagnostic — layer DELETED zero-trace (game.js reverted byte-identical); proof + sweep + analyzer + sense scripts + evidence landed as instruments.
- Mechanism autopsy: 1,439 control refusals became 1,289 armed whole-piece takes — the behavior change is real and large — but the crumbs-left path never starves on this substrate (0/16 control); armed empty-pantry starvation ROSE 17→23. The marginal-pantry cost mode from sim-crumbs-b (0955Z) REPRODUCES on the granular substrate: whole-piece takes drain marginal pantries; the 500-kcal piece bound did not fix it. Metric review: the header binds; next run's candidate is the 0955Z guarded-variant spec (whole-piece take only above a pantry floor — steve-call candidate), not a larger seed set.

## Wall numbers (every run)

| arm | national | table | wins | w4 | w5 | median |
|---|---|---|---|---|---|---|
| drawvol control | 14/16 | 14/16 | 0/16 | 15/16 | 8/16 | 132.0d |
| drawvol armed | 14/16 | 14/16 | 0/16 | 15/16 | 7/16 | 135.5d |
| crumbdefault control | 14/16 | 0/16 | 0/16 | 6/16 | — | 180d |
| crumbdefault armed | 13/16 | 0/16 | 0/16 | 8/16 | — | 171d |

Pre-seat courtship substrate throughout (wins 0/16 by design); telemetry LOUD lines all EXPLAINED (n-mismatch raw counts; substrate-mismatch vs full-stack baseline; schema drift on per-row out files). Baseline kept (national 12, table 16, wins 16, exiled 0).

## Infrastructure notes

- safe-commit.sh directory-pathspec refusal (known): passed individual files.
- safe-commit.sh post-commit stale index: `git read-tree HEAD` resync before trusting status or rebasing (AGENTS.md lesson, reproduced exactly).
- Mid-landing master movement (playtest journey-establishment r7): rebase per branch + merge --ff-only, exit codes checked unpiped. First drawvol merge failed fast-forward (crumbdefault landed first) — rebased and re-merged clean.
- Loop A's claim file (fleshout-20261016T1526Z, scale-onramp) still present but their run appears dead (no lock, all tree heartbeats >15min stale, no tree writes 1h40m+); left their claim and trees untouched. This run's axis (food-economy) did not conflict.

## Correction (18:26Z, post-landing)

Loop A's new run (fleshout-20261016T1715Z, live since 17:46Z) reports their old 1526Z workers were still alive with file writes 17:10–17:24Z — my run-start assessment "no tree writes 1h40m+" was wrong (I checked directory mtimes, which miss content-only writes). The dead-per-guard call was still correct at the time (no lock file, all three tree heartbeats >15min stale — sim-trickpack's 16:58 hb was 21min old), and loop A recovered cleanly with zero file overlap vs my landings (their deconfliction note explicitly cites this run's claim). Their three old trees were never touched by this run. The methodological lesson: heartbeat freshness and the lock are the authoritative liveness signals — directory mtime is not evidence of inactivity.
