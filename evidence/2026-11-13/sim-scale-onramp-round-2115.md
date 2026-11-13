# sim-scale-onramp-round-2115 — adoption + DIAG call + H1 transplant program (Loop A, fleshout-20261113T2115Z)

Run: fleshout-20261113T2115Z (Loop A), axis scale-onramp (survival collapse).
Master at run start: 5c2a5866f. Master at closeout: 6df2519b9 (B's
proofrefresh-b11 landing; see §2 — landed by its owner, not this run).
Claim: hidden_files/lever-claims/fleshout-20261113T2115Z.json (deleted at closeout).

## Run shape — STALE-LOCK RECOVERY + ADOPTION + SCOPING

The 2015Z Loop A run died mid-run (lock 108 min old; tree
sim-culpritbisect-c heartbeat 21:10:48Z, 53 min stale; no file writes
under 15 min old in its tree). Its arm work was COMMITTED on branch
sim-culpritbisect-c (941eecdce, proof 116/116) and is adopted here.
Loop B's 2030Z run was also flap-blocked, but its coordinator was
ALIVE — it rebased sim-proofrefresh-b11 at 22:17:21Z, re-verified, and
landed it to master itself (6df2519b9). This run stood down on B's
branch/tree/claim throughout (see §2) and did not touch them.

## 1. Arm sim-culpritbisect-c — ADOPTED, merged 941eecdce

Round 13 of the inside-the-merge bisect (prereg
evidence/2026-11-13/sim-culpritbisect-a-prereg.md, binding; same 8
seeds 190391–190398, 150d death-aware, competent verbatim own-policy,
standing fix swapped in every step). Evidence on the branch:
evidence/2026-11-13/sim-culpritbisect-c.md (read before merging;
verified, not taken on claim).

- s05 c0a85b17e 'Merge origin/master into forager deed branch': BAD
  1/8, median 125d, rank RANK_STALL, regional 0/8, wave-5 0/8 (first
  bisect step with zero wave-5 unlocks). Sole survivor 190398.
- s06 a76333124 'Merge PR #3 brawler-ascension-deed-45d4': BAD 1/8,
  median 102d (lowest median of any bisect step), rank RANK_STALL,
  regional 0/8, wave-5 0/8 (second consecutive zero). Sole survivor
  190392.
- Pick sequence in line order (good end → bad end): s06 1/8, s05 1/8,
  s04 2/8, s03 2/8, s02 2/8, s01 1/8. No pick anywhere read ≥3/8.
  a76333124 is the earliest origin commit after the merge base — its
  first parent IS the merge base d229b58f5, itself settled BAD 1/8.

### DIAG VERDICT (called by this coordinator, per the arm's recommendation)

**DIAG-ORIGIN-COLLAPSED-AT-DIVERGENCE — MET.** The prereg's condition
is exactly this shape: the earliest origin commit(s) already read
≤1/8, the first origin commit's parent (the merge base) is settled
1/8, and no good→bad transition exists inside the origin line. The
bisect is COMPLETE and definitive; it is not a failed bisect. There
is no single culprit commit inside the merge: the origin line was
already collapsed when it diverged, and the drop is a property of
the origin content as a whole. The one remaining revision, 447085506
'brawler ascension deed', was NOT ground: its tree is byte-identical
to s06's merge tree (empty diff vs the second parent), so the
deterministic harness would reproduce s06's 1/8 exactly.

Adoption verification (coordinator, not worker claim): branch base
was current master tip 5c2a5866f, so `git merge --ff-only
sim-culpritbisect-c` applied cleanly on the first attempt (22:17:02Z)
— 22 files, 1,188,387 insertions, zero conflicts. Post-merge proof
on merged master: `node scripts/test-culpritbisect-a.js` **116
passed, 0 failed** (re-run by the coordinator after the merge).
Main tree clean after merge (status empty). Tree released
done-merged, branch deleted at closeout (see §5).

Wall (judged corpora, this arm): survived 1/8 on s05 and s06,
regional 0/8, national 0, table 0, wins 0, wave-5 0/8, wave-4 8/8,
median 125d / 102d. Deaths 716 (s05) / 669 (s06), combat-heavy.
Telemetry deviation check on the s06 corpus: REFUSED,
recorder-corpus class (same refusal as all prior bisect arms) —
baseline NOT rolled.

## 2. Arm sim-proofrefresh-b11 — STAND DOWN, landed by its owner

