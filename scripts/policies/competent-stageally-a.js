// competent-stageally-a — companion-staging + rally (arm sim-stageally-a,
// run fleshout-loop-b-20261106T0615Z, axis scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it isolates the STAGING half of the second-killer
// blank (does a fighting party that travels with the scholar — rallied on
// entry — produce a second wave-4 killer while the first still lives?),
// paired on identical seeds with the competent-verbatim baseline.
//
// WHAT IT CHANGES (all of it, nothing hidden):
//   - fight hook: the bankkiller rally verbatim (scripts/policies/
//     competent-rally-bankkiller-b.js): on the scholar's FIRST turn of a
//     TB fight containing a LIVE wave-4+ monster AND >= 1 living ally
//     fighter, call Game.tbPlayerRally() once, then fight normally.
//   - daily hook: AFTER competent.daily, ONE party-invite attempt per day
//     when the staging gate is open (party unlocked AND raw standing >= 75
//     OR wave 4 unlocked), the scholar is at haven, and the party has
//     fewer than 2 members. The ask is made IN CONVERSATION (talkTo +
//     invite_party / dlg:invite when offered — the fiction-honest door:
//     "You ask people. Like a person."), never via the bare verb. The
//     scholar holds a real conversation to reach the ask: they answer the
//     villager's question first, continue the villager's story, or change
//     the subject — the invite is taken the turn it is offered. They
//     never accept or decline another invitation on the scholar's behalf
//     (a lure is the player's call, not the policy's), and never mime
//     (no shared language means the villager is ineligible in the first
//     place).
//   - pending hook: RECORD-ONLY. When a pending encounter exists, record
//     {day, monster, wave, party size, party ids}. It never delays,
//     declines, or moves the scholar: the pending panel offers exactly one
//     choice for a wanderer ("Face it"), so waiting at the door is
//     inexpressible policy-side and this arm does not pretend otherwise.
//     The harness faces the fight immediately after.
//   - Every other hook (upkeep, contest, ...) is the base competent
//     policy's object, unchanged. No env gates are set by requiring this
//     file.
//
// STAGING GATE (frozen in the prereg — do not tune): party unlocked AND
// (raw village standing >= 75 OR unlockedWave() >= 4). Invites take days
// (one attempt/day, acceptance ~50-70%), so formation starts in the
// run-up to wave 4, not after the door opens.
// TARGET (frozen): 2 party members. Cap is 3 at unlock (4 day 14, 5 day
// 30); the target leaves room for a third.
//
// CANDIDATES (frozen): alive, on the roster, not the scholar, not already
// in the party, not away, no assignment (do not pull the water/wood
// worker), on the scholar's node (face to face), raw trust >= 20 (the
// System floor; the menu applies its own effective-trust/mood gate on
// top), AND shares a language with the scholar (Game.commLevel(vid).level
// !== 'none' — the engine's own test; a villager the scholar cannot talk
// to cannot be asked to join — the conversation would be mime only).
// Ranked deterministically — no RNG draws: armed first (an equipped
// melee/ranged/weapon on the person record — the scholar can see who
// carries a weapon), then trust desc, then villager id asc. A refusal is
// a refusal: the same person is not re-asked within 7 days (people need
// time to change their mind); the next-best candidate is asked instead.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No fight delay, no flee, no retreat, no disengage at the pending
//     door (see above — no engine verb exists for it).
//   - No hold-for-finish discipline (this is NOT splitkill): the scholar
//     strikes normally after rallying. Whoever lands the killing blow
//     lands it.
//   - Villager field fights: the engine drives them, not the player.
//     This policy cannot touch a field fight's flee line. Field fights
//     are the untouched control channel in this arm.
//   - No ability press: rally is a human leadership verb, not a System
//     ability. Base.fight's own ability presses are unchanged.
//   - No roster, no waveKillLog, no snapshot: the staging decision reads
//     ONLY what the scholar can know — their own party, trust in people
//     they know, who is on their node, village standing (the player-
//     visible standing line), the wave unlock (System-announced). The
//     policy NEVER reads state.waveKillLog — pinned by a proof test with
//     a poisoned log.
//
// COUNTERS: per-run ctx counters (sa*) plus module-level stats
// (resetStageallyStats / stageallyStats) so the driver can capture
// per-seed numbers without reaching into harness ctx. The bankkiller
// module stats (rally fires) are the rally half's record and are
// captured alongside by the driver.
'use strict';
const base = require('./competent');
const competent = base.competent;
const RALLY = require('./competent-rally-bankkiller-b');
const { chooseConversationChoice } = require('./conversation-pages');

