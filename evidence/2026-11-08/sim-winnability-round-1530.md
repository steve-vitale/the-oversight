# sim-winnability-round-1530 — Loop B 1530Z (ADOPTION/CLOSEOUT of dead 1230Z run)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261108T1530Z, axis
scale-onramp / winnability chain (converging, NOT converged).
Coordinator-only adoption run: no new workers, no new sims. Master at
closeout: 9962b53fc (this run's fightloop merge; see below).

## STALE-LOCK RECOVERY at start

Lock fleshout-loop-b-20261108T1230Z (created 2026-11-08T12:30:00Z, ~3h20m
old) and its claim were still live. The run's tree sim-fightloop2-b
heartbeat was 13:55:52Z (94+ min stale, past the 15-min guard); all
three workers terminal (tendtrust done, pelletpass done, fightloop
done — timeout report + supplementary update delivered); no
coordinator evidence file existed for the run. Run confirmed dead;
lock deleted after reading its run_id; own lock + claim
(fleshout-loop-b-20261108T1530Z) written before any sims. Claim
retired to .DEAD with a note at closeout (see below).

## SCOPE NARROWING — live Loop A 1515Z closeout (16:05Z)

This run's original claim also covered the medicduty landing and the
Loop A 1315Z closeout per the main-session decisions (~09:25 CST).
By 16:05Z that work was LIVE Loop A work, not owed: the 1515Z closeout
run (branch sim-food-closeout-1515) had already rebased + merged the
medicduty branch onto master (d910dc6da, 15:33Z) and the neutral-proof
refresh (d3a89d896), and was staging the 1315Z coordinator evidence in
tree closeout-food1315 (evidence file written 15:37Z). This run stood
down on all of it — medicduty landing, 1315Z evidence/lock/claim,
sim-medicduty-basecheck release (Loop A has since removed that tree) —
and narrowed to the dead B 1230Z run only. The claim file was amended
at 16:05Z to record the narrowing. The 1315Z lock + claim remain live
Loop A work; the main tree's untracked
evidence/2026-11-08/sim-food-adoption-round-1315.md is Loop A's live
closeout file, NOT touched by this run and NOT this run's dirt.

## The dead 1230Z run's three arms — dispositions

### sim-tendtrust-b: DIAG-GO, already on master (a111b57fa)

Tend/trust DIAG on the Binding leg (band 76401–76408, tableseat-nowait,
180d): 76 tends, +8 lift, mourning choke 27/32. Lever sized (engine
drive must run while national, tend to 55). Evidence + prereg committed
by the worker and merged before this run started. Nothing owed here
except the record: the 1230Z coordinator never wrote it.

### sim-pelletpass-alone-b: AMBIGUOUS, already on master (204bc55bb)

Pellet pass alone on the #14 base, full-8 frozen band 53001–53008:
median 82d, sits 3/8 (bars ≥120d AND ≥4/8) — BELOW #14 on both bars.
Minimal flipping set is {#15, #16} AS A PAIR, not #16 alone; the
tracker's "fingered landing is #16" (1030Z) is superseded (see the
main-session decisions in the tracker). Evidence + prereg committed by
the worker and merged before this run started. Nothing owed here except
the record.

### sim-fightloop-b: NO-GO, ADOPTED + LANDED AS RECORD by this run

Recovery: the worker's verdict was recovered from its timeout report
(agent-b4672d4b-2fe7-4a7d-a9b5-6fe15bd83568, session transcript message
seq 492) plus its supplementary update (check.js --quick re-run
285/9). The adopting coordinator independently verified every cited
number against the corpora (sits, starvation, medians, all 8 root
fights) and re-ran both proof legs on the reverted tree.

Verdict (binding bars): **NO-GO** — primary (a) missed (53002 Kieran
day-4 fight: candidate vFlee 2r / 82 HP vs C1 bar 5–7r / 30–45 HP) AND
secondary sits missed (5/8 vs ≥6). Unit leg passed 8/8; root-fight
table 7/8 unchanged; median 150 ≥ 106.8 PASS; starvation 4 ≤ 5 PASS.
No confirm band spent (53801–53812 stays fresh). The fix was built
exactly per prereg, measured, judged, and REVERTED — no game-code
trace. Full evidence: evidence/2026-11-08/sim-fightloop-b.md.

Coordinator adoption steps (all in tree sim-fightloop2-b, branch
sim-fightloop2-b):
- Reverted the uncommitted fix (`git checkout HEAD --
  src/js/fieldFights.js`); verified `git diff HEAD -- src/` empty.
- Attribution check the worker flagged: test-mobile-combat-cadence.js
  re-run on the REVERTED tree — 13 passed, 2 failed, the SAME two
  failures as on the fixed tree. Pre-existing, not fix-caused.
- Proof re-run on the reverted tree: test-fightloop-fix-b.js 20
  passed, 8 failed — the expected by-design pattern (6 unit legs fail
  on unfixed code; the same 2 53002 legs fail, reading the corpora).
- Wrote evidence/2026-11-08/sim-fightloop-b.md (from the recovered
  report + independent verification).
- Committed evidence + panels + compare (7d7f05b46) and corpora
  8+8 (2f5ca9f13) via safe-commit.sh. The directory-path form fails
  in safe-commit.sh (known lesson) — expanded file lists were used
  for the corpora commit.
- Safe-commit index clobber struck on BOTH commits (committed files
  showing staged-as-deleted, byte-identical to HEAD) — repaired via
  the documented `git ls-tree HEAD | git update-index --add
  --index-info` pipe (plain form for the first, `-r` form for the
  corpus dirs), verified `git status` empty + `git diff HEAD` empty
  after each repair. Commits always correct.
- Deleted panel cases/ caches before commit per §15 (panel.json.gz
  only, reproducible from seeds + digests).
- Rebased onto explicit master SHA d3a89d896 (read fresh immediately
  before; the 1515Z neutral-proof refresh had just landed) — 3/3
  picks, no quirk, no conflicts. Proof re-run on the rebased tip:
  20 passed, 8 failed (expected pattern). Merged --ff-only; HEAD
  verified moved in a separate command: 9962b53fc. Tree released
  done-merged, branch deleted. Worktree clean at closeout.

## Scale-wall numbers (this run's judged corpora)

Fightloop pilot (frozen band 53001–53008, 150d, doorwalk leg):
baseline national 0/8, table sits 7/8 (lesser), wins 0/8, wave-5
reach 4/8, median 133.5d; candidate national 0/8, sits 5/8, wins 0/8,
wave-5 reach 2/8, median 150d. Full seat 0 everywhere. Tendtrust /
pelletpass wall numbers are in their own evidence files (already on
master); the 1230Z run's wall as a whole: national 0 on the frozen
band, wins 0, full seat 0.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-08/perseed-fightloop-b-candidate/*.json' --metrics national,table,wins,exiled`
→ **refused by design**: recorder-corpus input (all 8 rows carry
top-level anchorCommit). No LOUD lines, no compare — the §15
sweep-compare tables are the sanctioned comparison for recorder
corpora (same refusal as the 1030Z mid15 corpus). The §15 panel
compare (review_required) is attached to the fightloop evidence.
Baseline NOT rolled.

## Infrastructure

- Safe-commit index clobber hit both fightloop commits (see above) —
  repaired via cacheinfo, commits verified correct. Main-tree index
  NOT touched by this run (no main-tree commits except the ff-merge
  of the fightloop branch).
- Stale duplicate claim removed: lever-claims/fleshout-20261108T1017Z.json
  was byte-identical to its .DEAD copy (retired by the 1315Z run at
  13:19Z, which copied instead of moving) — the live .json was debris
  that would misread as a live claim. Verified with `cmp`, then
  removed; the .DEAD + .DEAD.note remain.
- `worktree-reap.sh` ran at pre-flight: 7/16 active, no dead trees
  removed; its LOUD lines are other owners' uncommitted trees, not
  touched.
- `check.js --quick` NOT re-run on merged master: zero src/js in the
  landed branch (evidence + instruments only); the worker's fixed-tree
  runs (288/6 first, 285/9 re-run) are fully attributed in the
  fightloop evidence file, with the combat-area item resolved by the
  coordinator on the reverted tree.
- Main tree at closeout: one untracked file —
  evidence/2026-11-08/sim-food-adoption-round-1315.md — Loop A's live
  1515Z closeout file, left alone. Everything else clean.

## Findings appended (2)

sim-findings.md: hopeless-decoupling over-flees / middle shape owed;
finalSeat prices a seat never taken (53004).

## Convergence

scale-onramp stays converging (NOT converged): candidate (b) is killed
as scoped, the frozen band is healthy on current master, the full seat
is still unreached (0 everywhere this run), wins still come only
through the lesser seat, wave 5 is 2–4/8 on the frozen band. The
pellet finger is corrected to {#15, #16} as a pair (pelletpass-alone
AMBIGUOUS); the pellet-boost build lane is live elsewhere (not this
run). food-economy stays converging (Loop A 1515Z closeout live at
closeout — medicduty landed d910dc6da + proof refresh d3a89d896; the
1315Z evidence/lock/claim closeout is theirs, not this run's).
Next blanks, in order: (1) the middle-shape fight-judgment arm
(partial mitigation in the morale read, or the C1 protection-4 value)
— own pre-registration, judged on the 53002 fight + sits bar; (2) the
53007 question (never heals anywhere in #1..#17); (3) the Binding-leg
tend/trust build (tendtrust DIAG-GO sized the lever: engine drive
runs while national, tend to 55); (4) the trial-by-combat staging
question (steve-call, unchanged).
Claim deleted; lock deleted. Evidence: this file + evidence/2026-11-08/sim-fightloop-b.md (commits 9962b53fc, 48398abcf, f3ef55474).