Loop B's claim (fleshout-loop-b-20261113T2030Z.json) stayed live all
run, and its coordinator proved alive during this run: worktree files
written 22:17:21Z (rebase onto 5c2a5866f), then a second rebase onto
941eecdce (this run's culpritbisect merge), leg (a) re-verified, and
the branch merged to master as 6df2519b9 ("landing record (second
rebase onto 941eecdce, leg (a) re-verified)"). Per the loop-closeout
rule (file writes under 15 min old in a tree = live worker: stand
down), this run did not touch the branch, the tree, or the claim.
B's arm is therefore NOT adopted here — it landed by its owner.
Round 12 of the proof refresh stays owed for the next B run (per
B's own evidence note).

Panel wall numbers as carried in B's evidence (reported, not
re-measured here): 64 rows, 150d, 16 seeds × 4 policies — national
13/64, wins 16/64, entered 16/64, table 56/64, wave-5 6/64, wave-4
63/64, median survival 90d. Against b10: won 16→16, entered 16→16,
national 15→13, wave-5 13→6 (capable 6→2, socialite 4→1 — five
capable rows that reached wave 5 in b10 now win at wave 4 instead;
14 of 16 capable wins happen WITHOUT reaching wave 5). No lever was
played by that arm; no balance verdict is drawn from it here.

## 3. H1 transplant program — definition + prereg (the follow-up)

The bisect's DIAG outcome names the follow-up in the prereg: land
origin-side families onto the far end one at a time. The far end
203a32775 is GOOD 4/8; the merge e4dbe581b is BAD 1/8; the origin
line between them (157 commits, 203a32775..e4dbe581b) is collapsed
throughout. A transplant isolates one family: apply that family's
diff onto the far end and measure. The family that drops the far
end to ~1/8 carries (part of) the collapse.

### Families (origin first-parent chain, d229b58f5..a628aeaf3)

Ranked by game-code footprint (files changed vs first parent;
measured by the coordinator at run start — `git diff --name-only
<merge>^1 <merge>`). js = src/js files, pol = scripts/policies files.

| # | merge | js | pol | subject |
|---|-------|----|-----|---------|
| 1 | 1ec04e167 | 8 | 0 | PR #118 prove-out-land-all-534ac |
| 2 | 7ddcdfff9 | 4 | 0 | PR #6 raid-danger-heard-c0a3 |
| 3 | c32ff6fa8 | 3 | 0 | PR #28 dialog-recap-teach-35a9 |
| 4 | c0a85b17e | 3 | 0 | Merge origin/master into forager deed branch |
| 5 | abb3c2db2 | 0 | 3 | PR #120 garden-measurement-0315 |
| 6 | f843fab1c | 2 | 0 | PR #33 dawn-midday-repick-3e68 |
| 7 | 23245d5d6 | 2 | 0 | PR #30 dawn honesty (OVE-37 port) |
| 8 | 713eb7545 | 2 | 0 | PR #22 live-thread-dry-engage-0c50 |
| 9 | e44b0206e | 2 | 0 | PR #14 favor-debt-help-coherence-bb3e |
| 10 | fbb9c53ed | 2 | 0 | PR #4 person-trust-map-41aa |
| 11 | 0f55a928c | 1 | 0 | PR #26 voice-line-decoration-stack-b24a |
| 12 | ac119e4ed | 1 | 0 | PR #25 dialog-residual-sampler-f726 |
| 13 | a76333124 | 1 | 0 | PR #3 brawler-ascension-deed-45d4 |
| 14 | 7688cb7a4 | 1 | 0 | PR #10 snippet-stage-direction-guard |
| 15 | — | — | — | Standalone first-parent OVE commits, grouped by topic: OVE-60 duty candidates from believed needs; OVE-61 person-trust errand refresh; OVE-54 companionScore unify; OVE-51 bond/link dawn candidates; OVE-52 fighterState in both fight brains; OVE-49 fight-brain knowledge probe; believed pantry/cistern; OVE-57/56/55/53/48/47 proof refreshes (likely inert) |
| 16 | — | 0 | 0 | js=0 merges, last: #121, #119, #50, #49, #27, #24, #23, #21, #19, #17, #15, #31 — evidence/proof/data-only; test only if no carrier explains the collapse |

Caveats, recorded so no run re-learns them: (a) a js=0 reading does
not clear a family — #24 reads js=0 yet the cumulative bisect pick
through it read 2/8; cumulative pick readings NEVER transfer to a
family (each transplant measures the family ALONE on the far end).
(b) Data-only changes (godpaths.json in #4 / forager deed) ride
inside their merge families, not as separate families. (c) The
forager-deed merge (family 4) contains two sub-families (person-trust
side + forager-deed side); if it reads CARRIER, the next arm splits
it. Same for the brawler merge (family 13) vs the deed commit itself
(447085506, vacuous per §1).

### Transplant prereg (binding on every transplant arm)

- Base: far end 203a32775 (GOOD 4/8 on the bisect band), with the
  roster-check standing fix swapped in for every step exactly as the
  bisect prereg specifies (fix f8fda4295a99; native restored
  byte-identical afterwards, sha-verified). The transplant isolates
  origin families, so the base is the far end, never current master.
- Seeds: the same 8, 190391–190398. Horizon: 150d death-aware.
  Policy: competent verbatim own-policy per step (same driver as the
  bisect — reuse scripts/culpritbisect-step.sh mechanics and
  scripts/test-culpritbisect-a.js, 116 legs, plus the arm's own proof
  legs for the transplant mechanics: family diff applied completely,
  subject commit recorded, base restored).
- Subject: the transplant commit = far end + family diff, built on a
  scratch branch named transplant-<slug>-subject in the worker's
  tree and LEFT in place (branch kept, hash recorded in evidence) so
  the verdict is reproducible. Never commit the subject to the arm
  branch. Apply via `git cherry-pick -m 1 <merge>` (merge families)
  or `git cherry-pick <commit>` (standalone). On ANY conflict: STOP,
  report the conflict, do not hand-resolve game code.
- Primary metric: survived/8 on the band. GO thresholds (fresh —
  the bisect's survival-count metric does not transfer to
  family-by-family landing, per the bisect prereg):
  - ≤1/8: CARRIER — the family alone collapses the far end to the
    merge's level.
  - 2/8: AMBIGUOUS → re-run once with a fresh STEP id (bisect rule);
    2/8 again → recorded AMBIGUOUS, treated as NOT-CARRIER for
    ordering but kept on the suspect list.
  - ≥3/8: NOT-CARRIER — family alone does not collapse (far end is
    4/8, so 3/8 is within a step of it).
- Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. No cost guard —
  measurement arms; nothing lands on master.
- Telemetry: recorder-corpus class — the deviation check REFUSES
  these corpora; record the refusal, never roll the baseline.
- Order: families in the table's order, one arm per family (arms
  are independent — different families, same base — so they may run
  in parallel, one worker per family, each in its own tree).

### First transplant arm (spawned this run)

sim-transplant118 — family 1, PR #118 prove-out-land-all (1ec04e167,
js=8, the largest game-code family). Worktree registered this run
(22:21:25Z, branch sim-transplant118, base master 6df2519b9). Briefed
with the prereg above inline + the standard worker template. If it
outlives this run, the next run adopts its branch the same way this
run adopted culpritbisect-c.

