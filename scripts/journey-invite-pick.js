'use strict';
// journey-invite-pick.js — competent-player invitation-answer rule
// (r118, Q2 measurement fix for the r117 reclassification).
//
// The finding (r117): the game DOES offer accept/decline on an
// invitation-owned menu ([accept, decline, leave, silence]), proof-tested
// 17/17 — but the sampling driver refused both answers (r109 hygiene:
// betrayal:* never picked) and never picks leave, so it always picked
// [silence] and every NPC invitation went unanswered on the panel. A real
// player answers. The measurement fix is a driver rule, not a game change.
//
// The rule: on an invitation-owned menu, accept iff the villager's trust
// is >= TRUST_ACCEPT_AT (40), else decline. Trust is the live village
// trust map — the same number the game's own trust-gated choices read —
// never hidden plot state. The default for an unrecorded trust is 10
// (the game's own unset-trust default, per the driver), which declines:
// a stranger's invitation gets a polite no; a trusted villager's gets a
// yes. Either way the invitation is ANSWERED — silence is the miss the
// rule exists to remove.
//
// Pure functions, no Game writes, no RNG: the same menu + trust always
// picks the same answer. Required by the r118 journey driver and by the
// r118 proof test (one implementation, tested in both places).
const TRUST_ACCEPT_AT = 40;
const TRUST_DEFAULT = 10;

function isInvitationMenu(choices) {
  if (!Array.isArray(choices) || !choices.length) return false;
  let hasAccept = false, hasDecline = false;
  for (const ch of choices) {
    if (!ch) continue;
    if (ch.id === 'betrayal:accept') hasAccept = true;
    if (ch.id === 'betrayal:decline') hasDecline = true;
  }
  return hasAccept && hasDecline;
}

function pickInviteAnswer(choices, trust) {
  const t = (trust === undefined || trust === null) ? TRUST_DEFAULT : trust;
  const want = t >= TRUST_ACCEPT_AT ? 'betrayal:accept' : 'betrayal:decline';
  if (Array.isArray(choices)) {
    const hit = choices.find(ch => ch && ch.id === want);
    if (hit) return hit.id;
    // Defensive: an invitation-owned menu always offers both, but never
    // return an id that is not on the menu — fall back to the other answer.
    const other = choices.find(ch => ch && (ch.id === 'betrayal:accept' || ch.id === 'betrayal:decline'));
    if (other) return other.id;
  }
  return want;
}

module.exports = { isInvitationMenu, pickInviteAnswer, TRUST_ACCEPT_AT, TRUST_DEFAULT };
