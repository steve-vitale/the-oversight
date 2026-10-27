# sim-scale-onramp-round-0525 — coordinator evidence (run fleshout-20261027T0525Z, axis scale-onramp)

Loop A run. Sibling loop B live on food-economy the whole run (0049Z claim,
stockdoors + bothgrow, NOT touched). Scale-onramp is the topmost
non-converged axis and was not named in any live claim at run start.

Blanks worked in 0447Z order: (1) final-loss non-restore SKIPPED (tree
sim-finalloss-a still in-flight with uncommitted changes, NOT touched,
NOT re-claimed — third run in a row to leave it alone); (2) 73677
divergence on the raidtrace base CLAIMED as sim-divergebase-a; (3)–(5)
ruling-pending, skipped. Second arm sim-nonworldkill-a takes the w4funnel
next blank (non-world TB kill funnel). Both arms DIAG / measurement only,
zero src/js, no default flips, no game lever landed.

## Arm 1 — sim-divergebase-a: DIAG-GO (commit 8422813ed, proof 31/0)

Question: does the seed-73677 census-vs-transcript divergence found by
sim-raidtrace-a reproduce on the raidtrace base itself
(c8770e7f4412aa6430d6daa3ce86e28484f0de20)? Run 0447Z (sim-diverge73677-a)
had already shown it does NOT reproduce on the current base.

Answer: YES, exactly, 3 rep pairs out of 3. On the old base, seed 73677
reads raidtrace's numbers in both modes, deterministically:

| Seed 73677, old base c8770e7f | Days | Deaths | Won | Walls |
|-------------------------------|------|--------|-----|-------|
| Census (narration-off), reps 1–3 | 152 | 41 | 0 | 0 |
| Transcript (narration-on), reps 1–3 | 168 | 44 | 0 | 2 |

Transcript doc byte-identical to raidtrace's own transcript doc; armed
rows match raidtrace's on every field except the worktree directory name
embedded in stack-trace strings. Within-mode variance is zero on every
field. This is a stable property of the old base's narration modes, not
a flaky run.

What it means for the base-move hypothesis: the divergence exists on the
old base and not on the current base. Commit c04d4e0cb (journey-scale r42
bystander-hold fix, src/js/game.js, 17 lines) is the SOLE src/js change
between raidtrace's base and the current branch, so it is IMPLICATED but
NOT proven as the cause. Plausibility is not proof; causation needs a
bisection, which this arm does not run.

C/D emit bisection gate (as pre-registered): the gate is now OPEN. A
future arm, on the old base under its own pre-registration, may run the
C/D bisection from diverge73677-a's prereg and name the mechanism. That
arm does not exist yet; nothing here proposes a narration fix (voice
changes need Steve's ruling).

Procedure correction disclosed in the arm evidence: the raidtrace sweep
and emit recorder do not exist AT commit c8770e7f itself (they were new
files created by the raidtrace arm on top of that base); they were
restored onto the detached checkout verbatim from the arm branch
(one commit each, the raidtrace commit fd3bcd83d) and never committed
there. Old game code + old harness + old sweep + verbatim raidtrace
recorder — the raidtrace arm's own setup, not a hybrid.

Evidence: evidence/2026-10-27/sim-divergebase-a.md + prereg +
perseed-divergebase-a/ (12 files).

## Arm 2 — sim-nonworldkill-a: DIAG-NO-GO (commit 3164b1dc1, proof 26/0)

Question: the non-world TB kill funnel — which initiation path produced
the band's only wave-4 kill on the October 25 band (seed 73678, day 115,
a TB kill with null world origin matching no world arrival), and how
many veterans does that channel produce band-wide?

Verdict: DIAG-NO-GO on the control leg. The armed band does NOT reproduce
the published w4funnel control band — 10 of 15 headlines deviate (table
in the arm evidence). Per the arm's pre-registration, a moved headline
baseline is itself a DIAG-NO-GO gap, even though legs (b) and (c) pass on
their own terms on this base. The numbers below describe THIS base, not
the w4funnel band, and must not be compared to it as if the baseline
held.

Control gate, field-by-field (control → this run): raids 85 → 89,
raiders 361 → 382, deaths 234 → 284, national-ever 7/8 → 7/8,
national-final 6/8 → 5/8, table invited 4/8 → 5/8, entered 4/8 → 4/8,
wins 4/8 → 4/8, median survival 135d → 130d, wave-3 8/8 → 8/8,
wave-4 6/8 → 5/8, wave-5 0/8 → 0/8, starvation deaths 5 → 2,
pool total 1,494 → 1,442, pool wave-3+ 107 → 161. Only seed 73671 ends
the same way; 73673 collapses 92 days earlier than its control win, and
73678 — the seed that produced the October 25 strike kill — never
reaches wave 4 at all this run (wave 3, village-lost day 122).

