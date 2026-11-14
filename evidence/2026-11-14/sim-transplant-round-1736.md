# sim-transplant-round-1736 — H1 transplant, 15E route decision (Loop A, fleshout-20261114T1736Z — ADOPTION CLOSEOUT by run fleshout-20261114T2015Z)

Run: fleshout-20261114T1736Z (Loop A), axis scale-onramp, H1 transplant
program. Program: "15E route decision (next blank #1 from round-1653Z)".
Claim: hidden_files/lever-claims/fleshout-20261114T1736Z.json — RETIRED
to .DEAD by the adoption run (see the .DEAD.note beside it).

## What happened to the 1736Z run

The 1736Z coordinator died after its workers finished and before it
closed the round: no round evidence file, no tracker review, no claim
retirement, no lock deletion (no lock file survived). Its p3conv
worker's own delivered report states the measurement work was complete
and the local-master merge was NOT done — it stopped before any rebase
or force, per the loud-failure rules. The adoption run
(fleshout-20261114T2015Z, this run) recovered the round: p1 and p12
were already on master; p3conv was adopted, rebased, proofed, and
merged (see below). No work lost. Loop B live on winnability chain
throughout (1945Z answercourt + donatebank) — NOT touched.

## The three arms (all measured, all NOT-CARRIER)

Shared band 190391–190398 (deliberate identical-seed reuse per the
transplant program protocol), 150d death-aware, competent verbatim
own-policy per step, far end 203a32775 (GOOD 4/8) with the roster-check
standing fix swapped in for every step. Thresholds (binding, 2115 §3):
≤1/8 CARRIER; 2/8 AMBIGUOUS → re-run once with a fresh STEP id; ≥3/8
NOT-CARRIER.

Arm 1 sim-transplant15e-p1-a (pick 1 alone, bb6a301cf resume-offer Yes,
on the bare far end; subject transplant-15e-subject at f541e4cd1; STEP
t15e-p1): NOT-CARRIER 4/8, per-seed days byte-identical to the far-end
endpoint on every seed. Evidence: evidence/2026-11-14/sim-transplant15e-p1.md
(commits 82f1114da, a5e63e5ed, 03f145e96 — on master before the adoption).

Arm 2 sim-transplant15e-p12-a (picks 1+2 on the exonerated 14+12 base;
subject transplant-15e-1412-subject at 312647db0; STEP t15e-p12):
NOT-CARRIER 4/8, per-seed days BYTE-IDENTICAL to the far-end endpoint
days (86/144/150/43/150/87/150/150). Evidence:
evidence/2026-11-14/sim-transplant15e-p12.md (commits f1967cfc4,
cc86cbc65, 055424e62, 23a5531b0 — on master before the adoption; the
23a5531b0 note records the STEP detached-checkout docs transient as a
coordinator heads-up, no driver side-effect).

Arm 3 sim-transplant15e-p3conv-a (narrowed pick 3, 4a1c77cf1 OVE-57,
conversation.js ONLY on the bare far end, villager-objectives.js half
dropped by coordinator decision; subject transplant-15e-p3conv-subject
at 740c9ab96; STEP t15e-p3conv): NOT-CARRIER 4/8, per-seed days exactly
the far-end days seed-for-seed (86/144/150/43/150/87/150/150). Wave-5
2/8, wave-4 8/8, median 150d, deaths 629. Evidence:
evidence/2026-11-14/sim-transplant15e-p3conv.md. ADOPTED by this run:
branch rebased onto master f0b64c672 (3 commits, clean, no conflicts),
proof re-run green by the adoption worker and re-verified by the
coordinator on the rebased tip (scripts/test-transplant15e-p3conv-a.js
152 passed, 0 failed), merged ff-only as 36f3be51c, tree released as
done-merged, branch deleted, main tree clean at closeout.

## The 15E route decision (what this round settles)

Every buildable piece of family 15E is now measured NOT-CARRIER:
pick 1 alone, picks 1+2 on the 14+12 base, narrowed pick-3
conversation-only alone. None of the three moves survival, a single
seed's trajectory, wave reach, or the wall numbers — all three read
4/8 seed-for-seed identical to the far end. The resume /
conversation-repair group does not carry (any of) the collapse.

