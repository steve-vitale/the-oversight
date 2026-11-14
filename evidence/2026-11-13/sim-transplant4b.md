# H1 transplant — narrowed family 4b: forager-deed merge c0a85b17e, [VERDICT TBD — stage 1 prereg]

Run: fleshout-20261114T0215Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, narrowed family 4b (evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 + narrowed-tooling rule, coordinator decision in evidence/2026-11-13/sim-transplant-round-0015.md §Method decision).
Arm branch: `sim-transplant4b-a` (worktree `~/workspace/worktrees/sim-transplant4b-a`, base master 62c19318e).
Prereg written and committed BEFORE any judged sim (stage-1 commit below).

## The question

Narrowed 4b is a NEW family definition under the narrowed-tooling rule,
never a re-judgment of family 4. Family 4 (arm sim-transplant4-a,
evidence/2026-11-13/sim-transplant4.md) was UNMEASURED: its
cherry-pick conflicted on exactly three files, all in `scripts/`
tooling, while all three `src/js` files applied cleanly. The
narrowed-tooling rule (decided 0015Z, now the standard route) authorizes
re-running a family whose conflicts are confined ENTIRELY to files with
zero readers in `src/` — with green-list by union, balance-proof.json by
the far-end pointer, and validator/tooling files by the side that matches
the transplanted code, justified in the prereg. This arm measures the
narrowed family only.

## Family identity (verified at run start, before any sim — re-verified, not taken on claim)

- Merge `c0a85b17e` "Merge origin/master into forager deed branch".
- First parent `c15b8c56c` "Living Garden: lived harvest deed gates
  Forager ascension"; second parent `fbb9c53ed` "Merge pull request #4
  from steve-vitale/cursor/person-trust-map-41aa".
