// competent-linkdrive-b — the LINK-FORMING DRIVE (arm sim-linkdrive-b,
// run fleshout-loop-b-20261107T1049Z, axis scale-onramp / winnability chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file. This is a measurement instrument, not a
// play recommendation: it composes onto the FROZEN staged substrate
// (scripts/policies/competent-stageally-a.js, unmodified — the staged
// party/rallied scholar that actually kills wave-4) and adds the ask the
// regionalstep DIAG found missing: propose on courtship-ready villages
// and answer the link raises villagers already bring, then hold the
// links through the 21-day seasoning to the Regional Dawn.
//
// THE PROPOSE VERBS STAY PLAYER-ONLY per Steve's 2026-10-26 ruling.
// This policy calls them the way the staged party invites call the
// invite verb: as a measurement instrument standing in for the player,
// never as a game-code change. Never a roster/list-fed decision: direct
// proposals read only villages the SCHOLAR knows (knowsVillage — the
// scholar's own lore); raise answers read only live pending raises
// from named villagers, answered in a real conversation with the raiser.
//
// WHAT IT DOES (frozen in the prereg — do not tune), once per day each,
// in order, after staged daily:
//   1. Answer a pending counter: answerCounter('accept') — their terms,
//      the link forms (a counter-accepted link is BELONG-shaped: Haven
//      joins as subordinate). A pending counter blocks further proposals,
//      so it is answered first, the day it stages.
//   2. Answer a pending first accord: answerAccord('gift') — 2,000 kcal
//      → +10 trust (partial pantry pays partial, proportional trust —
//      the engine's rule).
//   3. Answer pending link raises, IN CONVERSATION: for each pending
//      raise (oldest first, at most one answer per day), the scholar
//      talks to the raiser (talkTo + up to 5 real turns via
//      chooseConversationChoice — answer their question first, continue
//      their story, navigate to the subject — the stageally askToJoin
//      shape) and picks link:accept ONLY when the raised village is
//      courtship-ready (deterministic as-subordinate judge ≥ 55 — the
//      score can never decline; worst case a played counter, which step
//      1 accepts the next day). The raise itself is the perception
//      event: the villager walked up with the idea and the village they
//      personally know; the scholar learns it from them in the
//      conversation (the engine's own acceptLinkRaise tells the lore,
//      then proposes). NEVER the bare acceptLinkRaise verb, NEVER
//      link:decline — a decline is the player's call, not the policy's.
//      A raise for a not-yet-ready village is left pending (it expires;
//      the villager may re-raise after the 14-day cooldown). A raise
//      whose raiser is dead, exiled, or off-roster is skipped.
//   4. Propose directly, as-subordinate first: once per day, when no
//      counter/accord/national beat is pending, pantry > 12,000 kcal,
//      and fewer than 3 active links total — the best courtship-ready
//      KNOWN village (deterministic judge, no RNG draw — the recorder's
//      detJudge rule) gets proposeLink(vid, { asSubordinate: true,
//      tributeKcalPerWeek: 4000 }). Courtship-ready = deterministic
//      as-subordinate score ≥ 55 (score ≥ 45 even at −10 RNG:
//      counter-or-better guaranteed, never a cold decline). A decline
//      costs −5 opinion and banks courtshipDeclined, so a declined
//      village is not re-proposed within 7 days. Cap: 3 ACTIVE links
//      (any direction: LEAD + BELONG).
//   5. Tend LEAD links below the seasoned bar: weekly, for each active
//      Haven-primary link with age < 30 days OR trust < 40, when pantry
//      > 20,000 kcal: tendLink(link.id) (1,500 kcal → +8 trust).
//      Seasoned links (30+ days AND trust 40+) are NOT tended
//      (tendseason-b predicate).
//   6. Hold BELONG links with tribute + honored demands: for each active
//      Haven-subordinate link — if this week's tribute is not current
//      and the pantry can cover the owed tribute, payTribute(link.id)
//      in full (+3 trust, arrears 0); if link.pendingDemand,
//      answerDemand(link.id, true) — honor it. tendLink REFUSES BELONG
//      links in the engine ("tending your overlord is not this verb");
//      this is the holding verb that exists for them.
//   7. NEVER answer pendingNational / pendingGlobal — endgame beats,
//      not the ask; the staged baseline does not answer them either, so
//      baseline parity holds. A staged beat is recorded, not answered.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No proposeCovenant / proposeTrade (peer links are a separate
//     corpus), no raidVillage (the conquest road is not this arm),
//     no bond proposals for the scholar.
//   - No sweeten on counters (1,500 kcal gamble) — 'accept' is the
//     sure link. No tend on seasoned links. No tribute paid when the
//     pantry cannot cover the full owed week (partial weeks are left
//     to the weekly tick's true-shortfall accounting).
//   - No villageStandingTotal() / unlockedWave() calls in the policy.
//   - The only new RNG draws in the armed leg are the engine's own
//     (judgeLink inside proposeLink, conversation turns) — the lever,
//     not the instrument. Candidate ranking is deterministic (score
//     desc, village id asc); no Math.random in this file.
//
// COUNTERS: per-run ctx counters (ld*) plus module-level stats
// (resetLinkdriveStats / linkdriveStats) so the driver can capture
// per-seed numbers without reaching into harness ctx.
'use strict';
const STAGED = require('./competent-stageally-a');
const { chooseConversationChoice } = require('./conversation-pages');

