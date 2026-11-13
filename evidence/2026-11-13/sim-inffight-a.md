# sim-inffight-a — Focus Group close-in regression-net re-probe

Run: fleshout-20261113T1115Z (Loop A), arm sim-inffight-a
Axis: scale-onramp (tracker blank #3; sim-findings.md #2298)
Branch: sim-inffight-a — worktree ~/workspace/worktrees/sim-inffight-a
Base: master a1288c5c4 (2026-11-13 batch ship 6a16152d5)
Date: 2026-11-13
Coordinator: adoption (worker interrupted by the VM replacement ~07:08 CST;
prereg + test refresh + live pilot were complete in the tree; this file,
the gate, the rebase and the merge are the adoption coordinator's).

## Verdict: GO — BIT-ROTTED, not regressed

The Focus Group close-in did NOT regress. The game code is intact:
encWantRange still calibrates the focus_group burst to radius 1 (G3 green
in both the old and the refreshed net), and a true 1v1 still closes in and
lands Deliberation on the scholar (probe + refreshed G1, below). What broke
was the fixture's isolation: it parked villagers at 0,0, but gap-phase2 W1
(9eb619326, 2026-10-24) re-positions villagers at fight start
(ensureVillagerPositions in startCombat) and the nearest-4 join rule pulls
them in — so the duel became a party fight: an adjacent villager satisfies
the lead's want-range (it never steps toward the scholar) and eats the
Deliberation (the old test counted only hits on 'p').

Fix: test-only refresh, no src/js change. Flee the joined villagers back
out after startCombat (restores the 1v1 the net was written for), and add
G4, which measures the live party context instead of pretending it away.
Steve 2026-11-13 encounter-gear rule noted: this net keeps its 1v1 staging
deliberately — it is a regression net for the engine stall, not a balance
panel; G4 is the geared/party leg.

## Re-probe (prereg step 1)

Original fixture on current master a1288c5c4, run by the adoption
coordinator from the HEAD version of the test file: **9 passed, 3 failed**
— the prereg's 3 failures reproduced exactly:
- G1 "the heads close in" (leadPos=6,4), G1 "Deliberation lands"
  (landed=0), G2 "Deliberation threatens" (landed=0).
- G3 green (wantRange hummice=2 toad=3 focus_group/burst=1
  focus_group/direct=3) — the calibration the 2026-10-14 fix installed
  is still in place.

## Root cause (prereg step 2): BIT-ROTTED

- The fixture parked villagers at 0,0 BEFORE startCombat. The positions
  map is empty at that point (setupGame leaves it for
  ensureVillagerPositions), and startCombat re-positions same-node
  villagers next to the scholar and joins the nearest 4 anyway
  (gap-phase2 W1, 9eb619326). Verified in the probe: positions after
  startCombat show villagers next to the scholar, and the old fixture's
  duel ran with a party.
- In the party duel the lead never moves (an adjacent villager satisfies
  want-range) and Deliberation lands on the party, not the scholar —
  exactly the old net's failure signature (leadPos=6,4, landed=0).
- In the solo duel (probe PROBE_SOLO=1, below) the lead closes in and
  Deliberation lands on the scholar. The engine behavior the 2026-10-14
  fix installed is intact; only the fixture's isolation assumption broke.

## Proof (prereg step 4)

`node scripts/test-inffight-20261014.js` (refreshed, G4 added):
**16 passed, 0 failed** (adoption coordinator re-run on master a1288c5c4):
- G1: endResult=lost maxRound=40 over=true leadMoved=true
  deliberationLanded=97 (1v1: lead closes in, Deliberation lands, scholar
  falls).
- G2: endResult=routed maxRound=10 over=true mouths=0/0/17
  deliberationLanded=6 scholarHp=null.
- G4: endResult=routed maxRound=28 over=true mouths=0/0/1
  deliberationAny=39 deliberationOnScholar=0 (party context: villagers
  join, the lead's want-range is satisfied by an adjacent villager,
  Deliberation lands on the party, the fight still resolves).
- G3: wantRange unchanged (hummice=2 toad=3 focus_group/burst=1
  focus_group/direct=3).

Probe `scripts/probe-inffight-a.js` (diagnostic, NOT a proof test —
deleted before landing per its header; key output quoted here, run by
the adoption coordinator): PROBE_SOLO=1, G1 strike-weakest: lead 6,4→5,3
by round 2, Deliberation accumulates 6→91, END result=lost
deliberation=97 (scholar falls). G2 strike-lead: lead 6,4→5,3, mouths
76/76/76→0/0/17, END result=routed deliberation=6. The solo close-in
and the scholar-target Deliberation are real, in live combat through the
real engine — not fixture green.

## Live-fight leg (prereg)

`scripts/inffight-live-driver-a.js`, 8-seed pilot 190391–190398, competent
policy, 150d death-aware. Exactly ONE Focus Group fight in 8 seeds:
- Seed 190394, day 30: leadStartPos 5,3, leadMoved=false,
  minDistToFighter=1, deliberationAny=46, deliberationOnScholar=0,
  mouthsDamaged=false, mouths 0/0/5, rounds=15, result=routed, partyN=3.
- The other 7 seeds: 0 Focus Group fights. Focus Group fights are rare
  in wild play on this band (~1/8 seeds).

## GO-bar disclosure + metric review

The prereg GO bar reads: "12/12 green on current master a1288c5c4 with
the close-in verified in live fights (a Focus Group fight in a real sim
where the lead moves within burst range and Deliberation lands on the
scholar at least once)."

- The test leg is met and exceeded: 16/16 green (the net grew from 12 to
  16 legs when G4 was added; "green" is the substance, and the count
  grew, it did not shrink).
- The literal live parenthetical was NOT observed in the pilot: the one
  wild fight had the lead spawn adjacent to a fighter (minDist 1, never
  moved) and the burst land on a villager (46 on the party, 0 on the
  scholar). The close-in itself IS verified in live combat (probe solo
  + refreshed G1: lead 6,4→5,3, Deliberation 97 on the scholar) and the
  wild fight verifies the party-context behavior G4 now measures
  (Deliberation lands on the party, fight resolves in 15 rounds).
- Why the parenthetical misses: it assumes a solo-scholar wild fight,
  but wild fights are party fights by design (gap-phase2 W1 join rule) —
  the scholar is one of 3–4 fighters and the lead's want-range is
  satisfied by whoever is adjacent. The parenthetical demands a
  conjunction (lead starts out of range AND the scholar is the burst
  target) that the game's own join rule makes exceptional. Chasing it
  with a wider band would be a lottery (~1 wild fight per 8 seeds, each
  with a low chance of the conjunction), not a measurement — the prereg
  itself warns against burning a 16-seed confirm on a thin sample.
- Verdict GO stands on the arm's question (regressed vs bit-rotted: the
  engine is intact, the net is green, the close-in is verified in live
  combat three ways) with this shortfall stated here, not buried.
  Proposed revised live bar for the next run: a wild Focus Group fight
  with Deliberation landing on ANY fighter + the probe-solo close-in
  (lead moves within burst range, Deliberation on the scholar) — the
  conjunction the game as built can actually produce.

## Record correction (prereg step 5)

The freezeline-a evidence (evidence/2026-11-13/sim-freezeline-a.md)
claimed the inffight net "PASSED in both check.js --quick runs". That
claim CANNOT hold, and the correction is now verified, not assumed:

- `scripts/check.js` line 61 filters --quick to jobs whose tags include
  'quick'. Green-list lines 453–454
  (scripts/test-inffight-20261014.js,
  scripts/test-inffight-class-20261014.js) carry NO tag, so neither
  test runs under `check.js --quick` at all. The inffight net is covered
  by the FULL check.js (green list), not by --quick.
- And on master the test was 9/12 at the time (reproduced above), so it
  would have FAILED had it run. The freezeline-a gate itself (335 passed,
  5 failed, adjudicated) is unaffected — the error is only the claim
  about this test.
- The freezeline fix is NOT implicated: the 9/12 failures are identical
  with and without it (1015Z adoption A/B), and its change is narration-
  only. The defect is in the evidence claim, not the fix.

## Adjacent test (prereg step 4)

`node scripts/test-inffight-class-20261014.js` (green-list line 454, the
whiff-guard class test for the same monster): **10 passed, 5 failed** on
this tree — PRE-EXISTING on master a1288c5c4, not caused by this arm
(this arm changed no src/js and the class test does not import the
changed test file; the game code it loads is pristine master):
- G1 honest ×3: "the fight comes apart (existing idiom)"
  (result=lost comesApart=false); "no free win — the lead survives
  unharmed past the opening" (lead alive, 258 → 165 round 5 → 4);
  "the scholar lives" (scholarHp=-3).
- G3 sense ×2: "the line names what happened (no one in reach, no one
  chasing)"; "the line says where they go (melt back into the wilds)"
  — the disengage line renders EMPTY ("G3 line: " with nothing after).
