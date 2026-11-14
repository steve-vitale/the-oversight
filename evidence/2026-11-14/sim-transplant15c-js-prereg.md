# H1 transplant — family 15C NARROWED JS-ONLY SPLIT, OVE-52 js hunks alone (arm sim-transplant15c-js-a)

Run: fleshout-20261114T1452Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant15c-js-a` (worktree
`~/workspace/worktrees/sim-transplant15c-js-a`).

## STATUS OF THIS DOCUMENT — TRUE PRE-REGISTRATION

**This prereg was written and committed BEFORE the subject was cut and
before any judged sim ran.** The merge-tree pre-check below was run
before the live pick, and its prediction is recorded here before the
pick is attempted. Nothing in this document is backdated.

## The question

The group arm (evidence/2026-11-14/sim-transplant15c-narrowed.md) read
**CARRIER 1/8** for OVE-49 + OVE-52 together. OVE-49 (9bc88d85d) is
test-only (green-list + test). The split arm
(evidence/2026-11-14/sim-transplant15c-split.md) could not measure
OVE-52 alone: cherry-picking OVE-52 onto the far end conflicts
modify/delete on its refresh of the probe test, a test-file conflict
in the STOP class — STOPPED-BY-CONFLICT, no subject, no STEP, no
verdict. Coordinator decision 1 in
evidence/2026-11-14/sim-transplant-round-1355.md routes the narrowed
split next (blank #1): pick OVE-52's js hunks only, dropping its
refresh of the probe test. This arm is that route: measure OVE-52's
game code ALONE on the far end, same band, same STEP discipline.

## Subject (defined before the pick)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band).
- Pick: origin commit `1c1b23482` ("OVE-52: wire shared fighterState
  into both fight brains"). Single parent: `748cce3b8` (OVE-51).
  Do NOT pick OVE-49 (9bc88d85d).
- Pick stat (`git show 1c1b23482 --stat`, verified this arm before
  writing this prereg): 6 files, +511/−158.
  js=4: `src/js/engine/combat.js` (+26/−0), `src/js/fieldFights.js`
  (+90/−23), `src/js/game.js` (+59/−11), `src/js/villager-agency.js`
  (+172/−0) — js total +347/−34. Non-game: `docs/ONTOLOGY.md`
  (1 line changed: the villager-agency Provides line gains the
  fighterState functions) and the fight-brain knowledge-probe test
  refresh (`scripts/test-fight-brain-knowledge-probe.js`, +163/−123).
  No policy file, no standing.js change.
- Subject branch: `transplant-15c-split-js-subject`, built on the far
  end, LEFT in place (hash recorded in evidence), never committed
  to the arm branch.

## Subject-construction method (exact — js hunks ONLY)

The subject is built by cherry-pick with the two pre-authorized
drops applied inside the pick, not by hand-editing game code:

1. `git checkout -b transplant-15c-split-js-subject 203a32775`
2. `git cherry-pick -n 1c1b23482` — applies the pick without
   committing. The pick stops on the single predicted modify/delete
   conflict on `scripts/test-fight-brain-knowledge-probe.js`.
3. **Pre-authorized drop 1 (probe test):** resolve the conflict by
   accepting the far-end state — the file does not exist at the far
   end, so the far-end state is absence:
   `git rm scripts/test-fight-brain-knowledge-probe.js`.
   This is the drop the coordinator's decision 1 authorizes; it is
   declared here in the prereg, not improvised at the pick.
4. **Pre-authorized drop 2 (ONTOLOGY):** the ONTOLOGY hunk
   auto-merges in the pick; restore the far-end state:
   `git checkout HEAD -- docs/ONTOLOGY.md`.
   This arm is js-only by brief; the one-line Provides refresh is
   dropped, declared here.
5. Commit the result as one commit (message names the pick + the
   two drops).

Verification of the built subject (before any sim; asserted by the
proof test):

- `git diff 203a32775 <subject> -- src/js` is EXACTLY equal to
  `git diff 748cce3b8 1c1b23482 -- src/js` (same 4 files, same hunks,
  same +347/−34).
- `git diff --stat 203a32775 <subject>` names ONLY the 4 src/js
  files — no docs, no test, no other file.
- The probe test is ABSENT at the subject, as at the far end
  (`git cat-file -e <subject>:scripts/test-fight-brain-knowledge-probe.js`
  fails).
- `docs/ONTOLOGY.md` at the subject is byte-identical to the far
  end (`git diff 203a32775 <subject> -- docs/ONTOLOGY.md` empty).
- The subject's `src/js/standing.js` is the far-end native one
  (sha256 `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`),
  so the standing-fix swap mechanics are exactly as in the bisect
  prereg (fix `f8fda4295a99`; native restored byte-identical
  afterwards).
- Subject's policy is the far-end competent.js (the pick touches
  no policy file); own-policy per step, same as the bisect.
  Policy sha `a7ff5c516440`.

## Merge-tree pre-check (run BEFORE the live pick, prediction recorded)

Command: `git merge-tree --write-tree --merge-base=748cce3b8
203a32775 1c1b23482` (base = the pick's first parent, ours = far
end, theirs = the pick — the same three-way merge a cherry-pick
performs). Run 2026-11-14 ~15:14Z, exit 1. Output:

```
4a315a997194d3fb45d0e79aa7c52d1e7e42e53b
100644 602c7a7d32315442ecc1565cc912b7750698bb5b 1  scripts/test-fight-brain-knowledge-probe.js
100644 453520db00be7d254d2e8240ba41bd02d03fd8c2 3  scripts/test-fight-brain-knowledge-probe.js