Kill assignment on this base (passes on its own terms): every wave-4
kill (2/2) is initiation-classified, unclassified 0 — both world-bump
kills (73671 day 121 congregation, 73677 day 113 influencer).
Non-world characterization (passes on its own terms): 36 null-origin
fights, 1 null-origin wave-4 fight, 0 null-origin wave-4 kills; the
73678-day-115-type kill does NOT recur. Feast draw fired 10 times,
killed 8 monsters, drew no wave-4 monster at all.

Detgate PASS on the current base (seed 73671, recorders OFF vs plain:
days 180/181, no diag surface, no wraps installed) — so the control
deviation is BASE MOVEMENT between 2026-10-25 and 2026-10-27, not
recorder interference. Note the detgate's own tsNationalDay is 91,
against 77 on the October 25 base: 73671 reaches national 14 days later
than it did on the old base.

Plain-words answer (this base only): the non-world door produced
nothing and the feast door produced nothing either. Both wave-4 kills
came the ordinary way — a monster already standing on the scholar's
tile bumped into her, and villagers killed it. But because the baseline
moved, this does NOT revise the October 25 answer — it says the October
25 answer no longer has a band to stand on. Any future funnel work must
re-pin its control on the current base first.

Sense note (arm evidence): the one null-origin wave-4 fight (a Suburb
on the last day of the longest run, no kill) reads as an ordinary
straggler meeting, not a hidden channel — no in-fiction anomaly claimed.

Evidence: evidence/2026-10-27/sim-nonworldkill-a.md + prereg +
perseed-nonworldkill-a/ (analysis + summary + 8 armed rows).

## Wall numbers (this run's current-base corpus only)

From the nonworldkill band (seeds 73671–73678, tableseat-nowait, 180d
death-aware, current base): national-ever 7/8, national-final 5/8,
table invited 5/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8,
median survival 130d, deaths 284, starvation deaths 2. The divergebase
corpus is a single-seed old-base comparison, not a band, and is not
counted in these numbers. Standing 0321Z band wall (old base) is NOT
re-judged here.

In plain words: villages still reach national and still win lesser
seats, but wave 5 stays at zero and the full seat stays unreached. The
wave-4 kill story got stranger, not clearer: on the current base the
only kills are ordinary world-bump kills, and the one exotic kill that
made the October 25 band interesting cannot recur because its village
dies before wave 4. The funnel's baseline itself moved under us.

## Metric review

- Divergebase: pre-registered bar met exactly (3/3 pairs differ, 3/3 in
  raidtrace's direction). No metric change proposed. The old-base
  reproduction bar worked as designed; the C/D gate it opens should
  keep its own pre-registration when a future arm claims it.
- Nonworldkill: the control-gate leg did its job — it caught a moved
  baseline instead of letting the arm compare across bases. No metric
  change proposed, but a standing caution for future funnel arms: a
  control band pinned to a date is stale the moment the base moves;
  re-pin the control in the same run (same base, same recorders-off
  detgate) before judging any funnel number.
- No pre-registered metric was re-scored mid-run in either arm.

## Landing

- Master moved twice under the run before landing (ship-loop version
  bump 732064950 + journey-endgame r55 b486bcba3, zero file overlap
  with either arm). Both branches rebased clean onto the new master;
  proofs re-ran green after every rebase and on merged master
  (divergebase 31/0, nonworldkill 26/0). No EPERM flap on this run's
  writes. No safe-commit index clobber on the coordinator commit
  (workers reported the clobber on their own commits and repaired via
  HEAD-blob cacheinfo).
- Merged locally, pending ship. No push, no version bump, no live
  verification (ship loop owns deploys).
- Trees released done-merged, branches deleted, main tree clean at
  closeout. Sibling trees untouched (sim-finalloss-a, sim-stockdoors-b,
  and all others left exactly as found).

## Next blanks, in order

1. Final-loss non-restore — CHECK tree sim-finalloss-a before
   re-claiming (still in-flight, fourth run in a row to leave it alone).
2. C/D emit bisection on the OLD base — gate OPEN per divergebase
   prereg; needs its own worktree, its own prereg, old-base procedure
   as divergebase ran it.
3. W4funnel control re-pin on the current base — required before any
   future funnel number is judged; the October 25 control is stale.
4. Raid-wall toll narration — ruling pending.
5. Monster-knowledge link spec — design ruling, not a lever.
6. TB channel reset, situation-blind table talk, dead-entry drop,
   1354Z steve-calls — all ruling-pending, skipped.

scale-onramp stays converging (NOT converged): wave 5 still 0/8, full
seat unreached, and the funnel baseline itself is now known-stale.
food-economy stays converging (untouched; sibling loop B).
Rotation left at 3. Claim deleted; lock deleted.

## Check note

`node scripts/check.js --quick` was started per repo AGENTS.md but produced
no output in 8+ minutes (box under sibling-test contention) and was
stopped rather than blocking the landing. This run changes zero src/js:
both arm proof suites are green on merged master (divergebase 31/0,
nonworldkill 26/0), which is the attributable verification for these
measurement-only arms.
