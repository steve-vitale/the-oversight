# Loop B 2130Z — food-economy round (coordinator closeout by main session; run timed out before coordinator landing)

Run: fleshout-loop-b-20261103T2130Z, axis food-economy (second
non-converged axis; Loop A live on scale-onramp throughout, NOT
touched; win lanes NOT touched; gap/journey lanes NOT touched).
Claim written before any sims (hidden_files/lever-claims/
fleshout-loop-b-20261103T2130Z.json); lock created at run start.
Arms: sim-streakfree-cost-b (tracker blank 1: (v*) prereg with
base-drift handling + cost-leg solution) and sim-hurttraveler-b
(tracker blank 2, sim-findings #1720: hurt-traveler turn-home
reason/line). No gate/price/demand changes anywhere in this run.

## Timeout recovery (main-session closeout, 2026-11-03 ~17:35 CST)

The coordinator hit its execution timeout before closeout with
landing cleanup backgrounded and unconfirmed. Recovery verified,
not assumed:
- Hurt-traveler arm: LANDED. Master tip is 42f0bd49f and carries
  all four arm commits (diag 602ac8d9f, prereg 9f17d6926, GO
  7cc2d77af, coordinator test-gap fix 42f0bd49f). Its branch is
  deleted and its worktree removed — the backgrounded cleanup DID
  complete. No live processes for either arm at recovery; the
  streakfree-cost heartbeat was 19+ min stale (23:14:27Z at ~17:33
  CST check); no fresh corpus writes after the timeout. The run
  is dead; this closeout does not race a live worker.
- Streakfree-cost arm: NOT merged (correct — see below). Branch
  sim-streakfree-cost-b exists with exactly its three commits
  (c14c9902a, 9818ac98a, 271a46089); worktree clean at tip.
  Branch + worktree PRESERVED (same standing practice as
  sim-streakfree-b from 1930Z); the reaper keeps unmerged
  branches, so nothing is lost by leaving it.
- Main tree clean at closeout except the landed commits; HEAD
  42f0bd49f verified after all steps below.

## Arm 1 — sim-streakfree-cost-b: INSUFFICIENT-DATA (instrument only, NOT landed)

Prereg c14c9902a (committed BEFORE any screen or judged leg) +
tools 9818ac98a (proof 24/24 synthetic; reused proofs re-run green
on current base: streakfree 22/22, gatediseng 21/21,
gatediseng-confirm 11/11) + evidence 271a46089. MEASUREMENT ONLY:
zero src/js changes, zero policy-default flips, zero edits to any
existing script or policy. New files only (*-streakfree-cost-b.* +
screen-tmp-streakfree-cost-b/). Screen AND tracer BOTH ran on the
judging base per the prereg's base-drift handling — no salvaged
screen, no inherited corpus in any judged denominator.

Judged against the prereg bars: Stage 1 screen GO (12/200
collapsing, bar >= 4). Stage 2 count gates would pass
(12 still-collapsing, 16 traced survivors). Tracer verification
FAILED: legs 83373 (rows 19 vs daysAlive 20) and 83377 (rows 25
vs daysAlive 26) fail rows == daysAlive on the tracer leg AND on
the single allowed re-run each. Per the prereg, a tracer
verification failure unrepairable by re-run voids judging — hence
INSUFFICIENT-DATA, not a game finding. No survivor drift (16/16),
no still-collapsing exclusions, cross-check 0 mismatches on 26/26
verified legs, determinism 3/3 byte-identical, tracer-vs-screen
28/28 byte-identical (substrate finding, carried below).

NOT merged because there is nothing to land: the arm judged an
instrument question and the instrument did not verify. Proofs were
not re-run on a rebased tip because no rebase is needed for an
unmerged arm. Next streakfree work must answer the tracer
question first (is daysAlive miscounted by the tracer, or does
the engine end a leg a day early on these two shapes?) before any
cost-leg judging can be trusted.

## Arm 2 — sim-hurttraveler-b: GO, LANDED (narration-only)

