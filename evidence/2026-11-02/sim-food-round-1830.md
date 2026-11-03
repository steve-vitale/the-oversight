# sim-food-round-1830 — Loop B 1830Z coordinator evidence (axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0036Z
(scheduled 18:30 CST 2026-11-02). Axis food-economy (second
non-converged axis; scale-onramp is Loop A's lane — Loop A live
throughout, NOT touched: A landed its 0011Z arms mid-run as
ee016ba16 and started a new run 0115Z, also NOT touched).
Claim written before any sims; lock created at run start.
Pre-flight: main tree clean at 1ce6d98fd, disk 22%, reaper
removed nothing sibling-owned.

## Stale-lock recovery (run 2233Z, read first)

The previous B run (fleshout-loop-b-20261102T2233Z) was DEAD by
both body tests: lock 22:33Z > 90 min old, tree sim-cband-b
heartbeat 22:41Z > 15 min stale, no live procs, last worktree
write 00:20Z. Its claim was retired to .DEAD with a recovery
note; its lock deleted. Its work was NOT lost (see Arm 1);
its 1730Z recovery was still pending (see Arm 2). This run
adopted its tree (heartbeat re-verified 00:47:10Z) and landed
both, then ran one new arm.

## Arm 1 (recovery) — sim-cband-b: pilot GO, MERGED f7bd5070f

Recovered branch sim-cband-b (worker commits 620314529 /
6102d5c69 / 518ec8e36, pilot GO 7/8 integrity-ok, 7
established-band, 0 episodes outward-fenced). The adopted
worktree showed the known safe-commit index clobber: 37 files
staged as deleted while byte-identical to HEAD on disk
(all 37 hashes verified == HEAD blobs). Repaired via
HEAD-blob cacheinfo; worktree verified clean. Rebased 3/3
onto master clean (zero file overlap with master-side
changes); arm-file diff vs old tip EMPTY; proofs re-run
green on the rebased tip: test-cband-b.js 25/25,
test-destfirst-b.js 21/21, test-homewardconstruct-b.js
15/15, test-homeward-shapes-b.js ALL PASS. Merged
--ff-only, ancestor-verified in the same call; worktree
released/removed, branch deleted.

What it means in plain words: the C-only judged band EXISTS
— 7 judged trips where the homeward guard demonstrably
fired on the attempt hop. The 0-episode reading is NOT a
failure: every veto on this band was outward (attempt hops
away from haven), and the inherited episode definition
counts only vetoed homeward hops. Whether "fences shape C"
should include outward attempt vetoes is the carried
coordinator question for the next C prereg, not a re-score
here. Established-strict 0/8 exactly as the prereg
predicted (outward vetoes carry originSimOk null).

## Arm 2 (recovery) — 1730Z coordinator evidence, MERGED 2618b3b8c

hidden_files/coord-1730-pending-evidence.md filed verbatim
as evidence/2026-11-02/sim-food-round-1730.md with a landing
addendum (no judged sim re-run; 1730Z verdicts stand:
destfirst DIAG-NO-BAND, collapseband TIMELINESS-FAIL).
Safe-commit index clobber hit the commit (1 file,
staged-deletion variant); repaired via HEAD-blob cacheinfo,
commit verified (1 file, 298 insertions). Merged --ff-only,
ancestor-verified; worktree released/removed, branch
deleted. The deferred destfirst/collapseband branch
deletions are MOOT: no such branches and no registry
entries remain. Pending file retired to .LANDED with a note
so no later run re-files it.

## Arm 3 (new) — sim-atimescale-b: NO-GO, MERGED 36ec276a7

Question (brief hidden_files/arm-briefs-20261102/
sim-atimescale-b-brief.md): does any already-tried A
destination close over days 5–8? Worker branch
sim-atimescale-b; prereg committed BEFORE any judged leg
(original 82fe83f48, rebased cb4330c47); tools 2eef69d0d /
81cd8a88f; evidence 92e97ef8e / 36ec276a7. Proof
test-atimescale-b.js 8/8 re-run green on the rebased tip
(7 analyzer fixtures + reused-files-unmodified). All
additions, zero src/js, zero edits to competent.js or any
reused script/policy, zero default flips. Prereg-faithful
method: the archived destfirst stage-2 A legs already ran
30 days with competent.daily untouched on days 6–8, so
their days 5–8 records ARE the multi-day extension;
licensed by a determinism spot-check (69701-6,2, 69709-5,8,
69703-0,0 re-run verbatim, 12/12 day records matched
exactly). No re-screening, no new seed band.

Verdict judged exactly against the prereg (GO >= 1
confirmed multi-day A setup): NO-GO, 0/40. Breakdown:
walkout-incomplete 22 (engine-blocked routes);
walk-out-E-failed 4 (pocket already at entry — outward
prevention, not rescue); clean-entry 14, of which
camp-broken-day7 4, camp-broken-day8 8,
camped-through-day8-with-E-passing 2. No clean-entry leg
ever saw a day-end E failure at the destination on days 6,
7, or 8. The 69709-5,8 near-miss (E false at the
destination days 5–7) fails the walk-out clause, so it is
not a closing. Context only: 69707-5,3 was still camped
past day 8 with E passing through day 11.