const STAGE_TARGET = 2;
const STAGE_STANDING_FLOOR = 75;
const REASK_DAYS = 7;

const STATS = { gateOpenDays: 0, stageDays: 0, invites: 0, accepted: 0,
  declined: 0, notOffered: 0, errors: 0, pendingW4: 0, pendingW4Staged: 0,
  answered: 0, events: [], pendingEvents: [] };
function resetStageallyStats() {
  STATS.gateOpenDays = 0; STATS.stageDays = 0; STATS.invites = 0;
  STATS.accepted = 0; STATS.declined = 0; STATS.notOffered = 0;
  STATS.errors = 0; STATS.pendingW4 = 0; STATS.pendingW4Staged = 0;
  STATS.answered = 0;
  STATS.events = []; STATS.pendingEvents = [];
}
function stageallyStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function partyMembers(Game) {
  try { const p = Game.partyMembers ? Game.partyMembers() : []; return Array.isArray(p) ? p : []; } catch (e) { return []; }
}
function inParty(Game, vid) {
  try { if (typeof Game.inParty === 'function') return !!Game.inParty(vid); } catch (e) {}
  return partyMembers(Game).indexOf(vid) !== -1;
}
function partyUnlocked(Game) {
  try { return !!(Game.partyUnlocked && Game.partyUnlocked()); } catch (e) { return false; }
}
function rawStanding(Game) {
  try { const st = Game.villageStanding ? Game.villageStanding() : null; return st ? (st.total | 0) : null; } catch (e) { return null; }
}
function unlockedWave(Game) {
  try { return Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) { return 1; }
}
function gateOpen(Game) {
  if (!partyUnlocked(Game)) return false;
  const raw = rawStanding(Game);
  if (raw != null && raw >= STAGE_STANDING_FLOOR) return true;
  return unlockedWave(Game) >= 4;
}

// An equipped weapon on the person record — the scholar can see who
// carries a weapon. Pure read; a missing/empty equipped is unarmed.
function hasWeapon(Game, vid) {
  try {
    const vp = (typeof Game.getPerson === 'function') ? Game.getPerson(vid)
      : (typeof Game.vpOf === 'function' ? Game.vpOf(vid) : null);
    if (!vp || !vp.equipped) return false;
    const eq = vp.equipped;
    return !!(eq.melee || eq.weapon || eq.ranged);
  } catch (e) { return false; }
}

function trustOf(Game, vid) {
  try { return (((Game.state || {}).village || {}).trust || {})[vid] || 10; } catch (e) { return 10; }
}

