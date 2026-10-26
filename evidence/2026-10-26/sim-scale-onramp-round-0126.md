# sim-scale-onramp-round-0126 — coordinator evidence (run fleshout-20261026T0126Z)

Axis: scale-onramp (converging, NOT converged). Both arms DIAG/measurement
only, zero src/js, zero default flips. Merged locally, pending ship.

## Pre-flight + guard

- No live lock or claim at run start (fleshout-loop.lock absent; lever-claims
  held only .DEAD/.COLLIDED files; registry's newest active heartbeats
  22:32Z/22:47Z Oct 25, hours stale). No stale-lock recovery needed.
- Main tree clean at start (0 lines), disk 24%, worktree-reap left 6
  other-owner trees untouched (sim-leg2drift-b, sim-belongcost-b,
  panel-contract-rulings, sim-fullpantry-casecount-b, sim-measure-audit,
  sim-l887-sweep — none touched).
- Lock fleshout-20261026T0126Z + claim written before any sims; both
  deleted at closeout (see closeout section).
- Master did NOT move under this run until the coordinator's own merges
  (8ea64d848 -> de4bd3fbe -> eb348c311).

## Arm 1 — sim-rebaseline-a (commit de4bd3fbe): GO

The 0017Z run's named next blank (1): RE-BASELINE the shared control on
current master. Shared band seeds 73671-73678, tableseat-nowait, 180d
death-aware. Pre-registered header: 8/8 files + recorder-free determinism
proof + per-seed drift table. All three legs met; proof 295/295.

NEW AUTHORITATIVE CONTROL TABLE (base 8ea64d848; future arms judge
against THIS, not the stale 234-death band):
deaths 260, national-ever 6/8, national-final 5/8, invited/table 4/8,
entered 4/8, wins 4/8 (lesser seat only), wave-3 8/8, wave-4 5/8, wave-5
0/8, full seat 0/8, Arc IV 4/8, median 143d, starvation 9, raids 85,
raiders 352, pool 1,527, pool wave-3+ 132.

Per-seed deltas vs published control (nonworldkill-a, base acbc0c933):
six seeds reproduce published rows EXACTLY (73671, 73672, 73673, 73676,
73677, 73678, raids/pool included). All band drift sits in two seeds:
- 73674: days 180->163, survived->won (lesser, feared, day 163), Arc
  3->4, table/entered 0->1, deaths 18->30 (+12).
- 73675: days 135->180, won->survived, wave 4->3, Arc 4->3, final/max
  national->regional, national-ever/final 1->0, table/entered 1->0,
  deaths 24->38 (+14), starvation 0->4. It lived (2 people, 200 kcal)
  but never climbed.
Net checks: deaths +26, raiders -9, pool +33, poolW3 +25 — all reconcile.
Drift vs the 0017Z current-base table: NONE — every new row is identical
to its 0017Z feastdraw row on all compared fields. The 0017Z table was
already right; this arm makes it authoritative with a full corpus +
proof. Drift cause NOT bisected (per brief; candidate range from 0017Z
stands: acbc0c933->4f5f3b614, journey-scale r36 hierarchy/titans notes +
journey-landing r53, no single commit blamed). No prior corpus re-judged.

Sense: no absurdity — all wins carry national-ever + entered
(proof-asserted); the band's only wave-4 kill is still the 73678 day-115
strike by elif_demir via 'player'; world funnel produced no wave-4 kill.

Incidents (recovered): the first backgrounded sweep session vanished
after seed 73677 with no completion record; missing pieces re-run in
foreground and all 16 rows verified on disk before summary/proof. Plain
runs slow under host contention (up to ~140s for a win seed) — slowness,
not stalls. Safe-commit index clobber hit the worker commit; repaired via
cacheinfo (one repair attempt left 17 duplicate slash-less index entries
alongside the 17 correct ones; exactly those 17 mangled entries removed,
same blobs; final state status empty, diff HEAD empty, HEAD de4bd3fbe).

Evidence: evidence/2026-10-26/sim-rebaseline-a.md +
perseed-sim-rebaseline-a/ (8 rebaseline + 8 plain rows + summary.json).
Proof: scripts/test-rebaseline-a.js 295/295 (post-rebase + on merged
master). Sweep: scripts/test-rebaseline-sweep.js.

## Arm 2 — sim-driveoff-a (commit eb348c311, rebased from ad84626cb): NO-GO on the wins guard

