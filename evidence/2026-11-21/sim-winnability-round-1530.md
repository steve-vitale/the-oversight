# Loop B round 1530Z — winnability chain (poolfirstfail-refreeze DIAG-GO + profilegate-confirm NO-GO on frozen D3)

**Run:** fleshout-loop-b-20261121T1530Z · **Axis:** winnability chain · **Master at closeout:** `c1b4a3127`
**Type:** Two arms, both taken in order from the 1430Z round's next blanks (1) and (4).
**Loop A live on scale-onramp throughout** (1415Z claim: draftmiss / m1range / vanishcause — NOT touched). Loop A landed all three arms mid-run: draftmiss DIAG-GO `451d3ac31`, m1range NO-GO (lever + revert `237ad3c53`), vanishcause DIAG-GO (`abfc8f466` tip at closeout of A's run). Master moved under this run: `3e13d63d8` → `df4867134` (journey r248, evidence-only) → `abfc8f466` (Loop A) → `e0bd9688d` (arm 1 merge) → `c1b4a3127` (arm 2 merge).

## Run start

- No B lock existed; new lock + claim `fleshout-loop-b-20261121T1530Z` written (axis winnability-chain, arms sim-poolfirstfail-refreeze-b + sim-profilegate-confirm-b).
- Pre-flight: main tree clean, disk 45%, `worktree-reap.sh` clean (removed nothing, 10/16 active). Write flap window from 13:46Z appears ended (ALL-OK since 14:38Z, confirmed 14:58Z); no flap block on any write this run. One machine restart ~16:23Z killed the confirm arm's OFF leg at 2/16; the worker resumed the remaining 14 seeds under identical env/anchor (driver refuses overwrites; pre-restart files verified).
- Worktree registration queued ~17 min behind registry lock contention (both trees registered clean eventually); heartbeats current throughout.

## Telemetry deviation check (owed from 1430Z — run at coordinator level)

Ran `node scripts/telemetry-check.js` against the profilegate ON corpus (`perseed-profilegate4-b-on/*.json`, `--sweep-rows --allow-recorder-corpus`): 3 LOUD lines (national 12→0, table 16→0, wins 16→0), all REGIME artifacts per the baseline's own `_regime.note` (WINSEAT full win-stack baseline vs competent-only pre-seat substrate, where wins are structurally ~0). Baseline NOT rolled. Note: the script refuses recorder corpora by default ("sweep recorder rows, not runs") — the `--allow-recorder-corpus` form was used, matching prior runs' adjudication. The §15 panel remains the operative instrument for the confirm arm.

## Arm 1 — sim-poolfirstfail-refreeze-b: DIAG-GO (LANDED `e0bd9688d`)

Re-freeze of `EXPECTED.anchor12` to `'df40fced12a0'` (Option A, authorized by the 1430Z round record) in new `-refreeze-b` instrument copies, then the judged leg re-recorded on band 106731–106738 under the frozen `src/` checkout. Two-stage worker history, both committed on the branch:

- Stage 1 (`4648c959d`): anchor re-freeze landed, proof 47/48 — the single failure was the inherited §1 check "pool-path files identical between frozen base `df40fced1` and HEAD". Cause, measured: HEAD carries the PROFILEGATE4 lever (`84e57fcc3`, landed in the 1430Z round after the re-anchor prereg froze) in `villager-brain.js` (+26) and `win-plan.js` (+26), so the `df40fced1`→HEAD `src/` delta is six files, not the four the re-anchor prereg recorded. The worker stopped per the proof gate instead of hand-adapting a frozen guard.
- Coordinator decision: re-freeze §1 to assert the delta is exactly the env-gated PROFILEGATE4 lever (PROFILEGATE4 unset in the run env), since the judged leg runs under the frozen `src/` checkout and HEAD's code cannot affect it. Bars (a)+(b)+(c) and the reproduction criterion untouched.
- Stage 2 (`96e505575`, rebased to `e0bd9688d`): rationale verified from the real diff (six files exactly; the two new pool-path files contain ONLY the `profilegate4On()`/`profilegate4OpenFor()` helpers + one gate-line change each; 50 added lines, 2 removed, every added line classified). §1 re-freeze amendment written to the prereg (~16:12Z, before any judged sim). Proof GREEN 51/51 (first re-run 50/51 on a bug in the worker's own new check — a missed backtick in the prereg marker string — fixed, re-ran green). Judged leg under frozen `src/` (driver exit 0, 8/8 seeds, 0 instrument errors, ~294s); `src/` restored to HEAD immediately after and verified.
- Verdict DIAG-GO: (a) 138 snapshots / 0 problems / census 1030, 0 bad seeds; (b) binding first-fail `notRanger` 417 vs `away` 305 of 781; (c) proof 51/51, analyzer selftest 78/78, 8/8 parse, 0 errors, `substrateBadFiles` 0. **Every frozen Leg P number reproduces exactly**, and all 8 re-recorded corpora are byte-identical to the originals after stripping only label fields (`arm`, `run`, `anchorCommit`, file names). Leg R 10/10 exact; wave-4-target launches 37; binding gate 134/134; relax-profile fills 104/104, relax-away/trust fill 0.
- Balanced panel §15: N/A for a DIAG arm (no before/after; the original prereg says so explicitly) — the reproduction comparison serves the §15 function (same band/policy/flags/horizon/frozen code run twice, corpora byte-identical).
- Wall (recomputed, identical to the original band): wins 0, national by rank 0, national by standing 3, table 0, wave-4 8/8, wave-5 3/8, median survival 146d, survived 3/8, deaths 670, starvation 3, standing-199 stall ×4.
- Sense-testing: day-28 "Ming just put down The Callback… on CAMERA", day-8 door fight, day-109 empty-pool row with named members Luis/Nathan/Nikolai away, gen_ickx95o and visjoin_102 one range point short of wanderer.
- Landing: rebased onto `abfc8f466` clean (master's move carried zero `src/` changes — m1range lever reverted, vanishcause instrument-only); landing proof re-run 51/51 on the rebased tip under the frozen `src/` checkout; merged ff-only `e0bd9688d`; worktree released + removed, branch deleted. Safe-commit index clobber struck on both worker commits — repaired via cacheinfo each time, commits verified correct.

This corrects the 0430Z arm's NO-GO anchor clause on the record: the original bar (c) could never have passed with any stamp (9-vs-12 comparison). The decomposition itself stands, reproduced exactly.

## Arm 2 — sim-profilegate-confirm-b: NO-GO on frozen D3 only (LANDED `c1b4a3127`)

16-seed fresh-band confirm of the landed PROFILEGATE4 lever (band 106751–106766, verified fresh in prereg scope: zero hits across all prereg files and all evidence .md files; the only hits anywhere are data values inside old Oct census JSONs). No `src/` change — the lever is already on master; legs differ ONLY by the PROFILEGATE4 flag. Bars B1–B5 inherited verbatim from the pilot prereg; anchor `df4867134`.

| Bar | Frozen threshold | Measured | Result |
|---|---|---|---|
| B1 pool fills (wave-4+ dawns) | empty ≤ 0.47 AND mean ≥ 1.5 | empty **0.0476**, mean **2.99** (OFF 0.7466 / 0.336) | **PASS** |
| B2 launches rise | ON ≥ 5 AND ON > OFF | ON **14** vs OFF **8** (events 116 vs 59) | **PASS** |
| B3 cost (parent's bar) | starvation ON ≤ OFF+2; arm-only ≤ OFF+2; median ≥ 0.8×OFF | starvation **11 vs 10**; arm-only **3 vs 2**; median **151 vs 150.5d** | **PASS with margin** |
| B4 damage (tracked) | — | pooled **0.1198** over 7 meetings (pilot ON 0.0336, this band's OFF 0.0488; best 26.2%, 1 launched kill) | TRACKED |
| B5 instrument | proof green, D1/D2, D3 CLEAN, panel, anchors, 16/16/16/16, 0 errors, classified ≥ 0.9, unknown 0 | proof **72/72**; D2 **0/0**; drift **15/16 CLEAN + 1 DRIFT (106751)**; panel built; anchors all `df4867134afa`; 16/16/16/16; 0 errors; classified **1.0**; unknown **0** | **FAIL — D3 only** |

**Wall:** national 0/16, table 0, wins 0, wave-4 16/16, wave-5 5/16 ON (6 OFF), survived 10/16 ON (11 OFF), standing-199 ×9 ON. Seven seeds byte-identical off vs on.

**The D3 flag is a proven false positive — but the verdict stands as measured.** Seed 106751 diverges day 75 vs the frozen first-lever-day (first world-tick v4 seed row) day 111. Closed causal chain from the corpora: day 67 **both legs** — gen_ggt7q0q meets the influencer via agency-flee, seeding the needWave≥4 plan; day 68 ON — `party_launch` pick on that plan; day 74 ON — gate-open pool row (3 foragers, bid luis_fernandez) and a 4-person party launch; OFF day 74 — no depart at all; day 75 — fingerprints diverge. The frozen bound is non-conservative: agency-flee/evade rows also seed wave-4 plans. Under the corrected bound (first needWave≥4 pool row, day 74) the seed is CLEAN. Per §14 and the poolfirstfail re-anchor precedent, the worker did NOT re-score mid-run: verdict NO-GO, correction proposed for the next run (re-freeze the bound, re-run D3 on these same corpora — no new sims needed). If D3 passes under the corrected bound, the verdict on this evidence becomes GO.

**Panel §15 `review_required`:** deaths/100d `regression_signal` (56.2→64.5, interval +3.0 to +14.4). Investigated and priced: expedition deaths +64, three extra village collapses (106754/106757/106764 survive OFF, collapse ON) — the road-death cost of launching, which the frozen B3 bars (starvation + median) don't see. The next cost bar should price expedition deaths and early loss (finding #2641).

**Sense-testing:** the 106751 day-74 launch reads as people choosing to go (holder + three named foragers, trust 90/90/35, met the influencer and backed off). Ordinary-launch silence confirmed on this band: **0** launch-mention `vetSays` lines across all 16 ON files (finding updated).

**Proof history:** first proof run 70/72 — a sed-rename leak pointed the test at the pilot driver, and fixture seed 106757's ON leg scores only 1 v4 dawn. Both fixed before any judged leg (dated prereg CORRECTION switching fixture to named alternate 106764: OFF 28/19, ON 26/0, mean 2.808); re-ran 72/72 green. `check.js --quick` INCOMPLETE (280s timeout, 159/344, 0 failures), recorded honestly.

**Landing:** rebased onto `e0bd9688d` clean (arm files byte-identical across the rebase, verified 0 diff lines; commit contains only arm files). Landing proof re-run 75/76 — the single failure is a rebase artifact, not an arm defect: the proof's "scripts diff vs base is the instrument only" check sees sibling instruments that landed on master after the branch's base (m1range-a, vanishcause-a, poolfirstfail-refreeze-b scripts) in the diff vs the frozen base `df4867134`. The arm's own commit touches only its 78 files; the 75 other checks pass, including the live gate-act checks. Merged ff-only `c1b4a3127`; worktree released + removed, branch deleted. Safe-commit index clobber struck once — repaired, verified.

## Wall (this run's judged corpora)

Refreeze band (recomputed): wins 0, national by rank 0 / by standing 3, table 0, wave-4 8/8, wave-5 3/8, median 146d, standing-199 ×4. Confirm band: wins 0, national 0/16, table 0, wave-4 16/16, wave-5 5/16 ON, median 151d ON, standing-199 ×9 ON. The scale wall stands: the pool is confirmed no longer binding on 16 fresh seeds, damage improved (0.1198 pooled) but is still a fighting-strength problem, and the veteran/standing wall stands behind it.

## Metric review

- Refreeze: the anchor re-freeze and the §1 re-freeze are both corrections to frozen guards made BEFORE any judged leg, each authorized by a coordinator decision and recorded as a dated prereg amendment with verified diff evidence. The bars and reproduction criterion were never touched. The 0430Z NO-GO's anchor clause is corrected, not re-rolled.
- Confirm: B3 passes with margin on 16 seeds — the pilot's exact-at-bar fragility did NOT reproduce. The NO-GO rests entirely on D3, whose bound is proven non-conservative on a closed causal chain. The correction (re-freeze bound, re-run D3 on the same corpora) is a next-run job, not a re-score of this one. The panel's deaths/100d regression_signal is a real measured cost the frozen bars miss — the next cost bar must price expedition deaths.
- Dmgpin: still STOPPED (port would revert the #2634 downedtwice fix); the re-port brief is still owed.

## Findings backlog

- #2639 (new, open): D3 first-lever-day bound non-conservative — agency-flee/evade rows seed wave-4 plans before the first world-tick row.
- #2641 (new, open): road-death cost of launching unpriced by the scalemetric cost bar; selected-blocked 14/35; standing-199 ×9; damage 0.1198.
- #2638 updated: confirm ran — B1/B2/B3 pass on 16 seeds, B5 NO-GO on D3 only; no default flip until the D3 re-judge lands.
- Ordinary-launch silence updated: re-confirmed, 0 launch-mention lines on 16 ON files.

## Next blanks (in order)

1. Re-freeze the D3 first-lever-day bound (first needWave≥4 pool row) + re-run D3 on the confirm corpora, then re-judge B5 — no new sims; if D3 passes, the confirm verdict on this evidence becomes GO.
2. Dmgpin re-port brief: port pinquaddoor onto current master preserving the #2634 pick line, then re-judge #2619 via the control-only scout pre-screen.
3. Damage wall: launched parties deal 11.98% pooled on the confirm band (up from 3.36% pilot) — still the next lever after the pool, but the number moved; a damage-per-launched-party lever, not more pool fill.
4. A cost bar that prices expedition deaths + early loss (finding #2641) before the next launch-cost judgment.
5. Ordinary-launch silence: a fireside departure beat for wave-4+ launches (finding, no number — updated this run).
6. #2605 launch engine still BLOCKED on the held sim-pinquaddoor-b branch.

## Evidence

- `evidence/2026-11-21/sim-poolfirstfail-refreeze-b.md` (commits `5947c656c` + `e0bd9688d`), prereg (with §1 re-freeze amendment), `poolfirstfail-refreeze-b-analysis.json`, `poolfirstfail-refreeze-b-prooftest.log` (51/51), `poolfirstfail-refreeze-b-legs.log`, corpora `perseed-poolfirstfail-refreeze-b-106731-106738/` (8 files)
- `evidence/2026-11-21/sim-profilegate-confirm-b.md` (commit `c1b4a3127`), prereg (with dated CORRECTION), `profilegate4-confirm-b-analysis.json`, `profilegate4-confirm-b-panel.{json,md}` (+ before/after `.json.gz`), corpora `perseed-profilegate4-confirm-b-{off,on,rec,rec0}/` (16 each), `profilegate4-confirm-b-legs.log`
- This file: `evidence/2026-11-21/sim-winnability-round-1530.md`

## Infrastructure

- No write flap block on any write this run (first clean window since the 13:46Z episode).
- Safe-commit index clobber struck on 3 worker commits — repaired via `ls-tree -r` + `update-index --index-info` each time, commits verified correct by blob hash.
- Machine restart ~16:23Z killed the confirm OFF leg at 2/16; resumed cleanly (14 remaining seeds, identical env/anchor).
- Rebase stop-at-pick quirk did NOT strike this run. No EPERM on any merge.
- `check.js --quick` NOT re-run at coordinator level: zero `src/js` changes in either arm; the confirm worker's attempt was killed by the 280s timeout at 159/344 with 0 failures; the refreeze arm's proof re-ran 51/51 on the merged tip. Recorded honestly, not green.
- No push, no bump, no live verification — merged locally, pending ship (batch ship loop owns deploys).
