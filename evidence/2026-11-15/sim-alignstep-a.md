# FAMILY-7 ALIGN STEP — minimal ablation on master-tip substrate (arm sim-alignstep-a)

Run: fleshout-20261115T2115Z (Loop A), axis scale-onramp (survival collapse).
Prereg: evidence/2026-11-15/sim-alignstep-a-prereg.md (committed BEFORE
cutting the subject or running any judged sim; proof stage 1 green 48/48).
Arm branch: `sim-alignstep-a` (worktree `~/workspace/worktrees/sim-alignstep-a`),
base master tip ce0f28a46. Prereg + proof commit df6866b04.
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4/§5 read (the
family's area). No canon invented or rewritten.

## Verdict: UNMEASURED-substrate — the baseline gate STOPs, no subject leg

The master-tip baseline on the matched band reads **7/8 survived** — the
collapse regime is GONE on current master. Per the binding baseline gate
(pre-registered in the prereg, inherited from transplant7brain): the
carrier question is live ONLY if the baseline reads ≤2/8. At 7/8 the
question is moot here: NO subject branch was cut, NO subject leg ran, and
family 7 is NOT re-judged (it stays CLOSED by attribution per the
2026-11-15 2015Z coordinator decision — the collapse regime was
guard-masked, not family-7). No survival number for the align step was
measured on this arm, and none is claimed: the align step stays
UNMEASURED, and this arm's finding is a substrate fact, not a carrier
verdict.

## The question

Does the FAMILY-7 ALIGN STEP alone collapse survival? The one piece of
family 7 that stayed UNMEASURED — no subject leg ever ran — is the align
step itself: the `vbrainAlignObjective` call in `finishLottery`
(villager-objectives.js), which rewrites the live objective to the dawn
commitment when an aimed override wins. This arm defined a NEW, minimal
ablation on current master tip: remove ONLY that call (5 lines,
villager-objectives.js:681–685), leaving the function itself in place as
dead code — 7b already established the no-align behavior (the typeof
guard returns the objective unchanged), so removing the call produces
exactly that behavior while leaving the Phase 6 DUTY/ASSIGN code inside
the function untouched. The ablation was defined, proved (stage 1), and
ready — but the gate comes first, and the gate STOPs. The ablation set
stands defined in the prereg for any future run on a collapsed substrate;
it was not executed here, by design of the gate.

## Baseline leg — STEP ep-tip-alignstep on master tip ce0f28a46

Via `scripts/culpritbisect-step.sh` (matched band 190391–190398, 150d
death-aware, competent verbatim own-policy, fix standing swapped in,
native restored byte-identical afterwards, sha-verified). Corpus:
`evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-alignstep/`
(8 per-seed files), summary
`evidence/2026-11-13/culpritbisect-a-ep-tip-alignstep-summary.json`,
driver log
`evidence/2026-11-13/culpritbisect-a-ep-tip-alignstep-driver.log`.
Anchor commit ce0f28a464f6, standing fix sha f8fda4295a99, policy sha
74a890f0844e, instrument errors 0.

| seed | days | end | maxWave | standing | scale | deaths | pantry kcal | blooded |
|------|------|-----|---------|----------|-------|--------|-------------|---------|
| 190391 | 142 | village-lost | 4 | 199 | regional | 64 | 0 | no |
| 190392 | 150 | survived | 4 | 199 | regional | 70 | 3,266 | yes |
| 190393 | 150 | survived | 4 | 150 | regional | 50 | 13,713 | no |
| 190394 | 150 | survived | 5 | 250 | regional | 115 | 10,686 | yes |
| 190395 | 150 | survived | 4 | 199 | regional | 64 | 10,886 | yes |
| 190396 | 150 | survived | 5 | 345 | regional | 64 | 3,782 | no |
| 190397 | 150 | survived | 5 | 300 | regional | 85 | 19,792 | no |
| 190398 | 150 | survived | 5 | 400 | regional | 71 | 9,416 | yes |

- **Survived 7/8** (analyzer verdict GOOD, rank REGIONAL_INTACT).
  Median 150d. The single loss, 190391, died at 142d village-lost with
  an empty pantry (0 kcal) — the only starvation-shaped loss on the band.
- **Wall numbers:** wins 0, national 0, table 0, regional 8/8, wave 4
  8/8, wave 5 4/8, deaths 583, standing 150–400, blooded 4/8.
- **Death causes (583):** villager combat 285 (49%), combat 117,
  expedition 82, the wild 48, monster 19, the arena 8, contest 7,
  a stranger 5, ambush 4, a wound that wouldn't close 3, alien 3,
  Gavel 1, The Moderator 1. (The cause field mixes killer names with
  mechanisms — Gavel, The Moderator, a stranger — already an [open]
  findings item from transplant2b-fresh-a; not re-filed here.)
- **Tribute:** ready on 1/8 seeds only (190394, veterans 3, payable 2);
  the other seven are veterans-short (0–1 veterans against a need of 2).
  Ready-5 villagers: 190392:1, 190394:3, 190395:1, 190398:1.
- **Comparison on the identical band:** far end 4/8 (days
  86/144/150/43/150/87/150/150), merge 1/8 (days
  103/150/115/140/76/126/115/136), master tip now **7/8** (days
  142/150/150/150/150/150/150/150). Master tip is now HEALTHIER than the
  far end on this band — the collapse regime the transplant program was
  built to bisect is gone here. The scale wall itself stands in its
  narrower form: every village reaches regional, none reaches national,
  the table, or a win.

## Gate application

Baseline 7/8 ≥ 3/8 → gateStopVerdict = STOP-UNMEASURED. Per the binding
rule: STOP, report UNMEASURED-substrate, do NOT cut a subject leg, do NOT
re-judge family 7. The subject branch `alignstep-subject` was NOT
created; there is no subject commit. The gate polarity note from
transplant7brain's metric review holds: this gate judges oppositely from
7b's (there ≥3/8 PROCEED, because the far end was the healthy baseline;
here ≤2/8 PROCEED, because the question is live only in the collapsed
regime) — and the proof's gateStopVerdict legs pin this arm's polarity in
code.