const PROPOSE_PANTRY = 12000;
const TEND_PANTRY = 20000;
const LINK_CAP = 3;
const REASK_DAYS = 7;
const COURT_READY = 55;
const PROPOSE_TRIBUTE = 4000;

const STATS = { proposeCalls: 0, proposeAccepted: 0, proposeCounter: 0,
  proposeDeclined: 0, proposeShut: 0, proposeBlockedPantry: 0,
  proposeBlockedCap: 0, proposeBlockedPending: 0, proposeNoCandidate: 0,
  proposeNotReady: 0, counterAnswers: 0, accordAnswers: 0,
  raisesSeen: 0, raisesAnswered: 0, raisesLinked: 0, raisesCountered: 0,
  raisesSkippedNotReady: 0, raisesSkippedNoRaiser: 0, raisesSkippedNoVillage: 0,
  raisesTalkFailed: 0, raisesNotOffered: 0, raiseTurns: 0, raiseAnsweredTurns: 0,
  tends: 0, tendsBlockedPantry: 0, tendsPaidKcal: 0,
  tributePays: 0, tributePaidKcal: 0, tributeBlockedPantry: 0,
  demandAnswers: 0, demandKinds: {},
  nationalPendingDays: 0, globalPendingDays: 0, errors: 0, events: [] };
function resetLinkdriveStats() {
  STATS.proposeCalls = 0; STATS.proposeAccepted = 0; STATS.proposeCounter = 0;
  STATS.proposeDeclined = 0; STATS.proposeShut = 0; STATS.proposeBlockedPantry = 0;
  STATS.proposeBlockedCap = 0; STATS.proposeBlockedPending = 0; STATS.proposeNoCandidate = 0;
  STATS.proposeNotReady = 0; STATS.counterAnswers = 0; STATS.accordAnswers = 0;
  STATS.raisesSeen = 0; STATS.raisesAnswered = 0; STATS.raisesLinked = 0; STATS.raisesCountered = 0;
  STATS.raisesSkippedNotReady = 0; STATS.raisesSkippedNoRaiser = 0; STATS.raisesSkippedNoVillage = 0;
  STATS.raisesTalkFailed = 0; STATS.raisesNotOffered = 0; STATS.raiseTurns = 0; STATS.raiseAnsweredTurns = 0;
  STATS.tends = 0; STATS.tendsBlockedPantry = 0; STATS.tendsPaidKcal = 0;
  STATS.tributePays = 0; STATS.tributePaidKcal = 0; STATS.tributeBlockedPantry = 0;
  STATS.demandAnswers = 0; STATS.demandKinds = {};
  STATS.nationalPendingDays = 0; STATS.globalPendingDays = 0; STATS.errors = 0;
  STATS.events = [];
}
function linkdriveStats() { return JSON.parse(JSON.stringify(STATS)); }

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function weekOf(Game) { try { return Game._week ? (Game._week() | 0) : 0; } catch (e) { return 0; } }