// Eligible invite candidates, ranked deterministically: armed first,
// then trust desc, then villager id asc. Reads only scholar-knowable
// state (party, trust, node, away, assignments).
function candidates(Game, ctx) {
  const out = [];
  try {
    const v = (Game.state || {}).village || {};
    const me = Game.villagerId;
    const roster = v.roster || [];
    const away = v.away || {};
    const asg = v.assignments || {};
    const px = Game.map ? Game.map.px : null, py = Game.map ? Game.map.py : null;
    const declined = (ctx && ctx._saDeclined) || {};
    const day = dayOf(Game);
    for (const vid of roster) {
      if (!vid || vid === me) continue;
      if (inParty(Game, vid)) continue;
      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) continue; } catch (e) {}
      if (away[vid]) continue;
      if (asg[vid]) continue;
      // Face to face: on the scholar's node. npcNode unavailable -> fall
      // back to the away check above (an away villager is never face to
      // face; a present one is assumed on-node).
      let onNode = true;
      try {
        if (typeof Game.npcNode === 'function') {
          const n = Game.npcNode(vid);
          onNode = !!n && n.nx === px && n.ny === py;
        }
      } catch (e) { onNode = true; }
      if (!onNode) continue;
      if (trustOf(Game, vid) < 20) continue;
      // Shares a language: the engine's own commLevel test. A villager
      // the scholar cannot talk to cannot be asked — the conversation
      // would be mime only (nonverbal thread, nv: menu). Absent method
      // (unit fakes) -> include, so the check never blocks on a stub.
      try {
        if (typeof Game.commLevel === 'function') {
          const comm = Game.commLevel(vid);
          if (comm && comm.level === 'none') continue;
        }
      } catch (e) {}
      const lastDecline = declined[vid];
      if (lastDecline != null && (day - lastDecline) < REASK_DAYS) continue;
      out.push({ vid: vid, armed: hasWeapon(Game, vid), trust: trustOf(Game, vid) });
    }
  } catch (e) {}
  out.sort(function (a, b) {
    if (a.armed !== b.armed) return a.armed ? -1 : 1;
    if (a.trust !== b.trust) return b.trust - a.trust;
    return a.vid < b.vid ? -1 : (a.vid > b.vid ? 1 : 0);
  });
  return out;
}

// The ask, in conversation. Up to 5 turns: each turn the scholar asks
// when the invite is offered (invite_party / dlg:invite — either door
// leads to the same engine verb); otherwise the scholar holds a real
// conversation to reach the ask — answers the villager's question first
// (ans: / react: / gq:, preferring a real answer over "I'd rather not
// say"; it is rude to ignore a question, and the menu only opens up
// after it is answered), continues the villager's story ('goon'), or
// once navigates to the subject menu ('dlg:subject' — the subject menu
// preserves the invite). Never accepts or declines another invitation
// for the scholar (betrayal:* is never picked — a lure is the player's
// call, not the policy's), never mimes (nv:*), never deflects, never
// walks out mid-ask. endConvo('left') always runs. The turn/answer
// counts are left on ctx._saLastAsk for the caller's event record.
// Returns 'accepted' | 'declined' | 'not-offered' | 'error'.
function askToJoin(Game, ctx, vid) {
  let outcome = 'not-offered';
  let turns = 0, answered = 0;
  try {
    if (typeof Game.talkTo !== 'function') { outcome = 'error'; return outcome; }
    Game.talkTo(vid);
    let navigated = false;
    try {
      for (let turn = 0; turn < 5; turn++) {
        let c = null;
        try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        const pick = chooseConversationChoice(Game, vid, function (choices) {
          const list = choices || [];
          const inv = list.find(function (ch) { return ch && ch.id === 'invite_party'; });
          if (inv) return inv;
          const dinv = list.find(function (ch) { return ch && ch.id === 'dlg:invite'; });
          if (dinv) return dinv;
          // Answer their question first — the menu only opens up after.
          const ans = list.find(function (ch) { return ch && /^(ans:|react:|gq:)/.test(ch.id) && !/honest_pass$/.test(ch.id); })
            || list.find(function (ch) { return ch && /^(ans:|react:|gq:)/.test(ch.id); });
          if (ans) return ans;
          const goon = list.find(function (ch) { return ch && ch.id === 'goon'; });
          if (goon) return goon;
          if (!navigated) {
            const subj = list.find(function (ch) { return ch && ch.id === 'dlg:subject'; });
            if (subj) return subj;
          }
          return null;
        }, ctx);
        if (!pick) break;
        turns += 1;
        if (pick.id === 'dlg:subject') navigated = true;
        const wasInvite = (pick.id === 'invite_party' || pick.id === 'dlg:invite');
        const wasAnswer = /^(ans:|react:|gq:)/.test(pick.id);
        let res = null;
        try { res = Game.convoTurn(vid, pick.id); } catch (e) { outcome = 'error'; break; }
        if (wasAnswer) { answered += 1; STATS.answered += 1; }
        if (wasInvite) {
          outcome = inParty(Game, vid) ? 'accepted' : 'declined';
          if (outcome === 'declined' && ctx) {
            ctx._saDeclined = ctx._saDeclined || {};
            ctx._saDeclined[vid] = dayOf(Game);
          }
          break;
        }
        if (res && res.ended) break;
      }
    } finally {
      try { if (Game.endConvo) Game.endConvo(vid, 'left'); } catch (e) {}
    }
  } catch (e) { outcome = 'error'; }
  if (ctx) ctx._saLastAsk = { turns: turns, answered: answered };
  return outcome;
}