Evidence evidence/2026-11-03/sim-hurttraveler-b.md (read in full
before judging). Diag instrument + 8-seed corpus (competent,
96101-96108, 100d death-aware cap): 23 hurt-traveler lines, all
the full-meal template, all take == want (1,088-1,618 kcal —
generous meals, NOT a ration story, confirming the closed
away-ration finding). Mechanism (code-read, confirmed on every
case): departures ARE health-gated (objHealGate), returns are NOT
health-checked (return branch fires on partsAway >= away.duration
only), and every sampled villager left fit and was hurt WHILE away
(22 by monster, 1 by sickness) with the trip clock unexpired — so
the meal branch still counts them away and feeds them from the
pack. No turn-home trigger exists anywhere on the return path, so
the brief's behavior option (ii) was unavailable; narration (i)
was the honest fix.

Fix: awayReasonSentence helper in game.js; the awayHungerVoice
line now states the villager's true, state-derived reason for
staying out, replacing the filler tail "far from the haven's
shelves" (false on 9 cases whose clock had run out, including 3
already standing on the haven node). No amount, draw, outcome, or
RNG stream changes. Pilot 8/8 TRUE, trajectory identity 8/8.
Coordinator test-gap fix on rebase (leg B handles the LEAVE
walk-out sentence; base drift made seed 96101 yield a LEAVE hurt
line; game code untouched by that commit). Landed as 7cc2d77af +
42f0bd49f on master.

DOCUMENTED, NOT FIXED (behavior change, needs its own proof):
expedHurt (villager-agency.js) "cuts the expedition short" by
capping st.exped.duration, but nothing ever writes that cap back
to the trip — a future behavior arm, not this narration fix.

## EPERM flap + findings restore (this run, ~21:37Z)

Live sim-findings.md was truncated to 0 bytes by the container
EPERM flap during this run's in-place findings edit — the standing
copy-temp-verify-rename rule from the 2026-11-02 restore was
violated by that edit. Rebuilt by copy-then-rename from the
verified backup sim-findings.md.bak-20261031T1830Z (1651 lines,
sha256 6179b4dd9e7e11f55f268b4167236a92120646c78eec31f1009c65b9f8844fa4)
plus the 2026-11-02 restore appendix items plus three re-applied
items. Gap window 2026-11-02T18:48Z–2026-11-03T21:37Z beyond those
three is NOT reconstructed (see the restore banner + gap line in
the file). RULE RESTATED: never open('w') the live sim-findings.md
or convergence-tracker.md — append-only or copy-temp-verify-rename.

## Telemetry deviation check — LOUD lines EXPLAINED, baseline NOT rolled forward

Command: telemetry-check.js --baseline hidden_files/
telemetry-baselines/scale-wall.json --current
'evidence/2026-11-03/perseed-hurttraveler-b/*.json' --metrics
national,table,wins,exiled. LOUD: national baseline 12 -> current
0, table 16 -> 0, wins 16 -> 0 (n=9 files). Verdict: EXPLAINED,
not a game deviation. The current files are the hurt-traveler DIAG
corpus (competent, 96101-96108, 100d death-aware cap), not a scale
panel — sample seed died day 78 village-lost at arc 3; a 100d
narration corpus cannot show national/table/wins. And the only
landed change in this run is narration-only with trajectory
identity 8/8, so no scale outcome could have moved because of it;
the streakfree arm is unmerged. Comparing a 100d diag corpus to
the scale-wall baseline is a corpus mismatch, same class as the
social-baseline legacy-keys case. Baseline NOT rolled forward.

## Findings backlog

- #1720 (travel/health, HURT TRAVELERS KEEP EATING AWAY INSTEAD
  OF GOING HOME, appended by 1930Z): FIXED by this run's
  hurttraveler arm — the voice line now states the state-derived
  reason for staying out, which is the "or a line saying why they
  stay out" half of the item as written. The turn-home behavior
  half stays open by design (no trigger exists; expedHurt cap
  write-back documented above as a future behavior arm).
- Firing-evening narration (obstacle-line spam, 1930Z streakfree
  arm): still OPEN, carried forward.
- Streakfree tracer verification (83373/83377 rows-vs-daysAlive):
  new instrument question, carried forward — must be answered
  before any (v*) cost-leg judging.

## Tracker + closeout

Food-economy stays CONVERGING (not converged): the away-ration
formula story is closed (1930Z); the hurt-traveler narration gap
is closed (this run); the (v*) cost leg is inconclusive again,
this time on instrument verification rather than survivor drift.
Claim file and lock file deleted at closeout end. Run note
appended to ~/memory/2026-11-03.md. No goal-timeline file exists
in hidden_files; the record is this evidence file + the tracker
review below + the memory note.