// detJudge(Game, ov): deterministic judgeLink components for one village,
// WITHOUT calling judgeLink (it draws RNG). Same rule as the regionalstep
// recorder (scripts/regionalstep-instrument-20261107.js): base 38 + rep
// standing/2 (max 20) + opinion/2 + ally +15 + strength term (as-primary
// only) / as-subordinate +10 + generosity +8 (opinion ≥ 5, tribute ≥ 3,000).
// Tribute 4,000 kcal/week is the offer, so the generosity term applies.
function detJudge(Game, ov) {
  try {
    var opinion = (ov && (ov.opinion | 0)) || 0;
    var repS = 0;
    try { var rep = (typeof Game.representative === 'function') ? Game.representative() : null; if (rep) repS = (rep.standing | 0) || 0; } catch (e) {}
    var repTerm = Math.min(20, repS / 2);
    var allied = 0;
    try { if (typeof Game.isAllied === 'function' && Game.isAllied('haven', ov.id)) allied = 15; } catch (e) {}
    var ourS = 0, theirS = 0;
    try { ourS = (typeof Game.regionalStanding === 'function') ? (Game.regionalStanding() | 0) : 0; } catch (e) {}
    try { theirS = (typeof Game.villageStandingOf === 'function') ? (Game.villageStandingOf(ov.id) | 0) : 0; } catch (e) {}
    var strength = (ourS > theirS) ? Math.min(15, (ourS - theirS) / 5) : -10;
    var prim = 38 + repTerm + opinion / 2 + allied + strength;
    var sub = 38 + repTerm + opinion / 2 + allied + 10 + (opinion >= 5 ? 8 : 0);
    return { prim: Math.round(prim * 10) / 10, sub: Math.round(sub * 10) / 10 };
  } catch (e) { return null; }
}

function activeLinks(Game) {
  try {
    var links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    return links.filter(function (l) { return l && l.status === 'active'; });
  } catch (e) { return []; }
}
function isSeasoned(link, day) {
  try { return ((day - (link.day | 0)) >= 30) && ((link.trust | 0) >= 40); } catch (e) { return false; }
}
function otherVillage(Game, vid) {
  try {
    var ovs = (Game.state || {}).otherVillages || [];
    for (var i = 0; i < ovs.length; i++) if (ovs[i] && ovs[i].id === vid) return ovs[i];
  } catch (e) {}
  return null;
}
function event(day, kind, village, outcome, extra) {
  var e = { day: day, kind: kind, village: village || null, outcome: outcome || null };
  if (extra) { for (var k in extra) { if (k !== 'day' && k !== 'kind' && k !== 'village' && k !== 'outcome') e[k] = extra[k]; } }
  STATS.events.push(e);
  if (STATS.events.length > 400) STATS.events.splice(0, STATS.events.length - 400);
}

