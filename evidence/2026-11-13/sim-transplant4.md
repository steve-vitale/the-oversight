# H1 transplant — family 4: forager-deed merge c0a85b17e, CONFLICT-STOP (arm sim-transplant4-a)

Run: fleshout-20261114T0015Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 4 (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3).
Arm branch: `sim-transplant4-a` (worktree `~/workspace/worktrees/sim-transplant4-a`).
Prereg written and committed BEFORE any judged sim (stage-1 commit below).

## The question

Family 4 is merge `c0a85b17e` "Merge origin/master into forager deed
branch" — the forager-deed merge (js=3, pol=0). Round-2115 §3 records
the caveat: this merge contains TWO sub-families (person-trust side +
forager-deed side); if it reads CARRIER, the next arm splits it.
This arm measures the WHOLE family only — no split.

## Family identity (verified at run start, before any sim)

- Merge `c0a85b17e` "Merge origin/master into forager deed branch".
- First parent `c15b8c56c` "Living Garden: lived harvest deed gates
  Forager ascension"; second parent `fbb9c53ed` "Merge pull request #4
  from steve-vitale/cursor/person-trust-map-41aa".
- Second-parent side is 4 commits: `fbb9c53ed` (PR #4 person-trust-map
  merge) + `a76333124` (PR #3 brawler-ascension-deed merge) +
  `458811411` "Write per-villager trust map from lived events" +
  `447085506` "Add lived Brawler ascension deed (outmatched_kill)".
  The two sub-families are visible here: the person-trust side (PR #4
  + 458811411) and the forager/brawler-deed side (PR #3 + 447085506).
- `git diff --stat c0a85b17e^1 c0a85b17e`: 19 files, +875/−10.
  `src/js`: exactly 3 files, +264/−6 — person-trust.js +233/−0 (NEW
  file, whole module), godpath.js +24/−0 (recordOutmatchedKill +
  callers), bond-initiation.js +7/−6 (13 lines changed: comment-only
  rewording of the trustedAnyone paragraph). No scripts/policies file
  (pol=0). Table reading (js=3, pol=0) CONFIRMED — matches round-2115
  §3 and the arm brief exactly.
- Content (from the diff, not assumed): person-trust.js is a new
  per-villager trust-map module — `bumpPersonTrust` /
  `personTrustOf` / `personTrustCensus`, written only from lived
  events (bondAdd warmth, conversation consequences, lessons,
  surviving a fight together), never a roster seed; godpath.js adds
  the lived Brawler deed `outmatched_kill` (solo kill of a foe that
  opened with more HP than your whole bar, after taking a real
  wound; helpers void it) wired into tactical + field finish paths,
  plus the `one_person_army` deed entry in src/data/godpaths.json
  (+6); bond-initiation.js only rewords a comment (the person-trust
  map is now written, so the dead-gate paragraph is updated; the
  warmth window itself is unchanged).
- `standing.js` NOT in the family diff: the subject's native
  standing.js would be the far-end one (sha256 `75762cb2…`, per the
  bisect prereg), so the standing-fix swap mechanics are exactly as
  in the bisect prereg — had a subject been built.
- Subject's policy would be the far-end competent.js (family touches
  no policy file); own-policy per step, same as the bisect.

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t4-c0a85b17e`.
- Subject: the transplant commit = far end + family diff, built on
  scratch branch `transplant-4-subject` in this worktree and LEFT in
  place (branch kept, hash recorded below). Never committed to the arm
  branch. Apply via `git cherry-pick -m 1 c0a85b17e`. On ANY conflict:
  STOP, report the conflict, do NOT hand-resolve game code. ONE
  exception (coordinator decision, family-2b precedent): a conflict
  in ONLY `scripts/green-list.txt` may be resolved by union — but
  ONLY after verifying that only `scripts/check.js` reads
  green-list.txt and zero `src/js` files do. Any other conflicted
  file: STOP, and the deliverable is the conflict report +
  UNMEASURED verdict.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8 NOT-CARRIER — family alone does not collapse (far end is
    4/8, so 3/8 is within a step of it).
  - Conflict-STOP (any conflicted file other than green-list.txt
    alone) → UNMEASURED — no survival number, no subject, no sim.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
  (No corpus exists for this arm — nothing was measured.)
- Proof: `scripts/test-transplant4.js` (family identity, merge-tree
  pre-check prediction, live-conflict record, conflicted-file
  readers, subject-branch state, base restored, verdict mapping)
  plus re-run the reused `scripts/test-culpritbisect-a.js` (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree c15b8c56c 203a32775 c0a85b17e` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base) predicts EXACTLY THREE content-conflicted files,