The 0017Z run's named next blank (2): drive-off-policy feast-draw arm —
price the face/decline choice. New policy scripts/policies/feastdraw-
driveoff.js (policy-side only, no existing policy file touched). Shared
band, identical seeds, 180d death-aware, drive-off arm vs always-face
control on identical seeds. Pre-registered header: funnel legs + cost
bar (scalemetric deciding bar + wins guard >= 3).

Funnel legs ALL met: unclassified 0, driven-off rate 22/22 = 1.0, faced
0, harness-fallback fights for driven-off draws 0, driven-off draws with
a fight join 0, phantom post-checks 22/22 clean, recorder errors 0.
Proof 27/27 (post-rebase + on merged master). Detgate PASS (seed 73671,
policy-off == plain tableseat-nowait).

Drive-off vs always-face:

| arm | won | median | natEver | natFinal | table | entered | wave-4 | wave-5 | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face) | 4/8 | 143d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 9 | 260 |
| drive-off (every draw) | 0/8 | 180d | 5/8 | 2/8 | 0/8 | 0/8 | 6/8 | 0/8 | 9 | 307 |

| arm | grants (fresh/ref/ refused) | draws | faced | driven-off | kills | wave-4 draws | wave-4 kills |
|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 |
| drive-off | 30 (22/0/8) | 22 | 0 | 22 | 0 | 12 | 0 |

Verdict: NO-GO for "drive-off is free" — cost bar 4/5 met (starvation
9 vs 9+2, per-seed excess 0, median 180d vs 0.8x143d, national-ever 5 vs
6-1) but the wins guard FAILED: 0 wins vs required >= 3. The price is
measured, not zero.

What the price actually is (plain words): driving off is a real,
narrated refusal — but on this band it costs the game. The villages
that faced draws won 4 times; the villages that drove off every draw won
zero, reached the table zero times, and died more (307 vs 260) without
starving more (9 vs 9). The reason is not one forgone fight: under
always-face the draw stream stops early (win, or arming spent), so only
5 draws were ever seen. Under drive-off the arming is never spent, so a
weekly-feasting village draws weekly — 73672 drew 17 times, every 7
days, 10 of them wave-4, and drove off all 10. The cast is threat-rated
by standing, so a high-standing village's draws are mostly wave-4 (12/22
here vs 1/5 under truncated always-face). The price of declining is the
whole stream, and on this band the stream was the win.

Mechanism prediction CORRECTED by data: the worker pre-registered that a
driven-off draw would make the next grant a refresh (buff stays live,
devotion unspent). Wrong: 19 of 20 driven-off draws with a later grant
are followed by a FRESH grant, because villages re-feast ~7 days later,
after the 2-dawn buff expired. Drive-off sustains the draw stream instead
of choking it. Refreshed = 0 on both arms — the refresh branch is still
unexercised on this band.

Per-seed shape: the four no-draw seeds (73671, 73675, 73676, 73677) are
byte-identical trajectories between arms — the policy changes nothing
when no draw exists. The four draw seeds flip: 73672 won d97 -> survived
180d; 73673 won d124 -> lost d118; 73674 won d163 -> survived 180d at
global; 73678 won d116 -> lost d169 (drove off the Strike plus 2 more
draws, 52 deaths vs 34).

CONFOUND, stated plainly by the worker and carried here (do not cite the
wall delta as a pure drive-off effect): COMPETENT_SEEK_FIGHTS=0 on the
drive-off arm only, because feastFightRoad faces the draw inside the same
upkeep call that grants it — the only policy-side way to decline is to
stop it facing and answer in the harness's `pending` hook. This also
skips feasted patrol sweeps, so the arm's wall delta is (draws driven
off) + (no feasted patrol). The per-draw funnel stays clean because
nonworldkill classifies patrol fights under other doors, never
feast-draw — but the deaths/wins delta mixes both effects.

Control-agreement note: the drive-off worker's own control side
reproduces feastdraw-a's current-base band EXACTLY on all 8 seeds. It
never used the sibling rebaseline corpus, and its control agrees with the
new authoritative table. No disagreement to report.

Sense: no phantom, no narration gap, no [needs-eyes]. Decision trace,
73672 day 60: grant (fresh, mult 2.03) -> draw buffering w3 -> drive-off
ok:true -> post-check pendingEncounter false, feastDraw null, phantom
false. All 22 draws check out the same way; zero fallback fights.
Transcript (captured say-lines): arrival "Buffering is circling the edge
of the light…" then same day "Divya takes up a brand and Enrique follows
— they meet it at the edge of the light with noise and fire. Buffering
was never brave. It melts back into the dark." The 73678 Strike refusal
reads identically (Miguel + Elena). The refusal is narrated with named
villagers and an honest consequence line — the draw never silently
vanishes. The villagers cannot know they turned away the band's only
wave-4 veteran, and the fiction never claims they do; that blind choice
is honest, not a gap.