// The raise answer, in conversation. Up to 5 turns: each turn the scholar
// picks link:accept when it is offered; otherwise holds a real conversation
// to reach the answer — answers the villager's question first, continues
// the villager's story, or once navigates to the subject menu. Never picks
// link:decline (a decline is the player's call), never mimes, never
// deflects, never walks out mid-answer. endConvo('left') always runs.
// Returns 'accepted' | 'counter' | 'not-offered' | 'talk-failed' | 'error'.
// 'accepted' means the link:accept turn was taken and a link now exists
// with the raised village; 'counter' means the accept staged a counter
// (played next day by step 1).
function answerRaiseInConversation(Game, ctx, vid, villageId) {
  var outcome = 'not-offered';
  var turns = 0, answered = 0;
  try {
    if (typeof Game.talkTo !== 'function') { outcome = 'error'; return outcome; }
    var opened = null;
    try { opened = Game.talkTo(vid); } catch (e) { outcome = 'error'; return outcome; }
    if (opened == null) { /* talkTo returns the opening line or null; a null
      open with no convo record means the talk did not happen */ }
    var convo = null;
    try { convo = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
    if (!convo || !convo.active) { outcome = 'talk-failed'; return outcome; }
    var navigated = false;
    try {
      for (var turn = 0; turn < 5; turn++) {
        var c = null;
        try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        var pick = chooseConversationChoice(Game, vid, function (choices) {
          var list = choices || [];
          var acc = list.find(function (ch) { return ch && ch.id === 'link:accept'; });
          if (acc) return acc;
          // Never decline on the scholar's behalf.
          var ans = list.find(function (ch) { return ch && /^(ans:|react:|gq:)/.test(ch.id) && !/honest_pass$/.test(ch.id); })
            || list.find(function (ch) { return ch && /^(ans:|react:|gq:)/.test(ch.id); });
          if (ans) return ans;
          var goon = list.find(function (ch) { return ch && ch.id === 'goon'; });
          if (goon) return goon;
          if (!navigated) {
            var subj = list.find(function (ch) { return ch && ch.id === 'dlg:subject'; });
            if (subj) return subj;
          }
          return null;
        }, ctx);
        if (!pick) break;
        turns += 1;
        if (pick.id === 'dlg:subject') navigated = true;
        var wasAccept = (pick.id === 'link:accept');
        var wasAnswer = /^(ans:|react:|gq:)/.test(pick.id);
        var res = null;
        try { res = Game.convoTurn(vid, pick.id); } catch (e) { outcome = 'error'; break; }
        if (wasAnswer) answered += 1;
        if (wasAccept) {
          // Read the outcome from live state: link formed, counter staged,
          // or neither (declined/shut — should not happen at det ≥ 55).
          try {
            if (typeof Game.linkWith === 'function' && Game.linkWith(villageId)) outcome = 'accepted';
            else if (Game.state && Game.state.pendingCounter) outcome = 'counter';
            else outcome = 'error';
          } catch (e) { outcome = 'error'; }
          break;
        }
        if (res && res.ended) break;
      }
    } finally {
      try { if (Game.endConvo) Game.endConvo(vid, 'left'); } catch (e) {}
    }
  } catch (e) { outcome = 'error'; }
  STATS.raiseTurns += turns;
  STATS.raiseAnsweredTurns += answered;
  return outcome;
}

function linkDrive(Game, ctx) {
  try {
    if (Game.over) return;
    var day = dayOf(Game);
    var st = Game.state || {};
    if (st.pendingNational) STATS.nationalPendingDays += 1;
    if (st.pendingGlobal) STATS.globalPendingDays += 1;

    // 1. Answer a pending counter — their terms, the link forms.
    try {
      if (st.pendingCounter && typeof Game.answerCounter === 'function') {
        var ctr = st.pendingCounter;
        try { Game.answerCounter('accept'); } catch (e) {}
        STATS.counterAnswers += 1;
        event(day, 'counter-answer', ctr.targetId || null, 'accept', {});
      }
    } catch (e) { STATS.errors += 1; }

    // 2. Answer a pending first accord — the gift.
    try {
      if (st.pendingAccord && typeof Game.answerAccord === 'function') {
        var acc = st.pendingAccord;
        try { Game.answerAccord('gift'); } catch (e) {}
        STATS.accordAnswers += 1;
        event(day, 'accord-answer', null, 'gift', { linkId: acc.linkId || null });
      }
    } catch (e) { STATS.errors += 1; }

    // 3. Answer pending link raises, in conversation — at most one a day.
    // (A second accept the same day would hit the counter block: the first
    // accept's counter, if any, must be answered first.)
    try {
      var raises = [];
      try {
        var lr = ((st.village || {}).linkRaises) || {};
        Object.keys(lr).forEach(function (vid) {
          if (lr[vid]) raises.push({ vid: vid, villageId: lr[vid].villageId || null, day: (lr[vid].day == null) ? null : (lr[vid].day | 0) });
        });
      } catch (e) {}
      raises.sort(function (a, b) { return (a.day || 0) - (b.day || 0); });
      STATS.raisesSeen += raises.length;
      var answeredOne = false;
      for (var ri = 0; ri < raises.length; ri++) {
        if (answeredOne) break;
        if (Game.over) break;
        var r = raises[ri];
        // The raiser must be a living roster villager the scholar can talk to.
        var raiserOk = false;
        try {
          var roster = ((st.village || {}).roster) || [];
          if (roster.indexOf(r.vid) !== -1) {
            var p = (typeof Game.getPerson === 'function') ? Game.getPerson(r.vid) : null;
            raiserOk = !p || !p.dead;
          }
        } catch (e) {}
        if (!raiserOk) { STATS.raisesSkippedNoRaiser += 1; event(day, 'raise-skip', r.villageId, 'no-raiser', { vid: r.vid }); continue; }
        var ov = otherVillage(Game, r.villageId);
        if (!ov) { STATS.raisesSkippedNoVillage += 1; event(day, 'raise-skip', r.villageId, 'no-village', { vid: r.vid }); continue; }
        // Already linked (formed through another path) — nothing to answer.
        try { if (typeof Game.linkWith === 'function' && Game.linkWith(r.villageId)) { STATS.raisesSkippedNotReady += 1; event(day, 'raise-skip', r.villageId, 'already-linked', { vid: r.vid }); continue; } } catch (e) {}
        var dj = detJudge(Game, ov);
        if (!dj || dj.sub < COURT_READY) {
          STATS.raisesSkippedNotReady += 1;
          event(day, 'raise-skip', r.villageId, 'not-ready', { vid: r.vid, detSub: dj ? dj.sub : null });
          continue;
        }
        var out = 'error';
        try { out = answerRaiseInConversation(Game, ctx, r.vid, r.villageId); } catch (e) { out = 'error'; }
        if (out === 'accepted') {
          STATS.raisesAnswered += 1; STATS.raisesLinked += 1; answeredOne = true;
          event(day, 'raise-answer', r.villageId, 'linked', { vid: r.vid, detSub: dj.sub });
        } else if (out === 'counter') {
          STATS.raisesAnswered += 1; STATS.raisesCountered += 1; answeredOne = true;
          event(day, 'raise-answer', r.villageId, 'counter', { vid: r.vid, detSub: dj.sub });
        } else if (out === 'not-offered') {
          STATS.raisesNotOffered += 1;
          event(day, 'raise-answer', r.villageId, 'not-offered', { vid: r.vid, detSub: dj.sub });
        } else if (out === 'talk-failed') {
          STATS.raisesTalkFailed += 1;
          event(day, 'raise-answer', r.villageId, 'talk-failed', { vid: r.vid, detSub: dj.sub });
        } else {
          STATS.errors += 1;
          event(day, 'raise-answer', r.villageId, 'error', { vid: r.vid, detSub: dj.sub });
        }
      }
    } catch (e) { STATS.errors += 1; }

    // 4. Propose directly, as-subordinate first — once per day.
    try {
      if (Game.over) return;
      st = Game.state || {};
      var blocked = null;
      if (st.pendingCounter || st.pendingAccord || st.pendingNational) blocked = 'pending';
      else if (pantryKcal(Game) <= PROPOSE_PANTRY) blocked = 'pantry';
      else if (activeLinks(Game).length >= LINK_CAP) blocked = 'cap';
      if (blocked === 'pending') STATS.proposeBlockedPending += 1;
      else if (blocked === 'pantry') STATS.proposeBlockedPantry += 1;
      else if (blocked === 'cap') STATS.proposeBlockedCap += 1;
      if (!blocked) {
        var cool = (ctx && ctx._ldDeclined) || {};
        var best = null, bestScore = null, bestOv = null;
        var readyCount = 0;
        try {
          var ovs = (st.otherVillages || []);
          for (var i = 0; i < ovs.length; i++) {
            var v = ovs[i];
            if (!v || !v.id || v.id === 'haven') continue;
            var known = false;
            try { known = (typeof Game.knowsVillage === 'function') ? !!Game.knowsVillage(v) : false; } catch (e) {}
            if (!known) continue;
            try { if (typeof Game.linkWith === 'function' && Game.linkWith(v.id)) continue; } catch (e) {}
            var d = detJudge(Game, v);
            if (!d) continue;
            if (d.sub < COURT_READY) continue;
            readyCount += 1;
            if ((cool[v.id] || 0) + REASK_DAYS > day) continue;
            if (bestScore == null || d.sub > bestScore || (d.sub === bestScore && v.id < best)) {
              best = v.id; bestScore = d.sub; bestOv = v;
            }
          }
        } catch (e) { STATS.errors += 1; }
        if (!best) {
          if (readyCount === 0) STATS.proposeNotReady += 1;
          else STATS.proposeNoCandidate += 1;
        } else {
          STATS.proposeCalls += 1;
          var res = null;
          try { res = Game.proposeLink(best, { asSubordinate: true, tributeKcalPerWeek: PROPOSE_TRIBUTE }); } catch (e) { res = null; STATS.errors += 1; }
          var oc = 'declined';
          try {
            if (res && typeof res === 'object' && res.id) oc = 'accepted';
            else if (res === 'counter') oc = 'counter';
            else if (bestOv && ((bestOv.opinion | 0) <= -20)) oc = 'shut';
            else oc = 'declined';
          } catch (e) {}
          if (oc === 'accepted') STATS.proposeAccepted += 1;
          else if (oc === 'counter') STATS.proposeCounter += 1;
          else if (oc === 'shut') STATS.proposeShut += 1;
          else {
            STATS.proposeDeclined += 1;
            if (ctx) { ctx._ldDeclined = ctx._ldDeclined || {}; ctx._ldDeclined[best] = day; }
          }
          event(day, 'propose', best, oc, { detSub: bestScore, offer: 'sub' });
        }
      }
    } catch (e) { STATS.errors += 1; }

    // 5. Tend LEAD links below the seasoned bar — weekly, pantry-gated.
    try {
      if (!Game.over) {
        var week = weekOf(Game);
        var links = activeLinks(Game);
        for (var li = 0; li < links.length; li++) {
          var link = links[li];
          if (!link || link.primary !== 'haven') continue;
          if (isSeasoned(link, day)) continue;
          if (link.tendedWeek === week) continue;
          if (pantryKcal(Game) <= TEND_PANTRY) { STATS.tendsBlockedPantry += 1; continue; }
          var trustBefore = (link.trust | 0);
          var paid = 0;
          try { paid = (typeof Game.tendLink === 'function') ? (Game.tendLink(link.id) || 0) : 0; } catch (e) { STATS.errors += 1; continue; }
          if (paid > 0) {
            STATS.tends += 1; STATS.tendsPaidKcal += paid;
            event(day, 'tend', link.subordinate || null, 'lead-below-bar', { linkId: link.id, paid: paid, trustBefore: trustBefore, age: day - (link.day | 0) });
          }
        }
      }
    } catch (e) { STATS.errors += 1; }

    // 6. Hold BELONG links: pay tribute in full, honor demands.
    try {
      if (!Game.over) {
        var week2 = weekOf(Game);
        var links2 = activeLinks(Game);
        for (var bi = 0; bi < links2.length; bi++) {
          var bl = links2[bi];
          if (!bl || bl.subordinate !== 'haven') continue;
          var owed = (bl.tributeKcalPerWeek | 0) || 0;
          if (((bl.tributePaidWeek == null) ? -1 : (bl.tributePaidWeek | 0)) !== week2) {
            if (pantryKcal(Game) >= owed && owed > 0) {
              var paid2 = 0;
              try { paid2 = (typeof Game.payTribute === 'function') ? (Game.payTribute(bl.id) || 0) : 0; } catch (e) { STATS.errors += 1; }
              if (paid2 > 0) {
                STATS.tributePays += 1; STATS.tributePaidKcal += paid2;
                event(day, 'tribute-pay', bl.primary || null, 'full', { linkId: bl.id, paid: paid2, owed: owed });
              }
            } else {
              STATS.tributeBlockedPantry += 1;
              event(day, 'tribute-pay', bl.primary || null, 'blocked-pantry', { linkId: bl.id, owed: owed, pantry: pantryKcal(Game) });
            }
          }
          if (bl.pendingDemand && typeof Game.answerDemand === 'function') {
            var kind = bl.pendingDemand.kind || '?';
            try { Game.answerDemand(bl.id, true); } catch (e) { STATS.errors += 1; }
            STATS.demandAnswers += 1;
            STATS.demandKinds[kind] = (STATS.demandKinds[kind] || 0) + 1;
            event(day, 'demand-answer', bl.primary || null, 'honor', { linkId: bl.id, kind: kind });
          }
        }
      }
    } catch (e) { STATS.errors += 1; }
  } catch (e) { STATS.errors += 1; }
}

const linkdrivePolicy = Object.assign({}, STAGED.stagedPolicy, {
  id: 'competent-linkdrive-b',
  desc: 'competent + companion-staging + rally + link-forming drive: propose as-subordinate on courtship-ready villages, answer link raises in conversation, tend LEAD below-bar, hold BELONG with tribute/demands (policy-side probe only)',
  daily(Game, ctx) {
    try { STAGED.stagedPolicy.daily(Game, ctx); } catch (e) {}
    linkDrive(Game, ctx);
  },
});

module.exports = { linkdrivePolicy: linkdrivePolicy,
  resetLinkdriveStats: resetLinkdriveStats, linkdriveStats: linkdriveStats,
  linkDrive: linkDrive, detJudge: detJudge, isSeasoned: isSeasoned,
  answerRaiseInConversation: answerRaiseInConversation,
  PROPOSE_PANTRY: PROPOSE_PANTRY, TEND_PANTRY: TEND_PANTRY,
  LINK_CAP: LINK_CAP, REASK_DAYS: REASK_DAYS, COURT_READY: COURT_READY,
  PROPOSE_TRIBUTE: PROPOSE_TRIBUTE };
