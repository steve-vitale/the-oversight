# fix-all ITEM C — succession conversation seam verification (2026-10-28)

Worktree: `fixall-succseam`, base master@3a5c49f49 (includes tackle-succession
20010c093 as an ancestor). No push, no version bump, no live check — ship loop
owns those. This note is the evidence file for the item; it is filled in after
the runs below, not before.

## The seam (as documented, not as paraphrased)

- r55 (evidence/2026-10-28/journey-succession-r55.md, finding 6 + people check):
  follow-up requests dissolve into "Sorry, lost my train of thought" (Mai's
  invitation, Andres's "tell me about them"). Documented for gap-social /
  tackle-all, not fixed in r55.
- r56 (evidence/2026-10-28/journey-succession-r56.md, people check, 26134 d+14
  Leonor): the driver's invitation dissolves the same way, "reproduced a
  third run running" (r54, r55, r56). Transcript picks:
  `[betrayal:accept] [dlg:comfort] [alive:event:mourning] [dlg:invite] [goon]
  [silence]`, and the transcript shows YOU "Want to come with us?" (dlg:invite
  label), YOU "Want to come with me?" (invite_party handler's player line),
  then NPC "...Sorry, lost my train of thought." — instead of the party
  invite's accept/decline line.
- The seam is therefore NOT a succession-machinery break (bonds, mantle,
  inheritance all held in r56). It is a conversation-emission break on the
  invite path: `dlg:invite` (convo-beats.js) delegates to `invite_party`
  (convo-dialogue.js), whose handler (conversation.js) returns the real
  accept/decline line from `inviteToParty` (party.js) — but the base
  `convoTurn` tail emits that line through `sayLine` with NO inviteBeat /
  diegeticAct exemption, so the run-wide no-repeat ledger (48-entry window)
  can block it and substitute the first dry line, which is exactly
  "...Sorry, lost my train of thought." (convoDeflectionLines()[0]).
  Invitation beats spoken through `sayLine` with `inviteBeat:true` ARE exempt
  (conversation.js, journey landing r7 comment) — the invite_party outcome
  is not, even though accepting actually pushes the villager into the party.
  That exemption gap is the root-cause hypothesis under test.

## Pre-registration (written BEFORE any run)

- Primary metric: in a scripted two-invitee run, the SECOND invitee's
  transcript NPC line for the invite_party turn.
- GO threshold for CLOSED: the second line is verbatim the party decision
  line (the same decline line the first invitee spoke), i.e. the request's
  outcome is spoken, not dissolved.
- OPEN: the second line is a deflection line ("...Sorry, lost my train of
  thought." or another convoDeflectionLines entry) while the decision itself
  was taken (decline stubbed, same inputs as the first invitee).
- Horizon: one scripted sitting per mode — no multi-day sim needed, because
  the mechanism is the per-run ledger window, not a day regime. Seeds: one
  harness seed (4242, same as the succession inherit proof) per mode; the
  comparison is control vs seeded within the same build, not across seeds.
- Modes (each a separate node process; never two harnesses in one process):
  - control: invite ONE villager only → decision line must speak verbatim.
  - seeded: invite villager A (decline), then villager B (same decline inputs)
    → B's line is the metric.
  - succession: bearer <redacted> via Game.playerDeath('the hunt') to the highest-trust
    heir, then as the new bearer invite A then B → B's line is the metric
    (proves the seam survives the mantle on current master).
- Policies: no bot policy; scripted picks only (startConvo + convoTurn
  invite_party, the handler dlg:invite delegates to). npcInviteDecision is
  stubbed to decline for both invitees so the decision line is deterministic
  (trust 45, temperament steady, goal belong → "Not right now. I've got my
  own things to handle."). Stubbing the decision is instrument, not a game
  change: it removes RNG from the line selection so the ledger is the only
  variable between control and seeded.
- Perception law: the fix, if any, must not feed any roster/list into partner
  selection. The invite path here is player-chosen (the player picks the
  villager and the invite); no partner-selection change is in scope.
- Gating freeze: no gate, deed-bar, standing or wave change is in scope.

## Results (filled after runs)

Base master@3a5c49f49 (20010c093 is an ancestor; its file list is
evidence/2026-10-27/* + scripts/test-succession-inherit-feel.js +
src/js/villager-build.js — NO conversation code, so it cannot have closed a
conversation-emission seam; the runs below confirm that).

Proof script: scripts/test-fixall-succseam.js (seed 4242, separate process
per mode). Pre-fix, on master:

- control: B invite line = "Not right now. I've got my own things to
  handle." — CONTROL-OK (decision line spoken verbatim, ledger empty).
- seeded: A line = the same decline; B line = "...Sorry, lost my train of
  thought." — VERDICT: OPEN. Exact reproduction of the r56 Leonor shape.
- succession: bearer gen_3uowwtn -> gen_b36nqjb (heir match=true); A line =
  the decline; B line = "...Sorry, lost my train of thought." — VERDICT:
  OPEN. The seam survives the mantle on current master; 20010c093 did NOT
  close it.

VERDICT ON MASTER: OPEN. Root cause (code-read + reproduction agree): the
base convoTurn tail emits the invite_party outcome through sayLine with no
diegeticAct exemption, so the 48-entry run-wide ledger blocks a decision
line another villager recently spoke and substitutes dry line #1.

FIX (minimal, targeted, one emission site): src/js/conversation.js,
convoTurn tail — pass `diegeticAct: choiceId === 'invite_party'` to the
sayLine call, with a comment citing the r7 invitation-beat and r25
betrayal-outcome exemptions. Scoped to invite_party only. No partner
selection touched (player-chosen invite; perception law untouched), no
gate/deed/standing/wave change (gating freeze untouched), no teach or
tell-me handler touched.

Post-fix, same script, same seed:

- control: decision line verbatim — CONTROL-OK.
- seeded: A line = decline, B line = decline, A==B true — CLOSED.
- succession: new bearer, A line = decline, B line = decline — CLOSED.
- accept (added mode): run ledger pre-seeded with all four accept lines,
  B invited with an accept stub → B line = "...Fine. This had better be
  worth it.", inParty=true — ACCEPT-CLOSED (decision spoken AND joined;
  pre-fix every accept line was ledger-blocked, so this is the case where
  the join used to happen silently behind a lost-train line).

Regression: node --check src/js/conversation.js SYNTAX-OK;
`node scripts/check.js --only succession
--cacheDirectory=/tmp/jest-cache-fixall-succseam`: 11 passed, 0 failed in
38s (same 11/0 as r55/r56 succession-only checks).
`node scripts/check.js --quick` (same cache dir): 284 passed, 6 failed in
700s, and again 284 passed, 6 failed in 1092s on a second full-output run
(full log: goal hidden_files fixall-succseam-quick2.log). The 6 failing
scripts, EACH re-run individually on the PRE-FIX conversation.js (fix
temporarily reverted in the private worktree, then restored byte-identical:
same 16-insertion/1-deletion diff, proof re-run green):
1. scripts/godpath/test-measurement-proof-update.js — throws "Proof source
   inputs are not current" on base too (retained-proof staleness).
2. scripts/godpath/test-measurement-workflow.js — "retained neutrality
   proof covers the current Game/controller/harness inputs" fails on base.
3. scripts/godpath/test-mobile-combat-cadence.js — fails on base (2
   assertions, incl. the Continue-wrap one).
4. scripts/godpath/test-occupation-panels.js — "real CLI workflow
   completed" fails on base.
5. scripts/godpath/test-phone-frame-proof.js — 3 failures on base,
   including retained browser-input staleness (conversation.js is already
   listed as a boot input whose retained proof predates this change).
6. scripts/test-establishment-r20-fixes-20261020.js — racks-full voice
   gate "next day voices once more: expected 2, got 1" fails on base.
Conclusion: ZERO new quick failures attributable to this change — the
with-fix 284/6 is exactly the base 6-script failure set. The retained-proof
staleness items (1, 2, 5) are the repo's proof-freshness mechanism flagging
already-stale proofs, not behavior regressions; refreshing them is ship-loop
/ proof-owner work, not this item's scope, and is NOT done here (never
hand-edit proof hashes).

## Metric review (§14)

- The metric measures exactly the r56 transcript shape (invite turn's NPC
  line), not party outcomes in general: decline has no state effect, so its
  "drop" is purely the unspoken refusal reason; accept DOES change state
  (party push), which the added accept mode covers separately.
- The script stubs npcInviteDecision to a fixed decline/accept. That is
  instrument, not a game change: it removes RNG from line selection so the
  ledger is the only variable between control and seeded. The decision
  function itself (tackle-invite) is not under test here.
- NOT measured / NOT claimed: the r54 teach drop and Andres's "tell me
  about them" drop share the ledger mechanism but ride different handlers;
  they are separate seams and are NOT fixed by this change. The r56
  transcript's goon/silence lines after the drop are later turns, not part
  of the metric.
- Sense-read: post-fix, B's repeated decline reads as the same answer from
  another person ("Not right now. I've got my own things to handle."),
  which is honest — the same rationale the r7 invitation exemption uses.
  Parroting risk is bounded: the exemption applies only to the invite
  outcome turn, not to openers, topics, or wants.
- Steve-call: none for the fix itself (exemption class already established
  by r7/r25 precedent). One question is genuinely his, flagged in the
  coordinator report, not decided here: whether the same diegetic-act
  exemption should extend to teach/tell-me outcomes — left untouched
  pending his call, since that widens the exemption beyond this item.

