# sim-winnability-round-0030 — Loop B 0030Z round record (2 arms LANDED, merged locally pending ship)

**Run:** `fleshout-loop-b-20261120T0030Z` · **Loop:** B · **Axis:** winnability chain ·
**Base at registration:** master `8bd330f22` (Lane A r244 counter-label fix) ·
**Master at closeout:** `904545499` (Loop A 2215Z adoption closeout, landed on top of this run's merges).
**Lock + claim:** created 00:30Z; claim `fleshout-loop-b-20261120T0030Z.json` (arms below).

## 0. Adoption verification (2130Z arms — already landed before this run started)

The 2130Z run closed flap-blocked with both arms HELD for adoption. By this run's start
the main-session adoption had already landed them; this run verified the landing
rather than redoing it:

- Rageholder: `ff54bd5e3` (evidence + round record, finding #2614 ANSWERED; GO,
  designated band 106151–106158) on instrument `407f5aeba` + prereg `feaadf80d`,
  rebased and merged ff-only. Dmgshape: evidence-only cherry-pick (`b766fc392`
  prereg + `c3134ef65` instrument + `9d178bd00` evidence + `be918544e` panel
  compare, review_required) — port `735fce64f` verified NOT an ancestor of master
  before and after. Both evidence files, corpora, panel files and scripts present
  on master; no rageholder/dmgshape branches or worktrees remain; round file
  `sim-winnability-round-2130.md` written; #2614 flipped to [answered], #2617
  filed [open]. No tracker review entry for that adoption existed — this file
  plus the tracker entry below is that record. The adoption's proofs (rageholder
  16/16, dmgshape 8/8 + selftest 28/28) are as recorded in the round file; the
  panel compare landed as `be918544e`.

## Arm 1 — sim-laterage-rerun-b: DIAG-GO (finding #2618 filed, answered)

Re-run of the laterage taxonomy on the designated holder-rich band 106151–106158.
Branch `sim-laterage-rerun-b`, tip `da23f6e3a` (prereg `eefb99222`), rebased from
`8bd330f22` onto `1cb6ce2e1` (ship bump) then `677d40057` (Loop A 2215Z adoption),
merged ff-only. Evidence-only: instrument + prereg + evidence + corpus; zero
`src/js` changes.

- Survey-first leg reproduced the designation survey **exactly** (136 encounters /
  33 holder-fights / 19 contact / 12 Rage fires, 0 errors); the judged leg
  reproduced it again exactly. The designation survives the base move — finding
  #2616 EXTENDS (base form) not triggered. Survey corpus deleted per the prereg
  after exact reproduction.
- **12 observable Rage fights** (floor 8, PASS); taxonomy complete (0 unclassified,
  0 anomalies); dominant delay cause **brawler_instinct, 6 of 6 delay rounds**
  (all one fighter, Luis — a description, not a population fact).
- **Fire-round distribution: {R1: 12} — 0/12 late (≥2), 0/12 at the ≥4 cut.**
  Rage never fires late on this band. Mean post-fire delay **1.5 rounds**
  (median 1.5; {1: 6, 2: 6}); never-landed 0/12; zero-damage 0/12; 35/36 doubled
  strikes land; foregone estimate **48** (one fight, own-doubled basis); Rage
  fights deal 4,210 total (mean 350.8/fight).
