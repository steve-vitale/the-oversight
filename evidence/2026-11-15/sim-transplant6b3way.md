# H1 transplant — narrowed family 6b via `git apply --3way`: the objectives-side half of PR #33 (arm sim-transplant6b3way-a)

Run: fleshout-20261115T1116Z (Loop A), axis scale-onramp (survival collapse).
ADOPTION: this arm was claimed and half-run by the dead run
fleshout-20261115T0810Z; the 1116Z run adopted and finished it. The
0810Z worker committed the fresh prereg + proof (daf39601d, stage 1
146/146), cut the subject commit, and ran the baseline leg
(ep-far-6b3way, 09:55–10:04Z), then died — lock 3h06m old at
recovery, both workers' heartbeats 73–74 min stale, no live
processes; the dead claim was retired to .DEAD with a note. The
1116Z coordinator finished the arm directly in the adopted tree
(coordinator-finish deviation, recorded here): verified the baseline
corpus, restored standing.js to native, ran the family-test leg and
the subject leg, judged per the binding prereg, and wrote this
evidence. Nothing was re-run that the dead worker had already run
cleanly; nothing was re-judged.
Prereg: evidence/2026-11-15/sim-transplant6b3way-prereg.md (committed
BEFORE the subject commit or any judged sim, by the 0810Z worker).
Arm branch: `sim-transplant6b3way-a` (worktree
`~/workspace/worktrees/sim-transplant6b3way-a`, base master at the
0810Z run start — 149d99d3f, the 0707Z coordinator evidence commit).
Subject branch: `transplant-6b-subject`, subject commit
2256f4ad46d965a1dfe9619558289a90653edd42 — LEFT in place per the
prereg (family-6 precedent).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §5 / Seam 9
read (the family's area). No canon invented or rewritten.

## Verdict: NOT-CARRIER — the objectives-side half alone does not collapse the far end

Subject survived 4/8 on the matched band, baseline survived 4/8, and
the subject is behaviorally identical to the baseline on every judged
field: per-seed days bit-identical (86/144/150/43/150/87/150/150),
vetSays arrays byte-identical (225/225), deaths 629/629, standing
identical per seed, maxWave identical per seed, instrumentErrors 0/0.
Per the pre-registered mapping (≥3/8 NOT-CARRIER), narrowed family 6b
is NOT-CARRIER, in exactly the expected inert form: the mechanism
analysis in the prereg is confirmed live — `objRefreshPick ≡ objPick`
on far-end substrate, because the gate-keeping brain module
(`vbrainOwnsDawn` / `vbrainShouldRefresh` / `vbrainMarkPerception`)
does not exist there. This is a finding about THIS substrate, not a
verdict on the full family 6: the demotion only bites when
`vbrainShouldRefresh` exists to say no. The full family 6 stays
UNMEASURED; 7b stays NOT-CARRIER; 8b stays NOT-CARRIER; 8c stays
UNMEASURED; masterregress stays CULPRIT_MERGE /
POLICY_EXONERATED_AT_MERGE. Nothing prior is re-judged here.

## The question

Does the objectives-side half of PR #33 alone — narrowed family 6b,
the `src/js/villager-objectives.js` hunks of merge `f843fab1c`
(dawn-midday-repick, OVE-38 Candidate B, seam 9) — collapse the far
end `203a32775` (GOOD 4/8 on the matched band) toward the merge's
1/8? The 6b arm could not answer it: plain `git apply` failed on the
two header-comment hunks and the conflict-STOP fired. This arm
answers it with the coordinator-authorized method: `git apply --3way`
of the same filtered objectives patch, under a fresh prereg.

## Subject (built by the 0810Z worker, verified by this finish)

- Subject commit: 2256f4ad46d965a1dfe9619558289a90653edd42, parent the
  far end `203a32775`, on branch `transplant-6b-subject` (NOT re-cut
  — the 6b arm left the branch at the far end and this arm cut the
  subject commit from there).
- Subject diff vs the far end: exactly the three 6b files —
  `src/js/villager-objectives.js` +63/−8, the new test file
  `scripts/test-dawn-midday-repick.js` +231 (blob `70409952…`,
  byte-identical to the merge's copy), `scripts/green-list.txt` +1/−0
  (the one union line). No `villager-brain.js`, no ONTOLOGY.md
  change, subject policy == far-end policy `a7ff5c51…`, subject
  native standing == far-end standing `75762cb2…`. Verified by the
  proof's §9 legs (all pass).
- The --3way subject gate held on every item: `git apply --3way
  --check` exit 0, no conflict markers, code hunks (2–6)
  byte-identical to the family's code hunks (multiset equality),
  every non-code added/removed line a `//` comment line, the
  family's three added comment lines present in the subject file.

### Comment-hunk review (line by line, as the prereg requires)

The two header-comment hunks 3-way-merged (not byte-identical, as
expected and authorized). The resulting diff, reviewed verbatim:

- Hunk 0 (`@@ -5,6 +5,8 @@`): adds exactly the two method-list
  lines `//   - objRefreshPick(vid, hx, hy, opts)` and
  `//   - objNeedsEmergencyPick(vid)` after the `objPick` line. The
  far end's deletion wins where the family and the local line
  disagree: NO `objDangerBelief` line anywhere in the subject file
  (the family context line is gone, as the far end removed it), and
  the far-end `//   - objRallyFreshRaid()` (no-arg) comment line is
  kept. Both facts are pinned by proof legs.
- Hunk 1 (`@@ -15,6 +17,7 @@`): adds exactly the one rule line
  `//   - midday_repick_event_only: idle/done mid-day objPick runs
  only via objRefreshPick when commit day/part is stale or a
  perception flag fired; dawn force-refreshes (code: objRefreshPick,
  VILLAGER-BRAIN seam 9)`. The far end's removal of the
  `danger_heard_filtered` rule line stands (it is not re-added).
- Nothing else in the header changed. The merged comment is inert
  text: it names the new methods and the rule, and changes no
  behavior. The 3-way merge reconciled exactly the overlap the 6b
  evidence diagnosed (family comment edits anchored on brain-module
  names the local line had stripped), and the result is the
  merge-tree's own reconciliation, not a hand edit.

## Results (both legs on the matched band 190391–190398, 150d death-aware, competent verbatim own-policy, fix standing swapped in)

| Leg | STEP id | Survived | Per-seed days | Verdict |
|---|---|---|---|---|
| Baseline (far end) | ep-far-6b3way | survived 4/8 | 86/144/150/43/150/87/150/150 | Gate PROCEED (≥3/8) |
| Subject (6b --3way) | t6b3way-f843fab1c | survived 4/8 | 86/144/150/43/150/87/150/150 | NOT-CARRIER |

- Baseline leg (run by the 0810Z worker, verified by this finish):
  8/8 per-seed files parse, errors 0, standingFix true
  (sha f8fda4295a99), rank REGIONAL_INTACT, median 150d, deaths 629,
  wave-5 2/8, wave-4 8/8, standing 150–325. Gate holds (4/8 ≥ 3/8);
  the settled matched-band baseline (4/8, same per-seed days,
  reproduced a fourth time) still anchors the far end.
- Subject leg (run by this finish): 8/8 per-seed files parse,
  errors 0, rank REGIONAL_INTACT, median 150d, deaths 629, wave-5
  2/8, wave-4 8/8, standing 150–325 — every judged number identical
  to the baseline leg.
- Per-seed files differ ONLY in step metadata: `anchorCommit`
  (203a327750a2 vs 2256f4ad46d9) and `step` (ep-far-6b3way vs
  t6b3way-f843fab1c). Every judged field — days, endReason, won,
  villageLost, scaleRank, maxWave, standing, deaths, vetSays — is
  identical per seed. (Verified by direct field comparison, not by
  file bytes: the files are not byte-identical, and the difference is
  exactly those two metadata fields.)
- No AMBIGUOUS re-run applies: 4/8 is NOT-CARRIER outright, and the
  bit-identical form makes a re-run vacuous (same substrate, same
  RNG stream, same trajectories).

## The family's own test — refresh behavior (test-transplant6b-refresh)

Run from a pathspec extract of the SUBJECT tree
(`/tmp/subj-6b3way`, src+scripts+index.html+manifest.json+sw.js+
build-source.json, 199M — same method as the 6b arm's far-end
extract), with the refresh script copied in from the arm branch
(the subject tree predates the script, as the far end does):

- Mode `pick` (subject): exit 0 —
  `{"pass":true,"mode":"pick","seed":1,"objective":{"kind":"VISIT",
  "state":"indoor","indoor":true,"purpose":"visit","chore":null,
  "tx":4,"ty":4,"targetVid":"gen_nmkdj3g","companion":null,
  "partsLeft":2},"rngNext":0.8845642388332635,"substrate":
  {"vbrainOwnsDawn":"undefined","vbrainShouldRefresh":"undefined",
  "vbrainMarkPerception":"undefined","objRefreshPick":"function",
  "objNeedsEmergencyPick":"function","objPick":"function"}}`.
  BYTE-IDENTICAL to the far-end control pick output recorded in the
  6b evidence (same objective JSON, same rngNext).
- Mode `refresh` (subject): exit 0 — output BYTE-IDENTICAL to mode
  `pick` on the subject (same JSON, same rngNext). The live proof of
  mechanism (a): `objRefreshPick ≡ objPick` on this substrate. The
  substrate fact prints in the output itself: all three vbrain*
  methods undefined, both new methods functions.
- The merge's own proof `scripts/test-dawn-midday-repick.js` on the
  subject extract: exit 2, `{"skip":"mid-day refresh API missing"}`
  — the EXPECTED-SKIP recorded in the prereg (the subject adds only
  `objRefreshPick`; three of the four precondition methods are still
  absent). Same class as the far-end control skip. Not a regression,
  not a pass.

## Sense-testing (SENSE-TESTING LAW)

The vetSays census across both corpora: 225 lines baseline, 225
lines subject, arrays BYTE-IDENTICAL per seed (29/23/18/15/30/14/
65/31). Nothing moved — no line added, removed, or reworded — which
is exactly what the inert mechanism predicts: the objectives change
touches no dialogue, and on this substrate it touches no decision
either. Sample lines (identical in both corpora, day 13 seed 190391):
"🛡️ Lulwa, Leo, Raj, Meera and Ingrid met them at the door — 4 put
down, 1 driven off. Lulwa, Leo, Raj, Meera, Ingrid are hurt." and
(day 24) "⚠ This one is different — old, patient, unhurried — it has
seen your kind before. A Elder veteran." The villages read as the
same villages because they ARE the same trajectories: the subject
leg replayed the baseline's story beat for beat. No villager
behavior is judged here beyond that identity — there is no new
behavior to judge, and claiming otherwise would be inventing a
difference the corpora do not contain.

## Village assessment (plain words)

No village changed: the far end's villages and the subject's
villages are the same eight villages living the same 150 days. Four
survive (190393, 190395, 190397, 190398), four are lost
(190391 day 86, 190392 day 144, 190394 day 43, 190396 day 87).
Seven reach regional, none reaches national, none sees the table,
none wins. Wave 5 unlocks on two seeds (190393, 190397) and kills
nobody's hopes any differently than the baseline. The scale wall
stands exactly where the program left it: the objectives half of
PR #33 is not the thing that collapses these villages, and it is not
the thing that saves them either. What this arm settles is narrow
and final for this substrate: the demotion of mid-day re-picks
cannot be the carrier, because on the far end there is no brain
module for it to demote through.

## Reachability

Measured on this arm's judged corpora (16 configs): waves 1–4
reached everywhere (wave-4 16/16), wave-5 unlocked 4/16, regional
15/16 (190394 stays village), national 0/16, table 0/16, wins 0/16.
The full seat, the win flag, and national standing have no new
read — the same read as every prior arm on this band.

## Blanks filled / documented

- FILLED (measured): narrowed family 6b is NOT-CARRIER via the
  authorized --3way method — subject survived 4/8 vs baseline
  survived 4/8, per-seed trajectories bit-identical. The 6b
  conflict-STOP is answered, not re-litigated: the --3way
  application the 6b evidence proposed works, and the subject it
  builds is inert on far-end substrate.
- FILLED (measured): the comment-hunk 3-way merge result, reviewed
  line by line — the two method-list lines + the
  midday_repick_event_only rule line land; the far end's
  objDangerBelief deletion and objRallyFreshRaid() no-arg form win.
  The merged header is inert text.
- FILLED (measured): `objRefreshPick ≡ objPick` proven live on the
  subject (refresh pick/refresh byte-identical, same rngNext
  0.8845642388332635 as the far-end control); the merge's own proof
  exits 2 (expected skip) on the subject.
- FILLED (measured): the vetSays census is byte-identical (225/225)
  and the per-seed files differ only in step metadata
  (anchorCommit + step id).
- DOCUMENTED: the 0810Z run died mid-arm and this run adopted it —
  prereg + proof + subject + baseline leg all recovered from the
  dead worker's tree (see run header); the subject leg, judgment,
  and this evidence are the 1116Z finish. The adoption cost nothing
  in re-runs: the baseline leg and subject commit were verified, not
  redone.
- DOCUMENTED: the proof's §10 crashes (uncaught ENOENT) in the
  intermediate state where the baseline summary exists but the
  subject summary does not yet — the `readFileSync(sumPath)` after
  the "subject step summary exists" leg is unguarded. At stage 1
  (146/146) and at the final state it is green; only the
  in-between state crashes. A future arm that runs the proof
  mid-run will hit the same crash; the fix is a guard, not a
  re-score. Recorded here as a proof-robustness note, not a verdict
  input.
- DOCUMENTED: the step script's tooling-scratch files
  (culpritbisect-driver/analyze, masterregress-analyze,
  vetfirst-instrument) were left untracked in the adopted tree by
  the dead worker's baseline run (its step left them behind);
  they were byte-identical to the arm branch's tracked copies and
  were removed before checking the arm branch back out — no content
  lost, no content kept outside version control.

## Telemetry deviation check

Attempted per the loop body (telemetry-check.js, baseline
scale-wall.json, current the t6b3way per-seed corpus glob, metrics
national,table,wins,exiled): REFUSED — "refusing recorder-corpus
input: all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs." Recorded, not waived; baseline NOT
rolled, no LOUD lines to investigate. Same refusal class as all
prior bisect / transplant arms. (A first attempt passed the corpus
directory itself and got EISDIR; the glob form produced the
recorder-corpus refusal above.)

## Proof

- `scripts/test-transplant6b3way.js` — **173 passed, 0 failed**
  (stage 1 was 146/146 at prereg; the subject-state + step-corpora
  legs were added after the subject commit and both legs ran, and
  pass at the final state).
- `scripts/test-culpritbisect-a.js` — **116 passed, 0 failed**
  (reused bisect tooling, re-run on the arm branch at the final
  state).
- `scripts/test-transplant6b-refresh.js` — family-test leg above
  (pick 0 + refresh 0, byte-identical JSON; merge proof exit 2 skip).
- No game-code change is committed by this arm on the arm branch
  (the subject lives on its own branch `transplant-6b-subject`, left
  in place); no `[needs-eyes]` applies. The arm branch commits only:
  prereg, proof scripts, evidence file, step corpora + summaries +
  driver logs.

## Metric review (§14 — filled after the run, never re-scored)

- The primary metric (survived/8) held cleanly: the baseline gate
  (≥3/8) passed on the reproduced 4/8, the subject read 4/8, and the
  mapping returned NOT-CARRIER without any re-scoring. The
  bit-identical secondary (per-seed days, vetSays) confirmed the
  expected inert form rather than merely the count.
- The intermediate-state proof crash (§10, above) is a metric-tooling
  note for the NEXT run, not a revision of this run's verdict: the
  proof's state machine has no branch for "baseline done, subject
  pending" and crashes instead of failing legs. No threshold changes
  proposed.

## Infrastructure

- ADOPTION (see run header): stale-lock recovery of the dead 0810Z
  run; both adopted trees heartbeated at 11:20Z (read back:
  11:20:43Z / 11:20:44Z). Loop B live on winnability throughout
  (claim fleshout-loop-b-20261115T1055Z) — NOT touched.
- WRITE FLAP: no EPERM failure struck this finish's git or file
  writes. (The dead 0810Z run recorded three flap windows in its
  morning, 08:18–08:21Z + 08:52–09:48Z + 09:58–10:01Z; this finish
  ran 11:16Z onward with no flap.) Git operations ran slow at times
  (full-tree restat on checkouts, ~60–110s) — the same flap-era
  slowness prior arms recorded — then ran at normal speed.
- SAFE-COMMIT CLOBBER: struck 2× on this arm (evidence commit
  cccf2ed24: all 21 files staged-as-deleted; correction commit
  9e00777ac: the evidence file MM) — both repaired with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe; verified afterwards with `git status
  --short` empty + `git diff HEAD` empty + worktree hash == HEAD
  blob per file. Both commits were always correct; only the index
  lied. (This line itself landed in a second follow-up
  evidence-correction commit, after the first correction's own
  clobber made the 1× count stale.)
- REAPER: the pre-flight reap was deferred past run start (adoption
  investigation + live Loop B trees + the subject step running) and
  is owed at closeout as the final sweep; recorded here so the
  deferral is visible, not silent.
