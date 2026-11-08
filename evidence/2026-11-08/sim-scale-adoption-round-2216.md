# sim-scale-adoption-round-2216 — adoption/closeout of the dead 1916Z run (2 arms LANDED as NO-GO records, merged locally pending ship)

Run: oversight-flesh-out-loop, run fleshout-20261108T2216Z, axis
scale-onramp / winnability chain (converging, NOT converged).
Coordinator-only adoption run: no new sims. The two stranded arms were
verified by adoption verifiers (rebase + proof reproduce, in their own
worktrees) and landed by the coordinator. Loop B live on scale-onramp
the whole run (1930Z claim: sim-riskdeath-b + sim-flipsocial-b) — NOT
touched, never duplicate.

## Pre-registration (adoption scope)

Land the two stranded arms of the dead 1622Z run (adopted by the dead
1916Z run, which left no round evidence): sim-midshape-a (protection-4
fight judgment, NO-GO) + sim-tenddrive-a (Binding-leg tend while
national, NO-GO). Landing bars per arm: clean rebase onto current
master, proof reproduces its documented pattern on the rebased tip,
zero `src/` diff, worktree contains only committed work. No game-code
change lands from either arm — both fixes were reverted on their
branches before this run. Sim-53007-a, the third 1622Z arm, was already
on master before the 1916Z run started (a943e17a3, committed
19:03:54Z) and needed no adoption.

## STALE-LOCK RECOVERY

Deleted the 1916Z lock (created 19:16:30Z, ~3h05m old at recovery) and
retired its claim to `.DEAD` with a note. Its trees' heartbeats
(sim-midshape-a 19:31:47Z, sim-tenddrive-a 19:31:49Z) were ~2h50m
stale — dead per the 15-min guard and the 90-min fallback. The 1916Z
coordinator left NO round evidence file anywhere (searched repo
evidence/2026-11-08, goal hidden_files, both worktrees): its 1622Z
note points at evidence/2026-11-08/sim-scale-onramp-round-1916.md,
which does not exist. That pointer is dead; this file is the adoption
record instead, so no later reader chases it. Own lock + claim
(fleshout-20261108T2216Z) written before any landing work.

## Arm 1 — sim-midshape-a: LANDED 3e31ca84b (NO-GO, CONCEPT-DEAD as scoped)

Evidence: evidence/2026-11-08/sim-midshape-a.md (+ prereg,
corpora, panels, compare). Proof: scripts/test-midshape-a.js.
Instrument: scripts/combatdiv-20261107.js (vTakenP4/allyTakenP4
recording + FLAPWRITE retry).

The middle shape — judging the field-fight hopeless/flee trajectory
on incoming damage mitigated as if protection were 4 — is killed as
scoped. The 53002 Kieran day-4 fight does not move at all on the
candidate leg (byte-identical to baseline: vKill, 10 rounds, 87 taken,
13 HP, same tail log), and the unit leg splits by protection (P3 flees
at round 3 on the floor, P5 kills at round 8). Two binding primary
bars missed; secondary passes but cannot rescue a primary miss. The
mechanism is measured, not guessed: the P4 read fixes only the
denominator, while the fighter's live HP trajectory still carries his
worn protection — the less-armored fighter falls into the floor before
the judgment turns hopeless, the armored one rides the winning line to
the kill. The judgment's one visible effect on the frozen band is a
faster, cheaper kill via the shout (53006 Rosa: 8r→5r, 57→15 taken,
ally joins) — braver, not wiser. Panel (§15) review_required, watches
leaning negative (capable win/entry/sitting/national 0.875 → 0.625).
No confirm band spent (53801–53812 stays fresh).