- Second-parent side is 4 commits: `fbb9c53ed` (PR #4 person-trust-map
  merge) + `a76333124` (PR #3 brawler-ascension-deed merge) +
  `458811411` "Write per-villager trust map from lived events" +
  `447085506` "Add lived Brawler ascension deed (outmatched_kill)".
  Two sub-families: person-trust side (PR #4 + 458811411) and
  forager/brawler-deed side (PR #3 + 447085506). Same merge, same
  content as family 4 — the family is unchanged; only the conflict
  handling is narrowed.
- `git diff --stat c0a85b17e^1 c0a85b17e`: 19 files, +875/−10.
  `src/js`: exactly 3 files, +264/−6 — person-trust.js +233/−0 (NEW
  file, whole module), godpath.js +24/−0 (recordOutmatchedKill +
  callers), bond-initiation.js +7/−6 (comment-only rewording of the
  trustedAnyone paragraph). No scripts/policies file (pol=0). Table
  reading (js=3, pol=0) CONFIRMED — matches round-2115 §3, the family-4
  arm, and this arm's brief exactly.
- Content (from the diff, not assumed): person-trust.js is a new
  per-villager trust-map module — `bumpPersonTrust` /
  `personTrustOf` / `personTrustCensus`, written only from lived
  events, never a roster seed; godpath.js adds the lived Brawler deed
  `outmatched_kill` (solo kill of a foe that opened with more HP than
  your whole bar, after taking a real wound; helpers void it) wired
  into tactical + field finish paths, plus the `one_person_army` deed
  entry in src/data/godpaths.json (+6); bond-initiation.js only rewords
  a comment. `standing.js` NOT in the family diff: the subject's native
  standing.js is the far-end one (sha256 `75762cb2…`), so the
  standing-fix swap mechanics are exactly as in the bisect prereg.
- Far-end substrate (checked by `ls-tree` before cutting the step):
  `src/js/bond-initiation.js` present at the far end (blob
  d131970a2 — identical to the family's base blob, so it merges
  cleanly), `src/js/godpath.js` present, `src/js/person-trust.js`
  ABSENT (new file, clean add — zero DU entries for src/js files).
- Subject's policy is the far-end competent.js (family touches no
  policy file); own-policy per step, same as the bisect.

## NARROWED 4b DEFINITION (authorized under the narrowed-tooling rule)

- `scripts/balance-proof.json`: OURS (far end) pointer —
  `evidence/2026-11-10/neutral-r167-adopt.json.gz`,
  `ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f`.
  Justification: the bisect/transplant driver and analyzer never read
  it (`grep balance-proof` over
  scripts/culpritbisect-driver-20261113.js and
  scripts/culpritbisect-analyze-20261113.js: no match), and zero
  `src/` files reference it — it is a measurement-proof pointer, not
  game code, and the measured family diff is byte-identical either way.
- `scripts/godpath/validate.js`: THEIRS. Justification by grep BEFORE
  resolving (recorded here, verified in scripts/test-transplant4b.js §3):
  - The merge's godpath.js references BOTH events theirs adds:
    `outmatched_kill` (recordOutmatchedKill, lines 286–289) and
    `harvest_fed` (feed-ledger paths, lines 550–633).
  - The TRANSPLANTED godpath.js (far end + family diff) references
    `outmatched_kill` only. The family diff's +24 lines are
    recordOutmatchedKill + its two callers; `harvest_fed` enters the
    merge via the FIRST PARENT (Living Garden), not the family diff:
    first-parent godpath.js contains `harvest_fed` ×5 and
    `outmatched_kill` ×0, while the far-end godpath.js contains
    NEITHER event anywhere in `src/js` (`git grep -l
    'harvest_fed|outmatched_kill' 203a32775 -- src/js`: no match).
  - THEIRS is the side that matches the transplanted code: the subject
    EMITS `outmatched_kill` (`Game.tele('godpath_deed', ... event:
    'outmatched_kill' ...)` in the transplanted recordOutmatchedKill),
    and the OURS validator's 8-event list does NOT contain it — ours
    would reject the subject's own deed emission. Theirs accepts all
    8 ours events PLUS both added events (strict superset), so it
    cannot reject anything ours accepts; its `harvest_fed` acceptance
    and `okDays` check are vacuous in the subject (never emitted, never
    validated). The validator never runs in the sim driver (it runs via
    scripts/check.js), so the choice cannot move the survival number —
    the measured family diff (src/js + policies) is byte-identical
    either way.
  - This is a grep-verified justification, not a guess: the choice is
    justified on the event the family itself adds (`outmatched_kill`),
    and the `harvest_fed` half is explained (first-parent content,
    outside the family diff) rather than assumed. The brief's STOP
    clause guards against picking a side on an unjustified guess; the
    side is justified here, with both readings of "transplanted
    godpath.js" (merge's file: both events; subject's file:
    outmatched_kill only) recorded above so the coordinator can judge.
- `scripts/green-list.txt`: UNION (both sides' added lines, no
  deletions) — ours `scripts/test-pellet-boost-20261108.js quick` +
  `scripts/test-pellet-q4-20261108.js quick` AND theirs
  `scripts/test-person-trust-20261108.js quick`, per the 2b precedent.
  Justification: read only by scripts/check.js (line 59, `readList`),
  zero `src/` readers.
- STOP clause: if ANY conflict appears outside those three files, or
  any src/js conflict/DU appears in the live pick, STOP — write a
  conflict-STOP record (same shape as the family-4 arm), commit it,
  and report UNMEASURED. Do not hand-resolve game code.
- After resolving, VERIFY the narrowed resolutions leave the measured
  family diff byte-identical: diff the subject vs far end for src/js +
  policy files and compare against the family diff; record the
  verification in the evidence (stage-2 legs in
  scripts/test-transplant4b.js §7).

## Transplant prereg (binding; from round-2115 §3)

- Base: far end `203a32775` (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix `f8fda4295a99`; native restored
  byte-identical afterwards, sha-verified). Base is the far end, never
  current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware. Policy:
  competent verbatim own-policy per step. Driver mechanics reused
  (`scripts/culpritbisect-step.sh` + `scripts/culpritbisect-driver-20261113.js`
  + analyzer, same as the bisect steps); STEP id `t4b-c0a85b17e`.
- Subject: the transplant commit = far end + narrowed family diff,
  built on scratch branch `transplant-4b-subject` in this worktree and
  LEFT in place (branch kept, hash recorded below). Never committed to
  the arm branch. Apply via `git cherry-pick -m 1 c0a85b17e`, resolving
  the three tooling conflicts per the narrowed definition above.
- Primary metric: survived/8 on the band. Verdict thresholds:
  - ≤1/8 CARRIER — the narrowed family alone collapses the far end to
    the merge's level.
  - 2/8 AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list. (A 2/8 re-run on a
    deterministic driver is a stability check, not fresh evidence.)
  - ≥3/8 NOT-CARRIER — narrowed family alone does not collapse (far
    end is 4/8, so 3/8 is within a step of it).
  - Conflict-STOP (any conflict outside the three narrowed files, or
    any src/js conflict/DU) → UNMEASURED — no survival number, no
    subject, no sim.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arm; nothing lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Proof: `scripts/test-transplant4b.js` (family identity, merge-tree
  pre-check prediction, narrowed-resolution grep justifications,
  subject + byte-identical diff legs, step summary, base restored)
  plus re-run the reused `scripts/test-culpritbisect-a.js` (116 legs).

## Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree c15b8c56c 203a32775 c0a85b17e` (base = first parent,
per the 2215Z method correction — `cherry-pick -m 1` uses the first
parent as its base) predicts EXACTLY THREE content-conflicted files,
3 markers each (transplant118 counting method: `+<<<<<<<`,
`+=======`, `+>>>>>>>`), identical to the family-4 arm's prediction
and to its live pick:

1. `scripts/balance-proof.json` — panel-pointer conflict (one hunk):
   ours (far end): `"panel": "evidence/2026-11-10/neutral-r167-adopt.json.gz"`,
   `"panelDigest": "ff87680261d3e717228bbaac1c2551269fb711464364d1cce49e3ccc0fa9975f"`;
   theirs (family): `"panel": "evidence/2026-11-08/neutral-person-trust.json.gz"`,
   `"panelDigest": "b90b3411685bafd74504a2885cf41dadaaf906fec83413219078a8cf8ff3c44c"`.
   Narrowed resolution: OURS.
2. `scripts/godpath/validate.js` — deed-event validation list (one hunk):
   ours: single-line `T.ok` over the 8-event list
   `[relay_office, market_exchange, field_truth_shared, care_survived,
   outmatched_escape, ward_rescue, apex_hunt, death_refused]`;
   theirs: `okEvent` over the same list PLUS `harvest_fed` and
   `outmatched_kill`, plus an `okDays` check. Narrowed resolution:
   THEIRS (justified above).
3. `scripts/green-list.txt` — test-list append conflict (one hunk,
   `@@ -913,5 +913,9 @@`): ours: `test-pellet-boost-20261108.js
   quick` + `test-pellet-q4-20261108.js quick`; theirs:
   `test-person-trust-20261108.js quick` (one line). Narrowed
   resolution: UNION (all three lines).

The other four 'changed in both' files merge cleanly with ZERO
markers: `docs/ONTOLOGY.md`, `src/data/godpaths.json`,
`src/js/godpath.js`, `sw.js`. The four 'merged' sections merge cleanly
at 0 markers: `index.html`, `scripts/godpath/ladder.js`,
`scripts/proof-godhood-rework-20261013.js`,
`src/js/bond-initiation.js` (our blob d131970a2 == the family's base
blob: the far end did not touch the file). The eight 'added in remote'
files add cleanly at 0 markers, including `src/js/person-trust.js`
(new file — no DU, no substrate wall).

## Conflicted-file readers (verified by grep before the pick — prereg record)

- `scripts/green-list.txt`: read by `scripts/check.js` via `readList`
  (line 59) — the only code reader; it is the check runner, not game
  code. ZERO references under `src/` (`git grep -l 'green-list' HEAD
  -- src/`: no match).
- `scripts/balance-proof.json`: read only by measurement-proof test
  scripts under `scripts/` (balance-proof-update.js,
  test-measurement-*.js, test-proofrefresh-b*.js) — never by `src/`
  (`git grep -l 'balance-proof.json' HEAD -- src/`: no match). The
  bisect/transplant driver and analyzer never mention it (grep over
  both files: no match).
- `scripts/godpath/validate.js`: referenced by `scripts/check.js`
  (green-list runner) and itself only — never by `src/` (`git grep -l
  'godpath/validate' HEAD -- src/`: no match). It is validation
  tooling; the sim driver never invokes it.

None of the three conflicted files is `src/js` game code, and all
three have zero readers in `src/` — the narrowed-tooling rule's
precondition is met exactly.

## Canon

docs/CANON.md read first. No standalone canon doc covers person-trust
(the family's own docs/ONTOLOGY.md addition is the design record for
the module: lived-only writers, directional map, unset reads as 0,
no RNG, no gate changes); godpath deeds are covered by the godpath
docs and the forager/brawler deed design lives in the family's
evidence/2026-11-08/brawler-deed-audit.md. Nothing here invents canon
— this arm changes no game code on the arm branch (the subject is a
measurement-only commit on its scratch branch).

## Results (filled after the cherry-pick + sim)

**VERDICT: NOT-CARRIER (survived 3/8).**

- Subject branch: `transplant-4b-subject` LEFT at
  `c054bef81b808c5ecfae8d0c31c96c1bfefb74fa`, parent the far end
  `203a32775`. Never committed to the arm branch.
