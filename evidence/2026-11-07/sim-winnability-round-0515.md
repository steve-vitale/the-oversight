# sim-winnability-round-0515 — fleshout-2026-11-07T0515Z (Loop A)

Round coordinator evidence for the 0515Z flesh-out run. The run hit its 2h
timeout during closeout; the main session adopted the stranded 4th arm
(finishersize) and finished it. The other three arms were verified in master
before the timeout.

## Arms

### 1. proofrefresh — LANDED (`b690777cc`)

Measurement proof refresh. Closes the measurement neutrality refresh #1353,
owed since Oct 29. (The retained panel is re-pinned whenever a game,
controller, harness or policy input changes; see the finishersize arm below
for how often that bites.)

### 2. vetkilltale — LANDED (`ad665d5e5`, `0b3c8678f`, `28e3fa5fb`, `dab55c696`)

The fireside tale for a veteran killer: when a villager banks a wave-4+
kill, Haven hears the tale that evening (dedicated RNG stream, pure
`sayHavenNews`).

CAVEAT (found by the stab-b arm, same morning, and recorded here because
it qualifies this arm's pilot claim): the pilot claim "trajectories 8/8
identical" holds only where no veteran tale actually fires. When tales fire
(seed 53006 staged: 8–11 wave-4 kills) trajectories shift — standing 440 →
415, wave-4 kills 11 → 8. Causation proven: re-running the leg with
`VETKILLTALE_OFF=1` reproduces 440/11 exactly. Do NOT revert vetkilltale;
the instrument that pinned absolute trajectory values was re-pinned to the
current game instead (see round 0530). Lesson: any proof pinning ABSOLUTE
trajectory values on a named seed is master-sensitive — a landed
narration-only change can shift it.

### 3. nextfight — VETERAN'S EDGE build REVERTED, pilot NO-GO (evidence `5f6c8a02e`)

The VETERAN'S EDGE build (`338584348`) was reverted (`d1c6049ba`).
Pilot NO-GO: median second-kill delay 9d against a 14d bar, TB share
87.5%; wave-4 kills 11 → 18, one wave-5 unlock, one living killer. The
build is gone; only the NO-GO evidence stands. (Kill discipline: a missed
bar is not a kill of the idea — the lever itself was judged wrong on its
own numbers, not on a missed test.)

### 4. finishersize — committed finish LANDED (`8e5b97779`) [needs-eyes], verdict DIAG, held

The game change: a committed finish in `src/js/fieldFights.js` — a fighter
holds up to 3 rounds while above the 40% floor when a beast met below its
break line is within 3 proven blows. This implements Steve's Oct 27
wound-mill ruling (defenders finish a crippled beast they meet if they
can — risk-weighted, not unconditional). A 41-HP beast dies; a 125-HP
beast stays a turn-based job. `fsCommit` ×7.

Evidence: `evidence/2026-11-07/sim-finishersize-adopt-a.md`.

**Verdict: DIAG, held — not killed, not converged.** 0 addressable
meetings in 16 seeds 99421–99436, 0 below-break meetings in 112 wave-4
field fights; armed vs baseline byte-identical; guards exact; wall
identical (median 122d, won 0/16, national 0/16, wave-4 kills 30, wave-5
kills 1). Combined 24 seeds / 186 wave-4 field fights: 2 below-break
meetings, 0 addressable. Finding #1829: DIAG, held; next step is a
constructed wall-delivery instrument, or accept
engine-proven/field-unmeasurable.

## The closeout (main session)

The 0515Z run timed out in closeout with the finishersize arm stranded.
The main session adopted it and landed it as master `8e5b97779`
(10 commits: prereg, pilot, evidence, committed finish, proof refreshes
r1/r2/r3, proof refresh r5 — see below).

**Proof-refresh sequence (the fourth refresh is the lesson).** Every
game/policy change invalidates the retained measurement proof
(`scripts/balance-panel.js` `manifest()` hashes all of `src/` +
`scripts/policies/` + index.html + sim-harness.js + sweep-compare.js), so
the arm needed a fresh panel at every rebase:
- r1 `6db964287` — for the committed-finish game change.
- r2 `2ad775802` — rebased tip on `f043aa772`.
- r3 — committed `86453af3e`, rebased four times (onto `ed070c955`,
  `2cf4d19f0`, `38aa62dce`, `7100412b8a`).
- r4 — BUILT and VERIFIED on tip `21453b7ca` (panel 4 cases,
  `balance-proof-update.js` real exit 0) but NEVER COMMITTED: the Loop B
  linkdrive landing added `scripts/policies/competent-linkdrive-b.js`
  (a manifest input) the same hour, staling r4's manifest. Discarded
  uncommitted rather than landing a stale proof.
- r5 `8e5b97779` — fresh panel on `7100412b8a`+finishersize, proof-update
  9/9. Landed.

**Corrected author claim.** The arm's own adjudication said the
measurement-proof-update failure "pre-existed on master." That was wrong:
on pure master at the time the test passed — the failure was caused by
the finishersize change itself staling the retained proof. (Separately,
the r113 deepening landing later left master red on those two tests until
this r5 refresh re-pinned them; that was r113's staleness, not this arm's.)

**Gate (r3 tip, full check.js --quick): 276 passed / 14 failed in 1817s.**
Failure set: 5 standing real (mobile-combat-cadence,
occupation-panels, measurement-cache-flags, phone-frame-proof,
establishment-r20 racks-full voice-gate) + 9 load timeouts (phase-shawl,
solo-campaign-endings, time-save-crashes, time-save-failures,
trust-observer-neutrality, synergy-stall, throttlefeast, capable-bot —
TIMED OUT, so #1830 is STILL OPEN, not a pass — table-endings).
Measurement-proof tests PASSED. No new failures → merge bar met.

**No second full gate before merging (main-session judgment).** Both
halves were gated separately (finishersize r3 276/14; r113 276/14), the
systems are disjoint (fieldFights.js combat vs convo-wants.js dialogue),
combination risk minimal. Operative landing standard (Oct 29 precedent):
no NEW failure + proofs green + classification, not literal 290/290.

**Final proofs on the landed tip (all real exit codes, no pipes):**
finishersize 89/89 · addressable 40/40 · measurement-proof-update 9/9 ·
panel-contract-rulings 9/9 · balance-scorecard 35/35 ·
measurement-comparison 14/14 · regionalstep 29/29 · twoblow 77/77 ·
contactfinish-confirm 9/9 · contactbreak 40/40 · telemetry-check 12/12 ·
check-wired 0 unwired for fieldFights.js.

**Reaper incident.** 04:28Z the worktree reaper removed
`sim-finishersize-a` mid-gate — its registry heartbeat had gone exactly
4.0h stale during the long closeout. Branch kept, zero work lost. The
main session re-registered under a fresh slug (`sim-finishersize-r3` —
register refuses the old slug while its entry reads
tree-removed-branch-kept), checked out the existing branch inside, and
re-ran the gate. Lesson recorded: any main-session closeout holding a
worktree for hours must heartbeat its slug at least hourly; a closeout
tree is a live tree even though no loop owns it. (A persistent heartbeat
loop now covers the main session's held trees.)

**Safe-commit clobber.** The index clobber struck the r5 commit (staged-D
+ untracked on the same path, plus MM) and was repaired with a full
`git read-tree HEAD` (worktree hashes matched HEAD blobs; status and
diff empty after). The commit was always correct; only the index lied.

## Wall (this run's judged corpus)

Finishersize adopt band (16 seeds): wins 0/16, national 0/16, table 0/16,
wave-4 kills 30 (0 from field fights), wave-5 kills 1, median survival
122d. The committed finish does not move the wall — it cannot, with 0
addressable meetings in the wild.

## Convergence

scale-onramp stays **converging (NOT converged)**: the finishersize arm
decomposed nothing new on the scale axis and moved no wall number; the
seat's two blocking deeds remain as the 0930Z round left them (scale =
the unasked question, now being attacked by the link-forming drive, which
landed GO the same day; feast surge = never spent in a real fight).

## Metric review

- The addressable-window metric is unjudgeable in the wild (0 meetings
  in 24 seeds) — do not re-run wider wild bands hoping for a meeting.
  The harvest "wall-delivered" rule must distinguish wall-softened from
  fight-softened via recorded inter-fight damage source; the scarcity
  trigger is pool size |A|, not meeting count.
- Verify proof-test exit codes WITHOUT pipes: `node test.js | tail -1;
  echo exit:$?` reports tail's exit code (always 0), not node's. A
  measurement-proof failure was nearly masked this way. Always capture
  the real exit (`out=$(node f 2>&1); ec=$?`, no pipe) or redirect to a
  file first.
- A proof pinning ABSOLUTE trajectory values (standing/kills on a named
  seed) is master-sensitive — a landed narration-only change
  (vetkilltale) can shift it. When a pinned leg moves after a rebase,
  bisect by the env-off switch if one exists before suspecting the
  instrument.

## Next blanks (in the round note's order)

1. The link-forming drive (regionalstep follow-up) — LANDED GO the same
   day by Loop B (`7100412b8a`: links 8/8, regional 8/8, lesser seats
   4/8, median 114.5 → 128.5d).
2. The feast drive (leadfeast family — Loop B building as
   sim-feastdrive-b).
3. The sit action once a seat exists (takeseat arm).
4. A constructed wall-delivery instrument for the committed finish
   (#1829), or accept engine-proven/field-unmeasurable.
5. #1830 capable-bot — still open; adjudicate standalone on a quiet
   slot (timed out on the last three gates).
