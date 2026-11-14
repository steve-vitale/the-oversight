# sim-transplant9 — family 9 favor-debt-help-coherence (Loop A, fleshout-20261114T0337Z)

Run: fleshout-20261114T0337Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant9, branch `sim-transplant9`, worktree
`~/workspace/worktrees/sim-transplant9`.

## Prereg (binding, committed BEFORE any judged sim)

Binding prereg: evidence/2026-11-13/sim-scale-onramp-round-2115.md §3
(H1 transplant program definition + thresholds), plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg:
roster-check standing-fix swap f8fda4295a99, step mechanics), plus
evidence/2026-11-13/sim-transplant-round-0215.md (last run's
coordinator evidence — arms 4b/5b/7, conflict-STOP outcome,
proof-on-master branch-identity note).

- Base: far end 203a32775 (GOOD 4/8), with the roster-check standing
  fix swapped in for every step exactly as the bisect prereg
  specifies; native restored byte-identical afterwards, sha-verified.
- Subject: far end + family 9 diff, built on scratch branch
  `transplant-9-subject` (far end + `git cherry-pick -m 1 e44b0206e`).
  NEVER committed to the arm branch. Branch LEFT in place, hash
  recorded in evidence, so the verdict is reproducible.
- Family 9: merge e44b0206e "Merge pull request #14 from
  steve-vitale/cursor/favor-debt-help-coherence-bb3e" — single commit
  15e338184 "Fix favor/debt Help contradicting unfinished openers".
  src/js/convo-dialogue.js +40/-5, src/js/convo-wants.js +58/-3,
  scripts/test-favor-debt-help-coherence-20261108.js +165/-0 (new).
  No policy file, no standing.js.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as the
  bisect — scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus this arm's own
  proof legs for the transplant mechanics).
- Primary metric: survived/8. ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run
  once with a fresh STEP id (2/8 again → recorded AMBIGUOUS, treated
  as NOT-CARRIER for ordering but kept on the suspect list); ≥3/8
  NOT-CARRIER.
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- STOP clause: on ANY cherry-pick conflict, STOP, report the exact
  conflict list (which paths, UU/DU, which hunks), do NOT
  hand-resolve game code, do NOT decide a narrowed re-run (narrowed
  families are a coordinator decision only).
- Proof-on-master note (from the 0215Z run): branch-identity legs
  are worktree-only in this arm's proof — the proof's
  `worktreeOnly` helper passes them vacuously when HEAD is
  'master', so the proof stays green on master. (The 4b/5b/7 proofs
  failed 2/129 etc. on master only on branch-identity legs; this
  arm avoids that shape.)

## Canon

docs/CANON.md read first. docs/CONVERSATIONS.md covers conversation,
favor requests, and the favor-action contract — the family lives
inside that canon: a "How can I help?" press on an unfinished joint
outing (water haul / forage help) must name the concrete unfinished
work, never contradict the opener with "it's handled" / "we're
square". No standalone canon doc covers "Help contradicting
unfinished openers" specifically; the fix is a coherence repair
inside the documented favor contract, not a new system. Nothing here
invents canon.

## Family content (read before the pick)

The single commit 15e338184 is a dialogue-coherence fix, no numeric
change:

- convo-dialogue.js: `unfinishedOuting` (water_haul / forage_help
  with an unreturned run) and `deferredAfterResume` (a resume opener
  claimed unfinished debt/favor while the sitting's ask_favor never
  pinned one) now bypass the settled-favor "It's already handled"
  short-circuit and the vague restated pool; a blocked Help on
  unfinished favor/debt names the concrete work structurally
  ("We still need to get home and unload what we have. That's the
  help.") instead of drying into "lost my train of thought."
- convo-wants.js: the same deferred guard on the settled
  short-circuit and the why/stakes pools, plus `repay:help:water`
  and `repay:help:forage` lines so "How can I help?" on a repay
  want matches the opener's claim.
- New test file scripts/test-favor-debt-help-coherence-20261108.js
  (+165/-0).

No kcal, damage, armor, spawn, food-yield, spoilage, standing,
table, or wave identifier appears in the family diff (proof §3).
Mechanism expectation: the family changes what villagers SAY on
Help presses during unfinished outings; it changes no cost, no
reward, no schedule. A survival effect, if any, would have to come
through villagers actually completing outings they previously
abandoned mid-conversation — a second-order path, not a lever.

## Merge-tree pre-check (read-only, before the pick)

`git merge-tree aa4f6d54d 203a32775 e44b0206e` (base = the merge's
first parent): exactly TWO changed-in-both sections
(src/js/convo-dialogue.js, src/js/convo-wants.js), both with
0 conflict markers; ONE added-in-remote section
(scripts/test-favor-debt-help-coherence-20261108.js) at 0 markers;
no merged section, no removed section, no DU entry, 0 conflict
markers in the whole output. Prediction: CLEAN pick.

## Subject

- Subject branch: `transplant-9-subject` — 291934f7e3ac18c6081f8ad5976e17b2c6b9947f
- Parent: far end 203a32775 (verified: `git rev-parse 291934f7e^` ==
  203a327750a223e0a1465dc51f5409787efdfaae).
- Pick result: CLEAN — `git cherry-pick -m 1 e44b0206e` applied with
  0 conflicts, exactly as the merge-tree pre-check predicted (3
  files, +263/-8).
- Measured family diff verification: subject-vs-far-end ==
  family-vs-first-parent on src/js + policies + the test file,
  content lines sorted + sha256-compared:
  3dda5beb0fc9d2d2eb4a4240de76a8ec059b49e8119a82c9eb4bd5a8fbe798ce
  on BOTH sides (content-identical). Subject standing.js is the
  far-end native (75762cb2259d...), no conflict markers anywhere in
  the subject tree.

## Step

- STEP id: t9-e44b0206e, ran 10m36s (STEP-EXIT 0), fix swapped in
  (f8fda4295a99), native restored sha-verified (75762cb2259d),
  policy a7ff5c516440 (far-end own policy).
- Driver log: evidence/2026-11-13/culpritbisect-a-t9-e44b0206e-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t9-e44b0206e-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t9-e44b0206e/
  (8 per-seed JSONs).

## Verdict

- VERDICT: NOT-CARRIER
- Survived: 4/8 — per-seed days: 86/144/150/43/150/87/150/150;
  survivors 190393, 190395, 190397, 190398.
- Wave-5: 2/8, wave-4: 8/8, regional: 7/8, village: 1/8,
  national: 0, table: 0, wins: 0.
- Median: 150d, deaths: 629, standing range: 150–325, blooded: 4/8,
  tribute-ready: 1/8 (190397 only, all others veterans-short).
- Death-cause shares: villager combat 267 (42%), combat 130 (21%),
  expedition 126 (20%), the wild 74 (12%), monster 13 (2%), the rest
  ≤3 each (ambush, contest, wound, Spool, stranger, arena, night,
  Big-Eyes, alien, starvation 1). Combat/expedition-dominated, the
  same profile as the far end and every other bisect step — villages
  die fighting, not hungry (1 starvation death in 629).
- THE INERTNESS READ: per-seed days are IDENTICAL to the far-end
  endpoint days recorded in the bisect prereg (86/144/150/43/150/
  87/150/150, same survivors, same median). The subject reproduces the far end seed-for-seed:
  the family does not move survival at all on this band. It is
  NOT-CARRIER in the strongest sense — not 3/8-near-the-far-end,
  but byte-for-byte the far end's trajectories.

## Sense-testing

- The family's new lines NEVER FIRE under the competent policy on
  this band: 0 mentions of "We still need to get home", 0 of
  "finish the haul" / "finish the outing", and 0 mentions of the
  word "favor" at all across all 8 corpora (98,590 sayCount lines,
  225 vetSays). The bot never opens a Help conversation on an
  unfinished outing, so the coherence repair has no path to act —
  the inertness read has a mechanism, not just a count. The verdict
  therefore says nothing about the fix's quality for a HUMAN player
  who does press Help mid-outing; it says the fix cannot carry the
  collapse, because nothing in the sim reaches it.
- What the villages looked like: coherent, named, consequential.
  Veteran kills are called on camera with names remembered
  ("Bessie just put down Spool... on CAMERA. That's a veteran kill,
  folks. REMEMBER the name." — day 28, 190393; Priya/Linda/Sofia/
  Oliver/Vasyl the same on 190397). Defense lines name who met the
  monsters at the door and who came back hurt. 190397's Seo-ah
  notes a ground-elder stand worth remembering (day 117) and its
  fruiting (day 140) — a villager noticing and remembering the
  land, unprompted. The producers name the Nielsen at day 135.
  Nothing robotic, static, or repeated in the sampled lines; the
  repeated veteran-kill formula is a broadcast ritual, not a loop.
- Lost villages still had food in the pantry where it mattered:
  190393 (survivor) ends with 8,200 kcal, 190397 with 5,798 kcal;
  the lost seeds end at 0 kcal only because the village is gone,
  not because it starved — 190391 lost at 86d with the village
  wiped in combat. 190394 died fastest (43d, village rank, 52
  deaths) — the early-collapse shape the far end also shows.

## Metric review

Pre-registered metric (survived/8, thresholds above) judged the
arm outright: 4/8 is NOT-CARRIER with no re-run leg needed. No
re-scoring. The metric held; the identical-days read is a bonus
diagnostic, not a verdict input. One instrument note for the NEXT
run: the bisect corpus carries no conversation/favor telemetry
rows (no favor, water_haul, or forage_help mentions at all), so a
dialogue family's mechanism is uncheckable from survival corpora
alone — a family like this one can only be exonerated by
inertness, never confirmed effective by this instrument. That is a
limitation of the instrument, not of the verdict.

## Telemetry

Deviation check attempted; REFUSED by the tool itself
(recorder-corpus class): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." Recorded as the prereg directs; baseline
NOT rolled. (Same refusal as all prior bisect/transplant arms.)

## Infrastructure

- Safe-commit index clobber struck BOTH stage-1 commits (first:
  both files staged-as-deleted; second: MM on the evidence file) —
  repaired each time with the documented `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe, verified
  (status empty, diff empty, hash-object == HEAD blob per file).
- The step script itself does not exist at the subject commit (the
  far end predates the Nov 13 bisect tooling), so it was run from a
  /tmp copy (`git show sim-transplant9:scripts/culpritbisect-step.sh
  > /tmp/culpritbisect-step-t9.sh`, REPO env) — the route the
  script's own header documents. Tooling scratch was restored from
  master as designed.
- `git checkout sim-transplant9` after the step took ~2 min (96k-
  file tree restat under load) — slow, not stuck.
- No flap EPERM hit on this arm's writes. No pushes, no version
  bumps, no live verification (ship loop owns deploys). Arm branch
  tip: e28b49fd6 (stage-2 commit; proof 113/113, culpritbisect-a
  116/116). Subject branch transplant-9-subject left in place at
  291934f7e3ac18c6081f8ad5976e17b2c6b9947f.