Mechanism (the finding, not a re-score): four days of
foraging do not kill the lateral escape (both through-camp
cases stayed lateral legs=1, direct failing, every night),
and camp duration caps the window — 12 of 14 clean camps
end by day 8. The next question is not "longer" but "what
closes a lateral."

Sense test (longest clean-camp case, 69701-6,2): reads as a
person foraging out — shoots/nuts, hickory, wild onion,
village life continuing at home — but with an honest
oddity: kcal drains 1120 → 256 → 67 → 0 across the camp,
"STARVING" on day 8, yet the scholar stays out and only
walks home day 9 despite the lateral escape being open
throughout. Flagged as shadow-leg instrument behavior,
not a game verdict.

Master moved under this arm (Loop A landing ee016ba16):
branch rebased onto ee016ba16 clean (zero overlap),
arm-file diff vs old tip EMPTY, proofs green, then merged
--ff-only, ancestor-verified; worktree released/removed,
branch deleted.

## Wall numbers (this run's corpora — honestly limited)

- Atimescale legs (40, 30d construction legs, not natural
  play): daysAlive 30 on 39, 29 on 1; maxWave wave-2 on 11,
  wave-3 on 29; national / table / wins 0 in-window.
- Cband pilot: per its report (7/8 integrity-ok, 7
  established-band, 0 episodes); no wall rate claimed.
- No wall movement shown or claimed by any arm this run.
  Scale-wall baseline NOT rolled (see Telemetry).

## Metric review

No metric was re-scored mid-run in any arm. Atimescale's
panel leg was vacuous by prereg design (diag-only, no
before/after pair); no compare was fabricated. Cband's
panel leg stands as its report states. Open metric
questions carried forward: (a) whether "fences shape C"
should include outward attempt vetoes (next C prereg must
decide before judging); (b) the atimescale "what closes a
lateral" question needs a fresh prereg, not an extension
of the days 5–8 window.

## Telemetry deviation check

Prescribed invocation on this run's per-seed evidence glob
(atimescale read .txt files) returned one LOUD line: a
parse refusal (reads are day records, not JSON recorder
rows) — the same artifact class as prior runs, NOT a
deviation signal. Baseline NOT rolled, no investigation
item.

## Infrastructure

- Container EPERM flap NOT hit on this run's writes:
  probes passed on .git refs, worktrees dir, and
  hidden_files at run start, and no write failed after.
- Safe-commit index clobber (staged-deletion variant)
  hit twice: the adopted cband tree (37 files) and the
  1730 coordinator commit (1 file). Both repaired via
  HEAD-blob cacheinfo with commit contents verified.
  No clobber check is owed on the atimescale branch
  beyond the usual post-commit status verification
  (clean at worker closeout and after rebase).
- Worktree registrations slow under sibling load (~2 min
  checkout each); the atimescale rebase took ~3 min wall
  but completed clean. No ref surgery forced anywhere.
- check.js --quick NOT re-run: zero src/js changes,
  zero green-list files, standing 280/7 profile recorded
  by sibling runs this cycle.

## Findings appended

6 items appended to hidden_files/sim-findings.md
(1671 → 1677, verified +6, no duplicates): 4 cband items
(originSimOk-null clause gap, shapes-C episode blindness
on outward-fenced bands, day-6 veto-memory narration gap,
armed walk-out through E-failing tiles) + 2 atimescale
items (no A closing over days 5–8; starving shadow-leg
camper with the way home open).

## Verdicts

- sim-cband-b: pilot GO, LANDED f7bd5070f. The C-only
  judged band exists; the guard fences shape C on outward
  attempts.
- sim-food-round-1730 evidence: LANDED 2618b3b8c.
  Deferred deletions moot; pending file retired.
- sim-atimescale-b: NO-GO, LANDED 36ec276a7. No
  already-tried A destination closes over days 5–8.
  The A problem is NOT a timescale problem.
- Merged locally, pending ship (all three commits;
  no push, no version bump — ship loop owns deploys).

food-economy stays converging (NOT converged): the
homeward guard now has a judged C band but still no A
closing mechanism, and the gatediseng sensor still has
no timely rule on a fresh collapsing band — but the
A-timescale question is now answered, not open.
scale-onramp untouched (sibling Loop A lane).
Next blanks, in order: (1) sensor redesign addressing
cliff-blindness + bounce-delay (a new rule shape, not a
threshold tweak; (c)-vs-(a) tradeoff measured both ways,
no swap claimed); (2) what closes a lateral (new
question from atimescale — fresh prereg, not a longer
window); (3) C prereg metric call: does "fences shape C"
include outward attempt vetoes; (4) guard-E creek-hop
fidelity (69502); (5) pocket persistence mechanism
(69501 day-12 opening); (6) guard→succession cascade
(69604); then (7)–(25) as listed in the 1730Z entry,
unchanged. C-filename-origin practice is now satisfied
by cband/atimescale filenames; no separate fix owed.
