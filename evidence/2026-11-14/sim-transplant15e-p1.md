# sim-transplant15e-p1 — family 15E PICK-1 ALONE (resume-offer Yes) (Loop A, fleshout-20261114T1736Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-transplant15e-p1-a, branch `sim-transplant15e-p1-a`,
worktree `~/workspace/worktrees/sim-transplant15e-p1-a`.
Prereg: evidence/2026-11-14/sim-transplant15e-p1-prereg.md
(committed 50054ecdd, BEFORE any judged sim ran — the subject
verification ran during prereg preparation; see the prereg's
ordering note). Binding prereg:
evidence/2026-11-13/sim-scale-onramp-round-2115.md §3 (H1 transplant
program) + evidence/2026-11-13/sim-culpritbisect-a-prereg.md (bisect
prereg: roster-check standing-fix swap f8fda4295a99, step mechanics)
+ evidence/2026-11-14/sim-transplant15e-prereg.md and
evidence/2026-11-14/sim-transplant15e.md (the 15E-alone arm: pick
identities, merge-tree pre-check, pick-2 conflict anatomy,
UNMEASURED-BY-CONFLICT outcome) + hidden_files/family15-grouping-prereg-2026-11-14.md
§15E. Coordinator decision: evidence/2026-11-14/sim-transplant-round-1653.md,
next blank #1 — "15E PICK-1 ALONE" (route (b)).

## Outcome

- OUTCOME: NOT-CARRIER (pick 1 alone)
- Verdict: NOT-CARRIER — the resume-offer Yes repair does not carry
  (any of) the collapse. Survived 4/8, exactly the far end's 4/8,
  with per-seed days byte-identical to the far-end endpoint on
  every seed (see §The inertness read).
- Subject branch `transplant-15e-subject`: LEFT in place at
  f541e4cd1 (far end + pick 1 only), never committed to the arm
  branch. Verified at run start, before any sim (see prereg).
- STEP t15e-p1: ran 16m19s (STEP-EXIT 0), fix swapped in
  (f8fda4295a99), native restored sha-verified (75762cb2259d),
  policy a7ff5c516440 (far-end own policy).

## Prereg (binding, committed before any judged sim)

See evidence/2026-11-14/sim-transplant15e-p1-prereg.md. Base:
far end 203a32775 (GOOD 4/8) with the roster-check standing fix
swapped in for every step (fix f8fda4295a99; native restored
byte-identical afterwards, sha-verified). Seeds 190391–190398, 150d
death-aware, competent verbatim own-policy per step. Thresholds for
PICK 1 ALONE: ≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a
fresh STEP id; ≥3/8 NOT-CARRIER. STOP clause: subject verified,
no cherry-pick in this arm; a 2/8 would re-run once (not needed —
the step read 4/8). STEP id: t15e-p1 (fresh; t15e-resume belongs
to the STOPped 15E-alone arm and never ran).

## Pick identity (verified at run start, before any sim)

- Pick 1: bb6a301cf6433e2a62fe6a6e5fc95ca9ecd986c1 "Deliver
  unfinished thread on resume-offer Yes". First parent
  7688cb7a46367c88c7bb85e976502ddc0d5456f0 (Merge pull request #10,
  snippet-stage-direction-guard — family 14). Diff: 3 files —
  evidence/2026-11-08/story-offer-yes-followthrough.md +29/-0,
  scripts/test-story-offer-yes-20261108.js +73/-0 (new test),
  src/js/conversation.js +46/-4.
- Subject: branch transplant-15e-subject, tip f541e4cd1, tree
  f9e9b8b80156e7157793e7ee6a69306edcd5c738 (exactly the predicted
  pick-1-resolved tree), exactly 1 commit on the far end, diff vs
  far end 3 files +148/-4, changed lines identical to pick 1's
  diff, standing.js + policy byte-identical to the far end.
