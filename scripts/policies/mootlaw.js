// policies/mootlaw.js — moot/brokerage-playing policy for journey-endgame r15 (2026-10-16).
//
// The r14 leg question: the leadfeast policy never plays the moot-exposure
// lane (witness needs exposed >= 3 via exposeBribery/case resolutions) and
// never builds brokerage/food-sharing (indispensable needs FULL seat +
// foodShared > 0 + brokerage+might+foodShared >= 10). This policy plays both
// lanes the way a COMPETENT player would — not an exploiter:
//   - when the village's cases are known, it talks to people and plays the
//     REAL case verbs: betrayal:investigate:<id> (follow the food) ->
//     betrayal:expose:<id> (at the moot, publicly) -> betrayal:moot:<id>
//     is deliberately NOT played early: forcing the moot short-circuits the
//     investigation window the natural npcMootTick clock (case day +3) gives.
//   - when a trial awaits the player's vote it votes guilty if real evidence
//     surfaced (found/exposed bribes) or the belief ledger leans guilty — a
//     conviction is what sentences weregild (brokerage +2) or exile (exposed
//     +1); it never bribes and never takes a bribe (the mootlaw stays clean).
//   - when accused it plays the dossier honestly (investigate, expose, speak)
//     instead of ignoring the case — a competent player defends themselves.
//   - it takes 'teach' conversation choices when offered — teaching is how
//     the food truth gets shared (ledgerAdd('foodShared')).
//
// Built on leadfeast (FEASTSCALE_R13=1 lineage) so the run reaches the table
// on r13/r14's terms; the moot lane is additive — one conversation a day plus
// the case verbs. All verbs are real engine verbs; nothing staged, nothing
// forced. Deterministic given the run's RNG (villager picks are seeded via
// the harness's Math.random; see sim-harness.js).
'use strict';
const { leadfeast } = require('./feastscale');

function law(Game, ctx) { return (ctx.mootlaw = ctx.mootlaw || { talks: 0, investigated: 0, exposed: 0, votedGuilty: 0, votedAcquit: 0, taught: 0, dossier: 0, casesSeen: 0 }); }

// cases the player can act on this day: open/dormant and known (or involved)
function liveCases(Game) {
  let cases = [];
  try {
    const bs = Game.betrayalState ? Game.betrayalState() : {};
    cases = (bs.cases || []).filter(c =>
      (c.status === 'open' || c.status === 'dormant') &&
      (c.knownToPlayer || c.playerRole !== 'bystander'));
  } catch (e) {}
  return cases;
}

// the accused's own defense — dossier verbs, honest play
function accusedDossier(Game, ctx, c) {
  const st = law(Game, ctx);
  try {
    if (!Game.caseDossierActions || !Game.caseDossierDo) return;
    const ids = (Game.caseDossierActions(c.id) || []).map(a => a && a.id).filter(Boolean);
    // investigate first (finds the bribes), then expose (needs foundBribes)
    if (ids.includes('investigate')) { try { Game.caseDossierDo(c.id, 'investigate'); st.investigated++; } catch (e) {} }
    if (ids.includes('expose')) { try { Game.caseDossierDo(c.id, 'expose'); st.exposed++; } catch (e) {} }
    if (ids.includes('speak')) { try { Game.caseDossierDo(c.id, 'speak'); st.dossier++; } catch (e) {} }
  } catch (e) {}
}