The group AS A UNIT remains unmeasurable-by-conflict, and this round
records that as the accurate final record for the unit (1653Z option
(d), now earned rather than assumed): pick 2 (7041e1bfb, OVE-33)
cannot land on the bare far end — its 4-line quote check sits inside
convoSnippetIsStageDirection, a function family 14 introduced that
the far end never had (empty ours side; proven by the 15E-alone arm);
pick 3's villager-objectives.js half cannot land either — it is
written against the origin-line Phase 4 form of villager-objectives.js
(ranked candidates, npcInviteDecision lure lottery, objCommitGuardOffer)
that the far end never had. Both halves stay on the suspect list until
their route is decided (Phase 4 content landed first, or a
re-implementation against the far end's form — a coordinator / Steve
call, not an arm's).

In plain words: saying Yes to "want to hear where it left off?" now
actually continues the old conversation, quoted speech stops being
mistaken for stage direction, and a trader about to introduce
themselves doesn't lose their turn — and none of it changes whether
villages live or die. The collapse is elsewhere.

## Wall (this round's judged corpora, 24 configs)

Survived 4/8 on every leg; national 0, table 0, wins 0 everywhere;
wave-5 2/8 per leg; median 150d. The collapse stands: the carrier is
identified and split (OVE-52 alone, family 15C), but no fix has landed
and the veteran bar still chokes every surviving seed.

## Metric review

Pre-registered metric (survived/8 with the ≤1 / 2 / ≥3 thresholds)
judged all three arms; no re-scoring happened mid-run. The
seed-for-seed identity readings are the mechanism check the preregs
call for (an inert hunk reproduces the far end exactly), not a second
metric. No metric revision is proposed: the instrument discriminated
(CARRIER 1/8 on 15C-js in the same program) and the thresholds held.

## Telemetry deviation check

Recorder-corpus class — the deviation check REFUSES these corpora (the
same standing refusal as 1355Z/1430Z/1653Z/1955Z). Baseline NOT rolled.

## Infrastructure

- Recovery: 1736Z tree heartbeat 103 min stale at adoption; no file
  writes under 15 min in the p3conv tree; no lock file survived.
  Heartbeat landed 20:19:55Z before any adoption work, per the
  heartbeat-first rule for long-idle trees.
- REGISTRY.lock contention: the adoption heartbeat took ~64s queued
  on the lock (the known reaper self-contention; fix still needs a
  Steve nod).
- No EPERM write flap observed during the adoption. No safe-commit
  index clobber reported on the adoption rebase commits; the worktree
  verified clean after the rebase and the main tree clean after the
  merge (0 status lines).
- Master moved once under the adoption (journey-endgame r203,
  f0b64c672, zero overlap with the p3conv files); the rebase base was
  re-read before merging, so the merge landed on the current tip.
- No push, no version bump, no live verification — the ship loop owns
  deploys.

## Next blanks (taken up by run fleshout-20261114T2015Z, same axis)

In order: (1) 15E pick 2 alone on the 14+12 base (1653Z option (b) as
originally written — the 1736Z run measured pick 1 alone instead);
(2) 15E picks 2+3 on the 14+12 base, pick 3 narrowed to
conversation.js-only (option (c)); (3) pick-3 objectives-half route —
coordinator / Steve call; (4) 15A third band calibrating the far end
at ≥3/8; (5) family 16; (6) narrowed 8b; (7) family 6b + narrowed 7b;
(8) family 2b AMBIGUOUS stays on the suspect list; (9) proof refresh
round 18 (Loop B, owed after the next manifest change); (10)
headcount-ceiling (Steve-call); (11) Reunion mirror pack in the wild
(Steve design call).

scale-onramp stays converging (NOT converged): 15E is answered piece
by piece and the group-as-a-unit is recorded unmeasurable, but no fix
has landed and national/table/wins remain 0 on every judged corpus.
food-economy stays converging (untouched; parked). Rotation left at 4
(convergence work does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-11-14/sim-transplant-round-1736.md (this file).