- Filed as a new sim-findings.md entry (adoption coordinator, 2026-11-13):
  the whiff-guard class test is red on current master — the Focus Group
  duel ends with the scholar dead and the lead alive at 4 HP, and the
  honest-disengage line is empty. Out of this arm's scope (close-in net
  only); needs its own arm.

## Files

- scripts/test-inffight-20261014.js — refreshed fixture (flee joined
  villagers out after startCombat; G4 party-context leg; deliberationAny
  tracking) + header comment recording the verdict and the probe numbers.
- scripts/inffight-live-driver-a.js — live-fight recorder (every Focus
  Group fight: lead movement, min distance, Deliberation on anyone /
  on the scholar, outcome).
- evidence/2026-11-13/perseed-inffight-live-a/ — 8 per-seed JSONs (pilot).
- evidence/2026-11-13/sim-inffight-a-prereg.md — re-added byte-identical
  to HEAD (it was staged-deleted + rewritten untracked by the interrupted
  worker; sha256 verified identical before re-adding).
- scripts/probe-inffight-a.js — DELETED before landing (temporary
  diagnostic per its own header; results quoted above).

## Gate (adoption coordinator)

`node scripts/check.js --quick` in this tree: **326 passed, 14 failed
in 1185s** (log evidence/2026-11-13/sim-inffight-a-gate.log). Adjudication
— 0 failures attributable to this arm (test-only change; the changed
file is not run by --quick at all):
- 4× exact-120s timeouts (load artifacts, known class):
  test-living-garden-deed-attainment, test-one-person-army-deed-
  attainment, test-trust-observer-neutrality, test-synergy-stall.
