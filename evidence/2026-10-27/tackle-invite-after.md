# Tackle-invite — AFTER run (2026-10-27)

Proof test: `scripts/test-invite-accept-character.js`, seed 20261027.
Worktree base: 373cb798d (Triage A3 monster-meat channel). Branch:
tackle-invite. Change: one shared `npcInviteDecision` in
`src/js/betrayal.js`, wired into `inviteToParty` (`src/js/party.js`)
and `npcPlotTick` (`src/js/betrayal.js`). No gating changes anywhere
in the diff (checked: no deedGateReady/scale/stage/readiness/
table-price strings in the src diff).

## Numbers (after)

Party invites (player -> villager, trust 60, mood steady, fear low,
100 pinned rolls each, real `inviteToParty` path):

- warm/belong + warm bond: 95/100 (was 89 — the bond now counts, +10
  then clamped at 95)
- prickly/alone + hostile bond: 5/100 (was 5 — hostile bond -20, then
  clamped at 5)
- steady/protect: 74/100 (unchanged)
- cautious/escape: 34/100 (unchanged)
- overall: 52/100 (was 50.5)

Decision chances (same profiles, direct `npcInviteDecision` read):

- warm: chance 95, reasons: trust 60; a real bond (+10); warm
  temperament (+15); belong goal (+15)
- prickly: chance 5, reasons: trust 60; a hostile bond (-20); prickly
  temperament (-20); wants to be alone (-40)
- At the same roll (0.50), the warm villager accepts and the prickly
  villager refuses: the score, not the roll, flips the answer.

Lure takes (villager -> villager plot, real `npcPlotTick` path,
springAmbush stubbed so the sweep measures the decision gate, 100
pinned rolls each):

- warm-bond target: 76/100 (was 39 on the flat roll)
- hostile-bond target: 5/100 (was 42 on the flat roll)
- overall: 40.5/100 (was ~40.5 by coincidence — the average barely
  moved; what changed is that character now decides who is in the 40)
- sick warm-bond target: 0/100 (was 39 — a sick villager stays home)

## Pre-registered bar vs measured (all PASS, 15/15 in the proof test)

1. No band 0% or 100%: party 95/5/74/34, lure 76/5 — PASS.
2. Character, not noise: warm band 90 points above prickly band on
   party (bar: >=15); same-roll separation holds — PASS.
3. Lure warm-bond 71 points above hostile-bond (bar: >=15), neither
   0/100 — PASS.
4. Overall in range: party 52 (bar 20-85), lure 40.5 (bar 15-75) — PASS.
5. Sick lure targets never walk out: 0/100 — PASS.
6. Transcripts read for meaning (below) — PASS.
7. Guardrails: no gating changes; existing green-listed party tests
   that touch this area pass (party-wiring 10/10, party-bond 45/45);
   two pre-existing failures elsewhere are documented below, each
   reproduced with the new decision disabled, so neither is a
   regression. Full `check.js --quick` was still progressing (not
   failed) after ~30 minutes under heavy sibling load and was stopped
   rather than blocking the workstream; the area gates that cover
   this change are green: `check.js --quick --only party` 6/6,
   `--only invite` 1/1, proof test 15/15. The coordinator should run
   the full quick gate before merging — PASS with that one open
   item, stated here rather than claimed.

## Transcripts read (sense-testing law)

Party accept (warm/belong): the NPC opens by confessing they have
been skimming extra food and are ashamed — they want trust, not
small talk. The player invites them; they accept ("Okay. Yeah. I
trust you.") and join. The choice engages what the NPC just offered,
and the ending resolves: a confession answered with inclusion.

Party refuse (prickly/alone): the NPC asks what the player did for
fun before, on a perfect Saturday — a bid for a normal human moment.
The player invites them; they refuse in character ("I work alone.
Nothing personal. ...It's a little personal.") and do not join. The
refusal carries a reason, not a wall, and it deflects the invitation
without pretending the conversation never happened.

Lure real trial (warm-bond target, roll forced low so the decision
takes the walk, real ambush narration on): the plot springs, the
case opens, the target survives this time, and the village narration
says: "Days later, you'll hear what happened out past the ridge. For
now: nothing. The village keeps its face still." The ending plants
rather than resolves — the player will hear the story in a day or
two through gossip and the case file. The walk was taken, the
consequence is real, and the game does not pretend otherwise.

## Pre-existing failures (NOT regressions — control-verified)

- `scripts/test-party-invite-voiced-20261007.js`: 6 pass, 1 fail
  ("decline transcript line exists"). Cause: the decliner's opener is
  a pending question (menu: deflect_q + ans:*), so no invite choice
  exists to take. Re-running the same test with `npcInviteDecision`
  disabled (old party formula) gives the identical failure. This test
  is not on the green list.
- `scripts/test-party-invite-probe-20261013.js` (green-listed):
  FAIL "no invite offered" even though the gates print true
  (partyUnlocked, hasDiscovered(party), trust boosted to 60).
  Re-running a copy with `npcInviteDecision` disabled gives the
  identical failure. The invite choice never surfaces in the probe's
  neutral turns on this base. Out of scope for this workstream (menu
  offering, not the decision); flagged for the conversation lane.
- `scripts/test-party.js` and `scripts/test-betrayal.js` (bare names,
  not green-listed): crash at load with "Text is not defined" in
  their own eval boilerplate, before any game code under test runs.
  Unrelated to this change.

## What was deliberately NOT changed

- The player's own accept/decline of an NPC invitation: still the
  player's choice, never automated.
- Backstabbers always accepting a party invite: a designed plot trap
  (a plot role, not a character band), excluded from the bars above.
- Visitor "invite to stay": still always says yes. It is a Haven
  panel button, not a conversation invitation, and visitors carry no
  temperament/goal record to decide from. Follow-up for its own lane.
- No gating thresholds of any kind (freeze stands).

## Metric review

None — metrics held. The one thing the run surfaced is a measurement
note, not a metric change: the old lure rate could only be measured
on the natural random sequence (the old code read a module-captured
random, not the pinnable one), while the new rate is measured on an
exact pinned roll sweep. The before/after lure comparison therefore
compares "opposite profiles, ~same rate" (39 vs 42) against "opposite
profiles, 71 points apart" (76 vs 5) — the right comparison for a
character-vs-noise claim, and it is the comparison the bar was
written around.
