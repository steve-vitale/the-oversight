# 2026-11-12 1515Z — fleshout-20261112T1515Z (Loop A): STALE-LOCK RECOVERY + adoption — bisect ROUND 8 + stall-cut-32 LANDED

Run fleshout-20261112T1515Z, Loop A, axis scale-onramp (the survival-collapse
bisect + rank-stall window). Both arms LANDED, merged locally pending ship.

## Stale-lock recovery

Lock held run fleshout-20261112T1315Z (created 13:19:06Z); at this run's
start the lock was 117 min old (past the 90-min fallback) and its tree
sim-stallcut32-a's heartbeat was 63 min stale — previous run DEAD per the
guard. Lock deleted, dead claim retired to .DEAD after the orphaned work
was verified safely committed. Loop B live on its 1430Z claim
(winnability-chain: sim-cut7confirm-b + sim-gateclassify-b +
sim-proofrefresh-b9) — NOT touched.

Dead-run verification at adoption: arm sim-bisect-r7-cut-a already on
master (5c4361ccc, 580a00114); arm sim-eldergrammar-a already on master
(a5b75cab8); arm sim-stallcut32-a stranded at its prereg commit only
(7f7e1144f) with the fix-swap applied and the sweep never run.

## Arm 1 — sim-stallcut32-a (ADOPTION): LANDED 21d6f1fe1

Completed in its existing worktree. Prereg + driver + analyzer + proof
were committed; the worker verified the swap sha (f8fda4295a99) and the
instrument sha, ran the 8-seed sweep, analyzed, wrote evidence, proved,
restored standing.js byte-identical, deleted the scratch instrument.

- **STALLCUT32_COLLAPSED 1/8 survived + STALL_STILL_IN 0/8 regional.**
  The stall transition sits in **commits 33–65** (`715c2918d` →
  `a18d7438c`), not the first 32. The collapse was already written in at
  commit 32, so the regional unlock (commits 33–65) and the survival
  collapse are two different transitions.
- Median 102d; deaths 669 (93% combat/expedition/wild; starvation 1);
  standing 145–199 — **7/8 seeds end at exactly 199**, one point under
  regional; wave 5 0/8; national/table/wins 0; tribute-ready 0/8.
- Wave-5 choke: peak living wave-4+ veterans never exceeds 1 per seed
  (bar is 2). Phantom days 0 on all seeds. Blooded 1/8 (report field
  only — the BLOODED block has no callers on this base).
- **ARC IV: the instrument does not capture it** — no arc field in
  driver/instrument/analyzer or any per-seed JSON; recorded plainly in
  the evidence, judged rules unchanged (1130Z blank #4 partially
  answered: the rank-judging arm that cannot read ARC IV says so).
