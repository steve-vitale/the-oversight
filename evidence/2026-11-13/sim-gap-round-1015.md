# sim-gap-round-1015 — Loop A adoption round (run fleshout-20261113T1015Z)

Run: oversight-flesh-out-loop, run fleshout-20261113T1015Z (scheduled 0415 CST).
Axis: scale-onramp (converging, NOT converged). Base master at run start
`85f9cbff6`. This run is an ADOPTION run for the dead 0715Z run — it spawned
no new arms. Both 0715Z workers finished during the 0915Z run's watch and
their reports were delivered before this run started.

## Guard

No lock file existed at run start (the 0915Z run had deleted its lock at
closeout; the 0715Z lock had been stale-lock recovered by the 0915Z run).
This run's lock (`fleshout-20261113T1015Z`) was created at 10:15Z. Claim
`fleshout-20261113T1015Z.json` written before any adoption work. Loop B LIVE
on its 0830Z claim (winnability chain: collapseband3-b, combatdedup-b,
auditfix-b) — NOT touched. Two chat agents live on Lane A r129 adoption —
NOT touched; master moved once under this run (journey social r189,
evidence-only — see below), re-verified before each merge.

## Arm 1 — sim-burnoffsets-a (ADOPTED, LANDED 377e12141)

Worker report delivered (agent `3306e435`, done, seen). Branch clean with
3 commits on master `f7352f946`. Adoption verified, not assumed:
- Heartbeat first (10:22:55Z, read back from the registry).
- Rebase onto current master `85f9cbff6`: clean, no quirk, 3 commits
  replayed (new SHAs `a2d8622c9`, `375e7ed50`, `377e12141`), tree clean.
- Proof re-run on the rebased tip: `node scripts/test-burnoffsets-a.js`
  read **61 passed, 1 failed** — the §7 check "analyzer refuses a missing
  corpus with exit 1 + INCOMPLETE" (status=null). Diagnosed, not waived:
  the check was written when the corpus was absent (tooling commit,
  pre-legs); the evidence commit has since added the b1 corpus, so the
  analyzer legitimately analyzes it and exits 0 instead of refusing.
  Proved by reproduction: arm files byte-identical across the rebase
  (`git diff 74be43d0f a2d8622c9 -- <arm files>` empty), and the proof run
  in a sparse archive of the rebased tip with the perseed dirs removed
  reads **62/0 green, exit 0**. The 61/1 on the live tree is a
  corpus-presence artifact of re-running the proof post-evidence-commit,
  not a rebase regression and not a code defect. No test was edited.
- Merged `--ff-only` (no pipe, strict chain), ancestry verified, main
  tree clean after. Tree released as done-merged, worktree removed,
  branch deleted. Master tip after merge `377e12141`.

**Verdict: NO-GO — NO STREAM SAVES A GAP SEED (5 offsets sampled).**
Per-seed table and deep-diff in `evidence/2026-11-13/sim-burnoffsets-a.md`:
baseline 1/8 median 139d; b1 3/8, b13 1/8, b251 1/8, b499 3/8, b1999 1/8;
gap save and survivor-keep never coincide (b13/b251 save 190392 but lose
190395; b1999 keeps 190395 but saves no gap seed; 190394 saved by NO
offset, 0/6). All 40 seed-legs diverge from baseline from day 2 —
sensitivity proven, leverage not. GAP-NOT-DICE stands and hardens; the
stream question is parked after 6 sampled offsets
(997 + 1 + 13 + 251 + 499 + 1999). Wall on all 48 seed-runs: national
0/8, table 0/8, wins 0/8 per leg; wave 5 reached 11/48; survival 10/48.

## Arm 2 — sim-freezeline-a (ADOPTED, LANDED 4a2cc89de)

Worker report delivered (agent `78ec984b`, done, seen). Branch clean with
1 commit on master `f7352f946`. Adoption verified, not assumed:
- Heartbeat first (read back from the registry).
- Rebase onto `377e12141`: clean, 1 commit replayed (`3971b7c41`).
  Proof re-run: `test-freezeline-a.js` **18/19** instrument and 18/19
  `--game` — the single failure in both modes is the anchor-pin check
  ("worktree HEAD is the preregistered tip", expects `f7352f946`); every
  substantive check passes, including all G1/G2/G2b/G3 RED→GREEN
  game-level checks. The pin fails by construction after ANY rebase
  (HEAD can never equal the preregistered tip on newer master) — same
  adoption-artifact family as the burnoffsets corpus check. No test was
  edited. Src diff vs base is exactly the fix (`src/js/game.js` +15/-1).