3 markers each (transplant118 counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`):

1. `scripts/balance-proof.json` — panel-pointer conflict (one hunk):
   - ours (far end): `"panel": "evidence/2026-11-10/neutral-r167-adopt.json.gz"`,
     `"panelDigest": "ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f"`
   - theirs (family): `"panel": "evidence/2026-11-08/neutral-person-trust.json.gz"`,
     `"panelDigest": "b90b3411685bafd74504a2885cf41dadaaf906fec83413219078a8cf8ff3c44c"`
   Measurement-proof pointer, not game code — but NOT green-list.txt,
   so outside the union carve-out.
2. `scripts/godpath/validate.js` — deed-event validation list (one hunk):
   - ours: single-line `T.ok` over events
     `[relay_office, market_exchange, field_truth_shared, care_survived,
     outmatched_escape, ward_rescue, apex_hunt, death_refused]`
   - theirs: `okEvent` over the same list PLUS `harvest_fed` and
     `outmatched_kill`, plus an `okDays` check (harvest_fed requires
     finite days ≥ 1 and minKcal > 0). Test/validation tooling, not
     game code — but NOT green-list.txt, so outside the carve-out.
3. `scripts/green-list.txt` — test-list append conflict (one hunk,
   `@@ -913,5 +913,9 @@`):
   - ours (far end): `scripts/test-pellet-boost-20261108.js quick`,
     `scripts/test-pellet-q4-20261108.js quick`
   - theirs (family): `scripts/test-person-trust-20261108.js quick`
     (ONE line — not the 4 theirs-lines of family 2b)

The other four 'changed in both' files merge cleanly with ZERO
markers: `docs/ONTOLOGY.md` (person-trust section added),
`src/data/godpaths.json` (outmatched_kill deed), `src/js/godpath.js`
(recordOutmatchedKill), `sw.js` (version stamp).
`src/js/bond-initiation.js` merges cleanly as a `merged` section
(our blob d131970a2 == the family's base blob: the far end did not
touch the file, only the family changed it — comment reword), as do
`index.html`, `scripts/godpath/ladder.js`, and
`scripts/proof-godhood-rework-20261013.js`. `src/js/person-trust.js`
adds cleanly (new file), as do the evidence files,
`scripts/person-trust-panel-20261108.js`,
`scripts/test-person-trust-20261108.js`, and
`scripts/godpath/test-brawler-deed.js`.

Because the predicted conflict set is NOT green-list-only (two
other files conflict), the prereg already says this arm STOPs — the
live cherry-pick below exists to confirm the prediction exactly,
not to build a subject.

## Conflicted-file readers (verified by grep before the pick)

- `scripts/green-list.txt`: read by `scripts/check.js` via `readList`
  (line 59) — the only code reader; it is the check runner, not game
  code. ZERO references under `src/` (no `src/js` file references
  green-list.txt at all). The green-list hunk ALONE would have been
  union-eligible under the family-2b precedent — but it is not alone.
- `scripts/balance-proof.json`: read only by measurement-proof test
  scripts under `scripts/` (balance-proof-update.js,
  test-measurement-*.js, test-proofrefresh-b*.js) — never by `src/`.
  It is a proof pointer, not game code; resolving it by hand would
  still pick which panel the subject's proof points at, which the
  prereg does not authorize.
- `scripts/godpath/validate.js`: referenced by `scripts/check.js`
  (green-list runner) and itself only — never by `src/`. It is
  validation tooling; resolving it by hand would pick which deed
  events the subject validates, which the prereg does not authorize.

None of the three conflicted files is `src/js` game code — but the
coordinator's carve-out covers ONLY green-list.txt, and the other
two files conflict alongside it. No union, no hand-resolution: STOP.

## Canon

docs/CANON.md read first. No standalone canon doc covers person-trust
(the family's own docs/ONTOLOGY.md addition is the design record for
the module: lived-only writers, directional map, unset reads as 0,
no RNG, no gate changes); godpath deeds are covered by the godpath
docs (docs/godpath/STEVE-ANSWERS.md, docs/COHERENCE-SPINE.md per the
repo AGENTS.md) and the forager/brawler deed design lives in the
family's evidence/2026-11-08/brawler-deed-audit.md. Nothing here
invents canon — this arm changes no game code at all.

## Results (filled after the cherry-pick)

**VERDICT: UNMEASURED (conflict-STOP).**

The live cherry-pick reproduced the merge-tree pre-check EXACTLY —
same three files, same hunks, 3 markers each. No subject was built,
no sim ran, no survival number exists.

- Subject branch: `transplant-4-subject` — created at the far end
  `203a327750a223e0a1465dc51f5409787efdfaae` and LEFT there (no subject
  commit; the cherry-pick was aborted). Never committed to the arm
  branch.
- Live pick (`git cherry-pick -m 1 c0a85b17e`, exit 1): 16 of 19
  family files staged cleanly — all three src/js files
  (bond-initiation.js M, godpath.js M, person-trust.js A),
  src/data/godpaths.json M, docs/ONTOLOGY.md M, sw.js M, index.html
  M, ladder.js M, proof-godhood-rework M, plus the 5 added evidence/
  script files. Exactly three files conflicted (UU):
  1. `scripts/balance-proof.json` — live lines 3–9 (merge-tree
     `@@ -1,7 +1,12 @@`): ours = r167 panel
     (`evidence/2026-11-10/neutral-r167-adopt.json.gz`,
     `ff876802…`); theirs = person-trust panel
     (`evidence/2026-11-08/neutral-person-trust.json.gz`,
     `b90b3411…`). 3 markers.
  2. `scripts/godpath/validate.js` — live lines 91–103 (merge-tree
     `@@ -88,9 +88,19 @@`): ours = single-line `T.ok` over the
     8-event list; theirs = `okEvent` over the 8 events PLUS
     `harvest_fed` and `outmatched_kill`, plus the `okDays` check.
     3 markers.
  3. `scripts/green-list.txt` — live lines 916–921 (merge-tree
     `@@ -913,5 +913,9 @@`): ours = `test-pellet-boost-20261108.js
     quick` + `test-pellet-q4-20261108.js quick`; theirs =
     `test-person-trust-20261108.js quick` (one line). 3 markers.
- The pick was aborted immediately (`git cherry-pick --abort`);
  the subject branch verified back at the far end, the arm branch
  checked back out clean. No hand-resolution of any file — not
  even the green-list hunk, because the carve-out covers ONLY a
  green-list-only conflict and this one is not alone. The two
  other conflicts are in measurement/validation tooling (a proof
  pointer and a deed-event validator), not game code — but the
  prereg does not authorize choosing which panel pointer or which
  event list the subject carries, so they block exactly as a game-
  code conflict would.

## What this means for the H1 transplant program

Family 4 is the FOURTH family in a row unmeasurable on divergence
(families 1, 2, 3, and now 4 — only the narrowed 2b re-run has ever
measured). The pattern sharpens with this arm: family 4's conflicts
sit entirely in scripts/ tooling — a measurement-proof pointer, a
deed-event validator, a test list — while ALL THREE src/js files
applied cleanly and the new person-trust.js module added cleanly.
The game code itself transplants fine; it is the proof/test
scaffolding around it that diverges. That has two consequences:

1. The transplant method's wall is now demonstrably a scaffolding
   wall, not (only) a game-code wall. A future coordinator could
   consider a carve-out for proof-pointer/validator conflicts the
   same way 2b carved out green-list.txt — but that is a coordinator
   decision, not this arm's: the prereg as written stops here, and
   this arm stops here.
2. The collapse carrier is still unidentified. Family 4's content —
   a per-villager trust map written from lived events (which UNBLOCKS
   the bonds drive's trustedAnyone gate) plus a lived solo-kill deed
   — is survival-relevant on its face (trust gates bonds; bonds gate
   parties; parties gate wave-4 kills), so it stays interesting as a
   narrowed re-run candidate IF a scaffolding carve-out is ever
   granted. Until then it joins families 1–3 on the unmeasured list,
   and the program's method question (round-2215 §Next blanks #3)
   gets louder: 4 of 5 cherry-pick attempts are unmeasurable.

## Sense-testing (SENSE-TESTING LAW)

No sim ran (conflict-STOP); no transcripts exist to sense-test.
Nothing to read.

## Metric review (§14)

- The primary metric (survived/8) was never measured — the arm
  stopped before any sim, per the binding prereg. No re-score, no
  threshold change proposed. The conflict rule functioned as
  designed: the merge-tree pre-check (base = first parent, 2215Z
  method correction) predicted the live conflict exactly — file,
  hunk, both sides' lines, 3 markers each — for the fourth family
  running, which keeps validating the pre-check as the program's
  early-warning instrument.
- One test lesson, recorded for the next arm: `git merge-tree`
  emits TWO clean-merge section kinds — `changed in both` (base/
  our/their) and `merged` (result/our only, diff is ours → result)
  — and a parser that only tracks `changed in both` silently drops
  the `merged` files (this arm's stage-1 proof initially missed
  bond-initiation.js that way; fixed before the stage-1 commit).
  The 2b test's parser has the same blind spot; its families had no
  `merged` sections, so nothing was misread there — but any future
  arm reusing that parser should carry the fix.
- Telemetry: no corpus exists (nothing measured), so no deviation
  check was attempted; the recorder-corpus refusal note in the
  prereg is moot for this arm. Baseline NOT rolled (nothing to roll).

## Wall numbers

This run's judged corpus: NONE — conflict-STOP before any sim.
Reference: far end 203a32775 4/8 (median 150d, wave-5 2/8),
merge e4dbe581b 1/8, on the same seeds 190391–190398, 150d,
competent verbatim own-policy, fix swapped in.

## Proof results

- `node scripts/test-transplant4.js`: **70 passed, 0 failed**
  (58/58 at stage 1; +12 live-conflict legs at stage 2 — the
  clean-tree leg reads FAIL pre-commit only because the stage-2
  evidence/test edits themselves are uncommitted at that point;
  it passes on the committed tree, verified by the post-commit
  re-run below).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch; writes nothing).
- Safe-commit index clobber struck once on the stage-1 commit
  (e51fd9fae): the two committed files showed staged-as-deleted
  after a correct commit; repaired with the documented
  `git ls-tree -r HEAD | git update-index --add --index-info`
  pipe and verified (status empty, diff HEAD empty, hash-object
  matches ls-tree for both files).
- Host write flap: no EPERM failure struck this arm's git or file
  writes directly. Two heartbeat attempts hung instead (the second
  `worktree-heartbeat.sh` run blocked >50s and was killed by
  timeout; an earlier combined command took ~128s): registry
  heartbeat stays 2026-11-14T01:36:28Z, ~25 min stale at closeout
  — the tree is DONE, not dead, and the coordinator owns its
  release; recorded so a stale heartbeat is not misread as a dead
  run. No flap EPERM was observed; the hangs look like host
  slowness (slow restat), not a denial.
- No telemetry deviation check: no corpus exists (nothing
  measured) — recorded, baseline NOT rolled.
- Closeout: arm branch `sim-transplant4-a` tip e51fd9fae (stage 1)
  + the results commit below (this file's tip-hash line itself is
  record-only); subject branch `transplant-4-subject` LEFT at
  `203a327750a223e0a1465dc51f5409787efdfaae` (the far end, no subject
  commit); worktree verified clean at closeout (tracked tree empty,
  standing.js == HEAD, no swap residue — no swap ever ran).
