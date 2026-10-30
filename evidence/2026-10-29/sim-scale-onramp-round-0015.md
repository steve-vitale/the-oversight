# sim-scale-onramp-round-0015 — coordinator evidence (run fleshout-20261030T0015Z)

Run: flesh-out loop, run fleshout-20261030T0015Z (scheduled 2026-10-29
19:15 CDT = 2026-10-30 00:15 UTC). Axis: scale-onramp (blocking axis,
converging, NOT converged). Loop B live on food-economy for the whole
run (2330Z claim at start, then 0049Z claim lackingline4 +
raidname-reproof, NOT touched — B's 0049Z claim explicitly notes this
run live on scale-onramp). No push, no bump: merged locally, pending
ship. The batch ship job owns pushes and live verification.

## STALE-LOCK RECOVERY at start (before any sims)

Prior Loop A run fleshout-20261029T2115Z dead by both guard rules:
its lock was 177 min old (> 90 min fallback) and it had no registered
tree under that run_id (registry holds trees by creation time, not
coordinator run_id). Lock deleted, claim retired to .DEAD with a
.DEAD.note. Disposition of the 2115Z arms, verified before adopting:
- sim-w5counts-a already landed on master (25fdad00f evidence +
  a27a7fcff prereg/recorder, DIAG-GO).
- sim-shoutrec-a stranded committed-but-unmerged in worktree
  sim-shoutrec-a (89ca81ed2, DIAG-GO), tree heartbeat 66 min stale,
  no live processes. Adopted by this run as arm 1.
Pre-flight: main tree clean (0 lines), disk 21%, reaper removed
nothing (sibling trees flagged for uncommitted changes, left alone).

## Arm 1 — sim-shoutrec-a (ADOPTION LANDING, DIAG-GO)

Stranded branch rebased clean onto master in its own worktree
(a6ab079dd journey-landing r71 had moved master; rebase 2/2, no
conflicts, tree clean). Coordinator proof re-run on the rebased
branch AND on merged master: scripts/test-shoutrec-a.js exits
DIAG-GO with identical numbers (17/17 finite both flips; medians
kill 7.34x, survival 4.70x; wave splits 1: 3.39x/1.85x, 2: 4.59x/
3.67x, 3: 9.88x/8.10x, 4: 217.81x/157.64x; neutrality
byte-identical). Diff purely additive: 15 files, 273148 insertions,
0 deletions; only src change is fieldFights.js +22 (record-only).
Merged --ff-only as 2192ff080 (rebased from 89ca81ed2), tree
released done-merged, branch deleted, main tree clean.

What it settles (plain words): an ally who answers a shout is still
far too weak to turn the fight — now measured exactly at the shout
moment instead of guessed from the fight's end. The middle joined
fight needs its ally hitting ~7x harder to kill outright, ~5x harder
just to drive the beast off. Driving off is cheaper than killing but
5x is not close to the 1.5x "maybe entry strength is the question"
branch: only 3 of 17 priced fights sit within 1.5x on the drive-off
price, and one of those still ended in the fighter's death. At wave 4
the numbers stop being a gap and become a wall (~218x kill, ~158x
drive-off). Nearly a third of joins (7/24) never get a blow in at
all — the fighter is already below the flee floor when they shout.
That timing failure is not a damage failure and no damage multiplier
prices it; it stays a separate Steve-call question. The earlier
17.33x proxy headline must not be quoted anymore — the exact kill
median is 7.34x, survival 4.70x. DO NOT TOUCH the one-ally rule or
ally entry strength on this evidence; any future DPR work must be
wave-split and party-based, never pooled single-ally.

## Arm 2 — sim-joinendlines-a (FRESH, GO [needs-eyes])

Queued narration blank from breakline / tilejoin / allydpr /
shoutrec: joined fights ended with no log line in two cases.
Worker: sim-joinendlines-a worktree (registered + heartbeated by
coordinator). Prereg d4a810d52 (binding, before judged analysis):
Metric A drive-off ends after a shout >= 80% with minimum-n 2;
Metric B floor-flees after a shout >= 80% with minimum-n 1;
neutrality gate (after-leg rows byte-identical to before-leg rows
after stripping every log array; wall numbers identical per seed);
sense bar >= 3 transcripts incl. one of each case. Wording fixed in
the prereg; narration only, zero mechanism change (no damage,
ordering, floor, break, one-ally, or entry-strength change; the
floor-pre-empts-break ordering stays a Steve-call question).