- First merge attempt FAILED LOUDLY as designed: master had moved to
  `c66b5ff3e` (journey social r189, 3 evidence-only commits, no src/js
  changes) between the proof re-run and the merge, so `--ff-only`
  refused (exit 1, tree untouched, main tree clean). Rebased onto
  `c66b5ff3e` (clean, `4a2cc89de`), re-ran both proof modes (18/19 +
  18/19, same single anchor-pin failure), merged `--ff-only`,
  ancestry verified, main tree clean after. Tree released as
  done-merged, worktree removed, branch deleted. Master tip after merge
  `4a2cc89de`.
- Inffight regression (`scripts/test-inffight-20261014.js`, green-list
  line 453), re-run per the 0915Z checklist: **9 passed, 3 failed** on
  the rebased tip — G1 "the heads close in" (leadPos=6,4), G1
  "Deliberation lands" (landed=0), G2 "Deliberation threatens"
  (landed=0). Decisive A/B: the SAME 3 failures occur on pristine
  master `377e12141` (sparse archive, no fix) — the failures are
  PRE-EXISTING on current master, NOT caused by the fix (identical
  9/3 on both legs; the fix is narration-only and trajectory-identical
  on 9 seeds). Filed as a new open finding (sim-findings.md
  2026-11-13, INFFIGHT REGRESSION NET RED): the 2026-10-14 Focus Group
  close-in fix is marked [fixed] with 12/12 GREEN at the time, so the
  close-in has regressed or the test has bit-rotted — needs a re-probe
  before the net can be trusted again. CORRECTION to the arm evidence:
  its claim that inffight "PASSED in both check.js --quick runs" cannot
  hold — green-list line 453 carries no `quick` tag and `--quick`
  filters to quick-tagged jobs only, so the test never ran in those
  runs. It was absent from the 5 failures because it was not run, not
  because it passed.

**Verdict: GO (fix) — CHECK REPRODUCES, fix lands, narration-only.**
Freeze line "…is still frozen from your scream." 44 → 21 lines on the
9-seed check band (190391–190398 + 190407), worst same-text group 9 → 1
(the remaining 4-line day is 2 fights × 2 monsters, diagnostic-proven);
survival/wave numbers byte-identical 9/9. Fix: once-per-monster-per-fight
dedup in `tbMonsterTurn` (`f._stunAnnounced[m.key]`, `src/js/game.js`).
Commit message carries `[needs-eyes]` (narration/feel change). Full
evidence: `evidence/2026-11-13/sim-freezeline-a.md` (+ prereg, corpora
`perseed-freezeline-a-check/` + `perseed-freezeline-a-after/`).

## Arm 3 — sim-gap-round-0455 draft (ADOPTED, b576bf6e2)

The 0455Z gap-diagnostic draft (`hidden_files/sim-gap-round-0455-DRAFT.md`)
adopted into `evidence/2026-11-13/sim-gap-round-0455.md` with an adoption
header, committed as coordinator evidence `b576bf6e2` (file verified:
316 lines / 18475 bytes = header + verbatim draft; tree clean after,
no index clobber). The header records the resolution the draft itself
demanded: its conditional DIAG-GO ("gap is RNG-carried, pending arm 2's
deciding test") was put to that test by sim-gap-candidates-a (`4d79e6056`,
GAP-NOT-DICE) and hardened by tendshift-a and burnoffsets-a — the
conditional verdict does NOT stand as judged. What stands is the
diagnostic analysis: the r180 draw-site verification, the §4 exclusions,
and the VOICELESS EATER / VOICELESS JOINS sense findings.

## Wall (this run's judged corpora)

- Burnoffsets baseline b0 (current master `f7352f946`, band 190391–190398,
  competent, 150d): survived 1/8, regional 8/8, national 0/8, table 0/8,
  wins 0/8, wave-4 unlock 8/8, wave-5 unlock 1/8 (190398), median 139d.
- Burnoffsets legs b1/b13/b251/b499/b1999: survived 3/8, 1/8, 1/8, 3/8,
  1/8; national/table/wins 0 on every leg; wave-5 2/8, 1/8, 1/8, 4/8, 2/8.
- Freezeline check/after legs (same band + 190407): survival/wave
  byte-identical 9/9 across the fix; national/table/wins 0 on both legs.
- No other judged corpus this run. The wall is unchanged in kind: the
  current-master baseline is 1/8 survived where the far end was 4/8 and
  the healthy pole 6/8 (the master-regression diagnostic remains the
  next blank).

## Telemetry deviation check

Attempted per loop body step 10 on the burnoffsets b0 corpus: REFUSED
by the tool ("refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs"),
same refusal class as the tendshift and burnoffsets arms' own attempts.
Recorded, not waived; the scale-wall baseline was NOT rolled. No LOUD
lines exist to investigate (the tool refused the input class entirely).