## 4. Metric review

No metric proved wrong. The bisect rule needed no re-run leg in
round 13 (both steps read 1/8 outright). The wave-5 0/8 read, a
secondary in the bisect prereg, sharpened the DIAG read (the
earliest origin pick cannot even unlock wave 5, twice running) and
is carried as a secondary into the transplant prereg. The proof
refresh's cache-flags leg (b11 (c), 4/4 outright) and the
measurement-proof legs are B's, judged on B's prereg, not re-judged
here.

## 5. Infrastructure

- Host write flap: active ~21:27Z through this run's recovery.
  Flap-watch log shows A/B/E FAIL (errno=1 EPERM) at 22:05–22:15Z;
  writes cleared intermittently from ~22:16Z (first successful
  recovery write 22:16:36Z; merge 22:17:02Z; B's rebase 22:17:21Z).
  The flap blocked the 2015Z run's merge (per MEMORY.md) and this
  run's first recovery attempt: a `git checkout HEAD -- <file>`
  failed mid-write and a `printf` to the lock file truncated it to 0
  bytes (content preserved in the run's notes; rewritten whole at
  22:16:36Z once writes cleared). Recovery used a file-only restore
  (`git show HEAD:<file> > <file>`, no index write) for the
  flap-truncated main-tree steps log (restored 13 lines / 2363 bytes,
  byte-identical to HEAD).
- Background-retry lesson: a 30×60s sleep loop backgrounded by exec
  was SIGTERM'd after ~8 min (turn end kills it). Long waits must be
  in-turn bounded retries (this run's recovery loop: 10×25s,
  foreground, succeeded attempt 1) — do not background flap waits.
- Safe-commit index clobber: NOT struck this run (no worker commits
  by the coordinator; the one merge was clean). Watch for it on the
  transplant worker's commits; repair is the documented
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info` pipe.
- Main tree: dirty at run start (1 file, the flap-truncated steps
  log, restored from HEAD); clean at closeout. Disk 36% at run
  start. No pushes, no version bumps, no live verification (ship
  loop owns deploys).

## 6. Wall numbers (this run's judged corpora)

- Bisect s05/s06: survived 1/8, 1/8; regional 0/8; national 0;
  table 0; wins 0; wave-5 0/8; wave-4 8/8; median 125d / 102d.
- Proofrefresh panel (B's rows, carried): national 13/64, wins
  16/64, entered 16/64, table 56/64, wave-5 6/64, wave-4 63/64,
  median 90d.

## Next blanks, in order

1. H1 transplant program, families 2–16 in table order (family 1
   running as sim-transplant118).
2. Proof refresh round 12 — owed to the next B run (B's note), not
   this loop.
3. Headcount-ceiling (Steve-call); Reunion mirror pack in the wild
   (Steve design call) — carried from the 1930Z tracker entry.

scale-onramp stays converging (NOT converged): the bisect is closed
with a DIAG, but no win-path lever has moved — national/table/wins
remain 0 on the collapse band, and the collapse's carrier family is
still unidentified until a transplant reads CARRIER. food-economy
stays converging (untouched; parked).