The change (src/js/fieldFights.js, 23 insertions, 1 deletion — the
deletion is the reformatted mBreak line): a new local flag
`shoutJoined`, set ONLY in the hopeless-shout branch (NOT on
rec.calledHelp, which the allyFromStart path also sets), gates both
lines. Unjoined and allyFromStart endings byte-unchanged.
(a) mFlee, shout-joined only: "<Beast> breaks — wounded past its
line, it turns and runs. <Ally> answered <Fighter>'s shout."
(b) floor, shout-joined only: "<Ally> answered <Fighter>'s shout,
but <Fighter> is past holding — they run while running still
works." Both name the answer as a past act, so they stay honest
even when the ally has since gone down.

Band (binding): seeds 75101–75108, 180d death-aware,
tableseat-nowait verbatim + full recorder stack, BEFORE leg on
clean code (change parked in a .bak, removed before closeout) and
AFTER leg with the change only, identical seeds. RE-DERIVATION
CLAUSE honored: the BEFORE leg does NOT reproduce the published
shoutrec corpus (s75101 days 115 vs 105, deaths 26 vs 22; band won
6 vs shoutrec's reported 3, table 7 vs 4, median 114d vs 123d,
deaths 232 vs 311) — but a single-seed re-run reproduces the
before leg byte-identically modulo logs, so the divergence is
substrate drift since the shoutrec corpus was generated, not
measurement noise. The verdict judges before-vs-after on identical
seeds, never before-vs-old-numbers. The before leg IS the baseline.
(Finding appended: do NOT quote shoutrec band numbers as current.)

Results (identical seeds, before vs after):
- Joined fights in AFTER corpus: 28, ALL shout-joined (0
  allyFromStart in-band; covered by engine fixtures; flag-anomaly
  check 0).
- METRIC A: 5/5 drive-off ends after a shout carry line (a). GO.
- METRIC B: 9/9 floor-flees after a shout carry line (b), covering
  both the same-pass shape (s75101 d8 Jorge, 2 rounds) and the late
  shape (s75102 d58 Daniyar, 8 rounds). GO.
- STRAY lines: line (a) anywhere else 0, line (b) anywhere else 0.
- NEUTRALITY GATE: PASS. Wall numbers identical per seed on both
  legs (won 6, full seat 0, nationalEver 6, nationalFinal 6, table
  7, entered 6, wave4 5, wave5 0, median 114d, starvation 2, deaths
  232).
- SENSE: PASS, 3 transcripts read end to end (Morena drive-off,
  Jorge same-pass floor, Daniyar late floor). Joined fights read
  as people answering shouts; endings now exist where they didn't.
- PROOF: fixtures 19/19 pure + 14/14 engine (coordinator re-ran
  post-rebase AND post-merge: FIXTURES-PASS both times);
  node --check clean on fieldFights.js + all three new scripts.
- check.js --quick: first run completed (~14 min) with its exit
  code lost to a `tail -5` pipe — NOT claimed green on that basis.
  Second fully captured re-run: 284 passed, 6 failed in 686s (exit
  1). All 6 proven PRE-EXISTING by re-running each individually
  against BASE fieldFights.js (HEAD~2, pre-change) with identical
  exit-1 results: measurement-proof-update (stale proof inputs),
  measurement-workflow (retained neutrality proof), mobile-combat-
  cadence, occupation-panels, phone-frame-proof (stale receipts),
  establishment-r20 (voice gate). None touches field-fight
  narration. Separately, the four green-list tests most likely to
  assert field-fight log contents ran individually, all exit 0.
  The 284/6 count matches the standing pre-existing profile
  recorded by the 1930Z B run. No new failure introduced.
- VERDICT: GO. Commits (all [needs-eyes], player-visible wording):
  prereg d4a810d52, GO b0f154d39, header correction aec0bd29c,
  check correction a2c65f19e — rebased onto d6723d3f3 (journey
  deepening r67, zero overlap) as 7fb1081cb / 574e5afaa /
  9ce541ad7 / a940be8c7 and merged --ff-only. Tree released
  done-merged, branch deleted, main tree clean at a940be8c7.
  Coordinator proof re-run on merged master: FIXTURES-PASS +
  shoutrec DIAG-GO reproduced exactly.

Attribution correction (recorded, verdict unaffected): the worker's
prereg and evidence headers originally mislabeled the run as
fleshout-20261029T1915Z (the earlier adoption run). The header
correction commit fixes the evidence header; the prereg was left
unrewritten deliberately (binding document). This run is
fleshout-20261030T0015Z throughout.

Remaining blanks (documented, not built): solo endings are still
silent (unjoined mFlee + unjoined floor vFlee — same two branches
without the shout gate; follow-up arm, finding appended);
allyFromStart endings keep their existing endings by design (0
in-band); floor-pre-empts-break ordering unchanged, still a
Steve-call question.

## Wall (this run's judged corpora, report-only for diverging prototypes)