Auto-merging docs/ONTOLOGY.md
CONFLICT (modify/delete): scripts/test-fight-brain-knowledge-probe.js deleted in 203a32775 and modified in 1c1b23482.  Version 1c1b23482 of scripts/test-fight-brain-knowledge-probe.js left in tree.
Auto-merging src/js/fieldFights.js
Auto-merging src/js/game.js
Auto-merging src/js/villager-agency.js
```

**Prediction: the live pick CONFLICTS on exactly one file —
`scripts/test-fight-brain-knowledge-probe.js`, modify/delete —
and auto-merges everything else** (docs/ONTOLOGY.md and all four
src/js files clean; src/js/engine/combat.js is not even listed,
i.e. it applies without a merge hunk note).

This reproduces the split arm's pre-check EXACTLY, including the
result-tree hash `4a315a997194d3fb45d0e79aa7c52d1e7e42e53b` — an
independent re-run of the same prediction, not a copy of its text.
The conflict's cause is as established by the split arm (verified,
not assumed): the probe test was CREATED on the origin line by
OVE-49 (9bc88d85d, +352 lines) and never existed on the master line
(absent at the merge-base d229b58f5, absent at OVE-49's parent,
absent at the far end 203a32775); OVE-49 is an ancestor of OVE-52's
parent 748cce3b8, so at the pick base the file exists and OVE-52
modifies it. Cherry-picking OVE-52 alone onto the far end asks the
merge to modify a file the far-end side never had.

## Tooling-resolution rule (coordinator, binding)

- If a pick conflicts ONLY on zero-src-reader tooling files
  (`scripts/green-list.txt`, `scripts/balance-proof.json`,
  `scripts/phone-frame-proof.json`), resolve EACH with
  `git checkout --ours` and continue — do NOT hand-edit.
- If ANY other file conflicts (any src/js, data, policy, docs, or
  test file beyond the two files deliberately dropped per this
  brief), STOP immediately, report the exact conflict list, do NOT
  hand-resolve, do NOT decide a narrowed re-run.
- The probe-test drop and the ONTOLOGY drop are PRE-AUTHORIZED by
  this brief and are declared in this prereg (§Subject-construction
  method, steps 3–4) — they are not improvised resolutions, and
  they are the ONLY drops. If the live pick conflicts on any file
  other than the probe test, or the ONTOLOGY hunk does not
  auto-merge, the arm STOPS under the rule above.

## STEP-script hazard (from round-1355)

`scripts/culpritbisect-step.sh` checks out the subject commit
detached, which DELETES the script itself from the worktree. Copy
the script to /tmp and run it with REPO set to this worktree for
EVERY step including the first.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with
  the roster-check standing fix swapped in for every step exactly
  as the bisect prereg specifies (fix `f8fda4295a99`; native
  restored byte-identical afterwards, sha-verified). Base is the
  far end, never current master.
- Seeds: the same 8, 190391–190398 (190391, 190392, 190393, 190394,
  190395, 190396, 190397, 190398). Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step. Driver
  mechanics reused (`scripts/culpritbisect-driver-20261113.js` +
  `scripts/culpritbisect-step.sh` as in the prior arms);
  STEP id `t15c-split-js` (fresh).
- Primary metric: survived/8 on the band. Verdict thresholds
  (binding, round-2115 §3):
  - ≤1/8 CARRIER — OVE-52's js hunks alone collapse the far end
    to the merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect
    rule); 2/8 again → recorded AMBIGUOUS, treated as
    NOT-CARRIER for ordering but kept on the suspect list. Per
    round-1355 metric review: if the re-run is per-seed
    IDENTICAL, record AMBIGUOUS — deterministic re-runs are
    vacuous and never resolve ambiguity; the honest resolver
    would be a fresh seed band, which this arm does not run.
  - ≥3/8 NOT-CARRIER — OVE-52's js hunks alone do not collapse
    (far end is 4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution, rank read (regional
  ≥5/8 REGIONAL_INTACT; ≤2/8 RANK_STALL; 3–4/8
  RANK_INCONCLUSIVE, per the bisect prereg). No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check
  REFUSES these corpora; record the refusal, never roll the
  baseline.
- Proof: `scripts/test-transplant15c-js.js` (stage 1 with
  prereg; stage 2 after pick/step: subject identity, pick tree
  equality, verdict, evidence records). Re-run
  `scripts/test-culpritbisect-a.js` (116 legs) after the step.
- Fix policy (bisect prereg §Fix policy): no game-code change
  lands from this measurement arm unless the fix is a defect,
  small, carries its own proof, and restores ≥3/8 on the same
  band — otherwise document only.

## Secondary check (from the 15C group arm, carried forward)

The Blooded beat fires in transcripts yet end-state `blooded`
reads false on all 8 seeds in the group corpus. This arm checks
beat-vs-end-state on its own corpus and reports what it finds;
it does not touch the survival verdict. (Round-1355 corroborated
it in both directions on 15A — beat fires / end-state false, and
end-state true / zero beats — and found blooded TRUE on 4/8 in
the 15F corpus; the open sim-findings item stands.)

## Seed-band freshness note

Band 190391–190398 is the program-mandated matched band per 2115
§3, reused by design across transplant arms for comparability
against the far end; no new band is assigned. This is not a
freshness violation: a transplant step re-runs the same seeds on
different code, so the survival count is comparable seed-for-seed.

## Fixture note (proof-of-effect)

This is a diagnostic transplant step, not an encounter-beatability
verdict: no staged encounter fixture applies. The instrument is
the competent-policy sim itself — 8 matched seeds, 150d
death-aware — and the verdict turns on village survival across
the band, not on whether a staged fight is winnable. No gear/party
fixture was staged and none is claimed.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md (wave law,
the fight-brain content this family touches: fighterState feeds
TB hopeless/reactive flee and field morale; knows-vs-naive flips
field opening intent and TB hopeless flee — OVE-52's own commit
message). No canon doc covers survival-collapse attribution;
nothing here invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change landing, no before/after
pair to compare on one base. The before/after comparison IS the
far end (4/8) vs this subject on identical seeds, judged by the
binding thresholds. Same standing as masterregress §7 and the
bisect §7.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the step: did the metric set hold, or does a
  metric need revision for the NEXT run?)