- Live pick (`git cherry-pick -m 1 c0a85b17e`, exit 1) reproduced the
  merge-tree pre-check EXACTLY — same three files, same hunks, 3
  markers each (live lines: balance-proof.json 3–9, validate.js
  91–103, green-list.txt 916–921). 16 of 19 family files staged
  cleanly, including all three src/js files (bond-initiation.js M,
  godpath.js M, person-trust.js A). No src/js conflict, no DU.
  Resolutions applied per the narrowed definition: balance-proof.json
  OURS, validate.js THEIRS, green-list.txt UNION (all three lines:
  pellet-boost, pellet-q4, person-trust). Zero markers left; the pick
  continued cleanly (`GIT_EDITOR=true git cherry-pick --continue`).
- Byte-identical verification (recorded, proof §7): the measured
  family diff (src/js + policies) is CONTENT-identical between
  subject-vs-far-end and family-vs-first-parent — only blob hashes and
  hunk line numbers differ (the far-end godpath.js base sits 1 line
  off the first-parent base). balance-proof.json subject sha ==
  far-end sha (`01531bce…`); validate.js subject sha == merge sha
  (`bf172886…`); green-list subject == far-end + exactly the
  person-trust line. Subject godpath.js: `outmatched_kill` ×3
  (including the `Game.tele` emission at line 288), `harvest_fed`
  ×0 — confirming the prereg's nuance that harvest_fed rides in the
  first parent, outside the family diff. No conflict markers anywhere
  in the subject tree.
- Step `t4b-c0a85b17e` (driver + analyzer, 10m41s): **GOOD
  (survived 3/8, rank REGIONAL_INTACT, median 132d, errors 0)**.
  Standing fix swapped in (`f8fda4295a99`), native restored
  (`75762cb2259d`, sha-verified by the step script, STEP-EXIT 0),
  own policy sha `a7ff5c516440` (far-end competent.js). Per-seed days:
  190391: 132d lost, 190392: 120d lost, 190393: 130d lost, 190394:
  102d lost, 190395: 150d survived, 190396: 150d survived, 190397:
  150d survived, 190398: 93d lost. Survivors: 190395, 190396, 190397.
- Secondaries (diagnostic only): wave-5 5/8 (190391, 190392, 190393,
  190395, 190396) — UP from the far end's 2/8; wave-4 8/8; regional
  8/8; national 0; table 0; wins 0. Deaths 708: villager combat 271,
  expedition 179, combat 139, the wild 80, monster 18, arena 6,
  contest 3, stranger 2, ambush 2, wound 2, singles (The Redactor,
  The Eater, Gavel, The Ugly Thing, lockjaw, thirst). Standing
  199–470 (highest 190391 at 470, which still lost its village at
  132d); blooded 3/8; tribute ready 1/8 (190396: veterans 2/2,
  ready4 5, ready5 3 — the only seed with a live tribute road).

## What this means for the H1 transplant program

