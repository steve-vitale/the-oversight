# Tackle-invite — pre-registration (written BEFORE measuring, 2026-10-27)

Workstream: invitations sometimes taken. Steve ruled 2026-10-27: betrayal
invitations in conversation specifically, and all invitations generally,
should sometimes be taken — villagers must make choices like real people
according to their character, not never and not always.

## What this workstream changes, in plain words

When a villager is the one being invited, the answer must come from who
that villager is — their temperament, how much they trust the inviter, the
relationship between the two people, what the invitation asks of them, and
what that villager is trying to do with their life (their goal). It must
not be a flat coin flip, and it must not be "this kind of person always
says yes" or "always says no".

Two invitation channels are in scope, both inside conversation play:

1. **Player invites a villager to the party** (conversation choices
   `invite_party` / `dlg:invite` -> `inviteToParty` in `src/js/party.js`).
   This already weighs temperament, trust, goal and mood, but it does NOT
   weigh the relationship between the two people (the bond they have built
   during the run) and it does NOT weigh the stakes of joining (how big
   and safe the party already is, how afraid the villager is). This work
   adds those two inputs through one shared decision function.

2. **A villager lures another villager out on a walk** (betrayal plots
   whose target is an NPC, `npcPlotTick` in `src/js/betrayal.js`). Today
   the target walks out on a flat 45% roll, no matter who they are, who
   invited them, or what is at stake. This work replaces that flat roll
   with the same shared character-driven decision. A sick villager stays
   home instead of walking out — the same body veto the player's own
   accepted invitations already have (`acceptInvite`'s sick outcome).

Out of scope, deliberately, and NOT changed here:

- **The player's own accept/decline of an NPC invitation**
  (`betrayal:accept` / `betrayal:decline`). That choice belongs to the
  player. Automating it would take the player's choice away, which is the
  opposite of what Steve ruled.
- **Backstabbers always accepting a party invite.** That is a designed
  trap, not a character band: a plotter wants to be close to you, so they
  say yes. It is a plot role, not a temperament or goal group, and it is
  excluded from the bands below. Changing it would need a separate ruling.
- **Visitor "invite to stay"** (Haven panel button, not conversation).
  It always says yes today. It is a real always-yes channel, but it is
  outside "invitations in conversation", and visitors carry no
  temperament/goal record to decide from yet. Flagged as follow-up, not
  silently fixed or silently claimed.
- **Any gating change.** Gating freeze (Steve 2026-10-27 16:53) stands:
  no deedGateReady, scale, stage, readiness-bar, or table-price changes.

## The shared decision (what the code will do)

One function, `npcInviteDecision(invitee, inviter, {kind, stakes})`, in
`src/js/betrayal.js` next to the other invitation code, returning
`{chance, accept, inputs, reasons}` where `chance` is clamped to 5–95
(never 0, never 100) and `accept` is one roll against that chance. Inputs,
all read from the live villager record, never invented:

- temperament (`npcTemper`)
- trust (party: the villager's trust in the player; lure: the pair
  relationship, see below)
- relationship (counted once, never twice: the bond via `bondGet` when
  the player is the inviter — trust already covers the rest there — and
  `pairAffinity` when a villager invites a villager, since affinity
  already folds the bond into itself)
- stakes (party: current party size and the villager's fear; lure: the
  villager's fear of walking out, and sickness as a veto)
- goal (`npcGoal`) and mood (`npcMood`)

## Pre-registered bar (BINDING — docs/MEASUREMENT.md §14)

Measured by `scripts/test-invite-accept-character.js` (before/after).
A miss is NO-GO, never re-scored. "Band" below means a temperament group
among ordinary (non-backstabber, non-plot-role) invitees.

1. **No band is always or never.** For every temperament band with at
   least 20 decisions, acceptance sits strictly between 0% and 100%.
2. **Character explains the variation, not noise.** At a fixed roll
   (the same roll value for everybody), a warm/bold villager who trusts
   the inviter and shares a bond accepts while a prickly/withdrawn
   villager who barely trusts the inviter refuses — the score, not the
   roll, flips the answer. And across the sweep, the warm/bold band
   accepts at least 15 percentage points more often than the
   prickly/withdrawn band.
3. **Lure takes vary by relationship.** For NPC-to-NPC lures, targets
   with a warm bond/affinity to the inviter take the walk at least 15
   percentage points more often than targets with a hostile bond/
   affinity, and neither group is 0% or 100%.
4. **Overall range stays human.** Party acceptance overall lands between
   20% and 85%; lure takes overall land between 15% and 75% (the old
   flat lure rate was 45% — the average may move, but it must not
   collapse to always/never).
5. **Sick lure targets stay home.** A sick NPC target never takes a
   lure walk (0 takes in the sick band — a body veto, not a character
   band, so it does not break bar 1).
6. **Transcripts still read like people.** At least three full
   conversation transcripts are read for meaning (the NPC wants
   something, the choice engages or deflects it, the ending resolves,
   plants, or owes something): one party accept, one party refuse, and
   one lure outcome. A bare "X declined." with no reason fails.
7. **Guardrails.** No gating file or threshold changes in the diff
   (checked by grepping the diff for deedGateReady/scale/stage/
   readiness/table-price changes: none). The existing party-invite
   voiced test and betrayal test still pass.

## Metric review

None yet — metrics held at pre-registration time. This section will be
filled after the run, even if it only says "none — metrics held".