// one conversation a day that works the moot lane: prefer a case-involved
// villager, fall back to anyone living. Plays case verbs, the trial vote when
// pending, then 'teach' — then leaves like a person.
function mootConvo(Game, ctx) {
  const st = law(Game, ctx);
  const cases = liveCases(Game);
  if (!cases.length) return;
  st.casesSeen += cases.length;
  let today = 0;
  try { today = (Game.state.scholar || {}).day || 0; } catch (e) {}
  let vid = null;
  try {
    const vv = Game.state.village || {};
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    const alive = roster.filter(id => { try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; } });
    if (!alive.length) return;
    // prefer someone involved in the freshest case (they have the most to say)
    const c = cases[cases.length - 1];
    const involved = [];
    try {
      for (const id of ((c.accused || []).concat([c.accuser, c.target]).filter(Boolean))) {
        if (alive.includes(id) && id !== Game.villagerId && !involved.includes(id)) involved.push(id);
      }
    } catch (e) {}
    const pick = involved.length ? involved : alive;
    const prng = global.__policyRandom || Math.random;
    vid = pick[Math.floor(prng() * pick.length)];
  } catch (e) { return; }
  if (!vid) return;
  try {
    if (!Game.talkTo) return;
    Game.talkTo(vid);
  } catch (e) { return; }
  st.talks++;
  try {
    const choices = () => { try { return Game.convoChoices(vid) || []; } catch (e) { return []; } };
    // 1. investigation / exposure for each live case (case-level choices —
    //    offered to ANY conversation partner)
    for (const c of cases) {
      if (c.status !== 'open') continue;
      let ch = choices();
      const inv = ch.find(x => x && x.id === 'betrayal:investigate:' + c.id);
      if (inv && Game.convoTurn) { try { Game.convoTurn(vid, inv.id); st.investigated++; } catch (e) {} }
      ch = choices();
      const ex = ch.find(x => x && x.id === 'betrayal:expose:' + c.id);
      if (ex && Game.convoTurn) { try { Game.convoTurn(vid, ex.id); st.exposed++; } catch (e) {} }
      // 2. the trial vote, when the moot is waiting on the player
      ch = choices();
      if (c.trial && c.trial.awaitingPlayerVote) {
        // VOTE TIMING (r15): bribery only exists while the trial pends
        // (simBriberyTick plants during the trial, R()<0.35/day), and the
        // plant happens in endDay — AFTER the policy's daily. Sequence for a
        // moot convened in endDay D (trial.day=D): endDay D+1 plants (maybe);
        // the policy's D+2 daily is the first turn that can dig it up. The
        // fiction gives two days ("the moot doesn't wait forever" — the
        // count is taken without you at endDay D+2); a competent juror
        // investigates while they can and votes on the second day, after
        // the last dig. Voting during D+2's daily beats trialVoteTick.
        const trialDay = (c.trial.day != null ? c.trial.day : today);
        if (today >= trialDay + 2) {
          const real = (c.foundBribes || []).length > 0 || (c.exposedBribes || []).length > 0;
          let guiltyLean = real;
          try { guiltyLean = guiltyLean || (Game.avgBelief ? Game.avgBelief(c) < 0 : false); } catch (e) {}
          const vote = ch.find(x => x && x.id === (guiltyLean ? 'betrayal:vote_guilty:' + c.id : 'betrayal:vote_acquit:' + c.id));
          if (vote && Game.convoTurn) {
            try { Game.convoTurn(vid, vote.id); if (guiltyLean) st.votedGuilty++; else st.votedAcquit++; } catch (e) {}
          }
        } else {
          st.voteDeferred = (st.voteDeferred || 0) + 1;
        }
      }
    }
    // 3. teach — the food truth spreads one conversation at a time
    const ch = choices();
    const teach = ch.find(x => x && x.id === 'teach');
    if (teach && Game.convoTurn) { try { Game.convoTurn(vid, teach.id); st.taught++; } catch (e) {} }
  } catch (e) {}
  try { if (Game.endConvo) Game.endConvo(vid, 'left'); } catch (e) {}
}

function mootDaily(Game, ctx) {
  try {
    for (const c of liveCases(Game)) {
      if (c.playerRole === 'accused') accusedDossier(Game, ctx, c);
    }
  } catch (e) {}
  try { mootConvo(Game, ctx); } catch (e) {}
}

const mootlaw = Object.assign({}, leadfeast, {
  id: 'mootlaw',
  desc: 'leadfeast + the moot-exposure lane (investigate/expose/vote honestly), dossier defense when accused, teaching in conversation — r15 witness/indispensable reachability question',
  daily(Game, ctx) {
    if (leadfeast.daily) leadfeast.daily(Game, ctx);
    mootDaily(Game, ctx);
  },
});

module.exports = { mootlaw };