- Proof 63/63 on the branch and on the rebased tree. One test-only fix
  en route: the proof's wrong-sha refusal regex said `BISECTSTALLCUT
  STOP` while the driver prints `BISECTSTALLCUT32 STOP` (driver was
  refusing correctly; verified by manual reproduction, exit 2).
- Landing: ff-only correctly refused at first (branch built on the old
  bisect base, not master tip); rebased onto 5c4361ccc clean, proof
  63/63 re-run green, merged ff-only. Evidence
  evidence/2026-11-12/sim-stallcut32-a.md (commit 21d6f1fe1).

## Arm 2 — sim-bisect-r8-cut-a: LANDED 5e60f2f22

Bisect ROUND 8. Base a6ed956f5 (377th commit of d229b58f5..203a32775,
midpoint of the live window 362–393 per r7 §8). Same 8-seed band
190391–190398, 150d death-aware, competent verbatim, r131 fix swapped
in uncommitted, same survival + rank rules, `\belder\b` filter,
4-field per-day signature, killers keyed `by`.

- **CUT8_COLLAPSED 2/8 survived + REGIONAL_INTACT 8/8.** Median 144d;
  deaths 689; wins 0, national 0, table 0; wave-5 4/8; wave-4 8/8;
  standing 199–435; blooded 0/8; tribute-ready 0/8.
- **The corpus is deep-identical to the r7-cut, r6-cut, and r5-cut2
  corpora on all 8 seeds** — 0 daily-snapshot diffs, identical deaths,
  kill calls, and vetSays (339 lines / 201 distinct). Commits 263–377
  are behaviorally inert, and for 362–377 that is structural (228
  files, all `evidence/`/`scripts/`, zero `src/js`, zero `src/data`).
  **The live window is now the final 16 commits, 378–393.**
- Wave-5 choke stays cut-2-shaped: peak living wave-4+ veterans 2 on
  exactly the four unlocking seeds, fully-ready days 2/5/6/2 equal pair
  days, every fully-ready village unlocked; no weapons-blocked pair, no
  fully-ready-but-unlocked village. Roster-check fix holds — 0 phantom
  days by the engine's rule (1 strict day, 190398 d123, terminal
  empty-roster snapshot where the counted veteran is the current
  scholar); 4 shadow-prevented days on 190392 only. ARC IV fires on
  all 8 seeds (first days d47–73, reported-only). The gate still
  doesn't talk (0 tribute/table/seat/door mentions). Scream-freeze
  line repeats 65×; Sa-strikes line 11× on 190393 d135.
- Proof 63/63 before any judged sim and after the band, and again on
  the rebased tree and on merged master.
- Landing: branch arrived detached (worker advanced HEAD by hand after
  the detached-HEAD safe-commit ref-update failure, same as r7);
  branch ref moved to e1e6b023, rebased onto 21d6f1fe1 clean, proof
  re-run green. First ff-only merge attempt then failed — master had
  moved under the run (journey-crisis r186, 3 commits, 69b5de96e). The
  release step was chained with `;` after that refused merge and
  wrongly marked the registry entry done-merged while the branch was
  unmerged; the coordinator caught it, reverted the registry entry to
  active under flock, rebased onto 69b5de96e, re-proved 63/63, merged
  ff-only, and verified ancestry (`git merge-base --is-ancestor`)
  before releasing. Evidence evidence/2026-11-12/sim-bisect-r8-cut-a.md
  (commit 5e60f2f22).

## Wall (same band 190391–190398, 150d)

| Leg | Base | Survived | Regional | Median | Wave 5 |
|---|---|---|---|---|---|
| vetphantom fix leg | 5157782a4 | 6/8 | 8/8 | 150d | 3/8 |
| merge-base | d229b58f5 | 1/8 | 0/8 | 102d | 0/8 |
| r5-cut1 | 6dc7f8162 | 2/8 | 8/8 | 110d | 2/8 |
| r5-cut2 | 2215e22d4 | 2/8 | 8/8 | 144d | 4/8 |
| r6-cut | c7786d567 | 2/8 | 8/8 | 144d | 4/8 |
| r7-cut | 21fc590d0 | 2/8 | 8/8 | 144d | 4/8 |
| **r8-cut** | **a6ed956f5** | **2/8** | **8/8** | **144d** | **4/8** |
| stall-cut | a18d7438c | 0/8 | 8/8 | 123d | 1/8 |
| **stall-cut-32** | **715c2918d** | **1/8** | **0/8** | **102d** | **0/8** |
| firstparent | 203a32775 | 4/8 | — | 150d | 2/8 |

Wins 0, national 0, table 0 on every leg. Villages die fighting, not
hungry (93–95% combat/expedition/wild; starvation 0–1). The two defects
are now fully separated and each narrowed: the collapse's live window is
16 commits (378–393); the stall's live window is 33 commits (33–65).
The firstparent at the far end is only 4/8 INCONCLUSIVE, so the
collapse's exit still cannot be cleanly localized even in the final 16.

## Telemetry deviation check

REFUSED by the tool on the r8 corpus (recorder-corpus class, same as all
prior bisect arms — exit 2: rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs) — recorded, not waived, baseline NOT
rolled. Same refusal on the stallcut32 corpus per its worker. No LOUD
lines; nothing to investigate.

## Infrastructure

- A runtime restart killed the r8 worktree registration mid-write
  (worktree + branch created, registry entry missing, REGISTRY.lock
  stale). Recovered by completing the entry under flock with the
  script's exact schema and run_id; registration verified active 15/16
  with a fresh heartbeat. The r8 worktree arrived locked
  ("initializing") and with an incomplete checkout (empty index, src/ +
  scripts/ missing) plus a stale index.lock; the worker recovered via
  index repair + `git checkout HEAD -- .`.
- Safe-commit index clobber struck the stallcut32 worker commit —
  repaired via the ls-tree -r pipe, commit verified correct.
  safe-commit.sh hit the detached-HEAD ref-update failure on both r8
  commits — commits created correctly, HEAD advanced by hand with `git
  update-ref --no-deref` after verification, same handling as r7.
- Master moved twice under the run (stallcut32 merge 21d6f1fe1,
  journey-crisis r186 69b5de96e); both rebases used explicit SHAs. The
  chained-release-after-refused-merge error above is the
  2026-11-09 lesson re-learned: never chain release steps after a merge
  with `;`; verify ancestry before releasing.
- No EPERM flap this run. check.js --quick NOT re-run: both arms are
  scripts/evidence-only (zero src/js, zero green-list files), both
  proof tests green on merged master; Loop B's sim-gateclassify-b owns
  the round-6 gate classification.
- Reap at closeout: 12/16 active, removed nothing (all flagged trees
  carry uncommitted changes belonging to their owners).

scale-onramp stays converging (NOT converged): national/table/wins still
0 on every band; the bisect has narrowed both defects to small windows
but no lever has moved the wall numbers. Next blanks, in order: (1)
bisect ROUND 9 — cut near the ~385th commit of d229b58f5..203a32775
(midpoint of the final 16), same band/rules/swap, read against BOTH
ends; (2) stall cut at the midpoint of commits 33–65 (~49th commit) —
the LEG 3 tribute scholar-exclusion (b1c8e730c, 61st commit) sits in
that half, so a cut past it splits the ladder/scholar reads; (3) proof
refresh round 9 on the next manifest change (Loop B's 1430Z arm owns
it — do not pre-claim); (4) player named-class regression_watch
(13/16→10/16) — one line in the next synergy follow-up; (5) ARC IV /
rank correlation — r8 reports ARC IV on 8/8; stallcut32's instrument
cannot read it (recorded, not a blank to re-run). Claim deleted; lock
deleted.