Evidence: evidence/2026-10-26/sim-driveoff-a.md +
perseed-sim-driveoff-a/ (16 rows + summary.json). Policy:
scripts/policies/feastdraw-driveoff.js. Proof:
scripts/test-driveoff-a.js 27/27. Sweep:
scripts/test-feastdraw-driveoff-sweep.js. Safe-commit index clobber hit
the worker commit; repaired via cacheinfo, verified clean.

## Wall (this run's judged corpora)

New control: national-ever 6/8, national-final 5/8, table 4/8, entered
4/8, wins 4/8 (lesser only), wave-4 5/8, wave-5 0/8, full seat 0/8,
median 143d, deaths 260. Drive-off: national-ever 5/8, table 0/8, wins
0/8, wave-4 6/8, wave-5 0/8, median 180d, deaths 307. The wall stands on
both arms; the drive-off arm produced zero wave-4 veterans from draws
against the control's one.

## Telemetry deviation check + balanced panel: NOT run, standing exception

Per the standing 1027Z instruction carried through every recent round:
recorder rows are not panels. telemetry-check counts wrong on recorder
rows (it reads top-level panel paths the rows do not carry) and the
balanced panel cannot ingest recorder corpora — the sweep-compare tables
+ analyzer outputs above are the comparison of record. Baseline NOT
rolled. No new investigation item: both arms' control sides reproduce
the current-base band exactly, so there is no deviation left unexplained.

## Infrastructure

- Merge order: rebaseline merged --ff-only first (master 8ea64d848 ->
  de4bd3fbe); drive-off rebased clean in its own worktree onto it (arm
  files byte-identical, 0 diff lines vs ad84626cb; proof 27/27
  post-rebase), then merged --ff-only (eb348c311). Zero file overlap
  between arms (rebaseline: sweep/proof/evidence/corpus; drive-off:
  policy/sweep/proof/evidence/corpus).
- Proofs on merged master: test-rebaseline-a 295/295, test-driveoff-a
  27/27. check.js --quick NOT re-run: zero src/js, zero green-list
  files, both arm proofs green on merged master (same standing as
  2330Z/0017Z runs).
- Safe-commit index clobber hit both worker commits (repaired by workers
  via cacheinfo, commits verified correct). No EPERM flap blocked this
  run's writes. Worktree registration slow (~88s for two trees, known
  slowness class), heartbeats verified in registry.
- No back-to-back second round: both arms landed/killed with verdicts,
  elapsed >30 min at closeout, and the next blanks need design (a
  cleaner decline hook), not ready arms.

## Next blanks, in order

1. Drive-off confound cleanup: a cleaner decline hook that drives off
   draws WITHOUT skipping feasted patrol sweeps (COMPETENT_SEEK_FIGHTS=0
   confound), with its own pre-registration — OR an explicit ruling that
   the confound is accepted and the wall delta is cited as mixed. Do NOT
   cite drive-off's deaths/wins delta as a pure drive-off effect until
   this is separated.
2. Refresh branch still unexercised (0 refreshes on both arms): a
   re-feast-while-buff-live arm to exercise the refresh path.
3. Drift bisection: acbc0c933->4f5f3b614 (journey-scale r36
   hierarchy/titans notes + journey-landing r53) — which line moved
   73674/73675. Still unbisected; the new control table is the fixed
   target for it.
4. unlockedWave at draw time (carried from 0017Z).
5. Fusion-reactor ceiling on feast grants (carried: 7/7 refusals in
   feastdraw, 8 refusals in drive-off — a lever question, not a finding).
6. Melt ruling for Steve (carried from tbmelt-a).
7. Wound-closure pricing paper arm, then Steve ruling on met-below-line
   finishing (carried; defender-finish stays KILLED).
8. Still-gated old-core mechanism + defender-fight narration boilerplate
   (carried).

## Closeout

- Trees released done-merged, worktrees removed, branches deleted,
  main tree clean at closeout (verified below).
- Claim + lock deleted at closeout.
- scale-onramp stays converging (NOT converged): the control band is
  now authoritative on current master and the drive-off price is
  measured, but wins still come only through default-OFF courtship +
  seat instruments and only through the lesser seat, the full seat is
  still unreached, and wave 5 still has zero births. The standing
  directive stands until the tracker records this axis converged on
  measured evidence. food-economy stays converging (untouched;
  sibling loop B).