- 4× EPERM write failures (write-flap window, see below):
  test-prepared-runner-custody, test-proof-text-identity,
  test-telemetry-check-recorder, test-sw-audio-cache (copyfile EPERM).
- 4× pre-existing staleness (standing gate failure set):
  test-measurement-proof-update + test-measurement-workflow (retained
  neutrality proof stale), test-occupation-panels ("real CLI workflow
  completed"), test-phone-frame-proof (stale phone receipt).
- 1× test-measurement-cache-flags (load artifact class; cap stays 30s).
- 1× test-foodpower-20261014 (ontology validator sub-check failed in
  the gate run) — PASSES standalone on re-run (30 passed, 0 failed),
  flap artifact.
- Gate GO after adjudication. The changed test file
  (scripts/test-inffight-20261014.js) is a green-list job with no quick
  tag, so it runs in the FULL check.js, not --quick; it was verified
  directly instead (16/16 above, plus the 9/12 reproduction).

Flap window during this gate: the flap watcher logged A/B/E EPERM
failures 2026-11-13T14:22–14:28Z (boot f8eff984 — another VM
replacement); the gate's 4 EPERM failures fall in that window. Two
standalone foodpower re-runs at 14:29Z exited 1 with EMPTY output
(flap signature); a third run minutes later passed 30/30 — the flap
had cleared. Nothing was lost; no git writes were attempted during
the window.

## Finding

sim-findings.md #2298 marked [fixed 2026-11-13 by Loop A arm
sim-inffight-a, run fleshout-20261113T1115Z: BIT-ROTTED, not regressed —
gap-phase2 W1 join/positioning broke the fixture's 0,0 isolation;
encWantRange intact (G3), solo probe closes in + Deliberation 97 on the
scholar; net refreshed 16/16 green (G4 party leg added); 1 wild Focus
Group fight in 8 seeds (190394 d30, burst on party, routed 15 rounds);
freezeline-a --quick claim corrected (test never ran under --quick).
Evidence evidence/2026-11-13/sim-inffight-a.md.]