- No pick touches src/js/standing.js or scripts/policies.
- Far-end native standing.js sha256 75762cb2…; fix standing.js
  f8fda4295a99…; far-end policy a7ff5c51… (same substrate as the
  bisect prereg).

## The pick, in plain words

Saying Yes to "Want to hear where it left off?" now actually
continues the old conversation instead of brushing it off with a
generic "I see." The resume opener is tagged (`resumeOffer: true`,
thread id), the hanging yes/no question is marked, and Yes follows
through to the unfinished thread. The pick's own test proves it
live on the subject checkout: `node
scripts/test-story-offer-yes-20261108.js` — **11/11 PASS** (seed
99): the opener asks "Want to hear where it left off?", the
hanging question is tagged resumeOffer, Yes is offered, and the
Yes reply delivers thread content ("I kept a journal before. Wrote
in it every night. Stopped the day the sky changed. Some things you
can't write down.") — not a generic acknowledgment, and the
resumeOffer flag clears after Yes.

## 4. Step

- STEP id: t15e-p1, ran 16m19s (STEP-EXIT 0), fix swapped in
  (f8fda4295a99), native restored sha-verified (75762cb2259d),
  policy a7ff5c516440 (far-end own policy).
- Driver log: evidence/2026-11-13/culpritbisect-a-t15e-p1-driver.log
- Summary: evidence/2026-11-13/culpritbisect-a-t15e-p1-summary.json
- Corpus: evidence/2026-11-13/perseed-culpritbisect-a-t15e-p1/
  (8 per-seed JSONs).

## 5. Verdict

- VERDICT: NOT-CARRIER
- Survived: 4/8 — per-seed days: 86/144/150/43/150/87/150/150
  (190391: 86, 190392: 144, 190393: 150, 190394: 43, 190395: 150,
  190396: 87, 190397: 150, 190398: 150); survivors 190393, 190395,
  190397, 190398.
- Wave-5: 2/8 (190393, 190397), wave-4: 8/8, regional: 7/8,
  village: 1/8 (190394), national: 0, table: 0, wins: 0.
- Median: 150d, deaths: 629, standing range: 150–325, blooded: 4/8,
  tribute-ready: 1/8 (190397, veterans 2, ready).
- Death-cause shares: villager combat 267 (42%), combat 130 (21%),
  expedition 126 (20%), the wild 74 (12%), monster 13 (2%), the
  rest ≤3 each (Spool 2, a stranger 2, the arena 2, ambush 3,
  contest 3, a wound that wouldn't close 3, the night 1, Big-Eyes
  1, alien 1, starvation 1). Combat/expedition-dominated, the same
  profile as the far end and every other bisect step — villages die
  fighting, not hungry (1 starvation death in 629).
- THE INERTNESS READ: per-seed days are EXACTLY the far-end
  endpoint days on every seed (86/144/150/43/150/87/150/150, from
  the bisect prereg's endpoint verification) — the pick moves
  nothing on survival. This is the family-9 signature
  (byte-identical trajectories), not the family-11 signature
  (dialogue moving seeds in both directions). The repair is live
  (own test 11/11 on the subject checkout, §The pick), but the
  competent bot's survival path never branches on resume-offer
  content: no bot decision in 8 seeds × 150 days changes because
  a Yes answer now delivers a thread. No re-run leg applies at
  4/8 (the re-run rule is for 2/8 only), and no re-run could move
  an identical day-vector. The pick cannot carry the collapse: it
  leaves the far end exactly where it found it, seed for seed.
- Tribute-ready note: 190397 reads tribute-ready (2 veterans).
  With per-seed days identical to the far end, this read is the
  far end's read, not a pick effect — the trajectory is the same
  one. No tribute seat follows on any seed (veterans-short on the
  other 7; 190393 has 1 veteran, need 2).

## 6. Sense-testing (SENSE-TESTING LAW)

- The step corpus carries NO conversation transcripts — only
  vetSays (defense broadcasts) and a sayCount total — so the
  resume-offer mechanism is uncheckable from the survival corpus,
  the same instrument limitation families 9 and 11 recorded for
  dialogue families. What the corpus DOES show: 225 vetSays,
  98,590 sayCount lines across the 8 seeds — conversation volume
  is high; villagers talk constantly.
- What the villages looked like: coherent, named, consequential.
  Defense lines name who met the monsters at the door, who got
  hurt, and who didn't come back (190391 day 47: "Kayden didn't
  come back" — 1 hit corpus-wide). Veteran kills are called on
  camera with names remembered (190393 day 28: "Bessie just put
  down Spool... on CAMERA. That's a veteran kill, folks. REMEMBER
  the name."; Dale on The Focus Group the same day; 49
  veteran-kill mentions corpus-wide). The System's broadcast voice
  stays in character ("Oh, you survived the AUDIENCE NOTES? Cute.
  We've stopped pretending these are animals now." — day 25,
  190393). Nothing robotic, static, or repeated in the sampled
  lines; the repeated veteran-kill formula is a broadcast ritual,
  not a loop.
- Villager life beyond combat reads real in 190397 (a survivor):
  day 1, a woman with a burn-scarred forearm comes back "with an
  armful of something edible, unprompted. (+100 kcal pantry)";
  trust-gated refusals ("You haven't earned that yet. (Trust too
  low.)"); gossip fragments by the fire ("The story's getting
  bigger than what happened." / "It's picking up decorations as
  it travels."). Gossip mutating as it travels is the system
  working as designed, not a defect.
- The resume repair itself was verified live, not from the corpus:
  the pick's own test run on the subject checkout passes 11/11
  (§The pick) — Yes delivers thread content, the generic ack is
  absent. Zero generic "I see." acks appear anywhere in the 225
  vetSays (0 hits; expected — vetSays are broadcast/defense
  lines, not conversation replies — but consistent with a repair
  that is live and not leaking generic acknowledgments into
  speech).
- Lost villages still had food in the pantry where it mattered:
  190391 (lost 86d) ends with 0 kcal but 190393 (survived) ends
  with 8,200 kcal and 190397 with 5,798 kcal; the lost seeds end
  at 0 kcal because the village is gone, not because it starved
  (1 starvation death in 629 — the villages were wiped in combat,
  not starved).

## 7. Metric review (§14)

Pre-registered metric (survived/8, thresholds ≤1 CARRIER / 2
AMBIGUOUS / ≥3 NOT-CARRIER) judged the arm outright: 4/8 is
NOT-CARRIER with no re-run leg needed. No re-scoring. The metric
held. Two notes for the NEXT run, not revisions: (a) the
per-seed-days identity read (§5) is a stronger inertness signal
than the count alone — a dialogue family reading 4/8 with an
identical day-vector is inert, while 4/8 with a moved vector is
live-but-neutral; future dialogue-family arms should report the
day-vector comparison against the far end, not just survived/8.
(b) The corpus still carries no conversation lines, so a dialogue
family's mechanism stays unverifiable from survival corpora alone
— the pick's own test on the subject checkout is the mechanism
check for these arms (this arm ran it; 11/11).

## 8. Telemetry

Deviation check attempted; REFUSED by the tool itself
(recorder-corpus class): "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." Recorded as the prereg directs; baseline
NOT rolled. (Same refusal as all prior bisect/transplant arms.)
No LOUD lines to investigate.

## 9. Wall numbers

Judged corpus (this arm): survived 4/8, regional 7/8, national 0,
table 0, wins 0, wave-5 2/8, wave-4 8/8, median 150d. Carried: far
end 4/8, wave-5 2/8; merge 1/8, wave-5 0/8; national 0, table 0,
wins 0 on the collapse band.

## 10. What this means for the H1 transplant program

Measured families now number six: 2b AMBIGUOUS (2/8 twice, on the
suspect list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 9
NOT-CARRIER (4/8, inert — byte-identical trajectories), 11
NOT-CARRIER (5/8, ABOVE the far end), 15E-pick-1 NOT-CARRIER
(4/8, inert — per-seed days identical to the far end). Family 15E
as a GROUP remains unmeasured: pick 2 cannot land on the bare far
end (family-14 dependency, 15E evidence), pick 3 is being measured
by the sibling arm sim-transplant15e-p3conv-a. The collapse is not
in the resume-offer repair, and not in the conversation layer so
far: three dialogue families in a row (9, 11, 15E-pick-1)
exonerate. The pick-1-alone split worked exactly as designed —
the subject branch the STOPped arm left behind measured cleanly
with no new work. Next in table order after the coordinator's
calls: family 12 (dialog-residual-sampler) or the 15E-on-14+12
route (15E whole on family 14 + 12) — the coordinator decides;
this arm decides neither.

## 11. Infrastructure

- HOST WRITE FLAP: no EPERM window struck this arm's writes.
  No write failure occurred at any step (prereg, proof, commits,
  family test, step, telemetry all wrote cleanly). The
  flap-watch log was not re-read this arm.
- REGISTRY LOCK CONTENTION: the heartbeat script blocks on
  REGISTRY.lock (`flock -x`); the first heartbeat attempt queued
  ~4+ min and was killed by this arm before it landed (the
  chained prereg commit was split off and run separately so the
  binding commit did not wait on the lock). The tree was created
  with a fresh heartbeat at registration and the reaper's
  staleness line is 4h, so there was no reaper risk during the
  wait. Recorded so the lock-queue delay is not mistaken for a
  flap window.
- SAFE-COMMIT INDEX CLOBBER: struck on the prereg commit
  (50054ecdd) — `git status` showed both committed files as
  staged-deleted although the commit was correct (worktree hashes
  matched the HEAD blobs exactly). Repaired with the documented
  pipe (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); verified `git status --short` empty +
  `git diff HEAD` empty + `git diff --cached` empty + hash-object
  == HEAD blob per file afterwards. No work lost.
- SLOW GIT UNDER LOAD: the checkout back to the arm branch after
  the step took ~150s; a mid-flight inspection caught the
  checkout half-applied (worktree files already at arm-branch
  content while HEAD was still detached at f541e4cd1, 772 status
  lines). No work lost — the checkout completed cleanly and the
  final state was verified (HEAD on sim-transplant15e-p1-a,
  status shows only the 3 step artifacts). Recorded so a
  half-applied checkout is not mistaken for worktree pollution.
- No runtime restart struck this arm. No safe-commit refusal.
- Telemetry deviation check: REFUSED (recorder-corpus class,
  same as all prior bisect/transplant arms). Baseline NOT rolled.

## 12. Proof results

- `node scripts/test-transplant15e-p1-a.js`: **86 passed, 0 failed**
  (stage 1, committed with the prereg, 50054ecdd); stage 2: **123
  passed, 0 failed** total (STEP verdict, per-seed identity,
  family test, base restored, evidence records).
- `node scripts/test-culpritbisect-a.js`: **116 passed, 0 failed**
  (re-run after the step; the step tooling was untouched, but the
  re-run confirms the shared harness still passes on this tree).

## Closeout

- Arm branch `sim-transplant15e-p1-a` tip c7297bd0c (stage-2 commit;
  proof 123/123, culpritbisect-a 116/116); subject branch
  `transplant-15e-subject` LEFT at
  `f541e4cd14eec841a7d2b0808d34376af98184ca` (far end + pick 1,
  never committed to the arm branch); worktree verified clean at
  closeout (tracked tree empty apart from the committed evidence
  + proof, standing.js == HEAD, no swap residue — the step script
  restored the subject's native standing.js sha-verified, and the
  arm branch was checked out again afterwards).
