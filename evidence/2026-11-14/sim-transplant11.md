# sim-transplant11 — family 11 voice-line-decoration-stack, NOT-CARRIER (5/8) (Loop A, fleshout-20261114T0615Z)

Run: fleshout-20261114T0615Z (Loop A), axis scale-onramp (survival collapse).
Claim: H1 transplant program, family 11 (coordinator brief inline).
Arm branch: `sim-transplant11-a` (worktree `~/workspace/worktrees/sim-transplant11-a`,
base master 63c05120665 at run start).
Prereg: evidence/2026-11-14/sim-transplant11-prereg.md (committed BEFORE
cutting the subject or running any judged sim: 74ebc1497), binding on
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (transplant
program definition + prereg) plus
evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect prereg: the
roster-check standing-fix swap f8fda4295a99 and the step mechanics).
Canon: docs/CANON.md read first, then docs/CONVERSATIONS.md (the canon
doc for dialogue). CONVERSATIONS.md covers conversation structure,
voice backends ("Both voice backends receive complete quoted speech
only"), and the spoken-context contract — the family lives inside
that canon: a question must stay a question, not gain a temperament
opener that talks over it or a closer that answers it. NO canon doc
covers voice-line decoration specifically (no doc names the
opener/closer stacking rule or the formal-question guard); the
guard's rules come from the merge's own comments and its dialog
audit #5 write-up, quoted in §1, not invented here. Nothing here
invents canon.

## The question

Does origin family 11 — PR #26, the voice-line decoration guard on
authored questions — alone collapse the far end (GOOD 4/8) toward
the merge's 1/8? Seeds 190391–190398, horizon 150d death-aware,
competent verbatim own-policy, STEP id t11-0f55a928c.

## 1. Family identity (verified by THIS arm at run start, before any sim)

- Merge `0f55a928c` "Merge pull request #26 from
  steve-vitale/cursor/voice-line-decoration-stack-b24a". First parent
  `ac119e4ed27b2aa66131929795a4d3d0f381900b` (the family-12
  dialog-residual-sampler merge). Second-parent side is 1 commit:
  `5b7d834266e58e2de7300b892d267d5939db601f` "Stop voiceLine stacking
  on authored questions".
- `git diff --stat 0f55a928c^1 0f55a928c`: 2 files, +157/−0.
  `src/js/conversation.js` +20/−0 (the ONLY src/js file — table
  reading js=1, pol=0 CONFIRMED by this arm). The new test file
  `scripts/test-voice-question-decoration-20261108.js` +137/−0.
- `standing.js` NOT in the family diff; no policy file in the family
  diff. No data, no docs in the family diff.
- The family's own content (the +20 in `Game.voiceLine`, dialog audit
  #5, 2026-11-08): a FORMAL QUESTION GUARD. Authored questions often
  trail the "?" mark ("Okay, real question: …? I desperately need
  it."), so the old terminal-only `isQ` check missed them and voice
  openers stacked ("Practical view: Okay, real question: …");
  temperament closers also answered the ask ("…laughed? Extremely
  normal, all of it."). The guard adds `asksQ` (any "?" in the line)
  as the honesty gate after the mannerism pick: any opener on a line
  that asks, any closer on a multi-clause ask, and non-soft closers
  on plain terminal questions are discarded (the mannerism cycle is
  still consumed, so RNG lockstep with prior sittings is preserved).
  Soft address/punct closers (", friend.", "…") still fold on plain
  "?". No numeric change, no new system, no cost/trust/gate change.
- Far-end native standing.js sha256 `75762cb2259d…` (verified this
  arm); fix sha `f8fda4295a99…`; far-end policy sha `a7ff5c516440`
  (both verified this arm).

## 2. Merge-tree pre-check (run before cutting the subject branch)

`git merge-tree ac119e4ed27b2aa66131929795a4d3d0f381900b 203a32775
0f55a928c` (base = first parent) predicted a CLEAN pick: 0 conflict markers
in the whole output (counted as `+<<<<<<<` lines; bare
`^<<<<<<<` grep also 0). Two sections: `added in remote` (the new
test file, blob 7af18719) and `changed in both`
(`src/js/conversation.js`, base ae77aa50 / ours 1c943900 / theirs
cdef3941 — one hunk, @@ -718,7 +718,11 @@ and @@ -750,6 +754,22
@@, applying cleanly with no markers). No `removed in local` /
`removed in remote` section, no DU, no delete/modify. The live pick
reproduced the prediction exactly (see §3).

## 3. Subject

- Subject branch: `transplant-11-subject` — 3b8ba98b0f8b88f2d42861058163b11ac73b8b5e
- Parent: far end 203a32775 (verified: `git rev-parse 3b8ba98b0^` ==
  203a327750a223e0a1465dc51f5409787efdfaae).
- Pick result: CLEAN — `git cherry-pick -m 1 0f55a928c` applied with
  0 conflicts, exactly as the merge-tree pre-check predicted (2
  files, +157). STOP clause (binding, from the prereg): on ANY
  cherry-pick conflict, STOP and report the exact conflict list —
  no hand-resolution of game code; the pick was clean, so the
  clause never fired.
- Measured family diff verification: subject-vs-far-end ==
  family-vs-first-parent on src/js + policies + the test file,
  content-identical on the +/- content lines (the `index` header
  lines legitimately differ — the far-end conversation.js sits on a
  different base than the first parent's, so the resulting blob
  ecc52973 differs from the merge's cdef3941; the +/- content lines
  are content-identical).
  Subject standing.js is the far-end native (75762cb2259d...),
  subject competent.js is the far-end policy (a7ff5c516440...), no
  conflict markers anywhere in the subject tree. The guard hunks
  are present in the subject file (`asksQ` line 725, FORMAL
  QUESTION GUARD line 757).
- The family's own test, run by THIS arm on the subject checkout:
  `node scripts/test-voice-question-decoration-20261108.js`
  **11/11 PASS** — authored questions (laugh, origin, plain) stay
  undecorated under forced voice draws and fighting-only pools,
  the soft ", friend." closer still folds, live q_laugh stays
  undecorated. The guard works as transplanted.

## 4. Step

- STEP id: t11-0f55a928c, ran 14m33s (STEP-EXIT 0), fix swapped in
  (f8fda4295a99), native restored sha-verified (75762cb2259d),
  policy a7ff5c516440 (far-end own policy).
- Driver log: evidence/2026-11-13/culpritbisect-a-t11-0f55a928c-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t11-0f55a928c-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t11-0f55a928c/
  (8 per-seed JSONs).

## 5. Verdict

- VERDICT: NOT-CARRIER
- Survived: 5/8 — per-seed days: 95/150/150/150/150/150/137/140;
  survivors 190392, 190393, 190394, 190395, 190396.
- Wave-5: 2/8 (190396, 190397), wave-4: 8/8, regional: 8/8, village:
  0/8, national: 0, table: 0, wins: 0.
- Median: 150d, deaths: 736, standing range: 199–320, blooded: 2/8,
  tribute-ready: 0/8 (all 8 veterans-short).
- Death-cause shares: villager combat 308 (42%), expedition 185
  (25%), combat 115 (16%), the wild 73 (10%), monster 26 (4%), the
  rest ≤8 each (arena 8, sickness 1, wound 2, ambush 4, lockjaw 1,
  starvation 1, Gavel 1, Big Loud 1, dehydration 2, contest 1,
  stranger 3, Spool 1, alien 2, night 1). Combat/expedition-
  dominated, the same profile as the far end and every other
  bisect step — villages die fighting, not hungry (1 starvation
  death in 736).
- THE NON-INERTNESS READ: per-seed days are NOT identical to the
  far-end endpoint days (86/144/150/43/150/87/150/150, 4/8). Four
  seeds improved (190394: 43→150, 190396: 87→150, 190392: 144→150,
  190391: 86→95), two worsened (190397: 150→137, 190398: 150→140),
  and two held at 150 (190393, 190395). Net +1 survivor, ABOVE the
  far end. Unlike family 9 (byte-for-
  byte the far end's trajectories), family 11 MOVES trajectories
  in both directions — which is the expected signature of a
  dialogue change that is live: the guard changes what villagers
  say, and the bot's downstream choices follow the lines it hears.
  But the movement nets upward, not toward the merge's 1/8, so the
  verdict is NOT-CARRIER with margin — no re-run leg applies at
  5/8 (the re-run rule is for 2/8 only). The family cannot carry
  the collapse: it leaves the far end healthier than it found it.

## 6. Sense-testing (SENSE-TESTING LAW)

- The step corpus carries NO conversation transcripts — only
  vetSays (defense broadcasts) and a sayCount total — so the
  guard's mechanism (authored questions undecorated) is
  uncheckable from the survival corpus, the same instrument
  limitation family 9 recorded for dialogue families. What the
  corpus DOES show: 226 vetSays, 114,716 sayCount lines across the
  8 seeds — conversation volume is high; villagers talk constantly.
- What the villages looked like: coherent, named, consequential.
  Defense lines name who met the monsters at the door, who got
  hurt, and who didn't come back ("Kayden didn't come back",
  190391 day 47). Veteran kills are called on camera with names
  remembered ("Leo just put down The Redactor... on CAMERA. That's
  a veteran kill, folks. REMEMBER the name." — day 56, 190391; Raj
  on The Callback, day 59). The System's broadcast voice stays in
  character ("Oh, you survived the AUDIENCE NOTES? Cute. We've
  stopped pretending these are animals now." — day 29). Nothing
  robotic, static, or repeated in the sampled lines; the repeated
  veteran-kill formula is a broadcast ritual, not a loop.
- The guard itself was verified live, not from the corpus: the
  family's own test run on the subject checkout passes 11/11
  (§3) — authored questions stay undecorated, soft closers still
  fold. No stacked opener ("Practical view:", "I feel like —") or
  fighting closer ("Extremely normal, all of it.") appears anywhere
  in the 226 vetSays (0 hits; expected — vetSays are broadcast/
  defense lines, not conversation questions — but consistent with
  a guard that is live and not leaking decoration into speech).
- Lost villages still had food in the pantry where it mattered:
  190391 (lost 95d) ends with 10,450 kcal, 190398 (lost 140d)
  with 8,853 kcal — the villages were wiped in combat, not
  starved. The survivors end at 0–13,554 kcal; 190393 ends at 0
  kcal but survived the full 150d.

## 7. Metric review (§14)

Pre-registered metric (survived/8, thresholds ≤1 CARRIER / 2
AMBIGUOUS / ≥3 NOT-CARRIER) judged the arm outright: 5/8 is
NOT-CARRIER with no re-run leg needed. No re-scoring. The metric
held. Two notes for the NEXT run, not revisions: (a) the
non-identical-days read (§5) shows dialogue families can move
seeds in both directions — a future dialogue family reading 3/8
should be re-checked against whether its movement is directional
or noise before any carrier-adjacent claim; at 5/8 no such check
is needed. (b) The corpus still carries no conversation lines,
so a dialogue family's mechanism stays unverifiable from survival
corpora alone — the family's own test on the subject checkout is
the mechanism check for these arms (this arm ran it; 11/11).

## 8. Telemetry

Deviation check attempted; REFUSED by the tool itself
(recorder-corpus class): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." Recorded as the prereg directs; baseline
NOT rolled. (Same refusal as all prior bisect/transplant arms.)

## 9. Wall numbers

Judged corpus (this arm): survived 5/8, regional 8/8, national 0,
table 0, wins 0, wave-5 2/8, wave-4 8/8, median 150d. Carried: far
end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0, table 0,
wins 0 on the collapse band.

## 10. What this means for the H1 transplant program

Measured families now number five: 2b AMBIGUOUS (2/8 twice, on the
suspect list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 9
NOT-CARRIER (4/8, inert — byte-identical trajectories), 11
NOT-CARRIER (5/8, ABOVE the far end). Family 11 is the first
measured family to read above the far end's 4/8 — and the second
dialogue family in a row to exonerate (9, 11). The collapse is not
in the conversation layer so far: neither the favor-coherence
repair nor the voice-decoration guard moves survival toward 1/8.
Unmeasured families remaining include 1 (running as
sim-transplant118 — its evidence file carries no verdict yet), 3,
6, 7, 8, 10 (narrowed 10b pending a coordinator decision — its
conflicts are tooling-only), 12, 13, 14, 15, 16. Next in table
order after the coordinator's calls: family 12 (dialog-residual-
sampler, js=1 — the first parent of this very merge) or the
narrowed 10b.

## 11. Infrastructure

- Safe-commit index clobber struck the prereg commit (file
  staged-as-deleted after commit 74ebc1497) — repaired with the
  documented `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe, verified (status empty, diff empty,
  hash-object == HEAD blob). Watched for it on the stage-2 commit
  (see §Closeout).
- The step script was run from a /tmp copy (`git show
  sim-transplant11-a:scripts/culpritbisect-step.sh >
  /tmp/culpritbisect-step-t11.sh`, REPO env) — the route the
  script's own header documents, same as transplant9. Tooling
  scratch was restored from master as designed.
- Slow git under load, not failed: worktree heartbeat took ~93s,
  `git checkout sim-transplant11-a` after the step took ~91s,
  the telemetry-check invocation took ~130s. No flap EPERM hit
  on this arm's writes.
- No pushes, no version bumps, no live verification (ship loop
  owns deploys).

## 12. Proof results

- `node scripts/test-transplant11.js`: **116 passed, 0 failed**
  (family identity, merge-tree pre-check, subject state, step
  verdict 5/8 NOT-CARRIER, base restored).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (reused bisect tooling, re-run on this branch).
- Family test on the subject checkout:
  `node scripts/test-voice-question-decoration-20261108.js`
  **11/11 PASS** (§3).

## Closeout

- Arm branch `sim-transplant11-a` tip d985a4323 (stage-2 commit;
  proof 116/116, culpritbisect-a 116/116); subject branch
  `transplant-11-subject` LEFT at
  `3b8ba98b0f8b88f2d42861058163b11ac73b8b5e` (far end + family 11,
  never committed to the arm branch); worktree verified clean at
  closeout (tracked tree empty, standing.js == HEAD, no swap
  residue — the step script restored the subject's native
  standing.js sha-verified, and the arm branch was checked out
  again afterwards).