// One staging attempt per day, after base daily, at haven, gate open,
// party below target. Records the attempt in module stats + ctx.
function stageParty(Game, ctx) {
  try {
    if (!gateOpen(Game)) return;
    STATS.gateOpenDays += 1;
    ctx.saGateOpenDays = (ctx.saGateOpenDays || 0) + 1;
    const members = partyMembers(Game);
    if (members.length >= STAGE_TARGET) return;
    let atHaven = false;
    try { atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
    if (!atHaven) return;
    const day = dayOf(Game);
    if (ctx._saAttemptDay === day) return; // one attempt per day
    ctx._saAttemptDay = day;
    const cands = candidates(Game, ctx);
    if (!cands.length) {
      STATS.events.push({ day: day, gate: true, partyBefore: members.length, candidate: null, outcome: 'no-candidate' });
      return;
    }
    const cand = cands[0];
    STATS.stageDays += 1;
    ctx.saStageDays = (ctx.saStageDays || 0) + 1;
    STATS.invites += 1;
    ctx.saInvites = (ctx.saInvites || 0) + 1;
    let outcome = 'error';
    try { outcome = askToJoin(Game, ctx, cand.vid); } catch (e) { outcome = 'error'; }
    if (outcome === 'accepted') { STATS.accepted += 1; ctx.saAccepted = (ctx.saAccepted || 0) + 1; }
    else if (outcome === 'declined') { STATS.declined += 1; ctx.saDeclinedN = (ctx.saDeclinedN || 0) + 1; }
    else if (outcome === 'not-offered') { STATS.notOffered += 1; ctx.saNotOffered = (ctx.saNotOffered || 0) + 1; }
    else { STATS.errors += 1; ctx.saErrors = (ctx.saErrors || 0) + 1; }
    STATS.events.push({ day: day, gate: true, partyBefore: members.length,
      candidate: cand.vid, armed: cand.armed, trust: cand.trust, outcome: outcome,
      turns: (ctx._saLastAsk && ctx._saLastAsk.turns) || 0,
      answered: (ctx._saLastAsk && ctx._saLastAsk.answered) || 0 });
  } catch (e) { STATS.errors += 1; }
}

const stagedPolicy = Object.assign({}, RALLY.rallyPolicy, {
  id: 'competent-stageally-a',
  desc: 'competent + companion-staging (party invites at haven) + round-1 rally in wave-4+ TB fights with allies present (policy-side probe only)',
  daily(Game, ctx) {
    try { competent.daily(Game, ctx); } catch (e) {}
    stageParty(Game, ctx);
  },
  // Record-only: staged-or-not at the pending door. Never delays the
  // fight — the harness faces it immediately after this returns.
  pending(Game, ctx) {
    try {
      const mid = Game.pendingMonsterId;
      if (Game.pendingEncounter && mid) {
        const w = RALLY.waveOfMonster(Game, mid);
        if (w != null && w >= 4) {
          const members = partyMembers(Game);
          STATS.pendingW4 += 1;
          if (members.length) STATS.pendingW4Staged += 1;
          STATS.pendingEvents.push({ day: dayOf(Game), mid: mid, wave: w,
            partySize: members.length, party: members.slice() });
        }
      }
    } catch (e) {}
    return false;
  },
});

module.exports = { stagedPolicy: stagedPolicy,
  resetStageallyStats: resetStageallyStats, stageallyStats: stageallyStats,
  stageParty: stageParty, candidates: candidates, askToJoin: askToJoin,
  gateOpen: gateOpen, hasWeapon: hasWeapon, STAGE_TARGET: STAGE_TARGET,
  STAGE_STANDING_FLOOR: STAGE_STANDING_FLOOR, REASK_DAYS: REASK_DAYS };