- Shoutrec fresh band (tilejoin ON substrate): won 3, nationalEver
  6, nationalFinal 5, table 4, entered 3, wave4 7, wave5 0, median
  123d, deaths 311 — identical to the tilejoin ON band on every
  headline, as expected for a record-only change.
- Joinendlines band (before = after on wall numbers): won 6, full
  seat 0, nationalEver 6, nationalFinal 6, table 7, entered 6,
  wave4 5, wave5 0, median 114d, starvation 2, deaths 232.
- Full seat still 0, wave 5 still 0, wins still only through
  default-OFF courtship + seat instruments and only through the
  lesser seat. The join thread is now closed as a measurement
  question (exact prices + honest endings); the wall itself did not
  move, by design — both arms are diag/narration, zero game
  balance change.

## Telemetry deviation check (both corpora, baseline NOT rolled)

- Shoutrec corpus: LOUD national 12->0, table 16->4, wins 16->0.
- Joinendlines-after corpus: LOUD national 12->0, wins 16->0.
- Exiled clean on both. All LOUD lines are the KNOWN
  WINSEAT-baseline regime + field-shape artifact class (per-seed
  rows carry nationalEver/entered/won, not top-level national/wins
  paths; baseline is a 16-config count vs 8-seed bands; both bands
  are diverging prototypes with report-only wall numbers) — the
  same classification as every run since 1955Z. No same-run
  investigation item beyond this classification. Baseline NOT
  rolled.

## Infrastructure

- Safe-commit index clobber hit the joinendlines worker commit
  (staged-deletion variant: committed files shown as staged-deleted
  + untracked duplicates; worktree files hash-matched HEAD blobs).
  Worker repaired its own index after every safe-commit (verified
  by coordinator: hash-object == HEAD blob for all files; final
  status clean before report). No reset, no force.
- Rebase note: the shoutrec adoption rebase and the joinendlines
  landing rebase were both clean in their own worktrees
  (GIT_SEQUENCE_EDITOR=true; no todo stalls this run). Master moved
  twice under the run (journey-landing r71, journey deepening r67,
  plus B's raidname-collision landing) — zero file overlap with
  either arm.
- check.js --quick NOT re-run at coordinator level beyond the
  worker's own captured run + coordinator fixture re-runs (arm 1
  zero behavior change beyond record-only fields; arm 2 gated by
  its proof suite + base-proven 284/6 profile).
- Rotation file NOT advanced (convergence-directed work supersedes
  the rotation; documented here for Steve's overrule).
- Sibling B's untracked coordinator evidence appeared in the main
  tree at no point during this run's closeout; nothing foreign was
  touched. Sibling trees present at closeout (gaps2, journey-scale,
  B's lackingline/raidname trees) left alone.

## Metric review (for the NEXT run — nothing re-scored here)

- Shoutrec-band numbers are STALE on current master (see
  re-derivation above). Future arms on the 75101–75108 band must
  re-derive their own before leg and quote re-derived denominators,
  never shoutrec's published corpus. The 17.33x proxy headline is
  retired; exact medians are kill 7.34x, survival 4.70x.
- Survival-flip is the right primary for village survival (median
  4.70x vs kill 7.34x); kill-flip stays as context. A true flip
  multiplier needs a simulated counterfactual fight, not a scaled
  rate — both formulas here are sufficient, not necessary.
- The joinendlines classifier's trick-mFlee exclusion list was
  code-derived, not observed in-band (0 trick endings among 28
  joined fights); a future band that produces one must re-verify
  the list against that log.
- Minimum-n: joinendlines A (2) and B (1) were comfortably exceeded
  (5, 9). No revision proposed.

## Convergence note

scale-onramp stays converging (NOT converged): the join thread is
now fully priced AND honestly narrated — joins convert every
addressable-shape fight (24/24 tilejoin) yet flip almost none of
them (2/24 kills; exact survival gap 4.70x median, 157.64x at wave
4; 29.2% never strike at all) and every joined ending now reads
legibly — but no wave-4 field party kill path landed, full seat 0,
wave 5 0, wins only via default-OFF instruments and the lesser
seat. The next arm on this axis must either change what a join is
for (floor timing, party formation, survival-flip targeting) or
prove with a simulated counterfactual that a bridgeable gap
exists — not re-price the pooled median, and not re-narrate these
endings. food-economy stays converging (untouched; sibling loop B
lane). Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-scale-onramp-round-0015.md (this
file) + sim-shoutrec-a-prereg.md + sim-shoutrec-a.md +
perseed-shoutrec-a/ + sim-joinendlines-a-prereg.md +
sim-joinendlines-a.md + perseed-joinendlines-a/ (all on master,
merged locally pending ship).