Adoption verification (verifier + coordinator re-check): rebased
6680d7924 → 2813a4466 (4 picks, clean, no quirk, no conflict), then
8c9f76562 after the tenddrive merge (4 picks, clean); proof re-run on
the final tip 20 passed / 9 failed — the exact unfixed pattern
(unit leg 3/6 as documented; all 16 root-presence assertions pass;
the 9 failures are the verdict bars). `git diff <base> -- src/`
empty; 96 files, evidence/* + scripts/* only. Worktree clean at
release; branch deleted.

## Arm 2 — sim-tenddrive-a: LANDED 8c9f76562 (NO-GO)

Evidence: evidence/2026-11-08/sim-tenddrive-a.md (+ prereg, sense,
corpora, panels, compare). Proofs: scripts/test-tenddrive-a.js,
scripts/test-tenddrive-a-sweep.js, scripts/test-tenddrive-a-judge.js.

The Binding-leg tend build — let the villagers' own tend drive run
while national, tend links up to trust 55 — is NO-GO on its binding
bars. MECHANISM passes (2 engine tends while national, both seed
76402 day 89; links topped to ≥55 on 3 seeds) and SECONDARY passes
(starvation 2→2, median 97→97), but PRIMARY fails: national final
3→3 (delta 0, needed +2). The loss story does not reproduce on this
base — zero national losses on the baseline leg, so the headroom had
nothing to save (tendtrust's losses were on the older base; the
pellet-boost build landed between). 76407 now qualifies d105 and
holds; 76408 never reaches national at all (links decay d60→99
before qualification — a PRE-national persistence failure the fix
cannot touch). Panel (§15) review_required; every metric delta
exactly 0 on three policies, capable deaths-watch only. The fix was
reverted on the branch; the test is retained as the lever's
specification (fails 2/4 on reverted code by design, NOT on the green
list). No confirm band spent (76409–76420 stays fresh).

Adoption verification: rebased 6680d7924 → 2813a4466 (12 picks incl.
the empty accident commit f72edc66, clean, no quirk, no conflict);
proof re-run on the rebased tip 2/4 by design (national-tend FAIL,
cap55 FAIL, cap50 PASS, muster-national PASS), judge exit 1 PRIMARY
FAIL (national final 3→3; 76407 holds, 76408 never reaches national).
`git diff <base> -- src/` empty; 44 files, evidence/* + scripts/*
only; win-plan.js byte-identical to the new base. Worktree clean at
release; branch deleted.

## Wall (this run's judged corpora, 32 configs — before/after legs share seeds)

- Midshape, frozen band 53001–53008, 150d, competent doorwalk:
  national 0/8 both legs, wins 0, wave-5 reach 3/8 → 2/8, median
  150d → 129.5d, sits 4/8 → 6/8 (takeseatStats).
- Tenddrive, band 76401–76408, 180d, tableseat-nowait: national
  ever/final 3/8 both legs, global ever 2, table seen 7 / entered 3 /
  enteredFull 0, won 3 (all lesser seat) both legs, wave-4 8/8,
  wave-5 2/8 both, median 97d both, max 107d.
- Pooled rows: national final 6/32 rows (3/16 distinct seeds), wins
  6/32 rows (3/16 seeds, all lesser), wave-5 9/32 rows, enteredFull
  0/32. Full seat 0 everywhere this run.

## Telemetry deviation check

- Midshape corpora: REFUSED by the tool's own guard — recorder rows
  carry top-level anchorCommit ("Recorder corpora are compared with
  sweep-compare tables, never against a run baseline here"). The
  sanctioned comparison is the §15 panel + evidence tables, already
  in the arm evidence. No LOUD lines, no baseline roll.
- Tenddrive corpora (before + after, --sweep-rows): 1 LOUD line each,
  identical on both legs — wins swung −62% (baseline 16 → current 6,
  n=16 rows). This is the documented regime artifact: the WINSEAT
  baseline's own _regime note forbids comparing pre-seat/courtship
  substrates against it, the 16 rows are 8 seeds × 2 legs (3 wins
  counted twice), and before == after exactly, so nothing moved.
  Baseline NOT rolled, no investigation item.

## Proofs on merged master (HEAD 3e31ca84b)

- `node scripts/test-tenddrive-a.js`: 2/4 as documented
  (national-tend FAIL, cap55 FAIL, cap50 PASS, muster-national PASS).
- `node scripts/test-midshape-a.js`: 20 passed / 9 failed, the same
  9 assertions as the verifier's run.
- `check.js --quick` NOT re-run: zero `src/js`, zero green-list files
  in either landing (both proof tests are explicitly not on the green
  list); the standing profile 296/4 was recorded by the pellet
  rework final gate at 22:04Z on 2813a4466, the base these merges
  stack on. No src/green-list content changed under it.

## Metric review (adoption run)

Landing bars all met: clean rebases (no quirk, no conflict),
proofs reproduce their documented patterns on the final tips, zero
`src/` diff on both arms, worktrees clean at release. The arms' own
metric reviews stand as written in their evidence files; nothing
re-scored, no confirm band spent by either arm. The adoption itself
introduces no new metric judgment — it lands two recorded NO-GOs.

## Sense (SENSE-TESTING LAW — no new sims this run; the arms' sense reads stand)

Kieran fights the cliffhanger on day 4 and kills it in ten rounds,
taking 87 damage and standing at 13 HP — the same fight, blow for
blow, on both legs of the midshape corpus; the protection-4 judgment
watches the same blows land a little harder in its own arithmetic
(96 instead of 87) and still cannot call the fight lost. On the
tenddrive corpus, day 89 carries two grain lines — Haven sending
grain to Stonebridge's and Thornfield's fires, trust +8 each — the
first time the village is heard tending its friendships while
national, on its final night, changing no outcome. Both arms' stories
are coherent; neither changes what the villages do next.

## Village assessment in plain words

Eight frozen-band villages with one change in how fighters judge a
fight: two villages that died young on the baseline live to sit
instead, but two others die younger, and the villages bleed more
people doing it (91 dead instead of 68, wounds that won't close 9
instead of 2) while reaching wave 5 less. The judgment makes one
fighter braver, not wiser, and builds no nation.

Eight Binding-band villages with one change in when the village
tends its friendships: only one village ever needs it, only on its
last night, when the invitation has already come. The villages that
lose the country level do not lose it here — one never gets there
because its friendships fade before the country level is offered,
and the other now reaches it late and holds it. The change is
harmless and buys nothing on this set of villages.

## Blanks filled or documented

- FILLED (measured): the middle shape is killed as scoped — the
  protection-4 judgment does not restore the C1 fight shape
  (sim-midshape-a, this run).
- FILLED (measured): the tend-while-national gate works but has no
  national-loss event to save on this base (sim-tenddrive-a, this
  run).
- FILLED (measured): the 53006 shout — a P4-hopeless read with allies
  near shortens a fight (8r→5r, 57→15 taken) instead of fleeing it.
- FILLED (measured): at worn protection 4 the P4 read equals the live
  read exactly (53007: 64 == 64).
- DOCUMENTED (not built): the blend variant (partial mitigation) or a
  numerator-aware shape (judge the HP trajectory as if protection
  were 4) is the named next fight-judgment arm — new prereg, not a
  tuning pass on the killed shape.
- DOCUMENTED (not built): a tend retest needs a band (or base) where
  national losses actually occur; 76408's pre-national link decay is
  upstream of the tend gate and is the prior blank.
- DOCUMENTED: the frozen band is seed-frozen, not trajectory-frozen —
  4/8 prereg roots don't occur on current master (medicduty departure
  blocks / pellet boost moved early trajectories). Future preregs must
  re-verify root fights on the current master.
- DOCUMENTED: `finalSeat` vs `takeseatStats` gap persists (lesser
  priced, never taken).
- DOCUMENTED: midshape panel duplicate-file quirk — each `cases/`
  dir holds 36 files, not 32: seed 53001 has a second file per policy
  (an `observe: 0` duplicate alongside `observe: 1`); the compare
  consumed 8 paired cases per policy, so this is a duplicate-file
  quirk, not missing or extra cases.
- DOCUMENTED: the 1916Z dead round-evidence pointer (see STALE-LOCK
  RECOVERY above).

## Findings for the backlog (coordinator appends)

- The middle shape (protection-4 judgment) is killed as scoped —
  next arm: blend variant or numerator-aware shape (this evidence).
- Frozen-band roots must be re-verified on the current master before
  binding a prereg to them — 4/8 0245Z roots don't occur on
  6680d7924 (medicduty departure blocks / pellet boost moved early
  trajectories).
- The hopeless/floor interaction: a fighter whose HP collapses into
  the floor never gets to be "hopeless" — the floor decides the
  less-armored leg (midshape unit leg, P3 round 3).
- Candidate-leg bleed (91 vs 68 fallen; wound-fever 9 vs 2; phoenix
  link 8 vs 0) — watch item for the next fight-judgment arm.
- Tenddrive metric note: the MECHANISM bar's part (b) (link topped
  to trust ≥55 while national) is non-discriminating as measured —
  the baseline already has 3 seeds ≥55 while national via court/aid
  gains, not tends. A future bar should require the topping to be
  tend-attributed.

## Convergence

scale-onramp stays converging (NOT converged): two more levers are
killed as scoped with their records now on master, the full seat is
still unreached (0 everywhere this run), wins still come only through
the lesser seat, wave 5 still 2–3/8 on the judged bands. The
fight-judgment line now needs a new shape (blend or numerator-aware),
and the tend line needs a loss-bearing band; neither is a tuning pass
on the killed arms. Next blanks, in order: (1) the risk-aware
death-cause read on the healed leg — Loop B's live arm
sim-riskdeath-b, NOT touched; (2) the socialite/winse ek panel
columns for the flip — Loop B's live arm sim-flipsocial-b, NOT
touched; (3) the blend / numerator-aware fight-judgment arm (new,
from midshape); (4) a tend retest on a national-loss-bearing band
(new, from tenddrive); (5) 76408-class pre-national link decay
(upstream of tend); (6) the trial-by-combat staging question
(steve-call, unchanged). food-economy stays converging (untouched;
sibling loop B). Rotation left at 4 (convergence work does not cycle
it).

## Infrastructure notes (for the next run)

- No EPERM flap observed this run. No safe-commit index clobber on
  the coordinator commit (verified below). Rebase stop-at-pick quirk
  did NOT strike on either arm (8 clean rebases total across the two
  verifiers + coordinator).
- `bash scripts/worktree-reap.sh` at pre-flight: 7/16 active, no
  removals; two LOUD notes about uncommitted changes in OTHER
  owners' trees (build-ladder-leg4-baseline, sim-flipsocial-b) — not
  touched, reap correctly refused to auto-remove them.
- Loop B's tree sim-flipsocial-b heartbeat was ~51 min stale at
  closeout (21:39:02Z vs 22:30Z) with B's lock (20:30:01Z) still live
  — noted, not acted on: B's lock belongs to B's loop, and its next
  run does its own stale-lock recovery if dead.
- The tenddrive release took ~16s (backgrounded exec); the midshape
  release was immediate. No registry-lock contention blocked this
  run.

## Footer

- Branch sim-tenddrive-a commits (base 6680d7924 → rebased tip
  8c9f76562): prereg 3047f3258, proof d30fc5827, sweep/judge
  59b63c36, sweep fix 5ddcc0de, EMPTY accident commit f72edc66,
  baseline corpus 26bd05f8c, fix 91092b28, candidate corpus
  2450185b4, sense replay 9d2b185f, panels c00dbad20, revert
  9da541de6, evidence tip 5a29c88b2 (rebased as 8c9f76562).
- Branch sim-midshape-a commits (base 6680d7924 → rebased tip
  3e31ca84b): prereg + proof + instrument 7e25ca671, instruments
  addda1e37, evidence + corpora + panels 33ada84fc, footer fix-up
  11d06893c (rebased as 3e31ca84b).
- Coordinator evidence: this file (commit below). Both arm branches
  merged --ff-only (HEAD verified moved in a separate command each
  time); both worktrees released done-merged and removed; both
  branches deleted. Main tree clean at closeout. No push, no version
  bump by this run. Report: merged locally, pending ship.
