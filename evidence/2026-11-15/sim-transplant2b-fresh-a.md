# H1 transplant — family 2b FRESH-BAND generalization: NOT-CARRIER

Run: fleshout-20261115T1715Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant2b-fresh-a` (worktree `~/workspace/worktrees/sim-transplant2b-fresh-a`).
Binding prereg: evidence/2026-11-15/sim-transplant2b-fresh-prereg.md — read it in full;
it binds every step below. Subject branch `transplant-2b-subject`
(`385a9f7b61ad3f0090cffd7eaa113b91f7c1fcac`) left in place, never merged.

## Recovery note (this run, fleshout-20261115T2015Z)

The 1715Z coordinator died after both judged legs ran (last worker
heartbeat 19:06Z; lock 3h old at recovery, past the 90-minute
fallback). The legs, summaries, and per-seed corpora survived in the
worktree uncommitted; no evidence file, no panel compare, and no
landing had happened. This run recovered the arm: re-verified the
summaries against the per-seed corpora (16/16 files, 0 instrument
errors), built both balanced-panel legs, ran the compare, re-ran the
proofs, and wrote this evidence from the recovered corpora. No leg
was re-run and no number was re-scored: the verdict below is the
frozen prereg mapping applied to the 1715Z legs as recorded.

## Verdict: NOT-CARRIER (family 2b does not generalize as a carrier)

Fresh band 190621–190628, 150d death-aware, competent verbatim,
fix standing swapped in:

- Baseline (far end `203a32775`): survived **0/8**.
- Subject (family 2b `385a9f7b6`): survived **0/8**.

The frozen mapping, Branch 2 (baseline B ≠ 4): S ≥ B−1 → NOT-CARRIER.
Here B = 0, S = 0: the subject sits exactly at the baseline, within
one of it. No re-run is owed (the re-run rule fires only in the
AMBIGUOUS band, which this read does not touch).

Family 2b is now CLOSED as a carrier suspect: AMBIGUOUS 2/8 twice on
the matched band (treated as NOT-CARRIER for ordering, kept on the
suspect list), and NOT-CARRIER 0/8 vs 0/8 on a fresh band. The
heard-filtered raid-danger belief read does not collapse survival on
either band.

## Prereg header (binds the run)

- Primary metric: survived/8 on the fresh band. B = baseline count,
  S = subject count. Branch 1 (B = 4): S ≤ 1 CARRIER, S = 2 AMBIGUOUS
  (one subject re-run), S ≥ 3 NOT-CARRIER. Branch 2 (B ≠ 4): S ≤ B−3
  AND S ≤ 1 CARRIER; S ≥ B−1 NOT-CARRIER; middle band AMBIGUOUS (one
  subject re-run, re-run count governs).
- GO threshold: none — measurement arm; no baseline gate on the
  subject leg (the prereg's only STOP is an instrument failure —
  none occurred). The subject branch is never merged.
- Horizon: 150d death-aware (dead villages stop simulating; +10d
  tail max). Why: the question is survival collapse in the
  wave/door window; 150d covers waves 4–5 and the table window.
- Seeds: FRESH band 190621–190628 (freshness record in the prereg:
  0 hits across 901 dated preregs + evidence-wide seed-context rg;
  raw-substring hits investigated as false positives).
- Policies: competent verbatim own-policy per step (each step runs
  its commit's OWN competent.js; driver records the sha per seed:
  `a7ff5c516440` both legs). Fix standing `f8fda4295a99` swapped in
  for every step, native restored byte-identical afterwards.
- Mode: `fix` only. Step ids: baseline `t2b-fresh-203a32775`,
  subject `t2b-fresh-385a9f7b6`. RUN: `transplant2b-fresh-pilot`.
- No baseline re-run: the driver is deterministic (2b proved
  byte-identical reproduction on a re-run).

## Per-seed table (both legs survived 0/8)

Baseline — far end `203a32775`:

| seed | days | end | scale | maxWave | standing | deaths | blooded | pantry kcal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 190621 | 125 | village-lost | regional | 4 | 199 | 70 | yes | 0 |
| 190622 | 112 | village-lost | regional | 4 | 150 | 99 | no | 4,940 |
| 190623 | 81 | village-lost | regional | 5 | 265 | 86 | no | 27,747 |
| 190624 | 119 | village-lost | regional | 4 | 165 | 70 | no | 0 |
| 190625 | 59 | village-lost | village | 4 | 185 | 49 | no | 2,250 |
| 190626 | 102 | village-lost | regional | 5 | 300 | 81 | no | 0 |
| 190627 | 133 | village-lost | regional | 4 | 175 | 96 | no | 6,368 |
| 190628 | 137 | village-lost | regional | 5 | 380 | 107 | no | 4,948 |

Subject — family 2b `385a9f7b6`:

| seed | days | end | scale | maxWave | standing | deaths | blooded | pantry kcal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 190621 | 75 | village-lost | regional | 4 | 190 | 56 | no | 6,935 |
| 190622 | 140 | village-lost | regional | 5 | 325 | 92 | no | 0 |
| 190623 | 132 | village-lost | regional | 5 | 370 | 102 | no | 14,693 |
| 190624 | 118 | village-lost | regional | 4 | 199 | 92 | yes | 0 |
| 190625 | 118 | village-lost | regional | 5 | 455 | 76 | yes | 7,004 |
| 190626 | 136 | village-lost | regional | 4 | 199 | 115 | no | 0 |
| 190627 | 149 | village-lost | regional | 4 | 199 | 89 | no | 0 |
| 190628 | 117 | village-lost | regional | 4 | 199 | 97 | no | 0 |

## Wall numbers (this run's judged corpora, 16 configs)

- National 0/16, table 0/16, wins 0/16.
- Wave-5 unlock 3/8 baseline, 3/8 subject; wave-4 8/8 both.
- Median survival 115.5d baseline, 125d subject.
- Deaths total 658 baseline, 719 subject; instrument errors 0 both.
- Death-cause shares (baseline): villager combat 267 (40.6%),
  expedition 175 (26.6%), the wild 94 (14.3%), combat 85 (12.9%),
  monster 12, starvation 5. (Subject): villager combat 274 (38.1%),
  expedition 192 (26.7%), combat 126 (17.5%), the wild 79 (11.0%),
  monster 15, starvation 3.
- Tribute: veterans-short on every seed both legs (0 wave-4
  veterans at end on all 16); BLOODED 1/8 baseline, 3/8 subject.

## The fresh band is harsher than the matched band — third corroboration

The far end reads 4/8 on the matched band 190391–190398 (settled,
reproduced twice) and **0/8** on this fresh band. That is the third
fresh-band corroboration of the band-sensitivity finding (8c: 1/8 on
190541–190548; ove48-freshband: 1/8 on 190561–190568; now 0/8 on
190621–190628). The collapse regime is band-sensitive in the same
direction every time: fresh bands read worse than the matched band.
A 0/8 baseline cannot show a subject collapse even in principle —
the mapping still judges NOT-CARRIER honestly (subject at baseline),
but the arm's power on this band is nil. Future transplant preregs
should keep the band-health pre-check the 8c finding already
recommends; on a 0/8 fresh band the honest read is "no carrier
signal available", and the verdict form says NOT-CARRIER only
because the subject did not underperform the baseline.

## Balanced panel (§15)

`evidence/2026-11-15/transplant2b-fresh-panel.{json,md}` (+
`-before`/`-after` panel.json.gz). Decision **review_required**;
8 paired cases, competent only, 150d, fresh seeds. No material
signal on any judged metric: table win 0 vs 0, national 0 vs 0,
player deaths per run 12.75 → 12.0 (−0.75, no_material_signal),
village deaths per run 82.25 → 89.875 (+7.625, regression_watch).
The panel agrees with the verdict direction (the family moves
nothing that matters) and, as an instrument, cannot overturn the
prereg's threshold — the threshold is the judge.

## Proof

- `scripts/test-transplant2b-fresh.js`: **112/112** on the arm
  branch (family identity, subject verification, band-freshness
  record, verdict mapping incl. both branches + re-run rule).
  Re-run at recovery: 112/112, including the panel-compare check
  that was PENDING at the worker's death (compare .md now exists).
- `scripts/test-culpritbisect-a.js`: **116/116** (re-run at recovery).
- `scripts/test-transplant2b.js`: **64/65** (re-run at recovery) —
  the one failure is a branch-identity leg ("HEAD is back on the arm
  branch sim-transplant2b-a"); it expects HEAD on the 2b arm branch
  and this tree is on sim-transplant2b-fresh-a. Adjudicated:
  worktree-only identity leg, same class as the 1615Z adjudications;
  substantive legs all pass. No test was edited to go green.

## Sense-testing (SENSE-TESTING LAW)

Read from the corpora (vetSays + death rows), both legs:

- Door-defense lines are coherent and specific: "Sarah, Naree, Leo
  and Amina met them at the door — 4 put down. Sarah, Naree, Amina
  are hurt." Counts, names, and hurt lists all match the fight.
- Teaching lines read like people learning: "IDENTIFIED: Ground
  Elder. Creeping patches of divided leaves in shady spots. Uses
  unknown — harvest, taste, and learn." / "Amina was watching. Now
  they know Ground Elder too." / "Village knowledge: Sarah taught
  everyone about Ground Elder. The Codex grows without you lifting
  a finger."
- Show lines keep their voice: "Oh, you survived the AUDIENCE
  NOTES? Cute. We've stopped pretending these are animals now. That
  was the FINAL DRAFT, folks — what comes out of the treeline next
  was never alive the way you mean it."
- Flag (observation, not a verdict): the death-cause field mixes
  killer names with causes — "The Terms of Service", "Buffering",
  "Big-Eyes", "The Landlord", "Gavel", "The Loud Beast" appear as
  causes alongside "villager combat" and "expedition". These are
  monster/show names, so the rows are readable, but a cause
  taxonomy that separates killer from mechanism would make the
  death shares cleaner. Filed to the findings backlog.
- Nothing robotic, static, or repeated beyond the known single-
  template gorge line (already logged in the backlog).

## Metric review (§14)

- The metric set held as written. Branch 2 judged cleanly at B = 0:
  the subject at baseline is NOT-CARRIER, not ambiguous — the
  mapping's "within 1 of baseline" line does the work even when
  the baseline is floored.
- Power caveat (recorded, not re-scored): at B = 0 the arm cannot
  detect a carrier — the subject has nowhere to fall. The verdict
  is "no carrier signal on this band", and the family closes as a
  suspect only in combination with its matched-band AMBIGUOUS
  reads (2/8 twice, subject never below the far end by more than
  the mapping's carrier gap). A future arm that wants to re-open
  2b would need a band where the far end survives ≥3/8.
- The no-baseline-re-run rule held: the deterministic driver
  reproduced the matched-band baseline bit-identically in 2b, and
  both fresh legs here ran with 0 instrument errors, so no
  re-run was owed or spent.

## Incidents

- **Coordinator death (1715Z):** the worker finished both legs
  (summaries + 16 per-seed corpora on disk by ~19:06Z) but the
  run died before the panel, the evidence, and the landing. No
  work was lost — recovered whole by the 2015Z run. The claim
  file stayed live until recovery; the lock was 3h old and was
  retired under the 90-minute fallback.
- **Panel script staged-deletion:** the worktree showed a staged
  deletion of `scripts/culpritbisect-panel-fresh-20261115.sh` at
  recovery (the script was committed in 0e51d742f). Restored with
  `git checkout HEAD --` — the script ran both legs cleanly
  afterwards, standing restored byte-identical each time
  (native sha `75762cb2259d` both legs). Cause of the deletion is
  unknown (possibly a flap-window write); the commit itself was
  intact.
- **Transient index.lock:** a `git checkout` during recovery hit
  an index.lock held by the reaper's concurrent `git status`
  scan; the lock was gone a minute later and the checkout
  succeeded on retry. No action taken.
- Telemetry deviation check: REFUSED (recorder-corpus class,
  transplant precedent) — baseline NOT rolled, no LOUD lines.
- Safe-commit index clobber: not struck on the recovery commit
  (verify at merge time).

## Convergence state

scale-onramp stays converging (NOT converged): family 2b is now
CLOSED as a carrier suspect (matched AMBIGUOUS ×2 + fresh
NOT-CARRIER), joining family 8 (closed 1615Z). The binding
constraint stays the wave-5 veteran gap (0 living wave-4 veterans
at end on all 16 seeds here; tribute veterans-short everywhere)
and the 0/16 win rate on fresh seeds. The family-7 brain-side
program decision (guardablate AMBIGUOUS, 1715Z) stays open for
the 2015Z run's fresh-band arm.