- Correction to the rageholder survey (filed on #2614): it claimed "no holder
  fight kills its monster." Three holder kills exist on the identical seeds —
  Luis (106158) vs herald d86, vs Eulogy d86, vs Algorithm d87. The damage wall
  still stands (big monsters never killed).
- Never-fire contact holders: 7 of 19 (Farid vs Rerun d142 deals 197 without
  ever firing).
- Proofs re-run by the coordinator on the rebased tip: `test-laterage-b.js`
  11/11, analyzer `--selftest` 16/16, driver exit 0 both legs, 0 instrument
  errors. Numbers re-aggregated from `laterage-rerun-b-analysis.json` — all
  match the evidence file.
- Wall: wins 0/8, national 0/8, wave-5 3/8, wave-4 8/8, median survival 150d,
  survived 6/8, standing-199 3/8, deaths 836 (starvation 7).

## Arm 2 — sim-deadtarget-diag-b: DIAG-GO (finding #2617 ANSWERED)

Departure-gate diagnostic for finding #2617. Branch `sim-deadtarget-diag-b`,
tip `6863c7b7b` (prereg `b40b72105`, instrument `b82d4ae38`, analyzer correction
`f4e7fbd28`, evidence `6863c7b7b`), rebased onto `da23f6e3a`, merged ff-only.
Evidence-only: instrument + prereg + evidence + corpus + panel; zero `src/js`
changes. The ALLYSLOT3 port `735fce64f` was NOT re-introduced (guard refusal
tested in the proof suite).

- **Code answer: no liveness check exists on the departure path.**
  `winPlanDepart` / `launchParty` / `winPlanFightGate` (`src/js/win-plan.js`)
  check stage, gear, companion launchability, and holds — never `villageSlain`,
  sightings, or recency. `plan.target` is never cleared anywhere in the file.
- Judged leg (band 106081–106088, landed substrate, 150d, competent verbatim):
  **6 launches** (pool floor 4 met); classified 6/6 = 1.000; **dead-target
  share 2/6 = 0.333** (live 4, unknown 0); gate snapshots 0 missing /
  0 mismatched; 0 duplicate depart rows; 0 instrument errors; 8/8 files.
- **#2617 partially reproduces:** the exact 106084 re-launch pair (d136 + d141,
  visjoin_114 → herald, last fight the d126 kill, 10/15 days later,
  `villageSlain[herald]=1` at departure, never refought) reproduces
  launch-for-launch. The 106081 pair does not — its holder died d113 of a wound
  and the kill moved to d117 (aid, different killer).
- **Sharper mechanism than the prereg guessed:** both dead launches departed
  from stage `'hunt'`, not `'standing'` — `winPlanNoteKill` fires only for the
  killer (villager-agency.js:694), so an ally-holder who fought beside the
  killer never learns of the kill.
- Analyzer correction (not a re-score): the first analyzer version misclassified
  both dead launches (same-day tie-break kept the first d126 row, a flee,
  instead of the last, the kill). The gate cross-check caught it (2 mismatches,
  verdict NO-GO INSTRUMENT); corrected to last-row-wins per the frozen "last
  pre-launch fought encounter" rule; before/after numbers documented in
  evidence §7.1.
- #2616 EXTENDS: launch rate 17 → 9 → 8 → 6 across substrate steps on identical
  seeds (survey → partysurvive-rerun → dmgshape-rerun → deadtarget-diag).
- Panel compare: `review_required`, no material signal (8 paired cases).
- Proofs re-run by the coordinator on the rebased tip: `test-deadtarget-diag-b.js`
  22/22, analyzer `--selftest` 22/22 (incl. 2 correction pins). Numbers
  re-aggregated from `deadtarget-diag-b-analysis.json` — all match the evidence
  file. (Coordinator note: the first selftest invocation used the wrong filename
  `analyze-deadtarget-diag-b.js`; the analyzer is `analyze-deadtarget-b.js` —
  my error, not the worker's; the earlier `SELFTEST_EXIT=0` in that call was the
  tail pipeline's exit, not the script's.)
- Wall byte-identical to dmgshape-rerun-b: wins 0/8, national 0/8, table 0/8,
  wave-5 4/8, wave-4 8/8, standing ≥200 4/8, standing-199 4/8, survived 5/8,
  median 150.5d.

## Wall (this run's judged corpora, 16 configs)

Wins 0/16, national 0/16, table 0/16, wave-5 7/16, wave-4 16/16,
standing-199 stall 7/16. Nothing reaches national or the table on either band.
The scale wall stands exactly where the 2130Z run left it; the two questions
this run was given are now answered, and the wall's next moves are the damage
question and the departure gate (below).

## Telemetry deviation check (coordinator)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-<arm>-b/*.json' --metrics national,table,wins,exiled`
— refused for BOTH corpora (verbatim): "telemetry-check: refusing
recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so
they are sweep recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." Same refusal as
laterage-b / dmgshape-b / rageholder-survey-b. No deviation recorded; wall
numbers above are reported directly. Baseline NOT rolled.

## Gate

`node scripts/check.js --quick` on the merged tip `904545499`
(`check-quick-round-0030.log`): **339 passed, 5 failed in 614s**. Failure set
byte-identical to Loop A's 2215Z run on the pre-merge tip: measurement-proof-update
(stale proof inputs — known, tracker rebuild header), measurement-workflow
(same stale neutrality proof), phone-frame-proof (stale receipt), and the two
deed-attainment TIMEOUTs (120s cap, load artifacts). **0 attributable to this
run** — zero `src/js`, zero green-list files in either arm; the arms' own proof
suites (11/11 + 16/16, 22/22 + 22/22) pass on their tips. Gate adjudication:
standing profile, not green, not a regression.