## The family's own test on master-tip substrate (diagnostic, not a judged leg)

`scripts/test-dawn-materialize-honesty.js` run against the worktree
(master tip ce0f28a46), after the prereg commit:

- Exit 0, `{"pass":true,"seed":20261108,"materializeNeqCommit":0,
  "honest":{"materialize":"HAVEN_CHORE","commit":"HAVEN_CHORE",
  "override":"win_plan:gear_hold","corePick":"HAVEN_CHORE",
  "purpose":"chore","chore":"repair","indoor":true},
  "controlMismatch":true,"depart":"hold"}`.
- Identical to the transplant7brain arm's diagnostic on the older tip
  7251dcb4f: the test runs whole on master-tip substrate, the aimed
  override (win-plan gear_hold) materializes honestly
  (materialize == commit), and the failing control (align stripped)
  restores materialize≠commit. The instrument a redefined ablation would
  use is working on this tip too. It is NOT a judged leg and does not
  touch the UNMEASURED-substrate verdict (no subject exists to run it
  against).

## Sense-testing (SENSE-TESTING LAW)

260 vetSays lines across the 8 baseline per-seed files, read in full
sample (first 6 per seed) plus counts. The narration is coherent and
varied: water runs with returns ("+3 clean"), trust refusals ("You
haven't earned that yet", "Ask someone who trusts you"), overheard
gossip ("The creek's lower than yesterday", "Something's been at the
pantry. Not an animal — the jars were moved, not broken."), veteran-kill
show announcements ("Boris just put down The Terms of Service... on
CAMERA. That's a veteran kill, folks. REMEMBER the name."), elder-veteran
warnings ("This one is different — old, patient, unhurried"), Codex
ability offers (Raj took Cold-Blooded at Craft 1, chosen not granted),
shared meals ("bowls side by side, talk low"), teaching moments (bark
plates — "wide strips dried flat, laced overlapping like shingles").
Two repetitions worth naming, both narration-pool thinness rather than
defects:

- The wave-2 show line "Oh, you survived the AUDIENCE NOTES? Cute.
  We've stopped pretending these are animals now. That was the FINAL
  DRAFT, folks..." appears VERBATIM on all 8 seeds (days 25–34) — a
  canned broadcast, expected as a show announcement, but identical
  everywhere.
- The day-1 opener persona repeats across seeds: "A man, maybe 30s, with
  a scarred cheek" (190394) and "A woman, maybe 30s, with a
  burn-scarred forearm" (190397, 190398) deliver the same water-run /
  trust-refusal / overheard beats in the same words. The first-villager
  descriptor pool reads thin. Noted here, not filed as a finding — it is
  a content-pool observation, not a gap in the axis, and the backlog
  already carries the narration items from vetattrition-a (veteran deaths
  are silent; T vetSays has no death pattern).

No villager behavior in this corpus is robotic in the decision sense:
departures, refusals, meals, teaching, and fight attendance all carry
named people, varying counts, and consequences (hurt lists, deaths,
"Fulvio didn't come back").

## Village assessment (plain words)

Seven of eight villages are alive at day 150, all of them regional, none
of them national. They fight well — wave 4 is reached everywhere, wave 5
on half the seeds — and they eat: pantries end between 3,266 and 19,792
kcal on the survivors. The one village that dies (190391) dies the old
way, hungry at day 142 with nothing left in the pantry, after holding on
longer than the far end's version of the same seed ever did (86 days).
What is missing is not survival but scale: tribute needs two veterans
and most villages have zero or one, so the road to national stays shut
even when the village itself is healthy. The standing ladder tops out at
400 (190398) against a national bar the villages never touch. The
collapse the transplant program chased — villages dying mid-ambition in
the 40s–60s — does not happen on this band at this tip: the median
village lives the full 150 days.

## Reachability

Measured on the baseline leg: waves 1–4 8/8, wave 5 4/8, regional 8/8,
national 0/8, table 0/8, wins 0/8. Arc reach and four-realm formation
were not instrumented on this leg (recorder-corpus class; the analyzer
reports the wall fields above). The align step's effect on reachability
is unmeasured — the gate stopped before any subject leg.

## Blanks filled / documented

- FILLED (measured): the master-tip baseline on the matched band reads
  7/8 survived (GOOD / REGIONAL_INTACT, median 150d) — the collapse
  regime is gone on current master. Verdict UNMEASURED-substrate.
- FILLED (measured): per-seed days 142/150/150/150/150/150/150/150;
  the single loss is 190391 at 142d, village-lost, pantry 0 kcal.
- FILLED (measured): tribute ready 1/8 (190394 only); the other seven
  are veterans-short.
- FILLED (measured): the honesty test RUNS WHOLE on the new master tip
  ce0f28a46 (exit 0, pass:true, materialize==commit, controlMismatch
  true) — same as on 7251dcb4f.
- FILLED (measured): the ablation set stands defined and proved at
  stage 1 (exact 5 lines, one file, −5/+0) but was NOT executed — the
  gate stopped first, by design.
- DOCUMENTED: the step script's final cleanliness check FAILS on a
  current-tip step commit — the 4 tooling-scratch files
  (culpritbisect-driver/analyze, masterregress-analyze,
  vetfirst-instrument) are tracked at ce0f28a46, so the script's
  `rm -f` deletes tracked files and its own check exits 1. The driver +
  analyzer had already completed (all 8 per-seed files, summary written,
  analyzer verdict printed); the exit 1 is a tooling quirk, not a leg
  failure. Recovery: `git checkout --` the 4 files, check the arm branch
  back out, verify tracked status clean + standing.js sha == HEAD
  (f935997640a0). Any future arm stepping a CURRENT-tip commit must
  expect this and recover the same way — or the step script needs a
  tracked-scratch guard (flagged for the coordinator; not fixed here,
  out of axis).
- DOCUMENTED: safe-commit.sh index clobber struck 1× this run (prereg +
  proof commit df6866b04 — both files staged-deleted, worktree copies
  untracked) — repaired with the documented `ls-tree -r HEAD -- <paths>
  | git update-index --add --index-info` pipe; status empty + diff HEAD
  empty + hash-object == HEAD blob verified before continuing.
- DOCUMENTED: no host write flap hit this run.
- DOCUMENTED: the arm branch was rebased from its registration base
  d073bd656 onto the then-current master tip ce0f28a46 before any arm
  commit (the intervening commit is the journey r137 conversation
  landing, src/js/conversation.js only); the rebase was clean and the
  prereg records it.

## Telemetry deviation check

Recorder-corpus class — `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-13/perseed-culpritbisect-a-ep-tip-alignstep/*.json'
--metrics national,table,wins,exiled` REFUSES the corpus, as the prior
arms recorded: "telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Recorded; the baseline was NOT
rolled, no `--update-baseline` was passed.

## Proof

- `scripts/test-alignstep-a.js` — stage 1 green at prereg (48/48);
  re-run after the baseline leg and this evidence file: **50 passed, 0
  failed** (the +2 is §7 taking the measured-legs branch: baseline
  summary parses and names ep-tip-alignstep, survived 7/8 is an integer
  0..8, corpus dir holds 8 per-seed files, evidence records the
  STOP-UNMEASURED gate verdict; §6 stays on the pre-subject
  branch — no subject branch exists, by gate design).
- `scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
  as the reused-tooling check: 116 passed, 0 failed.
- `scripts/check.js --quick` did NOT complete in this run's bounded
  attempts (first run killed after ~7 min with no output; second run hit
  a 240s timeout at ~100/340 scripts, dots only, no failures shown) —
  the box is heavily loaded with sibling arms and the quick list runs
  340 scripts. Inconclusive, not a failure: this arm changed no src/
  file (evidence + proof + corpora only), and the two proof suites
  covering its work are green (50/50, 116/116).
- `scripts/test-dawn-materialize-honesty.js` — diagnostic on the worktree
  (master tip): exit 0, pass:true (see §The family's own test).
- No game-code change is committed by this arm on the arm branch (no
  subject exists — it would live on its own branch `alignstep-subject`,
  left uncreated); no `[needs-eyes]` applies. Committed on the arm
  branch: prereg + proof (df6866b04), this evidence file + step corpora
  (driver log, summary, 8 per-seed files).

## Metric review (§14 — filled after the run, never re-scored here)

- The baseline gate held cleanly: the pre-registered mapping judged the
  7/8 baseline STOP-UNMEASURED-substrate, and the verdict is
  UNMEASURED-substrate — not a carrier verdict, not a re-score. No
  subject metric was judged, because no subject leg ran; the
  subject-delta mapping stands untested for a future run on a collapsed
  substrate. No re-scoring happened anywhere on this arm.
- One metric note for the NEXT run (not a revision of this run's
  verdict): the baseline on this band is now 7/8 where the far end read
  4/8 and the merge 1/8 — a gate calibrated to the collapsed regime
  (≤2/8 PROCEED) will keep stopping on healthy tips. That is the gate
  working as designed, but it means the align-step question can only be
  measured on a substrate that still collapses, or under a redefined
  gate the coordinator sets. The ablation set is defined and proved;
  the substrate is what moved.
- The family-test metric (honesty test runs whole on master-tip
  substrate) held as the pre-registered diagnostic expectation (exit 0,
  pass:true).

## Infrastructure

- STEP-SCRIPT SCRATCH QUIRK: the step script exits 1 on a current-tip
  step commit (see §Blanks filled / documented) — driver + analyzer
  completed, recovery verified, no data lost. The script's assumption
  (step commit is an old tree where the scratch files don't exist) no
  longer holds for tip steps.
- SAFE-COMMIT CLOBBER: struck 1× (prereg + proof commit) — repaired,
  hashes verified.
- No write flap this run.