Narrowed family 4b does NOT carry the collapse: the far end stays
GOOD with the whole family applied (3/8 vs 4/8 — within one step of
the far end, and two steps clear of the merge's 1/8). The
person-trust module plus the brawler deed, transplanted together,
do not collapse survival. The collapse carrier is still
unidentified; 4b joins 2b (AMBIGUOUS 2/8 twice) on the
measured-not-carrier list, and the program moves to narrowed 5b,
then family 7.

The wave-5 read is the interesting wrinkle: unlocks ROSE 2/8 → 5/8
while survival dipped 4/8 → 3/8. Villages reach further into the
late game and die fighting there — the lost villages still had food
in the pantry at the end (190391: 17,225 kcal at 132d; 190393:
12,260 kcal at 130d), and 589/708 deaths (83%) are combat or
expedition. The family makes villages bolder or better at unlocking
without making them live longer; that is a diagnostic observation,
not a lever — no balance verdict is drawn from a measurement arm.

## Sense-testing (SENSE-TESTING LAW)

Read from the per-seed corpora
(`evidence/2026-11-13/perseed-culpritbisect-a-t4b-c0a85b17e/`,
seeds 190391 + 190396 sampled; vetSays 25–64 per seed, sayCount up
to 17,252 lines).

- Narration is coherent, named, and consequential: veteran kills are
  called out on camera by name ("Reagan just put down Chorus
  Line... on CAMERA. That's a veteran kill, folks. REMEMBER the
  name."), the Blooded milestone is voiced with its mechanical
  meaning, and monster introductions carry personality ("The
  producers name it: the Nielsen. Ratings embodied. It fights
  boring — and the crowd adores it for that."). Door-defense reports
  repeat a template ("Niamh, Colleen, Reagan, Ayan and Fulvio met
  them at the door — 5 put down... hurt") but report real fights
  with real wounds, not filler.
- The wave-kill shape is sensible and shows the wave-4 wall plainly:
  wave-1 41–47 kills, wave-2 31–35, wave-3 10–11, wave-4 3, wave-5
  0–1 — even the surviving villages only ever land 3 wave-4 kills.
- Two diagnostic caveats, not verdicts: (1) `partyMembers` is EMPTY
  at mid and final daily on both sampled seeds — the scholar's party
  never forms in these sims, despite the transplanted module
  unblocking the bonds drive's trustedAnyone gate; the competent
  policy may simply never pursue bonds, so this says nothing about
  the module itself. (2) The recorder corpus carries NO trust/bond
  telemetry rows, so bond formation under the transplanted
  person-trust module is not visible in this measurement at all —
  the survival verdict stands (it rests on survived/8), but the
  mechanism question (did the module change bonds?) stays open.
  Logged as an open item in sim-findings.md.

## Metric review (§14)

- The primary metric (survived/8) was judged exactly as
  pre-registered: 3/8 → NOT-CARRIER. No re-score, no threshold
  change. The AMBIGUOUS re-run rule was not exercised (3/8 is
  decisive under the thresholds).
- One definition note, not a metric failure: the analyzer's median
  (132d) differs by 1d from a plain middle-two average of the
  per-seed days (sorted 93, 102, 120, 130, 132, 150, 150, 150 →
  (130+132)/2 = 131). The analyzer's figure is reported as-is; the
  gap is a median-definition artifact. No revision proposed.
- Wave-5 (a secondary) moved opposite to survival (up 2/8 → 5/8
  while survival dipped 4/8 → 3/8). Secondaries are diagnostic only;
  no threshold change proposed. The 2/8 re-run note from the 2215Z
  metric review stands (a re-run on a deterministic driver is a
  stability check, not fresh evidence) — not exercised here.
- Telemetry: deviation check REFUSED — recorder-corpus class
  ("refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not
  runs"). Baseline NOT rolled, exactly as the prereg requires.

## Wall numbers

This run's judged corpus (narrowed family 4b, subject
c054bef81, STEP t4b-c0a85b17e): survived 3/8, wave-5 5/8, wave-4
8/8, regional 8/8, national 0, table 0, wins 0, median 132d,
deaths 708, standing 199–470, blooded 3/8, tribute-ready 1/8.
Reference: far end 203a32775 4/8 (median 150d, wave-5 2/8), merge
e4dbe581b 1/8, on the same seeds 190391–190398, 150d, competent
verbatim own-policy, fix swapped in. Bisect s05 (this merge,
cumulative) 1/8, median 125d, wave-5 0/8.

## Proof results

- `node scripts/test-transplant4b.js`: **129 passed, 0 failed**
  (90/90 at stage 1; +39 subject + sim legs at stage 2. Pre-commit
  run read 128/1 with the single failure being the clean-tree leg
  tripping on the uncommitted stage-2 edits themselves — the same
  pre-commit artifact the family-4 arm recorded; it passes on the
  committed tree, verified by the post-commit re-run.)
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch; writes nothing).
- Step mechanics: the step script ran from a /tmp copy
  (`/tmp/culpritbisect-step-4b.sh`, restored from master — the
  script is absent at the far-end-era subject checkout, and the
  script's own header prescribes the /tmp-copy route so the detached
  checkout cannot unlink the running script). Step runtime 10m41s.
- Safe-commit index clobber struck the stage-1 commit (ad9bf7055):
  the two committed files showed staged-as-deleted after a correct
  commit; repaired with the documented `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified (status
  empty, diff HEAD empty, hash-object matches ls-tree for both
  files). No clobber on the stage-2 commit.
- Heartbeat: one `worktree-heartbeat.sh` attempt timed out at 50s
  (exit 124, slow restat — same hang the family-4 arm saw); the
  registry heartbeat is stale while the tree is LIVE and worked in,
  and the coordinator owns its release; recorded so a stale
  heartbeat is not misread as a dead run. No flap EPERM was observed
  on this arm's git or file writes (all commits/writes succeeded).
- No telemetry deviation check beyond the recorded refusal:
  recorder-corpus class — baseline NOT rolled.
- Closeout: arm branch `sim-transplant4b-a` tip ad9bf7055 (stage 1)
  + the stage-2 commit below (this file's tip-hash line itself is
  record-only); subject branch `transplant-4b-subject` LEFT at
  `c054bef81b808c5ecfae8d0c31c96c1bfefb74fa` (the transplant commit,
  kept for reproducibility); worktree verified clean at closeout
  (tracked tree empty, standing.js == HEAD, no swap residue — the
  swap ran only inside the step and was restored by it).