## Infrastructure

- **VM replacement ~01:42Z killed the first gate run** (uptime 1 min is the tell;
  the check.js session died SIGTERM with no output, piped through tail so the
  result was lost). Post-restart recovery per the lesson: heartbeats re-established
  first (no live trees of mine remained — both arms already merged), writes
  re-probed OK, lock + claim verified present, findings edits verified intact,
  gate re-run from scratch with output to a log file. No work lost.
- **Box saturated all run** (load ~14.5 on 1.5 CPUs at run start): git status took
  minutes (two sibling git-status runs were grinding concurrently, left alone);
  worktree registration took ~7 min for 2 trees; rebase + merge steps were slow
  but clean. No EPERM flap this run (writes passed from 23:41Z onward).
- **Master moved 3 times under the run:** ship bump `1cb6ce2e1`, Loop A 2215Z
  adoption `677d40057` (fusioncell DIAG-GO + spearstage NO-GO), Loop A round
  commit `904545499` (landed on top of this run's merges). Both branches rebased
  clean (laterage twice, deadtarget once); proofs re-ran green after every
  rebase. Worker flag corrected: origin/master is `1cb6ce2e1` (ship bump), NOT
  `17bb496df` as the laterage worker reported from a failed fetch — no extra
  rebase was needed; the worker's fetch failure was its own guard, not a repo
  state.
- **Safe-commit index clobber** struck the laterage worker twice and the
  deadtarget worker 4× — repaired each time via the documented
  `ls-tree -r | update-index --add --index-info` pipe (plus `--force-remove` of
  bogus survey-path entries once); all commits verified correct by `git show`.
  No clobber on the coordinator commit.
- Loop A live all run on scale-onramp (2215Z fusioncell + spearstage) — untouched.

## Findings (sim-findings.md)

- #2614 [answered] — CORRECTION appended: 3 holder kills exist on the survey's
  identical seeds; "no holder fight kills its monster" refuted.
- #2616 [open] — EXTENDS appended: launch rate 17 → 9 → 8 → 6.
- #2617 [open] → **[answered]** by sim-deadtarget-diag-b (DIAG-GO).
- **#2618 filed [answered]** — LATE RAGE FIRING DOES NOT HAPPEN (sim-laterage-rerun-b):
  0/12 late here, 0/1 laterage-b, only the dmgshape Fatima R4 sighting ever.

## Next blanks (in order)

1. The damage question (#2605) on a band surveyed under the FULL substrate AND
   current policy, or with a floor priced from a same-substrate pilot.
2. **sim-deadtarget-gate-b BUILD** — a departure gate in `winPlanDepart`
   refusing dead-target launches (villageSlain + last-fight recency),
   re-seeding/dissolving instead. Design calls owed first: type- vs
   instance-level liveness, holder-knowledge vs village-knowledge.
3. Standing-199 stall (7/16 this run, again).
4. The laterage question is answered — no third counting leg; a WHY arm or a
   move-on if it is revisited.

## Files

- Round record (this file): `evidence/2026-11-19/sim-winnability-round-0030.md`
- Gate log: `evidence/2026-11-19/check-quick-round-0030.log` (+ `.err`)
- Arm 1: `evidence/2026-11-19/sim-laterage-rerun-b.md`,
  `sim-laterage-rerun-b-prereg.md`, `laterage-rerun-b-analysis.json`,
  `perseed-laterage-rerun-b/` (8 files)
- Arm 2: `evidence/2026-11-19/sim-deadtarget-diag-b.md`,
  `sim-deadtarget-diag-b-prereg.md`, `deadtarget-diag-b-analysis.json`,
  `perseed-deadtarget-diag-b/` (8 files), `deadtarget-diag-b-panel.md`,
  `deadtarget-diag-b-panel.json`
- Tracker: `hidden_files/convergence-tracker.md` (review entry, this run)
- Findings: `hidden_files/sim-findings.md` (#2614 correction, #2616 extends,
  #2617 answered, #2618 filed)

Winnability chain stays converging (NOT converged): two questions answered
(late Rage firing never happens; dead-target launches have no departure gate),
but launched parties still cannot be damage-measured at scale, nothing reaches
national or the table, and the standing-199 stall recurs on 7/16. Scale-onramp
untouched; sibling Loop A closed separately. Claim deleted; lock deleted.