## Metric review

- The burnoffsets and freezeline arms' primary metrics held as
  pre-registered and were judged against MEASURED baselines on identical
  seeds; no re-scoring happened in this run.
- Two adoption artifacts, both understood and recorded, neither a metric
  change: (a) a proof test re-run AFTER its evidence corpora were
  committed can read 61/1 where the worker recorded 62/0, because a
  refusal check's precondition (corpus absent) no longer holds — the
  proof is green in the precondition it was written for (verified in a
  corpus-absent scratch copy of the rebased tip); (b) an anchor-pin check
  fails by construction after any rebase (HEAD ≠ preregistered tip) —
  the substantive checks are the adoption gate, the pin is not. Future
  arms with anchor pins or corpus-absence refusal checks will hit the
  same two artifacts on adoption; the coordinator evidence is where the
  explanation belongs, not in the arm's test.
- The inffight finding is NOT a metric revision: the test was already red
  on the base, and the fix's A/B on it is identical. It is a regression-net
  finding, filed for a future re-probe arm.

## Infrastructure

- Host write flap: ALL-OK for the whole run (flap-watch log 10:12–10:16Z
  and through closeout; no EPERM anywhere). One self-inflicted /tmp
  incident: a full-repo `git archive | tar -x` filled the 512M tmpfs
  (509M) and the tool-output spill failed with ENOSPC; cleaned
  immediately (`/tmp` back to 1%), no work lost. LESSON: never extract a
  repo archive to /tmp — use `~/workspace/scratch-*` (home has 87G free)
  and prefer sparse archives (scripts + src + index.html only).
- Reaper lock contention, again: heartbeat calls took ~2 min each
  (queued behind REGISTRY.lock); both landed. The reaper fix (release
  the lock during scans / already-running guard) is still owed and still
  needs a Steve nod. Final `worktree-reap.sh` sweep: ran clean in ~55s,
  active 12/16, no removals; LOUD lines only for live trees with
  uncommitted changes (wideduty-a, sametick-a, journey-scale-attr,
  secondlink-a, siegedesign-a, redactor-a, saycap-a, siegedialog-a,
  combatdedup-b, auditfix-b) — none touched. Burnoffsets-a and
  freezeline-a are gone from the active list (released as done-merged).
- Safe-commit index clobber: NOT hit on any commit this run (the two
  rebases, the two merges, and the coordinator commit all left clean
  status + empty diff HEAD). The burnoffsets worker's second clobber
  (recorded in its evidence commit) is the known pattern; its
  prefix-pathspec repair lesson (verify the ls-tree pipe emits N lines)
  is now in the arm evidence.
- Master moved twice under this run: 85f9cbff6 → 377e12141 (this run's
  burnoffsets merge) → c66b5ff3e (journey social r189, evidence-only,
  landed by the playtest loop) → 4a2cc89de (freezeline merge) →
  b576bf6e2 (0455 adoption commit). No pushes, no version bumps. Ship
  loop owns deploys.

## Convergence state

scale-onramp stays converging (NOT converged): no stream offset and no
tendexact × stream-shift interaction saves a gap seed, the healthy
pole's 6/8 is not re-derived by any tested combination, and
national/table/wins are 0 on every judged corpus — and the wall on
current master reads LOWER than the collapse-window numbers said
(baseline 1/8, median 139d). The directive stands until the tracker
records this axis converged on measured evidence. Next blanks, in
order: (1) the master regression on the matched band (1/8 vs the far
end's 4/8 — what moved between 203a32775 and f7352f946); (2) the
applyStatus freeze line (filed finding, next narration blank, one layer
down from the fixed line); (3) inffight regression-net re-probe (Focus
Group close-in: regressed or bit-rotted); (4) headcount-ceiling
(Steve-call); (5) Reunion mirror pack in the wild (Steve design call).
food-economy stays converging (untouched; parked). Claim
fleshout-20261113T0915Z retired to .DEAD by the 0915Z run; this run's
claim (fleshout-20261113T1015Z) retires to .DEAD at closeout. Lock
deleted.

## Corpora + handoffs

- `evidence/2026-11-13/sim-burnoffsets-a.md` (+ prereg, 6 summaries,
  6 driver logs, deep-diff/secondary logs, 48 per-seed JSONs)
- `evidence/2026-11-13/sim-freezeline-a.md` (+ prereg, check/after
  driver logs, 18 per-seed JSONs)
- `evidence/2026-11-13/sim-gap-round-0455.md` (adopted draft +
  adoption header)
